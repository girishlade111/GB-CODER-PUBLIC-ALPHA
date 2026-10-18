# GB CODER — PHASE 2.2, STAGE B.2.2
## Independent Hardened Implementation Review, Fail-Closed Safety Audit & Preview Gate Report

**Role:** Independent Principal TypeScript/React Reviewer, WebContainer Runtime Engineer, Concurrency Auditor and Release Safety Engineer  
**Product:** GB Coder by LadeStack  
**Repository:** `girishlade111/GB-CODER-PUBLIC-ALPHA`  
**Working Directory:** `C:\Users\Girish Lade\OneDrive\Desktop\GB-CODER-PUBLIC-ALPHA`  
**Active Feature Branch:** `phase-2.2-webcontainer-reliability`  
**Target Hardened Commit:** `3cd0334fbc3b17b4c559826068ec1c7350d1c323`  
**Remote Feature Branch HEAD:** `b97d7be81ae657df41de1dafeac54e7ff4af947a`  
**Base Main SHA:** `1b954486e292436794b0764638ea454bb78fae11`  
**Existing Vercel Preview:** `https://gb-coder-public-alpha-6cj5hbxfk.vercel.app` (`dpl_B67eXUEqAqMqMUsphAHm4vy3s7tc`)  
**Production URL:** `https://code.ladestack.in`  
**Report Date:** 2026-10-14  

---

## 1. Executive Summary & Verdict

In accordance with the Stage B.2.2 mandate, an independent, adversarial, evidence-based review was conducted on the Stage B.2.1 hardened commit (`3cd0334`). Rather than accepting previous implementation claims at face value, this review subjected the actual source changes to rigorous static inspection and 12 deterministic negative concurrency tests.

While the Stage B.2.1 changes successfully addressed several primary race conditions (such as basic debounced write remapping and in-flight barrier polling), the review revealed two critical, blocking reliability defects:

1. **Non-Fail-Closed Filesystem Barrier (`webcontainerService.ts:1005`):**
   `await this.fileSyncCoordinator.barrier()` returns `false` on timeout, but `mountProject()` ignores the boolean return value and proceeds with `container.mount(tree)`. This directly violates the mandatory safety rule requiring fail-closed semantics when old writes fail to settle.
2. **Permanent Port Poisoning on Reused Ports (`webcontainerService.ts:764-773`):**
   The `drainingPorts` map retains ports from prior projects indefinitely until an asynchronous `port close` event is received. If an old process terminates without emitting a container `port close` event (or before it arrives), the reused port is permanently blocked, causing legitimate new dev servers on that port to be discarded. This was confirmed by Scenario 12 in the deterministic test suite.

### Local Review Verdict

```
======================================================================
                     B22_LOCAL_REVIEW_FAILED
======================================================================
```

### Stage B.2.2 Final Gate Verdict

```
======================================================================
                PHASE_2_2_STAGE_B_2_2_BLOCKED
======================================================================
```

**Remote Push Status:** **HALTED (Zero Remote Operations Executed).**  
In strict compliance with the Gate F release safety rules ("If FAIL or INCONCLUSIVE, stop immediately before the push"), no Git push was performed. The remote GitHub branch remains at `b97d7be81ae657df41de1dafeac54e7ff4af947a`.

---

## 2. Gate A — Repository & Remote Safety Verification

The repository identity and commit graph were independently verified prior to inspection:

1. **Repository Root:** `C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA`
2. **Origin Remote:** `git@github.com:girishlade111/GB-CODER-PUBLIC-ALPHA.git`
3. **Active Branch:** `phase-2.2-webcontainer-reliability`
4. **Local HEAD SHA:** `3cd0334fbc3b17b4c559826068ec1c7350d1c323`
5. **Origin Main SHA:** `1b954486e292436794b0764638ea454bb78fae11`
6. **Remote Feature Branch SHA:** `b97d7be81ae657df41de1dafeac54e7ff4af947a`
7. **Commit Ancestry:**
   ```
   * 3cd0334 (HEAD -> phase-2.2-webcontainer-reliability) fix(webcontainer): harden server event epoch tracking, in-flight write barrier, and transition coordination
   * b97d7be (origin/phase-2.2-webcontainer-reliability) fix(webcontainer): implement project-scoped lifecycle, debounced sync coordinator and strict root manifest detection
   * 1b95448 (origin/main, origin/HEAD, main) Create SECURITY.md
   ```
   Ancestry is strictly linear.
8. **Working Tree State:** Clean (0 staged, 0 unstaged tracked modifications).
9. **Outgoing Changes (`b97d7be..3cd0334`):**
   - `src/App.tsx` (+5 lines)
   - `src/services/webcontainer/fileSyncCoordinator.ts` (+52, -8 lines)
   - `src/services/webcontainer/webcontainerService.ts` (+123 lines)
   - `scripts/test-phase2-2-stage-b21-hardened.mjs` (+306 lines)
   - `scripts/test-phase2-2-stage-b21-repro.mjs` (+193 lines)
10. **Secret & Key Scan:** Confirmed 0 secrets, credentials, or unrelated tokens in the commit diff.

---

## 3. Gate B — Technical Audit of Hardened Implementation

### B1 — Server Event Ownership & Port Drain
- **File:** `src/services/webcontainer/webcontainerService.ts` (Lines 764–805)
- **Mechanism:** `drainingPorts: Map<number, { projectId: string | null; sessionEpoch: number }>` tracks active servers during teardown.
- **Critical Limitation & Defect:**
  1. WebContainer container events (`server-ready` and `port`) deliver only `(port: number, url: string)` and do not include a process identifier (PID) or command handle. Event provenance cannot be deduced from the event payload itself.
  2. The `drainingPorts` map is only cleared when `container.on('port', (port, type) => { if (type === 'close') this.drainingPorts.delete(port); })` fires (line 844).
  3. If a Vite process is killed via Ctrl+C (`\x03\r`), WebContainer may not emit a `port close` event if the socket was already dropped or reused before the event fired.
  4. If the new project starts a dev server that attempts to bind the same port (e.g. 5173), line 765 checks:
     ```ts
     const draining = this.drainingPorts.get(port);
     if (draining) {
       if (draining.sessionEpoch !== this.sessionEpoch || draining.projectId !== this.activeProjectId) {
         console.warn(`[WebContainer] Discarded late server-ready at port ${port}...`);
         return;
       }
     }
     ```
     Because `draining.projectId !== this.activeProjectId`, the legitimate new project's server is permanently discarded.
  5. Furthermore, if project A was in `startupStage === 'starting_server'` when the user switched to project B, port 5173 was not yet in `activeServers` and therefore never entered `drainingPorts`. If project B also starts a dev server (`isDevServerStartingState = true`), project A's late `server-ready` arrives, satisfies `isExpected` at line 776, and binds project A's dev server to project B.

### B2 — Filesystem Barrier & Fail-Closed Safety
- **File:** `src/services/webcontainer/webcontainerService.ts` (Lines 1004–1006)
- **Code:**
  ```ts
  // Barrier: ensure any in-flight writes have settled before mounting files
  await this.fileSyncCoordinator.barrier();
  ```
- **Critical Violation of Mandatory Safety Rule:**
  1. `barrier(timeoutMs = 5000)` returns `false` if `inFlightPaths.size > 0` after 5000ms.
  2. `mountProject()` does not inspect the boolean return value. It does not `throw` or abort.
  3. Consequently, if a write is delayed or stuck in I/O, `mountProject()` proceeds to mount files over an active, unsettled filesystem.
  4. If the stuck write resolves after 5001ms, it writes to disk after the new project's files were mounted, causing cross-project filesystem pollution.

### B3 — Navigation Transition Coordination
- **File:** `src/App.tsx` (Lines 2251–2265, 2475–2480, 2629–2635)
- **Findings:**
  - Transition identity guards (`if (!isCurrentTransition(transition)) return;`) prevent stale asynchronous resolutions from re-attaching superseded projects.
  - However, `TerminalTab` lifecycle is partially decoupled: if terminal auto-execution starts before the asynchronous `attachProject` promise resolves, terminal commands could execute in an unattached or transitional state.

### B4 — Rename and Delete Safety
- **File:** `src/services/webcontainer/fileSyncCoordinator.ts` (Lines 198–236)
- **Findings:**
  - `handleRename` successfully remaps descendant writes via prefix matching (`oldPrefix = cleanOld + '/'`).
  - `handleDelete` awaits in-flight writes on the path or descendants before invoking `rawDelete`.
  - Limitation: If `rawDelete` throws an unhandled virtual filesystem error, no rollback mechanism restores the deleted pending writes.

### B5 — Process Termination Quiescence
- **File:** `src/services/webcontainer/webcontainerService.ts` (Lines 665–689)
- **Findings:**
  - `stopDevServer()` sends `\x03\r` to `shellWriter`.
  - It does not and cannot await PTY confirmation or process exit because `@webcontainer/api` does not expose an exit promise for terminal inputs.
  - Quiescence cannot be proven synchronously; an explicit startup barrier and epoch validation on process start is required.

---

## 4. Gate C — Deterministic Negative Test Results

Harness: [`scripts/test-phase2-2-stage-b22-deterministic.mjs`](file:///c:/Users/Girish%20Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/scripts/test-phase2-2-stage-b22-deterministic.mjs)

| Scenario # | Scenario Description | Expected Invariant | Actual Outcome | Verdict | Mock / Real |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **1** | Write never settles before barrier timeout | Barrier times out; mount fails closed | Barrier returns `false`, but `mountProject` does not throw or abort | **FAIL** (Safety Defect) | Mocked Coordinator |
| **2** | Slow in-flight write with concurrent mount | Barrier awaits in-flight write before scope change | Barrier held scope until in-flight write completed (80ms) | **PASS** | Mocked Coordinator |
| **3** | Write failure during flush | Virtual disk write error caught cleanly; inFlight cleared | Error caught, inFlight cleared, no crash | **PASS** | Mocked Coordinator |
| **4** | Late server-ready from former project | Server-ready for former project discarded | Discarded when new project is idle; race if new project also starting | **PASS** (Partial) | Mocked Container |
| **5** | Late port-close from draining former project | Late close cleans draining set without mutating new project server | Port 5173 closed cleanly; Project B server on 3000 untouched | **PASS** | Mocked Container |
| **6** | Reuse of same port by A and B (with clean close) | Drained port rebound to Project B after close event | Port rebound to Project B with clean ownership | **PASS** | Mocked Container |
| **7** | A -> B -> C attachment completion out of order | Superseded transitions dropped; only C attaches | Transitions A and B aborted; only C attached | **PASS** | Deterministic Promise |
| **8** | Terminal startup racing delayed attachment | Terminal execution blocked until `activeProjectId` exists | Blocked until attachment resolved | **PASS** | State Guard |
| **9** | Directory rename with pending child writes | Queued child writes remapped to new directory prefix | Remapped `src/components/*` -> `src/ui/*` before write | **PASS** | Mocked Coordinator |
| **10** | Directory deletion with in-flight child write | `handleDelete` awaits child write settlement before raw delete | Awaited 60ms write before `rawDelete` executed | **PASS** | Mocked Coordinator |
| **11** | Stale npm startup after project change | Stale npm command aborted by project identity check | Project check aborted stale npm runner | **PASS** | State Guard |
| **12** | Legitimate React/Vue startup after normal transition | New project dev server on port 5173 transitions to `ready` | **FAILED:** Port 5173 remained in `drainingPorts`, legitimate server discarded | **FAIL** (Blocker) | Mocked Container |

**Deterministic Negative Test Summary:** **10 PASS, 2 FAIL**

---

## 5. Gate D — Full Regression & Task Log Reconciliation

Task logs from previous runs were audited and reconciled:

- **TypeScript Compilation:** Exit Code 0 (0 errors).
- **Targeted ESLint Check:** Exit Code 0 (0 errors, 1 pre-existing warning).
- **Vercel Deploy Configuration (`verify:deploy`):** 12/12 functions, strict COOP/COEP headers verified.
- **Unified Build (`npm run build`):** Built deterministically in 48.15s (dist integrity verified).
- **Bundle Budget (`verify:bundle`):** 594.0 kB JS (< 600 kB limit), 188.0 kB gzip (< 190 kB limit).
- **WebContainer Full E2E (`scripts/e2e-webcontainer-full.mjs`):** 7/7 checks passed in Chromium when ports were not reused.

---

## 6. Gate E — Data & Source Compatibility Assessment

The current diff does not introduce:
- IndexedDB schema changes (schema remains v1).
- Canonical URL regressions.
- Package manifest regressions for static/manifest-less projects.
- Service Worker caching scope changes.

However, the confirmed bugs in B1 and B2 represent data safety and reliability defects under rapid project switching and port reuse.

---

## 7. Smallest Necessary Corrective Patch (Pending Owner Authorization)

To achieve full fail-closed safety and eliminate the port-drain lockup, the following minimal patch is required:

### 1. Enforce Fail-Closed Semantics in `mountProject`
In `src/services/webcontainer/webcontainerService.ts`:
```diff
@@ -1004,3 +1004,15 @@ class WebContainerManager {
-      await this.fileSyncCoordinator.barrier();
+      const settled = await this.fileSyncCoordinator.barrier();
+      if (!settled) {
+        const errMsg = 'WebContainer filesystem barrier timeout: previous writes failed to settle';
+        console.error(`[WebContainer] ${errMsg}`);
+        this.setStartupStage('error', {
+          phase: 'mount',
+          message: errMsg,
+          timestamp: Date.now(),
+          recoverable: true,
+          retryAction: 'reboot_container',
+        });
+        throw new Error(errMsg);
+      }
```

### 2. Evict Stale Draining Ports on Dev Server Start
In `src/services/webcontainer/webcontainerService.ts`:
```diff
@@ -642,6 +642,10 @@ class WebContainerManager {
   public setDevServerStarting(starting: boolean, epoch?: number, projectId?: string): void {
     this.isDevServerStartingState = starting;
     if (starting) {
+      // Clear draining ports when starting a new dev server cycle for a project
+      this.drainingPorts.clear();
       this.devServerStartEpoch = epoch ?? this.sessionEpoch;
       this.devServerStartProjectId = projectId ?? this.activeProjectId;
       this.updateState({ startupStage: 'starting_server' });
```

---

## 8. Final Stop & Non-Push Confirmation

- **Push Authorized:** NO (Mandatory gates did not pass).
- **GitHub Push Executed:** NONE.
- **Remote Branch:** Unchanged at `b97d7be81ae657df41de1dafeac54e7ff4af947a`.
- **Vercel Preview:** Unchanged at `https://gb-coder-public-alpha-6cj5hbxfk.vercel.app`.
- **Production:** Unchanged and isolated at `https://code.ladestack.in`.
- **Next Step:** Awaiting owner authorization to apply the minimal corrective patch and re-verify Gate C before any remote push.
