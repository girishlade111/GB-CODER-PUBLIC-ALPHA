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
      content: `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');

:root {
  --font-heading: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;

  --bg-main: #090a0f;
  --bg-surface: #12141c;
  --bg-card: rgba(22, 26, 38, 0.85);
  --bg-card-hover: rgba(30, 36, 52, 0.95);

  --border: rgba(255, 255, 255, 0.08);
  --border-highlight: rgba(139, 92, 246, 0.4);

  --text-main: #ffffff;
  --text-muted: #9ca3af;
  --text-subtle: #6b7280;

  --accent-neon: #a855f7;
  --accent-cyan: #06b6d4;
  --accent-rose: #f43f5e;
  --accent-gold: #fbbf24;

  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 22px;
  --radius-full: 9999px;
}

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-main);
  color: var(--text-main);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

h1, h2, h3, h4, .font-heading {
  font-family: var(--font-heading);
}

@keyframes floatDevice {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-12px) rotate(1deg); }
}

.animate-float {
  animation: floatDevice 6s ease-in-out infinite;
}

/* Glass effect */
.glass-panel {
  background: rgba(18, 20, 28, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border);
}
`,
    },
    {
      path: 'App.jsx',
      content: `import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroBanner from './components/HeroBanner.jsx';
import ProductGrid from './components/ProductGrid.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import ProductModal from './components/ProductModal.jsx';
import ReviewsSection from './components/ReviewsSection.jsx';

export default function App() {
  const [cart, setCart] = useState([
    { id: 1, name: 'Aura Spatial Sound Pro', price: 349, color: 'Obsidian Black', qty: 1, image: '🎧' },
    { id: 2, name: 'Quantum Low-Profile Deck', price: 189, color: 'Cyber Gray', qty: 1, image: '⌨️' }
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(\`Added \${product.name} to Cart!\`);
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 10%, #1f143d 0%, #090a0f 70%)' }}>
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 24px 80px' }}>
        <HeroBanner onAddToCart={addToCart} />

        <ProductGrid
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          searchQuery={searchQuery}
          onAddToCart={addToCart}
          onSelectProduct={setSelectedProduct}
        />

        <ReviewsSection />
      </main>

      {/* Cart Slide-over */}
      {isCartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onUpdateQty={updateQuantity}
          showToast={showToast}
        />
      )}

      {/* Product Quick-View Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'rgba(18, 20, 28, 0.95)',
          border: '1px solid var(--accent-neon)',
          color: '#fff',
          padding: '14px 22px',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 12px 36px rgba(168, 85, 247, 0.3)',
          zIndex: 100,
          fontWeight: 600,
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ color: 'var(--accent-cyan)' }}>✦</span>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
`,
    },
    {
      path: 'components/Navbar.jsx',
      content: `import React from 'react';

export default function Navbar({ cartCount, onOpenCart, searchQuery, setSearchQuery }) {
  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      height: '72px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      borderBottom: '1px solid var(--border)'
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #a855f7, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: '20px',
          color: '#fff',
          boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)'
        }}>
          A
        </div>
        <div>
          <span style={{ fontWeight: 800, fontSize: '19px', letterSpacing: '-0.03em', color: '#fff' }}>AURA</span>
          <span style={{ fontSize: '10px', display: 'block', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.15em' }}>HARDWARE LABS</span>
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '6px 18px', width: '320px' }}>
        <span style={{ color: 'var(--text-subtle)', marginRight: '8px' }}>🔍</span>
        <input
          placeholder="Search devices, accessories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '13px', width: '100%' }}
        />
      </div>

      {/* Cart & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onOpenCart}
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(6, 182, 212, 0.2))',
            border: '1px solid var(--border-highlight)',
            borderRadius: 'var(--radius-full)',
            padding: '8px 18px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '13px',
            transition: 'all 0.2s'
          }}
        >
          <span>🛍️ Bag</span>
          <span style={{
            background: 'var(--accent-neon)',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 800,
            borderRadius: 'var(--radius-full)',
            padding: '2px 7px'
          }}>
            {cartCount}
          </span>
        </button>
      </div>
    </header>
  );
}
`,
    },
    {
      path: 'components/HeroBanner.jsx',
      content: `import React from 'react';

export default function HeroBanner({ onAddToCart }) {
  const flagship = {
    id: 1,
    name: 'Aura Spatial Sound Pro',
    price: 349,
    color: 'Obsidian Black',
    image: '🎧',
    desc: 'Bespoke planar magnetic drivers with real-time room compensation audio & lossless 24-bit 192kHz streaming.'
  };

  return (
    <div className="glass-panel" style={{
      borderRadius: 'var(--radius-lg)',
      padding: '48px',
      margin: '36px 0 54px',
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      alignItems: 'center',
      gap: '40px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(168, 85, 247, 0.15)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: 'var(--radius-full)',
          padding: '4px 14px',
          color: 'var(--accent-neon)',
          fontSize: '12px',
          fontWeight: 700,
          marginBottom: '18px'
        }}>
          <span>✦</span> LIMITED EDITION RELEASE
        </div>

        <h1 style={{ fontSize: '46px', fontWeight: 900, lineHeight: 1.1, margin: '0 0 16px', letterSpacing: '-0.03em' }}>
          Spatial Immersion. <br />
          <span style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Zero Latency.
          </span>
        </h1>

        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 28px', maxWidth: '480px' }}>
          {flagship.desc}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={() => onAddToCart(flagship)}
            style={{
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '14px 28px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(168, 85, 247, 0.5)',
              transition: 'transform 0.2s'
            }}
          >
            Add to Bag — $349
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--accent-gold)' }}>★★★★★</span>
            <span>4.9 / 5 (380+ reviews)</span>
          </div>
        </div>
      </div>

      {/* Floating 3D Artwork */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="animate-float" style={{
          width: '280px',
          height: '280px',
          borderRadius: '40px',
          background: 'linear-gradient(135deg, rgba(30, 36, 52, 0.9), rgba(15, 23, 42, 0.9))',
          border: '2px solid var(--border-highlight)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 60px rgba(168, 85, 247, 0.3)',
          fontSize: '92px'
        }}>
          🎧
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '12px', letterSpacing: '0.1em' }}>
            TITANIUM SERIES
          </div>
        </div>
      </div>
    </div>
  );
}
`,
    },
    {
      path: 'components/ProductGrid.jsx',
      content: `import React from 'react';

export default function ProductGrid({ activeCategory, setActiveCategory, searchQuery, onAddToCart, onSelectProduct }) {
  const products = [
    { id: 1, name: 'Aura Spatial Sound Pro', category: 'audio', price: 349, badge: 'Flagship', rating: 4.9, image: '🎧', specs: '50mm Planar Magnetic • 40hr Battery' },
    { id: 2, name: 'Quantum Low-Profile Deck', category: 'computing', price: 189, badge: 'Popular', rating: 4.8, image: '⌨️', specs: 'Gateron Optical Switches • CNC Aluminum' },
    { id: 3, name: 'Neural Precision Mouse', category: 'computing', price: 129, badge: 'New', rating: 4.7, image: '🖱️', specs: '32,000 DPI Sensor • 48g Ultralight' },
    { id: 4, name: 'Holographic Studio DAC', category: 'audio', price: 279, badge: 'Audiophile', rating: 5.0, image: '🎛️', specs: 'Dual ESS Sabre DAC • Balanced 4.4mm' },
    { id: 5, name: 'Apex Titanium Smart Ring', category: 'wearables', price: 299, badge: 'Pre-order', rating: 4.8, image: '💍', specs: 'Biometric Sleep & HRV Tracking • 7d Life' },
    { id: 6, name: 'Flux 140W GaN Station', category: 'accessories', price: 99, badge: 'Essential', rating: 4.9, image: '🔌', specs: '4x USB-C PD 3.1 • ThermalGuard' },
    { id: 7, name: 'Nebula Ambient Light Bar', category: 'accessories', price: 119, badge: 'Back in Stock', rating: 4.6, image: '💡', specs: 'Screen Sync Bar • 16.8M Colors' },
    { id: 8, name: 'Monolith Leather Desk Pad', category: 'accessories', price: 79, badge: 'Handcrafted', rating: 4.9, image: '⬛', specs: 'Full-Grain Tuscan Leather • 900x400mm' },
  ];

  const categories = [
    { id: 'all', label: 'All Artifacts' },
    { id: 'audio', label: 'Audio & Acoustics' },
    { id: 'computing', label: 'Input & Hardware' },
    { id: 'wearables', label: 'Wearables' },
    { id: 'accessories', label: 'Studio Gear' },
  ];

  const filtered = products.filter(p => {
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.specs.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div>
      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '28px' }}>
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              background: activeCategory === c.id ? 'var(--accent-neon)' : 'rgba(255,255,255,0.04)',
              border: activeCategory === c.id ? '1px solid var(--accent-neon)' : '1px solid var(--border)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {filtered.map(p => (
          <div
            key={p.id}
            className="glass-panel"
            style={{
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, border-color 0.2s',
              cursor: 'pointer',
              position: 'relative'
            }}
            onClick={() => onSelectProduct(p)}
          >
            <span style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: 'rgba(168, 85, 247, 0.15)',
              color: 'var(--accent-neon)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)'
            }}>
              {p.badge}
            </span>

            {/* Product Icon */}
            <div style={{
              height: '160px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '64px',
              marginBottom: '12px'
            }}>
              {p.image}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#fff' }}>{p.name}</h3>
              <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-cyan)' }}>\${p.price}</span>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px', flex: 1 }}>{p.specs}</p>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(p);
                }}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '9px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                + Add to Bag
              </button>
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
      path: 'components/CartDrawer.jsx',
      content: `import React, { useState } from 'react';

export default function CartDrawer({ cart, onClose, onUpdateQty, showToast }) {
  const [promoInput, setPromoInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const shipping = subtotal > 300 ? 0 : 25;
  const grandTotal = Math.max(0, subtotal - discountAmount + (subtotal > 0 ? shipping : 0));

  const applyPromo = (e) => {
    e.preventDefault();
    if (promoInput.trim().toUpperCase() === 'AURA20') {
      setDiscountPercent(20);
      showToast('Promo code applied: 20% OFF!');
    } else {
      showToast('Invalid promo code. Try AURA20');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 100
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#12141c',
        borderLeft: '1px solid var(--border)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '28px',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#fff' }}>Your Bag ({cart.length})</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Free Shipping Milestone */}
        <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '12px' }}>
          {subtotal >= 300 ? (
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>🎉 You qualified for Free Express Shipping!</span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Add <strong style={{ color: '#fff' }}>\${300 - subtotal}</strong> more for Free Shipping.</span>
          )}
        </div>

        {/* Cart Item List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '80px' }}>Your bag is empty.</div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '32px' }}>{item.image}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 600 }}>\${item.price}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => onUpdateQty(item.id, -1)} style={{ background: '#1e2434', border: 'none', color: '#fff', width: '26px', height: '26px', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>{item.qty}</span>
                  <button onClick={() => onUpdateQty(item.id, 1)} style={{ background: '#1e2434', border: 'none', color: '#fff', width: '26px', height: '26px', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Summary */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <form onSubmit={applyPromo} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              placeholder="Promo code (e.g. AURA20)"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              style={{ flex: 1, background: '#1a1e2d', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '12px', outline: 'none' }}
            />
            <button type="submit" style={{ background: 'var(--accent-neon)', border: 'none', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '8px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              Apply
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span>Subtotal</span>
            <span>\${subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--accent-cyan)', marginBottom: '6px' }}>
              <span>Discount (20%)</span>
              <span>-\${discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE' : '$' + shipping + '.00'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>
            <span>Total</span>
            <span>\${grandTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={() => showToast('Order simulated successfully! Processing payment...')}
            disabled={cart.length === 0}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #a855f7, #06b6d4)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 800,
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: '0 10px 30px rgba(168, 85, 247, 0.4)'
            }}
          >
            Checkout with Apple Pay / Stripe
          </button>
        </div>
      </div>
    </div>
  );
}
`,
    },
    {
      path: 'components/ProductModal.jsx',
      content: `import React from 'react';

export default function ProductModal({ product, onClose, onAddToCart }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '680px',
        width: '100%',
        borderRadius: 'var(--radius-lg)',
        padding: '36px',
        position: 'relative'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>✕</button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '32px', alignItems: 'center' }}>
          <div style={{ height: '220px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '96px' }}>
            {product.image}
          </div>

          <div>
            <span style={{ fontSize: '11px', color: 'var(--accent-neon)', fontWeight: 700, textTransform: 'uppercase' }}>{product.category}</span>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 12px', color: '#fff' }}>{product.name}</h2>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '16px' }}>\${product.price}</div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
              Precision CNC engineered with aerospace titanium housing, low-loss transmission lines, and bespoke tuned transducers. Includes a 3-year international warranty.
            </p>

            <button
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Add to Bag — \${product.price}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
`,
    },
    {
      path: 'components/ReviewsSection.jsx',
      content: `import React from 'react';

export default function ReviewsSection() {
  const reviews = [
    { author: 'Julian Vance', title: 'Studio Engineer', comment: 'The frequency response on the Spatial Sound Pro is flat out remarkable. Replaced my HD800s.', rating: 5 },
    { author: 'Elena Rostova', title: 'Industrial Designer', comment: 'The precision machining and tactile feel of the Quantum keyboard deck is unmatched.', rating: 5 },
    { author: 'Liam K.', title: 'Creative Technologist', comment: 'Zero noticeable latency over 2.4GHz wireless. Essential hardware for high-demand sessions.', rating: 5 },
  ];

  return (
    <div style={{ marginTop: '72px' }}>
      <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '24px', color: '#fff' }}>Verified Field Reports</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {reviews.map((r, i) => (
          <div key={i} className="glass-panel" style={{ borderRadius: 'var(--radius-md)', padding: '24px' }}>
            <div style={{ color: 'var(--accent-gold)', marginBottom: '10px' }}>★★★★★</div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 16px' }}>"{r.comment}"</p>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{r.author}</div>
              <div style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>{r.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`,
    }
  ]
};
