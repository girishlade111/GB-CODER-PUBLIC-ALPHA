# Shared HTTP status screens

`StatusPage.tsx` is the only page UI. `status-config.ts` contains all 35 requested codes, five class defaults, CTA definitions, illustration variants and accent roles. Add one `entry(code, reason, title, message, hint, optionalPrimaryCta)` to `STATUS_CONFIG`; the sorted gallery and server document generation update automatically. Unknown codes retain their number and use their class's generic copy. Invalid codes fall back to 500.

## Use

```tsx
<StatusPage code={404} />
<StatusPage code={401} loginHref="/your-real-login-route" />
<StatusPage code={429} retryAfterSeconds={30} />
<StatusPage code={302} redirect={{ href: '/docs', seconds: 8 }} />
<StatusPage code={503} autoRetry={{ seconds: 10, maxAttempts: 3 }} />
```

Redirects and automatic retries are off unless explicitly supplied. Redirect targets must be local absolute paths; external, protocol-relative, script and control-character URLs are rejected. The manual Go now action remains available after cancellation. Rate-limit timers unlock Retry without an automatic request. Server auto-retries use exponential backoff, persist the attempt count in sessionStorage, cap attempts at three by default, and stop safely if storage is unavailable. Manual Retry clears the counter. Timers use aria-live; reduced motion disables visual effects without disabling recovery controls. React unmount clears listeners, timers and owned metadata. Static Astro renders the component without React hydration and uses the same small `status-client.ts` controller.

401 uses Contact for sign-in help, as requested, because this app currently has no account sign-in route. Pass `loginHref` when one exists. 403 offers Go back and Contact. Retry screens also retain a Go to Home link. The React boundary preserves its emergency backup export and shows collapsed developer details only in development. Production screen props and markup never contain a stack trace.

## Preview

Run `npm run dev:marketing`, then open `/__status` or `/__status/418` on the Astro port (4321 by default). The gallery groups codes by class and provides a live code/theme switcher. `?theme=dark`, `?theme=light`, and `?timer=on` demonstrate the variants and opt-in timers. The gallery returns HTTP 200 for demonstrations of every class, including 1xx, 2xx and 3xx. These are screen designs, not real informational or redirect responses.

`/__status/throw` deliberately throws during dev SSR; middleware catches it and renders the shared 500 with HTTP 500. `/__status/error/429` exercises a real 429 with Retry-After. All gallery, demonstration and throw routes are injected only for the dev command. They do not exist in a production build or sitemap.

## Server responses and static hosting

Astro remains static. `404.astro` renders `StatusDocument.astro`, which wraps StatusPage and supplies metadata. The host serves this document with HTTP 404 for unknown marketing URLs; there is no catch-all 200 rewrite.

During the marketing build, the integration renders 4xx/5xx documents only, packs them into ignored `api/_lib/status-pages.generated.cjs`, and removes the temporary `_status-documents` directory from public output. No informational, success, redirect, preview or stack-trace artifacts are shipped. Rebuild marketing whenever config/UI changes. `api/_lib/status-response.cjs` sends these generated documents with real error statuses, noindex and no-store. Unknown server error codes normalize to the corresponding generic 400/500 response and document. All shipped asset URLs still resolve through the marketing `_astro` assets in the combined build.

The existing preview API negotiates HTML errors for browser document requests; JSON consumers retain their existing contracts. The standalone Node API dispatcher, Vite API dev hook and combined production-preview server use the shared 500 for uncaught browser-request failures. There is no additional Vercel function. Platform-generated failures outside our handlers (for example, an edge outage) remain controlled by the hosting platform. A client-side React boundary cannot alter an HTTP status that was already sent; it displays a 500 recovery state and sets noindex instead. The existing unknown-app route behavior is preserved.

## Theme and validation

Scoped light tokens copy the existing marketing palette; dark roles reuse its existing dark-code surfaces and text shades. No new color or font is introduced. Scoping is intentional: the IDE's unrelated global variables cannot recolor a failure screen, and the screen cannot retheme the IDE. The icon geometry comes from the existing marketing registry. All animations change transform/opacity only.

Run `npm run lint`, `npm run typecheck`, `npm run build`, then `node scripts/verify-status-pages.mjs`. For the browser matrix, run the Astro dev server and `node scripts/verify-status-pages.mjs --browser` (`STATUS_DEV_URL` overrides the default test URL `http://127.0.0.1:4330`). The tests cover class fallbacks, unsafe redirects, real HTTP 404/500, all 20 server templates, JSON preservation, production gallery exclusion, all 35 gallery codes, light/dark at 360/768/1280, reduced motion, keyboard focus, switcher controls, cancellation, rate-limit unlock and bounded retry backoff. Local review captures live under `apps/marketing/.impeccable/review/status/` and are ignored.
