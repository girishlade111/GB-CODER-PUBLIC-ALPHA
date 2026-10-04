/**
 * plain-auth — "Login/Signup"
 * Split-screen authentication: brand/testimonial panel on the left,
 * segmented login + signup forms with live client-side validation on the right.
 */
export default {
  html: `
<a class="skip-link" href="#authMain">Skip to the sign-in form</a>

<header class="topbar">
  <div class="shell topbar__inner">
    <a class="brand" href="#authMain">
      <span class="brand__mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" class="icon"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg></span>
      <span class="brand__name">Northfield<em>ID</em></span>
    </a>
    <nav class="topbar__nav" aria-label="Support">
      <a class="topbar__link" href="#faq">Help centre</a>
      <span class="topbar__sep" aria-hidden="true"></span>
      <a class="topbar__link" href="#security">Security</a>
      <span class="topbar__sep" aria-hidden="true"></span>
      <a class="topbar__link" href="#status">Status</a>
    </nav>
  </div>
</header>

<main id="authMain" class="auth">
  <section class="auth__brand" aria-labelledby="brandTitle">
    <div class="mesh" aria-hidden="true"><span class="mesh__blob mesh__blob--1"></span><span class="mesh__blob mesh__blob--2"></span><span class="mesh__blob mesh__blob--3"></span></div>
    <div class="auth__brand-inner">
      <p class="kicker"><span class="kicker__dot" aria-hidden="true"></span>Trusted by 128,400 accounts</p>
      <h1 class="brand__title" id="brandTitle">Sign in once. Work everywhere, safely.</h1>
      <p class="brand__lede">Northfield ID guards every Northfield workspace with hardware-backed keys, hardware-key options and complete audit trails. Two-factor enrolment takes under ninety seconds.</p>

      <figure class="quote" data-reveal>
        <blockquote class="quote__text">We migrated 4,200 staff over a single week. Nobody was locked out, and the security team had a full access log for every login that happened afterwards.</blockquote>
        <figcaption class="quote__by">
          <span class="quote__avatar" aria-hidden="true">PN</span>
          <span><strong>Priya Nandakumar</strong><span class="quote__role">Head of Platform Engineering, Halden Logistics</span></span>
        </figcaption>
      </figure>

      <ul class="badges" aria-label="Compliance certifications">
        <li class="badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" class="icon"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z"/></svg><span>SOC 2 Type II</span></li>
        <li class="badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" class="icon"><path d="m20 6-11 11-5-5"/></svg><span>ISO 27001</span></li>
        <li class="badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" class="icon"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/></svg><span>GDPR ready</span></li>
      </ul>

      <dl class="stat-row">
        <div class="stat-row__item"><dt>Uptime, trailing year</dt><dd><span data-count="99.99" data-decimals="2">0</span>%</dd></div>
        <div class="stat-row__item"><dt>Median sign-in time</dt><dd><span data-count="1.4" data-decimals="1">0</span>s</dd></div>
        <div class="stat-row__item"><dt>Customer rating</dt><dd><span data-count="4.9" data-decimals="1">0</span>/5</dd></div>
      </dl>
    </div>
  </section>

  <section class="auth__panel" aria-labelledby="formTitle">
    <div class="auth__card">

      <div class="card-head" id="formTitle">
        <div class="segmented" role="tablist" aria-label="Choose an account action">
          <span class="segmented__thumb" aria-hidden="true"></span>
          <button class="segmented__btn is-active" id="tab-login" type="button" role="tab" aria-selected="true" aria-controls="panel-login" tabindex="0">Log in</button>
          <button class="segmented__btn" id="tab-signup" type="button" role="tab" aria-selected="false" aria-controls="panel-signup" tabindex="-1">Sign up</button>
        </div>
      </div>

      <div class="success" id="successPanel" hidden>
        <span class="success__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" class="icon"><circle cx="12" cy="12" r="9"/><path d="m8.3 12.3 2.5 2.5 4.9-5.2"/></svg></span>
        <h2 class="success__title" id="successTitle">You are verified</h2>
        <p class="success__copy" id="successCopy">A magic link is on its way to your inbox. It expires in 15 minutes.</p>
        <button class="btn btn--primary btn--block" type="button" id="successDone">Continue to workspace</button>
        <button class="btn btn--link btn--block" type="button" id="successReset">Use a different account</button>
      </div>

      <div class="panel" id="panel-login" role="tabpanel" aria-labelledby="tab-login" tabindex="0">
        <h2 class="panel__title">Welcome back</h2>
        <p class="panel__sub">Log in to the Northfield control plane.</p>

        <form class="form" id="loginForm" novalidate>
          <div class="field" data-field="email">
            <label class="field__label" for="loginEmail">Work email</label>
            <div class="input">
              <svg class="input__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 5h16v14H4z"/><path d="m4 7 8 6 8-6"/></svg>
              <input class="input__el" id="loginEmail" name="email" type="email" autocomplete="email" placeholder="you@company.com" aria-describedby="loginEmailMsg" />
            </div>
            <p class="field__msg" id="loginEmailMsg" role="alert"></p>
          </div>

          <div class="field" data-field="password">
            <div class="field__top">
              <label class="field__label" for="loginPassword">Password</label>
              <a class="field__link" href="#faq">Forgot password?</a>
            </div>
            <div class="input">
              <svg class="input__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 11h12v10H6z"/><path d="M9 11V7a3 3 0 0 1 6 0v4"/></svg>
              <input class="input__el" id="loginPassword" name="password" type="password" autocomplete="current-password" placeholder="At least 8 characters" aria-describedby="loginPasswordMsg" />
              <button class="input__action" type="button" data-toggle="loginPassword" aria-pressed="false" aria-label="Show password">
                <svg class="icon icon--eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg class="icon icon--eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 3l18 18"/><path d="M10.6 10.7a3 3 0 0 0 4.1 4.1"/><path d="M9.5 5.2A9.9 9.9 0 0 1 12 5c6.4 0 10 7 10 7a17.7 17.7 0 0 1-3.2 4.1"/><path d="M6.3 6.4A17.5 17.5 0 0 0 2 12s3.6 7 10 7a9.6 9.6 0 0 0 4.1-.9"/></svg>
              </button>
            </div>
            <p class="field__msg" id="loginPasswordMsg" role="alert"></p>
          </div>

          <label class="check">
            <input type="checkbox" id="loginRemember" checked />
            <span class="check__box" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" class="icon"><path d="m20 6-11 11-5-5"/></svg></span>
            <span class="check__text">Keep me signed in on this device for 30 days</span>
          </label>

          <button class="btn btn--primary btn--block" type="submit">Log in securely</button>
          <p class="form-status" id="loginStatus" role="status" aria-live="polite"></p>
        </form>

        <div class="or"><span class="or__line" aria-hidden="true"></span><span class="or__text">or continue with</span><span class="or__line" aria-hidden="true"></span></div>

        <div class="socials">
          <button class="social" type="button" data-social="Google"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="icon"><path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.5 5.5 0 0 1-2.39 3.62v3h3.86c2.26-2.08 3.58-5.15 3.58-8.81Z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.86-3c-1.08.72-2.45 1.15-4.08 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24Z"/><path fill="#FBBC05" d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.28a12 12 0 0 0 0 10.74l3.99-3.09Z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.63l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75Z"/></svg><span>Google</span></button>
          <button class="social" type="button" data-social="Apple"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" class="icon"><path d="M16.36 12.78c.02 2.6 2.28 3.47 2.3 3.48-.02.06-.36 1.24-1.19 2.46-.72 1.07-1.47 2.13-2.65 2.15-1.16.02-1.53-.69-2.86-.69s-1.74.67-2.83.71c-1.14.02-2-1.15-2.73-2.21-1.49-2.17-2.63-6.14-1.1-8.83.76-1.34 2.13-2.19 3.61-2.21 1.12-.02 2.18.76 2.86.76.68 0 1.96-.94 3.3-.8.56.02 2.14.23 3.16 1.71-.08.05-1.89 1.1-1.87 3.28ZM13.86 5.9c.61-.74 1.02-1.77.9-2.79-.88.03-1.94.58-2.57 1.32-.56.65-1.05 1.7-.92 2.7.98.08 1.98-.5 2.59-1.23Z"/></svg><span>Apple</span></button>
          <button class="social" type="button" data-social="Microsoft"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" class="icon"><path d="M3 3h8.4v8.4H3zM12.6 3H21v8.4h-8.4zM3 12.6h8.4V21H3zM12.6 12.6H21V21h-8.4z"/></svg><span>Microsoft</span></button>
          <button class="social" type="button" data-social="GitHub"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" class="icon"><path d="M12 1.8a10.2 10.2 0 0 0-3.23 19.88c.51.09.7-.22.7-.49l-.01-1.9c-2.6.53-3.26-1.1-3.26-1.1-.44-1.08-1.06-1.37-1.06-1.37-.86-.56.06-.55.06-.55.95.06 1.45.94 1.45.94.85 1.4 2.2 1 2.74.76.09-.6.33-1 .6-1.23-2.16-.24-4.42-1.04-4.42-4.62 0-1.02.38-1.86 1-2.52-.1-.24-.44-1.2.1-2.5 0 0 .82-.25 2.67.96a9.5 9.5 0 0 1 4.76 0c1.85-1.21 2.67-.96 2.67-.96.54 1.3.2 2.26.1 2.5.63.66 1 1.5 1 2.52 0 3.59-2.27 4.37-4.44 4.61.35.3.66.87.66 1.76l-.01 2.6c0 .27.19.6.71.49A10.2 10.2 0 0 0 12 1.8Z"/></svg><span>GitHub</span></button>
        </div>
        <p class="switch-line">No account yet? <button class="linkish" type="button" data-switch="signup">Create one in 60 seconds</button></p>
      </div>

      <div class="panel" id="panel-signup" role="tabpanel" aria-labelledby="tab-signup" tabindex="0" hidden>
        <h2 class="panel__title">Create your account</h2>
        <p class="panel__sub">Free for one workspace. No card required.</p>

        <form class="form" id="signupForm" novalidate>
          <div class="field" data-field="name">
            <label class="field__label" for="signupName">Full name</label>
            <div class="input">
              <svg class="input__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>
              <input class="input__el" id="signupName" name="name" type="text" autocomplete="name" placeholder="Ines Ferreira" aria-describedby="signupNameMsg" />
            </div>
            <p class="field__msg" id="signupNameMsg" role="alert"></p>
          </div>

          <div class="field" data-field="email">
            <label class="field__label" for="signupEmail">Work email</label>
            <div class="input">
              <svg class="input__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 5h16v14H4z"/><path d="m4 7 8 6 8-6"/></svg>
              <input class="input__el" id="signupEmail" name="email" type="email" autocomplete="email" placeholder="you@company.com" aria-describedby="signupEmailMsg" />
            </div>
            <p class="field__msg" id="signupEmailMsg" role="alert"></p>
          </div>

          <div class="field" data-field="password">
            <label class="field__label" for="signupPassword">Password</label>
            <div class="input">
              <svg class="input__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 11h12v10H6z"/><path d="M9 11V7a3 3 0 0 1 6 0v4"/></svg>
              <input class="input__el" id="signupPassword" name="password" type="password" autocomplete="new-password" placeholder="At least 8 characters" aria-describedby="signupPasswordMsg strengthLabel" />
              <button class="input__action" type="button" data-toggle="signupPassword" aria-pressed="false" aria-label="Show password">
                <svg class="icon icon--eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg class="icon icon--eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 3l18 18"/><path d="M10.6 10.7a3 3 0 0 0 4.1 4.1"/><path d="M9.5 5.2A9.9 9.9 0 0 1 12 5c6.4 0 10 7 10 7a17.7 17.7 0 0 1-3.2 4.1"/><path d="M6.3 6.4A17.5 17.5 0 0 0 2 12s3.6 7 10 7a9.6 9.6 0 0 0 4.1-.9"/></svg>
              </button>
            </div>
            <div class="meter" aria-hidden="true"><span class="meter__track"><span class="meter__fill" id="strengthFill"></span></span></div>
            <p class="field__hint" id="strengthLabel">Use 8+ characters with a number and a symbol.</p>
            <p class="field__msg" id="signupPasswordMsg" role="alert"></p>
          </div>

          <div class="field" data-field="confirm">
            <label class="field__label" for="signupConfirm">Confirm password</label>
            <div class="input">
              <svg class="input__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 11h12v10H6z"/><path d="M9 11V7a3 3 0 0 1 6 0v4"/><path d="m10.5 15.5 1.5 1.5 3-3"/></svg>
              <input class="input__el" id="signupConfirm" name="confirm" type="password" autocomplete="new-password" placeholder="Repeat your password" aria-describedby="signupConfirmMsg" />
              <button class="input__action" type="button" data-toggle="signupConfirm" aria-pressed="false" aria-label="Show password">
                <svg class="icon icon--eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg class="icon icon--eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 3l18 18"/><path d="M10.6 10.7a3 3 0 0 0 4.1 4.1"/><path d="M9.5 5.2A9.9 9.9 0 0 1 12 5c6.4 0 10 7 10 7a17.7 17.7 0 0 1-3.2 4.1"/><path d="M6.3 6.4A17.5 17.5 0 0 0 2 12s3.6 7 10 7a9.6 9.6 0 0 0 4.1-.9"/></svg>
              </button>
            </div>
            <p class="field__msg" id="signupConfirmMsg" role="alert"></p>
          </div>

          <label class="check">
            <input type="checkbox" id="signupTerms" />
            <span class="check__box" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" class="icon"><path d="m20 6-11 11-5-5"/></svg></span>
            <span class="check__text">I accept the <a class="field__link" href="#faq">Terms of Service</a> and <a class="field__link" href="#faq">Privacy Notice</a>.</span>
          </label>
          <p class="field__msg" id="signupTermsMsg" role="alert"></p>

          <button class="btn btn--primary btn--block" type="submit">Create account</button>
          <p class="form-status" id="signupStatus" role="status" aria-live="polite"></p>
        </form>

        <p class="switch-line">Already have an account? <button class="linkish" type="button" data-switch="login">Log in instead</button></p>
      </div>
    </div>

    <p class="auth__legal">By continuing you agree to Northfield ID's <a href="#faq">acceptable use rules</a>. Sessions expire after 12 hours of inactivity.</p>
  </section>
</main>

<section class="security" id="security" aria-labelledby="secTitle">
  <div class="shell">
    <header class="section-head" data-reveal>
      <div>
        <p class="kicker kicker--dark"><span class="kicker__dot" aria-hidden="true"></span>Under the hood</p>
        <h2 class="section-title" id="secTitle">What happens when you press the button</h2>
      </div>
      <p class="section-note">Three layers sit between your credentials and the workspace they unlock.</p>
    </header>
    <div class="security__grid">
      <article class="card" data-reveal>
        <span class="card__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z"/><path d="M10 12.5 12 15l4.5-5"/></svg></span>
        <h3 class="card__title">Keys never leave the vault</h3>
        <p class="card__copy">Credentials are sealed with AES-256-GCM under a hardware-resident key. We never see a plaintext password, including during a support escalation.</p>
      </article>
      <article class="card" data-reveal style="--delay:.08s">
        <span class="card__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"/><path d="M12 7v5l3 2"/></svg></span>
        <h3 class="card__title">Every attempt is written down</h3>
        <p class="card__copy">Each sign-in writes an immutable audit record with device fingerprint, geolocation and risk score. Customers export the same feed to their SIEM.</p>
      </article>
      <article class="card" data-reveal style="--delay:.16s">
        <span class="card__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M6 6h12v12H6z"/><path d="M9 9h6v6H9M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg></span>
        <h3 class="card__title">Risk scoring in real time</h3>
        <p class="card__copy">Impossible travel and new-device signals raise friction automatically, so ordinary logins stay fast while unusual ones stop and ask.</p>
      </article>
    </div>
  </div>
</section>

<section class="logos" aria-labelledby="logosTitle">
  <div class="shell">
    <h2 class="logos__title" id="logosTitle">Identity provider for teams at</h2>
    <ul class="logos__row">
      <li>Halden Logistics</li>
      <li>Verity Health</li>
      <li>Orbital Freight</li>
      <li>Northwind Labs</li>
      <li>Castellan Group</li>
      <li>Ridgeline Bank</li>
    </ul>
  </div>
</section>

<section class="faq" id="faq" aria-labelledby="faqTitle">
  <div class="shell faq__inner">
    <header class="section-head" data-reveal>
      <div>
        <p class="kicker kicker--dark"><span class="kicker__dot" aria-hidden="true"></span>Before you ask</p>
        <h2 class="section-title" id="faqTitle">Account questions, answered</h2>
      </div>
      <p class="section-note">Still stuck? The support desk replies in under four hours on business days.</p>
    </header>
    <div class="accordion" id="accordion">
      <div class="acc-item">
        <h3><button class="acc-btn" type="button" aria-expanded="false" aria-controls="acc1" id="accBtn1">I forgot my password. What now?<svg class="acc-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
        <div class="acc-panel" id="acc1" role="region" aria-labelledby="accBtn1"><div class="acc-panel__inner"><p>Choose &ldquo;Forgot password?&rdquo; on the login form and we will email a single-use link valid for fifteen minutes. If your organisation uses single sign-on, your identity provider is the only place the reset link exists.</p></div></div>
      </div>
      <div class="acc-item">
        <h3><button class="acc-btn" type="button" aria-expanded="false" aria-controls="acc2" id="accBtn2">Is two-factor authentication mandatory?<svg class="acc-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
        <div class="acc-panel" id="acc2" role="region" aria-labelledby="accBtn2"><div class="acc-panel__inner"><p>Not on the free plan, yes on Business and Enterprise. Administrators can also require a hardware key or a passkey, which removes the phishing surface entirely.</p></div></div>
      </div>
      <div class="acc-item">
        <h3><button class="acc-btn" type="button" aria-expanded="false" aria-controls="acc3" id="accBtn3">Where is my account data stored?<svg class="acc-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
        <div class="acc-panel" id="acc3" role="region" aria-labelledby="accBtn3"><div class="acc-panel__inner"><p>Frankfurt for European customers, Dublin for everyone else, and a customer-owned bucket for data that must never leave your infrastructure. Backups are encrypted with a separate key and expire after thirty-five days.</p></div></div>
      </div>
      <div class="acc-item">
        <h3><button class="acc-btn" type="button" aria-expanded="false" aria-controls="acc4" id="accBtn4">Can I migrate from another provider?<svg class="acc-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
        <div class="acc-panel" id="acc4" role="region" aria-labelledby="accBtn4"><div class="acc-panel__inner"><p>Yes. Upload a CSV or point the migration tool at your current directory. Accounts over 500 seats get a named engineer who runs the cutover with you over two sessions.</p></div></div>
      </div>
      <div class="acc-item">
        <h3><button class="acc-btn" type="button" aria-expanded="false" aria-controls="acc5" id="accBtn5">What happens to my account if I stop paying?<svg class="acc-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button></h3>
        <div class="acc-panel" id="acc5" role="region" aria-labelledby="accBtn5"><div class="acc-panel__inner"><p>After ninety days the workspace is suspended, not deleted. You can restore it and export everything at any point in that window. We have never deleted an account for non-payment.</p></div></div>
      </div>
    </div>
  </div>
</section>

<footer class="foot">
  <div class="shell">
    <div class="foot__grid">
      <div class="foot__brand">
        <a class="brand" href="#authMain">
          <span class="brand__mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" class="icon"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg></span>
          <span class="brand__name">Northfield<em>ID</em></span>
        </a>
        <p class="foot__blurb">Identity infrastructure for teams who would rather not think about identity. Founded 2018, headquartered in Rotterdam, 61 people.</p>
      </div>
      <nav class="foot__col" aria-label="Product">
        <h2 class="foot__title">Product</h2>
        <ul><li><a href="#security">Passkeys</a></li><li><a href="#security">Directory sync</a></li><li><a href="#security">Audit log</a></li><li><a href="#security">Session policy</a></li><li><a href="#security">Pricing</a></li></ul>
      </nav>
      <nav class="foot__col" aria-label="Developers">
        <h2 class="foot__title">Developers</h2>
        <ul><li><a href="#faq">Documentation</a></li><li><a href="#faq">API reference</a></li><li><a href="#faq">Migration tool</a></li><li><a href="#faq">Changelog</a></li><li><a href="#faq">Status page</a></li></ul>
      </nav>
      <nav class="foot__col" aria-label="Company">
        <h2 class="foot__title">Company</h2>
        <ul><li><a href="#faq">About</a></li><li><a href="#faq">Careers</a></li><li><a href="#faq">Trust centre</a></li><li><a href="#faq">Press kit</a></li><li><a href="#faq">Contact</a></li></ul>
      </nav>
      <nav class="foot__col" aria-label="Legal">
        <h2 class="foot__title">Legal</h2>
        <ul><li><a href="#faq">Privacy</a></li><li><a href="#faq">Terms</a></li><li><a href="#faq">DPA</a></li><li><a href="#faq">Sub-processors</a></li><li><a href="#faq">Accessibility</a></li></ul>
      </nav>
    </div>
    <div class="foot__legal">
      <p>&copy; 2026 Northfield Identity BV. All rights reserved.</p>
      <p>Registered in Rotterdam &middot; KvK 71290844</p>
    </div>
  </div>
</footer>

<div class="toast" id="toast" role="status" aria-live="polite" hidden></div>
`,
  css: `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,400;9..144,600&display=swap');

:root {
  --bg: #f2f5f5;
  --surface: #ffffff;
  --ink: #0d1618;
  --ink-2: #16262a;
  --text: #12211f;
  --muted: #5e6f6d;
  --line: #dfe7e6;
  --line-2: #c9d6d4;
  --accent: #14b39c;
  --accent-2: #0b7f70;
  --accent-soft: #e2f6f2;
  --danger: #c2323b;
  --danger-soft: #fdecec;
  --ok: #1d7a52;
  --warn: #b4690e;
  --radius-sm: 8px;
  --radius: 12px;
  --radius-lg: 18px;
  --shadow-sm: 0 1px 2px rgba(9, 26, 24, .06), 0 1px 1px rgba(9, 26, 24, .04);
  --shadow: 0 8px 22px -12px rgba(9, 26, 24, .28), 0 2px 6px rgba(9, 26, 24, .05);
  --shadow-lg: 0 32px 60px -30px rgba(9, 26, 24, .45), 0 8px 18px rgba(9, 26, 24, .07);
  --font-display: 'Fraunces', 'Iowan Old Style', Georgia, serif;
  --font-body: 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --ease: cubic-bezier(.22, .68, 0, 1);
}

*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0; padding: 0;
  background: var(--bg); color: var(--text);
  font-family: var(--font-body); font-size: 16px; line-height: 1.6;
  -webkit-font-smoothing: antialiased; overflow-x: hidden;
}
h1, h2, h3 { font-family: var(--font-body); margin: 0; line-height: 1.2; letter-spacing: -.02em; font-weight: 700; }
p { margin: 0; }
ul, ol, dl { margin: 0; padding: 0; list-style: none; }
dd, dt { margin: 0; }
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
button { font: inherit; color: inherit; }
:focus-visible { outline: 2px solid var(--accent-2); outline-offset: 3px; border-radius: 5px; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.shell { width: 100%; max-width: 1200px; margin-inline: auto; padding-inline: clamp(1rem, 4vw, 2.5rem); }
.icon { width: 1.15em; height: 1.15em; flex: none; }

.skip-link {
  position: fixed; top: 8px; left: 8px; z-index: 300;
  transform: translateY(-180%);
  background: var(--ink); color: #fff; padding: .6rem 1rem;
  border-radius: var(--radius-sm); font-weight: 600; transition: transform .2s var(--ease);
}
.skip-link:focus { transform: translateY(0); }

.btn {
  position: relative; overflow: hidden;
  display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
  padding: .78rem 1.2rem; font-size: .9rem; font-weight: 700; letter-spacing: -.01em;
  border: 1px solid transparent; border-radius: 10px; cursor: pointer; white-space: nowrap;
  transition: transform .16s var(--ease), background .2s var(--ease), color .2s var(--ease), border-color .2s var(--ease), box-shadow .2s var(--ease);
}
.btn::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(100deg, transparent 20%, rgba(255,255,255,.28) 45%, transparent 70%);
  transform: translateX(-130%);
  transition: transform .55s var(--ease);
}
.btn:hover::after { transform: translateX(130%); }
.btn:hover { transform: translateY(-2px); }
.btn:active { transform: translateY(0); }
.btn--block { width: 100%; }
.btn--primary { background: var(--ink); color: #fff; box-shadow: var(--shadow-sm); }
.btn--primary:hover { background: var(--accent-2); box-shadow: var(--shadow); }
.btn--link { background: transparent; color: var(--accent-2); font-weight: 600; box-shadow: none; }
.btn--link:hover { color: var(--ink); }
.btn--link::after { display: none; }

/* ---------- top bar ---------- */
.topbar { background: var(--surface); border-bottom: 1px solid var(--line); position: relative; z-index: 20; }
.topbar__inner { display: flex; align-items: center; justify-content: space-between; gap: 1rem; min-height: 66px; }
.brand { display: inline-flex; align-items: center; gap: .6rem; }
.brand__mark {
  display: grid; place-items: center; width: 36px; height: 36px;
  border-radius: 10px; background: var(--ink); color: var(--accent);
}
.brand__mark .icon { width: 19px; height: 19px; }
.brand__name { font-weight: 800; font-size: 1.05rem; letter-spacing: -.03em; }
.brand__name em { font-style: normal; color: var(--accent-2); }
.topbar__nav { display: flex; align-items: center; gap: .9rem; }
.topbar__link { font-size: .85rem; color: var(--muted); transition: color .18s var(--ease); }
.topbar__link:hover { color: var(--accent-2); }
.topbar__sep { width: 4px; height: 4px; border-radius: 50%; background: var(--line-2); }

/* ---------- split ---------- */
.auth { display: grid; grid-template-columns: minmax(0, 1.02fr) minmax(0, 1fr); min-height: 720px; }
.auth__brand {
  position: relative; overflow: hidden;
  background: linear-gradient(165deg, var(--ink) 0%, #10262a 58%, #0b1d20 100%);
  color: #eaf5f3; padding: clamp(2rem, 5vw, 4rem) clamp(1.25rem, 4vw, 3.5rem);
  display: flex; align-items: center;
}
.mesh { position: absolute; inset: -18%; filter: blur(46px); opacity: .55; }
.mesh__blob { position: absolute; border-radius: 50%; }
.mesh__blob--1 { width: 46%; height: 46%; left: 4%; top: 8%; background: radial-gradient(circle, var(--accent), transparent 68%); animation: mesh-drift 22s var(--ease) infinite; }
.mesh__blob--2 { width: 40%; height: 40%; right: 6%; top: 34%; background: radial-gradient(circle, #2f7f8f, transparent 68%); animation: mesh-drift 27s var(--ease) infinite reverse; }
.mesh__blob--3 { width: 34%; height: 34%; left: 28%; bottom: 2%; background: radial-gradient(circle, #4d8f6d, transparent 68%); animation: mesh-drift 32s var(--ease) infinite; }
.auth__brand-inner { position: relative; z-index: 1; width: 100%; max-width: 560px; }

.kicker {
  display: inline-flex; align-items: center; gap: .55rem;
  font-size: .72rem; font-weight: 700; letter-spacing: .15em; text-transform: uppercase;
  color: color-mix(in srgb, var(--accent) 78%, #fff);
}
.kicker--dark { color: var(--accent-2); }
.kicker__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); animation: pulse-ring 2.8s var(--ease) infinite; }
.brand__title { font-family: var(--font-display); font-weight: 600; font-size: clamp(1.9rem, 3.9vw, 2.9rem); margin-block: .9rem 1rem; letter-spacing: -.025em; }
.brand__lede { color: color-mix(in srgb, #eaf5f3 76%, transparent); max-width: 50ch; font-size: 1rem; }

.quote {
  margin: clamp(1.75rem, 4vw, 2.5rem) 0 0;
  padding: 1.15rem 1.25rem;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.13);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(6px);
}
.quote__text { margin: 0; font-size: .93rem; color: color-mix(in srgb, #eaf5f3 90%, transparent); }
.quote__by { display: flex; align-items: center; gap: .7rem; margin-top: .9rem; }
.quote__avatar {
  display: grid; place-items: center; width: 36px; height: 36px; flex: none;
  border-radius: 50%; background: var(--accent); color: var(--ink);
  font-size: .74rem; font-weight: 800;
}
.quote__by strong { display: block; font-size: .85rem; }
.quote__role { display: block; font-size: .76rem; color: color-mix(in srgb, #eaf5f3 62%, transparent); }

.badges { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1.5rem; }
.badge {
  display: inline-flex; align-items: center; gap: .4rem;
  padding: .35rem .7rem; font-size: .74rem; font-weight: 600;
  border: 1px solid rgba(255,255,255,.18); border-radius: 999px;
  color: color-mix(in srgb, #eaf5f3 82%, transparent);
}
.badge .icon { width: 14px; height: 14px; color: var(--accent); }

.stat-row { display: grid; gap: 1rem; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 1.75rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,.12); }
.stat-row__item dt { font-size: .7rem; letter-spacing: .1em; text-transform: uppercase; color: color-mix(in srgb, #eaf5f3 56%, transparent); }
.stat-row__item dd { font-family: var(--font-display); font-size: clamp(1.3rem, 2.6vw, 1.75rem); font-weight: 600; color: var(--accent); font-variant-numeric: tabular-nums; }

/* ---------- form panel ---------- */
.auth__panel {
  background: var(--bg); padding: clamp(1.75rem, 4vw, 3.25rem) clamp(1rem, 4vw, 3rem);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.1rem;
}
.auth__card {
  width: 100%; max-width: 452px;
  background: var(--surface); border: 1px solid var(--line); border-radius: 22px;
  box-shadow: var(--shadow-lg); padding: clamp(1.25rem, 3vw, 1.9rem);
}
.card-head { margin-bottom: 1.5rem; }
.segmented {
  position: relative; display: grid; grid-template-columns: 1fr 1fr;
  padding: 4px; background: var(--bg); border: 1px solid var(--line); border-radius: 12px;
}
.segmented__thumb {
  position: absolute; top: 4px; left: 4px; z-index: 0;
  width: calc(50% - 4px); height: calc(100% - 8px);
  background: var(--ink); border-radius: 9px;
  transition: transform .32s var(--ease);
}
.segmented[data-active="signup"] .segmented__thumb { transform: translateX(100%); }
.segmented__btn {
  position: relative; z-index: 1; padding: .55rem .5rem;
  background: transparent; border: 0; border-radius: 9px; cursor: pointer;
  font-size: .88rem; font-weight: 700; color: var(--muted);
  transition: color .22s var(--ease);
}
.segmented__btn.is-active { color: #fff; }

.panel__title { font-size: 1.4rem; }
.panel__sub { font-size: .87rem; color: var(--muted); margin-top: .25rem; margin-bottom: 1.25rem; }

.form { display: grid; gap: 1rem; }
.field { display: grid; gap: .35rem; }
.field__top { display: flex; align-items: center; justify-content: space-between; gap: .75rem; }
.field__label { font-size: .78rem; font-weight: 700; color: var(--ink-2); }
.field__link { font-size: .78rem; font-weight: 600; color: var(--accent-2); }
.field__link:hover { text-decoration: underline; }
.input { position: relative; display: flex; align-items: center; }
.input__icon { position: absolute; left: .8rem; width: 17px; height: 17px; color: var(--muted); pointer-events: none; }
.input__el {
  width: 100%; padding: .78rem .9rem .78rem 2.6rem;
  font: inherit; font-size: .92rem; color: var(--text);
  background: var(--surface); border: 1px solid var(--line-2); border-radius: 10px;
  transition: border-color .18s var(--ease), box-shadow .18s var(--ease);
}
.input__el::placeholder { color: color-mix(in srgb, var(--muted) 72%, transparent); }
.input__el:focus { outline: none; border-color: var(--accent-2); box-shadow: 0 0 0 3px var(--accent-soft); }
.field.is-invalid .input__el { border-color: var(--danger); background: var(--danger-soft); }
.field.is-invalid .input__icon { color: var(--danger); }
.field.is-invalid .input__el:focus { box-shadow: 0 0 0 3px rgba(194, 50, 59, .14); }
.input__action {
  position: absolute; right: .45rem; display: grid; place-items: center;
  width: 32px; height: 32px; background: transparent; border: 0; border-radius: 8px; cursor: pointer;
  color: var(--muted);
  transition: color .18s var(--ease), background .18s var(--ease);
}
.input__action:hover { color: var(--accent-2); background: var(--accent-soft); }
.input__action .icon { width: 17px; height: 17px; grid-area: 1 / 1; }
.input__action .icon--eye-off { opacity: 0; transform: scale(.75); transition: opacity .18s var(--ease), transform .18s var(--ease); }
.input__action[aria-pressed="true"] .icon--eye { opacity: 0; transform: scale(.75); transition: opacity .18s var(--ease), transform .18s var(--ease); }
.input__action[aria-pressed="true"] .icon--eye-off { opacity: 1; transform: scale(1); }
.field__msg { font-size: .76rem; min-height: 1.05em; color: var(--danger); font-weight: 500; }
.field__hint { font-size: .75rem; color: var(--muted); }

.meter { margin-top: .35rem; }
.meter__track { display: block; height: 5px; border-radius: 999px; background: var(--line); overflow: hidden; }
.meter__fill {
  display: block; height: 100%; width: 0%; border-radius: inherit;
  background: var(--danger);
  transition: width .3s var(--ease), background .3s var(--ease);
}
.meter__fill[data-level="2"] { background: var(--warn); }
.meter__fill[data-level="3"] { background: #5a9c3d; }
.meter__fill[data-level="4"] { background: var(--ok); }

.check { display: flex; align-items: flex-start; gap: .6rem; cursor: pointer; font-size: .82rem; color: var(--ink-2); }
.check input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.check__box {
  display: grid; place-items: center; flex: none; width: 20px; height: 20px; margin-top: 1px;
  border: 1px solid var(--line-2); border-radius: 6px; background: var(--surface);
  transition: background .18s var(--ease), border-color .18s var(--ease);
}
.check__box .icon { width: 13px; height: 13px; color: #fff; opacity: 0; transform: scale(.6); transition: opacity .18s var(--ease), transform .18s var(--ease); }
.check input:checked + .check__box { background: var(--accent-2); border-color: var(--accent-2); }
.check input:checked + .check__box .icon { opacity: 1; transform: scale(1); }
.check input:focus-visible + .check__box { outline: 2px solid var(--accent-2); outline-offset: 2px; }
.form-status { font-size: .8rem; min-height: 1.15em; font-weight: 600; color: var(--muted); }
.form-status.is-ok { color: var(--ok); }
.form-status.is-bad { color: var(--danger); }

.or { display: flex; align-items: center; gap: .75rem; margin: 1.15rem 0 .9rem; }
.or__line { flex: 1; height: 1px; background: var(--line); }
.or__text { font-size: .74rem; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
.socials { display: grid; grid-template-columns: 1fr 1fr; gap: .55rem; }
.social {
  display: flex; align-items: center; justify-content: center; gap: .5rem;
  padding: .6rem .5rem; font-size: .84rem; font-weight: 600;
  background: var(--surface); border: 1px solid var(--line-2); border-radius: 10px; cursor: pointer;
  transition: border-color .18s var(--ease), transform .16s var(--ease), box-shadow .18s var(--ease), background .18s var(--ease);
}
.social:hover { border-color: var(--accent-2); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
.social:active { transform: translateY(0); }
.social .icon { width: 17px; height: 17px; }
.switch-line { margin-top: 1.15rem; text-align: center; font-size: .84rem; color: var(--muted); }
.linkish { background: none; border: 0; padding: 0; font-weight: 700; color: var(--accent-2); cursor: pointer; }
.linkish:hover { text-decoration: underline; }

/* ---------- success ---------- */
.success { display: grid; gap: .75rem; justify-items: center; text-align: center; padding-block: .5rem; animation: check-pop .45s var(--ease) both; }
.success[hidden] { display: none; }
.success__icon {
  position: relative;
  display: grid; place-items: center; width: 62px; height: 62px;
  border-radius: 50%; background: var(--accent-soft); color: var(--accent-2);
}
.success__icon .icon { width: 30px; height: 30px; }
.success__icon::after {
  content: ''; position: absolute; width: 62px; height: 62px; border-radius: 50%;
  border: 2px solid var(--accent); opacity: 0; animation: pulse-ring 2.6s var(--ease) 1s infinite;
}
.success__title { font-size: 1.35rem; }
.success__copy { font-size: .88rem; color: var(--muted); margin-bottom: .5rem; }
.auth__legal { font-size: .76rem; color: var(--muted); text-align: center; max-width: 452px; }
.auth__legal a { color: var(--accent-2); }
.auth__legal a:hover { text-decoration: underline; }

/* ---------- lower sections ---------- */
.section-head {
  display: flex; flex-wrap: wrap; gap: 1rem 2.5rem; align-items: end; justify-content: space-between;
  padding-bottom: 1.35rem; margin-bottom: 1.75rem; border-bottom: 1px solid var(--line);
}
.section-title { font-size: clamp(1.45rem, 3vw, 2.05rem); margin-top: .5rem; }
.section-note { font-size: .88rem; color: var(--muted); max-width: 42ch; }

.security { padding-block: clamp(3rem, 6vw, 4.75rem); background: var(--surface); border-top: 1px solid var(--line); }
.security__grid { display: grid; gap: 1.15rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); }
.card {
  display: grid; gap: .55rem; justify-items: start;
  padding: 1.4rem; border: 1px solid var(--line); border-radius: var(--radius-lg);
  background: var(--bg);
  transition: transform .26s var(--ease), border-color .26s var(--ease), box-shadow .26s var(--ease);
}
.card:hover { transform: translateY(-4px); border-color: var(--accent); box-shadow: var(--shadow); }
.card__icon {
  display: grid; place-items: center; width: 42px; height: 42px; margin-bottom: .25rem;
  border-radius: 11px; background: var(--accent-soft); color: var(--accent-2);
}
.card__icon .icon { width: 21px; height: 21px; }
.card__title { font-size: 1.05rem; }
.card__copy { font-size: .86rem; color: var(--muted); }

.logos { padding-block: clamp(2rem, 4vw, 3rem); background: var(--ink); color: color-mix(in srgb, #eaf5f3 74%, transparent); }
.logos__title { text-align: center; font-size: .74rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: color-mix(in srgb, #eaf5f3 48%, transparent); }
.logos__row {
  display: flex; flex-wrap: wrap; gap: clamp(1rem, 4vw, 3rem); justify-content: center; align-items: center;
  margin-top: 1.5rem;
}
.logos__row li {
  font-family: var(--font-display); font-size: clamp(.95rem, 2vw, 1.15rem); font-weight: 600;
  color: color-mix(in srgb, #eaf5f3 68%, transparent);
  transition: color .2s var(--ease), transform .2s var(--ease);
}
.logos__row li:hover { color: var(--accent); transform: translateY(-2px); }

.faq { padding-block: clamp(3rem, 6vw, 4.75rem); background: var(--surface); }
.faq__inner { max-width: 900px; }
.accordion { display: grid; gap: .6rem; }
.acc-item { border: 1px solid var(--line); border-radius: var(--radius); background: var(--bg); transition: border-color .22s var(--ease); }
.acc-item.is-open { border-color: var(--accent-2); background: var(--surface); box-shadow: var(--shadow-sm); }
.acc-item h3 { font-size: 1rem; }
.acc-btn {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  width: 100%; padding: 1rem 1.15rem; text-align: left;
  background: none; border: 0; border-radius: var(--radius); cursor: pointer;
  font-size: .98rem; font-weight: 700; color: var(--ink-2);
  transition: color .2s var(--ease);
}
.acc-btn:hover { color: var(--accent-2); }
.acc-chev { width: 18px; height: 18px; flex: none; color: var(--muted); transition: transform .3s var(--ease), color .2s var(--ease); }
.acc-btn[aria-expanded="true"] .acc-chev { transform: rotate(180deg); color: var(--accent-2); }
.acc-panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .34s var(--ease); }
.acc-item.is-open .acc-panel { grid-template-rows: 1fr; }
.acc-panel__inner { overflow: hidden; }
.acc-panel__inner p { padding: 0 1.15rem 1.1rem; font-size: .89rem; color: var(--muted); }

.foot { background: var(--ink); color: color-mix(in srgb, #eaf5f3 74%, transparent); padding-top: clamp(2.5rem, 5vw, 3.5rem); }
.foot__grid { display: grid; gap: 2rem; grid-template-columns: minmax(0, 1.3fr) repeat(4, minmax(0, 1fr)); }
.foot__brand { display: grid; gap: .8rem; align-content: start; }
.foot__brand .brand__mark { background: var(--accent); color: var(--ink); }
.foot__blurb { font-size: .84rem; max-width: 34ch; }
.foot__title { font-size: .72rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: var(--accent); margin-bottom: .75rem; }
.foot__col li + li { margin-top: .4rem; }
.foot__col a { font-size: .84rem; transition: color .18s var(--ease), padding-left .18s var(--ease); }
.foot__col a:hover { color: #fff; padding-left: 4px; }
.foot__legal {
  display: flex; flex-wrap: wrap; gap: .4rem 1.5rem; justify-content: space-between;
  margin-top: 2.25rem; padding-block: 1rem;
  border-top: 1px solid rgba(255,255,255,.12); font-size: .76rem;
}

.toast {
  position: fixed; left: 50%; bottom: 24px; z-index: 200;
  transform: translate(-50%, 20px); opacity: 0;
  background: var(--ink); color: #fff; font-size: .85rem; font-weight: 600;
  padding: .7rem 1.1rem; border-radius: 999px; box-shadow: var(--shadow-lg);
  transition: opacity .25s var(--ease), transform .25s var(--ease);
}
.toast[hidden] { display: none; }
.toast.is-shown { opacity: 1; transform: translate(-50%, 0); }

.is-shake { animation: shake .38s var(--ease); }

[data-reveal] { opacity: 0; transform: translateY(18px); }
[data-reveal].is-visible { opacity: 1; transform: none; transition: opacity .65s var(--ease), transform .65s var(--ease); transition-delay: var(--delay, 0s); }

@keyframes mesh-drift {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  33% { transform: translate3d(6%, -7%, 0) scale(1.12); }
  66% { transform: translate3d(-5%, 5%, 0) scale(.94); }
}
@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 45%, transparent); }
  70% { box-shadow: 0 0 0 10px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}
@keyframes check-pop { from { opacity: 0; transform: scale(.9) translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(5px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(2px); }
}

@media (max-width: 1080px) {
  .auth { grid-template-columns: minmax(0, 1fr); }
  .auth__brand { order: 2; }
  .auth__brand-inner { max-width: none; }
  .foot__grid { grid-template-columns: minmax(0, 1fr) repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 720px) {
  .topbar__nav { display: none; }
  .stat-row { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .6rem; }
  .socials { grid-template-columns: 1fr; }
  .foot__grid { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 420px) {
  .stat-row { grid-template-columns: 1fr; }
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0a1113;
    --surface: #111b1d;
    --ink: #eaf5f3;
    --ink-2: #cfe0dd;
    --text: #e6f0ee;
    --muted: #93a8a5;
    --line: #22312f;
    --line-2: #33453f;
    --accent: #2fd0b6;
    --accent-2: #43e3c8;
    --accent-soft: #12312c;
    --danger: #ff8189;
    --danger-soft: #33191b;
    --ok: #59d19b;
    --warn: #e5a44a;
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, .55);
    --shadow: 0 8px 22px -12px rgba(0, 0, 0, .8), 0 2px 6px rgba(0, 0, 0, .45);
    --shadow-lg: 0 32px 60px -30px rgba(0, 0, 0, .95), 0 8px 18px rgba(0, 0, 0, .55);
  }
  .brand__mark { background: var(--accent); color: #07201d; }
  .btn--primary { background: var(--accent); color: #062b26; }
  .btn--primary:hover { background: var(--accent-2); }
  .segmented__thumb { background: var(--accent); }
  .segmented__btn.is-active { color: #062b26; }
  .brand__name em { color: var(--accent); }
  .field__link, .linkish, .auth__legal a { color: var(--accent-2); }
  .toast { background: var(--accent); color: #062b26; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; }
  [data-reveal] { opacity: 1 !important; transform: none !important; }
  .mesh__blob { animation: none; }
}
`,
  javascript: `
'use strict';

var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[a-z]{2,}$/i;

function $(id) { return document.getElementById(id); }

/* ------------------------------------------------------------------ toast */
var toastTimer = null;
function toast(message) {
  var node = $('toast');
  if (!node) return;
  node.textContent = message;
  node.hidden = false;
  node.classList.add('is-shown');
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(function () {
    node.classList.remove('is-shown');
    window.setTimeout(function () { node.hidden = true; }, 300);
  }, 3200);
}

/* ------------------------------------------------------------------ reveal */
function initReveal() {
  var items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;
  if (reduce || !('IntersectionObserver' in window)) {
    for (var i = 0; i < items.length; i++) items[i].classList.add('is-visible');
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    for (var j = 0; j < entries.length; j++) {
      if (entries[j].isIntersecting) {
        entries[j].target.classList.add('is-visible');
        io.unobserve(entries[j].target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  for (var k = 0; k < items.length; k++) io.observe(items[k]);
}

/* --------------------------------------------------------------- counters */
function initCounters() {
  var nodes = document.querySelectorAll('[data-count]');
  if (!nodes.length) return;
  function render(node, value) {
    var decimals = parseInt(node.getAttribute('data-decimals') || '0', 10);
    node.textContent = value.toFixed(decimals);
  }
  if (reduce || !('IntersectionObserver' in window)) {
    for (var i = 0; i < nodes.length; i++) {
      render(nodes[i], parseFloat(nodes[i].getAttribute('data-count')) || 0);
    }
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    for (var j = 0; j < entries.length; j++) {
      if (!entries[j].isIntersecting) continue;
      var node = entries[j].target;
      io.unobserve(node);
      run(node);
    }
  }, { threshold: 0.5 });

  function run(node) {
    var target = parseFloat(node.getAttribute('data-count')) || 0;
    var decimals = parseInt(node.getAttribute('data-decimals') || '0', 10);
    var start = performance.now();
    var dur = 1400;
    function frame(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      render(node, target * eased);
      if (t < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }
  for (var k = 0; k < nodes.length; k++) io.observe(nodes[k]);
}

/* ------------------------------------------------------- segmented control */
function initTabs() {
  var wrap = document.querySelector('.segmented');
  var loginTab = $('tab-login');
  var signupTab = $('tab-signup');
  var loginPanel = $('panel-login');
  var signupPanel = $('panel-signup');
  if (!wrap || !loginTab || !signupTab || !loginPanel || !signupPanel) return;

  var buttons = [loginTab, signupTab];
  var panels = { login: loginPanel, signup: signupPanel };

  function select(name, focus) {
    wrap.setAttribute('data-active', name);
    panels.login.hidden = name !== 'login';
    panels.signup.hidden = name !== 'signup';
    for (var i = 0; i < buttons.length; i++) {
      var on = buttons[i].getAttribute('id') === 'tab-' + name;
      buttons[i].classList.toggle('is-active', on);
      buttons[i].setAttribute('aria-selected', on ? 'true' : 'false');
      buttons[i].setAttribute('tabindex', on ? '0' : '-1');
      if (on && focus) buttons[i].focus();
    }
  }

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
      select(this.getAttribute('id') === 'tab-login' ? 'login' : 'signup', false);
    });
  }

  wrap.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    select(wrap.getAttribute('data-active') === 'login' ? 'signup' : 'login', true);
  });

  var switches = document.querySelectorAll('[data-switch]');
  for (var s = 0; s < switches.length; s++) {
    switches[s].addEventListener('click', function () {
      var target = this.getAttribute('data-switch');
      select(target, false);
      var panel = panels[target];
      var first = panel ? panel.querySelector('input') : null;
      if (first) first.focus();
    });
  }

  select('login', false);
}

/* ------------------------------------------------------ password revealing */
function initToggles() {
  var buttons = document.querySelectorAll('[data-toggle]');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
      var input = $(this.getAttribute('data-toggle'));
      if (!input) return;
      var shown = this.getAttribute('aria-pressed') === 'true';
      this.setAttribute('aria-pressed', shown ? 'false' : 'true');
      this.setAttribute('aria-label', shown ? 'Show password' : 'Hide password');
      input.type = shown ? 'password' : 'text';
      input.focus();
    });
  }
}

/* ------------------------------------------------------------- validation */
function setField(input, message) {
  if (!input) return;
  var wrap = input.closest ? input.closest('.field') : null;
  var msg = null;
  if (wrap) {
    msg = wrap.querySelector('.field__msg');
  }
  if (wrap) wrap.classList.toggle('is-invalid', !!message);
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (msg) msg.textContent = message || '';
}

function shake(node) {
  if (reduce || !node) return;
  node.classList.remove('is-shake');
  void node.offsetWidth;
  node.classList.add('is-shake');
}

function passwordScore(value) {
  if (!value) return 0;
  var score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;
  return Math.min(4, score);
}

function initStrength() {
  var input = $('signupPassword');
  var fill = $('strengthFill');
  var label = $('strengthLabel');
  if (!input || !fill || !label) return;
  var words = ['Too short', 'Weak', 'Fair', 'Strong', 'Excellent'];
  var hints = [
    'Use 8+ characters with a number and a symbol.',
    'Add a capital letter to strengthen it.',
    'Longer passphrases beat short passwords.',
    'Add a symbol to reach excellent.',
    'Excellent. Store it in a password manager.'
  ];
  function update() {
    var score = passwordScore(input.value);
    var pct = (score / 4) * 100;
    fill.style.width = (input.value ? Math.max(8, pct) : 0) + '%';
    fill.setAttribute('data-level', String(score));
    label.textContent = input.value ? words[score] + ' — ' + hints[score] : hints[0];
  }
  input.addEventListener('input', update);
  update();
}

function initLoginForm() {
  var form = $('loginForm');
  if (!form) return;
  var email = $('loginEmail');
  var password = $('loginPassword');
  var status = $('loginStatus');
  var successPanel = $('successPanel');
  var loginPanel = $('panel-login');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var em = email ? email.value.trim() : '';
    var pw = password ? password.value : '';
    var bad = false;

    if (!em) { setField(email, 'An email address is required.'); bad = true; }
    else if (!EMAIL_RE.test(em)) { setField(email, 'Use the format name@company.com'); bad = true; }
    else { setField(email, ''); }

    if (!pw) { setField(password, 'Your password is required.'); bad = true; }
    else if (pw.length < 8) { setField(password, 'Passwords are at least 8 characters.'); bad = true; }
    else { setField(password, ''); }

    if (bad) {
      shake(form);
      if (status) { status.className = 'form-status is-bad'; status.textContent = 'Check the highlighted fields.'; }
      return;
    }

    if (status) { status.className = 'form-status is-ok'; status.textContent = 'Verifying against the vault...'; }
    if (successPanel && loginPanel) {
      var copy = $('successCopy');
      if (copy) copy.textContent = 'Signed in as ' + em + '. A new device record was written to your audit log.';
      window.setTimeout(function () {
        loginPanel.hidden = true;
        successPanel.hidden = false;
        var title = $('successTitle');
        if (title) title.focus && title.focus();
      }, reduce ? 0 : 550);
    }
  });

  var live = [email, password];
  for (var i = 0; i < live.length; i++) {
    live[i].addEventListener('blur', function () {
      if (!this.value.trim()) return;
      if (this.type === 'email' && !EMAIL_RE.test(this.value.trim())) {
        setField(this, 'Use the format name@company.com');
      } else {
        setField(this, '');
      }
    });
  }
}

function initSignupForm() {
  var form = $('signupForm');
  if (!form) return;
  var name = $('signupName');
  var email = $('signupEmail');
  var password = $('signupPassword');
  var confirm = $('signupConfirm');
  var terms = $('signupTerms');
  var termsMsg = $('signupTermsMsg');
  var status = $('signupStatus');
  var successPanel = $('successPanel');
  var signupPanel = $('panel-signup');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nm = name ? name.value.trim() : '';
    var em = email ? email.value.trim() : '';
    var pw = password ? password.value : '';
    var cf = confirm ? confirm.value : '';
    var agreed = terms ? terms.checked : false;
    var bad = false;

    if (!nm) { setField(name, 'Tell us your name.'); bad = true; }
    else if (nm.length < 2) { setField(name, 'That name is too short.'); bad = true; }
    else { setField(name, ''); }

    if (!em) { setField(email, 'An email address is required.'); bad = true; }
    else if (!EMAIL_RE.test(em)) { setField(email, 'Use the format name@company.com'); bad = true; }
    else { setField(email, ''); }

    if (!pw) { setField(password, 'Choose a password.'); bad = true; }
    else if (pw.length < 8) { setField(password, 'Use at least 8 characters.'); bad = true; }
    else if (!/[0-9]/.test(pw)) { setField(password, 'Include at least one number.'); bad = true; }
    else if (!/[^A-Za-z0-9]/.test(pw)) { setField(password, 'Include at least one symbol.'); bad = true; }
    else { setField(password, ''); }

    if (!cf) { setField(confirm, 'Repeat your password.'); bad = true; }
    else if (cf !== pw) { setField(confirm, 'The two passwords do not match.'); bad = true; }
    else { setField(confirm, ''); }

    if (termsMsg) termsMsg.textContent = agreed ? '' : 'Please accept the terms to continue.';
    if (!agreed) bad = true;

    if (bad) {
      shake(form);
      if (status) { status.className = 'form-status is-bad'; status.textContent = 'A few details still need attention.'; }
      return;
    }

    if (status) { status.className = 'form-status is-ok'; status.textContent = 'Creating your workspace...'; }
    if (successPanel && signupPanel) {
      var copy = $('successCopy');
      var title = $('successTitle');
      if (title) title.textContent = 'Workspace reserved';
      if (copy) copy.textContent = 'We sent a verification link to ' + em + '. It expires in 15 minutes.';
      window.setTimeout(function () {
        signupPanel.hidden = true;
        successPanel.hidden = false;
        form.reset();
      }, reduce ? 0 : 550);
    }
  });

  if (terms) {
    terms.addEventListener('change', function () {
      if (termsMsg) termsMsg.textContent = this.checked ? '' : 'Please accept the terms to continue.';
    });
  }
}

function initSocial() {
  var buttons = document.querySelectorAll('[data-social]');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
      toast('Redirecting to ' + this.getAttribute('data-social') + '…');
    });
  }
}

function initSuccessActions() {
  var done = $('successDone');
  var reset = $('successReset');
  var successPanel = $('successPanel');
  var title = $('successTitle');
  var copy = $('successCopy');
  if (done) done.addEventListener('click', function () { toast('Opening your workspace…'); });
  if (reset) {
    reset.addEventListener('click', function () {
      if (!successPanel) return;
      var loginPanel = $('panel-login');
      var signupPanel = $('panel-signup');
      if (loginPanel) loginPanel.hidden = false;
      if (signupPanel) signupPanel.hidden = true;
      successPanel.hidden = true;
      if (title) title.textContent = 'You are verified';
      if (copy) copy.textContent = 'A magic link is on its way to your inbox. It expires in 15 minutes.';
      var email = $('loginEmail');
      if (email) email.focus();
    });
  }
}

/* ------------------------------------------------------------- accordion */
function initAccordion() {
  var buttons = document.querySelectorAll('.acc-btn');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
      var item = this.closest ? this.closest('.acc-item') : null;
      if (!item) return;
      var open = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', open ? 'false' : 'true');
      item.classList.toggle('is-open', !open);
    });
  }
}

initReveal();
initCounters();
initTabs();
initToggles();
initStrength();
initLoginForm();
initSignupForm();
initSocial();
initSuccessActions();
initAccordion();
`,
};