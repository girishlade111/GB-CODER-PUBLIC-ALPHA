
export default {
  html: `
<div class="pricing-page">
  <div class="header animate-fade-in-up">
    <h1>Simple, transparent pricing</h1>
    <p>No hidden fees. No surprise charges.</p>
  </div>
  <div class="pricing-grid">
    <div class="plan hover-lift animate-fade-in-up" style="animation-delay: 0.1s">
      <h3>Hobby</h3>
      <div class="price"><span>$</span>0<span>/mo</span></div>
      <ul>
        <li>✓ 1 Project</li>
        <li>✓ Community Support</li>
        <li>✓ 100 API Requests</li>
      </ul>
      <button class="btn-outline">Start Free</button>
    </div>
    <div class="plan pro hover-lift animate-fade-in-up" style="animation-delay: 0.2s">
      <div class="popular">Most Popular</div>
      <h3>Pro</h3>
      <div class="price"><span>$</span>29<span>/mo</span></div>
      <ul>
        <li>✓ Unlimited Projects</li>
        <li>✓ Priority Support</li>
        <li>✓ 10,000 API Requests</li>
        <li>✓ Custom Domains</li>
      </ul>
      <button class="btn-solid">Get Started</button>
    </div>
    <div class="plan hover-lift animate-fade-in-up" style="animation-delay: 0.3s">
      <h3>Enterprise</h3>
      <div class="price"><span>$</span>99<span>/mo</span></div>
      <ul>
        <li>✓ Everything in Pro</li>
        <li>✓ 24/7 Phone Support</li>
        <li>✓ Unlimited API Requests</li>
        <li>✓ SLA Agreement</li>
      </ul>
      <button class="btn-outline">Contact Sales</button>
    </div>
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

.pricing-page { padding: 5rem 5%; background: #f8fafc; min-height: 100vh; }
.header { text-align: center; margin-bottom: 4rem; }
.header h1 { font-size: 3rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem; letter-spacing: -1px; }
.header p { font-size: 1.25rem; color: #64748b; }

.pricing-grid { display: flex; justify-content: center; gap: 2rem; max-width: 1200px; margin: 0 auto; align-items: center; }
.plan { background: white; padding: 3rem; border-radius: 24px; box-shadow: var(--shadow-md); border: 1px solid #e2e8f0; flex: 1; text-align: center; position: relative; }
.plan.pro { transform: scale(1.05); box-shadow: var(--shadow-xl); border: 2px solid var(--primary); }
.plan.pro:hover { transform: scale(1.05) translateY(-5px); }

.popular { position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: var(--primary); color: white; padding: 0.5rem 1.5rem; border-radius: 50px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
h3 { font-size: 1.5rem; color: #0f172a; margin-bottom: 1rem; }
.price { font-size: 4rem; font-weight: 800; color: #0f172a; margin-bottom: 2rem; display: flex; justify-content: center; align-items: baseline; }
.price span { font-size: 1.25rem; color: #64748b; font-weight: 600; margin: 0 0.2rem; }

ul { list-style: none; text-align: left; margin-bottom: 3rem; display: flex; flex-direction: column; gap: 1rem; }
li { color: #475569; font-weight: 500; display: flex; gap: 0.5rem; }

.btn-outline { width: 100%; padding: 1rem; background: transparent; border: 2px solid #e2e8f0; border-radius: 12px; font-weight: 700; color: #0f172a; font-size: 1rem; }
.btn-outline:hover { border-color: #0f172a; }
.btn-solid { width: 100%; padding: 1rem; background: var(--primary); border: 2px solid var(--primary); border-radius: 12px; font-weight: 700; color: white; font-size: 1rem; }
.btn-solid:hover { background: var(--primary-hover); }
  `,
  javascript: ``
};
