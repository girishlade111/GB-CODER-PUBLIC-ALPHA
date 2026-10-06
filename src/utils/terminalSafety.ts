/**
 * Strips terminal control sequences from untrusted text.
 *
 * ## Why this is needed
 *
 * The Terminal tab renders into a real xterm.js instance, and xterm faithfully
 * implements the escape sequences it is given. Two of the inputs it is given are
 * attacker-influenced:
 *
 *  - **Sandbox mode** writes `stdout`/`stderr` returned from `/api/sandbox/exec`,
 *    which is the output of commands running the user's project — including any
 *    dependency whose install script the project pulled in.
 *  - **Local mode** writes file contents and file paths out of the project, so
 *    `cat`-ing a file from an untrusted repository writes its bytes verbatim.
 *
 * Without filtering, that content can:
 *
 *  - rewrite the visible scrollback (`ESC[2J ESC[H`) to forge output the user then
 *    reads as the result of their own command;
 *  - move the cursor and overwrite the line in progress, so text the user is
 *    halfway through typing gets replaced by text from the program;
 *  - hide what a program just did by scrolling the record away;
 *  - set the terminal title (`ESC]0;…BEL`), which is a phishing primitive — the tab
 *    can be made to read "Trusted — npm audit clean".
 *
 * ## Why this is not applied at `term.write`
 *
 * The app writes its own colour codes for the prompt and for error output, and
 * those are intentional and must survive. Sanitising the single `write` boundary
 * would therefore either strip the app's own styling or pass everything through.
 *
 * The correct choke point is where untrusted content *enters*, so this is applied
 * to the values on their way in, and the app's own sequences are untouched.
 *
 * ## What survives
 *
 * Newline, carriage return and tab. Those are layout, not control: a program that
 * prints multi-line output still looks right. Everything that can move the cursor,
 * rewrite the screen, or address the terminal itself is removed.
 */

/**
 * Complete escape sequences, matched whole.
 *
 * Stripping only the ESC byte is not enough. `\x1b[10D` would leave `[10D` — inert
 * as far as xterm is concerned, since it has no introducer left, but visible to the
 * user as garbage that looks like a corrupted prompt. Removing the sequence
 * introducer *and* its parameters and final byte is what actually makes the output
 * disappear.
 *
 * The forms covered:
 *
 *  - **CSI** — `ESC [ params intermediates final`, and its 8-bit `\x9b` equivalent.
 *    This is the one that moves the cursor, clears the screen and erases lines.
 *  - **OSC** — `ESC ] …` up to BEL or ST (`ESC \`), and its 8-bit `\x9d`
 *    equivalent. This is the one that sets the window title.
 *  - **Everything else** — `ESC` plus a single byte, which covers the two-byte
 *    Fe/nF families (`ESC ( B`, `ESC =`, and so on).
 *
 * An unterminated OSC deliberately consumes to end of string. That is the safe
 * failure: dropping a little visible text beats passing through a partial control
 * sequence.
 */
// Built from strings rather than a literal, so `no-control-regex` does not apply
// and needs no suppression.
const ANSI_SEQUENCE = new RegExp(
  [
    '\\x1b\\[[0-?]*[ -/]*[@-~]',           // CSI (7-bit)
    '\\x9b[0-?]*[ -/]*[@-~]',              // CSI (8-bit)
    '\\x1b\\][^\\x07\\x1b]*(?:\\x07|\\x1b\\\\)?', // OSC, BEL or ST terminated
    '\\x9d[^\\x07\\x9c]*(?:\\x07|\\x9c)?',  // OSC (8-bit)
    '\\x1b[ -/]*[0-~]',                    // two-byte Fe/nF families
  ].join('|'),
  'g',
);

/**
 * Any remaining control byte: a lone ESC, DEL, and the C1 range.
 *
 * Reached only after whole sequences are gone, so this is the backstop for
 * malformed or truncated input.
 */
// eslint-disable-next-line no-control-regex
const CONTROL_SEQUENCES = /[\x1b\x7f\x80-\x9f]/g;

/**
 * Remaining C0 controls, minus the three that are legitimate layout.
 *
 * Strips BEL, backspace, vertical tab, form feed and the rest. Backspace matters
 * most: without ESC it looks harmless, but it is how a program overwrites the
 * preceding character in place.
 */
// eslint-disable-next-line no-control-regex
const OTHER_C0 = /[\x00-\x08\x0b\x0c\x0e-\x1f]/g;

/**
 * Makes a string safe to write to the terminal.
 *
 * @param value text of unknown provenance
 * @returns the text with escape sequences and control characters removed
 */
export const sanitizeForTerminal = (value: string): string =>
  value.replace(ANSI_SEQUENCE, '').replace(CONTROL_SEQUENCES, '').replace(OTHER_C0, '');

/**
 * Convenience for multi-line output.
 *
 * Normalises line endings and sanitises in one pass, since every caller of this
 * shape is preparing a block of program output for `term.write`.
 *
 * @param value text of unknown provenance
 * @returns sanitised text with CRLF line endings
 */
export const sanitizeForTerminalLines = (value: string): string =>
  sanitizeForTerminal(value).replace(/\r?\n/g, '\r\n');

/**
 * Sanitises an array of lines, dropping any that become empty.
 *
 * Used where line numbering is derived from the array index, so a line that is
 * removed entirely would otherwise leave a gap in the numbering.
 *
 * @param lines text of unknown provenance
 * @returns sanitised, non-empty lines
 */
export const sanitizeLines = (lines: string[]): string[] =>
  lines.map(sanitizeForTerminal).filter((line) => line.length > 0);
