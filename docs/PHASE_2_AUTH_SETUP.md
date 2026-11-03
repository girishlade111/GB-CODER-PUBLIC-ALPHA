# GB CODER — PHASE 2, 2.1 & 2.2: SUPABASE AUTHENTICATION & GITHUB OAUTH SETUP

This document provides complete instructions for configuring Supabase Authentication, GitHub OAuth, Database Row Level Security (RLS), column-level privilege hardening, identity metadata integrity, and local-first session management for GB Coder.

---

## 1. Architecture Overview

Phase 2 introduces user authentication and profile management while strictly maintaining GB Coder's **local-first** guarantee:

```
[ Developer Browser ]
       │
       ├─► IndexedDB ("gb-coder-projects-db") ──► Local projects & workspace files remain on this device
       ├─► Supabase Auth (PKCE Flow) ───────────► Identity authentication via GitHub OAuth
       └─► PostgreSQL ("public.profiles") ──────► Row Level Security (RLS) & Column Privileges protect profile records
```

### Critical Separation of Concerns
1. **Authentication:** Determines who the user is using Supabase Auth with GitHub OAuth.
2. **Local Project Storage:** Stores all project code and files in the browser via IndexedDB. Unchanged, private to this browser, functional without an account.
3. **Cloud Synchronization:** Out of scope for Phase 2. Signing in does **not** upload local files.
4. **Application-Owned PKCE Exchange (Phase 2.1):** `detectSessionInUrl: false` is configured on the Supabase client so the application explicitly owns authorization code consumption at `/app/auth/callback`.
5. **Column-Level Least Privilege (Phase 2.2):** `authenticated` users can insert and update **only** `display_name` and `avatar_url`. Provider identity (`github_username`, `email`) and timestamps (`created_at`, `updated_at`) are derived server-side from `auth.users` and the database clock.

---

## 2. Supabase Project Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Note your **Project URL** (e.g. `https://xyzcompany.supabase.co`).
3. Note your **Anon / Public Key** from **Project Settings -> API**.
4. **NEVER** expose the `service_role` key in frontend code, client bundles, or repository commits.

---

## 3. Public Environment Variables

Add the following to your local `.env` file (copied from `.env.example`):

```bash
# Public client configuration for Supabase Authentication
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-publishable-key>
```

> **Security Note:** Vite bundles variables prefixed with `VITE_` into client JavaScript. Only the URL and public anon key belong here.

If these environment variables are absent, GB Coder gracefully boots into **Guest Mode**, allowing complete local editing, project creation, and preview execution without any error popups.

---

## 4. GitHub OAuth Application Setup

Follow these steps to register your OAuth App with GitHub:

1. Sign in to GitHub and navigate to:
   **Settings -> Developer Settings -> OAuth Apps -> New OAuth App**
2. Fill in the application details:
   - **Application name:** `GB Coder IDE`
   - **Homepage URL:**
     - Production: `https://code.ladestack.in`
     - Development: `http://localhost:5173` (or active development port)
   - **Authorization callback URL (Callback A - GitHub to Supabase):**
     ```
     https://<YOUR-SUPABASE-PROJECT-REF>.supabase.co/auth/v1/callback
     ```
3. Click **Register application**.
4. Copy the **Client ID**.
5. Click **Generate a new client secret** and copy the **Client Secret**.

---

## 5. Supabase Provider Configuration

1. In the Supabase Dashboard, navigate to:
   **Authentication -> Providers -> GitHub**
2. Toggle **GitHub Enabled** to **ON**.
3. Enter your **Client ID** and **Client Secret** obtained from GitHub.
4. Set Scopes to: `read:user user:email` (minimal identity only; never request `repo` or write scopes).
5. Save configuration changes.

---

## 6. Supabase Redirect Allowlist (Callback B - Supabase to GB Coder)

In the Supabase Dashboard, navigate to:
**Authentication -> URL Configuration**

1. Set **Site URL** to:
   ```
   https://code.ladestack.in
   ```
2. In **Redirect URLs**, add the following allowlisted callback destinations:
   - Production:
     `https://code.ladestack.in/app/auth/callback`
   - Local Development:
     `http://localhost:5173/app/auth/callback`
     `http://127.0.0.1:5173/app/auth/callback`
   - Vercel Preview (if applicable):
     `https://*.vercel.app/app/auth/callback`

---

## 7. Database Migration & RLS Execution

Apply the three migration scripts located in the repository in sequential order:
1. Baseline schema: [`supabase/migrations/20261103000000_phase2_profiles_rls.sql`](file:///supabase/migrations/20261103000000_phase2_profiles_rls.sql)
2. Security & RLS Hardening: [`supabase/migrations/20261103000001_phase2_1_hardening.sql`](file:///supabase/migrations/20261103000001_phase2_1_hardening.sql)
3. Privilege Hardening & INSERT Protection: [`supabase/migrations/20261103000002_phase2_2_privilege_hardening.sql`](file:///supabase/migrations/20261103000002_phase2_2_privilege_hardening.sql)

You can apply them via the **Supabase Dashboard SQL Editor** or using the **Supabase CLI**:

```bash
npx supabase db push
```

### Table Schema: `public.profiles`
| Column | Type | Constraints | Modifiability | Description |
|---|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE` | Immutable (System) | Matches Supabase Auth user ID (`auth.uid()`) |
| `display_name` | `TEXT` | | User Editable | Custom user display name |
| `avatar_url` | `TEXT` | | User Editable | Custom avatar image URL |
| `github_username` | `TEXT` | `INDEX` | Immutable (Provider) | GitHub username synced server-side from `auth.users` |
| `email` | `TEXT` | | Immutable (Provider) | User email address synced server-side from `auth.users` |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now() NOT NULL` | Immutable (System) | Creation timestamp set by DB clock |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT now() NOT NULL` | System Triggered | Last update timestamp set by DB trigger |

### Trusted Identity Metadata Model (Phase 2.2)
- **Authorization Evidence:** `auth.uid()` is the SOLE trusted token for row ownership and authorization in RLS.
- **Display Metadata Notice:** `github_username` and `email` are informative display attributes. They are NOT authorization evidence, admin roles, or team permission assertions. Supabase client-side `user_metadata` is untrusted for privilege checks.
- **Restricted Client Permissions:**
  - `GRANT INSERT (id, display_name, avatar_url) ON public.profiles TO authenticated;`
  - `GRANT UPDATE (display_name, avatar_url) ON public.profiles TO authenticated;`
  - Broad INSERT, UPDATE, and DELETE permissions on all other columns are revoked.
- **Server-Side Identity Synchronization:** The `sync_trusted_profile_metadata()` trigger fires `BEFORE INSERT` and populates `email` and `github_username` directly from `auth.users`, discarding any client-attempted forgery.
- **Authoritative Timestamps:** The `handle_profiles_updated_at()` trigger manages `updated_at`. Clients cannot update or forge timestamps.

### Row Level Security (RLS) Verification Queries
Execute these queries in the Supabase SQL Editor:

```sql
-- 1. Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';
-- Result must be: rowsecurity = true

-- 2. Verify active policies
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles';
-- Confirms: "Users can view own profile", "Users can insert own profile", "Users can update own profile"

-- 3. Verify column-level privileges for authenticated role
SELECT column_name, privilege_type 
FROM information_schema.column_privileges 
WHERE table_name = 'profiles' AND grantee = 'authenticated';
-- Confirms:
-- INSERT privilege exists ONLY for: id, display_name, avatar_url
-- UPDATE privilege exists ONLY for: display_name, avatar_url
```

---

## 8. Verification & Automated Testing

Run the automated test suites locally:

```bash
# 1. Typecheck (TypeScript compiler)
npm run typecheck

# 2. ESLint
npm run lint

# 3. Comprehensive Authentication, PKCE & Database Security Suite (73 tests)
npm run audit:phase2:auth

# 4. Browser E2E Authentication Suite (Playwright Chromium)
npm run audit:e2e:phase2:auth

# 5. Measure bundle size and assert absence of secret leakage
npm run verify:bundle

# 6. Unified Production Build (Astro marketing + Vite IDE)
npm run build
```

---

## 9. Common OAuth Errors & Troubleshooting

| Error Symptom | Cause | Solution |
|---|---|---|
| `redirect_uri_mismatch` | GitHub OAuth App callback URL does not match `https://<REF>.supabase.co/auth/v1/callback` | Ensure GitHub Authorization callback URL is exactly `https://<YOUR-PROJECT>.supabase.co/auth/v1/callback`. |
| `URL not allowed` | The return URL is not in Supabase Redirect URLs | Add `http://localhost:5173/app/auth/callback` to Supabase URL Configuration -> Redirect URLs. |
| `access_denied` | User clicked Cancel on GitHub authorization screen | Expected user cancellation; GB Coder catches this and presents a clear "Return to Dashboard" action. |
| `Invalid code` / `already used` | PKCE code already exchanged or expired | Application-Owned PKCE deduplicates exchanges and gracefully restores active session. |
| `Supabase client not configured` | Missing `.env` variables | Supply `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. |
| `Exchange timed out` | Slow network or unresponsive endpoint | 15s timeout fires. Late responses are safely discarded. Click "Try Signing In Again". |

---

## 10. Explicit Phase 2 Boundaries

- **No Cloud Synchronization:** Project code is never synced to the database or cloud storage during Phase 2.
- **Local Projects Preserved:** Logging in or out does not delete, alter, or namespace existing IndexedDB projects.
- **GitHub PAT Independence:** Existing GitHub Personal Access Tokens (used for Git export/sync) remain in encrypted local storage (`credentialStore`) and are never overwritten by OAuth identity tokens.
- **Guest Mode Continuity:** GB Coder functions fully without any Supabase account or credentials.
