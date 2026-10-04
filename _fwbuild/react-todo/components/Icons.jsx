      /**
       * Inline SVG icon set.
       *
       * No icon library, no emoji. Every glyph is a 24x24 stroked path using
       * `currentColor`, so an icon always matches the text colour of its container and
       * can be resized from CSS alone.
       */

      const PATHS = {
        plus: 'M12 5v14M5 12h14',
        check: 'm20 6-11 11-5-5',
        trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
        pencil: 'm4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20ZM13.5 6.5l3 3',
        close: 'M6 6l12 12M18 6 6 18',
        chevronUp: 'm6 15 6-6 6 6',
        chevronDown: 'm6 9 6 6 6-6',
        arrowUp: 'M12 20V4M6 10l6-6 6 6',
        arrowDown: 'M12 4v16M6 14l6 6 6-6',
        search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3',
        inbox: 'M4 13h4l2 3h4l2-3h4M4 13 6.5 5h11L20 13v6H4v-6Z',
        calendar: 'M4 7h16v14H4zM4 11h16M8 4v4M16 4v4',
        flag: 'M6 21V4M6 5h11l-2 3 2 3H6',
        layers: 'm12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5',
        undo: 'M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3',
        bolt: 'M13 2 3 14h8l-1 8 10-12h-8l1-8Z',
        tag: 'M3 12V4h8l10 10-8 8L3 12ZM7 7h.01',
        note: 'M5 4h9l5 5v11H5zM14 4v5h5M8 13h8M8 17h5',
        target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
        chart: 'M3 3v18h18M7 15v-4M12 15V8M17 15v-6',
      };

      /**
       * @param {object} props
       * @param {keyof PATHS} props.name
       * @param {string} [props.className] extra class, usually for sizing
       */
      export default function Icon({ name, className = '', size = 18 }) {
        const d = PATHS[name];
        if (!d) return null;

        return (
          <svg
            className={'icon ' + className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d={d} />
          </svg>
        );
      }

      export const ICON_NAMES = Object.keys(PATHS);