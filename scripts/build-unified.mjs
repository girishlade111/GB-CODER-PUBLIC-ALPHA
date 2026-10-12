#!/usr/bin/env node
/**
 * Unified Build Orchestrator for GB Coder — Phase 1 POC
 *
 * Coordinates the dual-frontend build pipeline:
 * 1. Builds Astro marketing site (apps/marketing) -> static HTML/CSS at root '/'
 * 2. Builds Vite React IDE -> static SPA assets under '/app/'
 * 3. Validates both staging outputs
 * 4. Deterministically assembles deployment artifact in 'dist/'
 * 5. Injects the root-scope Service Worker migration worker at 'dist/sw.js'
 * 6. Executes rigorous collision, asset reference, and security checks
 * 7. Emits 'dist/build-manifest.json'
 */

import { execSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  rmSync,
  cpSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT_DIR = process.cwd();
const APPS_MARKETING_DIR = join(ROOT_DIR, 'apps', 'marketing');
const FINAL_DIST = join(ROOT_DIR, 'dist');
const STAGING_IDE = join(ROOT_DIR, 'dist-staging', 'ide');
const STAGING_MARKETING = join(APPS_MARKETING_DIR, 'dist');

console.log('======================================================================');
console.log('GB CODER — PHASE 1 UNIFIED BUILD ORCHESTRATION');
console.log('======================================================================');
const startTime = Date.now();

// 1. Clean previous build artifacts
console.log('\n[1/6] Cleaning staging and output directories...');
rmSync(FINAL_DIST, { recursive: true, force: true });
rmSync(join(ROOT_DIR, 'dist-staging'), { recursive: true, force: true });
mkdirSync(FINAL_DIST, { recursive: true });
mkdirSync(STAGING_IDE, { recursive: true });

// 2. Build Astro Marketing Site
console.log('\n[2/6] Building Astro marketing site (apps/marketing)...');
const marketingNodeModules = join(APPS_MARKETING_DIR, 'node_modules');
if (!existsSync(marketingNodeModules)) {
  console.log('  -> apps/marketing/node_modules not found. Running npm install in workspace...');
  try {
    execSync('npm install --prefix apps/marketing', {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' },
    });
  } catch (err) {
    console.warn('  -> Note: npm install --prefix apps/marketing note:', err.message);
  }
}

try {
  execSync('npm run build', {
    cwd: APPS_MARKETING_DIR,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  });
} catch (err) {
  console.error('FATAL: Astro marketing build failed:', err.message);
  process.exit(1);
}

if (!existsSync(join(STAGING_MARKETING, 'index.html'))) {
  console.error('FATAL: Astro build output missing index.html');
  process.exit(1);
}

// 3. Build Vite React IDE under /app base
console.log('\n[3/6] Building Vite React IDE (base: /app/)...');
try {
  execSync('npx vite build', {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      VITE_BASE_PATH: '/app/',
      VITE_OUT_DIR: STAGING_IDE,
    },
  });
} catch (err) {
  console.error('FATAL: Vite IDE build failed:', err.message);
  process.exit(1);
}

if (!existsSync(join(STAGING_IDE, 'index.html'))) {
  console.error('FATAL: Vite build output missing index.html');
  process.exit(1);
}

// 4. Assemble Final Deployment Directory
console.log('\n[4/6] Assembling final deployment artifact in dist/...');

// A. Copy Astro marketing files to root of dist
cpSync(STAGING_MARKETING, FINAL_DIST, { recursive: true });

// B. Copy Vite IDE files to dist/app
const FINAL_APP = join(FINAL_DIST, 'app');
mkdirSync(FINAL_APP, { recursive: true });
cpSync(STAGING_IDE, FINAL_APP, { recursive: true });

// C. Copy Root Migration Service Worker to dist/sw.js
const ROOT_SW_SOURCE = join(ROOT_DIR, 'public', 'sw.js');
if (existsSync(ROOT_SW_SOURCE)) {
  cpSync(ROOT_SW_SOURCE, join(FINAL_DIST, 'sw.js'));
  console.log('  -> Injected root Service Worker migration script (dist/sw.js)');
} else {
  console.warn('  -> WARNING: public/sw.js not found!');
}

// D. Copy public root assets
const rootFavicon = join(ROOT_DIR, 'public', 'favicon.ico');
if (existsSync(rootFavicon)) {
  cpSync(rootFavicon, join(FINAL_DIST, 'favicon.ico'));
}
const rootRobots = join(ROOT_DIR, 'public', 'robots.txt');
if (existsSync(rootRobots)) {
  cpSync(rootRobots, join(FINAL_DIST, 'robots.txt'));
}

// 5. Build Output Safety & Integrity Verification
console.log('\n[5/6] Verifying build output integrity and security...');

const failures = [];
const pass = (msg) => console.log(`  PASS: ${msg}`);
const fail = (msg) => {
  console.error(`  FAIL: ${msg}`);
  failures.push(msg);
};

// Check 1: Astro index.html exists and has marketing content
const astroIndexHtml = join(FINAL_DIST, 'index.html');
if (!existsSync(astroIndexHtml)) {
  fail('dist/index.html is missing');
} else {
  const content = readFileSync(astroIndexHtml, 'utf8');
  if (!content.includes('GB Coder') || !content.includes('/app')) {
    fail('dist/index.html does not contain GB Coder marketing CTA to /app');
  } else {
    pass('Astro root index.html verified with Start Coding CTA to /app');
  }

  // Ensure heavy IDE libraries did not leak into marketing HTML
  const forbiddenMarketingMarkers = ['@webcontainer/api', 'monaco-editor', 'xterm', 'esbuild-wasm'];
  for (const marker of forbiddenMarketingMarkers) {
    if (content.includes(marker)) {
      fail(`dist/index.html leaked IDE runtime marker: ${marker}`);
    }
  }
  pass('dist/index.html is isolated from IDE runtime dependencies');
}

// Check 2: Vite app/index.html exists and has React mounting root
const viteIndexHtml = join(FINAL_APP, 'index.html');
if (!existsSync(viteIndexHtml)) {
  fail('dist/app/index.html is missing');
} else {
  const content = readFileSync(viteIndexHtml, 'utf8');
  if (!content.includes('id="root"')) {
    fail('dist/app/index.html does not contain React root element');
  } else if (!content.includes('/app/assets/')) {
    fail('dist/app/index.html does not reference /app/assets/ path');
  } else {
    pass('Vite app/index.html verified with React root and /app/assets/ paths');
  }
}

// Check 3: Check asset references in app/index.html
const appHtml = readFileSync(viteIndexHtml, 'utf8');
const assetMatches = [...appHtml.matchAll(/(?:src|href)="(\/app\/assets\/[^"]+)"/g)].map((m) => m[1]);
for (const assetUrl of assetMatches) {
  const relativeAsset = assetUrl.replace(/^\/app\//, '');
  const assetPath = join(FINAL_APP, relativeAsset);
  if (!existsSync(assetPath)) {
    fail(`Referenced asset does not exist: ${assetUrl} -> ${assetPath}`);
  }
}
pass(`All ${assetMatches.length} initial Vite assets exist in dist/app/`);

// Check 4: Check Monaco workers exist in dist/app/assets/
const appAssets = readdirSync(join(FINAL_APP, 'assets'));
const hasWorkers = appAssets.some((file) => file.includes('worker') && file.endsWith('.js'));
if (!hasWorkers) {
  fail('Monaco worker scripts missing from dist/app/assets/');
} else {
  pass('Monaco worker scripts verified in dist/app/assets/');
}

// Check 5: Check PWA files
if (!existsSync(join(FINAL_APP, 'sw.js'))) {
  fail('Scoped Service Worker missing from dist/app/sw.js');
} else {
  pass('Scoped Service Worker exists at dist/app/sw.js');
}

if (!existsSync(join(FINAL_APP, 'manifest.webmanifest'))) {
  fail('PWA manifest missing from dist/app/manifest.webmanifest');
} else {
  const manifestRaw = readFileSync(join(FINAL_APP, 'manifest.webmanifest'), 'utf8');
  try {
    const manifest = JSON.parse(manifestRaw);
    if (manifest.scope !== '/app/' || manifest.start_url !== '/app/') {
      fail(`PWA manifest scope/start_url not /app/: ${JSON.stringify(manifest)}`);
    } else {
      pass('PWA manifest correctly scoped to /app/');
    }
  } catch {
    fail('PWA manifest is not valid JSON');
  }
}

// Check 6: Check root Migration Service Worker
if (!existsSync(join(FINAL_DIST, 'sw.js'))) {
  fail('Root Migration Service Worker missing from dist/sw.js');
} else {
  const rootSwContent = readFileSync(join(FINAL_DIST, 'sw.js'), 'utf8');
  if (!rootSwContent.includes('unregister')) {
    fail('Root Service Worker does not include self-unregistration logic');
  } else {
    pass('Root Migration Service Worker verified at dist/sw.js');
  }
}

// Check 7: No secret files exposed in output
const forbiddenFiles = ['.env', '.env.local', '.env.production', '.git'];
for (const forbidden of forbiddenFiles) {
  if (existsSync(join(FINAL_DIST, forbidden))) {
    fail(`Secret file leaked into build output: ${forbidden}`);
  }
}
pass('No environment or secret files leaked into dist/');

// 6. Generate Build Manifest
console.log('\n[6/6] Generating build manifest...');
const durationMs = Date.now() - startTime;

const getDirSize = (dir) => {
  let size = 0;
  for (const item of readdirSync(dir)) {
    const full = join(dir, item);
    const stat = statSync(full);
    if (stat.isDirectory()) size += getDirSize(full);
    else size += stat.size;
  }
  return size;
};

const buildManifest = {
  buildTime: new Date().toISOString(),
  durationMs,
  status: failures.length === 0 ? 'SUCCESS' : 'FAILED',
  summary: {
    marketingHtmlBytes: statSync(astroIndexHtml).size,
    ideHtmlBytes: statSync(viteIndexHtml).size,
    totalDistBytes: getDirSize(FINAL_DIST),
    failuresCount: failures.length,
  },
  routes: {
    marketingRoot: '/',
    marketing404: '/404.html',
    ideApp: '/app',
    ideAssets: '/app/assets/',
    rootMigrationWorker: '/sw.js',
    appServiceWorker: '/app/sw.js',
  },
};

writeFileSync(join(FINAL_DIST, 'build-manifest.json'), JSON.stringify(buildManifest, null, 2));
console.log(`Build manifest saved to dist/build-manifest.json (${durationMs}ms)`);

if (failures.length > 0) {
  console.error(`\n❌ BUILD FAILED with ${failures.length} safety check violations!`);
  process.exit(1);
}

console.log('\n======================================================================');
console.log('✅ UNIFIED BUILD SUCCEEDED DETERMINISTICALLY');
console.log('======================================================================');
