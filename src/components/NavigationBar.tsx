import React, { useState, useRef, useCallback } from 'react';
import {
  Menu,
  Save,
  Play,
  Upload,
  Download,
  FileText,
  Sun,
  Moon,
  Settings,
  Trash2,
  Wand2,
  FilePlus,
} from 'lucide-react';
import { PROJECT_TYPE_LABEL, ProjectType } from '../types/files';
import { useTheme } from '../hooks/useTheme';
import { useSettings } from '../hooks/useSettings';
import Tooltip from './ui/Tooltip';

interface NavigationBarProps {
  onAutoSaveToggle: () => void;
  onRun: () => void;
  onOpenBuildFromPrompt: () => void;
  onImport: (files: FileList) => void;
  onExport: () => void;
  onExternalLibraryManagerToggle: () => void;
  onSettingsToggle: () => void;
  onClear?: () => void;
  /** Starts a new project of the given type. Plain is the default mode. */
  onNewProject?: (projectType: ProjectType) => void;
  currentProjectType?: ProjectType;
  autoSaveEnabled: boolean;
  customActions?: React.ReactNode;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  onAutoSaveToggle,
  onRun,
  onOpenBuildFromPrompt,
  onImport,
  onExport,
  onSettingsToggle,
  onClear,
  onNewProject,
  currentProjectType = 'plain',
  autoSaveEnabled,
  customActions,
}) => {
  const { isDark } = useTheme();
  const { updateSettings } = useSettings();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImport(e.target.files);
      // Reset so same folder can be re-imported
      e.target.value = '';
    }
  }, [onImport]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key for menu close
  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isDropdownOpen]);

  return (
    <>
      {/* Main Navigation Bar — no drag events */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b transition-all duration-200 ${isDark
          ? 'bg-surface-base/95 border-stroke-subtle'
          : 'bg-white/95 border-gray-200'
          }`}
      >
        <div className="w-full mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left side - Logo */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4">
                <img
                  src="/tghjkl.jpeg"
                  alt="GB Coder Logo"
                  className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg sm:rounded-xl object-contain"
                />
                <h1 className={`text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold truncate ${isDark ? 'text-bright-white' : 'text-gray-900'
                  }`}>
                  <span className="block sm:inline">GB Coder</span>
                </h1>
              </div>
            </div>

            {/* Right side - Settings, Menu */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 min-w-0 flex-shrink-0">
              <Tooltip label="Run">
                <button
                  onClick={onRun}
                  className={`p-2 sm:px-3 sm:py-2 rounded-md transition-colors flex items-center gap-2 ${
                    isDark
                      ? 'text-content-secondary hover:bg-white/5 hover:text-content-primary'
                      : 'text-gray-700 hover:bg-black/5'
                  }`}
                  title="Run"
                  aria-label="Run"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden lg:inline text-sm font-medium">Run</span>
                </button>
              </Tooltip>

              <Tooltip label="Build with AI">
                <button
                  onClick={onOpenBuildFromPrompt}
                  className="p-2 sm:px-3 sm:py-2 rounded-md transition-colors flex items-center gap-2 bg-accent text-accent-fg hover:bg-accent-hover active:brightness-95"
                  title="Build with AI"
                  aria-label="Build with AI"
                >
                  <Wand2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden lg:inline text-sm font-semibold">Build with AI</span>
                </button>
              </Tooltip>

              {/* Custom Actions */}
              {customActions}

              {/* Settings Button */}
              <Tooltip label="Settings">
                <button
                  onClick={onSettingsToggle}
                  className={`p-2 rounded-md transition-colors ${isDark
                    ? 'text-content-secondary hover:bg-white/5 hover:text-content-primary'
                    : 'text-gray-600 hover:bg-black/5'
                    }`}
                  title="Settings"
                  aria-label="Settings"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </Tooltip>

              {/* Hamburger Menu */}
              <div className="relative" ref={dropdownRef}>
                <Tooltip label="Menu">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`p-2 rounded-md transition-colors ${isDropdownOpen
                      ? (isDark ? 'bg-white/10 text-content-primary' : 'bg-gray-100 text-black')
                      : (isDark
                        ? 'text-content-secondary hover:bg-white/5 hover:text-content-primary'
                        : 'text-gray-600 hover:bg-black/5')
                      }`}
                    title="Menu"
                    aria-label="Toggle navigation menu"
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                  >
                    <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </Tooltip>

                {/* Dropdown Content */}
                {isDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-lg shadow-elevated border z-50 animate-slide-down overflow-hidden ${isDark
                    ? 'bg-surface-raised border-stroke-subtle'
                    : 'bg-white border-gray-200'
                    }`}>
                    {/* Menu Content */}
                    <div className="py-2 max-h-[calc(100vh-100px)] overflow-y-auto">
                      {/* New Project — project type selection */}
                      {onNewProject && (
                        <>
                          <div className="px-4 py-3">
                            <h4 className={`text-xs font-semibold uppercase tracking-wide mb-3 border-l-2 border-accent/60 pl-2 ${isDark ? 'text-content-muted' : 'text-gray-500'
                              }`}>
                              New Project
                            </h4>
                            <div className="space-y-1">
                              {(['plain', 'react', 'vue'] as ProjectType[]).map((type) => {
                                const isCurrent = type === currentProjectType;
                                return (
                                  <button
                                    key={type}
                                    onClick={() => {
                                      if (!isCurrent) onNewProject(type);
                                      setIsDropdownOpen(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-3 transition-colors rounded-md ${isCurrent
                                      ? (isDark ? 'bg-white/[0.07] text-content-primary' : 'bg-gray-100 text-gray-900')
                                      : (isDark
                                        ? 'text-content-secondary hover:bg-white/5 hover:text-content-primary'
                                        : 'text-gray-700 hover:bg-gray-50')
                                      }`}
                                  >
                                    <FilePlus className="w-4 h-4" />
                                    {PROJECT_TYPE_LABEL[type]}
                                    {isCurrent && (
                                      <span className="ml-auto rounded-sm bg-accent-subtle px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent-hover">
                                        Current
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                            <p className={`mt-2 text-[11px] ${isDark ? 'text-content-muted' : 'text-gray-500'}`}>
                              React and Vue projects are compiled in your browser. Switching replaces the editor contents.
                            </p>
                          </div>

                          <div className={`border-t my-1 ${isDark ? 'border-stroke-subtle' : 'border-gray-200'}`} />
                        </>
                      )}

                      {/* Code Operations */}
                      <div className="px-4 py-3">
                        <h4 className={`text-xs font-semibold uppercase tracking-wide mb-3 border-l-2 border-accent/60 pl-2 ${isDark ? 'text-content-muted' : 'text-gray-500'
                          }`}>
                          Code Operations
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              onRun();
                              setIsDropdownOpen(false);
                            }}
                            className={`px-3 py-2 text-sm flex items-center gap-2 transition-colors rounded-md ${isDark
                              ? 'text-content-secondary hover:bg-white/5 hover:text-content-primary'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            <Play className="w-4 h-4" />
                            Run
                          </button>

                          <button
                            onClick={() => {
                              onAutoSaveToggle();
                              setIsDropdownOpen(false);
                            }}
                            className={`px-3 py-2 text-sm flex items-center gap-2 transition-colors rounded-md ${autoSaveEnabled
                              ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
                              : isDark
                                ? 'text-content-secondary hover:bg-white/5 hover:text-content-primary'
                                : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            <Save className="w-4 h-4" />
                            Save
                            <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${autoSaveEnabled
                              ? (isDark ? 'bg-black text-white' : 'bg-white text-black')
                              : isDark
                                ? 'bg-gray-600 text-gray-300'
                                : 'bg-gray-200 text-gray-600'
                              }`}>
                              {autoSaveEnabled ? 'ON' : 'OFF'}
                            </span>
                          </button>
                        </div>
                        {onClear && (
                          <button
                            onClick={() => {
                              onClear();
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full mt-2 px-3 py-2 text-sm flex items-center gap-2 transition-colors rounded-md ${isDark
                              ? 'text-red-400 hover:bg-red-900/20'
                              : 'text-red-600 hover:bg-red-50'
                              }`}
                          >
                            <Trash2 className="w-4 h-4" />
                            Clear All Code
                          </button>
                        )}
                      </div>

                      <div className={`border-t my-1 ${isDark ? 'border-stroke-subtle' : 'border-gray-200'}`} />

                      {/* File Management */}
                      <div className="px-4 py-3">
                        <h4 className={`text-xs font-semibold uppercase tracking-wide mb-3 border-l-2 border-accent/60 pl-2 ${isDark ? 'text-content-muted' : 'text-gray-500'
                          }`}>
                          Files
                        </h4>
                        <div className="space-y-1">
                          <button
                            onClick={() => {
                              fileInputRef.current?.click();
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm flex items-center gap-3 transition-colors rounded-md ${isDark
                              ? 'text-content-secondary hover:bg-white/5 hover:text-content-primary'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            <Upload className="w-4 h-4" />
                            Import Files
                          </button>

                          <button
                            onClick={() => {
                              onExport();
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm flex items-center gap-3 transition-colors rounded-md ${isDark
                              ? 'text-content-secondary hover:bg-white/5 hover:text-content-primary'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            <Download className="w-4 h-4" />
                            Export ZIP
                          </button>
                        </div>
                      </div>

                      <div className={`border-t my-1 ${isDark ? 'border-stroke-subtle' : 'border-gray-200'}`} />

                      {/* Settings & Tools */}
                      <div className="px-4 py-3">
                        <h4 className={`text-xs font-semibold uppercase tracking-wide mb-3 border-l-2 border-accent/60 pl-2 ${isDark ? 'text-content-muted' : 'text-gray-500'
                          }`}>
                          Settings & Tools
                        </h4>
                        <div className="space-y-1">
                          <button
                            onClick={() => {
                              updateSettings({ theme: isDark ? 'light' : 'dark' });
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm flex items-center gap-3 transition-colors rounded-md ${isDark
                              ? 'text-content-secondary hover:bg-white/5 hover:text-content-primary'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            {isDark ? 'Light Mode' : 'Dark Mode'}
                          </button>

                          <button
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent('navigate-to-about'));
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm flex items-center gap-3 transition-colors rounded-md ${isDark
                              ? 'text-content-secondary hover:bg-white/5 hover:text-content-primary'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            <FileText className="w-4 h-4" />
                            About Us
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/*
        Hidden file input — supports both single files and full folder import.
        webkitdirectory allows selecting a folder; multiple allows multi-file select.
        accept filter matches html/css/js only.
      */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        // @ts-expect-error — webkitdirectory is non-standard but widely supported
        webkitdirectory=""
        mozdirectory=""
        accept=".html,.htm,.css,.js"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Spacer for fixed navbar */}
      <div className="h-14 sm:h-16" />
    </>
  );
};

export default React.memo(NavigationBar);
