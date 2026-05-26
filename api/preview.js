/**
 * Vercel Serverless Function - GET /api/preview?id=SHORTID
 *
 * Loads shared preview code from Upstash Redis.
 */

'use strict';

const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

function getPreviewId(req) {
  const { id } = req.query || {};
  return typeof id === 'string' ? id.trim() : '';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return res.status(500).json({ error: 'Failed to load preview. Try again.' });
  }

  const id = getPreviewId(req);
  if (!id) {
    return res.status(404).json({ error: 'Preview not found or expired' });
  }

  try {
    const stored = await redis.get(`preview:${id}`);

    if (!stored) {
      return res.status(404).json({ error: 'Preview not found or expired' });
    }

    const preview = typeof stored === 'string' ? JSON.parse(stored) : stored;

    return res.status(200).json({
      html: typeof preview.html === 'string' ? preview.html : '',
      css: typeof preview.css === 'string' ? preview.css : '',
      javascript: typeof preview.javascript === 'string' ? preview.javascript : '',
      createdAt: preview.createdAt,
    });
  } catch (error) {
    console.error('[preview] Failed to load preview:', error);
    return res.status(500).json({ error: 'Failed to load preview. Try again.' });
  }
};
