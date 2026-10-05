/**
 * Client for the QR mobile-preview endpoints.
 *
 * Owns the session lifecycle and the two transport modes so the modal stays a
 * view and the mobile page stays a view. Nothing here touches React.
 *
 * ## Transport choice, restated
 *
 * The editor publishes an assembled preview document and the phone polls for a
 * newer `version`. SSE would read better but cannot work here: in production
 * this is a Vercel function, so an open event stream pins one serverless
 * instance while the editor's publish lands on another. Polling behaves the same
 * on a laptop and on a phone behind a carrier NAT, which is the whole feature.
 *
 * ## What crosses the wire
 *
 * The *assembled* document, not the html/css/js triple. `PreviewPanel` already
 * produces a srcdoc that has the console bridge, external libraries, JSX
 * runtime, import map and custom injections resolved. Shipping that string means
 * there is exactly one assembly of the preview in the codebase and the phone
 * cannot drift from the desktop.
 */

/** How often the phone asks whether the document changed. */
export const MOBILE_PREVIEW_POLL_MS = 900;

/** Matches the server's 30-minute sliding TTL, with margin. */
const KEEPALIVE_INTERVAL_MS = 60_000;

/** Base64url, 32 characters. Mirrors `createSessionId` in the API. */
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{32}$/;

export interface LanAddress {
  address: string;
  iface: string;
  family: string;
  internal: boolean;
  private: boolean;
  virtual: boolean;
  physical: boolean;
  score: number;
}

export interface LanInfo {
  localIp: string | null;
  port: number | null;
  addresses: LanAddress[];
  /** True when a private address exists, i.e. the phone is likely on the same Wi-Fi. */
  sameNetworkLikely: boolean;
  /** True when this API is a serverless function and has no access to the dev machine's LAN. */
  serverless: boolean;
  /** True when sessions persist across processes (Upstash configured). */
  durable: boolean;
}

export interface MobilePreviewSession {
  id: string;
  version: number;
  updatedAt: number;
  durable: boolean;
}

export interface MobilePreviewState {
  id: string;
  version: number;
  updatedAt: number;
  changed: boolean;
  /** Absent when `changed` is false — that is the whole point of `?since=`. */
  document?: string;
}

export type MobilePreviewMode = 'lan' | 'cloud';

/** Path the mobile page is served from. `/preview/:id` is the share page; this is distinct. */
const MOBILE_PREVIEW_PATH = '/mpreview';

/** Production origin, used to build cloud URLs. Falls back to the current origin. */
const CLOUD_ORIGIN = 'https://code.ladestack.in';

const isSessionId = (value: unknown): value is string =>
  typeof value === 'string' && SESSION_ID_PATTERN.test(value);

/**
 * Reads the API's error message, falling back to a generic one.
 *
 * The API returns actionable text ("this session has expired"), and swallowing
 * that in favour of "request failed" makes the mobile page far less useful when
 * a session times out mid-session.
 */
const readError = async (response: Response, fallback: string): Promise<string> => {
  try {
    const body = (await response.json()) as { error?: string };
    return body?.error || fallback;
  } catch {
    return fallback;
  }
};

const postJson = async (url: string, body: unknown, signal?: AbortSignal): Promise<Response> =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

/**
 * Asks the server which LAN address to advertise.
 *
 * The port is passed in because the API cannot know it: in local dev `/api` is
 * served by Vite on 5173, not by Express on 3001, and the browser already knows
 * which origin actually answered.
 */
export const fetchLanInfo = async (signal?: AbortSignal): Promise<LanInfo> => {
  const port = window.location.port || '5173';
  const response = await fetch(`/api/preview/lan-info?port=${encodeURIComponent(port)}`, { signal });
  if (!response.ok) {
    throw new Error(await readError(response, 'Could not read the local network address.'));
  }
  return (await response.json()) as LanInfo;
};

/** Creates a session, or replaces the document in `id` when one is supplied. */
export const publishPreview = async (
  document: string,
  id?: string | null,
  signal?: AbortSignal,
): Promise<MobilePreviewSession> => {
  const response = await postJson(
    '/api/preview/sync',
    id ? { id, document } : { document },
    signal,
  );
  if (!response.ok) {
    throw new Error(await readError(response, 'Could not publish the preview.'));
  }
  const data = (await response.json()) as MobilePreviewSession;
  if (!isSessionId(data.id)) {
    throw new Error('The server returned an unusable session id.');
  }
  return data;
};

/**
 * Fetches the current state.
 *
 * `since` is the version already held; when it matches, the response omits the
 * document and this is a ~40 byte round trip.
 */
export const fetchPreviewState = async (
  id: string,
  since?: number | null,
  signal?: AbortSignal,
): Promise<MobilePreviewState> => {
  const query = new URLSearchParams({ id });
  if (typeof since === 'number' && Number.isFinite(since)) {
    query.set('since', String(Math.trunc(since)));
  }
  const response = await fetch(`/api/preview/sync?${query.toString()}`, { signal });
  if (!response.ok) {
    throw new Error(await readError(response, 'Could not load the preview.'));
  }
  return (await response.json()) as MobilePreviewState;
};

/** Ends the session. Best-effort: the TTL expires it regardless. */
export const deletePreviewSession = async (id: string): Promise<void> => {
  try {
    await fetch(`/api/preview/sync?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch {
    // Nothing to do. The sliding TTL is the real guarantee of cleanup.
  }
};

/** True when the current page is served from the developer's own machine. */
export const isLocalOrigin = (): boolean => {
  const { hostname } = window.location;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '[::1]' ||
    // Private ranges, which is what a LAN dev server is reachable on.
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  );
};

/**
 * LAN URL for a session, or null when there is no usable address.
 *
 * Port comes from the API response rather than `window.location` so that a LAN
 * address on a different port than the browser's own origin still resolves.
 */
export const buildLanUrl = (lan: LanInfo, id: string, address?: string): string | null => {
  const host = address || lan.localIp;
  if (!host) return null;
  const port = lan.port || Number.parseInt(window.location.port, 10) || 5173;
  return `http://${host}:${port}${MOBILE_PREVIEW_PATH}/${id}`;
};

/**
 * Cloud URL for a session.
 *
 * On a local origin the cloud origin is used explicitly, since the LAN address
 * is not reachable from a phone on cellular data. Everywhere else the current
 * origin is already correct and survives preview deployments.
 */
export const buildCloudUrl = (id: string): string => {
  const origin = isLocalOrigin() ? CLOUD_ORIGIN : window.location.origin;
  return `${origin}${MOBILE_PREVIEW_PATH}/${id}`;
};

/**
 * Owns one live preview session: publishes on change, keeps the TTL warm, and
 * tears the session down when the editor stops asking for it.
 *
 * `onPublish` runs at most once per `debounceMs` and skips identical documents,
 * so holding the modal open does not re-upload the same preview on every render.
 */
export class MobilePreviewSessionController {
  private session: MobilePreviewSession | null = null;
  private publishTimer: ReturnType<typeof setTimeout> | null = null;
  private keepaliveTimer: ReturnType<typeof setInterval> | null = null;
  private lastPublishedDocument: string | null = null;
  private disposed = false;
  private inFlight: Promise<MobilePreviewSession> | null = null;

  constructor(
    private readonly publish: typeof publishPreview,
    private readonly onSession: (session: MobilePreviewSession) => void,
    private readonly onError: (error: Error) => void,
    private readonly onIdle?: (idle: boolean) => void,
  ) {}

  get id(): string | null {
    return this.session?.id ?? null;
  }

  /**
   * Publishes immediately, creating the session if needed.
   *
   * Concurrent callers share one request: the QR cannot be rendered until a
   * session exists, and the modal asks for the document on the same tick.
   */
  async start(document: string): Promise<MobilePreviewSession | null> {
    if (this.disposed) return null;
    this.onIdle?.(false);
    if (this.inFlight) return this.inFlight;

    this.inFlight = this.publish(document, this.session?.id ?? null)
      .then((session) => {
        if (this.disposed) return null;
        this.session = session;
        this.lastPublishedDocument = document;
        this.onSession(session);
        this.startKeepalive();
        return session;
      })
      .catch((error: unknown) => {
        this.onError(error instanceof Error ? error : new Error(String(error)));
        return null;
      })
      .finally(() => {
        this.inFlight = null;
      });

    return this.inFlight;
  }

  /** Coalesces rapid edits into a single publish. */
  schedulePublish(document: string, debounceMs = 400): void {
    if (this.disposed) return;
    if (this.publishTimer) clearTimeout(this.publishTimer);
    this.publishTimer = setTimeout(() => {
      this.publishTimer = null;
      void this.publishNow(document);
    }, debounceMs);
  }

  /**
   * Pushes unless the document is byte-identical to what was last sent.
   *
   * The caller debounces; this guards the other half of the problem, which is
   * re-renders that do not change the preview at all (opening a panel, typing in
   * a comment field). Those must not cost a request.
   */
  async publishNow(document: string): Promise<void> {
    if (this.disposed || document === this.lastPublishedDocument) return;
    const session = await this.start(document);
    if (session && document !== this.lastPublishedDocument) {
      this.lastPublishedDocument = document;
    }
  }

  private startKeepalive(): void {
    if (this.keepaliveTimer) return;
    /*
     * The TTL slides on read as well as write, and the phone polls, so the
     * session stays warm without this. It exists for the case where the phone
     * was closed and reopened after a pause: re-publishing refreshes the TTL
     * before the phone's first poll can 404.
     */
    this.keepaliveTimer = setInterval(() => {
      if (this.disposed || !this.session) return;
      /*
       * Re-publishes the document currently on screen purely to slide the TTL.
       * `lastPublishedDocument` is deliberately left alone so `publishNow`'s
       * identity check does not short-circuit it; the payload is unchanged, so
       * the phone's own hash check means it re-renders nothing.
       */
      void this.publish(this.lastPublishedDocument ?? '', this.session.id).catch(() => {
        // A failed keepalive is not worth surfacing; the phone's next poll
        // reports expiry if the session really is gone.
      });
    }, KEEPALIVE_INTERVAL_MS);
  }

  /** Ends the session and stops all timers. Safe to call more than once. */
  dispose(): void {
    this.disposed = true;
    if (this.publishTimer) {
      clearTimeout(this.publishTimer);
      this.publishTimer = null;
    }
    if (this.keepaliveTimer) {
      clearInterval(this.keepaliveTimer);
      this.keepaliveTimer = null;
    }
    if (this.session) void deletePreviewSession(this.session.id);
    this.session = null;
  }
}
