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
} from 'lucide-react';
import { EditorLanguage } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useSettings } from '../hooks/useSettings';

interface NavigationBarProps {
  onAutoSaveToggle: () => void;
  onRun: () => void;
  onImport: (files: FileList) => void;
  onExport: () => void;
  onExternalLibraryManagerToggle: () => void;
  onSettingsToggle: () => void;
  autoSaveEnabled: boolean;
  customActions?: React.ReactNode;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  onAutoSaveToggle,
  onRun,
  onImport,
  onExport,
  onExternalLibraryManagerToggle,
  onSettingsToggle,
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
        className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-sm border-b shadow-vscode-widget transition-all duration-200 ${isDark
          ? 'bg-matte-black/98 border-gray-700'
          : 'bg-white/98 border-gray-200'
          }`}
      >
        <div className="w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
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
              {/* Custom Actions */}
              {customActions}

              {/* Settings Button */}
              <button
                onClick={onSettingsToggle}
                className={`p-2 sm:p-2.5 rounded-lg transition-all duration-200 hover:brightness-125 active:brightness-90 ${isDark
                  ? 'text-bright-white hover:bg-dark-gray'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
                title="Settings"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Hamburger Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`p-2 sm:p-2.5 rounded-lg transition-all duration-200 hover:brightness-125 active:brightness-90 ${isDropdownOpen
                    ? (isDark ? 'bg-dark-gray text-white' : 'bg-gray-100 text-black')
                    : (isDark
                      ? 'text-bright-white hover:bg-dark-gray'
                      : 'text-gray-600 hover:bg-gray-100')
                    }`}
                  title="Menu"
                  aria-label="Toggle navigation menu"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Dropdown Content */}
                {isDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-xl shadow-vscode-widget border z-50 animate-slide-down overflow-hidden ${isDark
                    ? 'bg-dark-gray border-gray-700'
                    : 'bg-white border-gray-200'
                    }`}>
                    {/* Menu Content */}
                    <div className="py-2 max-h-[calc(100vh-100px)] overflow-y-auto">
                      {/* Code Operations */}
                      <div className="px-4 py-3">
                        <h4 className={`text-xs font-semibold uppercase tracking-wide mb-3 border-l-2 border-gray-600 pl-2 ${isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                          Code Operations
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              onRun();
                              setIsDropdownOpen(false);
                            }}
                            className={`px-3 py-2.5 text-sm flex items-center gap-2 transition-colors rounded-lg ${isDark
                              ? 'text-gray-300 hover:bg-[#2a2d2e]'
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
                            className={`px-3 py-2.5 text-sm flex items-center gap-2 transition-colors rounded-lg ${autoSaveEnabled
                              ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
                              : isDark
                                ? 'text-gray-300 hover:bg-gray-700'
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
                      </div>

                      <div className={`border-t my-1 ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />

                      {/* File Management */}
                      <div className="px-4 py-3">
                        <h4 className={`text-xs font-semibold uppercase tracking-wide mb-3 border-l-2 border-gray-600 pl-2 ${isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                          Files
                        </h4>
                        <div className="space-y-1">
                          <button
                            onClick={() => {
                              fileInputRef.current?.click();
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-3 transition-colors rounded-lg ${isDark
                              ? 'text-gray-300 hover:bg-[#2a2d2e]'
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
                            className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-3 transition-colors rounded-lg ${isDark
                              ? 'text-gray-300 hover:bg-[#2a2d2e]'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            <Download className="w-4 h-4" />
                            Export ZIP
                          </button>
                        </div>
                      </div>

                      <div className={`border-t my-1 ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />

                      {/* Settings & Tools */}
                      <div className="px-4 py-3">
                        <h4 className={`text-xs font-semibold uppercase tracking-wide mb-3 border-l-2 border-gray-600 pl-2 ${isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                          Settings & Tools
                        </h4>
                        <div className="space-y-1">
                          <button
                            onClick={() => {
                              updateSettings({ theme: isDark ? 'light' : 'dark' });
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-3 transition-colors rounded-lg ${isDark
                              ? 'text-gray-300 hover:bg-[#2a2d2e]'
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
                            className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-3 transition-colors rounded-lg ${isDark
                              ? 'text-gray-300 hover:bg-[#2a2d2e]'
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
        // @ts-ignore — webkitdirectory is non-standard but widely supported
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
