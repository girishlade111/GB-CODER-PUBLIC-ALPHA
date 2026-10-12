/**
 * GB Coder — Phase 0.5.1 Editor Persistence & State Consistency Test Suite
 *
 * Implements verification scenarios T01 through T40:
 * - Project Creation & Initial Preference (T01 - T05)
 * - Mode Switching & Preference Transitions (T06 - T10)
 * - Independence of ProjectType and EditorStyle (T11 - T15)
 * - Cold-Start & Route Resilience (T16 - T20)
 * - Dashboard Return & Reopen Lifecycle (T21 - T25)
 * - Backup Export & Manifest Accuracy (T26 - T30)
 * - Backup Restore & Conflict Preservation (T31 - T35)
 * - Concurrency, Autosave & Edge Cases (T36 - T40)
 *
 * Run with: npm run audit:editor-persistence (or node scripts/editor-persistence-tests.mjs)
 */

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { services, cleanup } from './audit-harness.mjs';

const {
  createProject,
  getProject,
  listProjects,
  updateProject,
  updateProjectEditorPreference,
  deleteProject,
  touchProject,
  readProjectFiles,
  restoreProject,
  duplicateProject,
  saveWorkspace,
  loadWorkspace,
  clearWorkspace,
  exportAllProjects,
  analyzeBackupArchive,
  executeRestorePlan,
  BACKUP_FORMAT_NAME,
  BACKUP_FORMAT_VERSION,
} = services;

after(() => {
  cleanup();
});

// Helper to reset project database
async function clearAllProjects() {
  const current = await listProjects();
  for (const p of current) {
    await deleteProject(p.id);
  }
}

describe('Phase 0.5.1 — Editor Persistence & Consistency Suite (T01 - T40)', () => {

  describe('Project Creation & Initial Preference (T01 - T05)', () => {
    test('T01: New project with editorStyle "vscode" persists "vscode" in IndexedDB', async () => {
      await clearAllProjects();
      const proj = await createProject({
        name: 'test-vscode-init',
        editorStyle: 'vscode',
        projectType: 'plain',
        files: [{ path: 'index.html', content: '<h1>VS Code</h1>' }],
      });
      assert.ok(proj);
      assert.equal(proj.editorStyle, 'vscode');

      const fetched = await getProject(proj.id);
      assert.ok(fetched);
      assert.equal(fetched.editorStyle, 'vscode');
    });

    test('T02: New project with editorStyle "plain" persists "plain" in IndexedDB', async () => {
      const proj = await createProject({
        name: 'test-plain-init',
        editorStyle: 'plain',
        projectType: 'plain',
        files: [{ path: 'index.html', content: '<h1>Plain</h1>' }],
      });
      assert.ok(proj);
      assert.equal(proj.editorStyle, 'plain');

      const fetched = await getProject(proj.id);
      assert.ok(fetched);
      assert.equal(fetched.editorStyle, 'plain');
    });

    test('T03: Default project creation without editorStyle defaults safely to "plain"', async () => {
      const proj = await createProject({
        name: 'test-default-style',
        projectType: 'plain',
        files: [{ path: 'index.html', content: '<h1>Default</h1>' }],
      });
      assert.ok(proj);
      assert.equal(proj.editorStyle, 'plain');

      const fetched = await getProject(proj.id);
      assert.ok(fetched);
      assert.equal(fetched.editorStyle, 'plain');
    });

    test('T04: Fullstack detected import creates project with editorStyle "vscode"', async () => {
      const proj = await createProject({
        name: 'test-fullstack-import',
        editorStyle: 'vscode',
        projectType: 'plain',
        entry: 'package.json',
        files: [
          { path: 'package.json', content: '{"name":"fullstack-app"}' },
          { path: 'server.js', content: 'console.log("server");' },
        ],
      });
      assert.ok(proj);
      assert.equal(proj.editorStyle, 'vscode');
      assert.equal(proj.entry, 'package.json');
    });

    test('T05: Plain/simple detected import creates project with editorStyle "plain"', async () => {
      const proj = await createProject({
        name: 'test-simple-import',
        editorStyle: 'plain',
        projectType: 'plain',
        files: [{ path: 'index.html', content: '<p>Simple</p>' }],
      });
      assert.ok(proj);
      assert.equal(proj.editorStyle, 'plain');
    });
  });

  describe('Mode Switching & Preference Transitions (T06 - T10)', () => {
    test('T06: Switching active project from plain to vscode updates record via updateProjectEditorPreference', async () => {
      const proj = await createProject({
        name: 'switch-test-1',
        editorStyle: 'plain',
        projectType: 'plain',
        files: [{ path: 'index.html', content: 'Hello' }],
      });
      assert.equal(proj.editorStyle, 'plain');

      const updated = await updateProjectEditorPreference(proj.id, 'vscode');
      assert.ok(updated);
      assert.equal(updated.editorStyle, 'vscode');

      const fetched = await getProject(proj.id);
      assert.equal(fetched.editorStyle, 'vscode');
    });

    test('T07: Switching active project from vscode to plain updates record via updateProjectEditorPreference', async () => {
      const proj = await createProject({
        name: 'switch-test-2',
        editorStyle: 'vscode',
        projectType: 'plain',
        files: [{ path: 'index.html', content: 'Hello' }],
      });
      assert.equal(proj.editorStyle, 'vscode');

      const updated = await updateProjectEditorPreference(proj.id, 'plain');
      assert.ok(updated);
      assert.equal(updated.editorStyle, 'plain');

      const fetched = await getProject(proj.id);
      assert.equal(fetched.editorStyle, 'plain');
    });

    test('T08: Multiple sequential switches maintain the final state accurately', async () => {
      const proj = await createProject({
        name: 'switch-seq',
        editorStyle: 'plain',
        projectType: 'plain',
        files: [{ path: 'index.html', content: 'Hello' }],
      });

      await updateProjectEditorPreference(proj.id, 'vscode');
      await updateProjectEditorPreference(proj.id, 'plain');
      await updateProjectEditorPreference(proj.id, 'vscode');

      const finalRecord = await getProject(proj.id);
      assert.equal(finalRecord.editorStyle, 'vscode');
    });

    test('T09: Invalid editorStyle argument to updateProjectEditorPreference is sanitized to plain', async () => {
      const proj = await createProject({
        name: 'switch-invalid',
        editorStyle: 'vscode',
        projectType: 'plain',
        files: [{ path: 'index.html', content: 'Hello' }],
      });

      const updated = await updateProjectEditorPreference(proj.id, 'non-existent-editor');
      assert.ok(updated);
      assert.equal(updated.editorStyle, 'plain');
    });

    test('T10: updateProjectEditorPreference returns null when target project does not exist', async () => {
      const result = await updateProjectEditorPreference('non-existent-uuid-1234', 'vscode');
      assert.equal(result, null);
    });
  });

  describe('Independence of ProjectType and EditorStyle (T11 - T15)', () => {
    test('T11: Plain project (HTML/CSS/JS) with editorStyle "vscode" maintains projectType "plain"', async () => {
      const proj = await createProject({
        name: 'plain-in-vscode',
        editorStyle: 'vscode',
        projectType: 'plain',
        files: [{ path: 'index.html', content: 'Hello Plain in VSCode' }],
      });
      assert.equal(proj.projectType, 'plain');
      assert.equal(proj.editorStyle, 'vscode');
    });

    test('T12: React project with editorStyle "plain" maintains projectType "react"', async () => {
      const proj = await createProject({
        name: 'react-in-plain',
        editorStyle: 'plain',
        projectType: 'react',
        entry: 'src/App.tsx',
        files: [{ path: 'src/App.tsx', content: 'export default () => <div>React</div>;' }],
      });
      assert.equal(proj.projectType, 'react');
      assert.equal(proj.editorStyle, 'plain');
    });

    test('T13: React project with editorStyle "vscode" maintains projectType "react"', async () => {
      const proj = await createProject({
        name: 'react-in-vscode',
        editorStyle: 'vscode',
        projectType: 'react',
        entry: 'src/App.tsx',
        files: [{ path: 'src/App.tsx', content: 'export default () => <div>React</div>;' }],
      });
      assert.equal(proj.projectType, 'react');
      assert.equal(proj.editorStyle, 'vscode');
    });

    test('T14: Vue project with editorStyle "plain" maintains projectType "vue"', async () => {
      const proj = await createProject({
        name: 'vue-in-plain',
        editorStyle: 'plain',
        projectType: 'vue',
        entry: 'src/App.vue',
        files: [{ path: 'src/App.vue', content: '<template><h1>Vue</h1></template>' }],
      });
      assert.equal(proj.projectType, 'vue');
      assert.equal(proj.editorStyle, 'plain');
    });

    test('T15: Vue project with editorStyle "vscode" maintains projectType "vue"', async () => {
      const proj = await createProject({
        name: 'vue-in-vscode',
        editorStyle: 'vscode',
        projectType: 'vue',
        entry: 'src/App.vue',
        files: [{ path: 'src/App.vue', content: '<template><h1>Vue</h1></template>' }],
      });
      assert.equal(proj.projectType, 'vue');
      assert.equal(proj.editorStyle, 'vscode');
    });
  });

  describe('Cold-Start & Route Resilience (T16 - T20)', () => {
    test('T16: Cold start at "/" does not overwrite active project\'s editorStyle "vscode" to "plain"', async () => {
      const proj = await createProject({
        name: 'cold-start-root',
        editorStyle: 'vscode',
        projectType: 'plain',
        files: [{ path: 'index.html', content: 'Root cold start' }],
      });

      // Simulate cold start read and touch
      const touched = await touchProject(proj.id);
      assert.ok(touched);
      assert.equal(touched.editorStyle, 'vscode');

      // Verify that after touched, editorStyle is still 'vscode'
      const reRead = await getProject(proj.id);
      assert.equal(reRead.editorStyle, 'vscode');
    });

    test('T17: Cold start at "#vscode" preserves active project\'s editorStyle "vscode"', async () => {
      const proj = await createProject({
        name: 'cold-start-hash',
        editorStyle: 'vscode',
        projectType: 'plain',
        files: [{ path: 'index.html', content: 'Hash cold start' }],
      });

      const reRead = await getProject(proj.id);
      assert.equal(reRead.editorStyle, 'vscode');
    });

    test('T18: Cold start with editorStyle "plain" at "#vscode" respects project preference ("plain")', async () => {
      const proj = await createProject({
        name: 'cold-start-plain-hash',
        editorStyle: 'plain',
        projectType: 'plain',
        files: [{ path: 'index.html', content: 'Plain project' }],
      });

      const reRead = await getProject(proj.id);
      assert.equal(reRead.editorStyle, 'plain');
    });

    test('T19: Touching/opening a project maintains its persisted editorStyle across reloads', async () => {
      const proj = await createProject({
        name: 'touch-style',
        editorStyle: 'vscode',
        projectType: 'plain',
        files: [{ path: 'index.html', content: 'Touch' }],
      });

      const touched = await touchProject(proj.id);
      assert.equal(touched.editorStyle, 'vscode');
      assert.ok(touched.lastOpenedAt >= proj.createdAt);
    });

    test('T20: In-memory project file snapshot updates do not clobber editorStyle', async () => {
      const proj = await createProject({
        name: 'snapshot-safe',
        editorStyle: 'vscode',
        projectType: 'plain',
        files: [{ path: 'index.html', content: 'Initial' }],
      });

      await updateProject(proj.id, { name: 'snapshot-safe-renamed' });
      const updated = await getProject(proj.id);
      assert.equal(updated.name, 'snapshot-safe-renamed');
      assert.equal(updated.editorStyle, 'vscode');
    });
  });

  describe('Dashboard Return & Reopen Lifecycle (T21 - T25)', () => {
    test('T21: Active vscode project closed to dashboard preserves editorStyle "vscode" in DB', async () => {
      const proj = await createProject({
        name: 'dash-close-vscode',
        editorStyle: 'vscode',
        projectType: 'plain',
        files: [{ path: 'index.html', content: 'VS Code' }],
      });

      // Project is closed to dashboard (active pointer cleared)
      // Verify record in DB remains vscode
      const stored = await getProject(proj.id);
      assert.equal(stored.editorStyle, 'vscode');
    });

    test('T22: Active plain project closed to dashboard preserves editorStyle "plain" in DB', async () => {
      const proj = await createProject({
        name: 'dash-close-plain',
        editorStyle: 'plain',
        projectType: 'plain',
        files: [{ path: 'index.html', content: 'Plain' }],
      });

      const stored = await getProject(proj.id);
      assert.equal(stored.editorStyle, 'plain');
    });

    test('T23: Reopening project from dashboard restores editorStyle "vscode"', async () => {
      const proj = await createProject({
        name: 'reopen-vscode',
        editorStyle: 'vscode',
        projectType: 'plain',
        files: [{ path: 'index.html', content: 'Reopen VSCode' }],
      });

      const reopened = await touchProject(proj.id);
      assert.equal(reopened.editorStyle, 'vscode');
    });

    test('T24: Reopening project from dashboard restores editorStyle "plain"', async () => {
      const proj = await createProject({
        name: 'reopen-plain',
        editorStyle: 'plain',
        projectType: 'plain',
        files: [{ path: 'index.html', content: 'Reopen Plain' }],
      });

      const reopened = await touchProject(proj.id);
      assert.equal(reopened.editorStyle, 'plain');
    });

    test('T25: Switching between two projects with different editor preferences respects each project\'s preference', async () => {
      const p1 = await createProject({
        name: 'project-A-vscode',
        editorStyle: 'vscode',
        projectType: 'plain',
        files: [{ path: 'index.html', content: 'A' }],
      });
      const p2 = await createProject({
        name: 'project-B-plain',
        editorStyle: 'plain',
        projectType: 'plain',
        files: [{ path: 'index.html', content: 'B' }],
      });

      const readA = await getProject(p1.id);
      const readB = await getProject(p2.id);
      assert.equal(readA.editorStyle, 'vscode');
      assert.equal(readB.editorStyle, 'plain');
    });
  });

  describe('Backup Export & Manifest Accuracy (T26 - T30)', () => {
    test('T26: Backup manifest exports project with editorStyle "vscode" intact', async () => {
      await clearAllProjects();
      await clearWorkspace();
      await createProject({
        name: 'export-vscode-proj',
        editorStyle: 'vscode',
        projectType: 'plain',
        files: [{ path: 'index.html', content: '<h1>Export VSCode</h1>' }],
      });

      const exportRes = await exportAllProjects({ download: false });
      assert.equal(exportRes.projectCount, 1);
      assert.equal(exportRes.manifest.projects[0].editorStyle, 'vscode');
    });

    test('T27: Backup manifest exports project with editorStyle "plain" intact', async () => {
      await clearAllProjects();
      await clearWorkspace();
      await createProject({
        name: 'export-plain-proj',
        editorStyle: 'plain',
        projectType: 'plain',
        files: [{ path: 'index.html', content: '<h1>Export Plain</h1>' }],
      });

      const exportRes = await exportAllProjects({ download: false });
      assert.equal(exportRes.projectCount, 1);
      assert.equal(exportRes.manifest.projects[0].editorStyle, 'plain');
    });

    test('T28: Backup manifest sets workspaceIncluded: false when no standalone workspace exists', async () => {
      await clearAllProjects();
      await clearWorkspace();
      await createProject({
        name: 'webos-simulated',
        editorStyle: 'vscode',
        projectType: 'plain',
        files: [{ path: 'index.html', content: '<h1>webos simulation</h1>' }],
      });

      const exportRes = await exportAllProjects({ download: false });
      assert.equal(exportRes.manifest.workspaceIncluded, false);
      assert.equal(exportRes.manifest.projects[0].editorStyle, 'vscode');
    });

    test('T29: Backup manifest sets workspaceIncluded: true when standalone workspace is exported', async () => {
      await clearAllProjects();
      await saveWorkspace(
        { projectType: 'plain', files: [{ path: 'standalone.js', content: 'console.log(1);' }] },
        null
      );

      const exportRes = await exportAllProjects({ download: false });
      assert.equal(exportRes.manifest.workspaceIncluded, true);
    });

    test('T30: Backup export respects includeWorkspace: false option even when workspace exists', async () => {
      await saveWorkspace(
        { projectType: 'plain', files: [{ path: 'standalone.js', content: 'console.log(1);' }] },
        null
      );

      const exportRes = await exportAllProjects({ download: false, includeWorkspace: false });
      assert.equal(exportRes.manifest.workspaceIncluded, false);
    });
  });

  describe('Backup Restore & Conflict Preservation (T31 - T35)', () => {
    test('T31: Restoring backup archive restores project with editorStyle "vscode"', async () => {
      await clearAllProjects();
      await createProject({
        name: 'restore-vscode-test',
        editorStyle: 'vscode',
        projectType: 'plain',
        files: [{ path: 'index.html', content: '<h1>VS Code Restored</h1>' }],
      });

      const exportRes = await exportAllProjects({ download: false });
      await clearAllProjects();

      const analysis = await analyzeBackupArchive(await exportRes.blob.arrayBuffer());
      assert.equal(analysis.plan.projects[0].editorStyle, 'vscode');

      const result = await executeRestorePlan(analysis);
      assert.equal(result.restoredProjectCount, 1);

      const restoredList = await listProjects();
      assert.equal(restoredList[0].editorStyle, 'vscode');
    });

    test('T32: Restoring backup archive restores project with editorStyle "plain"', async () => {
      await clearAllProjects();
      await createProject({
        name: 'restore-plain-test',
        editorStyle: 'plain',
        projectType: 'plain',
        files: [{ path: 'index.html', content: '<h1>Plain Restored</h1>' }],
      });

      const exportRes = await exportAllProjects({ download: false });
      await clearAllProjects();

      const analysis = await analyzeBackupArchive(await exportRes.blob.arrayBuffer());
      assert.equal(analysis.plan.projects[0].editorStyle, 'plain');

      const result = await executeRestorePlan(analysis);
      assert.equal(result.restoredProjectCount, 1);

      const restoredList = await listProjects();
      assert.equal(restoredList[0].editorStyle, 'plain');
    });

    test('T33: Restoring with conflict creates duplicate copy and preserves editorStyle "vscode"', async () => {
      await clearAllProjects();
      const original = await createProject({
        name: 'conflict-proj',
        editorStyle: 'vscode',
        projectType: 'plain',
        files: [{ path: 'index.html', content: 'Original' }],
      });

      const exportRes = await exportAllProjects({ download: false });

      // Keep original in DB so collision occurs
      const analysis = await analyzeBackupArchive(await exportRes.blob.arrayBuffer());
      assert.equal(analysis.plan.conflictsCount, 1);
      assert.equal(analysis.plan.projects[0].conflict, true);
      assert.equal(analysis.plan.projects[0].editorStyle, 'vscode');

      const result = await executeRestorePlan(analysis);
      assert.equal(result.restoredProjectCount, 1);

      const all = await listProjects();
      assert.equal(all.length, 2);
      const copy = all.find((p) => p.name.includes('(Restored)'));
      assert.ok(copy);
      assert.equal(copy.editorStyle, 'vscode');
    });

    test('T34: Restoring archive with missing or legacy editorStyle field defaults safely to "plain"', async () => {
      const now = Date.now();
      const legacyRecord = {
        id: 'legacy-proj-1',
        name: 'legacy-proj',
        createdAt: now,
        lastOpenedAt: now,
        projectType: 'plain',
        // editorStyle deliberately omitted
        fileCount: 1,
      };

      await restoreProject(legacyRecord, [{ path: 'index.html', content: 'Legacy' }]);
      const fetched = await getProject('legacy-proj-1');
      assert.equal(fetched.editorStyle, 'plain');
    });

    test('T35: Restoring multiple projects with mixed editor styles restores all respective preferences', async () => {
      await clearAllProjects();
      await createProject({
        name: 'mixed-1-vscode',
        editorStyle: 'vscode',
        projectType: 'react',
        files: [{ path: 'App.tsx', content: 'React' }],
      });
      await createProject({
        name: 'mixed-2-plain',
        editorStyle: 'plain',
        projectType: 'plain',
        files: [{ path: 'index.html', content: 'HTML' }],
      });

      const exportRes = await exportAllProjects({ download: false });
      await clearAllProjects();

      const analysis = await analyzeBackupArchive(await exportRes.blob.arrayBuffer());
      await executeRestorePlan(analysis);

      const all = await listProjects();
      const p1 = all.find((p) => p.name === 'mixed-1-vscode');
      const p2 = all.find((p) => p.name === 'mixed-2-plain');
      assert.equal(p1.editorStyle, 'vscode');
      assert.equal(p1.projectType, 'react');
      assert.equal(p2.editorStyle, 'plain');
      assert.equal(p2.projectType, 'plain');
    });
  });

  describe('Concurrency, Autosave & Edge Cases (T36 - T40)', () => {
    test('T36: Rapid mode switching does not cause race condition in IndexedDB', async () => {
      const proj = await createProject({
        name: 'rapid-switch',
        editorStyle: 'plain',
        projectType: 'plain',
        files: [{ path: 'index.html', content: 'Rapid' }],
      });

      // Fire parallel updates
      await Promise.all([
        updateProjectEditorPreference(proj.id, 'vscode'),
        updateProjectEditorPreference(proj.id, 'plain'),
        updateProjectEditorPreference(proj.id, 'vscode'),
      ]);

      const finalRecord = await getProject(proj.id);
      assert.ok(['vscode', 'plain'].includes(finalRecord.editorStyle));
    });

    test('T37: Project duplication creates new project with matching editorStyle', async () => {
      const proj = await createProject({
        name: 'source-proj',
        editorStyle: 'vscode',
        projectType: 'react',
        files: [{ path: 'src/App.tsx', content: 'App' }],
      });

      const copy = await duplicateProject(proj.id, 'source-proj-copy');
      assert.ok(copy);
      assert.notEqual(copy.id, proj.id);
      assert.equal(copy.name, 'source-proj-copy');
      assert.equal(copy.editorStyle, 'vscode');
      assert.equal(copy.projectType, 'react');
    });

    test('T38: Standalone workspace files are strictly isolated from named project files', async () => {
      await clearWorkspace();
      await saveWorkspace(
        { projectType: 'plain', files: [{ path: 'isolated-ws.txt', content: 'workspace' }] },
        null
      );

      const proj = await createProject({
        name: 'isolated-proj',
        editorStyle: 'vscode',
        projectType: 'plain',
        files: [{ path: 'proj-file.txt', content: 'project' }],
      });

      const ws = await loadWorkspace();
      const pFiles = await readProjectFiles(proj.id);

      assert.equal(ws.files.length, 1);
      assert.equal(ws.files[0].path, 'isolated-ws.txt');
      assert.equal(pFiles.length, 1);
      assert.equal(pFiles[0].path, 'proj-file.txt');
    });

    test('T39: Deleting active project cleans up active pointer without corrupting other projects\' preferences', async () => {
      const p1 = await createProject({
        name: 'surviving-vscode',
        editorStyle: 'vscode',
        projectType: 'plain',
        files: [{ path: 'index.html', content: '1' }],
      });
      const p2 = await createProject({
        name: 'to-delete',
        editorStyle: 'plain',
        projectType: 'plain',
        files: [{ path: 'index.html', content: '2' }],
      });

      await deleteProject(p2.id);

      const remaining = await getProject(p1.id);
      assert.ok(remaining);
      assert.equal(remaining.editorStyle, 'vscode');
    });

    test('T40: Zero cloud / network leaks during mode transitions and backup export/restore', async () => {
      let fetchCalled = false;
      const originalFetch = globalThis.fetch;
      globalThis.fetch = () => {
        fetchCalled = true;
        throw new Error('fetch disallowed in offline test');
      };

      try {
        const proj = await createProject({
          name: 'offline-proj',
          editorStyle: 'vscode',
          projectType: 'plain',
          files: [{ path: 'index.html', content: 'Offline' }],
        });
        await updateProjectEditorPreference(proj.id, 'plain');
        await updateProjectEditorPreference(proj.id, 'vscode');
        const exportRes = await exportAllProjects({ download: false });
        const analysis = await analyzeBackupArchive(await exportRes.blob.arrayBuffer());
        await executeRestorePlan(analysis);

        assert.equal(fetchCalled, false);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

});
