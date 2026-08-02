import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Command, FileText, Settings, Play, Download, Layout, HelpCircle, Sparkles, Terminal } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export interface PaletteAction {
  id: string;
  title: string;
  section: string;
  icon?: React.ReactNode;
  shortcut?: string;
  keywords?: string[];
  perform: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: PaletteAction[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, actions }) => {
  const { isDark } = useTheme();
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

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  // Handle outside click & escape
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => prev + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        // Trigger action via ref or similar mechanism to avoid closure staleness,
        // but for now we will rely on filteredActions in the render scope via a ref if needed.
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]); // We will handle Enter key in the input onKeyDown instead to access the latest filteredActions

  // Fuzzy search logic
  const filteredActions = useMemo(() => {
    let result = actions;
    if (query.trim() === '') {
      // Show recent first if empty
      const recentActions = recentCommandIds
        .map(id => actions.find(a => a.id === id))
        .filter((a): a is PaletteAction => a !== undefined);
        
      const recentSet = new Set(recentActions.map(a => a.id));
      const others = actions.filter(a => !recentSet.has(a.id));
      
      result = [...recentActions, ...others];
    } else {
      const lowerQuery = query.toLowerCase();
      const terms = lowerQuery.split(' ').filter(Boolean);
      
      result = actions.filter(action => {
        const searchableText = `${action.title} ${action.section} ${action.keywords?.join(' ') || ''}`.toLowerCase();
        return terms.every(term => searchableText.includes(term));
      });
    }
    return result;
  }, [query, actions, recentCommandIds]);

  // Ensure selected index is valid
  useEffect(() => {
    if (selectedIndex >= filteredActions.length) {
      setSelectedIndex(Math.max(0, filteredActions.length - 1));
    }
  }, [filteredActions.length, selectedIndex]);

  // Scroll into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedEl = listRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, isOpen]);

  const executeAction = (action: PaletteAction) => {
    const newRecents = [action.id, ...recentCommandIds.filter(id => id !== action.id)].slice(0, 5);
    setRecentCommandIds(newRecents);
    try {
      localStorage.setItem('gbcoder_recent_commands', JSON.stringify(newRecents));
    } catch {}
    
    action.perform();
    onClose();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        executeAction(filteredActions[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  // Group by section
  const groupedActions = filteredActions.reduce((acc, action) => {
    const isRecent = query.trim() === '' && recentCommandIds.includes(action.id);
    const section = isRecent ? 'Recently Used' : action.section;
    if (!acc[section]) acc[section] = [];
    acc[section].push(action);
    return acc;
  }, {} as Record<string, PaletteAction[]>);

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className={`w-full max-w-[600px] shadow-2xl rounded-xl overflow-hidden border ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`flex items-center px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <Command className={`w-5 h-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            ref={inputRef}
            type="text"
            className={`w-full bg-transparent border-none outline-none text-lg ${isDark ? 'text-gray-100 placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
            placeholder="Type a command or search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
        </div>

        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
          {Object.entries(groupedActions).map(([section, sectionActions]) => (
            <div key={section} className="mb-2">
              <div className={`px-4 py-1 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {section}
              </div>
              {sectionActions.map(action => {
                const currentIndex = flatIndex++;
                const isSelected = currentIndex === selectedIndex;
                
                return (
                  <div
                    key={`${section}-${action.id}`}
                    data-selected={isSelected}
                    className={`flex items-center justify-between px-4 py-2.5 mx-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
                        : isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => executeAction(action)}
                    onMouseEnter={() => setSelectedIndex(currentIndex)}
                  >
                    <div className="flex items-center gap-3">
                      {action.icon || <Terminal className="w-4 h-4 opacity-70" />}
                      <span className="font-medium text-sm">{action.title}</span>
                    </div>
                    {action.shortcut && (
                      <div className="flex items-center gap-1">
                        {action.shortcut.split('+').map((key, i) => (
                          <kbd key={i} className={`px-2 py-1 text-[10px] rounded font-sans ${
                            isSelected
                              ? isDark ? 'bg-blue-700/50 text-blue-100' : 'bg-blue-100 text-blue-800'
                              : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                          }`}>
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
          
          {filteredActions.length === 0 && (
            <div className={`px-4 py-8 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No commands found matching "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
