import { WebContainer, IFSWatcher } from '@webcontainer/api';
import { ExternalFileConflict, editorConflictService } from '../editor/editorConflictService';

export enum PathClassification {
  REGULAR_FILE = 'REGULAR_FILE',
  DIRECTORY = 'DIRECTORY',
  CONFIRMED_FILE_DELETION = 'CONFIRMED_FILE_DELETION',
  CONFIRMED_DIRECTORY_DELETION = 'CONFIRMED_DIRECTORY_DELETION',
  TRANSIENT_ERROR = 'TRANSIENT_ERROR',
  UNKNOWN_STATE = 'UNKNOWN_STATE',
}

export interface WebContainerWatcherCallbacks {
  onFileCreate: (path: string, content: string) => void;
  onFileChange: (path: string, content: string) => void;
  onFileDelete: (path: string) => void;
  onDirectoryCreate?: (path: string) => void;
  onDirectoryDelete?: (path: string) => void;
  onFileConflict?: (conflict: ExternalFileConflict) => void;
  isEditorDirty?: (path: string) => boolean;
  getEditorContent?: (path: string) => string | undefined;
  getKnownFiles?: () => string[];
  projectId?: string;
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
  '.next/',
  'build/',
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
  private internallySyncedContents = new Map<string, string>();
  private currentProjectId: string | null = null;
  private isDisposed = false;

  public start(container: WebContainer, callbacks: WebContainerWatcherCallbacks): void {
    this.stop();
    this.container = container;
    this.callbacks = callbacks;
    this.currentProjectId = callbacks.projectId || null;
    this.isDisposed = false;

    try {
      this.watcher = container.fs.watch('.', { recursive: true }, (event, filename) => {
        if (this.isDisposed || !filename) return;
        const raw = typeof filename === 'string' ? filename : new TextDecoder().decode(filename);
        const normalized = raw
          .replace(/\\/g, '/')
          .replace(/^\/+/, '')
          .replace(/\/\.\//g, '/')
          .replace(/\/+/g, '/');

        this.handleRawFSEvent(event, normalized);
      });
    } catch (err) {
      console.warn('[WebContainerWatcher] Failed to start native fs.watch:', err);
    }
  }

  public stop(): void {
    this.isDisposed = true;
    this.currentProjectId = null;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.pendingChanges.clear();
    this.internallySyncedContents.clear();
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
  public markInternallySynced(path: string, content?: string): void {
    const clean = path.replace(/\\/g, '/').replace(/^\/+/, '');
    if (content !== undefined) {
      this.internallySyncedContents.set(clean, content);
    }
    this.internallySyncedPaths.set(clean, Date.now() + 2500);
  }

  public isPathInternallySynced(path: string): boolean {
    const clean = path.replace(/\\/g, '/').replace(/^\/+/, '');
    const expiry = this.internallySyncedPaths.get(clean);
    return Boolean(expiry && Date.now() < expiry);
  }

  private isIgnored(path: string): boolean {
    if (!path || path === '.' || path.startsWith('../') || path.includes('/../')) return true;
    if (IGNORED_EXACT_FILES.includes(path)) return true;
    for (const prefix of IGNORED_PATH_PREFIXES) {
      if (path.startsWith(prefix) || path.includes(`/${prefix}`)) return true;
    }
    // Ignore vim/emacs swap and backup files
    if (path.endsWith('~') || path.endsWith('.swp') || path.endsWith('.tmp')) return true;
    return false;
  }

  public handleRawFSEvent(event: 'rename' | 'change', path: string): void {
    if (this.isIgnored(path)) return;

    this.pendingChanges.set(path, event === 'rename' ? 'change' : 'change');

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      void this.flushPendingChanges();
    }, 250);
  }

  /**
   * Classifies a filesystem path by examining WebContainer's virtual micro-OS filesystem.
   * Strictly distinguishes regular files, directories, confirmed deletions, and transient errors.
   * EISDIR is NEVER classified as a file deletion!
   */
  public async classifyPath(
    container: WebContainer,
    path: string,
    knownFiles: string[] = [],
  ): Promise<{ classification: PathClassification; content?: string }> {
    const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
    if (!cleanPath || cleanPath === '.' || cleanPath.startsWith('../') || cleanPath.includes('/../')) {
      return { classification: PathClassification.UNKNOWN_STATE };
    }

    // Step 1: Attempt to read as a file
    try {
      const content = await container.fs.readFile(cleanPath, 'utf-8');
      return { classification: PathClassification.REGULAR_FILE, content };
    } catch (err) {
      const code = (err as { code?: string })?.code;
      const message = String((err as { message?: string })?.message || '');

      // Check if path is a directory (EISDIR)
      if (code === 'EISDIR' || message.includes('EISDIR')) {
        try {
          await container.fs.readdir(cleanPath);
          return { classification: PathClassification.DIRECTORY };
        } catch {
          // If directory was removed in a race condition
          return { classification: PathClassification.CONFIRMED_DIRECTORY_DELETION };
        }
      }

      // Check if path does not exist (ENOENT)
      if (code === 'ENOENT' || message.includes('ENOENT')) {
        // Path does not exist as a file. Check if it exists as a directory
        try {
          await container.fs.readdir(cleanPath);
          return { classification: PathClassification.DIRECTORY };
        } catch (dirErr) {
          const dirCode = (dirErr as { code?: string })?.code;
          const dirMsg = String((dirErr as { message?: string })?.message || '');

          if (dirCode === 'ENOENT' || dirMsg.includes('ENOENT') || dirCode === 'ENOTDIR' || dirMsg.includes('ENOTDIR')) {
            // Neither file nor directory exists on disk
            const isExactKnown = knownFiles.includes(cleanPath);
            if (isExactKnown) {
              return { classification: PathClassification.CONFIRMED_FILE_DELETION };
            }
            const isDirectoryPrefix = knownFiles.some((f) => f.startsWith(`${cleanPath}/`));
            if (isDirectoryPrefix) {
              return { classification: PathClassification.CONFIRMED_DIRECTORY_DELETION };
            }
            return { classification: PathClassification.UNKNOWN_STATE };
          }

          // Transient error during readdir
          return { classification: PathClassification.TRANSIENT_ERROR };
        }
      }

      // Any other error (EBUSY, EPERM, EACCES, etc.) is transient / unknown.
      // Must FAIL-SAFE: never assume deletion on transient I/O failure!
      console.warn(`[WebContainerWatcher] Transient read error for ${cleanPath}:`, err);
      return { classification: PathClassification.TRANSIENT_ERROR };
    }
  }

  public async flushPendingChanges(): Promise<void> {
    if (this.isDisposed || !this.container || !this.callbacks) {
      this.pendingChanges.clear();
      return;
    }

    // Guard against stale callbacks if project changed
    if (this.callbacks.projectId && this.currentProjectId && this.callbacks.projectId !== this.currentProjectId) {
      this.pendingChanges.clear();
      return;
    }

    const container = this.container;
    const callbacks = this.callbacks;
    const entries = Array.from(this.pendingChanges.entries());
    this.pendingChanges.clear();

    const knownFiles = callbacks.getKnownFiles ? callbacks.getKnownFiles() : [];
    const currentProjectId = this.currentProjectId || callbacks.projectId || 'default-project';

    for (const [path] of entries) {
      try {
        const { classification, content } = await this.classifyPath(container, path, knownFiles);

        switch (classification) {
          case PathClassification.REGULAR_FILE: {
            if (content === undefined) break;

            // Check if Monaco has unsaved dirty changes in this file
            if (callbacks.isEditorDirty?.(path)) {
              const monacoContent = callbacks.getEditorContent?.(path);
              // If contents are identical, this is an echo or same content; suppress
              if (monacoContent !== undefined && monacoContent === content) {
                break;
              }

              // Genuine conflict: User has unsaved edits in Monaco, and terminal modified the file externally!
              console.warn(`[WebContainerWatcher] Detected external file conflict for dirty buffer: ${path}`);
              const conflict = editorConflictService.registerConflict({
                projectId: currentProjectId,
                path,
                monacoContent: monacoContent ?? '',
                externalContent: content,
              });
              callbacks.onFileConflict?.(conflict);
              break;
            }

            // Normal clean file sync: if editor already holds identical content, skip redundant update
            const currentEditorContent = callbacks.getEditorContent?.(path);
            if (currentEditorContent !== undefined && currentEditorContent === content && knownFiles.includes(path)) {
              break;
            }

            const isNewFile = !knownFiles.includes(path);
            if (isNewFile) {
              callbacks.onFileCreate(path, content);
            } else {
              callbacks.onFileChange(path, content);
            }
            break;
          }

          case PathClassification.DIRECTORY: {
            // Directory created or modified: notify directory creation if callback exists.
            // NEVER call onFileDelete! Existing descendants remain safe!
            callbacks.onDirectoryCreate?.(path);
            break;
          }

          case PathClassification.CONFIRMED_FILE_DELETION: {
            // Protect dirty buffers: if user has unsaved edits in this file, register external deletion conflict!
            if (callbacks.isEditorDirty?.(path)) {
              console.warn(`[WebContainerWatcher] Protected dirty buffer from external deletion and registered conflict: ${path}`);
              const monacoContent = callbacks.getEditorContent?.(path) ?? '';
              const conflict = editorConflictService.registerConflict({
                projectId: currentProjectId,
                path,
                monacoContent,
                externalContent: '',
                conflictType: 'file_deleted',
              });
              callbacks.onFileConflict?.(conflict);
              break;
            }
            callbacks.onFileDelete(path);
            break;
          }

          case PathClassification.CONFIRMED_DIRECTORY_DELETION: {
            // Genuine directory deletion: check for dirty descendant files
            const dirtyDescendants = knownFiles.filter(
              (f) => f.startsWith(`${path}/`) && callbacks.isEditorDirty?.(f),
            );
            if (dirtyDescendants.length > 0) {
              console.warn(
                `[WebContainerWatcher] Preserved dirty buffers [${dirtyDescendants.join(', ')}] during directory deletion of ${path}`,
              );
              for (const dirtyPath of dirtyDescendants) {
                const monacoContent = callbacks.getEditorContent?.(dirtyPath) ?? '';
                const conflict = editorConflictService.registerConflict({
                  projectId: currentProjectId,
                  path: dirtyPath,
                  monacoContent,
                  externalContent: '',
                  conflictType: 'directory_deleted',
                });
                callbacks.onFileConflict?.(conflict);
              }
              // Safely remove non-dirty files that were deleted along with the directory
              const cleanDescendants = knownFiles.filter(
                (f) => f.startsWith(`${path}/`) && !callbacks.isEditorDirty?.(f),
              );
              for (const cleanPath of cleanDescendants) {
                callbacks.onFileDelete(cleanPath);
              }
              break;
            }
            if (callbacks.onDirectoryDelete) {
              callbacks.onDirectoryDelete(path);
            } else {
              callbacks.onFileDelete(path);
            }
            break;
          }

          case PathClassification.TRANSIENT_ERROR:
          case PathClassification.UNKNOWN_STATE:
          default: {
            // Fail-safe: do not perform any destructive operation
            break;
          }
        }
      } catch (err) {
        console.warn(`[WebContainerWatcher] Error reconciling ${path}:`, err);
      }
    }
  }
}

export const webcontainerWatcher = new WebContainerWatcher();
