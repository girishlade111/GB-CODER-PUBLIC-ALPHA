# GB Coder — Phase B.4.2a Browser Acceptance

Verdict: **PHASE_B4_2A_BROWSER_ACCEPTED**

The single authorized local campaign passed all three real Preview DOM startups and the same-runtime reconnect control. Both normal project retirements naturally exercised the vendor exit-promise rejection branch. Neither produced an uncaught browser page error or an observed change from its retired shell callback. This accepts the bounded local B.4.2a browser revalidation; Production remains **HOLD**. Separate owner authorization is required for any commit or publication.

## Exact artifact and execution identity

- Branch: phase-2.2-webcontainer-reliability. Base Git HEAD: 546e74c084387d007b0312b9fbd69a9f6a6b55f1. The tested correction is uncommitted; HEAD alone does not identify its source.
- Approved record: [b4-2a-final-source-artifact.json](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-2a-final-source-artifact.json>). Existing successful build timestamp: 2026-10-15T08:38:11.991Z. No rebuild occurred.
- Complete source tree: 265 files, SHA-256 8a835512763c06d6a46a8309a19626f8e01478ed2fe2e64d1dea13c7312d6847.
- Complete dist tree: 177 files, SHA-256 f3d0cc10061536808fc2308cc7bee68e4c24e7492025674314529db7aafc1de9.
- dist/build-manifest.json SHA-256: cdaacfc70ef93643ea70ef5732bedc97fdeae7d7b7390f362bf0d48afa2ae136.
- Corrected service source SHA-256: c72d176de2e0c166714a284bfcf620556590384057253f00f3421e0d5ff5ef23.
- Compiled service: dist/app/assets/webcontainerService-Bw2Pb0Ah.js; SHA-256 5fb12a85fef46947e21c35aa8fa78955ec53a46787a4303f093040e72d21b4ee.
- Eight complete artifact checks inside the campaign (initial, before/after each startup, final), plus a separate read-only preflight, passed. All 151 recorded JavaScript hashes also matched.
- Chromium 151.0.7922.34, headless Playwright, one local origin http://127.0.0.1:42996, one disposable browser context, synthetic b4-a and b4-b projects only. The existing built dist was served with the local combined preview server.
- Campaign: 2026-10-15T08:49:46.430Z to 2026-10-15T08:53:16.824Z. Startup observation sum: 196.431 seconds; whole campaign wall clock: 210.394 seconds. Exactly 3/3 startup observations and 1/1 reconnect control; each startup below 240 seconds and total below 720 seconds. No retry or replacement sample. Context, browser and local server closed without reported cleanup errors.

## Startup results

Times are seconds. Real DOM time starts before the dashboard action; transition observations include returning to Projects. npm completion is inferred from real shell output, not a separately observed npm child-process numeric exit. Vite time is its own logged ready duration, not end-to-end startup time.

| # | Project | Result | Real DOM | WC boot | npm completion | Vite reported ready | Runtime ID | Epoch/generation |
| --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| 1 | React A | PASS | 57.853 | 3.639 | 34.660 | 3.821 | 1 | 1/1 |
| 2 | Vue B | PASS | 75.455 | 15.319 | 46.272 | 4.040 | 2 | 3/3 |
| 3 | React A | PASS | 63.123 | 2.101 | 53.240 | 2.314 | 3 | 5/5 |

Actual iframe DOM markers were B4_REACT_A, B4_VUE_B and B4_REACT_A, respectively. Every startup also observed a real server-ready event and a succeeded application diagnostic attempt. The interactive jsh remained the server-owning foreground shell. No required observation failed.

## Two cancellations and independent exit outcomes

| Transition | Retired runtime | Vendor rejection UTC | Vendor exit outcome | After teardown | Callback changed fields |
| --- | --- | --- | --- | ---: | --- |
| React A → Vue B | 1 | 2026-10-15T08:50:53.149Z | rejected: Error: Process aborted | 129 ms | none |
| Vue B → React A | 2 | 2026-10-15T08:52:10.965Z | rejected: Error: Process aborted | 80 ms | none |

The vendor observer captured 2 exit-promise rejections, 0 fulfillments and 0 uncaught browser page errors independently. The rejection branch **was exercised twice**, solely through the two normal project transitions. No rejection was deliberately injected, retried or repeatedly triggered. The final React shell had no exit settlement before capture/cleanup. The raw process observer's legacy state label remains running after a rejected exit promise; that label means no fulfilled numeric exit was recorded and does not establish that a retired process stayed live. No numeric shell or npm exit code is invented.

An additional observational promise handler sampled full current service state, diagnostic records, install fingerprint, automatic-operation reference and fields, shell identity and runtime identity immediately before the production exit callback and in the following microtask. Both comparisons had empty changedKeys arrays. Each rejected shell belonged to its retired runtime; the global/current runtime was not that retired instance.

Timing limitation: both rejections occurred in the dashboard retirement gap, with projectId/runtime/shell/operation null and epoch/generation 2/2 or 4/4. This browser campaign does not demonstrate a delayed rejection arriving during the replacement project's active installation. The earlier 18/18 production-module regression tests cover additional ownership races; those tests are separate evidence, not browser observations from this campaign. No late error or contamination appeared through the subsequent starts and reconnect.

## Ownership, installation and source isolation

- PASS: distinct runtime object IDs 1 → 2 → 3, with explicit teardown of IDs 1 and 2. Startup epoch/generation advanced 1/1 → 3/3 → 5/5. Every ready runtime equaled the current global instance and passed the production startup-owner check for its project.
- PASS: exactly one automatic npm install/start shell command per startup, three total. One jsh spawn per runtime; reconnect added no spawn or install command. No duplicate dispatch or automatic retry observed.
- PASS: each fresh runtime reported missing_node_modules and had no installed proof during installation. Install output reported 61 React packages, 29 Vue packages and 61 React packages added. First proof-bearing snapshot followed the owned server-ready event in each generation; each final needsDependencyInstall check returned false, with owned proof present and automatic busy false. No dependency success was inferred solely from a rejected shell exit.
- PASS: all 4 React fixture source files and all 6 Vue fixture source files were compared byte-for-byte using SHA-256 against the mounted runtime and by exact content against IndexedDB on their respective starts. React A matched the identical fixture again after returning from B. Vue-only paths were absent from both A runtimes; React-only src/main.jsx was absent from B.
- PASS: diagnostic fields remained within the allowlist and retention limits. The synthetic project identifiers, source markers and terminal npm command were absent from persisted diagnostic records. No storage schema, backup format or application source was changed by the campaign.

## Same-runtime reconnect and terminal behavior

Reconnect completed in 311 ms using the production spawnInteractiveShell/disconnect/write path twice against the already running third shell. All nine assertions passed: same project, epoch, generation, runtime and shell; no new spawn; no new install; benign carriage-return input forwarded; installed proof preserved. The application's terminal listener remained in place and startup stayed ready. Manual behavior coverage is connection, disconnect/reconnect and input forwarding while Vite owns the foreground. Arbitrary terminal command execution and interactive npm error recovery were not exercised; no additional startup was spent on them.

## Console and transport evidence

- Uncaught browser page errors: **0** for the entire context. Observer errors: **0**. Recorded connection resets: **0**. The earlier intermittent reset history is not cleared by these three observations.
- Five console error entries identify the local URL http://127.0.0.1:42996/_vercel/insights/script.js with 404 Not Found: two during initial navigation/reload and one per startup. The network ledger independently recorded two 404 responses and two aborted script requests for that URL during initial navigation. Later console entries are retained even where no matching network response event was delivered. These local analytics-resource errors did not prevent the required application DOM from rendering.
- Three fetch requests to https://t.staticblitz.com/w/v17/r/l failed with net::ERR_ABORTED, one per startup.
- Two initial Preview document requests failed with net::ERR_ABORTED: https://huk2yfexjzna4glayxojlgniumhs2x-dg1p--5173--2ed8f36d.local-corp.webcontainer-api.io/ and https://huk2yfexjzna4glayxojlgniumhs2x-dg1p-zdo135a0--5173--2ed8f36d.local-corp.webcontainer-api.io/. Both corresponding startups subsequently reached their correct real DOM. The abort causes were not established.
- No vendor runtime-asset non-success response or transport reset was recorded. All actual request failures and console locations are retained in the raw evidence; successful render is not reported as zero network failures.

## Limits and release decision

This is one local, instrumented A → B → A sequence, not a long-run reliability sample or a deployed Preview acceptance rerun. Boot, npm and switching latency remain material. Fresh runtime isolation intentionally incurred a new install on returning to A. No cache, snapshot or performance optimization was introduced, and no regression percentage is inferred. Instrumentation observed the actual compiled service and vendor objects but adds some timing overhead. Active-owner rejection, numeric-exit fulfillment and adversarial delayed-rejection timing were not exercised in this browser campaign. Existing wider Static Editor, HMR, file-operation and backup acceptance evidence was preserved without repeating that audit.

No application source changes, rebuilds, commits, pushes, deployments, PRs, merges, Production operations or credential changes were performed. Stop here pending separate commit authorization. Production remains HOLD.

## Evidence and Git status

- [Raw campaign ledger](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-2a-browser-revalidation.json>) (SHA-256 378d9b338bc23fe387b2a02ec6e8368519e5814309cedfaa0fd9ebc4637a86bd).
- [Derived summary](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-2a-browser-summary.json>), [execution log](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-2a-browser-revalidation.log>) and [bounded harness](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/scripts/revalidate-phase-b4-2a-browser.mjs>) (harness SHA-256 86870a99cabce389ae3aab67d12d7c66ceb9da786ab86376a86e3426ed5d5a67).
- [Prior fix and targeted-test report](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/CODEX_PHASE_B4_2A_SHELL_EXIT_REJECTION_FIX.md>) and [prior blocked final-runtime report](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/CODEX_PHASE_B4_FINAL_RUNTIME_REVALIDATION.md>) remain unchanged.

The campaign's before/after Git porcelain snapshots were identical. HEAD and branch remain unchanged; staging is empty. The four pre-existing tracked modifications are listed below, alongside the two pre-existing untracked B.4 source modules. This turn added only the bounded harness and report/evidence files. Numerous older untracked reports/scripts remain in place.

```text
 M src/components/Console/TerminalTab.tsx
 M src/components/vscode/StackBlitzStartupLoader.tsx
 M src/components/vscode/VSCodeMode.tsx
 M src/services/webcontainer/webcontainerService.ts
?? src/services/webcontainer/startupDiagnostics.ts
?? src/services/webcontainer/startupOutput.ts
```
