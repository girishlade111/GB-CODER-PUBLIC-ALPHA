# GB Coder Phase 2.2 — final Codex acceptance closure

Date: 2026-10-14, America/Los_Angeles. Local-only work on the existing checkout.

## Repository and preservation

Root: `C:\Users\Girish Lade\OneDrive\Desktop\GB-CODER-PUBLIC-ALPHA`.
Branch: `phase-2.2-webcontainer-reliability`.
Starting HEAD: `5768ca744b885a8982dbf475af5d9b322b642ca5`.
Ending HEAD: `ac58b6b552422aa78e3f94c9e2dc5ee94902a018`.
Final verdict: `CODEX_PHASE_2_2_LOCAL_RELEASE_CANDIDATE_READY`.

The starting tree already modified `webcontainerService.ts`, `fileSyncCoordinator.ts`, `VSCodeMode.tsx`, and `test-phase2-2-final-corrective.mjs`. Those changes and the previous untracked production-module tests/file-operation harness were preserved and included in the completed stabilization scope. Existing reports, patches, archive, `.opencode/`, `.tmp-kilocode/`, and user-owned untracked browser scripts were preserved. The preceding blocked report remains unchanged as historical evidence. This report supersedes its gate recommendation. Ending tracked working tree/index are clean; unrelated untracked files and generated local evidence/reports remain preserved.

No reset, cleanup, checkout replacement, storage migration, user-profile mutation, user-project deletion, or IndexedDB reset was performed. Test contexts are disposable and contain synthetic projects. No push, PR, merge, deployment, production change, credential/authentication change, or DNS operation occurred.

## Classification of all 15 historical failures

The exact previous logs were read before fixture changes. No valid production invariant was weakened to accommodate the old shared-runtime design. Every row below retains or strengthens its original behavioral safety objective.

| Suite / failed assertion | Classification | Cause and equivalent or stronger correction |
| --- | --- | --- |
| B21 CR01 late port-close cannot clear current server | TEST_HARNESS_DEFECT | Listener attached to an unowned mock before attach; even A's initial ready event was rejected. Install A after attachment, verify A readiness, retire A, install B, deliver A's retained close, and verify B port/URL unchanged. |
| B22 scenario 5 late A close after B active | TEST_HARNESS_DEFECT | Same invalid initial listener ownership, followed by shared callback reuse. Establish A and B on separate runtimes; retain A's close and assert B server/URL/count remain intact. |
| B22 scenario 6 same-port reuse | OBSOLETE_FIXTURE | Rebinding a port in a fresh runtime was emitted through the retired runtime's callback. Retire A and accept the same port only from B's listener; retain B ownership assertions. |
| B22 scenario 12 legitimate React/Vue startup | TEST_HARNESS_DEFECT | Callback registered before attachment and never installed as current instance. Install the current runtime first and keep starting→ready, port, URL, and starting-state assertions. |
| B23 PORT-01 A starts on 5173 | TEST_HARNESS_DEFECT | Prior filesystem mock lacked public teardown; subsequent listener fixture was also unowned. Supply teardown on filesystem mocks, then install a fresh owned A runtime and assert actual production server state. |
| B23 PORT-03 B starts on reused 5173 | OBSOLETE_FIXTURE | B event delivered via A's runtime. Bind B's new listener and keep project/port assertions. |
| B23 PORT-04 missing old close does not block next project | OBSOLETE_FIXTURE | Shared-runtime prompt reclamation was treated as shutdown evidence. Verify prior public teardown and accept C's new-runtime event even with prompt false and no old close. |
| B23 PORT-07 late close after acquisition | OBSOLETE_FIXTURE | An old close counter was inserted into the new runtime instead of retaining the old event source. Deliver C's close after D acquires its port; verify D remains live, then verify D's own close works. |
| B23 PORT-09 legitimate current ready accepted | TEST_HARNESS_DEFECT | A callback from before several scope changes was used as the current callback. Install current-valid's own runtime; retain port/URL/stage assertions. |
| B24 C2-A delayed ready while B starting | TEST_HARNESS_DEFECT | Prior filesystem fixture omitted teardown and the event source was unowned. Establish actual A readiness, retire A, install B, delay delivery, and verify both prompt states reject A while genuine B readiness succeeds. |
| B24 C3 late close after reuse | OBSOLETE_FIXTURE | Both closes came through the same runtime callback. Old A close is ignored; genuine B close must clear B. |
| B24 C5 five reuse cycles | OBSOLETE_FIXTURE | Repeated projects were modeled with one callback and no public lifecycle. Five fresh A/B cycles now assert retirement, current readiness, rejected old ready/close, and zero stale counters. |
| Negative NEG-1 stale ready after old prompt | TEST_HARNESS_DEFECT | A's initial callback was unowned. Establish A readiness before switching, retire it, mark prompt ready, and retain strict null/current-URL assertions on A's retained callback. |
| Negative NEG-2 missing A close followed by legitimate B close | OBSOLETE_FIXTURE | B open/ready/close were delivered through A's event source. Use B's public event source and verify B close clears active servers regardless of A's absent close. |
| Negative NEG-4 obsolete queued A mount | TEST_HARNESS_DEFECT | An installed mock lacked teardown and was installed before A attachment. Implement teardown, assert retirement, release the queued mount after B attaches, assert false result and no A tree mutation. |

`scripts/helpers/runtime-event-fixture.mjs` provides fresh instance setup and public teardown. Filesystem methods reject use after retirement. Retained callbacks intentionally bypass unsubscribe to model already queued deliveries; production generation/instance checks must reject them. Thus fixture filtering cannot create a false pass.

Passing but previously weak checks were strengthened too: B23 PORT-10 now starts actual production server state before 50 retirements; PORT-11 performs same-project attachment and checks runtime identity/epoch/server preservation; PORT-12 checks React/Vue production binding instead of claiming a browser render without executing one. Actual rendering is verified separately by Chromium. Negative NEG-8 establishes twelve real active ports, checks all unresolved records before retirement, then delivers all retired callbacks and verifies the new runtime remains uncontaminated. B24 C2-B uses an actual 10.1-second delayed old callback instead of only editing a timestamp. Filesystem barrier/write-failure assertions were retained.

## Application and harness defects corrected

### Static Editor bootstrap depended on an external CDN

Source used the default `@monaco-editor/react` loader URL `https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/loader.js`, while only workers were configured locally. On the existing frozen build, a controlled CDN failure reproduced three missing editors and a 60-second timeout. `closure-static-cdn-outage-before.json` records the failed URL, console output, MIME/status observations, and screenshot. The old run's missing request URL cannot retrospectively prove its exact network cause; the dependency and controlled failure are independently established.

`LocalMonacoEditor.tsx` now dynamically imports the installed Monaco engine from Vite-built same-origin assets, configures the shared React loader before rendering Editor, and preserves a loading/error state. CodeEditor, MultiFileEditor, and VSCodeMode use it. No new dependency or eager engine import was added. Vite lets Rollup split the engine along the dynamic boundary; manual engine grouping initially pulled it into preload, which was caught and corrected. Final initial JS is 608,946 bytes (594.7 kB in the repository's 1024-byte units), gzip 188.2 kB, under the existing 600 kB ceiling.

### Static JavaScript worker compiler option was misspelled

ATA used `allowNonTextExtensions`; the installed Monaco contribution uses `allowNonTsExtensions`. Replacing compiler defaults with the misspelled option excluded extensionless `inmemory://model/3` from worker processing and produced `Could not find source file` page errors. Correcting that single option preserves those models. Final Static Editor acceptance checks language-worker activity and absence of Monaco/worker page errors.

### HTML fallback was hiding API/asset errors in test serving

The backup browser harness's separate static server returned Astro HTML for `/api/*`, explaining `Unexpected token '<'` while parsing responses. It now uses the same exported combined preview server as the other browser tests. Missing APIs return JSON 404; missing executable assets return non-HTML 404; valid app/worker assets retain JavaScript MIME types and app routes retain COOP/COEP and SPA routing. Seven real HTTP checks plus an explicit initial-bundle ceiling verify this behavior. Deployment rewrites and production headers were not changed.

### Failure-gate test could pass for the wrong reason

After fixture extraction, the corrective suite's copied deliberately failing B24 runner could exit 1 because relative imports broke, while the old assertion replacement no longer matched. The verification now requires a matching real assertion, correct relative imports, an isolated output directory, the named C5 assertion failure in stdout, and no module-loading/SyntaxError failure. This repairs test-result integrity rather than accepting a convenient nonzero exit.

The diagnostic Static Editor harness was also corrected to use actual keyboard/clipboard input and exact IndexedDB reads instead of assuming a global `window.monaco` API. Single-line fixtures avoid an irrelevant Windows clipboard CRLF-versus-LF mismatch without normalizing or weakening stored-source assertions.

## Static Editor browser evidence

Command: `node scripts/e2e-phase2-2-static-editor.mjs --evidence=final --block-monaco-cdn` — exit 0, 12/12 checks.

The test creates a blank Static Editor project through the dashboard UI; mounts three real Monaco instances; enters HTML, CSS and JavaScript with keyboard paste; verifies HTML structure, CSS computed color, and JavaScript-executed preview text; checks all three saved sources exactly; reloads; reopens through the dashboard; switches into a newly created Advanced IDE and back; and checks source preservation and worker execution.

`closure-static-final.json` contains exact source fixtures, results, console/page errors, failed request URLs, response status/MIME/SW provenance, project ID, Service Worker controller/registration, and worker counters. Final pageErrors is empty. Worker counters after the final reopen: editor 1, HTML 1, CSS 1, TypeScript/JavaScript 1. Worker assets returned 200 `application/javascript`, both directly and through the installed `/app/` Service Worker after reload. No Monaco CDN request or failed Monaco/worker request occurred. Screenshot: `reports/closure-static-final-working.png`.

Non-editor resource failures remain visible in the JSON: local Vercel Analytics route absent, optional Google Fonts requests failing, and an aborted StackBlitz headless navigation during a deliberately superseded empty Advanced IDE switch. They did not prevent the asserted editor/preview/persistence workflows and are not relabeled as successful requests.

## Final regression matrix

Every command runs from the repository root. Raw output uses new `reports/closure-final-*.log` paths, preserving the preceding pass's evidence. No browser suite runs during a build; final browser suites run sequentially against the frozen final artifact. Its manifest hash is in `closure-frozen-build-hash.json`.

| Command | Exit | Actual result |
| --- | --- | --- |
| `npx tsc --noEmit -p tsconfig.app.json` | 0 | no diagnostics |
| `npx tsc -b` | 0 | project references compile |
| Targeted ESLint on all changed TypeScript/TSX/config files | 0 | zero errors; nine existing any/hook warnings |
| `npm run build` | 0 | unified Astro/Vite/PWA build |
| `npm run verify:bundle` | 0 | 594.7 kB raw, 188.2 kB gzip initial JS; engine remains lazy |
| `npm run verify:deploy` | 0 | local configuration valid; 12 API functions; no remote serving claim |
| `node scripts/test-preview-combined.mjs` | 0 | 7/7 real HTTP checks and strict <600 kB initial JS assertion |
| `node scripts/test-codex-runtime-isolation.mjs` | 0 | 5/5 |
| `node scripts/test-codex-rename-recovery.mjs` | 0 | 9/9 |
| `node scripts/test-phase2-2-final-corrective.mjs` | 0 | 9/9 areas; production tests plus explicitly historical simulations |
| `node scripts/test-phase2-2-stabilization-negative.mjs` | 0 | 8/8 |
| `node scripts/test-phase2-2-stage-b21-hardened.mjs` | 0 | 8/8 |
| `node scripts/test-phase2-2-stage-b22-deterministic.mjs` | 0 | 12/12 |
| `node scripts/test-phase2-2-stage-b23-fs-port.mjs` | 0 | 20/20 |
| `node scripts/test-phase2-2-stage-b24-adversarial.mjs` | 0 | 9/9 |
| `node scripts/backup-restore-tests.mjs` | 0 | 40/40 |
| Static Editor browser command above | 0 | 12/12 |
| `node scripts/e2e-phase2-2-runtime-browser.mjs` | 0 | 13/13 React/Vue startup/HMR, in-app switching, manifests, reload/navigation |
| `node scripts/e2e-phase2-2-concurrency.mjs` | 0 | 9/9 service/browser concurrency and Monaco/IDB/runtime/preview equality |
| `node scripts/e2e-codex-file-operations.mjs --evidence=closure-final-file-operations` | 0 | 9/9 real file operations and normal editor smoke |
| `node scripts/e2e-backup-restore.mjs` | 0 | complete 14-stage UI export/checksum/restore/reload/conflict-copy round-trip; second restore yields four projects without overwrite |
| `git diff --check` | 0 | no whitespace errors |

Exact ESLint command: `npx eslint src/components/LocalMonacoEditor.tsx src/components/CodeEditor.tsx src/components/MultiFileEditor.tsx src/components/vscode/VSCodeMode.tsx src/services/ata/ataService.ts src/services/webcontainer/fileSyncCoordinator.ts src/services/webcontainer/webcontainerService.ts vite.config.ts`.

The standalone final runtime/concurrency browser suites derive from the existing user-owned untracked acceptance scripts, which were preserved. The runtime suite adds real in-app B→A→B→A switching and measured readiness/install-output data instead of reloading the host page for each switch. New evidence paths and distinct ports prevent overwriting older results.

## Runtime performance and remaining limitations

Final measurements come from `closure-runtime-browser.json`. Timers end only after the expected project's real preview DOM marker renders. Initial React measures navigation-to-preview; initial Vue measures dashboard selection-to-preview; repeated switches include returning to the dashboard and selecting the other project without reloading the host page.

| Observed operation | End-to-end preview readiness | Vite's own reported startup |
| --- | --- | --- |
| Initial React A | 61.970 s | 3.563 s |
| First dashboard selection of Vue B | 32.741 s | 2.675 s |
| In-app B→A | 26.816 s | 3.386 s |
| In-app A→B | 16.415 s | 2.482 s |
| In-app B→A repeated | 19.544 s | 1.971 s |

The first Vue terminal snapshot reports `added 29 packages in 15s`. Subsequent Vite terminal screen clearing removes the npm completion lines from final visible snapshots. Their `installCompletions: 0` fields mean zero retained matching messages, not proof that no install ran. Separate repeated npm-install durations cannot be reliably isolated from those snapshots; the measured repeated cold-switch totals above include the full runtime/dependency/startup path. No numerical pre-isolation baseline or performance-regression percentage is claimed. The cost is material and visible, but accepted as the deliberate isolation tradeoff rather than hidden by shared filesystem reuse.

Runtime retirement deliberately discards filesystem/dependency caches across projects. It is supported by the public WebContainer teardown contract and exercised by production-module plus real browser tests; a shell prompt is not treated as descendant-exit proof. Same-project attachment/reconnection retains the runtime.

Copy fallback remains recoverable rather than atomic. A failed copy can leave a partial destination; source deletion occurs only after all copy operations succeed. Removal of a fully copied source may itself fail. Concurrent user terminal writes can race preflight collision checks; no transaction guarantee against arbitrary shell mutations is claimed. IndexedDB is still authoritative and no schema/storage identifier changed. Exotic application hot reload across different manager instances and indefinitely hung platform operations are not formal guarantees established by this pass.

Local deployment checks do not establish remotely served preview/production headers. Remote publication and subsequent preview acceptance remain separately authorized work.

## Changed files, local commit, and final verdict

The commit scope includes the preserved runtime/coordinator/VSCodeMode repairs; LocalMonacoEditor plus its three editor integrations; ATA option and Vite chunk correction; five historical fixture suites and shared fixture helper; truthful deliberate-failure verification; combined/backup serving changes; production runtime/rename tests; and final browser/HTTP harnesses. Generated profiles, build output, temporary transformation scripts, raw logs, screenshots, and unrelated untracked files are excluded from staging.

One focused local commit was created only after every mandatory gate passed:

- SHA: `ac58b6b552422aa78e3f94c9e2dc5ee94902a018`.
- Message: `fix(reliability): close runtime isolation and editor acceptance`.
- Scope: 24 source/test files. No generated profiles, archives, build files, screenshots, raw evidence, temporary transformation scripts, or unrelated untracked files were staged. Staged additions were reviewed for credential patterns and artifact paths; `git diff --cached --check` passed.
- This consolidated report and machine-readable evidence remain local generated artifacts, matching the existing reports workflow; no second commit was created to record the first commit's own SHA.

Committed paths:

```text
scripts/e2e-backup-restore.mjs
scripts/e2e-codex-file-operations.mjs
scripts/e2e-phase2-2-concurrency.mjs
scripts/e2e-phase2-2-runtime-browser.mjs
scripts/e2e-phase2-2-static-editor.mjs
scripts/helpers/runtime-event-fixture.mjs
scripts/preview-combined.mjs
scripts/test-codex-rename-recovery.mjs
scripts/test-codex-runtime-isolation.mjs
scripts/test-phase2-2-final-corrective.mjs
scripts/test-phase2-2-stabilization-negative.mjs
scripts/test-phase2-2-stage-b21-hardened.mjs
scripts/test-phase2-2-stage-b22-deterministic.mjs
scripts/test-phase2-2-stage-b23-fs-port.mjs
scripts/test-phase2-2-stage-b24-adversarial.mjs
scripts/test-preview-combined.mjs
src/components/CodeEditor.tsx
src/components/LocalMonacoEditor.tsx
src/components/MultiFileEditor.tsx
src/components/vscode/VSCodeMode.tsx
src/services/ata/ataService.ts
src/services/webcontainer/fileSyncCoordinator.ts
src/services/webcontainer/webcontainerService.ts
vite.config.ts
```

The frozen build manifest hash remained `C2EAC96199E4FCB0BAD34563C87CB640585620368BF4F2F32842859EF96D3DB7` throughout sequential acceptance. Final backup output contains no `Unexpected token '<'` errors. Local analytics/font-resource failures and recoverable EXDEV limitations described above remain visible; no mandatory functional or quality gate is failing or inconclusive.

Final local release recommendation: `CODEX_PHASE_2_2_LOCAL_RELEASE_CANDIDATE_READY`.

No push, PR, merge, Vercel deployment, or production operation occurred. Execution stops at this local verdict.
