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
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --bg-primary: #090d16;
  --bg-secondary: #0f172a;
  --bg-card: rgba(17, 24, 39, 0.7);
  --bg-card-hover: rgba(30, 41, 59, 0.7);
  --bg-input: #1e293b;
  
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-active: rgba(99, 102, 241, 0.4);
  --border-glow: 0 0 20px rgba(99, 102, 241, 0.15);

  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;

  --accent-primary: #6366f1;
  --accent-primary-hover: #4f46e5;
  --accent-cyan: #06b6d4;
  --accent-emerald: #10b981;
  --accent-amber: #f59e0b;
  --accent-rose: #f43f5e;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  --shadow-card: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
}

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  overflow-x: hidden;
}

/* Animations */
@keyframes pulseGlow {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

@keyframes cursorBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-pulse-glow {
  animation: pulseGlow 4s ease-in-out infinite;
}

.cursor-blink {
  display: inline-block;
  width: 2px;
  height: 1.1em;
  background: var(--accent-cyan);
  vertical-align: text-bottom;
  animation: cursorBlink 0.8s infinite;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: var(--bg-primary);
}
::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: var(--radius-full);
}
::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
`,
    },
    {
      path: 'App.jsx',
      content: `import React, { useState } from 'react';
import Header from './components/Header.jsx';
import MetricsOverview from './components/MetricsOverview.jsx';
import AgentPlayground from './components/AgentPlayground.jsx';
import WorkflowKanban from './components/WorkflowKanban.jsx';
import AnalyticsChart from './components/AnalyticsChart.jsx';
import ActivityFeed from './components/ActivityFeed.jsx';
import TeamModal from './components/TeamModal.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3200);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #090d16 65%)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxSizing: 'border-box',
        zIndex: 20
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', itemsCenter: 'center', gap: '12px', marginBottom: '32px', paddingLeft: '8px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.5)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '17px', letterSpacing: '-0.02em', color: '#fff' }}>Nexus AI</div>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 600 }}>ENTERPRISE CLOUD</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {[
            { id: 'overview', label: 'Overview', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
            { id: 'playground', label: 'Agent Playground', icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
            { id: 'workflows', label: 'Pipelines & Workflows', icon: 'M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1' },
            { id: 'analytics', label: 'Model Analytics', icon: 'M18 20V10M12 20V4M6 20v-6' },
          ].map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  fontWeight: active ? 600 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  borderLeft: active ? '3px solid var(--accent-primary)' : '3px solid transparent'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Quick Team Button */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <button
            onClick={() => setIsTeamModalOpen(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)' }}></div>
              <span>Acme Corp Team (14)</span>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>&gt;</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header onOpenTeam={() => setIsTeamModalOpen(true)} showToast={showToast} />

        <div style={{ padding: '28px 32px', flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <MetricsOverview />
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <AnalyticsChart />
                <ActivityFeed />
              </div>
              <WorkflowKanban showToast={showToast} />
            </div>
          )}

          {activeTab === 'playground' && <AgentPlayground showToast={showToast} />}
          {activeTab === 'workflows' && <WorkflowKanban showToast={showToast} />}
          {activeTab === 'analytics' && <AnalyticsChart expanded={true} />}
        </div>
      </main>

      {/* Team Modal */}
      {isTeamModalOpen && <TeamModal onClose={() => setIsTeamModalOpen(false)} showToast={showToast} />}

      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--accent-primary)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: 500,
          zIndex: 100,
          animation: 'shimmer 1s infinite'
        }}>
          <span style={{ color: 'var(--accent-cyan)' }}>✦</span>
          {notification}
        </div>
      )}
    </div>
  );
}
`,
    },
    {
      path: 'components/Header.jsx',
      content: `import React, { useState } from 'react';

export default function Header({ onOpenTeam, showToast }) {
  const [env, setEnv] = useState('Production (us-east-1)');

  return (
    <header style={{
      height: '64px',
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      {/* Search / Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '6px 14px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          width: '280px'
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            placeholder="Search agents, traces, models..."
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', outline: 'none', width: '100%' }}
          />
          <span style={{ fontSize: '10px', background: '#334155', padding: '2px 5px', borderRadius: '4px' }}>⌘K</span>
        </div>

        {/* Environment Selector */}
        <select
          value={env}
          onChange={(e) => {
            setEnv(e.target.value);
            showToast('Switched cluster to ' + e.target.value);
          }}
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            borderRadius: 'var(--radius-md)',
            padding: '6px 12px',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="Production (us-east-1)">Cluster: Production (us-east-1)</option>
          <option value="Staging (eu-central-1)">Cluster: Staging (eu-central-1)</option>
          <option value="Edge-Canary">Cluster: Edge Canary</option>
        </select>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={() => showToast('Cluster healthy: 99.99% uptime')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-full)',
            padding: '4px 12px',
            color: 'var(--accent-emerald)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 8px var(--accent-emerald)' }}></span>
          All Systems Operational
        </button>

        <button
          onClick={() => showToast('Exporting model inference audit log...')}
          style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '8px 16px',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)'
          }}
        >
          + Deploy Agent
        </button>
      </div>
    </header>
  );
}
`,
    },
    {
      path: 'components/MetricsOverview.jsx',
      content: `import React from 'react';

export default function MetricsOverview() {
  const cards = [
    { title: 'Inference Requests', value: '2,481,920', change: '+18.4%', trend: 'up', subtitle: 'Past 30 days', spark: [30, 45, 38, 65, 50, 75, 90, 85, 110] },
    { title: 'Avg Token Latency', value: '18.4 ms', change: '-14.2%', trend: 'good', subtitle: 'Target: < 35ms', spark: [55, 48, 42, 39, 32, 28, 24, 21, 18] },
    { title: 'Active Agent Nodes', value: '48 / 50', change: '96% Cap', trend: 'up', subtitle: 'Auto-scaling active', spark: [20, 24, 28, 35, 40, 42, 45, 48, 48] },
    { title: 'Est. Compute Cost', value: '$428.60', change: 'On Budget', trend: 'neutral', subtitle: 'Quota: $1,200', spark: [20, 30, 45, 60, 75, 80, 88, 92, 95] },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
      {cards.map((c, i) => (
        <div key={i} style={{
          backgroundColor: 'var(--bg-card)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-card)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{c.title}</span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: c.trend === 'up' || c.trend === 'good' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
              color: c.trend === 'up' || c.trend === 'good' ? 'var(--accent-emerald)' : 'var(--accent-primary)',
            }}>
              {c.change}
            </span>
          </div>

          <div style={{ fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            {c.value}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.subtitle}</span>

            {/* Sparkline */}
            <svg width="70" height="24" viewBox="0 0 90 30" fill="none">
              <path
                d={\`M \${c.spark.map((val, idx) => \`\${idx * 11} \${30 - (val / 110) * 26}\`).join(' L ')}\`}
                stroke="var(--accent-cyan)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
`,
    },
    {
      path: 'components/AgentPlayground.jsx',
      content: `import React, { useState } from 'react';

export default function AgentPlayground({ showToast }) {
  const [model, setModel] = useState('Claude 3.5 Sonnet');
  const [prompt, setPrompt] = useState('Analyze our Q3 churn rate metrics and suggest 3 high-impact retention strategies for enterprise tier users.');
  const [temperature, setTemperature] = useState(0.4);
  const [isStreaming, setIsStreaming] = useState(false);
  const [output, setOutput] = useState(
    'Based on telemetry from 14,200 enterprise seats in Q3:\\n\\n1. **Early Inactivity Alerts**: 64% of churned accounts exhibited a 40%+ drop in API calls 30 days prior. Implementing automatic proactive Slack outreach will recover an estimated $180k ARR.\\n2. **Custom Vector Ingestion Support**: The #1 support ticket category was RAG chunking bottlenecks. Offering 1-on-1 enterprise onboarding calls directly increases retention by 28%.\\n3. **Usage-Based Tier Flexibility**: Allow rollover credits for seasonal enterprise deployments.'
  );

  const runInference = () => {
    setIsStreaming(true);
    setOutput('');
    showToast('Inference started with ' + model);

    const fullResponse = 'Executing query across vectorized knowledge graph...\\n\\n✓ Ingestion complete (2.1s)\\n✓ Found 8 matching company case studies\\n\\n**Key Recommendation:**\\n- Deploy automated latency-budget alerts for all agent pipelines\\n- Provision isolated vector namespaces for EU client workloads\\n- Enforce JWT rotation via OAuth2 PKCE flow for enhanced compliance.\\n\\nEstimated execution cost: $0.0034 | Tokens: 418';
    let current = '';
    let idx = 0;

    const interval = setInterval(() => {
      if (idx < fullResponse.length) {
        current += fullResponse[idx];
        setOutput(current);
        idx += 3;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
        showToast('Inference complete! 418 tokens generated.');
      }
    }, 25);
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '28px',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#fff' }}>Interactive Agent Playground</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Test prompt completion, streaming parameters, and model outputs live.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet (200k Context)</option>
            <option value="GPT-4o Omnimodel">GPT-4o (128k Context)</option>
            <option value="Gemini 1.5 Pro">Gemini 1.5 Pro (1M Context)</option>
            <option value="DeepSeek Coder v2">DeepSeek Coder v2</option>
          </select>

          <button
            onClick={runInference}
            disabled={isStreaming}
            style={{
              background: isStreaming ? '#334155' : 'linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '8px 20px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isStreaming ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
            }}
          >
            {isStreaming ? 'Streaming Tokens...' : '▶ Run Inference'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '24px' }}>
        {/* Input Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              System Prompt & Instructions
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={8}
              style={{
                width: '100%',
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                color: '#fff',
                fontSize: '13px',
                lineHeight: '1.6',
                fontFamily: 'var(--font-sans)',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Temperature: {temperature}</span>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Lower is deterministic; higher is creative.</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              style={{ accentColor: 'var(--accent-cyan)', width: '140px' }}
            />
          </div>
        </div>

        {/* Output Panel */}
        <div style={{
          backgroundColor: 'rgba(10, 14, 26, 0.85)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>MODEL OUTPUT STREAM</span>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(output);
                showToast('Output copied to clipboard');
              }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}
            >
              📋 Copy
            </button>
          </div>

          <div style={{
            flex: 1,
            fontSize: '13px',
            lineHeight: '1.7',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'pre-wrap',
            overflowY: 'auto'
          }}>
            {output || <span style={{ color: 'var(--text-muted)' }}>Click 'Run Inference' to test model output...</span>}
            {isStreaming && <span className="cursor-blink"></span>}
          </div>
        </div>
      </div>
    </div>
  );
}
`,
    },
    {
      path: 'components/WorkflowKanban.jsx',
      content: `import React, { useState } from 'react';

export default function WorkflowKanban({ showToast }) {
  const [stages, setStages] = useState({
    ingestion: [
      { id: 't1', title: 'Parse Notion Knowledge Base', type: 'ETL Pipeline', priority: 'High', latency: '420ms' },
      { id: 't2', title: 'Ingest PostgreSQL User Tables', type: 'CDC Stream', priority: 'Medium', latency: '180ms' },
    ],
    reasoning: [
      { id: 't3', title: 'Claude 3.5 Intent Extraction', type: 'NLP Router', priority: 'High', latency: '34ms' },
      { id: 't4', title: 'Hybrid BM25 + Dense Embeddings', type: 'Vector DB', priority: 'Low', latency: '12ms' },
    ],
    tool_exec: [
      { id: 't5', title: 'Stripe Billing Webhook Callback', type: 'REST Tool', priority: 'High', latency: '88ms' },
    ],
    completed: [
      { id: 't6', title: 'Synthesize Executive PDF Summary', type: 'Render Worker', priority: 'Medium', latency: '920ms' },
    ]
  });

  const moveTask = (fromStage, toStage, taskId) => {
    const task = stages[fromStage].find(t => t.id === taskId);
    if (!task) return;

    setStages(prev => ({
      ...prev,
      [fromStage]: prev[fromStage].filter(t => t.id !== taskId),
      [toStage]: [...prev[toStage], task]
    }));

    showToast(\`Moved '\${task.title}' to \${toStage.toUpperCase()}\`);
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff' }}>Autonomous Agent Pipeline Stages</h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Live trace execution across agent reasoning clusters.</p>
        </div>
        <button
          onClick={() => showToast('New agent step created')}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 14px',
            color: '#fff',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          + Add Step
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { key: 'ingestion', label: '1. Ingestion & RAG', color: 'var(--accent-cyan)' },
          { key: 'reasoning', label: '2. LLM Reasoning', color: 'var(--accent-primary)' },
          { key: 'tool_exec', label: '3. Tool Execution', color: 'var(--accent-amber)' },
          { key: 'completed', label: '4. Verified Output', color: 'var(--accent-emerald)' },
        ].map(col => (
          <div key={col.key} style={{
            background: 'rgba(15, 23, 42, 0.5)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: col.color }}>{col.label}</span>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '10px' }}>
                {stages[col.key].length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stages[col.key].map(task => (
                <div key={task.id} style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>{task.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>{task.type}</span>
                    <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{task.latency}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                    {col.key !== 'completed' && (
                      <button
                        onClick={() => {
                          const keys = ['ingestion', 'reasoning', 'tool_exec', 'completed'];
                          const nextIdx = keys.indexOf(col.key) + 1;
                          moveTask(col.key, keys[nextIdx], task.id);
                        }}
                        style={{
                          background: 'rgba(99, 102, 241, 0.2)',
                          border: 'none',
                          color: '#fff',
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        Advance →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`,
    },
    {
      path: 'components/AnalyticsChart.jsx',
      content: `import React, { useState } from 'react';

export default function AnalyticsChart({ expanded }) {
  const [metric, setMetric] = useState('requests');

  const points = metric === 'requests' 
    ? [25, 45, 50, 75, 60, 95, 110, 85, 130, 140, 165, 180]
    : [4, 6, 3, 5, 2, 4, 3, 1, 2, 1, 0.5, 0.2];

  const maxVal = metric === 'requests' ? 200 : 8;

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#fff' }}>Cluster Performance Traces</h3>
          <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Real-time telemetry and error budgets.</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setMetric('requests')}
            style={{
              background: metric === 'requests' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Volume (Req/s)
          </button>
          <button
            onClick={() => setMetric('errors')}
            style={{
              background: metric === 'errors' ? 'var(--accent-rose)' : 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Error Rate (%)
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div style={{ height: expanded ? '320px' : '200px', width: '100%', position: 'relative' }}>
        <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={metric === 'requests' ? '#6366f1' : '#f43f5e'} stopOpacity="0.4" />
              <stop offset="100%" stopColor={metric === 'requests' ? '#6366f1' : '#f43f5e'} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[40, 90, 140, 190].map(y => (
            <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          ))}

          {/* Area */}
          <polygon
            points={\`0,200 \${points.map((p, i) => \`\${(i / (points.length - 1)) * 600},\${200 - (p / maxVal) * 170}\`).join(' ')} 600,200\`}
            fill="url(#chartGrad)"
          />

          {/* Line */}
          <polyline
            points={points.map((p, i) => \`\${(i / (points.length - 1)) * 600},\${200 - (p / maxVal) * 170}\`).join(' ')}
            fill="none"
            stroke={metric === 'requests' ? '#818cf8' : '#fb7185'}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Dots */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={(i / (points.length - 1)) * 600}
              cy={200 - (p / maxVal) * 170}
              r="4"
              fill="#fff"
              stroke={metric === 'requests' ? '#6366f1' : '#f43f5e'}
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
        <span>00:00 UTC</span>
        <span>06:00 UTC</span>
        <span>12:00 UTC</span>
        <span>18:00 UTC</span>
        <span>Live (Now)</span>
      </div>
    </div>
  );
}
`,
    },
    {
      path: 'components/ActivityFeed.jsx',
      content: `import React from 'react';

export default function ActivityFeed() {
  const events = [
    { title: 'Agent Node Autoscaled', desc: 'Deployed +4 replica pods in us-east-1', time: '2m ago', type: 'info' },
    { title: 'Vector Index Synced', desc: 'Embedded 24,000 document chunks', time: '14m ago', type: 'success' },
    { title: 'High Token Burst', desc: 'Tenant #418 reached 85% of rate limit', time: '41m ago', type: 'warning' },
    { title: 'Fine-Tuning Succeeded', desc: 'Model checkpoint epoch 4 loss: 0.142', time: '1h ago', type: 'success' },
  ];

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{ margin: '0 0 16px', fontSize: '17px', fontWeight: 800, color: '#fff' }}>Audit & Trace Feed</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {events.map((e, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              marginTop: '6px',
              backgroundColor: e.type === 'success' ? 'var(--accent-emerald)' : e.type === 'warning' ? 'var(--accent-amber)' : 'var(--accent-cyan)',
              boxShadow: \`0 0 8px \${e.type === 'success' ? 'var(--accent-emerald)' : e.type === 'warning' ? 'var(--accent-amber)' : 'var(--accent-cyan)'}\`
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{e.title}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{e.time}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{e.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`,
    },
    {
      path: 'components/TeamModal.jsx',
      content: `import React, { useState } from 'react';

export default function TeamModal({ onClose, showToast }) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [members, setMembers] = useState([
    { name: 'Sarah Chen', email: 'sarah@acme.ai', role: 'Owner', status: 'Active' },
    { name: 'Alex Rivera', email: 'alex@acme.ai', role: 'ML Lead', status: 'Active' },
    { name: 'Marcus Brody', email: 'm.brody@acme.ai', role: 'DevOps', status: 'Active' },
  ]);

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setMembers([...members, { name: inviteEmail.split('@')[0], email: inviteEmail, role: 'Developer', status: 'Invited' }]);
    showToast(\`Invitation sent to \${inviteEmail}\`);
    setInviteEmail('');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '520px',
        padding: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff' }}>Access Control & Team</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleInvite} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <input
            type="email"
            placeholder="colleague@acme.ai"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={{
              flex: 1,
              background: '#1e293b',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            style={{
              background: 'var(--accent-primary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '8px 16px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Invite
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {members.map((m, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{m.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.email}</div>
              </div>
              <span style={{ fontSize: '11px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`,
    }
  ]
};
