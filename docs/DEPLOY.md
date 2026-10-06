# Deployment

## Stack

Vercel, deploying a Vite SPA plus Vercel serverless functions. The build is
`npm run build` (aliased as `vercel-build`) and the output directory is `dist`.

## vercel.json is strict JSON

**This is the single most common cause of a deploy failing immediately with
"Invalid vercel.json file provided".**

`vercel.json` is parsed as **JSON, not JSONC**. Neither `// …` nor `/* … */`
comments are permitted, and neither are trailing commas. A comment that looks
perfectly reasonable — and that `vite build` and `tsc` never even read — will pass
every local check and then fail the deploy with an error that does not name the
file, the line, or the offending character.

If you want to explain a decision in this file, put it here instead.

Run `npm run verify:deploy` before deploying. It performs the same strict parse
Vercel does, plus checks that every `functions` key points at a file that exists
and that the `/(.*)` catch-all rewrite is still last.

```bash
npm run verify:deploy    # config, function count, route/file cross-checks
npm run audit:tests      # service test suite
npm run audit:devserver  # boots Vite, verifies the traversal + secret boundaries
npm run lint
npm run build
```

## Functions and `maxDuration`

| Function | `maxDuration` | Why |
| --- | --- | --- |
| `api/ai.js` | 120s | Multi-step generate/fix/chat, up to 16k output tokens, may make two upstream calls per request. |
| `api/vision-to-code.js` | 120s | Screenshot → code. The upstream deadline is 90s so the error path can still respond inside this window. |
| `api/ai/inline-completion.js` | 30s | Ghost-text suggestion fired from a typing loop, so a slow response is worthless. Upstream deadline is 15s. |

The 120s values **require a Pro or Enterprise plan**; on Hobby the ceiling is 60s
and Vercel will reject the build. Lower them to 60 if the project is on Hobby.

Every key under `functions` must match a real file. Vercel fails the build on a
pattern that matches nothing.

## Function count is capped at 12 on Hobby

**This is the second most common cause of a deploy failing *after* a successful
build.** Vercel builds one serverless function per `.js` file under `api/`,
ignoring any file or directory whose name starts with `_`. Hobby allows **12**.

Exceeding it produces a particularly confusing failure: the build completes, Vercel
reports `Build Completed in /vercel/output`, and the deploy then dies during
`Deploying outputs...` — with nothing in the log mentioning a count, and nothing
pointing at `api/`.

Current count is **12/12**. There is no headroom: adding a route to `api/` without
removing or consolidating another will break the deploy. `npm run verify:deploy`
prints the count and fails above 12.

### Development-only handlers belong in `dev-api/`

Two handlers used to sit in `api/`, where merely existing publishes them as live
functions:

| Handler | Why it must not be deployed |
| --- | --- |
| `test-redis` | Wrote to Redis on every hit and returned the driver's raw `error.message`, which can name the endpoint and account. It already returned 404 in production, but still consumed a slot. |
| `preview/lan-info` | `os.networkInterfaces()` inside a serverless function describes *that function's* sandbox, never the developer's laptop. Every deployed call returned a constant "no LAN address available". |

Both now live in `dev-api/`, which Vercel does not deploy. Both dev servers
(`vite.config.ts` and `server/index.js`) resolve `api/` first and fall back to
`dev-api/`, re-applying the traversal gate per directory.

`dev-api/package.json` declares `"type": "commonjs"`, matching `api/package.json`.
Without it the root `"type": "module"` applies and every handler there fails to load
with `require is not defined in ES module scope`.

`fetchLanInfo` treats a 404 from `lan-info` as "no LAN available" and falls back to
cloud mode, so removing the deployed route changed no user-visible behaviour.

## Rewrites

```json
{ "source": "/api/(.*)",     "destination": "/api/$1" },
{ "source": "/preview/(.*)",  "destination": "/index.html" },
{ "source": "/mpreview/(.*)", "destination": "/index.html" },
{ "source": "/(.*)",          "destination": "/index.html" }
```

The first is effectively a no-op that keeps `/api/*` resolving to the function
rather than being swallowed by the SPA catch-all.

`/mpreview/*` is the QR mobile-preview page. It is not strictly required — the
catch-all would serve `index.html` for it too — but it is stated explicitly
because the session id in the path is what the client reads back out of
`window.location`, and an implicit match would be one refactor away from silently
breaking it.

**The `/(.*)` catch-all must stay last.** Anything after it is unreachable, and
Vercel will not warn you. `verify:deploy` asserts this.

## API routes are dispatched by a file-name allowlist

`vite.config.ts` (for `npm run dev`) and `server/index.js` (for the standalone
server) both map a request path onto a `.js` file in `api/` and `require()` it as
the handler.

The route is validated against `/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/` before it
reaches the filesystem, then the resolved path is confirmed to sit inside `api/`.
This is a security boundary, not input tidiness: dots are excluded from the
character class, so no combination of accepted segments can produce a path outside
`api/`. Node does not normalise the URL before a middleware sees it, so
`GET /api/../server/index` would otherwise `require()` and execute that file.

If you add a route, it must match that pattern — lowercase letters, digits,
underscore and hyphen, optionally nested with `/`.

## Environment variables

Set in the Vercel project settings. `.env` is gitignored and must stay that way.

| Variable | Used by |
| --- | --- |
| `GEMINI_API_KEY` | `api/ai.js`, `api/vision-to-code.js`, `api/ai/inline-completion.js` |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | `api/share.js`, `api/preview/sync.js`; locally also `dev-api/test-redis.js` |
| `E2B_API_KEY` (optional) | `api/sandbox/*` proxy |
| `TERMINAL_TOKEN` | `server/index.js` WebSocket terminal |

A key in the request body overrides the environment variable, so a user can supply
their own. Body-wins is deliberate: it means a stale deploy-time key does not
break the feature.

**Never prefix an API key with `VITE_`.** Vite inlines those into the client
bundle at build time, which publishes the key to every visitor. `aiChatAssistant`
and `codeRabbitService` read `VITE_GEMINI_API_KEY` as a development convenience —
that path is for local work only.

## Local development

```bash
npm run dev:all     # Vite on :5173 plus the API server on :3001
npm run dev         # Vite only — the api/ handlers still work via the Vite middleware
```

The dev server binds every interface so a phone on the same Wi-Fi can load the app
for the QR preview. That means `/api/*` is LAN-reachable, so the Vite middleware
**only serves `/api/*` to loopback peers** — a phone gets the static app and never
touches the paid endpoints. `server/index.js` binds `127.0.0.1` for the same
reason.

## Post-deploy checklist

1. `npm run verify:deploy` passes locally.
2. `/api/health` returns 200 — confirms the functions deployed and the key is present.
3. Deploy **Preview** first, not Production. Preview gives a URL to test the
   serverless functions against without touching the production domain.
4. If a function times out, check the plan's `maxDuration` ceiling before assuming
   the code is slow.
