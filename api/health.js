/**
 * Vercel Serverless Function — GET /api/health
 */

try {
  require('dotenv').config();
  require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
} catch (_) {}

const { getProviderConfig } = require('./ai');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const provider = getProviderConfig();
  res.json({
    status: 'ok',
    ai: !!provider.apiKey,
    provider: provider.name,
    model: provider.model,
    providers: [
      {
        id: 'inception',
        name: 'Inception Labs',
        model: process.env.INCEPTION_MODEL || 'mercury-2.5',
        configured: !!process.env.INCEPTION_API_KEY,
        badge: 'Fast (~4s)',
        description: 'Mercury 2.5 — ultra-fast generation with reasoning',
      },
      {
        id: 'atria',
        name: 'Atria ASI',
        model: process.env.ATRIA_MODEL || 'Atria-Dawn-Preview',
        configured: !!process.env.ATRIA_API_KEY,
        badge: '256k Context',
        description: 'Atria Dawn Preview — deep reasoning & long context',
      },
      {
        id: 'nvidia',
        name: 'NVIDIA NIM',
        model: process.env.NVIDIA_MODEL || 'qwen/qwen3.5-397b-a17b',
        configured: !!process.env.NVIDIA_API_KEY,
        badge: 'Qwen 3.5 397B',
        description: 'Qwen 3.5 via NVIDIA NIM Foundation',
      },
    ],
  });
};
