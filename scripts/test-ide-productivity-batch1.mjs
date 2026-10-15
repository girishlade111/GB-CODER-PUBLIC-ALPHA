import assert from 'node:assert/strict';
import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

console.log('======================================================================');
console.log('GB CODER — INTEGRATED IDE PRODUCTIVITY BATCH 1 TEST SUITE');
console.log('======================================================================');

const dir = await fs.mkdtemp(path.resolve('scripts/.tmp-batch1-'));
const entryFile = path.join(dir, 'entry.ts');
await fs.writeFile(
  entryFile,
  `export * from '${path.resolve('src/services/search/workspaceSearchService.ts').replace(/\\/g, '/')}';
export * from '${path.resolve('src/services/diagnostics/diagnosticsService.ts').replace(/\\/g, '/')}';
export * from '${path.resolve('src/services/logging/outputLogService.ts').replace(/\\/g, '/')}';`
);

const bundleOut = path.join(dir, 'batch1.mjs');

await build({
  entryPoints: [entryFile],
  bundle: true,
  format: 'esm',
  outfile: bundleOut,
});

const {
  searchWorkspaceFiles,
  compileSearchPattern,
  safeReplaceSingleMatch,
  safeReplaceInFile,
  isIgnoredPath,
  isBinaryOrUnsupportedFile,
  diagnosticsService,
  outputLogService,
} = await import(pathToFileURL(bundleOut));

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`PASS ${name}`);
  } catch (e) {
    failed++;
    console.error(`FAIL ${name}: ${e.message}`);
  }
}

// -----------------------------------------------------------------------------
// FEATURE GROUP A: SEARCH & SAFE REPLACE
// -----------------------------------------------------------------------------

await test('[Search 1] Filename and content matches', async () => {
  const files = [
    { path: 'src/App.tsx', content: 'export function App() {\n  return <div>Hello World</div>;\n}' },
    { path: 'src/components/Header.tsx', content: 'export const Header = () => <header>Banner</header>;' },
    { path: 'docs/Hello-guide.md', content: '# Documentation\nSee other files.' },
  ];

  const res = searchWorkspaceFiles(files, 'Hello', { caseSensitive: true, wholeWord: false, useRegex: false });
  assert.equal(res.totalMatches, 2, 'Should find 1 content match and 1 filename match');
  assert.equal(res.results.length, 2);
  assert.equal(res.results[0].path, 'src/App.tsx');
  assert.equal(res.results[0].matches[0].lineNumber, 2);
  assert.equal(res.results[0].matches[0].column, 15);
  assert.equal(res.results[1].path, 'docs/Hello-guide.md');
});

await test('[Search 2] Case-sensitive vs case-insensitive matching', async () => {
  const files = [
    { path: 'src/test.ts', content: 'const apple = 1;\nconst Apple = 2;\nconst APPLE = 3;' },
  ];

  const caseSensitiveRes = searchWorkspaceFiles(files, 'Apple', { caseSensitive: true, wholeWord: false, useRegex: false });
  assert.equal(caseSensitiveRes.totalMatches, 1);
  assert.equal(caseSensitiveRes.results[0].matches[0].lineNumber, 2);

  const caseInsensitiveRes = searchWorkspaceFiles(files, 'Apple', { caseSensitive: false, wholeWord: false, useRegex: false });
  assert.equal(caseInsensitiveRes.totalMatches, 3);
});

await test('[Search 3] Whole-word matching', async () => {
  const files = [
    { path: 'src/word.ts', content: 'const count = 1;\nconst counter = 2;\nconst recount = 3;' },
  ];

  const wholeWordRes = searchWorkspaceFiles(files, 'count', { caseSensitive: true, wholeWord: true, useRegex: false });
  assert.equal(wholeWordRes.totalMatches, 1);
  assert.equal(wholeWordRes.results[0].matches[0].lineNumber, 1);

  const partialRes = searchWorkspaceFiles(files, 'count', { caseSensitive: true, wholeWord: false, useRegex: false });
  assert.equal(partialRes.totalMatches, 3);
});

await test('[Search 4] Regex correctness and invalid-regex error reporting', async () => {
  const files = [
    { path: 'src/regex.ts', content: 'color: #ff0000;\ncolor: #00ff00;\ncolor: #0000ff;' },
  ];

  const validRegex = searchWorkspaceFiles(files, '#[0-9a-f]{6}', { caseSensitive: false, wholeWord: false, useRegex: true });
  assert.equal(validRegex.error, null);
  assert.equal(validRegex.totalMatches, 3);

  const invalidRegex = searchWorkspaceFiles(files, '[unclosed-range', { caseSensitive: false, wholeWord: false, useRegex: true });
  assert.notEqual(invalidRegex.error, null);
  assert.equal(invalidRegex.totalMatches, 0);
});

await test('[Search 5] Unicode text handling', async () => {
  const files = [
    { path: 'src/i18n.ts', content: 'const msg = "こんにちは世界";\nconst flag = "🚀 Launch ready";' },
  ];

  const unicodeRes = searchWorkspaceFiles(files, 'こんにちは', { caseSensitive: true, wholeWord: false, useRegex: false });
  assert.equal(unicodeRes.totalMatches, 1);
  assert.equal(unicodeRes.results[0].matches[0].matchText, 'こんにちは');

  const emojiRes = searchWorkspaceFiles(files, '🚀', { caseSensitive: true, wholeWord: false, useRegex: false });
  assert.equal(emojiRes.totalMatches, 1);
});

await test('[Search 6] Exclusion of node_modules, build artifacts, and binary files', async () => {
  assert(isIgnoredPath('node_modules/react/index.js'));
  assert(isIgnoredPath('dist/bundle.js'));
  assert(isIgnoredPath('.next/server.js'));
  assert(isIgnoredPath('.git/HEAD'));
  assert(!isIgnoredPath('src/components/Button.tsx'));

  assert(isBinaryOrUnsupportedFile('assets/logo.png'));
  assert(isBinaryOrUnsupportedFile('fonts/inter.woff2'));
  assert(isBinaryOrUnsupportedFile('binary/module.wasm'));
  assert(!isBinaryOrUnsupportedFile('src/index.html'));
  assert(!isBinaryOrUnsupportedFile('src/style.css'));
  assert(!isBinaryOrUnsupportedFile('src/App.tsx'));
});

await test('[Search 7] Safe single replacement and regex capture group support', async () => {
  const original = 'const port = 3000;\nconst host = "localhost";';
  const match = {
    id: 'test:1:14',
    path: 'test.ts',
    lineNumber: 1,
    column: 14,
    matchLength: 4,
    lineText: 'const port = 3000;',
    prefixText: 'const port = ',
    matchText: '3000',
    suffixText: ';',
    fileLength: original.length,
  };

  const res = safeReplaceSingleMatch(original, match, '8080', {
    caseSensitive: true,
    wholeWord: false,
    useRegex: false,
  });

  assert(res.valid);
  assert.equal(res.newContent, 'const port = 8080;\nconst host = "localhost";');

  // Test regex capture replacement:
  const content = 'const user_id = 42;';
  const regexMatch = {
    id: 'test:1:7',
    path: 'test.ts',
    lineNumber: 1,
    column: 7,
    matchLength: 7,
    lineText: 'const user_id = 42;',
    prefixText: 'const ',
    matchText: 'user_id',
    suffixText: ' = 42;',
    fileLength: content.length,
  };

  const captureRes = safeReplaceSingleMatch(content, regexMatch, 'account_$1', {
    caseSensitive: true,
    wholeWord: false,
    useRegex: true,
  });
  assert(captureRes.valid);
});

await test('[Search 8] Safe replace in whole file', async () => {
  const content = 'item_a = 1;\nitem_b = item_a + 2;\nreturn item_a;';
  const res = safeReplaceInFile(content, 'item_a', 'product_id', {
    caseSensitive: true,
    wholeWord: true,
    useRegex: false,
  });

  assert(res.valid);
  assert.equal(res.newContent, 'product_id = 1;\nitem_b = product_id + 2;\nreturn product_id;');
});

await test('[Search 9] Stale-source replacement rejection', async () => {
  const modifiedContent = 'const port = 9999;\nconst host = "localhost";';
  // Match was recorded when port was 3000
  const staleMatch = {
    id: 'test:1:14',
    path: 'test.ts',
    lineNumber: 1,
    column: 14,
    matchLength: 4,
    lineText: 'const port = 3000;',
    prefixText: 'const port = ',
    matchText: '3000',
    suffixText: ';',
    fileLength: 40,
  };

  const res = safeReplaceSingleMatch(modifiedContent, staleMatch, '8080', {
    caseSensitive: true,
    wholeWord: true,
    useRegex: false,
  });

  assert.equal(res.valid, false, 'Must reject replacement if source changed');
  assert(res.reason.includes('has changed since search was executed'));
});

await test('[Search 10] Large project responsiveness (10,000 lines across 50 files)', async () => {
  const files = [];
  for (let i = 0; i < 50; i++) {
    const lines = [];
    for (let j = 0; j < 200; j++) {
      lines.push(`const var_${i}_${j} = "data_${j}";`);
    }
    lines.push('// Target needle here: SPECIAL_TOKEN_SEARCH');
    files.push({
      path: `src/modules/file_${i}.ts`,
      content: lines.join('\n'),
    });
  }

  const start = performance.now();
  const res = searchWorkspaceFiles(files, 'SPECIAL_TOKEN_SEARCH', {
    caseSensitive: true,
    wholeWord: false,
    useRegex: false,
  });
  const elapsed = performance.now() - start;

  assert.equal(res.totalMatches, 50);
  assert(elapsed < 100, `Search across 10,000 lines should take <100ms, took ${elapsed.toFixed(1)}ms`);
});

// -----------------------------------------------------------------------------
// FEATURE GROUP B: PROBLEMS & OUTPUT
// -----------------------------------------------------------------------------

await test('[Diagnostics 1] Monaco model markers mapped to problems with correct severity & counts', async () => {
  diagnosticsService.clearDiagnostics();
  diagnosticsService.setProjectId('proj-alpha');

  const markers = [
    {
      resource: { path: '/src/App.tsx' },
      severity: 8, // Monaco Error
      message: 'Type string is not assignable to type number',
      startLineNumber: 15,
      startColumn: 5,
      code: 'TS2322',
    },
    {
      resource: { path: '/src/utils.ts' },
      severity: 4, // Monaco Warning
      message: 'Variable is declared but never read',
      startLineNumber: 4,
      startColumn: 9,
      code: 'TS6133',
    },
    {
      resource: { path: '/src/index.css' },
      severity: 2, // Monaco Info
      message: 'Do not use empty rulesets',
      startLineNumber: 1,
      startColumn: 1,
    },
  ];

  diagnosticsService.setEditorMarkers(markers, 'proj-alpha');

  const state = diagnosticsService.getState();
  assert.equal(state.totalCount, 3);
  assert.equal(state.errorCount, 1);
  assert.equal(state.warningCount, 1);
  assert.equal(state.infoCount, 1);
  assert.equal(state.items[0].path, 'src/App.tsx');
  assert.equal(state.items[0].line, 15);
  assert.equal(state.items[0].column, 5);
});

await test('[Diagnostics 2] Distinguishes editor diagnostics from runtime errors', async () => {
  diagnosticsService.setRuntimeError(
    { message: 'Vite server failed to bind port 5173', phase: 'server', code: 'EADDRINUSE' },
    'proj-alpha'
  );

  const state = diagnosticsService.getState();
  const runtimeItem = state.items.find((i) => i.source === 'runtime');
  assert(runtimeItem !== undefined, 'Runtime error must be present');
  assert.equal(runtimeItem.severity, 'error');
  assert.equal(runtimeItem.code, 'EADDRINUSE');

  // Verify clipboard format includes source & severity
  const formatted = diagnosticsService.formatDiagnostic(runtimeItem);
  assert(formatted.includes('[ERROR]'));
  assert(formatted.includes('[RUNTIME]'));
});

await test('[Diagnostics 3] Project-specific cleanup when switching projects', async () => {
  diagnosticsService.setProjectId('proj-beta');
  const betaState = diagnosticsService.getState();
  assert.equal(betaState.totalCount, 0, 'Must clear stale diagnostics when project changes');
});

await test('[Output 1] Structured output logging with categories and timestamps', async () => {
  outputLogService.clearLogs();
  outputLogService.setProjectId('proj-output');

  outputLogService.appendLog('system', 'info', 'Environment ready');
  outputLogService.appendLog('server', 'success', 'Server listening on port 3000');
  outputLogService.appendLog('build', 'warn', 'Asset size exceeds recommended 500kb');

  const logs = outputLogService.getLogs();
  assert.equal(logs.length, 4); // initial reset log + 3 logs
  assert(logs.some((l) => l.category === 'server' && l.level === 'success'));
});

await test('[Output 2] Bounded retention pruning to prevent memory growth', async () => {
  outputLogService.clearLogs();
  // Append 600 log entries
  for (let i = 0; i < 600; i++) {
    outputLogService.appendLog('system', 'info', `Log message ${i}`);
  }

  const logs = outputLogService.getLogs();
  assert.equal(logs.length, 500, 'Must enforce max 500 bounded log buffer');
  assert.equal(logs[logs.length - 1].message, 'Log message 599');
});

await test('[Output 3] Sanitization of sensitive environment tokens', async () => {
  outputLogService.clearLogs();
  outputLogService.appendLog('runtime', 'info', 'Connecting with token: ghp_123456789012345678901234567890123456');
  outputLogService.appendLog('runtime', 'info', 'Auth header: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz');

  const logs = outputLogService.getLogs();
  const ghLog = logs.find((l) => l.message.includes('Connecting with token'));
  assert(ghLog.message.includes('[REDACTED_GH_TOKEN]'), 'Must redact GitHub token');

  const bearerLog = logs.find((l) => l.message.includes('Auth header'));
  assert(bearerLog.message.includes('Bearer [REDACTED_TOKEN]'), 'Must redact Bearer token');
});

// -----------------------------------------------------------------------------
// FEATURE GROUP C & D: COMMAND PALETTE & PREVIEW UX
// -----------------------------------------------------------------------------

await test('[Command Palette] Action inventory contains all 12 required workbench actions', async () => {
  const requiredActionIds = [
    'workbench.action.quickOpen',
    'workbench.action.findInFiles',
    'workbench.view.explorer',
    'workbench.action.terminal.toggleTerminal',
    'workbench.actions.view.problems',
    'workbench.action.output.toggleOutput',
    'workbench.action.focusActiveEditorGroup',
    'workbench.action.splitEditor',
    'workbench.action.preview.refresh',
    'workbench.action.preview.openInNewTab',
    'workbench.action.openSettings',
    'workbench.action.restartDevServer',
  ];

  // Read VSCodeMode source to verify each required ID is present
  const vscodeModeSrc = await fs.readFile('src/components/vscode/VSCodeMode.tsx', 'utf8');
  for (const actionId of requiredActionIds) {
    assert(
      vscodeModeSrc.includes(actionId),
      `Required command action ${actionId} must be wired in VSCodeMode.tsx`
    );
  }
});

await test('[Preview Security & Ports] Truthful server info and sandbox security preserved', async () => {
  const vscodeModeSrc = await fs.readFile('src/components/vscode/VSCodeMode.tsx', 'utf8');

  // Verify hardcoded 5173 is removed from the active preview pill
  assert(
    !vscodeModeSrc.includes("`localhost:${webcontainer.serverPort || 5173}/`"),
    'Must not assume localhost:5173 when server port is unknown'
  );

  // Verify Back/Forward buttons document cross-origin sandbox isolation
  assert(
    vscodeModeSrc.includes('Browser history navigation is disabled across container sandbox origin'),
    'Back/Forward buttons must explain container sandbox isolation'
  );
});

// Clean up temporary bundle directory
await fs.rm(dir, { recursive: true, force: true });

console.log('======================================================================');
console.log(`INTEGRATED TEST RESULTS: ${passed} passed, ${failed} failed`);
console.log('======================================================================');

if (failed > 0) {
  process.exit(1);
}
