/**
 * Fuzzy intent matching.
 *
 * Runs *after* normalization (which is unchanged) and replaces the exact regex
 * grammar. A normalized transcript is scored against every synonym of every
 * registered intent using significant-token overlap weighted by word order, so
 * phrasing variants nobody enumerated still land on the right action.
 *
 * Pure and synchronous: no browser APIs, so the whole scoring layer is unit
 * testable.
 */
import {
  VoiceActionId,
  VoiceCapabilities,
  VoiceIntent,
  VOICE_INTENTS,
  isIntentAvailable,
} from './voiceIntentRegistry';

/** Execute outright at or above this score. */
export const EXECUTE_THRESHOLD = 0.6;
/** Between this and {@link EXECUTE_THRESHOLD}, ask "did you mean …?". */
export const SUGGEST_THRESHOLD = 0.4;
/**
 * A whole-phrase match this strong is taken as final, skipping parameter
 * extraction. This is what keeps "build with ai" (an exact synonym) from being
 * read as the `build` trigger plus a parameter of "with ai".
 */
export const STRONG_MATCH = 0.85;

export type MatchConfidence = 'high' | 'medium' | 'low';

export interface IntentMatch {
  id: VoiceActionId;
  intent: VoiceIntent;
  /** Canonical parameter, or undefined for parameterless intents. */
  param?: string;
  /** 0–1 similarity of the best scoring phrase. */
  score: number;
  confidence: MatchConfidence;
  /** The synonym or trigger that produced the score, for logging. */
  matchedPhrase: string;
}

/*
 * Filler with no discriminating power. Removing it is what makes "copy code" and
 * "copy code to clipboard" score alike: dropping "to" and "the" leaves
 * [copy, code, clipboard], which covers the [copy, code] synonym at 0.67 rather
 * than being diluted below the execute threshold.
 *
 * Deliberately conservative — words that distinguish real commands (with, code,
 * file, all, new) are kept.
 */
const STOPWORDS = new Set([
  'the', 'a', 'an', 'to', 'of', 'for', 'my', 'me', 'i', 'is', 'are', 'be',
  'this', 'that', 'it', 'them', 'they', 'please', 'and', 'on', 'at', 'as',
  'in', 'into', 'up', 'out', 'do', 'does', 'did', 'some', 'any',
]);

/** Splits on whitespace, dropping empties. */
export const tokenize = (text: string): string[] => text.split(/\s+/).filter(Boolean);

const isSignificant = (token: string): boolean => !STOPWORDS.has(token);

/**
 * Very light suffix stripping so speech-engine variants collapse together:
 * "optimizing"/"optimize" and "files"/"file" compare equal. Deliberately
 * simplistic — a real stemmer would over-merge unrelated command words.
 */
export const stem = (token: string): string => {
  if (token.length <= 3) return token;
  for (const suffix of ['ing', 'ed', 'es', 's']) {
    if (token.length - suffix.length >= 3 && token.endsWith(suffix)) {
      return token.slice(0, token.length - suffix.length);
    }
  }
  return token;
};

/** Levenshtein distance, abandoned once it exceeds `max`. */
export const boundedEditDistance = (a: string, b: string, max = 1): number => {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      rowMin = Math.min(rowMin, current[j]);
    }
    // Whole row already worse than the budget: no path can recover.
    if (rowMin > max) return max + 1;
    previous = current;
  }

  return previous[b.length];
};

/**
 * Whether two tokens should count as the same word.
 *
 * Speech recognition produces spelling and inflection variants freely
 * ("optimise" vs "optimize"), so equality alone loses real matches.
 */
export const tokensMatch = (a: string, b: string): boolean => {
  if (a === b) return true;
  const sa = stem(a);
  const sb = stem(b);
  if (sa === sb) return true;
  // One a prefix of the other, e.g. "config"/"configure".
  if (sa.length >= 4 && sb.length >= 4 && (sa.startsWith(sb) || sb.startsWith(sa))) return true;
  /*
   * Single-character slips ("optimise"/"optimize"), but only when the words
   * start with the same letter. Without that guard "light" and "night" are one
   * edit apart, which silently turned "switch to light" into dark mode.
   */
  if (
    sa[0] === sb[0] &&
    Math.min(sa.length, sb.length) >= 5 &&
    boundedEditDistance(sa, sb, 1) <= 1
  ) {
    return true;
  }
  return false;
};

/**
 * Token-overlap similarity with a word-order bonus.
 *
 * base   = matched significant tokens / tokens in the longer phrase
 * bonus  = up to +0.1 when the matched tokens appear in the same relative order
 *
 * Dividing by the longer phrase is what stops a one-word synonym from matching
 * a long unrelated sentence.
 */
export const similarity = (transcriptTokens: string[], phraseTokens: string[]): number => {
  if (transcriptTokens.length === 0 || phraseTokens.length === 0) return 0;

  const consumed = new Array<boolean>(transcriptTokens.length).fill(false);
  /** Index in the transcript that each matched phrase token landed on. */
  const positions: number[] = [];

  for (const phraseToken of phraseTokens) {
    let hit = -1;
    for (let i = 0; i < transcriptTokens.length; i += 1) {
      if (consumed[i]) continue;
      if (tokensMatch(phraseToken, transcriptTokens[i])) {
        hit = i;
        break;
      }
    }
    if (hit !== -1) {
      consumed[hit] = true;
      positions.push(hit);
    }
  }

  const matched = positions.length;
  if (matched === 0) return 0;

  const base = matched / Math.max(transcriptTokens.length, phraseTokens.length);

  // Order proximity: reward matches that appear in the same sequence.
  let ordered = true;
  for (let i = 1; i < positions.length; i += 1) {
    if (positions[i] < positions[i - 1]) {
      ordered = false;
      break;
    }
  }
  const bonus = ordered && matched >= 2 ? 0.1 * (matched / phraseTokens.length) : 0;

  return Math.min(1, base + bonus);
};

/*
 * Nouns that name the surface rather than the thing being opened. "open the
 * settings panel" and "open settings" must resolve identically.
 */
const PARAM_NOISE = new Set([
  'panel', 'modal', 'dialog', 'tab', 'page', 'gallery', 'dashboard',
  'manager', 'view', 'window', 'section', 'screen',
]);

/** Significant tokens of a phrase, stripped of filler. */
const significantTokens = (text: string): string[] => tokenize(text).filter(isSignificant);

/**
 * Resolves a spoken parameter against a fixed vocabulary, exactly first and
 * fuzzily second. The fuzzy pass matters for leftovers like "to dark" once a
 * trigger has consumed "switch".
 */
export const resolveVocabulary = (
  spoken: string,
  vocabulary: Readonly<Record<string, string>>,
): string | null => {
  const trimmed = spoken.trim();
  if (!trimmed) return null;

  const exact = vocabulary[trimmed];
  if (exact) return exact;

  const spokenTokens = significantTokens(trimmed).filter((token) => !PARAM_NOISE.has(token));
  if (spokenTokens.length === 0) return null;

  let best: { value: string; score: number } | null = null;
  for (const [key, value] of Object.entries(vocabulary)) {
    const score = similarity(spokenTokens, significantTokens(key));
    if (score >= EXECUTE_THRESHOLD && (!best || score > best.score)) {
      best = { value, score };
    }
  }

  return best?.value ?? null;
};

const confidenceFor = (score: number): MatchConfidence =>
  score >= EXECUTE_THRESHOLD ? 'high' : score >= SUGGEST_THRESHOLD ? 'medium' : 'low';

interface Candidate {
  intent: VoiceIntent;
  param?: string;
  score: number;
  matchedPhrase: string;
  /** Significant tokens consumed by a trigger; used as a tie-break. */
  triggerWeight: number;
}

/**
 * Aligns a trigger phrase against the start of the transcript.
 *
 * Every token of the trigger must appear, in order, allowing filler words in
 * the transcript to be skipped over ("change *the* theme to dark"). Matching the
 * trigger's own filler literally is what makes "make me a portfolio hero" hand
 * back "a portfolio hero" rather than "me a portfolio hero".
 *
 * @returns index of the first token after the trigger, or -1 if it does not lead.
 */
const alignTrigger = (rawTokens: string[], trigger: string): number => {
  const triggerTokens = tokenize(trigger);
  if (triggerTokens.length === 0) return -1;

  let cursor = 0;
  for (const triggerToken of triggerTokens) {
    // Skip transcript filler, but never a word the trigger is looking for.
    while (
      cursor < rawTokens.length &&
      !isSignificant(rawTokens[cursor]) &&
      !tokensMatch(triggerToken, rawTokens[cursor])
    ) {
      cursor += 1;
    }
    if (cursor >= rawTokens.length || !tokensMatch(triggerToken, rawTokens[cursor])) return -1;
    cursor += 1;
  }

  return cursor;
};

/**
 * Scores the whole utterance against every synonym.
 */
const scoreSynonyms = (normalized: string, intents: VoiceIntent[]): Candidate | null => {
  const transcriptTokens = significantTokens(normalized);
  if (transcriptTokens.length === 0) return null;

  let best: Candidate | null = null;

  for (const intent of intents) {
    for (const synonym of intent.synonyms) {
      // An exact phrase is unambiguous; short-circuit to a perfect score.
      const score =
        synonym === normalized ? 1 : similarity(transcriptTokens, significantTokens(synonym));

      if (!best || score > best.score) {
        best = {
          intent,
          score,
          matchedPhrase: synonym,
          triggerWeight: 0,
          /*
           * Some synonyms are shorthand for a specific parameter: "screenshot"
           * means "export as png", not "export, unspecified".
           */
          param: intent.defaultParam,
        };
      }
    }
  }

  return best;
};

/**
 * Matches an utterance that is *only* a parameter value: "settings",
 * "dark mode", "console".
 *
 * The old grammar had a dedicated bare-name pattern for this; without an
 * equivalent, single-word commands had nothing to score against because
 * vocabulary intents carry no synonyms of their own.
 */
const scoreBareVocabulary = (normalized: string, intents: VoiceIntent[]): Candidate[] => {
  const candidates: Candidate[] = [];

  for (const intent of intents) {
    if (!intent.allowBareParam || !intent.paramVocabulary) continue;
    const resolved = resolveVocabulary(normalized, intent.paramVocabulary);
    if (!resolved) continue;

    candidates.push({
      intent,
      param: resolved,
      /*
       * Below a trigger-plus-value match: naming a value with no verb is
       * weaker evidence of intent than "open settings".
       */
      score: 0.8,
      matchedPhrase: normalized,
      triggerWeight: 0,
    });
  }

  return candidates;
};

/**
 * Attempts trigger-prefix extraction for parameterized intents.
 *
 * The trigger's significant tokens must be a prefix of the transcript's, which
 * keeps "open settings" from being read as a build description while still
 * allowing filler between words ("change *the* theme to dark").
 */
const scoreParameterized = (normalized: string, intents: VoiceIntent[]): Candidate[] => {
  const rawTokens = tokenize(normalized);
  const candidates: Candidate[] = [];

  for (const intent of intents) {
    if (intent.paramKind === 'none' || !intent.triggers) continue;

    for (const trigger of intent.triggers) {
      const consumedRaw = alignTrigger(rawTokens, trigger);
      if (consumedRaw === -1) continue;

      // Everything after the trigger, with original wording intact.
      const remainder = rawTokens.slice(consumedRaw).join(' ').trim();
      if (significantTokens(remainder).length === 0) continue;

      const triggerTokens = tokenize(trigger);

      if (intent.paramKind === 'vocabulary') {
        const resolved = intent.paramVocabulary
          ? resolveVocabulary(remainder, intent.paramVocabulary)
          : null;
        if (!resolved) continue;
        candidates.push({
          intent,
          param: resolved,
          // A trigger plus a recognised vocabulary value is strong evidence.
          score: Math.min(0.99, 0.9 + 0.01 * triggerTokens.length),
          matchedPhrase: trigger,
          triggerWeight: triggerTokens.length,
        });
        continue;
      }

      const param =
        intent.paramKind === 'whole'
          ? normalized
          : (intent.finalizeParam ?? ((value: string) => value))(remainder);

      if (!param) continue;

      candidates.push({
        intent,
        param,
        /*
         * Free-text parameters score below vocabulary matches: a recognised
         * value is harder evidence than "some words followed the verb".
         */
        score: Math.min(
          0.95,
          (intent.paramKind === 'whole' ? 0.78 : 0.84) + 0.01 * triggerTokens.length,
        ),
        matchedPhrase: trigger,
        triggerWeight: triggerTokens.length,
      });
    }
  }

  return candidates;
};

/** Prefers score, then the more specific trigger. */
const better = (a: Candidate, b: Candidate): Candidate => {
  if (b.score > a.score) return b;
  if (b.score === a.score && b.triggerWeight > a.triggerWeight) return b;
  return a;
};

/**
 * Resolves a normalized transcript to an intent.
 *
 * Returns the best candidate regardless of score; the caller decides what to do
 * based on `confidence` (execute / confirm / reject), which keeps the threshold
 * policy in one place at the service layer.
 */
export const matchIntent = (
  normalized: string,
  capabilities: VoiceCapabilities = {},
): IntentMatch | null => {
  if (!normalized.trim()) return null;

  const intents = VOICE_INTENTS.filter((intent) => isIntentAvailable(intent, capabilities));

  const synonymBest = scoreSynonyms(normalized, intents);

  // A confident whole-phrase match wins before parameters are considered.
  if (synonymBest && synonymBest.score >= STRONG_MATCH) {
    return toMatch(synonymBest);
  }

  let best = synonymBest;
  for (const candidate of [
    ...scoreParameterized(normalized, intents),
    ...scoreBareVocabulary(normalized, intents),
  ]) {
    best = best ? better(best, candidate) : candidate;
  }

  return best ? toMatch(best) : null;
};

const toMatch = (candidate: Candidate): IntentMatch => ({
  id: candidate.intent.id,
  intent: candidate.intent,
  param: candidate.param,
  score: Math.round(candidate.score * 1000) / 1000,
  confidence: confidenceFor(candidate.score),
  matchedPhrase: candidate.matchedPhrase,
});
