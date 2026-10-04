      import WeatherIcon from './WeatherIcon.jsx';
      import { convertTemp } from '../utils/format.js';

      /**
       * Seven-day strip.
       *
       * Rendered as a radio group: each day is one option, and choosing one drives the
       * hourly chart below. Using `role="radio"` rather than a row of buttons means a
       * screen reader announces "2 of 7 selected" instead of seven unrelated buttons.
       */
      export default function ForecastStrip({ forecast, selectedIndex, onSelect, unit, night }) {
        const onKeyDown = (event) => {
          if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
          event.preventDefault();
          const delta = event.key === 'ArrowRight' ? 1 : -1;
          const next = (selectedIndex + delta + forecast.length) % forecast.length;
          onSelect(next);
        };

        return (
          <section className="forecast glass" aria-labelledby="forecast-heading">
            <div className="forecast__head">
              <h2 className="section-title" id="forecast-heading">
                Seven-day forecast
              </h2>
              <p className="section-note">Pick a day to see its hourly curve.</p>
            </div>

            <div
              className="forecast__strip"
              role="radiogroup"
              aria-label="Day of the week"
              onKeyDown={onKeyDown}
            >
              {forecast.map((day, index) => {
                const selected = index === selectedIndex;
                return (
                  <button
                    key={day.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    tabIndex={selected ? 0 : -1}
                    className={'day' + (selected ? ' day--on' : '')}
                    onClick={() => onSelect(index)}
                  >
                    <span className="day__name">{day.weekday}</span>
                    <span className="day__date">{day.dateLabel}</span>

                    <span className="day__icon">
                      <WeatherIcon icon={day.icon} night={night && selected} size={40} />
                    </span>

                    <span className="day__temps">
                      <span className="day__hi">{convertTemp(day.highC, unit)}°</span>
                      <span className="day__lo">{convertTemp(day.lowC, unit)}°</span>
                    </span>

                    <span className="day__precip">
                      <svg className="icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                        <path d="M12 3.5S6 10 6 14a6 6 0 0 0 12 0c0-4-6-10.5-6-10.5Z" />
                      </svg>
                      {day.precipChance}%
                    </span>

                    <span className="day__wind">{day.windKph} km/h</span>

                    <span className="day__cond">{day.conditionLabel}</span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      }