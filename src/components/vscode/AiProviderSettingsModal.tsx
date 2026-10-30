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
  Download,
} from 'lucide-react';
import {
  AiProviderId,
  ConnectionDiagnosticResult,
  ApiKeyVerificationResult,
  CustomModelConfig,
  CustomHeaderConfig,
  CustomProviderDefinition,
  DiscoveredModel,
  ProviderCatalogEntry,
} from '../../services/ai/types';
import { keyManager, extractOrigin, getDefaultProviderOrigin } from '../../services/ai/keyManager';
import { providerRegistry } from '../../services/ai/providerRegistry';
import { customProviderStore } from '../../services/ai/customProviderStore';
import { assistAgentService } from '../../services/ai/assistAgentService';
import { normalizeBaseUrl } from '../../services/ai/providers/openaiCompatibleProvider';
import { BUILT_IN_CATALOG } from '../../services/ai/providerCatalog';

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
  type DirectoryTab = 'all' | 'popular' | 'compatible' | 'cloud' | 'local' | 'reference';
  const [activeTab, setActiveTab] = useState<DirectoryTab>('all');

  // Built-in / Common configuration form state
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [persistInSession, setPersistInSession] = useState(false);
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [authorizedDestinationConfirmed, setAuthorizedDestinationConfirmed] = useState(false);

  // Custom provider builder state
  const [customProviderId, setCustomProviderId] = useState('');
  const [customDisplayName, setCustomDisplayName] = useState('');
  const [customModels, setCustomModels] = useState<CustomModelConfig[]>([
    { id: '', name: '' },
  ]);
  const [customHeaders, setCustomHeaders] = useState<CustomHeaderConfig[]>([]);
  const [isEditingExistingCustom, setIsEditingExistingCustom] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customContextWindow, setCustomContextWindow] = useState<number>(32000);
  const [customMaxTokens, setCustomMaxTokens] = useState<number>(4096);
  const [customToolCalling, setCustomToolCalling] = useState<boolean>(false);

  // Model discovery state
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [fetchModelsError, setFetchModelsError] = useState<string | null>(null);
  const [fetchModelsSuccess, setFetchModelsSuccess] = useState<string | null>(null);
  const [discoveredModels, setDiscoveredModels] = useState<DiscoveredModel[]>([]);
  const [selectedDiscoveredIds, setSelectedDiscoveredIds] = useState<Set<string>>(new Set());
  const [discoveredSearchQuery, setDiscoveredSearchQuery] = useState('');
  const fetchAbortControllerRef = useRef<AbortController | null>(null);

  // Connection test diagnostics state
  const [isTesting, setIsTesting] = useState(false);
  const [probeConsent, setProbeConsent] = useState(true);
  const [diagnosticResult, setDiagnosticResult] = useState<ConnectionDiagnosticResult | null>(null);

  // Non-inference key verification diagnostics state
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [keyVerificationResult, setKeyVerificationResult] = useState<ApiKeyVerificationResult | null>(null);

  // Validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const cancelInFlightFetch = useCallback(() => {
    if (fetchAbortControllerRef.current) {
      fetchAbortControllerRef.current.abort();
      fetchAbortControllerRef.current = null;
    }
    setIsFetchingModels(false);
  }, []);

  // Sync state when modal opens or provider changes
  const loadProviderConfig = useCallback((pId: AiProviderId) => {
    setSelectedProviderId(pId);
    setDiagnosticResult(null);
    setKeyVerificationResult(null);
    setIsVerifyingKey(false);
    setFormErrors({});

    cancelInFlightFetch();
    setFetchModelsError(null);
    setFetchModelsSuccess(null);
    setDiscoveredModels([]);
    setSelectedDiscoveredIds(new Set());
    setDiscoveredSearchQuery('');
    setAuthorizedDestinationConfirmed(false);

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
        setCustomModels(def.models && def.models.length > 0 ? def.models : [{ id: '', name: '' }]);
        setCustomHeaders(def.headers || []);
        setCustomContextWindow(def.contextWindow || 32000);
        setCustomMaxTokens(def.maxTokens || 4096);
        setCustomToolCalling(Boolean(def.supportsToolCalling));
        const activeMod = providerRegistry.getActiveModel(pId);
        const resolvedMod = activeMod && def.models.some((m) => m.id === activeMod)
          ? activeMod
          : (def.models[0]?.id || '');
        setSelectedModelId(resolvedMod);
        return;
      }
    }

    // Check if it matches an OpenAI-compatible catalog template (e.g. mistral, groq, together)
    const templateEntry = BUILT_IN_CATALOG.find((c) => c.id === pId && c.isCustomTemplate);
    if (templateEntry) {
      const def = customProviderStore.getById(pId);
      if (def) {
        setIsEditingExistingCustom(true);
        setCustomProviderId(def.id);
        setCustomDisplayName(def.name);
        setCustomBaseUrl(def.baseUrl);
        setCustomModels(def.models && def.models.length > 0 ? def.models : [{ id: '', name: '' }]);
        setCustomHeaders(def.headers || []);
        setCustomContextWindow(def.contextWindow || 32000);
        setCustomMaxTokens(def.maxTokens || 4096);
        setCustomToolCalling(Boolean(def.supportsToolCalling));
        const activeMod = providerRegistry.getActiveModel(pId);
        const resolvedMod = activeMod && def.models.some((m) => m.id === activeMod)
          ? activeMod
          : (def.models[0]?.id || '');
        setSelectedModelId(resolvedMod);
        return;
      }

      setIsEditingExistingCustom(false);
      setCustomProviderId(templateEntry.id);
      setCustomDisplayName(templateEntry.name);
      setCustomBaseUrl(templateEntry.defaultBaseUrl || '');
      setCustomModels(
        templateEntry.defaultModels && templateEntry.defaultModels.length > 0
          ? templateEntry.defaultModels.map((m) => ({
              id: m.id,
              name: m.name,
              contextWindow: m.contextWindow,
              supportsToolCalling: m.supportsToolCalling,
            }))
          : [{ id: '', name: '' }]
      );
      setCustomHeaders([]);
      setCustomContextWindow(templateEntry.defaultModels?.[0]?.contextWindow || 32000);
      setCustomMaxTokens(4096);
      setCustomToolCalling(templateEntry.toolCallingSupport === true);
      setSelectedModelId(templateEntry.defaultModels?.[0]?.id || '');
      return;
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
      setCustomModels([{ id: '', name: '' }]);
      setCustomHeaders([]);
      setCustomContextWindow(32000);
      setCustomMaxTokens(4096);
      setCustomToolCalling(false);
      setSelectedModelId('');
      return;
    }

    // Built-in provider
    setIsEditingExistingCustom(false);
    setCustomProviderId('');
    setCustomDisplayName('');
    setCustomHeaders([]);
    const savedOverride = providerRegistry.getBaseUrlOverride(pId);
    try {
      const providerObj = providerRegistry.getProvider(pId);
      setCustomBaseUrl(savedOverride || providerObj.defaultBaseUrl || '');
    } catch {
      setCustomBaseUrl(savedOverride || '');
    }
    const currentActiveModel = providerRegistry.getActiveModel(pId);
    const availableModels = providerRegistry.getModelsForProvider(pId);
    setSelectedModelId(currentActiveModel || availableModels[0]?.id || '');
  }, [cancelInFlightFetch]);

  useEffect(() => {
    if (!isOpen) return;
    const target = initialProviderId || state.selectedProvider || 'gemini';
    loadProviderConfig(target);
    setCurrentView('directory');
    return cancelInFlightFetch;
  }, [isOpen, initialProviderId, state.selectedProvider, loadProviderConfig, cancelInFlightFetch]);

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
        e.stopPropagation();
        cancelInFlightFetch();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, currentView, onClose, cancelInFlightFetch]);

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
  const catalog = providerRegistry.getProviderCatalog();

  const filteredCatalog = useMemo(() => {
    let list = catalog;
    if (activeTab === 'popular') {
      list = list.filter((c) => c.tier === 'tier_a' || c.category === 'popular');
    } else if (activeTab === 'compatible') {
      list = list.filter((c) => c.tier === 'tier_b' && c.group !== 'local' && c.id !== 'custom' && c.id !== 'mock');
    } else if (activeTab === 'cloud') {
      list = list.filter((c) => c.tier === 'tier_c' || c.group === 'cloud');
    } else if (activeTab === 'local') {
      list = list.filter((c) => c.group === 'local' || c.id === 'ollama' || c.id === 'lmstudio' || c.id === 'vllm');
    } else if (activeTab === 'reference') {
      list = list.filter((c) => c.tier === 'tier_d' || c.group === 'reference');
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((entry) => {
      const matchName = entry.name.toLowerCase().includes(q);
      const matchId = String(entry.id).toLowerCase().includes(q);
      const matchDesc = entry.description.toLowerCase().includes(q);
      const matchTier = entry.tier?.toLowerCase().includes(q);
      const matchModels = entry.defaultModels?.some(
        (m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q)
      );
      return matchName || matchId || matchDesc || matchTier || matchModels;
    });
  }, [catalog, activeTab, searchQuery]);

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

  // Tier badge helper
  const renderTierBadge = (tier?: string) => {
    switch (tier) {
      case 'tier_a':
        return (
          <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 text-[9px] text-emerald-300 font-mono">
            Tier A · Native
          </span>
        );
      case 'tier_b':
        return (
          <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.2 text-[9px] text-cyan-300 font-mono">
            Tier B · Compatible
          </span>
        );
      case 'tier_c':
        return (
          <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 text-[9px] text-amber-300 font-mono">
            Tier C · Special Auth
          </span>
        );
      case 'tier_d':
        return (
          <span className="rounded bg-slate-500/10 border border-slate-500/20 px-1.5 py-0.2 text-[9px] text-slate-400 font-mono">
            Tier D · Catalog
          </span>
        );
      default:
        return null;
    }
  };

  // Icon selector helper
  const renderProviderIcon = (iconName?: string, providerId?: AiProviderId) => {
    const className = "h-4 w-4";
    if (providerId === 'gemini') return <Sparkles className={`${className} text-cyan-400`} />;
    if (providerId === 'openrouter') return <Globe className={`${className} text-emerald-400`} />;
    if (providerId === 'openai') return <Cpu className={`${className} text-indigo-400`} />;
    if (providerId === 'anthropic') return <Compass className={`${className} text-amber-300`} />;
    if (providerId === 'mock') return <FlaskConical className={`${className} text-amber-400`} />;
    if (iconName === 'Zap') return <Zap className={`${className} text-amber-400`} />;
    if (iconName === 'Server') return <Server className={`${className} text-blue-400`} />;
    if (iconName === 'Flame') return <Flame className={`${className} text-orange-400`} />;
    if (iconName === 'Layers') return <Layers className={`${className} text-purple-400`} />;
    if (iconName === 'Activity') return <Activity className={`${className} text-emerald-400`} />;
    if (iconName === 'Compass') return <Compass className={`${className} text-rose-400`} />;
    if (iconName === 'Search') return <Search className={`${className} text-teal-400`} />;
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

  const renderProviderCard = (entry: ProviderCatalogEntry, isConfiguredSection = false) => {
    const isConnected = entry.id === 'mock' || keyManager.hasApiKey(entry.id);
    const isSelected = state.selectedProvider === entry.id;

    return (
      <button
        type="button"
        key={entry.id}
        onClick={() => handleSelectProvider(entry)}
        data-testid={isConfiguredSection ? `configured-provider-${entry.id}` : `provider-card-${entry.id}`}
        className={`w-full text-left flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer group ${
          isSelected
            ? 'border-cyan-500/50 bg-cyan-950/20 text-white'
            : 'border-[var(--border)] bg-[var(--sidebar)]/40 hover:bg-[var(--sidebar)] hover:border-slate-700 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-1.5 rounded-md bg-white/5 border border-white/10 shrink-0 group-hover:scale-105 transition-transform">
            {renderProviderIcon(entry.iconName, entry.id)}
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-xs text-white">{entry.name}</span>
              {isSelected && (
                <span className="rounded bg-cyan-500/20 px-1.5 py-0.2 text-[10px] text-cyan-300 font-mono">
                  Active
                </span>
              )}
              {renderTierBadge(entry.tier)}
              {entry.browserCorsSupport && (
                <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 text-[9px] text-emerald-300 font-mono">
                  CORS Ready
                </span>
              )}
              {entry.toolCallingSupport === true && (
                <span className="rounded bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.2 text-[9px] text-purple-300 font-mono">
                  Tools
                </span>
              )}
              {entry.id === 'mock' && (
                <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 text-[9px] text-amber-300 font-mono">
                  Offline Mock
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{entry.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isConnected && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
              <Check className="h-3 w-3" />
              <span className="hidden sm:inline">Configured</span>
            </span>
          )}
          {entry.tier === 'tier_c' && !isConnected && (
            <span className="text-[10px] text-amber-400/80 font-mono hidden sm:inline">Special Auth</span>
          )}
          {entry.tier === 'tier_d' && !isConnected && (
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">Catalog</span>
          )}
          <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </button>
    );
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
      const oldId = next[index]?.id;
      next[index] = { ...next[index], [field]: value };

      if (field === 'id') {
        const trimmed = value.trim();
        if (!selectedModelId || selectedModelId === oldId || selectedModelId === 'custom-model') {
          setSelectedModelId(trimmed);
        }
      }
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
    setCustomModels((prev) => {
      const targetToRemove = prev[index];
      const next = prev.filter((_, i) => i !== index);
      if (targetToRemove && targetToRemove.id === selectedModelId) {
        setSelectedModelId(next[0]?.id || '');
      }
      return next;
    });
  };

  const isCustomMode =
    selectedProviderId === 'custom' ||
    isEditingExistingCustom ||
    Boolean(BUILT_IN_CATALOG.find((c) => c.id === selectedProviderId)?.isCustomTemplate) ||
    providerRegistry.isCustomProvider(selectedProviderId);

  const defaultOrigin = !isCustomMode ? getDefaultProviderOrigin(selectedProviderId) : '';
  const currentBaseUrlOrigin = extractOrigin(customBaseUrl);
  const isDestinationOverride = Boolean(
    !isCustomMode &&
    currentBaseUrlOrigin &&
    defaultOrigin &&
    currentBaseUrlOrigin !== defaultOrigin
  );
  const isDestinationAuthorized = !isDestinationOverride || keyManager.isOriginAuthorized(selectedProviderId, currentBaseUrlOrigin);

  // Model discovery actions
  const handleFetchModels = async () => {
    setFetchModelsError(null);
    setFetchModelsSuccess(null);
    setFormErrors({});

    const builtIn = selectedProviderId === 'openrouter' || selectedProviderId === 'openai';

    // Provider / Destination Mismatch Check
    if (selectedProviderId === 'openai' && (apiKeyInput.trim().startsWith('sk-or-') || customBaseUrl.includes('openrouter.ai'))) {
      setFormErrors((prev) => ({
        ...prev,
        apiKey: 'OpenRouter API key or endpoint detected under OpenAI provider. Select OpenRouter from the provider list, or enter an OpenAI API key.',
      }));
      return;
    }
    if (selectedProviderId === 'openrouter' && (apiKeyInput.trim().startsWith('sk-proj-') || (customBaseUrl.trim() && customBaseUrl.includes('api.openai.com')))) {
      setFormErrors((prev) => ({
        ...prev,
        apiKey: 'OpenAI API key or endpoint detected under OpenRouter provider. Select OpenAI from the provider list, or enter an OpenRouter API key.',
      }));
      return;
    }

    if (isDestinationOverride && !isDestinationAuthorized) {
      if (authorizedDestinationConfirmed) {
        keyManager.authorizeOrigin(selectedProviderId, currentBaseUrlOrigin);
      } else {
        setFormErrors((prev) => ({
          ...prev,
          baseUrl: `Destination Authorization Required: Please confirm explicit authorization below to route credentials to "${currentBaseUrlOrigin}".`,
        }));
        return;
      }
    }

    const defaultUrl = builtIn ? providerRegistry.getProvider(selectedProviderId).defaultBaseUrl : '';
    const rawUrl = customBaseUrl.trim() || defaultUrl;
    if (!rawUrl) {
      setFormErrors((prev) => ({ ...prev, baseUrl: 'Base URL is required to fetch models.' }));
      return;
    }

    cancelInFlightFetch();
    const controller = new AbortController();
    fetchAbortControllerRef.current = controller;
    setIsFetchingModels(true);

    const headersMap: Record<string, string> = {};
    for (const h of customHeaders) {
      if (h.name.trim() && h.value) {
        headersMap[h.name.trim()] = h.value;
      }
    }

    const targetId = builtIn ? selectedProviderId : isEditingExistingCustom
      ? customProviderId
      : (customProviderId.trim().toLowerCase() || selectedProviderId);

    if (isCustomMode && rawUrl) {
      keyManager.authorizeOrigin(targetId, rawUrl);
    }

    try {
      const result = await providerRegistry.fetchModelsForProvider(
        targetId,
        rawUrl,
        apiKeyInput.trim() || undefined,
        headersMap,
        controller.signal
      );

      if (controller.signal.aborted) return;

      if (result.success && result.models.length > 0) {
        if (builtIn) {
          providerRegistry.applyDiscoveredModels(selectedProviderId, result.models);
        }
        setDiscoveredModels(result.models);
        setSelectedDiscoveredIds(new Set(result.models.map((m) => m.id)));
        setFetchModelsSuccess(`Found ${result.models.length} model(s) from provider.`);
      } else {
        setDiscoveredModels([]);
        setSelectedDiscoveredIds(new Set());
        setFetchModelsError(result.error || 'Failed to fetch models from endpoint.');
      }
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      const msg = err instanceof Error ? err.message : String(err);
      setFetchModelsError(`Error fetching models: ${msg}`);
    } finally {
      if (fetchAbortControllerRef.current === controller) {
        setIsFetchingModels(false);
        fetchAbortControllerRef.current = null;
      }
    }
  };

  const handleAddSelectedDiscoveredModels = () => {
    if (selectedDiscoveredIds.size === 0) return;

    const toAdd = discoveredModels.filter((m) => selectedDiscoveredIds.has(m.id));
    if (toAdd.length === 0) return;

    const existingIds = new Set(customModels.map((m) => m.id.trim()).filter(Boolean));
    const newModels = toAdd.filter((m) => !existingIds.has(m.id)).map((m) => ({
      id: m.id, name: m.name, contextWindow: m.contextWindow, supportsToolCalling: m.supportsToolCalling,
    }));
    setCustomModels([...customModels.filter((m) => m.id.trim() || m.name.trim()), ...newModels]);
    if ((!selectedModelId || !customModels.some((m) => m.id === selectedModelId)) && newModels[0]) setSelectedModelId(newModels[0].id);

    setFetchModelsSuccess(`Added ${toAdd.length} model(s) to configuration.`);
    setDiscoveredModels([]);
    setSelectedDiscoveredIds(new Set());
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

  // Non-Inference API Key Verification Gate (GET /key)
  const handleVerifyKey = async () => {
    if (!apiKeyInput.trim()) {
      setFormErrors((prev) => ({ ...prev, apiKey: 'Please enter an API key to verify.' }));
      return;
    }

    setIsVerifyingKey(true);
    setKeyVerificationResult(null);
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.apiKey;
      return next;
    });

    if (selectedProviderId === 'openai' && (apiKeyInput.trim().startsWith('sk-or-') || customBaseUrl.includes('openrouter.ai'))) {
      setIsVerifyingKey(false);
      setFormErrors({
        apiKey: 'OpenRouter API key or endpoint detected under OpenAI provider. Switch to OpenRouter, or provide an OpenAI key.',
      });
      return;
    }
    if (selectedProviderId === 'openrouter' && (apiKeyInput.trim().startsWith('sk-proj-') || (customBaseUrl.trim() && customBaseUrl.includes('api.openai.com')))) {
      setIsVerifyingKey(false);
      setFormErrors({
        apiKey: 'OpenAI API key or endpoint detected under OpenRouter provider. Switch to OpenAI, or provide an OpenRouter key.',
      });
      return;
    }

    if (isDestinationOverride && !isDestinationAuthorized) {
      if (authorizedDestinationConfirmed) {
        keyManager.authorizeOrigin(selectedProviderId, currentBaseUrlOrigin);
      } else {
        setIsVerifyingKey(false);
        setFormErrors((prev) => ({
          ...prev,
          baseUrl: `Destination Authorization Required: Please confirm explicit authorization below to route credentials to "${currentBaseUrlOrigin}".`,
        }));
        return;
      }
    }

    const isCustom = isCustomMode;
    const defaultUrl = !isCustom ? providerRegistry.getProvider(selectedProviderId).defaultBaseUrl : '';
    const targetBaseUrl = customBaseUrl.trim() || defaultUrl;
    const targetId = isCustom
      ? (isEditingExistingCustom ? customProviderId : (customProviderId.trim().toLowerCase() || selectedProviderId))
      : selectedProviderId;

    const headersMap: Record<string, string> = {};
    if (isCustom) {
      for (const h of customHeaders) {
        if (h.name.trim() && h.value) {
          headersMap[h.name.trim()] = h.value;
        }
      }
    }

    try {
      if (apiKeyInput.trim()) {
        keyManager.setApiKey(targetId, apiKeyInput, persistInSession, targetBaseUrl);
        keyManager.authorizeOrigin(targetId, targetBaseUrl);
        if (isCustom) {
          keyManager.authorizeOrigin('custom', targetBaseUrl);
        }
      }

      const result = await providerRegistry.verifyProviderApiKey(
        targetId,
        apiKeyInput,
        targetBaseUrl,
        headersMap
      );

      if (result.success) {
        result.diagnosticCase = 'C';
      } else if (result.httpStatus === 401 || result.httpStatus === 403) {
        result.diagnosticCase = 'B';
      } else if (result.errorCategory === 'cors' || result.errorCategory === 'network') {
        result.diagnosticCase = 'D';
      }

      setKeyVerificationResult(result);
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : String(err);
      setKeyVerificationResult({
        success: false,
        latencyMs: 0,
        message: `Key verification error: ${rawMsg}`,
        endpointTested: targetBaseUrl,
        errorCategory: 'unknown',
        keyState: 'unverified',
      });
    } finally {
      setIsVerifyingKey(false);
    }
  };

  // Diagnostic Test Connection
  const handleRunDiagnostic = async () => {
    setIsTesting(true);
    setDiagnosticResult(null);
    setFormErrors({});

    if (selectedProviderId === 'openai' && (apiKeyInput.trim().startsWith('sk-or-') || customBaseUrl.includes('openrouter.ai'))) {
      setIsTesting(false);
      setFormErrors({
        apiKey: 'OpenRouter API key or endpoint detected under OpenAI provider. Switch to OpenRouter, or provide an OpenAI key.',
      });
      return;
    }
    if (selectedProviderId === 'openrouter' && (apiKeyInput.trim().startsWith('sk-proj-') || (customBaseUrl.trim() && customBaseUrl.includes('api.openai.com')))) {
      setIsTesting(false);
      setFormErrors({
        apiKey: 'OpenAI API key or endpoint detected under OpenRouter provider. Switch to OpenAI, or provide an OpenRouter key.',
      });
      return;
    }

    if (isDestinationOverride && !isDestinationAuthorized) {
      if (authorizedDestinationConfirmed) {
        keyManager.authorizeOrigin(selectedProviderId, currentBaseUrlOrigin);
      } else {
        setIsTesting(false);
        setFormErrors((prev) => ({
          ...prev,
          baseUrl: `Destination Authorization Required: Please confirm explicit authorization below to route credentials to "${currentBaseUrlOrigin}".`,
        }));
        return;
      }
    }

    const isCustom = isCustomMode;
    const defaultUrl = !isCustom ? providerRegistry.getProvider(selectedProviderId).defaultBaseUrl : '';
    const targetBaseUrl = customBaseUrl.trim() || defaultUrl;

    const isLocalUrl = /^(http:\/\/)?(localhost|127\.0\.0\.1|\[::1\])(:\d+)?/i.test(targetBaseUrl);
    if (!apiKeyInput.trim() && !isLocalUrl && selectedProviderId !== 'mock') {
      setIsTesting(false);
      setFormErrors({
        apiKey: `An API key is required before testing connection to ${activeProviderObj?.name || selectedProviderId}.`,
      });
      return;
    }

    // Strict model resolution
    let targetModel = '';
    if (isCustom) {
      if (selectedModelId && customModels.some((m) => m.id.trim() === selectedModelId.trim())) {
        targetModel = selectedModelId.trim();
      } else {
        const firstValid = customModels.find((m) => m.id && m.id.trim());
        targetModel = firstValid ? firstValid.id.trim() : '';
      }
    } else {
      const available = providerRegistry.getModelsForProvider(selectedProviderId);
      targetModel = (selectedModelId && available.some((m) => m.id === selectedModelId))
        ? selectedModelId
        : (available[0]?.id || '');
      if (!targetModel) setFetchModelsError('Selected model is unavailable. Refresh and select an available model.');
    }

    if (!targetModel) {
      setIsTesting(false);
      setFormErrors({ models: 'Please select or enter a valid model ID before testing connection.' });
      return;
    }

    // Map custom headers
    const headersMap: Record<string, string> = {};
    if (isCustom) {
      for (const h of customHeaders) {
        if (h.name.trim() && h.value) {
          headersMap[h.name.trim()] = h.value;
        }
      }
    }

    const targetId = isCustom
      ? (isEditingExistingCustom ? customProviderId : (customProviderId.trim().toLowerCase() || selectedProviderId))
      : selectedProviderId;

    try {
      // Temporarily stash key in keyManager for diagnostic
      if (apiKeyInput.trim()) {
        keyManager.setApiKey(targetId, apiKeyInput, persistInSession, targetBaseUrl);
        keyManager.authorizeOrigin(targetId, targetBaseUrl);
        if (isCustom) {
          keyManager.authorizeOrigin('custom', targetBaseUrl);
        }
      } else if (targetId !== 'mock') {
        keyManager.clearApiKey(targetId);
      }

      const result = await providerRegistry.testProviderConnection(
        targetId,
        targetBaseUrl,
        targetModel,
        headersMap,
        probeConsent
      );

      if (customDisplayName && result.message.includes('Connected successfully to')) {
        result.message = result.message.replace('Custom OpenAI-Compatible', customDisplayName);
      }

      // Correlate with Key Verification Diagnostic Matrix (Cases A-E)
      if (keyVerificationResult) {
        if (keyVerificationResult.success && !result.success && (result.httpStatus === 401 || result.httpStatus === 403)) {
          // Case A: Key valid on GET /key, but inference returns 401
          result.message = `[Diagnostic Case A: Valid Key, Inference 401] ${result.message}`;
          result.suggestedAction = `Your API key was confirmed valid by ${selectedProviderId} (GET /key = 200), but inference returned 401. This indicates account credit limits, permissions restricted to specific models, or model "${targetModel}" requiring separate activation.`;
        } else if (!keyVerificationResult.success && (keyVerificationResult.httpStatus === 401 || keyVerificationResult.httpStatus === 403) && (result.httpStatus === 401 || result.httpStatus === 403)) {
          // Case B: Both /key and inference return 401
          result.message = `[Diagnostic Case B: Key Rejected Upstream] ${result.message}`;
          if (selectedProviderId === 'inception' || targetBaseUrl.includes('inceptionlabs.ai')) {
            result.suggestedAction =
              'Inception Labs rejected your API key (401). Verify that your key was created on the developer platform dashboard (https://inceptionlabs.ai/dashboard) rather than the consumer playground, and ensure your account has an active plan or billing setup.';
          } else {
            result.suggestedAction = `Your API key was rejected by ${activeProviderObj?.name || selectedProviderId} on both key inspection and inference. Check for revoked keys or generate a fresh key in your ${activeProviderObj?.name || selectedProviderId} console.`;
          }
        } else if (keyVerificationResult.success && result.success) {
          // Case C: Both succeed
          result.message = `[Diagnostic Case C: Fully Authenticated] ${result.message}`;
        }
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

    if (selectedProviderId === 'openai' && (apiKeyInput.trim().startsWith('sk-or-') || customBaseUrl.includes('openrouter.ai'))) {
      setFormErrors({
        apiKey: 'OpenRouter API key or endpoint detected under OpenAI provider. Switch to OpenRouter, or provide an OpenAI key.',
      });
      return;
    }
    if (selectedProviderId === 'openrouter' && (apiKeyInput.trim().startsWith('sk-proj-') || (customBaseUrl.trim() && customBaseUrl.includes('api.openai.com')))) {
      setFormErrors({
        apiKey: 'OpenAI API key or endpoint detected under OpenRouter provider. Switch to OpenAI, or provide an OpenRouter key.',
      });
      return;
    }

    if (isDestinationOverride && !isDestinationAuthorized) {
      if (authorizedDestinationConfirmed) {
        keyManager.authorizeOrigin(selectedProviderId, currentBaseUrlOrigin);
      } else {
        setFormErrors((prev) => ({
          ...prev,
          baseUrl: `Destination Authorization Required: Please confirm explicit authorization below to route credentials to "${currentBaseUrlOrigin}".`,
        }));
        return;
      }
    }

    const isCustom = isCustomMode;

    if (isCustom) {
      // Validate custom provider definition
      const targetId = isEditingExistingCustom
        ? customProviderId
        : customProviderId.trim().toLowerCase();
      const targetName = customDisplayName.trim() || targetId || 'Custom Provider';

      // Filter out completely blank model rows if at least one populated model exists
      const cleanedModels = customModels.filter((m) => m.id.trim() || m.name.trim());
      const effectiveModels = cleanedModels.length > 0 ? cleanedModels : customModels;

      const validation = customProviderStore.validate(
        {
          id: targetId,
          name: targetName,
          baseUrl: customBaseUrl,
          models: effectiveModels,
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
        models: effectiveModels.map((m) => ({
          id: m.id.trim(),
          name: (m.name || m.id).trim(),
          contextWindow: m.contextWindow || customContextWindow,
          maxTokens: m.maxTokens || customMaxTokens,
          supportsStreaming: true,
          supportsToolCalling: m.supportsToolCalling ?? customToolCalling,
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
        keyManager.setApiKey(targetId, apiKeyInput, persistInSession, def.baseUrl);
      } else {
        keyManager.clearApiKey(targetId);
      }

      // Select active model
      const activeModel = (selectedModelId && def.models.some((m) => m.id === selectedModelId))
        ? selectedModelId
        : (def.models[0]?.id || '').trim();

      if (!activeModel) {
        setFormErrors({ models: 'At least one valid model must be configured.' });
        return;
      }

      providerRegistry.setActiveModel(targetId, activeModel);
      assistAgentService.setProvider(targetId, activeModel);
      onClose();
      return;
    }

    // Built-in provider
    const availableModels = providerRegistry.getModelsForProvider(selectedProviderId);
    const activeModel = selectedModelId || availableModels[0]?.id || '';
    if (!availableModels.some((m) => m.id === activeModel)) {
      setFormErrors({ general: 'Selected model is unavailable. Fetch models and explicitly select an available model.' });
      return;
    }

    // Save Base URL override if modified
    try {
      const defaultUrl = providerRegistry.getProvider(selectedProviderId).defaultBaseUrl;
      const currentOverride = customBaseUrl.trim();
      if (currentOverride && currentOverride !== defaultUrl) {
        providerRegistry.setBaseUrlOverride(selectedProviderId, currentOverride);
      } else {
        providerRegistry.setBaseUrlOverride(selectedProviderId, undefined);
      }
    } catch {}

    if (apiKeyInput.trim()) {
      keyManager.setApiKey(
        selectedProviderId,
        apiKeyInput,
        persistInSession,
        customBaseUrl.trim() || undefined
      );
    } else if (selectedProviderId !== 'mock') {
      keyManager.clearApiKey(selectedProviderId);
    }

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
      <div className="flex w-full max-w-2xl flex-col max-h-[85vh] rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-2xl overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* ══════════════════════════════════════════════════════════════
            VIEW A: PROVIDER DISCOVERY DIRECTORY
           ══════════════════════════════════════════════════════════════ */}
        {currentView === 'directory' && (
          <>
            {/* Header */}
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--sidebar)] px-4">
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
            <div className="border-b border-[var(--border)] bg-[var(--sidebar)] p-3">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search providers..."
                  data-testid="provider-search-input"
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--sidebar)] pl-8 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--ring)]"
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

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 border-b border-[var(--border)] bg-[var(--sidebar)] px-3 py-1.5 overflow-x-auto text-[11px]">
              {[
                { id: 'all', label: 'All' },
                { id: 'popular', label: 'Popular (Tier A)' },
                { id: 'compatible', label: 'Compatible (Tier B)' },
                { id: 'cloud', label: 'Cloud / Gateways (Tier C)' },
                { id: 'local', label: 'Local Runners' },
                { id: 'reference', label: 'Catalog (Tier D)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  data-testid={`provider-tab-${tab.id}`}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Provider List Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Configured Providers Section */}
              {configuredProviders.length > 0 && !searchQuery && activeTab === 'all' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Configured Providers</span>
                    <span className="text-emerald-400 font-normal lowercase">ready in workspace</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {configuredProviders.map((entry) => renderProviderCard(entry, true))}
                  </div>
                </div>
              )}

              {/* Popular Providers Section */}
              {popularProviders.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {activeTab === 'all' ? 'Popular' : 'Popular Providers'}
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {popularProviders.map((entry) => renderProviderCard(entry))}
                  </div>
                </div>
              )}

              {/* Other Providers Section */}
              {otherProviders.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {activeTab === 'all' ? 'Other Providers' : 'Provider Directory'}
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {otherProviders.map((entry) => renderProviderCard(entry))}
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
            <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--sidebar)] px-4 py-3">
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
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--sidebar)] px-4">
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

              {/* Tier C Special Authentication Requirements Banner */}
              {activeProviderObj?.tier === 'tier_c' && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-950/20 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-amber-300">Additional Integration Requirements</h4>
                      <p className="text-[11px] text-amber-200/90 leading-relaxed mt-0.5">
                        {activeProviderObj.tierCRequirements ||
                          'This provider requires cloud IAM, tenant authentication, or specialized gateway deployment.'}
                      </p>
                    </div>
                  </div>
                  {activeProviderObj.docUrl && (
                    <div className="pt-1">
                      <a
                        href={activeProviderObj.docUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 underline underline-offset-2"
                      >
                        <span>View setup documentation</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Tier D Catalog Reference Banner */}
              {activeProviderObj?.tier === 'tier_d' && (
                <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <Layers className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">Catalog Reference Entry</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                        {activeProviderObj.tierDStatus ||
                          'This provider is included in the catalog for ecosystem discovery. A native adapter is not yet connected.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {activeProviderObj.docUrl && (
                      <a
                        href={activeProviderObj.docUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                      >
                        <span>Documentation</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        loadProviderConfig('custom');
                        setCustomDisplayName(activeProviderObj.name);
                        if (activeProviderObj.defaultBaseUrl) {
                          setCustomBaseUrl(activeProviderObj.defaultBaseUrl);
                        }
                      }}
                      className="rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 px-2.5 py-1 text-[11px] text-white transition-colors"
                    >
                      Configure as Custom Provider
                    </button>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  CUSTOM PROVIDER BUILDER FIELDS
                 ───────────────────────────────────────────────────────────── */}
              {isCustomMode && (
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
                      disabled={isEditingExistingCustom || BUILT_IN_CATALOG.some((c) => c.id === customProviderId)}
                      placeholder="e.g. myprovider"
                      data-testid="custom-provider-id-input"
                      className={`w-full rounded-md border ${
                        formErrors.id ? 'border-rose-500' : 'border-[var(--border)]'
                      } bg-[var(--background)] px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-[var(--ring)] disabled:opacity-60`}
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
                        formErrors.name ? 'border-rose-500' : 'border-[var(--border)]'
                      } bg-[var(--background)] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[var(--ring)]`}
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
                        formErrors.baseUrl ? 'border-rose-500' : 'border-[var(--border)]'
                      } bg-[var(--background)] px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-[var(--ring)]`}
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
              {!isCustomMode &&
                (selectedProviderId === 'openai' ||
                  selectedProviderId === 'openrouter' ||
                  selectedProviderId === 'anthropic' ||
                  providerRegistry.getAllProviders().some((p) => p.id === selectedProviderId)) && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="h-3 w-3 text-cyan-400" />
                    Base URL (Optional Override)
                  </label>
                  <input
                    type="text"
                    value={customBaseUrl}
                    onChange={(e) => {
                      setCustomBaseUrl(e.target.value);
                      setDiagnosticResult(null);
                    }}
                    placeholder={providerRegistry.getProvider(selectedProviderId).defaultBaseUrl}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-[var(--ring)]"
                  />
                  {selectedProviderId === 'openai' && (
                    <p className="text-[10px] text-slate-500">
                      Direct browser requests to api.openai.com are blocked by browser CORS. Use OpenRouter for browser BYOK or route through a CORS proxy.
                    </p>
                  )}
                  {selectedProviderId === 'anthropic' && (
                    <p className="text-[10px] text-slate-500">
                      Direct browser requests to api.anthropic.com require CORS proxy routing or an authorized gateway. Header <code className="font-mono text-cyan-300">anthropic-dangerous-direct-browser-access: true</code> is attached automatically. For direct browser BYOK without a proxy, OpenRouter is recommended.
                    </p>
                  )}
                  {isDestinationOverride && !isDestinationAuthorized && (
                    <div className="rounded-md border border-amber-500/50 bg-amber-950/40 p-2.5 text-xs text-amber-200 mt-2 space-y-2">
                      <div className="flex items-start gap-2">
                        <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-300">Endpoint Destination Origin Override</p>
                          <p className="text-[11px] text-amber-200/90">
                            This Base URL directs requests to <strong className="font-mono text-cyan-300">{currentBaseUrlOrigin}</strong> instead of the default <strong className="font-mono text-slate-300">{defaultOrigin}</strong>.
                          </p>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 pt-1 text-[11px] text-amber-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={authorizedDestinationConfirmed}
                          onChange={(e) => setAuthorizedDestinationConfirmed(e.target.checked)}
                          className="rounded border-amber-500 bg-[var(--background)] text-cyan-500 focus:ring-0"
                        />
                        <span>I explicitly authorize sending credentials for "{selectedProviderId}" to <strong className="font-mono">{currentBaseUrlOrigin}</strong></span>
                      </label>
                    </div>
                  )}
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
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleVerifyKey}
                        disabled={isVerifyingKey || !apiKeyInput.trim()}
                        data-testid="verify-api-key-btn"
                        className="flex items-center gap-1 rounded bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/60 px-2 py-0.5 text-[10px] text-cyan-300 transition-colors disabled:opacity-50"
                        title="Verify API key validity without inference cost"
                      >
                        {isVerifyingKey ? (
                          <Loader2 className="h-3 w-3 animate-spin text-cyan-400" />
                        ) : (
                          <ShieldCheck className="h-3 w-3 text-cyan-400" />
                        )}
                        <span>{isVerifyingKey ? 'Verifying Key...' : 'Verify API Key'}</span>
                      </button>
                      <span className="text-[10px] text-slate-500">
                        {isCustomMode
                          ? 'Optional for unauthenticated local endpoints'
                          : 'Stored in memory only'}
                      </span>
                    </div>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKeyInput}
                      onChange={(e) => {
                        setApiKeyInput(e.target.value);
                        setKeyVerificationResult(null);
                      }}
                      placeholder={`Enter API key for ${customDisplayName || activeProviderObj?.name || 'provider'}...`}
                      data-testid="ai-provider-api-key-input"
                      className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] pl-3 pr-20 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-[var(--ring)]"
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
                          onClick={() => {
                            handleClearKey();
                            setKeyVerificationResult(null);
                          }}
                          className="p-1 rounded text-slate-500 hover:text-red-400"
                          title="Clear key"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Provider / Destination Mismatch Warning Alerts */}
                  {selectedProviderId === 'openai' && (apiKeyInput.trim().startsWith('sk-or-') || customBaseUrl.includes('openrouter.ai')) && (
                    <div className="rounded-md border border-amber-500/50 bg-amber-950/40 p-2.5 text-xs text-amber-200 flex items-start gap-2 mt-2">
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-300">Provider & Key Mismatch Detected</p>
                        <p className="text-[11px] text-amber-200/90">
                          You have selected the OpenAI provider, but entered an OpenRouter API key (<code className="font-mono text-amber-300">sk-or-v1-...</code>) or OpenRouter endpoint.
                          Please switch to the <strong>OpenRouter</strong> provider from the directory, or enter a valid OpenAI API key.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedProviderId === 'openrouter' && (apiKeyInput.trim().startsWith('sk-proj-') || (customBaseUrl && customBaseUrl.includes('api.openai.com'))) && (
                    <div className="rounded-md border border-amber-500/50 bg-amber-950/40 p-2.5 text-xs text-amber-200 flex items-start gap-2 mt-2">
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-300">Provider & Key Mismatch Detected</p>
                        <p className="text-[11px] text-amber-200/90">
                          You have selected the OpenRouter provider, but entered an OpenAI API key (<code className="font-mono text-amber-300">sk-proj-...</code>) or OpenAI endpoint.
                          Please switch to the <strong>OpenAI</strong> provider from the directory, or enter a valid OpenRouter API key.
                        </p>
                      </div>
                    </div>
                  )}

                  {formErrors.apiKey && <p className="text-[10px] text-rose-400">{formErrors.apiKey}</p>}

                  {/* Non-Inference Key Verification Diagnostic Output */}
                  {keyVerificationResult && (
                    <div
                      data-testid="key-verification-result"
                      className={`rounded-md border p-2.5 text-xs space-y-1 mt-2 ${
                        keyVerificationResult.success
                          ? 'border-emerald-500/40 bg-emerald-950/25 text-emerald-300'
                          : 'border-rose-500/40 bg-rose-950/25 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-semibold">
                          {keyVerificationResult.success ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          ) : (
                            <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                          )}
                          <span>{keyVerificationResult.message}</span>
                        </div>
                        {keyVerificationResult.diagnosticCase && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-slate-300">
                            Case {keyVerificationResult.diagnosticCase}
                          </span>
                        )}
                      </div>

                      {keyVerificationResult.keyDetails && (
                        <div className="pl-5 text-[11px] text-emerald-200/90 space-y-0.5 pt-0.5">
                          {keyVerificationResult.keyDetails.label && (
                            <p>Key Label: <span className="font-mono text-white font-semibold">{keyVerificationResult.keyDetails.label}</span></p>
                          )}
                          {typeof keyVerificationResult.keyDetails.usage === 'number' && (
                            <p>Total Usage: <span className="font-mono text-white">${keyVerificationResult.keyDetails.usage.toFixed(4)}</span></p>
                          )}
                          {keyVerificationResult.keyDetails.limit !== undefined && (
                            <p>Credit Limit: <span className="font-mono text-white">{keyVerificationResult.keyDetails.limit === null ? 'Unlimited' : '$' + keyVerificationResult.keyDetails.limit}</span></p>
                          )}
                          {keyVerificationResult.keyDetails.isFreeTier !== undefined && (
                            <p>Tier: <span className="font-mono text-white">{keyVerificationResult.keyDetails.isFreeTier ? 'Free Tier' : 'Paid Tier'}</span></p>
                          )}
                        </div>
                      )}

                      {keyVerificationResult.suggestedAction && (
                        <p className="text-[11px] text-slate-300 pl-5">
                          <strong className="text-white">Action:</strong> {keyVerificationResult.suggestedAction}
                        </p>
                      )}

                      <div className="pl-5 pt-0.5 text-[9px] text-slate-400 font-mono">
                        Endpoint: {keyVerificationResult.endpointTested} · Latency: {keyVerificationResult.latencyMs ?? 0}ms · Non-billable verification probe
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={persistInSession}
                      onChange={(e) => setPersistInSession(e.target.checked)}
                      className="rounded border-[var(--border)] bg-[var(--background)] text-cyan-500 focus:ring-0"
                    />
                    <span>Remember key for this browser session (cleared on tab close)</span>
                  </label>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  MODELS SECTION
                 ───────────────────────────────────────────────────────────── */}
              {isCustomMode ? (
                <div className="space-y-3 border-t border-[var(--border)] pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                        Models <span className="text-rose-400">*</span>
                      </label>
                      <p className="text-[10px] text-slate-500">
                        {activeProviderObj?.browserCorsSupport === false
                          ? 'Automatic discovery is restricted by provider CORS. Use bundled models or add manually.'
                          : 'Fetch available models from this provider or add one manually.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleFetchModels}
                        disabled={isFetchingModels}
                        data-testid="fetch-models-btn"
                        className="flex items-center gap-1 rounded bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/60 px-2.5 py-1 text-[11px] text-cyan-300 transition-colors disabled:opacity-50"
                        title="Fetch available models from provider endpoint"
                      >
                        {isFetchingModels ? (
                          <Loader2 className="h-3 w-3 animate-spin text-cyan-400" />
                        ) : (
                          <Download className="h-3 w-3 text-cyan-400" />
                        )}
                        <span>{isFetchingModels ? 'Fetching Models...' : 'Fetch Models'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAddCustomModel}
                        data-testid="add-custom-model-btn"
                        className="flex items-center gap-1 rounded bg-white/5 hover:bg-white/10 px-2 py-1 text-[11px] text-slate-300 transition-colors border border-white/10"
                      >
                        <Plus className="h-3 w-3" /> Add model
                      </button>
                    </div>
                  </div>

                  {/* Fetch Models Error Alert */}
                  {fetchModelsError && (
                    <div className="rounded-md border border-rose-900/60 bg-rose-950/30 p-2.5 text-xs text-rose-300 flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="font-medium text-rose-200">Unable to fetch models</p>
                          <p className="text-[11px] text-rose-300/90">{fetchModelsError}</p>
                          <p className="text-[10px] text-slate-400 pt-0.5">You can still enter model IDs manually below.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFetchModelsError(null)}
                        className="text-slate-500 hover:text-slate-300 p-0.5"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Fetch Models Success Banner */}
                  {fetchModelsSuccess && (
                    <div className="rounded-md border border-emerald-900/60 bg-emerald-950/30 p-2 text-xs text-emerald-300 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{fetchModelsSuccess}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFetchModelsSuccess(null)}
                        className="text-slate-500 hover:text-slate-300 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {/* Discovered Models Drawer */}
                  {discoveredModels.length > 0 && (
                    <div className="rounded-lg border border-cyan-800/40 bg-[var(--card)] p-3 space-y-2.5 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">Discovered Models</span>
                          <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300">
                            {discoveredModels.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedDiscoveredIds.size === discoveredModels.length) {
                                setSelectedDiscoveredIds(new Set());
                              } else {
                                setSelectedDiscoveredIds(new Set(discoveredModels.map((m) => m.id)));
                              }
                            }}
                            data-testid="select-all-discovered-models-btn"
                            className="text-[10px] text-cyan-400 hover:underline"
                          >
                            {selectedDiscoveredIds.size === discoveredModels.length ? 'Deselect All' : 'Select All'}
                          </button>
                          <button
                            type="button"
                            onClick={handleAddSelectedDiscoveredModels}
                            disabled={selectedDiscoveredIds.size === 0}
                            data-testid="add-selected-discovered-models-btn"
                            className="rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 px-2 py-0.5 text-[11px] font-medium text-white transition-colors"
                          >
                            Add Selected ({selectedDiscoveredIds.size})
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDiscoveredModels([]);
                              setSelectedDiscoveredIds(new Set());
                            }}
                            className="p-1 rounded text-slate-400 hover:text-white"
                            title="Dismiss discovered models"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Search in discovered models */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2 h-3 w-3 text-slate-500" />
                        <input
                          type="text"
                          value={discoveredSearchQuery}
                          onChange={(e) => setDiscoveredSearchQuery(e.target.value)}
                          placeholder="Search fetched models (e.g. mistral, codestral)..."
                          data-testid="discovered-models-search-input"
                          className="w-full rounded border border-[var(--border)] bg-[var(--background)] pl-7 pr-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[var(--ring)]"
                        />
                      </div>

                      {/* Scrollable Discovered List */}
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 divide-y divide-white/5 border border-white/5 rounded p-1 bg-[var(--sidebar)]">
                        {discoveredModels
                          .filter((m) => {
                            const q = discoveredSearchQuery.trim().toLowerCase();
                            if (!q) return true;
                            return (
                              m.id.toLowerCase().includes(q) ||
                              m.name.toLowerCase().includes(q) ||
                              (m.description || '').toLowerCase().includes(q)
                            );
                          })
                          .map((m) => {
                            const isChecked = selectedDiscoveredIds.has(m.id);
                            return (
                              <label
                                key={m.id}
                                className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors ${
                                  isChecked ? 'bg-cyan-950/20 text-white' : 'hover:bg-white/5 text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const next = new Set(selectedDiscoveredIds);
                                      if (e.target.checked) next.add(m.id);
                                      else next.delete(m.id);
                                      setSelectedDiscoveredIds(next);
                                    }}
                                    data-testid={`discovered-model-checkbox-${m.id}`}
                                    className="rounded border-[var(--border)] bg-[var(--background)] text-cyan-500 focus:ring-0"
                                  />
                                  <div className="truncate">
                                    <div className="font-mono text-xs font-medium text-white truncate">{m.id}</div>
                                    {m.name && m.name !== m.id && (
                                      <div className="text-[10px] text-slate-400 truncate">{m.name}</div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                  {m.contextWindow && (
                                    <span className="text-[9px] font-mono text-slate-400 bg-white/5 px-1 py-0.2 rounded border border-white/10">
                                      {Math.round(m.contextWindow / 1000)}k ctx
                                    </span>
                                  )}
                                  {m.ownedBy && (
                                    <span className="text-[9px] text-slate-500 truncate max-w-[80px]">
                                      {m.ownedBy}
                                    </span>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {formErrors.models && (
                    <p className="text-[10px] text-rose-400">{formErrors.models}</p>
                  )}

                  {/* Configured Models Rows */}
                  <div className="space-y-1.5">
                    {customModels.map((m, idx) => {
                      const isTarget = (selectedModelId && m.id === selectedModelId) || (!selectedModelId && idx === 0 && Boolean(m.id));
                      return (
                        <div key={idx} className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (m.id.trim()) setSelectedModelId(m.id.trim());
                            }}
                            title={isTarget ? 'Active target model' : 'Set as active target model'}
                            data-testid={`set-active-model-btn-${idx}`}
                            className={`p-1.5 rounded transition-all shrink-0 ${
                              isTarget
                                ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-700/50'
                                : 'text-slate-600 hover:text-slate-400 border border-transparent'
                            }`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={m.id}
                              onChange={(e) => handleUpdateCustomModel(idx, 'id', e.target.value)}
                              placeholder="Model ID (e.g. mistral-small-latest or llama-3.3-70b)"
                              data-testid={`custom-model-id-input-${idx}`}
                              className={`w-full rounded-md border ${
                                formErrors[`model_${idx}`] ? 'border-rose-500' : 'border-[var(--border)]'
                              } bg-[var(--background)] px-2.5 py-1.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-[var(--ring)]`}
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
                              className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[var(--ring)]"
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
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Built-in Model Selection */
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                    Selected Model
                  </label>
                  {(selectedProviderId === 'openrouter' || selectedProviderId === 'openai') && <>
                    <button type="button" data-testid="fetch-builtin-models-btn" onClick={handleFetchModels} disabled={isFetchingModels}
                      className="rounded border border-cyan-500/40 px-3 py-2 text-cyan-300">{isFetchingModels ? 'Fetching…' : 'Fetch Models'}</button>
                    <input aria-label="Search models" value={discoveredSearchQuery} onChange={(e) => setDiscoveredSearchQuery(e.target.value)}
                      placeholder="Search model name or ID" className="w-full bg-[var(--background)] p-2 border border-[var(--border)] rounded" />
                    {fetchModelsError && <p role="alert" className="text-rose-300">{fetchModelsError}</p>}
                    {fetchModelsSuccess && <p role="status">{fetchModelsSuccess} Catalog listing does not guarantee inference access.</p>}
                  </>}
                  {selectedProviderId === 'gemini' && <p className="text-slate-400">Bundled Gemini catalog. Automatic discovery is not supported by this adapter.</p>}
                  {(() => { const m = discoveredModels.find((item) => item.id === selectedModelId); return m ? <p className="text-[10px] text-slate-400">
                    {m.ownedBy || m.id.split('/')[0]} · Tools: {m.supportsToolCalling === undefined ? 'unknown' : m.supportsToolCalling ? 'supported' : 'unsupported'}
                    {' · '}{m.inputModalities?.join(', ') || 'input unknown'} → {m.outputModalities?.join(', ') || 'output unknown'}
                    {m.pricing && ` · USD/token: input ${m.pricing.prompt || 'unknown'}, output ${m.pricing.completion || 'unknown'}`}
                  </p> : null; })()}
                  {!models.some((m) => m.id === selectedModelId) && <p role="alert" className="text-amber-300">Selected model is unavailable. Select an available model.</p>}
                  <select
                    aria-label="Selected model"
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--ring)]"
                  >
                    {!models.some((m) => m.id === selectedModelId) && <option value={selectedModelId}>{selectedModelId || 'Select a model'} — unavailable</option>}
                    {models.filter((m) => m.id === selectedModelId || `${m.id} ${m.name}`.toLowerCase().includes(discoveredSearchQuery.toLowerCase())).slice(0, 150).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — {m.id} ({m.contextWindow ? `${Math.round(m.contextWindow / 1000)}k context` : 'context unknown'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  CUSTOM HEADERS SECTION
                 ───────────────────────────────────────────────────────────── */}
              {isCustomMode && (
                <div className="space-y-2 border-t border-[var(--border)] pt-3">
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
                            className="flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-[var(--ring)]"
                          />
                          <input
                            type={h.isSecret ? 'password' : 'text'}
                            value={h.value}
                            onChange={(e) => handleUpdateCustomHeader(idx, 'value', e.target.value)}
                            placeholder="Header Value"
                            data-testid={`custom-header-value-input-${idx}`}
                            className="flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-[var(--ring)]"
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
              {isCustomMode && (
                <div className="border-t border-[var(--border)] pt-2">
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
                          className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs text-white font-mono"
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
                          className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="col-span-2 pt-1">
                        <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={customToolCalling}
                            onChange={(e) => {
                              const supported = e.target.checked;
                              setCustomToolCalling(supported);
                              setCustomModels((prev) => prev.map((model) => ({ ...model, supportsToolCalling: supported })));
                            }}
                            className="rounded border-[var(--border)] bg-[var(--background)] text-cyan-500 focus:ring-0"
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
              <div className="rounded-lg border border-[var(--border)] bg-[var(--sidebar)] p-3 space-y-2">
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
                        className="rounded border-[var(--border)] bg-[var(--background)] text-cyan-500 focus:ring-0"
                      />
                      <span>Authorize live test probe (stream: false, max 5 tokens)</span>
                    </label>
                  </div>
                </div>

                {/* Diagnostic Result Output */}
                {diagnosticResult && (
                  <div
                    data-testid="diagnostic-result-alert"
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
            <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--sidebar)] px-4 py-3">
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

                {isEditingExistingCustom && !BUILT_IN_CATALOG.some((c) => c.id === customProviderId) && (
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
