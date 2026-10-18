# GB Coder — Model Discovery & Custom Provider Model Routing Delivery Report

**Project:** GB Coder — LadeStack Browser-Based IDE  
**Branch:** `feature/multilingual-marketing-seo`  
**Date:** 2026-10-18  
**Scope:** Custom Provider Model Propagation Fix, Authenticated Model Discovery (`GET /models`), Discovered Models Drawer UI, and End-to-End Acceptance Verification  

---

## 1. Executive Summary

A critical model-routing defect was identified where custom providers (such as Mistral AI, Inception Labs, or local vLLM/Ollama endpoints) configured with a specific Model ID (e.g., `mistral-small-4`) triggered connection test failures with:
```
Connection failed (400): Invalid model: custom-model
```

This release delivers:
1. **Root-Cause Elimination of Placeholder Model Leakage:** Strict invariant enforcement across the Custom Provider UI, Provider Registry, Connection Diagnostics, Streaming Chat, and Autonomous Agent Engine. The system now guarantees that the exact user-specified Model ID is transmitted across all channels and never silently defaults to `'custom-model'` or hardcoded fallbacks like `'gpt-4o-mini'`.
2. **Authenticated Model Discovery Service (`modelDiscoveryService.ts`):** Capability-aware, bounded `GET {baseUrl}/models` discovery conforming to standard OpenAI/Mistral protocols. Safely constructs URLs, injects Bearer authentication and sanitized custom headers, normalizes diverse JSON formats, enforces resource bounds (max 1,000 models, 2MB payload, 15s timeout), and avoids any paid inference probe during discovery.
3. **Interactive Discovered Models Drawer:** A responsive discovery drawer within the Custom Provider Builder featuring a live search filter, multi-select checkboxes, "Select All" / "Deselect All", batch addition to provider configuration, and explicit active model selection (`set-active-model-btn`). Manual model addition (`+ Add Model`) remains fully preserved and functional.
4. **Comprehensive Error Classification & CORS Resilience:** Specific classification for HTTP 400 (config), 401/403 (auth), 404 (not found / manual fallback advice), 405 (unsupported), 429 (rate limit), 500+ (server error), and browser CORS restrictions (`errorCategory: 'cors'`) with actionable user guidance.
5. **Full Test Suite & Regression Verification:** 27 deterministic unit tests across 8 suites in `scripts/verify-byok-provider-system.mjs`, real Chromium Playwright E2E verification in `scripts/e2e-byok-provider-system.mjs`, 0 TypeScript errors, 0 ESLint errors, and clean passing runs on all Phase 3A, 3B, and 3C test suites.

---

## 2. Root Cause Analysis: The "Invalid model: custom-model" Defect

### 2.1 UI State Initialization & Model Sync Breakdown
In `src/components/vscode/AiProviderSettingsModal.tsx`:
- When opening the Custom Provider Builder for a new provider, `customModels` was initialized to `[{ id: 'custom-model', name: 'Custom Model' }]` and `selectedModelId` was initialized to `'custom-model'`.
- When the user edited the Model ID input field (`data-testid="custom-model-id-input-0"`) to change `'custom-model'` to `'mistral-small-4'`, `handleUpdateCustomModel` only updated `customModels[0].id` in local state.
- `selectedModelId` remained locked to `'custom-model'`.

### 2.2 Diagnostic Request Routing
In `handleRunDiagnostic`:
- The target model calculation evaluated `selectedModelId || customModels[0]?.id || 'custom-model'`.
- Because `selectedModelId` was still `'custom-model'`, it was passed to `providerRegistry.testProviderConnection`.
- In `OpenAiCompatibleProvider.testConnection`, the outgoing HTTP payload was constructed with:
  ```json
  {
    "model": "custom-model",
    "messages": [{ "role": "user", "content": "ping" }],
    "max_tokens": 5
  }
  ```
- Mistral AI rejected this model with HTTP 400: `Invalid model: custom-model`.

### 2.3 Provider Registry Fallbacks
- In `OpenAiCompatibleProvider.testConnection`: Line 560 had a hardcoded fallback: `const targetModel = (modelId || '').trim() || this.defaultModels[0]?.id || 'gpt-4o-mini'`.
- In `handleSaveAndConnect`: `selectedModelId` was persisted to `providerRegistry` and `assistAgentService`, causing GB Assist Chat and Agent mode to also send `'custom-model'`.

---

## 3. Propagation Fix Architecture & Required Invariants

### 3.1 Strict Invariant
For any provider $P$ and selected model $M$:
$$\text{Test Connection request.model} \equiv M.\text{id}$$
$$\text{GB Assist Chat request.model} \equiv M.\text{id}$$
$$\text{Autonomous Agent request.model} \equiv M.\text{id}$$

- `displayName` is never substituted for the API `modelId`.
- No silent fallback to `'custom-model'`, `'gpt-4o-mini'`, or generic identifiers.
- If no model is configured or selected, an actionable validation error (`"No model selected. Please select or enter a valid model ID before testing connection."`) is returned **before** issuing any network request.

### 3.2 UI Form Synchronization
1. Initialized `customModels` with an empty template `{ id: '', name: '' }` and `selectedModelId` with `''`.
2. In `handleUpdateCustomModel`: Editing row 0 automatically updates `selectedModelId` if it is unset or matches the previous value.
3. Added active model selector button (`data-testid="set-active-model-btn-${idx}"`) displaying a checkmark indicator so users can explicitly set which model is targeted for diagnostics and active chat.
4. In `handleSaveAndConnect`: Added `effectiveModels` filtering out unpopulated blank rows while preserving all explicitly entered or discovered models.
5. In `assistAgentService.ts`: Hardened `setProvider` and `setModel` to validate `modelId` against available models without cross-contaminating custom models.

---

## 4. Authenticated Model Discovery Service (`modelDiscoveryService.ts`)

### 4.1 Safe URL Construction (`constructModelsUrl`)
- Strips trailing slashes, duplicate `/v1`, duplicate `/models`, and trailing `/chat/completions`.
- Enforces HTTPS for remote endpoints while allowing plain HTTP strictly for genuine loopback addresses (`localhost`, `127.0.0.1`).
- Blocks `0.0.0.0` as an invalid/insecure destination.
- Rejects HTTP redirects ($301/302$) with `redirect: 'manual'` to prevent authorization credential leakage across third-party domains.

### 4.2 Zero Inference Probe Guarantee
- Model discovery uses HTTP `GET {baseUrl}/models`.
- No HTTP request body is transmitted.
- No `/chat/completions` endpoint is called.
- Zero billable token consumption occurs during model discovery.

### 4.3 Response Normalization & Bounds Checking
Normalizes standard OpenAI and third-party response shapes:
1. Standard list: `{ object: "list", data: [{ id: "...", ... }] }`
2. Shorthand: `{ data: [{ id: "..." }] }`
3. Direct array: `[{ id: "...", ... }]`

**Defensive Controls:**
- Payload size limit: Maximum 2MB.
- Model quantity cap: Maximum 1,000 models.
- Automatic deduplication of identical model IDs.
- Malformed or null entries are safely skipped.
- Context window extraction supports `context_length`, `context_window`, and `max_context_tokens`.
- Request timeout: 15-second `AbortSignal` with manual cancellation support.

### 4.4 Error Classification
| HTTP / Network Status | Category | User-Facing Action |
| :--- | :--- | :--- |
| **400 Bad Request** | `config` | Verify endpoint supports standard `GET /models`. |
| **401 Unauthorized** | `auth` | Check API key validity and permissions. |
| **403 Forbidden** | `auth` | Key lacks permission to list models. |
| **404 Not Found** | `not_found` | Informs user discovery is unsupported; suggests manual entry. |
| **405 Method Not Allowed** | `unsupported` | Provider does not accept GET on `/models`; suggests manual entry. |
| **429 Rate Limited** | `rate_limit` | Suggests waiting before retrying. |
| **500+ Server Error** | `server` | Upstream provider error; suggests manual entry or retry later. |
| **Browser CORS Error** | `cors` | Informs user of browser origin restrictions; suggests manual entry. |
| **Timeout / Abort** | `timeout` | Discovery cancelled by user navigation or network timeout. |

---

## 5. UI/UX: Fetch Models & Discovered Models Drawer

### 5.1 Controls and Indicators
- **"Fetch Models" Button (`data-testid="fetch-models-btn"`):** Positioned beside "+ Add Model". Displays `Download` icon or `Loader2` spinning indicator during discovery.
- **Discovered Models Drawer:** Opens beneath the header when models are returned.
  - Model count badge.
  - "Select All" / "Deselect All" toggle (`data-testid="select-all-discovered-models-btn"`).
  - Search filter input (`data-testid="discovered-models-search-input"`) with real-time filtering on model ID and display name.
  - Scrollable list with checkboxes (`data-testid="discovered-model-checkbox-${m.id}"`), context window pill, and owner tag.
  - "Add Selected" button (`data-testid="add-selected-discovered-models-btn"`).
- **Banner Feedback:**
  - Success banner with count of added models.
  - Error alert with specific category guidance and dismissal button.

---

## 6. Verification and Acceptance Matrix

### 6.1 Deterministic Unit Test Suite (`npm run audit:byok`)
File: `scripts/verify-byok-provider-system.mjs` — **27/27 Tests Passed**

| Suite | Description | Status |
| :--- | :--- | :--- |
| **Suite 1** | Root Cause Reproducer & Elimination of `result.split` | 2/2 PASS |
| **Suite 2** | Custom Provider Store, Validation & Safe Non-Secret Persistence | 5/5 PASS |
| **Suite 3** | Custom Headers Validation & Injection Rejection | 1/1 PASS |
| **Suite 4** | Provider Registry, Multiple Providers & Model Limits | 2/2 PASS |
| **Suite 5** | Connection Diagnostics, Actual Model ID & Consent Gate | 4/4 PASS |
| **Suite 6** | GB Assist Chat & Agent Mode Integration with Custom Providers | 1/1 PASS |
| **Suite 7** | Authenticated Model Discovery (`discoverModels` & `constructModelsUrl`) | 7/7 PASS |
| **Suite 8** | Model Propagation & Custom Model Routing Invariants | 5/5 PASS |

### 6.2 Real Chromium Playwright E2E Acceptance (`npm run audit:e2e:byok`)
File: `scripts/e2e-byok-provider-system.mjs` — **All 12 Steps Passed**
1. Navigated to IDE workbench (`/app/ide`).
2. Opened Connect Provider modal.
3. Verified React Portal mounting (`document.body`) and $z \ge 99999$.
4. Verified real-time search filtering and clearing.
5. Opened Custom Provider Builder.
6. Verified Back navigation preservation.
7. Verified form validation on missing fields.
8. Clicked `Fetch Models`: verified safe URL `https://api.inceptionlabs.ai/v1/models`, searched for `coder`, selected `mercury-coder-pro`, and added to custom models.
9. Added custom HTTP headers (`X-Custom-Client: gb-coder-test`).
10. Executed Connection Diagnostics: verified connection succeeded without `result.split` and asserted `request.body.model === 'mercury-coder-pro'`.
11. Saved custom provider and verified active provider badge in GB Assist panel.
12. Verified Escape key closes modal cleanly.

### 6.3 Full Regression Suite
- `npm run audit:ai`: **31 / 31 Passed**
- `npm run audit:tools`: **30 / 30 Passed**
- `npm run audit:agent`: **36 / 36 Passed**
- `npx tsc --noEmit`: **0 Errors**
- `npx eslint`: **0 Errors**

---

## 7. Modified Files Manifest

| File | Change Description |
| :--- | :--- |
| `src/services/ai/types.ts` | Added `DiscoveredModel` and `ModelDiscoveryResult` interfaces; added `fetchAvailableModels` method signature. |
| `src/services/ai/modelDiscoveryService.ts` | New service implementing authenticated, capability-aware `GET /models` discovery with safe URL construction, normalization, bounds checking, and error mapping. |
| `src/services/ai/providers/baseProvider.ts` | Added optional `fetchAvailableModels` interface method to `IAiProvider`. |
| `src/services/ai/providers/openaiCompatibleProvider.ts` | Implemented `fetchAvailableModels`; removed hardcoded `'gpt-4o-mini'` fallback in `testConnection`; made `validateCustomHeaders` null-safe. |
| `src/services/ai/providerRegistry.ts` | Added `fetchModelsForProvider`; updated `testProviderConnection` to enforce exact target model without generic fallback. |
| `src/services/ai/assistAgentService.ts` | Hardened `setProvider` and `setModel` to preserve custom models and eliminate stale cross-provider fallback. |
| `src/components/vscode/AiProviderSettingsModal.tsx` | Added `Fetch Models` button, Discovered Models drawer with search filter and multi-select, active model selector radio, and synchronized model state to eliminate `'custom-model'` leakage. |
| `scripts/verify-byok-provider-system.mjs` | Added Suites 7 and 8 (12 new tests) verifying discovery URL construction, header injection, response parsing, error mapping, CORS, timeout, and propagation invariants. |
| `scripts/e2e-byok-provider-system.mjs` | Expanded Playwright E2E suite with Fetch Models drawer interaction, search filtering, and assertion of exact `body.model` propagation. |
| `reports/BYOK_MODEL_DISCOVERY_AND_ROUTING_FIX.md` | Comprehensive delivery report. |
