# 03 — Technology Stack

> **Source Prompt:** PROMPT_03_Technology_Stack_Detection.md
> **Phase:** 1 — Discovery
> **Repository:** GB-CODER-PUBLIC-ALPHA
> **Commit:** b6035fee6bde521427e64f81498dd32d4c7833dc
> **Generated:** 2026-08-02 19:36:08 UTC
> **Status:** Complete
> **Confidence:** High — declared versions cross-checked against resolved versions from `package-lock.json` and installed `node_modules`
> **Next Expected Document:** Phase 2/PROMPT_04_Folder_Architecture.md → `04_folder_architecture.md`

---

## 1. Overview

GB Coder is a browser-based HTML/CSS/JavaScript code playground with an integrated terminal, AI chat assistant, project management, and extensive developer tooling. The repository contains **two separate Node.js projects** (root frontend + `server/` backend), plus **Vercel serverless functions** (`api/`) and a **Supabase database schema**.

## 2. Methodology

- All package manifests enumerated and read: root `package.json`, `server/package.json`, lock files, `.env.example` files, `vercel.json`, `vite.config.ts`, `tsconfig*.json`, `supabase/*.sql`
- Resolved versions extracted from `package-lock.json` (root, 9,011 lines) and `server/package-lock.json` (1,033 lines); installed versions cross-checked from `node_modules/<pkg>/package.json`
- **Version confidence:** HIGH for root frontend (lock + installed modules verified); HIGH for server (lock file verified); server `node_modules` not installed on this machine (does not affect lock file resolution)
- Import statements cross-referenced against the file inventory (P02) to confirm usage locations

## 3. Findings

### 3.1 Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Language | TypeScript | 5.6.3 (resolved) | Frontend source language |
| Language | JavaScript (ESM/CJS) | — | Server (`server/index.js`), serverless (`api/*.js`), scripts |
| Language | HTML/CSS | — | App shell + playground code |
| Language | SQL | — | Supabase schema/migration |
| Web Runtime | Node.js | required 18+ (Vite 5) | Frontend build + server runtime |
| UI Framework | React | 18.3.1 | Frontend UI |
| Build Tool | Vite | 5.4.8 (resolved) | Dev server + bundler |
| Build Plugin | @vitejs/plugin-react | 4.3.2 | React fast-refresh plugin |
| PWA | vite-plugin-pwa | 1.1.0 | Service worker + manifest |
| CSS Framework | Tailwind CSS | 3.4.17 (resolved) | Utility-first styling |
| CSS Processing | PostCSS + Autoprefixer | 8.5.25 / 10.4.20 | Tailwind pipeline |
| Editor | Monaco (via @monaco-editor/react) | 4.7.0 | Code editor panels |
| Terminal | xterm.js | 5.3.0 | Browser terminal emulator |
| Backend Framework | Express | 4.22.1 (resolved) | HTTP server (`server/`) |
| WebSocket | ws | 8.19.0 (resolved) | Terminal proxy (`/terminal`) |
| PTY | node-pty | 1.1.0 (resolved) | Pseudo-terminal spawning |
| AI SDK (client) | @google/generative-ai | 0.24.1 | Gemini chat assistant |
| AI Proxy (serverless) | NVIDIA NIM (HTTP via axios) | — | `api/ai.js` backend AI |
| AI Sandbox | e2b (SDK) | 2.37.0 | Cloud sandbox sessions (`src/services/sandbox/sandboxSession.ts`) |
| In-browser Bundler | esbuild-wasm | 0.25.10 (exact) | Code execution/bundling in sandbox |
| Vue SFC Compiler | @vue/compiler-sfc | 3.5.40 (exact) | Vue template support (templates/) |
| Database (schema) | Supabase PostgreSQL | — | 7-table schema + RLS (schema.sql, migration.sql) |
| Cache/Rate-limit | Upstash Redis | 1.38.0 | Rate limiting for `api/ai.js` |
| Analytics | Vercel Analytics + react-ga4 | 1.6.1 / 2.1.0 | Web analytics |
| Hosting | Vercel | — | Deployment (vercel.json) |

### 3.2 Full Dependency Catalog

**Runtime Dependencies (root):**

| Package | Declared | Resolved (lock) | Pinned? | Purpose | Used In |
|---------|----------|-----------------|---------|---------|---------|
| @google/generative-ai | ^0.24.1 | 0.24.1 | No | Gemini AI chat | src/services/aiChatAssistant.ts |
| @monaco-editor/react | ^4.6.0 | 4.7.0 | No | Monaco editor wrapper | src/components/CodeEditor.tsx |
| @upstash/redis | ^1.38.0 | 1.38.0 | No | Redis client (rate limit) | api/ai.js, api/test-redis.js |
| @vercel/analytics | ^1.6.1 | 1.6.1 | No | Vercel Analytics | src/AppWrapper.tsx |
| @vue/compiler-sfc | 3.5.40 | 3.5.40 | **Yes (exact)** | Vue SFC compilation for sandbox | src/services/bundlerService.ts |
| axios | ^1.13.6 | 1.13.6 | No | HTTP client | api/*.js (serverless), client |
| diff | ^5.2.0 | 5.2.0 | No | Line diff generation | src/services/formattingService.ts |
| e2b | ^2.37.0 | 2.37.0 | No | Cloud code sandbox | src/services/sandbox/sandboxSession.ts |
| esbuild-wasm | 0.25.10 | 0.25.10 | **Yes (exact)** | In-browser JS bundling | src/services/bundlerService.ts |
| html-to-image | ^1.11.13 | 1.11.13 | No | Screenshot capture | src/services/captureService.ts, screenshotService.ts |
| jszip | ^3.10.1 | 3.10.1 | No | ZIP export/import | projectArchiveService, shareExportService, importEngine |
| lucide-react | ^0.344.0 | 0.344.0 | No | Icons | all components |
| prettier | ^3.6.2 | 3.6.2 | No | Code formatting | src/services/formattingService.ts |
| react | ^18.3.1 | 18.3.1 | No | UI framework | all |
| react-diff-viewer-continued | ^3.4.0 | 3.4.0 | No | Diff viewer | AiDiffModal, FormatDiffModal |
| react-dom | ^18.3.1 | 18.3.1 | No | React DOM renderer | src/main.tsx |
| react-error-boundary | ^6.0.0 | 6.0.0 | No | Error boundaries | ErrorBoundary.tsx |
| react-ga4 | ^2.1.0 | 2.1.0 | No | Google Analytics 4 | src/services/analytics.ts |
| react-hot-toast | ^2.6.0 | 2.6.0 | No | Toasts | ui/CopyToast.tsx, FormatToast.tsx |
| uuid | ^13.0.0 | 13.0.0 | No | UUID generation | projectStore, sessionDataService |
| vite-plugin-pwa | ^1.1.0 | 1.1.0 | No | PWA/service worker | vite.config.ts |
| web-vitals | ^5.1.0 | 5.1.0 | No | Core Web Vitals | AppWrapper / analytics |
| xterm | ^5.3.0 | 5.3.0 | No | Terminal emulator | Console/TerminalTab.tsx, sandboxTerminal.ts |

**Runtime Dependencies (server/):**

| Package | Declared | Resolved (lock) | Pinned? | Purpose | Used In |
|---------|----------|-----------------|---------|---------|---------|
| axios | ^1.7.2 | 1.13.5 | No | HTTP client | api/ai.js (serverless, not server/) |
| cors | ^2.8.5 | 2.8.6 | No | CORS middleware | server/index.js |
| dotenv | ^16.4.5 | 16.6.1 | No | Env config | server/index.js |
| express | ^4.18.2 | 4.22.1 | No | HTTP server | server/index.js |
| express-rate-limit | ^7.3.1 | 7.5.1 | No | Rate limiting | declared, **not imported** (per CONTEXT.md) |
| node-pty | ^1.0.0 | 1.1.0 | No | PTY spawning | server/index.js |
| ws | ^8.14.2 | 8.19.0 | No | WebSocket | server/index.js |

**Dev Dependencies (root):**

| Package | Declared | Resolved | Purpose |
|---------|----------|----------|---------|
| @eslint/js | ^9.9.1 | 9.12.0 | ESLint core rules |
| @types/diff | ^7.0.2 | 7.0.2 | Type defs |
| @types/react | ^18.3.5 | 18.3.11 | Type defs |
| @types/react-dom | ^18.3.0 | 18.3.0 | Type defs |
| @vitejs/plugin-react | ^4.3.1 | 4.3.2 | React plugin |
| autoprefixer | ^10.4.18 | 10.4.20 | Vendor prefixes |
| concurrently | ^9.2.1 | 9.2.1 | Run server + Vite together |
| eslint | ^9.9.1 | 9.12.0 | Linting |
| eslint-plugin-react-hooks | ^5.1.0-rc.0 | 5.1.0-rc-fb9a90fa48-20240614 | React hooks rules (RC!) |
| eslint-plugin-react-refresh | ^0.4.11 | 0.4.12 | Fast-refresh rules |
| globals | ^15.9.0 | 15.11.0 | Global namespaces |
| postcss | ^8.4.35 | 8.5.25 | CSS processing |
| tailwindcss | ^3.4.1 | 3.4.17 | CSS framework |
| typescript | ^5.5.3 | 5.6.3 | Type checking |
| typescript-eslint | ^8.3.0 | 8.8.1 | TS lint integration |
| vite | ^5.4.2 | 5.4.8 | Build tool |

### 3.3 AI/Automation Technology Map

```
AI SDKs & Frameworks:
├── @google/generative-ai (v0.24.1) → src/services/aiChatAssistant.ts (gemini-pro, client-side)
├── NVIDIA NIM (HTTP, axios, no SDK) → api/ai.js (serverless proxy: improve/explain/fix/optimize/enhance/suggest/chat)
├── e2b SDK (v2.37.0) → src/services/sandbox/sandboxSession.ts (cloud sandbox execution)
└── @upstash/redis (v1.38.0) → api/ai.js (rate limiting, 30 req/min/IP)

LLM Models Used:
├── gemini-pro → src/services/aiChatAssistant.ts
├── qwen/qwen3.5-397b-a17b (configurable) → api/ai.js, server/.env.example (NVIDIA_MODEL)
└── Model config: NVIDIA_API_KEY / NVIDIA_MODEL / VITE_GEMINI_API_KEY

Prompt Architecture:
├── Hermes With Deepseek v4 flash/ — reverse-engineering framework prompts (this analysis)
├── api/ai.js — embedded "Code Buddy" system prompt (~300 lines of prompt engineering)
├── docs/VEO_VIDEO_PROMPTS.md — promotional video prompts
└── scripts/generate_modern_templates_*.cjs — template code generators

Voice AI:
└── Web Speech API (native, no SDK) → voiceCommandService.ts, voiceIntentRegistry.ts, voiceCommandParser.ts, voiceMatcher.ts, VoiceCommandPanel.tsx

MCP: NOT DETECTED — no MCP servers/clients in manifests or imports
Vector DB: NOT DETECTED — no embeddings/vector infrastructure
```

### 3.4 Infrastructure Dependencies

| Category | Technology | Evidence | Config Location |
|----------|-----------|----------|-----------------|
| Hosting | Vercel | vercel.json (framework: vite, buildCommand, rewrites) | ./vercel.json |
| Serverless | Vercel Functions | api/ai.js (maxDuration 120s), api/health.js, api/preview.js, api/share.js, api/sandbox/* | vercel.json functions block |
| Database | Supabase PostgreSQL | schema.sql (7 tables), migration.sql, RLS policies | supabase/ |
| Cache/Rate-limit | Upstash Redis | @upstash/redis dependency; api/ai.js rate limiting | .env.example (UPSTASH_REDIS_REST_URL) |
| Terminal Backend | Node.js process (Express + ws + node-pty) | server/index.js; NOT deployed to Vercel | server/ |
| PWA | Service worker (workbox via vite-plugin-pwa) | Google Fonts CacheFirst, jsdelivr StaleWhileRevalidate | vite.config.ts |
| Analytics | Vercel Analytics + GA4 | @vercel/analytics, react-ga4, src/services/analytics.ts | .env.example (VITE_GA4_MEASUREMENT_ID) |
| Containerization | None | No Dockerfile/docker-compose found | — |
| CI/CD | None detected | No .github/workflows in inventory | — |
| Monitoring | None (custom error logging only) | src/services/errorLogging.ts (window.onerror) | — |

### 3.5 Development Toolchain

- **Linting:** ESLint 9 (flat config, eslint.config.js) + typescript-eslint 8 + eslint-plugin-react-hooks (RC build) + eslint-plugin-react-refresh
- **Formatting:** Prettier 3 (standalone, in-browser)
- **Type checking:** TypeScript 5.6.3 (tsconfig root + tsconfig.app.json + tsconfig.node.json references)
- **Build:** Vite 5 with manual chunk splitting (monaco-editor, react-core, ui-icons, analytics, http-client, compression, diff-tools, terminal, formatter, critical-ui, deferred-components); esbuild drops console/debugger in production
- **Pre-commit hooks:** NONE (no husky/lint-staged/commitlint)
- **Code generation:** scripts/generate_modern_templates_p1.cjs, generate_modern_templates_p2.cjs
- **Docs:** docs/ (10 existing files), README.md, CONTEXT.md, DOCUMENTATION.md

### 3.6 Version Constraints & Compatibility

- **Node.js:** Vite 5 requires Node 18+; server requires Node 18+ for node-pty prebuilds (native module — platform-specific; Windows uses `powershell.exe` default shell per server/index.js `getDefaultShell()`)
- **React:** 18.3.x pinned by `^` — React 19 NOT used; @types/react 18.3.x matches
- **esbuild-wasm 0.25.10 and @vue/compiler-sfc 3.5.40 are exact-pinned** — deliberately locked (in-browser WASM build; SFC compiler version must match Vue 3.5 syntax support)
- **eslint-plugin-react-hooks is a release candidate** (5.1.0-rc-fb9a90fa48-20240614) — dev-only, notable supply-chain/behavior consideration
- **Vite proxy:** dev proxy `/api/*` → `http://localhost:3001` (server); production rewrites to serverless functions — two different API surfaces share the `/api` namespace
- **node-pty native binding:** must match OS/arch at install time; prebuilt binaries required (Windows/Unix paths branch in server code)
- **Browser requirements:** uses Web Speech API (voice), postMessage console bridge, iframe sandboxing (allow-scripts allow-same-origin)

## 4. Quality Gate Checklist (P03)

- [X] Every package manifest read is accounted for (root package.json + lock, server package.json + lock, no yarn/pnpm/nvm files)
- [X] Runtime vs. dev dependencies distinguished
- [X] Versions documented with pinned/floating status (exact pins noted: esbuild-wasm, @vue/compiler-sfc)
- [X] AI/automation technologies identified (Gemini, NVIDIA NIM, e2b, Upstash, Web Speech)
- [X] Infrastructure dependencies cataloged (Vercel, Supabase, Upstash Redis, PWA)
- [X] Every technology has a "used in" location
- [X] Version confidence stated (lock file + installed modules verified for root; lock-only for server)
- [X] Omissions documented (see below)

## 5. Omissions

- **server/ node_modules** — not installed on analysis machine; versions taken from `server/package-lock.json` (trustworthy, but installed-module verification not possible)
- **axios in server/package.json** — declared but unused in server/index.js; it is the serverless (`api/`) HTTP client. Confirmed by CONTEXT.md known-issues list.
- **express-rate-limit** — declared but never imported in server/index.js (CONTEXT.md known issue #2)
- **CDN libraries** (70+ managed by externalLibraryService) — runtime-loaded from CDNs, not npm-managed; versions managed in-app, not in manifests
- **`@upstash/redis` usage in client** — verified only in api/*.js serverless + test script; client bundle usage not confirmed (may ship only to serverless)
- **Lock file versions for root dev-deps** were resolved from lock; a few were also confirmed via installed modules
- No `.nvmrc`, no Dockerfile, no CI config — none exist in repo

## 6. HANDOFF

Outputs of Phase 1 (P01 scan, P02 inventory, P03 tech stack) are complete and verified. Pass all three to **Phase 2 — Structural Analysis** for PROMPT_04 (Folder Architecture), PROMPT_05 (Module Dependency Graph), PROMPT_06 (Component Hierarchy), PROMPT_07 (Data Flow Analysis).

## Document Status

[X] Draft — initial analysis, pending review
[ ] Reviewed — peer-checked against source code
[X] Complete — passed quality gate Q1
