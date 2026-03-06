// Portfolio Developer Template
export const html = `<!-- Developer Portfolio -->
<nav class="navbar">
  <div class="container">
    <div class="logo">John Doe<span class="dot">.</span></div>
    <ul class="nav-menu">
      <li><a href="#about">About</a></li>
      <li><a href="#skills">Skills</a></li>
      <li><a href="#projects">Projects</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
    <button class="btn-resume">Download CV ↓</button>
  </div>
</nav>

<!-- Hero -->
<section class="hero">
  <div class="container">
    <div class="hero-content">
      <div class="hero-badge">👋 Welcome to my portfolio</div>
      <h1>Hi, I'm <span class="highlight">John Doe</span></h1>
      <h2>Full Stack Developer</h2>
      <p>I build exceptional digital experiences that combine elegant code with beautiful design.</p>
      <div class="hero-buttons">
        <button class="btn-primary">View My Work</button>
        <button class="btn-outline">Contact Me</button>
      </div>
      <div class="tech-stack">
        <span>⚛️ React</span>
        <span>🟢 Node.js</span>
        <span>🔷 TypeScript</span>
        <span>🐍 Python</span>
      </div>
    </div>
    <div class="hero-image">
      <div class="avatar">👨‍💻</div>
    </div>
  </div>
</section>

<!-- About -->
<section id="about" class="about">
  <div class="container">
    <div class="about-grid">
      <div class="about-content">
        <h2>About Me</h2>
        <p>I'm a passionate full-stack developer with 5+ years of experience building web applications. I love turning complex problems into simple, beautiful solutions.</p>
        <p>When I'm not coding, you'll find me contributing to open-source projects, writing technical blogs, or exploring new technologies.</p>
        <div class="stats">
          <div class="stat">
            <div class="stat-number">50+</div>
            <div class="stat-label">Projects</div>
          </div>
          <div class="stat">
            <div class="stat-number">5+</div>
            <div class="stat-label">Years</div>
          </div>
          <div class="stat">
            <div class="stat-number">30+</div>
            <div class="stat-label">Clients</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Skills -->
<section id="skills" class="skills">
  <div class="container">
    <h2>Skills & Technologies</h2>
    <div class="skills-grid">
      <div class="skill-category">
        <h3>Frontend</h3>
        <div class="skill-tags">
          <span>React</span>
          <span>Vue</span>
          <span>TypeScript</span>
          <span>Tailwind</span>
        </div>
      </div>
      <div class="skill-category">
        <h3>Backend</h3>
        <div class="skill-tags">
          <span>Node.js</span>
          <span>Python</span>
          <span>PostgreSQL</span>
          <span>MongoDB</span>
        </div>
      </div>
      <div class="skill-category">
        <h3>Tools</h3>
        <div class="skill-tags">
          <span>Git</span>
          <span>Docker</span>
          <span>AWS</span>
          <span>Figma</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Projects -->
<section id="projects" class="projects">
  <div class="container">
    <h2>Featured Projects</h2>
    <div class="projects-grid">
      <div class="project-card">
        <div class="project-image">🛒</div>
        <h3>E-commerce Platform</h3>
        <p>Full-stack e-commerce solution with React, Node.js, and Stripe integration</p>
        <div class="project-tags">
          <span>React</span>
          <span>Node.js</span>
          <span>Stripe</span>
        </div>
        <div class="project-links">
          <a href="#">Live Demo →</a>
          <a href="#">GitHub</a>
        </div>
      </div>
      <div class="project-card">
        <div class="project-image">📱</div>
        <h3>Task Management App</h3>
        <p>Collaborative task manager with real-time updates and team features</p>
        <div class="project-tags">
          <span>Vue</span>
          <span>Firebase</span>
          <span>Vuex</span>
        </div>
        <div class="project-links">
          <a href="#">Live Demo →</a>
          <a href="#">GitHub</a>
        </div>
      </div>
      <div class="project-card">
        <div class="project-image">🤖</div>
        <h3>AI Chatbot</h3>
        <p>Intelligent chatbot powered by machine learning for customer support</p>
        <div class="project-tags">
          <span>Python</span>
          <span>TensorFlow</span>
          <span>FastAPI</span>
        </div>
        <div class="project-links">
          <a href="#">Live Demo →</a>
          <a href="#">GitHub</a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Contact -->
<section id="contact" class="contact">
  <div class="container">
    <div class="contact-content">
      <h2>Let's Work Together</h2>
      <p>Have a project in mind? I'd love to hear about it.</p>
      <form class="contact-form">
        <div class="form-row">
          <input type="text" placeholder="Your Name" required>
          <input type="email" placeholder="Your Email" required>
        </div>
        <input type="text" placeholder="Subject">
        <textarea placeholder="Your Message" rows="5" required></textarea>
        <button type="submit" class="btn-primary">Send Message</button>
      </form>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="footer">
  <div class="container">
    <div class="footer-content">
      <p>© 2026 John Doe. All rights reserved.</p>
      <div class="social-links">
        <a href="#">GitHub</a>
        <a href="#">LinkedIn</a>
        <a href="#">Twitter</a>
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
  --primary: #6366f1;
  --secondary: #8b5cf6;
  --dark: #0f172a;
  --light: #f8fafc;
  --gray: #64748b;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: var(--dark);
  background: var(--light);
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1.5rem 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.navbar .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.logo .dot {
  color: var(--primary);
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

.btn-resume {
  background: var(--primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s;
}

.btn-resume:hover {
  transform: translateY(-2px);
}

/* Hero */
.hero {
  padding: 180px 0 100px;
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

.hero-badge {
  display: inline-block;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.hero h1 {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  line-height: 1.1;
}

.hero .highlight {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  font-size: 2rem;
  color: var(--gray);
  margin-bottom: 1.5rem;
}

.hero p {
  font-size: 1.125rem;
  color: var(--gray);
  margin-bottom: 2rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
}

.btn-outline {
  background: transparent;
  color: var(--primary);
  padding: 1rem 2rem;
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

.tech-stack {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.tech-stack span {
  background: #f1f5f9;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

.hero-image {
  display: flex;
  justify-content: center;
}

.avatar {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* Sections */
section {
  padding: 100px 0;
}

h2 {
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 3rem;
}

/* About */
.about {
  background: white;
}

.about-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.about-content p {
  font-size: 1.125rem;
  color: var(--gray);
  margin-bottom: 1.5rem;
  line-height: 1.8;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 3rem;
}

.stat {
  text-align: center;
}

.stat-number {
  font-size: 3rem;
  font-weight: bold;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--gray);
}

/* Skills */
.skills {
  background: var(--light);
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.skill-category {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.skill-category h3 {
  margin-bottom: 1rem;
  color: var(--primary);
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tags span {
  background: #f1f5f9;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
}

/* Projects */
.projects {
  background: white;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.project-card {
  background: var(--light);
  padding: 2rem;
  border-radius: 12px;
  transition: transform 0.3s;
}

.project-card:hover {
  transform: translateY(-8px);
}

.project-image {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.project-card h3 {
  margin-bottom: 0.75rem;
}

.project-card p {
  color: var(--gray);
  margin-bottom: 1rem;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.project-tags span {
  background: white;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  border: 1px solid #e2e8f0;
}

.project-links {
  display: flex;
  gap: 1rem;
}

.project-links a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

/* Contact */
.contact {
  background: var(--light);
}

.contact-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.contact-content p {
  color: var(--gray);
  margin-bottom: 2rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.contact-form input,
.contact-form textarea {
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
}

.contact-form input:focus,
.contact-form textarea:focus {
  outline: none;
  border-color: var(--primary);
}

/* Footer */
.footer {
  background: var(--dark);
  color: white;
  padding: 2rem 0;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.social-links {
  display: flex;
  gap: 1.5rem;
}

.social-links a {
  color: white;
  text-decoration: none;
  transition: opacity 0.3s;
}

.social-links a:hover {
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .hero .container {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero h1 {
    font-size: 2.5rem;
  }
  
  .hero-buttons {
    justify-content: center;
  }
  
  .tech-stack {
    justify-content: center;
  }
  
  .stats {
    flex-direction: column;
    gap: 2rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 1rem;
  }
}`;

export const javascript = `// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Form submission
document.querySelector('.contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Thank you for your message! I will get back to you soon.');
  this.reset();
});

// Resume download
document.querySelector('.btn-resume').addEventListener('click', function() {
  alert('Downloading resume...');
});

// Animate on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.project-card, .skill-category').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'all 0.6s ease';
  observer.observe(card);
});

// Animate stats
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const statNumbers = entry.target.querySelectorAll('.stat-number');
      statNumbers.forEach(stat => {
        const target = parseInt(stat.textContent);
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            stat.textContent = target + '+';
            clearInterval(timer);
          } else {
            stat.textContent = Math.floor(current);
          }
        }, 30);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) {
  statsObserver.observe(statsSection);
}

console.log('Portfolio Developer Template loaded successfully!');
`;

export default { html, css, javascript };
