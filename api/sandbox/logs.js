/**
 * POST /api/sandbox/logs
 *
 * Returns new output from the background dev server since a given offset.
 *
 * Polled rather than streamed. A serverless function has no persistent
 * connection to stream over, so /start redirects the dev server's output to a
 * file and this tails it by byte offset — the client passes the offset it last
 * saw and gets only what is new, which keeps polling cheap.
 *
 * Request:  { e2bApiKey, sandboxId, logPath?, offset? }
 * Response: { chunk, offset, size, running }
 */

'use strict';

const { guard, sendJson, connectSandbox, describeError, redact } = require('./_shared');

const PROJECT_ROOT = '/home/user/project';
const DEFAULT_LOG = `${PROJECT_ROOT}/.gbcoder-dev.log`;
/** Cap per poll so a noisy server cannot return megabytes at once. */
const MAX_CHUNK_BYTES = 64 * 1024;

module.exports = async function handler(req, res) {
  const checked = guard(req, res, 'logs');
  if (!checked.ok) return;

  const { body, apiKey } = checked;
  const logPath = typeof body.logPath === 'string' && body.logPath.startsWith('/')
    ? body.logPath
    : DEFAULT_LOG;
  const offset = Number.isFinite(body.offset) && body.offset >= 0 ? Math.floor(body.offset) : 0;

  try {
    const sandbox = await connectSandbox(body.sandboxId, apiKey);

    // Size first: it tells us whether there is anything new and lets the client
    // recover if the file was truncated by a restart.
    const sizeResult = await sandbox.commands.run(
      `stat -c %s ${shellQuote(logPath)} 2>/dev/null || echo 0`,
      { timeoutMs: 15_000 },
    );
    const size = Number(String(sizeResult.stdout || '0').trim()) || 0;

    // A smaller file than our offset means it was rotated or restarted.
    const from = size < offset ? 0 : offset;
    let chunk = '';

    if (size > from) {
      const bytes = Math.min(size - from, MAX_CHUNK_BYTES);
      const read = await sandbox.commands.run(
        `tail -c +${from + 1} ${shellQuote(logPath)} 2>/dev/null | head -c ${bytes}`,
        { timeoutMs: 20_000 },
      );
      chunk = String(read.stdout || '');
    }

    /* Is anything still listening? Cheap liveness signal for the UI. */
    let running = false;
    try {
      const alive = await sandbox.commands.run(
        "pgrep -f 'node|python|uvicorn|gunicorn' >/dev/null 2>&1 && echo yes || echo no",
        { timeoutMs: 10_000 },
      );
      running = String(alive.stdout || '').trim() === 'yes';
    } catch {
      // Liveness is advisory.
    }

    return sendJson(res, 200, {
      chunk: redact(chunk, apiKey),
      offset: from + Buffer.byteLength(chunk, 'utf8'),
      size,
      running,
      truncated: size < offset,
    });
  } catch (error) {
    const described = describeError(error, apiKey);
    return sendJson(res, described.status, { error: described.error });
  }
};

function shellQuote(value) {
  return `'${String(value).split("'").join(`'\\''`)}'`;
}
