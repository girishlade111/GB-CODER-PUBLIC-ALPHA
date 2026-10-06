/**
 * Shared plumbing for the QR mobile-preview endpoints.
 *
 * ── Why the state lives on globalThis ──────────────────────────────────────
 * Both hosts reload the handler module on *every* request: the Vite dev plugin
 * does `delete require.cache[require.resolve(handlerFile)]` before each call so
 * that `.env` edits are picked up without a restart, and `server/index.js`
 * re-requires on each dispatch. A module-level `Map` would therefore be empty
 * again by the time the next request arrived, and LAN mode — which never leaves
 * the developer's machine — would appear to lose every write.
 *
 * Hanging the map off a well-known global key makes it survive module reloads
 * while still living in one process, which is exactly the lifetime LAN mode has.
 *
 * ── Why Redis is optional ──────────────────────────────────────────────────
 * With credentials configured the session is stored in Upstash so a phone on
 * cellular data (cloud mode) can read a document written by the editor. Without
 * them everything still works against the in-process map, which is what makes
 * LAN mode useful with no account, no keys, and no network round trip. Nothing
 * in the browser is aware of which backend answered.
 *
 * ── Unauthenticated by design ──────────────────────────────────────────────
 * The phone scans a QR code and lands on a preview; asking it to log into an
 * editor to do so would defeat the feature. The session id is therefore the
 * capability: 192 bits of CSPRNG entropy, unguessable, expiring on a sliding
 * 30-minute TTL that only refreshes while the editor is pushing. Publishing is
 * rate limited and size capped so this cannot be used as free storage or as a
 * way to hammer the Redis account.
 *
 * Note the deliberate absence of `Access-Control-Allow-Origin`. Every consumer
 * here — editor, phone on Wi-Fi, phone on cellular — is same-origin with the API
 * it calls, so a CORS header buys nothing and would hand a write endpoint to
 * every site on the internet.
 */

'use strict';

const crypto = require('crypto');

/** Sliding lifetime. Refreshed on publish and on read, so an active pair never expires. */
const SESSION_TTL_SECONDS = 30 * 60;

/**
 * Ceiling on one assembled preview document.
 *
 * The desktop sends the *fully assembled* srcdoc (external libraries, JSX
 * runtime, import maps, custom injections) rather than the html/css/js triple,
 * so the phone renders exactly what the desktop does. A bundled React/Vue project
 * lands in the low hundreds of KB. 1.5M characters keeps a single publish under
 * Vercel's 4.5 MB body limit with room for the JSON envelope.
 */
const MAX_DOCUMENT_CHARS = 1_500_000;

const REDIS_PREFIX = 'mbprev:';

const RATE_WINDOW_MS = 60_000;
const RATE_LIMITS = {
  /** A live session republishes roughly once per editor keystroke burst. */
  publish: 120,
  /** The phone polls; a minute of polling is ~65 requests. */
  read: 900,
};

const GLOBAL_KEY = '__gbCoderMobilePreviewSessions__';

/* ── Rate limiting ─────────────────────────────────────────────────────────
 * Redis when available so the limit survives instance recycling; otherwise an
 * in-process bucket, matching the existing api/ai.js approach and good enough
 * for a dev-machine endpoint. Either way it is best-effort, not a hard wall —
 * it exists to stop one client hammering the proxy, not to authenticate.
 */
const buckets = new Map();

// Shared implementation — the previous local copy preferred X-Forwarded-For
// unconditionally, which off Vercel meant the caller picked its own bucket and the
// limit proved nothing. See api/_client-ip.js.
const { clientIp } = require('../_client-ip');

let redisClient;
let redisChecked = false;

/** Lazily built Upstash client, or null when the credentials are absent. */
function getRedis() {
  if (redisChecked) return redisClient;
  redisChecked = true;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    redisClient = null;
    return redisClient;
  }
  try {
    const { Redis } = require('@upstash/redis');
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (error) {
    // A misconfigured or unreachable Redis must not take the LAN path down.
    console.error('[preview/_session-store] Upstash unavailable, using memory:', error.message);
    redisClient = null;
  }
  return redisClient;
}

/** True when sessions survive across processes. Surfaced to the client for honesty. */
function isDurable() {
  return getRedis() !== null;
}

function memoryStore() {
  if (!globalThis[GLOBAL_KEY]) globalThis[GLOBAL_KEY] = new Map();
  return globalThis[GLOBAL_KEY];
}

/**
 * Drops expired entries. Runs on every write, which is frequent enough that no
 * timer is needed — and a serverless function could not hold one anyway.
 */
function prune(store) {
  const now = Date.now();
  for (const [id, entry] of store) {
    if (entry.expiresAt <= now) store.delete(id);
  }
}

/**
 * @returns {{ allowed: boolean, retryAfterSeconds: number }}
 */
async function checkRateLimit(req, action) {
  const limit = RATE_LIMITS[action] ?? 60;
  const key = `${action}:${clientIp(req)}`;

  const redis = getRedis();
  if (redis) {
    try {
      const count = await redis.incr(`${REDIS_PREFIX}rl:${key}`);
      if (count === 1) await redis.expire(`${REDIS_PREFIX}rl:${key}`, Math.ceil(RATE_WINDOW_MS / 1000));
      if (count <= limit) return { allowed: true, retryAfterSeconds: 0 };
      return { allowed: false, retryAfterSeconds: Math.ceil(RATE_WINDOW_MS / 1000) };
    } catch (error) {
      // Fall through to the in-process bucket rather than failing the request.
      console.error('[preview/_session-store] rate limit degraded:', error.message);
    }
  }

  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.start > RATE_WINDOW_MS) {
    buckets.set(key, { start: now, count: 1 });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  bucket.count += 1;
  if (bucket.count <= limit) return { allowed: true, retryAfterSeconds: 0 };
  return {
    allowed: false,
    retryAfterSeconds: Math.ceil((RATE_WINDOW_MS - (now - bucket.start)) / 1000),
  };
}

/** 192 bits, base64url. Longer than the 8-character share ids on purpose. */
function createSessionId() {
  return crypto.randomBytes(24).toString('base64url');
}

function isValidSessionId(id) {
  // base64url alphabet only, and exactly 32 characters.
  return typeof id === 'string' && /^[A-Za-z0-9_-]{32}$/.test(id);
}

async function writeSession(id, document) {
  const entry = { document, updatedAt: Date.now(), version: Date.now() };

  const redis = getRedis();
  if (redis) {
    try {
      await redis.set(`${REDIS_PREFIX}s:${id}`, JSON.stringify(entry), { ex: SESSION_TTL_SECONDS });
      return entry;
    } catch (error) {
      console.error('[preview/_session-store] write degraded to memory:', error.message);
    }
  }

  const store = memoryStore();
  prune(store);
  store.set(id, { ...entry, expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000 });
  return entry;
}

/** @returns {Promise<{ document: string, version: number, updatedAt: number } | null>} */
async function readSession(id) {
  const redis = getRedis();
  if (redis) {
    try {
      const raw = await redis.get(`${REDIS_PREFIX}s:${id}`);
      if (!raw) return null;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      // Sliding expiry: a phone that keeps polling keeps the session warm.
      await redis.expire(`${REDIS_PREFIX}s:${id}`, SESSION_TTL_SECONDS);
      return { document: parsed.document, version: parsed.version, updatedAt: parsed.updatedAt };
    } catch (error) {
      console.error('[preview/_session-store] read degraded to memory:', error.message);
    }
  }

  const store = memoryStore();
  prune(store);
  const entry = store.get(id);
  if (!entry) return null;
  entry.expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  return { document: entry.document, version: entry.version, updatedAt: entry.updatedAt };
}

async function deleteSession(id) {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(`${REDIS_PREFIX}s:${id}`);
    } catch (error) {
      console.error('[preview/_session-store] delete failed:', error.message);
    }
  }
  memoryStore().delete(id);
}

/* ── Response helpers ────────────────────────────────────────────────────── */

function sendJson(res, status, payload) {
  if (typeof res.status === 'function') res.status(status);
  else res.statusCode = status;
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json');
    // Sessions are mutable behind the id; never let a proxy or the PWA cache them.
    res.setHeader('Cache-Control', 'no-store');
  }
  if (typeof res.json === 'function') return res.json(payload);
  return res.end(JSON.stringify(payload));
}

/**
 * Shared prelude: CORS-less by design, method gate, rate limit, body parse.
 * @returns {{ ok: false } | { ok: true, body: object }}
 */
async function guard(req, res, action, { methods = ['POST'] } = {}) {
  if (!methods.includes(req.method)) {
    res.setHeader('Allow', methods.join(', '));
    sendJson(res, 405, { error: `Use ${methods.join(' or ')}.` });
    return { ok: false };
  }

  const rate = await checkRateLimit(req, action);
  if (!rate.allowed) {
    res.setHeader('Retry-After', String(rate.retryAfterSeconds));
    sendJson(res, 429, {
      error: `Too many mobile-preview requests. Try again in ${rate.retryAfterSeconds}s.`,
    });
    return { ok: false };
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      sendJson(res, 400, { error: 'Malformed JSON body.' });
      return { ok: false };
    }
  }
  if (body === undefined || body === null) body = {};
  if (typeof body !== 'object') {
    sendJson(res, 400, { error: 'A JSON object body is required.' });
    return { ok: false };
  }

  return { ok: true, body };
}

module.exports = {
  SESSION_TTL_SECONDS,
  MAX_DOCUMENT_CHARS,
  createSessionId,
  isValidSessionId,
  writeSession,
  readSession,
  deleteSession,
  checkRateLimit,
  isDurable,
  sendJson,
  guard,
};
