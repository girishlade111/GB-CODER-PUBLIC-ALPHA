      /**
       * Seed data and shared constants for the Vue task manager.
       *
       * Static, like everything else here - no fetch, no network. Due dates are
       * relative to today so the overdue, due-today and no-date states are all
       * represented the first time the template runs.
       */

      const pad = (n) => String(n).padStart(2, '0');

      /** `YYYY-MM-DD` for a date `days` from today. */
      export const dayOffset = (days) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
      };

      export const today = () => dayOffset(0);

      export const PRIORITIES = [
        { id: 'high', label: 'High', weight: 3 },
        { id: 'medium', label: 'Medium', weight: 2 },
        { id: 'low', label: 'Low', weight: 1 },
      ];

      export const priorityWeight = (id) => {
        const found = PRIORITIES.find((p) => p.id === id);
        return found ? found.weight : 0;
      };

      export const priorityLabel = (id) => {
        const found = PRIORITIES.find((p) => p.id === id);
        return found ? found.label : 'Medium';
      };

      export const normalisePriority = (id) =>
        PRIORITIES.some((p) => p.id === id) ? id : 'medium';

      export const MAX_TITLE = 110;

      /** Filters, in the order they appear in the toolbar. */
      export const FILTERS = [
        { id: 'all', label: 'All' },
        { id: 'active', label: 'Open' },
        { id: 'done', label: 'Done' },
      ];

      export const SORTS = [
        { id: 'created', label: 'Newest first' },
        { id: 'due', label: 'Due date' },
        { id: 'priority', label: 'Priority' },
        { id: 'alpha', label: 'A to Z' },
      ];

      let counter = 0;

      /** Monotonic id. The prefix keeps it distinct from anything we seed. */
      export const makeId = () => 'vt' + Date.now().toString(36) + (counter++).toString(36);

      /** Shape guard for data restored from localStorage. */
      export const isTaskList = (value) =>
        Array.isArray(value) && value.every((t) => t && typeof t.id === 'string' && typeof t.title === 'string');

      /** Builds a well-formed task from partial input. */
      export const makeTask = (draft) => ({
        id: draft.id || makeId(),
        title: String(draft.title || '').trim().slice(0, MAX_TITLE),
        note: String(draft.note || '').trim().slice(0, 240),
        priority: normalisePriority(draft.priority),
        due: draft.due || '',
        tags: Array.isArray(draft.tags) ? draft.tags.slice(0, 5) : [],
        done: Boolean(draft.done),
        createdAt: draft.createdAt || new Date().toISOString(),
      });

      /** First-run tasks. Realistic work, real-looking names. */
      export const SEED_TASKS = [
        makeTask({
          title: 'Split the settings page into route-level chunks',
          note: 'Bundle is 480 kB. Lazy-load the integrations tab first.',
          priority: 'high',
          due: dayOffset(0),
          tags: ['perf', 'frontend'],
          createdAt: '2026-03-02T08:14:00.000Z',
        }),
        makeTask({
          title: 'Fix the flaky avatar upload spec',
          note: 'Fails about one run in six on CI. Probably a timing issue on the read.',
          priority: 'high',
          due: dayOffset(-1),
          tags: ['bug', 'tests'],
          createdAt: '2026-03-02T11:02:00.000Z',
        }),
        makeTask({
          title: 'Draft the release notes for 4.2',
          note: 'Cover the new audit log, the CSV importer and the two breaking renames.',
          priority: 'medium',
          due: dayOffset(3),
          tags: ['docs', 'release'],
          createdAt: '2026-03-03T09:41:00.000Z',
        }),
        makeTask({
          title: 'Rotate the staging database credentials',
          note: 'Quarterly rotation. Update the deploy pipeline secrets at the same time.',
          priority: 'medium',
          due: dayOffset(6),
          tags: ['infra'],
          createdAt: '2026-03-03T14:27:00.000Z',
        }),
        makeTask({
          title: 'Record a two-minute walkthrough of the importer',
          note: 'For the help centre. Screen capture plus voiceover.',
          priority: 'low',
          due: '',
          tags: ['docs'],
          createdAt: '2026-03-04T08:05:00.000Z',
        }),
        makeTask({
          title: 'Delete the unused Sentry projects',
          note: 'mobile-legacy and canary-2025. Check the retention rules first.',
          priority: 'low',
          due: dayOffset(11),
          tags: ['infra', 'cleanup'],
          done: true,
          createdAt: '2026-02-26T16:52:00.000Z',
        }),
        makeTask({
          title: 'Ship the audit log retention notice to customers',
          note: 'Sent to the 214 accounts on the affected plans.',
          priority: 'medium',
          due: dayOffset(-4),
          tags: ['release'],
          done: true,
          createdAt: '2026-02-25T10:30:00.000Z',
        }),
      ];

      /** Tag vocabulary offered as quick-add chips. */
      export const TAG_LIBRARY = ['bug', 'frontend', 'backend', 'docs', 'infra', 'release', 'perf', 'tests'];