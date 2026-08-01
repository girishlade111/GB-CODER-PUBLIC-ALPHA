/**
 * POST /api/sandbox/create
 *
 * Provisions an E2B sandbox for a full-stack project: writes the files, installs
 * dependencies for every stack present, and reports the plausible start commands.
 *
 * It deliberately does NOT start anything. Picking between "npm run dev" and
 * "python manage.py runserver" for a project that has both is a guess, and a
 * wrong guess looks like a broken sandbox. The candidates come back and the user
 * chooses, then /api/sandbox/start runs it.
 *
 * Request:  { e2bApiKey, files: [{ path, content }], detectedStack? }
 * Response: { sandboxId, install: [...], startCandidates: [...], logs: [...] }
 */

'use strict';

const {
  Sandbox,
  SANDBOX_TIMEOUT_MS,
  COMMAND_TIMEOUT_MS,
  MAX_UPLOAD_BYTES,
  MAX_FILES,
  guard,
  sendJson,
  describeError,
  redact,
  totalBytes,
} = require('./_shared');
const {
  filterUploadableFiles,
  buildInstallPlan,
  detectStartCandidates,
  candidatePorts,
} = require('./_detect');

/** Where the project is written inside the sandbox. */
const PROJECT_ROOT = '/home/user/project';

module.exports = async function handler(req, res) {
  const checked = guard(req, res, 'create');
  if (!checked.ok) return;

  const { body, apiKey } = checked;

  const uploadable = filterUploadableFiles(body.files);
  if (uploadable.length === 0) {
    return sendJson(res, 400, { error: 'No files to upload.' });
  }
  if (uploadable.length > MAX_FILES) {
    return sendJson(res, 413, {
      error: `Too many files (${uploadable.length}). The limit is ${MAX_FILES}.`,
    });
  }
  const bytes = totalBytes(uploadable);
  if (bytes > MAX_UPLOAD_BYTES) {
    return sendJson(res, 413, {
      error: `Project is ${(bytes / 1024 / 1024).toFixed(1)} MB, over the ${
        MAX_UPLOAD_BYTES / 1024 / 1024
      } MB limit.`,
    });
  }

  const logs = [];
  const log = (stream, text) => {
    if (!text) return;
    logs.push({ stream, text: redact(String(text), apiKey), at: Date.now() });
  };

  let sandbox = null;

  try {
    /*
     * The SDK is constructed per request with the caller's key. Nothing is
     * cached across invocations, so one user's key can never serve another's
     * request.
     */
    sandbox = await Sandbox.create({ apiKey, timeoutMs: SANDBOX_TIMEOUT_MS });
    log('system', `Sandbox ${sandbox.sandboxId} created.`);

    // Batch write preserves the folder structure in one round trip.
    await sandbox.files.write(
      uploadable.map((file) => ({
        path: `${PROJECT_ROOT}/${file.path}`,
        data: file.content,
      })),
    );
    log('system', `Wrote ${uploadable.length} files to ${PROJECT_ROOT}.`);

    const plan = buildInstallPlan(uploadable);
    if (plan.isMixedStack) {
      log('system', 'Mixed Node + Python stack detected; installing both.');
    }

    const install = [];
    for (const step of plan.steps) {
      log('system', `$ ${step.command}`);
      let result;
      try {
        result = await sandbox.commands.run(step.command, {
          cwd: PROJECT_ROOT,
          timeoutMs: COMMAND_TIMEOUT_MS,
        });
      } catch (error) {
        /*
         * A failed install is reported, not fatal. The sandbox stays up so the
         * user can fix it from the terminal, which is far more useful than
         * tearing everything down.
         */
        const described = describeError(error, apiKey);
        log('stderr', described.error);
        install.push({ ...step, exitCode: null, failed: true, error: described.error });
        continue;
      }

      log('stdout', result.stdout);
      if (result.stderr) log('stderr', result.stderr);
      install.push({
        id: step.id,
        label: step.label,
        command: step.command,
        exitCode: result.exitCode,
        failed: result.exitCode !== 0,
      });
    }

    const startCandidates = detectStartCandidates(uploadable);
    if (startCandidates.length === 0) {
      log('system', 'No start command detected. Use the terminal to run one manually.');
    }

    return sendJson(res, 200, {
      sandboxId: sandbox.sandboxId,
      projectRoot: PROJECT_ROOT,
      fileCount: uploadable.length,
      packageManager: plan.packageManager,
      pythonTooling: plan.pythonTooling,
      isMixedStack: plan.isMixedStack,
      install,
      startCandidates,
      candidatePorts: candidatePorts(startCandidates),
      // Enough for the client to show a countdown; E2B enforces it.
      expiresInMs: SANDBOX_TIMEOUT_MS,
      logs,
    });
  } catch (error) {
    /*
     * Creation failed partway: kill the sandbox so a half-provisioned one is not
     * left burning the user's quota.
     */
    if (sandbox) {
      try {
        await sandbox.kill();
      } catch {
        // Nothing more we can do about it.
      }
    }
    const described = describeError(error, apiKey);
    return sendJson(res, described.status, { error: described.error, logs });
  }
};
