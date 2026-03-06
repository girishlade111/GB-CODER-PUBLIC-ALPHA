// Startup Landing Template
export const html = `<!-- Startup Landing Page -->
<nav class="navbar">
  <div class="container">
    <div class="logo">
      <span class="logo-icon">🚀</span>
      <span class="logo-text">StartupX</span>
    </div>
    <ul class="nav-menu">
      <li><a href="#features">Features</a></li>
      <li><a href="#pricing">Pricing</a></li>
      <li><a href="#testimonials">Testimonials</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
    <button class="btn-primary btn-nav">Get Started</button>
  </div>
</nav>

<!-- Hero Section -->
<section class="hero">
  <div class="container">
    <div class="hero-content">
      <div class="badge">🎉 New Feature: AI Integration</div>
      <h1 class="hero-title">Launch Your Startup Faster Than Ever</h1>
      <p class="hero-subtitle">The all-in-one platform to build, launch, and scale your startup. Join 10,000+ founders who trust StartupX.</p>
      <div class="hero-cta">
        <button class="btn-primary btn-large">Start Free Trial</button>
        <button class="btn-secondary btn-large">Watch Demo →</button>
      </div>
      <div class="hero-social-proof">
        <div class="avatars">
          <span class="avatar">👨‍💼</span>
          <span class="avatar">👩‍💻</span>
          <span class="avatar">👨‍🔬</span>
          <span class="avatar">👩‍🎨</span>
        </div>
        <p>Trusted by 10,000+ startups worldwide</p>
      </div>
    </div>
    <div class="hero-visual">
      <div class="dashboard-preview">
        <div class="preview-header">
          <div class="dot red"></div>
          <div class="dot yellow"></div>
          <div class="dot green"></div>
        </div>
        <div class="preview-content">
          <div class="preview-sidebar"></div>
          <div class="preview-main">
            <div class="preview-chart"></div>
            <div class="preview-stats"></div>
          </div>
        </div>
      </div>
      <div class="floating-card card-1">
        <span>📈</span>
        <div>
          <strong>+127%</strong>
          <span>Growth</span>
        </div>
      </div>
      <div class="floating-card card-2">
        <span>💰</span>
        <div>
          <strong>$50K</strong>
          <span>Revenue</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Logos Section -->
<section class="logos">
  <div class="container">
    <p>Featured in</p>
    <div class="logo-grid">
      <span class="logo-item">TechCrunch</span>
      <span class="logo-item">Forbes</span>
      <span class="logo-item">Wired</span>
      <span class="logo-item">VentureBeat</span>
      <span class="logo-item">TheNextWeb</span>
    </div>
  </div>
</section>

<!-- Features Section -->
<section id="features" class="features">
  <div class="container">
    <div class="section-header">
      <span class="badge-outline">✨ Features</span>
      <h2>Everything You Need to Succeed</h2>
      <p>Powerful tools to help you build and grow your startup</p>
    </div>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">🎯</div>
        <h3>Goal Tracking</h3>
        <p>Set and track milestones with our intelligent goal system</p>
        <ul class="feature-list">
          <li>✓ Custom milestones</li>
          <li>✓ Progress tracking</li>
          <li>✓ Team collaboration</li>
        </ul>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <h3>Analytics Dashboard</h3>
        <p>Real-time insights into your startup's performance</p>
        <ul class="feature-list">
          <li>✓ Real-time data</li>
          <li>✓ Custom reports</li>
          <li>✓ Export options</li>
        </ul>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🤖</div>
        <h3>AI Assistant</h3>
        <p>Get intelligent suggestions to optimize your workflow</p>
        <ul class="feature-list">
          <li>✓ Smart recommendations</li>
          <li>✓ Automated tasks</li>
          <li>✓ Predictive insights</li>
        </ul>
      </div>
      <div class="feature-card">
        <div class="feature-icon">👥</div>
        <h3>Team Collaboration</h3>
        <p>Work together seamlessly with your team</p>
        <ul class="feature-list">
          <li>✓ Real-time editing</li>
          <li>✓ Task assignments</li>
          <li>✓ Video calls</li>
        </ul>
      </div>
      <div class="feature-card">
        <div class="feature-icon">💳</div>
        <h3>Payment Integration</h3>
        <p>Accept payments from day one</p>
        <ul class="feature-list">
          <li>✓ Multiple gateways</li>
          <li>✓ Subscription billing</li>
          <li>✓ Invoice generation</li>
        </ul>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔒</div>
        <h3>Enterprise Security</h3>
        <p>Bank-level security for your data</p>
        <ul class="feature-list">
          <li>✓ End-to-end encryption</li>
          <li>✓ SOC 2 compliant</li>
          <li>✓ 99.9% uptime</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- Pricing Section -->
<section id="pricing" class="pricing">
  <div class="container">
    <div class="section-header">
      <span class="badge-outline">💰 Pricing</span>
      <h2>Simple, Transparent Pricing</h2>
      <p>Choose the plan that fits your startup</p>
    </div>
    <div class="pricing-grid">
      <div class="pricing-card">
        <div class="pricing-header">
          <h3>Starter</h3>
          <div class="price">
            <span class="currency">$</span>
            <span class="amount">29</span>
            <span class="period">/month</span>
          </div>
          <p>Perfect for early-stage startups</p>
        </div>
        <ul class="pricing-features">
          <li>✓ Up to 5 team members</li>
          <li>✓ Basic analytics</li>
          <li>✓ 10GB storage</li>
          <li>✓ Email support</li>
          <li>✗ AI assistant</li>
          <li>✗ Custom integrations</li>
        </ul>
        <button class="btn-outline btn-full">Start Free Trial</button>
      </div>
      <div class="pricing-card popular">
        <div class="popular-badge">Most Popular</div>
        <div class="pricing-header">
          <h3>Growth</h3>
          <div class="price">
            <span class="currency">$</span>
            <span class="amount">79</span>
            <span class="period">/month</span>
          </div>
          <p>For growing startups</p>
        </div>
        <ul class="pricing-features">
          <li>✓ Up to 20 team members</li>
          <li>✓ Advanced analytics</li>
          <li>✓ 100GB storage</li>
          <li>✓ Priority support</li>
          <li>✓ AI assistant</li>
          <li>✗ Custom integrations</li>
        </ul>
        <button class="btn-primary btn-full">Start Free Trial</button>
      </div>
      <div class="pricing-card">
        <div class="pricing-header">
          <h3>Enterprise</h3>
          <div class="price">
            <span class="currency">$</span>
            <span class="amount">199</span>
            <span class="period">/month</span>
          </div>
          <p>For scale-ups</p>
        </div>
        <ul class="pricing-features">
          <li>✓ Unlimited team members</li>
          <li>✓ Custom analytics</li>
          <li>✓ Unlimited storage</li>
          <li>✓ 24/7 phone support</li>
          <li>✓ AI assistant</li>
          <li>✓ Custom integrations</li>
        </ul>
        <button class="btn-outline btn-full">Contact Sales</button>
      </div>
    </div>
  </div>
</section>

<!-- Testimonials Section -->
<section id="testimonials" class="testimonials">
  <div class="container">
    <div class="section-header">
      <span class="badge-outline">❤️ Testimonials</span>
      <h2>Loved by Founders</h2>
      <p>See what startup founders say about us</p>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial-card">
        <div class="stars">★★★★★</div>
        <p>"StartupX helped us launch our product 3x faster. The AI features are incredible!"</p>
        <div class="testimonial-author">
          <span class="author-avatar">👨‍💼</span>
          <div>
            <strong>Sarah Chen</strong>
            <span>CEO, TechFlow</span>
          </div>
        </div>
      </div>
      <div class="testimonial-card">
        <div class="stars">★★★★★</div>
        <p>"Best investment we made for our startup. The analytics alone are worth the price."</p>
        <div class="testimonial-author">
          <span class="author-avatar">👩‍💻</span>
          <div>
            <strong>Mike Johnson</strong>
            <span>Founder, DataSync</span>
          </div>
        </div>
      </div>
      <div class="testimonial-card">
        <div class="stars">★★★★★</div>
        <p>"From idea to launch in 2 weeks. StartupX is a game-changer for entrepreneurs."</p>
        <div class="testimonial-author">
          <span class="author-avatar">👨‍🔬</span>
          <div>
            <strong>Alex Rivera</strong>
            <span>CTO, InnovateLab</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class="cta">
  <div class="container">
    <div class="cta-content">
      <h2>Ready to Launch Your Startup?</h2>
      <p>Join thousands of successful founders today</p>
      <div class="cta-form">
        <input type="email" placeholder="Enter your email">
        <button class="btn-primary">Get Started Free</button>
      </div>
      <p class="cta-note">14-day free trial • No credit card required</p>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-logo">
          <span class="logo-icon">🚀</span>
          <span class="logo-text">StartupX</span>
        </div>
        <p>The all-in-one platform for startups</p>
        <div class="social-links">
          <a href="#">𝕏</a>
          <a href="#">in</a>
          <a href="#">📸</a>
          <a href="#">📘</a>
        </div>
      </div>
      <div class="footer-links">
        <h4>Product</h4>
        <ul>
          <li><a href="#">Features</a></li>
          <li><a href="#">Pricing</a></li>
          <li><a href="#">Integrations</a></li>
          <li><a href="#">Changelog</a></li>
        </ul>
      </div>
      <div class="footer-links">
        <h4>Resources</h4>
        <ul>
          <li><a href="#">Documentation</a></li>
          <li><a href="#">Blog</a></li>
          <li><a href="#">Community</a></li>
          <li><a href="#">Help Center</a></li>
        </ul>
      </div>
      <div class="footer-links">
        <h4>Company</h4>
        <ul>
          <li><a href="#">About</a></li>
          <li><a href="#">Careers</a></li>
          <li><a href="#">Legal</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 StartupX. All rights reserved.</p>
    </div>
  </div>
</footer>`;

export const css = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --secondary: #ec4899;
  --dark: #0f172a;
  --light: #f8fafc;
  --gray: #64748b;
  --success: #22c55e;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 0;
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

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
  flex: 1;
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

.btn-nav {
  margin-left: auto;
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
}

.btn-secondary {
  background: transparent;
  color: var(--primary);
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--primary);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: var(--primary);
  color: white;
}

.btn-outline {
  background: transparent;
  color: var(--primary);
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--primary);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-outline:hover {
  background: var(--primary);
  color: white;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.btn-full {
  width: 100%;
}

/* Hero Section */
.hero {
  padding: 180px 0 100px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.hero .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.badge {
  display: inline-block;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.badge-outline {
  display: inline-block;
  background: transparent;
  color: var(--primary);
  padding: 0.5rem 1rem;
  border: 2px solid var(--primary);
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.hero-title {
  font-size: 4rem;
  font-weight: bold;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--gray);
  margin-bottom: 2rem;
  line-height: 1.8;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.hero-social-proof {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatars {
  display: flex;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -10px;
  border: 3px solid white;
}

.avatar:first-child {
  margin-left: 0;
}

.hero-visual {
  position: relative;
}

.dashboard-preview {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  overflow: hidden;
}

.preview-header {
  background: #f1f5f9;
  padding: 1rem;
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.red { background: #ef4444; }
.dot.yellow { background: #f59e0b; }
.dot.green { background: #22c55e; }

.preview-content {
  display: grid;
  grid-template-columns: 80px 1fr;
  min-height: 400px;
}

.preview-sidebar {
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
}

.preview-main {
  padding: 1.5rem;
}

.preview-chart {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  height: 200px;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.preview-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.preview-stats > div {
  background: #f1f5f9;
  height: 80px;
  border-radius: 8px;
}

.floating-card {
  position: absolute;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: float 3s ease-in-out infinite;
}

.floating-card span:first-child {
  font-size: 2rem;
}

.floating-card strong {
  display: block;
  font-size: 1.25rem;
  color: var(--success);
}

.floating-card span:last-child {
  font-size: 0.875rem;
  color: var(--gray);
}

.card-1 {
  top: 10%;
  right: -20px;
  animation-delay: 0s;
}

.card-2 {
  bottom: 20%;
  right: -40px;
  animation-delay: 1.5s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Logos Section */
.logos {
  padding: 3rem 0;
  background: white;
  text-align: center;
}

.logos p {
  color: var(--gray);
  margin-bottom: 2rem;
  font-weight: 500;
}

.logo-grid {
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.logo-item {
  font-size: 1.5rem;
  font-weight: bold;
  color: #cbd5e1;
}

/* Section Header */
.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.section-header p {
  font-size: 1.125rem;
  color: var(--gray);
}

/* Features Section */
.features {
  padding: 100px 0;
  background: var(--light);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}

.feature-card p {
  color: var(--gray);
  margin-bottom: 1rem;
}

.feature-list {
  list-style: none;
}

.feature-list li {
  padding: 0.5rem 0;
  color: var(--gray);
}

/* Pricing Section */
.pricing {
  padding: 100px 0;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.pricing-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 2rem;
  transition: transform 0.3s, border-color 0.3s;
  position: relative;
}

.pricing-card:hover {
  transform: translateY(-8px);
  border-color: var(--primary);
}

.pricing-card.popular {
  border-color: var(--primary);
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.2);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
}

.pricing-header h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.price {
  display: flex;
  align-items: baseline;
  margin-bottom: 1rem;
}

.currency {
  font-size: 1.5rem;
  color: var(--gray);
}

.amount {
  font-size: 3.5rem;
  font-weight: bold;
  color: var(--primary);
}

.period {
  color: var(--gray);
  margin-left: 0.5rem;
}

.pricing-header p {
  color: var(--gray);
  margin-bottom: 2rem;
}

.pricing-features {
  list-style: none;
  margin-bottom: 2rem;
}

.pricing-features li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

/* Testimonials Section */
.testimonials {
  padding: 100px 0;
  background: var(--light);
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.stars {
  color: #fbbf24;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.testimonial-card > p {
  font-style: italic;
  color: var(--gray);
  margin-bottom: 1.5rem;
  line-height: 1.8;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.testimonial-author strong {
  display: block;
  margin-bottom: 0.25rem;
}

.testimonial-author span {
  color: var(--gray);
  font-size: 0.875rem;
}

/* CTA Section */
.cta {
  padding: 100px 0;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
}

.cta-content {
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.cta-content p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-form {
  display: flex;
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto 1rem;
}

.cta-form input {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
}

.cta-form .btn-primary {
  background: white;
  color: var(--primary);
}

.cta-note {
  font-size: 0.875rem;
  opacity: 0.8;
}

/* Footer */
.footer {
  background: var(--dark);
  color: white;
  padding: 4rem 0 2rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
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

.footer-brand p {
  color: rgba(255,255,255,0.7);
  margin-bottom: 1.5rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-links a {
  color: white;
  text-decoration: none;
  font-size: 1.25rem;
  transition: opacity 0.3s;
}

.social-links a:hover {
  opacity: 0.7;
}

.footer-links h4 {
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
  
  .hero .container,
  .cta-form {
    grid-template-columns: 1fr;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-cta {
    flex-direction: column;
  }
  
  .footer-grid {
    grid-template-columns: 1fr;
  }
}`;

export const javascript = `// Smooth scrolling for navigation
document.querySelectorAll('.nav-menu a, .btn-nav').forEach(link => {
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

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 100) {
    navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
  } else {
    navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  }
  
  lastScroll = currentScroll;
});

// CTA form submission
const ctaForm = document.querySelector('.cta-form');
ctaForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = ctaForm.querySelector('input').value;
  console.log('Email submitted:', email);
  alert('Thank you for signing up! We will contact you soon.');
  ctaForm.reset();
});

// Animate elements on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe feature cards and pricing cards
document.querySelectorAll('.feature-card, .pricing-card, .testimonial-card').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(card);
});

// Pricing card hover effect
document.querySelectorAll('.pricing-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    document.querySelectorAll('.pricing-card').forEach(c => {
      if (c !== card) {
        c.style.opacity = '0.7';
      }
    });
  });
  
  card.addEventListener('mouseleave', () => {
    document.querySelectorAll('.pricing-card').forEach(c => {
      c.style.opacity = '1';
    });
  });
});

// Button click animations
document.querySelectorAll('.btn-primary, .btn-secondary, .btn-outline').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size/2;
    const y = e.clientY - rect.top - size/2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255,255,255,0.3)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s ease-out';
    ripple.style.pointerEvents = 'none';
    
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  });
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = \`
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
\`;
document.head.appendChild(style);

console.log('Startup Landing Template loaded successfully!');
`;

export default { html, css, javascript };
