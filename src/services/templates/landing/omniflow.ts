export default {
  html: `
<div class="landing-page" id="top">
  <!-- Announcement Banner -->
  <div class="announcement-bar">
    <span class="badge-new">NEW v4.2</span>
    <span>Autonomous Workflow Orchestration engine is now live.</span>
    <a href="#preview" class="announcement-link">Explore features →</a>
  </div>

  <!-- Navigation -->
  <nav class="navbar" id="navbar">
    <div class="nav-container">
      <a href="#top" class="nav-brand">
        <div class="brand-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <span class="brand-name">OmniFlow<span class="brand-dot">.</span></span>
      </a>

      <div class="nav-links" id="nav-links">
        <a href="#preview" class="nav-item">Platform</a>
        <a href="#features" class="nav-item">Capabilities</a>
        <a href="#pricing" class="nav-item">Pricing</a>
        <a href="#faq" class="nav-item">FAQ</a>
      </div>

      <div class="nav-actions">
        <button class="btn btn-ghost" id="login-btn">Sign In</button>
        <button class="btn btn-primary" id="cta-header">Start Free Trial</button>
        <button class="menu-toggle" id="menu-toggle" aria-label="Toggle menu">☰</button>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <header class="hero-section">
    <div class="hero-glow hero-glow-1"></div>
    <div class="hero-glow hero-glow-2"></div>

    <div class="hero-content">
      <div class="pill-tag">
        <span class="pill-dot"></span>
        Enterprise Cloud Infrastructure Platform
      </div>
      <h1 class="hero-title">
        Orchestrate your entire stack with <span class="gradient-text">predictive intelligence</span>.
      </h1>
      <p class="hero-subtitle">
        Accelerate mission-critical workflows with zero-config distributed pipelines, sub-millisecond edge latency, and autonomous failover recovery.
      </p>

      <div class="hero-ctas">
        <button class="btn btn-primary btn-lg" id="hero-start-btn">
          <span>Deploy Cluster in 60s</span>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <button class="btn btn-secondary btn-lg" id="hero-demo-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span>Watch 2-Min Demo</span>
        </button>
      </div>

      <!-- Trust Badges -->
      <div class="trust-strip">
        <span class="trust-label">TRUSTED BY ENGINEERING TEAMS AT</span>
        <div class="trust-logos">
          <div class="trust-item">⚡ HYPERION</div>
          <div class="trust-item">◈ NEXUS LABS</div>
          <div class="trust-item">▲ VORTEX CLOUD</div>
          <div class="trust-item">✦ KESTREL DATA</div>
          <div class="trust-item">⬡ QUANTUM X</div>
        </div>
      </div>
    </div>

    <!-- Live Platform Preview Canvas -->
    <div class="preview-wrapper" id="preview">
      <div class="preview-window">
        <div class="preview-header">
          <div class="window-dots">
            <span class="dot dot-red"></span>
            <span class="dot dot-amber"></span>
            <span class="dot dot-green"></span>
          </div>
          <div class="preview-tabs">
            <button class="tab-btn active" data-tab="workflow">Pipeline Canvas</button>
            <button class="tab-btn" data-tab="telemetry">Edge Telemetry</button>
            <button class="tab-btn" data-tab="security">Zero-Trust Guard</button>
          </div>
          <div class="preview-status">
            <span class="status-pulse"></span>
            <span>All 48 Nodes Healthy</span>
          </div>
        </div>

        <!-- Dynamic Content Canvas -->
        <div class="preview-body" id="preview-body">
          <!-- Populated by JavaScript -->
        </div>
      </div>
    </div>
  </header>

  <!-- Metric Numbers Strip -->
  <section class="metrics-section">
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-val">99.999%</div>
        <div class="metric-name">SLA Uptime Guarantee</div>
        <div class="metric-delta">Global multi-region failover</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">1.2 ms</div>
        <div class="metric-name">p99 Edge Latency</div>
        <div class="metric-delta">Across 320+ edge locations</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">14.8M</div>
        <div class="metric-name">Events / Second</div>
        <div class="metric-delta">Stress-tested peak throughput</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">84%</div>
        <div class="metric-name">DevOps Overhead Reduced</div>
        <div class="metric-delta">Self-healing autonomous mesh</div>
      </div>
    </div>
  </section>

  <!-- Capabilities Grid -->
  <section class="section features-section" id="features">
    <div class="section-header">
      <span class="section-tag">ARCHITECTURAL CAPABILITIES</span>
      <h2 class="section-title">Engineered for extreme reliability & developer velocity</h2>
      <p class="section-desc">Everything your team needs to ship resilient cloud applications without operational headaches.</p>
    </div>

    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon icon-blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <h3 class="feature-title">Real-Time Reactive Streaming</h3>
        <p class="feature-text">High-concurrency event bus built on Rust and WebAssembly with automatic backpressure management.</p>
        <span class="feature-tag">Sub-millisecond</span>
      </div>

      <div class="feature-card">
        <div class="feature-icon icon-purple">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h3 class="feature-title">Zero-Trust Identity Mesh</h3>
        <p class="feature-text">Cryptographic mTLS between every microservice. Ephemeral tokens with hardware security key enforcement.</p>
        <span class="feature-tag">SOC2 & ISO 27001</span>
      </div>

      <div class="feature-card">
        <div class="feature-icon icon-emerald">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
        </div>
        <h3 class="feature-title">Autonomous Anomaly Healing</h3>
        <p class="feature-text">Machine learning models detect distributed memory leaks and connection spikes, rerouting traffic before failures.</p>
        <span class="feature-tag">Self-Healing</span>
      </div>

      <div class="feature-card">
        <div class="feature-icon icon-amber">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </div>
        <h3 class="feature-title">Declarative Infrastructure as Code</h3>
        <p class="feature-text">Type-safe configuration with native TypeScript, Python, and Go SDKs. Automatic dry-run validation on pull requests.</p>
        <span class="feature-tag">GitOps Native</span>
      </div>
    </div>
  </section>

  <!-- Interactive Pricing Calculator -->
  <section class="section pricing-section" id="pricing">
    <div class="section-header">
      <span class="section-tag">TRANSPARENT PRICING</span>
      <h2 class="section-title">Predictable tiers with zero surprise overage fees</h2>
      <p class="section-desc">Scale effortlessly from fast-growing startups to Fortune 500 enterprises.</p>

      <div class="billing-toggle-wrap">
        <span class="billing-label" id="label-monthly">Monthly</span>
        <button class="toggle-switch active" id="billing-switch" aria-label="Toggle annual billing"></button>
        <span class="billing-label" id="label-annual">Annual <span class="discount-pill">Save 20%</span></span>
      </div>
    </div>

    <div class="pricing-grid">
      <!-- Starter -->
      <div class="pricing-card">
        <div class="card-tier">Developer</div>
        <div class="card-price">
          <span class="currency">$</span>
          <span class="price-val" data-monthly="49" data-annual="39">39</span>
          <span class="price-unit">/ month</span>
        </div>
        <p class="card-desc">Ideal for small engineering squads launching their first production services.</p>
        <ul class="tier-features">
          <li>✓ Up to 5 Million Events / mo</li>
          <li>✓ 10 Distributed Pipeline Workers</li>
          <li>✓ 7-Day Metric Retention</li>
          <li>✓ Community & Discord Support</li>
        </ul>
        <button class="btn btn-outline" onclick="selectPlan('Developer')">Get Started</button>
      </div>

      <!-- Pro (Popular) -->
      <div class="pricing-card featured">
        <div class="popular-ribbon">MOST POPULAR</div>
        <div class="card-tier">Scale Enterprise</div>
        <div class="card-price">
          <span class="currency">$</span>
          <span class="price-val" data-monthly="199" data-annual="159">159</span>
          <span class="price-unit">/ month</span>
        </div>
        <p class="card-desc">For high-velocity engineering organizations requiring automated failover and compliance.</p>
        <ul class="tier-features">
          <li>✓ 50 Million Events / mo</li>
          <li>✓ Unlimited Distributed Workers</li>
          <li>✓ 90-Day Full Telemetry Retention</li>
          <li>✓ Automated mTLS & SSO / SAML</li>
          <li>✓ Dedicated Solutions Architect</li>
        </ul>
        <button class="btn btn-primary" onclick="selectPlan('Scale Enterprise')">Start 14-Day Free Trial</button>
      </div>

      <!-- Custom -->
      <div class="pricing-card">
        <div class="card-tier">Global Mesh</div>
        <div class="card-price">
          <span class="currency">$</span>
          <span class="price-val" data-monthly="699" data-annual="559">559</span>
          <span class="price-unit">/ month</span>
        </div>
        <p class="card-desc">Custom bare-metal or private VPC deployment with strict 99.999% SLA requirements.</p>
        <ul class="tier-features">
          <li>✓ 500M+ Dedicated Events</li>
          <li>✓ Custom On-Prem / VPC Deployment</li>
          <li>✓ 99.999% Financially-Backed SLA</li>
          <li>✓ 24/7/365 PagerDuty Escalation</li>
          <li>✓ Custom Security & HIPAA Audit</li>
        </ul>
        <button class="btn btn-outline" onclick="selectPlan('Global Mesh')">Contact Architecture Team</button>
      </div>
    </div>
  </section>

  <!-- FAQ Accordion -->
  <section class="section faq-section" id="faq">
    <div class="section-header">
      <span class="section-tag">FREQUENTLY ASKED QUESTIONS</span>
      <h2 class="section-title">Answers to common architectural questions</h2>
    </div>

    <div class="faq-list">
      <div class="faq-item active">
        <button class="faq-question">
          <span>How does OmniFlow achieve sub-2ms edge latency?</span>
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-answer">
          We operate across 320 Anycast points of presence worldwide. Workflows run inside lightweight isolated V8/Wasm micro-runtimes positioned right at your user traffic gateways, avoiding roundtrips to central cloud datacenters.
        </div>
      </div>

      <div class="faq-item">
        <button class="faq-question">
          <span>Can OmniFlow connect to our existing AWS / GCP / Kubernetes cluster?</span>
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-answer">
          Yes! OmniFlow integrates natively via a lightweight Helm chart or Terraform module. You can securely orchestrate workloads spanning hybrid on-premises servers and public clouds through encrypted WireGuard tunnels.
        </div>
      </div>

      <div class="faq-item">
        <button class="faq-question">
          <span>What happens if our event volume exceeds our monthly tier limit?</span>
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-answer">
          Unlike legacy vendors, we never throttle or drop production transactions. Soft alerts notify your team at 80% and 100% capacity, giving you time to adjust tiers or pay a flat, transparent per-million rate.
        </div>
      </div>
    </div>
  </section>

  <!-- Newsletter & CTA Footer -->
  <footer class="footer-section">
    <div class="footer-cta-box">
      <h2 class="cta-heading">Ready to modernize your distributed pipeline?</h2>
      <p class="cta-sub">Join over 10,000 developers deploying resilient cloud applications on OmniFlow.</p>

      <form class="subscribe-form" id="subscribe-form">
        <input type="email" id="sub-email" placeholder="Enter your work email (e.g. alex@company.com)" required />
        <button type="submit" class="btn btn-primary">Claim $500 Cloud Credits</button>
      </form>
      <div class="form-feedback" id="form-feedback"></div>
    </div>

    <div class="footer-bottom">
      <div>© 2026 OmniFlow Technologies Inc. All rights reserved. Enterprise SOC2 Type II Certified.</div>
      <div class="footer-links">
        <a href="#top">Privacy Policy</a>
        <a href="#top">Security Whitepaper</a>
        <a href="#top">System Status: Operational</a>
      </div>
    </div>
  </footer>

  <!-- Toast Notification -->
  <div class="toast-popup" id="toast-popup"></div>
</div>
`,
  css: `
:root {
  --bg-dark: #0a0d14;
  --bg-card: rgba(18, 24, 38, 0.7);
  --border: rgba(255, 255, 255, 0.08);
  --border-focus: rgba(59, 130, 246, 0.5);
  --accent-blue: #3b82f6;
  --accent-cyan: #06b6d4;
  --accent-purple: #8b5cf6;
  --accent-emerald: #10b981;
  --accent-amber: #f59e0b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background-color: var(--bg-dark);
  color: var(--text-main);
  font-family: var(--font);
  line-height: 1.6;
  overflow-x: hidden;
}

/* Announcement Bar */
.announcement-bar {
  background: linear-gradient(90deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15));
  border-bottom: 1px solid var(--border);
  padding: 8px 16px;
  text-align: center;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.badge-new {
  background: var(--accent-blue);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}
.announcement-link { color: var(--accent-cyan); text-decoration: none; font-weight: 600; }
.announcement-link:hover { text-decoration: underline; }

/* Navbar */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 13, 20, 0.8);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}
.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #fff;
}
.brand-logo {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.brand-logo svg { width: 18px; height: 18px; }
.brand-name { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; }
.brand-dot { color: var(--accent-cyan); }
.nav-links { display: flex; gap: 28px; }
.nav-item { color: var(--text-muted); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
.nav-item:hover { color: #fff; }
.nav-actions { display: flex; gap: 12px; align-items: center; }
.menu-toggle { display: none; background: none; border: none; color: #fff; font-size: 22px; cursor: pointer; }

/* Buttons */
.btn {
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
}
.btn-ghost { background: transparent; border: 1px solid transparent; color: var(--text-muted); }
.btn-ghost:hover { color: #fff; }
.btn-primary {
  background: linear-gradient(135deg, var(--accent-blue), #2563eb);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.15);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.6);
}
.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  color: #fff;
}
.btn-secondary:hover { background: rgba(255, 255, 255, 0.1); }
.btn-outline {
  background: transparent;
  border: 1px solid var(--border);
  color: #fff;
  width: 100%;
}
.btn-outline:hover { border-color: var(--accent-blue); color: var(--accent-blue); }
.btn-lg { padding: 12px 24px; font-size: 15px; border-radius: 10px; }

/* Hero Section */
.hero-section {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 24px 60px;
  text-align: center;
  overflow: visible;
}
.hero-glow {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  opacity: 0.25;
  z-index: 0;
}
.hero-glow-1 { top: -80px; left: 10%; background: #3b82f6; }
.hero-glow-2 { top: 40px; right: 10%; background: #8b5cf6; }

.hero-content { position: relative; z-index: 1; max-width: 860px; margin: 0 auto; }
.pill-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent-cyan);
  margin-bottom: 24px;
}
.pill-dot { width: 6px; height: 6px; background: var(--accent-cyan); border-radius: 50%; }
.hero-title {
  font-size: 52px;
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -1.5px;
  margin-bottom: 20px;
  color: #fff;
}
.gradient-text {
  background: linear-gradient(135deg, #60a5fa, #c084fc, #38bdf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero-subtitle {
  font-size: 18px;
  color: var(--text-muted);
  max-width: 720px;
  margin: 0 auto 36px;
}
.hero-ctas { display: flex; gap: 16px; justify-content: center; margin-bottom: 60px; }

/* Trust Strip */
.trust-strip { border-top: 1px solid var(--border); padding-top: 32px; }
.trust-label { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #64748b; margin-bottom: 16px; display: block; }
.trust-logos { display: flex; justify-content: center; gap: 36px; flex-wrap: wrap; }
.trust-item { font-size: 13px; font-weight: 800; color: #475569; letter-spacing: 1px; }

/* Preview Canvas */
.preview-wrapper { margin-top: 50px; position: relative; z-index: 2; }
.preview-window {
  background: #111625;
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05);
  overflow: hidden;
  text-align: left;
}
.preview-header {
  background: rgba(18, 24, 38, 0.95);
  border-bottom: 1px solid var(--border);
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.window-dots { display: flex; gap: 6px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot-red { background: #ef4444; }
.dot-amber { background: #f59e0b; }
.dot-green { background: #10b981; }
.preview-tabs { display: flex; gap: 8px; }
.tab-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn.active { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.preview-status { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--accent-emerald); font-weight: 700; }
.status-pulse { width: 8px; height: 8px; background: var(--accent-emerald); border-radius: 50%; box-shadow: 0 0 8px var(--accent-emerald); }
.preview-body { padding: 24px; min-height: 280px; }

/* Metrics Section */
.metrics-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 24px 80px;
}
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.metric-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  backdrop-filter: blur(12px);
}
.metric-val { font-size: 36px; font-weight: 900; color: #fff; margin-bottom: 4px; }
.metric-name { font-size: 13px; font-weight: 700; color: #e2e8f0; margin-bottom: 4px; }
.metric-delta { font-size: 12px; color: var(--accent-cyan); }

/* Features Section */
.section { max-width: 1200px; margin: 0 auto; padding: 60px 24px; }
.section-header { text-align: center; max-width: 700px; margin: 0 auto 50px; }
.section-tag { font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: var(--accent-cyan); margin-bottom: 10px; display: block; }
.section-title { font-size: 34px; font-weight: 800; letter-spacing: -0.8px; margin-bottom: 14px; color: #fff; }
.section-desc { font-size: 15px; color: var(--text-muted); }

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}
.feature-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 32px;
  transition: all 0.25s ease;
  position: relative;
}
.feature-card:hover {
  transform: translateY(-3px);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
}
.feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.feature-icon svg { width: 22px; height: 22px; }
.icon-blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
.icon-purple { background: rgba(139, 92, 246, 0.15); color: #c084fc; }
.icon-emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.icon-amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.feature-title { font-size: 19px; font-weight: 700; margin-bottom: 10px; color: #fff; }
.feature-text { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 18px; }
.feature-tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #e2e8f0;
}

/* Pricing */
.billing-toggle-wrap {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.04);
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid var(--border);
  margin-top: 24px;
}
.billing-label { font-size: 13px; font-weight: 600; color: var(--text-muted); }
.discount-pill { background: var(--accent-emerald); color: #000; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 999px; }
.toggle-switch {
  width: 44px;
  height: 24px;
  background: #334155;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
}
.toggle-switch.active { background: var(--accent-blue); }
.toggle-switch::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
}
.toggle-switch.active::after { transform: translateX(20px); }

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  align-items: stretch;
}
.pricing-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 36px 28px;
  display: flex;
  flex-direction: column;
  position: relative;
}
.pricing-card.featured {
  border-color: var(--accent-blue);
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);
  background: linear-gradient(180deg, rgba(24, 34, 58, 0.8), rgba(18, 24, 38, 0.8));
}
.popular-ribbon {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple));
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 999px;
  letter-spacing: 1px;
}
.card-tier { font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 12px; }
.card-price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 14px; }
.currency { font-size: 24px; font-weight: 700; color: var(--text-muted); }
.price-val { font-size: 44px; font-weight: 900; color: #fff; }
.price-unit { font-size: 13px; color: var(--text-muted); }
.card-desc { font-size: 13px; color: var(--text-muted); min-height: 40px; margin-bottom: 24px; }
.tier-features { list-style: none; display: flex; flex-direction: column; gap: 12px; font-size: 13px; color: #cbd5e1; margin-bottom: 32px; flex: 1; }
.tier-features li { display: flex; gap: 8px; }

/* FAQ */
.faq-list { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px; }
.faq-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.faq-item.active { border-color: rgba(59, 130, 246, 0.4); }
.faq-question {
  width: 100%;
  padding: 18px 20px;
  background: none;
  border: none;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  text-align: left;
}
.faq-icon { font-size: 20px; color: var(--text-muted); transition: transform 0.2s; }
.faq-item.active .faq-icon { transform: rotate(45deg); color: var(--accent-blue); }
.faq-answer {
  display: none;
  padding: 0 20px 20px;
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
}
.faq-item.active .faq-answer { display: block; }

/* Footer */
.footer-section {
  max-width: 1200px;
  margin: 60px auto 0;
  padding: 0 24px 40px;
}
.footer-cta-box {
  background: linear-gradient(135deg, rgba(30, 58, 138, 0.4), rgba(88, 28, 135, 0.4));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 48px;
  text-align: center;
  margin-bottom: 60px;
}
.cta-heading { font-size: 32px; font-weight: 800; color: #fff; margin-bottom: 12px; }
.cta-sub { font-size: 15px; color: var(--text-muted); margin-bottom: 28px; }
.subscribe-form {
  display: flex;
  gap: 10px;
  max-width: 520px;
  margin: 0 auto;
}
.subscribe-form input {
  flex: 1;
  background: #0f172a;
  border: 1px solid var(--border);
  padding: 12px 18px;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  outline: none;
}
.subscribe-form input:focus { border-color: var(--accent-blue); }
.form-feedback { margin-top: 12px; font-size: 13px; font-weight: 600; min-height: 20px; }
.form-feedback.success { color: var(--accent-emerald); }
.footer-bottom {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid var(--border);
  padding-top: 24px;
  font-size: 12px;
  color: #64748b;
  flex-wrap: wrap;
  gap: 12px;
}
.footer-links { display: flex; gap: 20px; }
.footer-links a { color: #64748b; text-decoration: none; }
.footer-links a:hover { color: #fff; }

/* Toast */
.toast-popup {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #1e293b;
  border: 1px solid var(--accent-blue);
  color: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  font-size: 13px;
  font-weight: 600;
  display: none;
  z-index: 1000;
}

@media (max-width: 900px) {
  .hero-title { font-size: 38px; }
  .features-grid, .pricing-grid, .metrics-grid { grid-template-columns: 1fr; }
  .nav-links { display: none; }
  .menu-toggle { display: block; }
  .subscribe-form { flex-direction: column; }
}
`,
  javascript: `
// OmniFlow Interactive Demo & State Handler
(function() {
  function showToast(msg) {
    const toast = document.getElementById('toast-popup');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3200);
  }

  window.selectPlan = function(plan) {
    showToast('Plan selected: ' + plan + '. Initializing workspace setup...');
  };

  // Preview Tabs state
  const tabs = document.querySelectorAll('.tab-btn');
  const previewBody = document.getElementById('preview-body');

  const previews = {
    workflow: \`
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:13px; font-weight:700; color:#fff;">Distributed Pipeline: ingress-edge-04</span>
          <span style="font-size:11px; color:#34d399; background:rgba(16,185,129,0.1); padding:4px 8px; border-radius:4px;">AUTO-ROUTING ENABLED</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-top:8px;">
          <div style="background:#1a2236; border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:14px;">
            <div style="font-size:11px; color:#94a3b8; margin-bottom:4px;">STEP 1: ANYCAST INGRESS</div>
            <div style="font-size:14px; font-weight:700; color:#fff;">Edge Gateway</div>
            <div style="font-size:12px; color:#38bdf8; margin-top:6px;">0.8ms latency</div>
          </div>
          <div style="background:#1a2236; border:1px solid rgba(59,130,246,0.3); border-radius:8px; padding:14px;">
            <div style="font-size:11px; color:#94a3b8; margin-bottom:4px;">STEP 2: RUST WASM WORKER</div>
            <div style="font-size:14px; font-weight:700; color:#60a5fa;">Payload Transform</div>
            <div style="font-size:12px; color:#34d399; margin-top:6px;">0.3ms compute</div>
          </div>
          <div style="background:#1a2236; border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:14px;">
            <div style="font-size:11px; color:#94a3b8; margin-bottom:4px;">STEP 3: ZERO-TRUST MTLS</div>
            <div style="font-size:14px; font-weight:700; color:#fff;">Security Filter</div>
            <div style="font-size:12px; color:#34d399; margin-top:6px;">100% verified</div>
          </div>
          <div style="background:#1a2236; border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:14px;">
            <div style="font-size:11px; color:#94a3b8; margin-bottom:4px;">STEP 4: DISPATCH</div>
            <div style="font-size:14px; font-weight:700; color:#fff;">Cluster Replicas</div>
            <div style="font-size:12px; color:#38bdf8; margin-top:6px;">12/12 acked</div>
          </div>
        </div>
        <div style="background:#0c101d; border-radius:8px; padding:12px 16px; font-family:monospace; font-size:12px; color:#94a3b8; border:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between;">
          <span>[STREAM-LOG] 2026-10-04T15:10:22Z dispatches=14,291/s errors=0 dropped=0</span>
          <span style="color:#60a5fa; cursor:pointer;" onclick="alert('Viewing full raw tracing buffer: trace-id=0x9f4a12c')">View Trace Details →</span>
        </div>
      </div>
    \`,
    telemetry: \`
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div style="display:flex; justify-content:space-between;">
          <span style="font-size:13px; font-weight:700; color:#fff;">Live POP Health & Throughput</span>
          <span style="font-size:12px; color:#38bdf8;">Regions: US-East, EU-Central, AP-South</span>
        </div>
        <div style="height:140px; display:flex; align-items:flex-end; gap:8px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.08);">
          <div style="flex:1; height:60%; background:#3b82f6; border-radius:4px 4px 0 0;" title="POP-01: 6,400 req/s"></div>
          <div style="flex:1; height:85%; background:#3b82f6; border-radius:4px 4px 0 0;" title="POP-02: 9,200 req/s"></div>
          <div style="flex:1; height:45%; background:#3b82f6; border-radius:4px 4px 0 0;" title="POP-03: 4,800 req/s"></div>
          <div style="flex:1; height:95%; background:#60a5fa; border-radius:4px 4px 0 0;" title="POP-04: 11,400 req/s"></div>
          <div style="flex:1; height:70%; background:#3b82f6; border-radius:4px 4px 0 0;" title="POP-05: 7,500 req/s"></div>
          <div style="flex:1; height:80%; background:#3b82f6; border-radius:4px 4px 0 0;" title="POP-06: 8,900 req/s"></div>
          <div style="flex:1; height:90%; background:#60a5fa; border-radius:4px 4px 0 0;" title="POP-07: 10,200 req/s"></div>
        </div>
        <div style="font-size:12px; color:#94a3b8; display:flex; justify-content:space-between;">
          <span>Trailing 15-minute global average: <strong>8,342 req/s</strong></span>
          <span style="color:#34d399;">● 0 Dropped Packets</span>
        </div>
      </div>
    \`,
    security: \`
      <div style="display:flex; flex-direction:column; gap:14px;">
        <span style="font-size:13px; font-weight:700; color:#fff;">Zero-Trust Attestation Status</span>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div style="background:#161d2f; border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:12px;">
            <div style="font-size:12px; color:#94a3b8;">mTLS Certificates</div>
            <div style="font-size:16px; font-weight:700; color:#34d399; margin-top:4px;">100% Rotated Daily</div>
          </div>
          <div style="background:#161d2f; border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:12px;">
            <div style="font-size:12px; color:#94a3b8;">DDoS Mitigation</div>
            <div style="font-size:16px; font-weight:700; color:#60a5fa; margin-top:4px;">Active (eBPF Shield)</div>
          </div>
        </div>
        <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.2); padding:10px 14px; border-radius:6px; font-size:12px; color:#34d399;">
          ✓ SOC2 Type II compliance check passed. All egress routes cryptographically verified.
        </div>
      </div>
    \`
  };

  function renderTab(tabKey) {
    if (previewBody && previews[tabKey]) {
      previewBody.innerHTML = previews[tabKey];
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderTab(tab.getAttribute('data-tab'));
    });
  });

  // Initial render
  renderTab('workflow');

  // Billing Toggle
  const billingSwitch = document.getElementById('billing-switch');
  const priceElements = document.querySelectorAll('.price-val');
  let isAnnual = true;

  if (billingSwitch) {
    billingSwitch.addEventListener('click', () => {
      isAnnual = !isAnnual;
      billingSwitch.classList.toggle('active', isAnnual);
      priceElements.forEach(el => {
        const val = isAnnual ? el.getAttribute('data-annual') : el.getAttribute('data-monthly');
        el.textContent = val;
      });
      showToast(isAnnual ? 'Switched to Annual Billing (20% Discount applied)' : 'Switched to Monthly Billing');
    });
  }

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const q = item.querySelector('.faq-question');
    if (q) {
      q.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    }
  });

  // Subscribe Form
  const subForm = document.getElementById('subscribe-form');
  const feedback = document.getElementById('form-feedback');
  if (subForm) {
    subForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('sub-email').value;
      if (feedback) {
        feedback.className = 'form-feedback success';
        feedback.textContent = '🎉 Access link & $500 credits sent to ' + email;
        subForm.reset();
      }
      showToast('Welcome to OmniFlow! Check your email for setup instructions.');
    });
  }

  // Button hooks
  const startBtn = document.getElementById('hero-start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      showToast('Provisioning sandbox cluster in us-east-1...');
    });
  }

  const demoBtn = document.getElementById('hero-demo-btn');
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      showToast('Launching interactive guided product tour...');
    });
  }
})();
`
};
