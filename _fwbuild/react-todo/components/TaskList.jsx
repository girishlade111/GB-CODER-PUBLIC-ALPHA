      import Icon from './Icons.jsx';
      import TaskItem from './TaskItem.jsx';
      import EmptyState from './EmptyState.jsx';

      /**
       * The task list plus its two empty states.
       *
       * `visible` is already filtered and sorted by `useTasks`, so this component only
       * decides what to render. `key` is the task id, never the array index: the rows
       * get reordered by the move buttons, and an index key would make React reuse the
       * wrong DOM node - which is exactly how the checkbox state would end up on the
       * wrong task.
       */
      export default function TaskList({
        visible,
        total,
        editingId,
        isSearching,
        leavingId,
        onToggle,
        onEdit,
        onDelete,
        onCancelEdit,
        onMove,
        onResetFilters,
      }) {
        if (visible.length === 0) {
          return <EmptyState isSearching={isSearching} totalCount={total} onClearFilters={onResetFilters} />;
        }

        return (
          <ul className="task-list" aria-label="Tasks">
            {visible.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                index={index}
                total={visible.length}
                isEditing={editingId === task.id}
                isLeaving={leavingId === task.id}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                onCancelEdit={onCancelEdit}
                onMove={onMove}
              />
            ))}
          </ul>
        );
      }

      export function TaskListHeading({ count, isSearching }) {
        return (
          <div className="list-heading">
            <h2 className="list-heading__title">
              <Icon name="layers" size={16} />
              {isSearching ? 'Filtered results' : 'Your tasks'}
            </h2>
            <span className="list-heading__count">{count} shown</span>
          </div>
        );
      }