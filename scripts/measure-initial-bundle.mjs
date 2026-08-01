#!/usr/bin/env node
/**
 * Measures the JavaScript actually fetched for first paint.
 *
 * Chunk *count* and total dist size say nothing about the critical path: what
 * matters is the entry module plus everything Vite emits a `modulepreload` for,
 * because those are static imports the browser must download before the app can
 * render. A "lazy" component grouped by `manualChunks` into a chunk that is also
 * statically reachable is not lazy at all, and only this view reveals it.
 *
 * Usage:
 *   node scripts/measure-initial-bundle.mjs [--json] [--baseline path]
 */
import { readFileSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = 'dist';
const INDEX = join(DIST, 'index.html');

if (!existsSync(INDEX)) {
  console.error(`No ${INDEX}. Run \`npm run build\` first.`);
  process.exit(1);
}

const html = readFileSync(INDEX, 'utf8');

/** Entry scripts and preloaded modules: everything on the critical path. */
const collect = (pattern) => {
  const found = [];
  for (const match of html.matchAll(pattern)) found.push(match[1]);
  return found;
};

const entries = collect(/<script[^>]+type="module"[^>]+src="([^"]+)"/g);
const preloads = collect(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g);
const styles = collect(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g);

const measure = (urls) =>
  urls.map((url) => {
    const path = join(DIST, url.replace(/^\//, ''));
    if (!existsSync(path)) return { file: basename(url), bytes: 0, gzip: 0, missing: true };
    const buffer = readFileSync(path);
    return {
      file: basename(url),
      bytes: statSync(path).size,
      gzip: gzipSync(buffer).length,
    };
  });

const criticalJs = measure([...entries, ...preloads]);
const criticalCss = measure(styles);

const sum = (rows, key) => rows.reduce((total, row) => total + row[key], 0);
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

const report = {
  criticalJsBytes: sum(criticalJs, 'bytes'),
  criticalJsGzip: sum(criticalJs, 'gzip'),
  criticalCssBytes: sum(criticalCss, 'bytes'),
  criticalCssGzip: sum(criticalCss, 'gzip'),
  chunkCount: criticalJs.length,
  chunks: criticalJs.sort((a, b) => b.bytes - a.bytes),
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('\nInitial JS payload (entry + modulepreload)\n');
  for (const chunk of report.chunks) {
    console.log(
      `  ${chunk.file.padEnd(42)} ${kb(chunk.bytes).padStart(10)}  gzip ${kb(chunk.gzip).padStart(9)}`,
    );
  }
  console.log(
    `\n  ${'TOTAL JS'.padEnd(42)} ${kb(report.criticalJsBytes).padStart(10)}  gzip ${kb(
      report.criticalJsGzip,
    ).padStart(9)}`,
  );
  console.log(
    `  ${'TOTAL CSS'.padEnd(42)} ${kb(report.criticalCssBytes).padStart(10)}  gzip ${kb(
      report.criticalCssGzip,
    ).padStart(9)}`,
  );

  const baselineFlag = process.argv.indexOf('--baseline');
  if (baselineFlag !== -1 && existsSync(process.argv[baselineFlag + 1])) {
    const baseline = JSON.parse(readFileSync(process.argv[baselineFlag + 1], 'utf8'));
    const drop = (before, after) => (((before - after) / before) * 100).toFixed(1);
    console.log(
      `\n  vs baseline: raw ${kb(baseline.criticalJsBytes)} -> ${kb(report.criticalJsBytes)} ` +
        `(-${drop(baseline.criticalJsBytes, report.criticalJsBytes)}%), ` +
        `gzip ${kb(baseline.criticalJsGzip)} -> ${kb(report.criticalJsGzip)} ` +
        `(-${drop(baseline.criticalJsGzip, report.criticalJsGzip)}%)`,
    );
  }
  console.log('');
}

const saveFlag = process.argv.indexOf('--save');
if (saveFlag !== -1 && process.argv[saveFlag + 1]) {
  writeFileSync(process.argv[saveFlag + 1], JSON.stringify(report, null, 2));
}

/*
 * `--assert-absent` fails the build if a marker string appears anywhere in the
 * critical path. This is the guard that keeps heavy features from silently
 * creeping back in: a `manualChunks` tweak or a stray top-level import is
 * otherwise invisible until someone thinks to look at a bundle report.
 */
if (process.argv.includes('--assert-absent')) {
  const MARKERS = [
    // [human name, string that only appears if the module was bundled]
    ['JSZip', 'JSZip'],
    ['xterm terminal', 'xterm'],
    ['project detection', 'requiresAdvancedMode'],
    ['import engine', 'ImportTooLargeError'],
    ['prettier formatter', 'prettier/standalone'],
    ['esbuild-wasm', 'esbuild-wasm'],
    ['TypeScript compiler', 'createSourceFile'],
    // Full-stack feature: VS Code mode, sandbox client, E2B proxy calls.
    ['E2B sandbox client', 'gbcoder_e2b_key'],
    ['sandbox proxy calls', '/api/sandbox/'],
    ['VS Code editor mode', 'Connect Sandbox to Preview'],
  ];

  const criticalSource = [...entries, ...preloads]
    .map((url) => join(DIST, url.replace(/^\//, '')))
    .filter((path) => existsSync(path))
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');

  const leaked = MARKERS.filter(([, marker]) => criticalSource.includes(marker));

  if (leaked.length > 0) {
    console.error('\nFAIL: these must not be in the initial payload:');
    for (const [name, marker] of leaked) console.error(`  - ${name} (matched "${marker}")`);
    console.error('');
    process.exit(1);
  }

  console.log(`Verified absent from the critical path: ${MARKERS.map(([n]) => n).join(', ')}\n`);
}
