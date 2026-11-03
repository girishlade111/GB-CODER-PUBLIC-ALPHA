-- ============================================================================
-- GB CODER IDE — PHASE 2.3: PRIVILEGED FUNCTION HARDENING & SCHEMA ISOLATION
-- ============================================================================
-- Migration: 20261103000003_phase2_3_privileged_functions_hardening.sql
-- Description:
-- 1. Creates an isolated 'private' schema not exposed to PostgREST.
-- 2. Revokes execution privileges on privileged trigger functions from PUBLIC,
--    anon, and authenticated roles to prevent unauthorized execution.
-- 3. Grants execution permissions exclusively to trusted maintenance roles
--    (service_role, postgres, and supabase_auth_admin if present).
-- 4. Ensures trigger references remain valid and authoritative without
--    introducing unnecessary public RPC exposure.
-- ============================================================================

-- 1. Create isolated schema not exposed to PostgREST
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
REVOKE ALL ON SCHEMA private FROM anon;
REVOKE ALL ON SCHEMA private FROM authenticated;
GRANT USAGE ON SCHEMA private TO service_role;
GRANT USAGE ON SCHEMA private TO postgres;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    EXECUTE 'GRANT USAGE ON SCHEMA private TO supabase_auth_admin';
  END IF;
END
$$;

-- 2. Explicitly revoke EXECUTE on public.handle_new_user from unprivileged roles
-- By default, PostgreSQL grants EXECUTE to PUBLIC on new functions.
-- Because handle_new_user is a SECURITY DEFINER trigger called exclusively
-- by auth.users on insert, unprivileged web clients must have no execution access.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
  ) THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres';
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
      EXECUTE 'GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin';
    END IF;
  END IF;
END
$$;

-- 3. Ensure public.sync_trusted_profile_metadata is revoked from PUBLIC and anon
-- Authenticated users require EXECUTE on sync_trusted_profile_metadata because it
-- executes as a BEFORE INSERT trigger when an authenticated user inserts their profile row.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'sync_trusted_profile_metadata'
  ) THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.sync_trusted_profile_metadata() FROM PUBLIC';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.sync_trusted_profile_metadata() FROM anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.sync_trusted_profile_metadata() TO authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.sync_trusted_profile_metadata() TO service_role';
  END IF;
END
$$;

