/**
 * Vercel Serverless Function - POST /api/share
 *
 * Stores preview code in Upstash Redis and returns a short preview URL.
 */

'use strict';

const crypto = require('crypto');
const { Redis } = require('@upstash/redis');

const PREVIEW_TTL_SECONDS = 2_592_000; // 30 days
const RATE_LIMIT_TTL_SECONDS = 3_600; // 1 hour
const RATE_LIMIT_MAX = 10;
const PREVIEW_URL_BASE = 'https://code.ladestack.in/preview';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.socket?.remoteAddress || 'unknown';
}

function createShortId() {
  return crypto.randomBytes(6).toString('base64url').slice(0, 8);
}

function normalizeCode(value) {
  return typeof value === 'string' ? value : '';
}

async function checkRateLimit(ip) {
  const key = `ratelimit:share:${ip}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, RATE_LIMIT_TTL_SECONDS);
  }

  return count <= RATE_LIMIT_MAX;
}

async function savePreviewWithUniqueId(payload) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = createShortId();
    const key = `preview:${id}`;
    const saved = await redis.set(key, JSON.stringify(payload), {
      ex: PREVIEW_TTL_SECONDS,
      nx: true,
    });

    if (saved === 'OK') {
      return id;
    }
  }

  throw new Error('Failed to generate unique preview id');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return res.status(500).json({ error: 'Failed to save preview. Try again.' });
  }

  const html = normalizeCode(req.body?.html);
  const css = normalizeCode(req.body?.css);
  const javascript = normalizeCode(req.body?.javascript);

  if (!html.trim() && !css.trim() && !javascript.trim()) {
    return res.status(400).json({ error: 'Cannot share an empty project' });
  }

  try {
    const ip = getClientIp(req);
    const allowed = await checkRateLimit(ip);

    if (!allowed) {
      return res.status(429).json({ error: 'Too many shares. Try again in an hour.' });
    }

    const payload = {
      html,
      css,
      javascript,
      createdAt: Date.now(),
    };
    const id = await savePreviewWithUniqueId(payload);

    return res.status(200).json({
      id,
      url: `${PREVIEW_URL_BASE}/${id}`,
    });
  } catch (error) {
    console.error('[share] Failed to save preview:', error);
    return res.status(500).json({ error: 'Failed to save preview. Try again.' });
  }
};
