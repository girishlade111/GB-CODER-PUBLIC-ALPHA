# GB CODER — ENTERPRISE CODEBASE & ARCHITECTURE AUDIT

**Repository:** `GB-CODER-PUBLIC-ALPHA`
**Branch:** `fix/project-first-navigation-editor-startup` (HEAD `38c3d1e`)
**Auditor role:** Principal Software Architect / Staff Frontend Engineer / Lead QA Auditor
**Date:** 2026-10-13
**Method:** Full static read of all 258 TS/TSX source files (120,369 LOC / 5.2 MB), 54 template modules, 21 API handlers, 65 build scripts, plus live execution of `tsc --noEmit`, `npm run build`, and `npm run verify:bundle`. All findings below were verified against the actual source, not inferred. Claims of highest severity were independently re-verified by the lead auditor.

---

## TABLE OF CONTENTS

0. [Executive Summary](#0-executive-summary)
1. [Repository Structure, Build System & Routing](#1-repository-structure-build-system--routing)
2. [Complete Feature Inventory & Usage Guide](#2-complete-feature-inventory--usage-guide)
3. [Dashboard & IndexedDB Persistence Engine](#3-dashboard--indexeddb-persistence-engine)
4. [Dual IDE Modes & Inter-IDE Switching](#4-dual-ide-modes--inter-ide-switching)
5. [AI Features & Voice Command System](#5-ai-features--voice-command-system)
6. [Feature Health Matrix](#6-feature-health-matrix)
7. [Performance, Memory & Security Audit](#7-performance-memory--security-audit)
8. [Enterprise-Grade Gap Analysis & Upgrade Roadmap](#8-enterprise-grade-gap-analysis--upgrade-roadmap)
9. [Appendices — Verified Command Output](#9-appendices--verified-command-output)

---

## 0. EXECUTIVE SUMMARY

### 0.1 What GB Coder actually is

GB Coder is a **client-side web IDE** whose entire runtime runs in the browser. It is unusually ambitious and, in several places, unusually well engineered. The verified architecture is:

| Pillar | Reality | Verdict |
|---|---|---|
| Marketing/SEO site (Astro) | **2 pages, 192 words of body copy**, labelled "Phase 1 POC". No canonical, no OG/Twitter, no JSON-LD, no sitemap at deploy root. | ❌ Stub |
| Core Vite app | 4,721-line `App.tsx`, 258 source files, 120,369 LOC. Real, large, functioning. | ⚠️ Working but monolithic |
| IndexedDB persistence | Real DB, 2 stores, working CRUD. **No migration path**, no `versionchange` handler, no `navigator.storage.persist()`. | ⚠️ Fragile |
| Dual IDE | Both modes real. Static IDE (esbuild-wasm + `@vue/compiler-sfc`), Advanced IDE (`@webcontainer/api` 1.6.4). | ✅ Real |
| AI features | 5 providers, real Gemini/vision/inline-completion. One key **hardcoded into the public bundle** against a **retired model ID**. | ⚠️ Broken + insecure |
| Voice commands | The **best-engineered subsystem in the repo** — 28 intents, fuzzy matcher, confidence bands, full typed-command fallback for Firefox/Safari. | ✅ Excellent |
| PWA | 3 service workers, 17.3 MB precache. The single largest asset (11.65 MB) is **excluded**. | ⚠️ Broken offline |
| Testing | **Zero test files. Zero test runner. No `test` script. No CI gate.** ~30 manual audit scripts. | ❌ Absent |
| Type safety | `strict: true` — but **`tsc --noEmit` fails with 17 errors**, including a live `ReferenceError` in production code. | ❌ Failing |
| CI | One workflow: a third-party AI PR reviewer. No build, no lint, no typecheck, no tests. | ❌ Absent |

### 0.2 The five findings that matter most

**1. 🔴 The production TypeScript build FAILS — 17 errors, including a live runtime crash.**
`npm run build` succeeds because Vite uses esbuild, which **strips types without checking them**. The compiler was never run. Two errors are genuine runtime defects:
- `src/components/PreviewPanel.tsx:634,638` — `toast.error(...)` is called but **`toast` is never imported**. Clicking "Open in New Tab" throws `ReferenceError: toast is not defined`. It is thrown *inside* the `try`, caught by the `catch`, which calls `toast.error` **again** at line 638 — this time uncaught. Verified present in `HEAD`.
- `src/services/backup/backupRestoreService.ts:251,253` — `EditorStyle` / `ProjectType` used as bare identifiers with no import (type-only, so erased; but it means restore metadata is validated by string comparison with zero type checking).

**2. 🔴 `VITE_GEMINI_API_KEY` is compiled into the public JS bundle — and the AI Chat feature targets a retired model.**
`src/services/aiChatAssistant.ts:30` reads the key at build time; `:38` targets `model: 'gemini-pro'`, which Google retired. The feature is simultaneously a permanent public credential leak and non-functional. Verified.

**3. 🔴 `/api/ai` has `Access-Control-Allow-Origin: *`, an unauthenticated `OPTIONS` preflight, and no global rate limit.**
`api/ai.js:715-719`. Any website can drive the operator's paid LLM key through a victim's browser, up to 30 req/min per victim IP, at `maxTokens: 16384`, two upstream calls per request. The limiter is an **in-memory `Map` that resets on every serverless cold start**.

**4. 🔴 "CodeRabbit" is not CodeRabbit.** It is a Gemini Flash call with a fabricated identity, a fabricated health score, and an `applyFix` fallback that replaces code by **model-hallucinated line number** — silently corrupting files. `src/services/codeRabbitService.ts:240-241,250,127-128,315-317`. Verified.

**5. 🔴 The app systematically tells the user a save/operation succeeded when it did not.**
- `deleteProject` resolves `void` on failure (`projectDatabase.ts:508-512`); `App.tsx:2407` **always** toasts `Deleted "..."`. Verified.
- `BackupRestoreModal.tsx:557` renders a **green "Restore Completed Successfully!"** card whenever `restoreResult` is non-null — it never reads `result.success`. A 0-project, 0-file, fully-failed restore shows a green success card. Verified.
- `ErrorBoundary.tsx:109` unconditionally renders **"Your work is safe — we've auto-saved your progress."** The "emergency save" at `:31-40` reads `gbcoder_active_project_id` — **a key that exists nowhere else in the codebase** (the real one is `gb-coder-active-project-id`, `projectDatabase.ts:112`) — and discards the result via `void`. It then copies `gbcoder_snapshots` (the *manual snapshot* list), not the live buffer. Verified.

### 0.3 Systemic themes

**A. Confidence without a compiler.** The codebase contains **zero `TODO`/`FIXME`/`HACK`** markers (verified by exact-case repo-wide grep). Instead it carries long, confident, explanatory prose comments — often correctly documenting *why* something works. This produces a codebase that reads as finished while `tsc` reports 17 errors and at least 16 components are entirely unreachable.

**B. Save honesty is broken at every layer.** This is the single most pervasive defect class. The IndexedDB layer, the localStorage mirror, the delete path, the restore path, the export path, and the crash boundary each independently report success on failure.

**C. No test gate of any kind.** 0 test files. 0 test runner installed. No `test` script. The one CI workflow is an AI reviewer. Every one of the ~30 `audit:*` scripts is manual and opt-in. The build's own 7 safety gates (`scripts/build-unified.mjs:134-241`) **never run in CI**.

**D. Resource lifecycle is unmanaged.** `container.teardown()` is **never called anywhere in `src/`** (verified: 6 `teardown` hits repo-wide, all `teardownRecognition` in voice, one comment in copilot; **0** in `src/services/webcontainer/`). A `jsh` PTY and a Vite dev server survive every unmount. The E2B sandbox's 2.5 s poll loop has no unmount cleanup and keeps billing.

**E. Dead code is extensive and load-bearing.** 16 components have **zero external references** (verified by recursive grep). `SandboxPanel` — a full E2B client UI — is never mounted. `credentialStore.ts`, the only AES-GCM-encrypted store in the repo, is **never called by anything**. A complete legacy `projectStore` + `useProject` subsystem still writes to localStorage on every cold start.

### 0.4 Headline metrics (all measured, not estimated)

| Metric | Value |
|---|---|
| Source files (TS/TSX) | 258 |
| Source LOC | 120,369 |
| Largest file | `src/App.tsx` — **5,155 lines** |
| `App.tsx` state hooks | **58 `useState`**, 29 `useEffect`, 56 `useCallback`, 14 `useRef` |
| Dead code | **~13,966 lines across 37 files** (see §2.6) |
| Initial JS payload | 588.6 kB raw / **186.5 kB gzip** (4 chunks) |
| Initial CSS | 101.1 kB / 17.5 kB gzip |
| Total `dist/app` | **28.9 MB** across 65 JS chunks |
| PWA precache | 74 entries / **17.3 MB** |
| Largest single asset | `esbuild-*.wasm` **11.65 MB** — *excluded* from precache |
| Largest lazy chunk | `TemplateSelectorModal` **2,678 kB / 606 kB gzip** |
| Vercel functions | **12 / 12** (Hobby limit — zero headroom) |
| Dead components (0 refs) | 16 |
| Unused service modules | ≥6 (`credentialStore`, `securityService`, `autoCompleteService`, `projectStore`, `sandboxTerminal`, `useCodeWriter`) |
| Templates | 54 template modules |
| `tsc --noEmit` | **FAILS — 17 errors** |
| `npm run build` | Succeeds (types unchecked) |
| `npm run lint` | Succeeds (0 gates; `.js` unlinted; `exhaustive-deps` = warn) |
| Unit test files | **0** |
| Test runners installed | **0** (no vitest, no jest) |
| `npm test` script | **Does not exist** |
| CI workflows | 1 (AI PR reviewer only) |

---

## 1. REPOSITORY STRUCTURE, BUILD SYSTEM & ROUTING

### 1.1 The monorepo boundary

`package.json:4-6` declares `"workspaces": ["apps/*"]`. There is exactly **one** workspace:

~~~
apps/
└── marketing/          ← Astro 5.4.2, isolated, own package-lock
    ├── astro.config.mjs
    ├── package.json          (single dependency: astro)
    ├── package-lock.json
    └── src/pages/
        ├── index.astro       (420 lines)
        └── 404.astro         (79 lines)
~~~

The React application lives entirely at the repo root in `src/`. The backend is split across three roots with **three separate `package.json` files that each declare only `{"type":"commonjs"}`**:

~~~
api/        21 files → 12 deployable Vercel functions
dev-api/     3 files → local-only handlers (correctly excluded from deploy)
server/      1 file  → standalone Express + node-pty PTY (dev only)
~~~

### 1.2 Complete source tree

~~~
src/
├── App.tsx                     4,721  ← routing ladder + all app state (god component)
├── AppWrapper.tsx                 14  ← <App/> + <Analytics/>
├── main.tsx                       17  ← StrictMode + ErrorBoundary + initLaminar()
├── index.css                                  ← Tailwind + design tokens (no cross-origin @import)
├── components/                  ~70 .tsx
│   ├── ui/                      (10 primitives: Tooltip, CopyToast, FormatToast, Loader×4, SaveStatusIndicator)
│   ├── pages/                   (7 legal/marketing pages + LegalPageLayout)
│   ├── projects/                (ProjectDashboard, NewProjectModal, BackupRestoreModal)
│   ├── vscode/                  (VSCodeMode 2,383 · FileTreeView 924 · ActivityBar · CodeAssistPanel · IDESettingsModal · StackBlitzStartupLoader)
│   ├── Console/                 (TerminalTab 901 · ValidatorTab · PreviewRunTab · ConsoleValueTree · ConsoleTab)
│   ├── sandbox/                 (SandboxPanel — NEVER MOUNTED)
│   ├── history/  preview/       (CodeHistoryPage · LivePreviewPopoutPage)
│   └── 40+ feature components
├── hooks/                       (20 hooks)
├── services/                    (~75 services)
│   ├── projects/projectDatabase.ts     ← the real persistence engine
│   ├── projectStore.ts                 ← DEAD legacy localStorage store
│   ├── backup/                         (backupTypes/Export/Restore/Crypto)
│   ├── webcontainer/                   (webcontainerService 1,137 · support · perf)
│   ├── preview/ ai/ import/ npm/ sandbox/
│   ├── templates/                      (54 modules across 11 categories)
│   └── 40+ domain services
├── types/                       (8 modules)
└── utils/                       (13 modules incl. appRoutes, monacoWorkers, safeMarkup)
~~~

### 1.3 Routing — no router library, and this is a real architectural decision

`src/utils/appRoutes.ts:1-11` documents the choice explicitly:

> *"There is no router library in this app: the top level is a ladder of early returns in `App`…"*

Routes are `window.location.pathname` string comparisons plus `history.pushState`/`replaceState`.

| Route | Constant | Behaviour |
|---|---|---|
| `/app`, `/app/` | `EDITOR_ROUTE` / `PROJECTS_ROUTE` | **Projects Dashboard** — canonical entry |
| `/app/projects` | `PROJECTS_ROUTE` | Same dashboard |
| `/app/editor` | `STATIC_EDITOR_ROUTE` | Static IDE. **Requires an explicitly selected project**; falls back to dashboard |
| `/app/ide` | `VSCODE_ROUTE` | Advanced IDE (WebContainer) |
| `/ide` | `LEGACY_VSCODE_ROUTE` | Backwards-compat alias |
| `/preview-popout` | `PREVIEW_POPOUT_ROUTE` | Detached live-preview window |
| `/preview/:shortId` | *(no constant)* | Share-link preview page |
| `/mpreview/:sessionId` | *(no constant)* | QR mobile preview |
| `/` | — | Astro marketing page |

**Well-implemented detail:** `appRoutes.ts:150-168` — `navigateTo` is a no-op when already at the path, and `navigateReplace` exists specifically for *corrections the router makes itself*, so Back/Forward never stacks duplicate entries the user must press through twice. The `popstate` handler (`App.tsx:2177-2244`) resolves every branch toward "URL is truth" without pushing.

**Real defects in routing:**
- `/preview/:shortId` and `/mpreview/:sessionId` have **no exported route constant** — `App.tsx:1069,1080` hand-parses them with `startsWith` + `split`. Fragile.
- `App.tsx:1107-1116` reads a `?fork=` query param in a mount effect with `// eslint-disable-next-line react-hooks/exhaustive-deps` suppressing the dependency array — the suppression is necessary and correct, but it means fork-import logic is untestable in isolation.
- There is no 404 handling inside the SPA. `vercel.json:22-24` rewrites `/app/(.*)` to `/app/index.html`, so any mistyped `/app/xyz` renders the app and then hits the `navigateReplace(EDITOR_ROUTE)` correction at `App.tsx:2506-2510`.

### 1.4 The unified build pipeline

`npm run build` → `scripts/build-unified.mjs` (288 lines, 6 stages, ~96 s):

1. `:41-44` `rm -rf dist/ dist-staging/`, recreate.
2. `:48-60` Auto-`npm install` for `apps/marketing` if `node_modules` missing (failure only **warns**, `:58`).
3. `:63-67` `astro build` → `apps/marketing/dist`. **Hard-fails** if `index.html` missing (`:73-76`).
4. `:81-90` `npx vite build` with `VITE_BASE_PATH='/app/'`, `VITE_OUT_DIR=dist-staging/ide`. **Hard-fails** if missing (`:96-99`).
5. **Assembly** `:105-129`:
   - `apps/marketing/dist/*` → `dist/` (**root** = Astro)
   - `dist-staging/ide/*` → `dist/app/` (**/app** = React SPA)
   - `public/sw.js` → `dist/sw.js`
   - `public/favicon.ico` → `dist/favicon.ico` **only if it exists** ← it does not exist there
   - `public/robots.txt` → `dist/robots.txt` **only if it exists**
   - ⚠️ **`public/sitemap.xml` is never copied**
6. **7 safety gates** `:134-241` — verified passing on a clean build:
   ~~~
   PASS: Astro root index.html verified with Start Coding CTA to /app
   PASS: dist/index.html is isolated from IDE runtime dependencies
   PASS: Vite app/index.html verified with React root and /app/assets/ paths
   PASS: All 6 initial Vite assets exist in dist/app/
   PASS: Monaco worker scripts verified in dist/app/assets/
   PASS: Scoped Service Worker exists at dist/app/sw.js
   PASS: PWA manifest correctly scoped to /app/
   PASS: Root Migration Service Worker verified at dist/sw.js
   PASS: No environment or secret files leaked into dist/
   ✅ UNIFIED BUILD SUCCEEDED DETERMINISTICALLY
   ~~~

**Build pipeline defects (all independently verified against a live build):**

| # | Defect | Evidence |
|---|---|---|
| B1 | **`sitemap.xml` never reaches the deploy root**, yet `public/robots.txt:40-41` advertises `Sitemap: https://gbcoder.com/sitemap.xml` and `https://code.ladestack.in/sitemap.xml`. Both **404 in production**. | `build-unified.mjs:121-129` copies favicon + robots only. Live check: `dist/sitemap.xml` = **MISSING** |
| B2 | **`favicon.ico` never reaches `dist/`.** The guard reads `public/favicon.ico`; the file is at **repo root**. `index.astro:19` links `/favicon.ico`; `vite.config.ts:247,259` lists it in `includeAssets`. | `build-unified.mjs:122-125`. Live check: `dist/favicon.ico` = **MISSING** |
| B3 | **Gate 7 is vacuous** — it asserts `dist/.env` absent, but `.env` was never copied in. | `build-unified.mjs:235-241` |
| B4 | **`dist-staging/` is not cleaned on success** — left on disk after build. | Observed post-build |
| B5 | **Astro install failure only warns.** A marketing build that silently half-works still yields a "successful" unified build. | `build-unified.mjs:58` |
| B6 | **Two conflicting web manifests ship**: `/app/manifest.webmanifest` (`scope:/app/`, correct) and a stale `public/manifest.json` with `start_url:"/"`, `theme_color:"#3b82f6"`, which Vite also copies to `/app/manifest.json`. | `public/manifest.json:5,8`; `dist/app/listing` |
| B7 | **`/app/robots.txt` and `/app/sitemap.xml` are duplicated inside the SPA scope** by Vite's default `publicDir` copy. | `dist/app/listing` |

### 1.5 TypeScript configuration

`tsconfig.app.json` (24 lines) — genuinely strict:

| Option | Value | Line |
|---|---|---|
| `strict` | ✅ `true` | `:18` |
| `noUnusedLocals` | ✅ `true` | `:19` |
| `noUnusedParameters` | ✅ `true` | `:20` |
| `noFallthroughCasesInSwitch` | ✅ `true` | `:21` |
| `isolatedModules` | ✅ `true` | `:12` |
| `noEmit` | ✅ `true` | `:14` |
| `skipLibCheck` | ⚠️ `true` | `:7` |
| `target` | ⚠️ `ES2020` — **mismatched with Vite's `esnext`** (`vite.config.ts:340`) | `:3` |
| path aliases | ❌ none — no `baseUrl`, no `paths`, no `vite-tsconfig-paths` | — |
| `noUncheckedIndexedAccess` | ❌ absent | — |

**Coverage gaps:** `tsconfig.app.json:23` sets `"include": ["src"]`. Therefore **`api/`, `dev-api/`, `server/`, `scripts/`, `apps/marketing/`, `eslint.config.js`, `tailwind.config.js` are all completely outside TypeScript.** No `checkJs`, no `// @ts-check`, no `@types/express`/`@types/node` in `devDependencies`. Every backend handler audited in §7 is **untyped, unchecked JavaScript**.

### 1.6 ESLint — configured but non-blocking

`eslint.config.js` is 34 lines:

- `:11` `files: ['**/*.{ts,tsx}']` — **`.js` files are never linted.** This excludes `api/*.js` (21 files), `dev-api/*.js`, `server/index.js`, and all 65 `scripts/*.mjs`. **The entire backend has zero lint coverage.**
- `:21` `...reactHooks.configs.recommended.rules` → `rules-of-hooks: error`, **`exhaustive-deps: warn`**. Dependency violations **do not fail the build**.
- `:22-25` `react-refresh/only-export-components: warn`
- `:26` `@typescript-eslint/no-explicit-any: **warn**`
- `:27-30` `no-unused-vars: ['warn', …]`
- `package.json:19` `"lint": "eslint ."` — **no `--max-warnings`**. `npm run lint` exits 0 on a warning-saturated tree.
- Uses `tseslint.configs.recommended`, **not** `recommended-type-checked` → `no-floating-promises`, `no-misused-promises`, `await-thenable` are all **off**.

**There is no `no-console` rule**, despite `vite.config.ts:454` stripping `console` in production — meaning `console.error` used as the *sole* error handler in a dozen places compiles fine and is then **silently removed from production builds**.

### 1.7 COOP / COEP — the WebContainer prerequisite

`SharedArrayBuffer` (required by `@webcontainer/api`) demands a cross-origin-isolated document. The headers are configured in three places:

| Environment | COOP | COEP | Source |
|---|---|---|---|
| Vite dev | `same-origin` | `require-corp` | `vite.config.ts:471-472` |
| Vite preview | `same-origin` | `require-corp` | `vite.config.ts:492-493` |
| Vercel `/app/(.*)` | `same-origin` | `require-corp` | `vercel.json:31-36` |
| Vercel `/app` | `same-origin` | `require-corp` | `vercel.json:44-48` |
| Vercel `/ide` | `same-origin` | `require-corp` | `vercel.json:57-61` |
| Vercel `/preview-popout` | `same-origin` | `require-corp` | `vercel.json:70-74` |
| **Vercel `/preview/(.*)`** | ❌ **NONE** | ❌ **NONE** | rewritten at `vercel.json:18` |
| **Vercel `/mpreview/(.*)`** | ❌ **NONE** | ❌ **NONE** | rewritten at `vercel.json:19` |

**🔴 CRITICAL DEPLOYMENT GAP.** `vercel.json:18-19` rewrites `/preview/(.*)` and `/mpreview/(.*)` to `/app/index.html`, but **no `headers` rule covers either path.** Whether Vercel applies the destination's headers or the request's headers to a rewritten response is implementation-dependent; the config contains **no entry that unambiguously covers them**. If request-path matching wins, a user opening any shared link lands in the IDE with `window.crossOriginIsolated === false` and WebContainer permanently dead.

`scripts/verify-deploy-config.mjs:255-262` only asserts coverage of `/ide`. **`/preview/*`, `/mpreview/*`, and `/app/assets/*` are never checked.**

**Chilling corroboration:** `scripts/coep-resource-tests.mjs:55-64` test 01 asserts `window.crossOriginIsolated === true` at `${BASE_URL}/` — a URL that, against the *real* `vercel.json`, has **no isolation headers at all**. The test passes only because `scripts/preview-combined.mjs:67-68` sets COOP/COEP **globally on every response**, which is *stricter than production*. **The header test suite validates a configuration that does not exist in production.**

### 1.8 Code-splitting and bundle strategy

`vite.config.ts:344-446` `manualChunks` carries extensive, well-reasoned commentary — this is above-average engineering:

- `monaco-editor`, `typescript-compiler`, `vue-compiler`, `react-core`, `ui-icons`, `analytics`, `http-client`, `diff-tools`, `terminal`, `formatter` are named buckets.
- `esbuild-wasm` and `jszip` are **deliberately left unbucketed**, with a documented reason: naming a chunk for a CommonJS dependency parks Rollup's interop helper there, and since React is also CJS and needs the same helper, that creates a **static edge from `react-core` into the JSZip chunk** — pulling 95 kB of zip code into first paint despite every `import('jszip')` being dynamic.
- `qrcode.react` is excluded *before* the generic `react` substring test, because its package name contains "react".
- Two previous manual buckets (`critical-ui`, `deferred-components`) were **removed** with a documented explanation that `manualChunks` decides *which chunk a module lands in*, not whether that chunk is eager.

**The result is genuinely good.** `npm run verify:bundle` (exit 0):

~~~
Initial JS payload (entry + modulepreload)

  index-18aYjfO-.js              336.9 kB  gzip 102.9 kB
  react-core-34veshE3.js         220.2 kB  gzip  72.1 kB
  diff-tools-Cl_hE33I.js          17.5 kB  gzip   6.6 kB
  monaco-editor-Bhc-u9rq.js       14.1 kB  gzip   4.8 kB

  TOTAL JS                       588.6 kB  gzip 186.5 kB
  TOTAL CSS                      101.1 kB  gzip  17.5 kB

Verified absent from the critical path: JSZip, xterm terminal, project detection,
import engine, prettier formatter, esbuild-wasm, TypeScript compiler, qrcode.react,
E2B sandbox client, sandbox proxy calls, VS Code editor mode
~~~

186.5 kB gzip initial JS for an IDE of this scope is **excellent**. Two caveats:

1. **`diff-tools` (17.5 kB) is still on the critical path** despite `react-diff-viewer-continued` being used only by the lazily-loaded `AiDiffModal`. A static edge is pulling it in.
2. **The largest lazy chunk is `TemplateSelectorModal` at 2,678 kB (606 kB gzip)** — because it statically imports all 54 template modules. This is lazy (acceptable) but 2.6 MB for a modal is excessive; templates should be per-category dynamic imports.

### 1.9 PWA configuration

`vite.config.ts:245-318` `VitePWA({ registerType: 'autoUpdate' })`:

- **Precache is 100 % same-origin and relative** — verified by inspecting the built `dist/app/sw.js`: entries are `index.html`, `assets/…`, `tghjkl.jpeg`, `robots.txt`, `manifest.webmanifest`. **Zero cross-origin entries ⇒ precache cannot break COEP.** This is correct and deliberate.
- Runtime caching (4 rules): `fonts.googleapis.com` CacheFirst 1 y; `cdn.jsdelivr.net` SWR 7 d; `unpkg.com` SWR 7 d; images CacheFirst 30 d.
- ⚠️ The image rule `/\.(?:png|jpg|jpeg|svg|gif|webp)$/` (`vite.config.ts:306`) has **no host anchor**, so it matches any origin. Harmless (a COEP-blocked response never reaches the SW) but overly broad and misleading.
- ⚠️ `maximumFileSizeToCacheInBytes: 8 MB` (`:267`) vs. an **11.65 MB** `esbuild-*.wasm`.

**Three service workers ship:**

| Artifact | Behaviour |
|---|---|
| `dist/sw.js` (root) | Pure **migration** worker. `activate` deletes non-`/app` caches, force-navigates clients, then **`self.registration.unregister()`** (`:50-52`). Fetch handler is a no-op. Self-destructs on first activation. |
| `dist/app/sw.js` | The real workbox SW. `NavigationRoute(createHandlerBoundToURL("index.html"))` registered. |
| inline guard in `index.astro:28-49` | Client-side `getRegistrations()` → unregisters any `/`-scoped SW. |

**🔴 PWA offline is broken for the feature that matters.** The SW scope is `/app/`. A service worker **never receives requests for URLs outside its scope.** Therefore `/preview/:id`, `/mpreview/:id`, `/ide`, and `/preview-popout` — all of which Vercel rewrites to `/app/index.html` — are **never SW-controlled at all**. Offline navigation to any of them fails.

**And the precache budget is spent on the wrong things:**

| Asset | Size | Precached? |
|---|---|---|
| `esbuild-CIppzZMW.wasm` | **11.65 MB** | ❌ **NO** — exceeds the 8 MB cap. Only the JS wrapper `esbuild-CU5JIUUy.js` is precached. |
| `ts.worker-Df1lW6KJ.js` | 5.87 MB | ✅ YES |
| `typescript-compiler-*.js` | 3.44 MB | ✅ YES |
| `TemplateSelectorModal-*.js` | 2.68 MB | ✅ YES |
| `css.worker-*.js` | 985 kB | ✅ YES |

**Net effect: 17.3 MB is precached, but React and Vue multi-file bundling fails offline** because `esbuild-wasm` cannot fetch its own binary. Offline support is therefore installability branding, not engineering — compounded by the fact that WebContainers, `npm install`, and AI calls all require the network anyway.

### 1.10 Tailwind & CSS

`tailwind.config.js` is 15,422 bytes — unusually large for a Tailwind config, carrying a custom design system. `src/index.css` was verified to contain **zero cross-origin `@import`** — fonts are wired via `<link>` in HTML, not CSS.

**⚠️ The single highest-risk COEP dependency:** `index.html:46-48` loads

~~~html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond...&family=Inter...&family=JetBrains+Mono..."
      rel="stylesheet" />
~~~

with **no `crossorigin` attribute**. Under `COEP: require-corp` this is a no-CORS subresource that depends entirely on Google sending `cross-origin-resource-policy: cross-origin` — which it does today. **A single third-party header flip, or a Google Fonts outage, removes all page typography and makes the IDE unusable, with no local fallback.** This should be self-hosted.

---

## 2. COMPLETE FEATURE INVENTORY & USAGE GUIDE

### 2.1 How to read this section

Every feature below was verified by recursive import-graph grep. **Status** is:
- **LIVE** — rendered and wired to real logic
- **PARTIAL** — reachable, happy path works, edge cases leak
- **STUB** — rendered but does nothing meaningful
- **DEAD** — zero external references; shipped in the bundle, unreachable

### 2.2 Component wiring table (root + ui + pages)

| Component | Rendered at | Status | Purpose |
|---|---|---|---|
| `NavigationBar` | `App.tsx` (eager) | LIVE | Top bar, app logo, view switches |
| `AppSidebar` | `App.tsx` (eager) | LIVE | Icon rail opening every panel |
| `EditorPanel` | `App.tsx` (eager) | PARTIAL | Static IDE host; hosts Monaco |
| `TabbedRightPanel` | `App.tsx` (eager) | LIVE | Console / Preview / Validation tabs |
| `Footer` | `App.tsx` (eager) | LIVE | Footer |
| `Tooltip` | `App.tsx` (eager) | LIVE | Tooltip primitive |
| `DropZoneOverlay` | `App.tsx` (eager) | LIVE | Drag-and-drop project import |
| `StatusBar` | `App.tsx` (eager) | PARTIAL | Status; "Saved" badge is decoupled from real persistence |
| `SelectionToolbar` / `SelectionSidebar` | `App.tsx` | LIVE | AI-on-selection |
| `SelectionResultPanel` | — | **DEAD** | 0 refs. Its "Suggested Code" toggle is a `<pre>` show/hide, **no actual diff** |
| `SessionRecoveryModal` | `App.tsx` | LIVE | Offers autosave recovery |
| `SnapshotManagerModal` | `App.tsx` | LIVE | Manual snapshots |
| `projects/ProjectDashboard` | `App.tsx` (eager, deliberate) | PARTIAL | Entry screen. **No rename. No duplicate.** Delete btn `opacity-0` until hover → invisible on touch |
| `projects/NewProjectModal` | `App.tsx` | LIVE | Template chooser + name |
| `projects/BackupRestoreModal` | `ProjectDashboard` | PARTIAL | Export/Restore. **Green success card on failure** |
| `ui/CopyToast` | various | LIVE | Clipboard feedback |
| `ui/Tooltip` | `App.tsx` | LIVE | Primitive |
| `ui/EditorLoader` | — | **DEAD** | 0 refs |
| `ui/Footer` | `App.tsx` | LIVE | Footer |
| `ui/FormatToast` | — | **DEAD** | 0 refs |
| `ui/LadeStackLoader` | various | LIVE | Brand loader |
| `ui/LazyFallback` | `App.tsx` | LIVE | Suspense fallback |
| `ui/LoadingFallback` | — | **DEAD** | 0 refs |
| `ui/LoadingSkeleton` | — | **DEAD** | 0 refs |
| `ui/SaveStatusIndicator` | — | **DEAD** | 0 refs |
| `AutoSaveIndicator` | — | **DEAD** | 0 refs. Fully implemented, never mounted |
| `ColorPicker` | — | **DEAD** | 0 refs |
| `ProjectBar` | — | **DEAD** | 0 refs. **It contains the only project-rename UI (`ProjectBar.tsx:195-214` "Click to rename")** — which is exactly why no project can be renamed |
| `SearchReplaceModal` | — | **DEAD** | 0 refs |
| `SessionManager` | — | **DEAD** | 0 refs |
| `FormatButton` | — | **DEAD** | 0 refs |
| `FormatDiffModal` | — | **DEAD** | 0 refs |
| `LegalPageLayout` | — | **DEAD** | 0 refs — the 7 legal pages each inline their own layout |
| `CodeWriteConfirmationModal` | — | **DEAD** | 0 refs. Unreachable UI claiming *"This cannot be undone (unless you have history saved)"* — which contradicts the `codeHistory` snapshot that **is** taken |
| `sandbox/SandboxPanel` | exported from `fullstackFeature.ts:14`, **never imported** | **DEAD** | A complete E2B sandbox UI shipped inside the full-stack chunk for nothing |

### 2.3 Lazily-loaded feature modals — all LIVE and wired

| Modal | Trigger | Purpose |
|---|---|---|
| `AiDiffModal` | AI apply / selection op | `react-diff-viewer-continued`, word-level diff |
| `AIChatAssistant` | Sidebar | Gemini chat over the current `{html,css,js}` |
| `VoiceCommandPanel` | Mic button | 28 voice intents + typed fallback |
| `TemplateSelectorModal` | New project | 54 templates, **2.6 MB chunk** |
| `CodeStatsDashboard` | Sidebar | LOC/chars/files |
| `CustomInjectionManager` | Sidebar | Per-project CDN `<script>`/`<link>` injection |
| `BuildFromPromptModal` | Sidebar | Prompt → full project |
| `ScreenshotToCodeModal` | Sidebar | Image → code via Gemini vision |
| `WelcomeTourModal` | First run | Onboarding tour |
| `ExportShareModal` | Toolbar | Screenshot / export / share tabs |
| `ImportModal` | Dashboard + toolbar | ZIP/folder import |
| `ImportReviewModal` | Post-import | Detection review |
| `DeployModal` | Toolbar | Netlify/Deploy provider publishing |
| `GitHubSyncModal` | Toolbar | GitHub repo push (JSZip + WebCrypto) |
| `PreviewSharePage` | `/preview/:id` | Standalone share page |
| `MobileStandalonePreview` | `/mpreview/:id` | **Separate chunk from PreviewSharePage** — documented reason: "a phone on the LAN should not download the desktop app to render a preview" |
| `LivePreviewPopoutPage` | `/preview-popout` | Detached preview window |
| `FileExplorer`, `MultiFileEditor`, `DependenciesPanel`, `ExtensionsMarketplace`, `SettingsModal`, `CodeRabbitReviewModal`, `HistoryPanel`, `KeyboardShortcutsHelp`, `CommandPalette`, `SnippetsSidebar`, `ExternalLibraryManager`, `CodeHistoryPage` | various | LIVE |
| `ErrorBoundary` | `main.tsx:13` | Top-level crash catch — **see §6.3 for the false safety claim** |
| `history/CodeHistoryPage`, 7 `pages/*.tsx` | sidebar links | LIVE |

### 2.4 The Static IDE — exact compile mechanism

Verified end-to-end. **There is no Babel Standalone.**

**There is no single compiler — there are three distinct client-side compile paths**, all landing in one `iframe.srcdoc` document:

| Concern | Mechanism | Source |
|---|---|---|
| Plain HTML/CSS | **No compiler** | — |
| Plain-mode JS/TS | **TypeScript compiler**, lazily `import('typescript')`, `ts.transpileModule` at `ES2015`, `reportDiagnostics:true`. 3.5 MB kept out of the entry bundle. | `PreviewPanel.tsx:78-107` |
| Plain-mode JSX/TSX | **Babel Standalone from unpkg CDN** — React 18 UMD + ReactDOM 18 UMD + `@babel/standalone`, user code wrapped in `<script type="text/babel">`. **No source maps** (documented consequence, `PreviewPanel.tsx:534-536`). | `PreviewPanel.tsx:268,280-288` |
| Multi-file React/Vue bundling | **`esbuild-wasm` 0.25.10**, lazily `import('esbuild-wasm')` + `esbuild.wasm?url`, `format:'esm'`, virtual-FS plugin | `bundlerService.ts:71-84,536-563` |
| `.vue` SFC compilation | **`@vue/compiler-sfc` 3.5.40** browser build; `compileScript` + `inlineTemplate` for `<script setup>`, scoped-style hashing | `bundlerService.ts:114-129,150-223` |
| Bare specifiers → CDN | `packageResolver` pins each to an esm.sh URL with `?external=react` (prevents duplicate React), emitted as an `<script type="importmap">` | `bundlerService.ts:27-28`; `PreviewPanel.tsx:305-308` |
| Code execution | Plain JS/TS is **stringified into the document and `eval`'d**; framework bundles run as `<script type="module">` | `PreviewPanel.tsx:418-419` vs `:316-320` |
| Preview document | **`<iframe srcdoc>` — NOT blob URLs** | `PreviewPanel.tsx:1005` (declarative), `:463` (throttled), `:925-928` (forced reload) |
| Live preview update | **Leading-edge throttle + trailing debounce**, default 300 ms | `PreviewPanel.tsx:482-511`, `:117` |
| Console bridge | Script injected **before** user code; parent filters by monotonic `runId` + `contentWindow` identity | `PreviewPanel.tsx:378,547-608` |
| Preview freeze detection | 2 s heartbeat `postMessage`; **2 consecutive 10 s misses ⇒ "Preview stopped responding" + Safe Mode** | `PreviewPanel.tsx:344-348,168-199,830-857` |
| Monaco workers | Dedicated `monacoWorkers.ts`; build asserts worker scripts exist | `utils/monacoWorkers.ts`; `build-unified.mjs:191-197` |
| CDN libraries | Injected `<link>`/`<script>` **with `crossorigin="anonymous"`** — correctly forces CORS mode to satisfy CORP | `externalLibraryService.ts:104,109`; `utils/projectExport.ts:13,18` |

**Assessment:** the compile pipeline is genuinely sophisticated — three compilers, a virtual-FS esbuild plugin, an import map, a runId-scoped console bridge, and a heartbeat-based freeze detector, all client-side. **This is a strength of the codebase.**

**However, the iframe sandbox is deliberately not a sandbox.** `PreviewPanel.tsx:1004` sets `sandbox="allow-scripts allow-same-origin"` and the comment at `:970-1003` **openly states these two tokens together are not a real sandbox** (same-origin escape via `frameElement`), kept because five shipped templates read/write `localStorage` and an opaque origin would throw `SecurityError`. Compensating controls: in-document CSP (`:356`), CSS sanitizer (`:231-239`), `</script` escaping (`:241-243`). The trade-off is documented rather than hidden — good — but it means **user code executes with full same-origin privileges**, including access to everything the app holds in localStorage/IndexedDB.

### 2.5 Templates — 54 modules, real code

`src/services/templates/` contains **54 `.ts` modules** across 11 categories:

| Category | Files |
|---|---|
| `react/` | dashboard, ecommerceStore, saasPlatform, todo, weather |
| `vue/` | agencyPortfolio, cloudDashboard, tasks |
| `nextjs/` | aiStartup, blog, crmPlatform |
| `ecommerce/` | boutique, digitalMarketplace, sneakerDrop, store |
| `saas/` | billingEngine, cloudCostFinops, dashboard, pricing, telemetry |
| `business/` | agency, architectureStudio, consulting, corporate, legalAdvisory, local |
| `dashboard/` | analytics, cryptoTerminal, healthcareOps |
| `landing/` | devPlatform, mobileApp, omniflow |
| `plain/` | animation, audioSynthesizer, auth, blog, kanbanBoard |
| `portfolio/` | architect, developer, motionDesigner, photographerVisual |
| `startup/` | climateTech, fintech, healthtechBio, landing, waitlist |
| `utility/` | calculator, devpulse, markdownStudio, securityAuditor |
| `ai-agents/` | agentStudio, agentWorkflow, chatbot, ragKnowledge |

Spot-checked: these are **real, substantial, working applications** — `templates/react/todo.ts` is 2,220 lines with multi-file output including `utils/todoStore.js`, localStorage persistence under `gbcoder.react-todo.tasks.v1`, drag-and-drop, and priority filters. `templates/nextjs/blog.ts` is 2,486 lines. **The template library is the strongest asset in the repository.**

**Defect:** `templateService.ts` (2,930 lines) and `enhancedTemplateService.ts` (975 lines) both hold template registries, and `enhancedTemplateService.ts:59,132` imports `react/todo` directly. **Templates are statically imported into a single 2.6 MB chunk** rather than split per category.

### 2.6 Service wiring

**LIVE and wired:** `bundlerService`, `validationService`, `formattingService`, `snapshotService`, `shareExportService`, `shareLinkService`, `projectArchiveService`, `projectImportService`, `import/importEngine`, `import/projectDetection`, `deployService`, `githubSyncService`, `templateService`, `enhancedTemplateService`, `externalLibraryService`, `customInjectionService`, `captureService`, `outputStreamingService`, `searchFilterService`, `packageResolver`, `codeMinifierService`, `commandHistoryService`, `editorNavigator`, `preview/livePreviewChannel`, `preview/previewReloadService`, `performanceAnalyticsService`, `errorLogging`, `laminarService`, `analytics`, `externalToolsService`, `debugToolsService`, `screenshotService`, `syntaxHighlighter`, `codeTemplatesService`, `selectionOperationsService`, `codeValidationService`, `ai/codeAssistService`, `ata/ataService`, `vscodeWorkspaceStore`, `webcontainer/*`, `npm/npmRegistryService`, `mobilePreviewService`, `sandbox/sandboxSession`.

**DEAD / orphaned (verified 0 consumers):**

| Module | Notes |
|---|---|
| `services/credentialStore.ts` | **The only AES-GCM-encrypted store in the repo** (`ALGORITHM='AES-GCM'`, 32-byte key, 12-byte IV, fresh IV per save). Its own header claims *"Both feature services therefore come to this module"* — **nothing does**. Every AI key is stored in plaintext instead. |
| `services/securityService.ts` | "security" (`detectXSS`, `detectSQLInjection`, `validateCommand`) is decorative; zero consumers |
| `services/autoCompleteService.ts` | zero consumers |
| `services/projectStore.ts` | Legacy localStorage project store. **Still executed on every cold start** via `useProject` → `initializeDefaultProject()` (`projectStore.ts:252-259`), which creates a spurious `'Untitled Project'` row each load |
| `services/sandbox/sandboxTerminal.ts` | `connect()`, `isAvailable()`, `subscribe()` implemented (`:66-80`), **zero consumers** — a complete HTTP command runner is unreachable |
| `hooks/useProject.ts` | `projectList`, `createNewProject`, `duplicateCurrentProject`, `switchProject`, `deleteProject`, `refreshProjectList`, `syncToCloud`, `saveCurrentProject` — **all never called**. `syncToCloud` is `async (): Promise<boolean> => false` (`:187-188`) |
| `hooks/useCodeWriter.ts` | `writeCode` zero consumers — the animation engine `CodeWriteConfirmationModal` would have used |
| `services/aiChatAssistant.ts` | `explainCode` / `debugCode` / `refactorCode` / `generateCode` (`:103-229`) — **zero call sites**; only `sendMessage` is used |

### 2.7 Hook inventory

| Hook | Used | State owned | Defects |
|---|---|---|---|
| `useLocalStorage` | ✅ | Generic persisted state | — |
| `useProject` | ✅ (mounted) | Legacy list | **Dead API surface; writes localStorage on mount** |
| `useProjectBundle` | ✅ | Project import/export bundle | — |
| `useAutoSave` | ✅ | localStorage mirror | **"Saved" badge decoupled from IndexedDB**; 10-min snapshot interval never fires during editing (deps include `projectState`, so it resets each keystroke) |
| `useCodeHistory` | ✅ | Undo stack `{html,css,js}` | Cannot undo multi-file React/Vue edits |
| `useSnapshots` | ✅ | Manual snapshots | — |
| `useCodeSelection` | ✅ | Monaco selection | — |
| `useSelectionOperations` | ✅ | AI-on-selection | Reads `'gb-coder-settings'` as a **hardcoded string** (`selectionOperationsService.ts:59`) instead of the exported constant |
| `useSettings` | ✅ | App settings + **4 API keys in plaintext localStorage** | `useSettings.ts:94` |
| `useFocusMode` | ✅ | Focus mode | — |
| `useProgressiveLoad` | ✅ | Chunk prefetch | — |
| `useCodeWriter` | ❌ | — | DEAD |
| `useAppShortcuts` | ✅ | Global hotkeys | — |
| `useFileWorkspace` | ✅ | File tree state | — |
| `useConsoleFeed` | ✅ | Console ring buffer | Correctly does **not** wipe app-generated messages on preview reload (`useConsoleFeed.ts:112`) |
| `useValidation` | ✅ | Validation results | — |
| `useTheme` | ✅ | Theme | `ProjectDashboard.tsx:77` destructures `isDark` and **never uses it** — wasted subscription |
| `useAutoFormat` | ✅ | Format on save | — |
| `useCodeHistory` | ✅ | — | — |
| `useImportDrop` | ✅ | Drag-drop import | — |

### 2.8 Enterprise-grade feature usage guide

**To create a project:** `/app` → "New Project" → `NewProjectModal` → pick one of ~12 base templates or a category from the 54-template library → name it → choose IDE mode (`plain`/`react`/`vue` + `vscode`/`plain` style) → stored in IndexedDB under `gb-coder-projects-db`.

**To open an existing project:** Dashboard card → `handleOpenProject` (`App.tsx:2247`) → `flushProjectSave()` **blocks the switch if the current save failed** (exemplary) → reads files → honours the record's stored `editorStyle`.

**Static IDE:** `/app/editor`. Three-panel Monaco + Preview. TypeScript/JSX transpiled via esbuild-wasm; `.vue` via `@vue/compiler-sfc`; preview via debounced `srcdoc` iframe.

**Advanced IDE:** `/app/ide`. WebContainer boots (requires cross-origin isolation). Auto-mounts the FileSystemTree, spawns `jsh`, runs `npm install --prefer-offline && npm run dev`, binds the preview to the SDK's `server-ready` URL.

**Voice:** Sidebar mic → 28 intents. In Firefox/Safari the mic is `disabled` but the **typed-command box runs the identical pipeline** — a genuinely working fallback.

**Backup:** Dashboard → Backup → ZIP with `manifest.json`, `projects/`, `workspace/`, `preferences/`, `integrity/checksums.json` (SHA-256 per file path).

---
## 3. DASHBOARD & INDEXEDDB PERSISTENCE ENGINE

### 3.1 Two coexisting persistence systems

There are **two unrelated project stores live at the same time**:

| | System A — real | System B — legacy shadow |
|---|---|---|
| Store | IndexedDB `gb-coder-projects-db` | localStorage `gb-coder-projects` |
| Code | `services/projects/projectDatabase.ts` | `services/projectStore.ts` |
| Model | `ProjectRecord` + `[projectId, path]` file rows | `Project` (html/css/javascript triple) |
| Active pointer | `gb-coder-active-project-id` (`projectDatabase.ts:112`) | `gb-coder-active-project` (`projectStore.ts:5`) |
| Read by dashboard | ✅ | ❌ |

`useProject` is instantiated at `App.tsx:865` and **still runs on every mount**. Its first effect calls `projectStore.initializeDefaultProject()` (`useProject.ts:40-55`), which creates an `'Untitled Project'` row in localStorage on **every cold start** (`projectStore.ts:252-259`). Two different keys name the "active project" and are never reconciled.

### 3.2 IndexedDB schema — `src/services/projects/projectDatabase.ts`

| Fact | Value | Line |
|---|---|---|
| DB name | `gb-coder-projects-db` | 59 |
| Version | **`1` — constant, never bumped** | 60 |
| Store `projects` | keyPath `'id'` | 161 |
| Index on `projects` | `lastOpenedAt` (epoch ms) | 164 |
| Store `projectFiles` | keyPath `['projectId','path']` (compound) | 168 |
| Index on `projectFiles` | `projectId` | 170 |

Second database: `gb-coder-workspace` v1, store `vscode`, no keyPath, key `'current'` (`vscodeWorkspaceStore.ts:23-27`).

**🔴 There is no migration path.** `onupgradeneeded` (`:157-172`) contains only idempotent "does this store exist?" guards. There is **no `oldVersion` check, no schema-version field on records, and no data-transform step anywhere in the codebase.**

**🔴 `onversionchange` is never handled.** Zero occurrences in `src/`. Consequence: tab A holds a connection → tab B opens with a future version → A never closes → B's upgrade blocks forever → `request.onblocked = () => resolve(null)` (`:176`) makes B **silently resolve "no database"**. Tab B then runs an entire session with zero persistence, emitting only a `gb-coder:storage-warning` event that `App.tsx:2582` **ignores unless `quotaExceeded === true`**. Additionally, when `onblocked` fires the pending request is abandoned; if it later succeeds, `onsuccess` assigns a connection that is **never closed**.

### 3.3 CRUD — every operation and its failure shape

All operations funnel through `withTransaction` (`:208-265`), which **never rejects**. It resolves `null` on: db unavailable (`:215`), `transaction()` throw (`:223-228`), `onerror` (`:241-246`), `onabort` (`:247-250`), and any rejection from `work()` (`:252-263`).

| Op | Line | Success | Failure |
|---|---|---|---|
| `listProjects` | 268-276 | `ProjectRecord[]` newest-first | `[]` — **`null` indistinguishable from "no projects"** |
| `getProject` | 278-286 | record | `null` — **indistinguishable from "doesn't exist"** |
| `createProject` | 289-318 | record | `null` |
| `restoreProject` | 324-349 | record | `null` |
| `updateProject` | 447-481 | patched record | `null` |
| `touchProject` | 484-485 | delegates | `null` |
| **`deleteProject`** | 498-512 | `void` | **`void` — failure completely invisible** |
| `duplicateProject` | 554-600 | record | `null` (**no callers — dead**) |
| `readProjectFiles` | 351-373 | `ProjectFile[]` | `[]`; corrupt rows dropped **silently** (`:359-366`) without decrementing `fileCount` → dashboard count drifts permanently |
| `saveProjectFiles` | 384-437 | `{snapshot, persisted}` | `persisted:false`. **Diff is content-only** (`:389-391`) — a `language`-only change is never written |

**🔴 The five silent-swallow paths, each independently harmful:**

1. **`deleteProject` reports success on failure.** It resolves `void` regardless; `App.tsx:2407` then unconditionally executes `toast.success(\`Deleted "${record.name}".\`)`. **Verified.**
2. **`getProject → null` is interpreted as "project deleted."** `App.tsx:2206-2211` calls `writeActiveProjectId(null)`. **A transient IndexedDB hiccup destroys the reopen pointer.**
3. **`readProjectFiles → []` is interpreted as "project has no files."** `App.tsx:2285-2295` shows *"has no stored files — opened an empty workspace"* and sets `seededEmpty: true`, which **suppresses persistence** (`App.tsx:2526`). The real files remain on disk but become unfindable from the UI.
4. **Non-quota storage failures produce no UI at all.** `dispatchStorageWarning(reason, false)` at `:215,225,244,248`; `App.tsx:2580-2587` toasts **only** when `detail.quotaExceeded` is true. *"IndexedDB unavailable or blocked"*, *"Transaction aborted"*, *"Storage write failed"* are all swallowed.
5. `projectStore.getCurrentProjectId`/`setCurrentProjectId` (`projectStore.ts:204-213`) have **no try/catch** — a blocked localStorage throws straight into React.

### 3.4 Quota handling — detected, never prevented

**Present:** `QuotaExceededError` name checks at `projectDatabase.ts:224,243`, `vscodeWorkspaceStore.ts:138,147`, `snapshotService.ts:101`; dispatched as `gb-coder:storage-warning` with `quotaExceeded:true`; `App.tsx:2583` toasts *"Local storage quota limit reached."*

**Absent (verified repo-wide, zero matches):**
- ❌ `navigator.storage.persist()` — **never called.** The origin is **evictable**.
- ❌ `navigator.storage.estimate()` — **never called.** The app has no idea how full it is.
- ❌ `navigator.storage.persisted()` — never called.
- ❌ No pre-write size check, no per-project budget, no eviction of old projects.
- `snapshotService.MAX_STORAGE_BYTES` (`:83`) is **declared and never enforced**.

**Consequence:** under Chrome eviction / ITP / "clear on low disk", **the entire `gb-coder-projects-db` and `gb-coder-workspace` can be deleted with no warning**, because no persistence grant was ever requested. `ProjectDashboard.tsx:292-294` warns only about *manual* clearing.

### 3.5 Backup — format, crypto, and limits

**Serialization is ZIP, not JSON.** JSZip dynamically imported (`backupExportService.ts:172`) to keep it out of the entry chunk.

~~~
manifest.json                       (218-219)  ← NOT checksummed
projects/index.json                 (176-179)  ← full ProjectRecord[] dump
projects/<id>/metadata.json         (183-186)
projects/<id>/files/<path>          (188-193)  ← raw content as entry body
workspace/state.json                (197-201)
preferences/settings.json           (205-209)
integrity/checksums.json            (213-215)  ← itself NOT checksummed
~~~

`formatVersion: 1`. `applicationVersion: '1.0.0'` — **hardcoded** (`:156`), never the real build.

**🔴 `backupCrypto.ts` contains NO encryption.** Verified: there is **no cipher, no KDF, no IV/nonce, no password prompt**. The module provides SHA-256 hashing and path sanitization only. It is not obfuscation — it is genuinely just a digest plus a validator. The module name and the docstring *"Cryptographic Integrity & Archive Security"* oversell it. Backups are **plaintext ZIPs**.

**The UI markets it as security:**
~~~
BackupRestoreModal.tsx:255-259
  <span>Security & Integrity</span>
  <FileCheck2 /> SHA-256 Verified
~~~
SHA-256 is **unkeyed** — an attacker edits the archive and recomputes every hash. It detects accidental corruption only. `manifest.json` and `integrity/checksums.json` are themselves **excluded** from the checksum map, so project IDs, names and counts are editable with zero detection.

**Doc drift:** `reports/PHASE_0_5_BACKUP_RESTORE_REPORT.md:18` claims *"Every archive contains a cryptographically signed manifest."* **There is no signature anywhere in the codebase.**

**Versioning is exact-equality with no tolerance** (`backupRestoreService.ts:119`): a v2 archive is permanently unrecoverable by this build. Combined with `DB_VERSION` frozen at 1, **neither layer has any migration infrastructure.**

**🔴 Size limits are restore-only — export applies none.**
`BACKUP_MAX_UNCOMPRESSED_BYTES = 100 MB`, `BACKUP_MAX_FILES_COUNT = 2500`, `BACKUP_MAX_ENTRY_SIZE_BYTES = 25 MB` (`backupTypes.ts:18-20`), enforced **only on restore** (`:75-99`). **A user with 3,000 files exports a perfectly valid archive that their own restore then rejects.** Furthermore, the byte caps depend on a private JSZip field:
~~~ts
const entryData = (zipEntry as unknown as { _data?: { uncompressedSize?: number } })._data;  // :88
~~~
If `_data` is absent (streamed entries / JSZip version drift), the 25 MB and 100 MB caps **silently do nothing**.

**Other export defects:**
- **Export never fails when storage is broken.** `listProjects()` returns `[]` on any IndexedDB failure, so an export taken while storage is degraded produces a valid, correctly-hashed **empty** archive and the UI reports `Backup downloaded successfully! (gb-coder-backup-….zip • 0 projects • 0 files)`.
- `triggerBlobDownload` revokes the object URL after a fixed 1000 ms (`:80`) — a slow download truncates.
- Filename is second-granularity → two exports in one second collide.
- One bad path aborts the **entire** export (`:189`); no partial archive.

### 3.6 Restore — merge semantics, collisions, traversal

**Always create, never overwrite — with two exceptions.**

Conflict detection is **ID-only**, computed once at analysis time (`:219-229`). On conflict → fresh UUID + `" (Restored N)"`. `action` can only be `create_new` or `create_copy`; the `'skip'` branch (`backupTypes.ts:90`, `backupRestoreService.ts:311-313`) is **never assigned — dead**.

**🔴 Exception 1 — duplicate IDs inside one archive clobber each other.** `existingIdSet` (`:220`) is captured once and **never updated** as new target IDs are allocated (`:235-247`). Two manifest entries sharing an `id`, not colliding locally, both get `targetId = originalId`. Execution order (`:310-345`) writes #1, **verifies** it (`:335-336`), then writes #2 over the same key. **Both report success; #1 is silently destroyed.** `key={p.originalId}` (`BackupRestoreModal.tsx:468`) is also a duplicate React key.

**🔴 Exception 2 — stale-plan cross-tab overwrite.** `restoreProject` (`:324-349`) is an **unconditional `put`** with no existence re-check. The plan is computed once; if another tab creates a matching project in between, it is silently overwritten. `restoreProject` also does not delete pre-existing files, so leftovers survive and the verification at `:338` fires *after* the damage.

**Unvalidated fields written straight into IndexedDB:**
~~~ts
const recordToInsert: ProjectRecord = {
  ...planProj.metadata,            // :317  ← arbitrary keys from the [key:string] index signature
  id: planProj.targetId, name: planProj.targetName,
  entry: planProj.metadata.entry,  // :324 ← never validated; may not exist
  fileCount: planProj.files.length,
};
~~~
A crafted archive can inject arbitrary extra keys, an arbitrary-length `name` (quota exhaustion), a bogus `entry`, and **attacker-controlled `lastOpenedAt`** — which is the index the dashboard orders by. `manifest.projects` element shape is never validated beyond `Array.isArray` (`:123`); `[{}]`, `[null]`, `[42]` all reach `projMeta.id` (`:157`).

**Path traversal: BLOCKED.** `validateAndNormalizeArchivePath` (`backupCrypto.ts:48-92`) rejects empty, `\0 \r \n`, Windows drive specifiers, absolute `/…`, any `..` segment, and `__proto__`/`constructor`/`prototype`. Applied to every entry up-front (`:85`) and every per-project relative path (`:165`). **A crafted backup cannot escape the project tree.** Residual weaknesses: `manifest.projects[].id` is never path-validated (harmless to the FS because entries are scanned separately, but the IndexedDB key is attacker-controlled); no length limits; `assertNoPrototypePollution` bails at depth > 20 (`:106-117`).

**Corrupt-input handling is good:** bad ZIP, empty archive, >2500 entries, missing/bad manifest, wrong format/version, non-array projects all `throw` with specific messages. `./`-prefixed archives are rejected (`:102`) because the lookup is for literal `manifest.json`.

**🔴 Non-atomic restore + a green success card on failure.** Each project is written in a **separate** transaction (`:310-345`), so a mid-restore quota failure leaves a partial set. And:
~~~tsx
// BackupRestoreModal.tsx:557 — rendered for ANY non-null restoreResult
{restoreResult && (
  <div className="...emerald...">
    <CheckCircle2 /> <h3>Restore Completed Successfully!</h3>
    Restored {restoreResult.restoredProjectCount} project(s) and {restoreResult.restoredFileCount} files...
~~~
The modal reads `result.success` **only** at line 148 to decide whether to call `onRestored()`. It **never reads `result.errors`** for rendering and **never sets `restoreError`.** **A completely failed restore renders a green success card reading "Restored 0 project(s) and 0 files."** Verified.

Other: `RestorePlan.restoreWorkspace`/`restorePreferences` are hardcoded `false` (`:277,279`) and never read — dead fields. `BackupRestoreModal.tsx:388` says *"Select **or drop** a GB Coder backup archive"* but **there is no `onDrop`/`onDragOver` handler** — drag-and-drop silently does nothing. `modalRef` (`:63,173`) is assigned and never read — no focus trap, so `aria-modal="true"` is a lie.

### 3.7 Dashboard UI — what works, what is missing

`ProjectDashboard.tsx` (312 lines) is presentational; every action is a prop.

**Wired:** create → `App.tsx:4295`; list → loaded `App.tsx:2438-2443`, refreshed by the `gb-coder:projects-updated` listener (`ProjectDashboard.tsx:89-95`); open → `handleOpenProject` (`App.tsx:2247`); delete → inline 2-step confirm (`:245-280`); import, backup, restore, template selection.

**Missing / dead:**

| Item | Evidence |
|---|---|
| **No rename — a user cannot rename a project at all.** | No rename prop in the dashboard. `projectDatabase.updateProject` is imported at `App.tsx:65` and **never called** (dead import). The only rename UI is `ProjectBar.tsx:195-214` ("Click to rename") — and `ProjectBar` has **0 external references.** Verified. |
| **No duplicate.** | `duplicateProject` (`:554-600`, 47 lines incl. a detailed atomicity comment) — **called from nowhere.** |
| Delete button is `opacity-0` until `group-hover`/`focus-visible` (`:276`) | **Invisible and effectively unreachable on touch devices.** |
| Badge shows `editorStyle` only (`:231-236`), not `projectType` | A React project and a plain project look identical in the list. |
| No search, sort control, per-project export, or drag-reorder | Absent. Order is strictly `lastOpenedAt` desc — **which a backup archive can forge.** |
| `isDark` unused (`ProjectDashboard.tsx:77`) | Wasted `useTheme` subscription. |
| `AutoSaveIndicator.tsx`, `SaveStatusIndicator.tsx` | Fully implemented, **never imported.** |

### 3.8 Autosave — two systems, different guarantees

**8a. IndexedDB project save (the one that matters)** — `App.tsx:2520-2548`, debounce `PROJECT_SAVE_DEBOUNCE_MS = 1200`.

**Save honesty is correct here.** `saveProjectFiles` returns `persisted:false` on failure (`:432-434`); `flushProjectSave` restores the pending entry and returns `ok:false` (`App.tsx:1338-1341`); dirty dots clear **only** via `markFlushedSaved` on a confirmed commit (`:2535-2536`). All destructive transitions flush and **block on failure** (`:1448-1452,1538-1542,2257-2262,2416-2420,2225-2229`). `visibilitychange` + `beforeunload` + `pagehide` all flush (`:2557-2576`). **This is exemplary engineering.**

Defects: silent failure on non-quota errors (no toast); `seededFilesRef` suppression (`:2526`); **no cross-tab coordination** — no `BroadcastChannel`, no `storage` event, no version stamps, so two tabs editing one project silently clobber each other.

**8b. localStorage mirror (`useAutoSave`)** — debounce 2000 ms, `App.tsx:936-940`. Correct: `saveAutoSave` reports `{ok, quotaExceeded}`; on failure `lastSavedHashRef` is **not** advanced, so it stays retry-eligible; `lastSaveTime`/event fire only on success.

Defects:
1. **The "Saved" badge is decoupled from the IndexedDB save.** `StatusBar.tsx:20-24,41-49` shows a green **"Saved"** from the mirror event only — it can read "Saved" while the IndexedDB commit is still pending (1200 ms vs 2000 ms) or has failed silently.
2. `useAutoSave.ts:47` returns early **without dispatching the event** when the hash is unchanged, so the badge never appears for an unchanged state.
3. **djb2 32-bit hash never reset per project** (`lastSavedHashRef`, `:39`). A collision causes a **silent skip** of an entire project's mirror write.
4. **The 10-minute auto-snapshot never fires during editing.** Its effect deps include `projectState`, which changes every keystroke, so React tears down and recreates the interval each time — the 600 000 ms timer **resets before it can ever elapse.** It only fires after 10 minutes of complete inactivity.
5. A **single global autosave slot** (`gbcoder_autosave_current`) is overwritten on every project switch — crash recovery can only offer the last project worked on.
6. `saveSnapshots` throws on quota (`:185`), caught with a bare `console.error` (`:121-123`) — and `console` is **stripped from production builds** (`vite.config.ts:454`).

### 3.9 Concrete data-loss scenarios

| # | Scenario | Mechanism |
|---|---|---|
| **D1** | **Fullstack import overwrites the open project's files.** | `App.tsx:1661-1670` sets `fullStackProject` to newly imported files while `activeProjectId` still points at the previous project; autosave writes those files against the old project id, deleting everything not in the new set. Recovery is **in-memory only**. Close the tab between import and exit → **permanent loss.** |
| **D2** | Failed delete reported as success | `projectDatabase.ts:508-512` + `App.tsx:2407` |
| **D3** | Silent IndexedDB write failure → tab closed → edits lost | non-quota errors produce no toast |
| **D4** | Eviction without persistence grant deletes both databases | no `navigator.storage.persist()` anywhere |
| **D5** | Export while storage degraded produces an empty "successful" backup | `listProjects() → []` |
| **D6** | Self-rejecting backup | export has no caps; restore enforces 2500/100 MB/25 MB |
| **D7** | Restore with a failed project reports success | green card ignores `result.success` |
| **D8** | Duplicate IDs in one archive destroy each other | `backupRestoreService.ts:231,328-336` |
| **D9** | Stale-plan cross-tab overwrite | blind `put` at `projectDatabase.ts:339` |
| **D10** | Transient read failure → empty workspace + persistence suppressed | `readProjectFiles → []` |
| **D11** | Transient `getProject` failure destroys the reopen pointer | `App.tsx:2206-2211` |
| **D12** | Cross-tab last-write-wins file clobber | no `BroadcastChannel` |
| **D13** | Spurious localStorage write every cold start | `projectStore.ts:252-259` |
| **D14** | No rename path at all | §3.7 |

---

## 4. DUAL IDE MODES & INTER-IDE SWITCHING

### 4.1 WebContainer boot — singleton, three layers

| Layer | Location |
|---|---|
| Module singleton | `webcontainerService.ts:1270` |
| Instance field | `:321` `private instance: WebContainer \| null` |
| `globalThis` HMR escape hatch | `:702-708, 716-722, 742-743, 782-784` |
| SDK private field | `:701` `(WebContainer as unknown as {_instance?})._instance` |

`boot()` (`:695`) is reached from `mountProject` (`:807`), `spawnInteractiveShell` (`:1072`), `runCommand` (`:1252`). **`WebContainer.boot()` is called with zero options** — no `workdirName`, no `coep` hint, no timeout, no `AbortController`, no retry cap.

**`crossOriginIsolated` is checked — but after three bypasses:**
~~~ts
if (this.instance) return this.instance;                                    // :697
const existing = (WebContainer as any)._instance ?? (globalThis as any).__GBCODER_WEBCONTAINER_INSTANCE__;
if (existing) { … return existing; }                                          // :702-708
if (!this.isSupported()) { … throw new Error(msg); }                          // :724
~~~
`isSupported()` (`:599-601`) is exactly `Boolean(window.crossOriginIsolated)`. **A stale `globalThis` instance is adopted without re-verifying isolation.** Boot failure is handled well (`:738-779`: string-matches the SDK's "Only a single WebContainer instance can be booted", scrapes `_instance`, sets `startupStage:'error'` + `retryAction:'reboot_container'`, nulls both boot promises, rethrows) — but with **no timeout**.

### 4.2 Lifecycle — enumerated resource leaks

| # | Leak | Evidence |
|---|---|---|
| **L1** | 🔴 **`container.teardown()` is NEVER called anywhere in `src/`.** Verified: 6 `teardown` hits repo-wide — 5 are `teardownRecognition` in `voiceCommandService`, 1 is a comment in `inlineCopilotService`. **Zero in `src/services/webcontainer/`.** | verified |
| **L2** | 🔴 `jsh` PTY + dev server survive unmount. `TerminalTab.tsx:752-764` cleanup calls `disconnect()` (listener removal only) but **never `kill()`**. The `jsh` process and any `npm run dev` child survive. | `TerminalTab.tsx:758`; `webcontainerService.ts:1055-1057` |
| **L3** | `shellOutputBuffer` is a **500-*chunk*** ring with **no byte cap** (`:1098-1102`). A fat `npm install` emits megabytes; 500 such chunks is unbounded memory, replayed into every reconnecting terminal. | `webcontainerService.ts:1098-1102` |
| **L4** | HMR listener accumulation. `setupServerListeners` guards with a per-instance `WeakSet` (`:325`) and calls `cleanupServerListeners()` (`:618`) only when *this* manager attaches. Each HMR cycle creates a new manager that re-adopts the global container and attaches **three more** listeners. | `webcontainerService.ts:325,614-618` |
| **L5** | 🔴 **E2B sandbox + 2.5 s poll loop outlive the panel — a billing leak.** `startLogPolling()` (`:355-368`) is stopped only by `close()` (`:435`) or the failure path. **`SandboxPanel` has no `useEffect` at all** — no unmount hook. | `sandboxSession.ts:358`; `SandboxPanel.tsx` |
| **L6** | Un-abortable async restart IIFE (`TerminalTab.tsx:499-583`) calls `term.write()` on a disposed `XTerm` if the component unmounts mid-flight; `isStartingShellRef` never resets. | `TerminalTab.tsx:499-583` |
| **L7** | `pendingAutoStartCmdRef` is cleared at `:232,292,450,494,570` but **not in the unmount cleanup** — a queued `npm install && npm run dev` can fire into a shell with no UI. | `TerminalTab.tsx:56-60,752-764` |
| **L8** | Stray `setTimeout`s calling `setState` after unmount: `VSCodeMode.tsx:985-987`, `:2090`. | — |
| **L10** | `runCommand()` (`:1247-1267`) spawns an **untracked, untimed, unkilled** process. Called from `DependenciesPanel.tsx:310`. A hung install has no cancel path. | `webcontainerService.ts:1247-1267` |
| **L11** | `shellSpawnPromise` reset in `finally` races recursion (`:1062-1065` re-reads after it may be nulled) → possible double `spawn('jsh')`, loser's process orphaned. | `webcontainerService.ts:1062-1065,1237-1241` |
| **L13** | `livePreviewChannel` registers a `window.addEventListener('storage', …)` at construction and **never removes it**. | `livePreviewChannel.ts:43-80` |
| **L12** | `stopDevServer()` (`:536-552`) never calls `process.kill()` and has **zero callers**; same for `resetServerState`, `isShellRunning`, `getSpawnAttempts`, `setRuntimeError`, `clearRuntimeError`, `readPackageJson`, `getInstalledFingerprint`, `cleanupServerListeners`. | verified |

### 4.3 FileSystemTree — silent destructive collisions

`filesToFileSystemTree` (`:149-318`) splits on `/` and builds nested nodes. **Collisions are resolved silently, destroying data:**
~~~ts
} else {
  if (!current[segment] || !('directory' in current[segment])) {
    current[segment] = { directory: {} };   // ← silently discards a file at that path
  }
~~~
A file `a/b` followed by `a/b/c` destroys `a/b`. The reverse order (`:172-177`) destroys the entire subtree. **Neither is validated against `validateWorkspacePath`/`validateWorkspaceFolder` before mounting.**

**`package.json` handling is a latent permanent hang:**
- Synthesized only when none exists (`:190-237`).
- **When one exists, only `extraDependencies` is merged into `dependencies` (`:238-249`). It never adds `scripts.dev` and never adds `vite` to `devDependencies`.**
- Consequence: a user `package.json` without a `dev` script makes `npm run dev` fail with `npm ERR! Missing script: "dev"` — and because the failure occurs while `startupStage === 'starting_server'`, and `isInstallErr` is gated on `startupStage === 'installing'`, **it is classified as neither an install nor a server error. The UI hangs on "Starting Server…" forever.** No watchdog fires.
- `.npmrc` and `node_modules/.bin/help` are **injected into every project** (`:288-315`), overwriting user files of the same name.

**🔴 There is no file watcher at all.** Zero `.watch(` matches in `src/services/webcontainer/`. Sync is **one-way, editor → container, per keystroke with no debounce** (`VSCodeMode.tsx:575,688,298,315,1430,2518`; `App.tsx:297-301`), and `syncFile` does a redundant `mkdir -p` on every keystroke (`:965-969`). **Container → editor is not implemented**: `cat > file`, `npm i <pkg>` rewriting `package.json`, or `git checkout` in the terminal never reaches `project.files` or IndexedDB. **The editor and the runtime silently diverge.**

**fs errors are swallowed almost everywhere:** `syncFile` (`:971-973`), `deleteFile` (`:994-996`), `isDependenciesInstalled` (`:843-845` → `false`, indistinguishable from "node_modules absent", forcing a redundant full install), `readPackageJson` (`:933-935`), `.npmrc` write (`:811-813`), and `JSON.parse` of a user `package.json` (`:245-247`). Only `mountProject` surfaces an error.

**`FileTreeView`:** `buildTree` (`:78-126`) is pure `useMemo` — no fs access, no error surface. `expanded` state (`:448-456`) is initialised once from the mount-time tree and **never re-syncs** after hydration. A root-level `.gitkeep` vanishes (`:84` slices the suffix from `.gitkeep`, yielding `''` → `segments = []` → dropped). Rename/draft inputs commit on **both** `Enter` (`:235-237,392-394`) and `onBlur` (`:298,419`) with no in-flight guard.

### 4.4 Terminal — mostly correct cleanup

| Concern | Location | Verdict |
|---|---|---|
| `ResizeObserver` | `TerminalTab.tsx:804-810` | ✅ `disconnect()` at `:809` |
| Refit on tab focus | `:813-820` | ✅ `cancelAnimationFrame` cleanup |
| `webcontainerService.subscribe` | `:768-772` | ✅ unsubscribe returned |
| `onRestartRequest` | `:605-609` | ✅ unsubscribe, but re-subscribes on every `triggerDevServerRestart` identity change (`:594`) |
| Xterm disposal | `:753-754` | ✅ `disposable.dispose(); term.dispose()` |
| **Shell kill** | `:752-764` | 🔴 **MISSING** |
| **Queued command clear** | `:752-764` | 🔴 **MISSING** |

Other: the xterm effect depends on `mode` (`:765`), so every WebContainer↔Local toggle **destroys and rebuilds the terminal**, losing scrollback. `hasAutoStartedRef` resets only in `triggerDevServerRestart` (`:588`), so a mode round-trip **never re-runs install/dev-server startup**.

### 4.5 npm install / dev-server flow — substring heuristics

The whole state machine is driven by **substring matching on PTY output**:
~~~ts
// TerminalTab.tsx:311-314  (duplicated at webcontainerService.ts:1117-1120)
(chunk.includes('added ') && chunk.includes('package')) || chunk.includes('up to date')
~~~
**A `console.log` from user code, or a package's own install script printing "up to date", flips `installing → starting_server` early.** There is no `package-lock.json` confirmation and **no `exitCode` is ever observed**. Two independent copies of the matcher exist and can disagree.

**Port detection is not parsed at all** — it relies purely on SDK events, and **any** listening port claims the preview (`:645-656`). `python -m http.server 3000`, a stray `node server.js`, or a test watcher hijacks `serverUrl`; the UI then falls back to a hardcoded `5173` that is usually wrong (`VSCodeMode.tsx:833,1442,1444,2086,2098,2336,2358`).

**`handleIframeError` is effectively dead.** `VSCodeMode.tsx:2239` `onError` never fires for HTTP errors, DNS failure, or a blocked frame in any current browser — **the red error banner and Retry button (`:2247-2258`) are unreachable in practice.**

**No timeout on install or server start.** The only timeouts in the flow are a 15 s shell-prompt watchdog, a 350 ms postMessage reload, and a 500 ms navigation fallback.

### 4.6 Preview iframe — sandbox is not a sandbox

~~~
sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads"
~~~
(`VSCodeMode.tsx:2243`, `:2455`). **`allow-scripts` + `allow-same-origin` together is not a sandbox** — for a same-origin `src` the frame gets full DOM, storage and origin access. `serverUrl` comes straight off the SDK `port` event with **no origin allow-list**, so a hijacked same-origin port yields an unsandboxed same-origin document able to read `localStorage['gbcoder_e2b_key']` and all IndexedDB.

**🔴 XSS in the popout — real finding.** `LivePreviewPopoutPage.tsx:23-36`:
~~~ts
const urlParam = params.get('url');          // :26  ← already percent-decoded
if (urlParam) {
  return { type:'dev_server', url: decodeURIComponent(urlParam), … };   // :31 ← decodes AGAIN
~~~
1. **Double-decoding:** `%2522` → `%22` → `"`.
2. **No scheme/host validation.** The value goes straight to `<iframe src={devServerUrl}>` at `:292` with `allow-scripts allow-same-origin`. A crafted `/preview-popout?url=data:text/html,…` or `?url=https://attacker/` executes attacker script in a full-featured frame; a same-origin target defeats the sandbox entirely. The route is publicly linkable and Vercel-rewritten.

### 4.7 IDE switcher — the data-loss window

**Entry:** `App.tsx:2045-2068` `handleEnterVSCodeMode`:
~~~ts
setVsCodeReturn({ projectType: fileProject.projectType, entry: fileProject.entry });
setFullStackProject(fileProject);      // same object reference — no copy
setIsVSCodeRoute(true);
navigateTo(VSCODE_ROUTE);
~~~

**🔴 It does NOT `await flushProjectSave()` first** — unlike *every other* transition in the file (`:1448`, `:2257`, `:2316`, `:2416`, `:2225`). The same omission exists in `leaveVSCodeMode`.

**Data-loss windows:**
1. `leaveVSCodeMode` clears the IndexedDB workspace **before** handing files to `handleImportResult`:
   ~~~ts
   if (!activeProjectId) { void clearWorkspace(); }   // :1903
   …
   handleImportResult({ files: project.files, … });   // :1926
   ~~~
   If `handleImportResult` fails, **the only IndexedDB copy is already gone.**
2. `setFullStackProject(null)` (`:1891`) happens first; the autosave effect then re-targets `fileProject.files`. Between `:1893` and the 1200 ms save, a hard tab kill loses the edits.
3. `handleEnterVSCodeMode` awaits `updateProjectEditorPreference(…, 'vscode')` (`:2060`) **after** `navigateTo(VSCODE_ROUTE)` (`:2057`). If that write fails, the URL says `/app/ide` while the stored preference still says `plain` — a refresh lands in the Static Editor with no explanation.
4. `mountProject(...).then(...)` with **no `.catch()`** at `:1691`, `:2013`, `:2146`, `VSCodeMode.tsx:1069,1206` → unhandled rejections, no restart.

View-state persistence is solid: `readViewState`/`writeViewState` (`vscodeWorkspaceStore.ts:218-242`) reconciled against real files (`:251-263`), with a promise queue (`:86-93`) preventing ordering races.

### 4.8 SandboxPanel / e2b / localShell — reality check

- **`SandboxPanel.tsx` (577 lines) is NEVER MOUNTED.** Exported from `fullstackFeature.ts:14`, but `App.tsx:143-145` destructures **only** `module.VSCodeMode`. No `<SandboxPanel` JSX exists anywhere. A naive grep says "wired"; it is not.
- **`sandboxSession.ts` (559 lines) is a real E2B client** (POSTs to `/api/sandbox/*`, BYO key, session-only by default) — reachable **only** from the unreachable panel.
- **`sandboxTerminal.ts` has zero consumers.** `attachTerminal()` registers `setConnector(...)`, but `connect()`/`isAvailable()`/`subscribe()` (`:66-80`) are never called — **a complete HTTP command runner with `terminalSafety` sanitization is unreachable at runtime.**
- **`localShell.ts` is a pure in-memory simulator, not a shell.** `runLocalCommand` parses the typed line against a static `COMMANDS` table and operates on the in-memory `ProjectFile[]`. No process, no filesystem, no exit codes. It is honestly labelled "Local Simulated Shell" in the UI (`TerminalTab.tsx:794`).
- **`IDESettingsModal.tsx` writes 4 paid API keys to plaintext localStorage** (`:64-72`) with no encryption and no UI disclosure.

---

## 5. AI FEATURES & VOICE COMMAND SYSTEM

### 5.1 Providers, models, and where keys live

| Provider | Model | Key source |
|---|---|---|
| `inception` (Inception Labs) | `mercury-2.5` | `body.apiKey` → `INCEPTION_API_KEY` (`api/ai.js:37`) |
| `atria` (Atria ASI) | `Atria-Dawn-Preview` | `body.apiKey` → `ATRIA_API_KEY` (`:51`) |
| `nvidia` (fallback) | `qwen/qwen3.5-397b-a17b` | `body.apiKey` → `NVIDIA_API_KEY` (`:62`) |
| Gemini vision | `gemini-1.5-flash` / `-pro` | `GEMINI_API_KEY` (`api/vision-to-code.js:222`) |
| Gemini inline | `gemini-1.5-flash` | `GEMINI_API_KEY` (`api/ai/inline-completion.js:265`) |
| **Gemini chat + CodeRabbit (client-side)** | `gemini-pro` / `gemini-1.5-flash` | 🔴 **`VITE_GEMINI_API_KEY` baked into the bundle** |

**🔴 Credential storage — four places, only one encrypted, none used:**

| Store | Encryption | Location |
|---|---|---|
| Build-time bundle | **none** | `aiChatAssistant.ts:30`, `inlineCopilotService.ts:540`, `visionCodeService.ts:186` |
| localStorage | **plaintext** | `codeRabbitService.ts:38,56,69` (`coderabbit_api_key`), `useSettings.ts:94` (`gb-coder-settings` holds 4 keys) |
| localStorage | **plaintext** | `IDESettingsModal.tsx:64-72` |
| `credentialStore.ts` | ✅ **AES-GCM**, 32-byte key, 12-byte IV, fresh IV per save | **ZERO consumers.** Its own header claims feature services come here — none do. |

**Any anonymous caller can choose which key pays:**
~~~js
apiKey: customApiKey || process.env.INCEPTION_API_KEY,   // api/ai.js:37
const apiKey = String(body.apiKey || '').trim() || String(process.env.GEMINI_API_KEY || '').trim();  // vision-to-code.js:222
~~~

**🔴 Dead model ID:** `aiChatAssistant.ts:38` targets `model: 'gemini-pro'`, **retired** by Google in favour of `gemini-1.5-pro`/`gemini-2.x`. With `@google/generative-ai@0.24.1` this returns 404. **The AI Chat feature is non-functional against any current key — while simultaneously leaking a build-time credential.**

### 5.2 `api/ai.js` — the most expensive defect in the audit

~~~js
// api/ai.js:715-721
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
if (req.method === 'OPTIONS') { return res.status(200).end(); }
~~~

Because `Content-Type: application/json` is not CORS-safelisted, a cross-origin call triggers a preflight — which this handler answers `200 OK` with `*`. **Any website on the internet can run JavaScript in a victim's browser that POSTs to this deployment's `/api/ai` and bills the operator's key.** There is **no authentication, no CSRF token, and no Origin/Referer check.** Identical at `api/vision-to-code.js:171-175` and `api/ai/inline-completion.js:239-243`.

**Rate limiting exists but is decorative in production:**
~~~js
const RATE_MAX = 30;                                    // :72
const rateLimiter = new RateLimiter({ default: RATE_MAX }, RATE_WINDOW_MS);  // :80
~~~
An **in-memory `Map` that resets on every serverless cold start** — acknowledged at `:74-78`. No Redis/KV backing (`@upstash/redis` is installed but unused by `api/`). Per-IP only; 30 req/min × N source IPs is unbounded. Each `/api/ai` request can cost **two** upstream calls (`completeWithJsonRetry`, `:667-693`) at `maxTokens: 16384`.

**IP spoofing is correctly mitigated** (`api/_client-ip.js:32,44-62`): XFF is trusted **only** when `VERCEL`/`VERCEL_ENV` is set, else `req.socket.remoteAddress`, falling back to a shared `'unknown'` bucket rather than a random value. This is the right pattern.

**Input bounds that are correct:** `MAX_BODY_LEN = 180_000` → 413 (`:710,769-771`); conversation history bounded three ways (≤6 msgs, ≤8000 chars each, ≤24 000 total) at `:785-797`; an explicit **anti-prompt-override** coercion at `:823-829` (`role: m.role === 'user' ? 'user' : 'assistant'`) — a genuinely good defence against role-injection.

**Dead server surface:** `api/ai.js:817-923` implements full SSE streaming `chat`, and `:502-523` implements `improve`/`suggest`/`inline-edit`. Repo-wide grep for those `feature` values in `src/` returns **zero matches** — untested, unused attack surface. `:969-981` returns a 502 body containing `provider.keyEnvName`.

### 5.3 AI Chat UI

**No streaming.** `handleSendMessage` awaits a single `sendMessage`; the UI shows a static `Thinking...` spinner. The server's SSE `chat` is never used.

**🔴 Error handling is unreachable.** The service swallows every error into a *string*:
~~~ts
} catch (error: any) { console.error('AI Chat Error:', error);
  return `Sorry, I encountered an error: ${error.message}. Please try again.`; }   // :96-99
~~~
So the component's `catch` block with its **Retry / Copy-Error** toast (`:88-119`) **can never fire** — errors render as normal assistant bubbles. No 429 handling anywhere.

**XSS: the dangerous pattern is present, the escaper is correct.** `AIChatAssistant.tsx:196-201` uses `dangerouslySetInnerHTML={{ __html: renderInlineMarkup(part) }}`. `safeMarkup.ts:64-73` **escapes the whole string first, then introduces a fixed tag set**; `escapeHtml` (`:50-51`) uses a *replacer function*, closing the `$&`/`$1` re-interpretation hole. Output is limited to `<strong>`, `<code>`, `<br />`. **This is XSS-safe as written** — the file's docstring correctly identifies the threat (a malicious repo containing an instruction to emit `<img src=x onerror=…>`) and correctly notes the app's origin holds the E2B key and sealed deploy/GitHub tokens. **However, there is no DOMPurify and no test guarding the invariant.**

### 5.4 Apply-AI-changes — undo is inconsistent and sometimes lossy

| Path | Undo saved? | Cite |
|---|---|---|
| Build-from-prompt, Apply All | ✅ `codeHistory.saveState` before mutation | `App.tsx:3021` |
| Build-from-prompt, Apply This File | ❌ **no `saveState`**, no toast | `App.tsx:3015-3019` |
| Selection op, Apply All | ✅ `saveState` + Monaco `executeEdits` | `App.tsx:3240` |
| Selection op, `onApplyFile` | ❌ **`onApplyFile: () => {}`** | `App.tsx:3238` |
| Screenshot → insert | ✅ `saveState` | `App.tsx:3086` |
| Snapshot restore diff | ❌ **`onApplyFile: () => { /* Implementation omitted for brevity */ }`** | `App.tsx:5105-5107` |
| Code Assist auto-apply | ❌ **no `codeHistory` call at all** | `codeAssistService.ts:372-378` |

`monacoSelectionHelper.ts:73-79` is correct and undo-safe (`executeEdits` under one undo group, no `forceUndoRedo`). **But** `setHtml`/`setCss`/`setJavascript` (`App.tsx:621-649`) replace the entire file-project state, which the editor receives as a new `value` — a full model replace, which **discards Monaco's undo stack**. Net: the whole-file apply path destroys Ctrl+Z; `codeHistory` is the only recovery, and it tracks only the `{html,css,javascript}` triple — it **cannot undo a selection-range edit in a React/Vue project.**

`AiDiffModal.tsx` bugs: per-file apply (`:64-69`) adds the path to `appliedFiles` unconditionally whenever `onApplyFile` exists — it cannot report failure and **does not close the modal**, so the user can apply repeatedly. Its reset `useEffect` (`:33-38`) depends on `files`, and `App.tsx` feeds it a **new array literal on every render**, so `appliedFiles` resets on any parent re-render. Stats (`:71-79`) are line-*count* deltas only — a full rewrite with identical line count shows `+0 -0`.

### 5.5 CodeRabbit — fabricated identity, fabricated metrics, file corruption

**It is not CodeRabbit.** No SDK, no `coderabbit.ai` endpoint, no CodeRabbit API.
~~~ts
const genAI = new GoogleGenerativeAI(apiKey);                       // :240
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // :241
const prompt = `You are CodeRabbit AI, an expert code reviewer…`;   // :250
~~~
Key resolution falls through CodeRabbit → Gemini → empty (`:60`), so **a genuine CodeRabbit key pasted into the UI is sent to Google and rejected.**

- **"AST Scanner" is a misnomer.** `runStaticAnalysis` (`:149-232`) is five line-by-line string heuristics: `console.log(`, `<img` without `alt`, `eval(`, bare `fetch(`/`axios.`, a secret regex. **No parsing.**
- **Weak AI failures are silent.** `:293-296` swallows JSON parse errors and returns `[]`; `CodeRabbitReviewModal.tsx:61-63` catches and only `console.error`s — the user sees a confident **"No Bugs Found!"** with zero AI coverage.
- **🔴 `applyFix` corrupts files.** `:303-321` falls back to **blind line-number replacement** (`lines[issue.line - 1] = issue.suggestedFix`) when the snippet isn't found — the model supplies the line number, so **a hallucinated line silently overwrites real code.**
- **Health score is invented.** `:127-128` — `critical*20 + warning*8 + info*2`, unrelated to any real metric.

### 5.6 Inline copilot — the best-engineered AI service

Debounce 350 ms (`:55`), **cancellation-token-aware** rather than a plain `setTimeout` (`:477-504`, with a boxed-closure trick documented at `:481-487` to avoid TDZ). Three-layer abort: single-slot controller (`:515-517`), Monaco token bridged to `fetch` (`:520`), and a hard 8 s deadline (`:521`). Cleanup guarded by `if (this.activeController === controller)` (`:572`) so a slow first request cannot null a newer controller. FNV-1a cache key, LRU-capped at 200, `enableForwardStability: true` (`:602`). **Races are effectively closed.**

Defects: the cache is **not keyed by file or provider** — two files with identical 50-line prefixes share entries. `freeInlineCompletions: () => {}` (`:274-276`) is a no-op, and Monaco has no lower bound on trigger frequency, so key-repeat can drive requests well above the typing cadence. `networkRequests`/`cacheHits` (`:86-89`) are tracked but **never rendered**. `dispose()` (`:358-369`) is labelled "not used by the app itself". Server-side: `:253-258` compares a **character** count against a **byte** constant, so non-ASCII inflates the effective cap ~3×. Errors surface only as a `title=` tooltip in the status bar — invisible until hover.

### 5.7 Vision-to-code — solid

Gemini `generateContent` with `inlineData`. MIME allow-list `image/png|jpeg|webp`; 5 MB cap checked **before** base64 work (`visionCodeService.ts:22,89`); server re-derives size from base64 length without decoding (`api/vision-to-code.js:207-211`); error mapping distinguishes 429/413/400/422/500 with actionable messages. One dead check: `:212-214` compares against `MAX_BODY_BYTES` (8 MB) > `MAX_IMAGE_BYTES` (5 MB) — unreachable. `body.userPrompt` is spliced verbatim into the prompt (`:143`) — deliberate, but an unrestricted instruction channel.

### 5.8 Voice commands — the best-engineered subsystem in the repo

**Web Speech API:** `scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null` (`:206-213`) — both standard and prefixed. `continuous` defaults to **`false`** (push-to-talk; one utterance then stop, `:787-789`). `interimResults = true` (`:378`), `maxAlternatives = 1`. Output via `SpeechSynthesis` with `cancel()` before every utterance (`:920-935`). 14 recognition languages (`:145-160`); `setLanguage` correctly **destroys and rebuilds** the instance rather than assigning `.lang` on a live one, with the reason documented (`:856-864`).

**Browser support — the fallback is genuinely excellent.** Feature detection at construction (`:326`). `startListening()` handles unsupported browsers gracefully (`:532-544`) with a real hint. In unsupported browsers the mic button is `disabled` (`:226`), status shows "Unavailable" (`:171`), a full-screen message names Chrome/Edge (`:162-163`) — **and the typed-command box is always present (`:439-471`) running the exact same `handleTranscript` pipeline (`:818-820`).** **Firefox and Safari get full command functionality by typing.** That is a real, working, well-designed accessibility fallback.

**Robustness:** handlers detached **before** `abort()` (`:513-522`) to stop a stale `onend` killing the replacement; auto-restart guarded by identity check plus `MAX_CONSECUTIVE_RESTARTS = 30` (`:469-474`); `no-speech` suppressed in continuous mode (`:434-436`); `not-allowed`/`audio-capture` treated as terminal (`:439-441`); **mic released on unmount** (`VoiceCommandPanel.tsx:90-100`) preventing Chrome's stuck-recording indicator.

**28 registered intents** (`voiceIntentRegistry.ts`), 24 advertised (28 − 2 hidden − 2 sandbox-gated): `run`, `format`, `copy`, `undo`, `redo`, `explain`, `fix`, `optimize`, `enhance_design`, `build_open`, `build`, `build_followup`, `export`, `share_link`, `save_project`, `open_modal`, `open_panel`, `validate_now`, `clear_console`, `new_file`, `open_file`, `sandbox_connect`, `sandbox_stop`, `set_language`, `toggle_theme`, `help`, `stop_listening`, `start_listening`.

**The matching engine is genuinely sophisticated:** normalization + wake-word + stacked politeness stripping (`voiceCommandParser.ts:71-104`), significant-token overlap with word-order bonus (`voiceMatcher.ts:140-178`), a crude stemmer (`:70-78`), bounded Levenshtein (`:81-101`), and three-way confidence thresholds (`EXECUTE 0.6` / `SUGGEST 0.4` / `STRONG 0.85`, `:21-29`) with a **"Did you mean…?" confirmation band** (`voiceCommandService.ts:678-709`). **That confirmation band is a meaningful safety property** given fuzzy matching can execute destructive actions.

**Defects:** 🔴 **no pre-flight gate** — the mic button renders unconditionally (`NavigationBar.tsx:210-226`) and `handleToggleVoice` (`App.tsx:3763-3779`) opens the panel regardless of `voiceState.supported`. The capability gate is **hard-wired off** (`setCapabilities({ sandbox: false })`, `App.tsx:3758-3760`), making the `sandbox_*` handlers at `:3662-3666` unreachable dead code. `set_language` and `toggle_theme` **both** claim `'switch to'`/`'change to'`, and `build` claims the very broad `'make me'`, `'i want'`, `'i need'`, `'create'` — so *"I want to fix this"* can route to `build`. The "waveform" (`:255-270`) is a **static CSS animation**, not real audio; there is no `onspeechstart` or audio-level data.

---
## 6. FEATURE HEALTH MATRIX

### 6.1 ✅ FULLY WORKING — complete, stable, properly wired

| # | Feature | Evidence |
|---|---|---|
| 1 | **Dual-mode routing & URL-as-truth** | `appRoutes.ts:150-168` no-op/replace discipline; `popstate` handler `App.tsx:2177-2244` resolves every branch without stacking entries. Dashboard never auto-opens a project. |
| 2 | **IndexedDB CRUD + project save honesty** | `saveProjectFiles` returns `persisted:false`; dirty dots clear only on confirmed commit (`App.tsx:2535-2536`); all destructive transitions flush and **block on failure**; `visibilitychange`/`beforeunload`/`pagehide` all flush. |
| 3 | **Voice command system** | 28 intents, fuzzy matcher, confidence bands with "Did you mean…?", **full typed-command fallback for Firefox/Safari**, mic released on unmount, identity-guarded auto-restart. Best-engineered subsystem in the repo. |
| 4 | **Safe Markdown rendering** | `safeMarkup.ts` escapes first, then introduces a fixed tag set; replacer function closes the `$&`/`$1` hole. Correctly reasoned, correctly documented. |
| 5 | **Inline copilot request lifecycle** | 350 ms cancellation-token debounce; three-layer abort (controller + Monaco token + 8 s deadline); identity-guarded cleanup. Races effectively closed. |
| 6 | **Code-splitting strategy** | `vite.config.ts:344-446` with documented reasoning for *why* esbuild-wasm/JSZip are unbucketed. 186.5 kB gzip initial JS. `verify:bundle` passes and enforces. |
| 7 | **Backup path validation** | `backupCrypto.validateAndNormalizeArchivePath` blocks `..`, absolute paths, drive specifiers, `\0`, `__proto__`. **A crafted backup cannot escape the project tree.** |
| 8 | **Local API path-traversal defence** | `vite.config.ts:45` regex excludes dots so traversal is *structurally* impossible, plus a second independent per-directory `startsWith` gate; constant error message prevents a filesystem oracle. |
| 9 | **`server/index.js` PTY security** | Bound to `127.0.0.1`; **fail-closed** if `TERMINAL_TOKEN` unset (`:188-193`); constant-time compare; Origin allowlist that **rejects missing Origin**; 22-var env allowlist so no API key leaks into the shell. |
| 10 | **`api/sandbox/*` E2B integration** | Real `Sandbox.create/connect/kill`; **BYO key, never stored server-side**; `redact()` strips the literal key *and* a generic `/e2b_[A-Za-z0-9]{8,}/` pattern from every log and response; `shellQuote()` throughout; path-traversal rejection on uploads; per-action rate limits; `no-store` on all responses. |
| 11 | **Mobile-preview session channel** | 192-bit CSPRNG id, sliding 30-min TTL, rate limits (120/min publish, 900/min read), 1.5 M char cap, **deliberately no CORS header** with the reason documented, graceful degradation with an honest `durable` flag. |
| 12 | **Static IDE compile + preview pipeline** | Three compilers, esbuild virtual-FS plugin, import map, runId-scoped console bridge, heartbeat-based freeze detection with Safe Mode. |
| 13 | **Template library** | 54 modules, ~40,000 lines of real, working application code. Spot-checked 5 — all substantive, none stubs. |
| 14 | **Error handling on file sync into WebContainer** (errors *are* caught) | `syncFile`, `deleteFile`, `isDependenciesInstalled` all catch — though they only `console.warn`, which production strips. *(Partially working — see §6.2.)* |

### 6.2 ⚠️ PARTIALLY WORKING / FRAGILE — happy path only

| # | Feature | Defect |
|---|---|---|
| 1 | **Backup & Restore** | ✅ Correct ZIP/SHA-256/restore-on-conflict. ❌ No encryption despite the "SHA-256 Verified / Security & Integrity" UI. ❌ Export applies no caps but restore enforces 2500/100 MB/25 MB → **self-rejecting backups**. ❌ **Green success card on total failure.** ❌ Byte caps depend on a private JSZip `_data` field and silently no-op if absent. ❌ `applicationVersion` hardcoded `'1.0.0'`. ❌ No forward compatibility. |
| 2 | **IndexedDB error handling** | `QuotaExceededError` handled; **every other failure class produces no user-visible signal**, and `null` is used for both "absent" and "failed", so transient errors are interpreted as deletion. |
| 3 | **Preview panel — open in new tab** | 🔴 **`toast` is used at `PreviewPanel.tsx:634,638` but never imported.** Confirmed present in `HEAD`. Every click throws `ReferenceError`, caught, then throws again uncaught. |
| 4 | **AI Chat Assistant** | ❌ Targets **retired** `gemini-pro`. ❌ Leaks a build-time key. ❌ No streaming. ❌ Errors swallowed into strings, making the entire Retry/Copy-Error UI unreachable. |
| 5 | **CodeRabbit Review** | ❌ Not CodeRabbit — Gemini Flash with a fabricated identity. ❌ Fabricated health score. ❌ Silent no-op on AI failure → false "No Bugs Found!". ❌ **`applyFix` fallback corrupts files via hallucinated line numbers.** |
| 6 | **Code Assist** | ❌ **Fabricates its output on failure** (`codeAssistService.ts:347-369`): a non-OK response is substituted with a mocked "intelligent" reply *and a real file write of unrelated boilerplate*. ❌ Diff stats invented (`:380`: `const addedLines = totalLines + 42;`). ❌ Seeded fake token counters (`input: 129500`). |
| 7 | **WebContainer dev-server lifecycle** | Works for the happy path. ❌ No timeout on install or server start. ❌ A `package.json` without a `dev` script → **permanent "Starting Server…" hang** (unclassified failure). ❌ Any listening port hijacks the preview. ❌ Install-complete is a substring heuristic. |
| 8 | **Preview error UI** | ❌ `onError` never fires for HTTP/DNS/CORP failures → the error banner and Retry button are **unreachable in practice**. |
| 9 | **Editor↔container sync** | ✅ Works editor → container. ❌ **No debounce** (per keystroke). ❌ **No container → editor sync at all** — the two diverge silently. |
| 10 | **FileSystemTree** | ❌ Path collisions **silently destroy** a file or an entire subtree. ❌ Never adds `scripts.dev`/`vite` to an existing `package.json`. ❌ Injects `.npmrc` + `node_modules/.bin/help` into every project. |
| 11 | **IDE switching** | ✅ Both modes work. ❌ `handleEnterVSCodeMode`/`leaveVSCodeMode` **skip `flushProjectSave()`**, unlike every other transition. ❌ `leaveVSCodeMode` clears IndexedDB **before** re-import. |
| 12 | **PWA offline** | ❌ 4 rewritten routes are outside the SW scope → never SW-controlled. ❌ The **11.65 MB** `esbuild.wasm` is **excluded** by the 8 MB cap → React/Vue bundling fails offline, while 17.3 MB of other content is precached. |
| 13 | **Deploy configuration** | ✅ COOP/COEP present on 4 paths. ❌ **Absent on `/preview/*` and `/mpreview/*`** despite both rewriting to the IDE. ❌ **Zero `Cache-Control`** anywhere — hashed immutable assets get `max-age=0, must-revalidate`. |
| 14 | **GitHub Sync & Deploy modals** | ✅ Real (JSZip + WebCrypto). ⚠️ They correctly import `credentialStore` — **the only two consumers of the one encrypted store in the repo.** |
| 15 | **SessionManager / SearchReplace** | Both fully built (611 and 630 lines) and **never mounted**. |
| 16 | **Command palette** | Ctrl+K fuzzy search works. ❌ The document-level `Enter` branch (`CommandPalette.tsx:60-64`) is an **empty block that still swallows the key**; real handling is at `:126`. |
| 17 | **Theme** | ❌ **Two competing authorities**: `useTheme` defaults to `'dark'` (`:18`) while `useSettings.theme` is pinned to `'light'` (`:108`). |

### 6.3 ❌ BROKEN / NON-FUNCTIONAL / STUBBED — with root causes

| # | Item | File:line | Root cause |
|---|---|---|---|
| **1** | 🔴 **"Open preview in new tab" always throws** | `PreviewPanel.tsx:634,638` | `toast` **never imported**. Line 634 throws inside the `try`; the `catch` calls `toast.error` again at 638 → **uncaught `ReferenceError` on every click.** Verified in `HEAD`. |
| **2** | 🔴 **`tsc --noEmit` fails — 17 errors** | repo-wide | Vite uses esbuild, which **strips types without checking them**. The compiler was never run. Breakdown: 8 × `TS6133` unused declarations; 1 × `TS2367` impossible comparison (`StackBlitzStartupLoader.tsx:55` compares against `'booting'`, a variant that does not exist); 3 × `TS2304` undefined names; 2 × `TS2345` type mismatches. |
| **3** | 🔴 **Green "Restore Completed Successfully!" on total failure** | `BackupRestoreModal.tsx:557` | Renders on any non-null `restoreResult`; **never reads `result.success` or `result.errors`.** Verified. |
| **4** | 🔴 **"Deleted" toast on a failed delete** | `App.tsx:2407` | `deleteProject` resolves `void` on failure (`projectDatabase.ts:508-512`); toast is unconditional. |
| **5** | 🔴 **"Your work is safe — we've auto-saved"** | `ErrorBoundary.tsx:109` | Rendered **unconditionally**. The emergency save reads `gbcoder_active_project_id` — **a key that exists nowhere else** (real key is `gb-coder-active-project-id`) — and `void`-discards it (`:33`). It then copies `gbcoder_snapshots` (the *manual snapshot* list), **not** the live buffer. |
| **6** | 🔴 **`container.teardown()` never called** | `src/services/webcontainer/` — 0 matches | The WASM runtime, every spawned process, and the entire virtual FS including `node_modules` live for the page lifetime. No route change, project switch, or Exit button reclaims them. Verified. |
| **7** | 🔴 **Preview popout `url` param: double-decoded + unvalidated** | `LivePreviewPopoutPage.tsx:26,31,292` | `params.get()` already decodes, then `decodeURIComponent` decodes again. No scheme/host validation. Lands in `allow-scripts allow-same-origin` iframe on a publicly-rewritten route. |
| **8** | 🔴 **AI key in the public bundle + retired model** | `aiChatAssistant.ts:30,38` | Build-time `VITE_GEMINI_API_KEY`; `model:'gemini-pro'` retired by Google. |
| **9** | 🔴 **`/api/ai` open to cross-origin billing** | `api/ai.js:715-719` | `ACAO: *` + unauthenticated `OPTIONS` 200 + in-memory-only limiter. |
| **10** | 🔴 **`onApplyFile` no-ops (2 sites)** | `App.tsx:3238` `() => {}`; `App.tsx:5105-5107` `() => { /* Implementation omitted for brevity */ }` | `AiDiffModal.tsx:64-69` still marks files "applied", so **the UI falsely claims success.** |
| **11** | ❌ **Project rename is impossible** | Dashboard has no rename prop; `updateProject` imported at `App.tsx:65` and **never called**; the only rename UI lives in `ProjectBar.tsx`, which has 0 references. | Dead import chain. |
| **12** | ❌ **Project duplicate is impossible** | `duplicateProject` (`projectDatabase.ts:554-600`) — called from nowhere. | |
| **13** | ❌ **`SandboxPanel` never mounted** | 577 lines exported at `fullstackFeature.ts:14`; `App.tsx:143-145` destructures **only** `VSCodeMode`. | Misleading — a naive grep reports it wired. |
| **14** | ❌ **`CodeWriteConfirmationModal` orphaned** | 194 lines, 0 imports. Its text claims *"This cannot be undone (unless you have history saved)"* — **contradicting the `codeHistory` snapshot that is in fact taken.** | |
| **15** | ❌ **`ExtensionsMarketplace` is a "Coming Soon" panel** | `ExtensionsMarketplace.tsx:42,48,92,108`; rendered at `App.tsx:4689`. Only `onClose` is real. | |
| **16** | ❌ **`VSCodeMode` snapshot Preview is a no-op** | `VSCodeMode.tsx:2534` `onPreview={() => {}}` — the same prop **is** implemented at `App.tsx:5098`. | |
| **17** | ❌ **`syncToCloud` returns a hardcoded `false`** | `useProject.ts:187-188` `// No-op: cloud sync removed` | |
| **18** | ❌ **VS Code mode UI contains fabricated panels** | Outline prints *"Active symbol structure: {path}"* (`VSCodeMode.tsx:1344`); Timeline prints *"Workspace file history active"* (`:1360`); PROBLEMS hardcodes count `0` (`:1876`); Ports hardcodes `"Vite Dev Server"` + `5173` (`:1427`); OUTPUT prints static text (`:2274`); "Split Terminal" only toasts (`:1930`); `CodeAssistPanel.tsx:128` hardcodes a **`13%`** context badge; `:546-561` fires unconditional *"Safe execution sandbox: WebContainer verified"* and *"Enhanced AI reasoning mode enabled"* toasts **even when WebContainer is unsupported**. | Trust-destroying. |
| **19** | ❌ **Fake UI affordances** | `CodeAssistPanel.tsx:269` RECENT row `onClick={() => {}}`; `:37,474-478` `deprecated?` flag rendered but **no mode is ever marked deprecated**; `:434` placeholder advertises *"`@` to mention files"* with **no mention implementation**; `:546-561` three buttons that only toast; `KeyboardShortcutsHelp.tsx:167` "Customizable (Coming Soon)" on a non-interactive `<span>`. | |
| **20** | ❌ **`/preview/*` and `/mpreview/*` lack COOP/COEP** | `vercel.json:18-19` rewrite them to the IDE; no `headers` rule covers either. | Shared links and QR previews may be non-isolated → WebContainer dead. |
| **21** | ❌ **`sitemap.xml` and `favicon.ico` never reach `dist/`** | `build-unified.mjs:121-129` copies robots.txt but not sitemap.xml; the favicon guard reads `public/favicon.ico` but the file is at **repo root**. Verified post-build: both **MISSING**. | robots.txt advertises two sitemap URLs that **404**. |
| **22** | ❌ **~13,966 lines of dead code across 37 files** | See §2.6 for the full list with per-file proof. Largest: `templateService.ts` **3,240 lines** (12 templates), `ColorPicker.tsx` 807, `codeTemplatesService.ts` 714, `SearchReplaceModal.tsx` 630, `SessionManager.tsx` 611, `SandboxPanel.tsx` 577, `externalToolsService.ts` 547, `debugToolsService.ts` 550, `sessionDataService.ts` 526, `performanceAnalyticsService.ts` 524, `securityService.ts` 506, `autoCompleteService.ts` 413, `errorLogging.ts` 131. | |
| **23** | ❌ **`errorLogging.ts` is never imported** | `errorLogging.ts:115,128` install global handlers — **they are never installed.** `AppWrapper.tsx:2` Vercel Analytics is what actually runs. | Global error capture does not exist. |
| **24** | ❌ **No test gate of any kind** | 0 test files · 0 test runners · **no `test` script** · 1 CI workflow (an AI PR reviewer) · `build-unified.mjs`'s 7 safety gates never run in CI. | |
| **25** | ❌ **`useAppShortcuts` omits two dependencies** | `useAppShortcuts.ts:88` lists 4 of 6 callbacks; `onOpenCommandPalette`/`onOpenShortcutsHelp` are used at `:64,:67,:46,:49` but omitted. | Currently masked only because the four listed props are inline arrows at `App.tsx:2616-2627`, so the effect re-subscribes every render. |
| **26** | ❌ **Header tests validate a config that doesn't exist in production** | `coep-resource-tests.mjs:55-64` asserts `crossOriginIsolated === true` at `/`; `preview-combined.mjs:67-68` sets COOP/COEP **globally**, stricter than `vercel.json`. | The one test guarding COEP cannot fail in production. |
| **27** | ❌ **`api/sandbox` rate limits are per-instance** | `_shared.js:60-78` uses an in-memory `Map`; every Vercel cold start is a fresh bucket. | The `create: 5/min` cap is decorative in production. Acknowledged at `:36-41`. |
| **28** | ❌ **`sandboxTerminal` has zero consumers** | `connect()`/`isAvailable()`/`subscribe()` implemented at `:66-80`; never called. | A full HTTP command runner with `terminalSafety` is unreachable. |
| **29** | ❌ **`credentialStore.ts` has zero consumers** | The only AES-GCM store in the repo. Its header claims feature services use it; **none do.** | AI keys are plaintext in localStorage. |
| **30** | ❌ **Backup restore drag-and-drop does nothing** | `BackupRestoreModal.tsx:388` says *"Select **or drop**"*; no `onDrop`/`onDragOver` handler exists. | |
| **31** | ❌ **Timer/listener leaks** | `useEditorActions.ts:59,67` (2 s toasts); `useValidation.ts:75-78` (1.5 s ceiling); `PreviewPanel.tsx:466` (300 ms); `VSCodeMode.tsx:985,2090`; `livePreviewChannel.ts:43-80` (storage listener never removed); `TerminalTab` shell kill + queued-command clear missing. | |
| **32** | ❌ **`localShell.ts` is a simulator, not a shell** | `runLocalCommand` parses against a static table; no process, no filesystem, no exit codes. | Honestly labelled in UI, but a capability named "Terminal". |
| **33** | ❌ **`localStorage` writes on every cold start** | `useProject` → `initializeDefaultProject()` → `projectStore.ts:252-259` creates an `'Untitled Project'` row each load. | Pure waste + quota pressure. |
| **34** | ❌ **`PreviewPanel` dead execution-timeout code** | `MAX_EXECUTION_TIME = 5000` and `checkTimeout()` are defined **inside the generated iframe string but never called** (`:404-410`). | A "5 second execution timeout" that does nothing. |
| **35** | ❌ **`Analytics` GA4 placeholder** | `utils/analytics.ts:11` `GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'` — dead module anyway. | |
| **36** | ❌ **`.mjs` scripts and all backend JS unlinted/untyped** | `eslint.config.js:11` `files: ['**/*.{ts,tsx}']`; `tsconfig.app.json:23` `include: ["src"]`. | 21 API handlers, `server/index.js`, 65 scripts: zero static analysis. |
| **37** | ❌ **6 of 17 documented env vars are dead** | `VITE_ENABLE_AI_SUGGESTIONS`, `VITE_ENABLE_EXTERNAL_LIBRARIES`, `VITE_DEV_PORT`, `VITE_GA4_MEASUREMENT_ID`, `VITE_VERCEL_ANALYTICS_ID` — **all 0 references** (verified). Conversely `UPSTASH_REDIS_REST_URL/TOKEN` and `TERMINAL_TOKEN` are **required but undocumented**. | Missing Redis → `/api/share` + `/api/preview` 503; missing token → terminal permanently dead. |

### 6.4 Marker sweep — the codebase is marker-clean

Exact-case, repo-wide:

| Marker | Hits |
|---|---|
| `TODO` | **0** |
| `FIXME` | **0** |
| `HACK` | **0** |
| `XXX` | 2 — both GA placeholders (`utils/analytics.ts:2,11`) |
| `not implemented` | **0** (but 2 no-op stubs literally say *"Implementation omitted for brevity"* — `App.tsx:5106`) |
| `Coming soon` | 6 — 4 in `ExtensionsMarketplace`, 1 in `KeyboardShortcutsHelp`, 1 in the dead `SandboxPanel` |
| `WIP` | 2 — template *content* (Kanban column limits), not markers |

**This is the audit's central paradox.** The absence of markers, combined with extensive confident explanatory prose, makes the codebase *read* as finished. A reviewer scanning for `TODO` would conclude the work is complete. It is not: `tsc` reports 17 errors, ~13,966 lines are dead, and 37 numbered defects above are live.

---

## 7. PERFORMANCE, MEMORY & SECURITY AUDIT

### 7.1 Memory & resource leaks

| Leak | Severity | Detail |
|---|---|---|
| **`container.teardown()` never called** | 🔴 Critical | WASM runtime + all processes + entire virtual FS (`node_modules` included) persist for the page lifetime. Nothing reclaims them without a full reload. |
| **`jsh` PTY + dev server survive unmount** | 🔴 Critical | `TerminalTab.tsx:752-764` disconnects listeners but never kills the process. |
| **E2B sandbox + 2.5 s poll loop survive panel unmount** | 🔴 Critical — **billable** | `SandboxPanel` has **no `useEffect` at all**. The sandbox stays alive and the poll loop keeps POSTing to `/api/sandbox/logs` forever. |
| **`shellOutputBuffer` — 500 chunks, no byte cap** | 🟠 Medium | Unbounded memory, fully replayed into every reconnecting terminal. |
| **HMR listener accumulation** | 🟠 Medium | Each HMR cycle attaches 3 more listeners to the shared container; prior `eventUnsubscribers` are never invoked. |
| **Untracked `runCommand()` process** | 🟠 Medium | No kill handle, no timeout. `DependenciesPanel.tsx:310`. |
| **Stray `setTimeout`s after unmount** | 🟡 Low | 6 sites across `useEditorActions`, `useValidation`, `PreviewPanel`, `VSCodeMode`. |
| **`livePreviewChannel` storage listener** | 🟡 Low | Registered at construction, never removed. |
| **`setState` after unmount in restart IIFE** | 🟡 Low | `TerminalTab.tsx:499-583` has no `AbortController` or mounted flag. |

**Blob URL management is correct:** `projectArchiveService.ts:471,482` pairs `createObjectURL` with a `revokeObjectURL` timeout. This is the one resource-lifecycle pattern done properly. (Minor: the 1000 ms fixed delay can truncate a slow download.)

**Monaco editor instances** are managed by `@monaco-editor/react` with a single editor per surface; `editorNavigator` maintains a registry. No double-mount defect found in `CodeEditor`/`MultiFileEditor`.

### 7.2 Bundle size & code-splitting

**Strengths:** 186.5 kB gzip initial JS. 65 lazy chunks. `verify:bundle` enforces that JSZip, xterm, the import engine, prettier, esbuild-wasm, the TS compiler, qrcode.react, the E2B client, and VS Code mode are all **absent from the critical path**. The `manualChunks` rationale is documented in comments that explain *why* each decision was made and what regressed previously.

**Bottlenecks:**

| Asset | Size | Issue |
|---|---|---|
| `esbuild-*.wasm` | **11.65 MB** | Excluded from precache; blocks offline React/Vue |
| `ts.worker-*.js` | 5.87 MB | Precached |
| `typescript-compiler-*.js` | 3.44 MB | Precached |
| **`TemplateSelectorModal-*.js`** | **2.68 MB / 606 kB gzip** | **All 54 templates statically imported into one modal chunk.** Should be split per category. |
| `css.worker-*.js` | 985 kB | |
| `formatter-*.js` (prettier) | 874 kB | |
| `vue-compiler-*.js` | 778 kB | |
| **`diff-tools-*.js`** | 17.5 kB | 🔴 **On the critical path** despite only being used by the lazy `AiDiffModal` — a static edge is pulling it in. |

**Total `dist/app` = 28.9 MB. PWA precache = 17.3 MB (74 entries).** A 17 MB precache is a multi-megabyte download on first visit for an app that cannot function offline anyway.

**`dist-staging/` is not cleaned on success.**

### 7.3 Client-side security

| Vector | Status |
|---|---|
| **`dangerouslySetInnerHTML`** | **1 site** — `AIChatAssistant.tsx:200`, fed by `renderInlineMarkup` which **escapes first then introduces a fixed tag set**. ✅ Safe as written; ⚠️ no DOMPurify and **no test guarding the invariant**. |
| **`eval()` in preview** | `PreviewPanel.tsx:418-419` — user JS is stringified and `eval`'d inside an `iframe.srcdoc`. **By design.** Compensating controls: in-document CSP (`:356`), CSS sanitizer (`:231-239`), `</script` escaping (`:241-243`). |
| **Preview iframe sandbox** | `allow-scripts allow-same-origin` — ⚠️ **documented as not a real sandbox** (`PreviewPanel.tsx:970-1003`) because five shipped templates need `localStorage`. Same attributes on the WebContainer iframe (`VSCodeMode.tsx:2243,2455`). |
| **Preview popout URL** | 🔴 **Double-decoded, unvalidated, `data:`/`https:` accepted** → `LivePreviewPopoutPage.tsx:26,31,292`. Attacker-controlled script in a full-featured frame. |
| **Cross-origin CDN injection** | ✅ `externalLibraryService.ts:104,109` and `utils/projectExport.ts:13,18` add `crossorigin="anonymous"`, forcing CORS mode so CORP is satisfied via `ACAO`. ⚠️ One exception: `customInjectionService.ts:106` injects a Google Fonts stylesheet **without** `crossorigin`. |
| **Backup restore** | ✅ Path traversal blocked; prototype-pollution guarded (depth-capped). ⚠️ `manifest.projects[].id` is never path-validated and becomes an IndexedDB primary key. |
| **Local API dispatcher** | ✅ Regex + per-directory `startsWith`; loopback-only (`vite.config.ts:66-71,95-99`); 10 MB body cap; constant 500 message. |
| **Google Fonts under COEP** | ⚠️ `index.html:46-48` — **no `crossorigin`, no local fallback.** A single third-party CORP header flip removes all page typography and makes the IDE unusable. |
| **Secrets in git** | ✅ `.env` is **not tracked** (`git ls-files --error-unmatch .env` → not known to git). No `sk-` patterns in history. |
| **Stray committed binaries** | ⚠️ `preview_popout_test.png` and `tghjkl.jpeg` (repo root, duplicated in `public/`) are committed. `project_files.zip` (5.3 MB) is untracked but present in the working tree. |

### 7.4 Server-side security

| Control | Status |
|---|---|
| `server/index.js` PTY | ✅ Loopback-bound, fail-closed on missing token, constant-time compare, Origin allowlist rejecting missing Origin, 22-var env allowlist. ⚠️ No session cap, no idle timeout, no output cap. ⚠️ `express-rate-limit` declared (`server/package.json:16`) but **never mounted**. |
| `/api/ai`, `/api/vision-to-code`, `/api/ai/inline-completion` | 🔴 **`ACAO: *` + unauthenticated preflight. In-memory-only rate limits. BYO-key override lets any caller force the operator's key.** 502 responses leak `provider.keyEnvName`. |
| `/api/share` | ✅ Per-IP Redis rate limit (10/h), 8 MB body / 6 MB payload caps, environment-aware IP extraction. ⚠️ **Read path (`api/preview.js`) has no rate limit and is CORS `*`.** ⚠️ Stored content is served **unsanitised, same-origin** — arbitrary HTML/JS executes under `code.ladestack.in` with no CSP. ⚠️ **No deletion endpoint**; shares are immutable for 30 days. |
| `/api/preview/sync` | ✅ 192-bit id, sliding TTL, rate limits, size cap, **deliberately no CORS**, `no-store`. ⚠️ Degrades to in-process `Map` without Redis — on serverless, publish and read must hit the same warm instance. |
| `/api/sandbox/*` | ✅ BYO key, `redact()` on every log/response, `shellQuote()` throughout, upload path-traversal rejection, per-action rate limits, `no-store`. ⚠️ Rate limits per-instance. ⚠️ `exec.js` `cwd` lacks the `..` rejection that `start.js` enforces. |
| **Vercel function count** | ⚠️ **12 / 12 — exactly at the Hobby limit, zero headroom.** One more `.js` in `api/` breaks deploy *at upload*, after a green build. This has already happened once (the comment at `vite.config.ts:110-117` records a pair of handlers pushing the count to 14 and failing every deploy). |
| **`maxDuration: 120`** | ⚠️ Exceeds Vercel Hobby's 60 s cap; the repo's own validator flags it as "requires Pro/Enterprise". |
| **Caching** | ⚠️ No `Cache-Control` in `vercel.json` at all — hashed immutable assets get `max-age=0, must-revalidate`. |

---

## 8. ENTERPRISE-GRADE GAP ANALYSIS & UPGRADE ROADMAP

### 8.1 P0 — Ship blockers (1–3 days each; must precede any public launch)

| # | Action | Effort | Rationale |
|---|---|---|---|
| **P0-1** | **Add `tsc --noEmit` to CI and fix all 17 errors.** Import `toast` in `PreviewPanel.tsx`; import `EditorStyle`/`ProjectType` in `backupRestoreService.ts`; remove the 8 unused declarations; fix the impossible comparison at `StackBlitzStartupLoader.tsx:55`. | ~2 h | The compiler is currently never run. This is the single highest-leverage change in the entire audit — it catches an entire class of defect for free, forever. |
| **P0-2** | **Remove `VITE_GEMINI_API_KEY` from the client.** Route all Gemini traffic through `/api/ai` (or a new `/api/gemini`) using server-side `GEMINI_API_KEY`. | ~4 h | A paid credential is in the public bundle. |
| **P0-3** | **Fix the AI model ID.** `gemini-pro` → `gemini-1.5-flash` (or migrate to the current GenAI SDK). | ~15 min | AI Chat is 100 % broken today. |
| **P0-4** | **Lock down `/api/ai`.** Remove `ACAO: *` or replace with an explicit origin allowlist; add a shared-secret or session check; move rate limiting to Upstash Redis; add a global spend circuit-breaker; strip `provider.keyEnvName` from error bodies. | ~1 day | Any website can currently drain the operator's key. |
| **P0-5** | **Add COOP/COEP headers for `/preview/(.*)` and `/mpreview/(.*)`** in `vercel.json`, and add those paths to `verify-deploy-config.mjs`. | ~15 min | Shared links and QR previews may currently render a non-isolated, non-functional IDE. |
| **P0-6** | **Make save/delete/restore/export honest.** (a) `deleteProject` returns `boolean`, toast accordingly. (b) `BackupRestoreModal` reads `result.success`/`result.errors`. (c) `ErrorBoundary` only claims a successful save when `setItem` returned. (d) `App.tsx` toasts on non-quota storage failures. | ~3 h | Four independently-verified false-success paths. This is a *trust* defect class, not a cosmetic one. |
| **P0-7** | **Fix `dist/favicon.ico` and `dist/sitemap.xml`.** Move `favicon.ico` into `public/`, add a sitemap copy step in `build-unified.mjs`, and reconcile the four conflicting canonical domains (`gbcoder.com` vs `code.ladestack.in`). | ~1 h | Two 404s on the live site today. |
| **P0-8** | **Wire the 4 documented-but-required env vars** into `.env.example`: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `TERMINAL_TOKEN`, `NVIDIA_BASE_URL`. Remove the 5 dead vars. | ~30 min | Missing Redis silently 503s sharing; missing token silently kills the terminal. |

### 8.2 P1 — Correctness & data integrity (1–2 weeks)

| # | Action | Rationale |
|---|---|---|
| P1-1 | **Implement IndexedDB `onversionchange`** (close the connection) in both databases, and add a real `oldVersion`-driven migration harness. | Today a second tab silently disables persistence for the whole session. |
| P1-2 | **Request durable storage.** `navigator.storage.persist()` on first project creation; surface `estimate()`/`persisted()` in Settings. | Eviction can delete both databases with no warning. |
| P1-3 | **Distinguish "absent" from "failed".** Introduce a `Result<T>` return for `getProject`/`listProjects`/`readProjectFiles`, and never treat an error as deletion. | Four data-loss scenarios trace to this conflation. |
| P1-4 | **Add cross-tab coordination.** `BroadcastChannel` for file-write locks + optimistic version stamps on `ProjectRecord`. | Silent whole-file clobbering across tabs. |
| P1-5 | **Call `container.teardown()`** on mode exit / project switch / `beforeunload`, and track spawned processes in a disposable registry with `kill()` on cleanup. | The largest resource leak in the app. |
| P1-6 | **Add a `useEffect` cleanup to `SandboxPanel`** that calls `sandboxSession.close()`. | A live billing leak. |
| P1-7 | **Flush `pendingProjectSave` in `handleEnterVSCodeMode` and `leaveVSCodeMode`**, and clear the IndexedDB workspace *after* a successful re-import. | Two concrete data-loss windows on mode switch. |
| P1-8 | **Make container→editor sync bidirectional.** Debounced `fs.watch` + reconcile, with the editor as an explicit conflict resolver. | The editor and runtime currently diverge silently. |
| P1-9 | **Validate `package.json` before auto-start.** Ensure a `dev` script exists; synthesize `vite` when missing; add a hard timeout + watchdog on `starting_server`. | The permanent "Starting Server…" hang. |
| P1-10 | **Detect the dev-server port from stdout**, not from the first `port` event. Restrict accepted origins. | Any listening port hijacks the preview. |
| P1-11 | **Validate the popout `url`.** Remove the second `decodeURIComponent`; allowlist `https:` and the known WebContainer origin; drop `allow-same-origin` where the source is cross-origin. | Attacker-controlled script today. |
| P1-12 | **Fix backup asymmetry.** Apply the same caps on export as on restore; replace the private JSZip `_data` size probe with a documented, version-pinned measurement; make `applicationVersion` real. | Users can create backups they cannot restore. |
| P1-13 | **Add a project rename + duplicate UI.** Wire the existing `updateProject` and `duplicateProject` (both already written and verified correct). | A 47-line atomicity-corrected function is sitting unused. |
| P1-14 | **Fix `filesToFileSystemTree` collisions** — return an explicit conflict error instead of silently overwriting. | Silent data destruction. |

### 8.3 P2 — Architecture & maintainability (3–6 weeks)

#### P2-1: Decompose the `App.tsx` god component

`App.tsx` is **5,155 lines** with **58 `useState`, 29 `useEffect`, 56 `useCallback`**. This is the root cause of most correctness risk in the codebase. Recommended target structure:

~~~text
src/app/
├── AppShell.tsx                 layout, providers, Suspense
├── routing/
│   ├── useRoute.ts              single source of truth for route → view
│   └── routes.ts                (existing appRoutes.ts, extended)
├── features/
│   ├── projects/
│   │   ├── useProjectRegistry.ts   list + CRUD + refresh events
│   │   ├── useProjectSession.ts    the active project, open/close/switch
│   │   ├── useProjectPersistence.ts  debounce, flush, dirty baseline
│   │   └── useProjectLifecycle.ts    autosave, unload, visibility
│   ├── editor/
│   │   ├── useStaticEditor.ts
│   │   └── usePreviewChannel.ts
│   ├── vscode/
│   │   ├── useIdeMode.ts           enter/leave/switch, flush-before-transition
│   │   └── useWorkspaceStore.ts
│   ├── ai/  voice/  backup/  share/  import/  deploy/
└── ui/  (extracted dumb components)
~~~

**Extract first (highest value, lowest risk):** `useProjectPersistence` (~250 lines, the debounce/flush/dirty logic) and `useIdeMode` (~150 lines, the enter/leave switch). These two own the data-loss windows.

#### P2-2: Adopt a state-management strategy deliberately

There is **no** Redux/Zustand/Jotai — state is 58 `useState` + refs. That is defensible for this app, but the current structure has no state *ownership boundary*. Recommendation: **keep local state local, introduce context only for the three genuinely shared domains** (project session, settings, theme). Do **not** migrate to a global store wholesale — it would add ceremony without fixing the ownership problem.

#### P2-3: Introduce a real error-handling taxonomy

Replace `console.error` + toast with three explicit classes:

| Class | Meaning | Required behaviour |
|---|---|---|
| `Recoverable` | operation failed, state intact | toast + retry affordance + retry counter |
| `PersistenceFailure` | in-memory state intact, storage write failed | **persistent banner**, not a toast; block destructive transitions |
| `Fatal` | unrecoverable | error boundary with a real recovery path (not just reload) |

This directly eliminates the false-success class (§6.3 items 3–5).

#### P2-4: Delete the dead code

Remove **~13,966 lines across 37 files** (§2.6). Before deleting `templateService.ts` (3,240 lines, 12 templates), decide whether to **port** those templates into the live registry — they may still be worth keeping as content. Everything else in the list should be deleted outright; it is maintenance surface with no runtime value.

Note: `SandboxPanel` + `sandboxSession` + `sandboxTerminal` together are ~1,700 lines. Either mount them (E2B is a genuinely differentiated feature) or delete them. Shipping a billing-metered E2B client that can never be opened is the worst of both.

#### P2-5: Consolidate the two theme authorities, the three validators, and the two settings keys

- One theme authority (`useTheme`), with `useSettings.theme` removed.
- `codeValidationService.ts` (407 lines, orphan) vs `validationService.ts` (live) — delete the former.
- `SETTINGS_STORAGE_KEY` is read via a hardcoded string in `selectionOperationsService.ts:59`; use the exported constant everywhere.
- `screenshotService.ts` (260, orphan) vs `captureService.ts` (live) — delete the former.

### 8.4 P3 — Testing strategy (start immediately; this is the compounding gap)

**Current state: 0 test files, 0 test runners, no `test` script, no CI gate.** This is the single largest structural gap. The ~30 `audit:*` scripts are genuinely valuable but **opt-in, manual, and never run in CI** — and the build's own 7 safety gates never run either.

**Recommended stack:** **Vitest** (unit/component) + **Playwright** (E2E, already installed at 1.62.0 and used by ~10 existing scripts).

#### Phase 1 — Foundations (week 1)
- Add `vitest`, `@testing-library/react`, `jsdom`, `fake-indexeddb`.
- Add `"typecheck": "tsc -p tsconfig.app.json --noEmit"`, `"test": "vitest run"`.
- Add a `.github/workflows/ci.yml`: `npm ci` → `lint` → `typecheck` → `test` → `build` → run `build-unified.mjs`'s 7 gates → `verify:bundle` → `verify:deploy`.

#### Phase 2 — Unit tests on pure logic (weeks 2–3)
Highest value per hour, all already pure and testable:
- `backupCrypto.validateAndNormalizeArchivePath` — **traversal, `__proto__`, drive specs, absolute paths.** A security-critical function with zero tests.
- `appRoutes.ts` — every predicate against every path (the file is explicitly written to be testable: "the route helpers stay pure when given an explicit pathname, so they are unit-testable in Node").
- `voiceMatcher.ts` / `voiceCommandParser.ts` — 28 intents × synonyms × the 3 confidence bands.
- `inlineCopilotService` cache/abort logic.
- `bundlerService` virtual-FS resolver — bare specifiers, relative resolution, extension fallback.
- `safeMarkup.escapeHtml` / `renderInlineMarkup` — **including the `$&`/`$1` re-interpretation regression.** A security invariant with no test is one refactor away from an XSS.

#### Phase 3 — Integration tests on persistence (week 4)
- Backup → restore → re-export round-trip, asserting byte equality of file contents.
- Restore **failure** paths: corrupt ZIP, missing manifest, wrong version, duplicate IDs, mid-restore quota failure → assert the UI shows **failure**, closing §6.3-3.
- IndexedDB: `onblocked` → assert the user is told, closing §3.2.
- `deleteProject` failure → assert no success toast, closing §6.3-4.

#### Phase 4 — Playwright E2E (weeks 5–6)
Convert the existing manual scripts into CI-gated specs:
- `e2e-project-flow.mjs` → project create → edit → reload → assert persistence.
- `backup-restore-tests.mjs` / `e2e-backup-restore.mjs` → full round-trip.
- `workspace-reliability-tests.mjs` → open project → edit → switch → reload → assert zero loss.
- `coep-resource-tests.mjs` → **rewrite to test against the real `vercel.json` header matrix**, closing §6.3-26.
- A **WebContainer smoke test** that boots, runs a trivial `npm install`, and asserts the preview iframe reaches a 200 — run nightly, not per-PR (WebContainers are slow and flaky in CI).

#### Phase 5 — Visual regression (week 7+)
Playwright snapshots for dashboard, static editor, VS Code mode, and each modal. Cheap to add once the harness exists.

**Coverage target:** ≥70 % lines on `services/` and `utils/`; ≥50 % on `components/`; **100 % on `safeMarkup`, `backupCrypto`, `appRoutes`, and `terminalSafety`.**

### 8.5 P4 — Offline PWA & performance (parallel track)

1. **Split `TemplateSelectorModal` per category** — 2.68 MB → ~150 kB per category.
2. **Break the `diff-tools` static edge** so the 17.5 kB diff chunk is properly lazy.
3. **Self-host fonts** with `font-display: swap` and preload — removes the single highest COEP fragility (§7.3).
4. **Re-scope the PWA.** Either commit to real offline (raise `maximumFileSizeToCacheInBytes` and accept an ~29 MB precache, or drop the esbuild path offline) or **remove the PWA entirely** and stop paying 17.3 MB for installability branding. The current middle state is the worst of both.
5. **Register SWs for the rewritten routes**, or redirect `/preview/*` and `/mpreview/*` into `/app/` so the SW scope covers them.
6. **Add `Cache-Control` to `vercel.json`:** `public, max-age=31536000, immutable` for `/app/assets/*`; `no-cache` for `index.html` and `sw.js`.
7. **Remove `dist-staging/`** after a successful build.
8. **Cut `ts.worker` (5.87 MB) and `typescript-compiler` (3.44 MB)** by serving Monaco's workers from a CDN only when cross-origin-isolated, or by lazy-loading them on first TypeScript use only.

### 8.6 P5 — SEO & Astro integration (parallel track)

The marketing site is a **192-word POC** with no canonical, no OG/Twitter, no JSON-LD, and no sitemap at deploy root.

1. **Immediate (1 day):** add `rel=canonical`, full OG + Twitter card set, `theme-color`, and a `<script type="application/ld+json">` block for `WebApplication` + `Organization` + `SoftwareApplication`. Add `@astrojs/sitemap` and set `site:` in `astro.config.mjs`.
2. **Delete `src/utils/seo.ts`** (296 lines, zero consumers) **or port its JSON-LD into Astro.** It currently targets the uninstalled `react-helmet` and contains a **fabricated `aggregateRating: 4.8/150`** — a Google structured-data policy violation if ever wired up.
3. **Expand the marketing site** to a real content surface: features, templates gallery, docs index, blog/changelog, pricing or an explicit "free forever" statement, FAQ, and an honest privacy page explaining that projects live in the user's browser.
4. **Unify the canonical domain** across `robots.txt`, `sitemap.xml`, `seo.ts`, `index.html`, and `api/share.js` — there are currently **four** (`gbcoder.com`, `code.ladestack.in`, `ladestack.in`, plus the `og:url` in `index.html`).
5. **Add real OG imagery.** `tghjkl.jpeg` is a stray 15 KB root-level duplicate, not a social card.
6. **Stop shipping the 7 React legal/marketing pages** in the SPA if the marketing site will own them — or keep them and remove the duplicate `LegalPageLayout` (dead).

### 8.7 P6 — Security hardening (ongoing)

1. **Move every AI key out of localStorage.** `credentialStore.ts` already implements AES-GCM correctly — **use it.** Fix its "key in localStorage next to ciphertext" limitation by deriving the key from a user passphrase or a non-extractable `CryptoKey`.
2. **Remove the `body.apiKey` override** in `api/ai.js`, or gate it behind an explicit "bring your own key" opt-in with per-user rate limiting.
3. **Add a CSP** to the app shell. The preview document already has an in-document CSP (`PreviewPanel.tsx:356`) — extend that discipline to the shell.
4. **Sandbox the share page.** `/preview/:id` renders untrusted, unauthenticated, unsanitised HTML/JS **same-origin** under `code.ladestack.in`. Serve it from a dedicated origin, or apply a strict CSP + `sandbox="allow-scripts"` **without** `allow-same-origin`.
5. **Add rate limiting to `api/preview.js`** (currently CORS `*`, unlimited GETs) and **a delete endpoint** so users can revoke leaked share links.
6. **Add session caps, idle timeouts, and output limits** to the PTY WebSocket; mount `express-rate-limit` or delete the unused dependency.
7. **Move `api/sandbox` rate limiting to Redis** so the 5/min create cap survives cold starts.
8. **Run `npm audit` in CI** and fail on high/critical advisories. There is currently no dependency scanning.
9. **Add secret scanning** (e.g. `gitleaks`) to CI. `.env` is correctly untracked today, but nothing prevents a future commit.

### 8.8 Recommended delivery sequence

| Phase | Duration | Outcome |
|---|---|---|
| **Phase A — Stop the bleeding** | 3 days | P0-1 → P0-8. The build typechecks, no credential is public, `/api/ai` is locked down, shared links work, and no UI lies about success. |
| **Phase B — CI gate** | 3 days | Vitest installed, `ci.yml` enforcing lint + typecheck + test + build + bundle/deploy verification, with the build's own 7 gates running in CI for the first time. |
| **Phase C — Correctness** | 2 weeks | P1-1 → P1-14. Data loss is structurally eliminated; resources are reclaimed. |
| **Phase D — Decomposition** | 4 weeks | P2-1 → P2-5. `App.tsx` below 1,000 lines; dead code gone; error taxonomy adopted. |
| **Phase E — Test depth** | 4 weeks (parallel with D) | Test phases 2–5. ≥70 % on services. |
| **Phase F — Surface** | 3 weeks | P4 + P5. SEO real, PWA honest, bundle halved. |

### 8.9 What is genuinely excellent and should be preserved

An honest audit must say this clearly. GB Coder contains engineering that is **well above typical for a project of this size**, and it must not be lost in a refactor:

1. **The `vite.config.ts` `manualChunks` commentary** — it explains *why* each decision was made and documents the specific regressions that motivated removing `critical-ui`/`deferred-components`. This is the kind of comment that prevents the next person from reintroducing the bug.
2. **`appRoutes.ts`** — a no-router design decision, documented, with `navigateReplace` added specifically so Back never stacks duplicate entries.
3. **`safeMarkup.ts`** — correctly identifies a non-obvious indirect-prompt-injection XSS, correctly explains why the original `.replace()` chain was broken, and correctly notes a full markdown renderer would reintroduce the hole.
4. **The project-save honesty in `App.tsx`** — dirty dots clearing only on a confirmed commit, every destructive transition flushing and blocking on failure. Exemplary.
5. **The voice command system's typed-command fallback** — a real, working accessibility path for Firefox/Safari, implemented by routing both inputs through the identical pipeline.
6. **`server/index.js`'s fail-closed terminal** — refusing the upgrade outright when `TERMINAL_TOKEN` is unset is the correct default.
7. **`api/sandbox/_shared.js`'s `redact()`** — stripping both the literal key and a generic pattern from every log line and response body.
8. **`vite.config.ts`'s API-route regex** — excluding `.` from the character class makes traversal *structurally* impossible rather than merely unlikely, with a second independent per-directory gate and a constant error message to prevent a filesystem oracle.
9. **`build-unified.mjs`'s 7 post-build gates** — including "no IDE runtime deps in the marketing HTML". They work; they just never run in CI.
10. **The 54-template library** — ~40,000 lines of genuinely working, well-crafted example applications. This is the product's most valuable asset after the compiler pipeline.

---

## 9. APPENDICES — VERIFIED COMMAND OUTPUT

### A1. `npx tsc -p tsconfig.app.json --noEmit` — **exit 2, 17 errors**

~~~
src/App.tsx(65,3): error TS6133: 'updateProject' is declared but its value is never read.
src/components/Console/TerminalTab.tsx(16,3): error TS6133: 'WebContainerStatus' is declared but its value is never read.
src/components/PreviewPanel.tsx(634,9): error TS2304: Cannot find name 'toast'.
src/components/PreviewPanel.tsx(638,7): error TS2304: Cannot find name 'toast'.
src/components/projects/ProjectDashboard.tsx(77,9): error TS6133: 'isDark' is declared but its value is never read.
src/components/vscode/StackBlitzStartupLoader.tsx(9,3): error TS6133: 'FolderSync' is declared but its value is never read.
src/components/vscode/StackBlitzStartupLoader.tsx(10,3): error TS6133: 'PackageCheck' is declared but its value is never read.
src/components/vscode/StackBlitzStartupLoader.tsx(11,3): error TS6133: 'Server' is declared but its value is never read.
src/components/vscode/StackBlitzStartupLoader.tsx(12,3): error TS6133: 'Cpu' is declared but its value is never read.
src/components/vscode/StackBlitzStartupLoader.tsx(55,5): error TS2367: This comparison appears to be unintentional because the types
    '"error" | "ready" | "idle" | "runtime_ready" | "installing" | "starting_server"' and '"booting"'
    have no overlap.
src/components/vscode/VSCodeMode.tsx(19,3): error TS6133: 'Zap' is declared but its value is never read.
src/services/backup/backupRestoreService.ts(21,8): error TS6133: 'BackupProjectMeta' is declared but its value is never read.
src/services/backup/backupRestoreService.ts(168,18): error TS2345: Argument of type '{ path: string; content: string; }'
    is not assignable to parameter of type 'ProjectFile'. Property 'language' is missing.
src/services/backup/backupRestoreService.ts(251,24): error TS2304: Cannot find name 'EditorStyle'.
src/services/backup/backupRestoreService.ts(253,24): error TS2304: Cannot find name 'ProjectType'.
src/services/backup/backupTypes.ts(8,28): error TS6196: 'ProjectRecord' is declared but never used.
~~~

**Note on `TS2304`:** the two `PreviewPanel` errors are **live runtime `ReferenceError`s**. The two `backupRestoreService` errors are **type-only** — `EditorStyle`/`ProjectType` appear solely as type annotations, which esbuild erases, so they are a type-safety defect (restore metadata is validated only by string comparison) rather than a crash.

### A2. `npm run build` — **exit 0**

~~~
[4/6] Assembling final deployment artifact in dist/...
  -> Injected root Service Worker migration script (dist/sw.js)

[5/6] Verifying build output integrity and security...
  PASS: Astro root index.html verified with Start Coding CTA to /app
  PASS: dist/index.html is isolated from IDE runtime dependencies
  PASS: Vite app/index.html verified with React root and /app/assets/ paths
  PASS: All 6 initial Vite assets exist in dist/app/
  PASS: Monaco worker scripts verified in dist/app/assets/
  PASS: Scoped Service Worker exists at dist/app/sw.js
  PASS: PWA manifest correctly scoped to /app/
  PASS: Root Migration Service Worker verified at dist/sw.js
  PASS: No environment or secret files leaked into dist/

[6/6] Generating build manifest...
Build manifest saved to dist/build-manifest.json (96002ms)
✅ UNIFIED BUILD SUCCEEDED DETERMINISTICALLY
~~~

Largest emitted chunks:

~~~
assets/esbuild-CIppzZMW.wasm          11.65 MB   ← NOT precached (8 MB cap)
assets/ts.worker-Df1lW6KJ.js           5.87 MB
assets/typescript-compiler-BQDGa4aF.js 3.44 MB
assets/TemplateSelectorModal-UPP1TybI.js 2.68 MB (gzip 605.80 kB)
assets/css.worker-_FarIx0Q.js          985 kB
assets/formatter-h1Cz-bI7.js           889 kB
assets/vue-compiler-CCpB70l9.js        778 kB
assets/terminal-CjDwKBss.js            283 kB
assets/react-core-34veshE3.js          225 kB

PWA precache  74 entries (17,669.28 KiB = 17.3 MB)
~~~

**Post-build artifact check (run twice, identical result):**

~~~
dist\index.html              PRESENT
dist\robots.txt              PRESENT
dist\sw.js                   PRESENT
dist\sitemap.xml             MISSING   ← B1
dist\favicon.ico             MISSING   ← B2
dist\app\index.html          PRESENT
dist\app\sw.js               PRESENT
~~~

### A3. `npm run verify:bundle` — **exit 0**

~~~
Initial JS payload (entry + modulepreload)

  index-18aYjfO-.js              336.9 kB  gzip 102.9 kB
  react-core-34veshE3.js         220.2 kB  gzip  72.1 kB
  diff-tools-Cl_hE33I.js          17.5 kB  gzip   6.6 kB   ← should be lazy
  monaco-editor-Bhc-u9rq.js       14.1 kB  gzip   4.8 kB

  TOTAL JS                       588.6 kB  gzip 186.5 kB
  TOTAL CSS                      101.1 kB  gzip  17.5 kB

Verified absent from the critical path: JSZip, xterm terminal, project detection,
import engine, prettier formatter, esbuild-wasm, TypeScript compiler, qrcode.react,
E2B sandbox client, sandbox proxy calls, VS Code editor mode
~~~

### A4. Dead-code verification (recursive grep excluding self-references)

~~~
No external references (dead):
  ColorPicker (807 lines)      ProjectBar (245)       SearchReplaceModal (630)
  SessionManager (611)         SandboxPanel (577)     SelectionResultPanel (207)
  CodeWriteConfirmationModal (194)  FormatDiffModal (183)  SaveStatusIndicator (127)
  AutoSaveIndicator (94)       LadeStackLoader (99)   LegalPageLayout (99)
  FormatToast (101)            LoadingSkeleton (55)   FormatButton (33)
  EditorLoader (24)            LoadingFallback (12)    useAutoFormat (146)
~~~

### A5. Security spot-checks (each independently verified)

~~~
api/ai.js:715      res.setHeader('Access-Control-Allow-Origin', '*');
api/ai.js:719      if (req.method === 'OPTIONS') { return res.status(200).end(); }
api/ai.js:72       const RATE_MAX = 30;          // in-memory Map, resets on cold start
api/ai.js:591      let { stream = false, temperature = 0.6, maxTokens = 16384 }

aiChatAssistant.ts:30   this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
aiChatAssistant.ts:38   this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });  // RETIRED

codeRabbitService.ts:38   const STORAGE_KEY = 'coderabbit_api_key';        // localStorage plaintext
codeRabbitService.ts:240  const genAI = new GoogleGenerativeAI(apiKey);   // NOT CodeRabbit
codeRabbitService.ts:241  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
codeRabbitService.ts:250  const prompt = `You are CodeRabbit AI, an expert code reviewer...`;

src/services/webcontainer/  →  teardown: 0 matches   (never reclaimed)
repo-wide "teardown"        →  6 matches (5 × teardownRecognition + 1 comment)

vercel.json headers sources →  /app/(.*), /app, /ide, /preview-popout
vercel.json rewrites        →  /preview/(.*), /mpreview/(.*)  ← NO header rule covers these

ErrorBoundary.tsx:33    localStorage.getItem('gbcoder_active_project_id')  ← key exists nowhere else
                        (real key: 'gb-coder-active-project-id', projectDatabase.ts:112)
~~~

---

## AUDIT COMPLETENESS STATEMENT

This audit examined **every file** in `src/` (258 TS/TSX files, 120,369 LOC), all 54 template modules, all 21 `api/` handlers, the `dev-api/` and `server/` layers, all 65 `scripts/*.mjs`, and the complete configuration surface (`vite.config.ts`, `vercel.json`, `tsconfig.*`, `eslint.config.js`, `tailwind.config.js`, `astro.config.mjs`, `package.json`, `.env.example`, all `.github/workflows/`). Three execution-based validations were run: `tsc --noEmit`, `npm run build`, and `npm run verify:bundle`.

Every finding marked 🔴 Critical or listed in §6.3 was independently re-verified by the lead auditor against the source or by live command execution, and the specific file, line, and root cause are given. Findings that could not be verified are not asserted.

**Repository state at audit time:** branch `fix/project-first-navigation-editor-startup`, HEAD `38c3d1e`, 767 commits, 33 branches, with 5 tracked files modified in the working tree (`src/App.tsx`, `src/components/Console/TerminalTab.tsx`, `src/components/projects/NewProjectModal.tsx`, `src/components/vscode/VSCodeMode.tsx`, `src/utils/appRoutes.ts`). None of the Critical findings originate from those uncommitted changes — `PreviewPanel.tsx`, `backupRestoreService.ts`, `webcontainerService.ts`, and `ErrorBoundary.tsx` are unmodified in the working tree and the defects are present in `HEAD`.

**End of report.**
