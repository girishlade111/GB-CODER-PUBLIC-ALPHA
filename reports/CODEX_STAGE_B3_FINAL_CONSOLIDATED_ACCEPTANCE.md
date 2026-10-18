# GB Coder — Stage B.3 final consolidated acceptance

Date: 2026-10-14, America/Los_Angeles. This is an evidence review and decision record; no new test suite or deployment was run.

**Functional Preview verdict: STAGE_B3_PREVIEW_ACCEPTED — with explicit reliability and performance limitations.**

**Production recommendation: hold broad Production promotion pending the next focused reliability/performance phase or an explicit owner decision accepting the documented risks. Production release is not authorized.**

The routing release blocker is fixed on the exact candidate, online editor functionality is demonstrated, and the previously failed startup verification now has two successful fresh-context confirmations. This accepts the tested Preview functionality. It does not assert an availability SLA, predictable startup latency, offline support, or elimination of the earlier network failure.

## Accepted candidate and evidence scope

| Field | Reviewed identity |
| --- | --- |
| Commit | `546e74c084387d007b0312b9fbd69a9f6a6b55f1` |
| Feature branch | `phase-2.2-webcontainer-reliability` |
| Deployment | `dpl_6FDZFqyKFYgzsW4sZ9FtKXNaShbK` |
| Preview | https://gb-coder-public-alpha-g1c7qkmuj.vercel.app |
| Previously verified deployment state | READY, successful build, CLI target Preview |
| Last independently confirmed Production main | `1b954486e292436794b0764638ea454bb78fae11` |

Local HEAD was read during this review and matches the candidate; tracked working tree/index are clean. Deployment/main identities above come from existing verification, not a fresh remote inspection in this closure. Only this report was created. No source code, commit, push, deployment, PR, merge, Production, credentials, or user data was changed.

The full deployed behavioral suite was run on parent `ac58b6b552422aa78e3f94c9e2dc5ee94902a018`. Inspection of the actual parent-to-candidate diff confirms only `vercel.json` and two routing test/helper files changed. Application/runtime/editor/storage/backup source is unchanged. Accordingly, prior functional results are carried forward with focused deployed routing, Static Editor, and runtime revalidation on the exact new SHA. **The full suite was not rerun on the new SHA**, and this report does not mislabel inherited results as fresh runs. This is the explicit evidence basis for the consolidated functional decision.

## Chronological reconciliation

| Sequence | Evidence / historical verdict | Reconciled disposition |
| --- | --- | --- |
| 1. First deployed candidate, `ac58b6b…` | `CODEX_PHASE_2_2_STAGE_B3_PREVIEW_ACCEPTANCE.md`: online editor/runtime/HMR/files/backup checks passed; missing executable assets returned 200 SPA HTML; Preview blocked | Functional results retained. Routing blocker was real, not an authentication artifact. |
| 2. Local routing correction, `546e74c…` | `CODEX_STAGE_B3_ROUTING_REPAIR.md`: one narrowed rewrite, official compiler validation, frozen build and local browser smoke passed | Local evidence justified publication, not deployed acceptance by itself. |
| 3. New automatic Preview, exact candidate | `CODEX_STAGE_B3_ROUTING_DEPLOYED_REVALIDATION.md`: READY/Preview/SHA verified; HTTP 37/37 and Static 12/12 passed; Advanced startup timed out at 240 seconds with 61 dependency connection resets; Preview blocked | Routing blocker closed. Startup was correctly left blocked/incomplete at that time; no fictional npm exit or absent-server conclusion was made. |
| 4. Controlled diagnostic revalidation, unchanged candidate/deployment | `CODEX_STAGE_B3_RUNTIME_NETWORK_DIAGNOSTICS.md`: two permitted fresh-context starts passed with boot/mount/install/Vite/server-ready and actual React DOM; runtime revalidated | Latest startup-verification blocker is resolved by new evidence. Earlier failure remains a real intermittent reliability incident, not erased or reclassified as a pass. |
| 5. This closure | Existing evidence reconciled without retesting | Functional Preview accepted with limitations; Production readiness and approval remain separate. |

The older reports retain their historical BLOCKED verdicts unchanged. This report is the latest consolidated functional decision; it does not retroactively rewrite what happened in those runs.

## Functional coverage and genuine remaining gaps

| Mandatory online acceptance area | Evidence | Disposition |
| --- | --- | --- |
| Exact SHA, successful build, READY, Preview target | New-deployment metadata, CLI inspection/build logs | Verified on candidate |
| Missing JS/CSS/worker/nested/map/SW-related assets | 37-check deployed matrix: genuine 404, not successful SPA HTML | Verified on candidate; original blocker closed |
| Valid SPA/IDE/preview/popout routing; API and marketing contracts | Same 37-check matrix | Verified on candidate |
| COOP/COEP, actual Monaco engine/workers, SW/manifest serving | New-deployment HTTP plus Static worker execution | Verified on candidate |
| Static HTML/CSS/JS editing, executed preview, exact save/reload/reopen | 12/12 deployed Static smoke; no page errors | Verified on candidate |
| React dependency startup, Vite and actual preview DOM | Two fresh-context controlled attempts; exact expected source/package/marker | Verified on candidate |
| Vue startup, React/Vue HMR, A/B switching and scope isolation | Prior deployed 13/13 runtime/HMR suite; application source unchanged | Accepted inherited evidence; not freshly rerun on candidate |
| File create/rename/delete, folder operations, collision and failure recovery | Prior deployed 11/11 operations plus 3/3 folder follow-up | Accepted inherited evidence |
| Runtime binary integrity | Exact bytes preserved through directory rename in prior deployed test | Accepted for tested runtime filesystem scope; not a claim of arbitrary binary IndexedDB storage |
| IndexedDB compatibility and exact persistence | Prior broad coverage plus new-candidate Static reload/reopen and controlled source checks | Verified for tested existing schema and synthetic fixtures |
| Backup/restore | Prior 14-stage export/checksum/restore/reload/conflict-copy round trip | Accepted inherited evidence; format/source unchanged |
| Service Worker registration and scope | New-candidate scope `/app/`, served SW JavaScript and manifest | Verified for registration/scope/serving |

**No mandatory tested online feature remains wholly unverified under this explicitly stated inheritance-and-delta approach.** There is no currently reproduced functional release blocker in the reviewed evidence. This does not imply every capability or operating condition has been tested.

The following are genuine limits, not disguised passes:

- Final Service Worker controller activation and offline/cache/update behavior were not established. Registration/scope/serving were the verified acceptance contract. If offline operation is a release requirement, it needs a separate focused gate before that capability is claimed.
- The optional `scratch/item.txt` child-visibility attempt remains unclassified. Independent normal file creation and `.gitkeep`-represented folder creation/deletion passed; no data-loss defect was established. That exact extra interaction was not proven successful.
- Vue/HMR/switching/backup were not repeated on the final SHA. Their inherited coverage is justified by the inspected routing-only application delta, not direct fresh execution of every scenario.
- Two fresh contexts demonstrate tested scope correctness, not formal immunity to arbitrary shell races, every stale-callback ordering, or every project size/browser/network condition.
- npm child exit-zero semantics were inferred from the unchanged `npm install … && npm run dev` chain continuing into an actual running preview. The shell exposed no separate numeric child exit callback; stdout/stderr were captured as the combined WebContainer stream.
- There is no established long-duration reliability result, multi-network comparison, or statistically sound tail-latency estimate. These are operational evidence gaps, not additional completed functional tests.

If an owner requires a full same-SHA rerun, offline certification, or an availability/latency SLA as a mandatory release policy, that expands the current acceptance contract and requires focused additional authorization. No such test has been silently claimed here.

## Residual risks and Production recommendation

| Risk | Observed evidence | Release implication |
| --- | --- | --- |
| Intermittent dependency transport failure | Earlier 61 `ERR_CONNECTION_RESET` requests and 240-second readiness timeout; original npm/final terminal state unavailable | Root cause remains unresolved. Two later successes do not establish an acceptable failure rate or recovery experience. |
| Material startup/switch latency | New controlled DOM readiness 48.312s/34.305s; earlier deployed switches 36.504–44.011s | Users face significant waits, especially when switching projects into intentionally fresh runtimes. No agreed latency budget exists in this evidence. |
| Diagnostic visibility and recovery | Original failure lacked durable npm/process/terminal evidence; temporary observer recovered it later | Durable, sanitized phase/error observations and bounded recovery are higher-value next work than speculative UI/chunk rewrites. |
| Unattributed historical console errors | Prior full runtime run had four `Process aborted` page errors and three HTTP 400 messages; controlled confirmations had neither | Not proven application defects; must remain distinguishable from expected cancellation and external failures. |
| Limited browser/cache evidence | Disposable Chromium online workflows only; final SW controller and optional folder-child case unresolved | Avoid unsupported offline or universal compatibility/reliability claims. |

Current host DNS/TLS and unauthenticated React/Vite metadata requests succeeded, and both diagnostic browser runs saw only HTTP 200 dependency responses, with zero dependency resets. This makes transient transport instability a reasonable hypothesis. It does not identify whether the previous resets originated at the local network, proxy path, CDN or provider, and it does not justify changing security/network settings or attributing the incident conclusively to the provider.

**Recommendation:** accept the candidate as functionally verified for Preview evaluation, but do not recommend broad public Production promotion yet. First perform the bounded engineering phase below, or obtain an explicit owner risk decision if considering a limited release without it. Production readiness also depends on requirements outside this scoped functional review; no broad security/operational certification is implied. Production approval is separate even if the owner accepts every residual risk.

## Measured performance bottleneck assessment

The two latest runs observed:

| Phase / boundary | Attempt 1 | Attempt 2 |
| --- | --- | --- |
| IDE document DOMContentLoaded | 0.357s | 0.403s |
| Boot promise assignment to resolution | 3.228s | 4.588s |
| Public filesystem mount | 0.007s | 0.021s |
| Public jsh spawn | 0.004s | 0.025s |
| npm command write to completion output | **30.543s** | **16.660s** |
| npm's rounded report | 61 packages in 30s | 61 packages in 16s |
| Vite's reported startup | 4.358s | 2.857s |
| Navigation to public server-ready | 44.800s | 31.864s |
| Server-ready to observed React DOM | 3.512s | 2.441s |
| Navigation to observed React DOM | **48.312s** | **34.305s** |

These boundaries overlap and include instrumentation/polling overhead; they must not be added into a purported exact total. DOMContentLoaded is not interactive application readiness. npm's measured interval includes its command/output path, not a directly exposed child-process timer. No regression percentage is claimed.

**Primary measured opportunity: dependency installation and its transport path.** Its observed interval varied by 13.883 seconds between runs, while total DOM readiness varied by 14.007 seconds. That association supports prioritizing install-path measurement and reuse; two runs do not establish causal attribution to download, resolution, extraction or lifecycle work individually. The runs observed 172 and 174 dependency HTTP-200 responses, including repeated requests, not that many unique packages. No bandwidth/concurrency/CPU bottleneck has been isolated yet.

**Secondary opportunities:** boot and Vite initialization each cost several seconds; shell/transition orchestration and preview binding also contribute. Measure the gaps before changing them. The provider/runtime path, test polling and iframe navigation need to be separated from application delays.

**Low-priority targets on present evidence:** filesystem mount and the public shell-spawn call are milliseconds, and document arrival is under half a second in these runs. They are not the leading measured startup costs. Do not use this evidence to justify rewriting the filesystem, Monaco loader, project schema, marketing site or initial bundle strategy.

Earlier deployed observations on the unchanged application source were 77.750s initial React, 49.701s Vue, and 44.011s / 39.574s / 36.504s repeated B→A→B→A switches. A retained switch terminal reported npm installation taking 22s; absent completion text in other cleared snapshots does not mean installation was skipped. These runs used different boundaries/conditions and are not a controlled before/after benchmark. No median/p95 or permanent speedup is inferred from the two latest successes.

Fresh-runtime teardown deliberately discards each project's live runtime state on cross-project switches. It is an isolation guarantee to preserve, not a performance bug to undo.

## Proposed next phase: B.4 — startup reliability and dependency performance

This is a **prioritized proposal only**, not implementation authorization. Start with one bounded local change at a time and retain a known-correct uncached path.

| Priority | Minimal next work | Required proof / guardrail |
| --- | --- | --- |
| 1. Durable observation and baseline | Add sanitized, generation/project-bound timing and lifecycle records for boot, mount, install, dev-server spawn, server-ready, binding and actual DOM. Preserve terminal evidence on failure and expose honest install/retry state. Use fixed synthetic fixtures and a small declared cold-start/switch sample; compare a second owner-approved network if available. | No headers/cookies/tokens or user source in telemetry. Record failures/cancellations and actual available process exits; distinguish inferred states. Report sample size and range; do not label tiny samples as reliable p95. Establish owner-approved latency/reliability budgets before optimization. |
| 2. Bound failure handling | Investigate the dependency reset path with captured timings/status and actionable failure reporting. Design cancellation-safe, explicit retry/recovery for confirmed transient install failures. | No blind retries of arbitrary package lifecycle side effects, no infinite retry loop, no false-ready state. A retry must belong to the same active project/generation; switching cancels it. No proxy/DNS/firewall/security changes. Failure injection must preserve authoritative project data. |
| 3. Reduce repeated dependency work | First verify that existing same-project reconnect/install-fingerprint behavior avoids duplicate work. Then evaluate a project-scoped, integrity-checked dependency cache or snapshot restored into a **new** runtime, only if supported by the installed API and demonstrably faster. | Key by project plus manifest/lock digest, runtime/package-manager compatibility and relevant install configuration. Invalidate on dependency changes; on miss/corruption use the normal clean install. Never reuse a previous project's live runtime, server, working tree or writable node_modules tree. Keep cache disposable and separate from authoritative project storage/backup. No IndexedDB identifier/schema or existing project-format change. |
| 4. Profile remaining seconds | With install/transport behavior measured, inspect boot-to-shell scheduling, redundant initialization, Vite startup and server-ready-to-iframe binding. Remove only demonstrated redundant waits/work. | Preserve event ownership, actual DOM readiness and intentional runtime retirement. Do not hide latency by declaring ready earlier, bypassing installs, or weakening teardown. No speculative rewrites based solely on the total startup time. |

Public WebContainer APIs support teardown followed by a new boot and filesystem snapshot mounting/export; those capabilities make a fresh-runtime cache experiment plausible, not a verified optimization or a promised supported persistent npm-cache feature. Check installed-version compatibility and measure artifact validation/restore cost before adopting it. See the [official WebContainer API](https://webcontainers.io/api) and [filesystem/snapshot guide](https://webcontainers.io/guides/working-with-the-file-system.html).

A cache experiment should use a strict allowlist of dependency artifacts, reject unsafe paths/integrity failures, honor quota/eviction, and avoid caching user source or credentials. Do not change user manifests/lockfiles merely to improve benchmark numbers; deterministic fixture lockfiles can be used in test projects. Any cache or orchestration implementation needs its own review and rollback path.

For any proposed change, compare the same cold-start, same-project reconnect and A→B→A workflows before/after under declared conditions. Require no loss of editor persistence, binary rename/collision handling, backup compatibility, stale-event rejection or scope isolation, including cache-miss/corruption, interrupted install and rapid-switch cases. Use existing targeted checks plus tests appropriate to the actual change; do not automatically restart the entire Phase 2.2 audit. Set pass/fail budgets with the owner rather than inventing a release SLA from two runs.

## Required approvals and stop boundary

This closure report was already authorized and needs no further approval to exist. **Owner approval is required before implementing B.4 or running a new diagnostic/benchmark campaign.** Its scope should specify permitted source changes, sample budget and intended performance/reliability gates. Previous one-time push authorizations are consumed; no new commit/push/deployment permission is inferred. Any later publication requires its own explicit authorization, and Production release requires a distinct owner decision.

Specific next engineering phase: **B.4 — startup reliability and dependency performance**, beginning with durable sanitized measurement and dependency-failure observability, then a separately reviewed bounded reuse experiment if measurements support it. No optimization has been implemented.

## Evidence references

Historical reports preserved unchanged:

- `reports/CODEX_PHASE_2_2_STAGE_B3_PREVIEW_ACCEPTANCE.md`
- `reports/CODEX_STAGE_B3_ROUTING_REPAIR.md`
- `reports/CODEX_STAGE_B3_ROUTING_DEPLOYED_REVALIDATION.md`
- `reports/CODEX_STAGE_B3_RUNTIME_NETWORK_DIAGNOSTICS.md`

Reviewed raw evidence includes `routing-deployed-http.json`, `routing-deployed-static-revalidation.json`, `stage-b3-runtime-browser.json`, `stage-b3-files.json`, `stage-b3-folders-only.json`, the documented backup/restore execution result, `runtime-network-attempt-1.json`, `runtime-network-attempt-2.json`, `runtime-network-summary.json`, and `runtime-network-host-connectivity.json`. The reports distinguish backup's captured execution output from machine-readable diagnostics; no new evidence file or test pass was invented.

**Final decision:** functional Preview acceptance is granted on the reviewed evidence, with the inherited-test scope and residual risks above. Production promotion is not recommended yet and remains unauthorized. Stop after this report; no implementation, commit, publication or deployment occurred.
