/**
 * GB Coder Phase 3 — Comprehensive GitHub Integration, Cloud Projects & Profile Repair Suite
 *
 * Test Suites:
 * - R01-R08: Stage A — Profile Repair, Backfill Query, RPC & Persistence Status
 * - C01-C10: Stage B — Supabase Cloud Project Schema, Storage Bucket & Operation-Specific RLS
 * - S01-S09: Stage C — Local-First Cloud Sync, Revisions & Conflict Handling
 * - G01-G08: Stage D/E/F — GitHub Repository Integration, Browser, Scopes & Creation
 *
 * Usage: node scripts/phase3-tests.mjs
 */
import { describe, test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const cwd = process.cwd();

// Bundle TypeScript modules with esbuild to resolve extensionless imports in Node ESM
const outdir = join(cwd, '.tmp-phase3-test');
mkdirSync(outdir, { recursive: true });
const bundlePath = join(outdir, 'phase3-bundle.mjs');

await build({
  stdin: {
    contents: `
      export * from './src/services/auth/supabaseClient.ts';
      export * from './src/services/auth/profileService.ts';
      export * from './src/services/projects/cloudProjectService.ts';
      export * from './src/utils/appRoutes.ts';
    `,
    resolveDir: cwd,
    loader: 'ts',
  },
  bundle: true,
  external: ['@supabase/supabase-js'],
  format: 'esm',
  platform: 'node',
  target: 'node20',
  outfile: bundlePath,
});

const {
  mapUserToProfileFields,
  getOrCreateProfile,
  getProfile,
  repairProfile,
  listCloudProjects,
  getCloudProject,
  createCloudProject,
  saveProjectToCloud,
  loadCloudProjectFiles,
  deleteCloudProject,
  uploadLocalProjectToCloud,
  CloudSyncConflictError,
  CLOUD_STORAGE_BUCKET,
  _setMockSupabaseClient,
  _resetSupabaseClient,
} = await import(pathToFileURL(bundlePath).href);

after(() => {
  try {
    rmSync(outdir, { recursive: true, force: true });
  } catch {}
});

describe('GB Coder Phase 3 — GitHub Repository Integration & Private Cloud Storage Suite', () => {
  // =========================================================================
  // SUITE 1: STAGE A — PROFILE REPAIR, BACKFILL & PERSISTENCE (R01 - R08)
  // =========================================================================
  describe('Stage A: Profile Repair, Backfill Query & Persistence Diagnostics (R01 - R08)', () => {
    const migrationPath = join(
      cwd,
      'supabase/migrations/20261108000000_phase3_profiles_repair_and_cloud_projects.sql',
    );

    test('R01 — Forward migration exists and contains idempotent backfill query', () => {
      assert.strictEqual(existsSync(migrationPath), true, 'Phase 3 forward migration must exist');
      const sql = readFileSync(migrationPath, 'utf8');

      // Verify idempotent backfill from auth.users to public.profiles
      assert.ok(sql.includes('INSERT INTO public.profiles'), 'Migration must insert into public.profiles');
      assert.ok(sql.includes('FROM auth.users u'), 'Migration must read from auth.users');
      assert.ok(sql.includes('LEFT JOIN public.profiles p ON p.id = u.id'), 'Migration must left join existing profiles');
      assert.ok(sql.includes('WHERE p.id IS NULL'), 'Migration must target users missing profiles');
      assert.ok(sql.includes('ON CONFLICT (id) DO UPDATE'), 'Migration backfill must be idempotent');
    });

    test('R02 — Backfill query maps full_name, avatar_url, github_username, and email', () => {
      const sql = readFileSync(migrationPath, 'utf8');
      assert.ok(sql.includes("u.raw_user_meta_data->>'full_name'"), 'Maps full_name');
      assert.ok(sql.includes("u.raw_user_meta_data->>'avatar_url'"), 'Maps avatar_url');
      assert.ok(sql.includes("u.raw_user_meta_data->>'user_name'"), 'Maps user_name / github_username');
      assert.ok(sql.includes('u.email'), 'Maps email');
    });

    test('R03 — handle_new_user() SECURITY DEFINER with SET search_path = \'\'', () => {
      const sql = readFileSync(migrationPath, 'utf8');
      assert.ok(sql.includes('CREATE OR REPLACE FUNCTION public.handle_new_user()'));
      assert.ok(sql.includes('SECURITY DEFINER'));
      assert.ok(sql.includes("SET search_path = ''"));
      assert.ok(sql.includes('pg_catalog.coalesce'));
    });

    test('R04 — repair_my_profile() RPC with auth.uid() authorization check', () => {
      const sql = readFileSync(migrationPath, 'utf8');
      assert.ok(sql.includes('CREATE OR REPLACE FUNCTION public.repair_my_profile()'));
      assert.ok(sql.includes('v_uid pg_catalog.uuid := auth.uid()'));
      assert.ok(sql.includes("IF v_uid IS NULL THEN"));
      assert.ok(sql.includes("RAISE EXCEPTION 'Not authenticated'"));
    });

    test('R05 — repair_my_profile() execution privileges granted strictly to authenticated', () => {
      const sql = readFileSync(migrationPath, 'utf8');
      assert.ok(sql.includes('REVOKE EXECUTE ON FUNCTION public.repair_my_profile() FROM PUBLIC'));
      assert.ok(sql.includes('REVOKE EXECUTE ON FUNCTION public.repair_my_profile() FROM anon'));
      assert.ok(sql.includes('GRANT EXECUTE ON FUNCTION public.repair_my_profile() TO authenticated'));
      assert.ok(sql.includes('GRANT EXECUTE ON FUNCTION public.repair_my_profile() TO service_role'));
    });

    test('R06 — profileService getProfile reports is_persistent: true for verified record', async () => {
      const mockClient = {
        from: (table) => {
          assert.strictEqual(table, 'profiles');
          return {
            select: () => ({
              eq: (col, val) => {
                assert.strictEqual(col, 'id');
                assert.strictEqual(val, 'usr-test-persistent');
                return {
                  maybeSingle: async () => ({
                    data: {
                      id: 'usr-test-persistent',
                      display_name: 'Verified User',
                      avatar_url: 'https://avatar.png',
                      github_username: 'verified_gh',
                      email: 'verified@example.com',
                    },
                    error: null,
                  }),
                };
              },
            }),
          };
        },
      };

      _setMockSupabaseClient(mockClient);
      const res = await getProfile('usr-test-persistent');
      assert.ok(res);
      assert.strictEqual(res.is_persistent, true, 'Verified database profile must report is_persistent: true');
      assert.strictEqual(res.sync_error, null);
    });

    test('R07 — profileService getOrCreateProfile reports is_persistent: false with sync_error on DB failure', async () => {
      const mockClient = {
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: { message: 'Database unreachable' } }),
            }),
          }),
          upsert: () => ({
            select: () => ({
              single: async () => ({ data: null, error: { message: 'Permission denied for table profiles' } }),
            }),
          }),
        }),
      };

      _setMockSupabaseClient(mockClient);
      const fakeUser = {
        id: 'usr-offline-01',
        email: 'offline@ladestack.in',
        user_metadata: { user_name: 'offlinedev' },
      };

      const res = await getOrCreateProfile(fakeUser);
      assert.ok(res);
      assert.strictEqual(res.is_persistent, false, 'Failed DB insert must honestly report is_persistent: false');
      assert.strictEqual(res.sync_error, 'Permission denied for table profiles');
      assert.strictEqual(res.display_name, 'offlinedev');
    });

    test('R08 — AuthContext exports isProfilePersistent, profileSyncError, and repairProfile', () => {
      const authContextCode = readFileSync(join(cwd, 'src/features/auth/AuthContext.tsx'), 'utf8');
      assert.ok(authContextCode.includes('isProfilePersistent: boolean;'));
      assert.ok(authContextCode.includes('profileSyncError: string | null;'));
      assert.ok(authContextCode.includes('repairProfile: () => Promise<void>;'));
    });
  });

  // =========================================================================
  // SUITE 2: STAGE B — CLOUD PROJECTS SCHEMA & STORAGE RLS (C01 - C10)
  // =========================================================================
  describe('Stage B: Supabase Cloud Project Schema, Storage & Operation-Specific RLS (C01 - C10)', () => {
    const migrationPath = join(
      cwd,
      'supabase/migrations/20261108000000_phase3_profiles_repair_and_cloud_projects.sql',
    );
    const sql = readFileSync(migrationPath, 'utf8');

    test('C01 — public.cloud_projects table definition and constraints', () => {
      assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.cloud_projects'));
      assert.ok(sql.includes("project_type TEXT NOT NULL CHECK (project_type IN ('plain', 'react', 'vue'))"));
      assert.ok(sql.includes("editor_style TEXT NOT NULL CHECK (editor_style IN ('plain', 'vscode'))"));
      assert.ok(sql.includes("source_provider TEXT NOT NULL DEFAULT 'local'"));
      assert.ok(sql.includes('cloud_revision INTEGER NOT NULL DEFAULT 1'));
      assert.ok(sql.includes('storage_path TEXT NOT NULL'));
    });

    test('C02 — cloud_projects owner_id foreign key references auth.users with CASCADE', () => {
      assert.ok(sql.includes('owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE'));
    });

    test('C03 — High performance indexes on owner_id and (owner_id, updated_at DESC)', () => {
      assert.ok(sql.includes('CREATE INDEX IF NOT EXISTS cloud_projects_owner_id_idx'));
      assert.ok(sql.includes('CREATE INDEX IF NOT EXISTS cloud_projects_owner_updated_idx'));
    });

    test('C04 — Row Level Security enabled on public.cloud_projects', () => {
      assert.ok(sql.includes('ALTER TABLE public.cloud_projects ENABLE ROW LEVEL SECURITY'));
    });

    test('C05 — Revocation from anon and PUBLIC, granted to authenticated and service_role', () => {
      assert.ok(sql.includes('REVOKE ALL ON public.cloud_projects FROM PUBLIC'));
      assert.ok(sql.includes('REVOKE ALL ON public.cloud_projects FROM anon'));
      assert.ok(sql.includes('GRANT SELECT, INSERT, UPDATE, DELETE ON public.cloud_projects TO authenticated'));
      assert.ok(sql.includes('GRANT ALL ON public.cloud_projects TO service_role'));
    });

    test('C06 — Operation-specific RLS policies on public.cloud_projects (SELECT, INSERT, UPDATE, DELETE)', () => {
      assert.ok(sql.includes('CREATE POLICY "Users can view own cloud projects"'));
      assert.ok(sql.includes('USING (auth.uid() = owner_id)'));
      assert.ok(sql.includes('CREATE POLICY "Users can insert own cloud projects"'));
      assert.ok(sql.includes('WITH CHECK (auth.uid() = owner_id)'));
      assert.ok(sql.includes('CREATE POLICY "Users can update own cloud projects"'));
      assert.ok(sql.includes('CREATE POLICY "Users can delete own cloud projects"'));
    });

    test('C07 — Private storage bucket gb-coder-projects created with 50MB limit', () => {
      assert.ok(sql.includes("'gb-coder-projects'"));
      assert.ok(sql.includes('52428800')); // 50 MB
      assert.ok(sql.includes('public = false'));
    });

    test('C08 — Storage RLS enforces folder boundary: (storage.foldername(name))[1] = auth.uid()::text', () => {
      assert.ok(sql.includes("(storage.foldername(name))[1] = auth.uid()::text"));
      assert.ok(sql.includes("bucket_id = 'gb-coder-projects'"));
    });

    test('C09 — Storage RLS policies cover all operations: SELECT, INSERT, UPDATE, DELETE', () => {
      assert.ok(sql.includes('CREATE POLICY "Users can read own project objects"'));
      assert.ok(sql.includes('CREATE POLICY "Users can upload own project objects"'));
      assert.ok(sql.includes('CREATE POLICY "Users can update own project objects"'));
      assert.ok(sql.includes('CREATE POLICY "Users can delete own project objects"'));
    });

    test('C10 — cloudProjectService constants and bucket isolation contract', () => {
      assert.strictEqual(CLOUD_STORAGE_BUCKET, 'gb-coder-projects');
    });
  });

  // =========================================================================
  // SUITE 3: STAGE C — LOCAL-FIRST CLOUD SYNC & REVISIONS (S01 - S09)
  // =========================================================================
  describe('Stage C: Local-First Cloud Sync, Revisions & Conflict Handling (S01 - S09)', () => {
    test('S01 — listCloudProjects queries user projects ordered by updated_at desc', async () => {
      let orderCol = null;
      let orderAsc = null;
      const mockClient = {
        from: (table) => {
          assert.strictEqual(table, 'cloud_projects');
          return {
            select: () => ({
              order: (col, opts) => {
                orderCol = col;
                orderAsc = opts.ascending;
                return Promise.resolve({
                  data: [
                    { id: 'cp-1', name: 'Cloud App 1', updated_at: '2026-11-08T10:00:00Z' },
                    { id: 'cp-2', name: 'Cloud App 2', updated_at: '2026-11-08T09:00:00Z' },
                  ],
                  error: null,
                });
              },
            }),
          };
        },
      };

      _setMockSupabaseClient(mockClient);
      const list = await listCloudProjects();
      assert.strictEqual(list.length, 2);
      assert.strictEqual(orderCol, 'updated_at');
      assert.strictEqual(orderAsc, false);
    });

    test('S02 — createCloudProject stores snapshot under owner_id/projectId/snapshot.json', async () => {
      let uploadedBucket = null;
      let uploadedPath = null;
      let insertedPayload = null;

      const mockClient = {
        auth: {
          getSession: async () => ({
            data: { session: { user: { id: 'usr-owner-uuid-123' } } },
          }),
        },
        storage: {
          from: (bucket) => {
            uploadedBucket = bucket;
            return {
              upload: async (path, blob) => {
                uploadedPath = path;
                assert.ok(blob);
                return { data: { path }, error: null };
              },
            };
          },
        },
        from: (table) => {
          assert.strictEqual(table, 'cloud_projects');
          return {
            insert: (payload) => {
              insertedPayload = payload;
              return {
                select: () => ({
                  single: async () => ({ data: { ...payload, id: payload.id }, error: null }),
                }),
              };
            },
          };
        },
      };

      _setMockSupabaseClient(mockClient);
      const record = await createCloudProject({
        name: 'My New Cloud Project',
        project_type: 'react',
        editor_style: 'vscode',
        files: [
          { path: 'index.html', content: '<h1>Hello</h1>', language: 'html' },
          { path: 'src/main.tsx', content: 'console.log()', language: 'typescript' },
        ],
      });

      assert.ok(record);
      assert.strictEqual(uploadedBucket, 'gb-coder-projects');
      assert.ok(uploadedPath.startsWith('usr-owner-uuid-123/'));
      assert.ok(uploadedPath.endsWith('/snapshot.json'));
      assert.strictEqual(insertedPayload.owner_id, 'usr-owner-uuid-123');
      assert.strictEqual(insertedPayload.file_count, 2);
      assert.strictEqual(insertedPayload.cloud_revision, 1);
    });

    test('S03 — saveProjectToCloud increments cloud_revision on successful save', async () => {
      let updatedRevision = null;
      const mockClient = {
        from: (table) => ({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  id: 'cp-rev-test',
                  owner_id: 'usr-1',
                  name: 'Rev Test',
                  project_type: 'react',
                  editor_style: 'vscode',
                  cloud_revision: 3,
                  storage_path: 'usr-1/cp-rev-test/snapshot.json',
                },
                error: null,
              }),
            }),
          }),
          update: (payload) => {
            updatedRevision = payload.cloud_revision;
            return {
              eq: () => ({
                select: () => ({
                  single: async () => ({
                    data: { id: 'cp-rev-test', cloud_revision: updatedRevision },
                    error: null,
                  }),
                }),
              }),
            };
          },
        }),
        storage: {
          from: () => ({
            upload: async () => ({ data: {}, error: null }),
          }),
        },
      };

      _setMockSupabaseClient(mockClient);
      const updated = await saveProjectToCloud('cp-rev-test', [
        { path: 'index.html', content: '<p>Updated</p>', language: 'html' },
      ]);

      assert.strictEqual(updatedRevision, 4, 'Revision must increment from 3 to 4');
    });

    test('S04 — saveProjectToCloud throws CloudSyncConflictError on revision divergence', async () => {
      const mockClient = {
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  id: 'cp-conflict-test',
                  cloud_revision: 5,
                  storage_path: 'usr-1/cp-conflict-test/snapshot.json',
                },
                error: null,
              }),
            }),
          }),
        }),
      };

      _setMockSupabaseClient(mockClient);
      await assert.rejects(
        async () => {
          await saveProjectToCloud(
            'cp-conflict-test',
            [{ path: 'index.html', content: '<p>Edit</p>', language: 'html' }],
            { expectedRevision: 2 }, // Client thought it was at revision 2, but cloud is at 5
          );
        },
        (err) => {
          assert.ok(err instanceof CloudSyncConflictError);
          assert.strictEqual(err.currentRevision, 5);
          assert.strictEqual(err.expectedRevision, 2);
          return true;
        },
      );
    });

    test('S05 — uploadLocalProjectToCloud packages local ProjectRecord into cloud project', async () => {
      let createdName = null;
      const mockClient = {
        auth: {
          getSession: async () => ({
            data: { session: { user: { id: 'usr-local-uploader' } } },
          }),
        },
        storage: {
          from: () => ({
            upload: async () => ({ data: {}, error: null }),
          }),
        },
        from: () => ({
          insert: (payload) => {
            createdName = payload.name;
            return {
              select: () => ({
                single: async () => ({ data: { ...payload, id: payload.id }, error: null }),
              }),
            };
          },
        }),
      };

      _setMockSupabaseClient(mockClient);
      const localProject = {
        id: 'local-123',
        name: 'My Offline App',
        createdAt: Date.now(),
        lastOpenedAt: Date.now(),
        editorStyle: 'vscode',
        projectType: 'react',
        fileCount: 1,
      };

      const result = await uploadLocalProjectToCloud(localProject, [
        { path: 'package.json', content: '{}', language: 'json' },
      ]);

      assert.strictEqual(createdName, 'My Offline App');
      assert.strictEqual(result.source_provider, 'local');
    });

    test('S06 — loadCloudProjectFiles downloads and parses snapshot', async () => {
      const snapshot = {
        version: 1,
        projectId: 'p-snap-1',
        name: 'Snapshot App',
        projectType: 'plain',
        editorStyle: 'vscode',
        files: [{ path: 'index.html', content: '<h1>Parsed</h1>', language: 'html' }],
        exportedAt: new Date().toISOString(),
      };

      const mockClient = {
        storage: {
          from: (bucket) => {
            assert.strictEqual(bucket, 'gb-coder-projects');
            return {
              download: async () => ({
                data: {
                  text: async () => JSON.stringify(snapshot),
                },
                error: null,
              }),
            };
          },
        },
      };

      _setMockSupabaseClient(mockClient);
      const { files, entry } = await loadCloudProjectFiles('usr/p-snap-1/snapshot.json');
      assert.strictEqual(files.length, 1);
      assert.strictEqual(files[0].path, 'index.html');
      assert.strictEqual(entry, 'index.html');
    });

    test('S07 — deleteCloudProject removes storage snapshot and PostgreSQL metadata', async () => {
      let removedPath = null;
      let deletedId = null;

      const mockClient = {
        from: (table) => {
          assert.strictEqual(table, 'cloud_projects');
          return {
            delete: () => ({
              eq: (col, val) => {
                assert.strictEqual(col, 'id');
                deletedId = val;
                return Promise.resolve({ error: null });
              },
            }),
          };
        },
        storage: {
          from: () => ({
            remove: async (paths) => {
              removedPath = paths[0];
              return { data: paths, error: null };
            },
          }),
        },
      };

      _setMockSupabaseClient(mockClient);
      const ok = await deleteCloudProject('del-proj-1', 'usr/del-proj-1/snapshot.json');
      assert.strictEqual(ok, true);
      assert.strictEqual(removedPath, 'usr/del-proj-1/snapshot.json');
      assert.strictEqual(deletedId, 'del-proj-1');
    });

    test('S08 — ProjectDashboard provides dual tabs: Local Projects and Private Cloud', () => {
      const code = readFileSync(join(cwd, 'src/components/projects/ProjectDashboard.tsx'), 'utf8');
      assert.ok(code.includes('data-testid="tab-local-projects"'), 'Must have local projects tab');
      assert.ok(code.includes('data-testid="tab-cloud-projects"'), 'Must have cloud projects tab');
      assert.ok(code.includes('dashboard-save-cloud-btn-'), 'Must have Save to Cloud action on local cards');
      assert.ok(code.includes('Open in IDE'), 'Must have Open in IDE action on cloud cards');
    });

    test('S09 — Guest mode displays auth prompt for cloud projects without crashing', () => {
      const code = readFileSync(join(cwd, 'src/components/projects/ProjectDashboard.tsx'), 'utf8');
      assert.ok(code.includes('data-testid="cloud-auth-prompt"'));
      assert.ok(code.includes('Sign in with your GitHub account'));
    });
  });

  // =========================================================================
  // SUITE 4: STAGE D, E, F — GITHUB INTEGRATION, BROWSER & CREATION (G01 - G08)
  // =========================================================================
  describe('Stage D/E/F: GitHub Repository Integration, Browser, Scopes & Creation (G01 - G08)', () => {
    test('G01 — GitHub token secured via AES-GCM credentialStore with github key slot', () => {
      const syncModal = readFileSync(join(cwd, 'src/components/GitHubSyncModal.tsx'), 'utf8');
      const browserModal = readFileSync(
        join(cwd, 'src/components/github/GitHubRepoBrowserModal.tsx'),
        'utf8',
      );
      assert.ok(syncModal.includes("const TOKEN_ID = 'github';"));
      assert.ok(browserModal.includes("const GITHUB_TOKEN_ID = 'github';"));
    });

    test('G02 — GitHubRepoBrowserModal supports search and public/private filter tabs', () => {
      const code = readFileSync(
        join(cwd, 'src/components/github/GitHubRepoBrowserModal.tsx'),
        'utf8',
      );
      assert.ok(code.includes('data-testid="github-repo-list"'));
      assert.ok(code.includes("setFilterType('all')"));
      assert.ok(code.includes("setFilterType('public')"));
      assert.ok(code.includes("setFilterType('private')"));
    });

    test('G03 — GitHubRepoBrowserModal supports dynamic branch selection', () => {
      const code = readFileSync(
        join(cwd, 'src/components/github/GitHubRepoBrowserModal.tsx'),
        'utf8',
      );
      assert.ok(code.includes('id="github-branch-select"'));
      assert.ok(code.includes('listBranches'));
      assert.ok(code.includes('selectedBranch'));
    });

    test('G04 — GitHubRepoBrowserModal supports dual import destinations (Local vs Cloud)', () => {
      const code = readFileSync(
        join(cwd, 'src/components/github/GitHubRepoBrowserModal.tsx'),
        'utf8',
      );
      assert.ok(code.includes("setImportDestination('local')"));
      assert.ok(code.includes("setImportDestination('cloud')"));
      assert.ok(code.includes('createCloudProject'));
      assert.ok(code.includes('createProject'));
    });

    test('G05 — GitHubCreateRepoModal requires explicit user confirmation checkbox', () => {
      const code = readFileSync(
        join(cwd, 'src/components/github/GitHubCreateRepoModal.tsx'),
        'utf8',
      );
      assert.ok(code.includes('data-testid="create-repo-confirm-checkbox"'));
      assert.ok(code.includes('Please confirm repository creation before proceeding.'));
      assert.ok(code.includes('hasConfirmed'));
    });

    test('G06 — GitHubCreateRepoModal validates repository name and visibility', () => {
      const code = readFileSync(
        join(cwd, 'src/components/github/GitHubCreateRepoModal.tsx'),
        'utf8',
      );
      assert.ok(code.includes('data-testid="create-repo-name-input"'));
      assert.ok(code.includes("Repository name cannot be empty."));
      assert.ok(code.includes('isPrivate'));
    });

    test('G07 — Zero emoji enforcement across all Phase 3 files (Hard Rule)', () => {
      const phase3Files = [
        'supabase/migrations/20261108000000_phase3_profiles_repair_and_cloud_projects.sql',
        'src/services/auth/profileService.ts',
        'src/services/projects/cloudProjectService.ts',
        'src/components/github/GitHubRepoBrowserModal.tsx',
        'src/components/github/GitHubCreateRepoModal.tsx',
        'src/components/projects/ProjectDashboard.tsx',
        'src/components/auth/UserAccountMenu.tsx',
        'src/components/auth/UserProfileModal.tsx',
      ];

      // Emoji regex
      const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

      for (const relPath of phase3Files) {
        const fullPath = join(cwd, relPath);
        if (existsSync(fullPath)) {
          const content = readFileSync(fullPath, 'utf8');
          assert.strictEqual(
            emojiRegex.test(content),
            false,
            `File ${relPath} violates the Zero Emoji rule!`,
          );
        }
      }
    });

    test('G08 — Security Boundaries: No service_role or secret keys leaked in frontend code', () => {
      const frontendFiles = [
        'src/services/auth/profileService.ts',
        'src/services/projects/cloudProjectService.ts',
        'src/components/github/GitHubRepoBrowserModal.tsx',
        'src/components/github/GitHubCreateRepoModal.tsx',
        'src/components/projects/ProjectDashboard.tsx',
      ];

      for (const relPath of frontendFiles) {
        const content = readFileSync(join(cwd, relPath), 'utf8');
        assert.strictEqual(
          content.includes('service_role'),
          false,
          `File ${relPath} must never contain service_role!`,
        );
        assert.strictEqual(
          content.includes('supabase_secret'),
          false,
          `File ${relPath} must never contain secret keys!`,
        );
      }
    });
  });
});
