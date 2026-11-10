/**
 * Supabase Edge Function: github-app-auth
 *
 * Implements:
 * - Start OAuth authorization with PKCE S256 and cryptographically bound state
 * - Callback code exchange, identity binding, and token encryption
 * - Connection status check without exposing secrets
 * - Refresh-token rotation and expiration renewal
 * - Account disconnect and token revocation
 *
 * Security:
 * - AES-256-GCM encryption for stored tokens
 * - Strict state validation with expiration and replay protection
 * - Zero token leakage to client
 * - Zero emoji rule
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  githubAppClientId: string;
  githubAppClientSecret: string;
  githubAppEncryptionKey: string;
  appOrigin: string;
}

const getEnv = (): EnvConfig => {
  return {
    supabaseUrl: Deno.env.get('SUPABASE_URL') || '',
    supabaseAnonKey: Deno.env.get('SUPABASE_ANON_KEY') || '',
    supabaseServiceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    githubAppClientId: Deno.env.get('GITHUB_APP_CLIENT_ID') || '',
    githubAppClientSecret: Deno.env.get('GITHUB_APP_CLIENT_SECRET') || '',
    githubAppEncryptionKey: Deno.env.get('GITHUB_APP_ENCRYPTION_KEY') || 'default-secret-key-32-chars-long!!',
    appOrigin: Deno.env.get('APP_ORIGIN') || 'https://code.ladestack.in',
  };
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// ─── Cryptographic Helpers ──────────────────────────────────────────────────

/** Encrypt plaintext using AES-256-GCM */
export async function encryptToken(plaintext: string, secretKey: string): Promise<string> {
  const enc = new TextEncoder();
  const keyData = enc.encode(secretKey.padEnd(32, '0').slice(0, 32));
  const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, enc.encode(plaintext));

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

/** Decrypt ciphertext using AES-256-GCM */
export async function decryptToken(ciphertext: string, secretKey: string): Promise<string> {
  const enc = new TextEncoder();
  const keyData = enc.encode(secretKey.padEnd(32, '0').slice(0, 32));
  const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, ['decrypt']);

  const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, data);
  return new TextDecoder().decode(decrypted);
}

/** Compute SHA-256 base64url challenge for PKCE */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Generate random cryptographically secure string */
export function generateRandomString(length = 43): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
    .slice(0, length);
}

// ─── Edge Function Handler ──────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action') || url.pathname.split('/').pop();
  const env = getEnv();

  const serviceClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);

  try {
    // 1. ACTION: START OAUTH AUTHORIZATION
    if (action === 'start' && req.method === 'POST') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized: missing bearer token' }), {
          status: 401,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      // Verify caller user token
      const userClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: userError } = await userClient.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized: invalid session' }), {
          status: 401,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const body = await req.json().catch(() => ({}));
      const returnPath = typeof body.returnPath === 'string' && body.returnPath.startsWith('/app')
        ? body.returnPath
        : '/app';

      const state = generateRandomString(32);
      const codeVerifier = generateRandomString(64);
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min TTL

      // Store state bound to user
      const { error: stateError } = await serviceClient.from('github_app_oauth_states').insert({
        state,
        user_id: user.id,
        code_verifier: codeVerifier,
        return_path: returnPath,
        expires_at: expiresAt,
      });

      if (stateError) {
        return new Response(JSON.stringify({ error: `Failed to initiate state: ${stateError.message}` }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const callbackUrl = `${env.supabaseUrl}/functions/v1/github-app-auth?action=callback`;
      const authUrl = new URL('https://github.com/login/oauth/authorize');
      authUrl.searchParams.set('client_id', env.githubAppClientId);
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');
      authUrl.searchParams.set('redirect_uri', callbackUrl);

      return new Response(JSON.stringify({ url: authUrl.toString() }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // 2. ACTION: OAUTH CALLBACK
    if (action === 'callback' && req.method === 'GET') {
      const state = url.searchParams.get('state');
      const code = url.searchParams.get('code');
      const errorParam = url.searchParams.get('error');

      if (errorParam) {
        const errorDesc = url.searchParams.get('error_description') || errorParam;
        return Response.redirect(`${env.appOrigin}/app?github_error=${encodeURIComponent(errorDesc)}`, 302);
      }

      if (!state || !code) {
        return Response.redirect(`${env.appOrigin}/app?github_error=missing_callback_params`, 302);
      }

      // Atomically consume state using DELETE ... RETURNING to prevent replay and concurrent races
      const { data: stateData, error: stateError } = await serviceClient
        .from('github_app_oauth_states')
        .delete()
        .eq('state', state)
        .select('*')
        .maybeSingle();

      if (stateError || !stateData) {
        return Response.redirect(`${env.appOrigin}/app?github_error=invalid_or_replayed_state`, 302);
      }

      // Verify expiration
      if (new Date(stateData.expires_at).getTime() < Date.now()) {
        return Response.redirect(`${env.appOrigin}/app?github_error=expired_state`, 302);
      }

      // Exchange authorization code for token with GitHub
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'GB-Coder-App',
        },
        body: JSON.stringify({
          client_id: env.githubAppClientId,
          client_secret: env.githubAppClientSecret,
          code,
          code_verifier: stateData.code_verifier,
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || tokenData.error) {
        const errMessage = tokenData.error_description || tokenData.error || 'Token exchange failed';
        return Response.redirect(`${env.appOrigin}/app?github_error=${encodeURIComponent(errMessage)}`, 302);
      }

      const accessToken = tokenData.access_token;
      const refreshToken = tokenData.refresh_token || '';
      const expiresIn = tokenData.expires_in || 28800; // default 8 hours
      const refreshTokenExpiresIn = tokenData.refresh_token_expires_in || 15811200; // default 6 months
      const scope = tokenData.scope || '';

      // Fetch GitHub user profile to get verified immutable github_user_id
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'GB-Coder-App',
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!userRes.ok) {
        return Response.redirect(`${env.appOrigin}/app?github_error=failed_fetching_github_profile`, 302);
      }

      const ghUser = await userRes.json();
      const githubUserId = ghUser.id;
      const githubUsername = ghUser.login;

      // Encrypt tokens before storing
      const accessTokenEncrypted = await encryptToken(accessToken, env.githubAppEncryptionKey);
      const refreshTokenEncrypted = refreshToken
        ? await encryptToken(refreshToken, env.githubAppEncryptionKey)
        : '';

      const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
      const refreshTokenExpiresAt = refreshToken
        ? new Date(Date.now() + refreshTokenExpiresIn * 1000).toISOString()
        : null;

      // Upsert authorization record bound to initiating user_id
      const { error: upsertError } = await serviceClient.from('github_app_authorizations').upsert(
        {
          user_id: stateData.user_id,
          github_user_id: githubUserId,
          github_username: githubUsername,
          access_token_encrypted: accessTokenEncrypted,
          refresh_token_encrypted: refreshTokenEncrypted,
          token_expires_at: tokenExpiresAt,
          refresh_token_expires_at: refreshTokenExpiresAt,
          scope,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,github_user_id' },
      );

      if (upsertError) {
        console.error('[github-app-auth] Upsert error:', upsertError);
        return Response.redirect(`${env.appOrigin}/app?github_error=database_save_failed`, 302);
      }

      const redirectPath = (
        typeof stateData.return_path === 'string' &&
        stateData.return_path.startsWith('/app') &&
        !stateData.return_path.includes('//') &&
        !stateData.return_path.includes('\\')
      )
        ? stateData.return_path
        : '/app';
      const successUrl = new URL(redirectPath, env.appOrigin);
      successUrl.searchParams.set('github_connected', '1');
      successUrl.searchParams.set('github_user', githubUsername);

      return Response.redirect(successUrl.toString(), 302);
    }

    // 3. ACTION: STATUS CHECK
    if (action === 'status' && req.method === 'GET') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ isConnected: false, reason: 'unauthenticated' }), {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const userClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ isConnected: false, reason: 'unauthenticated' }), {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const { data: authRecord } = await serviceClient
        .from('github_app_authorizations')
        .select('github_user_id, github_username, token_expires_at, scope, installation_id')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!authRecord) {
        return new Response(JSON.stringify({ isConnected: false }), {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const isExpired = new Date(authRecord.token_expires_at).getTime() < Date.now();

      return new Response(
        JSON.stringify({
          isConnected: true,
          githubUserId: authRecord.github_user_id,
          githubUsername: authRecord.github_username,
          tokenExpiresAt: authRecord.token_expires_at,
          isExpired,
          scope: authRecord.scope,
          installationId: authRecord.installation_id,
        }),
        {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        },
      );
    }

    // 4. ACTION: TOKEN REFRESH
    if (action === 'refresh' && req.method === 'POST') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const userClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const { data: authRecord, error: recordError } = await serviceClient
        .from('github_app_authorizations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (recordError || !authRecord || !authRecord.refresh_token_encrypted) {
        return new Response(JSON.stringify({ error: 'No refreshable authorization found' }), {
          status: 404,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const refreshToken = await decryptToken(authRecord.refresh_token_encrypted, env.githubAppEncryptionKey);

      const refreshRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'GB-Coder-App',
        },
        body: JSON.stringify({
          client_id: env.githubAppClientId,
          client_secret: env.githubAppClientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      });

      const refreshData = await refreshRes.json();
      if (!refreshRes.ok || refreshData.error) {
        return new Response(JSON.stringify({ error: refreshData.error_description || 'Refresh failed' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const newAccessToken = refreshData.access_token;
      const newRefreshToken = refreshData.refresh_token || refreshToken;
      const expiresIn = refreshData.expires_in || 28800;

      const newAccessEncrypted = await encryptToken(newAccessToken, env.githubAppEncryptionKey);
      const newRefreshEncrypted = await encryptToken(newRefreshToken, env.githubAppEncryptionKey);
      const newExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

      await serviceClient
        .from('github_app_authorizations')
        .update({
          access_token_encrypted: newAccessEncrypted,
          refresh_token_encrypted: newRefreshEncrypted,
          token_expires_at: newExpiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authRecord.id);

      return new Response(
        JSON.stringify({
          success: true,
          tokenExpiresAt: newExpiresAt,
        }),
        {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        },
      );
    }

    // 5. ACTION: DISCONNECT ACCOUNT
    if (action === 'disconnect' && req.method === 'POST') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const userClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      // Read token to revoke grant with GitHub
      const { data: authRecord } = await serviceClient
        .from('github_app_authorizations')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (authRecord && env.githubAppClientId && env.githubAppClientSecret) {
        try {
          const token = await decryptToken(authRecord.access_token_encrypted, env.githubAppEncryptionKey);
          await fetch(`https://api.github.com/applications/${env.githubAppClientId}/grant`, {
            method: 'DELETE',
            headers: {
              Accept: 'application/vnd.github.v3+json',
              Authorization: `Basic ${btoa(`${env.githubAppClientId}:${env.githubAppClientSecret}`)}`,
              'Content-Type': 'application/json',
              'User-Agent': 'GB-Coder-App',
            },
            body: JSON.stringify({ access_token: token }),
          });
        } catch {
          // Continue deletion even if remote revocation fails
        }
      }

      // Delete database record
      await serviceClient.from('github_app_authorizations').delete().eq('user_id', user.id);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action or method' }), {
      status: 404,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
