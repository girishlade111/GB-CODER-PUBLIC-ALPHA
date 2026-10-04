export default {
  html: `
<div class="terminal-app">
  <!-- Ticker Strip -->
  <div class="ticker-strip">
    <div class="ticker-item"><span class="t-sym">BTC/USD</span> <span class="t-price" id="t-btc">64,280.50</span> <span class="t-delta up">+3.4%</span></div>
    <div class="ticker-item"><span class="t-sym">ETH/USD</span> <span class="t-price" id="t-eth">3,490.20</span> <span class="t-delta up">+4.1%</span></div>
    <div class="ticker-item"><span class="t-sym">SOL/USD</span> <span class="t-price" id="t-sol">152.80</span> <span class="t-delta down">-0.8%</span></div>
    <div class="ticker-item"><span class="t-sym">AVAX/USD</span> <span class="t-price">34.60</span> <span class="t-delta up">+1.9%</span></div>
    <div class="ticker-item"><span class="t-sym">LINK/USD</span> <span class="t-price">18.45</span> <span class="t-delta up">+6.2%</span></div>
  </div>

  <!-- Header -->
  <header class="terminal-header">
    <div class="h-left">
      <div class="term-badge">VERTEX</div>
      <div class="asset-pair">
        <span class="pair-title">BTC / USD</span>
        <span class="pair-type">PERPETUAL • 20X</span>
      </div>
      <div class="pair-metrics">
        <div><span class="m-lbl">MARK PRICE</span> <strong id="mark-price">$64,280.50</strong></div>
        <div><span class="m-lbl">24H HIGH</span> <strong>$65,120.00</strong></div>
        <div><span class="m-lbl">24H LOW</span> <strong>$62,800.00</strong></div>
        <div><span class="m-lbl">24H VOL</span> <strong>$1.48B</strong></div>
      </div>
    </div>

    <div class="h-right">
      <span class="conn-pill"><span class="c-dot"></span> Websocket: 12ms</span>
      <button class="btn-sm btn-subtle" id="btn-dep">Deposit Funds</button>
    </div>
  </header>

  <!-- Trading Grid -->
  <div class="trading-grid">
    <!-- Center Chart -->
    <section class="chart-section">
      <div class="chart-controls">
        <div class="interval-buttons">
          <button class="int-btn">1m</button>
          <button class="int-btn active">15m</button>
          <button class="int-btn">1h</button>
          <button class="int-btn">4h</button>
          <button class="int-btn">1D</button>
        </div>
        <div class="chart-indicators">
          <span>EMA (20, 50, 200)</span>
          <span>RSI: 54.2</span>
        </div>
      </div>

      <div class="chart-canvas-box">
        <svg class="trading-chart-svg" viewBox="0 0 600 240" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#10b981" stop-opacity="0.3"/>
              <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
            </linearGradient>
          </defs>

          <!-- Grid Lines -->
          <line x1="0" y1="60" x2="600" y2="60" stroke="rgba(255,255,255,0.05)" />
          <line x1="0" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.05)" />
          <line x1="0" y1="180" x2="600" y2="180" stroke="rgba(255,255,255,0.05)" />

          <!-- Filled Area -->
          <polygon points="0,240 0,160 50,150 100,170 150,130 200,140 250,100 300,120 350,80 400,90 450,60 500,75 550,40 600,50 600,240" fill="url(#areaGrad)" />
          <!-- Main Line -->
          <polyline points="0,160 50,150 100,170 150,130 200,140 250,100 300,120 350,80 400,90 450,60 500,75 550,40 600,50" fill="none" stroke="#10b981" stroke-width="2.5" />
        </svg>
      </div>

      <!-- Positions / Orders Tabs -->
      <div class="positions-panel">
        <div class="pos-tabs">
          <button class="pos-tab active">Open Positions (1)</button>
          <button class="pos-tab">Order History</button>
          <button class="pos-tab">Realized PnL</button>
        </div>
        <div class="pos-table-wrap">
          <table class="pos-table">
            <thead>
              <tr>
                <th>MARKET</th>
                <th>SIZE</th>
                <th>ENTRY</th>
                <th>MARK</th>
                <th>LIQ PRICE</th>
                <th>PNL (ROE%)</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong style="color:#10b981;">BTC-PERP [LONG 20x]</strong></td>
                <td>1.50 BTC</td>
                <td>$62,400.00</td>
                <td>$64,280.50</td>
                <td>$59,280.00</td>
                <td><span class="pnl-green">+$2,820.75 (+30.1%)</span></td>
                <td><button class="btn-xs" onclick="closePosition()">Market Close</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Order Book -->
    <aside class="book-section">
      <div class="book-head">Order Book (Depth)</div>
      
      <!-- Asks (Red) -->
      <div class="book-list asks" id="asks-list">
        <div class="book-row"><span class="price-red">64,295.00</span> <span>0.420</span> <span class="tot">2.81</span><div class="depth-bar red" style="width:40%;"></div></div>
        <div class="book-row"><span class="price-red">64,290.00</span> <span>1.120</span> <span class="tot">2.39</span><div class="depth-bar red" style="width:65%;"></div></div>
        <div class="book-row"><span class="price-red">64,285.50</span> <span>0.850</span> <span class="tot">1.27</span><div class="depth-bar red" style="width:30%;"></div></div>
        <div class="book-row"><span class="price-red">64,282.00</span> <span>0.420</span> <span class="tot">0.42</span><div class="depth-bar red" style="width:20%;"></div></div>
      </div>

      <!-- Spread -->
      <div class="spread-indicator">
        <span class="mid-price" id="mid-spread">64,280.50</span>
        <span class="spread-lbl">Spread 0.50</span>
      </div>

      <!-- Bids (Green) -->
      <div class="book-list bids" id="bids-list">
        <div class="book-row"><span class="price-green">64,280.00</span> <span>0.650</span> <span class="tot">0.65</span><div class="depth-bar green" style="width:25%;"></div></div>
        <div class="book-row"><span class="price-green">64,275.50</span> <span>1.480</span> <span class="tot">2.13</span><div class="depth-bar green" style="width:75%;"></div></div>
        <div class="book-row"><span class="price-green">64,270.00</span> <span>0.920</span> <span class="tot">3.05</span><div class="depth-bar green" style="width:45%;"></div></div>
        <div class="book-row"><span class="price-green">64,265.00</span> <span>2.100</span> <span class="tot">5.15</span><div class="depth-bar green" style="width:90%;"></div></div>
      </div>
    </aside>

    <!-- Order Placement Terminal -->
    <aside class="order-form-section">
      <div class="side-switch">
        <button class="side-btn buy active" id="btn-side-buy">BUY / LONG</button>
        <button class="side-btn sell" id="btn-side-sell">SELL / SHORT</button>
      </div>

      <div class="form-group">
        <label>Order Type</label>
        <select class="term-select">
          <option>Limit Order</option>
          <option>Market Execution</option>
          <option>Stop Loss / Trailing</option>
        </select>
      </div>

      <div class="form-group">
        <label>Price (USD)</label>
        <input type="text" class="term-input" id="order-price" value="64,280.00" />
      </div>

      <div class="form-group">
        <label>Quantity (BTC)</label>
        <input type="text" class="term-input" id="order-qty" value="0.25" />
      </div>

      <div class="leverage-slider-box">
        <div class="lev-lbl"><span>Leverage</span> <strong style="color:#10b981;" id="lev-val">20x</strong></div>
        <input type="range" id="lev-slider" min="1" max="50" value="20" />
      </div>

      <div class="order-summary-box">
        <div class="s-row"><span>Required Margin:</span> <span id="req-margin">$803.50</span></div>
        <div class="s-row"><span>Estimated Fee:</span> <span>$3.21 (Taker)</span></div>
        <div class="s-row"><span>Est. Liq Price:</span> <span style="color:#f59e0b;">$61,066.00</span></div>
      </div>

      <button class="btn-execute-order buy" id="btn-submit-order">Place Buy / Long Order</button>
    </aside>
  </div>

  <div class="term-toast" id="term-toast"></div>
</div>
`,
  css: `
:root {
  --bg-dark: #07080c;
  --bg-panel: #0d1017;
  --border: rgba(255, 255, 255, 0.08);
  --green: #10b981;
  --red: #f43f5e;
  --text-main: #f8fafc;
  --text-muted: #64748b;
  --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--bg-dark);
  color: var(--text-main);
  font-family: var(--sans);
  height: 100vh;
  overflow: hidden;
}

.terminal-app { display: flex; flex-direction: column; height: 100vh; font-size: 12px; }

/* Ticker */
.ticker-strip {
  height: 30px;
  background: #090c12;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 16px;
  font-family: var(--mono);
  font-size: 11px;
}
.t-sym { color: #94a3b8; font-weight: 700; margin-right: 4px; }
.t-price { color: #fff; font-weight: 700; }
.up { color: var(--green); }
.down { color: var(--red); }

/* Header */
.terminal-header {
  height: 52px;
  background: var(--bg-panel);
  border-bottom: 1px solid var(--border);
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.h-left { display: flex; align-items: center; gap: 20px; }
.term-badge { background: #3b82f6; color: #fff; font-weight: 900; font-size: 10px; padding: 2px 6px; border-radius: 4px; letter-spacing: 1px; }
.pair-title { font-size: 15px; font-weight: 800; color: #fff; margin-right: 6px; }
.pair-type { font-size: 10px; color: var(--text-muted); font-weight: 700; }
.pair-metrics { display: flex; gap: 16px; font-size: 11px; font-family: var(--mono); }
.m-lbl { color: var(--text-muted); margin-right: 4px; }
.h-right { display: flex; align-items: center; gap: 12px; }
.conn-pill { font-size: 10px; color: var(--green); font-family: var(--mono); display: flex; align-items: center; gap: 6px; }
.c-dot { width: 6px; height: 6px; background: var(--green); border-radius: 50%; }
.btn-subtle { background: rgba(255,255,255,0.06); border: 1px solid var(--border); color: #fff; padding: 4px 10px; border-radius: 4px; cursor: pointer; }

/* Grid */
.trading-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 260px 280px;
  overflow: hidden;
}

/* Chart */
.chart-section { display: flex; flex-direction: column; border-right: 1px solid var(--border); }
.chart-controls {
  padding: 8px 16px;
  background: #090c12;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.interval-buttons { display: flex; gap: 4px; }
.int-btn { background: none; border: none; color: var(--text-muted); font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 4px; cursor: pointer; }
.int-btn.active { color: #fff; background: rgba(255,255,255,0.08); }
.chart-indicators { font-size: 11px; font-family: var(--mono); color: var(--text-muted); }

.chart-canvas-box { flex: 1; padding: 16px; position: relative; }
.trading-chart-svg { width: 100%; height: 100%; }

/* Positions */
.positions-panel { height: 180px; border-top: 1px solid var(--border); background: var(--bg-panel); display: flex; flex-direction: column; }
.pos-tabs { display: flex; border-bottom: 1px solid var(--border); padding: 0 12px; }
.pos-tab { background: none; border: none; color: var(--text-muted); font-size: 11px; font-weight: 700; padding: 8px 12px; cursor: pointer; border-bottom: 2px solid transparent; }
.pos-tab.active { color: #fff; border-bottom-color: #3b82f6; }
.pos-table-wrap { flex: 1; overflow-y: auto; }
.pos-table { width: 100%; border-collapse: collapse; font-family: var(--mono); font-size: 11px; text-align: left; }
.pos-table th { padding: 6px 12px; color: var(--text-muted); font-size: 10px; border-bottom: 1px solid var(--border); }
.pos-table td { padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); }
.pnl-green { color: var(--green); font-weight: 800; }
.btn-xs { background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 4px; cursor: pointer; }

/* Order Book */
.book-section { border-right: 1px solid var(--border); display: flex; flex-direction: column; background: var(--bg-panel); font-family: var(--mono); font-size: 11px; }
.book-head { padding: 8px 12px; border-bottom: 1px solid var(--border); font-size: 11px; font-weight: 700; color: #94a3b8; }
.book-list { display: flex; flex-direction: column; gap: 2px; padding: 6px 0; }
.book-row { display: grid; grid-template-columns: 1fr 1fr 1fr; padding: 3px 12px; position: relative; }
.depth-bar { position: absolute; top: 0; bottom: 0; right: 0; opacity: 0.15; z-index: 1; }
.depth-bar.red { background: var(--red); }
.depth-bar.green { background: var(--green); }
.price-red { color: var(--red); font-weight: 700; }
.price-green { color: var(--green); font-weight: 700; }
.tot { text-align: right; color: var(--text-muted); }
.spread-indicator { padding: 8px 12px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: #07090f; }
.mid-price { font-size: 14px; font-weight: 800; color: #fff; }
.spread-lbl { font-size: 10px; color: var(--text-muted); }

/* Order Form */
.order-form-section { padding: 16px; background: var(--bg-panel); display: flex; flex-direction: column; gap: 14px; }
.side-switch { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.side-btn { padding: 8px; border: none; font-size: 12px; font-weight: 800; border-radius: 6px; cursor: pointer; opacity: 0.5; }
.side-btn.buy.active { background: var(--green); color: #000; opacity: 1; }
.side-btn.sell.active { background: var(--red); color: #fff; opacity: 1; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group label { font-size: 10px; color: var(--text-muted); font-weight: 700; }
.term-input, .term-select {
  background: #06080e;
  border: 1px solid var(--border);
  padding: 8px 10px;
  color: #fff;
  border-radius: 6px;
  font-family: var(--mono);
  font-size: 12px;
  outline: none;
}
.leverage-slider-box { background: #07090f; padding: 10px; border-radius: 6px; border: 1px solid var(--border); }
.lev-lbl { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 11px; }
#lev-slider { width: 100%; accent-color: var(--green); }

.order-summary-box { background: #07090f; padding: 10px; border-radius: 6px; font-family: var(--mono); font-size: 11px; display: flex; flex-direction: column; gap: 4px; }
.s-row { display: flex; justify-content: space-between; color: var(--text-muted); }
.s-row span:last-child { color: #fff; font-weight: 600; }

.btn-execute-order {
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  margin-top: auto;
}
.btn-execute-order.buy { background: var(--green); color: #000; }
.btn-execute-order.sell { background: var(--red); color: #fff; }

/* Toast */
.term-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #1e293b;
  border: 1px solid #10b981;
  color: #fff;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  display: none;
  z-index: 1000;
}
`,
  javascript: `
(function() {
  function showToast(msg) {
    const toast = document.getElementById('term-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2800);
  }

  // Side Toggle
  const btnBuy = document.getElementById('btn-side-buy');
  const btnSell = document.getElementById('btn-side-sell');
  const btnSubmit = document.getElementById('btn-submit-order');
  let side = 'buy';

  if (btnBuy && btnSell && btnSubmit) {
    btnBuy.addEventListener('click', () => {
      side = 'buy';
      btnBuy.className = 'side-btn buy active';
      btnSell.className = 'side-btn sell';
      btnSubmit.className = 'btn-execute-order buy';
      btnSubmit.textContent = 'Place Buy / Long Order';
    });

    btnSell.addEventListener('click', () => {
      side = 'sell';
      btnSell.className = 'side-btn sell active';
      btnBuy.className = 'side-btn buy';
      btnSubmit.className = 'btn-execute-order sell';
      btnSubmit.textContent = 'Place Sell / Short Order';
    });
  }

  // Leverage Slider
  const levSlider = document.getElementById('lev-slider');
  const levVal = document.getElementById('lev-val');
  if (levSlider && levVal) {
    levSlider.addEventListener('input', (e) => {
      levVal.textContent = e.target.value + 'x';
    });
  }

  // Submit Order
  if (btnSubmit) {
    btnSubmit.addEventListener('click', () => {
      const qty = document.getElementById('order-qty')?.value || '0.25';
      showToast('Order matched & filled: ' + side.toUpperCase() + ' ' + qty + ' BTC @ $64,280.00');
    });
  }

  window.closePosition = function() {
    showToast('Closed 1.50 BTC position at Market. PnL: +$2,820.75 realized.');
  };

  // Live Price Ticker Simulation
  let btcPrice = 64280.50;
  setInterval(() => {
    const delta = (Math.random() - 0.48) * 12;
    btcPrice += delta;
    const str = btcPrice.toFixed(2);
    const btcEl = document.getElementById('t-btc');
    const markEl = document.getElementById('mark-price');
    const midEl = document.getElementById('mid-spread');
    if (btcEl) btcEl.textContent = str;
    if (markEl) markEl.textContent = '$' + str;
    if (midEl) midEl.textContent = str;
  }, 2400);
})();
`
};
