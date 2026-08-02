import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { X, Plus, Code2, Save, Trash2, Zap, BookOpen, ChevronUp, ChevronDown, Check, Trash, LayoutList, RefreshCcw, AlignLeft } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { customInjectionService, CustomInjection, PresetInjection, InjectionType, InjectionTarget } from '../services/customInjectionService';
import toast from 'react-hot-toast';

interface CustomInjectionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  onInjectionsChanged: () => void;
}

const CustomInjectionManager: React.FC<CustomInjectionManagerProps> = ({
  isOpen,
  onClose,
  projectId,
  onInjectionsChanged,
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'custom' | 'presets' | 'active'>('active');
  const [activeInjections, setActiveInjections] = useState<CustomInjection[]>([]);
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newInjection, setNewInjection] = useState<Partial<CustomInjection>>({
    name: '',
    type: 'css',
    target: 'inline',
    code: '',
    description: '',
    applyToExport: false,
    enabled: true,
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Load active injections
  const loadInjections = useCallback(() => {
    const injections = customInjectionService.getCustomInjections(projectId);
    setActiveInjections(injections);
  }, [projectId]);

  useEffect(() => {
    if (isOpen) {
      loadInjections();
    }
  }, [isOpen, loadInjections]);

  const filteredPresets = useMemo(() => {
    return customInjectionService.searchPresets(searchQuery);
  }, [searchQuery]);

  const notifyChange = () => {
    loadInjections();
    onInjectionsChanged();
  };

  const handleAddCustomInjection = () => {
    if (!newInjection.name || !newInjection.code) {
      toast.error('Please fill in all required fields');
      return;
    }

    customInjectionService.addInjection({
      name: newInjection.name!,
      type: newInjection.type as InjectionType,
      target: newInjection.target as InjectionTarget,
      code: newInjection.code!,
      description: newInjection.description,
      applyToExport: newInjection.applyToExport ?? false,
      enabled: newInjection.enabled ?? true,
    }, projectId);

    setIsAddingNew(false);
    setNewInjection({ name: '', type: 'css', target: 'inline', code: '', description: '', applyToExport: false, enabled: true });
    toast.success('Custom injection added');
    setActiveTab('active');
    notifyChange();
  };

  const handleAddPreset = (presetId: string) => {
    const added = customInjectionService.addPreset(presetId, projectId);
    if (added) {
      toast.success(`Added ${added.name} to active injections`);
      notifyChange();
    } else {
      toast.error('Failed to add preset');
    }
  };

  const handleToggleInjection = (id: string) => {
    customInjectionService.toggleInjection(id, projectId);
    notifyChange();
  };

  const handleDeleteInjection = (id: string) => {
    customInjectionService.deleteInjection(id, projectId);
    toast.success('Injection removed');
    notifyChange();
  };
  
  const handleMoveInjection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      customInjectionService.reorderInjections(index, index - 1, projectId);
      notifyChange();
    } else if (direction === 'down' && index < activeInjections.length - 1) {
      customInjectionService.reorderInjections(index, index + 1, projectId);
      notifyChange();
    }
  };

  const handleToggleAll = (enable: boolean) => {
    activeInjections.forEach(inj => {
      if (inj.enabled !== enable) {
        customInjectionService.toggleInjection(inj.id, projectId);
      }
    });
    notifyChange();
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to remove all custom and preset injections?')) {
      customInjectionService.resetToDefaults(projectId);
      toast.success('Injections reset to defaults');
      notifyChange();
    }
  };

  const handleClose = () => {
    setIsAddingNew(false);
    setSearchQuery('');
    onClose();
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'css': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'js': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'html': return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const presetCategories = Array.from(new Set(filteredPresets.map(p => p.category)));

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm`} onClick={handleClose}>
      <div
        className={`w-full max-w-[720px] h-[85vh] rounded-xl shadow-elevated flex flex-col overflow-hidden ${
          isDark ? 'bg-surface-raised border border-stroke-subtle' : 'bg-white border border-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b ${
          isDark ? 'border-stroke-subtle bg-surface-raised' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-accent-subtle text-accent-hover rounded-lg shadow-sm">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-bright-white' : 'text-gray-900'}`}>
                Custom Code Injection <span className="text-sm font-normal text-content-muted ml-2">({activeInjections.length} active)</span>
              </h2>
              <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Enhance your project with custom HTML, CSS, and JS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className={`p-2.5 rounded-lg transition-colors ${
                isDark ? 'hover:bg-white/5 text-content-secondary hover:text-content-primary' : 'hover:bg-gray-200 text-gray-600'
              }`}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex border-b px-2 pt-2 ${isDark ? 'border-stroke-subtle bg-surface-raised' : 'border-gray-200 bg-gray-50'}`}>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all rounded-t-lg ${
              activeTab === 'active'
                ? isDark ? 'bg-surface-canvas text-accent border-b-2 border-accent' : 'bg-white text-purple-600 border-b-2 border-purple-600'
                : isDark
                ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <LayoutList className="w-4 h-4" />
            Active Injections
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all rounded-t-lg ${
              activeTab === 'custom'
                ? isDark ? 'bg-surface-canvas text-accent border-b-2 border-accent' : 'bg-white text-purple-600 border-b-2 border-purple-600'
                : isDark
                ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Custom Injections
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all rounded-t-lg ${
              activeTab === 'presets'
                ? isDark ? 'bg-surface-canvas text-accent border-b-2 border-accent' : 'bg-white text-purple-600 border-b-2 border-purple-600'
                : isDark
                ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Presets Library
          </button>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-surface-canvas' : 'bg-gray-50'}`} onClick={(e) => e.stopPropagation()}>
          
          {/* ACTIVE INJECTIONS TAB */}
          {activeTab === 'active' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Manage Active Injections
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => handleToggleAll(true)} className="text-xs px-3 py-1.5 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors font-medium">Enable All</button>
                  <button onClick={() => handleToggleAll(false)} className="text-xs px-3 py-1.5 rounded-md bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 transition-colors font-medium">Disable All</button>
                  <button onClick={handleResetToDefaults} className="text-xs px-3 py-1.5 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors font-medium flex items-center gap-1"><RefreshCcw className="w-3 h-3"/> Reset</button>
                </div>
              </div>

              {activeInjections.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-xl border-stroke-subtle">
                  <LayoutList className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>No active injections</p>
                  <p className={`text-sm mt-1 mb-6 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Add presets from the library or create custom injections.
                  </p>
                  <div className="flex justify-center gap-4">
                    <button onClick={() => setActiveTab('presets')} className="px-4 py-2 bg-accent/10 text-accent rounded-lg text-sm font-medium hover:bg-accent/20 transition-colors">Browse Presets</button>
                    <button onClick={() => setActiveTab('custom')} className="px-4 py-2 bg-surface-raised border border-stroke-subtle text-content-primary rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">Add Custom</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeInjections.map((inj, idx) => (
                    <div key={inj.id} className={`flex items-center gap-4 p-4 rounded-xl border ${!inj.enabled ? 'opacity-60' : ''} ${isDark ? 'bg-surface-raised border-stroke-subtle' : 'bg-white border-gray-200'} transition-opacity`}>
                      <div className="flex flex-col gap-1 text-gray-500">
                        <button onClick={() => handleMoveInjection(idx, 'up')} disabled={idx === 0} className="hover:text-content-primary disabled:opacity-30"><ChevronUp className="w-4 h-4"/></button>
                        <button onClick={() => handleMoveInjection(idx, 'down')} disabled={idx === activeInjections.length - 1} className="hover:text-content-primary disabled:opacity-30"><ChevronDown className="w-4 h-4"/></button>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{inj.name}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getTypeBadgeColor(inj.type)}`}>{inj.type}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${isDark ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {inj.target === 'before-body' ? 'Before </body>' : inj.target === 'after-body' ? 'After <body>' : inj.target === 'head' ? '<head>' : 'Inline'}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{inj.description || 'No description'}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center cursor-pointer">
                          <div className="relative">
                            <input type="checkbox" className="sr-only" checked={inj.enabled} onChange={() => handleToggleInjection(inj.id)} />
                            <div className={`block w-10 h-6 rounded-full transition-colors ${inj.enabled ? 'bg-accent' : isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${inj.enabled ? 'transform translate-x-4' : ''}`}></div>
                          </div>
                        </label>
                        <button onClick={() => handleDeleteInjection(inj.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CUSTOM INJECTIONS TAB */}
          {activeTab === 'custom' && (
            <div className="space-y-6">
              {!isAddingNew ? (
                <div className="flex justify-center py-8">
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-accent text-accent-fg rounded-xl font-medium hover:bg-accent-hover transition-colors shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                    Create New Injection
                  </button>
                </div>
              ) : (
                <div className={`p-6 rounded-xl border ${isDark ? 'bg-surface-raised border-stroke-subtle' : 'bg-white border-gray-200'}`}>
                  <h3 className={`text-lg font-bold mb-5 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Create Custom Injection</h3>
                  
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name *</label>
                        <input
                          type="text"
                          value={newInjection.name}
                          onChange={(e) => setNewInjection({ ...newInjection, name: e.target.value })}
                          className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-accent transition-shadow ${
                            isDark ? 'bg-surface-canvas border-stroke-subtle text-gray-100 placeholder-gray-600' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                          }`}
                          placeholder="e.g. My Custom Analytics"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                        <input
                          type="text"
                          value={newInjection.description}
                          onChange={(e) => setNewInjection({ ...newInjection, description: e.target.value })}
                          className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-accent transition-shadow ${
                            isDark ? 'bg-surface-canvas border-stroke-subtle text-gray-100 placeholder-gray-600' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                          }`}
                          placeholder="Optional description"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Type *</label>
                        <select
                          value={newInjection.type}
                          onChange={(e) => {
                            const type = e.target.value as InjectionType;
                            setNewInjection({ 
                              ...newInjection, 
                              type, 
                              target: type === 'html' ? 'head' : 'inline' 
                            });
                          }}
                          className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-accent transition-shadow ${
                            isDark ? 'bg-surface-canvas border-stroke-subtle text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="css">CSS</option>
                          <option value="js">JavaScript</option>
                          <option value="html">HTML</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Target Location *</label>
                        <select
                          value={newInjection.target}
                          onChange={(e) => setNewInjection({ ...newInjection, target: e.target.value as InjectionTarget })}
                          className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-accent transition-shadow ${
                            isDark ? 'bg-surface-canvas border-stroke-subtle text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'
                          }`}
                        >
                          {newInjection.type === 'html' ? (
                            <>
                              <option value="head">&lt;head&gt;</option>
                              <option value="before-body">Before &lt;/body&gt;</option>
                              <option value="after-body">After &lt;body&gt;</option>
                            </>
                          ) : (
                            <>
                              <option value="inline">Inline (Bundled)</option>
                              <option value="head">&lt;head&gt; (via tag)</option>
                              <option value="before-body">Before &lt;/body&gt; (via tag)</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={`flex justify-between items-end mb-1.5`}>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Code *</span>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {newInjection.type === 'html' ? 'Provide valid HTML tags' : `Provide raw ${newInjection.type?.toUpperCase()} (no tags unless inline)`}
                        </span>
                      </label>
                      <div className={`p-1 rounded-xl border focus-within:ring-2 focus-within:ring-accent focus-within:border-accent transition-all ${
                        isDark ? 'bg-[#1e1e1e] border-stroke-subtle' : 'bg-[#1e1e1e] border-gray-300'
                      }`}>
                        <textarea
                          value={newInjection.code}
                          onChange={(e) => setNewInjection({ ...newInjection, code: e.target.value })}
                          rows={8}
                          spellCheck={false}
                          className="w-full p-4 bg-transparent text-gray-300 font-mono text-sm leading-relaxed focus:outline-none resize-y"
                          placeholder={
                            newInjection.type === 'css' ? '.my-custom-class {n  color: #7c3aed;n}' : 
                            newInjection.type === 'js' ? 'console.log("Custom injection active");' : 
                            '<meta name="author" content="Me">'
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            className="peer sr-only" 
                            checked={newInjection.applyToExport} 
                            onChange={(e) => setNewInjection({ ...newInjection, applyToExport: e.target.checked })}
                          />
                          <div className={`w-5 h-5 rounded border-2 transition-colors flex items-center justify-center peer-checked:bg-accent peer-checked:border-accent ${isDark ? 'border-gray-500 bg-surface-canvas' : 'border-gray-400 bg-white'}`}>
                            <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                          </div>
                        </div>
                        <div>
                          <span className={`block text-sm font-medium group-hover:text-accent transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Apply to Export Too</span>
                          <span className={`block text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Include this injection in downloaded HTML</span>
                        </div>
                      </label>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setIsAddingNew(false)}
                          className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                            isDark ? 'bg-surface-canvas hover:bg-white/5 text-gray-300 border border-stroke-subtle' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddCustomInjection}
                          className="px-6 py-2.5 bg-accent text-accent-fg rounded-lg font-medium hover:bg-accent-hover transition-colors shadow-sm flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save Injection
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PRESETS TAB */}
          {activeTab === 'presets' && (
            <div className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search presets library..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-5 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-accent transition-shadow pl-11 ${
                    isDark ? 'bg-surface-raised border-stroke-subtle text-content-primary' : 'bg-white border-gray-200 text-gray-900'
                  }`}
                />
                <BookOpen className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>

              <div className="space-y-8">
                {presetCategories.length === 0 ? (
                  <div className="text-center py-12">
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No presets found matching "{searchQuery}"</p>
                  </div>
                ) : (
                  presetCategories.map(category => {
                    const categoryPresets = filteredPresets.filter(p => p.category === category);
                    return (
                      <div key={category} className="space-y-4">
                        <h3 className={`text-sm font-bold uppercase tracking-wider pl-1 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {category} <span className="text-xs font-normal ml-1 bg-gray-500/10 px-2 py-0.5 rounded-full">{categoryPresets.length}</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {categoryPresets.map((preset) => (
                            <div
                              key={preset.id}
                              className={`flex flex-col p-5 rounded-xl border hover:-translate-y-0.5 transition-all duration-200 shadow-sm ${
                                isDark ? 'bg-surface-raised border-stroke-subtle hover:border-accent/50' : 'bg-white border-gray-200 hover:border-accent/50 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <h4 className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                      {preset.name}
                                    </h4>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${getTypeBadgeColor(preset.type)}`}>
                                      {preset.type.toUpperCase()}
                                    </span>
                                  </div>
                                  <span className={`text-[10px] uppercase font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>v{preset.version}</span>
                                </div>
                                <button
                                  onClick={() => handleAddPreset(preset.id)}
                                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
                                    isDark 
                                      ? 'bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20' 
                                      : 'bg-accent/10 text-accent hover:bg-accent hover:text-white border border-transparent'
                                  }`}
                                >
                                  Add
                                </button>
                              </div>
                              <p className={`text-sm mt-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {preset.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomInjectionManager;
