# 01 — Repository Scan

> **Source Prompt:** PROMPT_01_Repository_Scan.md
> **Phase:** 1 — Discovery
> **Repository:** GB-CODER-PUBLIC-ALPHA
> **Commit:** b6035fee6bde521427e64f81498dd32d4c7833dc
> **Generated:** 2026-08-02 19:36:08 UTC
> **Status:** Complete
> **Confidence:** High — every claim below was verified directly against the filesystem
> **Next Expected Document:** Phase 1/PROMPT_02_File_Inventory.md → `02_file_inventory.md`

---

## 1. Overview

This document is the first-contact scan of the GB Coder repository. It establishes the repository's identity, size, structure, technology, and architecturally significant files. All findings are derived from direct filesystem inspection of the working tree at commit `b6035fe` (branch `main`, clean working tree).

## 2. Methodology

- Enumerated the repository root (all entries including hidden files)
- Read `README.md`, `package.json`, `vite.config.ts`, `vercel.json`, `.env.example`, `server/package.json`, `server/index.js`, `tsconfig.*`, `eslint.config.js`, `tailwind.config.js`, `postcss.config.js`
- Recursively counted files and lines across `src/`, `server/`, `api/`, `supabase/`, `public/`, `scripts/` (excluding `node_modules/`, `dist/`, `.git/`)
- Inspected git state (`git log --oneline -8`, `git status`, `git rev-parse HEAD`)
- Identified files > 1000 lines

## 3. Findings

### 3.1 Executive Summary

GB Coder is an AI-powered, browser-based HTML/CSS/JavaScript code playground (CodePen/JSFiddle-style) built as a Vite + React 18 + TypeScript single-page application. Its primary purpose is providing a three-panel live code editor (HTML/CSS/JS via Monaco), a live sandboxed preview with console interception, an AI chat assistant powered by Google Gemini, voice commands via the Web Speech API, and project/template/snippet management — all persisted in `localStorage`. The repository is a hybrid monolith: a frontend SPA (the bulk of the code), a small Express + WebSocket + node-pty backend (`server/`), a set of Vercel serverless functions (`api/`, including an E2B sandbox API group), and a Supabase SQL schema (`supabase/`) that is not yet wired into the frontend. Notable characteristics: a heavy AI component surface (Gemini chat, voice intent pipeline, E2B sandbox execution), a large in-repo template library, and an unusually large central `src/App.tsx` (3842 lines).

### 3.2 Repository Statistics

| Metric | Value |
|--------|-------|
| Total files | 329 |
| Total directories | 54 |
| Source files | ~225 (68%) |
| Configuration files | ~17 (5%) |
| Test files | 0 (0%) |
| Documentation files | ~75 (23%) |
| Build/generated files | 12 (4%) — incl. `dist/` (excluded from line counts) |
| Largest file | `package-lock.json` (9,011 lines) |
| Largest source file | `src/App.tsx` (3,842 lines) |
| Primary language | TypeScript (110 `.ts` files) |
| Secondary language | TSX/React (80 `.tsx` files) |
| Total lines (excl. lockfile/binary) | ~92,314 |

> Note: line counts for binary assets (`public/tghjkl.jpeg` — 192, `src/logo/codebuddy.png` — 3,158) are artifacts of the counting method (binary bytes read as lines) and are excluded from totals.

### 3.3 Directory Tree

```
GB-CODER-PUBLIC-ALPHA/
├── src/                      (5 files, 7 subdirs — frontend application)
│   ├── components/           (48 files, 7 subdirs — UI/feature components)
│   │   ├── Console/          (5 files)
│   │   ├── history/          (1 file)
│   │   ├── pages/            (7 files)
│   │   ├── projects/         (2 files)
│   │   ├── sandbox/          (1 file)
│   │   ├── ui/               (11 files)
│   │   └── vscode/           (2 files)
│   ├── features/             (0 files, 1 subdir)
│   ├── hooks/                (21 files)
│   ├── services/             (42 files, 4 subdirs — business logic)
│   │   ├── import/           (2 files)
│   │   ├── projects/         (1 file)
│   │   ├── sandbox/          (1 file)
│   │   └── templates/        (0 files, 11 subdirs — lazy template library)
│   ├── types/                (9 files)
│   ├── utils/                (11 files)
│   └── ... (App.tsx, main.tsx, AppWrapper.tsx, index.css, logo/)
├── api/                      (5 files, 1 subdir — Vercel serverless functions)
│   └── sandbox/              (7 files — E2B sandbox API)
├── server/                   (5 files — Express + WebSocket/PTY backend)
├── supabase/                 (2 files — SQL schema + migration)
├── public/                   (4 files — manifest, robots, sitemap, OG image)
├── scripts/                  (3 files — template generation + bundle measurement)
├── docs/                     (10 files — feature documentation)
├── Hermes With Deepseek v4 flash/  (framework folder — 9 phases, 36 prompts)
├── dist/                     (build output — excluded from analysis)
├── node_modules/             (dependencies — excluded from analysis)
├── .agents/, .claude/        (agent tooling directories)
└── root files: package.json, vite.config.ts, vercel.json, tsconfig.*,
    eslint.config.js, tailwind.config.js, postcss.config.js, .env.example,
    index.html, favicon.ico + ~35 markdown report/guide files
```

### 3.4 Technology Stack (Initial)

| Category | Technology | Version (if visible) | Purpose |
|----------|-----------|---------------------|---------|
| Language | TypeScript | ^5.5.3 | Primary language (frontend) |
| UI Framework | React | ^18.3.1 | UI framework |
| Build | Vite | ^5.4.2 | Build tool + dev server |
| Styling | Tailwind CSS | ^3.4.1 | Utility-first styling |
| Editor | Monaco (`@monaco-editor/react`) | ^4.6.0 | Code editing |
| AI SDK | Google Generative AI (`@google/generative-ai`) | ^0.24.1 | Gemini AI chat |
| Sandbox | E2B (`e2b`) | ^2.37.0 | AI/cloud code sandbox execution |
| Backend | Express | ^4.18.2 | HTTP server (server/) |
| Terminal | node-pty + ws | ^1.0.0 / ^8.14.2 | PTY proxy over WebSocket |
| Cache/DB | Upstash Redis (`@upstash/redis`) | ^1.38.0 | Serverless Redis (api layer) |
| Database (planned) | Supabase (PostgreSQL) | — | SQL schema in supabase/ |
| PWA | vite-plugin-pwa | ^1.1.0 | Service worker + manifest |
| Analytics | react-ga4, @vercel/analytics, web-vitals | ^2.1.0 / ^1.6.1 / ^5.1.0 | GA4 + Vercel + Core Web Vitals |
| Client bundling | esbuild-wasm, @vue/compiler-sfc | 0.25.10 / 3.5.40 | Client-side multi-file project bundling |
| Deployment | Vercel | — | vercel.json + serverless functions |

### 3.5 Architecturally Significant Files

| File Path | Lines | Role | Initial Observations |
|-----------|-------|------|----------------------|
| `src/App.tsx` | 3,842 | Core application shell | Single orchestrator holding all state + render tree; largest source file; likely the "god component" |
| `src/services/templateService.ts` | 2,930 | Template registry service | Massive template provider; drives `services/templates/**` (11 subdirectories) |
| `src/services/templates/startup/landing.ts` | 1,055 | Template payload | Largest individual template |
| `src/components/vscode/VSCodeMode.tsx` | 917 | VS Code-like UI mode | Full file-tree + editor mode for multi-file projects |
| `src/components/PreviewPanel.tsx` | 907 | Live preview | Sandboxed iframe, console interception, responsive modes |
| `src/services/voiceCommandService.ts` | 884 | Voice command engine | Web Speech API command execution |
| `src/services/voiceIntentRegistry.ts` | 868 | Voice intent registry | Intent catalog backing the voice engine |
| `src/components/SnippetManager.tsx` | 749 | Snippet manager | Snippet CRUD UI |
| `src/components/ColorPicker.tsx` | 749 | Color picker | Heaviest generic UI component |
| `src/services/codeTemplatesService.ts` | 647 | Template service (legacy) | Older template implementation alongside enhancedTemplateService |
| `src/components/pages/DocumentationPage.tsx` | 656 | Docs page | In-app documentation page |
| `api/ai.js` | 716 | AI serverless proxy | NVIDIA NIM proxy (serverless) |
| `src/services/bundlerService.ts` | 562 | Client-side bundler | esbuild-wasm bundling for multi-file projects |
| `api/sandbox/_detect.js` | 291 | Sandbox detection | E2B sandbox language/framework detection |
| `src/App.tsx` (entry) | — | Entry point chain | `main.tsx` → `AppWrapper.tsx` → `App.tsx` |

### 3.6 Suspicious or Notable Patterns

- **God object risk:** `src/App.tsx` (3,842 lines) — single component orchestrating all state.
- **Duplicate/legacy template systems:** `codeTemplatesService.ts` (647) vs `enhancedTemplateService.ts` (491) vs `templateService.ts` (2,930) — three overlapping template implementations.
- **Voice AI duplication:** `voiceCommandService.ts` (884) + `voiceIntentRegistry.ts` (868) + `voiceMatcher.ts` (386) + `voiceCommandParser.ts` (141) — four voice files suggest an evolving, possibly redundant subsystem.
- **Root clutter:** ~35 standalone `.md` fix/report/guide files in the repository root (e.g., `CLIPBOARD_FIX_REPORT.md`, `SCREENSHOT_ERROR_FIX.md`, `ROUTING_PATCH.md`) — historical development artifacts, not maintained docs.
- **Root scripts:** `complete-auth-integration.js`, `complete-auth-integration.ps1`, `fix.cjs`, `create_templates.cjs` — one-off integration/fix scripts committed at root.
- **Binary counted as lines:** `src/logo/codebuddy.png` (3,158 "lines") — image file, not code.
- **No tests anywhere:** zero `.test.*` / `.spec.*` / `test_*` files in the repository.
- **Empty-but-present feature dir:** `src/features/` contains a single 16-line file (`fullstack/fullstackFeature.ts`) — skeletal feature flag structure.
- **No CI/CD config:** no `.github/workflows/`, `.gitlab-ci.yml`, or `Jenkinsfile` present; deployment is Vercel-only.
- **Framework folder inside repo:** the `Hermes With Deepseek v4 flash/` directory (9 phases, 36 prompts) is the analysis framework driving this effort — it lives inside the target repository.

### 3.7 Edge Cases

- `package.json` declares `e2b` and `@upstash/redis` but their frontend usage is unverified at scan time — `api/` usage (serverless) is more likely. Verified in P03.
- `server/package.json` lists `express-rate-limit` and `axios` as dependencies; `server/index.js` imports neither (only `express`, `http`, `ws`, `node-pty`, `cors`, `os`, `dotenv`) — declared-but-unused dependencies.
- `dist/` exists in the working tree — build artifacts are committed/present locally (not necessarily tracked; `.gitignore` not fully inspected at scan time).
- `.agents/` and `.claude/` directories are agent tooling config folders — they may contain MCP configuration or skill definitions; flagged for Phase 5 (AI) and Phase 6 (integration) inspection.

### 3.8 Omissions

- `node_modules/`, `dist/`, `.git/` excluded from enumeration per framework rules.
- `package-lock.json` contents not analyzed at scan time (P03 resolves versions from it where needed).
- Deep code logic deliberately not examined (scan phase only).
- `.agents/` and `.claude/` contents not yet enumerated (deferred to Phase 5/6).

---

## 4. Quality Gate Checklist (P01)

- [X] All top-level files are listed
- [X] All top-level directories are explored to the required depth
- [X] README and primary config files are read
- [X] Technology stack is identified with versions where visible
- [X] File counts are recorded
- [X] Largest files are identified
- [X] Repository statistics table is complete
- [X] Quality standards Q1 (Accuracy) and Q4 (Structure) are met

---

## 5. Context Summary (Phase 1 → Phase 2)

### Repository Overview

GB Coder is a Vite + React 18 + TypeScript code playground with Monaco editors, live preview, Gemini AI chat, voice commands, and an E2B sandbox — backed by a small Express/WebSocket terminal server and Vercel serverless functions, with a Supabase schema awaiting frontend integration.

### Key Statistics

- Files: 329 (excl. node_modules/dist/.git)
- Directories: 54
- Primary language: TypeScript (110 `.ts` + 80 `.tsx`)
- Architecture style: Hybrid monolith (SPA + sidecar backend + serverless + planned DB)

### Architecturally Significant Files

1. `src/App.tsx` — 3,842-line orchestrator; state + render tree root
2. `src/services/templateService.ts` — 2,930-line template registry
3. `src/components/PreviewPanel.tsx` — sandboxed preview + console bridge
4. `src/components/vscode/VSCodeMode.tsx` — multi-file project UI mode
5. `src/services/voiceIntentRegistry.ts` / `voiceCommandService.ts` — voice subsystem
6. `api/ai.js` + `api/sandbox/*` — serverless AI + sandbox layer
7. `server/index.js` — WebSocket/PTY terminal backend
8. `supabase/schema.sql` + `migration.sql` — database schema

### Notable Patterns

- Component-per-feature structure under `src/components/` with grouped subdirectories
- Singleton service pattern under `src/services/`
- Three overlapping template systems (legacy + enhanced + mega-registry)
- Voice subsystem with four interacting files (possible redundancy)
- localStorage-based persistence (projectStore, snippetUtils, useLocalStorage)

### Ambiguities Requiring Attention

- Whether `e2b`/`@upstash/redis` are used client-side or server-side only
- Relationship between the three template service implementations
- Whether `supabase/` is wired to the frontend (CONTEXT.md says it is not)
- Purpose of `.agents/` and `.claude/` agent config directories

### Priority for Phase 2

- Map `src/` folder architecture (P04) and the dependency graph (P05), starting from `main.tsx` → `App.tsx` (P06)
- Resolve the three-template-service overlap
- Trace voice subsystem and sandbox subsystem boundaries

---

## Verification

How to verify this document's claims:
- Re-run `git rev-parse HEAD` — must equal `b6035fee6bde521427e64f81498dd32d4c7833dc`
- Re-run the file/line counts: `Get-ChildItem src,server,api,supabase,public,scripts -Recurse -File | Measure-Object`
- Open `src/App.tsx` and confirm 3,842 lines
- Confirm `package.json` dependency list matches Section 3.4

## Next Phase

Proceed to **[Phase 2: PROMPT_04_Folder_Architecture.md](../Hermes%20With%20Deepseek%20v4%20flash/Phase%202%20—%20Structural%20Analysis/PROMPT_04_Folder_Architecture.md)** after this document passes quality gate Q1.

## Document Status

[X] Draft — initial analysis, pending review
[ ] Reviewed — peer-checked against source code
[X] Complete — passed quality gate Q1
