import { WebContainer, IFSWatcher } from '@webcontainer/api';

export interface WebContainerWatcherCallbacks {
  onFileCreate: (path: string, content: string) => void;
  onFileChange: (path: string, content: string) => void;
  onFileDelete: (path: string) => void;
  isEditorDirty?: (path: string) => boolean;
}

/**
 * Patterns to ignore from WebContainer filesystem watcher.
 * Avoids circular sync, heavy dependency loops, and temporary buffers.
 */
const IGNORED_PATH_PREFIXES = [
  'node_modules/',
  '.git/',
  '.vite/',
  'dist/',
  '.cache/',
];

const IGNORED_EXACT_FILES = [
  'node_modules',
  '.git',
  '.npmrc',
  '.help.js',
  '.DS_Store',
  'Thumbs.db',
];

export class WebContainerWatcher {
  private watcher: IFSWatcher | null = null;
  private container: WebContainer | null = null;
  private callbacks: WebContainerWatcherCallbacks | null = null;
  private pendingChanges = new Map<string, 'change' | 'delete'>();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private internallySyncedPaths = new Map<string, number>();
  private isDisposed = false;

  public start(container: WebContainer, callbacks: WebContainerWatcherCallbacks): void {
    this.stop();
    this.container = container;
    this.callbacks = callbacks;
    this.isDisposed = false;

    try {
      this.watcher = container.fs.watch('.', { recursive: true }, (event, filename) => {
        if (this.isDisposed || !filename) return;
        const normalized = (typeof filename === 'string' ? filename : new TextDecoder().decode(filename))
          .replace(/\\/g, '/')
          .replace(/^\/+/, '');

        this.handleRawFSEvent(event, normalized);
      });
    } catch (err) {
      console.warn('[WebContainerWatcher] Failed to start native fs.watch:', err);
    }
  }

  public stop(): void {
    this.isDisposed = true;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.pendingChanges.clear();
    if (this.watcher) {
      try {
        this.watcher.close();
      } catch {
        // Ignored
      }
      this.watcher = null;
    }
    this.container = null;
    this.callbacks = null;
  }

  /**
   * Registers a path that was written by the IDE (Monaco or FileExplorer)
   * so that the watcher ignores the immediate file-system echo event.
   */
  public markInternallySynced(path: string): void {
    const clean = path.replace(/\\/g, '/').replace(/^\/+/, '');
    this.internallySyncedPaths.set(clean, Date.now() + 1500);
  }

  public isPathInternallySynced(path: string): boolean {
    const clean = path.replace(/\\/g, '/').replace(/^\/+/, '');
    const expiry = this.internallySyncedPaths.get(clean);
    return Boolean(expiry && Date.now() < expiry);
  }

  private isIgnored(path: string): boolean {
    if (!path) return true;
    if (IGNORED_EXACT_FILES.includes(path)) return true;
    for (const prefix of IGNORED_PATH_PREFIXES) {
      if (path.startsWith(prefix) || path.includes(`/${prefix}`)) return true;
    }
    // Ignore vim/emacs swap and backup files
    if (path.endsWith('~') || path.endsWith('.swp') || path.endsWith('.tmp')) return true;
    return false;
  }

  private handleRawFSEvent(event: 'rename' | 'change', path: string): void {
    if (this.isIgnored(path)) return;

    // Check if this path was recently synced by the IDE itself
    const expiry = this.internallySyncedPaths.get(path);
    if (expiry) {
      if (Date.now() < expiry) {
        return; // Suppress echo from IDE-to-WebContainer write
      }
      this.internallySyncedPaths.delete(path);
    }

    this.pendingChanges.set(path, event === 'rename' ? 'change' : 'change');

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      void this.flushPendingChanges();
    }, 250);
  }

  private async flushPendingChanges(): Promise<void> {
    if (this.isDisposed || !this.container || !this.callbacks) {
      this.pendingChanges.clear();
      return;
    }

    const container = this.container;
    const callbacks = this.callbacks;
    const entries = Array.from(this.pendingChanges.entries());
    this.pendingChanges.clear();

    for (const [path] of entries) {
      try {
        // Test if file exists by attempting to read it
        let content: string | null = null;
        try {
          content = await container.fs.readFile(path, 'utf-8');
        } catch {
          // File does not exist or was deleted/renamed
          content = null;
        }

        if (content !== null) {
          // File exists or was created/modified
          // Safety guard: If Monaco has unsaved dirty changes in this buffer, do not clobber!
          if (callbacks.isEditorDirty?.(path)) {
            console.warn(`[WebContainerWatcher] Skipped auto-sync for dirty Monaco buffer: ${path}`);
            continue;
          }

          // Register as internally synced to prevent loopback
          this.internallySyncedPaths.set(path, Date.now() + 1000);
          callbacks.onFileChange(path, content);
        } else {
          // File was removed
          if (callbacks.isEditorDirty?.(path)) {
            console.warn(`[WebContainerWatcher] Skipped delete for dirty Monaco buffer: ${path}`);
            continue;
          }
          callbacks.onFileDelete(path);
        }
      } catch (err) {
        console.warn(`[WebContainerWatcher] Error reconciling ${path}:`, err);
      }
    }
  }
}

export const webcontainerWatcher = new WebContainerWatcher();
