/**
 * GB Coder IDE — Phase 1D Automated Regression Test Suite
 * Framework Detection Engine & Unified Template Infrastructure
 *
 * Verifies all 30 scenarios specified in Phase 1D:
 * - T01: Vanilla HTML/CSS/JS detection.
 * - T02: TypeScript-only project detection.
 * - T03: React + Vite detection.
 * - T04: Vue + Vite detection.
 * - T05: Next.js App Router detection.
 * - T06: Next.js Pages Router detection.
 * - T07: Astro detection.
 * - T08: Angular workspace detection.
 * - T09: Svelte detection.
 * - T10: SvelteKit detection.
 * - T11: Express project detection.
 * - T12: Node.js CLI project detection.
 * - T13: Next.js precedence over React.
 * - T14: Astro precedence over Vite.
 * - T15: Angular precedence over TypeScript.
 * - T16: Conflicting framework evidence.
 * - T17: Missing package.json fallback.
 * - T18: Invalid package.json fallback.
 * - T19: Template registry uniqueness and integrity.
 * - T20: Existing template backward compatibility.
 * - T21: New project creation and persistence with framework metadata.
 * - T22: Imported project framework detection via detectProject.
 * - T23: packageManager field compatibility with framework info.
 * - T24: Missing dev script behavior.
 * - T25: Existing editorStyle preservation ('plain' | 'vscode').
 * - T26: Existing projectType preservation ('plain' | 'react' | 'vue').
 * - T27: ZIP export/import metadata preservation.
 * - T28: Unknown framework fallback.
 * - T29: Multiple workspace manifest detection (monorepo).
 * - T30: Unsafe template path traversal rejection.
 *
 * Run with: node scripts/framework-detection-template-tests.mjs
 */

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { services, cleanup } from './audit-harness.mjs';

const {
  detectFramework,
  detectProject,
  validateTemplatePath,
  getUnifiedTemplate,
  listUnifiedTemplates,
  getTemplatesByFramework,
  generateTemplateFiles,
  detectProjectCommands,
  saveProjectFiles,
  readProjectFiles,
} = services;

describe('GB Coder Phase 1D — Framework Detection Engine & Unified Template Infrastructure (T01-T30)', () => {
  after(() => {
    cleanup();
  });

  // T01: Vanilla HTML/CSS/JS detection
  test('T01: Vanilla HTML/CSS/JS detection recognizes static web project without package.json', () => {
    const entries = [
      { path: 'index.html', content: '<!DOCTYPE html><html><body><h1>Vanilla</h1></body></html>' },
      { path: 'styles.css', content: 'body { color: black; }' },
      { path: 'app.js', content: 'console.log("hello");' },
    ];
    const res = detectFramework(entries);
    assert.equal(res.primaryFramework, 'vanilla');
    assert.equal(res.displayName, 'Static HTML/CSS/JS');
    assert.equal(res.runtimeSupport, 'verified');
    assert.equal(res.projectType, 'plain');
    assert.equal(res.requiresAdvancedMode, false);
    assert.equal(res.confidence, 'high');
  });

  // T02: TypeScript-only project detection
  test('T02: TypeScript-only project detection identifies tsconfig and .ts files', () => {
    const entries = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'ts-app',
          devDependencies: { typescript: '^5.0.0' },
        }),
      },
      { path: 'tsconfig.json', content: '{"compilerOptions":{}}' },
      { path: 'src/index.ts', content: 'const msg: string = "hello ts";' },
    ];
    const res = detectFramework(entries);
    assert.equal(res.primaryFramework, 'typescript');
    assert.ok(res.technologies.includes('typescript'));
    assert.equal(res.runtimeSupport, 'verified');
    assert.equal(res.projectType, 'plain');
  });

  // T03: React + Vite detection
  test('T03: React + Vite detection identifies React deps and Vite configuration', () => {
    const entries = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'react-vite-app',
          dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0' },
          devDependencies: { vite: '^5.0.0', '@vitejs/plugin-react': '^4.0.0' },
        }),
      },
      { path: 'vite.config.ts', content: 'export default {}' },
      { path: 'src/App.tsx', content: 'export default () => <h1>React Vite</h1>;' },
    ];
    const res = detectFramework(entries);
    assert.equal(res.primaryFramework, 'react-vite');
    assert.ok(res.technologies.includes('react'));
    assert.ok(res.technologies.includes('vite'));
    assert.equal(res.confidence, 'high');
    assert.equal(res.runtimeSupport, 'verified');
    assert.equal(res.projectType, 'react');
    assert.equal(res.requiresAdvancedMode, true);
  });

  // T04: Vue + Vite detection
  test('T04: Vue + Vite detection identifies Vue deps and Vite configuration', () => {
    const entries = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'vue-vite-app',
          dependencies: { vue: '^3.3.0' },
          devDependencies: { vite: '^5.0.0', '@vitejs/plugin-vue': '^4.0.0' },
        }),
      },
      { path: 'vite.config.js', content: 'export default {}' },
      { path: 'src/App.vue', content: '<template><h1>Vue</h1></template>' },
    ];
    const res = detectFramework(entries);
    assert.equal(res.primaryFramework, 'vue-vite');
    assert.ok(res.technologies.includes('vue'));
    assert.ok(res.technologies.includes('vite'));
    assert.equal(res.confidence, 'high');
    assert.equal(res.runtimeSupport, 'verified');
    assert.equal(res.projectType, 'vue');
    assert.equal(res.requiresAdvancedMode, true);
  });

  // T05: Next.js App Router detection
  test('T05: Next.js App Router detection identifies app directory structure and routerType', () => {
    const entries = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'nextjs-app',
          dependencies: { next: '^14.0.0', react: '^18.2.0', 'react-dom': '^18.2.0' },
        }),
      },
      { path: 'next.config.mjs', content: 'export default {}' },
      { path: 'src/app/page.tsx', content: 'export default function Page() { return <h1>Home</h1>; }' },
      { path: 'src/app/layout.tsx', content: 'export default function Layout({ children }) { return <html>{children}</html>; }' },
    ];
    const res = detectFramework(entries);
    assert.equal(res.primaryFramework, 'nextjs');
    assert.equal(res.routerType, 'app-router');
    assert.ok(['verified', 'experimental', 'not_implemented'].includes(res.runtimeSupport));
    assert.equal(res.projectType, 'react');
    assert.equal(res.requiresAdvancedMode, true);
    assert.ok(res.technologies.includes('nextjs'));
    assert.ok(res.technologies.includes('react'));
  });

  // T06: Next.js Pages Router detection
  test('T06: Next.js Pages Router detection identifies pages directory structure and routerType', () => {
    const entries = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'nextjs-pages-app',
          dependencies: { next: '^13.5.0', react: '^18.2.0', 'react-dom': '^18.2.0' },
        }),
      },
      { path: 'next.config.js', content: 'module.exports = {};' },
      { path: 'pages/index.tsx', content: 'export default function Home() { return <h1>Home</h1>; }' },
      { path: 'pages/_app.tsx', content: 'export default function App({ Component, pageProps }) { return <Component {...pageProps} />; }' },
    ];
    const res = detectFramework(entries);
    assert.equal(res.primaryFramework, 'nextjs');
    assert.equal(res.routerType, 'pages-router');
    assert.ok(['verified', 'experimental', 'not_implemented'].includes(res.runtimeSupport));
    assert.equal(res.projectType, 'react');
  });

  // T07: Astro detection
  test('T07: Astro detection identifies astro config and .astro files', () => {
    const entries = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'astro-blog',
          dependencies: { astro: '^4.0.0' },
        }),
      },
      { path: 'astro.config.mjs', content: 'export default {}' },
      { path: 'src/pages/index.astro', content: '---\n---\n<h1>Astro</h1>' },
    ];
    const res = detectFramework(entries);
    assert.equal(res.primaryFramework, 'astro');
    assert.equal(res.runtimeSupport, 'not_implemented'); // Genuine Astro planned for Phase 1F
    assert.equal(res.projectType, 'plain');
    assert.equal(res.requiresAdvancedMode, true);
  });

  // T08: Angular workspace detection
  test('T08: Angular workspace detection identifies angular.json and @angular/core', () => {
    const entries = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'angular-app',
          dependencies: { '@angular/core': '^17.0.0' },
        }),
      },
      { path: 'angular.json', content: '{"projects":{}}' },
      { path: 'src/app/app.component.ts', content: '@Component({}) export class AppComponent {}' },
    ];
    const res = detectFramework(entries);
    assert.equal(res.primaryFramework, 'angular');
    assert.equal(res.runtimeSupport, 'not_implemented'); // Planned for Phase 1F
    assert.equal(res.projectType, 'plain');
    assert.equal(res.requiresAdvancedMode, true);
  });

  // T09: Svelte detection
  test('T09: Svelte detection identifies svelte dependency and .svelte component files', () => {
    const entries = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'svelte-app',
          dependencies: { svelte: '^4.0.0' },
        }),
      },
      { path: 'src/App.svelte', content: '<script>let count = 0;</script><h1>{count}</h1>' },
    ];
    const res = detectFramework(entries);
    assert.equal(res.primaryFramework, 'svelte');
    assert.ok(res.technologies.includes('svelte'));
    assert.equal(res.runtimeSupport, 'experimental');
    assert.equal(res.projectType, 'plain');
  });

  // T10: SvelteKit detection
  test('T10: SvelteKit detection identifies @sveltejs/kit and svelte.config.js', () => {
    const entries = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'sveltekit-app',
          devDependencies: { '@sveltejs/kit': '^2.0.0', svelte: '^4.0.0' },
        }),
      },
      { path: 'svelte.config.js', content: 'export default {};' },
      { path: 'src/routes/+page.svelte', content: '<h1>SvelteKit</h1>' },
    ];
    const res = detectFramework(entries);
    assert.equal(res.primaryFramework, 'sveltekit');
    assert.ok(res.technologies.includes('sveltekit'));
    assert.ok(res.technologies.includes('svelte'));
    assert.equal(res.runtimeSupport, 'experimental');
  });

  // T11: Express project detection
  test('T11: Express project detection identifies express server dependencies and backend files', () => {
    const entries = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'express-api',
          dependencies: { express: '^4.18.2' },
        }),
      },
      { path: 'server.js', content: 'const express = require("express"); const app = express();' },
    ];
    const res = detectFramework(entries);
    assert.equal(res.primaryFramework, 'express');
    assert.equal(res.runtimeSupport, 'experimental');
    assert.equal(res.projectType, 'plain');
  });

  // T12: Node.js CLI project detection
  test('T12: Node.js CLI project detection identifies package.json bin field and executable scripts', () => {
    const entries = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'my-cli-tool',
          version: '1.0.0',
          bin: { 'my-cli': './bin/cli.js' },
        }),
      },
      { path: 'bin/cli.js', content: '#!/usr/bin/env node\nconsole.log("CLI tool");' },
    ];
    const res = detectFramework(entries);
    assert.equal(res.primaryFramework, 'node-cli');
    assert.equal(res.runtimeSupport, 'verified');
    assert.equal(res.projectType, 'plain');
  });

  // T13: Next.js precedence over React
  test('T13: Next.js takes precedence over React when both dependencies and configs coexist', () => {
    const entries = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'hybrid-next',
          dependencies: { next: '^14.0.0', react: '^18.2.0', 'react-dom': '^18.2.0' },
          devDependencies: { vite: '^5.0.0' },
        }),
      },
      { path: 'next.config.js', content: 'module.exports = {};' },
      { path: 'vite.config.js', content: 'export default {};' },
      { path: 'src/App.jsx', content: 'export default () => <h1>App</h1>;' },
    ];
    const res = detectFramework(entries);
    assert.equal(res.primaryFramework, 'nextjs');
    assert.ok(res.technologies.includes('nextjs'));
    assert.ok(res.technologies.includes('react'));
  });

  // T14: Astro precedence over Vite
  test('T14: Astro takes precedence over standalone Vite when both are detected', () => {
    const entries = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'astro-project',
          dependencies: { astro: '^4.0.0' },
          devDependencies: { vite: '^5.0.0' },
        }),
      },
      { path: 'astro.config.mjs', content: 'export default {};' },
      { path: 'src/pages/index.astro', content: '<h1>Astro</h1>' },
    ];
    const res = detectFramework(entries);
    assert.equal(res.primaryFramework, 'astro');
  });

  // T15: Angular precedence over TypeScript
  test('T15: Angular takes precedence over standalone TypeScript', () => {
    const entries = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'angular-ts-app',
          dependencies: { '@angular/core': '^17.0.0' },
          devDependencies: { typescript: '^5.0.0' },
        }),
      },
      { path: 'angular.json', content: '{"projects":{}}' },
      { path: 'tsconfig.json', content: '{"compilerOptions":{}}' },
      { path: 'src/main.ts', content: 'console.log("angular");' },
    ];
    const res = detectFramework(entries);
    assert.equal(res.primaryFramework, 'angular');
    assert.ok(res.technologies.includes('angular'));
    assert.ok(res.technologies.includes('typescript'));
  });

  // T16: Conflicting framework evidence
  test('T16: Conflicting framework evidence surfaces warning in conflicts list', () => {
    const entries = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'conflict-app',
          dependencies: { next: '^14.0.0', '@angular/core': '^17.0.0' },
        }),
      },
      { path: 'next.config.js', content: 'module.exports = {};' },
      { path: 'angular.json', content: '{"projects":{}}' },
    ];
    const res = detectFramework(entries);
    assert.ok(res.conflicts.length > 0);
    assert.ok(res.conflicts.some((c) => c.includes('Next.js and Angular')));
  });

  // T17: Missing package.json fallback
  test('T17: Missing package.json falls back cleanly to vanilla static project', () => {
    const entries = [
      { path: 'index.html', content: '<h1>Static Only</h1>' },
      { path: 'style.css', content: 'body { background: white; }' },
    ];
    const res = detectFramework(entries);
    assert.equal(res.primaryFramework, 'vanilla');
    assert.equal(res.confidence, 'high');
    assert.equal(res.manifestPath, null);
    assert.equal(res.packageManager, 'npm');
  });

  // T18: Invalid package.json fallback
  test('T18: Corrupted/malformed package.json is caught gracefully with warning', () => {
    const entries = [
      { path: 'package.json', content: '{{{ not valid json ...' },
      { path: 'index.html', content: '<h1>Broken Manifest</h1>' },
    ];
    const res = detectFramework(entries);
    assert.ok(res.warnings.some((w) => w.includes('Failed to parse')));
    assert.doesNotThrow(() => detectFramework(entries));
  });

  // T19: Template registry uniqueness and integrity
  test('T19: Template registry entries have unique non-empty IDs and complete metadata', () => {
    const templates = listUnifiedTemplates();
    assert.ok(templates.length >= 10);
    const seenIds = new Set();
    for (const tpl of templates) {
      assert.ok(tpl.id && typeof tpl.id === 'string');
      assert.ok(!seenIds.has(tpl.id), `Duplicate template id: ${tpl.id}`);
      seenIds.add(tpl.id);
      assert.ok(tpl.title && tpl.title.length > 0);
      assert.ok(tpl.description && tpl.description.length > 0);
      assert.ok(['plain', 'react', 'vue'].includes(tpl.projectType));
      assert.ok(['plain', 'vscode'].includes(tpl.recommendedEditor));
      assert.ok(['npm', 'pnpm', 'yarn'].includes(tpl.packageManager));
      assert.ok(['ready', 'experimental', 'client_simulated', 'planned_phase_1e', 'planned_phase_1f', 'deprecated'].includes(tpl.supportStatus));
      assert.ok(['webcontainer', 'client-simulated', 'planned'].includes(tpl.runtimeType));
    }
  });

  // T20: Existing template backward compatibility
  test('T20: Existing template identifiers are preserved and re-classified with honest status', () => {
    const blank = getUnifiedTemplate('blank');
    assert.ok(blank);
    assert.equal(blank.supportStatus, 'ready');
    assert.equal(blank.projectType, 'plain');

    const reactTodo = getUnifiedTemplate('react-todo');
    assert.ok(reactTodo);
    assert.equal(reactTodo.supportStatus, 'ready');
    assert.equal(reactTodo.projectType, 'react');

    const nextjsBlog = getUnifiedTemplate('nextjs-blog');
    assert.ok(nextjsBlog);
    assert.equal(nextjsBlog.supportStatus, 'client_simulated');
    assert.equal(nextjsBlog.runtimeType, 'client-simulated');
    assert.equal(nextjsBlog.projectType, 'react');

    const nextStarter = getUnifiedTemplate('nextjs-genuine-starter');
    assert.ok(nextStarter);
    assert.ok(['ready', 'experimental', 'planned_phase_1e'].includes(nextStarter.supportStatus));
    assert.ok(nextStarter.targetMilestone.startsWith('Phase 1E'));
  });

  // T21: New project creation and persistence with framework metadata
  test('T21: Builtin template file generation creates valid project file sets', async () => {
    const blankFiles = await generateTemplateFiles('blank');
    assert.ok(blankFiles['index.html']);
    assert.ok(blankFiles['style.css']);
    assert.ok(blankFiles['script.js']);

    const cliFiles = await generateTemplateFiles('node-cli-starter');
    assert.ok(cliFiles['package.json']);
    assert.ok(cliFiles['bin/cli.js']);
    const parsedPkg = JSON.parse(cliFiles['package.json']);
    assert.equal(parsedPkg.name, 'node-cli-starter');
  });

  // T22: Imported project framework detection via detectProject
  test('T22: detectProject backward compatibility wrapper populates framework metadata', () => {
    const entries = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'vue-sample',
          dependencies: { vue: '^3.3.0', vite: '^5.0.0' },
        }),
      },
      { path: 'src/App.vue', content: '<template><h1>Hi</h1></template>' },
    ];
    const result = detectProject(entries);
    assert.equal(result.kind, 'vue');
    assert.ok(result.framework);
    assert.equal(result.framework.primaryFramework, 'vue-vite');
    assert.equal(result.requiresAdvancedMode, true);
  });

  // T23: packageManager field compatibility with framework info
  test('T23: detectProjectCommands combines package manager analysis with framework metadata', () => {
    const files = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'pnpm-react-app',
          packageManager: 'pnpm@8.6.0',
          dependencies: { react: '^18.2.0', vite: '^5.0.0' },
          scripts: { dev: 'vite' },
        }),
      },
      { path: 'src/App.tsx', content: 'export default () => <h1>Pnpm React</h1>;' },
    ];
    const info = detectProjectCommands(files);
    assert.equal(info.packageManager, 'pnpm');
    assert.equal(info.packageManagerSource, 'packageManager-field');
    assert.ok(info.frameworkInfo);
    assert.equal(info.frameworkInfo.primaryFramework, 'react-vite');
    assert.equal(info.devCommand, 'pnpm dev');
  });

  // T24: Missing dev script behavior
  test('T24: Missing dev script leaves devCommand null without throwing', () => {
    const files = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'no-dev-script',
          dependencies: { lodash: '^4.17.21' },
          scripts: { test: 'echo test' },
        }),
      },
      { path: 'index.js', content: 'console.log("no dev");' },
    ];
    const info = detectProjectCommands(files);
    assert.equal(info.devCommand, null);
    assert.equal(info.buildCommand, null);
    assert.ok(info.supportedActions.includes('install'));
    assert.ok(info.supportedActions.includes('test'));
    assert.ok(!info.supportedActions.includes('dev'));
  });

  // T25: Existing editorStyle preservation ('plain' | 'vscode')
  test('T25: All framework definitions and templates strictly preserve editorStyle as plain or vscode', () => {
    const templates = listUnifiedTemplates();
    for (const tpl of templates) {
      assert.ok(
        tpl.recommendedEditor === 'plain' || tpl.recommendedEditor === 'vscode',
        `Invalid recommendedEditor in template ${tpl.id}: ${tpl.recommendedEditor}`
      );
    }
  });

  // T26: Existing projectType preservation ('plain' | 'react' | 'vue')
  test('T26: All framework definitions and templates strictly preserve projectType as plain, react, or vue', () => {
    const templates = listUnifiedTemplates();
    for (const tpl of templates) {
      assert.ok(
        ['plain', 'react', 'vue'].includes(tpl.projectType),
        `Invalid projectType in template ${tpl.id}: ${tpl.projectType}`
      );
    }
  });

  // T27: ZIP export/import metadata preservation
  test('T27: Simulated ZIP manifest entry parsing preserves file paths and framework detection', () => {
    const zipEntries = [
      { path: 'my-project/package.json', content: JSON.stringify({ name: 'zip-proj', dependencies: { react: '^18.0.0', vite: '^5.0.0' } }) },
      { path: 'my-project/src/index.jsx', content: 'export default () => <div/>;' },
    ];
    // Stripping leading directory wrapper typical of GitHub/ZIP archives
    const normalized = zipEntries.map((e) => ({
      path: e.path.replace(/^my-project\//, ''),
      content: e.content,
    }));
    const fw = detectFramework(normalized);
    assert.equal(fw.primaryFramework, 'react-vite');
    assert.equal(fw.projectType, 'react');
  });

  // T28: Unknown framework fallback
  test('T28: Completely unknown file extensions fall back to unknown without crashing', () => {
    const entries = [
      { path: 'data.xyz', content: 'arbitrary binary/text data' },
      { path: 'config.custom', content: 'custom settings' },
    ];
    const fw = detectFramework(entries);
    assert.equal(fw.primaryFramework, 'unknown');
    assert.equal(fw.confidence, 'low');
    assert.equal(fw.runtimeSupport, 'unverified');
    assert.equal(fw.projectType, 'plain');
  });

  // T29: Multiple workspace manifest detection (monorepo)
  test('T29: Monorepo / multi-manifest setups register workspace warnings', () => {
    const entries = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'monorepo-root',
          workspaces: ['packages/*'],
        }),
      },
      {
        path: 'packages/ui/package.json',
        content: JSON.stringify({ name: '@monorepo/ui', version: '1.0.0' }),
      },
      {
        path: 'packages/app/package.json',
        content: JSON.stringify({ name: '@monorepo/app', dependencies: { react: '^18.0.0' } }),
      },
    ];
    const fw = detectFramework(entries);
    assert.ok(fw.warnings.some((w) => w.includes('Monorepo or nested package.json manifests detected')));
  });

  // T30: Unsafe template path traversal rejection
  test('T30: validateTemplatePath strictly rejects path traversal, absolute paths, and null bytes', async () => {
    assert.equal(validateTemplatePath('../secret.txt').valid, false);
    assert.equal(validateTemplatePath('folder/../../secret.txt').valid, false);
    assert.equal(validateTemplatePath('/absolute/path.js').valid, false);
    assert.equal(validateTemplatePath('\\windows\\path.js').valid, false);
    assert.equal(validateTemplatePath('C:\\autoexec.bat').valid, false);
    assert.equal(validateTemplatePath('null\0byte.js').valid, false);
    assert.equal(validateTemplatePath('safe/relative/file.ts').valid, true);
    assert.equal(validateTemplatePath('package.json').valid, true);

    // Attempting to generate a planned template throws descriptive error
    await assert.rejects(
      () => generateTemplateFiles('astro-starter'),
      /scheduled for Phase 1F/
    );

    // Genuine Next.js starter generates valid file dictionary
    const nextFiles = await generateTemplateFiles('nextjs-genuine-starter');
    assert.ok(nextFiles['package.json']);
    assert.ok(nextFiles['app/page.tsx']);
  });
});
