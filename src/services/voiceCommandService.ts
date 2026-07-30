/**
 * Voice command service — owns the browser's Web Speech API.
 *
 * Entirely client-side: `SpeechRecognition` for input and `SpeechSynthesis` for
 * optional spoken feedback. There is no server involved in recognition.
 *
 * The grammar lives in `voiceCommandParser` (pure, testable). This module is
 * only responsible for microphone lifecycle, transcript accumulation, error
 * translation, and broadcasting the resolved action on a `voice-command` event.
 */
import {
  UNRECOGNIZED_MESSAGE,
  VoiceActionId,
  VoiceCapabilities,
  VoiceDispatchAction,
  getIntent,
  getIntentsByCategory,
  getListedIntents,
  normalizeTranscript,
  parseVoiceCommand,
} from './voiceCommandParser';

export type {
  VoiceActionId,
  VoiceDispatchAction,
  VoiceExportTarget,
  VoiceModalTarget,
  VoicePanelTarget,
  VoiceCapabilities,
  VoiceIntent,
  VoiceCategory,
} from './voiceCommandParser';
export {
  UNRECOGNIZED_MESSAGE,
  VOICE_SUGGESTIONS,
  EXECUTE_THRESHOLD,
  SUGGEST_THRESHOLD,
  getIntentsByCategory,
} from './voiceCommandParser';

/**
 * Lifecycle shown in the overlay.
 *
 * `switching` covers the language swap, which requires destroying and rebuilding
 * the recognition instance and so is not instant. `confirming` is the
 * "did you mean …?" state for a borderline fuzzy match.
 */
export type VoiceStatus =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'done'
  | 'error'
  | 'switching'
  | 'confirming';

export type VoiceErrorCode =
  | 'unsupported'
  | 'not-allowed'
  | 'no-speech'
  | 'audio-capture'
  | 'network'
  | 'aborted'
  | 'unknown';

export interface VoiceError {
  code: VoiceErrorCode;
  message: string;
  /** Actionable remediation, shown beneath the message when present. */
  hint?: string;
}

export interface VoiceCommandDetail {
  action: VoiceDispatchAction;
  param?: string;
  transcript: string;
}

/**
 * Every recognition attempt, dispatched on `voice-attempt` so the app can mirror
 * it into the Console tab. Makes misfires diagnosable without devtools.
 */
export interface VoiceAttemptDetail {
  transcript: string;
  normalized: string;
  /** Null when nothing scored above the rejection floor. */
  action: VoiceActionId | null;
  param?: string;
  score: number;
  /** The synonym or trigger that produced the score. */
  matchedPhrase: string | null;
  outcome: 'executed' | 'confirming' | 'rejected';
}

/** A borderline match awaiting a yes/no. */
export interface VoiceSuggestion {
  action: VoiceActionId;
  param?: string;
  /** Human description of the action, used in the prompt and the TTS. */
  description: string;
  transcript: string;
  score: number;
}

export interface VoiceState {
  status: VoiceStatus;
  isListening: boolean;
  /** Finalised speech for the current session. */
  transcript: string;
  /** In-flight, not-yet-final speech. */
  interimTranscript: string;
  lastCommand: string | null;
  lastAction: VoiceActionId | null;
  error: VoiceError | null;
  supported: boolean;
  synthesisSupported: boolean;
  continuous: boolean;
  language: string;
  voiceFeedback: boolean;
  commandsExecuted: number;
  /** True while the recognition instance is being rebuilt for a new language. */
  isSwitchingLanguage: boolean;
  /** Set when a match scored in the confirmation band. */
  pendingSuggestion: VoiceSuggestion | null;
  /** Confidence of the most recent attempt, for the overlay. */
  lastScore: number | null;
}

export interface VoiceCommandStats {
  commandsExecuted: number;
  lastCommand: string | null;
  lastCommandTime: number | null;
}

export interface VoiceLanguageOption {
  code: string;
  label: string;
}

/**
 * Recognition languages offered in the panel. The Web Speech API exposes no way
 * to enumerate what an engine supports, so this is a curated list of widely
 * available locales; English is the default and listed first.
 */
export const VOICE_LANGUAGES: readonly VoiceLanguageOption[] = Object.freeze([
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'en-IN', label: 'English (India)' },
  { code: 'en-AU', label: 'English (Australia)' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'es-ES', label: 'Spanish (Spain)' },
  { code: 'es-MX', label: 'Spanish (Mexico)' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'it-IT', label: 'Italian' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)' },
  { code: 'ja-JP', label: 'Japanese' },
  { code: 'ko-KR', label: 'Korean' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
]);

export const UNSUPPORTED_MESSAGE =
  'Voice commands not supported in this browser. Try Chrome or Edge.';

/*
 * Minimal structural types for the Web Speech API. TypeScript's DOM lib does
 * not ship `SpeechRecognition`, and the vendor-prefixed constructor means we
 * cannot rely on a global interface either.
 */
interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: { transcript: string; confidence: number };
}

interface SpeechRecognitionEventLike {
  readonly resultIndex: number;
  readonly results: {
    readonly length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionErrorEventLike {
  readonly error: string;
  readonly message?: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onspeechstart: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const getRecognitionConstructor = (): SpeechRecognitionConstructor | null => {
  if (typeof window === 'undefined') return null;
  const scope = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
};

/** Translates raw engine error codes into something a user can act on. */
const describeError = (code: string): VoiceError => {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return {
        code: 'not-allowed',
        message: 'Microphone access is blocked.',
        hint: 'Click the lock or mic icon in your browser address bar, set Microphone to "Allow", then reload the page.',
      };
    case 'no-speech':
      return {
        code: 'no-speech',
        message: "I didn't hear anything.",
        hint: 'Check that the right microphone is selected, then try again.',
      };
    case 'audio-capture':
      return {
        code: 'audio-capture',
        message: 'No microphone was found.',
        hint: 'Connect a microphone and try again.',
      };
    case 'network':
      return {
        code: 'network',
        message: 'Speech recognition is offline.',
        hint: 'Browser speech recognition needs an internet connection. Check your network, or type the command below instead.',
      };
    case 'aborted':
      return { code: 'aborted', message: 'Listening stopped.' };
    default:
      return {
        code: 'unknown',
        message: `Speech recognition failed (${code}).`,
        hint: 'Try again, or type the command below instead.',
      };
  }
};

/** How long the "Done" state lingers before returning to idle. */
const DONE_LINGER_MS = 1400;
/** Guards the auto-restart loop against error storms. */
const MAX_CONSECUTIVE_RESTARTS = 30;
/** Breathing room between destroying an instance and starting its replacement. */
const LANGUAGE_SWAP_MS = 250;
/** Where the chosen recognition language is remembered across reloads. */
const LANGUAGE_STORAGE_KEY = 'gb-coder-voice-language';
const DEFAULT_LANGUAGE = 'en-US';

/** Phrases that accept or reject a "did you mean …?" prompt. */
const AFFIRMATIVES = new Set([
  'yes', 'yeah', 'yep', 'yup', 'sure', 'ok', 'okay', 'correct', 'right',
  'confirm', 'do it', 'go ahead', 'that one', 'affirmative',
]);
const NEGATIVES = new Set([
  'no', 'nope', 'nah', 'cancel', 'never mind', 'nevermind', 'stop', 'wrong',
  'forget it', 'negative',
]);

/** Reads the persisted language, falling back to English. */
const loadStoredLanguage = (): string => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) || DEFAULT_LANGUAGE;
  } catch {
    // Private browsing can throw on access.
    return DEFAULT_LANGUAGE;
  }
};

class VoiceCommandService {
  private recognition: SpeechRecognitionLike | null = null;
  private readonly listeners = new Set<(state: VoiceState) => void>();
  private onCommandExecuted?: (command: string) => void;
  private doneTimer: ReturnType<typeof setTimeout> | null = null;
  /** True between `startListening()` and a stop; drives auto-restart. */
  private wantsToListen = false;
  /**
   * Set when the user (or a completed single-shot command) stopped the mic, as
   * opposed to the engine ending the session on its own. Auto-restart checks
   * this so turning the mic off stays off.
   */
  private intentionalStop = false;
  private restartCount = 0;
  private capabilities: VoiceCapabilities = {};
  private stats: VoiceCommandStats = {
    commandsExecuted: 0,
    lastCommand: null,
    lastCommandTime: null,
  };

  private state: VoiceState = {
    status: 'idle',
    isListening: false,
    transcript: '',
    interimTranscript: '',
    lastCommand: null,
    lastAction: null,
    error: null,
    supported: false,
    synthesisSupported: false,
    continuous: false,
    language: DEFAULT_LANGUAGE,
    voiceFeedback: false,
    commandsExecuted: 0,
    isSwitchingLanguage: false,
    pendingSuggestion: null,
    lastScore: null,
  };

  constructor() {
    const supported = getRecognitionConstructor() !== null;
    this.state = {
      ...this.state,
      supported,
      synthesisSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
      // Restored so the first instance is built with the user's language.
      language: loadStoredLanguage(),
    };
  }

  // ---------------------------------------------------------------- state

  public getState(): VoiceState {
    return this.state;
  }

  /** Subscribe to state changes. Returns an unsubscribe function. */
  public subscribe(listener: (state: VoiceState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(partial: Partial<VoiceState>) {
    /*
     * A fresh object per update, because `useSyncExternalStore` compares
     * snapshots by reference to decide whether to re-render.
     */
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener(this.state));
  }

  private clearDoneTimer() {
    if (this.doneTimer !== null) {
      clearTimeout(this.doneTimer);
      this.doneTimer = null;
    }
  }

  // ------------------------------------------------------------ lifecycle

  /**
   * Lazily builds the recognition object. Rebuilt per session because some
   * Chrome versions leave an aborted instance permanently unusable.
   */
  private createRecognition(): SpeechRecognitionLike | null {
    const Constructor = getRecognitionConstructor();
    if (!Constructor) return null;

    const recognition = new Constructor();
    recognition.continuous = this.state.continuous;
    recognition.interimResults = true;
    recognition.lang = this.state.language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      this.setState({ status: 'listening', isListening: true, error: null });
    };

    recognition.onresult = (event) => {
      let interim = '';
      const finals: string[] = [];

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? '';
        if (result.isFinal) {
          finals.push(text);
        } else {
          interim += text;
        }
      }

      if (finals.length === 0) {
        // Live feedback while the user is still speaking.
        this.setState({ interimTranscript: interim.trim(), status: 'listening' });
        return;
      }

      const finalText = finals.join(' ').trim();
      this.setState({
        transcript: finalText,
        interimTranscript: '',
        status: 'processing',
      });

      /*
       * Yield a frame so the "Processing..." state actually paints before a
       * command runs and potentially opens a modal.
       */
      setTimeout(() => this.handleTranscript(finalText), 0);
    };

    recognition.onerror = (event) => {
      const error = describeError(event.error);

      // An abort is the user's own doing; it is not worth an error state.
      if (error.code === 'aborted') {
        this.wantsToListen = false;
        this.setState({ status: 'idle', isListening: false, interimTranscript: '' });
        return;
      }

      /*
       * `no-speech` in continuous mode is routine silence, not a failure — let
       * `onend` restart quietly instead of shouting at the user.
       */
      if (error.code === 'no-speech' && this.state.continuous && this.wantsToListen) {
        return;
      }

      // Permission and hardware failures are terminal; stop retrying.
      if (error.code === 'not-allowed' || error.code === 'audio-capture') {
        this.wantsToListen = false;
      }

      this.setState({
        status: 'error',
        isListening: false,
        interimTranscript: '',
        error,
      });
    };

    recognition.onend = () => {
      /*
       * The Web Speech API ends a session on silence, on transient errors, and
       * sometimes for no stated reason — in every browser, and regardless of the
       * `continuous` flag. Restarting is therefore the default whenever the user
       * has not asked us to stop.
       *
       * This previously only restarted in continuous mode, so a single-command
       * session that timed out before the user spoke simply went dead with the
       * overlay still showing "Listening...".
       */
      if (
        !this.intentionalStop &&
        this.wantsToListen &&
        this.restartCount < MAX_CONSECUTIVE_RESTARTS
      ) {
        this.restartCount += 1;
        try {
          recognition.start();
          return;
        } catch {
          // Fall through to idle if the engine refuses to restart.
        }
      }

      this.wantsToListen = false;
      this.setState({
        isListening: false,
        interimTranscript: '',
        // Preserve a terminal error, the "done" confirmation, or a pending prompt.
        status:
          this.state.status === 'error' ||
          this.state.status === 'done' ||
          this.state.status === 'confirming'
            ? this.state.status
            : 'idle',
      });
    };

    return recognition;
  }

  /**
   * Destroys the current recognition instance.
   *
   * Handlers are detached *before* `abort()`, which is the crux of the language
   * switching bug: aborting fires `onend` (and sometimes `onerror`) on a later
   * tick, and that stale callback would run against the replacement session —
   * flipping `isListening` back to false and clearing `wantsToListen` on an
   * instance that had just started successfully.
   */
  private teardownRecognition(): void {
    const recognition = this.recognition;
    this.recognition = null;
    if (!recognition) return;

    recognition.onstart = null;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition.onspeechstart = null;

    try {
      recognition.abort();
    } catch {
      // Already dead; nothing to release.
    }
  }

  /** Starts listening. Returns false when speech recognition is unavailable. */
  public startListening(): boolean {
    if (!this.state.supported) {
      this.setState({
        status: 'error',
        isListening: false,
        error: {
          code: 'unsupported',
          message: UNSUPPORTED_MESSAGE,
          hint: 'You can still type commands in the box below.',
        },
      });
      return false;
    }

    if (this.state.isListening) return true;

    this.clearDoneTimer();
    // Always a fresh instance: some Chrome builds leave an aborted one unusable.
    this.teardownRecognition();
    this.recognition = this.createRecognition();
    if (!this.recognition) return false;

    this.wantsToListen = true;
    this.intentionalStop = false;
    this.restartCount = 0;

    try {
      this.recognition.start();
      this.setState({
        status: 'listening',
        isListening: true,
        transcript: '',
        interimTranscript: '',
        error: null,
      });
      return true;
    } catch (error) {
      this.wantsToListen = false;
      this.setState({
        status: 'error',
        isListening: false,
        error: {
          code: 'unknown',
          message: error instanceof Error ? error.message : 'Could not start the microphone.',
          hint: 'Try again, or type the command below instead.',
        },
      });
      return false;
    }
  }

  public stopListening() {
    this.wantsToListen = false;
    this.intentionalStop = true;
    if (!this.recognition) {
      this.setState({ status: 'idle', isListening: false, interimTranscript: '' });
      return;
    }

    try {
      this.recognition.stop();
    } catch {
      // Already stopped — the state update below is what matters.
    }

    this.setState({ isListening: false, interimTranscript: '' });
  }

  /** Hard stop: drops any in-flight audio and clears the session transcript. */
  public cancel() {
    this.wantsToListen = false;
    this.intentionalStop = true;
    this.clearDoneTimer();
    this.teardownRecognition();
    this.stopSpeaking();
    this.setState({
      status: 'idle',
      isListening: false,
      transcript: '',
      interimTranscript: '',
      error: null,
      pendingSuggestion: null,
      isSwitchingLanguage: false,
    });
  }

  /** Returns the resulting listening state, so callers can toggle a button. */
  public toggleListening(): boolean {
    if (this.state.isListening) {
      this.stopListening();
      return false;
    }
    return this.startListening();
  }

  // ------------------------------------------------------------- commands

  /**
   * Runs a phrase through the grammar and broadcasts the result. Shared by
   * speech input and the panel's typed fallback, so both behave identically.
   */
  public handleTranscript(rawTranscript: string): VoiceActionId | null {
    const transcript = (rawTranscript ?? '').trim();
    if (!transcript) return null;

    this.clearDoneTimer();

    // A pending "did you mean …?" takes priority: the next thing said is an
    // answer to that question, not a new command.
    if (this.state.pendingSuggestion) {
      const answer = normalizeTranscript(transcript);
      if (AFFIRMATIVES.has(answer)) return this.confirmSuggestion();
      if (NEGATIVES.has(answer)) {
        this.dismissSuggestion();
        return null;
      }
      // Anything else replaces the question and is matched normally.
      this.setState({ pendingSuggestion: null });
    }

    const match = parseVoiceCommand(transcript, this.capabilities);

    /* Below the rejection floor: say so rather than guessing. */
    if (!match || match.confidence === 'low') {
      this.setState({
        status: 'error',
        transcript,
        interimTranscript: '',
        lastCommand: transcript,
        lastAction: null,
        lastScore: match?.score ?? 0,
        error: { code: 'unknown', message: UNRECOGNIZED_MESSAGE },
      });
      this.dispatchAttempt({
        transcript,
        normalized: match?.normalized ?? normalizeTranscript(transcript),
        action: null,
        score: match?.score ?? 0,
        matchedPhrase: match?.matchedPhrase ?? null,
        outcome: 'rejected',
      });
      this.dispatch({ action: 'unrecognized', transcript });
      return null;
    }

    /* Borderline: ask before acting. */
    if (match.confidence === 'medium') {
      const suggestion: VoiceSuggestion = {
        action: match.id,
        param: match.param,
        description: match.description,
        transcript,
        score: match.score,
      };

      this.setState({
        status: 'confirming',
        transcript,
        interimTranscript: '',
        lastCommand: transcript,
        lastScore: match.score,
        error: null,
        pendingSuggestion: suggestion,
      });

      this.dispatchAttempt({
        transcript,
        normalized: match.normalized,
        action: match.id,
        param: match.param,
        score: match.score,
        matchedPhrase: match.matchedPhrase,
        outcome: 'confirming',
      });

      this.speak(`Did you mean ${match.description}?`);
      return null;
    }

    return this.execute(match.id, match.param, transcript, {
      normalized: match.normalized,
      score: match.score,
      matchedPhrase: match.matchedPhrase,
    });
  }

  /**
   * Runs a resolved action. Shared by direct matches and confirmed suggestions
   * so both take identical paths, including spoken feedback and logging.
   */
  private execute(
    action: VoiceActionId,
    param: string | undefined,
    transcript: string,
    diagnostics: { normalized: string; score: number; matchedPhrase: string | null },
  ): VoiceActionId {
    this.dispatchAttempt({
      transcript,
      normalized: diagnostics.normalized,
      action,
      param,
      score: diagnostics.score,
      matchedPhrase: diagnostics.matchedPhrase,
      outcome: 'executed',
    });

    // Meta actions the service owns rather than the app.
    if (action === 'stop_listening') {
      this.setState({
        transcript,
        lastCommand: transcript,
        lastAction: action,
        lastScore: diagnostics.score,
        pendingSuggestion: null,
      });
      this.stopListening();
      this.setState({ status: 'done' });
      this.scheduleIdle();
      return action;
    }

    if (action === 'set_language' && param) {
      this.setState({ transcript, lastCommand: transcript, lastAction: action, status: 'done' });
      this.speak('Switching language');
      // Still dispatched below so the app can persist it into settings.
      this.setLanguage(param);
      this.dispatch({ action, param, transcript });
      return action;
    }

    this.stats = {
      commandsExecuted: this.stats.commandsExecuted + 1,
      lastCommand: transcript,
      lastCommandTime: Date.now(),
    };

    this.setState({
      status: 'done',
      transcript,
      interimTranscript: '',
      lastCommand: transcript,
      lastAction: action,
      lastScore: diagnostics.score,
      error: null,
      pendingSuggestion: null,
      commandsExecuted: this.stats.commandsExecuted,
    });

    this.dispatch({ action, param, transcript });
    this.onCommandExecuted?.(transcript);

    /*
     * Single-command mode is "one utterance, then stop", which is what makes
     * the mic button feel like a push-to-talk control.
     */
    if (!this.state.continuous) {
      this.stopListening();
    }

    this.scheduleIdle();
    return action;
  }

  /** Accepts the pending "did you mean …?" suggestion. */
  public confirmSuggestion(): VoiceActionId | null {
    const suggestion = this.state.pendingSuggestion;
    if (!suggestion) return null;

    this.setState({ pendingSuggestion: null, status: 'processing' });
    return this.execute(suggestion.action, suggestion.param, suggestion.transcript, {
      normalized: normalizeTranscript(suggestion.transcript),
      score: suggestion.score,
      matchedPhrase: 'confirmed suggestion',
    });
  }

  /** Rejects the pending suggestion without running anything. */
  public dismissSuggestion(): void {
    if (!this.state.pendingSuggestion) return;
    this.setState({
      pendingSuggestion: null,
      status: this.state.isListening ? 'listening' : 'idle',
    });
  }

  /** Typed fallback from the panel — never touches the microphone. */
  public submitTypedCommand(text: string): VoiceActionId | null {
    return this.handleTranscript(text);
  }

  private scheduleIdle() {
    this.clearDoneTimer();
    this.doneTimer = setTimeout(() => {
      this.doneTimer = null;
      if (this.state.status !== 'done') return;
      this.setState({ status: this.state.isListening ? 'listening' : 'idle' });
    }, DONE_LINGER_MS);
  }

  private dispatch(detail: VoiceCommandDetail) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent<VoiceCommandDetail>('voice-command', { detail }));
  }

  /**
   * Publishes a recognition attempt for the Console tab.
   *
   * Separate from `voice-command` on purpose: every attempt is logged, including
   * the ones that were rejected or only offered as a suggestion, which are
   * precisely the cases worth debugging.
   */
  private dispatchAttempt(detail: VoiceAttemptDetail) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent<VoiceAttemptDetail>('voice-attempt', { detail }));
  }

  // ------------------------------------------------------------ preferences

  public setContinuous(continuous: boolean) {
    if (this.state.continuous === continuous) return;
    this.setState({ continuous });
    if (this.recognition) this.recognition.continuous = continuous;
  }

  /**
   * Switches the recognition language.
   *
   * The previous implementation assigned `recognition.lang` on the live
   * instance. Browser engines read `lang` when `start()` is called and ignore
   * later writes, so every language except whichever was set at first init was
   * silently ineffective. The instance is therefore destroyed and rebuilt, and
   * listening resumes only after the swap completes.
   */
  public setLanguage(language: string) {
    if (!language || this.state.language === language) return;

    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Persistence is a convenience; never block the switch on it.
    }

    // Resume afterwards if the mic was live, or was about to be.
    const shouldResume = this.state.isListening || this.wantsToListen;

    this.teardownRecognition();
    this.setState({
      language,
      isSwitchingLanguage: shouldResume,
      status: shouldResume ? 'switching' : this.state.status,
      isListening: false,
      interimTranscript: '',
    });

    if (!shouldResume) {
      this.setState({ isSwitchingLanguage: false });
      return;
    }

    /*
     * A short gap before restarting: starting a new instance in the same tick as
     * destroying the old one makes some engines reject `start()` outright.
     */
    setTimeout(() => {
      this.setState({ isSwitchingLanguage: false });
      // Only resume if nothing intervened (a stop, or another switch).
      if (this.state.language !== language) return;
      this.startListening();
    }, LANGUAGE_SWAP_MS);
  }

  /** Declares which gated capabilities exist, e.g. an attached sandbox. */
  public setCapabilities(capabilities: VoiceCapabilities) {
    this.capabilities = { ...capabilities };
  }

  public setVoiceFeedback(enabled: boolean) {
    if (this.state.voiceFeedback === enabled) return;
    if (!enabled) this.stopSpeaking();
    this.setState({ voiceFeedback: enabled });
  }

  // ------------------------------------------------------------- synthesis

  /**
   * Short spoken confirmation. A no-op unless the user has opted in, and
   * deliberately terse so it never talks over itself.
   */
  public speak(text: string) {
    if (!this.state.voiceFeedback || !this.state.synthesisSupported || !text) return;

    try {
      const synthesis = window.speechSynthesis;
      // Never queue: the newest confirmation replaces anything still speaking.
      synthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.state.language;
      utterance.rate = 1.1;
      utterance.volume = 0.85;
      synthesis.speak(utterance);
    } catch {
      // Spoken feedback is decorative; a failure must never break an action.
    }
  }

  public stopSpeaking() {
    if (!this.state.synthesisSupported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore.
    }
  }

  // ------------------------------------------------------------------ misc

  public isSupported(): boolean {
    return this.state.supported;
  }

  public isListeningStatus(): boolean {
    return this.state.isListening;
  }

  public setCommandExecutedCallback(callback: (command: string) => void) {
    this.onCommandExecuted = callback;
  }

  /**
   * Commands to advertise, straight from the registry.
   *
   * Registry-derived so the panel's list and count cannot drift from what is
   * actually matchable, and so gated actions stay hidden until available.
   */
  public getCommands() {
    return getListedIntents(this.capabilities);
  }

  /** The same list grouped by category, for the reference panel. */
  public getCommandGroups() {
    return getIntentsByCategory(this.capabilities);
  }

  /** Total advertised commands — the number shown on the disclosure button. */
  public getCommandCount(): number {
    return getListedIntents(this.capabilities).length;
  }

  /** Human description for an action id, used for TTS confirmations. */
  public describeAction(action: VoiceActionId): string {
    return getIntent(action)?.description ?? action;
  }

  public getStats(): VoiceCommandStats {
    return { ...this.stats };
  }

  public resetStats() {
    this.stats = { commandsExecuted: 0, lastCommand: null, lastCommandTime: null };
    this.setState({ commandsExecuted: 0, lastCommand: null, lastAction: null });
  }
}

export const voiceCommandService = new VoiceCommandService();
