export default {
  files: [
    {
      path: 'main.jsx',
      content: `      import { StrictMode } from 'react';
      import { createRoot } from 'react-dom/client';
      import App from './App.jsx';

      // The playground supplies #root. The routes underneath are emulated in
      // \`App.jsx\`; see the comment block at the top of that file for what a real
      // Next.js App Router does instead.
      import './styles.css';

      const host = document.getElementById('root');

      if (host) {
        createRoot(host).render(
          <StrictMode>
            <App />
          </StrictMode>,
        );
      }`,
    },
    {
      path: 'styles.css',
      content: `      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');

      /* -- Tokens --------------------------------------------------- */
      :root {
        --font-display: 'Fraunces', Georgia, serif;
        --font-body: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

        --color-bg: #fbfaf8; --color-surface: #ffffff;
        --color-surface-2: #f4f2ee;
        --color-ink: #191614;
        --color-ink-2: #55504b;
        --color-ink-3: #8a827a;
        --color-border: #e6e1da; --color-border-strong: #d3ccc2;

        --color-accent: #7c2d55;
        --color-accent-2: #b03a6e;
        --color-accent-soft: #fbeef3; --color-accent-ink: #ffffff; --color-code-bg: #f6f2ec;

        --space-1: 0.25rem;
        --space-2: 0.5rem;
        --space-3: 0.75rem;
        --space-4: 1rem;
        --space-5: 1.5rem;
        --space-6: 2.25rem;
        --space-7: 3.5rem;

        --radius-sm: 6px; --radius-md: 10px; --radius-lg: 18px; --radius-pill: 999px;

        --shadow-1: 0 1px 2px rgba(25, 22, 20, 0.05), 0 2px 6px rgba(25, 22, 20, 0.04);
        --shadow-2: 0 6px 18px rgba(25, 22, 20, 0.09);
        --shadow-3: 0 20px 48px rgba(25, 22, 20, 0.16);

        --ring: 0 0 0 3px rgba(124, 45, 85, 0.4); --tap: 40px; --measure: 42rem;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --color-bg: #100e0d; --color-surface: #191614;
          --color-surface-2: #211d1a;
          --color-ink: #f4f0ec;
          --color-ink-2: #bdb5ad;
          --color-ink-3: #8a827a;
          --color-border: #2d2825; --color-border-strong: #443d38; --color-accent: #f0a5c6;
          --color-accent-2: #d97ba3;
          --color-accent-soft: #331e28; --color-accent-ink: #1a0f14; --color-code-bg: #221d1a;
          --shadow-1: 0 1px 2px rgba(0, 0, 0, 0.4);
          --shadow-2: 0 6px 18px rgba(0, 0, 0, 0.45);
          --shadow-3: 0 20px 48px rgba(0, 0, 0, 0.6);
        }
      }

      /* -- Base ----------------------------------------------------- */
      *, *::before, *::after { box-sizing: border-box; }

      body {
        margin: 0; padding: 0; font-family: var(--font-body); font-size: 16px; line-height: 1.65;
        color: var(--color-ink); background: var(--color-bg);
        -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
      }

      #root { min-height: 100vh; }
      h1, h2, h3 { font-family: var(--font-display); font-weight: 600; letter-spacing: -0.015em; margin: 0; line-height: 1.2; }
      p { margin: 0; }
      ul, ol { margin: 0; padding: 0; }
      a { color: inherit; }
      code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }

      .sr-only {
        position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
        overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
      }

      :where(a, button, input, select, [tabindex]):focus-visible {
        outline: 2px solid transparent; box-shadow: var(--ring); border-radius: var(--radius-sm);
      }

      .shell { min-height: 100vh; display: flex; flex-direction: column; }
      .shell__main { flex: 1; width: 100%; }

      /* Reading progress: a full-width SVG rect whose dash offset carries the value. */
      .progress { position: fixed; inset: 0 0 auto; z-index: 60; height: 4px; background: transparent; }
      .progress__svg { display: block; width: 100%; height: 4px; }
      .progress__track { fill: transparent; }
      .progress__value { fill: var(--color-accent); transition: stroke-dashoffset 120ms linear; }

      /* -- Header --------------------------------------------------- */
      .site-header {
        position: sticky; top: 0; z-index: 50;
        background: color-mix(in srgb, var(--color-bg) 88%, transparent);
        backdrop-filter: blur(12px) saturate(150%); -webkit-backdrop-filter: blur(12px) saturate(150%);
        border-bottom: 1px solid transparent; transition: border-color 220ms ease, box-shadow 220ms ease;
      }
      .site-header--stuck { border-bottom-color: var(--color-border); box-shadow: var(--shadow-1); }

      .site-header__inner {
        display: flex; align-items: center; gap: var(--space-4);
        max-width: 1180px; margin: 0 auto; padding: var(--space-4) clamp(var(--space-4), 4vw, var(--space-6));
      }

      .brand { display: flex; align-items: center; gap: var(--space-3); text-decoration: none; }
      .brand__mark {
        display: grid; place-items: center; width: 36px; height: 36px; color: #fff;
        background: linear-gradient(140deg, var(--color-accent), var(--color-accent-2));
        border-radius: var(--radius-md); box-shadow: var(--shadow-1);
        transition: transform 240ms cubic-bezier(0.34, 1.4, 0.64, 1);
      }
      .brand:hover .brand__mark { transform: rotate(-6deg) scale(1.06); }
      .brand__text { display: grid; }
      .brand__text strong { font-family: var(--font-display); font-size: 1.05rem; }
      .brand__text small { font-size: 0.7rem; color: var(--color-ink-3); }

      .site-nav { display: flex; align-items: center; gap: var(--space-4); margin-left: auto; }
      .site-nav__list { display: flex; align-items: center; gap: var(--space-1); list-style: none; }

      .site-nav__link {
        position: relative; display: inline-block; padding: 6px var(--space-3);
        font-size: 0.88rem; font-weight: 500; color: var(--color-ink-2); text-decoration: none;
        transition: color 180ms ease;
      }
      .site-nav__link::after {
        content: ''; position: absolute; left: var(--space-3); right: var(--space-3); bottom: 2px;
        height: 2px; background: var(--color-accent); border-radius: 2px;
        transform: scaleX(0); transform-origin: left;
        transition: transform 260ms cubic-bezier(0.2, 0.8, 0.3, 1);
      }
      .site-nav__link:hover { color: var(--color-ink); }
      .site-nav__link:hover::after, .site-nav__link--on::after { transform: scaleX(1); }
      .site-nav__link--on { color: var(--color-ink); font-weight: 600; }

      .site-nav__tagitem { list-style: none; }
      .site-nav__tag {
        display: inline-block; padding: 3px var(--space-2); font-size: 0.7rem; text-decoration: none;
        color: var(--color-ink-3); border: 1px solid var(--color-border); border-radius: var(--radius-pill);
        transition: color 160ms ease, border-color 160ms ease, background-color 160ms ease;
      }
      .site-nav__tag:hover { color: var(--color-ink); border-color: var(--color-border-strong); }
      .site-nav__tag--on { color: var(--color-accent); background: var(--color-accent-soft); border-color: var(--color-accent); }

      .site-search { position: relative; display: flex; align-items: center; }
      .site-search__icon { position: absolute; left: var(--space-3); color: var(--color-ink-3); pointer-events: none; }
      .site-search__input {
        width: 11rem; min-height: 36px; padding: 5px var(--space-3) 5px 2.3rem;
        font: inherit; font-size: 0.84rem; color: var(--color-ink);
        background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-pill);
        transition: width 260ms cubic-bezier(0.2, 0.8, 0.3, 1), border-color 160ms ease;
      }
      .site-search__input::-webkit-search-cancel-button { display: none; }
      .site-search__input:focus { width: 15rem; border-color: var(--color-accent); }
      .site-header__cta { min-height: 36px; padding: 5px var(--space-4); font-size: 0.84rem; text-decoration: none; }

      .site-header__burger {
        display: none; place-items: center; width: var(--tap); height: var(--tap); margin-left: auto;
        color: var(--color-ink); background: var(--color-surface-2);
        border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer;
      }

      /* -- Buttons -------------------------------------------------- */
      .button {
        display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2);
        min-height: var(--tap); padding: var(--space-2) var(--space-5);
        font: inherit; font-size: 0.92rem; font-weight: 600; color: var(--color-ink);
        background: var(--color-surface-2); border: 1px solid var(--color-border);
        border-radius: var(--radius-pill); cursor: pointer; text-decoration: none;
        transition: transform 160ms ease, background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
      }
      .button:hover { border-color: var(--color-border-strong); box-shadow: var(--shadow-1); }
      .button:active { transform: translateY(1px); }
      .button--primary {
        color: var(--color-accent-ink); background: var(--color-accent); border-color: transparent;
        background-image: linear-gradient(100deg, transparent 20%, rgba(255, 255, 255, 0.26) 50%, transparent 80%);
        background-size: 220% 100%; background-position: 180% 0;
      }
      .button--primary:hover { background-position: 0 0; transition: transform 160ms ease, background-position 640ms ease, box-shadow 160ms ease; }
      .button--quiet { background: transparent; }

      .link-button {
        display: inline-flex; align-items: center; gap: 4px; padding: 0;
        font: inherit; font-size: 0.84rem; font-weight: 600;
        color: var(--color-accent); background: none; border: 0; cursor: pointer;
      }
      .link-button:hover { text-decoration: underline; }

      /* -- Hero ----------------------------------------------------- */
      .hero {
        display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.85fr);
        align-items: center; gap: clamp(var(--space-5), 4vw, var(--space-7));
        max-width: 1180px; margin: 0 auto;
        padding: clamp(var(--space-6), 6vw, var(--space-7)) clamp(var(--space-4), 4vw, var(--space-6));
      }

      .hero__eyebrow {
        font-size: 0.74rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;
        color: var(--color-accent);
      }
      .hero__title { font-size: clamp(2rem, 4.6vw, 3.3rem); margin-top: var(--space-3); }
      .hero__sub { max-width: 54ch; margin-top: var(--space-4); font-size: clamp(1rem, 1.4vw, 1.1rem); color: var(--color-ink-2); }
      .hero__actions { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-top: var(--space-5); }

      .hero__proof {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr)); gap: var(--space-4);
        margin: var(--space-6) 0 0; padding-top: var(--space-4); border-top: 1px solid var(--color-border);
      }
      .hero__proof dt { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-ink-3); }
      .hero__proof dd { margin: 2px 0 0; font-family: var(--font-display); font-size: 1.5rem; font-weight: 600; font-variant-numeric: tabular-nums; }

      .hero__visual { position: relative; height: 15rem; }
      .hero__card { position: absolute; border-radius: var(--radius-lg); }
      .hero__card--back {
        inset: 0 1.4rem 1.4rem 0; background: var(--color-surface-2);
        border: 1px solid var(--color-border); transform: rotate(4deg);
      }
      .hero__card--front {
        inset: 1.4rem 0 0 1.4rem; padding: var(--space-5);
        background: var(--color-surface); border: 1px solid var(--color-border); box-shadow: var(--shadow-3);
        display: grid; gap: var(--space-3); align-content: start;
      }
      .hero__card-line { height: 0.7rem; border-radius: 4px; background: var(--color-surface-2); }
      .hero__card-line--short { width: 58%; }
      .hero__card-bar { height: 3.4rem; border-radius: var(--radius-sm); background: linear-gradient(120deg, var(--color-accent), var(--color-accent-2)); opacity: 0.85; }

      /* -- Sections ------------------------------------------------- */
      .section { max-width: 1180px; margin: 0 auto; padding: 0 clamp(var(--space-4), 4vw, var(--space-6)) clamp(var(--space-6), 5vw, var(--space-7)); }
      .section__head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap; margin-bottom: var(--space-4); }
      .section__title { font-size: clamp(1.3rem, 2.4vw, 1.75rem); }
      .section__note { font-size: 0.8rem; color: var(--color-ink-3); }
      .section__link { display: inline-flex; align-items: center; gap: 5px; font-size: 0.84rem; font-weight: 600; color: var(--color-accent); text-decoration: none; }
      .section__link:hover { text-decoration: underline; }

      /* -- Post card ------------------------------------------------ */
      .grid-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: var(--space-4); }

      .post-card {
        display: flex; flex-direction: column; overflow: hidden;
        background: var(--color-surface); border: 1px solid var(--color-border);
        border-radius: var(--radius-lg); box-shadow: var(--shadow-1);
        transition: transform 240ms cubic-bezier(0.2, 0.8, 0.3, 1), box-shadow 240ms ease, border-color 240ms ease;
        animation: rise-in 380ms ease backwards;
      }
      .post-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-3); border-color: var(--color-border-strong); }
      .post-card--featured { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); }
      .post-card--featured .post-card__body { padding: clamp(var(--space-5), 3vw, var(--space-6)); }
      .post-card--featured .post-card__heading { font-size: clamp(1.25rem, 2.2vw, 1.7rem); }

      .post-card__gradient { position: relative; display: block; height: 8.5rem; }
      .post-card--featured .post-card__gradient { height: 100%; min-height: 14rem; }
      .post-card__gradient--plum { background: linear-gradient(135deg, #6d28d9, #db2777); }
      .post-card__gradient--teal { background: linear-gradient(135deg, #0f766e, #0891b2); }
      .post-card__gradient--amber { background: linear-gradient(135deg, #b45309, #f59e0b); }
      .post-card__gradient--indigo { background: linear-gradient(135deg, #3730a3, #4f46e5); }
      .post-card__gradient--rose { background: linear-gradient(135deg, #9f1239, #f43f5e); }
      .post-card__gradient--slate { background: linear-gradient(135deg, #1e293b, #475569); }

      /* A soft moving highlight, so the covers are not flat blocks of colour. */
      .post-card__gradient::after {
        content: ''; position: absolute; inset: 0;
        background: radial-gradient(circle at 26% 22%, rgba(255, 255, 255, 0.42), transparent 58%);
      }
      .post-card__initials {
        position: absolute; left: var(--space-4); bottom: var(--space-4); z-index: 1;
        font-family: var(--font-display); font-size: 2.2rem; font-weight: 600;
        color: rgba(255, 255, 255, 0.92); letter-spacing: -0.02em;
      }
      .post-card__tape {
        position: absolute; inset: 0; z-index: 1;
        background: linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.12) 50%, transparent 60%);
      }

      .post-card__body { display: flex; flex-direction: column; gap: var(--space-3); padding: var(--space-5); }
      .post-card__tags { display: flex; gap: 5px; flex-wrap: wrap; }
      .tag-pill {
        padding: 2px var(--space-2); font-size: 0.68rem; font-weight: 600; text-decoration: none;
        color: var(--color-accent); background: var(--color-accent-soft);
        border: 1px solid color-mix(in srgb, var(--color-accent) 22%, transparent); border-radius: var(--radius-pill);
        transition: background-color 160ms ease, transform 160ms ease;
      }
      .tag-pill:hover { transform: translateY(-1px); }

      .post-card__heading { font-size: 1.12rem; }
      .post-card__heading a { text-decoration: none; background-image: linear-gradient(var(--color-accent), var(--color-accent)); background-size: 0% 1.5px; background-repeat: no-repeat; background-position: 0 100%; transition: background-size 320ms cubic-bezier(0.2, 0.8, 0.3, 1), color 180ms ease; }
      .post-card__heading a:hover { color: var(--color-accent); background-size: 100% 1.5px; }
      .post-card__excerpt { font-size: 0.88rem; color: var(--color-ink-2); }

      .post-card__meta { display: flex; align-items: center; gap: var(--space-3); margin-top: auto; padding-top: var(--space-3); border-top: 1px solid var(--color-border); }
      .avatar {
        display: grid; place-items: center; width: 30px; height: 30px; flex: 0 0 auto;
        font-size: 0.68rem; font-weight: 700; color: #fff;
        background: linear-gradient(140deg, var(--color-accent), var(--color-accent-2)); border-radius: 50%;
      }
      .avatar--lg { width: 40px; height: 40px; font-size: 0.78rem; }
      .post-card__byline { display: grid; font-size: 0.8rem; font-weight: 600; }
      .post-card__date, .post-card__read { font-size: 0.72rem; font-weight: 400; color: var(--color-ink-3); }
      .post-card__read { margin-left: auto; white-space: nowrap; }

      /* -- Topics / contributors ------------------------------------ */
      .topics { display: flex; flex-wrap: wrap; gap: var(--space-2); list-style: none; }
      .topic {
        display: inline-flex; align-items: center; gap: var(--space-2);
        padding: 6px var(--space-4); text-decoration: none; font-size: 0.86rem;
        color: var(--color-ink-2); background: var(--color-surface);
        border: 1px solid var(--color-border); border-radius: var(--radius-pill);
        transition: color 160ms ease, border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease;
      }
      .topic:hover { color: var(--color-ink); border-color: var(--color-border-strong); transform: translateY(-2px); box-shadow: var(--shadow-1); }
      .topic__count { font-size: 0.7rem; font-weight: 700; color: var(--color-ink-3); font-variant-numeric: tabular-nums; }

      .contributors { display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr)); gap: var(--space-3); list-style: none; }
      .contributor {
        display: flex; align-items: center; gap: var(--space-3);
        padding: var(--space-4); background: var(--color-surface);
        border: 1px solid var(--color-border); border-radius: var(--radius-md);
        transition: transform 180ms ease, box-shadow 180ms ease;
      }
      .contributor:hover { transform: translateY(-2px); box-shadow: var(--shadow-2); }
      .contributor__text { display: grid; flex: 1; }
      .contributor__text strong { font-size: 0.9rem; }
      .contributor__text small { font-size: 0.72rem; color: var(--color-ink-3); }
      .contributor > svg { color: var(--color-done, #2f9e68); flex: 0 0 auto; }

      /* -- CTA ------------------------------------------------------ */
      .cta {
        max-width: 1180px; margin: var(--space-6) auto 0;
        padding: clamp(var(--space-5), 4vw, var(--space-7)) clamp(var(--space-4), 4vw, var(--space-6));
        background: linear-gradient(135deg, var(--color-accent), var(--color-accent-2));
        border-radius: var(--radius-lg); box-shadow: var(--shadow-3);
      }
      .cta__title { color: #fff; font-size: clamp(1.4rem, 2.8vw, 2.1rem); }
      .cta__body { max-width: 52ch; margin: var(--space-3) 0 var(--space-5); color: rgba(255, 255, 255, 0.9); }
      .cta .button--primary { background: #fff; color: var(--color-accent); }

      /* -- Archive -------------------------------------------------- */
      .page { max-width: 1180px; margin: 0 auto; padding: clamp(var(--space-5), 4vw, var(--space-7)) clamp(var(--space-4), 4vw, var(--space-6)); }
      .page__eyebrow { font-size: 0.74rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--color-accent); }
      .page__title { font-size: clamp(1.9rem, 4vw, 2.8rem); margin-top: var(--space-2); }
      .page__lede { max-width: 58ch; margin-top: var(--space-3); color: var(--color-ink-2); }

      .archive { display: grid; grid-template-columns: 15rem minmax(0, 1fr); gap: clamp(var(--space-4), 3vw, var(--space-6)); margin-top: var(--space-6); }
      .archive__rail-title { font-size: 0.74rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.09em; color: var(--color-ink-3); margin-bottom: var(--space-3); }
      .archive__tags { display: grid; gap: 2px; list-style: none; position: sticky; top: 5.5rem; }
      .archive__tag {
        display: flex; align-items: center; justify-content: space-between; gap: var(--space-2);
        width: 100%; min-height: 34px; padding: 5px var(--space-3);
        font: inherit; font-size: 0.84rem; text-align: left; color: var(--color-ink-2);
        background: transparent; border: 1px solid transparent; border-radius: var(--radius-sm); cursor: pointer;
        transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
      }
      .archive__tag:hover { color: var(--color-ink); background: var(--color-surface-2); }
      .archive__tag--on { color: var(--color-accent); background: var(--color-accent-soft); border-color: color-mix(in srgb, var(--color-accent) 26%, transparent); font-weight: 600; }
      .archive__tag-count { font-size: 0.7rem; color: var(--color-ink-3); font-variant-numeric: tabular-nums; }

      .archive__toolbar { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3); flex-wrap: wrap; margin-bottom: var(--space-4); }
      .archive__count { font-size: 1.05rem; }
      .archive__count-tag { font-weight: 400; color: var(--color-ink-3); font-family: var(--font-body); font-size: 0.86rem; }
      .grid-cards--archive { grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); }

      .subscribe-note {
        display: grid; gap: var(--space-2); margin-top: var(--space-7);
        padding: var(--space-5); background: var(--color-surface);
        border: 1px solid var(--color-border); border-left: 3px solid var(--color-accent); border-radius: var(--radius-md);
      }
      .subscribe-note__title { font-size: 1.1rem; }
      .subscribe-note__body { max-width: 60ch; color: var(--color-ink-2); font-size: 0.9rem; }

      /* -- Post ----------------------------------------------------- */
      .post { max-width: 1180px; margin: 0 auto; padding: clamp(var(--space-4), 3vw, var(--space-6)) clamp(var(--space-4), 4vw, var(--space-6)); }

      .crumbs ol { display: flex; gap: var(--space-2); flex-wrap: wrap; list-style: none; font-size: 0.8rem; }
      .crumbs li { display: flex; gap: var(--space-2); color: var(--color-ink-3); }
      .crumbs li + li::before { content: '/'; opacity: 0.5; }
      .crumbs__link { color: var(--color-ink-3); text-decoration: none; }
      .crumbs__link:hover { color: var(--color-accent); text-decoration: underline; }
      .crumbs__current { color: var(--color-ink-2); }

      .post__head { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.4fr); gap: clamp(var(--space-5), 3vw, var(--space-6)); align-items: center; margin-top: var(--space-5); }
      .post__cover { position: relative; display: block; height: 15rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-2); overflow: hidden; }
      .post__cover::after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 26% 22%, rgba(255, 255, 255, 0.4), transparent 58%); }
      .post__cover--plum { background: linear-gradient(135deg, #6d28d9, #db2777); }
      .post__cover--teal { background: linear-gradient(135deg, #0f766e, #0891b2); }
      .post__cover--amber { background: linear-gradient(135deg, #b45309, #f59e0b); }
      .post__cover--indigo { background: linear-gradient(135deg, #3730a3, #4f46e5); }
      .post__cover--rose { background: linear-gradient(135deg, #9f1239, #f43f5e); }
      .post__cover--slate { background: linear-gradient(135deg, #1e293b, #475569); }
      .post__cover-initials { position: absolute; left: var(--space-5); bottom: var(--space-5); z-index: 1; font-family: var(--font-display); font-size: 2.8rem; font-weight: 600; color: rgba(255, 255, 255, 0.94); }

      .post__headings { display: grid; gap: var(--space-3); }
      .post__tags { display: flex; gap: 5px; flex-wrap: wrap; }
      .post__title { font-size: clamp(1.7rem, 3.6vw, 2.6rem); }
      .post__excerpt { font-size: clamp(1rem, 1.4vw, 1.08rem); color: var(--color-ink-2); max-width: 52ch; }
      .post__byline { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; margin-top: var(--space-2); padding-top: var(--space-3); border-top: 1px solid var(--color-border); }
      .post__byline-text { display: grid; }
      .post__byline-text strong { font-size: 0.88rem; }
      .post__byline-text small { font-size: 0.72rem; color: var(--color-ink-3); }
      .post__facts { display: flex; gap: var(--space-2); margin-left: auto; flex-wrap: wrap; font-size: 0.78rem; color: var(--color-ink-3); }

      .post__layout { display: grid; grid-template-columns: minmax(0, 1fr) 15rem; gap: clamp(var(--space-5), 3vw, var(--space-7)); margin-top: clamp(var(--space-5), 3vw, var(--space-7)); align-items: start; }
      .post__body { min-width: 0; max-width: var(--measure); }
      .post__aside { position: sticky; top: 5.5rem; }

      /* -- Table of contents ---------------------------------------- */
      .toc { display: grid; gap: var(--space-2); padding: var(--space-4); background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
      .toc__heading { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.09em; color: var(--color-ink-3); }
      .toc__list { display: grid; gap: 1px; list-style: none; }
      .toc__item--h3 { padding-left: var(--space-3); }
      .toc__link {
        position: relative; display: block; padding: 4px var(--space-2) 4px var(--space-3);
        font-size: 0.8rem; line-height: 1.4; color: var(--color-ink-3); text-decoration: none;
        border-left: 2px solid transparent;
        transition: color 160ms ease, border-color 160ms ease, background-color 160ms ease;
      }
      .toc__link:hover { color: var(--color-ink); }
      .toc__link--on { color: var(--color-accent); border-left-color: var(--color-accent); background: var(--color-accent-soft); font-weight: 600; }
      .toc__back { display: inline-flex; align-items: center; gap: 5px; margin-top: var(--space-2); padding-top: var(--space-2); border-top: 1px solid var(--color-border); font-size: 0.78rem; color: var(--color-ink-3); text-decoration: none; }
      .toc__back:hover { color: var(--color-accent); }

      /* -- Prose (the MDX renderer) --------------------------------- */
      .prose { font-size: 1.06rem; }
      .prose > * + * { margin-top: 1.15em; }
      .prose__h { position: relative; scroll-margin-top: 5.5rem; }
      .prose__h--1 { font-size: clamp(1.5rem, 2.6vw, 1.9rem); margin-top: 2em; }
      .prose__h--2 { font-size: clamp(1.25rem, 2vw, 1.5rem); margin-top: 1.8em; }
      .prose__h--3 { font-size: 1.1rem; margin-top: 1.5em; }
      .prose__anchor {
        position: absolute; left: -1.1rem; top: 0.1em; display: grid; place-items: center;
        color: var(--color-ink-3); opacity: 0; text-decoration: none;
        transition: opacity 160ms ease, color 160ms ease;
      }
      .prose__h:hover .prose__anchor, .prose__anchor:focus-visible { opacity: 1; }
      .prose__anchor:hover { color: var(--color-accent); }

      .prose__p { color: var(--color-ink-2); }
      .prose strong { color: var(--color-ink); font-weight: 700; }
      .prose em { font-style: italic; }
      .prose a { color: var(--color-accent); text-decoration: underline; text-underline-offset: 2px; text-decoration-thickness: 1px; }
      .prose a:hover { text-decoration-thickness: 2px; }

      .prose__code-inline {
        padding: 0.12em 0.36em; font-size: 0.87em; color: var(--color-ink);
        background: var(--color-code-bg); border: 1px solid var(--color-border); border-radius: var(--radius-sm);
      }
      .prose__code { overflow: hidden; background: var(--color-code-bg); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: var(--shadow-1); }
      .prose__code pre { margin: 0; padding: var(--space-4); overflow-x: auto; }
      .prose__code code { font-size: 0.85rem; line-height: 1.65; color: var(--color-ink); white-space: pre; }
      .prose__code-lang {
        padding: 5px var(--space-4); font-size: 0.68rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-ink-3);
        border-bottom: 1px solid var(--color-border);
      }

      .prose__quote {
        padding: var(--space-4) var(--space-5); border-left: 3px solid var(--color-accent);
        background: var(--color-accent-soft); border-radius: 0 var(--radius-md) var(--radius-md) 0;
      }
      .prose__quote p { color: var(--color-ink); font-style: italic; }

      .prose__list { display: grid; gap: 0.5em; padding-left: 1.4em; color: var(--color-ink-2); }
      .prose__list--bullet { list-style: disc; }
      .prose__list--ordered { list-style: decimal; }
      .prose__list li::marker { color: var(--color-accent); font-weight: 700; }

      .prose__table-wrap { overflow-x: auto; border: 1px solid var(--color-border); border-radius: var(--radius-md); }
      .prose__table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
      .prose__table th, .prose__table td { padding: var(--space-2) var(--space-3); text-align: left; border-bottom: 1px solid var(--color-border); }
      .prose__table thead th { background: var(--color-surface-2); font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-ink-3); }
      .prose__table tbody tr:last-child td { border-bottom: 0; }
      .prose__table td:not(:first-child) { font-variant-numeric: tabular-nums; text-align: right; }
      .prose__table tbody tr:hover { background: var(--color-surface-2); }

      .post__footer { display: grid; gap: var(--space-4); margin-top: var(--space-6); padding-top: var(--space-5); border-top: 1px solid var(--color-border); }
      .post__share { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
      .post__share-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-ink-3); }
      .share-btn {
        display: inline-flex; align-items: center; gap: 5px; padding: 4px var(--space-3);
        font-size: 0.78rem; color: var(--color-ink-2); text-decoration: none;
        background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-pill);
        transition: color 160ms ease, border-color 160ms ease;
      }
      .share-btn:hover { color: var(--color-ink); border-color: var(--color-border-strong); }
      .post__author { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-4); background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
      .post__author strong { font-size: 0.9rem; }
      .post__author p { font-size: 0.8rem; color: var(--color-ink-3); }

      /* -- 404 ------------------------------------------------------ */
      .page--notfound { display: grid; place-items: center; min-height: 60vh; }
      .notfound { display: grid; justify-items: center; gap: var(--space-3); text-align: center; max-width: 40ch; }
      .notfound__code { font-family: var(--font-display); font-size: clamp(3.5rem, 10vw, 6rem); font-weight: 600; line-height: 1; color: var(--color-accent); }
      .notfound__title { font-size: clamp(1.4rem, 3vw, 2rem); }
      .notfound__body { color: var(--color-ink-2); }
      .notfound__actions { display: flex; gap: var(--space-3); flex-wrap: wrap; justify-content: center; margin-top: var(--space-2); }
      .notfound__hint { margin-top: var(--space-3); font-size: 0.76rem; color: var(--color-ink-3); }
      .notfound__hint code, .empty__body code, .list__foot code { padding: 0.1em 0.35em; font-size: 0.86em; background: var(--color-code-bg); border-radius: var(--radius-sm); }

      /* -- Empty ---------------------------------------------------- */
      .empty {
        display: grid; justify-items: center; gap: var(--space-3); padding: var(--space-7) var(--space-4); text-align: center;
        background: var(--color-surface); border: 1px dashed var(--color-border-strong); border-radius: var(--radius-lg);
        animation: rise-in 320ms ease backwards;
      }
      .empty__glyph { display: grid; place-items: center; width: 56px; height: 56px; color: var(--color-accent); background: var(--color-accent-soft); border-radius: 50%; }
      .empty__title { font-size: 1.1rem; }
      .empty__body { color: var(--color-ink-2); font-size: 0.9rem; }

      /* -- Footer --------------------------------------------------- */
      .site-footer { margin-top: var(--space-7); background: var(--color-surface-2); border-top: 1px solid var(--color-border); }
      .site-footer__inner { max-width: 1180px; margin: 0 auto; padding: clamp(var(--space-5), 4vw, var(--space-7)) clamp(var(--space-4), 4vw, var(--space-6)); }
      .site-footer__top { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 2fr); gap: clamp(var(--space-5), 4vw, var(--space-7)); }
      .site-footer__title { font-size: 1.3rem; }
      .site-footer__blurb { max-width: 42ch; margin-top: var(--space-2); font-size: 0.88rem; color: var(--color-ink-2); }

      .subscribe { display: grid; gap: var(--space-2); margin-top: var(--space-5); }
      .subscribe__label { font-size: 0.74rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-ink-3); }
      .subscribe__row { display: flex; gap: var(--space-2); flex-wrap: wrap; }
      .subscribe__input {
        flex: 1 1 12rem; min-height: var(--tap); padding: var(--space-2) var(--space-3);
        font: inherit; font-size: 0.88rem; color: var(--color-ink);
        background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-pill);
      }
      .subscribe__input:focus-visible { border-color: var(--color-accent); box-shadow: var(--ring); }
      .subscribe__note { font-size: 0.74rem; color: var(--color-ink-3); }

      .site-footer__nav { display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); gap: var(--space-5); }
      .footer-col ul { display: grid; gap: var(--space-2); list-style: none; }
      .footer-col__title { font-family: var(--font-body); font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.09em; color: var(--color-ink-3); margin-bottom: var(--space-3); }
      .footer-link { font-size: 0.86rem; color: var(--color-ink-2); text-decoration: none; transition: color 160ms ease; }
      .footer-link:hover { color: var(--color-accent); text-decoration: underline; }

      .site-footer__bottom { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap; margin-top: var(--space-6); padding-top: var(--space-4); border-top: 1px solid var(--color-border); }
      .site-footer__legal, .site-footer__count { font-size: 0.76rem; color: var(--color-ink-3); }
      .site-footer__social { display: flex; gap: var(--space-2); }
      .social { display: grid; place-items: center; width: 34px; height: 34px; color: var(--color-ink-2); border: 1px solid var(--color-border); border-radius: 50%; transition: color 160ms ease, border-color 160ms ease, transform 160ms ease; }
      .social:hover { color: var(--color-accent); border-color: var(--color-accent); transform: translateY(-2px); }

      /* -- Animations ----------------------------------------------- */
      @keyframes rise-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
      @keyframes fade-slide { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

      /* The two stacked hero cards drift apart very slightly, and only on hover. */
      @keyframes drift-back { from { transform: rotate(4deg) translateY(0); } to { transform: rotate(2deg) translateY(-6px); } }
      @keyframes sheen { from { transform: translateX(-120%); } to { transform: translateX(120%); } }

      /* The 404 code scales in once, so it does not sit and pulse forever. */
      @keyframes pop-in { 0% { opacity: 0; transform: scale(0.82); } 60% { transform: scale(1.04); } 100% { opacity: 1; transform: scale(1); } }

      /* A slow gradient shift on the closing CTA, so it reads as alive without looping hard. */
      @keyframes gradient-pan { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }

      .grid-cards > *:nth-child(2) { animation-delay: 70ms; }
      .grid-cards > *:nth-child(3) { animation-delay: 140ms; }
      .grid-cards > *:nth-child(4) { animation-delay: 210ms; }
      .post-card__initials { animation: fade-slide 620ms cubic-bezier(0.2, 0.8, 0.3, 1) backwards; }

      .hero__visual:hover .hero__card--back { animation: drift-back 700ms cubic-bezier(0.2, 0.8, 0.3, 1) forwards; }
      .notfound__code { animation: pop-in 520ms cubic-bezier(0.34, 1.4, 0.64, 1) backwards; }
      .cta { background-size: 200% 200%; animation: gradient-pan 14s ease-in-out infinite; }
      .post-card__tape { animation: sheen 5s ease-in-out infinite; }

      /* -- Responsive ----------------------------------------------- */
      @media (max-width: 1000px) {
        .post__layout { grid-template-columns: minmax(0, 1fr); }
        .post__aside { position: static; order: -1; }
        .toc { max-width: 34rem; }
      }

      @media (max-width: 900px) {
        .site-header__burger { display: grid; }
        .site-nav {
          position: absolute; top: 100%; left: 0; right: 0;
          flex-direction: column; align-items: stretch; gap: var(--space-3);
          margin: 0; padding: var(--space-4) clamp(var(--space-4), 4vw, var(--space-6)) var(--space-5);
          background: var(--color-surface); border-bottom: 1px solid var(--color-border); box-shadow: var(--shadow-2);
          transform: translateY(-6px); opacity: 0; visibility: hidden;
          transition: transform 220ms cubic-bezier(0.2, 0.8, 0.3, 1), opacity 200ms ease, visibility 0s linear 220ms;
        }
        .site-nav--open { transform: translateY(0); opacity: 1; visibility: visible; transition: transform 220ms cubic-bezier(0.2, 0.8, 0.3, 1), opacity 200ms ease; }
        .site-nav__list { flex-direction: column; align-items: stretch; gap: 2px; }
        .site-nav__link { padding: 9px var(--space-3); border-radius: var(--radius-sm); }
        .site-nav__link::after { display: none; }
        .site-nav__link:hover, .site-nav__link--on { background: var(--color-surface-2); }
        .site-search__input { width: 100%; }
        .site-search__input:focus { width: 100%; }

        .hero { grid-template-columns: minmax(0, 1fr); }
        .hero__visual { display: none; }
        .post-card--featured { grid-template-columns: minmax(0, 1fr); }
        .post-card--featured .post-card__gradient { min-height: 9rem; }
        .archive { grid-template-columns: minmax(0, 1fr); }
        .archive__tags { position: static; grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr)); }
        .site-footer__top { grid-template-columns: minmax(0, 1fr); }
      }

      @media (max-width: 700px) {
        .post__head { grid-template-columns: minmax(0, 1fr); }
        .post__cover { height: 10rem; }
        .post__facts { margin-left: 0; }
        .prose__anchor { display: none; }
      }

      /* -- Reduced motion ------------------------------------------- */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important; animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important; scroll-behavior: auto !important;
        }
        .post-card, .empty, .post-card__initials { animation: none; opacity: 1; }
        .cta, .post-card__tape { animation: none; }
        .hero__visual:hover .hero__card--back { animation: none; }
      }`,
    },
    {
      path: 'App.jsx',
      content: `      /**
       * The App Router tree.
       *
       * ============================================================================
       *  HOW THIS DIFFERS FROM A REAL NEXT.JS APP ROUTER
       * ============================================================================
       *
       * In a real project there is no file like this. \`app/layout.jsx\` wraps every
       * route because Next.js renders it as a persistent layout, and a page is
       * reachable purely because of where its file sits:
       *
       *   app/layout.jsx               -> wraps everything, renders <html> and <body>
       *   app/page.jsx                 -> /
       *   app/blog/page.jsx            -> /blog
       *   app/blog/[slug]/page.jsx     -> /blog/<anything>, with params.slug
       *   app/not-found.jsx            -> rendered by notFound() and by 404s
       *
       * Those pages are Server Components. They render on the server to HTML, the
       * framework pre-renders \`generateStaticParams\`, and navigation is intercepted
       * \`<Link>\` that swaps the server payload.
       *
       * A playground has no server, and the filesystem is a flat JSON payload, so the
       * three server-side mechanisms are reproduced client-side:
       *
       *   1. ROUTING. \`ROUTES\` below is the explicit table Next.js derives from the
       *      directory structure. \`matchRoute\` in \`lib/router.js\` matches the current
       *      path against it and captures the \`[slug]\` segment into \`params\`, giving
       *      the page component the identical prop shape it would receive on a server.
       *
       *   2. LAYOUT NESTING. \`RootLayout\` is rendered once, around whichever page
       *      matched - exactly what the framework does. The header and footer
       *      therefore survive navigation instead of remounting.
       *
       *   3. \`notFound()\`. A post page calls \`notFound()\` when its slug is unknown,
       *      which swaps in \`app/not-found.jsx\`. Unmatched paths do the same.
       *
       * Everything below \`RootLayout\` is ordinary React and would work unchanged in a
       * real App Router project.
       */

      import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

      import RootLayout from './app/layout.jsx';
      import HomePage from './app/page.jsx';
      import BlogIndexPage from './app/blog/page.jsx';
      import PostPage from './app/blog/[slug]/page.jsx';
      import NotFound from './app/not-found.jsx';

      import { matchRoute, useRouter } from './lib/router.js';
      import { postBySlug } from './lib/posts.js';

      /**
       * The route table, mirroring the \`app/\` directory structure.
       *
       * \`path\` uses the same \`[slug]\` syntax as the folder name so the correspondence
       * between this file and a real App Router project stays obvious.
       */
      const ROUTES = [
        { path: '/', Component: HomePage },
        { path: '/blog', Component: BlogIndexPage },
        { path: '/blog/[slug]', Component: PostPage },
      ];

      /** Splits \`?tag=nextjs&q=token\` into an object. */
      function readQuery(path) {
        const index = String(path || '').indexOf('?');
        if (index === -1) return { tag: null, q: '' };

        const params = new URLSearchParams(String(path).slice(index + 1));
        return { tag: params.get('tag') || null, q: params.get('q') || '' };
      }

      /**
       * Reading progress, as a percentage of the scrollable height.
       *
       * \`scrollHeight - innerHeight\` is the true scroll range, so this is correct even
       * on a short page that cannot scroll at all (where it is 0 rather than NaN).
       */
      function useReadingProgress() {
        const [progress, setProgress] = useState(0);

        useEffect(() => {
          const compute = () => {
            const range = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(range <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / range) * 100)));
          };

          compute();
          window.addEventListener('scroll', compute, { passive: true });
          window.addEventListener('resize', compute);
          return () => {
            window.removeEventListener('scroll', compute);
            window.removeEventListener('resize', compute);
          };
        }, []);

        return progress;
      }

      export default function App() {
        const { path, navigate } = useRouter();
        const progress = useReadingProgress();
        const scrollRef = useRef(null);

        const { tag, q } = readQuery(path);

        const navigateHandler = useCallback((to) => navigate(to), [navigate]);

        const page = useMemo(() => {
          const match = matchRoute(path, ROUTES);

          // No route matched: the App Router equivalent of a 404.
          if (!match) return { notFound: true };

          // \`notFound()\` inside the dynamic route, exactly as Next.js behaves.
          if (match.route.path === '/blog/[slug]' && !postBySlug(match.params.slug)) {
            return { notFound: true };
          }

          return { match, notFound: false };
        }, [path]);

        // Clear the sticky-header state when the route changes.
        useEffect(() => setProgress(0), [path]);

        const renderPage = () => {
          if (page.notFound) return <NotFound />;

          const { Component, route } = page.match;
          const params = { ...page.match.params };

          // The slug segment resolves to a real post object before it reaches the page,
          // so the page never has to deal with a missing record.
          if (route.path === '/blog/[slug]') params.post = postBySlug(params.slug);

          return <Component params={params} query={q} tag={tag} onNavigate={navigateHandler} />;
        };

        return (
          <RootLayout path={path} onNavigate={navigateHandler} progress={progress} scrollRef={scrollRef}>
            {renderPage()}
          </RootLayout>
        );
      }`,
    },
    {
      path: 'app/blog/[slug]/page.jsx',
      content: `      import { useRef } from 'react';
      import { Link } from '../../../lib/router.js';
      import MDXBlock from '../../../components/MDXBlock.jsx';
      import TableOfContents from '../../../components/TableOfContents.jsx';
      import PostCard from '../../../components/PostCard.jsx';
      import { authorOf, formatDate, relatedPosts } from '../../../lib/posts.js';
      import { wordCount as countWords } from '../../../lib/markdown.js';

      /**
       * \`app/blog/[slug]/page.jsx\` — the dynamic route.
       *
       * THE INTERESTING FILE. In a real Next.js App Router project:
       *
       *   - The square brackets in the folder name are how the framework knows this
       *     segment is dynamic. \`[slug]\` captures one path segment and exposes it as
       *     \`params.slug\`.
       *   - The component receives \`params\` as a prop, and \`generateStaticParams\`
       *     pre-renders every slug at build time.
       *   - Calling \`notFound()\` renders \`app/not-found.jsx\` and returns a 404 status.
       *   - It is a Server Component by default, so the whole page renders to HTML
       *     before any JavaScript runs.
       *
       * All four behaviours are reproduced here, driven by internal state rather than
       * by the filesystem:
       *
       *   - \`App.jsx\` holds a route table and matches the current path against it. The
       *     \`[slug]\` entry is matched by hand in \`lib/router.js\`, and the captured
       *     segment is passed down as \`params\` - the identical prop shape.
       *   - \`generateStaticParams\` is exported so the shape is visible, and \`App.jsx\`
       *     calls it to seed the slug list.
       *   - \`notFound()\` sets a flag in the store, which renders the not-found page.
       *   - This component is a Client Component, because scroll-spy and reading
       *     progress need the DOM. In a real project the article body would be a
       *     Server Component with the table of contents rendered separately.
       */
      export function generateStaticParams() {
        // A real implementation would return every slug from the CMS:
        //   return posts.map((post) => ({ slug: post.slug }))
        return [
          { slug: 'streaming-responses-without-sacrificing-seo' },
          { slug: 'design-tokens-that-survive-a-redesign' },
          { slug: 'cutting-our-build-from-nine-minutes-to-ninety-seconds' },
          { slug: 'the-case-for-boring-database-queries' },
          { slug: 'accessible-modals-without-a-library' },
          { slug: 'why-we-stopped-writing-our-own-auth' },
        ];
      }

      const Share = ({ label, path }) => (
        <a className="share-btn" href={'https://github.com/northgate/fieldnotes' + path} rel="noopener noreferrer">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d="M7 17 17 7M8 7h9v9" />
          </svg>
          {label}
        </a>
      );

      export default function PostPage({ params, onNavigate }) {
        const bodyRef = useRef(null);

        const post = params.post;
        const author = authorOf(post.author);
        const related = relatedPosts(post.slug);
        const words = countWords(post.body);

        return (
          <article className="post">
            {/* -- Breadcrumb --------------------------------------- */}
            <nav className="crumbs" aria-label="Breadcrumb">
              <ol>
                <li>
                  <Link to="/" className="crumbs__link">Fieldnotes</Link>
                </li>
                <li>
                  <Link to="/blog" className="crumbs__link">All posts</Link>
                </li>
                <li aria-current="page" className="crumbs__current">{post.tags[0]}</li>
              </ol>
            </nav>

            {/* -- Header ------------------------------------------- */}
            <header className="post__head">
              <div className={'post__cover post__cover--' + post.cover} aria-hidden="true">
                <span className="post__cover-initials">{author.initials}</span>
              </div>

              <div className="post__headings">
                <div className="post__tags">
                  {post.tags.map((tag) => (
                    <Link key={tag} to={'/blog?tag=' + tag} className="tag-pill">
                      {tag}
                    </Link>
                  ))}
                </div>

                <h1 className="post__title">{post.title}</h1>
                <p className="post__excerpt">{post.excerpt}</p>

                <div className="post__byline">
                  <span className="avatar avatar--lg" aria-hidden="true">{author.initials}</span>
                  <span className="post__byline-text">
                    <strong>{author.name}</strong>
                    <small>{author.role}</small>
                  </span>
                  <span className="post__facts">
                    <time dateTime={post.date} title={formatDate(post.date)}>
                      {formatDate(post.date)}
                    </time>
                    <span aria-hidden="true">&middot;</span>
                    <span>{post.readingTime} min read</span>
                    <span aria-hidden="true">&middot;</span>
                    <span>{words.toLocaleString('en-GB')} words</span>
                  </span>
                </div>
              </div>
            </header>

            {/* -- Body, with a sticky table of contents alongside --- */}
            <div className="post__layout">
              <div className="post__body">
                <MDXBlock source={post.body} ref={bodyRef} />

                <footer className="post__footer">
                  <div className="post__share">
                    <span className="post__share-label">Share</span>
                    <Share label="Copy link" path="" />
                    <Share label="Discuss" path="/issues" />
                  </div>

                  <div className="post__author">
                    <span className="avatar avatar--lg" aria-hidden="true">{author.initials}</span>
                    <div>
                      <strong>{author.name}</strong>
                      <p>
                        {author.role} at Northgate Systems. Writes about {post.tags.slice(0, 2).join(' and ')}.
                      </p>
                    </div>
                  </div>
                </footer>
              </div>

              <aside className="post__aside">
                <TableOfContents body={post.body} containerRef={bodyRef} />
              </aside>
            </div>

            {/* -- Related ------------------------------------------- */}
            {related.length ? (
              <section className="section" aria-labelledby="related-heading">
                <div className="section__head">
                  <h2 className="section__title" id="related-heading">
                    Related reading
                  </h2>
                </div>

                <div className="grid-cards">
                  {related.map((entry) => (
                    <PostCard key={entry.slug} post={entry} onNavigate={onNavigate} />
                  ))}
                </div>
              </section>
            ) : null}
          </article>
        );
      }`,
    },
    {
      path: 'app/blog/page.jsx',
      content: `      import { useMemo } from 'react';
      import { Link } from '../../lib/router.js';
      import PostCard from '../../components/PostCard.jsx';
      import { SORTED_POSTS, TAGS } from '../../lib/posts.js';

      /**
       * \`app/blog/page.jsx\` — the \`/blog\` route.
       *
       * In a real App Router project, \`searchParams\` would arrive as a prop from the
       * framework, and filtering would happen on the server. Here the query string is
       * read from \`path\` and filtered in the browser - the component contract is the
       * same, only the boundary moved.
       */
      export default function BlogIndexPage({ query, tag, onNavigate }) {
        const results = useMemo(() => {
          const needle = query.trim().toLowerCase();
          return SORTED_POSTS.filter((post) => {
            if (tag && tag !== 'all' && !post.tags.includes(tag)) return false;
            if (!needle) return true;
            const haystack = (post.title + ' ' + post.excerpt + ' ' + post.tags.join(' ') + ' ' + post.body)
              .toLowerCase();
            return haystack.includes(needle);
          });
        }, [query, tag]);

        const filtered = Boolean(query.trim()) || (tag && tag !== 'all');

        const clearAll = () => onNavigate('/blog');

        return (
          <div className="page">
            <header className="page__head">
              <p className="page__eyebrow">Archive</p>
              <h1 className="page__title">All posts</h1>
              <p className="page__lede">
                {SORTED_POSTS.length} write-ups on performance, design systems, infrastructure and the
                occasional post-mortem. Filter by topic, or search the full text.
              </p>
            </header>

            <div className="archive">
              {/* -- Topic filter ------------------------------------ */}
              <aside className="archive__rail" aria-label="Filter by topic">
                <h2 className="archive__rail-title">Topics</h2>

                <ul className="archive__tags">
                  <li>
                    <button
                      type="button"
                      className={'archive__tag' + (!tag || tag === 'all' ? ' archive__tag--on' : '')}
                      aria-pressed={!tag || tag === 'all'}
                      onClick={() => onNavigate(query ? '/blog?q=' + encodeURIComponent(query) : '/blog')}
                    >
                      All topics
                      <span className="archive__tag-count">{SORTED_POSTS.length}</span>
                    </button>
                  </li>
                  {TAGS.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        className={'archive__tag' + (tag === entry.id ? ' archive__tag--on' : '')}
                        aria-pressed={tag === entry.id}
                        onClick={() =>
                          onNavigate(
                            '/blog?tag=' + entry.id + (query ? '&q=' + encodeURIComponent(query) : ''),
                          )
                        }
                      >
                        {entry.id}
                        <span className="archive__tag-count">{entry.count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </aside>

              {/* -- Results ----------------------------------------- */}
              <section className="archive__results" aria-labelledby="results-heading">
                <div className="archive__toolbar">
                  <h2 className="archive__count" id="results-heading">
                    {results.length} post{results.length === 1 ? '' : 's'}
                    {tag && tag !== 'all' ? <span className="archive__count-tag"> tagged {tag}</span> : null}
                    {query.trim() ? <span className="archive__count-tag"> matching &ldquo;{query}&rdquo;</span> : null}
                  </h2>

                  {filtered ? (
                    <button type="button" className="link-button" onClick={clearAll}>
                      Clear filters
                    </button>
                  ) : null}
                </div>

                {results.length === 0 ? (
                  <div className="empty" role="status">
                    <span className="empty__glyph" aria-hidden="true">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" focusable="false">
                        <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3" />
                      </svg>
                    </span>
                    <h3 className="empty__title">Nothing matches</h3>
                    <p className="empty__body">
                      No post matches {tag && tag !== 'all' ? <code>{tag}</code> : null}
                      {tag && tag !== 'all' && query.trim() ? ' and ' : null}
                      {query.trim() ? <code>{query}</code> : null}. Try a broader term.
                    </p>
                    <button type="button" className="button button--quiet" onClick={clearAll}>
                      Reset the archive
                    </button>
                  </div>
                ) : (
                  <div className="grid-cards grid-cards--archive">
                    {results.map((post) => (
                      <PostCard key={post.slug} post={post} onNavigate={onNavigate} />
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="subscribe-note">
              <h2 className="subscribe-note__title">Prefer email?</h2>
              <p className="subscribe-note__body">
                The archive grows by about two posts a month. Subscribers get each one the morning it
                goes up.
              </p>
              <Link to="/" onNavigate={onNavigate} className="link-button">
                Back to the front page
              </Link>
            </aside>
          </div>
        );
      }`,
    },
    {
      path: 'app/layout.jsx',
      content: `      import SiteHeader from '../components/SiteHeader.jsx';
      import SiteFooter from '../components/SiteFooter.jsx';

      /**
       * \`app/layout.jsx\` — the root layout.
       *
       * In a real Next.js App Router project this file is a Server Component. It wraps
       * every route, it must render \`<html>\` and \`<body>\`, and it is the right place
       * for shared chrome and global metadata. Exactly the same nesting happens here:
       * \`App.jsx\` renders this once, around whichever page the router matched, so the
       * header and footer persist across navigations just as they would.
       *
       * The one difference is the document element. In a real app React renders into
       * \`<body>\` on the server and Next.js owns \`<html>\` and \`<head>\`. The playground
       * already provides a \`<body>\` and owns \`<head>\`, so this layout renders a
       * \`<div>\` with the equivalent role and applies the body-level styling through a
       * class. The structure and the intent are identical.
       *
       * \`metadata\` would normally be exported from here for \`generateMetadata\`. This
       * template reads the document title itself because there is no server to do it.
       */
      export const metadata = {
        title: 'Fieldnotes',
        description: 'Engineering, in detail.',
      };

      export default function RootLayout({ children, path, onNavigate, progress }) {
        return (
          <div className="shell">
            {/*
              Reading progress. A fixed element whose width is driven by
              \`stroke-dashoffset\` on an SVG rect, so the fill needs no inline style.
            */}
            <div className="progress" role="presentation" aria-hidden="true">
              <svg className="progress__svg" viewBox="0 0 100 4" preserveAspectRatio="none" focusable="false">
                <rect className="progress__track" x="0" y="0" width="100" height="4" />
                <rect
                  className="progress__value"
                  x="0"
                  y="0"
                  width="100"
                  height="4"
                  pathLength="100"
                  strokeDasharray="100"
                  strokeDashoffset={String(100 - progress)}
                />
              </svg>
            </div>

            <SiteHeader path={path} onNavigate={onNavigate} />

            {/* \`children\` is the matched page - the equivalent of Next.js's children prop. */}
            <main className="shell__main" id="main">
              {children}
            </main>

            <SiteFooter onNavigate={onNavigate} />
          </div>
        );
      }`,
    },
    {
      path: 'app/not-found.jsx',
      content: `      import { Link } from '../../lib/router.js';

      /**
       * \`app/not-found.jsx\` — the App Router's 404 boundary.
       *
       * In a real project this renders whenever a page calls \`notFound()\`, which is
       * what \`app/blog/[slug]/page.jsx\` does when \`params.slug\` matches nothing. It is
       * also what the framework serves for any unmatched URL automatically.
       *
       * Here \`App.jsx\` renders it directly for both cases: an unknown path, and a known
       * dynamic route whose slug is not in the dataset.
       */
      export default function NotFound() {
        return (
          <div className="page page--notfound">
            <div className="notfound">
              <p className="notfound__code">404</p>
              <h1 className="notfound__title">That page is not here</h1>
              <p className="notfound__body">
                The post you asked for does not exist, or the slug has changed. It happens - six posts
                is not a large archive.
              </p>

              <div className="notfound__actions">
                <Link to="/blog" className="button button--primary">
                  Browse the archive
                </Link>
                <Link to="/" className="button button--quiet">
                  Back to the front page
                </Link>
              </div>

              <p className="notfound__hint">
                <code>app/not-found.jsx</code> renders whenever a route calls <code>notFound()</code>.
              </p>
            </div>
          </div>
        );
      }`,
    },
    {
      path: 'app/page.jsx',
      content: `      import { Link } from '../lib/router.js';
      import PostCard from '../components/PostCard.jsx';
      import { SORTED_POSTS, TAGS, authorOf } from '../lib/posts.js';

      /**
       * \`app/page.jsx\` — the \`/\` route.
       *
       * A real Next.js App Router route. There is no exported \`path\`, because the
       * router never looks for one: the filesystem position *is* the route. Everything
       * below is ordinary React.
       */

      const Arrow = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M5 12h14m-7-7 7 7-7 7" />
        </svg>
      );

      const Proof = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

      export default function HomePage({ onNavigate }) {
        const [lead, ...rest] = SORTED_POSTS;
        const contributors = Array.from(new Set(SORTED_POSTS.map((post) => post.author))).map(authorOf);

        return (
          <>
            {/* -- Hero ----------------------------------------------- */}
            <section className="hero" aria-labelledby="hero-heading">
              <div className="hero__copy">
                <p className="hero__eyebrow">Northgate Systems engineering</p>
                <h1 className="hero__title" id="hero-heading">
                  Notes from the parts of the job that do not fit in a changelog
                </h1>
                <p className="hero__sub">
                  Six long-form write-ups on performance work, design systems and infrastructure -
                  including the mistakes, because those are the parts worth remembering.
                </p>

                <div className="hero__actions">
                  <Link to="/blog" onNavigate={onNavigate} className="button button--primary">
                    Read the latest
                    <Arrow />
                  </Link>
                  <Link to={'/blog/' + lead.slug} onNavigate={onNavigate} className="button button--quiet">
                    Start with &ldquo;{lead.title}&rdquo;
                  </Link>
                </div>

                <dl className="hero__proof">
                  <div>
                    <dt>Subscribers</dt>
                    <dd>4,180</dd>
                  </div>
                  <div>
                    <dt>Average read</dt>
                    <dd>8.4 min</dd>
                  </div>
                  <div>
                    <dt>Published</dt>
                    <dd>{SORTED_POSTS.length} posts</dd>
                  </div>
                </dl>
              </div>

              <div className="hero__visual" aria-hidden="true">
                <div className="hero__card hero__card--back" />
                <div className="hero__card hero__card--front">
                  <span className="hero__card-line" />
                  <span className="hero__card-line hero__card-line--short" />
                  <span className="hero__card-bar" />
                </div>
              </div>
            </section>

            {/* -- Featured post ------------------------------------- */}
            <section className="section" aria-labelledby="featured-heading">
              <div className="section__head">
                <h2 className="section__title" id="featured-heading">
                  Most read
                </h2>
                <Link to="/blog" onNavigate={onNavigate} className="section__link">
                  Every post
                  <Arrow />
                </Link>
              </div>

              <PostCard post={lead} onNavigate={onNavigate} featured />
            </section>

            {/* -- Recent posts -------------------------------------- */}
            <section className="section" aria-labelledby="recent-heading">
              <div className="section__head">
                <h2 className="section__title" id="recent-heading">
                  Recent writing
                </h2>
              </div>

              <div className="grid-cards">
                {rest.slice(0, 3).map((post) => (
                  <PostCard key={post.slug} post={post} onNavigate={onNavigate} />
                ))}
              </div>
            </section>

            {/* -- Topics -------------------------------------------- */}
            <section className="section" aria-labelledby="topics-heading">
              <div className="section__head">
                <h2 className="section__title" id="topics-heading">
                  What we write about
                </h2>
                <p className="section__note">Counted from the published posts.</p>
              </div>

              <ul className="topics">
                {TAGS.map((tag) => (
                  <li key={tag.id}>
                    <Link to={'/blog?tag=' + tag.id} onNavigate={onNavigate} className="topic">
                      <span className="topic__label">{tag.id}</span>
                      <span className="topic__count">{tag.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* -- Contributors -------------------------------------- */}
            <section className="section" aria-labelledby="contributors-heading">
              <div className="section__head">
                <h2 className="section__title" id="contributors-heading">
                  Who writes here
                </h2>
              </div>

              <ul className="contributors">
                {contributors.map((person) => (
                  <li key={person.name} className="contributor">
                    <span className="avatar avatar--lg" aria-hidden="true">{person.initials}</span>
                    <span className="contributor__text">
                      <strong>{person.name}</strong>
                      <small>{person.role}</small>
                    </span>
                    <Proof />
                  </li>
                ))}
              </ul>
            </section>

            {/* -- Closing CTA --------------------------------------- */}
            <section className="cta" aria-labelledby="cta-heading">
              <div className="cta__copy">
                <h2 className="cta__title" id="cta-heading">
                  One post a month, no newsletter theatre
                </h2>
                <p className="cta__body">
                  Every post is a real problem we hit and what we actually changed. If a post does not
                  help you decide something, we do not send it.
                </p>
                <Link to="/blog" onNavigate={onNavigate} className="button button--primary">
                  Browse the archive
                  <Arrow />
                </Link>
              </div>
            </section>
          </>
        );
      }`,
    },
    {
      path: 'components/MDXBlock.jsx',
      content: `      import { Fragment, forwardRef, useMemo } from 'react';
      import { parseMarkdown, INLINE_RULES } from '../lib/markdown.js';

      /**
       * Renders parsed markdown as React elements.
       *
       * The deliberate absence of \`dangerouslySetInnerHTML\` is the whole point. Inline
       * formatting is compiled into an array of React nodes, so a post containing
       * \`<script>alert(1)</script>\` renders as visible text instead of executing.
       *
       * The inline pass reuses the same rule order as \`lib/markdown.js\`, which is what
       * keeps \`\` **\`code\`** \`\` and \`[a *b* c](href)\` behaving predictably. React's own
       * escaping then handles every text fragment for us.
       */

      const INLINE_PATTERN = new RegExp(INLINE_RULES.map((rule) => rule.pattern.source).join('|'), 'g');

      const isSafeHref = (href) => /^(https?:|mailto:|#|\\/)/i.test(href);

      /**
       * Splits one line of markdown into React nodes.
       *
       * Returns an array because a single line can produce several nodes: \`a *b* c\`
       * becomes ['a ', <em>b</em>, ' c'].
       */
      function renderInline(text, keyPrefix) {
        const source = String(text);
        const nodes = [];
        let lastIndex = 0;
        let match;
        let key = 0;

        // \`pattern\` from each rule carries its own capture-group layout, so the branch
        // below identifies which rule matched rather than assuming group positions.
        INLINE_PATTERN.lastIndex = 0;

        while ((match = INLINE_PATTERN.exec(source)) !== null) {
          if (match.index > lastIndex) {
            nodes.push(source.slice(lastIndex, match.index));
          }

          const token = match[0];
          const nodeKey = keyPrefix + '-' + key++;

          if (token.charAt(0) === '\`') {
            nodes.push(
              <code key={nodeKey} className="prose__code-inline">
                {token.slice(1, -1)}
              </code>,
            );
          } else if (token.slice(0, 2) === '**') {
            nodes.push(<strong key={nodeKey}>{token.slice(2, -2)}</strong>);
          } else if (token.charAt(0) === '*') {
            nodes.push(<em key={nodeKey}>{token.slice(1, -1)}</em>);
          } else if (token.charAt(0) === '[') {
            const split = token.indexOf('](');
            const label = token.slice(1, split);
            const href = token.slice(split + 2, -1);

            nodes.push(
              isSafeHref(href) ? (
                <a key={nodeKey} href={href} rel="noopener noreferrer">
                  {label}
                </a>
              ) : (
                // An unsafe scheme degrades to plain text rather than becoming a link.
                <span key={nodeKey}>{label}</span>
              ),
            );
          } else {
            nodes.push(token);
          }

          lastIndex = match.index + token.length;
        }

        if (lastIndex < source.length) nodes.push(source.slice(lastIndex));
        return nodes;
      }

      const AnchorGlyph = () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
          strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d="M9 15 15 9M10.5 6.5 13 4a3.5 3.5 0 0 1 5 5l-2.5 2.5M13.5 17.5 11 20a3.5 3.5 0 0 1-5-5l2.5-2.5" />
        </svg>
      );

      /**
       * \`forwardRef\` is required because the table of contents scroll-spy observes the
       * rendered heading elements, which means the parent needs the real DOM nodes.
       */
      const MDXBlock = forwardRef(function MDXBlock({ source }, ref) {
        const blocks = useMemo(() => parseMarkdown(source), [source]);

        return (
          <div className="prose" ref={ref}>
            {blocks.map((block, index) => {
              const key = block.kind + '-' + index;
              const level = block.level;

              switch (block.kind) {
                case 'heading': {
                  const Tag = 'h' + level;
                  return (
                    <Tag key={key} id={block.id} className={'prose__h prose__h--' + level} data-heading={block.id}>
                      <a className="prose__anchor" href={'#' + block.id}>
                        <AnchorGlyph />
                        <span className="sr-only">Link to this section: {block.text}</span>
                      </a>
                      {renderInline(block.text, key)}
                    </Tag>
                  );
                }

                case 'paragraph':
                  return (
                    <p key={key} className="prose__p">
                      {renderInline(block.text, key)}
                    </p>
                  );

                case 'quote':
                  return (
                    <blockquote key={key} className="prose__quote">
                      <p>{renderInline(block.text, key)}</p>
                    </blockquote>
                  );

                case 'code':
                  return (
                    <figure key={key} className="prose__code">
                      <figcaption className="prose__code-lang">{block.language}</figcaption>
                      <pre>
                        <code>{block.code}</code>
                      </pre>
                    </figure>
                  );

                case 'list': {
                  const ListTag = block.ordered ? 'ol' : 'ul';
                  return (
                    <ListTag
                      key={key}
                      className={'prose__list prose__list--' + (block.ordered ? 'ordered' : 'bullet')}
                    >
                      {block.items.map((item, itemIndex) => (
                        <li key={key + '-li-' + itemIndex}>{renderInline(item, key + '-li-' + itemIndex)}</li>
                      ))}
                    </ListTag>
                  );
                }

                case 'table':
                  return (
                    <div key={key} className="prose__table-wrap">
                      <table className="prose__table">
                        <caption className="sr-only">Data table from the post</caption>
                        <thead>
                          <tr>
                            {block.header.map((cell, cellIndex) => (
                              <th key={'th-' + cellIndex} scope="col">
                                {renderInline(cell, key + '-th-' + cellIndex)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {block.rows.map((row, rowIndex) => (
                            <tr key={'tr-' + rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <td key={'td-' + cellIndex}>{renderInline(cell, key + '-' + rowIndex + '-' + cellIndex)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );

                default:
                  return null;
              }
            })}
          </div>
        );
      });

      export default MDXBlock;`,
    },
    {
      path: 'components/PostCard.jsx',
      content: `      import { Link } from '../lib/router.js';
      import { authorOf, formatDate, timeSince } from '../lib/posts.js';

      /**
       * \`components/PostCard.jsx\`
       *
       * The card used by both the home page and the archive. It takes the post, the
       * navigate function and an optional \`featured\` flag, which is why the home page
       * can pull one out of the archive list without duplicating the markup.
       *
       * The cover is a gradient rather than an image: there are no binary assets in
       * this template, and a gradient keyed off the post's \`cover\` field gives every
       * card a distinct first impression at zero cost.
       */
      export default function PostCard({ post, onNavigate, featured }) {
        const author = authorOf(post.author);

        return (
          <article className={'post-card' + (featured ? ' post-card--featured' : '')}>
            <div className={'post-card__gradient post-card__gradient--' + post.cover} aria-hidden="true">
              <span className="post-card__initials">{author.initials}</span>
              <span className="post-card__tape" />
            </div>

            <div className="post-card__body">
              <div className="post-card__tags">
                {post.tags.slice(0, 3).map((tag) => (
                  <Link key={tag} to={'/blog?tag=' + tag} onNavigate={onNavigate} className="tag-pill">
                    {tag}
                  </Link>
                ))}
              </div>

              <h3 className="post-card__heading">
                <Link to={'/blog/' + post.slug} onNavigate={onNavigate}>
                  {post.title}
                </Link>
              </h3>

              <p className="post-card__excerpt">{post.excerpt}</p>

              <footer className="post-card__meta">
                <span className="avatar" aria-hidden="true">{author.initials}</span>
                <span className="post-card__byline">
                  {author.name}
                  <time className="post-card__date" dateTime={post.date} title={formatDate(post.date)}>
                    {timeSince(post.date)}
                  </time>
                </span>
                <span className="post-card__read">{post.readingTime} min read</span>
              </footer>
            </div>
          </article>
        );
      }`,
    },
    {
      path: 'components/SiteFooter.jsx',
      content: `      import { Link } from '../lib/router.js';
      import { SORTED_POSTS } from '../lib/posts.js';

      const columns = [
        {
          title: 'Writing',
          links: [
            { label: 'All posts', to: '/blog' },
            { label: 'Performance', to: '/blog?tag=performance' },
            { label: 'Accessibility', to: '/blog?tag=accessibility' },
            { label: 'Design systems', to: '/blog?tag=design-systems' },
          ],
        },
        {
          title: 'Engineering',
          links: [
            { label: 'Next.js', to: '/blog?tag=nextjs' },
            { label: 'Postgres', to: '/blog?tag=postgres' },
            { label: 'CI and CD', to: '/blog?tag=ci' },
            { label: 'Infrastructure', to: '/blog?tag=infrastructure' },
          ],
        },
        {
          title: 'Practice',
          links: [
            { label: 'Post-mortems', to: '/blog?tag=postmortem' },
            { label: 'Security', to: '/blog?tag=security' },
            { label: 'CSS', to: '/blog?tag=css' },
            { label: 'JavaScript', to: '/blog?tag=javascript' },
          ],
        },
      ];

      const Social = ({ name, path }) => (
        <a className="social" href={'https://github.com/' + path} rel="noopener noreferrer" aria-label={'Fieldnotes on ' + name}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
          </svg>
        </a>
      );

      /** Site footer: four link columns, a newsletter form and a legal row. */
      export default function SiteFooter({ onNavigate }) {
        return (
          <footer className="site-footer">
            <div className="site-footer__inner">
              <div className="site-footer__top">
                <div className="site-footer__brand">
                  <h2 className="site-footer__title">Fieldnotes</h2>
                  <p className="site-footer__blurb">
                    Six posts on the parts of building software that do not fit in a changelog. Published
                    when there is something worth saying, roughly twice a month.
                  </p>

                  <form className="subscribe" onSubmit={(event) => event.preventDefault()}>
                    <label className="subscribe__label" htmlFor="subscribe-email">
                      Get the next one by email
                    </label>
                    <div className="subscribe__row">
                      <input
                        id="subscribe-email"
                        className="subscribe__input"
                        type="email"
                        required
                        placeholder="you@company.com"
                        autoComplete="email"
                      />
                      <button type="submit" className="button button--primary">
                        Subscribe
                      </button>
                    </div>
                    <p className="subscribe__note">No tracking pixels. Unsubscribe in one click.</p>
                  </form>
                </div>

                <nav className="site-footer__nav" aria-label="Footer">
                  {columns.map((column) => (
                    <div className="footer-col" key={column.title}>
                      <h3 className="footer-col__title">{column.title}</h3>
                      <ul>
                        {column.links.map((link) => (
                          <li key={link.label}>
                            <Link to={link.to} onNavigate={onNavigate} className="footer-link">
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </nav>
              </div>

              <div className="site-footer__bottom">
                <p className="site-footer__legal">
                  2026 Northgate Systems Ltd. Registered in England, 11840277. All rights reserved.
                </p>
                <div className="site-footer__social">
                  <Social name="Mastodon" path="northgate" />
                  <Social name="GitHub" path="northgate" />
                  <Social name="LinkedIn" path="company/northgate" />
                </div>
                <p className="site-footer__count">{SORTED_POSTS.length} posts and counting.</p>
              </div>
            </div>
          </footer>
        );
      }

`,
    },
    {
      path: 'components/SiteHeader.jsx',
      content: `      import { useEffect, useState } from 'react';
      import { Link } from '../lib/router.js';
      import { TAGS } from '../lib/posts.js';

      const Mark = () => (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
          strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11l6.5 9-6.5 9H6.5A2.5 2.5 0 0 1 4 18.5v-13Z" />
          <path d="M11 3v18M20 12h-3.5" />
        </svg>
      );

      const SearchGlyph = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3" />
        </svg>
      );

      const MenuGlyph = ({ open }) => (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
          strokeLinecap="round" aria-hidden="true" focusable="false">
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      );

      /**
       * Site header.
       *
       * Sticky, with a shadow that appears once the page has scrolled - the shadow is a
       * state change rather than a scroll listener driving inline styles, so it costs
       * one boolean and no layout thrash.
       */
      export default function SiteHeader({ path, onNavigate }) {
        const [stuck, setStuck] = useState(false);
        const [menuOpen, setMenuOpen] = useState(false);
        const [term, setTerm] = useState('');

        useEffect(() => {
          const onScroll = () => setStuck(window.scrollY > 8);
          onScroll();
          window.addEventListener('scroll', onScroll, { passive: true });
          return () => window.removeEventListener('scroll', onScroll);
        }, []);

        // Any navigation closes the mobile menu.
        useEffect(() => setMenuOpen(false), [path]);

        // Escape closes it too.
        useEffect(() => {
          if (!menuOpen) return undefined;
          const onKeyDown = (event) => {
            if (event.key === 'Escape') setMenuOpen(false);
          };
          document.addEventListener('keydown', onKeyDown);
          return () => document.removeEventListener('keydown', onKeyDown);
        }, [menuOpen]);

        const submitSearch = (event) => {
          event.preventDefault();
          const q = term.trim();
          onNavigate(q ? '/blog?q=' + encodeURIComponent(q) : '/blog');
          setMenuOpen(false);
        };

        const links = [
          { to: '/', label: 'Home' },
          { to: '/blog', label: 'All posts' },
        ];

        const isCurrent = (to) => (to === '/' ? path === '/' : path.indexOf(to) === 0);

        return (
          <header className={'site-header' + (stuck ? ' site-header--stuck' : '')}>
            <div className="site-header__inner">
              <Link to="/" onNavigate={onNavigate} className="brand" aria-label="Fieldnotes, home">
                <span className="brand__mark" aria-hidden="true">
                  <Mark />
                </span>
                <span className="brand__text">
                  <strong>Fieldnotes</strong>
                  <small>Engineering, in detail</small>
                </span>
              </Link>

              <nav className={'site-nav' + (menuOpen ? ' site-nav--open' : '')} aria-label="Primary">
                <ul className="site-nav__list">
                  {links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        onNavigate={onNavigate}
                        className={'site-nav__link' + (isCurrent(link.to) ? ' site-nav__link--on' : '')}
                        aria-current={isCurrent(link.to) ? 'page' : undefined}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  {TAGS.slice(0, 3).map((tag) => (
                    <li key={tag.id} className="site-nav__tagitem">
                      <Link
                        to={'/blog?tag=' + tag.id}
                        onNavigate={onNavigate}
                        className={'site-nav__tag' + (path.indexOf('tag=' + tag.id) !== -1 ? ' site-nav__tag--on' : '')}
                      >
                        {tag.id}
                      </Link>
                    </li>
                  ))}
                </ul>

                <form className="site-search" onSubmit={submitSearch} role="search">
                  <label className="sr-only" htmlFor="site-search">
                    Search posts
                  </label>
                  <span className="site-search__icon" aria-hidden="true">
                    <SearchGlyph />
                  </span>
                  <input
                    id="site-search"
                    className="site-search__input"
                    type="search"
                    value={term}
                    placeholder="Search"
                    autoComplete="off"
                    onChange={(event) => setTerm(event.target.value)}
                  />
                </form>

                <Link to="/blog" onNavigate={onNavigate} className="button button--primary site-header__cta">
                  Subscribe
                </Link>
              </nav>

              <button
                type="button"
                className="site-header__burger"
                aria-expanded={menuOpen}
                aria-controls="site-nav"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMenuOpen((value) => !value)}
              >
                <MenuGlyph open={menuOpen} />
              </button>
            </div>
          </header>
        );
      }`,
    },
    {
      path: 'components/TableOfContents.jsx',
      content: `      import { useCallback, useEffect, useState } from 'react';
      import { Link } from '../lib/router.js';
      import { extractHeadings } from '../lib/markdown.js';

      /**
       * Table of contents with scroll-spy.
       *
       * The spy is a single scroll listener reading heading offsets, rather than an
       * \`IntersectionObserver\`. For a long article the observer's "which section am I
       * in" answer is fiddly at the boundaries, whereas "what is the last heading whose
       * top has passed 140px" is exact and cheap.
       *
       * Clicking an entry scrolls smoothly and suppresses the spy for a moment, so the
       * highlight does not race the animation.
       */
      export default function TableOfContents({ body, containerRef }) {
        const headings = extractHeadings(body);
        const [active, setActive] = useState(headings.length ? headings[0].id : '');
        const [locked, setLocked] = useState(false);

        const recompute = useCallback(() => {
          if (locked || headings.length === 0) return;

          const scrollY = window.scrollY;
          let current = headings[0].id;

          for (const heading of headings) {
            const node = containerRef.current ? containerRef.current.querySelector('#' + heading.id) : null;
            if (!node) continue;
            if (node.getBoundingClientRect().top + scrollY - 150 <= scrollY) current = heading.id;
          }

          setActive(current);
        }, [headings, locked, containerRef]);

        useEffect(() => {
          recompute();
          window.addEventListener('scroll', recompute, { passive: true });
          window.addEventListener('resize', recompute);
          return () => {
            window.removeEventListener('scroll', recompute);
            window.removeEventListener('resize', recompute);
          };
        }, [recompute]);

        if (headings.length === 0) return null;

        const jump = (id) => {
          const node = containerRef.current ? containerRef.current.querySelector('#' + id) : null;
          if (!node) return;

          // Hold the spy still while the smooth scroll is running.
          setLocked(true);
          window.setTimeout(() => setLocked(false), 620);

          const top = node.getBoundingClientRect().top + window.scrollY - 96;
          window.scrollTo({ top, behavior: 'smooth' });
          setActive(id);
        };

        return (
          <nav className="toc" aria-labelledby="toc-heading">
            <p className="toc__heading" id="toc-heading">
              On this page
            </p>

            <ol className="toc__list">
              {headings.map((heading) => (
                <li key={heading.id} className={'toc__item toc__item--h' + heading.level}>
                  <a
                    href={'#' + heading.id}
                    className={'toc__link' + (active === heading.id ? ' toc__link--on' : '')}
                    aria-current={active === heading.id ? 'location' : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      jump(heading.id);
                    }}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ol>

            <Link to="/blog" className="toc__back">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back to all posts
            </Link>
          </nav>
        );
      }`,
    },
    {
      path: 'lib/markdown.js',
      content: `      /**
       * A very small markdown parser.
       *
       * This exists to demonstrate what an MDX pipeline does for you. It supports the
       * subset the posts actually use, and nothing more:
       *
       *   - ATX headings, h1 to h3
       *   - paragraphs
       *   - fenced code blocks
       *   - blockquotes
       *   - unordered and ordered lists
       *   - inline: **bold**, *italic*, \`code\`, [text](href)
       *
       * Design notes:
       *
       *   - Inline formatting is applied to already-escaped text, so \`&amp;\` cannot be
       *     turned back into a live \`&\` by a later rule. Escape first, then substitute.
       *   - Everything returns React elements rather than an HTML string, so the output
       *     is a real tree. There is no \`dangerouslySetInnerHTML\` anywhere in this
       *     template, which is the entire reason this parser exists.
       */

      /** Escapes the five characters that matter in HTML text and attribute values. */
      export const escapeHtml = (value) =>
        String(value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');

      const SAFE_PROTOCOL = /^(https?:|mailto:|#|\\/)/i;

      /** Blocks that pass through unformatted: headings, code, quotes, lists. */
      const isBlockStart = (line) =>
        /^#{1,3}\\s/.test(line) ||
        /^\`\`\`/.test(line) ||
        /^>\\s?/.test(line) ||
        /^[-*]\\s/.test(line) ||
        /^\\d+\\.\\s/.test(line);

      /**
       * Inline rules, in the order they must be applied.
       *
       * Exported because \`components/MDXBlock.jsx\` compiles the same patterns into
       * React nodes. Sharing one ordered list is what keeps the two renderers
       * consistent - if these drifted, \`\` **bold with \`code\`** \`\` would parse
       * differently in the two of them.
       */
      export const INLINE_RULES = [
        {
          // [text](href) - href is validated, and javascript: is dropped.
          name: 'link',
          pattern: /\\[([^\\]]+)\\]\\(([^)\\s]+)\\)/g,
          replace: (match, text, href) =>
            SAFE_PROTOCOL.test(href)
              ? '<a href="' + escapeHtml(href) + '" rel="noopener noreferrer">' + text + '</a>'
              : text,
        },
        { name: 'code', pattern: /\`([^\`]+)\`/g, replace: (m, code) => '<code>' + code + '</code>' },
        { name: 'strong', pattern: /\\*\\*([^*]+)\\*\\*/g, replace: (m, text) => '<strong>' + text + '</strong>' },
        { name: 'em', pattern: /\\*([^*]+)\\*/g, replace: (m, text) => '<em>' + text + '</em>' },
      ];

      const renderInline = (text) => {
        let out = escapeHtml(text);
        for (const rule of INLINE_RULES) {
          out = out.replace(rule.pattern, rule.replace);
        }
        return out;
      };

      /** GitHub-style slug from heading text. */
      export function slugify(text) {
        return String(text)
          .toLowerCase()
          .replace(/[^\\w\\s-]/g, '')
          .trim()
          .replace(/\\s+/g, '-')
          .replace(/-{2,}/g, '-');
      }

      /**
       * Parses markdown into a flat block list.
       *
       * Each block is a plain object with a \`kind\`, which \`components/MDXBlock.jsx\`
       * maps to an element. Keeping the two apart means the parser stays testable and
       * the renderer stays dumb.
       *
       * @param {string} source
       * @returns {{kind: string, [key: string]: any}[]}
       */
      export function parseMarkdown(source) {
        const lines = String(source || '').replace(/\\r\\n/g, '\\n').split('\\n');
        const blocks = [];
        let index = 0;

        const flushParagraph = (buffer) => {
          if (buffer.length === 0) return;
          blocks.push({ kind: 'paragraph', text: buffer.join(' ').trim() });
          buffer.length = 0;
        };

        const paragraph = [];

        while (index < lines.length) {
          const line = lines[index];

          // Fenced code
          if (/^\`\`\`/.test(line)) {
            flushParagraph(paragraph);
            const language = line.slice(3).trim() || 'text';
            const body = [];
            index += 1;
            while (index < lines.length && !/^\`\`\`/.test(lines[index])) {
              body.push(lines[index]);
              index += 1;
            }
            index += 1; // closing fence
            blocks.push({ kind: 'code', language, code: body.join('\\n') });
            continue;
          }

          // Blank line: ends whatever paragraph we were collecting
          if (line.trim() === '') {
            flushParagraph(paragraph);
            index += 1;
            continue;
          }

          // Heading
          const heading = /^(#{1,3})\\s+(.*)$/.exec(line);
          if (heading) {
            flushParagraph(paragraph);
            const level = heading[1].length;
            const text = heading[2].trim();
            blocks.push({ kind: 'heading', level, text, id: slugify(text) });
            index += 1;
            continue;
          }

          // Blockquote: consume consecutive quote lines into one block
          if (/^>\\s?/.test(line)) {
            flushParagraph(paragraph);
            const quoted = [];
            while (index < lines.length && /^>\\s?/.test(lines[index])) {
              quoted.push(lines[index].replace(/^>\\s?/, ''));
              index += 1;
            }
            blocks.push({ kind: 'quote', text: quoted.join(' ').trim() });
            continue;
          }

          // Unordered list
          if (/^[-*]\\s/.test(line)) {
            flushParagraph(paragraph);
            const items = [];
            while (index < lines.length && /^[-*]\\s/.test(lines[index])) {
              items.push(lines[index].replace(/^[-*]\\s/, '').trim());
              index += 1;
            }
            blocks.push({ kind: 'list', ordered: false, items });
            continue;
          }

          // Ordered list
          if (/^\\d+\\.\\s/.test(line)) {
            flushParagraph(paragraph);
            const items = [];
            while (index < lines.length && /^\\d+\\.\\s/.test(lines[index])) {
              items.push(lines[index].replace(/^\\d+\\.\\s/, '').trim());
              index += 1;
            }
            blocks.push({ kind: 'list', ordered: true, items });
            continue;
          }

          // Table: a header row followed by a |---|---| separator.
          if (line.indexOf('|') !== -1 && /^\\s*\\|?[\\s:-]*\\|[\\s:|-]*$/.test(lines[index + 1] || '')) {
            flushParagraph(paragraph);
            const cells = (row) =>
              row
                .replace(/^\\s*\\|/, '')
                .replace(/\\|\\s*$/, '')
                .split('|')
                .map((cell) => cell.trim());

            const header = cells(line);
            index += 2; // header plus separator

            const rows = [];
            while (index < lines.length && lines[index].indexOf('|') !== -1 && lines[index].trim() !== '') {
              rows.push(cells(lines[index]));
              index += 1;
            }
            blocks.push({ kind: 'table', header, rows });
            continue;
          }

          // Otherwise it is paragraph text. A line that starts a new block terminates
          // the current paragraph rather than being swallowed into it.
          if (paragraph.length > 0 && isBlockStart(line)) flushParagraph(paragraph);

          paragraph.push(line.trim());
          index += 1;
        }

        flushParagraph(paragraph);
        return blocks;
      }

      /**
       * Headings only, for the table of contents.
       *
       * Returns depth and id so the caller can render indentation, and keeps the
       * heading text for the link label.
       */
      export function extractHeadings(source) {
        return parseMarkdown(source)
          .filter((block) => block.kind === 'heading' && block.level <= 3)
          .map((block) => ({ id: block.id, text: block.text, level: block.level }));
      }

      /** Rough word count, for the "N min read" line on a post. */
      export const wordCount = (source) =>
        String(source || '')
          .replace(/\`\`\`[\\s\\S]*?\`\`\`/g, ' ')
          .split(/\\s+/)
          .filter(Boolean).length;`,
    },
    {
      path: 'lib/posts.js',
      content: `      /**
       * Post dataset.
       *
       * In a real Next.js App Router project this would be the result of a CMS query
       * or a \`contentlayer\` build. Here it is a static module with the same shape:
       * frontmatter fields plus a markdown body, so the page components can be written
       * exactly as they would be against real data.
       */

      export const AUTHORS = {
        'imogen-hart': { name: 'Imogen Hart', role: 'Staff engineer', initials: 'IH' },
        'daniel-osei': { name: 'Daniel Osei', role: 'Design systems', initials: 'DO' },
        'priya-raman': { name: 'Priya Raman', role: 'Infrastructure', initials: 'PR' },
        'sofia-almeida': { name: 'Sofia Almeida', role: 'Product engineer', initials: 'SA' },
      };

      /** Cover gradients, chosen so every card reads differently at a glance. */
      const COVERS = {
        plum: 'linear-gradient(135deg, #6d28d9, #db2777)',
        teal: 'linear-gradient(135deg, #0f766e, #0891b2)',
        amber: 'linear-gradient(135deg, #b45309, #f59e0b)',
        indigo: 'linear-gradient(135deg, #3730a3, #4f46e5)',
        rose: 'linear-gradient(135deg, #9f1239, #f43f5e)',
        slate: 'linear-gradient(135deg, #1e293b, #475569)',
      };

      /**
       * The posts. Bodies use a small markdown subset - headings, bold, italic, inline
       * code, fenced code, unordered and ordered lists, blockquotes and paragraphs -
       * which is exactly what \`lib/markdown.js\` knows how to render.
       */
      export const POSTS = [
        {
          slug: 'streaming-responses-without-sacrificing-seo',
          title: 'Streaming responses without sacrificing SEO',
          excerpt:
            'Server components let you stream the shell first and the data second. Here is how we kept the first paint under 800ms on a page that hits four upstream services.',
          date: '2026-03-17',
          author: 'imogen-hart',
          tags: ['nextjs', 'performance', 'rsc'],
          readingTime: 9,
          cover: 'plum',
          featured: true,
          body: \`Streaming changes what "fast" means. Instead of measuring how long the whole
      page takes, you measure how long it takes until the user can *do something*.

      ## What we were measuring before

      Our dashboard originally took 2.4 seconds to first meaningful paint. Lighthouse
      called it \\\`73\\\`, which sounded fine, and we shipped it. The problem was that the
      page was one \\\`<Suspense>\\\` boundary wrapped around everything, which meant one
      slow upstream service blocked the entire response.

      \\\`\\\`\\\`tsx
      // The mistake: one boundary, so one slow call blocks the lot.
      export default async function Dashboard() {
        const user = await getUser();
        const orders = await getOrders();
        const invoices = await getInvoices();
        const recommendations = await getRecommendations();

        return <Grid user={user} orders={orders} invoices={invoices} recommendations={recommendations} />;
      }
      \\\`\\\`\\\`

      ## Boundaries follow the data, not the layout

      The fix was to move the boundaries down to the smallest component that actually
      needs the slow data. The shell renders immediately; each panel resolves when its
      own promise settles.

      - **Shell** - navigation and headings. No data dependency, renders on the first chunk.
      - **Summary tiles** - needs one aggregate query, roughly 120ms.
      - **Invoice table** - needs two calls in parallel, roughly 600ms.
      - **Recommendations** - slowest, 1.8s, and only above the fold on desktop.

      Each of those is its own \\\`async\\\` component wrapped in \\\`Suspense\\\`. The user sees
      a complete, navigable page in about 300ms and the slow parts arrive underneath.

      > A loading skeleton is only good if it appears fast. A boundary around data
      > that resolves in 50ms is a flash of grey, which is worse than no skeleton.

      ## Keep the metadata server-side

      The part people forget: streaming the *component* does not mean streaming the
      *metadata*. \\\`generateMetadata\\\` still runs on the server and blocks the head, so
      it has to stay cheap.

      1. Never fetch the full record in \\\`generateMetadata\\\`.
      2. Pull only the fields you need, or read them from an edge cache.
      3. If a field is genuinely slow, omit it and let the page's own \\\`h1\\\` carry the title.

      ## Where we landed

      | Metric | Before | After |
      | --- | ---: | ---: |
      | First meaningful paint | 2,410ms | 290ms |
      | Largest contentful paint | 3,180ms | 780ms |
      | Requests blocking the head | 3 | 0 |

      The whole change was moving four \\\`await\\\` calls out of the root and into four
      components. Nothing about the design changed.\`,
        },
        {
          slug: 'design-tokens-that-survive-a-redesign',
          title: 'Design tokens that survive a redesign',
          excerpt:
            'A token layer is only worth building if it can absorb a visual rebrand without a rewrite. Four rules we learned the hard way at Northgate.',
          date: '2026-03-09',
          author: 'daniel-osei',
          tags: ['design-systems', 'css'],
          readingTime: 7,
          cover: 'teal',
          body: \`We rebranded in March. The token layer meant no component file changed. That was
      the entire goal, and it took two previous attempts to get there.

      ## Name by role, never by appearance

      The single most important rule. \\\`--blue-500\\\` tells the next developer nothing about
      when it is appropriate. \\\`--color-link\\\` tells them everything.

      - \\\`--color-surface\\\` - a background meant to hold content
      - \\\`--color-ink\\\` - body text
      - \\\`--color-accent\\\` - one interactive emphasis per screen
      - \\\`--color-danger\\\` - destructive or failed states only

      Appearance-level names belong in one primitive layer that nothing else imports
      directly. Everything above it references the role.

      ## Three tiers, and only three

      \\\`\\\`\\\`css
      :root {
        /* Tier 1: primitives. Raw values, referenced by tier 2 only. */
        --teal-600: 0d9488;
        --slate-100: #f1f5f9;

        /* Tier 2: semantic roles. This is what components consume. */
        --color-accent: var(--teal-600);
        --color-surface: var(--slate-100);

        /* Tier 3: component-level overrides. Rare, and always a last resort. */
        --button-padding-inline: var(--space-4);
      }
      \\\`\\\`\\\`

      Tier 3 is where token systems rot. We cap it deliberately: if a component needs a
      fourth tier override, the component is wrong, not the token.

      ## Dark mode repoints, it does not fork

      \\\`\\\`\\\`css
      @media (prefers-color-scheme: dark) {
        :root {
          --color-surface: #0f172a;
          --color-ink: #e2e8f0;
        }
      }
      \\\`\\\`\\\`

      That block is the whole dark theme. If a stylesheet ever contains a second
      \\\`prefers-color-scheme\\\` block outside the token file, something has escaped.

      > Test dark mode by switching your OS theme, not by adding a dev toggle. The
      > toggle is how the second block gets written in the first place.

      ## The audit that caught the drift

      We ran a script that greps for raw hex values in component rules. It found
      eleven. Nine were typos. Two were a developer in a hurry, and both are now
      tokens called \\\`--color-chart-grid\\\` and \\\`--color-chart-axis\\\`.\`,
        },
        {
          slug: 'cutting-our-build-from-nine-minutes-to-ninety-seconds',
          title: 'Cutting our build from nine minutes to ninety seconds',
          excerpt:
            'A monorepo, four deploy targets and no caching. What we changed, in the order that paid for itself.',
          date: '2026-02-26',
          author: 'priya-raman',
          tags: ['ci', 'infrastructure', 'monorepo'],
          readingTime: 11,
          cover: 'amber',
          body: \`Our CI pipeline took nine minutes and twelve seconds. Not because anything was slow -
      because we were doing all of the work, every time, for every pull request.

      ## Measure before optimising

      The first thing we did was turn on timing per step. It was embarrassing.

      | Step | Duration | Cached after |
      | --- | ---: | ---: |
      | Install | 94s | 6s |
      | Typecheck | 118s | 118s |
      | Unit tests | 232s | 34s |
      | E2E | 301s | 301s |
      | Build all packages | 96s | 22s |

      Install and unit tests had enormous cacheable surface area we were ignoring
      entirely.

      ## Cache keys, carefully

      The dangerous part of caching is the cache key. Ours keys on three things:

      1. The lockfile hash. Any dependency change invalidates everything, correctly.
      2. The source hash of *only the packages the job needs*, not the whole repo.
      3. The runner image digest, not the tag, so \\\`node:22\\\` moving under us is not silent.

      ## Only test what changed

      The biggest single win was affected-graph test selection. Turborepo computes it
      from the dependency graph, so a change to \\\`@acme/ui\\\` runs its tests plus
      everything downstream, and a docs change runs nothing.

      1. Tag every package with its own test command.
      2. Declare dependencies explicitly, including dev dependencies.
      3. Fail loudly when the graph is incomplete - a silent miss here is a broken main
         branch, not a slow pipeline.

      ## E2E still runs on everything

      We did not cache E2E, and we would not. E2E is slow precisely because it is
      checking that the integrated system works, and skipping it because nothing looked
      related is how you ship a broken Tuesday.\`,
        },
        {
          slug: 'the-case-for-boring-database-queries',
          title: 'The case for boring database queries',
          excerpt:
            'We replaced a recursive CTE that took 40 seconds with four indexed queries that take 12 milliseconds. On the merits, not the drama.',
          date: '2026-02-11',
          author: 'sofia-almeida',
          tags: ['postgres', 'performance'],
          readingTime: 6,
          cover: 'indigo',
          body: \`There is a particular kind of query that feels impressive to write and disastrous
      to run. Ours computed a rollup across four levels of the org tree, recursively,
      on every page load.

      ## The original

      \\\`\\\`\\\`sql
      WITH RECURSIVE chain AS (
        SELECT id, parent_id, 1 AS depth FROM accounts WHERE parent_id IS NULL
        UNION ALL
        SELECT a.id, a.parent_id, c.depth + 1
        FROM accounts a JOIN chain c ON a.parent_id = c.id
      )
      SELECT c.depth, count(*), sum(o.total)
      FROM chain c
      JOIN orders o ON o.account_id = c.id AND o.placed_at >= now() - interval '90 days'
      GROUP BY c.depth;
      \\\`\\\`\\\`

      Forty seconds on a warm database. The problem was not recursion - it was that we
      were recomputing a static hierarchy on every request.

      ## What we did instead

      \\\`\\\`\\\`sql
      -- 1. A generated column for depth, maintained on write.
      ALTER TABLE accounts
        ADD COLUMN depth smallint GENERATED ALWAYS AS
        (length(ancestry - replace(ancestry, '/', '')) / length('/')) STORED;

      -- 2. A covering index for the grouped scan.
      CREATE INDEX ON orders (placed_at, account_id) INCLUDE (total);

      -- 3. The rollup, now a plain grouped scan.
      SELECT (a.depth / 3) AS tier, count(*), sum(o.total)
      FROM orders o JOIN accounts a ON a.id = o.account_id
      WHERE o.placed_at >= now() - interval '90 days'
      GROUP BY tier;
      \\\`\\\`\\\`

      Twelve milliseconds. The recursion is gone entirely - depth is now data, not a
      computation.

      ## Boring is a feature

      *\\\`EXPLAIN\\\` before you ship.* The recursive version had a plan that looked fine
      and executed terribly, and the only way to know was to read the numbers.

      - If a query needs a CTE, ask whether the CTE could be a column.
      - If it recurses, ask whether the depth is really dynamic.
      - If it aggregates on every request, ask how stale the number can be.\`,
        },
        {
          slug: 'accessible-modals-without-a-library',
          title: 'Accessible modals without a library',
          excerpt:
            'Focus trapping, scroll locking, Escape handling and the inert background: about forty lines that most modal libraries are ultimately doing for you.',
          date: '2026-01-28',
          author: 'daniel-osei',
          tags: ['accessibility', 'javascript'],
          readingTime: 8,
          cover: 'rose',
          body: \`Modal libraries solve a genuinely hard problem, and most of us reach for one
      without knowing what is in it. Here is the whole of it.

      ## The four requirements

      1. Move focus into the dialog when it opens.
      2. Keep focus inside while it is open.
      3. Close on Escape.
      4. Tell the rest of the page that it is not available.

      The fourth is the one people skip, and it is the one that matters most for
      screen reader users.

      ## Mark the background inert

      \\\`inert\\\` is the answer, and it is now widely supported.

      \\\`\\\`\\\`js
      function open(dialog) {
        for (const sibling of document.body.children) {
          if (sibling !== dialog && !dialog.contains(sibling)) sibling.inert = true;
        }
        dialog.showModal();
        dialog.querySelector('button').focus();
      }

      function close(dialog) {
        dialog.close();
        for (const node of document.body.children) node.inert = false;
        lastFocused?.focus();
      }
      \\\`\\\`\\\`

      That is the entire interaction model. Everything else is styling.

      ## Trap focus without hand-rolling it

      \\\`\\\`\\\`js
      dialog.addEventListener('keydown', (event) => {
        if (event.key !== 'Tab') return;
        const focusable = dialog.querySelectorAll(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
      \\\`\\\`\\\`

      > Always remember where focus came from. Restoring it to \\\`document.body\\\` after a
      > close is the classic modal bug, and it strands keyboard users at the top of
      > the page.

      ## Lock the scroll, then undo it

      \\\`\\\`\\\`css
      body:has(dialog[open]) {
        overflow: hidden;
        /* Compensate for the vanishing scrollbar so the page does not jump. */
        padding-right: var(--scrollbar-width, 0px);
      }
      \\\`\\\`\\\`

      \\\`:has()\\\` means no JavaScript at all. Set \\\`--scrollbar-width\\\` once at boot from
      \\\`window.innerWidth - document.documentElement.clientWidth\\\`.\`,
        },
        {
          slug: 'why-we-stopped-writing-our-own-auth',
          title: 'Why we stopped writing our own auth',
          excerpt:
            'Four years of maintaining a session system, and the honest accounting of what it cost versus what it would have cost to buy.',
          date: '2026-01-14',
          author: 'priya-raman',
          tags: ['security', 'postmortem'],
          readingTime: 10,
          cover: 'slate',
          body: \`This is not an argument that off-the-shelf auth is always right. It is an
      accounting of what our custom system cost, written down honestly.

      ## What we built

      Opaque session tokens in Postgres, hashed with SHA-256, rotating on use, with a
      CSRF double-submit cookie and a device table for "where am I signed in".

      It worked. It also worked *only* as long as someone competent kept looking at it.

      ## The parts we underestimated

      - **Token rotation races.** Two concurrent requests each rotated the token; one
        user got logged out at random. Took a fortnight to reproduce and a day to fix.
      - **Session invalidation on password change.** We forgot it for eleven months.
        Nobody noticed because nobody changed their password.
      - **The MFA code path.** Six ways in, of which we had tested three properly.
      - **Audit logging.** Required for the enterprise contracts we had just signed.

      None of that is interesting engineering. It is all table stakes, and all of it
      needed to be correct, forever, with no user-visible benefit.

      ## What we would tell our past selves

      1. Count the *absence* of incidents as a cost, not as evidence of quality.
      2. If the feature is a solved problem with security consequences, the engineering
         you save is better spent on your actual product.
      3. The migration is the cheap part. Run both systems side by side for a month.

      ## What is genuinely hard either way

      Your authorisation model. Where a session may go, what an account may see, and
      what happens when a customer is acquired. Vendors solve the first problem well
      and none of the second. That is where we spend our time now.\`,
        },
      ];

      /** Newest first. A real implementation would order by a query, not in memory. */
      export const SORTED_POSTS = POSTS.slice().sort((a, b) => (a.date < b.date ? 1 : -1));

      /** Every tag with its post count, for the filter rail. */
      export const TAGS = (() => {
        const counts = new Map();
        for (const post of POSTS) {
          for (const tag of post.tags) counts.set(tag, (counts.get(tag) || 0) + 1);
        }
        return Array.from(counts, ([id, count]) => ({ id, count })).sort(
          (a, b) => b.count - a.count || a.id.localeCompare(b.id),
        );
      })();

      export const authorOf = (id) => AUTHORS[id] || { name: 'Staff', role: 'Contributor', initials: '??' };

      export const postBySlug = (slug) => POSTS.find((post) => post.slug === slug) || null;

      export const coverGradient = (key) => COVERS[key] || COVERS.slate;

      /** \`2026-03-17\` -> "17 March 2026". */
      export function formatDate(iso) {
        const [y, m, d] = String(iso).split('-').map(Number);
        const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return d + ' ' + MONTHS[m - 1] + ' ' + y;
      }

      /** Relative age, used by the post list. */
      export function timeSince(iso) {
        const [y, m, d] = String(iso).split('-').map(Number);
        const then = Date.UTC(y, m - 1, d);
        const now = new Date();
        const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
        const days = Math.round((today - then) / 86400000);

        if (days <= 0) return 'today';
        if (days === 1) return 'yesterday';
        if (days < 7) return days + ' days ago';
        if (days < 31) return Math.round(days / 7) + ' week' + (days < 14 ? '' : 's') + ' ago';
        return Math.round(days / 30) + ' month' + (days < 60 ? '' : 's') + ' ago';
      }

      /** Related posts: same tags first, most recent wins. */
      export function relatedPosts(slug, limit = 3) {
        const current = postBySlug(slug);
        if (!current) return [];

        return POSTS.filter((post) => post.slug !== slug)
          .map((post) => ({
            post,
            score: post.tags.filter((tag) => current.tags.includes(tag)).length,
          }))
          .filter((entry) => entry.score > 0)
          .sort((a, b) => b.score - a.score || (a.post.date < b.post.date ? 1 : -1))
          .slice(0, limit)
          .map((entry) => entry.post);
      }`,
    },
    {
      path: 'lib/router.js',
      content: `      /**
       * A minimal client-side router built on the History API.
       *
       * In a real Next.js App Router project none of this exists: \`app/page.jsx\` is the
       * \\\`/\\\` route because of where the file sits, and navigation is a \`<Link>\` that
       * the framework intercepts. That file-based mapping cannot be reproduced in a
       * browser playground, so this module provides the equivalent behaviour:
       *
       *   - \`route.path\` is the current path, and re-renders on navigation
       *   - \`navigate(path)\` pushes a history entry and updates \`route.path\`
       *   - Back and forward buttons work, because we listen to \`popstate\`
       *   - \`Link\` renders a real \`<a href>\`, so middle-click and "copy link" behave
       *
       * \`route.path\` is what drives the route table in \`App.jsx\`.
       */

      import { useCallback, useEffect, useState } from 'react';

      /** Turns a path into a comparable route key. */
      export const normalise = (path) => {
        const clean = String(path || '/').split('?')[0].split('#')[0];
        if (clean.length > 1 && clean.endsWith('/')) return clean.slice(0, -1);
        return clean || '/';
      };

      /**
       * Matches a path against the app's route table.
       *
       * The \\\`[slug]\\\` segment is the interesting case: it is a pattern, and a real
       * App Router would get \\\`params\\\` passed in by the filesystem router. Here the
       * dynamic segment is matched by hand and the captured value is handed to the
       * page component as \\\`params\\\`, which is the same shape Next.js uses.
       */
      export function matchRoute(path, routes) {
        const target = normalise(path);
        const segments = target.split('/').filter(Boolean);

        for (const route of routes) {
          const pattern = route.path.split('/').filter(Boolean);
          if (pattern.length !== segments.length) continue;

          const params = {};
          let matched = true;

          for (let i = 0; i < pattern.length; i++) {
            const part = pattern[i];

            if (part.startsWith('[') && part.endsWith(']')) {
              params[part.slice(1, -1)] = decodeURIComponent(segments[i]);
              continue;
            }
            if (part !== segments[i]) {
              matched = false;
              break;
            }
          }

          if (matched) return { route, params };
        }

        return null;
      }

      /** Strips the site prefix and returns a clean in-app path. */
      export function hrefFor(path) {
        const clean = normalise(path);
        return clean.startsWith('/') ? clean : '/' + clean;
      }

      /**
       * The router hook.
       *
       * \`navigate\` and \`back\` are wrapped in \`useCallback\` because the \`<Link>\`
       * component receives them, and an unstable function would re-render every link
       * on every state change.
       */
      export function useRouter() {
        const [path, setPath] = useState(() => normalise(window.location.pathname));

        // \`popstate\` covers back and forward. The replace/normalise guard keeps the
        // state from re-rendering when the path has not actually changed.
        useEffect(() => {
          const onPopState = () => {
            const next = normalise(window.location.pathname);
            setPath(next);
          };
          window.addEventListener('popstate', onPopState);
          return () => window.removeEventListener('popstate', onPopState);
        }, []);

        const navigate = useCallback((to, options) => {
          const next = hrefFor(to);
          if (normalise(window.location.pathname) === next) return;

          if (options && options.replace) window.history.replaceState({}, '', next);
          else window.history.pushState({}, '', next);

          setPath(next);
          // Scroll reset belongs here in a real app router. In this playground the
          // reading-progress bar and the TOC both key off the scroll container, so
          // the browser's own behaviour is left alone.
          window.scrollTo({ top: 0, behavior: 'auto' });
        }, []);

        const back = useCallback(() => {
          window.history.back();
        }, []);

        return { path, navigate, back };
      }

      /**
       * Link component.
       *
       * A real \`<a href>\`, so the browser's own affordances work. The click handler
       * only intercepts a plain left click - no modifier keys, no middle button, no
       * target - which is exactly the rule React Router and Next.js both use.
       */
      export function Link({ to, children, onNavigate, className, ...rest }) {
        const handleClick = useCallback(
          (event) => {
            if (event.defaultPrevented) return;
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            if (event.button !== 0) return;

            event.preventDefault();
            if (onNavigate) onNavigate(to);
          },
          [to, onNavigate],
        );

        return (
          <a href={hrefFor(to)} className={className} onClick={handleClick} {...rest}>
            {children}
          </a>
        );
      }`,
    }
  ],
};
