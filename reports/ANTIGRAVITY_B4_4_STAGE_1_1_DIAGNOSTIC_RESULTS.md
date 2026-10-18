# GB Coder — Phase B.4.4 Stage 1.1 Diagnostic Results & Empirical Analysis

**Verdict:** `B4_4_STAGE_1_1_DIAGNOSTICS_COMPLETE`  
**Production Status:** **HOLD** (No code changes to application source, no deployments, no remote mutations)  
**Execution Environment:** Chromium `151.0.7922.34` headless on Windows, isolated local origin `http://127.0.0.1:42997`  
**Execution Timestamp:** 2026-10-15T11:53:01Z → 11:53:24Z (23.3s total)  

---

## 1. Executive Summary & Core Verdict

The Phase B.4.4 Stage 1.1 diagnostic probe was executed under strict single-boot, single-observation authorization. All 10 targeted offline validation tests passed (10/10), all 41 existing Stage 0 policy tests passed (41/41), and the single React A producer observation completed cleanly with the expected admission rejection at the approved 32 MiB boundary.

**Key Empirical Findings:**
1. **Exact Rejection Boundary:** Accounted payload reached **34,561,518 bytes (~32.96 MiB)**, breaching the approved 33,554,432-byte (32.00 MiB) limit by exactly 1,007,086 bytes (0.96 MiB).
2. **Partial Progress at Boundary:** The validator traversed **302 entries** (46 directories, 247 text files, 3 binary/Wasm files, 6 symlinks) at maximum observed depth 4 before rejecting on `vite/dist/node/chunks/dep-BK3b2jBa.js`.
3. **Primary Cause of Admission Breach:** **UTF-16 Accounting Doubling.**  
   - Raw UTF-8 text bytes visited: **11,120,547 bytes (~10.60 MiB)**.
   - UTF-16 accounted text bytes: **22,239,550 bytes (~21.21 MiB)**.
   - Actual raw file bytes visited (text + binary): **23,360,283 bytes (~22.28 MiB)**.
   - The UTF-16 `length * 2` accounting formula added an artificial **11.12 MiB** penalty, single-handedly forcing rejection.
4. **Severe JS Heap Overhead (Critical Discovery):**  
   - Page JS heap before export: **8,294,435 bytes (~7.91 MiB)**.
   - Page JS heap immediately after `wc.export('node_modules', { format: 'json' })`: **156,306,963 bytes (~149.07 MiB)**.
   - Page JS heap at admission rejection: **179,854,513 bytes (~171.52 MiB)**.
   - **Conclusion:** Materializing a JSON `FileSystemTree` for a minimal Vite+React project incurs an immediate **~141 MiB to ~163 MiB JS heap expansion**. Retaining two such JSON artifacts in tab memory would consume >300 MiB of V8 heap, breaching the 128 MiB incremental ceiling and creating severe risk of browser tab OOM crashes.

---

## 2. Repository Identity & Working-Tree State

- **Branch:** `phase-2.2-webcontainer-reliability` (tracking `origin/phase-2.2-webcontainer-reliability`).
- **HEAD Commit:** `30804ea3e3f94814b46b7a9934fb477f91354615`.
- **Tracked Working Tree:** **100% Clean** (`git diff HEAD` and `git diff --cached` are empty).
- **WebContainer API Version:** **1.6.4** (verified in `node_modules/@webcontainer/api/package.json`).
- **Protection Boundaries:** Zero application files in `src/` were modified. Changes were strictly confined to the disposable test harness in `scripts/.tmp-b4-4/`.

---

## 3. Experimental Harness Changes & Offline Verification

### 3.1 Implemented Instrumentation
1. **`scripts/.tmp-b4-4/policy.mjs`:**  
   - Enhanced `inventory()` to maintain streaming telemetry counters during recursive walk.
   - Captured scalar metrics: `accountedBytes`, `entriesVisited`, `directoriesVisited`, `textFilesVisited`, `binaryFilesVisited`, `symlinksVisited`, `rawTextBytes`, `utf16AccountedTextBytes`, `typedArrayBytes`, `entryOverheadBytes`, `maxObservedDepth`, `fileTypeDistribution`, `safePackageAggregates`, `validationElapsedMs`, and `rejectionPath`.
   - Preserved exact admission limits and error message `'Artifact byte admission limit'`.
   - Attached telemetry to error and exported `getLastInventoryTelemetry()`.
2. **`scripts/.tmp-b4-4/browser.mjs`:**  
   - Added memory checkpoints: `before-boot`, `after-boot-and-mount`, `capture-before`, `after-export`, `at-rejection`, and `after-cleanup`.
   - Captured `diagnosticTelemetry` on `sample` during failure.
3. **`scripts/.tmp-b4-4/run.mjs`:**  
   - Constrained execution to exactly 1 observation (React A producer).
   - Captured memory checkpoints and diagnostic telemetry into `reports/b4-4-stage1-1.json`.
   - Terminated cleanly with `process.exitCode = 0` upon observing expected rejection.

### 3.2 Offline Test Results
- **Stage 0 Policy Tests (`scripts/.tmp-b4-4/stage0.mjs`):** **41/41 PASS**.
- **Stage 1.1 Dedicated Instrumentation Tests (`scripts/.tmp-b4-4/test-stage1-1.mjs`):** **10/10 PASS**.
  - Test 1: Valid trees retain previous eligibility behavior.
  - Test 2: Oversized trees reject at original threshold.
  - Test 3: Partial counters remain available after rejection.
  - Test 4: UTF-8 and UTF-16 accounting labeled correctly.
  - Test 5: Binary and typed-array accounting remains unchanged.
  - Test 6: Symlink and unsafe-path rejection behavior remains intact.
  - Test 7: No arbitrary file contents enter reports.
  - Test 8: Diagnostic capture cannot mutate the artifact.
  - Test 9: Metrics are bounded and compact.
  - Test 10: Verification harness self-check.

---

## 4. Single Producer Observation Ledger & Metrics

### 4.1 Process Execution Ledger
- **Runtime Boot:** `WebContainer.boot({ coep: 'require-corp', workdirName: 'gb-b4-4-react' })` in **7,331.2 ms**.
- **Environment Compatibility:**
  - Node: `22.22.3` (ABI 127, N-API 10).
  - V8: `12.4.254.21-node.56`.
  - npm: `10.8.2`.
  - Platform/Arch: `linux / x64`.
  - Workdir: `/home/gb-b4-4-react`.
- **Controlled Clean Installation:**
  - Command: `npm ci --ignore-scripts --no-audit --no-fund --fetch-retries=0`
  - Output: `added 14 packages in 5s`
  - Duration: **5,791 ms** (numeric exit code `0`).
- **Disposable Probes:**
  - Deterministic 1,024-byte probe `.b4-4-byte-probe.bin` written.
  - Internal relative symlink `.b4-4-internal-link` created via Node in 662 ms.
- **Export Operation:**
  - Method: `wc.export('node_modules', { format: 'json' })`
  - Return Duration: **1,797.7 ms** (well within 10s budget).
- **Validation to Rejection:**
  - Validation elapsed time: **258.6 ms**.
  - Outcome: Threw `Error: Artifact byte admission limit` at entry 302.

### 4.2 Partial Accounting Breakdown at Rejection

| Metric | Measured Value | Unit / Note |
| :--- | :--- | :--- |
| **Accounted Bytes at Rejection** | **34,561,518** | ~32.96 MiB (Limit: 33,554,432 bytes) |
| **Breach Delta** | **+1,007,086** | +0.96 MiB over 32 MiB ceiling |
| **Total Entries Visited** | **302** | Partial traversal cut short by guard |
| **Directories Visited** | **46** | Intermediate folders |
| **Text Files Visited** | **247** | .js, .ts, .json, .md, .cjs, etc. |
| **Binary / Wasm Files Visited** | **3** | Wasm binaries (12,238,712 bytes) + 1,024 byte probe |
| **Symlinks Visited** | **6** | Internal links |
| **Raw UTF-8 Text Bytes** | **11,120,547** | ~10.60 MiB actual disk/text size |
| **UTF-16 Accounted Text Bytes** | **22,239,550** | ~21.21 MiB (`file.contents.length * 2`) |
| **Typed-Array / Binary Bytes** | **12,239,736** | ~11.67 MiB raw binary |
| **Entry Descriptor Overhead** | **82,232** | ~0.08 MiB (JSON metadata + 128B per entry) |
| **Total Raw File Bytes Visited** | **23,360,283** | **~22.28 MiB** (Text + Binary) |
| **Max Observed Path Depth** | **4** | Traversal reached subdirectories |
| **Rejection Node** | `vite/dist/node/chunks/dep-BK3b2jBa.js` | Text chunk in Vite |

### 4.3 Safe Package Breakdown at Rejection

| Package Directory | Accounted Bytes | Approx MiB | Share of Traversed Accounted |
| :--- | :--- | :--- | :--- |
| `esbuild` | 12,687,722 | 12.10 MiB | 36.7% |
| `react-dom` | 9,036,867 | 8.62 MiB | 26.1% |
| `rollup` | 6,436,493 | 6.14 MiB | 18.6% |
| `vite` | 4,615,407 | 4.40 MiB | 13.4% |
| `react` | 642,670 | 0.61 MiB | 1.9% |
| `postcss` | 457,013 | 0.44 MiB | 1.3% |
| `source-map-js` | 291,111 | 0.28 MiB | 0.8% |
| `scheduler` | 192,457 | 0.18 MiB | 0.6% |
| Others / probes | 201,778 | 0.19 MiB | 0.6% |
| **Total** | **34,561,518** | **32.96 MiB** | **100.0%** |

### 4.4 File Type Distribution

| Extension | Count | Raw Bytes | Accounted Bytes |
| :--- | :--- | :--- | :--- |
| `.wasm` | 2 | 12,238,712 bytes (11.67 MiB) | 12,239,325 bytes (11.67 MiB) |
| `.js` | 145 | 10,469,093 bytes (9.98 MiB) | 20,980,567 bytes (20.01 MiB) |
| `.ts` | 41 | 233,548 bytes (0.22 MiB) | 478,785 bytes (0.46 MiB) |
| `.md` | 17 | 245,619 bytes (0.23 MiB) | 495,803 bytes (0.47 MiB) |
| `no_ext` | 18 | 103,062 bytes (0.10 MiB) | 210,940 bytes (0.20 MiB) |
| `.json` | 18 | 29,793 bytes (0.03 MiB) | 64,780 bytes (0.06 MiB) |
| `.mjs` / `.cjs` / `.cts` / `.mts` | 13 | 36,741 bytes (0.03 MiB) | 77,195 bytes (0.07 MiB) |
| `dir` (directories) | 42 | 0 bytes | 7,128 bytes |
| Other (`.bin`, `.applescript`) | 2 | 3,715 bytes | 6,995 bytes |

---

## 5. Memory Checkpoints & Heap Analysis

Measurements sampled from `performance.memory.usedJSHeapSize` (Chromium with `--enable-precise-memory-info`):

| Checkpoint | Measured Page JS Heap | Heap Delta from Baseline |
| :--- | :--- | :--- |
| **1. `before-boot`** | 1,890,542 bytes (1.80 MiB) | 0 (Baseline) |
| **2. `after-boot-and-mount`** | 7,901,413 bytes (7.53 MiB) | +5.73 MiB |
| **3. `capture-before` (pre-export)** | 8,294,435 bytes (7.91 MiB) | +6.11 MiB |
| **4. `after-export`** | **156,306,963 bytes (149.07 MiB)** | **+141.16 MiB spike** |
| **5. `at-rejection`** | **179,854,513 bytes (171.52 MiB)** | **+163.61 MiB peak** |
| **6. `after-cleanup`** | 180,252,244 bytes (171.90 MiB) | Transient pending GC; browser closed |

### Memory Coverage & Caveats
- `performance.memory.usedJSHeapSize` covers only the renderer's V8 JavaScript heap.
- It does **not** reflect WebContainer's Service Worker memory, Wasm backing stores, or browser-level native allocations.
- **Finding:** Exporting a JSON FileSystemTree caused an immediate **~141 MiB JS heap jump**, and traversal added another **~22 MiB**. This demonstrates that the in-memory JSON object graph representation is extremely memory-inefficient in V8.

---

## 6. Answers to Mandated Diagnostic Questions

1. **What exact partial accounted total was reached?**  
   **34,561,518 bytes (~32.96 MiB)**. It breached the 32 MiB limit by 1,007,086 bytes (0.96 MiB).
2. **How many entries were traversed before rejection?**  
   **302 entries** (46 dirs, 247 text files, 3 binaries, 6 symlinks).
3. **How much of the observed accounting was text, binary, metadata, and overhead?**  
   - UTF-16 Accounted Text: **22,239,550 bytes (64.3%)**
   - Binary / Wasm: **12,239,736 bytes (35.4%)**
   - Entry & Descriptor Overhead: **82,232 bytes (0.2%)**
4. **Is UTF-16 accounting materially contributing to admission failure?**  
   **Yes.** Raw file bytes were only **22.28 MiB**. The `length * 2` doubling formula added **11.12 MiB** of synthetic weight. Without this doubling, the 32 MiB boundary would not have been reached at entry 302.
5. **Was any measurable memory spike observed?**  
   **Yes, severe.** An immediate **141 MiB heap jump** upon `wc.export()` return, peaking at **171.5 MiB**.
6. **Did JSON export complete within the existing capture budget?**  
   **Yes.** `exportMs` took **1,797.7 ms** (well under the 10,000 ms limit).
7. **Does evidence justify investigating a larger JSON admission policy?**  
   **No.** While raising the policy limit to ~48–64 MiB would allow the React fixture to be admitted, the empirical **~150–170 MiB heap cost per export** proves that JSON representation is fundamentally unviable for retaining multiple projects in tab memory without risking tab crashes.
8. **Is a binary representation experiment more appropriate?**  
   Conceptually yes, because a single contiguous `Uint8Array` avoids creating tens of thousands of individual V8 string/object allocations. However, binary export remains unproven regarding `.bin` symlinks, POSIX permissions, and clone/transfer overhead.
9. **Which portability and execution uncertainties remain unresolved?**  
   - Restoration semantics into `mountPoint: 'node_modules'`.
   - Executable mode preservation on `.bin` scripts.
   - Symlink resolution across runtime boundaries.
   - Net latency break-even: clean install took **5.79 s**; export alone took **1.80 s**. Adding serialization, transfer, mounting, and verification makes the net performance gain negligible.
10. **What is the smallest separately authorized next experiment?**  
    Either evaluate a minimal binary-export round trip (`WebContainer.export(..., { format: 'binary' })`) in an isolated harness, OR formally close Phase B.4.4 and finalize the verified clean-install architecture as the production design.

---

## 7. Status & Next Steps

- **Campaign Status:** `B4_4_STAGE_1_1_DIAGNOSTICS_COMPLETE`.
- **Runtime State:** Exactly 1 boot recorded; runtime torn down via `wc.teardown()`; browser context closed; local HTTP server terminated.
- **Artifacts Retained:** **Zero bytes**. No cache artifacts were published.
- **Tracked Codebase:** **100% untouched and clean**.
- **Production Status:** **REMAINS ON HOLD.**

*Awaiting explicit owner instruction on whether to proceed with binary-export feasibility investigation (Phase B.4.5) or finalize the clean-install baseline.*
