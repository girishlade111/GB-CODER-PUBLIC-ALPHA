import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BundleError,
  buildProject,
  formatBundleError,
  isBundledProjectType,
  preloadBundler,
} from '../services/bundlerService';
import { MultiFileProject, isScriptFile } from '../types/files';
import { ConsoleLog } from '../types';

export interface ProjectBundle {
  code: string;
  css: string;
}

const EMPTY_BUNDLE: ProjectBundle = { code: '', css: '' };

/**
 * Signature of everything that can affect a build. Used so an unrelated
 * re-render (or a change to a field the bundler ignores) does not trigger a
 * rebuild, and so identical content never rebuilds twice.
 */
const buildSignature = (project: MultiFileProject): string => {
  if (!isBundledProjectType(project.projectType)) return '';
  return JSON.stringify({
    type: project.projectType,
    entry: project.entry ?? null,
    files: [...project.files]
      .sort((a, b) => a.path.localeCompare(b.path))
      .map((f) => [f.path, f.content]),
  });
};

interface UseProjectBundleOptions {
  project: MultiFileProject;
  /** Routed to the existing Console panel — no separate error UI. */
  onConsoleLog: (log: ConsoleLog) => void;
  debounceMs?: number;
  enabled?: boolean;
}

/**
 * Debounced client-side build of a React/Vue project.
 *
 * Plain projects never build — the hook short-circuits so the default
 * experience carries no cost. Build failures are reported both as state (for a
 * status indicator) and as console entries, reusing the existing Console tab
 * rather than introducing a second error surface.
 */
export const useProjectBundle = ({
  project,
  onConsoleLog,
  debounceMs = 400,
  enabled = true,
}: UseProjectBundleOptions) => {
  const [bundle, setBundle] = useState<ProjectBundle>(EMPTY_BUNDLE);
  const [errors, setErrors] = useState<BundleError[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);

  const isFrameworkProject = isBundledProjectType(project.projectType);
  const signature = useMemo(() => buildSignature(project), [project]);

  // Kept in a ref so a new callback identity from the parent cannot retrigger
  // builds or, worse, feed a console-log loop.
  const onConsoleLogRef = useRef(onConsoleLog);
  useEffect(() => {
    onConsoleLogRef.current = onConsoleLog;
  }, [onConsoleLog]);

  const emit = useCallback((type: ConsoleLog['type'], message: string) => {
    onConsoleLogRef.current({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      message,
      timestamp: new Date().toISOString(),
    });
  }, []);

  // Start downloading the wasm toolchain as soon as a framework project opens,
  // so the first build is not also paying for the fetch.
  useEffect(() => {
    if (isFrameworkProject && enabled) preloadBundler();
  }, [isFrameworkProject, enabled]);

  const lastReportedRef = useRef<string>('');

  useEffect(() => {
    if (!isFrameworkProject || !enabled) {
      setBundle(EMPTY_BUNDLE);
      setErrors([]);
      setIsBuilding(false);
      return;
    }

    let cancelled = false;
    setIsBuilding(true);

    const timer = window.setTimeout(async () => {
      const result = await buildProject(project);
      if (cancelled) return;

      setErrors(result.errors);
      setIsBuilding(false);

      if (result.errors.length > 0) {
        // Only announce a given failure once, otherwise every keystroke while
        // the code is mid-edit floods the console with the same message.
        const fingerprint = result.errors.map(formatBundleError).join('\n');
        if (fingerprint !== lastReportedRef.current) {
          lastReportedRef.current = fingerprint;
          emit('error', `Build failed (${project.projectType}):`);
          result.errors.forEach((error) => emit('error', `  ${formatBundleError(error)}`));
        }
        // Keep the previous working bundle on screen rather than blanking the
        // preview on every transient syntax error mid-typing.
        return;
      }

      result.warnings.forEach((warning) => emit('warn', formatBundleError(warning)));

      if (lastReportedRef.current) {
        lastReportedRef.current = '';
        emit('info', 'Build succeeded.');
      }

      setBundle({ code: result.code, css: result.css });
    }, debounceMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // `signature` stands in for `project`: it changes only when the build inputs do.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, isFrameworkProject, enabled, debounceMs, emit]);

  /** Human-readable build status for the UI. */
  const status: 'idle' | 'building' | 'error' | 'ready' = !isFrameworkProject
    ? 'idle'
    : isBuilding
      ? 'building'
      : errors.length > 0
        ? 'error'
        : 'ready';

  return { bundle, errors, isBuilding, status };
};

/** Files whose contents feed the module graph — useful for UI affordances. */
export const scriptFileCount = (project: MultiFileProject): number =>
  project.files.filter((f) => isScriptFile(f.language)).length;
