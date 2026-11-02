# GB Coder — Stage B.3 targeted routing repair

Date: 2026-10-14 (America/Los_Angeles). Verdict: **STAGE_B3_ROUTING_LOCAL_FIX_READY**.

The confirmed missing-asset SPA fallback is corrected locally. All required local gates passed, and exactly one focused local commit was created. **No push or remote deployment occurred.** The existing Preview still serves the old configuration and remains blocked until a separately authorized publication and deployed routing revalidation.

## Root cause and independent reproduction

Vercel checks the filesystem before applying configured rewrites. Existing static files therefore bypassed the broad final `/app/(.*)` rewrite and loaded correctly; missing executable URLs fell through and matched that rewrite, which selected `/app/index.html` with HTTP 200. Rewrite order did not protect missing assets because none of the preceding rules matched their paths. Vercel's official routing utilities independently compiled this configuration into header rules, a `filesystem` phase, then the ordered rewrites. See [Vercel configuration: rewrites and negative lookahead](https://vercel.com/docs/project-configuration/vercel-json) and [Vercel rewrites](https://vercel.com/docs/routing/rewrites).

A new read-only HTTP request to the existing approved Preview independently reproduced both responses:

| Existing deployed path | Status | MIME / body |
| --- | --- | --- |
| `/app/projects` | 200 | HTML, 4,974 bytes, application root |
| `/app/assets/stage-b3-missing.js` | **200** | **HTML, 4,974 bytes, application root** |

Evidence: `reports/stage-b3-routing-remote-before.json`. Requests used the previously authorized existing bypass credential in memory and only the exact approved Preview host. No credential, environment secret, or protection setting was created/changed/revoked. These were direct server-side HTTP requests with no Service Worker, proving the defect exists independently of browser caching. The generated Service Worker was not changed.

## Exact correction

Only the final rewrite in `vercel.json` changed:

```diff
- { "source": "/app/(.*)", "destination": "/app/index.html" }
+ { "source": "/app/((?!assets(?:/|$)|.*\\.[^/]+(?:/|$)).*)", "destination": "/app/index.html" }
```

The captured negative lookahead excludes the `assets` namespace, including extensionless and nested paths, and excludes file-like path segments containing a dot, including JS/CSS/worker/wasm/map/manifest URLs and trailing-slash variants. It retains extensionless SPA paths. Existing application project IDs already prohibit dots; canonical project/editor/IDE URLs remain eligible. Query strings are not part of pathname matching.

The candidate was validated with **official `@vercel/routing-utils` 6.6.0**, not merely a hand-written regex matcher. `getTransformedRoutes` returned no configuration error and retained filesystem precedence. All other rewrite entries, headers, function settings, and top-level configuration are asserted deeply equal to the reviewed baseline commit. API and legacy preview/popout rules are unchanged. No functions were added (still 12).

Committed associated tests:

- `scripts/helpers/vercel-routing-preview.mjs`: official configuration compilation plus a loopback HTTP filesystem/rewrite model, serving the frozen built artifacts and delegating existing APIs to the existing local handler adapter.
- `scripts/test-vercel-routing.mjs`: before/after defect reproduction, route matrix, real artifact/MIME checks, unchanged configuration assertions, filesystem phase ordering.

The official parser is installed outside the repository in an isolated temporary tools directory; no package.json or lockfile changes were made. To reproduce:

```powershell
$stageB3Tools = Join-Path $env:TEMP 'gb-coder-stage-b3-routing-tools'
npm install --prefix $stageB3Tools --no-save --package-lock=false @vercel/routing-utils@6.6.0
$env:VERCEL_ROUTING_UTILS_PATH = Join-Path $stageB3Tools 'node_modules/@vercel/routing-utils'
node scripts/test-vercel-routing.mjs
```

## Before/after routing matrix

The old compiled configuration reproduced HTTP 200 with the exact built SPA document for the missing JavaScript URL. The corrected compiled configuration passed **42 actual loopback HTTP assertions**, including:

| Group | Paths / resources | Local result |
| --- | --- | --- |
| SPA | `/app`, `/app/`, `/app/projects`, `/app/projects/synthetic-id/editor`, `/app/projects/synthetic-id/ide`, trailing editor slash, `/app/ide`, `/app/editor` | 200 app shell; COOP `same-origin`, COEP `require-corp` |
| Legacy / detached preview | `/ide`, `/preview-popout`, `/preview/synthetic-id`, `/mpreview/synthetic-id` | 200 app shell; existing header configuration unchanged |
| Actual scripts/styles | Vite entry, CSS, Monaco engine, HTML/CSS/TypeScript/editor workers | 200, correct JavaScript/CSS MIME |
| PWA / resources | `/app/sw.js`, `/app/manifest.webmanifest`, real built image | 200, JavaScript/manifest/image MIME |
| Missing assets | JS, CSS, worker, workbox file, nested JS, source map, extensionless assets, assets namespace root, MJS, WASM, trailing JS slash, uppercase CSS, missing icon, SW-related query URL, missing manifest | 404, never rewritten to app shell; plain text in local model |
| APIs | missing endpoint and `/api/health` | 404 JSON and 200 JSON, respectively |
| Marketing | `/`, `/about/`, actual Astro CSS | 200 HTML/HTML/CSS; existing routing preserved |

Machine-readable assertions: `reports/stage-b3-routing-http.json`.

**Verification boundary:** this is an official rule-compiler-backed local HTTP model, not the deployed Vercel edge, Vercel's complete dev runtime, or a new Preview. Filesystem selection and compiled rewrite matching are exercised; API execution uses the existing local adapter. The model emits a plain-text 404. The real edge may serve its own/custom 404 document instead, so its precise error MIME/body and encoded-path normalization require deployed revalidation. A legitimate 404 error document is distinct from successful SPA HTML. No claim of a deployed-after PASS is made. Existing legacy preview headers are preserved, not expanded.

## Required local gates

A new unified build completed before final HTTP/browser acceptance. No build ran during the final browser checks. Frozen `dist/build-manifest.json` SHA256 before and after those checks:

`5B75574323D830E6E8E3408693B87A8064AED2E3006BFB783B0B47D651225FC9`.

| Command / check | Exit | Result |
| --- | --- | --- |
| `npx tsc --noEmit -p tsconfig.app.json` | 0 | no diagnostics |
| `npx tsc -b` | 0 | project checks pass |
| `npm run verify:deploy` | 0 | strict config valid, 12 functions, header coverage; live-after check intentionally not claimed |
| `npm run build` | 0 | unified build/integrity validation; log `reports/stage-b3-routing-build.log` |
| `npm run verify:bundle` | 0 | initial JS 608,946 bytes, 594.7 KiB, gzip 188.2 KiB; Monaco engine remains lazy |
| `node scripts/test-vercel-routing.mjs` with official parser path | 0 | 42 HTTP assertions; old config reproduces defect |
| `node scripts/test-preview-combined.mjs` | 0 | existing 7/7 HTTP/build checks and bundle budget |
| `node --check` on both added test/helper files | 0 | syntax valid |
| `git diff --check`, staged equivalent | 0 | clean |
| Targeted Static Editor browser smoke | 0 | 12/12 |
| Focused React/WebContainer startup browser smoke | 0 | 1/1 real preview |

The local sandbox initially denied loopback connections; the tests were run with the authorized desktop execution path. Early test-development issues were corrected before the final frozen-build runs; they are not counted as passing gates.

## Focused browser smoke

Temporary local harness copies served the frozen build through `scripts/helpers/vercel-routing-preview.mjs` rather than the old hard-coded preview routing. They are local generated artifacts, excluded from the commit. Disposable Chromium contexts and synthetic projects only; no real user profile/IndexedDB reset.

Static command: `node scripts/.tmp-routing-static.mjs --evidence=smoke --block-monaco-cdn`, with the official parser path in the process environment. **12/12:** UI creation, all three Monaco instances, exact HTML/CSS/JS keyboard input, computed CSS/executed JS in real preview, exact IndexedDB contents, reload, dashboard reopen, Advanced IDE switch preservation, HTML/CSS/TypeScript workers. Zero page errors. Evidence: `routing-static-smoke.json` and `routing-static-smoke-working.png`.

Advanced command: `node scripts/.tmp-routing-runtime.mjs`, same parser environment. **1/1:** real React dependency installation/startup, Vite, WebContainer URL and expected actual preview DOM. Navigation-to-preview was **54.231s**, Vite reported **4.166s**. Evidence: `routing-runtime-smoke.json`. This is a focused smoke, not a new optimization benchmark or a repeat of the entire reliability audit.

## Preserved outstanding observations

The previous deployed acceptance report remains unchanged. Its slow startup/switching observations, HTTP 400 messages and `Process aborted` diagnostics, optional `.txt` folder-child visibility timeout, and missing final Service Worker controller observation remain outstanding. This routing correction does not purport to fix or reclassify them. Service Worker registration/asset MIME and editor operation passed; offline caching/controller activation remains outside this targeted proof.

Local Static smoke retains failed/aborted Vercel Analytics requests, optional Google Fonts failures, and an aborted superseded StackBlitz navigation. These are in the evidence and were not relabeled successful. Prior broader runtime/project-isolation, binary/collision, persistence and backup results are preserved without redesign or broad retesting. Performance optimization requires its own measured engineering decision.

No IndexedDB identifiers/schema, project storage, editor design, Advanced IDE appearance, WebContainer isolation, npm startup, Monaco loader, Astro source, or backup format changed.

## Local commit and release boundary

Exactly one focused local commit:

- SHA: `546e74c084387d007b0312b9fbd69a9f6a6b55f1`.
- Message: `fix(routing): exclude asset requests from app fallback`.
- Branch: `phase-2.2-webcontainer-reliability`.
- Parent: published candidate `ac58b6b552422aa78e3f94c9e2dc5ee94902a018`.
- Scope: three files, 114 insertions, one deletion. Application configuration changes by one line; other additions are routing tests/helper.
- Explicit staged-file review and credential-pattern scan passed. Reports, screenshots, build output, temporary harnesses, local tooling, credentials and unrelated untracked files were excluded.
- Tracked working tree/index clean after commit. This report and evidence remain local generated untracked artifacts. Previous commits and untracked files were preserved.

**STAGE_B3_ROUTING_LOCAL_FIX_READY**. Stop here and wait for separate owner approval for one additional feature-branch push. The previous push authorization is consumed. **No new push, PR, merge, remote build/deployment, main modification, Production release, DNS, or authentication/credential change occurred.** The existing deployed Preview is not repaired by this local commit; a later authorized automatic Preview must pass deployed routing revalidation before release progression.
