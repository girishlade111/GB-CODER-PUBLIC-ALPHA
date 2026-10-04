      <script setup>
      import { computed } from 'vue';
      import { FILTERS, SORTS } from '../utils/labels.js';

      /*
       * Imported bindings are usable in `<script setup>` templates directly, but
       * assigning them to local consts reads better in the markup and keeps the
       * option lists obviously the source of truth for both loops.
       */
      const filterOptions = FILTERS;
      const sortOptions = SORTS;

      const props = defineProps({
        filter: { type: String, required: true },
        query: { type: String, required: true },
        sort: { type: String, required: true },
        tag: { type: String, required: true },
        tagCounts: { type: Array, required: true },
        counts: { type: Object, required: true },
        visibleCount: { type: Number, required: true },
        totalCount: { type: Number, required: true },
        isSearching: { type: Boolean, required: true },
      });

      const emit = defineEmits([
        'update:filter',
        'update:query',
        'update:sort',
        'update:tag',
        'toggle-all',
        'clear-done',
        'reset-filters',
      ]);

      /** Count shown on each status pill. */
      const pillCount = (id) => {
        if (id === 'all') return props.counts.all;
        if (id === 'active') return props.counts.active;
        return props.counts.done;
      };

      /** Flips between the two <select> bindings without a computed per option. */
      const onFilter = (event) => emit('update:filter', event.target.value);
      const onSort = (event) => emit('update:sort', event.target.value);
      const onTag = (event) => emit('update:tag', event.target.value);

      const statusLine = computed(() =>
        props.isSearching
          ? 'Showing ' + props.visibleCount + ' of ' + props.totalCount + ' after filtering.'
          : 'Showing all ' + props.totalCount + ' tasks.',
      );
      </script>

      <template>
        <section class="filters" aria-labelledby="filters-title">
          <h2 class="sr-only" id="filters-title">Filter and sort tasks</h2>

          <div class="filters__row">
            <div class="search">
              <label class="sr-only" for="task-search">Search tasks</label>
              <svg class="search__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3" />
              </svg>
              <input
                id="task-search"
                class="search__input"
                type="search"
                :value="query"
                placeholder="Search title, note or tag"
                autocomplete="off"
                @input="emit('update:query', $event.target.value)"
              />
              <button
                v-if="query"
                type="button"
                class="search__clear"
                aria-label="Clear search"
                @click="emit('update:query', '')"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" aria-hidden="true" focusable="false">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div class="pills" role="group" aria-label="Filter by status">
              <button
                v-for="option in filterOptions"
                :key="option.id"
                type="button"
                class="pill"
                :class="{ 'pill--on': filter === option.id }"
                :aria-pressed="filter === option.id"
                @click="emit('update:filter', option.id)"
              >
                {{ option.label }}
                <span class="pill__count">{{ pillCount(option.id) }}</span>
              </button>
            </div>
          </div>

          <div v-if="tagCounts.length" class="filters__row filters__row--tags">
            <span class="filters__taglabel" id="tag-label">Tags</span>
            <div class="chips" role="group" aria-labelledby="tag-label">
              <button
                type="button"
                class="chip"
                :class="{ 'chip--on': tag === 'all' }"
                :aria-pressed="tag === 'all'"
                @click="emit('update:tag', 'all')"
              >
                all
              </button>
              <button
                v-for="entry in tagCounts"
                :key="entry.id"
                type="button"
                class="chip"
                :class="{ 'chip--on': tag === entry.id }"
                :aria-pressed="tag === entry.id"
                @click="emit('update:tag', tag === entry.id ? 'all' : entry.id)"
              >
                {{ entry.id }}
                <span class="chip__count">{{ entry.count }}</span>
              </button>
            </div>
          </div>

          <div class="filters__tail">
            <label class="sr-only" for="task-sort">Sort tasks</label>
            <select id="task-sort" class="select select--sort" :value="sort" @change="onSort">
              <option v-for="option in sortOptions" :key="option.id" :value="option.id">{{ option.label }}</option>
            </select>

            <button type="button" class="ghost" :disabled="totalCount === 0" @click="emit('toggle-all')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="m20 6-11 11-5-5" />
              </svg>
              Toggle all
            </button>

            <button
              type="button"
              class="ghost ghost--danger"
              :disabled="counts.done === 0"
              @click="emit('clear-done')"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
              </svg>
              Clear done
            </button>

            <button v-if="isSearching" type="button" class="ghost" @click="emit('reset-filters')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
              Reset
            </button>

            <p class="filters__status" role="status" aria-live="polite">{{ statusLine }}</p>
          </div>
        </section>
      </template>

