      import { useEffect, useState } from 'react';

      /**
       * Subscribes to a media query and re-renders on change.
       *
       * The admin shell needs to know whether it is on a phone for two things: the
       * sidebar becomes a drawer under 1024px, and the table drops its status column.
       * Doing that with CSS alone would mean rendering two versions of the markup.
       */
      export function useMediaQuery(query) {
        const [matches, setMatches] = useState(() => {
          if (typeof window === 'undefined' || !window.matchMedia) return false;
          return window.matchMedia(query).matches;
        });

        useEffect(() => {
          if (typeof window === 'undefined' || !window.matchMedia) return undefined;

          const list = window.matchMedia(query);
          const onChange = (event) => setMatches(event.matches);

          // Re-read on subscribe: the viewport may have changed between render and effect.
          setMatches(list.matches);

          // Safari below 14 only has the deprecated listener API.
          if (typeof list.addEventListener === 'function') {
            list.addEventListener('change', onChange);
            return () => list.removeEventListener('change', onChange);
          }
          list.addListener(onChange);
          return () => list.removeListener(onChange);
        }, [query]);

        return matches;
      }

      /** True when the user has asked the OS to minimise animation. */
      export function usePrefersReducedMotion() {
        return useMediaQuery('(prefers-reduced-motion: reduce)');
      }