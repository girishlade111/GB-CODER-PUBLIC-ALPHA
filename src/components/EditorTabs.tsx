import React from 'react';
import { X } from 'lucide-react';

interface EditorTabsProps {
  openPaths: string[];
  activePath: string | null;
  dirtyPaths: Set<string>;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
}

/** Shows just the file name; the full path is the tooltip. */
const displayName = (path: string): string => path.split('/').pop() ?? path;

/**
 * VS Code-style tab strip.
 *
 * Tabs with unsaved changes show a dot in place of the close button, swapping to
 * an X on hover. That is the convention users expect and it keeps the tab width
 * stable as the dirty state changes.
 */
const EditorTabs: React.FC<EditorTabsProps> = ({
  openPaths,
  activePath,
  dirtyPaths,
  onSelect,
  onClose,
}) => {
  if (openPaths.length === 0) return null;

  return (
    <div
      role="tablist"
      aria-label="Open files"
      className="flex items-stretch overflow-x-auto border-b border-stroke-subtle bg-surface-raised"
    >
      {openPaths.map((path) => {
        const isActive = path === activePath;
        const isDirty = dirtyPaths.has(path);

        return (
          <div
            key={path}
            className={`group flex shrink-0 items-center border-b-2 border-r border-r-stroke-subtle -mb-[1px] transition-colors ${
              isActive
                ? 'border-b-accent bg-surface-base'
                : 'border-b-transparent hover:bg-white/[0.03]'
            }`}
          >
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(path)}
              title={path}
              className={`py-2 pl-3 pr-1 font-mono text-xs transition-colors ${
                isActive ? 'text-content-primary' : 'text-content-muted hover:text-content-secondary'
              }`}
            >
              <span className="block max-w-[160px] truncate">{displayName(path)}</span>
            </button>

            <button
              type="button"
              onClick={() => onClose(path)}
              className="mr-1.5 flex h-5 w-5 items-center justify-center rounded-sm text-content-muted transition-colors hover:bg-white/10 hover:text-content-primary"
              title={isDirty ? `Close ${path} (unsaved changes)` : `Close ${path}`}
              aria-label={`Close ${path}`}
            >
              {isDirty ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-content-secondary group-hover:hidden"
                  />
                  <X className="hidden h-3 w-3 group-hover:block" />
                </>
              ) : (
                <X className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(EditorTabs);
