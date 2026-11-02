# GB Coder — Stage B.3 runtime/network diagnostics

Date: 2026-10-14, America/Los_Angeles. Verdict: **STAGE_B3_RUNTIME_REVALIDATED**.

Two controlled fresh-context startup attempts passed on the same existing deployment, with no dependency connection resets. Both independently reached the expected React preview DOM after observed boot, mount, dependency completion, Vite output and a public server-ready event. The prior timeout is **consistent with transient dependency-network instability**, but its exact transport cause/location and original npm exit state cannot be reconstructed. Two successes do not establish permanent reliability or, by themselves, complete Stage B.3 acceptance.

## Identity and authorization

| Field | Value |
| --- | --- |
| Repository | `girishlade111/GB-CODER-PUBLIC-ALPHA` |
| Commit | `546e74c084387d007b0312b9fbd69a9f6a6b55f1` |
| Deployment | `dpl_6FDZFqyKFYgzsW4sZ9FtKXNaShbK` |
| Preview | https://gb-coder-public-alpha-g1c7qkmuj.vercel.app |
| Read-only deployment observation | `READY` / `readyState: READY`, exact approved SHA and feature branch, source `git`, non-production target |

The new request authorized one controlled startup and at most one fresh-context confirmation if the first succeeded. Exactly **two attempts** were performed, both successful. No third attempt, other-network attempt, broad acceptance rerun, application source change, Git mutation, push, deployment, credential mutation, Production operation, Vercel settings change, DNS/proxy/firewall/security change, or real-user-data operation occurred.

Only the existing authorized credential was held in memory and used by the existing authentication adapter for this exact Preview origin. It was never sent to external dependency hosts, printed, or placed in reports/source/environment files. No credential was created, rotated, revoked or modified. All browser contexts and browser processes were closed in harness cleanup. Final HEAD remains the expected commit; tracked working tree/index remain clean. Generated diagnostic harnesses and evidence are local untracked artifacts.

## Review of the prior failed attempt

The prior report and raw `routing-deployed-runtime.json` / `routing-deployed-runtime-diagnostics.json` were read before new testing. They show:

- A 240-second wait for terminal Vite readiness timed out on the same deployment.
- 61 dependency requests to `nr.staticblitz.com` failed with `net::ERR_CONNECTION_RESET`, including React, Vite, Rollup, PostCSS, esbuild and Babel metadata/dependencies. Exact URLs remain in the original diagnostic JSON.
- No page errors or captured console errors; two warnings, plus an aborted telemetry request.
- No per-failure timestamp, HTTP status, detailed DNS/TLS trace, final terminal transcript, npm exit status, or independent server/DOM observation was captured by that older harness.

A connection reset is not an HTTP response code. The old evidence therefore cannot establish an npm numeric failure code, prove Vite never started, locate the reset at the client/proxy/CDN/origin, or distinguish every possible original readiness-detection failure. The report's prior conclusion was an acceptance blocker, not a proven routing/application regression. None of this historical evidence was overwritten.

## Controlled diagnostic method

A temporary local diagnostic harness used disposable Chromium contexts and the same React package/template versions as the prior startup smoke. Each context contained only a synthetic project, with a different expected marker (`RUNTIME_NETWORK_REACT_1` / `RUNTIME_NETWORK_REACT_2`). No preinstalled dependency tree was injected and no application startup command was replaced.

Observational hooks were installed in the disposable page before application execution:

- The existing global boot-promise assignment/resolution and runtime-instance assignment were timestamped.
- Public filesystem mount calls and completion were observed.
- Public WebContainer process spawns and exposed exit promises were observed.
- The shell output stream was teed into a bounded diagnostic reader while preserving the application's stream; input writes were observed and forwarded unchanged.
- An additional public `server-ready` listener captured port/URL.
- Browser network responses/failures recorded URLs, methods, start/failure/response timestamps, available request timing and TLS metadata; no sensitive request headers/cookies were collected.
- Visible terminal snapshots were saved periodically; final terminal, full captured shell output, runtime process state, filesystem source/package, and preview result were captured **before closing** the context.

These are in-memory test observations, not application source or deployment changes. Instrumentation has some overhead, so timings are observations of these diagnostic runs, not uninstrumented performance guarantees. Boot timing starts at the application's global promise assignment, slightly after the actual boot API call begins. Mount and exposed shell spawn timings bracket the forwarded public calls.

Each run had a finite 240-second startup observation budget after the IDE mounted. DOM readiness was checked independently in the actual WebContainer preview frame; it did not depend on matching terminal text. Successful criteria remained boot, mount, dependency completion, server-ready, exact expected React DOM, and matching project source/package/path. No assertion was weakened to obtain a pass.

## Attempts and actual phase results

| Observed phase | Attempt 1 | Attempt 2 |
| --- | --- | --- |
| Boot promise resolved / instance available | PASS | PASS |
| Filesystem mount completed | PASS | PASS |
| npm command observed | `npm install --prefer-offline && npm run dev` | Same unchanged command |
| npm completion output | `added 61 packages in 30s` | `added 61 packages in 16s` |
| `npm run dev` / Vite output | `> dev`, `> vite`, Vite 5.4.21 ready | Same, Vite 5.4.21 ready |
| Public server-ready | Port 5173 observed | Port 5173 observed |
| Actual React preview DOM | `RUNTIME_NETWORK_REACT_1` | `RUNTIME_NETWORK_REACT_2` |
| Project scope | Exact expected package/source and project URL | Exact expected package/source and project URL |
| Readiness regex in captured output | Present | Present |
| Dependency response observations | 172 HTTP 200 responses | 174 HTTP 200 responses |
| Dependency connection resets / failed downloads | 0 observed | 0 observed |
| Console errors / page errors | 0 / 0 | 0 / 0 |
| Harness exit | 0 | 0 |

Each expected source was read back from the actual runtime filesystem and compared exactly. The preview URL matched a live public server-ready event, and the actual DOM contained that run's unique marker. No stale project content was observed. The provider reused a preview hostname across contexts; hostname uniqueness was not used as evidence of isolation. Matching runtime files and different expected rendered markers establish the tested scopes. This was not an additional multi-project switching audit; the prior switching evidence remains separate.

The shell process exposed to the application was `jsh`, still running before cleanup in both runs. npm/Vite run as its child commands, so their independent process handles/PIDs and numeric exit promises are not exposed through that shell handle. **npm success (exit-zero semantics) is inferred** from the unchanged `&&` chain progressing to the observed dev script, followed by actual React execution; no directly instrumented numeric npm exit callback is claimed. Vite was running and serving the marker, not exited. The WebContainer output API exposes a combined stream, so stdout/stderr are preserved together rather than falsely labeled as separately captured channels. No npm error text was observed.

Raw shell excerpts:

```text
# Attempt 1
npm install --prefer-offline && npm run dev
added 61 packages in 30s
> dev
> vite
VITE v5.4.21 ready in 4358 ms
Local: http://localhost:5173/

# Attempt 2
npm install --prefer-offline && npm run dev
added 61 packages in 16s
> dev
> vite
VITE v5.4.21 ready in 2857 ms
Local: http://localhost:5173/
```

Full ANSI-bearing output chunks, cleaned combined output, final visible terminal and process states are preserved in the attempt JSONs. The terminal's clearing behavior did not discard diagnostic output.

## Measured startup breakdown

| Measurement | Attempt 1 | Attempt 2 |
| --- | --- | --- |
| Boot promise assignment → resolution | 3.228s | 4.588s |
| Public mount invocation → completion | 0.007s | 0.021s |
| Exposed jsh spawn invocation → return | 0.004s | 0.025s |
| npm command write → first completion output | 30.543s | 16.660s |
| npm's own rounded reported duration | 30s | 16s |
| Vite's own reported startup | 4.358s | 2.857s |
| IDE navigation → public server-ready | 44.800s | 31.864s |
| IDE navigation → Vite readiness output observed | 44.857s | 31.882s |
| IDE navigation → actual expected DOM observed | **48.312s** | **34.305s** |
| Total at final snapshot | 48.358s | 34.381s |

These intervals use different boundaries and are not additive. DOM observation includes polling delay. npm timing includes the observable command-to-completion path; it is not a hidden child-process timer. No performance regression percentage is calculated. The runs remain materially slower than an immediate editor page load, and performance optimization is outside this diagnostic request.

## Network comparison and errors

Non-destructive host-side checks used the same Windows execution host and no credential headers:

| Check | Result |
| --- | --- |
| DNS `nr.staticblitz.com` | Resolved three IPv4 addresses, 78ms |
| TLS `nr.staticblitz.com:443` | Valid certificate, TLS 1.3, 173ms |
| GET `https://nr.staticblitz.com/react` | HTTP 200, 1.606s |
| GET `https://nr.staticblitz.com/vite` | HTTP 200, 3.305s |
| DNS/TLS `registry.npmjs.org` | Resolved; valid TLS 1.2 handshake |
| GET `https://registry.npmjs.org/vite` | HTTP 200, 3.988s |

Browser-side package traffic also returned HTTP 200, with no `nr.staticblitz.com` transport failure in either controlled run. Response counts include repeated requests, not unique packages. Available per-request DNS/connect/TLS fields are preserved in JSON; unavailable/reused-connection timing fields are not invented.

Each browser run recorded two `net::ERR_ABORTED` requests: one telemetry request at `t.staticblitz.com/w/v17/r/l` and one initial WebContainer preview navigation. Successful marker rendering followed. These are retained, not counted as successful requests, and are distinct from the earlier dependency connection resets. Exact URLs/timestamps are in the attempt evidence. No HTTP 400, dependency HTTP error response, or browser page error was observed in the controlled runs. Console warnings are preserved in the diagnostic files.

No second authorized physical network/execution environment was available, so none was compared. Host Node HTTP and browser/WebContainer traffic are different client stacks on the **same** environment. Their current successes rule out a consistently failing dependency hostname during these observations; they do not explain or override the earlier 61 resets. No VPN/proxy/DNS/firewall/security settings were changed, and no network control was bypassed.

## Root-cause classification

- **Current reproducibility:** the previous startup failure was not reproduced in either of the two permitted runs.
- **Most consistent hypothesis:** transient transport instability on the dependency-fetch path, supported by the earlier reset cluster, current successful DNS/TLS/HTTP checks, and two complete browser startups without dependency resets.
- **Not established:** the component that reset the connections; whether the original npm command exited or was stalled; permanent dependency-host reliability; or an environment-specific cause versus a temporary remote/CDN condition.
- **Application runtime initialization defect:** not demonstrated; both boot/mount/startup paths completed now.
- **Persistent package-install failure:** not demonstrated; both unchanged installs completed and the dev script executed.
- **Readiness-regex defect:** not reproduced; both runs contained the expected readiness output and independently rendered the correct DOM. The old missing terminal capture prevents an absolute retrospective exclusion.
- **Separately identified application defect:** none established by this limited revalidation.

## Evidence, preservation, and next action

New evidence:

- `reports/runtime-network-host-connectivity.json`
- `reports/runtime-network-attempt-1.json`
- `reports/runtime-network-attempt-2.json`
- `reports/runtime-network-summary.json`
- `reports/routing-deployed-runtime-network-1-diagnostics.json`
- `reports/routing-deployed-runtime-network-2-diagnostics.json`

Prior deployed HTTP 37/37, Static Editor 12/12, Monaco/worker/header/API/marketing evidence and all previous reports remain unchanged. Those suites were not repeated. Prior performance observations and the optional Service Worker controller/folder-child limitations are not silently reclassified.

**STAGE_B3_RUNTIME_REVALIDATED.** The permitted diagnostic startup and confirmation both passed; stop testing at this report. The required next action is owner review of this evidence together with the existing Stage B.3 acceptance results and limitations. This report does not itself declare full Stage B.3 acceptance or authorize a new publication or Production release. Any broader reliability work, network remediation, optimization, or release decision remains separate.
