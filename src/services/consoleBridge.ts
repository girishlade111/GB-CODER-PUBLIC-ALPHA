/**
 * Preview -> parent console bridge.
 *
 * One module owns the whole contract: the script injected into the preview
 * iframe, the message shape it posts, and the parent-side parsing/mapping. The
 * previous implementation spread this across two components with two competing
 * `window.addEventListener('message')` handlers and no channel marker, so any
 * postMessage traffic on the page was treated as console output.
 *
 * Everything here is client-side. No network, no backend.
 */

/** Marks our messages so unrelated postMessage traffic is ignored. */
export const CONSOLE_BRIDGE_CHANNEL = 'gb-coder-preview-bridge';

export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

/** Where a message came from, which drives how it is presented. */
export type ConsoleOrigin = 'console' | 'window-error' | 'unhandled-rejection';

export interface StackFrame {
  /** Function name, when the engine reported one. */
  fn: string | null;
  /** Raw script identifier: `about:srcdoc`, `<anonymous>`, a URL, etc. */
  file: string;
  line: number;
  column: number;
  /** The original text, kept so unmappable frames can still be shown. */
  raw: string;
}

/**
 * A structurally serialized runtime value. Objects survive the postMessage
 * boundary as an inspectable tree instead of being flattened to a string --
 * the old bridge turned every object into the literal text `[Object]`.
 */
export type SerializedValue =
  | { kind: 'string'; value: string; truncated?: boolean }
  | { kind: 'number'; value: string }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'null' }
  | { kind: 'undefined' }
  | { kind: 'bigint'; value: string }
  | { kind: 'symbol'; value: string }
  | { kind: 'function'; name: string; isClass: boolean }
  | { kind: 'date'; value: string }
  | { kind: 'regexp'; value: string }
  | { kind: 'node'; preview: string }
  | { kind: 'error'; name: string; message: string; stack: StackFrame[] }
  | { kind: 'array'; length: number; entries: SerializedEntry[]; truncated: boolean }
  | {
      kind: 'object';
      /** Constructor name, e.g. `Object`, `Foo`. Used as the tree label. */
      ctor: string;
      entries: SerializedEntry[];
      truncated: boolean;
    }
  | { kind: 'collection'; ctor: 'Map' | 'Set'; size: number; entries: SerializedEntry[]; truncated: boolean }
  | { kind: 'circular' }
  | { kind: 'max-depth'; preview: string }
  | { kind: 'unserializable'; preview: string };

export interface SerializedEntry {
  key: string;
  value: SerializedValue;
}

export interface ConsoleBridgeConsoleMessage {
  channel: typeof CONSOLE_BRIDGE_CHANNEL;
  kind: 'console';
  level: ConsoleLevel;
  origin: ConsoleOrigin;
  args: SerializedValue[];
  stack: StackFrame[];
  /** Epoch milliseconds. */
  timestamp: number;
  /** Monotonic per-document counter, used to build collision-free ids. */
  seq: number;
  /** `console.group` nesting depth at the time of the call. */
  groupDepth: number;
}

export interface ConsoleBridgeLifecycleMessage {
  channel: typeof CONSOLE_BRIDGE_CHANNEL;
  kind: 'lifecycle';
  /** `loaded` fires once per document, which is how a run/reload is detected. */
  event: 'loaded';
  /** Identifies the document instance so stale messages can be dropped. */
  runId: string;
  timestamp: number;
}

export interface ConsoleBridgeHeartbeatMessage {
  channel: typeof CONSOLE_BRIDGE_CHANNEL;
  kind: 'heartbeat';
}

export type ConsoleBridgeMessage = ConsoleBridgeConsoleMessage | ConsoleBridgeLifecycleMessage | ConsoleBridgeHeartbeatMessage;

/** Caps, mirrored in the injected script. Bounded work per console call. */
export const BRIDGE_LIMITS = {
  maxDepth: 4,
  maxEntries: 100,
  maxStringLength: 10000,
  maxStackFrames: 30,
} as const;

/**
 * Type guard for the parent-side listener. Also rejects messages that did not
 * come from the expected window, which is what stops one preview iframe's logs
 * from leaking into another panel's feed.
 */
export const parseBridgeMessage = (
  event: MessageEvent,
  expectedSource?: Window | null,
): ConsoleBridgeMessage | null => {
  const data = event.data as ConsoleBridgeMessage | undefined;
  if (!data || typeof data !== 'object') return null;
  if (data.channel !== CONSOLE_BRIDGE_CHANNEL) return null;
  if (expectedSource && event.source !== expectedSource) return null;
  if (data.kind !== 'console' && data.kind !== 'lifecycle' && data.kind !== 'heartbeat') return null;
  return data;
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Stack frame -> user file mapping                                          */
/* ────────────────────────────────────────────────────────────────────────── */

/** A location inside one of the user's own files. */
export interface SourceLocation {
  /** Editor target: `html` | `css` | `javascript`, or a project file path. */
  file: string;
  line: number;
  column: number;
}

export interface StackMappingContext {
  /**
   * 1-based line in the generated preview document where the user's inline
   * script begins. Frames reported against `about:srcdoc` are offset by this.
   */
  userScriptStartLine: number | null;
  /**
   * True when the user's JS runs through `eval`, in which case engines report
   * it against `<anonymous>` with line numbers already relative to the script.
   */
  userScriptIsEvaluated: boolean;
  /** Editor key the inline script maps to. */
  scriptFile: string;
}

/**
 * Resolves an engine stack frame back to a line the user can actually click.
 *
 * Returns `null` when the frame belongs to injected bridge code, a CDN
 * library, or a bundled module graph we have no source map for -- those frames
 * are rendered as inert text rather than as a link that would jump somewhere
 * misleading.
 */
export const mapStackFrame = (
  frame: StackFrame,
  context: StackMappingContext,
): SourceLocation | null => {
  const { file, line, column } = frame;

  // `eval`-executed user code: line numbers are already script-relative.
  if (context.userScriptIsEvaluated && (file === '<anonymous>' || file === 'eval')) {
    if (line < 1) return null;
    return { file: context.scriptFile, line, column };
  }

  // Inline script inside the generated srcdoc document.
  if (file === 'about:srcdoc' || file === 'about:blank' || file === '') {
    const start = context.userScriptStartLine;
    if (start === null) return null;
    const mapped = line - start + 1;
    if (mapped < 1) return null; // Bridge/bootstrap code above the user script.
    return { file: context.scriptFile, line: mapped, column };
  }

  return null;
};

/** Parses `Error.prototype.stack` text into frames. Exported for testing. */
export const parseStackText = (stack: string | undefined | null): StackFrame[] => {
  if (!stack) return [];
  const frames: StackFrame[] = [];

  for (const rawLine of stack.split('\n')) {
    const raw = rawLine.trim();
    if (!raw || /^[A-Za-z]*Error\b/.test(raw)) continue;

    /*
     * Chrome/Edge:  at fn (file:line:col)  |  at file:line:col
     * Firefox/Safari: fn@file:line:col
     * Nested eval frames keep only the innermost `<anonymous>:line:col`, which
     * is the position inside the evaluated user script.
     */
    let fn: string | null = null;
    let locus = raw;

    const chromeNamed = /^at\s+(.*?)\s+\((.*)\)$/.exec(raw);
    const chromeBare = /^at\s+(.*)$/.exec(raw);
    const firefox = /^(.*?)@(.*)$/.exec(raw);

    if (chromeNamed) {
      fn = chromeNamed[1];
      locus = chromeNamed[2];
    } else if (chromeBare) {
      locus = chromeBare[1];
    } else if (firefox) {
      fn = firefox[1] || null;
      locus = firefox[2];
    } else {
      continue;
    }

    // `eval at foo (about:srcdoc:1:1), <anonymous>:3:5` -> take the last part.
    const evalSplit = locus.lastIndexOf(', ');
    if (locus.startsWith('eval at') && evalSplit !== -1) {
      locus = locus.slice(evalSplit + 2);
    }

    const match = /^(.*):(\d+):(\d+)$/.exec(locus);
    if (!match) continue;

    frames.push({
      fn: fn && fn !== '<anonymous>' ? fn : null,
      file: match[1],
      line: Number(match[2]),
      column: Number(match[3]),
      raw,
    });

    if (frames.length >= BRIDGE_LIMITS.maxStackFrames) break;
  }

  return frames;
};

/* ────────────────────────────────────────────────────────────────────────── */
/* The injected script                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Source for the script injected into every preview document.
 *
 * Deliberately dependency-free ES5-compatible JavaScript built as a string:
 * it runs inside the sandboxed iframe, before any user or bundled code, and
 * cannot import from this module. It contains no `${}` interpolation so the
 * template literal cannot be broken by its own contents -- the only injected
 * value is appended separately by `buildConsoleBridgeScript`.
 *
 * Unlike the previous bridge, this one calls through to the real console
 * methods, so browser devtools still work while GB Coder mirrors the output.
 */
const BRIDGE_SOURCE = String.raw`
(function () {
  var CHANNEL = '__CHANNEL__';
  var RUN_ID = '__RUN_ID__';
  var MAX_DEPTH = 4;
  var MAX_ENTRIES = 100;
  var MAX_STRING = 10000;
  var MAX_FRAMES = 30;
  var seq = 0;
  var groupDepth = 0;

  var post = function (payload) {
    try {
      window.parent.postMessage(payload, '*');
    } catch (e) {
      /* A value that cannot be structured-cloned must never break user code. */
    }
  };

  var truncate = function (text) {
    if (text.length <= MAX_STRING) return { value: text, truncated: false };
    return { value: text.slice(0, MAX_STRING), truncated: true };
  };

  var parseStack = function (stack) {
    if (!stack) return [];
    var lines = String(stack).split('\n');
    var frames = [];
    for (var i = 0; i < lines.length && frames.length < MAX_FRAMES; i++) {
      var raw = lines[i].trim();
      if (!raw || /^[A-Za-z]*Error\b/.test(raw)) continue;
      var fn = null;
      var locus = raw;
      var named = /^at\s+(.*?)\s+\((.*)\)$/.exec(raw);
      var bare = /^at\s+(.*)$/.exec(raw);
      var ff = /^(.*?)@(.*)$/.exec(raw);
      if (named) { fn = named[1]; locus = named[2]; }
      else if (bare) { locus = bare[1]; }
      else if (ff) { fn = ff[1] || null; locus = ff[2]; }
      else continue;
      if (locus.indexOf('eval at') === 0) {
        var cut = locus.lastIndexOf(', ');
        if (cut !== -1) locus = locus.slice(cut + 2);
      }
      var m = /^(.*):(\d+):(\d+)$/.exec(locus);
      if (!m) continue;
      frames.push({
        fn: fn && fn !== '<anonymous>' ? fn : null,
        file: m[1],
        line: Number(m[2]),
        column: Number(m[3]),
        raw: raw
      });
    }
    return frames;
  };

  var ctorName = function (value) {
    try {
      if (value.constructor && value.constructor.name) return value.constructor.name;
    } catch (e) { /* getters can throw */ }
    return 'Object';
  };

  var describe = function (value) {
    try {
      if (Array.isArray(value)) return 'Array(' + value.length + ')';
      return ctorName(value);
    } catch (e) {
      return 'Object';
    }
  };

  /* Depth- and breadth-bounded structural clone, cycle safe. */
  var serialize = function (value, depth, seen) {
    var type = typeof value;

    if (value === null) return { kind: 'null' };
    if (type === 'undefined') return { kind: 'undefined' };
    if (type === 'string') {
      var t = truncate(value);
      return t.truncated
        ? { kind: 'string', value: t.value, truncated: true }
        : { kind: 'string', value: t.value };
    }
    if (type === 'number') return { kind: 'number', value: String(value) };
    if (type === 'boolean') return { kind: 'boolean', value: value };
    if (type === 'bigint') return { kind: 'bigint', value: String(value) };
    if (type === 'symbol') return { kind: 'symbol', value: String(value) };
    if (type === 'function') {
      var src = '';
      try { src = String(value); } catch (e) { src = ''; }
      return {
        kind: 'function',
        name: value.name || '(anonymous)',
        isClass: src.indexOf('class') === 0
      };
    }

    if (type !== 'object') return { kind: 'unserializable', preview: String(type) };

    if (seen.indexOf(value) !== -1) return { kind: 'circular' };

    if (value instanceof Error) {
      return {
        kind: 'error',
        name: value.name || 'Error',
        message: truncate(String(value.message || '')).value,
        stack: parseStack(value.stack)
      };
    }
    if (value instanceof Date) {
      return { kind: 'date', value: isNaN(value.getTime()) ? 'Invalid Date' : value.toISOString() };
    }
    if (value instanceof RegExp) return { kind: 'regexp', value: String(value) };

    if (typeof Node !== 'undefined' && value instanceof Node) {
      var preview = '';
      try {
        preview = value.nodeType === 1
          ? '<' + String(value.tagName || '').toLowerCase() +
            (value.id ? '#' + value.id : '') +
            (value.className && typeof value.className === 'string'
              ? '.' + value.className.trim().split(/\s+/).join('.')
              : '') + '>'
          : String(value.nodeName);
      } catch (e) { preview = '#node'; }
      return { kind: 'node', preview: preview };
    }

    if (depth >= MAX_DEPTH) return { kind: 'max-depth', preview: describe(value) };

    var nextSeen = seen.concat([value]);
    var entries = [];
    var truncatedFlag = false;
    var i;

    if (typeof Map !== 'undefined' && value instanceof Map) {
      var mapIndex = 0;
      value.forEach(function (v, k) {
        if (mapIndex >= MAX_ENTRIES) { truncatedFlag = true; return; }
        entries.push({ key: String(k), value: serialize(v, depth + 1, nextSeen) });
        mapIndex++;
      });
      return { kind: 'collection', ctor: 'Map', size: value.size, entries: entries, truncated: truncatedFlag };
    }

    if (typeof Set !== 'undefined' && value instanceof Set) {
      var setIndex = 0;
      value.forEach(function (v) {
        if (setIndex >= MAX_ENTRIES) { truncatedFlag = true; return; }
        entries.push({ key: String(setIndex), value: serialize(v, depth + 1, nextSeen) });
        setIndex++;
      });
      return { kind: 'collection', ctor: 'Set', size: value.size, entries: entries, truncated: truncatedFlag };
    }

    if (Array.isArray(value)) {
      var limit = Math.min(value.length, MAX_ENTRIES);
      for (i = 0; i < limit; i++) {
        entries.push({ key: String(i), value: serialize(value[i], depth + 1, nextSeen) });
      }
      return {
        kind: 'array',
        length: value.length,
        entries: entries,
        truncated: value.length > limit
      };
    }

    var keys;
    try { keys = Object.keys(value); } catch (e) { keys = []; }
    var keyLimit = Math.min(keys.length, MAX_ENTRIES);
    for (i = 0; i < keyLimit; i++) {
      var key = keys[i];
      var entryValue;
      try {
        entryValue = serialize(value[key], depth + 1, nextSeen);
      } catch (e) {
        /* Throwing getters are reported rather than losing the whole object. */
        entryValue = { kind: 'unserializable', preview: 'threw on access' };
      }
      entries.push({ key: key, value: entryValue });
    }

    return {
      kind: 'object',
      ctor: ctorName(value),
      entries: entries,
      truncated: keys.length > keyLimit
    };
  };

  var send = function (level, origin, args, stack) {
    var serialized = [];
    for (var i = 0; i < args.length; i++) {
      try {
        serialized.push(serialize(args[i], 0, []));
      } catch (e) {
        serialized.push({ kind: 'unserializable', preview: 'serialization failed' });
      }
    }
    post({
      channel: CHANNEL,
      kind: 'console',
      level: level,
      origin: origin,
      args: serialized,
      stack: stack || [],
      timestamp: Date.now(),
      seq: seq++,
      groupDepth: groupDepth
    });
  };

  /* Capture the call site for errors and warnings so frames stay clickable. */
  var callSite = function () {
    try {
      var err = new Error();
      var frames = parseStack(err.stack);
      /* Drop frames belonging to this bridge itself. */
      return frames.slice(2);
    } catch (e) {
      return [];
    }
  };

  var LEVELS = ['log', 'info', 'warn', 'error', 'debug'];
  var original = {};

  for (var li = 0; li < LEVELS.length; li++) {
    (function (level) {
      original[level] = console[level] ? console[level].bind(console) : function () {};
      console[level] = function () {
        var args = Array.prototype.slice.call(arguments);
        send(level, 'console', args, level === 'error' || level === 'warn' ? callSite() : []);
        /* Keep native devtools working -- the old bridge swallowed output. */
        try { original[level].apply(null, args); } catch (e) {}
      };
    })(LEVELS[li]);
  }

  /* trace, dir and table map onto existing levels rather than vanishing. */
  var originalTrace = console.trace ? console.trace.bind(console) : function () {};
  console.trace = function () {
    var args = Array.prototype.slice.call(arguments);
    send('debug', 'console', args.length ? args : ['console.trace'], callSite());
    try { originalTrace.apply(null, args); } catch (e) {}
  };

  var originalDir = console.dir ? console.dir.bind(console) : function () {};
  console.dir = function (value) {
    send('log', 'console', [value], []);
    try { originalDir(value); } catch (e) {}
  };

  var originalTable = console.table ? console.table.bind(console) : function () {};
  console.table = function (value) {
    send('log', 'console', [value], []);
    try { originalTable(value); } catch (e) {}
  };

  var originalGroup = console.group ? console.group.bind(console) : function () {};
  var originalGroupEnd = console.groupEnd ? console.groupEnd.bind(console) : function () {};
  console.group = function () {
    var args = Array.prototype.slice.call(arguments);
    send('log', 'console', args, []);
    groupDepth++;
    try { originalGroup.apply(null, args); } catch (e) {}
  };
  console.groupCollapsed = console.group;
  console.groupEnd = function () {
    if (groupDepth > 0) groupDepth--;
    try { originalGroupEnd(); } catch (e) {}
  };

  var originalAssert = console.assert ? console.assert.bind(console) : function () {};
  console.assert = function (condition) {
    if (!condition) {
      var rest = Array.prototype.slice.call(arguments, 1);
      send('error', 'console', ['Assertion failed:'].concat(rest), callSite());
    }
    try { originalAssert.apply(null, arguments); } catch (e) {}
  };

  /*
   * Uncaught errors. event.error carries a real Error with a usable stack;
   * the previous bridge baked the location into a plain string, which made
   * click-to-jump impossible.
   */
  window.addEventListener('error', function (event) {
    if (event.error instanceof Error) {
      send('error', 'window-error', [event.error], parseStack(event.error.stack));
      return;
    }
    var frames = [];
    if (event.filename) {
      frames = [{
        fn: null,
        file: event.filename,
        line: Number(event.lineno) || 0,
        column: Number(event.colno) || 0,
        raw: 'at ' + event.filename + ':' + event.lineno + ':' + event.colno
      }];
    }
    send('error', 'window-error', [String(event.message || 'Unknown error')], frames);
  });

  /* Promise rejections were previously dropped entirely. */
  window.addEventListener('unhandledrejection', function (event) {
    var reason = event.reason;
    var stack = reason instanceof Error ? parseStack(reason.stack) : [];
    send('error', 'unhandled-rejection', [
      'Uncaught (in promise)',
      reason === undefined ? '(no reason)' : reason
    ], stack);
  });

  /* Tells the parent a fresh document is live, so it can clear the feed. */
  post({ channel: CHANNEL, kind: 'lifecycle', event: 'loaded', runId: RUN_ID, timestamp: Date.now() });
})();
`;

/**
 * Builds the bridge script for one preview document.
 *
 * @param runId Identifies this document instance so the parent can discard
 *              messages that arrive from an iframe it has already replaced.
 */
export const buildConsoleBridgeScript = (runId: string): string =>
  BRIDGE_SOURCE.replace('__CHANNEL__', CONSOLE_BRIDGE_CHANNEL).replace('__RUN_ID__', runId);

/**
 * Counts the lines the bridge script occupies, so callers can work out where
 * the user's own script starts in the assembled document.
 */
export const countLines = (text: string): number => text.split('\n').length;
