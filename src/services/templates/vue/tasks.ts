export default {
  files: [
    {
      path: 'main.js',
      content: `      import { createApp } from 'vue';
      import App from './App.vue';

      // Styles must be a real .css file imported from the module graph - the bundler
      // collects CSS that way. The playground injects #app for us; guard the mount.
      import './style.css';

      const host = document.getElementById('app');

      if (host) {
        createApp(App).mount(host);
      }`,
    },
    {
      path: 'style.css',
      content: `      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');

      /* -- Tokens --------------------------------------------------- */
      :root {
        --font-display: 'Fraunces', Georgia, serif;
        --font-body: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

        --color-bg: #f5f6f9; --color-surface: #ffffff;
        --color-surface-2: #f8fafc;
        --color-ink: #131822;
        --color-ink-2: #4b5567;
        --color-ink-3: #838d9f;
        --color-border: #e3e7ef; --color-border-strong: #c9d0dd;

        --color-accent: #0f766e;
        --color-accent-2: #14b8a6;
        --color-accent-soft: #d7f2ee; --color-accent-ink: #ffffff;

        --color-high: #dc2626; --color-high-soft: #fdeaea; --color-medium: #b45309;
        --color-medium-soft: #fdf2e0; --color-low: #2563eb; --color-low-soft: #e6eefd; --color-done: #15803d;
        --color-done-soft: #e3f5e9; --color-soon: #b45309;

        --space-1: 0.25rem;
        --space-2: 0.5rem;
        --space-3: 0.75rem;
        --space-4: 1rem;
        --space-5: 1.5rem;
        --space-6: 2rem;

        --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px; --radius-pill: 999px;

        --shadow-1: 0 1px 2px rgba(19, 24, 34, 0.05), 0 1px 3px rgba(19, 24, 34, 0.04);
        --shadow-2: 0 5px 16px rgba(19, 24, 34, 0.09);
        --shadow-3: 0 18px 44px rgba(19, 24, 34, 0.17);

        --ring: 0 0 0 3px rgba(15, 118, 110, 0.4); --tap: 40px;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --color-bg: #0c1013; --color-surface: #141a1e;
          --color-surface-2: #1b2328;
          --color-ink: #edf2f1;
          --color-ink-2: #b2bec0;
          --color-ink-3: #7f8c90;
          --color-border: #242e33; --color-border-strong: #35424a; --color-accent: #2dd4bf;
          --color-accent-2: #5eead4;
          --color-accent-soft: #10322f; --color-accent-ink: #06201e; --color-high: #f87171;
          --color-high-soft: #341a1a; --color-medium: #f0b357; --color-medium-soft: #33260f;
          --color-low: #7fb0ff; --color-low-soft: #14243b; --color-done: #4ade80; --color-done-soft: #102a1b;
          --color-soon: #f0b357;
          --shadow-1: 0 1px 2px rgba(0, 0, 0, 0.4);
          --shadow-2: 0 5px 16px rgba(0, 0, 0, 0.45);
          --shadow-3: 0 18px 44px rgba(0, 0, 0, 0.6);
        }
      }

      /* -- Base ----------------------------------------------------- */
      *, *::before, *::after { box-sizing: border-box; }

      body {
        margin: 0; padding: 0; font-family: var(--font-body); font-size: 15px; line-height: 1.55;
        color: var(--color-ink); background: var(--color-bg); -webkit-font-smoothing: antialiased;
      }

      #app { min-height: 100vh; }
      h1, h2, h3 { font-family: var(--font-display); font-weight: 600; letter-spacing: -0.01em; margin: 0; }
      p { margin: 0; }
      ul { margin: 0; padding: 0; list-style: none; }
      button { font: inherit; }
      code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.86em; background: var(--color-bg); padding: 0.1em 0.4em; border-radius: var(--radius-sm); }

      .sr-only {
        position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
        overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
      }

      .skip-link {
        position: absolute; left: var(--space-3); top: -70px; z-index: 60;
        padding: var(--space-2) var(--space-4); background: var(--color-accent); color: var(--color-accent-ink);
        border-radius: var(--radius-sm); text-decoration: none; font-weight: 600; transition: top 160ms ease;
      }
      .skip-link:focus { top: var(--space-3); }

      :where(a, button, input, select, textarea, [tabindex]):focus-visible {
        outline: 2px solid transparent; box-shadow: var(--ring); border-radius: var(--radius-sm);
      }

      .app {
        min-height: 100vh;
        background: radial-gradient(1000px 480px at 10% -10%, var(--color-accent-soft), transparent 60%), var(--color-bg);
      }

      /* -- Topbar --------------------------------------------------- */
      .topbar {
        position: sticky; top: 0; z-index: 20;
        display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap;
        padding: var(--space-3) clamp(var(--space-4), 3vw, var(--space-6));
        background: color-mix(in srgb, var(--color-surface) 84%, transparent);
        backdrop-filter: blur(12px); border-bottom: 1px solid var(--color-border);
      }
      .topbar__brand { display: flex; align-items: center; gap: var(--space-3); }
      .topbar__mark {
        display: grid; place-items: center; width: 38px; height: 38px; color: #fff;
        background: linear-gradient(140deg, var(--color-accent), var(--color-accent-2));
        border-radius: var(--radius-md); box-shadow: var(--shadow-1);
      }
      .topbar__title { font-size: 1.15rem; }
      .topbar__sub, .topbar__stamp { font-size: 0.78rem; color: var(--color-ink-3); }
      .topbar__stamp-warn { color: var(--color-high); font-weight: 600; }

      .layout {
        display: grid; grid-template-columns: minmax(0, 21rem) minmax(0, 1fr);
        gap: clamp(var(--space-4), 2vw, var(--space-6)); align-items: start;
        padding: clamp(var(--space-4), 2.4vw, var(--space-6)); max-width: 1380px; margin: 0 auto;
      }

      .panel {
        padding: clamp(var(--space-4), 1.6vw, var(--space-5));
        background: var(--color-surface); border: 1px solid var(--color-border);
        border-radius: var(--radius-lg); box-shadow: var(--shadow-1);
      }
      .panel--list { display: grid; gap: var(--space-4); }

      /* -- Form ----------------------------------------------------- */
      .form { display: grid; gap: var(--space-3); }
      .form__head { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); flex-wrap: wrap; }
      .form__title { display: flex; align-items: center; gap: var(--space-2); font-size: 1.02rem; }
      .form__row { display: flex; gap: var(--space-3); flex-wrap: wrap; }
      .form__actions { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
      .form__hint { font-size: 0.74rem; color: var(--color-ink-3); }

      .field { display: grid; gap: 6px; min-width: 0; flex: 1 1 8rem; }
      .field__label { font-size: 0.74rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-ink-3); }
      .field__foot { display: flex; justify-content: flex-end; }
      .counter { font-size: 0.72rem; color: var(--color-ink-3); font-variant-numeric: tabular-nums; }
      .counter--warn { color: var(--color-medium); font-weight: 700; }

      .input {
        width: 100%; min-height: var(--tap); padding: var(--space-2) var(--space-3);
        font: inherit; font-size: 0.9rem; color: var(--color-ink);
        background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md);
        transition: border-color 140ms ease, box-shadow 140ms ease;
      }
      .input::placeholder { color: var(--color-ink-3); }
      .input:hover { border-color: var(--color-border-strong); }
      .input:focus-visible { border-color: var(--color-accent); box-shadow: var(--ring); }
      .input--area { min-height: 60px; resize: vertical; }
      .input--select, .input--date { min-height: 38px; padding: 4px var(--space-2); }
      .input--inline { font-size: 0.92rem; }
      .input--note { font-size: 0.84rem; }

      .form__error {
        display: flex; align-items: center; gap: 6px; padding: var(--space-2) var(--space-3);
        font-size: 0.8rem; font-weight: 500; color: var(--color-high);
        background: var(--color-high-soft); border: 1px solid color-mix(in srgb, var(--color-high) 34%, transparent);
        border-radius: var(--radius-sm); animation: shake 320ms ease;
      }

      /* -- Buttons -------------------------------------------------- */
      .button {
        display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2);
        min-height: var(--tap); padding: var(--space-2) var(--space-4);
        font: inherit; font-size: 0.9rem; font-weight: 600; color: var(--color-ink);
        background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md);
        cursor: pointer;
        transition: transform 140ms ease, background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
      }
      .button:hover:not(:disabled) { border-color: var(--color-border-strong); box-shadow: var(--shadow-1); }
      .button:active:not(:disabled) { transform: translateY(1px); }
      .button:disabled { opacity: 0.45; cursor: not-allowed; }
      .button--primary {
        color: var(--color-accent-ink); background: var(--color-accent); border-color: transparent;
        background-image: linear-gradient(100deg, transparent 20%, rgba(255, 255, 255, 0.26) 50%, transparent 80%);
        background-size: 220% 100%; background-position: 180% 0;
      }
      .button--primary:hover:not(:disabled) { background-position: 0 0; transition: transform 140ms ease, background-position 600ms ease, box-shadow 140ms ease; }
      .button--quiet { background: transparent; }
      .button--tiny { min-height: 30px; padding: 2px var(--space-3); font-size: 0.8rem; border-radius: var(--radius-pill); }

      .ghost {
        display: inline-flex; align-items: center; gap: 6px; min-height: 34px; padding: 4px var(--space-3);
        font: inherit; font-size: 0.82rem; color: var(--color-ink-2);
        background: transparent; border: 1px solid var(--color-border); border-radius: var(--radius-pill); cursor: pointer;
        transition: color 140ms ease, border-color 140ms ease, background-color 140ms ease;
      }
      .ghost:hover:not(:disabled) { color: var(--color-ink); background: var(--color-surface-2); border-color: var(--color-border-strong); }
      .ghost:disabled { opacity: 0.4; cursor: not-allowed; }
      .ghost--danger:hover:not(:disabled) { color: var(--color-high); background: var(--color-high-soft); border-color: var(--color-high); }
      .ghost--tiny { min-height: 28px; padding: 2px var(--space-2); font-size: 0.74rem; }

      .icon-btn {
        display: grid; place-items: center; width: 32px; height: 32px;
        color: var(--color-ink-3); background: transparent; border: 1px solid transparent;
        border-radius: var(--radius-sm); cursor: pointer;
        transition: color 140ms ease, background-color 140ms ease;
      }
      .icon-btn:hover:not(:disabled) { color: var(--color-ink); background: var(--color-bg); }
      .icon-btn:disabled { opacity: 0.28; cursor: not-allowed; }
      .icon-btn--danger:hover:not(:disabled) { color: var(--color-high); background: var(--color-high-soft); }
      .icon-btn--go:hover:not(:disabled) { color: var(--color-done); background: var(--color-done-soft); }

      /* -- Filters -------------------------------------------------- */
      .filters {
        display: grid; gap: var(--space-3); padding: var(--space-3);
        background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md);
      }
      .filters__row { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
      .filters__row--tags { align-items: baseline; }
      .filters__taglabel { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-ink-3); }
      .filters__tail { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
      .filters__status { font-size: 0.76rem; color: var(--color-ink-3); margin-left: auto; }

      .search { position: relative; display: flex; align-items: center; flex: 1 1 14rem; }
      .search__icon { position: absolute; left: var(--space-3); color: var(--color-ink-3); pointer-events: none; }
      .search__input { padding-left: 2.4rem; padding-right: 2.2rem; }
      .search__input::-webkit-search-cancel-button { display: none; }
      .search__clear {
        position: absolute; right: 6px; display: grid; place-items: center; width: 26px; height: 26px;
        color: var(--color-ink-3); background: transparent; border: 0; border-radius: var(--radius-sm); cursor: pointer;
      }
      .search__clear:hover { color: var(--color-ink); background: var(--color-bg); }

      .pills { display: flex; gap: 6px; }
      .pill {
        display: inline-flex; align-items: center; gap: 6px; min-height: 32px; padding: 3px var(--space-3);
        font: inherit; font-size: 0.82rem; font-weight: 500; color: var(--color-ink-2);
        background: transparent; border: 1px solid var(--color-border); border-radius: var(--radius-pill); cursor: pointer;
        transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
      }
      .pill:hover { color: var(--color-ink); border-color: var(--color-border-strong); }
      .pill--on { color: var(--color-accent-ink); background: var(--color-accent); border-color: transparent; font-weight: 600; }
      .pill__count { padding: 0 6px; font-size: 0.7rem; font-variant-numeric: tabular-nums; border-radius: var(--radius-pill); background: color-mix(in srgb, currentColor 16%, transparent); }

      .chips { display: flex; gap: 5px; flex-wrap: wrap; }
      .chip {
        display: inline-flex; align-items: center; gap: 4px; padding: 2px var(--space-2);
        font: inherit; font-size: 0.72rem; color: var(--color-ink-2);
        background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer;
        transition: color 140ms ease, border-color 140ms ease;
      }
      .chip:hover { color: var(--color-ink); border-color: var(--color-border-strong); }
      .chip--on { color: var(--color-accent); background: var(--color-accent-soft); border-color: color-mix(in srgb, var(--color-accent) 50%, transparent); font-weight: 600; }
      .chip__count { font-variant-numeric: tabular-nums; color: var(--color-ink-3); }

      .select {
        min-height: 34px; padding: 4px var(--space-2); font: inherit; font-size: 0.82rem; color: var(--color-ink);
        background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer;
      }

      /* -- Stats ---------------------------------------------------- */
      .stats { display: grid; gap: var(--space-3); margin-top: var(--space-5); padding-top: var(--space-4); border-top: 1px solid var(--color-border); }
      .stats__ring { display: flex; align-items: center; gap: var(--space-3); }
      .stats__ring-note { font-size: 0.78rem; color: var(--color-ink-2); }
      .stats__overdue { color: var(--color-high); font-weight: 600; }

      .ring { flex: 0 0 auto; }
      .ring__track { stroke: var(--color-border); }
      .ring__value { stroke: var(--color-accent); transition: stroke-dashoffset 700ms cubic-bezier(0.3, 0.8, 0.3, 1); }
      .ring__value--half { stroke: var(--color-medium); }
      .ring__value--low { stroke: var(--color-high); }
      .ring__text { font-family: var(--font-display); font-size: 22px; font-weight: 600; fill: var(--color-ink); }
      .ring__sub { font-family: var(--font-body); font-size: 9px; fill: var(--color-ink-3); letter-spacing: 0.08em; }

      .stats__tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(4.2rem, 1fr)); gap: var(--space-2); }
      .stat { display: grid; gap: 2px; padding: var(--space-2) var(--space-3); background: var(--color-surface-2); border: 1px solid var(--color-border); border-left-width: 3px; border-radius: var(--radius-md); }
      .stat dt { font-size: 0.64rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-ink-3); }
      .stat dd { margin: 0; font-family: var(--font-display); font-size: 1.35rem; line-height: 1.1; font-variant-numeric: tabular-nums; }
      .stat--open { border-left-color: var(--color-accent); }
      .stat--open dd { color: var(--color-accent); }
      .stat--done { border-left-color: var(--color-done); }
      .stat--done dd { color: var(--color-done); }
      .stat--overdue { border-left-color: var(--color-high); }
      .stat--overdue dd { color: var(--color-high); }
      .stat--total { border-left-color: var(--color-border-strong); }
      .stat--zero { border-left-color: var(--color-border-strong); }
      .stat--zero dd { color: var(--color-ink-3); }

      .spark { display: grid; gap: 4px; }
      .spark__label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-ink-3); }
      .spark__svg { width: 100%; height: 30px; display: block; overflow: visible; }
      .spark__bar {
        fill: var(--color-accent);
        animation: grow 460ms cubic-bezier(0.2, 0.7, 0.3, 1) backwards;
        transform-box: fill-box;
        transform-origin: bottom;
      }
      .spark__bar--empty { fill: var(--color-border); }
      .spark__days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
      .spark__day { font-size: 0.6rem; text-align: center; color: var(--color-ink-3); }

      /* -- List ----------------------------------------------------- */
      .list { display: grid; gap: var(--space-2); }

      .item {
        position: relative; display: grid; gap: var(--space-3);
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: start; padding: var(--space-3) var(--space-3) var(--space-3) var(--space-4);
        background: var(--color-surface-2); border: 1px solid var(--color-border);
        border-radius: var(--radius-md); overflow: hidden;
        animation: item-in 300ms cubic-bezier(0.2, 0.7, 0.3, 1) backwards;
        transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
      }
      .item__rail { position: absolute; inset: 0 auto 0 0; width: 4px; background: var(--color-low); }
      .item--high .item__rail { background: var(--color-high); }
      .item--medium .item__rail { background: var(--color-medium); }
      .item--low .item__rail { background: var(--color-low); }
      .item:hover { border-color: var(--color-border-strong); box-shadow: var(--shadow-2); transform: translateY(-1px); }
      .item--editing { border-color: var(--color-accent); background: var(--color-surface); }
      .item--done { background: color-mix(in srgb, var(--color-done-soft) 52%, var(--color-surface-2)); }
      .item--done .item__title { text-decoration: line-through; color: var(--color-ink-3); }

      .item:nth-child(1) { animation-delay: 20ms; }
      .item:nth-child(2) { animation-delay: 50ms; }
      .item:nth-child(3) { animation-delay: 80ms; }
      .item:nth-child(4) { animation-delay: 110ms; }
      .item:nth-child(5) { animation-delay: 140ms; }
      .item:nth-child(6) { animation-delay: 170ms; }
      .item:nth-child(7) { animation-delay: 200ms; }
      .item:nth-child(n + 8) { animation-delay: 230ms; }

      .item__body { min-width: 0; }
      .item__title { font-size: 0.94rem; font-weight: 600; overflow-wrap: anywhere; }
      .item__note { font-size: 0.82rem; color: var(--color-ink-2); overflow-wrap: anywhere; }
      .item__meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: var(--space-2); }
      .item__actions { display: flex; align-items: center; gap: 2px; opacity: 0.55; transition: opacity 160ms ease; }
      .item:hover .item__actions, .item:focus-within .item__actions { opacity: 1; }
      .item__editor { display: grid; gap: var(--space-2); grid-column: 2 / -1; }
      .item__editor-actions { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
      .item__hint { font-size: 0.72rem; color: var(--color-ink-3); }

      .badge {
        padding: 1px var(--space-2); font-size: 0.66rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.05em; border-radius: var(--radius-sm);
      }
      .badge--high { color: var(--color-high); background: var(--color-high-soft); }
      .badge--medium { color: var(--color-medium); background: var(--color-medium-soft); }
      .badge--low { color: var(--color-low); background: var(--color-low-soft); }

      .meta {
        display: inline-flex; align-items: center; gap: 4px; padding: 1px var(--space-2);
        font-size: 0.72rem; color: var(--color-ink-2);
        background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm);
      }
      .meta--today { color: var(--color-medium); background: var(--color-medium-soft); border-color: color-mix(in srgb, var(--color-medium) 40%, transparent); }
      .meta--soon { color: var(--color-soon); border-color: color-mix(in srgb, var(--color-soon) 32%, transparent); }
      .meta--overdue { color: var(--color-high); background: var(--color-high-soft); border-color: color-mix(in srgb, var(--color-high) 40%, transparent); font-weight: 700; }

      .tag {
        display: inline-flex; align-items: center; gap: 4px; padding: 1px var(--space-2);
        font: inherit; font-size: 0.7rem; color: var(--color-ink-2);
        background: var(--color-surface); border: 1px solid var(--color-border);
        border-radius: var(--radius-sm); cursor: pointer;
        transition: color 140ms ease, border-color 140ms ease;
      }
      .tag:hover { color: var(--color-ink); border-color: var(--color-border-strong); }
      .tag--add { color: var(--color-ink-3); border-style: dashed; }
      .tag--add:hover { color: var(--color-accent); border-color: var(--color-accent); }

      .check { display: grid; place-items: center; padding-top: 2px; cursor: pointer; }
      .check__input { position: absolute; width: 1px; height: 1px; opacity: 0; }
      .check__box {
        display: grid; place-items: center; width: 22px; height: 22px; color: transparent;
        background: var(--color-surface); border: 1.5px solid var(--color-border-strong); border-radius: 7px;
        transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease;
      }
      .check:hover .check__box { border-color: var(--color-accent); }
      .check__input:checked + .check__box { color: #fff; background: var(--color-done); border-color: var(--color-done); animation: pop 260ms cubic-bezier(0.34, 1.56, 0.64, 1); }
      .check__input:focus-visible + .check__box { box-shadow: var(--ring); }

      /* -- Skeleton / empty ----------------------------------------- */
      .skeleton {
        display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--space-3);
        padding: var(--space-3); background: var(--color-surface-2);
        border: 1px solid var(--color-border); border-radius: var(--radius-md);
      }
      .skeleton__box {
        width: 22px; height: 22px; border-radius: 7px;
        background: linear-gradient(90deg, var(--color-border) 25%, var(--color-border-strong) 37%, var(--color-border) 63%);
        background-size: 400% 100%; animation: shimmer 1.4s ease-in-out infinite;
      }
      .skeleton__lines { display: grid; gap: 6px; }
      .skeleton__line {
        height: 0.75rem; border-radius: 4px;
        background: linear-gradient(90deg, var(--color-border) 25%, var(--color-border-strong) 37%, var(--color-border) 63%);
        background-size: 400% 100%; animation: shimmer 1.4s ease-in-out infinite;
      }
      .skeleton__line--short { width: 42%; animation-delay: 120ms; }

      .empty {
        display: grid; justify-items: center; gap: var(--space-2);
        padding: var(--space-7) var(--space-4); text-align: center;
        border: 1px dashed var(--color-border-strong); border-radius: var(--radius-md);
        animation: fade-up 300ms ease backwards;
      }
      .empty__glyph { display: grid; place-items: center; width: 56px; height: 56px; color: var(--color-accent); background: var(--color-accent-soft); border-radius: 50%; }
      .empty__title { font-size: 1.02rem; }
      .empty__body { max-width: 34ch; font-size: 0.85rem; color: var(--color-ink-2); }
      .empty__meta { font-size: 0.74rem; color: var(--color-ink-3); }

      .list__foot { display: grid; gap: var(--space-1); padding-top: var(--space-3); border-top: 1px solid var(--color-border); font-size: 0.76rem; color: var(--color-ink-3); }

      /* -- Toast ---------------------------------------------------- */
      .toast {
        position: fixed; left: 50%; bottom: var(--space-5); z-index: 40;
        display: flex; align-items: center; gap: var(--space-3); width: min(30rem, calc(100vw - 2rem));
        padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4);
        color: var(--color-bg); background: var(--color-ink); border-radius: var(--radius-md); box-shadow: var(--shadow-3);
        opacity: 0; transform: translate(-50%, 150%); visibility: hidden;
        transition: transform 260ms cubic-bezier(0.2, 0.8, 0.3, 1), opacity 220ms ease, visibility 0s linear 260ms;
      }
      .toast--in {
        opacity: 1; transform: translate(-50%, 0); visibility: visible;
        transition: transform 320ms cubic-bezier(0.34, 1.4, 0.64, 1), opacity 200ms ease;
      }
      .toast__label { display: flex; align-items: center; gap: var(--space-2); min-width: 0; font-size: 0.82rem; }
      .toast__actions { display: flex; align-items: center; gap: var(--space-2); margin-left: auto; }
      .toast .button--tiny { color: var(--color-bg); background: rgba(255, 255, 255, 0.13); border-color: transparent; }
      .toast .icon-btn { color: color-mix(in srgb, var(--color-bg) 70%, transparent); }

      /* -- Animations ----------------------------------------------- */
      @keyframes item-in { from { opacity: 0; transform: translateY(10px) scale(0.985); } to { opacity: 1; transform: none; } }
      @keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      @keyframes pop { 0% { transform: scale(1); } 45% { transform: scale(1.22); } 100% { transform: scale(1); } }
      @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
      @keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }
      @keyframes grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }

      /* -- Responsive ----------------------------------------------- */
      @media (max-width: 940px) {
        .layout { grid-template-columns: minmax(0, 1fr); }
      }

      @media (max-width: 560px) {
        .topbar__stamp { display: none; }
        .item { grid-template-columns: auto minmax(0, 1fr); }
        .item__actions { grid-column: 2; justify-content: flex-end; }
        .filters__status { margin-left: 0; }
        .toast { flex-wrap: wrap; }
      }

      /* -- Reduced motion ------------------------------------------- */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important; animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important; scroll-behavior: auto !important;
        }
        /* The staggered entrance would otherwise leave rows invisible. */
        .item, .spark__bar { animation: none; opacity: 1; transform: none; }
      }`,
    },
    {
      path: 'App.vue',
      content: `      <script setup>
      import { computed, onBeforeUnmount, onMounted } from 'vue';
      import TaskForm from './components/TaskForm.vue';
      import TaskItem from './components/TaskItem.vue';
      import TaskFilters from './components/TaskFilters.vue';
      import TaskStats from './components/TaskStats.vue';
      import { useTasks } from './composables/useTasks.js';
      import { TAG_LIBRARY } from './data/seed.js';

      /**
       * Composition root.
       *
       * All state comes from one composable. The only things this component owns are
       * the Escape-to-dismiss handler and the derived handle for "the task currently
       * being edited".
       */
      const {
        tasks,
        visible,
        stats,
        tagCounts,
        isSearching,
        filter,
        query,
        sort,
        tag,
        editingId,
        loading,
        toast,
        addTask,
        update,
        toggle,
        remove,
        toggleTag,
        clearCompleted,
        toggleAll,
        move,
        undo,
        dismissToast,
        resetFilters,
      } = useTasks();

      const editing = computed(() => tasks.value.find((task) => task.id === editingId.value) || null);

      /** Counts for the status pills, derived once rather than three times. */
      const pillCounts = computed(() => ({
        all: tasks.value.length,
        active: stats.value.open,
        done: stats.value.done,
      }));

      const libraryTags = TAG_LIBRARY;

      /** Escape closes the toast first, then the editor, then the open form. */
      const onKeydown = (event) => {
        if (event.key !== 'Escape') return;
        if (toast.value) {
          dismissToast();
          return;
        }
        if (editingId.value) editingId.value = null;
      };

      onMounted(() => document.addEventListener('keydown', onKeydown));
      onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));

      const startEdit = (id) => {
        editingId.value = id;
      };

      const saveEdit = (id, patch) => {
        update(id, patch);
        editingId.value = null;
      };
      </script>

      <template>
        <div class="app">
          <a class="skip-link" href="#task-list">Skip to the task list</a>

          <header class="topbar">
            <div class="topbar__brand">
              <span class="topbar__mark" aria-hidden="true">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round" focusable="false">
                  <path d="m20.5 7.2-8-4.7a1.5 1.5 0 0 0-1.5 0l-8 4.7A1.5 1.5 0 0 0 2 8.4v7.2a1.5 1.5 0 0 0 .75 1.3l8 4.7a1.5 1.5 0 0 0 1.5 0l8-4.7a1.5 1.5 0 0 0 .75-1.3V8.4a1.5 1.5 0 0 0-.5-1.2Z" />
                  <path d="m2.5 7.5 9.5 5.6 9.5-5.6M12 21.4v-8.3" />
                </svg>
              </span>
              <div>
                <h1 class="topbar__title">Cadence</h1>
                <p class="topbar__sub">Vue 3 task manager, Composition API</p>
              </div>
            </div>

            <p class="topbar__stamp" role="status" aria-live="polite">
              {{ stats.open }} open &middot; {{ stats.done }} done
              <span v-if="stats.overdue > 0" class="topbar__stamp-warn">&middot; {{ stats.overdue }} overdue</span>
            </p>
          </header>

          <main class="layout">
            <section class="panel panel--form" aria-label="Create or edit a task">
              <TaskForm :editing="editing" @create="addTask" @update="saveEdit" @cancel-edit="editingId = null" />

              <TaskStats
                :total="stats.total"
                :done="stats.done"
                :open="stats.open"
                :overdue="stats.overdue"
                :percent="stats.percent"
                :tasks="tasks"
              />
            </section>

            <section class="panel panel--list" aria-label="Task list">
              <TaskFilters
                :filter="filter"
                :query="query"
                :sort="sort"
                :tag="tag"
                :tag-counts="tagCounts"
                :counts="pillCounts"
                :visible-count="visible.length"
                :total-count="stats.total"
                :is-searching="isSearching"
                @update:filter="filter = $event"
                @update:query="query = $event"
                @update:sort="sort = $event"
                @update:tag="tag = $event"
                @toggle-all="toggleAll"
                @clear-done="clearCompleted"
                @reset-filters="resetFilters"
              />

              <div id="task-list">
                <!-- Loading skeleton, shown until the first storage read resolves. -->
                <ul v-if="loading" class="list" aria-busy="true" aria-label="Loading tasks">
                  <li v-for="n in 4" :key="'sk-' + n" class="skeleton">
                    <span class="skeleton__box" aria-hidden="true"></span>
                    <span class="skeleton__lines" aria-hidden="true">
                      <span class="skeleton__line"></span>
                      <span class="skeleton__line skeleton__line--short"></span>
                    </span>
                    <span class="sr-only">Loading your tasks</span>
                  </li>
                </ul>

                <ul v-else-if="visible.length" class="list">
                  <TaskItem
                    v-for="(task, index) in visible"
                    :key="task.id"
                    :task="task"
                    :is-editing="editingId === task.id"
                    :is-first="index === 0"
                    :is-last="index === visible.length - 1"
                    :library-tags="libraryTags"
                    @toggle="toggle"
                    @edit="startEdit"
                    @save="(id, patch) => saveEdit(id, patch)"
                    @cancel-edit="editingId = null"
                    @remove="remove"
                    @move="move"
                    @toggle-tag="toggleTag"
                  />
                </ul>

                <div v-else class="empty" role="status">
                  <span class="empty__glyph" aria-hidden="true">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
                      stroke-linecap="round" stroke-linejoin="round" focusable="false">
                      <path v-if="isSearching" d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3" />
                      <path v-else d="M4 13h4l2 3h4l2-3h4M4 13 6.5 5h11L20 13v6H4v-6Z" />
                    </svg>
                  </span>

                  <h2 class="empty__title">
                    {{ isSearching ? 'Nothing matches those filters' : 'No tasks yet' }}
                  </h2>
                  <p class="empty__body">
                    {{
                      isSearching
                        ? 'Try a shorter search term, or widen the filter to include finished work.'
                        : 'Add your first task on the left. Press Enter in the name field to save it.'
                    }}
                  </p>

                  <button v-if="isSearching" type="button" class="button button--quiet" @click="resetFilters">
                    Reset filters
                  </button>
                  <p v-else class="empty__meta">{{ stats.total }} task{{ stats.total === 1 ? '' : 's' }} in total</p>
                </div>
              </div>

              <footer class="list__foot">
                <p>Saved to <code>localStorage</code> under <code>gbcoder.vue-tasks.tasks.v1</code>.</p>
                <p class="list__foot-tip">
                  Filtering and sorting are <code>computed</code>, so they never reset what you are typing.
                </p>
              </footer>
            </section>
          </main>

          <!-- Undo toast. Escape dismisses it; the timer does too. -->
          <div
            class="toast"
            :class="{ 'toast--in': toast }"
            role="status"
            aria-live="polite"
            :aria-hidden="!toast"
          >
            <span class="toast__label">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
              </svg>
              {{ toast ? toast.message : '' }}
            </span>

            <div class="toast__actions">
              <button type="button" class="button button--tiny" :disabled="!toast" @click="undo">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"
                  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                  <path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3" />
                </svg>
                Undo
              </button>
              <button type="button" class="icon-btn" :disabled="!toast" aria-label="Dismiss undo" @click="dismissToast">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" aria-hidden="true" focusable="false">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </template>`,
    },
    {
      path: 'components/ProgressRing.vue',
      content: `      <script setup>
      import { computed } from 'vue';

      /**
       * Circular completion gauge.
       *
       * The sweep is a \`stroke-dashoffset\` attribute against a circle normalised to
       * \`pathLength="100"\`, so the geometry is \`100 - percent\` and nothing needs an
       * inline style. \`vector-effect="non-scaling-stroke"\` keeps the ring the same
       * weight however the SVG is scaled.
       */
      const props = defineProps({
        percent: { type: Number, required: true },
        label: { type: String, default: 'Completion' },
        size: { type: Number, default: 116 },
        thickness: { type: Number, default: 9 },
      });

      const radius = computed(() => (props.size - props.thickness) / 2);
      const offset = computed(() => String(100 - Math.max(0, Math.min(100, props.percent))));
      const tone = computed(() => {
        if (props.percent >= 100) return 'full';
        if (props.percent >= 50) return 'half';
        return 'low';
      });
      </script>

      <template>
        <div class="ring" role="img" :aria-label="label + ': ' + Math.round(percent) + ' percent'">
          <svg :width="size" :height="size" :viewBox="'0 0 ' + size + ' ' + size" aria-hidden="true" focusable="false">
            <circle
              class="ring__track"
              :cx="size / 2"
              :cy="size / 2"
              :r="radius"
              :stroke-width="thickness"
              fill="none"
            />
            <circle
              class="ring__value"
              :class="'ring__value--' + tone"
              :cx="size / 2"
              :cy="size / 2"
              :r="radius"
              :stroke-width="thickness"
              fill="none"
              stroke-linecap="round"
              pathLength="100"
              stroke-dasharray="100"
              :stroke-dashoffset="offset"
              :transform="'rotate(-90 ' + size / 2 + ' ' + size / 2 + ')'"
            />
            <text class="ring__text" x="50%" y="50%" text-anchor="middle" dy="0.12em">{{ Math.round(percent) }}%</text>
            <text class="ring__sub" x="50%" y="50%" text-anchor="middle" dy="1.55em">done</text>
          </svg>
        </div>
      </template>`,
    },
    {
      path: 'components/TaskFilters.vue',
      content: `      <script setup>
      import { computed } from 'vue';
      import { FILTERS, SORTS } from '../utils/labels.js';

      /*
       * Imported bindings are usable in \`<script setup>\` templates directly, but
       * assigning them to local consts reads better in the markup and keeps the
       * option lists obviously the source of truth for both loops.
       */
      const filterOptions = FILTERS;
      const sortOptions = SORTS;

      const props = defineProps({
        filter: { type: String, required: true },
        query: { type: String, required: true },
        sort: { type: String, required: true },
        tag: { type: String, required: true },
        tagCounts: { type: Array, required: true },
        counts: { type: Object, required: true },
        visibleCount: { type: Number, required: true },
        totalCount: { type: Number, required: true },
        isSearching: { type: Boolean, required: true },
      });

      const emit = defineEmits([
        'update:filter',
        'update:query',
        'update:sort',
        'update:tag',
        'toggle-all',
        'clear-done',
        'reset-filters',
      ]);

      /** Count shown on each status pill. */
      const pillCount = (id) => {
        if (id === 'all') return props.counts.all;
        if (id === 'active') return props.counts.active;
        return props.counts.done;
      };

      /** Flips between the two <select> bindings without a computed per option. */
      const onFilter = (event) => emit('update:filter', event.target.value);
      const onSort = (event) => emit('update:sort', event.target.value);
      const onTag = (event) => emit('update:tag', event.target.value);

      const statusLine = computed(() =>
        props.isSearching
          ? 'Showing ' + props.visibleCount + ' of ' + props.totalCount + ' after filtering.'
          : 'Showing all ' + props.totalCount + ' tasks.',
      );
      </script>

      <template>
        <section class="filters" aria-labelledby="filters-title">
          <h2 class="sr-only" id="filters-title">Filter and sort tasks</h2>

          <div class="filters__row">
            <div class="search">
              <label class="sr-only" for="task-search">Search tasks</label>
              <svg class="search__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3" />
              </svg>
              <input
                id="task-search"
                class="search__input"
                type="search"
                :value="query"
                placeholder="Search title, note or tag"
                autocomplete="off"
                @input="emit('update:query', $event.target.value)"
              />
              <button
                v-if="query"
                type="button"
                class="search__clear"
                aria-label="Clear search"
                @click="emit('update:query', '')"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" aria-hidden="true" focusable="false">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div class="pills" role="group" aria-label="Filter by status">
              <button
                v-for="option in filterOptions"
                :key="option.id"
                type="button"
                class="pill"
                :class="{ 'pill--on': filter === option.id }"
                :aria-pressed="filter === option.id"
                @click="emit('update:filter', option.id)"
              >
                {{ option.label }}
                <span class="pill__count">{{ pillCount(option.id) }}</span>
              </button>
            </div>
          </div>

          <div v-if="tagCounts.length" class="filters__row filters__row--tags">
            <span class="filters__taglabel" id="tag-label">Tags</span>
            <div class="chips" role="group" aria-labelledby="tag-label">
              <button
                type="button"
                class="chip"
                :class="{ 'chip--on': tag === 'all' }"
                :aria-pressed="tag === 'all'"
                @click="emit('update:tag', 'all')"
              >
                all
              </button>
              <button
                v-for="entry in tagCounts"
                :key="entry.id"
                type="button"
                class="chip"
                :class="{ 'chip--on': tag === entry.id }"
                :aria-pressed="tag === entry.id"
                @click="emit('update:tag', tag === entry.id ? 'all' : entry.id)"
              >
                {{ entry.id }}
                <span class="chip__count">{{ entry.count }}</span>
              </button>
            </div>
          </div>

          <div class="filters__tail">
            <label class="sr-only" for="task-sort">Sort tasks</label>
            <select id="task-sort" class="select select--sort" :value="sort" @change="onSort">
              <option v-for="option in sortOptions" :key="option.id" :value="option.id">{{ option.label }}</option>
            </select>

            <button type="button" class="ghost" :disabled="totalCount === 0" @click="emit('toggle-all')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="m20 6-11 11-5-5" />
              </svg>
              Toggle all
            </button>

            <button
              type="button"
              class="ghost ghost--danger"
              :disabled="counts.done === 0"
              @click="emit('clear-done')"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
              </svg>
              Clear done
            </button>

            <button v-if="isSearching" type="button" class="ghost" @click="emit('reset-filters')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
              Reset
            </button>

            <p class="filters__status" role="status" aria-live="polite">{{ statusLine }}</p>
          </div>
        </section>
      </template>

`,
    },
    {
      path: 'components/TaskForm.vue',
      content: `      <script setup>
      import { computed, reactive, ref, watch } from 'vue';
      import { MAX_TITLE, PRIORITIES } from '../utils/labels.js';
      import { today } from '../data/seed.js';

      /**
       * The add form.
       *
       * \`v-model\` on every field binds straight into one \`reactive\` draft, so there is
       * no per-field \`ref\` plumbing and the reset is a single object replacement.
       */
      const props = defineProps({
        /** Task being edited, or null when adding. */
        editing: { type: Object, default: null },
      });

      const emit = defineEmits(['create', 'update', 'cancel-edit']);

      const blank = () => ({
        title: '',
        note: '',
        priority: 'medium',
        due: '',
      });

      const draft = reactive(blank());
      const error = ref('');
      const touched = ref(false);

      const isEditing = computed(() => Boolean(props.editing));

      /** The live model is the draft while adding, and the task being edited. */
      const remaining = computed(() => MAX_TITLE - draft.title.length);
      const isWarn = computed(() => remaining.value <= 10);

      /** Fill the form from the task being edited, without mutating the prop. */
      const hydrate = (task) => {
        Object.assign(draft, {
          title: task.title,
          note: task.note,
          priority: task.priority,
          due: task.due,
        });
      };

      const hydrateFrom = (task) => {
        if (task) hydrate(task);
        else Object.assign(draft, blank());
      };

      /**
       * Which task is being edited, or the string 'new' when the form is adding.
       * Watching this is enough to know when to re-hydrate the draft, and it avoids
       * depending on the identity of the prop object.
       */
      const mode = computed(() => (props.editing ? props.editing.id : 'new'));

      watch(mode, (next, previous) => {
        if (next === previous) return;
        hydrateFrom(next === 'new' ? null : props.editing);
        error.value = '';
        touched.value = false;
      });

      // Covers the parent mounting with a row already in edit mode. Without this the
      // draft would stay blank until the mode actually changed.
      if (props.editing) hydrate(props.editing);

      const onTitle = () => {
        error.value = '';
      };

      const onSubmit = () => {
        const title = draft.title.trim();

        if (!title) {
          error.value = 'Give the task a name first.';
          touched.value = true;
          return;
        }
        if (title.length < 3) {
          error.value = 'Three characters or more, please.';
          touched.value = true;
          return;
        }

        touched.value = false;
        error.value = '';

        const payload = {
          title,
          note: draft.note.trim(),
          priority: draft.priority,
          due: draft.due,
          tags: [],
        };

        if (isEditing.value) emit('update', props.editing.id, payload);
        else emit('create', payload);

        Object.assign(draft, blank());
      };

      const toggleQuickDue = () => {
        const t = today();
        draft.due = draft.due === t ? '' : t;
      };

      const cancel = () => {
        Object.assign(draft, blank());
        error.value = '';
        touched.value = false;
        emit('cancel-edit');
      };
      </script>

      <template>
        <form class="form" novalidate @submit.prevent="onSubmit">
          <header class="form__head">
            <h2 class="form__title">
              <svg v-if="isEditing" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20ZM13.5 6.5l3 3" />
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.9" stroke-linecap="round" aria-hidden="true" focusable="false">
                <path d="M12 5v14M5 12h14" />
              </svg>
              {{ isEditing ? 'Edit task' : 'New task' }}
            </h2>

            <button type="button" class="ghost ghost--tiny" @click="toggleQuickDue">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M4 7h16v14H4zM4 11h16M8 4v4M16 4v4" />
              </svg>
              {{ draft.due === today() ? 'Due today' : 'Today' }}
            </button>
          </header>

          <div class="field">
            <label class="field__label" for="new-title">Task name</label>
            <input
              id="new-title"
              v-model="draft.title"
              class="input"
              type="text"
              :maxlength="MAX_TITLE"
              placeholder="Collect the Q2 audit evidence"
              autocomplete="off"
              :aria-invalid="Boolean(touched && error) || undefined"
              aria-describedby="title-count"
              @blur="touched = true"
              @input="onTitle"
            />
            <div class="field__foot">
              <span id="title-count" class="counter" :class="{ 'counter--warn': isWarn }" aria-live="polite">
                {{ remaining }} left
              </span>
            </div>
          </div>

          <div class="field">
            <label class="field__label" for="new-note">Note</label>
            <textarea
              id="new-note"
              v-model="draft.note"
              class="input input--area"
              rows="2"
              maxlength="240"
              placeholder="Context or acceptance criteria"
            />
          </div>

          <div class="form__row">
            <div class="field field--compact">
              <label class="field__label" for="new-priority">Priority</label>
              <select id="new-priority" v-model="draft.priority" class="input input--select">
                <option v-for="option in PRIORITIES" :key="option.id" :value="option.id">{{ option.label }}</option>
              </select>
            </div>

            <div class="field field--compact">
              <label class="field__label" for="new-due">Due date</label>
              <input id="new-due" v-model="draft.due" class="input input--date" type="date" />
            </div>
          </div>

          <p v-if="touched && error" class="form__error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
            {{ error }}
          </p>

          <div class="form__actions">
            <button type="submit" class="button button--primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path :d="isEditing ? 'm20 6-11 11-5-5' : 'M12 5v14M5 12h14'" />
              </svg>
              {{ isEditing ? 'Save changes' : 'Add task' }}
            </button>

            <button v-if="isEditing" type="button" class="button button--quiet" @click="cancel">Cancel</button>

            <p class="form__hint">Enter saves the task.</p>
          </div>
        </form>
      </template>`,
    },
    {
      path: 'components/TaskItem.vue',
      content: `      <script setup>
      import { computed, nextTick, ref, watch } from 'vue';
      import { dueDescription, dueLabel, dueTone } from '../utils/engine.js';
      import { priorityLabel } from '../utils/labels.js';
      import { TAG_LIBRARY } from '../data/seed.js';

      const props = defineProps({
        task: { type: Object, required: true },
        isEditing: { type: Boolean, required: true },
        isFirst: { type: Boolean, required: true },
        isLast: { type: Boolean, required: true },
        libraryTags: { type: Array, required: true },
      });

      const emit = defineEmits(['toggle', 'edit', 'save', 'cancel-edit', 'remove', 'move', 'toggle-tag']);

      const inputRef = ref(null);
      const draftTitle = ref('');
      const draftNote = ref('');
      const showNote = ref(false);

      // Adopt the task's values whenever this row enters edit mode.
      watch(
        () => props.isEditing,
        async (editing) => {
          if (!editing) return;
          draftTitle.value = props.task.title;
          draftNote.value = props.task.note;
          showNote.value = Boolean(props.task.note);
          await nextTick();
          if (inputRef.value) {
            inputRef.value.focus();
            inputRef.value.select();
          }
        },
      );

      const commit = () => {
        const title = draftTitle.value.trim();
        // Refuse to save an empty title; the row simply stays in edit mode.
        if (!title) return;
        emit('save', { title, note: draftNote.value.trim() });
      };

      const onEditKey = (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          commit();
          return;
        }
        if (event.key === 'Escape') emit('cancel-edit');
      };

      const due = computed(() => dueLabel(props.task.due));
      const dueAlt = computed(() => dueDescription(props.task.due));
      const tone = computed(() => dueTone(props.task.due, props.task.done));
      const priority = computed(() => priorityLabel(props.task.priority));

      /** Library tags not already on this task, so the row is not full of dead chips. */
      const suggestions = computed(() => props.libraryTags.filter((t) => !props.task.tags.includes(t)).slice(0, 4));
      </script>

      <template>
        <li
          class="item"
          :class="[
            'item--' + task.priority,
            { 'item--done': task.done, 'item--editing': isEditing },
          ]"
        >
          <span class="item__rail" aria-hidden="true"></span>

          <label class="check">
            <input
              class="check__input"
              type="checkbox"
              :checked="task.done"
              @change="emit('toggle', task.id)"
            />
            <span class="check__box" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"
                stroke-linecap="round" stroke-linejoin="round" focusable="false">
                <path d="m20 6-11 11-5-5" />
              </svg>
            </span>
            <span class="sr-only">{{ task.done ? 'Mark as not done' : 'Mark as done' }}: {{ task.title }}</span>
          </label>

          <div v-if="isEditing" class="item__editor">
            <label class="sr-only" :for="'edit-' + task.id">Task title</label>
            <input
              :id="'edit-' + task.id"
              ref="inputRef"
              class="input input--inline"
              type="text"
              v-model="draftTitle"
              maxlength="110"
              @keydown="onEditKey"
            />

            <textarea
              v-if="showNote"
              v-model="draftNote"
              class="input input--note"
              rows="2"
              maxlength="240"
              placeholder="Optional note"
              aria-label="Task note"
              @keydown.enter.exact.prevent="commit"
              @keydown.esc="emit('cancel-edit')"
            />

            <div class="item__editor-actions">
              <button type="button" class="icon-btn icon-btn--go" aria-label="Save changes" @click="commit">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                  <path d="m20 6-11 11-5-5" />
                </svg>
              </button>
              <button type="button" class="icon-btn" aria-label="Cancel editing" @click="emit('cancel-edit')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" aria-hidden="true" focusable="false">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
              <button type="button" class="ghost ghost--tiny" @click="showNote = !showNote">
                {{ showNote ? 'Hide note' : 'Add note' }}
              </button>
              <span class="item__hint">Enter saves, Escape cancels.</span>
            </div>
          </div>

          <div v-else class="item__body">
            <p class="item__title">{{ task.title }}</p>
            <p v-if="task.note" class="item__note">{{ task.note }}</p>

            <div class="item__meta">
              <span class="badge" :class="'badge--' + task.priority">{{ priority }}</span>

              <span v-if="task.due" class="meta" :class="'meta--' + tone" :title="dueAlt">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                  <path d="M4 7h16v14H4zM4 11h16M8 4v4M16 4v4" />
                </svg>
                {{ due }}
                <span class="sr-only">, {{ dueAlt }}</span>
              </span>

              <button
                v-for="tagName in task.tags"
                :key="task.id + '-' + tagName"
                type="button"
                class="tag"
                :aria-label="'Remove tag ' + tagName"
                @click="emit('toggle-tag', task.id, tagName)"
              >
                {{ tagName }}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
                  stroke-linecap="round" aria-hidden="true" focusable="false">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>

              <button
                v-for="name in suggestions"
                :key="'add-' + name"
                type="button"
                class="tag tag--add"
                :aria-label="'Add tag ' + name"
                @click="emit('toggle-tag', task.id, name)"
              >
                + {{ name }}
              </button>
            </div>
          </div>

          <div v-if="!isEditing" class="item__actions">
            <button
              type="button"
              class="icon-btn"
              :disabled="isFirst"
              :aria-label="'Move ' + task.title + ' up'"
              @click="emit('move', task.id, -1)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M12 20V4M6 10l6-6 6 6" />
              </svg>
            </button>
            <button
              type="button"
              class="icon-btn"
              :disabled="isLast"
              :aria-label="'Move ' + task.title + ' down'"
              @click="emit('move', task.id, 1)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M12 4v16M6 14l6 6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              class="icon-btn"
              :aria-label="'Edit ' + task.title"
              @click="emit('edit', task.id)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20ZM13.5 6.5l3 3" />
              </svg>
            </button>
            <button
              type="button"
              class="icon-btn icon-btn--danger"
              :aria-label="'Delete ' + task.title"
              @click="emit('remove', task.id)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
              </svg>
            </button>
          </div>
        </li>
      </template>`,
    },
    {
      path: 'components/TaskStats.vue',
      content: `      <script setup>
      import { computed } from 'vue';
      import ProgressRing from './ProgressRing.vue';
      import { recentTrend } from '../utils/engine.js';

      const props = defineProps({
        total: { type: Number, required: true },
        done: { type: Number, required: true },
        open: { type: Number, required: true },
        overdue: { type: Number, required: true },
        percent: { type: Number, required: true },
        tasks: { type: Array, required: true },
      });

      /** Last seven days of completions, drawn as a tiny bar sparkline. */
      const trend = computed(() => recentTrend(props.tasks));
      const trendMax = computed(() => Math.max(1, ...trend.value));
      const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

      /*
        Sparkline geometry, worked out here so the template needs no inline style.
        Seven bars across a 70x24 user-unit box, with a floor of 2 units so an empty
        day still reads as a slot rather than disappearing.
      */
      const SPARK_W = 70;
      const SPARK_H = 24;
      const SPARK_STEP = SPARK_W / trend.value.length;

      const bars = computed(() =>
        trend.value.map((value, index) => {
          const height = Math.max(2, (value / trendMax.value) * (SPARK_H - 4));
          return {
            value,
            day: dayLabels[index],
            x: (index * SPARK_STEP).toFixed(2),
            y: (SPARK_H - height).toFixed(2),
            width: (SPARK_STEP - 2.4).toFixed(2),
            height: height.toFixed(2),
            index,
          };
        }),
      );

      const trendSummary = computed(() =>
        trend.value.reduce((sum, value) => sum + value, 0) + ' completions in the last seven days',
      );
      </script>

      <template>
        <section class="stats" aria-labelledby="stats-title">
          <h2 class="sr-only" id="stats-title">Task summary</h2>

          <div class="stats__ring">
            <ProgressRing :percent="percent" label="Completion" />
            <p class="stats__ring-note">
              {{ done }} of {{ total }} tasks finished.
              <span v-if="overdue > 0" class="stats__overdue">{{ overdue }} past due.</span>
              <span v-else>Nothing overdue.</span>
            </p>
          </div>

          <dl class="stats__tiles">
            <div class="stat stat--open">
              <dt>Open</dt>
              <dd>{{ open }}</dd>
            </div>
            <div class="stat stat--done">
              <dt>Done</dt>
              <dd>{{ done }}</dd>
            </div>
            <div class="stat stat--overdue" :class="{ 'stat--zero': overdue === 0 }">
              <dt>Overdue</dt>
              <dd>{{ overdue }}</dd>
            </div>
            <div class="stat stat--total">
              <dt>Total</dt>
              <dd>{{ total }}</dd>
            </div>
          </dl>

          <div class="spark">
            <p class="spark__label">Completed, last 7 days</p>
            <svg
              class="spark__svg"
              :viewBox="'0 0 ' + SPARK_W + ' ' + SPARK_H"
              preserveAspectRatio="none"
              role="img"
              :aria-label="trendSummary"
            >
              <rect
                v-for="bar in bars"
                :key="'bar-' + bar.index"
                class="spark__bar"
                :class="{ 'spark__bar--empty': bar.value === 0 }"
                :x="bar.x"
                :y="bar.y"
                :width="bar.width"
                :height="bar.height"
                rx="1.4"
              />
            </svg>
            <div class="spark__days" aria-hidden="true">
              <span v-for="bar in bars" :key="'day-' + bar.index">{{ bar.day }}</span>
            </div>
          </div>
        </section>
      </template>`,
    },
    {
      path: 'composables/useTasks.js',
      content: `      import { computed, ref, watch } from 'vue';
      import { isTaskList, makeTask, SEED_TASKS } from '../data/seed.js';
      import { selectVisible, summarise } from '../utils/engine.js';

      /**
       * All task state, as a composable.
       *
       * Vue's reactivity does the work here that \`useMemo\` did in the React version:
       * \`visible\`, \`stats\` and \`tagCounts\` are computed, so they are cached and only
       * recomputed when the values they read actually change.
       *
       * Persistence is a \`watch\` with \`deep: true\` rather than an effect, because the
       * task array is replaced wholesale on every mutation - there is no field-level
       * patching to miss.
       */

      const STORAGE_KEY = 'gbcoder.vue-tasks.tasks.v1';

      /** Reads storage once, tolerating a disabled or full store. */
      function loadTasks() {
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (!raw) return SEED_TASKS;
          const parsed = JSON.parse(raw);
          return isTaskList(parsed) ? parsed : SEED_TASKS;
        } catch {
          return SEED_TASKS;
        }
      }

      export function useTasks() {
        const tasks = ref(loadTasks());

        // View state. \`reactive\` would work too, but these are independent flags, and
        // separate refs make each one trivially writable from a template.
        const filter = ref('all');
        const query = ref('');
        const sort = ref('created');
        const tag = ref('all');
        const editingId = ref(null);
        const loading = ref(true);
        const toast = ref(null);

        let toastTimer = null;

        /* -- Persistence ------------------------------------------- */
        watch(
          tasks,
          (value) => {
            try {
              window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
            } catch {
              /* quota or private mode - the app still works in memory */
            }
            loading.value = false;
          },
          { deep: true },
        );

        /* -- Derived ----------------------------------------------- */
        const visible = computed(() =>
          selectVisible(tasks.value, {
            filter: filter.value,
            query: query.value,
            sort: sort.value,
            tag: tag.value,
          }),
        );

        const stats = computed(() => summarise(tasks.value));

        const tagCounts = computed(() => {
          const counts = new Map();
          for (const task of tasks.value) {
            for (const t of task.tags) counts.set(t, (counts.get(t) || 0) + 1);
          }
          return Array.from(counts, ([id, count]) => ({ id, count })).sort(
            (a, b) => b.count - a.count || a.id.localeCompare(b.id),
          );
        });

        const isSearching = computed(() => query.value.trim().length > 0 || tag.value !== 'all');

        /* -- Mutations --------------------------------------------- */
        function addTask(draft) {
          const task = makeTask(draft);
          tasks.value = [task, ...tasks.value];
          return task;
        }

        function toggle(id) {
          tasks.value = tasks.value.map((task) =>
            task.id === id ? { ...task, done: !task.done } : task,
          );
        }

        function remove(id) {
          const index = tasks.value.findIndex((task) => task.id === id);
          if (index === -1) return;

          const removed = tasks.value[index];
          tasks.value = tasks.value.filter((task) => task.id !== id);
          if (editingId.value === id) editingId.value = null;

          notify('Removed "' + removed.title + '"', removed);
        }

        function update(id, patch) {
          const title = patch.title === undefined ? undefined : String(patch.title).trim();
          // A blank title is a rejected edit rather than an empty task.
          if (title === '') return;

          tasks.value = tasks.value.map((task) => {
            if (task.id !== id) return task;
            const next = { ...task, ...patch };
            if (title !== undefined) next.title = title.slice(0, 110);
            next.priority = patch.priority || task.priority;
            return next;
          });
        }

        function toggleTag(id, name) {
          tasks.value = tasks.value.map((task) => {
            if (task.id !== id) return task;
            const has = task.tags.includes(name);
            const tags = has ? task.tags.filter((t) => t !== name) : task.tags.concat(name).slice(0, 5);
            return { ...task, tags };
          });
        }

        function clearCompleted() {
          const removed = tasks.value.filter((task) => task.done);
          tasks.value = tasks.value.filter((task) => !task.done);
          if (removed.length) notify('Cleared ' + removed.length + ' completed', removed[0]);
        }

        function toggleAll() {
          const allDone = tasks.value.length > 0 && tasks.value.every((task) => task.done);
          tasks.value = tasks.value.map((task) => ({ ...task, done: !allDone }));
        }

        function move(id, direction) {
          const index = tasks.value.findIndex((task) => task.id === id);
          if (index === -1) return;
          const target = index + direction;
          if (target < 0 || target >= tasks.value.length) return;

          const next = tasks.value.slice();
          const [moved] = next.splice(index, 1);
          next.splice(target, 0, moved);
          tasks.value = next;
        }

        function undo() {
          if (!toast.value) return;
          const items = toast.value.items;
          toast.value = null;
          window.clearTimeout(toastTimer);
          // Restore into their original positions so the list order is what it was.
          for (const { task, index } of items.slice().reverse()) {
            const next = tasks.value.slice();
            if (next.some((t) => t.id === task.id)) continue;
            next.splice(Math.min(index, next.length), 0, task);
            tasks.value = next;
          }
        }

        function notify(message, ...items) {
          window.clearTimeout(toastTimer);
          const current = tasks.value;
          const entries = items.map((task) => ({ task, index: current.indexOf(task) }));
          toast.value = { message, items: entries.filter((entry) => entry.index !== -1) };
          toastTimer = window.setTimeout(() => {
            toast.value = null;
          }, 7000);
        }

        function dismissToast() {
          window.clearTimeout(toastTimer);
          toast.value = null;
        }

        function resetFilters() {
          filter.value = 'all';
          query.value = '';
          tag.value = 'all';
        }

        return {
          tasks,
          visible,
          stats,
          tagCounts,
          isSearching,
          filter,
          query,
          sort,
          tag,
          editingId,
          loading,
          toast,
          addTask,
          update,
          toggle,
          remove,
          toggleTag,
          clearCompleted,
          toggleAll,
          move,
          undo,
          dismissToast,
          resetFilters,
        };
      }`,
    },
    {
      path: 'data/seed.js',
      content: `      /**
       * Seed data and shared constants for the Vue task manager.
       *
       * Static, like everything else here - no fetch, no network. Due dates are
       * relative to today so the overdue, due-today and no-date states are all
       * represented the first time the template runs.
       */

      const pad = (n) => String(n).padStart(2, '0');

      /** \`YYYY-MM-DD\` for a date \`days\` from today. */
      export const dayOffset = (days) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
      };

      export const today = () => dayOffset(0);

      export const PRIORITIES = [
        { id: 'high', label: 'High', weight: 3 },
        { id: 'medium', label: 'Medium', weight: 2 },
        { id: 'low', label: 'Low', weight: 1 },
      ];

      export const priorityWeight = (id) => {
        const found = PRIORITIES.find((p) => p.id === id);
        return found ? found.weight : 0;
      };

      export const priorityLabel = (id) => {
        const found = PRIORITIES.find((p) => p.id === id);
        return found ? found.label : 'Medium';
      };

      export const normalisePriority = (id) =>
        PRIORITIES.some((p) => p.id === id) ? id : 'medium';

      export const MAX_TITLE = 110;

      /** Filters, in the order they appear in the toolbar. */
      export const FILTERS = [
        { id: 'all', label: 'All' },
        { id: 'active', label: 'Open' },
        { id: 'done', label: 'Done' },
      ];

      export const SORTS = [
        { id: 'created', label: 'Newest first' },
        { id: 'due', label: 'Due date' },
        { id: 'priority', label: 'Priority' },
        { id: 'alpha', label: 'A to Z' },
      ];

      let counter = 0;

      /** Monotonic id. The prefix keeps it distinct from anything we seed. */
      export const makeId = () => 'vt' + Date.now().toString(36) + (counter++).toString(36);

      /** Shape guard for data restored from localStorage. */
      export const isTaskList = (value) =>
        Array.isArray(value) && value.every((t) => t && typeof t.id === 'string' && typeof t.title === 'string');

      /** Builds a well-formed task from partial input. */
      export const makeTask = (draft) => ({
        id: draft.id || makeId(),
        title: String(draft.title || '').trim().slice(0, MAX_TITLE),
        note: String(draft.note || '').trim().slice(0, 240),
        priority: normalisePriority(draft.priority),
        due: draft.due || '',
        tags: Array.isArray(draft.tags) ? draft.tags.slice(0, 5) : [],
        done: Boolean(draft.done),
        createdAt: draft.createdAt || new Date().toISOString(),
      });

      /** First-run tasks. Realistic work, real-looking names. */
      export const SEED_TASKS = [
        makeTask({
          title: 'Split the settings page into route-level chunks',
          note: 'Bundle is 480 kB. Lazy-load the integrations tab first.',
          priority: 'high',
          due: dayOffset(0),
          tags: ['perf', 'frontend'],
          createdAt: '2026-03-02T08:14:00.000Z',
        }),
        makeTask({
          title: 'Fix the flaky avatar upload spec',
          note: 'Fails about one run in six on CI. Probably a timing issue on the read.',
          priority: 'high',
          due: dayOffset(-1),
          tags: ['bug', 'tests'],
          createdAt: '2026-03-02T11:02:00.000Z',
        }),
        makeTask({
          title: 'Draft the release notes for 4.2',
          note: 'Cover the new audit log, the CSV importer and the two breaking renames.',
          priority: 'medium',
          due: dayOffset(3),
          tags: ['docs', 'release'],
          createdAt: '2026-03-03T09:41:00.000Z',
        }),
        makeTask({
          title: 'Rotate the staging database credentials',
          note: 'Quarterly rotation. Update the deploy pipeline secrets at the same time.',
          priority: 'medium',
          due: dayOffset(6),
          tags: ['infra'],
          createdAt: '2026-03-03T14:27:00.000Z',
        }),
        makeTask({
          title: 'Record a two-minute walkthrough of the importer',
          note: 'For the help centre. Screen capture plus voiceover.',
          priority: 'low',
          due: '',
          tags: ['docs'],
          createdAt: '2026-03-04T08:05:00.000Z',
        }),
        makeTask({
          title: 'Delete the unused Sentry projects',
          note: 'mobile-legacy and canary-2025. Check the retention rules first.',
          priority: 'low',
          due: dayOffset(11),
          tags: ['infra', 'cleanup'],
          done: true,
          createdAt: '2026-02-26T16:52:00.000Z',
        }),
        makeTask({
          title: 'Ship the audit log retention notice to customers',
          note: 'Sent to the 214 accounts on the affected plans.',
          priority: 'medium',
          due: dayOffset(-4),
          tags: ['release'],
          done: true,
          createdAt: '2026-02-25T10:30:00.000Z',
        }),
      ];

      /** Tag vocabulary offered as quick-add chips. */
      export const TAG_LIBRARY = ['bug', 'frontend', 'backend', 'docs', 'infra', 'release', 'perf', 'tests'];`,
    },
    {
      path: 'utils/engine.js',
      content: `      import { priorityWeight, today } from '../data/seed.js';

      /**
       * Pure filtering, sorting and scoring.
       *
       * Nothing in here knows about Vue. \`useTasks\` passes plain values in and gets
       * plain arrays back, which keeps the rules testable and the component thin.
       */

      /** Comparators, keyed by sort id. \`created\` is inverted so "newest first" wins. */
      const SORTERS = {
        created: (a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0),
        alpha: (a, b) => a.title.localeCompare(b.title),
        priority: (a, b) => priorityWeight(b.priority) - priorityWeight(a.priority) || (a.createdAt < b.createdAt ? 1 : -1),
        due: (a, b) => {
          // Tasks without a due date sort to the end, not to 1970.
          if (!a.due && !b.due) return 0;
          if (!a.due) return 1;
          if (!b.due) return -1;
          return a.due < b.due ? -1 : a.due > b.due ? 1 : 0;
        },
      };

      /** Applies status filter, search, tag scope, then sorts. Returns a new array. */
      export function selectVisible(tasks, options) {
        const filter = options.filter || 'all';
        const query = String(options.query || '').trim().toLowerCase();
        const tag = options.tag && options.tag !== 'all' ? options.tag : null;
        const sort = options.sort || 'created';

        const filtered = tasks.filter((task) => {
          if (filter === 'active' && task.done) return false;
          if (filter === 'done' && !task.done) return false;
          if (tag && !task.tags.includes(tag)) return false;
          if (!query) return true;
          const haystack = (task.title + ' ' + task.note + ' ' + task.tags.join(' ')).toLowerCase();
          return haystack.includes(query);
        });

        const comparator = SORTERS[sort] || SORTERS.created;
        return filtered.slice().sort(comparator);
      }

      /** Headline numbers for the stats panel. Runs over every task, not the view. */
      export function summarise(tasks) {
        let done = 0;
        let overdue = 0;
        const now = today();

        for (const task of tasks) {
          if (task.done) done += 1;
          else if (task.due && task.due < now) overdue += 1;
        }

        const total = tasks.length;
        const open = total - done;
        const percent = total === 0 ? 0 : Math.round((done / total) * 100);

        return { total, done, open, overdue, percent };
      }

      /** Whole days from today until an ISO \`YYYY-MM-DD\` string. */
      export function daysUntil(value) {
        if (!value) return null;
        const now = today();
        const [ay, am, ad] = now.split('-').map(Number);
        const [by, bm, bd] = value.split('-').map(Number);
        const a = Date.UTC(ay, am - 1, ad);
        const b = Date.UTC(by, bm - 1, bd);
        return Math.round((b - a) / 86400000);
      }

      export const isOverdue = (value) => {
        const diff = daysUntil(value);
        return diff !== null && diff < 0;
      };

      const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      /** "Today", "Tomorrow", "Mar 4", or "Mar 4, 2025" for a different year. */
      export function dueLabel(value) {
        const diff = daysUntil(value);
        if (diff === null) return '';
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Tomorrow';
        if (diff === -1) return 'Yesterday';

        const [y, m, d] = value.split('-').map(Number);
        const base = MONTHS[m - 1] + ' ' + d;
        return y === new Date().getFullYear() ? base : base + ', ' + y;
      }

      /** Longer phrasing for the accessible title on a due-date chip. */
      export function dueDescription(value) {
        const diff = daysUntil(value);
        if (diff === null) return '';
        if (diff === 0) return 'Due today';
        if (diff === 1) return 'Due tomorrow';
        if (diff < 0) return 'Overdue by ' + Math.abs(diff) + ' day' + (Math.abs(diff) === 1 ? '' : 's');
        return 'Due in ' + diff + ' days';
      }

      /** Tone for a due-date chip, given whether the task is done. */
      export function dueTone(value, done) {
        if (done || !value) return 'none';
        const diff = daysUntil(value);
        if (diff === null) return 'none';
        if (diff < 0) return 'overdue';
        if (diff === 0) return 'today';
        if (diff <= 2) return 'soon';
        return 'later';
      }

      /**
       * Completion over the last seven days, for the small sparkline in the stats
       * panel. Derived from the tasks' createdAt dates so it is real data rather than
       * decoration - though with only seed data it is intentionally sparse.
       */
      export function recentTrend(tasks) {
        const buckets = new Array(7).fill(0);
        const now = new Date();
        for (const task of tasks) {
          const created = new Date(task.createdAt);
          if (Number.isNaN(created.getTime())) continue;
          const age = Math.round((now - created) / 86400000);
          if (age >= 0 && age < 7) buckets[6 - age] += task.done ? 1 : 0;
        }
        return buckets;
      }`,
    },
    {
      path: 'utils/labels.js',
      content: `      /**
       * Small presentational constants and formatters.
       *
       * Split out from \`data/seed.js\` so a component that only needs a label does not
       * pull the seed dataset in with it.
       */

      export const FILTERS = [
        { id: 'all', label: 'All' },
        { id: 'active', label: 'Open' },
        { id: 'done', label: 'Done' },
      ];

      export const SORTS = [
        { id: 'created', label: 'Newest first' },
        { id: 'due', label: 'Due date' },
        { id: 'priority', label: 'Priority' },
        { id: 'alpha', label: 'A to Z' },
      ];

      export const PRIORITIES = [
        { id: 'high', label: 'High', weight: 3 },
        { id: 'medium', label: 'Medium', weight: 2 },
        { id: 'low', label: 'Low', weight: 1 },
      ];

      export const priorityLabel = (id) => {
        const found = PRIORITIES.find((p) => p.id === id);
        return found ? found.label : 'Medium';
      };

      /** Escapes nothing - Vue's \`{{ }}\` interpolation already escapes text. */
      export const MAX_TITLE = 110;`,
    }
  ],
};
