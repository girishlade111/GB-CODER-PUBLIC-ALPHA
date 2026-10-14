/**
 * WebContainer service — in-browser Node.js runtime powered by WebAssembly.
 *
 * Provides StackBlitz-level execution inside the browser without requiring
 * external cloud servers or paid sandbox quotas. Spawns real interactive PTY
 * shells ('jsh'), executes npm/node/vite, and automatically bridges dev servers
 * to the preview pane via the 'server-ready' event.
 */

import { WebContainer, FileSystemTree } from '@webcontainer/api';
import { ProjectFile, ProjectType } from '../../types/files';
import { webcontainerPerf } from './webcontainerPerf';
import { FileSyncCoordinator } from './fileSyncCoordinator';
export { FileSyncCoordinator };

/**
 * Optimized npm configuration for WebContainer:
 * - legacy-peer-deps: avoids ERESOLVE halts on modern packages
 * - audit=false: prevents slow remote security audit HTTP POST after install (saves 4-8s)
 * - fund=false: skips funding calculations
 * - prefer-offline=true: reuses cached packages without slow remote metadata queries
 * - progress=false: disables terminal ASCII progress bars, reducing browser PTY rendering load
 * - update-notifier=false: skips checking for npm updates
 */
export const OPTIMIZED_NPMRC = [
  'legacy-peer-deps=true',
  'audit=false',
  'fund=false',
  'prefer-offline=true',
  'progress=false',
  'update-notifier=false',
  '',
].join('\n');

/**
 * Computes a deterministic dependency fingerprint from project manifest and lockfiles.
 * Used to avoid redundant `npm install` cycles when opening or restarting the same project.
 */
export function computeDependencyFingerprint(
  files: ProjectFile[],
  extraDependencies?: Record<string, string>,
  projectType?: ProjectType,
): string {
  let pkgContent = '';
  let lockContent = '';

  for (const f of files) {
    if (!f.path) continue;
    const clean = f.path.replace(/^\/+/, '');
    if (clean === 'package.json') {
      pkgContent = f.content || '';
    } else if (
      clean === 'package-lock.json' ||
      clean === 'pnpm-lock.yaml' ||
      clean === 'yarn.lock'
    ) {
      lockContent += `${clean}:${f.content?.length || 0}:${(f.content || '').slice(0, 500)};`;
    }
  }

  let depsKey = '';
  if (pkgContent) {
    try {
      const parsed = JSON.parse(pkgContent);
      const deps = { ...(parsed.dependencies || {}), ...(extraDependencies || {}) };
      const devDeps = parsed.devDependencies || {};
      const sortedDeps = Object.keys(deps)
        .sort()
        .map((k) => `${k}@${deps[k]}`)
        .join(',');
      const sortedDev = Object.keys(devDeps)
        .sort()
        .map((k) => `${k}@${devDeps[k]}`)
        .join(',');
      depsKey = `deps:[${sortedDeps}]|dev:[${sortedDev}]`;
    } catch {
      depsKey = pkgContent.slice(0, 500);
    }
  } else {
    const isReact =
      projectType === 'react' ||
      files.some((f) => /\.(jsx|tsx)$/i.test(f.path) || f.content?.includes('react'));
    const isVue =
      projectType === 'vue' ||
      files.some((f) => /\.vue$/i.test(f.path) || f.content?.includes('vue'));
    const extra = extraDependencies
      ? Object.keys(extraDependencies)
          .sort()
          .map((k) => `${k}@${extraDependencies[k]}`)
          .join(',')
      : '';
    depsKey = `synth:${isReact ? 'react' : isVue ? 'vue' : 'plain'}|extra:[${extra}]`;
  }

  const rawString = `${depsKey}|lock:${lockContent}`;
  let hash = 5381;
  for (let i = 0; i < rawString.length; i++) {
    hash = ((hash << 5) + hash) ^ rawString.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

export type WebContainerStatus =
  | 'unsupported'
  | 'idle'
  | 'booting'
  | 'ready'
  | 'running'
  | 'error';

export type ProjectStartupStage =
  | 'idle'
  | 'booting'
  | 'mounting_files'
  | 'runtime_ready'
  | 'installing'
  | 'starting_server'
  | 'ready'
  | 'error';

export type PreviewStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface WebContainerRuntimeError {
  phase: 'boot' | 'mount' | 'install' | 'server' | 'preview' | 'general';
  message: string;
  details?: string;
  timestamp: number;
  recoverable: boolean;
  retryAction?: 'retry_install' | 'restart_server' | 'reload_preview' | 'reboot_container';
}

export interface WebContainerServerInfo {
  port: number;
  url: string;
  projectId?: string | null;
  sessionEpoch?: number;
}

export interface WebContainerState {
  status: WebContainerStatus;
  isSupported: boolean;
  serverUrl: string | null;
  serverPort: number | null;
  activeServers: WebContainerServerInfo[];
  error: string | null;
  startupStage: ProjectStartupStage;
  previewStatus: PreviewStatus;
  runtimeError: WebContainerRuntimeError | null;
  sessionEpoch: number;
  activeProjectId: string | null;
}

/** Converts a flat array of ProjectFile objects into a nested WebContainer FileSystemTree */
export function filesToFileSystemTree(
  files: ProjectFile[],
  extraDependencies?: Record<string, string>,
  projectType?: ProjectType,
): FileSystemTree {
  const root: FileSystemTree = {};
  let hasRootPackageJson = false;
  let hasNestedPackageJson = false;

  for (const file of files) {
    if (!file.path) continue;
    const cleanPath = file.path.replace(/^\/+/, '');
    const lower = cleanPath.toLowerCase();
    if (lower === 'package.json') {
      hasRootPackageJson = true;
    } else if (lower.endsWith('/package.json')) {
      hasNestedPackageJson = true;
    }
    const segments = cleanPath.split('/').filter(Boolean);
    if (segments.length === 0) continue;

    let current = root;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isFile = i === segments.length - 1;

      if (isFile) {
        current[segment] = {
          file: {
            contents: file.content ?? '',
          },
        };
      } else {
        if (!current[segment] || !('directory' in current[segment])) {
          current[segment] = {
            directory: {},
          };
        }
        current = (current[segment] as { directory: FileSystemTree }).directory;
      }
    }
  }

  // Root package.json handling:
  // 1. Explicit root manifest present: preserve it and merge extraDependencies if any.
  // 2. Nested manifest only: DO NOT synthesize root package.json (stays idle at root, no synthesis).
  // 3. Truly empty project (files.length === 0): DO NOT synthesize root package.json (stays idle).
  // 4. Non-empty plain project: provide fallback package.json for manual Node/npm commands in terminal.
  if (hasRootPackageJson) {
    if (extraDependencies && Object.keys(extraDependencies).length > 0) {
      const pkgNode = root['package.json'] as { file?: { contents: string } } | undefined;
      if (pkgNode?.file) {
        try {
          const parsed = JSON.parse(pkgNode.file.contents);
          parsed.dependencies = { ...(parsed.dependencies || {}), ...extraDependencies };
          pkgNode.file.contents = JSON.stringify(parsed, null, 2);
        } catch {
          // ignore
        }
      }
    }
  } else if (!hasNestedPackageJson && files.length > 0) {
    const isReact =
      projectType === 'react' ||
      files.some((f) => /\.(jsx|tsx)$/i.test(f.path) || f.content.includes('react'));
    const isVue =
      projectType === 'vue' ||
      files.some((f) => /\.vue$/i.test(f.path) || f.content.includes('vue'));

    const baseDeps: Record<string, string> = {};
    const baseDevDeps: Record<string, string> = {
      vite: '^5.4.11',
    };

    if (isReact) {
      baseDeps['react'] = '^18.3.1';
      baseDeps['react-dom'] = '^18.3.1';
      baseDevDeps['@vitejs/plugin-react'] = '^4.3.4';
    } else if (isVue) {
      baseDeps['vue'] = '^3.5.13';
      baseDevDeps['@vitejs/plugin-vue'] = '^5.2.1';
    }

    if (extraDependencies) {
      Object.assign(baseDeps, extraDependencies);
    }

    root['package.json'] = {
      file: {
        contents: JSON.stringify(
          {
            name: 'gb-coder-app',
            private: true,
            version: '0.0.0',
            type: 'module',
            scripts: {
              dev: 'vite',
              build: 'vite build',
              preview: 'vite preview',
              help: 'node .help.js',
            },
            dependencies: baseDeps,
            devDependencies: baseDevDeps,
          },
          null,
          2,
        ),
      },
    };
  }

  // Built-in help command script for WebContainer
  const helpScriptContent = `#!/usr/bin/env node
console.log(\`
\\x1b[1m\\x1b[32m⚡ WebContainer & Node.js Commands Guide (GB Coder IDE)\\x1b[0m

\\x1b[1m📦 Package Management:\\x1b[0m
  \\x1b[36mnpm install\\x1b[0m (or \\x1b[36mnpm i\\x1b[0m)            Install all dependencies from package.json
  \\x1b[36mnpm i <pkg>\\x1b[0m                   Install a package (e.g. npm i axios)
  \\x1b[36mnpm i -D <pkg>\\x1b[0m                Install as devDependency
  \\x1b[36mnpm uninstall <pkg>\\x1b[0m           Remove a package from project
  \\x1b[36mnpm ls --depth=0\\x1b[0m              List installed top-level packages

\\x1b[1m🚀 Development & Live Preview:\\x1b[0m
  \\x1b[36mnpm run dev\\x1b[0m                   Start Vite / Next dev server (Live Preview)
  \\x1b[36mnpm run build\\x1b[0m                 Build production bundle
  \\x1b[36mnpm run preview\\x1b[0m               Preview production build

\\x1b[1m📁 Filesystem & Navigation:\\x1b[0m
  \\x1b[36mls\\x1b[0m (or \\x1b[36mls -la\\x1b[0m)                List files and directories
  \\x1b[36mpwd\\x1b[0m                          Print current working directory
  \\x1b[36mcd <dir>\\x1b[0m                     Change directory (e.g. cd src)
  \\x1b[36mcat <file>\\x1b[0m                   View file contents (e.g. cat package.json)
  \\x1b[36mmkdir <dir>\\x1b[0m                  Create a directory
  \\x1b[36mrm -rf <path>\\x1b[0m               Delete file or directory (e.g. rm -rf node_modules)

\\x1b[1m⚙️ Node.js Execution:\\x1b[0m
  \\x1b[36mnode <file.js>\\x1b[0m               Execute a JavaScript file with Node.js
  \\x1b[36mnpx <cmd>\\x1b[0m                     Run a package executable directly

\\x1b[1m⌨️ IDE Shortcuts:\\x1b[0m
  \\x1b[33mCtrl + C\\x1b[0m                     Stop currently running server / process
  \\x1b[33mCtrl + L\\x1b[0m (or \\x1b[36mclear\\x1b[0m)           Clear terminal screen
  \\x1b[33mCtrl + \\\`\\x1b[0m                     Toggle / hide terminal panel
  \\x1b[33mCtrl + \\\\\\x1b[0m                     Split Editor (Side-by-side)
\`);
`;

  if (!root['node_modules']) {
    root['node_modules'] = { directory: {} };
  }
  const nmDir = root['node_modules'] as { directory: Record<string, unknown> };
  if (!nmDir.directory['.bin']) {
    nmDir.directory['.bin'] = { directory: {} };
  }
  const binDir = nmDir.directory['.bin'] as { directory: Record<string, unknown> };
  binDir.directory['help'] = {
    file: {
      contents: helpScriptContent,
    },
  };

  root['.help.js'] = {
    file: {
      contents: helpScriptContent,
    },
  };

  // Always ensure .npmrc exists with performance and isolation settings
  if (!root['.npmrc']) {
    root['.npmrc'] = {
      file: {
        contents: OPTIMIZED_NPMRC,
      },
    };
  }

  return root;
}

class WebContainerManager {
  private instance: WebContainer | null = null;
  private bootPromise: Promise<WebContainer> | null = null;
  private shellProcess: Awaited<ReturnType<WebContainer['spawn']>> | null = null;
  private shellWriter: WritableStreamDefaultWriter<string> | null = null;
  private serverListenersAttached = new WeakSet<WebContainer>();
  private eventUnsubscribers: Array<() => void> = [];
  private shellSpawnPromise: Promise<{
    write: (data: string) => void;
    resize: (cols: number, rows: number) => void;
    kill: () => void;
    disconnect: () => void;
  }> | null = null;
  private shellDataListeners = new Set<(chunk: string) => void>();
  private shellOutputBuffer: string[] = [];
  private isDevServerActive = false;
  private isDevServerStartingState = false;
  private sessionEpoch = 0;
  private spawnAttempts = 0;
  private installedManifestFingerprint: string | null = null;
  private activeProjectId: string | null = null;
  private lastStartedFingerprint: string | null = null;
  private lastStartedEpoch = -1;
  private drainingPorts = new Map<number, { projectId: string | null; sessionEpoch: number; drainedAt: number }>();
  private pendingDrainingCloses = new Map<number, number>();
  private mountQueue: Promise<void> = Promise.resolve();
  private devServerStartEpoch: number | null = null;
  private devServerStartProjectId: string | null = null;

  private fileSyncCoordinator = new FileSyncCoordinator({
    debounceMs: 200,
    rawWrite: async (cleanPath, content) => {
      if (!this.instance) return;
      const dirIndex = cleanPath.lastIndexOf('/');
      if (dirIndex !== -1) {
        const dir = cleanPath.slice(0, dirIndex);
        await this.instance.fs.mkdir(dir, { recursive: true });
      }
      await this.instance.fs.writeFile(cleanPath, content);
    },
    rawDelete: async (cleanPath) => {
      if (!this.instance) return;
      await this.instance.fs.rm(cleanPath, { recursive: true });
    },
    onDependencyInvalidation: () => {
      this.invalidateDependencyCache();
    },
  });

  private state: WebContainerState = {
    status: typeof window !== 'undefined' && window.crossOriginIsolated ? 'idle' : 'unsupported',
    isSupported: typeof window !== 'undefined' ? Boolean(window.crossOriginIsolated) : false,
    serverUrl: null,
    serverPort: null,
    activeServers: [],
    error: null,
    startupStage: 'idle',
    previewStatus: 'idle',
    runtimeError: null,
    sessionEpoch: 0,
    activeProjectId: null,
  };

  private listeners = new Set<() => void>();
  private restartListeners = new Set<(reason?: string) => void>();

  constructor() {
    // Re-verify support in browser runtime
    if (typeof window !== 'undefined') {
      const supported = Boolean(window.crossOriginIsolated);
      this.state.isSupported = supported;
      if (!supported) {
        this.state.status = 'unsupported';
      }
    }
  }

  public getState(): WebContainerState {
    return this.state;
  }

  public setStartupStage(
    stage: ProjectStartupStage,
    runtimeError?: WebContainerRuntimeError | null,
  ): void {
    const patch: Partial<WebContainerState> = { startupStage: stage };
    if (stage === 'error') {
      if (runtimeError) {
        patch.runtimeError = runtimeError;
        patch.error = runtimeError.message;
      }
    } else if (runtimeError === undefined) {
      // Transitioning away from error automatically clears error flags
      patch.runtimeError = null;
      patch.error = null;
    }
    this.updateState(patch);
  }

  public setPreviewStatus(status: PreviewStatus, errorMsg?: string | null): void {
    const patch: Partial<WebContainerState> = { previewStatus: status };
    if (status === 'error') {
      patch.runtimeError = {
        phase: 'preview',
        message: errorMsg || 'Live preview failed to render.',
        timestamp: Date.now(),
        recoverable: true,
        retryAction: 'reload_preview',
      };
      patch.error = patch.runtimeError.message;
    } else if (status === 'ready' && this.state.runtimeError?.phase === 'preview') {
      patch.runtimeError = null;
      patch.error = null;
    }
    this.updateState(patch);
  }

  public setRuntimeError(error: WebContainerRuntimeError | null): void {
    if (error) {
      this.updateState({
        runtimeError: error,
        error: error.message,
        startupStage: 'error',
      });
    } else {
      this.updateState({
        runtimeError: null,
        error: null,
      });
    }
  }

  public clearRuntimeError(): void {
    this.updateState({
      runtimeError: null,
      error: null,
    });
  }

  public markProjectStarted(fingerprint: string): void {
    this.lastStartedFingerprint = fingerprint;
    this.lastStartedEpoch = this.sessionEpoch;
  }

  public hasStartedProject(fingerprint: string): boolean {
    return (
      this.lastStartedFingerprint === fingerprint &&
      this.lastStartedEpoch === this.sessionEpoch
    );
  }

  public resetProjectStartState(): void {
    this.lastStartedFingerprint = null;
    this.lastStartedEpoch = -1;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public onRestartRequest(listener: (reason?: string) => void): () => void {
    this.restartListeners.add(listener);
    return () => this.restartListeners.delete(listener);
  }

  /**
   * Resets server URLs and transitions the preview back to the StackBlitz Startup Loader,
   * notifying all terminal listeners to execute dev server restart.
   */
  public requestRestart(reason = 'Restart request'): void {
    this.sessionEpoch++;
    this.isDevServerActive = false;
    this.isDevServerStartingState = false;
    this.resetProjectStartState();
    this.updateState({
      serverUrl: null,
      serverPort: null,
      activeServers: [],
      startupStage: 'installing',
      previewStatus: 'idle',
      error: null,
      runtimeError: null,
      sessionEpoch: this.sessionEpoch,
    });
    this.restartListeners.forEach((listener) => {
      try {
        listener(reason);
      } catch (err) {
        console.error('[WebContainer] Restart listener error:', err);
      }
    });
  }

  public getActiveProjectId(): string | null {
    return this.activeProjectId;
  }

  public attachProject(projectId: string): void {
    if (this.activeProjectId === projectId) return;

    // If another project was attached, cleanly tear down its dev server and pending writes
    if (this.activeProjectId !== null) {
      this.stopDevServer();
      this.sessionEpoch++;
      this.resetProjectStartState();
      this.fileSyncCoordinator.cancelAll();
    } else {
      this.sessionEpoch++;
    }

    this.activeProjectId = projectId;
    this.devServerStartEpoch = null;
    this.devServerStartProjectId = null;
    this.fileSyncCoordinator.setScope(projectId);
    this.updateState({
      activeProjectId: projectId,
      serverUrl: null,
      serverPort: null,
      activeServers: [],
      startupStage: 'idle',
      previewStatus: 'idle',
      error: null,
      runtimeError: null,
      sessionEpoch: this.sessionEpoch,
    });
  }

  public detachProject(projectId?: string): void {
    if (projectId && this.activeProjectId !== projectId) {
      return;
    }

    if (this.activeProjectId !== null) {
      this.stopDevServer();
      this.sessionEpoch++;
      this.resetProjectStartState();
      this.fileSyncCoordinator.cancelAll();
    }
    this.activeProjectId = null;
    this.devServerStartEpoch = null;
    this.devServerStartProjectId = null;
    this.fileSyncCoordinator.setScope(null);
    this.updateState({
      activeProjectId: null,
      serverUrl: null,
      serverPort: null,
      activeServers: [],
      startupStage: 'idle',
      previewStatus: 'idle',
      error: null,
      runtimeError: null,
      sessionEpoch: this.sessionEpoch,
    });
  }

  public resetServerState(): void {
    this.isDevServerActive = false;
    this.isDevServerStartingState = false;
    this.resetProjectStartState();
    this.updateState({
      serverUrl: null,
      serverPort: null,
      activeServers: [],
      startupStage: 'idle',
      previewStatus: 'idle',
      error: null,
      runtimeError: null,
    });
  }

  public isShellRunning(): boolean {
    return Boolean(this.shellProcess);
  }

  public isShellReady(): boolean {
    return Boolean(this.shellProcess && this.isShellPromptReady);
  }

  public isDevServerRunning(projectId?: string): boolean {
    if (projectId) {
      return (
        this.activeProjectId === projectId &&
        Boolean(this.state.serverUrl || this.isDevServerActive)
      );
    }
    return Boolean(this.activeProjectId && (this.state.serverUrl || this.isDevServerActive));
  }

  public isDevServerStarting(): boolean {
    return Boolean(this.state.startupStage === 'starting_server' || this.isDevServerStartingState);
  }

  public setDevServerStarting(starting: boolean, epoch?: number, projectId?: string): void {
    this.isDevServerStartingState = starting;
    if (starting) {
      this.devServerStartEpoch = epoch ?? this.sessionEpoch;
      this.devServerStartProjectId = projectId ?? this.activeProjectId;
      this.updateState({ startupStage: 'starting_server' });
    } else {
      this.devServerStartEpoch = null;
      this.devServerStartProjectId = null;
      if (this.state.startupStage === 'starting_server') {
        this.updateState({ startupStage: this.state.serverUrl ? 'ready' : 'idle' });
      }
    }
  }

  public getSessionEpoch(): number {
    return this.sessionEpoch;
  }

  public getSpawnAttempts(): number {
    return this.spawnAttempts;
  }

  public stopDevServer(): void {
    if (this.shellWriter) {
      try {
        this.shellWriter.write('\x03\r');
      } catch {
        // Ignored
      }
    }
    // Keep draining map bounded to at most 10 recent ports
    while (this.drainingPorts.size > 10) {
      const oldestKey = this.drainingPorts.keys().next().value;
      if (oldestKey !== undefined) {
        this.drainingPorts.delete(oldestKey);
        this.pendingDrainingCloses.delete(oldestKey);
      } else {
        break;
      }
    }
    const now = Date.now();
    for (const server of this.state.activeServers) {
      this.drainingPorts.set(server.port, {
        projectId: this.activeProjectId,
        sessionEpoch: this.sessionEpoch,
        drainedAt: now,
      });
      this.pendingDrainingCloses.set(
        server.port,
        (this.pendingDrainingCloses.get(server.port) ?? 0) + 1,
      );
    }
    this.isDevServerActive = false;
    this.isDevServerStartingState = false;
    this.isShellPromptReady = false;
    this.devServerStartEpoch = null;
    this.devServerStartProjectId = null;
    this.updateState({
      serverUrl: null,
      serverPort: null,
      activeServers: [],
      startupStage: 'idle',
    });
  }

  public terminateShell(): void {
    if (this.shellProcess) {
      try {
        this.shellWriter?.releaseLock();
        this.shellProcess.kill();
      } catch {
        // Ignored
      }
      this.shellProcess = null;
      this.shellWriter = null;
    }
    this.shellDataListeners.clear();
    this.shellOutputBuffer = [];
    this.isDevServerActive = false;
    this.isDevServerStartingState = false;
    this.isShellPromptReady = false;
  }

  /**
   * Manually marks a draining port as confirmed quiescent.
   */
  public markPortQuiescent(port: number): void {
    this.drainingPorts.delete(port);
  }

  /**
   * Sets shell prompt readiness state directly (useful in testing or shell coordination).
   */
  public setShellPromptReady(ready: boolean): void {
    this.isShellPromptReady = ready;
  }

  public writeToShell(data: string): boolean {
    if (this.shellWriter) {
      try {
        this.shellWriter.write(data);
        return true;
      } catch (err) {
        console.warn('[WebContainer] Direct shell write failed:', err);
      }
    }
    return false;
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('[WebContainer] Listener error:', err);
      }
    });
  }

  private updateState(patch: Partial<WebContainerState>) {
    this.state = { ...this.state, ...patch };
    this.notify();
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && Boolean(window.crossOriginIsolated);
  }

  public cleanupServerListeners(): void {
    for (const unsub of this.eventUnsubscribers) {
      try {
        unsub();
      } catch (err) {
        console.warn('[WebContainer] Error removing listener:', err);
      }
    }
    this.eventUnsubscribers = [];
  }

  private setupServerListeners(container: WebContainer) {
    if (this.serverListenersAttached.has(container)) return;
    this.serverListenersAttached.add(container);

    this.cleanupServerListeners();

    // 1. server-ready: internal web server is listening and ready to answer requests
    const unsubServerReady = container.on('server-ready', (port, url) => {
      if (!this.activeProjectId) {
        console.warn(`[WebContainer] Discarded late server-ready at port ${port} (no active project attached)`);
        return;
      }

      // Guard: is a dev server starting or active in the current session epoch?
      const isExpected =
        this.isDevServerStartingState ||
        this.isDevServerActive ||
        this.state.startupStage === 'starting_server';

      if (!isExpected) {
        console.warn(
          `[WebContainer] Discarded unsolicited/late server-ready at port ${port} (no dev server starting or active for project "${this.activeProjectId}")`,
        );
        return;
      }

      // Check if this port is a draining port from a prior session/project
      const draining = this.drainingPorts.get(port);
      if (draining) {
        const isFromPriorSession =
          draining.sessionEpoch !== this.sessionEpoch || draining.projectId !== this.activeProjectId;

        if (isFromPriorSession) {
          if (!this.isShellPromptReady) {
            console.warn(
              `[WebContainer] Discarded late server-ready at port ${port} (draining server from project ${draining.projectId}, epoch ${draining.sessionEpoch})`,
            );
            return;
          }

          console.log(
            `[WebContainer] Draining port ${port} reclaimed for project "${this.activeProjectId}" (shell quiescence confirmed)`,
          );
          this.drainingPorts.delete(port);
        }
      }

      console.log(`[WebContainer] Server ready for project "${this.activeProjectId}" at port ${port}: ${url}`);
      this.isDevServerActive = true;
      this.isDevServerStartingState = false;
      this.drainingPorts.delete(port);

      const newServer: WebContainerServerInfo = {
        port,
        url,
        projectId: this.activeProjectId,
        sessionEpoch: this.sessionEpoch,
      };
      const updatedServers = [
        ...this.state.activeServers.filter((s) => s.port !== port),
        newServer,
      ];
      this.updateState({
        serverUrl: url,
        serverPort: port,
        activeServers: updatedServers,
        startupStage: 'ready',
        previewStatus: 'loading',
        error: null,
        runtimeError: null,
      });
      webcontainerPerf.recordTiming('server_ready', 0, { port, url, projectId: this.activeProjectId });
    });

    // 2. port: emitted when a port opens or closes
    const unsubPort = container.on('port', (port, type, url) => {
      console.log(`[WebContainer] Port ${port} ${type}: ${url}`);
      if (type === 'open') {
        if (!this.activeProjectId) return;
        if (this.drainingPorts.has(port)) {
          const draining = this.drainingPorts.get(port)!;
          if (draining.sessionEpoch !== this.sessionEpoch || draining.projectId !== this.activeProjectId) {
            if (!this.isShellPromptReady) {
              return;
            }
            this.drainingPorts.delete(port);
          }
        }
        const newServer: WebContainerServerInfo = {
          port,
          url,
          projectId: this.activeProjectId,
          sessionEpoch: this.sessionEpoch,
        };
        const updated = [
          ...this.state.activeServers.filter((s) => s.port !== port),
          newServer,
        ];
        this.updateState({
          activeServers: updated,
          ...(this.state.serverUrl
            ? {}
            : { serverUrl: url, serverPort: port, startupStage: 'ready', previewStatus: 'loading' }),
        });
      } else if (type === 'close') {
        // If this port has pending draining closes from a prior session, consume it
        const pendingCount = this.pendingDrainingCloses.get(port) ?? 0;
        if (pendingCount > 0) {
          if (pendingCount === 1) {
            this.pendingDrainingCloses.delete(port);
          } else {
            this.pendingDrainingCloses.set(port, pendingCount - 1);
          }
          this.drainingPorts.delete(port);
          console.log(`[WebContainer] Draining port ${port} closed cleanly (consumed pending close)`);
          return;
        }

        if (this.drainingPorts.has(port)) {
          this.drainingPorts.delete(port);
          console.log(`[WebContainer] Draining port ${port} closed cleanly`);
          const updated = this.state.activeServers.filter((s) => s.port !== port);
          if (updated.length !== this.state.activeServers.length) {
            this.updateState({ activeServers: updated });
          }
          return;
        }

        const closingServer = this.state.activeServers.find((s) => s.port === port);
        // If closing port belonged to a different project or epoch, ignore
        if (closingServer && closingServer.projectId && closingServer.projectId !== this.activeProjectId) {
          return;
        }

        const updated = this.state.activeServers.filter((s) => s.port !== port);
        const wasActive = this.state.serverPort === port;
        const nextServer = updated[updated.length - 1] ?? null;
        if (wasActive) {
          this.isDevServerActive = Boolean(nextServer);
          this.updateState({
            serverPort: nextServer ? nextServer.port : null,
            serverUrl: nextServer ? nextServer.url : null,
            activeServers: updated,
            startupStage: nextServer ? 'ready' : 'idle',
            previewStatus: nextServer ? 'loading' : 'idle',
          });
        } else {
          this.updateState({ activeServers: updated });
        }
      }
    });

    // 3. error: runtime error
    const unsubError = container.on('error', (err) => {
      console.error('[WebContainer] Runtime error:', err);
      this.setStartupStage('error', {
        phase: 'server',
        message: err.message,
        timestamp: Date.now(),
        recoverable: true,
        retryAction: 'restart_server',
      });
    });

    this.eventUnsubscribers.push(unsubServerReady, unsubPort, unsubError);
  }

  /**
   * Boots or recovers the singleton WebContainer instance.
   * Safe to call multiple times concurrently or across Vite HMR cycles.
   */
  public async boot(): Promise<WebContainer> {
    // 1. Check local instance
    if (this.instance) return this.instance;

    // 2. Check globally shared or static WebContainer._instance (e.g. across HMR)
    const existing =
      (WebContainer as unknown as { _instance?: WebContainer })._instance ??
      (globalThis as unknown as { __GBCODER_WEBCONTAINER_INSTANCE__?: WebContainer })
        .__GBCODER_WEBCONTAINER_INSTANCE__;

    if (existing) {
      this.instance = existing;
      (globalThis as unknown as { __GBCODER_WEBCONTAINER_INSTANCE__?: WebContainer })
        .__GBCODER_WEBCONTAINER_INSTANCE__ = existing;
      this.setupServerListeners(existing);
      this.updateState({ status: 'ready', error: null, runtimeError: null });
      return existing;
    }

    // 3. Check ongoing boot promise locally or on globalThis
    if (this.bootPromise) return this.bootPromise;
    const globalPromise = (globalThis as unknown as {
      __GBCODER_WEBCONTAINER_BOOT_PROMISE__?: Promise<WebContainer> | null;
    }).__GBCODER_WEBCONTAINER_BOOT_PROMISE__;
    if (globalPromise) {
      this.bootPromise = globalPromise;
      return globalPromise;
    }

    if (!this.isSupported()) {
      const msg = 'Cross-Origin Isolation is not active. WebContainer requires COOP/COEP headers.';
      this.setStartupStage('error', {
        phase: 'boot',
        message: msg,
        timestamp: Date.now(),
        recoverable: false,
      });
      this.updateState({ status: 'unsupported' });
      throw new Error(msg);
    }

    this.updateState({ status: 'booting', startupStage: 'booting', error: null, runtimeError: null });

    const doBoot = async () => {
      try {
        const container = await WebContainer.boot();
        this.instance = container;
        (globalThis as unknown as { __GBCODER_WEBCONTAINER_INSTANCE__?: WebContainer })
          .__GBCODER_WEBCONTAINER_INSTANCE__ = container;
        this.setupServerListeners(container);
        this.updateState({ status: 'ready', error: null, runtimeError: null });
        return container;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        // Seamlessly recover if another caller or hot-reload already booted WebContainer
        if (message.includes('Only a single WebContainer instance can be booted')) {
          const recovered =
            (WebContainer as unknown as { _instance?: WebContainer })._instance ??
            (globalThis as unknown as { __GBCODER_WEBCONTAINER_INSTANCE__?: WebContainer })
              .__GBCODER_WEBCONTAINER_INSTANCE__;
          if (recovered) {
            this.instance = recovered;
            (globalThis as unknown as { __GBCODER_WEBCONTAINER_INSTANCE__?: WebContainer })
              .__GBCODER_WEBCONTAINER_INSTANCE__ = recovered;
            this.setupServerListeners(recovered);
            this.updateState({ status: 'ready', error: null, runtimeError: null });
            return recovered;
          }
        }

        console.error('[WebContainer] Failed to boot:', err);
        this.setStartupStage('error', {
          phase: 'boot',
          message: `Failed to boot WebContainer: ${message}`,
          timestamp: Date.now(),
          recoverable: true,
          retryAction: 'reboot_container',
        });
        this.bootPromise = null;
        (globalThis as unknown as {
          __GBCODER_WEBCONTAINER_BOOT_PROMISE__?: Promise<WebContainer> | null;
        }).__GBCODER_WEBCONTAINER_BOOT_PROMISE__ = null;
        throw err;
      }
    };

    this.bootPromise = doBoot();
    (globalThis as unknown as {
      __GBCODER_WEBCONTAINER_BOOT_PROMISE__?: Promise<WebContainer> | null;
    }).__GBCODER_WEBCONTAINER_BOOT_PROMISE__ = this.bootPromise;

    return this.bootPromise;
  }

  /**
   * Mounts all project files into the WebContainer virtual file system.
   */
  public async mountProject(
    files: ProjectFile[],
    dependencies?: Record<string, string>,
    projectType?: ProjectType,
  ): Promise<void> {
    if (!files || files.length === 0) return;

    // Chain onto current mount operation so concurrent mount calls are strictly serialized
    const previousMount = this.mountQueue;
    let releaseMountLock: () => void = () => {};
    this.mountQueue = new Promise<void>((resolve) => {
      releaseMountLock = resolve;
    });

    try {
      await previousMount.catch(() => {});

      this.updateState({ startupStage: 'mounting_files' });

      // Barrier: ensure any in-flight writes have settled before mounting files
      const settled = await this.fileSyncCoordinator.barrier();
      if (!settled) {
        const errMsg = 'WebContainer filesystem barrier timeout: previous writes failed to settle';
        console.error(`[WebContainer] ${errMsg}`);
        this.setStartupStage('error', {
          phase: 'mount',
          message: errMsg,
          timestamp: Date.now(),
          recoverable: true,
          retryAction: 'reboot_container',
        });
        throw new Error(errMsg);
      }

      const endSerialization = webcontainerPerf.startTimer('project_serialization');
      const tree = filesToFileSystemTree(files, dependencies, projectType);
      endSerialization({ fileCount: files.length });

      const endMount = webcontainerPerf.startTimer('filesystem_mount');
      const container = await this.boot();
      await container.mount(tree);
      try {
        await container.fs.writeFile('.npmrc', OPTIMIZED_NPMRC);
      } catch {
        // ignore
      }
      endMount();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.setStartupStage('error', {
        phase: 'mount',
        message: `Failed to mount project files: ${msg}`,
        timestamp: Date.now(),
        recoverable: true,
        retryAction: 'reboot_container',
      });
      throw err;
    } finally {
      releaseMountLock();
    }
  }

  /**
   * Retrieves the current installed manifest fingerprint, if any.
   */
  public getInstalledFingerprint(): string | null {
    return this.installedManifestFingerprint;
  }

  /**
   * Checks whether the node_modules directory exists and is populated in the container virtual filesystem.
   */
  public async isDependenciesInstalled(): Promise<boolean> {
    if (!this.instance) return false;
    try {
      const entries = await this.instance.fs.readdir('node_modules');
      return Array.isArray(entries) && entries.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Whether the project's own files declare root npm metadata.
   *
   * Automatic install/dev-server dispatch is gated on this: a project without
   * its own root package.json stays idle (no invented manifest, no npm work), while
   * explicit manual terminal commands keep working against the booted shell.
   * Nested package.json (e.g. in packages/app/package.json) does NOT trigger root auto-start.
   */
  public hasNpmManifest(files: ProjectFile[]): boolean {
    return files.some((f) =>
      (f.path || '').replace(/^\/+/, '').toLowerCase() === 'package.json',
    );
  }

  /**
   * Whether the project declares any nested npm manifests (e.g. in a monorepo).
   */
  public hasNestedNpmManifest(files: ProjectFile[]): boolean {
    return files.some((f) => {
      const clean = (f.path || '').replace(/^\/+/, '').toLowerCase();
      return clean !== 'package.json' && clean.endsWith('/package.json');
    });
  }

  /**
   * Verifies if dependency installation is needed based on container runtime state and manifest fingerprint.
   * Prevents redundant `npm install` cycles when reopening the same project with unchanged dependencies.
   */
  public async needsDependencyInstall(
    files: ProjectFile[],
    extraDependencies?: Record<string, string>,
    projectType?: ProjectType,
  ): Promise<{ needsInstall: boolean; reason: string; fingerprint: string }> {
    const endTimer = webcontainerPerf.startTimer('manifest_detection');
    const fingerprint = computeDependencyFingerprint(files, extraDependencies, projectType);

    if (!this.instance) {
      endTimer({ needsInstall: true, reason: 'unbooted' });
      return {
        needsInstall: true,
        reason: 'WebContainer instance is not yet booted',
        fingerprint,
      };
    }

    // Check actual runtime presence of node_modules in virtual filesystem
    const hasNodeModules = await this.isDependenciesInstalled();
    if (!hasNodeModules) {
      endTimer({ needsInstall: true, reason: 'missing_node_modules' });
      return {
        needsInstall: true,
        reason: 'node_modules directory is missing in container virtual filesystem',
        fingerprint,
      };
    }

    // If node_modules exists, check if the installed manifest matches current project
    if (this.installedManifestFingerprint !== fingerprint) {
      endTimer({ needsInstall: true, reason: 'fingerprint_mismatch' });
      return {
        needsInstall: true,
        reason: 'Project dependencies or lockfile have changed',
        fingerprint,
      };
    }

    endTimer({ needsInstall: false, reason: 'cached_and_verified' });
    return {
      needsInstall: false,
      reason: 'Dependencies already installed and verified in active container',
      fingerprint,
    };
  }

  /**
   * Records that installation completed successfully for a given fingerprint.
   */
  public recordInstallComplete(fingerprint: string): void {
    this.installedManifestFingerprint = fingerprint;
  }

  /**
   * Invalidates the dependency cache fingerprint (e.g. on container reset or file deletion).
   */
  public invalidateDependencyCache(): void {
    this.installedManifestFingerprint = null;
  }

  /**
   * Reads package.json content directly from the WebContainer virtual filesystem.
   */
  public async readPackageJson(): Promise<string | null> {
    if (!this.instance) return null;
    try {
      return await this.instance.fs.readFile('package.json', 'utf-8');
    } catch {
      return null;
    }
  }

  /**
   * Computes deterministic dependency fingerprint from manifest and lockfiles.
   */
  public computeDependencyFingerprint(
    files: ProjectFile[],
    extraDependencies?: Record<string, string>,
    projectType?: ProjectType,
  ): string {
    return computeDependencyFingerprint(files, extraDependencies, projectType);
  }

  /**
   * Writes a single file to the WebContainer filesystem.
   * Debounced (200ms) and serialized through FileSyncCoordinator to eliminate write races.
   */
  public async syncFile(path: string, content: string, projectId?: string): Promise<void> {
    this.fileSyncCoordinator.queueSync(path, content, projectId ?? this.activeProjectId);
  }

  /**
   * Flushes all pending debounced writes immediately.
   * Used prior to navigation, project switching, or backups.
   */
  public async flushFileSync(): Promise<void> {
    await this.fileSyncCoordinator.flush();
  }

  /**
   * Waits for any currently in-flight writes to settle to virtual disk.
   */
  public async barrierFileSync(timeoutMs?: number): Promise<boolean> {
    return this.fileSyncCoordinator.barrier(timeoutMs);
  }

  /**
   * Removes a file from the WebContainer filesystem, cancelling any pending debounced writes for it.
   */
  public async deleteFile(path: string): Promise<void> {
    await this.fileSyncCoordinator.handleDelete(path);
  }

  /**
   * Coordinates file rename in virtual filesystem, migrating any pending writes to newPath.
   */
  public renameFile(oldPath: string, newPath: string): void {
    this.fileSyncCoordinator.handleRename(oldPath, newPath);
  }

  /**
   * Cancels pending file syncs for a specific path or all paths.
   */
  public cancelPendingSync(path?: string): void {
    if (path) {
      this.fileSyncCoordinator.cancelPath(path);
    } else {
      this.fileSyncCoordinator.cancelAll();
    }
  }

  /**
   * Spawns an interactive shell process (jsh) and hooks its I/O to callbacks.
   * If a healthy shell is already active and forceRestart is false, reconnects
   * the caller and replays recent buffer without destroying the process or killing Vite.
   */
  public async spawnInteractiveShell(options: {
    cols: number;
    rows: number;
    onData: (data: string) => void;
    forceRestart?: boolean;
  }): Promise<{
    write: (data: string) => void;
    resize: (cols: number, rows: number) => void;
    kill: () => void;
    disconnect: () => void;
  }> {
    // 1. If not forcing a restart, check if an existing shell is active and healthy
    if (!options.forceRestart && this.shellProcess && this.shellWriter) {
      this.shellDataListeners.add(options.onData);

      // Replay recent terminal buffer so the connecting terminal gets immediate output context
      for (const chunk of this.shellOutputBuffer) {
        try {
          options.onData(chunk);
        } catch {
          // Ignored
        }
      }

      try {
        this.shellProcess.resize({ cols: options.cols, rows: options.rows });
      } catch {
        // Ignored
      }

      const writer = this.shellWriter;
      const process = this.shellProcess;

      return {
        write: (data: string) => {
          try {
            writer.write(data);
          } catch (err) {
            console.error('[WebContainer] Failed to write to shell:', err);
          }
        },
        resize: (cols: number, rows: number) => {
          try {
            process.resize({ cols, rows });
          } catch (err) {
            console.error('[WebContainer] Failed to resize shell:', err);
          }
        },
        kill: () => {
          this.terminateShell();
        },
        disconnect: () => {
          this.shellDataListeners.delete(options.onData);
        },
      };
    }

    // 2. If a spawn is currently in progress, await it
    if (this.shellSpawnPromise) {
      await this.shellSpawnPromise;
      return this.spawnInteractiveShell(options);
    }

    // 3. Otherwise, spawn a new shell session
    this.spawnAttempts++;
    const endSpawnTimer = webcontainerPerf.startTimer('shell_spawn');

    this.shellSpawnPromise = (async () => {
      const container = await this.boot();

      // Clean up previous shell if any
      this.terminateShell();

      const process = await container.spawn('jsh', {
        terminal: {
          cols: options.cols,
          rows: options.rows,
        },
      });

      this.shellProcess = process;
      const writer = process.input.getWriter();
      this.shellWriter = writer;
      this.shellDataListeners.clear();
      this.shellOutputBuffer = [];
      this.shellDataListeners.add(options.onData);

      endSpawnTimer({ attempt: this.spawnAttempts });
      this.isShellPromptReady = false;

      // Pipe output to buffer and all active listeners
      process.output
        .pipeTo(
          new WritableStream({
            write: (chunk: string) => {
              this.shellOutputBuffer.push(chunk);
              if (this.shellOutputBuffer.length > 500) {
                this.shellOutputBuffer.shift();
              }
              this.shellDataListeners.forEach((listener) => {
                try {
                  listener(chunk);
                } catch {
                  // Ignored
                }
              });

              // Detect interactive shell prompt readiness (❯ prompt in jsh)
              if (chunk.includes('❯') || /[$#❯]\s*$/.test(chunk)) {
                this.isShellPromptReady = true;
              }

              // Detect package install completion
              if (
                (chunk.includes('added ') && chunk.includes('package')) ||
                chunk.includes('up to date')
              ) {
                if (this.state.startupStage === 'installing') {
                  this.updateState({ startupStage: 'starting_server' });
                }
              }

              // Detect dev server readiness
              if (
                chunk.includes('ready in') ||
                chunk.includes('VITE') ||
                chunk.includes('Local:   http://') ||
                chunk.includes('Network: http://')
              ) {
                this.isDevServerActive = true;
                this.isDevServerStartingState = false;
                if (this.state.serverUrl) {
                  this.updateState({ startupStage: 'ready' });
                }
              }

              // Detect fatal install or server errors
              const isInstallErr =
                chunk.includes('npm ERR!') ||
                chunk.includes('npm error:') ||
                chunk.includes('code ERESOLVE') ||
                chunk.includes('code ENOENT');

              const isServerErr =
                chunk.includes('EADDRINUSE') ||
                chunk.includes('address already in use') ||
                chunk.includes('failed to load config') ||
                (chunk.includes('Error: Cannot find module') &&
                  (this.state.startupStage === 'starting_server' || this.isDevServerStartingState));

              if (isInstallErr && this.state.startupStage === 'installing') {
                this.isDevServerStartingState = false;
                this.setStartupStage('error', {
                  phase: 'install',
                  message: 'npm install failed. Check terminal output for details.',
                  timestamp: Date.now(),
                  recoverable: true,
                  retryAction: 'retry_install',
                });
              } else if (
                isServerErr &&
                (this.state.startupStage === 'starting_server' || this.isDevServerStartingState)
              ) {
                this.isDevServerStartingState = false;
                this.setStartupStage('error', {
                  phase: 'server',
                  message: 'Development server startup failed. Check terminal output for details.',
                  timestamp: Date.now(),
                  recoverable: true,
                  retryAction: 'restart_server',
                });
              }
            },
          }),
        )
        .catch((err) => {
          console.warn('[WebContainer] Shell output stream closed:', err);
        });

      // Handle process exit
      void process.exit.then((exitCode) => {
        console.log(`[WebContainer] Shell process exited with code ${exitCode}`);
        this.shellProcess = null;
        this.shellWriter = null;
        this.isDevServerActive = false;
        this.isDevServerStartingState = false;
        this.isShellPromptReady = false;
        if (exitCode !== 0 && this.state.startupStage !== 'idle') {
          this.setStartupStage('error', {
            phase: 'general',
            message: `Shell process exited with code ${exitCode}`,
            timestamp: Date.now(),
            recoverable: true,
            retryAction: 'restart_server',
          });
        } else {
          this.updateState({
            status: 'ready',
            startupStage: 'idle',
            previewStatus: 'idle',
            serverUrl: null,
            serverPort: null,
            activeServers: [],
          });
        }
      });

      this.updateState({ status: 'running' });

      return {
        write: (data: string) => {
          try {
            writer.write(data);
          } catch (err) {
            console.error('[WebContainer] Failed to write to shell:', err);
          }
        },
        resize: (cols: number, rows: number) => {
          try {
            process.resize({ cols, rows });
          } catch (err) {
            console.error('[WebContainer] Failed to resize shell:', err);
          }
        },
        kill: () => {
          this.terminateShell();
        },
        disconnect: () => {
          this.shellDataListeners.delete(options.onData);
        },
      };
    })();

    try {
      return await this.shellSpawnPromise;
    } finally {
      this.shellSpawnPromise = null;
    }
  }

  /**
   * Runs a one-off command inside the container and waits for exit code.
   */
  public async runCommand(
    command: string,
    args: string[] = [],
    onOutput?: (chunk: string) => void,
  ): Promise<{ exitCode: number }> {
    const container = await this.boot();
    const process = await container.spawn(command, args);

    if (onOutput) {
      process.output.pipeTo(
        new WritableStream({
          write(chunk) {
            onOutput(chunk);
          },
        }),
      ).catch(() => {});
    }

    const exitCode = await process.exit;
    return { exitCode };
  }
}

export const webcontainerService = new WebContainerManager();

export const subscribeWebContainer = (onChange: () => void) =>
  webcontainerService.subscribe(onChange);

export const getWebContainerSnapshot = () => webcontainerService.getState();
