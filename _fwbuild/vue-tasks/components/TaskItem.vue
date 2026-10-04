      <script setup>
      import { computed, nextTick, ref, watch } from 'vue';
      import { dueDescription, dueLabel, dueTone } from '../utils/engine.js';
      import { priorityLabel } from '../utils/labels.js';
      import { TAG_LIBRARY } from '../data/seed.js';

      const props = defineProps({
        task: { type: Object, required: true },
        isEditing: { type: Boolean, required: true },
        isFirst: { type: Boolean, required: true },
        isLast: { type: Boolean, required: true },
        libraryTags: { type: Array, required: true },
      });

      const emit = defineEmits(['toggle', 'edit', 'save', 'cancel-edit', 'remove', 'move', 'toggle-tag']);

      const inputRef = ref(null);
      const draftTitle = ref('');
      const draftNote = ref('');
      const showNote = ref(false);

      // Adopt the task's values whenever this row enters edit mode.
      watch(
        () => props.isEditing,
        async (editing) => {
          if (!editing) return;
          draftTitle.value = props.task.title;
          draftNote.value = props.task.note;
          showNote.value = Boolean(props.task.note);
          await nextTick();
          if (inputRef.value) {
            inputRef.value.focus();
            inputRef.value.select();
          }
        },
      );

      const commit = () => {
        const title = draftTitle.value.trim();
        // Refuse to save an empty title; the row simply stays in edit mode.
        if (!title) return;
        emit('save', { title, note: draftNote.value.trim() });
      };

      const onEditKey = (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          commit();
          return;
        }
        if (event.key === 'Escape') emit('cancel-edit');
      };

      const due = computed(() => dueLabel(props.task.due));
      const dueAlt = computed(() => dueDescription(props.task.due));
      const tone = computed(() => dueTone(props.task.due, props.task.done));
      const priority = computed(() => priorityLabel(props.task.priority));

      /** Library tags not already on this task, so the row is not full of dead chips. */
      const suggestions = computed(() => props.libraryTags.filter((t) => !props.task.tags.includes(t)).slice(0, 4));
      </script>

      <template>
        <li
          class="item"
          :class="[
            'item--' + task.priority,
            { 'item--done': task.done, 'item--editing': isEditing },
          ]"
        >
          <span class="item__rail" aria-hidden="true"></span>

          <label class="check">
            <input
              class="check__input"
              type="checkbox"
              :checked="task.done"
              @change="emit('toggle', task.id)"
            />
            <span class="check__box" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"
                stroke-linecap="round" stroke-linejoin="round" focusable="false">
                <path d="m20 6-11 11-5-5" />
              </svg>
            </span>
            <span class="sr-only">{{ task.done ? 'Mark as not done' : 'Mark as done' }}: {{ task.title }}</span>
          </label>

          <div v-if="isEditing" class="item__editor">
            <label class="sr-only" :for="'edit-' + task.id">Task title</label>
            <input
              :id="'edit-' + task.id"
              ref="inputRef"
              class="input input--inline"
              type="text"
              v-model="draftTitle"
              maxlength="110"
              @keydown="onEditKey"
            />

            <textarea
              v-if="showNote"
              v-model="draftNote"
              class="input input--note"
              rows="2"
              maxlength="240"
              placeholder="Optional note"
              aria-label="Task note"
              @keydown.enter.exact.prevent="commit"
              @keydown.esc="emit('cancel-edit')"
            />

            <div class="item__editor-actions">
              <button type="button" class="icon-btn icon-btn--go" aria-label="Save changes" @click="commit">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                  <path d="m20 6-11 11-5-5" />
                </svg>
              </button>
              <button type="button" class="icon-btn" aria-label="Cancel editing" @click="emit('cancel-edit')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" aria-hidden="true" focusable="false">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
              <button type="button" class="ghost ghost--tiny" @click="showNote = !showNote">
                {{ showNote ? 'Hide note' : 'Add note' }}
              </button>
              <span class="item__hint">Enter saves, Escape cancels.</span>
            </div>
          </div>

          <div v-else class="item__body">
            <p class="item__title">{{ task.title }}</p>
            <p v-if="task.note" class="item__note">{{ task.note }}</p>

            <div class="item__meta">
              <span class="badge" :class="'badge--' + task.priority">{{ priority }}</span>

              <span v-if="task.due" class="meta" :class="'meta--' + tone" :title="dueAlt">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                  <path d="M4 7h16v14H4zM4 11h16M8 4v4M16 4v4" />
                </svg>
                {{ due }}
                <span class="sr-only">, {{ dueAlt }}</span>
              </span>

              <button
                v-for="tagName in task.tags"
                :key="task.id + '-' + tagName"
                type="button"
                class="tag"
                :aria-label="'Remove tag ' + tagName"
                @click="emit('toggle-tag', task.id, tagName)"
              >
                {{ tagName }}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
                  stroke-linecap="round" aria-hidden="true" focusable="false">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>

              <button
                v-for="name in suggestions"
                :key="'add-' + name"
                type="button"
                class="tag tag--add"
                :aria-label="'Add tag ' + name"
                @click="emit('toggle-tag', task.id, name)"
              >
                + {{ name }}
              </button>
            </div>
          </div>

          <div v-if="!isEditing" class="item__actions">
            <button
              type="button"
              class="icon-btn"
              :disabled="isFirst"
              :aria-label="'Move ' + task.title + ' up'"
              @click="emit('move', task.id, -1)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M12 20V4M6 10l6-6 6 6" />
              </svg>
            </button>
            <button
              type="button"
              class="icon-btn"
              :disabled="isLast"
              :aria-label="'Move ' + task.title + ' down'"
              @click="emit('move', task.id, 1)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M12 4v16M6 14l6 6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              class="icon-btn"
              :aria-label="'Edit ' + task.title"
              @click="emit('edit', task.id)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20ZM13.5 6.5l3 3" />
              </svg>
            </button>
            <button
              type="button"
              class="icon-btn icon-btn--danger"
              :aria-label="'Delete ' + task.title"
              @click="emit('remove', task.id)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
              </svg>
            </button>
          </div>
        </li>
      </template>