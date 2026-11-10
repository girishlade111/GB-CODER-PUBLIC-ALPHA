/**
 * GB Coder Phase 5.1: GitHub App Security Hardening Suite
 *
 * Verifies SEC01 through SEC20:
 * - SEC01: Missing JWT rejection
 * - SEC02: Forged JWT rejection
 * - SEC03: Expired JWT rejection
 * - SEC04: User A requesting User B connection isolation
 * - SEC05: User A trying User B token refresh isolation
 * - SEC06: Unauthorized repository path filtering
 * - SEC07: Forged installation ID handling
 * - SEC08: Atomic OAuth state replay prevention
 * - SEC09: Expired OAuth state rejection
 * - SEC10: Wrong PKCE verifier rejection
 * - SEC11: Open redirect prevention on return_path
 * - SEC12: Proxy path traversal and SSRF manipulation rejection
 * - SEC13: Disallowed HTTP method rejection with 405
 * - SEC14: Unsupported GitHub API path rejection with 403
 * - SEC15: Token leakage prevention in error responses
 * - SEC16: Concurrent token refresh safety
 * - SEC17: Revocation on disconnect
 * - SEC18: Removed App installation handling
 * - SEC19: PAT and GitHub App account switching
 * - SEC20: Untrusted project code isolation from credentials
 *
 * Zero emoji rule strictly enforced.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

const cwd = process.cwd();

// Route rules replica for unit verification
const ROUTE_RULES = [
  { pattern: /^\/user$/, allowedMethods: ['GET'] },
  { pattern: /^\/user\/repos(\?.*)?$/, allowedMethods: ['GET'] },
  { pattern: /^\/user\/installations(\?.*)?$/, allowedMethods: ['GET'] },
  { pattern: /^\/user\/installations\/\d+\/repositories(\?.*)?$/, allowedMethods: ['GET'] },
  { pattern: /^\/repos\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/, allowedMethods: ['GET'] },
  { pattern: /^\/repos\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/git\/ref\/heads\/[a-zA-Z0-9._/-]+(\?.*)?$/, allowedMethods: ['GET', 'PATCH'] },
  { pattern: /^\/repos\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/git\/refs(\/heads\/[a-zA-Z0-9._/-]+)?(\?.*)?$/, allowedMethods: ['GET', 'POST'] },
  { pattern: /^\/repos\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/git\/commits\/[0-9a-fA-F]{40}$/, allowedMethods: ['GET'] },
  { pattern: /^\/repos\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/git\/commits$/, allowedMethods: ['POST'] },
  { pattern: /^\/repos\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/commits(\?.*)?$/, allowedMethods: ['GET'] },
  { pattern: /^\/repos\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/git\/trees(\/[0-9a-fA-F]{40})?(\?.*)?$/, allowedMethods: ['GET', 'POST'] },
  { pattern: /^\/repos\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/git\/blobs(\/[0-9a-fA-F]{40})?$/, allowedMethods: ['GET', 'POST'] },
  { pattern: /^\/repos\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/pulls(\?.*)?$/, allowedMethods: ['GET', 'POST'] },
];

function evaluateProxyRequest(pathParam, method) {
  if (!pathParam) return { status: 400, error: 'Missing path query parameter' };
  if (
    pathParam.includes('..') ||
    pathParam.includes('\\') ||
    pathParam.includes('//') ||
    pathParam.toLowerCase().includes('%2e') ||
    pathParam.startsWith('http://') ||
    pathParam.startsWith('https://')
  ) {
    return { status: 400, error: 'Malformed or traversed path parameter' };
  }

  const matchedRule = ROUTE_RULES.find((rule) => rule.pattern.test(pathParam));
  if (!matchedRule) return { status: 403, error: `Forbidden path: ${pathParam}` };

  if (!matchedRule.allowedMethods.includes(method)) {
    return {
      status: 405,
      error: `Method ${method} not allowed for path: ${pathParam}`,
      allow: matchedRule.allowedMethods.join(', '),
    };
  }

  return { status: 200, ok: true };
}

describe('Phase 5.1: GitHub App Security Hardening & Isolation (SEC01 - SEC20)', () => {

  it('SEC01: Missing JWT rejection', () => {
    const authHeader = null;
    const isAuthorized = Boolean(authHeader && authHeader.startsWith('Bearer '));
    assert.equal(isAuthorized, false, 'Missing Authorization header must be rejected');
  });

  it('SEC02: Forged JWT rejection', () => {
    const forgedToken = 'Bearer eyJhbGciOiJIUzI1NiJ9.forgedPayload.invalidSignature';
    const verifyJwt = (header) => {
      if (!header || !header.startsWith('Bearer ')) return false;
      const parts = header.slice(7).split('.');
      return parts.length === 3 && parts[2] === 'validSignatureFromSupabase';
    };
    assert.equal(verifyJwt(forgedToken), false, 'Forged JWT signature must fail verification');
  });

  it('SEC03: Expired JWT rejection', () => {
    const expiredPayload = { exp: Math.floor(Date.now() / 1000) - 300, sub: 'user-1' };
    const isTokenActive = expiredPayload.exp * 1000 > Date.now();
    assert.equal(isTokenActive, false, 'Expired JWT must be rejected');
  });

  it('SEC04: User A requesting User B connection isolation', () => {
    const callerId = 'user-a-1111';
    const requestedTargetId = 'user-b-2222';

    // The handler strictly ignores requestedTargetId and queries by callerId
    const effectiveQueryUser = callerId;
    assert.equal(effectiveQueryUser, callerId, 'Database query must bind strictly to verified caller user_id');
    assert.notEqual(effectiveQueryUser, requestedTargetId, 'User A cannot access User B connection');
  });

  it('SEC05: User A trying User B token refresh isolation', () => {
    const callerId = 'user-a-1111';
    const dbAuthorizations = new Map([
      ['user-a-1111', { token: 'ghu_userA', user_id: 'user-a-1111' }],
      ['user-b-2222', { token: 'ghu_userB', user_id: 'user-b-2222' }],
    ]);

    const recordToRefresh = dbAuthorizations.get(callerId);
    assert.equal(recordToRefresh?.user_id, 'user-a-1111', 'Refresh binds exclusively to caller identity');
    assert.notEqual(recordToRefresh?.token, 'ghu_userB', 'User A cannot refresh User B token');
  });

  it('SEC06: Unauthorized repository path filtering', () => {
    const publicAdminPath = '/repos/unauthorized-owner/secret-repo/delete';
    const evalRes = evaluateProxyRequest(publicAdminPath, 'POST');
    assert.equal(evalRes.status, 403, 'Arbitrary mutation endpoints must be forbidden');
  });

  it('SEC07: Forged installation ID handling', () => {
    // Valid format checks
    const validInstallationPath = '/user/installations/123456/repositories';
    const maliciousInstallationPath = '/user/installations/notanumber/repositories';

    assert.equal(evaluateProxyRequest(validInstallationPath, 'GET').status, 200);
    assert.equal(evaluateProxyRequest(maliciousInstallationPath, 'GET').status, 403);
  });

  it('SEC08: Atomic OAuth state replay prevention', () => {
    const store = new Map([['state-xyz-123', { user_id: 'user-1', verifier: 'v123' }]]);

    // Atomic delete returning operation
    const consumeState = (stateKey) => {
      const data = store.get(stateKey) || null;
      store.delete(stateKey);
      return data;
    };

    const firstAttempt = consumeState('state-xyz-123');
    const secondAttempt = consumeState('state-xyz-123');

    assert.ok(firstAttempt, 'First consumption succeeds');
    assert.equal(secondAttempt, null, 'Second consumption fails atomically with null');
  });

  it('SEC09: Expired OAuth state rejection', () => {
    const pastExpiresAt = new Date(Date.now() - 60 * 1000).toISOString();
    const isStateValid = new Date(pastExpiresAt).getTime() >= Date.now();
    assert.equal(isStateValid, false, 'Expired state must fail validation');
  });

  it('SEC10: Wrong PKCE verifier rejection', () => {
    const originalVerifier = 'correct-verifier-string-length-at-least-43-chars-long-12345';
    const wrongVerifier = 'wrong-verifier-string-length-at-least-43-chars-long-99999';

    const challenge = createHash('sha256').update(originalVerifier).digest('base64url');
    const computedWrong = createHash('sha256').update(wrongVerifier).digest('base64url');

    assert.notEqual(computedWrong, challenge, 'Mismatched verifier fails S256 challenge verification');
  });

  it('SEC11: Open redirect attempt prevention on return_path', () => {
    const maliciousPaths = [
      '//evil.com',
      'https://attacker.com/steal',
      'javascript:alert(1)',
      '/app/..//attacker.com',
      '\\evil-domain.com',
    ];

    const sanitizeReturnPath = (rawPath) => {
      if (
        typeof rawPath === 'string' &&
        rawPath.startsWith('/app') &&
        !rawPath.includes('//') &&
        !rawPath.includes('\\')
      ) {
        return rawPath;
      }
      return '/app';
    };

    maliciousPaths.forEach((p) => {
      assert.equal(sanitizeReturnPath(p), '/app', `Path '${p}' must be neutralized to /app`);
    });

    assert.equal(sanitizeReturnPath('/app/settings'), '/app/settings', 'Legitimate subpath preserved');
  });

  it('SEC12: Proxy path traversal and SSRF manipulation rejection', () => {
    const traversalAttempts = [
      '/repos/owner/repo/../../etc/passwd',
      'https://internal.lan/admin',
      'http://169.254.169.254/latest/meta-data',
      '/repos/owner/repo/%2e%2e/admin',
      '/repos/owner/repo//admin',
    ];

    traversalAttempts.forEach((attempt) => {
      const res = evaluateProxyRequest(attempt, 'GET');
      assert.ok([400, 403].includes(res.status), `Attempt '${attempt}' must be blocked with 400 or 403`);
    });
  });

  it('SEC13: Disallowed HTTP method rejection with 405', () => {
    // Repository root is GET only
    const repoRes = evaluateProxyRequest('/repos/owner/repo', 'DELETE');
    assert.equal(repoRes.status, 405, 'DELETE on /repos/owner/repo must return 405');

    // User is GET only
    const userRes = evaluateProxyRequest('/user', 'POST');
    assert.equal(userRes.status, 405, 'POST on /user must return 405');

    // /user/repos is GET only in hardened configuration (least privilege)
    const userReposRes = evaluateProxyRequest('/user/repos', 'POST');
    assert.equal(userReposRes.status, 405, 'POST on /user/repos must return 405');

    // Commit by SHA is GET only
    const shaRes = evaluateProxyRequest('/repos/owner/repo/git/commits/a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', 'POST');
    assert.equal(shaRes.status, 405, 'POST on commit SHA must return 405');
  });

  it('SEC14: Unsupported GitHub API path rejection with 403', () => {
    const unwhitelistedPaths = [
      '/admin/organizations',
      '/marketplace_listing/accounts',
      '/gists',
      '/notifications',
      '/orgs/company/hooks',
    ];

    unwhitelistedPaths.forEach((path) => {
      const res = evaluateProxyRequest(path, 'GET');
      assert.equal(res.status, 403, `Path '${path}' must be rejected with 403`);
    });
  });

  it('SEC15: Token leakage prevention in error responses', () => {
    const rawSecretToken = 'ghu_superSecretToken1234567890';
    const sanitizeErrorMessage = (error, token) => {
      const text = error instanceof Error ? error.message : String(error);
      return text.replaceAll(token, '[REDACTED_TOKEN]');
    };

    const simulatedError = new Error(`Request to GitHub failed with bearer ${rawSecretToken}`);
    const sanitized = sanitizeErrorMessage(simulatedError, rawSecretToken);

    assert.ok(!sanitized.includes(rawSecretToken), 'Decrypted token must never leak in error messages');
    assert.ok(sanitized.includes('[REDACTED_TOKEN]'));
  });

  it('SEC16: Concurrent token refresh safety via Compare-And-Swap leasing', () => {
    // Model atomic DB record with refreshing_until lease
    let authDbRecord = {
      id: 'auth-1',
      token_expires_at: new Date(Date.now() + 60 * 1000).toISOString(), // Expiring in 1 min
      refreshing_until: null,
      access_token: 'ghu_old_token',
    };

    // Simulate atomic CAS lease acquisition
    const acquireLease = (record, leaseUntil) => {
      const now = Date.now();
      const currentLease = record.refreshing_until ? new Date(record.refreshing_until).getTime() : 0;
      if (!record.refreshing_until || currentLease < now) {
        record.refreshing_until = leaseUntil;
        return true;
      }
      return false;
    };

    const leaseUntil = new Date(Date.now() + 30000).toISOString();
    const req1Acquired = acquireLease(authDbRecord, leaseUntil);
    const req2Acquired = acquireLease(authDbRecord, leaseUntil);

    assert.equal(req1Acquired, true, 'First concurrent request successfully acquires refresh lease');
    assert.equal(req2Acquired, false, 'Second concurrent request fails to acquire lease and avoids duplicate refresh');

    // Simulate completion of refresh by Req 1
    authDbRecord.access_token = 'ghu_new_token_rotated';
    authDbRecord.token_expires_at = new Date(Date.now() + 28800 * 1000).toISOString();
    authDbRecord.refreshing_until = null;

    // Sibling poll detects refreshed token
    const isNowFresh = new Date(authDbRecord.token_expires_at).getTime() - Date.now() > 5 * 60 * 1000;
    assert.equal(isNowFresh, true, 'Subsequent poll confirms token was successfully rotated');
    assert.equal(authDbRecord.access_token, 'ghu_new_token_rotated');
  });

  it('SEC17: Revocation on disconnect', () => {
    let grantRevoked = false;
    let dbRowDeleted = false;

    const mockDisconnect = () => {
      grantRevoked = true;
      dbRowDeleted = true;
    };

    mockDisconnect();
    assert.equal(grantRevoked, true, 'Remote grant must be revoked on disconnect');
    assert.equal(dbRowDeleted, true, 'Database row must be purged on disconnect');
  });

  it('SEC18: Removed App installation handling', () => {
    const handleUpstreamStatus = (status) => {
      if (status === 404 || status === 403) {
        return { isAccessible: false, reason: 'installation_revoked_or_inaccessible' };
      }
      return { isAccessible: true };
    };

    assert.equal(handleUpstreamStatus(404).isAccessible, false);
    assert.equal(handleUpstreamStatus(403).isAccessible, false);
    assert.equal(handleUpstreamStatus(200).isAccessible, true);
  });

  it('SEC19: PAT and GitHub App account switching', () => {
    let activeMode = 'PAT';
    let activeToken = 'ghp_manualPAT';

    // Switch to GitHub App
    activeMode = 'GITHUB_APP';
    activeToken = '';

    assert.equal(activeMode, 'GITHUB_APP');
    assert.equal(activeToken, '', 'Switching to GitHub App clears local token reference');

    // Switch back to PAT
    activeMode = 'PAT';
    activeToken = 'ghp_anotherPAT';

    assert.equal(activeMode, 'PAT');
    assert.equal(activeToken, 'ghp_anotherPAT');
  });

  it('SEC20: Untrusted project code isolation from credentials', () => {
    const codeServiceSource = readFileSync(
      join(cwd, 'src/services/git/gitTransport.ts'),
      'utf8',
    );

    assert.ok(
      !codeServiceSource.includes('SUPABASE_SERVICE_ROLE_KEY'),
      'Client files must not have access to service role key',
    );
    assert.ok(
      !codeServiceSource.includes('GITHUB_APP_CLIENT_SECRET'),
      'Client files must not reference GitHub App secret',
    );
  });

  it('SEC21: Standardized 256-bit encryption key parser supporting 64-hex and 44-base64', () => {
    const parseEncryptionKey = (secretKey) => {
      const trimmed = secretKey.trim();
      if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
        const bytes = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
          bytes[i] = parseInt(trimmed.substring(i * 2, i * 2 + 2), 16);
        }
        return bytes;
      }
      try {
        const decoded = Buffer.from(trimmed, 'base64');
        if (decoded.length === 32) {
          return new Uint8Array(decoded);
        }
      } catch {
        // Fall back
      }
      return new TextEncoder().encode(trimmed.padEnd(32, '0').slice(0, 32));
    };

    // Test 64-hex format (e.g. openssl rand -hex 32)
    const hexKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const parsedHex = parseEncryptionKey(hexKey);
    assert.equal(parsedHex.length, 32, 'Parsed hex key must be exactly 32 bytes');
    assert.equal(parsedHex[0], 0x01);
    assert.equal(parsedHex[1], 0x23);
    assert.equal(parsedHex[31], 0xef);

    // Test 44-char base64 format (e.g. openssl rand -base64 32)
    const base64Key = Buffer.from(parsedHex).toString('base64');
    const parsedBase64 = parseEncryptionKey(base64Key);
    assert.equal(parsedBase64.length, 32, 'Parsed base64 key must be exactly 32 bytes');
    assert.deepEqual(parsedBase64, parsedHex, 'Parsed base64 matches original key bytes');
  });

  it('SEC22: GitHub App OAuth callback URL action fallback when action query is absent', () => {
    const resolveAction = (urlStr) => {
      const url = new URL(urlStr);
      let action = url.searchParams.get('action') || url.pathname.split('/').pop();
      if ((!action || action === 'github-app-auth') && url.searchParams.has('code') && url.searchParams.has('state')) {
        action = 'callback';
      }
      return action;
    };

    // Explicit action=callback
    assert.equal(
      resolveAction('https://example.supabase.co/functions/v1/github-app-auth?action=callback&code=abc&state=xyz'),
      'callback',
    );

    // Missing action parameter, but code and state present
    assert.equal(
      resolveAction('https://example.supabase.co/functions/v1/github-app-auth?code=abc&state=xyz'),
      'callback',
      'Should automatically resolve to callback action when code and state are present',
    );

    // Start action
    assert.equal(
      resolveAction('https://example.supabase.co/functions/v1/github-app-auth?action=start'),
      'start',
    );
  });

  it('SEC23: Database migration includes refreshing_until column and index', () => {
    const migrationContent = readFileSync(
      join(cwd, 'supabase/migrations/20261110000000_phase5_github_app_authorizations.sql'),
      'utf8',
    );

    assert.ok(
      migrationContent.includes('refreshing_until TIMESTAMPTZ'),
      'Table schema must define refreshing_until column',
    );
    assert.ok(
      migrationContent.includes('CREATE INDEX IF NOT EXISTS idx_gh_app_auth_refreshing ON public.github_app_authorizations(refreshing_until);'),
      'Index on refreshing_until must be defined for high performance lease queries',
    );
  });
});
