import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { X, Search, Code2, Layers, Zap, BookOpen, Star, ExternalLink, Grid, List } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { enhancedTemplateService, CodeTemplate, TemplateCategory, TEMPLATE_CATEGORIES } from '../services/enhancedTemplateService';
import toast from 'react-hot-toast';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (template: { html: string; css: string; javascript: string }) => void;
}

const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  onLoadTemplate,
}) => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templateMetadata, setTemplateMetadata] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Load template metadata on mount (lazy - no code loaded)
  useEffect(() => {
    if (isOpen) {
      const metadata = enhancedTemplateService.getAllTemplatesMetadata();
      setTemplateMetadata(metadata);
      const cats = enhancedTemplateService.getCategoriesWithCounts();
      setCategories(cats);
    }
  }, [isOpen]);

  const filteredTemplates = useMemo(() => {
    let filtered = templateMetadata;

    if (searchQuery) {
      filtered = enhancedTemplateService.searchTemplates(searchQuery);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(t => t.difficulty === selectedDifficulty);
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedDifficulty, templateMetadata]);

  const handleLoadTemplate = useCallback(async (templateId: string) => {
    setIsLoading(true);
    setSelectedTemplateId(templateId);
    
    try {
      const templateCode = await enhancedTemplateService.getTemplateById(templateId);
      
      if (templateCode) {
        onLoadTemplate(templateCode);
        toast.success(`Template loaded successfully!`);
        onClose();
      } else {
        toast.error('Failed to load template');
      }
    } catch (error: any) {
      console.error('Error loading template:', error);
      toast.error(`Failed to load template: ${error.message}`);
    } finally {
      setIsLoading(false);
      setSelectedTemplateId(null);
    }
  }, [onLoadTemplate, onClose]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-500 bg-green-500/10';
      case 'intermediate': return 'text-yellow-500 bg-yellow-500/10';
      case 'advanced': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return TEMPLATE_CATEGORIES.find(c => c.id === categoryId) || {
      name: categoryId,
      icon: '📁',
      color: 'gray'
    };
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm`}>
      <div
        className={`w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
          isDark ? 'bg-matte-black border border-gray-700' : 'bg-white border border-gray-200'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-bright-white' : 'text-gray-900'}`}>
                Code Templates Library
              </h2>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {filteredTemplates.length} templates available
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className={`flex rounded-lg overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-purple-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-400'
                    : 'bg-white text-gray-600'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-purple-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-400'
                    : 'bg-white text-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
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
        </div>

        {/* Filters */}
        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Search templates by name, description, or tags..."
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
            <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({templateMetadata.length})
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{category.icon}</span>
                  {category.name} ({category.count})
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
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Templates Grid/List */}
        <div className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {filteredTemplates.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className={`p-6 rounded-full mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                <Search className={`w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                No templates found
              </h3>
              <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredTemplates.map((template) => {
                const categoryInfo = getCategoryInfo(template.category);
                const isLoadingThis = selectedTemplateId === template.id;

                return (
                  <div
                    key={template.id}
                    className={`rounded-xl overflow-hidden border transition-all hover:shadow-xl hover:scale-105 ${
                      viewMode === 'grid'
                        ? isDark
                          ? 'bg-gray-800 border-gray-700'
                          : 'bg-white border-gray-200'
                        : isDark
                        ? 'bg-gray-800 border-gray-700 p-4'
                        : 'bg-white border-gray-200 p-4'
                    }`}
                  >
                    {/* Card Header */}
                    <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-2xl">{categoryInfo.icon}</span>
                          <div className="flex-1">
                            <h3 className={`font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                              {template.name}
                            </h3>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {categoryInfo.name} • {template.subcategory}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(template.difficulty)}`}>
                          {template.difficulty}
                        </span>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {template.description}
                      </p>
                    </div>

                    {/* Tags */}
                    {viewMode === 'grid' && (
                      <div className="px-4 py-2 flex flex-wrap gap-2">
                        {template.tags.slice(0, 4).map((tag, idx) => (
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
                    )}

                    {/* Features */}
                    {viewMode === 'list' && template.features && (
                      <div className="px-4 py-2 flex flex-wrap gap-2">
                        {template.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className={`text-xs px-2 py-1 rounded-md ${
                              isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className={`p-4 flex gap-2 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <button
                        onClick={() => handleLoadTemplate(template.id)}
                        disabled={isLoadingThis}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${
                          isLoadingThis
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg'
                        } text-white`}
                      >
                        {isLoadingThis ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Code2 className="w-4 h-4" />
                            Load Template
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          toast.success('Template preview coming soon');
                        }}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                        title="Preview"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className={`px-4 py-3 border-t ${
          isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between text-sm">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Showing {filteredTemplates.length} of {templateMetadata.length} templates
            </span>
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
              Templates load on-demand for better performance
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelectorModal;
