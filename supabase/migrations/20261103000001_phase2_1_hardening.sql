-- ============================================================================
-- GB CODER IDE — PHASE 2.1: DATABASE SECURITY & RLS HARDENING
-- ============================================================================
-- Migration: 20261103000001_phase2_1_hardening.sql
-- Description: Hardens Row Level Security, revokes broad UPDATE/DELETE permissions,
--              restricts column mutations to user-editable fields (display_name, avatar_url),
--              and hardens SECURITY DEFINER trigger functions with SET search_path = ''.
-- ============================================================================

-- 1. REVOKE broad UPDATE and DELETE on public.profiles from authenticated users
REVOKE UPDATE, DELETE ON public.profiles FROM authenticated;

-- 2. DROP DELETE policy (GB Coder Phase 2.1 does not support remote profile deletion)
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- 3. GRANT least-privilege column-level UPDATE on customizable fields only
-- Authenticated users cannot mutate 'id', 'github_username', 'email', or 'created_at'.
GRANT UPDATE (display_name, avatar_url, updated_at) ON public.profiles TO authenticated;

-- 4. HARDEN updated_at trigger function with strict search_path = ''
CREATE OR REPLACE FUNCTION public.handle_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now());
  RETURN NEW;
END;
$$;

-- 5. IMMUTABLE COLUMN INTEGRITY TRIGGER
-- Defense-in-depth: Prevents direct or indirect alteration of provider-managed columns.
CREATE OR REPLACE FUNCTION public.protect_immutable_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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

DROP TRIGGER IF EXISTS trg_protect_immutable_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_immutable_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_immutable_profile_fields();

-- 6. HARDEN handle_new_user() SECURITY DEFINER trigger function
-- Empty search_path prevents search_path hijacking; fully qualifies pg_catalog & public schemas.
-- Preserves existing user-customized display_name on conflict.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    display_name,
    avatar_url,
    github_username,
    email,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    pg_catalog.coalesce(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'preferred_username',
      pg_catalog.split_part(NEW.email, '@', 1),
      'GB Coder User'
    ),
    pg_catalog.coalesce(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    pg_catalog.coalesce(
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'preferred_username'
    ),
    NEW.email,
    pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now()),
    pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now())
  )
  ON CONFLICT (id) DO UPDATE SET
    -- Do not overwrite user-chosen display_name or avatar_url with OAuth defaults on re-login
    display_name = pg_catalog.coalesce(public.profiles.display_name, EXCLUDED.display_name),
    avatar_url = pg_catalog.coalesce(public.profiles.avatar_url, EXCLUDED.avatar_url),
    github_username = pg_catalog.coalesce(public.profiles.github_username, EXCLUDED.github_username),
    email = pg_catalog.coalesce(public.profiles.email, EXCLUDED.email),
    updated_at = pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now());
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Ensure user authentication creation is NEVER blocked by profile trigger
    RAISE WARNING 'handle_new_user provisioning notice for %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- Ensure trigger is attached to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

