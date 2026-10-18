# Codex Phase 2.2 reliability handoff and release gate

Date: 2026-10-14 (America/Los_Angeles). Local engineering only.

## A. Repository identification

- Root: `C:\Users\Girish Lade\OneDrive\Desktop\GB-CODER-PUBLIC-ALPHA`.
- Branch: `phase-2.2-webcontainer-reliability`.
- Starting and ending HEAD: `5768ca744b885a8982dbf475af5d9b322b642ca5`. No new commit: acceptance is not fully green.
- Read-only `git ls-remote origin refs/heads/phase-2.2-webcontainer-reliability refs/heads/main` succeeded outside the restricted network sandbox. Feature: `b97d7be81ae657df41de1dafeac54e7ff4af947a`; main: `1b954486e292436794b0764638ea454bb78fae11`. Local feature HEAD is six commits ahead. Local main is older than origin/main and was not changed.
- Starting tracked tree was clean. Existing untracked reports, scripts, archives, `.opencode/`, and `.tmp-kilocode/` were preserved. Ending tree contains the focused changes below plus generated evidence/harness files.
- No applicable AGENTS.md was found in the repository or its ancestor directories. package.json, package-lock.json, TypeScript/Vite/Astro/ESLint/Vercel configuration, seven feature commits, latest Git diff, supplied patch, and historical report were inspected. The pasted handoff was the user's request; the supplied acceptance report was historical evidence, not authority to publish or evidence of current correctness.

## B. Architecture and compatibility

The Astro marketing site is prerendered separately. The unified build places the React/Vite application under `/app/`; the entry is `src/main.tsx` → AppWrapper → App. App coordinates explicit project routes, navigation generations, project saves, and editor selection. Canonical project editors are `/app/projects/:id/editor` and `/app/projects/:id/ide`. Monaco, FileTreeView, VSCodeMode, TerminalTab, and PreviewPanel provide the Advanced IDE experience.

`webcontainerService` owns boot, shell processes, server events, runtime state, and project mounts. FileSyncCoordinator handles debounced writes, per-path ordering, flushing, and rename/delete coordination. Previously every project shared the same container filesystem and event source; the correction retires that runtime on a scope change, then boots a new one. Same-project terminal reconnection remains supported.

Authoritative project storage remains IndexedDB `gb-coder-projects-db`, version 1: `projects` keyed by id and `projectFiles` keyed by `[projectId,path]`, indexed by lastOpenedAt/projectId respectively. `gb-coder-active-project-id` remains the localStorage selection pointer. Workspace storage remains `gb-coder-workspace`, version 1, store `vscode`, record key `current`, and view key `gb-coder-vscode-view`. Legacy project storage/settings keys were inspected; none were renamed or migrated. No storage schema or persisted user data was changed.

Deployment remains the existing unified Astro/Vite output and Vercel rewrite/header configuration. COOP/COEP configuration and Service Worker migration output were retained. No marketing/localization changes were made.

## C. Confirmed defects and corrections

### P1 — Cross-project runtime ownership and leftover filesystem state

Reproduction: the production manager accepted Project A's delayed server-ready/port-open callback after B attached and an old prompt marked readiness. A second production-module test mounted A's root package.json and old-only file, switched to a nested-manifest B, and observed the same container/filesystem. A third delayed-boot test showed an old boot being reused. All three initially failed (`codex-runtime-before.log`, exit 1).

Root cause: project epochs were metadata on a shared runtime; events contain no project/process provenance, mounts merge files, and post-mount checks cannot undo mutations. Shell prompt observation does not prove descendant process shutdown.

Correction: public WebContainer teardown on project attach/detach changes, generation-bound server listeners, stale boot teardown before the next boot, captured-container writes, and generation/process guards on shell spawn/output/exit and returned handles. Mount, rename, and delete share their operation queue. An obsolete mount failure does not set the next project's error state. IndexedDB remains untouched.

The platform documents that teardown invalidates the filesystem and derived processes and permits a subsequent boot: [WebContainer API reference](https://webcontainers.io/api). This is the isolation mechanism; prompt heuristics are not presented as process ownership proof. Real browser switching/startup tests exercise normal runtime retirement. Production-module tests additionally control delayed boot, mkdir/write, and mount completions: 5/5 pass.

Tradeoff: project switches now require a fresh runtime and dependency installation, rather than reusing another project's filesystem/cache. No permanently running cloud VM was introduced.

### P1 — Rename failure could delete source bytes or overwrite a destination

Reproduction: invoke EXDEV fallback on a directory containing binary files; fail the second destination write. The first original source file had already been deleted. Native rename also overwrote a pre-existing destination. The production service tests failed with real disposable filesystem bytes (`codex-rename-before.log`, exit 1, 1/4 pass).

Correction: check destination existence, reject invalid/subtree paths, fall back only for EXDEV, preserve binary bytes, copy the entire tree without deleting any source entry, then remove the source only after copying finishes. Permission/read errors propagate. A failed copy may retain a partial destination; it never treats a partial copy as success. Reopening the project through the dashboard recreates runtime state from IndexedDB.

### P1 — Premature pending-edit remapping/cancellation and immediate creation rename

Reproduction: fail the physical move after a pending edit; the previous coordinator had already moved the edit to the rejected destination. A concurrent flush could also finish before rename committed. A newly created file in the debounce queue could produce ENOENT when renamed immediately (`codex-rename-new-file-before.log`, exit 1, 8/9 pass).

Correction: pause affected writes while an operation runs, wait for existing writes, commit remapping only after the move, retain original-path edits on failure, and make flush wait for tracked file operations. Physical renames materialize queued source files first; coordinator-only/unbooted renames retain their remapping behavior. Failed deletes retain pending edits. Actual write failures are reported rather than returning successful persistence when no runtime exists.

Verification: 9/9 production coordinator/service recovery tests pass, including binary fallback, collision, permission failure, failed delete, concurrent flush, invalid paths, and immediate queued creation rename.

### P1 — Stale editor operation/restart completions could affect the next project

The async rename/delete callbacks previously called the App owner and changed tabs after awaiting filesystem work without checking whether the component's active project changed. Restart callbacks ignored false mount results.

Correction: VSCodeMode checks the current project ref and session epoch before committing rename/delete; restart dispatch requires a successful current mount. The service captures operation ownership across waits and uses the same queue as mounts. This preserves the existing App validation and state/persistence chain.

### P2 — Rejected file creation could display success

VSCodeMode returned undefined on validation/owner rejection, while FileTreeView only suppresses success for false. Correction: propagate explicit false on rejection and true on accepted creation. Browser case-collision testing verifies no phantom file or success toast.

## D. Changes and evidence

Modified tracked files:

- `src/services/webcontainer/webcontainerService.ts`: runtime retirement/ownership, captured writes, mount/file-operation sequencing, safer physical rename and scoped deletion.
- `src/services/webcontainer/fileSyncCoordinator.ts`: operation tracking, paused paths, success-dependent rename/delete handling, source materialization, and truthful flush coordination.
- `src/components/vscode/VSCodeMode.tsx`: creation-result propagation and stale operation/restart guards.
- `scripts/test-phase2-2-final-corrective.mjs`: replace the shared-container server fixture with the production runtime-isolation regression runner; give its filesystem mock the public teardown method. Other simulated navigation checks remain simulations.

New tests: `scripts/test-codex-runtime-isolation.mjs`, `scripts/test-codex-rename-recovery.mjs`, and `scripts/e2e-codex-file-operations.mjs`. Temporary browser/concurrency harness copies change only ports and evidence destinations, preserving the original user-owned untracked scripts and historical JSON reports.

No new dependency, storage migration, main-branch change, push, PR, merge, deployment, credential, DNS, or authentication operation occurred.

## E. Verification matrix

Commands were run from the repository root; output was redirected into the referenced `reports/codex-*.log` files. A successful process launch was never counted as a pass.

| Command | Actual exit / assertions | Evidence |
| --- | --- | --- |
| `npx tsc --noEmit -p tsconfig.app.json` | 0 | codex-tsc-app.log |
| `npx tsc -b` | 0 | codex-tsc-build.log |
| `npx eslint src/services/webcontainer/fileSyncCoordinator.ts src/services/webcontainer/webcontainerService.ts src/components/vscode/VSCodeMode.tsx` | 0; no errors, one existing activePreview hook warning | codex-lint.log |
| `npm run build` | 0; unified Astro/Vite/PWA artifact | codex-final-build.log |
| `npm run verify:bundle` | 0; 594.1 kB raw / 188.0 kB gzip initial JS | codex-bundle.log |
| `npm run verify:deploy` | 0; local configuration checks, live deployment checks skipped | codex-deploy.log |
| `node scripts/backup-restore-tests.mjs` | 0; 40/40 | codex-backup.log |
| `node scripts/test-codex-runtime-isolation.mjs` | 0; 5/5 | codex-runtime-after.log |
| `node scripts/test-codex-rename-recovery.mjs` | 0; 9/9 | codex-rename-after.log |
| `node scripts/test-phase2-2-final-corrective.mjs` | 0; 9/9 areas, mixed production tests and historical simulations | codex-final-after.log |
| `node scripts/test-phase2-2-stage-b21-hardened.mjs` | 1; 7/8 | codex-b21.log |
| `node scripts/test-phase2-2-stage-b22-deterministic.mjs` | 1; 9/12 | codex-b22.log |
| `node scripts/test-phase2-2-stage-b23-fs-port.mjs` | 1; 15/20 | codex-b23.log |
| `node scripts/test-phase2-2-stage-b24-adversarial.mjs` | 1; 6/9 | codex-b24.log |
| `node scripts/test-phase2-2-stabilization-negative.mjs` | 1; 5/8 | codex-negative-after.log |
| `node scripts/.tmp-codex-final-browser.mjs` | 0; 13/13 real Chromium scenarios | codex-final-browser.log; codex-final-stage-b1-browser-evidence.json |
| `node scripts/.tmp-codex-concurrency.mjs` | 0; 9/9 mixed service/browser scenarios | codex-concurrency.log; codex-stage-b2-concurrency-evidence.json |
| `node scripts/e2e-codex-file-operations.mjs` | 1; eight Advanced IDE checks PASS, Static Editor check FAIL/inconclusive | codex-file-operations-browser.log; codex-file-operations-browser.json |
| `node scripts/e2e-backup-restore.mjs` | 0; one complete UI export/restore/reload/conflict-copy round-trip, 14 stages | codex-backup-browser.log |
| `git diff --check` | 0 | final working-tree check |

Baseline before repairs: both TypeScript commands and build passed; corrective 9/9, stabilization-negative 8/8, backup 40/40 passed. The newly added source/byte-level tests nevertheless reproduced real defects. Historical reported PASS counts were therefore insufficient evidence.

Initial browser attempts inside the restricted sandbox failed preview startup/health access. Authorized runs outside it executed real Chromium/WebContainer. Earlier browser attempts overlapped local rebuilds and encountered missing app artifacts or timeouts; they are inconclusive and are not substituted for the successful frozen-build acceptance. The 13-scenario run verifies React/Vite and Vue startup/HMR, project switching, empty/manifest-less projects, navigation, refresh/storage, and nested/root manifest behavior. Concurrency acceptance verifies switching during npm/server startup and Monaco/IndexedDB/runtime/preview equality.

The broad 13/13 and concurrency 9/9 runs precede the final narrow immediate-rename correction. That correction is covered by production-module tests and the final file-operation browser run against the rebuilt source. It does not alter startup/HMR/navigation paths; no claim of another full broad rerun is made.

Final file-operation browser assertions passed for creation reaching IndexedDB, rename updating tree and stored paths, case-collision create rejection without a success toast, injected physical rename failure preserving paths, injected physical delete failure preserving its dialog/tree/storage without a success toast, successful deletion, recursive folder rename, and reload persistence. These execute actual App/VSCodeMode/FileTreeView handlers and the real WebContainer API; failures were injected only in the disposable runtime. The subsequent normal Static Editor route did not display Monaco within 60 seconds, with resource-loading failures and page error events. Its live preview assertion was therefore not reached. This is not classified as a confirmed regression caused by the changes; it is an unresolved mandatory compatibility check.

The first backup-browser attempt failed because a concurrent build temporarily removed dist/app/index.html. The frozen-build rerun completed UI export, archive/checksum verification, restore into a second disposable profile, persistence across reload, and conflict-safe second restore (four projects, no overwrite). The harness also logged `Unexpected token '<'` page errors while serving API requests through its static-only server; those errors are retained in the log and are not hidden by its successful assertions.

## F. Remaining risks and release blockers

1. Five historical suites still have failing assertions. Their server fixtures attach listeners before project attachment, omit teardown, or deliver every project's events through one retired container callback. Those expectations are incompatible with runtime isolation. Some labels also claim browser evidence while merely asserting constants. They remain unchanged, and their failures are not relabeled PASS. They require explicit conversion to fresh per-runtime fixtures and review of equivalent coverage before the complete regression gate is green.
2. Copy fallback is recoverable, not atomic: partial destinations can remain after failure; removal of a fully copied source can itself fail. Concurrent terminal filesystem writers can race destination preflight checks. Tests do not establish transactional guarantees against arbitrary shell-side mutations.
3. Runtime isolation relies on the public teardown contract. Normal browser project switching is tested; exotic application-level hot reload involving a different manager's global in-flight boot promise and indefinite platform-operation hangs are not established guarantees.
4. Failed runtime writes retain authoritative editor/IndexedDB state and report failure; transparent retry and recovery for every platform I/O failure is not proved. No real user profile was modified in testing.
5. Normal Static Editor acceptance did not complete: Monaco visibility timed out after resource failures. Establish whether the asset/worker loading failure is environmental or an application defect, then verify saved HTML/CSS/JS and live preview in a disposable profile. No Static Editor PASS or source-regression attribution is claimed.
6. The passing local deploy-config check does not prove remotely served headers or preview deployment correctness. Those require the separately authorized remote workflow.

## G. Release recommendation

`CODEX_PHASE_2_2_BLOCKED`

Substantial confirmed defects are repaired, and production-module plus real-browser evidence is stronger than the supplied report. However, the complete historical regression gate is not green and normal Static Editor acceptance remains unresolved. No local release-candidate commit was created. The next engineering steps are to convert the remaining historical event fixtures to the retired-runtime contract and resolve the Static Editor resource/Monaco acceptance failure, retaining the recorded byte-level and live-browser assertions. Remote publishing remains unauthorized. This report closes this finite engineering pass; it does not initiate another autonomous audit phase.
