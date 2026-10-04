// Calculator App Template — Slate
// Plain payload: an HTML fragment plus stylesheet and script. The host owns
// <body>, so this file supplies a fragment that owns the whole page and
// resets body itself. The expression engine is a hand-written tokenizer plus
// recursive-descent parser — there is no eval() and no Function() anywhere.

export default {
  html: `
<a class="skip-link" href="#workspace">Skip to the calculator</a>

<svg class="sprite" width="0" height="0" aria-hidden="true" focusable="false">
  <symbol id="i-calc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2.6" width="16" height="18.8" rx="2.4"/><path d="M7.4 7.2h1.6v1.6H7.4zM15 7.2h1.6v1.6H15zM7.4 11.2H9v1.6H7.4zM15 11.2h1.6v1.6H15zM10.4 15.2h3.2v3.2h-3.2z"/></symbol>
  <symbol id="i-history" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3.4 12a8.6 8.6 0 1 0 2.6-6.1L3 8.6"/><path d="M3 4v4.6h4.6M12 7.2V12l3.2 2"/></symbol>
  <symbol id="i-sliders" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h9M18 8h2M4 16h4M13 16h7M15 5v6M8 13v6"/></symbol>
  <symbol id="i-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9 9h11v11H9zM5 15H4V4h11v1"/></symbol>
  <symbol id="i-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6 6 18"/></symbol>
  <symbol id="i-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9.5 6 6 6-6"/></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></symbol>
  <symbol id="i-trash" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4.8h6V7M6.5 7l.9 13h9.2l.9-13"/></symbol>
  <symbol id="i-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></symbol>
  <symbol id="i-arrow-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V5m-7 7 7-7 7 7"/></symbol>
  <symbol id="i-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v14H4zM4 7l8 6 8-6"/></symbol>
  <symbol id="i-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.6"/><path d="M3.4 12h17.2M12 3.4a14 14 0 0 1 0 17.2 14 14 0 0 1 0-17.2Z"/></symbol>
  <symbol id="i-instagram" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1"/></symbol>
  <symbol id="i-linkedin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7.6 10.2v6.6M7.6 7.2h.01M11.6 16.8v-3.6a2.2 2.2 0 0 1 4.4 0v3.6"/></symbol>
  <symbol id="i-target" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r="1"/></symbol>
  <symbol id="i-branch" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="6.5" cy="6" r="2.6"/><circle cx="17.5" cy="18" r="2.6"/><path d="M6.5 8.6v5.4a3 3 0 0 0 3 3h5.4"/></symbol>
  <symbol id="i-guard" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12h17M12 3.5v4M12 16.5v4M6.6 6.6l2.8 2.8M14.6 14.6l2.8 2.8"/></symbol>
  <symbol id="i-code" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m8 6-6 6 6 6M16 6l6 6-6 6M13.4 4.6l-2.8 14.8"/></symbol>
  <symbol id="i-wallet" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18v2.6M3 7.5V17a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5.5A2.5 2.5 0 0 1 3 6.5v1ZM16.4 14h.01"/></symbol>
  <symbol id="i-book" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5h6a3 3 0 0 1 2 3 3 3 0 0 1 2-3h6v14h-6a3 3 0 0 0-2 1 3 3 0 0 0-2-1H4zM12 7.5v12"/></symbol>
  <symbol id="i-ruler" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3.4 14.6 14.6 3.4l6 6-11.2 11.2zM6.6 11.4l1.6 1.6M9.6 8.4l1.6 1.6M12.6 5.4l1.6 1.6"/></symbol>
  <symbol id="i-thermo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0ZM12 9.5v6"/></symbol>
  <symbol id="i-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7.2v5l3.2 2"/></symbol>
  <symbol id="i-sparkles" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 1.9 4.6 4.6 1.9-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Z"/><path d="m19 15 .8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"/></symbol>
  <symbol id="i-scale" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.6v14.8M7 7.6h10M4.4 19.4h15.2M3 12.4 6 7l3 5.4a3 3 0 0 1-6 0ZM15 12.4 18 7l3 5.4a3 3 0 0 1-6 0Z"/></symbol>
  <symbol id="i-function" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18.4 4.4c-3 0-4.4 1.6-5 5l-.8 4.2c-.4 2.1-1.2 3-2.6 3M9 11.6h6M4 20h6"/></symbol>
</svg>

<div class="toasts" id="toasts" role="status" aria-live="polite"></div>

<div class="promo-strip">
  <p>No eval, no analytics, no server round trip &mdash; the parser and every result stay in this tab</p>
</div>

<header class="site-header" id="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="#top" aria-label="Slate, back to top">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none" focusable="false">
          <rect x="3" y="2.6" width="26" height="26.8" rx="6" stroke="currentColor" stroke-width="1.7"/>
          <path d="M9 20.4 12 12l3 8.4 3-8.4 3 8.4" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="brand-text">Slate</span>
    </a>

    <nav class="nav" aria-label="Primary">
      <a class="nav-link" href="#workspace">Calculator</a>
      <a class="nav-link" href="#presets">Presets</a>
      <a class="nav-link" href="#engine">The engine</a>
      <a class="nav-link" href="#shortcuts">Shortcuts</a>
      <a class="nav-link" href="#faq">FAQ</a>
    </nav>

    <div class="header-actions">
      <button class="btn btn-quiet" type="button" id="settings-open" aria-expanded="false" aria-controls="settings-panel">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-sliders"></use></svg>
        <span>Settings</span>
      </button>
      <a class="btn btn-primary btn-sm" href="#workspace">Open calculator</a>
      <button class="icon-btn nav-toggle" type="button" id="nav-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-menu"></use></svg>
      </button>
    </div>
  </div>

  <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile" hidden>
    <a class="mobile-link" href="#workspace">Calculator</a>
    <a class="mobile-link" href="#presets">Presets</a>
    <a class="mobile-link" href="#engine">The engine</a>
    <a class="mobile-link" href="#shortcuts">Shortcuts</a>
    <a class="mobile-link" href="#faq">FAQ</a>
    <button class="btn btn-quiet" type="button" data-act="open-settings">Settings</button>
  </nav>
</header>

<main id="main">
  <span id="top"></span>

  <section class="hero" aria-labelledby="hero-title">
    <div class="wrap hero-inner">
      <div class="hero-copy" data-reveal>
        <p class="kicker"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-branch"></use></svg> Recursive-descent parser</p>
        <h1 id="hero-title">Arithmetic that respects operator precedence.</h1>
        <p class="lede">Slate tokenises what you type and walks it with a hand-written grammar: parentheses, unary minus, powers, percent, functions and constants. No <code>eval</code>, no string-to-code trick, and a real sentence when you divide by zero.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#workspace">Start calculating</a>
          <a class="btn btn-ghost" href="#presets">See the presets <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-arrow-right"></use></svg></a>
        </div>
        <ul class="hero-stats" role="list">
          <li data-reveal style="--delay:60ms"><strong data-count="35">0</strong><span>keys on the pad</span></li>
          <li data-reveal style="--delay:130ms"><strong data-count="12">0</strong><span>one-tap conversions</span></li>
          <li data-reveal style="--delay:200ms"><strong data-count="11">0</strong><span>built-in functions</span></li>
          <li data-reveal style="--delay:270ms"><strong data-count="30">0</strong><span>entries kept in history</span></li>
        </ul>
      </div>

      <aside class="hero-panel" data-reveal style="--delay:120ms" aria-label="Worked example">
        <p class="panel-title">Worked example</p>
        <p class="panel-eq"><code>200 + 10%</code></p>
        <p class="panel-note">A naive left-to-right pass returns <strong>210.1</strong>. Slate reads a trailing <code>%</code> on the right of <code>+</code> as a share of the number on the left, so you get what a desk calculator gives you: <strong>220</strong>.</p>
        <div class="panel-bars">
          <div class="panel-bar"><span>Left to right</span><i style="--w:52%"></i><output>210.1</output></div>
          <div class="panel-bar is-good"><span>Slate</span><i style="--w:100%"></i><output>220</output></div>
        </div>
        <ul class="panel-list" role="list">
          <li><code>(2 + 3) * 4</code><span>20</span></li>
          <li><code>2 + 3 * 4</code><span>14</span></li>
          <li><code>2 ^ 3 ^ 2</code><span>512</span></li>
          <li><code>-2 ^ 2</code><span>-4</span></li>
        </ul>
      </aside>
    </div>
  </section>

  <section class="section workspace-section" id="workspace" aria-labelledby="workspace-title">
    <div class="wrap">
      <header class="section-head section-head-row" data-reveal>
        <div>
          <p class="kicker">The pad</p>
          <h2 id="workspace-title">Calculator, history and presets</h2>
        </div>
        <p class="section-note">Type on the pad or straight from your keyboard. Every result passes through the settings below, so changing precision changes what you see &mdash; never what Slate computed.</p>
      </header>

      <div class="workspace">
        <div class="calc-wrap" data-reveal>
          <div class="calc" role="group" aria-labelledby="workspace-title">
            <div class="calc-top">
              <div class="calc-chips">
                <span class="chip chip-mode" id="chip-angle" title="Angle mode">DEG</span>
                <span class="chip chip-mode" id="chip-sep" title="Thousands separators">1,234</span>
                <span class="chip chip-mode" id="chip-prec" title="Decimal precision">P2</span>
                <span class="chip chip-mem" id="chip-mem" title="Memory register, empty">M</span>
              </div>
              <span class="calc-brand">Slate</span>
            </div>

            <div class="display" id="display" tabindex="-1" role="group" aria-label="Expression and result">
              <p class="disp-expr" id="disp-expr" aria-hidden="true"></p>
              <p class="disp-tail" id="disp-tail" aria-hidden="true"></p>
              <output class="disp-value" id="disp-value" aria-live="polite">0</output>
              <p class="disp-hint" id="disp-hint" role="status" aria-live="polite"></p>
            </div>

            <div class="settings" id="settings-panel" hidden aria-labelledby="settings-title">
              <div class="settings-head">
                <h3 class="settings-title" id="settings-title">Settings</h3>
                <button class="icon-btn" type="button" data-act="close-settings" aria-label="Close settings">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-x"></use></svg>
                </button>
              </div>
              <div class="settings-grid">
                <div class="setting">
                  <span class="setting-label" id="angle-label">Angle mode</span>
                  <div class="switch-group" role="group" aria-labelledby="angle-label">
                    <button type="button" class="switch-btn" data-act="angle" data-value="deg" aria-pressed="true">DEG</button>
                    <button type="button" class="switch-btn" data-act="angle" data-value="rad" aria-pressed="false">RAD</button>
                  </div>
                </div>
                <div class="setting">
                  <label class="setting-label" for="sel-precision">Decimal precision</label>
                  <select class="select-dark" id="sel-precision">
                    <option value="0">0 decimals</option>
                    <option value="1">1 decimal</option>
                    <option value="2" selected>2 decimals</option>
                    <option value="3">3 decimals</option>
                    <option value="4">4 decimals</option>
                    <option value="5">5 decimals</option>
                    <option value="6">6 decimals</option>
                  </select>
                </div>
                <div class="setting setting-wide">
                  <span class="setting-label" id="sep-label">Thousands separators</span>
                  <button type="button" class="toggle" id="btn-sep" data-act="sep" role="switch" aria-checked="true" aria-labelledby="sep-label">
                    <span class="toggle-track" aria-hidden="true"><span class="toggle-knob"></span></span>
                    <span class="toggle-text" id="sep-text">On</span>
                  </button>
                </div>
              </div>
              <p class="settings-note">Formatting only. Slate computes in double precision and rounds once, at the end.</p>
            </div>

            <div class="keyrow keyrow-mem" role="group" aria-label="Memory register">
              <button class="key key-mem" type="button" data-act="mem-clear">MC</button>
              <button class="key key-mem" type="button" data-act="mem-recall">MR</button>
              <button class="key key-mem" type="button" data-act="mem-add">M+</button>
              <button class="key key-mem" type="button" data-act="mem-sub">M−</button>
              <button class="key key-mem" type="button" data-act="mem-store">MS</button>
            </div>

            <div class="keyrow keyrow-sci" role="group" aria-label="Functions">
              <button class="key key-sci" type="button" data-act="fn" data-fn="sin">sin</button>
              <button class="key key-sci" type="button" data-act="fn" data-fn="cos">cos</button>
              <button class="key key-sci" type="button" data-act="fn" data-fn="tan">tan</button>
              <button class="key key-sci" type="button" data-act="fn" data-fn="ln">ln</button>
              <button class="key key-sci" type="button" data-act="fn" data-fn="log">log</button>
              <button class="key key-sci" type="button" data-act="fn" data-fn="sqrt" aria-label="Square root">√</button>
              <button class="key key-sci" type="button" data-act="fn" data-fn="sq" aria-label="Square">x²</button>
              <button class="key key-sci" type="button" data-act="pow" data-key="^">xʸ</button>
              <button class="key key-sci" type="button" data-act="const" data-value="pi" aria-label="Pi">π</button>
              <button class="key key-sci" type="button" data-act="fn" data-fn="inv" aria-label="Reciprocal">1/x</button>
            </div>

            <div class="pad" role="group" aria-label="Keypad">
              <button class="key key-util" type="button" data-act="clear" data-key="Escape" aria-label="All clear">AC</button>
              <button class="key key-util" type="button" data-act="del" data-key="Backspace" aria-label="Delete the character before the cursor">⌫</button>
              <button class="key key-util" type="button" data-act="percent" data-key="%" aria-label="Percent">%</button>
              <button class="key key-op" type="button" data-act="op" data-value="/" data-key="/" aria-label="Divide">÷</button>

              <button class="key key-num" type="button" data-act="digit" data-value="7" data-key="7">7</button>
              <button class="key key-num" type="button" data-act="digit" data-value="8" data-key="8">8</button>
              <button class="key key-num" type="button" data-act="digit" data-value="9" data-key="9">9</button>
              <button class="key key-op" type="button" data-act="op" data-value="*" data-key="*" aria-label="Multiply">×</button>

              <button class="key key-num" type="button" data-act="digit" data-value="4" data-key="4">4</button>
              <button class="key key-num" type="button" data-act="digit" data-value="5" data-key="5">5</button>
              <button class="key key-num" type="button" data-act="digit" data-value="6" data-key="6">6</button>
              <button class="key key-op" type="button" data-act="op" data-value="-" data-key="-" aria-label="Minus">−</button>

              <button class="key key-num" type="button" data-act="digit" data-value="1" data-key="1">1</button>
              <button class="key key-num" type="button" data-act="digit" data-value="2" data-key="2">2</button>
              <button class="key key-num" type="button" data-act="digit" data-value="3" data-key="3">3</button>
              <button class="key key-op" type="button" data-act="op" data-value="+" data-key="+" aria-label="Plus">+</button>

              <button class="key key-num" type="button" data-act="sign" aria-label="Toggle the sign of the number before the cursor">±</button>
              <button class="key key-num" type="button" data-act="digit" data-value="0" data-key="0">0</button>
              <button class="key key-num" type="button" data-act="dot" data-key="." aria-label="Decimal point">.</button>
              <button class="key key-eq" type="button" data-act="equals" data-key="Enter" aria-label="Evaluate">=</button>
            </div>

            <div class="keyrow keyrow-sci keyrow-edit" role="group" aria-label="Grouping and editing">
              <button class="key key-sci" type="button" data-act="paren" data-value="(" data-key="(" aria-label="Open bracket">(</button>
              <button class="key key-sci" type="button" data-act="paren" data-value=")" data-key=")" aria-label="Close bracket">)</button>
              <button class="key key-sci" type="button" data-act="del-forward" data-key="Delete" aria-label="Delete the character after the cursor">Del</button>
              <button class="key key-sci" type="button" data-act="copy-result" aria-label="Copy the result to the clipboard">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-copy"></use></svg>
              </button>
              <button class="key key-sci" type="button" data-act="clear-history" aria-label="Clear the calculation history">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-trash"></use></svg>
              </button>
            </div>

            <p class="calc-foot">Keyboard: digits, <code>+ - * /</code>, <code>^</code>, <code>(</code> <code>)</code>, <code>%</code>, <code>Enter</code>, <code>Esc</code>, <code>Backspace</code> and <code>Delete</code>. Letters are left free so you can type function names: try <code>sqrt(9)</code> or <code>asin(0.5)</code>.</p>
          </div>
        </div>

        <aside class="rail" aria-label="History, presets and reference">
          <div class="rail-head" data-reveal style="--delay:80ms">
            <div class="tabs" role="tablist" aria-label="Side panel">
              <button class="tab is-active" type="button" role="tab" id="tab-history" aria-selected="true" aria-controls="panel-history" data-act="tab" data-panel="history">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-history"></use></svg>
                <span>History</span>
              </button>
              <button class="tab" type="button" role="tab" id="tab-presets" aria-selected="false" aria-controls="panel-presets" tabindex="-1" data-act="tab" data-panel="presets">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-sparkles"></use></svg>
                <span>Presets</span>
              </button>
              <button class="tab" type="button" role="tab" id="tab-reference" aria-selected="false" aria-controls="panel-reference" tabindex="-1" data-act="tab" data-panel="reference">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-book"></use></svg>
                <span>Reference</span>
              </button>
            </div>
          </div>

          <div class="panel is-active" id="panel-history" role="tabpanel" aria-labelledby="tab-history" tabindex="0">
            <div class="panel-tools">
              <p class="panel-note-sm" id="history-count">No calculations yet</p>
              <button class="btn btn-quiet btn-sm" type="button" data-act="clear-history">Clear</button>
            </div>
            <div class="hist-list" id="history-list">
              <p class="empty-note">Press <kbd>=</kbd> and whatever you work out lands here. Click any entry to reuse its result.</p>
            </div>
          </div>

          <div class="panel" id="panel-presets" role="tabpanel" aria-labelledby="tab-presets" tabindex="0" hidden>
            <p class="panel-note-sm">Conversions run through the same parser as the pad, so the precision setting applies here too.</p>
            <div class="conv-grid" id="conv-grid"></div>
            <p class="panel-note-sm panel-note-gap">One-tap sums, worked out on the spot:</p>
            <div class="recipe-list" id="recipe-list"></div>
          </div>

          <div class="panel" id="panel-reference" role="tabpanel" aria-labelledby="tab-reference" tabindex="0" hidden>
            <p class="panel-note-sm">Slate&rsquo;s grammar, tightest first. Every example below is evaluated live by the engine, so it cannot drift from the code.</p>
            <div class="ref-list" id="ref-list"></div>
            <p class="panel-note-sm panel-note-gap">Functions and constants</p>
            <dl class="fn-list">
              <div><dt>sin cos tan</dt><dd>Trigonometric, in DEG or RAD</dd></div>
              <div><dt>asin acos atan</dt><dd>Inverse, returns DEG or RAD</dd></div>
              <div><dt>ln log</dt><dd>Natural and base-10 logarithm</dd></div>
              <div><dt>sqrt sq inv</dt><dd>Root, square, reciprocal</dd></div>
              <div><dt>exp abs</dt><dd>e to the power x, absolute value</dd></div>
              <div><dt>pi e</dt><dd>Two constants</dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  </section>

  <section class="section section-band" id="engine" aria-labelledby="engine-title">
    <div class="wrap">
      <header class="section-head" data-reveal>
        <div>
          <p class="kicker">Under the hood</p>
          <h2 id="engine-title">Four decisions that make the numbers right</h2>
        </div>
        <p class="section-note">Slate&rsquo;s parser is about three hundred lines. This is the part that matters.</p>
      </header>
      <div class="feature-grid">
        <article class="feature" data-reveal style="--delay:0ms">
          <span class="feature-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><use href="#i-branch"></use></svg></span>
          <h3>Recursive descent, not a pass over the string</h3>
          <p>Expression, term, unary, power, postfix, primary. Each level only ever calls the one below it, which is why <code>2 + 3 * 4</code> comes back as 14 with no precedence table in sight.</p>
        </article>
        <article class="feature" data-reveal style="--delay:70ms">
          <span class="feature-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><use href="#i-target"></use></svg></span>
          <h3>Powers bind tightest, and to the right</h3>
          <p><code>2 ^ 3 ^ 2</code> is 512, not 64. Unary minus sits <em>below</em> the power, the way serious calculators treat it, so <code>-2 ^ 2</code> is <code>-(2 ^ 2)</code> = -4. The expression line stays visible so you can see which reading it took.</p>
        </article>
        <article class="feature" data-reveal style="--delay:140ms">
          <span class="feature-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><use href="#i-guard"></use></svg></span>
          <h3>Division by zero is caught, not returned</h3>
          <p>Every division checks for a zero divisor, and the root and logarithm functions refuse the domains they cannot serve. You get a sentence under the display instead of the word <code>Infinity</code>.</p>
        </article>
        <article class="feature" data-reveal style="--delay:210ms">
          <span class="feature-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><use href="#i-code"></use></svg></span>
          <h3>No eval, anywhere</h3>
          <p>Your expression is never treated as code. It becomes a token list and a grammar walks it. Nothing you type can execute, which is also why the surrounding sandbox stays quiet.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="section" id="presets" aria-labelledby="presets-title">
    <div class="wrap">
      <header class="section-head" data-reveal>
        <div>
          <p class="kicker">In practice</p>
          <h2 id="presets-title">Six jobs people actually bring here</h2>
        </div>
        <p class="section-note">Every card below is something the presets tab already covers, if you would rather not type.</p>
      </header>
      <div class="use-grid">
        <article class="use" data-reveal style="--delay:0ms">
          <span class="use-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><use href="#i-wallet"></use></svg></span>
          <h3>Splits and tips</h3>
          <p>Split a bill, add the tip before you divide it, or work out what each of five people owes after a discount has come off.</p>
        </article>
        <article class="use" data-reveal style="--delay:60ms">
          <span class="use-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><use href="#i-ruler"></use></svg></span>
          <h3>Unit conversions</h3>
          <p>Kilometres to miles, pounds to kilograms, litres to gallons. Eight converters, every one of them routed through the same grammar.</p>
        </article>
        <article class="use" data-reveal style="--delay:120ms">
          <span class="use-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><use href="#i-clock"></use></svg></span>
          <h3>Pay and overtime</h3>
          <p>Hours to minutes, or compound growth across a fixed term. Powers and percent both behave the way the label says they do.</p>
        </article>
        <article class="use" data-reveal style="--delay:180ms">
          <span class="use-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><use href="#i-thermo"></use></svg></span>
          <h3>Bakes and batches</h3>
          <p>Halve a 340g loaf, or scale six portions up to fourteen without a rounding slip creeping into the middle of the sum.</p>
        </article>
        <article class="use" data-reveal style="--delay:240ms">
          <span class="use-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><use href="#i-function"></use></svg></span>
          <h3>Coursework checks</h3>
          <p>Confirm an answer before it goes in. <code>asin(0.5)</code> is 30 in degrees and 0.5236 in radians, and the switch in settings proves it.</p>
        </article>
        <article class="use" data-reveal style="--delay:300ms">
          <span class="use-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false"><use href="#i-scale"></use></svg></span>
          <h3>Comparison arithmetic</h3>
          <p>Find which of two quotes is cheaper once tax lands, using brackets so the running order of the operations cannot bite you.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="section section-band" id="shortcuts" aria-labelledby="shortcuts-title">
    <div class="wrap">
      <header class="section-head" data-reveal>
        <div>
          <p class="kicker">Hands on the keyboard</p>
          <h2 id="shortcuts-title">Every shortcut, and what it does</h2>
        </div>
        <p class="section-note">The pad flashes whichever key just fired, so you can watch the mapping working.</p>
      </header>
      <div class="shortcut-wrap" data-reveal>
        <table class="shortcut-table">
          <caption class="sr-only">Keyboard shortcuts for the Slate calculator</caption>
          <thead>
            <tr><th scope="col">Key</th><th scope="col">Action</th><th scope="col">Key</th><th scope="col">Action</th></tr>
          </thead>
          <tbody>
            <tr><td><kbd>0</kbd>&ndash;<kbd>9</kbd></td><td>Append a digit at the cursor</td><td><kbd>%</kbd></td><td>Append a percent sign</td></tr>
            <tr><td><kbd>.</kbd></td><td>Decimal point</td><td><kbd>sin</kbd> <kbd>ln</kbd> <kbd>sqrt</kbd></td><td>Type the name, then the argument in brackets</td></tr>
            <tr><td><kbd>+</kbd> <kbd>-</kbd> <kbd>*</kbd> <kbd>/</kbd></td><td>Operators; a committed result carries forward</td><td><kbd>Enter</kbd> or <kbd>=</kbd></td><td>Evaluate and push to history</td></tr>
            <tr><td><kbd>^</kbd></td><td>Power</td><td><kbd>Esc</kbd></td><td>All clear</td></tr>
            <tr><td><kbd>(</kbd> <kbd>)</kbd></td><td>Grouping</td><td><kbd>Backspace</kbd> / <kbd>Delete</kbd></td><td>Delete before / after the cursor</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="quotes-title">
    <div class="wrap">
      <header class="section-head" data-reveal>
        <div>
          <p class="kicker">Readers</p>
          <h2 id="quotes-title">Three people who needed the precedence to be right</h2>
        </div>
        <p class="section-note">Collected from a classroom demo in February 2026 and quoted with permission.</p>
      </header>
      <div class="quote-grid">
        <figure class="quote" data-reveal style="--delay:0ms">
          <span class="quote-mark" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M9 7H4.5v5H9c0 3.4-1.4 5.2-4 7M19 7h-4.5v5H19c0 3.4-1.4 5.2-4 7"/></svg></span>
          <blockquote><p>I teach this to second-years and the thing that finally lands is watching <code>2 ^ 3 ^ 2</code> come back as 512. Every phone calculator gets that one wrong.</p></blockquote>
          <figcaption>
            <strong>Dr Halina Wojtas</strong>
            <span>Numeracy lead, Colchester Sixth Form</span>
          </figcaption>
        </figure>
        <figure class="quote" data-reveal style="--delay:80ms">
          <span class="quote-mark" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M9 7H4.5v5H9c0 3.4-1.4 5.2-4 7M19 7h-4.5v5H19c0 3.4-1.4 5.2-4 7"/></svg></span>
          <blockquote><p>The memory register is what kept me. MR after a long chain of divisions saves retyping a twenty-digit intermediate, and it survives a reload.</p></blockquote>
          <figcaption>
            <strong>Tom&aacute;s Iglesias</strong>
            <span>Structural engineer, Valencia</span>
          </figcaption>
        </figure>
        <figure class="quote" data-reveal style="--delay:160ms">
          <span class="quote-mark" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M9 7H4.5v5H9c0 3.4-1.4 5.2-4 7M19 7h-4.5v5H19c0 3.4-1.4 5.2-4 7"/></svg></span>
          <blockquote><p>Division by zero saying &ldquo;cannot divide by zero&rdquo; rather than printing Infinity saved me from a very embarrassing quote. Genuinely useful error text.</p></blockquote>
          <figcaption>
            <strong>Nadia Farrow</strong>
            <span>Studio manager, Glasgow</span>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="section" id="faq" aria-labelledby="faq-title">
    <div class="wrap wrap-narrow">
      <header class="section-head" data-reveal>
        <div>
          <p class="kicker">Small print</p>
          <h2 id="faq-title">How the engine behaves</h2>
        </div>
        <p class="section-note">Everything here is observable &mdash; try each one on the pad.</p>
      </header>
      <div class="acc" id="faq-acc">
        <div class="acc-item">
          <h3><button class="acc-trigger" type="button" aria-expanded="false" aria-controls="faq-1"><span>Why is my history still there after a reload?</span><svg class="icon acc-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-chevron"></use></svg></button></h3>
          <div class="acc-panel" id="faq-1" hidden><p>The last thirty calculations are written to this browser&rsquo;s local storage, along with the memory register and your settings. Nothing leaves the tab. Clear the history from the History tab and the record is deleted on the spot.</p></div>
        </div>
        <div class="acc-item">
          <h3><button class="acc-trigger" type="button" aria-expanded="false" aria-controls="faq-2"><span>When does a result carry forward?</span><svg class="icon acc-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-chevron"></use></svg></button></h3>
          <div class="acc-panel" id="faq-2" hidden><p>Only a result you have just committed carries forward. Chain it and Slate evaluates the answer and keeps it on the pad, so <kbd>2</kbd> <kbd>=</kbd> <kbd>+</kbd> <kbd>4</kbd> <kbd>=</kbd> gives 9. Type an operator without committing first and nothing is collapsed, which is why <code>2 + 3 * 4</code> stays 14 rather than becoming 20.</p></div>
        </div>
        <div class="acc-item">
          <h3><button class="acc-trigger" type="button" aria-expanded="false" aria-controls="faq-3"><span>Does decimal precision change the arithmetic?</span><svg class="icon acc-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-chevron"></use></svg></button></h3>
          <div class="acc-panel" id="faq-3" hidden><p>No. Slate always computes in double precision and rounds exactly once, at the point of display. Precision changes how the answer is printed, which matters when you copy it somewhere that will round it again. Set it to six decimals before you check a coursework answer.</p></div>
        </div>
        <div class="acc-item">
          <h3><button class="acc-trigger" type="button" aria-expanded="false" aria-controls="faq-4"><span>Why is the percent key context sensitive?</span><svg class="icon acc-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-chevron"></use></svg></button></h3>
          <div class="acc-panel" id="faq-4" hidden><p>Because that is how a desk calculator behaves. On its own, <code>10%</code> means a tenth. To the right of <code>+</code> or <code>-</code> it means a share of the number on the left, so <code>200 + 10%</code> is 220. Inside brackets, or after <code>*</code> and <code>/</code>, it reverts to a plain division by a hundred.</p></div>
        </div>
        <div class="acc-item">
          <h3><button class="acc-trigger" type="button" aria-expanded="false" aria-controls="faq-5"><span>How large can the numbers get?</span><svg class="icon acc-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-chevron"></use></svg></button></h3>
          <div class="acc-panel" id="faq-5" hidden><p>Anything up to 1e15 renders in full. Past that the display would be almost entirely zeroes, so Slate refuses and says the result is too large to display. Past 1e308 the arithmetic itself gives up, and you get a not-a-finite-number message instead.</p></div>
        </div>
      </div>
    </div>
  </section>

  <section class="cta-band" aria-labelledby="cta-title">
    <div class="wrap cta-inner" data-reveal>
      <div>
        <h2 id="cta-title">Release notes, six times a year.</h2>
        <p>Parser changes, new functions, and the occasional rounding bug post-mortem. No product news, because there is no product.</p>
      </div>
      <form class="cta-form" id="cta-form" novalidate>
        <label class="sr-only" for="cta-email">Email address</label>
        <input class="input" id="cta-email" type="email" placeholder="you@example.com" autocomplete="email" aria-describedby="cta-msg">
        <button class="btn btn-primary" type="submit">Subscribe</button>
      </form>
      <p class="form-msg" id="cta-msg" role="status" aria-live="polite"></p>
    </div>
  </section>
</main>

<footer class="site-footer" id="footer-contact">
  <div class="wrap footer-top">
    <div class="footer-brand">
      <a class="brand" href="#top" aria-label="Slate, back to top">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none" focusable="false"><rect x="3" y="2.6" width="26" height="26.8" rx="6" stroke="currentColor" stroke-width="1.7"/><path d="M9 20.4 12 12l3 8.4 3-8.4 3 8.4" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <span class="brand-text">Slate</span>
      </a>
      <p>A calculator with a parser, a parser with a calculator. Everything runs in the tab you are reading this in.</p>
      <ul class="socials" role="list">
        <li><a class="icon-btn" href="#footer-contact" aria-label="Slate on the web"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-globe"></use></svg></a></li>
        <li><a class="icon-btn" href="#footer-contact" aria-label="Slate on Instagram"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-instagram"></use></svg></a></li>
        <li><a class="icon-btn" href="#footer-contact" aria-label="Slate on LinkedIn"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-linkedin"></use></svg></a></li>
        <li><a class="icon-btn" href="#footer-contact" aria-label="Email the author"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-mail"></use></svg></a></li>
      </ul>
    </div>

    <nav class="footer-col" aria-labelledby="fc-tool">
      <h2 class="footer-h" id="fc-tool">The tool</h2>
      <ul role="list">
        <li><a href="#workspace">Calculator pad</a></li>
        <li><a href="#presets">Quick conversions</a></li>
        <li><a href="#shortcuts">Keyboard shortcuts</a></li>
        <li><a href="#engine">How the parser works</a></li>
      </ul>
    </nav>

    <nav class="footer-col" aria-labelledby="fc-grammar">
      <h2 class="footer-h" id="fc-grammar">Grammar</h2>
      <ul role="list">
        <li><a href="#presets">Operator precedence</a></li>
        <li><a href="#presets">Percent behaviour</a></li>
        <li><a href="#presets">Functions and constants</a></li>
        <li><a href="#faq">Error handling</a></li>
      </ul>
    </nav>

    <nav class="footer-col" aria-labelledby="fc-project">
      <h2 class="footer-h" id="fc-project">Project</h2>
      <ul role="list">
        <li><a href="#faq">Changelog</a></li>
        <li><a href="#faq">Known limits</a></li>
        <li><a href="#faq">Accessibility notes</a></li>
        <li><a href="#footer-contact">Contribute</a></li>
      </ul>
    </nav>

    <div class="footer-col footer-contact">
      <h2 class="footer-h" id="fc-contact">Contact</h2>
      <ul role="list">
        <li><a href="#footer-contact">hello@slate-calculator.example</a></li>
        <li>Built in Bristol, United Kingdom</li>
        <li>Release 2.4.0 &middot; 12 September 2026</li>
      </ul>
      <form class="footer-signup" id="footer-form" novalidate>
        <label class="sr-only" for="footer-email">Email address for release notes</label>
        <input class="input input-sm" id="footer-email" type="email" placeholder="you@example.com" autocomplete="email" aria-describedby="footer-msg">
        <button class="btn btn-quiet btn-sm" type="submit">Join</button>
      </form>
      <p class="form-msg" id="footer-msg" role="status" aria-live="polite"></p>
    </div>
  </div>

  <div class="wrap footer-bottom">
    <p>&copy; <span id="year">2026</span> Slate. Built as a demonstration: the arithmetic is real, the market is not.</p>
    <ul class="legal" role="list">
      <li><a href="#footer-contact">Privacy</a></li>
      <li><a href="#footer-contact">Terms</a></li>
      <li><a href="#footer-contact">Accessibility</a></li>
      <li><a href="#footer-contact">Source</a></li>
    </ul>
  </div>
</footer>

<button class="to-top" type="button" id="to-top" hidden aria-label="Back to top">
  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-arrow-up"></use></svg>
</button>
`,

  css: `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; padding: 0; }

/* Components below set an explicit display, which would beat the user-agent
   rule for [hidden]. Restore it with priority. */
[hidden] { display: none !important; }

:root {
  --color-canvas: #f1f2f6;
  --color-surface: #ffffff;
  --color-surface-2: #f7f8fa;
  --color-ink: #14181f;
  --color-ink-soft: #39414e;
  --color-muted: #58616e;
  --color-line: #e3e6ec;
  --color-line-strong: #ccd2db;
  --color-accent: #5b21b6;
  --color-accent-strong: #451a97;
  --color-accent-soft: #eee8fb;
  --color-accent-ink: #3b1478;
  --color-on-accent: #ffffff;
  --color-ok: #1c6c45;
  --color-bad: #b0341f;

  --color-panel: #191e27;
  --color-panel-2: #212836;
  --color-panel-3: #2b3345;
  --color-panel-ink: #e9edf4;
  --color-panel-muted: #a2aec2;
  --color-panel-line: #343d4f;
  --color-panel-accent: #c9b6f8;
  --color-key-op: #5b21b6;
  --color-key-eq: #14784a;
  --color-panel-bad: #f3aca1;
  --color-panel-good: #79d9a8;

  --space-1: .25rem;
  --space-2: .5rem;
  --space-3: .75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 2.75rem;
  --space-8: 4rem;
  --space-9: 5.5rem;

  --radius-xs: .35rem;
  --radius-sm: .6rem;
  --radius-md: .95rem;
  --radius-lg: 1.45rem;
  --radius-pill: 999px;

  --shadow-1: 0 1px 2px rgba(20,24,31,.06), 0 1px 3px rgba(20,24,31,.05);
  --shadow-2: 0 2px 4px rgba(20,24,31,.05), 0 8px 18px rgba(20,24,31,.07);
  --shadow-3: 0 4px 8px rgba(20,24,31,.06), 0 18px 40px rgba(20,24,31,.10);
  --shadow-4: 0 24px 56px rgba(20,24,31,.20), 0 6px 16px rgba(20,24,31,.12);

  --font-display: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
  --font-text: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;

  --wrap: 1180px;
  --wrap-narrow: 820px;
  --dur-1: 130ms;
  --dur-2: 240ms;
  --dur-3: 420ms;
  --ease: cubic-bezier(.32, .72, .28, 1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-canvas: #0a0c11;
    --color-surface: #12161d;
    --color-surface-2: #171c25;
    --color-ink: #eaeef4;
    --color-ink-soft: #c2cbd8;
    --color-muted: #9ba6b6;
    --color-line: #232a35;
    --color-line-strong: #333c4a;
    --color-accent: #a78bfa;
    --color-accent-strong: #c6b3ff;
    --color-accent-soft: #1e1636;
    --color-accent-ink: #ddd2ff;
    --color-on-accent: #120a24;
    --color-ok: #5cc38c;
    --color-bad: #ef8d7e;

    --color-panel: #0d1017;
    --color-panel-2: #141924;
    --color-panel-3: #1d2432;
    --color-panel-ink: #e7ecf4;
    --color-panel-muted: #9aa6ba;
    --color-panel-line: #272f3d;
    --color-panel-accent: #c9b6f8;
    --color-key-op: #7c53e0;
    --color-key-eq: #1c9257;
    --color-panel-bad: #f3aca1;
    --color-panel-good: #79d9a8;

    --shadow-1: 0 1px 2px rgba(0,0,0,.5);
    --shadow-2: 0 2px 6px rgba(0,0,0,.45), 0 10px 22px rgba(0,0,0,.34);
    --shadow-3: 0 6px 14px rgba(0,0,0,.5), 0 20px 44px rgba(0,0,0,.42);
    --shadow-4: 0 28px 64px rgba(0,0,0,.6), 0 8px 20px rgba(0,0,0,.5);
  }
}

html { -webkit-text-size-adjust: 100%; }

body {
  margin: 0;
  padding: 0;
  background: var(--color-canvas);
  color: var(--color-ink);
  font-family: var(--font-text);
  font-size: 16px;
  line-height: 1.62;
  overflow-x: hidden;
}

h1, h2, h3 { font-family: var(--font-display); font-weight: 600; line-height: 1.14; letter-spacing: -.02em; }
h1 { font-size: clamp(2.05rem, 5.2vw, 3.8rem); }
h2 { font-size: clamp(1.6rem, 3vw, 2.4rem); }
h3 { font-size: clamp(1.02rem, 1.4vw, 1.22rem); }
p { text-wrap: pretty; }
svg { display: block; }
a { color: inherit; }
ul, ol, dl { list-style: none; }
code { font-family: var(--font-mono); font-size: .88em; }
.sprite { position: absolute; width: 0; height: 0; overflow: hidden; }

.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}

.skip-link {
  position: fixed; top: var(--space-3); left: var(--space-3); z-index: 2000;
  transform: translateY(-180%);
  background: var(--color-accent); color: var(--color-on-accent);
  padding: var(--space-3) var(--space-5); border-radius: var(--radius-sm);
  font-weight: 600; text-decoration: none; box-shadow: var(--shadow-3);
  transition: transform var(--dur-2) var(--ease);
}
.skip-link:focus { transform: translateY(0); }

:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: var(--radius-xs);
}

.wrap { width: 100%; max-width: var(--wrap); margin-inline: auto; padding-inline: clamp(1rem, 4vw, 2.5rem); }
.wrap-narrow { max-width: var(--wrap-narrow); }
:where(section, main > span, footer, header)[id] { scroll-margin-top: 84px; }

.kicker {
  display: inline-flex; align-items: center; gap: var(--space-2);
  font-size: .78rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  color: var(--color-accent); margin-bottom: var(--space-3);
}
.kicker .icon { width: 1em; height: 1em; }
.lede { font-size: clamp(1rem, 1.35vw, 1.12rem); color: var(--color-muted); max-width: 58ch; margin-top: var(--space-4); }
.lede code { padding: .08em .34em; border-radius: var(--radius-xs); background: var(--color-accent-soft); color: var(--color-accent-ink); }

.section { padding-block: clamp(2.6rem, 6vw, 4.75rem); }
.section-band { background: var(--color-surface); border-block: 1px solid var(--color-line); }
.section-head { margin-bottom: clamp(1.4rem, 2.8vw, 2.3rem); max-width: 70ch; }
.section-head-row { display: flex; flex-wrap: wrap; gap: var(--space-4); align-items: flex-end; justify-content: space-between; }
.section-note { color: var(--color-muted); font-size: .95rem; max-width: 46ch; }

/* ------------------------------ buttons ------------------------------ */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: .45rem;
  padding: .72rem 1.28rem;
  border: 1px solid transparent; border-radius: var(--radius-sm);
  font: inherit; font-size: .93rem; font-weight: 600;
  text-decoration: none; cursor: pointer;
  transition: transform var(--dur-1) var(--ease), background var(--dur-2) var(--ease),
              border-color var(--dur-2) var(--ease), color var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease);
}
.btn .icon { width: 1.05em; height: 1.05em; }
.btn:active { transform: translateY(1px) scale(.985); }
.btn-sm { padding: .48rem .82rem; font-size: .85rem; }
.btn-primary { background: var(--color-accent); color: var(--color-on-accent); box-shadow: var(--shadow-1); }
.btn-primary:hover { background: var(--color-accent-strong); box-shadow: var(--shadow-2); transform: translateY(-1px); }
.btn-ghost { background: var(--color-surface); color: var(--color-ink); border-color: var(--color-line-strong); }
.btn-ghost:hover { border-color: var(--color-accent); color: var(--color-accent); background: var(--color-accent-soft); }
.btn-quiet { background: transparent; color: var(--color-muted); border-color: var(--color-line); }
.btn-quiet:hover { color: var(--color-accent); border-color: var(--color-accent); background: var(--color-accent-soft); }

.icon-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; padding: 0;
  background: transparent; color: var(--color-ink-soft);
  border: 1px solid var(--color-line); border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--dur-2) var(--ease), color var(--dur-2) var(--ease),
              border-color var(--dur-2) var(--ease), transform var(--dur-1) var(--ease);
}
.icon-btn .icon { width: 20px; height: 20px; }
.icon-btn:hover { color: var(--color-accent); border-color: var(--color-accent); background: var(--color-accent-soft); }
.icon-btn:active { transform: scale(.94); }

.input {
  width: 100%; min-width: 0; padding: .72rem .9rem;
  font: inherit; font-size: .94rem; color: var(--color-ink);
  background: var(--color-surface); border: 1px solid var(--color-line-strong); border-radius: var(--radius-sm);
  transition: border-color var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease);
}
.input::placeholder { color: var(--color-muted); opacity: .8; }
.input:focus { outline: none; border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-soft); }
.input[aria-invalid='true'] { border-color: var(--color-bad); }
.input-sm { padding: .5rem .7rem; font-size: .85rem; }
.form-msg { font-size: .82rem; color: var(--color-muted); min-height: 1.15rem; }
.form-msg.is-ok { color: var(--color-ok); }
.form-msg.is-bad { color: var(--color-bad); }

kbd {
  display: inline-block; padding: .12em .42em;
  font-family: var(--font-mono); font-size: .82em; line-height: 1.5;
  color: var(--color-ink-soft); background: var(--color-surface-2);
  border: 1px solid var(--color-line-strong); border-bottom-width: 2px; border-radius: var(--radius-xs);
}

/* ---------------------------- promo strip ---------------------------- */
.promo-strip {
  background: var(--color-accent-ink); color: #e6dcff;
  text-align: center; padding: .5rem 1rem; font-size: .8rem;
}
@media (prefers-color-scheme: dark) { .promo-strip { background: var(--color-accent-soft); color: var(--color-accent-ink); } }

/* ------------------------------ header ------------------------------ */
.site-header {
  position: sticky; top: 0; z-index: 900;
  background: color-mix(in srgb, var(--color-surface) 90%, transparent);
  backdrop-filter: blur(14px) saturate(1.4);
  border-bottom: 1px solid var(--color-line);
  transition: box-shadow var(--dur-2) var(--ease);
}
.site-header.is-scrolled { box-shadow: var(--shadow-2); }
.header-inner { display: flex; align-items: center; gap: clamp(.75rem, 2vw, 1.6rem); min-height: 66px; }

.brand { display: inline-flex; align-items: center; gap: .55rem; text-decoration: none; flex: none; }
.brand-mark { width: 31px; height: 31px; color: var(--color-accent); }
.brand-mark svg { width: 100%; height: 100%; }
.brand-text { font-family: var(--font-display); font-size: 1.18rem; font-weight: 700; letter-spacing: -.03em; }

.nav { display: none; gap: var(--space-1); }
.nav-link {
  position: relative; padding: .45rem .68rem; border-radius: var(--radius-xs);
  font-size: .9rem; font-weight: 500; color: var(--color-ink-soft); text-decoration: none;
  transition: color var(--dur-2) var(--ease);
}
.nav-link::after {
  content: ''; position: absolute; left: .68rem; right: .68rem; bottom: .28rem; height: 2px;
  background: var(--color-accent); border-radius: 2px;
  transform: scaleX(0); transform-origin: left; transition: transform var(--dur-2) var(--ease);
}
.nav-link:hover { color: var(--color-accent); }
.nav-link:hover::after, .nav-link:focus-visible::after { transform: scaleX(1); }

.header-actions { display: flex; align-items: center; gap: var(--space-2); margin-left: auto; }
.header-actions > .btn-quiet span { display: none; }
.nav-toggle { display: inline-flex; }

.mobile-nav {
  display: flex; flex-direction: column; gap: var(--space-1);
  padding: var(--space-3) clamp(1rem, 4vw, 2.5rem) var(--space-5);
  border-top: 1px solid var(--color-line); background: var(--color-surface);
  animation: slideDown var(--dur-2) var(--ease);
}
.mobile-link {
  padding: .7rem .5rem; border-bottom: 1px solid var(--color-line);
  font-size: .95rem; font-weight: 500; text-decoration: none; color: var(--color-ink-soft);
}
.mobile-link:hover { color: var(--color-accent); }
.mobile-nav .btn { margin-top: var(--space-3); justify-content: flex-start; }

/* ------------------------------ hero -------------------------------- */
.hero {
  position: relative; overflow: hidden;
  padding-block: clamp(2.6rem, 6vw, 4.75rem);
  background:
    radial-gradient(80rem 38rem at 10% -14%, var(--color-accent-soft), transparent 60%),
    radial-gradient(56rem 30rem at 98% 6%, color-mix(in srgb, var(--color-accent) 11%, transparent), transparent 58%);
}
.hero-inner { display: grid; gap: clamp(1.75rem, 4vw, 3rem); }
.hero-copy { max-width: 62ch; }
.hero-actions { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-top: var(--space-5); }
.hero-actions .btn { padding: .86rem 1.5rem; font-size: 1rem; }
.hero-stats {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(132px, 1fr)); gap: var(--space-4);
  margin-top: clamp(1.75rem, 4vw, 2.6rem); padding-top: var(--space-5);
  border-top: 1px solid var(--color-line);
}
.hero-stats li { display: flex; flex-direction: column; }
.hero-stats strong { font-family: var(--font-display); font-size: clamp(1.5rem, 2.5vw, 2rem); font-weight: 700; letter-spacing: -.03em; color: var(--color-accent-ink); }
.hero-stats span { font-size: .82rem; color: var(--color-muted); }

.hero-panel {
  align-self: center;
  background: var(--color-panel); color: var(--color-panel-ink);
  border-radius: var(--radius-lg); padding: var(--space-5);
  box-shadow: var(--shadow-4);
}
.panel-title { font-family: var(--font-display); font-size: .78rem; font-weight: 700; letter-spacing: .11em; text-transform: uppercase; color: var(--color-panel-muted); }
.panel-eq { margin-top: var(--space-4); }
.panel-eq code {
  font-size: clamp(1.4rem, 2.8vw, 1.9rem); font-weight: 600; letter-spacing: -.02em;
  padding: .12em .3em; border-radius: var(--radius-xs);
  background: var(--color-panel-3); color: var(--color-panel-ink);
}
.panel-note { margin-top: var(--space-3); font-size: .88rem; color: var(--color-panel-muted); }
.panel-note strong { color: var(--color-panel-bad); }
.panel-note code { padding: .05em .3em; border-radius: var(--radius-xs); background: var(--color-panel-3); color: var(--color-panel-ink); }
.panel-bars { display: flex; flex-direction: column; gap: .55rem; margin-top: var(--space-5); }
.panel-bar { display: grid; grid-template-columns: 6.4rem 1fr 3.4rem; gap: .6rem; align-items: center; font-size: .82rem; color: var(--color-panel-muted); }
.panel-bar i { display: block; height: 7px; border-radius: var(--radius-pill); background: linear-gradient(90deg, #7c4a3e, #b8574a); width: var(--w); }
.panel-bar.is-good i { background: linear-gradient(90deg, #1c6c45, #35b47c); }
.panel-bar output { font-family: var(--font-mono); font-size: .88rem; font-weight: 600; text-align: right; color: var(--color-panel-ink); }
.panel-list { display: flex; flex-direction: column; margin-top: var(--space-5); border-top: 1px solid var(--color-panel-line); }
.panel-list li { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); padding: .55rem 0; border-bottom: 1px solid var(--color-panel-line); }
.panel-list li:last-child { border-bottom: 0; }
.panel-list code { font-size: .88rem; color: var(--color-panel-ink); }
.panel-list span { font-family: var(--font-mono); font-size: .88rem; font-weight: 600; color: var(--color-panel-good); }

/* ---------------------------- workspace ----------------------------- */
.workspace-section { padding-top: clamp(1.75rem, 3.5vw, 2.75rem); }
.workspace { display: grid; gap: clamp(1.25rem, 2.5vw, 1.75rem); align-items: start; }

.calc {
  background: var(--color-panel);
  border: 1px solid var(--color-panel-line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-4);
  overflow: hidden;
}
.calc-top {
  display: flex; align-items: center; justify-content: space-between; gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-panel-line);
}
.calc-chips { display: flex; flex-wrap: wrap; gap: .35rem; }
.chip {
  display: inline-flex; align-items: center;
  padding: .16rem .5rem; border-radius: var(--radius-xs);
  font-family: var(--font-mono); font-size: .72rem; font-weight: 600; letter-spacing: .04em;
  color: var(--color-panel-muted); background: var(--color-panel-2);
  border: 1px solid var(--color-panel-line);
}
.chip-mode { color: var(--color-panel-accent); border-color: #4c3a79; }
.chip-mem { transition: color var(--dur-2) var(--ease), background var(--dur-2) var(--ease), border-color var(--dur-2) var(--ease); }
.chip-mem.is-on { color: #06231a; background: #45c98a; border-color: #45c98a; }
.chip-mem.just-set { animation: memPulse 620ms var(--ease); }
.calc-brand { font-family: var(--font-display); font-size: .76rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--color-panel-muted); }

.display {
  padding: var(--space-5) var(--space-4) var(--space-4);
  text-align: right;
  background: linear-gradient(180deg, var(--color-panel-2), var(--color-panel));
  border-bottom: 1px solid var(--color-panel-line);
}
.display:focus-visible { outline: 3px solid var(--color-panel-accent); outline-offset: -4px; }
.disp-expr {
  min-height: 1.45rem;
  font-family: var(--font-mono); font-size: clamp(.84rem, 1.5vw, .98rem);
  color: var(--color-panel-muted);
  word-break: break-all; white-space: pre-wrap;
}
.caret {
  display: inline-block; width: 2px; height: 1.02em;
  vertical-align: -.16em; margin: 0 1px;
  background: var(--color-panel-good);
  animation: caretBlink 1.2s steps(1, end) infinite;
}
.disp-tail {
  min-height: 1.3rem; margin-top: .1rem;
  font-family: var(--font-mono); font-size: clamp(1rem, 2vw, 1.22rem);
  color: var(--color-panel-accent); word-break: break-all;
}
.disp-value {
  display: block;
  font-family: var(--font-mono); font-size: clamp(2rem, 6.2vw, 3.2rem); font-weight: 600;
  letter-spacing: -.035em; color: var(--color-panel-ink);
  word-break: break-all; line-height: 1.14;
}
.disp-value.is-flash { animation: flash 480ms var(--ease); }
.disp-value.is-error { color: var(--color-panel-bad); }
.disp-hint { min-height: 1.15rem; margin-top: var(--space-2); font-size: .8rem; color: var(--color-panel-muted); }
.disp-hint.is-error { color: var(--color-panel-bad); }
.disp-hint.is-ok { color: var(--color-panel-good); }

.settings { padding: var(--space-4); background: var(--color-panel-2); border-bottom: 1px solid var(--color-panel-line); animation: tabIn var(--dur-3) var(--ease) both; }
.settings-head { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); margin-bottom: var(--space-4); }
.settings-title { font-family: var(--font-display); font-size: .95rem; font-weight: 600; color: var(--color-panel-ink); }
.settings-head .icon-btn { color: var(--color-panel-muted); border-color: var(--color-panel-line); }
.settings-head .icon-btn:hover { color: var(--color-panel-ink); border-color: var(--color-panel-accent); background: var(--color-panel-3); }
.settings-grid { display: grid; gap: var(--space-4); grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
.setting { display: flex; flex-direction: column; gap: .45rem; min-width: 0; }
.setting-label { font-size: .74rem; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--color-panel-muted); }
.switch-group { display: inline-flex; gap: 2px; padding: 3px; border-radius: var(--radius-sm); background: var(--color-panel-3); border: 1px solid var(--color-panel-line); width: fit-content; }
.switch-btn {
  padding: .32rem .8rem; border: 0; border-radius: calc(var(--radius-sm) - .1rem);
  background: transparent; color: var(--color-panel-muted);
  font-family: var(--font-mono); font-size: .82rem; font-weight: 600; cursor: pointer;
  transition: background var(--dur-2) var(--ease), color var(--dur-2) var(--ease);
}
.switch-btn:hover { color: var(--color-panel-ink); }
.switch-btn[aria-pressed='true'] { background: var(--color-key-op); color: #fff; }
.select-dark {
  padding: .44rem .6rem; border-radius: var(--radius-sm);
  font: inherit; font-size: .88rem; cursor: pointer;
  color: var(--color-panel-ink); background: var(--color-panel-3);
  border: 1px solid var(--color-panel-line);
}
.select-dark:focus { outline: none; border-color: var(--color-panel-accent); box-shadow: 0 0 0 3px rgba(201,182,248,.25); }
.setting-wide { grid-column: 1 / -1; flex-direction: row; align-items: center; justify-content: space-between; gap: var(--space-3); }
.toggle {
  display: inline-flex; align-items: center; gap: .55rem; cursor: pointer;
  background: transparent; border: 0; padding: 0; color: var(--color-panel-ink);
  font: inherit; font-size: .85rem; font-weight: 600;
}
.toggle-track {
  position: relative; width: 44px; height: 25px; border-radius: var(--radius-pill);
  background: var(--color-panel-3); border: 1px solid var(--color-panel-line);
  transition: background var(--dur-2) var(--ease), border-color var(--dur-2) var(--ease);
}
.toggle-knob {
  position: absolute; top: 2px; left: 2px; width: 19px; height: 19px; border-radius: 50%;
  background: var(--color-panel-muted);
  transition: transform var(--dur-2) var(--ease), background var(--dur-2) var(--ease);
}
.toggle[aria-checked='true'] .toggle-track { background: var(--color-key-op); border-color: var(--color-key-op); }
.toggle[aria-checked='true'] .toggle-knob { transform: translateX(19px); background: #fff; }
.settings-note { margin-top: var(--space-4); font-size: .78rem; color: var(--color-panel-muted); }

.keyrow { display: grid; gap: 6px; padding: var(--space-3) var(--space-4) 0; }
.keyrow-mem { grid-template-columns: repeat(5, 1fr); }
.keyrow-sci { grid-template-columns: repeat(5, 1fr); }
.keyrow-edit { padding-bottom: 0; }

.pad { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; padding: var(--space-3) var(--space-4) var(--space-4); }
.key {
  position: relative; min-height: 52px; padding: .35rem .15rem;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-size: 1.1rem; font-weight: 600; line-height: 1.1;
  color: var(--color-panel-ink); background: var(--color-panel-3);
  border: 1px solid var(--color-panel-line); border-radius: var(--radius-sm);
  cursor: pointer; user-select: none;
  transition: transform var(--dur-1) var(--ease), background var(--dur-2) var(--ease), filter var(--dur-1) var(--ease);
}
.key:hover { background: #354055; }
.key:active, .key.is-hit { transform: translateY(1px) scale(.96); filter: brightness(1.25); }
.key .icon { width: 17px; height: 17px; }
.key-mem, .key-sci { min-height: 42px; font-size: .84rem; font-family: var(--font-mono); color: var(--color-panel-accent); background: var(--color-panel-2); }
.key-sci:hover { background: var(--color-panel-3); color: #e6dcff; }
.key-num { font-family: var(--font-mono); font-size: 1.22rem; }
.key-util { font-family: var(--font-mono); font-size: 1rem; color: var(--color-panel-accent); background: var(--color-panel-2); }
.key-op { color: #fff; background: var(--color-key-op); border-color: transparent; }
.key-op:hover { background: #6d43cf; }
.key-eq { color: #fff; background: var(--color-key-eq); border-color: transparent; }
.key-eq:hover { background: #1c9257; }
.calc-foot { padding: var(--space-3) var(--space-4) var(--space-4); font-size: .76rem; color: var(--color-panel-muted); }
.calc-foot code { padding: .04em .3em; border-radius: var(--radius-xs); background: var(--color-panel-3); color: var(--color-panel-ink); }

/* ------------------------------- rail ------------------------------- */
.rail { display: flex; flex-direction: column; min-width: 0; }
.rail-head { margin-bottom: var(--space-3); }
.tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 4px; border-radius: var(--radius-md); background: var(--color-surface-2); border: 1px solid var(--color-line); }
.tab {
  display: inline-flex; align-items: center; justify-content: center; gap: .35rem;
  padding: .5rem .3rem; border: 0; border-radius: var(--radius-sm);
  background: transparent; color: var(--color-muted);
  font: inherit; font-size: .84rem; font-weight: 600; cursor: pointer;
  transition: background var(--dur-2) var(--ease), color var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease);
}
.tab .icon { width: 15px; height: 15px; }
.tab:hover { color: var(--color-ink); }
.tab.is-active { background: var(--color-surface); color: var(--color-accent); box-shadow: var(--shadow-1); }

.panel { padding: var(--space-4); background: var(--color-surface); border: 1px solid var(--color-line); border-radius: var(--radius-md); animation: tabIn var(--dur-3) var(--ease) both; }
.panel-tools { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); margin-bottom: var(--space-3); }
.panel-note-sm { font-size: .8rem; color: var(--color-muted); }
.panel-note-gap { margin-top: var(--space-4); margin-bottom: var(--space-2); }
.empty-note { font-size: .86rem; color: var(--color-muted); padding: var(--space-5) .5rem; text-align: center; }

.hist-list { display: flex; flex-direction: column; gap: .4rem; max-height: 340px; overflow-y: auto; scrollbar-width: thin; }
.hist {
  display: grid; grid-template-columns: 1fr auto; align-items: center; gap: .5rem;
  padding: .5rem .6rem; border-radius: var(--radius-sm);
  background: var(--color-surface-2); border: 1px solid var(--color-line);
  animation: fadeUp var(--dur-2) var(--ease) both;
  animation-delay: var(--delay, 0ms);
  transition: border-color var(--dur-2) var(--ease), background var(--dur-2) var(--ease);
}
.hist:hover { border-color: var(--color-accent); background: var(--color-accent-soft); }
.hist-main { min-width: 0; display: flex; flex-direction: column; gap: .1rem; text-align: left; padding: 0; border: 0; background: transparent; cursor: pointer; font: inherit; color: inherit; }
.hist-expr { font-family: var(--font-mono); font-size: .76rem; color: var(--color-muted); word-break: break-all; }
.hist-result { font-family: var(--font-mono); font-size: 1.02rem; font-weight: 600; color: var(--color-ink); word-break: break-all; }
.hist-copy { width: 30px; height: 30px; flex: none; border-radius: var(--radius-xs); color: var(--color-muted); }
.hist-copy .icon { width: 14px; height: 14px; }
.hist-copy:hover { color: var(--color-accent); }

.conv-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: var(--space-2); margin-top: var(--space-3); }
.conv { display: flex; flex-direction: column; gap: .35rem; padding: .6rem .7rem; border-radius: var(--radius-sm); background: var(--color-surface-2); border: 1px solid var(--color-line); }
.conv-label { font-size: .78rem; font-weight: 600; color: var(--color-ink-soft); }
.conv-row { display: flex; align-items: center; gap: .4rem; }
.conv input {
  width: 100%; min-width: 0; padding: .3rem .5rem;
  font-family: var(--font-mono); font-size: .88rem; color: var(--color-ink);
  background: var(--color-surface); border: 1px solid var(--color-line-strong); border-radius: var(--radius-xs);
}
.conv input:focus { outline: none; border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-soft); }
.conv-unit { font-family: var(--font-mono); font-size: .76rem; color: var(--color-muted); flex: none; }
.conv-out { font-family: var(--font-mono); font-size: .9rem; font-weight: 600; color: var(--color-accent); word-break: break-all; }

.recipe-list { display: flex; flex-direction: column; gap: .4rem; }
.recipe {
  display: grid; grid-template-columns: 1fr auto; align-items: center; gap: .6rem;
  width: 100%; padding: .55rem .6rem; border-radius: var(--radius-sm);
  background: var(--color-surface-2); border: 1px solid var(--color-line);
  cursor: pointer; font: inherit; color: inherit; text-align: left;
  transition: border-color var(--dur-2) var(--ease), background var(--dur-2) var(--ease);
}
.recipe:hover { border-color: var(--color-accent); background: var(--color-accent-soft); }
.recipe-label { display: block; font-size: .82rem; font-weight: 600; }
.recipe-expr { display: block; font-family: var(--font-mono); font-size: .72rem; color: var(--color-muted); word-break: break-all; }
.recipe-out { font-family: var(--font-mono); font-size: .95rem; font-weight: 600; color: var(--color-accent); white-space: nowrap; text-align: right; }
.recipe-out small { display: block; font-size: .68rem; font-weight: 500; color: var(--color-muted); }

.ref-list { display: flex; flex-direction: column; gap: .35rem; margin-top: var(--space-3); }
.ref { display: grid; grid-template-columns: 3.2rem 1fr auto; align-items: center; gap: .6rem; padding: .5rem .6rem; border-radius: var(--radius-sm); background: var(--color-surface-2); border: 1px solid var(--color-line); }
.ref-rank { font-family: var(--font-mono); font-size: .72rem; font-weight: 600; color: var(--color-accent); }
.ref-expr { font-family: var(--font-mono); font-size: .84rem; color: var(--color-ink); word-break: break-all; }
.ref-out { font-family: var(--font-mono); font-size: .86rem; font-weight: 600; color: var(--color-accent-ink); white-space: nowrap; }
.fn-list { display: flex; flex-direction: column; gap: .1rem; }
.fn-list > div { display: grid; grid-template-columns: 7rem 1fr; gap: .6rem; padding: .4rem 0; border-bottom: 1px solid var(--color-line); }
.fn-list > div:last-child { border-bottom: 0; }
.fn-list dt { font-family: var(--font-mono); font-size: .82rem; font-weight: 600; color: var(--color-ink); }
.fn-list dd { font-size: .82rem; color: var(--color-muted); }

/* ------------------------- feature / use cards ---------------------- */
.feature-grid, .use-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 262px), 1fr)); gap: var(--space-4); }
.feature, .use {
  padding: var(--space-5); border-radius: var(--radius-md);
  background: var(--color-surface-2); border: 1px solid var(--color-line);
  transition: transform var(--dur-2) var(--ease), border-color var(--dur-2) var(--ease), background var(--dur-2) var(--ease);
}
.feature:hover, .use:hover { transform: translateY(-3px); border-color: var(--color-accent); background: var(--color-surface); }
.feature-icon, .use-icon {
  display: inline-grid; place-items: center; width: 42px; height: 42px; margin-bottom: var(--space-3);
  border-radius: var(--radius-sm); background: var(--color-accent-soft); color: var(--color-accent-ink);
}
.feature-icon .icon, .use-icon .icon { width: 21px; height: 21px; transition: transform var(--dur-2) var(--ease); }
.feature:hover .feature-icon .icon, .use:hover .use-icon .icon { transform: scale(1.12); }
.feature h3, .use h3 { margin-bottom: var(--space-2); }
.feature p, .use p { font-size: .9rem; color: var(--color-muted); }
.feature code { padding: .04em .28em; border-radius: var(--radius-xs); background: var(--color-accent-soft); color: var(--color-accent-ink); }

/* ---------------------------- shortcuts ----------------------------- */
.shortcut-wrap { overflow-x: auto; border: 1px solid var(--color-line); border-radius: var(--radius-md); background: var(--color-surface); box-shadow: var(--shadow-1); }
.shortcut-table { width: 100%; border-collapse: collapse; font-size: .9rem; min-width: 520px; }
.shortcut-table th, .shortcut-table td { text-align: left; padding: .8rem var(--space-4); border-bottom: 1px solid var(--color-line); vertical-align: top; }
.shortcut-table thead th { font-size: .74rem; letter-spacing: .08em; text-transform: uppercase; color: var(--color-muted); background: var(--color-surface-2); }
.shortcut-table tbody tr:last-child td { border-bottom: 0; }
.shortcut-table tbody tr:hover td { background: var(--color-surface-2); }
.shortcut-table td:first-child { white-space: nowrap; }
.shortcut-table td:nth-child(3) { white-space: nowrap; }

/* --------------------------- testimonials --------------------------- */
.quote-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 285px), 1fr)); gap: var(--space-4); }
.quote {
  position: relative; display: flex; flex-direction: column; gap: var(--space-4);
  padding: var(--space-6) var(--space-5) var(--space-5);
  background: var(--color-surface-2); border: 1px solid var(--color-line); border-radius: var(--radius-md);
}
.quote-mark { position: absolute; top: var(--space-4); right: var(--space-5); color: var(--color-accent); opacity: .3; }
.quote-mark .icon { width: 30px; height: 30px; }
.quote blockquote p { font-size: .97rem; color: var(--color-ink-soft); }
.quote blockquote code { padding: .04em .28em; border-radius: var(--radius-xs); background: var(--color-accent-soft); color: var(--color-accent-ink); }
.quote figcaption { display: flex; flex-direction: column; margin-top: auto; padding-top: var(--space-4); border-top: 1px solid var(--color-line); }
.quote figcaption strong { font-size: .92rem; }
.quote figcaption span { font-size: .78rem; color: var(--color-muted); }

/* ------------------------------ FAQ -------------------------------- */
.acc { border-top: 1px solid var(--color-line); }
.acc-item { border-bottom: 1px solid var(--color-line); }
.acc-item h3 { margin: 0; }
.acc-trigger {
  width: 100%; display: flex; align-items: center; justify-content: space-between; gap: var(--space-4);
  padding: var(--space-4) 0; background: transparent; border: 0; cursor: pointer;
  font-family: var(--font-display); font-size: clamp(1rem, 1.4vw, 1.12rem); font-weight: 600;
  color: var(--color-ink); text-align: left;
  transition: color var(--dur-2) var(--ease);
}
.acc-trigger:hover { color: var(--color-accent); }
.acc-chev { flex: none; width: 20px; height: 20px; color: var(--color-muted); transition: transform var(--dur-2) var(--ease); }
.acc-item.is-open .acc-chev { transform: rotate(180deg); color: var(--color-accent); }
.acc-panel { padding-bottom: var(--space-5); animation: fadeUp var(--dur-3) var(--ease) both; }
.acc-panel p { color: var(--color-muted); max-width: 68ch; }
.acc-panel code { padding: .04em .3em; border-radius: var(--radius-xs); background: var(--color-accent-soft); color: var(--color-accent-ink); }

/* --------------------------- CTA band ------------------------------ */
.cta-band { padding-block: clamp(2.4rem, 5.5vw, 3.75rem); background: var(--color-surface); border-top: 1px solid var(--color-line); }
.cta-inner { display: grid; gap: var(--space-4); }
.cta-inner h2 { margin-bottom: var(--space-2); }
.cta-inner > div > p { color: var(--color-muted); max-width: 52ch; }
.cta-form { display: flex; flex-wrap: wrap; gap: var(--space-2); max-width: 460px; }
.cta-form .input { flex: 1 1 230px; }

/* ---------------------------- footer ------------------------------- */
.site-footer { background: #1c1236; color: #ddd0f4; padding-top: clamp(2.4rem, 5vw, 3.75rem); }
@media (prefers-color-scheme: dark) { .site-footer { background: #08060f; } }
.footer-top { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: var(--space-6); padding-bottom: var(--space-7); }
.footer-brand .brand-text { color: inherit; }
.footer-brand .brand-mark { color: #c9b6f8; }
.footer-brand p { margin-top: var(--space-3); font-size: .88rem; opacity: .76; max-width: 32ch; }
.socials { display: flex; gap: var(--space-2); margin-top: var(--space-4); }
.socials .icon-btn { color: inherit; border-color: rgba(255,255,255,.24); }
.socials .icon-btn:hover { background: rgba(255,255,255,.14); color: #fff; }
.footer-h { font-family: var(--font-text); font-size: .78rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; margin-bottom: var(--space-4); opacity: .84; }
.footer-col ul { display: flex; flex-direction: column; gap: .55rem; font-size: .88rem; }
.footer-col a { color: inherit; text-decoration: none; opacity: .8; transition: opacity var(--dur-2) var(--ease), color var(--dur-2) var(--ease); }
.footer-col a:hover { opacity: 1; color: #c9b6f8; }
.footer-contact li { opacity: .8; }
.footer-signup { display: flex; gap: var(--space-2); margin-top: var(--space-4); }
.footer-signup .input { flex: 1 1 auto; background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.3); color: inherit; }
.footer-signup .input::placeholder { color: rgba(255,255,255,.62); }
.footer-signup .input:focus { background: rgba(255,255,255,.14); border-color: #c9b6f8; box-shadow: 0 0 0 3px rgba(201,182,248,.24); }
.footer-signup .btn-quiet { color: #ddd0f4; border-color: rgba(255,255,255,.32); white-space: nowrap; }
.footer-signup .btn-quiet:hover { background: #c9b6f8; border-color: #c9b6f8; color: #1c1236; }
.site-footer .form-msg { margin-top: .3rem; color: rgba(255,255,255,.7); }
.site-footer .form-msg.is-ok { color: #a8e6c8; }
.site-footer .form-msg.is-bad { color: #f4b0a4; }
.footer-bottom {
  display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: center; justify-content: space-between;
  padding-block: var(--space-4); border-top: 1px solid rgba(255,255,255,.16); font-size: .8rem;
}
.footer-bottom p { opacity: .74; }
.legal { display: flex; flex-wrap: wrap; gap: var(--space-4); }
.legal a { color: inherit; text-decoration: none; opacity: .8; }
.legal a:hover { opacity: 1; color: #c9b6f8; }

/* ---------------------------- to top ------------------------------- */
.to-top {
  position: fixed; right: clamp(1rem, 3vw, 2rem); bottom: clamp(1rem, 3vw, 2rem); z-index: 880;
  width: 46px; height: 46px; display: grid; place-items: center;
  border-radius: 50%; cursor: pointer; border: 0;
  background: var(--color-accent); color: var(--color-on-accent); box-shadow: var(--shadow-3);
  animation: popIn var(--dur-2) var(--ease) both;
}
.to-top:hover { background: var(--color-accent-strong); transform: translateY(-2px); }
.to-top .icon { width: 20px; height: 20px; }

/* ---------------------------- toasts ------------------------------- */
.toasts {
  position: fixed; left: 50%; bottom: clamp(1rem, 4vw, 2.5rem); z-index: 1300;
  transform: translateX(-50%);
  display: flex; flex-direction: column; gap: var(--space-2); align-items: center;
  pointer-events: none; width: min(92vw, 420px);
}
.toast {
  display: flex; align-items: center; gap: var(--space-2);
  padding: .62rem .95rem; border-radius: var(--radius-pill);
  font-size: .87rem; font-weight: 500;
  color: var(--color-ink); background: var(--color-surface);
  border: 1px solid var(--color-line); box-shadow: var(--shadow-3);
  animation: toastIn var(--dur-3) var(--ease) both;
}
.toast.is-out { animation: toastOut var(--dur-2) var(--ease) both; }
.toast.is-bad { border-color: var(--color-bad); }

/* ---------------------------- reveal ------------------------------- */
[data-reveal] {
  opacity: 0; transform: translateY(18px);
  transition: opacity var(--dur-3) var(--ease), transform var(--dur-3) var(--ease);
  transition-delay: var(--delay, 0ms);
}
[data-reveal].is-visible { opacity: 1; transform: none; }

/* ---------------------------- keyframes --------------------------- */
@keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
@keyframes popIn { from { opacity: 0; transform: scale(.86); } to { opacity: 1; transform: scale(1); } }
@keyframes tabIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes toastIn { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: none; } }
@keyframes toastOut { to { opacity: 0; transform: translateY(10px) scale(.97); } }
@keyframes flash {
  0% { transform: translateY(4px) scale(.97); opacity: .55; }
  55% { transform: translateY(-2px) scale(1.015); opacity: 1; }
  100% { transform: none; opacity: 1; }
}
@keyframes memPulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(69,201,138,.7); }
  55% { transform: scale(1.14); box-shadow: 0 0 0 7px rgba(69,201,138,0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(69,201,138,0); }
}
@keyframes caretBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }

/* --------------------------- responsive --------------------------- */
@media (min-width: 600px) {
  .header-actions > .btn-quiet span { display: inline; }
}

@media (min-width: 920px) {
  .nav { display: flex; }
  .nav-toggle { display: none; }
  .hero-inner { grid-template-columns: minmax(0, 1.05fr) minmax(310px, .95fr); align-items: center; }
  .cta-inner { grid-template-columns: minmax(0, 1fr) minmax(290px, .8fr); align-items: center; }
  .cta-inner .form-msg { grid-column: 2; }
  .workspace { grid-template-columns: minmax(0, 1.05fr) minmax(300px, .95fr); }
}

@media (min-width: 1060px) {
  .footer-top { grid-template-columns: minmax(230px, 1.3fr) repeat(4, minmax(0, 1fr)); }
}

@media (max-width: 560px) {
  body { font-size: 15.5px; }
  .hero-actions .btn { flex: 1 1 100%; }
  .key { min-height: 46px; font-size: 1rem; }
  .key-num { font-size: 1.1rem; }
  .key-mem, .key-sci { min-height: 38px; font-size: .78rem; }
  .cta-form .btn { flex: 1 1 100%; }
  .footer-bottom { flex-direction: column; align-items: flex-start; }
  .shortcut-table th, .shortcut-table td { padding: .7rem var(--space-3); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
  [data-reveal] { opacity: 1; transform: none; }
  .caret { animation: none; }
}
`,
  javascript: `'use strict';

(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STORAGE_KEY = 'slate.state.v1';
  var HISTORY_MAX = 30;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function icon(id, size) {
    var s = size || 20;
    return '<svg class="icon" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-' + id + '"></use></svg>';
  }
  function setText(sel, value) { var el = $(sel); if (el) { el.textContent = value; } }
  function show(el, on) { if (el) { el.hidden = !on; } }
  function calcError(message) {
    var e = new Error(message);
    e.isCalc = true;
    return e;
  }

  /* ==================================================================== *
   * 1. The engine. A tokenizer plus a recursive-descent parser.          *
   *    Grammar, loosest first:                                         *
   *      expression := term (('+' | '-') term)*                        *
   *      term       := unary (('*' | '/') unary)*                       *
   *      unary      := ('-' | '+') unary | power                       *
   *      power      := postfix ('^' unary)?                            *
   *      postfix    := primary '%'*                                    *
   *      primary    := number | '(' expression ')' | name [ '(' e ')' ] *
   * ==================================================================== */
  var CONSTS = { pi: Math.PI, e: Math.E };
  var FUNCS = {};

  function toRad(x, mode) { return mode === 'rad' ? x : (x * Math.PI) / 180; }
  function fromRad(x, mode) { return mode === 'rad' ? x : (x * 180) / Math.PI; }

  FUNCS.sin = function (x, mode) { return Math.sin(toRad(x, mode)); };
  FUNCS.cos = function (x, mode) { return Math.cos(toRad(x, mode)); };
  FUNCS.tan = function (x, mode) { return Math.tan(toRad(x, mode)); };
  FUNCS.asin = function (x, mode) {
    if (x < -1 || x > 1) { throw calcError('asin needs a value between -1 and 1'); }
    return fromRad(Math.asin(x), mode);
  };
  FUNCS.acos = function (x, mode) {
    if (x < -1 || x > 1) { throw calcError('acos needs a value between -1 and 1'); }
    return fromRad(Math.acos(x), mode);
  };
  FUNCS.atan = function (x, mode) { return fromRad(Math.atan(x), mode); };
  FUNCS.ln = function (x) {
    if (x <= 0) { throw calcError('ln needs a number above zero'); }
    return Math.log(x);
  };
  FUNCS.log = function (x) {
    if (x <= 0) { throw calcError('log needs a number above zero'); }
    return Math.log(x) / Math.LN10;
  };
  FUNCS.sqrt = function (x) {
    if (x < 0) { throw calcError('sqrt needs zero or more'); }
    return Math.sqrt(x);
  };
  FUNCS.sq = function (x) { return x * x; };
  FUNCS.exp = function (x) { return Math.exp(x); };
  FUNCS.abs = function (x) { return Math.abs(x); };
  FUNCS.inv = function (x) {
    if (Math.abs(x) < 1e-12) { throw calcError('Cannot divide by zero'); }
    return 1 / x;
  };

  function isDigit(ch) { return ch >= '0' && ch <= '9'; }
  function isNameChar(ch) { return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z'); }

  function tokenize(src) {
    var out = [];
    var i = 0;
    var n = src.length;
    while (i < n) {
      var ch = src.charAt(i);
      if (ch === ' ') { i++; continue; }
      if (isDigit(ch) || ch === '.') {
        var start = i;
        var dot = false;
        while (i < n && (isDigit(src.charAt(i)) || src.charAt(i) === '.')) {
          if (src.charAt(i) === '.') {
            if (dot) { throw calcError('That number has two decimal points'); }
            dot = true;
          }
          i++;
        }
        var raw = src.slice(start, i);
        var num = parseFloat(raw);
        if (isNaN(num)) { throw calcError(raw + ' is not a number'); }
        out.push({ t: 'num', v: num });
        continue;
      }
      if (isNameChar(ch)) {
        var s = i;
        while (i < n && isNameChar(src.charAt(i))) { i++; }
        out.push({ t: 'name', v: src.slice(s, i).toLowerCase() });
        continue;
      }
      if ('+-*/^()%'.indexOf(ch) >= 0) { out.push({ t: ch }); i++; continue; }
      throw calcError('Unexpected character "' + ch + '"');
    }
    return out;
  }

  function evaluate(src, mode) {
    var tokens = tokenize(src);
    if (!tokens.length) { throw calcError('Nothing to evaluate yet'); }
    var pos = 0;

    function peek() { return pos < tokens.length ? tokens[pos] : null; }
    function take() { return tokens[pos++]; }
    function label(tk) { return tk && tk.t === 'num' ? String(tk.v) : (tk ? tk.t : ''); }

    function parsePrimary() {
      var tk = take();
      if (!tk) { throw calcError('The expression ends early'); }
      if (tk.t === 'num') { return { v: tk.v, pct: false }; }
      if (tk.t === '(') {
        var inner = parseExpression();
        if (!peek() || peek().t !== ')') { throw calcError('Missing a closing bracket'); }
        pos++;
        return { v: inner.v, pct: false };
      }
      if (tk.t === 'name') {
        if (Object.prototype.hasOwnProperty.call(CONSTS, tk.v)) { return { v: CONSTS[tk.v], pct: false }; }
        if (Object.prototype.hasOwnProperty.call(FUNCS, tk.v)) {
          var arg = null;
          var ahead = peek();
          if (ahead && ahead.t === '(') {
            pos++;
            arg = parseExpression();
            if (!peek() || peek().t !== ')') { throw calcError('Missing a closing bracket'); }
            pos++;
          } else if (ahead && ahead.t === 'num') {
            arg = { v: ahead.v, pct: false };
            pos++;
          } else {
            arg = parseUnary();
          }
          return { v: FUNCS[tk.v](arg.v, mode), pct: false };
        }
        throw calcError('Unknown "' + tk.v + '"');
      }
      throw calcError('Unexpected "' + label(tk) + '"');
    }

    function parsePostfix() {
      var v = parsePrimary();
      while (peek() && peek().t === '%') { pos++; v = { v: v.v, pct: true }; }
      return v;
    }

    function parsePower() {
      var base = parsePostfix();
      if (peek() && peek().t === '^') {
        pos++;
        var exp = parseUnary();
        if (base.v < 0 && Math.abs(exp.v - Math.round(exp.v)) > 1e-9) {
          throw calcError('A negative base needs a whole number exponent');
        }
        return { v: Math.pow(base.v, exp.v), pct: false };
      }
      return base;
    }

    function parseUnary() {
      var tk = peek();
      if (tk && tk.t === '-') { pos++; return { v: -parseUnary().v, pct: false }; }
      if (tk && tk.t === '+') { pos++; return parseUnary(); }
      return parsePower();
    }

    function parseTerm() {
      var left = parseUnary();
      var tk = peek();
      while (tk && (tk.t === '*' || tk.t === '/')) {
        pos++;
        var right = parseUnary();
        /* A trailing % is a plain division by a hundred after * and /, and
           only becomes a share of the left operand after + and -. */
        var factor = right.pct ? right.v / 100 : right.v;
        if (tk.t === '/') {
          if (Math.abs(factor) < 1e-12) { throw calcError('Cannot divide by zero'); }
          left = { v: left.v / factor, pct: false };
        } else {
          left = { v: left.v * factor, pct: false };
        }
        tk = peek();
      }
      return left;
    }

    function parseExpression() {
      var left = parseTerm();
      var tk = peek();
      while (tk && (tk.t === '+' || tk.t === '-')) {
        pos++;
        var right = parseTerm();
        if (right.pct) {
          var share = (left.v * right.v) / 100;
          left = { v: tk.t === '+' ? left.v + share : left.v - share, pct: false };
        } else {
          left = { v: tk.t === '+' ? left.v + right.v : left.v - right.v, pct: false };
        }
        tk = peek();
      }
      return left;
    }

    var result = parseExpression();
    if (pos < tokens.length) {
      throw calcError('Unexpected "' + label(tokens[pos]) + '" after a complete result');
    }
    return result.v;
  }

  /* ---------------------------- formatting ---------------------------- */
  /* The pad holds a value the parser can read again; the display holds a
     formatted version of it. Keeping the two apart is what stops a result
     like 2,468.00 being fed back in as an expression. */
  function machineString(n) {
    if (!isFinite(n)) { return String(n); }
    var s = String(n);
    if (s.indexOf('e') < 0 && s.indexOf('E') < 0) { return s === '-0' ? '0' : s; }
    var fixed = n.toFixed(20).replace(/0+$/, '');
    if (fixed.charAt(fixed.length - 1) === '.') { fixed = fixed.slice(0, -1); }
    return fixed === '-0' ? '0' : fixed;
  }

  function format(n, s) {
    if (typeof n !== 'number' || isNaN(n)) { throw calcError('That is not a number'); }
    if (!isFinite(n)) { throw calcError('The result is not a finite number'); }
    if (Math.abs(n) > 1e15) { throw calcError('The result is too large to display'); }
    var fixed = Math.abs(n).toFixed(s.precision);
    var parts = fixed.split('.');
    var intPart = parts[0];
    if (s.sep) { intPart = intPart.replace(/\\B(?=(\\d{3})+(?!\\d))/g, ','); }
    var frac = parts.length > 1 ? '.' + parts[1] : '';
    var sign = (n < 0 && parseFloat(fixed) !== 0) ? '-' : '';
    return sign + intPart + frac;
  }

  /* ================================ state ============================= */
  var expr = '';
  var caret = 0;
  var pending = false;
  var memory = 0;
  var history = [];
  var lastCommitted = '';
  var settings = { angle: 'deg', precision: 2, sep: true };

  var CONVERTERS = [
    { id: 'km-mi', label: 'Kilometres to miles', from: 'km', to: 'mi', rule: '(V) * 0.6213711922', seed: '42' },
    { id: 'lb-kg', label: 'Pounds to kilograms', from: 'lb', to: 'kg', rule: '(V) * 0.45359237', seed: '154' },
    { id: 'c-f', label: 'Celsius to Fahrenheit', from: 'C', to: 'F', rule: '(V) * 9 / 5 + 32', seed: '21' },
    { id: 'in-cm', label: 'Inches to centimetres', from: 'in', to: 'cm', rule: '(V) * 2.54', seed: '13.5' },
    { id: 'l-gal', label: 'Litres to US gallons', from: 'L', to: 'gal', rule: '(V) * 0.2641720524', seed: '3' },
    { id: 'h-min', label: 'Hours to minutes', from: 'h', to: 'min', rule: '(V) * 60', seed: '7.5' },
    { id: 'min-kwh', label: 'Minutes to kWh at 1.4kW', from: 'min', to: 'kWh', rule: '(V) / 60 * 1.4', seed: '90' },
    { id: 'gbp-eur', label: 'Pounds to euros at 1.17', from: 'GBP', to: 'EUR', rule: '(V) * 1.17', seed: '250' }
  ];

  var RECIPES = [
    { label: '18% tip on $84.50', expr: '84.5 * 18 / 100', unit: 'tip' },
    { label: 'Split $126.40 four ways', expr: '126.4 / 4', unit: 'each' },
    { label: '15% off $219.00', expr: '219 - 219 * 15 / 100', unit: 'you save' },
    { label: '$2,400 at 4% for five years', expr: '2400 * (1 + 4 / 100) ^ 5', unit: 'balance' },
    { label: '12% tip on $62.80, split two', expr: '62.8 * 1.12 / 2', unit: 'each' },
    { label: 'Tax on $1,800 at 6% less $1,300 at 7.5%', expr: '1800 * 0.06 - 1300 * 0.075', unit: 'difference' }
  ];

  var REFERENCE = [
    { tag: 'power', expr: '2 ^ 3 ^ 2', why: 'powers run right to left, so this is 2^(3^2)' },
    { tag: 'unary', expr: '-2 ^ 2', why: 'unary minus sits below the power, so this is -4' },
    { tag: 'times', expr: '2 + 3 * 4', why: 'multiplication before addition' },
    { tag: 'percent', expr: '200 + 10%', why: 'a trailing % shares the left operand' },
    { tag: 'brackets', expr: '(2 + 3) * 4', why: 'brackets win over everything' },
    { tag: 'function', expr: 'sqrt(9) + 1', why: 'a function binds to the next value' }
  ];

  /* ============================== editor ============================== */
  function render() {
    var line = $('#disp-expr');
    if (line) {
      line.innerHTML = esc(expr.slice(0, caret)) + '<span class="caret"></span>' + esc(expr.slice(caret));
    }
    var tail = $('#disp-tail');
    if (tail) { tail.textContent = tailLiteral(expr.slice(0, caret)); }
    var out = $('#disp-value');
    if (out) { out.textContent = preview().text; }
    syncChips();
  }

  function tailLiteral(before) {
    var m = /(\\d+\\.?\\d*|\\.\\d+|[a-z]+|\\))\\s*$/i.exec(before);
    return m ? m[1] : '';
  }

  function preview() {
    var before = expr.slice(0, caret);
    if (!before.trim()) { return { text: '0' }; }
    try {
      return { text: format(evaluate(before, settings.angle), settings) };
    } catch (err) {
      var trimmed = before.replace(/[\\s+\\-*/^]+$/, '');
      if (trimmed !== before && trimmed.trim()) {
        try {
          return { text: format(evaluate(trimmed, settings.angle), settings) };
        } catch (err2) { /* fall through to the literal */ }
      }
      return { text: tailLiteral(before) || '0' };
    }
  }

  function setHint(message, kind) {
    var hint = $('#disp-hint');
    if (!hint) { return; }
    hint.textContent = message || '';
    hint.className = 'disp-hint' + (kind ? ' is-' + kind : '');
  }

  function flash(cls) {
    var out = $('#disp-value');
    if (!out || reduce) { return; }
    out.classList.remove('is-flash');
    void out.offsetWidth;
    out.classList.add(cls);
  }

  function insert(text) {
    expr = expr.slice(0, caret) + text + expr.slice(caret);
    caret += text.length;
    pending = false;
    setHint('');
    render();
  }

  function clearAll() {
    expr = '';
    caret = 0;
    pending = false;
    setHint('');
    render();
  }

  function matchClose(src, openIdx) {
    var depth = 0;
    for (var j = openIdx; j < src.length; j++) {
      if (src.charAt(j) === '(') { depth++; }
      else if (src.charAt(j) === ')') { depth--; if (depth === 0) { return j; } }
    }
    return -1;
  }
  function matchOpen(src, closeIdx) {
    var depth = 0;
    for (var j = closeIdx; j >= 0; j--) {
      if (src.charAt(j) === ')') { depth++; }
      else if (src.charAt(j) === '(') { depth--; if (depth === 0) { return j; } }
    }
    return -1;
  }

  function backspace() {
    if (caret <= 0) { return; }
    pending = false;
    if (expr.charAt(caret - 1) === '(') {
      var close = matchClose(expr, caret - 1);
      if (close > -1) {
        expr = expr.slice(0, caret - 1) + expr.slice(close);
        caret -= 1;
        setHint('');
        render();
        return;
      }
    }
    expr = expr.slice(0, caret - 1) + expr.slice(caret);
    caret -= 1;
    setHint('');
    render();
  }

  function deleteForward() {
    if (caret >= expr.length) { return; }
    pending = false;
    if (expr.charAt(caret) === ')') {
      var open = matchOpen(expr, caret);
      if (open > -1) {
        expr = expr.slice(0, open) + expr.slice(caret + 1);
        setHint('');
        render();
        return;
      }
    }
    expr = expr.slice(0, caret) + expr.slice(caret + 1);
    setHint('');
    render();
  }

  function trailingLiteral() {
    var k = caret - 1;
    while (k >= 0 && expr.charAt(k) === ' ') { k--; }
    if (k >= 0 && expr.charAt(k) === ')') {
      var open = matchOpen(expr, k);
      if (open > -1) { return { start: open, end: k + 1 }; }
    }
    var end = caret;
    var s = caret;
    while (s > 0 && isDigit(expr.charAt(s - 1))) { s--; }
    if (s < caret) { return { start: s, end: caret }; }
    s = caret;
    while (s > 0 && expr.charAt(s - 1) === '.') { s--; }
    while (s < caret && isDigit(expr.charAt(s))) { s++; }
    if (s < caret) { return { start: s, end: caret }; }
    s = caret;
    while (s > 0 && isNameChar(expr.charAt(s - 1))) { s--; }
    if (s < caret) { return { start: s, end: caret }; }
    return null;
  }

  function isUnaryMinusAt(idx) {
    var before = expr.slice(0, idx).replace(/\\s+$/, '');
    if (!before) { return true; }
    return '+-*/^(,'.indexOf(before.charAt(before.length - 1)) >= 0;
  }

  function toggleSign() {
    pending = false;
    var lit = trailingLiteral();
    if (!lit) { insert('-'); return; }
    if (lit.start > 0 && expr.charAt(lit.start - 1) === '-' && isUnaryMinusAt(lit.start - 1)) {
      expr = expr.slice(0, lit.start - 1) + expr.slice(lit.start);
      caret = Math.max(0, caret - 1);
    } else {
      expr = expr.slice(0, lit.start) + '-' + expr.slice(lit.start);
      caret += 1;
    }
    setHint('');
    render();
  }

/* Wrapping an existing literal leaves the cursor after the closing bracket,
     because the argument is already there; an empty wrap keeps it inside. */
  function applyFunction(name) {
    pending = false;
    var lit = trailingLiteral();
    if (lit && !expr.slice(0, lit.start).match(/[a-zA-Z0-9_]\s*$/)) {
      var inner = expr.slice(lit.start, lit.end);
      expr = expr.slice(0, lit.start) + name + '(' + inner + ')' + expr.slice(lit.end);
      caret = lit.start + name.length + inner.length + 2;
    } else {
      expr = expr.slice(0, caret) + name + '()' + expr.slice(caret);
      caret = caret + name.length + 1;
    }
    setHint('');
    render();
  }
    setHint('');
    render();
  }

  function applyDot() {
    pending = false;
    var before = expr.slice(0, caret);
    var m = /[0-9.]+$/.exec(before);
    if (m && m[0].indexOf('.') >= 0) { setHint('That number already has a decimal point'); return; }
    if (!m) { insert('0.'); return; }
    insert('.');
  }

  /* Only a *committed* result is carried into the next operator, so a typed
     expression keeps its precedence: 2 + 3 * 4 is 14, not 20. */
  function applyOperator(op) {
    var before = expr.slice(0, caret);
    if (pending && caret === expr.length && before.trim()) {
      try {
        var value = evaluate(before, settings.angle);
        var text = format(value, settings);
        expr = machineString(value);
        caret = expr.length;
        lastCommitted = expr;
        pushHistory(before, text, expr);
        setHint('Carried ' + text + ' forward', 'ok');
      } catch (err) { /* incomplete: just append the operator */ }
      pending = false;
    }
    insert(op);
  }

  function commit() {
    var before = expr.slice(0, caret);
    if (!before.trim()) { setHint('Type something first', 'bad'); return; }
    var value;
    var text;
    try {
      value = evaluate(before, settings.angle);
      text = format(value, settings);
    } catch (err) {
      setHint(err && err.message ? err.message : 'That expression will not parse', 'bad');
      flash('is-error');
      return;
    }
    expr = machineString(value);
    caret = expr.length;
    lastCommitted = expr;
    pending = true;
    pushHistory(before, text, expr);
    setHint('Stored in history — click any entry to reuse it', 'ok');
    flash('is-flash');
    render();
  }

  /* Clicking the display moves the caret, which is what makes the forward
     delete key and mid-expression editing possible at all. */
  function caretFromEvent(e) {
    var line = $('#disp-expr');
    if (!line) { return -1; }
    var pos = null;
    try {
      if (document.caretRangeFromPoint) {
        var range = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (range) { pos = range.startContainer; }
      } else if (document.caretPositionFromPoint) {
        var offset = document.caretPositionFromPoint(e.clientX, e.clientY);
        if (offset) { pos = offset.offsetNode; }
      }
    } catch (err) { pos = null; }
    if (pos && line.contains(pos)) {
      try {
        var probe = document.createRange();
        probe.selectNodeContents(line);
        probe.setEnd(pos, pos.nodeType === 3 ? pos.textContent.length : 0);
        return Math.min(probe.toString().length, expr.length);
      } catch (err2) { /* fall through to the proportional guess */ }
    }
    var box = line.getBoundingClientRect();
    if (!box || !box.width) { return -1; }
    var text = line.textContent || '';
    if (!text.length) { return 0; }
    var ratio = (e.clientX - box.left) / box.width;
    if (ratio < 0) { ratio = 0; }
    if (ratio > 1) { ratio = 1; }
    return Math.min(Math.round(ratio * text.length), expr.length);
  }

  var displayBox = $('#display');
  if (displayBox) {
    displayBox.addEventListener('click', function (e) {
      var at = caretFromEvent(e);
      if (at < 0) { return; }
      caret = at;
      setHint('');
      render();
    });
  }

  function currentNumber() {
    var before = expr.slice(0, caret);
    if (!before.trim()) { return 0; }
    try {
      return evaluate(before, settings.angle);
    } catch (err) {
      var n = parseFloat(tailLiteral(before));
      return isNaN(n) ? 0 : n;
    }
  }

  /* ============================== memory ============================== */
  function syncMemoryChip() {
    var chip = $('#chip-mem');
    if (!chip) { return; }
    var on = memory !== 0;
    chip.classList.toggle('is-on', on);
    chip.title = on ? 'Memory holds ' + format(memory, settings) : 'Memory register, empty';
    chip.textContent = on ? 'M ' + format(memory, settings) : 'M';
  }

  function pulseMemoryChip() {
    var chip = $('#chip-mem');
    if (!chip || reduce) { return; }
    chip.classList.remove('just-set');
    void chip.offsetWidth;
    chip.classList.add('just-set');
  }

  function memoryOp(op) {
    var n = currentNumber();
    if (op === 'store') { memory = n; }
    else if (op === 'add') { memory += n; }
    else if (op === 'sub') { memory -= n; }
    else if (op === 'clear') { memory = 0; }
    else if (op === 'recall') {
      if (memory === 0) { setHint('The memory register is empty', 'bad'); return; }
      insert(machineString(memory));
      setHint('Recalled ' + format(memory, settings), 'ok');
      return;
    }
    if (memory !== 0 && Math.abs(memory) > 1e15) {
      memory = 0;
      save();
      syncMemoryChip();
      setHint('Memory overflowed, so the register was cleared', 'bad');
      return;
    }
    save();
    syncMemoryChip();
    pulseMemoryChip();
    if (op === 'clear') { setHint('Memory cleared'); }
    else if (op === 'store') { setHint('Stored ' + format(n, settings) + ' in memory', 'ok'); }
    else { setHint('Memory now holds ' + format(memory, settings), 'ok'); }
  }

  /* ============================== history ============================= */
  function pushHistory(source, result, value) {
    history.unshift({ source: source, result: result, value: value === undefined ? result : value });
    while (history.length > HISTORY_MAX) { history.pop(); }
    save();
    renderHistory();
  }

  function renderHistory() {
    var host = $('#history-list');
    if (!host) { return; }
    if (!history.length) {
      host.innerHTML = '<p class="empty-note">Press <kbd>=</kbd> and whatever you work out lands here. Click any entry to reuse its result.</p>';
      setText('#history-count', 'No calculations yet');
      return;
    }
    host.innerHTML = history.map(function (h, i) {
      return '<div class="hist" style="--delay:' + (i * 24) + 'ms">' +
        '<button class="hist-main" type="button" data-act="hist-use" data-index="' + i + '" aria-label="Put ' +
          esc(h.result) + ' back on the pad, from ' + esc(h.source) + '">' +
          '<span class="hist-expr">' + esc(h.source) + '</span>' +
          '<span class="hist-result">' + esc(h.result) + '</span>' +
        '</button>' +
        '<button class="hist-copy icon-btn" type="button" data-act="hist-copy" data-index="' + i +
          '" aria-label="Copy ' + esc(h.result) + ' to the clipboard">' + icon('copy', 14) + '</button>' +
      '</div>';
    }).join('');
    setText('#history-count', history.length + ' calculation' + (history.length === 1 ? '' : 's'));
  }

  function clearHistory() {
    history = [];
    save();
    renderHistory();
    toast('Calculation history cleared');
  }

  /* ============================= clipboard ============================ */
  function toast(message, kind) {
    var host = $('#toasts');
    if (!host) { return; }
    var el = document.createElement('div');
    el.className = 'toast' + (kind === 'bad' ? ' is-bad' : '');
    el.textContent = message;
    host.appendChild(el);
    setTimeout(function () {
      el.className += ' is-out';
      setTimeout(function () { if (el.parentNode) { el.parentNode.removeChild(el); } }, 300);
    }, 2400);
  }

  function copyText(text) {
    function report(ok) {
      toast(ok ? 'Copied ' + text + ' to the clipboard' : 'This browser would not give us the clipboard', ok ? '' : 'bad');
    }
    try {
      if (window.navigator && window.navigator.clipboard && window.navigator.clipboard.writeText) {
        window.navigator.clipboard.writeText(text).then(function () { report(true); }, function () { report(false); });
        return;
      }
    } catch (err) { /* fall through to the textarea path */ }
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', 'readonly');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      report(!!ok);
    } catch (err2) { report(false); }
  }

  /* ============================= settings ============================= */
  function syncChips() {
    setText('#chip-angle', settings.angle.toUpperCase());
    setText('#chip-sep', settings.sep ? '1,234' : '1234');
    setText('#chip-prec', 'P' + settings.precision);
    $$('[data-act="angle"]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-value') === settings.angle ? 'true' : 'false');
    });
    var sel = $('#sel-precision');
    if (sel && String(sel.value) !== String(settings.precision)) { sel.value = String(settings.precision); }
    var sep = $('#btn-sep');
    if (sep) {
      sep.setAttribute('aria-checked', settings.sep ? 'true' : 'false');
      setText('#sep-text', settings.sep ? 'On' : 'Off');
    }
    syncMemoryChip();
  }

  function settingsChanged() {
    save();
    syncChips();
    render();
    updateConverters();
    renderRecipes();
    renderReference();
  }

  var settingsPanel = $('#settings-panel');
  var settingsBtn = $('#settings-open');
  function openSettings() {
    if (!settingsPanel) { return; }
    settingsPanel.hidden = false;
    if (settingsBtn) { settingsBtn.setAttribute('aria-expanded', 'true'); }
  }
  function closeSettings() {
    if (!settingsPanel) { return; }
    settingsPanel.hidden = true;
    if (settingsBtn) { settingsBtn.setAttribute('aria-expanded', 'false'); }
  }
  if (settingsBtn) {
    settingsBtn.addEventListener('click', function () {
      if (settingsPanel.hidden) { openSettings(); } else { closeSettings(); }
    });
  }
  var precisionSel = $('#sel-precision');
  if (precisionSel) {
    precisionSel.addEventListener('change', function () {
      var p = parseInt(precisionSel.value, 10);
      if (!isNaN(p) && p >= 0 && p <= 6) { settings.precision = p; settingsChanged(); }
    });
  }

  /* ============================== presets ============================= */
  function renderConverters() {
    var host = $('#conv-grid');
    if (!host) { return; }
    host.innerHTML = CONVERTERS.map(function (c) {
      return '<div class="conv">' +
        '<label class="conv-label" for="conv-' + c.id + '">' + esc(c.label) + '</label>' +
        '<div class="conv-row">' +
          '<input id="conv-' + c.id + '" type="number" step="any" value="' + esc(c.seed) +
            '" data-conv="' + c.id + '" aria-label="' + esc(c.label) + ', value in ' + esc(c.from) + '">' +
          '<span class="conv-unit">' + esc(c.from) + '</span>' +
        '</div>' +
        '<p class="conv-out" id="out-' + c.id + '"></p>' +
      '</div>';
    }).join('');
    updateConverters();
  }

  function updateConverters() {
    CONVERTERS.forEach(function (c) {
      var out = document.getElementById('out-' + c.id);
      if (!out) { return; }
      var input = document.getElementById('conv-' + c.id);
      var raw = input ? input.value.trim() : '';
      if (raw === '') { out.textContent = '— ' + c.to; return; }
      try {
        out.textContent = format(evaluate(c.rule.replace('(V)', '(' + raw + ')'), settings.angle), settings) + ' ' + c.to;
      } catch (err) {
        out.textContent = 'Not a number';
      }
    });
  }

  function renderRecipes() {
    var host = $('#recipe-list');
    if (!host) { return; }
    host.innerHTML = RECIPES.map(function (r, i) {
      var value = '';
      try { value = format(evaluate(r.expr, settings.angle), settings); } catch (err) { value = '—'; }
      return '<button class="recipe" type="button" data-act="recipe" data-index="' + i + '" aria-label="' +
        esc(r.label) + ', evaluates ' + esc(r.expr) + '">' +
        '<span><span class="recipe-label">' + esc(r.label) + '</span>' +
        '<span class="recipe-expr">' + esc(r.expr) + '</span></span>' +
        '<span class="recipe-out">' + esc(value) + '<small>' + esc(r.unit) + '</small></span>' +
      '</button>';
    }).join('');
  }

  function renderReference() {
    var host = $('#ref-list');
    if (!host) { return; }
    host.innerHTML = REFERENCE.map(function (r) {
      var value = '—';
      try { value = format(evaluate(r.expr, settings.angle), settings); } catch (err) { value = '—'; }
      return '<div class="ref">' +
        '<span class="ref-rank">' + esc(r.tag) + '</span>' +
        '<span><code class="ref-expr">' + esc(r.expr) + '</code><br><span class="panel-note-sm">' + esc(r.why) + '</span></span>' +
        '<span class="ref-out">' + esc(value) + '</span>' +
      '</div>';
    }).join('');
  }

  /* =============================== tabs =============================== */
  var tabs = $$('[data-act="tab"]');
  function selectTab(name, moveFocus) {
    tabs.forEach(function (tab) {
      var on = tab.getAttribute('data-panel') === name;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.classList.toggle('is-active', on);
      tab.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) {
        panel.hidden = !on;
        panel.classList.toggle('is-active', on);
      }
      if (on && moveFocus) { tab.focus(); }
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab.getAttribute('data-panel'), false); });
    tab.addEventListener('keydown', function (e) {
      var next = -1;
      if (e.key === 'ArrowRight') { next = (i + 1) % tabs.length; }
      else if (e.key === 'ArrowLeft') { next = (i - 1 + tabs.length) % tabs.length; }
      else if (e.key === 'Home') { next = 0; }
      else if (e.key === 'End') { next = tabs.length - 1; }
      if (next < 0) { return; }
      e.preventDefault();
      selectTab(tabs[next].getAttribute('data-panel'), true);
    });
  });

  /* ============================ delegation ============================ */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) { return; }

    var el = t.closest('[data-act]');
    if (el) {
      var act = el.getAttribute('data-act');
      var idx = parseInt(el.getAttribute('data-index') || '-1', 10);

      if (act === 'digit') { insert(el.getAttribute('data-value') || ''); return; }
      if (act === 'dot') { applyDot(); return; }
      if (act === 'op') { applyOperator(el.getAttribute('data-value') || '+'); return; }
      if (act === 'pow') { insert('^'); return; }
      if (act === 'paren') { insert(el.getAttribute('data-value') || '('); return; }
      if (act === 'const') { insert(el.getAttribute('data-value') || 'pi'); return; }
      if (act === 'fn') { applyFunction(el.getAttribute('data-fn') || 'abs'); return; }
      if (act === 'percent') { insert('%'); return; }
      if (act === 'sign') { toggleSign(); return; }
      if (act === 'clear') { clearAll(); return; }
      if (act === 'del') { backspace(); return; }
      if (act === 'del-forward') { deleteForward(); return; }
      if (act === 'equals') { commit(); return; }
      if (act === 'copy-result') { copyText(preview().text); return; }
      if (act === 'mem-store') { memoryOp('store'); return; }
      if (act === 'mem-recall') { memoryOp('recall'); return; }
      if (act === 'mem-add') { memoryOp('add'); return; }
      if (act === 'mem-sub') { memoryOp('sub'); return; }
      if (act === 'mem-clear') { memoryOp('clear'); return; }
      if (act === 'clear-history') { clearHistory(); return; }
      if (act === 'angle') { settings.angle = el.getAttribute('data-value') === 'rad' ? 'rad' : 'deg'; settingsChanged(); setHint(settings.angle === 'deg' ? 'Angles in degrees' : 'Angles in radians', 'ok'); return; }
      if (act === 'sep') { settings.sep = !settings.sep; settingsChanged(); setHint(settings.sep ? 'Thousands separators on' : 'Thousands separators off', 'ok'); return; }
      if (act === 'open-settings') { openSettings(); return; }
      if (act === 'close-settings') { closeSettings(); return; }
      if (act === 'hist-use') {
        var entry = history[idx];
        if (!entry) { return; }
        var reusable = typeof entry.value === 'string' ? entry.value : entry.result;
        expr = reusable;
        caret = expr.length;
        pending = true;
        setHint('Reused ' + entry.result, 'ok');
        render();
        return;
      }
      if (act === 'hist-copy') {
        var toCopy = history[idx];
        if (toCopy) { copyText(toCopy.result); }
        return;
      }
      if (act === 'recipe') {
        var recipe = RECIPES[idx];
        if (!recipe) { return; }
        try {
          var recipeValue = evaluate(recipe.expr, settings.angle);
          var value = format(recipeValue, settings);
          pushHistory(recipe.expr, value, machineString(recipeValue));
          expr = machineString(recipeValue);
          caret = expr.length;
          pending = true;
          setHint(recipe.label + ' — ' + value, 'ok');
          flash('is-flash');
          render();
          toast(recipe.label + ': ' + value);
        } catch (err) {
          setHint(err && err.message ? err.message : 'That recipe failed', 'bad');
        }
        return;
      }
      return;
    }

    var jump = t.closest('a[href^="#"]');
    if (jump) {
      var href = jump.getAttribute('href');
      if (!href || href === '#') { return; }
      var target = document.getElementById(href.slice(1));
      if (!target) { return; }
      e.preventDefault();
      smoothJump(target);
      closeMobileNav();
    }
  });

  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t && t.getAttribute && t.getAttribute('data-conv')) { updateConverters(); }
  });

  /* ============================= keyboard ============================= */
  function hit(key) {
    var btn = $('.key[data-key="' + String(key) + '"]');
    if (!btn) { return; }
    btn.classList.remove('is-hit');
    void btn.offsetWidth;
    btn.classList.add('is-hit');
    setTimeout(function () { btn.classList.remove('is-hit'); }, 160);
  }

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) { return; }
    var tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'select' || tag === 'textarea') { return; }
    var k = e.key;

    if (k >= '0' && k <= '9') { e.preventDefault(); hit(k); insert(k); return; }
    if (k === '.') { e.preventDefault(); hit('.'); applyDot(); return; }
    if (k === '+' || k === '-' || k === '*' || k === '/' || k === '^') {
      e.preventDefault(); hit(k); applyOperator(k); return;
    }
    if (k === '(' || k === ')') { e.preventDefault(); hit(k); insert(k); return; }
    if (k === '%') { e.preventDefault(); hit('%'); insert('%'); return; }
    if (k === 'Enter' || k === '=') { e.preventDefault(); hit('Enter'); commit(); return; }
    if (k === 'Escape') { e.preventDefault(); hit('Escape'); clearAll(); return; }
    if (k === 'Backspace') { e.preventDefault(); hit('Backspace'); backspace(); return; }
    if (k === 'Delete') { e.preventDefault(); hit('Delete'); deleteForward(); return; }
    if (k.length === 1 && /[a-z]/i.test(k)) { insert(k.toLowerCase()); return; }

    /* Letters are deliberately not bound to the square, root and reciprocal
       keys, so that function names can be typed directly: sin(30), ln(e),
       sqrt(9) and asin(0.5) all work from the keyboard. Those three actions
       live on the pad instead. */
  });

  /* ============================ navigation ============================ */
  function smoothJump(target) {
    if (!target) { return; }
    try {
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    } catch (err) {
      target.scrollIntoView(true);
    }
    if (!target.hasAttribute('tabindex')) { target.setAttribute('tabindex', '-1'); }
    try { target.focus({ preventScroll: true }); } catch (err) { try { target.focus(); } catch (err2) { /* noop */ } }
  }

  var mobileNav = $('#mobile-nav');
  var navToggle = $('#nav-toggle');
  function closeMobileNav() {
    show(mobileNav, false);
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
    }
  }
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var willOpen = navToggle.getAttribute('aria-expanded') !== 'true';
      show(mobileNav, willOpen);
      navToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      navToggle.setAttribute('aria-label', willOpen ? 'Close menu' : 'Open menu');
      if (willOpen) { var first = $('.mobile-link', mobileNav); if (first) { first.focus(); } }
    });
  }

  var header = $('#site-header');
  var toTop = $('#to-top');
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (header) { header.classList.toggle('is-scrolled', y > 8); }
    show(toTop, y > 620);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  if (toTop) { toTop.addEventListener('click', function () { smoothJump($('#top')); }); }

  /* ============================== FAQ ================================ */
  var accItems = $$('.acc-item');
  function closeAcc(btn, panel, item) {
    if (!btn || !panel) { return; }
    btn.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
    if (item) { item.classList.remove('is-open'); }
  }
  accItems.forEach(function (item) {
    var btn = $('.acc-trigger', item);
    var panel = $('.acc-panel', item);
    if (!btn || !panel) { return; }
    btn.addEventListener('click', function () {
      if (btn.getAttribute('aria-expanded') === 'true') { closeAcc(btn, panel, item); return; }
      accItems.forEach(function (other) {
        if (other !== item) { closeAcc($('.acc-trigger', other), $('.acc-panel', other), other); }
      });
      btn.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
      item.classList.add('is-open');
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') { return; }
    var openTrigger = $$('.acc-trigger[aria-expanded="true"]')[0];
    if (openTrigger) {
      closeAcc(openTrigger, document.getElementById(openTrigger.getAttribute('aria-controls')), openTrigger.closest('.acc-item'));
      openTrigger.focus();
      return;
    }
    if (settingsPanel && !settingsPanel.hidden) { closeSettings(); return; }
    if (mobileNav && !mobileNav.hidden) { closeMobileNav(); if (navToggle) { navToggle.focus(); } }
  });

  /* ============================ reveal =============================== */
  var revealObserver = null;
  function revealScan(root) {
    var items = $$('[data-reveal]', root || document);
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -4% 0px', threshold: 0.06 });
    }
    items.forEach(function (el) {
      if (!el.classList.contains('is-visible')) { revealObserver.observe(el); }
    });
  }

  function runCounters() {
    $$('[data-count]').forEach(function (el) {
      if (el.getAttribute('data-counted') === '1') { return; }
      var target = parseFloat(el.getAttribute('data-count'));
      if (isNaN(target)) { return; }
      el.setAttribute('data-counted', '1');
      if (reduce) { el.textContent = target.toLocaleString('en-US'); return; }
      var started = null;
      function step(now) {
        if (started === null) { started = now; }
        var t = Math.min(1, (now - started) / 900);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased).toLocaleString('en-US');
        if (t < 1) { requestAnimationFrame(step); }
        else { el.textContent = target.toLocaleString('en-US'); }
      }
      requestAnimationFrame(step);
    });
  }

  /* ============================= storage ============================= */
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        history: history.slice(0, HISTORY_MAX), memory: memory, settings: settings
      }));
    } catch (err) { /* storage blocked, the session still works */ }
  }
  function load() {
    var raw = null;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (err) { return; }
    if (!raw) { return; }
    var data;
    try { data = JSON.parse(raw); } catch (err) { return; }
    if (!data || typeof data !== 'object') { return; }
    if (Object.prototype.toString.call(data.history) === '[object Array]') {
      history = data.history.filter(function (h) {
        return h && typeof h.source === 'string' && typeof h.result === 'string' &&
          (h.value === undefined || typeof h.value === 'string');
      }).slice(0, HISTORY_MAX);
    }
    if (typeof data.memory === 'number' && isFinite(data.memory)) { memory = data.memory; }
    if (data.settings && typeof data.settings === 'object') {
      if (data.settings.angle === 'rad' || data.settings.angle === 'deg') { settings.angle = data.settings.angle; }
      var p = parseInt(data.settings.precision, 10);
      if (!isNaN(p) && p >= 0 && p <= 6) { settings.precision = p; }
      if (typeof data.settings.sep === 'boolean') { settings.sep = data.settings.sep; }
    }
  }

  /* ============================== forms =============================== */
  var EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[a-z]{2,}$/i;
  function wireSignup(formSel, inputSel, msgSel) {
    var form = $(formSel);
    var input = $(inputSel);
    var msg = $(msgSel);
    if (!form || !input || !msg) { return; }
    input.addEventListener('input', function () {
      msg.textContent = '';
      msg.className = 'form-msg';
      input.removeAttribute('aria-invalid');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v) {
        msg.textContent = 'An email address is needed before we can add you.';
        msg.className = 'form-msg is-bad';
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      if (!EMAIL_RE.test(v)) {
        msg.textContent = 'That does not look like a valid email address.';
        msg.className = 'form-msg is-bad';
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      msg.textContent = 'Added. The next release note goes out on the first Tuesday of the month.';
      msg.className = 'form-msg is-ok';
      form.reset();
    });
  }
  wireSignup('#cta-form', '#cta-email', '#cta-msg');
  wireSignup('#footer-form', '#footer-email', '#footer-msg');

  /* =============================== boot =============================== */
  load();
  renderConverters();
  renderRecipes();
  renderReference();
  renderHistory();
  syncChips();
  render();
  revealScan();
  runCounters();
  onScroll();
  setText('#year', String(new Date().getFullYear()));
}());`,
};