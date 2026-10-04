      import Icon from './Icons.jsx';

      /**
       * Headline numbers above the list.
       *
       * The completion bar is a real `<progress>` element rather than a div with an
       * inline width percentage. That keeps every visual style in CSS, gets the
       * correct ARIA semantics for free, and lets `::-webkit-progress-value`
       * transition so the bar animates without any JS driving it per frame.
       */
      export default function StatsBar({ total, completed, active, overdue, percent }) {
        const tiles = [
          { key: 'total', label: 'Total', value: total, tone: 'neutral' },
          { key: 'active', label: 'Active', value: active, tone: 'active' },
          { key: 'completed', label: 'Completed', value: completed, tone: 'done' },
          { key: 'overdue', label: 'Overdue', value: overdue, tone: overdue > 0 ? 'alert' : 'neutral' },
        ];

        return (
          <section className="stats" aria-labelledby="stats-heading">
            <h2 className="sr-only" id="stats-heading">
              Task summary
            </h2>

            <div className="stats__tiles">
              {tiles.map((tile) => (
                <div key={tile.key} className={'stat-tile stat-tile--' + tile.tone}>
                  <span className="stat-tile__label">{tile.label}</span>
                  <span className="stat-tile__value">{tile.value}</span>
                </div>
              ))}
            </div>

            <div className="stats__progress">
              <div className="stats__progress-head">
                <span className="stats__progress-label">
                  <Icon name="target" size={14} />
                  Completion
                </span>
                <span className="stats__progress-value">{percent}%</span>
              </div>
              <progress
                className="progress"
                max={100}
                value={percent}
                aria-label={'Completion: ' + percent + ' percent, ' + completed + ' of ' + total + ' tasks done'}
              />
              <p className="stats__progress-note">
                {total === 0
                  ? 'Add a task to start tracking progress.'
                  : completed + ' of ' + total + ' tasks finished.' +
                    (overdue > 0 ? ' ' + overdue + ' past due.' : ' Nothing overdue.')}
              </p>
            </div>
          </section>
        );
      }