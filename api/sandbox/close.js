/**
 * POST /api/sandbox/close
 *
 * Kills a sandbox explicitly.
 *
 * The 15-minute inactivity shutdown is NOT implemented here. A serverless
 * function cannot hold a timer, so expiry is set on the sandbox itself
 * (`timeoutMs` at creation, refreshed on each interaction in `connectSandbox`)
 * and enforced by E2B. That survives this proxy being redeployed or scaled to
 * zero, which a server-side timer would not.
 *
 * Request:  { e2bApiKey, sandboxId }
 * Response: { closed }
 */

'use strict';

const { Sandbox, guard, sendJson, describeError } = require('./_shared');

module.exports = async function handler(req, res) {
  const checked = guard(req, res, 'close');
  if (!checked.ok) return;

  const { body, apiKey } = checked;
  const sandboxId = typeof body.sandboxId === 'string' ? body.sandboxId : '';
  if (!sandboxId) return sendJson(res, 400, { error: 'A sandboxId is required.' });

  try {
    /*
     * The static form kills by id without a full connect handshake, and treats an
     * already-dead sandbox as success — disconnecting twice should not surface an
     * error to the user.
     */
    await Sandbox.kill(sandboxId, { apiKey });
    return sendJson(res, 200, { closed: true });
  } catch (error) {
    const described = describeError(error, apiKey);
    if (described.status === 410) return sendJson(res, 200, { closed: true, alreadyGone: true });
    return sendJson(res, described.status, { error: described.error });
  }
};
