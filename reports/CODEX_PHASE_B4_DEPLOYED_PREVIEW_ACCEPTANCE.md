# GB Coder — Phase B.4 Deployed Preview Acceptance

Verdict: **PHASE_B4_PREVIEW_ACCEPTED**

The approved commit was published with exactly one non-force feature-branch push. Its automatically triggered Preview is READY and passed the focused functional checks: deployed routing/assets, Static Editor/Monaco, React → Vue → React real DOM startup, fresh-runtime isolation, owned install proof/single dispatch, naturally rejected retired-shell exits, reconnect, and the separately completed diagnostic/IndexedDB retention contract check. This is bounded functional Preview acceptance, not a reliability-rate claim or Production authorization. Production remains **HOLD**.

Automation was not uniformly clean: two HTTP harness/protocol setup failures, a premature Service Worker controller assertion, a 30-second activation observation timeout, and a post-runtime navigation observer error are preserved below. No failed startup was retried or replaced. The raw runtime ledger still says BLOCKED because its appended retention observer failed after all three startup samples and reconnect had passed; that raw status has not been rewritten.

## Publication safeguards and exact deployment

Immediately before publication, verified local branch phase-2.2-webcontainer-reliability, HEAD 30804ea3e3f94814b46b7a9934fb477f91354615, sole parent 546e74c084387d007b0312b9fbd69a9f6a6b55f1, a clean tracked working tree/index, the exact authorized ten-file commit and normal fast-forward ancestry. The origin repository was girishlade111/GB-CODER-PUBLIC-ALPHA. A fresh ls-remote confirmed the feature branch still at the parent and main at 1b954486e292436794b0764638ea454bb78fae11. Read-only Vercel project metadata confirmed its connected Production branch is main. All required preflight conditions passed.

Executed once, successfully:

```text
git push origin 30804ea3e3f94814b46b7a9934fb477f91354615:refs/heads/phase-2.2-webcontainer-reliability
```

Post-push and final ls-remote checks confirmed the exact published SHA and unchanged main. No second push, force push, manual build/deployment, PR, merge or additional commit occurred.

| Identity | Verified value |
| --- | --- |
| Project | gb-coder-public-alpha / prj_Cbyer1VtBwQwrqRVCFhNOUERJFiD |
| Deployment | dpl_AJLZJp924BvwnZAf1KyZmnQYgttS |
| Preview | [gb-coder-public-alpha-6l37qqpda.vercel.app](https://gb-coder-public-alpha-6l37qqpda.vercel.app) |
| Commit | 30804ea3e3f94814b46b7a9934fb477f91354615 |
| Branch | phase-2.2-webcontainer-reliability |
| Environment | Preview; Vercel API target=null, no custom environment, Production branch remains main |
| Final deployment state | READY, checked 2026-10-15T10:26:15.531Z |
| Production deployment | dpl_72WQ33EXbkePS6fGQSnBF4n2yBTW, unchanged SHA 1b954486e292436794b0764638ea454bb78fae11 |

The Git SHA-filtered deployment list, deployment gitSource and GitHub metadata agreed. Build logs identify the correct feature branch and short commit 30804ea, report UNIFIED BUILD SUCCEEDED DETERMINISTICALLY, Build Completed in /vercel/output and Deployment completed. The unified build recorded 72.893 seconds; 299 build events were saved with zero type=error events. Read-only API access through the existing authenticated CLI succeeded; no API 403 blocker remained.

The six application source files retain the accepted source-tree SHA-256 8a835512763c06d6a46a8309a19626f8e01478ed2fe2e64d1dea13c7312d6847. The deployed /app/assets/webcontainerService-Bw2Pb0Ah.js independently hashed to 5fb12a85fef46947e21c35aa8fa78955ec53a46787a4303f093040e72d21b4ee, exactly matching the browser-accepted local compiled service. Remote Monaco/worker asset filenames were derived from this deployment's build logs. A byte-identical whole cloud dist tree is not claimed.

## Focused deployed HTTP and Static Editor checks

**38 HTTP cases PASS**, issued directly without a browser Service Worker: application HTML on SPA routes; genuine 404s rather than 200 SPA HTML for 11 missing asset variants including JS, CSS, workers, source maps and WASM; valid same-origin Monaco engine and HTML/CSS/TypeScript/editor worker assets; Service Worker and manifest MIME types; COOP same-origin and COEP require-corp on tested application routes; JSON /api/health; missing API 404; marketing routes.

**11 Static Editor checks PASS**: UI project creation, three real Monaco editors, exact HTML/CSS/JS keyboard input, actual JavaScript execution and CSS in the Preview DOM, exact three-file IndexedDB storage, reload persistence, dashboard reopen persistence, and executed same-origin Monaco workers. No Monaco CDN bootstrap response, failed editor/worker request, uncaught page error or console error was recorded in that context.

An additional immediate controller assertion failed even though /app/ was registered. A separate dashboard-only lifecycle observation saw /app/sw.js and workbox-d4f8be5c.js return 200, but the worker was still installing at its 30-second cutoff, without console/page/request errors. During the subsequent runtime campaign, **all three ready-state captures** showed controller /app/sw.js, registration scope /app/ and active state activated. Registration/control therefore eventually succeeded. Exact activation latency was not captured, and prompt first-visit activation is not claimed. The initial failed assertion and timed-out observation remain recorded.

## React/Vue startup measurements

Chromium 151.0.7922.34; one sequential runtime context; synthetic React A and Vue B fixtures only. Exactly three WebContainer startup observations, each capped at 240 seconds, no retry and no replacement sample. Total startup observation time 175.087 seconds. Real DOM time starts before the dashboard action, including project transitions. npm time is inferred from shell completion output, not a separately observed numeric npm exit. Vite time is its own logged ready duration.

| # | Project | Result | Real DOM s | Boot s | Mount s | npm hint s | Vite ready s | Runtime ID | Epoch/generation |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| 1 | React A | PASS | 69.505 | 9.350 | 8.786 | 41.604 | 3.007 | 1 | 1/1 |
| 2 | Vue B | PASS | 49.333 | 9.895 | 7.909 | 22.946 | 3.703 | 2 | 3/3 |
| 3 | React A | PASS | 56.249 | 2.833 | 7.739 | 34.872 | 3.927 | 3 | 5/5 |

Actual DOM markers were B4_REACT_A, B4_VUE_B and B4_REACT_A. Each sample had a real server-ready event and succeeded application diagnostic record. Runtime objects were distinct, current/global ownership matched, and the old runtime was explicitly retired at each transition. Exact mounted source hashes matched the fixture, project-specific foreign paths were absent, and the IndexedDB source content matched on each ready-state assertion.

Every fresh runtime required installation because node_modules was missing. Exactly one automatic npm install/start command was observed per startup and one jsh spawn per runtime. Owned install proof appeared after the genuine server-ready event, with automatic busy false and needsDependencyInstall=false afterward. No rejected shell exit was counted as dependency success. Returning to A used a fresh runtime and installed again; no cross-project dependency reuse, caching or automatic installation retry was introduced.

## Cancellation, exit promises and reconnect

| Transition | Retired runtime | Exit event UTC | Independent vendor outcome | After teardown | Changed protected fields |
| --- | --- | --- | --- | ---: | --- |
| A → B | 1 | 2026-10-15T10:22:02.564Z | rejected: Error: Process aborted | 75 ms | none |
| B → A | 2 | 2026-10-15T10:22:53.642Z | rejected: Error: Process aborted | 37 ms | none |

Both vendor exit-promise rejections occurred naturally during the two project retirements. The rejection branch was exercised twice; zero fulfillments were observed before control capture. Independent browser pageerror capture recorded zero uncaught errors. Before/after microtask comparisons found no change to current service state, diagnostics, install proof, automatic-operation reference/fields, shell or runtime identity. Both rejections arrived in the dashboard retirement gap with no active project/runtime; adversarial late rejection during a replacement install and active-owner rejection were not browser-exercised here. Existing production-module regression coverage for those cases remains historical evidence.

The same-runtime reconnect control passed all nine assertions in 309 ms: same project, epoch, generation, runtime and shell; no new spawn/install; benign manual input forwarded; installed proof retained. Arbitrary manual terminal command execution and full component-remount behavior were not retested.

## Diagnostic privacy and persistence

Runtime diagnostic records passed field allowlists and bounded retention checks. Raw project identifiers, source markers and npm commands were excluded from stored diagnostic data contracts.

After startup/reconnect, an appended test step performed a full dashboard navigation and then tried to use the previous document's observer. It failed with Cannot read properties of undefined (reading snapshot). This is a harness-injected page.evaluate error, not an uncaught application pageerror, and occurred after the three passing starts and reconnect were captured. The original raw ledger remains BLOCKED with that error. No startup was repeated to repair the harness result. Natural-history reload completion in that original context remains unverified.

A separate dashboard-only contract check then used a fresh disposable context: it seeded the three captured sanitized runtime records and synthetic source fixtures, invoked the deployed service's public attach/detach path to write a new genuinely cancelled synthetic diagnostic attempt without booting a runtime, and reloaded twice. The actual compiled writer excluded the control's raw project ID. All four records and their 3,211-byte serialized sessionStorage value remained exact across both reloads. Both projects retained exactly 4 React and 6 Vue source files with exact fixture contents. No runtime instance or WebContainer boot occurred; no console/page/request error was recorded. This verifies the deployed writer/reload contract separately and does not relabel the failed original post-control observer as a pass.

## Transport failures, retained failed attempts and limitations

The runtime context recorded no console errors, zero uncaught page errors, zero HTTP error responses in its captured network stream, and zero connection-reset failures. It did record five external net::ERR_ABORTED requests: three fetches to https://t.staticblitz.com/w/v17/r/l and two initial Preview document requests (full URLs and timestamps retained in the raw ledger). The corresponding real DOM checks passed. Abort causes were not established, and successful rendering is not described as zero transport failures.

Retained unsuccessful automation observations:

1. HTTP harness used BrowserContext.request on an APIRequestContext and failed before issuing a test request (zero HTTP results). Corrected only the temporary harness.
2. The next HTTP attempt expected 200 from Vercel's set-bypass-cookie bootstrap; it received the expected 307 to the same Preview path and a transient _vercel_jwt cookie. The credential worked; separating cookie bootstrap from direct bypass-header requests yielded the 38 passing cases. Cookie values were never recorded.
3. Static harness's premature controller assertion and the separate 30-second still-installing observation; later actual runtime captures verify activated control.
4. Runtime harness post-control observer loss after navigation; original BLOCKED status retained, followed by the separate no-startup persistence contract check described above.

No application startup failure was observed in this campaign. The earlier intermittent dependency/runtime connection resets remain unresolved historical risk. Three successful deployed starts do not establish a reliability improvement, regression percentage or failure-rate bound. Installation, mounting, boot and switching retain material latency; no controlled performance comparison or network root cause is claimed.

Only one existing authorized project automation credential was used, in memory and in HTTP headers restricted to the exact Preview origin. No automation credential was created, modified, rotated or revoked. A final scan of all 29 generated evidence/harness files, including screenshots, found zero occurrences of the existing credential. Cookie values were never recorded; disposable authentication session cookies remained in their browser/request contexts. No Deployment Protection, environment, DNS or Vercel setting was changed.

## Final state and evidence

HEAD and remote feature HEAD remain 30804ea3e3f94814b46b7a9934fb477f91354615. The tracked working tree and index are clean. All 225 pre-existing unrelated untracked files remain present and untracked; historical reports are preserved. This work added only untracked test harnesses and evidence. No source correction, new commit, second push, PR, merge, storage migration, dependency caching or real user-data operation occurred. Production main and its deployment are unchanged. **Production remains HOLD.**

- [Derived acceptance summary and evidence hashes](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-deployed-summary.json>).
- [Credential hygiene scan](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-deployed-credential-hygiene.json>).
- [Deployment identity](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-deployed-deployment.json>), [final deployment/Production state](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-deployed-final-state.json>), [build events](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-deployed-build-events.json>), [build log](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-deployed-build.log>).
- [HTTP checks](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-deployed-http.json>), [initial HTTP harness error](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-deployed-http-harness-error.json>), [initial authentication redirect result](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-deployed-http-auth-redirect.json>), [safe bootstrap diagnosis](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-deployed-auth-bootstrap.json>).
- [Static Editor evidence including premature assertion](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-deployed-static-focused.json>), [bounded Service Worker lifecycle observation](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-deployed-sw-lifecycle.json>).
- [Unmodified raw runtime ledger including post-control harness error](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-deployed-runtime.json>), [runtime log](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-deployed-runtime.log>), [separate persistence contract evidence](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-deployed-persistence.json>).

Stop after this report. Any further source work, publication or Production promotion requires separate owner authorization.
