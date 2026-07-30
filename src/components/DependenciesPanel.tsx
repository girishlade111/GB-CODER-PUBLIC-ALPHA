import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, Loader2, Package, Plus, Trash2, X } from 'lucide-react';
import {
  DetectedDependency,
  PackageResolutionError,
  ResolvedPackage,
  SANDBOX_HINT,
  detectDependencies,
  validateDependencyInput,
} from '../services/packageResolver';
import { MultiFileProject } from '../types/files';

interface DependenciesPanelProps {
  project: MultiFileProject;
  resolvedPackages: ResolvedPackage[];
  unresolvedPackages: PackageResolutionError[];
  isResolving: boolean;
  onPin: (name: string, version: string) => void;
  onUnpin: (name: string) => void;
  onClose: () => void;
}

interface DependencyRow {
  name: string;
  /** Version requested: inline in code, pinned, or `latest`. */
  requestedVersion: string;
  /** Where the request came from. */
  origin: 'code' | 'pinned' | 'both';
  resolved?: ResolvedPackage;
  error?: PackageResolutionError;
  importedBy: string[];
}

/**
 * Lists the npm packages a project uses.
 *
 * Rows come from two sources: auto-detected imports scanned across every file,
 * and versions the user pinned manually before writing the import. Both are
 * merged so a package pinned and then imported shows up once.
 */
const DependenciesPanel: React.FC<DependenciesPanelProps> = ({
  project,
  resolvedPackages,
  unresolvedPackages,
  isResolving,
  onPin,
  onUnpin,
  onClose,
}) => {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const detected: DetectedDependency[] = useMemo(() => detectDependencies(project), [project]);

  const rows: DependencyRow[] = useMemo(() => {
    const pins = project.dependencies ?? {};
    const byName = new Map<string, DependencyRow>();

    for (const dependency of detected) {
      byName.set(dependency.name, {
        name: dependency.name,
        requestedVersion: dependency.requestedVersion ?? pins[dependency.name] ?? 'latest',
        origin: pins[dependency.name] ? 'both' : 'code',
        importedBy: dependency.importedBy,
      });
    }

    // Pinned-but-not-yet-imported packages still deserve a row.
    for (const [name, version] of Object.entries(pins)) {
      if (byName.has(name)) continue;
      byName.set(name, { name, requestedVersion: version, origin: 'pinned', importedBy: [] });
    }

    // Attach resolution results by package name.
    for (const row of byName.values()) {
      row.resolved = resolvedPackages.find((pkg) => pkg.name === row.name);
      row.error = unresolvedPackages.find((err) => err.name === row.name);
    }

    return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [detected, project.dependencies, resolvedPackages, unresolvedPackages]);

  const handleAdd = () => {
    const validation = validateDependencyInput(draft);
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid package.');
      return;
    }
    onPin(validation.name!, validation.version!);
    setDraft('');
    setError(null);
  };

  const renderStatus = (row: DependencyRow) => {
    if (row.error) {
      return (
        <span
          className={`flex items-center gap-1 text-[11px] ${row.error.requiresSandbox ? 'text-amber-300' : 'text-red-300'}`}
          title={row.error.message}
        >
          <AlertTriangle className="h-3 w-3 shrink-0" />
          {row.error.requiresSandbox ? 'Needs Sandbox' : 'Unresolved'}
        </span>
      );
    }

    if (row.resolved) {
      return (
        <span
          className="flex items-center gap-1 text-[11px] text-emerald-300"
          title={`${row.resolved.url}\nResolved via ${row.resolved.source}`}
        >
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          {/* Prefer the version the CDN actually served over a `latest` request. */}
          {row.resolved.resolvedVersion ?? row.resolved.version}
        </span>
      );
    }

    if (isResolving) {
      return (
        <span className="flex items-center gap-1 text-[11px] text-content-muted">
          <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
          Resolving
        </span>
      );
    }

    return (
      <span className="text-[11px] text-content-muted" title="Not imported by any file yet">
        {row.origin === 'pinned' ? 'Pinned only' : 'Pending'}
      </span>
    );
  };

  return (
    <div className="flex h-full w-72 shrink-0 flex-col border-r border-stroke-subtle bg-surface-base">
      <div className="flex items-center justify-between border-b border-stroke-subtle px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Package className="h-4 w-4 shrink-0 text-content-secondary" />
          <h2 className="text-xs font-semibold uppercase tracking-wide text-content-secondary">
            Dependencies
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-content-secondary transition-colors hover:bg-white/5 hover:text-content-primary"
          title="Hide dependencies"
          aria-label="Hide dependencies"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {project.projectType === 'plain' ? (
        <p className="px-3 py-3 text-[11px] text-content-muted">
          npm packages are available in React and Vue projects. Start one from the menu to add
          dependencies.
        </p>
      ) : (
        <>
          {/* Manual pin input */}
          <div className="border-b border-stroke-subtle p-3">
            <div className="flex gap-1">
              <input
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleAdd();
                }}
                placeholder="package-name@version"
                aria-label="Add a dependency"
                className="min-w-0 flex-1 rounded-md border border-stroke-subtle bg-surface-overlay px-2 py-1.5 font-mono text-xs text-content-primary placeholder-content-muted outline-none transition-colors focus:border-accent"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={!draft.trim()}
                className="flex shrink-0 items-center justify-center rounded-md bg-accent px-2 text-accent-fg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-surface-overlay disabled:text-content-muted"
                title="Pin this version"
                aria-label="Pin this version"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {error && <p className="mt-2 text-[11px] text-red-300">{error}</p>}
            <p className="mt-2 text-[11px] text-content-muted">
              Imports are detected automatically. Pin a version here to override.
            </p>
          </div>

          {/* Dependency list */}
          <ul className="flex-1 overflow-y-auto p-2">
            {rows.length === 0 ? (
              <li className="px-1 py-3 text-[11px] text-content-muted">
                No packages yet. Add an import like{' '}
                <code className="font-mono text-content-secondary">
                  import axios from &apos;axios&apos;
                </code>{' '}
                and it will appear here.
              </li>
            ) : (
              rows.map((row) => (
                <li
                  key={row.name}
                  className="group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-white/[0.03]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-content-primary" title={row.name}>
                      {row.name}
                    </p>
                    <p className="truncate text-[10px] text-content-muted">
                      {row.origin === 'pinned'
                        ? `pinned ${row.requestedVersion}`
                        : row.importedBy.length > 0
                          ? row.importedBy.join(', ')
                          : row.requestedVersion}
                    </p>
                  </div>

                  {renderStatus(row)}

                  {(row.origin === 'pinned' || row.origin === 'both') && (
                    <button
                      type="button"
                      onClick={() => onUnpin(row.name)}
                      className="shrink-0 rounded-sm p-1 text-content-muted opacity-0 transition-opacity hover:bg-white/10 hover:text-red-300 group-hover:opacity-100"
                      title={`Remove the version pin for ${row.name}`}
                      aria-label={`Remove the version pin for ${row.name}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </li>
              ))
            )}
          </ul>
        </>
      )}

      {/* Capability note — sets expectations and points at Sandbox mode. */}
      <div className="border-t border-stroke-subtle p-3">
        <div className="flex gap-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-content-muted" />
          <p className="text-[11px] leading-relaxed text-content-muted">
            Packages run via CDN in-browser — great for UI libraries and utilities. {SANDBOX_HINT}
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DependenciesPanel);
