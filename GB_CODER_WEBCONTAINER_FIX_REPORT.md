# GB Coder — WebContainer Production Fix Report

**Date:** 2026-10-11
**Scope:** Restore the WebContainer terminal in the Vercel production deployment (`https://code.ladestack.in/`), without changing architecture or breaking existing functionality.
**Deployment performed:** None. All work is local + static. No commit, push, or deploy was executed by the implementer.
**Note on git history:** during this session two commits appeared on `main` authored outside this implementation (`fb1a0df`, `5829f64` — the latter contains this fix's code changes verbatim). They were inspected, not created, by this work. See §23.

---

## 1. Executive Summary

The production WebContainer terminal was missing because the deployed document is not cross-origin isolated: `vercel.json` had no `headers` block, so Vercel serves the SPA without `Cross-Origin-Opener-Policy` / `Cross-Origin-Embedder-Policy`, while the Vite dev/preview servers set both. With `window.crossOriginIsolated === false`, `webcontainerService.isSupported()` returns `false` and `TerminalTab` silently fell back to the Local Simulated Shell with the WebContainer option hidden.

Fixed with a minimal, reversible patch:

1. `vercel.json` — merged a `headers` block (`COOP: same-origin` + `COEP: require-corp` on `/(.*)`); all existing functions/rewrites preserved byte-for-byte.
2. `TerminalTab.tsx` — the WebContainer pill is now always rendered; when unsupported it is disabled with the specific reason as tooltip/`aria`, and it can never trigger a boot.
3. `VSCodeMode.tsx` — the hardcoded *"Cross-Origin Isolated (COOP/COEP verified)"* output line is now computed from `webcontainer.isSupported`.
4. `verify-deploy-config.mjs` — asserts the headers statically and offers an opt-in read-only `--live-url=` check of served response headers.
5. New `webcontainerSupport.ts` (pure, dependency-free reason helpers) + new `webcontainer-regression-tests.mjs` (17 tests, existing `node:test` idiom, no new framework).
6. `docs/DEPLOY.md` — short COOP/COEP section so the requirement is documented where deploys are described.

`WebContainer.boot()` was deliberately left unchanged (no `coep` option, no guard relaxation). Production `console` stripping was left unchanged. The hard-coded Laminar key was left untouched in code (urgent separate follow-up, §20).

**Validation:** `verify:deploy` ✓, `audit:tests` 71/71 ✓, new `audit:webcontainer` 17/17 ✓, `tsc` ✓, `eslint` 0 errors ✓, `npm run build` ✓, negative test of the new gate ✓. Browser/runtime validation (preview deploy, `crossOriginIsolated`, npm, live preview) is **NOT VERIFIED** — it requires a deployment, which was explicitly out of scope for this session.

---

## 2. Confirmed Root Cause

`vercel.json` contained no `headers` key, so the Vercel deployment serves the SPA document without `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` (both absent live on `/`, `/ide`, `/preview/*` per the audit). The Vite dev and preview servers set both (`vite.config.ts:452-455`, `473-476`), which is why the feature always worked locally.

Causal chain (all re-verified against the current tree before patching):

```
vercel.json has no headers
  → production HTML not cross-origin isolated
  → window.crossOriginIsolated === false
  → webcontainerService.isSupported() === false   (webcontainerService.ts:321-323)
  → TerminalTab initialises mode to 'local'       (TerminalTab.tsx:50-53)
  → "WebContainer" pill not rendered              (TerminalTab.tsx:529)
  → npm i / npm run dev buttons not rendered      (TerminalTab.tsx:558)
  → webcontainerService.boot() would throw pre-SDK (webcontainerService.ts:384-388)
  → StackBlitz iframe never contacted
```

The "basic terminal works" observation is the same `TerminalTab` component in its fallback branch (`EnhancedConsole.tsx:380`, `VSCodeMode.tsx:1721` mount the identical component). The block is application-level policy, not an SDK exception — the installed SDK's `boot()` does not throw when isolation is absent.

---

## 3. Audit Findings Used

From `GB_CODER_WEBCONTAINER_PRODUCTION_AUDIT.md` (1,154 lines, read in full before any change):

| Finding | Use |
|---|---|
| F-01 (CRITICAL): production omits COOP/COEP; `vercel.json` has no `headers` | Direct fix in `vercel.json` |
| F-02 (HIGH): terminal visibility coupled to capability (`TerminalTab.tsx:50-53, 529, 558`) | Visibility fix in `TerminalTab.tsx` |
| F-03 (HIGH): pre-SDK hard block in `boot()` | Verified, intentionally kept; covered by regression test |
| F-04 (MEDIUM): `WebContainer.boot()` with no options | Investigated; no change (see §10) |
| F-06 (MEDIUM): hardcoded false isolation claim (`VSCodeMode.tsx:1740`) | Made computed |
| F-07 (MEDIUM): production strips `console` (`vite.config.ts:436`) | Verified; left unchanged as documented follow-up (§19) |
| F-08 (MEDIUM): `verify-deploy-config.mjs` blind to COOP/COEP | Extended with header assertions + live check |
| F-10 (HIGH, security): hard-coded Laminar key | Re-verified present; NOT touched (§20) |
| F-11 (HIGH, process): zero test coverage of this subsystem | New `audit:webcontainer` suite (17 tests) |
| §26 test plan (T-01…T-10 runnable in Node) | Implemented as the new suite using the existing `node:test` + esbuild-harness idiom; no Vitest/Jest/Playwright |

Every cited file path and line number was re-verified against the current tree; all were still accurate. SDK version re-verified: `@webcontainer/api@1.6.4` installed (declared `^1.6.4`).

---

## 4. Existing Architecture Preserved

- Same `TerminalTab` component serves both Normal and Advanced modes; no second terminal, no second WebContainer implementation.
- Same `webcontainerService` singleton (module instance + `globalThis` dedup + boot-promise sharing); boot semantics, singleton recovery, server listeners, and cleanup paths untouched.
- Same lazy chunk boundary (`App.tsx` → `fullstackFeature` → `VSCodeMode`); no routing, state-management, or build-pipeline changes.
- Local Simulated Shell (`localShell.ts`) untouched; Normal Editor untouched; Advanced IDE layout untouched.
- No new dependencies (`package.json` diff is one npm script only).

---

## 5. Files Modified

| File | Status |
|---|---|
| `vercel.json` | Modified: added `headers` block only |
| `src/components/Console/TerminalTab.tsx` | Modified: import + reason derivation + always-render pill |
| `src/components/vscode/VSCodeMode.tsx` | Modified: 1 paragraph made computed |
| `src/services/webcontainer/webcontainerSupport.ts` | **New** (81 lines, zero imports) |
| `scripts/verify-deploy-config.mjs` | Modified: existence guard + headers section + opt-in live check |
| `scripts/webcontainer-regression-tests.mjs` | **New** (17 tests) |
| `scripts/audit-harness.mjs` | Modified: +2 export lines (service + support module) |
| `package.json` | Modified: +1 script (`audit:webcontainer`) |
| `docs/DEPLOY.md` | Modified: +1 section (WebContainer COOP/COEP) |
| `scratch/wc-probe.mjs` | Temporary verification probe, **deleted** after use |

---

## 6. Exact Changes Implemented

### 6.1 `vercel.json` — merged headers (nothing else touched)

```json
"headers": [
  {
    "source": "/(.*)",
    "headers": [
      { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
      { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
    ]
  }
]
```

`framework`, `buildCommand`, `outputDirectory`, all three `functions` entries, and all four `rewrites` (order included) are byte-identical to before. Global `/(.*)` scope was chosen because the SPA serves `index.html` for every route via the catch-all rewrite, so any narrower list (e.g. only `/ide`) would silently miss future document routes; headers on same-origin `/api/*` JSON responses are harmless (CORP constrains `no-cors` subresources, and app fetches are same-origin CORS-mode).

### 6.2 `webcontainerSupport.ts` — new pure helper module

- `getWebContainerUnavailableReason({ crossOriginIsolated, isSecureContext, sharedArrayBufferAvailable, status })` → `null` when available, else one of `cross-origin-isolation-missing` / `insecure-context` / `unsupported-browser` / `initialization-failed` / `unknown`. Precedence: failed boot > insecure context > missing isolation > missing SAB. No new state machine — it only explains the existing `WebContainerStatus`.
- `describeWebContainerUnavailableReason()` → one concise user-facing sentence per reason (all < 200 chars, secret-free).

### 6.3 `TerminalTab.tsx` — visible-but-disabled option

- The WebContainer pill is now **always rendered**. When `isSupported()` is false it carries `disabled` + `aria-disabled` + `opacity-50 cursor-not-allowed`, with the specific reason as its `title` tooltip. Native `disabled` means it cannot be activated, and the mode effect (`mode === 'webcontainer'` → guarded boot with local fallback) is unreachable from it — **rendering the option never triggers a boot**.
- Initial mode (`'webcontainer'` vs `'local'`), local line editor, xterm lifecycle, resize/fit, quick-action buttons, and all cleanup are unchanged.

### 6.4 `VSCodeMode.tsx` — honest output line

The OUTPUT tab line now renders `Cross-Origin Isolated (COOP/COEP verified).` only when `webcontainer.isSupported`, otherwise `Not isolated — WebContainer unavailable (COOP/COEP missing).`

### 6.5 `verify-deploy-config.mjs` — header gate + live check

- Fails if `vercel.json` is missing (previously an uncaught `ENOENT`).
- Fails with a WebContainer-specific message when no rule sets both exact header values; fails on present-but-wrong values; fails when no qualifying rule's `source` pattern covers `/ide` (Vercel `:param` syntax converted to regex; `(.*)` passes through).
- New opt-in `node scripts/verify-deploy-config.mjs --live-url=https://<host>/ide`: read-only fetch with `redirect: 'manual'` (a redirect cannot masquerade as verification), distinguishes missing / wrong / redirect / non-2xx / network-error outcomes. Skipped by default so the normal gate stays offline and deterministic.

### 6.6 Tests + harness + docs

- `audit-harness.mjs`: bundle also exports `webcontainerService` and `webcontainerSupport` (proven import-safe in Node by probe before wiring).
- `webcontainer-regression-tests.mjs`: 17 `node:test` assertions (see §12). `package.json`: `audit:webcontainer` script.
- `docs/DEPLOY.md`: new "WebContainer requires COOP/COEP headers on Vercel" section (symptoms, static gate, live verification command, `require-corp` third-party caveat).

---

## 7. Vercel Header Configuration

Target values served for the SPA document after deploy: `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`, on `/(.*)` (hence covering `/`, `/ide`, `/preview/*`, `/mpreview/*`). Static gate passes (`verify:deploy`: "1 rule(s) set COOP: same-origin + COEP: require-corp", "headers cover the Advanced IDE document route (/ide)"). **Served-header proof is pending a deployment** — static config ≠ served response; the `--live-url` command exists for exactly that step.

---

## 8. WebContainer Support Detection

`isSupported()` (`typeof window !== 'undefined' && Boolean(window.crossOriginIsolated)`) was verified accurate for `@webcontainer/api@1.6.4` and is **unchanged**. No faking of isolation, no `SharedArrayBuffer` monkey-patching, no forced `true`. Regression tests assert it mirrors `window.crossOriginIsolated` in both directions using the real bundled service.

---

## 9. Terminal Visibility Changes

Before: option hidden when unsupported (misleading — indistinguishable from a missing feature).
After: option always visible; disabled with reason tooltip + `aria-disabled` when unsupported; enabled normally when supported. Local terminal output, commands, layout, shortcuts, theme, resizing, and lifecycle cleanup are untouched. No repetitive notifications were added (single tooltip + existing in-terminal fallback line).

---

## 10. Runtime Initialization Changes

**None.** `boot()` — including the pre-SDK isolation guard and the bare `WebContainer.boot()` call — is byte-identical. Rationale, verified against `node_modules/@webcontainer/api/dist/index.js`: the SDK only warns about `coep` when the caller explicitly passes `coep: 'none'` under isolation; with default options there is no documented requirement to pass `{ coep: 'require-corp' }`, so changing the call signature would be speculative. If post-deploy browser testing shows a second failure here, it becomes an evidence-backed follow-up, not part of this patch.

---

## 11. Deployment Verification Improvements

`npm run verify:deploy` now gates the exact misconfiguration that caused this outage (previously blind to it). Proven both directions: passes on the fixed config (exit 0); fails on a header-less config with the two explicit header FAILs (exit 1, tested from a temp dir). Live-response verification is available but explicit: `--live-url=`.

---

## 12. Automated Tests Added

`npm run audit:webcontainer` — 17 tests, 5 suites, all passing:

| Suite | Tests | Maps to prompt TEST |
|---|---|---|
| vercel.json isolation headers | 5 (strict JSON, COOP, COEP, `/ide` coverage, config preserved) | TEST 10, TEST 11 |
| unavailability reasoning | 6 (null when available, isolation/insecure-context/SAB/error reasons, message quality) | TEST 2, TEST 4 |
| service support guard (real bundled service) | 4 (mirrors flag, pre-SDK refusal + state, concurrent refusals, post-refusal usability) | TEST 5, TEST 6, TEST 7 |
| local shell without isolation | 1 (`help` answers with isolation disabled) | TEST 3, TEST 12 |
| filesToFileSystemTree | 1 (synthesises `package.json` + `.npmrc` with dev script) | npm-execution prerequisites |

Not covered by automation (require a real browser + StackBlitz runtime; asserting them with mocks would be dishonest): React rendering of the pill/disabled state, mode switching, xterm mounting, real `boot()`, `npm install` / `npm run dev`, `server-ready` → preview URL, duplicate-boot prevention under real boot, live served headers. All are listed as pending manual validation (§17) instead of fake passes.

---

## 13. Test Execution Results

| Command | Exit | Result |
|---|---|---|
| `npm run verify:deploy` | 0 | valid — incl. 2 new header PASSes |
| `npm run audit:tests` (existing) | 0 | 71/71 pass, 14 suites (unchanged count) |
| `npm run audit:webcontainer` (new) | 0 | 17/17 pass, 5 suites |
| `npx tsc --noEmit -p tsconfig.app.json` | 0 | clean |
| `npx eslint` (all touched files) | 0 | 0 errors; 1 pre-existing warning (`VSCodeMode.tsx:692` `react-hooks/exhaustive-deps`, unrelated to this patch) |
| header-less fixture via temp dir | 1 (expected) | both header FAILs fire; proves the gate catches the old config |
| `npm run build` | 0 | success in ~1m; PWA precache 68 entries |

No test failure pre-dated the patch; no failure is related to unrelated code. `git status` at start of work was clean (only `main...origin/main`), so there is no "pre-existing failure" baseline complication.

---

## 14. Production Build Results

`npm run build` (i.e. `vite build`) succeeds. Bundle sanity: the new reason string is present in `dist/assets/TerminalTab-*.js` and the corrected output line in `dist/assets/fullstackFeature-*.js` (verified via content search; new module inlined by Rollup as designed — no separate chunk expected for app code). Chunk-size warnings are the pre-existing large lazy chunks (`TemplateSelectorModal`, `typescript-compiler`), unrelated.

---

## 15. Preview Deployment Validation

**NOT PERFORMED — no deployment was executed in this session (per directive).** Required preview steps for the operator:

1. Deploy a preview from this tree.
2. `node scripts/verify-deploy-config.mjs --live-url=https://<preview>/ide` → expect both live PASSes.
3. Hard-reload the preview (unregister SW / clear storage first — F-09 staleness), open `/ide`, confirm the WebContainer pill is **enabled**.
4. Console: `window.isSecureContext === true`, `window.crossOriginIsolated === true`.
5. Boot runtime, `npm install`, `npm run dev`, confirm `server-ready` → preview iframe renders; watch console for COEP violations (fonts/CDN/analytics).

---

## 16. Browser Isolation Verification

**NOT VERIFIED** (needs the preview deployment from §15). Static expectation after deploy: `isSecureContext === true` (HTTPS), `crossOriginIsolated === true`, `typeof SharedArrayBuffer !== 'undefined'` (constructor presence alone proves nothing — interpret alongside `crossOriginIsolated`, per audit §24).

---

## 17. npm Execution Verification

**NOT VERIFIED** (needs browser runtime). What was verified statically: `filesToFileSystemTree` synthesises `package.json` (with `dev` script) + `.npmrc legacy-peer-deps` (regression-tested); `TerminalTab` auto-start writes `npm install && npm run dev` to the PTY only in `webcontainer` mode; execution is browser-side (WebContainer), never Vercel serverless — no server-side change was made or needed.

---

## 18. Live Preview Verification

**NOT VERIFIED** (needs browser runtime). Unchanged chain ready for validation: `server-ready` listener (`webcontainerService.ts:330-343`) → `serverUrl`/`serverPort` state → `VSCodeMode` iframe (`:1956-1964`) with the runtime-supplied URL (no hard-coded localhost in the flow — `localhost:5173` strings are display fallbacks only). `StackBlitzStartupLoader` remains the loading fallback.

---

## 19. Compatibility and Regression Findings

- **COEP third-party impact (largest residual risk, unverified):** Google Fonts (`fonts.googleapis.com`/`fonts.gstatic.com` — gstatic normally sends `Access-Control-Allow-Origin: *`, likely fine), `@vercel/analytics`, `@lmnr-ai/lmnr` (external script), user-preview CDNs (`unpkg`, `jsdelivr`), and the StackBlitz headless iframe must all satisfy CORP/CORS under `require-corp`. Must be checked via console COEP-violation watch on the preview deploy. Fix per-resource if anything breaks — do not weaken the document headers globally.
- **No regressions observed:** existing 71 tests pass unchanged; typecheck, lint, and build clean; Normal Mode, local shell, layout, and all non-terminal features untouched by the diff.
- **Pre-existing, unrelated, left alone:** function count at Hobby limit (12/12), `maxDuration: 120` exceeding the Hobby 60s ceiling, `host: true` dev binding (loopback-gated API), preview-iframe `sandbox="allow-scripts allow-same-origin"` (S-02), absent CSP (S-07), no `WebContainer.teardown()` call, stale `build_output.txt` (do not cite).
- **Production `console` stripping** (`vite.config.ts:436`): verified still active; intentionally unchanged — relaxing it is a separate follow-up (diagnosability vs performance/security trade-off), not needed for this root-cause fix.

---

## 20. Security Observations

- **F-10 CONFIRMED STILL PRESENT (urgent, separate):** a hard-coded Laminar API key remains as a fallback in `src/services/laminarService.ts:19-23` (inlined into the public client bundle) and in `scripts/test-laminar-trace.mjs:6`. The value is **not reproduced anywhere in this report, logs, or the patch**. Recommendation: treat both instances as compromised — revoke/rotate the key, remove the literals, and move to a server-side integration. No credential was rotated or moved here (no authorization, and it is out of scope for the WebContainer patch).
- This patch introduces no new secret handling, weakens no policy, and its user-facing strings contain no sensitive data.
- Acceptance criterion AC-15 (no secrets exposed by the patch): satisfied — the diff adds headers, UI copy, pure helpers, and test/config assertions only.

---

## 21. Known Limitations

1. Static config proof ≠ served-header proof (§15 live step still required).
2. F-04/F-05 unknowns (boot `coep` option sufficiency, anonymous StackBlitz tier limits/ToS) can only be settled by running the runtime in a deployed browser.
3. DOM-level assertions (pill visible/disabled, mode switching, xterm mount) need a DOM runner the repo deliberately avoids; they are manual checks, not automated ones.
4. The `--live-url` check reads final headers only; it cannot diagnose Vercel dashboard-level overrides beyond what is served.

---

## 22. Pending Manual Validation

- [ ] Preview deploy from this tree.
- [ ] `--live-url` header check against the preview (AC-01).
- [ ] `crossOriginIsolated` / `isSecureContext` console checks (AC-02).
- [ ] WebContainer pill enabled in `/ide`; disabled-with-reason check in a non-isolated context, e.g. an old build (AC-03–AC-05).
- [ ] Runtime boot, `npm install`, `npm run dev`, live preview + HMR (AC-06–AC-09).
- [ ] Normal Mode + local shell spot-check (AC-10–AC-11).
- [ ] COEP-violation console watch for fonts/analytics/CDN/StackBlitz iframe (AC-17).
- [ ] Production deploy approval + same checks against production.

---

## 23. Rollback Instructions

Current state: fix code is inside commit `5829f64` (plus uncommitted `docs/DEPLOY.md` change and the already-removed probe). To roll back:

1. **Headers (restores pre-fix production behavior exactly):** delete the `headers` block from `vercel.json`, redeploy. Terminal returns to local-fallback-V1 (option hidden when unsupported).
2. **Terminal UI:** `git checkout ecc39b2 -- src/components/Console/TerminalTab.tsx src/components/vscode/VSCodeMode.tsx src/services/webcontainer/` (removes `webcontainerSupport.ts` only if deleted explicitly — checkout does not delete new files; `rm src/services/webcontainer/webcontainerSupport.ts` separately), or simply `git revert 5829f64` for a single-commit revert of all 8 code files.
3. **Verification/tests:** `git checkout ecc39b2 -- scripts/verify-deploy-config.mjs scripts/audit-harness.mjs package.json` + `rm scripts/webcontainer-regression-tests.mjs`.
4. **Docs:** `git checkout -- docs/DEPLOY.md`.
5. **Detecting COEP breakage that warrants rollback:** after deploy, COEP-violation errors in the console naming a specific subresource (font/CDN/analytics) + that resource failing to load, while `crossOriginIsolated === true`. Prefer per-resource fixes (CORS/CORP, `crossorigin` attributes) over rollback; roll back only if a critical resource cannot satisfy `require-corp`.
6. **Distinguishing runtime vs UI failure:** pill disabled with tooltip = environment/capability (runtime side); pill enabled but boot errors in terminal = runtime failure; pill missing entirely = UI regression (this patch's concern — should no longer occur by construction).
7. No rollback step touches secrets, functions, rewrites, or unrelated features. No authorization needed to *prepare* this plan; do not execute without approval.

---

## 24. Final Acceptance Criteria Matrix

| ID | Criterion | Status |
|---|---|---|
| AC-01 | Isolation headers served by deployed IDE document | **NOT VERIFIED** (needs preview deploy + `--live-url`) |
| AC-02 | Browser reports expected isolation state | **NOT VERIFIED** (needs browser) |
| AC-03 | WebContainer option visible in Advanced IDE | Statically implemented; runtime **NOT VERIFIED** |
| AC-04 | Option enabled when supported | Logic implemented + unit-backed; runtime **NOT VERIFIED** |
| AC-05 | Meaningful unavailable reason when unsupported | Implemented + unit-tested (6 tests) |
| AC-06 | WebContainer initializes | **NOT VERIFIED** (needs browser runtime) |
| AC-07 | Terminal accepts npm commands | **NOT VERIFIED** |
| AC-08 | `npm run dev` starts dev server | **NOT VERIFIED** |
| AC-09 | Live preview loads | **NOT VERIFIED** |
| AC-10 | Normal Mode works | Code untouched; spot-check pending |
| AC-11 | Local Simulated Shell works | Untouched + functionally tested without isolation |
| AC-12 | Existing functionality intact | 71/71 existing tests + tsc + lint + build green |
| AC-13 | Relevant automated tests pass | 71 + 17 green; `verify:deploy` green |
| AC-14 | Production build succeeds | Green (`vite build`, exit 0) |
| AC-15 | No secrets exposed | Satisfied (none added; existing exposure flagged, not widened) |
| AC-16 | No unnecessary architectural changes | Satisfied (minimal diff, no deps, no rewrites) |
| AC-17 | No unresolved COEP regressions | **NOT VERIFIED** (needs preview console watch) |
| AC-18 | Changes documented and reversible | Satisfied (this report + §23) |

Nothing is marked PASSED on the basis of a local build alone where the criterion requires a deployed runtime.

---

## 25. Deployment Readiness Assessment

**Local changes:** complete. **Static verification:** passed. **Preview deployment:** pending operator action. **Production deployment:** pending preview validation + explicit approval.

**Recommended sequence:** preview deploy → §15 checks → §22 checklist → production approval. Keep the preview URL for the `--live-url` evidence trail. Treat the Laminar key rotation as a parallel urgent track, owned separately from this deploy.
