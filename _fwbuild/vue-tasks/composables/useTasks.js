      import { computed, ref, watch } from 'vue';
      import { isTaskList, makeTask, SEED_TASKS } from '../data/seed.js';
      import { selectVisible, summarise } from '../utils/engine.js';

      /**
       * All task state, as a composable.
       *
       * Vue's reactivity does the work here that `useMemo` did in the React version:
       * `visible`, `stats` and `tagCounts` are computed, so they are cached and only
       * recomputed when the values they read actually change.
       *
       * Persistence is a `watch` with `deep: true` rather than an effect, because the
       * task array is replaced wholesale on every mutation - there is no field-level
       * patching to miss.
       */

      const STORAGE_KEY = 'gbcoder.vue-tasks.tasks.v1';

      /** Reads storage once, tolerating a disabled or full store. */
      function loadTasks() {
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (!raw) return SEED_TASKS;
          const parsed = JSON.parse(raw);
          return isTaskList(parsed) ? parsed : SEED_TASKS;
        } catch {
          return SEED_TASKS;
        }
      }

      export function useTasks() {
        const tasks = ref(loadTasks());

        // View state. `reactive` would work too, but these are independent flags, and
        // separate refs make each one trivially writable from a template.
        const filter = ref('all');
        const query = ref('');
        const sort = ref('created');
        const tag = ref('all');
        const editingId = ref(null);
        const loading = ref(true);
        const toast = ref(null);

        let toastTimer = null;

        /* -- Persistence ------------------------------------------- */
        watch(
          tasks,
          (value) => {
            try {
              window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
            } catch {
              /* quota or private mode - the app still works in memory */
            }
            loading.value = false;
          },
          { deep: true },
        );

        /* -- Derived ----------------------------------------------- */
        const visible = computed(() =>
          selectVisible(tasks.value, {
            filter: filter.value,
            query: query.value,
            sort: sort.value,
            tag: tag.value,
          }),
        );

        const stats = computed(() => summarise(tasks.value));

        const tagCounts = computed(() => {
          const counts = new Map();
          for (const task of tasks.value) {
            for (const t of task.tags) counts.set(t, (counts.get(t) || 0) + 1);
          }
          return Array.from(counts, ([id, count]) => ({ id, count })).sort(
            (a, b) => b.count - a.count || a.id.localeCompare(b.id),
          );
        });

        const isSearching = computed(() => query.value.trim().length > 0 || tag.value !== 'all');

        /* -- Mutations --------------------------------------------- */
        function addTask(draft) {
          const task = makeTask(draft);
          tasks.value = [task, ...tasks.value];
          return task;
        }

        function toggle(id) {
          tasks.value = tasks.value.map((task) =>
            task.id === id ? { ...task, done: !task.done } : task,
          );
        }

        function remove(id) {
          const index = tasks.value.findIndex((task) => task.id === id);
          if (index === -1) return;

          const removed = tasks.value[index];
          tasks.value = tasks.value.filter((task) => task.id !== id);
          if (editingId.value === id) editingId.value = null;

          notify('Removed "' + removed.title + '"', removed);
        }

        function update(id, patch) {
          const title = patch.title === undefined ? undefined : String(patch.title).trim();
          // A blank title is a rejected edit rather than an empty task.
          if (title === '') return;

          tasks.value = tasks.value.map((task) => {
            if (task.id !== id) return task;
            const next = { ...task, ...patch };
            if (title !== undefined) next.title = title.slice(0, 110);
            next.priority = patch.priority || task.priority;
            return next;
          });
        }

        function toggleTag(id, name) {
          tasks.value = tasks.value.map((task) => {
            if (task.id !== id) return task;
            const has = task.tags.includes(name);
            const tags = has ? task.tags.filter((t) => t !== name) : task.tags.concat(name).slice(0, 5);
            return { ...task, tags };
          });
        }

        function clearCompleted() {
          const removed = tasks.value.filter((task) => task.done);
          tasks.value = tasks.value.filter((task) => !task.done);
          if (removed.length) notify('Cleared ' + removed.length + ' completed', removed[0]);
        }

        function toggleAll() {
          const allDone = tasks.value.length > 0 && tasks.value.every((task) => task.done);
          tasks.value = tasks.value.map((task) => ({ ...task, done: !allDone }));
        }

        function move(id, direction) {
          const index = tasks.value.findIndex((task) => task.id === id);
          if (index === -1) return;
          const target = index + direction;
          if (target < 0 || target >= tasks.value.length) return;

          const next = tasks.value.slice();
          const [moved] = next.splice(index, 1);
          next.splice(target, 0, moved);
          tasks.value = next;
        }

        function undo() {
          if (!toast.value) return;
          const items = toast.value.items;
          toast.value = null;
          window.clearTimeout(toastTimer);
          // Restore into their original positions so the list order is what it was.
          for (const { task, index } of items.slice().reverse()) {
            const next = tasks.value.slice();
            if (next.some((t) => t.id === task.id)) continue;
            next.splice(Math.min(index, next.length), 0, task);
            tasks.value = next;
          }
        }

        function notify(message, ...items) {
          window.clearTimeout(toastTimer);
          const current = tasks.value;
          const entries = items.map((task) => ({ task, index: current.indexOf(task) }));
          toast.value = { message, items: entries.filter((entry) => entry.index !== -1) };
          toastTimer = window.setTimeout(() => {
            toast.value = null;
          }, 7000);
        }

        function dismissToast() {
          window.clearTimeout(toastTimer);
          toast.value = null;
        }

        function resetFilters() {
          filter.value = 'all';
          query.value = '';
          tag.value = 'all';
        }

        return {
          tasks,
          visible,
          stats,
          tagCounts,
          isSearching,
          filter,
          query,
          sort,
          tag,
          editingId,
          loading,
          toast,
          addTask,
          update,
          toggle,
          remove,
          toggleTag,
          clearCompleted,
          toggleAll,
          move,
          undo,
          dismissToast,
          resetFilters,
        };
      }