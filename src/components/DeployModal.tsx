import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Rocket,
  ShieldCheck,
  Triangle,
  X,
  Grid3x3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  DEPLOY_PROVIDERS,
  deployProject,
  estimateDeploy,
  readNetlifySiteId,
  rememberNetlifySiteId,
  sanitizeDeployName,
  type DeployProgress,
  type DeployProvider,
  type DeployResult,
} from '../services/deployService';
import { describeCredential, forgetCredential, isEncryptionAvailable, readCredential, saveCredential } from '../services/credentialStore';
import { formatBytes } from '../services/projectArchiveService';
import type { MultiFileProject } from '../types/files';
import type { ExternalLibrary } from '../services/externalLibraryService';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: MultiFileProject;
  projectName?: string;
  externalLibraries?: ExternalLibrary[];
  resolvedVersions?: Record<string, string>;
  includeInjections?: boolean;
}

/** Configure → deploy → done. Progress is shown instead of the form while running. */
type DeployPhase = 'configure' | 'running' | 'done';

/** Where each provider's token is remembered. Separate slots so they cannot overwrite one another. */
const TOKEN_ID: Record<DeployProvider, string> = {
  vercel: 'deploy:vercel',
  netlify: 'deploy:netlify',
};

const fieldClass =
  'w-full rounded-md border border-stroke-subtle bg-surface-canvas px-3 py-2 text-sm text-content-primary placeholder:text-content-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';

/**
 * Provider marks.
 *
 * These are neutral geometric stand-ins drawn from the same vocabulary as the rest
 * of the icon set, not the vendors' actual logos. Shipping a recognisable logo
 * implies an endorsement and a brand relationship that does not exist; the label
 * beside it carries the identification instead.
 */
const PROVIDER_ICON: Record<DeployProvider, React.FC<{ className?: string }>> = {
  vercel: ({ className }) => <Triangle className={className} strokeWidth={1.5} />,
  netlify: ({ className }) => <Grid3x3 className={className} strokeWidth={1.5} />,
};

/** True when a failure is the user cancelling rather than the deploy failing. */
const isAbort = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

const DeployModal: React.FC<DeployModalProps> = ({
  isOpen,
  onClose,
  project,
  projectName = 'gb-coder-project',
  externalLibraries = [],
  resolvedVersions = {},
  includeInjections = true,
}) => {
  const [provider, setProvider] = useState<DeployProvider>('vercel');
  const [token, setToken] = useState('');
  const [revealToken, setRevealToken] = useState(false);
  const [remember, setRemember] = useState(false);
  const [siteName, setSiteName] = useState(projectName);

  const [phase, setPhase] = useState<DeployPhase>('configure');
  const [progress, setProgress] = useState<DeployProgress | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [result, setResult] = useState<DeployResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const controllerRef = useRef<AbortController | null>(null);
  /** Guards the token read below against a provider switch resolving late. */
  const loadTokenIdRef = useRef(0);

  const info = DEPLOY_PROVIDERS[provider];

  /** The exact bundle that would ship, so the size shown is the size sent. */
  const estimate = useMemo(
    () => estimateDeploy(project, { projectName: siteName, externalLibraries, resolvedVersions, includeInjections }),
    [project, siteName, externalLibraries, resolvedVersions, includeInjections],
  );

  /**
   * Whether a token is already sealed in storage for this provider.
   *
   * Read from the store rather than tracked as state, so it stays correct after a
   * forget without needing a second source of truth.
   */
  const storedToken = describeCredential(TOKEN_ID[provider]);

  const handleClose = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Every open starts from the top: a previous deploy's URL must not linger
    // behind a fresh form, inviting the user to share a stale address.
    setPhase('configure');
    setProgress(null);
    setLog([]);
    setResult(null);
    setError(null);
    setCopied(false);
    setSiteName(sanitizeDeployName(projectName));
    // Only a *persisted* credential means the box should start ticked. A
    // session-only one is gone after a reload, so leaving it checked would claim a
    // persistence that does not exist.
    setRemember(describeCredential(TOKEN_ID[provider])?.sessionOnly === false);

    const loadId = loadTokenIdRef.current + 1;
    loadTokenIdRef.current = loadId;

    void readCredential(TOKEN_ID[provider]).then((stored) => {
      // A newer read has started, or the modal closed — this answer is stale.
      if (loadId !== loadTokenIdRef.current || !isOpen) return;
      if (stored) {
        setToken(stored);
        setRevealToken(false);
      }
    });
  }, [isOpen, provider, projectName]);

  // Abandon any in-flight deploy when the dialog goes away, so a closed modal
  // does not keep uploading.
  useEffect(() => {
    if (isOpen) return;
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  const handleProviderChange = useCallback((next: DeployProvider) => {
    setProvider(next);
    setToken('');
    setRevealToken(false);
    setError(null);
  }, []);

  const handleForget = useCallback(() => {
    forgetCredential(TOKEN_ID[provider]);
    setToken('');
    setRemember(false);
    toast.success(`Forgot the saved ${DEPLOY_PROVIDERS[provider].label} token.`);
  }, [provider]);

  const handleDeploy = useCallback(async () => {
    const trimmed = token.trim();
    if (!trimmed) {
      setError('Paste a personal access token to continue.');
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    setError(null);
    setResult(null);
    setLog([]);
    setProgress({ stage: 'packaging', message: 'Starting deployment…', percent: 4 });
    setPhase('running');

    try {
      // Persisted before the request so a token that worked does not have to be
      // pasted again for the next deploy.
      await saveCredential(TOKEN_ID[provider], trimmed, remember);

      /*
       * Netlify needs to be told which site to update. Without a remembered id it
       * would create a second site — a second subdomain, and the first one left
       * behind in the account.
       */
      const netlifySiteId =
        provider === 'netlify' ? (readNetlifySiteId(sanitizeDeployName(siteName)) ?? undefined) : undefined;

      const deployed = await deployProject({
        project,
        provider,
        token: trimmed,
        projectName: siteName,
        externalLibraries,
        resolvedVersions,
        includeInjections,
        netlifySiteId,
        signal: controller.signal,
        onProgress: (next) => {
          setProgress(next);
          setLog((previous) =>
            previous[previous.length - 1] === next.message ? previous : [...previous, next.message],
          );
        },
      });

      // The provider may have assigned a different name than the one requested;
      // the returned one is what the site actually answers on.
      if (provider === 'netlify') {
        rememberNetlifySiteId(sanitizeDeployName(siteName), deployed.target);
      }

      setResult(deployed);
      setPhase('done');
      toast.success(`Live at ${deployed.url}`);
    } catch (caught) {
      if (isAbort(caught)) {
        setPhase('configure');
        setProgress(null);
        toast('Deployment cancelled.');
        return;
      }
      const message = caught instanceof Error ? caught.message : 'The deployment failed.';
      setError(message);
      setPhase('configure');
      toast.error(message, { duration: 6000 });
    } finally {
      controllerRef.current = null;
    }
  }, [token, remember, project, provider, siteName, externalLibraries, resolvedVersions, includeInjections]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard needs a secure context; a LAN-IP preview is not one.
      toast.error('Clipboard blocked. Long-press the URL to copy it.');
    }
  }, [result]);

  if (!isOpen) return null;

  const sanitizedName = sanitizeDeployName(siteName);
  const canDeploy = token.trim().length > 0 && !estimate.problem;

  // ─── Configure ──────────────────────────────────────────────────────────────

  const renderConfigure = () => (
    <div className="space-y-5">
      {/* Provider */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-content-muted">Platform</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(Object.keys(DEPLOY_PROVIDERS) as DeployProvider[]).map((id) => {
            const candidate = DEPLOY_PROVIDERS[id];
            const Mark = PROVIDER_ICON[id];
            const selected = id === provider;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleProviderChange(id)}
                aria-pressed={selected}
                className={`flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-colors ${
                  selected
                    ? 'border-accent bg-accent-subtle'
                    : 'border-stroke-subtle bg-surface-overlay hover:border-stroke-strong'
                }`}
              >
                <Mark className="h-5 w-5 text-content-primary" />
                <span className="text-sm font-medium text-content-primary">{candidate.label}</span>
                <span className="font-mono text-[11px] text-content-muted">{candidate.domainHint}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Site name */}
      <div>
        <label htmlFor="deploy-site-name" className="text-xs font-medium uppercase tracking-wide text-content-muted">
          {provider === 'vercel' ? 'Project name' : 'Site name'}
        </label>
        <input
          id="deploy-site-name"
          type="text"
          value={siteName}
          onChange={(event) => setSiteName(event.target.value)}
          spellCheck={false}
          autoComplete="off"
          className={`mt-2 ${fieldClass} font-mono`}
        />
        <p className="mt-1.5 truncate font-mono text-[11px] text-content-muted">
          https://{sanitizedName}.{provider === 'vercel' ? 'vercel.app' : 'netlify.app'}
        </p>
        {sanitizedName !== siteName.trim() && (
          <p className="mt-1 text-[11px] text-content-muted">
            Adjusted to a valid hostname — only lowercase letters, numbers and hyphens.
          </p>
        )}
      </div>

      {/* Token */}
      <div>
        <label htmlFor="deploy-token" className="text-xs font-medium uppercase tracking-wide text-content-muted">
          {info.label} access token
        </label>

        {storedToken ? (
          <div className="mt-2 rounded-md border border-stroke-subtle bg-surface-overlay p-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-content-primary">
                  {storedToken.sessionOnly ? 'A token is set for this tab' : 'A token is saved on this device'}
                </p>
                <p className="mt-0.5 text-xs text-content-muted">
                  {token
                    ? 'Replace it below to use a different token.'
                    : `Enter or paste it again to deploy as ${info.label}.`}
                </p>
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRevealToken((value) => !value)}
                className="inline-flex items-center gap-1.5 rounded-md border border-stroke bg-surface-canvas px-2.5 py-1.5 text-xs font-medium text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary"
              >
                {revealToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {revealToken ? 'Hide token' : 'Enter token'}
              </button>
              {!storedToken.sessionOnly && (
                <button
                  type="button"
                  onClick={handleForget}
                  className="inline-flex items-center gap-1.5 rounded-md border border-stroke bg-surface-canvas px-2.5 py-1.5 text-xs font-medium text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Forget
                </button>
              )}
            </div>
          </div>
        ) : null}

        <div className="mt-2">
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-faint" />
            <input
              id="deploy-token"
              type={revealToken ? 'text' : 'password'}
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder={storedToken ? 'Paste a new token to replace it' : 'Paste your access token'}
              spellCheck={false}
              autoComplete="off"
              className={`${fieldClass} pl-9 pr-16 font-mono text-xs`}
            />
            <button
              type="button"
              onClick={() => setRevealToken((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-content-muted transition-colors hover:bg-surface-hover hover:text-content-primary"
              aria-label={revealToken ? 'Hide token' : 'Show token'}
              title={revealToken ? 'Hide token' : 'Show token'}
            >
              {revealToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <a
            href={info.tokenUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent-hover underline underline-offset-2 hover:opacity-80"
          >
            Get a token from the {info.label} dashboard
            <ExternalLink className="h-3 w-3" />
          </a>
          <p className="mt-1 text-[11px] leading-relaxed text-content-muted">{info.scopeNote}</p>
        </div>

        {/* Remember */}
        <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-md border border-stroke-subtle bg-surface-overlay p-3">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="mt-0.5 accent-accent"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-content-primary">Remember on this device</span>
            <span className="mt-0.5 block text-xs text-content-muted">
              {isEncryptionAvailable()
                ? 'Stored encrypted so you are not asked again. Anything running on this page can still read it — scope the token down where you can.'
                : 'This page is not a secure context, so the token would be stored in plain text. It is safer to leave this off.'}
            </span>
          </span>
        </label>
      </div>

      {/* Bundle summary */}
      <div className="rounded-md border border-stroke-subtle bg-surface-overlay px-3 py-2.5">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-content-secondary">Publishing</span>
          <span className="font-mono text-content-primary">
            {estimate.fileCount} {estimate.fileCount === 1 ? 'file' : 'files'} · {formatBytes(estimate.bytes)}
          </span>
        </div>
        {estimate.problem && (
          <p className="mt-2 text-xs leading-relaxed text-danger">{estimate.problem}</p>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger-subtle p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          <p className="text-xs leading-relaxed text-content-secondary">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-stroke-subtle pt-4">
        <button
          type="button"
          onClick={handleClose}
          className="rounded-md border border-stroke bg-surface-canvas px-4 py-2 text-sm font-medium text-content-primary transition-colors hover:bg-surface-hover"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleDeploy()}
          disabled={!canDeploy}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Rocket className="h-4 w-4" />
          Deploy now
        </button>
      </div>
    </div>
  );

  // ─── Running ────────────────────────────────────────────────────────────────

  const renderRunning = () => (
    <div className="space-y-4">
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium text-content-primary">
            {progress?.message ?? 'Deploying…'}
          </p>
          <span className="font-mono text-xs text-content-muted">{progress?.percent ?? 0}%</span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-surface-overlay"
          role="progressbar"
          aria-valuenow={progress?.percent ?? 0}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
            style={{ width: `${progress?.percent ?? 0}%` }}
          />
        </div>
      </div>

      <div className="max-h-40 overflow-y-auto rounded-md border border-stroke-subtle bg-surface-canvas p-3">
        {log.length === 0 ? (
          <p className="text-xs text-content-faint">Waiting for the first response…</p>
        ) : (
          <ol className="space-y-1">
            {log.map((entry, index) => (
              <li key={`${entry}-${index}`} className="flex items-start gap-2 font-mono text-[11px] leading-relaxed">
                <span className="text-content-faint">›</span>
                <span className="min-w-0 flex-1 text-content-secondary">{entry}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <p className="text-xs leading-relaxed text-content-muted">
        {info.label} builds this in the cloud. A first build can take a minute — the URL is generated
        immediately but only starts serving once the build finishes.
      </p>

      <div className="border-t border-stroke-subtle pt-4">
        <button
          type="button"
          onClick={handleClose}
          className="w-full rounded-md border border-stroke bg-surface-canvas px-4 py-2 text-sm font-medium text-content-primary transition-colors hover:bg-surface-hover"
        >
          Cancel deployment
        </button>
      </div>
    </div>
  );

  // ─── Done ───────────────────────────────────────────────────────────────────

  const renderDone = () => (
    <div className="space-y-4">
      <div className="animate-scale-in rounded-lg border border-success/30 bg-success-subtle p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-content-primary">Your site is live</p>
            <a
              href={result?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center gap-1.5 break-all font-mono text-xs text-accent-hover underline underline-offset-2 hover:opacity-80"
            >
              {result?.url}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
            {result && (
              <p className="mt-2 text-[11px] text-content-muted">
                {result.fileCount} {result.fileCount === 1 ? 'file' : 'files'} ·{' '}
                {formatBytes(result.bytes)} · {Math.max(1, Math.round(result.durationMs / 1000))}s
              </p>
            )}
            {/*
              Netlify site names are a global namespace, so a taken name is
              replaced with another one. Saying so beats letting the user believe
              the subdomain they typed is the live address.
            */}
            {result && result.assignedName !== sanitizedName && (
              <p className="mt-1.5 text-[11px] leading-relaxed text-content-muted">
                <span className="font-medium text-content-secondary">{result.provider === 'vercel' ? 'Vercel' : 'Netlify'}</span>{' '}
                had already taken <span className="font-mono">{sanitizedName}</span>, so it published this
                one instead.
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={result?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-xs font-medium text-accent-fg transition-colors hover:bg-accent-hover"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Visit site
          </a>
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="inline-flex items-center gap-1.5 rounded-md border border-stroke bg-surface-canvas px-3 py-2 text-xs font-medium text-content-primary transition-colors hover:bg-surface-hover"
          >
            {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy URL'}
          </button>
          {result?.logsUrl && (
            <a
              href={result.logsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-stroke bg-surface-canvas px-3 py-2 text-xs font-medium text-content-primary transition-colors hover:bg-surface-hover"
            >
              Build logs
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* QR — open the deploy on a phone without a cable. */}
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-lg border border-stroke-subtle bg-white p-3">
          <React.Suspense
            fallback={
              <div className="flex h-40 w-40 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-content-muted" />
              </div>
            }
          >
            <QRCodeCanvas value={result?.url ?? ''} />
          </React.Suspense>
        </div>
        <p className="text-[11px] text-content-muted">Scan to open on your phone</p>
      </div>

      <div className="flex items-center gap-2 border-t border-stroke-subtle pt-4">
        <button
          type="button"
          onClick={() => {
            setPhase('configure');
            setResult(null);
            setProgress(null);
            setLog([]);
          }}
          className="rounded-md border border-stroke bg-surface-canvas px-4 py-2 text-sm font-medium text-content-primary transition-colors hover:bg-surface-hover"
        >
          Deploy again
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="flex-1 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
        >
          Done
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-lg border border-stroke-subtle bg-surface-raised shadow-elevated">
        <div className="flex items-start justify-between gap-4 border-b border-stroke-subtle p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-accent-subtle p-2 text-accent-hover">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-sans text-lg font-medium text-content-primary">Deploy</h2>
              <p className="mt-0.5 text-xs text-content-muted">
                Publish this project to a live HTTPS URL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-2 text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary"
            aria-label="Close deploy dialog"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {phase === 'configure' && renderConfigure()}
          {phase === 'running' && renderRunning()}
          {phase === 'done' && renderDone()}
        </div>
      </div>
    </div>
  );
};

/**
 * QR renderer, lazy so `qrcode.react` lands in a chunk fetched when the dialog
 * opens rather than in first paint. `vite.config.ts` already excludes it from the
 * react vendor chunk for the same reason `MobilePreviewModal` does this.
 */
const QRCodeCanvas = React.lazy(
  () => import('qrcode.react').then((module) => ({ default: module.QRCodeSVG })),
);

export default DeployModal;