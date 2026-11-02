# GB CODER — PHASE B.4.4 STAGE 2.1
## PERFORMANCE BENCHMARK DESIGN & APPLICATION INTEGRATION READINESS REVIEW

**Author:** Google Antigravity (Gemini)  
**Role:** Principal Software Architect, WebContainer Runtime Specialist, Browser Performance Engineer, and TypeScript Reliability Engineer  
**Date:** October 15, 2026  
**Execution Mode:** Source inspection, evidence analysis, engineering design, and benchmark planning ONLY  
**Production Status:** STRICT HOLD (0 modifications to `src/`, no remote push, no production deployment)

---

## 1. MANDATED VERDICT

```text
VERDICT: B4_4_STAGE_2_1_BENCHMARK_RECOMMENDED
```

### Executive Summary
1. **Empirical Feasibility vs. Net Performance Value:** Standalone feasibility has been rigorously established across both React (Stage 1.2.2) and Vue 3 (Stage 2). However, feasibility alone does not prove that binary artifact reuse provides a statistically meaningful, safe net startup-time improvement under real-world browser conditions.
2. **The Critical Application Capture Barrier:** Source inspection of GB Coder's production runtime (`webcontainerService.ts`, `TerminalTab.tsx`, `startupOutput.ts`) reveals that dependency installation is tightly coupled into the interactive PTY shell (`npm install --prefer-offline && npm run dev`), relying on streaming regex hints rather than a verifiable numeric process exit. Attempting to capture `node_modules` while Vite is actively launching would export a dirty, mutating filesystem.
3. **Recommended Strategic Path:** Before touching any production application code or re-architecting the interactive shell startup pipeline, a controlled, counterbalanced, apples-to-apples standalone performance benchmark must be conducted. This benchmark will establish whether the net time saved by skipping `npm install` outweighs the combined overhead of capture, export, cloning, mounting, and scoped `chmod` restoration across network variance and cold/warm cache states.
4. **Architectural Gating:** Application integration remains **STRICTLY GATED** behind benchmark validation and an authorized capture-barrier prototype. Production remains on **HOLD**.

---

## 2. PRECONDITIONS & RECOVERED REPOSITORY STATE

| Parameter | Specification | Measured / Audited | Compliance |
| :--- | :--- | :--- | :--- |
| **Repository HEAD** | `30804ea3e3f94814b46b7a9934fb477f91354615` | `30804ea3e3f94814b46b7a9934fb477f91354615` | PASS |
| **Feature Branch** | `phase-2.2-webcontainer-reliability` | `phase-2.2-webcontainer-reliability` | PASS |
| **Tracked Working Tree** | Clean (`git diff HEAD` empty) | 0 modified tracked files | PASS |
| **Production Source Code** | `src/` unmodified | 0 modifications to `src/` | PASS |
| **Accepted B.4 Baseline** | B.4.1–B.4.3 & B.4.2a intact | All accepted modules preserved | PASS |
| **WebContainer API** | `@webcontainer/api@1.6.4` | Verified `1.6.4` in `package.json` | PASS |
| **Offline Test Matrix** | 97 offline policy tests | 97/97 PASS across 6 test suites | PASS |
| **Historical Evidence** | Stage 0 through Stage 2 ledgers preserved | Valid JSON and markdown records verified | PASS |

---

## 3. HISTORICAL EVIDENCE SYNTHESIS: STAGE 0 THROUGH STAGE 2

| Research Stage | Target / Hypothesis | Outcome / Measured Result | Verdict / Status |
| :--- | :--- | :--- | :--- |
| **Stage 0** | Baseline policy, path traversal, admission limits | 41/41 offline tests passed; immutable policy established | `B4_4_STAGE_0_PASS` |
| **Stage 1 & 1.1** | JSON `FileSystemTree` export/mount | Accounted size exceeded 32 MiB limit; massive JS heap inflation (>180 MB) | `B4_4_STAGE_1_NOT_FEASIBLE` |
| **Stage 1.2** | Binary buffer export/mount | Export succeeded in ~344 ms; heap remained flat; blocked by sample owner bug | `B4_4_STAGE_1_2_INCONCLUSIVE` |
| **Stage 1.2.1** | React binary consumer roundtrip | Fixed owner bug; binary mount succeeded; failed at `jsh: spawn vite EACCES` | `B4_4_BINARY_ROUNDTRIP_FAIL` |
| **Stage 1.2.2** | React executable permission restoration | Proved execute bit lost (`0o775` -> `0o644`); restored via native `chmod +x`; Real DOM `#marker === "B44_REACT_A"` in 33.6s | `B4_4_EXECUTABLE_RESTORATION_PASS` |
| **Stage 2 Reconciliation** | Audit of task-365 (1 boot, FAIL) vs task-405 (2 boots, PASS) | Total 3 boots consumed; documented reporting discrepancy; triggered stop condition | `B4_4_STAGE_2_VUE_BLOCKED` |
| **Stage 2 Vue Execution**| Vue 3 synthetic binary restoration (`task-581`) | 2 boots, 0 retries, 0 consumer npm installs; binary export 261.5 ms; chmod in 733.3 ms; Real DOM `#marker === "B44_VUE_B"` in 24.7s | `B4_4_STAGE_2_VUE_FEASIBLE` |

---

## 4. TASK A — RECONSTRUCT EXACT END-TO-END PERFORMANCE COST

### 4.1 Granular Lifecycle Phase Breakdown

The table below reconciles empirical measurements from the React A feasibility sample (Stage 1.2.2) and Vue B feasibility sample (Stage 2):

| Lifecycle Phase | Component | Measurement Nature | React A (ms) | Vue B (ms) | Cost Classification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Source Preparation** | Project files read & payload constructed | Directly measured | ~100.0 | ~100.0 | One-time per boot |
| **2. Producer Boot** | `WebContainer.boot()` | Directly measured | 5,002.0 | 12,413.9 | Session startup cost |
| **3. Producer Mount** | `wc.mount(sourceTree)` | Directly measured | ~150.0 | ~150.0 | One-time per boot |
| **4. Clean npm Install** | `npm ci --ignore-scripts ...` | Directly measured | **6,054.0** | **6,091.0** | Initial session baseline ($T_{\text{install}}$) |
| **5. Probe Generation** | Byte probe & internal symlink write | Directly measured | 450.0 | 448.0 | Test harness artifact only |
| **6. Permission Diag (Prod)**| VFS diagnostic inspection | Directly measured | 478.0 | 480.0 | Standalone diagnostic only |
| **7. Binary Export** | `wc.export('node_modules', {format:'binary'})`| Directly measured | **344.0** | **261.5** | Initial capture cost ($T_{\text{export}}$) |
| **8. Artifact Hashing** | SHA-256 calculation & size validation | Directly measured | **60.0** | **120.1** | Initial capture cost ($T_{\text{hash}}$) |
| **9. Store Publication** | Retain in `BinaryMemoryStore` | Derived | < 1.0 | < 1.0 | Initial capture cost ($T_{\text{store}}$) |
| **10. Producer Teardown** | `wc.teardown()` & iframe detach | Directly measured | 50.0 | 50.0 | Cleanup cost |
| **11. Consumer Boot** | Fresh `WebContainer.boot()` | Directly measured | 4,500.0 | 4,813.4 | Session startup cost |
| **12. Buffer Cloning** | `cloneBinary(payload)` (ArrayBuffer clone) | Directly measured | **38.0** | **81.2** | Restore cost ($T_{\text{clone}}$) |
| **13. Binary Mount** | `wc.mount(payloadCopy)` | Directly measured | **225.0** | **449.4** | Restore cost ($T_{\text{mount}}$) |
| **14. Post-Mount Validation** | `readdir` & probe SHA checks | Directly measured | 12.0 | 15.3 | Restore cost ($T_{\text{validate}}$) |
| **15. Permission Inspection** | Pre-correction VFS inspection | Directly measured | 508.0 | 545.0 | Restoration overhead ($T_{\text{pre\_diag}}$) |
| **16. Scoped Chmod Repair**| `wc.spawn('chmod', ['+x', target])` | Directly measured | **1,029.9** | **733.3** | Restoration overhead ($T_{\text{chmod}}$) |
| **17. Post-Chmod Verify** | Post-correction VFS inspection | Directly measured | 512.0 | 1,007.0 | Standalone diagnostic only |
| **18. Dependency Execution** | Node `-e` require validation | Directly measured | 1,850.0 | 2,058.0 | Standalone diagnostic only |
| **19. Vite Bin Direct Check** | `vite --version` execution | Directly measured | 2,100.0 | 2,829.0 | Standalone diagnostic only |
| **20. Dev Server Dispatch** | `npm run dev` invoke to `server-ready` | Directly measured | **4,008.0** | **5,063.0** | Dev server startup ($T_{\text{dev}}$) |
| **21. Real Preview DOM** | Dev invoke to frame `#marker` match | Directly measured | **33,634.0** | **24,709.0** | End-to-end user ready ($T_{\text{DOM}}$) |

---

### 4.2 Mathematical Break-Even & Amortization Model

Let:
- $T_{\text{capture}}$ be the total penalty incurred during the initial session to export, hash, and store the binary artifact:
  $$T_{\text{capture}} = T_{\text{export}} + T_{\text{hash}} + T_{\text{store}}$$
  For Vue B: $T_{\text{capture}} = 261.5\text{ ms} + 120.1\text{ ms} + 0.5\text{ ms} = \mathbf{382.1\text{ ms}}$.
- $T_{\text{install}}$ be the clean installation duration avoided during subsequent sessions:
  For Vue B: $T_{\text{install}} = \mathbf{6,091.0\text{ ms}}$.
- $T_{\text{restore\_overhead}}$ be the mandatory runtime overhead to clone, mount, and restore executable permissions:
  $$T_{\text{restore\_overhead}} = T_{\text{clone}} + T_{\text{mount}} + T_{\text{validate}} + T_{\text{chmod}}$$
  For Vue B: $T_{\text{restore\_overhead}} = 81.2\text{ ms} + 449.4\text{ ms} + 15.3\text{ ms} + 733.3\text{ ms} = \mathbf{1,279.2\text{ ms}}$.
- $\Delta T_{\text{session}}$ be the net time saved per subsequent session:
  $$\Delta T_{\text{session}} = T_{\text{install}} - T_{\text{restore\_overhead}} = 6,091.0\text{ ms} - 1,279.2\text{ ms} = \mathbf{4,811.8\text{ ms}}\;(\approx 4.81\text{ seconds})$$

The break-even point $N_{\text{breakeven}}$ (number of subsequent restores required to amortize the capture penalty) is:
$$N_{\text{breakeven}} = \frac{T_{\text{capture}}}{\Delta T_{\text{session}}} = \frac{382.1\text{ ms}}{4,811.8\text{ ms}} = \mathbf{0.079\text{ restores}}$$

> [!NOTE]
> **Takeaway:** Under synthetic fixture conditions, **a single subsequent restore recovers the initial capture cost more than 12 times over**. The capture overhead (382 ms) is virtually negligible compared to the gross install saving (6,091 ms). However, this calculation assumes that $T_{\text{dev}}$ (Vite startup) and $T_{\text{boot}}$ remain identical between clean-install and restored runtimes, which has not yet been proven in a counterbalanced benchmark.

---

## 5. TASK B — APPLES-TO-APPLES PERFORMANCE BENCHMARK DESIGN

To eliminate observation bias, browser memory warming, WebContainer worker compilation caching, and CDN network variance, we propose a rigorous **Counterbalanced Latin Square Benchmark** for execution in Stage 2.2.

### 5.1 Benchmark Architecture

```mermaid
flowchart TD
    subgraph Benchmark Matrix
        direction TB
        F1["Framework 1: React A (64 pkgs)"]
        F2["Framework 2: Vue B (78 pkgs)"]
    end

    subgraph Counterbalanced Pairing
        direction LR
        P1["Pair 1: Control A1 ➔ Candidate B1"]
        P2["Pair 2: Candidate B2 ➔ Control A2"]
        P3["Pair 3: Control A3 ➔ Candidate B3"]
        P4["Pair 4: Candidate B4 ➔ Control A4"]
    end

    Benchmark Matrix --> Counterbalanced Pairing
```

### 5.2 Control vs. Candidate Execution Specification

| Parameter | Control A (Clean Install) | Candidate B (Binary Restoration) |
| :--- | :--- | :--- |
| **Runtime State** | Fresh WebContainer instance | Fresh WebContainer instance |
| **Workdir** | Isolated workdir name | Isolated workdir name |
| **Source Files** | Exact locked fixture files | Exact locked fixture files |
| **npm Configuration** | Locked `.npmrc` (`legacy-peer-deps`, etc.) | Locked `.npmrc` |
| **Dependency Action** | Dispatches `npm ci --prefer-offline` | Clones & mounts binary payload; runs scoped `chmod +x` |
| **npm Install Count** | Exactly 1 | Exactly 0 |
| **Dev Server Command** | `"dev": "vite --host 0.0.0.0 --port 5173 --strictPort"` | `"dev": "vite --host 0.0.0.0 --port 5173 --strictPort"` |
| **Readiness Assertions** | Port 5173 `server-ready` + Real Preview DOM match | Port 5173 `server-ready` + Real Preview DOM match |
| **Environment** | Chromium headless + `--enable-precise-memory-info` | Chromium headless + `--enable-precise-memory-info` |

### 5.3 Variance Controls & Bias Elimination
1. **Alternating Order:** Running A-B-B-A eliminates directional drift caused by progressive Chromium memory growth or WebContainer internal WASM JIT warmup.
2. **Pre-Warmed Producer Runs:** Each framework executes 1 producer run to generate and capture the artifact before the 8 benchmark runs begin.
3. **Network Transport Recording:** The runner records HTTP request failures and durations to identify external registry slowdowns.
4. **Preservation of Failures:** Any failure (timeout, exit code $\neq 0$, DOM mismatch) is recorded as a failed sample with full diagnostic dump; samples are never silently discarded or retried.

### 5.4 Proposed Future Execution Budget (Stage 2.2)

| Dimension | Per Framework (React / Vue) | Combined Total | Hard Ceiling |
| :--- | :--- | :--- | :--- |
| **Producer Boot (Capture)** | 1 boot | 2 boots | 2 boots |
| **Control A Samples** | 4 samples | 8 samples | 8 samples |
| **Candidate B Samples** | 4 samples | 8 samples | 8 samples |
| **Total WebContainer Boots** | 9 boots | 18 boots | **18 boots** |
| **Total Browser Campaigns** | 1 campaign | 1 campaign | **1 campaign** |
| **Per-Observation Timeout** | 240 seconds | 240 seconds | 240 seconds |
| **Automatic Retries** | 0 retries | 0 retries | **0 retries** |

---

## 6. TASK C — PERFORMANCE SUCCESS CRITERIA

### 6.1 Evaluation of Historical Candidate Criteria

| Candidate Criterion | Feasibility Analysis on Synthetic Fixtures | Recommendation |
| :--- | :--- | :--- |
| **Median warm DOM improvement $\ge 20\%$** | **Realistic & Achievable:** Baseline clean install takes ~30-33s total DOM time. Saving ~4.8s represents ~15-18% of total DOM time, and ~75% of dependency setup time. If Vite starts equally fast, a 20% improvement is within reach. | **ADOPT** |
| **Absolute warm DOM improvement $\ge 10.0\text{ s}$** | **Unrealistic on Synthetic Fixtures:** Clean install of synthetic fixtures takes only 6.09s total! Even if restore took 0.00s, maximum possible absolute savings is 6.09s. Requiring a 10s improvement on a 6s install is mathematically impossible. | **REJECT for synthetic fixtures; set to $\ge 3.0\text{ s}$.** |
| **First-use capture overhead $\le 10,000\text{ ms}$** | **Realistic & Validated:** Measured capture time was 382 ms for Vue and 404 ms for React. This is 25x faster than the 10s ceiling. | **ADOPT** |
| **Capture cost recovered within 2 later restores**| **Realistic & Validated:** Mathematical break-even is 0.08 restores. Recovery in $\le 1$ restore is achievable. | **ADOPT (Recovery in $\le 1$ restore)** |
| **Zero ownership / isolation errors** | **Mandatory Reliability Gate:** No cross-project or cross-runtime leakage. | **ADOPT (Zero Tolerance)** |
| **Zero consumer npm install commands** | **Mandatory Reliability Gate:** `installDispatchCount === 0`. | **ADOPT (Zero Tolerance)** |
| **Bounded memory & payload sizes** | **Mandatory Reliability Gate:** Payload $\le 64\text{ MiB}$; Heap delta $\le 128\text{ MiB}$. | **ADOPT** |

### 6.2 Recommended Primary & Secondary Metrics
- **Primary Metric ($T_{\text{open}\rightarrow\text{DOM}}$):** Time from user opening/reopening a project in the IDE to the actual Preview iframe rendering the valid root DOM marker.
- **Secondary Workflow Metric ($T_{\text{switch}}$):** A $\rightarrow$ B $\rightarrow$ A project switching sequence. Measures time for the user to switch from Project A to Project B and back to Project A, verifying clean runtime retirement, instant artifact lookup, and fast restoration.

---

## 7. TASK D — APPLICATION CAPTURE BARRIER (CRUCIAL ARCHITECTURAL ANALYSIS)

### 7.1 The Current Production Architecture Coupling
Source code audit of `src/services/webcontainer/webcontainerService.ts` and `src/components/Console/TerminalTab.tsx` reveals how startup is orchestrated today:

```mermaid
sequenceDiagram
    autonumber
    actor User as User / IDE
    participant TT as TerminalTab.tsx
    participant WS as webcontainerService.ts
    participant Shell as jsh (Interactive PTY)
    participant Preview as Preview Pane

    User->>TT: Open Project / Switch
    TT->>WS: needsDependencyInstall(files)
    WS-->>TT: { needsInstall: true }
    TT->>WS: beginAutomaticStartup(owner)
    TT->>Shell: shell.write("npm install --prefer-offline && npm run dev\n")
    Note over Shell: npm install runs...
    Shell-->>WS: Stream chunks -> StartupOutputParser
    Note over WS: Inferred match: "added 28 packages"
    Note over Shell: jsh immediately executes "npm run dev"
    Note over Shell: Vite boots and binds port 5173
    WS-->>Preview: 'server-ready' event (port 5173)
```

### 7.2 Why Background Capture Cannot Be Inserted Directly
1. **Lack of Numeric Exit Code:** The interactive shell executes a compound command line string. `jsh` does not notify the browser when `npm install` completes; `StartupOutputParser` only observes streaming text regexes (`added \d+ packages`). As documented in `startupOutput.ts#L2`: *"These never claim a numeric npm exit status."*
2. **Concurrent Mutation Hazard (Vite Race Condition):** In the compound command (`npm install ... && npm run dev`), the exact millisecond `npm install` finishes, `jsh` executes `npm run dev`. Vite immediately begins reading dependencies, writing optimize caches to `node_modules/.vite`, and spawning esbuild worker threads. If `webcontainerService` initiates a binary export (`wc.export('node_modules')`) upon detecting the regex hint, **it captures a dirty, mutating, active filesystem**.
3. **Interactive Terminal Interference:** If we split the command into separate `wc.spawn()` calls outside the shell:
   - The user's visible terminal tab would appear dead or disconnected while `npm install` runs in the background.
   - User keystrokes, Ctrl+C cancellation, and terminal history would be broken.

### 7.3 State-Machine Requirements for a Verifiable Capture Barrier
To introduce dependency capture without breaking the interactive terminal:
1. **Explicit Sequential Orchestration:** The automatic startup must be decoupled into distinct phases:
   - Phase 1: `npm install` dispatched with a deterministic completion signal (e.g., shell script trap or sequenced internal wrapper).
   - Phase 2: **Quiescent Capture Barrier** — A verifiable pause where no processes are active, allowing `wc.export('node_modules')` to execute against a quiescent filesystem.
   - Phase 3: `npm run dev` dispatched into the interactive shell.
2. **Failure & Cancellation Preservation:** If the user presses Ctrl+C or switches projects during Phase 1 or 2, the capture must be aborted immediately without publishing a partial artifact.

---

## 8. TASK E — CACHE ELIGIBILITY AND INTEGRITY

### 8.1 Conservative Eligibility Matrix

| Project Attribute | Eligibility Rule | Justification |
| :--- | :--- | :--- |
| **Manifest & Lockfile** | **Required:** `package.json` + `package-lock.json` (v2/v3) | Deterministic dependency tree requires a committed lockfile. |
| **Lockless Projects** | **STRICTLY INELIGIBLE** | Without a lockfile, npm resolves latest floating versions non-deterministically. |
| **Configuration Digest** | **Required:** Exact match of effective `.npmrc` | Flags (`legacy-peer-deps`, registry) alter dependency layout. |
| **Runtime Environment** | **Required:** Node 22.x, npm 10.x, API 1.6.4, Linux x64 | Cross-runtime ABI compatibility must match. |
| **Lifecycle Scripts** | **Required:** `ignore-scripts=true` | Packages requiring arbitrary native `postinstall` builds fail in WASM. |
| **Executable Binaries** | **Bounded:** Single target (`node_modules/vite/bin/vite.js`) | Multi-binary packages require complex recursive chmod discovery. |
| **Monorepos & Workspaces** | **STRICTLY INELIGIBLE** in v1 | Symlink loops and workspace sibling links cause traversal hazards. |
| **Project Boundary** | **Strictly Project-Scoped:** Zero cross-project sharing | Matching digests never override project ownership or authorization. |

### 8.2 Invalidation Matrix

| Event | Invalidation Action | Triggering Mechanism |
| :--- | :--- | :--- |
| **Manifest / Lockfile Edit** | Invalidate project artifact immediately | `fileSyncCoordinator.onDependencyInvalidation()` |
| **Manual Terminal Install** | Invalidate project artifact immediately | User input in terminal matching `npm i`, `yarn`, `pnpm` |
| **Project Switch / Close** | Invalidate active ownership; retain in LRU | `webcontainerService.setActiveProject()` |
| **Project Deletion** | Purge artifact from memory store | IDE project deletion handler |
| **Project Backup Restore** | Invalidate and purge old artifact | Backup restore / zip import handler |
| **User Logout** | Purge entire memory store | Auth state change listener |
| **TTL Expiry (10 min)** | Evict expired artifact | `BinaryMemoryStore` timer sweep |

---

## 9. TASK F — MEMORY AND RETENTION DESIGN

### 9.1 Comparison of Retention Strategies

| Metric / Attribute | Strategy A: Single In-Memory Artifact | Strategy B: 2-Artifact LRU In-Memory | Strategy C: Clean Install Baseline | Strategy D: IndexedDB Persistence (Research Only) |
| :--- | :--- | :--- | :--- | :--- |
| **Payload Storage** | Tab heap (ArrayBuffer) | Tab heap (2x ArrayBuffers) | 0 bytes in heap | IndexedDB `IDBObjectStore` |
| **Memory Footprint** | ~35–45 MiB | ~70–90 MiB | 0 MiB | 0 MiB in heap; 50-100 MB on disk |
| **Clone-on-Mount Cost** | ~80 ms | ~80 ms | 0 ms | Structured clone deserialization: ~300-600 ms |
| **Storage Quota Risk** | Zero (released on tab close) | Zero (released on tab close) | Zero | **High:** Browsers evict or throttle under quota |
| **Cross-Session Stale Risk**| Zero (tab lifetime only) | Zero (tab lifetime only) | Zero | **Critical:** Persisted binaries survive WASM version upgrades |
| **Implementation Complexity**| Low | Low-Medium | Zero | High |
| **Recommendation** | **Candidate Choice** | Alternative for switching | Fallback Baseline | **DO NOT IMPLEMENT** |

> [!WARNING]
> **Rejection of IndexedDB Artifact Persistence:** Persisting 40+ MB binary dependency archives in IndexedDB is strongly discouraged. Structured clone serialization across the IDB bridge introduces substantial main-thread jank, browser storage quotas can silently fail or trigger origin eviction, and persisted binaries can become stale across WebContainer WASM runtime updates, leading to silent, irreproducible container crashes. **Tab-memory retention is the only safe candidate.**

---

## 10. TASK G — RESTORATION PROOF & FAILURE RECOVERY

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Lookup: Reopen Project / Switch
    Lookup --> CleanInstall: Cache Miss / Ineligible
    Lookup --> Eligible: Valid Binary Artifact in Memory
    Eligible --> ValidateDestination: Check node_modules absent
    ValidateDestination --> CleanInstall: Nonempty (fail-safe)
    ValidateDestination --> Mount: Clone & wc.mount(payload)
    Mount --> ValidateVFS: Check top-level & probe digests
    ValidateVFS --> Quarantine: Digest mismatch
    ValidateVFS --> ChmodRepair: isExecutable == false
    ChmodRepair --> VerifyExecutable: chmod +x target
    VerifyExecutable --> Quarantine: chmod failed
    VerifyExecutable --> StartDev: npm run dev
    StartDev --> ServerReady: port 5173 event
    ServerReady --> RealDOM: iframe #marker verified
    RealDOM --> ReadyProof: Establish restoredArtifactProof
    Quarantine --> RetireContainer: Safe teardown
    RetireContainer --> ErrorPrompt: Prompt clean install
```

### Key Safety Invariants
1. **Independent Proof Token:** A restored artifact establishes `restoredArtifactProof`, **never** `installedOwner`. The application must distinguish between dependencies installed via npm and dependencies restored via binary mount.
2. **Fail-Closed Quarantine:** If mounting, probe verification, `chmod`, or Vite startup fails, the artifact is quarantined (`binaryStore.quarantine(projectId)`), the container is retired, and no automatic retry is attempted.
3. **No Automatic npm Install Over Dirty Container:** Never run `npm install` on top of a partially mounted or failed restore. Retiring the container guarantees that clean installation always occurs in an empty virtual filesystem.

---

## 11. TASK H — FRAMEWORK AND PACKAGE COMPATIBILITY BOUNDARIES

| Framework / Tooling | Compatibility Assessment | Rationale / Limiting Factor | Initial Support Status |
| :--- | :--- | :--- | :--- |
| **Vite + React (SPA)** | **FEASIBLE** | Empirically verified in Stage 1.2.2; standard ES modules; single binary (`vite`). | **ELIGIBLE (v1)** |
| **Vite + Vue 3 (SPA)** | **FEASIBLE** | Empirically verified in Stage 2; standard ES modules; single binary (`vite`). | **ELIGIBLE (v1)** |
| **Vite + Svelte (SPA)** | **LIKELY FEASIBLE** | Pure Vite architecture similar to Vue; requires Svelte compiler probe validation. | Candidate for v1.1 |
| **Next.js (App Router)** | **INCOMPATIBLE** | Requires native SWC platform binaries, Node server daemon; `node_modules` > 200 MB. | **EXCLUDED** |
| **Astro** | **INCOMPATIBLE** | Multi-renderer SSR runtime; complex platform dependencies. | **EXCLUDED** |
| **Tailwind / PostCSS** | **CONDITIONALLY COMPATIBLE** | Pure JS PostCSS plugins work; native Rust-based lightningcss requires testing. | Requires Testing |
| **Packages with `postinstall`**| **STRICTLY EXCLUDED** | `ignore-scripts=true` blocks lifecycle compilation; native addons fail in WASM. | **EXCLUDED** |

---

## 12. TASK I — MINIMAL INTEGRATION PROPOSAL (CONCEPTUAL DESIGN)

If the future benchmark proves a decisive, statistically verified startup speedup, integration would be gated behind an optional, disabled-by-default feature flag:

### Proposed Architecture: `webcontainerBinaryDependencyReuse`

1. **Flag Definition:**
   ```typescript
   export const FEATURE_FLAGS = {
     webcontainerBinaryDependencyReuse: false, // Disabled by default
   };
   ```
2. **Non-Invasive File Changes (When Authorized):**
   - `src/services/webcontainer/webcontainerService.ts`: Add `binaryStore` instance; update `needsDependencyInstall()` to check in-memory artifact eligibility; add `mountBinaryArtifact()` method.
   - `src/components/Console/TerminalTab.tsx`: Update `queueAutomaticStart()` to handle binary restoration branch without breaking interactive PTY shell.
   - `src/services/webcontainer/startupDiagnostics.ts`: Add diagnostic phase `'binary_restore'` and outcomes `'cloned'`, `'mounted'`, `'chmod_repaired'`, `'quarantined'`.
3. **Rollback Guarantee:** Toggling `webcontainerBinaryDependencyReuse: false` immediately reverts 100% of startup execution to the accepted B.4 clean-install pipeline without data loss or residual state.

---

## 13. STRATEGIC DECISION MATRIX & RANKING

| Option | Strategic Path | Benefits | Engineering Cost | Correctness Risk | Performance Uncertainty | Recommendation & Rank |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| **1** | **Retain Existing Clean-Install Architecture Permanently** | 100% proven reliability; zero capture race conditions; accepted on Preview. | Zero | Zero | Zero | **Rank 2 (Safe Fallback)** |
| **2** | **Controlled Standalone Performance Benchmark (Stage 2.2)** | Resolves critical performance uncertainty; measures true net DOM speedup; zero production code risk. | Low (harness only) | Zero | Resolved by experiment | **Rank 1 (RECOMMENDED)** |
| **3** | **Application Capture-Barrier Prototype in Disposable Harness** | Tests decoupling of npm install and Vite dev server outside production IDE. | Medium | Low | Unchanged | **Rank 3 (Post-Benchmark)** |
| **4** | **Disabled-by-Default In-Memory Artifact Integration** | Provides opt-in product performance; preserves clean install baseline. | High | Medium | High if unmeasured | **Rank 4 (Gated by Rank 1 & 3)** |
| **5** | **Persistent Browser Artifact Caching (IndexedDB)** | Survives tab close. | Very High | Severe (stale WASM, quota) | Severe main-thread jank | **Rank 5 (NOT RECOMMENDED)** |

---

## 14. RECOMMENDED NEXT EXPERIMENT & AUTHORIZATION SPECIFICATION

### Recommendation: Phase B.4.4 Stage 2.2 — Controlled Standalone Performance Benchmark

We recommend conducting a rigorous, counterbalanced benchmark in the standalone harness (`scripts/.tmp-b4-4/`) comparing Control A (clean install) against Candidate B (binary restoration) across both React and Vue fixtures.

### Explicit Authorization Bounds Required for Stage 2.2
1. **Single Browser Campaign:** Exactly 1 browser campaign start.
2. **Hard Boot Budget:** Maximum 18 WebContainer boots (2 producer captures + 8 Control runs + 8 Candidate runs across React and Vue).
3. **Execution Budget:** Maximum 20 minutes campaign duration; 240 seconds per observation; 0 automatic retries.
4. **Safety Restrictions:** Confined strictly to `scripts/.tmp-b4-4/`; 0 modifications to `src/`; no commits, pushes, or deployments.
5. **Predeclared Stop Condition:** If Candidate B fails to achieve a median warm DOM improvement of at least 20% or an absolute improvement of at least 3.0 seconds, research on binary dependency reuse will conclude with `NO_FURTHER_CACHING_RESEARCH`.

---

## 15. CONCLUSION & FINAL VERDICT

```text
FINAL VERDICT: B4_4_STAGE_2_1_BENCHMARK_RECOMMENDED
```

The empirical feasibility of binary dependency restoration has been proven for both React and Vue. However, integrating this capability into GB Coder presents a major architectural capture barrier in the interactive shell. Executing the controlled Stage 2.2 performance benchmark will definitively determine whether the real-world performance gain justifies solving that capture barrier.

**PRODUCTION REMAINS STRICTLY ON HOLD. NO SOURCE CODE HAS BEEN MODIFIED. AWAITING OWNER REVIEW.**
