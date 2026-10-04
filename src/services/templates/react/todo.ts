export default {
  files: [
    {
      path: 'main.jsx',
      content: `      import { StrictMode } from 'react';
      import { createRoot } from 'react-dom/client';
      import App from './App.jsx';

      // The playground injects #root for us. Guard anyway - a null mount should be a
      // silent no-op, not a TypeError that blanks the whole preview.
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
         Tokens. Every colour, space, radius and shadow used below is
         declared here once. Dark mode re-points these same names rather
         than forking the stylesheet.
         ------------------------------------------------------------- */
      :root {
        --font-display: 'Fraunces', Georgia, 'Times New Roman', serif;
        --font-body: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

        --color-bg: #f4f5f8; --color-bg-accent: #e9ecf3; --color-surface: #ffffff;
        --color-surface-2: #fafbfd;
        --color-ink: #16181f;
        --color-ink-2: #4a5060;
        --color-ink-3: #7d8496;
        --color-border: #dfe3ec; --color-border-strong: #c6ccda;

        --color-accent: #3d5afe; --color-accent-ink: #ffffff; --color-accent-soft: #e7ebff;

        --color-high: #e5484d; --color-high-soft: #fdecec; --color-medium: #d98207;
        --color-medium-soft: #fdf3e3; --color-low: #2a7de1; --color-low-soft: #e8f1fd; --color-done: #2f9e68;
        --color-done-soft: #e6f5ee;

        --space-1: 0.25rem;
        --space-2: 0.5rem;
        --space-3: 0.75rem;
        --space-4: 1rem;
        --space-5: 1.5rem;
        --space-6: 2rem;
        --space-7: 3rem;

        --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px; --radius-pill: 999px;

        --shadow-1: 0 1px 2px rgba(20, 24, 38, 0.06), 0 1px 3px rgba(20, 24, 38, 0.04);
        --shadow-2: 0 4px 12px rgba(20, 24, 38, 0.08), 0 1px 3px rgba(20, 24, 38, 0.05);
        --shadow-3: 0 14px 34px rgba(20, 24, 38, 0.14), 0 3px 10px rgba(20, 24, 38, 0.07);

        --ring: 0 0 0 3px rgba(61, 90, 254, 0.4); --tap: 40px;

        --exit-ms: 240ms; --rise-ms: 320ms;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --color-bg: #0e1016; --color-bg-accent: #141824; --color-surface: #181c26;
          --color-surface-2: #1e2331;
          --color-ink: #eef1f7;
          --color-ink-2: #b3bac9;
          --color-ink-3: #7f879b;
          --color-border: #2a3040; --color-border-strong: #3a4356;

          --color-accent: #7d92ff; --color-accent-ink: #0e1016; --color-accent-soft: #1e2544;

          --color-high: #ff7b7f; --color-high-soft: #33191c; --color-medium: #f0ad3d;
          --color-medium-soft: #33260f; --color-low: #6cb0ff; --color-low-soft: #14243b;
          --color-done: #5fcb95; --color-done-soft: #13291f;

          --shadow-1: 0 1px 2px rgba(0, 0, 0, 0.4);
          --shadow-2: 0 4px 14px rgba(0, 0, 0, 0.45);
          --shadow-3: 0 16px 38px rgba(0, 0, 0, 0.55);
        }
      }

      /* -- Base ----------------------------------------------------- */
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      body {
        margin: 0; padding: 0; font-family: var(--font-body); font-size: 15px; line-height: 1.55;
        color: var(--color-ink); background: var(--color-bg); -webkit-font-smoothing: antialiased;
      }

      #root {
        min-height: 100vh;
      }

      h1,
      h2,
      h3 {
        font-family: var(--font-display); font-weight: 600; letter-spacing: -0.01em; margin: 0;
      }

      code {
        font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace; font-size: 0.86em;
        background: var(--color-bg-accent); padding: 0.1em 0.4em; border-radius: var(--radius-sm);
      }

      .sr-only {
        position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden;
        clip: rect(0 0 0 0); white-space: nowrap; border: 0;
      }

      .skip-link {
        position: absolute; left: var(--space-3); top: -60px; z-index: 50;
        padding: var(--space-2) var(--space-4); background: var(--color-accent);
        color: var(--color-accent-ink); border-radius: var(--radius-sm); text-decoration: none;
        font-weight: 600; transition: top 160ms ease;
      }

      .skip-link:focus {
        top: var(--space-3);
      }

      /* One focus treatment, applied everywhere, so the ring is never inconsistent. */
      :where(a, button, input, select, textarea, [tabindex]):focus-visible {
        outline: 2px solid transparent; box-shadow: var(--ring); border-radius: var(--radius-sm);
      }

      /* -- App shell ------------------------------------------------ */
      .app {
        min-height: 100vh;
        background:
          radial-gradient(1100px 520px at 8% -8%, var(--color-accent-soft), transparent 62%),
          var(--color-bg);
      }

      .topbar {
        position: sticky; top: 0; z-index: 20; display: flex; align-items: center;
        justify-content: space-between; gap: var(--space-4); flex-wrap: wrap;
        padding: var(--space-3) clamp(var(--space-4), 3vw, var(--space-6));
        background: color-mix(in srgb, var(--color-surface) 82%, transparent); backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--color-border);
      }

      .topbar__brand {
        display: flex; align-items: center; gap: var(--space-3);
      }

      .topbar__mark {
        display: grid; place-items: center; width: 38px; height: 38px; border-radius: var(--radius-md);
        background: linear-gradient(135deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 55%, #9d6bff));
        color: #fff; box-shadow: var(--shadow-1);
      }

      .topbar__title {
        font-size: 1.15rem;
      }

      .topbar__sub,
      .topbar__stamp {
        margin: 0; font-size: 0.78rem; color: var(--color-ink-3);
      }

      .topbar__right {
        display: flex; align-items: center; gap: var(--space-3);
      }

      .app__body {
        display: grid; grid-template-columns: minmax(0, 22rem) minmax(0, 1fr);
        gap: clamp(var(--space-4), 2vw, var(--space-6)); align-items: start;
        padding: clamp(var(--space-4), 2.4vw, var(--space-6)); max-width: 1400px; margin: 0 auto;
      }

      .panel {
        background: var(--color-surface); border: 1px solid var(--color-border);
        border-radius: var(--radius-lg); box-shadow: var(--shadow-1);
        padding: clamp(var(--space-4), 1.6vw, var(--space-5));
      }

      .panel--list {
        display: grid; gap: var(--space-4);
      }

      /* -- Buttons -------------------------------------------------- */
      .button {
        display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2);
        min-height: var(--tap); padding: var(--space-2) var(--space-4); font: inherit; font-size: 0.9rem;
        font-weight: 600; color: var(--color-ink); background: var(--color-surface-2);
        border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer;
        transition: transform 140ms ease, background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
      }

      .button:hover:not(:disabled) {
        border-color: var(--color-border-strong); box-shadow: var(--shadow-1);
      }

      .button:active:not(:disabled) {
        transform: translateY(1px);
      }

      .button:disabled {
        opacity: 0.45; cursor: not-allowed;
      }

      /* A sheen that wipes across on hover, drawn with a gradient rather than an image. */
      .button--primary {
        color: var(--color-accent-ink); background: var(--color-accent); border-color: transparent;
        background-image: linear-gradient(100deg, transparent 20%, rgba(255, 255, 255, 0.28) 50%, transparent 80%);
        background-size: 220% 100%; background-position: 180% 0;
      }

      .button--primary:hover:not(:disabled) {
        background-position: 0 0;
        transition: transform 140ms ease, background-position 620ms ease, box-shadow 140ms ease;
      }

      .button--quiet {
        background: transparent;
      }

      .button--tiny {
        min-height: 30px; padding: 2px var(--space-3); font-size: 0.8rem; border-radius: var(--radius-pill);
      }

      .ghost-button {
        display: inline-flex; align-items: center; gap: 6px; min-height: 34px; padding: 4px var(--space-3);
        font: inherit; font-size: 0.82rem; font-weight: 500; color: var(--color-ink-2);
        background: transparent; border: 1px solid var(--color-border); border-radius: var(--radius-pill);
        cursor: pointer; transition: color 140ms ease, border-color 140ms ease, background-color 140ms ease;
      }

      .ghost-button:hover:not(:disabled) {
        color: var(--color-ink); background: var(--color-surface-2); border-color: var(--color-border-strong);
      }

      .ghost-button:disabled {
        opacity: 0.4; cursor: not-allowed;
      }

      .ghost-button--danger:hover:not(:disabled) {
        color: var(--color-high); border-color: var(--color-high); background: var(--color-high-soft);
      }

      .icon-button {
        display: grid; place-items: center; width: 32px; height: 32px; color: var(--color-ink-3);
        background: transparent; border: 1px solid transparent; border-radius: var(--radius-sm);
        cursor: pointer; transition: color 140ms ease, background-color 140ms ease, border-color 140ms ease;
      }

      .icon-button:hover:not(:disabled) {
        color: var(--color-ink); background: var(--color-bg-accent);
      }

      .icon-button:disabled {
        opacity: 0.28; cursor: not-allowed;
      }

      .icon-button--danger:hover:not(:disabled) {
        color: var(--color-high); background: var(--color-high-soft);
      }

      .icon-button--go:hover:not(:disabled) {
        color: var(--color-done); background: var(--color-done-soft);
      }

      /* -- Form ----------------------------------------------------- */
      .task-form {
        display: grid; gap: var(--space-3);
      }

      .task-form__head {
        display: flex; align-items: center; justify-content: space-between; gap: var(--space-2);
        flex-wrap: wrap;
      }

      .task-form__title {
        display: flex; align-items: center; gap: var(--space-2); font-size: 1.02rem;
      }

      .field {
        display: grid; gap: 6px; min-width: 0;
      }

      .field--compact {
        flex: 1 1 8rem;
      }

      .field--tags {
        margin: 0; padding: 0; border: 0;
      }

      .field__label {
        font-size: 0.76rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;
        color: var(--color-ink-3); padding: 0;
      }

      .field__meta {
        display: flex; justify-content: flex-end;
      }

      .counter {
        font-size: 0.72rem; color: var(--color-ink-3); font-variant-numeric: tabular-nums;
      }

      .counter--warn {
        color: var(--color-medium); font-weight: 600;
      }

      .input {
        width: 100%; min-height: var(--tap); padding: var(--space-2) var(--space-3); font: inherit;
        font-size: 0.9rem; color: var(--color-ink); background: var(--color-surface-2);
        border: 1px solid var(--color-border); border-radius: var(--radius-md);
        transition: border-color 140ms ease, box-shadow 140ms ease;
      }

      .input::placeholder {
        color: var(--color-ink-3);
      }

      .input:hover {
        border-color: var(--color-border-strong);
      }

      .input:focus-visible {
        outline: 2px solid transparent; border-color: var(--color-accent); box-shadow: var(--ring);
      }

      .input--area {
        min-height: 62px; resize: vertical; line-height: 1.5;
      }

      .input--select,
      .input--date {
        min-height: 38px; padding: 4px var(--space-2);
      }

      .input--compact {
        min-width: 9rem;
      }

      .input--tags {
        min-height: 34px; font-size: 0.8rem;
      }

      .task-form__row {
        display: flex; gap: var(--space-3); flex-wrap: wrap;
      }

      .task-form__actions {
        display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; padding-top: var(--space-1);
      }

      .form-hint {
        margin: 0; font-size: 0.74rem; color: var(--color-ink-3);
      }

      .form-error {
        display: flex; align-items: center; gap: 6px; margin: 0; padding: var(--space-2) var(--space-3);
        font-size: 0.8rem; font-weight: 500; color: var(--color-high); background: var(--color-high-soft);
        border: 1px solid color-mix(in srgb, var(--color-high) 35%, transparent);
        border-radius: var(--radius-sm); animation: shake 320ms ease;
      }

      /* -- Chips ---------------------------------------------------- */
      .chip-row {
        display: flex; flex-wrap: wrap; gap: 6px;
      }

      .chip--button {
        padding: 3px var(--space-3); font: inherit; font-size: 0.74rem; color: var(--color-ink-2);
        background: var(--color-surface-2); border: 1px solid var(--color-border);
        border-radius: var(--radius-pill); cursor: pointer;
        transition: background-color 140ms ease, color 140ms ease, border-color 140ms ease;
      }

      .chip--button:hover {
        border-color: var(--color-border-strong); color: var(--color-ink);
      }

      .chip--on {
        color: var(--color-accent); background: var(--color-accent-soft);
        border-color: color-mix(in srgb, var(--color-accent) 45%, transparent); font-weight: 600;
      }

      /* -- Filters -------------------------------------------------- */
      .filters {
        display: grid; gap: var(--space-3); padding: var(--space-3); background: var(--color-surface-2);
        border: 1px solid var(--color-border); border-radius: var(--radius-md);
      }

      .filters__search {
        position: relative; display: flex; align-items: center;
      }

      .filters__search-icon {
        position: absolute; left: var(--space-3); display: grid; place-items: center;
        color: var(--color-ink-3); pointer-events: none;
      }

      .input--search {
        padding-left: 2.4rem; padding-right: 2.2rem;
      }

      .input--search::-webkit-search-cancel-button {
        display: none;
      }

      .filters__clear {
        position: absolute; right: 6px; display: grid; place-items: center; width: 26px; height: 26px;
        color: var(--color-ink-3); background: transparent; border: 0; border-radius: var(--radius-sm);
        cursor: pointer;
      }

      .filters__clear:hover {
        color: var(--color-ink); background: var(--color-bg-accent);
      }

      .filters__group {
        display: flex; gap: 6px; flex-wrap: wrap;
      }

      .filters__group--tags {
        align-items: center;
      }

      .filters__spacer {
        display: none;
      }

      .filters__tail {
        display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;
      }

      .filters__status {
        margin: 0; font-size: 0.76rem; color: var(--color-ink-3);
      }

      .filters__status strong {
        color: var(--color-ink); font-variant-numeric: tabular-nums;
      }

      .pill {
        display: inline-flex; align-items: center; gap: 6px; min-height: 32px; padding: 3px var(--space-3);
        font: inherit; font-size: 0.82rem; font-weight: 500; color: var(--color-ink-2);
        background: transparent; border: 1px solid var(--color-border); border-radius: var(--radius-pill);
        cursor: pointer; transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
      }

      .pill:hover {
        border-color: var(--color-border-strong); color: var(--color-ink);
      }

      .pill--on {
        color: var(--color-accent-ink); background: var(--color-accent); border-color: transparent;
        font-weight: 600;
      }

      .pill__count {
        padding: 0 6px; font-size: 0.7rem; font-variant-numeric: tabular-nums;
        border-radius: var(--radius-pill); background: color-mix(in srgb, currentColor 16%, transparent);
      }

      .tag-chip {
        display: inline-flex; align-items: center; gap: 5px; padding: 2px var(--space-2); font: inherit;
        font-size: 0.72rem; color: var(--color-ink-2); background: var(--color-surface);
        border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer;
        transition: color 140ms ease, border-color 140ms ease;
      }

      .tag-chip:hover {
        color: var(--color-ink); border-color: var(--color-border-strong);
      }

      .tag-chip--on {
        color: var(--color-accent); border-color: color-mix(in srgb, var(--color-accent) 55%, transparent);
        background: var(--color-accent-soft); font-weight: 600;
      }

      .tag-chip__count {
        font-variant-numeric: tabular-nums; color: var(--color-ink-3);
      }

      .tag-chip--static {
        cursor: default; color: var(--color-ink-3);
      }

      /* -- List heading --------------------------------------------- */
      .list-heading {
        display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3);
        padding-bottom: var(--space-1); border-bottom: 1px solid var(--color-border);
      }

      .list-heading__title {
        display: flex; align-items: center; gap: var(--space-2); font-size: 1rem;
      }

      .list-heading__count {
        font-size: 0.76rem; color: var(--color-ink-3); font-variant-numeric: tabular-nums;
      }

      /* -- Task list ------------------------------------------------ */
      .task-list {
        display: grid; gap: var(--space-2); margin: 0; padding: 0; list-style: none;
      }

      .task-item {
        position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: start; gap: var(--space-3);
        padding: var(--space-3) var(--space-3) var(--space-3) var(--space-4);
        background: var(--color-surface-2); border: 1px solid var(--color-border);
        border-radius: var(--radius-md); overflow: hidden;
        animation: task-in var(--rise-ms) cubic-bezier(0.2, 0.7, 0.3, 1) backwards;
        transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
      }

      /* Priority reads as a colour stripe down the leading edge. */
      .task-item__rail {
        position: absolute; inset: 0 auto 0 0; width: 4px; background: var(--color-low);
      }

      .task-item--high .task-item__rail {
        background: var(--color-high);
      }

      .task-item--medium .task-item__rail {
        background: var(--color-medium);
      }

      .task-item--low .task-item__rail {
        background: var(--color-low);
      }

      .task-item:hover {
        border-color: var(--color-border-strong); box-shadow: var(--shadow-2); transform: translateY(-1px);
      }

      .task-item--editing {
        border-color: var(--color-accent); background: var(--color-surface);
      }

      .task-item--done {
        background: color-mix(in srgb, var(--color-done-soft) 55%, var(--color-surface-2));
      }

      .task-item--done .task-item__title {
        text-decoration: line-through; color: var(--color-ink-3);
      }

      .task-item--leaving {
        animation: task-out var(--exit-ms) cubic-bezier(0.4, 0, 1, 1) forwards; pointer-events: none;
      }

      /*
        Stagger, without a single inline style. Each row waits a little longer than
        the last; after row 12 the delay holds so a long list does not take ten
        seconds to appear.
      */
      .task-item:nth-child(1) { animation-delay: 20ms; }
      .task-item:nth-child(2) { animation-delay: 50ms; }
      .task-item:nth-child(3) { animation-delay: 80ms; }
      .task-item:nth-child(4) { animation-delay: 110ms; }
      .task-item:nth-child(5) { animation-delay: 140ms; }
      .task-item:nth-child(6) { animation-delay: 170ms; }
      .task-item:nth-child(7) { animation-delay: 200ms; }
      .task-item:nth-child(8) { animation-delay: 230ms; }
      .task-item:nth-child(9) { animation-delay: 260ms; }
      .task-item:nth-child(10) { animation-delay: 290ms; }
      .task-item:nth-child(11) { animation-delay: 320ms; }
      .task-item:nth-child(n + 12) { animation-delay: 350ms; }

      .task-item__body {
        min-width: 0;
      }

      .task-item__title {
        margin: 0 0 2px; font-size: 0.94rem; font-weight: 600; overflow-wrap: anywhere;
      }

      .task-item__notes {
        margin: 0 0 var(--space-2); font-size: 0.82rem; color: var(--color-ink-2); overflow-wrap: anywhere;
      }

      .task-item__meta {
        display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
      }

      .task-item__stamp {
        font-size: 0.7rem; color: var(--color-ink-3);
      }

      .task-item__actions {
        display: flex; align-items: center; gap: 2px; opacity: 0.55; transition: opacity 160ms ease;
      }

      .task-item:hover .task-item__actions,
      .task-item:focus-within .task-item__actions {
        opacity: 1;
      }

      .task-item__edit {
        display: grid; gap: var(--space-2); grid-column: 2 / -1;
      }

      .task-item__edit-actions {
        display: flex; gap: var(--space-2);
      }

      .task-item__hint {
        margin: 0; font-size: 0.72rem; color: var(--color-ink-3);
      }

      .badge {
        padding: 1px var(--space-2); font-size: 0.68rem; font-weight: 700; letter-spacing: 0.04em;
        text-transform: uppercase; border-radius: var(--radius-sm);
      }

      .badge--high {
        color: var(--color-high); background: var(--color-high-soft);
      }

      .badge--medium {
        color: var(--color-medium); background: var(--color-medium-soft);
      }

      .badge--low {
        color: var(--color-low); background: var(--color-low-soft);
      }

      .meta-pill {
        display: inline-flex; align-items: center; gap: 4px; padding: 1px var(--space-2); font-size: 0.72rem;
        color: var(--color-ink-2); background: var(--color-surface); border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
      }

      .meta-pill--today {
        color: var(--color-medium); border-color: color-mix(in srgb, var(--color-medium) 40%, transparent);
        background: var(--color-medium-soft);
      }

      .meta-pill--overdue {
        color: var(--color-high); border-color: color-mix(in srgb, var(--color-high) 40%, transparent);
        background: var(--color-high-soft); font-weight: 600;
      }

      /* -- Checkbox ------------------------------------------------- */
      .check {
        display: grid; place-items: center; padding-top: 2px; cursor: pointer;
      }

      .check__input {
        position: absolute; width: 1px; height: 1px; opacity: 0;
      }

      .check__box {
        display: grid; place-items: center; width: 22px; height: 22px; color: transparent;
        background: var(--color-surface); border: 1.5px solid var(--color-border-strong); border-radius: 7px;
        transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease;
      }

      .check:hover .check__box {
        border-color: var(--color-accent);
      }

      .check__input:checked + .check__box {
        color: #fff; background: var(--color-done); border-color: var(--color-done);
        animation: pop 260ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .check__input:focus-visible + .check__box {
        box-shadow: var(--ring);
      }

      /* -- Empty state ---------------------------------------------- */
      .empty {
        display: grid; justify-items: center; gap: var(--space-2); padding: var(--space-7) var(--space-4);
        text-align: center; border: 1px dashed var(--color-border-strong); border-radius: var(--radius-md);
        animation: fade-up 320ms ease backwards;
      }

      .empty__glyph {
        display: grid; place-items: center; width: 56px; height: 56px; color: var(--color-accent);
        background: var(--color-accent-soft); border-radius: 50%;
      }

      .empty__title {
        font-size: 1.02rem;
      }

      .empty__body {
        max-width: 34ch; margin: 0; font-size: 0.85rem; color: var(--color-ink-2);
      }

      .empty__meta {
        margin: 0; font-size: 0.74rem; color: var(--color-ink-3);
      }

      /* -- Stats ---------------------------------------------------- */
      .stats {
        display: grid; gap: var(--space-3); margin-top: var(--space-5); padding-top: var(--space-4);
        border-top: 1px solid var(--color-border);
      }

      .stats__tiles {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(4.5rem, 1fr)); gap: var(--space-2);
      }

      .stat-tile {
        display: grid; gap: 2px; padding: var(--space-2) var(--space-3); background: var(--color-surface-2);
        border: 1px solid var(--color-border); border-radius: var(--radius-md);
      }

      .stat-tile__label {
        font-size: 0.66rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em;
        color: var(--color-ink-3);
      }

      .stat-tile__value {
        font-family: var(--font-display); font-size: 1.4rem; line-height: 1.1;
        font-variant-numeric: tabular-nums;
      }

      .stat-tile--active .stat-tile__value {
        color: var(--color-accent);
      }

      .stat-tile--done .stat-tile__value {
        color: var(--color-done);
      }

      .stat-tile--alert .stat-tile__value {
        color: var(--color-high);
      }

      .stats__progress {
        display: grid; gap: 6px;
      }

      .stats__progress-head {
        display: flex; align-items: baseline; justify-content: space-between;
      }

      .stats__progress-label {
        display: inline-flex; align-items: center; gap: 5px; font-size: 0.78rem; font-weight: 600;
        color: var(--color-ink-2);
      }

      .stats__progress-value {
        font-family: var(--font-display); font-size: 1.05rem; font-variant-numeric: tabular-nums;
      }

      /*
        A native <progress> element, so the width comes from \`value\` rather than an
        inline style. The vendor pseudo-elements are what animate.
      */
      .progress {
        width: 100%; height: 9px; appearance: none; border: none; border-radius: var(--radius-pill);
        background: var(--color-bg-accent); overflow: hidden;
      }

      .progress::-webkit-progress-bar {
        background: var(--color-bg-accent); border-radius: var(--radius-pill);
      }

      .progress::-webkit-progress-value {
        border-radius: var(--radius-pill);
        background: linear-gradient(90deg, var(--color-done), var(--color-accent));
        transition: width 520ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      .progress::-moz-progress-bar {
        border-radius: var(--radius-pill);
        background: linear-gradient(90deg, var(--color-done), var(--color-accent));
        transition: width 520ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      .stats__progress-note {
        margin: 0; font-size: 0.74rem; color: var(--color-ink-3);
      }

      /* -- List footer ---------------------------------------------- */
      .list-footer {
        display: grid; gap: var(--space-1); padding-top: var(--space-3);
        border-top: 1px solid var(--color-border); font-size: 0.76rem; color: var(--color-ink-3);
      }

      .list-footer p {
        margin: 0;
      }

      .list-footer__tip {
        display: flex; align-items: center; gap: 6px;
      }

      /* -- Undo toast ----------------------------------------------- */
      .toast {
        position: fixed; left: 50%; bottom: var(--space-5); z-index: 40; display: flex; align-items: center;
        gap: var(--space-3); width: min(30rem, calc(100vw - 2rem));
        padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4); background: var(--color-ink);
        color: var(--color-bg); border-radius: var(--radius-md); box-shadow: var(--shadow-3);
        /* Parked below the fold until a delete happens. */
        opacity: 0; transform: translate(-50%, 150%); visibility: hidden;
        transition: transform 260ms cubic-bezier(0.2, 0.8, 0.3, 1), opacity 220ms ease, visibility 0s linear 260ms;
      }

      .toast--in {
        opacity: 1; transform: translate(-50%, 0); visibility: visible;
        transition: transform 320ms cubic-bezier(0.34, 1.4, 0.64, 1), opacity 200ms ease;
      }

      .toast__label {
        display: flex; align-items: center; gap: var(--space-2); min-width: 0; font-size: 0.82rem;
      }

      .toast__label :where(svg) {
        flex: 0 0 auto; opacity: 0.7;
      }

      .toast__actions {
        display: flex; align-items: center; gap: var(--space-2); margin-left: auto;
      }

      .toast .button--tiny {
        color: var(--color-bg); background: rgba(255, 255, 255, 0.12); border-color: transparent;
      }

      .toast .button--tiny:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.2);
      }

      .toast .icon-button {
        color: color-mix(in srgb, var(--color-bg) 70%, transparent);
      }

      /* -- Animations ----------------------------------------------- */
      @keyframes task-in {
        from {
          opacity: 0; transform: translateY(10px) scale(0.985);
        }
        to {
          opacity: 1; transform: none;
        }
      }

      @keyframes task-out {
        to {
          opacity: 0; transform: translateX(28px) scale(0.96); max-height: 0; padding-top: 0;
          padding-bottom: 0; margin-bottom: calc(-1 * var(--space-2));
        }
      }

      @keyframes fade-up {
        from {
          opacity: 0; transform: translateY(8px);
        }
        to {
          opacity: 1; transform: none;
        }
      }

      @keyframes pop {
        0% { transform: scale(1); }
        45% { transform: scale(1.22); }
        100% { transform: scale(1); }
      }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
      }

      /* -- Responsive ----------------------------------------------- */
      @media (max-width: 900px) {
        .app__body {
          grid-template-columns: minmax(0, 1fr);
        }

        /* The form becomes a slide-over panel, driven by the topbar toggle. */
        .panel--form {
          position: fixed; inset: auto 0 0 0; z-index: 30; max-height: 86vh; overflow-y: auto;
          border-radius: var(--radius-lg) var(--radius-lg) 0 0; box-shadow: var(--shadow-3);
          transform: translateY(100%); visibility: hidden;
          transition: transform 300ms cubic-bezier(0.2, 0.8, 0.3, 1), visibility 0s linear 300ms;
        }

        .app--sidebar-open .panel--form {
          transform: translateY(0); visibility: visible;
          transition: transform 300ms cubic-bezier(0.2, 0.8, 0.3, 1);
        }
      }

      @media (min-width: 901px) {
        .topbar__toggle {
          display: none;
        }
      }

      @media (max-width: 560px) {
        .topbar__stamp {
          display: none;
        }

        .task-item {
          grid-template-columns: auto minmax(0, 1fr);
        }

        .task-item__actions {
          grid-column: 2; justify-content: flex-end;
        }

        .toast {
          flex-wrap: wrap;
        }
      }

      /* -- Reduced motion ------------------------------------------- */
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important; animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important; scroll-behavior: auto !important;
        }

        /* The staggered entrance would otherwise leave rows at opacity 0. */
        .task-item {
          animation: none; opacity: 1;
        }

        .panel--form {
          transition: none;
        }
      }`,
    },
    {
      path: 'App.jsx',
      content: `      import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
      import TaskForm from './components/TaskForm.jsx';
      import TaskList, { TaskListHeading } from './components/TaskList.jsx';
      import FilterBar from './components/FilterBar.jsx';
      import StatsBar from './components/StatsBar.jsx';
      import Icon from './components/Icons.jsx';
      import { useTasks } from './hooks/useTasks.js';

      const UNDO_WINDOW_MS = 7000;

      /**
       * Composition root.
       *
       * The only component that knows about both the task state hook and every child.
       * It holds two pieces of genuinely local UI state - which row is being edited and
       * whether the sidebar is collapsed on narrow screens - and nothing else.
       */
      export default function App() {
        const tasks = useTasks();
        const [editingId, setEditingId] = useState(null);
        const [sidebarOpen, setSidebarOpen] = useState(false);
        const toastRef = useRef(null);
        const closeTimer = useRef(null);

        const editing = useMemo(
          () => tasks.tasks.find((task) => task.id === editingId) || null,
          [tasks.tasks, editingId],
        );

        const handleEdit = useCallback((id) => {
          setEditingId(id);
          setSidebarOpen(true);
        }, []);

        const handleCancelEdit = useCallback(() => setEditingId(null), []);

        /** One place for every mutation, so the undo toast and focus stay in sync. */
        const handleDelete = useCallback(
          (id) => {
            tasks.removeTask(id);
            setEditingId((current) => (current === id ? null : current));
          },
          [tasks],
        );

        const handleResetFilters = useCallback(() => {
          tasks.setFilter('all');
          tasks.setQuery('');
          tasks.setTag('all');
        }, [tasks]);

        // The undo toast auto-dismisses. The timer is cleared on unmount so a pending
        // timeout cannot call setState on a dead tree.
        useEffect(() => {
          if (!tasks.undoEntry) return undefined;
          closeTimer.current = window.setTimeout(() => tasks.dismissUndo(), UNDO_WINDOW_MS);
          return () => window.clearTimeout(closeTimer.current);
        }, [tasks.undoEntry, tasks.dismissUndo]);

        // Escape closes the toast, then the editor - a natural bottom-up dismissal
        // order for an overlay stack.
        useEffect(() => {
          const onKeyDown = (event) => {
            if (event.key !== 'Escape') return;
            if (tasks.undoEntry) {
              tasks.dismissUndo();
              return;
            }
            if (editingId) setEditingId(null);
          };
          window.addEventListener('keydown', onKeyDown);
          return () => window.removeEventListener('keydown', onKeyDown);
        }, [tasks, editingId]);

        return (
          <div className={'app' + (sidebarOpen ? ' app--sidebar-open' : '')}>
            <a className="skip-link" href="#main">
              Skip to task list
            </a>

            <header className="topbar">
              <div className="topbar__brand">
                <span className="topbar__mark" aria-hidden="true">
                  <Icon name="bolt" size={18} />
                </span>
                <div>
                  <h1 className="topbar__title">Sprintboard</h1>
                  <p className="topbar__sub">Task manager &middot; React + localStorage</p>
                </div>
              </div>

              <div className="topbar__right">
                <p className="topbar__stamp" role="status" aria-live="polite">
                  {tasks.stats.active} open, {tasks.stats.overdue} overdue
                </p>
                <button
                  type="button"
                  className="ghost-button topbar__toggle"
                  aria-expanded={sidebarOpen}
                  aria-controls="task-form-panel"
                  onClick={() => setSidebarOpen((open) => !open)}
                >
                  <Icon name={sidebarOpen ? 'close' : 'plus'} size={16} />
                  {sidebarOpen ? 'Close' : 'New task'}
                </button>
              </div>
            </header>

            <main className="app__body" id="main">
              <section
                className="panel panel--form"
                id="task-form-panel"
                aria-label="Create or edit a task"
              >
                <TaskForm
                  editing={editing}
                  defaultPriority={tasks.defaultPriority}
                  onCreate={tasks.addTask}
                  onUpdate={tasks.updateTask}
                  onCancelEdit={handleCancelEdit}
                />
                <StatsBar
                  total={tasks.stats.total}
                  completed={tasks.stats.completed}
                  active={tasks.stats.active}
                  overdue={tasks.stats.overdue}
                  percent={tasks.stats.percent}
                />
              </section>

              <section className="panel panel--list" aria-label="Task list">
                <FilterBar
                  filter={tasks.filter}
                  onFilterChange={tasks.setFilter}
                  query={tasks.query}
                  onQueryChange={tasks.setQuery}
                  sort={tasks.sort}
                  onSortChange={tasks.setSort}
                  tag={tasks.tag}
                  onTagChange={tasks.setTag}
                  tags={tasks.tags}
                  visibleCount={tasks.visible.length}
                  totalCount={tasks.stats.total}
                  completedCount={tasks.stats.completed}
                  onToggleAll={tasks.toggleAll}
                  onClearCompleted={tasks.clearCompleted}
                />

                <TaskListHeading count={tasks.visible.length} isSearching={tasks.isSearching} />

                <TaskList
                  visible={tasks.visible}
                  total={tasks.stats.total}
                  editingId={editingId}
                  isSearching={tasks.isSearching}
                  leavingId={tasks.leavingId}
                  onToggle={tasks.toggleTask}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onCancelEdit={handleCancelEdit}
                  onMove={tasks.moveTask}
                  onResetFilters={handleResetFilters}
                />

                <footer className="list-footer">
                  <p>
                    Stored in <code>localStorage</code> under <code>gbcoder.react-todo.tasks.v1</code>.
                  </p>
                  <p className="list-footer__tip">
                    <Icon name="bolt" size={13} />
                    Filter, search and sort all run on derived state, so none of them reset your typing.
                  </p>
                </footer>
              </section>
            </main>

            <div
              className={'toast' + (tasks.undoEntry ? ' toast--in' : '')}
              role="status"
              aria-live="polite"
              aria-hidden={!tasks.undoEntry}
              ref={toastRef}
            >
              <span className="toast__label">
                <Icon name="trash" size={15} />
                Deleted &ldquo;{tasks.undoEntry ? tasks.undoEntry.task.title : ''}&rdquo;
              </span>
              <div className="toast__actions">
                <button type="button" className="button button--tiny" onClick={tasks.undoDelete} disabled={!tasks.undoEntry}>
                  <Icon name="undo" size={14} />
                  Undo
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={tasks.dismissUndo}
                  disabled={!tasks.undoEntry}
                  aria-label="Dismiss undo"
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      }`,
    },
    {
      path: 'components/EmptyState.jsx',
      content: `      import Icon from './Icons.jsx';

      /**
       * Shown when the visible list is empty.
       *
       * Two genuinely different situations collapse into one component: there are no
       * tasks at all, or the filters are hiding some. Saying the wrong one is the
       * classic empty-state mistake, so the copy branches on \`isSearching\`.
       */
      export default function EmptyState({ isSearching, totalCount, onClearFilters }) {
        return (
          <div className="empty" role="status">
            <span className="empty__glyph" aria-hidden="true">
              <Icon name={isSearching ? 'search' : 'inbox'} size={26} />
            </span>
            <h3 className="empty__title">
              {isSearching ? 'Nothing matches those filters' : 'No tasks yet'}
            </h3>
            <p className="empty__body">
              {isSearching
                ? 'Try a shorter search term, or widen the filter to include finished work.'
                : 'Add your first task on the left. Press Enter in the name field to save it.'}
            </p>
            {isSearching ? (
              <button type="button" className="button button--quiet" onClick={onClearFilters}>
                <Icon name="close" size={15} />
                Reset filters
              </button>
            ) : (
              <p className="empty__meta">{totalCount} task{isSearching || totalCount === 1 ? '' : 's'} in total</p>
            )}
          </div>
        );
      }`,
    },
    {
      path: 'components/FilterBar.jsx',
      content: `      import Icon from './Icons.jsx';
      import { FILTERS, SORTS } from '../utils/todoStore.js';

      /**
       * Filter, search, sort and bulk actions.
       *
       * \`role="group"\` on each cluster plus a real \`<select>\` for sort keeps this
       * fully keyboard operable without any custom key handling.
       */
      export default function FilterBar({
        filter,
        onFilterChange,
        query,
        onQueryChange,
        sort,
        onSortChange,
        tag,
        onTagChange,
        tags,
        visibleCount,
        totalCount,
        completedCount,
        onToggleAll,
        onClearCompleted,
      }) {
        const hasFilters = query.trim().length > 0 || tag !== 'all' || filter !== 'all';

        return (
          <section className="filters" aria-labelledby="filters-heading">
            <h2 className="sr-only" id="filters-heading">
              Filter and sort tasks
            </h2>

            <div className="filters__search">
              <label className="sr-only" htmlFor="task-search">
                Search tasks
              </label>
              <span className="filters__search-icon" aria-hidden="true">
                <Icon name="search" size={16} />
              </span>
              <input
                id="task-search"
                className="input input--search"
                type="search"
                value={query}
                placeholder="Search title, notes or tags"
                onChange={(event) => onQueryChange(event.target.value)}
                autoComplete="off"
              />
              {query ? (
                <button type="button" className="filters__clear" onClick={() => onQueryChange('')} aria-label="Clear search">
                  <Icon name="close" size={14} />
                </button>
              ) : null}
            </div>

            <div className="filters__group" role="group" aria-label="Filter by status">
              {FILTERS.map((option) => {
                const count =
                  option.id === 'all'
                    ? totalCount
                    : option.id === 'active'
                      ? totalCount - completedCount
                      : completedCount;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={'pill' + (filter === option.id ? ' pill--on' : '')}
                    aria-pressed={filter === option.id}
                    onClick={() => onFilterChange(option.id)}
                  >
                    {option.label}
                    <span className="pill__count">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="filters__spacer" />

            {tags.length ? (
              <div className="filters__group filters__group--tags" role="group" aria-label="Filter by tag">
                <button
                  type="button"
                  className={'tag-chip' + (tag === 'all' ? ' tag-chip--on' : '')}
                  aria-pressed={tag === 'all'}
                  onClick={() => onTagChange('all')}
                >
                  all
                </button>
                {tags.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    className={'tag-chip' + (tag === entry.id ? ' tag-chip--on' : '')}
                    aria-pressed={tag === entry.id}
                    onClick={() => onTagChange(tag === entry.id ? 'all' : entry.id)}
                  >
                    {entry.id}
                    <span className="tag-chip__count">{entry.count}</span>
                  </button>
                ))}
              </div>
            ) : null}

            <div className="filters__tail">
              <label className="sr-only" htmlFor="task-sort">
                Sort tasks
              </label>
              <select
                id="task-sort"
                className="input input--select input--compact"
                value={sort}
                onChange={(event) => onSortChange(event.target.value)}
              >
                {SORTS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="ghost-button"
                onClick={onToggleAll}
                disabled={totalCount === 0}
              >
                <Icon name="check" size={15} />
                Toggle all
              </button>

              <button
                type="button"
                className="ghost-button ghost-button--danger"
                onClick={onClearCompleted}
                disabled={completedCount === 0}
              >
                <Icon name="trash" size={15} />
                Clear done
              </button>
            </div>

            <p className="filters__status" role="status" aria-live="polite">
              Showing <strong>{visibleCount}</strong> of {totalCount}
              {hasFilters ? ' after filtering' : ''}.
            </p>
          </section>
        );
      }`,
    },
    {
      path: 'components/Icons.jsx',
      content: `      /**
       * Inline SVG icon set.
       *
       * No icon library, no emoji. Every glyph is a 24x24 stroked path using
       * \`currentColor\`, so an icon always matches the text colour of its container and
       * can be resized from CSS alone.
       */

      const PATHS = {
        plus: 'M12 5v14M5 12h14',
        check: 'm20 6-11 11-5-5',
        trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
        pencil: 'm4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20ZM13.5 6.5l3 3',
        close: 'M6 6l12 12M18 6 6 18',
        chevronUp: 'm6 15 6-6 6 6',
        chevronDown: 'm6 9 6 6 6-6',
        arrowUp: 'M12 20V4M6 10l6-6 6 6',
        arrowDown: 'M12 4v16M6 14l6 6 6-6',
        search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3',
        inbox: 'M4 13h4l2 3h4l2-3h4M4 13 6.5 5h11L20 13v6H4v-6Z',
        calendar: 'M4 7h16v14H4zM4 11h16M8 4v4M16 4v4',
        flag: 'M6 21V4M6 5h11l-2 3 2 3H6',
        layers: 'm12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5',
        undo: 'M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3',
        bolt: 'M13 2 3 14h8l-1 8 10-12h-8l1-8Z',
        tag: 'M3 12V4h8l10 10-8 8L3 12ZM7 7h.01',
        note: 'M5 4h9l5 5v11H5zM14 4v5h5M8 13h8M8 17h5',
        target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
        chart: 'M3 3v18h18M7 15v-4M12 15V8M17 15v-6',
      };

      /**
       * @param {object} props
       * @param {keyof PATHS} props.name
       * @param {string} [props.className] extra class, usually for sizing
       */
      export default function Icon({ name, className = '', size = 18 }) {
        const d = PATHS[name];
        if (!d) return null;

        return (
          <svg
            className={'icon ' + className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d={d} />
          </svg>
        );
      }

      export const ICON_NAMES = Object.keys(PATHS);`,
    },
    {
      path: 'components/StatsBar.jsx',
      content: `      import Icon from './Icons.jsx';

      /**
       * Headline numbers above the list.
       *
       * The completion bar is a real \`<progress>\` element rather than a div with an
       * inline width percentage. That keeps every visual style in CSS, gets the
       * correct ARIA semantics for free, and lets \`::-webkit-progress-value\`
       * transition so the bar animates without any JS driving it per frame.
       */
      export default function StatsBar({ total, completed, active, overdue, percent }) {
        const tiles = [
          { key: 'total', label: 'Total', value: total, tone: 'neutral' },
          { key: 'active', label: 'Active', value: active, tone: 'active' },
          { key: 'completed', label: 'Completed', value: completed, tone: 'done' },
          { key: 'overdue', label: 'Overdue', value: overdue, tone: overdue > 0 ? 'alert' : 'neutral' },
        ];

        return (
          <section className="stats" aria-labelledby="stats-heading">
            <h2 className="sr-only" id="stats-heading">
              Task summary
            </h2>

            <div className="stats__tiles">
              {tiles.map((tile) => (
                <div key={tile.key} className={'stat-tile stat-tile--' + tile.tone}>
                  <span className="stat-tile__label">{tile.label}</span>
                  <span className="stat-tile__value">{tile.value}</span>
                </div>
              ))}
            </div>

            <div className="stats__progress">
              <div className="stats__progress-head">
                <span className="stats__progress-label">
                  <Icon name="target" size={14} />
                  Completion
                </span>
                <span className="stats__progress-value">{percent}%</span>
              </div>
              <progress
                className="progress"
                max={100}
                value={percent}
                aria-label={'Completion: ' + percent + ' percent, ' + completed + ' of ' + total + ' tasks done'}
              />
              <p className="stats__progress-note">
                {total === 0
                  ? 'Add a task to start tracking progress.'
                  : completed + ' of ' + total + ' tasks finished.' +
                    (overdue > 0 ? ' ' + overdue + ' past due.' : ' Nothing overdue.')}
              </p>
            </div>
          </section>
        );
      }`,
    },
    {
      path: 'components/TaskForm.jsx',
      content: `      import { useCallback, useId, useRef, useState } from 'react';
      import Icon from './Icons.jsx';
      import { MAX_NOTES, MAX_TITLE, PRIORITIES, TAG_LIBRARY } from '../utils/todoStore.js';
      import { todayInputValue } from '../utils/date.js';

      const EMPTY = { title: '', notes: '', priority: 'medium', due: '', tags: '' };

      /**
       * The add/edit form.
       *
       * Doubles as the inline editor: when \`editing\` is passed it is pre-filled and
       * submits an update instead of an insert. Submit happens on Enter from the title
       * field (or anywhere in the form) while Shift+Enter stays available in notes.
       */
      export default function TaskForm({ onCreate, onUpdate, editing, onCancelEdit, defaultPriority = 'medium' }) {
        const [draft, setDraft] = useState(EMPTY);
        const [error, setError] = useState('');
        const [touched, setTouched] = useState(false);
        const titleRef = useRef(null);
        const formId = useId();

        const isEditing = Boolean(editing);

        // When the parent promotes a row into edit mode, adopt that row's values.
        const values = isEditing
          ? {
              title: editing.title,
              notes: editing.notes,
              priority: editing.priority,
              due: editing.due,
              tags: editing.tags.join(', '),
            }
          : { ...EMPTY, priority: defaultPriority };

        const set = useCallback((key) => (event) => {
          const { value } = event.target;
          setDraft((current) => ({ ...current, [key]: value }));
          if (key === 'title') setError('');
        }, []);

        const remaining = MAX_TITLE - draft.title.length;

        const handleSubmit = (event) => {
          event.preventDefault();
          const title = draft.title.trim();

          if (!title) {
            setError('Give the task a name before saving.');
            setTouched(true);
            if (titleRef.current) titleRef.current.focus();
            return;
          }
          if (title.length < 3) {
            setError('Three characters or more, please.');
            setTouched(true);
            return;
          }

          setTouched(false);
          setError('');

          if (isEditing) {
            onUpdate(editing.id, {
              title,
              notes: draft.notes.trim(),
              priority: draft.priority,
              due: draft.due,
              tags: draft.tags,
            });
            onCancelEdit();
          } else {
            onCreate({
              title,
              notes: draft.notes.trim(),
              priority: draft.priority,
              due: draft.due,
              tags: draft.tags,
            });
            setDraft({ ...EMPTY, priority: defaultPriority });
          }
        };

        const handleCancel = () => {
          setDraft(EMPTY);
          setError('');
          setTouched(false);
          onCancelEdit();
        };

        return (
          <form className="task-form" onSubmit={handleSubmit} noValidate>
            <div className="task-form__head">
              <h2 className="task-form__title">
                <Icon name={isEditing ? 'pencil' : 'plus'} size={16} />
                {isEditing ? 'Edit task' : 'New task'}
              </h2>
              <button
                type="button"
                className="ghost-button"
                onClick={() => setDraft((current) => ({ ...current, due: current.due === todayInputValue() ? '' : todayInputValue() }))}
                aria-label="Toggle due date of today"
              >
                <Icon name="calendar" size={15} />
                {draft.due === todayInputValue() ? 'Today' : 'Due today'}
              </button>
            </div>

            <label className="field">
              <span className="field__label">Task name</span>
              <input
                ref={titleRef}
                id={formId + '-title'}
                className="input"
                type="text"
                value={draft.title}
                onChange={set('title')}
                onBlur={() => setTouched(true)}
                placeholder="Ship the pricing page copy review"
                maxLength={MAX_TITLE}
                autoComplete="off"
                aria-describedby={formId + '-count' + (error ? ' ' + formId + '-error' : '')}
                aria-invalid={Boolean(error) || undefined}
              />
              <span className="field__meta">
                <span
                  id={formId + '-count'}
                  className={'counter' + (remaining <= 10 ? ' counter--warn' : '')}
                  aria-live="polite"
                >
                  {remaining} left
                </span>
              </span>
            </label>

            <label className="field">
              <span className="field__label">Notes</span>
              <textarea
                id={formId + '-notes'}
                className="input input--area"
                rows={2}
                value={draft.notes}
                onChange={set('notes')}
                placeholder="Context, links, acceptance criteria"
                maxLength={MAX_NOTES}
              />
            </label>

            <div className="task-form__row">
              <label className="field field--compact">
                <span className="field__label">Priority</span>
                <select id={formId + '-priority'} className="input input--select" value={draft.priority} onChange={set('priority')}>
                  {PRIORITIES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field field--compact">
                <span className="field__label">Due</span>
                <input
                  id={formId + '-due'}
                  className="input input--date"
                  type="date"
                  value={draft.due}
                  onChange={set('due')}
                />
              </label>
            </div>

            <fieldset className="field field--tags">
              <legend className="field__label">Tags</legend>
              <div className="chip-row chip-row--pick">
                {TAG_LIBRARY.map((tag) => {
                  const active = draft.tags.split(',').some((part) => part.trim() === tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={'chip chip--button' + (active ? ' chip--on' : '')}
                      aria-pressed={active}
                      onClick={() => {
                        const parts = draft.tags.split(',').map((s) => s.trim()).filter(Boolean);
                        const next = parts.indexOf(tag) === -1
                          ? parts.concat(tag)
                          : parts.filter((p) => p !== tag);
                        setDraft((current) => ({ ...current, tags: next.join(', ') }));
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              <input
                id={formId + '-tags'}
                className="input input--tags"
                type="text"
                value={draft.tags}
                onChange={set('tags')}
                placeholder="custom tags, comma separated"
                aria-label="Custom tags, comma separated"
              />
            </fieldset>

            {touched && error ? (
              <p className="form-error" id={formId + '-error'} role="alert">
                <Icon name="close" size={14} />
                {error}
              </p>
            ) : null}

            <div className="task-form__actions">
              <button type="submit" className="button button--primary">
                <Icon name={isEditing ? 'check' : 'plus'} size={16} />
                {isEditing ? 'Save changes' : 'Add task'}
              </button>
              {isEditing ? (
                <button type="button" className="button button--quiet" onClick={handleCancel}>
                  Cancel
                </button>
              ) : null}
              <p className="form-hint">Press Enter to save. Notes accept up to {MAX_NOTES} characters.</p>
            </div>
          </form>
        );
      }`,
    },
    {
      path: 'components/TaskItem.jsx',
      content: `      import { memo, useEffect, useRef } from 'react';
      import Icon from './Icons.jsx';
      import { describeDueDate, formatDueDate, isOverdue } from '../utils/date.js';
      import { priorityLabel } from '../utils/todoStore.js';

      /**
       * One task row.
       *
       * Memoised because the list re-renders on every keystroke in the search box, and
       * a row's props only change when *that* row changes. The compare function is
       * explicit rather than a default \`Object.is\` on the whole task, so editing an
       * unrelated task does not repaint every row.
       */
      function TaskItem({ task, index, total, isEditing, isLeaving, onToggle, onEdit, onDelete, onCancelEdit, onMove }) {
        const inputRef = useRef(null);

        // Focus the row's own input the moment it enters edit mode, so the caret is
        // already where the user expects after clicking the pencil.
        useEffect(() => {
          if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
          }
        }, [isEditing]);

        const overdue = !task.completed && isOverdue(task.due);
        const dueToday = !task.completed && !overdue && task.due === new Date().toISOString().slice(0, 10);
        const atTop = index === 0;
        const atBottom = index === total - 1;

        const priority = priorityLabel(task.priority);

        return (
          <li
            className={
              'task-item' +
              ' task-item--' +
              task.priority +
              (task.completed ? ' task-item--done' : '') +
              (isEditing ? ' task-item--editing' : '') +
              (isLeaving ? ' task-item--leaving' : '')
            }
          >
            <span className="task-item__rail" aria-hidden="true" />

            <label className="check">
              <input
                type="checkbox"
                className="check__input"
                checked={task.completed}
                onChange={() => onToggle(task.id)}
              />
              <span className="check__box" aria-hidden="true">
                <Icon name="check" size={13} />
              </span>
              <span className="sr-only">{task.completed ? 'Mark as not done' : 'Mark as done'}: {task.title}</span>
            </label>

            {isEditing ? (
              <div className="task-item__edit">
                <label className="sr-only" htmlFor={'edit-title-' + task.id}>
                  Task name
                </label>
                <input
                  id={'edit-title-' + task.id}
                  ref={inputRef}
                  className="input input--inline"
                  type="text"
                  defaultValue={task.title}
                  maxLength={120}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') onCancelEdit();
                    if (event.key === 'Enter') onCancelEdit();
                  }}
                />
                <div className="task-item__edit-actions">
                  <button type="button" className="icon-button icon-button--go" onClick={onCancelEdit} aria-label="Save and close editor">
                    <Icon name="check" size={15} />
                  </button>
                  <button type="button" className="icon-button" onClick={onCancelEdit} aria-label="Cancel editing">
                    <Icon name="close" size={15} />
                  </button>
                </div>
                <p className="task-item__hint">Enter saves, Escape cancels.</p>
              </div>
            ) : (
              <div className="task-item__body">
                <p className="task-item__title">{task.title}</p>
                {task.notes ? <p className="task-item__notes">{task.notes}</p> : null}

                <div className="task-item__meta">
                  <span className={'badge badge--' + task.priority}>{priority}</span>

                  {task.due ? (
                    <span
                      className={
                        'meta-pill' + (overdue ? ' meta-pill--overdue' : dueToday ? ' meta-pill--today' : '')
                      }
                      title={describeDueDate(task.due)}
                    >
                      <Icon name="calendar" size={13} />
                      {formatDueDate(task.due)}
                      {overdue ? <span className="sr-only">, overdue</span> : null}
                    </span>
                  ) : null}

                  {task.tags.map((tag) => (
                    <span key={tag} className="tag-chip tag-chip--static">
                      {tag}
                    </span>
                  ))}

                  {task.updatedAt && !isEditing ? (
                    <span className="task-item__stamp">
                      {task.completed ? 'done' : 'updated'} {new Date(task.updatedAt).toLocaleDateString()}
                    </span>
                  ) : null}
                </div>
              </div>
            )}

            {!isEditing ? (
              <div className="task-item__actions">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onMove(task.id, -1)}
                  disabled={atTop}
                  aria-label={'Move ' + task.title + ' up'}
                >
                  <Icon name="arrowUp" size={15} />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onMove(task.id, 1)}
                  disabled={atBottom}
                  aria-label={'Move ' + task.title + ' down'}
                >
                  <Icon name="arrowDown" size={15} />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onEdit(task.id)}
                  aria-label={'Edit ' + task.title}
                >
                  <Icon name="pencil" size={15} />
                </button>
                <button
                  type="button"
                  className="icon-button icon-button--danger"
                  onClick={() => onDelete(task.id)}
                  aria-label={'Delete ' + task.title}
                >
                  <Icon name="trash" size={15} />
                </button>
              </div>
            ) : null}
          </li>
        );
      }

      export default memo(TaskItem, (prev, next) => {
        return (
          prev.task === next.task &&
          prev.index === next.index &&
          prev.total === next.total &&
          prev.isEditing === next.isEditing &&
          prev.isLeaving === next.isLeaving
        );
      });`,
    },
    {
      path: 'components/TaskList.jsx',
      content: `      import Icon from './Icons.jsx';
      import TaskItem from './TaskItem.jsx';
      import EmptyState from './EmptyState.jsx';

      /**
       * The task list plus its two empty states.
       *
       * \`visible\` is already filtered and sorted by \`useTasks\`, so this component only
       * decides what to render. \`key\` is the task id, never the array index: the rows
       * get reordered by the move buttons, and an index key would make React reuse the
       * wrong DOM node - which is exactly how the checkbox state would end up on the
       * wrong task.
       */
      export default function TaskList({
        visible,
        total,
        editingId,
        isSearching,
        leavingId,
        onToggle,
        onEdit,
        onDelete,
        onCancelEdit,
        onMove,
        onResetFilters,
      }) {
        if (visible.length === 0) {
          return <EmptyState isSearching={isSearching} totalCount={total} onClearFilters={onResetFilters} />;
        }

        return (
          <ul className="task-list" aria-label="Tasks">
            {visible.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                index={index}
                total={visible.length}
                isEditing={editingId === task.id}
                isLeaving={leavingId === task.id}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                onCancelEdit={onCancelEdit}
                onMove={onMove}
              />
            ))}
          </ul>
        );
      }

      export function TaskListHeading({ count, isSearching }) {
        return (
          <div className="list-heading">
            <h2 className="list-heading__title">
              <Icon name="layers" size={16} />
              {isSearching ? 'Filtered results' : 'Your tasks'}
            </h2>
            <span className="list-heading__count">{count} shown</span>
          </div>
        );
      }`,
    },
    {
      path: 'hooks/useLocalStorage.js',
      content: `      import { useCallback, useEffect, useRef, useState } from 'react';

      /**
       * State that mirrors itself into localStorage on every change.
       *
       * Two details matter for a playground:
       *
       *  1. The first render uses the caller's initial value, never localStorage.
       *     Reading storage during render would make the markup depend on a side
       *     channel and breaks anything that assumes a stable first paint.
       *  2. Writes are guarded. localStorage throws in private-mode Safari and when a
       *     sandboxed iframe is out of quota, and a throw inside a useEffect would
       *     take the whole tree down.
       */

      /** Reads and validates a stored value, falling back on anything unusable. */
      const readStored = (key, revive) => {
        try {
          const raw = window.localStorage.getItem(key);
          if (raw === null) return undefined;
          return revive(JSON.parse(raw));
        } catch {
          return undefined;
        }
      };

      /**
       * @param {string} key            localStorage key
       * @param {unknown} initialValue  value used until storage has been read
       * @param {(raw: unknown) => boolean} [isValid]  shape guard for restored data
       */
      export function useLocalStorage(key, initialValue, isValid) {
        const [value, setValue] = useState(initialValue);
        const [hydrated, setHydrated] = useState(false);
        const keyRef = useRef(key);
        keyRef.current = key;

        // Hydrate once, after the first paint. \`hydrated\` gates the writer so we
        // never write the initial value back over data we have not read yet.
        useEffect(() => {
          const stored = readStored(keyRef.current, (raw) => raw);
          if (stored !== undefined && (typeof isValid !== 'function' || isValid(stored))) {
            setValue(stored);
          }
          setHydrated(true);
        }, []);

        useEffect(() => {
          if (!hydrated) return;
          try {
            window.localStorage.setItem(keyRef.current, JSON.stringify(value));
          } catch {
            /* quota exceeded or storage disabled - state still works in memory */
          }
        }, [value, hydrated]);

        const reset = useCallback(() => {
          setValue(initialValue);
        }, [initialValue]);

        return [value, setValue, { hydrated, reset }];
      }`,
    },
    {
      path: 'hooks/useTasks.js',
      content: `      import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
      import { useLocalStorage } from './useLocalStorage.js';
      import {
        DEFAULT_PRIORITY,
        collectTags,
        createTask,
        isTaskArray,
        normalisePriority,
        parseTags,
        selectVisibleTasks,
        summarise,
      } from '../utils/todoStore.js';

      const STORAGE_KEY = 'gbcoder.react-todo.tasks.v1';

      /** Matches the \`task-out\` duration in styles.css. */
      const EXIT_MS = 240;

      /**
       * All task state and every mutation, in one hook.
       *
       * Components below stay presentational: \`TaskItem\` receives a task and a handful
       * of callbacks and knows nothing about storage, filters or sorting.
       */
      export function useTasks() {
        const [tasks, setTasks] = useLocalStorage(STORAGE_KEY, [], isTaskArray);
        const [filter, setFilter] = useState('all');
        const [query, setQuery] = useState('');
        const [sort, setSort] = useState('created');
        const [tag, setTag] = useState('all');

        /** Last deleted task, held so the toast can offer a real undo. */
        const [undoEntry, setUndoEntry] = useState(null);
        /** Id of the row currently playing its exit animation. */
        const [leavingId, setLeavingId] = useState(null);

        const exitTimer = useRef(null);

        // Refs mirror state so callbacks can read the latest value without being
        // re-created on every keystroke.
        const tasksRef = useRef(tasks);
        tasksRef.current = tasks;
        const undoRef = useRef(undoEntry);
        undoRef.current = undoEntry;

        // A pending exit must never commit into an unmounted tree.
        useEffect(() => () => window.clearTimeout(exitTimer.current), []);

        const addTask = useCallback(
          (draft) => {
            const task = createTask(draft);
            setTasks((current) => [task, ...current]);
            return task;
          },
          [setTasks],
        );

        const updateTask = useCallback(
          (id, patch) => {
            const clean = { ...patch };
            if ('priority' in clean) clean.priority = normalisePriority(clean.priority);
            if ('tags' in clean) clean.tags = parseTags(clean.tags);
            if ('title' in clean) {
              const title = String(clean.title).trim();
              // A blank title is a rejected edit, not a task called "".
              if (!title) return;
              clean.title = title;
            }
            if ('notes' in clean) clean.notes = String(clean.notes).trim();

            setTasks((current) =>
              current.map((task) =>
                task.id === id ? { ...task, ...clean, updatedAt: new Date().toISOString() } : task,
              ),
            );
          },
          [setTasks],
        );

        const toggleTask = useCallback(
          (id) => {
            setTasks((current) =>
              current.map((task) =>
                task.id === id
                  ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
                  : task,
              ),
            );
          },
          [setTasks],
        );

        /**
         * Deletion is two-phase: mark the row as leaving, then drop it once the exit
         * animation has finished. That is why removal is deferred by EXIT_MS rather
         * than happening on click.
         */
        const removeTask = useCallback(
          (id) => {
            const list = tasksRef.current;
            const target = list.find((task) => task.id === id);
            if (!target) return;

            window.clearTimeout(exitTimer.current);
            setUndoEntry({ task: target, index: list.indexOf(target) });
            setLeavingId(id);

            exitTimer.current = window.setTimeout(() => {
              setTasks((current) => current.filter((task) => task.id !== id));
              setLeavingId(null);
              exitTimer.current = null;
            }, EXIT_MS);
          },
          [setTasks],
        );

        /** Cancels a pending exit, and re-inserts if the removal already committed. */
        const undoDelete = useCallback(() => {
          window.clearTimeout(exitTimer.current);
          exitTimer.current = null;
          setLeavingId(null);

          const entry = undoRef.current;
          setUndoEntry(null);
          if (!entry) return;

          setTasks((current) => {
            if (current.some((task) => task.id === entry.task.id)) return current;
            const next = current.slice();
            next.splice(Math.min(entry.index, next.length), 0, entry.task);
            return next;
          });
        }, [setTasks]);

        const dismissUndo = useCallback(() => setUndoEntry(null), []);

        const clearCompleted = useCallback(() => {
          setTasks((current) => current.filter((task) => !task.completed));
        }, [setTasks]);

        const toggleAll = useCallback(() => {
          setTasks((current) => {
            if (current.length === 0) return current;
            const everyDone = current.every((task) => task.completed);
            const stamp = new Date().toISOString();
            return current.map((task) => ({ ...task, completed: !everyDone, updatedAt: stamp }));
          });
        }, [setTasks]);

        /**
         * Moves a task one slot up or down in the stored order. Moves past either end
         * are no-ops rather than errors, so holding a button down is harmless.
         */
        const moveTask = useCallback(
          (id, direction) => {
            setTasks((current) => {
              const index = current.findIndex((task) => task.id === id);
              if (index === -1) return current;
              const target = index + direction;
              if (target < 0 || target >= current.length) return current;
              const next = current.slice();
              const [moved] = next.splice(index, 1);
              next.splice(target, 0, moved);
              return next;
            });
          },
          [setTasks],
        );

        const visible = useMemo(
          () => selectVisibleTasks(tasks, { filter, query, sort, tag }),
          [tasks, filter, query, sort, tag],
        );

        const stats = useMemo(() => summarise(tasks), [tasks]);
        const tags = useMemo(() => collectTags(tasks), [tasks]);

        return {
          tasks,
          visible,
          stats,
          tags,
          filter,
          setFilter,
          query,
          setQuery,
          sort,
          setSort,
          tag,
          setTag,
          leavingId,
          undoEntry,
          addTask,
          updateTask,
          toggleTask,
          removeTask,
          undoDelete,
          dismissUndo,
          clearCompleted,
          toggleAll,
          moveTask,
          /** The list is empty because of a search, not because there is nothing to do. */
          isSearching: query.trim().length > 0 || tag !== 'all',
          defaultPriority: DEFAULT_PRIORITY,
        };
      }`,
    },
    {
      path: 'utils/date.js',
      content: `      /**
       * Date helpers for the task manager.
       *
       * Everything here works on plain \`YYYY-MM-DD\` strings rather than Date objects
       * so that a due date never drifts across a timezone boundary. \`new Date('2026-03-04')\`
       * is parsed as UTC midnight, which renders as the *previous* day for anyone west
       * of Greenwich. Splitting the string keeps the calendar day the user picked.
       */

      const pad = (n) => String(n).padStart(2, '0');

      /** Formats a Date as the \`YYYY-MM-DD\` string an <input type="date"> expects. */
      export const toDateInputValue = (date) =>
        date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());

      /** Today's calendar day, as a \`YYYY-MM-DD\` string. */
      export const todayInputValue = () => toDateInputValue(new Date());

      /** A date \`days\` from today. Negative values are in the past. */
      export const offsetInputValue = (days) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return toDateInputValue(d);
      };

      /** Splits a \`YYYY-MM-DD\` string into numbers without going through Date. */
      const parts = (value) => {
        const [y, m, d] = String(value).split('-').map(Number);
        return { y: y || 0, m: m || 0, d: d || 0 };
      };

      /** Whole days from today until \`value\`. Negative when the date has passed. */
      export const daysUntil = (value) => {
        if (!value) return null;
        const today = parts(todayInputValue());
        const target = parts(value);
        const todayUtc = Date.UTC(today.y, today.m - 1, today.d);
        const targetUtc = Date.UTC(target.y, target.m - 1, target.d);
        return Math.round((targetUtc - todayUtc) / 86400000);
      };

      /** True when a task's due date is strictly before today. */
      export const isOverdue = (value) => {
        const diff = daysUntil(value);
        return diff !== null && diff < 0;
      };

      const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      /** Short human label for a due date: "Today", "Tomorrow", "Mar 4", "Mar 4, 2025". */
      export const formatDueDate = (value) => {
        const diff = daysUntil(value);
        if (diff === null) return '';
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Tomorrow';
        if (diff === -1) return 'Yesterday';
        const { y, m, d } = parts(value);
        const thisYear = new Date().getFullYear();
        const base = MONTHS[m - 1] + ' ' + d;
        return y === thisYear ? base : base + ', ' + y;
      };

      /** Long form used by the \`title\` attribute so screen readers get the year. */
      export const describeDueDate = (value) => {
        const diff = daysUntil(value);
        if (diff === null) return '';
        const { y, m, d } = parts(value);
        const spelled = MONTHS[m - 1] + ' ' + d + ', ' + y;
        if (diff === 0) return 'Due today (' + spelled + ')';
        if (diff === 1) return 'Due tomorrow (' + spelled + ')';
        if (diff === -1) return 'Overdue by a day (' + spelled + ')';
        return diff < 0
          ? 'Overdue by ' + Math.abs(diff) + ' days (' + spelled + ')'
          : 'Due in ' + diff + ' days (' + spelled + ')';
      };

      /** ISO timestamp for a task's createdAt field, now. */
      export const nowStamp = () => new Date().toISOString();

      /** Monotonic-ish unique id. Prefixed so it never collides with a seeded id. */
      export const makeId = () =>
        't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);`,
    },
    {
      path: 'utils/todoStore.js',
      content: `      import { makeId, nowStamp, offsetInputValue } from './date.js';

      /**
       * The task manager's domain layer: plain data, plain functions.
       *
       * Nothing here touches React. Keeping filtering, sorting and scoring outside the
       * component tree means the rules are readable in one screen and the components
       * stay presentational.
       */

      /** Priority is ordered, not just labelled - \`weight\` is what sorting uses. */
      export const PRIORITIES = [
        { id: 'high', label: 'High', weight: 3 },
        { id: 'medium', label: 'Medium', weight: 2 },
        { id: 'low', label: 'Low', weight: 1 },
      ];

      export const PRIORITY_IDS = PRIORITIES.map((p) => p.id);
      export const DEFAULT_PRIORITY = 'medium';

      /** Weight lookup, so \`priorityWeight('high')\` never throws on bad data. */
      export const priorityWeight = (id) => {
        const found = PRIORITIES.find((p) => p.id === id);
        return found ? found.weight : 0;
      };

      export const priorityLabel = (id) => {
        const found = PRIORITIES.find((p) => p.id === id);
        return found ? found.label : 'Medium';
      };

      /** Normalises anything a \`<select>\` or a restored blob can hand us. */
      export const normalisePriority = (id) =>
        PRIORITY_IDS.indexOf(id) === -1 ? DEFAULT_PRIORITY : id;

      export const FILTERS = [
        { id: 'all', label: 'All' },
        { id: 'active', label: 'Active' },
        { id: 'completed', label: 'Completed' },
      ];

      export const SORTS = [
        { id: 'created', label: 'Newest first' },
        { id: 'due', label: 'Due date' },
        { id: 'priority', label: 'Priority' },
        { id: 'alpha', label: 'A to Z' },
      ];

      export const MAX_TITLE = 120;
      export const MAX_NOTES = 400;

      /** Tags offered in the form. Any other tag typed in the field is still accepted. */
      export const TAG_LIBRARY = [
        'frontend',
        'backend',
        'design',
        'infra',
        'bug',
        'docs',
        'release',
        'research',
      ];

      const slugTag = (raw) =>
        String(raw)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 18);

      /** Splits a comma-separated tag string into a clean, de-duplicated list. */
      export const parseTags = (raw) => {
        if (Array.isArray(raw)) return raw.map(slugTag).filter(Boolean);
        return String(raw || '')
          .split(',')
          .map(slugTag)
          .filter(Boolean)
          .filter((tag, i, all) => all.indexOf(tag) === i)
          .slice(0, 6);
      };

      /** Builds a well-formed task from form state, filling in defaults. */
      export const createTask = (draft) => {
        const title = String(draft.title || '').trim();
        return {
          id: draft.id || makeId(),
          title: title.slice(0, MAX_TITLE),
          notes: String(draft.notes || '').trim().slice(0, MAX_NOTES),
          priority: normalisePriority(draft.priority),
          due: draft.due || '',
          tags: parseTags(draft.tags),
          completed: Boolean(draft.completed),
          createdAt: draft.createdAt || nowStamp(),
          updatedAt: nowStamp(),
        };
      };

      /** Shape guard for data restored from localStorage. */
      export const isTaskArray = (raw) =>
        Array.isArray(raw) &&
        raw.every((t) => t && typeof t.id === 'string' && typeof t.title === 'string');

      /**
       * \`created\` sorts newest-first while every other sort is ascending, so the
       * comparator is written as "sign of the difference" rather than raw compare.
       */
      const SORTERS = {
        created: (a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0),
        alpha: (a, b) => a.title.localeCompare(b.title),
        priority: (a, b) =>
          priorityWeight(b.priority) - priorityWeight(a.priority) ||
          (a.createdAt < b.createdAt ? 1 : -1),
        due: (a, b) => {
          // No due date sorts to the end rather than to 1970.
          if (!a.due && !b.due) return 0;
          if (!a.due) return 1;
          if (!b.due) return -1;
          return a.due < b.due ? -1 : a.due > b.due ? 1 : 0;
        },
      };

      /** Applies status filter, free-text search and tag scoping, then sorts. */
      export function selectVisibleTasks(tasks, options) {
        const filter = options.filter || 'all';
        const query = String(options.query || '').trim().toLowerCase();
        const tag = options.tag && options.tag !== 'all' ? options.tag : null;
        const sort = options.sort || 'created';

        const filtered = tasks.filter((task) => {
          if (filter === 'active' && task.completed) return false;
          if (filter === 'completed' && !task.completed) return false;
          if (tag && task.tags.indexOf(tag) === -1) return false;
          if (!query) return true;
          const haystack =
            task.title.toLowerCase() +
            ' ' +
            task.notes.toLowerCase() +
            ' ' +
            task.tags.join(' ');
          return haystack.indexOf(query) !== -1;
        });

        const comparator = SORTERS[sort] || SORTERS.created;
        return filtered.slice().sort(comparator);
      }

      /** Headline numbers for the stats bar. Computed over *all* tasks, not the view. */
      export function summarise(tasks) {
        let completed = 0;
        let overdue = 0;
        const today = new Date().toISOString().slice(0, 10);

        for (const task of tasks) {
          if (task.completed) completed += 1;
          else if (task.due && task.due < today) overdue += 1;
        }

        const total = tasks.length;
        const active = total - completed;
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

        return { total, completed, active, overdue, percent };
      }

      /** Every tag in use, ordered by frequency then alphabetically. */
      export function collectTags(tasks) {
        const counts = new Map();
        for (const task of tasks) {
          for (const tag of task.tags) counts.set(tag, (counts.get(tag) || 0) + 1);
        }
        return Array.from(counts.entries())
          .map(([id, count]) => ({ id, count }))
          .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
      }

      /**
       * First-run data. Due dates are relative to today so the overdue and
       * due-today states are both visible the moment the template loads.
       */
      export const SEED_TASKS = [
        createTask({
          title: 'Replace the checkout spinner with a skeleton',
          notes: 'Customers see a 2s blank card on slow 3G. Skeleton matches the real layout.',
          priority: 'high',
          due: offsetInputValue(0),
          tags: 'frontend,design',
          completed: false,
          createdAt: '2026-02-02T09:12:00.000Z',
        }),
        createTask({
          title: 'Backfill invoice_id on the ledger table',
          notes: 'Rows before 2024-06 are null. Backfill from the PDF archive, then add NOT NULL.',
          priority: 'high',
          due: offsetInputValue(-2),
          tags: 'backend,infra',
          completed: false,
          createdAt: '2026-02-04T14:41:00.000Z',
        }),
        createTask({
          title: 'Write the onboarding guide for new engineers',
          notes: 'Cover local setup, deploy train, and who to ping for what.',
          priority: 'low',
          due: offsetInputValue(9),
          tags: 'docs',
          completed: false,
          createdAt: '2026-02-06T11:03:00.000Z',
        }),
        createTask({
          title: 'Migrate session store off the single Redis node',
          notes: 'Move to the managed cluster, then cut over during the Tuesday window.',
          priority: 'medium',
          due: offsetInputValue(4),
          tags: 'infra,release',
          completed: false,
          createdAt: '2026-02-07T16:20:00.000Z',
        }),
        createTask({
          title: 'Audit colour contrast on the settings screens',
          notes: 'WCAG AA on the four toggle rows that failed in the last audit.',
          priority: 'medium',
          due: '',
          tags: 'frontend,design,bug',
          completed: true,
          createdAt: '2026-01-28T08:55:00.000Z',
        }),
        createTask({
          title: 'Prototype the offline queue for field inspections',
          notes: 'Two engineers, one week. Spike only - no production wiring yet.',
          priority: 'low',
          due: offsetInputValue(16),
          tags: 'research',
          completed: false,
          createdAt: '2026-01-30T13:37:00.000Z',
        }),
        createTask({
          title: 'Remove the deprecated /v1/reports endpoint',
          notes: 'Two internal callers left. Ping analytics before deleting.',
          priority: 'low',
          due: '',
          tags: 'backend',
          completed: true,
          createdAt: '2026-01-22T10:02:00.000Z',
        }),
      ];`,
    }
  ],
};
