
export default {
  html: `
<div class="cafe-wrap">
  <nav class="cafe-nav">
    <div class="logo">Brew<span>&</span>Bite</div>
    <div><a href="#">Menu</a> <a href="#">Location</a></div>
  </nav>
  <header class="cafe-hero">
    <div class="hero-box animate-fade-in-up">
      <h1>Artisan Coffee <br/>& Fresh Pastries</h1>
      <button class="order-btn">Order Ahead</button>
    </div>
  </header>
  <div class="grid-gallery">
    <img src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&auto=format&fit=crop" class="hover-lift" />
    <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop" class="hover-lift" />
    <img src="https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=500&auto=format&fit=crop" class="hover-lift" />
  </div>
</div>
  `,
  css: `

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
  --primary: #4F46E5;
  --primary-hover: #4338CA;
  --secondary: #ec4899;
  --dark: #0f172a;
  --light: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-400: #94a3b8;
  --gray-800: #1e293b;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; color: var(--dark); background-color: var(--light); line-height: 1.6; -webkit-font-smoothing: antialiased; }
a { text-decoration: none; color: inherit; transition: all 0.3s ease; }
button { cursor: pointer; border: none; font-family: inherit; transition: all 0.3s ease; }

.gradient-text { background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-image: linear-gradient(to right, var(--primary), var(--secondary)); }
.animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(20px); }
@keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
.hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
.hover-lift:hover { transform: translateY(-5px); box-shadow: var(--shadow-xl); }

.cafe-wrap { background: #faf9f6; min-height: 100vh; }
.cafe-nav { display: flex; justify-content: space-between; padding: 2rem 5%; align-items: center; }
.cafe-nav .logo { font-size: 1.8rem; font-weight: 800; color: #431407; font-family: serif; }
.cafe-nav .logo span { color: #d97706; }
.cafe-nav a { margin-left: 2rem; color: #78350f; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-size: 0.9rem; }
.cafe-hero { height: 60vh; background: url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1600&auto=format&fit=crop') center/cover; position: relative; display: flex; align-items: center; justify-content: center; }
.cafe-hero::before { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.4); }
.hero-box { position: relative; z-index: 1; text-align: center; color: white; }
.hero-box h1 { font-family: serif; font-size: 4rem; line-height: 1.2; margin-bottom: 2rem; text-shadow: 0 4px 10px rgba(0,0,0,0.5); }
.order-btn { background: #d97706; color: white; padding: 1rem 3rem; font-size: 1.1rem; font-weight: bold; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 15px -3px rgba(217, 119, 6, 0.4); }
.order-btn:hover { background: #b45309; transform: translateY(-3px); }
.grid-gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; padding: 4rem 5%; }
.grid-gallery img { width: 100%; height: 300px; object-fit: cover; border-radius: 12px; }
  `,
  javascript: ``
};
