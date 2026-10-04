/**
 * Verifies the 5 framework templates against the same toolchain the app uses:
 * esbuild with jsx:'automatic' for react / jsx:'transform' for vue, plus
 * @vue/compiler-sfc for .vue files. Bare framework imports stay external, which
 * mirrors the app shimming them onto the preview iframe's globals.
 */
import { build } from 'esbuild';
import { parse, compileScript, compileTemplate, compileStyle } from '@vue/compiler-sfc';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { readdirSync, statSync } from 'node:fs';

const DIR = join(process.cwd(), 'src/services/templates');
const walk = (d) =>
  readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.ts') ? [p] : [];
  });

const vueShim = {
  name: 'vue-sfc',
  setup(build) {
    build.onLoad({ filter: /\.vue$/ }, async (args) => {
      const src = await require('node:fs').promises.readFile(args.path, 'utf8');
      const { descriptor, errors } = parse(src, { filename: args.path });
      if (errors.length) return { errors: errors.map((e) => ({ text: String(e.message || e) })) };
      const id = 'sfc-' + Math.abs(hash(args.path));
      let js = '';
      if (descriptor.script || descriptor.scriptSetup) {
        const compiled = compileScript(descriptor, { id, inlineTemplate: false });
        js = compiled.content;
      }
      const out = [js];
      if (descriptor.template) {
        const t = compileTemplate({
          source: descriptor.template.content,
          filename: args.path,
          id,
          compilerOptions: { scopeId: 'data-v-' + id },
        });
        if (t.errors.length) return { errors: t.errors.map((e) => ({ text: String(e.message || e) })) };
        out.push(t.code);
      }
      let css = '';
      for (const s of descriptor.styles) {
        const c = compileStyle({ source: s.content, filename: args.path, id: 'data-v-' + id, scoped: s.scoped });
        if (c.errors.length) return { errors: c.errors.map((e) => ({ text: String(e.message || e) })) };
        css += c.code + '\n';
      }
      if (css) out.push('const __css = ' + JSON.stringify(css) + ';');
      return { contents: out.join('\n'), loader: 'js', resolveDir: args.path.split('\\').slice(0, -1).join('\\') };
    });
  },
};
function hash(s) { let h = 0; for (const c of s) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0; return h; }

let failed = 0;

for (const file of walk(DIR).sort()) {
  const mod = await import(pathToFileURL(file).href);
  const t = mod.default ?? mod;
  if (!t.files) continue;
  const name = file.replace(DIR + '\\', '').replace(/\\/g, '/');
  const isVue = t.files.some((f) => f.path.endsWith('.vue'));
  const entry = isVue ? 'main.js' : 'main.jsx';

  const problems = [];
  let bytes = 0;

  // 1. Every non-vue file must parse standalone.
  for (const f of t.files) {
    bytes += f.content.length;
    if (f.path.endsWith('.vue')) continue;
    const loader = f.path.endsWith('.jsx') ? 'jsx' : f.path.endsWith('.tsx') ? 'tsx'
      : f.path.endsWith('.ts') ? 'ts' : f.path.endsWith('.json') ? 'json'
      : f.path.endsWith('.css') ? 'css' : 'js';
    try {
      // The app maps by extension: .js -> esbuild 'js' loader, which does NOT
      // enable JSX. A .js file containing JSX would fail to parse at runtime, so
      // check .js with the plain js loader on purpose.
      await build({
        stdin: { contents: f.content, loader, resolveDir: f.path.split('\\').slice(0, -1).join('\\') || '.' },
        bundle: false, write: false, logLevel: 'silent',
        ...(loader === 'jsx' ? { jsx: 'automatic' } : {}),
      });
      if (loader === 'json') JSON.parse(f.content);
    } catch (e) {
      problems.push('parse failed ' + f.path + ': ' + (e.errors?.[0]?.text || e.message).slice(0, 130));
    }
  }

  // 2. Every .vue SFC must compile.
  for (const f of t.files.filter((x) => x.path.endsWith('.vue'))) {
    try {
      const { descriptor, errors } = parse(f.content, { filename: f.path });
      if (errors.length) { problems.push('sfc parse ' + f.path + ': ' + errors[0].message); continue; }
      const id = 'x';
      if (descriptor.scriptSetup) compileScript(descriptor, { id });
      if (descriptor.template) {
        const r = compileTemplate({ source: descriptor.template.content, filename: f.path, id });
        if (r.errors.length) problems.push('sfc template ' + f.path + ': ' + r.errors[0].message);
      }
    } catch (e) { problems.push('sfc threw ' + f.path + ': ' + e.message.slice(0, 120)); }
  }

  // 3. CSS must parse and be brace-balanced.
  for (const f of t.files.filter((x) => x.path.endsWith('.css'))) {
    let d = 0;
    for (const ch of f.content) { if (ch === '{') d++; else if (ch === '}') d--; }
    if (d !== 0) problems.push('unbalanced CSS braces in ' + f.path + ': ' + d);
  }

  // 4. The entry must exist and import the framework.
  const entryFile = t.files.find((f) => f.path === entry);
  if (!entryFile) problems.push('missing entry ' + entry);
  else {
    if (!isVue && !/react-dom\/client/.test(entryFile.content)) problems.push('react entry does not use react-dom/client');
    if (isVue && !/from ['"]vue['"]/.test(entryFile.content)) problems.push('vue entry does not import vue');
    if (!/getElementById\(['"](root|app)['"]\)/.test(entryFile.content)) problems.push('entry does not mount into #root/#app');
  }

  // 5. No emoji, no external network calls, no <img>.
  const all = t.files.map((f) => f.content).join('\n');
  if (/[\u{1F300}-\u{1FAFF}\u{2700}-\u{27BF}]/u.test(all)) problems.push('emoji found');
  if (/\bfetch\s*\(/.test(all)) problems.push('fetch() call');
  if (/<img[^>]+src=["']https?:/i.test(all)) problems.push('external <img>');

  const status = problems.length ? 'FAIL' : ' ok ';
  if (problems.length) failed++;
  console.log('[' + status + '] ' + name.padEnd(24) + (isVue ? 'vue  ' : 'react') + ' ' +
    String(t.files.length).padStart(3) + ' files  ' + bytes.toLocaleString('en-US').padStart(8) + ' bytes');
  problems.forEach((p) => console.log('         -> ' + p));
}

console.log('\n' + (failed === 0 ? 'ALL 5 FRAMEWORK TEMPLATES VALID' : failed + ' FAILURE(S)'));
process.exit(failed === 0 ? 0 : 1);