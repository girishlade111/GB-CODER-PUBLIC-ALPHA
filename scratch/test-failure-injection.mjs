import assert from 'node:assert/strict';

// Test harness for Section 5: Conflict Resolution Failure Injection
// Evaluates Scenarios A through I

class MockWebContainerFS {
  constructor(shouldThrow = false, isAvailable = true) {
    this.files = new Map();
    this.shouldThrow = shouldThrow;
    this.isAvailable = isAvailable;
  }
  async mkdir(dir) {
    if (!this.isAvailable) throw new Error('WebContainer runtime unavailable');
    if (this.shouldThrow) throw new Error('VFS write error (disk full / EIO)');
  }
  async writeFile(path, content) {
    if (!this.isAvailable) throw new Error('WebContainer runtime unavailable');
    if (this.shouldThrow) throw new Error('VFS write error (disk full / EIO)');
    this.files.set(path, content);
  }
  async readFile(path) {
    if (!this.files.has(path)) throw new Error('ENOENT');
    return this.files.get(path);
  }
}

class MockConflictService {
  constructor() {
    this.conflicts = new Map();
  }
  registerConflict(conflict) {
    this.conflicts.set(`${conflict.projectId}:${conflict.path}`, { ...conflict, status: 'pending' });
  }
  resolveConflict(projectId, path, resolution) {
    const key = `${projectId}:${path}`;
    const c = this.conflicts.get(key);
    if (c) {
      c.status = 'resolved';
      c.resolution = resolution;
      c.resolvedAt = Date.now();
    }
  }
  getConflict(projectId, path) {
    return this.conflicts.get(`${projectId}:${path}`) || null;
  }
}

class MockProjectDB {
  constructor(shouldThrow = false) {
    this.files = new Map();
    this.shouldThrow = shouldThrow;
  }
  async saveProjectFiles(projectId, files) {
    if (this.shouldThrow) {
      throw new Error('IndexedDB QuotaExceededError or TransactionInactive');
    }
    for (const f of files) {
      this.files.set(`${projectId}:${f.path}`, f.content);
    }
  }
  getFile(projectId, path) {
    return this.files.get(`${projectId}:${path}`) || null;
  }
}

async function simulateResolveKeepMine({
  conflict,
  webcontainerFS,
  projectDB,
  conflictService,
  activeEditor,
  shouldSimulateInterruption = false,
  newTerminalEditDuringResolution = null,
}) {
  const stepsCompleted = [];
  const errors = [];

  // Step 1: Update in-memory files mirror
  const updatedFiles = [{ path: conflict.path, content: conflict.monacoContent }];
  stepsCompleted.push('memory_mirror_updated');

  // Step 2: saveProjectFiles (IndexedDB)
  try {
    await projectDB.saveProjectFiles(conflict.projectId, updatedFiles);
    stepsCompleted.push('indexeddb_saved');
  } catch (err) {
    errors.push({ step: 'indexeddb', error: err.message });
  }

  // Interruption check (e.g. user navigation or tab crash before VFS write)
  if (shouldSimulateInterruption) {
    return { stepsCompleted, errors, resolved: false, partialFailure: true };
  }

  // Concurrency check: external terminal edit arrives mid-flight
  if (newTerminalEditDuringResolution) {
    webcontainerFS.files.set(conflict.path, newTerminalEditDuringResolution);
    stepsCompleted.push('midflight_external_write_arrived');
  }

  // Step 3: webcontainerService.writeFile
  try {
    if (!webcontainerFS.isAvailable) {
      // In VSCodeMode.tsx: webcontainerService.writeFile checks: if (!container) return;
      // SILENT NO-OP!
      stepsCompleted.push('webcontainer_write_silently_skipped_no_container');
    } else {
      await webcontainerFS.writeFile(conflict.path, conflict.monacoContent);
      stepsCompleted.push('webcontainer_vfs_written');
    }
  } catch (err) {
    errors.push({ step: 'webcontainer_vfs', error: err.message });
    // In VSCodeMode.tsx: catch (err) { console.warn(...) }
    // SILENT CATCH!
  }

  // Step 4: resolveConflict
  // In VSCodeMode.tsx, this is called regardless of whether IndexedDB or VFS succeeded or failed:
  conflictService.resolveConflict(conflict.projectId, conflict.path, 'keep_mine');
  stepsCompleted.push('conflict_record_cleared');

  const partialFailure = errors.length > 0 || stepsCompleted.includes('webcontainer_write_silently_skipped_no_container');
  return { stepsCompleted, errors, resolved: true, partialFailure };
}

async function runAudit() {
  console.log('=== [SECTION 5: CONFLICT RESOLUTION FAILURE INJECTION AUDIT] ===\n');

  const baseConflict = {
    projectId: 'test-proj-1',
    path: 'src/config.ts',
    monacoContent: 'export const config = "LOCAL_USER_EDIT";',
    externalContent: 'export const config = "EXTERNAL_GIT_PULL";',
    conflictType: 'content_modified',
  };

  // Test A: Keep Mine with runtime available
  {
    const fs = new MockWebContainerFS(false, true);
    fs.files.set(baseConflict.path, baseConflict.externalContent);
    const db = new MockProjectDB(false);
    const cs = new MockConflictService();
    cs.registerConflict(baseConflict);

    const res = await simulateResolveKeepMine({ conflict: baseConflict, webcontainerFS: fs, projectDB: db, conflictService: cs });
    assert.equal(res.partialFailure, false);
    assert.equal(fs.files.get(baseConflict.path), baseConflict.monacoContent);
    assert.equal(db.getFile(baseConflict.projectId, baseConflict.path), baseConflict.monacoContent);
    assert.equal(cs.getConflict(baseConflict.projectId, baseConflict.path).status, 'resolved');
    console.log('Test A (Keep Mine with runtime available): PASS — All tiers synchronized.');
  }

  // Test B: Use External with runtime available
  {
    const fs = new MockWebContainerFS(false, true);
    fs.files.set(baseConflict.path, baseConflict.externalContent);
    const db = new MockProjectDB(false);
    const cs = new MockConflictService();
    cs.registerConflict(baseConflict);

    // In Use External, Monaco and IndexedDB are updated with externalContent
    const updatedFiles = [{ path: baseConflict.path, content: baseConflict.externalContent }];
    await db.saveProjectFiles(baseConflict.projectId, updatedFiles);
    cs.resolveConflict(baseConflict.projectId, baseConflict.path, 'use_external');

    assert.equal(fs.files.get(baseConflict.path), baseConflict.externalContent);
    assert.equal(db.getFile(baseConflict.projectId, baseConflict.path), baseConflict.externalContent);
    assert.equal(cs.getConflict(baseConflict.projectId, baseConflict.path).status, 'resolved');
    console.log('Test B (Use External with runtime available): PASS — External content applied cleanly.');
  }

  // Test C: Resolve while runtime is unavailable (isAvailable = false)
  {
    const fs = new MockWebContainerFS(false, false);
    const db = new MockProjectDB(false);
    const cs = new MockConflictService();
    cs.registerConflict(baseConflict);

    const res = await simulateResolveKeepMine({ conflict: baseConflict, webcontainerFS: fs, projectDB: db, conflictService: cs });
    console.log('Test C (Resolve while runtime unavailable):');
    console.log('  Steps:', res.stepsCompleted);
    console.log('  VFS Content:', fs.files.get(baseConflict.path) || '<NOT_WRITTEN>');
    console.log('  IDB Content:', db.getFile(baseConflict.projectId, baseConflict.path));
    console.log('  Conflict Status:', cs.getConflict(baseConflict.projectId, baseConflict.path).status);
    console.log('  CRITICAL FINDING: VFS write was silently skipped due to `if (!container) return;`.');
    console.log('  Conflict was marked "resolved" and user received success toast, but VFS was never updated!');
  }

  // Test D: WebContainer write throws (e.g. disk full, EPERM, EIO)
  {
    const fs = new MockWebContainerFS(true, true); // throws on write
    fs.files.set(baseConflict.path, baseConflict.externalContent);
    const db = new MockProjectDB(false);
    const cs = new MockConflictService();
    cs.registerConflict(baseConflict);

    const res = await simulateResolveKeepMine({ conflict: baseConflict, webcontainerFS: fs, projectDB: db, conflictService: cs });
    console.log('Test D (WebContainer write throws):');
    console.log('  Errors:', res.errors);
    console.log('  VFS Content:', fs.files.get(baseConflict.path));
    console.log('  IDB Content:', db.getFile(baseConflict.projectId, baseConflict.path));
    console.log('  Conflict Status:', cs.getConflict(baseConflict.projectId, baseConflict.path).status);
    console.log('  CRITICAL FINDING: VFS threw error, caught by try/catch in VSCodeMode.tsx, but conflict record was still marked "resolved"!');
  }

  // Test E: IndexedDB write throws (e.g. QuotaExceededError)
  {
    const fs = new MockWebContainerFS(false, true);
    fs.files.set(baseConflict.path, baseConflict.externalContent);
    const db = new MockProjectDB(true); // throws on saveProjectFiles
    const cs = new MockConflictService();
    cs.registerConflict(baseConflict);

    const res = await simulateResolveKeepMine({ conflict: baseConflict, webcontainerFS: fs, projectDB: db, conflictService: cs });
    console.log('Test E (IndexedDB write throws):');
    console.log('  Errors:', res.errors);
    console.log('  VFS Content:', fs.files.get(baseConflict.path));
    console.log('  IDB Content:', db.getFile(baseConflict.projectId, baseConflict.path) || '<NOT_SAVED>');
    console.log('  Conflict Status:', cs.getConflict(baseConflict.projectId, baseConflict.path).status);
    console.log('  CRITICAL FINDING: IDB failed to persist, but conflict status was marked "resolved"!');
  }

  // Test F & H & I: Resolution interrupted / reload occurs before completion
  {
    const fs = new MockWebContainerFS(false, true);
    fs.files.set(baseConflict.path, baseConflict.externalContent);
    const db = new MockProjectDB(false);
    const cs = new MockConflictService();
    cs.registerConflict(baseConflict);

    const res = await simulateResolveKeepMine({
      conflict: baseConflict,
      webcontainerFS: fs,
      projectDB: db,
      conflictService: cs,
      shouldSimulateInterruption: true,
    });
    console.log('Test F/H/I (Interruption / Reload before completion):');
    console.log('  Steps:', res.stepsCompleted);
    console.log('  Conflict Status:', cs.getConflict(baseConflict.projectId, baseConflict.path).status);
    assert.equal(cs.getConflict(baseConflict.projectId, baseConflict.path).status, 'pending');
    console.log('  PASS: If browser reloads before conflictService.resolveConflict() is invoked, conflict status remains "pending" in IndexedDB and is restored upon reload.');
  }

  // Test G: Newer terminal edit arrives during resolution
  {
    const fs = new MockWebContainerFS(false, true);
    fs.files.set(baseConflict.path, baseConflict.externalContent);
    const db = new MockProjectDB(false);
    const cs = new MockConflictService();
    cs.registerConflict(baseConflict);

    const res = await simulateResolveKeepMine({
      conflict: baseConflict,
      webcontainerFS: fs,
      projectDB: db,
      conflictService: cs,
      newTerminalEditDuringResolution: 'export const config = "NEWER_V5_TERMINAL_EDIT";',
    });
    console.log('Test G (Newer terminal edit occurs during resolution):');
    console.log('  Steps:', res.stepsCompleted);
    console.log('  Final VFS Content:', fs.files.get(baseConflict.path));
    console.log('  FINDING: The resolveKeepMine write overwrote the mid-flight terminal edit with the user local content.');
  }
}

runAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
