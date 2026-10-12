#!/usr/bin/env node
/**
 * Combined Preview Server for GB Coder — Phase 1 POC
 *
 * Simulates Vercel production routing locally for both Astro and Vite:
 * - Serves Astro marketing website at '/' and '/_astro/*'
 * - Serves Vite React IDE at '/app', '/app/*', and '/app/assets/*'
 * - Serves API endpoints under '/api/*' using local handlers (e.g. /api/health)
 * - Serves legacy preview routes ('/preview/*', '/mpreview/*', '/preview-popout', '/ide')
 * - Serves root Migration Service Worker at '/sw.js'
 * - Serves marketing 404 for unknown marketing paths
 * - Enforces COOP: same-origin and COEP: require-corp security headers
 *
 * Usage:
 *   node scripts/preview-combined.mjs [--port 4175]
 */

import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT_DIR = process.cwd();
const DIST = join(ROOT_DIR, 'dist');
const API_DIR = join(ROOT_DIR, 'api');

const portArg = process.argv.find((a) => a.startsWith('--port='));
const PORT = portArg ? Number.parseInt(portArg.split('=')[1], 10) : 4175;

if (!existsSync(DIST)) {
  console.error(`Error: ${DIST} does not exist. Run 'npm run build' first.`);
  process.exit(1);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(urlObj.pathname);

  // Set Security Headers matching Vercel vercel.json configuration
  // Scoped to IDE and WebContainer execution environments
  const isIsolatedRoute =
    pathname === '/app' ||
    pathname === '/app/' ||
    pathname.startsWith('/app/') ||
    pathname === '/ide' ||
    pathname === '/ide/' ||
    pathname.startsWith('/preview-popout');

  if (isIsolatedRoute) {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  }

  // 1. API Route Handling (/api/*)
  if (pathname.startsWith('/api/')) {
    const route = pathname.replace(/^\/api\//, '').replace(/\/$/, '');
    const candidateFile = join(API_DIR, `${route}.js`);

    if (existsSync(candidateFile) && candidateFile.startsWith(API_DIR)) {
      try {
        const handler = require(candidateFile);
        const fn = typeof handler === 'function' ? handler : handler.default || handler;

        const apiRes = {
          statusCode: 200,
          setHeader: (k, v) => res.setHeader(k, v),
          status: function (code) {
            this.statusCode = code;
            res.statusCode = code;
            return this;
          },
          json: function (data) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = this.statusCode || 200;
            res.end(JSON.stringify(data));
          },
          send: function (data) {
            res.statusCode = this.statusCode || 200;
            res.end(typeof data === 'string' ? data : JSON.stringify(data));
          },
          end: (c) => res.end(c),
        };

        const apiReq = {
          method: req.method,
          url: req.url,
          query: Object.fromEntries(urlObj.searchParams.entries()),
          headers: req.headers,
        };

        await fn(apiReq, apiRes);
        return;
      } catch (err) {
        console.error(`API Error on ${pathname}:`, err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
        return;
      }
    }
  }

  // 2. Direct Static File Check in dist/
  const staticPath = join(DIST, pathname.replace(/^\//, ''));
  if (existsSync(staticPath) && statSync(staticPath).isFile()) {
    const ext = extname(staticPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.end(readFileSync(staticPath));
    return;
  }

  // 3. Exact Root Route (/) -> Astro Homepage
  if (pathname === '/' || pathname === '') {
    const astroHtml = join(DIST, 'index.html');
    if (existsSync(astroHtml)) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(readFileSync(astroHtml));
      return;
    }
  }

  // 4. Legacy Routes & IDE Subpath Rewrites to dist/app/index.html
  const isAppRoute =
    pathname === '/app' ||
    pathname === '/app/' ||
    pathname.startsWith('/app/') ||
    pathname === '/ide' ||
    pathname === '/ide/' ||
    pathname.startsWith('/preview/') ||
    pathname.startsWith('/mpreview/') ||
    pathname.startsWith('/preview-popout');

  if (isAppRoute) {
    const appHtml = join(DIST, 'app', 'index.html');
    if (existsSync(appHtml)) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(readFileSync(appHtml));
      return;
    }
  }

  // 5. Marketing 404 Route for unknown marketing paths
  const marketing404 = join(DIST, '404.html');
  if (existsSync(marketing404)) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(readFileSync(marketing404));
    return;
  }

  res.statusCode = 404;
  res.end('Not Found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\nCombined Preview Server running at: http://localhost:${PORT}`);
  console.log(`  - Marketing Homepage: http://localhost:${PORT}/`);
  console.log(`  - React IDE:          http://localhost:${PORT}/app`);
  console.log(`  - Advanced IDE:       http://localhost:${PORT}/app/ide`);
  console.log(`  - API Health:         http://localhost:${PORT}/api/health\n`);
});

// Graceful termination support
process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
