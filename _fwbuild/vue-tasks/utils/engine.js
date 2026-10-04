      import { priorityWeight, today } from '../data/seed.js';

      /**
       * Pure filtering, sorting and scoring.
       *
       * Nothing in here knows about Vue. `useTasks` passes plain values in and gets
       * plain arrays back, which keeps the rules testable and the component thin.
       */

      /** Comparators, keyed by sort id. `created` is inverted so "newest first" wins. */
      const SORTERS = {
        created: (a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0),
        alpha: (a, b) => a.title.localeCompare(b.title),
        priority: (a, b) => priorityWeight(b.priority) - priorityWeight(a.priority) || (a.createdAt < b.createdAt ? 1 : -1),
        due: (a, b) => {
          // Tasks without a due date sort to the end, not to 1970.
          if (!a.due && !b.due) return 0;
          if (!a.due) return 1;
          if (!b.due) return -1;
          return a.due < b.due ? -1 : a.due > b.due ? 1 : 0;
        },
      };

      /** Applies status filter, search, tag scope, then sorts. Returns a new array. */
      export function selectVisible(tasks, options) {
        const filter = options.filter || 'all';
        const query = String(options.query || '').trim().toLowerCase();
        const tag = options.tag && options.tag !== 'all' ? options.tag : null;
        const sort = options.sort || 'created';

        const filtered = tasks.filter((task) => {
          if (filter === 'active' && task.done) return false;
          if (filter === 'done' && !task.done) return false;
          if (tag && !task.tags.includes(tag)) return false;
          if (!query) return true;
          const haystack = (task.title + ' ' + task.note + ' ' + task.tags.join(' ')).toLowerCase();
          return haystack.includes(query);
        });

        const comparator = SORTERS[sort] || SORTERS.created;
        return filtered.slice().sort(comparator);
      }

      /** Headline numbers for the stats panel. Runs over every task, not the view. */
      export function summarise(tasks) {
        let done = 0;
        let overdue = 0;
        const now = today();

        for (const task of tasks) {
          if (task.done) done += 1;
          else if (task.due && task.due < now) overdue += 1;
        }

        const total = tasks.length;
        const open = total - done;
        const percent = total === 0 ? 0 : Math.round((done / total) * 100);

        return { total, done, open, overdue, percent };
      }

      /** Whole days from today until an ISO `YYYY-MM-DD` string. */
      export function daysUntil(value) {
        if (!value) return null;
        const now = today();
        const [ay, am, ad] = now.split('-').map(Number);
        const [by, bm, bd] = value.split('-').map(Number);
        const a = Date.UTC(ay, am - 1, ad);
        const b = Date.UTC(by, bm - 1, bd);
        return Math.round((b - a) / 86400000);
      }

      export const isOverdue = (value) => {
        const diff = daysUntil(value);
        return diff !== null && diff < 0;
      };

      const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      /** "Today", "Tomorrow", "Mar 4", or "Mar 4, 2025" for a different year. */
      export function dueLabel(value) {
        const diff = daysUntil(value);
        if (diff === null) return '';
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Tomorrow';
        if (diff === -1) return 'Yesterday';

        const [y, m, d] = value.split('-').map(Number);
        const base = MONTHS[m - 1] + ' ' + d;
        return y === new Date().getFullYear() ? base : base + ', ' + y;
      }

      /** Longer phrasing for the accessible title on a due-date chip. */
      export function dueDescription(value) {
        const diff = daysUntil(value);
        if (diff === null) return '';
        if (diff === 0) return 'Due today';
        if (diff === 1) return 'Due tomorrow';
        if (diff < 0) return 'Overdue by ' + Math.abs(diff) + ' day' + (Math.abs(diff) === 1 ? '' : 's');
        return 'Due in ' + diff + ' days';
      }

      /** Tone for a due-date chip, given whether the task is done. */
      export function dueTone(value, done) {
        if (done || !value) return 'none';
        const diff = daysUntil(value);
        if (diff === null) return 'none';
        if (diff < 0) return 'overdue';
        if (diff === 0) return 'today';
        if (diff <= 2) return 'soon';
        return 'later';
      }

      /**
       * Completion over the last seven days, for the small sparkline in the stats
       * panel. Derived from the tasks' createdAt dates so it is real data rather than
       * decoration - though with only seed data it is intentionally sparse.
       */
      export function recentTrend(tasks) {
        const buckets = new Array(7).fill(0);
        const now = new Date();
        for (const task of tasks) {
          const created = new Date(task.createdAt);
          if (Number.isNaN(created.getTime())) continue;
          const age = Math.round((now - created) / 86400000);
          if (age >= 0 && age < 7) buckets[6 - age] += task.done ? 1 : 0;
        }
        return buckets;
      }