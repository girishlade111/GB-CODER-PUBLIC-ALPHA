/**
 * Shared reading of a drag's `DataTransfer`.
 *
 * Every drop target in the app classifies a drag through these two functions so
 * they cannot disagree about what was dropped. Previously the window handler,
 * the import dialog and each editor panel each had their own copy of this logic
 * with different rules, which is how a dropped folder could be silently treated
 * as "replace this panel's text with file #1".
 *
 * Kept dependency-free and tiny on purpose: this sits in the initial bundle so a
 * drag can be recognised before the importer chunk has been fetched.
 */

export interface CollectedTransfer {
  /**
   * `FileSystemEntry` objects, which are the only way a dropped *directory* can
   * be represented. Typed as `unknown` because the traversal code that consumes
   * them lives in the lazily-loaded importer.
   */
  entries: unknown[];
  files: File[];
  /**
   * Pending `FileSystemHandle`s from `getAsFileSystemHandle()`, used when the
   * legacy `webkitGetAsEntry()` returns null. Promises, because the call must be
   * made before the drop handler returns but can only be awaited afterwards.
   */
  handles: Promise<unknown>[];
  /** True when at least one dropped item is a directory. */
  hasDirectory: boolean;
  /**
   * Names of dropped folders whose contents may not be obtainable. Consulted
   * only when extraction produced no files, so the UI can say *why* nothing was
   * imported instead of claiming the folder was empty.
   */
  unreadableDirectories: string[];
}

/**
 * True when a `File` from `dataTransfer.files` is really a directory.
 *
 * A dropped folder is exposed as a zero-byte entry with no MIME type and no
 * extension. It cannot be read, so feeding it to the importer produces a plan
 * with nothing in it — which surfaced as "nothing importable" for what the user
 * correctly believed was a valid project.
 */
const looksLikeDirectory = (file: File): boolean =>
  file.size === 0 && file.type === '' && !/\.[a-z0-9]+$/i.test(file.name);

/**
 * True when a drag carries files rather than selected text or a link.
 *
 * Deliberately generous. A drag that really does carry files must never be
 * missed, because the consequence is that `preventDefault()` is skipped, the
 * page never becomes a valid drop target, and the browser fires no `drop` event
 * at all — the drag just appears to do nothing. Text-only and link-only drags
 * match none of these branches, so they still pass through to Monaco.
 */
export const carriesFiles = (transfer: DataTransfer | null | undefined): boolean => {
  if (!transfer) return false;

  const types = Array.from(transfer.types ?? []);
  if (types.includes('Files')) return true;
  // Firefox exposes this instead of the standard 'Files' entry.
  if (types.includes('application/x-moz-file')) return true;

  // `types` is hidden by some browsers during dragover for privacy reasons;
  // `items` still reports the kind, which is enough to decide.
  if (transfer.items && Array.from(transfer.items).some((item) => item.kind === 'file')) {
    return true;
  }

  // Last resort for older WebKit, which populated neither of the above.
  if (types.length === 0 && transfer.files && transfer.files.length > 0) return true;

  return false;
};

/**
 * Collects everything a drop carries.
 *
 * Must run synchronously inside the drop handler: `DataTransferItem` objects are
 * neutered the moment the handler returns, so `webkitGetAsEntry()` has to be
 * called before any `await`. The `FileSystemEntry` objects it returns *do*
 * survive, which is why they can be handed to the async importer afterwards.
 */
export const collectTransfer = (transfer: DataTransfer | null | undefined): CollectedTransfer => {
  const entries: unknown[] = [];
  const files: File[] = [];
  const handles: Promise<unknown>[] = [];
  const unreadableDirectories: string[] = [];
  let hasDirectory = false;

  if (!transfer) return { entries, files, handles, hasDirectory, unreadableDirectories };

  if (transfer.items && transfer.items.length > 0) {
    for (const item of Array.from(transfer.items)) {
      if (item.kind !== 'file') continue;

      const entry = item.webkitGetAsEntry?.() as
        | { isDirectory?: boolean; isFile?: boolean }
        | null
        | undefined;

      /*
       * A directory can only be read by walking it, so that is the one case that
       * must go down the traversal path.
       */
      if (entry?.isDirectory) {
        hasDirectory = true;
        entries.push(entry);
        continue;
      }

      /*
       * Both of these have to be invoked now, before the handler returns: the
       * `DataTransferItem` is neutered immediately afterwards. The handle is only
       * requested when the legacy API gave us nothing, to avoid the cost on the
       * common path.
       */
      const handle = entry
        ? null
        : (
            item as DataTransferItem & {
              getAsFileSystemHandle?: () => Promise<unknown>;
            }
          ).getAsFileSystemHandle?.();
      const file = item.getAsFile();

      /*
       * A known file. `getAsFile()` is the simpler and cheaper route than an
       * async entry walk, so single- and multi-file drops take it.
       *
       * Note it is added to `files` *only*. It used to be pushed to both lists,
       * and because the plan builder concatenates them, every dropped file was
       * counted twice: three files reported as six, and a lone .zip became two
       * items, which skipped the single-archive branch and broke zip drops.
       */
      if (entry?.isFile) {
        if (file) files.push(file);
        continue;
      }

      /*
       * `webkitGetAsEntry()` returned null. This is the case that broke folder
       * drops: the folder still appears in `dataTransfer.files` as a zero-byte
       * pseudo-File, so it used to be accepted as a normal file, contribute
       * nothing readable, and end the import as "nothing importable".
       *
       * `getAsFileSystemHandle()` is the modern replacement and reports the kind
       * reliably, so prefer it whenever the legacy call fails.
       */
      if (handle) {
        handles.push(handle);
        if (file && looksLikeDirectory(file)) {
          hasDirectory = true;
          /*
           * Recorded even though a handle was obtained. The handle may still
           * resolve to something unusable, and this list is only consulted when
           * extraction ends up with zero files — at which point the user needs to
           * be told the folder could not be read rather than left with silence.
           */
          unreadableDirectories.push(file.name);
        }
        continue;
      }

      if (file && !looksLikeDirectory(file)) {
        files.push(file);
        continue;
      }

      // A folder that neither API can read. Record it so the error can say so.
      if (file) {
        hasDirectory = true;
        unreadableDirectories.push(file.name);
      }
    }
    return { entries, files, handles, hasDirectory, unreadableDirectories };
  }

  if (transfer.files) {
    for (const file of Array.from(transfer.files)) {
      if (looksLikeDirectory(file)) {
        hasDirectory = true;
        unreadableDirectories.push(file.name);
        continue;
      }
      files.push(file);
    }
  }
  return { entries, files, handles, hasDirectory, unreadableDirectories };
};

/** True when a drop is a whole-project import rather than one file for a panel. */
export const looksLikeProjectImport = (collected: CollectedTransfer): boolean =>
  collected.hasDirectory || collected.files.length > 1 || collected.entries.length > 1;
