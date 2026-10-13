# Phase 2.1B — Minimal Workspace Reliability Fixes: Implementation Report

**Branch:** `phase-2.1-workspace-reliability` (isolated local only; nothing pushed, no PR, no deploy).
**Base:** approved production baseline `53ba1e4` (via `origin/main`).
**Prior commit:** `08e188d` (Phase 2.1A harness: 7 red / 11 green).
**Scope:** W01–W07 fixes only. No WebContainer, preview, search, shortcut, template, git-sync, routing, PWA, or `App.tsx` structural changes. Snapshot/version-history system explicitly deferred (§12).

---

## 1. Before/after results (W01–W07)

| Test | Before (2.1A) | After (2.1B) | Evidence |
|---|---|---|---|
| W01 backup under quota | FAIL threw `QuotaExceededError` | PASS no-throw, slot retained | node harness |
| W02 clear when blocked | FAIL threw `Access denied` | PASS no-throw | node harness |
| W03 shape-invalid autosave | FAIL returned junk object | PASS returns null, bytes retained | node harness |
| W03b 11 malformed variants + valid record | n/a (new) | PASS | node harness |
| W04 dot segments | FAIL kept `src/./a.jsx` | PASS `src/a.jsx` | node harness |
| W04b traversal/slash/unicode/nesting parity | n/a (new) | PASS | node harness |
| W05 dangling pointer | FAIL pointer survived delete | PASS cleared on commit | node + real IDB (B-W05) |
| W05b failed delete preserves pointer | n/a (new) | PASS | node harness |
| W06 fileCount/id clobber | FAIL `fileCount: 9999` stored | PASS stripped, id stable | node + real IDB (B-W06) |
| W06b legit updates + count consistency | n/a (new) | PASS | node harness |
| W07 dup×delete race (dup first) | FAIL file-less copy | PASS complete copy | node + real IDB (B-W07) |
| W07b delete first → null | n/a (new) | PASS both layers | node + real IDB |
| W07c ghost duplicate → null | n/a (new) | PASS both layers | node + real IDB |
| W07d/G10 112-file duplicate SHA-256 | FAIL null copy | PASS 112/112 match | node + real IDB (B-W07d, subtle-hashed) |

Final node suite: **25/25 PASS ×3 consecutive runs**. Existing editor-persistence: **40/40 PASS** (incl. corrected T39). Backup audit: **40/40 PASS**. Real-browser suite: **4/4 scenarios PASS** (real IndexedDB, disposable profiles).

---

## 2. Exact source files changed

- `src/services/snapshotService.ts` — W01/W02/W03 (+ exported `isValidSnapshotState`).
- `src/types/files.ts` — W04 (`normalizePath` dot-segment resolution).
- `src/services/projects/projectDatabase.ts` — W05 (pointer cleanup on committed delete), W06 (patch allowlist), W07 (single-transaction duplicate).
- `src/App.tsx` — recovery caller adaptations only (honest Start-Fresh toast; no `openFile('')` on null path).
- `scripts/audit-harness.mjs` — additive bundle exports + fake-IDB commit-semantics fix (see §5).
- `scripts/workspace-reliability-tests.mjs` — W01–W07 turned green + 8 new tests (W03b, W04b, W05b, W06b, W07b/c/d).
- `scripts/editor-persistence-tests.mjs` — T39 now genuinely sets/checks `gb-coder-active-project-id`.
- `scripts/e2e-workspace-reliability.mjs` — NEW real-browser suite (B-W05/B-W06/B-W07/B-W07d).
- `package.json` — one script line (`audit:e2e:workspace-reliability`).

No storage keys, DB names, versions, routes, SW, or ZIP formats changed. No IDB migration.

---

## 3. Root cause and minimal fix per defect

**W01/W02 — unguarded localStorage in dismiss path.** `backupAutoSave()`/`clearAutoSave()` used bare `getItem/setItem/removeItem`; any throw (quota, blocked third-party storage) propagated out of the recovery modal's click handler, wedging it open with the state update (`setSessionRecoveryData(null)`) never reached. Fix: try/catch on every storage touch, boolean success returns. **Invariant enforced:** the live slot is cleared only after the backup write succeeds; on failure the original is preserved and `false` is returned. `App.tsx` Start-Fresh now toasts an honest error instead of claiming cleanup.

**W03 — unvalidated recovery record.** `getAutoSave()` returned `JSON.parse` output unchecked; `App.tsx` mount effect + `onRestore` fed it straight into `setFileProject()`/`openFile()`. Fix: `isValidSnapshotState()` (object shape, `project.files[]` with string path/content, `openPaths: string[]`, `activePath: string|null`, `externalLibraries: object[]`, optional settings object, string `lastModified` since the modal renders it unconditionally). Malformed → `null`; **raw bytes retained, never wiped**. `onRestore` additionally guards null/empty `activePath` (previously created a literal `''` tab).

**W04 — dot segments preserved.** Old `normalizePath` collapsed slashes but kept `.` segments, creating phantom tree folders and unstable bundler specifiers. Fix: skip `.` segments; **`..` kept verbatim** so `validateFilePath`'s traversal rejection keeps firing (resolution must never launder traversal); trailing-slash signal preserved so the directory rule fires exactly as before. Historical keys in IDB are **not migrated/renamed/merged**: reads are exact-match so old `src/./a.jsx` rows still load; only new creates/renames normalize. If an old alias collides with a normalized path, the existing case-insensitive collision check rejects the new write — data is never auto-merged.

**W05 — pointer survives delete.** `deleteProject` never touched `gb-coder-active-project-id`. Fix: after the delete transaction commits (`withTransaction` resolves non-null only on commit), clear the pointer iff it still names the deleted id. Failed/aborted deletes resolve `null` → pointer preserved; pointers naming other projects untouched.

**W06 — blind metadata spread.** `updateProject` spread any runtime patch over the record; `fileCount` was not even type-excluded. Fix: `Pick`-based type plus runtime allowlist (`name`, `lastOpenedAt`, `editorStyle`, `projectType`, `entry`) with enum re-sanitization matching creation. Only verified callers (`touchProject`, `updateProjectEditorPreference`) use the narrowed surface.

**W07 — non-atomic duplicate.** Three separately queued ops (get → read files → restore) let a delete commit between read and restore, resurrecting metadata with zero files. Fix: one `enqueue`'d `readwrite` transaction over both stores — read record + files, write copy with fresh id, sanitized style/type, `fileCount = stored.length`. Missing original → `null`, nothing created. Only synchronous ID generation occurs between reads and writes (no async gap may idle a transaction). Callers are `await`-compatible (async→non-async signature change is transparent).

---

## 4. Mock vs real-browser evidence

- **Mock (node + fake IDB/localStorage):** 25/25 — full W/G suite incl. quota-throwing storage stubs and IDB-unavailable faults. Clearly labeled by construction (harness file header).
- **Real (Chromium, real IndexedDB, disposable profile per scenario):** 4/4 — B-W05 pointer lifecycle, B-W06 allowlist + count-vs-store agreement, B-W07 both race orders + ghost duplicate, B-W07d 112-file SHA-256 via `crypto.subtle` (localhost = secure context).
- **NOT_RUN (honest):** mid-transaction abort injection from outside the transaction — no deterministic browser API; the `settle(null)` path is covered by unavailable-IDB faults (G05/W05b). Real abort semantics belong to the IDB engine; our handling is resolve-null-never-reject, verified.

---

## 5. Transaction-atomicity evidence

- W07/W07b assert both enqueue orders deterministically in mock AND real IDB: dup-first → complete copy + original gone; delete-first → `null`, zero projects created; ghost id → `null`.
- Incidental finding while testing: the harness fake fired `transaction.oncomplete` on a fixed 10 ms timer, so multi-step transactions could settle a stale `null` under event-loop load (flaky W07/G10). Fixed the **test fake only** (pending-request counter; `oncomplete` fires when no requests remain — matching real IDB liveness). No `src/` behavior depends on this. Stability after fix: 25/25 ×3, 40/40, 4/4 browser.

---

## 6. Autosave/recovery data-safety evidence

- W01/W02: quota/blocked faults → no throw, original slot byte-retained (asserted).
- W03b: 11 malformed variants (bad JSON, null, array, `{}`, unknown shape, empty path, missing content, non-array `openPaths`, non-string entries, non-string `activePath`, non-array libraries) → all `null`, raw bytes retained each time; valid record round-trips.
- No destructive repair anywhere: validation never writes.

---

## 7. Metadata and file-count integrity

- W06: `{fileCount: 9999}` + forged `id` stripped; stored `fileCount`/`id` unchanged (mock + real IDB).
- W06b: rename + style change apply; after adding a file, `fileCount === readProjectFiles().length`.
- T39 (corrected): pointer genuinely set to the doomed project → cleared on delete; inactive-project delete preserves pointer; survivor `editorStyle` intact.

---

## 8. 112-file SHA-256 comparison

- G02 (create/read): 112/112 paths + hashes match (incl. unicode names, empty files).
- W07d (duplicate): 112/112 match in mock; B-W07d: 112/112 match in real Chromium IDB (hashes computed in-page via `crypto.subtle`, compared in Node).

---

## 9. Regression suite results

| Suite | Result |
|---|---|
| `audit:workspace-reliability` (node) | 25/25 PASS ×3 |
| `audit:e2e:workspace-reliability` (real IDB) | 4/4 PASS |
| `audit:editor-persistence` (T01–T40) | 40/40 PASS |
| `audit:backup` | 40/40 PASS |
| Static Editor / Advanced IDE / WebContainer behavior | Unchanged (no `src/` changes outside §2 list; full build + route audits deferred to 2.1C per method) |

---

## 10. TypeScript and lint comparison

- `tsc --noEmit -p tsconfig.app.json`: **baseline 16 errors → final 16 errors, zero new.** All 16 pre-existing (unused imports incl. `App.tsx:65`, `PreviewPanel` missing `toast`, backup-service typing, `StackBlitzStartupLoader` narrowing). Unrelated errors left untouched per scope.
- `eslint` on the four changed `src/` files: **0 errors**, 1 pre-existing warning (`App.tsx:65` unused import). No new warnings.

---

## 11. Remaining React-level races (deferred to 2.1C)

Documented with file:line in 2.1A, NOT fixed in 2.1B (require component-level work + e2e): stale async project-switch loads (`App.tsx:1968-1998` lacks the `cancelled`/epoch guard used by cold-start paths); autosave debounce windows (1200 ms IDB / 2000 ms autosave) lost on rapid switch/refresh; global single-slot autosave vs per-project IDB divergence (cross-project restore can misattribute files — partially mitigated by W03 validation, full fix needs per-project scoping, excluded as redesign); dirty dots track the localStorage write, not the IDB commit; `VSCodeMode` folder-rename focus/split-state ephemerality; dirty-set rename/delete leaks; `MAX_TABS` eviction of dirty tabs; `FileTreeView` weaker validation vs `validateFilePath`. 2.1C must add epoch guards, flush-on-switch, dirty-signal realignment, and Playwright-level rapid-switch/refresh drills.

---

## 12. Unresolved risks and blockers

1. Historical `.`-segment IDB keys coexist with normalized paths (accepted; documented in §3 W04).
2. `tsc` 16 pre-existing errors remain (noisy gate for 2.1C; recommend separate cleanup approval, not silent fixing).
3. Mid-transaction abort injection NOT_RUN (see §4).
4. Dual persistence (legacy `projectStore` localStorage blob) untouched — still a divergence risk; needs the 2.1 read-path facade discussion in 2.1C planning.
5. No full `npm run build` executed in 2.1B (deferred to 2.1C verification).

---

## 13. Branch and status

- Branch `phase-2.1-workspace-reliability` @ baseline `53ba1e4` + `08e188d` (2.1A) + uncommitted 2.1B work (commit after this report).
- Modified: `package.json`, `scripts/audit-harness.mjs`, `scripts/editor-persistence-tests.mjs`, `scripts/workspace-reliability-tests.mjs`, `src/App.tsx`, `src/services/projects/projectDatabase.ts`, `src/services/snapshotService.ts`, `src/types/files.ts`. New (untracked): `scripts/e2e-workspace-reliability.mjs`. Preserved untracked: 4 pre-existing files + `.opencode/` env dir (untouched).
- No push, no PR, no deploy, no `main`/Vercel changes, no user data touched, CodeRabbit untouched.

---

## 14. Deferred snapshot design summary (no implementation)

Future IDB snapshot/version-history design must resolve: storage cost model (per-snapshot bytes vs 5 MB localStorage precedent — snapshots belong in IDB with explicit quota accounting + `storage-warning` integration); retention policy (count + age caps, manual pins exempt); full vs incremental (content-addressed blobs favor incremental; restore simplicity favors full — recommend full-project checkpoints first); atomicity (single-tx snapshot write; crash during snapshot must never touch live stores); ZIP compatibility (snapshots exportable through existing manifest format, never a second backup format); version metadata (schema version, project id, file hashes, editorStyle); multi-tab concurrency (generation counter to avoid cross-tab LWW clobber); user-controlled restore (explicit confirm + pre-restore auto-backup reusing W01 semantics); failure handling (resolve-null-never-reject, surfaced — never silent). Implementation only after separate owner approval.

---

## 15. Recommendation for 2.1C

Proceed to **2.1C Recovery and Regression Verification**: full unified build, route/header audits, SW migration tests, Monaco/IDE smoke, WebContainer regression smoke, backup/restore e2e, Playwright rapid-switch/refresh/restart drills for the §11 race list, and the 2.1D acceptance report. No 2.1B follow-ups remain open.

---

# Phase 2.1C — React Races, Autosave Coordination & Browser Recovery: Final Report

## C1. Baseline: branch, commits, tree

- Branch: `phase-2.1-workspace-reliability` (local only; never pushed).
- Base: production baseline `53ba1e4` (`origin/main`).
- Prior commits: `08e188d` (2.1A harness), `217379c` (2.1B fixes).
- 2.1C work committed locally on top (see C17). `main` untouched
  (local `main` still stale at `d2ee31a`; `origin/main` still `53ba1e4`).
- Untracked files preserved: 4 pre-existing reports/scripts + `.opencode/`
  env dir. No `git clean`, no resets, no user-data access.

## C2. Exact modified files (2.1C only)

Application code (behavioral, all minimal and in-scope):

- `src/App.tsx` — transition generations; status-returning flush with
  pending-restore; guarded open/create/import/delete/dashboard transitions;
  seeded-empty baselines + deferred auto-persist; `workspaceKey`
  (project + editor location); commit-exact `markFilesSaved` + `persistSignal`;
  central file/folder validation with boolean returns; popstate
  back/forward restore without preference rewrite; status-bar save indicator
  now driven by confirmed commits.
- `src/hooks/useFileWorkspace.ts` — `projectKey` identity reset;
  `markFilesSaved(files)` replacing the autosave-tick `savedSignal` clearing;
  `removeFile` baseline prune; `markAllSaved` removed (had zero callers).
- `src/hooks/useAutoSave.ts` — success/failure honesty (hash, timestamp and
  `autosave` event advance only on confirmed writes); quota/blocked failures
  dispatched to the existing `STORAGE_WARNING_EVENT` channel.
- `src/services/projects/projectDatabase.ts` — `saveProjectFiles` returns
  `{ snapshot, persisted }` (failure is observable; previous snapshot still
  preserved for retry).
- `src/services/snapshotService.ts` — `saveAutoSave` returns
  `{ ok, quotaExceeded }`.
- `src/types/files.ts` — (unchanged in 2.1C; W04 holds).
- `src/utils/workspaceCoordination.ts` — NEW pure module: transition
  coordinator, `remapPath(s)`, `chooseEvictionTab`, `validateWorkspacePath`,
  `validateWorkspaceFolder` (+ `.gitkeep` exemption, anti-self-nesting).
- `src/components/vscode/VSCodeMode.tsx` — folder-rename focus fix;
  dirty remap/prune/clear-on-commit (project-scoped, content-matched);
  eviction sparing focused/dirty tabs; strict pre-validation; owner-boolean
  handling; `persistSignal` + `activeProjectId` props.
- `src/components/vscode/FileTreeView.tsx` — respects owner rejections
  (no phantom tabs/toasts); callback types widened to `boolean | void`.

Test harness only (no app behavior):

- `scripts/workspace-coordination-tests.mjs` — NEW (13 tests, C01–C13).
- `scripts/e2e-workspace-app.mjs` — NEW (16 real-app scenarios S1–S11, S6b–d).
- `scripts/audit-harness.mjs` — additive exports + fake-IDB commit-semantics
  fix (pending-request counter; `oncomplete` fires when no requests remain,
  matching real IndexedDB liveness — previously a fixed 10 ms timer that
  could settle multi-step transactions prematurely under load).
- `scripts/monaco-worker-tests.mjs` — event-based `ensureEditorOpen`;
  unified-build entry path for test 13.
- `scripts/e2e-editor-persistence.mjs`, `scripts/e2e-backup-restore.mjs` —
  unified-build route mapping (`/app`, legacy `/ide`) + `/ide` assertions.
- `package.json` — three script lines
  (`audit:workspace-coordination`, `audit:e2e:workspace-app`,
  and the pre-existing `audit:e2e:workspace-reliability` from 2.1B).
- `reports/migration-results.json` — regenerated by the migration suite run.

No storage keys, DB names/versions, routes, SW, ZIP formats, or Vercel
config changed. No IDB migration. Snapshot/version-history NOT implemented
(explicitly deferred, design in §14 of the 2.1B report).

## C3. Fixes implemented (summary)

A. **Transition generations** on open/create/import/delete/dashboard-return
   plus the forward-restore path: stale completions abandon before touching
   pointer, editor, or store; failed flushes block destructive transitions
   with pending restored for retry (2.1C-§03/§04).
B. **Result contracts**: `{ snapshot, persisted }`, `{ ok, quotaExceeded }`,
   status-returning flush; success signals only on confirmed persistence;
   failures stay retryable (2.1C-§04/§05).
C. **Project-scoped workspace**: identity-keyed tabs/baseline, explicit
   committed-revision baselines, delete prune (2.1C-§06).
D. **IDE reliability**: rename focus/dirty correctness, persist-driven
   clearing, safe eviction, strict validation, rejection handling
   (2.1C-§06/§07/§08).
E. **Empty recovery**: empty baseline + persist deferred until first edit;
   loud toast; never auto-persists scaffold over unknown store content;
   never deletes unknown paths (diff design) (2.1C-§09).
F. **History restore**: Back leaves without rewriting `editorStyle`;
   Forward reloads the dropped project through the guarded open path
   (2.1C-§03/§10).

## C4. Before/after regression evidence (node + real IDB)

| Suite | Before | After |
|---|---|---|
| workspace-reliability (W/G) | 18 (7 red) | **25/25 PASS** |
| workspace-coordination (C) | n/a (new) | **13/13 PASS** |
| editor-persistence (T01–T40, T39 corrected) | 40/40 | **40/40 PASS** |
| backup audit | 40/40 | **40/40 PASS** |
| real-Chromium IDB (B-W05/06/07/07d) | n/a (2.1B) | **4/4 PASS** |
| webcontainer regression | — | **26/26 PASS** |
| monaco (15) | 0/15 (no server) → 12/15 (3 stale-route) | **15/15 PASS** |
| routes / headers / PWA migration | — | **11/11, 7/7, 11/11 PASS** |
| e2e persistence (A–E) | failed (stale `/` nav) | **5/5 PASS** |
| e2e backup/restore | failed (stale `/` nav) | **PASS 100%** |
| migration e2e | — | **25/25 scenarios, 39/40 AC (1 BLOCKED: live Vercel deploy ID — correctly out of scope for local-only authorization)** |
| `npm ci` / unified build | — | **both PASS** |
| tsc | 16 pre-existing | **16, zero new** |
| eslint (full repo) | — | **0 errors** (117 warnings, all pre-existing; changed files add none) |

## C5. Full browser suite (real app, `audit:e2e:workspace-app`): 16/16 PASS

| # | Scenario | Result |
|---|---|---|
| S1 | Consecutive transitions + flush-on-switch ownership, no cross-write | PASS |
| S2a | Failed flush blocks dashboard-return, edits intact, honest error | PASS |
| S2b | Fileless project → loud starter, no auto-persist, no crash | PASS |
| S3 | Quota fault: no success event/slot write, quota toast, clean recovery | PASS |
| S4 | Type → honest commit gate → reload → full recovery | PASS |
| S5 | Back/forward across modes incl. unsaved edits, style preserved | PASS |
| S6 | File rename focus + collision refusal, data intact | PASS |
| S7 | 112-file reopen byte-identical | PASS |
| S8/S8b | Restart persistence (same profile, new page) | PASS |
| S9 | WebContainer boot (tightened `ready in Nms`/iframe evidence) + data-safe reopen | PASS |
| S10 | Forced inverted completion (4 s open-delay fault): stale A abandoned, B wins, A-touch proves inversion | PASS |
| S11 | Stale commit never clears newer edits (dot survives → clears on own commit) | PASS |
| S6b | Folder rename remaps tabs/focus/dirty across 112 files | PASS |
| S6c | Unicode create refused cleanly, zero residue | PASS |
| S6d | 14 tabs cap at 12, evicted content intact + reopenable | PASS |

## C6. S4/S5 root causes and final statuses (harness vs app separated)

**S5: genuine app bug, fixed, verified.** Back-navigation reused the
explicit-exit path, which (a) rewrote `editorStyle` to `plain` on a mere
navigation and (b) dropped in-memory files with no reload path (restore
effect early-returned whenever a project was active). Forward then rendered
an empty IDE shell over an intact store (proven by diag: pointer + file rows
present, 0 files shown). Fix: preference rewrite only on explicit exit;
forward restores the dropped project through the guarded open path with its
own generation guard. Verified PASS in-suite.

**S4: test-harness + test-design artifact; application exonerated.**
Three layered findings, each verified:
1. Headless `waitForFunction` default `raf` polling stalls → early timeouts
   with content present. Fixed with interval polling everywhere.
2. `waitForFunction` with an **async predicate + numeric polling resolves
   spuriously** (the pending Promise is truthy) — proven with always-false
   control predicates resolving in ~23 ms. The S4 "commit gate" therefore
   passed vacuously and the test reloaded *before* the 1.2 s persist
   debounce fired, killing the pending flush on unload — so there was
   correctly nothing to recover (honest DOM timeout, misread as regression).
3. Fixed with an honest Node-side `waitForStore` loop (`page.evaluate`
   awaits correctly): the gate now observes the real commit, reload follows,
   recovery asserts green. Corroborated by 9+ healthy instrumented runs
   (single UNSET write, byte-identical pre/post-reload dumps) and the
   write-trace showing exactly one commit and no spontaneous writes.
No application change was required for S4. S4 PASS.

## C7. Monaco 15-case results: 15/15 PASS

Initial 0/15 = missing preview server (environmental). 12/15 after serving:
tests 01/12 failed on a 500 ms fixed sleep in `ensureEditorOpen` (dashboard
not yet rendered → creation skipped → no editor) and test 13 read the
marketing `dist/index.html` (no module entry since the Phase-1 unified
build moved the IDE entry to `dist/app/index.html`). Minimal
harness-only corrections (event-based readiness, unified entry path).
No application change. Do not modify app code for these expectations.

## C8. Save contract audit (all call sites)

- `saveProjectFiles` — sole src caller `flushProjectSave` destructures
  `{ snapshot, persisted }`; `persisted:false` restores pending and returns
  `ok:false` (blocks transitions, never marks saved). Tests use the object
  truthily-safe; C12/C13 assert both outcomes incl. previous-preservation.
- `saveAutoSave` — callers: `useAutoSave` (hash/timestamp/event only on
  `ok:true`; warning dispatch with quota flag otherwise), `importProject`
  (ignores — unchanged behavior). No other callers.
- `flushProjectSave` — 7 App call sites: persist timer (marks + signals on
  `ok` with project-identity match), open/create/import/dashboard-return
  (block + toast on `!ok`), visibility handler (best-effort, unchanged).
- `markFilesSaved` — 1 caller (persist success, flushed revision,
  identity-matched). `markAllSaved` fully removed (zero callers; no refs).
- `beginTransition/isCurrentTransition` — open/create/import/delete/
  dashboard/popstate-restore; stale paths return before any state write.
- Quota/blocked failures reach the existing `STORAGE_WARNING_EVENT` toast
  channel (S3 proves end-to-end). Recovery records survive failures
  (W01–W03, G05).

## C9. Dirty-state and tab ownership verification

- Static: `projectKey` reset proven by S1 same-type switches (no phantom
  dots/tabs; per-project UNSET markers land under correct IDs); baselines
  are flushed revisions only (S11 logic + S6b travel-then-clear).
- IDE: persist-signal clearing is project-scoped and content-matched (S11:
  R2 dot survives R1's commit, clears on its own); rename/delete/evict
  remap/prune covered by S6/S6b/S6d and C03–C07.
- No indiscriminate clearing remains (autosave-tick clearing deleted).

## C10. File/folder rename verification

- Unit: C08–C11 (traversal, case/​prefix collisions, extensions, `.gitkeep`
  exemption, folder rules incl. anti-self-nesting) 13/13 with the suite.
- Browser: S6 (file rename + collision refusal, byte-intact), S6b (folder
  rename across 112 files: tabs/focus/dirty remap, store paths exact),
  S6c (unicode refused with single toast, zero residue).
- No rejected operation produces phantom tabs/toasts/partial mutation
  (boolean-return chain tree→mode→App verified in S6/S6c).

## C11. IndexedDB and browser recovery results

- DB names/versions/keys unchanged (`gb-coder-projects-db` v1,
  `gb-coder-workspace`, `gb-coder-active-project-id`); no migration.
- B-W05/06/07/07d real-Chromium PASS; S4/S7/S8 pointer+content+style
  recovery PASS; restart-in-same-profile PASS.
- Mid-transaction abort injection remains **NOT_RUN** (no deterministic
  browser API; failure settling covered by unavailable-IDB faults G05/W05b).
  Status unchanged by design, never upgraded on mock evidence.

## C12. 112-file SHA-256 integrity

G02 (create/read), W07d (duplicate), B-W07d (real-Chromium duplicate via
`crypto.subtle`), S7 (reopen across reload), S6b (folder rename across 112):
all 112/112 paths + hashes match in every run.

## C13. Existing regression suites (final, post-`npm ci`)

25/25, 13/13, 40/40, 40/40, 4/4 browser, 26/26 webcontainer, 15/15 monaco,
11/11 routes, 7/7 headers, 11/11 PWA, 5/5 persistence e2e, backup e2e PASS,
migration 25/25 (1 AC BLOCKED — live deploy ID).

## C14. Build, lint, TypeScript

- `npm ci`: PASS (exit 0). Unified build (×4 across the milestone, final
  tree): deterministic PASS.
- `tsc --noEmit`: 16 errors before → 16 after; all pre-existing, none in
  changed lines (two self-introduced errors during development
  — duplicated enqueue lines, cross-effect callback reference — were caught
  by tsc and fixed; final delta is zero).
- `eslint`: full repo 0 errors; 117 warnings, all pre-existing (changed
  files contribute only the 3 pre-existing warnings on untouched lines).

## C15. WebContainer and terminal regression

- Service suite 26/26 PASS (no WebContainer/terminal architecture touched).
- Live boot smoke S9 PASS with tightened evidence (Vite `ready in Nms`
  terminal signature / dev-server iframe — bare status text rejected).
- Dashboard-return + reopen after boot: files byte-intact.

## C16. BLOCKED / NOT_RUN (explicit, with reasons)

- Mid-transaction abort injection: **NOT_RUN** (no deterministic browser
  API; §13-accepted).
- Migration AC-04 (live Vercel deploy ID): **BLOCKED** (needs production
  deployment access; incompatible with local-only authorization).
- Live-header verification (`--live-url`): **NOT_RUN** (no preview/prod
  deployment in scope).
- True sub-read load overlap without fault injection: covered by
  deterministic fault-injection (S10) + coordinator units (C01/C02) instead;
  natural overlap is timing-luck and asserted only via outcomes.
- Headless rendering artifacts (unstyled screenshots — CSS parses 0 rules
  in this headless harness despite byte-perfect serving; recurring
  `inmemory://model/3` console error; `/_vercel/insights` 404s locally):
  documented harness observations, zero functional impact (all DOM/IDB
  assertions green), no app changes made for them.

## C17. Git status and preservation

- Branch `phase-2.1-workspace-reliability`; parents `53ba1e4` ← `08e188d`
  ← `217379c` ← (this commit).
- Modified (10): `package.json`, `scripts/audit-harness.mjs`,
  `scripts/monaco-worker-tests.mjs`, `scripts/e2e-editor-persistence.mjs`,
  `scripts/e2e-backup-restore.mjs`, `src/App.tsx`,
  `src/components/vscode/{VSCodeMode,FileTreeView}.tsx`,
  `src/hooks/{useAutoSave,useFileWorkspace}.ts`,
  `src/services/projects/projectDatabase.ts`,
  `src/services/snapshotService.ts`, `src/utils/workspaceCoordination.ts`
  (new), `scripts/{workspace-coordination-tests,e2e-workspace-app}.mjs`
  (new), this report.
- `reports/migration-results.json` regenerated by its suite run (included
  as run evidence).
- Preserved untracked (untouched): 4 pre-existing files + `.opencode/`.
  No pushes, PRs, deploys, `main` changes, Vercel changes, branch
  deletions, history rewrites, or user-data access.

## C18. Customer-data corruption risk

No identified risk introduced by 2.1C: no migrations, no key changes, no
format changes; every write path is diff-scoped (unknown store paths are
never deleted); destructive transitions block on failed flushes with
in-memory content preserved; recovery validation never erases raw records.
Pre-existing sharp edges intentionally left for later milestones (global
single-slot autosave vs per-project IDB; IDE edits not mirrored to the
localStorage slot; legacy `projectStore` duality) are documented, not
widened.

## C19. Recommendation for Phase 2.1D

2.1D final acceptance should: re-run this exact gate set on a clean
checkout (`npm ci` + build + all suites above); confirm the 16 tsc errors
and 117 lint warnings are unchanged-or-better; review the three documented
harness observations (headless CSS, `inmemory://model/3`,
`/_vercel` 404s) for any production signal; and separately approve the
deferred items (snapshot design §14 of 2.1B report, legacy-store facade,
IDE mirror coverage). No 2.1C follow-up work remains open.

## C20. Verdict

**PHASE_2_1C_ACCEPTANCE_PASS_WITH_LIMITATIONS**

All §13 criteria (1–14) are met with evidence above: races fixed and proven
(S10 + units + review), S4/S5 resolved with separation of harness vs app
faults, save/dirty/rename semantics accurate, back/forward safe, empty
projects safe, real-IDB tests green, 2.1B regressions green, build and
applicable audits complete, WebContainer/IDE/static regressions checked,
Monaco blockers resolved (15/15), zero new diagnostics, no customer or
production contact. Limitations are the documented NOT_RUN/BLOCKED items
(C16) and pre-existing debts (C18), none of which fail an acceptance
criterion.

