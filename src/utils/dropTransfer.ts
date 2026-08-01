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
  /** True when at least one dropped item is a directory. */
  hasDirectory: boolean;
}

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
  let hasDirectory = false;

  if (!transfer) return { entries, files, hasDirectory };

  if (transfer.items && transfer.items.length > 0) {
    for (const item of Array.from(transfer.items)) {
      if (item.kind !== 'file') continue;
      const entry = item.webkitGetAsEntry?.() as { isDirectory?: boolean } | null | undefined;

      /*
       * A directory can only be read through its entry, so that is the one case
       * that must go down the traversal path.
       */
      if (entry?.isDirectory) {
        hasDirectory = true;
        entries.push(entry);
        continue;
      }

      /*
       * Everything else is a plain file, and `getAsFile()` gives it to us
       * directly — no async entry walk needed.
       *
       * Crucially it is added to `files` *only*. It used to be pushed to both
       * lists, and because the plan builder concatenates them, every dropped
       * file was counted twice: three files reported as six, and a lone .zip
       * became two items, which skipped the single-archive branch entirely and
       * broke zip drops outright. A synthetic DataTransfer returns null from
       * `webkitGetAsEntry`, so this only ever misbehaved on a real drag — which
       * is exactly why it survived earlier testing.
       */
      const file = item.getAsFile();
      if (file) {
        files.push(file);
        continue;
      }

      // `getAsFile()` can still fail; keep the entry so the file is not lost.
      if (entry) entries.push(entry);
    }
    return { entries, files, hasDirectory };
  }

  if (transfer.files) files.push(...Array.from(transfer.files));
  return { entries, files, hasDirectory };
};

/** True when a drop is a whole-project import rather than one file for a panel. */
export const looksLikeProjectImport = (collected: CollectedTransfer): boolean =>
  collected.hasDirectory || collected.files.length > 1 || collected.entries.length > 1;
