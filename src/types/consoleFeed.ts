/**
 * The console feed model.
 *
 * Replaces `ConsoleLog` (a flat `{ type, message: string }`) for anything that
 * needs structure: multiple arguments, inspectable objects, and stack frames
 * resolved back to the user's own files.
 */
import type {
  ConsoleLevel,
  ConsoleOrigin,
  SerializedValue,
  SourceLocation,
  StackFrame,
} from '../services/consoleBridge';

export type { ConsoleLevel, SerializedValue, SourceLocation, StackFrame };

/** `build` covers bundler diagnostics, which do not come from the iframe. */
export type ConsoleMessageOrigin = ConsoleOrigin | 'build';

/** A stack frame paired with the user-file location it resolved to, if any. */
export interface ResolvedStackFrame {
  frame: StackFrame;
  /** `null` when the frame is library, bundle, or bridge code. */
  location: SourceLocation | null;
}

export interface ConsoleMessage {
  /** Unique and stable. Never derived from `Date.now()` alone. */
  id: string;
  level: ConsoleLevel;
  origin: ConsoleMessageOrigin;
  /** One entry per `console.log` argument, in call order. */
  args: SerializedValue[];
  stack: ResolvedStackFrame[];
  /** Epoch milliseconds. */
  timestamp: number;
  /** `console.group` nesting depth. */
  groupDepth: number;
  /** Consecutive identical messages collapse, as in browser devtools. */
  count: number;
}

/** Level filter for the console tab. `all` disables filtering. */
export type ConsoleLevelFilter = 'all' | ConsoleLevel;

/**
 * Upper bound on retained messages. A runaway loop inside user code can emit
 * tens of thousands of logs; the previous feed was an unbounded array that grew
 * until the tab died.
 */
export const CONSOLE_FEED_LIMIT = 500;
