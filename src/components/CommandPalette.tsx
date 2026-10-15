import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Command, Terminal, FileCode } from 'lucide-react';

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
}

interface PaletteDisplayItem {
  id: string;
  title: string;
  section: string;
  icon: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  onSelect: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  actions,
  files = [],
  onSelectFile,
  initialMode = 'commands',
  recentFiles: propRecentFiles,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      if (initialMode === 'files') {
        setQuery('');
      } else {
        setQuery('>');
      }
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        if (initialMode === 'commands') {
          inputRef.current?.setSelectionRange(1, 1);
        }
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialMode]);

  // Determine current search mode: command mode starts with '>'
  const isCommandMode = query.startsWith('>') || files.length === 0;
  const cleanQuery = query.startsWith('>') ? query.slice(1).trim() : query.trim();

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
      // 1. Command Mode
      const availableActions = actions.filter((a) => !a.disabled);

      if (!cleanQuery) {
        // Show recently used commands first
        const recentActions = recentCommandIds
          .map((id) => availableActions.find((a) => a.id === id))
          .filter((a): a is PaletteAction => a !== undefined);

        const recentSet = new Set(recentActions.map((a) => a.id));
        const others = availableActions.filter((a) => !recentSet.has(a.id));

        return [
          ...recentActions.map((a) => ({
            id: a.id,
            title: a.title,
            section: 'Recently Used',
            icon: a.icon || <Terminal className="w-4 h-4 text-cyan-400" />,
            shortcut: a.shortcut,
            disabled: a.disabled,
            onSelect: () => {
              const next = [a.id, ...recentCommandIds.filter((id) => id !== a.id)].slice(0, 5);
              setRecentCommandIds(next);
              try {
                localStorage.setItem('gbcoder_recent_commands', JSON.stringify(next));
              } catch {
                // Ignore
              }
              a.perform();
              onClose();
            },
          })),
          ...others.map((a) => ({
            id: a.id,
            title: a.title,
            section: a.section || 'Commands',
            icon: a.icon || <Terminal className="w-4 h-4 opacity-70" />,
            shortcut: a.shortcut,
            disabled: a.disabled,
            onSelect: () => {
              const next = [a.id, ...recentCommandIds.filter((id) => id !== a.id)].slice(0, 5);
              setRecentCommandIds(next);
              try {
                localStorage.setItem('gbcoder_recent_commands', JSON.stringify(next));
              } catch {
                // Ignore
              }
              a.perform();
              onClose();
            },
          })),
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
        section: a.section || 'Commands',
        icon: a.icon || <Terminal className="w-4 h-4 opacity-70" />,
        shortcut: a.shortcut,
        disabled: a.disabled,
        onSelect: () => {
          const next = [a.id, ...recentCommandIds.filter((id) => id !== a.id)].slice(0, 5);
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
      // 2. File Picker Mode (Quick Open)
      const allFiles = files;
      const combinedRecent = propRecentFiles ?? recentFilePaths;

      if (!cleanQuery) {
        // Show recent files first, then rest
        const recentFileItems = combinedRecent
          .map((p) => allFiles.find((f) => f.path === p))
          .filter((f): f is { path: string } => f !== undefined);

        const recentSet = new Set(recentFileItems.map((f) => f.path));
        const otherFiles = allFiles.filter((f) => !recentSet.has(f.path));

        const makeFileItem = (f: { path: string }, section: string): PaletteDisplayItem => ({
          id: `file-${f.path}`,
          title: f.path,
          section,
          icon: <FileCode className="w-4 h-4 text-indigo-400" />,
          onSelect: () => {
            const next = [f.path, ...combinedRecent.filter((p) => p !== f.path)].slice(0, 10);
            setRecentFilePaths(next);
            try {
              localStorage.setItem('gbcoder_recent_files', JSON.stringify(next));
            } catch {
              // Ignore
            }
            onSelectFile?.(f.path);
            onClose();
          },
        });

        return [
          ...recentFileItems.map((f) => makeFileItem(f, 'Recently Opened')),
          ...otherFiles.map((f) => makeFileItem(f, 'Files')),
        ];
      }

      // Fuzzy search files
      const lower = cleanQuery.toLowerCase();
      const terms = lower.split(' ').filter(Boolean);

      const matched = allFiles.filter((f) => {
        const p = f.path.toLowerCase();
        return terms.every((t) => p.includes(t));
      });

      return matched.map((f) => ({
        id: `file-${f.path}`,
        title: f.path,
        section: 'Files',
        icon: <FileCode className="w-4 h-4 text-indigo-400" />,
        onSelect: () => {
          const next = [f.path, ...combinedRecent.filter((p) => p !== f.path)].slice(0, 10);
          setRecentFilePaths(next);
          try {
            localStorage.setItem('gbcoder_recent_files', JSON.stringify(next));
          } catch {
            // Ignore
          }
          onSelectFile?.(f.path);
          onClose();
        },
      }));
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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      data-testid="command-palette-modal"
    >
      <div
        className="w-full max-w-[620px] shadow-2xl rounded-xl overflow-hidden border border-[#262940] bg-[#141624] text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Header */}
        <div className="flex items-center px-4 py-3 border-b border-[#222538] bg-[#11131c]">
          {isCommandMode ? (
            <Command className="w-5 h-5 mr-3 text-cyan-400 shrink-0" />
          ) : (
            <FileCode className="w-5 h-5 mr-3 text-indigo-400 shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 font-sans"
            placeholder={
              isCommandMode
                ? 'Type a command or search...'
                : 'Type file name to open... (type > for commands)'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            aria-label="Command search input"
          />
          <kbd className="hidden sm:inline-block rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2 font-sans">
          {Object.entries(grouped).map(([section, items]) => (
            <div key={section} className="mb-2">
              <div className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {section}
              </div>
              {items.map((item) => {
                const currentIndex = flatIndex++;
                const isSelected = currentIndex === selectedIndex;

                return (
                  <div
                    key={item.id}
                    data-selected={isSelected}
                    role="option"
                    aria-selected={isSelected}
                    className={`flex items-center justify-between px-3.5 py-2 mx-2 rounded-lg cursor-pointer transition-colors text-xs ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                    onClick={() => {
                      if (!item.disabled) item.onSelect();
                    }}
                    onMouseEnter={() => setSelectedIndex(currentIndex)}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {item.icon}
                      <span className="truncate">{item.title}</span>
                    </div>

                    {item.shortcut && (
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {item.shortcut.split('+').map((key, i) => (
                          <kbd
                            key={i}
                            className={`px-1.5 py-0.5 text-[9px] rounded font-mono ${
                              isSelected
                                ? 'bg-indigo-800 text-indigo-100'
                                : 'bg-white/10 text-slate-400'
                            }`}
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {displayItems.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-slate-500 font-sans">
              No matching {isCommandMode ? 'commands' : 'files'} found for "{cleanQuery}"
            </div>
          )}
        </div>

        {/* Footer Hints */}
        <div className="px-4 py-1.5 bg-[#10121a] border-t border-[#1e2235] text-[10px] text-slate-500 flex items-center justify-between">
          <span>{isCommandMode ? 'Commands' : 'Files (type > for commands)'}</span>
          <span className="flex items-center gap-2 font-mono">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
