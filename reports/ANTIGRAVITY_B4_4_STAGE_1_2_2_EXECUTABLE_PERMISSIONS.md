# GB CODER — PHASE B.4.4 STAGE 1.2.2
## BINARY RESTORATION EXECUTABLE PERMISSION DIAGNOSTICS & RESTORATION REPORT

**Author:** Google Antigravity (Gemini)  
**Role:** Principal WebContainer Runtime Engineer, Node.js Filesystem Compatibility Specialist, and Browser Reliability Engineer  
**Date:** October 15, 2026  
**Status:** COMPLETE — EMPIRICAL VERIFICATION ACHIEVED  
**Production Status:** STRICT HOLD (0 modifications to `src/`, no remote push, no production deployment)

---

## 1. MANDATED VERDICT

```text
VERDICT: B4_4_EXECUTABLE_RESTORATION_PASS
```

### Executive Summary
1. **Root Cause Confirmed:** The Stage 1.2.1 `jsh: spawn vite EACCES` failure was **empirically proven** to stem from lost POSIX execute bits (`0o111`) across `@webcontainer/api@1.6.4` binary export/mount.
   - Producer clean install mode: `0o775` (`rwxrwxr-x`, `isExecutable: true`).
   - Consumer post-mount mode: `0o644` (`rw-r--r--`, `isExecutable: false`).
2. **`chmod` Support Proved:** WebContainer's runtime environment natively supports the `chmod` binary. Invoking `chmod +x node_modules/vite/bin/vite.js` via `wc.spawn()` succeeded with numeric exit code `0` in **1,029.9 ms**.
3. **Scoped Correction Effective:** Post-correction diagnostics verified `node_modules/vite/bin/vite.js` restored mode to `0o755` (`isExecutable: true`). The target was strictly bounded to `node_modules/` via `resolveExecutableTarget` and `validatePermissionRepairPath`, preventing any directory traversal or modification of project source files.
4. **Normal Unchanged `npm run dev` Succeeded:** The frozen package script (`"dev": "vite --host 0.0.0.0 --port 5173 --strictPort"`) was dispatched without modification. Vite dev server booted cleanly (`VITE v5.4.21 ready in 1924 ms`), port 5173 was bound, genuine `server-ready` event fired, and Playwright validated the real React DOM marker:
   ```text
   #marker === "B44_REACT_A"
   ```
5. **Campaign Boundedness:** Exactly 2 WebContainer boots, 0 retries, 0 application modifications, 85/85 passing offline tests, tracked working tree 100% clean.

---

## 2. ENVIRONMENT & PRECONDITIONS

| Parameter | Specification | Measured / Verified | Compliance |
| :--- | :--- | :--- | :--- |
| **Repository HEAD** | `30804ea3e3f94814b46b7a9934fb477f91354615` | `30804ea3e3f94814b46b7a9934fb477f91354615` | PASS |
| **Feature Branch** | `phase-2.2-webcontainer-reliability` | `phase-2.2-webcontainer-reliability` | PASS |
| **Tracked Working Tree** | Clean (`git diff HEAD` empty) | 0 modified tracked files | PASS |
| **WebContainer API** | `@webcontainer/api@1.6.4` | `1.6.4` | PASS |
| **Browser Environment** | Chromium (Playwright headless) | Chromium 141.0.7390.37 (precise memory enabled) | PASS |
| **Isolation Headers** | `COOP: same-origin`, `COEP: require-corp` | `crossOriginIsolated === true` | PASS |
| **Boots Budget** | Maximum 2 WebContainer boots | Exactly 2 boots executed | PASS |
| **Retries Budget** | 0 automatic retries | 0 retries executed | PASS |
| **Evidence Ledger** | `reports/b4-4-stage1-2-2.json` | Valid JSON (1,404 lines, 48.8 KB) | PASS |

---

## 3. HARNESS & OFFLINE REGRESSION SUITE

### 3.1 Harness Modifications (Confined to `scripts/.tmp-b4-4/`)
- **`policy.mjs`:** Added `resolveExecutableTarget(symlinkPath, target, dependencyRoot)` and `validatePermissionRepairPath(targetPath, dependencyRoot)` to deterministically resolve symlinks and enforce that permission corrections cannot escape `node_modules/`.
- **`browser.mjs`:**
  - Added embedded diagnostic utility written to `node_modules/.b4-4-diag.cjs` for filesystem inspection without shell argument escaping hazards.
  - Added producer diagnostic step recording `.bin/vite` and target modes.
  - Added consumer pre-correction diagnostic step and comparison matrix.
  - Added conditional scoped permission correction via `test-chmod-cli` (`chmod +x <verifiedTarget>`) with fallback to Node `fs.chmodSync`.
  - Added consumer post-correction diagnostic step verifying `isExecutable === true`.
- **`run.mjs`:**
  - Configured output to `reports/b4-4-stage1-2-2.json`.
  - Updated `sourcePaths` and identity hashing to include `test-stage1-2-2.mjs`.
  - Configured verdict mappings: `B4_4_EXECUTABLE_RESTORATION_PASS` / `B4_4_EXECUTABLE_RESTORATION_FAIL`.

### 3.2 Offline Test Matrix (85/85 PASS)
All offline test suites were executed and verified with 0 failures:
- **`stage0.mjs`:** 41/41 PASS (baseline reference policy).
- **`test-stage1-1.mjs`:** 10/10 PASS (accounting & telemetry bounds).
- **`test-stage1-2.mjs`:** 10/10 PASS (binary buffer cloning & store lifecycle).
- **`test-stage1-2-1.mjs`:** 12/12 PASS (ownership reference fix).
- **`test-stage1-2-2.mjs`:** 12/12 PASS (permission & security path validation):
  ```text
  1. Correct binary artifact owner ............................................ PASS
  2. Mismatched runtime rejection ............................................. PASS
  3. Same-project fresh-runtime consumer eligibility .......................... PASS
  4. SHA-256 payload mismatch rejection ....................................... PASS
  5. Symlink traversal and escaping-target rejection .......................... PASS
  6. Executable target-path identification .................................... PASS
  7. Permission-repair path validation ........................................ PASS
  8. Rejection of paths outside the dependency tree ........................... PASS
  9. Late callback after runtime retirement ................................... PASS
  10. No artifact publication after retirement ................................ PASS
  11. No modification of authoritative project source ......................... PASS
  12. No automatic retry or duplicate startup (quarantine on failure) ......... PASS
  ```

---

## 4. PRODUCER VS CONSUMER PERMISSION EVIDENCE

The diagnostic utility (`node_modules/.b4-4-diag.cjs`) inspected `node_modules/.bin/vite` and its resolved target `node_modules/vite/bin/vite.js` at three distinct lifecycle points:

| Property | Producer (Post-Install) | Consumer (Post-Mount, Pre-Correction) | Consumer (Post-Correction) |
| :--- | :--- | :--- | :--- |
| **`.bin/vite` Exists** | `true` | `true` | `true` |
| **`.bin/vite` Type** | Symlink (`lstat.isSymbolicLink()`) | Symlink (`lstat.isSymbolicLink()`) | Symlink (`lstat.isSymbolicLink()`) |
| **`.bin/vite` Symlink Mode** | `0o777` | `0o777` | `0o777` |
| **`.bin/vite` Target String** | `../vite/bin/vite.js` | `../vite/bin/vite.js` | `../vite/bin/vite.js` |
| **Target File Path** | `node_modules/vite/bin/vite.js` | `node_modules/vite/bin/vite.js` | `node_modules/vite/bin/vite.js` |
| **Target File Exists** | `true` | `true` | `true` |
| **Target File `stat.mode`** | **`0o775`** (`rwxrwxr-x`) | **`0o644`** (`rw-r--r--`) | **`0o755`** (`rwxr-xr-x`) |
| **`stat.isExecutable`** | **`true`** | **`false`** | **`true`** |
| **Direct Node Execution** | Exit `0` | Exit `0` | Exit `0` |
| **Shell/npm Execution** | Ready (Runnable) | `jsh: spawn vite EACCES` | **Ready (Vite Started)** |

### Conclusion on Permission Loss
Binary export/mount in `@webcontainer/api@1.6.4` preserves directory structures, regular files, and internal relative symlinks, but serializes regular files with default non-executable permissions (`0o644`), dropping execute bits.

---

## 5. OBSERVATION 1: REACT A PRODUCER

- **Boot Time:** 5,424 ms
- **Clean npm Install:** Numeric exit code `0` in 5,424 ms (`npm ci --ignore-scripts --no-audit --no-fund --fetch-retries=0`).
- **Binary Export:** Completed in **494.96 ms** (`format: 'binary'`).
- **Exported Byte Length:** **26,269,787 bytes** (~25.05 MiB) (well within 64 MiB limit).
- **Exported SHA-256 Digest:** `780d5689bfeb35f19309828e98380334e9ca7997173dae988d0162631815817d`.
- **Measured Page JS Heap Delta:** **+26,302,747 bytes** (~25.08 MiB) (1:1 with buffer size; zero V8 object graph bloat).
- **Publication:** Successfully admitted and stored in `BinaryMemoryStore` under live producer owner.
- **Producer Observation Status:** **PASS** in 14,547 ms.

---

## 6. OBSERVATION 2: FRESH CONSUMER RESTORATION & DOM PROOF

- **Runtime Isolation:** Producer fully retired (`wc.teardown()`). Fresh runtime instance 2 booted in 7,641.4 ms (`gb-b4-4-react-consumer`).
- **Clean Slate Verification:** Verified `node_modules` did not exist before mount (`ENOENT`).
- **Pre-Restore Validation:** `verifyBinary()` passed in 153.6 ms (SHA-256 match, TTL valid, owner valid).
- **Clone-on-Mount:** Payload cloned in **34.97 ms** via `cloneBinary()` (preventing buffer detachment).
- **Binary Mount:** `wc.mount()` completed in **335.81 ms**; 21 top-level entries restored.
- **Internal Probe & Symlink Check:** `.b4-4-byte-probe.bin` and `.b4-4-internal-link` verified byte-for-byte.
- **Permission Diagnostics & Correction:**
  - Detected `executableLost: true` (`644` vs `775`).
  - Scoped target resolved: `node_modules/vite/bin/vite.js`.
  - Path safety check passed (`validatePermissionRepairPath`).
  - Executed `chmod +x node_modules/vite/bin/vite.js` via `wc.spawn('chmod')`.
  - Numeric exit code: **0** in **1,029.9 ms**.
  - Re-inspection verified `statModeOctal === '755'` and `isExecutable === true`.
- **Authoritative Source Invariant:** `exactSource()` verified 0 modifications to project source.
- **Normal npm Dev Server Dispatch:**
  - Executed unchanged `npm run dev` (`vite --host 0.0.0.0 --port 5173 --strictPort`).
  - **Zero `EACCES` errors.**
  - Vite dev server announced ready in 1,924 ms.
  - WebContainer emitted genuine `server-ready` event for port 5173 at 4,106 ms after invocation.
  - Server URL: `https://7i8ck62dj7zha0527l160fl0v33w0d-iedw-zfzmw6da--5173--2ed8f36d.local-corp.webcontainer-api.io`.
- **Real DOM Proof:**
  - Playwright inspected preview iframe.
  - `#marker` text confirmed: **`B44_REACT_A`**.
  - Verified in **33,634 ms** from consumer start.
- **Install Prevention:** `installDispatchCount === 0` (zero npm installs run in consumer).
- **Consumer Observation Status:** **PASS** in 33,647 ms.

---

## 7. FULL COMPARISON MATRIX ACROSS ALL PHASES

| Metric | Stage 0 (Policy Baseline) | Stage 1.1 (JSON Diagnostic) | Stage 1.2 (Binary Harness) | Stage 1.2.1 (Binary Roundtrip) | Stage 1.2.2 (Permission Fix) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Export Format** | N/A | JSON | Binary | Binary | **Binary** |
| **Export Time** | N/A | 1,797.7 ms | 333.6 ms | 344.5 ms | **495.0 ms** |
| **Accounted Payload** | N/A | 34.6 MiB (partial) | 25.05 MiB (complete) | 25.05 MiB (complete) | **25.05 MiB (complete)** |
| **Page JS Heap Delta** | N/A | +171.5 MiB (spike) | +26.3 MiB (flat) | +25.1 MiB (flat) | **+25.1 MiB (flat)** |
| **Producer Publish** | N/A | REJECTED (32MB cap) | FAILED (owner bug) | PASS (stored) | **PASS (stored)** |
| **Consumer Mount** | N/A | Never reached | Never reached | 243.3 ms | **335.8 ms** |
| **Restoration Duration** | N/A | Never reached | Never reached | 421.0 ms | **570.0 ms** |
| **Clean Install Time** | N/A | 5,791 ms | 5,125 ms | 5,523 ms | **5,424 ms** |
| **Speedup Ratio (Mount vs Install)** | N/A | N/A | N/A | 13.1x faster | **9.5x to 13.1x faster** |
| **`chmod` Support** | Untested | Untested | Untested | Untested | **YES (CLI exit 0)** |
| **Mode Recovery** | N/A | N/A | N/A | None (`644`) | **`644` -> `755`** |
| **`npm run dev` Status** | N/A | N/A | N/A | FAIL (`spawn EACCES`) | **PASS (Vite ready)** |
| **Real DOM Verified** | N/A | None | None | None | **PASS (`B44_REACT_A`)** |
| **Verdict** | PASS (41/41) | INCONCLUSIVE | INCONCLUSIVE | B4_4_BINARY_ROUNDTRIP_FAIL | **B4_4_EXECUTABLE_RESTORATION_PASS** |

---

## 8. SECURITY & ARCHITECTURAL ANALYSIS

### 8.1 Safety Invariants Maintained
1. **Source Isolation:** Authoritative files (`package.json`, `package-lock.json`, `src/main.js`, `index.html`) were checked via `exactSource` before and after permission repair. No project files were modified.
2. **Strict Boundary Enclosure:** `resolveExecutableTarget` and `validatePermissionRepairPath` ensure permission repair can ONLY target paths within `node_modules/`. Attempts to traverse outside (e.g. `../../package.json` or `src/`) trigger immediate rejection.
3. **No Blanket Recursive chmod:** Only the verified binary target (`node_modules/vite/bin/vite.js`) received `+x`. No wildcard or recursive `chmod -R` was executed.
4. **Ownership & Quarantining:** Fresh runtime generations were strictly maintained; failed runs quarantine the project key.
5. **No Host File Leakage:** WebContainer mounts exist purely in-browser via Wasm/virtual memory. No host OS files or credentials are touched.

### 8.2 Technical Plausibility of Application Integration
With Stage 1.2.2 passing all criteria, binary dependency caching in GB Coder is **technically feasible**:
- **Cold Boot (First project open):** Runs standard clean npm install (~5.5s), exports binary artifact (~0.5s), caches in memory/IndexedDB.
- **Warm Boot (Subsequent open of same project/incarnation):** Mounts binary payload (~0.3s), runs scoped `chmod +x` on discovered `.bin/` targets (~1.0s), launches dev server immediately, saving ~4–5 seconds of network package downloads and npm resolution per startup.

---

## 9. RECOMMENDATIONS & OWNER APPROVAL BOUNDARIES

1. **Production Status Remains STRICT HOLD:**
   - Do NOT merge into `main`.
   - Do NOT push to remote.
   - Do NOT deploy to Vercel Preview or Production.
2. **Baseline Acceptance Retained:**
   - Accepted production branch remains on clean-install architecture (Phase B.4.1–B.4.3).
3. **Next Steps Requiring Explicit Owner Authorization:**
   - **Stage 2 (Multi-Framework Feasibility & Benchmarking):** Test binary export/mount and executable permission restoration on Vue 3 fixture (`B44_VUE_B`) to verify multi-framework generalization.
   - **Stage 3 (IndexedDB Persistence Feasibility):** Test whether large binary blobs (25–35 MiB) can be persisted to IndexedDB across browser reloads without quota exhaustion.
   - **Stage 4 (Application Integration Plan):** Draft architectural blueprint for integrating optional warm dependency caching into GB Coder's runtime orchestration layer while preserving clean install as the fallback.
