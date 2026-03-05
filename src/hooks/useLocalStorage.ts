import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return initialValue;
      try {
        return JSON.parse(item);
      } catch {
        // Handle legacy values written as raw strings (not JSON-encoded)
        return item as unknown as T;
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Dispatch a custom event so other hook instances with the same key stay in sync
        window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key } }));
        return valueToStore;
      });
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  // Listen for changes from other hook instances using the same key
  useEffect(() => {
    const handleChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.key === key) {
        try {
          const item = window.localStorage.getItem(key);
          if (item !== null) {
            try {
              setStoredValue(JSON.parse(item));
            } catch {
              setStoredValue(item as unknown as T);
            }
          }
        } catch (error) {
          console.error(`Error syncing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener('local-storage-change', handleChange);
    return () => window.removeEventListener('local-storage-change', handleChange);
  }, [key]);

  return [storedValue, setValue] as const;
}