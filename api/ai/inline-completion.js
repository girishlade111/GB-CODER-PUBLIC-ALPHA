/**
 * Vercel Serverless Function — POST /api/ai/inline-completion
 *
 * Inline ("ghost text") completion for the Monaco editor. Given the code before
 * and after the caret, returns the short snippet that should be inserted there.
 * The editor shows it greyed out and Tab accepts it.
 *
 * Why this is its own file rather than a `feature` on /api/ai:
 * /api/ai speaks an OpenAI-compatible chat-completions protocol to providers
 * that are tuned for long, deliberate edits (temperature 0.15-0.55, 8k-16k token
 * budgets, full three-file context). Inline completion is the opposite shape: it
 * is a single-token decision that must land in ~300ms, so it runs on Flash at
 * temperature 0.15 with a 256-token cap and a tiny context window. Sharing
 * /api/ai would force one rate-limit budget and one payload ceiling across two
 * workloads with opposite cost/latency profiles.
 *
 * The provider is Gemini (not the Inception/Atria/NVIDIA stack in /api/ai) to
 * match the vision endpoint's SDK and key, so a deploy already running
 * screenshot-to-code needs no new configuration.
 *
 * Response is always JSON: { completion, model } or { error }.
 */

'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');

try {
  require('dotenv').config();
  require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
} catch (_) {}

// ─── Limits ───────────────────────────────────────────────────────────────────

/**
 * Prefix is capped at 50 lines and suffix at 20 by the client, so a real request
 * is a few KB. 64 KB is generous headroom while still bounding what the function
 * will buffer before validation runs.
 */
const MAX_BODY_BYTES = 64 * 1024;

/** Independently bound each field so one huge field cannot starve the other. */
const MAX_PREFIX_CHARS = 8000;
const MAX_SUFFIX_CHARS = 4000;

/**
 * Ghost text that runs longer than this stops being a suggestion and becomes a
 * liability — the user reads it faster than they can Tab it. Truncating in the
 * response is cheaper than a retry against the model.
 */
const MAX_COMPLETION_CHARS = 400;
const MAX_COMPLETION_LINES = 20;

const VALID_LANGUAGES = new Set(['html', 'css', 'javascript', 'typescript']);
const DEFAULT_LANGUAGE = 'javascript';

// Flash only: Pro is far too slow to sit in a typing loop.
const MODEL = 'gemini-1.5-flash';

// ─── Rate limiting (in-memory tracker, mirrors api/ai.js) ──────────────────────
//
// Much higher than /api/ai's 30/min. Inline completion fires on every typing
// pause, so a legitimately heavy session can reach ~2 requests/second once the
// client's 350ms debounce and cache are accounted for. The ceiling exists to
// stop a runaway client or a shared-IP scrape, not to ration ordinary use.

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 120;

// Shared so the bucket key cannot be chosen by the caller, and so the map is
// pruned instead of growing for the life of the instance. See api/_client-ip.js.
const { clientIp, RateLimiter } = require('../_client-ip');
const rateLimiter = new RateLimiter({ default: RATE_MAX }, RATE_WINDOW_MS);

function checkRateLimit(ip) {
  return rateLimiter.check(ip, RATE_MAX).allowed;
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

/**
 * One instruction set for every language. The task is identical across HTML, CSS
 * and JS — "continue this code at the caret" — so the output contract is shared.
 * Only the small target-specific notes differ per language.
 */
const SYSTEM_PROMPT = `You are an inline code completion engine embedded in a code editor. You receive a file with the caret marked, and you return the exact text the editor should insert at that caret.

OUTPUT CONTRACT — this is what breaks the feature if you get it wrong:
- Return ONLY the completion text. Nothing else. No explanation, no commentary, no markdown code fences, no language tag, no leading or trailing prose.
- Return the text that goes AT the caret, not the whole function and not the whole file.
- Never include the caret marker itself in your output.
- If nothing sensible belongs at the caret, return an empty response (no characters at all).

CONTENT RULES:
- Never repeat code that already exists in the file. The prefix and suffix are already there.
- Never emit a closing tag, brace, bracket or semicolon that the suffix already closes.
- Never add a trailing comment such as "// rest of the implementation" or "// ...". Suggest real code or nothing.
- Match the file's existing style exactly: quote style, semicolons, naming, indentation width.
- When the caret is mid-line, continue from that exact column rather than restarting the line.
- Prefer the shortest completion that is correct and idiomatic — usually a single line or a single statement.
- Never invent APIs, imports, or identifiers that are not already visible in the file.
- Complete only what the caret clearly calls for. Adding extra features, validation, or defensive checks nobody asked for is a wrong answer.`;

const LANGUAGE_NOTES = {
  html: `TARGET: HTML markup.
- Prefer semantic elements and mirror the attribute style already used in the file.
- Do not emit <!DOCTYPE>, <html>, <head>, or <body> unless the caret is at the very start of an otherwise empty file — GB Coder injects these three files into a live page as body content, a stylesheet, and a script.`,
  css: `TARGET: CSS inside a <style> tag. There are no selector blocks in HTML here; selectors are authored by hand.
- Match the file's custom-property and spacing conventions.
- Prefer plain CSS over any framework utility class unless the file already uses utility classes.`,
  javascript: `TARGET: Vanilla JavaScript running in the browser after DOMContentLoaded. No modules, no import or export statements, no build step, no frameworks.
- Use const/let, arrow functions, template literals, early returns and guard clauses to match the file.
- Never call alert(); render into the DOM instead.
- Never reference an image URL. Use CSS gradients, shapes, or inline SVG.`,
  typescript: `TARGET: TypeScript.
- Add or reuse explicit type annotations to match the file's strictness.
- Never use the any type unless the file already does.`,
};

// ─── Request assembly ─────────────────────────────────────────────────────────

/** The marker the model must treat as the caret. Kept out of any code fence. */
const CURSOR_MARKER = '###CURSOR###';

function buildUserMessage({ fileName, language, prefix, suffix }) {
  const header = [
    `file: ${fileName || 'untitled'}`,
    `language: ${language}`,
    '',
    '=== CODE (the ' + CURSOR_MARKER + ' marker is the caret) ===',
  ].join('\n');

  const footer = [
    '=== END CODE ===',
    '',
    'Return only the text that replaces the ' + CURSOR_MARKER + ' marker.',
  ].join('\n');

  return `${header}\n${prefix}${CURSOR_MARKER}${suffix}\n${footer}`;
}

// ─── Output cleaning ──────────────────────────────────────────────────────────

/**
 * Models occasionally wrap the whole answer in one fence even when told not to.
 * The editor cannot accept that, so the fence is peeled off rather than the
 * suggestion being discarded.
 */
function stripFences(text) {
  const trimmed = String(text || '').trim();
  const fenced = trimmed.match(/^```(?:[a-zA-Z0-9+#.-]*)\s*\n?([\s\S]*?)\n?```$/);
  return (fenced ? fenced[1] : trimmed).trim();
}

/**
 * Reduces the raw model output to text that is safe to insert at a caret.
 *
 * Returns '' when nothing usable came back, which the client reads as "show no
 * ghost text" rather than an error — a wrong suggestion costs more than none.
 */
function normalizeCompletion(rawText) {
  let text = stripFences(rawText);

  if (!text) return '';

  // A model that echoed the marker back has not understood the task.
  if (text.includes(CURSOR_MARKER)) return '';

  // The fence regex above only matches a fence wrapping the *entire* answer.
  // A stray unterminated fence still breaks the editor, so drop it outright.
  if (text.includes('```')) return '';

  // Ghost text is inserted verbatim at the caret, so leading whitespace is an
  // indentation bug, not a hint — but indentation on *continuation* lines is
  // meaningful and is preserved.
  text = text.replace(/^[ \t]+/, '');

  // Cap the size before counting lines so a runaway single line cannot blow up
  // the split below.
  if (text.length > MAX_COMPLETION_CHARS) {
    text = text.slice(0, MAX_COMPLETION_CHARS);
  }

  const lines = text.split('\n');
  if (lines.length > MAX_COMPLETION_LINES) {
    text = lines.slice(0, MAX_COMPLETION_LINES).join('\n');
  }

  return text.trimEnd();
}

// ─── Validation ───────────────────────────────────────────────────────────────

const readField = (value, max) =>
  (typeof value === 'string' ? value : '').slice(0, max);

/**
 * Rejects a body that cannot produce a useful completion, and returns the
 * normalized request. Both fields are required: a caret with no surrounding code
 * gives the model nothing to condition on, and letting it guess produces noise
 * on every keystroke.
 */
function parseRequest(body) {
  const language = String(body.language || '').trim().toLowerCase();

  if (!VALID_LANGUAGES.has(language)) {
    return { error: `Unsupported language "${language}". Must be one of: ${[...VALID_LANGUAGES].join(', ')}` };
  }

  const prefix = readField(body.prefix, MAX_PREFIX_CHARS);
  const suffix = readField(body.suffix, MAX_SUFFIX_CHARS);

  if (!prefix.trim() && !suffix.trim()) {
    return { error: 'Both prefix and suffix are empty — there is no context to complete from.' };
  }

  return {
    request: {
      prefix,
      suffix,
      language,
      fileName: readField(body.fileName, 200).trim(),
    },
  };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = clientIp(req);
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many inline completion requests — please slow down.' });
  }

  const body = req.body || {};

  const serializedLength =
    (typeof body.prefix === 'string' ? body.prefix.length : 0) +
    (typeof body.suffix === 'string' ? body.suffix.length : 0);
  if (serializedLength > MAX_BODY_BYTES) {
    return res.status(413).json({ error: 'Context too large — inline completion takes a small window.' });
  }

  const { request, error } = parseRequest(body);
  if (error) return res.status(400).json({ error });

  // A key may arrive in the body (user-supplied, matching the other AI features)
  // or from the environment. Body wins so a user can override a stale deploy key.
  const apiKey = String(body.apiKey || '').trim() || String(process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'Inline Copilot is not configured — GEMINI_API_KEY is missing.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const generativeModel = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: {
        role: 'system',
        parts: [{ text: `${SYSTEM_PROMPT}\n\n${LANGUAGE_NOTES[request.language]}` }],
      },
      generationConfig: {
        // Low temperature is what makes this usable as ghost text: the model must
        // pick the obvious continuation, not explore alternatives.
        temperature: 0.15,
        topP: 0.9,
        maxOutputTokens: 256,
      },
    });

    /*
     * Not streamed. Monaco's inline-completions contract takes a finished list
     * of items, not a token stream — there is no way to append to a ghost text
     * that is already displayed. A short non-streamed call on Flash lands in the
     * same order of magnitude as the 350 ms client debounce, so streaming would
     * add parsing complexity without buying a perceptible win.
     */
    const result = await generativeModel.generateContent([
      { text: buildUserMessage(request) },
    ]);

    const completion = normalizeCompletion(result?.response?.text?.());

    return res.json({ completion, model: MODEL });
  } catch (err) {
    const message = err?.message || 'Unknown error';

    // Map the failures a user can actually act on to actionable messages.
    if (/API key not valid|API_KEY_INVALID|PERMISSION_DENIED/i.test(message)) {
      return res.status(502).json({ error: 'Gemini rejected the API key — check GEMINI_API_KEY.' });
    }
    if (/RESOURCE_EXHAUSTED|quota|rate limit/i.test(message)) {
      return res.status(429).json({ error: 'Gemini rate limit reached — inline suggestions paused.' });
    }
    if (/SAFETY|blocked/i.test(message)) {
      return res.status(422).json({ error: 'Gemini declined to complete that code.' });
    }
    if (/timeout|ETIMEDOUT|ECONNABORTED|aborted/i.test(message)) {
      return res.status(504).json({ error: 'Inline completion timed out.' });
    }

    return res.status(502).json({ error: `Inline completion failed: ${message.slice(0, 200)}` });
  }
};

// Exported for testing / reuse.
module.exports.SYSTEM_PROMPT = SYSTEM_PROMPT;
module.exports.LANGUAGE_NOTES = LANGUAGE_NOTES;
module.exports.CURSOR_MARKER = CURSOR_MARKER;
module.exports.buildUserMessage = buildUserMessage;
module.exports.normalizeCompletion = normalizeCompletion;
module.exports.parseRequest = parseRequest;
module.exports.DEFAULT_LANGUAGE = DEFAULT_LANGUAGE;