      import Icon from './Icons.jsx';

      /**
       * Shown when the visible list is empty.
       *
       * Two genuinely different situations collapse into one component: there are no
       * tasks at all, or the filters are hiding some. Saying the wrong one is the
       * classic empty-state mistake, so the copy branches on `isSearching`.
       */
      export default function EmptyState({ isSearching, totalCount, onClearFilters }) {
        return (
          <div className="empty" role="status">
            <span className="empty__glyph" aria-hidden="true">
              <Icon name={isSearching ? 'search' : 'inbox'} size={26} />
            </span>
            <h3 className="empty__title">
              {isSearching ? 'Nothing matches those filters' : 'No tasks yet'}
            </h3>
            <p className="empty__body">
              {isSearching
                ? 'Try a shorter search term, or widen the filter to include finished work.'
                : 'Add your first task on the left. Press Enter in the name field to save it.'}
            </p>
            {isSearching ? (
              <button type="button" className="button button--quiet" onClick={onClearFilters}>
                <Icon name="close" size={15} />
                Reset filters
              </button>
            ) : (
              <p className="empty__meta">{totalCount} task{isSearching || totalCount === 1 ? '' : 's'} in total</p>
            )}
          </div>
        );
      }