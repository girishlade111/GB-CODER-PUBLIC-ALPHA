import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Codicon from './ui/Codicon';

export interface PaletteAction {
  id: string;
  title: string;
  section: string;
  icon?: React.ReactNode;
  shortcut?: string;
  keywords?: string[];
  disabled?: boolean;
  perform: () => void;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: PaletteAction[];
  files?: Array<{ path: string }>;
  onSelectFile?: (path: string) => void;
  initialMode?: 'commands' | 'files';
  recentFiles?: string[];
  quickInputPosition?: 'top' | 'center';
}

interface PaletteDisplayItem {
  id: string;
  title: string;
  subtitle?: string;
  section: string;
  icon: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  onSelect: () => void;
}

/**
 * Authentic VS Code Web Quick Open & Command Palette.
 * Matches vscode.dev pixel-for-pixel:
 * - Top-anchored pill container with subtle Dark Modern border (#3c3c3c)
 * - Input placeholder: "Search files by name (append : to go to line or @ to go to symbol), or paste a link"
 * - VS Code quickInputList focus background (#04395e) with pure white text and 2px border radius
 * - Quick action launcher when query is empty: Go to File, Show and Run Commands, Search for Text %, etc.
 * - Portalled directly to document.body at z-[99999] to prevent modal stacking bugs across all panes.
 */
const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  actions,
  files = [],
  onSelectFile,
  initialMode = 'commands',
  recentFiles: propRecentFiles,
}) => {
  const [query, setQuery] = useState(initialMode === 'files' ? '' : '>');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Synchronously reset state during render when opened or mode changed
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialMode, setPrevInitialMode] = useState(initialMode);

  if (isOpen !== prevIsOpen || initialMode !== prevInitialMode) {
    setPrevIsOpen(isOpen);
    setPrevInitialMode(initialMode);
    if (isOpen) {
      setQuery(initialMode === 'files' ? '' : '>');
      setSelectedIndex(0);
    }
  }

  const [recentCommandIds, setRecentCommandIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('gbcoder_recent_commands');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [recentFilePaths, setRecentFilePaths] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('gbcoder_recent_files');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Focus input and set selection range
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        if (initialMode === 'commands') {
          inputRef.current?.setSelectionRange(1, 1);
        }
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialMode]);

  // Determine current search mode: command mode starts with '>'
  const isCommandMode = query.startsWith('>');
  const cleanQuery = isCommandMode ? query.slice(1).trim() : query.trim();

  // Handle outside click & global shortcuts when palette is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => prev + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  // Combined items list calculation
  const displayItems = useMemo<PaletteDisplayItem[]>(() => {
    if (isCommandMode) {
      // 1. Command Mode (">")
      const availableActions = actions.filter((a) => !a.disabled);

      if (!cleanQuery) {
        // Show recently used commands first, then others
        const recentActions = recentCommandIds
          .map((id) => availableActions.find((a) => a.id === id))
          .filter((a): a is PaletteAction => a !== undefined);

        const recentSet = new Set(recentActions.map((a) => a.id));
        const others = availableActions.filter((a) => !recentSet.has(a.id));

        const makeActionItem = (a: PaletteAction, section: string): PaletteDisplayItem => ({
          id: a.id,
          title: a.title,
          section,
          icon: a.icon || <Codicon name="terminal" className="text-[14px] text-[#cccccc]" />,
          shortcut: a.shortcut,
          disabled: a.disabled,
          onSelect: () => {
            const next = [a.id, ...recentCommandIds.filter((id) => id !== a.id)].slice(0, 8);
            setRecentCommandIds(next);
            try {
              localStorage.setItem('gbcoder_recent_commands', JSON.stringify(next));
            } catch {
              // Ignore
            }
            a.perform();
            onClose();
          },
        });

        return [
          ...recentActions.map((a) => makeActionItem(a, 'recently used')),
          ...others.map((a) => makeActionItem(a, a.section || 'commands')),
        ];
      }

      // Fuzzy search commands
      const lower = cleanQuery.toLowerCase();
      const terms = lower.split(' ').filter(Boolean);

      const matched = availableActions.filter((action) => {
        const searchable = `${action.title} ${action.section} ${action.keywords?.join(' ') || ''}`.toLowerCase();
        return terms.every((t) => searchable.includes(t));
      });

      return matched.map((a) => ({
        id: a.id,
        title: a.title,
        section: a.section || 'commands',
        icon: a.icon || <Codicon name="terminal" className="text-[14px] text-[#cccccc]" />,
        shortcut: a.shortcut,
        disabled: a.disabled,
        onSelect: () => {
          const next = [a.id, ...recentCommandIds.filter((id) => id !== a.id)].slice(0, 8);
          setRecentCommandIds(next);
          try {
            localStorage.setItem('gbcoder_recent_commands', JSON.stringify(next));
          } catch {
            // Ignore
          }
          a.perform();
          onClose();
        },
      }));
    } else {
      // 2. File Picker / Quick Open Mode
      const allFiles = files;
      const combinedRecent = propRecentFiles ?? recentFilePaths;

      if (!cleanQuery) {
        // VS Code Authentic Quick Open Menu Options matching Image 2
        const defaultQuickActions: PaletteDisplayItem[] = [
          {
            id: 'quickopen.gotoFile',
            title: 'Go to File',
            section: 'general',
            icon: <Codicon name="go-to-file" className="text-[14px] text-[#0078d4]" />,
            shortcut: 'Ctrl + P',
            onSelect: () => {
              setQuery('');
            },
          },
          {
            id: 'quickopen.showCommands',
            title: 'Show and Run Commands >',
            section: 'general',
            icon: <Codicon name="terminal" className="text-[14px] text-[#cca700]" />,
            shortcut: 'Ctrl + Shift + P',
            onSelect: () => {
              setQuery('>');
            },
          },
          {
            id: 'quickopen.searchText',
            title: 'Search for Text %',
            section: 'general',
            icon: <Codicon name="search" className="text-[14px] text-[#3794ff]" />,
            onSelect: () => {
              window.dispatchEvent(new CustomEvent('workbench:search'));
              onClose();
            },
          },
          {
            id: 'quickopen.gotoSymbol',
            title: 'Go to Symbol in Editor @',
            section: 'general',
            icon: <Codicon name="symbol-method" className="text-[14px] text-[#b180d7]" />,
            shortcut: 'Ctrl + Shift + O',
            onSelect: () => {
              setQuery('@');
            },
          },
          {
            id: 'quickopen.startDebugging',
            title: 'Start Debugging debug',
            section: 'general',
            icon: <Codicon name="debug-alt" className="text-[14px] text-[#89d185]" />,
            onSelect: () => {
              setQuery('debug ');
            },
          },
          {
            id: 'quickopen.runTask',
            title: 'Run Task task',
            section: 'general',
            icon: <Codicon name="tasklist" className="text-[14px] text-[#4ec9b0]" />,
            onSelect: () => {
              setQuery('task ');
            },
          },
          {
            id: 'quickopen.more',
            title: 'More ?',
            section: 'general',
            icon: <Codicon name="question" className="text-[14px] text-[#cccccc]" />,
            onSelect: () => {
              setQuery('?');
            },
          },
        ];

        // Format recent files
        const recentFileItems = combinedRecent
          .map((p) => allFiles.find((f) => f.path === p) || { path: p })
          .slice(0, 10);

        const makeFileItem = (f: { path: string }, section: string): PaletteDisplayItem => {
          const parts = f.path.split('/');
          const fileName = parts.pop() || f.path;
          const dirPath = parts.join('/');

          return {
            id: `file-${f.path}`,
            title: fileName,
            subtitle: dirPath ? `\\${dirPath}` : '',
            section,
            icon: <Codicon name="file" className="text-[14px] text-[#75beff]" />,
            onSelect: () => {
              const next = [f.path, ...combinedRecent.filter((p) => p !== f.path)].slice(0, 15);
              setRecentFilePaths(next);
              try {
                localStorage.setItem('gbcoder_recent_files', JSON.stringify(next));
              } catch {
                // Ignore
              }
              onSelectFile?.(f.path);
              onClose();
            },
          };
        };

        const fileItems = recentFileItems.map((f) => makeFileItem(f, 'recently opened'));

        return [...defaultQuickActions, ...fileItems];
      }

      // Fuzzy search files
      const lower = cleanQuery.toLowerCase();
      const terms = lower.split(' ').filter(Boolean);

      const matched = allFiles.filter((f) => {
        const p = f.path.toLowerCase();
        return terms.every((t) => p.includes(t));
      });

      return matched.map((f) => {
        const parts = f.path.split('/');
        const fileName = parts.pop() || f.path;
        const dirPath = parts.join('/');

        return {
          id: `file-${f.path}`,
          title: fileName,
          subtitle: dirPath ? `\\${dirPath}` : '',
          section: 'files',
          icon: <Codicon name="file-code" className="text-[14px] text-[#75beff]" />,
          onSelect: () => {
            const next = [f.path, ...combinedRecent.filter((p) => p !== f.path)].slice(0, 15);
            setRecentFilePaths(next);
            try {
              localStorage.setItem('gbcoder_recent_files', JSON.stringify(next));
            } catch {
              // Ignore
            }
            onSelectFile?.(f.path);
            onClose();
          },
        };
      });
    }
  }, [
    isCommandMode,
    cleanQuery,
    actions,
    files,
    recentCommandIds,
    recentFilePaths,
    propRecentFiles,
    onSelectFile,
    onClose,
  ]);

  // Clamp selected index
  useEffect(() => {
    if (selectedIndex >= displayItems.length) {
      setSelectedIndex(Math.max(0, displayItems.length - 1));
    }
  }, [displayItems.length, selectedIndex]);

  // Scroll into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedEl = listRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, isOpen]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const item = displayItems[selectedIndex];
      if (item && !item.disabled) {
        item.onSelect();
      }
    }
  };

  if (!isOpen) return null;

  // Group items by section
  const grouped = displayItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, PaletteDisplayItem[]>);

  let flatIndex = 0;

  const content = (
    <div
      className="fixed inset-0 z-[99999] flex justify-center items-start pt-2 sm:pt-4 bg-black/40 select-none animate-in fade-in duration-75"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Quick Open and Command Palette"
      data-testid="command-palette-modal"
    >
      <div
        className="w-[600px] max-w-[95vw] shadow-2xl rounded-[6px] overflow-hidden border border-[#3c3c3c] bg-[#1f1f1f] text-[#cccccc] font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Header */}
        <div className="p-2 border-b border-[#2b2b2b] bg-[#1f1f1f]">
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-[#313131] border border-[#3c3c3c] focus:border-[#0078d4] rounded-[3px] px-2.5 py-1 text-[13px] text-white placeholder-[#858585] outline-none font-sans"
            placeholder={
              isCommandMode
                ? 'Type a command or search...'
                : 'Search files by name (append : to go to line or @ to go to symbol), or paste a link'
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            aria-label="Command search input"
          />
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-[55vh] overflow-y-auto py-1 font-sans">
          {Object.entries(grouped).map(([section, items]) => (
            <div key={section} className="mb-1">
              {section !== 'general' && (
                <div className="flex items-center justify-between px-3 py-1 text-[11px] text-[#858585]">
                  <span className="font-medium">{section}</span>
                </div>
              )}
              {items.map((item) => {
                const currentIndex = flatIndex++;
                const isSelected = currentIndex === selectedIndex;

                return (
                  <div
                    key={item.id}
                    data-selected={isSelected}
                    role="option"
                    aria-selected={isSelected}
                    className={`flex items-center justify-between px-2.5 py-1.5 mx-1 rounded-[2px] cursor-pointer text-[12px] transition-colors ${
                      isSelected
                        ? 'bg-[#04395e] text-white font-normal'
                        : 'text-[#cccccc] hover:bg-[#2a2d2e]'
                    }`}
                    onClick={() => {
                      if (!item.disabled) item.onSelect();
                    }}
                    onMouseEnter={() => setSelectedIndex(currentIndex)}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      <span className="shrink-0 flex items-center justify-center">
                        {item.icon}
                      </span>
                      <span className="truncate text-white font-normal">{item.title}</span>
                      {item.subtitle && (
                        <span className="truncate text-[11px] text-[#858585] ml-1">
                          {item.subtitle}
                        </span>
                      )}
                    </div>

                    {item.shortcut && (
                      <span
                        className={`text-[11px] shrink-0 ml-3 font-mono ${
                          isSelected ? 'text-white' : 'text-[#858585]'
                        }`}
                      >
                        {item.shortcut}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {displayItems.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-[#858585] font-sans">
              No matching {isCommandMode ? 'commands' : 'files'} found for "{cleanQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};

export default CommandPalette;
