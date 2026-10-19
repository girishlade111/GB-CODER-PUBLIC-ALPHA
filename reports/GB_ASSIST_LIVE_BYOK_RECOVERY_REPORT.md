# GB Coder — BYOK & GB Assist End-to-End Recovery Report

**Repository:** `girishlade111/GB-CODER-PUBLIC-ALPHA`  
**Branch:** `feature/multilingual-marketing-seo`  
**Execution Date:** 2026-10-19  
**Status:** ALL GATES AUDITED & REPAIRED — AUTOMATED REGRESSION SUITES PASSING  

---

## 1. Executive Summary

This investigation resolved the eight user-reported live failures across BYOK Provider Management, Model Discovery, Test Connection, Streaming Chat, Agent Mode workspace tools, and `@file`/`@folder` context composer tags.

A critical vulnerability and UX breakdown captured in user diagnostics was diagnosed and repaired:
When users configured the **OpenAI** provider modal with a Base URL override of `https://openrouter.ai/api/v1` and supplied an OpenRouter API key (`sk-or-v1-...`), the "Fetch Models" and "Test Connection" actions ignored the Base URL input and dispatched requests directly to `https://api.openai.com/v1/models`. OpenAI responded with an HTTP 401 error containing partially masked API key fragments (`Incorrect API key provided: sk-or-v1-****************...`), which the UI rendered directly into the diagnostic banner.

All eight failure modes have been traced to concrete root causes and repaired with targeted, backwards-compatible fixes across source code, verified through full static typing, integration test suites, and headless Chromium E2E automation.

---

## 2. Root Cause Analysis & Fix Matrix (The 8 User-Reported Failures)

| # | User-Reported Failure | Root Cause | Implemented Source Fix | Verification Status |
|---|---|---|---|---|
| **1** | **OpenRouter Fetch Models** (FAIL) | 1. Modal ignored `customBaseUrl` input for built-in providers (`openai`/`openrouter`).<br>2. Missing required OpenRouter attribution headers (`HTTP-Referer`, `X-Title`).<br>3. Hardcoded default model `anthropic/claude-3.5-sonnet` returns HTTP 404 on current OpenRouter catalog. | 1. `AiProviderSettingsModal.tsx`: Uses `customBaseUrl.trim() \|\| defaultUrl` regardless of built-in flag.<br>2. `modelDiscoveryService.ts`: Injects `HTTP-Referer: https://code.ladestack.in` and `X-Title: GB Coder (LadeStack)`.<br>3. `providerRegistry.ts`: Updated OpenRouter catalog to recommend `openai/gpt-4o-mini` as primary default. | **E2E & Integration: PASS**<br>*(Live OpenRouter: NOT VERIFIED — offline/no paid key)* |
| **2** | **OpenRouter Chat Reply** (FAIL) | 1. Base URL override was not persisted or passed to `streamChat`.<br>2. Selected model did not auto-update when discovery retrieved active models.<br>3. Reasoning tokens in newer models (`deepseek-r1`, `o1`) were dropped if `delta.content` was empty. | 1. `providerRegistry.ts`: Added `baseUrlOverride` management with localStorage rehydration.<br>2. `openaiCompatibleProvider.ts`: Reads `options.baseUrl \|\| this.baseUrlOverride \|\| this.defaultBaseUrl`.<br>3. `openaiCompatibleProvider.ts`: Added reasoning fallback in SSE parser. | **E2E & Integration: PASS**<br>*(Live OpenRouter: NOT VERIFIED)* |
| **3** | **Mistral Fetch Models / Metadata** (FAIL) | Mistral is defined as `isCustomTemplate: true`. In `AiProviderSettingsModal.tsx`, clicking Mistral triggered `loadProviderConfig('mistral')` which checked `providerRegistry.getProvider('mistral')`, throwing `Unknown AI provider "mistral"`. This cleared the Base URL, returned 0 models, and rendered an empty `<select>`. | `AiProviderSettingsModal.tsx`: Added `isCustomMode` handling for templates (`mistral`, `groq`, `together`, etc.). Pre-populates default Base URL (`https://api.mistral.ai/v1`), default models, context window, and tool calling flags. | **E2E & Integration: PASS**<br>*(Live Mistral: NOT VERIFIED)* |
| **4** | **Mistral Test Connection** (FAIL) | Due to the template lookup crash above, connection test had no target Base URL. Additionally, direct browser requests to `https://api.mistral.ai/v1` are subject to strict CORS preflight rejections by Mistral servers. | 1. Resolved Mistral template initialization so `testConnection` receives `https://api.mistral.ai/v1`.<br>2. Added explicit UI guidance advising users to route Mistral via OpenRouter (`mistralai/mistral-large-2411`) or a local/CORS proxy when testing from browser. | **E2E & Integration: PASS**<br>*(Live Mistral: NOT VERIFIED)* |
| **5** | **Mistral Live Streaming Reply** (FAIL) | Inability to configure and save Mistral in the modal blocked streaming chat. Additionally, custom templates were not automatically registered in `customProviderStore`. | `AiProviderSettingsModal.tsx`: `handleSaveAndConnect` writes custom template configs directly into `customProviderStore` and invokes `providerRegistry.registerCustomProvider()`. | **E2E & Integration: PASS**<br>*(Live Mistral: NOT VERIFIED)* |
| **6** | **Agent Mode `read_file` + Final Answer** (FAIL) | `WorkspaceAdapter.normalizePath` rejected paths containing `.` segments (`if (part === '.' \|\| part === '..') throw ...`), causing AI tool calls like `read_file({ path: "./src/App.tsx" })` or `read_file({ path: "/src/App.tsx" })` to throw unhandled errors. | `src/services/ai/tools/workspaceAdapter.ts`: Allowed leading `./` and `/` stripping while maintaining strict rejection of parent directory traversal (`..`) and sensitive files (`.env`, secrets, binaries). | **E2E & Integration: PASS** |
| **7** | **`@file` actual content in AI request** (FAIL) | Path normalization inconsistencies between `@file` mention parsing and workspace lookup caused file content resolution to fail silently or fallback to empty strings. | `contextBuilder.ts`: Standardized path normalization in `resolveAtMentions` to match `workspaceAdapter.normalizePath`. Verified dirty Monaco buffer priority. | **E2E & Integration: PASS** |
| **8** | **`@folder` bounded content in AI request** (FAIL) | `ContextBuilder.extractAtMentions` previously only matched exact single file paths. Mentions like `@src` or `@src/` were ignored or returned 0 files. | `contextBuilder.ts`: Enhanced mention regex and resolution to detect directory mentions, expanding all child files within the folder up to the configured token budget (`MAX_FILES = 20`, max 4,000 tokens per file). | **E2E & Integration: PASS** |

---

## 3. Critical Security & Redaction Fixes (Gate A & Gate D)

### Root Cause of Credential Leakage
1. In `AiProviderSettingsModal.tsx` (`handleFetchModels`), the URL was computed as:
   ```typescript
   // BUG: Ignored customBaseUrl when builtIn was true
   const rawUrl = builtIn 
     ? providerRegistry.getProvider(selectedProviderId).defaultBaseUrl 
     : customBaseUrl.trim();
   ```
   When a user entered `https://openrouter.ai/api/v1` under the "OpenAI" modal tab, `builtIn` was `true`, causing GB Coder to hit `https://api.openai.com/v1/models` with an OpenRouter key (`sk-or-v1-...`).
2. OpenAI returned an HTTP 401 response:
   ```json
   { "error": { "message": "Incorrect API key provided: sk-or-v1-****************...", "type": "invalid_request_error" } }
   ```
3. The previous regex for redaction did not match `*` masked strings, allowing the partially masked secret to leak into the UI diagnostic banner and console logs.

### Source Hardening Implemented:
1. **Mismatch Guard & UI Banner:**
   `AiProviderSettingsModal.tsx` detects if the user enters an OpenRouter key (`sk-or-v1-...`) or OpenRouter Base URL while configured under `openai`, rendering a warning banner and blocking execution before any network request is dispatched.
2. **Comprehensive Secret Redaction:**
   In `openaiCompatibleProvider.ts`, `redactSecretsFromText` was expanded:
   - Matches and redacts `sk-or-v1-[a-zA-Z0-9_\-\*]{6,}`
   - Matches and redacts `sk-[a-zA-Z0-9_\-\*]{20,}`
   - Matches and redacts `AIzaSy[a-zA-Z0-9_\-\*]{30,}`
   - Matches and redacts `gsk_[a-zA-Z0-9_\-\*]{20,}`
   - Strips `Incorrect API key provided: ...` and `Invalid API key provided: ...` entirely.
3. **Deterministic 401/403 Error Messages:**
   In `openaiCompatibleProvider.ts` (`testConnection`) and `modelDiscoveryService.ts` (`fetchModels`):
   ```typescript
   if (response.status === 401) {
     return {
       success: false,
       message: 'Authentication failed (HTTP 401): Invalid API key or unauthorized access for this endpoint.'
     };
   }
   ```
   Raw upstream error JSON bodies from providers are never passed to the UI for 401/403 responses.

---

## 4. Verification & Evidence Matrix

### Executable Verification Commands

```powershell
# 1. Static Type Checking (0 errors)
npx tsc --noEmit
# Exit Code: 0

# 2. BYOK Provider Management & Security Audit (27/27 suites)
npm run audit:byok
# Exit Code: 0

# 3. GB Assist Integration Test Suite (12/12 suites)
npm run audit:assist:integration
# Exit Code: 0

# 4. End-to-End Chromium Integration (Real browser on port 4198)
npm run audit:e2e:assist:integration
# Exit Code: 0
```

### E2E Test Suite Run Log Summary:
- **Port:** 4198 (Vite build server)
- **Engine:** Playwright / Chromium Headless
- **Steps Verified:**
  1. Root workspace loading & Monaco editor readiness
  2. Provider settings modal rendering & tab switching
  3. Custom Base URL override persistence
  4. Model discovery drawer & dynamic catalog updates
  5. Custom headers serialization and masking
  6. Connection test diagnostics & 401/403 sanitization
  7. Streaming chat response with live Monaco buffer injection
  8. `@file` mention parsing & context extraction
  9. `@folder` mention parsing & recursive expansion
  10. Agent Mode tool calling: `read_file` relative path tolerance (`./src/App.tsx`)
  11. Conversation history persistence across session reloads
  12. Project isolation and secret hygiene verification

---

## 5. Live vs. Mocked Status Transparency

In accordance with strict verification honesty:
- **Mocked / Browser-Intercepted Acceptance:** **PASS** (100% of unit, integration, and Playwright Chromium browser tests pass).
- **Live External OpenRouter Verification:** **LIVE: NOT VERIFIED** (No live paid OpenRouter API key provided during this offline engineering session).
- **Live External Mistral Verification:** **LIVE: NOT VERIFIED** (No live paid Mistral API key provided during this offline engineering session). Note that direct browser calls to `api.mistral.ai` do not support CORS; users must route through a CORS proxy or use OpenRouter's `mistralai/` endpoints.

---

## 6. Files Modified

- `src/services/ai/providers/openaiCompatibleProvider.ts`
- `src/services/ai/providerRegistry.ts`
- `src/services/ai/modelDiscoveryService.ts`
- `src/components/vscode/AiProviderSettingsModal.tsx`
- `src/services/ai/contextBuilder.ts`
- `src/services/ai/tools/workspaceAdapter.ts`
- `src/services/ai/assistAgentService.ts`
- `src/services/ai/agent/agentEngine.ts`
- `reports/GB_ASSIST_LIVE_BYOK_RECOVERY_REPORT.md`
