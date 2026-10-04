/**
 * DESIGN.md defines exactly one visual system — a warm-cream editorial canvas.
 * There is no dark theme, so this hook no longer manages one.
 *
 * It is kept as a compatibility shim: ~30 components still read `isDark` while
 * they migrate to plain semantic token classes (`bg-surface-*`, `text-content-*`,
 * `border-stroke-*`). `isDark` is hard-coded `false` so every legacy
 * `isDark ? darkClasses : lightClasses` branch resolves to its light branch
 * without touching the component.
 *
 * Once the migration is complete this hook should be deleted along with the
 * remaining `isDark` references.
 */
export type Theme = 'light';

/** No-op retained for call sites that still pass a theme around. */
export const useTheme = () => ({
  theme: 'light' as Theme,
  setTheme: (_next?: Theme) => { void _next; },
  toggleTheme: () => {},
  isDark: false,
  isLight: true,
});