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
  });
};
