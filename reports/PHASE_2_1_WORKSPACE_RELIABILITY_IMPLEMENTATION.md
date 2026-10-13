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
