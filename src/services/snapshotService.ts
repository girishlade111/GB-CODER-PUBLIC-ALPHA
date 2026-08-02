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
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse auto-save:', e);
      return null;
    }
  }

  public clearAutoSave(): void {
    localStorage.removeItem(AUTOSAVE_KEY);
  }

  public backupAutoSave(): void {
    const data = localStorage.getItem(AUTOSAVE_KEY);
    if (data) {
      const timestamp = new Date().getTime();
      localStorage.setItem(`${AUTOSAVE_BACKUP_KEY_PREFIX}${timestamp}`, data);
      this.clearAutoSave();
    }
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
