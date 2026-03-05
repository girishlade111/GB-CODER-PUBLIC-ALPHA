/**
 * Vercel Serverless Function — GET /api/health
 */

'use strict';

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    status: 'ok',
    ai: !!process.env.NVIDIA_API_KEY,
    model: process.env.NVIDIA_MODEL || 'qwen/qwen3.5-397b-a17b',
  });
};
