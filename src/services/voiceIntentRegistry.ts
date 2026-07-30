/**
 * Voice intent registry — the single source of truth for what can be said.
 *
 * Replaces the per-action regex arrays. Each intent now carries a list of
 * natural phrasings; the fuzzy matcher in `voiceMatcher` scores a normalized
 * transcript against all of them, so variants nobody thought to write down
 * ("copy code" vs "copy code to clipboard") resolve to the same action instead
 * of falling through the grammar.
 *
 * The "Show all commands" panel renders from this array, so the advertised
 * command list and count can never drift from what actually works.
 */

/** Every action a spoken phrase can resolve to. */
export type VoiceActionId =
  // Meta
  | 'help'
  | 'stop_listening'
  | 'start_listening'
  | 'set_language'
  // Preview
  | 'run'
  // Build with AI
  | 'build_open'
  | 'build'
  | 'build_followup'
  // Selection-based AI tools
  | 'explain'
  | 'fix'
  | 'optimize'
  | 'enhance_design'
  // Export / share
  | 'export'
  | 'share_link'
  | 'save_project'
  // Navigation
  | 'open_modal'
  | 'open_panel'
  | 'validate_now'
  // Files
  | 'new_file'
  | 'open_file'
  // Editor
  | 'format'
  | 'copy'
  | 'clear_console'
  | 'undo'
  | 'redo'
  | 'toggle_theme'
  // Sandbox (registered, gated until the sandbox layer exists)
  | 'sandbox_connect'
  | 'sandbox_stop';

/** Dispatched action names, including the "nothing matched" signal. */
export type VoiceDispatchAction = VoiceActionId | 'unrecognized';

/** Canonical targets for `open_modal`, so the app never parses strings. */
export type VoiceModalTarget =
  | 'templates'
  | 'settings'
  | 'statistics'
  | 'export'
  | 'share'
  | 'import'
  | 'history'
  | 'snippets'
  | 'ai-chat'
  | 'shortcuts'
  | 'dependencies'
  | 'libraries'
  | 'extensions'
  | 'injection'
  | 'voice';

/** Canonical targets for `export`. */
export type VoiceExportTarget = 'png' | 'jpeg' | 'svg' | 'html' | 'zip' | 'codepen' | 'jsfiddle';

/** Sub-tabs of the right-hand panel. */
export type VoicePanelTarget = 'console' | 'validator' | 'terminal' | 'preview';

/**
 * How an intent extracts its parameter.
 *
 * - `none`       — no parameter.
 * - `free`       — everything after the trigger phrase, verbatim.
 * - `vocabulary` — everything after the trigger, resolved against a fixed set.
 * - `whole`      — the entire normalized transcript, used where the phrasing
 *                  itself is the instruction (AI prompt refinements).
 */
export type VoiceParamKind = 'none' | 'free' | 'vocabulary' | 'whole';

/** Groups used to organise the command reference in the panel. */
export type VoiceCategory =
  | 'Preview & code'
  | 'AI tools'
  | 'Build with AI'
  | 'Export & share'
  | 'Navigation'
  | 'Files'
  | 'Sandbox'
  | 'Voice control';

/**
 * Capabilities an intent depends on. Intents whose capability is unavailable are
 * hidden from the command list and refuse politely if somehow invoked, rather
 * than appearing to work.
 */
export type VoiceCapability = 'sandbox';

export interface VoiceIntent {
  id: VoiceActionId;
  category: VoiceCategory;
  /** Natural phrasings. Order carries no meaning — all are scored. */
  synonyms: string[];
  /**
   * Leading phrases that introduce a parameter, longest-first preferred by the
   * matcher. Only meaningful when `paramKind` is not `none`.
   */
  triggers?: string[];
  paramKind: VoiceParamKind;
  /** Spoken form -> canonical value, for `vocabulary` parameters. */
  paramVocabulary?: Readonly<Record<string, string>>;
  /**
   * Parameter implied by a bare synonym match. "screenshot" means "export as
   * png"; without this the synonym matched but carried no format.
   */
  defaultParam?: string;
  /**
   * Allow the whole utterance to be just a vocabulary value ("settings",
   * "dark mode"), with no verb.
   */
  allowBareParam?: boolean;
  /** Post-processing for `free` parameters, e.g. spoken filename cleanup. */
  finalizeParam?: (raw: string) => string;
  /** Shown in the command reference. */
  description: string;
  examples: string[];
  /** Hidden from the reference list and suggestion chips. */
  hidden?: boolean;
  requires?: VoiceCapability;
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Parameter vocabularies                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

/*
 * Carried over verbatim from the previous parser so canonicalization behaviour
 * is unchanged — only the matching step is being replaced.
 */
export const MODAL_ALIASES: Readonly<Record<string, VoiceModalTarget>> = Object.freeze({
  template: 'templates',
  templates: 'templates',
  'template gallery': 'templates',
  'template library': 'templates',
  setting: 'settings',
  settings: 'settings',
  preferences: 'settings',
  options: 'settings',
  statistic: 'statistics',
  statistics: 'statistics',
  stats: 'statistics',
  'code stats': 'statistics',
  'code statistics': 'statistics',
  metrics: 'statistics',
  export: 'export',
  'export and share': 'export',
  'export share': 'export',
  share: 'share',
  import: 'import',
  history: 'history',
  'code history': 'history',
  snippet: 'snippets',
  snippets: 'snippets',
  'snippet manager': 'snippets',
  'ai chat': 'ai-chat',
  chat: 'ai-chat',
  assistant: 'ai-chat',
  'ai assistant': 'ai-chat',
  shortcut: 'shortcuts',
  shortcuts: 'shortcuts',
  'keyboard shortcuts': 'shortcuts',
  dependencies: 'dependencies',
  packages: 'dependencies',
  library: 'libraries',
  libraries: 'libraries',
  'external libraries': 'libraries',
  extensions: 'extensions',
  marketplace: 'extensions',
  injection: 'injection',
  'custom injection': 'injection',
  'injection manager': 'injection',
  voice: 'voice',
  'voice command': 'voice',
  'voice commands': 'voice',
});

export const EXPORT_ALIASES: Readonly<Record<string, VoiceExportTarget>> = Object.freeze({
  png: 'png',
  image: 'png',
  screenshot: 'png',
  picture: 'png',
  jpg: 'jpeg',
  jpeg: 'jpeg',
  svg: 'svg',
  html: 'html',
  'html file': 'html',
  zip: 'zip',
  'zip file': 'zip',
  archive: 'zip',
  codepen: 'codepen',
  'code pen': 'codepen',
  jsfiddle: 'jsfiddle',
  'js fiddle': 'jsfiddle',
  fiddle: 'jsfiddle',
});

const PANEL_ALIASES: Readonly<Record<string, VoicePanelTarget>> = Object.freeze({
  console: 'console',
  logs: 'console',
  output: 'console',
  validator: 'validator',
  problems: 'validator',
  issues: 'validator',
  errors: 'validator',
  terminal: 'terminal',
  shell: 'terminal',
  'command line': 'terminal',
  preview: 'preview',
  'live preview': 'preview',
});

const THEME_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  dark: 'dark',
  'dark mode': 'dark',
  'dark theme': 'dark',
  night: 'dark',
  light: 'light',
  'light mode': 'light',
  'light theme': 'light',
  day: 'light',
});

/**
 * Spoken language names -> BCP-47 tags. Keeping this beside the other
 * vocabularies means "switch to Hindi" is just another voice command.
 */
const LANGUAGE_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  english: 'en-US',
  'english us': 'en-US',
  'american english': 'en-US',
  'english uk': 'en-GB',
  'british english': 'en-GB',
  'english india': 'en-IN',
  'indian english': 'en-IN',
  hindi: 'hi-IN',
  spanish: 'es-ES',
  espanol: 'es-ES',
  french: 'fr-FR',
  francais: 'fr-FR',
  german: 'de-DE',
  deutsch: 'de-DE',
  italian: 'it-IT',
  portuguese: 'pt-BR',
  japanese: 'ja-JP',
  korean: 'ko-KR',
  chinese: 'zh-CN',
  mandarin: 'zh-CN',
});

/**
 * Spoken filename cleanup: "utils dot js" -> "utils.js".
 *
 * Carried over unchanged from the previous parser (it is part of the
 * canonicalization layer, which this work leaves alone) and exported from here
 * so the registry has no dependency on the parser.
 */
export const spokenTextToPath = (raw: string): string =>
  raw
    .replace(/^(?:called|named|as)\s+/, '')
    .replace(/\s+(?:dot|point|period)\s+/g, '.')
    .replace(/\s+(?:slash|forward slash)\s+/g, '/')
    .replace(/\s+(?:dash|hyphen)\s+/g, '-')
    .replace(/\s+(?:underscore|under score)\s+/g, '_')
    .replace(/\s+/g, '')
    .trim();

/* ────────────────────────────────────────────────────────────────────────── */
/* The registry                                                              */
/* ────────────────────────────────────────────────────────────────────────── */

export const VOICE_INTENTS: readonly VoiceIntent[] = Object.freeze([
  /* ── Preview & code ─────────────────────────────────────────────────── */
  {
    id: 'run',
    category: 'Preview & code',
    paramKind: 'none',
    synonyms: [
      'run code',
      'run the code',
      'run',
      'run it',
      'run preview',
      'run the preview',
      'run project',
      'execute code',
      'execute',
      'rerun',
      'run again',
      'refresh preview',
      'reload preview',
      'update preview',
      'show preview',
      'show the preview',
      'open preview',
      'show result',
      'show the result',
      'show me the results',
      'preview',
    ],
    description: 'Run the code and refresh the preview',
    examples: ['Run code', 'Run preview', 'Show the result'],
  },
  {
    id: 'format',
    category: 'Preview & code',
    paramKind: 'none',
    synonyms: [
      'format code',
      'format',
      'format the code',
      'format everything',
      'format all files',
      'beautify code',
      'beautify',
      'prettify',
      'prettify code',
      'tidy code',
      'tidy up the code',
      'clean up the code',
      'indent code',
      'fix indentation',
    ],
    description: 'Format every file',
    examples: ['Format code', 'Beautify', 'Clean up the code'],
  },
  {
    id: 'copy',
    category: 'Preview & code',
    paramKind: 'none',
    synonyms: [
      'copy code',
      'copy',
      'copy the code',
      'copy all',
      'copy all code',
      'copy to clipboard',
      
      'copy the code to the clipboard',
      'duplicate code',
      'put the code on the clipboard',
    ],
    description: 'Copy the code to the clipboard',
    examples: ['Copy code', 'Copy code to clipboard'],
  },
  {
    id: 'undo',
    category: 'Preview & code',
    paramKind: 'none',
    synonyms: ['undo', 'undo that', 'undo change', 'undo the last change', 'go back', 'revert'],
    description: 'Undo the last change',
    examples: ['Undo', 'Undo that'],
  },
  {
    id: 'redo',
    category: 'Preview & code',
    paramKind: 'none',
    synonyms: ['redo', 'redo that', 'redo change', 'redo the last change', 'do it again'],
    description: 'Redo the last undone change',
    examples: ['Redo'],
  },

  /* ── AI tools (selection based) ─────────────────────────────────────── */
  {
    id: 'explain',
    category: 'AI tools',
    paramKind: 'none',
    synonyms: [
      'explain this',
      'explain',
      'explain the code',
      'explain this code',
      'explain selected code',
      'explain the selection',
      'explain what this does',
      'what does this do',
      'what does this code do',
      'describe this code',
      'tell me what this does',
      'walk me through this',
    ],
    description: 'Explain the selected code',
    examples: ['Explain this', 'Explain selected code', 'What does this do'],
  },
  {
    id: 'fix',
    category: 'AI tools',
    paramKind: 'none',
    synonyms: [
      'fix this',
      'fix',
      'fix it',
      'fix the code',
      'fix the bug',
      'fix the bugs',
      'fix the issue',
      'fix issues',
      'fix the errors',
      'find and fix',
      'find and fix the issue',
      'find and fix issues',
      'find the bug',
      'find the problem',
      'debug this',
      'debug',
      'debug the code',
      'whats wrong',
      'whats wrong with this',
    ],
    description: 'Find and fix issues in the selected code',
    examples: ['Fix this', 'Find and fix', 'Debug this'],
  },
  {
    id: 'optimize',
    category: 'AI tools',
    paramKind: 'none',
    synonyms: [
      'optimize',
      'optimise',
      'optimize code',
      'optimize the code',
      'optimize performance',
      'optimise performance',
      'improve performance',
      'make it faster',
      'make this faster',
      'make the code faster',
      'speed it up',
      'speed this up',
      'make it more efficient',
    ],
    description: 'Optimize performance of the selected code',
    examples: ['Optimize', 'Optimize performance', 'Make it faster'],
  },
  {
    id: 'enhance_design',
    category: 'AI tools',
    paramKind: 'none',
    synonyms: [
      'enhance design',
      'enhance the design',
      'enhance visual design',
      'improve the design',
      'improve the ui',
      'improve styling',
      'upgrade the design',
      'polish the design',
      'make it look better',
      'make it look nicer',
      'make it prettier',
      'make it beautiful',
      'make the ui look better',
      'beautify the design',
    ],
    description: 'Enhance the visual design of the selected code',
    examples: ['Enhance design', 'Make it look better'],
  },

  /* ── Build with AI ─────────────────────────────────────────────────── */
  {
    id: 'build_open',
    category: 'Build with AI',
    paramKind: 'none',
    synonyms: [
      'build with ai',
      'open build with ai',
      'launch build with ai',
      'start build with ai',
      'generate with ai',
      'create with ai',
      'open the ai builder',
      'open build modal',
      'ai builder',
    ],
    description: 'Open Build with AI with an empty prompt',
    examples: ['Build with AI'],
  },
  {
    id: 'build',
    category: 'Build with AI',
    paramKind: 'free',
    /*
     * Everything after the trigger becomes the prompt, so "build a login form
     * with dark theme" yields "a login form with dark theme".
     */
    triggers: [
      'build me',
      'build',
      'create me',
      'create',
      'generate me',
      'generate',
      'design me',
      'design',
      'scaffold',
      'make me',
      'i want',
      'i need',
    ],
    synonyms: [],
    description: 'Generate a project from a spoken description',
    examples: ['Build a login form with dark theme', 'Create a pricing page'],
  },
  {
    id: 'build_followup',
    category: 'Build with AI',
    /* The phrasing *is* the instruction, so the whole utterance is the param. */
    paramKind: 'whole',
    triggers: [
      'also add',
      'add',
      'include',
      'append',
      'change',
      'update',
      'set',
      'swap',
      'replace',
      'rename',
      'remove',
      'delete',
      'get rid of',
      'use',
      'make it',
      'make them',
      'make the',
    ],
    synonyms: [],
    description: 'Refine the prompt currently in Build with AI',
    examples: ['Add a navbar', 'Change the colour to blue', 'Make it responsive'],
  },

  /* ── Export & share ────────────────────────────────────────────────── */
  {
    id: 'export',
    category: 'Export & share',
    paramKind: 'vocabulary',
    paramVocabulary: EXPORT_ALIASES,
    triggers: [
      'export as',
      'export to',
      'export in',
      'export',
      'save as',
      'save to',
      'download as',
      'download in',
      'send to',
      'share to',
      'open in',
      /*
       * Bare "open" is safe here because the vocabulary gates it: "open codepen"
       * resolves, while "open settings" finds no export format and falls through
       * to open_modal.
       */
      'open',
      'take a',
      'capture',
    ],
    synonyms: ['take a screenshot', 'screenshot', 'capture the preview', 'grab a screenshot'],
    /* Those synonyms all mean "save a PNG of the preview". */
    defaultParam: 'png',
    /* "zip" / "png" on their own are unambiguous requests to export. */
    allowBareParam: true,
    description: 'Export in a specific format (PNG, JPEG, SVG, HTML, ZIP, CodePen, JSFiddle)',
    examples: ['Export as PNG', 'Export as ZIP', 'Take a screenshot'],
  },
  {
    id: 'share_link',
    category: 'Export & share',
    paramKind: 'none',
    synonyms: [
      'share link',
      'share the link',
      'share preview',
      'share this project',
      'share',
      'create a share link',
      'get a shareable link',
      'copy share link',
    ],
    description: 'Open the share tab to create a shareable link',
    examples: ['Share link', 'Share this project'],
  },
  {
    id: 'save_project',
    category: 'Export & share',
    paramKind: 'none',
    synonyms: [
      'save project',
      'save the project',
      'save my work',
      'save my project',
      'save everything',
      'save',
      'download',
      'download project',
      'download the project',
      'download the code',
      'download my files',
    ],
    description: 'Save or download the project as a ZIP',
    examples: ['Save project', 'Download'],
  },

  /* ── Navigation ────────────────────────────────────────────────────── */
  {
    id: 'open_modal',
    category: 'Navigation',
    paramKind: 'vocabulary',
    paramVocabulary: MODAL_ALIASES,
    triggers: ['open', 'show', 'show me', 'launch', 'display', 'go to', 'bring up', 'jump to'],
    synonyms: [],
    allowBareParam: true,
    description: 'Open a feature panel (templates, settings, statistics, import, history…)',
    examples: ['Open templates', 'Open settings', 'Show statistics'],
  },
  {
    id: 'open_panel',
    category: 'Navigation',
    paramKind: 'vocabulary',
    paramVocabulary: PANEL_ALIASES,
    triggers: ['open', 'show', 'show me', 'switch to', 'go to', 'display'],
    /*
     * Intentionally no synonyms: "open console" as a synonym matched exactly and
     * short-circuited before the parameter was ever extracted, so the app never
     * learned *which* panel to open.
     */
    synonyms: [],
    allowBareParam: true,
    description: 'Switch the right-hand panel (console, validator, terminal, preview)',
    examples: ['Open console', 'Show problems', 'Open terminal'],
  },
  {
    id: 'validate_now',
    category: 'Navigation',
    paramKind: 'none',
    synonyms: [
      'validate',
      'validate code',
      'validate now',
      'check my code',
      'check the code',
      'check for errors',
      'run validation',
      'find problems',
      'lint',
      'lint the code',
    ],
    description: 'Re-run validation and show the Problems list',
    examples: ['Validate', 'Check my code'],
  },
  {
    id: 'clear_console',
    category: 'Navigation',
    paramKind: 'none',
    synonyms: [
      'clear console',
      'clear the console',
      'clear output',
      'clear the output',
      'clear logs',
      'clear the logs',
      'clear terminal',
      'empty the console',
      'clear',
      'clear it',
    ],
    description: 'Clear the console output',
    examples: ['Clear console', 'Clear the output'],
  },

  /* ── Files ─────────────────────────────────────────────────────────── */
  {
    id: 'new_file',
    category: 'Files',
    paramKind: 'free',
    triggers: [
      'create a new file',
      'create new file',
      'create file',
      'add a new file',
      'add new file',
      'add file',
      'new file',
      'make a new file',
      'make file',
    ],
    synonyms: [
      'new file',
      'add file',
      'create a file',
      'create a new file',
      'add a new file',
      'make a new file',
    ],
    finalizeParam: spokenTextToPath,
    description: 'Create a new file (React and Vue projects)',
    examples: ['New file', 'Create a new file called utils.js'],
  },
  {
    id: 'open_file',
    category: 'Files',
    paramKind: 'free',
    triggers: ['open file', 'open the file', 'switch to file', 'go to file', 'edit file'],
    synonyms: [],
    finalizeParam: spokenTextToPath,
    description: 'Open a project file by name',
    examples: ['Open file App.jsx'],
  },

  /* ── Sandbox (gated until the sandbox layer lands) ──────────────────── */
  {
    id: 'sandbox_connect',
    category: 'Sandbox',
    paramKind: 'none',
    requires: 'sandbox',
    synonyms: [
      'connect sandbox',
      'connect to the sandbox',
      'start sandbox',
      'attach sandbox',
      'open a sandbox',
    ],
    description: 'Connect to a sandbox for a real shell',
    examples: ['Connect sandbox'],
  },
  {
    id: 'sandbox_stop',
    category: 'Sandbox',
    paramKind: 'none',
    requires: 'sandbox',
    synonyms: ['stop sandbox', 'disconnect sandbox', 'shut down the sandbox', 'kill the sandbox'],
    description: 'Disconnect the active sandbox',
    examples: ['Stop sandbox'],
  },

  /* ── Voice control ─────────────────────────────────────────────────── */
  {
    id: 'set_language',
    category: 'Voice control',
    paramKind: 'vocabulary',
    paramVocabulary: LANGUAGE_ALIASES,
    triggers: [
      'switch language to',
      'change language to',
      'set language to',
      'speak',
      'listen in',
      'switch to',
      'change to',
      'language',
    ],
    synonyms: [],
    description: 'Switch the recognition language',
    examples: ['Switch language to Hindi', 'Speak French'],
  },
  {
    id: 'toggle_theme',
    category: 'Navigation',
    paramKind: 'vocabulary',
    paramVocabulary: THEME_ALIASES,
    triggers: ['switch to', 'change theme to', 'set theme to', 'change the theme to', 'use'],
    /*
     * Only the "flip it" phrasings are synonyms. "dark mode" is a *value*, so it
     * resolves through the vocabulary and arrives with a parameter; as a synonym
     * it matched exactly and lost the parameter entirely.
     */
    synonyms: ['toggle theme', 'switch theme', 'change theme'],
    allowBareParam: true,
    description: 'Switch between the dark and light theme',
    examples: ['Dark mode', 'Switch to light', 'Toggle theme'],
  },
  {
    id: 'help',
    category: 'Voice control',
    paramKind: 'none',
    synonyms: [
      'help',
      'voice help',
      'show commands',
      'show all commands',
      'list commands',
      'what can i say',
      'what can you do',
      'what commands are there',
    ],
    description: 'List every voice command',
    examples: ['Help', 'What can I say'],
  },
  {
    id: 'stop_listening',
    category: 'Voice control',
    paramKind: 'none',
    hidden: true,
    synonyms: [
      'stop listening',
      'stop',
      'stop the recording',
      'turn off the microphone',
      'turn off the mic',
      'turn off voice',
      'disable voice commands',
      'mute the mic',
      'never mind',
    ],
    description: 'Stop listening',
    examples: ['Stop listening', 'Turn off the microphone'],
  },
  {
    id: 'start_listening',
    category: 'Voice control',
    paramKind: 'none',
    hidden: true,
    synonyms: [
      'start listening',
      'listen',
      'wake up',
      'turn on the microphone',
      'turn on voice commands',
      'enable voice',
    ],
    description: 'Start listening',
    examples: ['Start listening'],
  },
]);

/* ────────────────────────────────────────────────────────────────────────── */
/* Lookups                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

const INTENTS_BY_ID = new Map<VoiceActionId, VoiceIntent>(
  VOICE_INTENTS.map((intent) => [intent.id, intent]),
);

export const getIntent = (id: VoiceActionId): VoiceIntent | undefined => INTENTS_BY_ID.get(id);

/** Capabilities currently available. Absent entries are treated as false. */
export type VoiceCapabilities = Partial<Record<VoiceCapability, boolean>>;

export const isIntentAvailable = (
  intent: VoiceIntent,
  capabilities: VoiceCapabilities = {},
): boolean => (intent.requires ? capabilities[intent.requires] === true : true);

/** Intents to advertise: available, and not marked hidden. */
export const getListedIntents = (capabilities: VoiceCapabilities = {}): VoiceIntent[] =>
  VOICE_INTENTS.filter((intent) => !intent.hidden && isIntentAvailable(intent, capabilities));

/** Listed intents grouped by category, for the command reference. */
export const getIntentsByCategory = (
  capabilities: VoiceCapabilities = {},
): { category: VoiceCategory; intents: VoiceIntent[] }[] => {
  const order: VoiceCategory[] = [
    'Preview & code',
    'AI tools',
    'Build with AI',
    'Export & share',
    'Navigation',
    'Files',
    'Sandbox',
    'Voice control',
  ];

  return order
    .map((category) => ({
      category,
      intents: getListedIntents(capabilities).filter((intent) => intent.category === category),
    }))
    .filter((group) => group.intents.length > 0);
};

export const UNRECOGNIZED_MESSAGE =
  "Command not recognized. Try 'Run code', 'Build with AI', or 'Explain this'.";

/** Hints surfaced in the listening overlay. */
export const VOICE_SUGGESTIONS: readonly string[] = Object.freeze([
  'Run code',
  'Explain this',
  'Build a login form',
  'Export as PNG',
  'Open settings',
]);
