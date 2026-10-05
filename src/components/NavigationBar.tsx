import React, { useState, useRef } from 'react';
import {
  Menu,
  MoreVertical,
  PanelLeft,
  Save,
  Play,
  FileText,
  Share2,
  Trash2,
  Wand2,
  FilePlus,
  Mic,
  MicOff,
  Bug,
  Scan,
} from 'lucide-react';
import { PROJECT_TYPE_LABEL, ProjectType } from '../types/files';

import Tooltip from './ui/Tooltip';

interface NavigationBarProps {
  onAutoSaveToggle: () => void;
  onRun: () => void;
  onOpenBuildFromPrompt: () => void;
  onOpenCodeRabbit?: () => void;
  /** Screenshot → Code. Optional so legal/doc pages can omit the trigger. */
  onOpenScreenshotToCode?: () => void;
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

/** Ghost icon button — no border until it matters, ink-on-hover. */
const iconButton =
  'inline-flex items-center justify-center rounded-md text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary';
/** Nav-link weight per DESIGN.md typography. */
const NAV_LINK = 'text-sm font-medium';

const NavigationBar: React.FC<NavigationBarProps> = ({
  onAutoSaveToggle,
  onRun,
  onOpenBuildFromPrompt,
  onOpenCodeRabbit,
  onOpenScreenshotToCode,
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

  /** Shared surface for the dropdown panels: white card, hairline, no shadow. */
  const menuSurface =
    'absolute right-0 mt-2 z-50 animate-slide-down overflow-hidden rounded-lg border border-stroke bg-surface-raised';

  return (
    <>
      {/* top-nav — canvas floor with a single hairline underneath. No shadow,
          no blur: depth in this system comes from cream-on-cream and the dark
          product surfaces, not from overlays. */}
      <nav className="fixed left-0 right-0 top-0 z-40 border-b border-stroke-subtle bg-surface-canvas">
        <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between sm:h-16">
            {/* Left side - Logo */}
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4 lg:gap-6">
              {/*
                Drawer trigger. `hidden` above 1024px — a display:none flex child
                creates no box and no gap, so the desktop toolbar is unchanged.
              */}
              {onToggleNavDrawer && (
                <button
                  onClick={onToggleNavDrawer}
                  className={`${iconButton} hidden h-11 w-11 shrink-0 compact:flex`}
                  aria-label={isNavDrawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  aria-expanded={isNavDrawerOpen}
                >
                  <PanelLeft className="h-5 w-5" />
                </button>
              )}

              {/*
                The logo doubles as the way back to the dashboard, which is where
                a wordmark conventionally leads. Rendered as a button only when a
                handler is supplied, so it is never an interactive-looking element
                that does nothing.
              */}
              <div
                className={`flex items-center gap-2 sm:gap-2 lg:gap-3 ${
                  onNavigateHome ? 'cursor-pointer transition-opacity hover:opacity-70' : ''
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
                  className="h-6 w-6 rounded-md object-contain sm:h-8 sm:w-8 lg:h-9 lg:w-9"
                />
                {/*
                  Wordmark in the display serif — the brand reads as a wordmark,
                  not a label, so it takes the editorial voice at weight 500
                  with negative tracking rather than bold sans.
                */}
                <span className="font-display truncate text-xl tracking-tight text-content-primary sm:text-2xl">
                  GB Coder
                </span>
              </div>
            </div>

            {/* Right side - Run, Build with AI, Export, project menu */}
            <div className="flex min-w-0 flex-shrink-0 items-center gap-1.5 sm:gap-2">
              <Tooltip label="Run">
                <button
                  onClick={onRun}
                  className={`${iconButton} ${NAV_LINK} compact:min-h-[44px] compact:min-w-[44px] compact:justify-center gap-2 border border-stroke bg-surface-canvas px-3 py-2`}
                  title="Run"
                  aria-label="Run"
                >
                  <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden lg:inline">Run</span>
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
                    className={`${iconButton} relative p-2 ${
                      isVoiceListening ? 'bg-danger-subtle text-danger' : ''
                    }`}
                    title={isVoiceListening ? 'Stop listening' : 'Voice commands'}
                    aria-label={isVoiceListening ? 'Stop listening' : 'Start voice commands'}
                    aria-pressed={isVoiceListening}
                  >
                    {isVoiceListening ? (
                      <>
                        <span className="absolute inset-1 animate-voice-ring rounded-full bg-danger/20" />
                        <Mic className="relative h-4 w-4 sm:h-5 sm:w-5" />
                      </>
                    ) : (
                      <MicOff className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </Tooltip>
              )}

              {/* button-primary — the one place coral is spent on a single element. */}
              <Tooltip label="Build with AI">
                <button
                  onClick={onOpenBuildFromPrompt}
                  className={`inline-flex items-center justify-center gap-2 rounded-md border border-accent bg-accent px-3 py-2.5 ${NAV_LINK} text-accent-fg transition-colors hover:border-accent-hover hover:bg-accent-hover compact:min-h-[44px] compact:min-w-[44px]`}
                  title="Build with AI"
                  aria-label="Build with AI"
                >
                  <Wand2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden lg:inline">Build with AI</span>
                </button>
              </Tooltip>

              {/* button-secondary — cream fill, hairline outline. */}
              {onOpenCodeRabbit && (
                <Tooltip label="CodeRabbit AI Bug Scanner">
                  <button
                    onClick={onOpenCodeRabbit}
                    className={`inline-flex items-center justify-center gap-2 rounded-md border border-stroke bg-surface-canvas px-3 py-2 ${NAV_LINK} text-content-primary transition-colors hover:bg-surface-hover compact:min-h-[44px] compact:min-w-[44px]`}
                    title="CodeRabbit AI Bug Scanner"
                    aria-label="CodeRabbit AI Bug Scanner"
                  >
                    <Bug className="h-4 w-4 text-accent sm:h-5 sm:w-5" />
                    <span className="hidden xl:inline">CodeRabbit AI</span>
                  </button>
                </Tooltip>
              )}

              {/* button-secondary — icon-only: Screenshot to Code is a peer of
                  Build with AI, and a second labelled coral CTA would compete
                  with it for width. The label lives in the tooltip. */}
              {onOpenScreenshotToCode && (
                <Tooltip label="Screenshot to Code">
                  <button
                    onClick={onOpenScreenshotToCode}
                    className={`inline-flex items-center justify-center gap-2 rounded-md border border-stroke bg-surface-canvas px-3 py-2 ${NAV_LINK} text-content-primary transition-colors hover:bg-surface-hover compact:min-h-[44px] compact:min-w-[44px]`}
                    title="Screenshot to Code"
                    aria-label="Screenshot to Code"
                  >
                    <Scan className="h-4 w-4 text-accent sm:h-5 sm:w-5" />
                    <span className="hidden xl:inline">Screenshot to Code</span>
                  </button>
                </Tooltip>
              )}

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
                    className={`${iconButton} h-11 w-11 ${isOverflowOpen ? 'bg-surface-hover text-content-primary' : ''}`}
                    aria-label="More actions"
                    aria-expanded={isOverflowOpen}
                    aria-haspopup="true"
                    data-testid="nav-overflow-toggle"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>

                  {isOverflowOpen && (
                    <div className={`${menuSurface} w-56`} data-testid="nav-overflow-menu">
                      <div className="py-1">
                        {onToggleVoice && (
                          <button
                            onClick={() => {
                              onToggleVoice();
                              setIsOverflowOpen(false);
                            }}
                            className={`flex min-h-[44px] w-full items-center gap-3 px-4 text-left ${NAV_LINK} text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary`}
                          >
                            {isVoiceListening ? (
                              <Mic className="h-4 w-4 text-danger" />
                            ) : (
                              <MicOff className="h-4 w-4" />
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
                            className={`flex min-h-[44px] w-full items-center gap-3 px-4 text-left ${NAV_LINK} text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary`}
                          >
                            <Share2 className="h-4 w-4" />
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
                    className={`${iconButton} p-2 compact:flex compact:h-11 compact:w-11 compact:items-center compact:justify-center ${
                      isDropdownOpen ? 'bg-surface-hover text-content-primary' : ''
                    }`}
                    title="Project menu"
                    aria-label="Toggle project menu"
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                  >
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </Tooltip>

                {/* Dropdown Content */}
                {isDropdownOpen && (
                  <div className={`${menuSurface} w-72 sm:w-80`}>
                    {/* Menu Content */}
                    <div className="max-h-[calc(100vh-100px)] overflow-y-auto py-2">
                      {/* New Project — project type selection */}
                      {onNewProject && (
                        <>
                          <div className="px-4 py-3">
                            <div className="quiet-section-label mb-2">New Project</div>
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
                                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                                      isCurrent
                                        ? 'bg-surface-hover text-content-primary'
                                        : 'text-content-secondary hover:bg-surface-hover hover:text-content-primary'
                                    }`}
                                  >
                                    <FilePlus className="h-4 w-4 text-content-muted" />
                                    {PROJECT_TYPE_LABEL[type]}
                                    {isCurrent && (
                                      <span className="ml-auto rounded-full bg-success-subtle px-1.5 py-0.5 text-[10px] font-medium text-success">
                                        Current
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                            <p className="mt-2 text-[11.5px] text-content-muted">
                              React and Vue projects are compiled in your browser.
                            </p>
                          </div>

                          <div className="my-1 border-t border-stroke-soft" />
                        </>
                      )}

                      {/* Code Operations */}
                      <div className="px-4 py-3">
                        <div className="quiet-section-label mb-2">Project</div>
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            onClick={() => {
                              onAutoSaveToggle();
                              setIsDropdownOpen(false);
                            }}
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                              NAV_LINK
                            } text-content-secondary hover:bg-surface-hover hover:text-content-primary`}
                          >
                            <Save className="h-4 w-4 text-content-muted" />
                            Auto-Save
                            <span
                              className={`ml-auto rounded-full px-2 py-0.5 text-[11px] ${
                                autoSaveEnabled
                                  ? 'bg-success-subtle text-success'
                                  : 'bg-surface-strong text-content-muted'
                              }`}
                            >
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
                            className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors text-danger hover:bg-danger-subtle"
                          >
                            <Trash2 className="h-4 w-4" />
                            Clear All Code
                          </button>
                        )}
                      </div>

                      <div className="my-1 border-t border-stroke-soft" />

                      {/* Info */}
                      <div className="px-4 py-3">
                        <h4 className="quiet-section-label mb-3 border-l-2 border-accent pl-2">
                          Info
                        </h4>
                        <div className="space-y-1">
                          <button
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent('navigate-to-about'));
                              setIsDropdownOpen(false);
                            }}
                            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left ${NAV_LINK} text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary`}
                          >
                            <FileText className="h-4 w-4" />
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