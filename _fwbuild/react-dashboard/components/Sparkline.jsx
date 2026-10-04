      import { niceMax, clamp } from '../utils/format.js';

      /**
       * Sparkline for a KPI card.
       *
       * A minimal area chart: min/max are taken from the series, scaled into a 100x28
       * user-unit box, and emitted as a `<polyline>` plus a closed `<path>` for the
       * fill. The gradient id includes the title so several cards can coexist.
       */
      export default function Sparkline({ series, tone = 'accent', label }) {
        if (!series || series.length < 2) return null;

        const W = 100;
        const H = 28;
        const PAD = 2;

        const rawMin = Math.min(...series);
        const rawMax = Math.max(...series);
        // A flat series would divide by zero; give it a nominal band instead.
        const span = rawMax - rawMin || 1;

        const xFor = (i) => PAD + (i / (series.length - 1)) * (W - PAD * 2);
        const yFor = (v) => H - PAD - ((v - rawMin) / span) * (H - PAD * 2);

        const points = series.map((value, i) => xFor(i).toFixed(2) + ',' + yFor(value).toFixed(2));
        const areaPath =
          'M ' + xFor(0).toFixed(2) + ' ' + H +
          ' L ' + points.join(' L ') +
          ' L ' + xFor(series.length - 1).toFixed(2) + ' ' + H + ' Z';

        const lastX = xFor(series.length - 1);
        const lastY = yFor(series[series.length - 1]);

        return (
          <svg
            className={'spark spark--' + tone}
            viewBox={'0 0 ' + W + ' ' + H}
            preserveAspectRatio="none"
            role="img"
            aria-label={label}
          >
            <defs>
              <linearGradient id={'sparkFill-' + tone} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path d={areaPath} fill={'url(#sparkFill-' + tone + ')'} />
            <polyline points={points.join(' ')} fill="none" stroke="currentColor" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <circle className="spark__dot" cx={lastX} cy={lastY} r="1.8" vectorEffect="non-scaling-stroke" />
          </svg>
        );
      }

      /**
       * Horizontal share bar, used in the region breakdown.
       * Width comes from a native `<progress>` so no inline style is needed.
       */
      export function ShareBar({ percent, label, value }) {
        return (
          <div className="share">
            <div className="share__head">
              <span className="share__label">{label}</span>
              <span className="share__value">{value}</span>
            </div>
            <progress className="share__bar" max={100} value={clamp(percent, 0, 100)}
              aria-label={label + ': ' + percent + ' percent of revenue'} />
          </div>
        );
      }

      /**
       * Radial gauge used for one KPI. The arc is drawn with `stroke-dasharray` on a
       * `pathLength`-normalised circle, so the sweep is a pair of attributes.
       */
      export function Gauge({ percent, size = 54, stroke = 6, label }) {
        const R = (size - stroke) / 2;
        const C = 2 * Math.PI * R;

        return (
          <svg
            className="gauge"
            width={size}
            height={size}
            viewBox={'0 0 ' + size + ' ' + size}
            role="img"
            aria-label={label + ': ' + Math.round(percent) + ' percent of monthly target'}
          >
            <circle className="gauge__track" cx={size / 2} cy={size / 2} r={R} strokeWidth={stroke} fill="none" />
            <circle
              className="gauge__value"
              cx={size / 2}
              cy={size / 2}
              r={R}
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray="100"
              strokeDashoffset={String(100 - clamp(percent, 0, 100))}
              transform={'rotate(-90 ' + size / 2 + ' ' + size / 2 + ')'}
            />
            <text className="gauge__text" x="50%" y="50%" textAnchor="middle" dy="0.35em">
              {Math.round(percent)}%
            </text>
          </svg>
        );
      }

      /** Axis-bound helper re-exported for the main chart. */
      export { niceMax };