-- ============================================================================
-- GB CODER IDE — PHASE 2.2: PRIVILEGE HARDENING & INSERT PROTECTION
-- ============================================================================
-- Migration: 20261103000002_phase2_2_privilege_hardening.sql
-- Description:
-- 1. Revokes broad INSERT on public.profiles and restricts INSERT strictly to
--    user-editable columns (id, display_name, avatar_url).
-- 2. Revokes client UPDATE on updated_at so that timestamps cannot be forged
--    by clients; keeps handle_profiles_updated_at trigger authoritative.
-- 3. Implements sync_trusted_profile_metadata() trigger to ensure provider-managed
--    fields (github_username, email) and timestamps (created_at, updated_at) are
--    derived server-side from auth.users and the database clock.
-- 4. Converts helper triggers (handle_profiles_updated_at, protect_immutable_profile_fields)
--    from SECURITY DEFINER to SECURITY INVOKER following least-privilege principles.
-- 5. Restricts EXECUTE permissions on trigger functions.
-- ============================================================================

-- 1. REVOKE broad INSERT from authenticated and grant column-level least privilege
REVOKE INSERT ON public.profiles FROM authenticated;
GRANT INSERT (id, display_name, avatar_url) ON public.profiles TO authenticated;

-- 2. REVOKE client UPDATE on updated_at (clients can only update display_name and avatar_url)
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (display_name, avatar_url) ON public.profiles TO authenticated;

-- 3. CONVERT handle_profiles_updated_at to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.handle_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now());
  RETURN NEW;
END;
$$;

-- 4. CONVERT protect_immutable_profile_fields to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.protect_immutable_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NEW.id <> OLD.id THEN
    RAISE EXCEPTION 'Cannot modify profile id (immutable primary key)';
  END IF;
  IF NEW.github_username IS DISTINCT FROM OLD.github_username AND OLD.github_username IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot modify github_username; managed by identity provider';
  END IF;
  IF NEW.email IS DISTINCT FROM OLD.email AND OLD.email IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot modify email; managed by identity provider';
  END IF;
  IF NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Cannot modify created_at timestamp';
  END IF;
  RETURN NEW;
END;
$$;

-- 5. TRUSTED SERVER-SIDE METADATA & TIMESTAMP ENFORCEMENT ON INSERT
-- Prevents client from forging provider identity or timestamps during direct INSERT.
CREATE OR REPLACE FUNCTION public.sync_trusted_profile_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_email pg_catalog.text;
  v_meta jsonb;
BEGIN
  -- Always enforce authoritative database timestamps
  NEW.created_at := pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now());
  NEW.updated_at := pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now());

  -- Look up authoritative user details from auth.users
  SELECT u.email, u.raw_user_meta_data
  INTO v_user_email, v_meta
  FROM auth.users u
  WHERE u.id = NEW.id;

  -- Overwrite provider fields with authoritative server-side values from auth.users
  IF v_user_email IS NOT NULL THEN
    NEW.email := v_user_email;
  END IF;

  IF v_meta IS NOT NULL THEN
    NEW.github_username := pg_catalog.coalesce(
      v_meta->>'user_name',
      v_meta->>'preferred_username'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_trusted_profile_metadata ON public.profiles;
CREATE TRIGGER trg_sync_trusted_profile_metadata
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_trusted_profile_metadata();

-- 6. RESTRICT FUNCTION EXECUTION PRIVILEGES (Defense against PostgREST RPC exposure)
REVOKE EXECUTE ON FUNCTION public.sync_trusted_profile_metadata() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_trusted_profile_metadata() TO authenticated, service_role;

