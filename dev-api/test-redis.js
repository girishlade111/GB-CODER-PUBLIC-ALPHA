/**
 * Redis connectivity probe.
 *
 * ## Why this is gated
 *
 * This file lives in `api/`, which is the deployed serverless function root, so
 * simply existing here publishes it as a live unauthenticated route. That made it a
 * write endpoint reachable by anyone: every hit unconditionally issued a Redis
 * `SET`, and it returned the driver's raw `error.message`, which can name the
 * endpoint, the account, and the failure mode.
 *
 * The route now refuses in production. It stays reachable in development, which is
 * the only place a connectivity probe is actually useful — and the `.env.example`
 * documents running it locally.
 *
 * If you need this in a deployed environment, put it behind a token rather than
 * relaxing the check: it writes to storage, and "is the database reachable" is not
 * something an anonymous caller should be able to ask on demand.
 */

module.exports = async function handler(req, res) {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    return res.status(404).json({ error: 'Not found' });
  }

  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return res.status(500).json({
        connected: false,
        error: 'Missing Upstash Redis environment variables',
      });
    }

    const { Redis } = require('@upstash/redis');
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    await redis.set('ladestack:test', 'ok', { ex: 60 });
    const value = await redis.get('ladestack:test');

    return res.status(200).json({
      connected: true,
      value,
    });
  } catch (error) {
    /*
     * The message is kept for a developer running this locally, which is the only
     * caller that can get past the gate above. It is not reachable in production.
     */
    return res.status(500).json({
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
