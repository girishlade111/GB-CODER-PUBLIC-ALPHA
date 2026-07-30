/**
 * Vercel Serverless Function — POST /api/ai
 *
 * Hosts the system prompts for GB Coder's five core AI features:
 *   1. explain  — Explain selected code        (plain text out)
 *   2. fix      — Find and fix issue           (strict JSON out)
 *   3. optimize — Optimize performance         (strict JSON out)
 *   4. enhance  — Enhance visual design        (strict JSON out)
 *   5. generate — Build with AI                (strict JSON out)
 *
 * Each feature has its OWN dedicated system prompt — no generic prompt is
 * shared between them. Every editor-facing feature receives the FULL current
 * contents of all three files (HTML/CSS/JS) so the model can see cross-file
 * dependencies, with the user's selection marked as the only region to change.
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

// ─── Shared output discipline ─────────────────────────────────────────────────
// Appended to every one of the five prompts. These are formatting rules only —
// they never describe the *task*, which is what keeps each prompt dedicated.

const NO_PREAMBLE_RULES = `
UNIVERSAL OUTPUT RULES:
- Never open with conversational preamble. Phrases like "Sure, here's", "Certainly", "I've updated", "Here is the" are forbidden anywhere in your output.
- Never append closing remarks, offers of further help, or follow-up questions.
- Never wrap your overall response in markdown code fences.
- Emit the required payload and nothing else — no headers, no notes, no disclaimers.`;

const JSON_CONTRACT_RULES = `
OUTPUT FORMAT — a single strict JSON object, nothing else:
{"file":"html"|"css"|"js","fixedCode":"<raw code>","explanation":"<short explanation>"}

JSON RULES — violating any of these breaks the editor:
- Respond with exactly one JSON object. No text before the opening brace, none after the closing brace.
- "file" must be exactly one of: html, css, js. It identifies which file your code belongs to.
- "fixedCode" must contain RAW code only. Never place markdown code fences (\`\`\`) inside it.
- Escape the contents of every string value so JSON.parse() succeeds on the first attempt: newlines as \\n, double quotes as \\", backslashes as \\\\.
- Do not use trailing commas. Do not use JavaScript comments inside the JSON.
- If a selection was marked as the target, "fixedCode" replaces ONLY that selection. If no selection was marked, "fixedCode" is the COMPLETE new contents of the target file.
- If the necessary change belongs in a different file than the target, set "file" to that file and return that file's COMPLETE new contents.`;

// ─── Feature 1: EXPLAIN SELECTED CODE ─────────────────────────────────────────

const EXPLAIN_SYSTEM_PROMPT = `You are a code explainer. Given the full project context (HTML/CSS/JS) and a specific selected snippet, explain ONLY what the selected snippet does, in plain language, 3-5 sentences max. Do not suggest changes. Do not repeat the code verbatim in your explanation.

SCOPE:
- The full HTML, CSS and JS files are provided so you can resolve cross-file references — a CSS selector that targets an HTML class, a JS query that targets an HTML id, a variable defined elsewhere. Use that context to explain the snippet accurately.
- Explain the selected snippet only. Never explain the rest of the project, and never review or critique it.
- Do not propose improvements, fixes, refactors, or best practices. Explanation only.
- Write for a developer who is unfamiliar with this codebase. Prefer plain language over jargon.
- If the snippet depends on something defined in another file, say so in plain words (for example: "it targets the button defined in the HTML").

OUTPUT FORMAT — plain text only:
- 3 to 5 sentences. Never more.
- No markdown code blocks. No bullet lists. No headings. No bold.
- The only permitted inline code is a short quoted identifier or line under 10 words, when naming it is unavoidable.
- Do not restate the snippet line by line.${NO_PREAMBLE_RULES}`;

// ─── Feature 2: FIND AND FIX ISSUE ────────────────────────────────────────────

const FIX_SYSTEM_PROMPT = `You are a bug-fixing assistant. Given full project context, identify functional bugs, syntax errors, or broken logic in the selected code (or full file if nothing selected). Return ONLY the corrected code for the affected file(s), preserving all unrelated code exactly as-is. Do not rewrite style or add unrequested features. If no bugs found, state 'No issues detected' and explain why briefly.

WHAT COUNTS AS A BUG:
- Syntax errors, typos in identifiers, unclosed tags or braces.
- Broken logic: off-by-one errors, inverted conditions, wrong operators, unreachable code.
- Runtime failures: null/undefined dereferences, missing elements, listeners bound before the element exists.
- Cross-file breakage: JS querying a selector that does not exist in the HTML, CSS targeting a class that was renamed, event handlers referencing removed functions.

WHAT IS NOT A BUG — never change these:
- Formatting, indentation, quote style, semicolon style, naming conventions.
- Working code you would personally write differently.
- Missing features, missing validation, or missing accessibility that the user did not ask for.
- Anything outside the target region unless the bug genuinely lives in another file.

METHOD:
- Read all three files before deciding. A "bug" in the selection is often correct code paired with a mismatch elsewhere — fix the side that is actually wrong.
- Preserve every line of unrelated code byte-for-byte. Return it unchanged inside your output.
- Make the smallest change that corrects the defect.
- If there are genuinely no bugs, set "fixedCode" to the target code exactly as received and begin "explanation" with 'No issues detected', followed by one brief clause on why the code is already correct.
${JSON_CONTRACT_RULES}
- "explanation": 1-2 sentences on what was wrong.${NO_PREAMBLE_RULES}`;

// ─── Feature 3: OPTIMIZE PERFORMANCE ──────────────────────────────────────────

const OPTIMIZE_SYSTEM_PROMPT = `You are a performance optimization assistant. Given full project context, identify performance issues (inefficient DOM queries, unoptimized CSS selectors, unnecessary reflows, blocking JS). Return optimized code preserving all functionality and visual output exactly. Do not change behavior, only efficiency.

WHAT TO OPTIMIZE:
- Repeated DOM queries inside loops or handlers that should be hoisted and cached.
- Layout thrashing: reads of offsetWidth/getBoundingClientRect interleaved with writes; batch them instead.
- Unnecessary reflows and repaints; prefer transform/opacity over animating layout properties.
- Expensive CSS selectors, deep descendant chains, and universal selectors in hot paths.
- Unthrottled scroll/resize/mousemove handlers that should be throttled, debounced, or made passive.
- Blocking or synchronous JS, work that belongs in requestAnimationFrame, and repeated DOM insertions that should be batched via a fragment.
- Rebuilt-every-time strings and objects, and O(n²) loops that can be reduced.

HARD CONSTRAINTS:
- Behaviour must be identical. Same outputs, same event ordering, same public function names and signatures.
- Rendered visual output must be pixel-identical. Never change colours, spacing, fonts, or layout.
- Never remove a feature, guard, or edge case to make code faster.
- Never introduce libraries, build steps, or external dependencies.
- If the target code has no meaningful performance issue, return it unchanged and say so in the explanation rather than inventing a change.
- Read all three files first: caching a DOM node is only safe if you can see when that node is created or replaced.
${JSON_CONTRACT_RULES}
- "explanation": list the specific optimizations you made, comma-separated, in 1-2 sentences. Name the actual technique applied (for example: "hoisted the querySelectorAll out of the loop, made the scroll listener passive"). Never claim an optimization you did not make.${NO_PREAMBLE_RULES}`;

// ─── Feature 4: ENHANCE VISUAL DESIGN ─────────────────────────────────────────

const ENHANCE_SYSTEM_PROMPT = `You are a UI/UX design assistant. Given full project context, improve visual design — spacing, typography, color contrast, alignment, modern styling conventions. Preserve all existing functionality and content. Do not remove any elements or features, only restyle.

WHAT TO IMPROVE:
- Spacing: consistent rhythm, a predictable scale, breathing room around and inside components.
- Typography: sensible size hierarchy, line-height around 1.5 for body text, restrained font weights, limited font families.
- Colour: sufficient contrast for legibility (target WCAG AA), a coherent palette, CSS custom properties for repeated values.
- Alignment: shared baselines and edges; flexbox or grid instead of floats, magic margins, or absolute positioning hacks.
- Modern conventions: subtle border-radius, layered shadows over harsh ones, transitions on interactive elements, visible :hover and :focus-visible states, and responsiveness at small widths.

HARD CONSTRAINTS:
- Never delete an element, attribute, id, class hook, or text content. Every id and class referenced by the JS must survive exactly.
- Never change behaviour, event handlers, or JS logic. Prefer CSS-only changes.
- HTML changes are permitted only for structural styling needs (adding a wrapper, adding a class). Never remove or reword content.
- Never add external fonts, icon sets, CSS frameworks, or CDN links. Use system font stacks.
- Check the JS before renaming anything — if a selector is queried in JS, that hook must remain intact.
- Do not restyle unrelated parts of the project outside the target region.
${JSON_CONTRACT_RULES}
- "explanation": list the specific design changes you made, comma-separated, in 1-2 sentences (for example: "raised body contrast to 7:1, unified padding to an 8px scale, added focus-visible rings"). Never claim a change you did not make.${NO_PREAMBLE_RULES}`;

// ─── Feature 5: BUILD WITH AI ─────────────────────────────────────────────────

const GENERATE_SYSTEM_PROMPT = `You are a code generation assistant for a live HTML/CSS/JS editor. Given a plain-English description, generate complete, working HTML, CSS, and JS that fulfills the request. Output must be immediately runnable with no external dependencies unless explicitly requested. Keep code clean and beginner-readable but production-quality.

TARGET ENVIRONMENT — the editor injects your three files into a single live page:
- The html value is BODY CONTENT ONLY. Never emit <!DOCTYPE>, <html>, <head>, <body>, <style>, or <script> tags.
- The css value is a complete stylesheet. It is injected into a <style> tag for you.
- The js value is a complete script. It is injected into a <script> tag for you, and runs after the DOM is parsed. Never use import or export.

CODE QUALITY:
- Fully implement what was asked. No TODOs, no placeholder comments, no stub functions.
- The three files must agree: every selector the JS queries and every class the CSS styles must exist in the html you emit.
- No external dependencies unless the request explicitly names one. No CDN links, no web fonts, no frameworks. Use system font stacks and inline SVG for icons.
- Modern, readable code: const/let over var, arrow functions, template literals, early returns, guard clauses for missing elements.
- Modern CSS: custom properties for the palette, flexbox/grid for layout, a clear spacing scale.
- Include hover and focus-visible states, smooth transitions, and responsive behaviour down to 360px.
- Accessible by default: semantic elements, labels tied to inputs, alt text, and aria attributes on custom controls.
- Use a clean, modern dark theme unless the request specifies otherwise. Honour any explicit styling, colour, or light/dark instruction.
- No alert(); render feedback in the DOM. Never reference an image URL that does not exist — use CSS gradients, shapes, or inline SVG.
- Comment only where intent is genuinely non-obvious.

OUTPUT FORMAT — a single strict JSON object, nothing else:
{"html":"<raw markup>","css":"<raw stylesheet>","js":"<raw script>"}

JSON RULES — violating any of these breaks the editor:
- Return exactly these three keys: html, css, js. Always include all three, even when one is an empty string.
- No text before the opening brace, none after the closing brace.
- Every value is RAW code. Never place markdown code fences (\`\`\`) inside a value.
- Escape string contents so JSON.parse() succeeds on the first attempt: newlines as \\n, double quotes as \\", backslashes as \\\\.
- No trailing commas. No comments inside the JSON structure itself.${NO_PREAMBLE_RULES}`;

// ─── Legacy prompt (secondary features only: improve/suggest/chat) ────────────

const BASE_SYSTEM_PROMPT = `You are "Code Buddy", an AI code assistant built into the GB Coder editor.
You specialize in HTML, CSS, and vanilla JavaScript ONLY.

CRITICAL RULES — follow these strictly:
1. ANSWER ONLY WHAT THE USER ASKS. Do NOT generate unsolicited code, demos, or examples.
2. If the user asks a question, answer ONLY that question concisely.
3. NEVER invent or hallucinate content the user did not request.
4. If the user's message is unclear or too vague, ask a clarifying question instead of guessing.
5. Generate code ONLY when the user explicitly asks for it.
6. Use ONLY plain HTML, CSS, and vanilla JavaScript — no frameworks, no build tools.
7. Keep responses focused. No extra commentary unless asked.

When writing code (only if requested), wrap each language in its own fenced code block:
  HTML   → \`\`\`html ... \`\`\`
  CSS    → \`\`\`css  ... \`\`\`
  JS     → \`\`\`javascript ... \`\`\`
If explanation is needed, write it in plain text outside the code blocks.`;

const SYSTEM_PROMPTS = {
  explain: EXPLAIN_SYSTEM_PROMPT,
  fix: FIX_SYSTEM_PROMPT,
  optimize: OPTIMIZE_SYSTEM_PROMPT,
  enhance: ENHANCE_SYSTEM_PROMPT,
  generate: GENERATE_SYSTEM_PROMPT,
};

// ─── Context injection ────────────────────────────────────────────────────────

const FILE_LABELS = { html: 'html', css: 'css', javascript: 'js' };

const labelFor = (language) => FILE_LABELS[language] || 'js';

/**
 * Renders the FULL current contents of all three files. Sent on every
 * editor-facing request so the model can see cross-file dependencies and
 * avoid fixes that break another file.
 */
function buildProjectContextBlock(projectContext, targetLanguage) {
  const ctx = projectContext || {};
  const target = labelFor(targetLanguage);

  const renderFile = (label, content) => {
    const marker = label === target ? ' (TARGET FILE)' : '';
    const body = typeof content === 'string' && content.length ? content : '(this file is currently empty)';
    return `----- BEGIN FILE: ${label}${marker} -----\n${body}\n----- END FILE: ${label} -----`;
  };

  return [
    '=== FULL PROJECT CONTEXT — current contents of all three files ===',
    'All three files below are the complete, current state of the live editor.',
    'They run together as one page. Read all of them before answering so your',
    'response does not break a dependency in another file.',
    '',
    renderFile('html', ctx.html),
    '',
    renderFile('css', ctx.css),
    '',
    renderFile('js', ctx.javascript),
    '',
    '=== END FULL PROJECT CONTEXT ===',
  ].join('\n');
}

/**
 * Marks the region the model is allowed to change. Full context above stays
 * read-only reference material.
 */
function buildTargetBlock(selectedCode, targetLanguage) {
  const target = labelFor(targetLanguage);
  const hasSelection = typeof selectedCode === 'string' && selectedCode.trim().length > 0;

  if (hasSelection) {
    return [
      '=== TARGET REGION — the user SELECTED this snippet ===',
      `This snippet is located inside the "${target}" file shown above.`,
      'It is the specific region to act on. Everything else in the project is',
      'read-only context: use it to understand dependencies, do not restyle or',
      'rewrite it. Only change another file if the correct change genuinely',
      'belongs there.',
      '',
      '----- BEGIN SELECTED SNIPPET -----',
      selectedCode,
      '----- END SELECTED SNIPPET -----',
      '=== END TARGET REGION ===',
    ].join('\n');
  }

  return [
    '=== TARGET REGION — no snippet selected ===',
    `Nothing is selected, so the ENTIRE "${target}" file shown above is the target.`,
    `Return the complete new contents of the "${target}" file.`,
    'The other two files remain read-only context.',
    '=== END TARGET REGION ===',
  ].join('\n');
}

const STRICT_JSON_RETRY_INSTRUCTION =
  'Return ONLY valid JSON, nothing else. Your previous response could not be parsed by JSON.parse(). ' +
  'Emit a single JSON object starting with { and ending with }. No markdown fences, no prose, no preamble, ' +
  'no explanation outside the JSON. Escape all newlines as \\n and all double quotes as \\" inside string values.';

// ─── Per-feature user messages ────────────────────────────────────────────────

function buildCoreUserMessage(feature, { projectContext, selectedCode, targetLanguage }) {
  const contextBlock = buildProjectContextBlock(projectContext, targetLanguage);
  const targetBlock = buildTargetBlock(selectedCode, targetLanguage);
  const target = labelFor(targetLanguage);

  const tasks = {
    explain:
      'TASK: Explain what the target snippet does, in 3-5 plain-language sentences. ' +
      'Use the full project context only to resolve references. Do not suggest changes. ' +
      'Do not reproduce the code. Plain text only.',
    fix:
      'TASK: Find functional bugs, syntax errors, and broken logic in the target region. ' +
      'Return the corrected code, preserving all unrelated code exactly as-is. ' +
      'Do not restyle and do not add features. If there are no bugs, return the code unchanged ' +
      "and begin the explanation with 'No issues detected'.",
    optimize:
      'TASK: Find and fix performance problems in the target region — inefficient DOM queries, ' +
      'unoptimized CSS selectors, unnecessary reflows, blocking JS. Preserve functionality and ' +
      'visual output exactly. Change efficiency only, never behaviour.',
    enhance:
      'TASK: Improve the visual design of the target region — spacing, typography, colour contrast, ' +
      'alignment, modern styling conventions. Preserve all functionality and content. ' +
      'Remove nothing; restyle only. Keep every id and class the JavaScript depends on.',
  };

  return [contextBlock, '', targetBlock, '', tasks[feature], '', `Target file: ${target}`].join('\n');
}

function buildGenerateUserMessage({ prompt, projectContext }) {
  const lines = [
    'TASK: Build this from scratch as complete, immediately runnable HTML, CSS and JS.',
    '',
    '=== USER REQUEST ===',
    String(prompt || '').trim(),
    '=== END USER REQUEST ===',
  ];

  // The editor is about to be replaced, so existing code is style reference only.
  const ctx = projectContext || {};
  const hasExisting = [ctx.html, ctx.css, ctx.javascript].some((f) => typeof f === 'string' && f.trim());

  if (hasExisting) {
    lines.push(
      '',
      buildProjectContextBlock(ctx, null),
      '',
      'The project context above is the code currently in the editor and will be REPLACED by your output.',
      'Treat it as stylistic reference only. Do not attempt to preserve or extend it unless the request asks you to.',
    );
  }

  lines.push('', 'Return a single JSON object with exactly the keys html, css and js.');
  return lines.join('\n');
}

// ─── Legacy feature prompts (improve / suggest / inline-edit / chat) ──────────

const LEGACY_PROMPTS = {
  improve: (code, ctx) =>
    `Improve the following ${ctx} code. Optimise structure, readability, and best practices.\n` +
    `Return ONLY the improved code in a fenced code block — no extra commentary.\n\n` +
    `\`\`\`${ctx}\n${code}\n\`\`\``,

  suggest: (code, ctx) =>
    `Analyse the following ${ctx} code and provide 3–5 concrete improvement suggestions.\n` +
    `Respond with ONLY a valid JSON array — no markdown, no extra text:\n` +
    `[{"title":"...","description":"...","code":"...","type":"improvement|refactor|performance|security","impact":"high|medium|low"}]\n\n` +
    `\`\`\`${ctx}\n${code}\n\`\`\``,

  inlineEdit: (code, instruction) =>
    `Instruction:\n${instruction || ''}\n\nSelected code:\n${code || ''}`,

  chat: (userMessage, currentCode) => {
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

// ─── Message assembly ─────────────────────────────────────────────────────────

const CORE_FEATURES = new Set(['explain', 'fix', 'optimize', 'enhance', 'generate']);

/**
 * Builds the message array. `strictJson` appends the retry instruction used
 * after a malformed-JSON first attempt.
 */
function buildMessages(feature, payload, strictJson = false) {
  const {
    code,
    selectedCode,
    userMessage,
    prompt,
    instruction,
    language,
    targetLanguage,
    context,
    projectContext,
    currentCode,
  } = payload;

  if (CORE_FEATURES.has(feature)) {
    // Accept the legacy `code` key as a selection alias so older clients work.
    const selection = selectedCode !== undefined ? selectedCode : code;
    const target = targetLanguage || language || null;
    const ctxFiles = projectContext || currentCode || null;

    const userContent =
      feature === 'generate'
        ? buildGenerateUserMessage({ prompt, projectContext: ctxFiles })
        : buildCoreUserMessage(feature, {
            projectContext: ctxFiles,
            selectedCode: selection,
            targetLanguage: target,
          });

    let systemContent = SYSTEM_PROMPTS[feature];
    if (strictJson && feature !== 'explain') {
      systemContent += `\n\nCRITICAL RETRY INSTRUCTION: ${STRICT_JSON_RETRY_INSTRUCTION}`;
    }

    const messages = [
      { role: 'system', content: systemContent },
      { role: 'user', content: userContent },
    ];

    if (strictJson && feature !== 'explain') {
      messages.push({ role: 'user', content: STRICT_JSON_RETRY_INSTRUCTION });
    }

    return messages;
  }

  // ── Secondary features ──
  const ctx = context || language || 'javascript';

  switch (feature) {
    case 'improve':
      return [
        { role: 'system', content: BASE_SYSTEM_PROMPT },
        { role: 'user', content: LEGACY_PROMPTS.improve(code || '', ctx) },
      ];
    case 'suggest':
      return [
        { role: 'system', content: BASE_SYSTEM_PROMPT },
        { role: 'user', content: LEGACY_PROMPTS.suggest(code || '', ctx) },
      ];
    case 'inline-edit':
      return [
        {
          role: 'system',
          content:
            `You are a code editor assistant. The user has selected the following ${ctx} code and wants you to modify it according to their instruction. ` +
            `Return ONLY the modified code - no explanation, no markdown backticks, no preamble. Preserve the original indentation. ` +
            `If the instruction is unclear, make your best interpretation and apply it.`,
        },
        { role: 'user', content: LEGACY_PROMPTS.inlineEdit(code || '', instruction || '') },
      ];
    case 'chat':
      return [
        { role: 'system', content: BASE_SYSTEM_PROMPT },
        { role: 'user', content: LEGACY_PROMPTS.chat(userMessage || '', currentCode) },
      ];
    default:
      throw new Error(`Unknown feature: ${feature}`);
  }
}

// ─── JSON validation helper (mirrors the client-side validator) ───────────────

function stripFences(text) {
  const trimmed = String(text || '').trim();
  const fenced = trimmed.match(/^```(?:[a-zA-Z]+)?\s*\n?([\s\S]*?)\n?```$/);
  return (fenced ? fenced[1] : trimmed).trim();
}

/** Returns the parsed object, or null when the text is not usable JSON. */
function tryParseJsonObject(text) {
  const candidate = stripFences(text);
  if (!candidate) return null;

  const attempt = (value) => {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  const direct = attempt(candidate);
  if (direct) return direct;

  const first = candidate.indexOf('{');
  const last = candidate.lastIndexOf('}');
  if (first === -1 || last <= first) return null;

  return attempt(candidate.slice(first, last + 1));
}

/** Checks the parsed object against the feature's key contract. */
function satisfiesContract(feature, parsed) {
  if (!parsed) return false;

  if (feature === 'generate') {
    // At least one non-empty file, and every present key must be a string.
    const keys = ['html', 'css', 'js', 'javascript'];
    const present = keys.filter((key) => parsed[key] !== undefined);
    if (present.length === 0) return false;
    if (present.some((key) => typeof parsed[key] !== 'string')) return false;
    return present.some((key) => String(parsed[key]).trim().length > 0);
  }

  return typeof parsed.fixedCode === 'string' && typeof parsed.file === 'string';
}

// ─── NVIDIA API caller ────────────────────────────────────────────────────────

async function callNvidiaAI(messages, options = {}) {
  if (!API_KEY) {
    throw new Error('NVIDIA_API_KEY is not set in environment variables.');
  }

  const { stream = false, temperature = 0.6, maxTokens = 16384 } = options;

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
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    Accept: stream ? 'text/event-stream' : 'application/json',
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
        response.data.on('data', (c) => {
          buf += c.toString();
        });
        response.data.on('end', () => {
          errBody = buf;
          resolve();
        });
        response.data.on('error', resolve);
      });
    } else {
      errBody = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    }
    throw new Error(`NVIDIA API returned ${response.status}: ${errBody.slice(0, 200)}`);
  }

  if (stream) return response.data;

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('NVIDIA returned an empty response.');
  return content;
}

/**
 * Calls the model and, if the call fails or the output is not valid JSON
 * matching the feature contract, retries EXACTLY ONCE with a stricter
 * "Return ONLY valid JSON, nothing else" instruction appended.
 */
async function completeWithJsonRetry(feature, payload, options) {
  let firstError = null;
  let rawFirst = '';

  try {
    rawFirst = await callNvidiaAI(buildMessages(feature, payload, false), options);
    const parsed = tryParseJsonObject(rawFirst);
    if (satisfiesContract(feature, parsed)) {
      return { raw: rawFirst, retried: false };
    }
  } catch (err) {
    firstError = err;
  }

  // ── Single stricter retry ──
  try {
    const rawSecond = await callNvidiaAI(buildMessages(feature, payload, true), options);
    const parsed = tryParseJsonObject(rawSecond);
    if (satisfiesContract(feature, parsed)) {
      return { raw: rawSecond, retried: true };
    }
    // Hand the client the retry output; its validator produces the final error.
    return { raw: rawSecond, retried: true, malformed: true };
  } catch (retryErr) {
    throw firstError || retryErr;
  }
}

// ─── Valid features ───────────────────────────────────────────────────────────

const VALID_FEATURES = new Set([
  'explain',
  'fix',
  'optimize',
  'enhance',
  'generate',
  'improve',
  'suggest',
  'inline-edit',
  'chat',
]);

// Full context means three whole files per request, so the cap is generous.
const MAX_BODY_LEN = 180_000;

// ─── Handler ──────────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests — please wait a moment.' });
  }

  const body = req.body || {};
  const {
    feature,
    code,
    selectedCode,
    userMessage,
    prompt,
    instruction,
    language,
    targetLanguage,
    context,
    projectContext,
    currentCode,
    conversationHistory,
  } = body;

  if (!feature || !VALID_FEATURES.has(feature)) {
    return res.status(400).json({
      error: `Invalid feature "${feature}". Must be one of: ${[...VALID_FEATURES].join(', ')}`,
    });
  }

  const files = projectContext || currentCode || {};
  const totalLen = [
    code,
    selectedCode,
    userMessage,
    prompt,
    instruction,
    files.html,
    files.css,
    files.javascript,
    context,
  ]
    .filter((v) => typeof v === 'string')
    .join('').length;

  if (totalLen > MAX_BODY_LEN) {
    return res.status(413).json({ error: 'Payload too large — please reduce the code size.' });
  }

  if (feature === 'generate' && !String(prompt || '').trim()) {
    return res.status(400).json({ error: 'A prompt is required to build with AI.' });
  }

  const payload = {
    code,
    selectedCode,
    userMessage,
    prompt,
    instruction,
    language,
    targetLanguage,
    context,
    projectContext: files,
    currentCode,
  };

  try {
    // ── STREAMING — chat feature ──────────────────────────────────────────
    if (feature === 'chat') {
      const messages = buildMessages(feature, payload);

      if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        const history = conversationHistory.slice(-6).map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: String(m.content ?? ''),
        }));
        messages.splice(1, 0, ...history);
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let nvidiaStream;
      try {
        nvidiaStream = await callNvidiaAI(messages, { stream: true, temperature: 0.7 });
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
            if (delta) res.write(`data: ${JSON.stringify({ delta })}\n\n`);
          } catch {
            // malformed SSE chunk — skip
          }
        }
      });

      nvidiaStream.on('end', () => {
        res.write('data: [DONE]\n\n');
        res.end();
      });

      nvidiaStream.on('error', () => {
        try {
          res.write(`data: ${JSON.stringify({ error: 'Stream interrupted.' })}\n\n`);
          res.end();
        } catch {}
      });

      req.on('close', () => {
        try {
          nvidiaStream.destroy();
        } catch {}
      });

      return;
    }

    // ── JSON-mode core features: fix / optimize / enhance / generate ───────
    if (feature === 'fix' || feature === 'optimize' || feature === 'enhance' || feature === 'generate') {
      // Temperature 0 for edits (determinism), warmer for creative generation.
      const options =
        feature === 'generate'
          ? { stream: false, temperature: 0.55, maxTokens: 8192 }
          : { stream: false, temperature: 0.15, maxTokens: 16384 };

      const { raw, retried, malformed } = await completeWithJsonRetry(feature, payload, options);

      return res.json({ result: raw, jsonMode: true, retried: !!retried, malformed: !!malformed });
    }

    // ── Plain-text core feature: explain ──────────────────────────────────
    if (feature === 'explain') {
      const result = await callNvidiaAI(buildMessages(feature, payload), {
        stream: false,
        temperature: 0.3,
        maxTokens: 1024,
      });
      return res.json({ result, jsonMode: false });
    }

    // ── Secondary features ────────────────────────────────────────────────
    const result = await callNvidiaAI(buildMessages(feature, payload), {
      stream: false,
      temperature: 0.6,
    });

    if (feature === 'inline-edit') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).send(result);
    }

    return res.json({ result });
  } catch (err) {
    const message = err?.message || 'Unknown error';
    const clientMsg = message.includes('NVIDIA_API_KEY')
      ? 'AI not configured — NVIDIA_API_KEY missing in environment variables'
      : message.includes('ECONNREFUSED') || message.includes('ENOTFOUND')
        ? 'Cannot reach NVIDIA API — check internet connection.'
        : message.includes('timeout')
          ? 'AI request timed out — please try again.'
          : `AI error: ${message}`;

    return res.status(502).json({ error: clientMsg });
  }
};

// Exported for testing / reuse.
module.exports.SYSTEM_PROMPTS = SYSTEM_PROMPTS;
module.exports.buildMessages = buildMessages;
module.exports.tryParseJsonObject = tryParseJsonObject;
