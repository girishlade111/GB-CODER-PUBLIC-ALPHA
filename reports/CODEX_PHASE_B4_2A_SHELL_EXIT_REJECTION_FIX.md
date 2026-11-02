# Phase B.4.2a — ownership-safe shell exit rejection fix

**PHASE_B4_2A_LOCAL_FIX_READY**

The confirmed exit-promise rejection defect was reproduced against the actual production service, corrected locally, and covered by 18 passing focused production-module regressions. TypeScript, focused ESLint, the relevant B.4/isolation/cancellation tests, build, bundle and existing local routing checks pass.

This is readiness for the next verification step, **not final browser acceptance or release approval**. Zero WebContainer browser startup observations were executed in this phase. The new artifact still requires separately approved browser verification. No commit, push, deployment, PR, merge, Production, credential, DNS or network-security operation was performed. Production remains on HOLD.

## Reproduced root cause

The pre-fix service used `void process.exit.then(onFulfilled)`. A rejection propagated into the derived promise without a rejection handler. The ownership check inside the fulfillment callback never ran on rejection.

The new test bundles `src/services/webcontainer/webcontainerService.ts` with esbuild and a controlled WebContainer API boundary. It executes the real manager, public project retirement/attachment, shell I/O, dependency ownership and diagnostic logic; it does not copy the exit handler. Deferred exit promises make rejection timing deterministic. A test-only Node `unhandledRejection` listener measures the leak and causes an explicit assertion failure instead of masking it.

Before changing source, the A→B retirement case passed its unchanged-next-owner assertions, then failed its no-unhandled-rejection assertion: **0 passed / 1 failed, one unhandled derived promise**. This reproduces the browser finding while distinguishing the Promise leak from cross-project state corruption.

Evidence: `reports/b4-2a-reproduction-before.log` and `reports/b4-2a-reproduction-before.json`. The exact pre-fix service is preserved at `scripts/.tmp-b4-2a-service-before.ts`; pre-fix identities are recorded in `reports/b4-2a-before-artifact.json`.

A separate deferred-spawn test exposed an intermediate post-await ownership capture: it failed with an old-shell state mutation (17 pass / 1 fail). Capturing the owner before the spawn await corrected this case. Evidence: `reports/b4-2a-delayed-owner-before.log` and `.json`. The final suite passes 18/18.

The earlier browser report and seven successful startup observations remain historical evidence for the previous artifact. Neither was overwritten or claimed as testing this new build.

## Small source correction and ownership rules

Only **`src/services/webcontainer/webcontainerService.ts`** changed among application files during B.4.2a. The phase-specific diff has 42 added lines and is preserved in `reports/CODEX_PHASE_B4_2A_SHELL_EXIT_REJECTION_FIX.patch`; the exact diff is appended below. It is against the pre-fix working copy, rather than HEAD, which already predates the broader uncommitted B.4 changes.

The change captures the shell's runtime owner before awaiting spawn and adds the second argument to `process.exit.then`.

**Retired/superseded owner:** the rejection handler verifies the captured shell's project, generation and runtime instance, the current operation/session ownership, and the actual current shell/process identity. A mismatch consumes the rejection and returns before any current state, watchdog, diagnostics, install proof or retry-eligibility mutation. No install/server command is dispatched.

**Persistent shell across a session restart:** a healthy `jsh` can legitimately span epochs. The handler validates the immutable shell runtime identity and the current automatic operation's full owner, including its epoch; without an automatic operation it captures the current session owner. It does not incorrectly discard a real current-shell failure merely because the persistent shell was originally spawned in an earlier epoch. A stale operation epoch is independently rejected by the ownership guard.

**Unexpected active-owner rejection:** the handler records a shell `unknown` outcome with allowlisted code `UNKNOWN`, finishes the attempt as unknown, clears unusable shell/writer and readiness flags, cancels that operation's watchdog, and presents a generic message that child-process status is unknown. It does not persist or echo the arbitrary rejection payload and invents no numeric npm or shell exit code.

If the prior diagnostic attempt is already finished, a new bounded diagnostic attempt is created for the current project/epoch/generation. Existing completed success or inferred-failure evidence is retained rather than rewritten. The existing diagnostic data contract and retention limits are unchanged.

An owned automatic operation remains busy, preventing a duplicate automatic install/restart. No retry is introduced. Genuine installed dependency proof from the same unchanged runtime is preserved; incomplete installation is never promoted to installed proof. A completion hint followed by rejection cannot make a late server-ready event establish proof.

**Numeric fulfilled exit:** the original fulfillment callback is byte-for-byte unchanged, verified by extracting its callback text with the TypeScript parser before and after the fix. The handler now has two callbacks instead of one. Actual numeric shell exit handling therefore remains intact; tests cover zero and nonzero exits both with and without an automatic startup operation.

No changes were made to startup commands, interactive-shell architecture, project switching, runtime retirement, file synchronization, caching, IndexedDB, project storage, backup/restore, editor design, Vercel routing or configuration. No telemetry was added.

## Production-module regression results

`node scripts/test-phase-b4-2a-shell-exit.mjs --evidence=reports/b4-2a-exit-tests.json`

**18/18 PASS; zero captured unhandled rejections.**

| Case | Result |
| --- | --- |
| A retires; B owns proof and an active operation; old A exit rejects | PASS — B's state, operation details, watchdog, proof, runtime, shell and diagnostics unchanged |
| B retires on return to A; delayed old B rejection | PASS — new A unchanged |
| Full detach/teardown followed by delayed rejection | PASS — detached state unchanged |
| Replacement shell within the same runtime | PASS — replacement proof/operation preserved; manual input forwarded |
| Runtime instance changes without changing generation | PASS — old instance rejected as owner |
| Runtime instance replaced while shell spawn is deferred | PASS — pre-await ownership prevents assigning the replacement's identity to the old process |
| Project identity mismatch alone | PASS — no new-project mutation |
| Unexpected active automatic-shell rejection | PASS — unknown diagnostic; no proof or duplicate startup; no automatic retry |
| Completion hint, then rejection, then late server event | PASS — no false installed proof or readiness |
| Same persistent shell reused after a session-epoch restart | PASS — rejection handled for the current epoch; valid dependency proof retained |
| Stale automatic-operation epoch | PASS — cannot authorize mutations |
| Manual shell rejects after a completed diagnostic attempt | PASS — prior success retained; new unknown record; source/secret sentinel excluded from diagnostics and UI state |
| Prior inferred npm failure, then the same shell rejects | PASS — original failure record unchanged; new shell unknown record; duplicate protection retained |
| Fulfilled numeric shell exit 0 | PASS — existing idle/reset behavior and actual shell exit code retained |
| Fulfilled numeric exit 0 during automatic startup | PASS — automatic result unknown; no fabricated npm exit |
| Fulfilled numeric shell exit 7 | PASS — existing error behavior and actual shell exit code retained |
| Fulfilled numeric exit 7 during automatic startup | PASS — automatic result unknown; no fabricated npm exit |
| Same-runtime manual disconnect/reconnect and input | PASS — existing shell reused without another spawn |

The rejected payload is deliberately not persisted. The diagnostic preserves the observed fact of a rejected shell exit observation and the unknown child status; existing terminal-output handling and prior diagnostic evidence remain intact. Tests supply synthetic source/secret sentinels in a rejection and verify they do not appear in persisted diagnostic records or displayed state.

## Targeted local verification

| Check | Result | Evidence |
| --- | --- | --- |
| New exit-rejection production tests | 18/18 PASS | `b4-2a-exit-tests.log`, `b4-2a-exit-tests.json` |
| Existing B.4 dependency/startup tests | 6/6 PASS | `b4-2a-startup-tests.log` |
| Existing B.4 output/dispatch/failure tests | 10/10 PASS | `b4-2a-output-tests.log` |
| Existing diagnostic retention/privacy/reload assertions | PASS | `b4-2a-diagnostics-tests.log` |
| Runtime isolation regressions | 5/5 PASS | `b4-2a-runtime-isolation-tests.log` |
| Existing stale-generation/cancellation negative cases | 8/8 PASS | `b4-2a-stale-cancellation-tests.log` |
| `npx tsc --noEmit -p tsconfig.app.json` | PASS, zero diagnostics | `b4-2a-typescript-app.log` |
| `npx tsc -b` | PASS, zero diagnostics | `b4-2a-typescript-build.log` |
| Focused ESLint on changed application module | PASS, zero warnings/errors | `b4-2a-eslint.log` |
| Unified production build | PASS, 109.989 seconds | `b4-2a-build.log` |
| Critical-path bundle contract | PASS, 594.7 KiB initial JS / 188.2 KiB gzip | `b4-2a-bundle.log` |
| Existing official-parser local routing validation | 42 HTTP assertions PASS | `b4-2a-routing.log` |
| Deployment configuration validation | PASS; existing 12 functions; live verification skipped | `b4-2a-deploy-config.log` |
| `git diff --check` | PASS | Local command exit 0 |

All log paths above are under `reports/`. Build warnings concerning existing browser metadata, marketing Tailwind configuration and large lazy chunks remain; no dependency update or build-policy change was made to suppress them. The existing official Vercel routing parser was used from its previously installed external tools directory. No Vercel deployment or browser startup was involved in routing/configuration validation.

## Source and build artifact identity

HEAD remains `546e74c084387d007b0312b9fbd69a9f6a6b55f1` on `phase-2.2-webcontainer-reliability`.

| Identity | SHA-256 |
| --- | --- |
| Pre-fix service source | `68a43f07d35717fe039aee61437983bf2c6ac67cbf45d8ff4b3b641d40b2cb7b` |
| Corrected service source | `c72d176de2e0c166714a284bfcf620556590384057253f00f3421e0d5ff5ef23` |
| New build manifest | `cdaacfc70ef93643ea70ef5732bedc97fdeae7d7b7390f362bf0d48afa2ae136` |
| Complete `src` tree, 265 files | `8a835512763c06d6a46a8309a19626f8e01478ed2fe2e64d1dea13c7312d6847` |
| Complete `dist` tree, 177 files | `f3d0cc10061536808fc2308cc7bee68e4c24e7492025674314529db7aafc1de9` |

`reports/b4-2a-final-source-artifact.json` records the new build metadata, all six B.4 source hashes, complete source/dist per-file hashes, per-JavaScript-file hashes, phase patch hash and new test hash. Tree digests hash sorted `relative-path + NUL + file-SHA256 + newline` records using `localeCompare('en')` ordering, retaining the `src/` or `dist/` prefix.

The other five B.4 source hashes match the previous final artifact exactly. The previous reports and canonical previous artifact record were preserved; the newly built `dist` is identified separately and is not represented as the old seven-startup-tested artifact.

## Remaining boundary and proposed minimal browser validation

No new WebContainer browser observation was authorized or executed. The previous seven-startup allowance remains exhausted. Production-module red/green evidence and a passing new build do not prove that browser `Process aborted` page errors have disappeared in this artifact.

Proposed **separate** browser authorization: three sequential startups in one disposable context, A→B→A, plus one same-runtime reconnect control. Use fixed synthetic React A / Vue B projects, this exact new artifact, one local environment, at most 240 seconds per startup and 12 minutes total startup observation time. Stop at the first required startup, ownership, source-integrity or uncaught cancellation-error failure; retain all evidence and do not retry.

For both retirement transitions, record the vendor exit-promise fulfillment/rejection and verify that the application consumes expected retirement rejection without an uncaught page error or mutation of the replacement owner's state/proof/operation. Require actual React/Vue DOM markers, fresh instances/generations and exact source isolation. A vendor retirement rejection itself may still occur; the corrected behavior is to handle it safely rather than fabricate a numeric exit or claim that rejection disappeared. If that browser run does not exercise a rejected exit promise, report the branch-coverage limit instead of repeating until it does.

The current active-owner unknown outcome is verified deterministically through the production module; no extra browser failure injection is included in that minimal proposal. The earlier intermittent runtime-asset connection-reset risk remains unresolved and was not investigated through a new startup campaign in this phase.

## Git status and stopping point

The working tree already contained broader uncommitted B.4 changes. During this phase, only the service file changed among application sources. The prior three modified component files and the two new B.4 application modules retain their pre-phase bytes. The new focused test, phase report, patch and evidence are untracked; the exact pre-fix source snapshot is a verification artifact. Existing unrelated untracked files remain intact.

Nothing is staged or committed. No remote publication or Production operation was performed. The local correction is ready for review and separately authorized exact-artifact browser revalidation; overall final B.4 acceptance and Production promotion remain pending.

## Exact phase-specific source diff

The following diff compares the preserved pre-fix working-copy service with the corrected service. The existing numeric fulfillment callback is unchanged.

```diff
diff --git a/scripts/.tmp-b4-2a-service-before.ts b/src/services/webcontainer/webcontainerService.ts
index bf53a23..51d09df 100644
--- a/scripts/.tmp-b4-2a-service-before.ts
+++ b/src/services/webcontainer/webcontainerService.ts
@@ -1911,6 +1911,7 @@ class WebContainerManager {
       // Clean up previous shell if any
       this.terminateShell();
 
+      const shellOwner = this.captureStartupOwner();
       const process = await container.spawn('jsh', {
         terminal: {
           cols: options.cols,
@@ -1999,6 +2000,47 @@ class WebContainerManager {
             activeServers: [],
           });
         }
+      }, () => {
+        // A persistent jsh can span session restarts. Validate its runtime
+        // owner and the current operation's epoch, not its original epoch.
+        const owner = this.automaticStartup?.owner ?? this.captureStartupOwner();
+        if (
+          !this.isRuntimeOwner(shellOwner) ||
+          !this.isStartupOwner(owner) ||
+          this.shellProcess !== process
+        ) return; // Retired/superseded rejection: never mutate the next owner.
+
+        // A finished attempt is immutable; retain it and record the new event
+        // separately. Never persist the arbitrary rejection payload.
+        if (owner.projectId && this.diagnostics.snapshot().find(
+          attempt => attempt.id === this.diagnosticAttempt,
+        )?.state !== 'running') {
+          this.diagnosticAttempt = this.diagnostics.begin(
+            owner.projectId, owner.epoch, owner.generation,
+          );
+        }
+        this.diagnostics.record(this.diagnosticAttempt, 'shell', 'unknown', { code: 'UNKNOWN' });
+        this.diagnostics.finish(this.diagnosticAttempt, 'unknown');
+        if (this.startupWatchdog) clearTimeout(this.startupWatchdog);
+        this.startupWatchdog = null;
+        this.shellProcess = null;
+        this.shellWriter = null;
+        this.isDevServerActive = false;
+        this.isDevServerStartingState = false;
+        this.isShellPromptReady = false;
+        this.updateState({
+          startupStage: 'error',
+          error: 'Shell exit status unknown',
+          runtimeError: {
+            phase: 'general',
+            message: 'The shell exit promise rejected; child-process status is unknown. Inspect the terminal, or return to Projects and reopen before retrying.',
+            timestamp: Date.now(),
+            recoverable: true,
+            retryAction: 'reboot_container',
+          },
+        });
+        // Retain an owned automatic operation: rejection proves no child exit
+        // code and must not unlock a duplicate install or automatic retry.
       });
 
       this.updateState({ status: 'running' });
```
