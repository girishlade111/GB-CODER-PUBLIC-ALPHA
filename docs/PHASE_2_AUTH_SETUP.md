# GB CODER — PHASE 2: SUPABASE AUTHENTICATION & GITHUB OAUTH SETUP

This document provides complete instructions for configuring Supabase Authentication, GitHub OAuth, Database Row Level Security (RLS), and local-first session management for GB Coder.

---

## 1. Architecture Overview

Phase 2 introduces user authentication and profile management while strictly maintaining GB Coder's **local-first** guarantee:

```
[ Developer Browser ]
       │
       ├─► IndexedDB ("gb-coder-projects-db") ──► Local projects & workspace files remain on this device
       ├─► Supabase Auth (PKCE Flow) ───────────► Identity authentication via GitHub OAuth
       └─► PostgreSQL ("public.profiles") ──────► Row Level Security (RLS) protects user profile records
```

### Critical Separation of Concerns
1. **Authentication:** Determines who the user is using Supabase Auth with GitHub OAuth.
2. **Local Project Storage:** Stores all project code and files in the browser via IndexedDB. Unchanged, private to this browser, functional without an account.
3. **Cloud Synchronization:** Out of scope for Phase 2. Signing in does **not** upload local files.

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
     - Development: `http://localhost:5173`
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
4. Save configuration changes.

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

Run the migration script located in the repository:
[`supabase/migrations/20261103000000_phase2_profiles_rls.sql`](file:///supabase/migrations/20261103000000_phase2_profiles_rls.sql)

You can apply it either via the **Supabase Dashboard SQL Editor** or using the **Supabase CLI**:

```bash
npx supabase db push
```

### Table Schema: `public.profiles`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE` | Matches Supabase Auth user ID |
| `display_name` | `TEXT` | | User display name |
| `avatar_url` | `TEXT` | | Avatar image URL |
| `github_username` | `TEXT` | `INDEX` | GitHub handle |
| `email` | `TEXT` | | User email address |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now() NOT NULL` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT now() NOT NULL` | Last update timestamp |

### Row Level Security (RLS) Verification
Execute this query in the SQL Editor to verify RLS enforcement:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';
-- Result must be: rowsecurity = true

SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles';
-- Confirms: "Users can view own profile", "Users can insert own profile", "Users can update own profile", "Users can delete own profile"
```

---

## 8. Verification & Automated Testing

Run the automated test suites locally:

```bash
# 1. Typecheck
npm run typecheck

# 2. Lint
npm run lint

# 3. Authentication & Security Suite
node scripts/auth-tests.mjs

# 4. Browser E2E Authentication Suite
node scripts/e2e-auth-phase2.mjs

# 5. Unified Production Build
npm run build
```

---

## 9. Common OAuth Errors & Troubleshooting

| Error Symptom | Cause | Solution |
|---|---|---|
| `redirect_uri_mismatch` | GitHub OAuth App callback URL does not match `https://<REF>.supabase.co/auth/v1/callback` | Ensure GitHub Authorization callback URL is exactly `https://<YOUR-PROJECT>.supabase.co/auth/v1/callback`. |
| `URL not allowed` | The return URL is not in Supabase Redirect URLs | Add `http://localhost:5173/app/auth/callback` to Supabase URL Configuration -> Redirect URLs. |
| `access_denied` | User clicked Cancel on GitHub authorization screen | Expected user cancellation; GB Coder catches this and presents a clear "Return to Dashboard" action. |
| `Invalid code` | PKCE code already exchanged or expired | GB Coder contains an in-memory lock against double-exchange in React StrictMode. Verify system clocks. |
| `Supabase client not configured` | Missing `.env` variables | Supply `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. |

---

## 10. Explicit Phase 2 Boundaries

- **No Cloud Synchronization:** Project code is never synced to the database or cloud storage during Phase 2.
- **Local Projects Preserved:** Logging in or out does not delete, alter, or namespace existing IndexedDB projects.
- **GitHub PAT Independence:** Existing GitHub Personal Access Tokens (used for Git export/sync) remain in encrypted local storage (`credentialStore`) and are never overwritten by OAuth identity tokens.
