      import { useCallback, useId, useRef, useState } from 'react';
      import Icon from './Icons.jsx';
      import { MAX_NOTES, MAX_TITLE, PRIORITIES, TAG_LIBRARY } from '../utils/todoStore.js';
      import { todayInputValue } from '../utils/date.js';

      const EMPTY = { title: '', notes: '', priority: 'medium', due: '', tags: '' };

      /**
       * The add/edit form.
       *
       * Doubles as the inline editor: when `editing` is passed it is pre-filled and
       * submits an update instead of an insert. Submit happens on Enter from the title
       * field (or anywhere in the form) while Shift+Enter stays available in notes.
       */
      export default function TaskForm({ onCreate, onUpdate, editing, onCancelEdit, defaultPriority = 'medium' }) {
        const [draft, setDraft] = useState(EMPTY);
        const [error, setError] = useState('');
        const [touched, setTouched] = useState(false);
        const titleRef = useRef(null);
        const formId = useId();

        const isEditing = Boolean(editing);

        // When the parent promotes a row into edit mode, adopt that row's values.
        const values = isEditing
          ? {
              title: editing.title,
              notes: editing.notes,
              priority: editing.priority,
              due: editing.due,
              tags: editing.tags.join(', '),
            }
          : { ...EMPTY, priority: defaultPriority };

        const set = useCallback((key) => (event) => {
          const { value } = event.target;
          setDraft((current) => ({ ...current, [key]: value }));
          if (key === 'title') setError('');
        }, []);

        const remaining = MAX_TITLE - draft.title.length;

        const handleSubmit = (event) => {
          event.preventDefault();
          const title = draft.title.trim();

          if (!title) {
            setError('Give the task a name before saving.');
            setTouched(true);
            if (titleRef.current) titleRef.current.focus();
            return;
          }
          if (title.length < 3) {
            setError('Three characters or more, please.');
            setTouched(true);
            return;
          }

          setTouched(false);
          setError('');

          if (isEditing) {
            onUpdate(editing.id, {
              title,
              notes: draft.notes.trim(),
              priority: draft.priority,
              due: draft.due,
              tags: draft.tags,
            });
            onCancelEdit();
          } else {
            onCreate({
              title,
              notes: draft.notes.trim(),
              priority: draft.priority,
              due: draft.due,
              tags: draft.tags,
            });
            setDraft({ ...EMPTY, priority: defaultPriority });
          }
        };

        const handleCancel = () => {
          setDraft(EMPTY);
          setError('');
          setTouched(false);
          onCancelEdit();
        };

        return (
          <form className="task-form" onSubmit={handleSubmit} noValidate>
            <div className="task-form__head">
              <h2 className="task-form__title">
                <Icon name={isEditing ? 'pencil' : 'plus'} size={16} />
                {isEditing ? 'Edit task' : 'New task'}
              </h2>
              <button
                type="button"
                className="ghost-button"
                onClick={() => setDraft((current) => ({ ...current, due: current.due === todayInputValue() ? '' : todayInputValue() }))}
                aria-label="Toggle due date of today"
              >
                <Icon name="calendar" size={15} />
                {draft.due === todayInputValue() ? 'Today' : 'Due today'}
              </button>
            </div>

            <label className="field">
              <span className="field__label">Task name</span>
              <input
                ref={titleRef}
                id={formId + '-title'}
                className="input"
                type="text"
                value={draft.title}
                onChange={set('title')}
                onBlur={() => setTouched(true)}
                placeholder="Ship the pricing page copy review"
                maxLength={MAX_TITLE}
                autoComplete="off"
                aria-describedby={formId + '-count' + (error ? ' ' + formId + '-error' : '')}
                aria-invalid={Boolean(error) || undefined}
              />
              <span className="field__meta">
                <span
                  id={formId + '-count'}
                  className={'counter' + (remaining <= 10 ? ' counter--warn' : '')}
                  aria-live="polite"
                >
                  {remaining} left
                </span>
              </span>
            </label>

            <label className="field">
              <span className="field__label">Notes</span>
              <textarea
                id={formId + '-notes'}
                className="input input--area"
                rows={2}
                value={draft.notes}
                onChange={set('notes')}
                placeholder="Context, links, acceptance criteria"
                maxLength={MAX_NOTES}
              />
            </label>

            <div className="task-form__row">
              <label className="field field--compact">
                <span className="field__label">Priority</span>
                <select id={formId + '-priority'} className="input input--select" value={draft.priority} onChange={set('priority')}>
                  {PRIORITIES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field field--compact">
                <span className="field__label">Due</span>
                <input
                  id={formId + '-due'}
                  className="input input--date"
                  type="date"
                  value={draft.due}
                  onChange={set('due')}
                />
              </label>
            </div>

            <fieldset className="field field--tags">
              <legend className="field__label">Tags</legend>
              <div className="chip-row chip-row--pick">
                {TAG_LIBRARY.map((tag) => {
                  const active = draft.tags.split(',').some((part) => part.trim() === tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={'chip chip--button' + (active ? ' chip--on' : '')}
                      aria-pressed={active}
                      onClick={() => {
                        const parts = draft.tags.split(',').map((s) => s.trim()).filter(Boolean);
                        const next = parts.indexOf(tag) === -1
                          ? parts.concat(tag)
                          : parts.filter((p) => p !== tag);
                        setDraft((current) => ({ ...current, tags: next.join(', ') }));
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              <input
                id={formId + '-tags'}
                className="input input--tags"
                type="text"
                value={draft.tags}
                onChange={set('tags')}
                placeholder="custom tags, comma separated"
                aria-label="Custom tags, comma separated"
              />
            </fieldset>

            {touched && error ? (
              <p className="form-error" id={formId + '-error'} role="alert">
                <Icon name="close" size={14} />
                {error}
              </p>
            ) : null}

            <div className="task-form__actions">
              <button type="submit" className="button button--primary">
                <Icon name={isEditing ? 'check' : 'plus'} size={16} />
                {isEditing ? 'Save changes' : 'Add task'}
              </button>
              {isEditing ? (
                <button type="button" className="button button--quiet" onClick={handleCancel}>
                  Cancel
                </button>
              ) : null}
              <p className="form-hint">Press Enter to save. Notes accept up to {MAX_NOTES} characters.</p>
            </div>
          </form>
        );
      }