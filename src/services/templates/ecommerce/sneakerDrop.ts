export default {
  html: `
<div class="sneaker-app" id="top">
  <!-- Drop Ticker -->
  <div class="drop-strip">
    <span>🔥 NEXT DROP IN: <strong id="countdown-timer">04h 28m 14s</strong> • AIR JORDAN 1 RETRO HIGH 'CHICAGO REIMAGINED' • STRICT LIMIT 1 PER SQUAD</span>
  </div>

  <!-- Header -->
  <header class="sneaker-header">
    <div class="h-wrap">
      <div class="brand">
        <span class="brand-badge">KV</span>
        <span class="brand-text">KICKSVAULT</span>
      </div>

      <div class="h-links">
        <a href="#featured" class="h-a">Live Drop</a>
        <a href="#vault" class="h-a">The Vault</a>
        <a href="#verified" class="h-a">Authenticity</a>
      </div>

      <div class="h-actions">
        <button class="btn btn-outline" id="btn-login-squad">Squad Login</button>
        <button class="btn btn-primary" id="btn-enter-drop">Enter Drop Raffle</button>
      </div>
    </div>
  </header>

  <!-- Hero Drop Showcase -->
  <section class="drop-hero" id="featured">
    <div class="drop-visual-box">
      <div class="verified-tag">✓ 100% VERIFIED AUTHENTIC DEADSTOCK</div>
      <div class="sneaker-display" id="sneaker-display">👟</div>
      <div class="colorway-dots">
        <button class="c-dot active" data-color="chicago" title="Chicago Red" style="background:#ef4444;"></button>
        <button class="c-dot" data-color="shadow" title="Shadow Grey" style="background:#64748b;"></button>
        <button class="c-dot" data-color="royal" title="Royal Blue" style="background:#3b82f6;"></button>
      </div>
    </div>

    <div class="drop-details-box">
      <span class="sub-tier">EXCLUSIVE GLOBAL LAUNCH</span>
      <h1 class="drop-title" id="drop-title">Air Jordan 1 High OG 'Chicago 2026'</h1>
      <p class="drop-meta">Original 1985 silhouette specification, aged cracked leather collar, sail midsole, and heritage collector packaging.</p>

      <div class="pricing-row">
        <div>
          <span class="price-lbl">RETAIL LAUNCH PRICE</span>
          <div class="price-val">$210.00</div>
        </div>
        <div>
          <span class="price-lbl">EST. SECONDARY RESALE</span>
          <div class="price-val text-green">$580.00 <span class="resale-pill">+176%</span></div>
        </div>
      </div>

      <!-- Size Selector -->
      <div class="size-section">
        <div class="size-head">
          <span>Select US Men's Size:</span>
          <span class="size-guide-btn" onclick="alert('US 8: 26cm • US 9: 27cm • US 10: 28cm • US 11: 29cm')">Size Chart</span>
        </div>
        <div class="sizes-grid">
          <button class="s-btn" data-size="US 8">US 8</button>
          <button class="s-btn" data-size="US 8.5">US 8.5</button>
          <button class="s-btn active" data-size="US 9">US 9</button>
          <button class="s-btn" data-size="US 9.5">US 9.5</button>
          <button class="s-btn" data-size="US 10">US 10</button>
          <button class="s-btn" data-size="US 10.5">US 10.5</button>
          <button class="s-btn" data-size="US 11">US 11</button>
          <button class="s-btn" data-size="US 12">US 12</button>
        </div>
      </div>

      <button class="btn-drop-action" id="btn-submit-entry">Enter Verified Draw (US 9 Selected)</button>
      <div class="drop-footnote">Entries close when countdown reaches zero. Verified bot protection active.</div>
    </div>
  </section>

  <!-- Vault Collection Grid -->
  <section class="section-vault" id="vault">
    <div class="vault-head">
      <h2 class="sec-title">Recent Deadstock Drops</h2>
      <span class="sec-meta">Verified Vault Inventory</span>
    </div>

    <div class="vault-grid">
      <div class="v-card">
        <div class="v-img">🥾</div>
        <div class="v-name">Travis Scott x Jumpman Jack</div>
        <div class="v-price">$200 retail • <span class="text-green">$640 market</span></div>
        <button class="btn btn-outline btn-xs" onclick="viewVaultDrop('Travis Scott Jumpman')">View Sales</button>
      </div>

      <div class="v-card">
        <div class="v-img">👟</div>
        <div class="v-name">Kobe 8 Protro 'Venice Beach'</div>
        <div class="v-price">$190 retail • <span class="text-green">$380 market</span></div>
        <button class="btn btn-outline btn-xs" onclick="viewVaultDrop('Kobe 8 Protro')">View Sales</button>
      </div>

      <div class="v-card">
        <div class="v-img">👞</div>
        <div class="v-name">Yeezy Foam Runner 'Onyx'</div>
        <div class="v-price">$90 retail • <span class="text-green">$175 market</span></div>
        <button class="btn btn-outline btn-xs" onclick="viewVaultDrop('Yeezy Foam')">View Sales</button>
      </div>
    </div>
  </section>

  <div class="sneaker-toast" id="sneaker-toast"></div>
</div>
`,
  css: `
:root {
  --bg-dark: #090a0d;
  --bg-card: rgba(18, 20, 28, 0.8);
  --border: rgba(255, 255, 255, 0.08);
  --red: #ef4444;
  --green: #10b981;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
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

.sneaker-app { max-width: 1200px; margin: 0 auto; padding: 0 24px 80px; }

/* Ticker */
.drop-strip {
  background: var(--red);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  text-align: center;
  padding: 8px 16px;
  letter-spacing: 0.5px;
}
.drop-strip strong { font-family: var(--font-mono); }

/* Header */
.sneaker-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(9, 10, 13, 0.9);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
  margin-bottom: 40px;
}
.h-wrap { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; }
.brand { display: flex; align-items: center; gap: 8px; }
.brand-badge { background: #fff; color: #000; font-weight: 900; font-size: 13px; padding: 3px 6px; border-radius: 4px; }
.brand-text { font-size: 16px; font-weight: 900; letter-spacing: 1.5px; }
.h-links { display: flex; gap: 24px; }
.h-a { color: var(--text-muted); text-decoration: none; font-size: 13px; font-weight: 600; transition: color 0.2s; }
.h-a:hover { color: #fff; }
.h-actions { display: flex; gap: 10px; }

.btn { padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 800; cursor: pointer; border: none; }
.btn-primary { background: #fff; color: #000; }
.btn-outline { background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: #fff; }
.btn-xs { padding: 4px 10px; font-size: 11px; }

/* Drop Hero */
.drop-hero {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 40px;
  align-items: center;
  margin-bottom: 80px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 40px;
}
.drop-visual-box {
  background: radial-gradient(circle, #2a1114, #0f0b0d);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 16px;
  height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}
.verified-tag {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--green);
  font-size: 10px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 4px;
}
.sneaker-display { font-size: 140px; transition: transform 0.3s; }
.colorway-dots { position: absolute; bottom: 20px; display: flex; gap: 10px; }
.c-dot { width: 20px; height: 20px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; }
.c-dot.active { border-color: #fff; transform: scale(1.2); }

.sub-tier { font-size: 11px; font-weight: 800; letter-spacing: 2px; color: var(--red); display: block; margin-bottom: 8px; }
.drop-title { font-size: 32px; font-weight: 900; line-height: 1.2; color: #fff; margin-bottom: 14px; }
.drop-meta { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px; }

.pricing-row { display: flex; gap: 32px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 18px 0; margin-bottom: 24px; }
.price-lbl { font-size: 10px; font-weight: 800; letter-spacing: 1px; color: var(--text-muted); display: block; margin-bottom: 4px; }
.price-val { font-size: 26px; font-weight: 900; font-family: var(--font-mono); color: #fff; }
.text-green { color: var(--green); }
.resale-pill { font-size: 11px; background: rgba(16,185,129,0.15); padding: 2px 6px; border-radius: 4px; vertical-align: middle; }

/* Sizes */
.size-section { margin-bottom: 28px; }
.size-head { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 10px; }
.size-guide-btn { color: var(--red); cursor: pointer; text-decoration: underline; }
.sizes-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.s-btn {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  color: #fff;
  padding: 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.s-btn:hover { background: rgba(255,255,255,0.08); }
.s-btn.active { background: #fff; color: #000; border-color: #fff; }

.btn-drop-action {
  width: 100%;
  background: var(--red);
  color: #fff;
  border: none;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.5px;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.4);
  transition: transform 0.2s;
}
.btn-drop-action:hover { transform: translateY(-1px); }
.drop-footnote { font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 10px; }

/* Vault */
.section-vault { margin-bottom: 60px; }
.vault-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 12px; }
.sec-title { font-size: 22px; font-weight: 800; color: #fff; }
.sec-meta { font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); }
.vault-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.v-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.v-img { font-size: 52px; margin-bottom: 12px; }
.v-name { font-size: 14px; font-weight: 800; color: #fff; margin-bottom: 6px; }
.v-price { font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 16px; }

/* Toast */
.sneaker-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #1e1416;
  border: 1px solid var(--red);
  color: #fff;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  display: none;
  z-index: 1000;
}

@media (max-width: 900px) {
  .drop-hero, .vault-grid { grid-template-columns: 1fr; }
}
`,
  javascript: `
(function() {
  function showToast(msg) {
    const toast = document.getElementById('sneaker-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2800);
  }

  // Size Selector
  let selectedSize = 'US 9';
  const sizeBtns = document.querySelectorAll('.s-btn');
  const actionBtn = document.getElementById('btn-drop-action');

  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.getAttribute('data-size') || 'US 9';
      if (actionBtn) {
        actionBtn.textContent = 'Enter Verified Draw (' + selectedSize + ' Selected)';
      }
      showToast('Selected size: ' + selectedSize);
    });
  });

  // Colorways
  const colorways = {
    chicago: { name: "Air Jordan 1 High OG 'Chicago 2026'", bg: "radial-gradient(circle, #2a1114, #0f0b0d)" },
    shadow: { name: "Air Jordan 1 High OG 'Shadow Grey'", bg: "radial-gradient(circle, #1a1e26, #090b0e)" },
    royal: { name: "Air Jordan 1 High OG 'Royal Blue 2026'", bg: "radial-gradient(circle, #0e1e38, #070c14)" }
  };

  const cDots = document.querySelectorAll('.c-dot');
  const dropTitle = document.getElementById('drop-title');
  const visualBox = document.querySelector('.drop-visual-box');

  cDots.forEach(dot => {
    dot.addEventListener('click', () => {
      cDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      const key = dot.getAttribute('data-color');
      const cw = colorways[key];
      if (cw) {
        if (dropTitle) dropTitle.textContent = cw.name;
        if (visualBox) visualBox.style.background = cw.bg;
      }
      showToast('Viewing colorway: ' + dot.getAttribute('title'));
    });
  });

  // Countdown simulation
  let secondsLeft = 16094;
  setInterval(() => {
    secondsLeft--;
    const h = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
    const m = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
    const s = String(secondsLeft % 60).padStart(2, '0');
    const timer = document.getElementById('countdown-timer');
    if (timer) timer.textContent = h + 'h ' + m + 'm ' + s + 's';
  }, 1000);

  // Submit entry
  actionBtn?.addEventListener('click', () => {
    showToast('🎉 Raffle Entry confirmed for ' + selectedSize + '! Payment pre-authorized with Apple Pay.');
  });

  window.viewVaultDrop = function(name) {
    showToast('Viewing historical deadstock transaction ticker: ' + name);
  };
})();
`
};
