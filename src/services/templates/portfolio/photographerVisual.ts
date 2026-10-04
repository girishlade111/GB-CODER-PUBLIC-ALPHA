// Lumina Lens Fine Art & Editorial Photography Portfolio Template
// Darkroom gallery, interactive full-screen EXIF metadata lightbox, and fine art print calculator

const html = `
<div class="photo-app">
  <!-- Nav -->
  <header class="photo-nav">
    <div class="nav-brand">
      <div class="brand-monogram">LL</div>
      <div>
        <div class="brand-name">JULIEN VANCE</div>
        <div class="brand-sub">Editorial & Fine Art Photographer • Paris & Kyoto</div>
      </div>
    </div>

    <div class="nav-collections">
      <button class="col-btn active" data-col="all">All Works</button>
      <button class="col-btn" data-col="monochrome">Monochrome</button>
      <button class="col-btn" data-col="tokyo">Tokyo Neon</button>
      <button class="col-btn" data-col="architectural">Architectural</button>
    </div>

    <div class="nav-actions">
      <button class="print-store-btn" id="openPrintStoreBtn">Fine Art Prints</button>
      <button class="contact-btn" id="inquireBtn">Book Inquiries</button>
    </div>
  </header>

  <!-- Editorial Masonry Gallery -->
  <main class="photo-gallery" id="galleryContainer">
    <!-- Gallery items rendered dynamically with EXIF metadata -->
  </main>

  <!-- Lightbox Modal with EXIF Camera Data -->
  <div class="photo-lightbox" id="lightbox">
    <div class="lightbox-content">
      <button class="lightbox-close" id="lightboxClose">✕</button>
      <div class="lightbox-img-wrap" id="lightboxVisual">
        <!-- Rendered artwork -->
      </div>
      <div class="lightbox-sidebar">
        <div class="lb-title" id="lbTitle">Midnight in Shibuya</div>
        <div class="lb-location" id="lbLocation">Tokyo, Japan • 35.6580° N, 139.7016° E</div>

        <!-- EXIF Camera Specs -->
        <div class="exif-card">
          <div class="exif-title">CAMERA EXIF METADATA</div>
          <div class="exif-grid">
            <div class="exif-item">
              <span class="exif-k">Body:</span>
              <span class="exif-v" id="exifCamera">Leica M11-P</span>
            </div>
            <div class="exif-item">
              <span class="exif-k">Lens:</span>
              <span class="exif-v" id="exifLens">Noctilux-M 50mm f/0.95</span>
            </div>
            <div class="exif-item">
              <span class="exif-k">Shutter:</span>
              <span class="exif-v" id="exifShutter">1/250s</span>
            </div>
            <div class="exif-item">
              <span class="exif-k">Aperture:</span>
              <span class="exif-v" id="exifAperture">f/1.2</span>
            </div>
            <div class="exif-item">
              <span class="exif-k">ISO:</span>
              <span class="exif-v" id="exifIso">ISO 400</span>
            </div>
            <div class="exif-item">
              <span class="exif-k">Color Profile:</span>
              <span class="exif-v">Kodak Tri-X 400 Emulation</span>
            </div>
          </div>
        </div>

        <!-- Print Order Option -->
        <div class="lb-order-section">
          <div class="order-price-line">
            <span>Museum Archival Print:</span>
            <span class="order-price" id="lbPrice">$420.00</span>
          </div>
          <button class="order-btn" id="lbOrderBtn">Configure Hahnemühle Print</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Print Store Drawer / Modal -->
  <div class="print-modal-overlay" id="printModal">
    <div class="print-modal">
      <div class="print-head">
        <div class="print-title">Fine Art Archival Print Ordering</div>
        <button class="print-close" id="printClose">✕</button>
      </div>
      <p class="print-desc">Hand-signed by Julien Vance on 308gsm Hahnemühle Photo Rag Cotton paper with Certificate of Authenticity.</p>

      <div class="print-form">
        <div class="form-row">
          <label>Select Print Size:</label>
          <select id="printSizeSelect" class="p-select">
            <option value="420" data-size="16x24 in">16 x 24 inches (Edition of 50) — $420</option>
            <option value="780" data-size="24x36 in">24 x 36 inches (Edition of 25) — $780</option>
            <option value="1450" data-size="40x60 in">40 x 60 inches (Edition of 10 Collector) — $1,450</option>
          </select>
        </div>

        <div class="form-row">
          <label>Framing Options:</label>
          <div class="radio-group">
            <label><input type="radio" name="frame" value="0" checked> Unframed Rolled Tube (+$0)</label>
            <label><input type="radio" name="frame" value="180"> Custom Matte Black Walnut Frame (+$180)</label>
          </div>
        </div>

        <div class="print-total-bar">
          <span>Estimated Total:</span>
          <span class="p-total" id="printTotalAmt">$420.00</span>
        </div>

        <button class="order-btn" id="completeOrderBtn">Complete Secure Order</button>
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
  background-color: #0c0c0e;
  color: #e4e4e7;
  min-height: 100vh;
}

.photo-app {
  display: flex;
  flex-direction: column;
}

/* Nav */
.photo-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: #0c0c0e;
  border-bottom: 1px solid #1c1c20;
  position: sticky;
  top: 0;
  z-index: 50;
  flex-wrap: wrap;
  gap: 16px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-monogram {
  width: 36px;
  height: 36px;
  border: 1px solid #52525b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.1em;
}

.brand-name {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.15em;
  color: #ffffff;
}

.brand-sub {
  font-size: 11px;
  color: #71717a;
  letter-spacing: 0.05em;
}

.nav-collections {
  display: flex;
  gap: 8px;
}

@media (max-width: 860px) {
  .nav-collections { display: none; }
}

.col-btn {
  background: transparent;
  border: none;
  color: #71717a;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 6px 12px;
  cursor: pointer;
  transition: color 0.15s;
}

.col-btn.active, .col-btn:hover {
  color: #ffffff;
  border-bottom: 1px solid #ffffff;
}

.nav-actions {
  display: flex;
  gap: 12px;
}

.print-store-btn {
  background: #18181b;
  border: 1px solid #27272a;
  color: #f4f4f5;
  padding: 8px 16px;
  font-size: 12px;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s;
}

.print-store-btn:hover {
  background: #27272a;
}

.contact-btn {
  background: #ffffff;
  border: none;
  color: #000000;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  cursor: pointer;
}

/* Gallery */
.photo-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
  padding: 32px 40px 60px;
}

.gallery-card {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  background: #18181b;
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.gallery-card:hover {
  transform: translateY(-4px);
}

.card-img-placeholder {
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  position: relative;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.85) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  opacity: 0.9;
  transition: opacity 0.2s;
}

.gallery-card:hover .card-overlay {
  opacity: 1;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.card-lens {
  font-size: 11px;
  color: #a1a1aa;
  font-family: monospace;
}

/* Lightbox */
.photo-lightbox {
  position: fixed;
  inset: 0;
  background: rgba(8, 8, 10, 0.96);
  z-index: 200;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 30px;
}

.photo-lightbox.open {
  display: flex;
}

.lightbox-content {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  max-width: 1080px;
  width: 100%;
  background: #121214;
  border: 1px solid #27272a;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

@media (max-width: 860px) {
  .lightbox-content { grid-template-columns: 1fr; }
}

.lightbox-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: #ffffff;
  font-size: 18px;
  cursor: pointer;
  z-index: 10;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.lightbox-img-wrap {
  height: 480px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-sidebar {
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.lb-title {
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 4px;
}

.lb-location {
  font-size: 12px;
  color: #71717a;
  margin-bottom: 24px;
}

.exif-card {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 24px;
}

.exif-title {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #a1a1aa;
  margin-bottom: 12px;
}

.exif-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  font-size: 11px;
}

.exif-k {
  color: #71717a;
  display: block;
}

.exif-v {
  color: #ffffff;
  font-family: monospace;
}

.order-price-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  margin-bottom: 12px;
}

.order-price {
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
}

.order-btn {
  width: 100%;
  background: #ffffff;
  color: #000000;
  border: none;
  font-size: 12px;
  font-weight: 700;
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  letter-spacing: 0.05em;
}

/* Print Modal */
.print-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(6px);
  z-index: 300;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.print-modal-overlay.open {
  display: flex;
}

.print-modal {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 8px;
  max-width: 480px;
  width: 100%;
  padding: 28px;
}

.print-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.print-title {
  font-size: 16px;
  font-weight: 800;
}

.print-close {
  background: none;
  border: none;
  color: #71717a;
  font-size: 18px;
  cursor: pointer;
}

.print-desc {
  font-size: 12px;
  color: #a1a1aa;
  line-height: 1.5;
  margin-bottom: 20px;
}

.form-row {
  margin-bottom: 18px;
}

.form-row label {
  font-size: 11px;
  color: #a1a1aa;
  display: block;
  margin-bottom: 6px;
}

.p-select {
  width: 100%;
  background: #121214;
  border: 1px solid #27272a;
  color: #ffffff;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
}

.print-total-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #27272a;
  padding-top: 16px;
  margin-top: 16px;
  margin-bottom: 18px;
  font-size: 14px;
  font-weight: 700;
}

.p-total {
  font-size: 20px;
  color: #ffffff;
}
`;

const javascript = `
(function() {
  const photos = [
    {
      id: 'p1',
      title: 'Midnight in Shibuya Crossing',
      location: 'Tokyo, Japan • 35.6580° N, 139.7016° E',
      col: 'tokyo',
      camera: 'Leica M11-P',
      lens: 'Noctilux 50mm f/0.95',
      shutter: '1/250s',
      aperture: 'f/1.2',
      iso: 'ISO 400',
      price: 420,
      bg: 'linear-gradient(135deg, #1e1b4b, #3b0764)'
    },
    {
      id: 'p2',
      title: 'Brutalist Concrete Horizon',
      location: 'London, Barbican Centre',
      col: 'architectural',
      camera: 'Hasselblad 907X',
      lens: 'XCD 45mm f/4 P',
      shutter: '1/60s',
      aperture: 'f/8.0',
      iso: 'ISO 100',
      price: 680,
      bg: 'linear-gradient(135deg, #27272a, #09090b)'
    },
    {
      id: 'p3',
      title: 'Rain Reflections on Rue Saint-Denis',
      location: 'Paris, France',
      col: 'monochrome',
      camera: 'Leica Q3 Monochrom',
      lens: 'Summilux 28mm f/1.7',
      shutter: '1/500s',
      aperture: 'f/2.8',
      iso: 'ISO 800',
      price: 380,
      bg: 'linear-gradient(135deg, #3f3f46, #18181b)'
    },
    {
      id: 'p4',
      title: 'Torii Gate in Mountain Mist',
      location: 'Kyoto, Mount Inari',
      col: 'tokyo',
      camera: 'Fujifilm GFX 100 II',
      lens: 'GF 110mm f/2 R LM',
      shutter: '1/125s',
      aperture: 'f/2.0',
      iso: 'ISO 200',
      price: 520,
      bg: 'linear-gradient(135deg, #701a75, #1e1b4b)'
    }
  ];

  const gallery = document.getElementById('galleryContainer');
  function renderGallery(filter) {
    if (!gallery) return;
    gallery.innerHTML = '';
    photos.forEach(item => {
      if (filter && filter !== 'all' && item.col !== filter) return;
      const card = document.createElement('div');
      card.className = 'gallery-card';
      card.innerHTML = 
        '<div class="card-img-placeholder" style="background:' + item.bg + '">' +
          '<div class="card-overlay">' +
            '<div class="card-title">' + item.title + '</div>' +
            '<div class="card-lens">' + item.camera + ' • ' + item.lens + '</div>' +
          '</div>' +
        '</div>';
      
      card.addEventListener('click', () => openLightbox(item));
      gallery.appendChild(card);
    });
  }

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lbClose = document.getElementById('lightboxClose');
  let currentItem = photos[0];

  function openLightbox(item) {
    currentItem = item;
    document.getElementById('lbTitle').textContent = item.title;
    document.getElementById('lbLocation').textContent = item.location;
    document.getElementById('exifCamera').textContent = item.camera;
    document.getElementById('exifLens').textContent = item.lens;
    document.getElementById('exifShutter').textContent = item.shutter;
    document.getElementById('exifAperture').textContent = item.aperture;
    document.getElementById('exifIso').textContent = item.iso;
    document.getElementById('lbPrice').textContent = '$' + item.price + '.00';
    document.getElementById('lightboxVisual').style.background = item.bg;
    if (lightbox) lightbox.classList.add('open');
  }

  if (lbClose && lightbox) {
    lbClose.addEventListener('click', () => lightbox.classList.remove('open'));
  }

  // Filter buttons
  document.querySelectorAll('.col-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.col-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderGallery(this.getAttribute('data-col'));
    });
  });

  // Print modal
  const printModal = document.getElementById('printModal');
  const openPrintBtn = document.getElementById('openPrintStoreBtn');
  const lbOrderBtn = document.getElementById('lbOrderBtn');
  const printClose = document.getElementById('printClose');
  const sizeSelect = document.getElementById('printSizeSelect');
  const printTotal = document.getElementById('printTotalAmt');

  function openPrint() {
    if (lightbox) lightbox.classList.remove('open');
    if (printModal) printModal.classList.add('open');
    updatePrintTotal();
  }

  function updatePrintTotal() {
    if (!sizeSelect || !printTotal) return;
    const base = parseInt(sizeSelect.value, 10);
    const frameRadio = document.querySelector('input[name="frame"]:checked');
    const frameCost = frameRadio ? parseInt(frameRadio.value, 10) : 0;
    printTotal.textContent = '$' + (base + frameCost) + '.00';
  }

  if (openPrintBtn) openPrintBtn.addEventListener('click', openPrint);
  if (lbOrderBtn) lbOrderBtn.addEventListener('click', openPrint);
  if (printClose && printModal) printClose.addEventListener('click', () => printModal.classList.remove('open'));

  if (sizeSelect) sizeSelect.addEventListener('change', updatePrintTotal);
  document.querySelectorAll('input[name="frame"]').forEach(r => r.addEventListener('change', updatePrintTotal));

  const completeBtn = document.getElementById('completeOrderBtn');
  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      completeBtn.textContent = 'Order Confirmed ✓';
      completeBtn.style.background = '#10b981';
      setTimeout(() => {
        if (printModal) printModal.classList.remove('open');
        completeBtn.textContent = 'Complete Secure Order';
        completeBtn.style.background = '#ffffff';
      }, 1800);
    });
  }

  renderGallery('all');
})();
`;

export default { html, css, javascript };
