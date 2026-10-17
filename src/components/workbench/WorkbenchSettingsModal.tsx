import React from 'react';
import { X, RotateCcw, Keyboard, Sliders, Check } from 'lucide-react';
import toast from 'react-hot-toast';
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
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-label="Workbench Settings"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div className="flex w-full max-w-2xl flex-col rounded-lg border border-[#343945] bg-[#20232B] shadow-2xl text-[#E5E9F1] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#343945] px-4 bg-[#181A20]">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[#6366F1]" />
            <h2 className="text-sm font-semibold tracking-wide">Workbench Settings & Shortcuts</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#697487] hover:text-[#E5E9F1] hover:bg-white/10 transition-colors"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex max-h-[75vh] flex-col overflow-y-auto p-5 space-y-6 text-xs">
          {/* Editor Preferences */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9AA4B5] mb-3">
              Editor Preferences
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Font Size */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-[#9AA4B5]">Font Size (px)</label>
                <input
                  type="number"
                  min={10}
                  max={24}
                  value={settings.fontSize}
                  onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) || 13 })}
                  className="rounded border border-[#343945] bg-[#181A20] px-2.5 py-1.5 text-xs text-[#E5E9F1] focus:border-[#6366F1] focus:outline-none"
                />
              </div>

              {/* Line Height */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-[#9AA4B5]">Line Height (px)</label>
                <input
                  type="number"
                  min={16}
                  max={36}
                  value={settings.lineHeight}
                  onChange={(e) => onUpdateSettings({ lineHeight: Number(e.target.value) || 20 })}
                  className="rounded border border-[#343945] bg-[#181A20] px-2.5 py-1.5 text-xs text-[#E5E9F1] focus:border-[#6366F1] focus:outline-none"
                />
              </div>

              {/* Tab Size */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-[#9AA4B5]">Tab Size (spaces)</label>
                <select
                  value={settings.tabSize}
                  onChange={(e) => onUpdateSettings({ tabSize: Number(e.target.value) || 2 })}
                  className="rounded border border-[#343945] bg-[#181A20] px-2.5 py-1.5 text-xs text-[#E5E9F1] focus:border-[#6366F1] focus:outline-none"
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                  <option value={8}>8 Spaces</option>
                </select>
              </div>

              {/* Terminal Font Size */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-[#9AA4B5]">Terminal Font Size</label>
                <input
                  type="number"
                  min={10}
                  max={22}
                  value={settings.terminalFontSize}
                  onChange={(e) => onUpdateSettings({ terminalFontSize: Number(e.target.value) || 13 })}
                  className="rounded border border-[#343945] bg-[#181A20] px-2.5 py-1.5 text-xs text-[#E5E9F1] focus:border-[#6366F1] focus:outline-none"
                />
              </div>

              {/* Word Wrap */}
              <div className="flex items-center justify-between col-span-1 sm:col-span-2 rounded border border-[#343945] bg-[#181A20] px-3 py-2">
                <div>
                  <div className="font-medium text-[#E5E9F1]">Word Wrap</div>
                  <div className="text-[10px] text-[#697487]">Wrap long code lines in editor</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.wordWrap}
                  onChange={(e) => onUpdateSettings({ wordWrap: e.target.checked })}
                  className="h-4 w-4 rounded border-[#343945] text-[#6366F1] focus:ring-[#6366F1]"
                />
              </div>

              {/* Minimap */}
              <div className="flex items-center justify-between col-span-1 sm:col-span-2 rounded border border-[#343945] bg-[#181A20] px-3 py-2">
                <div>
                  <div className="font-medium text-[#E5E9F1]">Editor Minimap</div>
                  <div className="text-[10px] text-[#697487]">Show code overview scroll preview on right side</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.minimap}
                  onChange={(e) => onUpdateSettings({ minimap: e.target.checked })}
                  className="h-4 w-4 rounded border-[#343945] text-[#6366F1] focus:ring-[#6366F1]"
                />
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9AA4B5] mb-3">
              <Keyboard className="h-3.5 w-3.5" />
              <span>Keyboard Shortcuts</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SHORTCUTS.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded border border-[#343945] bg-[#181A20] px-2.5 py-1.5"
                >
                  <span className="text-[#9AA4B5] truncate">{item.label}</span>
                  <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-[#E5E9F1] shrink-0">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Layout Reset */}
          <div className="border-t border-[#343945] pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-[#E5E9F1]">Reset Workbench Layout</div>
                <div className="text-[10px] text-[#697487]">
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
        <div className="flex h-12 shrink-0 items-center justify-end border-t border-[#343945] bg-[#181A20] px-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-[#6366F1] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#4F46E5] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
