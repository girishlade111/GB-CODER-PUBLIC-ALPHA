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

export type WebContainerStatus =
  | 'unsupported'
  | 'idle'
  | 'booting'
  | 'ready'
  | 'running'
  | 'error';

export interface WebContainerServerInfo {
  port: number;
  url: string;
}

export interface WebContainerState {
  status: WebContainerStatus;
  isSupported: boolean;
  serverUrl: string | null;
  serverPort: number | null;
  activeServers: WebContainerServerInfo[];
  error: string | null;
}

/** Converts a flat array of ProjectFile objects into a nested WebContainer FileSystemTree */
export function filesToFileSystemTree(
  files: ProjectFile[],
  extraDependencies?: Record<string, string>,
  projectType?: ProjectType,
): FileSystemTree {
  const root: FileSystemTree = {};
  let hasPackageJson = false;

  for (const file of files) {
    if (!file.path) continue;
    const cleanPath = file.path.replace(/^\/+/, '');
    if (/(^|\/)package\.json$/i.test(cleanPath)) {
      hasPackageJson = true;
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

  // Ensure root package.json is present so `npm install` and Node commands always succeed
  if (!hasPackageJson) {
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
            },
            dependencies: baseDeps,
            devDependencies: baseDevDeps,
          },
          null,
          2,
        ),
      },
    };
  } else if (extraDependencies && Object.keys(extraDependencies).length > 0) {
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

  // Always ensure .npmrc exists with legacy-peer-deps=true to prevent ERESOLVE failures
  if (!root['.npmrc']) {
    root['.npmrc'] = {
      file: {
        contents: 'legacy-peer-deps=true\n',
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

  private state: WebContainerState = {
    status: typeof window !== 'undefined' && window.crossOriginIsolated ? 'idle' : 'unsupported',
    isSupported: typeof window !== 'undefined' ? Boolean(window.crossOriginIsolated) : false,
    serverUrl: null,
    serverPort: null,
    activeServers: [],
    error: null,
  };

  private listeners = new Set<() => void>();

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

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
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

  private setupServerListeners(container: WebContainer) {
    if (this.serverListenersAttached.has(container)) return;
    this.serverListenersAttached.add(container);

    // Listen for internal web server bindings (e.g. Vite, Next, Express)
    container.on('server-ready', (port, url) => {
      console.log(`[WebContainer] Server ready at port ${port}: ${url}`);
      const newServer: WebContainerServerInfo = { port, url };
      const updatedServers = [
        ...this.state.activeServers.filter((s) => s.port !== port),
        newServer,
      ];
      this.updateState({
        serverUrl: url,
        serverPort: port,
        activeServers: updatedServers,
      });
    });

    container.on('error', (err) => {
      console.error('[WebContainer] Runtime error:', err);
      this.updateState({ error: err.message });
    });
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
      this.updateState({ status: 'ready', error: null });
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
      this.updateState({ status: 'unsupported', error: msg });
      throw new Error(msg);
    }

    this.updateState({ status: 'booting', error: null });

    const doBoot = async () => {
      try {
        const container = await WebContainer.boot();
        this.instance = container;
        (globalThis as unknown as { __GBCODER_WEBCONTAINER_INSTANCE__?: WebContainer })
          .__GBCODER_WEBCONTAINER_INSTANCE__ = container;
        this.setupServerListeners(container);
        this.updateState({ status: 'ready', error: null });
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
            this.updateState({ status: 'ready', error: null });
            return recovered;
          }
        }

        console.error('[WebContainer] Failed to boot:', err);
        this.updateState({ status: 'error', error: message });
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
    const container = await this.boot();
    const tree = filesToFileSystemTree(files, dependencies, projectType);
    await container.mount(tree);
    try {
      await container.fs.writeFile('.npmrc', 'legacy-peer-deps=true\n');
    } catch {
      // ignore
    }
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
   * Writes a single file to the WebContainer filesystem.
   * Creates parent directories recursively if they don't exist.
   */
  public async syncFile(path: string, content: string): Promise<void> {
    if (!this.instance) return;
    try {
      const cleanPath = path.replace(/^\/+/, '');
      const dirIndex = cleanPath.lastIndexOf('/');
      if (dirIndex !== -1) {
        const dir = cleanPath.slice(0, dirIndex);
        await this.instance.fs.mkdir(dir, { recursive: true });
      }
      await this.instance.fs.writeFile(cleanPath, content);
    } catch (err) {
      console.warn(`[WebContainer] Failed to sync file ${path}:`, err);
    }
  }

  /**
   * Removes a file from the WebContainer filesystem.
   */
  public async deleteFile(path: string): Promise<void> {
    if (!this.instance) return;
    try {
      const cleanPath = path.replace(/^\/+/, '');
      await this.instance.fs.rm(cleanPath, { recursive: true });
    } catch (err) {
      console.warn(`[WebContainer] Failed to remove file ${path}:`, err);
    }
  }

  /**
   * Spawns an interactive shell process (jsh) and hooks its I/O to callbacks.
   */
  public async spawnInteractiveShell(options: {
    cols: number;
    rows: number;
    onData: (data: string) => void;
  }): Promise<{
    write: (data: string) => void;
    resize: (cols: number, rows: number) => void;
    kill: () => void;
  }> {
    const container = await this.boot();

    // Kill any existing shell process before spawning a new one
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

    const process = await container.spawn('jsh', {
      terminal: {
        cols: options.cols,
        rows: options.rows,
      },
    });

    this.shellProcess = process;
    const writer = process.input.getWriter();
    this.shellWriter = writer;

    // Stream process output to terminal callback
    process.output.pipeTo(
      new WritableStream({
        write(chunk) {
          options.onData(chunk);
        },
      }),
    ).catch((err) => {
      console.warn('[WebContainer] Shell output stream closed:', err);
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
        try {
          writer.releaseLock();
          process.kill();
        } catch {
          // Ignored
        }
      },
    };
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
