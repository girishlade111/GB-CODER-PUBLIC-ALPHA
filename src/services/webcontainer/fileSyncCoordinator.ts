/**
 * FileSyncCoordinator
 *
 * Coordinates filesystem synchronization between Monaco Editor and WebContainer's virtual filesystem.
 *
 * Responsibilities:
 * 1. Debouncing (200ms) to coalesce high-frequency keystrokes and prevent intermediate syntax HMR crashes.
 * 2. Per-path sequential FIFO queue: guarantees that writes for the same path never execute out-of-order.
 * 3. Project scoping: pending writes are bound to a projectId. If the project is switched or detached,
 *    foreign writes are dropped.
 * 4. Flush: flush() flushes all pending debounced writes immediately to disk in order.
 * 5. Rename & Delete coordination:
 *    - renameFile(oldPath, newPath) cancels or migrates pending writes for oldPath.
 *    - deleteFile(path) cancels pending writes for path before deleting from fs.
 */

export interface SyncCoordinatorOptions {
  debounceMs?: number;
  rawWrite: (path: string, content: string) => Promise<void>;
  rawDelete: (path: string) => Promise<void>;
  onDependencyInvalidation?: (cleanPath: string) => void;
}

interface PendingItem {
  content: string;
  projectId: string | null;
  timer: ReturnType<typeof setTimeout> | null;
  timestamp: number;
}

export class FileSyncCoordinator {
  private readonly debounceMs: number;
  private readonly rawWrite: (path: string, content: string) => Promise<void>;
  private readonly rawDelete: (path: string) => Promise<void>;
  private readonly onDependencyInvalidation?: (cleanPath: string) => void;

  private pendingWrites = new Map<string, PendingItem>();
  private inFlightPaths = new Set<string>();
  private activeProjectId: string | null = null;

  constructor(options: SyncCoordinatorOptions) {
    this.debounceMs = options.debounceMs ?? 200;
    this.rawWrite = options.rawWrite;
    this.rawDelete = options.rawDelete;
    this.onDependencyInvalidation = options.onDependencyInvalidation;
  }

  public setScope(projectId: string | null): void {
    if (this.activeProjectId !== projectId) {
      // Discard all pending writes for the former project
      this.cancelAll();
      this.activeProjectId = projectId;
    }
  }

  public getScope(): string | null {
    return this.activeProjectId;
  }

  public queueSync(path: string, content: string, projectId?: string | null): void {
    const cleanPath = path.replace(/^\/+/, '');
    const scopedProject = projectId ?? this.activeProjectId;

    // Discard write if it explicitly targets an inactive project
    if (scopedProject !== null && this.activeProjectId !== null && scopedProject !== this.activeProjectId) {
      return;
    }

    // Invalidate manifest/lockfile cache immediately on edit
    if (
      cleanPath === 'package.json' ||
      cleanPath === 'package-lock.json' ||
      cleanPath === 'pnpm-lock.yaml' ||
      cleanPath === 'yarn.lock'
    ) {
      this.onDependencyInvalidation?.(cleanPath);
    }

    // Clear existing debounce timer for this path if any
    const existing = this.pendingWrites.get(cleanPath);
    if (existing?.timer) {
      clearTimeout(existing.timer);
    }

    const timer = setTimeout(() => {
      void this.executeWrite(cleanPath);
    }, this.debounceMs);

    this.pendingWrites.set(cleanPath, {
      content,
      projectId: scopedProject,
      timer,
      timestamp: Date.now(),
    });
  }

  private async executeWrite(cleanPath: string): Promise<void> {
    const item = this.pendingWrites.get(cleanPath);
    if (!item) return;

    // Project scope guard
    if (item.projectId !== null && this.activeProjectId !== null && item.projectId !== this.activeProjectId) {
      this.pendingWrites.delete(cleanPath);
      return;
    }

    // If a write for this path is currently in-flight, do not overlap.
    // When the in-flight write completes, it will pick up the queued item.
    if (this.inFlightPaths.has(cleanPath)) {
      return;
    }

    this.inFlightPaths.add(cleanPath);
    this.pendingWrites.delete(cleanPath);

    try {
      await this.rawWrite(cleanPath, item.content);
    } catch (err) {
      console.warn(`[FileSyncCoordinator] Failed to write file ${cleanPath}:`, err);
    } finally {
      this.inFlightPaths.delete(cleanPath);

      // Check if a newer write was queued while the previous write was in-flight
      const nextItem = this.pendingWrites.get(cleanPath);
      if (nextItem) {
        if (nextItem.timer) {
          clearTimeout(nextItem.timer);
          nextItem.timer = null;
        }
        void this.executeWrite(cleanPath);
      }
    }
  }

  public async flush(): Promise<void> {
    // Clear all pending debounce timers
    const entries = Array.from(this.pendingWrites.entries());
    for (const [, item] of entries) {
      if (item.timer) {
        clearTimeout(item.timer);
        item.timer = null;
      }
    }

    // Drain all queued writes
    const flushPromises = entries.map(async ([path]) => {
      await this.executeWrite(path);
    });

    await Promise.allSettled(flushPromises);

    // Wait if any paths remain in-flight
    while (this.inFlightPaths.size > 0) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }

  public cancelPath(path: string): void {
    const cleanPath = path.replace(/^\/+/, '');
    const prefix = cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`;

    for (const [key, item] of this.pendingWrites.entries()) {
      if (key === cleanPath || key.startsWith(prefix)) {
        if (item.timer) clearTimeout(item.timer);
        this.pendingWrites.delete(key);
      }
    }
  }

  public cancelAll(): void {
    for (const [, item] of this.pendingWrites.entries()) {
      if (item.timer) clearTimeout(item.timer);
    }
    this.pendingWrites.clear();
  }

  public handleRename(oldPath: string, newPath: string): void {
    const cleanOld = oldPath.replace(/^\/+/, '');
    const cleanNew = newPath.replace(/^\/+/, '');

    const oldItem = this.pendingWrites.get(cleanOld);
    if (oldItem) {
      if (oldItem.timer) clearTimeout(oldItem.timer);
      this.pendingWrites.delete(cleanOld);
      this.queueSync(cleanNew, oldItem.content, oldItem.projectId);
    }
  }

  public async handleDelete(path: string): Promise<void> {
    this.cancelPath(path);
    const cleanPath = path.replace(/^\/+/, '');
    if (
      cleanPath === 'package.json' ||
      cleanPath === 'package-lock.json' ||
      cleanPath === 'pnpm-lock.yaml' ||
      cleanPath === 'yarn.lock' ||
      cleanPath === 'node_modules' ||
      cleanPath.startsWith('node_modules/')
    ) {
      this.onDependencyInvalidation?.(cleanPath);
    }
    try {
      await this.rawDelete(cleanPath);
    } catch (err) {
      console.warn(`[FileSyncCoordinator] Failed to delete ${cleanPath}:`, err);
    }
  }

  public hasPendingWrites(): boolean {
    return this.pendingWrites.size > 0 || this.inFlightPaths.size > 0;
  }
}
