import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Sparkles,
  Mic,
  Database,
  Type,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { useSettings, EditorFontFamily, AI_PROVIDERS } from '../../hooks/useSettings';
import { VOICE_LANGUAGES } from '../../services/voiceCommandService';
import { formatBytes } from '../../services/projectArchiveService';
import { useSnapshots } from '../../hooks/useSnapshots';
import toast from 'react-hot-toast';

interface IDESettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsSection = 'editor' | 'ai' | 'voice' | 'storage';

export const IDESettingsModal: React.FC<IDESettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { storageUsage, cleanUpOldSnapshots } = useSnapshots();
  const [activeSection, setActiveSection] = useState<SettingsSection>('editor');

  const [inceptionKey, setInceptionKey] = useState(settings.inceptionApiKey || '');
  const [atriaKey, setAtriaKey] = useState(settings.atriaApiKey || '');
  const [nvidiaKey, setNvidiaKey] = useState(settings.nvidiaApiKey || '');
  const [coderabbitKey, setCoderabbitKey] = useState(settings.codeRabbitApiKey || '');

  useEffect(() => {
    if (isOpen) {
      setInceptionKey(settings.inceptionApiKey || '');
      setAtriaKey(settings.atriaApiKey || '');
      setNvidiaKey(settings.nvidiaApiKey || '');
      setCoderabbitKey(settings.codeRabbitApiKey || '');
    }
  }, [isOpen, settings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fontOptions: EditorFontFamily[] = [
    'JetBrains Mono',
    'Fira Code',
    'Monaco',
    'Consolas',
    'Default',
  ];

  const handleSaveApiKeys = () => {
    updateSettings({
      inceptionApiKey: inceptionKey.trim(),
      atriaApiKey: atriaKey.trim(),
      nvidiaApiKey: nvidiaKey.trim(),
      codeRabbitApiKey: coderabbitKey.trim(),
    });
    toast.success('Settings & API keys saved successfully');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm select-none p-4"
      onClick={onClose}
      data-testid="ide-settings-modal"
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex h-[560px] w-full max-w-3xl overflow-hidden rounded-xl border border-[#262636] bg-[#181824] shadow-2xl text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Sidebar Tabs */}
        <div className="w-52 shrink-0 border-r border-[#262636] bg-[#12131c] p-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-2 py-2 mb-2 text-white font-semibold text-sm">
              <Settings className="h-4 w-4 text-cyan-400" />
              <span>IDE Settings</span>
            </div>

            <button
              type="button"
              onClick={() => setActiveSection('editor')}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                activeSection === 'editor'
                  ? 'bg-[#007acc] text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Type className="h-4 w-4" />
              <span>Editor</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('ai')}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                activeSection === 'ai'
                  ? 'bg-[#007acc] text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Models & Keys</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('voice')}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                activeSection === 'voice'
                  ? 'bg-[#007acc] text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Mic className="h-4 w-4" />
              <span>Voice Commands</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('storage')}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                activeSection === 'storage'
                  ? 'bg-[#007acc] text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Database className="h-4 w-4" />
              <span>Storage & Reset</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all IDE settings to default?')) {
                resetSettings();
                toast.success('Settings reset to defaults');
              }
            }}
            className="flex items-center gap-1.5 rounded px-2 py-1.5 text-[11px] text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden bg-[#181824]">
          {/* Header */}
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#262636] px-6">
            <h3 className="font-semibold text-sm text-white capitalize">
              {activeSection === 'editor' && 'Editor Preferences'}
              {activeSection === 'ai' && 'AI Providers & Credentials'}
              {activeSection === 'voice' && 'Voice Recognition Settings'}
              {activeSection === 'storage' && 'Storage & Maintenance'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Section Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
            {activeSection === 'editor' && (
              <>
                <div className="space-y-2">
                  <label className="font-medium text-slate-200 block">Font Family</label>
                  <select
                    value={settings.editorFontFamily}
                    onChange={(e) => updateSettings({ editorFontFamily: e.target.value as EditorFontFamily })}
                    className="w-full rounded-md border border-[#262636] bg-[#12131c] px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                  >
                    {fontOptions.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="font-medium text-slate-200">Font Size ({settings.editorFontSize}px)</label>
                  </div>
                  <input
                    type="range"
                    min={11}
                    max={22}
                    value={settings.editorFontSize}
                    onChange={(e) => updateSettings({ editorFontSize: parseInt(e.target.value, 10) })}
                    className="w-full accent-[#007acc]"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[#262636] bg-[#141522] p-3">
                  <div>
                    <p className="font-medium text-white">Auto Run JavaScript</p>
                    <p className="text-[11px] text-slate-400">Re-execute scripts automatically upon file edits</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoRunJS}
                    onChange={(e) => updateSettings({ autoRunJS: e.target.checked })}
                    className="h-4 w-4 accent-[#007acc]"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[#262636] bg-[#141522] p-3">
                  <div>
                    <p className="font-medium text-white">Inline AI Ghost Text (Copilot)</p>
                    <p className="text-[11px] text-slate-400">Show intelligent code completions inside editor (Tab to accept)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.inlineCopilotEnabled}
                    onChange={(e) => updateSettings({ inlineCopilotEnabled: e.target.checked })}
                    className="h-4 w-4 accent-[#007acc]"
                  />
                </div>
              </>
            )}

            {activeSection === 'ai' && (
              <>
                <div className="space-y-2">
                  <label className="font-medium text-slate-200 block">Default AI Provider</label>
                  <div className="grid grid-cols-3 gap-2">
                    {AI_PROVIDERS.map((prov) => (
                      <button
                        key={prov.id}
                        type="button"
                        onClick={() => updateSettings({ aiProvider: prov.id })}
                        className={`rounded-lg border p-3 text-left transition-all ${
                          settings.aiProvider === prov.id
                            ? 'border-[#007acc] bg-[#007acc]/10 text-white shadow'
                            : 'border-[#262636] bg-[#12131c] text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-white">{prov.name}</span>
                          <span className="rounded bg-white/10 px-1 text-[9px] text-cyan-300">
                            {prov.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{prov.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">
                    API Keys (Optional / Custom)
                  </h4>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Inception Labs API Key</label>
                    <input
                      type="password"
                      value={inceptionKey}
                      onChange={(e) => setInceptionKey(e.target.value)}
                      placeholder="sk-inception-..."
                      className="w-full rounded border border-[#262636] bg-[#12131c] px-3 py-1.5 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Atria ASI API Key</label>
                    <input
                      type="password"
                      value={atriaKey}
                      onChange={(e) => setAtriaKey(e.target.value)}
                      placeholder="sk-atria-..."
                      className="w-full rounded border border-[#262636] bg-[#12131c] px-3 py-1.5 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">NVIDIA NIM API Key</label>
                    <input
                      type="password"
                      value={nvidiaKey}
                      onChange={(e) => setNvidiaKey(e.target.value)}
                      placeholder="nvapi-..."
                      className="w-full rounded border border-[#262636] bg-[#12131c] px-3 py-1.5 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">CodeRabbit AI API Key (Bug Scanner)</label>
                    <input
                      type="password"
                      value={coderabbitKey}
                      onChange={(e) => setCoderabbitKey(e.target.value)}
                      placeholder="cr-..."
                      className="w-full rounded border border-[#262636] bg-[#12131c] px-3 py-1.5 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveApiKeys}
                    className="rounded bg-[#007acc] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0069b4] transition-colors mt-2"
                  >
                    Save API Keys
                  </button>
                </div>
              </>
            )}

            {activeSection === 'voice' && (
              <>
                <div className="space-y-2">
                  <label className="font-medium text-slate-200 block">Voice Language</label>
                  <select
                    value={settings.voiceLanguage}
                    onChange={(e) => updateSettings({ voiceLanguage: e.target.value })}
                    className="w-full rounded-md border border-[#262636] bg-[#12131c] px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                  >
                    {VOICE_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[#262636] bg-[#141522] p-3">
                  <div>
                    <p className="font-medium text-white">Voice Spoken Feedback</p>
                    <p className="text-[11px] text-slate-400">Speak short vocal confirmations after recognized commands</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.voiceFeedback}
                    onChange={(e) => updateSettings({ voiceFeedback: e.target.checked })}
                    className="h-4 w-4 accent-[#007acc]"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[#262636] bg-[#141522] p-3">
                  <div>
                    <p className="font-medium text-white">Continuous Voice Listening</p>
                    <p className="text-[11px] text-slate-400">Keep microphone open across multiple voice commands</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.voiceContinuous}
                    onChange={(e) => updateSettings({ voiceContinuous: e.target.checked })}
                    className="h-4 w-4 accent-[#007acc]"
                  />
                </div>
              </>
            )}

            {activeSection === 'storage' && (
              <>
                <div className="rounded-lg border border-[#262636] bg-[#141522] p-4 space-y-2">
                  <h4 className="font-semibold text-white text-xs">IndexedDB & Workspace Storage</h4>
                  <p className="text-[11px] text-slate-400">
                    Local project backups and snapshot cache: <span className="font-bold text-white">{formatBytes(storageUsage.usedBytes)} / {formatBytes(storageUsage.maxBytes)} ({storageUsage.percentage}% used)</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      cleanUpOldSnapshots();
                      toast.success('Cleaned up older snapshots');
                    }}
                    className="flex items-center gap-1.5 rounded bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs text-slate-300 border border-white/10 transition-colors mt-2"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-amber-400" />
                    <span>Clean Up Old Snapshots</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDESettingsModal;
