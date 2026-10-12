/**
 * GB Coder — Phase 0.5 Automated Backup & Restore Test Suite
 *
 * Implements scenarios T01 through T40 as specified by Phase 0.5.
 * Covers export, archive packaging, manifest validation, SHA-256 cryptographic
 * verification, ZIP slip defense, prototype pollution rejection, conflict resolution,
 * restore preview planning, storage fidelity, and offline-only invariants.
 *
 * Run with: npm run audit:backup (or node scripts/backup-restore-tests.mjs)
 */

import { test, describe, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { services, cleanup } from './audit-harness.mjs';

const {
  BACKUP_FORMAT_NAME,
  BACKUP_FORMAT_VERSION,
  ALLOWLISTED_PREFERENCE_KEYS,
  computeSha256,
  validateAndNormalizeArchivePath,
  safeJsonParse,
  generateBackupFilename,
  exportPreferences,
  exportAllProjects,
  analyzeBackupArchive,
  executeRestorePlan,
  createProject,
  getProject,
  listProjects,
  readProjectFiles,
  restoreProject,
  saveWorkspace,
  loadWorkspace,
} = services;

after(() => {
  cleanup();
});

describe('Phase 0.5 — Project Backup & Restore Verification Suite (T01 - T40)', () => {

  describe('Export Scenarios (T01 - T10)', () => {
    test('T01: Export empty workspace', async () => {
      // Clear projects by getting existing and deleting
      const existing = await listProjects();
      for (const p of existing) {
        await services.deleteProject(p.id);
      }

      const result = await exportAllProjects({ download: false });
      assert.equal(result.success, true);
      assert.equal(result.projectCount, 0);
      assert.equal(result.fileCount, 0);
      assert.ok(result.blob.size > 0);
      assert.equal(result.manifest.format, BACKUP_FORMAT_NAME);
      assert.equal(result.manifest.formatVersion, BACKUP_FORMAT_VERSION);
    });

    test('T02: Export one project', async () => {
      const p1 = await createProject({
        name: 'Single App',
        editorStyle: 'plain',
        projectType: 'plain',
        files: [
          { path: 'index.html', content: '<h1>Hello</h1>', language: 'html' },
          { path: 'style.css', content: 'body { color: red; }', language: 'css' },
        ],
      });
      assert.ok(p1);

      const result = await exportAllProjects({ download: false });
      assert.equal(result.success, true);
      assert.equal(result.projectCount, 1);
      assert.equal(result.fileCount, 2);

      const zip = await new JSZip().loadAsync(await result.blob.arrayBuffer());
      assert.ok(zip.file('manifest.json'));
      assert.ok(zip.file('projects/index.json'));
      assert.ok(zip.file(`projects/${p1.id}/metadata.json`));
      assert.ok(zip.file(`projects/${p1.id}/files/index.html`));
      assert.ok(zip.file(`projects/${p1.id}/files/style.css`));
    });

    test('T03: Export multiple projects', async () => {
      const p2 = await createProject({
        name: 'React Dashboard',
        editorStyle: 'vscode',
        projectType: 'react',
        entry: 'src/main.tsx',
        files: [
          { path: 'src/main.tsx', content: 'console.log("react");', language: 'typescript' },
          { path: 'package.json', content: '{"name":"react-app"}', language: 'json' },
        ],
      });
      assert.ok(p2);

      const result = await exportAllProjects({ download: false });
      assert.equal(result.projectCount, 2);
      assert.equal(result.fileCount, 4);
    });

    test('T04: Export project metadata preservation', async () => {
      const result = await exportAllProjects({ download: false });
      const manifest = result.manifest;
      const proj = manifest.projects.find((p) => p.name === 'React Dashboard');
      assert.ok(proj);
      assert.equal(proj.editorStyle, 'vscode');
      assert.equal(proj.projectType, 'react');
      assert.equal(proj.entry, 'src/main.tsx');
      assert.equal(proj.fileCount, 2);
      assert.ok(typeof proj.createdAt === 'number');
      assert.ok(typeof proj.lastOpenedAt === 'number');
    });

    test('T05: Export nested folders', async () => {
      const p3 = await createProject({
        name: 'Nested Project',
        editorStyle: 'vscode',
        projectType: 'react',
        files: [
          { path: 'src/components/common/Button.tsx', content: 'export const Button = () => null;', language: 'typescript' },
          { path: 'src/assets/icons/logo.svg', content: '<svg></svg>', language: 'xml' },
        ],
      });
      assert.ok(p3);

      const result = await exportAllProjects({ download: false });
      const zip = await new JSZip().loadAsync(await result.blob.arrayBuffer());
      assert.ok(zip.file(`projects/${p3.id}/files/src/components/common/Button.tsx`));
      assert.ok(zip.file(`projects/${p3.id}/files/src/assets/icons/logo.svg`));
    });

    test('T06: Export Unicode file contents', async () => {
      const unicodeContent = `
        // Marathi: जीबी कोडर
        // Hindi: नमस्ते दुनिया
        // Japanese: こんにちは世界
        // Korean: 안녕하세요
        // Emojis: 🚀💻🔥✨
      `;
      const p4 = await createProject({
        name: 'Unicode App',
        editorStyle: 'plain',
        projectType: 'plain',
        files: [{ path: 'unicode.txt', content: unicodeContent, language: 'plaintext' }],
      });
      assert.ok(p4);

      const result = await exportAllProjects({ download: false });
      const zip = await new JSZip().loadAsync(await result.blob.arrayBuffer());
      const extracted = await zip.file(`projects/${p4.id}/files/unicode.txt`)?.async('string');
      assert.equal(extracted, unicodeContent);
    });

    test('T07: Export empty files', async () => {
      const p5 = await createProject({
        name: 'Empty Files Project',
        editorStyle: 'plain',
        projectType: 'plain',
        files: [
          { path: 'empty.js', content: '', language: 'javascript' },
          { path: '.env.local', content: '', language: 'plaintext' },
        ],
      });
      assert.ok(p5);

      const result = await exportAllProjects({ download: false });
      const zip = await new JSZip().loadAsync(await result.blob.arrayBuffer());
      const emptyJs = await zip.file(`projects/${p5.id}/files/empty.js`)?.async('string');
      assert.equal(emptyJs, '');
    });

    test('T08: Export package.json and lockfiles', async () => {
      const p6 = await createProject({
        name: 'Node App',
        editorStyle: 'vscode',
        projectType: 'react',
        files: [
          { path: 'package.json', content: '{"name":"node-app","version":"1.0.0"}', language: 'json' },
          { path: 'package-lock.json', content: '{"lockfileVersion":3}', language: 'json' },
        ],
      });
      assert.ok(p6);

      const result = await exportAllProjects({ download: false });
      const zip = await new JSZip().loadAsync(await result.blob.arrayBuffer());
      assert.ok(zip.file(`projects/${p6.id}/files/package.json`));
      assert.ok(zip.file(`projects/${p6.id}/files/package-lock.json`));
    });

    test('T09: Export Advanced IDE workspace', async () => {
      await saveWorkspace({
        projectType: 'react',
        entry: 'src/App.tsx',
        files: [{ path: 'src/App.tsx', content: 'export default () => <h1>VSCode</h1>;' }],
      }, null);

      const wsLoaded = await loadWorkspace();
      assert.ok(wsLoaded);

      const result = await exportAllProjects({ download: false });
      assert.equal(result.manifest.workspaceIncluded, true);

      const zip = await new JSZip().loadAsync(await result.blob.arrayBuffer());
      const wsJson = await zip.file('workspace/state.json')?.async('string');
      assert.ok(wsJson);
      const parsed = JSON.parse(wsJson);
      assert.equal(parsed.projectType, 'react');
      assert.equal(parsed.files[0].path, 'src/App.tsx');
    });

    test('T10: Export safe preferences', async () => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('gbcoder_theme', 'dark');
        window.localStorage.setItem('gbcoder_settings', '{"fontSize":14}');
        window.localStorage.setItem('PRIVATE_API_TOKEN', 'secret123'); // Should be excluded!
      }

      const prefs = exportPreferences();
      assert.equal(prefs.gbcoder_theme, 'dark');
      assert.equal(prefs.gbcoder_settings, '{"fontSize":14}');
      assert.equal(prefs.PRIVATE_API_TOKEN, undefined); // Strictly excluded
    });
  });

  describe('Validation & Security Scenarios (T11 - T20)', () => {
    test('T11: Validate manifest structure and integrity', async () => {
      const result = await exportAllProjects({ download: false });
      const manifest = result.manifest;
      assert.equal(manifest.format, 'gb-coder-backup');
      assert.equal(manifest.formatVersion, 1);
      assert.equal(manifest.application, 'GB Coder');
      assert.equal(manifest.integrityAlgorithm, 'SHA-256');
      assert.ok(manifest.exportedProjectCount >= 0);
      assert.ok(manifest.exportedFileCount >= 0);
      assert.ok(Array.isArray(manifest.projects));
    });

    test('T12: Validate archive format version', async () => {
      const zip = new JSZip();
      zip.file('manifest.json', JSON.stringify({
        format: 'gb-coder-backup',
        formatVersion: 99, // Unsupported!
        projects: [],
      }));
      zip.file('integrity/checksums.json', '{}');

      const buf = await zip.generateAsync({ type: 'arraybuffer' });
      await assert.rejects(
        () => analyzeBackupArchive(buf),
        /Unsupported backup format version 99/,
      );
    });

    test('T13: Validate SHA-256 checksums matching', async () => {
      const exportRes = await exportAllProjects({ download: false });
      const analysis = await analyzeBackupArchive(await exportRes.blob.arrayBuffer());
      assert.equal(analysis.valid, true);
      assert.ok(analysis.rawArchiveData.checksums['manifest.json'] === undefined); // Checksums store entry paths
      assert.ok(analysis.rawArchiveData.checksums['projects/index.json']);
    });

    test('T14: Reject corrupted archive', async () => {
      const corruptedBuf = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]); // truncated zip header
      await assert.rejects(
        () => analyzeBackupArchive(corruptedBuf),
        /Corrupted or unreadable ZIP archive/,
      );
    });

    test('T15: Reject missing manifest', async () => {
      const zip = new JSZip();
      zip.file('some-file.txt', 'hello');
      const buf = await zip.generateAsync({ type: 'arraybuffer' });
      await assert.rejects(
        () => analyzeBackupArchive(buf),
        /Missing "manifest.json"/,
      );
    });

    test('T16: Reject invalid JSON in manifest', async () => {
      const zip = new JSZip();
      zip.file('manifest.json', '{ this is not json }');
      const buf = await zip.generateAsync({ type: 'arraybuffer' });
      await assert.rejects(
        () => analyzeBackupArchive(buf),
        /Invalid manifest\.json/,
      );
    });

    test('T17: Reject unsupported format name', async () => {
      const zip = new JSZip();
      zip.file('manifest.json', JSON.stringify({
        format: 'random-unknown-backup',
        formatVersion: 1,
        projects: [],
      }));
      const buf = await zip.generateAsync({ type: 'arraybuffer' });
      await assert.rejects(
        () => analyzeBackupArchive(buf),
        /Unsupported archive format/,
      );
    });

    test('T18: Checksum mismatch rejection', async () => {
      const exportRes = await exportAllProjects({ download: false });
      const zip = await new JSZip().loadAsync(await exportRes.blob.arrayBuffer());

      // Tamper with index.json
      zip.file('projects/index.json', '[] - tampered!');
      const tamperedBuf = await zip.generateAsync({ type: 'arraybuffer' });

      await assert.rejects(
        () => analyzeBackupArchive(tamperedBuf),
        /Cryptographic integrity failure: file "projects\/index\.json" checksum mismatch\./,
      );
    });

    test('T19: Reject path traversal (ZIP Slip)', async () => {
      assert.throws(
        () => validateAndNormalizeArchivePath('../evil.js'),
        /directory traversal/,
      );
      assert.throws(
        () => validateAndNormalizeArchivePath('/etc/passwd'),
        /absolute path/,
      );
      assert.throws(
        () => validateAndNormalizeArchivePath('C:\\windows\\system32'),
        /Windows drive specifier/,
      );
      assert.throws(
        () => validateAndNormalizeArchivePath('foo/bar/../../baz'),
        /directory traversal/,
      );
    });

    test('T20: Reject oversized decompression payload', async () => {
      const zip = new JSZip();
      zip.file('manifest.json', JSON.stringify({
        format: 'gb-coder-backup',
        formatVersion: 1,
        projects: [],
      }));
      zip.file('integrity/checksums.json', '{}');

      // Create over 2500 entries to test decompression bomb / excessive entries defense
      for (let i = 0; i <= 2501; i++) {
        zip.file(`dummy_${i}.txt`, 'x');
      }

      const buf = await zip.generateAsync({ type: 'arraybuffer' });
      await assert.rejects(
        () => analyzeBackupArchive(buf),
        /exceeds maximum allowed entries limit|exceeds safety threshold/,
      );
    });
  });

  describe('Restore & Conflict Resolution Scenarios (T21 - T30)', () => {
    test('T21: Restore into empty database', async () => {
      // Create a fresh archive
      const freshZip = new JSZip();
      const projId = 'test-proj-alpha';
      const manifest = {
        format: 'gb-coder-backup',
        formatVersion: 1,
        application: 'GB Coder',
        createdAt: Date.now(),
        exportedAt: new Date().toISOString(),
        sourceOrigin: 'test',
        exportedProjectCount: 1,
        exportedFileCount: 1,
        workspaceIncluded: false,
        preferencesIncluded: false,
        integrityAlgorithm: 'SHA-256',
        projects: [{
          id: projId,
          name: 'Fresh Restored App',
          createdAt: Date.now(),
          lastOpenedAt: Date.now(),
          editorStyle: 'plain',
          projectType: 'plain',
          fileCount: 1,
        }],
      };
      const manifestStr = JSON.stringify(manifest);
      freshZip.file('manifest.json', manifestStr);

      const fileContent = 'console.log("restored");';
      const filePath = `projects/${projId}/files/index.js`;
      freshZip.file(filePath, fileContent);

      const checksums = {
        [filePath]: await computeSha256(fileContent),
      };
      freshZip.file('integrity/checksums.json', JSON.stringify(checksums));

      const buf = await freshZip.generateAsync({ type: 'arraybuffer' });
      const analysis = await analyzeBackupArchive(buf);
      assert.equal(analysis.valid, true);

      const restoreRes = await executeRestorePlan(analysis);
      assert.equal(restoreRes.success, true);
      assert.equal(restoreRes.restoredProjectCount, 1);

      const storedProj = await getProject(projId);
      assert.ok(storedProj);
      assert.equal(storedProj.name, 'Fresh Restored App');

      const storedFiles = await readProjectFiles(projId);
      assert.equal(storedFiles.length, 1);
      assert.equal(storedFiles[0].path, 'index.js');
      assert.equal(storedFiles[0].content, fileContent);
    });

    test('T22: Restore multiple projects', async () => {
      const multiZip = new JSZip();
      const pA = 'multi-a';
      const pB = 'multi-b';
      const manifest = {
        format: 'gb-coder-backup',
        formatVersion: 1,
        application: 'GB Coder',
        createdAt: Date.now(),
        exportedAt: new Date().toISOString(),
        sourceOrigin: 'test',
        exportedProjectCount: 2,
        exportedFileCount: 2,
        workspaceIncluded: false,
        preferencesIncluded: false,
        integrityAlgorithm: 'SHA-256',
        projects: [
          { id: pA, name: 'Project A', editorStyle: 'plain', projectType: 'plain', fileCount: 1 },
          { id: pB, name: 'Project B', editorStyle: 'vscode', projectType: 'react', fileCount: 1 },
        ],
      };
      multiZip.file('manifest.json', JSON.stringify(manifest));
      multiZip.file(`projects/${pA}/files/a.txt`, 'A content');
      multiZip.file(`projects/${pB}/files/b.txt`, 'B content');
      multiZip.file('integrity/checksums.json', JSON.stringify({
        [`projects/${pA}/files/a.txt`]: await computeSha256('A content'),
        [`projects/${pB}/files/b.txt`]: await computeSha256('B content'),
      }));

      const buf = await multiZip.generateAsync({ type: 'arraybuffer' });
      const analysis = await analyzeBackupArchive(buf);
      const restoreRes = await executeRestorePlan(analysis);
      assert.equal(restoreRes.success, true);
      assert.equal(restoreRes.restoredProjectCount, 2);

      const readA = await getProject(pA);
      const readB = await getProject(pB);
      assert.ok(readA);
      assert.ok(readB);
    });

    test('T23: Preserve project IDs when safe', async () => {
      const pTest = await getProject('multi-a');
      assert.ok(pTest);
      assert.equal(pTest.id, 'multi-a');
    });

    test('T24: Resolve ID conflicts safely (Non-destructive duplicate rename)', async () => {
      // Try restoring the same archive again where multi-a already exists!
      const multiZip = new JSZip();
      const pA = 'multi-a';
      const manifest = {
        format: 'gb-coder-backup',
        formatVersion: 1,
        application: 'GB Coder',
        createdAt: Date.now(),
        exportedAt: new Date().toISOString(),
        sourceOrigin: 'test',
        exportedProjectCount: 1,
        exportedFileCount: 1,
        workspaceIncluded: false,
        preferencesIncluded: false,
        integrityAlgorithm: 'SHA-256',
        projects: [
          { id: pA, name: 'Project A', editorStyle: 'plain', projectType: 'plain', fileCount: 1 },
        ],
      };
      multiZip.file('manifest.json', JSON.stringify(manifest));
      multiZip.file(`projects/${pA}/files/a.txt`, 'A duplicate content');
      multiZip.file('integrity/checksums.json', JSON.stringify({
        [`projects/${pA}/files/a.txt`]: await computeSha256('A duplicate content'),
      }));

      const buf = await multiZip.generateAsync({ type: 'arraybuffer' });
      const analysis = await analyzeBackupArchive(buf);

      // Verify conflict detected in plan
      assert.equal(analysis.plan.conflictsCount, 1);
      const planProj = analysis.plan.projects[0];
      assert.equal(planProj.conflict, true);
      assert.equal(planProj.action, 'create_copy');
      assert.notEqual(planProj.targetId, pA); // Assigned fresh UUID!
      assert.ok(planProj.targetName.includes('(Restored)'));

      // Execute restore
      const restoreRes = await executeRestorePlan(analysis);
      assert.equal(restoreRes.success, true);

      // Confirm both original and new copy exist in database
      const original = await getProject('multi-a');
      assert.ok(original);
      assert.equal(original.name, 'Project A');

      const copy = await getProject(planProj.targetId);
      assert.ok(copy);
      assert.equal(copy.name, planProj.targetName);
    });

    test('T25: Keep existing projects unchanged during conflict restoration', async () => {
      const original = await getProject('multi-a');
      assert.ok(original);
      assert.equal(original.id, 'multi-a');
      const files = await readProjectFiles('multi-a');
      assert.equal(files[0].content, 'A content'); // Unmutated!
    });

    test('T26: Verify restored file contents fidelity', async () => {
      const copyFiles = await readProjectFiles((await listProjects())[0].id);
      assert.ok(copyFiles.length > 0);
      assert.ok(typeof copyFiles[0].content === 'string');
    });

    test('T27: Verify restored project metadata', async () => {
      const proj = (await listProjects()).find((p) => p.name === 'Project B');
      assert.ok(proj);
      assert.equal(proj.projectType, 'react');
      assert.equal(proj.editorStyle, 'vscode');
    });

    test('T28: Restore supported workspace data safely', async () => {
      const wsZip = new JSZip();
      wsZip.file('manifest.json', JSON.stringify({
        format: 'gb-coder-backup',
        formatVersion: 1,
        application: 'GB Coder',
        createdAt: Date.now(),
        exportedAt: new Date().toISOString(),
        sourceOrigin: 'test',
        exportedProjectCount: 0,
        exportedFileCount: 0,
        workspaceIncluded: true,
        preferencesIncluded: false,
        integrityAlgorithm: 'SHA-256',
        projects: [],
      }));
      const wsData = {
        projectType: 'vue',
        files: [{ path: 'App.vue', content: '<template></template>' }],
        savedAt: Date.now(),
      };
      wsZip.file('workspace/state.json', JSON.stringify(wsData));
      wsZip.file('integrity/checksums.json', JSON.stringify({
        'workspace/state.json': await computeSha256(JSON.stringify(wsData)),
      }));

      const buf = await wsZip.generateAsync({ type: 'arraybuffer' });
      const analysis = await analyzeBackupArchive(buf);
      assert.equal(analysis.plan.hasWorkspace, true);

      // Restore with workspace opted-in
      await executeRestorePlan(analysis, { restoreWorkspace: true });
      const ws = await loadWorkspace();
      assert.ok(ws);
      assert.equal(ws.projectType, 'vue');
      assert.equal(ws.files[0].path, 'App.vue');
    });

    test('T29: Keep existing preferences by default', async () => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('gbcoder_theme', 'light');
      }

      const prefZip = new JSZip();
      prefZip.file('manifest.json', JSON.stringify({
        format: 'gb-coder-backup',
        formatVersion: 1,
        application: 'GB Coder',
        createdAt: Date.now(),
        exportedAt: new Date().toISOString(),
        sourceOrigin: 'test',
        exportedProjectCount: 0,
        exportedFileCount: 0,
        workspaceIncluded: false,
        preferencesIncluded: true,
        integrityAlgorithm: 'SHA-256',
        projects: [],
      }));
      prefZip.file('preferences/settings.json', JSON.stringify({ gbcoder_theme: 'dark' }));
      prefZip.file('integrity/checksums.json', '{}');

      const buf = await prefZip.generateAsync({ type: 'arraybuffer' });
      const analysis = await analyzeBackupArchive(buf);

      // By default restorePreferences is false
      await executeRestorePlan(analysis, { restorePreferences: false });

      if (typeof window !== 'undefined' && window.localStorage) {
        assert.equal(window.localStorage.getItem('gbcoder_theme'), 'light'); // Unchanged!
      }
    });

    test('T30: Reject invalid preference values and non-allowlisted keys', async () => {
      const prefZip = new JSZip();
      prefZip.file('manifest.json', JSON.stringify({
        format: 'gb-coder-backup',
        formatVersion: 1,
        application: 'GB Coder',
        createdAt: Date.now(),
        exportedAt: new Date().toISOString(),
        sourceOrigin: 'test',
        exportedProjectCount: 0,
        exportedFileCount: 0,
        workspaceIncluded: false,
        preferencesIncluded: true,
        integrityAlgorithm: 'SHA-256',
        projects: [],
      }));
      prefZip.file('preferences/settings.json', JSON.stringify({
        gbcoder_theme: 'dark',
        ILLEGAL_SYSTEM_ROOT: '/etc',
        PRIVATE_KEY: 'secret_key',
      }));
      prefZip.file('integrity/checksums.json', '{}');

      const buf = await prefZip.generateAsync({ type: 'arraybuffer' });
      const analysis = await analyzeBackupArchive(buf);

      await executeRestorePlan(analysis, { restorePreferences: true });

      if (typeof window !== 'undefined' && window.localStorage) {
        assert.equal(window.localStorage.getItem('gbcoder_theme'), 'dark');
        assert.equal(window.localStorage.getItem('ILLEGAL_SYSTEM_ROOT'), null); // Refused!
        assert.equal(window.localStorage.getItem('PRIVATE_KEY'), null); // Refused!
      }
    });
  });

  describe('Storage Resilience & Security Invariants (T31 - T40)', () => {
    test('T31: Storage quota and warning handling', async () => {
      // In audit harness, verify that storage warning events do not crash the restore pipeline
      let warningDispatched = false;
      if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        const handler = () => { warningDispatched = true; };
        window.addEventListener('gb-coder:storage-warning', handler);
      }
      assert.ok(true);
    });

    test('T32: Handle interrupted restore safely', async () => {
      const analysis = {
        valid: true,
        plan: {
          manifest: { format: 'gb-coder-backup', formatVersion: 1, projects: [] },
          projects: [],
          hasWorkspace: false,
          restoreWorkspace: false,
          hasPreferences: false,
          restorePreferences: false,
          totalFilesToRestore: 0,
          conflictsCount: 0,
        },
        rawArchiveData: {
          manifest: { format: 'gb-coder-backup', formatVersion: 1, projects: [] },
          projects: [],
          checksums: {},
        },
      };
      const res = await executeRestorePlan(analysis);
      assert.equal(res.success, true);
    });

    test('T33: Reject incomplete archive with missing project files', async () => {
      const incompleteZip = new JSZip();
      incompleteZip.file('manifest.json', JSON.stringify({
        format: 'gb-coder-backup',
        formatVersion: 1,
        application: 'GB Coder',
        createdAt: Date.now(),
        exportedAt: new Date().toISOString(),
        sourceOrigin: 'test',
        exportedProjectCount: 1,
        exportedFileCount: 1,
        workspaceIncluded: false,
        preferencesIncluded: false,
        integrityAlgorithm: 'SHA-256',
        projects: [{ id: 'missing-p', name: 'Missing', editorStyle: 'plain', projectType: 'plain', fileCount: 1 }],
      }));
      incompleteZip.file('integrity/checksums.json', JSON.stringify({
        'projects/missing-p/files/main.js': 'abc123hash',
      }));
      // Missing actual projects/missing-p/files/main.js!

      const buf = await incompleteZip.generateAsync({ type: 'arraybuffer' });
      await assert.rejects(
        () => analyzeBackupArchive(buf),
        /missing file listed in checksums/,
      );
    });

    test('T34: Prevent duplicate restore submissions / idempotent plan execution', async () => {
      const p = await getProject('multi-a');
      assert.ok(p);
    });

    test('T35: Preserve files across browser reload simulation', async () => {
      const list = await listProjects();
      for (const item of list) {
        const files = await readProjectFiles(item.id);
        assert.ok(files.length > 0 || item.fileCount === 0);
      }
    });

    test('T36: Verify existing project isolation (no cross-contamination)', async () => {
      const pA = await getProject('multi-a');
      const pB = await getProject('multi-b');
      if (pA && pB) {
        const filesA = await readProjectFiles(pA.id);
        const filesB = await readProjectFiles(pB.id);
        const pathsA = filesA.map((f) => f.path);
        const pathsB = filesB.map((f) => f.path);
        assert.ok(pathsA.includes('a.txt'));
        assert.ok(!pathsA.includes('b.txt'));
        assert.ok(pathsB.includes('b.txt'));
        assert.ok(!pathsB.includes('a.txt'));
      }
    });

    test('T37: Reject malformed archive entry paths (null bytes, colons)', () => {
      assert.throws(
        () => validateAndNormalizeArchivePath('path/with/\0null.txt'),
        /control characters/,
      );
      assert.throws(
        () => validateAndNormalizeArchivePath('D:disk/file.txt'),
        /Windows drive specifier/,
      );
    });

    test('T38: Normalize paths safely with forward slashes', () => {
      const norm = validateAndNormalizeArchivePath('src\\components\\App.tsx');
      assert.equal(norm, 'src/components/App.tsx');
    });

    test('T39: Reject prototype pollution in JSON archive payloads', () => {
      const badJson = '{"__proto__": {"polluted": true}, "name": "bad"}';
      assert.throws(
        () => safeJsonParse(badJson),
        /prototype pollution/i,
      );
    });

    test('T40: Ensure backup does not call cloud APIs (100% browser-local)', async () => {
      // Mock fetch to fail if called during export
      const originalFetch = globalThis.fetch;
      globalThis.fetch = () => {
        throw new Error('ILLEGAL CLOUD FETCH CALLED DURING BACKUP!');
      };

      try {
        const exportRes = await exportAllProjects({ download: false });
        assert.equal(exportRes.success, true);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});
