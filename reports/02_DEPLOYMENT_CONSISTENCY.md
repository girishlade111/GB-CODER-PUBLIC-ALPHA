# GB Coder — Deployment Version & Environment Consistency Report
## Task 02: Deployment Identity, Routing, and Verification

**Date:** 2026-10-11  
**Lead DevOps & Browser Security Auditor:** Principal DevOps Engineer & Release Auditor  
**Production Host:** [https://code.ladestack.in/](https://code.ladestack.in/)  
**Final Verdict:** `CONSISTENT AND VERIFIED`  

---

## 1. Executive Summary

This audit establishes an unambiguous, evidence-based mapping across **Git commits**, **Vercel deployment records**, **compiled browser bundles**, **Vercel preview/production URLs**, and the live custom domain `https://code.ladestack.in/`.

### The Core Ambiguity Clarified
The previous report (`GB_CODER_WEBCONTAINER_E2E_VALIDATION_REPORT.md`) identified Git commit `cf7d03a` and deployment `gb-coder-public-alpha-rfudjin9w.vercel.app` (Deployment ID: `6993194988`), noting that the production domain already served COOP/COEP headers, while simultaneously asking for production deployment approval. 

**Root Cause of Ambiguity:**  
The Vercel project is directly linked to GitHub repository `girishlade111/GB-CODER-PUBLIC-ALPHA` on the `main` branch. Because `main` is designated as the **Production Branch** in Vercel project settings, **every push to `main` automatically triggers a production-tier build and immediately promotes that deployment to the production custom domain `code.ladestack.in`**. 
Consequently, the WebContainer headers from commit `cf7d03a` went live immediately upon push.

### Current Deployment State
Following Task 01 (Laminar credential remediation in commit `c037a7e`), Vercel built and published deployment `6993771667` (`gb-coder-public-alpha-lq79c5uf9.vercel.app`). 
Live verification of `https://code.ladestack.in/` confirms:
1. **The production domain serves the latest release** (`c037a7e`).
2. **Isolation headers** (`COOP: same-origin` and `COEP: require-corp`) are served with HTTP 200 on all document routes (`/`, `/ide`, `/about`, `/docs`).
3. **The active JavaScript bundle** (`/assets/index-BNBoDhMP.js`) is clean of private credentials and contains all WebContainer availability and isolation guards.
4. **Real browser execution** confirms `window.crossOriginIsolated === true`, `window.isSecureContext === true`, and `typeof SharedArrayBuffer === "function"`.
5. **No version mismatch remains.**

---

## 2. Git Baseline

| Attribute | Details |
|---|---|
| **Local Branch** | `main` |
| **Tracking Remote** | `origin/main` (`git@github.com:girishlade111/GB-CODER-PUBLIC-ALPHA.git`) |
| **Local HEAD SHA** | `c037a7e777bdb52623dec2d15e67ac6e423216b6` |
| **Local HEAD Message** | `fix: remove hardcoded Laminar API key and harden client-side telemetry wrappers` |
| **Working Tree Status** | Clean |
| **Recent Deployment History** | |
| • `c037a7e` (09:45:19Z) | Task 01: Laminar security fix (CURRENT PRODUCTION) |
| • `0637aae` (09:19:50Z) | Task 00: E2E Playwright tests & validation report |
| • `cf7d03a` (08:47:46Z) | WebContainer isolation headers & fix report |
| • `5829f64` (08:41:20Z) | VS Code mode interface & regression tests |
| • `ecc39b2` (08:35:15Z) | WebContainer production audit |

---

## 3. Vercel Deployment Mapping & Identities

Using the authenticated GitHub Deployments API (`gh api repos/girishlade111/GB-CODER-PUBLIC-ALPHA/deployments`), the following deployment sequence is definitively recorded:

### Current Live Production Deployment
- **GitHub Deployment ID:** `6993771667`
- **Target URL (Direct Deployment):** `https://gb-coder-public-alpha-lq79c5uf9.vercel.app`
- **Associated Commit SHA:** `c037a7e777bdb52623dec2d15e67ac6e423216b6` (`c037a7e`)
- **Environment:** `Production`
- **Deployment Status:** `success`
- **Created At:** `2026-10-11T09:45:19Z`
- **Active Production Domain Alias:** `https://code.ladestack.in/`

### Prior WebContainer Validation Deployment (Referenced in Previous Report)
- **GitHub Deployment ID:** `6993194988`
- **Target URL (Direct Deployment):** `https://gb-coder-public-alpha-rfudjin9w.vercel.app`
- **Associated Commit SHA:** `cf7d03a83eecc07454c6ea9a1ceb50e74d033aa5` (`cf7d03a`)
- **Environment:** `Production`
- **Deployment Status:** `success`
- **Created At:** `2026-10-11T08:47:46Z`
- **Status:** Superseded by deployment `6993771667`

---

## 4. Domain-to-Deployment Routing

```mermaid
graph TD
    A[git push origin main] -->|Commit c037a7e| B[GitHub Repository girishlade111/GB-CODER-PUBLIC-ALPHA]
    B -->|Webhook Trigger| C[Vercel CI/CD Build Engine]
    C -->|vite build| D[Production Deployment 6993771667]
    D -->|Direct Deployment URL| E["https://gb-coder-public-alpha-lq79c5uf9.vercel.app<br/>(Protected by SSO / Deployment Guard: 302)"]
    D -->|Automatic Production Alias| F["https://code.ladestack.in/<br/>(Public CDN: HTTP 200 + COOP/COEP)"]
    
    subgraph "Routing Separation"
        E
        F
    end
```

### Access Model Differentiation
- **Direct `*.vercel.app` URLs:** Enforce Vercel deployment protection (HTTP 302 redirecting to `https://vercel.com/sso-api`). This prevents public crawling or unauthorized access to staging/direct deployment endpoints.
- **Custom Domain (`https://code.ladestack.in/`):** Serves public end-user traffic directly with HTTP 200, routing all sub-paths through the configured headers in `vercel.json`.

---

## 5. Commit Comparison: Deployed vs Local

| Component | Target Identifier | Match Status | Evidence |
|---|---|---|---|
| **Local Git HEAD** | `c037a7e` | Baseline | `git rev-parse HEAD` |
| **GitHub Remote `origin/main`** | `c037a7e` | **MATCH (100%)** | `git ls-remote origin main` |
| **Latest Vercel Deployment** | `c037a7e` (ID: 6993771667) | **MATCH (100%)** | GitHub Deployment API status |
| **Production Served Bundle** | `index-BNBoDhMP.js` | **MATCH (100%)** | Fetched from `code.ladestack.in` |

**Conclusion:** There is **zero commit drift** between local development, GitHub remote, and Vercel production.

---

## 6. Browser Bundle Verification

Live HTTP inspection was conducted on the bundle served by `https://code.ladestack.in/`:

```
URL: https://code.ladestack.in/assets/index-BNBoDhMP.js
HTTP Status: 200 OK
Content-Type: application/javascript; charset=utf-8
Content-Length: 330,219 bytes
ETag: W/"b23b1f37a6f0f8dfef061939e079f33b"
x-vercel-id: bom1::kswfh-1791712405140-184643bc96a2
```

### Bundle Integrity Audit
1. **Compromised Laminar Key Check:**
   - Pattern: `13pMPcBJ0`
   - Result: **ABSENT (`false`)** — Verified completely clean.
2. **WebContainer Support Guard Check:**
   - Pattern: `crossOriginIsolated` / `isSupported`
   - Result: **PRESENT (`true`)** — Supports safe browser isolation gating.
3. **MIME Type Integrity:**
   - Returned `application/javascript; charset=utf-8` (proving the asset is actively hosted, not fallen back to `index.html`).

---

## 7. HTTP Document Header Verification

Conducted on 2026-10-11 at `09:50:38Z` across all core routes:

| Route Tested | HTTP Status | Content-Type | COOP Header | COEP Header | Isolation Valid |
|---|---|---|---|---|---|
| `https://code.ladestack.in/` | `200 OK` | `text/html; charset=utf-8` | `same-origin` | `require-corp` | **YES** |
| `https://code.ladestack.in/ide` | `200 OK` | `text/html; charset=utf-8` | `same-origin` | `require-corp` | **YES** |
| `https://code.ladestack.in/about` | `200 OK` | `text/html; charset=utf-8` | `same-origin` | `require-corp` | **YES** |
| `https://code.ladestack.in/docs` | `200 OK` | `text/html; charset=utf-8` | `same-origin` | `require-corp` | **YES** |
| `https://code.ladestack.in/api/health` | `200 OK` | `application/json; charset=utf-8` | `same-origin` | `require-corp` | **YES** |

*All document routes strictly satisfy the requirements for WebContainer execution (`window.crossOriginIsolated === true`).*

---

## 8. Stale-Cache & Service Worker Assessment

### Mechanism Analysis
GB Coder uses `vite-plugin-pwa` with Workbox configured in `generateSW` mode (`registerType: 'autoUpdate'`).
- The Service Worker precaches static assets and `index.html`.
- When Vercel deploys a new commit, chunk hashes change.
- A user tab opened *prior* to a deployment continues executing older in-memory scripts and retains the precached `index.html`.
- If an older tab requests a deleted chunk (e.g., `index-B_HMa5SA.js`), Vercel's SPA rewrite rule rewrites the request to `index.html`, returning `text/html` instead of JavaScript.

### Built-in Self-Healing Guard
GB Coder contains [src/utils/loadChunk.ts](file:///c:/Users/Girish%20Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/utils/loadChunk.ts):
- It intercepts chunk loading failures.
- When an import fails due to a stale chunk hash or MIME mismatch, it automatically unregisters the Service Worker, purges the Cache Storage API, and reloads the window.
- User data in `localStorage` is preserved.
- On reload, the fresh `index.html` referencing `index-BNBoDhMP.js` is loaded and cached.

### Active Service Worker Manifest
Inspection of `https://code.ladestack.in/sw.js`:
- HTTP Status: `200 OK`
- Contains active precache entries for the current build: `[ 'index-DkgW0of7.js', 'index-BNBoDhMP.js', 'index-BH4SiMS6.js' ]`.
- Confirmed: The CDN serves the correct Service Worker manifest.

---

## 9. Real Browser Runtime Validation

Tested via the integrated browser runtime engine on `https://code.ladestack.in/`:

| In-Browser Evaluation | Value | Verdict |
|---|---|---|
| `window.crossOriginIsolated` | `true` | **PASS** |
| `window.isSecureContext` | `true` | **PASS** |
| `typeof SharedArrayBuffer` | `"function"` | **PASS** |
| Service Worker Registration | `Active` (scope: `https://code.ladestack.in/`) | **PASS** |
| Fatal Console Errors | `0` | **PASS** |
| Editor & Live Preview | Mounted and responsive | **PASS** |

---

## 10. Automated Release Guards Implemented

To eliminate future ambiguity and prevent deployment drift, [scripts/verify-deploy-config.mjs](file:///c:/Users/Girish%20Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/scripts/verify-deploy-config.mjs) was enhanced with an automated release verification suite (`--verify-release`):

```bash
node scripts/verify-deploy-config.mjs --verify-release
```

### Automated Guard Capabilities:
1. **Dual Document Header Audit:** Asserts `COOP: same-origin` and `COEP: require-corp` on `/` and `/ide`.
2. **Active Bundle Verification:** Scrapes the live HTML, resolves the active entry bundle, and verifies HTTP 200 with `Content-Type: application/javascript`. (Fails if Vercel returns `text/html` due to an asset 404 rewrite).
3. **Secret Leak Detection:** Scans the live production bundle in real time for known credential patterns.
4. **Service Worker Probe:** Confirms `sw.js` is reachable and serving valid cache rules.

**Test Execution Result:**
```
live release consistency
  PASS  https://code.ladestack.in/ serves isolation headers (COOP: same-origin, COEP: require-corp)
  PASS  https://code.ladestack.in/ide serves isolation headers (COOP: same-origin, COEP: require-corp)
  PASS  entry bundle /assets/index-BNBoDhMP.js is active and served as JavaScript
  PASS  entry bundle verified clean (zero compromised credentials)
  PASS  service worker sw.js is active and accessible

deploy config is valid.
```

---

## 11. Remaining Discrepancies

- **Zero functional or version discrepancies remain.**
- Direct `*.vercel.app` preview URLs continue to enforce Vercel SSO protection (302 redirect), which is expected security behavior for non-custom-domain deployment endpoints.

---

## 12. Recommended Release & Rollback Procedures

### Release Procedure
1. Run local pre-flight checks:
   ```bash
   npm run audit:tests
   npm run audit:webcontainer
   npm run verify:bundle
   npm run verify:deploy
   npx tsc --noEmit
   ```
2. Commit and push to `main`:
   ```bash
   git push origin main
   ```
3. Vercel automatically deploys and promotes to `https://code.ladestack.in/`.
4. Validate live production consistency:
   ```bash
   node scripts/verify-deploy-config.mjs --verify-release
   ```

### Rollback Procedure
If an issue occurs in production:
1. Identify the previous known good deployment ID from GitHub Deployments API (e.g., `6993194988`).
2. Via Vercel Dashboard (or `git revert HEAD && git push origin main`):
   - Promoting the previous deployment or pushing a clean git revert immediately redeploys the previous bundle.
3. Verify live recovery via `node scripts/verify-deploy-config.mjs --verify-release`.

---

## 13. Final Security & Release Verdict

```
═════════════════════════════════════════════════════════════════════════════
  FINAL VERDICT:
  CONSISTENT AND VERIFIED
═════════════════════════════════════════════════════════════════════════════
```

**Verdict Summary:**  
1. Git baseline `c037a7e` perfectly matches Vercel production deployment `6993771667`.
2. The production domain `https://code.ladestack.in/` serves the exact remediated bundle (`index-BNBoDhMP.js`) with zero exposed credentials.
3. Cross-origin isolation (`COOP` / `COEP`) is 100% active and functioning in real browser execution.
4. Automated release guards have been codified into `scripts/verify-deploy-config.mjs`.
