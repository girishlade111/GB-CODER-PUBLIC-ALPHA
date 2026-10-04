      import { formatClock, minutesOf, sunProgress } from '../utils/format.js';

      /**
       * Detail tiles plus the solar arc.
       *
       * The arc is a quarter-ellipse path with the sun placed along it using
       * trigonometry. `sunProgress` returns a 0..1 fraction of the day elapsed, which
       * becomes an angle from 180 to 0 degrees; the sun's coordinates are then
       * `centre + r * cos/sin(angle)`. Everything is an SVG attribute, so the whole
       * component is style-free.
       */

      const ARC_W = 320;
      const ARC_H = 108;
      const CX = ARC_W / 2;
      const CY = 96;
      const R = 104;

      /** Point on the arc for a 0..1 progress value. 0 is the horizon at sunrise. */
      function sunPoint(progress) {
        const angle = Math.PI * (1 - progress);
        return { x: CX + R * Math.cos(angle), y: CY - R * Math.sin(angle) * 0.78 };
      }

      const Arc = ({ sunrise, sunset, progress, night }) => {
        const start = sunPoint(0);
        const end = sunPoint(1);
        const sun = sunPoint(progress);

        // The travelled portion of the track is drawn as a dashed path; the remainder
        // stays faint. Splitting with stroke-dasharray on the same path avoids a
        // second <path> with recomputed control points.
        const d = 'M ' + start.x + ' ' + start.y + ' A ' + R + ' ' + R * 0.78 + ' 0 0 1 ' + end.x + ' ' + end.y;

        return (
          <svg
            className="arc"
            viewBox={'0 0 ' + ARC_W + ' ' + ARC_H}
            role="img"
            aria-label={
              'Daylight from ' +
              formatClock(sunrise) +
              ' to ' +
              formatClock(sunset) +
              ', currently ' +
              Math.round(progress * 100) +
              ' percent through'
            }
          >
            <path className="arc__track" d={d} />
            <path
              className={'arc__elapsed' + (night ? ' arc__elapsed--full' : '')}
              d={d}
              pathLength="100"
              strokeDasharray="100"
              strokeDashoffset={String(100 - progress * 100)}
            />
            <line className="arc__horizon" x1="10" y1={CY} x2={ARC_W - 10} y2={CY} />
            <circle className={'arc__sun' + (night ? ' arc__sun--below' : '')} cx={sun.x} cy={sun.y} r="7" />
            <text className="arc__label" x={start.x - 4} y={CY + 18}>
              {formatClock(sunrise)}
            </text>
            <text className="arc__label arc__label--end" x={end.x + 4} y={CY + 18}>
              {formatClock(sunset)}
            </text>
          </svg>
        );
      };

      const TILE_GLYPHS = {
        wind: (
          <>
            <path d="M3 9h9.5a2.6 2.6 0 1 0-2.5-3.2" />
            <path d="M3 13.5h13a2.8 2.8 0 1 1-2.7 3.4" />
          </>
        ),
        drop: <path d="M12 3.2S6.2 9.6 6.2 13.6a5.8 5.8 0 0 0 11.6 0C17.8 9.6 12 3.2 12 3.2Z" />,
        sun: (
          <>
            <circle cx="12" cy="12" r="4.4" />
            <path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7" />
          </>
        ),
        eye: (
          <>
            <path d="M2.5 12S6 5.6 12 5.6 21.5 12 21.5 12 18 18.4 12 18.4 2.5 12 2.5 12Z" />
            <circle cx="12" cy="12" r="3.1" />
          </>
        ),
        gauge: (
          <>
            <path d="M3 12a9 9 0 0 1 18 0" />
            <path d="M12 12l4.6-3.2" />
            <circle cx="12" cy="12" r="1.4" />
          </>
        ),
      };

      const Glyph = ({ name }) => (
        <svg className="icon tile__icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          {TILE_GLYPHS[name]}
        </svg>
      );

      /**
       * One tile: a glyph, a label, a value and a caption. `meter` optionally adds a
       * bar whose width comes from a native `<progress>` rather than an inline style.
       */
      function Tile({ name, label, value, caption, tone, meter, meterMax, meterLabel }) {
        return (
          <article className={'tile tile--' + (tone || 'neutral')}>
            <header className="tile__head">
              <Glyph name={name} />
              <h3 className="tile__label">{label}</h3>
            </header>
            <p className="tile__value">{value}</p>
            {meter !== undefined ? (
              <progress className="tile__meter" max={meterMax} value={meter} aria-label={meterLabel} />
            ) : null}
            <p className="tile__caption">{caption}</p>
          </article>
        );
      }

      export default function MetricTiles({ city, unit, phase, nowMinutes, windLabel }) {
        const current = city.current;
        const night = phase === 'night';
        const progress = sunProgress(city.daily.sunrise, city.daily.sunset, nowMinutes);

        // Dawn and dusk get a middle tone on the two hour-scale meters.
        const softTone = phase === 'dawn' || phase === 'dusk' ? 'moderate' : night ? 'low' : 'high';

        const daylight = Math.round((minutesOf(city.daily.sunset) - minutesOf(city.daily.sunrise)) / 60 * 10) / 10;

        return (
          <section className="metrics" aria-labelledby="metrics-heading">
            <h2 className="sr-only" id="metrics-heading">
              Detailed conditions
            </h2>

            <div className="metrics__solar glass">
              <div className="solar__copy">
                <p className="section-title">Daylight</p>
                <p className="section-note">
                  {daylight} hours of daylight, {Math.round(progress * 100)}% elapsed.
                </p>
                <p className="solar__now">
                  {night ? 'Currently after sunset' : 'Currently above the horizon'}
                  <span className="solar__phase">Phase: {phase}</span>
                </p>
              </div>
              <Arc sunrise={city.daily.sunrise} sunset={city.daily.sunset} progress={progress} night={night} />
            </div>

            <div className="metrics__grid">
              <Tile
                name="wind"
                label="Wind"
                value={windLabel}
                caption={'Gusts to ' + current.gustKph + ' km/h, bearing ' + current.windDir}
                tone={current.windKph > 30 ? 'veryhigh' : softTone}
                meter={Math.min(100, current.windKph)}
                meterMax={80}
                meterLabel={'Wind speed ' + current.windKph + ' kilometres per hour'}
              />

              <Tile
                name="drop"
                label="Humidity"
                value={current.humidity + '%'}
                caption={'Dew point ' + Math.round(unit === 'F' ? current.dewC * 1.8 + 32 : current.dewC) + '°' + unit}
                tone={current.humidity > 80 ? 'veryhigh' : current.humidity > 60 ? 'high' : 'moderate'}
                meter={current.humidity}
                meterMax={100}
                meterLabel={'Relative humidity ' + current.humidity + ' percent'}
              />

              <Tile
                name="sun"
                label="UV index"
                value={current.uv + ''}
                caption={'Peak today. ' + (current.uv > 7 ? 'Cover up between 10:00 and 15:00.' : 'No protection needed.')}
                tone={current.uv > 10 ? 'extreme' : current.uv > 7 ? 'veryhigh' : current.uv > 5 ? 'high' : 'low'}
                meter={current.uv}
                meterMax={12}
                meterLabel={'UV index ' + current.uv}
              />

              <Tile
                name="eye"
                label="Visibility"
                value={current.visibilityKm + ' km'}
                caption={current.visibilityKm >= 10 ? 'Clear horizon.' : 'Reduced by moisture.'}
                tone={current.visibilityKm >= 20 ? 'low' : current.visibilityKm >= 10 ? 'moderate' : 'high'}
                meter={current.visibilityKm}
                meterMax={25}
                meterLabel={'Visibility ' + current.visibilityKm + ' kilometres'}
              />

              <Tile
                name="gauge"
                label="Pressure"
                value={current.pressure + ' hPa'}
                caption={current.pressure > 1015 ? 'High pressure, settled weather.' : 'Low pressure, unsettled weather.'}
                tone={current.pressure > 1015 ? 'moderate' : 'high'}
                meter={current.pressure - 990}
                meterMax={40}
                meterLabel={'Pressure ' + current.pressure + ' hectopascals'}
              />

              <Tile
                name="drop"
                label="Precipitation"
                value={city.today.precipChance + '%'}
                caption={'Today. ' + (city.today.precipChance > 50 ? 'Take an umbrella.' : 'Dry enough.')}
                tone={city.today.precipChance > 60 ? 'high' : 'moderate'}
                meter={city.today.precipChance}
                meterMax={100}
                meterLabel={'Chance of precipitation ' + city.today.precipChance + ' percent'}
              />
            </div>
          </section>
        );
      }