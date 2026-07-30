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
  VOICE_COMMANDS,
  VoiceActionId,
  VoiceCommandDefinition,
  VoiceDispatchAction,
  getVisibleCommands,
  parseVoiceCommand,
} from './voiceCommandParser';

export type {
  VoiceActionId,
  VoiceCommandDefinition,
  VoiceDispatchAction,
  VoiceExportTarget,
  VoiceModalTarget,
} from './voiceCommandParser';
export { UNRECOGNIZED_MESSAGE, VOICE_SUGGESTIONS } from './voiceCommandParser';

/** Lifecycle shown in the overlay. */
export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'done' | 'error';

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
/** Guards the continuous-mode auto-restart loop against error storms. */
const MAX_CONSECUTIVE_RESTARTS = 30;

class VoiceCommandService {
  private recognition: SpeechRecognitionLike | null = null;
  private readonly listeners = new Set<(state: VoiceState) => void>();
  private onCommandExecuted?: (command: string) => void;
  private doneTimer: ReturnType<typeof setTimeout> | null = null;
  /** True between `startListening()` and an explicit stop; drives auto-restart. */
  private wantsToListen = false;
  private restartCount = 0;
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
    language: 'en-US',
    voiceFeedback: false,
    commandsExecuted: 0,
  };

  constructor() {
    const supported = getRecognitionConstructor() !== null;
    this.state = {
      ...this.state,
      supported,
      synthesisSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
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
       * Chrome ends the session after a pause even with `continuous = true`, so
       * continuous mode is really "restart until the user says stop".
       */
      if (this.wantsToListen && this.state.continuous && this.restartCount < MAX_CONSECUTIVE_RESTARTS) {
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
        // Preserve a terminal error or the brief "done" confirmation.
        status:
          this.state.status === 'error' || this.state.status === 'done'
            ? this.state.status
            : 'idle',
      });
    };

    return recognition;
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
    this.recognition?.abort();
    this.recognition = this.createRecognition();
    if (!this.recognition) return false;

    this.wantsToListen = true;
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
    this.clearDoneTimer();
    try {
      this.recognition?.abort();
    } catch {
      // Nothing to abort.
    }
    this.stopSpeaking();
    this.setState({
      status: 'idle',
      isListening: false,
      transcript: '',
      interimTranscript: '',
      error: null,
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

    const match = parseVoiceCommand(transcript);

    if (!match) {
      this.setState({
        status: 'error',
        transcript,
        interimTranscript: '',
        lastCommand: transcript,
        lastAction: null,
        error: { code: 'unknown', message: UNRECOGNIZED_MESSAGE },
      });
      this.dispatch({ action: 'unrecognized', transcript });
      return null;
    }

    // "Stop listening" is handled here rather than by the app.
    if (match.id === 'stop_listening') {
      this.setState({ transcript, lastCommand: transcript, lastAction: match.id });
      this.stopListening();
      this.setState({ status: 'done' });
      this.scheduleIdle();
      return match.id;
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
      lastAction: match.id,
      error: null,
      commandsExecuted: this.stats.commandsExecuted,
    });

    this.dispatch({ action: match.id, param: match.param, transcript });
    this.onCommandExecuted?.(transcript);

    /*
     * Single-command mode is "one utterance, then stop", which is what makes
     * the mic button feel like a push-to-talk control.
     */
    if (!this.state.continuous) {
      this.stopListening();
    }

    this.scheduleIdle();
    return match.id;
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

  // ------------------------------------------------------------ preferences

  public setContinuous(continuous: boolean) {
    if (this.state.continuous === continuous) return;
    this.setState({ continuous });
    if (this.recognition) this.recognition.continuous = continuous;
  }

  public setLanguage(language: string) {
    if (this.state.language === language) return;
    this.setState({ language });
    if (this.recognition) this.recognition.lang = language;
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

  public getCommands(): VoiceCommandDefinition[] {
    return getVisibleCommands();
  }

  public getAllCommands(): readonly VoiceCommandDefinition[] {
    return VOICE_COMMANDS;
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
