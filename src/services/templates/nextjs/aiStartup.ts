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
      content: `@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap');

:root {
  --font-sans: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'Geist Mono', monospace;

  --bg-deep: #000000;
  --bg-card: rgba(12, 12, 16, 0.7);
  --border: rgba(255, 255, 255, 0.12);
  --border-glow: rgba(99, 102, 241, 0.3);

  --text-main: #ededed;
  --text-muted: #888888;

  --accent-cyan: #00f2fe;
  --accent-purple: #7928ca;
  --accent-gradient: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
  --accent-glow: 0 0 24px rgba(0, 242, 254, 0.25);

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 18px;
  --radius-full: 9999px;
}

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-deep);
  color: var(--text-main);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

/* Aurora Radial Background */
.aurora-bg {
  position: absolute;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 900px;
  height: 500px;
  background: radial-gradient(ellipse at center, rgba(121, 40, 202, 0.25) 0%, rgba(0, 242, 254, 0.15) 45%, transparent 70%);
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
}

/* Glass panel */
.next-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}
`,
    },
    {
      path: 'App.jsx',
      content: `import React, { useState } from 'react';
import RootLayout from './app/layout.jsx';
import HomePage from './app/page.jsx';
import PlaygroundPage from './app/playground/page.jsx';
import PricingPage from './app/pricing/page.jsx';
import DocsPage from './app/docs/page.jsx';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('/');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };
  const setToastMessage = (msg) => setToast(msg);

  return (
    <RootLayout currentRoute={currentRoute} onNavigate={setCurrentRoute}>
      {currentRoute === '/' && <HomePage onNavigate={setCurrentRoute} showToast={showToast} />}
      {currentRoute === '/playground' && <PlaygroundPage showToast={showToast} />}
      {currentRoute === '/pricing' && <PricingPage onNavigate={setCurrentRoute} showToast={showToast} />}
      {currentRoute === '/docs' && <DocsPage showToast={showToast} />}

      {/* Floating Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'rgba(20, 20, 26, 0.95)',
          border: '1px solid var(--accent-cyan)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--accent-glow)',
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
  const routes = [
    { path: '/', label: 'Overview' },
    { path: '/playground', label: 'AI Playground' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/docs', label: 'Documentation' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div className="aurora-bg"></div>

      {/* Header */}
      <header style={{
        height: '64px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {/* Logo */}
          <div
            onClick={() => onNavigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px',
              color: '#000'
            }}>
              ▲
            </div>
            <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em', color: '#fff' }}>Synapse AI</span>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', gap: '8px' }}>
            {routes.map(r => (
              <button
                key={r.path}
                onClick={() => onNavigate(r.path)}
                style={{
                  background: currentRoute === r.path ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: 'none',
                  color: currentRoute === r.path ? '#fff' : 'var(--text-muted)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: currentRoute === r.path ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {r.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            padding: '4px 12px',
            fontSize: '12px',
            color: 'var(--text-muted)'
          }}>
            <span>★</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>18.4k</span> on GitHub
          </div>

          <button
            onClick={() => onNavigate('/playground')}
            style={{
              background: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '7px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)'
            }}
          >
            Launch Console →
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, zIndex: 1 }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: 'var(--text-muted)',
        zIndex: 1
      }}>
        <div>&copy; 2024 Synapse AI Systems, Inc. Next.js App Router Architecture.</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span style={{ cursor: 'pointer' }}>Status: All Systems Normal</span>
          <span style={{ cursor: 'pointer' }}>SOC2 Certified</span>
          <span style={{ cursor: 'pointer' }}>API SLA: 99.99%</span>
        </div>
      </footer>
    </div>
  );
}
`,
    },
    {
      path: 'app/page.jsx',
      content: `import React, { useState } from 'react';

export default function HomePage({ onNavigate, showToast }) {
  const [copyState, setCopyState] = useState(false);

  const curlCommand = 'curl https://api.synapse.ai/v1/chat/completions \\\\n  -H "Authorization: Bearer syn_live_89a42f" \\\\n  -d \\'{"model": "synapse-3.5-pro", "stream": true}\\'';

  const copyCode = () => {
    navigator.clipboard?.writeText(curlCommand);
    setCopyState(true);
    showToast('API cURL copied to clipboard!');
    setTimeout(() => setCopyState(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px 100px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(0, 242, 254, 0.1)',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          borderRadius: 'var(--radius-full)',
          padding: '4px 16px',
          color: 'var(--accent-cyan)',
          fontSize: '12px',
          fontWeight: 700,
          marginBottom: '24px'
        }}>
          <span>✦</span> ANN-POWERED VECTOR ROUTER v3.5
        </div>

        <h1 style={{ fontSize: '58px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, margin: '0 0 20px', color: '#fff' }}>
          Next-Generation LLM Infrastructure. <br />
          <span style={{ background: 'linear-gradient(135deg, #00f2fe, #4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Zero Cold Starts. 12ms TTFT.
          </span>
        </h1>

        <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto 36px', lineHeight: 1.6 }}>
          Run high-throughput inference across frontier models with stateful agent memory, vector caching, and automated speculative decoding.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button
            onClick={() => onNavigate('/playground')}
            style={{
              background: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 28px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(255, 255, 255, 0.3)'
            }}
          >
            Open Interactive Playground →
          </button>
          <button
            onClick={() => onNavigate('/docs')}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Explore API Docs
          </button>
        </div>
      </div>

      {/* Terminal / Code Box */}
      <div className="next-card" style={{ maxWidth: '800px', margin: '0 auto 80px', overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }}></span>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }}></span>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }}></span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '12px', fontFamily: 'var(--font-mono)' }}>bash - quickstart.sh</span>
          </div>
          <button
            onClick={copyCode}
            style={{ background: 'transparent', border: 'none', color: copyState ? 'var(--accent-cyan)' : 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}
          >
            {copyState ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        <pre style={{
          padding: '24px',
          margin: 0,
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: '#e2e8f0',
          lineHeight: '1.7',
          overflowX: 'auto'
        }}>
          <code>{curlCommand}</code>
        </pre>
      </div>

      {/* Feature Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {[
          { title: 'Sub-Millisecond Cache', icon: '⚡', desc: 'Semantic prompt embedding cache eliminates redundant inference costs by up to 68%.' },
          { title: 'Autonomous RAG Graph', icon: '🧠', desc: 'Hybrid dense + sparse document chunking with automated citation attribution.' },
          { title: 'Global Edge Router', icon: '🌐', desc: 'Smart model failover across 300+ edge locations with 99.99% availability guarantee.' },
        ].map((f, i) => (
          <div key={i} className="next-card" style={{ padding: '28px' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>{f.icon}</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 10px', color: '#fff' }}>{f.title}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
`,
    },
    {
      path: 'app/playground/page.jsx',
      content: `import React, { useState } from 'react';

export default function PlaygroundPage({ showToast }) {
  const [model, setModel] = useState('synapse-3.5-pro');
  const [prompt, setPrompt] = useState('Generate an optimized Next.js 14 server action with zod validation and optimistic UI updates.');
  const [temperature, setTemperature] = useState(0.2);
  const [isStreaming, setIsStreaming] = useState(false);
  const [tokens, setTokens] = useState(248);
  const [output, setOutput] = useState(
    '// app/actions/create-post.ts\\n"use server";\\n\\nimport { z } from "zod";\\nimport { revalidatePath } from "next/cache";\\n\\nconst PostSchema = z.object({\\n  title: z.string().min(3).max(100),\\n  content: z.string().min(10),\\n});\\n\\nexport async function createPostAction(formData: FormData) {\\n  const validated = PostSchema.safeParse({\\n    title: formData.get("title"),\\n    content: formData.get("content"),\\n  });\\n\\n  if (!validated.success) {\\n    return { error: validated.error.flatten().fieldErrors };\\n  }\\n\\n  // Atomic database transaction\\n  await db.post.create({ data: validated.data });\\n  revalidatePath("/posts");\\n  return { success: true };\\n}'
  );

  const handleRun = () => {
    setIsStreaming(true);
    setOutput('');
    showToast('Executing streaming inference on ' + model);

    const fullCode = '// app/actions/stream-response.ts\\n"use server";\\n\\nimport { OpenAIStream, StreamingTextResponse } from "ai";\\n\\nexport async function POST(req: Request) {\\n  const { prompt } = await req.json();\\n  const response = await synapse.chat.completions.create({\\n    model: "' + model + '",\\n    stream: true,\\n    messages: [{ role: "user", content: prompt }]\\n  });\\n\\n  const stream = OpenAIStream(response);\\n  return new StreamingTextResponse(stream);\\n}';

    let cur = '';
    let i = 0;
    const interval = setInterval(() => {
      if (i < fullCode.length) {
        cur += fullCode[i];
        setOutput(cur);
        i += 4;
        setTokens(prev => prev + 3);
      } else {
        clearInterval(interval);
        setIsStreaming(false);
        showToast('Stream completed successfully.');
      }
    }, 20);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px', color: '#fff' }}>Model Workbench</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Interactive token streaming and parameter tuning sandbox.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border)',
              color: '#fff',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              outline: 'none'
            }}
          >
            <option value="synapse-3.5-pro">synapse-3.5-pro (200k Context)</option>
            <option value="synapse-3.5-flash">synapse-3.5-flash (Ultra-Fast 8ms)</option>
            <option value="synapse-coder-omni">synapse-coder-omni (AST Trained)</option>
          </select>

          <button
            onClick={handleRun}
            disabled={isStreaming}
            style={{
              background: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 20px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: isStreaming ? 'not-allowed' : 'pointer'
            }}
          >
            {isStreaming ? 'Streaming...' : 'Run Query ▶'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
        {/* Editor Box */}
        <div className="next-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>INPUT PROMPT</span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={12}
            style={{
              width: '100%',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              color: '#fff',
              fontSize: '13px',
              lineHeight: '1.6',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              resize: 'vertical'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Temperature: {temperature}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              style={{ accentColor: 'var(--accent-cyan)' }}
            />
          </div>
        </div>

        {/* Output Stream Box */}
        <div className="next-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)' }}>COMPLETION STREAM</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{tokens} tokens</span>
          </div>

          <pre style={{
            flex: 1,
            margin: 0,
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            color: '#38bdf8',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            overflowY: 'auto'
          }}>
            <code>{output}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
`,
    },
    {
      path: 'app/pricing/page.jsx',
      content: `import React, { useState } from 'react';

export default function PricingPage({ onNavigate, showToast }) {
  const [annual, setAnnual] = useState(true);

  const tiers = [
    { name: 'Developer', price: 0, desc: 'Ideal for prototyping and hackathons.', features: ['10,000 monthly tokens', 'synapse-3.5-flash access', 'Community Discord support', 'Shared cluster latency'] },
    { name: 'Startup Pro', price: annual ? 49 : 59, popular: true, desc: 'High concurrency for scaling production apps.', features: ['2,500,000 monthly tokens', 'Full synapse-3.5-pro access', 'Custom fine-tune endpoints', 'Sub-20ms P99 guaranteed', 'Priority Slack triage'] },
    { name: 'Enterprise', price: 'Custom', desc: 'Dedicated VPC deployment & sovereign weights.', features: ['Unlimited token volume', 'Private weights VPC hosting', 'SOC2 / HIPAA BAA signed', '99.99% uptime SLA', 'Dedicated TAM engineer'] },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h2 style={{ fontSize: '40px', fontWeight: 800, margin: '0 0 14px', color: '#fff' }}>Transparent, Predictable Pricing</h2>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: '0 0 28px' }}>Scale seamlessly from first API call to billions of monthly tokens.</p>

        {/* Toggle */}
        <div style={{ display: 'inline-flex', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>
          <button
            onClick={() => setAnnual(false)}
            style={{
              background: !annual ? '#fff' : 'transparent',
              color: !annual ? '#000' : 'var(--text-muted)',
              border: 'none',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            style={{
              background: annual ? '#fff' : 'transparent',
              color: annual ? '#000' : 'var(--text-muted)',
              border: 'none',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Annual (Save 20%)
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {tiers.map((t, idx) => (
          <div
            key={idx}
            className="next-card"
            style={{
              padding: '32px',
              position: 'relative',
              borderColor: t.popular ? 'var(--accent-cyan)' : 'var(--border)',
              boxShadow: t.popular ? 'var(--accent-glow)' : 'none'
            }}
          >
            {t.popular && (
              <span style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--accent-cyan)',
                color: '#000',
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 10px',
                borderRadius: 'var(--radius-full)'
              }}>
                MOST POPULAR
              </span>
            )}

            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>{t.name}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', minHeight: '38px', margin: '0 0 20px' }}>{t.desc}</p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
              <span style={{ fontSize: '38px', fontWeight: 800, color: '#fff' }}>
                {typeof t.price === 'number' ? \`$\${t.price}\` : t.price}
              </span>
              {typeof t.price === 'number' && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/mo</span>}
            </div>

            <button
              onClick={() => showToast(\`Subscribed to \${t.name} Tier!\`)}
              style={{
                width: '100%',
                background: t.popular ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.08)',
                color: t.popular ? '#000' : '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: '28px'
              }}
            >
              Get Started →
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {t.features.map((f, fIdx) => (
                <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1' }}>
                  <span style={{ color: 'var(--accent-cyan)' }}>✓</span>
                  <span>{f}</span>
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
      path: 'app/docs/page.jsx',
      content: `import React, { useState } from 'react';

export default function DocsPage({ showToast }) {
  const [selectedTopic, setSelectedTopic] = useState('auth');

  const topics = [
    { id: 'auth', title: 'Authentication', desc: 'Secure your API calls with JWT or secret bearer keys.' },
    { id: 'streaming', title: 'Streaming Responses', desc: 'Server-Sent Events (SSE) protocol specification.' },
    { id: 'rag', title: 'Vector Knowledge Ingestion', desc: 'Embed documents and query with cosine similarity.' },
    { id: 'ratelimits', title: 'Rate Limiting & Tier Quotas', desc: 'Header specifications for token burst budgets.' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '36px' }}>
      {/* Sidebar Navigation */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '10px' }}>DEVELOPER API</span>
        {topics.map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedTopic(t.id)}
            style={{
              textAlign: 'left',
              background: selectedTopic === t.id ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
              border: selectedTopic === t.id ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid transparent',
              color: selectedTopic === t.id ? '#fff' : 'var(--text-muted)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {t.title}
          </button>
        ))}
      </aside>

      {/* Docs Body */}
      <div className="next-card" style={{ padding: '36px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px', color: '#fff' }}>
          {topics.find(t => t.id === selectedTopic)?.title}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 24px' }}>
          {topics.find(t => t.id === selectedTopic)?.desc}
        </p>

        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#38bdf8' }}>
          // Example JavaScript Fetch Call<br />
          const res = await fetch("https://api.synapse.ai/v1/models", &#123;<br />
          &nbsp;&nbsp;headers: &#123;<br />
          &nbsp;&nbsp;&nbsp;&nbsp;"Authorization": "Bearer " + process.env.SYNAPSE_API_KEY<br />
          &nbsp;&nbsp;&#125;<br />
          &#125;);<br />
          const data = await res.json();
        </div>

        <button
          onClick={() => showToast('SDK code snippet copied!')}
          style={{
            marginTop: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--border)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Copy SDK Snippet
        </button>
      </div>
    </div>
  );
}
`,
    }
  ]
};
