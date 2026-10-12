#!/usr/bin/env node
/**
 * GB Coder — Same-Origin Migration Test Server
 *
 * Provides a reliable, same-origin HTTP server on port 4179 to test
 * Service Worker migration between OLD and NEW production artifacts.
 *
 * Features:
 * - Dynamic path resolution relative to repository root (no hardcoded Windows paths)
 * - Atomic mode switching between 'old' and 'new' builds
 * - Exact COOP/COEP headers matching production specifications
 * - No-cache headers for Service Worker and manifest files
 * - SPA fallback routing for both builds
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureLegacyDist } from './setup-legacy.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

export const DEFAULT_PORT = 4179;
export const OLD_DIST = path.resolve(REPO_ROOT, 'node_modules/.cache/dist-legacy');
export const NEW_DIST = path.resolve(REPO_ROOT, 'dist');

let activeMode = 'old'; // 'old' | 'new'

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function serveFile(res, filePath, statusCode = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(statusCode, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
}

export function createMigrationServer(port = DEFAULT_PORT) {
  const server = http.createServer((req, res) => {
    const urlObj = new URL(req.url, `http://${req.headers.host || `localhost:${port}`}`);
    const pathname = decodeURIComponent(urlObj.pathname);

    // Control API for automated test orchestration
    if (pathname === '/__control/switch') {
      const targetMode = urlObj.searchParams.get('mode') || 'new';
      activeMode = targetMode;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', activeMode }));
      return;
    }

    if (pathname === '/__control/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        activeMode,
        oldDist: OLD_DIST,
        newDist: NEW_DIST,
        oldExists: fs.existsSync(OLD_DIST),
        newExists: fs.existsSync(NEW_DIST),
      }));
      return;
    }

    // Apply Headers based on mode and path
    if (activeMode === 'old') {
      // Old build: Global COOP/COEP
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    } else {
      // New build: Scoped COOP/COEP for /app, /ide, /preview
      if (pathname.startsWith('/app') || pathname.startsWith('/ide') || pathname.startsWith('/preview')) {
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      }
    }

    // Service Worker and manifest cache-control: MUST be no-cache for update checks
    if (pathname === '/sw.js' || pathname === '/app/sw.js' || pathname.endsWith('manifest.webmanifest')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (pathname.endsWith('.html') || pathname === '/') {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (pathname.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }

    // File resolution
    if (activeMode === 'old') {
      // Mode: OLD (Root Vite SPA)
      let filePath = path.join(OLD_DIST, pathname === '/' ? 'index.html' : pathname.replace(/^\//, ''));
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        serveFile(res, filePath);
        return;
      }

      // SPA fallback: if not an asset request, serve index.html
      const ext = path.extname(pathname);
      if (!ext || ext === '.html') {
        const indexPath = path.join(OLD_DIST, 'index.html');
        if (fs.existsSync(indexPath)) {
          serveFile(res, indexPath);
          return;
        }
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found (Old Mode)');
      return;
    }

    // Mode: NEW (Astro at /, React at /app/)
    // 1. Direct static file match in NEW_DIST
    let directFilePath = path.join(NEW_DIST, pathname.replace(/^\//, ''));
    if (fs.existsSync(directFilePath) && fs.statSync(directFilePath).isFile()) {
      serveFile(res, directFilePath);
      return;
    }

    // 2. Exact root '/' or '/index.html' -> Astro marketing
    if (pathname === '/' || pathname === '/index.html') {
      const astroIndex = path.join(NEW_DIST, 'index.html');
      if (fs.existsSync(astroIndex)) {
        serveFile(res, astroIndex);
        return;
      }
    }

    // 3. /app, /app/, /app/*, /ide, /preview/* -> Vite React IDE SPA fallback
    if (pathname === '/app' || pathname === '/app/' || pathname.startsWith('/app/') || pathname === '/ide' || pathname.startsWith('/preview/')) {
      const appIndex = path.join(NEW_DIST, 'app', 'index.html');
      if (fs.existsSync(appIndex)) {
        serveFile(res, appIndex);
        return;
      }
    }

    // 4. Marketing 404
    const notFoundPath = path.join(NEW_DIST, '404.html');
    if (fs.existsSync(notFoundPath)) {
      serveFile(res, notFoundPath, 404);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });

  return server;
}

// CLI execution
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await ensureLegacyDist();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : DEFAULT_PORT;
  const server = createMigrationServer(port);

  server.listen(port, '127.0.0.1', () => {
    console.log(`Same-origin migration test server listening on http://localhost:${port}`);
    console.log(`Initial mode: ${activeMode}`);
    console.log(`Old dist directory: ${OLD_DIST} (exists: ${fs.existsSync(OLD_DIST)})`);
    console.log(`New dist directory: ${NEW_DIST} (exists: ${fs.existsSync(NEW_DIST)})`);
  });

  process.on('SIGTERM', () => {
    server.close();
    process.exit(0);
  });
  process.on('SIGINT', () => {
    server.close();
    process.exit(0);
  });
}
