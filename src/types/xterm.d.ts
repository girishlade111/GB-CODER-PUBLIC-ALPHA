/*
 * Only the CSS side-effect import needs declaring.
 *
 * This file previously also contained a hand-written `declare module 'xterm'`
 * with a minimal `Terminal` class. Because an ambient module declaration wins
 * over a package's own typings, it *shadowed* the real `xterm` types shipped in
 * `xterm/typings/xterm.d.ts` — so the compiler accepted invalid options and
 * hid the genuine API (`clear`, `focus`, `onKey`, `options`, and the correctly
 * typed theme). It has been removed so the package's own typings apply.
 */
declare module 'xterm/css/xterm.css';
