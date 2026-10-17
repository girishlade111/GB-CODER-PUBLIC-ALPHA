/**
 * BYOK (Bring-Your-Own-Key) & AI Provider Settings Modal.
 *
 * Allows users to:
 * - Select between Gemini, OpenRouter, OpenAI, Custom, and Mock providers.
 * - Enter API keys securely in memory (or optionally sessionStorage).
 * - Run real-time connection diagnostics with latency and honest CORS reporting.
 * - Customize base URLs for local or proxy endpoints.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Key,
  Globe,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { AiProviderId, ConnectionDiagnosticResult } from '../../services/ai/types';
import { keyManager } from '../../services/ai/keyManager';
import { providerRegistry } from '../../services/ai/providerRegistry';
import { assistAgentService } from '../../services/ai/assistAgentService';

interface AiProviderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiProviderSettingsModal: React.FC<AiProviderSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const state = assistAgentService.getState();

  const [activeTab, setActiveTab] = useState<AiProviderId>(state.selectedProvider);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [persistInSession, setPersistInSession] = useState(false);
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<ConnectionDiagnosticResult | null>(null);

  // Sync inputs when tab changes or modal opens
  useEffect(() => {
    if (!isOpen) return;
    const currentKey = keyManager.getApiKey(activeTab);
    setApiKeyInput(currentKey);
    setPersistInSession(keyManager.isPersistedInSession(activeTab));
    setDiagnosticResult(null);

    const providerObj = providerRegistry.getProvider(activeTab);
    setCustomBaseUrl(providerObj.defaultBaseUrl);
  }, [isOpen, activeTab]);

  // Global Escape key & focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    keyManager.setApiKey(activeTab, apiKeyInput, persistInSession);
    assistAgentService.setProvider(activeTab);
    setDiagnosticResult(null);
  };

  const handleClearKey = () => {
    keyManager.clearApiKey(activeTab);
    setApiKeyInput('');
    setDiagnosticResult(null);
  };

  const handleRunDiagnostic = async () => {
    setIsTesting(true);
    setDiagnosticResult(null);

    // Ensure key is set in manager first
    keyManager.setApiKey(activeTab, apiKeyInput, persistInSession);

    try {
      const result = await providerRegistry.testProviderConnection(activeTab, customBaseUrl);
      setDiagnosticResult(result);
    } catch (err: unknown) {
      setDiagnosticResult({
        success: false,
        latencyMs: 0,
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const providers = providerRegistry.getAllProviders();
  const models = providerRegistry.getModelsForProvider(activeTab);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-settings-modal-title"
      data-testid="ai-provider-settings-modal"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-xs select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex w-full max-w-xl flex-col rounded-xl border border-[#2e3046] bg-[#141524] shadow-2xl overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#2e3046] bg-[#18192c] px-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <h2 id="ai-settings-modal-title" className="text-sm font-semibold tracking-wide text-white">
              GB Assist: BYOK Model Providers
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            data-testid="close-ai-settings-btn"
            className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Provider Tabs */}
        <div className="flex border-b border-[#26283d] bg-[#111220] px-3 pt-2 gap-1 overflow-x-auto">
          {providers.map((p) => {
            const hasKey = keyManager.hasApiKey(p.id);
            const isSelected = activeTab === p.id;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveTab(p.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-md font-medium text-xs transition-colors border-t border-x ${
                  isSelected
                    ? 'bg-[#18192c] text-white border-[#2e3046] border-b-transparent -mb-px'
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span>{p.name.replace(' (BYOK)', '')}</span>
                {hasKey && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="Key configured" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Security Banner */}
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-2.5 text-[11px] text-cyan-300 flex items-start gap-2">
            <Key className="h-4 w-4 shrink-0 mt-0.5 text-cyan-400" />
            <div className="space-y-0.5 leading-relaxed">
              <span className="font-semibold text-white">Private & Ephemeral BYOK:</span>
              <p className="text-slate-300">
                API keys are kept strictly in memory by default and never sent to any server other than the direct AI provider host.
              </p>
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Selected Model
            </label>
            <select
              value={state.selectedModel}
              onChange={(e) => {
                assistAgentService.setProvider(activeTab, e.target.value);
              }}
              className="w-full rounded-md border border-[#2e3046] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({Math.round(m.contextWindow / 1000)}k context)
                </option>
              ))}
            </select>
          </div>

          {/* API Key Input (except mock) */}
          {activeTab !== 'mock' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  API Key for {providers.find((p) => p.id === activeTab)?.name}
                </label>
                {activeTab === 'openrouter' && (
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                  >
                    Get OpenRouter Key <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {activeTab === 'gemini' && (
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                  >
                    Get Gemini Key <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <div className="relative flex items-center">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={`Enter your ${activeTab} API key...`}
                  data-testid="ai-provider-api-key-input"
                  className="w-full rounded-md border border-[#2e3046] bg-[#12131c] pl-3 pr-20 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                  {apiKeyInput && (
                    <button
                      type="button"
                      onClick={handleClearKey}
                      className="p-1 rounded text-slate-500 hover:text-red-400"
                      title="Clear key"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Session Storage Option */}
              <label className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={persistInSession}
                  onChange={(e) => setPersistInSession(e.target.checked)}
                  className="rounded border-[#2e3046] bg-[#12131c] text-cyan-500 focus:ring-0"
                />
                <span>Remember for this browser session (cleared on tab close)</span>
              </label>
            </div>
          )}

          {/* Custom Base URL (if custom or openai) */}
          {(activeTab === 'custom' || activeTab === 'openai') && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-cyan-400" />
                API Base URL
              </label>
              <input
                type="text"
                value={customBaseUrl}
                onChange={(e) => setCustomBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="w-full rounded-md border border-[#2e3046] bg-[#12131c] px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* Diagnostic Result Box */}
          {diagnosticResult && (
            <div
              className={`rounded-lg border p-3 text-xs space-y-1 ${
                diagnosticResult.success
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                  : 'border-rose-500/30 bg-rose-950/20 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold">
                {diagnosticResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                )}
                <span>{diagnosticResult.message}</span>
              </div>
              {diagnosticResult.corsRestricted && (
                <p className="text-[11px] text-amber-300/90 pt-1 leading-relaxed">
                  Tip: OpenRouter (<code className="font-mono bg-black/40 px-1 py-0.5 rounded">https://openrouter.ai</code>) supports direct browser access with full CORS support.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#2e3046] bg-[#18192c] px-4 py-3">
          <button
            type="button"
            disabled={isTesting}
            onClick={handleRunDiagnostic}
            data-testid="test-ai-connection-btn"
            className="flex items-center gap-1.5 rounded border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs text-slate-200 transition-colors disabled:opacity-50"
          >
            {isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <AlertTriangle className="h-3.5 w-3.5 text-cyan-400" />}
            Test Connection
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                handleSaveKey();
                onClose();
              }}
              data-testid="save-ai-settings-btn"
              className="rounded bg-cyan-500 hover:bg-cyan-400 px-4 py-1.5 text-xs font-semibold text-slate-950 transition-colors shadow"
            >
              Use Provider
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
