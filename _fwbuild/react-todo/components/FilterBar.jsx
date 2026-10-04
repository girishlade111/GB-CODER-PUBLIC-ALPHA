      import Icon from './Icons.jsx';
      import { FILTERS, SORTS } from '../utils/todoStore.js';

      /**
       * Filter, search, sort and bulk actions.
       *
       * `role="group"` on each cluster plus a real `<select>` for sort keeps this
       * fully keyboard operable without any custom key handling.
       */
      export default function FilterBar({
        filter,
        onFilterChange,
        query,
        onQueryChange,
        sort,
        onSortChange,
        tag,
        onTagChange,
        tags,
        visibleCount,
        totalCount,
        completedCount,
        onToggleAll,
        onClearCompleted,
      }) {
        const hasFilters = query.trim().length > 0 || tag !== 'all' || filter !== 'all';

        return (
          <section className="filters" aria-labelledby="filters-heading">
            <h2 className="sr-only" id="filters-heading">
              Filter and sort tasks
            </h2>

            <div className="filters__search">
              <label className="sr-only" htmlFor="task-search">
                Search tasks
              </label>
              <span className="filters__search-icon" aria-hidden="true">
                <Icon name="search" size={16} />
              </span>
              <input
                id="task-search"
                className="input input--search"
                type="search"
                value={query}
                placeholder="Search title, notes or tags"
                onChange={(event) => onQueryChange(event.target.value)}
                autoComplete="off"
              />
              {query ? (
                <button type="button" className="filters__clear" onClick={() => onQueryChange('')} aria-label="Clear search">
                  <Icon name="close" size={14} />
                </button>
              ) : null}
            </div>

            <div className="filters__group" role="group" aria-label="Filter by status">
              {FILTERS.map((option) => {
                const count =
                  option.id === 'all'
                    ? totalCount
                    : option.id === 'active'
                      ? totalCount - completedCount
                      : completedCount;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={'pill' + (filter === option.id ? ' pill--on' : '')}
                    aria-pressed={filter === option.id}
                    onClick={() => onFilterChange(option.id)}
                  >
                    {option.label}
                    <span className="pill__count">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="filters__spacer" />

            {tags.length ? (
              <div className="filters__group filters__group--tags" role="group" aria-label="Filter by tag">
                <button
                  type="button"
                  className={'tag-chip' + (tag === 'all' ? ' tag-chip--on' : '')}
                  aria-pressed={tag === 'all'}
                  onClick={() => onTagChange('all')}
                >
                  all
                </button>
                {tags.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    className={'tag-chip' + (tag === entry.id ? ' tag-chip--on' : '')}
                    aria-pressed={tag === entry.id}
                    onClick={() => onTagChange(tag === entry.id ? 'all' : entry.id)}
                  >
                    {entry.id}
                    <span className="tag-chip__count">{entry.count}</span>
                  </button>
                ))}
              </div>
            ) : null}

            <div className="filters__tail">
              <label className="sr-only" htmlFor="task-sort">
                Sort tasks
              </label>
              <select
                id="task-sort"
                className="input input--select input--compact"
                value={sort}
                onChange={(event) => onSortChange(event.target.value)}
              >
                {SORTS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="ghost-button"
                onClick={onToggleAll}
                disabled={totalCount === 0}
              >
                <Icon name="check" size={15} />
                Toggle all
              </button>

              <button
                type="button"
                className="ghost-button ghost-button--danger"
                onClick={onClearCompleted}
                disabled={completedCount === 0}
              >
                <Icon name="trash" size={15} />
                Clear done
              </button>
            </div>

            <p className="filters__status" role="status" aria-live="polite">
              Showing <strong>{visibleCount}</strong> of {totalCount}
              {hasFilters ? ' after filtering' : ''}.
            </p>
          </section>
        );
      }