/**
 * Inline AI Copilot ("ghost text") for the Monaco editor.
 *
 * Registers a single `InlineCompletionsProvider` for every language GB Coder
 * supports. As the user types, the provider waits out a debounce, sends a small
 * window of surrounding code to `/api/ai/inline-completion`, and returns the
 * result as ghost text. Monaco binds Tab to accept it and Escape to dismiss it
 * on its own — see the `AcceptInlineCompletion` action — so this module never
 * installs a keybinding.
 *
 * Three things keep the request volume sane:
 *   1. a debounce, so a burst of keystrokes produces one call, not one per key
 *   2. an AbortController wired to Monaco's cancellation token, so a superseded
 *      request is dropped rather than left racing the next one
 *   3. an LRU cache keyed on the context window, so undo/redo and repeated
 *      patterns never re-hit the network
 *
 * The provider registers against `monaco.languages`, which is global to the
 * Monaco bundle rather than per editor instance. Registering once therefore
 * covers every editor surface in the app, not just the one that registered.
 */

import type * as MonacoApi from 'monaco-editor/esm/vs/editor/editor.api';
import { SETTINGS_STORAGE_KEY, type AppSettings } from '../hooks/useSettings';

type Monaco = typeof MonacoApi;
type TextModel = MonacoApi.editor.ITextModel;
type Position = MonacoApi.Position;
type CancellationToken = MonacoApi.CancellationToken;
type InlineCompletions = MonacoApi.languages.InlineCompletions;
type Disposable = MonacoApi.IDisposable;

/** Mirrors the languages the endpoint accepts. */
const SUPPORTED_LANGUAGES = ['html', 'css', 'javascript', 'typescript'] as const;

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Lines of context sent before the caret. The model needs enough to infer the
 * surrounding idiom, not so much that latency becomes noticeable.
 */
const PREFIX_CONTEXT_LINES = 50;

/** Suffix is only used to avoid duplicating or prematurely closing code. */
const SUFFIX_CONTEXT_LINES = 20;

/** Characters capped per context field, matching the server's own limits. */
const MAX_PREFIX_CHARS = 8000;
const MAX_SUFFIX_CHARS = 4000;

/**
 * Long enough that a normal typing burst collapses into one request, short
 * enough that the suggestion still feels attached to the last keystroke.
 */
const DEBOUNCE_MS = 350;

/** A request that outlives this is stale; the user has almost certainly moved on. */
const REQUEST_TIMEOUT_MS = 8000;

/**
 * Below this the context carries no signal about the file's style, so the model
 * would be guessing — and it would guess on every keystroke of a fresh file.
 */
const MIN_PREFIX_CHARS = 3;

const CACHE_LIMIT = 200;

const ENDPOINT = '/api/ai/inline-completion';

// ─── Status store ─────────────────────────────────────────────────────────────

/**
 * `disabled`  — the toggle is off, or no editor has mounted yet
 * `ready`     — enabled and idle
 * `thinking`  — a request is in flight
 *
 * Consumed by StatusBar through `useSyncExternalStore`, which is the store shape
 * the sandbox and voice services already use in this app.
 */
export type InlineCopilotStatus = 'disabled' | 'ready' | 'thinking';

export interface InlineCopilotState {
  status: InlineCopilotStatus;
  /** Set when the last request failed, so the UI can say why nothing appeared. */
  error: string | null;
  /** Suggestions served from the cache rather than the network. Diagnostic only. */
  cacheHits: number;
  /** Requests actually sent. Diagnostic only. */
  networkRequests: number;
}

const INITIAL_STATE: InlineCopilotState = {
  status: 'disabled',
  error: null,
  cacheHits: 0,
  networkRequests: 0,
};

// ─── Context extraction ───────────────────────────────────────────────────────

export interface InlineContext {
  prefix: string;
  suffix: string;
  language: SupportedLanguage;
  fileName: string;
}

const isSupportedLanguage = (value: string): value is SupportedLanguage =>
  (SUPPORTED_LANGUAGES as readonly string[]).includes(value);

/**
 * Last path segment of the model URI, which is what the user sees in the file
 * tree. Purely a prompt hint, so a missing name is not worth failing over.
 */
const fileNameFor = (model: TextModel): string => {
  const path = model.uri?.path || '';
  const segments = path.split('/').filter(Boolean);
  return segments[segments.length - 1] || 'untitled';
};

/**
 * Reads the code around the caret.
 *
 * Built from explicit ranges rather than splitting the whole document: these
 * bounds scale with the context window, not with file size, so a 200 KB file
 * costs the same to extract as a 20-line one.
 */
const extractContext = (model: TextModel, position: Position): InlineContext | null => {
  const language = model.getLanguageId();

  if (!isSupportedLanguage(language)) return null;
  if (model.isDisposed?.()) return null;

  const lineCount = model.getLineCount();
  const { lineNumber, column } = position;

  if (lineNumber < 1 || lineNumber > lineCount) return null;

  const prefixStartLine = Math.max(1, lineNumber - PREFIX_CONTEXT_LINES + 1);
  const suffixEndLine = Math.min(lineCount, lineNumber + SUFFIX_CONTEXT_LINES - 1);

  const prefix = model.getValueInRange({
    startLineNumber: prefixStartLine,
    startColumn: 1,
    endLineNumber: lineNumber,
    endColumn: column,
  });

  const suffix = model.getValueInRange({
    startLineNumber: lineNumber,
    startColumn: column,
    endLineNumber: suffixEndLine,
    endColumn: model.getLineMaxColumn(suffixEndLine),
  });

  return {
    prefix: prefix.slice(-MAX_PREFIX_CHARS),
    suffix: suffix.slice(0, MAX_SUFFIX_CHARS),
    language,
    fileName: fileNameFor(model),
  };
};

// ─── Cache ────────────────────────────────────────────────────────────────────

/**
 * FNV-1a over the context, with the field lengths folded into the key.
 *
 * A bare 32-bit hash of a multi-KB string collides often enough to hand the user
 * a stale suggestion, so the lengths disambiguate the realistic cases. Storing
 * the digest rather than the full window keeps the cache at a few tens of KB
 * instead of the ~800 KB the raw keys would cost.
 */
const hashContext = (context: InlineContext): string => {
  const source = `${context.language}\u0000${context.prefix}\u0000${context.suffix}`;
  let hash = 0x811c9dc5;

  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    // FNV prime, expressed as a multiply to stay in 32-bit integer math.
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return `${hash.toString(16)}:${context.prefix.length}:${context.suffix.length}`;
};

// ─── Response shape ───────────────────────────────────────────────────────────

export interface InlineCompletionResponse {
  completion: string;
  model?: string;
}

/**
 * Rejects a suggestion the editor should not be offered.
 *
 * This is the client's half of the contract the server also enforces. The echo
 * case is the one that matters in practice: when the suffix already contains the
 * closing tag or brace the model is about to emit, accepting it duplicates code.
 */
const isUsableSuggestion = (completion: string, suffix: string): boolean => {
  if (!completion.trim()) return false;

  const nextNonSpace = suffix.trimStart().slice(0, 24);
  if (!nextNonSpace) return true;

  // If the model is about to retype what is already immediately after the caret,
  // the suggestion is redundant no matter how well-formed it is.
  return !completion.startsWith(nextNonSpace);
};

// ─── Service ──────────────────────────────────────────────────────────────────

class InlineCopilotService {
  private state: InlineCopilotState = INITIAL_STATE;
  private listeners = new Set<() => void>();

  /** Retained so the provider can build ranges against the same instance. */
  private monaco: Monaco | null = null;
  private registration: Disposable | null = null;

  /**
   * Most recently mounted editor. Selection state lives on the editor, not the
   * text model, so this is what the non-empty-selection guard reads.
   */
  private activeEditor: MonacoApi.editor.IStandaloneCodeEditor | null = null;

  private enabled = false;
  private mounted = false;

  /** Cache of context hash → suggestion. An empty string is a cached "no suggestion". */
  private cache = new Map<string, string>();

  /** The one in-flight request, so a newer one can abort it. */
  private activeController: AbortController | null = null;

  // ── Store (Pattern A: subscribe + getState, read via useSyncExternalStore) ──

  public getState = (): InlineCopilotState => this.state;

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private setState(partial: Partial<InlineCopilotState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener());
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  /**
   * Registers the provider against the Monaco language registry. Idempotent:
   * every editor surface that mounts calls this, and only the first one wins.
   *
   * Safe to call before any editor exists — `monaco.languages` is available as
   * soon as the bundle loads.
   */
  public register = (monaco: Monaco): void => {
    if (this.registration) return;

    this.monaco = monaco;
    this.registration = monaco.languages.registerInlineCompletionsProvider(
      [...SUPPORTED_LANGUAGES],
      {
        groupId: 'gb-coder-inline-copilot',

        provideInlineCompletions: (model, position, _context, token) =>
          this.provideInlineCompletions(model, position, token),

        freeInlineCompletions: () => {
          // Suggestions are plain strings owned by the cache; nothing to release.
        },

        toString: () => 'GB Coder Inline AI Copilot',
      },
    );

    this.mounted = true;
    this.watchSettings();
    this.syncStatus();
  };

  /**
   * Applies the persisted `inlineCopilotEnabled` flag and keeps following it.
   *
   * This service reads the settings blob directly rather than receiving the flag
   * from a React component, because the provider is registered globally and must
   * honour the toggle in every editor surface — the multi-file pane and VS Code
   * mode do not mount {@link CodeEditor}, so a prop threaded through it would
   * leave the setting silently inert there.
   *
   * `useLocalStorage` already broadcasts writes to a `local-storage-change`
   * window event so that separate hook instances stay in sync; listening to that
   * event reuses the app's existing mechanism instead of inventing a second one.
   */
  private watchSettings = (): void => {
    if (typeof window === 'undefined') return;

    this.enabled = this.readPersistedFlag();

    window.addEventListener('local-storage-change', this.handleSettingsChange);
  };

  private handleSettingsChange = (event: Event): void => {
    const key = (event as CustomEvent).detail?.key;
    if (key !== SETTINGS_STORAGE_KEY) return;

    this.setEnabled(this.readPersistedFlag());
  };

  /** Treats any read failure as "off" — the feature must never fail open. */
  private readPersistedFlag(): boolean {
    try {
      const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return false;

      const parsed = JSON.parse(raw) as Partial<AppSettings> | null;
      return parsed?.inlineCopilotEnabled === true;
    } catch {
      return false;
    }
  };

  /**
   * Mirrors the persisted setting onto the service. Exposed so a component can
   * force a specific value, but normal use goes through {@link watchSettings}.
   */
  public setEnabled = (enabled: boolean): void => {
    if (this.enabled === enabled) return;

    this.enabled = enabled;

    if (!enabled) {
      // Drop the in-flight request rather than letting a suggestion surface
      // after the user has turned the feature off.
      this.abortActive();
      this.cache.clear();
    }

    this.syncStatus();
  };

  public isEnabled = (): boolean => this.enabled;

  /**
   * Records the editor that most recently mounted. Called from `onMount` so the
   * provider can consult selection state, which the text model does not carry.
   */
  public attachEditor = (editor: MonacoApi.editor.IStandaloneCodeEditor): void => {
    this.activeEditor = editor;
  };

  /** Test/teardown seam — not used by the app itself. */
  public dispose = (): void => {
    this.abortActive();
    this.registration?.dispose();
    this.registration = null;
    this.mounted = false;
    this.activeEditor = null;
    this.cache.clear();
    if (typeof window !== 'undefined') {
      window.removeEventListener('local-storage-change', this.handleSettingsChange);
    }
    this.syncStatus();
  };

  private abortActive(): void {
    this.activeController?.abort();
    this.activeController = null;
  }

  private syncStatus(): void {
    if (!this.enabled || !this.mounted) {
      this.setState({ status: 'disabled' });
      return;
    }
    // Do not clobber an in-flight `thinking` on an unrelated settings write.
    if (this.state.status === 'thinking') return;
    this.setState({ status: 'ready' });
  }

  // ── Cache ────────────────────────────────────────────────────────────────

  private readCache(key: string): string | undefined {
    if (!this.cache.has(key)) return undefined;

    // Re-insert to refresh recency, which is what makes this an LRU.
    const value = this.cache.get(key) as string;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  private writeCache(key: string, value: string): void {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, value);

    // Evict oldest-first. Map preserves insertion order, so the first key is it.
    while (this.cache.size > CACHE_LIMIT) {
      const oldest = this.cache.keys().next();
      if (oldest.done) break;
      this.cache.delete(oldest.value);
    }
  }

  // ── Provider ──────────────────────────────────────────────────────────────

  private async provideInlineCompletions(
    model: TextModel,
    position: Position,
    token: CancellationToken,
  ): Promise<InlineCompletions> {
    const empty: InlineCompletions = { items: [] };

    if (!this.enabled) return empty;
    if (token.isCancellationRequested) return empty;

    // A live selection means the user is replacing a region, not asking for a
    // continuation at a caret, so ghost text inside their selection is noise.
    // Selection state lives on the editor rather than the model, and the model
    // is checked first because several editors share this one provider.
    const selection = this.activeEditor?.getModel() === model
      ? this.activeEditor.getSelection()
      : null;
    if (selection && !selection.isEmpty()) return empty;

    const context = extractContext(model, position);
    if (!context) return empty;

    /*
     * Two cheap rejections before any network work. The length floor stops an
     * empty file from spending a request per keystroke; the non-whitespace check
     * stops a blank indented line — which is what every Enter press produces —
     * from spending one either, since there is no file style to infer yet.
     */
    if (context.prefix.length < MIN_PREFIX_CHARS) return empty;
    if (!context.prefix.trim()) return empty;

    const key = hashContext(context);
    const cached = this.readCache(key);

    if (cached !== undefined) {
      if (cached) {
        this.setState({ cacheHits: this.state.cacheHits + 1 });
        return this.toResult(cached, position);
      }
      // Cached "nothing sensible here" — a miss, so the user sees no ghost text.
      return empty;
    }

    const survivedDebounce = await this.waitForDebounce(token);
    if (!survivedDebounce) return empty;

    // The document may have moved on while the timer ran; the token covers that
    // in the common case, but a re-check costs nothing and closes the race.
    if (token.isCancellationRequested) return empty;

    const completion = await this.requestCompletion(context, token);
    if (completion === null || token.isCancellationRequested) return empty;

    this.writeCache(key, completion);

    if (!completion) return empty;
    return this.toResult(completion, position);
  }

  /**
   * Resolves true when the debounce elapsed without cancellation.
   *
   * Monaco invokes the provider on every keystroke and cancels the previous
   * token, so honouring that token is what collapses a burst into one request.
   */
  private waitForDebounce(token: CancellationToken): Promise<boolean> {
    return new Promise((resolve) => {
      let settled = false;

      /*
       * Held in an object rather than as two `let` bindings because `finish`
       * closes over them. `onCancellationRequested` may invoke its callback
       * before it returns, so reading a `const subscription` from inside
       * `finish` would hit the temporal dead zone; boxing the fields sidesteps
       * that without suppressing `prefer-const`.
       */
      const pending: { timer?: number; subscription?: Disposable } = {};

      const finish = (survived: boolean) => {
        if (settled) return;
        settled = true;
        if (pending.timer !== undefined) window.clearTimeout(pending.timer);
        pending.subscription?.dispose();
        resolve(survived);
      };

      pending.timer = window.setTimeout(
        () => finish(!token.isCancellationRequested),
        DEBOUNCE_MS,
      );
      pending.subscription = token.onCancellationRequested(() => finish(false));
    });
  }

  /**
   * Calls the endpoint. Returns '' for "no suggestion", or null when the request
   * was aborted or failed — the two cases the caller treats differently from an
   * empty suggestion.
   */
  private async requestCompletion(
    context: InlineContext,
    token: CancellationToken,
  ): Promise<string | null> {
    const controller = new AbortController();
    this.activeController?.abort();
    this.activeController = controller;

    // Bridge Monaco's cancellation onto the fetch.
    const subscription = token.onCancellationRequested(() => controller.abort());
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    this.setState({ status: 'thinking', error: null });
    this.setState({ networkRequests: this.state.networkRequests + 1 });

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prefix: context.prefix,
          suffix: context.suffix,
          language: context.language,
          fileName: context.fileName,
          /*
           * Fall back to the same public key the screenshot-to-code feature uses,
           * so a local install without a server-side GEMINI_API_KEY still works.
           * An empty string is sent as absent and the server then requires its own.
           */
          apiKey: import.meta.env.VITE_GEMINI_API_KEY || undefined,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        this.setState({
          error: typeof data?.error === 'string' ? data.error : `Request failed (${response.status}).`,
        });
        return null;
      }

      const data = (await response.json()) as InlineCompletionResponse;
      const completion = typeof data?.completion === 'string' ? data.completion : '';

      if (!isUsableSuggestion(completion, context.suffix)) return '';

      this.setState({ error: null });
      return completion;
    } catch (error) {
      // An abort is the expected outcome when the user types again, so it is not
      // an error worth surfacing in the status bar.
      if (error instanceof DOMException && error.name === 'AbortError') {
        return null;
      }

      this.setState({ error: 'Cannot reach the completion service.' });
      return null;
    } finally {
      window.clearTimeout(timeoutId);
      subscription.dispose();
      if (this.activeController === controller) this.activeController = null;
      if (this.state.status === 'thinking') {
        this.setState({ status: this.enabled ? 'ready' : 'disabled' });
      }
    }
  }

  /** Shapes a suggestion into the payload Monaco renders as ghost text. */
  private toResult(completion: string, position: Position): InlineCompletions {
    const monaco = this.monaco;
    if (!monaco) return { items: [] };

    const { lineNumber, column } = position;

    return {
      items: [
        {
          insertText: completion,
          // An empty range at the caret: pure insertion, nothing overwritten.
          range: new monaco.Range(lineNumber, column, lineNumber, column),
        },
      ],
      /*
       * Keeps the suggest widget out of the way. Without it the two compete for
       * the same keystroke, and — because Monaco only lets Tab accept ghost text
       * when no suggest item is selected — the Tab binding can go dead.
       */
      suppressSuggestions: true,
      // Holds the suggestion steady while the user types characters that match
      // it, instead of re-requesting after every accepted prefix character.
      enableForwardStability: true,
    };
  }
}

export const inlineCopilotService = new InlineCopilotService();