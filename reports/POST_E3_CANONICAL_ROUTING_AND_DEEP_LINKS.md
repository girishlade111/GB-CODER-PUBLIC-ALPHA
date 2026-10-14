# Post-E3 Stage R1 — Canonical Routing & Deep Links

**Branch:** `fix/project-first-navigation-editor-startup` (local only; extends `bbc7236`, preserved)
**Production base:** `38c3d1e` (verified ancestor; `origin/main` unchanged at `38c3d1e`)
**Date:** 2026-10-14
**Remote actions:** NONE — no push, PR, Preview, Production, or Vercel changes.

---

## 1. Preflight (all green)

- Active branch `fix/project-first-navigation-editor-startup`; `bbc7236` present and preserved
  (new work is additive on top; no reset, no amend of earlier commits).
- Phase 2.1 merge `38c3d1e` is an ancestor; `git fetch` shows `origin/main` still at `38c3d1e` —
  nothing to reconcile.
- Worktree had no staged/unstaged changes at start; earlier reports
  (`POST_E3_PROJECT_FLOW_EDITOR_LIFECYCLE_FIX.md`) and suites (`e2e-project-flow.mjs` 20/20,
  `project-flow-regression-tests.mjs`) intact and reused as the regression baseline.
- No router library exists anywhere in the app (hand-rolled `appRoutes.ts` + App ladder +
  History API). **No new dependency added** — extension was strictly preferable: the app has
  exactly one route-resolution site and no nested-route rendering; a library would add a
  dependency, a second source of truth, and a migration with zero behavioral gain.

## 2. Existing route table (pre-R1 audit)

| URL | Served by | Behavior |
|---|---|---|
| `/` | Astro `index.html` | Marketing; CTAs → `/app` |
| `/404.html` | Astro `404.astro` | Marketing 404 (unknown paths 404, no editor) |
| `/_astro/*` | Astro static | Marketing assets |
| `/app`, `/app/` | React shell (`/app/index.html`) | Dashboard (no project) / static editor (pointer) |
| `/app/editor` | React shell | Static editor (pointer auto-open) |
| `/app/ide`, `/ide`, `/ide/` | React shell | IDE (pointer project or idle shell) |
| `/preview/*`, `/mpreview/*`, `/preview-popout` | React shell | Share/popout views |
| `/api/*` | Vercel functions / local handlers | API |
| `/sw.js`, `/app/sw.js` | Static | Migration SW (root), app SW (scope `/app/`) |

No `/about`, `/contact`, `/privacy-policy`, `/terms-and-conditions` existed. The React
`AboutPage` footer linked `/privacy` + `/terms`, which 404 on Production (verified: no such
rewrite; Phase 1.4 P07 established unknown paths 404). No i18n infrastructure exists anywhere
in app code (only agent-doc mentions); therefore no localized routes exist — see §11 for the
per-language gap list (no fake translations generated).

## 3. Final canonical URL table

**Astro owns (static, directly navigable, refresh-safe):**

| URL | Source |
|---|---|
| `/` | `apps/marketing/src/pages/index.astro` (CTAs now → `/app/projects`) |
| `/about` | NEW `about.astro` (copy matches in-app About page) |
| `/contact` | NEW `contact.astro` (authorized info only, **no form**) |
| `/privacy-policy` | NEW `privacy-policy.astro` (copy matches in-app Privacy page) |
| `/terms-and-conditions` | NEW `terms-and-conditions.astro` (copy matches in-app Terms page) |

All four carry `<title>`, meta description, and `<link rel="canonical">`; share the homepage's
visual system via `layouts/Site.astro`; contain zero IDE runtime markers (build-asserted).

**React owns (SPA shell served for all `/app/*`):**

| URL | Screen |
|---|---|
| `/app` | Dashboard (alias, renders directly — no flash, no redirect) |
| `/app/projects` | Dashboard (canonical; all app navigation targets this) |
| `/app/projects/new` | Dashboard + creation modal (open/refresh creates nothing) |
| `/app/projects/:id` | Resolves to the project's canonical editor URL |
| `/app/projects/:id/editor` | Static editor for exactly that project |
| `/app/projects/:id/ide` | Advanced IDE for exactly that project |
| `/app/editor` | Legacy: canonicalizes with pointer, else dashboard |
| `/app/ide`, `/ide` | Legacy: canonicalizes with pointer, else idle shell |

## 4. Source files modified

- `apps/marketing/astro.config.mjs` — `file` → `directory` format (clean URLs).
- `apps/marketing/src/layouts/Site.astro` — NEW shared layout (head/meta/nav/footer).
- `apps/marketing/src/pages/{about,contact,privacy-policy,terms-and-conditions}.astro` — NEW.
- `apps/marketing/src/pages/index.astro` — CTAs → `/app/projects`; footer canonical links.
- `src/utils/appRoutes.ts` — `PROJECTS_ROUTE`, `NEW_PROJECT_ROUTE`, builders
  (`projectEditorUrl`/`projectIdeUrl`/`projectUrl`), `isValidProjectId`, `parseAppRoute`
  (dashboard/new/project/editor/ide/legacy-editor/legacy-ide/invalid/unknown-app).
- `src/App.tsx` — URL-driven startup/selection, canonical navigation, `unavailableProjectId`
  recovery screen wiring, `/new` modal route, rewritten `popstate`, URL-honesty effect,
  loading-before-dashboard ladder order, canonical targets for leave/enter/return/delete flows,
  `handleOpenProject` options (`replaceUrl`, `editorOverride`) + boolean result.
- `src/components/projects/ProjectNotAvailable.tsx` — NEW safe recovery screen (dashboard +
  import actions; creates nothing, shows no other project).
- `src/components/pages/AboutPage.tsx` — broken `/privacy` + `/terms` hrefs → canonical URLs.
- `scripts/preview-combined.mjs` — directory-index for marketing pages (local parity).
- `scripts/build-unified.mjs` — CTA-target check updated + Check 8 (4 public pages).
- `scripts/project-flow-regression-tests.mjs` — extended: R1 parser/validator/builder matrix.
- `scripts/e2e-project-flow.mjs` — baseline URL assertions updated to canonical (same strictness).
- `scripts/e2e-canonical-routes.mjs` — NEW ROUTE-01..30 suite.

No `vercel.json` change required and none made (`/app/(.*)` rewrite + headers already cover
nested routes; static `about/index.html` style output is served natively). No storage, SW, Monaco,
WebContainer, or ZIP-format changes.

## 5. Navigation and deep-link behavior

- Every screen has a stable address; copy/paste/refresh/bookmark/Back/Forward verified by test.
- Project URLs embed the project's stable existing ID (safe charset enforced, bounded length,
  `encodeURIComponent` on build, guarded `decodeURIComponent` on parse). No filesystem paths,
  no content, no new IDs.
- Deep links resolve the URL id (pointer is not consulted for selection; a successful deep open
  persists the selection like any explicit open). `/app/projects/:id` resolves to the correct
  editor by stored style; explicit `/editor` vs `/ide` suffixes win without rewriting the stored
  preference (only the mode-switch buttons do that).
- History: explicit user actions push; cold starts, corrections, and Back/Forward handling replace
  (or no-op). Same-path navigations no-op. No loops (replace-only corrections + honesty effect that
  skips the idle shell, the recovery screen, and in-flight opens).
- `popstate` never starts saves/resets/installs — it only moves selection through the guarded open
  path; a refused flush toasts and repairs the URL back to the still-open screen.
- Creation: `/new` opens the real modal; refresh reopens the empty form (zero records created,
  asserted); cancel/create collapse the `/new` entry so Back lands on the dashboard.
- Switching projects mid-startup cancels stale work via the existing epoch/transition guards
  (re-verified). Unsaved-change coordination and save-honesty semantics unchanged (flush-block
  preserved on every transition, including popstate).

## 6. Astro/Vercel routing verification

- Unified production build: **SUCCESS**, 13/13 integrity checks (9 existing + 4 new pages).
- Direct deep-link navigation inspected over real HTTP: `/about`, `/privacy-policy`,
  `/terms-and-conditions`, `/contact` → 200 with correct titles/canonical/OG metadata;
  `/app/projects/abc123/ide` → 200 React shell; invalid marketing path → 404 marketing page
  (no editor shell, no `id="root"`).
- COOP `same-origin` + COEP `require-corp` confirmed on nested `/app/projects/...` responses;
  `crossOriginIsolated` + `SharedArrayBuffer` confirmed in-browser on nested entry (ROUTE-26).
- SW `/app/sw.js` 200 + activated under `/app` scope on nested entry (ROUTE-27).
- Astro `/_astro/*` + React `/app/assets/*` resolve (ROUTE-28); dev-server routing also exercised
  during debugging (Vite serves `/app/` with identical client-side resolution).
- No header weakening, no Production Vercel reconfiguration (local-only verification).

## 7. Static Restore/Fresh Start compatibility

- Restore on a canonical URL recovers the exact project and keeps its URL (ROUTE-20; ST-01 still
  passes on legacy entry too).
- Fresh Start from a project creates the separate draft record and lands on its own canonical
  `/app/projects/:draftId/editor` (ROUTE-19); saved projects byte-intact; blank survives reload
  with no prompt loop (ST-02..05 green).
- Draft URLs are real project URLs — refresh/bookmark/Back/Forward behave identically.

## 8. Empty Advanced IDE verification

- Canonical empty-project URL shows zero files + welcome state, stable across reload (ROUTE-18).
- Manifest-less project direct URL: shell boots, zero npm commands, no spinner (ROUTE-21).
- Explicit npm project URL: install dispatches with zero typing (ROUTE-22/23); full
  install→dev→preview chain re-verified in the baseline suite (WC-03).
- Restart/reset buttons stay idle-gated; mount-time manifest synthesis remains container-local
  only (prior report's rationale stands; no IDB write-back exists).

## 9. Test matrix and exit codes

| Suite | Result |
|---|---|
| `project-flow-regression-tests.mjs` (node:test, incl. R1 parser matrix) | **18/18, exit 0** |
| `e2e-canonical-routes.mjs` ROUTE-01..27 + 404-check (Chromium + local unified build) | **24/24, exit 0** |
| `e2e-project-flow.mjs` prior baseline, canonical assertions | **20/20, exit 0** |
| workspace-reliability / coordination | 0 failures |
| editor-persistence T01–T40 | 0 failures |
| webcontainer-regression + dev-server-lifecycle (incl. T1–T10 race suite) | 0 failures |
| backup-restore T01–T40 + `e2e-backup-restore` (browser) | 0 failures, PASSED 100% |
| `audit-routes.mjs` | 11/11 |
| `tsc --noEmit` | 0 errors |
| `npm run lint` | 0 errors, 117 warnings (exact baseline) |
| `npm run build` | SUCCESS, 13/13 checks |

One genuine defect caught by the new suite and fixed: failed project lookups left the IDE shell
flags set, shadowing the recovery screen (ROUTE-13/14) — cleared in both cold-start paths.
No existing assertion was weakened: baseline URL expectations were updated to the new canonical
contract at equal strictness (same waits, same content checks, same isolation).

## 10. Storage integrity evidence

- No schema/storage-code changes (diff touches no DB module).
- ROUTE-29: IDs + pointer stable across refresh/Back/Forward (asserted values, not presence).
- ROUTE-30 + DATA-01: project ID sets byte-identical before/after navigation storms.
- ROUTE-25: export → clean-profile restore preserves IDs and file bytes (JSZip-verified).
- ROUTE-13/14: invalid/cross-profile URLs create zero records and display zero other projects.
- **Stated limit (by design, documented in-product on the recovery screen): project URLs
  identify a route plus a browser-local ID; they do not grant cross-device content access while
  storage remains IndexedDB-local. No cloud/sync/sharing implemented in this stage.**

## 11. Known limitations

- In-app `currentView` legal views (privacy/terms/cookies/disclaimer/documentation/history)
  remain React-internal screens (no URLs) — unchanged legacy behavior, out of scope.
- No localized routes exist (`en es nl fr ja ko zh ru pt` all missing): no i18n infrastructure in
  the codebase; no fake translations generated per directive. Adding Astro i18n routing is a
  separate authorized step.
- No pricing page exists and none was created per directive.
- The contact page has no form per directive (mailto + socials from authorized sources only).
- IDE dev-preview *content* proof remains wiring-level in automation (cross-origin SOP); static
  preview is content-verified.
- Owner smoke (Gate 7 equivalent for R1) still pending by definition.

## 12. Local routing commit SHA

- Branch: `fix/project-first-navigation-editor-startup` (local only — **not pushed**, no PR).
- Content-freeze commit: `34a3183` (extends preserved `bbc7236`; verify current HEAD with
  `git rev-parse HEAD` — any later local amend is metadata-only).
- Staged scope verified: 9 modified + 8 new files, all R1-scoped. Unrelated untracked
  artifacts left out and untouched on disk.

## 13. Recommended next Preview acceptance steps

1. Push ONLY the R1 branch (verify staged scope; keep untracked E3 artifacts out) — **requires
   explicit owner approval, NOT done here**.
2. Open Vercel branch Preview; run `e2e-canonical-routes.mjs` retargeted at the Preview origin
   (single `BASE` constant) + the 20/20 baseline.
3. Manually walk §20 items 1–10 incl. bookmark/refresh on `/app/projects/:id/ide`, Back/Forward
   across all five canonical screens, and an invalid-ID URL.
4. Promote via PR + merge only after Preview acceptance; Production needs no config changes.
