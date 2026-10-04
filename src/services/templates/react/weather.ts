export default {
  files: [
    {
      path: 'main.jsx',
      content: `      import { StrictMode } from 'react';
      import { createRoot } from 'react-dom/client';
      import App from './App.jsx';

      // The playground supplies #root. Guard rather than assume - a null host should be
      // a silent no-op instead of a TypeError in the console panel.
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
         Tokens. The sky gradients below are the only place condition
         colour is chosen; everything else reads these variables.
         ------------------------------------------------------------- */
      :root {
        --font-display: 'Fraunces', Georgia, serif;
        --font-body: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

        --color-ink: #0d1524;
        --color-ink-2: #43506a;
        --color-ink-3: #6b7a94;
        --color-surface: #ffffff;
        --color-surface-2: rgba(255, 255, 255, 0.72);
        --color-border: rgba(13, 21, 36, 0.1); --color-border-strong: rgba(13, 21, 36, 0.2);

        --color-accent: #1d4ed8;
        --color-accent-2: #0ea5e9;
        --color-warn: #b45309; --color-good: #15803d;

        --glass-bg: rgba(255, 255, 255, 0.62); --glass-blur: 16px; --glass-border: rgba(255, 255, 255, 0.55);

        --sky-top: #7dd3fc; --sky-mid: #bae6fd; --sky-bot: #e0f2fe; --sky-ink: #0d1524;
        --sky-ink-2: #43506a;

        --chart-bar-top: #f59e0b; --chart-bar-bottom: #fbbf24; --chart-precip-top: #38bdf8;
        --chart-precip-bottom: #0ea5e9;

        --radius-sm: 8px; --radius-md: 14px; --radius-lg: 22px; --radius-pill: 999px;

        --shadow-1: 0 1px 2px rgba(13, 21, 36, 0.06), 0 2px 8px rgba(13, 21, 36, 0.05);
        --shadow-2: 0 6px 20px rgba(13, 21, 36, 0.1);
        --shadow-3: 0 20px 50px rgba(13, 21, 36, 0.18);

        --space-1: 0.25rem;
        --space-2: 0.5rem;
        --space-3: 0.75rem;
        --space-4: 1rem;
        --space-5: 1.5rem;
        --space-6: 2rem;
        --space-7: 3rem;

        --ring: 0 0 0 3px rgba(29, 78, 216, 0.45); --tap: 40px;
      }

      /* - Sky by condition. Each is a three-stop vertical gradient. - */
      .sky--sky-clear { --sky-top: #38bdf8; --sky-mid: #7dd3fc; --sky-bot: #fef3c7; }
      .sky--sky-partly { --sky-top: #60a5fa; --sky-mid: #a5d8ff; --sky-bot: #e0f2fe; }
      .sky--sky-cloudy { --sky-top: #7d94b3; --sky-mid: #a9bbd2; --sky-bot: #dbe4ee; }
      .sky--sky-overcast { --sky-top: #6b7d94; --sky-mid: #94a6bb; --sky-bot: #cbd5e1; }
      .sky--sky-drizzle { --sky-top: #5b7f9e; --sky-mid: #8ba7bd; --sky-bot: #c3d3e0; }
      .sky--sky-rain { --sky-top: #3f5f80; --sky-mid: #6b8aa8; --sky-bot: #a8c0d4; }
      .sky--sky-thunder { --sky-top: #2f3a5c; --sky-mid: #4b587e; --sky-bot: #7d8bb0; }
      .sky--sky-snow { --sky-top: #7c93ab; --sky-mid: #aec2d4; --sky-bot: #e6eef5; }
      .sky--sky-fog { --sky-top: #94a3ae; --sky-mid: #bcc7ce; --sky-bot: #e2e8eb; }
      .sky--sky-wind { --sky-top: #6f8fa8; --sky-mid: #9db8c9; --sky-bot: #d5e3ea; }

      /* - Sky by time of day, layered on top of the condition. - */
      .sky--dawn { --sky-top: #7c5c8e; --sky-mid: #d98d7a; --sky-bot: #fbd3a4; }
      .sky--dusk { --sky-top: #4a3f77; --sky-mid: #c96f6b; --sky-bot: #f2b183; }
      .sky--night { --sky-top: #070d1c; --sky-mid: #131d38; --sky-bot: #24355c; --sky-ink: #eef2fb; --sky-ink-2: #b8c4dc; }
      .sky--night .glass { --glass-bg: rgba(24, 33, 58, 0.62); --glass-border: rgba(255, 255, 255, 0.16); --color-ink: #eef2fb; --color-ink-2: #b8c4dc; --color-ink-3: #8b99b8; --color-border: rgba(255, 255, 255, 0.12); --color-border-strong: rgba(255, 255, 255, 0.26); }
      .sky--night .tile { background: rgba(255, 255, 255, 0.07); }
      .sky--night .input,
      .sky--night .city-opt { background: rgba(255, 255, 255, 0.08); }

      @media (prefers-color-scheme: dark) {
        :root {
          --color-ink: #eef2fb;
          --color-ink-2: #b8c4dc;
          --color-ink-3: #8b99b8;
          --color-surface: #141c30;
          --color-surface-2: rgba(28, 38, 62, 0.72);
          --color-border: rgba(255, 255, 255, 0.12); --color-border-strong: rgba(255, 255, 255, 0.26);
          --glass-bg: rgba(20, 28, 48, 0.62); --glass-border: rgba(255, 255, 255, 0.16); --sky-ink: #eef2fb;
          --sky-ink-2: #b8c4dc;
          --shadow-1: 0 1px 2px rgba(0, 0, 0, 0.4);
          --shadow-2: 0 6px 20px rgba(0, 0, 0, 0.45);
          --shadow-3: 0 20px 50px rgba(0, 0, 0, 0.55);
        }
      }

      /* -- Base ----------------------------------------------------- */
      *, *::before, *::after { box-sizing: border-box; }

      body {
        margin: 0; padding: 0; min-height: 100vh;
        font-family: var(--font-body); font-size: 15px; line-height: 1.55;
        color: var(--sky-ink); background: var(--sky-bot); -webkit-font-smoothing: antialiased;
      }

      #root { min-height: 100vh; }

      h1, h2, h3 { font-family: var(--font-display); font-weight: 600; letter-spacing: -0.01em; margin: 0; }
      p { margin: 0; }
      button { font: inherit; }

      .sr-only {
        position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
        overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
      }

      .skip-link {
        position: absolute; left: var(--space-3); top: -70px; z-index: 60;
        padding: var(--space-2) var(--space-4); background: var(--color-accent); color: #fff;
        border-radius: var(--radius-sm); text-decoration: none; font-weight: 600; transition: top 160ms ease;
      }
      .skip-link:focus { top: var(--space-3); }

      :where(a, button, input, select, [tabindex]):focus-visible {
        outline: 2px solid transparent; box-shadow: var(--ring); border-radius: var(--radius-sm);
      }

      .glass {
        background: var(--glass-bg); backdrop-filter: blur(var(--glass-blur)) saturate(150%);
        -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(150%);
        border: 1px solid var(--glass-border); border-radius: var(--radius-lg); box-shadow: var(--shadow-2);
      }

      .section-title { display: flex; align-items: center; gap: var(--space-2); font-size: 1.05rem; }
      .section-note { font-size: 0.8rem; color: var(--color-ink-3); }

      .icon { flex: 0 0 auto; }

      /* -- Sky backdrop --------------------------------------------- */
      .sky {
        position: relative; min-height: 100vh;
        background: linear-gradient(178deg, var(--sky-top) 0%, var(--sky-mid) 42%, var(--sky-bot) 100%);
        transition: background 900ms ease; padding-bottom: var(--space-7);
      }

      /* Stars fade in only at night, and only when motion is welcome. */
      .sky__stars {
        position: absolute; inset: 0;
        background-image:
          radial-gradient(1.4px 1.4px at 12% 18%, rgba(255, 255, 255, 0.9), transparent),
          radial-gradient(1.2px 1.2px at 28% 9%, rgba(255, 255, 255, 0.7), transparent),
          radial-gradient(1.6px 1.6px at 44% 24%, rgba(255, 255, 255, 0.85), transparent),
          radial-gradient(1.2px 1.2px at 61% 12%, rgba(255, 255, 255, 0.6), transparent),
          radial-gradient(1.5px 1.5px at 76% 27%, rgba(255, 255, 255, 0.8), transparent),
          radial-gradient(1.2px 1.2px at 89% 15%, rgba(255, 255, 255, 0.7), transparent);
        opacity: 0; pointer-events: none; transition: opacity 900ms ease;
      }

      .sky--night .sky__stars { opacity: 1; animation: twinkle 5s ease-in-out infinite; }

      /* -- Header --------------------------------------------------- */
      .wx-header {
        display: flex; align-items: center; justify-content: space-between;
        gap: var(--space-4); flex-wrap: wrap;
        padding: var(--space-4) clamp(var(--space-4), 3vw, var(--space-7)); max-width: 1200px; margin: 0 auto;
      }

      .wx-header__brand { display: flex; align-items: center; gap: var(--space-3); }

      .wx-header__mark {
        display: grid; place-items: center; width: 40px; height: 40px;
        color: #fff; background: linear-gradient(140deg, var(--color-accent), var(--color-accent-2));
        border-radius: var(--radius-md); box-shadow: var(--shadow-2);
      }

      .wx-header__title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 600; }
      .wx-header__sub { font-size: 0.76rem; color: var(--color-ink-2); }

      .unit-toggle {
        display: inline-flex; padding: 3px;
        background: var(--glass-bg); backdrop-filter: blur(var(--glass-blur));
        border: 1px solid var(--glass-border); border-radius: var(--radius-pill); box-shadow: var(--shadow-1);
      }

      .unit-toggle__btn {
        min-width: 52px; min-height: 34px; padding: 4px var(--space-3);
        font-size: 0.88rem; font-weight: 600; color: var(--color-ink-2);
        background: transparent; border: 0; border-radius: var(--radius-pill); cursor: pointer;
        transition: background-color 160ms ease, color 160ms ease;
      }
      .unit-toggle__btn:hover { color: var(--color-ink); }
      .unit-toggle__btn--on { color: #fff; background: var(--color-accent); }

      .wx-main {
        display: grid; gap: clamp(var(--space-4), 2vw, var(--space-5)); max-width: 1200px; margin: 0 auto;
        padding: 0 clamp(var(--space-4), 3vw, var(--space-7));
      }

      /* -- City search ---------------------------------------------- */
      .city-search { position: relative; display: grid; gap: var(--space-3); }

      .city-search__field { position: relative; display: flex; align-items: center; }

      .city-search__glyph {
        position: absolute; left: var(--space-4); display: grid; place-items: center;
        color: var(--color-ink-3); pointer-events: none;
      }

      .city-search__input {
        width: 100%; min-height: 48px; padding: var(--space-2) 2.8rem;
        font: inherit; font-size: 0.95rem; color: var(--color-ink);
        background: var(--glass-bg); backdrop-filter: blur(var(--glass-blur));
        border: 1px solid var(--glass-border); border-radius: var(--radius-pill); box-shadow: var(--shadow-1);
        transition: box-shadow 160ms ease, border-color 160ms ease;
      }
      .city-search__input::placeholder { color: var(--color-ink-3); }
      .city-search__input:focus-visible { border-color: var(--color-accent); box-shadow: var(--ring); }

      .city-search__clear {
        position: absolute; right: var(--space-3);
        display: grid; place-items: center; width: 26px; height: 26px;
        color: var(--color-ink-3); background: transparent; border: 0; border-radius: var(--radius-sm); cursor: pointer;
      }
      .city-search__clear:hover { color: var(--color-ink); background: rgba(13, 21, 36, 0.08); }

      .city-tabs { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: var(--space-2); }

      .city-tab {
        display: grid; justify-items: center; gap: 2px; padding: var(--space-3) var(--space-2);
        color: var(--color-ink); background: var(--glass-bg); backdrop-filter: blur(var(--glass-blur));
        border: 1px solid var(--glass-border); border-radius: var(--radius-md);
        box-shadow: var(--shadow-1); cursor: pointer;
        transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background-color 180ms ease;
      }
      .city-tab:hover { transform: translateY(-2px); box-shadow: var(--shadow-2); border-color: var(--color-border-strong); }
      .city-tab--on {
        background: var(--color-accent); color: #fff; border-color: transparent; box-shadow: var(--shadow-2);
      }

      .city-tab__name { font-size: 0.8rem; font-weight: 600; }
      .city-tab__temp { font-family: var(--font-display); font-size: 1.02rem; font-variant-numeric: tabular-nums; }

      .city-list {
        position: absolute; z-index: 30; top: 54px; left: 0; right: 0;
        display: grid; gap: 2px; max-height: 22rem; overflow-y: auto;
        margin: 0; padding: var(--space-2); list-style: none;
        background: var(--color-surface); border: 1px solid var(--color-border);
        border-radius: var(--radius-md); box-shadow: var(--shadow-3); animation: drop-in 180ms ease;
      }

      .city-list__empty { padding: var(--space-4); font-size: 0.85rem; color: var(--color-ink-3); text-align: center; }

      .city-opt {
        display: grid; grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center; gap: var(--space-3);
        padding: var(--space-2) var(--space-3); color: var(--color-ink);
        background: transparent; border: 0; border-radius: var(--radius-sm); cursor: pointer;
      }
      .city-opt--active { background: var(--color-accent-soft, rgba(29, 78, 216, 0.1)); }

      .city-opt__text { display: grid; min-width: 0; }
      .city-opt__name { font-size: 0.9rem; font-weight: 600; }
      .city-opt__meta { display: flex; align-items: center; gap: 4px; font-size: 0.74rem; color: var(--color-ink-3); }
      .city-opt__right { display: grid; justify-items: end; }
      .city-opt__temp { font-family: var(--font-display); font-size: 1.05rem; font-variant-numeric: tabular-nums; }
      .city-opt__cond { font-size: 0.72rem; color: var(--color-ink-2); }
      .city-opt__stamp { font-size: 0.66rem; color: var(--color-ink-3); }

      /* -- Current card --------------------------------------------- */
      .current {
        position: relative; display: grid; grid-template-columns: minmax(0, 1.2fr) auto minmax(0, 1fr);
        align-items: center; gap: clamp(var(--space-4), 3vw, var(--space-6));
        padding: clamp(var(--space-5), 3vw, var(--space-6)); color: #fff;
        background: linear-gradient(125deg, rgba(13, 21, 36, 0.62), rgba(13, 21, 36, 0.34));
        backdrop-filter: blur(var(--glass-blur)) saturate(140%); border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: var(--radius-lg); box-shadow: var(--shadow-3);
        animation: rise 420ms cubic-bezier(0.2, 0.7, 0.3, 1);
      }

      .current--skeleton { grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); }

      .current__city { font-size: clamp(1.5rem, 3vw, 2rem); }
      .current__region { font-size: 0.82rem; color: rgba(255, 255, 255, 0.82); }
      .current__sep { margin: 0 0.45em; opacity: 0.6; }

      .current__icon { display: grid; justify-items: center; gap: var(--space-2); color: #fff; }
      .current__cond { font-size: 0.86rem; font-weight: 600; }

      .current__temp { display: grid; justify-items: end; gap: 2px; }
      .current__degrees { display: flex; align-items: flex-start; font-family: var(--font-display); line-height: 0.9; }
      .current__number { font-size: clamp(3.4rem, 9vw, 5.4rem); font-weight: 600; font-variant-numeric: tabular-nums; }
      .current__unit { font-size: 1.6rem; margin-top: 0.35em; }
      .current__feels { font-size: 0.86rem; color: rgba(255, 255, 255, 0.86); }
      .current__range { font-size: 0.78rem; color: rgba(255, 255, 255, 0.74); }

      .current__facts {
        grid-column: 1 / -1; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: var(--space-3); margin: 0; padding-top: var(--space-4);
        border-top: 1px solid rgba(255, 255, 255, 0.18);
      }
      .current__fact dt { font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; color: rgba(255, 255, 255, 0.7); }
      .current__fact dd { margin: 2px 0 0; font-size: 1.02rem; font-weight: 600; }
      .current__fact-note { display: block; font-size: 0.72rem; font-weight: 400; color: rgba(255, 255, 255, 0.72); }

      .current__stamp {
        grid-column: 1 / -1; display: flex; align-items: center; flex-wrap: wrap;
        font-size: 0.74rem; color: rgba(255, 255, 255, 0.76);
      }

      .live-dot {
        display: inline-block; width: 7px; height: 7px; margin-right: 7px;
        background: #4ade80; border-radius: 50%; box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
        animation: pulse-ring 2.4s ease-out infinite;
      }
      .live-dot--dim { background: #94a3b8; animation: none; box-shadow: none; }

      /* -- Skeleton ------------------------------------------------- */
      .sk {
        background: linear-gradient(90deg, rgba(255, 255, 255, 0.14) 25%, rgba(255, 255, 255, 0.3) 37%, rgba(255, 255, 255, 0.14) 63%);
        background-size: 400% 100%; border-radius: var(--radius-sm);
        animation: shimmer 1.4s ease-in-out infinite;
      }
      .sk--line { height: 0.9rem; }
      .sk--tall { height: 3.4rem; }
      .sk--w40 { width: 40%; }
      .sk--w60 { width: 58%; }
      .sk--w80 { width: 76%; }
      .sk--round { width: 96px; height: 96px; border-radius: 50%; }
      .sk--grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); }
      .sk--block { height: 2.8rem; border-radius: var(--radius-md); }

      /* -- Conditions spread ---------------------------------------- */
      .wx-conditions__row { display: flex; flex-wrap: wrap; gap: var(--space-2); }

      .spread-chip {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 4px var(--space-3); font-size: 0.78rem; color: var(--color-ink-2);
        background: var(--glass-bg); backdrop-filter: blur(var(--glass-blur));
        border: 1px solid var(--glass-border); border-radius: var(--radius-pill);
      }
      .spread-chip__count { font-variant-numeric: tabular-nums; color: var(--color-ink-3); }

      /* -- Forecast strip ------------------------------------------- */
      .forecast { padding: clamp(var(--space-4), 2vw, var(--space-5)); }
      .forecast__head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3); flex-wrap: wrap; margin-bottom: var(--space-3); }

      .forecast__strip {
        display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: var(--space-2);
      }

      .day {
        display: grid; justify-items: center; gap: 3px; padding: var(--space-3) var(--space-1);
        color: var(--color-ink); background: rgba(255, 255, 255, 0.42);
        border: 1px solid transparent; border-radius: var(--radius-md); cursor: pointer;
        transition: transform 180ms ease, background-color 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
      }
      .day:hover { background: rgba(255, 255, 255, 0.72); transform: translateY(-2px); box-shadow: var(--shadow-1); }
      .day--on {
        color: #fff; background: var(--color-accent); border-color: transparent; box-shadow: var(--shadow-2);
      }

      .day__name { font-size: 0.78rem; font-weight: 700; }
      .day__date { font-size: 0.66rem; color: var(--color-ink-3); }
      .day--on .day__date { color: rgba(255, 255, 255, 0.82); }
      .day__temps { display: flex; align-items: baseline; gap: 6px; font-variant-numeric: tabular-nums; }
      .day__hi { font-family: var(--font-display); font-size: 1.05rem; font-weight: 600; }
      .day__lo { font-size: 0.82rem; color: var(--color-ink-3); }
      .day--on .day__lo { color: rgba(255, 255, 255, 0.8); }
      .day__precip, .day__wind { display: flex; align-items: center; gap: 3px; font-size: 0.68rem; color: var(--color-ink-3); }
      .day--on .day__precip, .day--on .day__wind { color: rgba(255, 255, 255, 0.86); }
      .day__cond { font-size: 0.62rem; text-align: center; color: var(--color-ink-2); }
      .day--on .day__cond { color: rgba(255, 255, 255, 0.9); }

      /* -- Hourly chart --------------------------------------------- */
      .hourly { display: grid; gap: var(--space-3); padding: clamp(var(--space-4), 2vw, var(--space-5)); }
      .hourly__head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3); flex-wrap: wrap; }
      .hourly__plot { position: relative; }

      .hourly__svg { width: 100%; height: auto; display: block; overflow: visible; }

      .chart-grid { stroke: var(--color-border); stroke-width: 1; stroke-dasharray: 3 5; }
      .chart-zero { stroke: var(--color-ink-3); stroke-width: 1; }
      .chart-ylabel, .chart-xlabel, .chart-value {
        font-family: var(--font-body); font-size: 10px; fill: var(--color-ink-3);
      }
      .chart-xlabel { text-anchor: middle; }
      .chart-ylabel { text-anchor: start; }
      .chart-value { text-anchor: middle; font-weight: 700; fill: var(--color-ink); }

      .chart-bar { transition: opacity 160ms ease; }
      .chart-hit { cursor: crosshair; }
      .chart-band { fill: var(--color-accent); opacity: 0.12; }

      .chart-tip { pointer-events: none; animation: tip-in 140ms ease; }
      .chart-tip__bg { fill: var(--color-ink); opacity: 0.94; }
      .chart-tip__time { text-anchor: middle; font-size: 10px; font-weight: 600; fill: var(--color-bg, #fff); opacity: 0.8; }
      .chart-tip__temp { text-anchor: middle; font-size: 15px; font-weight: 700; fill: #fff; }
      .chart-tip__precip { text-anchor: middle; font-size: 9px; fill: rgba(255, 255, 255, 0.8); }

      .hourly__legend { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; font-size: 0.74rem; color: var(--color-ink-3); }
      .legend-swatch { width: 14px; height: 10px; border-radius: 3px; }
      .legend-swatch--temp { background: var(--chart-bar-top); margin-left: var(--space-2); }
      .legend-swatch--precip { background: var(--chart-precip-top); }

      /* -- Metrics -------------------------------------------------- */
      .metrics { display: grid; gap: var(--space-4); }

      .metrics__solar {
        display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
        align-items: center; gap: var(--space-4); padding: clamp(var(--space-4), 2vw, var(--space-5));
      }
      .solar__copy { display: grid; gap: var(--space-1); }
      .solar__now { margin-top: var(--space-2); font-size: 0.86rem; font-weight: 600; color: var(--color-ink); }
      .solar__phase { display: block; font-size: 0.72rem; font-weight: 400; color: var(--color-ink-3); }

      .arc { width: 100%; height: auto; }
      .arc__track { fill: none; stroke: var(--color-border-strong); stroke-width: 2; stroke-dasharray: 4 6; }
      .arc__elapsed {
        fill: none; stroke: var(--color-warn); stroke-width: 2.5; stroke-linecap: round;
        transition: stroke-dashoffset 800ms ease;
      }
      .arc__elapsed--full { stroke: var(--color-ink-3); }
      .arc__horizon { stroke: var(--color-border-strong); stroke-width: 1; }
      .arc__sun { fill: #fbbf24; stroke: #fff; stroke-width: 2; transition: cx 800ms ease, cy 800ms ease; }
      .arc__sun--below { fill: var(--color-ink-3); }
      .arc__label { font-family: var(--font-body); font-size: 11px; fill: var(--color-ink-3); text-anchor: middle; }
      .arc__label--end { text-anchor: middle; }

      .metrics__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr)); gap: var(--space-3); }

      .tile {
        display: grid; gap: 6px; padding: var(--space-4);
        background: var(--glass-bg); backdrop-filter: blur(var(--glass-blur));
        border: 1px solid var(--glass-border); border-radius: var(--radius-md); box-shadow: var(--shadow-1);
        transition: transform 180ms ease, box-shadow 180ms ease;
      }
      .tile:hover { transform: translateY(-2px); box-shadow: var(--shadow-2); }

      .tile__head { display: flex; align-items: center; gap: 6px; color: var(--color-ink-3); }
      .tile__label { font-family: var(--font-body); font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; }
      .tile__value { font-family: var(--font-display); font-size: 1.5rem; font-weight: 600; line-height: 1.1; font-variant-numeric: tabular-nums; }
      .tile__caption { font-size: 0.72rem; color: var(--color-ink-3); }

      /* Tone stripes keep the six tiles scannable without six different hues. */
      .tile--low { border-left: 3px solid var(--color-good); }
      .tile--moderate { border-left: 3px solid #ca8a04; }
      .tile--high { border-left: 3px solid var(--color-warn); }
      .tile--veryhigh { border-left: 3px solid #c2410c; }
      .tile--extreme { border-left: 3px solid #b91c1c; }

      .tile__meter {
        width: 100%; height: 5px; appearance: none; border: none;
        border-radius: var(--radius-pill); background: var(--color-border); overflow: hidden;
      }
      .tile__meter::-webkit-progress-bar { background: var(--color-border); border-radius: var(--radius-pill); }
      .tile__meter::-webkit-progress-value { background: var(--color-accent-2); border-radius: var(--radius-pill); transition: width 600ms ease; }
      .tile__meter::-moz-progress-bar { background: var(--color-accent-2); border-radius: var(--radius-pill); }

      /* -- Footer --------------------------------------------------- */
      .wx-footer {
        display: grid; gap: var(--space-1); margin-top: var(--space-3);
        padding-top: var(--space-4); border-top: 1px solid var(--glass-border);
        font-size: 0.78rem; color: var(--color-ink-2);
      }
      .wx-footer__stamp { font-size: 0.72rem; color: var(--color-ink-3); }

      /* -- Weather icon animation ----------------------------------- */
      .wx-icon { overflow: visible; }
      .wx-sun__disc { fill: #fbbf24; stroke: #f59e0b; }
      .wx-sun__rays { stroke: #fbbf24; transform-origin: 12px 12px; animation: spin-slow 22s linear infinite; }
      .wx-icon__sun--partly { opacity: 0.75; transform-origin: 8.5px 8.5px; }
      .wx-moon { fill: #e2e8f0; stroke: #cbd5e1; animation: breathe 6s ease-in-out infinite; transform-origin: 12px 12px; }
      .wx-cloud { fill: rgba(226, 232, 240, 0.9); stroke: #94a3b8; }
      .wx-icon__cloud--back { opacity: 0.5; transform: translate(-2px, -2px) scale(0.86); transform-origin: 12px 14px; }
      .wx-icon__cloud--mid { opacity: 0.72; transform: translate(-1px, -1px) scale(0.93); transform-origin: 12px 14px; }
      .wx-icon__cloud--front { transform-origin: 12px 14px; animation: drift 6s ease-in-out infinite; }

      .wx-drop { stroke: #38bdf8; stroke-width: 2; }
      .wx-drop--0 { animation: fall 1.3s linear infinite; }
      .wx-drop--1 { animation: fall 1.3s linear infinite 0.35s; }
      .wx-drop--2 { animation: fall 1.3s linear infinite 0.7s; }
      .wx-drops--heavy .wx-drop { stroke-width: 2.6; }

      .wx-flake { stroke: #e0f2fe; stroke-width: 1.2; }
      .wx-flake--0 { animation: fall 2.4s linear infinite; }
      .wx-flake--1 { animation: fall 2.4s linear infinite 0.8s; }
      .wx-flake--2 { animation: fall 2.4s linear infinite 1.6s; }

      .wx-bolt { fill: #fbbf24; stroke: #f59e0b; animation: flash 3s ease-in-out infinite; }

      .wx-fog__bar { stroke: #cbd5e1; stroke-width: 2; stroke-linecap: round; }
      .wx-fog__bar--1 { animation: slide-fog 4s ease-in-out infinite; }
      .wx-fog__bar--2 { animation: slide-fog 4s ease-in-out infinite 0.9s; }

      .wx-wind__line { stroke: #94a3b8; stroke-width: 1.8; stroke-linecap: round; }
      .wx-wind__line--1 { animation: slide-fog 2.6s ease-in-out infinite; }
      .wx-wind__line--2 { animation: slide-fog 2.6s ease-in-out infinite 0.5s; }
      .wx-wind__line--3 { animation: slide-fog 2.6s ease-in-out infinite 1s; }

      /* -- Animations ----------------------------------------------- */
      @keyframes spin-slow { to { transform: rotate(360deg); } }
      @keyframes breathe { 0%, 100% { opacity: 0.86; } 50% { opacity: 1; } }
      @keyframes drift { 0%, 100% { transform: translateX(-1.4px); } 50% { transform: translateX(1.4px); } }
      @keyframes fall { 0% { opacity: 0; transform: translateY(-2.5px); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(3px); } }
      @keyframes flash { 0%, 88%, 100% { opacity: 1; } 92% { opacity: 0.25; } 96% { opacity: 1; } }
      @keyframes slide-fog { 0%, 100% { transform: translateX(-1.6px); opacity: 0.65; } 50% { transform: translateX(1.6px); opacity: 1; } }
      @keyframes twinkle { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
      @keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }
      @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.6); } 70% { box-shadow: 0 0 0 9px rgba(74, 222, 128, 0); } 100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); } }
      @keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
      @keyframes drop-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
      @keyframes tip-in { from { opacity: 0; } to { opacity: 1; } }

      /* -- Responsive ----------------------------------------------- */
      @media (max-width: 1000px) {
        .current { grid-template-columns: minmax(0, 1fr) auto; }
        .current__temp { grid-column: 1 / -1; justify-items: start; }
      }

      @media (max-width: 860px) {
        .city-tabs { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .forecast__strip { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .day:nth-child(n + 5) { display: none; }
        .metrics__solar { grid-template-columns: minmax(0, 1fr); }
      }

      @media (max-width: 620px) {
        .current { grid-template-columns: minmax(0, 1fr); text-align: center; justify-items: center; }
        .current__temp { justify-items: center; }
        .current__facts { grid-template-columns: minmax(0, 1fr); text-align: left; }
        .current__icon { order: -1; }
        .city-tabs { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .forecast__strip { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .day:nth-child(n + 4) { display: none; }
        .wx-header__sub { display: none; }
      }

      /* -- Reduced motion ------------------------------------------- */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important; animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        .sky, .sky__stars { transition: none; }
      }`,
    },
    {
      path: 'App.jsx',
      content: `      import { useCallback, useEffect, useMemo, useState } from 'react';
      import CitySearch from './components/CitySearch.jsx';
      import CurrentCard, { CurrentCardSkeleton } from './components/CurrentCard.jsx';
      import ForecastStrip from './components/ForecastStrip.jsx';
      import HourlyChart from './components/HourlyChart.jsx';
      import MetricTiles from './components/MetricTiles.jsx';
      import { WEATHER_DATA, conditionSpread } from './data/cities.js';
      import { convertTemp, formatClock, formatWind, relativeMinutes, skyPhase } from './utils/format.js';

      /** How long the skeleton stays up when a city is chosen. */
      const FETCH_MS = 620;

      /** Minutes since local midnight, used for the solar arc and the sky grading. */
      const nowMinutes = () => {
        const d = new Date();
        return d.getHours() * 60 + d.getMinutes();
      };

      const UNIT_COPY = {
        C: 'Celsius',
        F: 'Fahrenheit',
      };

      export default function App() {
        const [cityId, setCityId] = useState(WEATHER_DATA[0].id);
        const [unit, setUnit] = useState('C');
        const [dayIndex, setDayIndex] = useState(0);
        const [loading, setLoading] = useState(true);

        /**
         * A ticking minute counter. Without it the "updated n minutes ago" stamp and
         * the sun's position would both be frozen at whatever they were on first paint.
         */
        const [minutes, setMinutes] = useState(nowMinutes);

        useEffect(() => {
          const id = window.setInterval(() => setMinutes(nowMinutes()), 30000);
          return () => window.clearInterval(id);
        }, []);

        // Simulated fetch. Cleared on unmount so the timer cannot fire into a dead tree.
        useEffect(() => {
          setLoading(true);
          const id = window.setTimeout(() => setLoading(false), FETCH_MS);
          return () => window.clearTimeout(id);
        }, [cityId]);

        const city = useMemo(
          () => WEATHER_DATA.find((entry) => entry.id === cityId) || WEATHER_DATA[0],
          [cityId],
        );

        const phase = useMemo(
          () => skyPhase(city.daily.sunrise, city.daily.sunset, minutes),
          [city, minutes],
        );
        const night = phase === 'night';

        const handleSelectCity = useCallback((id) => {
          setCityId(id);
          setDayIndex(0);
        }, []);

        const selectedDay = city.forecast[dayIndex] || city.forecast[0];

        return (
          <div className={'sky sky--' + city.today.sky + ' sky--' + phase}>
            <a className="skip-link" href="#forecast">Skip to the forecast</a>

            <div className="sky__stars" aria-hidden="true" />

            <header className="wx-header">
              <div className="wx-header__brand">
                <span className="wx-header__mark" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                    strokeLinecap="round" strokeLinejoin="round" focusable="false">
                    <path d="M7.2 19h9.6a4.2 4.2 0 0 0 .5-8.37A6 6 0 0 0 6.1 12.2 3.4 3.4 0 0 0 7.2 19Z" />
                  </svg>
                </span>
                <div>
                  <p className="wx-header__title">Meridian Weather</p>
                  <p className="wx-header__sub">Six cities, seven days, no network calls</p>
                </div>
              </div>

              <div className="wx-header__tools">
                <div className="unit-toggle" role="group" aria-label="Temperature unit">
                  {['C', 'F'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={'unit-toggle__btn' + (unit === option ? ' unit-toggle__btn--on' : '')}
                      aria-pressed={unit === option}
                      onClick={() => setUnit(option)}
                    >
                      °{option}
                      <span className="sr-only"> ({UNIT_COPY[option]})</span>
                    </button>
                  ))}
                </div>
              </div>
            </header>

            <main className="wx-main">
              <CitySearch
                cities={WEATHER_DATA}
                activeId={city.id}
                onSelect={handleSelectCity}
                unit={unit}
                night={night}
              />

              {loading ? (
                <CurrentCardSkeleton />
              ) : (
                <CurrentCard city={city} unit={unit} phase={phase} updatedMinutes={city.updatedMinutes} />
              )}

              <section className="wx-conditions" aria-labelledby="spread-heading">
                <h2 className="sr-only" id="spread-heading">
                  Conditions across the week
                </h2>
                <div className="wx-conditions__row">
                  {conditionSpread(city).map((entry) => (
                    <span key={entry.id} className="spread-chip">
                      {entry.label}
                      <span className="spread-chip__count">{entry.count}d</span>
                    </span>
                  ))}
                </div>
              </section>

              <div id="forecast">
                <ForecastStrip
                  forecast={city.forecast}
                  selectedIndex={dayIndex}
                  onSelect={setDayIndex}
                  unit={unit}
                  night={night}
                />
              </div>

              <HourlyChart hourly={city.hourly} unit={unit} dayLabel={selectedDay.fullDate} night={night} />

              <MetricTiles
                city={city}
                unit={unit}
                phase={phase}
                nowMinutes={minutes}
                windLabel={formatWind(city.current.windKph, unit)}
              />

              <footer className="wx-footer">
                <p>
                  Sample data for {WEATHER_DATA.length} cities, generated locally at load time. Select a
                  city, switch units, or pick any day in the forecast to change the hourly curve.
                </p>
                <p className="wx-footer__stamp">
                  Local time {formatClock(
                    String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0'),
                  )}{' '}
                  &middot; observations {relativeMinutes(city.updatedMinutes)} old &middot; sky phase {phase}
                </p>
              </footer>
            </main>
          </div>
        );
      }`,
    },
    {
      path: 'components/CitySearch.jsx',
      content: `      import { useEffect, useMemo, useRef, useState } from 'react';
      import WeatherIcon from './WeatherIcon.jsx';
      import { searchCities } from '../data/cities.js';
      import { convertTemp, relativeMinutes, skyPhase, minutesOf } from '../utils/format.js';

      const SearchGlyph = () => (
        <svg className="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3" />
        </svg>
      );

      const Pin = () => (
        <svg className="icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M12 21s-7-6.3-7-11a7 7 0 1 1 14 0c0 4.7-7 11-7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );

      /**
       * City picker.
       *
       * A listbox pattern rather than a bare \`<select>\`, because each option carries an
       * icon, a condition and a temperature. Full keyboard support: Up/Down move the
       * active option, Enter or Space commits it, Escape closes the list and returns
       * focus to the input.
       */
      export default function CitySearch({ cities, activeId, onSelect, unit, night }) {
        const [query, setQuery] = useState('');
        const [open, setOpen] = useState(false);
        const [activeIndex, setActiveIndex] = useState(0);
        const wrapRef = useRef(null);
        const inputRef = useRef(null);
        const listRef = useRef(null);

        const results = useMemo(() => searchCities(query), [query]);

        // Keep the highlighted option inside the result window as it shrinks.
        useEffect(() => {
          setActiveIndex((index) => (index < results.length ? index : 0));
        }, [results.length]);

        // Clicking anywhere else closes the list.
        useEffect(() => {
          if (!open) return undefined;
          const onDocumentClick = (event) => {
            if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
          };
          document.addEventListener('mousedown', onDocumentClick);
          return () => document.removeEventListener('mousedown', onDocumentClick);
        }, [open]);

        const commit = (city) => {
          if (!city) return;
          onSelect(city.id);
          setQuery('');
          setOpen(false);
          if (inputRef.current) inputRef.current.focus();
        };

        const onKeyDown = (event) => {
          if (event.key === 'Escape') {
            setOpen(false);
            setQuery('');
            if (inputRef.current) inputRef.current.focus();
            return;
          }
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((index) => {
              const delta = event.key === 'ArrowDown' ? 1 : -1;
              if (results.length === 0) return 0;
              return (index + delta + results.length) % results.length;
            });
            return;
          }
          if (event.key === 'Enter') {
            event.preventDefault();
            commit(results[activeIndex]);
          }
        };

        // Scroll the highlighted option into view when navigating by keyboard.
        useEffect(() => {
          if (!open || !listRef.current) return;
          const node = listRef.current.querySelector('[data-active="true"]');
          if (node && typeof node.scrollIntoView === 'function') {
            node.scrollIntoView({ block: 'nearest' });
          }
        }, [activeIndex, open]);

        return (
          <div className="city-search" ref={wrapRef}>
            <div className="city-search__field">
              <span className="city-search__glyph" aria-hidden="true">
                <SearchGlyph />
              </span>
              <input
                ref={inputRef}
                className="city-search__input"
                type="text"
                role="combobox"
                aria-expanded={open}
                aria-controls="city-listbox"
                aria-autocomplete="list"
                aria-activedescendant={open && results[activeIndex] ? 'city-opt-' + results[activeIndex].id : undefined}
                aria-label="Search for a city"
                placeholder="Search six cities"
                value={query}
                autoComplete="off"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={onKeyDown}
              />
              {query ? (
                <button
                  type="button"
                  className="city-search__clear"
                  onClick={() => {
                    setQuery('');
                    if (inputRef.current) inputRef.current.focus();
                  }}
                  aria-label="Clear city search"
                >
                  <svg className="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.75" strokeLinecap="round" aria-hidden="true" focusable="false">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              ) : null}
            </div>

            <div className="city-tabs" role="group" aria-label="Cities">
              {cities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  className={'city-tab' + (city.id === activeId ? ' city-tab--on' : '')}
                  aria-pressed={city.id === activeId}
                  onClick={() => commit(city)}
                >
                  <WeatherIcon icon={city.today.icon} night={night && city.id === activeId} size={26} />
                  <span className="city-tab__name">{city.name}</span>
                  <span className="city-tab__temp">
                    {convertTemp(city.current.tempC, unit)}°
                    {unit}
                  </span>
                </button>
              ))}
            </div>

            {open ? (
              <ul
                className="city-list"
                id="city-listbox"
                role="listbox"
                ref={listRef}
                aria-label="Matching cities"
              >
                {results.length === 0 ? (
                  <li className="city-list__empty" role="presentation">
                    No city matches &ldquo;{query}&rdquo;.
                  </li>
                ) : (
                  results.map((city, index) => {
                    const active = index === activeIndex;
                    return (
                      <li
                        key={city.id}
                        id={'city-opt-' + city.id}
                        role="option"
                        aria-selected={city.id === activeId}
                        data-active={active}
                        className={'city-opt' + (active ? ' city-opt--active' : '')}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseDown={(event) => {
                          // mousedown so the input does not blur before we commit.
                          event.preventDefault();
                        }}
                        onClick={() => commit(city)}
                      >
                        <WeatherIcon icon={city.today.icon} size={30} />
                        <span className="city-opt__text">
                          <span className="city-opt__name">{city.name}</span>
                          <span className="city-opt__meta">
                            <Pin />
                            {city.region}, {city.country}
                          </span>
                        </span>
                        <span className="city-opt__right">
                          <span className="city-opt__temp">
                            {convertTemp(city.current.tempC, unit)}°
                            {unit}
                          </span>
                          <span className="city-opt__cond">{city.conditionLabel}</span>
                          <span className="city-opt__stamp">{relativeMinutes(city.updatedMinutes)}</span>
                        </span>
                      </li>
                    );
                  })
                )}
              </ul>
            ) : null}
          </div>
        );
      }

      /** Re-exported for App, which needs the same grading for the page background. */
      export { skyPhase, minutesOf };`,
    },
    {
      path: 'components/CurrentCard.jsx',
      content: `      import WeatherIcon from './WeatherIcon.jsx';
      import { convertTemp, degrees, formatClock, formatWind, relativeMinutes, windBand } from '../utils/format.js';

      /**
       * The hero card: current conditions for one city.
       *
       * Everything on screen is read from the dataset - including the gradient class
       * and the day/night icon swap - so there is no state in this component that
       * could disagree with the data behind it.
       */
      export default function CurrentCard({ city, unit, phase, updatedMinutes }) {
        const current = city.current;
        const night = phase === 'night';
        const today = city.today;

        return (
          <section className={'current current--' + phase} aria-labelledby="current-heading">
            <div className="current__place">
              <h2 className="current__city" id="current-heading">
                {city.name}
              </h2>
              <p className="current__region">
                {city.region}, {city.country}
                <span className="current__sep" aria-hidden="true">
                  &middot;
                </span>
                {city.lat}
                <span className="current__sep" aria-hidden="true">
                  &middot;
                </span>
                {city.timezone}
              </p>
            </div>

            <div className="current__icon">
              <WeatherIcon icon={city.icon} night={night} size={112} />
              <p className="current__cond">{city.conditionLabel}</p>
            </div>

            <div className="current__temp">
              <p className="current__degrees">
                <span className="current__number">{convertTemp(current.tempC, unit)}</span>
                <span className="current__unit">°{unit}</span>
              </p>
              <p className="current__feels">
                Feels like {degrees(convertTemp(current.feelsLikeC, unit))}
                {unit}
              </p>
              <p className="current__range">
                Today {degrees(convertTemp(today.lowC, unit))}
                {unit} to {degrees(convertTemp(today.highC, unit))}
                {unit}
                <span className="current__sep" aria-hidden="true">
                  &middot;
                </span>
                {today.precipChance}% chance of precipitation
              </p>
            </div>

            <dl className="current__facts">
              <div className="current__fact">
                <dt>Wind</dt>
                <dd>
                  {formatWind(current.windKph, unit)}
                  <span className="current__fact-note">
                    {current.windDir}, {windBand(current.windKph)}
                    {formatWind(current.gustKph, unit, true)}
                  </span>
                </dd>
              </div>
              <div className="current__fact">
                <dt>Humidity</dt>
                <dd>
                  {current.humidity}%
                  <span className="current__fact-note">Dew point {degrees(convertTemp(current.dewC, unit))}{unit}</span>
                </dd>
              </div>
              <div className="current__fact">
                <dt>Pressure</dt>
                <dd>
                  {current.pressure} hPa
                  <span className="current__fact-note">{current.pressure > 1015 ? 'High, settled' : 'Low, unsettled'}</span>
                </dd>
              </div>
            </dl>

            <p className="current__stamp">
              <span className={'live-dot' + (phase === 'night' ? ' live-dot--dim' : '')} aria-hidden="true" />
              Updated {relativeMinutes(updatedMinutes)}
              <span className="current__sep" aria-hidden="true">
                &middot;
              </span>
              Sunrise {formatClock(city.daily.sunrise)}
              <span className="current__sep" aria-hidden="true">
                &middot;
              </span>
              Sunset {formatClock(city.daily.sunset)}
            </p>
          </section>
        );
      }

      /**
       * Skeleton shown for the first moment after a city changes. It mirrors the real
       * card's layout so the swap does not shift anything.
       */
      export function CurrentCardSkeleton() {
        return (
          <section className="current current--skeleton" aria-busy="true" aria-label="Loading current conditions">
            <div className="sk sk--line sk--w40" />
            <div className="sk sk--round" />
            <div className="sk sk--line sk--w60 sk--tall" />
            <div className="sk sk--line sk--w80" />
            <div className="sk sk--grid">
              <div className="sk sk--block" />
              <div className="sk sk--block" />
              <div className="sk sk--block" />
            </div>
            <span className="sr-only">Loading the latest conditions</span>
          </section>
        );
      }`,
    },
    {
      path: 'components/ForecastStrip.jsx',
      content: `      import WeatherIcon from './WeatherIcon.jsx';
      import { convertTemp } from '../utils/format.js';

      /**
       * Seven-day strip.
       *
       * Rendered as a radio group: each day is one option, and choosing one drives the
       * hourly chart below. Using \`role="radio"\` rather than a row of buttons means a
       * screen reader announces "2 of 7 selected" instead of seven unrelated buttons.
       */
      export default function ForecastStrip({ forecast, selectedIndex, onSelect, unit, night }) {
        const onKeyDown = (event) => {
          if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
          event.preventDefault();
          const delta = event.key === 'ArrowRight' ? 1 : -1;
          const next = (selectedIndex + delta + forecast.length) % forecast.length;
          onSelect(next);
        };

        return (
          <section className="forecast glass" aria-labelledby="forecast-heading">
            <div className="forecast__head">
              <h2 className="section-title" id="forecast-heading">
                Seven-day forecast
              </h2>
              <p className="section-note">Pick a day to see its hourly curve.</p>
            </div>

            <div
              className="forecast__strip"
              role="radiogroup"
              aria-label="Day of the week"
              onKeyDown={onKeyDown}
            >
              {forecast.map((day, index) => {
                const selected = index === selectedIndex;
                return (
                  <button
                    key={day.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    tabIndex={selected ? 0 : -1}
                    className={'day' + (selected ? ' day--on' : '')}
                    onClick={() => onSelect(index)}
                  >
                    <span className="day__name">{day.weekday}</span>
                    <span className="day__date">{day.dateLabel}</span>

                    <span className="day__icon">
                      <WeatherIcon icon={day.icon} night={night && selected} size={40} />
                    </span>

                    <span className="day__temps">
                      <span className="day__hi">{convertTemp(day.highC, unit)}°</span>
                      <span className="day__lo">{convertTemp(day.lowC, unit)}°</span>
                    </span>

                    <span className="day__precip">
                      <svg className="icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                        <path d="M12 3.5S6 10 6 14a6 6 0 0 0 12 0c0-4-6-10.5-6-10.5Z" />
                      </svg>
                      {day.precipChance}%
                    </span>

                    <span className="day__wind">{day.windKph} km/h</span>

                    <span className="day__cond">{day.conditionLabel}</span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      }`,
    },
    {
      path: 'components/HourlyChart.jsx',
      content: `      import { useMemo, useState } from 'react';
      import { convertTemp, convertTempPrecise, formatClock } from '../utils/format.js';

      /**
       * Hourly temperature chart, drawn as inline SVG.
       *
       * No charting library. The geometry is worked out by hand:
       *
       *   - \`min\`/\`max\` come from the series itself, so the bars always fill the plot.
       *   - A zero line is placed only when it falls inside the range, which keeps an
       *     ordinary mild day from getting a pointless axis.
       *   - Bar height = \`(value - floor) / (ceiling - floor) * plotHeight\`.
       *   - Precipitation is a second, muted bar behind each temperature bar.
       *
       * Sizing is responsive without a resize listener: the SVG uses
       * \`preserveAspectRatio="none"\`-free \`viewBox\` scaling with a fixed coordinate
       * system, and the bars are positioned in user units, so the chart reflows with
       * the container for free.
       */

      const W = 720;
      const H = 220;
      const PAD_TOP = 26;
      const PAD_BOTTOM = 46;
      const PAD_LEFT = 8;
      const PAD_RIGHT = 8;

      const PLOT_W = W - PAD_LEFT - PAD_RIGHT;
      const PLOT_H = H - PAD_TOP - PAD_BOTTOM;

      /** A tick every three hours, so labels never collide on a phone. */
      const LABEL_EVERY = 3;

      const TIP_W = 148;
      const TIP_H = 62;

      /** Tooltip box, clamped so it never hangs off either edge of the viewBox. */
      function Tooltip({ bar, unit }) {
        const left = Math.max(4, Math.min(W - TIP_W - 4, bar.cx - TIP_W / 2));
        // Flip below the bar when there is no room above it.
        const flip = bar.y < TIP_H + 14;
        const top = flip ? bar.y + bar.height + 8 : bar.y - TIP_H - 8;

        return (
          <g className="chart-tip" transform={'translate(' + left + ' ' + top + ')'}>
            <rect className="chart-tip__bg" width={TIP_W} height={TIP_H} rx="9" />
            <text className="chart-tip__time" x={TIP_W / 2} y={19}>
              {formatClock(bar.hour.time)}
            </text>
            <text className="chart-tip__temp" x={TIP_W / 2} y={39}>
              {convertTempPrecise(bar.value, unit)}°{unit}
            </text>
            <text className="chart-tip__precip" x={TIP_W / 2} y={54}>
              {bar.hour.precip}% precipitation
            </text>
          </g>
        );
      }

      export default function HourlyChart({ hourly, unit, dayLabel, night }) {
        const [hovered, setHovered] = useState(null);

        const geometry = useMemo(() => {
          const temps = hourly.map((h) => h.tempC);
          const rawMin = Math.min(...temps);
          const rawMax = Math.max(...temps);

          // Round outwards to whole degrees, then pad by a degree so the tallest bar
          // never touches the top edge.
          const lo = Math.floor(rawMin) - 1;
          const hi = Math.ceil(rawMax) + 1;
          const span = hi - lo || 1;

          const step = PLOT_W / hourly.length;
          const barW = Math.max(6, Math.min(22, step * 0.58));

          const yFor = (celsius) => PAD_TOP + (1 - (celsius - lo) / span) * PLOT_H;

          const bars = hourly.map((hour, i) => {
            const y = yFor(hour.tempC);
            const cx = PAD_LEFT + step * i + step / 2;
            return {
              hour,
              index: i,
              x: cx - barW / 2,
              y,
              width: barW,
              height: Math.max(2, PAD_TOP + PLOT_H - y),
              cx,
              tempY: y - 8,
              value: hour.tempC,
            };
          });

          // Horizontal gridlines at even intervals across the padded range.
          const ticks = [];
          const stepCount = 4;
          for (let i = 0; i <= stepCount; i++) {
            const value = lo + (span / stepCount) * i;
            ticks.push({ value: Math.round(value), y: yFor(value) });
          }

          const zeroY = lo <= 0 && hi >= 0 ? yFor(0) : null;

          return { lo, hi, step, bars, ticks, zeroY };
        }, [hourly]);

        const { lo, hi, step, bars, ticks, zeroY } = geometry;

        const active = hovered !== null ? bars[hovered] : null;

        return (
          <section className={'hourly glass hourly--' + (night ? 'night' : 'day')} aria-labelledby="hourly-heading">
            <div className="hourly__head">
              <h2 className="section-title" id="hourly-heading">
                Hourly temperature
              </h2>
              <p className="section-note">
                {dayLabel} &middot; {convertTemp(lo, unit)}°{unit} to {convertTemp(hi, unit)}°{unit}
              </p>
            </div>

            <div className="hourly__plot">
              <svg
                className="hourly__svg"
                viewBox={'0 0 ' + W + ' ' + H}
                role="img"
                aria-label={
                  'Hourly temperature bar chart. Low ' +
                  convertTemp(lo, unit) +
                  ' degrees, high ' +
                  convertTemp(hi, unit) + ' degrees.'
                }
                onMouseLeave={() => setHovered(null)}
              >
                <defs>
                  <linearGradient id="hourlyBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-bar-top)" />
                    <stop offset="100%" stopColor="var(--chart-bar-bottom)" />
                  </linearGradient>
                  <linearGradient id="precipBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-precip-top)" />
                    <stop offset="100%" stopColor="var(--chart-precip-bottom)" />
                  </linearGradient>
                </defs>

                {/* Gridlines and the y-axis labels. */}
                {ticks.map((tick) => (
                  <g key={tick.value}>
                    <line className="chart-grid" x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={tick.y} y2={tick.y} />
                    <text className="chart-ylabel" x={PAD_LEFT + 2} y={tick.y - 5}>
                      {convertTemp(tick.value, unit)}°
                    </text>
                  </g>
                ))}

                {zeroY !== null ? (
                  <line className="chart-zero" x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={zeroY} y2={zeroY} />
                ) : null}

                {/* Highlight band behind the hovered bar. */}
                {active ? (
                  <rect
                    className="chart-band"
                    x={PAD_LEFT + step * active.index}
                    y={PAD_TOP - 12}
                    width={step}
                    height={PLOT_H + 12}
                    rx="8"
                  />
                ) : null}

                {bars.map((bar) => (
                  <g key={bar.index}>
                    {/* Precipitation sits behind, in a separate scale. */}
                    {bar.hour.precip > 5 ? (
                      <rect
                        className="chart-precip"
                        x={bar.x}
                        y={PAD_TOP + PLOT_H - (bar.hour.precip / 100) * (PLOT_H * 0.34)}
                        width={bar.width}
                        height={(bar.hour.precip / 100) * (PLOT_H * 0.34)}
                        rx="3"
                        fill="url(#precipBar)"
                      />
                    ) : null}

                    <rect
                      className="chart-bar"
                      x={bar.x}
                      y={bar.y}
                      width={bar.width}
                      height={bar.height}
                      rx="4"
                      fill="url(#hourlyBar)"
                    />

                    {hovered === bar.index ? (
                      <text className="chart-value" x={bar.cx} y={bar.tempY}>
                        {convertTempPrecise(bar.value, unit)}°
                      </text>
                    ) : null}

                    {bar.index % LABEL_EVERY === 0 ? (
                      <text className="chart-xlabel" x={bar.cx} y={H - PAD_BOTTOM + 20}>
                        {formatClock(bar.hour.time)}
                      </text>
                    ) : null}

                    {/* Full-height hit area: an invisible rect makes the 6px bar easy to hover. */}
                    <rect
                      className="chart-hit"
                      x={PAD_LEFT + step * bar.index}
                      y={PAD_TOP - 12}
                      width={step}
                      height={PLOT_H + 24}
                      fill="transparent"
                      onMouseEnter={() => setHovered(bar.index)}
                      onFocus={() => setHovered(bar.index)}
                      onBlur={() => setHovered(null)}
                      tabIndex={0}
                      role="button"
                      aria-label={
                        bar.hour.time +
                        ', ' +
                        convertTemp(bar.value, unit) +
                        ' degrees, ' +
                        bar.hour.precip +
                        ' percent chance of precipitation'
                      }
                    />
                  </g>
                ))}

                {/*
                  The tooltip lives inside the SVG, so its position is just a pair of
                  x/y attributes. Doing it in HTML would have required an inline
                  percentage, which the styling rules here do not allow.
                */}
                {active ? <Tooltip bar={active} unit={unit} /> : null}
              </svg>
            </div>

            <p className="hourly__legend">
              <span className="legend-swatch legend-swatch--temp" aria-hidden="true" /> Temperature
              <span className="legend-swatch legend-swatch--precip" aria-hidden="true" /> Chance of precipitation
            </p>

            <p className="sr-only" role="status" aria-live="polite">
              {active
                ? formatClock(active.hour.time) +
                  ': ' +
                  convertTempPrecise(active.value, unit) +
                  ' degrees ' +
                  unit +
                  ', ' +
                  active.hour.precip +
                  ' percent chance of precipitation.'
                : ''}
            </p>
          </section>
        );
      }`,
    },
    {
      path: 'components/MetricTiles.jsx',
      content: `      import { formatClock, minutesOf, sunProgress } from '../utils/format.js';

      /**
       * Detail tiles plus the solar arc.
       *
       * The arc is a quarter-ellipse path with the sun placed along it using
       * trigonometry. \`sunProgress\` returns a 0..1 fraction of the day elapsed, which
       * becomes an angle from 180 to 0 degrees; the sun's coordinates are then
       * \`centre + r * cos/sin(angle)\`. Everything is an SVG attribute, so the whole
       * component is style-free.
       */

      const ARC_W = 320;
      const ARC_H = 108;
      const CX = ARC_W / 2;
      const CY = 96;
      const R = 104;

      /** Point on the arc for a 0..1 progress value. 0 is the horizon at sunrise. */
      function sunPoint(progress) {
        const angle = Math.PI * (1 - progress);
        return { x: CX + R * Math.cos(angle), y: CY - R * Math.sin(angle) * 0.78 };
      }

      const Arc = ({ sunrise, sunset, progress, night }) => {
        const start = sunPoint(0);
        const end = sunPoint(1);
        const sun = sunPoint(progress);

        // The travelled portion of the track is drawn as a dashed path; the remainder
        // stays faint. Splitting with stroke-dasharray on the same path avoids a
        // second <path> with recomputed control points.
        const d = 'M ' + start.x + ' ' + start.y + ' A ' + R + ' ' + R * 0.78 + ' 0 0 1 ' + end.x + ' ' + end.y;

        return (
          <svg
            className="arc"
            viewBox={'0 0 ' + ARC_W + ' ' + ARC_H}
            role="img"
            aria-label={
              'Daylight from ' +
              formatClock(sunrise) +
              ' to ' +
              formatClock(sunset) +
              ', currently ' +
              Math.round(progress * 100) +
              ' percent through'
            }
          >
            <path className="arc__track" d={d} />
            <path
              className={'arc__elapsed' + (night ? ' arc__elapsed--full' : '')}
              d={d}
              pathLength="100"
              strokeDasharray="100"
              strokeDashoffset={String(100 - progress * 100)}
            />
            <line className="arc__horizon" x1="10" y1={CY} x2={ARC_W - 10} y2={CY} />
            <circle className={'arc__sun' + (night ? ' arc__sun--below' : '')} cx={sun.x} cy={sun.y} r="7" />
            <text className="arc__label" x={start.x - 4} y={CY + 18}>
              {formatClock(sunrise)}
            </text>
            <text className="arc__label arc__label--end" x={end.x + 4} y={CY + 18}>
              {formatClock(sunset)}
            </text>
          </svg>
        );
      };

      const TILE_GLYPHS = {
        wind: (
          <>
            <path d="M3 9h9.5a2.6 2.6 0 1 0-2.5-3.2" />
            <path d="M3 13.5h13a2.8 2.8 0 1 1-2.7 3.4" />
          </>
        ),
        drop: <path d="M12 3.2S6.2 9.6 6.2 13.6a5.8 5.8 0 0 0 11.6 0C17.8 9.6 12 3.2 12 3.2Z" />,
        sun: (
          <>
            <circle cx="12" cy="12" r="4.4" />
            <path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7" />
          </>
        ),
        eye: (
          <>
            <path d="M2.5 12S6 5.6 12 5.6 21.5 12 21.5 12 18 18.4 12 18.4 2.5 12 2.5 12Z" />
            <circle cx="12" cy="12" r="3.1" />
          </>
        ),
        gauge: (
          <>
            <path d="M3 12a9 9 0 0 1 18 0" />
            <path d="M12 12l4.6-3.2" />
            <circle cx="12" cy="12" r="1.4" />
          </>
        ),
      };

      const Glyph = ({ name }) => (
        <svg className="icon tile__icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          {TILE_GLYPHS[name]}
        </svg>
      );

      /**
       * One tile: a glyph, a label, a value and a caption. \`meter\` optionally adds a
       * bar whose width comes from a native \`<progress>\` rather than an inline style.
       */
      function Tile({ name, label, value, caption, tone, meter, meterMax, meterLabel }) {
        return (
          <article className={'tile tile--' + (tone || 'neutral')}>
            <header className="tile__head">
              <Glyph name={name} />
              <h3 className="tile__label">{label}</h3>
            </header>
            <p className="tile__value">{value}</p>
            {meter !== undefined ? (
              <progress className="tile__meter" max={meterMax} value={meter} aria-label={meterLabel} />
            ) : null}
            <p className="tile__caption">{caption}</p>
          </article>
        );
      }

      export default function MetricTiles({ city, unit, phase, nowMinutes, windLabel }) {
        const current = city.current;
        const night = phase === 'night';
        const progress = sunProgress(city.daily.sunrise, city.daily.sunset, nowMinutes);

        // Dawn and dusk get a middle tone on the two hour-scale meters.
        const softTone = phase === 'dawn' || phase === 'dusk' ? 'moderate' : night ? 'low' : 'high';

        const daylight = Math.round((minutesOf(city.daily.sunset) - minutesOf(city.daily.sunrise)) / 60 * 10) / 10;

        return (
          <section className="metrics" aria-labelledby="metrics-heading">
            <h2 className="sr-only" id="metrics-heading">
              Detailed conditions
            </h2>

            <div className="metrics__solar glass">
              <div className="solar__copy">
                <p className="section-title">Daylight</p>
                <p className="section-note">
                  {daylight} hours of daylight, {Math.round(progress * 100)}% elapsed.
                </p>
                <p className="solar__now">
                  {night ? 'Currently after sunset' : 'Currently above the horizon'}
                  <span className="solar__phase">Phase: {phase}</span>
                </p>
              </div>
              <Arc sunrise={city.daily.sunrise} sunset={city.daily.sunset} progress={progress} night={night} />
            </div>

            <div className="metrics__grid">
              <Tile
                name="wind"
                label="Wind"
                value={windLabel}
                caption={'Gusts to ' + current.gustKph + ' km/h, bearing ' + current.windDir}
                tone={current.windKph > 30 ? 'veryhigh' : softTone}
                meter={Math.min(100, current.windKph)}
                meterMax={80}
                meterLabel={'Wind speed ' + current.windKph + ' kilometres per hour'}
              />

              <Tile
                name="drop"
                label="Humidity"
                value={current.humidity + '%'}
                caption={'Dew point ' + Math.round(unit === 'F' ? current.dewC * 1.8 + 32 : current.dewC) + '°' + unit}
                tone={current.humidity > 80 ? 'veryhigh' : current.humidity > 60 ? 'high' : 'moderate'}
                meter={current.humidity}
                meterMax={100}
                meterLabel={'Relative humidity ' + current.humidity + ' percent'}
              />

              <Tile
                name="sun"
                label="UV index"
                value={current.uv + ''}
                caption={'Peak today. ' + (current.uv > 7 ? 'Cover up between 10:00 and 15:00.' : 'No protection needed.')}
                tone={current.uv > 10 ? 'extreme' : current.uv > 7 ? 'veryhigh' : current.uv > 5 ? 'high' : 'low'}
                meter={current.uv}
                meterMax={12}
                meterLabel={'UV index ' + current.uv}
              />

              <Tile
                name="eye"
                label="Visibility"
                value={current.visibilityKm + ' km'}
                caption={current.visibilityKm >= 10 ? 'Clear horizon.' : 'Reduced by moisture.'}
                tone={current.visibilityKm >= 20 ? 'low' : current.visibilityKm >= 10 ? 'moderate' : 'high'}
                meter={current.visibilityKm}
                meterMax={25}
                meterLabel={'Visibility ' + current.visibilityKm + ' kilometres'}
              />

              <Tile
                name="gauge"
                label="Pressure"
                value={current.pressure + ' hPa'}
                caption={current.pressure > 1015 ? 'High pressure, settled weather.' : 'Low pressure, unsettled weather.'}
                tone={current.pressure > 1015 ? 'moderate' : 'high'}
                meter={current.pressure - 990}
                meterMax={40}
                meterLabel={'Pressure ' + current.pressure + ' hectopascals'}
              />

              <Tile
                name="drop"
                label="Precipitation"
                value={city.today.precipChance + '%'}
                caption={'Today. ' + (city.today.precipChance > 50 ? 'Take an umbrella.' : 'Dry enough.')}
                tone={city.today.precipChance > 60 ? 'high' : 'moderate'}
                meter={city.today.precipChance}
                meterMax={100}
                meterLabel={'Chance of precipitation ' + city.today.precipChance + ' percent'}
              />
            </div>
          </section>
        );
      }`,
    },
    {
      path: 'components/WeatherIcon.jsx',
      content: `      /**
       * Animated weather icons, drawn as inline SVG.
       *
       * Each icon is a small composition of the same primitives - a sun disc, a cloud
       * outline, precipitation marks - so they share a stroke weight and optical size.
       * Animation is CSS-only (rotating rays, falling drops, drifting fog) and is
       * switched off wholesale under \`prefers-reduced-motion\`.
       */

      const Sun = ({ className = '' }) => (
        <g className={'wx-sun ' + className}>
          <circle cx="12" cy="12" r="4.6" className="wx-sun__disc" />
          <g className="wx-sun__rays">
            <line x1="12" y1="1.6" x2="12" y2="4.4" />
            <line x1="12" y1="19.6" x2="12" y2="22.4" />
            <line x1="1.6" y1="12" x2="4.4" y2="12" />
            <line x1="19.6" y1="12" x2="22.4" y2="12" />
            <line x1="4.6" y1="4.6" x2="6.6" y2="6.6" />
            <line x1="17.4" y1="17.4" x2="19.4" y2="19.4" />
            <line x1="4.6" y1="19.4" x2="6.6" y2="17.4" />
            <line x1="17.4" y1="6.6" x2="19.4" y2="4.6" />
          </g>
        </g>
      );

      const Moon = ({ className = '' }) => (
        <path
          className={'wx-moon ' + className}
          d="M20.4 14.6A8.6 8.6 0 0 1 9.4 3.6a8.6 8.6 0 1 0 11 11Z"
        />
      );

      const Cloud = ({ className = '' }) => (
        <path
          className={'wx-cloud ' + className}
          d="M7.2 19h9.6a4.2 4.2 0 0 0 .5-8.37A6 6 0 0 0 6.1 12.2 3.4 3.4 0 0 0 7.2 19Z"
        />
      );

      const Drops = ({ count = 3, className = '' }) => (
        <g className={'wx-drops ' + className}>
          {Array.from({ length: count }, (_, i) => (
            <line
              key={i}
              x1={9 + i * 3.2}
              y1="20.4"
              x2={8 + i * 3.2}
              y2="22.8"
              className={'wx-drop wx-drop--' + (i % 3)}
            />
          ))}
        </g>
      );

      const Flakes = ({ className = '' }) => (
        <g className={'wx-flakes ' + className}>
          {Array.from({ length: 3 }, (_, i) => (
            <g key={i} className={'wx-flake wx-flake--' + (i % 3)} transform={'translate(' + (9.5 + i * 3.2) + ' 21.4)'}>
              <line x1="-1.5" y1="0" x2="1.5" y2="0" />
              <line x1="0" y1="-1.5" x2="0" y2="1.5" />
              <line x1="-1.1" y1="-1.1" x2="1.1" y2="1.1" />
              <line x1="-1.1" y1="1.1" x2="1.1" y2="-1.1" />
            </g>
          ))}
        </g>
      );

      const Bolt = ({ className = '' }) => (
        <path className={'wx-bolt ' + className} d="M13 19.5 9.6 22l.9-4.6-3.4.4L11 9.5l-.7 4.2 2.9-1.3Z" />
      );

      const FogBars = ({ className = '' }) => (
        <g className={'wx-fog ' + className}>
          <line className="wx-fog__bar wx-fog__bar--1" x1="4.5" y1="18" x2="19.5" y2="18" />
          <line className="wx-fog__bar wx-fog__bar--2" x1="6.5" y1="21" x2="17.5" y2="21" />
        </g>
      );

      const WindLines = ({ className = '' }) => (
        <g className={'wx-wind ' + className}>
          <path className="wx-wind__line wx-wind__line--1" d="M3 9h9.5a2.6 2.6 0 1 0-2.5-3.2" />
          <path className="wx-wind__line wx-wind__line--2" d="M3 13.5h13a2.8 2.8 0 1 1-2.7 3.4" />
          <path className="wx-wind__line wx-wind__line--3" d="M3 18h6" />
        </g>
      );

      const ICONS = {
        clear: (night) => (night ? <Moon className="wx-icon__moon" /> : <Sun className="wx-icon__sun" />),
        partly: (night) => (
          <>
            <Sun className="wx-icon__sun wx-icon__sun--partly" />
            <Cloud className="wx-icon__cloud wx-icon__cloud--front" />
          </>
        ),
        cloudy: () => (
          <>
            <Cloud className="wx-icon__cloud wx-icon__cloud--back" />
            <Cloud className="wx-icon__cloud wx-icon__cloud--front" />
          </>
        ),
        overcast: () => (
          <>
            <Cloud className="wx-icon__cloud wx-icon__cloud--back" />
            <Cloud className="wx-icon__cloud wx-icon__cloud--mid" />
            <Cloud className="wx-icon__cloud wx-icon__cloud--front" />
          </>
        ),
        rain: () => (
          <>
            <Cloud className="wx-icon__cloud wx-icon__cloud--front" />
            <Drops count={3} />
          </>
        ),
        drizzle: () => (
          <>
            <Cloud className="wx-icon__cloud wx-icon__cloud--front" />
            <Drops count={2} />
          </>
        ),
        heavyrain: () => (
          <>
            <Cloud className="wx-icon__cloud wx-icon__cloud--front" />
            <Drops count={3} className="wx-drops--heavy" />
          </>
        ),
        thunder: () => (
          <>
            <Cloud className="wx-icon__cloud wx-icon__cloud--front" />
            <Bolt />
          </>
        ),
        snow: () => (
          <>
            <Cloud className="wx-icon__cloud wx-icon__cloud--front" />
            <Flakes />
          </>
        ),
        fog: () => (
          <>
            <Cloud className="wx-icon__cloud wx-icon__cloud--front" />
            <FogBars />
          </>
        ),
        wind: () => (
          <>
            <Cloud className="wx-icon__cloud wx-icon__cloud--front" />
            <WindLines />
          </>
        ),
      };

      /**
       * @param {object} props
       * @param {string} props.icon    key from the ICONS table
       * @param {boolean} [props.night] swap clear-sky sun for a moon
       * @param {number} [props.size]   rendered box in px
       */
      export default function WeatherIcon({ icon, night = false, size = 96, className = '' }) {
        const render = ICONS[icon] || ICONS.partly;

        return (
          <svg
            className={'wx-icon ' + className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            {render(night)}
          </svg>
        );
      }

      export const hasIcon = (name) => Object.prototype.hasOwnProperty.call(ICONS, name);`,
    },
    {
      path: 'data/cities.js',
      content: `      /**
       * Static weather dataset for six cities.
       *
       * There is no network call anywhere in this template. Everything below is a
       * literal value or a deterministic function of literal values, so the dashboard
       * renders identically on every load and in every sandbox.
       *
       * Hourly series are built from a sine curve anchored to each city's real
       * climatology (daily low, daily high, and the hour the minimum falls at). That
       * gives a believable diurnal curve for ~30 lines of data instead of 144 hand
       * typed numbers per city, and it stays static.
       */

      export const CONDITIONS = {
        clear: { label: 'Clear', icon: 'clear', sky: 'sky-clear' },
        partly: { label: 'Partly cloudy', icon: 'partly', sky: 'sky-partly' },
        cloudy: { label: 'Cloudy', icon: 'cloudy', sky: 'sky-cloudy' },
        overcast: { label: 'Overcast', icon: 'overcast', sky: 'sky-overcast' },
        rain: { label: 'Light rain', icon: 'rain', sky: 'sky-rain' },
        heavyrain: { label: 'Heavy rain', icon: 'heavyrain', sky: 'sky-rain' },
        drizzle: { label: 'Drizzle', icon: 'drizzle', sky: 'sky-drizzle' },
        thunder: { label: 'Thunderstorms', icon: 'thunder', sky: 'sky-thunder' },
        snow: { label: 'Snow showers', icon: 'snow', sky: 'sky-snow' },
        fog: { label: 'Fog', icon: 'fog', sky: 'sky-fog' },
        wind: { label: 'Blustery', icon: 'wind', sky: 'sky-wind' },
      };

      const HOUR_LABELS = [
        '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00',
        '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
        '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
      ];

      /**
       * Builds a 24-hour temperature curve.
       *
       * \`low\` and \`high\` are the extremes for the local day; \`troughHour\` is when the
       * minimum lands (just before dawn, in most of the world). A single cosine gives
       * the shape; the \`spread\` term adds a little asymmetry so dawn feels colder than
       * the mirror of dusk.
       */
      const hourlyTemps = (low, high, troughHour) => {
        const mid = (low + high) / 2;
        const amp = (high - low) / 2;
        return HOUR_LABELS.map((label, hour) => {
          const phase = ((hour - troughHour + 24) % 24) / 24;
          const shaped = Math.cos(phase * Math.PI * 2);
          const drift = hour < 12 ? -0.6 : 0.6;
          const value = mid + amp * shaped + drift * (amp / 12);
          return {
            time: label,
            tempC: Math.round(value * 10) / 10,
            precip: precipCurve(hour, hour < 6 || hour > 19 ? 8 : 2),
          };
        });
      };

      /** Probability of precipitation, peaked in the small hours for most climates. */
      const precipCurve = (hour, base) => {
        const afternoonLift = hour >= 13 && hour <= 18 ? 14 : 0;
        const wave = Math.sin((hour / 24) * Math.PI * 2);
        return Math.max(0, Math.min(96, Math.round(base + afternoonLift + wave * 18)));
      };

      /** Precipitation chance for the seven-day strip, deterministic per city. */
      const dailyPrecip = (seed, lows) =>
        lows.map((_, i) => Math.max(0, Math.min(95, Math.round((seed * (i + 3)) % 78 + ((seed + i * 5) % 17)))));

      /**
       * The dataset. \`phaseSeed\` nudges the sky's day/night grading; \`updatedMinutes\`
       * drives the "updated n minutes ago" stamp so the relative time is real.
       */
      export const CITIES = [
        {
          id: 'lisbon',
          name: 'Lisbon',
          region: 'Lisbon District',
          country: 'Portugal',
          timezone: 'WET (UTC+0)',
          lat: '38.7223 N',
          accent: '#f5a524',
          updatedMinutes: 4,
          current: {
            tempC: 24.6, feelsLikeC: 25.1, condition: 'clear', humidity: 41, windKph: 11,
            windDir: 'NW', uv: 7, visibilityKm: 24, pressure: 1018, dewC: 10.2, gustKph: 19,
          },
          daily: {
            lowC: 17.1, highC: 27.3, troughHour: 6,
            sunrise: '06:44', sunset: '20:36',
            conditions: ['clear', 'clear', 'partly', 'clear', 'wind', 'partly', 'clear'],
          },
        },
        {
          id: 'reykjavik',
          name: 'Reykjavik',
          region: 'Capital Region',
          country: 'Iceland',
          timezone: 'GMT (UTC+0)',
          lat: '64.1466 N',
          accent: '#5b8def',
          updatedMinutes: 11,
          current: {
            tempC: 3.8, feelsLikeC: -1.2, condition: 'snow', humidity: 78, windKph: 34,
            windDir: 'ENE', uv: 1, visibilityKm: 6, pressure: 1002, dewC: 0.4, gustKph: 58,
          },
          daily: {
            lowC: 0.4, highC: 6.2, troughHour: 4,
            sunrise: '09:12', sunset: '17:04',
            conditions: ['snow', 'snow', 'cloudy', 'overcast', 'drizzle', 'wind', 'partly'],
          },
        },
        {
          id: 'singapore',
          name: 'Singapore',
          region: 'Central Singapore',
          country: 'Singapore',
          timezone: 'SGT (UTC+8)',
          lat: '1.3521 N',
          accent: '#2fb87a',
          updatedMinutes: 2,
          current: {
            tempC: 30.2, feelsLikeC: 34.8, condition: 'thunder', humidity: 88, windKph: 7,
            windDir: 'S', uv: 8, visibilityKm: 9, pressure: 1009, dewC: 27.9, gustKph: 21,
          },
          daily: {
            lowC: 25.9, highC: 32.4, troughHour: 5,
            sunrise: '07:04', sunset: '19:18',
            conditions: ['thunder', 'rain', 'heavyrain', 'partly', 'thunder', 'cloudy', 'rain'],
          },
        },
        {
          id: 'vancouver',
          name: 'Vancouver',
          region: 'British Columbia',
          country: 'Canada',
          timezone: 'PST (UTC-8)',
          lat: '49.2827 N',
          accent: '#8b5cf6',
          updatedMinutes: 7,
          current: {
            tempC: 13.1, feelsLikeC: 12.4, condition: 'drizzle', humidity: 86, windKph: 14,
            windDir: 'SW', uv: 2, visibilityKm: 11, pressure: 1011, dewC: 10.9, gustKph: 27,
          },
          daily: {
            lowC: 9.8, highC: 16.7, troughHour: 5,
            sunrise: '06:32', sunset: '20:14',
            conditions: ['drizzle', 'overcast', 'rain', 'partly', 'cloudy', 'rain', 'partly'],
          },
        },
        {
          id: 'nairobi',
          name: 'Nairobi',
          region: 'Nairobi County',
          country: 'Kenya',
          timezone: 'EAT (UTC+3)',
          lat: '1.2921 S',
          accent: '#e5484d',
          updatedMinutes: 1,
          current: {
            tempC: 22.4, feelsLikeC: 22.1, condition: 'partly', humidity: 58, windKph: 16,
            windDir: 'ESE', uv: 9, visibilityKm: 19, pressure: 1015, dewC: 13.6, gustKph: 24,
          },
          daily: {
            lowC: 13.8, highC: 24.9, troughHour: 6,
            sunrise: '06:38', sunset: '18:42',
            conditions: ['clear', 'partly', 'partly', 'cloudy', 'partly', 'clear', 'wind'],
          },
        },
        {
          id: 'tokyo',
          name: 'Tokyo',
          region: 'Kanto',
          country: 'Japan',
          timezone: 'JST (UTC+9)',
          lat: '35.6762 N',
          accent: '#ec4899',
          updatedMinutes: 5,
          current: {
            tempC: 19.7, feelsLikeC: 19.2, condition: 'overcast', humidity: 72, windKph: 9,
            windDir: 'NE', uv: 3, visibilityKm: 14, pressure: 1014, dewC: 14.3, gustKph: 15,
          },
          daily: {
            lowC: 15.2, highC: 21.8, troughHour: 5,
            sunrise: '05:42', sunset: '18:08',
            conditions: ['overcast', 'cloudy', 'rain', 'overcast', 'partly', 'cloudy', 'partly'],
          },
        },
      ];

      const SEEDS = { lisbon: 4, reykjavik: 6, singapore: 2, vancouver: 5, nairobi: 7, tokyo: 3 };
      const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      /** \`YYYY-MM-DD\` for \`offset\` days from today, without touching UTC parsing. */
      const isoDay = (offset) => {
        const d = new Date();
        d.setDate(d.getDate() + offset);
        return (
          d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
        );
      };

      /** Expands the compact literals above into the shape the components consume. */
      const buildCity = (city) => {
        const hourly = hourlyTemps(city.daily.lowC, city.daily.highC, city.daily.troughHour);
        const lows = city.daily.conditions.map((_, i) => city.daily.lowC + i);
        const precip = dailyPrecip(SEEDS[city.id], lows);

        const forecast = city.daily.conditions.map((condition, i) => {
          const raw = isoDay(i);
          const [y, m, d] = raw.split('-').map(Number);
          const date = new Date(y, m - 1, d);

          return {
            id: city.id + '-' + i,
            iso: raw,
            weekday: i === 0 ? 'Today' : WEEKDAY_NAMES[date.getDay()],
            dateLabel: MONTH_NAMES[m - 1] + ' ' + d,
            fullDate: WEEKDAY_NAMES[date.getDay()] + ', ' + MONTH_NAMES[m - 1] + ' ' + d,
            condition,
            conditionLabel: CONDITIONS[condition].label,
            icon: CONDITIONS[condition].icon,
            sky: CONDITIONS[condition].sky,
            highC: Math.round(city.daily.highC - i * 0.6 + ((SEEDS[city.id] * (i + 1)) % 4) * 0.4),
            lowC: Math.round(city.daily.lowC + i * 0.3 - ((SEEDS[city.id] * (i + 2)) % 3) * 0.3),
            precipChance: precip[i],
            windKph: Math.round(city.current.windKph * (0.8 + ((SEEDS[city.id] + i) % 5) / 8)),
            sunrise: city.daily.sunrise,
            sunset: city.daily.sunset,
          };
        });

        return {
          ...city,
          conditionLabel: CONDITIONS[city.current.condition].label,
          icon: CONDITIONS[city.current.condition].icon,
          sky: CONDITIONS[city.current.condition].sky,
          today: forecast[0],
          hourly,
          forecast,
        };
      };

      /** Fully expanded dataset. This is the only source the components read. */
      export const WEATHER_DATA = CITIES.map(buildCity);

      /** Case-insensitive match over name, region and country. */
      export function searchCities(query) {
        const needle = String(query || '').trim().toLowerCase();
        if (!needle) return WEATHER_DATA;
        return WEATHER_DATA.filter((city) =>
          (city.name + ' ' + city.region + ' ' + city.country).toLowerCase().indexOf(needle) !== -1,
        );
      }

      /** Every tag in the forecast, de-duplicated, for the "conditions in this week" row. */
      export function conditionSpread(city) {
        const counts = new Map();
        for (const day of city.forecast) counts.set(day.condition, (counts.get(day.condition) || 0) + 1);
        return Array.from(counts.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([id, count]) => ({ id, label: CONDITIONS[id].label, icon: CONDITIONS[id].icon, count }));
      }`,
    },
    {
      path: 'utils/format.js',
      content: `      /** Unit conversion, time formatting and the day/night grading used for theming. */

      /** Celsius to Fahrenheit. */
      export const toFahrenheit = (c) => c * 1.8 + 32;

      /** Converts according to the active unit and rounds for display. */
      export const convertTemp = (celsius, unit) =>
        unit === 'F' ? Math.round(toFahrenheit(celsius)) : Math.round(celsius);

      /** Rounds to one decimal, for values shown with more precision than the headline. */
      export const convertTempPrecise = (celsius, unit) => {
        const value = unit === 'F' ? toFahrenheit(celsius) : celsius;
        return Math.round(value * 10) / 10;
      };

      /** Appends the degree sign. The unit letter is rendered separately in the markup. */
      export const degrees = (value) => String(value) + '°';

      /** 24h "07:05" -> "7:05 am", so the time column fits on a phone. */
      export function formatClock(hhmm) {
        const [h, m] = String(hhmm || '0:00').split(':').map(Number);
        const hour = Number.isFinite(h) ? h : 0;
        const suffix = hour >= 12 ? 'pm' : 'am';
        const twelve = hour % 12 === 0 ? 12 : hour % 12;
        return twelve + (m ? ':' + String(m).padStart(2, '0') : '') + suffix;
      }

      /** Minutes since midnight, for a "07:05" string. */
      export const minutesOf = (hhmm) => {
        const [h, m] = String(hhmm || '0:00').split(':').map(Number);
        return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
      };

      /**
       * Where the sun is, as a 0..1 fraction between sunrise and sunset.
       * Clamped at both ends, so before dawn reads 0 and after dusk reads 1.
       */
      export function sunProgress(sunrise, sunset, nowMinutes) {
        const start = minutesOf(sunrise);
        const end = minutesOf(sunset);
        const span = end - start;
        if (span <= 0) return 1;
        const ratio = (nowMinutes - start) / span;
        return Math.max(0, Math.min(1, ratio));
      }

      /**
       * Sky grading from the sun's position: \`night\` -> \`dawn\` -> \`day\` -> \`dusk\` -> \`night\`.
       * Used to pick the page gradient, so the theme follows the data rather than the OS.
       */
      export function skyPhase(sunrise, sunset, nowMinutes) {
        const start = minutesOf(sunrise);
        const end = minutesOf(sunset);
        if (nowMinutes < start - 70) return 'night';
        if (nowMinutes < start + 55) return 'dawn';
        if (nowMinutes < end - 60) return 'day';
        if (nowMinutes < end + 40) return 'dusk';
        return 'night';
      }

      /** "just now" / "6 min ago" / "2 h ago", from a minutes-old stamp. */
      export function relativeMinutes(minutes) {
        const n = Math.max(0, Math.round(minutes));
        if (n < 1) return 'just now';
        if (n === 1) return '1 min ago';
        if (n < 60) return n + ' min ago';
        const hours = Math.round(n / 60);
        if (hours === 1) return '1 hour ago';
        return hours + ' hours ago';
      }

      /** Wind direction to a compass point, from degrees. */
      export function compassPoint(degreesCycling) {
        const points = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round((((degreesCycling % 360) + 360) % 360) / 22.5) % 16;
        return points[index];
      }

      /** UV index band, used for both the label and the meter colour class. */
      export function uvBand(uv) {
        if (uv <= 2) return { label: 'Low', tone: 'low' };
        if (uv <= 5) return { label: 'Moderate', tone: 'moderate' };
        if (uv <= 7) return { label: 'High', tone: 'high' };
        if (uv <= 10) return { label: 'Very high', tone: 'veryhigh' };
        return { label: 'Extreme', tone: 'extreme' };
      }

      /** Humidity band for the same purpose. */
      export function humidityBand(humidity) {
        if (humidity < 30) return { label: 'Dry', tone: 'low' };
        if (humidity < 60) return { label: 'Comfortable', tone: 'moderate' };
        if (humidity < 80) return { label: 'Humid', tone: 'high' };
        return { label: 'Very humid', tone: 'veryhigh' };
      }

      /** Visibility band, in kilometres. */
      export function visibilityBand(km) {
        if (km >= 20) return { label: 'Excellent', tone: 'low' };
        if (km >= 10) return { label: 'Good', tone: 'moderate' };
        if (km >= 5) return { label: 'Moderate', tone: 'high' };
        return { label: 'Poor', tone: 'veryhigh' };
      }

      /** Beaufort-ish description from km/h. */
      export function windBand(kph) {
        if (kph < 2) return 'Calm';
        if (kph < 12) return 'Light breeze';
        if (kph < 29) return 'Moderate breeze';
        if (kph < 50) return 'Fresh wind';
        if (kph < 75) return 'Strong wind';
        return 'Gale force';
      }

      /** Wind speed in the active unit, with a gusts clause when asked for one. */
      export function formatWind(kph, unit, withGusts) {
        const speed = unit === 'F' ? Math.round(kph * 0.621371) : Math.round(kph);
        const label = unit === 'F' ? speed + ' mph' : speed + ' km/h';
        return withGusts ? ', gusts ' + (unit === 'F' ? Math.round(kph * 1.5 * 0.621371) : Math.round(kph * 1.5)) + ' ' + (unit === 'F' ? 'mph' : 'km/h') : label;
      }`,
    }
  ],
};
