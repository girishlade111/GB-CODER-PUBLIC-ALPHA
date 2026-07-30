/**
 * Client-side share links.
 *
 * The previous `?code=` link had no consumer — `loadFromUrl` was never called —
 * so every generated link was a dead end. This uses the URL **hash**, which is
 * never sent to the server, and is decoded on startup so links actually restore
 * a project.
 *
 * Backend-backed short links (`/preview/:id` via Upstash) remain the preferred
 * option for single-file projects; this is the no-backend fallback.
 */

import { MultiFileProject, ProjectType, createPlainProject, projectToTriple } from '../types/files';

/** Hash key holding an encoded project. */
const HASH_KEY = 'project';

/**
 * Practical ceiling for a shareable URL. Browsers tolerate more, but chat apps
 * and mail clients routinely truncate beyond ~8k, which silently corrupts links.
 */
export const MAX_SHARE_URL_LENGTH = 8000;

export interface SharePayload {
  v: 1;
  t: ProjectType;
  /** Plain projects: the three panels. */
  h?: string;
  c?: string;
  j?: string;
}

// ─── Base64url (UTF-8 safe) ───────────────────────────────────────────────────

const toBase64Url = (text: string): string => {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (encoded: string): string => {
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

// ─── Encoding ─────────────────────────────────────────────────────────────────

export type ShareLinkResult =
  | { ok: true; url: string; length: number }
  | { ok: false; reason: 'empty' | 'multi-file' | 'too-large'; message: string };

export const MULTI_FILE_SHARE_MESSAGE =
  'Share URL requires project storage. Export as ZIP or use Sandbox mode for live sharing.';

/**
 * Builds a self-contained share URL for a plain project.
 *
 * Multi-file projects are refused deliberately: encoding an entire file tree
 * into a URL produces links that exceed what messaging apps carry, and it would
 * silently truncate. They get the message pointing at ZIP export / Sandbox mode.
 */
export const buildShareLink = (
  project: MultiFileProject,
  baseUrl: string = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : '',
): ShareLinkResult => {
  if (project.projectType !== 'plain') {
    return { ok: false, reason: 'multi-file', message: MULTI_FILE_SHARE_MESSAGE };
  }

  const { html, css, javascript } = projectToTriple(project);

  if (!html.trim() && !css.trim() && !javascript.trim()) {
    return {
      ok: false,
      reason: 'empty',
      message: 'Nothing to share yet — write some code first.',
    };
  }

  const payload: SharePayload = { v: 1, t: 'plain', h: html, c: css, j: javascript };
  const url = `${baseUrl}#${HASH_KEY}=${toBase64Url(JSON.stringify(payload))}`;

  if (url.length > MAX_SHARE_URL_LENGTH) {
    return {
      ok: false,
      reason: 'too-large',
      message:
        'This project is too large for a share link. Export as ZIP, or use "Share Live Preview" which stores it server-side.',
    };
  }

  return { ok: true, url, length: url.length };
};

// ─── Decoding ─────────────────────────────────────────────────────────────────

/** Reads an encoded project out of a URL hash, if present and valid. */
export const readShareLink = (
  hash: string = typeof window !== 'undefined' ? window.location.hash : '',
): MultiFileProject | null => {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw) return null;

  const params = new URLSearchParams(raw);
  const encoded = params.get(HASH_KEY);
  if (!encoded) return null;

  try {
    const payload = JSON.parse(fromBase64Url(encoded)) as SharePayload;
    if (payload.v !== 1 || payload.t !== 'plain') return null;

    return createPlainProject(payload.h ?? '', payload.c ?? '', payload.j ?? '');
  } catch {
    // A corrupted or truncated link should be ignored, not crash startup.
    return null;
  }
};

/** Removes the share payload from the address bar without reloading. */
export const clearShareHash = (): void => {
  if (typeof window === 'undefined') return;
  const { origin, pathname, search } = window.location;
  window.history.replaceState(null, '', `${origin}${pathname}${search}`);
};

// ─── CodePen / JSFiddle ───────────────────────────────────────────────────────

interface ExternalTarget {
  html: string;
  css: string;
  javascript: string;
  title: string;
}

/**
 * Flattens a project for the third-party playgrounds, which only accept an
 * HTML/CSS/JS triple.
 *
 * A framework project cannot be represented faithfully, so instead of shipping
 * something broken we surface a note. The caller decides whether to proceed.
 */
export const prepareExternalExport = (
  project: MultiFileProject,
  title = 'GB Coder Project',
): { ok: true; payload: ExternalTarget } | { ok: false; message: string } => {
  const { html, css, javascript } = projectToTriple(project);

  if (project.projectType !== 'plain') {
    return {
      ok: false,
      message:
        `CodePen and JSFiddle accept a single HTML/CSS/JS triple, so a ${
          project.projectType === 'react' ? 'React' : 'Vue'
        } project cannot be sent directly. Export as ZIP instead, or switch to a plain project.`,
    };
  }

  if (!html.trim() && !css.trim() && !javascript.trim()) {
    return { ok: false, message: 'Nothing to export yet — write some code first.' };
  }

  return { ok: true, payload: { html, css, javascript, title } };
};

/** Posts a hidden form to a playground, opening the result in a new tab. */
const postToNewTab = (action: string, fields: Record<string, string>): void => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = action;
  form.target = '_blank';
  form.style.display = 'none';

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

/** Opens the project in CodePen via its documented Prefill API. */
export const openInCodePen = (payload: ExternalTarget): void => {
  postToNewTab('https://codepen.io/pen/define', {
    data: JSON.stringify({
      title: payload.title,
      html: payload.html,
      css: payload.css,
      js: payload.javascript,
      editors: '111',
    }),
  });
};

/** Opens the project in JSFiddle via its form-post API. */
export const openInJsFiddle = (payload: ExternalTarget): void => {
  postToNewTab('https://jsfiddle.net/api/post/library/pure/', {
    title: payload.title,
    html: payload.html,
    css: payload.css,
    js: payload.javascript,
    wrap: 'l',
  });
};
