/**
 * GB Assist: AI Provider Management System & Connect Provider Modal.
 *
 * Provides:
 * - Searchable provider discovery directory (Popular & Other categories)
 * - Dedicated configuration screen per provider with back navigation
 * - Advanced custom OpenAI-compatible provider builder
 * - Multiple custom providers, models, and custom HTTP headers
 * - Ephemeral in-memory key storage by default with optional session opt-in
 * - Actionable connection diagnostics with billable probe consent
 * - React Portal rendering to document.body preventing workbench stacking occlusion
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sliders,
  Key,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  Trash2,
  ExternalLink,
  ArrowLeft,
  Plus,
  Eye,
  EyeOff,
  Search,
  Sparkles,
  Cpu,
  Zap,
  Server,
  Flame,
  Layers,
  Activity,
  Compass,
  FlaskConical,
  ShieldCheck,
  Check,
  ChevronRight,
} from 'lucide-react';
import {
  AiProviderId,
  ConnectionDiagnosticResult,
  CustomModelConfig,
  CustomHeaderConfig,
  CustomProviderDefinition,
  ProviderCatalogEntry,
} from '../../services/ai/types';
import { keyManager } from '../../services/ai/keyManager';
import { providerRegistry } from '../../services/ai/providerRegistry';
import { customProviderStore } from '../../services/ai/customProviderStore';
import { assistAgentService } from '../../services/ai/assistAgentService';
import { normalizeBaseUrl } from '../../services/ai/providers/openaiCompatibleProvider';

interface AiProviderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProviderId?: AiProviderId;
}

export const AiProviderSettingsModal: React.FC<AiProviderSettingsModalProps> = ({
  isOpen,
  onClose,
  initialProviderId,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const state = assistAgentService.getState();

  // Navigation state: 'directory' or 'config'
  const [currentView, setCurrentView] = useState<'directory' | 'config'>('directory');
  const [selectedProviderId, setSelectedProviderId] = useState<AiProviderId>(
    initialProviderId || state.selectedProvider || 'gemini'
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Built-in / Common configuration form state
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [persistInSession, setPersistInSession] = useState(false);
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');

  // Custom provider builder state
  const [customProviderId, setCustomProviderId] = useState('');
  const [customDisplayName, setCustomDisplayName] = useState('');
  const [customModels, setCustomModels] = useState<CustomModelConfig[]>([
    { id: 'custom-model', name: 'Custom Model' },
  ]);
  const [customHeaders, setCustomHeaders] = useState<CustomHeaderConfig[]>([]);
  const [isEditingExistingCustom, setIsEditingExistingCustom] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customContextWindow, setCustomContextWindow] = useState<number>(32000);
  const [customMaxTokens, setCustomMaxTokens] = useState<number>(4096);
  const [customToolCalling, setCustomToolCalling] = useState<boolean>(false);

  // Connection test diagnostics state
  const [isTesting, setIsTesting] = useState(false);
  const [probeConsent, setProbeConsent] = useState(true);
  const [diagnosticResult, setDiagnosticResult] = useState<ConnectionDiagnosticResult | null>(null);

  // Validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Sync state when modal opens or provider changes
  const loadProviderConfig = useCallback((pId: AiProviderId) => {
    setSelectedProviderId(pId);
    setDiagnosticResult(null);
    setFormErrors({});

    const currentKey = keyManager.getApiKey(pId);
    setApiKeyInput(currentKey);
    setPersistInSession(keyManager.isPersistedInSession(pId));

    const isCustom = providerRegistry.isCustomProvider(pId);
    if (isCustom && pId !== 'custom') {
      const def = customProviderStore.getById(pId);
      if (def) {
        setIsEditingExistingCustom(true);
        setCustomProviderId(def.id);
        setCustomDisplayName(def.name);
        setCustomBaseUrl(def.baseUrl);
        setCustomModels(def.models && def.models.length > 0 ? def.models : [{ id: 'model-1', name: 'Model 1' }]);
        setCustomHeaders(def.headers || []);
        setCustomContextWindow(def.contextWindow || 32000);
        setCustomMaxTokens(def.maxTokens || 4096);
        setCustomToolCalling(Boolean(def.supportsToolCalling));
        setSelectedModelId(providerRegistry.getActiveModel(pId) || def.models[0]?.id || '');
        return;
      }
    }

    if (pId === 'custom') {
      setIsEditingExistingCustom(false);
      setCustomProviderId('');
      setCustomDisplayName('');
      try {
        const prov = providerRegistry.getProvider('custom');
        setCustomBaseUrl(prov.defaultBaseUrl || 'http://localhost:11434/v1');
      } catch {
        setCustomBaseUrl('http://localhost:11434/v1');
      }
      setCustomModels([{ id: 'custom-model', name: 'Custom Model' }]);
      setCustomHeaders([]);
      setCustomContextWindow(32000);
      setCustomMaxTokens(4096);
      setCustomToolCalling(false);
      setSelectedModelId('custom-model');
      return;
    }

    // Built-in provider
    setIsEditingExistingCustom(false);
    try {
      const providerObj = providerRegistry.getProvider(pId);
      setCustomBaseUrl(providerObj.defaultBaseUrl || '');
    } catch {
      setCustomBaseUrl('');
    }
    const currentActiveModel = providerRegistry.getActiveModel(pId);
    const availableModels = providerRegistry.getModelsForProvider(pId);
    setSelectedModelId(currentActiveModel || availableModels[0]?.id || '');
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const target = initialProviderId || state.selectedProvider || 'gemini';
    loadProviderConfig(target);
    setCurrentView('directory');
  }, [isOpen, initialProviderId, state.selectedProvider, loadProviderConfig]);

  // Autofocus search input when directory opens
  useEffect(() => {
    if (isOpen && currentView === 'directory') {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, currentView]);

  // Global Escape key handling and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (currentView === 'config') {
          setCurrentView('directory');
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentView, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  // Catalog filtering for search
  const catalog = useMemo(() => providerRegistry.getProviderCatalog(), []);

  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((entry) => {
      const matchName = entry.name.toLowerCase().includes(q);
      const matchId = String(entry.id).toLowerCase().includes(q);
      const matchDesc = entry.description.toLowerCase().includes(q);
      return matchName || matchId || matchDesc;
    });
  }, [catalog, searchQuery]);

  const popularProviders = useMemo(
    () => filteredCatalog.filter((c) => c.category === 'popular'),
    [filteredCatalog]
  );

  const otherProviders = useMemo(
    () => filteredCatalog.filter((c) => c.category === 'other'),
    [filteredCatalog]
  );

  const configuredProviders = useMemo(() => {
    return catalog.filter((c) => {
      if (c.id === 'mock') return false;
      return keyManager.hasApiKey(c.id) || (providerRegistry.isCustomProvider(c.id) && c.id !== 'custom');
    });
  }, [catalog]);

  if (!isOpen) return null;

  // Icon selector helper
  const renderProviderIcon = (iconName?: string, providerId?: AiProviderId) => {
    const className = "h-4 w-4";
    if (providerId === 'gemini') return <Sparkles className={`${className} text-cyan-400`} />;
    if (providerId === 'openrouter') return <Globe className={`${className} text-emerald-400`} />;
    if (providerId === 'openai') return <Cpu className={`${className} text-indigo-400`} />;
    if (providerId === 'mock') return <FlaskConical className={`${className} text-amber-400`} />;
    if (iconName === 'Zap') return <Zap className={`${className} text-amber-400`} />;
    if (iconName === 'Server') return <Server className={`${className} text-blue-400`} />;
    if (iconName === 'Flame') return <Flame className={`${className} text-orange-400`} />;
    if (iconName === 'Layers') return <Layers className={`${className} text-purple-400`} />;
    if (iconName === 'Activity') return <Activity className={`${className} text-emerald-400`} />;
    if (iconName === 'Compass') return <Compass className={`${className} text-rose-400`} />;
    return <Sliders className={`${className} text-cyan-400`} />;
  };

  const handleSelectProvider = (entry: ProviderCatalogEntry) => {
    loadProviderConfig(entry.id);
    // If it is an OpenAI-compatible template (e.g. Groq, Together), populate template defaults
    if (entry.isCustomTemplate && !keyManager.hasApiKey(entry.id)) {
      setCustomBaseUrl(entry.defaultBaseUrl || '');
      if (entry.defaultModels && entry.defaultModels.length > 0) {
        setSelectedModelId(entry.defaultModels[0].id);
      }
    }
    setCurrentView('config');
  };

  const handleClearKey = () => {
    keyManager.clearApiKey(selectedProviderId);
    setApiKeyInput('');
    setDiagnosticResult(null);
  };

  // Add / remove custom model rows
  const handleAddCustomModel = () => {
    setCustomModels((prev) => [
      ...prev,
      { id: '', name: '' },
    ]);
  };

  const handleUpdateCustomModel = (index: number, field: 'id' | 'name', value: string) => {
    setCustomModels((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[`model_${index}`];
      delete next.models;
      return next;
    });
  };

  const handleRemoveCustomModel = (index: number) => {
    setCustomModels((prev) => prev.filter((_, i) => i !== index));
  };

  // Add / remove custom header rows
  const handleAddCustomHeader = () => {
    setCustomHeaders((prev) => [
      ...prev,
      { id: `h_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, name: '', value: '', isSecret: false },
    ]);
  };

  const handleUpdateCustomHeader = (
    index: number,
    field: 'name' | 'value' | 'isSecret',
    value: string | boolean
  ) => {
    setCustomHeaders((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.headers;
      return next;
    });
  };

  const handleRemoveCustomHeader = (index: number) => {
    setCustomHeaders((prev) => prev.filter((_, i) => i !== index));
  };

  // Diagnostic Test Connection
  const handleRunDiagnostic = async () => {
    setIsTesting(true);
    setDiagnosticResult(null);
    setFormErrors({});

    const isCustom = selectedProviderId === 'custom' || isEditingExistingCustom;
    const targetBaseUrl = isCustom ? customBaseUrl : customBaseUrl;
    const targetModel = selectedModelId || (isCustom ? customModels[0]?.id : '');

    // Map custom headers
    const headersMap: Record<string, string> = {};
    if (isCustom) {
      for (const h of customHeaders) {
        if (h.name.trim() && h.value) {
          headersMap[h.name.trim()] = h.value;
        }
      }
    }

    try {
      // Temporarily stash key in keyManager for diagnostic
      if (apiKeyInput) {
        keyManager.setApiKey(selectedProviderId, apiKeyInput, persistInSession);
      }

      const result = await providerRegistry.testProviderConnection(
        selectedProviderId,
        targetBaseUrl,
        targetModel,
        headersMap,
        probeConsent
      );

      if (customDisplayName && result.message.includes('Connected successfully to')) {
        result.message = result.message.replace('Custom OpenAI-Compatible', customDisplayName);
      }

      setDiagnosticResult(result);
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : String(err);
      setDiagnosticResult({
        success: false,
        latencyMs: 0,
        message: rawMsg,
        errorDetails: rawMsg,
        errorCategory: 'unknown',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Save / Connect Provider
  const handleSaveAndConnect = () => {
    setFormErrors({});
    const isCustom = selectedProviderId === 'custom' || isEditingExistingCustom;

    if (isCustom) {
      // Validate custom provider definition
      const targetId = isEditingExistingCustom
        ? customProviderId
        : customProviderId.trim().toLowerCase();
      const targetName = customDisplayName.trim() || targetId || 'Custom Provider';

      const validation = customProviderStore.validate(
        {
          id: targetId,
          name: targetName,
          baseUrl: customBaseUrl,
          models: customModels,
          headers: customHeaders,
        },
        !isEditingExistingCustom
      );

      if (!validation.valid) {
        setFormErrors(validation.errors);
        return;
      }

      // Save custom provider definition
      const def: CustomProviderDefinition = {
        id: targetId,
        name: targetName,
        baseUrl: normalizeBaseUrl(customBaseUrl),
        description: `Custom endpoint (${normalizeBaseUrl(customBaseUrl)})`,
        models: customModels.map((m) => ({
          id: m.id.trim(),
          name: (m.name || m.id).trim(),
          contextWindow: customContextWindow,
          maxTokens: customMaxTokens,
          supportsStreaming: true,
          supportsToolCalling: customToolCalling,
        })),
        headers: customHeaders.filter((h) => h.name.trim()),
        contextWindow: customContextWindow,
        maxTokens: customMaxTokens,
        supportsStreaming: true,
        supportsToolCalling: customToolCalling,
      };

      const saveRes = providerRegistry.registerCustomProvider(def);
      if (!saveRes.success) {
        setFormErrors({ general: saveRes.error || 'Failed to save provider.' });
        return;
      }

      // Store API key in KeyManager (memory-only by default)
      if (apiKeyInput.trim()) {
        keyManager.setApiKey(targetId, apiKeyInput, persistInSession);
      } else {
        keyManager.clearApiKey(targetId);
      }

      // Select active model
      const activeModel = selectedModelId || def.models[0]?.id || 'custom-model';
      providerRegistry.setActiveModel(targetId, activeModel);
      assistAgentService.setProvider(targetId, activeModel);
      onClose();
      return;
    }

    // Built-in provider
    if (apiKeyInput.trim()) {
      keyManager.setApiKey(selectedProviderId, apiKeyInput, persistInSession);
    } else if (selectedProviderId !== 'mock') {
      keyManager.clearApiKey(selectedProviderId);
    }

    const availableModels = providerRegistry.getModelsForProvider(selectedProviderId);
    const activeModel = selectedModelId || availableModels[0]?.id || '';
    providerRegistry.setActiveModel(selectedProviderId, activeModel);
    assistAgentService.setProvider(selectedProviderId, activeModel);
    onClose();
  };

  const handleDeleteCustomProvider = () => {
    if (!isEditingExistingCustom) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete the custom provider "${customDisplayName || customProviderId}"?`
    );
    if (!confirmed) return;

    keyManager.clearApiKey(customProviderId);
    providerRegistry.removeCustomProvider(customProviderId);
    assistAgentService.setProvider('gemini');
    setCurrentView('directory');
  };

  const activeProviderObj = catalog.find((c) => c.id === selectedProviderId);
  const models = providerRegistry.getModelsForProvider(selectedProviderId);

  const modalContent = (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-provider-modal-title"
      data-testid="ai-provider-settings-modal"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 text-xs select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex w-full max-w-2xl flex-col max-h-[85vh] rounded-xl border border-[#2e3046] bg-[#141524] shadow-2xl overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* ══════════════════════════════════════════════════════════════
            VIEW A: PROVIDER DISCOVERY DIRECTORY
           ══════════════════════════════════════════════════════════════ */}
        {currentView === 'directory' && (
          <>
            {/* Header */}
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#2e3046] bg-[#18192c] px-4">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-cyan-400" />
                <h2 id="ai-provider-modal-title" className="text-sm font-semibold tracking-wide text-white">
                  Connect provider
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

            {/* Search Bar */}
            <div className="border-b border-[#26283d] bg-[#111220] p-3">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search providers..."
                  data-testid="provider-search-input"
                  className="w-full rounded-md border border-[#2e3046] bg-[#18192c] pl-8 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 p-0.5 rounded text-slate-400 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Provider List Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Configured Providers Section */}
              {configuredProviders.length > 0 && !searchQuery && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Configured Providers</span>
                    <span className="text-emerald-400 font-normal lowercase">ready in workspace</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {configuredProviders.map((entry) => {
                      const isSelected = state.selectedProvider === entry.id;
                      return (
                        <button
                          type="button"
                          key={`cfg-${entry.id}`}
                          onClick={() => handleSelectProvider(entry)}
                          data-testid={`configured-provider-${entry.id}`}
                          className={`w-full text-left flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-cyan-500/50 bg-cyan-950/20 text-white'
                              : 'border-[#26283d] bg-[#18192c]/60 hover:bg-[#18192c] hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-1.5 rounded-md bg-white/5 border border-white/10 shrink-0">
                              {renderProviderIcon(entry.iconName, entry.id)}
                            </div>
                            <div className="truncate">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-xs text-white">{entry.name}</span>
                                {isSelected && (
                                  <span className="rounded bg-cyan-500/20 px-1.5 py-0.2 text-[10px] text-cyan-300 font-mono">
                                    Active
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 truncate">{entry.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Configured
                            </span>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Popular Providers Section */}
              {popularProviders.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Popular
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {popularProviders.map((entry) => {
                      const isConnected =
                        entry.id === 'mock' || keyManager.hasApiKey(entry.id);
                      return (
                        <button
                          type="button"
                          key={entry.id}
                          onClick={() => handleSelectProvider(entry)}
                          data-testid={`provider-card-${entry.id}`}
                          className="w-full text-left flex items-center justify-between p-2.5 rounded-lg border border-[#26283d] bg-[#18192c]/40 hover:bg-[#18192c] hover:border-slate-700 transition-all cursor-pointer text-slate-300 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-1.5 rounded-md bg-white/5 border border-white/10 shrink-0 group-hover:scale-105 transition-transform">
                              {renderProviderIcon(entry.iconName, entry.id)}
                            </div>
                            <div className="truncate">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-xs text-white">{entry.name}</span>
                                {entry.browserCorsSupport && (
                                  <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 text-[9px] text-emerald-300 font-mono">
                                    CORS Ready
                                  </span>
                                )}
                                {entry.id === 'mock' && (
                                  <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 text-[9px] text-amber-300 font-mono">
                                    Offline Mock
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 truncate">{entry.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {isConnected && (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                                <Check className="h-3 w-3" />
                              </span>
                            )}
                            <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Other Providers Section */}
              {otherProviders.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Other Providers
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {otherProviders.map((entry) => {
                      const isConnected = keyManager.hasApiKey(entry.id);
                      return (
                        <button
                          type="button"
                          key={entry.id}
                          onClick={() => handleSelectProvider(entry)}
                          data-testid={`provider-card-${entry.id}`}
                          className="w-full text-left flex items-center justify-between p-2.5 rounded-lg border border-[#26283d] bg-[#18192c]/40 hover:bg-[#18192c] hover:border-slate-700 transition-all cursor-pointer text-slate-300 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-1.5 rounded-md bg-white/5 border border-white/10 shrink-0 group-hover:scale-105 transition-transform">
                              {renderProviderIcon(entry.iconName, entry.id)}
                            </div>
                            <div className="truncate">
                              <span className="font-medium text-xs text-white">{entry.name}</span>
                              <p className="text-[11px] text-slate-400 truncate">{entry.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {isConnected && (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                                <Check className="h-3 w-3" />
                              </span>
                            )}
                            <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No Results Empty State */}
              {popularProviders.length === 0 && otherProviders.length === 0 && (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Sliders className="h-8 w-8 mx-auto text-slate-600 mb-1" />
                  <p className="text-xs text-white font-medium">No matching providers found</p>
                  <p className="text-[11px] text-slate-500">
                    Try searching for &quot;Gemini&quot;, &quot;OpenRouter&quot;, &quot;OpenAI&quot;, or select &quot;Custom OpenAI-Compatible&quot;.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[#2e3046] bg-[#18192c] px-4 py-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>API keys are held in memory and never sent to external servers.</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs text-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════
            VIEW B: DEDICATED PROVIDER CONFIGURATION SCREEN
           ══════════════════════════════════════════════════════════════ */}
        {currentView === 'config' && (
          <>
            {/* Header */}
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#2e3046] bg-[#18192c] px-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentView('directory')}
                  data-testid="back-to-directory-btn"
                  className="flex items-center gap-1 rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                  title="Back to provider directory"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-white/5 border border-white/10">
                    {renderProviderIcon(activeProviderObj?.iconName, selectedProviderId)}
                  </div>
                  <h2 className="text-sm font-semibold text-white">
                    {selectedProviderId === 'custom' || isEditingExistingCustom
                      ? isEditingExistingCustom
                        ? `Edit ${customDisplayName || customProviderId}`
                        : 'Custom provider'
                      : activeProviderObj?.name || 'Configure provider'}
                  </h2>
                </div>
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

            {/* Form Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Description & Links */}
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <p>
                  {selectedProviderId === 'custom' || isEditingExistingCustom
                    ? 'Configure an OpenAI-compatible provider with custom endpoints, models, and HTTP headers.'
                    : activeProviderObj?.description || 'Configure credentials and model selection.'}
                </p>
                {activeProviderObj?.apiKeyHelpUrl && (
                  <a
                    href={activeProviderObj.apiKeyHelpUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline shrink-0 ml-2"
                  >
                    Get API Key <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  CUSTOM PROVIDER BUILDER FIELDS
                 ───────────────────────────────────────────────────────────── */}
              {(selectedProviderId === 'custom' || isEditingExistingCustom) && (
                <>
                  {/* Provider ID */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                      Provider ID <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={customProviderId}
                      onChange={(e) => {
                        setCustomProviderId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''));
                        setFormErrors((prev) => {
                          const n = { ...prev };
                          delete n.id;
                          return n;
                        });
                      }}
                      disabled={isEditingExistingCustom}
                      placeholder="e.g. myprovider"
                      data-testid="custom-provider-id-input"
                      className={`w-full rounded-md border ${
                        formErrors.id ? 'border-rose-500' : 'border-[#2e3046]'
                      } bg-[#12131c] px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500 disabled:opacity-60`}
                    />
                    {formErrors.id ? (
                      <p className="text-[10px] text-rose-400">{formErrors.id}</p>
                    ) : (
                      <p className="text-[10px] text-slate-500">
                        Lowercase letters, numbers, hyphens, and underscores. Stable internal identity.
                      </p>
                    )}
                  </div>

                  {/* Display Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                      Display Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={customDisplayName}
                      onChange={(e) => {
                        setCustomDisplayName(e.target.value);
                        setFormErrors((prev) => {
                          const n = { ...prev };
                          delete n.name;
                          return n;
                        });
                      }}
                      placeholder="e.g. My AI Provider"
                      data-testid="custom-provider-name-input"
                      className={`w-full rounded-md border ${
                        formErrors.name ? 'border-rose-500' : 'border-[#2e3046]'
                      } bg-[#12131c] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500`}
                    />
                    {formErrors.name && <p className="text-[10px] text-rose-400">{formErrors.name}</p>}
                  </div>

                  {/* Base URL */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="h-3 w-3 text-cyan-400" />
                      Base URL <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={customBaseUrl}
                      onChange={(e) => {
                        setCustomBaseUrl(e.target.value);
                        setFormErrors((prev) => {
                          const n = { ...prev };
                          delete n.baseUrl;
                          return n;
                        });
                      }}
                      placeholder="https://api.example.com/v1"
                      data-testid="custom-provider-url-input"
                      className={`w-full rounded-md border ${
                        formErrors.baseUrl ? 'border-rose-500' : 'border-[#2e3046]'
                      } bg-[#12131c] px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500`}
                    />
                    {formErrors.baseUrl ? (
                      <p className="text-[10px] text-rose-400">{formErrors.baseUrl}</p>
                    ) : (
                      <p className="text-[10px] text-slate-500">
                        HTTPS required for remote endpoints. HTTP allowed strictly for genuine loopback (localhost, 127.0.0.1).
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  BUILT-IN BASE URL (For OpenAI or OpenRouter proxy)
                 ───────────────────────────────────────────────────────────── */}
              {selectedProviderId === 'openai' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="h-3 w-3 text-cyan-400" />
                    Base URL (Optional Override)
                  </label>
                  <input
                    type="text"
                    value={customBaseUrl}
                    onChange={(e) => setCustomBaseUrl(e.target.value)}
                    placeholder="https://api.openai.com/v1"
                    className="w-full rounded-md border border-[#2e3046] bg-[#12131c] px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[10px] text-slate-500">
                    Direct browser requests to api.openai.com are blocked by browser CORS. Use OpenRouter for browser BYOK or route through a CORS proxy.
                  </p>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  API KEY INPUT
                 ───────────────────────────────────────────────────────────── */}
              {selectedProviderId !== 'mock' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Key className="h-3 w-3 text-cyan-400" />
                      API Key {selectedProviderId !== 'custom' && !isEditingExistingCustom && <span className="text-rose-400">*</span>}
                    </label>
                    <span className="text-[10px] text-slate-500">
                      {selectedProviderId === 'custom' || isEditingExistingCustom
                        ? 'Optional for unauthenticated local endpoints'
                        : 'Stored in memory only'}
                    </span>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder={`Enter API key for ${customDisplayName || activeProviderObj?.name || 'provider'}...`}
                      data-testid="ai-provider-api-key-input"
                      className="w-full rounded-md border border-[#2e3046] bg-[#12131c] pl-3 pr-20 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 hover:text-slate-200 hover:bg-white/5 flex items-center gap-1"
                      >
                        {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
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

                  <label className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={persistInSession}
                      onChange={(e) => setPersistInSession(e.target.checked)}
                      className="rounded border-[#2e3046] bg-[#12131c] text-cyan-500 focus:ring-0"
                    />
                    <span>Remember key for this browser session (cleared on tab close)</span>
                  </label>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  MODELS SECTION
                 ───────────────────────────────────────────────────────────── */}
              {selectedProviderId === 'custom' || isEditingExistingCustom ? (
                <div className="space-y-2 border-t border-[#26283d] pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                        Models <span className="text-rose-400">*</span>
                      </label>
                      <p className="text-[10px] text-slate-500">
                        Exact model IDs sent in API requests (e.g. &quot;llama-3.3-70b-instruct&quot;).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomModel}
                      data-testid="add-custom-model-btn"
                      className="flex items-center gap-1 rounded bg-white/5 hover:bg-white/10 px-2 py-1 text-[11px] text-cyan-400 transition-colors border border-white/10"
                    >
                      <Plus className="h-3 w-3" /> Add model
                    </button>
                  </div>

                  {formErrors.models && (
                    <p className="text-[10px] text-rose-400">{formErrors.models}</p>
                  )}

                  <div className="space-y-1.5">
                    {customModels.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={m.id}
                            onChange={(e) => handleUpdateCustomModel(idx, 'id', e.target.value)}
                            placeholder="Model ID (e.g. llama3)"
                            data-testid={`custom-model-id-input-${idx}`}
                            className={`w-full rounded-md border ${
                              formErrors[`model_${idx}`] ? 'border-rose-500' : 'border-[#2e3046]'
                            } bg-[#12131c] px-2.5 py-1.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500`}
                          />
                          {formErrors[`model_${idx}`] && (
                            <p className="text-[9px] text-rose-400 pt-0.5">
                              {formErrors[`model_${idx}`]}
                            </p>
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={m.name}
                            onChange={(e) => handleUpdateCustomModel(idx, 'name', e.target.value)}
                            placeholder="Display Name (optional)"
                            data-testid={`custom-model-name-input-${idx}`}
                            className="w-full rounded-md border border-[#2e3046] bg-[#12131c] px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomModel(idx)}
                          disabled={customModels.length <= 1}
                          data-testid={`remove-custom-model-btn-${idx}`}
                          className="p-1.5 rounded text-slate-500 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-slate-500"
                          title="Remove model"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Built-in Model Selection */
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                    Selected Model
                  </label>
                  <select
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    className="w-full rounded-md border border-[#2e3046] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({Math.round(m.contextWindow / 1000)}k context)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  CUSTOM HEADERS SECTION
                 ───────────────────────────────────────────────────────────── */}
              {(selectedProviderId === 'custom' || isEditingExistingCustom) && (
                <div className="space-y-2 border-t border-[#26283d] pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                        Custom HTTP Headers (Optional)
                      </label>
                      <p className="text-[10px] text-slate-500">
                        Optional headers required by your proxy or gateway (e.g. X-API-Key, User-Agent).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomHeader}
                      data-testid="add-custom-header-btn"
                      className="flex items-center gap-1 rounded bg-white/5 hover:bg-white/10 px-2 py-1 text-[11px] text-cyan-400 transition-colors border border-white/10"
                    >
                      <Plus className="h-3 w-3" /> Add header
                    </button>
                  </div>

                  {formErrors.headers && (
                    <p className="text-[10px] text-rose-400">{formErrors.headers}</p>
                  )}

                  {customHeaders.length > 0 && (
                    <div className="space-y-1.5">
                      {customHeaders.map((h, idx) => (
                        <div key={h.id || idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={h.name}
                            onChange={(e) => handleUpdateCustomHeader(idx, 'name', e.target.value)}
                            placeholder="Header Name (e.g. X-Custom-Auth)"
                            data-testid={`custom-header-name-input-${idx}`}
                            className="flex-1 rounded-md border border-[#2e3046] bg-[#12131c] px-2.5 py-1.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                          />
                          <input
                            type={h.isSecret ? 'password' : 'text'}
                            value={h.value}
                            onChange={(e) => handleUpdateCustomHeader(idx, 'value', e.target.value)}
                            placeholder="Header Value"
                            data-testid={`custom-header-value-input-${idx}`}
                            className="flex-1 rounded-md border border-[#2e3046] bg-[#12131c] px-2.5 py-1.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateCustomHeader(idx, 'isSecret', !h.isSecret)}
                            className={`px-1.5 py-1 rounded text-[10px] font-mono border ${
                              h.isSecret
                                ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800'
                                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                            }`}
                            title={h.isSecret ? 'Credential value masked' : 'Mask as credential'}
                          >
                            {h.isSecret ? 'Secret' : 'Plain'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomHeader(idx)}
                            data-testid={`remove-custom-header-btn-${idx}`}
                            className="p-1.5 rounded text-slate-500 hover:text-rose-400"
                            title="Remove header"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  ADVANCED CONFIGURATION (COLLAPSIBLE)
                 ───────────────────────────────────────────────────────────── */}
              {(selectedProviderId === 'custom' || isEditingExistingCustom) && (
                <div className="border-t border-[#26283d] pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white font-medium"
                  >
                    <Sliders className="h-3 w-3" />
                    <span>Advanced Configuration</span>
                    <ChevronRight
                      className={`h-3 w-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
                    />
                  </button>

                  {showAdvanced && (
                    <div className="grid grid-cols-2 gap-3 pt-3">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Context Window Limit (Tokens)
                        </label>
                        <input
                          type="number"
                          value={customContextWindow}
                          onChange={(e) => setCustomContextWindow(Number(e.target.value) || 32000)}
                          className="w-full rounded-md border border-[#2e3046] bg-[#12131c] px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Max Output Tokens
                        </label>
                        <input
                          type="number"
                          value={customMaxTokens}
                          onChange={(e) => setCustomMaxTokens(Number(e.target.value) || 4096)}
                          className="w-full rounded-md border border-[#2e3046] bg-[#12131c] px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="col-span-2 pt-1">
                        <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={customToolCalling}
                            onChange={(e) => setCustomToolCalling(e.target.checked)}
                            className="rounded border-[#2e3046] bg-[#12131c] text-cyan-500 focus:ring-0"
                          />
                          <span>Supports native OpenAI structured tool calling (Agent Mode)</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TEST PROBE & CONSENT DISCLOSURE
                 ───────────────────────────────────────────────────────────── */}
              <div className="rounded-lg border border-[#26283d] bg-[#111220] p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <Key className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold text-white text-[11px]">Connection Diagnostics & Billable Probe Disclosure:</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Testing the connection sends a lightweight, 5-token completion request to verify authentication, model routing, and network reachability. This may consume provider credits.
                    </p>
                    <label className="flex items-center gap-2 pt-1 text-[11px] text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={probeConsent}
                        onChange={(e) => setProbeConsent(e.target.checked)}
                        data-testid="test-probe-consent-checkbox"
                        className="rounded border-[#2e3046] bg-[#12131c] text-cyan-500 focus:ring-0"
                      />
                      <span>Authorize live test probe (stream: false, max 5 tokens)</span>
                    </label>
                  </div>
                </div>

                {/* Diagnostic Result Output */}
                {diagnosticResult && (
                  <div
                    className={`rounded-lg border p-2.5 text-xs space-y-1 mt-2 ${
                      diagnosticResult.success
                        ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                        : 'border-rose-500/30 bg-rose-950/20 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold">
                      {diagnosticResult.success ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                      )}
                      <span>{diagnosticResult.message}</span>
                    </div>

                    {diagnosticResult.suggestedAction && (
                      <p className="text-[11px] text-slate-300 pl-5">
                        <strong className="text-white">Recommendation:</strong> {diagnosticResult.suggestedAction}
                      </p>
                    )}

                    {diagnosticResult.corsRestricted && (
                      <p className="text-[11px] text-amber-300/90 pl-5 leading-relaxed">
                        Tip: OpenRouter (<code className="font-mono bg-black/40 px-1 py-0.5 rounded">https://openrouter.ai</code>) supports direct browser access with full CORS support.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[#2e3046] bg-[#18192c] px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isTesting}
                  onClick={handleRunDiagnostic}
                  data-testid="test-ai-connection-btn"
                  className="flex items-center gap-1.5 rounded border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs text-slate-200 transition-colors disabled:opacity-50"
                >
                  {isTesting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 text-cyan-400" />
                  )}
                  Test Connection
                </button>

                {isEditingExistingCustom && (
                  <button
                    type="button"
                    onClick={handleDeleteCustomProvider}
                    data-testid="delete-custom-provider-btn"
                    className="p-1.5 rounded text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete custom provider"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentView('directory')}
                  className="rounded px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndConnect}
                  data-testid="save-ai-settings-btn"
                  className="rounded bg-cyan-500 hover:bg-cyan-400 px-4 py-1.5 text-xs font-semibold text-slate-950 transition-colors shadow"
                >
                  Save / Connect Provider
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
