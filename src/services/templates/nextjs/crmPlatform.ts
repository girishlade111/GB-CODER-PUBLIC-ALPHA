export default {
  files: [
    {
      path: 'main.jsx',
      content: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

const host = document.getElementById('root');

if (host) {
  createRoot(host).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
`,
    },
    {
      path: 'styles.css',
      content: `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --bg-app: #0b0f19;
  --bg-sidebar: #0f1523;
  --bg-surface: #141b2d;
  --bg-surface-hover: #1c253d;

  --border: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.15);

  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --text-subtle: #64748b;

  --accent-blue: #3b82f6;
  --accent-indigo: #6366f1;
  --accent-emerald: #10b981;
  --accent-amber: #f59e0b;
  --accent-rose: #f43f5e;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-app);
  color: var(--text-main);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

/* Custom scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 4px;
}
`,
    },
    {
      path: 'App.jsx',
      content: `import React, { useState } from 'react';
import RootLayout from './app/layout.jsx';
import DashboardPage from './app/page.jsx';
import PipelinePage from './app/pipeline/page.jsx';
import CustomersPage from './app/customers/page.jsx';
import AnalyticsPage from './app/analytics/page.jsx';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('/dashboard');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <RootLayout currentRoute={currentRoute} onNavigate={setCurrentRoute}>
      {currentRoute === '/dashboard' && <DashboardPage onNavigate={setCurrentRoute} showToast={showToast} />}
      {currentRoute === '/pipeline' && <PipelinePage showToast={showToast} />}
      {currentRoute === '/customers' && <CustomersPage showToast={showToast} />}
      {currentRoute === '/analytics' && <AnalyticsPage showToast={showToast} />}

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--accent-blue)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          fontSize: '13px',
          fontWeight: 600,
          zIndex: 100
        }}>
          ✦ {toast}
        </div>
      )}
    </RootLayout>
  );
}
`,
    },
    {
      path: 'app/layout.jsx',
      content: `import React from 'react';

export default function RootLayout({ children, currentRoute, onNavigate }) {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/pipeline', label: 'Deals Pipeline', icon: '🚀' },
    { path: '/customers', label: 'Accounts & Leads', icon: '🏢' },
    { path: '/analytics', label: 'Forecasting', icon: '📈' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '250px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxSizing: 'border-box'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '16px',
            color: '#fff'
          }}>
            R
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px', color: '#fff' }}>Relate CRM</div>
            <div style={{ fontSize: '10px', color: 'var(--accent-blue)', fontWeight: 700 }}>ENTERPRISE REV-OPS</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {navItems.map(item => {
            const active = currentRoute === item.path;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: active ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  border: 'none',
                  color: active ? '#fff' : 'var(--text-muted)',
                  fontSize: '13px',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
            JD
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Jessica Drake</div>
            <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>VP of Global Sales</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          height: '64px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'rgba(11, 15, 25, 0.8)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '6px 14px', width: '300px' }}>
            <span style={{ color: 'var(--text-subtle)' }}>🔍</span>
            <input
              placeholder="Search companies, leads, deals..."
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', outline: 'none', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--accent-emerald)', fontWeight: 600 }}>● Q4 Target: 114% Paced</span>
            <button
              onClick={() => onNavigate('/pipeline')}
              style={{
                background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '8px 16px',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              + Create Deal
            </button>
          </div>
        </header>

        <main style={{ flex: 1, padding: '32px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
`,
    },
    {
      path: 'app/page.jsx',
      content: `import React from 'react';

export default function DashboardPage({ onNavigate, showToast }) {
  const kpis = [
    { title: 'Total Pipeline ARR', value: '$2,450,000', change: '+22.4%', good: true },
    { title: 'Closed Won (This Quarter)', value: '$890,400', change: '+18.1%', good: true },
    { title: 'Win Rate Efficiency', value: '68.4%', change: '+4.2%', good: true },
    { title: 'Avg Sales Velocity', value: '18 Days', change: '-3 Days', good: true },
  ];

  const recentDeals = [
    { company: 'Datadog EMEA', value: '$180,000', stage: 'Negotiation', owner: 'Jessica Drake', prob: '85%' },
    { company: 'Stripe Payments UK', value: '$240,000', stage: 'Proposal Sent', owner: 'Marcus Chen', prob: '70%' },
    { company: 'Scale AI Platform', value: '$95,000', stage: 'Closed Won', owner: 'Sarah Jenkins', prob: '100%' },
  ];

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{kpi.title}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                {kpi.change}
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#fff' }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Split view: Pipeline Snapshot & Recent Action */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        {/* Deal Activity */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#fff' }}>High-Impact Enterprise Deals</h3>
            <button
              onClick={() => onNavigate('/pipeline')}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-blue)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              View Full Kanban →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentDeals.map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{d.company}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Owner: {d.owner}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-emerald)' }}>{d.value}</div>
                  <div style={{ fontSize: '11px', color: 'var(--accent-blue)', fontWeight: 600 }}>{d.stage} ({d.prob})</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Win Calculator */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 800, color: '#fff' }}>Sales Forecasting Engine</h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--text-muted)' }}>AI-driven predictive closing trajectory based on historical sales cycle velocity.</p>

            <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--accent-blue)', fontWeight: 700 }}>FORECASTED Q4 FINISH</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', margin: '4px 0' }}>$3,120,000</div>
              <div style={{ fontSize: '12px', color: 'var(--accent-emerald)' }}>94% probability of exceeding target quota</div>
            </div>
          </div>

          <button
            onClick={() => showToast('Forecasting report generated and exported to PDF')}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Export Executive Forecast
          </button>
        </div>
      </div>
    </div>
  );
}
`,
    },
    {
      path: 'app/pipeline/page.jsx',
      content: `import React, { useState } from 'react';

export default function PipelinePage({ showToast }) {
  const [stages, setStages] = useState({
    discovery: [
      { id: 'd1', company: 'Acme Health Systems', value: 85000, contact: 'Dr. Aris Thorne', tags: ['Healthcare', 'Tier 1'] },
      { id: 'd2', company: 'FinPulse Capital', value: 120000, contact: 'Sarah Lin', tags: ['Fintech'] },
    ],
    demo: [
      { id: 'd3', company: 'CloudScale Infrastructure', value: 210000, contact: 'David Ross', tags: ['SaaS', 'High Priority'] },
    ],
    proposal: [
      { id: 'd4', company: 'Nexus Logistics Global', value: 160000, contact: 'Elena Rostova', tags: ['Logistics'] },
    ],
    closed: [
      { id: 'd5', company: 'Omni Media Interactive', value: 340000, contact: 'Julian Drake', tags: ['Media', 'Annual'] },
    ]
  });

  const advanceDeal = (fromKey, toKey, dealId) => {
    const deal = stages[fromKey].find(d => d.id === dealId);
    if (!deal) return;

    setStages(prev => ({
      ...prev,
      [fromKey]: prev[fromKey].filter(d => d.id !== dealId),
      [toKey]: [...prev[toKey], deal]
    }));

    showToast(\`Advanced '\${deal.company}' to \${toKey.toUpperCase()}\`);
  };

  const getStageTotal = (list) => list.reduce((sum, d) => sum + d.value, 0);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px', color: '#fff' }}>Enterprise Sales Pipeline</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Click 'Advance' to move opportunities across pipeline milestones.</p>
        </div>
      </div>

      {/* Kanban Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
        {[
          { key: 'discovery', label: '1. Discovery & Demo', color: 'var(--accent-blue)' },
          { key: 'demo', label: '2. Solution Validation', color: 'var(--accent-indigo)' },
          { key: 'proposal', label: '3. Proposal & Legal', color: 'var(--accent-amber)' },
          { key: 'closed', label: '4. Closed / Won', color: 'var(--accent-emerald)' },
        ].map(col => {
          const total = getStageTotal(stages[col.key]);
          return (
            <div key={col.key} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: col.color }}>{col.label}</span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>\${(total / 1000).toFixed(0)}k</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stages[col.key].map(deal => (
                  <div key={deal.id} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{deal.company}</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: '8px' }}>
                      \${deal.value.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>Contact: {deal.contact}</div>

                    {col.key !== 'closed' && (
                      <button
                        onClick={() => {
                          const order = ['discovery', 'demo', 'proposal', 'closed'];
                          const nextKey = order[order.indexOf(col.key) + 1];
                          advanceDeal(col.key, nextKey, deal.id);
                        }}
                        style={{
                          width: '100%',
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: 'none',
                          color: '#fff',
                          padding: '6px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Advance Stage →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
`,
    },
    {
      path: 'app/customers/page.jsx',
      content: `import React, { useState } from 'react';

export default function CustomersPage({ showToast }) {
  const [search, setSearch] = useState('');

  const accounts = [
    { name: 'Scale AI', tier: 'Enterprise Tier', mrr: '$24,500', health: 98, status: 'Active' },
    { name: 'Vercel Inc.', tier: 'Enterprise Tier', mrr: '$48,000', health: 96, status: 'Active' },
    { name: 'Ramp Financial', tier: 'Growth Tier', mrr: '$12,400', health: 91, status: 'Active' },
    { name: 'Retool Global', tier: 'Enterprise Tier', mrr: '$32,000', health: 89, status: 'Active' },
    { name: 'Linear Orbit', tier: 'Growth Tier', mrr: '$8,500', health: 94, status: 'Active' },
  ];

  const filtered = accounts.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#fff' }}>Customer Accounts & Subscriptions</h2>
        <input
          placeholder="Filter accounts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '8px 14px', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '13px', outline: 'none' }}
        />
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '14px 20px' }}>ACCOUNT NAME</th>
              <th style={{ padding: '14px 20px' }}>PLAN TIER</th>
              <th style={{ padding: '14px 20px' }}>MONTHLY REVENUE</th>
              <th style={{ padding: '14px 20px' }}>ACCOUNT HEALTH</th>
              <th style={{ padding: '14px 20px' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((acc, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px 20px', fontWeight: 700, color: '#fff' }}>{acc.name}</td>
                <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{acc.tier}</td>
                <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--accent-emerald)' }}>{acc.mrr}</td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    {acc.health}% Healthy
                  </span>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <button
                    onClick={() => showToast('Opening profile for ' + acc.name)}
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: '#fff', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                  >
                    View CRM File
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`,
    },
    {
      path: 'app/analytics/page.jsx',
      content: `import React from 'react';

export default function AnalyticsPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#fff' }}>Revenue Trajectory & Forecasts</h2>

      {/* SVG Bar Chart */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: '16px', color: '#fff' }}>Quarterly ARR Run Rate ($ Millions)</h3>
        <div style={{ height: '220px', width: '100%' }}>
          <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
            {[0.8, 1.2, 1.6, 2.1, 2.45, 3.1].map((val, idx) => {
              const h = (val / 3.5) * 160;
              const x = 50 + idx * 90;
              return (
                <g key={idx}>
                  <rect
                    x={x}
                    y={200 - h}
                    width="44"
                    height={h}
                    rx="6"
                    fill="url(#barGrad)"
                  />
                  <text x={x + 22} y={190 - h} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">
                    \${val}M
                  </text>
                  <text x={x + 22} y="215" textAnchor="middle" fill="#64748b" fontSize="11">
                    Q{((idx % 4) + 1)}
                  </text>
                </g>
              );
            })}
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
`,
    }
  ]
};
