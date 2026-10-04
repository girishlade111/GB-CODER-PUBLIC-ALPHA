export default {
  html: `
<div class="boutique-app" id="top">
  <!-- Promo Announcement -->
  <div class="top-banner">
    <span>Complimentary worldwide express courier on all orders over $250 • Code: <strong>LUMINARY15</strong> for 15% off</span>
  </div>

  <!-- Header -->
  <header class="boutique-nav">
    <div class="nav-wrapper">
      <div class="brand">
        <span class="brand-name">LUMINARY</span>
        <span class="brand-tag">ATELIER</span>
      </div>

      <div class="nav-categories">
        <button class="cat-filter-btn active" data-cat="all">All Artifacts</button>
        <button class="cat-filter-btn" data-cat="audio">Acoustics</button>
        <button class="cat-filter-btn" data-cat="hardware">Precision Input</button>
        <button class="cat-filter-btn" data-cat="optics">Lighting</button>
      </div>

      <div class="nav-actions">
        <button class="icon-btn" id="btn-wishlist" title="Wishlist">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span class="badge-count" id="wishlist-count">2</span>
        </button>

        <button class="icon-btn" id="btn-cart" title="Shopping Bag">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <span class="badge-count" id="cart-count">1</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Hero Banner -->
  <section class="store-hero">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <span class="collection-tag">AUTUMN / WINTER 2026</span>
      <h1 class="hero-title">Industrial aesthetics meets high-fidelity performance.</h1>
      <p class="hero-desc">Milled aerospace titanium, bespoke transducers, and minimalist ergonomics engineered for modern creative studios.</p>
    </div>
  </section>

  <!-- Product Grid -->
  <section class="catalog-section">
    <div class="catalog-header">
      <span class="catalog-title">Curated Hardware Collection</span>
      <div class="catalog-sort">
        <label for="sort-select">Sort by:</label>
        <select id="sort-select" class="sort-select">
          <option value="featured">Featured First</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>
      </div>
    </div>

    <div class="products-grid" id="products-grid">
      <!-- Injected via JavaScript -->
    </div>
  </section>

  <!-- Slide-out Cart Drawer -->
  <div class="drawer-backdrop" id="cart-drawer-backdrop" style="display:none;">
    <div class="cart-drawer" id="cart-drawer">
      <div class="drawer-header">
        <h2 class="drawer-title">Shopping Bag (<span id="drawer-item-count">1</span>)</h2>
        <button class="drawer-close" id="btn-close-cart">✕</button>
      </div>

      <!-- Free shipping progress -->
      <div class="free-shipping-strip" id="shipping-strip">
        <span id="shipping-msg">Add $100 more to qualify for complimentary express courier</span>
        <div class="shipping-bar"><div class="shipping-fill" id="shipping-fill" style="width: 60%;"></div></div>
      </div>

      <div class="drawer-items-list" id="drawer-items-list">
        <!-- Rendered via JS -->
      </div>

      <div class="drawer-footer">
        <div class="promo-box">
          <input type="text" id="promo-input" placeholder="Promo code (e.g. LUMINARY15)" />
          <button class="btn btn-apply" id="btn-apply-promo">Apply</button>
        </div>

        <div class="order-summary-row">
          <span>Subtotal</span>
          <span id="summary-subtotal">$299.00</span>
        </div>
        <div class="order-summary-row text-discount" id="row-discount" style="display:none;">
          <span>Discount (15%)</span>
          <span id="summary-discount">-$44.85</span>
        </div>
        <div class="order-summary-row">
          <span>Shipping</span>
          <span id="summary-shipping">FREE</span>
        </div>
        <div class="order-summary-row total-row">
          <span>Estimated Total</span>
          <span id="summary-total">$299.00</span>
        </div>

        <button class="btn-checkout" id="btn-checkout">
          <span>Checkout with Apple Pay / Stripe</span>
        </button>
      </div>
    </div>
  </div>

  <div class="boutique-toast" id="boutique-toast"></div>
</div>
`,
  css: `
:root {
  --bg-dark: #0a0b0e;
  --bg-card: rgba(18, 20, 26, 0.7);
  --border: rgba(255, 255, 255, 0.08);
  --accent-gold: #fbbf24;
  --accent-cyan: #38bdf8;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --font-serif: Georgia, serif;
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

.top-banner {
  background: #11141c;
  border-bottom: 1px solid var(--border);
  padding: 8px 16px;
  text-align: center;
  font-size: 11px;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}
.top-banner strong { color: var(--accent-gold); }

/* Nav */
.boutique-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(10, 11, 14, 0.88);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
}
.nav-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.brand { display: flex; flex-direction: column; }
.brand-name { font-size: 18px; font-weight: 900; letter-spacing: 2px; color: #fff; }
.brand-tag { font-size: 9px; letter-spacing: 3px; color: var(--text-muted); font-weight: 600; }

.nav-categories { display: flex; gap: 8px; }
.cat-filter-btn {
  background: none;
  border: 1px solid transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;
}
.cat-filter-btn:hover { color: #fff; }
.cat-filter-btn.active {
  background: #fff;
  color: #000;
  border-color: #fff;
}

.nav-actions { display: flex; gap: 12px; }
.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}
.icon-btn:hover { background: rgba(255, 255, 255, 0.1); }
.badge-count {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #fff;
  color: #000;
  font-size: 9px;
  font-weight: 900;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Hero */
.store-hero {
  max-width: 1200px;
  margin: 30px auto;
  padding: 60px 40px;
  border-radius: 20px;
  background: linear-gradient(135deg, #181d29, #0f1219);
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
}
.hero-content { max-width: 640px; position: relative; z-index: 2; }
.collection-tag { font-size: 10px; font-weight: 800; letter-spacing: 2px; color: var(--accent-gold); display: block; margin-bottom: 12px; }
.hero-title { font-size: 38px; font-weight: 800; line-height: 1.2; letter-spacing: -0.5px; color: #fff; margin-bottom: 16px; }
.hero-desc { font-size: 15px; color: var(--text-muted); line-height: 1.6; }

/* Catalog */
.catalog-section { max-width: 1200px; margin: 0 auto 80px; padding: 0 24px; }
.catalog-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
.catalog-title { font-size: 20px; font-weight: 800; color: #fff; }
.catalog-sort { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-muted); }
.sort-select { background: #131722; border: 1px solid var(--border); color: #fff; padding: 6px 12px; border-radius: 6px; font-size: 12px; outline: none; }

.products-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.prod-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
}
.prod-card:hover { transform: translateY(-4px); border-color: rgba(255, 255, 255, 0.2); }
.prod-image-wrap {
  height: 220px;
  background: #11141c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 72px;
  position: relative;
}
.wish-toggle {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(0,0,0,0.4);
  border: 1px solid var(--border);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
}
.wish-toggle.active { color: #f43f5e; }

.prod-details { padding: 20px; display: flex; flex-direction: column; flex: 1; }
.prod-cat { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; color: var(--text-muted); margin-bottom: 4px; }
.prod-name { font-size: 17px; font-weight: 800; color: #fff; margin-bottom: 6px; }
.prod-spec { font-size: 12px; color: var(--text-muted); margin-bottom: 16px; flex: 1; }
.prod-foot { display: flex; justify-content: space-between; align-items: center; }
.prod-price { font-size: 18px; font-weight: 900; color: #fff; }
.btn-add-cart {
  background: #fff;
  color: #000;
  border: none;
  font-size: 11px;
  font-weight: 800;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-add-cart:hover { background: #e2e8f0; }

/* Drawer */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
}
.cart-drawer {
  width: 420px;
  height: 100%;
  background: #0f1219;
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}
.drawer-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
}
.drawer-title { font-size: 17px; font-weight: 800; color: #fff; }
.drawer-close { background: none; border: none; color: var(--text-muted); font-size: 18px; cursor: pointer; }

.free-shipping-strip {
  background: rgba(251, 191, 36, 0.08);
  border-bottom: 1px solid rgba(251, 191, 36, 0.15);
  padding: 12px 24px;
  font-size: 11px;
  color: var(--accent-gold);
}
.shipping-bar { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 6px; overflow: hidden; }
.shipping-fill { height: 100%; background: var(--accent-gold); border-radius: 2px; }

.drawer-items-list { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
.drawer-item { display: flex; gap: 14px; align-items: center; background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; }
.drawer-item-img { font-size: 32px; }
.drawer-item-info { flex: 1; }
.drawer-item-title { font-size: 13px; font-weight: 700; color: #fff; }
.drawer-item-price { font-size: 12px; color: var(--text-muted); font-weight: 600; }
.qty-controls { display: flex; align-items: center; gap: 6px; }
.qty-btn { width: 22px; height: 22px; background: #1c2230; border: none; color: #fff; border-radius: 4px; cursor: pointer; }

.drawer-footer { border-top: 1px solid var(--border); padding: 20px 24px; }
.promo-box { display: flex; gap: 8px; margin-bottom: 16px; }
.promo-box input {
  flex: 1;
  background: #151a26;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  color: #fff;
  font-size: 11px;
  outline: none;
}
.btn-apply { background: rgba(255,255,255,0.08); border: none; color: #fff; font-size: 11px; font-weight: 700; padding: 0 14px; border-radius: 6px; cursor: pointer; }

.order-summary-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted); margin-bottom: 6px; }
.text-discount { color: var(--accent-gold); }
.total-row { font-size: 17px; font-weight: 800; color: #fff; border-top: 1px solid var(--border); padding-top: 10px; margin-top: 10px; margin-bottom: 18px; }

.btn-checkout {
  width: 100%;
  background: #fff;
  color: #000;
  border: none;
  font-size: 13px;
  font-weight: 800;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(255,255,255,0.15);
}

/* Toast */
.boutique-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #181d29;
  border: 1px solid #fff;
  color: #fff;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  display: none;
  z-index: 1000;
}

@media (max-width: 900px) {
  .products-grid { grid-template-columns: 1fr; }
  .cart-drawer { width: 100%; }
}
`,
  javascript: `
(function() {
  function showToast(msg) {
    const toast = document.getElementById('boutique-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2800);
  }

  const products = [
    { id: 1, name: 'Spatial Studio Transducer', cat: 'audio', price: 349, img: '🎧', spec: 'CNC machined titanium housing with beryllium drivers.' },
    { id: 2, name: 'Precision CNC 65% Keyboard', cat: 'hardware', price: 289, img: '⌨️', spec: 'Anodized aluminum chassis, hot-swap lubed linear switches.' },
    { id: 3, name: 'Linear Gradient Task Light', cat: 'optics', price: 169, img: '💡', spec: 'High-CRI 98 LED bar with rotary wireless tactile dial.' },
    { id: 4, name: 'Acoustic Reference Monitors', cat: 'audio', price: 549, img: '🔊', spec: 'Dual 5.25 inch woven Kevlar cone bi-amped active pair.' },
    { id: 5, name: 'Haptic Rotary Controller', cat: 'hardware', price: 199, img: '🎛️', spec: 'Brushless motor simulated friction and detent feedback.' },
    { id: 6, name: 'Orbital Desk Mat (Merino Wool)', cat: 'hardware', price: 79, img: '📐', spec: 'Natural non-slip high-density felt surface.' }
  ];

  let cart = [
    { id: 1, name: 'Spatial Studio Transducer', price: 349, img: '🎧', qty: 1 }
  ];

  let discountRate = 0;

  function renderProducts(catFilter) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    const filtered = (catFilter && catFilter !== 'all') ? products.filter(p => p.cat === catFilter) : products;

    grid.innerHTML = filtered.map(p => 
      '<article class="prod-card">' +
        '<div class="prod-image-wrap">' +
          p.img +
          '<button class="wish-toggle" onclick="toggleWishlist(' + p.id + ')">♥</button>' +
        '</div>' +
        '<div class="prod-details">' +
          '<span class="prod-cat">' + p.cat.toUpperCase() + '</span>' +
          '<h3 class="prod-name">' + p.name + '</h3>' +
          '<p class="prod-spec">' + p.spec + '</p>' +
          '<div class="prod-foot">' +
            '<span class="prod-price">$' + p.price + '</span>' +
            '<button class="btn-add-cart" onclick="addToCart(' + p.id + ')">Add to Bag</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    ).join('');
  }

  window.toggleWishlist = function(id) {
    showToast('Updated wishlist for item #' + id);
  };

  window.addToCart = function(id) {
    const p = products.find(item => item.id === id);
    if (!p) return;
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, qty: 1 });
    }
    updateCartUI();
    showToast('Added ' + p.name + ' to your bag');
  };

  function updateCartUI() {
    const countEl = document.getElementById('cart-count');
    const drawerCount = document.getElementById('drawer-item-count');
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    if (countEl) countEl.textContent = totalQty;
    if (drawerCount) drawerCount.textContent = totalQty;

    const list = document.getElementById('drawer-items-list');
    if (list) {
      if (cart.length === 0) {
        list.innerHTML = '<div style="text-align:center; color:var(--text-muted); padding:40px 0;">Your shopping bag is empty.</div>';
      } else {
        list.innerHTML = cart.map(item => 
          '<div class="drawer-item">' +
            '<div class="drawer-item-img">' + item.img + '</div>' +
            '<div class="drawer-item-info">' +
              '<div class="drawer-item-title">' + item.name + '</div>' +
              '<div class="drawer-item-price">$' + item.price + '</div>' +
            '</div>' +
            '<div class="qty-controls">' +
              '<button class="qty-btn" onclick="updateQty(' + item.id + ', -1)">-</button>' +
              '<span style="font-size:12px; font-weight:700; color:#fff;">' + item.qty + '</span>' +
              '<button class="qty-btn" onclick="updateQty(' + item.id + ', 1)">+</button>' +
            '</div>' +
          '</div>'
        ).join('');
      }
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discount = subtotal * discountRate;
    const total = subtotal - discount;

    const subEl = document.getElementById('summary-subtotal');
    if (subEl) subEl.textContent = '$' + subtotal.toFixed(2);

    const discRow = document.getElementById('row-discount');
    const discEl = document.getElementById('summary-discount');
    if (discRow && discEl) {
      if (discountRate > 0) {
        discRow.style.display = 'flex';
        discEl.textContent = '-$' + discount.toFixed(2);
      } else {
        discRow.style.display = 'none';
      }
    }

    const totalEl = document.getElementById('summary-total');
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);

    const fill = document.getElementById('shipping-fill');
    const msg = document.getElementById('shipping-msg');
    if (fill && msg) {
      if (subtotal >= 250) {
        fill.style.width = '100%';
        msg.textContent = '🎉 You unlocked complimentary worldwide courier shipping!';
      } else {
        const pct = Math.min(100, Math.floor((subtotal / 250) * 100));
        fill.style.width = pct + '%';
        msg.textContent = 'Add $' + (250 - subtotal).toFixed(0) + ' more to qualify for complimentary courier';
      }
    }
  }

  window.updateQty = function(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    updateCartUI();
  };

  // Drawer Toggle
  const backdrop = document.getElementById('cart-drawer-backdrop');
  document.getElementById('btn-cart')?.addEventListener('click', () => {
    if (backdrop) backdrop.style.display = 'flex';
  });
  document.getElementById('btn-close-cart')?.addEventListener('click', () => {
    if (backdrop) backdrop.style.display = 'none';
  });

  // Promo code
  document.getElementById('btn-apply-promo')?.addEventListener('click', () => {
    const input = document.getElementById('promo-input');
    if (input && input.value.trim().toUpperCase() === 'LUMINARY15') {
      discountRate = 0.15;
      updateCartUI();
      showToast('✓ Promo code LUMINARY15 applied (-15%)');
    } else {
      showToast('Invalid promo code');
    }
  });

  // Checkout
  document.getElementById('btn-checkout')?.addEventListener('click', () => {
    showToast('Order simulated successfully! Processing payment...');
  });

  // Category filter buttons
  const catBtns = document.querySelectorAll('.cat-filter-btn');
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProducts(btn.getAttribute('data-cat'));
    });
  });

  renderProducts('all');
  updateCartUI();
})();
`
};
