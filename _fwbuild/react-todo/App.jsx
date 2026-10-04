      import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
      import TaskForm from './components/TaskForm.jsx';
      import TaskList, { TaskListHeading } from './components/TaskList.jsx';
      import FilterBar from './components/FilterBar.jsx';
      import StatsBar from './components/StatsBar.jsx';
      import Icon from './components/Icons.jsx';
      import { useTasks } from './hooks/useTasks.js';

      const UNDO_WINDOW_MS = 7000;

      /**
       * Composition root.
       *
       * The only component that knows about both the task state hook and every child.
       * It holds two pieces of genuinely local UI state - which row is being edited and
       * whether the sidebar is collapsed on narrow screens - and nothing else.
       */
      export default function App() {
        const tasks = useTasks();
        const [editingId, setEditingId] = useState(null);
        const [sidebarOpen, setSidebarOpen] = useState(false);
        const toastRef = useRef(null);
        const closeTimer = useRef(null);

        const editing = useMemo(
          () => tasks.tasks.find((task) => task.id === editingId) || null,
          [tasks.tasks, editingId],
        );

        const handleEdit = useCallback((id) => {
          setEditingId(id);
          setSidebarOpen(true);
        }, []);

        const handleCancelEdit = useCallback(() => setEditingId(null), []);

        /** One place for every mutation, so the undo toast and focus stay in sync. */
        const handleDelete = useCallback(
          (id) => {
            tasks.removeTask(id);
            setEditingId((current) => (current === id ? null : current));
          },
          [tasks],
        );

        const handleResetFilters = useCallback(() => {
          tasks.setFilter('all');
          tasks.setQuery('');
          tasks.setTag('all');
        }, [tasks]);

        // The undo toast auto-dismisses. The timer is cleared on unmount so a pending
        // timeout cannot call setState on a dead tree.
        useEffect(() => {
          if (!tasks.undoEntry) return undefined;
          closeTimer.current = window.setTimeout(() => tasks.dismissUndo(), UNDO_WINDOW_MS);
          return () => window.clearTimeout(closeTimer.current);
        }, [tasks.undoEntry, tasks.dismissUndo]);

        // Escape closes the toast, then the editor - a natural bottom-up dismissal
        // order for an overlay stack.
        useEffect(() => {
          const onKeyDown = (event) => {
            if (event.key !== 'Escape') return;
            if (tasks.undoEntry) {
              tasks.dismissUndo();
              return;
            }
            if (editingId) setEditingId(null);
          };
          window.addEventListener('keydown', onKeyDown);
          return () => window.removeEventListener('keydown', onKeyDown);
        }, [tasks, editingId]);

        return (
          <div className={'app' + (sidebarOpen ? ' app--sidebar-open' : '')}>
            <a className="skip-link" href="#main">
              Skip to task list
            </a>

            <header className="topbar">
              <div className="topbar__brand">
                <span className="topbar__mark" aria-hidden="true">
                  <Icon name="bolt" size={18} />
                </span>
                <div>
                  <h1 className="topbar__title">Sprintboard</h1>
                  <p className="topbar__sub">Task manager &middot; React + localStorage</p>
                </div>
              </div>

              <div className="topbar__right">
                <p className="topbar__stamp" role="status" aria-live="polite">
                  {tasks.stats.active} open, {tasks.stats.overdue} overdue
                </p>
                <button
                  type="button"
                  className="ghost-button topbar__toggle"
                  aria-expanded={sidebarOpen}
                  aria-controls="task-form-panel"
                  onClick={() => setSidebarOpen((open) => !open)}
                >
                  <Icon name={sidebarOpen ? 'close' : 'plus'} size={16} />
                  {sidebarOpen ? 'Close' : 'New task'}
                </button>
              </div>
            </header>

            <main className="app__body" id="main">
              <section
                className="panel panel--form"
                id="task-form-panel"
                aria-label="Create or edit a task"
              >
                <TaskForm
                  editing={editing}
                  defaultPriority={tasks.defaultPriority}
                  onCreate={tasks.addTask}
                  onUpdate={tasks.updateTask}
                  onCancelEdit={handleCancelEdit}
                />
                <StatsBar
                  total={tasks.stats.total}
                  completed={tasks.stats.completed}
                  active={tasks.stats.active}
                  overdue={tasks.stats.overdue}
                  percent={tasks.stats.percent}
                />
              </section>

              <section className="panel panel--list" aria-label="Task list">
                <FilterBar
                  filter={tasks.filter}
                  onFilterChange={tasks.setFilter}
                  query={tasks.query}
                  onQueryChange={tasks.setQuery}
                  sort={tasks.sort}
                  onSortChange={tasks.setSort}
                  tag={tasks.tag}
                  onTagChange={tasks.setTag}
                  tags={tasks.tags}
                  visibleCount={tasks.visible.length}
                  totalCount={tasks.stats.total}
                  completedCount={tasks.stats.completed}
                  onToggleAll={tasks.toggleAll}
                  onClearCompleted={tasks.clearCompleted}
                />

                <TaskListHeading count={tasks.visible.length} isSearching={tasks.isSearching} />

                <TaskList
                  visible={tasks.visible}
                  total={tasks.stats.total}
                  editingId={editingId}
                  isSearching={tasks.isSearching}
                  leavingId={tasks.leavingId}
                  onToggle={tasks.toggleTask}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onCancelEdit={handleCancelEdit}
                  onMove={tasks.moveTask}
                  onResetFilters={handleResetFilters}
                />

                <footer className="list-footer">
                  <p>
                    Stored in <code>localStorage</code> under <code>gbcoder.react-todo.tasks.v1</code>.
                  </p>
                  <p className="list-footer__tip">
                    <Icon name="bolt" size={13} />
                    Filter, search and sort all run on derived state, so none of them reset your typing.
                  </p>
                </footer>
              </section>
            </main>

            <div
              className={'toast' + (tasks.undoEntry ? ' toast--in' : '')}
              role="status"
              aria-live="polite"
              aria-hidden={!tasks.undoEntry}
              ref={toastRef}
            >
              <span className="toast__label">
                <Icon name="trash" size={15} />
                Deleted &ldquo;{tasks.undoEntry ? tasks.undoEntry.task.title : ''}&rdquo;
              </span>
              <div className="toast__actions">
                <button type="button" className="button button--tiny" onClick={tasks.undoDelete} disabled={!tasks.undoEntry}>
                  <Icon name="undo" size={14} />
                  Undo
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={tasks.dismissUndo}
                  disabled={!tasks.undoEntry}
                  aria-label="Dismiss undo"
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      }