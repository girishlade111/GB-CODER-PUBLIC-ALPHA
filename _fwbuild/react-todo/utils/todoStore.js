      import { makeId, nowStamp, offsetInputValue } from './date.js';

      /**
       * The task manager's domain layer: plain data, plain functions.
       *
       * Nothing here touches React. Keeping filtering, sorting and scoring outside the
       * component tree means the rules are readable in one screen and the components
       * stay presentational.
       */

      /** Priority is ordered, not just labelled - `weight` is what sorting uses. */
      export const PRIORITIES = [
        { id: 'high', label: 'High', weight: 3 },
        { id: 'medium', label: 'Medium', weight: 2 },
        { id: 'low', label: 'Low', weight: 1 },
      ];

      export const PRIORITY_IDS = PRIORITIES.map((p) => p.id);
      export const DEFAULT_PRIORITY = 'medium';

      /** Weight lookup, so `priorityWeight('high')` never throws on bad data. */
      export const priorityWeight = (id) => {
        const found = PRIORITIES.find((p) => p.id === id);
        return found ? found.weight : 0;
      };

      export const priorityLabel = (id) => {
        const found = PRIORITIES.find((p) => p.id === id);
        return found ? found.label : 'Medium';
      };

      /** Normalises anything a `<select>` or a restored blob can hand us. */
      export const normalisePriority = (id) =>
        PRIORITY_IDS.indexOf(id) === -1 ? DEFAULT_PRIORITY : id;

      export const FILTERS = [
        { id: 'all', label: 'All' },
        { id: 'active', label: 'Active' },
        { id: 'completed', label: 'Completed' },
      ];

      export const SORTS = [
        { id: 'created', label: 'Newest first' },
        { id: 'due', label: 'Due date' },
        { id: 'priority', label: 'Priority' },
        { id: 'alpha', label: 'A to Z' },
      ];

      export const MAX_TITLE = 120;
      export const MAX_NOTES = 400;

      /** Tags offered in the form. Any other tag typed in the field is still accepted. */
      export const TAG_LIBRARY = [
        'frontend',
        'backend',
        'design',
        'infra',
        'bug',
        'docs',
        'release',
        'research',
      ];

      const slugTag = (raw) =>
        String(raw)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 18);

      /** Splits a comma-separated tag string into a clean, de-duplicated list. */
      export const parseTags = (raw) => {
        if (Array.isArray(raw)) return raw.map(slugTag).filter(Boolean);
        return String(raw || '')
          .split(',')
          .map(slugTag)
          .filter(Boolean)
          .filter((tag, i, all) => all.indexOf(tag) === i)
          .slice(0, 6);
      };

      /** Builds a well-formed task from form state, filling in defaults. */
      export const createTask = (draft) => {
        const title = String(draft.title || '').trim();
        return {
          id: draft.id || makeId(),
          title: title.slice(0, MAX_TITLE),
          notes: String(draft.notes || '').trim().slice(0, MAX_NOTES),
          priority: normalisePriority(draft.priority),
          due: draft.due || '',
          tags: parseTags(draft.tags),
          completed: Boolean(draft.completed),
          createdAt: draft.createdAt || nowStamp(),
          updatedAt: nowStamp(),
        };
      };

      /** Shape guard for data restored from localStorage. */
      export const isTaskArray = (raw) =>
        Array.isArray(raw) &&
        raw.every((t) => t && typeof t.id === 'string' && typeof t.title === 'string');

      /**
       * `created` sorts newest-first while every other sort is ascending, so the
       * comparator is written as "sign of the difference" rather than raw compare.
       */
      const SORTERS = {
        created: (a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0),
        alpha: (a, b) => a.title.localeCompare(b.title),
        priority: (a, b) =>
          priorityWeight(b.priority) - priorityWeight(a.priority) ||
          (a.createdAt < b.createdAt ? 1 : -1),
        due: (a, b) => {
          // No due date sorts to the end rather than to 1970.
          if (!a.due && !b.due) return 0;
          if (!a.due) return 1;
          if (!b.due) return -1;
          return a.due < b.due ? -1 : a.due > b.due ? 1 : 0;
        },
      };

      /** Applies status filter, free-text search and tag scoping, then sorts. */
      export function selectVisibleTasks(tasks, options) {
        const filter = options.filter || 'all';
        const query = String(options.query || '').trim().toLowerCase();
        const tag = options.tag && options.tag !== 'all' ? options.tag : null;
        const sort = options.sort || 'created';

        const filtered = tasks.filter((task) => {
          if (filter === 'active' && task.completed) return false;
          if (filter === 'completed' && !task.completed) return false;
          if (tag && task.tags.indexOf(tag) === -1) return false;
          if (!query) return true;
          const haystack =
            task.title.toLowerCase() +
            ' ' +
            task.notes.toLowerCase() +
            ' ' +
            task.tags.join(' ');
          return haystack.indexOf(query) !== -1;
        });

        const comparator = SORTERS[sort] || SORTERS.created;
        return filtered.slice().sort(comparator);
      }

      /** Headline numbers for the stats bar. Computed over *all* tasks, not the view. */
      export function summarise(tasks) {
        let completed = 0;
        let overdue = 0;
        const today = new Date().toISOString().slice(0, 10);

        for (const task of tasks) {
          if (task.completed) completed += 1;
          else if (task.due && task.due < today) overdue += 1;
        }

        const total = tasks.length;
        const active = total - completed;
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

        return { total, completed, active, overdue, percent };
      }

      /** Every tag in use, ordered by frequency then alphabetically. */
      export function collectTags(tasks) {
        const counts = new Map();
        for (const task of tasks) {
          for (const tag of task.tags) counts.set(tag, (counts.get(tag) || 0) + 1);
        }
        return Array.from(counts.entries())
          .map(([id, count]) => ({ id, count }))
          .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
      }

      /**
       * First-run data. Due dates are relative to today so the overdue and
       * due-today states are both visible the moment the template loads.
       */
      export const SEED_TASKS = [
        createTask({
          title: 'Replace the checkout spinner with a skeleton',
          notes: 'Customers see a 2s blank card on slow 3G. Skeleton matches the real layout.',
          priority: 'high',
          due: offsetInputValue(0),
          tags: 'frontend,design',
          completed: false,
          createdAt: '2026-02-02T09:12:00.000Z',
        }),
        createTask({
          title: 'Backfill invoice_id on the ledger table',
          notes: 'Rows before 2024-06 are null. Backfill from the PDF archive, then add NOT NULL.',
          priority: 'high',
          due: offsetInputValue(-2),
          tags: 'backend,infra',
          completed: false,
          createdAt: '2026-02-04T14:41:00.000Z',
        }),
        createTask({
          title: 'Write the onboarding guide for new engineers',
          notes: 'Cover local setup, deploy train, and who to ping for what.',
          priority: 'low',
          due: offsetInputValue(9),
          tags: 'docs',
          completed: false,
          createdAt: '2026-02-06T11:03:00.000Z',
        }),
        createTask({
          title: 'Migrate session store off the single Redis node',
          notes: 'Move to the managed cluster, then cut over during the Tuesday window.',
          priority: 'medium',
          due: offsetInputValue(4),
          tags: 'infra,release',
          completed: false,
          createdAt: '2026-02-07T16:20:00.000Z',
        }),
        createTask({
          title: 'Audit colour contrast on the settings screens',
          notes: 'WCAG AA on the four toggle rows that failed in the last audit.',
          priority: 'medium',
          due: '',
          tags: 'frontend,design,bug',
          completed: true,
          createdAt: '2026-01-28T08:55:00.000Z',
        }),
        createTask({
          title: 'Prototype the offline queue for field inspections',
          notes: 'Two engineers, one week. Spike only - no production wiring yet.',
          priority: 'low',
          due: offsetInputValue(16),
          tags: 'research',
          completed: false,
          createdAt: '2026-01-30T13:37:00.000Z',
        }),
        createTask({
          title: 'Remove the deprecated /v1/reports endpoint',
          notes: 'Two internal callers left. Ping analytics before deleting.',
          priority: 'low',
          due: '',
          tags: 'backend',
          completed: true,
          createdAt: '2026-01-22T10:02:00.000Z',
        }),
      ];