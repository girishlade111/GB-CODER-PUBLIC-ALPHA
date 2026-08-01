/**
 * Shared plumbing for the E2B sandbox proxy.
 *
 * ── Statelessness ───────────────────────────────────────────────────────────
 * This proxy holds nothing between requests. `create` returns a `sandboxId`, and
 * every later call reconnects with `Sandbox.connect(sandboxId, { apiKey })`. That
 * is what lets the whole thing live in serverless functions, which are torn down
 * between invocations and cannot keep an object alive.
 *
 * ── Key hygiene ─────────────────────────────────────────────────────────────
 * The user's E2B key arrives in the request body, is used inside that single
 * invocation, and is never written to a log, a response, or storage. `redact()`
 * is applied to everything that leaves this process, because SDK errors have a
 * habit of quoting the credential they were given.
 *
 * ── Lifetime ────────────────────────────────────────────────────────────────
 * Inactivity shutdown is delegated to E2B's own sandbox timeout rather than a
 * server-side timer. A serverless function cannot hold a 15-minute timer, so
 * expiry is set on the sandbox itself at creation and pushed forward on activity.
 * If this proxy disappears, the sandbox still expires on schedule.
 */

'use strict';

const { Sandbox } = require('e2b');

/** Sandbox lifetime, refreshed on each interaction. */
const SANDBOX_TIMEOUT_MS = 15 * 60 * 1000;
/** Upper bound on a single command, so one hung install cannot pin a function. */
const COMMAND_TIMEOUT_MS = 110 * 1000;
/** Cap on uploaded payload, mirroring the client's 50 MB import ceiling. */
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const MAX_FILES = 1500;

/* ── Rate limiting ──────────────────────────────────────────────────────────
 * Per-IP, in-memory, matching the existing api/ai.js approach. Serverless
 * instances are recycled so this is best-effort rather than a hard guarantee —
 * enough to stop a single client hammering the proxy, which is what it is for.
 * The compute cost sits on the user's own E2B key; this protects our server.
 */
const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMITS = {
  create: 5, // sandbox creation is expensive
  start: 20,
  exec: 120, // the terminal is chatty by nature
  logs: 300, // polled
  close: 20,
};
const buckets = new Map();

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) return forwarded.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

/** @returns {{ allowed: boolean, retryAfterSeconds: number }} */
function checkRateLimit(req, action) {
  const limit = RATE_LIMITS[action] ?? 30;
  const key = `${action}:${clientIp(req)}`;
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

/*
 * Opportunistic cleanup: without it the map grows for the life of the instance.
 */
function pruneBuckets() {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now - bucket.start > RATE_WINDOW_MS * 2) buckets.delete(key);
  }
}

/* ── Key handling ───────────────────────────────────────────────────────────── */

/**
 * Strips anything resembling the caller's key from text that will be returned
 * or logged. SDK and CLI errors frequently echo credentials.
 */
function redact(text, apiKey) {
  if (typeof text !== 'string') return text;
  let safe = text;
  if (apiKey && apiKey.length >= 8) safe = safe.split(apiKey).join('[redacted]');
  // Generic catch-all for E2B-style keys, in case a different one leaks through.
  return safe.replace(/e2b_[A-Za-z0-9]{8,}/g, 'e2b_[redacted]');
}

/** Validates the shape of a key without revealing it. */
function readApiKey(body) {
  const key = body && typeof body.e2bApiKey === 'string' ? body.e2bApiKey.trim() : '';
  if (!key) return { ok: false, error: 'An E2B API key is required.' };
  if (key.length < 12) return { ok: false, error: 'That does not look like a valid E2B API key.' };
  return { ok: true, key };
}

/* ── Request helpers ────────────────────────────────────────────────────────── */

function sendJson(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

/**
 * Shared guard: method check, rate limit, key extraction, JSON body parsing.
 * @returns {{ ok: false } | { ok: true, body: object, apiKey: string }}
 */
function guard(req, res, action, { requireKey = true } = {}) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Use POST.' });
    return { ok: false };
  }

  pruneBuckets();
  const rate = checkRateLimit(req, action);
  if (!rate.allowed) {
    res.setHeader('Retry-After', String(rate.retryAfterSeconds));
    sendJson(res, 429, {
      error: `Too many ${action} requests. Try again in ${rate.retryAfterSeconds}s.`,
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
  if (!body || typeof body !== 'object') {
    sendJson(res, 400, { error: 'A JSON body is required.' });
    return { ok: false };
  }

  if (!requireKey) return { ok: true, body, apiKey: '' };

  const key = readApiKey(body);
  if (!key.ok) {
    sendJson(res, 400, { error: key.error });
    return { ok: false };
  }

  return { ok: true, body, apiKey: key.key };
}

/** Reconnects to an existing sandbox, refreshing its expiry. */
async function connectSandbox(sandboxId, apiKey) {
  if (!sandboxId || typeof sandboxId !== 'string') {
    throw new Error('A sandboxId is required.');
  }
  const sandbox = await Sandbox.connect(sandboxId, { apiKey });
  // Activity pushes expiry out, so an in-use sandbox is not reaped mid-session.
  try {
    await sandbox.setTimeout(SANDBOX_TIMEOUT_MS);
  } catch {
    // A sandbox that refuses the extension is still usable right now.
  }
  return sandbox;
}

/**
 * Maps an SDK failure onto a client-safe message.
 *
 * An invalid key must read as an auth problem rather than a generic 500, since
 * that is the single most likely thing to go wrong.
 */
function describeError(error, apiKey) {
  const raw = error && error.message ? String(error.message) : 'Unknown sandbox error.';
  const message = redact(raw, apiKey);
  const name = error && error.name ? error.name : '';

  if (name === 'AuthenticationError' || /unauthor|invalid api key|forbidden/i.test(message)) {
    return { status: 401, error: 'E2B rejected that API key.' };
  }
  if (name === 'SandboxNotFoundError' || /not found|no longer running/i.test(message)) {
    return { status: 410, error: 'That sandbox is no longer running. Create a new one.' };
  }
  if (name === 'TimeoutError' || /timeout|deadline/i.test(message)) {
    return { status: 504, error: `Sandbox timed out: ${message}` };
  }
  return { status: 502, error: message };
}

/** Total size of an uploaded file list. */
function totalBytes(files) {
  return files.reduce((sum, file) => sum + Buffer.byteLength(file.content || '', 'utf8'), 0);
}

module.exports = {
  Sandbox,
  SANDBOX_TIMEOUT_MS,
  COMMAND_TIMEOUT_MS,
  MAX_UPLOAD_BYTES,
  MAX_FILES,
  guard,
  sendJson,
  connectSandbox,
  describeError,
  redact,
  totalBytes,
  clientIp,
  checkRateLimit,
};
