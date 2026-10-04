export default {
  html: `
<div class="mobile-launch-app" id="top">
  <!-- Nav -->
  <nav class="app-nav">
    <div class="nav-container">
      <div class="brand">
        <div class="brand-orb"></div>
        <span class="brand-title">Aura Vision</span>
      </div>

      <div class="nav-links">
        <a href="#screens" class="nav-a">Experience</a>
        <a href="#features" class="nav-a">Features</a>
        <a href="#reviews" class="nav-a">Reviews</a>
        <a href="#download" class="nav-a">Download</a>
      </div>

      <button class="btn btn-nav" id="btn-get-app">Get for iOS & Android</button>
    </div>
  </nav>

  <!-- Hero with Interactive Smartphone Frame -->
  <section class="hero-wrap">
    <div class="hero-left">
      <div class="pill-badge">
        <span class="badge-sparkle">✦</span>
        <span>Voted #1 App of the Year 2026</span>
      </div>
      <h1 class="hero-title">Spatial intelligence right in <span class="text-gradient">your pocket</span>.</h1>
      <p class="hero-desc">
        Aura Vision fuses on-device neural vision models with spatial audio and multi-modal assistants to transform how you navigate, capture, and understand the physical world.
      </p>

      <div class="store-badges-row">
        <button class="store-badge-btn" id="btn-app-store">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.76 1.04-1.82.93-2.88-.9.04-1.99.6-2.63 1.36-.58.67-.99 1.76-.85 2.8.99.08 2.01-.52 2.55-1.28z"/></svg>
          <div class="badge-text">
            <span class="badge-small">Download on the</span>
            <span class="badge-big">App Store</span>
          </div>
        </button>

        <button class="store-badge-btn" id="btn-play-store">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M3.609 1.814L13.793 12 3.61 22.186c-.347-.384-.555-.956-.555-1.636V3.45c0-.68.208-1.252.555-1.636zm11.23 11.23l2.585 2.586L4.858 22.923l9.98-9.88zm0-2.088l-9.98-9.88 12.566 7.294-2.586 2.586zm1.468 1.044l4.247 2.464c.82.476.82 1.254 0 1.73l-4.247 2.464-2.443-2.444 2.443-2.444z"/></svg>
          <div class="badge-text">
            <span class="badge-small">GET IT ON</span>
            <span class="badge-big">Google Play</span>
          </div>
        </button>
      </div>

      <div class="user-proof">
        <div class="avatars-group">
          <span class="av">👩🏻</span><span class="av">👨🏽</span><span class="av">👱🏼</span><span class="av">👩🏾</span>
        </div>
        <div class="proof-meta">
          <div class="stars">★★★★★ <strong style="color:#fff;">4.9 / 5.0</strong></div>
          <span class="proof-count">Based on 140,000+ verified customer reviews</span>
        </div>
      </div>
    </div>

    <!-- Phone Mockup -->
    <div class="hero-right" id="screens">
      <div class="phone-frame">
        <div class="phone-island">
          <div class="camera-lens"></div>
        </div>

        <div class="phone-screen" id="phone-screen">
          <!-- Dynamically populated screen -->
        </div>

        <div class="phone-home-indicator"></div>
      </div>

      <!-- Screen Switcher Tabs -->
      <div class="screen-controls">
        <button class="screen-btn active" data-screen="scanner">Vision AI</button>
        <button class="screen-btn" data-screen="spatial">Spatial Map</button>
        <button class="screen-btn" data-screen="health">Health Ring</button>
      </div>
    </div>
  </section>

  <!-- Features Grid -->
  <section class="section-features" id="features">
    <div class="features-head">
      <span class="sub-label">RADICAL CAPABILITIES</span>
      <h2 class="sec-title">Intelligence designed for zero friction</h2>
    </div>

    <div class="features-3col">
      <div class="feat-card">
        <div class="feat-icon">⚡</div>
        <h3 class="feat-title">Real-Time Neural OCR</h3>
        <p class="feat-text">Extract tables, math equations, and code snippets from the physical world into clean markdown in under 50 milliseconds.</p>
      </div>

      <div class="feat-card">
        <div class="feat-icon">🌐</div>
        <h3 class="feat-title">Offline On-Device LLM</h3>
        <p class="feat-text">3B quantized parameter vision-language model runs completely locally with no internet connection required.</p>
      </div>

      <div class="feat-card">
        <div class="feat-icon">🔒</div>
        <h3 class="feat-title">Biometric Vault</h3>
        <p class="feat-text">Encrypted with Secure Enclave hardware keys. Zero data leaves your device without explicit cryptographically-signed consent.</p>
      </div>
    </div>
  </section>

  <!-- Interactive Testimonials Deck -->
  <section class="section-reviews" id="reviews">
    <div class="review-box">
      <div class="review-stars">★★★★★</div>
      <blockquote class="review-quote" id="review-text">
        "Aura Vision completely replaced 4 different tools I used daily. Being able to scan complex industrial hardware and instantly receive assembly instructions is magic."
      </blockquote>
      <div class="review-author" id="review-author">— Marcus Lindqvist, Robotics Lead at Kestrel Labs</div>

      <div class="review-dots">
        <button class="rdot active" data-idx="0"></button>
        <button class="rdot" data-idx="1"></button>
        <button class="rdot" data-idx="2"></button>
      </div>
    </div>
  </section>

  <div class="app-toast" id="app-toast"></div>
</div>
`,
  css: `
:root {
  --bg-dark: #07090e;
  --bg-card: rgba(16, 21, 32, 0.75);
  --border: rgba(255, 255, 255, 0.08);
  --accent-cyan: #38bdf8;
  --accent-violet: #818cf8;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--bg-dark);
  color: var(--text-main);
  font-family: var(--font-sans);
  line-height: 1.6;
  overflow-x: hidden;
}

.mobile-launch-app { max-width: 1200px; margin: 0 auto; padding: 0 24px 80px; }

/* Nav */
.app-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(7, 9, 14, 0.85);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
  margin-bottom: 40px;
}
.nav-container { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; }
.brand { display: flex; align-items: center; gap: 10px; }
.brand-orb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-violet));
  box-shadow: 0 0 12px var(--accent-cyan);
}
.brand-title { font-size: 17px; font-weight: 800; color: #fff; }
.nav-links { display: flex; gap: 24px; }
.nav-a { color: var(--text-muted); text-decoration: none; font-size: 13px; font-weight: 500; transition: color 0.2s; }
.nav-a:hover { color: #fff; }
.btn-nav {
  background: #fff;
  color: #000;
  border: none;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.2s;
}
.btn-nav:hover { transform: scale(1.03); }

/* Hero */
.hero-wrap {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 50px;
  align-items: center;
  margin-bottom: 80px;
}
.pill-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 4px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: var(--accent-cyan);
  margin-bottom: 24px;
}
.hero-title { font-size: 48px; font-weight: 900; line-height: 1.15; letter-spacing: -1.2px; color: #fff; margin-bottom: 20px; }
.text-gradient {
  background: linear-gradient(135deg, var(--accent-cyan), #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero-desc { font-size: 17px; color: var(--text-muted); line-height: 1.6; margin-bottom: 36px; }

.store-badges-row { display: flex; gap: 14px; margin-bottom: 36px; }
.store-badge-btn {
  background: #111520;
  border: 1px solid var(--border);
  color: #fff;
  padding: 10px 18px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.store-badge-btn:hover { background: #1a2030; border-color: rgba(255,255,255,0.2); }
.badge-text { display: flex; flex-direction: column; text-align: left; }
.badge-small { font-size: 9px; opacity: 0.7; }
.badge-big { font-size: 14px; font-weight: 700; }

.user-proof { display: flex; align-items: center; gap: 14px; }
.avatars-group { display: flex; }
.av {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1e2638;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg-dark);
  margin-left: -8px;
  font-size: 14px;
}
.av:first-child { margin-left: 0; }
.stars { font-size: 12px; color: #fbbf24; }
.proof-count { font-size: 11px; color: var(--text-muted); }

/* Phone Mockup */
.hero-right { display: flex; flex-direction: column; align-items: center; }
.phone-frame {
  width: 290px;
  height: 560px;
  background: #000;
  border: 8px solid #1a202c;
  border-radius: 44px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8), 0 0 40px rgba(56, 189, 248, 0.2);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.phone-island {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 20px;
  background: #000;
  border-radius: 10px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
}
.camera-lens { width: 8px; height: 8px; background: #0c1a2e; border-radius: 50%; }

.phone-screen {
  flex: 1;
  background: #0b0f19;
  padding: 40px 16px 20px;
  overflow-y: auto;
  font-size: 12px;
  color: #fff;
}
.phone-home-indicator {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: #fff;
  border-radius: 2px;
  opacity: 0.5;
}

.screen-controls { display: flex; gap: 8px; margin-top: 20px; }
.screen-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 999px;
  cursor: pointer;
}
.screen-btn.active { background: #38bdf8; color: #000; border-color: #38bdf8; }

/* Features */
.section-features { margin-bottom: 80px; }
.features-head { text-align: center; margin-bottom: 40px; }
.sub-label { font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: var(--accent-cyan); display: block; margin-bottom: 8px; }
.sec-title { font-size: 32px; font-weight: 800; color: #fff; }
.features-3col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.feat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px;
  transition: transform 0.2s;
}
.feat-card:hover { transform: translateY(-4px); border-color: rgba(56, 189, 248, 0.3); }
.feat-icon { font-size: 28px; margin-bottom: 14px; }
.feat-title { font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 10px; }
.feat-text { font-size: 13px; color: var(--text-muted); line-height: 1.6; }

/* Reviews */
.section-reviews { margin-bottom: 40px; }
.review-box {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.5));
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 48px;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}
.review-stars { color: #fbbf24; font-size: 20px; margin-bottom: 14px; }
.review-quote { font-size: 18px; color: #fff; font-style: italic; margin-bottom: 18px; line-height: 1.6; }
.review-author { font-size: 12px; font-weight: 700; color: var(--accent-cyan); margin-bottom: 24px; }
.review-dots { display: flex; justify-content: center; gap: 8px; }
.rdot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.2); border: none; cursor: pointer; }
.rdot.active { background: #38bdf8; }

/* Toast */
.app-toast {
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
  .hero-wrap, .features-3col { grid-template-columns: 1fr; }
}
`,
  javascript: `
(function() {
  function showToast(msg) {
    const toast = document.getElementById('app-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2800);
  }

  // Screens Mockup
  const screens = {
    scanner: 
      '<div style="text-align:center; padding:10px 0;">' +
        '<div style="font-size:10px; color:#38bdf8; font-weight:800; letter-spacing:1px; margin-bottom:6px;">LIVE SCANNER</div>' +
        '<div style="width:100%; height:160px; background:#121826; border:2px dashed rgba(56,189,248,0.4); border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;">' +
          '<span style="font-size:36px;">🔍</span>' +
          '<span style="font-size:11px; color:#cbd5e1;">Target: Sony A7IV Lens Assembly</span>' +
          '<span style="font-size:9px; color:#10b981; background:rgba(16,185,129,0.15); padding:2px 6px; border-radius:4px;">99.4% CONFIDENCE</span>' +
        '</div>' +
        '<div style="margin-top:16px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); padding:10px; border-radius:8px; text-align:left;">' +
          '<div style="font-size:11px; font-weight:700; color:#fff;">Extracted Specs:</div>' +
          '<div style="font-size:10px; color:#94a3b8; margin-top:2px;">Focal: 24-70mm f/2.8 GM II • Filter: 82mm • Mount: E-mount</div>' +
        '</div>' +
      '</div>',
    spatial: 
      '<div style="text-align:center; padding:10px 0;">' +
        '<div style="font-size:10px; color:#818cf8; font-weight:800; letter-spacing:1px; margin-bottom:6px;">SPATIAL RADAR</div>' +
        '<div style="width:100%; height:160px; background:radial-gradient(circle, #1e1b4b, #0f172a); border-radius:12px; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center;">' +
          '<div style="width:80px; height:80px; border:1px solid rgba(129,140,248,0.3); border-radius:50%; position:absolute;"></div>' +
          '<div style="width:130px; height:130px; border:1px solid rgba(129,140,248,0.15); border-radius:50%; position:absolute;"></div>' +
          '<span style="font-size:24px; position:relative; z-index:2;">📍</span>' +
        '</div>' +
        '<div style="margin-top:14px; font-size:11px; color:#cbd5e1;">3 Beacon Nodes Located in 15m radius</div>' +
      '</div>',
    health:
      '<div style="text-align:center; padding:10px 0;">' +
        '<div style="font-size:10px; color:#10b981; font-weight:800; letter-spacing:1px; margin-bottom:6px;">FOCUS & HEALTH</div>' +
        '<div style="margin:20px 0; font-size:42px; font-weight:900; color:#10b981;">94%</div>' +
        '<div style="font-size:11px; color:#fff; font-weight:700;">Deep Focus State</div>' +
        '<div style="font-size:10px; color:#94a3b8; margin-top:4px;">Cognitive fatigue: Low • Ambient light: Optimal</div>' +
      '</div>'
  };

  const phoneScreen = document.getElementById('phone-screen');
  function setScreen(key) {
    if (phoneScreen && screens[key]) {
      phoneScreen.innerHTML = screens[key];
    }
  }

  const screenBtns = document.querySelectorAll('.screen-btn');
  screenBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      screenBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setScreen(btn.getAttribute('data-screen'));
    });
  });

  setScreen('scanner');

  // Testimonials Slider
  const reviews = [
    { text: '"Aura Vision completely replaced 4 different tools I used daily. Being able to scan complex industrial hardware and instantly receive assembly instructions is magic."', author: '— Marcus Lindqvist, Robotics Lead at Kestrel Labs' },
    { text: '"The on-device offline translation and OCR helped our field researchers document artifacts in remote archaeological sites without any connectivity."', author: '— Dr. Sarah Chen, Institute of Spatial Research' },
    { text: '"The haptic spatial audio and visual accessibility features make navigation remarkably seamless. Best UX I have experienced on mobile."', author: '— Tariq Al-Mansoor, Product Architect' }
  ];

  const reviewText = document.getElementById('review-text');
  const reviewAuthor = document.getElementById('review-author');
  const rdots = document.querySelectorAll('.rdot');

  rdots.forEach(dot => {
    dot.addEventListener('click', () => {
      rdots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      const idx = parseInt(dot.getAttribute('data-idx'), 10);
      if (reviewText && reviewAuthor && reviews[idx]) {
        reviewText.textContent = reviews[idx].text;
        reviewAuthor.textContent = reviews[idx].author;
      }
    });
  });

  // Buttons
  ['btn-get-app', 'btn-app-store', 'btn-play-store'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      showToast('Redirecting to device app store installer (Aura Vision v4.2)');
    });
  });
})();
`
};
