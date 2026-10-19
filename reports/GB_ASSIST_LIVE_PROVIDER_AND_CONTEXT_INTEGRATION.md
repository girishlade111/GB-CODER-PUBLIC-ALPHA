# GB CODER — LIVE PROVIDER & CONTEXT INTEGRATION REPORT

Date: October 19, 2026 (America/Los_Angeles)
Verdict: **CONDITIONAL PASS — mocked application compatibility verified; live providers not verified.**

## 1. Git baseline and worktree

Branch: `feature/multilingual-marketing-seo`.
Baseline: `25f471eb188144d0999ffbc5f8992b5fa2b07776`.
The initial checkout contained modified/untracked marketing and SEO work, the root lockfile, modified regression screenshots, an untracked release-readiness report and an untracked cancellation script. No reset, stash, checkout replacement, remote Git operation, push, PR or deployment was performed.

Only explicitly listed GB Assist source, tests, package scripts and this report are committed. Marketing source and the pre-existing root lockfile remain outside these commits. Required legacy browser tests regenerate their screenshot outputs: the initially modified screenshot versions were not snapshotted before those scripts ran. Those generated artifacts remain unstaged; preservation of their initial bytes cannot be claimed. Browser tests use isolated Chromium contexts and disposable IndexedDB projects.

## 2. OpenRouter stale catalog: confirmed cause

`providerRegistry.ts` supplied five bundled OpenRouter models, including `anthropic/claude-3.5-sonnet`. The built-in settings rendered that list without a discovery action. Discovery existed in the transport and registry but the UI exposed it only for custom configurations. Listing an ID was therefore mistaken for sufficient selection information; it did not establish an available inference endpoint.

## 3. Dynamic model discovery

OpenRouter and OpenAI now expose **Fetch Models**, authenticated through the existing registry/KeyManager path, with no inference probe. OpenRouter uses `GET https://openrouter.ai/api/v1/models` as documented in the [official Models API](https://openrouter.ai/docs/api/api-reference/models/list-all-models-and-their-properties), inspected during this work.

Discovery normalizes IDs, names, context lengths, owners, modalities, pricing and tool metadata when supplied. Mistral `max_context_length` and `capabilities.function_calling` are recognized. IDs remain the exact request identifiers. Responses are limited to 8 MB and 5,000 normalized records; UI selectors render bounded search results. The response-size check follows body decoding, so this is a payload acceptance bound, not a hard peak-memory bound for hostile servers.

Built-in catalogs cache non-secret metadata for up to 24 hours. Explicit refresh replaces the catalog without changing the selected ID. A removed prior selection remains visible as unavailable; Save and Test require explicit reselection. Refreshed-provider inference also rejects an absent selected model before network access. A successful catalog request does not prove account/policy endpoint access. No additional endpoint-availability inference is claimed.

OpenAI uses the compatible authenticated model API. Gemini retains its existing SDK and bundled catalog with a truthful unsupported-discovery notice; it is not sent to an incompatible `/models` endpoint.

## 4. Missing Chat response: evidence and limits

Confirmed reproducible defects in the baseline:

- The SSE reader required `data: `, ignored malformed JSON and in-stream provider errors, and processed only usage from the final unterminated buffer. This could return empty assistant content without a diagnostic.
- Every Chat request advertised tools, including custom models configured without tool support.
- Safe read tools executed, but Chat never submitted their results for model continuation. A tool-only reply could therefore have no explanatory answer.
- `stream_options.include_usage` was sent to every compatible endpoint even though compatible implementations need not support it.
- Cancellation/project checks did not distinguish an old request from a newer generation. An old request's `finally` could clear the newer controller.

Mock transport reproduces these cases and verifies the corrections. **The exact cause of the user's live Mistral incident cannot be established without a live request trace.** These confirmed defects must not be presented as proof of that external incident's cause.

## 5. Streaming and rendering repairs

The existing adapter now parses complete SSE events across fragmented UTF-8 and CRLF chunks, accepts optional spacing after `data:`, processes final buffered content, accumulates tool names/arguments and retains provider tool-call IDs. Provider stream errors, malformed events, unsupported content types and empty output produce visible errors. There is no speculative non-streaming retry or paid automatic fallback.

The request has a 90-second abort timeout and bounded accumulated stream/event size. Cancellation closes the reader. Generation identity suppresses stale chunks, tools and completion updates. Partial text is retained on Stop and provider errors. A safe retry action copies the prior prompt into the composer for user review; it does not rerun tools automatically. Usage streaming options are restricted to built-in OpenAI/OpenRouter.

## 6. Custom model metadata

Discovery-to-form merging is deterministic and does not depend on a variable mutated inside a deferred React state updater. Every model keeps its corresponding ID/name and discovered metadata. Save preserves individual context limits and capability values instead of overwriting every model with provider defaults. Explicit changes to the provider's tool-support checkbox update its model rows. The provider directory is refreshed on render so newly saved configurations appear immediately.

The reported repeated display-name symptom was not independently reproduced from the supplied text. The existing ID/name normalizer already mapped each response row independently. Tests now verify distinct names across save/reload; no speculative claim that React index keys caused the original symptom is made.

## 7. Provider-to-Agent integration

The existing AgentEngine, ToolRegistry, ToolExecutor, permission controller and continuation protocol remain in use. Explicitly unsupported models fail with an actionable capability error before Agent inference. Model results retain real tool-call IDs. Actual read-file results are returned to the provider, followed by a final visible response. Existing multi-tool, malformed-argument, approval, process-cancellation and recovery checks continue to pass.

Chat now also performs a continuation after safe read-tool results. Persisted tool records reconstruct matching tool-role history for subsequent prompts. Modification proposals and terminal approvals retain their existing gates; no command execution was added to retry handling.

## 8. @file and @folder

The composer recognizes an explicit whitespace/start-of-input `@` token, searches real project-relative paths, distinguishes files/folders, highlights matches and supports arrows, Enter, Escape and mouse selection. Email-like text does not trigger attachment parsing. Selection creates a validated attachment and preserves surrounding prompt text and caret position. Duplicate selections do not create duplicate attachments.

## 9. Picker and attachment UI

`AssistContextComposer.tsx` provides a searchable, expandable file/folder tree, multi-selection, attach/clear controls, removable keyboard-accessible chips, missing/protected-path warnings and full-path labels. Results are bounded to 100 paths; search narrows larger projects. Folder paths use a trailing slash within the existing project-scoped attachment-path state. No second project tree/store or context engine was introduced.

The preview lists included files, estimated tokens, truncation, protected/generated/binary exclusions and the receiving provider. Current unsaved content is labeled. Oversized/truncated context requires a per-send confirmation showing the bounded included paths. Projects represent directories through their files; empty directories without file records are not independently selectable.

## 10. Shared ContextBuilder and Agent context

Folder references expand recursively through the existing project's file records in ContextBuilder. Nested file/folder references deduplicate by exact path. Both Chat and Agent use the same model-aware attachment budget calculation and the same context builder. Agent previously included only the context summary; it now includes the validated file blocks in the system prompt.

Content precedence is active Monaco `getValue()`, then the current project file state (which already receives editor changes), then the project's persisted content as loaded by the existing workspace system. The composer snapshots content without saving or writing files. Non-active buffers follow the existing project's editor-update path; no global Monaco model scan can collect another project's data.

## 11. Safety and bounds

Context excludes `.env*`, private keys, credential/service-account files, `.git`, dependencies, build artifacts, binary extensions and NUL-bearing data, including direct selections and nested folder attachments. Paths reject traversal, absolute/drive references and invalid separators.

Limits: 40 included files, depth 16, 24,000 characters per file and the model-aware total token budget. Folder candidates are ordered deterministically by relevance, then path. Omissions/truncation are disclosed. File blocks are labeled as untrusted project data in model instructions. BYOK keys are not part of project context or test fixtures.

Provider URL checks retain HTTPS/true-loopback restrictions and reject URL credentials/query strings/fragments. Redirects remain blocked. Provider discovery no longer borrows a different provider's key when the selected provider has none.

## 12. Isolation and persistence

Project and conversation switches clear pending attachments and cancel stale Chat work. Context-picker local state is keyed by project/session. Provider/model changes cancel prior work. Agent stream callbacks are scoped to their originating project/session. Non-secret provider/model preferences persist; keys remain in KeyManager with explicit session opt-in. No IndexedDB schema migration, workspace replacement, project deletion or forced editor save was introduced.

## 13. Mock HTTP acceptance

`npm run audit:assist:integration`: **12/12 PASS** using actual application services and deterministic mocked fetch:

1. Fragmented UTF-8, no-space SSE, CRLF and final unterminated text.
2. In-stream errors, malformed SSE, JSON/non-stream responses and empty-response diagnostics.
3. Folder deduplication and secret/binary/generated exclusions without project mutation.
4. 500-file folder bounded by file count and token budget.
5. Authenticated 1,000-record discovery with exact ID/name/capability preservation.
6. Saved custom-provider Chat URL/auth/model/context, visible reply and persisted history.
7. Agent read_file result and final provider continuation with explicit context.
8. Conversation/project attachment isolation.
9. Custom model metadata across save/reload.
10. Removed model rejected before inference.
11. Late cancelled transport cannot publish a reply or duplicate the new response.
12. Chat read-tool continuation remains protocol-valid on the next prompt.

## 14. Real Chromium acceptance

`npm run audit:e2e:assist:integration`: **PASS** against the production-built `/app/ide`, real React components, Monaco and disposable IndexedDB projects. External provider HTTP is intercepted. The fixture uses invented model IDs against a Mistral-compatible URL; it does not establish real model availability.

| Path | Executable evidence |
| --- | --- |
| A | OpenRouter Fetch Models, 700 records, search, exact selection, Save and visible streaming Chat |
| B | Custom provider Test Connection success followed by a separate streaming Chat request/reply |
| C | Agent read_file call, actual nested file result, valid tool-call ID and visible continuation |
| D | @file keyboard selection, chip, request-content assertion and removal |
| E | @folder selection plus tree selection; permitted nested contents reach transport; secrets/binary contents absent |
| F | Navigate to a second real project; attachment chips and prior conversation absent |
| G | Refresh invalidates retired selection; Save stays in settings until explicit reselection |
| H | Stop a delayed provider response; no late reply and no duplicate inference |

The suite also edits actual Monaco content and asserts its unsaved marker appears in the provider request. Existing browser suites exercise real WebContainer tools/commands and approval flows. It is focused acceptance coverage, not an exhaustive matrix of every upstream provider/model combination.

## 15. Chat streaming acceptance

**CHAT WORKS: verified with mock HTTP. STREAMING WORKS: verified with mock HTTP.** The service test asserts incremental content deltas; browser tests assert visible assistant content after the connection probe and saved configuration. Connection success is not counted as Chat success.

## 16. Agent acceptance

**TOOL CALLING WORKS: verified with mock HTTP. AUTONOMOUS WORKFLOW WORKS: verified with mock provider transport and actual application tools.** The read_file continuation asserts real file content in the next request. Existing tools/Agent browser regressions also verify approval-gated edits and verification commands, cancellation and history recovery.

## 17. OpenRouter live status

**LIVE PROVIDER: NOT VERIFIED.** No real key was requested, extracted or used. Catalog docs were inspected; live catalog/inference access was not tested.

## 18. Mistral live status

**LIVE PROVIDER: NOT VERIFIED.** Mocked compatible transport is verified. Account access, CORS, the availability/capabilities of `codestral-2508`, and live streaming must be checked in-app using the user's own key.

## 19. Regression gates

| Gate | Result |
| --- | --- |
| audit:byok | PASS, 27/27 |
| audit:ai | PASS, 31/31 |
| audit:tools | PASS, 30/30 |
| audit:agent | PASS, 36/36 |
| audit:assist:integration | PASS, 12/12 |
| audit:e2e:byok | PASS |
| audit:e2e:assist:integration | PASS, A–H and dirty Monaco |
| audit:e2e:phase3b-tools | PASS, all 8 paths |
| audit:e2e:phase3c-agent | PASS, all 6 paths |
| audit:e2e:phase1-sync | PASS, all 23 steps |
| npx tsc --noEmit | PASS |
| npm run lint | PASS, 0 errors, 253 warnings |
| npm run build | PASS, full unified build |
| npm run build:ide | PASS, final source rebuild |
| git diff --cached --check | PASS |

An initial full build hit sandbox `EPERM` creating Astro output. The requested build passed with sandbox elevation. Browser loopback calls initially returned sandbox `EACCES`; reruns with loopback access passed. The legacy SSE test fixture was given the real SSE Content-Type and reader cancellation method required by its updated adapter; assertions were retained. The BYOK provider-header assertion now uses an exact match because the context disclosure also names the provider. Existing Node-only foundation tests emit known unmounted-WebContainer warnings after their passing assertions; actual browser tool/sync regressions pass.

Local validation logs are `reports/provider-context-*-final.log`, `reports/provider-context-chromium-validation.log`, and `reports/provider-context-*-chromium-final.log`. Generated screenshots are supplementary evidence.

## 20. Remaining defects and limits

- **P0:** No confirmed issue in the tested paths. No destructive project-store changes were made.
- **P1:** Live OpenRouter/Mistral compatibility remains unverified; the user's exact external Mistral failure is not conclusively attributed.
- **P2:** Gemini dynamic discovery remains unsupported with an explicit bundled fallback. Catalog discovery cannot guarantee inference access. Empty directories without file records cannot be selected. Model-list body limits are checked after decoding, not as a strict transport-memory cap.
- **P3:** Existing lint warnings and production bundle-size/circular-chunk warnings remain. The initial repeated-name symptom was not independently reproduced, although metadata persistence now has regression coverage.

## 21. Local commits

Implementation: `bd4e2e8` — `fix(assist): repair provider streaming and add bounded workspace context`.
Tests/documentation: the immediately following local commit, `test(assist): verify provider chat agent and project context workflows` (use `git log -2 --oneline` for its hash).

## 22. Final Git state

Task source, focused tests, updated fixtures, package scripts and this report are committed. The initial marketing/SEO work, root lockfile, prior release/cancellation files and regenerated screenshots remain outside these commits. The checkout is intentionally dirty. No push, PR or deployment was performed.

## 23. Manual live BYOK smoke test

1. In the app, enter an OpenRouter key, Fetch Models and select an exact current model ID. Verify a removed prior ID remains unavailable until reselected.
2. In Ask mode, send a short prompt and verify tokens appear, the reply persists and Stop preserves partial text. This is a separate check from Test Connection.
3. Configure Mistral at `https://api.mistral.ai/v1`, Fetch Models, inspect each ID/name and select a chat/streaming-capable model. Run Test Connection only with the in-app inference consent, then separately send Chat.
4. Select a verified tool-capable model (or explicitly configure its capability), switch to Agent and ask it to read a known non-secret file. Inspect the actual result and final explanation.
5. Edit a file without saving, type @ and select it. Inspect the preview and confirm the answer reflects the current buffer.
6. Attach a folder. Review included paths, omissions and estimated tokens; verify `.env`, keys, binaries and dependencies are excluded. Confirm oversized context only after reviewing the disclosed subset.
7. Request one small file modification. Inspect Monaco Diff, approve it and verify the workspace change. Deny a second proposal and confirm it is not applied.
8. Request one verification command. Inspect and approve the command; verify actual output/exit code. Repeat with denial and Stop to verify no unapproved or duplicate execution. Switch projects and confirm context/history isolation.

Keep keys inside the app. Real inference may incur provider charges; these steps are instructions for an explicit user-run acceptance, not authorization for Codex to make paid calls.

## 24. Verdict

**CONDITIONAL PASS.** All listed deterministic, integration, Chromium and build gates passed. Live external-provider compatibility still requires the manual in-app acceptance above. Mock success is not live verification.
