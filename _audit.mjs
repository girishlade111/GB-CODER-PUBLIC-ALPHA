import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const DIR = join(ROOT, 'src/services/templates');

const walk = (d) =>
  readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.ts') ? [p] : [];
  });

const files = walk(DIR).sort();
let failures = 0;
const fail = (file, msg) => { failures++; console.log('  FAIL ' + file.replace(ROOT + '\\', '') + ' :: ' + msg); };

const rows = [];

for (const file of files) {
  const mod = await import(pathToFileURL(file).href);
  const t = (mod.default ?? mod);
  const name = file.replace(DIR + '\\', '').replace(/\\/g, '/');
  const problems = [];

  if (t.files) {
    // Framework template.
    const paths = t.files.map((f) => f.path);
    if (new Set(paths).size !== paths.length) problems.push('duplicate file paths');
    for (const f of t.files) {
      if (!f.path || typeof f.content !== 'string') { problems.push('file missing path/content: ' + f.path); continue; }
      // Next.js dynamic segments use [slug]. validateFilePath only guards the
      // interactive create/rename UI, never template payloads, and the bundler
      // treats the path as an opaque string — so this is a deliberate exception.
      const dynamicSegment = /\[(?:\.\.\.)?[a-zA-Z][\w-]*\]/g;
      const pathSansSegments = f.path.replace(dynamicSegment, 'SEG');
      if (!/^[a-zA-Z0-9._\-/]+$/.test(pathSansSegments)) problems.push('illegal path chars: ' + f.path);
      if (f.path.includes(' ')) problems.push('space in path: ' + f.path);
    }
    const isVue = paths.some((p) => p.endsWith('.vue'));
    const entry = isVue ? 'main.js' : 'main.jsx';
    if (!paths.includes(entry)) problems.push('missing entry ' + entry);
    // Relative imports must resolve to a real file.
    const resolveSpec = (fromPath, spec) => {
      const segs = (fromPath.includes('/') ? fromPath.slice(0, fromPath.lastIndexOf('/')) : '').split('/').filter(Boolean);
      for (const part of spec.split('/')) {
        if (part === '.' || part === '') continue;
        if (part === '..') { segs.pop(); continue; }
        segs.push(part);
      }
      const base = segs.join('/');
      return [base, base + '.jsx', base + '.tsx', base + '.js', base + '.ts', base + '.vue', base + '/index.jsx', base + '/index.js'];
    };
    for (const f of t.files) {
      if (!/\.(jsx|tsx|js|ts|vue)$/.test(f.path)) continue;
      const re = /(?:from|import)\s*['"](\.[^'"]+)['"]/g;
      let m;
      while ((m = re.exec(f.content))) {
        const spec = m[1];
        if (!resolveSpec(f.path, spec).some((c) => paths.includes(c))) {
          problems.push('unresolved import "' + spec + '" in ' + f.path);
        }
      }
    }
    rows.push([name, 'framework', t.files.length + ' files', t.files.reduce((a, f) => a + (typeof f.content === 'string' ? f.content.length : 0), 0), problems]);
  } else {
    // Plain template.
    const { html = '', css = '', javascript = '' } = t;
    if (/<!DOCTYPE/i.test(html)) problems.push('html contains <!DOCTYPE>');
    if (/<html[\s>]/i.test(html)) problems.push('html contains <html>');
    if (/<body[\s>]/i.test(html)) problems.push('html contains <body>');
    if (/<head[\s>]/i.test(html)) problems.push('html contains <head>');
    if (/<style[\s>]/i.test(html)) problems.push('html contains <style>');
    if (/<script[\s>]/i.test(html)) problems.push('html contains <script>');
    if (!/body\s*\{[^}]*margin:\s*0/.test(css)) problems.push('no body margin:0 reset');
    if (/scroll-behavior\s*:/.test(css)) problems.push('scroll-behavior in CSS (stripped by sanitiser)');
    if (/expression\s*\(/i.test(css)) problems.push('expression() in CSS');
    if (/-moz-binding/i.test(css)) problems.push('-moz-binding in CSS');
    if (/[\s;{]behavior\s*:/i.test(css)) problems.push('behavior: in CSS (stripped by sanitiser)');
    if (/<\/script/i.test(javascript)) problems.push('literal </script in javascript');
    if (/\bfetch\s*\(/.test(javascript)) problems.push('network fetch() call');
    if (/<img[^>]+src=/i.test(html)) problems.push('external <img src>');
    if (/(?:src|href)\s*=\s*["']https?:\/\//i.test(html.replace(/<use[^>]*>/g, ''))) {
      const bad = html.match(/(?:src|href)\s*=\s*["'](https?:\/\/[^"']+)/gi) || [];
      const filtered = bad.filter((b) => !/^href="#/i.test(b));
      if (filtered.length) problems.push('external asset ref: ' + filtered[0].slice(0, 60));
    }
    if (!/prefers-reduced-motion/.test(css + javascript)) problems.push('no prefers-reduced-motion handling');
    if (!/IntersectionObserver/.test(javascript)) problems.push('no IntersectionObserver reveal');
    const keyframes = (css.match(/@keyframes/g) || []).length;
    if (keyframes < 3) problems.push('only ' + keyframes + ' @keyframes');
    const h1 = (html.match(/<h1[\s>]/gi) || []).length;
    if (h1 !== 1) problems.push('h1 count = ' + h1);
    const sections = (html.match(/<section[\s>]/gi) || []).length;
    if (sections < 4) problems.push('only ' + sections + ' <section>');
    if (/lorem ipsum/i.test(html + css + javascript)) problems.push('lorem ipsum');
    // aria-controls / href="#x" targets must resolve.
    const ids = new Set((html.match(/\sid="([^"]+)"/g) || []).map((s) => s.slice(5, -1)));
    for (const m of html.matchAll(/aria-controls="([^"]+)"/g)) {
      if (!ids.has(m[1])) problems.push('aria-controls -> missing #' + m[1]);
    }
    for (const m of html.matchAll(/href="#([^"]+)"/g)) {
      if (m[1] && !ids.has(m[1])) problems.push('href="#' + m[1] + '" -> no such id');
    }
    // CSS brace balance
    let depth = 0;
    for (const ch of css) { if (ch === '{') depth++; else if (ch === '}') depth--; if (depth < 0) break; }
    if (depth !== 0) problems.push('unbalanced CSS braces: ' + depth);
    // JS syntax
    try { new Function(javascript); } catch (e) { problems.push('JS syntax error: ' + e.message); }
    rows.push([name, 'plain', sections + ' sections, ' + keyframes + ' keyframes', html.length + css.length + javascript.length, problems]);
  }

  for (const p of problems) fail(file, p);
}

console.log('\n=== TEMPLATE PAYLOAD AUDIT ===\n');
console.log('file'.padEnd(30) + 'type'.padEnd(11) + 'shape'.padEnd(26) + 'bytes');
console.log('-'.repeat(84));
for (const [n, t, s, b] of rows) {
  console.log(n.padEnd(30) + t.padEnd(11) + String(s).padEnd(26) + b.toLocaleString('en-US'));
}
console.log('-'.repeat(84));
console.log(rows.length + ' templates | total payload ' + rows.reduce((a, r) => a + r[3], 0).toLocaleString('en-US') + ' bytes');
console.log(failures === 0 ? '\nALL CHECKS PASSED' : '\n' + failures + ' PROBLEM(S) FOUND');
process.exit(failures === 0 ? 0 : 1);