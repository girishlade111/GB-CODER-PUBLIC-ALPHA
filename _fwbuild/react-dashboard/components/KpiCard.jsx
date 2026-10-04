      import Sparkline from './Sparkline.jsx';
      import { DeltaBadge } from './Badge.jsx';
      import { formatKpi } from '../utils/format.js';

      /**
       * One KPI tile: label, headline value, trend delta, sparkline and a caption.
       *
       * The whole tile is an `<article>` rather than a button - nothing in it is
       * independently clickable yet, and pretending otherwise would be a lie to a
       * screen reader.
       */
      export default function KpiCard({ kpi }) {
        const tone = kpi.delta >= 0 ? 'accent' : 'warn';

        return (
          <article className={'kpi kpi--' + tone} aria-labelledby={'kpi-' + kpi.id}>
            <header className="kpi__head">
              <h3 className="kpi__label" id={'kpi-' + kpi.id}>
                {kpi.label}
              </h3>
              <DeltaBadge delta={kpi.delta} label={kpi.deltaLabel} />
            </header>

            <p className="kpi__value">{formatKpi(kpi.format, kpi.value)}</p>

            <div className="kpi__spark">
              <Sparkline series={kpi.series} tone={tone} label={kpi.label + ', last twelve months'} />
            </div>

            <p className="kpi__note">{kpi.note}</p>
          </article>
        );
      }