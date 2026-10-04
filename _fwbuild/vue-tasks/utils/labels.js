      /**
       * Small presentational constants and formatters.
       *
       * Split out from `data/seed.js` so a component that only needs a label does not
       * pull the seed dataset in with it.
       */

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

      export const PRIORITIES = [
        { id: 'high', label: 'High', weight: 3 },
        { id: 'medium', label: 'Medium', weight: 2 },
        { id: 'low', label: 'Low', weight: 1 },
      ];

      export const priorityLabel = (id) => {
        const found = PRIORITIES.find((p) => p.id === id);
        return found ? found.label : 'Medium';
      };

      /** Escapes nothing - Vue's `{{ }}` interpolation already escapes text. */
      export const MAX_TITLE = 110;