# GB CODER — GITHUB APP ARCHITECTURE & AUTHORIZATION SPECIFICATION

## 1. PURPOSE & SECURITY BOUNDARIES

GB Coder separates developer identity authentication from repository code access.

### Identity vs Authorization
- Supabase GitHub OAuth Provider:
  - Scopes: read:user, user:email
  - Purpose: Authenticates developer identity, provisions public.profiles row.
  - Security Boundary: Does NOT grant access to read or mutate developer repositories.
- GitHub App (Repository Access):
  - Permissions: Contents (Read and write), Metadata (Read-only).
  - Purpose: Granular, repository-scoped access tokens with automatic 1-hour expiration.
  - Organization Support: Fine-grained selection of specific repositories rather than all-or-nothing account access.
- Personal Access Token (PAT) Fallback:
  - Purpose: Zero-configuration local client fallback.
  - Security Boundary: Stored exclusively on the developer device in IndexedDB using WebCrypto AES-GCM encryption with 256-bit keying. Never transmitted to Supabase or any intermediate server.

---

## 2. GITHUB APP REGISTRATION SPECIFICATION

When creating the official GitHub App in GitHub Developer Settings:

### General Settings
- GitHub App Name: GB Coder IDE
- Homepage URL: https://code.ladestack.in
- Callback URL: https://code.ladestack.in/app
- Setup URL (optional redirect after installation): https://code.ladestack.in/app/projects

### Repository Permissions
- Contents: Read and write (to pull and push project files via Git Data API)
- Metadata: Read-only (mandatory default to list repo name, branches, default branch)
- Pull requests: None
- Issues: None
- Workflows: None

### Account Permissions
- Email addresses: None (handled by Supabase OAuth identity)
- Profile: None

### Installation Scope
- Any account (allows public developers to install the app on their personal accounts or organizations)

---

## 3. SERVER-SIDE TOKEN EXCHANGE CONTRACT

### Non-Negotiable Security Rule
GitHub App Private Key (.pem) and Client Secret must NEVER be bundled into client-side code or exposed via VITE_* environment variables.

### Token Exchange Flow
1. Developer clicks "Connect GitHub App" in GB Coder.
2. Developer is directed to:
   https://github.com/apps/gb-coder-ide/installations/new
3. After granting access to selected repositories, GitHub redirects back to GB Coder with installation_id.
4. GB Coder requests a short-lived installation access token through a secured backend (Supabase Edge Function or secure serverless route):
   - Backend verifies authenticated Supabase JWT (auth.uid()).
   - Backend generates GitHub App JWT signed with RS256 using private key.
   - Backend calls:
     POST https://api.github.com/app/installations/{installation_id}/access_tokens
   - Backend returns installation token (valid for 60 minutes) to the client.
5. Client uses the token directly against https://api.github.com for repository browsing and atomic Git Data operations.

---

## 4. PAT FALLBACK CONTRACT

For developers who prefer not to install an app or who work in restricted organizations:
- GB Coder provides immediate PAT connection.
- Token is verified via GET https://api.github.com/user.
- Token is encrypted in browser memory via WebCrypto and saved to IndexedDB (credentialStore).
- Tokens are never logged, printed, or sent to backend telemetry.
