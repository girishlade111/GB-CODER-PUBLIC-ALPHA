      import { memo, useEffect, useRef } from 'react';
      import Icon from './Icons.jsx';
      import { describeDueDate, formatDueDate, isOverdue } from '../utils/date.js';
      import { priorityLabel } from '../utils/todoStore.js';

      /**
       * One task row.
       *
       * Memoised because the list re-renders on every keystroke in the search box, and
       * a row's props only change when *that* row changes. The compare function is
       * explicit rather than a default `Object.is` on the whole task, so editing an
       * unrelated task does not repaint every row.
       */
      function TaskItem({ task, index, total, isEditing, isLeaving, onToggle, onEdit, onDelete, onCancelEdit, onMove }) {
        const inputRef = useRef(null);

        // Focus the row's own input the moment it enters edit mode, so the caret is
        // already where the user expects after clicking the pencil.
        useEffect(() => {
          if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
          }
        }, [isEditing]);

        const overdue = !task.completed && isOverdue(task.due);
        const dueToday = !task.completed && !overdue && task.due === new Date().toISOString().slice(0, 10);
        const atTop = index === 0;
        const atBottom = index === total - 1;

        const priority = priorityLabel(task.priority);

        return (
          <li
            className={
              'task-item' +
              ' task-item--' +
              task.priority +
              (task.completed ? ' task-item--done' : '') +
              (isEditing ? ' task-item--editing' : '') +
              (isLeaving ? ' task-item--leaving' : '')
            }
          >
            <span className="task-item__rail" aria-hidden="true" />

            <label className="check">
              <input
                type="checkbox"
                className="check__input"
                checked={task.completed}
                onChange={() => onToggle(task.id)}
              />
              <span className="check__box" aria-hidden="true">
                <Icon name="check" size={13} />
              </span>
              <span className="sr-only">{task.completed ? 'Mark as not done' : 'Mark as done'}: {task.title}</span>
            </label>

            {isEditing ? (
              <div className="task-item__edit">
                <label className="sr-only" htmlFor={'edit-title-' + task.id}>
                  Task name
                </label>
                <input
                  id={'edit-title-' + task.id}
                  ref={inputRef}
                  className="input input--inline"
                  type="text"
                  defaultValue={task.title}
                  maxLength={120}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') onCancelEdit();
                    if (event.key === 'Enter') onCancelEdit();
                  }}
                />
                <div className="task-item__edit-actions">
                  <button type="button" className="icon-button icon-button--go" onClick={onCancelEdit} aria-label="Save and close editor">
                    <Icon name="check" size={15} />
                  </button>
                  <button type="button" className="icon-button" onClick={onCancelEdit} aria-label="Cancel editing">
                    <Icon name="close" size={15} />
                  </button>
                </div>
                <p className="task-item__hint">Enter saves, Escape cancels.</p>
              </div>
            ) : (
              <div className="task-item__body">
                <p className="task-item__title">{task.title}</p>
                {task.notes ? <p className="task-item__notes">{task.notes}</p> : null}

                <div className="task-item__meta">
                  <span className={'badge badge--' + task.priority}>{priority}</span>

                  {task.due ? (
                    <span
                      className={
                        'meta-pill' + (overdue ? ' meta-pill--overdue' : dueToday ? ' meta-pill--today' : '')
                      }
                      title={describeDueDate(task.due)}
                    >
                      <Icon name="calendar" size={13} />
                      {formatDueDate(task.due)}
                      {overdue ? <span className="sr-only">, overdue</span> : null}
                    </span>
                  ) : null}

                  {task.tags.map((tag) => (
                    <span key={tag} className="tag-chip tag-chip--static">
                      {tag}
                    </span>
                  ))}

                  {task.updatedAt && !isEditing ? (
                    <span className="task-item__stamp">
                      {task.completed ? 'done' : 'updated'} {new Date(task.updatedAt).toLocaleDateString()}
                    </span>
                  ) : null}
                </div>
              </div>
            )}

            {!isEditing ? (
              <div className="task-item__actions">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onMove(task.id, -1)}
                  disabled={atTop}
                  aria-label={'Move ' + task.title + ' up'}
                >
                  <Icon name="arrowUp" size={15} />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onMove(task.id, 1)}
                  disabled={atBottom}
                  aria-label={'Move ' + task.title + ' down'}
                >
                  <Icon name="arrowDown" size={15} />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onEdit(task.id)}
                  aria-label={'Edit ' + task.title}
                >
                  <Icon name="pencil" size={15} />
                </button>
                <button
                  type="button"
                  className="icon-button icon-button--danger"
                  onClick={() => onDelete(task.id)}
                  aria-label={'Delete ' + task.title}
                >
                  <Icon name="trash" size={15} />
                </button>
              </div>
            ) : null}
          </li>
        );
      }

      export default memo(TaskItem, (prev, next) => {
        return (
          prev.task === next.task &&
          prev.index === next.index &&
          prev.total === next.total &&
          prev.isEditing === next.isEditing &&
          prev.isLeaving === next.isLeaving
        );
      });