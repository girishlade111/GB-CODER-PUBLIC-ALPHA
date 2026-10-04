      /** Number, currency and date formatting shared by every dashboard component. */

      const GBP = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        maximumFractionDigits: 0,
      });

      const GBP_PENCE = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      const COMPACT = new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 });

      /** Compact currency for chart axes: 1.2M, 340k, 900. */
      export function compactCurrency(value) {
        if (Math.abs(value) >= 1000000) return '£' + (value / 1000000).toFixed(1) + 'M';
        if (Math.abs(value) >= 1000) return '£' + Math.round(value / 1000) + 'k';
        return '£' + value;
      }

      /** Compact plain number, for the sparkline axes. */
      export function compactNumber(value) {
        return COMPACT.format(value);
      }

      export const fullCurrency = (value) => GBP.format(value);
      export const penceCurrency = (value) => GBP_PENCE.format(value);

      /** Applies a KPI's declared `format` to its value. */
      export function formatKpi(format, value) {
        if (format === 'currency') return fullCurrency(value);
        if (format === 'percent') return value.toFixed(2) + '%';
        return new Intl.NumberFormat('en-GB').format(value);
      }

      /** Signed percentage with a fixed sign, e.g. "+7.2%" / "-0.6%". */
      export function signedPercent(value) {
        const rounded = Math.round(value * 10) / 10;
        return (rounded > 0 ? '+' : rounded < 0 ? '-' : '') + Math.abs(rounded).toFixed(1) + '%';
      }

      /** `2026-03-18` -> "18 Mar 2026". Parsed as text to dodge the UTC day shift. */
      export function formatDate(iso) {
        const [y, m, d] = String(iso).split('-').map(Number);
        const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return d + ' ' + MONTHS[m - 1] + ' ' + y;
      }

      /** Clamp helper, used by the chart's scale maths. */
      export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

      /**
       * Rounds a raw maximum up to a friendly axis bound, so gridlines land on round
       * numbers instead of 247,318.
       */
      export function niceMax(value) {
        if (value <= 0) return 1;
        const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
        const normalised = value / magnitude;
        const step = normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 2.5 ? 2.5 : normalised <= 5 ? 5 : 10;
        return step * magnitude;
      }