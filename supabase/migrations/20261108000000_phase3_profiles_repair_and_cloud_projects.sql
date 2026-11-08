-- ============================================================================
-- GB CODER IDE — PHASE 3: PROFILE REPAIR, CLOUD PROJECTS & STORAGE ISOLATION
-- ============================================================================
-- Migration: 20261108000000_phase3_profiles_repair_and_cloud_projects.sql
-- Description:
-- 1. Idempotently repairs/backfills missing rows in public.profiles for all
--    users present in auth.users.
-- 2. Provides robust handle_new_user() trigger and an authenticated self-repair
--    function (public.repair_my_profile) to ensure zero silent profile loss.
-- 3. Creates public.cloud_projects table with strict ownership RLS.
-- 4. Creates private storage bucket 'gb-coder-projects' with folder-based
--    ownership RLS policies (auth.uid() folder boundary).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PART 1: PROFILE REPAIR & IDEMPOTENT BACKFILL
-- ----------------------------------------------------------------------------

-- Ensure public.profiles exists and has proper types
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  github_username TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure sync_trusted_profile_metadata trigger function uses standard COALESCE
-- to prevent syntax error 42883 if attached from earlier Phase 2 migrations.
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
  NEW.created_at := pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now());
  NEW.updated_at := pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now());

  SELECT u.email, u.raw_user_meta_data
  INTO v_user_email, v_meta
  FROM auth.users u
  WHERE u.id = NEW.id;

  IF v_user_email IS NOT NULL THEN
    NEW.email := v_user_email;
  END IF;

  IF v_meta IS NOT NULL THEN
    NEW.github_username := COALESCE(
      v_meta->>'user_name',
      v_meta->>'preferred_username'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Backfill missing profiles for existing auth.users
INSERT INTO public.profiles (
  id,
  display_name,
  avatar_url,
  github_username,
  email,
  created_at,
  updated_at
)
SELECT
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    u.raw_user_meta_data->>'user_name',
    u.raw_user_meta_data->>'preferred_username',
    pg_catalog.split_part(u.email, '@', 1),
    'GB Coder User'
  ),
  COALESCE(
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture'
  ),
  COALESCE(
    u.raw_user_meta_data->>'user_name',
    u.raw_user_meta_data->>'preferred_username'
  ),
  u.email,
  COALESCE(u.created_at, pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now())),
  pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now())
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO UPDATE SET
  github_username = COALESCE(public.profiles.github_username, EXCLUDED.github_username),
  email = COALESCE(public.profiles.email, EXCLUDED.email),
  updated_at = pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now());

-- Robust SECURITY DEFINER trigger function for auth.users
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
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'preferred_username',
      pg_catalog.split_part(NEW.email, '@', 1),
      'GB Coder User'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'preferred_username'
    ),
    NEW.email,
    pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now()),
    pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now())
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    github_username = COALESCE(public.profiles.github_username, EXCLUDED.github_username),
    email = COALESCE(public.profiles.email, EXCLUDED.email),
    updated_at = pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now());
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user notice for %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Authenticated self-repair RPC: public.repair_my_profile()
CREATE OR REPLACE FUNCTION public.repair_my_profile()
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid pg_catalog.uuid := auth.uid();
  v_user auth.users%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE id = v_uid;
  IF FOUND THEN
    RETURN v_profile;
  END IF;

  SELECT * INTO v_user FROM auth.users WHERE id = v_uid;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User account not found';
  END IF;

  INSERT INTO public.profiles (
    id, display_name, avatar_url, github_username, email, created_at, updated_at
  ) VALUES (
    v_uid,
    COALESCE(
      v_user.raw_user_meta_data->>'full_name',
      v_user.raw_user_meta_data->>'name',
      v_user.raw_user_meta_data->>'user_name',
      v_user.raw_user_meta_data->>'preferred_username',
      pg_catalog.split_part(v_user.email, '@', 1),
      'GB Coder User'
    ),
    COALESCE(
      v_user.raw_user_meta_data->>'avatar_url',
      v_user.raw_user_meta_data->>'picture'
    ),
    COALESCE(
      v_user.raw_user_meta_data->>'user_name',
      v_user.raw_user_meta_data->>'preferred_username'
    ),
    v_user.email,
    pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now()),
    pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now())
  )
  RETURNING * INTO v_profile;

  RETURN v_profile;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.repair_my_profile() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.repair_my_profile() FROM anon;
GRANT EXECUTE ON FUNCTION public.repair_my_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.repair_my_profile() TO service_role;

-- ----------------------------------------------------------------------------
-- PART 2: CLOUD PROJECTS SCHEMA & ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.cloud_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  description TEXT DEFAULT '' NOT NULL,
  project_type TEXT NOT NULL CHECK (project_type IN ('plain', 'react', 'vue')),
  editor_style TEXT NOT NULL CHECK (editor_style IN ('plain', 'vscode')),
  source_provider TEXT NOT NULL DEFAULT 'local' CHECK (source_provider IN ('local', 'github')),
  source_repo_full_name TEXT,
  source_repo_id BIGINT,
  source_branch TEXT,
  cloud_revision INTEGER NOT NULL DEFAULT 1 CHECK (cloud_revision >= 1),
  storage_path TEXT NOT NULL,
  file_count INTEGER NOT NULL DEFAULT 0 CHECK (file_count >= 0),
  entry TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performant user queries
CREATE INDEX IF NOT EXISTS cloud_projects_owner_id_idx ON public.cloud_projects(owner_id);
CREATE INDEX IF NOT EXISTS cloud_projects_owner_updated_idx ON public.cloud_projects(owner_id, updated_at DESC);

-- Updated_at trigger
DROP TRIGGER IF EXISTS on_cloud_projects_updated ON public.cloud_projects;
CREATE TRIGGER on_cloud_projects_updated
  BEFORE UPDATE ON public.cloud_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profiles_updated_at();

-- Enable Row Level Security
ALTER TABLE public.cloud_projects ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.cloud_projects FROM PUBLIC;
REVOKE ALL ON public.cloud_projects FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cloud_projects TO authenticated;
GRANT ALL ON public.cloud_projects TO service_role;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own cloud projects" ON public.cloud_projects;
CREATE POLICY "Users can view own cloud projects"
  ON public.cloud_projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert own cloud projects" ON public.cloud_projects;
CREATE POLICY "Users can insert own cloud projects"
  ON public.cloud_projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update own cloud projects" ON public.cloud_projects;
CREATE POLICY "Users can update own cloud projects"
  ON public.cloud_projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete own cloud projects" ON public.cloud_projects;
CREATE POLICY "Users can delete own cloud projects"
  ON public.cloud_projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- PART 3: STORAGE BUCKET & ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------

-- Ensure private storage bucket 'gb-coder-projects' exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gb-coder-projects',
  'gb-coder-projects',
  false,
  52428800, -- 50MB
  ARRAY['application/json', 'application/zip', 'application/octet-stream', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800;

-- Storage RLS Policies: enforce user folder isolation: <owner_id>/<project_id>/<filename>
DROP POLICY IF EXISTS "Users can read own project objects" ON storage.objects;
CREATE POLICY "Users can read own project objects"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'gb-coder-projects'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can upload own project objects" ON storage.objects;
CREATE POLICY "Users can upload own project objects"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'gb-coder-projects'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own project objects" ON storage.objects;
CREATE POLICY "Users can update own project objects"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'gb-coder-projects'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'gb-coder-projects'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own project objects" ON storage.objects;
CREATE POLICY "Users can delete own project objects"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'gb-coder-projects'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

