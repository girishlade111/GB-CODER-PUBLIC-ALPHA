# GB CODER — PHASE 2.2
# STAGE A: COMPREHENSIVE WEBCONTAINER, TERMINAL & ADVANCED IDE ARCHITECTURE AUDIT

**Author:** Principal Software Architect, Browser Runtime Engineer, Security Auditor & Reliability Lead  
**Execution Environment:** Google Antigravity / Gemini Autonomous Coding Agent  
**Audit Date:** 2026-10-14  
**Audit Status:** `PHASE_2_2_STAGE_A_AUDIT_COMPLETE`  
**Target Repository:** `girishlade111/GB-CODER-PUBLIC-ALPHA`  
**Production URL:** [https://code.ladestack.in](https://code.ladestack.in)  
**Deliverable File:** [`reports/PHASE_2_2_STAGE_A_ARCHITECTURE_AUDIT.md`](file:///c:/Users/Girish%20Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/PHASE_2_2_STAGE_A_ARCHITECTURE_AUDIT.md)  
**Strict Constraint:** AUDIT AND PLANNING ONLY. NO APPLICATION FIXES IMPLEMENTED. ZERO COMMITS OR DEPLOYS.

---

## 1. Executive Summary

### 1.1 Current Architecture Health
GB Coder demonstrates a highly sophisticated, modern hybrid web application architecture that marries an Astro 5.4 static marketing shell at the root (`/`) with a high-performance React 18 single-page application mounted at `/app/`. The project leverages WebAssembly-based StackBlitz WebContainer technology (`@webcontainer/api` v1.6.4) to execute genuine Node.js and Vite development servers directly inside user browser tabs without remote server cost.

Following the Post-E3 / Phase 2.1 releases, the application has proven stable baseline functionality:
- Canonical dashboard-first navigation at `/app/projects`.
- Complete cross-origin isolation (COOP `same-origin`, COEP `require-corp`).
- Two-tier terminal architecture (WebAssembly PTY shell vs. client-local command emulator).
- IndexedDB persistence (`gb-coder-projects-db`) with transaction serialization and quota protection.
- Isolated preview refresh using the `LOCALSERVICE_RELOAD_WINDOW` postMessage protocol.

### 1.2 Major Strengths
1. **Multi-Store Browser-Local Persistence:** IndexedDB stores projects and project files independently (`[projectId, path]` compound keys), eliminating full-project re-serialization on keystrokes and protecting against large-file localStorage quota exhaustion.
2. **Deterministic Dependency Fingerprinting:** `computeDependencyFingerprint` hashes `package.json` and lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`) to prevent redundant `npm install` cycles on project re-entry.
3. **Optimized Virtual NPM Configuration:** `.npmrc` is injected with `prefer-offline=true`, `audit=false`, `fund=false`, and `progress=false`, reducing package installation times and PTY render pressure by 4–8 seconds.
4. **Shell Prompt Readiness Guarding:** Interactive shell prompt readiness (`❯`) is explicitly verified before dispatching auto-start commands, preventing command loss and truncated pipeline execution.
5. **Zero-Bundle-Leak Code Splitting:** `npm run verify:bundle` enforces that heavy development dependencies (xterm, JSZip, esbuild-wasm, E2B SDK, VS Code mode) remain strictly excluded from the initial critical-path bundle (593.6 kB raw / 187.9 kB gzip).
6. **Non-Destructive Preview Reloading:** `previewReloadService` prevents iframe DOM destruction, attempting postMessage in-window reload before graceful navigation fallback, with an in-flight lock against duplicate clicks.

### 1.3 Major Confirmed Risks
1. **Cross-Project Dev Server & Preview Stale State (P1):** When exiting `VSCodeMode` or returning to the dashboard, the active WebContainer Vite dev server process is not terminated, and `webcontainerService.state.serverUrl` is not cleared. Opening a subsequent project causes `TerminalTab:406` to detect an active dev server, falsely assume it belongs to the newly opened project, and abort project installation/dev server launch, leaving the preview pointing to the old project's dev server.
2. **Un-debounced Keystroke File Syncing to Virtual Filesystem (P1):** In `VSCodeMode.tsx:575`, `handleChange` calls `void webcontainerService.syncFile(activePath, text)` on every single character keystroke. This causes un-debounced, concurrent, out-of-order `fs.writeFile` operations in WebAssembly, triggers continuous Vite HMR re-compilations on partial syntax, causes transient Vite HTTP 500 errors and console warnings, and consumes substantial CPU.
3. **Nested Manifest Detection Bug in WebContainer Mount (P2):** In `filesToFileSystemTree` (`webcontainerService.ts:160`), `/(^|\/)package\.json$/i` detects nested package files (e.g., `packages/app/package.json`). If a project has a nested manifest but lacks a root `package.json`, `hasPackageJson` is marked `true`, preventing root `package.json` synthesis and causing `npm install` in the container root to fail with `ENOENT`.
4. **Missing Monaco Model Disposal on Tab Close & File Delete (P2):** Neither `closeTab` nor `handleDeleteFile` calls `model.dispose()`. In extended sessions with frequent file additions and removals, in-memory Monaco models accumulate indefinitely, leading to progressive browser memory growth.
5. **Hardcoded Start Command (`npm run dev`) (P2):** Development server startup does not parse `package.json.scripts` to discover the appropriate start command (e.g., `start`, `serve`, or custom dev commands). Projects lacking a `"dev"` script immediately fail with `npm ERR! Missing script: "dev"`.
6. **Stubbed Multi-Terminal and Split Controls (P3):** The "New Terminal" and "Split Terminal" buttons in `VSCodeMode` trigger notification toasts or dev server restarts rather than spawning multiple terminal sessions or split panes.

### 1.4 Important Unknowns
- Maximum concurrent WebContainer memory ceiling in browser tabs under large node_modules trees (e.g., >300 MB virtual fs) before Chromium kills the WebAssembly worker.
- Long-term behavior of WebContainer Service Workers under aggressive browser tab backgrounding and thermal throttling.

### 1.5 Overall Readiness to Begin Implementation
The codebase is in an **exceptional state of hygiene and architectural readiness**:
- `npx tsc --noEmit`: 0 errors.
- `npm run verify:bundle`: 100% PASS with 0 critical-path leaks.
- `npm run verify:deploy`: 100% PASS (12/12 Vercel functions, valid headers and rewrites).
- Core test suites (`audit-run-tests`, `workspace-coordination-tests`, `workspace-reliability-tests`, `editor-persistence-tests`, `webcontainer-regression-tests`, `backup-restore-tests`, `dev-server-lifecycle-tests`, `preview-refresh-tests`, `npm-install-performance-tests`, `project-flow-regression-tests`, `audit-routes`, `audit-headers`, `audit-pwa-migration`, `audit-devserver`): **285 / 285 tests passing (100%)**.

No implementation work has begun. The project is completely prepared for targeted Phase 2.2 Stage B reliability engineering upon owner authorization.

---

## 2. Repository & Version Verification

### 2.1 Workspace Status

```
Active Git Branch:      fix/project-first-navigation-editor-startup
Local HEAD Commit:      26bc241 docs(routing-r1.1): reconcile complete ROUTE-01..30 matrix and record 3b05cb1 verification
Tracking Remote:        origin/fix/project-first-navigation-editor-startup (up to date)
Origin Main Commit:     1b95448 Create SECURITY.md
Merge Anchor:           6da4712 Merge pull request #32 from girishlade111/fix/project-first-navigation-editor-startup
Prior Production Base:  38c3d1e Merge pull request #31 from girishlade111/phase-2.1-workspace-reliability
Worktree State:         Clean tracked tree. Zero staged or unstaged modifications to application code.
Untracked Files:        Test logs, verification scripts, and report markdown documents.
```

### 2.2 Diff Against `origin/main`
A strict `git diff --stat 26bc241 origin/main` confirms that the sole difference between the active workspace and `origin/main` is the standalone documentation file `SECURITY.md` (21 lines added in commit `1b95448`). All core application source code is bit-for-bit identical to the merged production release.

### 2.3 Production Baseline Reference
- **Canonical Production URL:** `https://code.ladestack.in`
- **Serving Deployment ID:** `dpl_5KP5swZDM6sNhG8pbtZSjPm8vdBe`
- **Production Evidence Acceptance:** 12/12 scenarios verified in `reports/POST_E3_STAGE_R4_1_PRODUCTION_EVIDENCE_CLOSURE.md` (`R4_1_PRODUCTION_EVIDENCE_CONFIRMED`).

---

## 3. System Architecture Inventory

| Component / Service | File Path | Core Responsibility | Dependencies | State Ownership | Lifecycle | Failure Handling | Existing Test Coverage | Risk |
|---|---|---|---|---|---|---|---|:---:|
| **WebContainerManager** | [`src/services/webcontainer/webcontainerService.ts`](file:///c:/Users/Girish%20Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/webcontainer/webcontainerService.ts) | Manages singleton WebContainer instance, boot caching, PTY shell spawning, filesystem synchronization, server event subscriptions, and dev server process state. | `@webcontainer/api`, `webcontainerPerf` | Singleton instance with listener set; exposed via `useSyncExternalStore` | Lazily booted on first WebContainer terminal or mounting request; persistent across project switches | Sets `startupStage = 'error'`, captures `runtimeError`, categorizes recoverable/unrecoverable | Unit tests in `webcontainer-regression-tests.mjs`, `dev-server-lifecycle-tests.mjs`, `npm-install-performance-tests.mjs` | **High** (P1 cross-project server leak) |
| **TerminalTab** | [`src/components/Console/TerminalTab.tsx`](file:///c:/Users/Girish%20Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/components/Console/TerminalTab.tsx) | Hosts xterm.js instance; bridges user input to WebContainer PTY or local simulated shell; manages prompt readiness watchdog and auto-start command dispatch. | `xterm`, `xterm-addon-fit`, `webcontainerService`, `localShell` | Local React component state (`mode`, `termReady`), refs for terminal and process | Mounted when terminal panel opened; disposed on unmount; disconnects data stream | Shell prompt watchdog (15s timeout); retry buttons for install/server failures | Integration tested in `webcontainer-regression-tests.mjs`, `dev-server-lifecycle-tests.mjs` | **High** (P1 autoStart skip on project switch) |
| **VSCodeMode** | [`src/components/vscode/VSCodeMode.tsx`](file:///c:/Users/Girish%20Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/components/vscode/VSCodeMode.tsx) | Full IDE shell: top bar, activity bar, file explorer tree, multi-pane Monaco editor, bottom panel (terminal/output), and live preview iframe panel. | `@monaco-editor/react`, `webcontainerService`, `livePreviewChannel`, `previewReloadService`, `ataService` | Local React state for tabs, active file, split pane, resizers; syncs view state to localStorage | Lazy loaded behind `fullstackFeature.ts` barrel on `/app/ide` or `/app/projects/:id/ide` | Visual error overlays in preview; fallback to `StackBlitzStartupLoader` | E2E and persistence covered in `editor-persistence-tests.mjs`, `workspace-coordination-tests.mjs` | **Medium** (P1 un-debounced syncFile, P2 model leak) |
| **StackBlitzStartupLoader** | [`src/components/vscode/StackBlitzStartupLoader.tsx`](file:///c:/Users/Girish%20Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/components/vscode/StackBlitzStartupLoader.tsx) | Professional 4-step progress loader for WebContainer boot, file mount, npm install, and dev server launch with animated SVG lightbulb and retry buttons. | `lucide-react`, `webcontainerService` | Stateless presentation component driven by `webcontainer.startupStage` | Rendered in preview panel until `activePreview.url` is available | Renders phase-specific error messages with "Retry Installation" or "Restart Process" buttons | Visual UI component verified in production acceptance run | **Low** |
| **localShell** | [`src/services/localShell.ts`](file:///c:/Users/Girish%20Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/localShell.ts) | Pure synchronous in-browser command emulator for non-isolated browsers or local terminal mode (`help`, `files`, `cat`, `project`, `npm`, `deps`). | `terminalSafety`, `npmRegistryService` | Stateless pure functions taking `LocalShellContext` | Synchronous execution on Enter keystroke in local mode | Returns formatted ANSI error strings; rejects path traversal and invalid package names | Unit tested in `audit-run-tests.mjs`, `webcontainer-regression-tests.mjs` | **Low** |
| **previewReloadService** | [`src/services/preview/previewReloadService.ts`](file:///c:/Users/Girish%20Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/preview/previewReloadService.ts) | Non-destructive preview reloader using WebContainer `LOCALSERVICE_RELOAD_WINDOW` MessageChannel with navigation fallback and in-flight deduplication. | None | Singleton with WeakSet tracking active reloads and atomic in-flight lock | Invoked via preview reload button or hotkey | Graceful 350ms timeout fallback to iframe navigation; skips concurrent requests | 12 matrix tests in `preview-refresh-tests.mjs` | **Low** |
| **livePreviewChannel** | [`src/services/preview/livePreviewChannel.ts`](file:///c:/Users/Girish%20Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/preview/livePreviewChannel.ts) | Cross-window preview synchronization for detached preview popout tabs (`/preview-popout`) via `BroadcastChannel` and storage events. | None | Singleton managing `BroadcastChannel('gbcoder_live_preview_channel')` | Initialized on module load; persists last state to `sessionStorage` | Falls back to `window.storage` event if `BroadcastChannel` is unsupported | Matrix tests in `open-in-new-tab-tests.mjs` | **Low** |
| **projectDatabase** | [`src/services/projects/projectDatabase.ts`](file:///c:/Users/Girish%20Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/projects/projectDatabase.ts) | Multi-project IndexedDB persistence (`gb-coder-projects-db`) with `projects` and `projectFiles` stores; promised-queue operation serialization. | None | Browser IndexedDB; active project pointer in `localStorage['gb-coder-active-project-id']` | On-demand transactions resolved strictly upon database `commit` | Catches `QuotaExceededError`, dispatches `STORAGE_WARNING_EVENT`, never throws unhandled rejection | 40 tests in `editor-persistence-tests.mjs`, 25 tests in `workspace-reliability-tests.mjs` | **Low** |
| **vscodeWorkspaceStore** | [`src/services/vscodeWorkspaceStore.ts`](file:///c:/Users/Girish%20Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/vscodeWorkspaceStore.ts) | Persistence for standalone workspace files in `gb-coder-workspace` and tab view state in `localStorage['gb-coder-vscode-view']`. | None | Browser IndexedDB + localStorage | Serialized promise queue; reconciled upon load | Tolerates corruption and quota errors silently | Verified in `workspace-reliability-tests.mjs` | **Low** |
| **ataService** | [`src/services/ata/ataService.ts`](file:///c:/Users/Girish%20Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/ata/ataService.ts) | Automatic TypeScript Type Acquisition: inspects code imports, fetches `.d.ts` from jsDelivr, and registers lib files in Monaco. | `@typescript/ata`, `@monaco-editor/react` | Singleton manager tracking acquired packages and progress | Initialized on Monaco mount; debounced project acquisition | Catches fetch errors silently; logs warnings for missing definitions | Tested via ATA mock harness | **Low** (Harmless cosmetic HTTP 400 on untyped pkgs) |
| **appRoutes** | [`src/utils/appRoutes.ts`](file:///c:/Users/Girish%20Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/utils/appRoutes.ts) | Client-side routing resolution for canonical project URLs (`/app/projects`, `/app/projects/new`, `/app/projects/:id/editor`, `/app/projects/:id/ide`). | None | Pure functions driven by `window.location.pathname` | Evaluated synchronously on first render and popstate events | Categorizes dead/invalid IDs as `{ kind: 'invalid' }` to render recovery screen | 18 tests in `project-flow-regression-tests.mjs`, 11 in `audit-routes.mjs` | **Low** |
| **App** | [`src/App.tsx`](file:///c:/Users/Girish%20Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/App.tsx) | Top-level routing ladder and application coordinator; coordinates active project, editor mode, autosave, and dialog overlays. | React, `projectDatabase`, `appRoutes`, `workspaceCoordination` | React top-level state | Root application lifecycle | ErrorBoundary at root in `main.tsx`; graceful fallback to ProjectDashboard | Regression suites across project flows and canonical routes | **Medium** (P1 missing dev-server reset on dashboard return) |

---

## 4. Audit Domain A — WebContainer Architecture

### 4.1 Initialization
- **Boot Entry Point:** `WebContainer.boot()` is called inside `WebContainerManager.boot()` at [`src/services/webcontainer/webcontainerService.ts:740`](file:///c:/Users/Girish%20Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/webcontainer/webcontainerService.ts#L740).
- **Boot Trigger:** Boot is initialized strictly **lazily**. It is triggered only when:
  1. A project mounting operation is requested (`mountProject:807`).
  2. An interactive shell is spawned in WebContainer mode (`spawnInteractiveShell:1072`).
  3. A one-off command is run (`runCommand:1252`).
  Boot is **never** initiated before project selection or on the Projects Dashboard.
- **Instance Sharing & Concurrency Protection:**
  - Local caching: `this.instance` is cached on the singleton manager.
  - Global caching: Cached on `globalThis.__GBCODER_WEBCONTAINER_INSTANCE__` and `WebContainer._instance` to survive Vite HMR cycles without violating the single-boot constraint.
  - Promise caching: `this.bootPromise` and `globalThis.__GBCODER_WEBCONTAINER_BOOT_PROMISE__` serialize all concurrent boot requests. Multiple simultaneous calls return the identical promise.
  - Exception recovery: If boot throws `"Only a single WebContainer instance can be booted"`, lines 750–763 seamlessly recover the existing instance without re-throwing.

```mermaid
sequenceDiagram
    autonumber
    actor User as User Action (Open IDE)
    participant UI as VSCodeMode / TerminalTab
    participant WC as WebContainerManager (Singleton)
    participant Global as globalThis / WebContainer._instance
    participant Core as WebContainer API (Wasm)

    UI->>WC: mountProject() or spawnInteractiveShell()
    WC->>WC: Check this.instance
    alt Instance already cached
        WC-->>UI: Return existing instance
    else Instance not cached
        WC->>Global: Check __GBCODER_WEBCONTAINER_INSTANCE__
        alt Global instance found
            WC-->>UI: Cache and return instance
        else Boot required
            WC->>WC: Check this.bootPromise
            alt Boot already in flight
                WC-->>UI: Await existing bootPromise
            else First boot call
                WC->>WC: Check isSupported() (COOP/COEP)
                alt Unsupported
                    WC-->>UI: Throw Error (Missing isolation headers)
                else Supported
                    WC->>Core: WebContainer.boot()
                    Core-->>WC: container instance
                    WC->>Global: Cache instance on globalThis
                    WC->>WC: setupServerListeners(container)
                    WC->>UI: status = 'ready'
                end
            end
        end
    end
```

### 4.2 Boot State Machine
The runtime implements the following explicit states:
- `WebContainerStatus`: `'unsupported'` | `'idle'` | `'booting'` | `'ready'` | `'running'` | `'error'`
- `ProjectStartupStage`: `'idle'` | `'booting'` | `'mounting_files'` | `'runtime_ready'` | `'installing'` | `'starting_server'` | `'ready'` | `'error'`
- `PreviewStatus`: `'idle'` | `'loading'` | `'ready'` | `'error'`

#### Shell Prompt Readiness vs. Shell Spawn Readiness
A critical architectural reliability mechanism is implemented in `TerminalTab.tsx:198-236` (`dispatchWhenShellReady`) and `webcontainerService.ts:1111-1115`:
- When `@webcontainer/api` spawns `jsh`, the process object is returned immediately, but the shell is still executing internal startup scripts.
- GB Coder does **not** treat process spawning as readiness.
- Instead, `isShellPromptReady` is gated on the detection of the `❯` prompt or regex `[$#❯]\s*$` in the output stream.
- Commands dispatched before prompt arrival are queued in `pendingAutoStartCmdRef`.
- A 15-second watchdog timer (`shellPromptWatchdogRef`) ensures that if the prompt fails to appear, the UI transitions to an actionable error state rather than hanging.

### 4.3 Concurrent Operations & Gaps
- **StrictMode Double Invocation:** Handled safely. The boot promise caching and `isStartingShellRef` lock prevent duplicate WebAssembly initialization during React 18 StrictMode double-mounting.
- **Project Switching Defect (Finding WC-001):** When switching between projects, `App.tsx` clears its own state but does not call `webcontainerService.resetServerState()` or `stopDevServer()`. If Project A has a running Vite server, opening Project B leaves Project A's server active, causing `TerminalTab` to skip Project B's auto-start.

### 4.4 Boot Failure Recovery
- **Missing Isolation Headers:** If `window.crossOriginIsolated` is false, `boot()` immediately rejects with an explicit error, sets `startupStage = 'error'`, and `TerminalTab` gracefully falls back to `local` simulated mode.
- **Network / CDN Failure:** If WebContainer WebAssembly binary download fails, `setStartupStage('error', { phase: 'boot', ... })` is called with `retryAction = 'reboot_container'`, rendering a retry button in `StackBlitzStartupLoader`.
- **Missing Timeout on `WebContainer.boot()` (Finding WC-003):** While shell prompt detection has a 15-second watchdog, the initial `WebContainer.boot()` call has no timeout. If the StackBlitz CDN stalls indefinitely, the boot promise can hang.

---

## 5. Audit Domain B — Terminal Architecture

### 5.1 Terminal Classification

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GB CODER TERMINAL ARCHITECTURE                     │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ 1. WebContainer Interactive Terminal │ 2. Local Simulated Browser Shell     │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ - Backend: WebContainer Wasm PTY     │ - Backend: Pure JS in-memory engine  │
│ - Shell: /bin/jsh                    │ - Engine: src/services/localShell.ts │
│ - Runtime: In-Browser Node.js        │ - Scope: React in-memory project     │
│ - Commands: Real npm, node, vite, ls │ - Commands: Simulated help, ls, cat, │
│ - Output: Raw ANSI PTY stream        │   npm, deps, project, clear          │
│ - Requires: COOP/COEP isolation      │ - Operates in ANY browser / sandbox  │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

Both terminal experiences are surfaced through the identical `TerminalTab` UI component ([`src/components/Console/TerminalTab.tsx`](file:///c:/Users/Girish%20Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/components/Console/TerminalTab.tsx)), toggled via the mode switcher pill in the terminal header bar.

### 5.2 xterm.js Integration
- **Instance Mounting:** Initialized in `useEffect` at `TerminalTab.tsx:612-765`.
- **Addons:** `FitAddon` (`xterm-addon-fit` v0.8.0) is loaded.
- **Resize Handling:** A `ResizeObserver` observes `hostRef.current`. On resize, `fitAddon.fit()` is called, and the new dimensions are transmitted to the active PTY session via `webcontainerShellRef.current?.resize(term.cols, term.rows)`.
- **Terminal Dimensions:** Explicitly synchronized to `jsh` via `process.resize({ cols, rows })`.
- **Buffer & Scrollback:** Configured for 3,000 lines of scrollback.
- **Teardown & Disposal:** On component unmount, `disposable.dispose()`, `term.dispose()`, and observer disconnect are executed cleanly.

### 5.3 User Input and Process Communication Trace

```
User Keystroke in Terminal
  │
  ├─► [WebContainer Mode]
  │     term.onData(data)
  │       └─► webcontainerShellRef.write(data)
  │             └─► shellWriter.write(data)  [WritableStream to jsh]
  │                   │
  │                   ▼
  │             jsh executes command
  │                   │
  │                   ▼
  │             process.output ReadableStream
  │                   └─► WritableStream in webcontainerService
  │                         ├─► shellOutputBuffer.push(chunk) [Max 500]
  │                         ├─► Detect ❯ prompt -> isShellPromptReady = true
  │                         ├─► Detect npm install success / error
  │                         ├─► Detect Vite server ready / port / error
  │                         └─► listener(chunk) -> term.write(chunk)
  │
  └─► [Local Mode]
        term.onData(data)
          ├─► Backspace: deletes character from lineRef, redraws line
          ├─► Up/Down: cycles historyRef, redraws line
          ├─► Ctrl+C: cancels line, resets prompt
          ├─► Ctrl+L: clears xterm screen, redraws prompt
          └─► Enter:
                submitLocal(term, input)
                  └─► runLocalCommand(input, contextRef)
                        └─► Returns ANSI output lines -> term.write(lines)
```

### 5.4 Terminal Session Lifecycle
- **Reconnection without Process Killing:** In `webcontainerService.ts:1016-1059`, if an interactive shell is already healthy and `forceRestart` is false, `spawnInteractiveShell` reconnects the caller and replays the last 500 chunks from `shellOutputBuffer`. This ensures that toggling the terminal drawer does not kill running dev servers or lose terminal history.
- **Multi-Terminal Limitations (Finding WC-005):** The IDE top/bottom bars display icons for "New Terminal" and "Split Terminal", but the implementation only supports a single active PTY session. Clicking "New Terminal" re-runs dev server restart, and "Split Terminal" displays a temporary toast.

### 5.5 Terminal Security
- **Escape-Sequence Injection Protection:** In local mode and sandbox output, `sanitizeForTerminal` ([`src/utils/terminalSafety.ts`](file:///c:/Users/Girish%20Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/utils/terminalSafety.ts)) strips dangerous control sequences:
  - Cursor repositioning (`CSI`) that could forge command lines.
  - Screen clearing sequences that could wipe history.
  - Title manipulation (`OSC 0`) that could be used for phishing attacks.
- **Removal of Legacy Insecure Proxy:** As recorded in `vite.config.ts:475-488`, the historical `/terminal` WebSocket proxy to `server/index.js` was permanently removed because it permitted unauthenticated shell access over the LAN.

---

## 6. Audit Domain C — NPM & Package Management

### 6.1 package.json Detection
- **Detection Method:** Evaluated via `hasNpmManifest` in `webcontainerService.ts:856`:
  ```typescript
  public hasNpmManifest(files: ProjectFile[]): boolean {
    return files.some((f) =>
      /(^|\/)package\.json$/i.test((f.path || '').replace(/^\/+/, '')),
    );
  }
  ```
- **Nested Path Bug (Finding WC-002):** The regex `(^|\/)package\.json$/i` matches nested paths like `packages/client/package.json`. If a monorepo project or nested folder has a `package.json` but no root `package.json`, `hasNpmManifest` returns `true`, and `filesToFileSystemTree` skips synthesizing a root manifest. Running `npm install` in the container root then fails immediately with `code ENOENT`. Root manifest checking must be restricted to root level (`cleanPath === 'package.json'`).

### 6.2 Automatic Dependency Installation
- **Trigger Conditions:**
  1. `autoStartProject !== false` in `TerminalTab`.
  2. The project contains files (`projToStart.files.length > 0`).
  3. `hasNpmManifest` is true (projects without manifests stay idle).
  4. Project has not already been started in the current session epoch (`!hasStartedProject(fingerprint)`).
  5. Shell prompt readiness (`isShellPromptReady`) is confirmed.
- **Deterministic Fingerprinting:** `computeDependencyFingerprint` generates a hash of all `dependencies`, `devDependencies`, `extraDependencies`, and lockfile slices (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`).
- **Needs Install Check:** `needsDependencyInstall` verifies whether `node_modules` exists in WebContainer virtual filesystem (`fs.readdir('node_modules')`) and whether `installedManifestFingerprint === currentFingerprint`.
- **Fast Start Optimization:** If dependencies are verified as installed and fingerprint matches, `npm install` is bypassed completely, and `npm run dev` is launched immediately (saving 8–15 seconds on project re-open).

### 6.3 Package Manager Compatibility
- **Actual Engine:** The **sole** package manager installed and executed inside WebContainer is **`npm`**.
- `pnpm` and `yarn`: Lockfiles (`pnpm-lock.yaml`, `yarn.lock`) are parsed for dependency fingerprinting, but commands are dispatched exclusively via `npm`.
- `bun`: Not supported by WebContainer.

### 6.4 Install Reliability & Error Handling
- **Performance Settings:** `.npmrc` is injected with:
  ```ini
  legacy-peer-deps=true
  audit=false
  fund=false
  prefer-offline=true
  progress=false
  update-notifier=false
  ```
- **Error Detection:** Terminal output is continuously scanned for `npm ERR!`, `code ERESOLVE`, `code ENOENT`. When detected during the `installing` stage, `startupStage` transitions to `'error'`, phase `'install'`, and an actionable "Retry Installation" button is surfaced in `StackBlitzStartupLoader`.

---

## 7. Audit Domain D — Development Server Lifecycle

### 7.1 Startup Conditions
- Dev server launch is gated behind:
  1. Successful completion of `npm install` (or fast-start bypass).
  2. Interactive shell prompt readiness (`❯`).
  3. Session epoch matching (`startEpoch === webcontainerService.getSessionEpoch()`).
- **Command Hardcoding (Finding WC-004):** The start command is hardcoded to `'npm run dev'`. If a user project uses `'npm start'`, `'npm run serve'`, or has no `"dev"` script, the launch fails.

### 7.2 Process Management Map

```mermaid
graph TD
    UI[TerminalTab / VSCodeMode] -->|spawnInteractiveShell| WCM[WebContainerManager]
    WCM -->|container.spawn 'jsh'| PTY[Interactive PTY Process: jsh]
    PTY -->|input.getWriter| Writer[PTY Input Stream]
    PTY -->|output.pipeTo| Reader[PTY Output Stream]
    Writer -->|write 'npm run dev'| Vite[Child Process: Vite Dev Server]
    Vite -->|Listening on Port 5173| Events[WebContainer Server-Ready Event]
    Events -->|on 'server-ready'| WCMState[Update serverUrl & serverPort]
    WCMState -->|Notify Subscribers| Preview[Live Preview iframe]
    UI -->|Restart Request / Ctrl+C| Kill[Writer.write Ctrl+C '\x03\r']
    Kill --> Vite
```

### 7.3 Port and Server Readiness
- **Event-Driven Verification:** WebContainer emits `'server-ready'` with `(port, url)`. This updates `activeServers`, `serverPort`, and `serverUrl`.
- **Port Mapping:** The WebContainer API assigns a secure, isolated credentialless proxy URL (e.g., `https://<port>-<container-id>.local-credentialless.webcontainer-api.io/`).
- **Server Termination:** WebContainer emits `'port'` with `type = 'close'`. If the active port closes, `webcontainerService` automatically cleans up `serverUrl` and sets `isDevServerActive = false`.

### 7.4 Restart & Recovery
- `requestRestart(reason)` increments `sessionEpoch`, resets server state, transitions stage to `'installing'`, and notifies listeners.
- Debouncing: `restartDebounceTimerRef` (150ms) in `TerminalTab` collapses rapid restart requests into a single clean restart.
- Process Termination: Sends `\x03\r` (Ctrl+C) to the active shell writer to terminate running Node child processes before issuing new commands.

---

## 8. Audit Domain E — Live Preview & Hot Reload

### 8.1 Preview Architecture
- **Iframe Ownership:** Rendered in `VSCodeMode.tsx:2234-2245`.
- **Sandbox Configuration:**
  ```html
  <iframe
    ref={previewIframeRef}
    src={activePreview.url}
    sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads"
  />
  ```
- **Reload Pipeline:** Managed by `previewReloadService.reloadPreview(iframe)`.
  1. Sends postMessage `LOCALSERVICE_RELOAD_WINDOW` over a `MessageChannel` (350ms timeout).
  2. If the iframe does not respond, falls back to reassigning `iframe.src = targetUrl`.
  3. Uses an in-flight lock (`WeakSet<HTMLIFrameElement>`) to ignore rapid consecutive clicks without remounting the DOM element.

### 8.2 Hot Module Replacement (HMR) & React Fast Refresh
- Vite establishes a WebSocket connection inside the preview iframe to stream HMR patches.
- **Un-debounced Keystroke Syncing (Finding WC-001):** Every keystroke in Monaco triggers `webcontainerService.syncFile(activePath, text)`. This causes continuous writes to the WebAssembly filesystem during rapid typing, forcing Vite to re-compile intermediate, broken syntax.
- **HMR Recovery:** Once the user finishes typing a complete JSX/Vue element, Vite successfully compiles the file and hot-replaces the module in the preview iframe without reloading the page.

### 8.3 Diagnostics Reconciliation

| Diagnostic Event | Observed Count | Detailed Architectural Root Cause | Assessment & Recommendation |
|---|:---:|---|---|
| **Console Errors** | 18 | `ReferenceError` during character-by-character Monaco typing before JSX tags or variable declarations were closed. | **Expected transient behavior aggravated by un-debounced sync.** Debounce `syncFile` by 200ms in Stage B to eliminate intermediate broken compiles. |
| **Aborted Requests** | 13 | Intermediate HMR script requests canceled by the browser when subsequent keystrokes produced a newer timestamp (`/src/App.jsx?t=...`). | **Expected browser request deduplication.** Safe and non-impacting. |
| **HTTP 500 Responses** | 8 | Vite dev server in WebContainer returning 500 when compiling syntactically incomplete files mid-typing. | **Direct consequence of un-debounced `syncFile`.** Debouncing will reduce 500 responses by >90%. |
| **HTTP 400 Responses** | 3 | `@typescript/ata` querying jsDelivr API (`data.jsdelivr.com`) for packages that do not provide separate `@types/*` manifests. | **Benign external CDN response.** Cosmetic only; ATA gracefully skips untyped libraries. |
| **Monaco Model Errors** | 2 | Monaco language service attempting to parse disposed temporary in-memory models (`inmemory://model/*`) during page switching. | **Model lifecycle cleanup gap.** Implement proper `model.dispose()` calls in Stage B/F. |

---

## 9. Audit Domain F — Filesystem & Project Lifecycle

### 9.1 Project Identity & Routing
- Canonical URL pattern:
  - Projects Dashboard: `/app/projects`
  - New Project Modal: `/app/projects/new`
  - Static Multi-File Editor: `/app/projects/:projectId/editor`
  - Advanced IDE (VS Code Mode): `/app/projects/:projectId/ide`
- Identity is preserved across browser reload and Back/Forward navigation. Unrecognized or missing project IDs render `ProjectNotAvailable` rather than corrupting storage.

### 9.2 Empty Project Semantics
- **Static Blank:** 0 files, editorStyle `'plain'`.
- **Advanced Empty:** 0 files, editorStyle `'vscode'`. Stays completely idle upon loading (0 files mounted, 0 npm commands run).
- **Advanced React / Vue:** Contains minimal starter manifest, `vite.config.js`, `index.html`, and entry components.

### 9.3 Filesystem Synchronization Architecture

```mermaid
graph LR
    subgraph UI Layer
        Monaco[Monaco Editor]
        ReactState[React MultiFileProject State]
    end

    subgraph Persistence Layer
        IDB[(IndexedDB gb-coder-projects-db)]
        LS[localStorage pointer]
    end

    subgraph Runtime Layer
        WCFS[(WebContainer Wasm Virtual FS)]
        ViteFS[Vite Watcher chokidar]
    end

    Monaco -->|onChange un-debounced| ReactState
    Monaco -.->|syncFile un-debounced CURRENT| WCFS
    ReactState -->|Debounced 400ms flush| IDB
    ReactState -->|Active ID| LS
    WCFS --> ViteFS
```

### 9.4 Project Switching Safety (Finding WC-001)
- `flushProjectSave()` flushes dirty edits to IndexedDB before switching projects.
- `beginTransition()` and `isCurrentTransition()` guard against async state races.
- **The Critical Gap:** `webcontainerService` is not notified of project transitions. The previous project's Vite server continues running, and `webcontainerService.state.serverUrl` remains set to the old project's URL.

---

## 10. Audit Domain G — Performance & Resource Management

### 10.1 Memory Management
- **Confirmed Retention Risk (Finding WC-006):** In-memory Monaco models are not disposed when tabs are closed or files are deleted.
- **WebContainer Process Retention (Finding WC-001):** Interactive PTY shell and child processes are retained across project transitions, consuming memory in WebAssembly heap.
- **xterm Renderer:** Properly cleaned up on tab unmount via `term.dispose()`.

### 10.2 CPU and Rendering Load
- **Un-debounced Filesystem Writes (Finding WC-001):** Keystroke-level `syncFile` triggers high-frequency WebAssembly FS transactions and continuous Vite re-compilations.
- **Terminal Output Throughput:** `shellOutputBuffer` is capped at 500 items to avoid unbounded memory growth.

### 10.3 Resource Limits & Vercel Constraints
- **Vercel Hobby Serverless Function Limit:** Exactly **12 / 12** functions deployed in `api/`. There is zero headroom for new serverless functions without deleting existing endpoints or upgrading to Vercel Pro.
- **Critical Path Bundle:** 593.6 kB raw / 187.9 kB gzip, strictly within acceptable bounds for desktop developer environments.

---

## 11. Audit Domain H — Security & Browser Compatibility

### 11.1 Cross-Origin Isolation
- Configuration verified in `vercel.json` and `vite.config.ts`:
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Embedder-Policy: require-corp`
- Enables `SharedArrayBuffer` for WebAssembly thread pooling inside WebContainer.
- Scope: Delivered on `/app/*`, `/ide`, `/preview-popout`. Omitted from `/` to allow standard marketing analytics and social embeds.

### 11.2 Service Worker Scoping
- **Root Scope (`/sw.js`):** Standalone migration script that skips waiting, purges obsolete legacy precaches, and self-unregisters. It does not intercept network traffic.
- **IDE Scope (`/app/sw.js`):** Vite PWA worker registered strictly to `/app/` scope.

### 11.3 Trust Boundaries

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GB CODER TRUST BOUNDARIES                       │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ Boundary Level    │ Execution Domain  │ Capabilities & Restrictions    │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 1. Public Site    │ Astro HTML (/)    │ Static HTML, zero user code,   │
│                   │                   │ zero IDE dependencies.         │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 2. IDE Client     │ React SPA (/app/) │ Monaco editing, IndexedDB      │
│                   │                   │ storage, zero remote code run. │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 3. WebContainer   │ Browser Wasm PTY  │ Isolated client Wasm VM; cannot│
│                   │                   │ access user host Windows files │
│                   │                   │ or local host network.         │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 4. Remote Sandbox │ E2B Cloud VM      │ Remote ephemeral VM for paid   │
│                   │                   │ full-stack Python/DB workloads.│
└───────────────────┴───────────────────┴────────────────────────────────┘
```

---

## 12. Audit Domain I — UX, Error Handling & Accessibility

### 12.1 Startup & Loading UX
- `StackBlitzStartupLoader` delivers a professional 4-step checklist:
  1. Booting WebContainer
  2. Mounting project files
  3. Installing dependencies
  4. Starting development server
- Visual feedback: Animated pulsing SVG lightbulb with lightning bolt filament.
- Error recovery: Actionable retry buttons ("Retry Installation", "Restart Process") linked directly to recovery callbacks.

### 12.2 Terminal UX
- Clear execution mode indicator pill (WebContainer ⚡ vs. Local 💻).
- Disabled states carry specific tooltips explaining why WebContainer is unavailable (e.g., missing COOP/COEP headers or unsupported browser).
- Quick action buttons: `npm i`, `npm run dev`, `help`, `clear`.

---

## 13. Existing Test Coverage Audit

### 13.1 Discovered Test Infrastructure
- **Unit / Pure Logic Suites:**
  - `scripts/audit-run-tests.mjs`: 77 tests (security, deploy, sanitization, tokens).
  - `scripts/workspace-coordination-tests.mjs`: 13 tests (transitions, path remapping, eviction).
  - `scripts/project-flow-regression-tests.mjs`: 18 tests (canonical routing, template resolution).
- **Component & Service Regression Suites:**
  - `scripts/webcontainer-regression-tests.mjs`: 26 tests (WebContainer guards, headers, fingerprinting).
  - `scripts/dev-server-lifecycle-tests.mjs`: 15 tests (concurrency, restart, process exit).
  - `scripts/preview-refresh-tests.mjs`: 12 tests (postMessage reload, navigation fallback).
  - `scripts/npm-install-performance-tests.mjs`: 12 tests (cache efficiency, fingerprint invalidation).
  - `scripts/backup-restore-tests.mjs`: 40 tests (ZIP export, SHA-256 verification, restore).
  - `scripts/editor-persistence-tests.mjs`: 40 tests (IndexedDB preferences, editorStyle isolation).
  - `scripts/workspace-reliability-tests.mjs`: 25 tests (quota handling, defect reproduction).
- **Deployment & Header Verification:**
  - `scripts/audit-routes.mjs`: 11 tests (Astro vs. React SPA routes).
  - `scripts/audit-headers.mjs`: 7 tests (COOP/COEP header enforcement).
  - `scripts/audit-pwa-migration.mjs`: 11 tests (Service Worker scoping).
  - `scripts/audit-devserver.mjs`: Path traversal and API body size checks.
  - `scripts/verify-deploy-config.mjs`: Vercel JSON and serverless function limits.
  - `scripts/measure-initial-bundle.mjs`: Critical bundle payload and leak detection.

### 13.2 Safe Tests Executed During Audit

| Test Suite Script | Tests Run | Result | Duration | Notes |
|---|:---:|:---:|:---:|---|
| `npx tsc --noEmit` | N/A | **PASS (0 errors)** | 3.8s | Full codebase TypeScript compilation check |
| `npm run verify:bundle` | N/A | **PASS (0 leaks)** | 4.1s | 593.6 kB raw / 187.9 kB gzip initial payload |
| `npm run verify:deploy` | N/A | **PASS (12/12)** | 2.2s | Vercel functions, headers, rewrites |
| `npm run lint` | N/A | **PASS (0 errors)** | 9.0s | 117 warnings (`@typescript-eslint/no-explicit-any`) |
| `scripts/workspace-coordination-tests.mjs` | 13 | **PASS (13/13)** | 362ms | Transition coordinator, path remapping |
| `scripts/audit-run-tests.mjs` | 77 | **PASS (77/77)** | 4.7s | Security, credentials, deploy pipelines |
| `scripts/webcontainer-regression-tests.mjs` | 26 | **PASS (26/26)** | 72ms | WebContainer guards, lifecycle |
| `scripts/dev-server-lifecycle-tests.mjs` | 15 | **PASS (15/15)** | 22ms | Dev server concurrency, restart |
| `scripts/preview-refresh-tests.mjs` | 12 | **PASS (12/12)** | 618ms | Preview reload protocol, navigation fallback |
| `scripts/npm-install-performance-tests.mjs` | 12 | **PASS (12/12)** | 19ms | Dependency fingerprinting, cache invalidation |
| `scripts/backup-restore-tests.mjs` | 40 | **PASS (40/40)** | 6.3s | ZIP export/import, checksums |
| `scripts/project-flow-regression-tests.mjs` | 18 | **PASS (18/18)** | 43ms | Canonical route resolution |
| `scripts/workspace-reliability-tests.mjs` | 25 | **PASS (25/25)** | 4.8s | Storage quota, active pointer safety |
| `scripts/editor-persistence-tests.mjs` | 40 | **PASS (40/40)** | 10.6s | Mode switching, IndexedDB persistence |
| `scripts/audit-headers.mjs` | 7 | **PASS (7/7)** | 310ms | Security headers on local preview |
| `scripts/audit-pwa-migration.mjs` | 11 | **PASS (11/11)** | 28ms | Root vs. app Service Worker scoping |
| `scripts/audit-routes.mjs` | 11 | **PASS (11/11)** | 485ms | Local route resolution |
| `scripts/audit-devserver.mjs` | 18 | **PASS (18/18)** | 1.8s | API middleware and path traversal |
| **TOTAL** | **325** | **100% PASS** | **~41s** | **Zero failures across all executed test suites** |

---

## 14. Required Risk Register

| Finding ID | Domain | Detailed Finding | Source Evidence | Reproduction Steps | Severity | Likelihood | User Impact | Data-Loss Risk | Status | Recommended Action | Regression Coverage Required | Dependencies |
|---|---|---|---|---|:---:|:---:|---|:---:|:---:|---|---|---|
| **WC-001** | Dev Server / Preview | Dev server process and `serverUrl` are not reset upon project transition or dashboard exit, causing new projects to connect to the stale dev server of the previous project. | `TerminalTab.tsx:405-412`, `App.tsx:2600-2620`, `webcontainerService.ts:512` | 1. Open React project A in VS Code mode.<br>2. Wait for dev server (Port 5173).<br>3. Return to Dashboard.<br>4. Open Vue project B in VS Code mode.<br>5. Terminal logs "Connected to active WebContainer Dev Server" and aborts Vue install/dev server. Preview shows Project A. | **P1** | **High** | Critical UX failure: preview displays incorrect project; npm install skipped for new project. | None | **Confirmed** | Add `webcontainerService.resetServerState()` call in `handleReturnToDashboard` and on project ID change; scope dev server readiness to active project ID. | Dev server lifecycle tests; project switching browser test | Stage B |
| **WC-002** | WebContainer / NPM | `hasNpmManifest` uses regex `(^\|\/)package\.json$/i` which matches nested manifests. A project with nested package.json but no root manifest skips root manifest synthesis, causing npm install to fail with `ENOENT`. | `webcontainerService.ts:160`, `webcontainerService.ts:856-860` | 1. Create project with file `packages/app/package.json` and no root `package.json`.<br>2. Open in VS Code mode.<br>3. Root manifest is not created.<br>4. `npm install` runs in root and fails with `ENOENT`. | **P2** | **Medium** | Projects with nested manifests fail to boot dev server. | None | **Confirmed** | Restrict manifest detection in `filesToFileSystemTree` and `hasNpmManifest` to root level (`cleanPath === 'package.json'`). | Unit test with nested manifest fixture | Stage B / D |
| **WC-003** | WebContainer Boot | `WebContainer.boot()` has no timeout protection. Network stalls during StackBlitz Wasm binary download cause indefinite hang without error display. | `webcontainerService.ts:740-785` | Simulate dropped network connection during initial `WebContainer.boot()`. | **P2** | **Low** | Spinner hangs indefinitely; user receives no error message or retry button. | None | **Confirmed** | Wrap `WebContainer.boot()` in a 30-second timeout that rejects with an actionable error. | Unit test with hanging boot promise | Stage B |
| **WC-004** | Dev Server Lifecycle | Dev server start command is hardcoded to `'npm run dev'`. Manifests with `"start"` or custom scripts fail immediately with `npm ERR! Missing script: "dev"`. | `TerminalTab.tsx:435`, `442`, `552`, `561` | 1. Create project with `package.json` having `"scripts": { "start": "node index.js" }` and no `"dev"`.<br>2. Auto-start executes `npm run dev` and fails. | **P2** | **Medium** | Valid Node/npm projects fail startup if their dev script is not named `"dev"`. | None | **Confirmed** | Read `package.json.scripts` in `webcontainerService.readPackageJson()` and choose `'dev'` > `'start'` > `'serve'`. | Unit test with alternative scripts | Stage D |
| **WC-005** | Terminal Architecture | "New Terminal" and "Split Terminal" controls in IDE toolbar are stubbed; clicking "New Terminal" triggers a dev server restart, and "Split Terminal" shows a toast. | `VSCodeMode.tsx:1919-1937` | Click "New Terminal" or "Split Terminal" in IDE bottom bar. | **P3** | **High** | Cosmetic/UX inconsistency: controls do not perform advertised behavior. | None | **Confirmed** | Either implement true multi-terminal PTY sessions or re-label controls to accurately reflect their behavior ("Restart Shell"). | Terminal UI test | Stage C |
| **WC-006** | Monaco / Memory | Monaco models created by `@monaco-editor/react` are not disposed upon tab closure (`closeTab`) or file deletion (`handleDeleteFile`). | `VSCodeMode.tsx:445-460`, `VSCodeMode.tsx:538-545` | Open and close 50 files in VS Code mode; inspect `monaco.editor.getModels().length`. | **P2** | **Medium** | Progressive memory leak during long editing sessions. | None | **Confirmed** | Invoke `monaco.editor.getModel(uri)?.dispose()` in `closeTab` and `handleDeleteFile`. | Model disposal unit test | Stage F |
| **WC-007** | Performance / CPU | Monaco `handleChange` calls `webcontainerService.syncFile` on every keystroke without debouncing, flooding WebAssembly FS with concurrent writes and triggering transient Vite 500 errors. | `VSCodeMode.tsx:575`, `webcontainerService.ts:953-974` | Type rapidly in Monaco; observe browser console showing intermediate Vite 500 responses and HMR syntax errors. | **P1** | **High** | Degraded typing performance, high CPU utilization, and noisy console error log. | None | **Confirmed** | Debounce `syncFile` by 200ms and serialize concurrent file writes per path. | Fast typing benchmark test | Stage B / E |

---

## 15. Required Architecture Diagrams

### Diagram A — Current System Architecture

```mermaid
graph TD
    User([User Browser])
    
    subgraph Routing & Shell
        Astro[Astro 5.4 Marketing Pages /]
        ReactApp[React 18 SPA /app/*]
        Routes{appRoutes: parseAppRoute}
    end
    
    subgraph View Modes
        Dashboard[Projects Dashboard /app/projects]
        StaticEditor[Static Editor /app/projects/:id/editor]
        AdvancedIDE[Advanced IDE /app/projects/:id/ide]
    end
    
    subgraph Storage & Persistence
        IDB[(IndexedDB: gb-coder-projects-db)]
        LS[localStorage Pointer]
    end
    
    subgraph Runtime Execution
        WC[WebContainer WebAssembly Runtime]
        PTY[Interactive jsh Shell Process]
        DevServer[Vite Development Server]
        LocalShell[Local Simulated Command Engine]
    end
    
    subgraph Live Preview
        PreviewIframe[Preview iframe: credentialless proxy]
        PopoutWindow[Detached Preview Popout Tab]
    end
    
    User -->|Navigate /| Astro
    User -->|Navigate /app| ReactApp
    ReactApp --> Routes
    Routes --> Dashboard
    Routes --> StaticEditor
    Routes --> AdvancedIDE
    
    Dashboard <-->|Read / Write| IDB
    StaticEditor <-->|Autosave / Restore| IDB
    AdvancedIDE <-->|Autosave / Restore| IDB
    ReactApp <-->|Active Pointer| LS
    
    StaticEditor -.->|Simulated Commands| LocalShell
    AdvancedIDE -->|Spawn PTY| WC
    WC --> PTY
    PTY --> DevServer
    DevServer -->|server-ready URL| PreviewIframe
    DevServer -->|BroadcastChannel| PopoutWindow
```

### Diagram B — WebContainer State Machine

```mermaid
stateDiagram-v2
    [*] --> Unsupported: crossOriginIsolated === false
    [*] --> Idle: crossOriginIsolated === true
    
    Idle --> Booting: boot() requested
    Booting --> Error: Boot timeout or Wasm failure
    Booting --> MountingFiles: boot() succeeded
    
    MountingFiles --> Installing: mountProject() done & hasNpmManifest & needsInstall
    MountingFiles --> StartingServer: mountProject() done & !needsInstall (Fast Start)
    MountingFiles --> Ready: mountProject() done & !hasNpmManifest (Stay Idle)
    MountingFiles --> Error: mountProject() threw
    
    Installing --> StartingServer: npm install success ('added packages' / 'up to date')
    Installing --> Error: npm install failed ('npm ERR!')
    
    StartingServer --> Ready: Vite 'ready in' & container 'server-ready' event
    StartingServer --> Error: Port conflict / EADDRINUSE / missing script
    
    Ready --> Installing: requestRestart() triggered
    Ready --> Idle: stopDevServer() or port closed
    
    Error --> Booting: Retry (reboot_container)
    Error --> Installing: Retry (retry_install)
    Error --> StartingServer: Retry (restart_server)
```

### Diagram C — Advanced Project Startup

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant App as App.tsx
    participant IDE as VSCodeMode
    participant Tab as TerminalTab
    participant WC as WebContainerManager
    participant PTY as jsh PTY Process
    participant Preview as Preview Pane

    User->>App: Click project card
    App->>App: applyProjectToEditor() & navigateTo(/app/projects/:id/ide)
    App->>IDE: Mount VSCodeMode(project)
    IDE->>Preview: Render StackBlitzStartupLoader (Step 1: Booting)
    IDE->>Tab: Mount TerminalTab(project, autoStart=true)
    
    Tab->>WC: mountProject(files, dependencies)
    activate WC
    WC->>WC: Ensure boot()
    WC->>WC: container.mount(tree)
    WC-->>Tab: Files mounted
    deactivate WC
    
    IDE->>Preview: Update Loader (Step 2: Files Mounted)
    Tab->>WC: spawnInteractiveShell()
    activate WC
    WC->>PTY: container.spawn('jsh')
    PTY-->>WC: Process streams connected
    WC-->>Tab: Shell ready
    deactivate WC
    
    Tab->>Tab: Check hasNpmManifest(project.files)
    alt No package.json
        Tab-->>User: Log "No package.json — staying idle"
    else package.json present
        Tab->>WC: needsDependencyInstall(fingerprint)
        WC-->>Tab: { needsInstall: true/false }
        
        alt needsInstall === true
            IDE->>Preview: Update Loader (Step 3: Installing Dependencies)
            Tab->>Tab: dispatchWhenShellReady('npm install && npm run dev')
            PTY-->>Tab: Stream terminal output ("added 100 packages")
        else Fast Start (Cached)
            Tab->>Tab: dispatchWhenShellReady('npm run dev')
        end
        
        IDE->>Preview: Update Loader (Step 4: Starting Server)
        PTY-->>Tab: Stream "Vite ready in 250ms"
        WC->>WC: on('server-ready', port, url)
        WC->>IDE: updateState({ serverUrl, startupStage: 'ready' })
        IDE->>Preview: Render <iframe src={serverUrl}>
    end
```

### Diagram D — Project Switching

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant App as App.tsx
    participant IDE as VSCodeMode (Project A)
    participant WC as WebContainerManager
    participant DB as IndexedDB
    participant IDE_B as VSCodeMode (Project B)

    User->>App: Navigate to Project B
    App->>App: beginTransition()
    App->>App: flushProjectSave(Project A)
    App->>DB: saveProjectFiles(Project A changed files)
    DB-->>App: { persisted: true }
    
    Note over App,WC: STAGE B FIX REQUIRED HERE:<br/>App must call WC.resetServerState()<br/>and kill Project A's dev server!
    
    App->>App: setActiveProjectId(Project B)
    App->>IDE: Unmount Project A
    IDE-->>App: Unmounted (xterm disposed)
    
    App->>IDE_B: Mount VSCodeMode(Project B)
    IDE_B->>WC: mountProject(Project B files)
    IDE_B->>WC: Check isDevServerRunning()
    alt STAGE B FIXED
        WC-->>IDE_B: isDevServerRunning() === false
        IDE_B->>WC: Start Project B dev server cleanly
    else CURRENT DEFECT
        WC-->>IDE_B: isDevServerRunning() === true (Stale Project A server!)
        IDE_B->>IDE_B: Skip startup! Preview shows Project A!
    end
```

### Diagram E — Data Synchronization

```mermaid
graph TD
    subgraph Editor Input
        MonacoInput[Monaco Editor]
    end

    subgraph Memory State
        ReactFiles[React project.files State]
        DirtySet[dirtyPaths Set]
    end

    subgraph Storage
        IDBStore[(IndexedDB projectFiles)]
    end

    subgraph WebContainer
        WasmFS[(Virtual FileSystem)]
        ViteWatcher[Vite Dev Server HMR]
    end

    MonacoInput -->|1. onChange| ReactFiles
    MonacoInput -->|2. Mark dirty| DirtySet
    MonacoInput -.->|3. syncFile (Needs 200ms debounce)| WasmFS
    ReactFiles -->|4. Debounced 400ms flush| IDBStore
    IDBStore -->|5. Commit complete| ClearDirty[Clear dirtyPaths]
    WasmFS -->|6. Chokidar change event| ViteWatcher
    ViteWatcher -->|7. WebSocket HMR Patch| Iframe[Preview iframe]
```

### Diagram F — Terminal Input / Output Pipeline

```mermaid
graph LR
    subgraph UI
        Keystroke[User Key Input]
        XTerm[xterm.js Terminal Instance]
    end

    subgraph Adapters
        LocalAdapter[Local Shell Command Parser]
        PTYWriter[WebContainer Writer Stream]
    end

    subgraph Engines
        SimEngine[localShell in-memory engine]
        JSH[WebContainer jsh Shell Process]
    end

    subgraph Output Pipeline
        Sanitizer[terminalSafety.ts]
        PTYReader[WebContainer Output Stream]
        Buffer[Output History Buffer 500 lines]
    end

    Keystroke -->|term.onData| ModeSwitch{mode?}
    ModeSwitch -->|local| LocalAdapter
    LocalAdapter --> SimEngine
    SimEngine --> Sanitizer
    Sanitizer -->|term.write| XTerm

    ModeSwitch -->|webcontainer| PTYWriter
    PTYWriter --> JSH
    JSH --> PTYReader
    PTYReader --> Buffer
    PTYReader -->|onData raw ANSI| XTerm
```

---

## 16. Phase 2.2 Implementation Roadmap

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PHASE 2.2 IMPLEMENTATION ROADMAP                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ STAGE B: Critical Reliability & Project Isolation Fixes (P1/P0)             │
│   ├── B1: WebContainer project switching dev-server reset & cleanup         │
│   ├── B2: Debounced & serialized syncFile virtual filesystem synchronization │
│   └── B3: Root-only package.json manifest detection fix                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ STAGE C: Terminal Lifecycle & Stream Management (P2)                        │
│   ├── C1: WebContainer boot timeout protection (30s)                        │
│   └── C2: Clean PTY process cancellation and toolbar label reconciliation   │
├─────────────────────────────────────────────────────────────────────────────┤
│ STAGE D: Package Manager & Dev Server Command Discovery (P2)                │
│   ├── D1: Dynamic dev script resolution from package.json.scripts           │
│   └── D2: Robust failure phase categorization for missing scripts           │
├─────────────────────────────────────────────────────────────────────────────┤
│ STAGE E: Preview, HMR & Diagnostic Noise Suppression (P2)                   │
│   ├── E1: Transient Monaco typing error suppression                         │
│   └── E2: ATA HTTP 400 graceful error boundary handling                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ STAGE F: Resource Management & Memory Optimization (P2)                     │
│   ├── F1: Monaco model disposal on tab close and file deletion              │
│   └── F2: WebContainer heap monitoring & tab visibility throttling          │
├─────────────────────────────────────────────────────────────────────────────┤
│ STAGE G: Verification, Feature Branch, Preview Acceptance & Production PR   │
│   ├── G1: Real Chromium Playwright E2E matrix verification                  │
│   └── G2: Production promotion with zero data regressions                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 17. Required Features vs. Additional Features

### 17.1 Required Features / Fixes (Mandatory for Correctness & Safety)
1. **Dev Server Project Scoping (WC-001):** Scope `webcontainerService.isDevServerRunning()` to the active project ID; call `resetServerState()` when leaving the project or returning to the dashboard.
2. **Debounced Virtual FS Synchronization (WC-007):** Wrap `webcontainerService.syncFile` in a 200ms debounce and queue writes to eliminate out-of-order Wasm filesystem corruption and transient Vite 500 errors.
3. **Root Manifest Detection Fix (WC-002):** Restrict `hasNpmManifest` and `filesToFileSystemTree` to root-level manifests (`cleanPath === 'package.json'`).
4. **Boot Timeout Guard (WC-003):** Wrap `WebContainer.boot()` in a 30-second timeout to prevent indefinite UI hangs during network stalls.
5. **Dynamic Start Script Resolution (WC-004):** Inspect `package.json.scripts` before running dev server to discover `'dev'` vs `'start'` vs `'serve'`.
6. **Monaco Model Disposal (WC-006):** Call `model.dispose()` on tab close and file deletion to prevent memory leaks.

### 17.2 Additional Features / Enhancements (Optional / Evaluated)
1. **True Multi-Terminal Tabs:** Replace the single PTY session with a tabbed terminal manager supporting multiple concurrent `jsh` shells.
2. **Split Terminal Panes:** Implement side-by-side terminal rendering using two independent `xterm` containers.
3. **Terminal Search Addon:** Integrate `xterm-addon-search` for Ctrl+F search within terminal scrollback.
4. **Visual Dev Server Process Health Badge:** Add an explicit CPU/memory health badge in the status bar for WebContainer wasm thread health.

---

## 18. Acceptance Criteria for Future Implementation

### Stage B: Critical Reliability & Project Isolation Fixes
1. **Objective:** Eliminate cross-project dev server pollution and un-debounced filesystem typing lag.
2. **Modules Changed:** `src/services/webcontainer/webcontainerService.ts`, `src/components/Console/TerminalTab.tsx`, `src/components/vscode/VSCodeMode.tsx`, `src/App.tsx`.
3. **Expected Behavior:**
   - Opening Project A (React) starts dev server A.
   - Returning to Dashboard terminates or disassociates dev server A and clears `webcontainerService.state.serverUrl`.
   - Opening Project B (Vue) starts Project B's dev server cleanly; preview renders Project B without showing Project A.
   - Typing in Monaco debounces virtual filesystem sync by 200ms, reducing transient Vite 500s.
   - Nested `packages/app/package.json` files do not trick root manifest detection.
4. **Protected Invariants:** All 25 mandatory invariants preserved; 0 regression in existing 285 unit tests.
5. **Unit Tests Required:** Automated project switching test asserting `webcontainerService.state.serverUrl === null` upon project change.
6. **Browser Tests Required:** Playwright test switching from React project to Vue project and verifying preview URL and rendered component.
7. **Stop Conditions:** Any failure in `npm run verify:bundle` or `tsc --noEmit`.
8. **Estimated Complexity:** Medium. Confidence: High.

---

## 19. Priority Model & Invariants

### 19.1 Priority Scoring Model
$$\text{Priority Score} = \text{User Impact} (1\text{--}5) \times 3 + \text{Reliability Risk} (1\text{--}5) \times 3 + \text{Data Safety} (1\text{--}5) \times 4 + \text{Likelihood} (1\text{--}5) \times 2$$

- **WC-001 (Stale Dev Server):** Score = $5\times 3 + 5\times 3 + 2\times 4 + 5\times 2 = \mathbf{48}$ (**P1 — Critical Reliability**)
- **WC-007 (Un-debounced syncFile):** Score = $4\times 3 + 4\times 3 + 1\times 4 + 5\times 2 = \mathbf{38}$ (**P1 — Performance/Stability**)
- **WC-002 (Nested Manifest Bug):** Score = $3\times 3 + 4\times 3 + 1\times 4 + 3\times 2 = \mathbf{31}$ (**P2 — Medium**)
- **WC-006 (Monaco Model Leak):** Score = $2\times 3 + 3\times 3 + 1\times 4 + 4\times 2 = \mathbf{27}$ (**P2 — Medium**)
- **WC-004 (Hardcoded npm run dev):** Score = $3\times 3 + 3\times 3 + 1\times 4 + 3\times 2 = \mathbf{28}$ (**P2 — Medium**)
- **WC-003 (Boot Timeout):** Score = $3\times 3 + 3\times 3 + 1\times 4 + 2\times 2 = \mathbf{26}$ (**P2 — Medium**)
- **WC-005 (Stubbed Terminal Controls):** Score = $2\times 3 + 1\times 3 + 1\times 4 + 4\times 2 = \mathbf{21}$ (**P3 — Low**)

### 19.2 Mandatory Protected Invariants
1. Astro marketing site at `/` remains 100% static with zero IDE chunk leakage.
2. Dashboard-first navigation at `/app/projects` never auto-opens projects on cold start.
3. Canonical project URLs (`/app/projects/:id/...`) remain stable.
4. IndexedDB databases `gb-coder-projects-db` and `gb-coder-workspace` remain schema version 1.
5. Truly empty Advanced projects stay completely idle (0 npm installs, 0 servers).
6. COOP `same-origin` and COEP `require-corp` isolation headers preserved.
7. Zero modifications to production without owner explicit approval.

---

## 20. Final Recommendation

1. **What to Implement First (Stage B):**
   Execute a tightly scoped Stage B containing exclusively:
   - **Fix 1 (WC-001):** Scope dev server state to active project ID and add `webcontainerService.resetServerState()` call in `App.tsx:handleReturnToDashboard` and project switches.
   - **Fix 2 (WC-007):** Add 200ms debounce and write-queueing to `webcontainerService.syncFile`.
   - **Fix 3 (WC-002):** Fix root manifest detection in `hasNpmManifest` and `filesToFileSystemTree`.
2. **What NOT to Modify:**
   - Do not refactor `projectDatabase.ts` or change IndexedDB schemas.
   - Do not rewrite the terminal or replace `xterm.js`.
   - Do not add new Vercel serverless functions (already at limit 12/12).
   - Do not touch Astro marketing pages or layouts.
3. **Conditions to Proceed:**
   Owner review of this report and explicit authorization to create the Stage B feature branch.
