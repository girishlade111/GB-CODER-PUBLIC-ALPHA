import { useState, useEffect, useCallback } from 'react';
import { snapshotService, Snapshot, StorageUsage, SnapshotProjectState } from '../services/snapshotService';

export const useSnapshots = () => {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [storageUsage, setStorageUsage] = useState<StorageUsage>({ usedBytes: 0, maxBytes: 1, percentage: 0 });

  const refreshState = useCallback(() => {
    setSnapshots(snapshotService.getSnapshots());
    setStorageUsage(snapshotService.getStorageUsage());
  }, []);

  useEffect(() => {
    refreshState();
    
    // Listen for cross-component snapshot events
    const handleSnapshotEvent = () => refreshState();
    window.addEventListener('snapshots-updated', handleSnapshotEvent);
    
    return () => {
      window.removeEventListener('snapshots-updated', handleSnapshotEvent);
    };
  }, [refreshState]);

  const notifyUpdate = () => {
    window.dispatchEvent(new CustomEvent('snapshots-updated'));
  };

  const createSnapshot = (name: string, state: SnapshotProjectState, isAuto: boolean = false) => {
    try {
      const snapshot = snapshotService.createSnapshot(name, state, isAuto);
      notifyUpdate();
      return { success: true, snapshot };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const deleteSnapshot = (id: string) => {
    snapshotService.deleteSnapshot(id);
    notifyUpdate();
  };

  const renameSnapshot = (id: string, newName: string) => {
    snapshotService.renameSnapshot(id, newName);
    notifyUpdate();
  };

  const cleanUpOldSnapshots = () => {
    snapshotService.cleanUpOldSnapshots();
    notifyUpdate();
  };

  const exportProject = (currentState?: SnapshotProjectState) => {
    return snapshotService.exportProject(currentState);
  };

  const importProject = (jsonData: string) => {
    const success = snapshotService.importProject(jsonData);
    if (success) {
      notifyUpdate();
    }
    return success;
  };

  return {
    snapshots,
    storageUsage,
    createSnapshot,
    deleteSnapshot,
    renameSnapshot,
    cleanUpOldSnapshots,
    exportProject,
    importProject,
    refreshState,
  };
};
