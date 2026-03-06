// Code Templates Service
export interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'landing' | 'component' | 'utility' | 'animation' | 'layout';
  tags: string[];
  html: string;
  css: string;
  javascript: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
}

class CodeTemplatesService {
  private templates: CodeTemplate[] = [
    {
      id: 'responsive-navbar',
      name: 'Responsive Navigation Bar',
      description: 'Modern responsive navbar with hamburger menu and dropdown',
      category: 'component',
      tags: ['navigation', 'responsive', 'menu'],
      html: `<nav class="navbar">
  <div class="container">
    <div class="logo">Brand</div>
    <button class="hamburger" id="hamburger">
      <span></span>
      <span></span>
      <span></span>
    </button>
    <ul class="nav-menu" id="navMenu">
      <li><a href="#home">Home</a></li>
      <li><a href="#about">About</a></li>
      <li><a href="#services">Services</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
  </div>
</nav>`,
      css: `.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 2rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-menu a {
  color: white;
  text-decoration: none;
  transition: opacity 0.3s;
}

.nav-menu a:hover {
  opacity: 0.8;
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
}

.hamburger span {
  width: 25px;
  height: 3px;
  background: white;
  border-radius: 2px;
}

@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }
  
  .nav-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #667eea;
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }
  
  .nav-menu.active {
    display: flex;
  }
}`,
      javascript: `const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
    navMenu.classList.remove('active');
  }
});`,
      difficulty: 'intermediate',
    },
    {
      id: 'hero-section',
      name: 'Hero Section with CTA',
      description: 'Eye-catching hero section with call-to-action buttons',
      category: 'layout',
      tags: ['hero', 'landing', 'cta'],
      html: `<section class="hero">
  <div class="hero-content">
    <h1 class="hero-title">Build Something Amazing</h1>
    <p class="hero-subtitle">Create beautiful websites with our powerful tools</p>
    <div class="hero-buttons">
      <button class="btn-primary">Get Started</button>
      <button class="btn-secondary">Learn More</button>
    </div>
  </div>
  <div class="hero-image">
    <div class="floating-shape shape-1"></div>
    <div class="floating-shape shape-2"></div>
    <div class="floating-shape shape-3"></div>
  </div>
</section>`,
      css: `.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  position: relative;
  overflow: hidden;
}

.hero-content {
  flex: 1;
  max-width: 600px;
  z-index: 10;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255,255,255,0.8);
  margin-bottom: 2rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  padding: 1rem 2rem;
  background: white;
  color: #1e3c72;
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
  padding: 1rem 2rem;
  background: transparent;
  color: white;
  border: 2px solid white;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: white;
  color: #1e3c72;
}

.hero-image {
  flex: 1;
  position: relative;
  height: 500px;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  right: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  right: 20%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  top: 40%;
  right: 40%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-buttons {
    justify-content: center;
  }
  
  .hero-image {
    display: none;
  }
}`,
      javascript: `// Add scroll animation
document.querySelector('.btn-primary').addEventListener('click', () => {
  window.scrollTo({
    top: window.innerHeight,
    behavior: 'smooth'
  });
});`,
      difficulty: 'beginner',
    },
    {
      id: 'card-grid',
      name: 'Responsive Card Grid',
      description: 'Beautiful card grid layout with hover effects',
      category: 'component',
      tags: ['cards', 'grid', 'responsive'],
      html: `<div class="card-grid">
  <div class="card">
    <div class="card-icon">🚀</div>
    <h3 class="card-title">Fast Performance</h3>
    <p class="card-description">Optimized for speed and efficiency</p>
  </div>
  <div class="card">
    <div class="card-icon">🎨</div>
    <h3 class="card-title">Modern Design</h3>
    <p class="card-description">Beautiful and intuitive interface</p>
  </div>
  <div class="card">
    <div class="card-icon">🔒</div>
    <h3 class="card-title">Secure</h3>
    <p class="card-description">Enterprise-grade security</p>
  </div>
  <div class="card">
    <div class="card-icon">📱</div>
    <h3 class="card-title">Responsive</h3>
    <p class="card-description">Works on all devices</p>
  </div>
</div>`,
      css: `.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.card-description {
  color: #718096;
  line-height: 1.6;
}`,
      javascript: `// Add click animation
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
      card.style.transform = '';
    }, 150);
  });
});`,
      difficulty: 'beginner',
    },
    {
      id: 'animated-counter',
      name: 'Animated Counter',
      description: 'Number counter with smooth animation',
      category: 'animation',
      tags: ['animation', 'counter', 'numbers'],
      html: `<div class="counters">
  <div class="counter-item">
    <div class="counter" data-target="1500">0</div>
    <p class="counter-label">Projects Completed</p>
  </div>
  <div class="counter-item">
    <div class="counter" data-target="850">0</div>
    <p class="counter-label">Happy Clients</p>
  </div>
  <div class="counter-item">
    <div class="counter" data-target="120">0</div>
    <p class="counter-label">Awards Won</p>
  </div>
</div>`,
      css: `.counters {
  display: flex;
  justify-content: space-around;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.counter-item {
  text-align: center;
}

.counter {
  font-size: 4rem;
  font-weight: bold;
  color: white;
  display: block;
}

.counter-label {
  color: rgba(255,255,255,0.8);
  font-size: 1.25rem;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .counters {
    flex-direction: column;
    gap: 3rem;
  }
}`,
      javascript: `const counters = document.querySelectorAll('.counter');
const speed = 200;

const animateCounter = (counter) => {
  const target = +counter.getAttribute('data-target');
  const increment = target / speed;
  
  const updateCount = () => {
    const count = +counter.innerText;
    if (count < target) {
      counter.innerText = Math.ceil(count + increment);
      setTimeout(updateCount, 10);
    } else {
      counter.innerText = target;
    }
  };
  
  updateCount();
};

// Start animation when in view
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

counters.forEach(counter => observer.observe(counter));`,
      difficulty: 'intermediate',
    },
    {
      id: 'contact-form',
      name: 'Contact Form',
      description: 'Modern contact form with validation',
      category: 'component',
      tags: ['form', 'contact', 'validation'],
      html: `<form class="contact-form" id="contactForm">
  <div class="form-group">
    <label for="name">Name</label>
    <input type="text" id="name" name="name" required>
  </div>
  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required>
  </div>
  <div class="form-group">
    <label for="message">Message</label>
    <textarea id="message" name="message" rows="5" required></textarea>
  </div>
  <button type="submit" class="submit-btn">Send Message</button>
  <div class="success-message" id="successMessage">
    ✓ Message sent successfully!
  </div>
</form>`,
      css: `.contact-form {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #1a202c;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.success-message {
  display: none;
  margin-top: 1rem;
  padding: 1rem;
  background: #c6f6d5;
  color: #22543d;
  border-radius: 8px;
  text-align: center;
}`,
      javascript: `const form = document.getElementById('contactForm');
const successMessage = document.getElementById('successMessage');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Simulate form submission
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  console.log('Form submitted:', data);
  
  // Show success message
  successMessage.style.display = 'block';
  form.reset();
  
  // Hide success message after 3 seconds
  setTimeout(() => {
    successMessage.style.display = 'none';
  }, 3000);
});`,
      difficulty: 'beginner',
    },
    {
      id: 'dark-mode-toggle',
      name: 'Dark Mode Toggle',
      description: 'Smooth dark/light mode switcher',
      category: 'utility',
      tags: ['theme', 'dark-mode', 'toggle'],
      html: `<div class="theme-switcher">
  <button class="theme-toggle" id="themeToggle">
    <span class="sun-icon">☀️</span>
    <span class="moon-icon">🌙</span>
    <div class="toggle-ball"></div>
  </button>
</div>

<div class="content">
  <h1>Theme Switcher Demo</h1>
  <p>Click the toggle to switch between light and dark mode</p>
</div>`,
      css: `:root {
  --bg-color: #ffffff;
  --text-color: #1a202c;
  --card-bg: #f7fafc;
}

[data-theme="dark"] {
  --bg-color: #1a202c;
  --text-color: #ffffff;
  --card-bg: #2d3748;
}

body {
  background: var(--bg-color);
  color: var(--text-color);
  transition: all 0.3s ease;
}

.theme-switcher {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.theme-toggle {
  width: 80px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  border: none;
  position: relative;
  cursor: pointer;
  padding: 5px;
}

.sun-icon, .moon-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  transition: opacity 0.3s;
}

.sun-icon {
  left: 10px;
  opacity: 1;
}

.moon-icon {
  right: 10px;
  opacity: 0;
}

.toggle-ball {
  width: 30px;
  height: 30px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 5px;
  left: 5px;
  transition: transform 0.3s ease;
}

[data-theme="dark"] .toggle-ball {
  transform: translateX(40px);
}

[data-theme="dark"] .sun-icon {
  opacity: 0;
}

[data-theme="dark"] .moon-icon {
  opacity: 1;
}

.content {
  max-width: 800px;
  margin: 100px auto;
  padding: 2rem;
  text-align: center;
}

.content h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.content p {
  font-size: 1.25rem;
  opacity: 0.8;
}`,
      javascript: `const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});`,
      difficulty: 'beginner',
    },
  ];

  public getTemplates(): CodeTemplate[] {
    return this.templates;
  }

  public getTemplateById(id: string): CodeTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  public getTemplatesByCategory(category: CodeTemplate['category']): CodeTemplate[] {
    return this.templates.filter(t => t.category === category);
  }

  public searchTemplates(query: string): CodeTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    return this.templates.filter(t =>
      t.name.toLowerCase().includes(lowercaseQuery) ||
      t.description.toLowerCase().includes(lowercaseQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  public getTemplatesByDifficulty(difficulty: CodeTemplate['difficulty']): CodeTemplate[] {
    return this.templates.filter(t => t.difficulty === difficulty);
  }
}

export const codeTemplatesService = new CodeTemplatesService();
