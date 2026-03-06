// Business Corporate Template
export const html = `<!-- Business Corporate Website -->
<nav class="navbar">
  <div class="container">
    <div class="logo">
      <span class="logo-icon">🏢</span>
      <span class="logo-text">CorpPro</span>
    </div>
    <ul class="nav-menu">
      <li><a href="#home">Home</a></li>
      <li><a href="#services">Services</a></li>
      <li><a href="#about">About</a></li>
      <li><a href="#team">Team</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
    <button class="nav-toggle" id="navToggle">
      <span></span>
      <span></span>
      <span></span>
    </button>
  </div>
</nav>

<!-- Hero Section -->
<section id="home" class="hero">
  <div class="container">
    <div class="hero-content">
      <h1 class="hero-title">Building Business Success Together</h1>
      <p class="hero-subtitle">Professional solutions for modern enterprises. We help your business grow with innovative strategies and expert consulting.</p>
      <div class="hero-buttons">
        <button class="btn-primary">Get Started</button>
        <button class="btn-secondary">Learn More</button>
      </div>
      <div class="hero-stats">
        <div class="stat">
          <div class="stat-number">500+</div>
          <div class="stat-label">Clients</div>
        </div>
        <div class="stat">
          <div class="stat-number">15+</div>
          <div class="stat-label">Years</div>
        </div>
        <div class="stat">
          <div class="stat-number">98%</div>
          <div class="stat-label">Satisfaction</div>
        </div>
      </div>
    </div>
    <div class="hero-image">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
    </div>
  </div>
</section>

<!-- Services Section -->
<section id="services" class="services">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">Our Services</h2>
      <p class="section-subtitle">Comprehensive business solutions tailored to your needs</p>
    </div>
    <div class="services-grid">
      <div class="service-card">
        <div class="service-icon">📊</div>
        <h3>Business Strategy</h3>
        <p>Develop winning strategies that drive growth and profitability</p>
        <a href="#" class="service-link">Learn More →</a>
      </div>
      <div class="service-card">
        <div class="service-icon">💼</div>
        <h3>Financial Consulting</h3>
        <p>Expert financial advice to optimize your business performance</p>
        <a href="#" class="service-link">Learn More →</a>
      </div>
      <div class="service-card">
        <div class="service-icon">👥</div>
        <h3>HR Solutions</h3>
        <p>Build and manage high-performing teams effectively</p>
        <a href="#" class="service-link">Learn More →</a>
      </div>
      <div class="service-card">
        <div class="service-icon">📈</div>
        <h3>Market Analysis</h3>
        <p>Data-driven insights to stay ahead of competition</p>
        <a href="#" class="service-link">Learn More →</a>
      </div>
    </div>
  </div>
</section>

<!-- About Section -->
<section id="about" class="about">
  <div class="container">
    <div class="about-grid">
      <div class="about-content">
        <h2 class="section-title">About Our Company</h2>
        <p class="about-text">With over 15 years of experience, we've helped hundreds of businesses achieve their goals through strategic consulting and innovative solutions.</p>
        <div class="about-features">
          <div class="feature">
            <span class="feature-icon">✓</span>
            <span>Proven track record</span>
          </div>
          <div class="feature">
            <span class="feature-icon">✓</span>
            <span>Expert team</span>
          </div>
          <div class="feature">
            <span class="feature-icon">✓</span>
            <span>24/7 support</span>
          </div>
        </div>
        <button class="btn-primary">More About Us</button>
      </div>
      <div class="about-image">
        <div class="image-placeholder">
          <span>Company Image</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Team Section -->
<section id="team" class="team">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">Our Leadership Team</h2>
      <p class="section-subtitle">Meet the experts behind our success</p>
    </div>
    <div class="team-grid">
      <div class="team-card">
        <div class="team-avatar">👨‍💼</div>
        <h3>John Smith</h3>
        <p class="team-role">CEO & Founder</p>
        <div class="team-social">
          <a href="#">in</a>
          <a href="#">𝕏</a>
          <a href="#">📧</a>
        </div>
      </div>
      <div class="team-card">
        <div class="team-avatar">👩‍💼</div>
        <h3>Sarah Johnson</h3>
        <p class="team-role">Chief Operating Officer</p>
        <div class="team-social">
          <a href="#">in</a>
          <a href="#">𝕏</a>
          <a href="#">📧</a>
        </div>
      </div>
      <div class="team-card">
        <div class="team-avatar">👨‍💻</div>
        <h3>Michael Chen</h3>
        <p class="team-role">Chief Technology Officer</p>
        <div class="team-social">
          <a href="#">in</a>
          <a href="#">𝕏</a>
          <a href="#">📧</a>
        </div>
      </div>
      <div class="team-card">
        <div class="team-avatar">👩‍🔬</div>
        <h3>Emily Davis</h3>
        <p class="team-role">Head of Strategy</p>
        <div class="team-social">
          <a href="#">in</a>
          <a href="#">𝕏</a>
          <a href="#">📧</a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Contact Section -->
<section id="contact" class="contact">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">Get In Touch</h2>
      <p class="section-subtitle">Ready to grow your business? Contact us today</p>
    </div>
    <div class="contact-grid">
      <div class="contact-info">
        <div class="contact-item">
          <span class="contact-icon">📍</span>
          <div>
            <h4>Address</h4>
            <p>123 Business Ave, Suite 100<br>New York, NY 10001</p>
          </div>
        </div>
        <div class="contact-item">
          <span class="contact-icon">📞</span>
          <div>
            <h4>Phone</h4>
            <p>+1 (555) 123-4567</p>
          </div>
        </div>
        <div class="contact-item">
          <span class="contact-icon">📧</span>
          <div>
            <h4>Email</h4>
            <p>info@corppro.com</p>
          </div>
        </div>
      </div>
      <form class="contact-form" id="contactForm">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" name="name" required>
        </div>
        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" name="email" required>
        </div>
        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" name="message" rows="5" required></textarea>
        </div>
        <button type="submit" class="btn-primary btn-full">Send Message</button>
      </form>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-about">
        <div class="footer-logo">
          <span class="logo-icon">🏢</span>
          <span class="logo-text">CorpPro</span>
        </div>
        <p>Professional business solutions for modern enterprises.</p>
      </div>
      <div class="footer-links">
        <h4>Quick Links</h4>
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </div>
      <div class="footer-links">
        <h4>Services</h4>
        <ul>
          <li><a href="#">Strategy</a></li>
          <li><a href="#">Consulting</a></li>
          <li><a href="#">Analytics</a></li>
          <li><a href="#">Support</a></li>
        </ul>
      </div>
      <div class="footer-newsletter">
        <h4>Newsletter</h4>
        <p>Subscribe for updates</p>
        <form class="newsletter-form">
          <input type="email" placeholder="Your email">
          <button type="submit">→</button>
        </form>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 CorpPro. All rights reserved.</p>
    </div>
  </div>
</footer>`;

export const css = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #2563eb;
  --primary-dark: #1d4ed8;
  --secondary: #64748b;
  --dark: #0f172a;
  --light: #f8fafc;
  --gray: #e2e8f0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: var(--dark);
  overflow-x: hidden;
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-menu a {
  text-decoration: none;
  color: var(--dark);
  font-weight: 500;
  transition: color 0.3s;
}

.nav-menu a:hover {
  color: var(--primary);
}

.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
}

.nav-toggle span {
  width: 25px;
  height: 3px;
  background: var(--dark);
  border-radius: 2px;
}

/* Hero Section */
.hero {
  padding: 150px 0 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.hero .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn-primary {
  background: white;
  color: var(--primary);
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.btn-secondary {
  background: transparent;
  color: white;
  padding: 1rem 2rem;
  border: 2px solid white;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: white;
  color: var(--primary);
}

.hero-stats {
  display: flex;
  gap: 3rem;
}

.stat {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  opacity: 0.9;
}

.hero-image {
  position: relative;
  height: 400px;
}

.floating-shape {
  position: absolute;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 0;
  right: 0;
}

.shape-2 {
  width: 150px;
  height: 150px;
  bottom: 50px;
  right: 100px;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  top: 100px;
  right: 200px;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* Services Section */
.services {
  padding: 100px 0;
  background: var(--light);
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.25rem;
  color: var(--secondary);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.service-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.service-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.service-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.service-card p {
  color: var(--secondary);
  margin-bottom: 1rem;
}

.service-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

/* About Section */
.about {
  padding: 100px 0;
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.about-text {
  font-size: 1.125rem;
  color: var(--secondary);
  margin-bottom: 2rem;
}

.about-features {
  margin-bottom: 2rem;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.feature-icon {
  color: var(--primary);
  font-weight: bold;
}

.image-placeholder {
  background: var(--gray);
  height: 400px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary);
  font-size: 1.5rem;
}

/* Team Section */
.team {
  padding: 100px 0;
  background: var(--light);
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.team-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.team-card:hover {
  transform: translateY(-8px);
}

.team-avatar {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.team-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.team-role {
  color: var(--secondary);
  margin-bottom: 1rem;
}

.team-social {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.team-social a {
  color: var(--secondary);
  text-decoration: none;
  font-size: 1.25rem;
  transition: color 0.3s;
}

.team-social a:hover {
  color: var(--primary);
}

/* Contact Section */
.contact {
  padding: 100px 0;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.contact-item {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.contact-icon {
  font-size: 2rem;
}

.contact-item h4 {
  margin-bottom: 0.5rem;
}

.contact-item p {
  color: var(--secondary);
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid var(--gray);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.btn-full {
  width: 100%;
}

/* Footer */
.footer {
  background: var(--dark);
  color: white;
  padding: 4rem 0 2rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.footer-about p {
  color: rgba(255,255,255,0.7);
  margin-bottom: 1.5rem;
}

.footer-links h4,
.footer-newsletter h4 {
  margin-bottom: 1rem;
}

.footer-links ul {
  list-style: none;
}

.footer-links li {
  margin-bottom: 0.75rem;
}

.footer-links a {
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: white;
}

.newsletter-form {
  display: flex;
  gap: 0.5rem;
}

.newsletter-form input {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: rgba(255,255,255,0.1);
  color: white;
}

.newsletter-form input::placeholder {
  color: rgba(255,255,255,0.5);
}

.newsletter-form button {
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
}

/* Responsive */
@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .nav-toggle {
    display: flex;
  }
  
  .hero .container,
  .about-grid,
  .contact-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-stats {
    justify-content: center;
  }
  
  .footer-grid {
    grid-template-columns: 1fr;
  }
}`;

export const javascript = `// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
    navMenu.classList.remove('active');
  }
});

// Smooth scrolling for navigation links
document.querySelectorAll('.nav-menu a, .hero-buttons a').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// Contact form submission
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Get form values
  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData);
  
  console.log('Form submitted:', data);
  
  // Show success message (in real app, send to server)
  alert('Thank you for your message! We will get back to you soon.');
  contactForm.reset();
});

// Newsletter form
const newsletterForm = document.querySelector('.newsletter-form');
newsletterForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = newsletterForm.querySelector('input').value;
  console.log('Newsletter subscription:', email);
  alert('Thank you for subscribing!');
  newsletterForm.reset();
});

// Add scroll effect to navbar
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 100) {
    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    navbar.style.backdropFilter = 'blur(10px)';
  } else {
    navbar.style.background = 'white';
  }
  
  lastScroll = currentScroll;
});

// Animate elements on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe service cards and team cards
document.querySelectorAll('.service-card, .team-card').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(card);
});

// Animate stats on scroll
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const statNumbers = entry.target.querySelectorAll('.stat-number');
      statNumbers.forEach(stat => {
        const target = parseInt(stat.textContent);
        animateCounter(stat, 0, target, 2000);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  statsObserver.observe(heroStats);
}

function animateCounter(element, start, end, duration) {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= end) {
      element.textContent = end + (element.textContent.includes('+') ? '+' : '');
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current) + (element.textContent.includes('+') ? '+' : '');
    }
  }, 16);
}

// Hero button animations
document.querySelectorAll('.hero-buttons .btn-primary').forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'translateY(-4px) scale(1.05)';
  });
  
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translateY(0) scale(1)';
  });
});

console.log('Business Corporate Template loaded successfully!');
`;

export default { html, css, javascript };
