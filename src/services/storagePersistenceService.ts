/**
 * Storage persistence and quota evaluation service for GB Coder.
 *
 * Evaluates browser storage persistence capabilities using the StorageManager API:
 * - navigator.storage.persist()
 * - navigator.storage.persisted()
 * - navigator.storage.estimate()
 *
 * Provides safe detection, non-blocking persistence requests, and quota estimation
 * without promising permanent retention or blocking project creation.
 */

const STORAGE_PERSIST_CHECKED_KEY = 'gbcoder_storage_persist_checked';

export interface StorageEstimateResult {
  usage: number;
  quota: number;
  percentUsed: number;
  availableBytes: number;
}

export interface StoragePersistenceStatus {
  isSupported: boolean;
  isPersisted: boolean;
  estimate: StorageEstimateResult | null;
  warning: string | null;
}

/**
 * Returns true if the browser supports the StorageManager persistence API.
 */
export function isPersistenceSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.storage !== 'undefined' &&
    typeof navigator.storage.persist === 'function' &&
    typeof navigator.storage.persisted === 'function'
  );
}

/**
 * Queries whether the current origin has already been granted persistent storage.
 */
export async function isStoragePersisted(): Promise<boolean> {
  if (!isPersistenceSupported()) return false;
  try {
    return await navigator.storage.persisted();
  } catch {
    return false;
  }
}

/**
 * Requests persistent storage from the browser if supported and not previously granted.
 * Safe to call from user-initiated interactions (e.g. project creation or dashboard mount).
 * Never throws, never blocks the caller, and never prompts repeatedly in the same session.
 */
export async function requestStoragePersistence(): Promise<{
  persisted: boolean;
  supported: boolean;
  reason?: string;
}> {
  if (!isPersistenceSupported()) {
    return {
      persisted: false,
      supported: false,
      reason: 'StorageManager API not supported in this browser.',
    };
  }

  try {
    const alreadyPersisted = await navigator.storage.persisted();
    if (alreadyPersisted) {
      return { persisted: true, supported: true };
    }

    // Check if user or browser previously declined or checked this session to avoid repeated prompts
    if (typeof localStorage !== 'undefined') {
      const previouslyChecked = localStorage.getItem(STORAGE_PERSIST_CHECKED_KEY);
      if (previouslyChecked === 'true') {
        return {
          persisted: false,
          supported: true,
          reason: 'Persistence was already evaluated for this client.',
        };
      }
    }

    const granted = await navigator.storage.persist();
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_PERSIST_CHECKED_KEY, 'true');
      } catch {
        // localStorage restricted
      }
    }

    return {
      persisted: granted,
      supported: true,
      reason: granted
        ? 'Persistent storage granted.'
        : 'Browser declined persistent storage permission.',
    };
  } catch (err) {
    return {
      persisted: false,
      supported: true,
      reason: `Storage persistence request failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Retrieves the current storage quota and estimated usage.
 */
export async function getStorageEstimate(): Promise<StorageEstimateResult | null> {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.storage === 'undefined' ||
    typeof navigator.storage.estimate !== 'function'
  ) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage ?? 0;
    const quota = estimate.quota ?? 0;
    const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;
    const availableBytes = Math.max(0, quota - usage);

    return {
      usage,
      quota,
      percentUsed,
      availableBytes,
    };
  } catch {
    return null;
  }
}

/**
 * Returns a comprehensive status report for diagnostics and UI indicators.
 */
export async function getStoragePersistenceStatus(): Promise<StoragePersistenceStatus> {
  const supported = isPersistenceSupported();
  const persisted = await isStoragePersisted();
  const estimate = await getStorageEstimate();

  let warning: string | null = null;
  if (!persisted) {
    warning =
      'Browser storage is best-effort and subject to eviction under disk pressure. Export project ZIPs periodically to maintain offline backups.';
  } else if (estimate && estimate.percentUsed > 85) {
    warning = `Browser storage is nearly full (${estimate.percentUsed.toFixed(1)}% used). Free space or export projects to avoid write errors.`;
  }

  return {
    isSupported: supported,
    isPersisted: persisted,
    estimate,
    warning,
  };
}

export const storagePersistenceService = {
  isPersistenceSupported,
  isStoragePersisted,
  requestStoragePersistence,
  getStorageEstimate,
  getStoragePersistenceStatus,
};

