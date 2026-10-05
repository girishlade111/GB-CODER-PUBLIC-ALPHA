'use strict';

/**
 * `POST|GET|DELETE /api/preview/sync` — the ephemeral document channel.
 *
 * The editor publishes the *assembled* preview document (not the html/css/js
 * triple) so the phone renders byte-for-byte what the desktop shows: external
 * libraries, JSX runtime, import maps and custom injections all included, with
 * no chance of the two sides disagreeing about how to assemble it.
 *
 * ## Why polling rather than SSE
 *
 * The obvious design is Server-Sent Events. It does not survive contact with
 * this deployment:
 *
 *   - Local dev is served by the Vite middleware and by Express, which is two
 *     more places to implement a long-lived response.
 *   - In production this is a Vercel function. An SSE connection pins one
 *     serverless instance, while the editor's `POST` almost certainly lands on a
 *     different one. The stream would open, sit silent, and never see an update.
 *     A push channel needs a shared bus (Redis pub/sub, Ably, Pusher); polling
 *     needs nothing.
 *
 * So writes bump a monotonic `version` and readers ask `?since=<version>`.
 * An unchanged document answers with roughly forty bytes. The mobile page polls
 * at ~900 ms, which reads as instant while costing one cheap request per second
 * from a single phone, and behaves identically on LAN and on cellular.
 */

const {
  MAX_DOCUMENT_CHARS,
  createSessionId,
  isValidSessionId,
  writeSession,
  readSession,
  deleteSession,
  isDurable,
  sendJson,
  guard,
} = require('./_session-store');

/**
 * POST — create a session, or replace the document in an existing one.
 *
 * Idempotent by id: the editor republishes to the same session for its whole
 * lifetime, so a phone that scans once keeps working without re-scanning.
 */
async function handlePublish(req, res) {
  const guarded = await guard(req, res, 'publish', { methods: ['POST'] });
  if (!guarded.ok) return;

  const { id, document } = guarded.body;

  if (typeof document !== 'string') {
    sendJson(res, 400, { error: 'A `document` string is required.' });
    return;
  }
  if (document.length > MAX_DOCUMENT_CHARS) {
    sendJson(res, 413, {
      error: `Document too large to sync (${document.length} characters, limit ${MAX_DOCUMENT_CHARS}).`,
    });
    return;
  }
  // An empty document is legitimate — it is what a freshly cleared editor sends.
  if (id !== undefined && !isValidSessionId(id)) {
    sendJson(res, 400, { error: 'Malformed session id.' });
    return;
  }

  const sessionId = isValidSessionId(id) ? id : createSessionId();
  const entry = await writeSession(sessionId, document);

  sendJson(res, 200, {
    id: sessionId,
    version: entry.version,
    updatedAt: entry.updatedAt,
    durable: isDurable(),
  });
}

/**
 * GET — fetch the document, or just ask whether it changed.
 *
 * `?since` is the version the reader already holds. When it matches, the
 * response omits `document` entirely, which is what keeps the poll cheap.
 */
async function handleRead(req, res) {
  const guarded = await guard(req, res, 'read', { methods: ['GET'] });
  if (!guarded.ok) return;

  const id = req.query?.id;
  if (!isValidSessionId(id)) {
    sendJson(res, 400, { error: 'A valid session `id` is required.' });
    return;
  }

  const entry = await readSession(id);
  if (!entry) {
    sendJson(res, 404, { error: 'This preview session has expired or never existed.' });
    return;
  }

  const since = Number.parseInt(req.query?.since, 10);
  const unchanged = Number.isFinite(since) && since === entry.version;

  sendJson(res, 200, {
    id,
    version: entry.version,
    updatedAt: entry.updatedAt,
    // A no-op publish (identical document) still advances `version`; the client
    // re-renders only when `document` actually differs, tracked by its own hash.
    changed: !unchanged,
    ...(unchanged ? {} : { document: entry.document }),
  });
}

/** DELETE — end the session immediately when the editor closes the modal. */
async function handleDelete(req, res) {
  const guarded = await guard(req, res, 'publish', { methods: ['DELETE'] });
  if (!guarded.ok) return;

  const id = req.query?.id;
  if (!isValidSessionId(id)) {
    sendJson(res, 400, { error: 'A valid session `id` is required.' });
    return;
  }

  await deleteSession(id);
  sendJson(res, 200, { id, deleted: true });
}

module.exports = async (req, res) => {
  try {
    switch (req.method) {
      case 'POST':
        await handlePublish(req, res);
        return;
      case 'GET':
        await handleRead(req, res);
        return;
      case 'DELETE':
        await handleDelete(req, res);
        return;
      default:
        res.setHeader('Allow', 'POST, GET, DELETE');
        sendJson(res, 405, { error: 'Use POST, GET or DELETE.' });
    }
  } catch (error) {
    console.error('[api/preview/sync] Error:', error.message);
    sendJson(res, 500, { error: 'Mobile preview sync failed. Try again.' });
  }
};
