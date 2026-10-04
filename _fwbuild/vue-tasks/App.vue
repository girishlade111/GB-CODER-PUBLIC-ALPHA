      <script setup>
      import { computed, onBeforeUnmount, onMounted } from 'vue';
      import TaskForm from './components/TaskForm.vue';
      import TaskItem from './components/TaskItem.vue';
      import TaskFilters from './components/TaskFilters.vue';
      import TaskStats from './components/TaskStats.vue';
      import { useTasks } from './composables/useTasks.js';
      import { TAG_LIBRARY } from './data/seed.js';

      /**
       * Composition root.
       *
       * All state comes from one composable. The only things this component owns are
       * the Escape-to-dismiss handler and the derived handle for "the task currently
       * being edited".
       */
      const {
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
      } = useTasks();

      const editing = computed(() => tasks.value.find((task) => task.id === editingId.value) || null);

      /** Counts for the status pills, derived once rather than three times. */
      const pillCounts = computed(() => ({
        all: tasks.value.length,
        active: stats.value.open,
        done: stats.value.done,
      }));

      const libraryTags = TAG_LIBRARY;

      /** Escape closes the toast first, then the editor, then the open form. */
      const onKeydown = (event) => {
        if (event.key !== 'Escape') return;
        if (toast.value) {
          dismissToast();
          return;
        }
        if (editingId.value) editingId.value = null;
      };

      onMounted(() => document.addEventListener('keydown', onKeydown));
      onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));

      const startEdit = (id) => {
        editingId.value = id;
      };

      const saveEdit = (id, patch) => {
        update(id, patch);
        editingId.value = null;
      };
      </script>

      <template>
        <div class="app">
          <a class="skip-link" href="#task-list">Skip to the task list</a>

          <header class="topbar">
            <div class="topbar__brand">
              <span class="topbar__mark" aria-hidden="true">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round" focusable="false">
                  <path d="m20.5 7.2-8-4.7a1.5 1.5 0 0 0-1.5 0l-8 4.7A1.5 1.5 0 0 0 2 8.4v7.2a1.5 1.5 0 0 0 .75 1.3l8 4.7a1.5 1.5 0 0 0 1.5 0l8-4.7a1.5 1.5 0 0 0 .75-1.3V8.4a1.5 1.5 0 0 0-.5-1.2Z" />
                  <path d="m2.5 7.5 9.5 5.6 9.5-5.6M12 21.4v-8.3" />
                </svg>
              </span>
              <div>
                <h1 class="topbar__title">Cadence</h1>
                <p class="topbar__sub">Vue 3 task manager, Composition API</p>
              </div>
            </div>

            <p class="topbar__stamp" role="status" aria-live="polite">
              {{ stats.open }} open &middot; {{ stats.done }} done
              <span v-if="stats.overdue > 0" class="topbar__stamp-warn">&middot; {{ stats.overdue }} overdue</span>
            </p>
          </header>

          <main class="layout">
            <section class="panel panel--form" aria-label="Create or edit a task">
              <TaskForm :editing="editing" @create="addTask" @update="saveEdit" @cancel-edit="editingId = null" />

              <TaskStats
                :total="stats.total"
                :done="stats.done"
                :open="stats.open"
                :overdue="stats.overdue"
                :percent="stats.percent"
                :tasks="tasks"
              />
            </section>

            <section class="panel panel--list" aria-label="Task list">
              <TaskFilters
                :filter="filter"
                :query="query"
                :sort="sort"
                :tag="tag"
                :tag-counts="tagCounts"
                :counts="pillCounts"
                :visible-count="visible.length"
                :total-count="stats.total"
                :is-searching="isSearching"
                @update:filter="filter = $event"
                @update:query="query = $event"
                @update:sort="sort = $event"
                @update:tag="tag = $event"
                @toggle-all="toggleAll"
                @clear-done="clearCompleted"
                @reset-filters="resetFilters"
              />

              <div id="task-list">
                <!-- Loading skeleton, shown until the first storage read resolves. -->
                <ul v-if="loading" class="list" aria-busy="true" aria-label="Loading tasks">
                  <li v-for="n in 4" :key="'sk-' + n" class="skeleton">
                    <span class="skeleton__box" aria-hidden="true"></span>
                    <span class="skeleton__lines" aria-hidden="true">
                      <span class="skeleton__line"></span>
                      <span class="skeleton__line skeleton__line--short"></span>
                    </span>
                    <span class="sr-only">Loading your tasks</span>
                  </li>
                </ul>

                <ul v-else-if="visible.length" class="list">
                  <TaskItem
                    v-for="(task, index) in visible"
                    :key="task.id"
                    :task="task"
                    :is-editing="editingId === task.id"
                    :is-first="index === 0"
                    :is-last="index === visible.length - 1"
                    :library-tags="libraryTags"
                    @toggle="toggle"
                    @edit="startEdit"
                    @save="(id, patch) => saveEdit(id, patch)"
                    @cancel-edit="editingId = null"
                    @remove="remove"
                    @move="move"
                    @toggle-tag="toggleTag"
                  />
                </ul>

                <div v-else class="empty" role="status">
                  <span class="empty__glyph" aria-hidden="true">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
                      stroke-linecap="round" stroke-linejoin="round" focusable="false">
                      <path v-if="isSearching" d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3" />
                      <path v-else d="M4 13h4l2 3h4l2-3h4M4 13 6.5 5h11L20 13v6H4v-6Z" />
                    </svg>
                  </span>

                  <h2 class="empty__title">
                    {{ isSearching ? 'Nothing matches those filters' : 'No tasks yet' }}
                  </h2>
                  <p class="empty__body">
                    {{
                      isSearching
                        ? 'Try a shorter search term, or widen the filter to include finished work.'
                        : 'Add your first task on the left. Press Enter in the name field to save it.'
                    }}
                  </p>

                  <button v-if="isSearching" type="button" class="button button--quiet" @click="resetFilters">
                    Reset filters
                  </button>
                  <p v-else class="empty__meta">{{ stats.total }} task{{ stats.total === 1 ? '' : 's' }} in total</p>
                </div>
              </div>

              <footer class="list__foot">
                <p>Saved to <code>localStorage</code> under <code>gbcoder.vue-tasks.tasks.v1</code>.</p>
                <p class="list__foot-tip">
                  Filtering and sorting are <code>computed</code>, so they never reset what you are typing.
                </p>
              </footer>
            </section>
          </main>

          <!-- Undo toast. Escape dismisses it; the timer does too. -->
          <div
            class="toast"
            :class="{ 'toast--in': toast }"
            role="status"
            aria-live="polite"
            :aria-hidden="!toast"
          >
            <span class="toast__label">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
              </svg>
              {{ toast ? toast.message : '' }}
            </span>

            <div class="toast__actions">
              <button type="button" class="button button--tiny" :disabled="!toast" @click="undo">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"
                  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                  <path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3" />
                </svg>
                Undo
              </button>
              <button type="button" class="icon-btn" :disabled="!toast" aria-label="Dismiss undo" @click="dismissToast">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" aria-hidden="true" focusable="false">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </template>