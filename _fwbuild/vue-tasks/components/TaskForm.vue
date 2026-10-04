      <script setup>
      import { computed, reactive, ref, watch } from 'vue';
      import { MAX_TITLE, PRIORITIES } from '../utils/labels.js';
      import { today } from '../data/seed.js';

      /**
       * The add form.
       *
       * `v-model` on every field binds straight into one `reactive` draft, so there is
       * no per-field `ref` plumbing and the reset is a single object replacement.
       */
      const props = defineProps({
        /** Task being edited, or null when adding. */
        editing: { type: Object, default: null },
      });

      const emit = defineEmits(['create', 'update', 'cancel-edit']);

      const blank = () => ({
        title: '',
        note: '',
        priority: 'medium',
        due: '',
      });

      const draft = reactive(blank());
      const error = ref('');
      const touched = ref(false);

      const isEditing = computed(() => Boolean(props.editing));

      /** The live model is the draft while adding, and the task being edited. */
      const remaining = computed(() => MAX_TITLE - draft.title.length);
      const isWarn = computed(() => remaining.value <= 10);

      /** Fill the form from the task being edited, without mutating the prop. */
      const hydrate = (task) => {
        Object.assign(draft, {
          title: task.title,
          note: task.note,
          priority: task.priority,
          due: task.due,
        });
      };

      const hydrateFrom = (task) => {
        if (task) hydrate(task);
        else Object.assign(draft, blank());
      };

      /**
       * Which task is being edited, or the string 'new' when the form is adding.
       * Watching this is enough to know when to re-hydrate the draft, and it avoids
       * depending on the identity of the prop object.
       */
      const mode = computed(() => (props.editing ? props.editing.id : 'new'));

      watch(mode, (next, previous) => {
        if (next === previous) return;
        hydrateFrom(next === 'new' ? null : props.editing);
        error.value = '';
        touched.value = false;
      });

      // Covers the parent mounting with a row already in edit mode. Without this the
      // draft would stay blank until the mode actually changed.
      if (props.editing) hydrate(props.editing);

      const onTitle = () => {
        error.value = '';
      };

      const onSubmit = () => {
        const title = draft.title.trim();

        if (!title) {
          error.value = 'Give the task a name first.';
          touched.value = true;
          return;
        }
        if (title.length < 3) {
          error.value = 'Three characters or more, please.';
          touched.value = true;
          return;
        }

        touched.value = false;
        error.value = '';

        const payload = {
          title,
          note: draft.note.trim(),
          priority: draft.priority,
          due: draft.due,
          tags: [],
        };

        if (isEditing.value) emit('update', props.editing.id, payload);
        else emit('create', payload);

        Object.assign(draft, blank());
      };

      const toggleQuickDue = () => {
        const t = today();
        draft.due = draft.due === t ? '' : t;
      };

      const cancel = () => {
        Object.assign(draft, blank());
        error.value = '';
        touched.value = false;
        emit('cancel-edit');
      };
      </script>

      <template>
        <form class="form" novalidate @submit.prevent="onSubmit">
          <header class="form__head">
            <h2 class="form__title">
              <svg v-if="isEditing" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20ZM13.5 6.5l3 3" />
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.9" stroke-linecap="round" aria-hidden="true" focusable="false">
                <path d="M12 5v14M5 12h14" />
              </svg>
              {{ isEditing ? 'Edit task' : 'New task' }}
            </h2>

            <button type="button" class="ghost ghost--tiny" @click="toggleQuickDue">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M4 7h16v14H4zM4 11h16M8 4v4M16 4v4" />
              </svg>
              {{ draft.due === today() ? 'Due today' : 'Today' }}
            </button>
          </header>

          <div class="field">
            <label class="field__label" for="new-title">Task name</label>
            <input
              id="new-title"
              v-model="draft.title"
              class="input"
              type="text"
              :maxlength="MAX_TITLE"
              placeholder="Collect the Q2 audit evidence"
              autocomplete="off"
              :aria-invalid="Boolean(touched && error) || undefined"
              aria-describedby="title-count"
              @blur="touched = true"
              @input="onTitle"
            />
            <div class="field__foot">
              <span id="title-count" class="counter" :class="{ 'counter--warn': isWarn }" aria-live="polite">
                {{ remaining }} left
              </span>
            </div>
          </div>

          <div class="field">
            <label class="field__label" for="new-note">Note</label>
            <textarea
              id="new-note"
              v-model="draft.note"
              class="input input--area"
              rows="2"
              maxlength="240"
              placeholder="Context or acceptance criteria"
            />
          </div>

          <div class="form__row">
            <div class="field field--compact">
              <label class="field__label" for="new-priority">Priority</label>
              <select id="new-priority" v-model="draft.priority" class="input input--select">
                <option v-for="option in PRIORITIES" :key="option.id" :value="option.id">{{ option.label }}</option>
              </select>
            </div>

            <div class="field field--compact">
              <label class="field__label" for="new-due">Due date</label>
              <input id="new-due" v-model="draft.due" class="input input--date" type="date" />
            </div>
          </div>

          <p v-if="touched && error" class="form__error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
            {{ error }}
          </p>

          <div class="form__actions">
            <button type="submit" class="button button--primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path :d="isEditing ? 'm20 6-11 11-5-5' : 'M12 5v14M5 12h14'" />
              </svg>
              {{ isEditing ? 'Save changes' : 'Add task' }}
            </button>

            <button v-if="isEditing" type="button" class="button button--quiet" @click="cancel">Cancel</button>

            <p class="form__hint">Enter saves the task.</p>
          </div>
        </form>
      </template>