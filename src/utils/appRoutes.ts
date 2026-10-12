/**
 * Client-side routes.
 *
 * There is no router library in this app: the top level is a ladder of early
 * returns in `App`, and the one existing URL-driven view (`/preview/:id`) reads
 * `window.location` by hand. These helpers follow that established approach
 * rather than pulling in a router dependency for a single extra path.
 *
 * Deploys already serve `index.html` for unknown paths — `vercel.json` rewrites
 * `/(.*)` — so a new route needs no infrastructure change.
 */

/** The base mount point for the GB Coder application. */
export const APP_BASE_ROUTE = '/app';

/** The standard plain / React / Vue editor / Dashboard. */
export const EDITOR_ROUTE = '/app';

/**
 * VS Code mode.
 *
 * It needs an address of its own because it is a separate workspace, not a panel
 * of the editor. While it shared the editor's URL, refreshing the page dropped
 * the user back into the standard editor with the imported project gone.
 * Primary route is /app/ide; legacy /ide remains fully supported for backward compatibility.
 */
export const VSCODE_ROUTE = '/app/ide';
export const LEGACY_VSCODE_ROUTE = '/ide';

/**
 * Detached Live Preview popout tab.
 */
export const PREVIEW_POPOUT_ROUTE = '/preview-popout';

/**
 * True when `pathname` addresses VS Code mode.
 *
 * The trailing-slash form counts too: a hand-typed or copied URL may carry one.
 * Supports /app/ide, /app/ide/, /ide, /ide/.
 */
export const isVSCodeModePath = (pathname?: string): boolean => {
  if (typeof window === 'undefined') return false;
  const path = pathname ?? window.location.pathname;
  return (
    path === VSCODE_ROUTE ||
    path === `${VSCODE_ROUTE}/` ||
    path === LEGACY_VSCODE_ROUTE ||
    path === `${LEGACY_VSCODE_ROUTE}/`
  );
};

/**
 * True when `pathname` addresses the detached live preview window.
 */
export const isPreviewPopoutPath = (pathname?: string): boolean => {
  if (typeof window === 'undefined') return false;
  const path = pathname ?? window.location.pathname;
  return (
    path === PREVIEW_POPOUT_ROUTE ||
    path === `${PREVIEW_POPOUT_ROUTE}/` ||
    path.startsWith('/preview-popout') ||
    path.startsWith('/app/preview-popout')
  );
};

/**
 * Adds a history entry for `path`.
 *
 * The query string is intentionally dropped rather than carried across. It holds
 * one-shot instructions — `?fork=<id>` loads a shared preview on mount — so
 * preserving it would re-run that import on every refresh of the new route.
 *
 * A no-op when already at `path`, so entering a mode twice cannot stack
 * duplicate entries that Back would then have to be pressed through twice.
 */
export const navigateTo = (path: string): void => {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === path) return;
  window.history.pushState({}, '', path);
};
