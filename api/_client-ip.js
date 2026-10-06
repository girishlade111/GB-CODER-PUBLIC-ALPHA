/**
 * Client address for rate-limiting keys.
 *
 * ## Why this is not a one-liner
 *
 * Every rate limiter in `api/` used to key on `X-Forwarded-For`, preferring it
 * over the socket address. That is only safe behind a proxy that *overwrites*
 * the header, and the safety depends entirely on which host the code is running
 * on:
 *
 *  - **On Vercel**, `X-Forwarded-For` is set by the edge and a client cannot forge
 *    it. Reading it is correct, and in fact necessary — `req.socket.remoteAddress`
 *    is the address of a shared load balancer, so keying on the socket would put
 *    every visitor in one bucket and make the limiter useless in the other
 *    direction.
 *  - **On the self-hosted Express server** (`server/index.js`) and behind the Vite
 *    dev middleware, there is no such proxy. The header is whatever the caller
 *    typed, so keying on it means the limiter proves only that the client sent a
 *    new string. `curl -H 'X-Forwarded-For: 1.2.3.4'` with a different value per
 *    request is always a "first request".
 *
 * With those limits unenforced, `/api/ai` (30/min, up to 16 384 output tokens per
 * call, and it may make two upstream calls for one request) and
 * `/api/vision-to-code` were unmetered billing on someone else's key.
 *
 * So the rule is environment-aware, and fails towards the safe answer: when there
 * is no trusted proxy in front of us, the only address we actually know is the
 * socket's, and headers are ignored entirely.
 */

/** Set by Vercel on every serverless invocation. */
const ON_VERCEL = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);

/**
 * The address to use as a rate-limit key.
 *
 * Returns `'unknown'` rather than a random value when nothing is available: a
 * shared `'unknown'` bucket is a conservative failure that still limits, whereas
 * a per-request value would not limit at all.
 *
 * @param {{ headers?: Record<string, unknown>, socket?: { remoteAddress?: string } }} req
 * @returns {string}
 */
function clientIp(req) {
  const socketAddress = req?.socket?.remoteAddress;

  if (ON_VERCEL) {
    // The edge owns this header: it is either absent (direct) or a chain whose
    // left-most entry Vercel itself wrote.
    const forwarded = req?.headers?.['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
      return forwarded.split(',')[0].trim();
    }
  }

  if (socketAddress) return socketAddress;

  // No trusted proxy and no socket address. Do not fall back to the headers here:
  // on this path they are attacker-controlled, so trusting them reintroduces the
  // exact bypass this module exists to close.
  return 'unknown';
}

/**
 * Bounded sliding-window counter.
 *
 * Extracted here because four endpoints had grown four slightly different copies,
 * three of which never pruned — a `Map` keyed on a spoofable value grows without
 * limit for the life of a serverless instance.
 */
class RateLimiter {
  /**
   * @param {Record<string, number>} limits requests allowed per window, per action
   * @param {number} windowMs
   */
  constructor(limits, windowMs = 60 * 1000) {
    this.limits = limits;
    this.windowMs = windowMs;
    /** @type {Map<string, { start: number, count: number }>} */
    this.buckets = new Map();
  }

  /**
   * @param {string} key
   * @param {number} limit
   * @returns {{ allowed: boolean, retryAfterSeconds: number }}
   */
  check(key, limit) {
    const now = Date.now();
    this.prune(now);

    const bucket = this.buckets.get(key);
    if (!bucket || now - bucket.start > this.windowMs) {
      this.buckets.set(key, { start: now, count: 1 });
      return { allowed: true, retryAfterSeconds: 0 };
    }

    bucket.count += 1;
    if (bucket.count <= limit) return { allowed: true, retryAfterSeconds: 0 };

    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((this.windowMs - (now - bucket.start)) / 1000),
    };
  }

  /** Drops buckets that can no longer affect a decision. */
  prune(now = Date.now()) {
    for (const [key, bucket] of this.buckets) {
      if (now - bucket.start > this.windowMs * 2) this.buckets.delete(key);
    }
  }
}

module.exports = { clientIp, RateLimiter, ON_VERCEL };
