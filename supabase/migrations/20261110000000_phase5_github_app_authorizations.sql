-- GB Coder Phase 5: Secure GitHub App Authorizations & OAuth State Schema
-- Implements multi-user isolation, token lifecycle tracking, and strict RLS.
-- Zero emoji rule strictly enforced.

-- 1. GitHub App Authorizations Table
CREATE TABLE IF NOT EXISTS public.github_app_authorizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    github_user_id BIGINT NOT NULL,
    github_username TEXT NOT NULL,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT NOT NULL,
    token_expires_at TIMESTAMPTZ NOT NULL,
    refresh_token_expires_at TIMESTAMPTZ,
    installation_id BIGINT,
    scope TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_github_app_user_gh_user UNIQUE (user_id, github_user_id)
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_gh_app_auth_user_id ON public.github_app_authorizations(user_id);
CREATE INDEX IF NOT EXISTS idx_gh_app_auth_gh_user_id ON public.github_app_authorizations(github_user_id);

-- Enable RLS
ALTER TABLE public.github_app_authorizations ENABLE ROW LEVEL SECURITY;

-- Revoke all permissions from anon and PUBLIC
REVOKE ALL ON public.github_app_authorizations FROM anon, PUBLIC;
GRANT SELECT, DELETE ON public.github_app_authorizations TO authenticated;
GRANT ALL ON public.github_app_authorizations TO service_role;

-- SELECT policy: Authenticated users can view their own connection metadata
DROP POLICY IF EXISTS "github_app_auth_select_own" ON public.github_app_authorizations;
CREATE POLICY "github_app_auth_select_own"
    ON public.github_app_authorizations
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- DELETE policy: Authenticated users can disconnect their own authorization
DROP POLICY IF EXISTS "github_app_auth_delete_own" ON public.github_app_authorizations;
CREATE POLICY "github_app_auth_delete_own"
    ON public.github_app_authorizations
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- INSERT and UPDATE are restricted to service_role (Edge Functions) to prevent client-side credential injection


-- 2. OAuth State Verification Table (Single-use, short-lived PKCE exchange)
CREATE TABLE IF NOT EXISTS public.github_app_oauth_states (
    state TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code_verifier TEXT NOT NULL,
    return_path TEXT NOT NULL DEFAULT '/app',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Index on expiration for cleanup jobs
CREATE INDEX IF NOT EXISTS idx_gh_app_oauth_states_expires ON public.github_app_oauth_states(expires_at);

-- Enable RLS
ALTER TABLE public.github_app_oauth_states ENABLE ROW LEVEL SECURITY;

-- Revoke all permissions from anon and PUBLIC
REVOKE ALL ON public.github_app_oauth_states FROM anon, PUBLIC;
GRANT SELECT, INSERT, DELETE ON public.github_app_oauth_states TO authenticated;
GRANT ALL ON public.github_app_oauth_states TO service_role;

-- SELECT policy: Authenticated user can read their own state
DROP POLICY IF EXISTS "github_app_oauth_state_select_own" ON public.github_app_oauth_states;
CREATE POLICY "github_app_oauth_state_select_own"
    ON public.github_app_oauth_states
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- INSERT policy: Authenticated user can initiate OAuth state bound to their own identity
DROP POLICY IF EXISTS "github_app_oauth_state_insert_own" ON public.github_app_oauth_states;
CREATE POLICY "github_app_oauth_state_insert_own"
    ON public.github_app_oauth_states
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- DELETE policy: Authenticated user can delete their consumed state
DROP POLICY IF EXISTS "github_app_oauth_state_delete_own" ON public.github_app_oauth_states;
CREATE POLICY "github_app_oauth_state_delete_own"
    ON public.github_app_oauth_states
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- 3. Secure Public Connection Metadata Function
-- Returns non-sensitive connection status without exposing encrypted token columns
CREATE OR REPLACE FUNCTION public.get_my_github_app_connection()
RETURNS TABLE (
    is_connected BOOLEAN,
    github_user_id BIGINT,
    github_username TEXT,
    token_expires_at TIMESTAMPTZ,
    installation_id BIGINT,
    scope TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        TRUE AS is_connected,
        a.github_user_id,
        a.github_username,
        a.token_expires_at,
        a.installation_id,
        a.scope
    FROM public.github_app_authorizations a
    WHERE a.user_id = auth.uid()
    ORDER BY a.updated_at DESC
    LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_github_app_connection() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_github_app_connection() TO authenticated, service_role;
