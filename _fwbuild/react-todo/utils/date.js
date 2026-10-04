      /**
       * Date helpers for the task manager.
       *
       * Everything here works on plain `YYYY-MM-DD` strings rather than Date objects
       * so that a due date never drifts across a timezone boundary. `new Date('2026-03-04')`
       * is parsed as UTC midnight, which renders as the *previous* day for anyone west
       * of Greenwich. Splitting the string keeps the calendar day the user picked.
       */

      const pad = (n) => String(n).padStart(2, '0');

      /** Formats a Date as the `YYYY-MM-DD` string an <input type="date"> expects. */
      export const toDateInputValue = (date) =>
        date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());

      /** Today's calendar day, as a `YYYY-MM-DD` string. */
      export const todayInputValue = () => toDateInputValue(new Date());

      /** A date `days` from today. Negative values are in the past. */
      export const offsetInputValue = (days) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return toDateInputValue(d);
      };

      /** Splits a `YYYY-MM-DD` string into numbers without going through Date. */
      const parts = (value) => {
        const [y, m, d] = String(value).split('-').map(Number);
        return { y: y || 0, m: m || 0, d: d || 0 };
      };

      /** Whole days from today until `value`. Negative when the date has passed. */
      export const daysUntil = (value) => {
        if (!value) return null;
        const today = parts(todayInputValue());
        const target = parts(value);
        const todayUtc = Date.UTC(today.y, today.m - 1, today.d);
        const targetUtc = Date.UTC(target.y, target.m - 1, target.d);
        return Math.round((targetUtc - todayUtc) / 86400000);
      };

      /** True when a task's due date is strictly before today. */
      export const isOverdue = (value) => {
        const diff = daysUntil(value);
        return diff !== null && diff < 0;
      };

      const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      /** Short human label for a due date: "Today", "Tomorrow", "Mar 4", "Mar 4, 2025". */
      export const formatDueDate = (value) => {
        const diff = daysUntil(value);
        if (diff === null) return '';
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Tomorrow';
        if (diff === -1) return 'Yesterday';
        const { y, m, d } = parts(value);
        const thisYear = new Date().getFullYear();
        const base = MONTHS[m - 1] + ' ' + d;
        return y === thisYear ? base : base + ', ' + y;
      };

      /** Long form used by the `title` attribute so screen readers get the year. */
      export const describeDueDate = (value) => {
        const diff = daysUntil(value);
        if (diff === null) return '';
        const { y, m, d } = parts(value);
        const spelled = MONTHS[m - 1] + ' ' + d + ', ' + y;
        if (diff === 0) return 'Due today (' + spelled + ')';
        if (diff === 1) return 'Due tomorrow (' + spelled + ')';
        if (diff === -1) return 'Overdue by a day (' + spelled + ')';
        return diff < 0
          ? 'Overdue by ' + Math.abs(diff) + ' days (' + spelled + ')'
          : 'Due in ' + diff + ' days (' + spelled + ')';
      };

      /** ISO timestamp for a task's createdAt field, now. */
      export const nowStamp = () => new Date().toISOString();

      /** Monotonic-ish unique id. Prefixed so it never collides with a seeded id. */
      export const makeId = () =>
        't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);