'use strict';

/**
 * `GET /api/preview/lan-info` — which address should the QR code point at?
 *
 * Development-only, and served by the dev servers via a fallback lookup in
 * `dev-api/`. It is not deployed.
 *
 * It used to live in `api/`, where simply existing published it as a live
 * serverless function. That was a poor trade: `os.networkInterfaces()` inside a
 * serverless function describes that function's own sandbox, never the
 * developer's laptop, so every deployed call returned a constant "no LAN address
 * available" — while consuming one of Vercel's twelve Hobby function slots.
 *
 * The client treats a 404 from this route as "no LAN available" and falls back to
 * cloud mode, so nothing is lost in production by its absence here.
 */

const { buildLanInfo } = require('../../api/preview/_lan');
const { sendJson, isDurable } = require('../../api/preview/_session-store');

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
