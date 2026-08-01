/**
 * Resilient loading of code-split chunks.
 *
 * ## The failure this exists to fix
 *
 * The app is a long-lived single page app whose assets carry content hashes, and
 * it is installed as a PWA whose service worker *precaches* `index.html` and
 * serves navigations from that cache. Both facts together produce a specific,
 * guaranteed breakage:
 *
 *  1. A tab loads `index.html`, which references `importEngine-<hashA>.js`.
 *  2. A new version is deployed. Every chunk gets a new hash and the old files
 *     are removed from the server.
 *  3. The tab is still running the old HTML, so the first time the user does
 *     something that needs a not-yet-fetched chunk, it requests `<hashA>` — which
 *     now 404s. The browser reports:
 *       "Failed to fetch dynamically imported module: .../importEngine-<hashA>.js"
 *
 * Nothing about the feature is broken; the app is simply asking for a file that
 * no longer exists. It cannot be fixed by retrying the same URL, because the URL
 * itself is stale — the only cure is to get fresh HTML.
 *
 * That made every import entry point fail at once, since all of them await the
 * same lazily-loaded engine, and it also broke the Import dialog itself, which is
 * a lazily-loaded component. A user experiences this as "upload and drag-and-drop
 * are broken" with no obvious cause, and it survives a normal refresh because the
 * service worker keeps answering navigations from its cache.
 *
 * ## What this does
 *
 * One retry to absorb a genuine network blip, then, if the failure looks like a
 * stale chunk reference, it clears the service worker and its caches and reloads
 * once. Unregistering is deliberate: it guarantees the next navigation bypasses
 * the cached `index.html` and gets the current asset names. `vite-plugin-pwa`
 * re-registers on that load, so the PWA is not lost.
 *
 * Only the Cache Storage API is cleared. Projects live in `localStorage`, which
 * is untouched, so recovery cannot cost the user their work.
 */

import { ComponentType, lazy } from 'react';

/** Timestamp of the last self-heal, so a real outage cannot become a reload loop. */
const RECOVERY_KEY = 'gbcoder_chunk_recovery_at';

/*
 * Time-based rather than a one-shot flag. A one-shot flag is loop-safe but means
 * a tab that has recovered once can never recover again — and this is an editor
 * people leave open for days, across more than one deploy. A cooldown gives both
 * properties: an immediate repeat failure (a genuine outage, or a chunk that is
 * missing for some other reason) cannot reload again, while a fresh deploy an
 * hour later still heals itself.
 */
const RECOVERY_COOLDOWN_MS = 60_000;

const RETRY_DELAY_MS = 500;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * True when an error is a module/chunk fetch failure rather than an error thrown
 * *by* the module once it ran.
 *
 * The wording differs per engine, so all the known phrasings are matched:
 * Chromium and Safari report "Failed to fetch dynamically imported module" and
 * "Importing a module script failed", Firefox uses "error loading dynamically
 * imported module", and bundler-generated loaders throw `ChunkLoadError`.
 */
export const isChunkLoadError = (error: unknown): boolean => {
  const message =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error ?? '');
  return /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|chunkloaderror|loading chunk \S+ failed|failed to import/i.test(
    message,
  );
};

/** True when enough time has passed since the last self-heal to try another. */
const canRecover = (): boolean => {
  let last = 0;
  try {
    last = Number(sessionStorage.getItem(RECOVERY_KEY)) || 0;
  } catch {
    // Private mode or blocked storage: allow one attempt rather than none.
    return true;
  }
  return Date.now() - last > RECOVERY_COOLDOWN_MS;
};

const markRecoveryAttempted = (): void => {
  try {
    sessionStorage.setItem(RECOVERY_KEY, String(Date.now()));
  } catch {
    /* the guard is best-effort; a reload is still preferable to a dead app */
  }
};

/**
 * Drops the service worker and every Cache Storage entry, then reloads.
 *
 * Best-effort throughout: if any step is unavailable or throws, the reload still
 * happens, because a plain reload is strictly better than staying on a build
 * whose chunks have gone.
 */
const purgeAndReload = async (): Promise<void> => {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  } catch {
    /* ignore */
  }

  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {
    /* ignore */
  }

  window.location.reload();
};

/**
 * Loads a dynamically imported module, recovering from a stale-deploy failure.
 *
 * `label` is only used in the message shown if recovery has already been tried,
 * so it should read as a thing the user was doing: "The import engine".
 */
export const loadChunk = async <T>(load: () => Promise<T>, label = 'A part of the app'): Promise<T> => {
  try {
    return await load();
  } catch (firstError) {
    // An error from inside the module must not be mistaken for a load failure.
    if (!isChunkLoadError(firstError)) throw firstError;

    await delay(RETRY_DELAY_MS);

    try {
      return await load();
    } catch (secondError) {
      if (!isChunkLoadError(secondError)) throw secondError;

      if (canRecover()) {
        markRecoveryAttempted();
        // Reload is in flight; this promise never usefully settles.
        void purgeAndReload();
        throw new Error(`${label} is being updated. Reloading…`);
      }

      throw new Error(
        `${label} could not be loaded. A new version was deployed and this tab is ` +
          'still on the old one. Please refresh the page — if that does not help, ' +
          'clear the site cache and try again.',
      );
    }
  }
};

/**
 * `React.lazy` with the same recovery behaviour.
 *
 * Every lazily-loaded screen and dialog is exposed to the stale-chunk problem, so
 * they all go through here rather than `lazy()` directly.
 */
/*
 * Mirrors React's own `lazy` signature. `any` is deliberate and matches the
 * upstream type: the props are whatever the loaded component declares, and
 * narrowing it here would reject every component that takes props.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = ComponentType<any>;

export const lazyWithRecovery = <T extends AnyComponent>(
  factory: () => Promise<{ default: T }>,
  label?: string,
) => lazy(() => loadChunk(factory, label));
