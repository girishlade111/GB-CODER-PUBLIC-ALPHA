      import { REGIONS, ACTIVITY, NAV_ICONS } from '../data/mockData.js';
      import { ShareBar } from './Sparkline.jsx';
      import { compactCurrency } from '../utils/format.js';

      const FeedGlyph = ({ name }) => (
        <svg className="feed__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d={NAV_ICONS[name]} />
        </svg>
      );

      /** The activity feed: who did what, newest first, grouped by area. */
      export function ActivityFeed() {
        return (
          <section className="panel glass" aria-labelledby="activity-heading">
            <header className="panel__head">
              <h2 className="card-title" id="activity-heading">
                Activity
              </h2>
              <button type="button" className="link-button">
                View all
                <FeedGlyph name="external" />
              </button>
            </header>

            <ol className="feed">
              {ACTIVITY.map((item) => (
                <li key={item.id} className="feed__item">
                  <span className={'feed__dot feed__dot--' + item.tone} aria-hidden="true" />

                  <div className="feed__body">
                    <p className="feed__text">
                      <strong>{item.who}</strong> {item.action}{' '}
                      <span className="feed__subject">{item.subject}</span>
                    </p>
                    <p className="feed__meta">
                      <span className="chip chip--soft">{item.group}</span>
                      <time>{item.when}</time>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        );
      }

      /** Revenue split by region, shown as share bars. */
      export function RegionBreakdown() {
        return (
          <section className="panel glass" aria-labelledby="regions-heading">
            <header className="panel__head">
              <h2 className="card-title" id="regions-heading">
                Revenue by region
              </h2>
              <p className="card-sub">Month to date</p>
            </header>

            <ul className="regions">
              {REGIONS.map((region) => (
                <li key={region.id}>
                  <ShareBar percent={region.share} label={region.label} value={compactCurrency(region.revenue)} />
                </li>
              ))}
            </ul>
          </section>
        );
      }

      /** Compact "system health" strip under the KPIs. */
      export function HealthStrip() {
        const checks = [
          { id: 'api', label: 'API p95', value: '184 ms', tone: 'ok' },
          { id: 'error', label: 'Error rate', value: '0.12%', tone: 'ok' },
          { id: 'queue', label: 'Queue depth', value: '1,204', tone: 'warn' },
          { id: 'edge', label: 'Edge health', value: 'Degraded', tone: 'bad' },
        ];

        return (
          <ul className="health">
            {checks.map((check) => (
              <li key={check.id} className={'health__item health__item--' + check.tone}>
                <span className="health__label">{check.label}</span>
                <span className="health__value">{check.value}</span>
              </li>
            ))}
          </ul>
        );
      }