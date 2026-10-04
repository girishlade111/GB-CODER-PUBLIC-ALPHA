export default {
  files: [
    {
      path: 'main.jsx',
      content: `      import { StrictMode } from 'react';
      import { createRoot } from 'react-dom/client';
      import App from './App.jsx';

      // Styles are imported here so the bundler collects them from the module graph.
      // The playground injects #root; guard so a missing host is a no-op.
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

      /* -------------------------------------------------------------
         Tokens
         ------------------------------------------------------------- */
      :root {
        --font-display: 'Fraunces', Georgia, serif;
        --font-body: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

        --color-bg: #f2f4f8; --color-surface: #ffffff;
        --color-surface-2: #f7f9fc;
        --color-ink: #101623;
        --color-ink-2: #4a5468;
        --color-ink-3: #808b9f;
        --color-border: #e2e6ee; --color-border-strong: #cbd2df;

        --color-accent: #4f46e5;
        --color-accent-2: #7c6cf5;
        --color-accent-soft: #eceafe; --color-ok: #10844f; --color-ok-soft: #e4f6ec; --color-warn: #b45309;
        --color-warn-soft: #fdf1df; --color-danger: #c02626; --color-danger-soft: #fdeaea;
        --color-info: #1d4ed8; --color-info-soft: #e6ecfd;

        --chart-line: #4f46e5;

        --glass-bg: rgba(255, 255, 255, 0.82); --glass-border: rgba(255, 255, 255, 0.9);

        --space-1: 0.25rem;
        --space-2: 0.5rem;
        --space-3: 0.75rem;
        --space-4: 1rem;
        --space-5: 1.5rem;
        --space-6: 2rem;

        --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px; --radius-pill: 999px;

        --shadow-1: 0 1px 2px rgba(16, 22, 35, 0.05), 0 1px 3px rgba(16, 22, 35, 0.04);
        --shadow-2: 0 4px 14px rgba(16, 22, 35, 0.08);
        --shadow-3: 0 18px 40px rgba(16, 22, 35, 0.16);

        --rail: 16.5rem; --rail-collapsed: 4.5rem; --ring: 0 0 0 3px rgba(79, 70, 229, 0.4); --tap: 40px;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --color-bg: #0b0e15; --color-surface: #141922;
          --color-surface-2: #1b212c;
          --color-ink: #edf0f6;
          --color-ink-2: #b3bccd;
          --color-ink-3: #808b9f;
          --color-border: #262d3a; --color-border-strong: #39424f; --color-accent: #8b83ff;
          --color-accent-soft: #221f45; --color-ok: #46c48a; --color-ok-soft: #10291d; --color-warn: #e0a44a;
          --color-warn-soft: #2e2413; --color-danger: #f0776f; --color-danger-soft: #33191a;
          --color-info: #7ba6ff; --color-info-soft: #16213c; --chart-line: #8b83ff;
          --glass-bg: rgba(20, 25, 34, 0.86); --glass-border: rgba(255, 255, 255, 0.08);
          --shadow-1: 0 1px 2px rgba(0, 0, 0, 0.4);
          --shadow-2: 0 4px 14px rgba(0, 0, 0, 0.45);
          --shadow-3: 0 18px 40px rgba(0, 0, 0, 0.6);
        }
      }

      /* -- Base ----------------------------------------------------- */
      *, *::before, *::after { box-sizing: border-box; }

      body {
        margin: 0; padding: 0; font-family: var(--font-body); font-size: 15px; line-height: 1.55;
        color: var(--color-ink); background: var(--color-bg); -webkit-font-smoothing: antialiased;
      }

      #root { min-height: 100vh; }
      h1, h2, h3, h4 { font-family: var(--font-display); font-weight: 600; letter-spacing: -0.01em; margin: 0; }
      p { margin: 0; }
      ul, ol { margin: 0; padding: 0; list-style: none; }
      button { font: inherit; }
      code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.85em; background: var(--color-bg); padding: 0.1em 0.35em; border-radius: var(--radius-sm); }

      .sr-only {
        position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
        overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
      }

      .skip-link {
        position: fixed; left: var(--space-3); top: -70px; z-index: 80;
        padding: var(--space-2) var(--space-4); background: var(--color-accent); color: #fff;
        border-radius: var(--radius-sm); text-decoration: none; font-weight: 600; transition: top 160ms ease;
      }
      .skip-link:focus { top: var(--space-3); }

      :where(a, button, input, select, [tabindex]):focus-visible {
        outline: 2px solid transparent; box-shadow: var(--ring); border-radius: var(--radius-sm);
      }

      .glass {
        background: var(--glass-bg); backdrop-filter: blur(12px) saturate(140%);
        -webkit-backdrop-filter: blur(12px) saturate(140%); border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg); box-shadow: var(--shadow-1);
      }

      .card-title { font-size: 1rem; }
      .card-sub { font-size: 0.78rem; color: var(--color-ink-3); }

      .input {
        width: 100%; min-height: 36px; padding: 6px var(--space-3);
        font: inherit; font-size: 0.86rem; color: var(--color-ink);
        background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md);
        transition: border-color 140ms ease, box-shadow 140ms ease;
      }
      .input::placeholder { color: var(--color-ink-3); }
      .input:hover { border-color: var(--color-border-strong); }
      .input:focus-visible { border-color: var(--color-accent); box-shadow: var(--ring); }
      .input::-webkit-search-cancel-button { display: none; }

      .link-button {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 0; font: inherit; font-size: 0.78rem; font-weight: 600;
        color: var(--color-accent); background: none; border: 0; cursor: pointer;
      }
      .link-button:hover { text-decoration: underline; }

      .avatar {
        display: grid; place-items: center; width: 34px; height: 34px; flex: 0 0 auto;
        font-size: 0.74rem; font-weight: 700; color: #fff;
        background: linear-gradient(140deg, var(--color-accent), var(--color-accent-2)); border-radius: 50%;
      }
      .avatar--sm { width: 28px; height: 28px; font-size: 0.66rem; }

      .chip {
        display: inline-flex; align-items: center; padding: 1px var(--space-2);
        font-size: 0.66rem; font-weight: 600; border-radius: var(--radius-sm);
      }
      .chip--soft { color: var(--color-ink-2); background: var(--color-surface-2); border: 1px solid var(--color-border); }

      /* -- Shell ---------------------------------------------------- */
      .shell {
        display: grid; grid-template-columns: var(--rail) minmax(0, 1fr); min-height: 100vh;
        transition: grid-template-columns 260ms cubic-bezier(0.3, 0.8, 0.3, 1);
      }
      .shell--collapsed { grid-template-columns: var(--rail-collapsed) minmax(0, 1fr); }
      .shell__main { min-width: 0; display: flex; flex-direction: column; }

      .content { display: grid; gap: clamp(var(--space-4), 1.6vw, var(--space-5)); padding: clamp(var(--space-4), 2vw, var(--space-5)); }

      /* -- Sidebar -------------------------------------------------- */
      .sidebar {
        position: sticky; top: 0; align-self: start;
        display: flex; flex-direction: column; gap: var(--space-4);
        height: 100vh; padding: var(--space-4) var(--space-3);
        background: var(--color-surface); border-right: 1px solid var(--color-border);
        overflow-y: auto; overflow-x: hidden; z-index: 40;
      }

      .sidebar__brand { display: flex; align-items: center; gap: var(--space-3); padding: 0 var(--space-2); }
      .sidebar__mark {
        display: grid; place-items: center; width: 34px; height: 34px; flex: 0 0 auto; color: #fff;
        background: linear-gradient(140deg, var(--color-accent), var(--color-accent-2)); border-radius: var(--radius-md);
      }
      .sidebar__name { display: grid; min-width: 0; }
      .sidebar__name strong { font-size: 0.94rem; }
      .sidebar__name small { font-size: 0.68rem; color: var(--color-ink-3); }

      .sidebar__nav { display: grid; gap: var(--space-4); flex: 1; }
      .nav-section { display: grid; gap: var(--space-1); }
      .nav-section__title {
        padding: 0 var(--space-2); font-family: var(--font-body);
        font-size: 0.64rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
        color: var(--color-ink-3); white-space: nowrap;
      }

      .nav-item {
        display: flex; align-items: center; gap: var(--space-3);
        width: 100%; min-height: 38px; padding: 6px var(--space-2);
        font: inherit; font-size: 0.86rem; font-weight: 500; text-align: left;
        color: var(--color-ink-2); background: transparent; border: 0; border-radius: var(--radius-md); cursor: pointer;
        transition: background-color 150ms ease, color 150ms ease;
      }
      .nav-item:hover { background: var(--color-surface-2); color: var(--color-ink); }
      .nav-item--on { color: var(--color-accent); background: var(--color-accent-soft); font-weight: 600; }
      .nav-item--on .nav-icon { color: var(--color-accent); }
      .nav-item__label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .nav-item__badge {
        padding: 0 6px; font-size: 0.64rem; font-weight: 700; font-variant-numeric: tabular-nums;
        color: var(--color-ink-2); background: var(--color-surface-2);
        border: 1px solid var(--color-border); border-radius: var(--radius-pill);
      }

      .sidebar__foot { display: grid; gap: var(--space-2); padding-top: var(--space-3); border-top: 1px solid var(--color-border); }
      .sidebar__user { display: flex; align-items: center; gap: var(--space-2); padding: 0 var(--space-2); }
      .sidebar__user-text { display: grid; min-width: 0; }
      .sidebar__user-text strong { font-size: 0.82rem; }
      .sidebar__user-text small { font-size: 0.68rem; color: var(--color-ink-3); }

      .sidebar__collapse {
        display: flex; align-items: center; gap: var(--space-2); min-height: 34px; padding: 4px var(--space-2);
        font: inherit; font-size: 0.78rem; color: var(--color-ink-3);
        background: transparent; border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer;
        transition: color 150ms ease, border-color 150ms ease;
      }
      .sidebar__collapse:hover { color: var(--color-ink); border-color: var(--color-border-strong); }
      .nav-icon.is-flipped { transform: rotate(180deg); }

      /* Collapsed rail: labels and badges are hidden, glyphs centred. */
      .sidebar--collapsed .sidebar__name,
      .sidebar--collapsed .nav-section__title,
      .sidebar--collapsed .nav-item__label,
      .sidebar--collapsed .nav-item__badge,
      .sidebar--collapsed .sidebar__user-text,
      .sidebar--collapsed .sidebar__collapse-text { display: none; }
      .sidebar--collapsed .nav-item,
      .sidebar--collapsed .sidebar__collapse { justify-content: center; padding-inline: 0; }
      .sidebar--collapsed .nav-section { gap: 2px; }

      .scrim {
        position: fixed; inset: 0; z-index: 35; padding: 0;
        background: rgba(9, 12, 20, 0.5); border: 0; cursor: pointer; animation: fade 200ms ease;
      }

      /* -- Topbar --------------------------------------------------- */
      .topbar {
        position: sticky; top: 0; z-index: 30; display: flex; align-items: center; gap: var(--space-3);
        padding: var(--space-3) clamp(var(--space-4), 2vw, var(--space-5));
        background: var(--glass-bg); backdrop-filter: blur(14px) saturate(150%);
        -webkit-backdrop-filter: blur(14px) saturate(150%); border-bottom: 1px solid var(--color-border);
      }

      .topbar__left { display: flex; align-items: center; gap: var(--space-3); min-width: 0; }
      .topbar__titles { min-width: 0; }
      .topbar__crumb { font-size: 0.68rem; color: var(--color-ink-3); }
      .topbar__title { font-size: 1.05rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

      .topbar__burger { display: none; }

      .topbar__icon-btn {
        display: grid; place-items: center; width: var(--tap); height: var(--tap);
        color: var(--color-ink-2); background: transparent; border: 1px solid var(--color-border);
        border-radius: var(--radius-md); cursor: pointer;
        transition: color 150ms ease, background-color 150ms ease;
      }
      .topbar__icon-btn:hover { color: var(--color-ink); background: var(--color-surface-2); }

      .topbar__search { position: relative; display: flex; align-items: center; flex: 1; max-width: 30rem; }
      .topbar__search-icon { position: absolute; left: var(--space-3); color: var(--color-ink-3); pointer-events: none; }
      .topbar__search .input { padding-left: 2.2rem; padding-right: 2rem; background: var(--color-surface-2); }
      .topbar__search-clear {
        position: absolute; right: 6px; display: grid; place-items: center; width: 24px; height: 24px;
        color: var(--color-ink-3); background: transparent; border: 0; border-radius: var(--radius-sm); cursor: pointer;
      }
      .topbar__search-clear:hover { color: var(--color-ink); background: var(--color-bg); }

      .topbar__actions { display: flex; align-items: center; gap: var(--space-2); margin-left: auto; }

      .topbar__trigger {
        display: inline-flex; align-items: center; gap: var(--space-2); min-height: var(--tap); padding: 4px var(--space-3);
        font: inherit; font-size: 0.82rem; font-weight: 500; color: var(--color-ink-2);
        background: transparent; border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer;
        transition: color 150ms ease, border-color 150ms ease, background-color 150ms ease;
      }
      .topbar__trigger:hover { color: var(--color-ink); background: var(--color-surface-2); }
      .topbar__trigger--on { color: var(--color-accent); border-color: var(--color-accent); background: var(--color-accent-soft); }
      .topbar__chevron { transition: transform 180ms ease; }
      .topbar__trigger--on .topbar__chevron { transform: rotate(180deg); }

      .dot-badge {
        display: grid; place-items: center; min-width: 18px; height: 18px; padding: 0 5px;
        font-size: 0.64rem; font-weight: 700; color: #fff; background: var(--color-danger); border-radius: var(--radius-pill);
      }

      .dropdown { position: relative; }
      .dropdown__panel {
        position: absolute; top: calc(100% + 8px); z-index: 60; min-width: 15rem;
        background: var(--color-surface); border: 1px solid var(--color-border);
        border-radius: var(--radius-md); box-shadow: var(--shadow-3); overflow: hidden;
        animation: drop-in 170ms cubic-bezier(0.2, 0.8, 0.3, 1);
      }
      .dropdown--right .dropdown__panel { right: 0; }
      .dropdown__head {
        display: flex; align-items: center; justify-content: space-between; gap: var(--space-2);
        padding: var(--space-3); font-size: 0.78rem; font-weight: 700;
        border-bottom: 1px solid var(--color-border);
      }
      .dropdown__count { font-size: 0.68rem; font-weight: 600; color: var(--color-danger); }

      .notif-list, .menu-list { max-height: 20rem; overflow-y: auto; }
      .notif, .menu-item {
        display: flex; align-items: flex-start; gap: var(--space-2);
        width: 100%; padding: var(--space-3); text-align: left;
        font: inherit; color: var(--color-ink); background: transparent; border: 0; cursor: pointer;
        transition: background-color 140ms ease;
      }
      .notif:hover, .menu-item:hover { background: var(--color-surface-2); }
      .notif__dot { width: 7px; height: 7px; margin-top: 6px; flex: 0 0 auto; border-radius: 50%; background: var(--color-ink-3); }
      .notif__dot--ok { background: var(--color-ok); }
      .notif__dot--info { background: var(--color-info); }
      .notif__dot--warn { background: var(--color-warn); }
      .notif__dot--danger { background: var(--color-danger); }
      .notif__text { display: grid; gap: 1px; min-width: 0; }
      .notif__title { font-size: 0.82rem; }
      .notif__meta { font-size: 0.68rem; color: var(--color-ink-3); }
      .menu-item { align-items: center; font-size: 0.84rem; }
      .menu-item--warn { color: var(--color-danger); }

      /* -- Page head ------------------------------------------------ */
      .page-head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap; }
      .page-head__title { font-size: clamp(1.3rem, 2.4vw, 1.7rem); }
      .page-head__sub { font-size: 0.84rem; color: var(--color-ink-2); max-width: 62ch; }
      .page-head__actions { display: flex; align-items: center; gap: var(--space-4); }
      .page-head__meta { display: grid; }
      .page-head__meta-label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-ink-3); }
      .page-head__meta strong { font-family: var(--font-display); font-size: 1.24rem; }
      .page-head__meta-sub { font-size: 0.72rem; color: var(--color-ink-3); }

      .gauge { flex: 0 0 auto; }
      .gauge__track { stroke: var(--color-border); }
      .gauge__value { stroke: var(--color-accent); transition: stroke-dashoffset 800ms cubic-bezier(0.3, 0.8, 0.3, 1); }
      .gauge__text { font-family: var(--font-body); font-size: 13px; font-weight: 700; fill: var(--color-ink); }

      /* -- Health strip --------------------------------------------- */
      .health { display: grid; grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr)); gap: var(--space-2); }
      .health__item {
        display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-2);
        padding: var(--space-2) var(--space-3);
        background: var(--color-surface-2); border: 1px solid var(--color-border);
        border-left: 3px solid var(--color-ink-3); border-radius: var(--radius-md);
      }
      .health__item--ok { border-left-color: var(--color-ok); }
      .health__item--warn { border-left-color: var(--color-warn); }
      .health__item--bad { border-left-color: var(--color-danger); }
      .health__label { font-size: 0.72rem; color: var(--color-ink-3); }
      .health__value { font-size: 0.82rem; font-weight: 700; font-variant-numeric: tabular-nums; }

      /* -- KPI cards ------------------------------------------------ */
      .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr)); gap: var(--space-3); }

      .kpi {
        display: grid; gap: var(--space-2); padding: var(--space-4);
        background: var(--glass-bg); backdrop-filter: blur(12px);
        border: 1px solid var(--glass-border); border-radius: var(--radius-lg); box-shadow: var(--shadow-1);
        transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
      }
      .kpi:hover { transform: translateY(-3px); box-shadow: var(--shadow-2); border-color: var(--color-border-strong); }

      .kpi__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-2); flex-wrap: wrap; }
      .kpi__label { font-family: var(--font-body); font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-ink-3); }
      .kpi__value { font-family: var(--font-display); font-size: clamp(1.5rem, 2.4vw, 1.9rem); font-weight: 600; line-height: 1.05; font-variant-numeric: tabular-nums; }
      .kpi__spark { height: 30px; color: var(--color-accent); }
      .kpi--warn .kpi__spark { color: var(--color-warn); }
      .kpi__note { font-size: 0.72rem; color: var(--color-ink-3); }

      .spark { width: 100%; height: 100%; display: block; overflow: visible; }
      .spark__dot { fill: currentColor; stroke: var(--color-surface); stroke-width: 1.2; }
      .spark polyline { transition: opacity 200ms ease; }

      .delta {
        display: inline-flex; align-items: center; gap: 3px;
        padding: 2px var(--space-2); font-size: 0.7rem; font-weight: 700; font-variant-numeric: tabular-nums;
        border-radius: var(--radius-pill); white-space: nowrap;
      }
      .delta--success { color: var(--color-ok); background: var(--color-ok-soft); }
      .delta--danger { color: var(--color-danger); background: var(--color-danger-soft); }
      .delta__label { font-weight: 500; opacity: 0.75; }
      .delta__arrow { flex: 0 0 auto; }

      /* -- Panels --------------------------------------------------- */
      .grid-2 { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: clamp(var(--space-3), 1.4vw, var(--space-4)); }
      .panel { display: grid; gap: var(--space-3); align-content: start; padding: clamp(var(--space-4), 1.6vw, var(--space-5)); }
      .panel__head { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }

      /* -- Chart ---------------------------------------------------- */
      .chart-card { display: grid; gap: var(--space-3); padding: clamp(var(--space-4), 1.6vw, var(--space-5)); }
      .chart-card__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap; }
      .chart-card__stats { display: flex; gap: var(--space-5); margin: 0; }
      .chart-card__stats dt { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-ink-3); }
      .chart-card__stats dd { margin: 2px 0 0; font-family: var(--font-display); font-size: 1.02rem; font-weight: 600; }
      .chart-card__stats .is-good { color: var(--color-ok); }
      .chart-card__stats .is-bad { color: var(--color-danger); }
      .chart-wrap { position: relative; }
      .chart { width: 100%; height: auto; display: block; overflow: visible; touch-action: pan-y; }

      .chart-grid { stroke: var(--color-border); stroke-width: 1; stroke-dasharray: 3 6; }
      .chart-target { stroke: var(--color-ink-3); stroke-width: 1.2; stroke-dasharray: 6 4; }
      .chart-target__label { font-size: 10px; fill: var(--color-ink-3); }
      .chart-ylabel, .chart-xlabel { font-family: var(--font-body); font-size: 10.5px; fill: var(--color-ink-3); }
      .chart-line { stroke: var(--chart-line); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
      .chart-cursor { stroke: var(--color-accent); stroke-width: 1; stroke-dasharray: 3 3; }
      .chart-dot { fill: var(--chart-line); stroke: var(--color-surface); stroke-width: 1.5; transition: r 140ms ease; }
      .chart-dot--on { stroke: var(--color-surface); }

      .chart-tip { pointer-events: none; animation: tip-in 130ms ease; }
      .chart-tip__bg { fill: var(--color-ink); opacity: 0.95; }
      .chart-tip__month { font-family: var(--font-body); font-size: 10px; font-weight: 600; fill: rgba(255, 255, 255, 0.75); }
      .chart-tip__value { font-family: var(--font-body); font-size: 15px; font-weight: 700; fill: #fff; }
      .chart-tip__meta { font-family: var(--font-body); font-size: 10px; fill: rgba(255, 255, 255, 0.7); }

      .chart-card__foot { font-size: 0.74rem; color: var(--color-ink-3); }

      /* -- Regions -------------------------------------------------- */
      .regions { display: grid; gap: var(--space-3); }
      .share { display: grid; gap: 4px; }
      .share__head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-2); }
      .share__label { font-size: 0.82rem; }
      .share__value { font-size: 0.78rem; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--color-ink-2); }
      .share__bar {
        width: 100%; height: 6px; appearance: none; border: none; border-radius: var(--radius-pill);
        background: var(--color-border); overflow: hidden;
      }
      .share__bar::-webkit-progress-bar { background: var(--color-border); border-radius: var(--radius-pill); }
      .share__bar::-webkit-progress-value { background: var(--color-accent); border-radius: var(--radius-pill); transition: width 600ms ease; }
      .share__bar::-moz-progress-bar { background: var(--color-accent); border-radius: var(--radius-pill); }

      /* -- Table ---------------------------------------------------- */
      .table-card { display: grid; gap: var(--space-3); padding: clamp(var(--space-4), 1.6vw, var(--space-5)); }
      .table-card__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-3); flex-wrap: wrap; }

      .table-search { position: relative; display: flex; align-items: center; min-width: 15rem; }
      .table-search__icon { position: absolute; left: var(--space-3); color: var(--color-ink-3); pointer-events: none; }
      .table-search .input { padding-left: 2.2rem; padding-right: 2rem; }
      .table-search__clear {
        position: absolute; right: 6px; display: grid; place-items: center; width: 24px; height: 24px;
        color: var(--color-ink-3); background: transparent; border: 0; border-radius: var(--radius-sm); cursor: pointer;
      }
      .table-search__clear:hover { color: var(--color-ink); background: var(--color-bg); }

      .table-scroll { overflow-x: auto; margin: 0 calc(-1 * var(--space-2)); padding: 0 var(--space-2); }
      .table { width: 100%; border-collapse: collapse; font-size: 0.84rem; }
      .table th, .table td { padding: var(--space-3) var(--space-2); text-align: left; vertical-align: middle; }
      .table thead th {
        border-bottom: 1px solid var(--color-border);
        font-family: var(--font-body); font-size: 0.68rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-ink-3); white-space: nowrap;
      }
      .table tbody tr { border-bottom: 1px solid var(--color-border); transition: background-color 140ms ease; }
      .table tbody tr:last-child { border-bottom: 0; }
      .table tbody tr:hover { background: var(--color-surface-2); }
      .table .is-numeric { text-align: right; font-variant-numeric: tabular-nums; }
      .table .is-id { font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }
      .cell-strong { display: block; font-weight: 600; }
      .cell-sub { display: block; font-size: 0.72rem; color: var(--color-ink-3); }
      .cell-date { color: var(--color-ink-2); white-space: nowrap; }
      .channel { font-size: 0.72rem; color: var(--color-ink-2); }

      .table-sort {
        display: inline-flex; align-items: center; gap: 3px;
        padding: 0; font: inherit; color: inherit; text-transform: inherit; letter-spacing: inherit;
        background: none; border: 0; cursor: pointer; transition: color 140ms ease;
      }
      .table-sort:hover { color: var(--color-ink); }
      .sort-glyph { opacity: 0.35; transition: opacity 140ms ease, transform 180ms ease; }
      .sort-glyph--on { opacity: 1; color: var(--color-accent); }

      .table-empty { padding: var(--space-6); text-align: center; color: var(--color-ink-3); }
      .table-empty .link-button { margin-left: var(--space-2); }
      .table-mobile-meta { display: none; }

      .pager { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); flex-wrap: wrap; }
      .pager__pages { display: flex; gap: 3px; }
      .pager__btn, .pager__page {
        display: inline-flex; align-items: center; gap: 4px; min-height: 32px; padding: 3px var(--space-3);
        font: inherit; font-size: 0.78rem; font-weight: 500; color: var(--color-ink-2);
        background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer;
        transition: color 140ms ease, border-color 140ms ease, background-color 140ms ease;
      }
      .pager__btn:hover:not(:disabled), .pager__page:hover { color: var(--color-ink); border-color: var(--color-border-strong); }
      .pager__btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .pager__page--on { color: #fff; background: var(--color-accent); border-color: transparent; font-weight: 600; }

      /* -- Feed ----------------------------------------------------- */
      .feed { display: grid; gap: var(--space-3); }
      .feed__item { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--space-3); }
      .feed__dot {
        width: 9px; height: 9px; margin-top: 6px; border-radius: 50%;
        background: var(--color-ink-3); box-shadow: 0 0 0 3px var(--color-surface-2);
      }
      .feed__dot--ok { background: var(--color-ok); }
      .feed__dot--info { background: var(--color-info); }
      .feed__dot--warn { background: var(--color-warn); }
      .feed__dot--muted { background: var(--color-border-strong); }
      .feed__body { display: grid; gap: 3px; min-width: 0; }
      .feed__text { font-size: 0.84rem; line-height: 1.45; }
      .feed__subject { color: var(--color-ink-2); }
      .feed__meta { display: flex; align-items: center; gap: var(--space-2); font-size: 0.7rem; color: var(--color-ink-3); }

      /* -- Badges --------------------------------------------------- */
      .badge {
        display: inline-flex; align-items: center; gap: 5px; padding: 2px var(--space-2);
        font-size: 0.7rem; font-weight: 600; white-space: nowrap;
        border: 1px solid transparent; border-radius: var(--radius-pill);
      }
      .badge__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
      .badge--success { color: var(--color-ok); background: var(--color-ok-soft); border-color: color-mix(in srgb, var(--color-ok) 26%, transparent); }
      .badge--info { color: var(--color-info); background: var(--color-info-soft); border-color: color-mix(in srgb, var(--color-info) 26%, transparent); }
      .badge--warn { color: var(--color-warn); background: var(--color-warn-soft); border-color: color-mix(in srgb, var(--color-warn) 26%, transparent); }
      .badge--danger { color: var(--color-danger); background: var(--color-danger-soft); border-color: color-mix(in srgb, var(--color-danger) 26%, transparent); }
      .badge--muted { color: var(--color-ink-3); background: var(--color-surface-2); border-color: var(--color-border); }

      /* -- Footer --------------------------------------------------- */
      .content__foot { display: grid; gap: var(--space-1); padding-top: var(--space-4); border-top: 1px solid var(--color-border); font-size: 0.74rem; color: var(--color-ink-3); }
      .content__foot-note { font-style: italic; }

      /* -- Animations ----------------------------------------------- */
      @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes drop-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
      @keyframes tip-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slide-in { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: none; } }

      .sidebar__nav .nav-section:nth-child(2) { animation: slide-in 320ms ease backwards 60ms; }
      .kpi { animation: rise-in 340ms ease backwards; }
      .kpis .kpi:nth-child(2) { animation-delay: 60ms; }
      .kpis .kpi:nth-child(3) { animation-delay: 120ms; }
      .kpis .kpi:nth-child(4) { animation-delay: 180ms; }

      @keyframes rise-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

      /* -- Responsive ----------------------------------------------- */
      @media (max-width: 1180px) {
        .grid-2 { grid-template-columns: minmax(0, 1fr); }
      }

      @media (max-width: 1023px) {
        .shell { grid-template-columns: minmax(0, 1fr); }
        .shell--collapsed { grid-template-columns: minmax(0, 1fr); }

        .sidebar {
          position: fixed; top: 0; left: 0; bottom: 0; width: var(--rail); height: 100dvh;
          transform: translateX(-100%); visibility: hidden; box-shadow: var(--shadow-3);
          transition: transform 280ms cubic-bezier(0.3, 0.8, 0.3, 1), visibility 0s linear 280ms;
        }
        .sidebar--open { transform: translateX(0); visibility: visible; transition: transform 280ms cubic-bezier(0.3, 0.8, 0.3, 1); }

        /* The rail mode is a desktop affordance, so it does not apply in the drawer. */
        .sidebar--collapsed .sidebar__name,
        .sidebar--collapsed .nav-section__title,
        .sidebar--collapsed .nav-item__label,
        .sidebar--collapsed .nav-item__badge,
        .sidebar--collapsed .sidebar__user-text { display: revert; }
        .sidebar--collapsed .nav-item,
        .sidebar--collapsed .sidebar__collapse { justify-content: flex-start; padding-inline: var(--space-2); }
        .sidebar--collapsed .sidebar__collapse { display: none; }

        .topbar__burger { display: grid; }
        .topbar__action-label, .topbar__user-name { display: none; }
        .table .is-hidden-compact { display: none; }
        .table-mobile-meta { display: block; margin-top: 4px; }
      }

      @media (max-width: 700px) {
        .topbar { flex-wrap: wrap; }
        .topbar__search { order: 3; flex-basis: 100%; max-width: none; }
        .page-head__actions { width: 100%; justify-content: space-between; }
        .chart-card__stats { gap: var(--space-4); }
        .health { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }

      @media (max-width: 420px) {
        .kpis { grid-template-columns: minmax(0, 1fr); }
        .table-search { min-width: 100%; }
      }

      /* -- Reduced motion ------------------------------------------- */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important; animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        .shell { transition: none; }
        .sidebar { transition: transform 0.01ms !important, visibility 0s; }
      }`,
    },
    {
      path: 'App.jsx',
      content: `      import { useCallback, useEffect, useMemo, useState } from 'react';
      import Sidebar from './components/Sidebar.jsx';
      import Topbar from './components/Topbar.jsx';
      import KpiCard from './components/KpiCard.jsx';
      import DataTable from './components/DataTable.jsx';
      import RevenueChart from './components/RevenueChart.jsx';
      import { ActivityFeed, RegionBreakdown, HealthStrip } from './components/ActivityFeed.jsx';
      import { Gauge } from './components/Sparkline.jsx';
      import { useMediaQuery } from './hooks/useMediaQuery.js';
      import { KPI_SUMMARY, KPIS, ORDERS, REVENUE_SERIES, NAV_SECTIONS } from './data/mockData.js';
      import { fullCurrency } from './utils/format.js';

      const MONTHLY_TARGET = 200000;

      /** Flattens the nav sections so the topbar can name the current page. */
      const NAV_LOOKUP = NAV_SECTIONS.flatMap((section) =>
        section.items.map((item) => ({ id: item.id, label: item.label })),
      );

      export default function App() {
        const [active, setActive] = useState('dashboard');
        const [collapsed, setCollapsed] = useState(false);
        const [drawerOpen, setDrawerOpen] = useState(false);

        const isCompact = useMediaQuery('(max-width: 1023px)');
        const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

        const activeLabel = useMemo(
          () => (NAV_LOOKUP.find((item) => item.id === active) || { label: 'Dashboard' }).label,
          [active],
        );

        const lastRevenue = REVENUE_SERIES[REVENUE_SERIES.length - 1].revenue;
        const attainment = (lastRevenue / MONTHLY_TARGET) * 100;

        // Escape closes the phone drawer. Ignored on desktop, where there is no drawer.
        useEffect(() => {
          if (!drawerOpen) return undefined;
          const onKeyDown = (event) => {
            if (event.key === 'Escape') setDrawerOpen(false);
          };
          document.addEventListener('keydown', onKeyDown);
          return () => document.removeEventListener('keydown', onKeyDown);
        }, [drawerOpen]);

        // A resize across the breakpoint should not leave a hidden drawer flag behind.
        useEffect(() => {
          if (!isCompact) setDrawerOpen(false);
        }, [isCompact]);

        const closeDrawer = useCallback(() => setDrawerOpen(false), []);
        const openDrawer = useCallback(() => setDrawerOpen(true), []);
        const toggleCollapsed = useCallback(() => setCollapsed((value) => !value), []);

        return (
          <div
            className={
              'shell' +
              (collapsed ? ' shell--collapsed' : '') +
              (drawerOpen ? ' shell--drawer' : '')
            }
          >
            <a className="skip-link" href="#main">
              Skip to dashboard content
            </a>

            <Sidebar
              active={active}
              onSelect={setActive}
              collapsed={collapsed && !isCompact}
              onToggleCollapse={toggleCollapsed}
              mobileOpen={drawerOpen}
              onCloseMobile={closeDrawer}
            />

            <div className="shell__main">
              <Topbar
                activeLabel={activeLabel}
                onOpenMenu={openDrawer}
                isCompact={isCompact}
              />

              <main className="content" id="main">
                <section className="page-head" aria-labelledby="page-heading">
                  <div>
                    <h2 className="page-head__title" id="page-heading">
                      {activeLabel}
                    </h2>
                    <p className="page-head__sub">{KPI_SUMMARY}</p>
                  </div>

                  <div className="page-head__actions">
                    <Gauge percent={attainment} label="Revenue against target" />
                    <div className="page-head__meta">
                      <span className="page-head__meta-label">This month</span>
                      <strong>{fullCurrency(lastRevenue)}</strong>
                      <span className="page-head__meta-sub">against {fullCurrency(MONTHLY_TARGET)}</span>
                    </div>
                  </div>
                </section>

                <HealthStrip />

                <section className="kpis" aria-label="Key performance indicators">
                  {KPIS.map((kpi) => (
                    <KpiCard key={kpi.id} kpi={kpi} />
                  ))}
                </section>

                <div className="grid-2">
                  <RevenueChart series={REVENUE_SERIES} target={MONTHLY_TARGET} />
                  <RegionBreakdown />
                </div>

                <DataTable orders={ORDERS} isCompact={isCompact} />

                <ActivityFeed />

                <footer className="content__foot">
                  <p>
                    All figures are fixed sample data held in <code>data/mockData.js</code>. Chart geometry
                    is computed by hand in <code>components/RevenueChart.jsx</code>.
                  </p>
                  <p className="content__foot-note">
                    {reducedMotion
                      ? 'Reduced motion is on, so transitions are disabled.'
                      : 'Animations respect your system reduced-motion setting.'}
                  </p>
                </footer>
              </main>
            </div>
          </div>
        );
      }`,
    },
    {
      path: 'components/ActivityFeed.jsx',
      content: `      import { REGIONS, ACTIVITY, NAV_ICONS } from '../data/mockData.js';
      import { ShareBar } from './Sparkline.jsx';
      import { compactCurrency } from '../utils/format.js';

      const FeedGlyph = ({ name }) => (
        <svg className="feed__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d={NAV_ICONS[name]} />
        </svg>
      );

      /** The activity feed: who did what, newest first, grouped by area. */
      export function ActivityFeed() {
        return (
          <section className="panel glass" aria-labelledby="activity-heading">
            <header className="panel__head">
              <h2 className="card-title" id="activity-heading">
                Activity
              </h2>
              <button type="button" className="link-button">
                View all
                <FeedGlyph name="external" />
              </button>
            </header>

            <ol className="feed">
              {ACTIVITY.map((item) => (
                <li key={item.id} className="feed__item">
                  <span className={'feed__dot feed__dot--' + item.tone} aria-hidden="true" />

                  <div className="feed__body">
                    <p className="feed__text">
                      <strong>{item.who}</strong> {item.action}{' '}
                      <span className="feed__subject">{item.subject}</span>
                    </p>
                    <p className="feed__meta">
                      <span className="chip chip--soft">{item.group}</span>
                      <time>{item.when}</time>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        );
      }

      /** Revenue split by region, shown as share bars. */
      export function RegionBreakdown() {
        return (
          <section className="panel glass" aria-labelledby="regions-heading">
            <header className="panel__head">
              <h2 className="card-title" id="regions-heading">
                Revenue by region
              </h2>
              <p className="card-sub">Month to date</p>
            </header>

            <ul className="regions">
              {REGIONS.map((region) => (
                <li key={region.id}>
                  <ShareBar percent={region.share} label={region.label} value={compactCurrency(region.revenue)} />
                </li>
              ))}
            </ul>
          </section>
        );
      }

      /** Compact "system health" strip under the KPIs. */
      export function HealthStrip() {
        const checks = [
          { id: 'api', label: 'API p95', value: '184 ms', tone: 'ok' },
          { id: 'error', label: 'Error rate', value: '0.12%', tone: 'ok' },
          { id: 'queue', label: 'Queue depth', value: '1,204', tone: 'warn' },
          { id: 'edge', label: 'Edge health', value: 'Degraded', tone: 'bad' },
        ];

        return (
          <ul className="health">
            {checks.map((check) => (
              <li key={check.id} className={'health__item health__item--' + check.tone}>
                <span className="health__label">{check.label}</span>
                <span className="health__value">{check.value}</span>
              </li>
            ))}
          </ul>
        );
      }`,
    },
    {
      path: 'components/Badge.jsx',
      content: `      /** Status and trend badges. One component so colour and wording never drift. */

      const STATUS_TONES = {
        fulfilled: { label: 'Fulfilled', tone: 'success' },
        processing: { label: 'Processing', tone: 'info' },
        'on-hold': { label: 'On hold', tone: 'warn' },
        refunded: { label: 'Refunded', tone: 'muted' },
        failed: { label: 'Failed', tone: 'danger' },
        active: { label: 'Active', tone: 'success' },
        trialing: { label: 'Trialing', tone: 'info' },
        overdue: { label: 'Overdue', tone: 'danger' },
      };

      const DEFAULT_STATUS = { label: 'Unknown', tone: 'muted' };

      export default function Badge({ status, children, dot = false }) {
        const meta = STATUS_TONES[status] || DEFAULT_STATUS;

        return (
          <span className={'badge badge--' + meta.tone}>
            {dot ? <span className="badge__dot" aria-hidden="true" /> : null}
            {children || meta.label}
          </span>
        );
      }

      /**
       * Trend pill for a KPI. \`delta\` is a signed percentage; the arrow glyph is an
       * inline SVG rather than a character so it inherits the text colour exactly.
       */
      export function DeltaBadge({ delta, label, tone }) {
        const positive = delta >= 0;
        const direction = positive ? 'up' : 'down';
        // An explicit tone override wins; otherwise the sign decides.
        const resolved = tone || (positive ? 'success' : 'danger');

        return (
          <span className={'delta delta--' + resolved}>
            <svg className="delta__arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              {direction === 'up' ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
            </svg>
            {positive ? '+' : ''}
            {Math.abs(Math.round(delta * 10) / 10).toFixed(1)}%
            {label ? <span className="delta__label">{label}</span> : null}
            <span className="sr-only">{positive ? ' increase' : ' decrease'}</span>
          </span>
        );
      }`,
    },
    {
      path: 'components/DataTable.jsx',
      content: `      import { useMemo, useState } from 'react';
      import Badge from './Badge.jsx';
      import { formatDate, fullCurrency } from '../utils/format.js';

      const PAGE_SIZE = 6;

      /**
       * Sortable, searchable, paginated order table.
       *
       * Sorting is a single \`{ key, dir }\` object rather than two independent pieces of
       * state, which makes "sort by revenue, ascending" one update instead of two, and
       * removes the possibility of key and direction disagreeing.
       *
       * \`null\` in the sort map means the column is not sortable.
       */
      const COLUMNS = [
        { key: 'id', label: 'Order', sortable: true },
        { key: 'customer', label: 'Customer', sortable: true },
        { key: 'total', label: 'Value', sortable: true, numeric: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'placed', label: 'Placed', sortable: true },
        { key: 'channel', label: 'Channel', sortable: true },
      ];

      const COMPARATORS = {
        id: (a, b) => a.id.localeCompare(b.id),
        customer: (a, b) => a.customer.localeCompare(b.customer),
        total: (a, b) => a.total - b.total,
        status: (a, b) => a.status.localeCompare(b.status),
        placed: (a, b) => a.placed.localeCompare(b.placed),
        channel: (a, b) => a.channel.localeCompare(b.channel),
      };

      const SortGlyph = ({ active, dir }) => (
        <svg className={'sort-glyph' + (active ? ' sort-glyph--on' : '')} width="12" height="12" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true" focusable="false">
          {active && dir === 'desc' ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
        </svg>
      );

      export default function DataTable({ orders, isCompact }) {
        const [query, setQuery] = useState('');
        const [sort, setSort] = useState({ key: 'placed', dir: 'desc' });
        const [page, setPage] = useState(1);

        const filtered = useMemo(() => {
          const needle = query.trim().toLowerCase();
          const base = needle
            ? orders.filter((order) =>
                (order.id + ' ' + order.customer + ' ' + order.country + ' ' + order.email + ' ' + order.channel)
                  .toLowerCase()
                  .indexOf(needle) !== -1,
              )
            : orders;

          const comparator = COMPARATORS[sort.key] || COMPARATORS.placed;
          const sorted = base.slice().sort(comparator);
          return sort.dir === 'desc' ? sorted.reverse() : sorted;
        }, [orders, query, sort]);

        const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

        // A filter can shrink the result set under the current page number.
        const safePage = Math.min(page, pageCount);
        const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

        const toggleSort = (key) => {
          setPage(1);
          setSort((current) => {
            if (current.key !== key) return { key, dir: 'asc' };
            if (current.dir === 'asc') return { key, dir: 'desc' };
            return { key: 'placed', dir: 'desc' };
          });
        };

        const ariaSort = (key) => {
          if (sort.key !== key) return 'none';
          return sort.dir === 'asc' ? 'ascending' : 'descending';
        };

        const totalValue = filtered.reduce((sum, order) => sum + order.total, 0);

        return (
          <section className="table-card glass" aria-labelledby="orders-heading">
            <header className="table-card__head">
              <div>
                <h2 className="card-title" id="orders-heading">
                  Recent orders
                </h2>
                <p className="card-sub">
                  {filtered.length} of {orders.length} orders &middot; {fullCurrency(totalValue)} in value
                </p>
              </div>

              <div className="table-search">
                <label className="sr-only" htmlFor="orders-search">
                  Search orders
                </label>
                <svg className="table-search__icon" width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true" focusable="false">
                  <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3" />
                </svg>
                <input
                  id="orders-search"
                  className="input"
                  type="search"
                  value={query}
                  placeholder="Order, customer or email"
                  autoComplete="off"
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                />
                {query ? (
                  <button type="button" className="table-search__clear" onClick={() => setQuery('')} aria-label="Clear order search">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" aria-hidden="true" focusable="false">
                      <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  </button>
                ) : null}
              </div>
            </header>

            <div className="table-scroll">
              <table className="table">
                <caption className="sr-only">
                  Recent orders, sortable. {filtered.length} rows match the current filter.
                </caption>
                <thead>
                  <tr>
                    {COLUMNS.map((column) => (
                      <th
                        key={column.key}
                        scope="col"
                        aria-sort={ariaSort(column.key)}
                        className={column.numeric ? 'is-numeric' : undefined}
                      >
                        <button type="button" className="table-sort" onClick={() => toggleSort(column.key)}>
                          {column.label}
                          <SortGlyph active={sort.key === column.key} dir={sort.dir} />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {visible.length === 0 ? (
                    <tr>
                      <td className="table-empty" colSpan={COLUMNS.length}>
                        No order matches &ldquo;{query}&rdquo;.
                        <button type="button" className="link-button" onClick={() => setQuery('')}>
                          Clear the filter
                        </button>
                      </td>
                    </tr>
                  ) : (
                    visible.map((order) => (
                      <tr key={order.id}>
                        <th scope="row" className="is-id">
                          {order.id}
                          <span className="table-mobile-meta">
                            <Badge status={order.status} />
                          </span>
                        </th>
                        <td>
                          <span className="cell-strong">{order.customer}</span>
                          <span className="cell-sub">
                            {order.country} &middot; {order.items} items
                          </span>
                        </td>
                        <td className="is-numeric">{fullCurrency(order.total)}</td>
                        <td className={isCompact ? 'is-hidden-compact' : undefined}>
                          <Badge status={order.status} dot />
                        </td>
                        <td className="cell-date">{formatDate(order.placed)}</td>
                        <td className="is-hidden-compact">
                          <span className="channel">{order.channel}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <nav className="pager" aria-label="Order pages">
              <button
                type="button"
                className="pager__btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                aria-label="Previous page"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Prev
              </button>

              <ol className="pager__pages">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                  <li key={n}>
                    <button
                      type="button"
                      className={'pager__page' + (n === safePage ? ' pager__page--on' : '')}
                      aria-current={n === safePage ? 'page' : undefined}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  </li>
                ))}
              </ol>

              <button
                type="button"
                className="pager__btn"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={safePage === pageCount}
                aria-label="Next page"
              >
                Next
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </nav>
          </section>
        );
      }`,
    },
    {
      path: 'components/KpiCard.jsx',
      content: `      import Sparkline from './Sparkline.jsx';
      import { DeltaBadge } from './Badge.jsx';
      import { formatKpi } from '../utils/format.js';

      /**
       * One KPI tile: label, headline value, trend delta, sparkline and a caption.
       *
       * The whole tile is an \`<article>\` rather than a button - nothing in it is
       * independently clickable yet, and pretending otherwise would be a lie to a
       * screen reader.
       */
      export default function KpiCard({ kpi }) {
        const tone = kpi.delta >= 0 ? 'accent' : 'warn';

        return (
          <article className={'kpi kpi--' + tone} aria-labelledby={'kpi-' + kpi.id}>
            <header className="kpi__head">
              <h3 className="kpi__label" id={'kpi-' + kpi.id}>
                {kpi.label}
              </h3>
              <DeltaBadge delta={kpi.delta} label={kpi.deltaLabel} />
            </header>

            <p className="kpi__value">{formatKpi(kpi.format, kpi.value)}</p>

            <div className="kpi__spark">
              <Sparkline series={kpi.series} tone={tone} label={kpi.label + ', last twelve months'} />
            </div>

            <p className="kpi__note">{kpi.note}</p>
          </article>
        );
      }`,
    },
    {
      path: 'components/RevenueChart.jsx',
      content: `      import { useMemo, useRef, useState } from 'react';
      import { compactCurrency, niceMax, fullCurrency } from '../utils/format.js';

      /**
       * Revenue area chart.
       *
       * Every coordinate is worked out by hand - there is no charting library here.
       *
       *   viewBox is a fixed 720x300 user-unit space, so the SVG scales to its
       *   container with no resize listener and no measured pixel width.
       *
       *   The y scale is linear: \`y = PAD_TOP + (1 - v / ceiling) * PLOT_H\`.
       *   \`ceiling\` is the raw max rounded up to a round number by \`niceMax\`, so the
       *   four gridlines land on 100k / 200k / 300k rather than 247,318.
       *
       *   The x scale is \`PAD_LEFT + i * step\`, with \`step = PLOT_W / (n - 1)\`.
       *
       *   Hovering reads the nearest index by converting the pointer position back
       *   into user units and dividing by \`step\`, then rounding. That works without
       *   knowing the rendered size of the SVG, which is the point.
       *
       * The tooltip is drawn inside the SVG so its position is a \`transform\` attribute
       * rather than an inline percentage.
       */

      const W = 720;
      const H = 300;
      const PAD_TOP = 22;
      const PAD_BOTTOM = 40;
      const PAD_LEFT = 56;
      const PAD_RIGHT = 18;

      const PLOT_W = W - PAD_LEFT - PAD_RIGHT;
      const PLOT_H = H - PAD_TOP - PAD_BOTTOM;

      const TIPS_W = 176;
      const TIPS_H = 78;

      const Tip = ({ point, index, series }) => (
        <g className="chart-tip" transform={'translate(' + point.tipX + ' ' + point.tipY + ')'}>
          <rect className="chart-tip__bg" width={TIPS_W} height={TIPS_H} rx="10" />
          <text className="chart-tip__month" x={14} y={21}>
            {series[index].label} {series[index].key.slice(0, 4)}
          </text>
          <text className="chart-tip__value" x={14} y={45}>
            {fullCurrency(series[index].revenue)}
          </text>
          <text className="chart-tip__meta" x={14} y={64}>
            {series[index].orders.toLocaleString('en-GB')} orders
          </text>
        </g>
      );

      export default function RevenueChart({ series, target }) {
        const [hover, setHover] = useState(null);
        const svgRef = useRef(null);

        const chart = useMemo(() => {
          const values = series.map((row) => row.revenue);
          const ceiling = niceMax(Math.max(...values, target) * 1.08);
          const step = PLOT_W / (values.length - 1);

          const xFor = (i) => PAD_LEFT + i * step;
          const yFor = (v) => PAD_TOP + (1 - v / ceiling) * PLOT_H;

          const line = series.map((row, i) => xFor(i).toFixed(2) + ',' + yFor(row.revenue).toFixed(2));

          const area =
            'M ' + xFor(0).toFixed(2) + ' ' + (PAD_TOP + PLOT_H).toFixed(2) +
            ' L ' + line.join(' L ') +
            ' L ' + xFor(values.length - 1).toFixed(2) + ' ' + (PAD_TOP + PLOT_H).toFixed(2) +
            ' Z';

          // Four evenly spaced gridlines, labelled from the ceiling downwards.
          const ticks = [];
          const count = 4;
          for (let i = 0; i <= count; i++) {
            const value = (ceiling / count) * i;
            ticks.push({ value, y: yFor(value) });
          }

          const points = series.map((row, i) => ({
            i,
            cx: xFor(i),
            cy: yFor(row.revenue),
            revenue: row.revenue,
          }));

          return {
            ceiling,
            step,
            line: line.join(' '),
            area,
            ticks,
            points,
            targetY: yFor(target),
            xFor,
            yFor,
          };
        }, [series, target]);

        /** Maps a pointer event into the nearest data index. */
        const onPointerMove = (event) => {
          const node = svgRef.current;
          if (!node) return;

          const rect = node.getBoundingClientRect();
          if (!rect || rect.width === 0) return;

          // Rendered pixels -> user units, then -> a data index.
          const userX = ((event.clientX - rect.left) / rect.width) * W;
          const index = Math.round((userX - PAD_LEFT) / chart.step);
          setHover(index >= 0 && index < chart.points.length ? index : null);
        };

        const active = hover === null ? null : chart.points[hover];

        // Keep the tooltip inside the plot: flip it left near the right edge, and
        // below the point when the point sits high.
        const tipGeometry = active
          ? {
              tipX: Math.max(PAD_LEFT - 30, Math.min(W - PAD_RIGHT - TIPS_W, active.cx - TIPS_W / 2)),
              tipY: active.cy < TIPS_H + 16 ? active.cy + 14 : active.cy - TIPS_H - 12,
            }
          : null;

        const reached = series[series.length - 1].revenue >= target;
        const attainment = (series[series.length - 1].revenue / target) * 100;

        return (
          <section className="chart-card glass" aria-labelledby="revenue-heading">
            <header className="chart-card__head">
              <div>
                <h2 className="card-title" id="revenue-heading">
                  Revenue, last twelve months
                </h2>
                <p className="card-sub">Net of refunds. Target line is the board-approved 200k.</p>
              </div>

              <dl className="chart-card__stats">
                <div>
                  <dt>Attainment</dt>
                  <dd>{Math.round(attainment)}%</dd>
                </div>
                <div>
                  <dt>vs target</dt>
                  <dd className={reached ? 'is-good' : 'is-bad'}>
                    {reached ? 'Ahead' : 'Behind'} by{' '}
                    {compactCurrency(Math.abs(series[series.length - 1].revenue - target))}
                  </dd>
                </div>
              </dl>
            </header>

            <div className="chart-wrap">
              <svg
                ref={svgRef}
                className="chart"
                viewBox={'0 0 ' + W + ' ' + H}
                role="img"
                aria-label={
                  'Area chart of monthly revenue for the last twelve months, rising from ' +
                  fullCurrency(series[0].revenue) + ' to ' + fullCurrency(series[series.length - 1].revenue)
                }
                onPointerMove={onPointerMove}
                onPointerLeave={() => setHover(null)}
              >
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-line)" stopOpacity="0.34" />
                    <stop offset="100%" stopColor="var(--chart-line)" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {chart.ticks.map((tick) => (
                  <g key={tick.value}>
                    <line className="chart-grid" x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={tick.y} y2={tick.y} />
                    <text className="chart-ylabel" x={PAD_LEFT - 10} y={tick.y + 4} textAnchor="end">
                      {compactCurrency(tick.value)}
                    </text>
                  </g>
                ))}

                <line className="chart-target" x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={chart.targetY} y2={chart.targetY} />
                <text className="chart-target__label" x={W - PAD_RIGHT} y={chart.targetY - 6} textAnchor="end">
                  Target
                </text>

                <path className="chart-area" d={chart.area} fill="url(#revenueFill)" />
                <polyline className="chart-line" points={chart.line} fill="none" />

                {/* Hover band, drawn behind the markers. */}
                {active ? (
                  <line className="chart-cursor" x1={active.cx} x2={active.cx} y1={PAD_TOP} y2={PAD_TOP + PLOT_H} />
                ) : null}

                {chart.points.map((point) => (
                  <circle
                    key={point.i}
                    className={'chart-dot' + (hover === point.i ? ' chart-dot--on' : '')}
                    cx={point.cx}
                    cy={point.cy}
                    r={hover === point.i ? 5.5 : 3}
                  />
                ))}

                {series.map((row, i) => (
                  <text
                    key={row.key}
                    className="chart-xlabel"
                    x={chart.xFor(i)}
                    y={H - PAD_BOTTOM + 20}
                    textAnchor="middle"
                  >
                    {row.short}
                  </text>
                ))}

                {active && tipGeometry ? <Tip point={tipGeometry} index={hover} series={series} /> : null}
              </svg>

              <p className="sr-only" role="status" aria-live="polite">
                {active
                  ? series[hover].label + ': ' + fullCurrency(active.revenue) + ', ' + series[hover].orders + ' orders'
                  : ''}
              </p>
            </div>

            <p className="chart-card__foot">
              Hover the plot for the exact figure. Peak was{' '}
              {fullCurrency(Math.max(...series.map((row) => row.revenue)))} in{' '}
              {series.find((row) => row.revenue === Math.max(...series.map((r) => r.revenue))).label}.
            </p>
          </section>
        );
      }`,
    },
    {
      path: 'components/Sidebar.jsx',
      content: `      /** Sidebar: brand, collapsible nav sections, and the signed-in account block. */

      import { NAV_SECTIONS, NAV_ICONS } from '../data/mockData.js';

      const Glyph = ({ name, size = 17 }) => (
        <svg className="nav-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d={NAV_ICONS[name] || NAV_ICONS.chart} />
        </svg>
      );

      /**
       * @param {object} props
       * @param {string} props.active     currently selected nav id
       * @param {boolean} props.collapsed desktop icon-rail mode
       * @param {boolean} props.mobileOpen phone drawer mode
       */
      export default function Sidebar({ active, onSelect, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
        return (
          <>
            {/*
              Scrim behind the phone drawer. It is a real button so that tapping the
              scrim is reachable by keyboard as well as by touch, and it carries the
              accessible name rather than relying on the icon.
            */}
            {mobileOpen ? (
              <button type="button" className="scrim" aria-label="Close navigation" onClick={onCloseMobile} />
            ) : null}

            <aside
              className={'sidebar' + (collapsed ? ' sidebar--collapsed' : '') + (mobileOpen ? ' sidebar--open' : '')}
              aria-label="Primary"
              id="sidebar"
            >
              <div className="sidebar__brand">
                <span className="sidebar__mark" aria-hidden="true">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
                    strokeLinecap="round" strokeLinejoin="round" focusable="false">
                    <path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5" />
                  </svg>
                </span>
                <span className="sidebar__name">
                  <strong>Meridian</strong>
                  <small>Commerce ops</small>
                </span>
              </div>

              <nav className="sidebar__nav" aria-label="Sections">
                {NAV_SECTIONS.map((section) => (
                  <div className="nav-section" key={section.id}>
                    <h2 className="nav-section__title">{section.label}</h2>
                    <ul className="nav-list">
                      {section.items.map((item) => {
                        const on = item.id === active;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              className={'nav-item' + (on ? ' nav-item--on' : '')}
                              aria-current={on ? 'page' : undefined}
                              onClick={() => {
                                onSelect(item.id);
                                onCloseMobile();
                              }}
                              title={collapsed ? item.label : undefined}
                            >
                              <Glyph name={item.icon} />
                              <span className="nav-item__label">{item.label}</span>
                              {item.badge ? <span className="nav-item__badge">{item.badge}</span> : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </nav>

              <div className="sidebar__foot">
                <div className="sidebar__user">
                  <span className="avatar" aria-hidden="true">FO</span>
                  <span className="sidebar__user-text">
                    <strong>Frances Okoye</strong>
                    <small>Operations lead</small>
                  </span>
                </div>

                <button
                  type="button"
                  className="sidebar__collapse"
                  onClick={onToggleCollapse}
                  aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  aria-expanded={!collapsed}
                  aria-controls="sidebar"
                >
                  <svg className={'nav-icon' + (collapsed ? ' is-flipped' : '')} width="17" height="17" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true" focusable="false">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  <span className="sidebar__collapse-text">Collapse</span>
                </button>
              </div>
            </aside>
          </>
        );
      }`,
    },
    {
      path: 'components/Sparkline.jsx',
      content: `      import { niceMax, clamp } from '../utils/format.js';

      /**
       * Sparkline for a KPI card.
       *
       * A minimal area chart: min/max are taken from the series, scaled into a 100x28
       * user-unit box, and emitted as a \`<polyline>\` plus a closed \`<path>\` for the
       * fill. The gradient id includes the title so several cards can coexist.
       */
      export default function Sparkline({ series, tone = 'accent', label }) {
        if (!series || series.length < 2) return null;

        const W = 100;
        const H = 28;
        const PAD = 2;

        const rawMin = Math.min(...series);
        const rawMax = Math.max(...series);
        // A flat series would divide by zero; give it a nominal band instead.
        const span = rawMax - rawMin || 1;

        const xFor = (i) => PAD + (i / (series.length - 1)) * (W - PAD * 2);
        const yFor = (v) => H - PAD - ((v - rawMin) / span) * (H - PAD * 2);

        const points = series.map((value, i) => xFor(i).toFixed(2) + ',' + yFor(value).toFixed(2));
        const areaPath =
          'M ' + xFor(0).toFixed(2) + ' ' + H +
          ' L ' + points.join(' L ') +
          ' L ' + xFor(series.length - 1).toFixed(2) + ' ' + H + ' Z';

        const lastX = xFor(series.length - 1);
        const lastY = yFor(series[series.length - 1]);

        return (
          <svg
            className={'spark spark--' + tone}
            viewBox={'0 0 ' + W + ' ' + H}
            preserveAspectRatio="none"
            role="img"
            aria-label={label}
          >
            <defs>
              <linearGradient id={'sparkFill-' + tone} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path d={areaPath} fill={'url(#sparkFill-' + tone + ')'} />
            <polyline points={points.join(' ')} fill="none" stroke="currentColor" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <circle className="spark__dot" cx={lastX} cy={lastY} r="1.8" vectorEffect="non-scaling-stroke" />
          </svg>
        );
      }

      /**
       * Horizontal share bar, used in the region breakdown.
       * Width comes from a native \`<progress>\` so no inline style is needed.
       */
      export function ShareBar({ percent, label, value }) {
        return (
          <div className="share">
            <div className="share__head">
              <span className="share__label">{label}</span>
              <span className="share__value">{value}</span>
            </div>
            <progress className="share__bar" max={100} value={clamp(percent, 0, 100)}
              aria-label={label + ': ' + percent + ' percent of revenue'} />
          </div>
        );
      }

      /**
       * Radial gauge used for one KPI. The arc is drawn with \`stroke-dasharray\` on a
       * \`pathLength\`-normalised circle, so the sweep is a pair of attributes.
       */
      export function Gauge({ percent, size = 54, stroke = 6, label }) {
        const R = (size - stroke) / 2;
        const C = 2 * Math.PI * R;

        return (
          <svg
            className="gauge"
            width={size}
            height={size}
            viewBox={'0 0 ' + size + ' ' + size}
            role="img"
            aria-label={label + ': ' + Math.round(percent) + ' percent of monthly target'}
          >
            <circle className="gauge__track" cx={size / 2} cy={size / 2} r={R} strokeWidth={stroke} fill="none" />
            <circle
              className="gauge__value"
              cx={size / 2}
              cy={size / 2}
              r={R}
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray="100"
              strokeDashoffset={String(100 - clamp(percent, 0, 100))}
              transform={'rotate(-90 ' + size / 2 + ' ' + size / 2 + ')'}
            />
            <text className="gauge__text" x="50%" y="50%" textAnchor="middle" dy="0.35em">
              {Math.round(percent)}%
            </text>
          </svg>
        );
      }

      /** Axis-bound helper re-exported for the main chart. */
      export { niceMax };`,
    },
    {
      path: 'components/Topbar.jsx',
      content: `      import { useEffect, useRef, useState } from 'react';
      import { NAV_ICONS } from '../data/mockData.js';

      const Glyph = ({ name, size = 17 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d={NAV_ICONS[name] || NAV_ICONS.chart} />
        </svg>
      );

      const NOTIFICATIONS = [
        { id: 'n1', tone: 'warn', title: 'Checkout conversion down 0.6 points', meta: 'Analytics · 2 hours ago' },
        { id: 'n2', tone: 'danger', title: 'Frankfurt edge returning 502s', meta: 'Infrastructure · 34 minutes ago' },
        { id: 'n3', tone: 'info', title: 'Release 2026.03.4 deployed', meta: 'Deploy bot · 48 minutes ago' },
        { id: 'n4', tone: 'ok', title: 'Kessler order awaiting approval', meta: 'Orders · 12 minutes ago' },
      ];

      const USER_MENU = [
        { id: 'profile', label: 'Profile', icon: 'sliders' },
        { id: 'billing', label: 'Billing', icon: 'database' },
        { id: 'docs', label: 'Documentation', icon: 'external' },
        { id: 'signout', label: 'Sign out', icon: 'logout' },
      ];

      /**
       * A dropdown primitive, written once and used twice.
       *
       * Both dropdowns close on Escape and on outside click, return focus to their
       * trigger, and expose \`aria-expanded\` / \`aria-controls\` correctly. That is the
       * behaviour a menu button owes its user, and hand-rolling it once avoids two
       * subtly different copies.
       */
      function Dropdown({ id, label, button, children, align = 'right' }) {
        const [open, setOpen] = useState(false);
        const wrapRef = useRef(null);
        const triggerRef = useRef(null);

        useEffect(() => {
          if (!open) return undefined;

          const onDocumentClick = (event) => {
            if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
          };
          const onKeyDown = (event) => {
            if (event.key !== 'Escape') return;
            setOpen(false);
            if (triggerRef.current) triggerRef.current.focus();
          };

          document.addEventListener('mousedown', onDocumentClick);
          document.addEventListener('keydown', onKeyDown);
          return () => {
            document.removeEventListener('mousedown', onDocumentClick);
            document.removeEventListener('keydown', onKeyDown);
          };
        }, [open]);

        return (
          <div className={'dropdown dropdown--' + align} ref={wrapRef}>
            <button
              ref={triggerRef}
              type="button"
              className={'topbar__trigger' + (open ? ' topbar__trigger--on' : '')}
              aria-expanded={open}
              aria-controls={id}
              aria-haspopup="true"
              onClick={() => setOpen((value) => !value)}
            >
              {button}
            </button>

            {open ? (
              <div className="dropdown__panel" id={id} role="menu" aria-label={label}>
                {children}
              </div>
            ) : null}
          </div>
        );
      }

      export default function Topbar({ activeLabel, onOpenMenu, isCompact }) {
        const [term, setTerm] = useState('');

        return (
          <header className="topbar">
            <div className="topbar__left">
              <button
                type="button"
                className="topbar__icon-btn topbar__burger"
                onClick={onOpenMenu}
                aria-label="Open navigation"
                aria-controls="sidebar"
                aria-expanded={undefined}
              >
                <Glyph name="menu" size={19} />
              </button>

              <div className="topbar__titles">
                <p className="topbar__crumb">Meridian Commerce</p>
                <h1 className="topbar__title">{activeLabel}</h1>
              </div>
            </div>

            <div className="topbar__search">
              <label className="sr-only" htmlFor="global-search">
                Search orders, customers and invoices
              </label>
              <svg className="topbar__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3" />
              </svg>
              <input
                id="global-search"
                className="input"
                type="search"
                value={term}
                placeholder={isCompact ? 'Search' : 'Search orders, customers, invoices'}
                autoComplete="off"
                onChange={(event) => setTerm(event.target.value)}
              />
              {term ? (
                <button type="button" className="topbar__search-clear" onClick={() => setTerm('')} aria-label="Clear search">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" aria-hidden="true" focusable="false">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              ) : null}
            </div>

            <div className="topbar__actions">
              <Dropdown
                id="notif-menu"
                label="Notifications"
                button={
                  <>
                    <Glyph name="bell" />
                    <span className="topbar__action-label">Alerts</span>
                    <span className="dot-badge" aria-hidden="true">4</span>
                    <span className="sr-only">, 4 unread notifications</span>
                  </>
                }
              >
                <p className="dropdown__head">
                  Notifications
                  <span className="dropdown__count">4 new</span>
                </p>
                <ul className="notif-list">
                  {NOTIFICATIONS.map((item) => (
                    <li key={item.id}>
                      <button type="button" className="notif" role="menuitem">
                        <span className={'notif__dot notif__dot--' + item.tone} aria-hidden="true" />
                        <span className="notif__text">
                          <span className="notif__title">{item.title}</span>
                          <span className="notif__meta">{item.meta}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Dropdown>

              <Dropdown
                id="user-menu"
                label="Account"
                button={
                  <>
                    <span className="avatar avatar--sm" aria-hidden="true">FO</span>
                    <span className="topbar__user-name">Frances</span>
                    <svg className="topbar__chevron" width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      aria-hidden="true" focusable="false">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </>
                }
              >
                <p className="dropdown__head">Signed in as Frances Okoye</p>
                <ul className="menu-list">
                  {USER_MENU.map((item) => (
                    <li key={item.id}>
                      <button type="button" className={'menu-item' + (item.id === 'signout' ? ' menu-item--warn' : '')} role="menuitem">
                        <Glyph name={item.icon} size={16} />
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </Dropdown>
            </div>
          </header>
        );
      }`,
    },
    {
      path: 'data/mockData.js',
      content: `      /**
       * Mock data for the admin dashboard.
       *
       * Fixed, hand-written values with real names and dates. Nothing is random at
       * runtime, so the table, the chart and the feed always agree with each other.
       */

      const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      /** Twelve months of trading figures ending in the current month. */
      const monthLabels = () => {
        const out = [];
        const now = new Date();
        for (let back = 11; back >= 0; back--) {
          const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
          out.push({
            key: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'),
            label: MONTHS[d.getMonth()],
            short: MONTHS[d.getMonth()].slice(0, 1) + d.getMonth(),
          });
        }
        return out;
      };

      /** Gross revenue, in whole pounds, per month. */
      const REVENUE = [128400, 134900, 141250, 139800, 152600, 168300, 161900, 174500, 188200, 196400, 209700, 224800];
      const TARGET = 200000;

      export const REVENUE_SERIES = monthLabels().map((month, i) => ({
        ...month,
        revenue: REVENUE[i],
        target: TARGET,
        orders: Math.round(REVENUE[i] / 268),
      }));

      /** Daily revenue for the last fourteen days, for the KPI sparklines. */
      export const DAILY = [
        { day: 'Mon', value: 6180 }, { day: 'Tue', value: 7240 }, { day: 'Wed', value: 5910 },
        { day: 'Thu', value: 8020 }, { day: 'Fri', value: 9340 }, { day: 'Sat', value: 4120 },
        { day: 'Sun', value: 3860 }, { day: 'Mon', value: 6510 }, { day: 'Tue', value: 7690 },
        { day: 'Wed', value: 6350 }, { day: 'Thu', value: 8480 }, { day: 'Fri', value: 9970 },
        { day: 'Sat', value: 4480 }, { day: 'Sun', value: 4010 },
      ];

      /** Headline KPIs. \`delta\` is the change against the previous 30 days. */
      export const KPIS = [
        {
          id: 'revenue',
          label: 'Gross revenue',
          value: 224800,
          format: 'currency',
          delta: 7.2,
          deltaLabel: 'vs last month',
          series: REVENUE.map((row) => row.revenue),
          tone: 'up',
          note: 'Best month since the series began.',
        },
        {
          id: 'orders',
          label: 'Orders',
          value: 838,
          format: 'number',
          delta: 4.8,
          deltaLabel: 'vs last month',
          series: DAILY.map((row) => row.value),
          tone: 'up',
          note: 'Average basket 268.26.',
        },
        {
          id: 'conversion',
          label: 'Conversion rate',
          value: 3.42,
          format: 'percent',
          delta: -0.6,
          deltaLabel: 'vs last month',
          series: [3.9, 3.7, 3.8, 3.6, 3.5, 3.7, 3.4, 3.3, 3.5, 3.4, 3.3, 3.42],
          tone: 'down',
          note: 'Checkout A/B test reached significance on the 14th.',
        },
        {
          id: 'active',
          label: 'Active accounts',
          value: 6421,
          format: 'number',
          delta: 11.9,
          deltaLabel: 'vs last month',
          series: [4980, 5120, 5290, 5410, 5580, 5740, 5890, 6010, 6120, 6240, 6330, 6421],
          tone: 'up',
          note: 'Two enterprise accounts onboarded in Lyon.',
        },
      ];

      /** Regions, used by the revenue chart's breakdown and the feed. */
      export const REGIONS = [
        { id: 'uk', label: 'United Kingdom', share: 38, revenue: 85424 },
        { id: 'de', label: 'Germany', share: 22, revenue: 49456 },
        { id: 'us', label: 'United States', share: 17, revenue: 38216 },
        { id: 'fr', label: 'France', share: 12, revenue: 26976 },
        { id: 'nl', label: 'Netherlands', share: 7, revenue: 15736 },
        { id: 'other', label: 'Rest of world', share: 4, revenue: 8992 },
      ];

      /** One-line summary shown under the page heading. */
      export const KPI_SUMMARY =
        'Trading day 22 of March 2026. Revenue is tracking 12% ahead of the twelve-month average.';

      /** The order table. Statuses drive the badge colours. */
      export const ORDERS = [
        { id: 'GB-48219', customer: 'Harbour Logistics Ltd', country: 'United Kingdom', email: 'ap@harbourlogistics.co.uk', total: 14820, items: 34, status: 'fulfilled', placed: '2026-03-18', channel: 'Direct' },
        { id: 'GB-48218', customer: 'Ravensworth Dental', country: 'United Kingdom', email: 'orders@ravensworthdental.co.uk', total: 6120, items: 11, status: 'processing', placed: '2026-03-18', channel: 'Partner' },
        { id: 'DE-11907', customer: 'Brenner Werkzeug GmbH', country: 'Germany', email: 'kontakt@brenner-werkzeug.de', total: 22450, items: 58, status: 'fulfilled', placed: '2026-03-17', channel: 'Direct' },
        { id: 'US-90442', customer: 'Cedarline Manufacturing', country: 'United States', email: 'purchasing@cedarline-mfg.com', total: 9875, items: 19, status: 'refunded', placed: '2026-03-17', channel: 'Marketplace' },
        { id: 'FR-03418', customer: 'Atelier Rive Gauche', country: 'France', email: 'contact@atelierrivegauche.fr', total: 3410, items: 7, status: 'fulfilled', placed: '2026-03-16', channel: 'Direct' },
        { id: 'GB-48214', customer: 'Northgate Academy Trust', country: 'United Kingdom', email: 'it@northgate-academy.org.uk', total: 19760, items: 42, status: 'on-hold', placed: '2026-03-16', channel: 'Partner' },
        { id: 'NL-07721', customer: 'Van Doorn Transport BV', country: 'Netherlands', email: 'inkoop@vandoorntransport.nl', total: 8730, items: 15, status: 'processing', placed: '2026-03-15', channel: 'Direct' },
        { id: 'GB-48211', customer: 'Saltmarsh Fisheries', country: 'United Kingdom', email: 'admin@saltmarshfisheries.co.uk', total: 1290, items: 4, status: 'fulfilled', placed: '2026-03-15', channel: 'Direct' },
        { id: 'DE-11901', customer: 'Kessler Feinmechanik AG', country: 'Germany', email: 'einkauf@kessler-feinmechanik.de', total: 31200, items: 73, status: 'processing', placed: '2026-03-14', channel: 'Partner' },
        { id: 'US-90428', customer: 'Fairhaven Clinic Group', country: 'United States', email: 'billing@fairhavenclinic.com', total: 15340, items: 26, status: 'fulfilled', placed: '2026-03-14', channel: 'Direct' },
        { id: 'FR-03410', customer: 'Compagnie du Vent', country: 'France', email: 'achats@compagnieduvent.fr', total: 5620, items: 9, status: 'refunded', placed: '2026-03-13', channel: 'Marketplace' },
        { id: 'GB-48204', customer: 'Wrenfield Care Homes', country: 'United Kingdom', email: 'procurement@wrenfieldcare.co.uk', total: 26840, items: 61, status: 'fulfilled', placed: '2026-03-13', channel: 'Partner' },
      ];

      /** Activity feed. \`tone\` decides the dot colour. */
      export const ACTIVITY = [
        { id: 'a1', tone: 'ok', who: 'Priya Raman', action: 'approved', subject: 'the 8,200-unit purchase order for Kessler Feinmechanik', when: '12 minutes ago', group: 'Orders' },
        { id: 'a2', tone: 'info', who: 'Deploy bot', action: 'shipped', subject: 'release 2026.03.4 to production', when: '48 minutes ago', group: 'Releases' },
        { id: 'a3', tone: 'warn', who: 'Marcus Feld', action: 'flagged', subject: 'checkout conversion down 0.6 points against last month', when: '2 hours ago', group: 'Analytics' },
        { id: 'a4', tone: 'info', who: 'Sofia Almeida', action: 'added', subject: 'Van Doorn Transport BV to the partner tier', when: '4 hours ago', group: 'Accounts' },
        { id: 'a5', tone: 'ok', who: 'Ines Okonkwo', action: 'refunded', subject: 'US-90442 to Cedarline Manufacturing, 987.50 returned', when: '6 hours ago', group: 'Orders' },
        { id: 'a6', tone: 'muted', who: 'Liam Brennan', action: 'updated', subject: 'the German VAT registration to DE347820914', when: 'Yesterday', group: 'Compliance' },
        { id: 'a7', tone: 'warn', who: 'Deploy bot', action: 'rolled back', subject: 'release 2026.03.4 after elevated 502s from the Frankfurt edge', when: 'Yesterday', group: 'Releases' },
        { id: 'a8', tone: 'info', who: 'Hana Sato', action: 'merged', subject: 'pull request #4182, chart tooltip accessibility fixes', when: '2 days ago', group: 'Engineering' },
      ];

      export const NAV_SECTIONS = [
        {
          id: 'overview',
          label: 'Overview',
          items: [
            { id: 'dashboard', label: 'Dashboard', icon: 'chart', badge: null },
            { id: 'orders', label: 'Orders', icon: 'cart', badge: '24' },
            { id: 'customers', label: 'Customers', icon: 'users', badge: null },
          ],
        },
        {
          id: 'analysis',
          label: 'Analysis',
          items: [
            { id: 'revenue', label: 'Revenue', icon: 'layers', badge: null },
            { id: 'cohorts', label: 'Cohorts', icon: 'target', badge: null },
            { id: 'funnels', label: 'Funnels', icon: 'filter', badge: null },
          ],
        },
        {
          id: 'workspace',
          label: 'Workspace',
          items: [
            { id: 'team', label: 'Team', icon: 'users', badge: '3' },
            { id: 'settings', label: 'Settings', icon: 'sliders', badge: null },
          ],
        },
      ];

      /** Icon paths, kept beside the data so the shell has one import for its glyphs. */
      export const NAV_ICONS = {
        chart: 'M3 3v18h18M7 15v-4M12 15V8M17 15v-6',
        cart: 'M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6M10 21h.01M17 21h.01',
        users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
        layers: 'm12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5',
        target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
        filter: 'M3 5h18l-7 8v6l-4 2v-8L3 5Z',
        sliders: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h10M18 18h2',
        bell: 'M18 15V10a6 6 0 1 0-12 0v5l-2 3h16l-2-3ZM10 21h4',
        search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3',
        logout: 'M15 17l5-5-5-5M20 12H9M11 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5',
        menu: 'M4 7h16M4 12h16M4 17h16',
        close: 'M6 6l12 12M18 6 6 18',
        arrowUp: 'm18 15-6-6-6 6',
        arrowDown: 'm6 9 6 6 6-6',
        check: 'm20 6-11 11-5-5',
        clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
        chevronLeft: 'm15 18-6-6 6-6',
        chevronRight: 'm9 18 6-6-6-6',
        shield: 'M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z',
        sparkles: 'm12 3 1.9 4.6 4.6 1.9-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Z',
        database: 'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3ZM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6',
        mail: 'M4 5h16v14H4zM4 7l8 6 8-6',
        sort: 'M8 9l4-4 4 4M8 15l4 4 4-4',
        trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
        external: 'M7 17 17 7M8 7h9v9',
      };`,
    },
    {
      path: 'hooks/useMediaQuery.js',
      content: `      import { useEffect, useState } from 'react';

      /**
       * Subscribes to a media query and re-renders on change.
       *
       * The admin shell needs to know whether it is on a phone for two things: the
       * sidebar becomes a drawer under 1024px, and the table drops its status column.
       * Doing that with CSS alone would mean rendering two versions of the markup.
       */
      export function useMediaQuery(query) {
        const [matches, setMatches] = useState(() => {
          if (typeof window === 'undefined' || !window.matchMedia) return false;
          return window.matchMedia(query).matches;
        });

        useEffect(() => {
          if (typeof window === 'undefined' || !window.matchMedia) return undefined;

          const list = window.matchMedia(query);
          const onChange = (event) => setMatches(event.matches);

          // Re-read on subscribe: the viewport may have changed between render and effect.
          setMatches(list.matches);

          // Safari below 14 only has the deprecated listener API.
          if (typeof list.addEventListener === 'function') {
            list.addEventListener('change', onChange);
            return () => list.removeEventListener('change', onChange);
          }
          list.addListener(onChange);
          return () => list.removeListener(onChange);
        }, [query]);

        return matches;
      }

      /** True when the user has asked the OS to minimise animation. */
      export function usePrefersReducedMotion() {
        return useMediaQuery('(prefers-reduced-motion: reduce)');
      }`,
    },
    {
      path: 'utils/format.js',
      content: `      /** Number, currency and date formatting shared by every dashboard component. */

      const GBP = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        maximumFractionDigits: 0,
      });

      const GBP_PENCE = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      const COMPACT = new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 });

      /** Compact currency for chart axes: 1.2M, 340k, 900. */
      export function compactCurrency(value) {
        if (Math.abs(value) >= 1000000) return '£' + (value / 1000000).toFixed(1) + 'M';
        if (Math.abs(value) >= 1000) return '£' + Math.round(value / 1000) + 'k';
        return '£' + value;
      }

      /** Compact plain number, for the sparkline axes. */
      export function compactNumber(value) {
        return COMPACT.format(value);
      }

      export const fullCurrency = (value) => GBP.format(value);
      export const penceCurrency = (value) => GBP_PENCE.format(value);

      /** Applies a KPI's declared \`format\` to its value. */
      export function formatKpi(format, value) {
        if (format === 'currency') return fullCurrency(value);
        if (format === 'percent') return value.toFixed(2) + '%';
        return new Intl.NumberFormat('en-GB').format(value);
      }

      /** Signed percentage with a fixed sign, e.g. "+7.2%" / "-0.6%". */
      export function signedPercent(value) {
        const rounded = Math.round(value * 10) / 10;
        return (rounded > 0 ? '+' : rounded < 0 ? '-' : '') + Math.abs(rounded).toFixed(1) + '%';
      }

      /** \`2026-03-18\` -> "18 Mar 2026". Parsed as text to dodge the UTC day shift. */
      export function formatDate(iso) {
        const [y, m, d] = String(iso).split('-').map(Number);
        const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return d + ' ' + MONTHS[m - 1] + ' ' + y;
      }

      /** Clamp helper, used by the chart's scale maths. */
      export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

      /**
       * Rounds a raw maximum up to a friendly axis bound, so gridlines land on round
       * numbers instead of 247,318.
       */
      export function niceMax(value) {
        if (value <= 0) return 1;
        const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
        const normalised = value / magnitude;
        const step = normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 2.5 ? 2.5 : normalised <= 5 ? 5 : 10;
        return step * magnitude;
      }`,
    }
  ],
};
