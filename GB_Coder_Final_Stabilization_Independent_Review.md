# GB Coder — Phase 2.2 Final Stabilization: Independent Diff Review

**Review scope:** User-supplied `PHASE_2_2_FINAL_STABILIZATION_DIFF.patch` (`1429f3b..7912af0`, 1,002 lines) and `PHASE_2_2_FINAL_STABILIZATION_REPORT.md` (192 lines). Remote baseline cross-checked where available. This is a source review, **not** an independently executed full-repository build or browser test.

**Release recommendation: NO-GO / HOLD feature-branch push, PR and Production.** The implementation has demonstrable defects and test coverage gaps despite agent-reported 79/79 PASS.

## Findings

### S1 — P0 build/type regression: missing `currentProj` in Quick npm Install
**Source:** `src/components/Console/TerminalTab.tsx`, diff hunk `@@ -850,11 +854,13 @@`.

The patch replaces `const currentProj = projectRef.current;` with `const effectiveProjectId = projectId || (currentProj as ...).id;` and still references `currentProj.files`, `.dependencies`, `.projectType` below. In the previous GitHub source, `currentProj` was locally declared within this callback. Other similarly named declarations belong to other function scopes, not the callback. This is an unresolved identifier under TypeScript checking. **Immediate action:** restore `const currentProj = projectRef.current;` before computing `effectiveProjectId`; execute real `npx tsc --noEmit`, focused ESLint and `npm run build` with raw exit codes.

### S2 — P1 write-failure outcome ignored by navigation
**Source:** `src/App.tsx` diff hunks at previous lines ~2256, ~2473, ~2627; `src/services/webcontainer/fileSyncCoordinator.ts` flush return contract.

All three navigation paths call `await wc.flushFileSync()` but never examine the returned `FlushResult.ok`, `failed`, or `canceled`. A failed WebContainer write is therefore not an impediment to project detachment/attachment, contrary to the stabilization goal. Specify semantics explicitly: prevent unsafe transition and display a recoverable error when physical sync fails, or document and verify that IndexedDB persistence is authoritative and handle WebContainer sync failure by safe invalidation/remount without loss of source. Ensure error handling and restoration of UI busy flags.

### S3 — P1 late WebContainer events remain un-attributed
**Source:** `src/services/webcontainer/webcontainerService.ts`, diff hunks near previous 778/812/844/851; previous code accepts `server-ready` if current `isDevServerStartingState`/`isDevServerActive` indicates an expected server.

The new `port: open` handler clears an old draining record based on `isShellPromptReady`, but this does not establish the incoming event's actual process origin. Adversarial order: A server draining on 5173 -> attach B -> B starts -> old prompt observed -> delayed A `port: open` accepted and clears draining -> delayed A `server-ready` accepted as B. The new NEG-1 test **does not start B's server** before firing the stale event; therefore it only verifies a less dangerous idle case. Need a process-bound lifecycle/quiescence contract or explicit limitation/blocked verdict, and deterministic tests of stale events while B is actively starting, including missing/out-of-order close.

### S4 — P1 project mount loses identity across `await boot()`
**Source:** `src/services/webcontainer/webcontainerService.ts`, diff hunk at previous lines ~1037–1090.

Checks are added before `await this.boot()`, but the sequence then calls `await container.mount(tree)` without rechecking the project ID / epoch **after boot resolves**. A transition while boot is pending can cause an old project tree to mount into the newer project. NEG-4 delays *before entering* `mountProject`, not inside `boot()`, so it misses this race. Test a controlled deferred boot and confirm `mount` is not called after a scope switch. Return an explicit canceled/stale outcome that callers honor, rather than resolving `void` as if mounting succeeded.

### S5 — P1 file rename/delete fail-closed semantics are not integrated with editor UI
**Source:** New async `webcontainerService.renameFile()` / `deleteFile()` in the patch; previous `src/components/vscode/VSCodeMode.tsx` source at the remote feature baseline (this component is *not* changed in the uploaded patch).

`VSCodeMode` updates project state (`onRenameFile?.(...)` or `onDeleteFile?.(...)`) *before* invoking the WebContainer operation, and does not await or handle the newly rejected promises (`webcontainerService.renameFile(...)`, `void webcontainerService.deleteFile(...)`). Therefore the in-flight write timeout can reject while UI/IndexedDB changes already occurred; the intended fail-closed contract does not extend to the application. Test pending rename/delete write timeout from real editor UI and verify no unhandled promise rejections, missing files, or incorrect dirty state. Introduce an atomic/rollback or error-recovery strategy without breaking persistence.

### S6 — P1 project-open state is changed before an awaited runtime flush
**Source:** `src/App.tsx`, project-open hunk (prechange lines ~2460–2490).

The code writes `writeActiveProjectId(opened.id)` and updates React active project state before awaiting `loadWebContainerService` / `flushFileSync` and `attachProject`. On a failed or superseded asynchronous operation, the returned `false` does not necessarily restore the previous selection / busy state. Test failed flush, superseded open, and interrupted load. Sequence the transition or safely roll back previously applied state.

### S7 — P1 delete-project continuation can clear a newer selection
**Source:** `src/App.tsx`, project-delete hunk (prechange lines ~2594–2609).

After `deleteProjectRecord`, the callback checks that the **captured** `activeProjectId` matches the deleted ID, then awaits `loadWebContainerService()`; after the await it clears `setActiveProjectId(null)` and `setActiveProject(null)` without another current-transition check. If another selection opens while the import is pending, this stale delete continuation can clear the newer selection. Test A-delete followed immediately by B-open with deferred import and require B state to remain active.

### S8 — P2 negative tests do not cover the actual reported failure paths
**Source:** `scripts/test-phase2-2-stabilization-negative.mjs` in supplied patch.

NEG-5 reproduces a locally invented `mockAttach` transition function, not the actual App callback. NEG-6 launches an independent toy child program with `process.exit(1)`, not the actual Stage B.2.4 test harness under an injected failure. NEG-4 delays before the `mountProject` call, not at the `await boot` boundary. NEG-1 omits concurrent B startup. Assertions passing do not prove those integration races closed. The B.2.4 script's added `process.exit(1)` is an appropriate correction, but should be verified against that script itself under a controlled injected failure.

### S9 — P2 `FlushResult` may hide canceled paths and completed-write failures between transitions
**Source:** `src/services/webcontainer/fileSyncCoordinator.ts`, new `flush()` implementation.

`ok` is computed as `failed.length === 0`, even when `canceled` is non-empty. `lastWriteResults` is keyed only by path and cleared on flush; a prior project's outcomes can be conflated with the current project or lost on a previous flush. Whether cancellation should block switching depends on which storage is authoritative and needs explicit handling/tests. This does not independently prove data loss but prevents treating `ok` as a universal guarantee that all requested source changes reached WebContainer FS.

## Confirmed improvements
- `mountProject()` now has project ID / epoch validation at several stages and a fail-closed filesystem barrier check (incomplete across `await boot`).
- The coordinator now returns structured filesystem write outcomes rather than only swallowing exceptions.
- Rename and delete operations reject on unresolved in-flight writes instead of performing the raw mutation after timeout (but UI must handle rejection).
- Old test harness explicitly exits nonzero if its `failed` counter is positive.
- Prior FIFO eviction of `drainingPorts` was removed.

## Mandatory acceptance before next push
1. Fix S1 and publish raw TypeScript/build exit logs.
2. Add genuine integration tests for S2, S4, S5, S6, S7, not only test doubles unrelated to app functions.
3. Test S3 using delayed event origin while B starts; if event provenance is unavailable, document the risk honestly or use a safe controlled process barrier.
4. Verify `FlushResult` errors/cancellations and rename/delete failures are surfaced and resolved without data corruption.
5. Run existing WebContainer + React/Vue Chromium E2E, IndexedDB persistence, ZIP backup, routing, type, lint, build and bundling.
6. Produce a **new** diff and evidence; owner approval required before feature push, PR, merge, or any Production deployment.

## Evidence caveat
The original claimed 79/79 scenarios and build result are taken from the supplied agent report, not from raw external logs independently reproduced in this review. The uploaded patch is sufficient to identify the missing identifier and the code-path gaps. The only published GitHub source available prior to local push is the older `b97d7be` feature branch, not the new local `7912af0` commit.
