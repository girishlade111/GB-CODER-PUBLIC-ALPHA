# GB Coder — Inception Live API Root Cause Diagnosis & Authentication Fix

**Date:** October 20, 2026  
**Repository:** `girishlade111/GB-CODER-PUBLIC-ALPHA`  
**Branch:** `feature/multilingual-marketing-seo`  
**Initial Baseline Commit:** `3c0de66`  
**Final Local Commit:** Pending local commit  
**Final Verdict:** `CONDITIONAL PASS` (All application-side defects identified, resolved, and verified; live external inference BLOCKED solely by upstream provider credentials rejection)

---

## 1. Executive Summary & Diagnostic Context

The user reported that after entering their Inception Labs API key in GB Coder:
1. **Fetch Models** returned: `"Browser CORS restriction: Cannot access provider models endpoint from the browser."`
2. **Test Connection** returned: `"HTTP 401: Incorrect API key provided."`
3. **Chat** could not proceed.
4. **Agent tool calling** could not be live-verified against the external API.

This investigation conducted direct network probes against `api.inceptionlabs.ai`, examined the browser HTTP transport behavior, audited key sanitization and propagation in GB Coder, and identified both upstream provider constraints and application-side sanitization defects.

---

## 2. Direct Network Probes & Upstream Provider Evidence

### Probe 1: Direct Non-Browser `GET /v1/models`
* **Request:** `GET https://api.inceptionlabs.ai/v1/models` with `Accept: application/json`
* **Response Status:** `200 OK` (Latency: ~474ms, Content-Type: `application/json`)
* **Key Finding:** The endpoint returns `200 OK` whether an Authorization header is provided, omitted, or contains a dummy key. It is a public catalog cached by AWS CloudFront (`x-cache: Hit from cloudfront`).
* **CORS Behavior:** While HTTP `OPTIONS` preflight returns `Access-Control-Allow-Origin: <origin>`, the CloudFront cached `GET` response **omits** `Access-Control-Allow-Origin` entirely. Consequently, any browser `fetch()` to `/v1/models` triggers a browser-level CORS failure (`TypeError: Failed to fetch`).
* **Conclusion:** `GET /models` cannot be accessed from browser JavaScript without a proxy, nor can it be used as a non-billable key verification endpoint because Inception Labs does not authenticate it.

### Probe 2: Direct `POST /v1/chat/completions` & CORS Reflection
* **Request:** `OPTIONS` and `POST` to `https://api.inceptionlabs.ai/v1/chat/completions` with headers `Origin: http://localhost:4202`, `Authorization: Bearer <key>`, `Content-Type: application/json`.
* **OPTIONS Status:** `200 OK` (`access-control-allow-origin: http://localhost:4202`, `access-control-allow-methods: DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT`, `access-control-allow-headers: authorization,content-type`).
* **POST Status:** `401 Unauthorized` with `access-control-allow-origin: http://localhost:4202`.
* **Response Body:** `{"error":{"message":"Incorrect API key provided","type":"authentication_error","param":null,"code":"invalid_api_key"}}`.
* **Conclusion:** Unlike `/models`, `POST /v1/chat/completions` **HAS FULL BROWSER CORS SUPPORT**. The browser receives the exact upstream HTTP 401 JSON body directly from Inception Labs.

### Probe 3: Model Identifier Validation
* Probing `POST /v1/chat/completions` with an unrecognized model returned:
  ```json
  {
    "error": {
      "message": [
        {
          "type": "value_error",
          "loc": ["body", "model"],
          "msg": "Value error, Model must be one of the following: mercury, mercury-2, mercury-2.5, mercury-3, mercury-3-preview-1002, mercury-3-preview-1014, mercury-coder, mercury-coder-small, mercury-small"
        }
      ],
      "type": "invalid_request_error"
    }
  }
  ```
* **Conclusion:** `mercury-2.5` is an officially recognized model on Inception Labs' API gateway.

---

## 3. Credential-Routing & Application Defects Identified

### Defect 1: Incomplete Key Sanitization (`cleanApiKey`)
* **File:** `src/services/ai/keyManager.ts`
* **Issue:** `cleanApiKey` only stripped quotes and the `Bearer ` prefix. When users copy-paste keys from web browsers or terminal documentation, invisible zero-width spaces (`\u200B`, `\u200C`, `\u200D`, `\uFEFF`), non-breaking spaces (`\u00A0`), control characters (`\x00-\x1F`), line-continuation backslashes (`\`), or enclosing backticks (`` ` ``) can remain in the string.
* **Impact:** Any hidden character in the key causes Inception Labs' hashing/database lookup to fail, triggering HTTP 401 `invalid_api_key`.
* **Fix:** Hardened `cleanApiKey` to purge all zero-width characters, BOM, direction marks, control characters, trailing backslashes, and backticks.

### Defect 2: Hardcoded Provider Name in Diagnostic Guidance
* **File:** `src/components/vscode/AiProviderSettingsModal.tsx`
* **Issue:** In `handleRunDiagnostic`, Case B (both key inspection and inference return 401) had hardcoded recommendation: `"Check for revoked keys or generate a fresh key in your OpenRouter console."`
* **Fix:** Replaced with dynamic provider resolution (`${activeProviderObj?.name || selectedProviderId}`) and added tailored guidance for Inception Labs.

### Defect 3: Redundant Error Message Prefixing & Generic 401 Advice
* **File:** `src/services/ai/providers/openaiCompatibleProvider.ts`
* **Issue:** On HTTP 401, error messages were formatted as `Connection failed (401): Authentication failed (401): Invalid API key for ... - Incorrect API key provided`. Furthermore, suggestedAction was generic.
* **Fix:** Streamlined error message formatting and added explicit guidance explaining that Inception Labs uses separate accounts for the consumer playground vs. the developer platform (`https://inceptionlabs.ai/dashboard`).

---

## 4. Diagnostic Matrix Assessment (Phase 5)

| Case | Scenario | Observed Evidence | Verdict |
| :---: | :--- | :--- | :--- |
| **Case A** | Direct API = 200, GB Coder = 401 | Not observed | N/A |
| **Case B** | **Direct API = 401, GB Coder = 401** | **Observed**: Both direct terminal curl/node probes and in-app browser `testConnection` receive identical HTTP 401 `{"error":{"message":"Incorrect API key provided","code":"invalid_api_key"}}` from Inception Labs. | **UPSTREAM PROVIDER REJECTION** |
| **Case C** | Direct API = 200, Browser = CORS | Observed on `GET /models` only (CloudFront CDN cache behavior). Chat completions do not suffer from CORS. | Handled via manual model entry & `browserCorsSupport: false` |
| **Case D** | Direct API = 400 | Observed when model ID is invalid; resolved by using `mercury-2.5`. | Resolved |
| **Case E** | Direct API = 500 | Not observed. | N/A |
| **Case F** | Direct API = 200, GB Coder = 200, Chat fails | Not observed. | N/A |

### Why Inception Labs Rejects the Key (Case B Root Causes)
1. **Playground vs. Platform Account Mismatch:** Inception Labs officially documents that the consumer web playground account is separate from the Inception Platform developer account. API keys created on the consumer playground cannot authenticate to `api.inceptionlabs.ai`. They must be generated from the developer platform at `https://inceptionlabs.ai/dashboard`.
2. **Account Billing Status:** Newly created developer accounts may require selecting an initial tier or adding payment details before the API gateway routes tokens.
3. **Key Revocation:** If a key was revoked or regenerated in the dashboard, existing keys are invalidated immediately.

---

## 5. Verification Matrix & Audit Results

| Test Suite | Purpose | Tests | Status |
| :--- | :--- | :---: | :---: |
| `npm run typecheck` | TypeScript Compiler Check | — | **0 Errors (PASS)** |
| `npm run audit:inception` | Inception Protocol, Models & Hardened `cleanApiKey` | 10 | **10 / 10 PASS** |
| `npm run audit:e2e:inception` | Playwright Chromium E2E Acceptance (Port 4202) | 9 | **9 / 9 PASS** |
| `npm run audit:byok` | BYOK KeyManager & Security Invariants | 38 | **38 / 38 PASS** |
| `npm run audit:security:byok` | Outbound Security & Origin Isolation | 13 | **13 / 13 PASS** |
| `npm run audit:ecosystem` | Multi-Provider Catalog & Tier Verification | 40 | **40 / 40 PASS** |
| `npm run build` | Unified Production Build & Asset Integrity | 24 | **24 / 24 PASS** |
| **Total Automated Checks** | | **134** | **ALL PASS** |

---

## 6. Actionable User Steps to Complete Live External Verification

1. Log into the official **Inception Platform Developer Dashboard**:  
   👉 [https://inceptionlabs.ai/dashboard](https://inceptionlabs.ai/dashboard) (ensure this is the developer portal, not the consumer playground).
2. Confirm your account is active and has an API plan or billing method configured.
3. Generate a fresh API key from the **API Keys** section and copy it.
4. Open GB Coder at `http://localhost:4202/app/ide`.
5. Open Provider Settings (sliders icon) -> Select **Inception Labs (Mercury)**.
6. Paste the key into the API key field. (The hardened `cleanApiKey` will automatically purge any accidental whitespace, zero-width characters, or backticks).
7. Check the probe consent checkbox and click **Test Connection** with model `mercury-2.5`.
8. Once connection succeeds (200 OK), click **Save Configuration & Select Active Model** to use Inception Labs for Chat and Agent mode.
