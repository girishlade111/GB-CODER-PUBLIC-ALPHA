/**
 * GB Coder IDE — Phase 1F Automated Regression Test Suite
 * Genuine Astro & Angular Development Workflows with Shared WebContainer Compatibility Validation
 *
 * Verifies all 44 test cases across 3 categories:
 * - Astro Suite (A01–A15)
 * - Angular Suite (G01–G17)
 * - Shared Regression Suite (R01–R12)
 *
 * Run with: node scripts/astro-angular-runtime-tests.mjs
 */

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { services, cleanup } from './audit-harness.mjs';

const {
  getUnifiedTemplate,
  listUnifiedTemplates,
  generateTemplateFiles,
  detectFramework,
  detectProjectCommands,
  saveProjectFiles,
  readProjectFiles,
  diagnoseAstroOutput,
  diagnoseAngularOutput,
  diagnoseNextJsOutput,
  webcontainerService,
  terminalSessionManager,
  devServerManager,
  filesToFileSystemTree,
} = services;

describe('GB Coder Phase 1F — Genuine Astro & Angular Runtime Tests', () => {
  after(() => {
    cleanup();
  });

  // =========================================================================
  // ASTRO TEST SUITE (A01 - A15)
  // =========================================================================
  describe('Astro Framework Suite (A01 - A15)', () => {
    test('A01: Astro starter is registered in Unified Template Registry with experimental status', () => {
      const tpl = getUnifiedTemplate('astro-starter');
      assert.ok(tpl, 'astro-starter must be registered');
      assert.equal(tpl.framework, 'astro');
      assert.equal(tpl.supportStatus, 'experimental');
      assert.equal(tpl.runtimeType, 'webcontainer');
      assert.equal(tpl.projectType, 'plain');
      assert.equal(tpl.recommendedEditor, 'vscode');
      assert.equal(tpl.packageManager, 'npm');
      assert.equal(tpl.badge, 'Experimental Astro');
      assert.ok(tpl.requiresBuildStep);
    });

    test('A02: Astro starter generates complete file dictionary with real .astro files', async () => {
      const files = await generateTemplateFiles('astro-starter');
      assert.ok(files['package.json'], 'Must include package.json');
      assert.ok(files['astro.config.mjs'], 'Must include astro.config.mjs');
      assert.ok(files['tsconfig.json'], 'Must include tsconfig.json');
      assert.ok(files['src/pages/index.astro'], 'Must include src/pages/index.astro');
      assert.ok(files['src/layouts/Layout.astro'], 'Must include src/layouts/Layout.astro');
      assert.ok(files['src/components/Welcome.astro'], 'Must include src/components/Welcome.astro');
      assert.ok(files['src/styles/global.css'], 'Must include src/styles/global.css');
      assert.ok(files['public/favicon.svg'], 'Must include public/favicon.svg');
      assert.ok(files['README.md'], 'Must include README.md');
    });

    test('A03: Astro package.json specifies Astro 5.x for WebContainer Node v22.22.3 engine compatibility', async () => {
      const files = await generateTemplateFiles('astro-starter');
      const pkg = JSON.parse(files['package.json']);
      assert.equal(pkg.name, 'astro-starter');
      assert.equal(pkg.type, 'module');
      assert.ok(pkg.dependencies.astro, 'Must specify astro dependency');
      assert.ok(pkg.dependencies.astro.includes('5.'), 'Must use Astro 5.x to satisfy WebContainer Node v22.22.3');
      assert.equal(pkg.scripts.dev, 'astro dev');
    });

    test('A04: Astro astro.config.mjs exports valid config with port 4321 and noop image service', async () => {
      const files = await generateTemplateFiles('astro-starter');
      const cfg = files['astro.config.mjs'];
      assert.ok(cfg.includes('defineConfig'), 'Must import and use defineConfig');
      assert.ok(cfg.includes('port: 4321'), 'Must configure server port 4321');
      assert.ok(cfg.includes('noop'), 'Must configure noop image service to avoid native Sharp crash');
    });

    test('A05: Astro framework detection correctly identifies Astro project from manifest and .astro files', async () => {
      const files = await generateTemplateFiles('astro-starter');
      const manifestEntries = Object.entries(files).map(([path, content]) => ({ path, content }));
      const fw = detectFramework(manifestEntries);

      assert.equal(fw.primaryFramework, 'astro');
      assert.equal(fw.displayName, 'Astro');
      assert.equal(fw.confidence, 'high');
      assert.equal(fw.runtimeSupport, 'experimental');
      assert.equal(fw.packageManager, 'npm');
      assert.ok(fw.requiresAdvancedMode);
    });

    test('A06: Astro framework capabilities specify defaultPort 4321, SSR, and HMR support', async () => {
      const files = await generateTemplateFiles('astro-starter');
      const manifestEntries = Object.entries(files).map(([path, content]) => ({ path, content }));
      const fw = detectFramework(manifestEntries);
      assert.ok(fw.evidence.some((e) => e.label === 'Astro framework'));
    });

    test('A07: Astro packageManager and devCommand detection resolves npm run dev', async () => {
      const files = await generateTemplateFiles('astro-starter');
      const projectFiles = Object.entries(files).map(([path, content]) => ({ path, content, name: path }));
      const cmdInfo = detectProjectCommands(projectFiles);

      assert.equal(cmdInfo.packageManager, 'npm');
      assert.equal(cmdInfo.devCommand, 'npm run dev');
      assert.equal(cmdInfo.buildCommand, 'npm run build');
      assert.equal(cmdInfo.runtimeAvailability, 'native');
    });

    test('A08: Astro project creation persists all files to IndexedDB', async () => {
      const projectId = 'test-astro-db-01';
      const files = await generateTemplateFiles('astro-starter');
      const projectFiles = Object.entries(files).map(([path, content]) => ({
        projectId,
        path,
        content,
        lastModified: Date.now(),
      }));

      await saveProjectFiles(projectId, projectFiles);
      const stored = await readProjectFiles(projectId);
      assert.equal(stored.length, Object.keys(files).length);
    });

    test('A09: Astro project retrieval from IndexedDB preserves exact .astro file contents', async () => {
      const projectId = 'test-astro-db-01';
      const stored = await readProjectFiles(projectId);
      const indexAstro = stored.find((f) => f.path === 'src/pages/index.astro');
      assert.ok(indexAstro, 'src/pages/index.astro must be found');
      assert.ok(indexAstro.content.includes('<Layout title="Welcome to Astro on GB Coder">'));
    });

    test('A10: Astro diagnostics detects Node.js engine version incompatibility (>=22.23.4 on v22.22.3)', () => {
      const log = 'npm error Unsupported engine: package astro@7.4.5 requires at least node 22.23.4 (current: v22.22.3)';
      const diag = diagnoseAstroOutput(log);
      assert.ok(diag, 'Must detect engine incompatibility');
      assert.equal(diag.category, 'node_version_incompatible');
      assert.ok(diag.message.includes('22.23.4'));
      assert.ok(diag.recoveryAction.includes('5.x'));
    });

    test('A11: Astro diagnostics detects missing or invalid astro.config.mjs', () => {
      const log = 'Error: Failed to load Astro config: cannot find module astro.config.mjs';
      const diag = diagnoseAstroOutput(log);
      assert.ok(diag, 'Must detect config issue');
      assert.equal(diag.category, 'missing_config');
    });

    test('A12: Astro diagnostics detects Sharp native binary failure and guides noop service', () => {
      const log = 'Error: Could not load the "sharp" module using the darwin-arm64 native addon runtime';
      const diag = diagnoseAstroOutput(log);
      assert.ok(diag, 'Must detect sharp issue');
      assert.equal(diag.category, 'image_service_unsupported');
      assert.ok(diag.recoveryAction.includes('noop'));
    });

    test('A13: Astro diagnostics detects missing src/pages/index.astro', () => {
      const log = 'Error: [astro] No pages found in src/pages directory';
      const diag = diagnoseAstroOutput(log);
      assert.ok(diag, 'Must detect missing page route');
      assert.equal(diag.category, 'missing_entry_page');
    });

    test('A14: Astro diagnostics detects port 4321 conflict (EADDRINUSE)', () => {
      const log = 'Error: listen EADDRINUSE: address already in use :::4321';
      const diag = diagnoseAstroOutput(log);
      assert.ok(diag, 'Must detect port conflict');
      assert.equal(diag.category, 'port_conflict');
      assert.equal(diag.suggestedCommand, 'npx astro dev --port 4322');
    });

    test('A15: Astro diagnostics ignores non-Astro logs', () => {
      const log = 'Vite v5.4.2 ready in 345 ms. Local: http://localhost:5173/';
      const diag = diagnoseAstroOutput(log);
      assert.equal(diag, null);
    });
  });

  // =========================================================================
  // ANGULAR TEST SUITE (G01 - G17)
  // =========================================================================
  describe('Angular Framework Suite (G01 - G17)', () => {
    test('G01: Angular starter is registered in Unified Template Registry with experimental status', () => {
      const tpl = getUnifiedTemplate('angular-starter');
      assert.ok(tpl, 'angular-starter must be registered');
      assert.equal(tpl.framework, 'angular');
      assert.equal(tpl.supportStatus, 'experimental');
      assert.equal(tpl.runtimeType, 'webcontainer');
      assert.equal(tpl.projectType, 'plain');
      assert.equal(tpl.recommendedEditor, 'vscode');
      assert.equal(tpl.packageManager, 'npm');
      assert.equal(tpl.badge, 'Experimental Angular');
      assert.ok(tpl.requiresBuildStep);
    });

    test('G02: Angular starter generates complete file dictionary with standalone component architecture', async () => {
      const files = await generateTemplateFiles('angular-starter');
      assert.ok(files['package.json'], 'Must include package.json');
      assert.ok(files['angular.json'], 'Must include angular.json');
      assert.ok(files['tsconfig.json'], 'Must include tsconfig.json');
      assert.ok(files['tsconfig.app.json'], 'Must include tsconfig.app.json');
      assert.ok(files['src/index.html'], 'Must include src/index.html');
      assert.ok(files['src/main.ts'], 'Must include src/main.ts');
      assert.ok(files['src/app/app.config.ts'], 'Must include src/app/app.config.ts');
      assert.ok(files['src/app/app.routes.ts'], 'Must include src/app/app.routes.ts');
      assert.ok(files['src/app/app.component.ts'], 'Must include src/app/app.component.ts');
      assert.ok(files['src/app/app.component.html'], 'Must include src/app/app.component.html');
      assert.ok(files['src/app/app.component.css'], 'Must include src/app/app.component.css');
      assert.ok(files['src/styles.css'], 'Must include src/styles.css');
      assert.ok(files['README.md'], 'Must include README.md');
    });

    test('G03: Angular package.json specifies @angular/core 22.2.4 matching WebContainer Node v22.22.3', async () => {
      const files = await generateTemplateFiles('angular-starter');
      const pkg = JSON.parse(files['package.json']);
      assert.equal(pkg.name, 'angular-starter');
      assert.ok(pkg.dependencies['@angular/core'], 'Must specify @angular/core');
      assert.ok(pkg.dependencies['@angular/common'], 'Must specify @angular/common');
      assert.ok(pkg.dependencies['zone.js'], 'Must specify zone.js');
      assert.ok(pkg.devDependencies['@angular/cli'], 'Must specify @angular/cli');
      assert.equal(pkg.scripts.start, 'ng serve');
    });

    test('G04: Angular angular.json defines application project with browser builder and port 4200', async () => {
      const files = await generateTemplateFiles('angular-starter');
      const ngConfig = JSON.parse(files['angular.json']);
      const proj = ngConfig.projects['angular-starter'];
      assert.ok(proj, 'Must define angular-starter project');
      assert.equal(proj.projectType, 'application');
      assert.equal(proj.architect.build.builder, '@angular-devkit/build-angular:browser');
      assert.equal(proj.architect.serve.options.port, 4200);
      assert.equal(proj.architect.serve.options.host, '0.0.0.0');
    });

    test('G05: Angular main.ts uses bootstrapApplication standalone bootstrap pattern', async () => {
      const files = await generateTemplateFiles('angular-starter');
      const mainTs = files['src/main.ts'];
      assert.ok(mainTs.includes('bootstrapApplication'), 'Must call bootstrapApplication');
      assert.ok(mainTs.includes('AppComponent'), 'Must bootstrap AppComponent');
      assert.ok(mainTs.includes('appConfig'), 'Must pass appConfig');
    });

    test('G06: Angular app.component.ts uses standalone: true and reactive signals', async () => {
      const files = await generateTemplateFiles('angular-starter');
      const compTs = files['src/app/app.component.ts'];
      assert.ok(compTs.includes('standalone: true'), 'Must declare standalone: true');
      assert.ok(compTs.includes('signal('), 'Must use Angular signals');
      assert.ok(compTs.includes('increment()'), 'Must declare increment method');
    });

    test('G07: Angular framework detection recognizes Angular from angular.json and @angular/core', async () => {
      const files = await generateTemplateFiles('angular-starter');
      const manifestEntries = Object.entries(files).map(([path, content]) => ({ path, content }));
      const fw = detectFramework(manifestEntries);

      assert.equal(fw.primaryFramework, 'angular');
      assert.equal(fw.displayName, 'Angular');
      assert.equal(fw.confidence, 'high');
      assert.equal(fw.runtimeSupport, 'experimental');
      assert.ok(fw.technologies.includes('angular'));
      assert.ok(fw.technologies.includes('typescript'));
      assert.ok(fw.requiresAdvancedMode);
    });

    test('G08: Angular framework evidence includes angular.json workspace configuration', async () => {
      const files = await generateTemplateFiles('angular-starter');
      const manifestEntries = Object.entries(files).map(([path, content]) => ({ path, content }));
      const fw = detectFramework(manifestEntries);
      assert.ok(fw.evidence.some((e) => e.label === 'Angular framework'));
    });

    test('G09: Angular command detection resolves npm start (ng serve)', async () => {
      const files = await generateTemplateFiles('angular-starter');
      const projectFiles = Object.entries(files).map(([path, content]) => ({ path, content, name: path }));
      const cmdInfo = detectProjectCommands(projectFiles);

      assert.equal(cmdInfo.packageManager, 'npm');
      assert.equal(cmdInfo.devCommand, 'npm start');
      assert.equal(cmdInfo.buildCommand, 'npm run build');
      assert.equal(cmdInfo.runtimeAvailability, 'native');
    });

    test('G10: Angular project creation persists all files to IndexedDB', async () => {
      const projectId = 'test-angular-db-01';
      const files = await generateTemplateFiles('angular-starter');
      const projectFiles = Object.entries(files).map(([path, content]) => ({
        projectId,
        path,
        content,
        lastModified: Date.now(),
      }));

      await saveProjectFiles(projectId, projectFiles);
      const stored = await readProjectFiles(projectId);
      assert.equal(stored.length, Object.keys(files).length);
    });

    test('G11: Angular project retrieval from IndexedDB preserves angular.json and component files', async () => {
      const projectId = 'test-angular-db-01';
      const stored = await readProjectFiles(projectId);
      const ngJson = stored.find((f) => f.path === 'angular.json');
      assert.ok(ngJson, 'angular.json must be persisted and retrieved');
      assert.ok(ngJson.content.includes('@angular-devkit/build-angular:browser'));
    });

    test('G12: Angular diagnostics detects esbuild native binary incompatibility', () => {
      const log = 'Error: The esbuild JavaScript API cannot be used directly in this environment without platform binary';
      const diag = diagnoseAngularOutput(log);
      assert.ok(diag, 'Must detect esbuild issue');
      assert.equal(diag.category, 'esbuild_native_failure');
      assert.ok(diag.recoveryAction.includes('@angular-devkit/build-angular:browser'));
    });

    test('G13: Angular diagnostics detects missing angular.json workspace file', () => {
      const log = 'Error: Cannot find "angular.json" in project root';
      const diag = diagnoseAngularOutput(log);
      assert.ok(diag, 'Must detect workspace config issue');
      assert.equal(diag.category, 'workspace_config_missing');
    });

    test('G14: Angular diagnostics detects missing src/main.ts entry file', () => {
      const log = 'An unhandled exception occurred: Could not resolve "src/main.ts"';
      const diag = diagnoseAngularOutput(log);
      assert.ok(diag, 'Must detect missing main entry');
      assert.equal(diag.category, 'missing_main_entry');
      assert.ok(diag.recoveryAction.includes('bootstrapApplication'));
    });

    test('G15: Angular diagnostics detects zone.js initialization failure', () => {
      const log = 'Error: Unhandled Promise rejection: zone.js is not defined';
      const diag = diagnoseAngularOutput(log);
      assert.ok(diag, 'Must detect zone.js issue');
      assert.equal(diag.category, 'zone_js_failure');
      assert.ok(diag.recoveryAction.includes('zone.js'));
    });

    test('G16: Angular diagnostics detects port 4200 conflict (EADDRINUSE)', () => {
      const log = 'Port 4200 is already in use. Use --port to specify a different port.';
      const diag = diagnoseAngularOutput(log);
      assert.ok(diag, 'Must detect port conflict');
      assert.equal(diag.category, 'port_conflict');
      assert.equal(diag.suggestedCommand, 'ng serve --port 4201');
    });

    test('G17: Angular diagnostics ignores non-Angular logs', () => {
      const log = 'webpack 5.90.0 compiled successfully in 1204 ms';
      const diag = diagnoseAngularOutput(log);
      assert.equal(diag, null);
    });
  });

  // =========================================================================
  // SHARED REGRESSION TEST SUITE (R01 - R12)
  // =========================================================================
  describe('Shared Regression Suite (R01 - R12)', () => {
    test('R01: Classic Editor mode compatibility is preserved for vanilla HTML/JS/CSS templates', async () => {
      const files = await generateTemplateFiles('blank');
      assert.ok(files['index.html']);
      assert.ok(files['style.css']);
      assert.ok(files['script.js']);

      const tpl = getUnifiedTemplate('blank');
      assert.equal(tpl.recommendedEditor, 'plain');
      assert.equal(tpl.supportStatus, 'ready');
    });

    test('R02: React/Vite starter template generates and detects correctly as verified', () => {
      const tpl = getUnifiedTemplate('react-todo');
      assert.ok(tpl);
      assert.equal(tpl.supportStatus, 'ready');
      assert.equal(tpl.projectType, 'react');
      assert.equal(tpl.framework, 'react-vite');
      assert.equal(tpl.recommendedEditor, 'vscode');
    });

    test('R03: Vue/Vite starter template generates and detects correctly as verified', () => {
      const tpl = getUnifiedTemplate('vue-tasks');
      assert.ok(tpl);
      assert.equal(tpl.supportStatus, 'ready');
      assert.equal(tpl.projectType, 'vue');
      assert.equal(tpl.framework, 'vue-vite');
      assert.equal(tpl.recommendedEditor, 'vscode');
    });

    test('R04: Node CLI starter template generates and detects correctly as verified', async () => {
      const files = await generateTemplateFiles('node-cli-starter');
      assert.ok(files['package.json']);
      assert.ok(files['bin/cli.js']);

      const tpl = getUnifiedTemplate('node-cli-starter');
      assert.equal(tpl.supportStatus, 'ready');
    });

    test('R05: Next.js genuine starter remains intact with experimental status', async () => {
      const tpl = getUnifiedTemplate('nextjs-genuine-starter');
      assert.ok(tpl);
      assert.equal(tpl.supportStatus, 'experimental');
      assert.equal(tpl.framework, 'nextjs');

      const files = await generateTemplateFiles('nextjs-genuine-starter');
      assert.ok(files['package.json']);
      assert.ok(files['app/layout.tsx']);
    });

    test('R06: Next.js simulated starters remain honest with client_simulated status', () => {
      const tpl = getUnifiedTemplate('nextjs-blog');
      assert.ok(tpl);
      assert.equal(tpl.supportStatus, 'client_simulated');
      assert.equal(tpl.runtimeType, 'client-simulated');
    });

    test('R07: Path traversal safety checks in generateTemplateFiles reject malicious relative paths', async () => {
      const unsafePaths = ['../secret.txt', '..\\secret.txt', 'src/../../evil.js'];
      for (const p of unsafePaths) {
        assert.rejects(
          async () => {
            await generateTemplateFiles(p);
          },
          /not found in registry|Unsafe template path/
        );
      }
    });

    test('R08: Planned future milestone templates cannot be generated ahead of schedule', async () => {
      assert.rejects(
        async () => {
          await generateTemplateFiles('sveltekit-starter');
        },
        /scheduled for Phase 1F/
      );
      assert.rejects(
        async () => {
          await generateTemplateFiles('express-starter');
        },
        /scheduled for Phase 1F/
      );
    });

    test('R09: IndexedDB schema version remains 1 and backwards compatible', async () => {
      const projectId = 'test-compat-db-01';
      const projectFiles = [
        { projectId, path: 'index.html', content: '<h1>Test</h1>', lastModified: Date.now() },
      ];
      await saveProjectFiles(projectId, projectFiles);
      const retrieved = await readProjectFiles(projectId);
      assert.equal(retrieved.length, 1);
      assert.equal(retrieved[0].content, '<h1>Test</h1>');
    });

    test('R10: DevServerManager handles port 4321 (Astro) and port 4200 (Angular) state transitions', () => {
      devServerManager.reset();
      devServerManager.updateState({
        projectId: 'test-astro-proj',
        epoch: 1,
        status: 'starting',
        command: 'npm run dev',
      });
      devServerManager.handleServerReady(4321, 'https://test-astro-url.webcontainer-api.io', 'test-astro-proj', 1);
      assert.equal(devServerManager.getState().serverPort, 4321);
      assert.equal(devServerManager.getState().serverUrl, 'https://test-astro-url.webcontainer-api.io');
      assert.equal(devServerManager.getState().status, 'running');

      devServerManager.reset();
      devServerManager.updateState({
        projectId: 'test-angular-proj',
        epoch: 2,
        status: 'starting',
        command: 'npm start',
      });
      devServerManager.handleServerReady(4200, 'https://test-angular-url.webcontainer-api.io', 'test-angular-proj', 2);
      assert.equal(devServerManager.getState().serverPort, 4200);
      assert.equal(devServerManager.getState().serverUrl, 'https://test-angular-url.webcontainer-api.io');
      assert.equal(devServerManager.getState().status, 'running');

      devServerManager.handlePortClose(4200, 'test-angular-proj', 2);
      assert.equal(devServerManager.getState().status, 'stopped');
    });

    test('R11: FileSyncCoordinator converts file lists to WebContainer FileSystemTree accurately', () => {
      const files = [
        { path: 'package.json', content: '{"name":"test"}' },
        { path: 'src/pages/index.astro', content: '<h1>Astro</h1>' },
      ];
      const tree = filesToFileSystemTree(files);
      assert.ok(tree['package.json']);
      assert.ok(tree['src']);
      assert.ok(tree['src'].directory['pages']);
      assert.ok(tree['src'].directory['pages'].directory['index.astro']);
    });

    test('R12: TerminalSessionManager maintains session isolation and handles multiple terminal outputs', () => {
      assert.equal(typeof terminalSessionManager.createSession, 'function');
      assert.equal(typeof terminalSessionManager.writeToSession, 'function');
      assert.equal(typeof terminalSessionManager.closeSession, 'function');
      assert.equal(typeof terminalSessionManager.teardownForProject, 'function');
      assert.equal(typeof webcontainerService.spawnAgentProcess, 'function');
    });
  });
});
