# Phase B.4.1–B.4.3 local implementation and verification

Decision: **PHASE_B4_1_TO_B4_3_BLOCKED**.

The authorized local corrections are implemented and their targeted production-module tests pass. The bounded browser comparison did not pass cleanly: baseline 10/10 starts passed; candidate 8/10 passed. Two candidate starts reached the observation deadline with WebContainer transport/runtime-loading failures. These observations prevent a clean local reliability acceptance. They do not prove a source regression or identify the underlying transport fault. Production promotion remains on HOLD.

This work is uncommitted and unpublished. No push, PR, merge, deployment, DNS, credential, authentication, Production, or real user-data operation was performed. B.4.4 dependency caching/snapshots were not implemented.

## Scope and chronology

The owner's implementation attachment authorized B.4.1 diagnostics, B.4.2 failure/cancellation/unknown handling, and B.4.3 dependency ownership/fingerprints, plus the bounded local comparison. The previous B.3 reports remain historical evidence for published commit `546e74c084387d007b0312b9fbd69a9f6a6b55f1`; their deployed acceptance was not repeated or overwritten.

1. Preserved the feature-branch HEAD and existing reports; the tracked tree was initially clean. Existing unrelated untracked files were retained.
2. Reproduced four dependency-state defects against the original production service and a split-output defect against its actual shell-output pipeline. Recorded the frozen baseline, then completed its ten starts and two controls.
3. Added the bounded diagnostic store and verified its privacy, reload, and storage-failure behavior. Centralized owned automatic-start parsing/dispatch, then verified failure/unknown behavior and dependency invalidation through the production module.
4. Reproduced and corrected additional dispatch-stage and pre-dispatch-output edge cases before freezing the measured candidate. Built that candidate and ran exactly ten candidate observations and two controls, including post-timing React/Vue editor/HMR checks.
5. During final targeted verification, reproduced and corrected two additional error/race paths: a late shell-spawn diagnostic could cross into the next project; completion text followed by an npm error could retain proof eligible for use by a subsequent server event. Both have passing production-module regressions. They were corrected **after the measurement artifact was frozen**. No startup measurements were repeated. The measured artifact therefore is not the exact final source artifact; this limitation remains explicit.
6. Built and checked the final source and ran focused final Static Editor verification. Verification details and final artifact identity are recorded below.

## Confirmed defects and corrections

| Demonstrated behavior | Correction / evidence |
| --- | --- |
| A help-only `node_modules/.bin` tree was considered populated dependencies | Ignore dot entries for presence detection; skipping installation also requires current-runtime installed proof. Original production test failed; corrected test passes. |
| Installed fingerprint survived runtime retirement | Clear fingerprint and owner on retirement; an exact current runtime identity is required to use proof. Original production test failed; corrected test passes. |
| Same-length lockfile changes beyond the first 500 characters were invisible | Hash complete root manifest, supported lockfiles and `.npmrc`, sorted by path, plus sorted extra dependencies and project type. Original tail-change test failed; corrected test passes. |
| A completion from retired project A could mark B installed | Bind install proof to project, session epoch, runtime generation and instance; reject stale completion/check results. Original production test failed; corrected test passes. |
| `added 61 pack` / `ages…` across output chunks was missed | One bounded streaming parser handles split npm hints and modern/legacy npm error text. Original shell-pipeline test failed; corrected pipeline passes. |
| Dispatch overwrote `installing` with `starting_server` | Keep the install phase until a completion hint; dispatch is not completion. Reproduced before correction. |
| Buffered output before owned command dispatch could count as completion | Ignore automatic-start parsing until dispatch is owned and recorded. Reproduced before correction. |
| Delayed shell spawn added an event to the next project's diagnostic record | Check the runtime generation before recording shell observation. `b4-late-spawn-reproduction.log` records the failure; final test passes. |
| Completion text followed by npm error could leave install proof eligible | Clear completion eligibility and the server-starting flag on the error; retain the busy operation to prevent duplicate automatic startup. `b4-completion-error-reproduction.log` records the failure; final test passes. |

Duplicated install/output interpretation existed in both TerminalTab and the service. The demonstrated split-output and state errors justified consolidating automatic-start interpretation in the service. The interactive `jsh` architecture remains intact.

Unresolved hypotheses: whether resets originate in the host network, an intermediary, provider transport, or runtime asset delivery; which part of npm's interval is download, resolution, extraction or lifecycle execution; whether any supported snapshot strategy would improve total startup. No causal attribution or cache support is assumed.

## Exact application source changes

- `src/services/webcontainer/startupDiagnostics.ts` — new allowlisted, bounded, reload-safe diagnostic store with memory fallback.
- `src/services/webcontainer/startupOutput.ts` — new bounded streaming hint parser; no fabricated npm exit status.
- `src/services/webcontainer/webcontainerService.ts` — lifecycle records, operation ownership, watchdog/unknown handling, single automatic-output interpretation, full dependency fingerprint inputs and runtime-bound installed proof.
- `src/components/Console/TerminalTab.tsx` — shared initial/restart dispatch path; owner checks around awaits and prompt dispatch; removal of duplicate install-result interpretation; duplicate automatic-install/restart prevention.
- `src/components/vscode/StackBlitzStartupLoader.tsx` — disable install/restart actions while an operation is active or its child status is unknown; accurate installation wording.
- `src/components/vscode/VSCodeMode.tsx` — pass operation-pending state to the loader.

No package manifest, dependency lockfile, WebContainer API version, IndexedDB schema, project serialization, backup format, or authoritative storage module was changed.

New reproducible verification helpers: `scripts/test-phase-b4-startup.mjs`, `scripts/test-phase-b4-output.mjs`, `scripts/test-phase-b4-diagnostics.mjs`, `scripts/measure-phase-b4-startup.mjs`, `scripts/summarize-phase-b4-measurements.mjs`, `scripts/helpers/b4-fixtures.mjs`, and `scripts/helpers/b4-runtime-observer.mjs`. The local Static Editor run adapts the existing script in `scripts/.tmp-b4-static-only.mjs`, omitting its extra Advanced-runtime creation to preserve the startup budget.

## Diagnostic data contract and retention

Dedicated key: `sessionStorage['gbcoder.startup.diagnostics.v1']`. Maximum five attempts, 200 events per attempt, and 256 KiB UTF-8 serialized data per tab; memory remains bounded if storage is blocked, unavailable, malformed or over quota. No IndexedDB or remote telemetry is used.

Attempt fields: random attempt ID, opaque random project-scope token, session epoch, runtime generation, start timestamp, state and events. Project IDs map to opaque tokens in memory; raw IDs and that mapping are not persisted. Reload retains sanitized historical records and converts unfinished records to `unknown / INTERRUPTED`; a new module lifetime creates new scope mappings.

Event fields: allowlisted phase/outcome, timestamp, optional bounded duration, allowlisted reason/code, and a numeric exit code **only for an actual shell exit**. Error codes are `ECONNRESET`, `ENOTFOUND`, `ETIMEDOUT`, `ERESOLVE`, `ENOENT`, `EADDRINUSE`, `UNKNOWN`, `TIMEOUT`, `CANCELLED`, `INTERRUPTED`. Arbitrary messages, terminal output, source, URLs, credentials, cookies, headers and environment variables are not accepted by the persisted contract. Returned snapshots are copied to prevent external mutation.

Phases cover attempt, boot, mount, shell, install decision, install, server and preview. npm completion/error text is **inferred** evidence. A public server-ready event is observed server evidence. The existing preview-ready callback records frame/load readiness; it is not a persisted assertion that application DOM markers rendered. The measurement harness separately polls real Preview DOM.

Raw synthetic browser evidence is separate from application diagnostics: the disposable measurement observer bounds captured shell output to 256 KiB per context. It is not shipped telemetry and does not attach to owner projects or credentials.

## Failure, cancellation and install-state rules

- Automatic startup remains `npm install --prefer-offline && npm run dev`, or `npm run dev` after a verified same-runtime skip. No separately spawned npm process or automatic retry was introduced.
- One owned automatic operation can dispatch once. Prompt wait is bounded at 15 seconds; dispatched startup has a 240-second watchdog. Timeout reports unknown child status and keeps duplicate-dispatch protection. A timeout is not proof that npm exited.
- npm error output marks inferred failure, invalidates completion eligibility and retains the busy guard. The safe recovery instruction is to inspect the terminal or return to Projects and reopen, allowing the existing public teardown path to retire the runtime. No unsafe retry is added.
- Project retirement cancels unfinished diagnostic ownership, clears watchdog/operation/proof and preserves fresh-runtime project isolation. Old shell output, timer callbacks and asynchronous completions cannot mutate the next owner.
- Install proof requires an owned completion hint followed by an accepted genuine server-ready event. Merely nonempty `node_modules`, package-count text, or a shell dispatch is insufficient.
- Proof records project/session/generation/instance. Reuse requires the same project, generation, instance and fingerprint; an explicit same-runtime session restart may retain dependency proof. Runtime replacement/retirement clears it. Asynchronous dependency checks revalidate scope after filesystem awaits.
- Fingerprint inputs include full `package.json`, `package-lock.json`, `npm-shrinkwrap.json`, `pnpm-lock.yaml`, `yarn.lock`, `.npmrc`, explicit extra dependencies and project type. The dual integer hash plus input length is an in-memory invalidation token, not a cryptographic integrity key or a dependency cache.
- Same-project shell reconnect and manual input remain available. Unknown automatic-child status blocks automatic retry buttons, not arbitrary owner-entered shell commands.

## Bounded browser comparison

Same local host, loopback origin, installed Chromium/Playwright, sequential disposable contexts and identical synthetic React A / Vue B fixture inputs. Baseline ran first; candidate ran afterward. No second network, deployed Preview benchmark or Production test was performed. Fixture package versions use existing semver ranges without a lockfile; this is not a hermetic dependency-resolution benchmark. Host load, provider/browser caching and changing transport conditions are not controlled causal variables.

Each variant: two fresh React starts, two fresh Vue starts, two A→B→A cycles (six observations), two same-project controls. Exactly **20 startup observations and four controls** were consumed. No failed start was discarded or repeated. Observation time totaled **1,366.621 seconds (22.777 minutes)**, below 80 minutes. The failure observation windows used a 240-second deadline; recorded elapsed times include 93 ms and 41 ms of final polling overhead. There were zero measurement cancellations.

Controls toggled the retained terminal panel and verified the same runtime identity plus no additional install command. All four passed. This is a visibility/reuse control, **not a forced browser component remount**. A separate production-service test exercises a true shell disconnect/reconnect path with no new spawn and preserved manual input; full forced-remount browser reconnect remains unverified.

Raw records: `reports/b4-measurement-budget.json`; derived phase/statistical summary: `reports/b4-measurement-summary.json`. The two measurement logs preserve every attempted sample. `reports/b4-measured-candidate-artifact.json` identifies the measured build and JS hashes. The baseline build-manifest SHA-256 was `5B75574323D830E6E8E3408693B87A8064AED2E3006BFB783B0B47D651225FC9`; measured candidate manifest SHA-256 was `B1BBE9010A4E2D24CDA2D06000A81D1604BE2CFB279F3608C0121B431B68F8F9`.

### Observed failures

**Candidate #12, fresh React:** request to `w-corp-staticblitz.com/full_bin_index.2ed8f36d` failed with `net::ERR_CONNECTION_RESET`. Boot resolved, then actual `jsh` exited 1 with `Cannot find module '/bin/jsh'`. No npm command was dispatched, and there was no server-ready/DOM. The diagnostic attempt became `unknown`, with the actual shell exit recorded and no numeric npm exit claimed. DOM observation ended at 240.093s.

**Candidate #14, fresh Vue:** npm completion text was observed after 35.929s, followed by the `vite` script banner. Two requests for the runtime asset `blitz.2ed8f36d.js` on the WebContainer runtime host failed with `net::ERR_CONNECTION_RESET`. There was no Vite-ready/server-ready/DOM result by 240.041s. The final captured app record remained running because its 240-second watchdog starts at command dispatch, later than navigation. This run does not browser-verify that watchdog firing; the timeout transition is covered by the production-module test.

These failures are consistent with external runtime-asset transport disruption. This is an inference, not an established provider/network root cause. The earlier B.3 incident with 61 dependency resets remains separate historical evidence. The current three reset request records concern runtime assets; they must not be reported as three npm dependency resets. Unrelated local analytics aborts and a font timeout are retained in raw evidence and are not classified as install failures.

## Performance assessment and limitations

Dependency installation remains material: baseline command-to-completion-hint median 33.469s, range 16.405–44.954s (10 observations); candidate median 30.289s, range 14.911–42.760s (nine hints, including the Vue attempt that subsequently failed). These are observed shell intervals, not direct npm child timers or isolated network/extraction costs.

Boot median/range: baseline 4.762s / 0.481–13.999s; candidate 5.092s / 0.346–60.207s. Candidate's successful fresh Vue start spent 60.207s booting and reached real DOM at 104.254s. Vite-reported startup was 2.849–5.603s baseline and 1.774–2.934s among eight successful candidate starts. Detailed document, public mount, server-ready and server-to-DOM boundaries appear in the raw-sample table below. These intervals overlap and must not be summed as an exact decomposition.

All six candidate cycle starts succeeded, with successful DOM median 37.887s versus baseline 45.265s. This is a descriptive sample difference. The changes primarily improve correctness/observability, and this small, sequential, transport-variable campaign does not establish a durable optimization, meaningful regression percentage, p95 or reliability SLA. Successful-only medians explicitly exclude the two censored failures; elapsed-observation medians below retain them but are not successful startup latency.

Repeated installation on A→B→A remains expected under required fresh-runtime isolation: every switched project gets its own runtime and must obtain dependencies again. The fixes do not introduce cross-project runtime reuse. Same-runtime proof can avoid redundant installation, verified through the production module and panel controls. No dependency artifact cache was added.

The installed `@webcontainer/api` is 1.6.4. Its declarations expose filesystem export/snapshot mounting; the `persistent` option inspected belongs to filesystem watching. No persistent npm-cache API was verified. Snapshot cost, full dependency metadata, portability, quota, invalidation and cleanup would require a separately approved B.4.4 feasibility stage.

## Remaining verification limits and next step

- Two transport-associated browser failures block clean local reliability acceptance; root cause remains unresolved.
- The final two diagnostic/error-path corrections have production-module tests and a final build, but were not in the measured candidate artifact. The approved startup budget is exhausted. No exact-final-source real-WebContainer startup campaign is claimed.
- Full forced-remount reconnect, real-browser injected npm failure/recovery, and waiting through the complete application watchdog were not added beyond the approved sample budget. Module-level tests cover the relevant state transitions and duplicate prevention.
- No separately exposed numeric npm exit exists under the retained interactive-shell architecture. Unrecognized completion output is conservatively unproven and can cause a later reinstall rather than a false skip.
- Existing B.3 browser binary-file, backup/restore and broader reliability evidence is preserved; this phase uses targeted regression tests rather than claiming those complete browser suites were rerun.

Recommended next step: owner review of this uncommitted patch, followed by separately authorized bounded transport/runtime-asset diagnostics and exact-final-artifact startup revalidation. Preserve the current runtime isolation and storage model. Do not add automatic retries, alter network/security configuration, or implement caching as a workaround. Any further startup budget, B.4.4 work, separately owned npm process architecture, publication or Production promotion requires explicit owner authorization.

## Git state

Feature branch remains `phase-2.2-webcontainer-reliability`; HEAD remains `546e74c084387d007b0312b9fbd69a9f6a6b55f1`. The four pre-existing tracked application files listed above are modified; the two new application modules and B.4 verification helpers/report are untracked. Existing unrelated untracked files remain. No files were staged or committed. Remote/Production refs were not re-queried as part of this local-only phase; no remote mutation occurred.

The following generated sections record the final checks and complete raw measurement table.

## Final verification results

| Check | Result | Evidence |
| --- | --- | --- |
| Production dependency ownership/fingerprints | 6/6 PASS | b4-startup-final.log |
| Production shell pipeline, dispatch, errors, timeout, cancellation, late spawn, manual reconnect | 10/10 PASS | b4-output-final.log |
| Diagnostic allowlist, bounds, copies, reload and storage failure | PASS (aggregated assertion group) | b4-diagnostics-final.log |
| Fresh-runtime isolation | 5/5 PASS | b4-runtime-isolation-final.log |
| Rename recovery, binary-preserving copy fallback and collisions | 9/9 PASS | b4-rename-final.log |
| Stabilization negative cases | 8/8 PASS | b4-negative-final.log |
| Existing final corrective/integration suite | 9/9 PASS | b4-corrective-final.log |
| Backup/restore regression | 40/40 PASS | b4-backup-final.log |
| TypeScript app and project references | PASS, zero diagnostics | npx tsc --noEmit -p tsconfig.app.json; npx tsc -b, asserted by corrective suite |
| Focused ESLint on all six changed application modules | PASS, zero errors, three existing hook warnings | b4-eslint-final.log |
| Final unified production build | PASS, 137.693s | b4-final-source-build.log |
| Compiled Vercel routing local HTTP model | 42/42 PASS | b4-routing-final.log |
| Deployment configuration/functions | PASS, 12 functions; live checks intentionally not run | b4-deploy-final.log |
| Critical-path bundle contract | PASS, 608,946 initial JS bytes, 594.7 KiB / 188.2 KiB gzip | b4-bundle-final.log |
| Final-build Static Editor/Monaco/IndexedDB browser checks | 11/11 PASS | b4-static-final.log; closure-static-b4-final.json |
| Measured candidate React and Vue editor/HMR | 2/2 PASS, after timed samples #11 and #13 | b4-measurement-budget.json |
| Startup comparison | baseline 10/10; candidate 8/10 | b4-measurement-summary.json |
| Same-project panel controls | baseline 2/2; candidate 2/2 | b4-measurement-budget.json |
| Git whitespace check | PASS | git diff --check |

The final Static Editor browser recorded zero page exceptions, three console resource-404 messages and three aborted script requests, all attributable to the local-only missing /_vercel/insights/script.js endpoint. No Monaco/worker request failed. HTML, CSS and TypeScript workers executed; Service Worker controller and registration scope were /app/sw.js and /app/. Exact HTML/CSS/JS source survived reload and dashboard reopen. This final plain-editor run created no additional WebContainer startup.

Build warnings include stale Browserslist/baseline browser metadata, the existing marketing Tailwind configuration warning and existing bundle warnings; they were not suppressed or addressed outside scope. An intermediate sandboxed build hit EPERM generating Astro output; the authorized local build with required output permissions passed. An initial routing invocation lacked its already-installed external parser path; rerunning with VERCEL_ROUTING_UTILS_PATH pointing to the existing official parser passed, without package or lockfile changes.

Final build-manifest SHA-256: `533ed39ff395a42c218ac02fe598961b1e87e57f32e3e478d494551c69f0cc0d`. Source and JS artifact hashes: reports/b4-final-source-artifact.json. These identify the final uncommitted source/build independently from the earlier measured artifact.

## Complete comparison summary

Successful-DOM summaries below retain explicit failure counts; they are not medians of all attempted starts.

| Variant / workflow | Attempts / pass / fail / cancel | Successful DOM median (s) | Successful DOM range (s) | All observation elapsed median (s) |
| --- | --- | --- | --- | --- |
| baseline / all | 10 / 10 / 0 / 0 | 45.265 | 35.914–70.786 | 45.265 |
| baseline / cold-A | 2 / 2 / 0 / 0 | 64.692 | 58.597–70.786 | 64.692 |
| baseline / cold-B | 2 / 2 / 0 / 0 | 38.938 | 38.439–39.438 | 38.938 |
| baseline / cycle | 6 / 6 / 0 / 0 | 45.265 | 35.914–60.922 | 45.265 |
| candidate / all | 10 / 8 / 2 / 0 | 39.863 | 31.082–104.254 | 42.531 |
| candidate / cold-A | 2 / 1 / 1 / 0 | 60.855 | 60.855–60.855 | 150.474 |
| candidate / cold-B | 2 / 1 / 1 / 0 | 104.254 | 104.254–104.254 | 172.148 |
| candidate / cycle | 6 / 6 / 0 / 0 | 37.887 | 31.082–43.589 | 37.887 |

A is React and B is Vue. Each cycle position is separately retained. All values below are seconds; document is IDE DOMContentLoaded from navigation, mount is the public mount-call interval, install is command write to inferred completion output, Vite is its own reported startup, and server is navigation/switch start to public server-ready. A dash means unavailable, never zero. Failed elapsed values are observation deadlines, not successful DOM latency. The full JSON also includes server-to-DOM intervals and failed request details.

| # / variant | Workflow | Result | Document | Boot | Public mount | Install hint | Vite reported | Server ready | Real DOM | Elapsed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 / baseline | cold-A | PASS | 0.067 | 13.999 | 0.010 | 42.057 | 2.849 | 67.527 | 70.786 | 70.786 |
| 2 / baseline | cold-A | PASS | 0.062 | 8.741 | 0.007 | 37.201 | 4.265 | 55.575 | 58.597 | 58.597 |
| 3 / baseline | cold-B | PASS | 0.062 | 3.798 | 0.011 | 19.618 | 5.603 | 35.614 | 39.438 | 39.438 |
| 4 / baseline | cold-B | PASS | 0.076 | 4.001 | 0.029 | 21.607 | 3.637 | 36.625 | 38.439 | 38.439 |
| 5 / baseline | cycle-ABA-0 | PASS | 0.060 | 4.899 | 0.009 | 41.898 | 3.154 | 55.651 | 57.980 | 57.980 |
| 6 / baseline | cycle-ABA-1 | PASS | — | 7.176 | 0.009 | 16.405 | 3.250 | 33.307 | 35.914 | 35.914 |
| 7 / baseline | cycle-ABA-2 | PASS | — | 1.823 | 0.009 | 36.198 | 3.368 | 46.026 | 48.406 | 48.406 |
| 8 / baseline | cycle-ABA-0 | PASS | 0.061 | 4.624 | 0.010 | 44.954 | 2.933 | 57.866 | 60.922 | 60.922 |
| 9 / baseline | cycle-ABA-1 | PASS | — | 6.711 | 0.005 | 20.260 | 3.782 | 36.086 | 42.124 | 42.124 |
| 10 / baseline | cycle-ABA-2 | PASS | — | 0.481 | 0.012 | 30.739 | 3.148 | 38.340 | 40.956 | 40.956 |
| 11 / candidate | cold-A | PASS | 0.054 | 7.169 | 0.008 | 42.760 | 2.934 | 57.915 | 60.855 | 60.855 |
| 12 / candidate | cold-A | FAIL | 0.104 | 37.658 | 0.009 | — | — | — | — | 240.093 |
| 13 / candidate | cold-B | PASS | 0.044 | 60.207 | 0.009 | 35.337 | 2.648 | 101.956 | 104.254 | 104.254 |
| 14 / candidate | cold-B | FAIL | 0.055 | 3.611 | 0.005 | 35.929 | — | — | — | 240.041 |
| 15 / candidate | cycle-ABA-0 | PASS | 0.052 | 3.701 | 0.009 | 32.376 | 2.122 | 41.671 | 43.589 | 43.589 |
| 16 / candidate | cycle-ABA-1 | PASS | — | 6.482 | 0.005 | 24.208 | 2.802 | 39.039 | 41.473 | 41.473 |
| 17 / candidate | cycle-ABA-2 | PASS | — | 2.358 | 0.004 | 27.643 | 2.005 | 35.783 | 37.521 | 37.521 |
| 18 / candidate | cycle-ABA-0 | PASS | 0.063 | 3.025 | 0.008 | 24.800 | 1.774 | 33.822 | 35.898 | 35.898 |
| 19 / candidate | cycle-ABA-1 | PASS | — | 6.966 | 0.010 | 14.911 | 2.485 | 29.277 | 31.082 | 31.082 |
| 20 / candidate | cycle-ABA-2 | PASS | — | 0.346 | 0.005 | 30.289 | 2.068 | 36.356 | 38.253 | 38.253 |

| Control | Variant | Result | Elapsed (s) | Observation |
| --- | --- | --- | --- | --- |
| 1 | baseline | PASS | 1.721 | Same runtime; cumulative install-command count stayed 3 across panel hide/show |
| 2 | baseline | PASS | 1.720 | Same runtime; cumulative install-command count stayed 3 across panel hide/show |
| 3 | candidate | PASS | 1.642 | Same runtime; cumulative install-command count stayed 3 across panel hide/show |
| 4 | candidate | PASS | 1.707 | Same runtime; cumulative install-command count stayed 3 across panel hide/show |

No acceptance threshold or release SLA was invented. This report closes the authorized local work with a blocked reliability decision; it authorizes no publication or Production release.
