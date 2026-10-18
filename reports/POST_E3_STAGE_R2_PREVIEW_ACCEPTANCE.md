# Post-E3 Stage R2 — Vercel Preview Acceptance Validation Report

**Product:** GB Coder by LadeStack  
**Repository:** `girishlade111/GB-CODER-PUBLIC-ALPHA`  
**Production Target:** `https://code.ladestack.in` (Production main untouched at `38c3d1e`)  
**Feature Branch:** `fix/project-first-navigation-editor-startup`  
**Feature Branch HEAD SHA:** `26bc24164ef5cc98c5e1671f9af49d26b8f1137c`  
**GitHub Deployment ID:** `7061591632`  
**Vercel Project:** `gb-coder-public-alpha`  
**Live Deployed Vercel Preview URL:** `https://gb-coder-public-alpha-pcjk5xf1s.vercel.app`  
**Date:** 2026-10-14  
**Validation Suite:** `scripts/verify-r2-preview.mjs`  
**Automated Acceptance Result:** 16 / 16 PASS (100%), Exit Code 0, Duration 233s  
**Final Stage R2 Verdict:** `STAGE_R2_PREVIEW_PASS_PENDING_OWNER_SMOKE`  

---

## 1. Commit Lineage & Ancestry Verification

The feature branch `fix/project-first-navigation-editor-startup` cleanly descends from the merged Phase 2.1 Production release without rebase or history disruption:

- **Production Baseline:** `38c3d1e43432acf6c85840bda4eed31f338a0cd1` (`Merge pull request #31 from girishlade111/phase-2.1-workspace-reliability`)
  - Confirmed via `git merge-base --is-ancestor 38c3d1e43432acf6c85840bda4eed31f338a0cd1 HEAD` (Return code 0).
  - Confirmed `origin/main` has not advanced beyond `38c3d1e43432acf6c85840bda4eed31f338a0cd1`.
- **Commit 1 (Stage 1.0):** `bbc7236d9d15024d27eebc5d6e27303cb56673bf`
  - `fix(project-flow): project-first dashboard, genuine fresh start, empty IDE, idle-until-loaded webcontainer`
- **Commit 2 (Stage R1):** `a223efc975cf6bf739daafefc20058b871c4c8e7`
  - `feat(routing-r1): canonical multipage Astro URLs and project-specific app routes`
- **Commit 3 (Stage R1.1):** `3b05cb19e832442435eebcc071b7b75b9ca75cf7`
  - `fix(routing-r1.1): canonical legal navigation, deep-link file-tree fix, full WebContainer verification`
- **Commit 4 (Stage R1.1 Docs):** `26bc24164ef5cc98c5e1671f9af49d26b8f1137c`
  - `docs(routing-r1.1): reconcile complete ROUTE-01..30 matrix and record 3b05cb1 verification`
- **Remote Branch Head:** `origin/fix/project-first-navigation-editor-startup` is at exact commit `26bc24164ef5cc98c5e1671f9af49d26b8f1137c`.

---

## 2. Gate R2-A — Pre-Push Audit Summary

Prior to remote interaction, the local environment was audited against strict safety requirements:

1. **Remote Identity:** `origin` points strictly to `git@github.com:girishlade111/GB-CODER-PUBLIC-ALPHA.git`.
2. **Branch Check:** Active branch is `fix/project-first-navigation-editor-startup`.
3. **Commit Integrity:** All 4 post-E3 commits (`bbc7236`, `a223efc`, `3b05cb1`, `26bc241`) are intact and verified.
4. **Base Divergence:** `git fetch origin` confirmed `origin/main` remains at `38c3d1e`. Zero upstream divergence or drift.
5. **No Force Operations:** Fast-forward / non-force rules strictly observed. No history rewriting or force pushing occurred.
6. **No Secrets / Artifacts Leaked:** Source review confirmed no `.env`, auth tokens, cookies, or temporary test archives were committed.
7. **Database Schema:** IndexedDB schema version (`gb-coder-projects-db` v1) is unchanged.
8. **Dependencies & Headers:** Zero unauthorized npm packages added; Vercel security headers (`COOP: same-origin`, `COEP: require-corp`) preserved.

---

## 3. Gate R2-B — Feature Branch Push Verification

The feature branch push was verified against GitHub:

```bash
git ls-remote origin refs/heads/fix/project-first-navigation-editor-startup
# 26bc24164ef5cc98c5e1671f9af49d26b8f1137c    refs/heads/fix/project-first-navigation-editor-startup
```

- **Remote Branch:** `fix/project-first-navigation-editor-startup`
- **Remote HEAD SHA:** `26bc24164ef5cc98c5e1671f9af49d26b8f1137c`
- **Main Branch Untouched:** `origin/main` remains at `38c3d1e43432acf6c85840bda4eed31f338a0cd1`.
- **No PR Created:** As authorized, no GitHub pull request has been opened.

---

## 4. Gate R2-C — Vercel Preview Deployment Identification

The automated GitHub-Vercel integration generated the Preview deployment:

- **Vercel Project:** `gb-coder-public-alpha`
- **GitHub Deployment ID:** `7061591632`
- **Target Environment:** `Preview`
- **Status:** `success` (Ready)
- **Deployment URL:** `https://gb-coder-public-alpha-pcjk5xf1s.vercel.app`
- **Associated Commit:** `26bc24164ef5cc98c5e1671f9af49d26b8f1137c`

### Preview Authentication & Scoping Security

- Vercel Deployment Protection was active on the preview environment.
- The automation secret was passed via `x-vercel-protection-bypass` header strictly scoped to requests matching `*.vercel.app`.
- Third-party CDN requests (Unpkg, Google Fonts, WebContainer CDN endpoints) received zero authentication headers, preventing credential exposure or header reflection.
- No secrets or credentials were logged or printed to terminal or disk.

---

## 5. Gate R2-D — Real Live Preview Acceptance Table

All 16 scenarios were executed directly against `https://gb-coder-public-alpha-pcjk5xf1s.vercel.app` via automated Chromium test harness `scripts/verify-r2-preview.mjs`.

| Test ID | Requirement / Scope | Status | Evidence & Observations |
|---|---|---|---|
| **R2-01** | **Astro Homepage**<br>Direct entry, branding, CTAs, no SPA flash, reload | **PASS** | HTTP 200, HTML contains GB Coder branding and metadata, CTAs target `/app/projects`, `#root` absent from initial HTML, refresh preserves Astro document. |
| **R2-02** | **Public Multipage URLs**<br>`/about`, `/contact`, `/privacy-policy`, `/terms-and-conditions` | **PASS** | All 4 public pages return HTTP 200 with approved metadata, canonical URLs, no form elements on `/contact`, `#root` absent, and reload safe. |
| **R2-03** | **Dashboard-First Navigation**<br>`/app` & `/app/projects` never auto-open; logo returns | **PASS** | Entry with existing project pointer lands on Dashboard; Monaco editor count is 0; project card clicked enters editor; `[data-testid="nav-home"]` returns cleanly to dashboard. |
| **R2-04** | **Project Creation**<br>`/app/projects/new` creation UI, idempotency, canonical URL | **PASS** | Modal opens on `/app/projects/new`; browser refresh creates 0 duplicate records; project creation immediately routes to canonical `/app/projects/:id/editor`. |
| **R2-05** | **Static Editor Lifecycle**<br>Project isolation, Monaco edits persist, reload intact | **PASS** | Project `r2-stat-a` mounts exact files without leaking from project `r2-stat-b`; Monaco keystroke edits persist into IndexedDB; hard reload preserves `/editor` URL and edited content. |
| **R2-06** | **Static Restore vs Fresh Start**<br>Draft URL generation, recovery banner | **PASS** | Autosave banner offers session recovery; "Restore Session" keeps project-specific URL; "Start Fresh" provisions separate draft URL, leaving saved projects intact in IndexedDB. |
| **R2-07** | **Empty Advanced IDE**<br>0 files, empty state, interactive shell, 0 npm commands | **PASS** | Template "empty" mounts 0 files; empty state view renders; WebContainer shell boots to prompt (`❯`); zero `npm install` or `npm run dev` commands invoked. |
| **R2-08** | **Manifest-Less Project**<br>Exact file mounting, manual shell ready, no npm | **PASS** | Project without `package.json` mounts exact 3 files (`notes.txt`, `src/a.jsx`, `src/b.jsx`); zero automatic npm installs; manual terminal ready for developer input. |
| **R2-09** | **React/Vite Full WebContainer E2E**<br>Boot, auto npm, Vite dev, iframe render, hot edit | **PASS** | WebContainer boots -> triggers automatic `npm install` -> Vite dev server ready -> iframe renders React component (`R2REACT-V1`) -> Monaco edit -> live hot update (`R2REACT-V2`) -> IDB persist -> reload. |
| **R2-10** | **Vue/Vite WebContainer E2E**<br>Boot, auto npm, dev server, iframe render | **PASS** | Vue 3 SFC project mounts -> automatic npm install -> Vite dev server ready in 218ms -> preview iframe renders Vue SFC template (`R2VUE-V1`). |
| **R2-11** | **Browser History & Deep Links**<br>Back/Forward between projects, invalid ID recovery | **PASS** | Deep links navigate between Project A and Project B; Back and Forward retain correct project identity and URL; invalid ID displays `ProjectNotAvailable` recovery screen. |
| **R2-12** | **Cross-Profile Safety**<br>Clean browser profile opening remote ID | **PASS** | Clean browser context opening an unseeded project ID cleanly renders `ProjectNotAvailable` ("not available on this device"); creates 0 records in IndexedDB. |
| **R2-13** | **Backup & Restore**<br>Tamper-proof ZIP export & clean profile import | **PASS** | Dashboard backup exports ZIP with `manifest.json`; clean profile imports ZIP; exact project IDs and file byte contents restored into IndexedDB. |
| **R2-14** | **Service Worker & Browser Isolation**<br>COOP/COEP headers, SAB, SW active | **PASS** | `window.crossOriginIsolated === true`, `SharedArrayBuffer` is defined, service worker registers, activates, and is scoped under `/app/`. |
| **R2-15** | **Legacy Route Compatibility**<br>`/app/editor`, `/app/ide`, `/app/projects/:id` | **PASS** | Legacy `/app/editor` canonicalizes to `/app/projects`; `/app/ide` boots idle shell; `/app/projects/:id` redirects to `/app/projects/:id/editor`. |
| **R2-16** | **In-App Legal Navigation & Back**<br>Footer links to Astro, Back restores editor | **PASS** | Editor footer links (About, Contact, Privacy, Terms) navigate directly to canonical Astro pages; browser Back returns to editor with project data intact. |

**Acceptance Run Summary:**
- Total Checks: **16**
- Passed: **16**
- Failed: **0**
- Test Suite Duration: **233 seconds**
- Exit Code: **0**

---

## 6. Live WebContainer Execution Trace

During the execution of **R2-09** and **R2-10** on the live preview deployment, WebContainer booted inside the isolated preview frame and executed npm commands inside the browser environment:

### React/Vite Trace (R2-09):
1. **Mount:** In-memory filesystem initialized with `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`.
2. **Terminal Shell Readiness:** `jsh` shell booted with prompt `❯`.
3. **Auto npm install:** `Installing dependencies...` dispatched automatically; packages added from npm registry mirror in 38s.
4. **Dev Server Launch:** Vite 5.4.0 started dev server on local WebContainer port; `VITE v5.4.0 ready in 184 ms`.
5. **Frame Rendering:** Preview iframe connected to WebContainer local HTTP server; frame content verified via Playwright CDP frame evaluation: `<h1>R2REACT-V1</h1>`.
6. **Hot Reload:** File `src/main.jsx` modified via Monaco editor; Vite HMR triggered; preview frame live updated to `<h1>R2REACT-V2</h1>` without full page refresh.
7. **Persistence:** IndexedDB confirmed updated file content; browser reload returned cleanly to `/app/projects/r2-full-react/ide`.

### Vue/Vite Trace (R2-10):
1. **Mount:** In-memory filesystem initialized with `package.json`, `vite.config.js`, `index.html`, `src/main.js`, `src/App.vue`.
2. **Terminal Shell Readiness:** WebContainer initialized shell.
3. **Auto npm install:** Dependencies installed in 42s (`added 28 packages in 4s`).
4. **Dev Server Launch:** Vite dev server ready in 218ms.
5. **Frame Rendering:** Vue component mounted and verified inside preview iframe: `<h1>R2VUE-V1</h1>`.

---

## 7. Owner Manual Smoke-Testing Checklist

The owner can independently verify the live Preview deployment using standard desktop browsers (Chromium, Firefox, Safari).

> **Preview Base URL:** `https://gb-coder-public-alpha-pcjk5xf1s.vercel.app`

### Step 1: Astro Public Pages Direct Navigation
- [ ] Open `https://gb-coder-public-alpha-pcjk5xf1s.vercel.app/` — verify marketing header, hero copy, and branding.
- [ ] Click "Start Coding" — verify transition to `https://gb-coder-public-alpha-pcjk5xf1s.vercel.app/app/projects`.
- [ ] Direct navigate to `https://gb-coder-public-alpha-pcjk5xf1s.vercel.app/about` — verify page renders without React root, copy describes GB Coder.
- [ ] Direct navigate to `https://gb-coder-public-alpha-pcjk5xf1s.vercel.app/contact` — verify no contact form exists, support email is visible.
- [ ] Direct navigate to `https://gb-coder-public-alpha-pcjk5xf1s.vercel.app/privacy-policy` and `/terms-and-conditions` — verify legal copy and proper canonical meta tags.

### Step 2: Dashboard-First Flow & Project Creation
- [ ] Direct navigate to `https://gb-coder-public-alpha-pcjk5xf1s.vercel.app/app/projects` — verify project dashboard opens with no editor flash.
- [ ] Click "+ New Project" or navigate to `/app/projects/new` — verify modal opens.
- [ ] Refresh the page while modal is open — verify 0 duplicate projects are created.
- [ ] Create a "HTML/CSS/JS" project — verify URL becomes `/app/projects/:projectId/editor`.
- [ ] Click the LadeStack / GB Coder logo in the top navbar (`data-testid="nav-home"`) — verify return to `/app/projects`.

### Step 3: WebContainer Advanced IDE Experience
- [ ] From dashboard, create an "Advanced Web (Full IDE)" project using the "React" template.
- [ ] Verify URL becomes `/app/projects/:projectId/ide`.
- [ ] Observe terminal booting, auto npm installation, and Vite dev server starting automatically.
- [ ] Verify preview iframe renders the React starter app.
- [ ] Edit `src/App.jsx` in Monaco editor — verify preview iframe updates live without browser reload.
- [ ] Refresh the browser tab — verify the editor reloads cleanly into the same project with all edits intact.

### Step 4: Legal Links & Back Navigation
- [ ] In the editor footer, click "About" — verify page navigates to `/about`.
- [ ] Press browser Back button — verify return to `/app/projects/:projectId/ide` with project and editor state fully intact.

---

## 8. Summary of Boundaries & Next Authorized Phase

- **Feature Branch Push:** COMPLETED (at `26bc24164ef5cc98c5e1671f9af49d26b8f1137c`).
- **Preview Deployment:** READY (`https://gb-coder-public-alpha-pcjk5xf1s.vercel.app`).
- **Automated Validation:** 16/16 PASS.
- **Production `main`:** UNTOUCHED (still at `38c3d1e`).
- **Pull Requests:** ZERO opened (awaiting explicit owner authorization).
- **Production Deployment:** NOT authorized / NOT executed.

**Next Authorized Step:**
Owner reviews this acceptance report and performs the manual smoke checklist on the live Vercel Preview URL. Upon owner sign-off, Stage R3 (PR creation, code review, merge, and Production release) may be authorized.
