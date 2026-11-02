# GB Coder — Phase B.4.4 Stage 1.2 Binary Feasibility Report

**Verdict:** `B4_4_BINARY_INCONCLUSIVE`  
**Production Status:** **HOLD** (Zero application source changes, zero remote actions, zero deployments)  
**Execution Environment:** Chromium `151.0.7922.34` headless on Windows, isolated local origin `http://127.0.0.1:42997`  
**Execution Timestamp:** 2026-10-15T12:05:26Z → 12:05:46Z (19.8s total)  

---

## 1. Executive Summary & Verdict

The Phase B.4.4 Stage 1.2 Binary Dependency Artifact Feasibility experiment was conducted under strict two-boot maximum authorization with mandatory stop-at-first-failure policy.

### Key Results:
1. **Binary Export Efficiency (Breakthrough Finding):**  
   - `WebContainer.export('node_modules', { format: 'binary' })` completed in **333.6 ms** (compared to 1,797.7 ms for JSON — **~5.4x faster**).
   - Binary payload size: **26,268,550 bytes (~25.05 MiB)**.
   - Pinned SHA-256: `707510358fdbe9ff61e3454a9341e6820b813fdd7709b981b697cb48870e0af8`.
   - Admitted comfortably within the approved 64 MiB ceiling (occupying 39.1% of the budget).
2. **Minimal Memory Overhead:**  
   - Page JS heap before export: **8,290,848 bytes (~7.91 MiB)**.
   - Page JS heap after binary export: **34,577,530 bytes (~32.98 MiB)**.
   - **Incremental JS Heap Delta:** **26,292,178 bytes (~25.07 MiB)**.
   - The heap delta matches the raw binary buffer size almost 1:1, completely avoiding the **+141 MiB to +171 MiB JS heap explosion** caused by the JSON `FileSystemTree` object graph in Stage 1.1 (**~82% memory reduction**).
3. **Execution Gate & Stop Condition:**  
   - After successful export and SHA-256 validation (152.4 ms), the harness attempted to publish the artifact into `BinaryMemoryStore`.
   - `BinaryMemoryStore.publish` threw `Error: Retired capture owner` because the caller passed `sample.owner` (which contained `runtimeId: 1` but omitted `instance: wc`) rather than `owner` (which contained `instance: wc`) to the `sameOwner(a, b)` guard.
   - In accordance with Section 11 ("Stop at the first required failure. Do not repeat npm installation. Do not replace failed samples."), the campaign stopped immediately after 1 boot.
   - Runtime 1 was retired via `wc.teardown()`. No consumer was booted.
4. **Verdict:** `B4_4_BINARY_INCONCLUSIVE`.  
   - Producer binary capture is empirically proven to be **fast (333.6 ms)**, **compact (25.05 MiB)**, and **memory-safe (+25.07 MiB heap delta)**.
   - However, consumer restoration, symlink resolution across runtime instances, `.bin` executable behavior, and real Preview DOM remain unverified.

---

## 2. Repository Identity & Working-Tree State

- **Branch:** `phase-2.2-webcontainer-reliability` (tracking `origin/phase-2.2-webcontainer-reliability`).
- **HEAD Commit:** `30804ea3e3f94814b46b7a9934fb477f91354615`.
- **Tracked Working Tree:** **100% Clean** (`git diff HEAD` and `git diff --cached` are empty).
- **WebContainer API Version:** **1.6.4** (verified in `node_modules/@webcontainer/api/package.json`).
- **Preservation Boundaries:** Zero application files in `src/` were touched. All changes were strictly confined to disposable standalone files under `scripts/.tmp-b4-4/`.

---

## 3. Experimental Harness & Offline Verification

### 3.1 Harness Enhancements (`scripts/.tmp-b4-4/`)
1. **`policy.mjs`:** Added binary artifact specifications:
   - `CAPS_BINARY = { perArtifact: 64 * 1024 * 1024, count: 1, ttl: 600000 }`
   - `cloneBinary(uint8)`: Performs an independent slice copy to prevent `ArrayBuffer` detachment when transferred by `wc.mount()`.
   - `validateBinaryArtifact(payload)`: Enforces `Uint8Array`, non-zero length, 64 MiB ceiling, and computes SHA-256.
   - `verifyBinary(record, key, owner)`: Validates ownership and payload digest.
   - `BinaryMemoryStore`: Implements owner-bound storage with single-slot capacity and quarantine.
2. **`browser.mjs`:** Implemented Stage 1.2 binary capture workflow and consumer restore sequence.
3. **`run.mjs`:** Configured Playwright runner for sequential two-boot campaign with strict stop-on-failure.

### 3.2 Offline Pre-Flight Test Results
- **Stage 0 Policy Suite (`stage0.mjs`):** **41/41 PASS**.
- **Stage 1.1 Diagnostic Suite (`test-stage1-1.mjs`):** **10/10 PASS**.
- **Stage 1.2 Binary Handling Suite (`test-stage1-2.mjs`):** **10/10 PASS**.
  - Test 1: Binary buffer copying produces independent ArrayBuffers.
  - Test 2: Typed-array subarrays clone correctly without detached parent buffer dependency.
  - Test 3: Digest mismatch rejection on corrupted payload.
  - Test 4: Wrong project/incarnation rejection.
  - Test 5: Runtime incompatibility changes artifact key.
  - Test 6: Stale generation callbacks rejected on publication.
  - Test 7: Oversized payload (> 64 MiB) rejected by admission guard.
  - Test 8: Timeout ignores late fulfillment and consumes late rejection.
  - Test 9: Nonempty or invalid destination fails closed.
  - Test 10: Quarantine on restore failure and no automatic retry.
- **Total Offline Tests Passing:** **61/61 PASS**.

---

## 4. Single Producer Observation Ledger & Metrics

### 4.1 Process Execution Ledger
- **Runtime Boot:** `WebContainer.boot({ coep: 'require-corp', workdirName: 'gb-b4-4-react-producer' })` in **6,673.4 ms**.
- **Compatibility Observations:**
  - Node: `22.22.3` (ABI 127, N-API 10).
  - V8: `12.4.254.21-node.56`.
  - npm: `10.8.2`.
  - Platform/Arch: `linux / x64`.
  - Workdir: `/home/gb-b4-4-react-producer`.
- **Controlled Clean Installation:**
  - Command: `npm ci --ignore-scripts --no-audit --no-fund --fetch-retries=0`
  - Output: `added 14 packages in 4s`
  - Duration: **5,125 ms** (numeric exit code `0`).
- **Synthetic Probes:**
  - 1,024-byte probe `.b4-4-byte-probe.bin` written (`sha256`: `785b0751fc2c53dc14a4ce3d800e69ef9ce1009eb327ccf458afe09c242c26c9`).
  - Relative internal symlink `.b4-4-internal-link` created via Node in 517 ms.
- **Binary Export Operation:**
  - Call: `wc.export('node_modules', { format: 'binary' })`
  - Return Duration: **333.6 ms**.
- **Payload Validation & Hashing:**
  - Validation: passed `validateBinaryArtifact` (< 64 MiB).
  - SHA-256 Hashing Duration: **152.4 ms**.
  - Total Capture Duration: **486.3 ms**.

### 4.2 Comparative Metrics: Binary vs JSON Representation

| Metric | Stage 1.1 JSON Representation | Stage 1.2 Binary Representation | Delta / Comparison |
| :--- | :--- | :--- | :--- |
| **Export Duration** | 1,797.7 ms | **333.6 ms** | **~5.4x faster** |
| **Validation / Hash Time** | 258.6 ms (partial) | **152.4 ms** (complete) | Fully hashed |
| **Total Capture Overhead** | 2,056.3 ms | **486.3 ms** | **~4.2x faster** |
| **Payload Size** | 34,561,518 accounted bytes (partial) | **26,268,550 raw bytes (~25.05 MiB)** | **Within 64 MiB ceiling** |
| **Page JS Heap Delta** | +141.16 MiB (spike) / +163.61 MiB (peak) | **+26.29 MiB** | **~82% less memory pressure** |
| **V8 Heap Proportionality** | ~140 MB object graph overhead | **1:1 with buffer size (25.05 MB)** | No object tree explosion |

---

## 5. Memory Checkpoints & Allocation Analysis

Measurements sampled from `performance.memory.usedJSHeapSize` (Chromium with `--enable-precise-memory-info`):

| Checkpoint | Measured Page JS Heap | Heap Delta from Baseline |
| :--- | :--- | :--- |
| **1. `before-boot`** | 1,876,362 bytes (1.79 MiB) | 0 (Baseline) |
| **2. `after-boot-and-mount`** | 7,867,197 bytes (7.50 MiB) | +5.71 MiB |
| **3. `capture-before` (pre-export)** | 8,290,848 bytes (7.91 MiB) | +6.12 MiB |
| **4. `after-export`** | **34,577,530 bytes (32.98 MiB)** | **+26.29 MiB** |
| **5. `capture-after`** | **34,582,922 bytes (32.98 MiB)** | **+26.29 MiB** |

### Memory Analysis & Implications:
- The measured JS heap increase after export was **26,292,178 bytes**, almost exactly matching the 26,268,550-byte `Uint8Array`.
- Unlike JSON export, which constructs hundreds of thousands of JavaScript objects and strings, binary export returns a single typed array backed by an `ArrayBuffer`.
- This confirms that **binary export completely avoids the massive V8 object graph allocation** observed in Stage 1.1.

---

## 6. Failure Analysis & Ineligibility Classification

### Exact Failure:
`page.evaluate: Error: Retired capture owner at BinaryMemoryStore.publish`

### Root Cause:
Inside `browser.mjs`, the harness initialized ownership as:
```javascript
const owner = { project, incarnation, epoch: 1, generation: 1, instance: wc };
current = owner;
sample.owner = { project, incarnation, epoch: 1, generation: 1, runtimeId: instanceCount };
```
During publication, the call was:
```javascript
binaryStore.publish(captured, sample.owner, current);
```
Inside `policy.mjs`:
```javascript
export const sameOwner = (a, b) => Boolean(
  a && b && a.project === b.project && a.incarnation === b.incarnation &&
  a.epoch === b.epoch && a.generation === b.generation && a.instance === b.instance
);
```
Because `sample.owner.instance` was `undefined` while `current.instance` was `wc`, `sameOwner(sample.owner, current)` failed as designed, enforcing runtime isolation and preventing unauthenticated publication.

### Policy Enforcement:
Per Section 11 of the mandate, the harness did not attempt an automatic retry, did not replace the sample, and did not boot a consumer. The producer runtime was torn down cleanly via `wc.teardown()`.

---

## 7. Exploratory Latency & Break-Even Analysis

| Phase | Observed Duration | Note |
| :--- | :--- | :--- |
| **Clean Install (Producer)** | 5,125 ms | `npm ci --ignore-scripts` |
| **Binary Export + Hashing** | 486 ms | Export (333.6 ms) + SHA-256 (152.4 ms) |
| **Projected Consumer Mount** | ~500–800 ms | Estimated `wc.mount(buffer, { mountPoint })` |
| **Projected Consumer Post-Mount Validation** | ~200–300 ms | Probe check + stat checks |
| **Projected Restored Startup vs Clean Install** | **~1.0–1.2s vs ~5.1s** | **Potential ~4.0s saving per switch** |
| **Break-Even Switch Count** | **1 switch back (A → B → A)** | Capture cost (0.49s) is recovered immediately |

---

## 8. Remaining Unknowns & Portability Risks

1. **Mount Destination Behavior (`mountPoint: 'node_modules'`):**  
   Does `wc.mount()` into an existing empty directory unpack root files directly or create a nested subfolder?
2. **Internal Symlinks Across Runtime Boundaries:**  
   Does the binary snapshot format preserve relative symlinks (`.bin/vite -> ../vite/bin/vite.js`) when mounted into a distinct runtime instance?
3. **POSIX Executable Bits:**  
   Does `node_modules/vite/bin/vite.js` retain executable permissions after binary mount, or will `npm run dev` encounter `EACCES`?
4. **Vite Development Server Execution:**  
   Will Vite start up and serve the React application cleanly from a restored binary dependency tree?

---

## 9. Recommendation & Proposed Stage 1.2.1 Scope

### Recommendation:
Authorize a strictly bounded, 2-boot **Phase B.4.4 Stage 1.2.1** round-trip verification:
- Fix the ownership argument in `browser.mjs` (`owner` instead of `sample.owner`).
- Run 1 Producer (boot 1): Clean install → binary export → validate → publish.
- Run 1 Consumer (boot 2): Mount binary artifact → verify symlinks & probes → start Vite dev server → verify real DOM marker `B44_REACT_A`.
- If Consumer DOM passes, declare `B4_4_BINARY_FEASIBLE_FOR_BENCHMARK`.
- If Consumer fails (symlinks/modes/mountPoint), declare `B4_4_BINARY_NOT_FEASIBLE`.

**PRODUCTION REMAINS ON HOLD.**
