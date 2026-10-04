      import WeatherIcon from './WeatherIcon.jsx';
      import { convertTemp, degrees, formatClock, formatWind, relativeMinutes, windBand } from '../utils/format.js';

      /**
       * The hero card: current conditions for one city.
       *
       * Everything on screen is read from the dataset - including the gradient class
       * and the day/night icon swap - so there is no state in this component that
       * could disagree with the data behind it.
       */
      export default function CurrentCard({ city, unit, phase, updatedMinutes }) {
        const current = city.current;
        const night = phase === 'night';
        const today = city.today;

        return (
          <section className={'current current--' + phase} aria-labelledby="current-heading">
            <div className="current__place">
              <h2 className="current__city" id="current-heading">
                {city.name}
              </h2>
              <p className="current__region">
                {city.region}, {city.country}
                <span className="current__sep" aria-hidden="true">
                  &middot;
                </span>
                {city.lat}
                <span className="current__sep" aria-hidden="true">
                  &middot;
                </span>
                {city.timezone}
              </p>
            </div>

            <div className="current__icon">
              <WeatherIcon icon={city.icon} night={night} size={112} />
              <p className="current__cond">{city.conditionLabel}</p>
            </div>

            <div className="current__temp">
              <p className="current__degrees">
                <span className="current__number">{convertTemp(current.tempC, unit)}</span>
                <span className="current__unit">°{unit}</span>
              </p>
              <p className="current__feels">
                Feels like {degrees(convertTemp(current.feelsLikeC, unit))}
                {unit}
              </p>
              <p className="current__range">
                Today {degrees(convertTemp(today.lowC, unit))}
                {unit} to {degrees(convertTemp(today.highC, unit))}
                {unit}
                <span className="current__sep" aria-hidden="true">
                  &middot;
                </span>
                {today.precipChance}% chance of precipitation
              </p>
            </div>

            <dl className="current__facts">
              <div className="current__fact">
                <dt>Wind</dt>
                <dd>
                  {formatWind(current.windKph, unit)}
                  <span className="current__fact-note">
                    {current.windDir}, {windBand(current.windKph)}
                    {formatWind(current.gustKph, unit, true)}
                  </span>
                </dd>
              </div>
              <div className="current__fact">
                <dt>Humidity</dt>
                <dd>
                  {current.humidity}%
                  <span className="current__fact-note">Dew point {degrees(convertTemp(current.dewC, unit))}{unit}</span>
                </dd>
              </div>
              <div className="current__fact">
                <dt>Pressure</dt>
                <dd>
                  {current.pressure} hPa
                  <span className="current__fact-note">{current.pressure > 1015 ? 'High, settled' : 'Low, unsettled'}</span>
                </dd>
              </div>
            </dl>

            <p className="current__stamp">
              <span className={'live-dot' + (phase === 'night' ? ' live-dot--dim' : '')} aria-hidden="true" />
              Updated {relativeMinutes(updatedMinutes)}
              <span className="current__sep" aria-hidden="true">
                &middot;
              </span>
              Sunrise {formatClock(city.daily.sunrise)}
              <span className="current__sep" aria-hidden="true">
                &middot;
              </span>
              Sunset {formatClock(city.daily.sunset)}
            </p>
          </section>
        );
      }

      /**
       * Skeleton shown for the first moment after a city changes. It mirrors the real
       * card's layout so the swap does not shift anything.
       */
      export function CurrentCardSkeleton() {
        return (
          <section className="current current--skeleton" aria-busy="true" aria-label="Loading current conditions">
            <div className="sk sk--line sk--w40" />
            <div className="sk sk--round" />
            <div className="sk sk--line sk--w60 sk--tall" />
            <div className="sk sk--line sk--w80" />
            <div className="sk sk--grid">
              <div className="sk sk--block" />
              <div className="sk sk--block" />
              <div className="sk sk--block" />
            </div>
            <span className="sr-only">Loading the latest conditions</span>
          </section>
        );
      }