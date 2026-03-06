// E-commerce Store Template
export const html = `<!-- E-commerce Store -->
<nav class="navbar">
  <div class="container">
    <div class="logo">
      <span class="logo-icon">🛒</span>
      <span class="logo-text">ShopHub</span>
    </div>
    <div class="search-bar">
      <input type="text" placeholder="Search products...">
      <button>🔍</button>
    </div>
    <div class="nav-actions">
      <button class="nav-btn">❤️</button>
      <button class="nav-btn cart">
        🛒
        <span class="cart-count">3</span>
      </button>
      <button class="nav-btn">👤</button>
    </div>
  </div>
</nav>

<!-- Hero Section -->
<section class="hero">
  <div class="container">
    <div class="hero-content">
      <h1>Summer Sale is Here!</h1>
      <p>Up to 70% off on selected items</p>
      <button class="btn-primary">Shop Now →</button>
    </div>
  </div>
</section>

<!-- Categories -->
<section class="categories">
  <div class="container">
    <div class="category-grid">
      <div class="category-card">
        <span>👕</span>
        <h3>Clothing</h3>
      </div>
      <div class="category-card">
        <span>👟</span>
        <h3>Shoes</h3>
      </div>
      <div class="category-card">
        <span>⌚</span>
        <h3>Accessories</h3>
      </div>
      <div class="category-card">
        <span>💄</span>
        <h3>Beauty</h3>
      </div>
    </div>
  </div>
</section>

<!-- Products Grid -->
<section class="products">
  <div class="container">
    <div class="section-header">
      <h2>Featured Products</h2>
      <div class="filters">
        <select>
          <option>Sort by: Popular</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Newest</option>
        </select>
      </div>
    </div>
    <div class="products-grid">
      <div class="product-card">
        <div class="product-image">
          <span class="product-emoji">👕</span>
          <span class="badge">New</span>
          <div class="product-actions">
            <button>❤️</button>
            <button>👁️</button>
          </div>
        </div>
        <div class="product-info">
          <h3>Classic T-Shirt</h3>
          <div class="rating">★★★★☆</div>
          <div class="price">
            <span class="current">$29.99</span>
            <span class="old">$39.99</span>
          </div>
          <button class="btn-add">Add to Cart</button>
        </div>
      </div>
      <div class="product-card">
        <div class="product-image">
          <span class="product-emoji">👟</span>
        </div>
        <div class="product-info">
          <h3>Running Shoes</h3>
          <div class="rating">★★★★★</div>
          <div class="price">
            <span class="current">$89.99</span>
          </div>
          <button class="btn-add">Add to Cart</button>
        </div>
      </div>
      <div class="product-card">
        <div class="product-image">
          <span class="product-emoji">👜</span>
          <span class="badge sale">Sale</span>
        </div>
        <div class="product-info">
          <h3>Leather Handbag</h3>
          <div class="rating">★★★★☆</div>
          <div class="price">
            <span class="current">$129.99</span>
            <span class="old">$179.99</span>
          </div>
          <button class="btn-add">Add to Cart</button>
        </div>
      </div>
      <div class="product-card">
        <div class="product-image">
          <span class="product-emoji">⌚</span>
        </div>
        <div class="product-info">
          <h3>Smart Watch</h3>
          <div class="rating">★★★★★</div>
          <div class="price">
            <span class="current">$199.99</span>
          </div>
          <button class="btn-add">Add to Cart</button>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Features -->
<section class="features">
  <div class="container">
    <div class="features-grid">
      <div class="feature-item">
        <span>🚚</span>
        <h4>Free Shipping</h4>
        <p>On orders over $50</p>
      </div>
      <div class="feature-item">
        <span>↩️</span>
        <h4>Easy Returns</h4>
        <p>30-day return policy</p>
      </div>
      <div class="feature-item">
        <span>🔒</span>
        <h4>Secure Payment</h4>
        <p>100% secure transactions</p>
      </div>
      <div class="feature-item">
        <span>💬</span>
        <h4>24/7 Support</h4>
        <p>Dedicated customer support</p>
      </div>
    </div>
  </div>
</section>

<!-- Newsletter -->
<section class="newsletter">
  <div class="container">
    <div class="newsletter-content">
      <h2>Subscribe & Get 20% Off</h2>
      <p>Join our newsletter for exclusive deals</p>
      <form class="newsletter-form">
        <input type="email" placeholder="Enter your email">
        <button type="submit" class="btn-primary">Subscribe</button>
      </form>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-section">
        <h4>ShopHub</h4>
        <p>Your one-stop shop for everything</p>
        <div class="social-links">
          <a href="#">📘</a>
          <a href="#">📸</a>
          <a href="#">𝕏</a>
        </div>
      </div>
      <div class="footer-section">
        <h4>Shop</h4>
        <ul>
          <li><a href="#">All Products</a></li>
          <li><a href="#">New Arrivals</a></li>
          <li><a href="#">Sale</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h4>Help</h4>
        <ul>
          <li><a href="#">Shipping</a></li>
          <li><a href="#">Returns</a></li>
          <li><a href="#">FAQ</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h4>Contact</h4>
        <ul>
          <li>📧 support@shophub.com</li>
          <li>📞 1-800-SHOPHUB</li>
        </ul>
      </div>
    </div>
  </div>
</footer>`;

export const css = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #f59e0b;
  --primary-dark: #d97706;
  --secondary: #10b981;
  --dark: #1f2937;
  --light: #f9fafb;
  --gray: #6b7280;
  --danger: #ef4444;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--light);
  color: var(--dark);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Navbar */
.navbar {
  background: white;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.navbar .container {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
}

.logo-icon {
  font-size: 2rem;
}

.search-bar {
  flex: 1;
  display: flex;
  max-width: 500px;
}

.search-bar input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px 0 0 8px;
  outline: none;
}

.search-bar button {
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  border: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  font-size: 1.25rem;
}

.nav-actions {
  display: flex;
  gap: 1rem;
}

.nav-btn {
  background: #f3f4f6;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.25rem;
  position: relative;
  transition: background 0.3s;
}

.nav-btn:hover {
  background: #e5e7eb;
}

.nav-btn.cart .cart-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--danger);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 50%;
}

/* Hero */
.hero {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  padding: 100px 0;
  text-align: center;
  color: white;
}

.hero-content h1 {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.btn-primary {
  background: white;
  color: var(--primary);
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

/* Categories */
.categories {
  padding: 3rem 0;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.category-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.3s;
}

.category-card span {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.category-card:hover {
  transform: translateY(-8px);
}

/* Products */
.products {
  padding: 3rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 2rem;
  font-weight: bold;
}

.filters select {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.product-image {
  position: relative;
  height: 250px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-emoji {
  font-size: 5rem;
}

.badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: var(--secondary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: bold;
}

.badge.sale {
  background: var(--danger);
}

.product-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.product-card:hover .product-actions {
  opacity: 1;
}

.product-actions button {
  background: white;
  border: none;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.product-info {
  padding: 1.5rem;
}

.product-info h3 {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.rating {
  color: #fbbf24;
  margin-bottom: 0.75rem;
}

.price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.price .current {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
}

.price .old {
  text-decoration: line-through;
  color: var(--gray);
  font-size: 0.875rem;
}

.btn-add {
  width: 100%;
  padding: 0.75rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-add:hover {
  background: var(--primary-dark);
}

/* Features */
.features {
  padding: 3rem 0;
  background: white;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.feature-item {
  text-align: center;
}

.feature-item span {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.feature-item h4 {
  margin-bottom: 0.5rem;
}

.feature-item p {
  color: var(--gray);
}

/* Newsletter */
.newsletter {
  padding: 4rem 0;
  background: linear-gradient(135deg, #1f2937, #374151);
  color: white;
}

.newsletter-content {
  text-align: center;
}

.newsletter-content h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.newsletter-content p {
  margin-bottom: 2rem;
}

.newsletter-form {
  display: flex;
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto;
}

.newsletter-form input {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 8px;
}

/* Footer */
.footer {
  background: var(--dark);
  color: white;
  padding: 3rem 0;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.footer-section h4 {
  margin-bottom: 1rem;
}

.footer-section ul {
  list-style: none;
}

.footer-section li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: white;
}

.social-links {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.social-links a {
  font-size: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar .container {
    flex-wrap: wrap;
  }
  
  .search-bar {
    order: 3;
    max-width: 100%;
    width: 100%;
  }
  
  .hero-content h1 {
    font-size: 2.5rem;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .newsletter-form {
    flex-direction: column;
  }
}`;

export const javascript = `// Add to cart functionality
document.querySelectorAll('.btn-add').forEach(btn => {
  btn.addEventListener('click', function() {
    const productCard = this.closest('.product-card');
    const productName = productCard.querySelector('h3').textContent;
    
    // Update cart count
    const cartCount = document.querySelector('.cart-count');
    const currentCount = parseInt(cartCount.textContent);
    cartCount.textContent = currentCount + 1;
    
    // Show feedback
    this.textContent = 'Added! ✓';
    this.style.background = '#10b981';
    
    setTimeout(() => {
      this.textContent = 'Add to Cart';
      this.style.background = '';
    }, 2000);
    
    console.log('Added to cart:', productName);
  });
});

// Wishlist functionality
document.querySelectorAll('.product-actions button:first-child').forEach(btn => {
  btn.addEventListener('click', function() {
    this.textContent = this.textContent === '❤️' ? '💚' : '❤️';
  });
});

// Search functionality
const searchInput = document.querySelector('.search-bar input');
searchInput.addEventListener('input', function() {
  const query = this.value.toLowerCase();
  document.querySelectorAll('.product-card').forEach(card => {
    const name = card.querySelector('h3').textContent.toLowerCase();
    if (name.includes(query) || query === '') {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
});

// Category filter
document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', function() {
    const category = this.querySelector('h3').textContent;
    console.log('Filtering by category:', category);
  });
});

// Newsletter subscription
document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = this.querySelector('input').value;
  alert('Thank you for subscribing! You will receive 20% off code at: ' + email);
  this.reset();
});

// Sort functionality
document.querySelector('.filters select').addEventListener('change', function() {
  const sortValue = this.value;
  console.log('Sorting by:', sortValue);
  // Implement sorting logic here
});

// Animate products on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.product-card').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'all 0.6s ease';
  observer.observe(card);
});

console.log('E-commerce Store Template loaded successfully!');
`;

export default { html, css, javascript };
