import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Trash2, ExternalLink, Copy, Check } from 'lucide-react';
import { ExternalLibrary } from '../services/externalLibraryService';

interface ExternalLibraryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  libraries: ExternalLibrary[];
  onLibrariesChange: (libraries: ExternalLibrary[]) => void;
}

// Popular libraries with their CDN URLs
const popularLibraries = [
  { name: 'Bootstrap', url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css', type: 'css' as const, description: 'CSS Framework' },
  { name: 'Tailwind CSS', url: 'https://cdn.tailwindcss.com', type: 'css' as const, description: 'Utility-first CSS Framework' },
  { name: 'jQuery', url: 'https://code.jquery.com/jquery-3.7.1.min.js', type: 'js' as const, description: 'JavaScript Library' },
  { name: 'React', url: 'https://unpkg.com/react@18/umd/react.development.js', type: 'js' as const, description: 'JavaScript Library' },
  { name: 'Vue.js', url: 'https://unpkg.com/vue@3/dist/vue.global.js', type: 'js' as const, description: 'JavaScript Framework' },
  { name: 'Font Awesome', url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css', type: 'css' as const, description: 'Icon Library' },
  { name: 'Chart.js', url: 'https://cdn.jsdelivr.net/npm/chart.js', type: 'js' as const, description: 'JavaScript Charting' },
  { name: 'AOS (Animate On Scroll)', url: 'https://unpkg.com/aos@2.3.1/dist/aos.css', type: 'css' as const, description: 'CSS Animation Library' },
  { name: 'AOS JS', url: 'https://unpkg.com/aos@2.3.1/dist/aos.js', type: 'js' as const, description: 'JavaScript Animation Library' },
  { name: 'SweetAlert2', url: 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css', type: 'css' as const, description: 'JavaScript Alert Library' },
  { name: 'SweetAlert2 JS', url: 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js', type: 'js' as const, description: 'JavaScript Alert Library' },
];

const ExternalLibraryManager: React.FC<ExternalLibraryManagerProps> = ({
  isOpen,
  onClose,
  libraries,
  onLibrariesChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customType, setCustomType] = useState<'css' | 'js'>('css');
  const [filteredLibraries, setFilteredLibraries] = useState(popularLibraries);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (searchTerm) {
      const filtered = popularLibraries.filter(lib =>
        lib.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lib.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLibraries(filtered);
    } else {
      setFilteredLibraries(popularLibraries);
    }
  }, [searchTerm]);

  const addLibrary = (library: { name: string; url: string; type: 'css' | 'js'; description?: string }) => {
    const newLibrary: ExternalLibrary = {
      id: Date.now().toString(),
      name: library.name,
      url: library.url,
      type: library.type,
      description: library.description,
      addedAt: new Date().toISOString(),
    };
    onLibrariesChange([...libraries, newLibrary]);
  };

  const removeLibrary = (id: string) => {
    onLibrariesChange(libraries.filter(lib => lib.id !== id));
  };

  const addCustomLibrary = () => {
    if (customUrl.trim()) {
      addLibrary({
        name: `Custom ${customType.toUpperCase()}`,
        url: customUrl.trim(),
        type: customType,
        description: 'Custom library',
      });
      setCustomUrl('');
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isLibraryAdded = (url: string) => {
    return libraries.some(lib => lib.url === url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-bright-white dark:bg-dark-gray rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-sans text-xl font-medium text-gray-900 dark:text-bright-white">
            External Library Manager
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-full max-h-[calc(90vh-5rem)]">
          {/* Left Panel - Add Libraries */}
          <div className="flex-1 p-6 border-r border-gray-200 dark:border-gray-700">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-bright-white mb-4">
                Add Libraries
              </h3>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search libraries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-gray text-gray-900 dark:text-bright-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Custom Library Input */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Add Custom Library
                </h4>
                <div className="flex gap-2">
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value as 'css' | 'js')}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-gray text-gray-900 dark:text-bright-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="css">CSS</option>
                    <option value="js">JavaScript</option>
                  </select>
                  <input
                    type="url"
                    placeholder="Enter library URL..."
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-gray text-gray-900 dark:text-bright-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={addCustomLibrary}
                    disabled={!customUrl.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* Popular Libraries */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredLibraries.map((lib) => (
                  <div
                    key={lib.url}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-gray transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-bright-white">
                            {lib.name}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${lib.type === 'css'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                            {lib.type.toUpperCase()}
                          </span>
                        </div>
                        {lib.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {lib.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-100 dark:bg-dark-gray px-2 py-1 rounded text-gray-800 dark:text-bright-white flex-1 truncate">
                            {lib.url}
                          </code>
                          <button
                            onClick={() => copyToClipboard(lib.url)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Copy URL"
                          >
                            {copiedUrl === lib.url ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => addLibrary(lib)}
                        disabled={isLibraryAdded(lib.url)}
                        className="ml-4 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        {isLibraryAdded(lib.url) ? 'Added' : 'Add'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Current Libraries */}
          <div className="flex-1 p-6 overflow-hidden">
            <h3 className="text-lg font-medium text-gray-900 dark:text-bright-white mb-4">
              Current Libraries ({libraries.length})
            </h3>

            {libraries.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-dark-gray rounded-full flex items-center justify-center">
                  <ExternalLink className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  No external libraries added yet.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Add libraries from the left panel to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(90vh-12rem)] overflow-y-auto pr-2">
                {libraries.map((lib) => (
                  <div
                    key={lib.id}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-gray transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="font-medium text-gray-900 dark:text-bright-white">
                            {lib.name}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${lib.type === 'css'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                            {lib.type.toUpperCase()}
                          </span>
                        </div>
                        <code className="text-xs bg-gray-100 dark:bg-dark-gray px-2 py-1 rounded text-gray-800 dark:text-bright-white block break-all leading-relaxed">
                          {lib.url}
                        </code>
                      </div>
                      <button
                        onClick={() => removeLibrary(lib.id)}
                        className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove library"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalLibraryManager;