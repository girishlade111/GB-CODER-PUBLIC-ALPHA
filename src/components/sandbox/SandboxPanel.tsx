import React, { useCallback, useState, useSyncExternalStore } from 'react';
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Play,
  Plug,
  PlugZap,
  RotateCcw,
  Server,
  Square,
  Terminal,
} from 'lucide-react';
import {
  SandboxFile,
  readStoredKey,
  sandboxSession,
  storeKey,
} from '../../services/sandbox/sandboxSession';

/**
 * Sandbox provider panel.
 *
 * E2B is the only functional provider. The others are shown deliberately —
 * disabled and badged — so the roadmap is visible without implying they work.
 */

interface SandboxPanelProps {
  /** Project files to upload when connecting. */
  files: SandboxFile[];
  onClose?: () => void;
}

const subscribe = (onChange: () => void) => sandboxSession.subscribe(onChange);
const getSnapshot = () => sandboxSession.getState();

interface ProviderCard {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
}

const PROVIDERS: ProviderCard[] = [
  {
    id: 'e2b',
    name: 'E2B',
    description: 'Run this project in an isolated cloud sandbox using your own API key.',
    icon: <Box className="h-5 w-5" />,
    available: true,
  },
  {
    id: 'codesandbox',
    name: 'CodeSandbox',
    description: 'Cloud development environments.',
    icon: <Server className="h-5 w-5" />,
    available: false,
  },
  {
    id: 'daytona',
    name: 'Daytona',
    description: 'Standardised development environments.',
    icon: <Server className="h-5 w-5" />,
    available: false,
  },
  {
    id: 'modal',
    name: 'Modal',
    description: 'Serverless compute for running code.',
    icon: <Server className="h-5 w-5" />,
    available: false,
  },
];

const STATUS_LABEL: Record<string, string> = {
  idle: 'Not connected',
  creating: 'Creating sandbox…',
  installing: 'Installing dependencies…',
  ready: 'Ready — choose what to run',
  starting: 'Starting…',
  running: 'Running',
  error: 'Error',
  closed: 'Disconnected',
};

const SandboxPanel: React.FC<SandboxPanelProps> = ({ files, onClose }) => {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(() => readStoredKey());
  const [showKey, setShowKey] = useState(false);
  const [customCommand, setCustomCommand] = useState('');

  const hasKey = apiKey.trim().length > 0;
  const isConnected = Boolean(state.sandboxId);

  const handleConnect = useCallback(async () => {
    storeKey(apiKey.trim());
    await sandboxSession.create(files);
  }, [apiKey, files]);

  const activePreview = state.previews.find((preview) => preview.port === state.activePort);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-stroke-subtle bg-surface-base">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stroke-subtle bg-surface-raised px-3 py-2">
        <div className="flex items-center gap-2">
          <PlugZap className="h-4 w-4 text-accent" />
          <h2 className="text-xs font-semibold uppercase tracking-wide text-content-secondary">
            Sandbox
          </h2>
          <span
            className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
              state.status === 'running'
                ? 'bg-emerald-500/15 text-emerald-300'
                : state.status === 'error'
                  ? 'bg-red-500/15 text-red-300'
                  : isConnected
                    ? 'bg-sky-500/15 text-sky-300'
                    : 'bg-white/10 text-content-muted'
            }`}
            data-testid="sandbox-status"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                state.status === 'running'
                  ? 'bg-emerald-400'
                  : isConnected
                    ? 'bg-sky-400'
                    : 'bg-gray-500'
              }`}
            />
            {STATUS_LABEL[state.status] ?? state.status}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-xs text-content-muted hover:bg-white/10 hover:text-content-primary"
          >
            Close
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {/* Provider cards */}
        {!isConnected && (
          <>
            <p className="mb-2 text-xs text-content-muted">
              Choose a provider. Compute runs on your own account — GB Coder only proxies the
              request and never stores your key.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {PROVIDERS.map((provider) => {
                const isSelected = selectedProvider === provider.id;
                return (
                  <button
                    key={provider.id}
                    type="button"
                    disabled={!provider.available}
                    onClick={() => setSelectedProvider(provider.id)}
                    data-testid={`provider-${provider.id}`}
                    aria-disabled={!provider.available}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      !provider.available
                        ? 'cursor-not-allowed border-stroke-subtle bg-surface-raised/40 opacity-50'
                        : isSelected
                          ? 'border-accent bg-accent/10'
                          : 'border-stroke-subtle bg-surface-raised hover:border-accent/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={provider.available ? 'text-accent' : 'text-content-muted'}>
                          {provider.icon}
                        </span>
                        <span className="text-sm font-semibold text-content-primary">
                          {provider.name}
                        </span>
                      </div>
                      {!provider.available && (
                        <span className="rounded-full border border-stroke-subtle px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-content-muted">
                          Coming soon
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[11px] leading-snug text-content-muted">
                      {provider.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* E2B connection flow */}
        {selectedProvider === 'e2b' && !isConnected && (
          <div className="mt-3 rounded-xl border border-stroke-subtle bg-surface-raised p-3">
            <label
              htmlFor="e2b-key"
              className="mb-1.5 block text-xs font-medium text-content-secondary"
            >
              E2B API key
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  id="e2b-key"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder="e2b_…"
                  autoComplete="off"
                  spellCheck={false}
                  data-testid="e2b-key-input"
                  className="w-full rounded-lg border border-stroke-subtle bg-surface-base px-2.5 py-1.5 pr-9 font-mono text-xs text-content-primary outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((value) => !value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-primary"
                  aria-label={showKey ? 'Hide API key' : 'Show API key'}
                >
                  {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => void handleConnect()}
                disabled={!hasKey || state.isBusy}
                data-testid="sandbox-connect"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  hasKey && !state.isBusy
                    ? 'bg-accent text-accent-fg hover:bg-accent-hover'
                    : 'cursor-not-allowed bg-white/5 text-content-muted'
                }`}
              >
                {state.isBusy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plug className="h-3.5 w-3.5" />
                )}
                Connect
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-snug text-content-muted">
              Stored in this browser only (<code>gbcoder_e2b_key</code>). It is sent to our proxy
              solely to talk to E2B on your behalf, and is never written to a log or a database.{' '}
              <a
                href="https://e2b.dev/dashboard"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 text-accent hover:underline"
              >
                Get a key <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        )}

        {/* Error */}
        {state.error && (
          <div
            className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3"
            data-testid="sandbox-error"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
            <p className="text-xs text-red-200">{state.error}</p>
          </div>
        )}

        {/* Install summary */}
        {state.install.length > 0 && (
          <div className="mt-3 rounded-xl border border-stroke-subtle bg-surface-raised p-3">
            <p className="mb-1.5 text-xs font-medium text-content-secondary">
              Dependencies
              {state.isMixedStack && (
                <span className="ml-1.5 rounded bg-sky-500/15 px-1.5 py-0.5 text-[9px] uppercase text-sky-300">
                  mixed stack
                </span>
              )}
            </p>
            <ul className="space-y-1">
              {state.install.map((step) => (
                <li key={step.command} className="flex items-center gap-1.5 text-[11px]">
                  {step.failed ? (
                    <AlertTriangle className="h-3 w-3 flex-shrink-0 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-emerald-400" />
                  )}
                  <span className="text-content-secondary">{step.label}</span>
                  <code className="truncate text-content-muted">{step.command}</code>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Start command selection — candidates, never a guess */}
        {isConnected && state.status !== 'running' && (
          <div className="mt-3 rounded-xl border border-stroke-subtle bg-surface-raised p-3">
            <p className="mb-2 text-xs font-medium text-content-secondary">
              {state.startCandidates.length > 1
                ? 'Several start commands were found — pick one:'
                : state.startCandidates.length === 1
                  ? 'Detected start command:'
                  : 'No start command detected. Enter one, or use the terminal.'}
            </p>
            <div className="space-y-1.5">
              {state.startCandidates.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => void sandboxSession.start(candidate.command)}
                  disabled={state.isBusy}
                  data-testid={`start-candidate-${candidate.id}`}
                  className="flex w-full items-center gap-2 rounded-lg border border-stroke-subtle bg-surface-base px-2.5 py-2 text-left hover:border-accent/60 disabled:opacity-50"
                >
                  <Play className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs text-content-primary">
                      {candidate.label}
                    </span>
                    <code className="block truncate text-[10px] text-content-muted">
                      {candidate.command}
                    </code>
                  </span>
                  <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] uppercase text-content-muted">
                    {candidate.kind}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <input
                value={customCommand}
                onChange={(event) => setCustomCommand(event.target.value)}
                placeholder="Or run a custom command…"
                className="flex-1 rounded-lg border border-stroke-subtle bg-surface-base px-2 py-1.5 font-mono text-[11px] text-content-primary outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => void sandboxSession.start(customCommand.trim())}
                disabled={!customCommand.trim() || state.isBusy}
                className="rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] text-content-primary disabled:opacity-40"
              >
                Run
              </button>
            </div>
          </div>
        )}

        {/* Previews / port selector */}
        {state.previews.length > 0 && (
          <div className="mt-3 rounded-xl border border-stroke-subtle bg-surface-raised p-3">
            <p className="mb-2 text-xs font-medium text-content-secondary">
              {state.previews.length > 1 ? 'Active ports' : 'Preview'}
            </p>
            <div className="space-y-1.5" data-testid="sandbox-previews">
              {state.previews.map((preview) => (
                <div
                  key={preview.port}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${
                    preview.port === state.activePort
                      ? 'border-accent/60 bg-accent/10'
                      : 'border-stroke-subtle'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => sandboxSession.selectPort(preview.port)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block truncate text-xs text-content-primary">
                      {preview.label}
                    </span>
                    <span className="block truncate text-[10px] text-content-muted">
                      {preview.url}
                    </span>
                  </button>
                  <a
                    href={preview.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-content-muted hover:text-accent"
                    aria-label={`Open port ${preview.port} in a new tab`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </div>
            {activePreview && (
              <p className="mt-2 text-[10px] text-content-muted">
                The Live Preview tab shows port {activePreview.port}.
              </p>
            )}
          </div>
        )}

        {/* Logs */}
        {state.logs.length > 0 && (
          <div className="mt-3 rounded-xl border border-stroke-subtle bg-matte-black p-2">
            <div className="mb-1 flex items-center gap-1.5 px-1">
              <Terminal className="h-3 w-3 text-content-muted" />
              <span className="text-[10px] uppercase tracking-wide text-content-muted">Output</span>
            </div>
            <div
              className="max-h-48 overflow-y-auto font-mono text-[10px] leading-relaxed"
              data-testid="sandbox-logs"
            >
              {state.logs.map((line, index) => (
                <div
                  key={index}
                  className={
                    line.stream === 'stderr'
                      ? 'text-red-300'
                      : line.stream === 'system'
                        ? 'text-sky-300'
                        : 'text-content-secondary'
                  }
                >
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {isConnected && (
        <div className="flex items-center gap-2 border-t border-stroke-subtle bg-surface-raised px-3 py-2">
          <button
            type="button"
            onClick={() => void sandboxSession.restart()}
            disabled={state.isBusy}
            data-testid="sandbox-restart"
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-content-primary hover:bg-white/20 disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restart Sandbox
          </button>
          <button
            type="button"
            onClick={() => void sandboxSession.close()}
            disabled={state.isBusy}
            data-testid="sandbox-disconnect"
            className="flex items-center gap-1.5 rounded-lg bg-red-500/15 px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-500/25 disabled:opacity-40"
          >
            <Square className="h-3.5 w-3.5" />
            Disconnect Sandbox
          </button>
          <span className="ml-auto text-[10px] text-content-muted">
            Expires after 15 min idle
          </span>
        </div>
      )}
    </div>
  );
};

export default SandboxPanel;
