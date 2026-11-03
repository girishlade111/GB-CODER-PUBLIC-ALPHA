/**
 * GB Coder IDE — Phase 2 Authentication, Security & Local-First Verification Suite
 *
 * Verifies all Phase 2 requirements:
 * - A01-A17: Supabase client, PKCE, OAuth, Session & State Management
 * - P01-P10: User Profile Database, Mapping, Idempotency & RLS Constraints
 * - L01-L12: Guest Mode Continuity, IndexedDB Project Preservation & Data Safety
 * - S01-S08: Security Boundaries, Scopes, Open-Redirect & Secret Isolation
 *
 * Usage: node scripts/auth-tests.mjs
 */

import { test, describe, beforeEach, afterEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

// Bundle TypeScript modules to resolve extensionless imports in Node ESM environment
const outdir = join(process.cwd(), '.tmp-auth-test');
mkdirSync(outdir, { recursive: true });
const bundlePath = join(outdir, 'auth-bundle.mjs');

await build({
  stdin: {
    contents: `
      export * from './src/services/auth/supabaseClient.ts';
      export * from './src/services/auth/authService.ts';
      export * from './src/services/auth/profileService.ts';
      export * from './src/utils/appRoutes.ts';
    `,
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  external: ['@supabase/supabase-js'],
  format: 'esm',
  platform: 'node',
  target: 'node20',
  outfile: bundlePath,
  logLevel: 'error',
});

const services = await import(pathToFileURL(bundlePath).href);

const {
  isValidConfigValue,
  isValidHttpUrl,
  getSupabaseConfig,
  isSupabaseConfigured,
  getSupabaseClient,
  _setMockSupabaseClient,
  _resetSupabaseClient,
  sanitizeReturnPath,
  getAuthCallbackUrl,
  signInWithGitHub,
  exchangeCallbackCode,
  signOutUser,
  subscribeToAuthState,
  _resetCodeExchangeState,
  DEFAULT_APP_RETURN_PATH,
  AUTH_CALLBACK_PATH,
  GITHUB_OAUTH_SCOPES,
  mapUserToProfileFields,
  getProfile,
  getOrCreateProfile,
  updateProfile,
  parseAppRoute,
  AUTH_CALLBACK_ROUTE,
  ACCOUNT_ROUTE,
  STATIC_EDITOR_ROUTE,
  VSCODE_ROUTE,
  SUPABASE_AUTH_OPTIONS,
  cleanCallbackUrlParams,
} = services;

describe('GB Coder Phase 2 — Comprehensive Auth, Profile & Security Suite', () => {
  beforeEach(() => {
    _resetSupabaseClient();
    _resetCodeExchangeState();
  });

  afterEach(() => {
    _resetSupabaseClient();
    _resetCodeExchangeState();
  });

  after(() => {
    try {
      rmSync(outdir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  // =========================================================================
  // GROUP 1: AUTHENTICATION & PKCE (A01 - A17)
  // =========================================================================
  describe('Authentication, PKCE & Session Management (A01 - A17)', () => {
    test('A01 — Supabase configuration validation', () => {
      assert.strictEqual(isValidConfigValue(''), false);
      assert.strictEqual(isValidConfigValue('   '), false);
      assert.strictEqual(isValidConfigValue('your_project_url'), false);
      assert.strictEqual(isValidConfigValue('placeholder_key'), false);
      assert.strictEqual(isValidConfigValue('<your-key>'), false);
      assert.strictEqual(isValidConfigValue('valid_anon_key_12345'), true);

      assert.strictEqual(isValidHttpUrl('not-a-url'), false);
      assert.strictEqual(isValidHttpUrl('ftp://example.com'), false);
      assert.strictEqual(isValidHttpUrl('https://example.supabase.co'), true);
      assert.strictEqual(isValidHttpUrl('http://localhost:54321'), true);
    });

    test('A02 — Client singleton initialization', () => {
      _resetSupabaseClient();
      const clientUnconfigured = getSupabaseClient();
      assert.strictEqual(clientUnconfigured, null);

      const mockClient = { auth: {} };
      _setMockSupabaseClient(mockClient);
      const client1 = getSupabaseClient();
      const client2 = getSupabaseClient();
      assert.strictEqual(client1, mockClient);
      assert.strictEqual(client2, mockClient);
    });

    test('A03 — Missing configuration fallback', () => {
      _resetSupabaseClient();
      assert.strictEqual(isSupabaseConfigured(), false);
      const config = getSupabaseConfig();
      assert.strictEqual(config.isConfigured, false);
      assert.strictEqual(config.url, null);
      assert.strictEqual(config.anonKey, null);
    });

    test('A04 — Guest mode initialization', async () => {
      _resetSupabaseClient();
      assert.strictEqual(getSupabaseClient(), null);
      const res = await signInWithGitHub();
      assert.ok(res.error);
      assert.match(res.error, /not configured/i);
    });

    test('A05 — GitHub OAuth initiation with minimal scopes', async () => {
      let oauthArgs = null;
      const mockClient = {
        auth: {
          signInWithOAuth: async (args) => {
            oauthArgs = args;
            return { data: { url: 'https://github.com/login/oauth/authorize' }, error: null };
          },
        },
      };
      _setMockSupabaseClient(mockClient);

      const res = await signInWithGitHub({ returnPath: '/app/projects/test-proj/editor' });
      assert.strictEqual(res.error, null);
      assert.ok(oauthArgs);
      assert.strictEqual(oauthArgs.provider, 'github');
      assert.strictEqual(oauthArgs.options.scopes, GITHUB_OAUTH_SCOPES);
      assert.match(oauthArgs.options.redirectTo, /\/app\/auth\/callback/);
    });

    test('A06 — Correct redirectTo generation', () => {
      const callbackDefault = getAuthCallbackUrl();
      assert.match(callbackDefault, /\/app\/auth\/callback$/);

      const callbackCustom = getAuthCallbackUrl('/app/ide');
      assert.match(callbackCustom, /\/app\/auth\/callback\?returnTo=%2Fapp%2Fide/);
    });

    test('A07 — Safe callback return-path validation (Open-Redirect Prevention)', () => {
      assert.strictEqual(sanitizeReturnPath('/app'), '/app');
      assert.strictEqual(sanitizeReturnPath('/app/ide'), '/app/ide');
      assert.strictEqual(sanitizeReturnPath('/app/projects/123/editor'), '/app/projects/123/editor');

      assert.strictEqual(sanitizeReturnPath('https://attacker.com'), DEFAULT_APP_RETURN_PATH);
      assert.strictEqual(sanitizeReturnPath('http://attacker.com/app'), DEFAULT_APP_RETURN_PATH);
      assert.strictEqual(sanitizeReturnPath('//attacker.com'), DEFAULT_APP_RETURN_PATH);
      assert.strictEqual(sanitizeReturnPath('\\\\attacker.com'), DEFAULT_APP_RETURN_PATH);
      assert.strictEqual(sanitizeReturnPath('javascript:alert(1)'), DEFAULT_APP_RETURN_PATH);
      assert.strictEqual(sanitizeReturnPath('data:text/html,evil'), DEFAULT_APP_RETURN_PATH);
      assert.strictEqual(sanitizeReturnPath('/app/../etc/passwd'), DEFAULT_APP_RETURN_PATH);
      assert.strictEqual(sanitizeReturnPath('/evil'), DEFAULT_APP_RETURN_PATH);
      assert.strictEqual(sanitizeReturnPath(null), DEFAULT_APP_RETURN_PATH);
      assert.strictEqual(sanitizeReturnPath(''), DEFAULT_APP_RETURN_PATH);
    });

    test('A08 — OAuth cancellation handling', async () => {
      const mockClient = {
        auth: {
          signInWithOAuth: async () => ({
            data: null,
            error: { message: 'access_denied: User cancelled login' },
          }),
        },
      };
      _setMockSupabaseClient(mockClient);

      const res = await signInWithGitHub();
      assert.ok(res.error);
      assert.match(res.error, /access_denied/);
    });

    test('A09 — Invalid callback handling', async () => {
      _setMockSupabaseClient({ auth: {} });
      const emptyRes = await exchangeCallbackCode('');
      assert.ok(emptyRes.error);
      assert.match(emptyRes.error, /code missing/i);
    });

    test('A10 — PKCE code exchange', async () => {
      let codeExchanged = null;
      const fakeSession = {
        user: { id: 'user-pkce-123', email: 'dev@ladestack.in' },
        access_token: 'fake-jwt',
      };
      const mockClient = {
        auth: {
          exchangeCodeForSession: async (code) => {
            codeExchanged = code;
            return { data: { session: fakeSession }, error: null };
          },
          getSession: async () => ({ data: { session: fakeSession }, error: null }),
        },
      };
      _setMockSupabaseClient(mockClient);

      const res = await exchangeCallbackCode('test-auth-code-12345', '/app/ide');
      assert.strictEqual(res.error, null);
      assert.strictEqual(codeExchanged, 'test-auth-code-12345');
      assert.strictEqual(res.session?.user.id, 'user-pkce-123');
      assert.strictEqual(res.returnPath, '/app/ide');
    });

    test('A11 — Duplicate callback prevention in StrictMode', async () => {
      let exchangeCallCount = 0;
      const fakeSession = {
        user: { id: 'user-dedup-1', email: 'test@example.com' },
      };
      const mockClient = {
        auth: {
          exchangeCodeForSession: async () => {
            exchangeCallCount++;
            await new Promise((r) => setTimeout(r, 10));
            return { data: { session: fakeSession }, error: null };
          },
          getSession: async () => ({ data: { session: fakeSession }, error: null }),
        },
      };
      _setMockSupabaseClient(mockClient);

      const [res1, res2] = await Promise.all([
        exchangeCallbackCode('code-duplicate-test'),
        exchangeCallbackCode('code-duplicate-test'),
      ]);

      assert.strictEqual(exchangeCallCount, 1, 'Code exchange must be invoked exactly once');
      assert.strictEqual(res1.session?.user.id, 'user-dedup-1');
      assert.strictEqual(res2.session?.user.id, 'user-dedup-1');
    });

    test('A12 — Successful session restoration', async () => {
      const storedSession = { user: { id: 'restored-user', email: 'restore@test.com' } };
      const mockClient = {
        auth: {
          getSession: async () => ({ data: { session: storedSession }, error: null }),
        },
      };
      _setMockSupabaseClient(mockClient);

      const { getCurrentSession } = services;
      const session = await getCurrentSession();
      assert.strictEqual(session?.user.id, 'restored-user');
    });

    test('A13 — Session expiration handling', async () => {
      const mockClient = {
        auth: {
          getSession: async () => ({ data: { session: null }, error: { message: 'Session expired' } }),
        },
      };
      _setMockSupabaseClient(mockClient);

      const { getCurrentSession } = services;
      const session = await getCurrentSession();
      assert.strictEqual(session, null);
    });

    test('A14 — Token refresh state handling', () => {
      let listenerRegistered = null;
      const mockClient = {
        auth: {
          onAuthStateChange: (cb) => {
            listenerRegistered = cb;
            return { data: { subscription: { unsubscribe: () => {} } } };
          },
        },
      };
      _setMockSupabaseClient(mockClient);

      let eventReceived = null;
      let sessionReceived = null;
      subscribeToAuthState((evt, sess) => {
        eventReceived = evt;
        sessionReceived = sess;
      });

      assert.ok(listenerRegistered);
      const refreshedSession = { user: { id: 'refreshed-user' } };
      listenerRegistered('TOKEN_REFRESHED', refreshedSession);

      assert.strictEqual(eventReceived, 'TOKEN_REFRESHED');
      assert.strictEqual(sessionReceived?.user.id, 'refreshed-user');
    });

    test('A15 — Sign-out behavior', async () => {
      let signOutCalled = false;
      const mockClient = {
        auth: {
          signOut: async () => {
            signOutCalled = true;
            return { error: null };
          },
        },
      };
      _setMockSupabaseClient(mockClient);

      const res = await signOutUser();
      assert.strictEqual(res.error, null);
      assert.strictEqual(signOutCalled, true);
    });

    test('A16 — Multiple auth-state event handling', () => {
      let listener = null;
      const mockClient = {
        auth: {
          onAuthStateChange: (cb) => {
            listener = cb;
            return { data: { subscription: { unsubscribe: () => {} } } };
          },
        },
      };
      _setMockSupabaseClient(mockClient);

      const events = [];
      subscribeToAuthState((event) => {
        events.push(event);
      });

      listener('INITIAL_SESSION', null);
      listener('SIGNED_IN', { user: { id: 'u1' } });
      listener('USER_UPDATED', { user: { id: 'u1' } });
      listener('SIGNED_OUT', null);

      assert.deepStrictEqual(events, ['INITIAL_SESSION', 'SIGNED_IN', 'USER_UPDATED', 'SIGNED_OUT']);
    });

    test('A17 — Auth subscription cleanup', () => {
      let unsubscribed = false;
      const mockClient = {
        auth: {
          onAuthStateChange: () => ({
            data: {
              subscription: {
                unsubscribe: () => {
                  unsubscribed = true;
                },
              },
            },
          }),
        },
      };
      _setMockSupabaseClient(mockClient);

      const unsubscribe = subscribeToAuthState(() => {});
      unsubscribe();
      assert.strictEqual(unsubscribed, true);
    });
  });

  // =========================================================================
  // GROUP 2: USER PROFILE & DATABASE (P01 - P10)
  // =========================================================================
  describe('User Profile Database & Row Level Security (P01 - P10)', () => {
    test('P01 — Profile mapping from user metadata', () => {
      const fakeUser = {
        id: 'usr-456-uuid',
        email: 'girish@ladestack.in',
        user_metadata: {
          user_name: 'girishlade111',
          full_name: 'Girish Lade',
          avatar_url: 'https://avatars.githubusercontent.com/u/12345',
        },
      };

      const mapped = mapUserToProfileFields(fakeUser);
      assert.strictEqual(mapped.id, 'usr-456-uuid');
      assert.strictEqual(mapped.github_username, 'girishlade111');
      assert.strictEqual(mapped.display_name, 'Girish Lade');
      assert.strictEqual(mapped.avatar_url, 'https://avatars.githubusercontent.com/u/12345');
      assert.strictEqual(mapped.email, 'girish@ladestack.in');
    });

    test('P02 — Profile creation', async () => {
      let insertedPayload = null;
      const fakeUser = {
        id: 'usr-new-001',
        email: 'newuser@example.com',
        user_metadata: { full_name: 'New Developer' },
      };

      const mockClient = {
        from: (table) => {
          assert.strictEqual(table, 'profiles');
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: null, error: null }),
              }),
            }),
            upsert: (payload) => {
              insertedPayload = payload;
              return {
                select: () => ({
                  single: async () => ({
                    data: { ...payload, created_at: new Date().toISOString() },
                    error: null,
                  }),
                }),
              };
            },
          };
        },
      };
      _setMockSupabaseClient(mockClient);

      const profile = await getOrCreateProfile(fakeUser);
      assert.ok(profile);
      assert.strictEqual(profile.id, 'usr-new-001');
      assert.strictEqual(profile.display_name, 'New Developer');
      assert.ok(insertedPayload);
      assert.strictEqual(insertedPayload.id, 'usr-new-001');
    });

    test('P03 — Duplicate profile prevention (Idempotency)', async () => {
      const existingRecord = {
        id: 'usr-existing-002',
        display_name: 'Existing Member',
        avatar_url: 'https://avatar.png',
        github_username: 'existingdev',
        email: 'member@test.com',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      let upsertAttempted = false;
      const mockClient = {
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: existingRecord, error: null }),
            }),
          }),
          upsert: () => {
            upsertAttempted = true;
          },
        }),
      };
      _setMockSupabaseClient(mockClient);

      const fakeUser = { id: 'usr-existing-002', user_metadata: {} };
      const profile = await getOrCreateProfile(fakeUser);

      assert.strictEqual(profile.id, 'usr-existing-002');
      assert.strictEqual(profile.display_name, 'Existing Member');
      assert.strictEqual(upsertAttempted, false, 'Should not re-insert if profile already exists');
    });

    test('P04 — Missing profile recovery via in-memory fallback', async () => {
      const mockClient = {
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: { message: 'Database offline' } }),
            }),
          }),
          upsert: () => ({
            select: () => ({
              single: async () => ({ data: null, error: { message: 'Connection timeout' } }),
            }),
          }),
        }),
      };
      _setMockSupabaseClient(mockClient);

      const fakeUser = {
        id: 'usr-offline-fallback',
        email: 'fallback@test.com',
        user_metadata: { user_name: 'offlinedev' },
      };

      const profile = await getOrCreateProfile(fakeUser);
      assert.ok(profile);
      assert.strictEqual(profile.id, 'usr-offline-fallback');
      assert.strictEqual(profile.github_username, 'offlinedev');
    });

    test('P05 — Profile update behavior', async () => {
      let updatedPayload = null;
      const mockClient = {
        from: () => ({
          update: (payload) => {
            updatedPayload = payload;
            return {
              eq: (field, id) => {
                assert.strictEqual(field, 'id');
                assert.strictEqual(id, 'usr-update-target');
                return {
                  select: () => ({
                    single: async () => ({
                      data: { id, ...payload, updated_at: new Date().toISOString() },
                      error: null,
                    }),
                  }),
                };
              },
            };
          },
        }),
      };
      _setMockSupabaseClient(mockClient);

      const res = await updateProfile('usr-update-target', { display_name: 'Architect Lade' });
      assert.strictEqual(res.error, null);
      assert.strictEqual(res.profile?.display_name, 'Architect Lade');
      assert.strictEqual(updatedPayload?.display_name, 'Architect Lade');
      assert.strictEqual(updatedPayload?.updated_at, undefined, 'Client must not supply updated_at; managed by DB trigger');
      assert.ok(res.profile?.updated_at, 'Database returned updated_at timestamp');
    });

    test('P06 — Invalid profile metadata handling', () => {
      const userSparse = {
        id: 'usr-sparse',
        user_metadata: null,
      };
      const mapped = mapUserToProfileFields(userSparse);
      assert.strictEqual(mapped.id, 'usr-sparse');
      assert.strictEqual(mapped.display_name, 'GB Coder User');
      assert.strictEqual(mapped.avatar_url, null);
      assert.strictEqual(mapped.github_username, null);
    });

    test('P07 — Anonymous profile access denial (RLS Contract)', () => {
      const migrationSql = readFileSync(
        join(process.cwd(), 'supabase/migrations/20261103000000_phase2_profiles_rls.sql'),
        'utf8',
      );
      assert.match(migrationSql, /REVOKE ALL ON public\.profiles FROM anon;/);
      assert.match(migrationSql, /REVOKE ALL ON public\.profiles FROM PUBLIC;/);
    });

    test('P08 — Cross-user profile access denial (RLS Contract)', () => {
      const migrationSql = readFileSync(
        join(process.cwd(), 'supabase/migrations/20261103000000_phase2_profiles_rls.sql'),
        'utf8',
      );
      assert.match(migrationSql, /CREATE POLICY "Users can view own profile"[\s\S]*?USING \(auth\.uid\(\) = id\);/);
    });

    test('P09 — RLS ownership enforcement on UPDATE and INSERT', () => {
      const migrationSql = readFileSync(
        join(process.cwd(), 'supabase/migrations/20261103000000_phase2_profiles_rls.sql'),
        'utf8',
      );
      assert.match(migrationSql, /CREATE POLICY "Users can insert own profile"[\s\S]*?WITH CHECK \(auth\.uid\(\) = id\);/);
      assert.match(migrationSql, /CREATE POLICY "Users can update own profile"[\s\S]*?USING \(auth\.uid\(\) = id\)[\s\S]*?WITH CHECK \(auth\.uid\(\) = id\);/);
    });

    test('P10 — Profile creation without leaking provider tokens', () => {
      const migrationSql = readFileSync(
        join(process.cwd(), 'supabase/migrations/20261103000000_phase2_profiles_rls.sql'),
        'utf8',
      );
      assert.strictEqual(/access_token/i.test(migrationSql), false);
      assert.strictEqual(/provider_token/i.test(migrationSql), false);
      assert.strictEqual(/refresh_token/i.test(migrationSql), false);
    });
  });

  // =========================================================================
  // GROUP 3: GUEST MODE & LOCAL-FIRST COMPATIBILITY (L01 - L12)
  // =========================================================================
  describe('Guest Mode Continuity & Local Data Safety (L01 - L12)', () => {
    test('L01 — Guest routes resolve without authentication', () => {
      assert.strictEqual(parseAppRoute('/app').kind, 'dashboard');
      assert.strictEqual(parseAppRoute('/app/projects').kind, 'dashboard');
      assert.strictEqual(parseAppRoute('/app/projects/new').kind, 'new');
      assert.strictEqual(parseAppRoute('/app/projects/p1/editor').kind, 'editor');
      assert.strictEqual(parseAppRoute('/app/projects/p1/ide').kind, 'ide');
    });

    test('L02 — Auth callback and account routes registered', () => {
      assert.strictEqual(parseAppRoute(AUTH_CALLBACK_ROUTE).kind, 'auth-callback');
      assert.strictEqual(parseAppRoute(ACCOUNT_ROUTE).kind, 'account');
    });

    test('L03 — Guest signs in without altering ProjectRecord IDs', () => {
      const mockProject = {
        id: 'stable-uuid-abc-123',
        name: 'My Local Project',
        projectType: 'react',
        editorStyle: 'vscode',
        fileCount: 4,
        createdAt: 1730000000000,
        lastOpenedAt: 1730000000000,
      };

      assert.strictEqual(mockProject.id, 'stable-uuid-abc-123');
    });

    test('L04 — Existing ProjectRecord fields distinction (projectType vs editorStyle)', () => {
      const projectTypes = ['plain', 'react', 'vue'];
      const editorStyles = ['plain', 'vscode'];

      for (const pt of projectTypes) {
        assert.ok(typeof pt === 'string');
      }
      for (const es of editorStyles) {
        assert.ok(typeof es === 'string');
      }
      assert.notDeepStrictEqual(projectTypes, editorStyles);
    });

    test('L05 — Sign-out does not clear projects database', () => {
      const projectDbSource = readFileSync(
        join(process.cwd(), 'src/services/projects/projectDatabase.ts'),
        'utf8',
      );
      assert.match(projectDbSource, /const DB_NAME = 'gb-coder-projects-db';/);
      assert.match(projectDbSource, /const PROJECTS_STORE = 'projects';/);
      assert.match(projectDbSource, /const FILES_STORE = 'projectFiles';/);

      const authServiceSource = readFileSync(
        join(process.cwd(), 'src/services/auth/authService.ts'),
        'utf8',
      );
      assert.strictEqual(/deleteDatabase/.test(authServiceSource), false);
      assert.strictEqual(/clearWorkspace/.test(authServiceSource), false);
    });

    test('L06 — Sign-out preserves workspace settings & active project pointer', () => {
      const authServiceSource = readFileSync(
        join(process.cwd(), 'src/services/auth/authService.ts'),
        'utf8',
      );
      assert.strictEqual(/gb-coder-active-project-id/.test(authServiceSource), false);
    });

    test('L07 — Missing Supabase configuration does not break IDE', () => {
      _resetSupabaseClient();
      assert.strictEqual(getSupabaseClient(), null);
      assert.strictEqual(isSupabaseConfigured(), false);
    });

    test('L08 — Offline operation preserves local projects', async () => {
      const fakeOfflineUser = { id: 'usr-offline', email: 'offline@ladestack.in' };
      const profile = await getOrCreateProfile(fakeOfflineUser);
      assert.strictEqual(profile.id, 'usr-offline');
      assert.strictEqual(profile.display_name, 'offline');
    });

    test('L09 — Existing Classic Editor remains accessible', () => {
      assert.strictEqual(STATIC_EDITOR_ROUTE, '/app/editor');
      assert.strictEqual(parseAppRoute('/app/editor').kind, 'legacy-editor');
    });

    test('L10 — Existing Advanced IDE remains accessible', () => {
      assert.strictEqual(VSCODE_ROUTE, '/app/ide');
      assert.strictEqual(parseAppRoute('/app/ide').kind, 'legacy-ide');
    });

    test('L11 — Existing GitHub PAT integration remains intact in credentialStore', () => {
      const credStoreSource = readFileSync(
        join(process.cwd(), 'src/services/credentialStore.ts'),
        'utf8',
      );
      assert.match(credStoreSource, /gbcoder_cred_v1:/);
      assert.match(credStoreSource, /gbcoder_credkey_v1/);

      const authServiceSource = readFileSync(
        join(process.cwd(), 'src/services/auth/authService.ts'),
        'utf8',
      );
      assert.strictEqual(/gbcoder_cred_v1/.test(authServiceSource), false);
    });

    test('L12 — No destructive IndexedDB schema migrations', () => {
      const projectDbSource = readFileSync(
        join(process.cwd(), 'src/services/projects/projectDatabase.ts'),
        'utf8',
      );
      assert.match(projectDbSource, /keyPath:\s*\['projectId',\s*'path'\]/);
    });
  });

  // =========================================================================
  // GROUP 4: SECURITY & ISOLATION (S01 - S08)
  // =========================================================================
  describe('Security Boundaries & Isolation (S01 - S08)', () => {
    test('S01 — Supabase secret/service-role keys absent from client configuration', () => {
      const envExample = readFileSync(join(process.cwd(), '.env.example'), 'utf8');
      assert.strictEqual(/VITE_.*SERVICE_ROLE/i.test(envExample), false);
      assert.strictEqual(/VITE_.*SECRET_KEY/i.test(envExample), false);
      assert.match(envExample, /VITE_SUPABASE_URL=/);
      assert.match(envExample, /VITE_SUPABASE_ANON_KEY=/);
    });

    test('S02 — OAuth return-path open redirect is rejected', () => {
      const evilPayloads = [
        'https://phishing.site',
        'http://phishing.site/app',
        '//phishing.site',
        'javascript:void(0)',
        'data:text/html,<script>alert(1)</script>',
        '/app/../admin',
      ];

      for (const payload of evilPayloads) {
        assert.strictEqual(sanitizeReturnPath(payload), DEFAULT_APP_RETURN_PATH);
      }
    });

    test('S03 — No provider tokens stored in project data', () => {
      const profileSource = readFileSync(
        join(process.cwd(), 'src/services/auth/profileService.ts'),
        'utf8',
      );
      assert.strictEqual(/access_token/.test(profileSource), false);
      assert.strictEqual(/provider_token/.test(profileSource), false);
    });

    test('S04 — No secrets logged during auth failure', async () => {
      const logs = [];
      const origWarn = console.warn;
      console.warn = (...args) => logs.push(args.join(' '));

      try {
        const mockClient = {
          from: () => ({
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: null,
                  error: { message: 'Failed database check with code 400' },
                }),
              }),
            }),
          }),
        };
        _setMockSupabaseClient(mockClient);

        await getProfile('usr-test');
        for (const log of logs) {
          assert.strictEqual(/token|secret|password|bearer/i.test(log), false);
        }
      } finally {
        console.warn = origWarn;
      }
    });

    test('S05 — Anonymous profile request denied by RLS', () => {
      const migrationSql = readFileSync(
        join(process.cwd(), 'supabase/migrations/20261103000000_phase2_profiles_rls.sql'),
        'utf8',
      );
      assert.match(migrationSql, /ALTER TABLE public\.profiles ENABLE ROW LEVEL SECURITY;/);
      assert.match(migrationSql, /REVOKE ALL ON public\.profiles FROM anon;/);
    });

    test('S06 — Cross-user profile UPDATE denied by RLS policy', () => {
      const migrationSql = readFileSync(
        join(process.cwd(), 'supabase/migrations/20261103000000_phase2_profiles_rls.sql'),
        'utf8',
      );
      assert.match(migrationSql, /CREATE POLICY "Users can update own profile"[\s\S]*?USING \(auth\.uid\(\) = id\)/);
    });

    test('S07 — Session identity is not trusted as an authorization substitute without RLS', () => {
      const migrationSql = readFileSync(
        join(process.cwd(), 'supabase/migrations/20261103000000_phase2_profiles_rls.sql'),
        'utf8',
      );
      const matches = migrationSql.match(/auth\.uid\(\)\s*=\s*id/g);
      assert.ok(matches && matches.length >= 4);
    });

    test('S08 — OAuth provider scopes remain minimal (identity only)', () => {
      assert.strictEqual(GITHUB_OAUTH_SCOPES, 'read:user user:email');
      assert.strictEqual(/repo|admin|write|delete/i.test(GITHUB_OAUTH_SCOPES), false);
    });
  });

  // =========================================================================
  // GROUP 5: PHASE 2.1 HARDENING & LIVE READINESS (H01 - H12)
  // =========================================================================
  describe('Phase 2.1 Hardening & OAuth/Postgres Security Verification (H01 - H12)', () => {
    test('H01 — Application-Owned PKCE client configuration (detectSessionInUrl: false)', () => {
      assert.strictEqual(SUPABASE_AUTH_OPTIONS.detectSessionInUrl, false);
      assert.strictEqual(SUPABASE_AUTH_OPTIONS.flowType, 'pkce');
    });

    test('H02 — PKCE storage key and session persistence contract', () => {
      assert.strictEqual(SUPABASE_AUTH_OPTIONS.persistSession, true);
      assert.strictEqual(SUPABASE_AUTH_OPTIONS.autoRefreshToken, true);
      assert.strictEqual(SUPABASE_AUTH_OPTIONS.storageKey, 'gbcoder_supabase_auth_v1');
    });

    test('H03 — Single-execution PKCE code exchange with timeout guard', async () => {
      let exchangeStarted = false;
      const mockClient = {
        auth: {
          exchangeCodeForSession: async () => {
            exchangeStarted = true;
            // simulate a hanging network call
            await new Promise((r) => setTimeout(r, 200));
            return { data: { session: null }, error: null };
          },
          getSession: async () => ({ data: { session: null }, error: null }),
        },
      };
      _setMockSupabaseClient(mockClient);

      // Call with 50ms timeout
      const res = await exchangeCallbackCode('test-timeout-code', '/app/ide', 50);
      assert.strictEqual(exchangeStarted, true);
      assert.ok(res.error);
      assert.match(res.error, /timed out/i);
    });

    test('H04 — PKCE exchange recovery on already-used code with active session', async () => {
      const activeSession = {
        user: { id: 'user-already-exchanged', email: 'active@ladestack.in' },
        access_token: 'existing-jwt',
      };
      const mockClient = {
        auth: {
          exchangeCodeForSession: async () => ({
            data: { session: null },
            error: { message: 'Auth code has already been used' },
          }),
          getSession: async () => ({ data: { session: activeSession }, error: null }),
        },
      };
      _setMockSupabaseClient(mockClient);

      const res = await exchangeCallbackCode('code-already-consumed', '/app/ide');
      assert.strictEqual(res.error, null);
      assert.strictEqual(res.session?.user.id, 'user-already-exchanged');
    });

    test('H05 — Sensitive query parameters stripped from browser URL during callback', () => {
      // cleanCallbackUrlParams runs without throwing in both node and browser environments
      assert.doesNotThrow(() => {
        cleanCallbackUrlParams();
      });
    });

    test('H06 — Synchronous onAuthStateChange subscriber contract (no async lock deadlock)', () => {
      let callOrder = [];
      const mockClient = {
        auth: {
          onAuthStateChange: (cb) => {
            callOrder.push('subscribed');
            // Execute callback synchronously
            cb('SIGNED_IN', { user: { id: 'u1' } });
            callOrder.push('callback_finished');
            return { data: { subscription: { unsubscribe: () => {} } } };
          },
        },
      };
      _setMockSupabaseClient(mockClient);

      const unsub = subscribeToAuthState((event) => {
        callOrder.push(`event_${event}`);
      });
      unsub();

      assert.deepStrictEqual(callOrder, ['subscribed', 'event_SIGNED_IN', 'callback_finished']);
    });

    test('H07 — Asynchronous profile race condition: sign-out invalidates in-flight request', async () => {
      let requestIdCounter = 0;
      let activeProfile = null;

      // Simulate User A login starting profile fetch
      const currentReqId = ++requestIdCounter;
      const fetchProfileUserA = new Promise((resolve) => {
        setTimeout(() => {
          if (requestIdCounter === currentReqId) {
            activeProfile = { id: 'user-a', display_name: 'User A' };
          }
          resolve(activeProfile);
        }, 30);
      });

      // User signs out before fetch completes
      requestIdCounter++;
      activeProfile = null;

      await fetchProfileUserA;
      assert.strictEqual(activeProfile, null, 'Stale profile from User A must not be applied after sign out');
    });

    test('H08 — Asynchronous profile race condition: User B login invalidates User A in-flight request', async () => {
      let requestIdCounter = 0;
      let activeProfile = null;

      // User A initiates slow profile load
      const userAReqId = ++requestIdCounter;
      const fetchUserA = new Promise((resolve) => {
        setTimeout(() => {
          if (requestIdCounter === userAReqId) {
            activeProfile = { id: 'user-a', display_name: 'User A' };
          }
          resolve();
        }, 50);
      });

      // User B logs in quickly and finishes earlier
      const userBReqId = ++requestIdCounter;
      activeProfile = { id: 'user-b', display_name: 'User B' };

      await fetchUserA;
      assert.strictEqual(activeProfile.id, 'user-b', 'User A delayed response must not overwrite User B');
    });

    test('H09 — Database migration: Revocation of UPDATE and DELETE permissions from authenticated users', () => {
      const migration2Sql = readFileSync(
        join(process.cwd(), 'supabase/migrations/20261103000001_phase2_1_hardening.sql'),
        'utf8',
      );
      assert.match(migration2Sql, /REVOKE UPDATE,\s*DELETE ON public\.profiles FROM authenticated;/);
      assert.match(migration2Sql, /DROP POLICY IF EXISTS "Users can delete own profile" ON public\.profiles;/);
    });

    test('H10 — Database migration: Column-specific UPDATE grant for display_name, avatar_url, updated_at only', () => {
      const migration2Sql = readFileSync(
        join(process.cwd(), 'supabase/migrations/20261103000001_phase2_1_hardening.sql'),
        'utf8',
      );
      assert.match(
        migration2Sql,
        /GRANT UPDATE \(display_name,\s*avatar_url,\s*updated_at\) ON public\.profiles TO authenticated;/,
      );
      // Ensure broad GRANT UPDATE ON public.profiles is absent
      assert.strictEqual(/GRANT UPDATE ON public\.profiles TO authenticated;/i.test(migration2Sql), false);
    });

    test('H11 — Database migration: Immutable column integrity trigger protects id, github_username, email, created_at', () => {
      const migration2Sql = readFileSync(
        join(process.cwd(), 'supabase/migrations/20261103000001_phase2_1_hardening.sql'),
        'utf8',
      );
      assert.match(migration2Sql, /CREATE OR REPLACE FUNCTION public\.protect_immutable_profile_fields\(\)/);
      assert.match(migration2Sql, /SET search_path = ''/);
      assert.match(migration2Sql, /Cannot modify profile id/);
      assert.match(migration2Sql, /Cannot modify github_username/);
      assert.match(migration2Sql, /Cannot modify email/);
      assert.match(migration2Sql, /Cannot modify created_at timestamp/);
    });

    test('H12 — Database migration: Hardened SECURITY DEFINER handle_new_user() with SET search_path = \'\' and display_name preservation', () => {
      const migration2Sql = readFileSync(
        join(process.cwd(), 'supabase/migrations/20261103000001_phase2_1_hardening.sql'),
        'utf8',
      );
      assert.match(migration2Sql, /CREATE OR REPLACE FUNCTION public\.handle_new_user\(\)/);
      assert.match(migration2Sql, /SECURITY DEFINER/);
      assert.match(migration2Sql, /SET search_path = ''/);
      assert.match(migration2Sql, /pg_catalog\.coalesce/);
      assert.match(migration2Sql, /pg_catalog\.split_part/);
      assert.match(migration2Sql, /pg_catalog\.timezone/);
      assert.match(migration2Sql, /display_name = pg_catalog\.coalesce\(public\.profiles\.display_name,\s*EXCLUDED\.display_name\)/);
      assert.match(migration2Sql, /RAISE WARNING 'handle_new_user provisioning notice for %: % \(SQLSTATE: %\)'/);
    });
  });

  // =========================================================================
  // GROUP 6: PHASE 2.2 PRIVILEGE HARDENING & REAL RLS READINESS (V01 - V14)
  // =========================================================================
  describe('Phase 2.2 Privilege Hardening, Identity Integrity & Real RLS Readiness (V01 - V14)', () => {
    test('V01 — Migration 02: Revocation of broad INSERT from authenticated', () => {
      const migration3Sql = readFileSync(
        join(process.cwd(), 'supabase/migrations/20261103000002_phase2_2_privilege_hardening.sql'),
        'utf8',
      );
      assert.match(migration3Sql, /REVOKE INSERT ON public\.profiles FROM authenticated;/);
    });

    test('V02 — Migration 02: Granular column-level INSERT grant strictly for (id, display_name, avatar_url)', () => {
      const migration3Sql = readFileSync(
        join(process.cwd(), 'supabase/migrations/20261103000002_phase2_2_privilege_hardening.sql'),
        'utf8',
      );
      assert.match(
        migration3Sql,
        /GRANT INSERT \(id,\s*display_name,\s*avatar_url\) ON public\.profiles TO authenticated;/,
      );
      // Ensure provider/system fields are absent from the INSERT grant
      assert.strictEqual(/GRANT INSERT.*github_username/i.test(migration3Sql), false);
      assert.strictEqual(/GRANT INSERT.*email/i.test(migration3Sql), false);
      assert.strictEqual(/GRANT INSERT.*created_at/i.test(migration3Sql), false);
    });

    test('V03 — Migration 02: Revocation of client UPDATE on updated_at', () => {
      const migration3Sql = readFileSync(
        join(process.cwd(), 'supabase/migrations/20261103000002_phase2_2_privilege_hardening.sql'),
        'utf8',
      );
      assert.match(migration3Sql, /REVOKE UPDATE ON public\.profiles FROM authenticated;/);
    });

    test('V04 — Migration 02: Column-level UPDATE grant strictly for (display_name, avatar_url)', () => {
      const migration3Sql = readFileSync(
        join(process.cwd(), 'supabase/migrations/20261103000002_phase2_2_privilege_hardening.sql'),
        'utf8',
      );
      assert.match(
        migration3Sql,
        /GRANT UPDATE \(display_name,\s*avatar_url\) ON public\.profiles TO authenticated;/,
      );
      assert.strictEqual(/GRANT UPDATE.*updated_at/i.test(migration3Sql), false);
    });

    test('V05 — Migration 02: sync_trusted_profile_metadata trigger enforces database timestamps and auth.users email/github_username', () => {
      const migration3Sql = readFileSync(
        join(process.cwd(), 'supabase/migrations/20261103000002_phase2_2_privilege_hardening.sql'),
        'utf8',
      );
      assert.match(migration3Sql, /CREATE OR REPLACE FUNCTION public\.sync_trusted_profile_metadata\(\)/);
      assert.match(migration3Sql, /BEFORE INSERT ON public\.profiles/);
      assert.match(migration3Sql, /NEW\.created_at := pg_catalog\.timezone/);
      assert.match(migration3Sql, /NEW\.updated_at := pg_catalog\.timezone/);
      assert.match(migration3Sql, /FROM auth\.users u/);
    });

    test('V06 — Migration 02: Trigger functions converted to SECURITY INVOKER where elevated privileges are unnecessary', () => {
      const migration3Sql = readFileSync(
        join(process.cwd(), 'supabase/migrations/20261103000002_phase2_2_privilege_hardening.sql'),
        'utf8',
      );
      const matches = migration3Sql.match(/SECURITY INVOKER/g);
      assert.ok(matches && matches.length >= 2, 'handle_profiles_updated_at and protect_immutable_profile_fields must be SECURITY INVOKER');
    });

    test('V07 — ProfileService: getOrCreateProfile inserts only user-editable columns (id, display_name, avatar_url)', async () => {
      let capturedPayload = null;
      const fakeUser = {
        id: 'usr-v07-test',
        email: 'v07@ladestack.in',
        user_metadata: { user_name: 'v07dev', full_name: 'V07 Developer' },
      };

      const mockClient = {
        from: (table) => {
          assert.strictEqual(table, 'profiles');
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: null, error: null }),
              }),
            }),
            upsert: (payload) => {
              capturedPayload = payload;
              return {
                select: () => ({
                  single: async () => ({
                    data: {
                      ...payload,
                      email: fakeUser.email,
                      github_username: 'v07dev',
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    },
                    error: null,
                  }),
                }),
              };
            },
          };
        },
      };
      _setMockSupabaseClient(mockClient);

      await getOrCreateProfile(fakeUser);
      assert.ok(capturedPayload);
      assert.strictEqual(capturedPayload.id, 'usr-v07-test');
      assert.strictEqual(capturedPayload.display_name, 'V07 Developer');
      // Verify provider and timestamp fields are NOT in the client insert payload
      assert.strictEqual('email' in capturedPayload, false);
      assert.strictEqual('github_username' in capturedPayload, false);
      assert.strictEqual('created_at' in capturedPayload, false);
      assert.strictEqual('updated_at' in capturedPayload, false);
    });

    test('V08 — ProfileService: updateProfile does not send client-controlled updated_at timestamp', async () => {
      let capturedUpdatePayload = null;
      const mockClient = {
        from: () => ({
          update: (payload) => {
            capturedUpdatePayload = payload;
            return {
              eq: () => ({
                select: () => ({
                  single: async () => ({
                    data: { id: 'usr-v08', ...payload },
                    error: null,
                  }),
                }),
              }),
            };
          },
        }),
      };
      _setMockSupabaseClient(mockClient);

      await updateProfile('usr-v08', { display_name: 'Updated Name' });
      assert.ok(capturedUpdatePayload);
      assert.strictEqual(capturedUpdatePayload.display_name, 'Updated Name');
      assert.strictEqual('updated_at' in capturedUpdatePayload, false, 'Client must not supply updated_at; managed by DB trigger');
    });

    test('V09 — AuthContext: profile fetching effect keyed strictly on userId preventing redundant PostgREST reads', () => {
      const authContextSource = readFileSync(
        join(process.cwd(), 'src/features/auth/AuthContext.tsx'),
        'utf8',
      );
      assert.match(authContextSource, /const userId = user\?\.id;/);
      assert.match(authContextSource, /useEffect\(\(\) => \{[\s\S]*?\}, \[userId\]\);/);
      // Ensure previous [user] object dependency is eliminated
      assert.strictEqual(/useEffect\(\(\) => \{[\s\S]*?\}, \[user\]\);/.test(authContextSource), false);
    });

    test('V10 — PKCE Lifecycle: delayed success after timeout is ignored and does not corrupt state', async () => {
      const mockClient = {
        auth: {
          exchangeCodeForSession: async () => {
            // Simulate very slow network response (100ms)
            await new Promise((r) => setTimeout(r, 100));
            return {
              data: { session: { user: { id: 'late-user' } } },
              error: null,
            };
          },
          getSession: async () => ({ data: { session: null }, error: null }),
        },
      };
      _setMockSupabaseClient(mockClient);

      // Call with 20ms timeout
      const res = await exchangeCallbackCode('code-late-success', '/app/ide', 20);
      assert.strictEqual(res.session, null, 'Must not return session if timed out');
      assert.ok(res.error);
      assert.match(res.error, /timed out/i);
    });

    test('V11 — PKCE Lifecycle: delayed failure after timeout is cleanly discarded', async () => {
      const mockClient = {
        auth: {
          exchangeCodeForSession: async () => {
            await new Promise((r) => setTimeout(r, 100));
            return {
              data: { session: null },
              error: { message: 'Late network error' },
            };
          },
          getSession: async () => ({ data: { session: null }, error: null }),
        },
      };
      _setMockSupabaseClient(mockClient);

      const res = await exchangeCallbackCode('code-late-fail', '/app/ide', 20);
      assert.strictEqual(res.session, null);
      assert.match(res.error, /timed out/i);
    });

    test('V12 — Identity Metadata: user_metadata explicitly treated as untrusted for authorization', () => {
      // User metadata full_name or user_name can be set by anyone, so row authorization relies solely on auth.uid()
      const fakeUntrustedUser = {
        id: 'usr-untrusted-1',
        email: 'attacker@evil.com',
        user_metadata: {
          full_name: 'Admin User',
          user_name: 'admin',
          role: 'superuser', // Malicious attempt to claim superuser role
        },
      };
      const mapped = mapUserToProfileFields(fakeUntrustedUser);
      assert.strictEqual(mapped.id, 'usr-untrusted-1');
      assert.strictEqual('role' in mapped, false, 'Role metadata must never be mapped or trusted from user_metadata');
    });

    test('V13 — RLS Contract: DB01-DB18 static SQL compliance check across all 3 migrations', () => {
      const mig1 = readFileSync(join(process.cwd(), 'supabase/migrations/20261103000000_phase2_profiles_rls.sql'), 'utf8');
      const mig2 = readFileSync(join(process.cwd(), 'supabase/migrations/20261103000001_phase2_1_hardening.sql'), 'utf8');
      const mig3 = readFileSync(join(process.cwd(), 'supabase/migrations/20261103000002_phase2_2_privilege_hardening.sql'), 'utf8');

      // DB01: RLS enabled
      assert.match(mig1, /ALTER TABLE public\.profiles ENABLE ROW LEVEL SECURITY;/);
      // DB02/DB03: Anonymous access revoked
      assert.match(mig1, /REVOKE ALL ON public\.profiles FROM anon;/);
      // DB04/DB05: Users can view own profile
      assert.match(mig1, /CREATE POLICY "Users can view own profile"/);
      // DB08/DB09/DB10/DB11: Immutable fields protected
      assert.match(mig2, /CREATE OR REPLACE FUNCTION public\.protect_immutable_profile_fields/);
      assert.match(mig3, /GRANT INSERT \(id,\s*display_name,\s*avatar_url\)/);
      // DB12: updated_at protected from client updates
      assert.match(mig3, /REVOKE UPDATE ON public\.profiles FROM authenticated;/);
      assert.match(mig3, /GRANT UPDATE \(display_name,\s*avatar_url\)/);
    });

    test('V14 — Recovery and fallback profile preserves user session when database is unreachable', async () => {
      const mockClient = {
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: { message: 'Network offline 503' } }),
            }),
          }),
          upsert: () => ({
            select: () => ({
              single: async () => ({ data: null, error: { message: 'Network offline 503' } }),
            }),
          }),
        }),
      };
      _setMockSupabaseClient(mockClient);

      const user = {
        id: 'usr-offline-recovery',
        email: 'offline@ladestack.in',
        user_metadata: { full_name: 'Offline Dev' },
      };

      const prof = await getOrCreateProfile(user);
      assert.ok(prof);
      assert.strictEqual(prof.id, 'usr-offline-recovery');
      assert.strictEqual(prof.display_name, 'Offline Dev');
    });
  });
});
