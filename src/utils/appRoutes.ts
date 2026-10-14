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

/**
 * The standard plain / React / Vue editor / Dashboard.
 *
 * `/app` is the Projects Dashboard (project-first entry). The Static Editor
 * lives at {@link STATIC_EDITOR_ROUTE}; see below.
 */
export const EDITOR_ROUTE = '/app';

/**
 * Projects Dashboard — the first-class entry screen.
 *
 * `/app` and `/app/projects` (optional trailing slash) both address it.
 * Landing-page CTAs point here; it never auto-opens a project.
 */
export const PROJECTS_ROUTE = '/app/projects';

/**
 * Static Editor — plain HTML/CSS/JS (and simple multi-file) projects.
 *
 * An explicit selected project is required: arriving here with no valid
 * project falls back to the dashboard rather than inventing content.
 */
export const STATIC_EDITOR_ROUTE = '/app/editor';

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
 * True when `pathname` addresses the Projects Dashboard.
 *
 * Both `/app` (canonical, legacy) and `/app/projects` land here, with an
 * optional trailing slash. The dashboard never auto-opens a project: the
 * stored active-project pointer is only honoured on editor routes.
 */
export const isDashboardPath = (pathname?: string): boolean => {
  const path = pathname ?? currentPathname();
  if (path === undefined) return false;
  return (
    path === APP_BASE_ROUTE ||
    path === `${APP_BASE_ROUTE}/` ||
    path === PROJECTS_ROUTE ||
    path === `${PROJECTS_ROUTE}/`
  );
};

/**
 * True when `pathname` addresses the Static Editor.
 *
 * The trailing-slash form counts too: a hand-typed or copied URL may carry one.
 * Supports /app/editor, /app/editor/.
 */
export const isStaticEditorPath = (pathname?: string): boolean => {
  const path = pathname ?? currentPathname();
  if (path === undefined) return false;
  return path === STATIC_EDITOR_ROUTE || path === `${STATIC_EDITOR_ROUTE}/`;
};

/**
 * True when `pathname` addresses either editor (static or VS Code mode).
 *
 * This is the condition under which the stored active-project pointer may be
 * honoured on a cold start. Dashboard arrivals always land on the dashboard.
 */
export const isEditorRoutePath = (pathname?: string): boolean => {
  const path = pathname ?? currentPathname();
  if (path === undefined) return false;
  return isStaticEditorPath(path) || isVSCodeModePath(path);
};
/**
 * Current browser path, or `undefined` outside a browser (SSR / tests).
 *
 * The route helpers stay pure when given an explicit pathname, so they are
 * unit-testable in Node; the `window` read happens only for the live-URL
 * default.
 */
const currentPathname = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  return window.location.pathname;
};

/**
 * True when `pathname` addresses VS Code mode.
 *
 * The trailing-slash form counts too: a hand-typed or copied URL may carry one.
 * Supports /app/ide, /app/ide/, /ide, /ide/.
 */
export const isVSCodeModePath = (pathname?: string): boolean => {
  const path = pathname ?? currentPathname();
  if (path === undefined) return false;
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
  const path = pathname ?? currentPathname();
  if (path === undefined) return false;
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

/**
 * Replaces the current history entry with `path`.
 *
 * For corrections the router itself makes — a dead project id in the URL, a
 * popstate the app resolved internally — where pushing would stack a duplicate
 * entry the user then has to press Back through twice. A no-op when already
 * at `path`.
 */
export const navigateReplace = (path: string): void => {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === path) return;
  window.history.replaceState({}, '', path);
};
