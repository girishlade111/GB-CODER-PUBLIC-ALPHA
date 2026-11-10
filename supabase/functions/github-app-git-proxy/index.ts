/**
 * Supabase Edge Function: github-app-git-proxy
 *
 * Implements:
 * - Server-mediated GitHub Git Data API proxy for authenticated GB Coder users
 * - Verifies caller Supabase JWT and resolves server-held encrypted GitHub token
 * - Restricts requests exclusively to api.github.com with strict path allowlist
 * - Prevents SSRF, unauthorized repository access, and credential leakage
 * - Automatic token refresh before expiration
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
}

const getEnv = (): EnvConfig => {
  return {
    supabaseUrl: Deno.env.get('SUPABASE_URL') || '',
    supabaseAnonKey: Deno.env.get('SUPABASE_ANON_KEY') || '',
    supabaseServiceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    githubAppClientId: Deno.env.get('GITHUB_APP_CLIENT_ID') || '',
    githubAppClientSecret: Deno.env.get('GITHUB_APP_CLIENT_SECRET') || '',
    githubAppEncryptionKey: Deno.env.get('GITHUB_APP_ENCRYPTION_KEY') || 'default-secret-key-32-chars-long!!',
  };
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

/** Decrypt ciphertext using AES-256-GCM */
async function decryptToken(ciphertext: string, secretKey: string): Promise<string> {
  const enc = new TextEncoder();
  const keyData = enc.encode(secretKey.padEnd(32, '0').slice(0, 32));
  const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, ['decrypt']);

  const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, data);
  return new TextDecoder().decode(decrypted);
}

/** Encrypt plaintext using AES-256-GCM */
async function encryptToken(plaintext: string, secretKey: string): Promise<string> {
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

/** Allowed GitHub REST API path regex patterns for Git operations */
const ALLOWED_PATH_PATTERNS = [
  /^\/user$/,
  /^\/user\/repos(\?.*)?$/,
  /^\/user\/installations(\?.*)?$/,
  /^\/user\/installations\/\d+\/repositories(\?.*)?$/,
  /^\/repos\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/,
  /^\/repos\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/git\/ref\/heads\/[a-zA-Z0-9._/-]+(\?.*)?$/,
  /^\/repos\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/git\/refs(\/heads\/[a-zA-Z0-9._/-]+)?(\?.*)?$/,
  /^\/repos\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/git\/commits\/[0-9a-fA-F]{40}$/,
  /^\/repos\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/git\/commits$/,
  /^\/repos\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/commits(\?.*)?$/,
  /^\/repos\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/git\/trees(\/[0-9a-fA-F]{40})?(\?.*)?$/,
  /^\/repos\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/git\/blobs(\/[0-9a-fA-F]{40})?$/,
  /^\/repos\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/pulls(\?.*)?$/,
];

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized: missing authorization header' }), {
      status: 401,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const env = getEnv();
  const serviceClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);

  // Authenticate caller Supabase user
  const userClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized: invalid or expired session' }), {
      status: 401,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Look up user's active GitHub App authorization record
  const { data: authRecord, error: recordError } = await serviceClient
    .from('github_app_authorizations')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recordError || !authRecord) {
    return new Response(JSON.stringify({ error: 'No active GitHub App authorization found for this user' }), {
      status: 403,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  let accessToken = '';
  try {
    accessToken = await decryptToken(authRecord.access_token_encrypted, env.githubAppEncryptionKey);
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to decrypt access token' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Check if token is expired or within 2 minutes of expiration, and auto-refresh if possible
  const expiresAt = new Date(authRecord.token_expires_at).getTime();
  if (expiresAt - Date.now() < 2 * 60 * 1000 && authRecord.refresh_token_encrypted) {
    try {
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
      if (refreshRes.ok && refreshData.access_token) {
        accessToken = refreshData.access_token;
        const newRefreshToken = refreshData.refresh_token || refreshToken;
        const expiresIn = refreshData.expires_in || 28800;

        const newAccessEncrypted = await encryptToken(accessToken, env.githubAppEncryptionKey);
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
      }
    } catch {
      // If refresh fails, attempt using current token before failing
    }
  }

  // Parse requested proxy path
  const url = new URL(req.url);
  const pathParam = url.searchParams.get('path');
  if (!pathParam) {
    return new Response(JSON.stringify({ error: 'Missing path query parameter' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Validate path against allowed whitelist patterns
  const isAllowed = ALLOWED_PATH_PATTERNS.some((pattern) => pattern.test(pathParam));
  if (!isAllowed) {
    return new Response(JSON.stringify({ error: `Forbidden path: ${pathParam}` }), {
      status: 403,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Target exclusively api.github.com
  const targetUrl = `https://api.github.com${pathParam}`;

  // Forward body if present
  let body: string | null = null;
  if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
    body = await req.text();
  }

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'GB-Coder-IDE',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body || undefined,
    });

    const responseText = await upstreamRes.text();
    return new Response(responseText, {
      status: upstreamRes.status,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': upstreamRes.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: `GitHub upstream request failed: ${message}` }), {
      status: 502,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
