export default {
  html: `
<div class="portfolio-container" id="top">
  <!-- Minimalist Header -->
  <header class="portfolio-nav">
    <div class="nav-inner">
      <a href="#top" class="nav-logo">
        <span class="logo-mark">AE</span>
        <span class="logo-title">Aether Systems</span>
      </a>

      <div class="nav-menu">
        <a href="#work" class="menu-link">Work</a>
        <a href="#philosophy" class="menu-link">Philosophy</a>
        <a href="#experience" class="menu-link">Trajectory</a>
        <a href="#contact" class="menu-link">Terminal</a>
      </div>

      <div class="availability-chip">
        <span class="status-dot"></span>
        <span>Open for Advisory</span>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero-wrap">
    <div class="hero-meta">
      <span class="hero-role">PRINCIPAL DISTRIBUTED SYSTEMS ARCHITECT</span>
      <span class="hero-loc">SAN FRANCISCO / REMOTE</span>
    </div>

    <h1 class="hero-heading">
      Designing <span class="highlight">fault-tolerant architectures</span> and reactive interfaces that scale to hundreds of millions.
    </h1>

    <p class="hero-bio">
      Over 12 years engineering high-concurrency event buses, cryptographic consensus layers, and developer platforms. Formerly Staff Architect at Stripe & Cloudflare infrastructure alumni.
    </p>

    <div class="hero-cta-group">
      <a href="#work" class="cta-primary">
        <span>Explore Case Studies</span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </a>
      <a href="#contact" class="cta-secondary">Open Contact Terminal</a>
    </div>

    <!-- Impact Numbers -->
    <div class="hero-metrics-bar">
      <div class="metric-item">
        <div class="metric-num">340M+</div>
        <div class="metric-label">Daily Events Processed</div>
      </div>
      <div class="metric-item">
        <div class="metric-num">99.999%</div>
        <div class="metric-label">Maintained SLA Uptime</div>
      </div>
      <div class="metric-item">
        <div class="metric-num">0.6 ms</div>
        <div class="metric-label">p99 Wire Latency Achieved</div>
      </div>
      <div class="metric-item">
        <div class="metric-num">$140M</div>
        <div class="metric-label">Annual Cloud Spend Optimized</div>
      </div>
    </div>
  </section>

  <!-- Selected Work with Filters -->
  <section class="section-work" id="work">
    <div class="work-header">
      <div>
        <span class="subhead">CURATED ARCHITECTURE CASE STUDIES</span>
        <h2 class="work-title">Engineering Systems & Products</h2>
      </div>

      <div class="filter-pills" id="project-filters">
        <button class="filter-btn active" data-filter="all">All Disciplines</button>
        <button class="filter-btn" data-filter="systems">Distributed Systems</button>
        <button class="filter-btn" data-filter="ai">AI Infrastructure</button>
        <button class="filter-btn" data-filter="fintech">Fintech Rails</button>
      </div>
    </div>

    <div class="projects-grid" id="projects-grid">
      <!-- Project 1 -->
      <article class="project-card" data-category="systems" onclick="openCaseStudy('hyperion')">
        <div class="project-preview preview-gradient-1">
          <div class="preview-badge">SYSTEMS</div>
          <div class="preview-diagram">
            <svg viewBox="0 0 200 100" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="30" cy="50" r="14" />
              <line x1="44" y1="50" x2="86" y2="50" stroke-dasharray="3"/>
              <rect x="86" y="32" width="28" height="36" rx="4" />
              <line x1="114" y1="50" x2="156" y2="50" stroke-dasharray="3"/>
              <circle cx="170" cy="50" r="14" />
            </svg>
          </div>
        </div>
        <div class="project-content">
          <div class="project-tags">Rust • Raft • WebAssembly • eBPF</div>
          <h3 class="project-name">Hyperion Edge Event Mesh</h3>
          <p class="project-desc">A zero-copy pub/sub message broker deployed across 140 global points of presence with sub-millisecond tail latency.</p>
          <div class="project-impact">Result: 4.8x throughput increase with 60% memory reduction</div>
        </div>
      </article>

      <!-- Project 2 -->
      <article class="project-card" data-category="ai" onclick="openCaseStudy('synapse')">
        <div class="project-preview preview-gradient-2">
          <div class="preview-badge">AI INFRASTRUCTURE</div>
          <div class="preview-diagram">
            <svg viewBox="0 0 200 100" fill="none" stroke="currentColor" stroke-width="1.5">
              <polygon points="100,20 150,80 50,80" />
              <circle cx="100" cy="45" r="8" />
              <circle cx="75" cy="72" r="8" />
              <circle cx="125" cy="72" r="8" />
            </svg>
          </div>
        </div>
        <div class="project-content">
          <div class="project-tags">vLLM • Triton • Kubernetes • PyTorch</div>
          <h3 class="project-name">Synapse Speculative Inference Gateway</h3>
          <p class="project-desc">High-throughput LLM routing engine with speculative decoding and semantic KV-cache reuse.</p>
          <div class="project-impact">Result: 3.2x token generation speedup across GPU clusters</div>
        </div>
      </article>

      <!-- Project 3 -->
      <article class="project-card" data-category="fintech" onclick="openCaseStudy('kestrel')">
        <div class="project-preview preview-gradient-3">
          <div class="preview-badge">FINTECH RAILS</div>
          <div class="preview-diagram">
            <svg viewBox="0 0 200 100" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="30" y="25" width="140" height="50" rx="8" />
              <line x1="30" y1="50" x2="170" y2="50" />
              <circle cx="60" cy="38" r="4" />
              <circle cx="75" cy="38" r="4" />
            </svg>
          </div>
        </div>
        <div class="project-content">
          <div class="project-tags">Double-Entry Ledger • PostgreSQL • Temporal • Go</div>
          <h3 class="project-name">Kestrel Global Settlement Engine</h3>
          <p class="project-desc">Immutable multi-currency financial ledger with strict serializable isolation and idempotent transfers.</p>
          <div class="project-impact">Result: Reconciled $42B+ in transactions with 0 balance discrepancies</div>
        </div>
      </article>
    </div>
  </section>

  <!-- Interactive Terminal & Contact -->
  <section class="section-terminal" id="contact">
    <div class="terminal-card">
      <div class="terminal-bar">
        <div class="terminal-dots">
          <span class="tdot red"></span>
          <span class="tdot amber"></span>
          <span class="tdot green"></span>
        </div>
        <span class="terminal-title">aether@principal-workstation:~</span>
        <button class="terminal-copy-btn" id="btn-copy-email">Copy Email</button>
      </div>

      <div class="terminal-body">
        <div class="terminal-line"><span class="prompt">$</span> aether --status --availability</div>
        <div class="terminal-output">Status: Online | Advising Series B-D Startups & Scaleups | Direct: contact@aethersystems.dev</div>
        
        <div class="terminal-line" style="margin-top:12px;"><span class="prompt">$</span> send-dispatch --recipient="Aether"</div>
        <form class="terminal-form" id="terminal-form">
          <div class="form-row">
            <span class="t-label">Your Name:</span>
            <input type="text" id="t-name" placeholder="Alex Chen (CTO, Fintech Labs)" required />
          </div>
          <div class="form-row">
            <span class="t-label">Work Email:</span>
            <input type="email" id="t-email" placeholder="alex@company.com" required />
          </div>
          <div class="form-row">
            <span class="t-label">Brief Challenge:</span>
            <textarea id="t-msg" rows="2" placeholder="Looking to scale distributed ingestion pipeline from 10k to 100k events/sec..." required></textarea>
          </div>
          <button type="submit" class="terminal-submit-btn">Transmit Dispatch [Enter ↵]</button>
        </form>
        <div class="terminal-feedback" id="terminal-feedback"></div>
      </div>
    </div>
  </section>

  <!-- Case Study Modal -->
  <div class="modal-backdrop" id="case-modal" style="display:none;">
    <div class="modal-box">
      <button class="modal-close" onclick="closeModal()">✕</button>
      <div id="modal-content">
        <!-- Injected via JavaScript -->
      </div>
    </div>
  </div>

  <div class="portfolio-toast" id="portfolio-toast"></div>
</div>
`,
  css: `
:root {
  --bg-dark: #090a0f;
  --bg-card: rgba(18, 20, 29, 0.7);
  --border: rgba(255, 255, 255, 0.08);
  --accent-cyan: #38bdf8;
  --accent-blue: #3b82f6;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --font-serif: Georgia, 'Times New Roman', serif;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--bg-dark);
  color: var(--text-main);
  font-family: var(--font-sans);
  line-height: 1.6;
  overflow-x: hidden;
}

.portfolio-container { max-width: 1100px; margin: 0 auto; padding: 0 24px 60px; }

/* Header */
.portfolio-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(9, 10, 15, 0.85);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
  margin-bottom: 60px;
}
.nav-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}
.nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #fff; }
.logo-mark {
  background: #fff;
  color: #000;
  font-weight: 900;
  font-size: 11px;
  padding: 4px 6px;
  border-radius: 4px;
}
.logo-title { font-size: 15px; font-weight: 800; letter-spacing: -0.3px; }
.nav-menu { display: flex; gap: 24px; }
.menu-link { color: var(--text-muted); text-decoration: none; font-size: 13px; font-weight: 500; transition: color 0.2s; }
.menu-link:hover { color: #fff; }
.availability-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #34d399;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 4px 10px;
  border-radius: 999px;
}
.status-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; box-shadow: 0 0 6px #10b981; }

/* Hero */
.hero-wrap { margin-bottom: 80px; }
.hero-meta { display: flex; gap: 16px; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: var(--accent-cyan); margin-bottom: 20px; }
.hero-heading {
  font-size: 44px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -1.2px;
  color: #fff;
  margin-bottom: 24px;
}
.hero-heading .highlight {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  color: #e2e8f0;
  text-decoration: underline;
  text-decoration-color: rgba(56, 189, 248, 0.4);
}
.hero-bio { font-size: 17px; color: var(--text-muted); max-width: 780px; margin-bottom: 32px; line-height: 1.6; }
.hero-cta-group { display: flex; gap: 14px; margin-bottom: 50px; }

.cta-primary {
  background: #fff;
  color: #000;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s;
}
.cta-primary:hover { transform: translateY(-1px); background: #f1f5f9; }
.cta-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  color: #fff;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 6px;
}
.cta-secondary:hover { background: rgba(255, 255, 255, 0.1); }

/* Metrics Bar */
.hero-metrics-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 24px 0;
}
.metric-num { font-size: 28px; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
.metric-label { font-size: 12px; color: var(--text-muted); font-weight: 500; }

/* Case Studies */
.section-work { margin-bottom: 80px; }
.work-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 36px; }
.subhead { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; color: var(--accent-cyan); display: block; margin-bottom: 6px; }
.work-title { font-size: 28px; font-weight: 800; color: #fff; }

.filter-pills { display: flex; gap: 8px; }
.filter-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 12px;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.filter-btn.active { background: #fff; color: #000; font-weight: 700; border-color: #fff; }

.projects-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.project-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s ease;
}
.project-card:hover { transform: translateY(-4px); border-color: rgba(56, 189, 248, 0.3); }

.project-preview {
  height: 160px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #fff;
}
.preview-gradient-1 { background: linear-gradient(135deg, #1e293b, #0f172a); }
.preview-gradient-2 { background: linear-gradient(135deg, #312e81, #1e1b4b); }
.preview-gradient-3 { background: linear-gradient(135deg, #064e3b, #022c22); }
.preview-badge { position: absolute; top: 12px; left: 12px; font-size: 9px; font-weight: 800; letter-spacing: 1px; background: rgba(0,0,0,0.5); padding: 3px 8px; border-radius: 4px; }
.preview-diagram svg { width: 100%; height: 60px; }

.project-content { padding: 20px; }
.project-tags { font-size: 11px; font-weight: 700; color: var(--accent-cyan); margin-bottom: 8px; font-family: var(--font-mono); }
.project-name { font-size: 17px; font-weight: 800; color: #fff; margin-bottom: 8px; }
.project-desc { font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 14px; }
.project-impact { font-size: 11px; font-weight: 700; color: #34d399; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px; }

/* Terminal */
.section-terminal { margin-bottom: 40px; }
.terminal-card {
  background: #0b0e14;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
}
.terminal-bar {
  background: #141822;
  border-bottom: 1px solid var(--border);
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.terminal-dots { display: flex; gap: 6px; }
.tdot { width: 10px; height: 10px; border-radius: 50%; }
.red { background: #ef4444; }
.amber { background: #f59e0b; }
.green { background: #10b981; }
.terminal-title { font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); }
.terminal-copy-btn {
  background: rgba(255,255,255,0.06);
  border: 1px solid var(--border);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.terminal-body { padding: 24px; font-family: var(--font-mono); font-size: 12px; }
.terminal-line { color: #fff; margin-bottom: 4px; }
.prompt { color: #38bdf8; font-weight: 800; }
.terminal-output { color: #94a3b8; margin-bottom: 12px; line-height: 1.5; }
.terminal-form { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
.form-row { display: flex; align-items: center; gap: 10px; }
.t-label { width: 140px; color: var(--accent-cyan); font-weight: 700; flex-shrink: 0; }
.terminal-form input, .terminal-form textarea {
  flex: 1;
  background: #05070a;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  color: #fff;
  font-family: inherit;
  font-size: 12px;
  outline: none;
}
.terminal-form input:focus, .terminal-form textarea:focus { border-color: var(--accent-cyan); }
.terminal-submit-btn {
  align-self: flex-start;
  margin-top: 6px;
  background: #38bdf8;
  color: #000;
  border: none;
  font-weight: 800;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}
.terminal-feedback { margin-top: 10px; font-weight: 700; color: #34d399; }

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-box {
  background: #10141d;
  border: 1px solid var(--border);
  border-radius: 14px;
  max-width: 640px;
  width: 100%;
  padding: 32px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-close { position: absolute; top: 20px; right: 20px; background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; }

/* Toast */
.portfolio-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #1e293b;
  border: 1px solid var(--accent-cyan);
  color: #fff;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  display: none;
  z-index: 1000;
}

@media (max-width: 900px) {
  .hero-heading { font-size: 32px; }
  .hero-metrics-bar { grid-template-columns: repeat(2, 1fr); }
  .projects-grid { grid-template-columns: 1fr; }
  .work-header { flex-direction: column; align-items: flex-start; gap: 16px; }
}
`,
  javascript: `
(function() {
  function showToast(msg) {
    const toast = document.getElementById('portfolio-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
  }

  // Filter Buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      projectCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
      showToast('Filtered by: ' + btn.textContent);
    });
  });

  // Copy Email
  const btnCopy = document.getElementById('btn-copy-email');
  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      navigator.clipboard?.writeText('contact@aethersystems.dev');
      showToast('Copied email to clipboard: contact@aethersystems.dev');
    });
  }

  // Terminal Form
  const form = document.getElementById('terminal-form');
  const feedback = document.getElementById('terminal-feedback');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('t-name').value;
      if (feedback) {
        feedback.textContent = '✓ Dispatch transmitted to Aether PagerDuty buffer. Response within 6 hours guaranteed, ' + name + '.';
        form.reset();
      }
      showToast('Dispatch delivered successfully!');
    });
  }

  // Modal handler
  const caseStudies = {
    hyperion: {
      title: 'Hyperion Edge Event Mesh',
      tech: 'Rust, Raft Consensus, WebAssembly, eBPF Tracing',
      challenge: 'Global payments API required zero-loss message delivery across 140 edge locations under extreme network partitions.',
      solution: 'Architected a custom Raft state machine running inside lightweight isolated Wasm micro-runtimes with kernel-level eBPF packet steering.',
      outcome: 'Achieved 4.8x higher throughput, eliminated 99.4% of datacenter ingress transit fees, and achieved five-nines uptime across 18 consecutive months.'
    },
    synapse: {
      title: 'Synapse Speculative Inference Gateway',
      tech: 'vLLM, Triton Server, Kubernetes, PyTorch',
      challenge: 'Multi-tenant LLM platform was experiencing severe memory fragmentation and high per-token latency costs.',
      solution: 'Engineered a speculative decoding router that pairs small draft models with massive target LLMs, caching intermediate activation embeddings.',
      outcome: 'Decreased p95 inference latency by 68% and tripled total GPU cluster concurrency without adding additional compute hardware.'
    },
    kestrel: {
      title: 'Kestrel Global Settlement Engine',
      tech: 'Double-Entry Ledger, PostgreSQL, Temporal, Go',
      challenge: 'Cross-border foreign exchange platform required immutable serializable ledgers with strict financial auditability.',
      solution: 'Designed an append-only cryptographic double-entry ledger orchestrated via Temporal durable workflows with zero two-phase commit overhead.',
      outcome: 'Successfully processed and reconciled $42B+ in annual volume with zero recorded accounting discrepancies or race conditions.'
    }
  };

  window.openCaseStudy = function(id) {
    const study = caseStudies[id];
    if (!study) return;
    const content = document.getElementById('modal-content');
    if (!content) return;
    content.innerHTML = 
      '<div style="font-size:11px; font-weight:800; color:#38bdf8; letter-spacing:1px; margin-bottom:8px;">CASE STUDY DETAILS</div>' +
      '<h2 style="font-size:24px; font-weight:800; color:#fff; margin-bottom:12px;">' + study.title + '</h2>' +
      '<div style="font-size:12px; font-family:var(--font-mono); color:#94a3b8; background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:6px; margin-bottom:18px;">Tech Stack: ' + study.tech + '</div>' +
      '<div style="margin-bottom:14px;"><strong style="color:#fff;">The Challenge:</strong> <p style="color:#94a3b8; font-size:13px; margin-top:4px;">' + study.challenge + '</p></div>' +
      '<div style="margin-bottom:14px;"><strong style="color:#fff;">Architectural Solution:</strong> <p style="color:#94a3b8; font-size:13px; margin-top:4px;">' + study.solution + '</p></div>' +
      '<div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.25); border-radius:8px; padding:12px; color:#34d399; font-size:13px; font-weight:600;">' + study.outcome + '</div>';
    
    const modal = document.getElementById('case-modal');
    if (modal) modal.style.display = 'flex';
  };

  window.closeModal = function() {
    const modal = document.getElementById('case-modal');
    if (modal) modal.style.display = 'none';
  };
})();
`
};
