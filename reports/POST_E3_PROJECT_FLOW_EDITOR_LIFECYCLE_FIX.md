# Post-E3 Project-First Navigation & Editor Lifecycle Fix

**Branch:** `fix/project-first-navigation-editor-startup` (local only, from verified Production `main` @ `38c3d1e`)
**Date:** 2026-10-14
**Scope:** REQUIRED FIX 1–4 only. No Phase 2.2, no push, no PR, no deployment, no Vercel changes.

---

## 1. Stage E3 completion evidence (Gate 0)

**Verdict carried forward: `PRODUCTION_RELEASE_PASS_WITH_KNOWN_LIMITATIONS`** (prior session report
`reports/PHASE_2_1_STAGE_E3_PRODUCTION_RELEASE.md`, untracked, preserved untouched).

Independently re-verified this session before any code change:

- PR #31 `MERGED` at `38c3d1e` (GitHub API: `mergedAt 2026-10-14T04:39:00Z`, head `2fe9080`).
- `origin/main` = `38c3d1e`; Phase 2.1E hotfix `1b6973b` is an ancestor.
- Latest Production GitHub deployment `7057013079` targets `38c3d1e`, state `success`.
- `https://code.ladestack.in/` live (marketing 200, `/api/health` 200).
- `scripts/verify-e3-production.mjs` executed against Production (disposable profiles, synthetic
  `E3-*` data): **P1/P4/P6-restore/P8 clean PASS**. Five scenario checks failed on first run with
  harness-artifact signatures; focused confirmation probes (visible-marker edit→preview→persist→reload,
  rename-with-persist-wait, SW-activation-with-wait, pointer-via-real-open) went **4/4 PASS**,
  proving all five were test-harness artifacts (invisible comment marker, missing debounce wait,
  missing SW-activation wait, zip-path assumption with restore 3/3 proving function, seeded-DB-only
  pointer setup), not application regressions.
- **Discrepancy disclosed:** the prior E3 doc claims a 9/9 PASS final run; this session's rerun
  reproduced 4/9 clean passes + 5 artifact failures, then confirmed every disputed behavior with
  independent probes. No release-critical regression found in either dataset. Evidence over
  paperwork: the release itself is healthy.
- No real user data touched (disposable contexts only; P6-restore used a clean profile; no
  `deleteDatabase`/destructive calls anywhere in the harness).
- Gate 0 outcome: proceed (no `BLOCKED`/`FAILED`/inconclusive release-critical item).

## 2. UX problems addressed (all confirmed in source before fixing)

1. **Dashboard not first:** cold start honoured `gb-coder-active-project-id` on every `/app` arrival,
   auto-opening the last project; the dashboard was reachable only via the editor logo.
2. **Fresh Start kept old code:** `SessionRecoveryModal.onStartFresh` only dismissed the prompt (plus
   autosave backup). `fileProject` was untouched, so Monaco/Preview kept showing old code, and the
   autosave debounce re-created the recovery slot from the retained buffers.
3. **No truly-empty IDE project:** `handleOpenProject` injected the plain starter scaffold into ANY
   zero-file project (including `vscode` ones); `handleCreateProject` always seeded starter files with
   hardcoded `projectType: 'plain'`; the New Project modal offered no empty/template choice.
4. **npm auto-run without npm metadata:** `mountProject` synthesizes a root `package.json` (with a
   `dev: vite` script) when none exists, so `needsDependencyInstall` always fired `npm install &&
   npm run dev` — even for manifest-less projects. (Phase 2.1E readiness/watchdog machinery itself
   was sound and is preserved.)

## 3. Root causes

- Single `/app` URL served as dashboard AND static editor with no route distinction; pointer
  honoured unconditionally at startup (`App.tsx` state initialisers + cold-start reopen effect).
- Fresh Start cleared UI state, never the source of truth (`fileProject`, the sole owner of
  `html/css/javascript` via `projectToTriple`); baselines (`savedFilesRef`, history) untouched.
- Creation/open paths treated "no files" as "data loss, inject scaffold" for every editor style.
- Auto-start gating checked only `files.length > 0`, never manifest presence; mount-time manifest
  synthesis (container-FS only, never written back to IndexedDB) fed the installer.

## 4. Routing changes (`src/utils/appRoutes.ts`, `src/App.tsx`)

- New canonical routes: `/app` + `/app/projects` = Projects Dashboard (never auto-opens);
  `/app/editor` = Static Editor (explicit project required); `/app/ide` + legacy `/ide` = Advanced
  IDE (unchanged). `vercel.json` already rewrites `/app/(.*)` → SPA: **no infra change needed**.
- New pure helpers: `isDashboardPath`, `isStaticEditorPath`, `isEditorRoutePath` (+ `navigateReplace`);
  existing `isVSCodeModePath`/`navigateTo` semantics kept. Helpers take an optional pathname so they
  are unit-testable in Node (no `window` required when explicit).
- Cold start honours the stored pointer ONLY on editor routes; dashboard arrivals always land on the
  dashboard (pointer kept for recency display; explicit open re-arms it).
- Explicit opens navigate to `/app/editor` or `/app/ide` by `record.editorStyle`; a project always
  reopens in its correct editor (deep link to the wrong editor URL is corrected, not forced).
- Direct `/app/editor` with missing/dead pointer is replaced (not pushed) to `/app`.
- Back/Forward handled per destination without stacking entries: to dashboard = flush + clear
  in-memory (stored pointer KEPT so Forward re-arms); to static editor = leave IDE cleanly or reopen
  via guarded open path (same-path navigations no-op); to IDE = existing restore flow.
- Dashboard-URL-with-no-project correction effect (replace, no loop).
- Opening states show the loading fallback instead of flashing dashboard/editor (`isOpeningProject`
  now armed on dashboard opens/creates too, with abandon-path resets).

## 5. Static recovery semantics (`src/App.tsx`)

- **Restore** (unchanged path): exact autosave project → `setFileProject` + tab restore + toast.
- **Fresh Start** (`handleFreshStart`, declared after `applyProjectToEditor` — declaration order is
  load-bearing, documented in code):
  - Project open: flush first (failure blocks, same discipline as switching); then a NEW empty
    draft record (`plain`/`plain`, zero files) is created and opened `seededEmpty`, so empty buffers
    can never persist over the saved project. History baselined on empties.
  - No project: buffers replaced with genuinely empty triple, queued save dropped, dirty baseline
    re-taken on empties, history baselined, tabs preserved (same paths, now empty).
- **Phantom-prompt suppression:** mount-time recovery offer now requires recoverable content
  (any non-blank buffer); an empty autosave (Fresh Start residue) is dropped silently instead of
  re-prompting after every fresh start. Backups (`backup_*`) untouched.
- Verified: old code never reappears (Monaco models read directly in tests), saved project byte-intact,
  blank survives rerender + reload, no modal loop.

## 6. Empty Advanced IDE behavior

- `handleOpenProject` / cold-start: zero-file projects open as-is (empty draft, `seededEmpty`, first
  edit persists). No scaffold injection for any editor style; neutral toast replaces the old error.
- New Project modal: style (Static Editor / Advanced IDE) × starting point (static: Starter /
  Blank; IDE: Empty / React / Vue). React/Vue use the existing `createProjectOfType` scaffolds
  (with `package.json` + entry), generated once at creation; `editorStyle` and `projectType` stored
  as separate record fields.
- `VSCodeMode` empty state (`vscode-empty-state` + Load Folder/File) + explorer file creation
  preserved; zero-file tree asserted in tests.

## 7. WebContainer lifecycle changes (2.1E hotfix preserved)

- New `webcontainerService.hasNpmManifest(files)` gate (same manifest regex as the mount layer).
- `TerminalTab`: boot always, mount only with files (unchanged); auto-start dispatch requires a real
  manifest (else idle note); restart path returns idle notes for zero files AND manifest-less
  projects; manual typed commands unaffected.
- `VSCodeMode`: restart button + container-reset gated (reset still remounts FS, skips only the
  restart dispatch without a manifest).
- Lifecycle split achieved: IDE open → boot → shell ready → idle; explicit npm-project open →
  mount → fingerprint → install iff needed → dev server iff scripted → live preview. No duplicate
  startup (epoch/fingerprint idempotency untouched), no cross-project writes, no infinite
  installing state.
- Mount-time manifest synthesis (`filesToFileSystemTree`) intentionally left in place: it affects
  only the ephemeral container FS (nothing reads it back into IndexedDB — verified, single
  direction), serving manual `npm install` UX. All AUTOMATIC dispatch is now manifest-gated, which
  is the observable FIX 4 requirement.

## 8. Files changed

- `src/utils/appRoutes.ts` — routes + pure helpers + `navigateReplace` (+ Node-compatible guards).
- `src/App.tsx` — project-first startup, explicit editor routes, Back/Forward, Fresh Start +
  phantom suppression, template-aware creation, empty-open semantics, loading states.
- `src/components/projects/NewProjectModal.tsx` — style × starting-point selection
  (`NewProjectTemplate`), mismatched-choice guard.
- `src/components/vscode/VSCodeMode.tsx` — restart/reset idle guards.
- `src/components/Console/TerminalTab.tsx` — manifest-gated auto-start/restart + idle notes.
- `src/services/webcontainer/webcontainerService.ts` — `hasNpmManifest` helper only.
- `scripts/project-flow-regression-tests.mjs` — NEW, node:test logic suite (11 tests).
- `scripts/e2e-project-flow.mjs` — NEW, Playwright journey suite (20 checks).

No Astro/marketing, Monaco config, DB, SW, ZIP, or WebContainer-integration changes. No new
dependencies. No storage schema change.

## 9. Storage compatibility review

- `gb-coder-projects-db` v1, stores `projects`/`projectFiles`: untouched. `createProject` already
  wrote record+files atomically; new templates flow through the same `NewProjectInput`.
- `gb-coder-workspace` v1: untouched (standalone-workspace paths unchanged).
- `gb-coder-active-project-id`: written only on explicit open/create/dashboard-return/delete —
  never synthesized; cold start on dashboard routes leaves it intact but unhonoured.
- `editorStyle`/`projectType` separate end-to-end (modal → record → `applyProjectToEditor` →
  reopen); DB sanitizers unchanged.
- Fresh Start: failed flush blocks; draft identity prevents empty-over-saved writes; autosave
  backup preserved before clearing.
- No `localStorage.clear`, no `deleteDatabase`, no unconditional file clearing (verified by grep +
  behavioral DATA-01 + full backup/restore e2e).

## 10. Automated test matrix (Gate 5)

| ID | Cover | Result |
|---|---|---|
| NAV-01/02/03 | landing CTAs → dashboard; pointer ignored on dashboard entry | PASS (e2e) |
| NAV-04 | plain → `/app/editor`, vscode → `/app/ide` | PASS (e2e) |
| NAV-05 | starter/blank + empty/react/vue offered; style/template binding | PASS (e2e + logic) |
| NAV-06 | Back → dashboard, Forward → editor+content | PASS (e2e) |
| ST-01 | restore exact html/css/js (Monaco models) + preview | PASS (e2e) |
| ST-02/03/04/05 | blank buffers, saved project intact, no stale rehydrate, blank after reload | PASS (e2e) |
| IDE-01/02/03 | zero files; exact tree; template-once files | PASS (e2e + logic) |
| IDE-04/WC-01/02/04 | idle boot, zero npm, non-npm stays idle | PASS (e2e) |
| WC-03 | explicit npm project → install dispatch → dev ready → preview wired | PASS (e2e) |
| WC-05/06 | slow-shell queue + switch cancellation | PASS (existing T1–T10 + e2e WC-06) |
| WC-07 | monaco edit → live preview + persist | PASS (e2e) |
| DATA-01/02 | control record intact; ZIP export/restore | PASS (e2e + `e2e-backup-restore` 100%) |

New suites: `project-flow-regression-tests.mjs` 11/11; `e2e-project-flow.mjs` 20/20 (real Chromium,
`preview-combined` over `dist/`, disposable profiles, synthetic `PF-*` data).

## 11. Local browser results (Gate 6, all executed by agent)

- `npx tsc --noEmit`: **0 errors** (baseline: 0).
- `npm run lint`: **0 errors, 117 warnings** (exact pre-existing baseline count).
- `npm run build` (unified, deterministic): **SUCCESS**, all 9 output-integrity checks PASS.
- Existing suites, post-change reruns, all green: workspace-reliability, workspace-coordination,
  editor-persistence (T01–T40), webcontainer-regression + lifecycle T1–T10 (15 tests),
  backup-restore (T01–T40), routes (11/11), `e2e-backup-restore` (browser, PASSED 100%),
  `e2e-workspace-*` family unaffected (no API changes underneath).
- New browser journeys: **20/20 PASS** (rear-changed code paths only; first run caught one genuine
  TDZ crash from declaration order — fixed, documented in code, covered by the passing suite).
- Harness notes (environmental, fixed in-script, no app impact): preview server binds 127.0.0.1
  (use it, not `localhost`), undici `fetch` rejects port 4190 in this env (suite uses `127.0.0.1:4191`
  + `node:http` health check like the other suites), Playwright `addInitScript` re-runs on every
  navigation (recovery seeds use one-shot `evaluate` writes instead), cross-origin preview-frame
  content is unreadable by design (wiring asserted via address bar + iframe src + dev-ready output).

## 12. Remaining limitations

- Preview-content proof for IDE dev-server rendering is wiring-level (address bar URL + bound
  iframe + Vite ready output), not pixel/content-level — SOP forbids reading the cross-origin
  frame from automation. Static-editor preview IS content-verified (same-origin srcdoc).
- `filesToFileSystemTree` still synthesizes a container-local `package.json` at mount (manual-use
  only; never persisted). Removing it is a behavior change for manual terminal flows — deferred
  deliberately, recorded here.
- Fresh Start with a project open creates a real (deletable) draft record rather than a transient
  object — explicit trade-off for crash safety, documented in code.
- Owner smoke (Gate 7) still pending by definition.

## 13. Local commit

- Branch: `fix/project-first-navigation-editor-startup` (local only — **not pushed**, no PR).
- Content-freeze commit: `b5097cb` (verify current HEAD with `git rev-parse HEAD`; any later
  local amend is metadata-only).
- Staged scope verified: 6 source files + 2 new test scripts + this report only. Unrelated
  untracked artifacts (`project_files.zip`, `.opencode/`, prior E3 docs/harnesses,
  `GB_CODER_AUDIT_REPORT.md`) left out of the commit and untouched on disk.

## 14. Preview deployment recommendation

No Preview or Production deployment performed (out of scope per directive). When the owner approves:
1. Push ONLY `fix/project-first-navigation-editor-startup` (verify no unrelated files staged —
   untracked E3 artifacts and `project_files.zip`/`.opencode/` stay out).
2. Let Vercel build the branch Preview automatically; run `e2e-project-flow.mjs` retargeted at the
   Preview URL (replace local `BASE`) plus owner smoke (Gate 7 checklist below).
3. Promote via PR + merge only after Preview acceptance; Production needs no Vercel changes
   (`/app/(.*)` rewrite/headers already cover the new routes).

---

## Gate 7 — Owner acceptance checklist (manual, ~15 min, standard browser)

1. **Landing → Dashboard:** open `/` → Start Coding / Open Dashboard → dashboard lists projects,
   no editor auto-opens (even with a previously opened project).
2. **Dashboard → Existing project:** open a plain project → `/app/editor` with its content; open a
   VS Code project → `/app/ide` with its tree.
3. **Dashboard → New Static project:** New Project → Static Editor → Starter (scaffold) and Blank
   (empty buffers) both create and reopen correctly.
4. **Static Restore:** type → wait ~3s → reload → "Session Recovered" → Restore → exact content back.
5. **Static Fresh Start:** same setup → Start Fresh → all three editors blank + blank preview →
   reload → still blank, no prompt loop; the saved project still intact in the dashboard list.
6. **New empty Advanced project:** New Project → Advanced IDE → Empty → explorer empty, welcome
   state, zero files after reload.
7. **Advanced IDE idle:** with the empty project, terminal boots to a prompt; no "Installing
   dependencies", no spinner, no dev server.
8. **Explicit React/Vue load:** New Project → React → terminal auto-installs, Vite becomes ready,
   preview renders; edit a file → preview hot-updates.
9. **Reload recovery:** reload in each editor → same project, same content, same route.
10. **ZIP backup/restore:** dashboard Backup → Export → Restore into the same browser → projects
    come back intact.
