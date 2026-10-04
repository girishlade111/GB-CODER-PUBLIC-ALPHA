      /**
       * Animated weather icons, drawn as inline SVG.
       *
       * Each icon is a small composition of the same primitives - a sun disc, a cloud
       * outline, precipitation marks - so they share a stroke weight and optical size.
       * Animation is CSS-only (rotating rays, falling drops, drifting fog) and is
       * switched off wholesale under `prefers-reduced-motion`.
       */

      const Sun = ({ className = '' }) => (
        <g className={'wx-sun ' + className}>
          <circle cx="12" cy="12" r="4.6" className="wx-sun__disc" />
          <g className="wx-sun__rays">
            <line x1="12" y1="1.6" x2="12" y2="4.4" />
            <line x1="12" y1="19.6" x2="12" y2="22.4" />
            <line x1="1.6" y1="12" x2="4.4" y2="12" />
            <line x1="19.6" y1="12" x2="22.4" y2="12" />
            <line x1="4.6" y1="4.6" x2="6.6" y2="6.6" />
            <line x1="17.4" y1="17.4" x2="19.4" y2="19.4" />
            <line x1="4.6" y1="19.4" x2="6.6" y2="17.4" />
            <line x1="17.4" y1="6.6" x2="19.4" y2="4.6" />
          </g>
        </g>
      );

      const Moon = ({ className = '' }) => (
        <path
          className={'wx-moon ' + className}
          d="M20.4 14.6A8.6 8.6 0 0 1 9.4 3.6a8.6 8.6 0 1 0 11 11Z"
        />
      );

      const Cloud = ({ className = '' }) => (
        <path
          className={'wx-cloud ' + className}
          d="M7.2 19h9.6a4.2 4.2 0 0 0 .5-8.37A6 6 0 0 0 6.1 12.2 3.4 3.4 0 0 0 7.2 19Z"
        />
      );

      const Drops = ({ count = 3, className = '' }) => (
        <g className={'wx-drops ' + className}>
          {Array.from({ length: count }, (_, i) => (
            <line
              key={i}
              x1={9 + i * 3.2}
              y1="20.4"
              x2={8 + i * 3.2}
              y2="22.8"
              className={'wx-drop wx-drop--' + (i % 3)}
            />
          ))}
        </g>
      );

      const Flakes = ({ className = '' }) => (
        <g className={'wx-flakes ' + className}>
          {Array.from({ length: 3 }, (_, i) => (
            <g key={i} className={'wx-flake wx-flake--' + (i % 3)} transform={'translate(' + (9.5 + i * 3.2) + ' 21.4)'}>
              <line x1="-1.5" y1="0" x2="1.5" y2="0" />
              <line x1="0" y1="-1.5" x2="0" y2="1.5" />
              <line x1="-1.1" y1="-1.1" x2="1.1" y2="1.1" />
              <line x1="-1.1" y1="1.1" x2="1.1" y2="-1.1" />
            </g>
          ))}
        </g>
      );

      const Bolt = ({ className = '' }) => (
        <path className={'wx-bolt ' + className} d="M13 19.5 9.6 22l.9-4.6-3.4.4L11 9.5l-.7 4.2 2.9-1.3Z" />
      );

      const FogBars = ({ className = '' }) => (
        <g className={'wx-fog ' + className}>
          <line className="wx-fog__bar wx-fog__bar--1" x1="4.5" y1="18" x2="19.5" y2="18" />
          <line className="wx-fog__bar wx-fog__bar--2" x1="6.5" y1="21" x2="17.5" y2="21" />
        </g>
      );

      const WindLines = ({ className = '' }) => (
        <g className={'wx-wind ' + className}>
          <path className="wx-wind__line wx-wind__line--1" d="M3 9h9.5a2.6 2.6 0 1 0-2.5-3.2" />
          <path className="wx-wind__line wx-wind__line--2" d="M3 13.5h13a2.8 2.8 0 1 1-2.7 3.4" />
          <path className="wx-wind__line wx-wind__line--3" d="M3 18h6" />
        </g>
      );

      const ICONS = {
        clear: (night) => (night ? <Moon className="wx-icon__moon" /> : <Sun className="wx-icon__sun" />),
        partly: (night) => (
          <>
            <Sun className="wx-icon__sun wx-icon__sun--partly" />
            <Cloud className="wx-icon__cloud wx-icon__cloud--front" />
          </>
        ),
        cloudy: () => (
          <>
            <Cloud className="wx-icon__cloud wx-icon__cloud--back" />
            <Cloud className="wx-icon__cloud wx-icon__cloud--front" />
          </>
        ),
        overcast: () => (
          <>
            <Cloud className="wx-icon__cloud wx-icon__cloud--back" />
            <Cloud className="wx-icon__cloud wx-icon__cloud--mid" />
            <Cloud className="wx-icon__cloud wx-icon__cloud--front" />
          </>
        ),
        rain: () => (
          <>
            <Cloud className="wx-icon__cloud wx-icon__cloud--front" />
            <Drops count={3} />
          </>
        ),
        drizzle: () => (
          <>
            <Cloud className="wx-icon__cloud wx-icon__cloud--front" />
            <Drops count={2} />
          </>
        ),
        heavyrain: () => (
          <>
            <Cloud className="wx-icon__cloud wx-icon__cloud--front" />
            <Drops count={3} className="wx-drops--heavy" />
          </>
        ),
        thunder: () => (
          <>
            <Cloud className="wx-icon__cloud wx-icon__cloud--front" />
            <Bolt />
          </>
        ),
        snow: () => (
          <>
            <Cloud className="wx-icon__cloud wx-icon__cloud--front" />
            <Flakes />
          </>
        ),
        fog: () => (
          <>
            <Cloud className="wx-icon__cloud wx-icon__cloud--front" />
            <FogBars />
          </>
        ),
        wind: () => (
          <>
            <Cloud className="wx-icon__cloud wx-icon__cloud--front" />
            <WindLines />
          </>
        ),
      };

      /**
       * @param {object} props
       * @param {string} props.icon    key from the ICONS table
       * @param {boolean} [props.night] swap clear-sky sun for a moon
       * @param {number} [props.size]   rendered box in px
       */
      export default function WeatherIcon({ icon, night = false, size = 96, className = '' }) {
        const render = ICONS[icon] || ICONS.partly;

        return (
          <svg
            className={'wx-icon ' + className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            {render(night)}
          </svg>
        );
      }

      export const hasIcon = (name) => Object.prototype.hasOwnProperty.call(ICONS, name);