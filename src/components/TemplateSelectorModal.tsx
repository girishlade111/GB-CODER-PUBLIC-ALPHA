import React, { useState, useMemo } from 'react';
import { X, Search, Code2, Layers, Zap, BookOpen, Star, ExternalLink } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { codeTemplatesService, CodeTemplate } from '../services/codeTemplatesService';
import toast from 'react-hot-toast';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (template: CodeTemplate) => void;
}

const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  onLoadTemplate,
}) => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All', icon: Layers },
    { id: 'component', label: 'Components', icon: Code2 },
    { id: 'layout', label: 'Layouts', icon: BookOpen },
    { id: 'animation', label: 'Animations', icon: Zap },
    { id: 'utility', label: 'Utilities', icon: Star },
  ];

  const difficulties = [
    { id: 'all', label: 'All Levels' },
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' },
  ];

  const filteredTemplates = useMemo(() => {
    let templates = codeTemplatesService.getTemplates();

    if (searchQuery) {
      templates = codeTemplatesService.searchTemplates(searchQuery);
    }

    if (selectedCategory !== 'all') {
      templates = templates.filter(t => t.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      templates = templates.filter(t => t.difficulty === selectedDifficulty);
    }

    return templates;
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const handleLoadTemplate = (template: CodeTemplate) => {
    onLoadTemplate(template);
    toast.success(`Loaded "${template.name}" template`);
    onClose();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-500 bg-green-500/10';
      case 'intermediate': return 'text-yellow-500 bg-yellow-500/10';
      case 'advanced': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm`}>
      <div
        className={`w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
          isDark ? 'bg-matte-black border border-gray-700' : 'bg-white border border-gray-200'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-bright-white' : 'text-gray-900'}`}>
                Code Templates
              </h2>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Pre-built templates to jumpstart your project
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark
                      ? 'bg-gray-800 text-gray-100 placeholder-gray-500'
                      : 'bg-gray-100 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  {category.label}
                </button>
              ))}
            </div>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isDark
                  ? 'bg-gray-800 text-gray-100'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {difficulties.map((diff) => (
                <option key={diff.id} value={diff.id}>
                  {diff.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {filteredTemplates.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className={`p-6 rounded-full mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                <Search className={`w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No templates found
              </h3>
              <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`rounded-xl overflow-hidden border transition-all hover:shadow-xl hover:scale-105 ${
                    isDark
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-bold text-lg ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        {template.name}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </span>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {template.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="px-4 py-2 flex flex-wrap gap-2">
                    {template.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`text-xs px-2 py-1 rounded-md ${
                          isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Preview Code Snippet */}
                  <div className={`px-4 py-3 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <pre className={`text-xs overflow-x-auto p-2 rounded ${
                      isDark ? 'bg-gray-950 text-gray-300' : 'bg-white text-gray-700 border'
                    }`}>
                      <code>{template.html.substring(0, 150)}...</code>
                    </pre>
                  </div>

                  {/* Actions */}
                  <div className="p-4 flex gap-2">
                    <button
                      onClick={() => handleLoadTemplate(template)}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      Load Template
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(template.html);
                        toast.success('HTML copied to clipboard');
                      }}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      title="Copy HTML"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className={`px-4 py-3 border-t ${
          isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {filteredTemplates.length} of {codeTemplatesService.getTemplates().length} templates
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelectorModal;
