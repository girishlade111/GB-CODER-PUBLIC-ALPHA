import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileCode,
  Info,
  Loader2,
  Package,
  Plus,
  Search,
  Sparkles,
  Terminal,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import {
  DetectedDependency,
  PackageResolutionError,
  ResolvedPackage,
  SANDBOX_HINT,
  detectDependencies,
  validateDependencyInput,
} from '../services/packageResolver';
import { MultiFileProject } from '../types/files';
import {
  CURATED_CATEGORIES,
  addDependencyToPackageJson,
  findPackageJson,
  parsePackageJson,
  removeDependencyFromPackageJson,
  searchNpmRegistry,
  NpmPackageSummary,
} from '../services/npm/npmRegistryService';
import {
  webcontainerService,
  subscribeWebContainer,
  getWebContainerSnapshot,
} from '../services/webcontainer/webcontainerService';
import { ataService } from '../services/ata/ataService';
import toast from 'react-hot-toast';

interface DependenciesPanelProps {
  project: MultiFileProject;
  resolvedPackages: ResolvedPackage[];
  unresolvedPackages: PackageResolutionError[];
  isResolving: boolean;
  onPin: (name: string, version: string) => void;
  onUnpin: (name: string) => void;
  onClose: () => void;
  onChangeFile?: (path: string, content: string) => void;
}

type TabType = 'installed' | 'search' | 'packageJson';

interface InstalledItem {
  name: string;
  requestedVersion: string;
  isDev: boolean;
  origin: 'package.json' | 'pinned' | 'code' | 'both';
  resolved?: ResolvedPackage;
  error?: PackageResolutionError;
  importedBy: string[];
}

const DependenciesPanel: React.FC<DependenciesPanelProps> = ({
  project,
  resolvedPackages,
  unresolvedPackages,
  isResolving,
  onPin,
  onUnpin,
  onClose,
  onChangeFile,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('installed');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NpmPackageSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('popular');
  const [installingPkg, setInstallingPkg] = useState<string | null>(null);
  const [installAsDev, setInstallAsDev] = useState(false);

  // Manual pin input
  const [manualDraft, setManualDraft] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);

  // WebContainer running npm install
  const [isRunningNpmInstall, setIsRunningNpmInstall] = useState(false);
  const webcontainer = useSyncExternalStore(
    subscribeWebContainer,
    getWebContainerSnapshot,
    getWebContainerSnapshot,
  );

  const abortControllerRef = useRef<AbortController | null>(null);

  // Package.json parsing
  const pkgJsonFile = useMemo(() => findPackageJson(project.files), [project.files]);
  const parsedPkgJson = useMemo(
    () => (pkgJsonFile ? parsePackageJson(pkgJsonFile.content) : null),
    [pkgJsonFile?.content],
  );

  // Detect imports in project code
  const detected: DetectedDependency[] = useMemo(() => detectDependencies(project), [project]);

  // Combine package.json dependencies, pins, and detected imports
  const installedItems: InstalledItem[] = useMemo(() => {
    const byName = new Map<string, InstalledItem>();
    const pins = project.dependencies ?? {};

    // 1. From package.json dependencies
    if (parsedPkgJson?.dependencies) {
      for (const [name, ver] of Object.entries(parsedPkgJson.dependencies)) {
        byName.set(name, {
          name,
          requestedVersion: ver,
          isDev: false,
          origin: 'package.json',
          importedBy: [],
        });
      }
    }

    // 2. From package.json devDependencies
    if (parsedPkgJson?.devDependencies) {
      for (const [name, ver] of Object.entries(parsedPkgJson.devDependencies)) {
        if (!byName.has(name)) {
          byName.set(name, {
            name,
            requestedVersion: ver,
            isDev: true,
            origin: 'package.json',
            importedBy: [],
          });
        }
      }
    }

    // 3. From code-detected dependencies
    for (const dep of detected) {
      const existing = byName.get(dep.name);
      if (existing) {
        existing.importedBy = dep.importedBy;
      } else {
        byName.set(dep.name, {
          name: dep.name,
          requestedVersion: dep.requestedVersion ?? pins[dep.name] ?? 'latest',
          isDev: false,
          origin: pins[dep.name] ? 'both' : 'code',
          importedBy: dep.importedBy,
        });
      }
    }

    // 4. From manual pinned dependencies
    for (const [name, ver] of Object.entries(pins)) {
      if (!byName.has(name)) {
        byName.set(name, {
          name,
          requestedVersion: ver,
          isDev: false,
          origin: 'pinned',
          importedBy: [],
        });
      }
    }

    // 5. Match resolution state
    for (const item of byName.values()) {
      item.resolved = resolvedPackages.find((pkg) => pkg.name === item.name);
      item.error = unresolvedPackages.find((err) => err.name === item.name);
    }

    return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [parsedPkgJson, detected, project.dependencies, resolvedPackages, unresolvedPackages]);

  const installedNamesSet = useMemo(
    () => new Set(installedItems.map((i) => i.name)),
    [installedItems],
  );

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(() => {
      searchNpmRegistry(searchQuery, 20, controller.signal)
        .then((results) => {
          setSearchResults(results);
          setIsSearching(false);
        })
        .catch(() => {
          setIsSearching(false);
        });
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  // Handle 1-Click Install
  const handleInstall = useCallback(
    async (name: string, version: string, isDev = false) => {
      setInstallingPkg(name);
      try {
        const formattedVer = /^[0-9]/.test(version) ? `^${version}` : version;

        // 1. Update or create package.json
        const currentContent =
          pkgJsonFile?.content ??
          JSON.stringify(
            {
              name: 'gb-coder-app',
              private: true,
              version: '0.0.0',
              type: 'module',
              dependencies: {},
            },
            null,
            2,
          );

        const updatedContent = addDependencyToPackageJson(
          currentContent,
          name,
          formattedVer,
          isDev,
        );

        if (onChangeFile) {
          onChangeFile('package.json', updatedContent);
        }

        // 2. Pin to project dependencies
        onPin(name, formattedVer);

        // 3. Sync to in-browser WebContainer filesystem
        void webcontainerService.syncFile('package.json', updatedContent);

        // 4. Dynamic type acquisition for Monaco
        ataService.acquireTypes(`import "${name}";`);

        toast.success(`Installed ${name}@${formattedVer}`);
      } catch (err) {
        console.error('Failed to install package:', err);
        toast.error(`Failed to install ${name}`);
      } finally {
        setInstallingPkg(null);
      }
    },
    [pkgJsonFile, onChangeFile, onPin],
  );

  // Handle 1-Click Uninstall
  const handleUninstall = useCallback(
    (name: string) => {
      try {
        if (pkgJsonFile && onChangeFile) {
          const updatedContent = removeDependencyFromPackageJson(pkgJsonFile.content, name);
          onChangeFile('package.json', updatedContent);
          void webcontainerService.syncFile('package.json', updatedContent);
        }
        onUnpin(name);
        toast.success(`Removed ${name}`);
      } catch (err) {
        console.error('Failed to remove package:', err);
        toast.error(`Failed to remove ${name}`);
      }
    },
    [pkgJsonFile, onChangeFile, onUnpin],
  );

  // Manual pin addition
  const handleManualAdd = () => {
    const validation = validateDependencyInput(manualDraft);
    if (!validation.valid) {
      setManualError(validation.error ?? 'Invalid package name or version format.');
      return;
    }
    void handleInstall(validation.name!, validation.version!, installAsDev);
    setManualDraft('');
    setManualError(null);
  };

  // Run npm install in WebContainer
  const handleRunWebContainerNpmI = async () => {
    if (webcontainer.status !== 'ready' && webcontainer.status !== 'running') {
      toast.error('WebContainer is not ready. Open Terminal tab to boot it.');
      return;
    }
    setIsRunningNpmInstall(true);
    const toastId = toast.loading('Running npm install in browser WebContainer...');
    try {
      const { exitCode } = await webcontainerService.runCommand('npm', [
        'install',
        '--legacy-peer-deps',
      ]);
      if (exitCode === 0) {
        toast.success('npm install completed successfully!', { id: toastId });
      } else {
        toast.error(`npm install exited with code ${exitCode}`, { id: toastId });
      }
    } catch (err) {
      toast.error('Failed to run npm install in container', { id: toastId });
    } finally {
      setIsRunningNpmInstall(false);
    }
  };

  const renderStatus = (item: InstalledItem) => {
    if (item.error) {
      return (
        <span
          className={`flex items-center gap-1 text-[11px] ${
            item.error.requiresSandbox ? 'text-amber-400' : 'text-red-400'
          }`}
          title={item.error.message}
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {item.error.requiresSandbox ? 'Needs Sandbox' : 'Unresolved'}
        </span>
      );
    }

    if (item.resolved) {
      return (
        <span
          className="flex items-center gap-1 text-[11px] text-emerald-400"
          title={`${item.resolved.url}\nResolved via ${item.resolved.source}`}
        >
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          {item.resolved.resolvedVersion ?? item.resolved.version}
        </span>
      );
    }

    if (isResolving) {
      return (
        <span className="flex items-center gap-1 text-[11px] text-content-muted">
          <Loader2 className="h-3 w-3 shrink-0 animate-spin text-accent" />
          Resolving
        </span>
      );
    }

    return (
      <span className="text-[11px] text-content-muted">
        {item.origin === 'pinned' ? 'Pinned' : item.origin === 'package.json' ? 'Ready' : 'Imported'}
      </span>
    );
  };

  return (
    <div className="flex h-full w-full flex-col bg-surface-base text-content-primary">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-stroke-subtle px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-red-500/20 text-red-400 font-bold text-[10px]">
            npm
          </div>
          <div>
            <h2 className="font-sans text-xs font-semibold uppercase tracking-wide text-content-primary">
              Package Manager
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-content-secondary transition-colors hover:bg-white/5 hover:text-content-primary"
          title="Close package manager"
          aria-label="Close package manager"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 border-b border-stroke-subtle bg-surface-overlay/50 px-2">
        <button
          type="button"
          onClick={() => setActiveTab('installed')}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === 'installed'
              ? 'border-accent text-content-primary'
              : 'border-transparent text-content-muted hover:text-content-secondary'
          }`}
        >
          <Package className="h-3.5 w-3.5" />
          <span>Installed</span>
          <span className="ml-1 rounded-full bg-surface-base px-1.5 py-0.2 text-[10px] text-content-secondary">
            {installedItems.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === 'search'
              ? 'border-accent text-content-primary'
              : 'border-transparent text-content-muted hover:text-content-secondary'
          }`}
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search & Install</span>
          <Sparkles className="h-2.5 w-2.5 text-accent animate-pulse" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('packageJson')}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === 'packageJson'
              ? 'border-accent text-content-primary'
              : 'border-transparent text-content-muted hover:text-content-secondary'
          }`}
        >
          <FileCode className="h-3.5 w-3.5" />
          <span>package.json</span>
        </button>
      </div>

      {/* WebContainer Fast Action Banner */}
      {webcontainer.isSupported && (
        <div className="flex shrink-0 items-center justify-between border-b border-stroke-subtle bg-product-elevated/40 px-3 py-1.5 text-[11px]">
          <div className="flex items-center gap-1.5 text-content-muted truncate">
            <Zap className="h-3 w-3 text-accent shrink-0" />
            <span className="truncate">In-Browser WebContainer runtime</span>
          </div>
          <button
            type="button"
            onClick={() => void handleRunWebContainerNpmI()}
            disabled={isRunningNpmInstall}
            className="flex items-center gap-1 rounded bg-accent/20 px-2 py-0.5 text-[10px] font-medium text-accent hover:bg-accent/30 disabled:opacity-50"
            title="Execute npm install in the WebContainer Virtual Filesystem"
          >
            {isRunningNpmInstall ? (
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
            ) : (
              <Terminal className="h-2.5 w-2.5" />
            )}
            Run npm i
          </button>
        </div>
      )}

      {/* ── TAB 1: INSTALLED PACKAGES ── */}
      {activeTab === 'installed' && (
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
          {/* Quick Manual Pin Bar */}
          <div className="border-b border-stroke-subtle p-2.5 bg-surface-overlay/20">
            <div className="flex gap-1.5">
              <input
                value={manualDraft}
                onChange={(e) => {
                  setManualDraft(e.target.value);
                  setManualError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleManualAdd();
                }}
                placeholder="Quick install: package@version..."
                className="min-w-0 flex-1 rounded-md border border-stroke-subtle bg-surface-overlay px-2.5 py-1 text-xs font-mono text-content-primary placeholder-content-muted outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={handleManualAdd}
                disabled={!manualDraft.trim() || installingPkg !== null}
                className="flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>
            {manualError && <p className="mt-1 text-[11px] text-red-400">{manualError}</p>}
          </div>

          {/* Installed List */}
          <div className="flex-1 overflow-y-auto p-2">
            {installedItems.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <Package className="mx-auto mb-2 h-7 w-7 text-content-muted opacity-40" />
                <p className="text-xs font-medium text-content-secondary">No packages installed yet</p>
                <p className="mt-1 text-[11px] text-content-muted">
                  Use the <strong>Search & Install</strong> tab to search npm packages, or add an
                  import directly in code.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('search')}
                  className="mt-3 rounded-md bg-accent/20 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/30"
                >
                  Explore Popular Packages
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {installedItems.map((item) => (
                  <div
                    key={item.name}
                    className="group flex items-center justify-between rounded-lg border border-stroke-subtle/40 bg-surface-overlay/30 p-2.5 transition-all hover:border-stroke-subtle hover:bg-surface-overlay/70"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`https://www.npmjs.com/package/${item.name}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs font-medium text-content-primary hover:text-accent flex items-center gap-1"
                        >
                          <span className="truncate">{item.name}</span>
                          <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-60" />
                        </a>
                        <span className="rounded bg-surface-base px-1.5 py-0.5 font-mono text-[10px] text-content-secondary">
                          {item.requestedVersion}
                        </span>
                        {item.isDev && (
                          <span className="rounded bg-amber-500/15 px-1 py-0.2 text-[9px] font-semibold text-amber-400">
                            dev
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[10px] text-content-muted">
                        {item.importedBy.length > 0
                          ? `Imported by ${item.importedBy.join(', ')}`
                          : item.origin === 'package.json'
                            ? 'Declared in package.json'
                            : 'Pinned package'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {renderStatus(item)}
                      <button
                        type="button"
                        onClick={() => handleUninstall(item.name)}
                        className="rounded p-1 text-content-muted opacity-0 transition-opacity hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
                        title={`Uninstall ${item.name}`}
                        aria-label={`Uninstall ${item.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: SEARCH & EXPLORE NPM REGISTRY ── */}
      {activeTab === 'search' && (
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
          {/* Search Box */}
          <div className="border-b border-stroke-subtle p-2.5 space-y-2">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-content-muted" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search npm packages (e.g. axios, lucide, zustand)..."
                className="w-full rounded-md border border-stroke-subtle bg-surface-overlay pl-8 pr-8 py-1.5 text-xs text-content-primary placeholder-content-muted outline-none focus:border-accent"
                autoFocus
              />
              {isSearching ? (
                <Loader2 className="absolute right-2.5 h-3.5 w-3.5 animate-spin text-accent" />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-content-muted hover:text-content-primary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            {/* Install type toggle */}
            <div className="flex items-center justify-between text-[11px] text-content-muted px-1">
              <span>Install to:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInstallAsDev(false)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    !installAsDev
                      ? 'bg-accent text-accent-fg'
                      : 'bg-surface-overlay text-content-muted hover:text-content-primary'
                  }`}
                >
                  dependencies
                </button>
                <button
                  type="button"
                  onClick={() => setInstallAsDev(true)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    installAsDev
                      ? 'bg-amber-500 text-black font-semibold'
                      : 'bg-surface-overlay text-content-muted hover:text-content-primary'
                  }`}
                >
                  devDependencies
                </button>
              </div>
            </div>
          </div>

          {/* Results / Curated List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {searchQuery.trim() ? (
              /* Live Search Results */
              searchResults.length === 0 && !isSearching ? (
                <div className="px-3 py-8 text-center text-xs text-content-muted">
                  No packages found for &quot;{searchQuery}&quot;. Try checking for typos or searching another term.
                </div>
              ) : (
                searchResults.map((pkg) => {
                  const isInstalled = installedNamesSet.has(pkg.name);
                  const isInstalling = installingPkg === pkg.name;

                  return (
                    <div
                      key={pkg.name}
                      className="rounded-lg border border-stroke-subtle/50 bg-surface-overlay/30 p-2.5 transition-all hover:border-stroke-subtle hover:bg-surface-overlay/60"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <a
                              href={pkg.npmUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-xs font-semibold text-content-primary hover:text-accent flex items-center gap-1"
                            >
                              <span>{pkg.name}</span>
                              <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                            </a>
                            <span className="rounded bg-surface-base px-1.5 py-0.2 font-mono text-[10px] text-content-secondary">
                              v{pkg.version}
                            </span>
                            {pkg.publisher && (
                              <span className="text-[10px] text-content-muted">
                                by @{pkg.publisher}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-content-secondary line-clamp-2">
                            {pkg.description}
                          </p>
                          {pkg.keywords.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {pkg.keywords.slice(0, 4).map((kw) => (
                                <span
                                  key={kw}
                                  className="rounded bg-surface-base/80 px-1 py-0.2 text-[9px] text-content-muted"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 pt-0.5">
                          {isInstalled ? (
                            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Installed</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => void handleInstall(pkg.name, pkg.version, installAsDev)}
                              disabled={isInstalling}
                              className="flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-50"
                            >
                              {isInstalling ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Plus className="h-3 w-3" />
                              )}
                              <span>Install</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              /* Curated / Popular Categories */
              <div>
                {/* Category Pills */}
                <div className="flex gap-1 overflow-x-auto pb-2 border-b border-stroke-subtle/50 mb-2">
                  {CURATED_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-accent text-accent-fg'
                          : 'bg-surface-overlay text-content-muted hover:text-content-secondary'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Category Items */}
                <div className="space-y-2">
                  {CURATED_CATEGORIES.find((c) => c.id === selectedCategory)?.packages.map((pkg) => {
                    const isInstalled = installedNamesSet.has(pkg.name);
                    const isInstalling = installingPkg === pkg.name;

                    return (
                      <div
                        key={pkg.name}
                        className="rounded-lg border border-stroke-subtle/40 bg-surface-overlay/30 p-2.5 transition-all hover:border-stroke-subtle hover:bg-surface-overlay/60"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-semibold text-content-primary">
                                {pkg.name}
                              </span>
                              <span className="rounded bg-surface-base px-1.5 py-0.2 font-mono text-[10px] text-content-secondary">
                                v{pkg.version}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-content-secondary line-clamp-2">
                              {pkg.description}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {pkg.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded bg-surface-base/80 px-1 py-0.2 text-[9px] text-content-muted"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="shrink-0 pt-0.5">
                            {isInstalled ? (
                              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Installed</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => void handleInstall(pkg.name, pkg.version, installAsDev)}
                                disabled={isInstalling}
                                className="flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-50"
                              >
                                {isInstalling ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Plus className="h-3 w-3" />
                                )}
                                <span>Install</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: PACKAGE.JSON LIVE VIEWER ── */}
      {activeTab === 'packageJson' && (
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden p-2.5">
          <div className="flex items-center justify-between pb-2 text-[11px] text-content-muted border-b border-stroke-subtle">
            <span>
              {pkgJsonFile ? 'Synchronized with project files' : 'Generated preview (no file saved yet)'}
            </span>
            {pkgJsonFile && (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Active
              </span>
            )}
          </div>
          <div className="flex-1 overflow-auto mt-2 rounded bg-surface-overlay/80 p-3 font-mono text-xs text-content-primary">
            <pre className="whitespace-pre">
              {pkgJsonFile
                ? pkgJsonFile.content
                : JSON.stringify(
                    {
                      name: 'gb-coder-app',
                      private: true,
                      version: '0.0.0',
                      type: 'module',
                      dependencies: project.dependencies ?? {},
                    },
                    null,
                    2,
                  )}
            </pre>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="shrink-0 border-t border-stroke-subtle p-2.5 bg-surface-overlay/30">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-content-muted" />
          <p className="text-[11px] leading-relaxed text-content-muted">
            Packages are instantly resolved via CDN (esm.sh) with Automatic TypeScript Type
            Acquisition (ATA). {SANDBOX_HINT}
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DependenciesPanel);
