import React, { useState, useMemo, useEffect } from 'react';
import { X, Plus, Code2, Save, Trash2, ToggleLeft, ToggleRight, Zap, BookOpen } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { customInjectionService, CustomInjection, PresetInjection } from '../services/customInjectionService';
import toast from 'react-hot-toast';

interface CustomInjectionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateInjections: (css: string, js: string) => void;
}

const CustomInjectionManager: React.FC<CustomInjectionManagerProps> = ({
  isOpen,
  onClose,
  onUpdateInjections,
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'custom' | 'presets'>('custom');
  const [customInjections, setCustomInjections] = useState<CustomInjection[]>([]);
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newInjection, setNewInjection] = useState<Partial<CustomInjection>>({
    name: '',
    type: 'css',
    code: '',
    description: '',
    enabled: true,
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Load custom injections when modal opens
  useEffect(() => {
    if (isOpen) {
      const injections = customInjectionService.getCustomInjections();
      setCustomInjections(injections);
    }
  }, [isOpen]);

  const filteredPresets = useMemo(() => {
    if (!searchQuery) return customInjectionService.getPresetInjections();
    return customInjectionService.searchPresets(searchQuery);
  }, [searchQuery]);

  const handleAddInjection = () => {
    if (!newInjection.name || !newInjection.code) {
      toast.error('Please fill in all required fields');
      return;
    }

    const added = customInjectionService.addInjection({
      name: newInjection.name!,
      type: newInjection.type as 'css' | 'js',
      code: newInjection.code!,
      description: newInjection.description,
      enabled: newInjection.enabled ?? true,
    });

    // Reload injections from service
    const updatedInjections = customInjectionService.getCustomInjections();
    setCustomInjections(updatedInjections);
    setIsAddingNew(false);
    setNewInjection({ name: '', type: 'css', code: '', description: '', enabled: true });
    toast.success('Custom injection added');
  };

  const handleToggleInjection = (id: string) => {
    customInjectionService.toggleInjection(id);
    const updatedInjections = customInjectionService.getCustomInjections();
    setCustomInjections(updatedInjections);
  };

  const handleDeleteInjection = (id: string) => {
    customInjectionService.deleteInjection(id);
    const updatedInjections = customInjectionService.getCustomInjections();
    setCustomInjections(updatedInjections);
    toast.success('Injection deleted');
  };

  const handleTogglePreset = (id: string) => {
    setSelectedPresets(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleApplyInjections = () => {
    const { css, js } = customInjectionService.generateInjectionCode(
      customInjections,
      selectedPresets
    );
    onUpdateInjections(css, js);
    toast.success('Injections applied to preview');
    onClose();
  };

  const handleClose = () => {
    // Reset state when closing
    setIsAddingNew(false);
    setSearchQuery('');
    onClose();
  };

  const presetCategories = ['animation', 'debug', 'utility', 'accessibility'] as const;

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm`} onClick={handleClose}>
      <div
        className={`w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
          isDark ? 'bg-matte-black border border-gray-700' : 'bg-white border border-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-bright-white' : 'text-gray-900'}`}>
                Custom Code Injection
              </h2>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Add custom CSS/JS to your preview
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyInjections}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              Apply
            </button>
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
              }`}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'custom'
                ? 'border-b-2 border-purple-500 text-purple-500'
                : isDark
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Custom ({customInjections.length})
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'presets'
                ? 'border-b-2 border-purple-500 text-purple-500'
                : isDark
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Presets ({filteredPresets.length})
          </button>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} onClick={(e) => e.stopPropagation()}>
          {activeTab === 'custom' ? (
            <div className="space-y-4">
              {/* Add New Button */}
              {!isAddingNew && (
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="w-full p-4 border-2 border-dashed rounded-xl border-gray-600 text-gray-400 hover:border-purple-500 hover:text-purple-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Custom Injection
                </button>
              )}

              {/* Add New Form */}
              {isAddingNew && (
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white border'}`}>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Name *
                        </label>
                        <input
                          type="text"
                          value={newInjection.name}
                          onChange={(e) => setNewInjection({ ...newInjection, name: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            isDark ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'
                          }`}
                          placeholder="My Custom Style"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Type *
                        </label>
                        <select
                          value={newInjection.type}
                          onChange={(e) => setNewInjection({ ...newInjection, type: e.target.value as 'css' | 'js' })}
                          className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            isDark ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <option value="css">CSS</option>
                          <option value="js">JavaScript</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Description
                      </label>
                      <input
                        type="text"
                        value={newInjection.description}
                        onChange={(e) => setNewInjection({ ...newInjection, description: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          isDark ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'
                        }`}
                        placeholder="What does this injection do?"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Code *
                      </label>
                      <textarea
                        value={newInjection.code}
                        onChange={(e) => setNewInjection({ ...newInjection, code: e.target.value })}
                        rows={6}
                        className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm ${
                          isDark ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'
                        }`}
                        placeholder={newInjection.type === 'css' ? '.my-class { color: red; }' : 'console.log("Hello");'}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setIsAddingNew(false)}
                        className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddInjection}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg"
                      >
                        Save Injection
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Injections List */}
              {customInjections.map((injection) => (
                <div
                  key={injection.id}
                  className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white border'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Code2 className={`w-5 h-5 ${injection.type === 'css' ? 'text-blue-500' : 'text-yellow-500'}`} />
                      <div>
                        <h3 className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                          {injection.name}
                        </h3>
                        {injection.description && (
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {injection.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleInjection(injection.id)}
                        className={`p-1 rounded ${injection.enabled ? 'text-green-500' : 'text-gray-500'}`}
                        title={injection.enabled ? 'Disable' : 'Enable'}
                      >
                        {injection.enabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                      </button>
                      <button
                        onClick={() => handleDeleteInjection(injection.id)}
                        className={`p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors`}
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <pre className={`p-3 rounded-lg overflow-x-auto text-sm ${
                    isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    <code>{injection.code.substring(0, 200)}{injection.code.length > 200 ? '...' : ''}</code>
                  </pre>
                </div>
              ))}

              {customInjections.length === 0 && !isAddingNew && (
                <div className="text-center py-12">
                  <Code2 className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    No custom injections yet. Add your first one!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search */}
              <input
                type="text"
                placeholder="Search presets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDark ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-900'
                }`}
              />

              {/* Presets by Category */}
              {presetCategories.map((category) => {
                const categoryPresets = filteredPresets.filter(p => p.category === category);
                if (categoryPresets.length === 0) return null;

                return (
                  <div key={category}>
                    <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {category}
                    </h3>
                    <div className="grid gap-3">
                      {categoryPresets.map((preset) => (
                        <div
                          key={preset.id}
                          className={`p-4 rounded-xl ${
                            selectedPresets.includes(preset.id)
                              ? 'border-2 border-purple-500'
                              : isDark
                              ? 'bg-gray-800 border border-gray-700'
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <BookOpen className="w-4 h-4 text-purple-500" />
                                <h4 className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                  {preset.name}
                                </h4>
                              </div>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {preset.description}
                              </p>
                            </div>
                            <button
                              onClick={() => handleTogglePreset(preset.id)}
                              className={`ml-4 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                selectedPresets.includes(preset.id)
                                  ? 'bg-purple-500 text-white'
                                  : isDark
                                  ? 'bg-gray-700 text-gray-300'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {selectedPresets.includes(preset.id) ? 'Added' : 'Add'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {filteredPresets.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    No presets found matching your search
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className={`px-4 py-3 border-t ${
          isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between text-sm">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Active: {customInjections.filter(i => i.enabled).length} custom + {selectedPresets.length} presets
            </span>
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
              Changes will be applied to the preview
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomInjectionManager;
