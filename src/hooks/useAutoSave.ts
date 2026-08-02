import { useEffect, useRef, useState, useCallback } from 'react';
import { snapshotService, SnapshotProjectState } from '../services/snapshotService';

interface UseAutoSaveProps {
  projectState: SnapshotProjectState | null;
  intervalMs?: number; // E.g. 2000 for 2 seconds
  enabled?: boolean;
}

export const useAutoSave = ({
  projectState,
  intervalMs = 2000,
  enabled = true,
}: UseAutoSaveProps) => {
  const [lastSaveTime, setLastSaveTime] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const autoSnapshotIntervalRef = useRef<NodeJS.Timeout>();
  const lastSavedStateRef = useRef<string>('');

  const createContentHash = (state: SnapshotProjectState) => {
    // A simplified hash: just stringify the state.
    // In a real app we might hash this properly to save performance, but JSON.stringify is fast enough for small projects.
    return btoa(encodeURIComponent(JSON.stringify(state))).slice(0, 32);
  };

  const performAutoSave = useCallback(() => {
    if (!enabled || !projectState) return;

    const currentHash = createContentHash(projectState);

    // Only save if content has changed
    if (currentHash === lastSavedStateRef.current) return;

    setIsSaving(true);
    try {
      snapshotService.saveAutoSave(projectState);
      
      const timestamp = new Date().toISOString();
      lastSavedStateRef.current = currentHash;
      setLastSaveTime(timestamp);

      // Dispatch custom event for UI feedback (StatusBar)
      window.dispatchEvent(new CustomEvent('autosave', {
        detail: { timestamp }
      }));
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [enabled, projectState]);

  // Handle continuous auto-save on inactivity (debounce)
  useEffect(() => {
    if (!enabled || !projectState) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout (debounce)
    timeoutRef.current = setTimeout(() => {
      performAutoSave();
    }, intervalMs);

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [projectState, intervalMs, enabled, performAutoSave]);

  // Handle 10-minute automatic snapshots
  useEffect(() => {
    if (!enabled) return;
    
    // Check every 10 minutes (600,000 ms)
    autoSnapshotIntervalRef.current = setInterval(() => {
      if (!projectState) return;
      
      const currentHash = createContentHash(projectState);
      
      // We don't want to snapshot if there are no changes since the last save
      // But we need to track the last snapshot hash, not just the last auto-save hash.
      // For simplicity, we just create a snapshot. The SnapshotService will prune old ones.
      try {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        snapshotService.createSnapshot(`Auto-save [${timeStr}]`, projectState, true);
        window.dispatchEvent(new CustomEvent('snapshots-updated'));
      } catch(e) {
        console.error('Failed to create auto-snapshot', e);
      }
    }, 600000);

    return () => {
      if (autoSnapshotIntervalRef.current) {
        clearInterval(autoSnapshotIntervalRef.current);
      }
    };
  }, [enabled, projectState]);

  // Manual auto-save function (if needed)
  const manualSave = async () => {
    performAutoSave();
    return { error: null };
  };

  return {
    lastSaveTime,
    isSaving,
    manualSave,
    performAutoSave
  };
};