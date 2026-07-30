import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CornerDownLeft,
  Loader2,
  Mic,
  MicOff,
  Repeat,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import {
  UNSUPPORTED_MESSAGE,
  VOICE_LANGUAGES,
  VOICE_SUGGESTIONS,
  voiceCommandService,
} from '../services/voiceCommandService';

interface VoiceCommandPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Begin listening as soon as the overlay appears. */
  autoStart?: boolean;
  /** Persist the spoken-feedback preference back into app settings. */
  onVoiceFeedbackChange?: (enabled: boolean) => void;
  /** Persist the continuous-listening preference back into app settings. */
  onContinuousChange?: (enabled: boolean) => void;
  /** Persist the recognition language back into app settings. */
  onLanguageChange?: (language: string) => void;
}

// Bound outside the component so the store subscription identity is stable.
const subscribeToVoice = (onStoreChange: () => void) => voiceCommandService.subscribe(onStoreChange);
const getVoiceSnapshot = () => voiceCommandService.getState();

/** Bar heights (rem) for the faux waveform; a static, hand-tuned silhouette. */
const WAVE_BARS = [0.6, 1.1, 1.6, 1.1, 0.75, 1.35, 0.9];

const VoiceCommandPanel: React.FC<VoiceCommandPanelProps> = ({
  isOpen,
  onClose,
  autoStart = true,
  onVoiceFeedbackChange,
  onContinuousChange,
  onLanguageChange,
}) => {
  const { isDark } = useTheme();
  const voice = useSyncExternalStore(subscribeToVoice, getVoiceSnapshot, getVoiceSnapshot);

  const [typedCommand, setTypedCommand] = useState('');
  const [showAllCommands, setShowAllCommands] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  /*
   * Derived from the intent registry rather than a hardcoded list, so the
   * reference and its count stay accurate as actions are added, and gated
   * actions (sandbox) stay hidden until available.
   *
   * Computed per render rather than memoized: the set depends on capabilities
   * that can change at any time, and there is no honest dependency to key a
   * memo on. It is a couple of dozen frozen objects, so the cost is noise.
   */
  const commandGroups = voiceCommandService.getCommandGroups();
  const commandCount = commandGroups.reduce((total, group) => total + group.intents.length, 0);

  // Escape to dismiss, consistent with the other sidebar-triggered panels.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  /*
   * Start on open so the mic button behaves like push-to-talk. When speech
   * recognition is missing, `startListening` surfaces the unsupported error and
   * the typed fallback below takes over.
   */
  useEffect(() => {
    if (!isOpen || !autoStart) return;
    voiceCommandService.startListening();
  }, [isOpen, autoStart]);

  // Releasing the microphone on unmount matters: Chrome keeps the tab's
  // recording indicator lit otherwise.
  useEffect(() => {
    if (isOpen) return;
    voiceCommandService.cancel();
  }, [isOpen]);

  useEffect(
    () => () => {
      voiceCommandService.cancel();
    },
    [],
  );

  const handleToggleListening = useCallback(() => {
    voiceCommandService.toggleListening();
  }, []);

  const handleCancel = useCallback(() => {
    voiceCommandService.cancel();
    onClose();
  }, [onClose]);

  const runCommand = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    voiceCommandService.submitTypedCommand(trimmed);
  }, []);

  const handleSubmitTyped = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (!typedCommand.trim()) return;
      runCommand(typedCommand);
      setTypedCommand('');
    },
    [runCommand, typedCommand],
  );

  const handleToggleFeedback = useCallback(() => {
    const next = !voice.voiceFeedback;
    voiceCommandService.setVoiceFeedback(next);
    onVoiceFeedbackChange?.(next);
  }, [voice.voiceFeedback, onVoiceFeedbackChange]);

  const handleToggleContinuous = useCallback(() => {
    const next = !voice.continuous;
    voiceCommandService.setContinuous(next);
    onContinuousChange?.(next);
  }, [voice.continuous, onContinuousChange]);

  const handleLanguageSelect = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const next = event.target.value;
      /*
       * The service destroys and rebuilds the recognition instance and resumes
       * listening itself. The panel used to stop and immediately restart here,
       * which raced: the old instance's queued `onend` fired after the new
       * session had started and reset it back to "not listening".
       */
      voiceCommandService.setLanguage(next);
      onLanguageChange?.(next);
    },
    [onLanguageChange],
  );

  if (!isOpen) return null;

  const statusLabel = (() => {
    switch (voice.status) {
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Processing...';
      case 'done':
        return 'Done';
      case 'switching':
        return 'Switching language...';
      case 'confirming':
        return 'Confirm?';
      case 'error':
        return voice.error?.code === 'unsupported' ? 'Unavailable' : 'Needs attention';
      default:
        return voice.supported ? 'Paused' : 'Unavailable';
    }
  })();

  const statusTone = (() => {
    switch (voice.status) {
      case 'listening':
        return isDark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-700';
      case 'processing':
        return isDark ? 'bg-sky-500/15 text-sky-300' : 'bg-sky-50 text-sky-700';
      case 'done':
        return isDark ? 'bg-violet-500/15 text-violet-300' : 'bg-violet-50 text-violet-700';
      case 'switching':
        return isDark ? 'bg-sky-500/15 text-sky-300' : 'bg-sky-50 text-sky-700';
      case 'confirming':
        return isDark ? 'bg-amber-500/15 text-amber-200' : 'bg-amber-50 text-amber-800';
      case 'error':
        return isDark ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-50 text-amber-700';
      default:
        return isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600';
    }
  })();

  const iconButtonClass = (active: boolean) =>
    `p-2 rounded-lg transition-colors ${
      active
        ? isDark
          ? 'bg-white/15 text-white'
          : 'bg-gray-900/10 text-gray-900'
        : isDark
          ? 'text-gray-400 hover:bg-white/10 hover:text-white'
          : 'text-gray-500 hover:bg-gray-900/5 hover:text-gray-900'
    }`;

  const displayedTranscript = voice.transcript || voice.interimTranscript;

  return (
    /*
     * A bottom overlay rather than a blocking modal: `pointer-events-none` on
     * the wrapper keeps the editor usable while the mic is live, so commands
     * like "explain this" can act on a selection the user just made.
     */
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-3 pb-4 sm:pb-6 pointer-events-none"
      role="region"
      aria-label="Voice commands"
    >
      <div
        className={`pointer-events-auto w-full max-w-3xl rounded-2xl border shadow-2xl animate-slide-up ${
          isDark
            ? 'bg-black/80 border-white/10 text-white'
            : 'bg-white/90 border-gray-200 text-gray-900'
        } backdrop-blur-xl`}
      >
        {/* Status row */}
        <div className="flex items-center gap-3 px-4 pt-4 sm:px-5">
          {/* Mic orb with pulsing halo while live */}
          <button
            type="button"
            onClick={handleToggleListening}
            title={voice.isListening ? 'Stop listening' : 'Start listening'}
            aria-label={voice.isListening ? 'Stop listening' : 'Start listening'}
            aria-pressed={voice.isListening}
            disabled={!voice.supported}
            className={`relative flex-shrink-0 grid place-items-center w-11 h-11 rounded-full transition-colors ${
              !voice.supported
                ? isDark
                  ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : voice.isListening
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gradient-to-br from-violet-500 to-blue-500 text-white hover:brightness-110'
            }`}
          >
            {voice.isListening && (
              <>
                <span className="absolute inset-0 rounded-full bg-red-500/40 animate-voice-ring" />
                <span
                  className="absolute inset-0 rounded-full bg-red-500/30 animate-voice-ring"
                  style={{ animationDelay: '800ms' }}
                />
              </>
            )}
            {voice.status === 'processing' ? (
              <Loader2 className="relative w-5 h-5 animate-spin" />
            ) : voice.isListening ? (
              <Mic className="relative w-5 h-5" />
            ) : (
              <MicOff className="relative w-5 h-5" />
            )}
          </button>

          {/* Waveform — decorative, driven by CSS so no second mic stream is
              needed just to animate bars. */}
          <div className="flex items-end gap-1 h-8 w-16 flex-shrink-0" aria-hidden="true">
            {WAVE_BARS.map((height, index) => (
              <span
                key={index}
                className={`w-1.5 rounded-full origin-bottom ${
                  voice.isListening
                    ? `${isDark ? 'bg-emerald-400' : 'bg-emerald-500'} animate-voice-wave`
                    : isDark
                      ? 'bg-white/20'
                      : 'bg-gray-300'
                }`}
                style={{
                  height: `${height}rem`,
                  animationDelay: `${index * 110}ms`,
                }}
              />
            ))}
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusTone}`}
            role="status"
            aria-live="polite"
          >
            {statusLabel}
          </span>

          <div className="flex-1" />

          {/* Session controls */}
          <button
            type="button"
            onClick={handleToggleContinuous}
            className={iconButtonClass(voice.continuous)}
            title={voice.continuous ? 'Continuous listening: on' : 'Continuous listening: off'}
            aria-label="Toggle continuous listening"
            aria-pressed={voice.continuous}
          >
            <Repeat className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleToggleFeedback}
            className={iconButtonClass(voice.voiceFeedback)}
            title={voice.voiceFeedback ? 'Spoken feedback: on' : 'Spoken feedback: off'}
            aria-label="Toggle spoken feedback"
            aria-pressed={voice.voiceFeedback}
            disabled={!voice.synthesisSupported}
          >
            {voice.voiceFeedback ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <label className="sr-only" htmlFor="voice-language">
            Recognition language
          </label>
          <select
            id="voice-language"
            value={voice.language}
            onChange={handleLanguageSelect}
            title="Recognition language"
            className={`hidden sm:block text-xs rounded-lg px-2 py-1.5 border outline-none ${
              isDark
                ? 'bg-white/5 border-white/10 text-gray-200'
                : 'bg-white border-gray-200 text-gray-700'
            }`}
          >
            {VOICE_LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleCancel}
            title="Close voice commands"
            aria-label="Close voice commands"
            className={iconButtonClass(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live transcript */}
        <div className="px-4 pt-3 sm:px-5">
          <p
            className="text-base sm:text-lg leading-relaxed min-h-[1.75rem]"
            aria-live="polite"
            data-testid="voice-transcript"
          >
            {displayedTranscript ? (
              <>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>{voice.transcript}</span>
                {voice.interimTranscript && (
                  <span className={`italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {voice.transcript ? ' ' : ''}
                    {voice.interimTranscript}
                  </span>
                )}
              </>
            ) : (
              <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                {voice.isListening ? 'Say a command...' : 'Microphone paused.'}
              </span>
            )}
          </p>
        </div>

        {/* Errors, permission help, and the unsupported-browser fallback */}
        {voice.error && (
          <div
            className={`mx-4 sm:mx-5 mt-3 rounded-xl border px-3 py-2.5 ${
              isDark
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
            role="alert"
          >
            <p className="text-sm font-medium">
              {voice.error.code === 'unsupported' ? UNSUPPORTED_MESSAGE : voice.error.message}
            </p>
            {voice.error.hint && <p className="text-xs mt-1 opacity-90">{voice.error.hint}</p>}
          </div>
        )}

        {/*
          Borderline fuzzy match: confirm before acting. Answerable by voice
          ("yes" / "no", handled in the service) or by clicking here.
        */}
        {voice.pendingSuggestion && (
          <div
            className={`mx-4 sm:mx-5 mt-3 rounded-xl border px-3 py-2.5 ${
              isDark
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-100'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
            role="alert"
            data-testid="voice-did-you-mean"
          >
            <p className="text-sm">
              Did you mean{' '}
              <span className="font-semibold">{voice.pendingSuggestion.description}</span>?
              <span className={`ml-1 text-xs ${isDark ? 'text-amber-200/60' : 'text-amber-700/70'}`}>
                ({Math.round(voice.pendingSuggestion.score * 100)}% match)
              </span>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => voiceCommandService.confirmSuggestion()}
                data-testid="voice-confirm-suggestion"
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Yes, do it
              </button>
              <button
                type="button"
                onClick={() => voiceCommandService.dismissSuggestion()}
                data-testid="voice-dismiss-suggestion"
                className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                  isDark ? 'bg-white/10 text-gray-200 hover:bg-white/20' : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                No
              </button>
              <span className={`text-[11px] ${isDark ? 'text-amber-200/60' : 'text-amber-700/70'}`}>
                or just say &ldquo;yes&rdquo; / &ldquo;no&rdquo;
              </span>
            </div>
          </div>
        )}

        {/* Suggestions */}
        <div className="px-4 sm:px-5 mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Try saying:
            </span>
            {VOICE_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => runCommand(suggestion)}
                title={`Run: ${suggestion}`}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                &ldquo;{suggestion}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Typed fallback — the escape hatch when the mic is blocked or the
            browser has no speech recognition at all. */}
        <form onSubmit={handleSubmitTyped} className="px-4 sm:px-5 mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={typedCommand}
              onChange={(event) => setTypedCommand(event.target.value)}
              placeholder="Or type a command, e.g. Build a login form"
              aria-label="Type a command"
              className={`w-full rounded-xl border pl-3 pr-9 py-2 text-sm outline-none transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white/30'
                  : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-gray-400'
              }`}
            />
            <CornerDownLeft
              className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}
            />
          </div>
          <button
            type="submit"
            disabled={!typedCommand.trim()}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
              typedCommand.trim()
                ? 'bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:brightness-110'
                : isDark
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Send
          </button>
        </form>

        {/* Full command reference */}
        <div className="px-4 sm:px-5 py-3">
          <button
            type="button"
            onClick={() => setShowAllCommands((open) => !open)}
            aria-expanded={showAllCommands}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
              isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {showAllCommands ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            {showAllCommands ? 'Hide' : 'Show'} all {commandCount} commands
            {voice.commandsExecuted > 0 && (
              <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>
                &middot; {voice.commandsExecuted} run this session
              </span>
            )}
          </button>

          {showAllCommands && (
            <div className="mt-3 max-h-64 overflow-y-auto space-y-3" data-testid="voice-command-list">
              {commandGroups.map((group) => (
                <div key={group.category}>
                  <p
                    className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    {group.category}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.intents.map((intent) => (
                      <div
                        key={intent.id}
                        data-testid="voice-command-entry"
                        className={`rounded-xl border px-3 py-2 ${
                          isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <p
                          className={`text-xs font-semibold ${
                            isDark ? 'text-gray-200' : 'text-gray-800'
                          }`}
                        >
                          {intent.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {intent.examples.map((example) => (
                            <button
                              key={example}
                              type="button"
                              onClick={() => runCommand(example)}
                              title={`Run: ${example}`}
                              className={`text-[11px] px-1.5 py-0.5 rounded transition-colors ${
                                isDark
                                  ? 'bg-white/5 text-gray-400 hover:bg-white/15 hover:text-white'
                                  : 'bg-white text-gray-500 border border-gray-200 hover:text-gray-900'
                              }`}
                            >
                              &ldquo;{example}&rdquo;
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceCommandPanel;
