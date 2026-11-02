# GB Coder — Stage B.3 routing deployed revalidation

Date: 2026-10-14, America/Los_Angeles. Final verdict: **STAGE_B3_PREVIEW_BLOCKED**.

The routing fix is published and verified on the new READY Preview. The former missing-executable-to-SPA fallback is fixed: missing JavaScript/CSS/worker URLs return genuine 404 responses. The deployed HTTP matrix and Static Editor smoke passed. **Required Advanced IDE startup did not reach Vite readiness within 240 seconds**, with 61 captured connection resets to `nr.staticblitz.com`. Execution stopped at that failure; no retry, additional push, deployment, or repair followed.

## Explicit authorization and single push

The owner explicitly approved exactly this one non-force command for the routing-fix commit:

```powershell
git push origin 546e74c084387d007b0312b9fbd69a9f6a6b55f1:refs/heads/phase-2.2-webcontainer-reliability
```

Immediately before execution, read-only `git ls-remote` confirmed remote feature HEAD remained `ac58b6b552422aa78e3f94c9e2dc5ee94902a018` and remote `main` remained `1b954486e292436794b0764638ea454bb78fae11`. Local HEAD matched the approved full SHA, its parent was the remote candidate, and the tracked working tree/index were clean. This was a normal fast-forward.

The exact command executed **once**, exited **0**, and reported `ac58b6b..546e74c` on the intended feature branch. A post-push remote query independently confirmed:

| Ref | Full SHA |
| --- | --- |
| `phase-2.2-webcontainer-reliability` | `546e74c084387d007b0312b9fbd69a9f6a6b55f1` |
| `main` | `1b954486e292436794b0764638ea454bb78fae11` |

A later read-only remote check during acceptance reconfirmed both values. Final local HEAD is the approved commit and the tracked working tree/index remain clean. Reports and generated test harnesses are untracked local evidence. No new commit was created during deployed revalidation.

## New automatic Preview identity and build

| Field | Independently verified value |
| --- | --- |
| Deployment ID | `dpl_6FDZFqyKFYgzsW4sZ9FtKXNaShbK` |
| Preview URL | https://gb-coder-public-alpha-g1c7qkmuj.vercel.app |
| Project | `gb-coder-public-alpha` / `prj_Cbyer1VtBwQwrqRVCFhNOUERJFiD` |
| Commit | `546e74c084387d007b0312b9fbd69a9f6a6b55f1` |
| Branch | `phase-2.2-webcontainer-reliability` |
| Source | `git`, automatically triggered by the authorized push |
| Deployment state | `READY` and `readyState: READY` |
| Environment | CLI explicitly reports **preview**; API target `null`, not production |
| Creation / ready timestamps | `1792038239107` / `1792038333252` |
| Build duration | CLI reports **1m 33s** |

The SHA-filtered deployment listing and deployment metadata matched the exact approved full commit. CLI inspection independently confirmed deployment ID, URL, Preview target, Ready status, and build outputs. Existing authenticated read-only CLI `inspect --logs` exited 0 and showed `Build Completed in /vercel/output`, `Deployment completed`, and final Ready status. It did not trigger a build.

Evidence: `reports/routing-deployed-inspect.log`, `reports/routing-deployed-build.log`. This is the new deployment, not the older `dpl_FYnW629mEkc4KRPXEY6vdg5dpTUR` Preview.

## Existing credential and data boundaries

Only the existing previously authorized project automation credential was reused. Its value was captured in process memory via an authenticated GET, supplied through the bypass HTTP header only to this exact new Preview origin, and never printed or written to source, reports, persistent environment files, screenshots, or Git. Disposable context cookies were ephemeral. No credential creation, rotation, revocation, modification, selected-secret change, or project protection change occurred.

The read-only credential/evidence check found one existing credential, zero credentials created/modified/revoked, and zero occurrences in the task's JSON/log/Markdown evidence. See `routing-deployed-credential-check.json`. The runtime diagnostics writer also redacts the in-memory credential before serialization.

Tests used disposable Playwright contexts and synthetic projects only. No existing user profile, stored project, or Production data was accessed or changed. Ordinary external WebContainer runtime/package requests were made as part of the authorized synthetic startup. The bypass credential was not forwarded to those external origins. All automated browser contexts were closed by their harness cleanup.

## Priority deployed HTTP routing results

Final command: `node scripts/.tmp-routing-deployed-http.mjs`, `STAGE_B3_SUITE=http`. **Exit 0; 37 deployed HTTP assertions passed.** Evidence: `reports/routing-deployed-http.json`.

| Area | Verified result |
| --- | --- |
| `/app`, `/app/`, `/app/projects`, synthetic project editor/IDE paths | 200, exact same application document |
| `/ide`, `/preview-popout`, `/preview/routing-synthetic`, `/mpreview/routing-synthetic` | 200, application document preserved |
| Required app/IDE/popout isolation headers | COOP `same-origin`, COEP `require-corp` |
| Missing JS, CSS, Monaco worker, workbox file, nested JS, source map, MJS, WASM, extensionless asset, queried SW-related file, manifest | **404**, never the application document; no 200 SPA fallback |
| Actual remote Vite entry/preloads/CSS/favicon | 200, appropriate JavaScript/CSS/image MIME |
| Actual remote Monaco engine and HTML/CSS/TypeScript/editor worker files | 200 JavaScript, not an HTML document |
| `/app/sw.js` | 200 JavaScript |
| `/app/manifest.webmanifest` | 200 manifest MIME |
| `/api/health` | 200 JSON, parsed successfully |
| Missing `/api/stage-b3-missing` | 404, not SPA document |
| Marketing `/` and `/about/` | 200 marketing HTML, not application shell |

The missing-asset responses are Vercel's **1,686-byte HTML 404 page**, not the application's 4,974-byte shell. This is a genuine non-success response with correctly identified error-document MIME; it is not falsely described as a plain-text deployed 404. The local test model's plain-text error body was never used as deployed proof.

The HTTP probe uses direct authenticated requests without a browser Service Worker, so these results establish deployed routing independently of Service Worker cache behavior. Actual remote asset filenames were derived from this deployment's build logs, not assumed from a local build hash.

Three preliminary test-development assertions were preserved separately: a valid favicon was initially expected to have JavaScript MIME; a local-only Monaco hash was initially used instead of the remote build hash; and a valid JavaScript bundle containing an embedded `id="root"` example was initially misclassified as an HTML document. The harness was corrected to check actual image MIME, deployment-specific filenames, and a document-start HTML classifier. No application or deployment mutation was needed. These preliminary attempts are not counted as application failures or passing final runs:

- `routing-deployed-http-harness-first-attempt.json`
- `routing-deployed-http-local-hash-attempt.json`
- `routing-deployed-http-body-classifier-attempt.json`

## Focused Static Editor smoke — passed

Command: `node scripts/.tmp-routing-deployed-static.mjs --evidence=revalidation --block-monaco-cdn`, `STAGE_B3_SUITE=static`. **Exit 0; 12/12 checks.**

The test created a synthetic Static project through the UI, mounted three real Monaco editors, entered exact HTML/CSS/JavaScript sources, verified actual rendered HTML/computed CSS/executed JavaScript, checked exact IndexedDB contents, reloaded and reopened, switched into a synthetic Advanced IDE and back, and verified source preservation. HTML/CSS/TypeScript/editor workers all executed, and no Monaco CDN bootstrap response occurred.

Static page errors: **0**. One failed request was an aborted StackBlitz headless navigation during the deliberately superseded Advanced IDE transition; it did not prevent the asserted Static workflow. Registration scope was `https://gb-coder-public-alpha-g1c7qkmuj.vercel.app/app/`. The final snapshot did not include a controller script URL; full offline cache/controller activation remains unverified, preserving the prior limitation. Registration, correct scope, and served SW/manifest assets are verified.

Evidence: `routing-deployed-static-revalidation.json`, `routing-deployed-static-revalidation-working.png`, `routing-deployed-static-diagnostics.json`.

## Required Advanced IDE smoke — failed, stopped

Command: `node scripts/.tmp-routing-deployed-runtime.mjs`, `STAGE_B3_SUITE=runtime`. **Exit 1; 0/1 focused scenarios passed.**

A disposable synthetic React project was opened in the actual deployed Advanced IDE. The harness waited for terminal text matching `ready in \\d+\\s?ms` for **240,000ms**. It timed out:

`terminal timeout waiting for Project A Vite ready (/ready in \\d+\\s?ms/i)`

No real React preview DOM success or startup-duration pass is claimed. The focused harness's inherited scenario label mentions lifecycle scenarios, but this generated revalidation harness attempted only initial React startup, not the prior entire reliability audit.

Captured runtime diagnostics:

- **61 `net::ERR_CONNECTION_RESET` requests** to `https://nr.staticblitz.com/`, including `vite`, `react`, `react-dom`, `rollup`, `postcss`, `esbuild`, and Babel dependencies.
- One aborted StaticBlitz telemetry request, for 62 failed requests total.
- **Zero page errors**, no captured console errors; two console warnings (unused fetch-worker preload and Contextify source-context warning).

The reset failures are concrete evidence of dependency-network trouble accompanying the startup timeout. They do **not** prove an application-code regression, a Vercel routing regression, or the precise reason for the external resets. The captured evidence does not include a final terminal transcript, so no unobserved npm exit code/message is invented. No synthetic preview marker was verified because the harness stopped at the readiness gate. The browser/context were closed in cleanup.

Evidence: `routing-deployed-runtime.json`, `routing-deployed-runtime-diagnostics.json`. Per the owner's explicit stop condition, **no further test or retry was run after this required verification failed**. No fix, additional push, or deployment was attempted.

## Preserved prior evidence and outstanding observations

The prior full acceptance report `CODEX_PHASE_2_2_STAGE_B3_PREVIEW_ACCEPTANCE.md` and local routing report `CODEX_STAGE_B3_ROUTING_REPAIR.md` remain unchanged. Their earlier React/Vue HMR/isolation, filesystem/binary/collision, IndexedDB and backup/restore evidence is preserved. This task did not rerun those full suites or treat them as a substitute for the failed new-deployment startup smoke.

Prior slow initialization/switching, some HTTP 400 / `Process aborted` diagnostics, the optional folder-child visibility timeout, and unverified final Service Worker controller activation remain recorded observations. No speculative redesign or optimization occurred. Remote build timing is not a new WebContainer performance measurement; startup did not complete in this run.

## Final release boundary

**STAGE_B3_PREVIEW_BLOCKED.** The targeted routing defect is fixed and deployed, and HTTP/Static validation passed. Required Advanced IDE readiness failed amid external dependency connection resets, so Preview acceptance cannot be granted.

The exact one-time push authorization has been consumed. There was no force push, second push, manual deployment, new PR, merge, main modification, Production deployment, DNS change, credential mutation, or user-data modification. No further release progression is authorized. Production release remains unauthorized.
