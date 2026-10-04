      import { useCallback, useEffect, useMemo, useState } from 'react';
      import CitySearch from './components/CitySearch.jsx';
      import CurrentCard, { CurrentCardSkeleton } from './components/CurrentCard.jsx';
      import ForecastStrip from './components/ForecastStrip.jsx';
      import HourlyChart from './components/HourlyChart.jsx';
      import MetricTiles from './components/MetricTiles.jsx';
      import { WEATHER_DATA, conditionSpread } from './data/cities.js';
      import { convertTemp, formatClock, formatWind, relativeMinutes, skyPhase } from './utils/format.js';

      /** How long the skeleton stays up when a city is chosen. */
      const FETCH_MS = 620;

      /** Minutes since local midnight, used for the solar arc and the sky grading. */
      const nowMinutes = () => {
        const d = new Date();
        return d.getHours() * 60 + d.getMinutes();
      };

      const UNIT_COPY = {
        C: 'Celsius',
        F: 'Fahrenheit',
      };

      export default function App() {
        const [cityId, setCityId] = useState(WEATHER_DATA[0].id);
        const [unit, setUnit] = useState('C');
        const [dayIndex, setDayIndex] = useState(0);
        const [loading, setLoading] = useState(true);

        /**
         * A ticking minute counter. Without it the "updated n minutes ago" stamp and
         * the sun's position would both be frozen at whatever they were on first paint.
         */
        const [minutes, setMinutes] = useState(nowMinutes);

        useEffect(() => {
          const id = window.setInterval(() => setMinutes(nowMinutes()), 30000);
          return () => window.clearInterval(id);
        }, []);

        // Simulated fetch. Cleared on unmount so the timer cannot fire into a dead tree.
        useEffect(() => {
          setLoading(true);
          const id = window.setTimeout(() => setLoading(false), FETCH_MS);
          return () => window.clearTimeout(id);
        }, [cityId]);

        const city = useMemo(
          () => WEATHER_DATA.find((entry) => entry.id === cityId) || WEATHER_DATA[0],
          [cityId],
        );

        const phase = useMemo(
          () => skyPhase(city.daily.sunrise, city.daily.sunset, minutes),
          [city, minutes],
        );
        const night = phase === 'night';

        const handleSelectCity = useCallback((id) => {
          setCityId(id);
          setDayIndex(0);
        }, []);

        const selectedDay = city.forecast[dayIndex] || city.forecast[0];

        return (
          <div className={'sky sky--' + city.today.sky + ' sky--' + phase}>
            <a className="skip-link" href="#forecast">Skip to the forecast</a>

            <div className="sky__stars" aria-hidden="true" />

            <header className="wx-header">
              <div className="wx-header__brand">
                <span className="wx-header__mark" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                    strokeLinecap="round" strokeLinejoin="round" focusable="false">
                    <path d="M7.2 19h9.6a4.2 4.2 0 0 0 .5-8.37A6 6 0 0 0 6.1 12.2 3.4 3.4 0 0 0 7.2 19Z" />
                  </svg>
                </span>
                <div>
                  <p className="wx-header__title">Meridian Weather</p>
                  <p className="wx-header__sub">Six cities, seven days, no network calls</p>
                </div>
              </div>

              <div className="wx-header__tools">
                <div className="unit-toggle" role="group" aria-label="Temperature unit">
                  {['C', 'F'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={'unit-toggle__btn' + (unit === option ? ' unit-toggle__btn--on' : '')}
                      aria-pressed={unit === option}
                      onClick={() => setUnit(option)}
                    >
                      °{option}
                      <span className="sr-only"> ({UNIT_COPY[option]})</span>
                    </button>
                  ))}
                </div>
              </div>
            </header>

            <main className="wx-main">
              <CitySearch
                cities={WEATHER_DATA}
                activeId={city.id}
                onSelect={handleSelectCity}
                unit={unit}
                night={night}
              />

              {loading ? (
                <CurrentCardSkeleton />
              ) : (
                <CurrentCard city={city} unit={unit} phase={phase} updatedMinutes={city.updatedMinutes} />
              )}

              <section className="wx-conditions" aria-labelledby="spread-heading">
                <h2 className="sr-only" id="spread-heading">
                  Conditions across the week
                </h2>
                <div className="wx-conditions__row">
                  {conditionSpread(city).map((entry) => (
                    <span key={entry.id} className="spread-chip">
                      {entry.label}
                      <span className="spread-chip__count">{entry.count}d</span>
                    </span>
                  ))}
                </div>
              </section>

              <div id="forecast">
                <ForecastStrip
                  forecast={city.forecast}
                  selectedIndex={dayIndex}
                  onSelect={setDayIndex}
                  unit={unit}
                  night={night}
                />
              </div>

              <HourlyChart hourly={city.hourly} unit={unit} dayLabel={selectedDay.fullDate} night={night} />

              <MetricTiles
                city={city}
                unit={unit}
                phase={phase}
                nowMinutes={minutes}
                windLabel={formatWind(city.current.windKph, unit)}
              />

              <footer className="wx-footer">
                <p>
                  Sample data for {WEATHER_DATA.length} cities, generated locally at load time. Select a
                  city, switch units, or pick any day in the forecast to change the hourly curve.
                </p>
                <p className="wx-footer__stamp">
                  Local time {formatClock(
                    String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0'),
                  )}{' '}
                  &middot; observations {relativeMinutes(city.updatedMinutes)} old &middot; sky phase {phase}
                </p>
              </footer>
            </main>
          </div>
        );
      }