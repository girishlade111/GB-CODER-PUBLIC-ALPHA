/**
 * Vercel Serverless Function — POST /api/ai
 *
 * Replicates server/routes/aiRoutes.js + server/aiService.js
 * for Vercel deployment (no Express server needed).
 */

'use strict';

const axios = require('axios');

// ─── Config ───────────────────────────────────────────────────────────────────

const INVOKE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODEL = process.env.NVIDIA_MODEL || 'qwen/qwen3.5-397b-a17b';
const API_KEY = process.env.NVIDIA_API_KEY;

// ─── Rate limiting (simple in-memory tracker) ────────────────────────────────

const rateLimitMap = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 30;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_MAX;
}

// ─── System prompt ────────────────────────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `You are "Code Buddy", an AI code assistant built into the GB Coder editor.
You specialize in HTML, CSS, and vanilla JavaScript ONLY.

CRITICAL RULES — follow these strictly:
1. ANSWER ONLY WHAT THE USER ASKS. Do NOT generate unsolicited code, demos, or examples.
2. If the user asks a question, answer ONLY that question concisely. Do NOT add random code samples, product cards, image galleries, or any other unrequested content.
3. NEVER invent or hallucinate content the user did not request. No random products, no placeholder images, no demo websites unless the user explicitly asks for one.
4. If the user's message is unclear or too vague, ask a clarifying question instead of guessing or generating random code.
5. Generate code ONLY when the user explicitly asks for code, a website, a component, an app, or similar.
6. When you do generate code, use ONLY plain HTML, CSS, and vanilla JavaScript — no frameworks (React, Vue, Angular, etc.), no backend languages, no build tools.
7. Keep responses focused and relevant. Do not add extra commentary, tips, or suggestions unless the user asks for them.

When writing code (only if requested), wrap each language in its own fenced code block:
  HTML   → \`\`\`html ... \`\`\`
  CSS    → \`\`\`css  ... \`\`\`
  JS     → \`\`\`javascript ... \`\`\`
If explanation is needed, write it in plain text outside the code blocks.`;

// ─── Feature prompts ──────────────────────────────────────────────────────────

const FEATURE_PROMPTS = {
  improve: (code, ctx) =>
    `Improve the following ${ctx} code. Optimise structure, readability, and best practices.\n` +
    `Return ONLY the improved code in a fenced code block — no extra commentary.\n\n` +
    `\`\`\`${ctx}\n${code}\n\`\`\``,

  explain: (code, ctx) =>
    `Explain the following ${ctx} code clearly. Be concise and structured. ` +
    `Use plain text — no code block needed unless showing a specific example.\n\n` +
    `\`\`\`${ctx}\n${code}\n\`\`\``,

  fix: (code, ctx) =>
    `Find all bugs and errors in the following ${ctx} code.\n` +
    `1. List each issue with a short description.\n` +
    `2. Return the fully corrected code in a fenced \`\`\`${ctx}\`\`\` block.\n\n` +
    `\`\`\`${ctx}\n${code}\n\`\`\``,

  optimize: (code, ctx) =>
    `Optimise the performance of the following ${ctx} code without changing its behaviour.\n` +
    `Return ONLY the optimised code in a fenced code block.\n\n` +
    `\`\`\`${ctx}\n${code}\n\`\`\``,

  enhance: (code, ctx) =>
    `Improve the visual design of the following ${ctx} code using only CSS and minor HTML tweaks.\n` +
    `Make it look modern, polished, and professional. Return ONLY the enhanced code in a fenced code block.\n\n` +
    `\`\`\`${ctx}\n${code}\n\`\`\``,

  suggest: (code, ctx) =>
    `Analyse the following ${ctx} code and provide 3–5 concrete improvement suggestions.\n` +
    `Respond with ONLY a valid JSON array — no markdown, no extra text:\n` +
    `[{"title":"...","description":"...","code":"...","type":"improvement|refactor|performance|security","impact":"high|medium|low"}]\n\n` +
    `\`\`\`${ctx}\n${code}\n\`\`\``,

  chat: (userMessage, ctx, currentCode) => {
    const editorCtx = currentCode
      ? `\n\nCurrent editor state:\n` +
        `HTML:\n\`\`\`html\n${currentCode.html || ''}\n\`\`\`\n` +
        `CSS:\n\`\`\`css\n${currentCode.css || ''}\n\`\`\`\n` +
        `JavaScript:\n\`\`\`javascript\n${currentCode.javascript || ''}\n\`\`\``
      : '';
    return (
      `User's message: "${userMessage}"${editorCtx}\n\n` +
      `IMPORTANT: Answer ONLY the user's question above. Do NOT generate random code, demos, or examples unless the user explicitly asked for code. ` +
      `If the user asks for code or to build something, generate it in separate fenced blocks for HTML, CSS, and JavaScript. ` +
      `If the user asks a general question, answer it in plain text without adding unnecessary code.`
    );
  },
};

// ─── Build messages ───────────────────────────────────────────────────────────

function buildMessages(feature, { code, selectedCode, userMessage, context, currentCode }) {
  const ctx = context || 'javascript';
  let userContent;
  switch (feature) {
    case 'improve':  userContent = FEATURE_PROMPTS.improve(code || '', ctx); break;
    case 'explain':  userContent = FEATURE_PROMPTS.explain(selectedCode || code || '', ctx); break;
    case 'fix':      userContent = FEATURE_PROMPTS.fix(code || '', ctx); break;
    case 'optimize': userContent = FEATURE_PROMPTS.optimize(code || '', ctx); break;
    case 'enhance':  userContent = FEATURE_PROMPTS.enhance(code || '', ctx); break;
    case 'suggest':  userContent = FEATURE_PROMPTS.suggest(code || '', ctx); break;
    case 'chat':     userContent = FEATURE_PROMPTS.chat(userMessage || '', ctx, currentCode); break;
    default: throw new Error(`Unknown feature: ${feature}`);
  }
  return [
    { role: 'system', content: BASE_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}

// ─── NVIDIA API caller ────────────────────────────────────────────────────────

async function callNvidiaAI(messages, options = {}) {
  if (!API_KEY) {
    throw new Error('NVIDIA_API_KEY is not set in environment variables.');
  }

  const { stream = false, temperature = 0.60, maxTokens = 16384 } = options;

  const payload = {
    model: MODEL,
    messages,
    max_tokens: maxTokens,
    temperature,
    top_p: 0.95,
    top_k: 20,
    presence_penalty: 0,
    repetition_penalty: 1,
    stream,
    chat_template_kwargs: { enable_thinking: false },
  };

  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': stream ? 'text/event-stream' : 'application/json',
  };

  const response = await axios.post(INVOKE_URL, payload, {
    headers,
    responseType: stream ? 'stream' : 'json',
    timeout: 120_000,
    validateStatus: () => true,
  });

  if (response.status !== 200) {
    let errBody = '';
    if (stream && response.data?.on) {
      await new Promise((resolve) => {
        let buf = '';
        response.data.on('data', (c) => { buf += c.toString(); });
        response.data.on('end', () => { errBody = buf; resolve(); });
        response.data.on('error', resolve);
      });
    } else {
      errBody = typeof response.data === 'string'
        ? response.data
        : JSON.stringify(response.data);
    }
    throw new Error(`NVIDIA API returned ${response.status}: ${errBody.slice(0, 200)}`);
  }

  if (stream) return response.data;

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('NVIDIA returned an empty response.');
  return content;
}

// ─── Valid features ───────────────────────────────────────────────────────────

const VALID_FEATURES = new Set(['improve', 'explain', 'fix', 'optimize', 'enhance', 'suggest', 'chat']);
const MAX_BODY_LEN = 60_000;

// ─── Handler ──────────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Rate limit
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests — please wait a moment.' });
  }

  const { feature, code, selectedCode, userMessage, context, currentCode, conversationHistory } = req.body || {};

  // Validate feature
  if (!feature || !VALID_FEATURES.has(feature)) {
    return res.status(400).json({
      error: `Invalid feature "${feature}". Must be one of: ${[...VALID_FEATURES].join(', ')}`,
    });
  }

  // Validate payload size
  const totalLen = [code, selectedCode, userMessage, context].filter(Boolean).join('').length;
  if (totalLen > MAX_BODY_LEN) {
    return res.status(413).json({ error: 'Payload too large — please reduce the code size.' });
  }

  try {
    const messages = buildMessages(feature, { code, selectedCode, userMessage, context, currentCode });

    // Inject conversation history for chat
    if (feature === 'chat' && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      const history = conversationHistory.slice(-6).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: String(m.content ?? ''),
      }));
      messages.splice(1, 0, ...history);
    }

    // ── STREAMING — chat feature ──────────────────────────────────────────
    if (feature === 'chat') {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let nvidiaStream;
      try {
        nvidiaStream = await callNvidiaAI(messages, { stream: true, temperature: 0.70 });
      } catch (err) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
        return;
      }

      let buffer = '';

      nvidiaStream.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json?.choices?.[0]?.delta?.content;
            if (delta) {
              res.write(`data: ${JSON.stringify({ delta })}\n\n`);
            }
          } catch {
            // malformed SSE chunk — skip
          }
        }
      });

      nvidiaStream.on('end', () => {
        res.write('data: [DONE]\n\n');
        res.end();
      });

      nvidiaStream.on('error', (err) => {
        try {
          res.write(`data: ${JSON.stringify({ error: 'Stream interrupted.' })}\n\n`);
          res.end();
        } catch {}
      });

      req.on('close', () => {
        try { nvidiaStream.destroy(); } catch {}
      });

      return;
    }

    // ── NON-STREAMING — all other features ────────────────────────────────
    const result = await callNvidiaAI(messages, { stream: false, temperature: 0.60 });
    return res.json({ result });

  } catch (err) {
    const clientMsg = err.message.includes('NVIDIA_API_KEY')
      ? 'AI not configured — NVIDIA_API_KEY missing in environment variables'
      : err.message.includes('ECONNREFUSED') || err.message.includes('ENOTFOUND')
        ? 'Cannot reach NVIDIA API — check internet connection.'
        : err.message.includes('timeout')
          ? 'AI request timed out — please try again.'
          : `AI error: ${err.message}`;

    return res.status(502).json({ error: clientMsg });
  }
};
