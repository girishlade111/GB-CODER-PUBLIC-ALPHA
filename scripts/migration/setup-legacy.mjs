#!/usr/bin/env node
/**
 * GB Coder — Pinned Legacy Build Automator
 *
 * Ensures the known-good production legacy commit (`8ebbc5048d4c73b5ca906b6efa9a65ca88ceb36f`)
 * is built deterministically into `node_modules/.cache/dist-legacy`.
 *
 * Designed for fresh checkouts:
 * - Does NOT rely on pre-existing cache artifacts
 * - Does NOT use hardcoded Windows paths
 * - Uses a temporary disposable directory, extracts via git archive, and builds cleanly
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

export const PINNED_LEGACY_COMMIT = '8ebbc5048d4c73b5ca906b6efa9a65ca88ceb36f';
export const LEGACY_DIST_DIR = path.resolve(REPO_ROOT, 'node_modules/.cache/dist-legacy');

export function isLegacyDistReady() {
  if (!fs.existsSync(LEGACY_DIST_DIR)) return false;
  const hasIndex = fs.existsSync(path.join(LEGACY_DIST_DIR, 'index.html'));
  const hasSw = fs.existsSync(path.join(LEGACY_DIST_DIR, 'sw.js'));
  const hasAssets = fs.existsSync(path.join(LEGACY_DIST_DIR, 'assets'));
  return hasIndex && hasSw && hasAssets;
}

export async function ensureLegacyDist(forceRebuild = false) {
  if (!forceRebuild && isLegacyDistReady()) {
    console.log(`[Setup Legacy] Pinned legacy build is already present at: ${LEGACY_DIST_DIR}`);
    return LEGACY_DIST_DIR;
  }

  console.log(`[Setup Legacy] Building pinned legacy commit ${PINNED_LEGACY_COMMIT}...`);
  const tempExtractDir = path.resolve(REPO_ROOT, 'node_modules/.cache', `legacy-extract-${Date.now()}`);

  try {
    fs.mkdirSync(tempExtractDir, { recursive: true });

    // 1. Extract pinned commit cleanly using git archive
    console.log(`  -> Extracting source from git tree ${PINNED_LEGACY_COMMIT}...`);
    execSync(`git archive ${PINNED_LEGACY_COMMIT} | tar -x -C "${tempExtractDir}"`, {
      cwd: REPO_ROOT,
      stdio: 'pipe',
      shell: true,
    });

    // 2. Link repository node_modules so dependencies resolve without running npm install
    const repoNodeModules = path.resolve(REPO_ROOT, 'node_modules');
    const targetNodeModules = path.resolve(tempExtractDir, 'node_modules');
    if (!fs.existsSync(targetNodeModules)) {
      try {
        fs.symlinkSync(repoNodeModules, targetNodeModules, 'junction');
      } catch {
        // Fallback: directory junction on Windows
        execSync(`cmd /c mklink /J "${targetNodeModules}" "${repoNodeModules}"`, { stdio: 'pipe' });
      }
    }

    // 3. Build legacy Vite SPA directly into LEGACY_DIST_DIR
    console.log(`  -> Compiling legacy application via Vite...`);
    fs.mkdirSync(LEGACY_DIST_DIR, { recursive: true });

    execSync(`npx vite build --outDir "${LEGACY_DIST_DIR}"`, {
      cwd: tempExtractDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'production',
      },
    });

    console.log(`[Setup Legacy] Legacy build compiled successfully into: ${LEGACY_DIST_DIR}`);
  } finally {
    // 4. Safely clean up disposable directory
    try {
      const targetNodeModules = path.resolve(tempExtractDir, 'node_modules');
      if (fs.existsSync(targetNodeModules)) {
        fs.unlinkSync(targetNodeModules);
      }
    } catch {}

    try {
      if (fs.existsSync(tempExtractDir)) {
        fs.rmSync(tempExtractDir, { recursive: true, force: true });
      }
    } catch {}
  }

  if (!isLegacyDistReady()) {
    throw new Error(`Failed to verify output of legacy build in: ${LEGACY_DIST_DIR}`);
  }

  return LEGACY_DIST_DIR;
}

// CLI entry point
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  ensureLegacyDist().catch((err) => {
    console.error('[Setup Legacy] Error:', err);
    process.exit(1);
  });
}
