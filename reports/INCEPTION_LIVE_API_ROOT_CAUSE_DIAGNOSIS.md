# GB Coder — Inception Live API Root Cause Diagnosis & Authentication Fix

**Date:** October 20, 2026  
**Repository:** `girishlade111/GB-CODER-PUBLIC-ALPHA`  
**Branch:** `feature/multilingual-marketing-seo`  
**Latest Local Commit:** `3c45e5b`  
**Final Live Provider Status:** `CONDITIONAL PASS` (All application-side code defects, key sanitization vulnerabilities, and diagnostic reporting issues resolved and verified; live external inference NOT VERIFIED pending user-controlled key invocation)

---

## 1. Executive Summary & Diagnostic Execution Evidence

### Diagnostic Execution Audit
* **Was a request executed with a user-supplied private Inception key?** **NO**.
* **Evidence:**
  1. The temporary localhost diagnostic server (`127.0.0.1:4288`, task `task-1018`) was launched and remained active for 10 minutes until hitting its automated safety timeout (`[DIAG SERVER] Safety timeout reached (10 min). Shutting down...`). No HTTP payload or key was received.
  2. All direct terminal network probes performed by the agent against `https://api.inceptionlabs.ai` were executed strictly with **dummy/synthetic test tokens** (`sk-dummy-key-test`, `sk-invalid-key-probe`).
  3. The agent has not extracted, read, printed, or handled the user's private key.

### Actual Meaning of the Observed HTTP 401
* **Dummy-Key Authentication Rejection:** **VERIFIED**. Direct terminal probes proved that `api.inceptionlabs.ai/v1/chat/completions` actively validates the `Authorization: Bearer <key>` header and returns HTTP 401 `{"error":{"message":"Incorrect API key provided","code":"invalid_api_key"}}` for unrecognized keys.
* **User's Actual API-Key Validity:** **NOT VERIFIED**. Because the agent has not evaluated the user's private key, the observed HTTP 401 in the user's previous in-app test cannot be assumed to be an invalid key from the provider.
* **Live Chat Inference with Real Key:** **NOT VERIFIED**. No billable inference request was executed.

---

## 2. Capabilities & Protocol Verification Matrix

| Capability / Dimension | Status | Evidence & Details |
| :--- | :---: | :--- |
| **Endpoint Reachability** | **VERIFIED** | Direct HTTP connection to `https://api.inceptionlabs.ai` succeeds with ~474ms latency. |
| **CORS on `/v1/models`** | **VERIFIED UNSUPPORTED** | `GET /v1/models` is a public CloudFront-cached catalog (`x-cache: Hit from cloudfront`). It omits `Access-Control-Allow-Origin` on GET responses. In-browser `fetch()` correctly throws a CORS error. Handled truthfully in GB Coder via `browserCorsSupport: false` and manual model selection. |
| **CORS on `/v1/chat/completions`** | **VERIFIED SUPPORTED** | Both `OPTIONS` preflight and `POST` directly reflect `Access-Control-Allow-Origin: <requester-origin>`. In-browser chat completions do **not** suffer from CORS restrictions. |
| **Model ID Validation** | **VERIFIED** | Probing with an unrecognized model returns HTTP 400 listing accepted models (`mercury, mercury-2, mercury-2.5, mercury-3...`). Model `mercury-2.5` is verified as officially supported. |
| **Dummy-Key Rejection** | **VERIFIED** | Direct terminal probe returns HTTP 401 `{"error":{"message":"Incorrect API key provided","code":"invalid_api_key"}}`. |
| **User's Private Key Validity** | **NOT VERIFIED** | No test was executed with the user's private key. |
| **Live Chat Inference (Real Key)** | **NOT VERIFIED** | No billable completion was executed with user credentials. |
| **Streaming & Tool Calling Architecture** | **VERIFIED (LOCAL/MOCK)** | SSE streaming parsing and multi-tool delta assembly verified in unit and Chromium E2E acceptance suites. |

---

## 3. Temporary Server & Process Termination Audit

* **Localhost Diagnostic Server (`127.0.0.1:4288`):** **STOPPED**.
  - `Get-NetTCPConnection -LocalPort 4288` returns exit code 1 (no active connections or listeners).
  - Background task `task-1018` exited cleanly on timeout.
* **Temporary Files & Processes:**
  - `scripts/temp-diag-server.mjs`: Permanently deleted (`Test-Path` returns `False`).
  - `scripts/inception-live-diag.ps1`: Permanently deleted (`Test-Path` returns `False`).
  - `manage_task list`: Confirms zero background tasks currently active.
  - No credential or user input was ever written to disk or preserved in memory.

---

## 4. `cleanApiKey` Normalization Policy Audit

Inspection of `cleanApiKey` in `src/services/ai/keyManager.ts` confirmed that the normalization policy strictly removes non-printable formatting artifacts while preserving legitimate credential bytes:

```typescript
export function cleanApiKey(rawKey?: string): string {
  if (!rawKey) return '';
  // 1. Strip non-printable unicode artifacts: zero-width space, joiners, BOM, direction marks
  let cleaned = rawKey.replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, '').trim();
  if (!cleaned) return '';

  // 2. Strip trailing line-continuation backslashes often copied from curl commands
  cleaned = cleaned.replace(/\\+$/, '').trim();

  // 3. Strip enclosing symmetric quotes (double, single, or backticks)
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'")) ||
    (cleaned.startsWith('`') && cleaned.endsWith('`'))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // 4. Strip accidental leading "Bearer " prefix from header specifications
  if (/^bearer\s+/i.test(cleaned)) {
    cleaned = cleaned.replace(/^bearer\s+/i, '').trim();
  }

  // 5. Strip non-printable ASCII control characters (null, tabs, line breaks)
  cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, '');

  return cleaned.trim();
}
```

### Normalization Policy Principles:
* **Preserved:** All standard printable ASCII characters used in API keys across all providers: `[A-Za-z0-9+/=_-]`, colons, hyphens, and dots.
* **Stripped:** Only invisible non-printable unicode characters (`\u200B`, `\uFEFF`, etc.), control characters (`\x00-\x1F`), shell line-continuation backslashes (`\`), matching enclosing quotes (`"..."`, `'...'`, `` `...` ``), and redundant `Bearer ` prefixes.
* **Safety:** Legitimate credential bytes are never mutated.

---

## 5. Confirmed Application Defects & Source Corrections

1. **Defect:** `cleanApiKey` previously allowed zero-width spaces (`\u200B`), BOM (`\uFEFF`), and trailing backslashes copied from documentation snippets into the key string.
   - **Fix:** Hardened `cleanApiKey` in `src/services/ai/keyManager.ts` and added regression tests in `scripts/verify-inception-provider.mjs`.
2. **Defect:** Hardcoded `"OpenRouter console"` in Case B diagnostic recommendation in `AiProviderSettingsModal.tsx`.
   - **Fix:** Updated to dynamically resolve provider name (`${activeProviderObj?.name || selectedProviderId}`) and provide tailored Inception Platform developer dashboard guidance.
3. **Defect:** Redundant error prefixing in `testConnection` (`"Connection failed (401): Authentication failed (401): ..."`).
   - **Fix:** Streamlined message formatting in `src/services/ai/providers/openaiCompatibleProvider.ts`.

---

## 6. Automated Verification Matrix

| Test Suite | Purpose | Tests | Status |
| :--- | :--- | :---: | :---: |
| `npm run typecheck` | TypeScript Compiler Check | — | **0 Errors (PASS)** |
| `npm run audit:inception` | Inception Protocol, Models & `cleanApiKey` | 10 | **10 / 10 PASS** |
| `npm run audit:e2e:inception` | Playwright Chromium E2E Acceptance (Port 4202) | 9 | **9 / 9 PASS** |
| `npm run audit:byok` | BYOK KeyManager & Security Invariants | 38 | **38 / 38 PASS** |
| `npm run audit:security:byok` | Outbound Security & Origin Isolation | 13 | **13 / 13 PASS** |
| `npm run audit:ecosystem` | Multi-Provider Catalog & Tier Verification | 40 | **40 / 40 PASS** |
| `npm run build` | Unified Production Build & Asset Integrity | 24 | **24 / 24 PASS** |
| **Total Automated Checks** | | **134** | **ALL PASS** |

---

## 7. Actionable User Next Steps for In-App Live Verification

Because the user prefers in-app verification using their already entered key:
1. Ensure your Inception Labs key was generated on the **Inception Platform developer dashboard** at [https://inceptionlabs.ai/dashboard](https://inceptionlabs.ai/dashboard) (rather than the consumer web playground), and that an active plan or billing setup is present.
2. In GB Coder (`http://localhost:4202/app/ide`), open Provider Settings -> **Inception Labs (Mercury)**.
3. Enter or re-paste your key (the hardened `cleanApiKey` will automatically strip any invisible copy-paste artifacts).
4. Select model `mercury-2.5`, check the probe consent checkbox, and click **Test Connection**.
5. Once connection succeeds, click **Save Configuration & Select Active Model** to chat or run autonomous agent tasks.
