      import { useCallback, useEffect, useRef, useState } from 'react';

      /**
       * State that mirrors itself into localStorage on every change.
       *
       * Two details matter for a playground:
       *
       *  1. The first render uses the caller's initial value, never localStorage.
       *     Reading storage during render would make the markup depend on a side
       *     channel and breaks anything that assumes a stable first paint.
       *  2. Writes are guarded. localStorage throws in private-mode Safari and when a
       *     sandboxed iframe is out of quota, and a throw inside a useEffect would
       *     take the whole tree down.
       */

      /** Reads and validates a stored value, falling back on anything unusable. */
      const readStored = (key, revive) => {
        try {
          const raw = window.localStorage.getItem(key);
          if (raw === null) return undefined;
          return revive(JSON.parse(raw));
        } catch {
          return undefined;
        }
      };

      /**
       * @param {string} key            localStorage key
       * @param {unknown} initialValue  value used until storage has been read
       * @param {(raw: unknown) => boolean} [isValid]  shape guard for restored data
       */
      export function useLocalStorage(key, initialValue, isValid) {
        const [value, setValue] = useState(initialValue);
        const [hydrated, setHydrated] = useState(false);
        const keyRef = useRef(key);
        keyRef.current = key;

        // Hydrate once, after the first paint. `hydrated` gates the writer so we
        // never write the initial value back over data we have not read yet.
        useEffect(() => {
          const stored = readStored(keyRef.current, (raw) => raw);
          if (stored !== undefined && (typeof isValid !== 'function' || isValid(stored))) {
            setValue(stored);
          }
          setHydrated(true);
        }, []);

        useEffect(() => {
          if (!hydrated) return;
          try {
            window.localStorage.setItem(keyRef.current, JSON.stringify(value));
          } catch {
            /* quota exceeded or storage disabled - state still works in memory */
          }
        }, [value, hydrated]);

        const reset = useCallback(() => {
          setValue(initialValue);
        }, [initialValue]);

        return [value, setValue, { hydrated, reset }];
      }