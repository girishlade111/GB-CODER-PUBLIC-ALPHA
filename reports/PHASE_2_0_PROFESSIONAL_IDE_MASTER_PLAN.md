# GB Coder — Phase 2.0: Professional IDE Master Plan

**Status:** PLANNING ONLY — read-only analysis. No application code edited, committed, pushed, merged, deployed. No Vercel settings, browser storage, or production data touched. CodeRabbit not touched.
**Date:** 2026-10-12
**Repo inspected:** `girishlade111/GB-CODER-PUBLIC-ALPHA`
**Production:** `https://code.ladestack.in/`
**Production Release Baseline:** `53ba1e454f76c7408aecd7b57c4ede3b07620b0e` (merge PR #30, `phase-1.1-vercel-preview`)
**Workspace HEAD at audit time:** `818b9c8` — verified as **second parent** of baseline merge (`parents: d2ee31a + 818b9c8`). `git diff HEAD..53ba1e4` is tree-identical for `src/`; merge delta vs first parent is reports/scripts/package-lock/docs only. **Conclusion: workspace code ≈ production code. Plan applies to both.**
**AI Builder:** explicitly out of scope for Phase 2 (per mission).

---

## 1. Current architecture (verified in source)

### 1.1 Shell, routing, build — no router library

- No `react-router` in `package.json`; no `BrowserRouter/Routes` in `src/` (one false positive: `EDITOR_ROUTE` import in `App.tsx`).
- Canonical routes live in `src/utils/appRoutes.ts`: `APP_BASE_ROUTE=/app`, `EDITOR_ROUTE=/app`, `VSCODE_ROUTE=/app/ide`, `LEGACY_VSCODE_ROUTE=/ide`, `PREVIEW_POPOUT_ROUTE=/preview-popout`, plus `isVSCodeModePath()`, `isPreviewPopoutPath()`, `navigateTo()` (pushState, drops `?fork=` one-shot).
- `src/App.tsx` (~3900–4700 lines): monolithic shell + manual early-return ladder over `AppView` union (`editor|history|about|documentation|privacy|terms|cookies|disclaimer|contact|preview-share|preview-share-error|mobile-preview|preview-popout`). Decides `VSCodeMode` vs dashboard/editor via `isVSCodeRoute || fullStackProject`. Owns project CRUD, fileProject triple, all lazy modals, `?fork=` import, `gb-coder-autosave-enabled`, editor preferences.
- `src/main.tsx`: `StrictMode > ErrorBoundary > AppWrapper(+Analytics)`; `initLaminar()`; `index.css`; `utils/monacoWorkers.ts`.
- `vercel.json`: Vite framework, unified build (`scripts/build-unified.mjs` → `dist/`), SPA rewrites (`/api/*`, `/preview/*`, `/mpreview/*`, `/preview-popout`, `/ide`, `/app`, `/app/*` → `/app/index.html`), **scoped** COOP `same-origin` + COEP `require-corp` on `/app/*`, `/app`, `/ide`, `/preview-popout` (marketing root `/` intentionally unisolated).
- `vite.config.ts`: `base=/app/`, `outDir=dist/app`, `target esnext`, `minify esbuild`, `sourcemap:false`; `localApiPlugin` (loopback-only `/api`, safe-route regex, 10MB cap); `server.host:true` + COOP/COEP for LAN QR preview; `VitePWA` (`scope/start_url:/app/`, CacheFirst google-fonts/images, SWR jsdelivr/unpkg, 8MB max); `manualChunks` (monaco, typescript-compiler, vue-compiler, react-core, ui-icons, analytics, http-client, diff-tools, terminal, formatter; `esbuild-wasm/jszip/qrcode.react` deliberately unbucketed); `esbuild.drop:['console','debugger']` in prod (see §4).
- `src/utils/loadChunk.ts`: `lazyWithRecovery` for stale hashed chunks (retry → purge SW → reload).
- Route table (verified): `/→302 /app/`; `/app` (dashboard if no active project else editor); `/app/ide`, `/ide` (`VSCodeMode` fullscreen, no `NavigationBar`); `/preview/:id`, `/preview`, `/mpreview/:id` (standalone share/mobile renderers); `/preview-popout`; `?fork=<id>` (import-into-editor). Static pages (`about/documentation/history/...`) are in-app `currentView`s via `navigate-to-*` window events, not URLs.

### 1.2 Two editors, deliberately separated (must preserve)

| | Static HTML/CSS/JS Editor | Advanced IDE (`/app/ide`) |
|---|---|---|
| Route | `EDITOR_ROUTE /app`, `projectType='plain'`, `editorStyle='plain'` | `VSCODE_ROUTE /app/ide`, `editorStyle='vscode'` |
| UI | 3× `EditorPanel` (html/css/javascript) + `PreviewPanel` (srcdoc, 300ms throttle) | `VSCodeMode` + `ActivityBar` + `FileTreeView` + `TerminalTab` + `DependenciesPanel` + `CodeAssistPanel` + WebContainer |
| Files | Fixed triple `PLAIN_HTML/CSS/JS_PATH` (`src/types/files.ts`); `useProject` triple | `useFileWorkspace` multi-file; `buildTree()` nested explorer; `.gitkeep` filtered |
| Monaco | `CodeEditor.tsx` 3-language map | 2× direct `<Editor>` (main+split), `monacoLanguageForPath()` 20+ langs (`MONACO_LANGUAGE_BY_EXTENSION`), minimap + bracket colorization |
| Bridge | `projectToTriple/getFileContent` (plain view of multi-file) | `onChangeFile/Create/Rename/Delete/Duplicate/Exit/AddImport`; `returnTo` preserved |
| Bundle seam | Eager core | `features/fullstack/fullstackFeature.ts` single dynamic-import boundary |

### 1.3 Persistence (must preserve — do not migrate formats in Phase 2)

- Canonical: `src/services/projects/projectDatabase.ts` — IDB `gb-coder-projects-db v1` (`projects` + `projectFiles [projectId,path]`), `ACTIVE_PROJECT_KEY='gb-coder-active-project-id'` in **localStorage** (sync pointer only), serial queue, never-rejects + `gb-coder:storage-warning` event.
- Advanced workspace: `src/services/vscodeWorkspaceStore.ts` — IDB `gb-coder-workspace` (`current: StoredWorkspace{projectType,files,entry,returnTo,savedAt}`) + `VIEW_STATE_KEY=gb-coder-vscode-view {openPaths,activePath}` in localStorage, `reconcileViewState()`.
- Legacy: `src/services/projectStore.ts` (`gb-coder-active-project`, `gb-coder-projects` localStorage) still used by `useProject` (plain triple) — **dual system is intentional but is tech debt** (see §3).
- Autosave: `src/hooks/useAutoSave.ts` (2s debounce, djb2 hash skip-if-unchanged) → `snapshotService.saveAutoSave()` (`AUTOSAVE_KEY=gbcoder_autosave_current`) + `window 'autosave'` event + 10-min snapshot; per-project keys `gb-coder-project-autosave-<id>`; indicators `AutoSaveIndicator`, `SaveStatusIndicator`, `StatusBar`.
- Snapshots: `snapshotService.ts` — localStorage `gbcoder_snapshots`, `MAX_SNAPSHOTS=50`, `MAX_AUTO=10`, 5MB cap. **Not** IDB workspace snapshots — optional enhancement (§6).
- ZIP: `projectArchiveService.ts` (single-project, dynamic `JSZip`), `backup/backupExportService.ts` (full dump `projects/index.json + projects/<id>/metadata.json/files/* + workspace/state.json + preferences/settings.json + integrity/checksums.json + manifest.json`, SHA-256), `backup/backupRestoreService.ts` (`analyzeBackupArchive/executeRestorePlan`, ZIP-slip/bomb guards `BACKUP_MAX_*`, `PROJECTS_RESTORED_EVENT`). UI: `BackupRestoreModal`, `ExportShareModal`, `projectExport.ts`, `downloadUtils.ts`, `dropTransfer.ts` (zip-drop import).
- Service Worker: `public/sw.js` is **migration-only** (skipWaiting+claim, delete legacy `workbox-precache*/gb-coder*`, navigate root clients to `/`, unregister, fetch passthrough). Real SW emitted by `VitePWA` at build. `main.tsx` has no manual `registerSW`. No offline-IDE custom logic.

### 1.4 WebContainer + terminal + preview (verified)

- Gate: `webcontainerService.isSupported() = window.crossOriginIsolated` (sole gate). Boot: singleton dedup (`instance` + `WebContainer._instance` + `globalThis.__GBCODER_*`), guard throws `Cross-Origin Isolation is not active...`, else bare `WebContainer.boot()` (no args, no `{coep}`, no `auth.init/configureAPIKey`). **No `WebContainer.teardown()` anywhere in `src/`.**
- Mount: `mountProject()` → `filesToFileSystemTree()` (synthesises `package.json` dev/build/preview/help, `vite ^5.4.11`, react `^18.3.1`/`@vitejs/plugin-react` or vue `^3.5.13`, merges `extraDependencies`, injects `OPTIMIZED_NPMRC` + `.help.js`) → `container.mount()` + `.npmrc`.
- npm: `computeDependencyFingerprint()` (DJB2 over sorted deps+devDeps + 500B lock) → `needsDependencyInstall()` (unbooted→true; empty `node_modules`→missing; mismatch→install else `cached_and_verified`) → shell writes `npm install --prefer-offline && npm run dev` or fast `npm run dev`; `recordInstallComplete` confirmed only on `added package/up to date` string sniff.
- Shell: `TerminalTab.tsx` — `xterm` + `xterm-addon-fit`, `mode: webcontainer|local`, `startWebContainerShell()` (mount → `spawnInteractiveShell({cols,rows,onData})` → auto `npm install/dev` with `sessionEpoch` guards), `term.onData` (webcontainer raw `shell.write`; local manual line editor), `sendCommand/clearTerminal/handleQuickNpmInstall`. Mounted in both `VSCodeMode` (`autoStartProject=true`) and `EnhancedConsole`. `spawnInteractiveShell()` reconnects + replays 500-chunk `shellOutputBuffer` if healthy else `container.spawn('jsh')`, sniffs install/server strings + `npm ERR!/ERESOLVE/EADDRINUSE`, `write/resize/kill/disconnect`.
- Dev-server: `server-ready → {serverUrl,serverPort,activeServers,startupStage:'ready',previewStatus:'loading'}` → iframe → `handleIframeLoad/Error`. `port open/close` failover; `isDevServerRunning/Starting`, `stopDevServer` (Ctrl-C `\x03`).
- Hot reload path: any file edit → `syncFile()` (`mkdir -p` + `writeFile`, invalidates fingerprint on manifest/lock) → in-container Vite watcher picks up. Non-destructive preview reload: `previewReloadService.reloadPreview()` Tier1 postMessage (`LOCALSERVICE_RELOAD_WINDOW` + `MessageChannel`, 350ms timeout) → Tier2 `iframe.src=` navigation; in-flight `WeakSet` + global lock; **never restarts server**. Cross-tab: `livePreviewChannel` (`broadcastDevServer/ServerOffline/Reload/Code`) consumed by `LivePreviewPopoutPage`, `PreviewPanel`, `MobileStandalonePreview`. Static editor: `PreviewPanel` srcdoc 300ms throttle.
- Responsive: Advanced IDE `deviceViewport desktop|tablet|mobile` pills (widths `100%|768px|375px`, centered on `bg-slate-950`, rounded+shadow); `rightPanelWidth 480 (300–1800, localStorage)` drag; maximize/fullscreen + Esc; open-in-new-tab `/preview-popout?url&port`. Static `PreviewPanel`: `DEVICES=[375x667,768x1024,1440x900]` + `isMobileUA` UA spoof + QR `MobilePreviewModal`.
- Console/diagnostics: `consoleBridge.ts` (`CONSOLE_BRIDGE_CHANNEL='gb-coder-preview-bridge'`, overrides `console.*`, `window.onerror`, `unhandledrejection`, stack parse, `isCoepIsolated`) → `ConsoleTab` (filter/timestamps/`ConsoleValueTree`/`editorNavigator.reveal` links/autoscroll) ; `PreviewRunTab` isolated `document.write` runner; `ValidatorTab` syntax-only; `useConsoleFeed`.
- Errors: `WebContainerRuntimeError{phase:boot|mount|install|server|preview|general,…,recoverable,retryAction}` → xterm red lines, `StackBlitzStartupLoader` checklist + Retry/Restart/View-Terminal, header dot + `Retry` button, top-bar `WebContainer Live/Installing/Ready`, status bar, `previewLoadError` banner+Retry. No toast for boot/mount errors; `previewStatus:'error'` auto-clears without history; `ValidatorTab` Problems panel not fed by WebContainer errors.
- Restart: `requestRestart()` (epoch++, clears server state, `startupStage:'installing'`), `TerminalTab.triggerDevServerRestart` (150ms debounce, `\x03`, remount + install-or-dev), `VSCodeMode.handleRestartDevServer`, `ActivityBar onResetContainer`, `App.tsx` restart-on-open/detect/restore hooks, `lazyWithRecovery` SW-purge path, IDB rehydrate. **Restart reuses the same WASM instance — poisoned `node_modules` needs manual `rm -rf`.**

---

## 2. Completed feature inventory (exists — reuse, don't duplicate)

**Editor core:** Monaco 3-lang (static) + 20+-lang (IDE) with theme/workers/selection helpers; tabs (`EditorTabs` dirty-dots + validation badges; IDE `MAX_TABS=12` eviction + `reconcileViewState` + hydration guard); IDE-only split views (vertical/horizontal, 50/50 draggable 20–80%, `Ctrl+\`); `FileExplorer` (static flat + context menu + `canModify` gate) + `FileTreeView` (nested, indent guides, icons, dirty dots, `onOpenToSide`, F2/Del, drag-drop import via `buildImportPlan`).

**Persistence/safety:** IDB projects + `gb-coder-active-project-id` pointer; autosave (2s debounce, hash-skip, event-driven indicators); snapshots (50/10, localStorage); single-project ZIP + full backup (SHA-256 manifest) + guarded restore (ZIP-slip/bomb, checksum, conflict plan); session recovery (`SessionManager`, `SessionRecoveryModal`); migration-only SW + VitePWA caching.

**Execution/preview:** WebContainer boot/mount/install/dev lifecycle with fingerprint cache; xterm interactive shell + local fallback shell; framework-aware `package.json` synthesis (react/vue/plain); file sync HMR trigger; tiered non-destructive preview reload; cross-tab live channel; popout/fullscreen/QR mobile preview; responsive width modes; console bridge with stack links; runtime-error model with staged surfaces and retry actions; restart/recovery orchestration.

**Assistance:** ATA auto-types (`ataService.init/acquireTypes/acquireTypesForProject`), inline copilot service (`register/attachEditor`, `inlineCopilotEnabled` setting), `codeAssistService` sessions/modes/models (`CodeAssistPanel`), `editorNavigator.reveal`, `validationService`, `useValidation` (visited-file diagnostics), templates (`codeTemplatesService`, `enhancedTemplateService` incl. business/AI-agent packs, `TemplateSelectorModal`, plain/react/vue starters via `createPlainProject`), `CommandPalette` (fuzzy, recents `gbcoder_recent_commands`), 6-chord `useAppShortcuts` (Ctrl/Cmd+K, ?, Ctrl/Cmd+S, Ctrl/Cmd+Shift+E/I/S), `KeyboardShortcutsHelp`, **real GitHub push/pull** (`githubSyncService`: `buildPushableFiles/commitFiles/createRepository/fetchViewer/listBranches/listRepos/parseRepoInput/pullFiles/rateLimit`, token via `credentialStore` + encryption check) — this is repo sync, not in-IDE git (see §6).

---

## 3. Technical debt & reliability gaps (root causes, not symptoms)

1. **`App.tsx` monolith (~4k lines).** All orchestration (project CRUD, views, modals, shortcuts actions, restart hooks) in one component. Risk: merge conflicts, unintentional coupling, slow reasoning. Fix is **extraction, not rewrite** (Phase 2.4).
2. **Dual persistence systems.** Canonical IDB (`projectDatabase`) vs legacy localStorage (`projectStore` via `useProject` triple) + `vscodeWorkspaceStore` + `snapshotService` localStorage. Risk: divergence, stale reads. Fix: adapter/facade + single read path per surface (Phase 2.1), no format migration.
3. **Prod `console`/`debugger` stripping.** `vite.config.ts esbuild.drop` removes all `console.*` in `webcontainerService`/`TerminalTab` from production bundles — prod failures leave zero console evidence (prior audit F-07, still present). Fix: scoped logger preserved from `drop` (Phase 2.2).
4. **Single `jsh` shell; no true reboot.** No `teardown()`; restart reuses WASM instance; split-terminal button is a toast stub (`VSCodeMode.tsx:1682-1687`); local-mode `onData` closure recreates terminal on mode switch. Fix: multi-shell registry + documented reboot path (Phase 2.2).
5. **npm model is Vite-only.** `filesToFileSystemTree` + install/start assume `npm run dev` = Vite; no Next/Nuxt/Astro/SvelteKit matrix; fingerprint ignores `overrides/resolutions/engines`; confirm only on English string match; silent on yarn/pnpm. Fix: per-framework start/install matrix, fingerprint v2 (Phase 2.2).
6. **Framework detection lossy for boot.** `projectDetection.detectProject()` knows `fullstack/vue/react/simple` (20 backend deps + API patterns) but `webcontainerService` only distinguishes `react|vue|plain` and maps `fullstack→plain`; Express/Hono/Fastify won't emit Vite-style `server-ready`. Fix: detection→boot contract (Phase 2.3).
7. **Search is two half-features.** `SearchReplaceModal` = static-triple strings only (regex/case/whole-word, per-language replace); IDE Search tab = filename substring top-30, no content search/replace. No workspace-wide content search. Fix: ripgrep-equivalent in-memory index over open workspace (Phase 2.3).
8. **Shortcuts: 6 real chords vs aspirational help.** `KeyboardShortcutsHelp` lists `Ctrl+/`, `Ctrl+D`, `Alt+Click`, AI chords, `Ctrl+Enter`, `Ctrl+B/J/Shift+M` with no app handlers (Monaco-native or orphan `keyboard_shortcuts_button_code.txt`). Fix: reconcile help to reality + add missing IDE chords with when-clauses (Phase 2.3).
9. **HMR failure is silent.** No surfacing of Vite WS disconnect; `reloadPreview` 350ms timeout can false-fallback; no debounce on `syncFile` bursts. Fix: HMR watchdog + debounced sync queue (Phase 2.2/2.3).
10. **Diagnostics split-brain.** `ValidatorTab` (syntax) vs console bridge (runtime) vs WebContainer errors (terminal/loader) never meet in one Problems panel; `previewStatus:'error'` history not retained. Fix: unified diagnostics bus feeding Problems (Phase 2.3).
11. **Responsive preview is width-only** in IDE (no height/DPR/orientation); static device presets not wired to WebContainer iframe. Fix in Phase 2.3.
12. **A11y partial.** `aria-*`/`role=` present on nav/tabs/modals/toasts but no audit, no focus-trap standard, no terminal screen-reader story, no reduced-motion pass. Fix: targeted audit, not a redesign (Phase 2.4).
13. **Perf blind spots.** `manualChunks` exist but no budget enforcement in CI (`verify:bundle --assert-absent` exists; add budgets in 2.4); `App.tsx` eager core + many lazy modals is correct shape — keep.

---

## 4. WASI `ExperimentalWarning` investigation (conclusion: benign, no action in Phase 2)

- **Grep result:** zero hits for `ExperimentalWarning|WASI|NODE_NO_WARNINGS|node --no-warnings` across `src/`, `scripts/`, `@webcontainer` references. Sole `wasi` string is a builtin-module allowlist entry in `src/services/packageResolver.ts:58`.
- **Why it appears:** browser WebContainer runs in-page WASM, not `node --experimental-wasi`; local `server/index.js` (Express + `node-pty`) has no WASI usage. The warning is emitted by Node internals (or a dependency touching `wasi`) in dev/server contexts and Node prints `ExperimentalWarning` by default to stderr. It does **not** indicate boot failure — boot health is determined by `status/startupStage/server-ready`, not by stderr warnings.
- **Decision:** treat as noise. Do **not** suppress globally (would hide future real warnings). If it ever pollutes terminal UX, scope the fix to the **server launcher only** (`node --no-warnings=ExperimentalWarning` in `dev:server` script or a `process.on('warning')` filter that ignores `name==='ExperimentalWarning'`), never in the WebContainer path. Add a one-line note to the terminal troubleshooting docs in Phase 2.2. No milestone dependency.

---

## 5. Required features → milestone assignment

### Phase 2.1 — Workspace reliability & data safety (FIRST — recommended start)
**Goal:** file ops, autosave, tabs, recovery become boring and trustworthy. No WebContainer behavior change.
- Single workspace facade over `projectDatabase` + `vscodeWorkspaceStore` (read path per surface; **no format migration**; preserve `gb-coder-active-project-id`, preferences, ZIP formats, routes, SW behavior).
- File operation contracts: create/rename/delete/duplicate with atomic IDB writes + rollback; `canModify` gates preserved; dirty-dot truth table (`dirtyPaths` vs `savedSnapshot`).
- Tab model hardening: `MAX_TABS` eviction policy documented/tested; `reconcileViewState` hydration-guard kept; neighbour-focus close; per-project `openPaths/activePath` restore.
- Crash/refresh recovery drills: kill-during-edit, kill-during-install, kill-during-mount; `SessionRecoveryModal` paths verified.
- Static-vs-IDE separation tests: plain triple never gains/loses files; React/Vue round-trip via `projectToTriple` lossless.
- Regression: full backup→wipe→restore integrity (SHA-256) on every milestone.

### Phase 2.2 — WebContainer & terminal reliability
**Goal:** boot/install/dev-server/restart behave deterministically; failures are visible and recoverable.
- Boot hardening: singleton dedup kept; explicit `startupStage` machine (`idle→booting→mounting→installing→starting→ready|error|unsupported`) with timeout per stage; `server-ready`/`port`/`error` listeners once-per-container (keep `WeakSet`).
- Scoped prod logger exempt from `esbuild.drop` (fixes F-07) so prod failures emit evidence.
- npm lifecycle: per-framework install/start matrix (Vite first; Next/Astro behind detection flag); fingerprint v2 (include `overrides/resolutions/engines/packageManager`); yarn/pnpm detection with explicit message instead of silent mismatch.
- Terminal: multi-shell registry (≥2 shells, kill/focus); fix `onData` closure recreate; replace split-terminal toast stub with real second shell **or** remove button (no stubs ship).
- True reboot path: documented `teardown`-equivalent (container re-boot + fresh mount + reinstall) for poisoned `node_modules`; `requestRestart` no longer optimistically sets `installing` pre-boot; epoch-guard mount cancellation.
- Dev-server UX: multi-port surfacing (primary + list); `port-close` toasts; HMR-failure watchdog (Vite WS disconnect banner, no auto-restart without consent).
- WASI docs note (one line in troubleshooting).

### Phase 2.3 — Preview, search, shortcuts, diagnostics (professional feel)
**Goal:** the IDE feels professional during daily use.
- Smart Live Preview: framework detection→boot contract (no `fullstack→plain` loss; non-Vite servers get correct ready-signal mapping or explicit unsupported message); hot-reload debounce queue for `syncFile` bursts; `reloadPreview` timeout adaptive (350ms → measured); HMR status dot.
- Responsive modes: height + DPR + orientation; wire static presets to WebContainer iframe; keep width-only as fallback.
- Console diagnostics: bridge retained; runtime errors feed unified Problems panel (`ValidatorTab` extends beyond syntax; WebContainer errors included; history retained, not auto-cleared).
- Search: workspace-wide content search (in-memory index, regex/case/whole-word, file include/exclude, top-N cap) + replace with preview; filename quick-open kept; `SearchReplaceModal` triple-scope preserved for static editor.
- Shortcuts: reconcile help dialog to implemented chords; add IDE chords (`Ctrl+\`` terminal, `Ctrl+\` split, `Esc` fullscreen-exit, F2/Del tree, `Ctrl+P` quick-open if cheap) with when-clauses that never steal from Monaco/inputs; `CommandPalette` action coverage for every new command.

### Phase 2.4 — Templates, palette depth, performance, a11y/mobile hardening
**Goal:** breadth + polish without new deps or rewrites.
- Framework templates: Vite-React, Vite-Vue starters already exist — add Next/Astro/SvelteKit **only** as static file templates + correct `package.json` synthesis (no new runtime deps); template→detection→boot round-trip tested.
- Command palette depth: recent-commands persistence kept; add terminal/preview/diagnostics commands; fuzzy ranking unchanged.
- Performance: CI bundle budgets (extend `verify:bundle`); `App.tsx` extraction (split by view/modals/shortcuts — no behavior change); Monaco worker audit (`monaco-worker-tests` already exist); list virtualization only where measured slow.
- A11y: focus-trap modals, terminal aria-live strategy, keyboard-only file ops, reduced-motion pass; targeted audit, no redesign.
- Mobile: `mobilePane` code/preview tablist kept; preview touch-scroll and terminal fit verified on small viewports; no desktop-feature parity claims.

---

## 6. Additional (optional) features — prioritized

| # | Enhancement | Value | Complexity | Perf impact | Verdict |
|---|---|---|---|---|---|
| 1 | Workspace snapshots (IDB named checkpoints + restore) | High (undo catastrophic import/install) | Low (extend `vscodeWorkspaceStore` + UI) | Negligible | **Do in 2.1** as stretch |
| 2 | Multi-terminal support | High (install + dev + shell concurrently) | Medium (shell registry) | Low (one container) | **Do in 2.2** (replaces stub) |
| 3 | Extension-like commands (palette-registered workspace commands API) | Medium (power users, AI-Builder seam later) | Low (registry over existing actions) | None | **Do in 2.4** (API only, no store) |
| 4 | Improved a11y (focus, SR, contrast, motion) | High (compliance + quality) | Low–Med | None | **Do in 2.4** |
| 5 | Mobile-friendly hardening (not parity) | Medium (preview/share on phones) | Low | None | **Do in 2.4**, scoped |
| 6 | Git integration (in-IDE) | Medium — **already have repo sync** (`githubSyncService` push/pull + `GitHubSyncModal`) | High (status/diff/commit inside IDE, libgit costs) | Risky (WASM git + COOP) | **Defer past Phase 2**; keep modal sync |
| 7 | Full offline IDE | Low–Med (WebContainer already needs COOP/COEP + CDN) | High (SW precache semantics) | Risky (stale chunks) | **Defer**; keep migration-only SW |

No new heavy dependencies for any Phase 2 milestone (`isomorphic-git`, terminal multiplexers, search libs avoided — use in-memory index + existing `xterm` + existing IDB).

---

## 7. Roadmap, order & dependency graph

**Order: 2.1 → 2.2 → 2.3 → 2.4. Strictly sequential for 2.1→2.2 (2.2's reboot/reinstall tests need 2.1's recovery harness); 2.3 needs 2.2's stage machine + logger; 2.4 needs 2.3's diagnostics bus for palette commands.**

```
2.1 workspace facade + recovery harness + backup/restore gate
 │   (no WebContainer change)
 ▼
2.2 stage machine + scoped logger + npm matrix + shell registry + reboot path
 │   (2.1 harness proves restart safety)
 ▼
2.3 detection→boot contract + HMR queue + Problems bus + content search + shortcuts
 │   (needs 2.2 stages/logger)
 ▼
2.4 templates + palette depth + bundle budgets + App.tsx extraction + a11y/mobile
     (needs 2.3 bus; extraction last when behavior is frozen)
```

**Independently testable:** each milestone ships behind no flags (behavior-preserving) with its own audit script extension (`audit:editor-persistence`, `audit:lifecycle`, `audit:preview`, `verify:bundle` respectively) + backup/restore gate.

---

## 8. Acceptance criteria (per milestone)

**2.1:** kill-during-edit/mount/install recovery drills pass; tab restore exact across refresh; plain↔multi-file round-trips lossless; `gb-coder-active-project-id` + preferences + ZIP formats byte-compatible; full backup→wipe→restore SHA-256 green; zero `src/` changes to WebContainer boot path.
**2.2:** stage machine timeouts fire with actionable messages; prod failure emits scoped-log evidence (verify with `drop` still active for everything else); fingerprint v2 cache-hit on re-open; 2 concurrent shells; poisoned-`node_modules` reboot recovers without manual `rm -rf` coaching; multi-port UI correct; HMR-disconnect banner appears in fault-injection test.
**2.3:** non-Vite template either boots with correct ready-signal or shows explicit unsupported (never silent hang); rapid-save burst = one install + N syncs, no epoch race; Problems panel shows syntax + bridge + WebContainer errors with history; content search finds fixture string across 50-file workspace <500ms; shortcuts help 1:1 with implemented chords; palette executes every new command.
**2.4:** new starters boot (or explicitly unsupported) via detection→boot contract; palette command coverage 100% of new actions; bundle budgets green in CI; `App.tsx` line count reduced with zero behavior diff (e2e suite green); a11y spot-check (keyboard-only file ops, modal focus-trap, no `aria-*` regressions); mobile code/preview/terminal usable at 375px.

---

## 9. Risk assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| IDB format drift during facade work (data loss) | Med | **Critical** | No format migration; byte-compat tests; backup-before-every-test-harness-run; `storage-warning` listener asserts quota |
| WebContainer flakiness misattributed to our code | High | Med | Stage machine + scoped logger isolate SDK vs app faults; fault-injection tests; never auto-retry without user consent |
| Scope creep into AI Builder / full git / offline | Med | High | Explicit out-of-scope list in every milestone PR; extension-command API is the only forward seam |
| `App.tsx` extraction causes behavior drift | Med | Med | Extraction in 2.4 only, after e2e frozen; pure moves, no logic change; `audit:e2e` + `e2e-editor-persistence` gates |
| COOP/COEP regression breaks isolation | Low | **Critical** | `audit:headers` + `verify:deploy --live-url` on every milestone; keep scoped headers, don't globalize to `/` |
| Perf regression from search index / second shell | Low | Med | Cap index size + top-N; shell registry bounded; bundle budgets in CI |

---

## 10. Regression plan (every milestone)

1. `npm run audit:routes audit:headers` (routing + COOP/COEP intact).
2. `npm run audit:editor-persistence audit:e2e:persistence` (2.1 gate; rerun always).
3. `npm run audit:webcontainer audit:lifecycle audit:npm audit:preview audit:status audit:monaco audit:coep` (2.2 gate; rerun always after 2.2).
4. `npm run audit:backup audit:e2e:backup` + manual full backup→wipe→restore with SHA-256 (data-safety gate, **blocks merge on red**).
5. `npm run verify:bundle` (+ budgets from 2.4) and `tsc` clean.
6. Manual smoke: `/app` (plain + React + Vue), `/app/ide` boot→install→dev→preview→reload→restart, `/preview/:id`, `/mpreview/:id`, `/preview-popout`, `?fork=` import, ZIP export/import.

---

## 11. Browser compatibility & deployment constraints

- **WebContainer requires:** Chromium-based (Chrome/Edge) with `SecureContext + crossOriginIsolated + SharedArrayBuffer`. Firefox/Safari → `unsupported` state with reason pill (keep `getWebContainerUnavailableReason` UX from fix report). No milestone may promise Firefox/Safari container execution.
- **COOP/COEP:** keep `vercel.json` scoping (`/app*`, `/ide`, `/preview-popout`); marketing `/` stays unisolated. Any header change needs `audit:headers` + live `--live-url` verification (lesson of F-04 production outage).
- **Vercel:** unified build only (`build-unified.mjs`); functions `maxDuration` (ai 120s, inline-completion 30s) untouched; no new serverless routes in Phase 2; `localApiPlugin` stays loopback-only.
- **Bundle:** keep `manualChunks` + unbucketed `esbuild-wasm/jszip/qrcode.react`; `sourcemap:false`; PWA scope `/app/`; no new runtime deps without budget sign-off.
- **Mobile:** preview/share paths work; full IDE remains desktop-first (hardening, not parity).

---

## 12. Complexity estimates (relative; 1 = trivial, 5 = multi-week risky)

- 2.1 Workspace reliability: **2** (facade + tests, no format change).
- 2.2 WebContainer/terminal: **4** (stage machine, logger exemption, npm matrix, shell registry, reboot path — most unknowns live here).
- 2.3 Preview/search/diagnostics: **3** (bus + index + HMR queue; well-understood).
- 2.4 Templates/palette/perf/a11y: **2** (broad but shallow; extraction is mechanical).

---

## 13. Recommended first milestone: Phase 2.1

**Start with 2.1 (Workspace reliability & data safety).** Rationale: (a) protects production user data before touching execution paths; (b) builds the recovery harness 2.2 depends on; (c) zero WebContainer risk, so it can land without isolation-header or SDK uncertainty; (d) smallest blast radius with highest trust dividend (tabs/autosave/recovery are daily pain points). Stretch goal inside 2.1: IDB workspace snapshots (optional item #1) since it rides the same facade.

**Explicit non-goals for 2.1:** no boot/install/start changes, no `esbuild.drop` changes, no new templates, no search/diagnostics changes, no `App.tsx` extraction.

---

## 14. What was NOT done (safety confirmation)

- Read-only audit via `read/glob/grep` + `git log/diff` (no writes except this report file).
- No edits to `src/`, `vercel.json`, `vite.config.ts`, `package.json`, or any component/service.
- No commit/push/merge/deploy; no Vercel changes; no storage cleared; no production touched; CodeRabbit untouched.

---

## 15. Approval gate

**Phase 2.0 master plan is presented. STOP. Requesting owner approval before starting Phase 2.1 implementation.** Please confirm: (1) proceed with 2.1 scope as written, (2) include IDB workspace-snapshot stretch or defer, (3) any scope corrections (e.g. promote/defer optional items).
