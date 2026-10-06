'use strict';

/**
 * `GET /api/preview/lan-info` — which address should the QR code point at?
 *
 * Deliberately a no-op on Vercel: `os.networkInterfaces()` there describes the
 * serverless function's own sandbox, not the developer's laptop, so the honest
 * answer is "no LAN address available". The client falls back to cloud mode.
 */

const { buildLanInfo } = require('./_lan');
const { sendJson, isDurable } = require('./_session-store');

module.exports = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    sendJson(res, 405, { error: 'Use GET.' });
    return;
  }

  try {
    // A serverless runtime has no route to the developer's LAN.
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      sendJson(res, 200, {
        localIp: null,
        port: null,
        addresses: [],
        sameNetworkLikely: false,
        serverless: true,
        durable: isDurable(),
      });
      return;
    }

    const info = buildLanInfo(req.query?.port);
    sendJson(res, 200, {
      ...info,
      serverless: false,
      /**
       * Whether sessions persist across processes. LAN mode works either way —
       * this is surfaced so the UI can tell the user why cloud mode would be
       * needed for a device off the local network.
       */
      durable: isDurable(),
    });
  } catch (error) {
    console.error('[api/preview/lan-info] Error:', error.message);
    sendJson(res, 500, { error: 'Could not determine the local network address.' });
  }
};
