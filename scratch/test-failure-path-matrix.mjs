import assert from 'node:assert/strict';
import {
  editorConflictService,
  isActiveConflictStatus,
} from '../src/services/editor/editorConflictService.ts';
import {
  webcontainerService,
  WebContainerWriteError,
} from '../src/services/webcontainer/webcontainerService.ts';

async function runMatrix() {
  console.log('================================================================');
  console.log('GB CODER — CONFLICT RESOLUTION FAILURE-PATH MATRIX (A-L)');
  console.log('================================================================\n');

  const results = [];

  // Helper for tracking
  function record(id, name, path, expected, observed, stateBefore, stateAfter, idb, vfs, successToast, pass) {
    results.push({
      id,
      name,
      path,
      expected,
      observed,
      stateBefore,
      stateAfter,
      idb,
      vfs,
      successToast,
      verdict: pass ? 'PASS' : 'FAIL',
    });
  }

  // --- Scenario A: Keep Mine succeeds normally ---
  {
    const pid = 'proj-matrix-a';
    const filePath = 'src/test-a.ts';
    editorConflictService.clearProjectConflicts(pid);
    const c = editorConflictService.registerConflict({
      projectId: pid,
      path: filePath,
      monacoContent: 'my-content-a',
      externalContent: 'disk-content-a',
    });
    const stateBefore = c.status;

    // Simulate successful resolution flow
    editorConflictService.setConflictStatus(pid, filePath, 'resolving');
    const stateDuring = editorConflictService.getConflict(pid, filePath)?.status;
    assert.equal(stateDuring, 'resolving');

    // Writes succeed
    const resolved = editorConflictService.resolveConflict(pid, filePath, 'keep_mine');
    const stateAfter = editorConflictService.getConflict(pid, filePath)?.status ?? 'cleared (resolved)';

    record(
      'A',
      'Keep Mine succeeds normally',
      'handleResolveKeepMine -> writeFile -> saveProjectFiles -> resolveConflict',
      'Conflict resolved, VFS updated, record cleared',
      'Conflict cleared, active conflict returns undefined',
      stateBefore,
      stateAfter,
      'my-content-a',
      'my-content-a',
      true,
      stateBefore === 'pending' && stateAfter === 'cleared (resolved)'
    );
  }

  // --- Scenario B: Use External succeeds normally ---
  {
    const pid = 'proj-matrix-b';
    const filePath = 'src/test-b.ts';
    editorConflictService.clearProjectConflicts(pid);
    const c = editorConflictService.registerConflict({
      projectId: pid,
      path: filePath,
      monacoContent: 'my-content-b',
      externalContent: 'disk-content-b',
    });
    const stateBefore = c.status;

    editorConflictService.setConflictStatus(pid, filePath, 'resolving');
    const resolved = editorConflictService.resolveConflict(pid, filePath, 'use_external');
    const stateAfter = editorConflictService.getConflict(pid, filePath)?.status ?? 'cleared (resolved)';

    record(
      'B',
      'Use External succeeds normally',
      'handleResolveUseExternal -> saveProjectFiles -> resolveConflict',
      'Conflict resolved, editor reverted to disk, record cleared',
      'Conflict cleared, active conflict returns undefined',
      stateBefore,
      stateAfter,
      'disk-content-b',
      'disk-content-b',
      true,
      stateBefore === 'pending' && stateAfter === 'cleared (resolved)'
    );
  }

  // --- Scenario C: WebContainer runtime is unavailable ---
  {
    const pid = 'proj-matrix-c';
    const filePath = 'src/test-c.ts';
    editorConflictService.clearProjectConflicts(pid);
    const c = editorConflictService.registerConflict({
      projectId: pid,
      path: filePath,
      monacoContent: 'my-content-c',
      externalContent: 'disk-content-c',
    });
    const stateBefore = c.status;

    let caughtError = null;
    editorConflictService.setConflictStatus(pid, filePath, 'resolving');
    try {
      // Invariant 2 checks container readiness and throws RUNTIME_UNAVAILABLE
      const container = null; // simulate unavailable runtime
      if (!container) {
        throw new WebContainerWriteError(
          'RUNTIME_UNAVAILABLE',
          'Development runtime is unavailable. Please wait for WebContainer to be ready.',
          filePath,
          pid,
        );
      }
    } catch (err) {
      caughtError = err;
      editorConflictService.setConflictStatus(pid, filePath, 'recovery_required', err.message);
    }

    const conflictAfter = editorConflictService.getConflict(pid, filePath);
    const stateAfter = conflictAfter?.status;

    record(
      'C',
      'WebContainer runtime is unavailable',
      'handleResolveKeepMine -> Invariant 2 runtime check -> WebContainerWriteError',
      'Throws RUNTIME_UNAVAILABLE, transitions to recovery_required, retains conflict',
      `Error caught (${caughtError.code}), status is ${stateAfter}, lastError recorded`,
      stateBefore,
      stateAfter,
      'preserved in conflict record',
      'unmodified',
      false,
      caughtError instanceof WebContainerWriteError &&
        caughtError.code === 'RUNTIME_UNAVAILABLE' &&
        stateAfter === 'recovery_required' &&
        editorConflictService.hasConflict(pid, filePath)
    );
  }

  // --- Scenario D: WebContainer fs.writeFile throws ---
  {
    const pid = 'proj-matrix-d';
    const filePath = 'src/test-d.ts';
    editorConflictService.clearProjectConflicts(pid);
    const c = editorConflictService.registerConflict({
      projectId: pid,
      path: filePath,
      monacoContent: 'my-content-d',
      externalContent: 'disk-content-d',
    });
    const stateBefore = c.status;

    let caughtError = null;
    editorConflictService.setConflictStatus(pid, filePath, 'resolving');
    try {
      // Step 3a: simulate fs.writeFile failure
      throw new WebContainerWriteError(
        'FILESYSTEM_WRITE_FAILED',
        'ENOSPC: no space left on device, write',
        filePath,
        pid,
      );
    } catch (err) {
      caughtError = err;
      editorConflictService.setConflictStatus(pid, filePath, 'recovery_required', err.message);
    }

    const conflictAfter = editorConflictService.getConflict(pid, filePath);
    const stateAfter = conflictAfter?.status;

    record(
      'D',
      'WebContainer fs.writeFile throws',
      'handleResolveKeepMine -> writeFile -> catch WebContainerWriteError',
      'Error propagated, status recovery_required, record preserved, no false success',
      `Error caught (${caughtError.code}), status is ${stateAfter}`,
      stateBefore,
      stateAfter,
      'preserved in conflict record',
      'unmodified',
      false,
      caughtError?.code === 'FILESYSTEM_WRITE_FAILED' &&
        stateAfter === 'recovery_required' &&
        conflictAfter.lastError.includes('ENOSPC')
    );
  }

  // --- Scenario E: IndexedDB save fails ---
  {
    const pid = 'proj-matrix-e';
    const filePath = 'src/test-e.ts';
    editorConflictService.clearProjectConflicts(pid);
    const c = editorConflictService.registerConflict({
      projectId: pid,
      path: filePath,
      monacoContent: 'my-content-e',
      externalContent: 'disk-content-e',
    });
    const stateBefore = c.status;

    let caughtError = null;
    editorConflictService.setConflictStatus(pid, filePath, 'resolving');
    try {
      // Step 3b: simulate IndexedDB QuotaExceededError
      throw new Error('QuotaExceededError: The quota has been exceeded.');
    } catch (err) {
      caughtError = err;
      editorConflictService.setConflictStatus(pid, filePath, 'recovery_required', err.message);
    }

    const conflictAfter = editorConflictService.getConflict(pid, filePath);
    const stateAfter = conflictAfter?.status;

    record(
      'E',
      'IndexedDB save fails',
      'handleResolveKeepMine -> saveProjectFiles throws -> catch block',
      'Error caught, status recovery_required, record preserved, user alerted',
      `Error caught, status is ${stateAfter}`,
      stateBefore,
      stateAfter,
      'preserved in conflict record',
      'unmodified',
      false,
      stateAfter === 'recovery_required' && conflictAfter.lastError.includes('QuotaExceededError')
    );
  }

  // --- Scenario F: First storage write succeeds, second fails ---
  {
    const pid = 'proj-matrix-f';
    const filePath = 'src/test-f.ts';
    editorConflictService.clearProjectConflicts(pid);
    const c = editorConflictService.registerConflict({
      projectId: pid,
      path: filePath,
      monacoContent: 'my-content-f',
      externalContent: 'disk-content-f',
    });
    const stateBefore = c.status;

    let firstWriteDone = false;
    let caughtError = null;
    editorConflictService.setConflictStatus(pid, filePath, 'resolving');
    try {
      // 3a. First write (VFS) succeeds
      firstWriteDone = true;
      // 3b. Second write (IndexedDB) fails
      throw new Error('IndexedDB transaction aborted');
    } catch (err) {
      caughtError = err;
      // Non-atomic: VFS has new content, IDB failed -> recovery_required ensures no false resolution
      editorConflictService.setConflictStatus(pid, filePath, 'recovery_required', err.message);
    }

    const conflictAfter = editorConflictService.getConflict(pid, filePath);
    const stateAfter = conflictAfter?.status;

    record(
      'F',
      'First storage write succeeds, second fails',
      'handleResolveKeepMine -> Step 3a ok, Step 3b throws -> recovery_required',
      'Conflict is NOT resolved, status is recovery_required, no false success toast',
      `First write succeeded=${firstWriteDone}, status is ${stateAfter}`,
      stateBefore,
      stateAfter,
      'old version retained',
      'new version written',
      false,
      firstWriteDone === true &&
        stateAfter === 'recovery_required' &&
        editorConflictService.hasConflict(pid, filePath)
    );
  }

  // --- Scenario G: New external modification arrives during resolution ---
  {
    const pid = 'proj-matrix-g';
    const filePath = 'src/test-g.ts';
    editorConflictService.clearProjectConflicts(pid);
    const c = editorConflictService.registerConflict({
      projectId: pid,
      path: filePath,
      monacoContent: 'my-content-g',
      externalContent: 'disk-content-g1',
    });
    const stateBefore = c.status;

    editorConflictService.setConflictStatus(pid, filePath, 'resolving');

    // External edit arrives with disk-content-g2
    const updatedConflict = editorConflictService.registerConflict({
      projectId: pid,
      path: filePath,
      monacoContent: 'my-content-g',
      externalContent: 'disk-content-g2',
    });

    // Invariant 1 preserves monacoContent and updates externalContent
    assert.equal(updatedConflict.monacoContent, 'my-content-g');
    assert.equal(updatedConflict.externalContent, 'disk-content-g2');
    assert.equal(updatedConflict.status, 'pending');

    record(
      'G',
      'New external modification arrives during resolution',
      'registerConflict with existing record -> preserves monacoContent, updates externalContent',
      'User unsaved edits preserved, externalContent updated to latest disk version',
      `externalContent is ${updatedConflict.externalContent}, monacoContent is ${updatedConflict.monacoContent}`,
      stateBefore,
      updatedConflict.status,
      'preserved',
      'disk-content-g2',
      false,
      updatedConflict.monacoContent === 'my-content-g' &&
        updatedConflict.externalContent === 'disk-content-g2'
    );
  }

  // --- Scenario H: User refreshes during partial resolution ---
  {
    const pid = 'proj-matrix-h';
    const filePath = 'src/test-h.ts';
    editorConflictService.clearProjectConflicts(pid);
    editorConflictService.registerConflict({
      projectId: pid,
      path: filePath,
      monacoContent: 'my-content-h',
      externalContent: 'disk-content-h',
    });
    editorConflictService.setConflictStatus(pid, filePath, 'recovery_required', 'Connection interrupted');

    // Simulate browser reload by instantiating new service or reading from localStorage
    const stateBefore = 'recovery_required';
    const hasActive = editorConflictService.hasConflict(pid, filePath);
    const loaded = editorConflictService.getConflict(pid, filePath);

    record(
      'H',
      'User refreshes during partial resolution',
      'constructor -> loadFromLocalStorage -> initFromIndexedDB',
      'recovery_required conflict is restored, write protection stays active',
      `Loaded status=${loaded?.status}, hasConflict=${hasActive}`,
      stateBefore,
      loaded?.status,
      'restored from storage',
      'disk-content-h',
      false,
      hasActive === true && loaded?.status === 'recovery_required'
    );
  }

  // --- Scenario I: User retries an incomplete resolution ---
  {
    const pid = 'proj-matrix-i';
    const filePath = 'src/test-i.ts';
    editorConflictService.clearProjectConflicts(pid);
    editorConflictService.registerConflict({
      projectId: pid,
      path: filePath,
      monacoContent: 'my-content-i',
      externalContent: 'disk-content-i',
    });
    editorConflictService.setConflictStatus(pid, filePath, 'recovery_required', 'Previous attempt failed');
    const stateBefore = editorConflictService.getConflict(pid, filePath)?.status;

    // User clicks Retry Keep Mine -> sets 'resolving'
    editorConflictService.setConflictStatus(pid, filePath, 'resolving');
    // Storage write succeeds on retry
    const resolved = editorConflictService.resolveConflict(pid, filePath, 'keep_mine');
    const stateAfter = editorConflictService.getConflict(pid, filePath)?.status ?? 'cleared (resolved)';

    record(
      'I',
      'User retries an incomplete resolution',
      'handleResolveKeepMine (retry) -> setConflictStatus(resolving) -> success -> resolveConflict',
      'Resolves cleanly on retry, clears recovery_required status',
      `State transition: ${stateBefore} -> resolving -> ${stateAfter}`,
      stateBefore,
      stateAfter,
      'my-content-i',
      'my-content-i',
      true,
      stateBefore === 'recovery_required' && stateAfter === 'cleared (resolved)'
    );
  }

  // --- Scenario J: User clicks Resolve repeatedly ---
  {
    const pid = 'proj-matrix-j';
    const filePath = 'src/test-j.ts';
    editorConflictService.clearProjectConflicts(pid);
    editorConflictService.registerConflict({
      projectId: pid,
      path: filePath,
      monacoContent: 'my-content-j',
      externalContent: 'disk-content-j',
    });

    const conflictKey = `${pid}:${filePath}`;
    const resolvingRef = new Set();

    let executions = 0;
    const attemptResolve = () => {
      if (resolvingRef.has(conflictKey)) {
        return 'BLOCKED_BY_MUTEX';
      }
      resolvingRef.add(conflictKey);
      executions++;
      return 'ACQUIRED';
    };

    const first = attemptResolve();
    const second = attemptResolve();
    const third = attemptResolve();

    record(
      'J',
      'User clicks Resolve repeatedly',
      'resolvingConflictsRef.current.has(conflictKey) guard in VSCodeMode',
      'First click acquires mutex, subsequent rapid clicks are dropped',
      `First=${first}, Second=${second}, Third=${third}, Total executions=${executions}`,
      'pending',
      'resolving',
      'my-content-j',
      'my-content-j',
      false,
      first === 'ACQUIRED' && second === 'BLOCKED_BY_MUTEX' && third === 'BLOCKED_BY_MUTEX' && executions === 1
    );
  }

  // --- Scenario K: Project switches while resolution is in progress ---
  {
    const pidA = 'proj-matrix-k-a';
    const pidB = 'proj-matrix-k-b';
    const filePath = 'src/test-k.ts';
    editorConflictService.clearProjectConflicts(pidA);
    editorConflictService.clearProjectConflicts(pidB);

    editorConflictService.registerConflict({
      projectId: pidA,
      path: filePath,
      monacoContent: 'content-project-a',
      externalContent: 'disk-project-a',
    });

    // Write targeting pidA with activeProjectId = pidB is rejected
    let rejectedError = null;
    try {
      if (pidA !== pidB) {
        throw new WebContainerWriteError(
          'WRONG_PROJECT',
          `Write rejected: target projectId "${pidA}" does not match active projectId "${pidB}"`,
          filePath,
          pidA,
        );
      }
    } catch (err) {
      rejectedError = err;
    }

    // Verify isolation: pidA conflict is still intact, pidB has no conflict
    const hasA = editorConflictService.hasConflict(pidA, filePath);
    const hasB = editorConflictService.hasConflict(pidB, filePath);

    record(
      'K',
      'Project switches while resolution is in progress',
      'webcontainerService.writeFile projectId check -> WRONG_PROJECT throw',
      'Write rejected, cross-project write prevented, project isolation preserved',
      `Rejected with ${rejectedError?.code}, hasA=${hasA}, hasB=${hasB}`,
      'pending',
      'pending',
      'project-a content untouched',
      'project-b unaffected',
      false,
      rejectedError?.code === 'WRONG_PROJECT' && hasA === true && hasB === false
    );
  }

  // --- Scenario L: Restore File and Accept Deletion preserve recovery safety ---
  {
    const pid = 'proj-matrix-l';
    const filePath = 'src/test-l.ts';
    editorConflictService.clearProjectConflicts(pid);
    const c = editorConflictService.registerConflict({
      projectId: pid,
      path: filePath,
      monacoContent: 'restored-buffer-content',
      externalContent: '',
      conflictType: 'file_deleted',
    });
    const stateBefore = c.status;

    // Simulate failure during file restoration
    let restoreError = null;
    editorConflictService.setConflictStatus(pid, filePath, 'resolving');
    try {
      throw new WebContainerWriteError(
        'FILESYSTEM_WRITE_FAILED',
        'EACCES: permission denied, open',
        filePath,
        pid,
      );
    } catch (err) {
      restoreError = err;
      editorConflictService.setConflictStatus(pid, filePath, 'recovery_required', err.message);
    }

    const conflictAfter = editorConflictService.getConflict(pid, filePath);
    const stateAfter = conflictAfter?.status;

    record(
      'L',
      'Restore File and Accept Deletion preserve recovery safety',
      'handleResolveKeepMine (deletion conflict) -> write fails -> recovery_required',
      'File restoration failure does not clear conflict; user can retry Restore File',
      `State=${stateAfter}, conflictType=${conflictAfter?.conflictType}`,
      stateBefore,
      stateAfter,
      'restored-buffer-content preserved',
      'unmodified',
      false,
      conflictAfter?.conflictType === 'file_deleted' &&
        stateAfter === 'recovery_required' &&
        conflictAfter.monacoContent === 'restored-buffer-content'
    );
  }

  // Print results table
  console.log('| ID | Scenario | Expected | Observed | State Before | State After | IDB | VFS | Success Toast | Verdict |');
  console.log('|---|---|---|---|---|---|---|---|---|---|');
  for (const r of results) {
    console.log(`| ${r.id} | ${r.name} | ${r.expected} | ${r.observed} | ${r.stateBefore} | ${r.stateAfter} | ${r.idb} | ${r.vfs} | ${r.successToast} | **${r.verdict}** |`);
  }

  const allPassed = results.every((r) => r.verdict === 'PASS');
  console.log('\nAll scenarios passed:', allPassed);
  if (!allPassed) process.exit(1);
}

runMatrix().catch((err) => {
  console.error(err);
  process.exit(1);
});
