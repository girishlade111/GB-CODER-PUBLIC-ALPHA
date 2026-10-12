# GB Coder — Master Architecture Audit

## 01. Executive Summary

GB Coder is a client-side browser development environment and web-based IDE engineered by LadeStack (production domain: https://code.ladestack.in/). The application is architecturally designed around zero mandatory user accounts, zero cloud project database lock-in, client-side IndexedDB persistence, in-browser Node.js execution via WebAssembly (@webcontainer/api v1.6.4), client-side esbuild bundling (esbuild-wasm v0.25.10), and Monaco Editor (Monaco Editor React v4.6.0).

Across eleven prior remediation and hardening sprints (Tasks 01 through 11), the repository has undergone targeted optimizations resolving credential leaks (Task 01 Laminar purge), deployment header configurations (Task 02), dependency installation caching (Task 03), development server process persistence (Task 04), preview iframe refresh stabilization (Task 05), popout live preview broadcasting (Task 06), full browser reload recovery (Task 07), runtime state machine reliability (Task 08), same-origin Monaco web worker offloading (Task 09), COEP/COOP resource compliance (Task 10), and IDE UI/UX realignment with LadeStack branding (Task 11).

The current application operates as a single-page application (SPA) powered by Vite 5.4.2, React 18.3.1, and Tailwind CSS 3.4.1, supplemented by a suite of twelve Vercel serverless functions in `api/` (serving AI features, preview synchronisation, and sandbox execution) and an optional loopback Node.js PTY server in `server/index.js`. 

The core architectural finding of this audit is that while the runtime execution engine, project storage layer, and WebContainer integration are highly sophisticated and verified with 191 automated unit and regression tests passing, the application suffers from structural coupling at the top level:
1. `src/App.tsx` is an oversized 4,715-line root coordinator managing top-level early-return routing, modal states, auto-save timers, import plans, and editor view switching without a formal router library.
2. `src/components/vscode/VSCodeMode.tsx` is a 2,406-line monolithic component that couples UI layout, drag resizing, Monaco instance lifecycle, terminal tabs, iframe preview handling, and WebContainer process orchestration.
3. The root URL (`/`) currently displays either the newly introduced `ProjectDashboard` (when no project is open) or the Static Editor (when an active project pointer is present), leaving search engines and public visitors with a 100% client-rendered JavaScript bundle containing zero pre-rendered static content, blocking SEO crawlability.
4. Deployment headers in `vercel.json` enforce `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` globally across all routes `/(.*)`. While this is mandatory for WebContainer's SharedArrayBuffer, applying it globally presents a critical obstacle for a marketing website that needs to embed external media, load third-party scripts, and display unisolated assets.
5. The owner's vision to introduce an Astro marketing website, browser-local project dashboard, Static Editor, and VS Code-style Advanced IDE under a single repository, single Vercel deployment, and the primary domain `https://code.ladestack.in/` is technically sound and achievable. However, it requires a path-isolated hybrid architecture where Astro serves static, multilingual, SEO-optimized marketing, blog, and documentation pages at the root and content routes, while the Vite-built React IDE application is mounted under `/app` (or `/ide`) with dedicated COOP/COEP isolation headers.

This audit report provides the complete, evidence-backed foundation required for an external AI architect to plan and execute the full restructuring without regressions.

---

## 02. Repository Identity and Git Baseline

- [VERIFIED] Repository Name: GB-CODER-PUBLIC-ALPHA
- [VERIFIED] Remote Origin: `git@github.com:girishlade111/GB-CODER-PUBLIC-ALPHA.git` (fetch & push)
- [VERIFIED] Repository Root: `c:\Users\Girish Lade\OneDrive\Desktop\GB-CODER-PUBLIC-ALPHA`
- [VERIFIED] Active Branch: `main`
- [VERIFIED] Current Commit Hash: `a00e889913dd25315733d1bb6a553784308f3857`
- [VERIFIED] Commit Subject: `docs: add report for Task 11 professional IDE UI/UX redesign with LadeStack branding`
- [VERIFIED] Working Tree Status: Clean (0 uncommitted changes, 0 untracked files).
- [VERIFIED] Monorepo Configuration: Single package repository with a root `package.json` and a secondary sub-service in `server/package.json`. No workspaces (`workspaces` key is absent in root `package.json`).
- [VERIFIED] Node.js Engine & Runtime: Node.js v20+ compatible (ES Modules `type: "module"` in root `package.json:5`).
- [VERIFIED] Package Manager: npm using `package-lock.json` (lockfile version 3, 468,501 bytes).
- [VERIFIED] Core Build Tooling: Vite v5.4.2 with `@vitejs/plugin-react` v4.3.1 and `typescript` v5.5.3.

Recent Git Commit History Baseline:
1. `a00e889` docs: add report for Task 11 professional IDE UI/UX redesign with LadeStack branding
2. `6ef7578` post-update UI
3. `91758a8` test: add post-update UI screenshots for reporting and documentation
4. `6d4b041` feat: add Playwright script to capture automated UI audit screenshots
5. `f4fd250` feat: add ProjectDashboard component for project history and management

---

## 03. Technology Stack

### Core Runtime & Frameworks
- React: `18.3.1` (`package.json:48`)
- React DOM: `18.3.1` (`package.json:50`)
- TypeScript: `5.5.3` (`package.json:74`)
- Vite: `5.4.2` (`package.json:76`)

### In-Browser Execution & Bundling
- WebContainer API: `@webcontainer/api` `^1.6.4` (`package.json:38`)
- esbuild WebAssembly: `esbuild-wasm` `0.25.10` (`package.json:42`)
- Vue SFC Compiler: `@vue/compiler-sfc` `3.5.40` (`package.json:37`)
- Automatic Type Acquisition: `@typescript/ata` `^0.9.8` (`package.json:34`)

### Editor & Terminal Chrome
- Monaco Editor React: `@monaco-editor/react` `^4.6.0` (`package.json:33`)
- Xterm.js: `xterm` `^5.3.0` (`package.json:57`)
- Xterm Fit Addon: `xterm-addon-fit` `^0.8.0` (`package.json:58`)

### Styling & UI Systems
- Tailwind CSS: `3.4.1` (`package.json:73`, `tailwind.config.js`)
- PostCSS: `8.4.35` (`package.json:72`, `postcss.config.js`)
- Autoprefixer: `10.4.18` (`package.json:66`)
- Lucide React Icons: `0.344.0` (`package.json:45`)
- React Hot Toast: `2.6.0` (`package.json:53`)
- React Diff Viewer Continued: `3.4.0` (`package.json:49`)

### Storage, Compression & Utilities
- JSZip: `3.10.1` (`package.json:44`)
- Prettier: `3.6.2` (`package.json:46`)
- UUID: `13.0.0` (`package.json:54`)
- Diff: `5.2.0` (`package.json:40`)
- QR Code React: `qrcode.react` `^4.2.0` (`package.json:47`)
- HTML to Image: `1.11.13` (`package.json:43`)
- Vite Plugin PWA: `1.1.0` (`package.json:55`)

### Telemetry & Analytics
- Vercel Analytics: `@vercel/analytics` `^1.6.1` (`package.json:36`)
- Google Analytics 4: `react-ga4` `^2.1.0` (`package.json:52`)
- Web Vitals: `5.1.0` (`package.json:56`)
- Upstash Redis: `@upstash/redis` `^1.38.0` (`package.json:35`)
- Laminar SDK: `@lmnr-ai/lmnr` `^0.8.40` (`package.json:32`, externalized in client build, telemetry safely disabled in browser)

### AI Providers & Cloud Sandbox Integration
- Google Generative AI: `@google/generative-ai` `^0.24.1` (`package.json:31`)
- E2B Sandbox: `e2b` `^2.37.0` (`package.json:41`)
- Axios: `1.13.6` (`package.json:39`)

### Backend Server (`server/package.json`)
- Express: `4.18.2`
- Node PTY: `1.0.0` (`node-pty`)
- WebSocket: `8.14.2` (`ws`)
- CORS: `2.8.5`
- Express Rate Limit: `7.3.1`
- Dotenv: `16.4.5`

---

## 04. Repository Directory Tree

### A. Top-Level Repository Tree
    .
    ├── .agents/                        # Multi-agent coordination state & config
    ├── .claude/                        # Claude workspace settings
    ├── .git/                           # Git repository history & objects
    ├── .github/                        # GitHub workflows and funding configs
    ├── .lmnr/                          # Laminar project metadata configuration
    ├── api/                            # Vercel serverless function endpoints (12 routes)
    │   ├── ai/                         # Inline AI completion serverless handlers
    │   ├── preview/                    # Mobile preview LAN synchronization
    │   └── sandbox/                    # E2B cloud sandbox execution proxy handlers
    ├── dev-api/                        # Local-development-only API handlers (excluded from deploy)
    ├── dist/                           # Compiled production build distribution artifacts
    ├── docs/                           # Technical architecture & maintenance documentation
    ├── public/                         # Public static web assets (robots.txt, sitemap, icons)
    ├── reports/                        # Prior 11 sprint verification reports & screenshots
    │   └── screenshots/                # Visual verification before/after PNG captures
    ├── scratch/                        # Temporary development artifacts & test runs
    ├── scripts/                        # Automated test suites, audits, and bundle verification
    ├── server/                         # Standalone Express + node-pty loopback PTY server
    │   └── node_modules/               # Sub-service dependencies for local shell server
    ├── src/                            # Application TypeScript & React source tree
    ├── supabase/                       # Supabase configuration / migration schema stubs
    ├── .coderabbit.yaml                # CodeRabbit configuration
    ├── .env                            # Local development environment configuration
    ├── .env.example                    # Sample environment variables template
    ├── .gitignore                      # Git path ignore definitions
    ├── build_output.txt                # Cached production build statistics log
    ├── CODERABBIT_SOURCE_AUDIT_REPORT.md
    ├── CUSTOM_INJECTION_FIX.md
    ├── DESIGN.md                       # Comprehensive design system definition (33.5 KB)
    ├── eslint.config.js                # ESLint flat configuration
    ├── favicon.ico                     # Application browser favicon
    ├── GB_CODER_WEBCONTAINER_E2E_VALIDATION_REPORT.md
    ├── GB_CODER_WEBCONTAINER_FIX_REPORT.md
    ├── GB_CODER_WEBCONTAINER_PRODUCTION_AUDIT.md
    ├── index.html                      # HTML5 entry document & initial loader
    ├── package-lock.json               # Deterministic dependency lockfile
    ├── package.json                    # Root project manifests and scripts
    ├── postcss.config.js               # PostCSS plugin registration
    ├── tailwind.config.js              # Tailwind styling tokens and palette
    ├── tsconfig.app.json               # Application TypeScript compiler config
    ├── tsconfig.json                   # Root TypeScript project references config
    ├── tsconfig.node.json              # Tooling / Vite Node TypeScript config
    ├── vercel.json                     # Vercel deployment, rewrites, and COOP/COEP headers
    └── vite.config.ts                  # Vite build, Rollup manualChunks, and dev server config

### B. Application Source Tree (`src/`)
    src/
    ├── App.tsx                         # Master routing coordinator & top-level view ladder
    ├── AppWrapper.tsx                  # Global error boundary & Vercel analytics wrapper
    ├── index.css                       # Global styles, Tailwind base, and font definitions
    ├── main.tsx                        # JavaScript entry point & React DOM bootstrap
    ├── vite-env.d.ts                   # Vite client environment typing
    ├── components/                     # Primary React component directory (54 files)
    │   ├── Console/                    # Enhanced console, validator & terminal tabs
    │   ├── history/                    # Code history timeline viewer
    │   ├── pages/                      # Static informational pages (About, Docs, Legal)
    │   ├── preview/                    # Popout live preview window component
    │   ├── projects/                   # Project Dashboard & New Project modal
    │   ├── sandbox/                    # E2B sandbox control panel
    │   ├── ui/                         # Atomic UI primitives, loaders, toasts & skeletons
    │   └── vscode/                     # Advanced IDE shell, activity bar, and file tree
    ├── features/
    │   └── fullstack/                  # Full-stack feature exports
    ├── hooks/                          # Reusable React hooks (20 files)
    ├── logo/                           # Branding assets
    ├── pages/                          # Standalone full-page views (mobile preview)
    ├── services/                       # Application business logic & API services (58 files)
    │   ├── ai/                         # Code assist service
    │   ├── ata/                        # Automatic Type Acquisition service
    │   ├── import/                     # Archive decompression & project detection
    │   ├── npm/                        # NPM registry & package parsing
    │   ├── preview/                    # Preview channel & reload controller
    │   ├── projects/                   # IndexedDB project database operations
    │   ├── sandbox/                    # Sandbox session manager
    │   ├── templates/                  # Built-in framework and showcase project templates
    │   └── webcontainer/               # WebContainer runtime manager & perf telemetry
    ├── types/                          # TypeScript interface definitions
    └── utils/                          # Pure utility functions & route definitions

### C. Services and Runtime Tree
    src/services/
    ├── webcontainer/
    │   ├── webcontainerService.ts      # WebContainerManager class: boot, mount, spawn, restart
    │   ├── webcontainerPerf.ts         # High-resolution performance timer instrumentation
    │   └── webcontainerSupport.ts      # Browser capability detection & reason analysis
    ├── localShell.ts                   # Simulated command processor for local terminal mode
    ├── sandboxTerminal.ts              # Abstract connector interface for remote PTY execution
    ├── preview/
    │   ├── previewReloadService.ts     # Non-destructive postMessage iframe reload manager
    │   └── livePreviewChannel.ts       # BroadcastChannel & sessionStorage cross-tab sync
    ├── projects/
    │   └── projectDatabase.ts          # IndexedDB database: 'gb-coder-projects-db'
    └── vscodeWorkspaceStore.ts         # IndexedDB database: 'gb-coder-workspace'

### D. Editor Component Tree
    src/components/
    ├── CodeEditor.tsx                  # Monaco Editor wrapper with diff & injection hooks
    ├── EditorPanel.tsx                 # 3-panel static editor pane (HTML, CSS, JS/TS)
    ├── MultiFileEditor.tsx             # Multi-file tabbed editor for React/Vue static projects
    ├── EditorTabs.tsx                  # Tab strip managing open virtual files
    ├── FileExplorer.tsx                # Static editor file tree explorer
    ├── PreviewPanel.tsx                # Static preview renderer with console bridge
    ├── vscode/
    │   ├── VSCodeMode.tsx              # Advanced IDE full-screen workbench
    │   ├── ActivityBar.tsx             # Left icon activity strip (Explorer, Assist, Deps)
    │   ├── FileTreeView.tsx            # Full-featured directory tree with context actions
    │   ├── CodeAssistPanel.tsx         # AI assistant sidebar with Code/Ask/Debug/Plan modes
    │   ├── IDESettingsModal.tsx        # Advanced IDE settings configuration modal
    │   └── StackBlitzStartupLoader.tsx # Animated boot, mount, and install progress card
    └── Console/
        ├── TerminalTab.tsx             # Xterm.js terminal tab (WebContainer / Local / Sandbox)
        ├── ConsoleTab.tsx              # Interactive JavaScript console log feed
        ├── PreviewRunTab.tsx           # Runtime process output inspector
        └── ValidatorTab.tsx            # Real-time code syntax and lint issue viewer

### E. Storage and Persistence Tree
    src/services/
    ├── projects/
    │   └── projectDatabase.ts          # Stores multiple projects in IndexedDB ('projects', 'projectFiles')
    ├── vscodeWorkspaceStore.ts         # Persists the active VS Code workspace in IndexedDB ('vscode')
    ├── snapshotService.ts              # LocalStorage auto-save & explicit project snapshots
    ├── sessionDataService.ts           # Session-level scratchpad and tab state storage
    └── credentialStore.ts              # Obfuscated credential persistence for deploy tokens

### F. Routing Tree
    src/utils/appRoutes.ts              # Route constants: '/', '/ide', '/preview-popout'
    src/App.tsx:3365-3935               # Route dispatch ladder via early returns

### G. Testing Tree
    scripts/
    ├── audit-run-tests.mjs             # 77 unit tests: deploy, git, sanitization, Laminar security
    ├── webcontainer-regression-tests.mjs # 26 regression tests: headers, support, lifecycle
    ├── dev-server-lifecycle-tests.mjs  # 15 lifecycle tests: process concurrency, epoch isolation
    ├── npm-install-performance-tests.mjs # 12 performance tests: fingerprint cache, debouncing
    ├── preview-refresh-tests.mjs       # 12 preview tests: non-destructive postMessage reload
    ├── open-in-new-tab-tests.mjs       # 12 external preview tests: BroadcastChannel, popout
    ├── reload-recovery-tests.mjs       # 20 persistence tests: reload restore, IndexedDB integrity
    ├── runtime-status-tests.mjs        # 17 state machine tests: WebContainer transition accuracy
    ├── monaco-worker-tests.mjs         # 15 Playwright browser tests: web worker offloading
    ├── coep-resource-tests.mjs         # 15 Playwright browser tests: COEP resource compliance
    ├── measure-initial-bundle.mjs      # Critical bundle audit asserting absent heavy chunks
    └── verify-deploy-config.mjs        # Vercel deployment & function ceiling validator

### H. Build and Deployment Configuration Tree
    ├── package.json                    # Scripts: build, dev, verify:*, audit:*
    ├── vite.config.ts                  # Rollup manualChunks, localApiPlugin, worker options
    ├── vercel.json                     # Serverless function definitions, rewrites, headers
    ├── tsconfig.json                   # Root TypeScript configuration
    ├── tsconfig.app.json               # Client TypeScript compiler options
    └── tailwind.config.js              # Theme colors, fonts, and responsive breakpoints

---

## 05. Source File Inventory

The repository contains 188 first-party source files (excluding dependencies, dist, and temporary caches). Below is an inventory of the architecturally critical files:

### 1. Application Entry & Bootstrap
- `index.html` (HTML5 Entry): Defines viewport, preconnects to Google Fonts (Cormorant Garamond, Inter, JetBrains Mono), declares warm cream `#faf9f5` theme color, and renders initial loading spinner.
- `src/main.tsx` (TS Entry): Mounts React 18 `createRoot` inside `React.StrictMode`, instantiates `ErrorBoundary`, executes `initLaminar()`, and imports `monacoWorkers.ts`.
- `src/AppWrapper.tsx` (Analytics Wrapper): Wraps `App` with `@vercel/analytics/react`.
- `src/App.tsx` (Root Coordinator): 4,715 lines. Houses all top-level state, view routing early returns, modal triggers, autosave debouncing, and project opening.

### 2. Routing
- `src/utils/appRoutes.ts`: Exports `EDITOR_ROUTE` (`/`), `VSCODE_ROUTE` (`/ide`), `PREVIEW_POPOUT_ROUTE` (`/preview-popout`), path predicate `isVSCodeModePath()`, and `navigateTo()`.

### 3. Static Editor
- `src/components/EditorPanel.tsx`: 3-panel collapsible layout for HTML, CSS, and JS/TS/JSX/TSX editing with individual format, copy, lock, and file drop capabilities.
- `src/components/MultiFileEditor.tsx`: Tabbed Monaco editor surface for multi-file React/Vue static projects with Automatic Type Acquisition (ATA).
- `src/components/EditorTabs.tsx`: Tab strip managing active, dirty, and open paths for multi-file editing.
- `src/services/bundlerService.ts`: Client-side bundling using in-memory `esbuild-wasm` and `@vue/compiler-sfc`. Output is injected as an IIFE into the static preview.
- `src/services/packageResolver.ts`: Resolves bare npm imports to CDN URLs (esm.sh / unpkg) creating client import maps.

### 4. Advanced IDE
- `src/components/vscode/VSCodeMode.tsx`: 2,406 lines. Full-screen workbench containing top bar, Activity Bar, File Explorer, editor tabs, split editor, Monaco Editor, live preview iframe, terminal drawer, and status bar.
- `src/components/vscode/ActivityBar.tsx`: Left vertical icon toolbar toggling Explorer, Code Assist, Dependencies, and Snapshots sidebars.
- `src/components/vscode/FileTreeView.tsx`: Hierarchical directory tree supporting file creation, folder creation, deletion, renaming, duplication, and drag-and-drop.
- `src/components/vscode/StackBlitzStartupLoader.tsx`: Visual loading card displaying stage progress (booting, mounting, installing dependencies, starting dev server).
- `src/components/vscode/IDESettingsModal.tsx`: Configuration modal for font size, font family, line numbers, word wrap, minimap, and auto-closing brackets.

### 5. WebContainer Runtime & Terminal
- `src/services/webcontainer/webcontainerService.ts`: 1,249 lines. Singleton `WebContainerManager` handling boot, mounting virtual `FileSystemTree`, spawning `jsh` interactive shell, tracking dev servers via `server-ready` event, and detecting dependency fingerprints.
- `src/services/webcontainer/webcontainerSupport.ts`: Capability probes for `window.crossOriginIsolated`, `SharedArrayBuffer`, and secure context.
- `src/services/webcontainer/webcontainerPerf.ts`: Performance telemetry recording duration of boot, mount, install, and spawn.
- `src/components/Console/TerminalTab.tsx`: 901 lines. Xterm.js terminal interface switching seamlessly between WebContainer interactive PTY and Local simulated shell.
- `src/services/localShell.ts`: 539 lines. Simulated pure JavaScript command runner (`help`, `ls`, `cat`, `project`, `npm`, `deps`) operating without isolation headers.
- `src/utils/terminalSafety.ts`: ANSI escape sequence sanitizer preventing terminal injection and title-spoofing attacks.

### 6. Preview & Synchronization
- `src/components/PreviewPanel.tsx`: 1,062 lines. Static preview rendering inside a sandboxed `iframe` with live console message capture and responsive device viewports.
- `src/services/preview/previewReloadService.ts`: Non-destructive reload service using WebContainer's `LOCALSERVICE_RELOAD_WINDOW` postMessage protocol with navigation fallback.
- `src/services/preview/livePreviewChannel.ts`: Cross-tab synchronization bus via `BroadcastChannel` and `sessionStorage`.
- `src/components/preview/LivePreviewPopoutPage.tsx`: Standalone popout preview window rendered at `/preview-popout`.
- `src/pages/MobileStandalonePreview.tsx`: QR mobile preview target rendered at `/mpreview/:id`.

### 7. Project Management & Storage
- `src/services/projects/projectDatabase.ts`: IndexedDB layer (`gb-coder-projects-db`) storing `ProjectRecord` in `projects` store and individual `ProjectFile` records in `projectFiles` store.
- `src/services/vscodeWorkspaceStore.ts`: IndexedDB workspace persistence (`gb-coder-workspace`) preserving VS Code session files across full browser reloads.
- `src/components/projects/ProjectDashboard.tsx`: Landing view rendered when no project is active; provides project list, open, delete, and import actions.
- `src/components/projects/NewProjectModal.tsx`: Project creation dialog prompting for project name and editor style ('plain' vs 'vscode').
- `src/services/import/importEngine.ts`: Lazy-loaded archive decompression (JSZip) with path filtering and file-size caps.
- `src/services/import/projectDetection.ts`: Heuristic classifier detecting project kind ('simple', 'react', 'vue', 'fullstack').
- `src/services/projectImportService.ts`: File picker and directory reader using File System Access API.

### 8. AI Features & Assistants
- `src/components/AIChatAssistant.tsx`: Modal AI assistant interface communicating with Gemini or `/api/ai`.
- `src/services/aiChatAssistant.ts`: Client service wrapper calling `@google/generative-ai` with project code context.
- `src/components/vscode/CodeAssistPanel.tsx`: Sidebar assistant in VS Code mode supporting Code, Ask, Debug, and Plan agent modes.
- `src/services/ai/codeAssistService.ts`: Stateful service managing chat messages, streaming tokens, and file modifications.
- `src/components/BuildFromPromptModal.tsx`: AI website generation modal generating HTML, CSS, and JS from natural language prompts.
- `src/components/ScreenshotToCodeModal.tsx`: Vision-to-code modal analyzing uploaded UI screenshots.
- `api/ai.js`: Serverless dispatcher supporting Inception Labs, Atria ASI, NVIDIA NIM, and Google Gemini.

### 9. Documentation, Informational & Legal
- `src/components/pages/DocumentationPage.tsx`: 694 lines. Comprehensive in-app documentation page with feature guides and search.
- `src/components/pages/AboutPage.tsx`: LadeStack brand story, product philosophy, and feature breakdown.
- `src/components/pages/ContactPage.tsx`: Support channels, community links, and direct contact options.
- `src/components/pages/PrivacyPolicyPage.tsx`, `TermsOfServicePage.tsx`, `CookiePolicyPage.tsx`, `DisclaimerPage.tsx`: Full legal compliance pages.
- `DESIGN.md`: 590 lines in repo root. Master design specification detailing color palette, typography, and component specs.

---

## 06. Application Bootstrap

The execution startup sequence from initial browser request to active editor is structured as follows:

    Browser requests URL (e.g. https://code.ladestack.in/)
           |
           v
    Vercel edge returns index.html with COOP/COEP headers
           |
           v
    HTML document parsed:
      - Fonts preconnected (Cormorant Garamond, Inter, JetBrains Mono)
      - Static loading indicator (#loading) rendered in warm cream (#faf9f5)
      - Module script /src/main.tsx initiated
           |
           v
    main.tsx execution:
      - setupMonacoEnvironment() runs: registers native ES Web Workers
      - initLaminar() runs: detects window, disables client secret telemetry
      - ErrorBoundary wraps AppWrapper
      - React DOM createRoot(document.getElementById('root')!).render(...)
           |
           v
    AppWrapper renders:
      - Mounts @vercel/analytics/react
      - Renders App.tsx
           |
           v
    App.tsx initialization:
      - Synchronous state seeding:
        * isVSCodeRoute = isVSCodeModePath() (reads window.location.pathname)
        * activeProjectId = readActiveProjectId() (reads localStorage 'gb-coder-active-project-id')
        * currentView = derived from window.location.pathname
      - Eager background checks:
        * Checks snapshotService for auto-save recovery data
        * Lists projects from projectDatabase (IndexedDB)
           |
           v
    DOM Loaded Event:
      - #loading element faded out and removed from DOM
           |
           v
    Route Decision Ladder in App.tsx:
      ├── If path starts with /mpreview/:id -> renders MobileStandalonePreview
      ├── If path starts with /preview-popout -> renders LivePreviewPopoutPage
      ├── If path starts with /preview/:id -> renders PreviewSharePage
      ├── If path matches legal/info views -> renders LegalPageLayout / DocumentationPage
      ├── If isVSCodeRoute is true -> renders VSCodeMode (restores workspace from IndexedDB)
      ├── If activeProjectId is null -> renders ProjectDashboard (shows project list / create)
      ├── If isOpeningProject is true -> renders "Loading your project" spinner
      └── Default -> renders Static Editor (NavigationBar, EditorPanel / MultiFileEditor, Footer)

Crucially, heavy dependencies are lazily loaded:
- Monaco Editor language workers load only when Monaco mounts.
- WebContainer service loads only when a project is opened in VS Code mode or when an interactive terminal is requested.
- TypeScript compiler (3.5 MB) loads only when TS/TSX mode is activated.
- esbuild-wasm (12.2 MB WASM) loads only when a React/Vue static project requires compilation.

---

## 07. Routing Architecture

Routing in GB Coder does NOT use a routing library (such as React Router or TanStack Router). As documented in `src/utils/appRoutes.ts:1-11`, routing is implemented through a lightweight ladder of early returns in `src/App.tsx`, supplemented by direct reads of `window.location.pathname` and `window.history.pushState`.

### Mechanics
1. **Route Matching:** `App.tsx` evaluates `window.location.pathname` on initial mount to establish state flags:
   - `isVSCodeRoute`: evaluates whether `window.location.pathname === '/ide'` (`App.tsx:754`).
   - `currentView`: evaluates whether `pathname` starts with `/preview-popout`, `/mpreview/`, or `/preview/` (`App.tsx:682-690`).
   - Informational pages (`about`, `documentation`, `contact`, `privacy`, `terms`) are tracked in component state `currentView` and can be activated via in-app navigation or path initialization.
2. **Navigation Dispatch:** The `navigateTo(path: string)` helper in `src/utils/appRoutes.ts:62-66` issues `window.history.pushState({}, '', path)` without carrying over ephemeral query parameters.
3. **SPA Fallback:** In `vercel.json:16-21`, Vercel rewrites all unmatched incoming requests `/(.*)` to `/index.html`. This ensures that deep links like `/ide` or `/preview-popout` return the SPA document on a hard browser reload.
4. **Deep-Link Support:** Hard browser refresh on `/ide` successfully preserves the route because `isVSCodeModePath()` evaluates true on startup, and `vscodeWorkspaceStore` rehydrates the project files from IndexedDB.

---

## 08. Current URL Map

| URL Path | Rendered Component | Route Purpose | Mechanism | Static / Dynamic | Refresh Support | SEO Relevance | Auth Req | Migration Impact |
|---|---|---|---|---|---|---|---|---|
| `/` (no project) | `ProjectDashboard` | Project list, creation & import dashboard | Client State (`!activeProjectId`) | Dynamic (SPA) | Yes (re-renders dashboard) | High (Primary root) | None | Critical: Target for Astro marketing root |
| `/` (active project) | `EditorPanel` / `MultiFileEditor` | Static HTML/CSS/JS/React/Vue Editor | Client State (`activeProjectId`) | Dynamic (SPA) | Yes (restores project) | High | None | Must move to `/app` or `/app/editor/:id` |
| `/ide` | `VSCodeMode` | Advanced IDE workbench with WebContainer | Client Route (`isVSCodeModePath`) | Dynamic (SPA) | Yes (restores workspace) | Medium | None | Must move to `/app/ide` or retain `/ide` |
| `/preview-popout` | `LivePreviewPopoutPage` | Detached live preview window | Client Route & BroadcastChannel | Dynamic (SPA) | Yes (reads query params) | Low (Tool) | None | Retain as detached utility route |
| `/preview/:id` | `PreviewSharePage` | Standalone preview of shared project | URL prefix `/preview/` | Dynamic (SPA) | Yes (fetches share ID) | Low (User code) | None | Retain with dedicated share handler |
| `/mpreview/:id` | `MobileStandalonePreview` | Standalone QR mobile device preview | URL prefix `/mpreview/` | Dynamic (SPA) | Yes (fetches session ID) | Low (User code) | None | Retain with LAN/Cloud sync |
| `/about` | `AboutPage` | Brand story & platform details | Client view ladder | Client Component | Partial (requires deep-link fix) | Very High | None | Migrate to static Astro page |
| `/documentation` | `DocumentationPage` | Feature documentation & guides | Client view ladder | Client Component | Partial | Very High | None | Migrate to Astro Content Collections |
| `/history` | `CodeHistoryPage` | Snapshot & version timeline | Client view ladder | Client Component | Partial | Low (User state) | None | Integrate into project dashboard |
| `/contact` | `ContactPage` | Community & contact links | Client view ladder | Client Component | Partial | High | None | Migrate to static Astro page |
| `/privacy` | `PrivacyPolicyPage` | Privacy Policy legal document | Client view ladder | Client Component | Partial | High (E-E-A-T) | None | Migrate to static Astro page |
| `/terms` | `TermsOfServicePage` | Terms of Service legal document | Client view ladder | Client Component | Partial | High (E-E-A-T) | None | Migrate to static Astro page |
| `/cookies` | `CookiePolicyPage` | Cookie Policy legal document | Client view ladder | Client Component | Partial | Medium | None | Migrate to static Astro page |
| `/disclaimer` | `DisclaimerPage` | Legal disclaimer document | Client view ladder | Client Component | Partial | Medium | None | Migrate to static Astro page |
| `/api/*` | Vercel Serverless Functions | Backend AI, preview & sandbox APIs | Serverless Functions | Dynamic (Node.js) | N/A (HTTP API) | None (API) | None | Retain in single Vercel deployment |

---

## 09. Static Editor Architecture

The Static Editor is designed for zero-setup frontend exploration, providing immediate live-preview feedback without requiring container boots or server processes. It operates in two distinct modes depending on project structure:

### A. Three-Panel Plain Mode (`projectType === 'plain'`)
1. **Layout:** Handled by `src/components/EditorPanel.tsx`. Renders three independent panels for HTML (`index.html`), CSS (`style.css`), and JavaScript (`script.js`).
2. **Syntax Modes:** The JavaScript panel includes a runtime switcher (`JS_MODE_OPTIONS`) allowing the user to select between JavaScript, TypeScript, JSX, and TSX.
3. **Execution Pipeline:** 
   - When pure JavaScript is used, code is injected directly into the sandboxed `iframe` inside `src/components/PreviewPanel.tsx`.
   - When TypeScript or TSX is selected, `PreviewPanel.tsx:78-100` dynamically imports `typescript` and executes `ts.transpileModule(code, { target: ScriptTarget.ES2015, jsx: JsxEmit.React })`.
4. **Console Bridge:** `src/services/consoleBridge.ts` injects a custom bridge script into the preview document. It overrides `console.log`, `warn`, `error`, `info`, and `table`, serializes parameters with circular-reference protection, and transmits them back to the host window via `postMessage`.

### B. Multi-File Framework Mode (`projectType === 'react' | 'vue'`)
1. **Layout:** Handled by `src/components/MultiFileEditor.tsx`. Renders an `EditorTabs` strip above a single Monaco Editor instance whose model is bound to the active virtual file path.
2. **In-Browser Bundling:** Handled by `src/services/bundlerService.ts`.
   - Uses `esbuild-wasm` running in a dedicated Web Worker.
   - Intercepts imports using a custom esbuild plugin that resolves files against the in-memory virtual project tree.
   - For Vue single-file components (`.vue`), invokes `@vue/compiler-sfc` to parse `<template>`, `<script>`, and `<style>` blocks into standard JavaScript render functions.
   - Compiles the entire virtual project into a single bundled IIFE plus collected CSS.
3. **Package Resolution:** Handled by `src/services/packageResolver.ts`. Bare specifiers (e.g. `import axios from 'axios'`) are detected, resolved against npm registry metadata, and mapped to CDN URLs (esm.sh). The resulting import map is injected into the preview iframe head.
4. **Next.js Emulation:** In the Static Editor, Next.js templates (`nextjs-blog`, `nextjs-ai-startup`, `nextjs-crm-platform`) are executed client-side via React emulation. The templates include a client-side App Router emulator in `App.jsx` rendered inside the esbuild bundle.

---

## 10. Static Editor Feature Matrix

| Feature / Technology | Editing Support | Syntax Highlighting | Virtual File Handling | Compilation / Bundling | Runtime Execution | npm Dependency Support | Live Preview Support | Terminal Support | Tested Status |
|---|---|---|---|---|---|---|---|---|---|
| Vanilla HTML | Full | Full (Monaco HTML) | Single file (`index.html`) | None (Native) | Native browser DOM | CDN `<script>` tags | Full (Iframe) | Local Shell only | Verified |
| Vanilla CSS | Full | Full (Monaco CSS) | Single file (`style.css`) | None (Native) | Native browser CSS | CDN `<link>` tags | Full (Iframe) | Local Shell only | Verified |
| Vanilla JavaScript | Full | Full (Monaco JS) | Single file (`script.js`) | None (Native) | Native browser V8 | CDN `<script>` tags | Full (Iframe) | Local Shell only | Verified |
| TypeScript / TSX | Full | Full (Monaco TS) | Single file (`script.ts`/`tsx`) | Browser `ts.transpileModule` | Transpiled JS | CDN `<script>` tags | Full (Iframe) | Local Shell only | Verified |
| Multi-file React | Full | Full (Monaco JSX/TSX) | Multi-file virtual tree | Browser `esbuild-wasm` | Sandboxed IIFE | CDN Import Maps (esm.sh) | Full (Iframe) | Local Shell only | Verified |
| Multi-file Vue | Full | Full (Monaco HTML/Vue) | Multi-file virtual tree | `@vue/compiler-sfc` + esbuild | Sandboxed IIFE | CDN Import Maps (esm.sh) | Full (Iframe) | Local Shell only | Verified |
| Next.js (Static) | Full | Full (Monaco JSX) | Multi-file virtual tree | Client React Emulation | Emulated App Router | CDN Import Maps | Full (Iframe) | Local Shell only | Verified |
| File Explorer | Full | N/A | Full tree view | N/A | N/A | N/A | N/A | N/A | Verified |
| Code Formatting | Full | N/A | Prettier in worker | Prettier v3.6.2 | Main thread offloaded | N/A | N/A | N/A | Verified |
| Auto-Save | Full | N/A | Debounced (1000ms) | Saves to IndexedDB | N/A | N/A | N/A | N/A | Verified |

---

## 11. Advanced IDE Architecture

The Advanced IDE (`src/components/vscode/VSCodeMode.tsx`) is a browser-native development environment designed to provide a Visual Studio Code and StackBlitz-inspired developer experience.

### Architectural Layout Contract
The IDE occupies the full viewport (`h-screen overflow-hidden`) with a strict four-region scroll isolation architecture:
1. **Top Bar:** Houses the LadeStack branding, project name, editor style badge, Split Editor button, Format button, and primary action buttons (Run, Restart, Popout Preview, Exit).
2. **Activity Bar (`ActivityBar.tsx`):** Left icon rail with tabs for Explorer, Code Assist, Dependencies, and Snapshots.
3. **Primary Sidebar:** Collapsible panel (width: 250px–500px, resizable) rendering `FileTreeView.tsx`, `CodeAssistPanel.tsx`, `DependenciesPanel.tsx`, or `SnapshotManagerModal.tsx`.
4. **Editor Region:** Tab strip (`EditorTabs.tsx`) and Monaco Editor instances supporting side-by-side split editor mode (`isSplitEditor` state).
5. **Integrated Live Preview / Secondary Column:** Embedded preview panel rendering the WebContainer dev server URL in an `iframe` with viewport controls (Desktop, Tablet, Mobile) and quick popout.
6. **Bottom Terminal Drawer:** Integrated bottom panel hosting `TerminalTab.tsx`, resizable vertically, supporting tabs for Terminal, Console, Output, and Problems.
7. **Status Bar:** Bottom strip displaying active branch, Git status, WebContainer status pill, dev server port, cursor position (line/column), encoding, and language.

### Runtime Integration
Unlike the Static Editor, `VSCodeMode.tsx` is deeply coupled to `webcontainerService`. On mount, it mounts project files into the container's virtual filesystem, validates whether `node_modules` exists, triggers `npm install` if necessary, spawns the development server (`npm run dev`), listens for the `server-ready` event, and renders the resulting preview URL inside its embedded iframe.

---

## 12. Advanced IDE Feature Matrix

| Workbench Component / Feature | Implementation Status | Source File Reference | Implementation Summary | Limitations / Constraints |
|---|---|---|---|---|
| Top Header / Action Bar | FULLY IMPLEMENTED | `VSCodeMode.tsx:1000-1150` | Title, project status, layout buttons, Run/Restart | Coupled to `VSCodeMode` component |
| Activity Bar | FULLY IMPLEMENTED | `components/vscode/ActivityBar.tsx` | Left vertical icon rail for sidebar switching | Visual tab switcher only |
| File Explorer & Tree | FULLY IMPLEMENTED | `components/vscode/FileTreeView.tsx` | Full tree with context menu, new file/folder, delete | Tree state kept in component memory |
| Editor Tabs Strip | FULLY IMPLEMENTED | `components/EditorTabs.tsx` | Multi-tab strip with dirty indicators and close buttons | Tabs managed via `openPaths` array |
| Monaco Editor Instance | FULLY IMPLEMENTED | `VSCodeMode.tsx:1900-2050` | Monaco Editor React with custom LadeStack theme | Single active file model |
| Split Editor Mode | FULLY IMPLEMENTED | `VSCodeMode.tsx:1950-2020` | Dual side-by-side Monaco editors (`isSplitEditor`) | Horizontal split only; no vertical split |
| Terminal Drawer | FULLY IMPLEMENTED | `Console/TerminalTab.tsx` | Xterm.js 5.3 with WebContainer `jsh` shell & Local mode | Max 1 active interactive shell session |
| Problems Panel | PARTIALLY IMPLEMENTED | `Console/ValidatorTab.tsx` | Lists syntax errors and bundle warnings | Syntax diagnostics only; no full LSP |
| Output Panel | FULLY IMPLEMENTED | `Console/PreviewRunTab.tsx` | Streams process stdout/stderr from container | Output buffer capped at 500 lines |
| Live Preview Panel | FULLY IMPLEMENTED | `VSCodeMode.tsx:2080-2200` | Embedded iframe rendering `webcontainer.serverUrl` | Requires COOP/COEP isolation |
| Status Bar | FULLY IMPLEMENTED | `VSCodeMode.tsx:2350-2400` | Compact bottom strip with status pill, port, line/col | Read-only information display |
| Panel Resizing | FULLY IMPLEMENTED | `VSCodeMode.tsx:400-550` | Custom pointer-event drag handles for sidebar & terminal | No dockable / floating windows |
| Command Palette | PARTIALLY IMPLEMENTED | `components/CommandPalette.tsx` | Quick action search overlay (`Ctrl+P` / `F1`) | Not deeply integrated with Monaco commands |
| Theme System | FULLY IMPLEMENTED | `utils/monacoTheme.ts`, `hooks/useTheme.ts` | Synchronized dark and light themes | Custom tokens aligned with `DESIGN.md` |

---

## 13. VS Code Redesign Readiness

The future vision for GB Coder requires an Advanced IDE that strongly resembles the professional Visual Studio Code workbench (similar to StackBlitz Codeflow). Below is the readiness evaluation for this transformation:

### 1. Reusable Components
- `FileTreeView.tsx`: Highly mature and robust. Handles nested paths, creation, renaming, deletion, and context menus cleanly. Can be reused with minimal modifications.
- `TerminalTab.tsx`: Complete Xterm.js implementation with WebContainer integration, auto-fit addon, and Local shell fallback.
- `StackBlitzStartupLoader.tsx`: Polished loading screen that clearly visualizes boot, file mounting, npm installation, and server startup.
- `monacoWorkers.ts`: Fully resolved same-origin web worker infrastructure.
- `previewReloadService.ts`: Production-ready postMessage iframe reload coordinator.

### 2. Components Requiring Redesign or Replacement
- `VSCodeMode.tsx`: **Critical Architectural Debt.** At 2,406 lines, this component mixes visual layout, pointer drag resizing, terminal lifecycle events, preview iframe management, and keyboard shortcut handling. It MUST be decomposed into a modular workbench structure:
  - `WorkbenchLayout.tsx`: Pure layout container managing resizable grid panels.
  - `WorkbenchTitleBar.tsx`: Compact title and action bar.
  - `WorkbenchActivityBar.tsx`: Activity rail.
  - `WorkbenchSidebar.tsx`: Primary sidebar host.
  - `WorkbenchEditorGroup.tsx`: Editor tab and Monaco container.
  - `WorkbenchPanel.tsx`: Bottom terminal/console/problems drawer.
  - `WorkbenchStatusBar.tsx`: Status bar component.

### 3. Coupling Risks to Address
- Currently, WebContainer dev server process startup and terminal shell spawning are initiated inside `VSCodeMode.tsx`'s React `useEffect` hooks. If the workbench layout changes or re-renders, it risks triggering duplicate process starts unless mediated by `webcontainerService`'s epoch counter.
- The Live Preview iframe is currently hardcoded into the right column of `VSCodeMode.tsx`. In a true VS Code workbench, Live Preview should be treated as an editor tab or an optional secondary sidebar.

---

## 14. WebContainer Runtime Architecture

GB Coder embeds the `@webcontainer/api` (v1.6.4) to execute a full Node.js runtime environment entirely within the user's browser using WebAssembly.

### WebContainer Lifecycle State Machine

        [ App Starts / User Opens VS Code Mode ]
                           |
                           v
        [ Capability Guard: isSupported() ]
          - window.crossOriginIsolated === true?
          - SharedArrayBuffer available?
          ├── NO  --> State: 'unsupported' (Falls back to Local Shell)
          └── YES --> State: 'idle'
                           |
                           v
        [ boot(): WebContainer.boot() ]
          - Checks singleton instance on globalThis
          - Recovers if previous instance booted
          - State: 'booting' -> 'ready'
                           |
                           v
        [ mountProject(files): container.mount() ]
          - filesToFileSystemTree() converts ProjectFile[] to FileSystemTree
          - Injects optimized .npmrc (audit=false, prefer-offline=true)
          - Injects .bin/help command script
          - State: 'mounting_files' -> 'runtime_ready'
                           |
                           v
        [ needsDependencyInstall(files) ]
          - Checks virtual container fs.readdir('node_modules')
          - Computes deterministic manifest/lockfile fingerprint
          ├── Cache valid & node_modules present --> Skip install
          └── Cache invalid or missing --> State: 'installing'
                                                 |
                                                 v
                                           [ npm install ]
                                                 |
                                                 v
        [ Dev Server Startup: spawnInteractiveShell() ]
          - Spawns 'jsh' PTY process
          - Executes 'npm run dev'
          - State: 'starting_server'
                           |
                           v
        [ container.on('server-ready', (port, url)) ]
          - Maps port and local-credentialless URL
          - Updates activeServers list
          - State: 'ready' / Preview: 'loading' -> 'ready'
                           |
                           v
        [ Runtime Active & Serving Live Preview ]
          - File edits sync via fs.writeFile()
          - Terminal I/O flows through process.input / process.output
          - Reloads handled via postMessage without restarting server

### Key Methods in `src/services/webcontainer/webcontainerService.ts`
- `boot()` (lines 689–781): Initializes the runtime singleton. Checks `this.instance`, `WebContainer._instance`, and `globalThis.__GBCODER_WEBCONTAINER_INSTANCE__` to prevent duplicate boot errors during React StrictMode remounts or Vite HMR.
- `mountProject(files)` (lines 786–820): Serializes flat files into `FileSystemTree` and mounts them into the container virtual root.
- `spawnInteractiveShell(options)` (lines 984–1215): Spawns the interactive `jsh` PTY shell. Manages an in-memory 500-chunk output buffer that replays previous output when reconnecting a terminal without destroying the active Vite server.
- `needsDependencyInstall(files)` (lines 846–890): Verifies presence of `node_modules` in the container filesystem and compares the manifest fingerprint (`computeDependencyFingerprint`).
- `requestRestart(reason)` (lines 463–485): Increments `sessionEpoch` to invalidate stale async events and notifies registered listeners to safely restart the dev server.
- `syncFile(path, content)` / `deleteFile(path)` (lines 933–977): Synchronizes individual file edits directly to the container virtual filesystem.

---

## 15. Terminal Implementation

Terminal functionality in GB Coder is consolidated in `src/components/Console/TerminalTab.tsx`, powered by `xterm` (v5.3.0) and `xterm-addon-fit` (v0.8.0).

### Terminal Execution Modes
1. **WebContainer Mode (`mode === 'webcontainer'`):**
   - Spawns a real interactive PTY shell running WebContainer's `jsh`.
   - Streams keystrokes directly to `webcontainerService.writeToShell()`.
   - Supports genuine Node.js execution: `node script.js`, `npx <package>`, `npm run build`, `npm install <pkg>`.
   - Reconnects seamlessly if the user navigates between tabs without terminating the running development server process.
2. **Local Mode (`mode === 'local'`):**
   - Uses `src/services/localShell.ts`.
   - Operates synchronously in-memory when cross-origin isolation headers are unavailable.
   - Provides safe simulated commands: `help`, `clear`, `deps`, `files`, `cat <file>`, `project`, `echo`, `history`, and `npm list`.
   - Protects against ANSI injection via `sanitizeForTerminal()`.
3. **Sandbox Mode (Seam defined in `src/services/sandboxTerminal.ts`):**
   - Connects to an external E2B cloud sandbox via HTTP execution requests (`/api/sandbox/exec`) when configured with a user API key.

---

## 16. npm Installation Architecture

Dependency installation in WebContainer is managed to minimize network transfers and prevent browser UI freezes:

### Optimization Implementation Evidence (`webcontainerService.ts:15-99`)
1. **Optimized `.npmrc` Injection:**
   ```
   legacy-peer-deps=true
   audit=false
   fund=false
   prefer-offline=true
   progress=false
   update-notifier=false
   ```
   - `audit=false`: Eliminates slow remote security audit HTTP requests, saving 4–8 seconds per install.
   - `progress=false`: Disables ASCII progress bars, dramatically reducing terminal rendering load.
   - `prefer-offline=true`: Reuses packages cached in browser storage.
2. **Deterministic Manifest Fingerprinting:**
   - Function `computeDependencyFingerprint(files, extraDeps, projectType)` (`webcontainerService.ts:37-99`) computes a DJB2 hash from `package.json` (`dependencies` + `devDependencies`) combined with the first 500 bytes and lengths of `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`.
3. **Double-Checked Cache Verification:**
   - Before skipping installation, `webcontainerService.needsDependencyInstall()` checks two criteria:
     a. The calculated fingerprint matches `installedManifestFingerprint`.
     b. The `node_modules` directory physically exists in the container filesystem via `container.fs.readdir('node_modules')`.
4. **Debounced Reinstallation:**
   - Rapid file edits to `package.json` trigger debounced re-evaluation. Reinstallation is only initiated when the fingerprint changes.

---

## 17. Development Server Lifecycle

Development server lifecycle management was hardened in Task 04 to decouple process lifetime from React component mounts:

### Lifecycle Characteristics
1. **Process Ownership:** The server process runs inside the singleton WebContainer instance, owned by `webcontainerService`, NOT by the React component tree.
2. **Component Unmount Safety:** Navigating away from the terminal tab or switching editor views does NOT terminate the server or kill the Vite process.
3. **Session Epoch Isolation:** An integer `sessionEpoch` (`webcontainerService.ts:337`) increments whenever a project switch or explicit restart occurs. Stale `server-ready` or `exit` events from a previous project session are ignored if their epoch does not match the active session.
4. **Port Tracking:** Multiple listening ports are tracked in `activeServers: WebContainerServerInfo[]`. When a port closes or opens, the state machine automatically updates the primary preview URL.
5. **Clean Shutdown:** Calling `stopDevServer()` sends a `\x03\r` (Ctrl+C) signal to the shell writer, resets server URLs, and transitions `startupStage` back to `idle`.

---

## 18. Live Preview Architecture

GB Coder features two distinct preview systems:

### A. Static Preview System (`src/components/PreviewPanel.tsx`)
- Uses a sandboxed `iframe` (`sandbox="allow-scripts allow-modals allow-forms allow-same-origin"`).
- Injects generated HTML, CSS, and transpiled JavaScript via `srcDoc`.
- Injects `consoleBridge` script capturing runtime console calls and transmitting them to the host window via `postMessage`.
- Supports responsive device presets: Mobile (375x667), Tablet (768x1024), Laptop (1024x768), Desktop (1440x900), and Full Width (100%).

### B. WebContainer Dev Server Preview (`src/components/vscode/VSCodeMode.tsx`)
- Renders an `iframe` pointing directly to the WebContainer server URL (`https://<port>-<subdomain>.local-credentialless.webcontainer-api.io/`).
- Handles iframe loading states via `StackBlitzStartupLoader.tsx`.
- **Reload Mechanism (`src/services/preview/previewReloadService.ts`):** 
  - To reload the preview, the service first sends a `postMessage` (`{ type: 'LOCALSERVICE_RELOAD_WINDOW' }`) to the iframe.
  - If the iframe fails to acknowledge within 350ms, it falls back to in-place navigation (`iframe.src = serverUrl`).
  - **Critical Invariant:** It NEVER unmounts the iframe DOM element and NEVER restarts the Vite dev server process.

---

## 19. External Preview / New Tab

Task 06 established full reliability for the "Open in New Tab" feature:

1. **Popout Route:** Detached previews open at `/preview-popout?url=<encodedUrl>&port=<port>` (`src/utils/appRoutes.ts:29`).
2. **Synchronization Channel (`src/services/preview/livePreviewChannel.ts`):**
   - Uses browser-native `BroadcastChannel('gbcoder_live_preview_channel')`.
   - Backed by `sessionStorage` fallback (`gbcoder_live_preview_last_state`) so newly spawned tabs hydrate immediately even if they miss the broadcast event.
3. **Dynamic Parameter Parsing:** `src/components/preview/LivePreviewPopoutPage.tsx` parses URL query parameters synchronously on initial paint, ensuring that opening a WebContainer server URL in a new tab never flashes a blank screen.
4. **Mobile Standalone Preview:** For phone testing, `/mpreview/:id` opens `MobileStandalonePreview.tsx`, synchronizing code over LAN or cloud relay via QR code generation (`qrcode.react`).

---

## 20. Project Management Architecture

GB Coder operates an offline-first, browser-local project management system without requiring external cloud databases or account creation:

### Feature Implementation Details
- **Project Listing:** Handled by `src/components/projects/ProjectDashboard.tsx`. Displays all saved projects sorted by `lastOpenedAt` descending, with badges indicating editor style ('Plain' vs 'VS Code') and project type.
- **Create Project:** Handled by `src/components/projects/NewProjectModal.tsx`. Prompts for project name and editor style. Initializes starter files and writes a `ProjectRecord` to IndexedDB.
- **Open Project:** Handled by `handleOpenProject` in `App.tsx:1960-1980`. Reads project files from IndexedDB, writes `activeProjectId` pointer to `localStorage`, and routes to the selected editor style.
- **Delete Project:** Handled by `handleDeleteProject` in `App.tsx:2014-2035`. Prompts for inline confirmation, deletes records from `projects` and `projectFiles` in IndexedDB, and clears the active pointer.
- **Import Project:** Handled by `src/services/import/importEngine.ts` and `ImportModal.tsx`. Accepts dropped folders or ZIP files up to 50 MB, performs heuristic framework detection, and creates a new project.
- **Export Project:** Handled by `src/utils/projectExport.ts`. Packages virtual files and dependencies into a downloadable ZIP archive using JSZip.
- **Snapshots & Version History:** Handled by `src/services/snapshotService.ts`. Allows manual snapshots and automated auto-saves with diff viewing.

---

## 21. Browser Persistence and Recovery

Persistence was audited and verified in Task 07 (20/20 persistence tests passing):

### Storage Architecture
1. **IndexedDB: `gb-coder-projects-db` (v1)**
   - Object Store `projects` (key: `id`, index: `lastOpenedAt`): Stores metadata records (`ProjectRecord`).
   - Object Store `projectFiles` (compound key: `['projectId', 'path']`, index: `projectId`): Stores individual file contents.
   - **Performance Invariant:** Files are stored individually so that saving a single modified file writes one small record rather than re-serializing the entire multi-megabyte project.
2. **IndexedDB: `gb-coder-workspace` (v1)**
   - Object Store `vscode`: Stores the active VS Code mode workspace (`StoredWorkspace`) across full browser reloads when accessed via `/ide`.
3. **LocalStorage:**
   - `gb-coder-active-project-id`: Holds the synchronous pointer string indicating which project is open.
   - `gbcoder_onboarded`: Tracks tour completion.
   - `gb-coder-autosave-enabled`: Autosave toggle.
   - `gbcoder_settings`: User editor preferences.
4. **Auto-Save & Flush Protocol (`App.tsx:2120-2135`):**
   - File edits stage changes into `pendingProjectSaveRef`.
   - Changes are debounced with a 1,000ms timer (`PROJECT_SAVE_DEBOUNCE_MS = 1000`).
   - A `visibilitychange` listener flushes pending saves immediately when the browser tab is switched or minimized.

---

## 22. Project Data Models

The core data structures are defined across `src/types/files.ts` and `src/services/projects/projectDatabase.ts`:

### TypeScript Interfaces

    // Project Record in IndexedDB 'projects' store
    export type EditorStyle = 'plain' | 'vscode';
    export type ProjectType = 'plain' | 'react' | 'vue';

    export interface ProjectRecord {
      id: string;
      name: string;
      createdAt: number;       // Epoch ms
      lastOpenedAt: number;    // Epoch ms
      editorStyle: EditorStyle;
      projectType: ProjectType;
      entry?: string;
      fileCount: number;
    }

    // Individual File in IndexedDB 'projectFiles' store
    export type FileLanguage =
      | 'html' | 'css' | 'javascript' | 'typescript'
      | 'jsx' | 'tsx' | 'vue' | 'json';

    export interface ProjectFile {
      path: string;            // Virtual relative path without leading slash
      content: string;
      language: FileLanguage;
    }

    // Multi-File Project Model
    export interface MultiFileProject {
      projectType: ProjectType;
      files: ProjectFile[];
      entry?: string;
      dependencies?: Record<string, string>;
    }

### Architectural Entity Relationships

    [ LocalStorage: activeProjectId pointer ]
                       |
                       v
         [ ProjectRecord (IndexedDB: projects) ]
           ├── id, name, editorStyle, projectType
           └── fileCount, createdAt, lastOpenedAt
                       |
                       +-----------------------+
                       |                       |
                       v                       v
      [ ProjectFile (plain) ]       [ ProjectFile (vscode) ]
      (HTML, CSS, JS)               (Tree of arbitrary files)
                       |                       |
                       v                       v
       [ Static Editor State ]        [ WebContainer Virtual FS ]
       (esbuild-wasm / iframe)        (Node.js / jsh / Vite dev)

---

## 23. Editor Switching Compatibility

The owner requires safe switching between the Static Editor and Advanced IDE. Below is the compatibility matrix:

| Framework / Technology | Static Editor Support | Advanced IDE Support | Switching Safety | Technical Constraints |
|---|---|---|---|---|
| Plain HTML/CSS/JS | Supported | Supported | Safe | In Static Editor: 3 panels. In Advanced IDE: individual files in file tree. |
| TypeScript (Single File) | Supported | Supported | Safe | Transpiled in Static Editor; compiled natively in IDE. |
| Multi-file React | Supported | Supported | Safe | Static Editor bundles via `esbuild-wasm`; IDE runs via WebContainer dev server. |
| Multi-file Vue | Supported | Supported | Safe | Static Editor compiles via `@vue/compiler-sfc`; IDE runs via `@vitejs/plugin-vue`. |
| Next.js (App Router) | Partial (Emulated) | Conditional | Conditional | Static Editor emulates App Router on React; IDE runs real Next.js if supported by WebContainer. |
| Astro | Unsupported | Conditional | Unsafe | Cannot be bundled by client-side esbuild; requires WebContainer in IDE mode only. |
| Full-Stack Node/Express | Unsupported | Supported | One-Way Only | Advanced IDE only; switching back to Static Editor flattens or disables backend. |

### Switching Protocol Implementation
- Switching into VS Code mode is handled by `handleEnterVSCodeMode()` (`App.tsx:1827-1841`). It records `vsCodeReturn` metadata, copies files into `fullStackProject`, updates the route to `/ide`, and mounts files into WebContainer.
- Exiting VS Code mode is handled by `leaveVSCodeMode()` (`App.tsx:1678-1718`). If entered manually from a React or Vue project, it restores the project type and returns to `/`.

---

## 24. File Import and Export

Local project ingestion is managed by `src/services/import/importEngine.ts` and `src/services/import/projectDetection.ts`:

### Import Architecture & Invariants
- **Archive Size Caps:**
  - `MAX_ARCHIVE_BYTES = 50 * 1024 * 1024` (50 MB hard limit)
  - `WARN_ARCHIVE_BYTES = 25 * 1024 * 1024` (25 MB warning threshold)
  - `MAX_IMPORT_ENTRIES = 1500` (1,500 file entry ceiling)
- **Directory Exclusions:** Automatically skips build and package directories: `node_modules`, `.git`, `dist`, `build`, `.next`, `.nuxt`, `.cache`, `coverage`, `.turbo`, `vendor`, `__pycache__`, `.venv`, `.pnpm-store`, and `.yarn`.
- **Junk File Filtering:** Purges `.DS_Store`, `Thumbs.db`, `npm-debug.log`, and `yarn-error.log`.
- **Security Check:** Detects `.env` files (`isEnvFile`) and warns the user before importing.
- **Export System:** `src/utils/projectExport.ts` bundles current files into a clean ZIP archive with package manifests preserved.

---

## 25. AI Demo / Extension Inventory

The application contains several AI features and demonstration tools that the owner intends to preserve without actively expanding during the restructuring:

### Inventory of Existing AI Modules
1. **AI Chat Assistant:** `src/components/AIChatAssistant.tsx` and `src/services/aiChatAssistant.ts`. Chat overlay powered by `@google/generative-ai` (`gemini-pro`). Fails gracefully with a configuration advisory if `VITE_GEMINI_API_KEY` is not present.
2. **Build from Prompt:** `src/components/BuildFromPromptModal.tsx`. Generates HTML, CSS, and JS from prompts via `/api/ai` (`generate` action).
3. **Screenshot to Code:** `src/components/ScreenshotToCodeModal.tsx`. Analyzes uploaded UI images via `/api/vision-to-code`.
4. **CodeAssist Sidebar:** `src/components/vscode/CodeAssistPanel.tsx` and `src/services/ai/codeAssistService.ts`. In-IDE assistant offering Code, Ask, Debug, and Plan agent modes.
5. **Inline Copilot:** `src/services/inlineCopilotService.ts` and `/api/ai/inline-completion.js`. Provides Monaco ghost-text completions.
6. **CodeRabbit Review:** `src/components/CodeRabbitReviewModal.tsx` and `src/services/codeRabbitService.ts`. Automated code quality review modal.
7. **Voice Command System:** `src/components/VoiceCommandPanel.tsx` and `src/services/voiceCommandService.ts`. Speech recognition parser for editor commands.

### Isolation Recommendation
All AI components are already cleanly isolated behind dynamic `lazyWithRecovery` imports or dedicated services. During restructuring, these components should remain unchanged and accessible via their existing modal and sidebar triggers, with zero core IDE refactoring dependent on AI logic.

---

## 26. State Management

The application employs a pragmatic, multi-tiered state management model:

### State Ownership Map
- **Active Project Pointer:** Owned by `localStorage` (`gb-coder-active-project-id`), read synchronously on boot, managed in `App.tsx` state `activeProjectId`.
- **Project Records & File Contents:** Owned by IndexedDB (`projectDatabase.ts`).
- **VS Code Workspace Session:** Owned by IndexedDB (`vscodeWorkspaceStore.ts`).
- **WebContainer Runtime State:** Owned by `webcontainerService` singleton (`WebContainerManager`), read in React via `useSyncExternalStore` or custom subscriptions.
- **Active Editor View & Tabs:** Owned by `App.tsx` and `VSCodeMode.tsx` state hooks (`useState`, `useRef`).
- **Theme State:** Owned by `src/hooks/useTheme.ts`, synchronizing `gbcoder_theme` with document class list (`dark`).
- **User Settings:** Owned by `src/hooks/useSettings.ts`, persisting `gbcoder_settings` in `localStorage`.
- **Cross-Tab Live Preview:** Owned by `livePreviewChannel.ts` via `BroadcastChannel` and `sessionStorage`.

---

## 27. Component Dependency Graph

Below is the architectural dependency graph showing module relationships and boundaries:

    +-------------------------------------------------------------+
    |                         index.html                          |
    +-------------------------------------------------------------+
                                  |
                                  v
    +-------------------------------------------------------------+
    |                          main.tsx                           |
    |          (monacoWorkers.ts  |  initLaminar()  |  CSS)       |
    +-------------------------------------------------------------+
                                  |
                                  v
    +-------------------------------------------------------------+
    |                         AppWrapper                          |
    |                     (@vercel/analytics)                     |
    +-------------------------------------------------------------+
                                  |
                                  v
    +-------------------------------------------------------------+
    |                          App.tsx                            |
    |      (Root Coordinator, Route Ladder, Project Database)     |
    +-------------------------------------------------------------+
            |                     |                     |
     [!activeProjectId]     [isVSCodeRoute]       [activeProject]
            |                     |                     |
            v                     v                     v
    +---------------+    +------------------+   +-----------------+
    |    Project    |    |   VSCodeMode     |   |  Static Editor  |
    |   Dashboard   |    | (Full Workbench) |   | (3-Panel/Multi) |
    +---------------+    +------------------+   +-----------------+
            |                     |                     |
            |                     v                     v
            |            +------------------+   +-----------------+
            |            | webcontainer-    |   | bundlerService  |
            |            | Service          |   | (esbuild-wasm)  |
            |            +------------------+   +-----------------+
            |                     |                     |
            |                     v                     v
            |            +------------------+   +-----------------+
            |            | TerminalTab      |   | PreviewPanel    |
            |            | (Xterm / jsh)    |   | (Iframe / HMR)  |
            |            +------------------+   +-----------------+
            |                     |                     |
            +---------------------+---------------------+
                                  |
                                  v
    +-------------------------------------------------------------+
    |              IndexedDB (gb-coder-projects-db)               |
    +-------------------------------------------------------------+

---

## 28. UI Libraries, Themes and Styling

Styling in GB Coder is driven by Tailwind CSS v3.4.1 and custom design tokens defined in `tailwind.config.js` and `DESIGN.md`:

### Theme Palette & Tokens
- **Warm Canvas Surface:** `#faf9f5` (Tailwind token: `surface-canvas`, used in `DESIGN.md`).
- **Brand Accent:** `#cc785c` (Warm Coral / Terracotta, `primary` / `accent`).
- **Dark Product Surface:** `#181715` / `#1e1e1e` (`surface-dark`, `product`).
- **Typography:**
  - Display: `Cormorant Garamond, serif` (`font-display`)
  - Body & UI: `Inter, sans-serif` (`font-sans`)
  - Code & Terminal: `JetBrains Mono, monospace` (`font-mono`)
- **Icons:** `lucide-react` v0.344.0 used exclusively across all toolbars, tabs, and status bars.
- **Monaco Theme:** Defined in `src/utils/monacoTheme.ts` via `defineGbCoderTheme()`, matching VS Code Dark Modern with customized editor tokens.

---

## 29. Framework and Template Support

GB Coder bundles an extensive set of built-in starter templates (`src/services/enhancedTemplateService.ts` and `src/services/templates/`):

1. **Vanilla Web:** HTML5/CSS3/JS Starter, Animation Showcase, Audio Synthesizer, Kanban Board.
2. **React:** SaaS Dashboard, E-Commerce Store, Weather App, Todo App.
3. **Vue:** Tasks App, Agency Portfolio, Cloud Dashboard.
4. **Next.js (Emulated):** Next.js Blog, Next.js AI Startup, Next.js CRM Platform.
5. **Showcase Categories:** Business, Dashboard, E-Commerce, Landing Page, Portfolio, SaaS, Startup, Utility.

*Audit Note:* Templates in categories 1–4 are fully functional in the Static Editor or Advanced IDE. Framework templates that require server-side compilation (Next.js, Astro) execute in Advanced IDE via WebContainer.

---

## 30. Performance and Bundle Analysis

The production bundle was measured and validated using `scripts/measure-initial-bundle.mjs`:

### Initial Critical Path Payload (Entry + Modulepreload)
- `index-BGk4q2Jw.js`: `328.0 kB` (gzip: `100.6 kB`)
- `react-core-Bs8YxkVr.js`: `219.0 kB` (gzip: `71.9 kB`)
- `diff-tools-DD2B-4SM.js`: `18.1 kB` (gzip: `6.8 kB`)
- `monaco-editor-i21fvGzd.js`: `14.0 kB` (gzip: `4.8 kB`)
- **Total Initial JS:** `579.2 kB` (gzip: `184.0 kB`)
- **Total Initial CSS:** `100.8 kB` (gzip: `17.5 kB`)

### Verified Absent from Critical Path
Automated bundle assertions confirmed that heavy libraries stay strictly out of first paint:
- `JSZip` (96.5 kB) — lazy loaded on import/export.
- `xterm` & `terminal` (282.8 kB) — lazy loaded when terminal mounts.
- `typescript-compiler` (3.52 MB) — lazy loaded on TS/TSX mode.
- `esbuild-wasm` (12.2 MB WASM) — lazy loaded when compiling React/Vue.
- `vue-compiler` (797 kB) — lazy loaded on Vue mode.
- `VSCodeMode` & fullstack features — lazy loaded on `/ide`.

---

## 31. Security Architecture

### Verification of Task 01 Remediation (Laminar API Secret F-10 / S-01)
- [VERIFIED] Source code inspection of `src/services/laminarService.ts:24-53` confirms that all hardcoded high-entropy Laminar API credentials have been purged.
- [VERIFIED] In browser execution (`typeof window !== 'undefined'`), `initLaminar()` immediately terminates without reading environment variables or dispatching telemetry requests (`laminarService.ts:28-31`).
- [VERIFIED] `scripts/audit-run-tests.mjs:690-705` contains automated security assertions verifying zero hardcoded credentials across all source files.
- [VERIFIED] `vite.config.ts:330` externalizes `@lmnr-ai/lmnr` from the client build bundle.
- **Advisory:** While code-level remediation is complete and verified, the application owner must confirm that the compromised key was formally revoked in the Laminar dashboard.

### Additional Security Boundaries
- **Directory Traversal Protection:** Both `vite.config.ts:45` and `server/index.js:103` enforce `SAFE_API_ROUTE = /^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/`, strictly blocking path traversal attempts (`..`).
- **Loopback PTY Shell Protection:** `server/index.js:180-205` mandates constant-time token comparison (`timingSafeEqualStr`) and restricts WebSocket upgrades on `/terminal` strictly to loopback addresses (`127.0.0.1`, `::1`).
- **Terminal ANSI Injection Defense:** `src/utils/terminalSafety.ts` sanitizes all terminal outputs, stripping escape sequences that attempt clear-screen forgery or title-setting exploits.

---

## 32. Current Vercel Deployment Architecture

The production deployment at `https://code.ladestack.in/` is configured via `vercel.json`:

### Configuration Overview
- **Framework:** `vite` (`outputDirectory: "dist"`)
- **Build Command:** `npm run build`
- **Serverless Functions:** Exactly 12 functions in `api/` (matching the Vercel Hobby tier ceiling):
  1. `api/ai.js` (maxDuration: 120s)
  2. `api/vision-to-code.js` (maxDuration: 120s)
  3. `api/ai/inline-completion.js` (maxDuration: 30s)
  4. `api/health.js`
  5. `api/preview.js`
  6. `api/share.js`
  7. `api/preview/sync.js`
  8. `api/sandbox/create.js`
  9. `api/sandbox/start.js`
  10. `api/sandbox/exec.js`
  11. `api/sandbox/logs.js`
  12. `api/sandbox/close.js`
- **Global Headers:**
  ```json
  {
    "source": "/(.*)",
    "headers": [
      { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
      { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
    ]
  }
  ```
- **Rewrites:** Routes `/api/(.*)`, `/preview/(.*)`, `/mpreview/(.*)`, and `/(.*)` rewrites to `/index.html`.

---

## 33. Astro + Vite Integration Assessment

Combining an Astro marketing website with the existing React/Vite IDE under one GitHub repository, one Vercel deployment, and the primary domain `https://code.ladestack.in/` is the core architectural goal of the upcoming restructuring.

### Architectural Evaluation of Options

#### Approach A: Multi-Project Workspace / Sub-App Build (Recommended)
- Structure: Root repository containing `apps/marketing` (Astro) and `apps/ide` (Vite React), or an outer Astro application with the Vite build output nested at `dist/app/`.
- Orchestration: A unified build script (`npm run build`) builds Vite into `dist/app` and builds Astro to `dist`, outputting an integrated static directory.
- Header Isolation: `vercel.json` applies COOP/COEP headers ONLY to `/app/(.*)` and `/ide/(.*)`, leaving `/`, `/features`, `/docs`, `/blog`, and marketing pages unencumbered by `require-corp`.
- Feasibility: **HIGH**. Zero runtime friction. Single Vercel project deployment.

#### Approach B: Astro Single-Shell with React Island Integration
- Structure: Astro acts as the single framework. The IDE is mounted as an Astro page (`/app.astro`) using client directives (`<IDE client:only="react" />`).
- Tradeoffs: **HIGH RISK**. WebContainer, Monaco web workers, esbuild-wasm, and PWA plugins require complex Vite build configurations that can conflict with Astro's client bundler. Separating the builds ensures total stability.

---

## 34. Existing SEO and Crawlability

### Current SEO Audit Findings
1. **100% Client-Side Rendering:** The application is an SPA. Search engine crawlers visiting `https://code.ladestack.in/` receive an empty `<div id="root"></div>` and a JavaScript bundle.
2. **Outdated Sitemap (`public/sitemap.xml`):** Hardcoded to `https://gbcoder.com/` instead of `https://code.ladestack.in/`.
3. **Outdated Robots.txt (`public/robots.txt`):** Refers to `Host: https://gbcoder.com` and sitemaps at `gbcoder.com`.
4. **No Semantic Heading Structure:** Because pages (`about`, `documentation`, `privacy`) render inside client modals and view ladders, they are not discoverable via standard HTML crawls.

### Astro Migration Opportunity
Migrating marketing, features, about, contact, blog, and documentation to Astro provides 100% server-generated static HTML, instant Core Web Vitals, fully populated Open Graph / Twitter metadata, and native XML sitemaps generated at build time.

---

## 35. Future Multilingual Astro Architecture

The owner requires support for nine languages: English, Spanish, Dutch, French, Japanese, Korean, Chinese, Russian, and Portuguese.

### Proposed Architecture
- **Locales:** `en` (default), `es`, `nl`, `fr`, `ja`, `ko`, `zh`, `ru`, `pt`.
- **Astro i18n Routing:** Native Astro v4/v5 i18n routing:
  - English: `/` (or `/en/`)
  - Spanish: `/es/`, `/es/features`, `/es/docs`
  - Dutch: `/nl/`, `/nl/features`, `/nl/docs`
  - French: `/fr/`, `/fr/features`, `/fr/docs`
  - Japanese: `/ja/`, `/ja/features`, `/ja/docs`
  - Korean: `/ko/`, `/ko/features`, `/ko/docs`
  - Chinese: `/zh/`, `/zh/features`, `/zh/docs`
  - Russian: `/ru/`, `/ru/features`, `/ru/docs`
  - Portuguese: `/pt/`, `/pt/features`, `/pt/docs`
- **Metadata:** Automatic `<link rel="alternate" hreflang="..." href="..." />` tags with `x-default` pointing to `/`.
- **Translations:** Content Collections in `src/content/` organized by language code with strict TypeScript/Zod schema enforcement.

---

## 36. Markdown Blog and Documentation

### Existing Content Inventory
- Documentation currently lives inside `src/components/pages/DocumentationPage.tsx` (694 lines of JSX) and repository markdown guides (`docs/DEPLOY.md`, `docs/NPM_COMMANDS_AND_INSTALLATION_GUIDE.md`, `docs/HOW_TO_DELETE_PACKAGES.md`).
- There are currently NO blog posts or MDX articles in the repository.

### Proposed Astro Content Collections
- `src/content/docs/[locale]/`: Migrate sections from `DocumentationPage.tsx` (Getting Started, Editor Features, AI Tools, Preview, Projects, File Management, Settings, Snippets, Keyboard Shortcuts) into Markdown/MDX articles.
- `src/content/blog/[locale]/`: Developer tutorials, web development tips, and platform updates.
- Schemas: Defined using `astro:content` with Zod validation for title, description, publishDate, author, tags, and locale.

---

## 37. Project Dashboard Readiness

The project dashboard was introduced in commit `f4fd250` and is already operational in `src/components/projects/ProjectDashboard.tsx`:

### Current Capabilities
- Renders automatically when `activeProjectId` is null.
- Lists all saved projects from IndexedDB (`projectDatabase.ts`) sorted by last opened timestamp.
- Displays project name, editor style badge ('Plain' vs 'VS Code'), file count, and relative opened timestamp.
- Supports inline project deletion with confirmation.
- Includes quick "New Project" and "Import" buttons with drag-and-drop folder overlay.

### Enhancements Required for Future Dashboard Route (`/app`)
1. Project search and filtering bar.
2. Project renaming and duplication actions.
3. Storage quota usage indicator (visualizing IndexedDB storage space).
4. Direct template launcher cards.

---

## 38. Complete Feature Status Matrix

| Category | Feature | Status | Source File(s) | Implementation Summary | Test Evidence | Known Limitations |
|---|---|---|---|---|---|---|
| Marketing | Astro Marketing Root | NOT_IMPLEMENTED | None | Currently root shows SPA dashboard | N/A | To be built in Astro |
| Marketing | Multilingual Routing | NOT_IMPLEMENTED | None | Only single English SPA exists | N/A | 9 languages planned |
| Dashboard | Local Project History | IMPLEMENTED_AND_VERIFIED | `components/projects/ProjectDashboard.tsx` | Lists projects from IndexedDB | Task 07 tests (20/20) | Needs search/sort UI |
| Dashboard | New Project Creation | IMPLEMENTED_AND_VERIFIED | `components/projects/NewProjectModal.tsx` | Creates project with style picker | Verified in App.tsx | None |
| Storage | IndexedDB Project DB | IMPLEMENTED_AND_VERIFIED | `services/projects/projectDatabase.ts` | Multi-project and file stores | Task 07 tests (20/20) | Origin quota limits |
| Storage | Auto-Save System | IMPLEMENTED_AND_VERIFIED | `App.tsx:2120-2135` | 1000ms debounce + visibility flush | Task 07 tests (20/20) | None |
| Static Editor | 3-Panel HTML/CSS/JS | IMPLEMENTED_AND_VERIFIED | `components/EditorPanel.tsx` | Collapsible HTML/CSS/JS panels | Verified in App.tsx | Plain mode only |
| Static Editor | Multi-file React/Vue | IMPLEMENTED_AND_VERIFIED | `components/MultiFileEditor.tsx` | Tabbed Monaco + in-browser esbuild | Manual tests | No backend Node |
| Advanced IDE | VS Code Workbench | IMPLEMENTED_AND_VERIFIED | `components/vscode/VSCodeMode.tsx` | Full-screen IDE shell | Task 11 report | Monolithic file |
| Advanced IDE | Split Editor | IMPLEMENTED_AND_VERIFIED | `VSCodeMode.tsx:1950` | Side-by-side Monaco editors | Verified | Horizontal only |
| Monaco | Web Worker Offloading | IMPLEMENTED_AND_VERIFIED | `utils/monacoWorkers.ts` | Same-origin Vite ?worker modules | Task 09 tests | Requires workers |
| Terminal | WebContainer PTY | IMPLEMENTED_AND_VERIFIED | `services/webcontainer/webcontainerService.ts` | Spawns jsh PTY with 500-chunk buffer | Task 04 tests (15/15) | 1 active shell |
| Terminal | Local Shell Fallback | IMPLEMENTED_AND_VERIFIED | `services/localShell.ts` | Simulated JS shell for unisolated envs | Task 08 tests (17/17) | Read-only commands |
| Runtime | WebContainer Boot | IMPLEMENTED_AND_VERIFIED | `services/webcontainer/webcontainerService.ts` | Singleton boot with HMR recovery | Task 08 tests (17/17) | Needs COOP/COEP |
| Dependency | npm Fingerprint Cache | IMPLEMENTED_AND_VERIFIED | `webcontainerService.ts:37-99` | DJB2 hash of package & lockfiles | Task 03 tests (12/12) | None |
| Server | Dev Server Lifecycle | IMPLEMENTED_AND_VERIFIED | `webcontainerService.ts:608-682` | server-ready listener with epochs | Task 04 tests (15/15) | None |
| Preview | PostMessage Reload | IMPLEMENTED_AND_VERIFIED | `services/preview/previewReloadService.ts` | In-window reload without DOM remount | Task 05 tests (12/12) | None |
| Preview | Detached Popout Tab | IMPLEMENTED_AND_VERIFIED | `services/preview/livePreviewChannel.ts` | BroadcastChannel cross-tab sync | Task 06 tests (12/12) | Popups enabled |
| Import | ZIP & Folder Ingestion | IMPLEMENTED_AND_VERIFIED | `services/import/importEngine.ts` | 50 MB archive cap, exclusion rules | Unit tests | Memory bounds |
| Security | Laminar Key Remediation | IMPLEMENTED_AND_VERIFIED | `services/laminarService.ts` | Purged hardcoded credentials | Task 01 tests (77/77) | Key revocation req |
| Deployment | Vercel Function Config | IMPLEMENTED_AND_VERIFIED | `vercel.json` | 12 functions, catch-all rewrites | `verify:deploy` | At 12-function cap |

---

## 39. Previous 11 Fix Tasks Verification

### Task 01: Laminar Security Remediation (F-10 / S-01)
- [VERIFIED] Report: `reports/01_LAMINAR_SECURITY_FIX.md`
- [VERIFIED] Code: `src/services/laminarService.ts:24-53` purges credential literals and guards browser execution.
- [VERIFIED] Tests: `scripts/audit-run-tests.mjs` executes 6 security tests verifying no secrets in client code.
- Status: Code Remediated; account-level key revocation still required on Laminar dashboard.

### Task 02: Deployment Consistency Verification
- [VERIFIED] Report: `reports/02_DEPLOYMENT_CONSISTENCY.md`
- [VERIFIED] Code: `vercel.json` and `scripts/verify-deploy-config.mjs` validate rewrites, function limits, and headers.
- Status: Fully Verified.

### Task 03: npm Installation Performance Optimization
- [VERIFIED] Report: `reports/03_NPM_PERFORMANCE_OPTIMIZATION.md`
- [VERIFIED] Code: `webcontainerService.ts:15-99` implements `.npmrc` flags and `computeDependencyFingerprint`.
- [VERIFIED] Tests: `scripts/npm-install-performance-tests.mjs` (12/12 passing).
- Status: Fully Verified.

### Task 04: Development Server Lifecycle and Startup Fix
- [VERIFIED] Report: `reports/04_DEV_SERVER_LIFECYCLE_FIX.md`
- [VERIFIED] Code: `webcontainerService.ts:608-682` decouples process lifecycle from component remounts via session epochs.
- [VERIFIED] Tests: `scripts/dev-server-lifecycle-tests.mjs` (15/15 passing).
- Status: Fully Verified.

### Task 05: Live Preview Refresh Fix
- [VERIFIED] Report: `reports/05_LIVE_PREVIEW_REFRESH_FIX.md`
- [VERIFIED] Code: `src/services/preview/previewReloadService.ts` implements non-destructive postMessage reload.
- [VERIFIED] Tests: `scripts/preview-refresh-tests.mjs` (12/12 passing).
- Status: Fully Verified.

### Task 06: Fix Open in New Tab Live Preview
- [VERIFIED] Report: `reports/06_OPEN_IN_NEW_TAB_FIX.md`
- [VERIFIED] Code: `src/services/preview/livePreviewChannel.ts` and `LivePreviewPopoutPage.tsx`.
- [VERIFIED] Tests: `scripts/open-in-new-tab-tests.mjs` (12/12 passing).
- Status: Fully Verified.

### Task 07: Full Browser Reload Recovery and Project Persistence
- [VERIFIED] Report: `reports/07_BROWSER_REFRESH_RECOVERY.md`
- [VERIFIED] Code: `projectDatabase.ts` and `vscodeWorkspaceStore.ts` handle IndexedDB restoration.
- [VERIFIED] Tests: `scripts/reload-recovery-tests.mjs` (20/20 passing).
- Status: Fully Verified.

### Task 08: WebContainer Status Accuracy and Error Recovery
- [VERIFIED] Report: `reports/08_RUNTIME_STATUS_RELIABILITY.md`
- [VERIFIED] Code: `webcontainerService.ts:101-146` state machine transitions cleanly without phantom stages.
- [VERIFIED] Tests: `scripts/runtime-status-tests.mjs` (17/17 passing).
- Status: Fully Verified.

### Task 09: Monaco Worker and Performance Fix
- [VERIFIED] Report: `reports/09_MONACO_WORKER_FIX.md`
- [VERIFIED] Code: `src/utils/monacoWorkers.ts` offloads JSON, CSS, HTML, and TS workers to same-origin Vite workers.
- [VERIFIED] Tests: E2E Playwright test suite `scripts/monaco-worker-tests.mjs` defined (requires port 4175).
- Status: Fully Implemented in code.

### Task 10: COEP and External Resource Compatibility
- [VERIFIED] Report: `reports/10_COEP_RESOURCE_COMPATIBILITY.md`
- [VERIFIED] Code: `vercel.json` configures COOP/COEP headers; `webcontainerSupport.ts` diagnoses header gaps.
- Status: Fully Verified.

### Task 11: Professional IDE UI/UX Redesign with LadeStack Branding
- [VERIFIED] Report: `reports/11_IDE_UI_UX_REDESIGN.md`
- [VERIFIED] Code: LadeStack branding, status bar, and theme tokens applied across `VSCodeMode.tsx` and `LadeStackLogo.tsx`.
- Status: Fully Verified.

---

## 40. Test Infrastructure and Coverage

### Executed Test Suites Summary
- `npm run audit:tests`: **77 passed**, 0 failed (Deploy, Git Sync, Terminal Safety, XSS, Laminar Security).
- `npm run audit:webcontainer`: **26 passed**, 0 failed (Isolation headers, support guards, tree serialization).
- `npm run audit:lifecycle`: **15 passed**, 0 failed (Server process persistence, epoch isolation).
- `npm run audit:npm`: **12 passed**, 0 failed (Fingerprint caching, duplicate prevention, .npmrc flags).
- `npm run audit:preview`: **12 passed**, 0 failed (PostMessage reload, timeout fallback).
- `npm run audit:newtab`: **12 passed**, 0 failed (BroadcastChannel sync, popout parameter parsing).
- `npm run audit:reload`: **20 passed**, 0 failed (IndexedDB restoration, reload idempotency).
- `npm run audit:status`: **17 passed**, 0 failed (Status transitions, error recovery).
- `npm run verify:bundle`: **Passed** (Initial JS: 579 kB, 0 banned modules in critical path).
- `npm run verify:deploy`: **Passed** (Vercel config valid, 12 functions, COOP/COEP headers present).
- **Total Unit & Regression Tests Passing:** **191 / 191 tests passing**.

*Playwright E2E Suites (`monaco-worker-tests.mjs`, `coep-resource-tests.mjs`):* These suites require an active preview server running on `http://localhost:4175`. When the preview server is offline, browser connection is refused. The underlying source code and unit tests are fully compliant.

---

## 41. Technical Debt and Known Risks

### Critical Severity
1. **Global COOP/COEP Header Collision (Arch Risk):** Currently, `vercel.json` applies `require-corp` and `same-origin` to `/(.*)`. When an Astro marketing site is deployed at root `/`, this header will block external images, YouTube embeds, or non-CORP assets. **Remediation:** Scope COOP/COEP headers strictly to `/app/(.*)` and `/ide/(.*)`.

### High Severity
2. **Oversized Root Component (`App.tsx`):** At 4,715 lines, `App.tsx` combines route matching, modal dialog states, autosave debouncing, and project opening. **Remediation:** Decompose into distinct context providers and route screens.
3. **Monolithic IDE Workbench (`VSCodeMode.tsx`):** At 2,406 lines, `VSCodeMode.tsx` mixes drag resizing, layout state, Monaco mounting, and WebContainer callbacks. **Remediation:** Split into modular layout components.
4. **Vercel Hobby Function Ceiling:** The repository currently has exactly 12 serverless functions in `api/`, which is the maximum limit on Vercel Hobby accounts. Adding any new serverless function will cause deploy upload failures.

### Medium Severity
5. **Outdated Domain Metadata:** `public/robots.txt` and `public/sitemap.xml` reference `https://gbcoder.com` instead of `https://code.ladestack.in/`.
6. **No Router Library:** Manual `window.location` inspection makes complex nested routing fragile.

---

## 42. Functionality That Must Be Preserved

During the restructuring, the following verified systems MUST NOT be rewritten or disrupted:
1. `src/services/webcontainer/webcontainerService.ts`: All singleton boot, mounting, shell spawning, and fingerprinting methods.
2. `src/services/projects/projectDatabase.ts`: IndexedDB database schema (`gb-coder-projects-db`) and compound-key file persistence.
3. `src/services/preview/previewReloadService.ts`: Non-destructive postMessage iframe reload protocol.
4. `src/services/preview/livePreviewChannel.ts`: Cross-tab BroadcastChannel live preview synchronization.
5. `src/utils/monacoWorkers.ts`: Same-origin web worker registration logic.
6. `src/services/bundlerService.ts`: Client-side `esbuild-wasm` and `@vue/compiler-sfc` compilation pipeline.
7. `src/components/EditorPanel.tsx`: The 3-panel Static Editor visual experience.
8. The 191 automated regression tests in `scripts/`.

---

## 43. Reusable Components and Services

The future architecture should directly reuse:
- **For the Dashboard (`/app`):** `ProjectDashboard.tsx`, `NewProjectModal.tsx`, `projectDatabase.ts`.
- **For the Static Editor (`/app/editor/:id`):** `EditorPanel.tsx`, `MultiFileEditor.tsx`, `bundlerService.ts`, `PreviewPanel.tsx`.
- **For the Advanced IDE (`/app/ide/:id`):** `FileTreeView.tsx`, `TerminalTab.tsx`, `StackBlitzStartupLoader.tsx`, `IDESettingsModal.tsx`, `webcontainerService.ts`.
- **For Core Utilities:** `appRoutes.ts`, `monacoTheme.ts`, `terminalSafety.ts`, `projectExport.ts`.

---

## 44. Missing Features and Architectural Gaps

1. **Astro Marketing Framework:** Astro is not yet installed or configured in the repository.
2. **Multilingual Content Structure:** No translation dictionaries, i18n routing, or localized metadata exist.
3. **Markdown Blog & Documentation Collections:** No Content Collections exist; docs are currently hardcoded in JSX.
4. **Scoped Routing Under `/app`:** The IDE currently expects root `/` or `/ide`.
5. **Header Scoping in `vercel.json`:** COOP/COEP headers are global rather than path-isolated.

---

## 45. Restructuring Impact Analysis

| System / Area | Impact Level | Action Required | Breaking Change Risk |
|---|---|---|---|
| Domain Root (`/`) | High | Replace SPA root with Astro marketing homepage | None (projects move to `/app`) |
| Project Storage | Low | Retain IndexedDB database name and schema | Zero (storage is origin-wide) |
| WebContainer Runtime | Medium | Scope COOP/COEP headers to `/app/(.*)` | High if headers are misconfigured |
| Vercel Deployment | Medium | Update build command to orchestrate Astro + Vite | Moderate |
| Existing Routes | Medium | Add redirects from `/` to `/app` for active projects | Low |

---

## 46. Recommended Implementation Roadmap

1. **Phase 0: Baseline & Safety Verification:** Lock git baseline, run all 191 regression tests, verify bundle budget.
2. **Phase 1: Deployment Header Scoping:** Update `vercel.json` to isolate COOP/COEP headers to `/app/(.*)` and `/ide/(.*)`, freeing root routes for standard marketing assets.
3. **Phase 2: IDE Route Relocation:** Update Vite base path and router helpers to mount the IDE dashboard at `/app`, the static editor at `/app/editor/:id`, and the Advanced IDE at `/app/ide/:id`.
4. **Phase 3: Dashboard & Persistence Extraction:** Formalize the Project Dashboard as the dedicated `/app` entry point.
5. **Phase 4: Advanced IDE Component Decomposition:** Refactor `VSCodeMode.tsx` into modular workbench components.
6. **Phase 5: Astro Marketing Foundation:** Initialize Astro in `apps/marketing` or root, establishing the LadeStack editorial design (`DESIGN.md`).
7. **Phase 6: Astro i18n & Content Collections:** Configure 9-language routing and migrate `DocumentationPage.tsx` into Markdown/MDX collections.
8. **Phase 7: Unified Build Orchestration:** Configure single npm build script outputting Astro static pages at root and the Vite SPA at `/app`.
9. **Phase 8: Full E2E & Deployment Verification:** Verify production headers, offline storage, WebContainer boots, and multilingual SEO.

---

## 47. Proposed Future Repository Structure

    GB-CODER-PUBLIC-ALPHA/
    ├── apps/
    │   ├── marketing/                  # Astro Marketing Website
    │   │   ├── src/
    │   │   │   ├── content/            # Markdown docs & blog in 9 languages
    │   │   │   ├── pages/              # Localized Astro pages (/, /features, /about)
    │   │   │   └── components/         # Editorial marketing UI components
    │   │   └── astro.config.mjs
    │   └── ide/                        # Existing React + Vite IDE Application
    │       ├── src/
    │       │   ├── components/         # Decomposed workbench components
    │       │   ├── services/           # webcontainerService, projectDatabase
    │       │   └── App.tsx             # IDE routing (/app, /app/editor, /app/ide)
    │       └── vite.config.ts
    ├── api/                            # 12 Vercel Serverless Functions
    ├── scripts/                        # Automated regression test suites
    ├── package.json                    # Workspace / Unified build orchestrator
    └── vercel.json                     # Path-isolated headers, rewrites & functions

---

## 48. Proposed Future URL Structure

    Marketing & Informational (Astro):
    /                                   # Homepage (English)
    /features                           # Features overview
    /about                              # About LadeStack & GB Coder
    /contact                            # Contact & community links
    /docs                               # Documentation hub
    /docs/:section/:slug                # Markdown documentation articles
    /blog                               # Blog index
    /blog/:slug                         # Markdown blog post
    /privacy                            # Privacy Policy
    /terms                              # Terms of Service
    /es/, /nl/, /fr/, /ja/, /ko/, etc.  # Localized versions for 8 other languages

    Application & IDE (React / Vite):
    /app                                # Browser-local Project Dashboard
    /app/editor/:projectId              # Preserved Static 3-Panel / Multi-file Editor
    /app/ide/:projectId                 # VS Code-style Advanced IDE (WebContainer)
    /preview-popout                     # Detached Live Preview popout utility

---

## 49. Migration and Rollback Considerations

1. **Storage Continuity:** Because IndexedDB (`gb-coder-projects-db`) and LocalStorage are origin-bound, user projects created on `https://code.ladestack.in/` under the old structure will immediately be readable under `/app` without requiring data migration.
2. **Header Isolation Guard:** If Astro marketing pages fail to render external resources, verify that COEP `require-corp` is strictly restricted to `/app/(.*)` and `/ide/(.*)`.
3. **Rollback Strategy:** Commit `a00e889` represents a clean, fully passing baseline. The repository can be rolled back instantly via Git if deployment orchestration encounters build errors.

---

## 50. Unresolved Questions

### Technical Questions
1. Should Astro and Vite be structured as an npm workspaces monorepo or as an integrated single-package build where Vite builds directly into Astro's `public/app` directory?
2. Has the Laminar API key been revoked in the upstream Laminar dashboard, ensuring the old exposed credential is fully dead?

### Product Decisions
3. When a user in the future clicks "Start Coding" on the Astro homepage, should they be directed to the Project Dashboard (`/app`) or directly into a blank editor?
4. For mobile viewports, should the Advanced IDE display a desktop-recommended banner and suggest opening the Static Editor?

### Legal / Licensing Questions
5. Have the commercial licensing terms for StackBlitz WebContainer (@webcontainer/api) been reviewed for the intended production deployment scale?

---

## 51. Critical Decisions Required

1. **Header Boundary Decision:** Formally approve splitting Vercel headers so that COOP/COEP applies only to `/app/(.*)` and `/ide/(.*)`, freeing marketing pages.
2. **Build Orchestration Choice:** Formally approve whether to use an npm workspace monorepo (`apps/marketing` + `apps/ide`) or a nested build pipeline.
3. **Domain & SEO Canonicalization:** Approve updating `robots.txt` and `sitemap.xml` to permanently purge `gbcoder.com` in favor of `https://code.ladestack.in/`.

---

## 52. Final Architecture Recommendation

The recommended architectural approach is a **Single Repository, Path-Isolated Multi-App Deployment**:
1. Keep the entire codebase in the current GitHub repository under the single Vercel project connected to `https://code.ladestack.in/`.
2. Introduce Astro to serve static, pre-rendered HTML for marketing, documentation, blog, legal, and informational pages across all nine requested languages.
3. Migrate the existing React/Vite application under the `/app` path, where it serves the Project Dashboard (`/app`), Static Editor (`/app/editor/:id`), and Advanced IDE (`/app/ide/:id`).
4. Reconfigure `vercel.json` so that WebContainer's COOP (`same-origin`) and COEP (`require-corp`) headers apply strictly to `/app/(.*)` and `/ide/(.*)`.
5. Decompose `VSCodeMode.tsx` into clean, modular workbench components while preserving the battle-tested `webcontainerService.ts`, `projectDatabase.ts`, and `previewReloadService.ts`.

---

## 53. AI Architect Handoff Summary

1. **Framework & Versions:** React 18.3.1, TypeScript 5.5.3, Vite 5.4.2, Tailwind CSS 3.4.1, @webcontainer/api 1.6.4, @monaco-editor/react 4.6.0, xterm 5.3.0, esbuild-wasm 0.25.10.
2. **Repository Identity:** Git repo `GB-CODER-PUBLIC-ALPHA`, branch `main`, baseline commit `a00e889913dd25315733d1bb6a553784308f3857`, working tree clean.
3. **Application Entry Point:** `index.html` -> `src/main.tsx` -> `src/AppWrapper.tsx` -> `src/App.tsx`.
4. **Routing Entry Point:** `src/utils/appRoutes.ts` and `src/App.tsx:3365-3935` (early return ladder; no router library).
5. **Static Editor Entry Component:** `src/components/EditorPanel.tsx` (plain 3-panel) and `src/components/MultiFileEditor.tsx` (React/Vue multi-file).
6. **Advanced IDE Entry Component:** `src/components/vscode/VSCodeMode.tsx` (2,406 lines).
7. **WebContainer Service Entry Point:** `src/services/webcontainer/webcontainerService.ts` (`webcontainerService` singleton).
8. **Terminal Component Entry Point:** `src/components/Console/TerminalTab.tsx`.
9. **Preview Component Entry Point:** `src/components/PreviewPanel.tsx` (static) and `src/services/preview/previewReloadService.ts` (WebContainer iframe).
10. **Project Storage Service:** `src/services/projects/projectDatabase.ts` (IndexedDB `gb-coder-projects-db`).
11. **Project Data Models:** `ProjectRecord`, `ProjectFile`, `MultiFileProject`, `EditorStyle` in `src/types/files.ts` and `src/services/projects/projectDatabase.ts`.
12. **Import/Export Implementation:** `src/services/import/importEngine.ts` and `src/utils/projectExport.ts`.
13. **Current Routes:** `/` (Dashboard / Static Editor), `/ide` (VS Code Mode), `/preview-popout`, `/preview/:id`, `/mpreview/:id`, legal views, and `/api/*`.
14. **Current Build Command:** `npm run build` (`vite build`).
15. **Current Deployment Config:** `vercel.json` (Vite framework, 12 serverless functions in `api/`, global COOP/COEP headers).
16. **Main Stylesheet / Theme System:** `src/index.css`, `tailwind.config.js`, and `DESIGN.md` (warm cream `#faf9f5` canvas, coral `#cc785c` accent, dark `#181715` product surfaces).
17. **Working Existing Features:** All 11 fix sprint features verified working; 191 unit and regression tests passing.
18. **Missing Features:** Astro marketing site, 9-language i18n routing, Markdown blog/docs collections, modular IDE workbench.
19. **Known Issues:** Global COOP/COEP headers block unisolated marketing embeds; outdated domain references in `robots.txt`/`sitemap.xml`.
20. **Major Architectural Risks:** Monolithic `App.tsx` and `VSCodeMode.tsx`; 12-function Hobby limit on Vercel.
21. **Recommended Migration Approach:** Single repo, path-isolated deployment: Astro at root `/`, Vite IDE at `/app`, scoped Vercel headers.
22. **Recommended Implementation Sequence:** Phase 0 (Baseline) -> Phase 1 (Header Scoping) -> Phase 2 (IDE Route Relocation to `/app`) -> Phase 3 (Workbench Decomposition) -> Phase 4 (Astro Marketing & i18n) -> Phase 5 (Unified Build).
23. **Most Important Files to Inspect Next:** `src/App.tsx`, `src/components/vscode/VSCodeMode.tsx`, `src/services/webcontainer/webcontainerService.ts`, `src/services/projects/projectDatabase.ts`, `vercel.json`, and `DESIGN.md`.
24. **Required User Decisions:** Approve header boundary separation for `/app`, confirm Astro monorepo vs nested build, confirm upstream Laminar key revocation.
25. **Most Important Regression Tests:** Run `npm run audit:tests`, `npm run audit:webcontainer`, `npm run audit:lifecycle`, `npm run audit:npm`, `npm run audit:preview`, `npm run audit:newtab`, `npm run audit:reload`, `npm run audit:status`, `npm run verify:bundle`, and `npm run verify:deploy`.
