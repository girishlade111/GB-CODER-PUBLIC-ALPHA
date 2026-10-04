      /** Status and trend badges. One component so colour and wording never drift. */

      const STATUS_TONES = {
        fulfilled: { label: 'Fulfilled', tone: 'success' },
        processing: { label: 'Processing', tone: 'info' },
        'on-hold': { label: 'On hold', tone: 'warn' },
        refunded: { label: 'Refunded', tone: 'muted' },
        failed: { label: 'Failed', tone: 'danger' },
        active: { label: 'Active', tone: 'success' },
        trialing: { label: 'Trialing', tone: 'info' },
        overdue: { label: 'Overdue', tone: 'danger' },
      };

      const DEFAULT_STATUS = { label: 'Unknown', tone: 'muted' };

      export default function Badge({ status, children, dot = false }) {
        const meta = STATUS_TONES[status] || DEFAULT_STATUS;

        return (
          <span className={'badge badge--' + meta.tone}>
            {dot ? <span className="badge__dot" aria-hidden="true" /> : null}
            {children || meta.label}
          </span>
        );
      }

      /**
       * Trend pill for a KPI. `delta` is a signed percentage; the arrow glyph is an
       * inline SVG rather than a character so it inherits the text colour exactly.
       */
      export function DeltaBadge({ delta, label, tone }) {
        const positive = delta >= 0;
        const direction = positive ? 'up' : 'down';
        // An explicit tone override wins; otherwise the sign decides.
        const resolved = tone || (positive ? 'success' : 'danger');

        return (
          <span className={'delta delta--' + resolved}>
            <svg className="delta__arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              {direction === 'up' ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
            </svg>
            {positive ? '+' : ''}
            {Math.abs(Math.round(delta * 10) / 10).toFixed(1)}%
            {label ? <span className="delta__label">{label}</span> : null}
            <span className="sr-only">{positive ? ' increase' : ' decrease'}</span>
          </span>
        );
      }