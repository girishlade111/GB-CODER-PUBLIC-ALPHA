/**
 * Automatic Type Acquisition (ATA) Service for Monaco Editor.
 *
 * Implements StackBlitz/VS Code style automatic TypeScript type acquisition
 * directly in the browser using @typescript/ata.
 *
 * Automatically inspects imports (e.g. `import React from 'react'`, `import axios from 'axios'`),
 * fetches the corresponding `.d.ts` definitions from CDN, and injects them into
 * Monaco's language service. This provides real IntelliSense, auto-completion,
 * parameter hints, and type diagnostics.
 *
 * Dynamically loaded so TypeScript stays out of the initial bundle.
 */

import type { Monaco } from '@monaco-editor/react';

export type AtaStatus = 'uninitialized' | 'idle' | 'resolving' | 'ready' | 'error';

export interface AtaState {
  status: AtaStatus;
  progress: {
    downloaded: number;
    total: number;
  };
  acquiredCount: number;
  acquiredPackages: string[];
  lastResolvedPackage: string | null;
  error: string | null;
}

type AtaInstance = (code: string) => void;

class AtaManager {
  private monaco: Monaco | null = null;
  private ataInstance: AtaInstance | null = null;
  private initPromise: Promise<void> | null = null;
  private acquiredFiles = new Set<string>();
  private acquiredPackagesSet = new Set<string>();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  private state: AtaState = {
    status: 'uninitialized',
    progress: { downloaded: 0, total: 0 },
    acquiredCount: 0,
    acquiredPackages: [],
    lastResolvedPackage: null,
    error: null,
  };

  private listeners = new Set<() => void>();

  public getState(): AtaState {
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
        console.error('[ATA] Listener error:', err);
      }
    });
  }

  private updateState(patch: Partial<AtaState>) {
    this.state = { ...this.state, ...patch };
    this.notify();
  }

  /**
   * Initializes ATA with the provided Monaco instance.
   * Lazily loads TypeScript compiler and @typescript/ata.
   */
  public async init(monaco: Monaco): Promise<void> {
    this.monaco = monaco;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        // Configure Monaco TypeScript & JavaScript compiler options
        const tsDefaults = monaco.languages.typescript.typescriptDefaults;
        const jsDefaults = monaco.languages.typescript.javascriptDefaults;

        const compilerOptions = {
          target: monaco.languages.typescript.ScriptTarget.ESNext,
          allowNonTextExtensions: true,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.CommonJS,
          noEmit: true,
          esModuleInterop: true,
          jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
          reactNamespace: 'React',
          allowJs: true,
          typeRoots: ['node_modules/@types'],
        };

        tsDefaults.setCompilerOptions(compilerOptions);
        jsDefaults.setCompilerOptions(compilerOptions);

        tsDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        });

        jsDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        });

        // Lazily import typescript and @typescript/ata
        const [tsModule, ataModule] = await Promise.all([
          import('typescript'),
          import('@typescript/ata'),
        ]);

        const ts = tsModule.default || tsModule;
        const { setupTypeAcquisition } = ataModule;

        this.ataInstance = setupTypeAcquisition({
          projectName: 'gb-coder-workspace',
          typescript: ts,
          logger: {
            log: () => {},
            error: console.error,
            groupCollapsed: () => {},
            groupEnd: () => {},
          },
          delegate: {
            receivedFile: (code: string, path: string) => {
              if (this.acquiredFiles.has(path)) return;
              this.acquiredFiles.add(path);

              // Extract package name from path
              const match = path.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/);
              if (match) {
                this.acquiredPackagesSet.add(match[1]);
                this.updateState({
                  lastResolvedPackage: match[1],
                  acquiredPackages: Array.from(this.acquiredPackagesSet),
                });
              }

              const normalizedPath = path.startsWith('file://') ? path : `file://${path}`;

              try {
                tsDefaults.addExtraLib(code, normalizedPath);
                jsDefaults.addExtraLib(code, normalizedPath);
              } catch (e) {
                console.warn(`[ATA] Failed to add extra lib for ${path}:`, e);
              }

              this.updateState({
                acquiredCount: this.acquiredFiles.size,
              });
            },
            started: () => {
              this.updateState({ status: 'resolving', error: null });
            },
            progress: (downloaded: number, total: number) => {
              this.updateState({
                status: 'resolving',
                progress: { downloaded, total },
              });
            },
            finished: () => {
              this.updateState({
                status: 'ready',
                progress: { downloaded: 0, total: 0 },
              });
            },
          },
        });

        this.updateState({ status: 'idle' });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[ATA] Failed to initialize ATA:', err);
        this.updateState({ status: 'error', error: message });
      }
    })();

    return this.initPromise;
  }

  /**
   * Triggers type acquisition for a code snippet.
   * Debounced to avoid flooding CDN requests during rapid typing.
   */
  public acquireTypes(code: string, debounceMs: number = 400): void {
    if (!this.ataInstance) {
      if (this.monaco && !this.initPromise) {
        void this.init(this.monaco).then(() => {
          this.ataInstance?.(code);
        });
      }
      return;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      try {
        this.ataInstance?.(code);
      } catch (err) {
        console.warn('[ATA] Error acquiring types:', err);
      }
    }, debounceMs);
  }

  /**
   * Inspects all project files and acquires types for all detected dependencies.
   */
  public acquireTypesForProject(files: { path: string; content: string }[]): void {
    const codeFragments = files
      .filter((f) => /\.(ts|tsx|js|jsx|json)$/i.test(f.path))
      .map((f) => f.content)
      .join('\n\n');

    if (codeFragments.trim().length > 0) {
      this.acquireTypes(codeFragments, 100);
    }
  }
}

export const ataService = new AtaManager();
