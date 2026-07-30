/**
 * Voice command parsing — a pure module with no browser dependencies.
 *
 * Kept separate from `voiceCommandService` (which owns the Web Speech API) so
 * the grammar can be reasoned about and unit-tested in isolation. Every export
 * here is a pure function or a frozen constant.
 */

/** Every action a spoken phrase can resolve to. */
export type VoiceActionId =
  | 'run'
  | 'build_open'
  | 'build'
  | 'build_followup'
  | 'explain'
  | 'fix'
  | 'optimize'
  | 'enhance_design'
  | 'export'
  | 'save_project'
  | 'open_modal'
  | 'new_file'
  | 'clear_console'
  | 'format'
  | 'toggle_theme'
  | 'copy'
  | 'help'
  | 'stop_listening';

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

export interface VoiceCommandDefinition {
  id: VoiceActionId;
  patterns: RegExp[];
  /**
   * Which capture group carries the parameter. `'all'` uses the whole matched
   * phrase, which is what the Build with AI flow wants: the user's own words
   * become the prompt rather than a stripped fragment.
   */
  paramGroup?: number | 'all';
  description: string;
  examples: string[];
  /** Excluded from the suggestion chips shown in the panel. */
  hidden?: boolean;
}

export interface VoiceCommandMatch {
  id: VoiceActionId;
  /** Resolved parameter, already canonicalised for `export` / `open_modal`. */
  param?: string;
  /** What the user actually said, untouched. */
  transcript: string;
  /** The lower-cased, de-punctuated form the grammar matched against. */
  normalized: string;
  description: string;
}

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

/*
 * Filler that carries no instruction. Stripped before matching so "GB, please
 * run the code" and "run code" take the same path.
 */
const WAKE_WORD = /^(?:hey |ok |okay |yo )?(?:gb coder|gb|coder)[,:]?\s+/;
const POLITENESS = /^(?:please|can you|could you|would you|will you|i want (?:you )?to|i'?d like (?:you )?to|let'?s|lets|now|just|go ahead and)\s+/;
const TRAILING_POLITENESS = /\s+(?:please|thanks|thank you|for me)$/;

/**
 * Lower-cases, removes punctuation and filler, and collapses whitespace.
 * Speech engines return unpredictable casing and trailing periods, so every
 * pattern in this file is written against the normalized form.
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

/**
 * Turns a dictated filename into a real path: speech engines render "utils.js"
 * as "utils dot js" and "src/utils.js" as "src slash utils dot js".
 */
export const spokenTextToPath = (spoken: string): string =>
  spoken
    .replace(/\s+(?:dot|point|period)\s+/g, '.')
    .replace(/\s+(?:slash|forward slash)\s+/g, '/')
    .replace(/\s+(?:dash|hyphen)\s+/g, '-')
    .replace(/\s+(?:underscore|under score)\s+/g, '_')
    .replace(/\s+/g, '')
    .trim();

const MODAL_ALIASES: Readonly<Record<string, VoiceModalTarget>> = Object.freeze({
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

const EXPORT_ALIASES: Readonly<Record<string, VoiceExportTarget>> = Object.freeze({
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

/** Alternation source for the modal names, longest-first so "code stats" wins. */
const MODAL_NAMES = Object.keys(MODAL_ALIASES)
  .sort((a, b) => b.length - a.length)
  .join('|');

const EXPORT_NAMES = Object.keys(EXPORT_ALIASES)
  .sort((a, b) => b.length - a.length)
  .join('|');

export const resolveModalTarget = (spoken: string): VoiceModalTarget | undefined =>
  MODAL_ALIASES[spoken.trim()];

export const resolveExportTarget = (spoken: string): VoiceExportTarget | undefined =>
  EXPORT_ALIASES[spoken.trim()];

/*
 * ORDER IS THE GRAMMAR. The first matching definition wins, so specific
 * phrases must precede the open-ended ones. Concretely:
 *   - "make it look better"  -> enhance_design, not build_followup
 *   - "make it faster"       -> optimize,       not build_followup
 *   - "change the theme"     -> toggle_theme,   not build_followup
 *   - "add a file"           -> new_file,       not build_followup
 *   - "create a login form"  -> build           (last resort for "create ...")
 */
export const VOICE_COMMANDS: readonly VoiceCommandDefinition[] = Object.freeze([
  {
    id: 'stop_listening',
    patterns: [
      /^(?:stop|end|cancel) (?:listening|voice|recording|the recording)$/,
      /^turn off (?:the )?(?:voice|mic|microphone|voice commands?)$/,
      /^disable voice(?: commands?)?$/,
    ],
    description: 'Stop listening',
    examples: ['Stop listening', 'Turn off the microphone'],
    hidden: true,
  },
  {
    id: 'help',
    patterns: [
      /^(?:help|voice help)$/,
      /^what can (?:you|i) (?:do|say)$/,
      /^(?:list|show)(?: me)?(?: all)?(?: the)? (?:commands|voice commands)$/,
    ],
    description: 'List every voice command',
    examples: ['Help', 'What can I say'],
  },
  {
    id: 'run',
    patterns: [
      /^(?:run|execute|rerun|re run)(?: the)?(?: code| preview| project| it| again)?$/,
      /^run preview$/,
      /^(?:show|open|refresh|reload|update)(?: me)?(?: the)? preview$/,
      /^show(?: me)?(?: the)? results?$/,
    ],
    description: 'Run the code and refresh the preview',
    examples: ['Run code', 'Run preview', 'Show the result'],
  },
  {
    id: 'clear_console',
    patterns: [/^clear(?: the)? (?:console|output|terminal|logs?)$/],
    description: 'Clear the console output',
    examples: ['Clear console', 'Clear the output'],
  },
  {
    id: 'format',
    patterns: [
      /^(?:format|beautify|prettify|tidy|indent)(?: the)?(?: code| files| everything)?$/,
      /^clean up(?: the)? code$/,
    ],
    description: 'Format every file',
    examples: ['Format code', 'Beautify'],
  },
  {
    id: 'copy',
    patterns: [/^copy(?: the)?(?: code| all)?$/, /^copy to(?: the)? clipboard$/],
    description: 'Copy the code to the clipboard',
    examples: ['Copy code', 'Copy to clipboard'],
  },
  {
    id: 'toggle_theme',
    patterns: [
      /^switch to (dark|light)(?: mode| theme)?$/,
      /^(?:change|set)(?: the)? theme to (dark|light)$/,
      /^(dark|light) mode$/,
      /^(?:toggle|change|switch)(?: the)? theme$/,
    ],
    paramGroup: 1,
    description: 'Switch between the dark and light theme',
    examples: ['Switch to dark mode', 'Toggle theme'],
  },
  {
    id: 'enhance_design',
    patterns: [
      /^(?:enhance|improve|upgrade|polish|refine)(?: the)? (?:visual )?(?:design|ui|styling|styles|look|looks|appearance)$/,
      /^enhance visual design$/,
      /^make (?:it|this|the ui|the design) look (?:better|nicer|prettier|good|great|modern)$/,
      /^make (?:it|this|the ui|the design) (?:beautiful|prettier|nicer|modern)$/,
    ],
    description: 'Enhance the visual design of the selected code',
    examples: ['Enhance design', 'Make it look better'],
  },
  {
    id: 'explain',
    patterns: [
      /^explain(?: this| that| it)?(?: code| selection)?$/,
      /^explain(?: the)? (?:selected code|selection|code|snippet)$/,
      /^what does (?:this|that)(?: code)? do$/,
      /^describe (?:this|that|the) (?:code|selection)$/,
    ],
    description: 'Explain the selected code',
    examples: ['Explain this', 'Explain selected code'],
  },
  {
    id: 'fix',
    patterns: [
      /^(?:fix|debug)(?: this| that| it)?(?: code)?$/,
      /^fix(?: the)? (?:bugs?|issues?|errors?|problems?|code)$/,
      /^find and fix(?:(?: the)? (?:bugs?|issues?|errors?|problems?))?$/,
      /^find(?: the)? (?:bugs?|issues?|errors?|problems?)$/,
      /^what'?s wrong(?: with this)?$/,
    ],
    description: 'Find and fix issues in the selected code',
    examples: ['Fix this', 'Find and fix'],
  },
  {
    id: 'optimize',
    patterns: [
      /^optimi[sz]e(?: the)?(?: code| performance| this| it)?$/,
      /^improve(?: the)? performance$/,
      /^make (?:it|this|the code) (?:faster|more efficient)$/,
      /^speed (?:it|this) up$/,
    ],
    description: 'Optimize performance of the selected code',
    examples: ['Optimize', 'Optimize performance'],
  },
  {
    id: 'export',
    patterns: [
      new RegExp(
        `^(?:export|save|download)(?: it| this| the project)?(?: as| to| in| into)?(?: a| an)? (${EXPORT_NAMES})(?: file| image)?$`,
      ),
      new RegExp(`^(?:open|send to|share to) (codepen|code pen|jsfiddle|js fiddle|fiddle)$`),
      /^(?:take|capture|grab)(?: a| the)? (screenshot)(?: of the preview)?$/,
      /^(screenshot)$/,
    ],
    paramGroup: 1,
    description: 'Export the project in a specific format',
    examples: ['Export as PNG', 'Export as ZIP', 'Take a screenshot'],
  },
  {
    id: 'save_project',
    patterns: [
      /^save(?: the| my)? (?:project|work|code|files|everything)$/,
      /^download(?: the| my)?(?: project| code| files)?$/,
      /^save$/,
    ],
    description: 'Save or download the project',
    examples: ['Save project', 'Download'],
  },
  {
    id: 'new_file',
    patterns: [
      /^(?:create|add|make|new)(?: a| an)?(?: new| blank| empty)? file(?: (?:called|named) (.+))?$/,
      /^(?:new|add) file (.+)$/,
    ],
    paramGroup: 1,
    description: 'Create a new file (multi-file projects)',
    examples: ['New file', 'Create a new file called utils.js'],
  },
  {
    id: 'open_modal',
    patterns: [
      new RegExp(
        `^(?:open|show|launch|display|go to|bring up)(?: the| my)? (${MODAL_NAMES})(?: modal| panel| dialog| gallery| dashboard| manager| page| tab)?$`,
      ),
      new RegExp(`^(${MODAL_NAMES})$`),
    ],
    paramGroup: 1,
    description: 'Open a panel: templates, settings, statistics, export, import…',
    examples: ['Open templates', 'Open settings', 'Open statistics'],
  },
  {
    id: 'build_open',
    patterns: [
      /^(?:open|launch|start|show)? ?build with ai$/,
      /^(?:build|generate|create) with ai$/,
      /^(?:open|launch)(?: the)? (?:ai builder|build modal|build panel)$/,
    ],
    description: 'Open Build with AI',
    examples: ['Build with AI'],
  },
  {
    id: 'build',
    /*
     * The last-resort creative verbs. `paramGroup: 'all'` hands the whole
     * phrase to the Build with AI modal so the user sees their own words and
     * confirms before anything is generated.
     */
    patterns: [
      /^(?:build|create|generate|design|scaffold|code)(?: me)?(?: a| an| the)? .+$/,
      /^make(?: me)? (?:a|an) .+$/,
      /^i (?:want|need)(?: a| an)? .+$/,
    ],
    paramGroup: 'all',
    description: 'Generate a project from a spoken description',
    examples: ['Build a login form', 'Create a pricing page with three tiers'],
  },
  {
    id: 'build_followup',
    /*
     * Refinements. These only make sense while a build prompt is being
     * composed; the app decides whether to append or start fresh.
     */
    patterns: [
      /^(?:also )?(?:add|include|append|put in) .+$/,
      /^(?:change|update|set|switch|swap|replace|rename) .+$/,
      /^make (?:it|them|this|that|the \w+) .+$/,
      /^(?:remove|delete|get rid of) .+$/,
      /^use .+$/,
    ],
    paramGroup: 'all',
    description: 'Refine the current AI prompt',
    examples: ['Add a navbar', 'Change the color to blue', 'Make it responsive'],
  },
]);

/**
 * Resolves a spoken phrase to a single action. Returns `null` when nothing in
 * the grammar matches, which the caller surfaces as the "not recognized" toast.
 */
export const parseVoiceCommand = (raw: string): VoiceCommandMatch | null => {
  const normalized = normalizeTranscript(raw);
  if (!normalized) return null;

  for (const command of VOICE_COMMANDS) {
    for (const pattern of command.patterns) {
      const match = normalized.match(pattern);
      if (!match) continue;

      let param: string | undefined;

      if (command.paramGroup === 'all') {
        param = normalized;
      } else if (typeof command.paramGroup === 'number') {
        param = match[command.paramGroup]?.trim() || undefined;
      }

      // Canonicalise so the app never re-parses spoken synonyms.
      if (param && command.id === 'export') param = resolveExportTarget(param) ?? param;
      if (param && command.id === 'open_modal') param = resolveModalTarget(param) ?? param;
      if (param && command.id === 'new_file') param = spokenTextToPath(param);

      return {
        id: command.id,
        param,
        transcript: raw.trim(),
        normalized,
        description: command.description,
      };
    }
  }

  return null;
};

/** Commands worth advertising in the panel's command list. */
export const getVisibleCommands = (): VoiceCommandDefinition[] =>
  VOICE_COMMANDS.filter((command) => !command.hidden);
