import { MultiFileProject } from '../types/files';
import { ExternalLibrary } from './externalLibraryService';
import { ProjectSettings } from '../types/project';

export interface SnapshotProjectState {
  project: MultiFileProject;
  openPaths: string[];
  activePath: string | null;
  externalLibraries: ExternalLibrary[];
  settings?: ProjectSettings;
}

export interface Snapshot {
  id: string;
  name: string;
  timestamp: string;
  isAuto: boolean;
  projectState: SnapshotProjectState;
}

export interface StorageUsage {
  usedBytes: number;
  maxBytes: number;
  percentage: number;
}

/**
 * Shape guard for autosave recovery records.
 *
 * Autosave is a single global localStorage slot written across project
 * switches, so a record can be truncated (quota), hand-edited, or belong to a
 * stale schema. Restoration (`App.tsx` session recovery) must never receive
 * such a record unchecked. Malformed input is rejected WITHOUT erasing the
 * raw slot, so the bytes stay available for inspection.
 */
export function isValidSnapshotState(value: unknown): value is SnapshotProjectState {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const state = value as Record<string, unknown>;

  const project = state.project;
  if (typeof project !== 'object' || project === null || Array.isArray(project)) return false;
  const files = (project as Record<string, unknown>).files;
  if (!Array.isArray(files)) return false;
  for (const file of files) {
    if (typeof file !== 'object' || file === null) return false;
    const entry = file as Record<string, unknown>;
    if (typeof entry.path !== 'string' || entry.path.trim().length === 0) return false;
    if (typeof entry.content !== 'string') return false;
  }

  if (!Array.isArray(state.openPaths)) return false;
  for (const p of state.openPaths as unknown[]) {
    if (typeof p !== 'string') return false;
  }
  if (state.activePath !== null && typeof state.activePath !== 'string') return false;

  if (!Array.isArray(state.externalLibraries)) return false;
  for (const lib of state.externalLibraries as unknown[]) {
    if (typeof lib !== 'object' || lib === null) return false;
  }

  if (state.settings !== undefined && (typeof state.settings !== 'object' || state.settings === null)) {
    return false;
  }
  // The recovery modal renders this unconditionally; typeless timestamps must
  // not reach it (saveAutoSave always stamps a string).
  if (typeof (state as Record<string, unknown>).lastModified !== 'string') return false;
  return true;
}

export interface ProjectExport {
  version: 1;
  exportDate: string;
  currentSession?: SnapshotProjectState;
  snapshots: Snapshot[];
}

const AUTOSAVE_KEY = 'gbcoder_autosave_current';
const AUTOSAVE_BACKUP_KEY_PREFIX = 'gbcoder_autosave_backup_';
const SNAPSHOTS_KEY = 'gbcoder_snapshots';
const MAX_SNAPSHOTS = 50;
const MAX_AUTO_SNAPSHOTS = 10;
const MAX_STORAGE_BYTES = 5 * 1024 * 1024; // 5 MB (typical localStorage limit)

class SnapshotService {
  /**
   * Auto-Save Management
   */

  public saveAutoSave(state: SnapshotProjectState): void {
    try {
      const data = JSON.stringify({
        ...state,
        lastModified: new Date().toISOString(),
      });
      localStorage.setItem(AUTOSAVE_KEY, data);
    } catch (e) {
      console.error('Failed to save auto-save:', e);
    }
  }

  public getAutoSave(): (SnapshotProjectState & { lastModified: string }) | null {
    try {
      const data = localStorage.getItem(AUTOSAVE_KEY);
      if (!data) return null;
      const parsed: unknown = JSON.parse(data);
      if (!isValidSnapshotState(parsed)) {
        // Retain the raw bytes for diagnosis; surface nothing unchecked.
        console.error('Ignoring malformed auto-save record; raw value retained.');
        return null;
      }
      return parsed as SnapshotProjectState & { lastModified: string };
    } catch (e) {
      console.error('Failed to parse auto-save:', e);
      return null;
    }
  }

  public clearAutoSave(): boolean {
    try {
      localStorage.removeItem(AUTOSAVE_KEY);
      return true;
    } catch (e) {
      // Blocked storage (private mode, denied access) must never wedge the
      // recovery modal's dismiss path. The autosave is retained; report failure.
      console.error('Failed to clear auto-save:', e);
      return false;
    }
  }

  /**
   * Copies the current autosave aside before discarding it.
   *
   * Never clears the live slot before the backup write has succeeded: on any
   * storage failure the original autosave is preserved and `false` is returned
   * so the caller can say so instead of claiming a successful cleanup.
   */
  public backupAutoSave(): boolean {
    let data: string | null;
    try {
      data = localStorage.getItem(AUTOSAVE_KEY);
    } catch (e) {
      console.error('Failed to read auto-save for backup:', e);
      return false;
    }
    if (!data) return true; // Nothing to back up.
    try {
      const timestamp = new Date().getTime();
      localStorage.setItem(`${AUTOSAVE_BACKUP_KEY_PREFIX}${timestamp}`, data);
    } catch (e) {
      console.error('Failed to back up auto-save:', e);
      return false;
    }
    // Backup persisted — only now is clearing safe. A clear failure still
    // leaves the backup copy behind, so nothing is lost either way.
    return this.clearAutoSave();
  }

  /**
   * Snapshots Management
   */

  public getSnapshots(): Snapshot[] {
    try {
      const data = localStorage.getItem(SNAPSHOTS_KEY);
      if (!data) return [];
      return JSON.parse(data) as Snapshot[];
    } catch (e) {
      console.error('Failed to get snapshots:', e);
      return [];
    }
  }

  private saveSnapshots(snapshots: Snapshot[]): void {
    try {
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots));
    } catch (e) {
      console.error('Failed to save snapshots:', e);
      // If quota exceeded, we might want to throw or handle it
      throw e;
    }
  }

  public createSnapshot(name: string, state: SnapshotProjectState, isAuto: boolean = false): Snapshot {
    const snapshots = this.getSnapshots();
    
    // Check limit
    if (!isAuto && snapshots.length >= MAX_SNAPSHOTS) {
      throw new Error(`Snapshot limit of ${MAX_SNAPSHOTS} reached. Please delete some before creating new ones.`);
    }

    const newSnapshot: Snapshot = {
      id: crypto.randomUUID(),
      name,
      timestamp: new Date().toISOString(),
      isAuto,
      projectState: state,
    };

    let newSnapshots = [newSnapshot, ...snapshots];

    // Enforce auto-snapshot limits
    if (isAuto) {
      const autoSnapshots = newSnapshots.filter(s => s.isAuto);
      if (autoSnapshots.length > MAX_AUTO_SNAPSHOTS) {
        const oldestAuto = autoSnapshots[autoSnapshots.length - 1];
        newSnapshots = newSnapshots.filter(s => s.id !== oldestAuto.id);
      }
    }

    this.saveSnapshots(newSnapshots);
    return newSnapshot;
  }

  public deleteSnapshot(id: string): void {
    const snapshots = this.getSnapshots();
    this.saveSnapshots(snapshots.filter(s => s.id !== id));
  }

  public renameSnapshot(id: string, newName: string): void {
    const snapshots = this.getSnapshots();
    const index = snapshots.findIndex(s => s.id === id);
    if (index !== -1) {
      snapshots[index].name = newName;
      this.saveSnapshots(snapshots);
    }
  }

  public cleanUpOldSnapshots(): void {
    const snapshots = this.getSnapshots();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const newSnapshots = snapshots.filter(s => {
      if (!s.isAuto) return true; // Keep manual snapshots
      return new Date(s.timestamp) > sevenDaysAgo;
    });
    
    this.saveSnapshots(newSnapshots);
  }

  /**
   * Storage Management
   */

  public getStorageUsage(): StorageUsage {
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('gbcoder_')) {
        const value = localStorage.getItem(key) || '';
        totalBytes += key.length + value.length; // Approximate UTF-16 bytes (technically * 2)
      }
    }
    // Multiply by 2 because JS strings are UTF-16
    totalBytes = totalBytes * 2;
    return {
      usedBytes: totalBytes,
      maxBytes: MAX_STORAGE_BYTES,
      percentage: Math.min(100, Math.round((totalBytes / MAX_STORAGE_BYTES) * 100)),
    };
  }

  /**
   * Import / Export
   */

  public exportProject(currentState?: SnapshotProjectState): string {
    const exportData: ProjectExport = {
      version: 1,
      exportDate: new Date().toISOString(),
      currentSession: currentState,
      snapshots: this.getSnapshots(),
    };
    return JSON.stringify(exportData, null, 2);
  }

  public importProject(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData) as ProjectExport;
      if (data.version !== 1) {
        throw new Error('Unsupported project version');
      }
      
      if (data.snapshots) {
        this.saveSnapshots(data.snapshots);
      }
      
      if (data.currentSession) {
        this.saveAutoSave(data.currentSession);
      }
      
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }
}

export const snapshotService = new SnapshotService();
