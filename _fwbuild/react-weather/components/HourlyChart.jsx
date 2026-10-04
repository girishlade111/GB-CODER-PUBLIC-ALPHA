      import { useMemo, useState } from 'react';
      import { convertTemp, convertTempPrecise, formatClock } from '../utils/format.js';

      /**
       * Hourly temperature chart, drawn as inline SVG.
       *
       * No charting library. The geometry is worked out by hand:
       *
       *   - `min`/`max` come from the series itself, so the bars always fill the plot.
       *   - A zero line is placed only when it falls inside the range, which keeps an
       *     ordinary mild day from getting a pointless axis.
       *   - Bar height = `(value - floor) / (ceiling - floor) * plotHeight`.
       *   - Precipitation is a second, muted bar behind each temperature bar.
       *
       * Sizing is responsive without a resize listener: the SVG uses
       * `preserveAspectRatio="none"`-free `viewBox` scaling with a fixed coordinate
       * system, and the bars are positioned in user units, so the chart reflows with
       * the container for free.
       */

      const W = 720;
      const H = 220;
      const PAD_TOP = 26;
      const PAD_BOTTOM = 46;
      const PAD_LEFT = 8;
      const PAD_RIGHT = 8;

      const PLOT_W = W - PAD_LEFT - PAD_RIGHT;
      const PLOT_H = H - PAD_TOP - PAD_BOTTOM;

      /** A tick every three hours, so labels never collide on a phone. */
      const LABEL_EVERY = 3;

      const TIP_W = 148;
      const TIP_H = 62;

      /** Tooltip box, clamped so it never hangs off either edge of the viewBox. */
      function Tooltip({ bar, unit }) {
        const left = Math.max(4, Math.min(W - TIP_W - 4, bar.cx - TIP_W / 2));
        // Flip below the bar when there is no room above it.
        const flip = bar.y < TIP_H + 14;
        const top = flip ? bar.y + bar.height + 8 : bar.y - TIP_H - 8;

        return (
          <g className="chart-tip" transform={'translate(' + left + ' ' + top + ')'}>
            <rect className="chart-tip__bg" width={TIP_W} height={TIP_H} rx="9" />
            <text className="chart-tip__time" x={TIP_W / 2} y={19}>
              {formatClock(bar.hour.time)}
            </text>
            <text className="chart-tip__temp" x={TIP_W / 2} y={39}>
              {convertTempPrecise(bar.value, unit)}°{unit}
            </text>
            <text className="chart-tip__precip" x={TIP_W / 2} y={54}>
              {bar.hour.precip}% precipitation
            </text>
          </g>
        );
      }

      export default function HourlyChart({ hourly, unit, dayLabel, night }) {
        const [hovered, setHovered] = useState(null);

        const geometry = useMemo(() => {
          const temps = hourly.map((h) => h.tempC);
          const rawMin = Math.min(...temps);
          const rawMax = Math.max(...temps);

          // Round outwards to whole degrees, then pad by a degree so the tallest bar
          // never touches the top edge.
          const lo = Math.floor(rawMin) - 1;
          const hi = Math.ceil(rawMax) + 1;
          const span = hi - lo || 1;

          const step = PLOT_W / hourly.length;
          const barW = Math.max(6, Math.min(22, step * 0.58));

          const yFor = (celsius) => PAD_TOP + (1 - (celsius - lo) / span) * PLOT_H;

          const bars = hourly.map((hour, i) => {
            const y = yFor(hour.tempC);
            const cx = PAD_LEFT + step * i + step / 2;
            return {
              hour,
              index: i,
              x: cx - barW / 2,
              y,
              width: barW,
              height: Math.max(2, PAD_TOP + PLOT_H - y),
              cx,
              tempY: y - 8,
              value: hour.tempC,
            };
          });

          // Horizontal gridlines at even intervals across the padded range.
          const ticks = [];
          const stepCount = 4;
          for (let i = 0; i <= stepCount; i++) {
            const value = lo + (span / stepCount) * i;
            ticks.push({ value: Math.round(value), y: yFor(value) });
          }

          const zeroY = lo <= 0 && hi >= 0 ? yFor(0) : null;

          return { lo, hi, step, bars, ticks, zeroY };
        }, [hourly]);

        const { lo, hi, step, bars, ticks, zeroY } = geometry;

        const active = hovered !== null ? bars[hovered] : null;

        return (
          <section className={'hourly glass hourly--' + (night ? 'night' : 'day')} aria-labelledby="hourly-heading">
            <div className="hourly__head">
              <h2 className="section-title" id="hourly-heading">
                Hourly temperature
              </h2>
              <p className="section-note">
                {dayLabel} &middot; {convertTemp(lo, unit)}°{unit} to {convertTemp(hi, unit)}°{unit}
              </p>
            </div>

            <div className="hourly__plot">
              <svg
                className="hourly__svg"
                viewBox={'0 0 ' + W + ' ' + H}
                role="img"
                aria-label={
                  'Hourly temperature bar chart. Low ' +
                  convertTemp(lo, unit) +
                  ' degrees, high ' +
                  convertTemp(hi, unit) + ' degrees.'
                }
                onMouseLeave={() => setHovered(null)}
              >
                <defs>
                  <linearGradient id="hourlyBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-bar-top)" />
                    <stop offset="100%" stopColor="var(--chart-bar-bottom)" />
                  </linearGradient>
                  <linearGradient id="precipBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-precip-top)" />
                    <stop offset="100%" stopColor="var(--chart-precip-bottom)" />
                  </linearGradient>
                </defs>

                {/* Gridlines and the y-axis labels. */}
                {ticks.map((tick) => (
                  <g key={tick.value}>
                    <line className="chart-grid" x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={tick.y} y2={tick.y} />
                    <text className="chart-ylabel" x={PAD_LEFT + 2} y={tick.y - 5}>
                      {convertTemp(tick.value, unit)}°
                    </text>
                  </g>
                ))}

                {zeroY !== null ? (
                  <line className="chart-zero" x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={zeroY} y2={zeroY} />
                ) : null}

                {/* Highlight band behind the hovered bar. */}
                {active ? (
                  <rect
                    className="chart-band"
                    x={PAD_LEFT + step * active.index}
                    y={PAD_TOP - 12}
                    width={step}
                    height={PLOT_H + 12}
                    rx="8"
                  />
                ) : null}

                {bars.map((bar) => (
                  <g key={bar.index}>
                    {/* Precipitation sits behind, in a separate scale. */}
                    {bar.hour.precip > 5 ? (
                      <rect
                        className="chart-precip"
                        x={bar.x}
                        y={PAD_TOP + PLOT_H - (bar.hour.precip / 100) * (PLOT_H * 0.34)}
                        width={bar.width}
                        height={(bar.hour.precip / 100) * (PLOT_H * 0.34)}
                        rx="3"
                        fill="url(#precipBar)"
                      />
                    ) : null}

                    <rect
                      className="chart-bar"
                      x={bar.x}
                      y={bar.y}
                      width={bar.width}
                      height={bar.height}
                      rx="4"
                      fill="url(#hourlyBar)"
                    />

                    {hovered === bar.index ? (
                      <text className="chart-value" x={bar.cx} y={bar.tempY}>
                        {convertTempPrecise(bar.value, unit)}°
                      </text>
                    ) : null}

                    {bar.index % LABEL_EVERY === 0 ? (
                      <text className="chart-xlabel" x={bar.cx} y={H - PAD_BOTTOM + 20}>
                        {formatClock(bar.hour.time)}
                      </text>
                    ) : null}

                    {/* Full-height hit area: an invisible rect makes the 6px bar easy to hover. */}
                    <rect
                      className="chart-hit"
                      x={PAD_LEFT + step * bar.index}
                      y={PAD_TOP - 12}
                      width={step}
                      height={PLOT_H + 24}
                      fill="transparent"
                      onMouseEnter={() => setHovered(bar.index)}
                      onFocus={() => setHovered(bar.index)}
                      onBlur={() => setHovered(null)}
                      tabIndex={0}
                      role="button"
                      aria-label={
                        bar.hour.time +
                        ', ' +
                        convertTemp(bar.value, unit) +
                        ' degrees, ' +
                        bar.hour.precip +
                        ' percent chance of precipitation'
                      }
                    />
                  </g>
                ))}

                {/*
                  The tooltip lives inside the SVG, so its position is just a pair of
                  x/y attributes. Doing it in HTML would have required an inline
                  percentage, which the styling rules here do not allow.
                */}
                {active ? <Tooltip bar={active} unit={unit} /> : null}
              </svg>
            </div>

            <p className="hourly__legend">
              <span className="legend-swatch legend-swatch--temp" aria-hidden="true" /> Temperature
              <span className="legend-swatch legend-swatch--precip" aria-hidden="true" /> Chance of precipitation
            </p>

            <p className="sr-only" role="status" aria-live="polite">
              {active
                ? formatClock(active.hour.time) +
                  ': ' +
                  convertTempPrecise(active.value, unit) +
                  ' degrees ' +
                  unit +
                  ', ' +
                  active.hour.precip +
                  ' percent chance of precipitation.'
                : ''}
            </p>
          </section>
        );
      }