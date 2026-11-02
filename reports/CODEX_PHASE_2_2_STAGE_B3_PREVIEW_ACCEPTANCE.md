# GB Coder Phase 2.2 — Stage B.3 deployed Preview acceptance

Date: 2026-10-14. Final verdict: **STAGE_B3_PREVIEW_BLOCKED**.

The approved commit is published and the exact existing deployment is READY. Protected browser acceptance ran successfully using an existing authorized automation credential. A confirmed serving defect blocks acceptance: a missing JavaScript asset under `/app/assets/` returns the SPA HTML document with HTTP 200. No application code, deployment configuration, or remote release state was changed to repair it.

## Authorization, publication, and identity

The owner explicitly authorized exactly one non-force push of `ac58b6b552422aa78e3f94c9e2dc5ee94902a018`, after verifying the remote feature branch remained `b97d7be81ae657df41de1dafeac54e7ff4af947a`. That push ran exactly once and exited 0:

```powershell
git push origin ac58b6b552422aa78e3f94c9e2dc5ee94902a018:refs/heads/phase-2.2-webcontainer-reliability
```

Independent post-push and final read-only remote queries confirmed:

| Ref | Full SHA |
| --- | --- |
| Feature `phase-2.2-webcontainer-reliability` | `ac58b6b552422aa78e3f94c9e2dc5ee94902a018` |
| Production `main` | `1b954486e292436794b0764638ea454bb78fae11` |

Origin is `git@github.com:girishlade111/GB-CODER-PUBLIC-ALPHA.git`. Tracked working tree/index remain clean. Local generated evidence and temporary harnesses remain untracked. No subsequent push, PR, merge, remote rebuild, manual deployment, Production modification, DNS change, schema change, or real-user data operation occurred.

| Deployment identity | Verified value |
| --- | --- |
| ID | `dpl_FYnW629mEkc4KRPXEY6vdg5dpTUR` |
| URL | https://gb-coder-public-alpha-ccyelci13.vercel.app |
| Project | `gb-coder-public-alpha` / `prj_Cbyer1VtBwQwrqRVCFhNOUERJFiD` |
| Full commit | `ac58b6b552422aa78e3f94c9e2dc5ee94902a018` |
| Branch | `phase-2.2-webcontainer-reliability` |
| Source | `git` — automatic deployment from the approved push |
| Status | `READY` / `readyState: READY` |
| Target | CLI explicitly reports `preview`; API reports `null`, not production |
| Ready timestamp | `1792017350351` |

Vercel CLI 64.1.0, using existing authentication and the explicit `girishlade111-gmailcoms-projects` scope, independently confirmed Ready/Preview. Read-only `inspect ... --logs` exited 0 and showed the expected branch/commit clone, successful unified build, `Build Completed in /vercel/output`, and `Deployment completed`. Remote build duration was **1m 44s**, post-build **47s**. These are deployment build times, not WebContainer startup times. CLI was run from npm's external cache without changing repository dependencies.

## Authentication history and credential handling

The initial connector team-scoped metadata/build-log requests returned HTTP 403. Later metadata retrieval confirmed READY, and the authenticated CLI successfully retrieved both deployment details and completed build logs. The historical connector 403 is distinct from successful CLI access.

A headed disposable Chromium was opened for owner login. The owner reported that Vercel rejected login because the browser might not be trusted. This was an authentication failure, not a confirmed application defect. The initial unauthenticated navigation ended at Vercel's login document; its HTTP 200 was never counted as an application pass.

The owner then explicitly authorized controlled automation bypass use, preferring an existing credential and allowing at most one temporary credential only if reliable cleanup was possible. A read-only project lookup found **one existing automation credential**. Only this existing shared credential was used; **zero credentials were created and zero revoked**. Revocation was therefore not applicable, and the shared credential was preserved. No protection policy, selected environment-variable secret, deployment, or Production configuration was changed.

Credential values were captured only in process memory, never printed or written to source, reports, Git, screenshots, persistent environment files, or browser logs. The harness supplied the bypass HTTP header only to the exact approved Preview origin and used its authorized cookie in disposable browser contexts. The header was not sent to WebContainer/StackBlitz or other origins. Tests necessarily loaded ordinary external runtime resources and generated WebContainer preview origins; no other Vercel deployment or Production URL was targeted. All automated test contexts were closed.

An end-of-run read-only lookup still found one existing automation credential. An in-memory comparison found **zero occurrences of its value in task JSON/log/Markdown evidence**. No new credential required revocation or revocation verification. Browser authentication artifacts remained ephemeral.

An earlier pre-approval `vercel curl` attempt was rejected by automatic approval review before execution because of possible bypass-token side effects. After the owner's separate conditional approval, browser tests used the existing credential directly; no credential-creation endpoint was called.

## Deployed routes, headers, assets, and Service Worker

Real protected HTTP observations are in `reports/stage-b3-http.json`:

| Path | Status / MIME | Result |
| --- | --- | --- |
| `/app/`, `/app/projects`, `/ide` | 200 HTML; COOP `same-origin`, COEP `require-corp` | PASS |
| `/app/sw.js` | 200 `application/javascript`; same isolation headers | PASS |
| `/app/manifest.webmanifest` | 200 `application/manifest+json` | PASS |
| `/api/stage-b3-missing` | 404 `text/plain`, non-HTML | PASS |
| `/app/assets/stage-b3-missing.js` | **200 `text/html`, 4,974-byte SPA document** | **FAIL — release blocker** |

The missing executable-asset response violates the required non-HTML fallback behavior and can mask missing/stale executable URLs. It is an observed deployment-serving defect, independent of authentication. Existing real assets loaded successfully; no claim is made that this probe broke a current editor session. Source `vercel.json` has a broad `/app/(.*)` SPA rewrite, consistent with this observation; no remote routing change was attempted.

Static browser evidence confirms same-origin Monaco bootstrap, no CDN Monaco response, and editor/HTML/CSS/TypeScript worker execution (one of each). Worker assets returned 200 JavaScript MIME from the approved Preview origin. Registration scope was exactly `https://gb-coder-public-alpha-ccyelci13.vercel.app/app/`. Registration and worker resource serving were verified; the final Static snapshot did not include a controller script URL, so final controller activation is not claimed. Playwright routing was used for narrowly scoped authentication headers; these runs do not establish offline/cache behavior.

## Successfully completed deployed browser acceptance

All data was synthetic, in disposable Playwright contexts. Existing local harnesses were copied to temporary local files with only remote target, authentication adapter, evidence paths, and additional observations/assertions changed; no localhost server substituted for deployed application behavior. Browser runtime suites ran sequentially. The backup suite briefly overlapped the first runtime suite; timing comparisons are observational, not controlled benchmarks.

| Suite | Actual result |
| --- | --- |
| Static Editor | **12/12, exit 0**: UI project creation, three real Monaco editors, exact HTML/CSS/JS keyboard edits, computed CSS and executed JS in real live preview, exact IndexedDB contents, reload/reopen, Advanced IDE switch preservation, worker execution |
| React/Vue runtime and HMR | **13/13, exit 0**: dependency startup, expected React/Vue preview DOM, dashboard disassociation, B→A→B→A in-app switches, no stale project content/URL, empty/manifest-less transitions, Back/Forward, React Monaco edits/HMR, Vue SFC HMR, reload/storage consistency, root/nested manifest checks |
| Advanced file operations | **11/11, exit 0**: UI create/rename/delete, case-collision rejection without phantom success, runtime-only destination collision preserving source and destination, injected permission/delete failures preserving tree/IndexedDB/dialog, successful recovery, directory rename, exact runtime binary bytes, reload persistence, Static smoke |
| Folder follow-up | **3/3, exit 0**: file creation, New Folder persistence through the automatic `scratch/.gitkeep` record, directory deletion removing its tree and descendant IndexedDB records |
| Backup/restore | **14 stages, exit 0**: synthetic historical-schema fixtures, UI export, archive checksums, clean-context restore, exact content, reload persistence, second conflict restore producing four projects without overwriting |
| Separate instrumented startup | **1/1 real React preview, exit 0**, timing details below |

Binary check wrote `[0,255,128,17,0,250]` to a runtime-only file inside the source directory and verified the same bytes after the UI directory rename. This establishes physical runtime byte preservation; it does not claim support for persisting arbitrary binary files in the text-based project schema. The collision check created a runtime destination sentinel and verified UI rename rejection preserved both the source and sentinel. Failed physical operations were injected only into synthetic disposable runtimes, not application source or a remote service.

An initial added folder-child test timed out waiting for `scratch/item.txt` visibility. That attempt is preserved in `stage-b3-files-folders.json` and was **not counted as a pass or proven data-loss defect**. The focused folder test instead asserted the application's actual `.gitkeep` representation and deletion, and passed. Creation/visibility of that extra `.txt` child remains unclassified; the independent file-create and folder-create/delete requirements are covered by the passing checks above.

## Measured performance and assessment

Primary runtime results end only after the expected preview DOM marker renders:

| Workflow | Preview ready | Vite reported startup |
| --- | --- | --- |
| Initial React | 77.750s | 4.673s |
| First Vue selection | 49.701s | 3.146s |
| B→A | 44.011s | 2.625s |
| A→B | 39.574s | 2.903s |
| B→A repeated | 36.504s | 2.623s |

The last switch retained npm output `added 61 packages in 22s`. Other final terminal snapshots were cleared by Vite; `installCompletions: 0` means no retained completion text, not that installation did not run.

A fresh, separately instrumented React run measured:

| Phase | Observation |
| --- | --- |
| Initial application document load | DOMContentLoaded at **528.685ms**; not full interactive-dashboard readiness |
| IDE document load | DOMContentLoaded at **239.795ms** |
| WebContainer boot | **3,689.545ms** from first observed boot promise to resolution; sampled every 50ms, not an intercepted exact boot-call boundary |
| Dependency installation | **29,048ms** from first visible install text to first completion; npm itself reported **28s**, 61 packages |
| Vite startup | Vite reported **2,745ms** |
| Actual React preview DOM | **45,406ms** from IDE navigation |

The observational sampler repeatedly reported completion while terminal text remained visible. `stage-b3-performance-summary.json` deliberately uses only the first start/completion pair; repeated observations are not multiple npm installations. No application/runtime method was patched for timing.

Previous local observations were about 61.970s React, 32.741s Vue, and 16.415–26.816s repeated switches. The primary deployed run was slower, while a later React run reached 45.406s, showing substantial variability. No controlled identical-machine/network benchmark or percentage regression is claimed. Initial DOM load is comparatively small; dependency/runtime/server startup dominates usable preview readiness. Repeated switches of 36–44s are a material public-release usability cost. A separate targeted measurement/optimization pass is recommended before public-release signoff, while preserving runtime teardown and project isolation. No performance improvement was attempted during acceptance.

## Console/network findings and limits

Static Editor recorded **zero page errors**, with an aborted StackBlitz headless request during the superseded Advanced IDE transition. The runtime suite recorded **four `Process aborted` page errors**, **three HTTP 400 console messages**, and aborted StaticBlitz/WebContainer/headless requests during the multi-navigation run. Their exact URLs/timestamps are retained in diagnostics; not every HTTP 400 was associated with a captured response URL, so its cause is not invented. Passing DOM/HMR/isolation assertions do not erase these errors, and no claim of a clean runtime console is made. Some error timing is consistent with runtime retirement/navigation, but that is an inference rather than proven attribution.

Additional filesystem diagnostics include intentional injected failure messages; those are expected negative-test outcomes, distinguished from spontaneous application errors. No cross-project contamination or unexpected persisted-source change was observed in completed assertions. No external deployment/Production browser profile was used. Optional offline/cache operation, arbitrary shell races, and formal transactional rename guarantees were not established by these tests.

## Evidence and final recommendation

Evidence files under `reports/`:

- `stage-b3-http.json`
- `stage-b3-static-deployed.json`, `stage-b3-static-deployed-working.png`, `stage-b3-static-diagnostics.json`
- `stage-b3-runtime-browser.json`, `stage-b3-runtime-diagnostics.json`
- `stage-b3-files.json`, `stage-b3-files-diagnostics.json`
- `stage-b3-files-folders.json` (preserved extra-test timeout), `stage-b3-folders-only.json`, `stage-b3-folders-only-diagnostics.json`
- `stage-b3-backup-diagnostics.json` (backup exit 0 and all 14 completed stages were captured in the execution output)
- `stage-b3-performance.json`, `stage-b3-performance-diagnostics.json`, `stage-b3-performance-summary.json`

**STAGE_B3_PREVIEW_BLOCKED.** Required browser functionality substantially passed, and READY/build/commit identity are established. The confirmed missing-JavaScript HTML fallback prevents acceptance. The extra folder-child visibility timeout, runtime console errors, final Service Worker controller observation, and material startup latency remain explicitly visible limitations. A serving repair would require separate authorization for code/publication/deployment; none is authorized or performed here. Stop at this report. No Production release is authorized.
