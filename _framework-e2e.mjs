/**
 * End-to-end: bundle each framework template with esbuild (relative imports
 * resolved from the real file list), then execute it in Chromium against React
 * and Vue loaded from a CDN import map — the same shape the preview iframe uses.
 */
import { build } from 'esbuild';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { readdirSync, statSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';

const DIR = join(process.cwd(), 'src/services/templates');
const OUT = join(process.cwd(), '_fwbuild');

const walk = (d) =>
  readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.ts') ? [p] : [];
  });

const vuePlugin = {
  name: 'vue',
  setup(b) {
    b.onLoad({ filter: /\.vue$/ }, async (args) => {
      const fs = await import('node:fs');
      const src = fs.readFileSync(args.path, 'utf8');
      const { descriptor, errors } = parse(src, { filename: args.path });
      if (errors.length) return { errors: errors.map((e) => ({ text: String(e.message) })) };
      const id = 'v' + Math.abs(args.path.length * 31 + args.path.charCodeAt(3));
      let js = descriptor.script || descriptor.scriptSetup ? compileScript(descriptor, { id }).content : '';
      if (descriptor.template) {
        const t = compileTemplate({ source: descriptor.template.content, filename: args.path, id });
        if (t.errors.length) return { errors: t.errors.map((e) => ({ text: String(e.message) })) };
        js += '\n' + t.code;
      }
      return { contents: js, loader: 'js', resolveDir: args.path.split('\\').slice(0, -1).join('\\') };
    });
  },
};

const { chromium } = await import('playwright');
const browser = await chromium.launch();
let failed = 0;

for (const file of walk(DIR).sort()) {
  const mod = await import(pathToFileURL(file).href);
  const t = mod.default ?? mod;
  if (!t.files) continue;

  const name = file.replace(DIR + '\\', '').replace(/\\/g, '/').replace(/\.ts$/, '');
  const slug = name.replace(/\//g, '-');
  const root = join(OUT, slug);
  rmSync(root, { recursive: true, force: true });
  for (const f of t.files) {
    const dest = join(root, f.path);
    mkdirSync(join(dest, '..'), { recursive: true });
    writeFileSync(dest, f.content, 'utf8');
  }

  const isVue = t.files.some((f) => f.path.endsWith('.vue'));
  const entry = isVue ? 'main.js' : 'main.jsx';
  const problems = [];

  // Import resolution checked against the real filesystem, so a `..` that walks
  // past the project root cannot silently collapse and hide a bad specifier.
  const { existsSync } = await import('node:fs');
  for (const f of t.files) {
    if (!/\.(jsx|js|ts|tsx|vue)$/.test(f.path)) continue;
    for (const m of f.content.matchAll(/(?:from|import)\s*['"](\.[^'"]+)['"]/g)) {
      const base = join(root, f.path, '..', m[1]);
      const cands = [base, base + '.jsx', base + '.js', base + '.vue', base + '/index.jsx'];
      if (!cands.some(existsSync)) problems.push('unresolved import "' + m[1] + '" in ' + f.path);
    }
  }

  let bundle;
  try {
    const r = await build({
      entryPoints: [join(root, entry)],
      bundle: true,
      write: false,
      outdir: join(root, '_out'),
      format: 'esm',
      target: 'es2020',
      jsx: 'automatic',
      external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'vue'],
      plugins: isVue ? [vuePlugin] : [],
      logLevel: 'silent',
      loader: { '.js': 'jsx' },
    });
    bundle = r.outputFiles.find((f) => f.path.endsWith('.js'))?.text ?? r.outputFiles[0].text;
  } catch (e) {
    problems.push('BUNDLE FAILED: ' + (e.errors?.[0]?.text || e.message).slice(0, 200));
  }

  if (bundle) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errs = [];
    page.on('pageerror', (e) => errs.push('pageerror: ' + e.message.slice(0, 160)));
    page.on('console', (m) => { if (m.type() === 'error') errs.push('console.error: ' + m.text().slice(0, 160)); });

    const imports = isVue
      ? `<script type="importmap">{"imports":{"vue":"https://esm.sh/vue@3.5.13"}}</script>`
      : `<script type="importmap">{"imports":{"react":"https://esm.sh/react@18.3.1","react-dom":"https://esm.sh/react-dom@18.3.1","react-dom/client":"https://esm.sh/react-dom@18.3.1/client","react/jsx-runtime":"https://esm.sh/react@18.3.1/jsx-runtime"}}</script>`;
    const mount = isVue ? 'app' : 'root';

    await page.setContent(
      `<!DOCTYPE html><html><head><meta charset="utf-8">${imports}` +
      `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap">` +
      `</head><body><div id="${mount}"></div>` +
      `<script type="module">${bundle.replace(/<\/script/gi, '<\\/script')}</script></body></html>`,
      { waitUntil: 'networkidle' },
    );
    await page.waitForTimeout(2200);

    const out = await page.evaluate(() => {
      const m = document.getElementById('app') || document.getElementById('root');
      return {
        nodes: m ? m.querySelectorAll('*').length : 0,
        text: (document.body.innerText || '').trim().length,
        buttons: document.querySelectorAll('button').length,
        svgs: document.querySelectorAll('svg').length,
      };
    });
    await page.close();

    if (errs.length) problems.push(...errs.slice(0, 3));
    if (out.nodes < 15) problems.push('only ' + out.nodes + ' DOM nodes mounted');
    if (out.text < 120) problems.push('only ' + out.text + ' chars rendered');
    console.log('[' + (problems.length ? 'FAIL' : ' ok ') + '] ' + name.padEnd(22) +
      (isVue ? 'vue  ' : 'react') + ' bundle=' + String(Math.round(bundle.length / 1024)).padStart(4) + 'kB' +
      ' nodes=' + String(out.nodes).padStart(4) + ' text=' + String(out.text).padStart(5) +
      ' btn=' + String(out.buttons).padStart(3) + ' svg=' + String(out.svgs).padStart(3));
    problems.forEach((p) => console.log('         -> ' + p));
    if (problems.length) failed++;
  } else {
    console.log('[FAIL] ' + name.padEnd(22) + ' bundle error');
    problems.forEach((p) => console.log('         -> ' + p));
    failed++;
  }
}

await browser.close();
rmSync(OUT, { recursive: true, force: true });
console.log('\n' + (failed === 0 ? 'ALL 5 FRAMEWORK TEMPLATES BUNDLE AND RUN' : failed + ' FAILURE(S)'));
process.exit(failed === 0 ? 0 : 1);