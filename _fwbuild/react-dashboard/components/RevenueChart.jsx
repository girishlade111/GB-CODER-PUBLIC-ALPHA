      import { useMemo, useRef, useState } from 'react';
      import { compactCurrency, niceMax, fullCurrency } from '../utils/format.js';

      /**
       * Revenue area chart.
       *
       * Every coordinate is worked out by hand - there is no charting library here.
       *
       *   viewBox is a fixed 720x300 user-unit space, so the SVG scales to its
       *   container with no resize listener and no measured pixel width.
       *
       *   The y scale is linear: `y = PAD_TOP + (1 - v / ceiling) * PLOT_H`.
       *   `ceiling` is the raw max rounded up to a round number by `niceMax`, so the
       *   four gridlines land on 100k / 200k / 300k rather than 247,318.
       *
       *   The x scale is `PAD_LEFT + i * step`, with `step = PLOT_W / (n - 1)`.
       *
       *   Hovering reads the nearest index by converting the pointer position back
       *   into user units and dividing by `step`, then rounding. That works without
       *   knowing the rendered size of the SVG, which is the point.
       *
       * The tooltip is drawn inside the SVG so its position is a `transform` attribute
       * rather than an inline percentage.
       */

      const W = 720;
      const H = 300;
      const PAD_TOP = 22;
      const PAD_BOTTOM = 40;
      const PAD_LEFT = 56;
      const PAD_RIGHT = 18;

      const PLOT_W = W - PAD_LEFT - PAD_RIGHT;
      const PLOT_H = H - PAD_TOP - PAD_BOTTOM;

      const TIPS_W = 176;
      const TIPS_H = 78;

      const Tip = ({ point, index, series }) => (
        <g className="chart-tip" transform={'translate(' + point.tipX + ' ' + point.tipY + ')'}>
          <rect className="chart-tip__bg" width={TIPS_W} height={TIPS_H} rx="10" />
          <text className="chart-tip__month" x={14} y={21}>
            {series[index].label} {series[index].key.slice(0, 4)}
          </text>
          <text className="chart-tip__value" x={14} y={45}>
            {fullCurrency(series[index].revenue)}
          </text>
          <text className="chart-tip__meta" x={14} y={64}>
            {series[index].orders.toLocaleString('en-GB')} orders
          </text>
        </g>
      );

      export default function RevenueChart({ series, target }) {
        const [hover, setHover] = useState(null);
        const svgRef = useRef(null);

        const chart = useMemo(() => {
          const values = series.map((row) => row.revenue);
          const ceiling = niceMax(Math.max(...values, target) * 1.08);
          const step = PLOT_W / (values.length - 1);

          const xFor = (i) => PAD_LEFT + i * step;
          const yFor = (v) => PAD_TOP + (1 - v / ceiling) * PLOT_H;

          const line = series.map((row, i) => xFor(i).toFixed(2) + ',' + yFor(row.revenue).toFixed(2));

          const area =
            'M ' + xFor(0).toFixed(2) + ' ' + (PAD_TOP + PLOT_H).toFixed(2) +
            ' L ' + line.join(' L ') +
            ' L ' + xFor(values.length - 1).toFixed(2) + ' ' + (PAD_TOP + PLOT_H).toFixed(2) +
            ' Z';

          // Four evenly spaced gridlines, labelled from the ceiling downwards.
          const ticks = [];
          const count = 4;
          for (let i = 0; i <= count; i++) {
            const value = (ceiling / count) * i;
            ticks.push({ value, y: yFor(value) });
          }

          const points = series.map((row, i) => ({
            i,
            cx: xFor(i),
            cy: yFor(row.revenue),
            revenue: row.revenue,
          }));

          return {
            ceiling,
            step,
            line: line.join(' '),
            area,
            ticks,
            points,
            targetY: yFor(target),
            xFor,
            yFor,
          };
        }, [series, target]);

        /** Maps a pointer event into the nearest data index. */
        const onPointerMove = (event) => {
          const node = svgRef.current;
          if (!node) return;

          const rect = node.getBoundingClientRect();
          if (!rect || rect.width === 0) return;

          // Rendered pixels -> user units, then -> a data index.
          const userX = ((event.clientX - rect.left) / rect.width) * W;
          const index = Math.round((userX - PAD_LEFT) / chart.step);
          setHover(index >= 0 && index < chart.points.length ? index : null);
        };

        const active = hover === null ? null : chart.points[hover];

        // Keep the tooltip inside the plot: flip it left near the right edge, and
        // below the point when the point sits high.
        const tipGeometry = active
          ? {
              tipX: Math.max(PAD_LEFT - 30, Math.min(W - PAD_RIGHT - TIPS_W, active.cx - TIPS_W / 2)),
              tipY: active.cy < TIPS_H + 16 ? active.cy + 14 : active.cy - TIPS_H - 12,
            }
          : null;

        const reached = series[series.length - 1].revenue >= target;
        const attainment = (series[series.length - 1].revenue / target) * 100;

        return (
          <section className="chart-card glass" aria-labelledby="revenue-heading">
            <header className="chart-card__head">
              <div>
                <h2 className="card-title" id="revenue-heading">
                  Revenue, last twelve months
                </h2>
                <p className="card-sub">Net of refunds. Target line is the board-approved 200k.</p>
              </div>

              <dl className="chart-card__stats">
                <div>
                  <dt>Attainment</dt>
                  <dd>{Math.round(attainment)}%</dd>
                </div>
                <div>
                  <dt>vs target</dt>
                  <dd className={reached ? 'is-good' : 'is-bad'}>
                    {reached ? 'Ahead' : 'Behind'} by{' '}
                    {compactCurrency(Math.abs(series[series.length - 1].revenue - target))}
                  </dd>
                </div>
              </dl>
            </header>

            <div className="chart-wrap">
              <svg
                ref={svgRef}
                className="chart"
                viewBox={'0 0 ' + W + ' ' + H}
                role="img"
                aria-label={
                  'Area chart of monthly revenue for the last twelve months, rising from ' +
                  fullCurrency(series[0].revenue) + ' to ' + fullCurrency(series[series.length - 1].revenue)
                }
                onPointerMove={onPointerMove}
                onPointerLeave={() => setHover(null)}
              >
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-line)" stopOpacity="0.34" />
                    <stop offset="100%" stopColor="var(--chart-line)" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {chart.ticks.map((tick) => (
                  <g key={tick.value}>
                    <line className="chart-grid" x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={tick.y} y2={tick.y} />
                    <text className="chart-ylabel" x={PAD_LEFT - 10} y={tick.y + 4} textAnchor="end">
                      {compactCurrency(tick.value)}
                    </text>
                  </g>
                ))}

                <line className="chart-target" x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={chart.targetY} y2={chart.targetY} />
                <text className="chart-target__label" x={W - PAD_RIGHT} y={chart.targetY - 6} textAnchor="end">
                  Target
                </text>

                <path className="chart-area" d={chart.area} fill="url(#revenueFill)" />
                <polyline className="chart-line" points={chart.line} fill="none" />

                {/* Hover band, drawn behind the markers. */}
                {active ? (
                  <line className="chart-cursor" x1={active.cx} x2={active.cx} y1={PAD_TOP} y2={PAD_TOP + PLOT_H} />
                ) : null}

                {chart.points.map((point) => (
                  <circle
                    key={point.i}
                    className={'chart-dot' + (hover === point.i ? ' chart-dot--on' : '')}
                    cx={point.cx}
                    cy={point.cy}
                    r={hover === point.i ? 5.5 : 3}
                  />
                ))}

                {series.map((row, i) => (
                  <text
                    key={row.key}
                    className="chart-xlabel"
                    x={chart.xFor(i)}
                    y={H - PAD_BOTTOM + 20}
                    textAnchor="middle"
                  >
                    {row.short}
                  </text>
                ))}

                {active && tipGeometry ? <Tip point={tipGeometry} index={hover} series={series} /> : null}
              </svg>

              <p className="sr-only" role="status" aria-live="polite">
                {active
                  ? series[hover].label + ': ' + fullCurrency(active.revenue) + ', ' + series[hover].orders + ' orders'
                  : ''}
              </p>
            </div>

            <p className="chart-card__foot">
              Hover the plot for the exact figure. Peak was{' '}
              {fullCurrency(Math.max(...series.map((row) => row.revenue)))} in{' '}
              {series.find((row) => row.revenue === Math.max(...series.map((r) => r.revenue))).label}.
            </p>
          </section>
        );
      }