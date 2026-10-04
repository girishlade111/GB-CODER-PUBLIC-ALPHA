// SoundVault Creator Audio Marketplace Template
// Royalty-free samples, beats & stems store with interactive waveform player, license picker, and cart drawer

const html = `
<div class="market-container">
  <!-- Navigation Header -->
  <header class="market-nav">
    <div class="market-brand">
      <div class="brand-disc">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </div>
      <div>
        <div class="brand-title">SoundVault <span class="badge-creator">CREATOR HUB</span></div>
        <div class="brand-sub">Lossless 24-Bit / 48kHz Royalty-Free Sound Packs</div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="market-search">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" placeholder="Search 808s, synthwave stems, cinematic drones..." id="trackSearchInput">
    </div>

    <!-- Cart Button -->
    <div class="nav-right">
      <button class="cart-trigger-btn" id="cartOpenBtn">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <span>Cart</span>
        <span class="cart-count-badge" id="navCartCount">1</span>
      </button>
    </div>
  </header>

  <!-- Sticky Waveform Player Bar -->
  <div class="sticky-player" id="stickyPlayer">
    <div class="player-track-info">
      <div class="track-artwork" id="nowArt">⚡</div>
      <div>
        <div class="track-title" id="nowTitle">Cyberpunk Horizon 2099</div>
        <div class="track-artist" id="nowArtist">By NeonGhost • 126 BPM • F# Minor</div>
      </div>
    </div>

    <div class="player-playback">
      <button class="player-btn-circle" id="masterPlayBtn">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" id="masterPlayIcon"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </button>
      <canvas id="waveformCanvas" width="460" height="42"></canvas>
      <div class="player-time" id="playerTime">0:14 / 2:38</div>
    </div>

    <div class="player-cta">
      <span class="player-price" id="nowPrice">$29.00</span>
      <button class="btn-buy-now" id="playerAddBtn">Add to Cart</button>
    </div>
  </div>

  <!-- Genre Filter Pills -->
  <div class="genre-bar">
    <button class="genre-pill active" data-genre="all">All Packs</button>
    <button class="genre-pill" data-genre="synthwave">Synthwave</button>
    <button class="genre-pill" data-genre="cinematic">Cinematic Stems</button>
    <button class="genre-pill" data-genre="hiphop">Drill & Trap 808</button>
    <button class="genre-pill" data-genre="ambient">Lo-Fi & Ambient</button>
  </div>

  <!-- Main Product Grid -->
  <main class="packs-grid" id="packsGrid">
    <!-- Rendered dynamically -->
  </main>

  <!-- Cart Drawer -->
  <div class="cart-drawer-overlay" id="cartOverlay">
    <div class="cart-drawer">
      <div class="cart-drawer-header">
        <div class="cart-drawer-title">Your Sound Vault Cart</div>
        <button class="cart-close-btn" id="cartCloseBtn">✕</button>
      </div>

      <div class="cart-items" id="cartItemsList">
        <!-- Rendered by JS -->
      </div>

      <div class="cart-summary">
        <div class="summary-line">
          <span>License Standard:</span>
          <span class="text-emerald">Royalty-Free Commercial</span>
        </div>
        <div class="summary-line">
          <span>Delivery Format:</span>
          <span>Instant 24-Bit WAV / ZIP</span>
        </div>
        <div class="summary-line total-line">
          <span>Subtotal:</span>
          <span class="total-amount" id="cartSubtotal">$29.00</span>
        </div>

        <button class="checkout-btn" id="checkoutBtn">
          Checkout with Stripe / Apple Pay
        </button>
        <div class="safe-checkout">🔒 256-bit Encrypted Instant Digital Fulfillment</div>
      </div>
    </div>
  </div>
</div>
`;

const css = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #08090d;
  color: #f1f5f9;
  min-height: 100vh;
}

.market-container {
  display: flex;
  flex-direction: column;
}

/* Nav */
.market-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: #0f1118;
  border-bottom: 1px solid #1c212d;
  flex-wrap: wrap;
  gap: 16px;
}

.market-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-disc {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px rgba(236, 72, 153, 0.4);
}

.brand-title {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-creator {
  font-size: 10px;
  background: rgba(236, 72, 153, 0.2);
  color: #f472b6;
  border: 1px solid rgba(236, 72, 153, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
}

.brand-sub {
  font-size: 11px;
  color: #94a3b8;
}

.market-search {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #151922;
  border: 1px solid #232a3b;
  border-radius: 9999px;
  padding: 8px 18px;
  width: 380px;
  color: #94a3b8;
}

@media (max-width: 860px) {
  .market-search { width: 100%; order: 3; }
}

.market-search input {
  background: transparent;
  border: none;
  outline: none;
  color: #f1f5f9;
  font-size: 13px;
  width: 100%;
}

.cart-trigger-btn {
  background: #1c212d;
  color: #f1f5f9;
  border: 1px solid #283042;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.cart-trigger-btn:hover {
  background: #283042;
}

.cart-count-badge {
  background: #ec4899;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 9999px;
}

/* Sticky Player */
.sticky-player {
  background: #11141e;
  border-bottom: 1px solid #1c212d;
  padding: 12px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(12px);
  gap: 20px;
}

@media (max-width: 768px) {
  .sticky-player { flex-direction: column; align-items: flex-start; }
}

.player-track-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 220px;
}

.track-artwork {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.track-title {
  font-size: 13px;
  font-weight: 700;
}

.track-artist {
  font-size: 11px;
  color: #94a3b8;
}

.player-playback {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  max-width: 600px;
}

.player-btn-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ec4899;
  color: #ffffff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 12px rgba(236, 72, 153, 0.4);
  flex-shrink: 0;
}

#waveformCanvas {
  flex: 1;
  height: 38px;
  background: #08090d;
  border-radius: 6px;
  cursor: pointer;
}

.player-time {
  font-family: monospace;
  font-size: 11px;
  color: #94a3b8;
  flex-shrink: 0;
}

.player-cta {
  display: flex;
  align-items: center;
  gap: 14px;
}

.player-price {
  font-size: 18px;
  font-weight: 800;
  color: #f1f5f9;
}

.btn-buy-now {
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  color: #ffffff;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s;
}

.btn-buy-now:hover {
  transform: translateY(-1px);
}

/* Genre Pills */
.genre-bar {
  display: flex;
  gap: 10px;
  padding: 20px 32px 10px;
  overflow-x: auto;
}

.genre-pill {
  background: #151922;
  color: #94a3b8;
  border: 1px solid #232a3b;
  padding: 6px 16px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.genre-pill.active, .genre-pill:hover {
  background: #ec4899;
  color: #ffffff;
  border-color: #ec4899;
}

/* Pack Grid */
.packs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 24px 32px 60px;
}

.pack-card {
  background: #0f1118;
  border: 1px solid #1c212d;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, border-color 0.2s;
  display: flex;
  flex-direction: column;
}

.pack-card:hover {
  transform: translateY(-4px);
  border-color: #3b4255;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
}

.pack-cover {
  height: 160px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 14px;
}

.pack-play-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(15, 17, 24, 0.85);
  backdrop-filter: blur(8px);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.pack-play-btn:hover {
  background: #ec4899;
  transform: scale(1.1);
}

.pack-genre-tag {
  position: absolute;
  top: 14px;
  left: 14px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.pack-body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.pack-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 4px;
}

.pack-author {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 12px;
}

.pack-specs {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #64748b;
  margin-bottom: 16px;
}

.pack-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  border-top: 1px solid #1c212d;
}

.pack-price {
  font-size: 18px;
  font-weight: 800;
}

.pack-add-btn {
  background: #1c212d;
  border: 1px solid #283042;
  color: #f1f5f9;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.pack-add-btn:hover {
  background: #ec4899;
  border-color: #ec4899;
}

/* Cart Drawer */
.cart-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: none;
  justify-content: flex-end;
}

.cart-drawer-overlay.open {
  display: flex;
}

.cart-drawer {
  width: 420px;
  max-width: 90vw;
  background: #0f1118;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  border-left: 1px solid #1c212d;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
}

.cart-drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid #1c212d;
}

.cart-drawer-title {
  font-size: 16px;
  font-weight: 700;
}

.cart-close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 18px;
  cursor: pointer;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #151922;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #232a3b;
}

.item-left {
  display: flex;
  gap: 10px;
  align-items: center;
}

.item-art {
  font-size: 20px;
}

.item-title {
  font-size: 13px;
  font-weight: 600;
}

.item-tier {
  font-size: 10px;
  color: #94a3b8;
}

.item-right {
  text-align: right;
}

.item-price {
  font-weight: 700;
  font-size: 13px;
}

.item-remove {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 11px;
  cursor: pointer;
  margin-top: 4px;
}

.cart-summary {
  border-top: 1px solid #1c212d;
  padding-top: 16px;
  margin-top: 16px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.total-line {
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
  margin-top: 12px;
  margin-bottom: 16px;
}

.total-amount {
  color: #ec4899;
}

.checkout-btn {
  width: 100%;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  color: #ffffff;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(236, 72, 153, 0.4);
}

.safe-checkout {
  font-size: 10px;
  color: #64748b;
  text-align: center;
  margin-top: 10px;
}
`;

const javascript = `
(function() {
  const packs = [
    {
      id: 'pack1',
      title: 'Cyberpunk Horizon 2099',
      author: 'NeonGhost',
      genre: 'synthwave',
      samples: '480 WAV Samples',
      stems: '32 MIDI Tracks',
      price: 29,
      emoji: '⚡',
      bg: 'linear-gradient(135deg, #4338ca, #be185d)'
    },
    {
      id: 'pack2',
      title: 'Interstellar Cinema Scores',
      author: 'Hans Zimmer Clone',
      genre: 'cinematic',
      samples: '240 Orchestral Stems',
      stems: '15 Brass Multi-samples',
      price: 45,
      emoji: '🎻',
      bg: 'linear-gradient(135deg, #0f766e, #1e3a8a)'
    },
    {
      id: 'pack3',
      title: 'SubZero 808 Trap Matrix',
      author: '808Mafia Inspired',
      genre: 'hiphop',
      samples: '350 Tuned 808s',
      stems: '60 Snare & Hi-Hat Rolls',
      price: 34,
      emoji: '🔥',
      bg: 'linear-gradient(135deg, #b91c1c, #d97706)'
    },
    {
      id: 'pack4',
      title: 'Tokyo Midnight Lo-Fi Coffee',
      author: 'Aesthetics Collective',
      genre: 'ambient',
      samples: '290 Vinyl Textures',
      stems: '40 Rhodes Piano Chords',
      price: 24,
      emoji: '☕',
      bg: 'linear-gradient(135deg, #6d28d9, #475569)'
    }
  ];

  let cart = [packs[0]];

  // Render pack grid
  const packsGrid = document.getElementById('packsGrid');
  function renderPacks(filter) {
    if (!packsGrid) return;
    packsGrid.innerHTML = '';
    packs.forEach(pack => {
      if (filter && filter !== 'all' && pack.genre !== filter) return;
      const card = document.createElement('div');
      card.className = 'pack-card';
      card.innerHTML = 
        '<div class="pack-cover" style="background:' + pack.bg + '">' +
          '<div class="pack-genre-tag">' + pack.genre + '</div>' +
          '<button class="pack-play-btn" data-id="' + pack.id + '">' +
            '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="pack-body">' +
          '<div class="pack-title">' + pack.title + '</div>' +
          '<div class="pack-author">' + pack.author + '</div>' +
          '<div class="pack-specs">' +
            '<span>' + pack.samples + '</span> • <span>' + pack.stems + '</span>' +
          '</div>' +
          '<div class="pack-footer">' +
            '<div class="pack-price">$' + pack.price + '.00</div>' +
            '<button class="pack-add-btn" data-id="' + pack.id + '">+ Add to Cart</button>' +
          '</div>' +
        '</div>';
      
      packsGrid.appendChild(card);
    });

    attachCardListeners();
  }

  function attachCardListeners() {
    document.querySelectorAll('.pack-play-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        const pack = packs.find(p => p.id === id);
        if (pack) {
          loadStickyTrack(pack);
          toggleMasterPlay(true);
        }
      });
    });

    document.querySelectorAll('.pack-add-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        const pack = packs.find(p => p.id === id);
        if (pack && !cart.some(c => c.id === pack.id)) {
          cart.push(pack);
          updateCartUI();
          openCartDrawer();
        }
      });
    });
  }

  // Waveform Canvas
  const canvas = document.getElementById('waveformCanvas');
  let ctx = null;
  if (canvas) ctx = canvas.getContext('2d');

  let isPlaying = false;
  let playProgress = 0.15;
  let waveAnimId = null;

  function drawWaveform() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bars = 70;
    const barWidth = canvas.width / bars;

    for (let i = 0; i < bars; i++) {
      const x = i * barWidth;
      const progressRatio = i / bars;
      const isPlayed = progressRatio <= playProgress;

      // Pseudo random waveform heights
      const h = Math.sin(i * 0.2) * 12 + Math.cos(i * 0.5) * 8 + 14;
      const y = (canvas.height - h) / 2;

      ctx.fillStyle = isPlayed ? '#ec4899' : '#334155';
      ctx.fillRect(x + 1, y, barWidth - 2, h);
    }
  }

  if (canvas) {
    drawWaveform();
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      playProgress = Math.max(0, Math.min(1, clickX / canvas.width));
      drawWaveform();
    });
  }

  function loadStickyTrack(pack) {
    document.getElementById('nowTitle').textContent = pack.title;
    document.getElementById('nowArtist').textContent = 'By ' + pack.author + ' • Lossless Stems';
    document.getElementById('nowArt').textContent = pack.emoji;
    document.getElementById('nowPrice').textContent = '$' + pack.price + '.00';
    playProgress = 0;
    drawWaveform();
  }

  function toggleMasterPlay(forceState) {
    isPlaying = forceState !== undefined ? forceState : !isPlaying;
    const btn = document.getElementById('masterPlayBtn');
    if (!btn) return;
    if (isPlaying) {
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
      startProgressLoop();
    } else {
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
      cancelAnimationFrame(waveAnimId);
    }
  }

  function startProgressLoop() {
    function loop() {
      if (!isPlaying) return;
      playProgress += 0.002;
      if (playProgress >= 1) playProgress = 0;
      drawWaveform();
      waveAnimId = requestAnimationFrame(loop);
    }
    loop();
  }

  const masterPlay = document.getElementById('masterPlayBtn');
  if (masterPlay) {
    masterPlay.addEventListener('click', () => toggleMasterPlay());
  }

  // Cart logic
  const cartDrawer = document.getElementById('cartOverlay');
  const cartOpenBtn = document.getElementById('cartOpenBtn');
  const cartCloseBtn = document.getElementById('cartCloseBtn');

  function openCartDrawer() {
    if (cartDrawer) cartDrawer.classList.add('open');
  }

  function closeCartDrawer() {
    if (cartDrawer) cartDrawer.classList.remove('open');
  }

  if (cartOpenBtn) cartOpenBtn.addEventListener('click', openCartDrawer);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartDrawer);

  function updateCartUI() {
    document.getElementById('navCartCount').textContent = cart.length;
    const list = document.getElementById('cartItemsList');
    if (!list) return;
    list.innerHTML = '';

    let subtotal = 0;
    cart.forEach(item => {
      subtotal += item.price;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = 
        '<div class="item-left">' +
          '<div class="item-art">' + item.emoji + '</div>' +
          '<div>' +
            '<div class="item-title">' + item.title + '</div>' +
            '<div class="item-tier">Commercial Stems License</div>' +
          '</div>' +
        '</div>' +
        '<div class="item-right">' +
          '<div class="item-price">$' + item.price + '.00</div>' +
          '<button class="item-remove" data-id="' + item.id + '">Remove</button>' +
        '</div>';
      list.appendChild(row);
    });

    document.getElementById('cartSubtotal').textContent = '$' + subtotal + '.00';

    document.querySelectorAll('.item-remove').forEach(b => {
      b.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        cart = cart.filter(c => c.id !== id);
        updateCartUI();
      });
    });
  }

  // Genre filtering
  document.querySelectorAll('.genre-pill').forEach(pill => {
    pill.addEventListener('click', function() {
      document.querySelectorAll('.genre-pill').forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      renderPacks(this.getAttribute('data-genre'));
    });
  });

  renderPacks('all');
  updateCartUI();

  // Search filter
  const searchInput = document.getElementById('trackSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.pack-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(q) ? 'flex' : 'none';
      });
    });
  }
})();
`;

export default { html, css, javascript };
