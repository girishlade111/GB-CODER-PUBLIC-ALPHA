/**
 * POST /api/sandbox/start
 *
 * Runs the chosen start command in the background and reports which ports came
 * up, with a preview URL for each.
 *
 * Multiple URLs are returned when several ports are listening — a frontend dev
 * server plus an API, say — and the client shows a port selector rather than this
 * endpoint picking one.
 *
 * Request:  { e2bApiKey, sandboxId, command, ports?, projectRoot? }
 * Response: { started, previews: [{ port, label, url }], logs }
 */

'use strict';

const {
  COMMAND_TIMEOUT_MS,
  guard,
  sendJson,
  connectSandbox,
  describeError,
  redact,
} = require('./_shared');
const { labelForPort } = require('./_detect');

const PROJECT_ROOT = '/home/user/project';
/** Grace period for a dev server to bind before ports are probed. */
const BIND_WAIT_MS = 4000;

/**
 * Lists listening TCP ports inside the sandbox.
 *
 * Read from /proc/net/tcp rather than `ss`/`netstat`, which are not guaranteed to
 * be installed in a base image. Column 2 is the local address as HEX_IP:HEX_PORT,
 * and state 0A is LISTEN.
 */
const LISTENING_PORTS_COMMAND =
  "awk 'NR>1 && $4==\"0A\" {split($2,a,\":\"); print strtonum(\"0x\" a[2])}' /proc/net/tcp /proc/net/tcp6 2>/dev/null | sort -un";

module.exports = async function handler(req, res) {
  const checked = guard(req, res, 'start');
  if (!checked.ok) return;

  const { body, apiKey } = checked;
  const command = typeof body.command === 'string' ? body.command.trim() : '';
  if (!command) return sendJson(res, 400, { error: 'A start command is required.' });

  const projectRoot = typeof body.projectRoot === 'string' ? body.projectRoot : PROJECT_ROOT;
  const logs = [];
  const log = (stream, text) => {
    if (!text) return;
    logs.push({ stream, text: redact(String(text), apiKey), at: Date.now() });
  };

  try {
    const sandbox = await connectSandbox(body.sandboxId, apiKey);

    /*
     * Background, with output redirected to a file. A serverless function cannot
     * hold the process open, so the dev server has to outlive this request and
     * /api/sandbox/logs tails the file afterwards.
     */
    const logPath = `${projectRoot}/.gbcoder-dev.log`;
    const wrapped = `cd ${projectRoot} && nohup sh -c ${shellQuote(command)} > ${logPath} 2>&1 &`;

    log('system', `$ ${command}`);
    await sandbox.commands.run(wrapped, {
      cwd: projectRoot,
      timeoutMs: 15_000,
      background: false,
    });

    // Give the server a moment to bind before asking what is listening.
    await new Promise((resolve) => setTimeout(resolve, BIND_WAIT_MS));

    const expected = Array.isArray(body.ports) ? body.ports.filter(Number.isFinite) : [];
    let ports = [];
    try {
      const probe = await sandbox.commands.run(LISTENING_PORTS_COMMAND, {
        timeoutMs: 15_000,
      });
      ports = String(probe.stdout || '')
        .split('\n')
        .map((line) => Number(line.trim()))
        .filter((port) => Number.isFinite(port) && port > 1024 && port < 65535);
    } catch {
      log('system', 'Could not enumerate listening ports; falling back to expected ports.');
    }

    /*
     * Fall back to the ports detection expected. A dev server that is slow to
     * bind should still produce a usable URL rather than nothing.
     */
    const candidates = ports.length > 0 ? ports : expected;
    const unique = [...new Set(candidates)].slice(0, 6);

    const previews = unique.map((port) => ({
      port,
      label: labelForPort(port, body.startCandidates),
      url: `https://${sandbox.getHost(port)}`,
    }));

    if (previews.length === 0) {
      log(
        'system',
        'Nothing is listening yet. Check the logs, or run the command manually in the terminal.',
      );
    }

    // Tail whatever the process has written so far.
    try {
      const tail = await sandbox.commands.run(`tail -c 4000 ${logPath} 2>/dev/null || true`, {
        timeoutMs: 10_000,
      });
      if (tail.stdout) log('stdout', tail.stdout);
    } catch {
      // Log tailing is best effort.
    }

    return sendJson(res, 200, {
      started: true,
      command,
      logPath,
      previews,
      detectedPorts: unique,
      logs,
    });
  } catch (error) {
    const described = describeError(error, apiKey);
    return sendJson(res, described.status, { error: described.error, logs });
  }
};

/** Single-quotes a string for POSIX sh. */
function shellQuote(value) {
  return `'${String(value).split("'").join(`'\\''`)}'`;
}

module.exports.COMMAND_TIMEOUT_MS = COMMAND_TIMEOUT_MS;
