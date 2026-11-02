# GB Coder — Phase B.4.4 Stage 1.1 Diagnostic Plan & Feasibility Analysis

**Verdict & Recommendation:** `B4_4_STAGE_1_1_DIAGNOSTIC_EXPERIMENT_RECOMMENDED`  
**Production Status:** **HOLD** (No code changes to application source, no deployments, no remote mutations)  
**Mode:** READ-ONLY INVESTIGATION, OFFLINE ANALYSIS, AND ENGINEERING PLANNING  

---

## A. Repository Identity & Working-Tree State

1. **Current Git Branch:** `phase-2.2-webcontainer-reliability` (tracking `origin/phase-2.2-webcontainer-reliability`).
2. **Current HEAD Commit:** `30804ea3e3f94814b46b7a9934fb477f91354615` (`fix(webcontainer): harden startup ownership and cancellation`).
3. **Tracked Working-Tree & Staging State:** 
   - `git status --porcelain --untracked-files=no`: **Clean** (0 staged, 0 unstaged modifications on tracked files).
   - `git diff HEAD`: **Empty** (0 lines).
   - `git diff --cached`: **Empty** (0 lines).
4. **Installed WebContainer API Version:**
   - Declared in `package.json`: `"^1.6.4"`
   - Verified in `node_modules/@webcontainer/api/package.json`: **`1.6.4`** (StackBlitz Inc., MIT).
5. **Accepted Phase B.4 Implementation & Regression Suites:**
   - Production source files:
     - `src/services/webcontainer/webcontainerService.ts`
     - `src/services/webcontainer/startupDiagnostics.ts`
     - `src/services/webcontainer/startupOutput.ts`
     - `src/components/Console/TerminalTab.tsx`
     - `src/components/vscode/StackBlitzStartupLoader.tsx`
     - `src/components/vscode/VSCodeMode.tsx`
   - Regression suites executed and passing:
     - `scripts/test-phase-b4-startup.mjs` (6/6 passed)
     - `scripts/test-phase-b4-output.mjs` (10/10 passed)
     - `scripts/test-phase-b4-diagnostics.mjs` (1/1 passed)
     - `scripts/test-phase-b4-2a-shell-exit.mjs` (18/18 passed)
     - Total: **35/35 offline regression tests passing**.
6. **Recent Experimental Files Inspected:**
   - `scripts/.tmp-b4-4/policy.mjs` (SHA-256: `26fd0f1e97e7587719e873a48ef56fe6cede208e37bf148b6b5d223366cb0292`)
   - `scripts/.tmp-b4-4/browser.mjs` (SHA-256: `fe725e8e63f3d4d44a158a8c0ba9fc375834ef9bc0aee71417e384f56bfabe3a`)
   - `scripts/.tmp-b4-4/run.mjs` (SHA-256: `475317ab510a6722c6b00cc12281104fc2e357fbb1b1bc814cdff8f6470a011b`)
   - `scripts/.tmp-b4-4/fixtures.json` (SHA-256: `b20447d0a8b754938271826e3d75150d0db49d2c38bf924b35d70d44036e683a`)
   - `scripts/.tmp-b4-4/stage0.mjs` (41/41 offline policy tests passing)
   - `reports/CODEX_PHASE_B4_4_STAGE_0_1_EXPERIMENT.md`
   - `reports/b4-4-stage1.json`, `reports/b4-4-stage1.log`, `reports/b4-4-stage0-1-summary.json`

---

## B. Recovered Project Context & Preservation Boundaries

### 1. Architectural Architecture & Invariants
- **Multi-layer Monorepo:** Astro marketing site (`apps/marketing/`) on root domain, Static Editor (Monaco + IndexedDB) for vanilla web, and Advanced IDE (`/app`, `/app/ide`) running React/Vue in WebContainer with Monaco and `jsh` terminal.
- **Strict Runtime Isolation:** Switching projects retires the old WebContainer runtime; returning boots a fresh runtime. No shared live runtimes, processes, or shared writable `node_modules`.
- **Installed Proof Provenance:** `installedOwner` must belong strictly to the owning runtime instance, project, epoch, and generation. Directory presence or stale npm hints never grant proof.
- **Preserved Terminal Architecture:** Interactive `jsh` terminal shell executing `npm install --prefer-offline && npm run dev`. Automatic startups are owner-bound and guarded against race conditions or duplicate dispatch.
- **Storage Hygiene:** Authoritative project stores (`gb-coder-projects-db`, `gb-coder-workspace`) and backup archives must never store transient dependency artifacts.

### 2. Experimental Status of Phase B.4.4
Phase B.4.4 was initiated to evaluate whether in-memory dependency-tree caching could eliminate redundant npm installs on project switches (A → B → A).  
Stage 0 passed 41/41 offline tests.  
Stage 1 failed during its first observation (React producer) with `Error: Artifact byte admission limit` because accounted size exceeded the approved 32 MiB ceiling. The campaign stopped immediately after 1 boot with no consumer boot and no dev server started.

### 3. Non-Negotiable Preservation Boundaries
The following files and components remain strictly protected and unmodified:
- `src/services/webcontainer/webcontainerService.ts`
- `src/components/Console/TerminalTab.tsx`
- `src/components/vscode/VSCodeMode.tsx`
- `src/components/vscode/StackBlitzStartupLoader.tsx`
- `src/services/webcontainer/startupDiagnostics.ts`
- `src/services/webcontainer/startupOutput.ts`
- `src/services/webcontainer/fileSyncCoordinator.ts`
- Database, workspace, and backup services (`projectDatabase.ts`, `vscodeWorkspaceStore.ts`, `backupExportService.ts`, `backupRestoreService.ts`)
- Routing configuration (`vercel.json`), marketing pages (`apps/marketing/`), and Monaco worker configuration.

---

## C. Failure Analysis: Reconstructing the Admission Failure

### 1. Where the 32 MiB Admission Limit is Enforced
The admission limit is defined in `scripts/.tmp-b4-4/policy.mjs`:
```javascript
export const CAPS = { perArtifact: 32 * 1024 * 1024, total: 64 * 1024 * 1024, entries: 20000, depth: 64, ttl: 600000, count: 2 };
```
It is enforced in two locations:
1. **During recursive traversal (`inventory` walk in `policy.mjs` line 46):**
   ```javascript
   requireThat(accounted <= limits.perArtifact, 'Artifact byte admission limit');
   ```
2. **At publication time (`MemoryArtifacts.publish` line 75):**
   ```javascript
   requireThat(record.accountedBytes <= CAPS.perArtifact, 'Artifact byte admission limit');
   ```
In Stage 1, the failure occurred at line 46 inside the nested `walk()` recursion, called directly by `inventory(tree)` in `browser.mjs` line 60.

### 2. Full Materialization Before Limit Check
**Yes, the validator materializes the entire tree into memory before checking the limit.**  
In `browser.mjs`:
```javascript
const tree = await wc.export('node_modules', { format: 'json' });
const first = await inventory(tree);
```
`WebContainer.export()` constructs the full in-memory JavaScript `FileSystemTree` object representing all directories and files under `node_modules` before `inventory()` begins its depth-first traversal. The 32 MiB check is not an OS or streaming memory guard; it is a post-export structural evaluation.

### 3. Accounting Formula for Nodes
Inside `policy.mjs` (`inventory` function):
- **Directory:** Entry object `e = { path, type: 'directory' }`.
- **Symlink:** Entry object `e = { path, type: 'symlink', target, resolved }`.
- **File:**
  - If `file.contents` is `string`:
    - `data = encoder.encode(file.contents)` (UTF-8 bytes)
    - `fileBytes += data.byteLength`
    - `accounted += file.contents.length * 2` (UTF-16 storage estimate: 2 bytes per char)
  - If `file.contents` is `Uint8Array`:
    - `data = file.contents`
    - `fileBytes += data.byteLength`
    - `accounted += data.byteLength`
- **Per-Node Overhead Applied to ALL Entries (Files, Directories, Symlinks):**
  ```javascript
  accounted += encoder.encode(JSON.stringify(e)).byteLength + 128;
  ```

### 4. Impact of UTF-16 Accounting vs Actual File Bytes
`file.contents.length * 2` conservatively models V8 heap storage assuming 2 bytes per JavaScript string character.  
However, npm package files (.js, .json, .ts, .d.ts, .map, .md) are almost 100% ASCII/UTF-8. In V8, ASCII strings are commonly stored as `SeqOneByteString` (Latin-1, 1 byte per char).  
More critically, comparing UTF-16 accounted size against raw file bytes introduces an automatic **~2.0x inflation factor** on all text files:
- 15 MB of text files on disk = ~30 MB accounted payload.
- This creates a massive divergence between disk/transport footprint and accounted payload.

### 5. Application of the 128-Byte Per-Entry Allowance
For every single entry `e` in the tree (directories, symlinks, files), the validator adds:
- `JSON.stringify(e).byteLength`: Includes path string, 64-hex SHA-256 string, type, representation (~120–180 bytes).
- Plus an explicit `128` bytes allowance.
Thus, every entry adds ~250–310 bytes of accounted overhead. For a tree with 5,000 files and 1,000 directories (6,000 entries), entry overhead alone contributes **~1.6 to 1.9 MiB** to `accounted`.

### 6. Plausible Contributors in the Synthetic React Fixture
The React fixture has only 14 packages added, but Vite 5.4.21 pulls in heavy platform and build dependencies:
1. **Binary Artifacts:** `@esbuild/linux-x64` includes a native binary (`bin/esbuild`) that is ~9.5–10 MiB raw. Optional Rollup platform binaries (e.g., `@rollup/rollup-linux-x64-gnu`) add another ~5 MiB raw.
2. **Bundled Text / JS:** `vite` bundled chunks (`dist/node/chunks/*.js`) and `rollup` modules add ~6.5 MiB of text files.
3. **Double Counting via UTF-16:** If text files total ~10–12 MiB raw, UTF-16 accounting counts them as 20–24 MiB.
4. **Metadata:** `node_modules/.package-lock.json` generated by npm 10 adds substantial manifest text.
5. Combined estimate: 10 MiB (esbuild) + 5 MiB (rollup) + (10 MiB text × 2 = 20 MiB) + 1.5 MiB (entry overhead) = **~36.5 MiB accounted**. This naturally crosses the 32 MiB boundary (`33,554,432 bytes`).

### 7. Availability of Partial Counters in Existing Evidence
**Confirmed Fact:** Neither `reports/b4-4-stage1.json` nor `reports/b4-4-stage1.log` contains a partial counter, file count, or offending path.  
Because `requireThat` in `policy.mjs` threw an unqualified `Error('Artifact byte admission limit')`, the walk terminated immediately, leaving only the knowledge that `accounted > 33,554,432 bytes`. The unpersisted `tree` object was garbage-collected upon teardown.

### 8. Feasibility of Safe Partial Reporting
**Confirmed Fact:** The validator can easily report safe partial diagnostics without persisting any dependency contents or violating privacy.  
Reporting scalar aggregates—such as:
- `accountedBytesAtRejection`
- `fileBytesAtRejection`
- `entryCountAtRejection`
- `lastPath` and `lastCategory`
- Aggregated byte totals by file extension or top package directory  
requires zero source text retention, zero secret storage, and zero disk persistence of file bytes.

### 9. Conservative Retained Representation vs True Browser Memory
The 32 MiB limit measures conservative JS object and string representation costs, **not true browser memory**:
- Before export, the measured page JS heap was only **8,265,263 bytes (~8.27 MiB)**.
- `export('node_modules', { format: 'json' })` completed in **1,021 ms** without memory exhaustion or crash.
- The 32 MiB limit is an arbitrary policy threshold on an inflated synthetic metric, not a reflection of an out-of-memory condition.

### 10. Could Admission Logic Reject a Practical Minimal Artifact?
**Yes, conclusively.** The synthetic React A fixture is as minimal as a modern Vite+React setup can practically be: only React, React-DOM, and Vite (14 installed packages, 64 locked entries). If even this minimal fixture is rejected due to UTF-16 doubling and native binary sizes, then **virtually any modern frontend project will be ineligible under the current 32 MiB accounted JSON admission policy**.

---

## D. Architecture & Representation Option Comparison

| Dimension | A. Unchanged 32 MiB JSON Policy | B. Instrument Validator for Evidence (Stage 1.1) | C. Higher JSON Limit (e.g. 48–64 MiB) | D. Binary-Export Path (`format: 'binary'`) | E. No-Cache Baseline (Clean Install) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Safety & Correctness** | High (fails closed). | High (read-only diagnostic, fails closed). | Moderate (larger in-memory tree, risk of heap bloat). | Unknown (opaque binary format, unverified `.bin` modes/links). | **Highest** (already verified, 35/35 tests passing). |
| **Memory Implications** | 0 bytes retained (fails). | 0 bytes retained (fails safely, captures diagnostic data). | High (retaining 48–64 MiB tree in tab heap; 2 projects = 128 MiB). | Moderate (single ArrayBuffer, but needs buffer copy before mount). | **Lowest** (0 tab memory used for dependency caching). |
| **Performance Opportunity** | 0% (blocked). | 0% (diagnostic probe only). | Potential 15–30s saving on A→B→A switch if restore succeeds. | Potential 20–35s saving (faster export/mount than JSON). | Baseline (20–40s install on project switch). |
| **Required Experiments** | None (already failed). | **1 single boot, 1 probe observation** (Stage 1.1). | Multi-sample Stage 1 campaign + memory stress testing. | Complex new research phase (format, integrity, permissions). | None. |
| **Implementation Complexity** | None. | Very Low (diagnostics in standalone test harness). | Low in policy, high in memory management. | High (opaque binary parsing, buffer detachment handling). | Zero (already accepted and deployed). |
| **Rollback Risk** | None. | None (standalone script only). | Low (revert limit). | Moderate (untested API behaviors). | None (this is the reference rollback). |
| **Solves Blocker or Shifts It?** | Dead end; keeps caching permanently blocked. | **Solves information blocker**; provides data for informed decision. | Solves admission, but shifts blocker to memory pressure & restore latency. | Bypasses JSON size, but introduces unverified binary portability risks. | Eliminates the problem entirely by accepting clean install. |

---

## E. Proposed Phase B.4.4 Stage 1.1 Diagnostic Experiment

### 1. Exact Purpose
Execute a single, controlled React A producer observation to measure the exact quantitative failure point of the existing 32 MiB admission policy without modifying application code or raising admission limits.

### 2. Scope & Target Files
- Confined exclusively to standalone test files in `scripts/.tmp-b4-4/`:
  - `policy.mjs`: Enhance `inventory()` to catch or intercept the admission threshold, capturing diagnostic telemetry into a structured rejection object before throwing or completing the probe.
  - `browser.mjs`: Capture the diagnostic telemetry in `sample.failureTelemetry` and record post-rejection memory checkpoints.
  - `run.mjs`: Output the telemetry to `reports/b4-4-stage1-1.json`.
- **Zero edits to production application files (`src/...`).**

### 3. Execution Budget & Ceilings
- **WebContainer Boots:** Exactly **1 boot** (no consumer, no Vue B, no second boot).
- **Campaign Observations:** Exactly **1 observation** (React A producer).
- **Per-Observation Timeout:** **180 seconds** (well within the previous 240s allowance).
- **Export/Capture Timeout:** **10,000 ms**.
- **Memory Ceiling:** **128 MiB incremental JS heap ceiling** (`performance.memory.usedJSHeapSize`).
- **Retries:** **0 retries**.

### 4. Diagnostic Output Contract (`reports/b4-4-stage1-1.json`)
The probe will record:
1. `accountedBytes`: Exact value when limit was reached.
2. `fileBytes`: Exact cumulative raw file bytes.
3. `entryCount`: Exact number of nodes walked before rejection.
4. `entryBreakdown`: Counts of directories, symlinks, text files, and binary files (`Uint8Array`).
5. `rejectionPath`: Exact relative path of the node that triggered the boundary.
6. `packageBreakdown`: Top 5 package directories by accounted bytes.
7. `memoryCheckpoints`: Heap bytes before-boot, before-capture, and immediately after rejection.
8. **Sanitization Guarantee:** Zero file contents, zero source text, zero credentials, zero env vars persisted.

### 5. Stop-on-Failure & Rollback Behavior
- The harness will record the telemetry and terminate with `exitCode 1` upon admission failure (confirming the expected policy enforcement).
- The WebContainer runtime will be torn down immediately via public `wc.teardown()`.
- Rollback: `git checkout scripts/.tmp-b4-4/` returns the harness to its baseline state.

### 6. Explicit Authorization Checkpoint
**DO NOT EXECUTE WITHOUT EXPLICIT OWNER APPROVAL.**  
This proposal is presented for architectural review and owner authorization before running any browser process or WebContainer boot.

---

## F. Key Risks & Portability Blockers for Dependency Reuse

Even if the admission limit were increased or resolved, several fundamental portability blockers remain completely unverified:

1. **Mount Destination Semantics (`mountPoint: 'node_modules'`):**  
   Does `mount()` into an existing directory overwrite, merge, or create a nested subfolder? If stale files or `.bin/help` conflict, dependency resolution will break.
2. **Loss of POSIX File Modes & Executable Bits:**  
   `FileSystemTree` has no `mode` field. How does WebContainer know that `node_modules/vite/bin/vite.js` or `node_modules/.bin/vite` is executable? If executable metadata is stripped upon export/mount, subsequent `npm run dev` or `vite` execution will fail with `EACCES` or spawn errors.
3. **Symlink Chain Resolution:**  
   npm heavily uses relative symlinks inside `.bin/` pointing to package binaries. If symlink target paths do not resolve identically across runtime instances, all CLI tools fail.
4. **Binary Compatibility Across Runtime Instances:**  
   Native Wasm/binary modules (`@esbuild/linux-x64`) must retain exact byte equality. If WebContainer performs any character encoding or newline conversion on exported files, binary executables become corrupted.
5. **Memory Overhead vs Latency Break-Even:**  
   In Stage 1, clean npm install in the synthetic harness took only **5.914 seconds**. Export took **1.022 seconds**. Inventory validation, JSON serialization, cloning, mounting, and verification would easily consume **3.5 to 5.0 seconds** of CPU time plus 30–60 MiB of tab memory. The net startup gain on A → B → A might be negligible (~1–2 seconds) while imposing severe memory and reliability risks.

---

## G. Architectural Recommendation

### Exact Recommendation:
`B4_4_STAGE_1_1_DIAGNOSTIC_EXPERIMENT_RECOMMENDED`

### Summary Rationale:
The admission failure in Stage 1 stopped the validator before capturing any diagnostic metrics. We know the 32 MiB limit was breached, but we do not know whether it was breached by 100 KB or 20 MB, whether UTF-16 doubling was the primary culprit, or which package dominated the payload.  
Executing the tiny, 1-boot, read-only Stage 1.1 diagnostic probe will provide exact empirical telemetry to determine whether JSON artifact caching is technically feasible with a slightly adjusted accounting model, or whether GB Coder should permanently abandon application-side dependency caching in favor of the accepted clean-install architecture.

**PRODUCTION REMAINS HOLD.**
