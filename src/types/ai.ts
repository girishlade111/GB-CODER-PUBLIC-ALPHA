/**
 * Shared contracts for every GB Coder AI feature.
 *
 * The server (`api/ai.js`) owns the system prompts; this module owns the
 * request shape it is called with and the strict validation of what comes
 * back. Nothing from the AI is ever applied to an editor before it has
 * passed through the validators in this file.
 */

import { EditorLanguage } from './index';

/** The five core AI features. */
export type AiFeature = 'explain' | 'fix' | 'optimize' | 'enhance' | 'generate';

/**
 * File keys used inside AI JSON payloads. Deliberately short (`js`, not
 * `javascript`) because that is what the system prompts specify.
 */
export type AiFileKey = 'html' | 'css' | 'js';

/**
 * The FULL current contents of all three editor files. This is always sent
 * with every AI request so the model can reason about cross-file
 * dependencies (a selector in CSS referencing a class in HTML, a
 * `getElementById` in JS referencing an id in HTML, etc.).
 */
export interface ProjectContext {
  html: string;
  css: string;
  javascript: string;
  /**
   * Full contents of every file in a multi-file React/Vue project.
   *
   * When present the server renders these instead of the three fixed files, so
   * the AI sees the whole project and can reason about cross-file imports. The
   * three keys above stay populated for plain projects and for backward
   * compatibility with the existing request contract.
   */
  files?: Array<{ path: string; language: string; content: string }>;
  /** Which file the operation targets, for multi-file projects. */
  activePath?: string;
  projectType?: 'plain' | 'react' | 'vue';
}

/** Request body posted to `POST /api/ai`. */
export interface AiRequest {
  feature: AiFeature;
  /** Full contents of all three files. Required for the 4 editor features. */
  projectContext?: ProjectContext;
  /** The user's highlighted snippet, if any. Empty string means "whole file". */
  selectedCode?: string;
  /** Which file the selection (or the operation) targets. */
  targetLanguage?: EditorLanguage;
  /** Natural-language description — `generate` only. */
  prompt?: string;
  /**
   * Set by the retry path. Appends a stricter
   * "Return ONLY valid JSON, nothing else" instruction.
   */
  strictJson?: boolean;
}

/** Envelope returned by `POST /api/ai`. */
export interface AiResponseEnvelope {
  /** Raw model text. Still parsed + validated client-side before use. */
  result?: string;
  /** True when the feature is contractually required to return JSON. */
  jsonMode?: boolean;
  /** True when the server already had to retry once for malformed JSON. */
  retried?: boolean;
  error?: string;
}

/**
 * Output contract for `fix`, `optimize` and `enhance`.
 * `fixedCode` is a drop-in replacement for the target region: the user's
 * selection when `file` matches the selected file, otherwise the COMPLETE
 * contents of `file`.
 */
export interface CodeChangePayload {
  file: AiFileKey;
  fixedCode: string;
  explanation: string;
}

/** Output contract for `generate` (Build with AI). All three keys always present. */
export interface GeneratedProjectPayload {
  html: string;
  css: string;
  js: string;
}

/** Thrown when AI output cannot be parsed or fails contract validation. */
export class AiParseError extends Error {
  readonly raw: string;

  constructor(message: string, raw = '') {
    super(message);
    this.name = 'AiParseError';
    this.raw = raw;
  }
}

/** Thrown for transport/HTTP/timeout failures. */
export class AiRequestError extends Error {
  readonly status: number;
  readonly retryable: boolean;

  constructor(message: string, status = 0, retryable = true) {
    super(message);
    this.name = 'AiRequestError';
    this.status = status;
    this.retryable = retryable;
  }
}

const FILE_KEYS: readonly AiFileKey[] = ['html', 'css', 'js'];

/** Maps the short AI file key onto the editor's language identifier. */
export const fileKeyToLanguage = (key: AiFileKey): EditorLanguage =>
  key === 'js' ? 'javascript' : key;

/** Maps an editor language onto the short AI file key. */
export const languageToFileKey = (language: EditorLanguage): AiFileKey =>
  language === 'javascript' ? 'js' : language;

/**
 * Removes markdown code fences the model may have wrapped its output in,
 * despite being told not to. Leaves fence-free text untouched.
 */
export const stripCodeFences = (text: string): string => {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:[a-zA-Z]+)?\s*\n?([\s\S]*?)\n?```$/);
  return (fenced ? fenced[1] : trimmed).trim();
};

/**
 * Parses AI output into an object, tolerating the two failure modes we see in
 * practice: markdown fences, and leading/trailing prose. Throws AiParseError
 * if no valid JSON object can be recovered.
 */
export const parseAiJson = (rawText: string): unknown => {
  if (typeof rawText !== 'string' || !rawText.trim()) {
    throw new AiParseError('AI returned an empty response.', rawText ?? '');
  }

  const candidate = stripCodeFences(rawText);

  try {
    return JSON.parse(candidate);
  } catch {
    // Fall back to slicing the outermost object out of surrounding prose.
    const firstBrace = candidate.indexOf('{');
    const lastBrace = candidate.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace <= firstBrace) {
      throw new AiParseError('AI response was not valid JSON.', rawText);
    }

    try {
      return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
    } catch {
      throw new AiParseError('AI response was not valid JSON.', rawText);
    }
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Validates the `{ file, fixedCode, explanation }` contract used by
 * fix / optimize / enhance. Returns a normalised payload with fences stripped.
 */
export const validateCodeChangePayload = (
  parsed: unknown,
  rawText = '',
): CodeChangePayload => {
  if (!isRecord(parsed)) {
    throw new AiParseError('AI response was not a JSON object.', rawText);
  }

  const file = String(parsed.file ?? '').toLowerCase();
  const normalisedFile: AiFileKey | null =
    file === 'javascript' ? 'js' : FILE_KEYS.includes(file as AiFileKey) ? (file as AiFileKey) : null;

  if (!normalisedFile) {
    throw new AiParseError(
      `AI response had an invalid "file" value: "${parsed.file}". Expected html, css or js.`,
      rawText,
    );
  }

  if (typeof parsed.fixedCode !== 'string') {
    throw new AiParseError('AI response was missing the "fixedCode" string.', rawText);
  }

  const fixedCode = stripCodeFences(parsed.fixedCode);

  if (!fixedCode) {
    throw new AiParseError('AI returned empty code — nothing to apply.', rawText);
  }

  return {
    file: normalisedFile,
    fixedCode,
    explanation:
      typeof parsed.explanation === 'string' && parsed.explanation.trim()
        ? parsed.explanation.trim()
        : 'No explanation provided.',
  };
};

/**
 * Validates the `{ html, css, js }` contract used by Build with AI.
 * All three keys are always returned, defaulting to an empty string.
 */
export const validateGeneratedProject = (
  parsed: unknown,
  rawText = '',
): GeneratedProjectPayload => {
  if (!isRecord(parsed)) {
    throw new AiParseError('AI response was not a JSON object.', rawText);
  }

  // Accept `javascript` as an alias so older/looser model output still works.
  const jsValue = parsed.js ?? parsed.javascript ?? '';

  const payload: GeneratedProjectPayload = {
    html: typeof parsed.html === 'string' ? stripCodeFences(parsed.html) : '',
    css: typeof parsed.css === 'string' ? stripCodeFences(parsed.css) : '',
    js: typeof jsValue === 'string' ? stripCodeFences(jsValue) : '',
  };

  if (!payload.html && !payload.css && !payload.js) {
    throw new AiParseError('AI returned no code for any file.', rawText);
  }

  return payload;
};

/** Features whose output must be strict JSON. `explain` returns plain text. */
export const JSON_MODE_FEATURES: readonly AiFeature[] = ['fix', 'optimize', 'enhance', 'generate'];

export const isJsonModeFeature = (feature: AiFeature): boolean =>
  JSON_MODE_FEATURES.includes(feature);
