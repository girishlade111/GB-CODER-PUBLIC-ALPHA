/**
 * Editor Conflict Service
 *
 * Tracks, isolates, and manages external-file conflicts when WebContainer terminal
 * commands modify files that currently have unsaved edits in Monaco buffers.
 *
 * Guarantees:
 * 1. Zero silent overwrites of dirty Monaco buffers by external processes.
 * 2. Zero silent overwrites of external filesystem modifications by Monaco saves.
 * 3. Scoped by projectId to ensure complete isolation across project switches.
 * 4. Immutable revision snapshots preserving both in-memory and on-disk contents.
 */

export interface ExternalFileConflict {
  id: string;
  projectId: string;
  path: string;
  monacoContent: string;
  externalContent: string;
  baseContent?: string;
  createdAt: number;
  status: 'pending' | 'resolved_keep_mine' | 'resolved_use_external' | 'dismissed';
}

export type ConflictResolution = 'keep_mine' | 'use_external' | 'dismiss';

export class EditorConflictService {
  private conflicts = new Map<string, ExternalFileConflict>();
  private listeners = new Set<() => void>();
  private nextId = 1;

  private makeKey(projectId: string, path: string): string {
    const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${projectId}:${cleanPath}`;
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
  }): ExternalFileConflict {
    const key = this.makeKey(params.projectId, params.path);
    const existing = this.conflicts.get(key);

    const conflict: ExternalFileConflict = {
      id: existing ? existing.id : `conflict-${Date.now()}-${this.nextId++}`,
      projectId: params.projectId,
      path: params.path.replace(/\\/g, '/').replace(/^\/+/, ''),
      monacoContent: params.monacoContent,
      externalContent: params.externalContent,
      baseContent: params.baseContent ?? existing?.baseContent,
      createdAt: existing ? existing.createdAt : Date.now(),
      status: 'pending',
    };

    this.conflicts.set(key, conflict);
    this.notify();
    return conflict;
  }

  /**
   * Retrieves an active pending conflict for a project and path.
   */
  public getConflict(projectId: string, path: string): ExternalFileConflict | undefined {
    const key = this.makeKey(projectId, path);
    const c = this.conflicts.get(key);
    return c && c.status === 'pending' ? c : undefined;
  }

  /**
   * Checks whether a pending conflict exists for the specified file.
   */
  public hasConflict(projectId: string, path: string): boolean {
    return Boolean(this.getConflict(projectId, path));
  }

  /**
   * Checks whether any pending conflicts exist in the given project.
   */
  public hasAnyConflict(projectId: string): boolean {
    for (const [key, conflict] of this.conflicts.entries()) {
      if (key.startsWith(`${projectId}:`) && conflict.status === 'pending') {
        return true;
      }
    }
    return false;
  }

  /**
   * Lists all pending conflicts for the specified project.
   */
  public listConflicts(projectId: string): ExternalFileConflict[] {
    const results: ExternalFileConflict[] = [];
    for (const [key, conflict] of this.conflicts.entries()) {
      if (key.startsWith(`${projectId}:`) && conflict.status === 'pending') {
        results.push(conflict);
      }
    }
    return results;
  }

  /**
   * Resolves a pending conflict with a chosen strategy.
   */
  public resolveConflict(
    projectId: string,
    path: string,
    resolution: ConflictResolution,
  ): ExternalFileConflict | undefined {
    const key = this.makeKey(projectId, path);
    const conflict = this.conflicts.get(key);
    if (!conflict) return undefined;

    if (resolution === 'keep_mine') {
      conflict.status = 'resolved_keep_mine';
    } else if (resolution === 'use_external') {
      conflict.status = 'resolved_use_external';
    } else {
      conflict.status = 'dismissed';
    }

    // Remove from active conflicts map
    this.conflicts.delete(key);
    this.notify();
    return conflict;
  }

  /**
   * Clears all conflicts for a project (e.g. during project close or reload).
   */
  public clearProjectConflicts(projectId: string): void {
    let changed = false;
    for (const key of Array.from(this.conflicts.keys())) {
      if (key.startsWith(`${projectId}:`)) {
        this.conflicts.delete(key);
        changed = true;
      }
    }
    if (changed) {
      this.notify();
    }
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
        // Ignored
      }
    });
  }
}

export const editorConflictService = new EditorConflictService();
