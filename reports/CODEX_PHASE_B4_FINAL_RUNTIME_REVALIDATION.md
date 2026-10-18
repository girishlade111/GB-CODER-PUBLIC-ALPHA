# Phase B.4 final-artifact runtime revalidation

Date: 2026-10-15, America/Los_Angeles.

**PHASE_B4_FINAL_LOCAL_BLOCKED**

The exact final artifact completed **7/7 required startups and 1/1 same-runtime reconnect control**. React, Vue, real Preview DOM, installation ownership, generation isolation and source integrity passed. The earlier runtime-asset connection resets did not reproduce.

Final acceptance is blocked by a separately confirmed cancellation-handling gap: on both project switches, the retired shell's exit promise rejected with `Process aborted`, followed by an uncaught browser page error. The production exit handler has only a fulfillment callback. Its stale-generation guard therefore does not handle this rejection path. This gap also exists in the committed baseline; it is **not established as a regression introduced by B.4**.

No application source was changed. No build was regenerated. No commit, push, deployment, PR, merge, Production, credential, DNS, proxy, firewall, security, cache, snapshot, storage-schema or real user-data operation was performed. Browser contexts and the local server were closed. Production remains on HOLD.

## Scope, budget and execution

The owner explicitly approved exactly one additional campaign after the previous 20-observation allowance was exhausted. This campaign used the existing final build, the same fixed synthetic React A / Vue B fixtures, disposable Chromium contexts and one local origin, `http://127.0.0.1:42996`.

The campaign consumed exactly seven startup observations: two fresh React, two fresh Vue, and one A→B→A sequence. All ran sequentially. One real production-service shell-listener disconnect/reconnect control ran after the final A start; it did not create another shell or WebContainer startup. No failed observation was retried, replaced or discarded.

Startup observation time was **368.316 seconds (6.139 minutes)**, below the approved 35-minute cap. The longest start was 70.654 seconds, below the 240-second limit. The reconnect control took 0.312 seconds. There were zero failed, interrupted, timed-out or unknown **startup observations**; two retirement-related exit-promise rejections are recorded separately below.

Chromium version: `151.0.7922.34`. Fresh starts used independent contexts; the switching sequence used one context. The harness read the compiled application's actual service singleton and observed public boot/mount/spawn/output events and service state. It did not replace automatic commands or the interactive shell architecture. Initial timing begins when opening a seeded project through the dashboard, after attaching the service observer. These timings are not a controlled performance comparison with the earlier full-navigation measurements.

The harness stops on a required startup error state, failed/unknown/timed-out active attempt, DOM deadline, ownership/source assertion failure, or reconnect failure. No such startup assertion failed. The cancellation defect was classified during post-campaign evidence reconciliation after all seven successful observations. The harness recorded page errors but did not automatically classify every page error as a startup failure. Upon confirming the defect, no further browser observations or corrective source work were performed.

## Exact source and build identity

Branch: `phase-2.2-webcontainer-reliability`.

HEAD: `546e74c084387d007b0312b9fbd69a9f6a6b55f1`.

The application remains the uncommitted six-file B.4 implementation associated with that HEAD, rather than the committed tree alone. All six source hashes and all 151 recorded JavaScript asset hashes match `reports/b4-final-source-artifact.json`. The complete source and build trees also remained identical. There were **16 identity checks**: initial, before/after each of seven observations, and final after cleanup.

| Identity | SHA-256 |
| --- | --- |
| Build manifest, unchanged | `533ed39ff395a42c218ac02fe598961b1e87e57f32e3e478d494551c69f0cc0d` |
| Complete `src` tree, 265 files | `9aa028bae95c4617696c80ce69ba31dbd225d4cb17b1856db47396b98087a6de` |
| Complete `dist` tree, 177 files | `1b59033702e1c23b0fc746c1c55631312a57eba87fe49ca4eaef99d15e9ebdb5` |
| `src/services/webcontainer/webcontainerService.ts` | `68a43f07d35717fe039aee61437983bf2c6ac67cbf45d8ff4b3b641d40b2cb7b` |
| `src/services/webcontainer/startupDiagnostics.ts` | `8da90c307167598c6e2da5a508dce73fc2e4a8289fc73751b189f5f206d4a967` |
| `src/services/webcontainer/startupOutput.ts` | `ce88e369ba1823a64adfa0a090047d5f76535e7ac6f6ef64c269567c0a04033a` |
| `src/components/Console/TerminalTab.tsx` | `fa75d18483a1a322ac69ab6624b8e98be8c5f3a9affaa62175aeaf3fed678bb4` |
| `src/components/vscode/StackBlitzStartupLoader.tsx` | `c0e5b3dd35226945335855922872d0379475e697c009c94d36b88360d4ee51ca` |
| `src/components/vscode/VSCodeMode.tsx` | `2be0d924aa4f31e4b3da0f4cdf760a4053181183bb824fd804bb0fc2e8ee7adc` |

Tree digests hash the sorted records `relative-path + NUL + file-SHA256 + newline`, including the `src/` or `dist/` prefix, with path ordering from `localeCompare('en')`. Full per-JavaScript-file hashes remain in the canonical artifact record. Its recorded successful build time is `2026-10-15T06:26:49.786Z`; this campaign did not rebuild it.

The final two earlier corrections are present: the late shell-spawn observation follows its generation guard, and npm error output invalidates completion eligibility and the server-starting flag. The first affects diagnostic ownership; the second also changes error-path proof/readiness admission. Neither changes normal startup command selection or runtime isolation.

## Startup results and correctness

Every successful result required an actual `#marker` in the WebContainer Preview frame, not terminal text or an iframe load callback alone. The harness additionally checked the current project/session/generation/instance owner, exact virtual source hashes, absence of the other project's unique paths, exact authoritative synthetic IndexedDB content, current-runtime installed proof, and no pending automatic operation after successful startup.

The complete per-start timing table is appended below. A is React (`b4-a`, marker `B4_REACT_A`); B is Vue (`b4-b`, marker `B4_VUE_B`).

The switching context observed epochs/generations **1→3→5**, with three different runtime instances. The old instances received teardown calls before their replacements were assigned. Installed proof was cleared on retirement and was absent at the beginning of each replacement runtime. Each startup dispatched exactly one install/dev command; current-owner install proof became available only with accepted server readiness. No stale owned automatic operation was observed.

React virtual sources matched the fixture and had no Vue `src/App.vue`, `src/main.js` or `src/style.css`. Vue sources matched the fixture and had no React `src/main.jsx`. The returned A was verified against the same original React hashes in a new runtime. Project storage contents remained exact throughout.

## Transport diagnostics and previous failures

The earlier failures remain in `reports/b4-measurement-budget.json` as original samples #12 and #14; their evidence was not overwritten or reclassified as passing.

- Original #12: [binary index](https://w-corp-staticblitz.com/full_bin_index.2ed8f36d) reset, then `jsh` exited 1 with `Cannot find module '/bin/jsh'`; no npm command was dispatched.
- Original #14: two resets fetching the [runtime script](https://huk2yfexjzna4glayxojlgniumhs2x-dg1p.w-corp-staticblitz.com/blitz.2ed8f36d.js); npm completion text was observed, but no Vite-ready/server-ready/DOM result arrived before the observation deadline.

In the new campaign, those runtime-asset paths produced observed HTTP 200 responses, and **zero `ERR_CONNECTION_RESET` request failures** were recorded. Repeated runtime-script response events are request records, not extra startup attempts. The old failures did not reproduce; their underlying cause and intermittent risk are not resolved by seven successes. No independent network environment, transport workaround or network/security change was used.

Recorded aborts and console errors are retained, rather than described as an error-free campaign:

- Seven fetch aborts to `https://t.staticblitz.com/w/v17/r/l`, one per startup.
- Six aborted initial Preview document requests across samples #1–#6, followed by the required real Preview DOM. No equivalent document abort was captured in #7.
- Seven console messages, one per startup: `Failed to load resource: the server responded with a status of 404 (Not Found)`. The captured console entries do not contain source locations, and the captured response entries do not identify matching HTTP 404 URLs. Their specific resources are unverified; they must not be attributed to analytics, favicon or a runtime asset without further evidence.
- Two uncaught page errors, both `Process aborted`, during project retirement, detailed next.

## Confirmed cancellation-handling blocker

| Transition | Retired process | Exit-promise rejection after teardown | Uncaught page error after teardown |
| --- | --- | --- | --- |
| A→B | process index 0, runtime instance 1 | 65 ms, `Error: Process aborted` | 82 ms, `Process aborted` |
| B→A | process index 1, runtime instance 2 | 35 ms, `Error: Process aborted` | 41 ms, `Process aborted` |

The observer explicitly handles both branches of the vendor `process.exit` promise and records `process_exit_error`. The application handler at `src/services/webcontainer/webcontainerService.ts:1967` uses `void process.exit.then(onFulfilled)` with no rejection handler. Its ownership guard is inside `onFulfilled`; rejection bypasses that guard and rejects the unhandled derived promise. The read source and the paired browser rejection/page-error records establish a cancellation-rejection handling gap. A browser stack/source location was not captured, so no broader failure attribution is claimed.

Read-only comparison with committed HEAD shows that the fulfillment-only handler predates the B.4 changes. This is a newly confirmed pre-existing gap, not proof of a B.4-introduced regression. Both replacement projects still rendered correct DOM and retained correct ownership and source data. The defect does not establish cross-project contamination, but it prevents clean B.4.2 cancellation acceptance.

No numeric shell exit code was delivered for these rejected promises, and none is invented. The observer's process records remain labeled `running` when no fulfilled exit was observed; those labels do **not** establish that retired processes remained live. The separate explicit rejection events and teardown records are the relevant evidence. No numeric npm exit status is exposed by this interactive-shell architecture.

Original #12's actual shell exit code 1 can coexist with an automatic-start `unknown` record: one describes an observed shell result, the other does not claim an observed npm/automatic-chain completion. For #12 specifically, the captured dispatch trace establishes that npm never started; the startup failed, rather than having an unknown functional outcome. This distinction is preserved. It is separate from the newly observed rejected-exit path, which supplied no numeric code.

## Correctness guards and targeted regressions

| Required guard | Evidence and result |
| --- | --- |
| No stale installation completion after retirement | Browser proof resets and owner snapshots pass; existing production output/retirement tests pass. Rejected exit promises nevertheless escape cancellation handling as described above. |
| No installed-state reuse across runtime generations | Browser A→B→A uses three instances, generations 1/3/5, cleared proof and one fresh install each; dependency ownership tests pass. |
| No false dependency success after asset failure | Asset failures did not reproduce in this exact-artifact campaign. Owned-completion/server-ready/error-after-completion production-module guards pass. Real runtime-asset failure injection/recovery remains unverified. |
| No duplicate dispatch while an owned operation is active | One automatic command per browser startup; production active/unknown-operation duplicate-dispatch tests pass. |
| No duplicate install on verified same-runtime reconnect | Real browser production-service reconnect preserves project, epoch, generation, runtime, shell and proof; no additional spawn/install. |
| No cross-project source/runtime contamination | Exact virtual and authoritative source hashes, other-project path absence, distinct instances and generation advance pass. |
| Manual terminal behavior | Benign carriage return reaches the existing browser shell; production-module disconnect/reconnect test forwards `node -v` unchanged. Arbitrary command execution while Vite owns the foreground was not added. |
| No credential/source disclosure in application diagnostics | Browser record allowlist/opaque-scope/source-marker checks pass; diagnostic sanitization, retention, copies, reload and unavailable-storage assertions pass. Raw harness terminal evidence is bounded and synthetic, separate from the application's persisted diagnostic contract. |

Executed again against the unchanged final source:

| Existing test | Result | New evidence |
| --- | --- | --- |
| `scripts/test-phase-b4-startup.mjs` | 6/6 PASS | `reports/b4-final-runtime-startup-tests.log` |
| `scripts/test-phase-b4-output.mjs` | 10/10 PASS | `reports/b4-final-runtime-output-tests.log` |
| `scripts/test-phase-b4-diagnostics.mjs` | PASS, aggregated assertions | `reports/b4-final-runtime-privacy-tests.log` |
| `scripts/test-codex-runtime-isolation.mjs` | 5/5 PASS | `reports/b4-final-runtime-isolation-tests.log` |

These tests do not cover a rejecting shell-exit promise: the shell-output test mock supplies a pending exit promise. Passing those existing tests does not clear the newly confirmed browser cancellation defect. No additional browser failure injection or second campaign was run.

## Narrow correction proposed for separate authorization

Do not approve this as the final local B.4 acceptance/closure commit yet. The startup and isolation evidence is successful, but cancellation rejection handling needs a small, independently reviewed correction. No correction was implemented here.

Proposed scope: **B.4.2a — ownership-safe shell exit-promise rejection handling**, limited to the interactive shell exit handler in `src/services/webcontainer/webcontainerService.ts` and focused production-module regression coverage.

1. Handle rejection explicitly, preserving the existing numeric fulfilled-exit path. Avoid a blanket suppression of all errors.
2. For an intentionally retired or superseded runtime/process, consume its rejection without modifying the current project's state, proof, retry eligibility or diagnostic attempt.
3. For an unexpected rejection belonging to the active owner, report a sanitized, nonnumeric shell/automatic-start unknown or failure outcome as appropriate to available evidence. Preserve duplicate-operation protection; do not introduce retries or assert an npm exit code.
4. Add tests using rejecting exit promises after retirement and while current; assert no unhandled rejection, no cross-owner mutation, no installed proof misuse, preserved manual terminal behavior, and unchanged handling of actual numeric shell exit codes.

The source correction requires separate owner approval. A changed artifact would then require a new build and separately approved browser budget; this campaign's seven observations are exhausted. No caching, process-architecture replacement, transport/security changes or broader reliability refactor is proposed as part of that correction.

## Limitations and commit recommendation

The exact-final-artifact startup coverage gap from the previous report is closed for the seven specified successful startup paths. This is bounded functional evidence, not a reliability SLA, meaningful p95, speedup/regression claim, or proof that the intermittent transport issue is fixed.

Browser cancellation of an unfinished installation, the full 240-second application watchdog firing, actual runtime-asset failure recovery on this final artifact, and a UI component forced-remount reconnect were not added to this campaign. The reconnect uses actual production-service listener disconnect/reattach against the real existing browser runtime; it is more than a panel hide/show, but does not remount the UI component.

No new source correction was needed to obtain the seven successes, but the cancellation rejection gap is independently blocking final B.4 acceptance. **A final closure commit is not recommended until the narrowly proposed correction is authorized and verified.** No commit or publication was performed. Production promotion remains unauthorized and on HOLD.

## Preserved evidence and Git state

- Complete raw campaign: `reports/b4-final-runtime-revalidation.json`, including pre-cleanup terminal output, network events, page errors, service/owner snapshots, diagnostics, correctness checks and artifact checks.
- Derived decision/timing summary: `reports/b4-final-runtime-summary.json`.
- Runner log: `reports/b4-final-runtime-campaign.log`.
- Reproducible harness: `scripts/revalidate-phase-b4-final-runtime.mjs`.
- Existing B.4 implementation report and prior failed samples remain unchanged.

The four previously modified tracked application files and two new application modules are unchanged from preflight, including their hashes. HEAD and branch remain unchanged; nothing is staged. This task added only the verification harness, reports and test evidence. Existing unrelated untracked files were preserved. No remote mutation or remote release check was performed.

The appended tables retain every startup result and exact phase timing.

## Complete startup timing records

All times are seconds. Boot is public boot-promise assignment to resolution; mount is the public mount call; install is command dispatch to inferred completion output; Vite is its own reported readiness interval; server and DOM use the observation start. Public mount timing excludes later mount-helper filesystem/configuration work. Intervals overlap and must not be added as a purported exact total. No numeric npm exit is inferred.

| # | Workflow | Result / real marker | Boot | Mount | Shell spawn | Install hint | Vite reported | Server ready | Real DOM | Epoch / generation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | fresh-A | PASS / B4_REACT_A | 7.661 | 0.013 | 0.010 | 49.203 | 4.481 | 68.161 | 70.654 | 1 / 1 |
| 2 | fresh-A | PASS / B4_REACT_A | 6.260 | 0.008 | 0.013 | 42.062 | 4.731 | 57.644 | 60.562 | 1 / 1 |
| 3 | fresh-B | PASS / B4_VUE_B | 4.836 | 0.011 | 0.048 | 30.323 | 4.609 | 45.638 | 47.699 | 1 / 1 |
| 4 | fresh-B | PASS / B4_VUE_B | 7.637 | 0.007 | 0.005 | 22.570 | 2.844 | 37.224 | 39.428 | 1 / 1 |
| 5 | A-B-A-0 | PASS / B4_REACT_A | 4.244 | 0.011 | 0.005 | 47.767 | 3.307 | 59.912 | 62.421 | 1 / 1 |
| 6 | A-B-A-1 | PASS / B4_VUE_B | 6.959 | 0.006 | 0.003 | 29.689 | 2.962 | 45.054 | 47.219 | 3 / 3 |
| 7 | A-B-A-2 | PASS / B4_REACT_A | 0.493 | 0.006 | 0.005 | 30.561 | 2.610 | 37.038 | 40.333 | 5 / 5 |

The first four rows are separate fresh contexts. Rows 5–7 share the switching context; runtime identities are 1, 2 and 3 within that context, with observed teardown of 1 before assigning 2 and teardown of 2 before assigning 3. Identity numbers in separate contexts are not compared as shared object identities.

| Reconnect assertion | Result |
| --- | --- |
| sameProject | PASS |
| sameEpoch | PASS |
| sameGeneration | PASS |
| sameRuntime | PASS |
| sameShell | PASS |
| noNewSpawn | PASS |
| noNewInstall | PASS |
| manualInputForwarded | PASS |
| installedProofPreserved | PASS |

Control result: PASS; 0.312 seconds. It attaches a listener to the confirmed existing shell, disconnects it, reattaches, forwards a benign carriage return, and disconnects the test listener. The application's terminal remains attached.

Raw evidence SHA-256: `c49bc475a5c4bf83d26dc49d8e713ba9e0c0daa107196dda689a5cfdef8316d5`.

Verification harness SHA-256: `cf603cd519815b2c97c56054071a72987ffd6f86a0b55d879d5fd7ad10d59da3`.

Final decision remains **PHASE_B4_FINAL_LOCAL_BLOCKED** because rejected shell-exit promises on retirement remain unhandled. Successful startup evidence is preserved without changing that decision or authorizing a source correction.
