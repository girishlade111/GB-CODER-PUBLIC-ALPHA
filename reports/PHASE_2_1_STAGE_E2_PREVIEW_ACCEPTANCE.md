# Phase 2.1 Stage E2 — Preview Acceptance Report

**Verdict: `STAGE_E2_PREVIEW_BLOCKED`**

Live Preview browser verification is blocked by Vercel Deployment Protection
(SSO login wall) on the Preview deployment. No authorized session or bypass
exists in this environment, and protection was not (and must not be) altered
to work around it. Everything verifiable without login is recorded below;
nothing is claimed PASS that was not observed.

**This report is local-only and was not pushed.**

---

## 1. PR number and URL

- PR #31: `https://github.com/girishlade111/GB-CODER-PUBLIC-ALPHA/pull/31`
- Title: `Phase 2.1: Workspace Reliability & Data Safety (2.1A–2.1D)`
- State: OPEN, MERGEABLE, auto-merge OFF (verified, never enabled).
- Checks: `Vercel` pass (Deployment has completed),
  `Vercel Preview Comments` pass, `review` (CodeRabbit AI Code Review) fail
  at "Set up job" — external-service setup failure, advisory only
  (`main` has no branch protection; unrelated to Phase 2.1 content; fixing
  CodeRabbit is out of scope).

## 2. Source and target SHAs

- Head: `275b7696b6fe533cd9b13ce0669115352ec3a612` (verified on PR + deployment).
- Base: `main` at `53ba1e454f76c7408aecd7b57c4ede3b07620b0e` (approved baseline).
- Ahead 4 commits, behind 0, 22 changed files (9 source, 9 test, 1 config,
  2 docs/evidence). No unrelated history.

## 3. Confirmed unchanged main

Local, remote, and baseline SHAs all `53ba1e4`. Latest Production deployment
record predates this work (`53ba1e4`, 2026-10-12). No pushes to `main`, no
merges, no config changes.

## 4. Actual Preview deployment ID

GitHub deployment ID `7034116137` (use for GitHub-side references).

## 5. Preview URL

`https://gb-coder-public-alpha-3mkrqezzq.vercel.app`
(from the deployment status record and the Vercel bot PR comment).

## 6. Vercel deployment status

`success` — "Deployment has completed" (Vercel's build verdict for SHA
`275b769`). This attests the Preview built; it is not workflow acceptance.

## 7. HTTP route results — BLOCKED (SSO wall)

Anonymous requests to `/`, `/app`, `/app/`, `/app/ide`, `/app/ide/`,
`/ide`, `/api/health`, `/sw.js`, `/app/sw.js`,
`/app/manifest.webmanifest`, and an unknown route ALL return
`302 → vercel.com/sso-api?...` (Vercel Deployment Protection login).
No COOP/COEP headers observable anonymously; no app bytes served; the
unknown-route 404 behavior cannot be observed. Evidence: local HTTP sweep
log (all-302). No Vercel CLI auth and no bypass token exist in this
environment (both checked); protection left untouched per authorization.

## 8. Actual COOP/COEP header results — BLOCKED

Not observable without an authenticated session (see §7). Local config
verification (`audit:headers` 7/7, `verify:deploy` PASS) still holds for the
committed tree. `window.crossOriginIsolated` / SharedArrayBuffer on Preview:
NOT_RUN (requires browser access).

## 9. Astro homepage regression — BLOCKED

Cannot observe `/` (302 to SSO). Local build integrity checks
(`verify:bundle`, build manifest) still hold. Marketing regression must run
in Stage E2-retry with access.

## 10. Static Editor acceptance — BLOCKED (live)

Local equivalent (S1–S4, S7–S8 on identical build): PASS. Live Preview
workflows pending access.

## 11. Advanced IDE acceptance — BLOCKED (live)

Local equivalent (S5–S6, S6b–d, S10–S11, monaco 15/15): PASS. Live pending.

## 12. WebContainer and npm workflow results — BLOCKED (live)

Tightened live boot smoke passed locally (S9); service suite 26/26.
Live Preview execution pending access. Terminal output, `node -v`,
`npm install`, `npm run dev`, and live render were NOT executed against the
Preview and are not claimed.

## 13. Project switching and save-state tests — BLOCKED (live)

Local: S1/S10 (transitions + forced inversion), S2a (failed-flush block),
S3 (mirror honesty + quota toast), S5 (back/forward + unsaved edits),
S11 (stale-commit dots) all PASS. Live: pending.

## 14. IndexedDB data integrity — local PASS, live BLOCKED

Local real-Chromium proofs stand (B-W05/06/07/07d, S7/S8 112-file
SHA-256, ZIP round-trips). Live-origin storage untouched (no session).

## 15. 112-file SHA-256 verification — local PASS (G02/W07d/B-W07d/S7),
live BLOCKED.

## 16. ZIP export/restore results — local PASS (audit 40/40 + e2e PASS),
live BLOCKED.

## 17. Browser console and network errors — BLOCKED (live)

Local runs show only known benign console output (headless CSS parsing
artifact, `inmemory://model/3` model-churn notice, `/_vercel` 404s on local
harness servers). No live console/network capture exists.

## 18. Service Worker scope results — BLOCKED (live)

Local migration suite 25/25 (1 AC BLOCKED on live deploy ID — now
resolvable ON this Preview in a retry). Root-worker and `/app/sw.js` scope
on the Preview origin not yet inspected. Production SW untouched.

## 19. Owner manual smoke-test status — PENDING (not performed)

Checklist for the owner (use test projects or backed-up data; a disposable
browser profile keeps even local origin storage isolated):

1. Dashboard + Static Editor: open `https://gb-coder-public-alpha-3mkrqezzq.vercel.app/app/`
   (log in via SSO) → New Project → type unique HTML/CSS/JS → confirm Live
   Preview renders → reload → confirm content, tabs, and `Saved` indicator →
   export ZIP, restore it in a second profile, compare bytes.
2. Advanced IDE + WebContainer + npm: open the project at `/app/ide` →
   confirm `WebContainer Ready` (DevTools: `crossOriginIsolated === true`) →
   terminal `node -v` → `npm install` → `npm run dev` → preview renders →
   edit a file → confirm hot update.
3. Save/refresh/persistence: type → wait for save → reload → confirm;
   dashboard-return and reopen; back/forward across `/app` ↔ `/app/ide`.
4. ZIP backup/export and restore: full backup from dashboard → restore into
   a clean profile → verify projects, files, and editor styles.
Record results independently; do not proceed to Production while this is
pending (and note E2 automation above is itself pending access).

## 20. Remaining limitations and risks

- All Phase 2.1D accepted limitations carry over (mid-tx abort NOT_RUN,
  16 pre-existing tsc diagnostics, 117 pre-existing lint warnings,
  pre-existing store/mirror/tab debts, sub-debounce hard-kill window).
- P0/P1: none. Live-verification gap is environmental (SSO), not a code
  signal; the deployment builds successfully and local evidence is green.
- Vercel Preview Comments bot is informational only.

## 21. Recommendation for Production release readiness

**Do not merge or promote.** Unblock path (in order):
1. Owner grants a verification path (authorized session, automation bypass
   token, or scoped protection review — owner action, not agent action).
2. Re-run E2 §§5–12 against the Preview (scripts are ready; no code changes
   needed): HTTP/headers, Astro, static + IDE workflows, WebContainer npm
   flow, switching/save-state, 112-file + ZIP, SW scopes, console/network.
3. Owner completes §19 smoke and records results.
4. Re-evaluate to `STAGE_E2_PREVIEW_PASS` / `PASS_PENDING_OWNER_SMOKE`, then
   request Stage E3 (merge + Production) authorization separately.

**Verdict: `STAGE_E2_PREVIEW_BLOCKED`**

---

## Resume verification (E2-continued, no access supplied)

- PR #31 still OPEN, MERGEABLE, head `275b769`, base `53ba1e4`; no duplicate PR.
- Remote branch exactly `275b7696b6fe533cd9b13ce0669115352ec3a612`;
  `origin/main` exactly `53ba1e454f76c7408aecd7b57c4ede3b07620b0e`.
- Local tree: branch HEAD `5fbd4b9` (prior E2 report commit) on top of the
  approved candidate; working tree clean apart from preserved untracked
  files; no source changes since approval.
- Access avenues checked: no owner shareable link or authenticated session
  was supplied; no bypass secret in environment; no Vercel CLI auth.
  Nothing was created, regenerated, exposed, or reconfigured.
- SSO wall re-probed (fresh nonces, all routes 302 → `vercel.com/sso-api`,
  no COOP/COEP observable). Blocker persists through no fault of the code.
- No pushes, merges, deployments, or config changes performed in this
  resume. Verdict stands: **`STAGE_E2_PREVIEW_BLOCKED`** — unblock path is
  unchanged (owner-provided access → rerun E2 §§5–12 verbatim).

---

## E2.1 access re-scan (no owner action supplied)

- PR #31 still OPEN (head `275b769`, base `53ba1e4`); remote SHAs unchanged;
  local HEAD `a6c6684`; no source changes since approval.
- Access scan repeated: no Vercel CLI, no bypass secret in environment, no
  owner shareable link or session supplied. No anonymous re-probing (SSO
  outcome established twice already).
- Unrelated new untracked file observed and preserved untouched:
  `project_files.zip` (not created by this agent; left in place).
- Standing by at **`WAITING_FOR_OWNER_AUTHENTICATION`** — handoff below.

---

## Live-run attempt 1 (environment failure, no app signal)

- Owner executed the runner, but from a working directory where `playwright`
  is not resolvable: `ERR_MODULE_NOT_FOUND: Cannot find package 'playwright'
  imported from .../live-preview-acceptance.mjs`. The script requires the
  repository root as its working directory (that is where Playwright is
  installed).
- L1–L8: **NOT_RUN** (suite exited before any scenario; log verified free
  of secrets and application output).
- No code, deploy, or config conclusion follows from this run. Rerun with
  the corrected command below (it enforces cwd first).