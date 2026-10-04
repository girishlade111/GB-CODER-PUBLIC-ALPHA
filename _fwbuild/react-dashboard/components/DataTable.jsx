      import { useMemo, useState } from 'react';
      import Badge from './Badge.jsx';
      import { formatDate, fullCurrency } from '../utils/format.js';

      const PAGE_SIZE = 6;

      /**
       * Sortable, searchable, paginated order table.
       *
       * Sorting is a single `{ key, dir }` object rather than two independent pieces of
       * state, which makes "sort by revenue, ascending" one update instead of two, and
       * removes the possibility of key and direction disagreeing.
       *
       * `null` in the sort map means the column is not sortable.
       */
      const COLUMNS = [
        { key: 'id', label: 'Order', sortable: true },
        { key: 'customer', label: 'Customer', sortable: true },
        { key: 'total', label: 'Value', sortable: true, numeric: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'placed', label: 'Placed', sortable: true },
        { key: 'channel', label: 'Channel', sortable: true },
      ];

      const COMPARATORS = {
        id: (a, b) => a.id.localeCompare(b.id),
        customer: (a, b) => a.customer.localeCompare(b.customer),
        total: (a, b) => a.total - b.total,
        status: (a, b) => a.status.localeCompare(b.status),
        placed: (a, b) => a.placed.localeCompare(b.placed),
        channel: (a, b) => a.channel.localeCompare(b.channel),
      };

      const SortGlyph = ({ active, dir }) => (
        <svg className={'sort-glyph' + (active ? ' sort-glyph--on' : '')} width="12" height="12" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true" focusable="false">
          {active && dir === 'desc' ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
        </svg>
      );

      export default function DataTable({ orders, isCompact }) {
        const [query, setQuery] = useState('');
        const [sort, setSort] = useState({ key: 'placed', dir: 'desc' });
        const [page, setPage] = useState(1);

        const filtered = useMemo(() => {
          const needle = query.trim().toLowerCase();
          const base = needle
            ? orders.filter((order) =>
                (order.id + ' ' + order.customer + ' ' + order.country + ' ' + order.email + ' ' + order.channel)
                  .toLowerCase()
                  .indexOf(needle) !== -1,
              )
            : orders;

          const comparator = COMPARATORS[sort.key] || COMPARATORS.placed;
          const sorted = base.slice().sort(comparator);
          return sort.dir === 'desc' ? sorted.reverse() : sorted;
        }, [orders, query, sort]);

        const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

        // A filter can shrink the result set under the current page number.
        const safePage = Math.min(page, pageCount);
        const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

        const toggleSort = (key) => {
          setPage(1);
          setSort((current) => {
            if (current.key !== key) return { key, dir: 'asc' };
            if (current.dir === 'asc') return { key, dir: 'desc' };
            return { key: 'placed', dir: 'desc' };
          });
        };

        const ariaSort = (key) => {
          if (sort.key !== key) return 'none';
          return sort.dir === 'asc' ? 'ascending' : 'descending';
        };

        const totalValue = filtered.reduce((sum, order) => sum + order.total, 0);

        return (
          <section className="table-card glass" aria-labelledby="orders-heading">
            <header className="table-card__head">
              <div>
                <h2 className="card-title" id="orders-heading">
                  Recent orders
                </h2>
                <p className="card-sub">
                  {filtered.length} of {orders.length} orders &middot; {fullCurrency(totalValue)} in value
                </p>
              </div>

              <div className="table-search">
                <label className="sr-only" htmlFor="orders-search">
                  Search orders
                </label>
                <svg className="table-search__icon" width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true" focusable="false">
                  <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3" />
                </svg>
                <input
                  id="orders-search"
                  className="input"
                  type="search"
                  value={query}
                  placeholder="Order, customer or email"
                  autoComplete="off"
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                />
                {query ? (
                  <button type="button" className="table-search__clear" onClick={() => setQuery('')} aria-label="Clear order search">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" aria-hidden="true" focusable="false">
                      <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  </button>
                ) : null}
              </div>
            </header>

            <div className="table-scroll">
              <table className="table">
                <caption className="sr-only">
                  Recent orders, sortable. {filtered.length} rows match the current filter.
                </caption>
                <thead>
                  <tr>
                    {COLUMNS.map((column) => (
                      <th
                        key={column.key}
                        scope="col"
                        aria-sort={ariaSort(column.key)}
                        className={column.numeric ? 'is-numeric' : undefined}
                      >
                        <button type="button" className="table-sort" onClick={() => toggleSort(column.key)}>
                          {column.label}
                          <SortGlyph active={sort.key === column.key} dir={sort.dir} />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {visible.length === 0 ? (
                    <tr>
                      <td className="table-empty" colSpan={COLUMNS.length}>
                        No order matches &ldquo;{query}&rdquo;.
                        <button type="button" className="link-button" onClick={() => setQuery('')}>
                          Clear the filter
                        </button>
                      </td>
                    </tr>
                  ) : (
                    visible.map((order) => (
                      <tr key={order.id}>
                        <th scope="row" className="is-id">
                          {order.id}
                          <span className="table-mobile-meta">
                            <Badge status={order.status} />
                          </span>
                        </th>
                        <td>
                          <span className="cell-strong">{order.customer}</span>
                          <span className="cell-sub">
                            {order.country} &middot; {order.items} items
                          </span>
                        </td>
                        <td className="is-numeric">{fullCurrency(order.total)}</td>
                        <td className={isCompact ? 'is-hidden-compact' : undefined}>
                          <Badge status={order.status} dot />
                        </td>
                        <td className="cell-date">{formatDate(order.placed)}</td>
                        <td className="is-hidden-compact">
                          <span className="channel">{order.channel}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <nav className="pager" aria-label="Order pages">
              <button
                type="button"
                className="pager__btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                aria-label="Previous page"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Prev
              </button>

              <ol className="pager__pages">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                  <li key={n}>
                    <button
                      type="button"
                      className={'pager__page' + (n === safePage ? ' pager__page--on' : '')}
                      aria-current={n === safePage ? 'page' : undefined}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  </li>
                ))}
              </ol>

              <button
                type="button"
                className="pager__btn"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={safePage === pageCount}
                aria-label="Next page"
              >
                Next
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </nav>
          </section>
        );
      }