/**
 * Monaco Editor Web Worker Environment Configuration for GB Coder.
 *
 * Configures `globalThis.MonacoEnvironment.getWorker` using Vite's native `?worker`
 * bundling. Each worker is bundled as an isolated, same-origin ES module worker,
 * completely offloading syntax validation, tokenization, and language services from
 * the main browser thread without triggering cross-origin worker script restrictions
 * or COEP / CSP blocking.
 */

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

export interface MonacoWorkerStats {
  editor: number;
  json: number;
  css: number;
  html: number;
  typescript: number;
}

const workerStats: MonacoWorkerStats = {
  editor: 0,
  json: 0,
  css: 0,
  html: 0,
  typescript: 0,
};

export function getMonacoWorkerStats(): Readonly<MonacoWorkerStats> {
  return { ...workerStats };
}

export function setupMonacoEnvironment(): void {
  if (typeof window === 'undefined') return;

  // Prevent duplicate definition if already configured
  const existing = (window as unknown as { MonacoEnvironment?: { getWorker?: unknown } }).MonacoEnvironment;
  if (existing && typeof existing.getWorker === 'function') {
    return;
  }

  (window as unknown as { MonacoEnvironment: { getWorker: (workerId: string, label: string) => Worker } }).MonacoEnvironment = {
    getWorker(_workerId: string, label: string): Worker {
      if (label === 'json') {
        workerStats.json++;
        return new jsonWorker();
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        workerStats.css++;
        return new cssWorker();
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        workerStats.html++;
        return new htmlWorker();
      }
      if (label === 'typescript' || label === 'javascript') {
        workerStats.typescript++;
        return new tsWorker();
      }
      workerStats.editor++;
      return new editorWorker();
    },
  };
}

// Automatically configure when imported in browser environment
setupMonacoEnvironment();
