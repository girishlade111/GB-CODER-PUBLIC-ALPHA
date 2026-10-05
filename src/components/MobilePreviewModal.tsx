import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, Copy, Loader2, Radio, RefreshCw, Trash2, Wifi, WifiOff, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  LanAddress,
  LanInfo,
  MobilePreviewMode,
  MobilePreviewSession,
  MobilePreviewSessionController,
  buildCloudUrl,
  buildLanUrl,
  fetchLanInfo,
  isLocalOrigin,
  publishPreview,
} from '../services/mobilePreviewService';

interface MobilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * The assembled preview document from `PreviewPanel` — the same srcdoc the
   * desktop iframe renders. Publishing this rather than the html/css/js triple
   * is what keeps the phone and the desktop from disagreeing about how to build
   * the page.
   */
  document: string;
}

/** Segmented control, matching the pill vocabulary used elsewhere in the app. */
const segmentBase =
  'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const MobilePreviewModal: React.FC<MobilePreviewModalProps> = ({ isOpen, onClose, document }) => {
  const [lanInfo, setLanInfo] = useState<LanInfo | null>(null);
  const [lanError, setLanError] = useState<string | null>(null);
  const [lanLoading, setLanLoading] = useState(false);
  const [mode, setMode] = useState<MobilePreviewMode>('lan');
  const [session, setSession] = useState<MobilePreviewSession | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const controllerRef = useRef<MobilePreviewSessionController | null>(null);

  /**
   * One controller for the modal's lifetime.
   *
   * Held in a ref rather than derived from state so that the debounce timer
   * inside it is never torn down and rebuilt by an unrelated re-render.
   */
  const getController = useCallback((): MobilePreviewSessionController => {
    if (!controllerRef.current) {
      controllerRef.current = new MobilePreviewSessionController(
        publishPreview,
        (next) => setSession(next),
        (error) => setPublishError(error.message),
      );
    }
    return controllerRef.current;
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const lanController = new AbortController();
    setLanLoading(true);
    setLanError(null);

    fetchLanInfo(lanController.signal)
      .then((info) => {
        setLanInfo(info);
        // Cloud mode is the only option when there is no LAN address to give.
        if (!info.localIp) setMode('cloud');
      })
      .catch((error: unknown) => {
        if (lanController.signal.aborted) return;
        setLanError(error instanceof Error ? error.message : 'Could not read the network address.');
      })
      .finally(() => {
        if (!lanController.signal.aborted) setLanLoading(false);
      });

    return () => lanController.abort();
  }, [isOpen]);

  /*
   * Create the session when the modal opens, and end it when it closes.
   *
   * `dispose` deletes the session, so closing the modal revokes the phone's
   * access immediately rather than leaving a live copy of the code readable for
   * the remainder of the TTL.
   */
  useEffect(() => {
    if (!isOpen) {
      controllerRef.current?.dispose();
      controllerRef.current = null;
      setSession(null);
      setPublishError(null);
      setCopied(false);
      return;
    }

    void getController().start(document);

    return () => {
      controllerRef.current?.dispose();
      controllerRef.current = null;
    };
  }, [isOpen, document, getController]);

  /* Push edits to the phone while the session is live. */
  useEffect(() => {
    if (!isOpen || !autoRefresh || !session) return;
    getController().schedulePublish(document);
  }, [isOpen, autoRefresh, session, document, getController]);

  /* Escape closes, as in every other dialog in the app. */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const lanUrl = lanInfo && session ? buildLanUrl(lanInfo, session.id, selectedAddress ?? undefined) : null;
  const cloudUrl = session ? buildCloudUrl(session.id) : null;
  const activeUrl = mode === 'lan' ? lanUrl : cloudUrl;

  const lanAvailable = Boolean(lanInfo?.localIp) && !lanInfo?.serverless;
  const cloudAvailable = Boolean(session);

  const handleCopy = async () => {
    if (!activeUrl) return;
    try {
      await navigator.clipboard.writeText(activeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access needs a secure context; LAN over plain http is not one.
      toast.error('Clipboard blocked. Long-press the URL to copy it.');
    }
  };

  const handleEndSession = () => {
    controllerRef.current?.dispose();
    controllerRef.current = null;
    setSession(null);
    setPublishError(null);
    toast.success('Mobile preview session ended.');
  };

  const toggleLabel = (entry: LanAddress) =>
    `${entry.iface}${entry.private ? '' : ' (public address)'}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-lg border border-stroke-subtle bg-surface-raised shadow-elevated">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-stroke-subtle p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-accent-subtle p-2 text-accent-hover">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-sans text-lg font-medium text-content-primary">Test on Mobile</h2>
              <p className="mt-0.5 text-xs text-content-muted">
                Scan with your phone camera to test responsive design live
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary"
            aria-label="Close mobile preview"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-4">
          {/* Mode switcher */}
          <div className="mb-4 flex gap-2 rounded-lg bg-surface-overlay p-1">
            <button
              type="button"
              onClick={() => setMode('lan')}
              disabled={!lanAvailable}
              className={`${segmentBase} flex items-center justify-center gap-1.5 ${
                mode === 'lan'
                  ? 'bg-surface-raised text-content-primary'
                  : 'text-content-muted hover:text-content-secondary'
              }`}
              title={
                lanAvailable
                  ? 'Fast, no cloud round trip. Requires the phone to be on the same Wi-Fi.'
                  : 'No local network address available from this server.'
              }
            >
              {lanAvailable ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              Local Wi-Fi
            </button>
            <button
              type="button"
              onClick={() => setMode('cloud')}
              disabled={!cloudAvailable}
              className={`${segmentBase} flex items-center justify-center gap-1.5 ${
                mode === 'cloud'
                  ? 'bg-surface-raised text-content-primary'
                  : 'text-content-muted hover:text-content-secondary'
              }`}
              title="Works anywhere, including over 4G/5G cellular data."
            >
              <Radio className="h-3.5 w-3.5" />
              Cloud Link
            </button>
          </div>

          {/* QR code */}
          <div className="mb-4 flex justify-center">
            {publishError ? (
              <div className="flex w-full max-w-xs flex-col items-center gap-2 rounded-lg border border-danger bg-danger-subtle p-4 text-center">
                <AlertTriangle className="h-5 w-5 text-danger" />
                <p className="text-xs text-content-secondary">{publishError}</p>
              </div>
            ) : activeUrl ? (
              <div className="rounded-lg border border-stroke-subtle bg-white p-3">
                <React.Suspense
                  fallback={
                    <div className="flex h-48 w-48 items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-content-muted" />
                    </div>
                  }
                >
                  <QRCodeCanvas value={activeUrl} />
                </React.Suspense>
              </div>
            ) : (
              <div className="flex h-48 w-48 items-center justify-center rounded-lg border border-stroke-subtle bg-surface-overlay">
                {lanLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-content-muted" />
                ) : (
                  <span className="px-4 text-center text-xs text-content-muted">
                    {lanError || 'Preparing preview…'}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Status pill */}
          <div className="mb-3 flex items-center justify-center gap-2">
            {session ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-2.5 py-1 text-[11px] font-medium text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Sync Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-overlay px-2.5 py-1 text-[11px] font-medium text-content-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-content-faint" />
                Connecting…
              </span>
            )}
          </div>

          {/* URL + copy */}
          {activeUrl && (
            <div className="mb-4 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md border border-stroke-subtle bg-surface-overlay px-2.5 py-1.5 font-mono text-[11px] text-content-secondary">
                {activeUrl}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-1.5 rounded-md border border-stroke-subtle bg-surface-overlay px-2.5 py-1.5 text-xs font-medium text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary"
                title="Copy URL"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}

          {/* Mode-specific guidance */}
          {mode === 'lan' && lanInfo?.localIp ? (
            <p className="mb-4 text-xs leading-relaxed text-content-muted">
              {lanInfo.sameNetworkLikely
                ? `Your phone must be on the same Wi-Fi as this machine. If the QR does not load, the network is blocking device-to-device traffic — try Cloud Link instead.`
                : `No private address was found, so this URL may not be reachable from a phone. Try Cloud Link.`}
            </p>
          ) : (
            <p className="mb-4 text-xs leading-relaxed text-content-muted">
              Works anywhere, including over cellular data.
              {!session?.durable && ' Requires shared storage to be configured on this deployment.'}
            </p>
          )}

          {/* Address picker, when the guess may be wrong */}
          {mode === 'lan' && lanInfo && lanInfo.addresses.length > 1 && (
            <div className="mb-4">
              <label
                htmlFor="lan-address-select"
                className="mb-1.5 block text-[11px] font-medium text-content-secondary"
              >
                Network address
              </label>
              <select
                id="lan-address-select"
                value={selectedAddress ?? lanInfo.localIp ?? ''}
                onChange={(event) => setSelectedAddress(event.target.value)}
                className="w-full rounded-md border border-stroke-subtle bg-surface-overlay px-2.5 py-1.5 text-xs text-content-secondary"
              >
                {lanInfo.addresses.map((entry) => (
                  <option key={`${entry.iface}-${entry.address}`} value={entry.address}>
                    {entry.address} — {toggleLabel(entry)}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-[11px] text-content-faint">
                Multiple adapters found. Pick the one your phone shares a network with.
              </p>
            </div>
          )}

          {/* Auto-refresh toggle */}
          <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-lg border border-stroke-subtle bg-surface-overlay p-3">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(event) => setAutoRefresh(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#cc785c]"
            />
            <span>
              <span className="block text-xs font-medium text-content-primary">Auto-refresh on device</span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-content-muted">
                Push every edit to the phone automatically. Turn this off to keep the device on a
                fixed snapshot while you experiment.
              </span>
            </span>
          </label>

          {/* End session */}
          {session && (
            <button
              type="button"
              onClick={handleEndSession}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-stroke-subtle px-3 py-2 text-xs font-medium text-content-secondary transition-colors hover:border-danger hover:bg-danger-subtle hover:text-danger"
              title="Revoke this device's access immediately"
            >
              <Trash2 className="h-3.5 w-3.5" />
              End session
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * QR renderer, isolated so the lazy boundary sits at the import above rather
 * than inside the modal's render path.
 *
 * `qrcode.react` is ~20 KB and only reachable from this dialog, so it lands in
 * a chunk fetched when the modal opens and never in first paint.
 */
const QRCodeCanvas = React.lazy(
  () =>
    import('qrcode.react').then((module) => ({ default: module.QRCodeSVG })),
);

export default MobilePreviewModal;
