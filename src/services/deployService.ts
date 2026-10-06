/**
 * One-click deployment to Vercel and Netlify.
 *
 * ## How this works
 *
 * Both providers expose a REST API that accepts a bundle of files and returns a
 * public HTTPS URL. Neither needs a CLI or a local build step, which is what
 * makes a genuine one-click deploy possible from a browser tab:
 *
 *  - **Vercel** takes the files inline as JSON on `POST /v13/deployments` and
 *    builds server-side. Plain HTML/CSS/JS projects have no `package.json`, so
 *    framework detection finds nothing and they are served statically; React and
 *    Vue projects do carry the generated `package.json` and `vite.config.js`, so
 *    Vercel detects Vite and runs a real build. That split is why the bundle is
 *    reused verbatim from the export path rather than flattened to one HTML file.
 *  - **Netlify** takes a ZIP as the raw request body. The same detection rules
 *    apply, via Netlify's build image.
 *
 * Both then have to be polled, because the URL exists before the deployment is
 * actually serving. Returning early would hand the user a 404.
 *
 * ## The file set is not our own
 *
 * `buildArchiveFiles` already solves "turn this project into a directory tree" —
 * including the linked-vs-inline HTML decision, the Vite scaffolding, CDN library
 * tags and custom injections. Reusing it means a deploy and a download contain
 * byte-identical files, so what ships is provably what the user exported. A
 * second, subtly different bundle builder would be a bug factory.
 *
 * ## Credentials
 *
 * Tokens are supplied by the caller and stored through `credentialStore`; nothing
 * here reaches for storage. Direct browser calls to both APIs are intended by both
 * providers (Vercel's own deploy buttons and Netlify's drag-and-drop work this
 * way), so there is no proxy hop and no server to hold anyone's token.
 */

import type { MultiFileProject } from '../types/files';
import type { ExternalLibrary } from './externalLibraryService';
import {
  byteLength,
  buildArchiveFiles,
  createZipBlob,
  type ArchiveOptions,
} from './projectArchiveService';

/** Hosts this service can publish to. */
export type DeployProvider = 'vercel' | 'netlify';

/**
 * Deployment phases, in the order they occur.
 *
 * Reported rather than inferred by the UI so the two providers can look the same
 * from the outside even though they do different amounts of work.
 */
export type DeployStage = 'packaging' | 'uploading' | 'building' | 'securing' | 'ready' | 'failed';

export interface DeployProgress {
  stage: DeployStage;
  /** One short line for the user, e.g. `Uploading 4 files to Vercel…`. */
  message: string;
  /**
   * 0-100. Advances through the phases above and then parks; the hosting
   * provider's own build can take arbitrarily long, so progress deliberately
   * stops short of 100 until the deploy is genuinely `ready`.
   */
  percent: number;
}

export interface DeployResult {
  provider: DeployProvider;
  /** Live URL, https included. */
  url: string;
  /** Provider's deployment id, for support and for finding it in a dashboard. */
  deploymentId: string;
  /** Vercel project name, or Netlify site id. */
  target: string;
  /**
   * The name the provider actually assigned.
   *
   * Usually what was asked for, but not always: Netlify site names are a global
   * namespace, so a taken name gets silently replaced. Reporting the real one
   * stops the UI from claiming a subdomain that does not exist.
   */
  assignedName: string;
  fileCount: number;
  bytes: number;
  durationMs: number;
  /** Where to watch the build logs. Undefined when the provider gave no link. */
  logsUrl?: string;
}

export interface DeployOptions {
  project: MultiFileProject;
  provider: DeployProvider;
  /** Personal access token. Never persisted by this service. */
  token: string;
  /** Suggested site/project name; sanitised before it reaches either API. */
  projectName: string;
  externalLibraries?: ExternalLibrary[];
  resolvedVersions?: Record<string, string>;
  includeInjections?: boolean;
  /**
   * An existing Netlify site id to deploy into, when one is known.
   *
   * Without this, every deploy would create a *new* site: a fresh subdomain each
   * time and an orphaned site left behind in the account. Vercel needs no
   * equivalent because a deployment is created against a named project, so repeat
   * deploys update it naturally.
   */
  netlifySiteId?: string;
  onProgress?: (progress: DeployProgress) => void;
  /** Lets the UI abandon a deploy the user no longer wants. */
  signal?: AbortSignal;
}

/** Failures worth distinguishing in the UI. */
export class DeployError extends Error {
  readonly status: number;
  /** True when the same request could plausibly succeed on a retry. */
  readonly retryable: boolean;
  /** Where it broke, so the UI can keep showing the right phase. */
  readonly stage: DeployStage;

  constructor(
    message: string,
    options: { status?: number; retryable?: boolean; stage?: DeployStage } = {},
  ) {
    super(message);
    this.name = 'DeployError';
    this.status = options.status ?? 0;
    this.retryable = options.retryable ?? false;
    this.stage = options.stage ?? 'failed';
  }
}

export interface DeployProviderInfo {
  id: DeployProvider;
  label: string;
  /** Where the user mints a token. */
  tokenUrl: string;
  /** What the token can do, in the terms that matter for scoping it. */
  scopeNote: string;
  /** Shown next to the name input so the result is not a surprise. */
  domainHint: string;
}

export const DEPLOY_PROVIDERS: Record<DeployProvider, DeployProviderInfo> = {
  vercel: {
    id: 'vercel',
    label: 'Vercel',
    tokenUrl: 'https://vercel.com/account/tokens',
    scopeNote: 'A token can publish to every project on the account. Scope it to a team where you can.',
    domainHint: 'your-project.vercel.app',
  },
  netlify: {
    id: 'netlify',
    label: 'Netlify',
    tokenUrl: 'https://app.netlify.com/user/settings/tokens',
    scopeNote: 'A token can publish to every site on the account, so keep it scoped to this site if offered.',
    domainHint: 'your-project.netlify.app',
  },
};

// ─── Limits ───────────────────────────────────────────────────────────────────

/**
 * Both hosts reject oversized bundles, and neither error is useful, so the
 * ceiling is checked locally with a message that says what to do about it.
 *
 * Vercel caps inline-file uploads at 1000 files; Netlify's direct-upload limit is
 * larger but a ZIP this size is already past the point where a browser tab
 * should be the thing building it. 900 files and 64 MB keeps headroom under both
 * while comfortably covering a real project.
 */
const MAX_FILES = 900;
const MAX_TOTAL_BYTES = 64 * 1024 * 1024;

const POLL_INTERVAL_MS = 1_500;
const REQUEST_TIMEOUT_MS = 120_000;
/**
 * A build can legitimately take a couple of minutes. Past this we stop waiting and
 * say the deploy may still succeed, rather than spinning forever — the error has
 * to name the dashboard, because by then the deployment usually is running fine.
 */
const MAX_POLL_MS = 180_000;

const VERCEL_API = 'https://api.vercel.com';
const NETLIFY_API = 'https://api.netlify.com/api/v1';

// ─── Shared helpers ───────────────────────────────────────────────────────────

const sleep = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    function onAbort() {
      window.clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });

/**
 * Pulls the provider's own error text out of a failed response.
 *
 * Vercel and Netlify both put something useful in the body — often the actual
 * reason a build failed — and it is much better feedback than a bare status code.
 */
const readErrorDetail = async (response: Response): Promise<string> => {
  try {
    const body = (await response.json()) as {
      error?: string | { message?: string; code?: string };
      message?: string;
    };
    if (typeof body.error === 'string') return body.error;
    if (body.error?.message) return body.error.message;
    if (body.message) return body.message;
  } catch {
    /* no JSON body; the status fallback below is fine */
  }
  return '';
};

/**
 * Turns a failed response into a `DeployError` with a message a user can act on.
 *
 * The status ladder matters here: 401 is a paste mistake, 403 is usually a token
 * missing the scope, and 413/422 is a payload too big for this endpoint. Telling
 * someone to retry when their token is wrong wastes their time.
 */
const toDeployError = async (
  response: Response,
  provider: DeployProvider,
  stage: DeployStage,
): Promise<DeployError> => {
  const detail = await readErrorDetail(response);
  const suffix = detail ? ` (${detail})` : '';

  if (response.status === 401) {
    return new DeployError(`Your ${provider === 'vercel' ? 'Vercel' : 'Netlify'} token was rejected. Check that you pasted it in full.${suffix}`, {
      status: 401,
      retryable: false,
      stage,
    });
  }
  if (response.status === 403) {
    return new DeployError(`That token is not allowed to create deployments on this account.${suffix}`, {
      status: 403,
      retryable: false,
      stage,
    });
  }
  if (response.status === 413 || response.status === 429) {
    return new DeployError(`The project is too large for a direct upload, or you have hit the provider's rate limit.${suffix}`, {
      status: response.status,
      retryable: true,
      stage,
    });
  }
  if (response.status === 422) {
    return new DeployError(`The provider rejected the project as invalid.${suffix}`, {
      status: 422,
      retryable: false,
      stage,
    });
  }
  if (response.status >= 500) {
    return new DeployError(`The provider's servers returned an error. This is usually temporary — try again.${suffix}`, {
      status: response.status,
      retryable: true,
      stage,
    });
  }

  return new DeployError(`Deployment failed (${response.status}).${suffix}`, {
    status: response.status,
    retryable: false,
    stage,
  });
};

/** Normalises a bare host into an https URL, leaving full URLs untouched. */
const toHttpsUrl = (value: string): string =>
  value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`;

/** JSON headers for an authenticated request. */
const authHeaders = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

/**
 * `fetch` with a deadline.
 *
 * Two independent reasons a request must end: the user gave up, or the provider
 * never answered. Both surface from `fetch` as an `AbortError`, so they are told
 * apart by checking whether the caller's own signal is the thing that fired —
 * only the timeout is our fault to report as one.
 *
 * Applied to the uploads rather than the polling GETs, which are governed by
 * `MAX_POLL_MS` instead and are expected to return quickly.
 */
const fetchWithTimeout = async (
  url: string,
  init: RequestInit,
  stage: DeployStage,
  description: string,
): Promise<Response> => {
  // Already cancelled: `addEventListener` would never fire, so the relay below
  // would never propagate it and the request would run to completion anyway.
  if (init.signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const relayAbort = () => controller.abort();
  init.signal?.addEventListener('abort', relayAbort, { once: true });

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    // The caller's signal fired: they cancelled, so let that propagate untouched.
    if (init.signal?.aborted) throw error;
    throw new DeployError(`${description} timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds.`, {
      retryable: true,
      stage,
    });
  } finally {
    window.clearTimeout(timer);
    init.signal?.removeEventListener('abort', relayAbort);
  }
};

/**
 * Uncompressed total of the bundle.
 *
 * Reported by both providers so the number means the same thing regardless of
 * which one compressed the payload on the way out.
 */
const sumBytes = (files: { path: string; content: string }[]): number =>
  files.reduce((total, file) => total + byteLength(file.content), 0);

// ─── Project → deployable file set ────────────────────────────────────────────

/**
 * Reduces a name to something both providers will accept as a hostname label.
 *
 * `sanitizeProjectName` from the archive service keeps dots, which is right for a
 * filename and wrong for a subdomain, so this is deliberately stricter: lowercase
 * alphanumerics and single hyphens, no leading or trailing hyphen.
 */
export const sanitizeDeployName = (name: string | undefined): string => {
  const cleaned = (name ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');

  // A name made entirely of punctuation sanitises down to nothing, which both
  // APIs reject outright — hence the fallback rather than a validation error.
  return cleaned || 'gb-coder-project';
};

/**
 * The files that will be published.
 *
 * Reuses the export bundle verbatim — see the module header for why. Exposed so
 * the UI can show the user exactly what is about to be published.
 */
export const buildDeployFiles = (
  project: MultiFileProject,
  options: ArchiveOptions = {},
): { path: string; content: string }[] => buildArchiveFiles(project, options);

export interface DeployEstimate {
  fileCount: number;
  bytes: number;
  /** Set when the bundle is over a provider's ceiling. */
  problem?: string;
}

/** Checks the bundle against provider limits before anything leaves the tab. */
export const estimateDeploy = (project: MultiFileProject, options: ArchiveOptions = {}): DeployEstimate => {
  const files = buildDeployFiles(project, options);
  const bytes = sumBytes(files);

  let problem: string | undefined;
  if (files.length > MAX_FILES) {
    problem = `This project has ${files.length} files; a direct upload supports up to ${MAX_FILES}.`;
  } else if (bytes > MAX_TOTAL_BYTES) {
    problem = `This project is ${(bytes / 1024 / 1024).toFixed(1)} MB; a direct upload supports up to 64 MB.`;
  }

  return { fileCount: files.length, bytes, problem };
};

// ─── Vercel ───────────────────────────────────────────────────────────────────

interface VercelDeployment {
  id: string;
  url?: string;
  /** Assigned for `target: "production"`; preferred over `url` when present. */
  alias?: string[];
  readyState: 'BLOCKED' | 'BUILDING' | 'CANCELED' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | string;
  inspectorUrl?: string;
  /** Documented top-level failure text. */
  errorMessage?: string | null;
  /** Present on some responses instead of `errorMessage`. */
  error?: { message?: string };
}

/** Terminal states. Anything else means the build is still working. */
const VERCEL_TERMINAL_FAILURES = new Set(['ERROR', 'CANCELED', 'BLOCKED']);

/** The build's failure text, whichever field this response happens to use. */
const vercelErrorText = (deployment: VercelDeployment): string | undefined =>
  deployment.errorMessage ?? deployment.error?.message ?? undefined;

const deployToVercel = async (options: DeployOptions, files: { path: string; content: string }[]): Promise<DeployResult> => {
  const startedAt = Date.now();
  const { token, projectName, onProgress, signal } = options;
  const name = sanitizeDeployName(projectName);
  const report = onProgress ?? (() => {});

  report({ stage: 'uploading', message: `Uploading ${files.length} files to Vercel…`, percent: 45 });

  const headers = authHeaders(token);

  /*
   * `skipAutoDetectionConfirmation` is not optional for us. Vercel answers a
   * detected framework that disagrees with the project setting with a 400 asking
   * for confirmation — a prompt no browser tab can answer, which would turn every
   * first deploy into a dead end. The parameter is documented for exactly this
   * automated-pipeline case.
   */
  const url = `${VERCEL_API}/v13/deployments?skipAutoDetectionConfirmation=1`;

  /*
   * `projectSettings` is required on a project's first deployment, so it is always
   * sent — but what goes in it depends on what the project actually needs:
   *
   *  - Plain HTML/CSS/JS has no `package.json`, so there is nothing to detect.
   *    `framework: null` is the documented way to say "serve these files
   *    statically", and it is exactly right.
   *  - React and Vue ship a generated `package.json` and `vite.config.js`, so the
   *    build command, install command and output directory genuinely have to be
   *    detected. Each of those accepts `null` to mean "automatically detected",
   *    and `framework` is left absent so Vercel detects it from the manifest
   *    rather than being pinned to something that would be wrong for a plain
   *    project.
   */
  const isStatic = !files.some((file) => file.path === 'package.json');
  const projectSettings = isStatic
    ? { framework: null }
    : { buildCommand: null, installCommand: null, outputDirectory: null };

  const response = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name,
        target: 'production',
        // No `encoding` field: `file` and `data` are the documented required pair
        // and the data is sent as text. Pinning an encoding value the reference
        // does not document would risk a 422 on every deploy.
        files: files.map((file) => ({ file: file.path, data: file.content })),
        projectSettings,
      }),
      signal,
    },
    'uploading',
    'Uploading to Vercel',
  );

  if (!response.ok) throw await toDeployError(response, 'vercel', 'uploading');

  const created = (await response.json()) as VercelDeployment;

  report({ stage: 'building', message: 'Vercel is building your project…', percent: 55 });
  const ready = await waitForVercel(created.id, headers, report, signal);

  report({ stage: 'securing', message: 'Issuing an HTTPS certificate…', percent: 92 });
  report({ stage: 'ready', message: 'Deployed.', percent: 100 });

  const host = ready.alias?.[0] ?? ready.url;
  if (!host) {
    throw new DeployError('Vercel built the project but returned no URL for it. Open the deployment in your dashboard.', {
      retryable: false,
      stage: 'failed',
    });
  }

  return {
    provider: 'vercel',
    /*
     * `alias[0]` is the production alias when one was assigned, and `url` is the
     * deployment-specific address. Both serve this build; the alias is the one
     * that stays stable across redeploys, so it wins when present.
     */
    url: toHttpsUrl(host),
    deploymentId: ready.id,
    target: name,
    assignedName: name,
    fileCount: files.length,
    bytes: sumBytes(files),
    durationMs: Date.now() - startedAt,
    logsUrl: ready.inspectorUrl,
  };
};

/** Polls until the deployment is READY or reaches a terminal failure. */
const waitForVercel = async (
  deploymentId: string,
  headers: Record<string, string>,
  report: (progress: DeployProgress) => void,
  signal?: AbortSignal,
): Promise<VercelDeployment> => {
  const deadline = Date.now() + MAX_POLL_MS;
  let percent = 55;

  while (Date.now() < deadline) {
    const response = await fetchWithTimeout(
      `${VERCEL_API}/v13/deployments/${deploymentId}`,
      { headers, signal },
      'building',
      'Checking the build status',
    );
    if (!response.ok) throw await toDeployError(response, 'vercel', 'building');

    const deployment = (await response.json()) as VercelDeployment;

    if (VERCEL_TERMINAL_FAILURES.has(deployment.readyState)) {
      const detail = vercelErrorText(deployment);
      const state = deployment.readyState.toLowerCase();
      throw new DeployError(
        detail
          ? `Vercel could not build this project (${state}): ${detail}`
          : `Vercel could not build this project (${state}). Open the build logs for the specific error.`,
        { status: 0, retryable: false, stage: 'building' },
      );
    }
    if (deployment.readyState === 'READY') return deployment;

    report({ stage: 'building', message: 'Vercel is building your project…', percent });
    // Creeps toward 90 so the bar keeps moving without ever promising a finish
    // time it cannot know.
    percent = Math.min(percent + 4, 90);
    await sleep(POLL_INTERVAL_MS, signal);
  }

  throw new DeployError(
    'Vercel has not finished building yet. The deployment usually still completes — check your Vercel dashboard.',
    { status: 0, retryable: true, stage: 'building' },
  );
};

// ─── Netlify ──────────────────────────────────────────────────────────────────

interface NetlifySite {
  id: string;
  name: string;
  url?: string;
  ssl_url?: string;
}

interface NetlifyDeploy {
  id: string;
  state: string;
  url?: string;
  ssl_url?: string;
  deploy_url?: string;
  deploy_ssl_url?: string;
  error_message?: string;
  admin_url?: string;
}

const deployToNetlify = async (options: DeployOptions, files: { path: string; content: string }[]): Promise<DeployResult> => {
  const startedAt = Date.now();
  const { token, project, projectName, externalLibraries, resolvedVersions, includeInjections, netlifySiteId, onProgress, signal } = options;
  const report = onProgress ?? (() => {});
  const headers = authHeaders(token);

  report({ stage: 'uploading', message: 'Creating your Netlify site…', percent: 25 });

  const site = netlifySiteId
    ? // A remembered site still has to be verified: it may have been deleted or
        // the token may no longer reach it, and a 404 here is recoverable while a
        // deploy into it is not.
        await resolveNetlifySite(netlifySiteId, headers, signal)
    : await createNetlifySite(sanitizeDeployName(projectName), headers, signal);

  report({ stage: 'uploading', message: 'Packaging files…', percent: 35 });

  /*
   * `createZipBlob` reuses the export bundle and reports compression progress, so
   * the payload here is byte-identical to what "Download ZIP" would produce.
   * Compression on a handful of text files is nearly free, and paying it keeps
   * one bundle definition rather than two.
   */
  const blob = await createZipBlob(
    project,
    { projectName, externalLibraries, resolvedVersions, includeInjections },
    (zip) => report({ stage: 'uploading', message: 'Packaging files…', percent: 35 + Math.round(zip.percent * 0.15) }),
  );
  const buffer = await blob.arrayBuffer();

  report({ stage: 'uploading', message: 'Uploading to Netlify…', percent: 52 });

  /*
   * Netlify's deploy endpoint takes the ZIP as the raw request body — not
   * multipart, not base64. `Content-Length` is left unset because it is a
   * forbidden header and the browser sets it correctly from the ArrayBuffer.
   */
  const deployResponse = await fetchWithTimeout(
    `${NETLIFY_API}/sites/${site.id}/deploys`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/zip' },
      body: buffer,
      signal,
    },
    'uploading',
    'Uploading to Netlify',
  );

  if (!deployResponse.ok) throw await toDeployError(deployResponse, 'netlify', 'uploading');

  const upload = (await deployResponse.json()) as NetlifyDeploy;

  report({ stage: 'building', message: 'Netlify is building your project…', percent: 60 });
  const ready = await waitForNetlify(upload.id, token, report, signal);

  report({ stage: 'securing', message: 'Issuing an HTTPS certificate…', percent: 92 });
  report({ stage: 'ready', message: 'Deployed.', percent: 100 });

  return {
    provider: 'netlify',
    // `deploy_ssl_url` is the stable per-deploy address; the site URL is the
    // friendlier of the two to show, and both serve the same content.
    url: toHttpsUrl(site.ssl_url ?? site.url ?? ready.deploy_ssl_url ?? ready.deploy_ssl_url ?? ''),
    deploymentId: ready.id,
    target: site.id,
    assignedName: site.name,
    fileCount: files.length,
    bytes: sumBytes(files),
    durationMs: Date.now() - startedAt,
    logsUrl: ready.admin_url,
  };
};

/**
 * Looks up a remembered site, falling back to creating a new one if it is gone.
 *
 * A site can be deleted from the Netlify dashboard between two deploys, and the
 * id is remembered locally rather than being re-derived, so this is a real case
 * and not a theoretical one. Creating a replacement keeps a deploy working; the
 * caller gets the new id back and overwrites the stale entry.
 */
const resolveNetlifySite = async (
  siteId: string,
  headers: Record<string, string>,
  signal?: AbortSignal,
): Promise<NetlifySite> => {
  const response = await fetchWithTimeout(
    `${NETLIFY_API}/sites/${siteId}`,
    { headers, signal },
    'uploading',
    'Checking the Netlify site',
  );

  if (response.ok) return (await response.json()) as NetlifySite;
  // 404 is the only status worth replacing the site over; an auth failure must
  // surface, or a bad token would silently mint new sites on every deploy.
  if (response.status !== 404) throw await toDeployError(response, 'netlify', 'uploading');

  return createNetlifySite('', headers, signal);
};

/**
 * Creates the site, tolerating a taken name.
 *
 * Netlify site names are a global namespace, so "my-app" is usually already
 * gone. Failing the whole deploy over a cosmetic subdomain would be the wrong
 * trade, so on a name collision this retries without a name and lets Netlify
 * assign one — the result is still a working HTTPS URL, and the caller reports
 * the real name back.
 */
const createNetlifySite = async (
  name: string,
  headers: Record<string, string>,
  signal?: AbortSignal,
): Promise<NetlifySite> => {
  const post = async (body: Record<string, unknown>): Promise<Response> =>
    fetchWithTimeout(
      `${NETLIFY_API}/sites`,
      { method: 'POST', headers, body: JSON.stringify(body), signal },
      'uploading',
      'Creating the Netlify site',
    );

  let response = await post({ name });

  if (response.status === 422) {
    response = await post({});
  }

  if (!response.ok) throw await toDeployError(response, 'netlify', 'uploading');

  return (await response.json()) as NetlifySite;
};

/** Polls until the deploy is `ready` or `error`. */
const waitForNetlify = async (
  deployId: string,
  token: string,
  report: (progress: DeployProgress) => void,
  signal?: AbortSignal,
): Promise<NetlifyDeploy> => {
  const deadline = Date.now() + MAX_POLL_MS;
  let percent = 60;

  while (Date.now() < deadline) {
    const response = await fetchWithTimeout(
      `${NETLIFY_API}/deploys/${deployId}`,
      { headers: { Authorization: `Bearer ${token}` }, signal },
      'building',
      'Checking the build status',
    );
    if (!response.ok) throw await toDeployError(response, 'netlify', 'building');

    const deploy = (await response.json()) as NetlifyDeploy;

    if (deploy.state === 'error') {
      throw new DeployError(
        deploy.error_message
          ? `Netlify could not build this project: ${deploy.error_message}`
          : 'Netlify could not build this project. Open the deploy log for the specific error.',
        { status: 0, retryable: false, stage: 'building' },
      );
    }
    if (deploy.state === 'ready') return deploy;

    report({ stage: 'building', message: 'Netlify is building your project…', percent });
    percent = Math.min(percent + 4, 90);
    await sleep(POLL_INTERVAL_MS, signal);
  }

  throw new DeployError(
    'Netlify has not finished building yet. The deploy usually still completes — check your Netlify dashboard.',
    { status: 0, retryable: true, stage: 'building' },
  );
};

// ─── Netlify site reuse ───────────────────────────────────────────────────────

/**
 * Site ids of past Netlify deployments, so a repeat deploy updates the same site.
 *
 * Plain JSON in `localStorage`, not the encrypted credential store: a site id is
 * not a secret, and this is bookkeeping rather than a secret. Keyed by name
 * because that is what the user is looking at when they click deploy.
 */
const NETLIFY_SITES_KEY = 'gbcoder_netlify_sites_v1';

type NetlifySiteMap = Record<string, string>;

/** The site id previously created for this name, if any. */
export const readNetlifySiteId = (name: string): string | null => {
  try {
    const raw = window.localStorage.getItem(NETLIFY_SITES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NetlifySiteMap;
    return typeof parsed?.[name] === 'string' ? parsed[name] : null;
  } catch {
    // Blocked or corrupt storage just means no remembered site, which is the
    // same as a first deploy.
    return null;
  }
};

/** Records the site id for a name so the next deploy reuses it. */
export const rememberNetlifySiteId = (name: string, siteId: string): void => {
  try {
    const raw = window.localStorage.getItem(NETLIFY_SITES_KEY);
    const parsed = raw ? (JSON.parse(raw) as NetlifySiteMap) : {};
    parsed[name] = siteId;
    window.localStorage.setItem(NETLIFY_SITES_KEY, JSON.stringify(parsed));
  } catch {
    /* best-effort: a missed reuse only costs a duplicate site next time */
  }
};

// ─── Entry point ──────────────────────────────────────────────────────────────

/**
 * Publishes the project and resolves with its live URL.
 *
 * Both hosts create the URL before anything is actually being served, so this
 * only resolves once the deployment reports itself ready.
 */
export const deployProject = async (options: DeployOptions): Promise<DeployResult> => {
  const { project, provider, token, onProgress } = options;
  const report = onProgress ?? (() => {});

  if (!token.trim()) {
    throw new DeployError('A personal access token is required to deploy.', { retryable: false });
  }

  report({ stage: 'packaging', message: 'Collecting project files…', percent: 8 });

  const bundleOptions: ArchiveOptions = {
    projectName: options.projectName,
    externalLibraries: options.externalLibraries,
    resolvedVersions: options.resolvedVersions,
    includeInjections: options.includeInjections,
  };

  // Checked against the limits before anything leaves the tab, and reused below so
  // the byte count reported to the user is the count that was actually sent.
  const estimate = estimateDeploy(project, bundleOptions);
  if (estimate.problem) throw new DeployError(estimate.problem, { retryable: false });

  const files = buildDeployFiles(project, bundleOptions);

  report({ stage: 'packaging', message: `Packaged ${files.length} files.`, percent: 20 });

  return provider === 'vercel'
    ? deployToVercel(options, files)
    : deployToNetlify(options, files);
};