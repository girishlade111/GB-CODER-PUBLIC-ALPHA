      import { useCallback, useEffect, useMemo, useState } from 'react';
      import Sidebar from './components/Sidebar.jsx';
      import Topbar from './components/Topbar.jsx';
      import KpiCard from './components/KpiCard.jsx';
      import DataTable from './components/DataTable.jsx';
      import RevenueChart from './components/RevenueChart.jsx';
      import { ActivityFeed, RegionBreakdown, HealthStrip } from './components/ActivityFeed.jsx';
      import { Gauge } from './components/Sparkline.jsx';
      import { useMediaQuery } from './hooks/useMediaQuery.js';
      import { KPI_SUMMARY, KPIS, ORDERS, REVENUE_SERIES, NAV_SECTIONS } from './data/mockData.js';
      import { fullCurrency } from './utils/format.js';

      const MONTHLY_TARGET = 200000;

      /** Flattens the nav sections so the topbar can name the current page. */
      const NAV_LOOKUP = NAV_SECTIONS.flatMap((section) =>
        section.items.map((item) => ({ id: item.id, label: item.label })),
      );

      export default function App() {
        const [active, setActive] = useState('dashboard');
        const [collapsed, setCollapsed] = useState(false);
        const [drawerOpen, setDrawerOpen] = useState(false);

        const isCompact = useMediaQuery('(max-width: 1023px)');
        const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

        const activeLabel = useMemo(
          () => (NAV_LOOKUP.find((item) => item.id === active) || { label: 'Dashboard' }).label,
          [active],
        );

        const lastRevenue = REVENUE_SERIES[REVENUE_SERIES.length - 1].revenue;
        const attainment = (lastRevenue / MONTHLY_TARGET) * 100;

        // Escape closes the phone drawer. Ignored on desktop, where there is no drawer.
        useEffect(() => {
          if (!drawerOpen) return undefined;
          const onKeyDown = (event) => {
            if (event.key === 'Escape') setDrawerOpen(false);
          };
          document.addEventListener('keydown', onKeyDown);
          return () => document.removeEventListener('keydown', onKeyDown);
        }, [drawerOpen]);

        // A resize across the breakpoint should not leave a hidden drawer flag behind.
        useEffect(() => {
          if (!isCompact) setDrawerOpen(false);
        }, [isCompact]);

        const closeDrawer = useCallback(() => setDrawerOpen(false), []);
        const openDrawer = useCallback(() => setDrawerOpen(true), []);
        const toggleCollapsed = useCallback(() => setCollapsed((value) => !value), []);

        return (
          <div
            className={
              'shell' +
              (collapsed ? ' shell--collapsed' : '') +
              (drawerOpen ? ' shell--drawer' : '')
            }
          >
            <a className="skip-link" href="#main">
              Skip to dashboard content
            </a>

            <Sidebar
              active={active}
              onSelect={setActive}
              collapsed={collapsed && !isCompact}
              onToggleCollapse={toggleCollapsed}
              mobileOpen={drawerOpen}
              onCloseMobile={closeDrawer}
            />

            <div className="shell__main">
              <Topbar
                activeLabel={activeLabel}
                onOpenMenu={openDrawer}
                isCompact={isCompact}
              />

              <main className="content" id="main">
                <section className="page-head" aria-labelledby="page-heading">
                  <div>
                    <h2 className="page-head__title" id="page-heading">
                      {activeLabel}
                    </h2>
                    <p className="page-head__sub">{KPI_SUMMARY}</p>
                  </div>

                  <div className="page-head__actions">
                    <Gauge percent={attainment} label="Revenue against target" />
                    <div className="page-head__meta">
                      <span className="page-head__meta-label">This month</span>
                      <strong>{fullCurrency(lastRevenue)}</strong>
                      <span className="page-head__meta-sub">against {fullCurrency(MONTHLY_TARGET)}</span>
                    </div>
                  </div>
                </section>

                <HealthStrip />

                <section className="kpis" aria-label="Key performance indicators">
                  {KPIS.map((kpi) => (
                    <KpiCard key={kpi.id} kpi={kpi} />
                  ))}
                </section>

                <div className="grid-2">
                  <RevenueChart series={REVENUE_SERIES} target={MONTHLY_TARGET} />
                  <RegionBreakdown />
                </div>

                <DataTable orders={ORDERS} isCompact={isCompact} />

                <ActivityFeed />

                <footer className="content__foot">
                  <p>
                    All figures are fixed sample data held in <code>data/mockData.js</code>. Chart geometry
                    is computed by hand in <code>components/RevenueChart.jsx</code>.
                  </p>
                  <p className="content__foot-note">
                    {reducedMotion
                      ? 'Reduced motion is on, so transitions are disabled.'
                      : 'Animations respect your system reduced-motion setting.'}
                  </p>
                </footer>
              </main>
            </div>
          </div>
        );
      }