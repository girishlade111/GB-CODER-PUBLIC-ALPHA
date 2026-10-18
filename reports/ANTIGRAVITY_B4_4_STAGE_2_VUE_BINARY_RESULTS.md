# GB CODER — PHASE B.4.4 STAGE 2
## VUE BINARY DEPENDENCY RESTORATION FEASIBILITY REPORT

**Author:** Google Antigravity (Gemini)  
**Role:** Principal WebContainer Runtime Engineer, TypeScript Reliability Engineer, and Browser Performance Investigator  
**Date:** October 15, 2026  
**Status:** COMPLETE — EMPIRICAL FEASIBILITY ACHIEVED  
**Production Status:** STRICT HOLD (0 modifications to `src/`, no remote push, no production deployment)

---

## 1. MANDATED VERDICT

```text
VERDICT: B4_4_STAGE_2_VUE_FEASIBLE
```

### Executive Summary
1. **Empirical Feasibility Demonstrated for Vue 3:** Project-scoped binary dependency restoration into a fresh WebContainer runtime instance was **empirically validated** on the frozen Vue 3 synthetic fixture (`vue@3.5.13`, `vite@5.4.21`, lockfileVersion 3, 78 packages).
2. **Deterministic Binary Roundtrip:**
   - **Producer Observation (Observation 1):** Clean synthetic `npm ci` completed in **6,091 ms** (numeric exit code 0). WebContainer binary export produced a **37,562,426-byte** (~35.82 MiB) payload in **261.5 ms** (SHA-256: `2b1f943f1ffb563dec6bdeffdced8d6c33af173f04c0d401f825bb6246266acc`), comfortably within the 64 MiB admission ceiling. Memory overhead remained strictly bounded (+37.60 MiB page JS heap delta vs 128 MiB ceiling).
   - **Consumer Observation (Observation 2):** After producer retirement, a fresh WebContainer runtime instance was booted (generation 2, runtimeId 2). The binary artifact was safely cloned in **81.2 ms** and mounted in **449.4 ms** without running any npm install.
3. **Executable Permission Loss Replicated & Restored:**
   - As observed in React (Stage 1.2.2), post-mount inspection revealed that `node_modules/vite/bin/vite.js` lost its POSIX execute bit across binary mount: producer mode was `0o775` (`rwxrwxr-x`, `isExecutable: true`), while consumer post-mount mode was `0o644` (`rw-r--r--`, `isExecutable: false`).
   - A single, narrowly scoped `chmod +x node_modules/vite/bin/vite.js` via WebContainer's native `chmod` CLI restored mode to `0o755` (`rwxr-xr-x`, `isExecutable: true`) in **733.3 ms**.
   - Path validation confirmed the repair remained strictly within `node_modules/` with 0 modifications to source files.
4. **Original Unmodified Vue Dev Server & Real DOM Verification:**
   - The frozen package script `"dev": "vite --host 0.0.0.0 --port 5173 --strictPort"` was dispatched without alteration.
   - Vite dev server booted cleanly (`VITE v5.4.21 ready in 2348 ms`), port 5173 emitted a genuine `server-ready` event in **5,063 ms**, and Playwright verified the real Vue Preview DOM marker:
     ```text
     #marker === "B44_VUE_B"
     ```
     in **24,709 ms**.
5. **Strict Budget Compliance:**
   - Exactly 1 browser campaign start (`task-581`).
   - Exactly 2 WebContainer boots (1 producer + 1 consumer).
   - Exactly 0 automatic retries.
   - Exactly 0 npm install dispatches in the consumer (`installDispatchCount === 0`).
   - Tracked working tree 100% clean (`git diff HEAD` is empty; 0 modifications in `src/`).

---

## 2. PRECONDITIONS & GIT RECOVERY

| Parameter | Specification | Measured / Verified | Compliance |
| :--- | :--- | :--- | :--- |
| **Repository HEAD** | `30804ea3e3f94814b46b7a9934fb477f91354615` | `30804ea3e3f94814b46b7a9934fb477f91354615` | PASS |
| **Feature Branch** | `phase-2.2-webcontainer-reliability` | `phase-2.2-webcontainer-reliability` | PASS |
| **Tracked Working Tree** | Clean (`git diff HEAD` empty) | 0 modified tracked files | PASS |
| **Production Application Code** | Untouched (`src/` modifications: 0) | 0 modifications to `src/` | PASS |
| **Accepted B.4 Baseline** | B.4.1–B.4.3 & B.4.2a intact | All accepted modules preserved | PASS |
| **WebContainer API** | `@webcontainer/api@1.6.4` | Verified `1.6.4` | PASS |
| **Browser Environment** | Chromium (Playwright headless) | Chromium 151.0.7922.34 (precise memory enabled) | PASS |
| **Isolation Headers** | `COOP: same-origin`, `COEP: require-corp` | `crossOriginIsolated === true` | PASS |
| **Execution Budget** | Max 1 campaign, max 2 boots, 0 retries | Exactly 1 campaign, 2 boots, 0 retries | PASS |

---

## 3. HISTORICAL DISCREPANCY ACKNOWLEDGMENT & RECONCILIATION

In compliance with explicit owner instructions, the historical Stage 1.2.2 execution discrepancy was fully audited and documented prior to launching Stage 2:
- **`task-365`:** 1 React producer boot; clean npm install; aborted at permission diagnostics due to a multiline string escaping bug across `jsh` IPC; torn down cleanly (exit code 1).
- **`task-405`:** 2 React boots (producer + consumer); refactored diagnostic to `node_modules/.b4-4-diag.cjs`; verified binary mount and `chmod +x` restoration; validated real React DOM `B44_REACT_A` (exit code 0).
- **Accounting:** Total WebContainer boots across Stage 1.2.2 were **3 boots**. The published report `ANTIGRAVITY_B4_4_STAGE_1_2_2_EXECUTABLE_PERMISSIONS.md` accounted solely for `task-405`.
- **Reconciliation Status:** Fully acknowledged and formally ledgered in `reports/ANTIGRAVITY_B4_4_STAGE_2_VUE_BINARY_FEASIBILITY.md` and `reports/b4-4-stage2-vue.json` under verdict `B4_4_STAGE_2_VUE_BLOCKED`.
- **New Authorization:** The owner reviewed the reconciliation report and granted explicit, independent authorization for **exactly one new local Vue binary feasibility campaign** under a hard 2-boot budget.

---

## 4. OFFLINE PREFLIGHT & REGRESSION SUITE (97/97 PASS)

Before booting WebContainer, all 6 offline test suites were executed locally with 0 failures:

| Suite File | Tests | Passed | Failed | Purpose / Coverage |
| :--- | :--- | :--- | :--- | :--- |
| `stage0.mjs` | 41 | 41 | 0 | Baseline policy, admission limits, symlink traversal guards |
| `test-stage1-1.mjs` | 10 | 10 | 0 | Accounting and telemetry bounds |
| `test-stage1-2.mjs` | 10 | 10 | 0 | Binary buffer cloning & store lifecycle |
| `test-stage1-2-1.mjs` | 12 | 12 | 0 | Ownership reference validation & retirement isolation |
| `test-stage1-2-2.mjs` | 12 | 12 | 0 | Permission repair path validation & executable target resolution |
| `test-stage2-vue.mjs` | 12 | 12 | 0 | Diagnostic script syntax, Vue fixture integrity, key isolation, offline bundle build |
| **TOTAL** | **97** | **97** | **0** | **100% Passing Preflight Matrix** |

### Specific Preflight Guard Details
- **Diagnostic Script Syntax:** Verified that `DIAG_SCRIPT` parses cleanly via `new vm.Script()` and executes in a mock filesystem without escaping hazards.
- **Shell Argument Safety:** Audited `browser.mjs` to ensure all spawned processes use file paths on VFS rather than multiline string arguments.
- **Vue Fixture Identity:** Verified SHA-256 digests of `vue/package.json` (`82bb171c...`) and `vue/package-lock.json` (`e0a32ce6...`) against `fixtures.json`.
- **Key Isolation:** Verified that Vue B generates artifact key `1ceb1af7a982545c40cedab92fb8fd59069223a15171b2332fd449424bbc17a9`, strictly isolated from React A (`47b2...`).

---

## 5. EXPERIMENTAL HARNESS CONFIGURATION

Modifications were strictly confined to untracked `scripts/.tmp-b4-4/`:
1. **`browser.mjs`:**
   - Switched observation fixture target from `react` to `vue`.
   - Updated workdir naming to `gb-b4-4-vue-${role}`.
   - Updated package metadata validation to check `node_modules/vue/package.json` (`name === 'vue'`) and `node_modules/vite/package.json` (`name === 'vite'`).
   - Updated module resolution probe to require `vue` (`v.version === '3.5.13'`) and `vite` (`vt.version === '5.4.21'`).
   - Retained VFS-based diagnostic script (`node_modules/.b4-4-diag.cjs`) and scoped `chmod +x` CLI invocation.
2. **`run.mjs`:**
   - Configured ledger output path to `reports/b4-4-stage2-vue-results.json`.
   - Added `test-stage2-vue.mjs` to source identity ledger.
   - Updated observation labels and console outputs to `Vue B`.
   - Set status outcomes to `B4_4_STAGE_2_VUE_FEASIBLE` and `B4_4_STAGE_2_VUE_FAIL`.
3. **`test-stage2-vue.mjs`:**
   - Created standalone offline test suite containing 12 deterministic preflight tests.

---

## 6. PRODUCER VUE OBSERVATION (OBSERVATION 1)

| Step / Metric | Value | Reference / Criteria | Status |
| :--- | :--- | :--- | :--- |
| **Runtime Boot** | 12,413.9 ms | Clean WebContainer boot (`coep: require-corp`) | PASS |
| **Workdir** | `/home/gb-b4-4-vue-producer` | Fresh producer workdir | PASS |
| **Source Integrity** | 8 files mounted | Exact match against `fixtures.json` Vue definition | PASS |
| **Cross-Project Isolation** | `project-react.txt` throws `ENOENT` | Zero contamination from React fixture | PASS |
| **Compatibility Check** | Node 22.22.3, npm 10.8.2 | WebContainer Linux x64 ABI 127 | PASS |
| **Lockfile Verification** | `e0a32ce6...` (78 packages) | Exact SHA-256 match, 0 modifications | PASS |
| **Synthetic Install** | **6,091 ms** | `npm ci --ignore-scripts ...` -> added 28 packages | PASS |
| **Numeric Exit Code** | **`0`** | Must equal 0 | PASS |
| **Byte Probe Write** | 1,024 bytes generated | SHA-256: `785b0751fc2c53dc14a4ce3d800e69ef9ce1009eb327ccf458afe09c242c26c9` | PASS |
| **Symlink Probe Write** | `node_modules/.b4-4-internal-link` | Internal relative symlink to byte probe | PASS |
| **Diagnostic Script** | `node_modules/.b4-4-diag.cjs` | Mode `0o775`, `isExecutable: true` | PASS |
| **Binary Export Time** | **261.5 ms** | `wc.export('node_modules', {format: 'binary'})` | PASS |
| **Payload Byte Size** | **37,562,426 bytes** (~35.82 MiB) | ≤ 64 MiB admission ceiling (67,108,864 bytes) | PASS |
| **Binary Digest** | `2b1f943f1ffb563dec6bdeffdced8d6c33af173f04c0d401f825bb6246266acc` | SHA-256 computed in 120.1 ms | PASS |
| **Total Capture Time** | **381.9 ms** | ≤ 10,000 ms capture ceiling | PASS |
| **Page JS Heap Delta** | +37,595,338 bytes (+35.85 MiB) | ≤ 128 MiB admission ceiling | PASS |
| **Store Publication** | Published | Key: `1ceb1af7a982545c40cedab92fb8fd59069223a15171b2332fd449424bbc17a9` | PASS |
| **Producer Teardown** | Completed cleanly | `wc.teardown()`, memory released | PASS |
| **Producer Total Time** | **24,866 ms** | Single boot budget respected | PASS |

---

## 7. CONSUMER VUE OBSERVATION (OBSERVATION 2)

| Step / Metric | Value | Reference / Criteria | Status |
| :--- | :--- | :--- | :--- |
| **Runtime Boot** | 4,813.4 ms | Fresh WebContainer boot (`coep: require-corp`) | PASS |
| **Workdir** | `/home/gb-b4-4-vue-consumer` | Distinct consumer workdir | PASS |
| **Runtime Generation** | Epoch 2, Generation 2, RuntimeId 2 | Verified distinct from Producer (RuntimeId 1) | PASS |
| **Source Integrity** | 8 files mounted | Exact match against `fixtures.json` Vue definition | PASS |
| **Cross-Project Isolation** | `project-react.txt` throws `ENOENT` | Zero contamination from React fixture | PASS |
| **Pre-Restore Validation** | 105.7 ms | Verified `node_modules` absent (`ENOENT`) | PASS |
| **Payload Cloning** | **81.2 ms** | `cloneBinary()` produces separate ArrayBuffer | PASS |
| **Binary Mount Time** | **449.4 ms** | `wc.mount(payloadCopy, {mountPoint: 'node_modules'})` | PASS |
| **Restored Top-Level Items**| 24 entries | Directory populated without npm install | PASS |
| **Restored Byte Probe** | SHA-256 matches `785b0751...` | Exact bitwise equality verified | PASS |
| **Restored Symlink Probe**| Reads byte probe data cleanly | Internal relative symlink preserved | PASS |
| **Package Metadata** | `vue` 3.5.13 & `vite` 5.4.21 | `package.json` manifests validated in VFS | PASS |
| **Post-Restore Validation**| 15.3 ms | Completed within 15,000 ms ceiling | PASS |
| **Total Restore Duration** | **654.3 ms** | Pre-validation + Clone + Mount + Post-validation | PASS |
| **npm install dispatched** | **0 commands** | `clean-install` dispatched in consumer: 0 | PASS |

---

## 8. PRODUCER VS CONSUMER PERMISSION COMPARISON & RESTORATION

Diagnostic utility (`node_modules/.b4-4-diag.cjs`) measured modes at three points:

| Property | Producer (Post-Install) | Consumer (Post-Mount, Pre-Correction) | Consumer (Post-Correction) |
| :--- | :--- | :--- | :--- |
| **`.bin/vite` Exists** | `true` | `true` | `true` |
| **`.bin/vite` Type** | Symlink (`lstat.isSymbolicLink()`) | Symlink (`lstat.isSymbolicLink()`) | Symlink (`lstat.isSymbolicLink()`) |
| **`.bin/vite` Symlink Mode** | `0o777` | `0o777` | `0o777` |
| **`.bin/vite` Target String** | `../vite/bin/vite.js` | `../vite/bin/vite.js` | `../vite/bin/vite.js` |
| **Target File Path** | `node_modules/vite/bin/vite.js` | `node_modules/vite/bin/vite.js` | `node_modules/vite/bin/vite.js` |
| **Target File Exists** | `true` | `true` | `true` |
| **Target File `stat.mode`** | **`0o775`** (`rwxrwxr-x`) | **`0o644`** (`rw-r--r--`) | **`0o755`** (`rwxr-xr-x`) |
| **Target File `isExecutable`**| **`true`** | **`false`** | **`true`** |

### Permission Repair Details
- **Loss Confirmed:** WebContainer binary export/mount strips execute bits (`0o111`) on synthetic Vue dependencies identically to React dependencies.
- **Target Resolution:** `resolveExecutableTarget('node_modules/.bin/vite', '../vite/bin/vite.js')` evaluated to `node_modules/vite/bin/vite.js`.
- **Repair Path Validation:** `validatePermissionRepairPath('node_modules/vite/bin/vite.js')` verified the path is strictly within `node_modules/`.
- **Execution:** Invoked `wc.spawn('chmod', ['+x', 'node_modules/vite/bin/vite.js'])`. Numeric exit code `0` in **733.3 ms**.
- **Mode Recovery:** Post-correction mode verified as `0o755` (`isExecutable === true`).

---

## 9. VUE DEV SERVER & REAL DOM VERIFICATION

| Verification Step | Command / Event | Result / Observation | Status |
| :--- | :--- | :--- | :--- |
| **Dependency Resolution** | `node -e "const v=require('vue');...const vt=require('vite/package.json');..."` | `3.5.13` and `5.4.21` emitted, exit code 0 (2,058 ms) | PASS |
| **Vite Executable Direct** | `node node_modules/vite/bin/vite.js --version` | `vite/5.4.21 linux-x64 node-v22.22.3`, exit code 0 (2,829 ms) | PASS |
| **Original Script Dispatch**| `npm run dev` | `"vite --host 0.0.0.0 --port 5173 --strictPort"` (unmodified) | PASS |
| **Vite Terminal Ready** | Terminal stdout | `VITE v5.4.21 ready in 2348 ms` | PASS |
| **Server-Ready Event** | WebContainer `server-ready` on port 5173 | URL: `https://7i8ck62dj7zha0527l160fl0v33w0d-iedw-udwjb7wa--5173--2ed8f36d.local-corp.webcontainer-api.io` | PASS |
| **Server Ready Time** | Emitted from dev invoke | **5,063 ms** | PASS |
| **Iframe Preview Binding** | `iframe.src = serverUrl` | Preview frame attached to WebContainer local URL | PASS |
| **Real DOM Resolution** | Frame `#marker` locator | Text matched: **`B44_VUE_B`** in **24,709 ms** | PASS |
| **Uncaught Page Errors** | `page.on('pageerror')` | Exactly 0 errors | PASS |
| **Console Errors** | `page.on('console', error)` | Exactly 0 errors | PASS |
| **Consumer Total Time** | Observation 2 completion | **24,719 ms** | PASS |

---

## 10. REACT VS VUE FEASIBILITY COMPARISON (DESCRIPTIVE)

> [!NOTE]
> This comparison is descriptive of two isolated standalone feasibility samples under synthetic fixtures. It does not represent statistically sampled production benchmarks or claim production speedups.

| Metric | React A Feasibility Sample (Stage 1.2.2) | Vue B Feasibility Sample (Stage 2) | Observation |
| :--- | :--- | :--- | :--- |
| **Package Count** | 64 packages | 78 packages | Vue includes Vue compiler/runtime dependencies |
| **Producer Install Time** | 6,054 ms | 6,091 ms | Clean `npm ci` duration comparable in WebContainer |
| **Binary Payload Size** | 17,476,013 bytes (~16.66 MiB) | 37,562,426 bytes (~35.82 MiB) | Vue binary payload ~2.1x larger; well under 64 MiB limit |
| **Binary Export Time** | 344 ms | 261.5 ms | Sub-second export across both frameworks |
| **Binary Hashing Time** | 60 ms | 120.1 ms | Fast SHA-256 calculation |
| **Binary Clone Time** | 38 ms | 81.2 ms | Proportional to payload size |
| **Binary Mount Time** | 225 ms | 449.4 ms | Proportional to payload size; sub-half-second |
| **Permission Loss** | `0o775` -> `0o644` (`isExecutable: false`)| `0o775` -> `0o644` (`isExecutable: false`) | **Identical runtime behavior confirmed across frameworks** |
| **Scoped `chmod` Time** | 1,029.9 ms | 733.3 ms | Native `chmod` CLI consistently effective |
| **Vite Ready Time** | 1,924 ms | 2,348 ms | Dev server boots cleanly after permission repair |
| **Server-Ready Event** | 4,008 ms | 5,063 ms | WebContainer local port proxy binds cleanly |
| **Real DOM Verified** | `#marker === "B44_REACT_A"` (33.6s) | `#marker === "B44_VUE_B"` (24.7s) | **Real Preview DOM rendering confirmed in both** |
| **Consumer npm install**| 0 commands | 0 commands | Clean dependency reuse without network install |

---

## 11. REMAINING TECHNICAL LIMITATIONS & SCOPE BOUNDARIES

While Stage 2 proves that binary restoration with scoped chmod is feasible across both React and Vue 3 synthetic projects, significant architectural boundaries remain:

1. **Non-Persistent Scope:** The binary artifact is retained strictly in-memory within the active browser session (`BinaryMemoryStore`) with a 10-minute TTL. No storage in IndexedDB, Cache Storage, or Service Workers was tested or authorized.
2. **Permission Loss Mechanism:** WebContainer's virtual filesystem binary serialization consistently strips POSIX execute bits (`0o111`) from symlink targets. While `chmod +x` CLI resolves this for single binaries (`node_modules/vite/bin/vite.js`), arbitrary multi-binary or nested CLI packages would require deterministic discovery of all executable bin targets.
3. **Synthetic vs Production Workloads:** These tests were conducted on controlled, synthetic fixtures (64 and 78 packages). Production workloads in GB Coder typically include heavier dependency trees (Tailwind, TypeScript, Monaco, PostCSS, ESLint, React Router, UI components) which may approach or exceed the 64 MiB payload ceiling.
4. **Standalone Harness Isolation:** No caching logic, storage hooks, or restoration hooks are integrated into GB Coder application source. The production startup architecture remains the accepted clean-install pipeline.

---

## 12. EVIDENCE LEDGER & FILE IDENTITY

### 12.1 Ledger File
The machine-readable evidence ledger for this campaign is persisted at:
[`reports/b4-4-stage2-vue-results.json`](file:///c:/Users/Girish%20Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-4-stage2-vue-results.json)

### 12.2 File Identity Matrix

| File Path | SHA-256 Digest | Role in Experiment |
| :--- | :--- | :--- |
| `scripts/.tmp-b4-4/policy.mjs` | `044622a796cd19587b7a12950fce5a0ffaf71994b653bb52c8282bd93d105b82` | Policy, bounds, memory store, path validators |
| `scripts/.tmp-b4-4/browser.mjs` | `8bb082a3398c6abbeeb151b66a478a89bb9445c952df1b10651bea03b6272b42` | WebContainer harness with Vue support |
| `scripts/.tmp-b4-4/run.mjs` | `c8f30f6a9762cf12c5379e9d79828decda28dcd9d13ccf838efc939a58b30845` | Playwright test runner & telemetry collector |
| `scripts/.tmp-b4-4/fixtures.json` | `b20447d0a8b754938271826e3d75150d0db49d2c38bf924b35d70d44036e683a` | Synthetic React and Vue locked fixtures |
| `scripts/.tmp-b4-4/test-stage1-1.mjs` | `4d9c2e650f243ea5c3c6642749556ed6cf8094b97c2cfa4b1850c53d96a8e57f` | Offline accounting tests (10/10 PASS) |
| `scripts/.tmp-b4-4/test-stage1-2.mjs` | `d74835ea76de29f2e9255115ff3f1ec2bc9d0819ce73b956447d8cb9e69070ee` | Offline binary buffer tests (10/10 PASS) |
| `scripts/.tmp-b4-4/test-stage1-2-1.mjs` | `b80cae69dca5ddd10b625841bc57ae918409981e5a0ef48daf94841ec5c923b5` | Offline ownership tests (12/12 PASS) |
| `scripts/.tmp-b4-4/test-stage1-2-2.mjs` | `95264251ffa5eb1436c0cd5511392f3ab2cbdce4694b1f1bfe2d04ac58827ad7` | Offline permission tests (12/12 PASS) |
| `scripts/.tmp-b4-4/test-stage2-vue.mjs` | `a6d6a134199d99bbf995829e4e40b2adc01bcbba48e7a1c873886ff4852cec9e` | Offline Vue preflight tests (12/12 PASS) |
| `scripts/.tmp-b4-4/vue/package.json` | `82bb171c0deb4422bf7a259b2497127d06f8213fa25bec2fcfd464e53e404b7a` | Locked Vue package manifest |
| `scripts/.tmp-b4-4/vue/package-lock.json`| `e0a32ce64578f02feea91775c0b9d56b8cae869dd41424e1b096954fa8d9bedb` | Locked Vue dependency lockfile |

---

## 13. FEASIBILITY RECOMMENDATION & CONCLUSION

1. **Standalone Portability Feasibility Proved:** The Phase B.4.4 experimental track has successfully proven that WebContainer binary dependency export and mount is portable across distinct project templates (React A and Vue B) when paired with scoped POSIX permission repair (`chmod +x`).
2. **Accepted Clean-Install Baseline Remains Authoritative:** The GB Coder application continues to utilize its committed, verified, and accepted clean-installation startup architecture.
3. **No Further Automatic Progression:** In accordance with Section 16 ("Final Stop Condition"), all experimental execution has completed. No background tasks remain active, no persistence mechanisms have been created, and no product code has been altered.

```text
STATUS: ALL STAGE 2 OBJECTIVES ACHIEVED — AWAITING OWNER REVIEW
```
