import test from 'node:test';
import assert from 'node:assert/strict';
import { services, cleanup } from './audit-harness.mjs';

const { filesToFileSystemTree } = services;

test('Project File Integrity: Existing user files are never overwritten by synthesis', () => {
  const customIndexHtml = '<!DOCTYPE html><html><head><title>Custom User HTML</title></head><body><div id="root">Custom App</div></body></html>';
  const customViteConfig = 'export default { server: { port: 3000 } };';
  const customPackageJson = JSON.stringify({ name: 'my-custom-app', version: '1.2.3', dependencies: { 'custom-lib': '^1.0.0' } }, null, 2);

  const files = [
    { path: 'index.html', content: customIndexHtml },
    { path: 'vite.config.js', content: customViteConfig },
    { path: 'package.json', content: customPackageJson },
    { path: 'App.jsx', content: 'export default function App() { return <h1>Custom</h1>; }' },
  ];

  const tree = filesToFileSystemTree(files, undefined, 'react');

  // Verify user's index.html was preserved exactly
  assert.equal(
    tree['index.html'].file.contents,
    customIndexHtml,
    'User index.html must never be overwritten by synthesized template',
  );

  // Verify user's vite.config.js was preserved exactly
  assert.equal(
    tree['vite.config.js'].file.contents,
    customViteConfig,
    'User vite.config.js must never be overwritten by synthesized template',
  );

  // Verify user's package.json was preserved
  const pkgContent = JSON.parse(tree['package.json'].file.contents);
  assert.equal(pkgContent.name, 'my-custom-app');
  assert.equal(pkgContent.dependencies['custom-lib'], '^1.0.0');
});

test('Project File Integrity: Synthesized files are created only when required', () => {
  const reactFiles = [
    { path: 'App.jsx', content: 'export default function App() { return <h1>Test</h1>; }' },
  ];

  const tree = filesToFileSystemTree(reactFiles, undefined, 'react');
  assert.ok(tree['index.html'], 'Synthesized index.html must be created for React when absent');
  assert.ok(tree['vite.config.js'], 'Synthesized vite.config.js must be created for React when absent');
  assert.ok(tree['package.json'], 'Synthesized package.json must be created for React when absent');
  assert.ok(tree['.npmrc'], 'Optimized .npmrc must be created');
});

test('Project File Integrity: Classic Editor (plain) projects remain unaffected by Vite synthesis', () => {
  const plainFiles = [
    { path: 'index.html', content: '<h1>Plain HTML</h1>' },
    { path: 'style.css', content: 'body { color: red; }' },
    { path: 'script.js', content: 'console.log("hello");' },
  ];

  const tree = filesToFileSystemTree(plainFiles, undefined, 'plain');
  assert.equal(tree['index.html'].file.contents, '<h1>Plain HTML</h1>');
  assert.equal(tree['vite.config.js'], undefined, 'Plain projects must NOT synthesize vite.config.js');
});

test('Project File Integrity: Truly empty projects do not synthesize package.json or index.html', () => {
  const emptyFiles = [];
  const tree = filesToFileSystemTree(emptyFiles, undefined, 'react');
  assert.equal(tree['package.json'], undefined, 'Empty projects must not synthesize root package.json');
  assert.equal(tree['index.html'], undefined, 'Empty projects must not synthesize root index.html');
  assert.equal(tree['vite.config.js'], undefined, 'Empty projects must not synthesize root vite.config.js');
});

test('Project File Integrity: Nested package.json projects do not synthesize root package.json', () => {
  const monorepoFiles = [
    { path: 'client/package.json', content: '{"name": "client"}' },
    { path: 'client/src/index.js', content: 'console.log("client");' },
  ];
  const tree = filesToFileSystemTree(monorepoFiles, undefined, 'plain');
  assert.equal(tree['package.json'], undefined, 'Monorepo projects with nested package.json must not synthesize root package.json');
});

test('Project File Integrity: Vue projects synthesize Vue Vite entry points only when absent', () => {
  const vueFiles = [
    { path: 'App.vue', content: '<template><h1>Vue</h1></template>' },
  ];
  const tree = filesToFileSystemTree(vueFiles, undefined, 'vue');
  assert.ok(tree['index.html'], 'Synthesized index.html must be created for Vue');
  assert.ok(tree['vite.config.js'], 'Synthesized vite.config.js must be created for Vue');
  assert.match(tree['index.html'].file.contents, /<div id="app"><\/div>/);
  assert.match(tree['vite.config.js'].file.contents, /@vitejs\/plugin-vue/);
});

cleanup();
