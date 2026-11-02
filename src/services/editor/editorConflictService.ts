/**
 * Editor Conflict Service
 *
 * Tracks, isolates, and manages external-file conflicts when WebContainer terminal
 * commands modify files that currently have unsaved edits in Monaco buffers.
 *
 * Guarantees:
 * 1. Durable persistence: Unresolved conflicts survive browser reload, tab close,
 *    and project switching via isolated IndexedDB ('gb-coder-editor-conflicts')
 *    backed by synchronous localStorage fast-recovery caching.
 * 2. Zero silent overwrites of dirty Monaco buffers by external terminal commands.
 * 3. Zero silent overwrites of external filesystem modifications by Monaco saves.
 * 4. Scoped by projectId to ensure complete isolation across project switches.
 * 5. Full revision snapshots preserving both in-memory and on-disk contents.
 */

export type ConflictType = 'content_modified' | 'directory_deleted' | 'file_deleted';

export type ConflictStatus =
  | 'pending'
  | 'resolving'
  | 'recovery_required'
  | 'resolved_keep_mine'
  | 'resolved_use_external'
  | 'dismissed';

export type ConflictResolution = 'keep_mine' | 'use_external' | 'dismiss';

export interface ExternalFileConflict {
  schemaVersion: 1;
  id: string;
  projectId: string;
  path: string;
  conflictType: ConflictType;
  monacoContent: string;
  externalContent: string;
  baseContent?: string;
  createdAt: number;
  updatedAt: number;
  status: ConflictStatus;
  externalHash?: string;
  lastError?: string;
}

export function isActiveConflictStatus(status: ConflictStatus): boolean {
  return status === 'pending' || status === 'resolving' || status === 'recovery_required';
}

const DB_NAME = 'gb-coder-editor-conflicts';
const DB_VERSION = 1;
const STORE_NAME = 'conflicts';
const LOCAL_STORAGE_KEY = 'gb-coder-durable-conflicts';

/** Simple string hash for external content deduplication */
function computeHash(content: string): string {
  let hash = 5381;
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) + hash) ^ content.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

export class EditorConflictService {
  private conflicts = new Map<string, ExternalFileConflict>();
  private listeners = new Set<() => void>();
  private nextId = 1;
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private isInitialized = false;

  constructor() {
    this.loadFromLocalStorage();
    if (typeof indexedDB !== 'undefined') {
      void this.initFromIndexedDB();
    }
  }

  private makeKey(projectId: string, path: string): string {
    const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '').trim();
    return `${projectId}:${cleanPath}`;
  }

  private openDatabase(): Promise<IDBDatabase | null> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise<IDBDatabase | null>((resolve) => {
      if (typeof indexedDB === 'undefined') {
        resolve(null);
        return;
      }

      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('projectId', 'projectId', { unique: false });
            store.createIndex('project_path', ['projectId', 'path'], { unique: false });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          console.warn('[EditorConflictService] IndexedDB open error:', req.error);
          resolve(null);
        };
        req.onblocked = () => {
          console.warn('[EditorConflictService] IndexedDB blocked');
          resolve(null);
        };
      } catch (err) {
        console.warn('[EditorConflictService] IndexedDB initialization exception:', err);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  private loadFromLocalStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && item.id && item.projectId && item.path && isActiveConflictStatus(item.status)) {
            const key = this.makeKey(item.projectId, item.path);
            this.conflicts.set(key, item);
          }
        }
      }
    } catch (err) {
      console.warn('[EditorConflictService] Failed to load durable conflicts from localStorage:', err);
    }
  }

  private syncToLocalStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const active = Array.from(this.conflicts.values()).filter((c) => isActiveConflictStatus(c.status));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(active));
    } catch {
      // Non-fatal if localStorage quota is exceeded; IndexedDB retains full records
    }
  }

  public async initFromIndexedDB(): Promise<void> {
    if (this.isInitialized) return;
    const db = await this.openDatabase();
    if (!db) {
      this.isInitialized = true;
      return;
    }

    try {
      const tx = db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);

      await new Promise<void>((resolve, reject) => {
        if (typeof store.getAll === 'function') {
          const req = store.getAll();
          req.onsuccess = () => {
            const records: ExternalFileConflict[] = req.result ?? [];
            let updated = false;
            for (const item of records) {
              if (item && isActiveConflictStatus(item.status)) {
                const key = this.makeKey(item.projectId, item.path);
                if (!this.conflicts.has(key)) {
                  this.conflicts.set(key, item);
                  updated = true;
                }
              }
            }
            if (updated) {
              this.syncToLocalStorage();
              this.notify();
            }
            resolve();
          };
          req.onerror = () => reject(req.error);
        } else if (typeof store.openCursor === 'function') {
          const req = store.openCursor();
          let updated = false;
          req.onsuccess = () => {
            const cursor = req.result;
            if (cursor) {
              const item = cursor.value as ExternalFileConflict;
              if (item && isActiveConflictStatus(item.status)) {
                const key = this.makeKey(item.projectId, item.path);
                if (!this.conflicts.has(key)) {
                  this.conflicts.set(key, item);
                  updated = true;
                }
              }
              cursor.continue();
            } else {
              if (updated) {
                this.syncToLocalStorage();
                this.notify();
              }
              resolve();
            }
          };
          req.onerror = () => reject(req.error);
        } else {
          resolve();
        }
      });
    } catch (err) {
      console.warn('[EditorConflictService] Error reading durable conflicts from IndexedDB:', err);
    } finally {
      this.isInitialized = true;
    }
  }

  private async persistConflict(conflict: ExternalFileConflict): Promise<void> {
    const db = await this.openDatabase();
    if (!db) return;

    try {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      tx.objectStore(STORE_NAME).put(conflict);
    } catch (err) {
      console.warn('[EditorConflictService] Error persisting conflict to IndexedDB:', err);
    }
  }

  private async removeConflictFromStorage(conflict: ExternalFileConflict): Promise<void> {
    const db = await this.openDatabase();
    if (!db) return;

    try {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      // Update with resolved status so audit trail is preserved
      tx.objectStore(STORE_NAME).put(conflict);
    } catch (err) {
      console.warn('[EditorConflictService] Error updating resolved conflict in IndexedDB:', err);
    }
  }

  /**
   * Registers or updates an external file conflict.
   * If a conflict already exists for this project/path, updates the external content
   * while strictly preserving the user's unsaved Monaco content.
   */
  public registerConflict(params: {
    projectId: string;
    path: string;
    monacoContent: string;
    externalContent: string;
    baseContent?: string;
    conflictType?: ConflictType;
  }): ExternalFileConflict {
    const cleanPath = params.path.replace(/\\/g, '/').replace(/^\/+/, '').trim();
    const key = this.makeKey(params.projectId, cleanPath);
    const existing = this.conflicts.get(key);
    const now = Date.now();

    const conflict: ExternalFileConflict = {
      schemaVersion: 1,
      id: existing ? existing.id : `conflict-${now}-${this.nextId++}`,
      projectId: params.projectId,
      path: cleanPath,
      conflictType: params.conflictType ?? existing?.conflictType ?? 'content_modified',
      monacoContent: existing ? existing.monacoContent : params.monacoContent,
      externalContent: params.externalContent,
      baseContent: params.baseContent ?? existing?.baseContent,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
      status: 'pending',
      externalHash: computeHash(params.externalContent),
    };

    this.conflicts.set(key, conflict);
    this.syncToLocalStorage();
    void this.persistConflict(conflict);
    this.notify();
    return conflict;
  }

  /**
   * Retrieves an active pending or in-recovery conflict for a project and path.
   */
  public getConflict(projectId: string, path: string): ExternalFileConflict | undefined {
    const key = this.makeKey(projectId, path);
    const c = this.conflicts.get(key);
    return c && isActiveConflictStatus(c.status) ? c : undefined;
  }

  /**
   * Updates conflict status (e.g. 'resolving' or 'recovery_required') with durable persistence.
   */
  public setConflictStatus(
    projectId: string,
    path: string,
    status: ConflictStatus,
    error?: string,
  ): ExternalFileConflict | undefined {
    const key = this.makeKey(projectId, path);
    const conflict = this.conflicts.get(key);
    if (!conflict) return undefined;

    conflict.status = status;
    conflict.updatedAt = Date.now();
    if (error !== undefined) {
      conflict.lastError = error;
    }

    if (isActiveConflictStatus(status)) {
      this.syncToLocalStorage();
      void this.persistConflict(conflict);
    } else {
      this.conflicts.delete(key);
      this.syncToLocalStorage();
      void this.removeConflictFromStorage(conflict);
    }

    this.notify();
    return conflict;
  }

  /**
   * Checks whether a pending or in-recovery conflict exists for the specified file.
   */
  public hasConflict(projectId: string, path: string): boolean {
    return Boolean(this.getConflict(projectId, path));
  }

  /**
   * Checks whether any pending or in-recovery conflicts exist in the given project.
   */
  public hasAnyConflict(projectId: string): boolean {
    for (const [key, conflict] of this.conflicts.entries()) {
      if (key.startsWith(`${projectId}:`) && isActiveConflictStatus(conflict.status)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Lists all active conflicts for the specified project.
   */
  public listConflicts(projectId: string): ExternalFileConflict[] {
    const results: ExternalFileConflict[] = [];
    for (const [key, conflict] of this.conflicts.entries()) {
      if (key.startsWith(`${projectId}:`) && isActiveConflictStatus(conflict.status)) {
        results.push(conflict);
      }
    }
    return results;
  }

  /**
   * Central write safety assertion.
   * Throws or returns validation result before any persistence or file sync operation.
   */
  public canWrite(projectId: string, path: string): boolean {
    return !this.hasConflict(projectId, path);
  }

  public assertWriteSafe(projectId: string, path: string): void {
    if (this.hasConflict(projectId, path)) {
      throw new Error(
        `[EditorConflictService] Write blocked: "${path}" has an unresolved external conflict in project "${projectId}".`,
      );
    }
  }

  /**
   * Resolves a pending conflict with a chosen strategy.
   * Clears from active pending set, updates durable stores, and notifies subscribers.
   */
  public resolveConflict(
    projectId: string,
    path: string,
    resolution: ConflictResolution,
  ): ExternalFileConflict | undefined {
    const key = this.makeKey(projectId, path);
    const conflict = this.conflicts.get(key);
    if (!conflict) return undefined;

    conflict.updatedAt = Date.now();

    if (resolution === 'keep_mine') {
      conflict.status = 'resolved_keep_mine';
    } else if (resolution === 'use_external') {
      conflict.status = 'resolved_use_external';
    } else {
      conflict.status = 'dismissed';
    }

    // Remove from active conflicts map
    this.conflicts.delete(key);
    this.syncToLocalStorage();
    void this.removeConflictFromStorage(conflict);
    this.notify();
    return conflict;
  }

  /**
   * Cleans up all conflicts for a project only when a project is truly deleted.
   * NOT called on simple project switch or tab unmount so conflicts stay durable!
   */
  public deleteProjectConflicts(projectId: string): void {
    let changed = false;
    for (const key of Array.from(this.conflicts.keys())) {
      if (key.startsWith(`${projectId}:`)) {
        this.conflicts.delete(key);
        changed = true;
      }
    }
    if (changed) {
      this.syncToLocalStorage();
      this.notify();
    }
  }

  /**
   * Alias for backward compatibility if callers invoke clearProjectConflicts.
   */
  public clearProjectConflicts(projectId: string): void {
    this.deleteProjectConflicts(projectId);
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch {
        // Non-fatal
      }
    });
  }
}

export const editorConflictService = new EditorConflictService();
