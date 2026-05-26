const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = async function handler(req, res) {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return res.status(500).json({
        connected: false,
        error: 'Missing Upstash Redis environment variables',
      });
    }

    await redis.set('ladestack:test', 'ok', { ex: 60 });
    const value = await redis.get('ladestack:test');

    return res.status(200).json({
      connected: true,
      value,
    });
  } catch (error) {
    return res.status(500).json({
      connected: false,
      error: error.message,
    });
  }
};
