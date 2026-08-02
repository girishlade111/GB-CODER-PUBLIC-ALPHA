import React, { useState, useRef } from 'react';
import {
  Menu,
  MoreVertical,
  PanelLeft,
  Save,
  Play,
  FileText,
  Share2,
  Sun,
  Moon,
  Trash2,
  Wand2,
  FilePlus,
  Mic,
  MicOff,
} from 'lucide-react';
import { PROJECT_TYPE_LABEL, ProjectType } from '../types/files';
import { useTheme } from '../hooks/useTheme';
import { useSettings } from '../hooks/useSettings';
import Tooltip from './ui/Tooltip';

interface NavigationBarProps {
  onAutoSaveToggle: () => void;
  onRun: () => void;
  onOpenBuildFromPrompt: () => void;
  onExternalLibraryManagerToggle: () => void;
  onClear?: () => void;
  /** Starts a new project of the given type. Plain is the default mode. */
  onNewProject?: (projectType: ProjectType) => void;
  currentProjectType?: ProjectType;
  autoSaveEnabled: boolean;
  customActions?: React.ReactNode;
  /** Push-to-talk: starts listening, or stops it when already live. */
  onToggleVoice?: () => void;
  isVoiceListening?: boolean;
  /**
   * Opens the navigation drawer. Only rendered at ≤1024px, where the left rail
   * is off-canvas; hidden with CSS on desktop so it costs no toolbar width.
   */
  onToggleNavDrawer?: () => void;
  isNavDrawerOpen?: boolean;
  /**
   * Export & Share. The same handler that drives the desktop toolbar button, so
   * the overflow menu is a second trigger rather than a second implementation.
   */
  onOpenExport?: () => void;
  /**
   * Returns to the project dashboard.
   *
   * When omitted the logo stays the plain, non-interactive mark it has always
   * been — the legal and documentation pages render this bar without a project to
   * leave, so a "back to your projects" affordance there would be meaningless.
   */
  onNavigateHome?: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  onAutoSaveToggle,
  onRun,
  onOpenBuildFromPrompt,
  onClear,
  onNewProject,
  onNavigateHome,
  currentProjectType = 'plain',
  autoSaveEnabled,
  customActions,
  onToggleVoice,
  isVoiceListening = false,
  onToggleNavDrawer,
  isNavDrawerOpen = false,
  onOpenExport,
}) => {
  const { isDark } = useTheme();
  const { updateSettings } = useSettings();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const overflowRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (overflowRef.current && !overflowRef.current.contains(event.target as Node)) {
        setIsOverflowOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key for menu close
  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (isDropdownOpen) setIsDropdownOpen(false);
      if (isOverflowOpen) setIsOverflowOpen(false);
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isDropdownOpen, isOverflowOpen]);

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
              {/*
                Drawer trigger. `hidden` above 1024px — a display:none flex child
                creates no box and no gap, so the desktop toolbar is unchanged.
              */}
              {onToggleNavDrawer && (
                <button
                  onClick={onToggleNavDrawer}
                  className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-md transition-colors compact:flex ${
                    isDark
                      ? 'text-content-secondary hover:bg-white/5 hover:text-content-primary'
                      : 'text-gray-700 hover:bg-black/5'
                  }`}
                  aria-label={isNavDrawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  aria-expanded={isNavDrawerOpen}
                >
                  <PanelLeft className="w-5 h-5" />
                </button>
              )}

              {/*
                The logo doubles as the way back to the dashboard, which is where
                a wordmark conventionally leads. Rendered as a button only when a
                handler is supplied, so it is never an interactive-looking element
                that does nothing.
              */}
              <div
                className={`flex items-center gap-1.5 sm:gap-2 lg:gap-4 ${
                  onNavigateHome ? 'cursor-pointer rounded-lg transition-opacity hover:opacity-80' : ''
                }`}
                onClick={onNavigateHome}
                onKeyDown={
                  onNavigateHome
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onNavigateHome();
                        }
                      }
                    : undefined
                }
                role={onNavigateHome ? 'button' : undefined}
                tabIndex={onNavigateHome ? 0 : undefined}
                aria-label={onNavigateHome ? 'All projects' : undefined}
                title={onNavigateHome ? 'All projects' : undefined}
                data-testid={onNavigateHome ? 'nav-home' : undefined}
              >
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

            {/* Right side - Run, Build with AI, Export, project menu */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 min-w-0 flex-shrink-0">
              <Tooltip label="Run">
                <button
                  onClick={onRun}
                  className={`p-2 sm:px-3 sm:py-2 rounded-md transition-colors flex items-center gap-2 compact:justify-center compact:min-h-[44px] compact:min-w-[44px] ${
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

              {/*
                * Voice: icon-only so it slots into the existing toolbar rhythm
                * without competing with Run / Build with AI for width. Every
                * action it reaches is still available manually.
                */}
              {onToggleVoice && (
                <Tooltip
                  label={isVoiceListening ? 'Stop listening' : 'Voice commands'}
                  /* Secondary action: moves into the overflow menu at ≤1024px so
                     Run and Build with AI keep the width they need. */
                  className="hidden desktop:inline-flex"
                >
                  <button
                    onClick={onToggleVoice}
                    className={`relative p-2 rounded-md transition-colors ${isVoiceListening
                      ? 'bg-red-500/15 text-red-400'
                      : (isDark
                        ? 'text-content-secondary hover:bg-white/5 hover:text-content-primary'
                        : 'text-gray-700 hover:bg-black/5')
                      }`}
                    title={isVoiceListening ? 'Stop listening' : 'Voice commands'}
                    aria-label={isVoiceListening ? 'Stop listening' : 'Start voice commands'}
                    aria-pressed={isVoiceListening}
                  >
                    {isVoiceListening ? (
                      <>
                        <span className="absolute inset-1 rounded-full bg-red-500/30 animate-voice-ring" />
                        <Mic className="relative w-4 h-4 sm:w-5 sm:h-5" />
                      </>
                    ) : (
                      <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </Tooltip>
              )}

              <Tooltip label="Build with AI">
                <button
                  onClick={onOpenBuildFromPrompt}
                  className="p-2 sm:px-3 sm:py-2 rounded-md transition-colors flex items-center gap-2 bg-accent text-accent-fg hover:bg-accent-hover active:brightness-95 compact:justify-center compact:min-h-[44px] compact:min-w-[44px]"
                  title="Build with AI"
                  aria-label="Build with AI"
                >
                  <Wand2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden lg:inline text-sm font-semibold">Build with AI</span>
                </button>
              </Tooltip>

              {/* Custom Actions */}
              {customActions}

              {/*
                Overflow menu for secondary actions at ≤1024px. It re-triggers
                the same `onToggleVoice` / `onOpenExport` handlers the desktop
                toolbar uses — no duplicated feature logic, just a second
                trigger surface that fits a narrow bar.
              */}
              {(onToggleVoice || onOpenExport) && (
                <div className="relative hidden compact:block" ref={overflowRef}>
                  <button
                    onClick={() => setIsOverflowOpen((open) => !open)}
                    className={`flex h-11 w-11 items-center justify-center rounded-md transition-colors ${
                      isOverflowOpen
                        ? isDark
                          ? 'bg-white/10 text-content-primary'
                          : 'bg-gray-100 text-black'
                        : isDark
                          ? 'text-content-secondary hover:bg-white/5 hover:text-content-primary'
                          : 'text-gray-600 hover:bg-black/5'
                    }`}
                    aria-label="More actions"
                    aria-expanded={isOverflowOpen}
                    aria-haspopup="true"
                    data-testid="nav-overflow-toggle"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {isOverflowOpen && (
                    <div
                      className={`absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border shadow-elevated z-50 animate-slide-down ${
                        isDark ? 'bg-surface-raised border-stroke-subtle' : 'bg-white border-gray-200'
                      }`}
                      data-testid="nav-overflow-menu"
                    >
                      <div className="py-1">
                        {onToggleVoice && (
                          <button
                            onClick={() => {
                              onToggleVoice();
                              setIsOverflowOpen(false);
                            }}
                            className={`flex min-h-[44px] w-full items-center gap-3 px-4 text-left text-sm transition-colors ${
                              isDark
                                ? 'text-content-secondary hover:bg-white/5 hover:text-content-primary'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {isVoiceListening ? (
                              <Mic className="w-4 h-4 text-red-400" />
                            ) : (
                              <MicOff className="w-4 h-4" />
                            )}
                            {isVoiceListening ? 'Stop listening' : 'Voice commands'}
                          </button>
                        )}

                        {onOpenExport && (
                          <button
                            onClick={() => {
                              onOpenExport();
                              setIsOverflowOpen(false);
                            }}
                            className={`flex min-h-[44px] w-full items-center gap-3 px-4 text-left text-sm transition-colors ${
                              isDark
                                ? 'text-content-secondary hover:bg-white/5 hover:text-content-primary'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Share2 className="w-4 h-4" />
                            Export &amp; Share
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Project menu — project-level actions that have no sidebar equivalent */}
              <div className="relative" ref={dropdownRef}>
                <Tooltip label="Project menu">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`p-2 rounded-md transition-colors compact:flex compact:h-11 compact:w-11 compact:items-center compact:justify-center ${isDropdownOpen
                      ? (isDark ? 'bg-white/10 text-content-primary' : 'bg-gray-100 text-black')
                      : (isDark
                        ? 'text-content-secondary hover:bg-white/5 hover:text-content-primary'
                        : 'text-gray-600 hover:bg-black/5')
                      }`}
                    title="Project menu"
                    aria-label="Toggle project menu"
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
                          Project
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
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

                      <div className={`border-t my-1 ${isDark ? 'border-stroke-subtle' : 'border-gray-200'}`} />

                      {/* Appearance & Info */}
                      <div className="px-4 py-3">
                        <h4 className={`text-xs font-semibold uppercase tracking-wide mb-3 border-l-2 border-accent/60 pl-2 ${isDark ? 'text-content-muted' : 'text-gray-500'
                          }`}>
                          Appearance & Info
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

      {/* Spacer for fixed navbar */}
      <div className="h-14 sm:h-16" />
    </>
  );
};

export default React.memo(NavigationBar);
