# GB Coder — OpenRouter 401 Diagnosis & BYOK Verification Report

**Repository:** `girishlade111/GB-CODER-PUBLIC-ALPHA`  
**Branch:** `feature/multilingual-marketing-seo`  
**Git HEAD:** `b67a30a`  
**Served App Build:** `dist/app/index.html` (Vite SPA + Unified Build)  
**Execution Date:** 2026-10-19  
**Status:** CODE REPAIRED & VERIFIED — OFFLINE PASS — LIVE OPENROUTER: NOT VERIFIED (No valid live external credentials provided)

---

## 1. Executive Summary

This investigation analyzed the reported OpenRouter authentication error in GB Coder:
```
"Authentication Failed (401): Invalid API key for OpenRouter (BYOK)"
Selected model: minimax/minimax-m3.1-flash:free
```

The system was audited end-to-end across credential management, request formation, outbound security gates, TypeScript compilation, and browser runtime execution.

### Key Conclusions:
1. **The 401 response surfaced by the application is authentic and truthful:**
   When an invalid, expired, revoked, or blank key is sent to `https://openrouter.ai/api/v1/chat/completions`, OpenRouter returns HTTP 401 Unauthorized. Even for "free" models such as `minimax/minimax-m3.1-flash:free`, OpenRouter requires an authenticated, valid account key. The app accurately maps HTTP 401 to `Authentication Failed (401): Invalid API key for OpenRouter (BYOK)`. The system does **not** fabricate success.
2. **Three critical client-side credential routing flaws were uncovered and fixed:**
   - **Custom Provider ID Leakage:** If a user viewed a custom template (e.g., Mistral) and then selected OpenRouter, `customProviderId` remained populated in component state (`'mistral'`). In `handleRunDiagnostic`, `const targetId = customProviderId || selectedProviderId;` caused OpenRouter connection tests to be dispatched against Mistral's credential namespace instead of `openrouter`.
   - **Missing Authorization Header in `streamChat`:** In `OpenAiCompatibleProvider.streamChat`, `effectiveApiKey` was computed (`options.apiKey || keyManager.getApiKey(this.id)`), but `this.resolveHeaders(options.apiKey, ...)` was invoked. When callers (e.g. Chat panel or agent service) invoked `streamChat` without passing `options.apiKey` directly, the `Authorization: Bearer <token>` header was omitted entirely, triggering an immediate 401 from OpenRouter.
   - **Model Reset on Provider Switch:** `assistAgentService.setProvider('openrouter')` previously reset the selected model to `models[0].id` if `modelId` was omitted, overriding the user's active choice of `minimax/minimax-m3.1-flash:free`.
3. **CI / TypeScript Configuration Gap Closed:**
   The root `tsconfig.json` had `"files": []` with project references, causing `tsc --noEmit` to check 0 application files. Added `"typecheck": "tsc --noEmit -p tsconfig.app.json"` to `package.json` and fixed strict compilation errors across 18 source files. `npm run typecheck` and `npx tsc -b` both complete with 0 errors.
4. **All Outbound Security Protections Preserved:**
   Zero regression in destination origin binding, secret redaction, HTTPS enforcement, and redirect rejection.

---

## 2. End-to-End Credential Flow Trace

```
[AiProviderSettingsModal]
       │
       ▼ (User enters key or loads saved configuration)
[KeyManager (in-memory + sessionStorage/localStorage)]
  - keyManager.setApiKey('openrouter', key, persistSession, 'https://openrouter.ai/api/v1')
  - Binds opaque key hash to origin 'https://openrouter.ai'
       │
       ▼
[ProviderRegistry]
  - providerRegistry.getProvider('openrouter') -> OpenAiCompatibleProvider instance
  - Base URL: 'https://openrouter.ai/api/v1'
  - Default models catalog with minimax/minimax-m3.1-flash:free
       │
       ├───────────────────────────────────────────┐
       ▼ (Test Connection)                         ▼ (Chat / Agent streamChat)
[testConnection]                           [streamChat]
  - Origin: 'https://openrouter.ai'          - Origin: 'https://openrouter.ai'
  - Validates key against origin             - Validates key against origin
  - Endpoint: .../chat/completions           - Endpoint: .../chat/completions
  - Model: minimax/minimax-m3.1-flash:free   - Model: minimax/minimax-m3.1-flash:free
  - Headers: Authorization: Bearer <key>     - Headers: Authorization: Bearer <key>
             HTTP-Referer, X-Title                      HTTP-Referer, X-Title
```

### Destination URL Confirmation
- **Target URL:** `https://openrouter.ai/api/v1/chat/completions`
- **Method:** `POST`
- **Protocol:** `HTTPS` strictly required (enforced by `validateEndpointUrl`)

---

## 3. Discrepancy Analysis: Context Count vs. Disclosed Filenames

The user noticed an apparent mismatch between the context file count and the disclosed filenames in the message bubble.

### Technical Explanation:
1. **Basename Collision:**
   In `CodeAssistPanel.tsx` (line 515), context chips are rendered via:
   ```tsx
   {msg.contextFiles.map((c) => (
     <span key={c.path} className="px-1.5 py-0.5 rounded bg-white/5 font-mono">
       {c.path.split('/').pop()}
     </span>
   ))}
   ```
   If a project contains multiple files with identical basenames (e.g. `src/components/Header.tsx` and `src/views/Header.tsx`, or multiple `index.ts` files), the chip list displays duplicate basenames or visually appears smaller than the total count.
2. **Folder Expansion vs. Attachment Chip:**
   When an `@folder` mention (such as `@src/`) is attached, the input composer displays 1 attachment pill (`📁 src/`). However, `ContextBuilder.assembleContext` recursively traverses the directory, ingesting qualifying files (up to the token budget and 40 file limit). The token meter correctly counts the expanded files (e.g. `12 file(s) in context`).
3. **Safety & Budget Truncation:**
   Files exceeding the token budget or matching ignore rules (e.g. `.env*`, binaries, `.git`) are safely omitted from context assembly.

No weakening of context boundaries was made.

---

## 4. Source Changes Made

| File | Change Description |
|---|---|
| `package.json` | Added `"typecheck": "tsc --noEmit -p tsconfig.app.json"` to ensure CI checks React app code. |
| `src/components/vscode/AiProviderSettingsModal.tsx` | Reset `customProviderId`, `customDisplayName`, and `customHeaders` when built-in provider is selected. Guarded `handleRunDiagnostic` so built-in providers never route to `customProviderId`. |
| `src/services/ai/providers/openaiCompatibleProvider.ts` | In `streamChat`, passed `effectiveApiKey` into `this.resolveHeaders` so `Authorization: Bearer <key>` is never omitted when `options.apiKey` is undefined. Used `effectiveApiKey` in `redactSecretsFromText`. |
| `src/services/ai/assistAgentService.ts` | In `setProvider(providerId, modelId)`, preserved active model from registry if `modelId` is omitted. |
| `src/components/workbench/WorkbenchEditorArea.tsx` & `src/components/vscode/VSCodeMode.tsx` | Restored direct `handleEditorMount` and `handleSplitEditorMount` passing with `monaco` instance, eliminating ErrorBoundary crash on project mount. |
| `index.html` | Added `pointer-events: none` on `#loading` overlay when fading out to prevent intercepting clicks. |
| `scripts/verify-byok-provider-system.mjs` | Added Section 9 regression tests for key replacement, provider switching, effective auth headers, and 401 error surfacing. |

---

## 5. Automated Verification Results

| Suite | Tests Executed | Passed | Failed | Status |
|---|---|---|---|---|
| **BYOK Provider System** (`npm run audit:byok`) | 31 | 31 | 0 | **PASS** |
| **BYOK Outbound Security Gate** (`npm run audit:security:byok`) | 13 | 13 | 0 | **PASS** |
| **Assist Provider & Context Integration** (`npm run audit:assist:integration`) | 12 | 12 | 0 | **PASS** |
| **Playwright E2E BYOK System** (`npm run audit:e2e:byok`) | 12 scenarios | 12 | 0 | **PASS** |
| **Playwright E2E Assist Integration** (`npm run audit:e2e:assist:integration`) | 7 scenarios | 7 | 0 | **PASS** |
| **React App TypeScript Typecheck** (`npm run typecheck`) | Complete project | 0 errors | 0 | **PASS** |
| **Project References Build** (`npx tsc -b`) | Complete build | 0 errors | 0 | **PASS** |
| **Unified Production Build** (`npm run build`) | Vite + Astro | Clean artifact | 0 | **PASS** |

---

## 6. Live Verification Status & Release Blockers

### Live Provider Status:
- **LIVE OPENROUTER: NOT VERIFIED (OFFLINE ACCEPTANCE ONLY)**
- In accordance with instructions:
  - No real paid or external API requests were made without explicit user authorization.
  - No fake successful responses were fabricated.
  - The offline test harness confirms that when a valid key is provided, the exact request (`POST https://openrouter.ai/api/v1/chat/completions` with model `minimax/minimax-m3.1-flash:free` and `Authorization: Bearer <key>`) is correctly dispatched.
  - When an invalid key is supplied, the HTTP 401 error is truthfully surfaced to the user.

### Remaining Release Blockers:
1. **Live User BYOK Verification:** The user must enter a valid OpenRouter API key in the BYOK modal (`/app/ide`) and run "Test Connection" to perform the first live external probe.
2. **Branch Status:** 42 local commits ahead of remote `origin/feature/multilingual-marketing-seo`. Push/PR pending user authorization.
