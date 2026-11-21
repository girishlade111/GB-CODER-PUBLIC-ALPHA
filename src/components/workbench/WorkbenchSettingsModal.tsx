import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import Codicon from '../ui/Codicon';
import { WorkbenchSettings } from '../../services/workbench/workbenchTypes';

interface WorkbenchSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WorkbenchSettings;
  onUpdateSettings: (newSettings: Partial<WorkbenchSettings>) => void;
  onResetLayout: () => void;
}

const SHORTCUTS = [
  { key: 'Ctrl + Shift + P', label: 'Command Palette' },
  { key: 'Ctrl + P', label: 'Quick Open / Find File' },
  { key: 'Ctrl + B', label: 'Toggle Primary Sidebar' },
  { key: 'Ctrl + J', label: 'Toggle Bottom Panel' },
  { key: 'Ctrl + `', label: 'Toggle Terminal Panel' },
  { key: 'Ctrl + Shift + E', label: 'Focus Explorer' },
  { key: 'Ctrl + Shift + F', label: 'Focus Search' },
  { key: 'Ctrl + S', label: 'Save File & Persist' },
];

export const WorkbenchSettingsModal: React.FC<WorkbenchSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetLayout,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      previouslyFocusedElementRef.current = document.activeElement;
    }

    const focusTimer = setTimeout(() => {
      dialogRef.current?.focus();
    }, 20);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      // Accessible Tab / Shift+Tab focus trapping
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length > 0) {
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown, true);
      if (previouslyFocusedElementRef.current && typeof previouslyFocusedElementRef.current.focus === 'function') {
        setTimeout(() => {
          previouslyFocusedElementRef.current?.focus();
        }, 10);
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="workbench-settings-title"
      aria-label="Workbench Settings"
      data-testid="workbench-settings-dialog"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 outline-none animate-in fade-in duration-100"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex w-full max-w-xl flex-col rounded-lg border border-[#3c3c3c] bg-[#252526] shadow-2xl text-[#cccccc] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#2b2b2b] px-4 bg-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <Codicon name="settings-gear" className="text-sm text-[#0078d4]" />
            <h2 id="workbench-settings-title" className="text-xs font-semibold tracking-wide text-[#cccccc]">
              Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded text-[#999999] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close settings"
            data-testid="close-settings-btn"
          >
            <Codicon name="close" className="text-[13px]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex max-h-[75vh] flex-col overflow-y-auto p-5 space-y-5 text-xs bg-[#252526]">
          {/* Editor Preferences */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#999999] mb-3">
              Editor Preferences
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Font Size */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-[#999999]">Font Size (px)</label>
                <input
                  type="number"
                  min={10}
                  max={24}
                  value={settings.fontSize}
                  onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) || 13 })}
                  className="rounded-[2px] border border-[#3c3c3c] bg-[#1f1f1f] px-2.5 py-1 text-xs text-[#cccccc] focus:border-[#0078d4] focus:outline-none"
                />
              </div>

              {/* Line Height */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-[#999999]">Line Height (px)</label>
                <input
                  type="number"
                  min={16}
                  max={36}
                  value={settings.lineHeight}
                  onChange={(e) => onUpdateSettings({ lineHeight: Number(e.target.value) || 20 })}
                  className="rounded-[2px] border border-[#3c3c3c] bg-[#1f1f1f] px-2.5 py-1 text-xs text-[#cccccc] focus:border-[#0078d4] focus:outline-none"
                />
              </div>

              {/* Tab Size */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-[#999999]">Tab Size (spaces)</label>
                <select
                  value={settings.tabSize}
                  onChange={(e) => onUpdateSettings({ tabSize: Number(e.target.value) || 2 })}
                  className="rounded-[2px] border border-[#3c3c3c] bg-[#1f1f1f] px-2.5 py-1 text-xs text-[#cccccc] focus:border-[#0078d4] focus:outline-none"
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                  <option value={8}>8 Spaces</option>
                </select>
              </div>

              {/* Terminal Font Size */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-[#999999]">Terminal Font Size</label>
                <input
                  type="number"
                  min={10}
                  max={22}
                  value={settings.terminalFontSize}
                  onChange={(e) => onUpdateSettings({ terminalFontSize: Number(e.target.value) || 13 })}
                  className="rounded-[2px] border border-[#3c3c3c] bg-[#1f1f1f] px-2.5 py-1 text-xs text-[#cccccc] focus:border-[#0078d4] focus:outline-none"
                />
              </div>

              {/* Word Wrap */}
              <div className="flex items-center justify-between col-span-1 sm:col-span-2 rounded-[4px] border border-[#3c3c3c] bg-[#1f1f1f] px-3 py-2">
                <div>
                  <div className="font-medium text-[#cccccc]">Word Wrap</div>
                  <div className="text-[10px] text-[#999999]">Wrap long code lines in editor</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.wordWrap}
                  onChange={(e) => onUpdateSettings({ wordWrap: e.target.checked })}
                  className="h-4 w-4 rounded-[2px] border-[#3c3c3c] text-[#0078d4] focus:ring-0"
                />
              </div>

              {/* Minimap */}
              <div className="flex items-center justify-between col-span-1 sm:col-span-2 rounded-[4px] border border-[#3c3c3c] bg-[#1f1f1f] px-3 py-2">
                <div>
                  <div className="font-medium text-[#cccccc]">Editor Minimap</div>
                  <div className="text-[10px] text-[#999999]">Show code overview scroll preview on right side</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.minimap}
                  onChange={(e) => onUpdateSettings({ minimap: e.target.checked })}
                  className="h-4 w-4 rounded-[2px] border-[#3c3c3c] text-[#0078d4] focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#999999] mb-3">
              <Codicon name="keyboard" className="text-xs" />
              <span>Keyboard Shortcuts</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SHORTCUTS.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-[4px] border border-[#3c3c3c] bg-[#1f1f1f] px-2.5 py-1.5"
                >
                  <span className="text-[#999999] truncate text-[11px]">{item.label}</span>
                  <kbd className="rounded border border-[#3c3c3c] bg-[#252526] px-1.5 py-0.5 font-mono text-[10px] text-[#cccccc] shrink-0">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Layout Reset */}
          <div className="border-t border-[#3c3c3c] pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-[#cccccc]">Reset Workbench Layout</div>
                <div className="text-[10px] text-[#999999]">
                  Restore default 4-pane layout, panel widths, and docked view positions
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all panel positions, sizes, and presets to default?')) {
                    onResetLayout();
                    toast.success('Workbench layout reset to defaults');
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 rounded border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset to Default</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex h-11 shrink-0 items-center justify-end border-t border-[#2b2b2b] bg-[#1f1f1f] px-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[2px] bg-[#0078d4] hover:bg-[#026ec1] px-4 py-1 text-xs font-normal text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};
