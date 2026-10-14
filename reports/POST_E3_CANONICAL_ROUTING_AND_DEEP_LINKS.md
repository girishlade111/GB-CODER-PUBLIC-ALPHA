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

---

# Stage R1.1 — Final Routing Audit, Legal Navigation & Full WebContainer Verification

**Date:** 2026-10-14 · **Branch:** `fix/project-first-navigation-editor-startup` (extends `a223efc`, preserved)
**Remote actions:** NONE.

## R1.1.1 Preflight

- HEAD `a223efc` present; `bbc7236` preserved; `38c3d1e` ancestor; `origin/main` unchanged at `38c3d1e`.
- Worktree clean at start (only unrelated untracked E3 artifacts, left untouched).

## R1.1.2 Page/route inventory (final)

**Astro-owned (static, directly navigable, refresh-safe):** `/`, `/about`, `/contact`,
`/privacy-policy`, `/terms-and-conditions`.

**React-owned (SPA shell for all `/app/*`):** `/app` (dashboard alias), `/app/projects`
(canonical dashboard), `/app/projects/new` (creation UI, no side effects), `/app/projects/:id`
(resolves to correct editor), `/app/projects/:id/editor`, `/app/projects/:id/ide`.
Legacy-safe: `/app/editor`, `/app/ide`, `/ide` (canonicalize or degrade gracefully).

`/app/projects/:id` is a **safe redirect**, not a details page: it resolves the project and
navigates to its stored editor. No placeholder routes were created.

## R1.1.3 In-app legal/about navigation audit

Audited every menu, footer link and dialog that opens About/Privacy/Terms/Contact content:

| Entry point | Before R1.1 | After R1.1 |
|---|---|---|
| `components/ui/Footer.tsx` — About / Contact / Privacy / Terms buttons | dispatched `navigate-to-*` events → URL-less React views | real `<a href>` to canonical Astro pages (`/about`, `/contact`, `/privacy-policy`, `/terms-and-conditions`) |
| `components/NavigationBar.tsx` — "About Us" menu item | dispatched `navigate-to-about` event → URL-less view | `<a href="/about">` |
| `components/pages/AboutPage.tsx` — footer `/privacy`, `/terms` links | 404 on Production (no such Astro pages) | `/privacy-policy`, `/terms-and-conditions` |

Documentation / Cookies / Disclaimer remain in-app `currentView` screens: no Astro pages exist
for them and no approved public content was available, so none were fabricated (per directive).
Contextual-action dialogs (e.g. snapshot restore confirm) are preserved as dialogs — they perform
an action, not navigate.

**Back-button behavior:** verified (LEGAL-02) — Footer → `/about` (Astro) → Back restores the
exact editor screen with the project and its IndexedDB files intact, zero data loss.
**Astro ownership:** verified (LEGAL-01) — `/about` serves Astro HTML with no React root.
**Same-profile second tab:** verified (LEGAL-03) — deep link to project B loads B, never mixes
with project A.

## R1.1.4 Route traceability matrix (ROUTE-01..30)

| Requirement ID | Test name | Test type | Evidence | Status |
|---|---|---|---|---|
| ROUTE-01 | homepage `/` loads Astro HTML with Start Coding CTAs to `/app/projects` | HTTP / Build | `e2e-canonical-routes.mjs` (ROUTE-01/17), `audit-routes.mjs` (#01), build check 1 | PASS |
| ROUTE-02 | `/about` loads direct Astro page without React root, title/canonical valid | HTTP / Browser | `e2e-canonical-routes.mjs` (ROUTE-02, LEGAL-01), build check 10 | PASS |
| ROUTE-03 | `/privacy-policy` loads direct Astro page with canonical metadata | HTTP | `e2e-canonical-routes.mjs` (ROUTE-03), build check 12 | PASS |
| ROUTE-04 | `/terms-and-conditions` loads direct Astro page with canonical metadata | HTTP | `e2e-canonical-routes.mjs` (ROUTE-04), build check 13 | PASS |
| ROUTE-05 | `/contact` loads direct Astro page with email/socials and no form | HTTP | `e2e-canonical-routes.mjs` (ROUTE-05), build check 11 | PASS |
| ROUTE-06 | `/app` dashboard alias opens dashboard directly with no auto-open of stored project | Browser / Unit | `e2e-canonical-routes.mjs` (ROUTE-06/07/16), `project-flow-regression-tests.mjs` | PASS |
| ROUTE-07 | `/app/projects` canonical dashboard loads cleanly with no auto-open | Browser / Unit | `e2e-canonical-routes.mjs` (ROUTE-06/07/16), `e2e-project-flow.mjs` (NAV-01/03) | PASS |
| ROUTE-08 | `/app/projects/new` opens creation modal; refresh creates nothing; cancel returns to dashboard | Browser / Unit | `e2e-canonical-routes.mjs` (ROUTE-08), `project-flow-regression-tests.mjs` | PASS |
| ROUTE-09 | Static project open navigates to canonical `/app/projects/:id/editor` | Browser | `e2e-canonical-routes.mjs` (ROUTE-09), `e2e-project-flow.mjs` (NAV-04a) | PASS |
| ROUTE-10 | Advanced project open navigates to canonical `/app/projects/:id/ide` | Browser | `e2e-canonical-routes.mjs` (ROUTE-10), `e2e-project-flow.mjs` (NAV-04b) | PASS |
| ROUTE-11 | Direct deep-link + hard refresh preserves editor mode and file selection | Browser | `e2e-canonical-routes.mjs` (ROUTE-11), `e2e-webcontainer-full.mjs` (TEST-C-3) | PASS |
| ROUTE-12 | Browser Back/Forward navigation retains correct route and project identity | Browser | `e2e-canonical-routes.mjs` (ROUTE-12/29/30), `e2e-project-flow.mjs` (NAV-06a/b) | PASS |
| ROUTE-13 | Invalid project ID in URL routes to safe recovery screen without creating empty project | Browser / Unit | `e2e-canonical-routes.mjs` (ROUTE-13), `project-flow-regression-tests.mjs` | PASS |
| ROUTE-14 | Clean browser profile opening remote ID gets safe unavailable screen and import option | Browser | `e2e-canonical-routes.mjs` (ROUTE-14) | PASS |
| ROUTE-15 | Legacy routes (`/app/editor`, `/app/ide`, `/ide`) canonicalize or degrade safely | Browser / Unit | `e2e-canonical-routes.mjs` (ROUTE-15), `audit-routes.mjs` (#04/05) | PASS |
| ROUTE-16 | Unrecognized `/app/*` path resolves safely to Dashboard without editor flash | Browser / Unit | `e2e-canonical-routes.mjs` (ROUTE-06/07/16), `project-flow-regression-tests.mjs` | PASS |
| ROUTE-17 | Astro landing page CTAs route directly to `/app/projects` | HTTP / Build | `e2e-canonical-routes.mjs` (ROUTE-01/17), unified build check 1 | PASS |
| ROUTE-18 | Empty Advanced IDE at `/app/projects/:id/ide` renders zero files and welcome state | Browser | `e2e-canonical-routes.mjs` (ROUTE-18), `e2e-webcontainer-full.mjs` (TEST-A) | PASS |
| ROUTE-19 | Fresh Start generates blank draft under its own `/app/projects/:draftId/editor` URL | Browser | `e2e-canonical-routes.mjs` (ROUTE-19), `e2e-project-flow.mjs` (ST-02..05) | PASS |
| ROUTE-20 | Restore recovers exact snapshot and maintains project identity under canonical URL | Browser | `e2e-canonical-routes.mjs` (ROUTE-20), `e2e-project-flow.mjs` (ST-01) | PASS |
| ROUTE-21 | Manifest-less project mounts files and boots shell with zero npm commands | Browser | `e2e-canonical-routes.mjs` (ROUTE-21), `e2e-webcontainer-full.mjs` (TEST-B) | PASS |
| ROUTE-22 | Project with `package.json` initiates automatic `npm install` without manual typing | Browser | `e2e-canonical-routes.mjs` (ROUTE-22/23), `e2e-webcontainer-full.mjs` (TEST-C-1) | PASS |
| ROUTE-23 | Shell readiness race eliminated; install dispatches only after prompt readiness | Browser | `e2e-canonical-routes.mjs` (ROUTE-22/23), `e2e-webcontainer-full.mjs` (TEST-C-1) | PASS |
| ROUTE-24 | Static project preview updates via live hot reload on canonical editor URL | Browser | `e2e-canonical-routes.mjs` (ROUTE-24), `e2e-project-flow.mjs` (WC-07) | PASS |
| ROUTE-25 | ZIP backup export and restore preserves IDs, files, and editor styles across profiles | Browser | `e2e-canonical-routes.mjs` (ROUTE-25), `backup-restore-tests.mjs` (T21..T35) | PASS |
| ROUTE-26 | COOP `same-origin` + COEP `require-corp` and `SharedArrayBuffer` active on nested routes | HTTP / Browser | `e2e-canonical-routes.mjs` (ROUTE-26/28), `webcontainer-regression-tests.mjs` | PASS |
| ROUTE-27 | Service Worker registers and activates scoped to `/app` on nested route entry | Browser | `e2e-canonical-routes.mjs` (ROUTE-27), build check 6 | PASS |
| ROUTE-28 | Static marketing assets (`/_astro/*`) and app assets (`/app/assets/*`) resolve on nested URLs | HTTP | `e2e-canonical-routes.mjs` (ROUTE-26/28), build check 4 | PASS |
| ROUTE-29 | Project ID charset, bounds, and encoding survive URL round-trips byte-identical | Browser / Unit | `e2e-canonical-routes.mjs` (ROUTE-12/29/30), `project-flow-regression-tests.mjs` | PASS |
| ROUTE-30 | Rapid navigation storms across project URLs cause zero duplication or state mix | Browser | `e2e-canonical-routes.mjs` (ROUTE-12/29/30), `e2e-webcontainer-full.mjs` (TEST-D) | PASS |
| LEGAL-01 | In-app footer legal link (About) navigates to canonical `/about` (Astro HTML, no React root) | Browser | `e2e-canonical-routes.mjs` (LEGAL-01) | PASS |
| LEGAL-02 | Browser Back from Astro legal page restores exact editor screen, project, and unsaved edits | Browser | `e2e-canonical-routes.mjs` (LEGAL-02) | PASS |
| LEGAL-03 | Same-profile second tab opening project B loads B cleanly without mixing project A | Browser | `e2e-canonical-routes.mjs` (LEGAL-03) | PASS |

All 30 ROUTE requirements and 3 legal navigation requirements verified passing across dedicated and integrated suites. No PASS was invented.

## R1.1.5 Full WebContainer E2E (Tests A–E) — `scripts/e2e-webcontainer-full.mjs`

Real Chromium, local unified build, COOP/COEP isolation, disposable profiles, synthetic `WC-*`
data. Application-level success only (no direct WebContainer API substitution).

- **Test A — empty IDE:** 0 files (explorer + stored record), welcome state, WebContainer boots,
  shell reaches ready prompt, zero npm install / dev / fake package.json. **PASS**
- **Test B — manifest-less project:** exact 3-file mount, zero npm, manual shell alive, store
  clean. **PASS** (after the R1.1.6 fix below)
- **Test C — React/Vite:** identity from canonical URL → mount → boot → shell ready → automatic
  install (zero typing) → install completes → `npm run dev` → Vite ready signal → **rendered
  React content read from the live preview frame** (CDP frame access, not SOP-bound) → Monaco
  edit → **live hot update** → IndexedDB persist → reload preserves route/identity/files → single
  startup dispatch. **PASS**
- **Test D — mid-init switch:** switch during shell init → stale work invalidated, zero
  cross-project installs/writes. **PASS**
- **Test E — Vue/Vite:** boot → install → dev → rendered Vue content. **PASS**

## R1.1.6 Genuine defect found & fixed: collapsed file tree on IDE deep links

**Symptom (caught by TEST-B / ROUTE-style direct-URL verification):** opening
`/app/projects/:id/ide` directly rendered the file tree with nested folders **collapsed**
(`src/` closed, children absent from the DOM) — even though the project's files loaded fully
(install/render proved it). The same project opened from the dashboard showed the tree fully
expanded.

**Root cause (confirmed via in-page instrumentation — `console.*` is dropped in production
builds, so localStorage was used):** the IDE-restoring effect's guard
`if (fullStackProject || isOpeningProject) { setIsRestoringWorkspace(false); return; }` ran on
cold start. `isOpeningProject` is true (set from the route), so it **prematurely cleared
`isRestoringWorkspace`** — mounting VSCodeMode with `EMPTY_VSCODE_PROJECT` (files=[]) *before*
the in-flight cold-start load completed. The FileTreeView's `expanded` Set initializes once from
that empty tree (`initial=[]`) and never re-expands when the real files arrive. Dashboard-opened
projects never hit this (they mount only after the load), so the bug was invisible to the R1
baseline.

**Fix (`src/App.tsx`):** split the guard — `fullStackProject` (memory intact) still clears the
flag; `isOpeningProject` now **returns without clearing**, letting the cold-start load own the
flag and clear it via `applyProjectToEditor` when the files land. VSCodeMode/FileTreeView then
mount once, with the full project, and the tree initializes expanded. The popstate path is
unaffected (there `isOpeningProject` is false when the restore branch should run).

**Verification:** after the fix, the FileTreeView mounts with the full tree and `src` renders
expanded on direct canonical IDE URLs (TEST-B passes; tree-file assertions green).

## R1.1.7 Environmental artifacts (distinguished from app defects)

- Running three Chromium suites concurrently caused Playwright actionability timeouts (nav-home
  click) and slow WebContainer boots (60s npm-dispatch poll exceeded). Isolated re-runs pass.
- In-page `fetch()` of the cross-origin preview frame is CORS-blocked (Vite dev server sends no
  ACAO) — a technique limitation, not an app defect; rendered-content proof uses CDP frame access.
- `console.*` instrumentation is stripped by the production build (`esbuild.drop: ['console']`);
  localStorage-based probes were used instead.

## R1.1.8 R1.1 test results

| Suite | Result |
|---|---|
| `project-flow-regression-tests.mjs` | 18/18, exit 0 |
| `e2e-canonical-routes.mjs` (26 checks incl. LEGAL-01..03) | 26/26, exit 0 |
| `e2e-project-flow.mjs` (prior baseline) | 20/20, exit 0 |
| `e2e-webcontainer-full.mjs` TEST-A..E | 5/5, exit 0 |
| workspace-reliability / coordination / editor-persistence / webcontainer / lifecycle / backup-restore / audit-routes | 0 failures |
| `tsc --noEmit` | 0 errors |
| `npm run lint` | 0 errors, 117 warnings (baseline) |
| `npm run build` | SUCCESS, 13/13 checks |

## R1.1.9 Files changed in R1.1

- `src/components/ui/Footer.tsx` — legal links → canonical Astro `<a href>`.
- `src/components/NavigationBar.tsx` — About Us → `<a href="/about">`.
- `src/App.tsx` — IDE-restoring guard fix (collapsed-tree root cause).
- `scripts/e2e-canonical-routes.mjs` — added LEGAL-01..03 block.
- `scripts/e2e-webcontainer-full.mjs` — NEW deep WebContainer verification suite.
- `reports/POST_E3_CANONICAL_ROUTING_AND_DEEP_LINKS.md` — this addendum.

No storage/schema changes; no new dependencies; no destructive operations; no real user data
touched (disposable profiles, synthetic data only).

## R1.1.10 Local commit

- Branch: `fix/project-first-navigation-editor-startup` (local only — not pushed, no PR).
- Stage R1.1 implementation commit: `3b05cb1` (extends preserved `a223efc` and `bbc7236`).
- Staged scope verified: 5 modified + 1 new file, all R1.1-scoped; unrelated
  untracked E3 artifacts left out and untouched on disk. No secrets.

## R1.1.11 Remaining limitations

- Documentation/Cookies/Disclaimer remain URL-less in-app screens (no approved public content;
  none fabricated).
- No localized routes (`en es nl fr ja ko zh ru pt` all missing — separate authorized step).
- No pricing page; contact has no form (per directive).
- Owner smoke still pending by definition.

## R1.1.12 Release gate

**`READY_FOR_STAGE_R2_PREVIEW`** — routing is canonical and verified, legal navigation is
consistent, the deep-link file-tree defect is fixed, and the full WebContainer chain (empty /
manifest-less / React / Vue / mid-init switch) is verified end-to-end in real Chromium.
