/**
 * POST /api/sandbox/exec
 *
 * Runs one command in the sandbox and returns its output. This backs the
 * Terminal tab's Sandbox Mode.
 *
 * ── Why this is not a PTY ───────────────────────────────────────────────────
 * The brief asks for a real PTY over a WebSocket proxy. Vercel serverless
 * functions cannot hold a WebSocket or a long-lived process, so a true TTY is not
 * available on this deployment target. This endpoint is the honest alternative: a
 * request/response command runner that satisfies the goal ("run ANY command
 * manually") without pretending to be interactive.
 *
 * The practical difference is that full-screen interactive programs — vim, top,
 * an npm prompt waiting on a keypress — will not work; `cwd` is also carried by
 * the client rather than by a live shell. The terminal UI states this plainly
 * rather than letting the user discover it by hanging.
 *
 * Request:  { e2bApiKey, sandboxId, command, cwd? }
 * Response: { stdout, stderr, exitCode, cwd }
 */

'use strict';

const { guard, sendJson, connectSandbox, describeError, redact } = require('./_shared');

const PROJECT_ROOT = '/home/user/project';
/** Kept under the platform's function ceiling so a hang returns a real error. */
const EXEC_TIMEOUT_MS = 60 * 1000;
const MAX_OUTPUT_CHARS = 100_000;

/**
 * Commands refused outright.
 *
 * Not a security boundary — the sandbox is the user's own and E2B already
 * isolates it. This only blocks input that would wedge the session in a way the
 * user cannot recover from, since there is no Ctrl-C to send.
 */
const BLOCKED = [
  { pattern: /^\s*(vim?|nano|emacs|less|more|top|htop)\b/i, reason: 'interactive programs' },
  { pattern: /\byes\s*$/i, reason: 'commands that never terminate' },
];

module.exports = async function handler(req, res) {
  const checked = guard(req, res, 'exec');
  if (!checked.ok) return;

  const { body, apiKey } = checked;
  const command = typeof body.command === 'string' ? body.command.trim() : '';
  if (!command) return sendJson(res, 400, { error: 'A command is required.' });
  if (command.length > 4000) return sendJson(res, 400, { error: 'Command is too long.' });

  for (const rule of BLOCKED) {
    if (rule.pattern.test(command)) {
      return sendJson(res, 200, {
        stdout: '',
        stderr:
          `This terminal cannot run ${rule.reason}: it executes each command and returns its ` +
          `output, rather than holding a live TTY. Try a non-interactive equivalent.`,
        exitCode: 1,
        cwd: typeof body.cwd === 'string' ? body.cwd : PROJECT_ROOT,
      });
    }
  }

  const cwd = typeof body.cwd === 'string' && body.cwd.startsWith('/') ? body.cwd : PROJECT_ROOT;

  try {
    const sandbox = await connectSandbox(body.sandboxId, apiKey);

    /*
     * `cd` is echoed back so the client can track the working directory across
     * requests. Without this every command would start from the project root and
     * `cd src` would appear to do nothing.
     */
    const wrapped = `cd ${shellQuote(cwd)} 2>/dev/null || cd ${shellQuote(PROJECT_ROOT)}; ${command}\nprintf '\\n__GBCWD__%s' "$(pwd)"`;

    const result = await sandbox.commands.run(wrapped, { timeoutMs: EXEC_TIMEOUT_MS });

    let stdout = String(result.stdout || '');
    let nextCwd = cwd;
    const marker = stdout.lastIndexOf('__GBCWD__');
    if (marker !== -1) {
      nextCwd = stdout.slice(marker + '__GBCWD__'.length).trim() || cwd;
      stdout = stdout.slice(0, marker).replace(/\n$/, '');
    }

    return sendJson(res, 200, {
      stdout: truncate(redact(stdout, apiKey)),
      stderr: truncate(redact(String(result.stderr || ''), apiKey)),
      exitCode: result.exitCode,
      cwd: nextCwd,
    });
  } catch (error) {
    const described = describeError(error, apiKey);
    /*
     * A command that fails is normal terminal behaviour, not an API failure, so
     * timeouts come back as output the terminal can print.
     */
    if (described.status === 504) {
      return sendJson(res, 200, {
        stdout: '',
        stderr: `Command timed out after ${EXEC_TIMEOUT_MS / 1000}s and was abandoned.`,
        exitCode: 124,
        cwd,
      });
    }
    return sendJson(res, described.status, { error: described.error });
  }
};

function shellQuote(value) {
  return `'${String(value).split("'").join(`'\\''`)}'`;
}

function truncate(text) {
  if (text.length <= MAX_OUTPUT_CHARS) return text;
  return `${text.slice(0, MAX_OUTPUT_CHARS)}\n… output truncated`;
}
