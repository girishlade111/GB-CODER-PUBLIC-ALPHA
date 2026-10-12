/**
 * GB Coder — Cryptographic Integrity & Archive Security Utilities
 *
 * Provides deterministic SHA-256 calculation across browser Web Crypto and
 * Node.js test environments, together with path normalization and ZIP-slip defenses.
 */

/**
 * Computes a deterministic SHA-256 hex digest for given text or binary buffer.
 * Compatible with Web Crypto API (`crypto.subtle`) and Node.js `node:crypto`.
 */
export async function computeSha256(data: string | Uint8Array | ArrayBuffer): Promise<string> {
  const bytes = typeof data === 'string'
    ? new TextEncoder().encode(data)
    : data instanceof Uint8Array
      ? data
      : new Uint8Array(data);

  // 1. Browser Web Crypto API
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // 2. Node.js environment fallback
  if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      const cryptoModule = 'node:' + 'crypto';
      const nodeCrypto = await import(/* @vite-ignore */ cryptoModule);
      return nodeCrypto.createHash('sha256').update(bytes).digest('hex');
    } catch {
      // Fall through to error
    }
  }

  throw new Error('SHA-256 calculation failed: No Web Crypto or crypto module available.');
}

/**
 * Validates and normalizes relative paths extracted from ZIP archives.
 * Defends against ZIP-slip vulnerabilities, directory traversal, absolute paths,
 * Windows drive letters, null bytes, and prototype pollution attempts.
 *
 * @param rawPath The entry path from the archive.
 * @returns Clean normalized relative path with forward slashes, or throws Error if unsafe.
 */
export function validateAndNormalizeArchivePath(rawPath: string): string {
  if (typeof rawPath !== 'string' || !rawPath.trim()) {
    throw new Error('Archive entry path cannot be empty.');
  }

  // Reject null bytes, carriage returns, newlines
  if (/[\0\r\n]/.test(rawPath)) {
    throw new Error(`Archive entry contains forbidden control characters: "${rawPath}"`);
  }

  // Reject Windows drive paths (e.g. C:, D:)
  if (/^[a-zA-Z]:/.test(rawPath)) {
    throw new Error(`Archive entry contains Windows drive specifier: "${rawPath}"`);
  }

  // Convert Windows backslashes to forward slashes
  const normalized = rawPath.replace(/\\/g, '/').trim();

  // Reject absolute paths
  if (normalized.startsWith('/') || normalized.startsWith('//')) {
    throw new Error(`Archive entry cannot be an absolute path: "${rawPath}"`);
  }

  // Split into segments and inspect each segment
  const segments = normalized.split('/').filter(Boolean);
  if (segments.length === 0) {
    throw new Error(`Archive entry resolves to empty path: "${rawPath}"`);
  }

  for (const seg of segments) {
    // Defend against directory traversal
    if (seg === '..') {
      throw new Error(`Archive entry contains directory traversal "..": "${rawPath}"`);
    }
    if (seg === '.') {
      continue;
    }
    // Defend against prototype pollution
    if (seg === '__proto__' || seg === 'constructor' || seg === 'prototype') {
      throw new Error(`Archive entry contains dangerous property name "${seg}": "${rawPath}"`);
    }
  }

  return segments.join('/');
}

/**
 * Validates that an unparsed JSON string does not contain suspicious prototype pollution keys
 * before passing to JSON.parse.
 */
export function safeJsonParse<T = unknown>(jsonStr: string): T {
  const parsed = JSON.parse(jsonStr) as T;
  if (parsed && typeof parsed === 'object') {
    assertNoPrototypePollution(parsed);
  }
  return parsed;
}

function assertNoPrototypePollution(obj: unknown, depth = 0): void {
  if (depth > 20 || !obj || typeof obj !== 'object') return;

  if (Object.prototype.hasOwnProperty.call(obj, '__proto__') ||
      Object.prototype.hasOwnProperty.call(obj, 'constructor') ||
      Object.prototype.hasOwnProperty.call(obj, 'prototype')) {
    // If these keys exist as own properties, check if they are malicious
    const keys = Object.keys(obj);
    if (keys.includes('__proto__') || keys.includes('constructor') || keys.includes('prototype')) {
      throw new Error('Potential prototype pollution detected in JSON payload.');
    }
  }

  for (const key of Object.keys(obj)) {
    const val = (obj as Record<string, unknown>)[key];
    if (val && typeof val === 'object') {
      assertNoPrototypePollution(val, depth + 1);
    }
  }
}
