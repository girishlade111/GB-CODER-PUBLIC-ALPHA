/**
 * Voice command parsing — a pure module with no browser dependencies.
 *
 * Pipeline:
 *   1. normalize   (this file — unchanged)
 *   2. fuzzy match (`voiceMatcher` against `voiceIntentRegistry`)
 *
 * Step 2 previously used per-action regex arrays, where a phrasing that nobody
 * wrote down simply failed. Normalization and canonicalization are untouched;
 * only the matching step was replaced.
 */
import { matchIntent } from './voiceMatcher';
import type { MatchConfidence } from './voiceMatcher';
import {
  MODAL_ALIASES,
  EXPORT_ALIASES,
  VoiceActionId,
  VoiceCapabilities,
  VoiceExportTarget,
  VoiceModalTarget,
  getListedIntents,
} from './voiceIntentRegistry';

export type {
  VoiceActionId,
  VoiceDispatchAction,
  VoiceModalTarget,
  VoiceExportTarget,
  VoicePanelTarget,
  VoiceIntent,
  VoiceCapabilities,
  VoiceCategory,
} from './voiceIntentRegistry';
export type { MatchConfidence } from './voiceMatcher';
export {
  UNRECOGNIZED_MESSAGE,
  VOICE_SUGGESTIONS,
  VOICE_INTENTS,
  getIntent,
  getIntentsByCategory,
  getListedIntents,
  spokenTextToPath,
} from './voiceIntentRegistry';
export { EXECUTE_THRESHOLD, SUGGEST_THRESHOLD, matchIntent } from './voiceMatcher';

export interface VoiceCommandMatch {
  id: VoiceActionId;
  /** Resolved parameter, already canonicalised where a vocabulary applies. */
  param?: string;
  /** What the user actually said, untouched. */
  transcript: string;
  /** The lower-cased, de-punctuated form the matcher scored against. */
  normalized: string;
  description: string;
  /** 0–1 similarity of the best scoring phrase. */
  score: number;
  /** `high` executes, `medium` asks for confirmation, `low` is rejected. */
  confidence: MatchConfidence;
  /** The synonym or trigger phrase that produced the score. */
  matchedPhrase: string;
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * Normalization — unchanged.
 *
 * Filler that carries no instruction. Stripped before matching so "GB, please
 * run the code" and "run code" take the same path.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const WAKE_WORD = /^(?:hey |ok |okay |yo )?(?:gb coder|gb|coder)[,:]?\s+/;
const POLITENESS = /^(?:please|can you|could you|would you|will you|i want (?:you )?to|i'?d like (?:you )?to|let'?s|lets|now|just|go ahead and)\s+/;
const TRAILING_POLITENESS = /\s+(?:please|thanks|thank you|for me)$/;

/**
 * Lower-cases, removes punctuation and filler, and collapses whitespace.
 * Speech engines return unpredictable casing and trailing periods, so all
 * matching happens against the normalized form.
 */
export const normalizeTranscript = (raw: string): string => {
  let text = (raw ?? '')
    .toLowerCase()
    // Smart quotes and dashes that speech engines emit.
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, ' ')
    // Punctuation carries no meaning for command matching.
    .replace(/[.,!?;:"()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  text = text.replace(WAKE_WORD, '').trim();

  // Politeness can stack ("please can you run the code").
  for (let i = 0; i < 3; i += 1) {
    const stripped = text.replace(POLITENESS, '').trim();
    if (stripped === text) break;
    text = stripped;
  }

  text = text.replace(TRAILING_POLITENESS, '').trim();

  return text;
};

/** Canonicalises a spoken modal name. Retained for callers outside the matcher. */
export const resolveModalTarget = (spoken: string): VoiceModalTarget | undefined =>
  MODAL_ALIASES[spoken.trim()];

/** Canonicalises a spoken export format. */
export const resolveExportTarget = (spoken: string): VoiceExportTarget | undefined =>
  EXPORT_ALIASES[spoken.trim()];

/**
 * Normalizes then fuzzily matches a raw transcript.
 *
 * Always returns the best candidate it found, including weak ones — the caller
 * inspects `confidence` to decide between executing, confirming, and rejecting.
 * Returns `null` only when there was nothing to score at all.
 */
export const parseVoiceCommand = (
  raw: string,
  capabilities: VoiceCapabilities = {},
): VoiceCommandMatch | null => {
  const normalized = normalizeTranscript(raw);
  if (!normalized) return null;

  const match = matchIntent(normalized, capabilities);
  if (!match) return null;

  return {
    id: match.id,
    param: match.param,
    transcript: raw.trim(),
    normalized,
    description: match.intent.description,
    score: match.score,
    confidence: match.confidence,
    matchedPhrase: match.matchedPhrase,
  };
};

/**
 * Commands to advertise in the panel.
 *
 * Derived from the registry so the list and its count cannot drift from what is
 * actually matchable.
 */
export const getVisibleCommands = (capabilities: VoiceCapabilities = {}) =>
  getListedIntents(capabilities).map((intent) => ({
    id: intent.id,
    description: intent.description,
    examples: intent.examples,
    category: intent.category,
  }));
