import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { X, Search, Code2, Layers, ExternalLink, Grid, List } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { enhancedTemplateService, TemplateCategory, TEMPLATE_CATEGORIES } from '../services/enhancedTemplateService';
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

  // Escape to dismiss, matching the other modals.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [, setIsLoading] = useState(false);
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
        className={`w-full max-w-7xl h-[90vh] rounded-lg shadow-elevated flex flex-col overflow-hidden ${
          isDark ? 'bg-surface-raised border border-stroke-subtle' : 'bg-white border border-gray-200'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-stroke-subtle bg-surface-raised' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-subtle text-accent-hover rounded-md">
              <Layers className="w-5 h-5" />
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
                    ? 'bg-accent text-accent-fg'
                    : isDark
                    ? 'bg-surface-overlay text-content-secondary'
                    : 'bg-white text-gray-600'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-accent text-accent-fg'
                    : isDark
                    ? 'bg-surface-overlay text-content-secondary'
                    : 'bg-white text-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={onClose}
              title="Close"
              aria-label="Close template library"
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-white/5 text-content-secondary hover:text-content-primary' : 'hover:bg-gray-200 text-gray-600'
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
            <div className="w-full shrink-0 lg:w-72">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Search templates by name, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent ${
                    isDark
                      ? 'bg-surface-overlay text-content-primary placeholder-content-muted'
                      : 'bg-gray-100 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex min-w-0 flex-1 flex-wrap gap-2 max-h-32 overflow-y-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-accent text-accent-fg'
                    : isDark
                    ? 'bg-surface-overlay text-content-secondary hover:bg-white/5 hover:text-content-primary'
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
                      ? 'bg-accent text-accent-fg'
                      : isDark
                      ? 'bg-surface-overlay text-content-secondary hover:bg-white/5 hover:text-content-primary'
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
              className={`px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent ${
                isDark
                  ? 'bg-surface-overlay text-content-primary'
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
        <div className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-surface-raised' : 'bg-gray-50'}`}>
          {filteredTemplates.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className={`p-6 rounded-full mb-4 ${isDark ? 'bg-surface-overlay' : 'bg-gray-200'}`}>
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
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {filteredTemplates.map((template) => {
                const categoryInfo = getCategoryInfo(template.category);
                const isLoadingThis = selectedTemplateId === template.id;

                return (
                  <div
                    key={template.id}
                    className={`flex flex-col rounded-lg overflow-hidden border transition-colors hover:border-accent/50 ${
                      viewMode === 'grid'
                        ? isDark
                          ? 'bg-surface-overlay border-stroke-subtle'
                          : 'bg-white border-gray-200'
                        : isDark
                        ? 'bg-surface-overlay border-stroke-subtle p-4'
                        : 'bg-white border-gray-200 p-4'
                    }`}
                  >
                    {/* Card Header */}
                    <div className={`flex-1 p-3 border-b ${isDark ? 'border-stroke-subtle' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-2xl">{categoryInfo.icon}</span>
                          <div className="flex-1">
                            <h3 className={`text-sm font-semibold ${isDark ? 'text-content-primary' : 'text-gray-900'}`}>
                              {template.name}
                            </h3>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {categoryInfo.name} • {template.subcategory}
                            </p>
                          </div>
                        </div>
                        <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded-sm font-medium ${getDifficultyColor(template.difficulty)}`}>
                          {template.difficulty}
                        </span>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {template.description}
                      </p>
                    </div>

                    {/* Tags */}
                    {viewMode === 'grid' && (
                      <div className="px-3 py-2 flex flex-wrap gap-1">
                        {template.tags.slice(0, 4).map((tag, idx) => (
                          <span
                            key={idx}
                            className={`text-[11px] leading-4 px-1.5 py-0.5 rounded-sm font-medium ${
                              isDark
                                ? 'bg-white/[0.07] text-content-secondary'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Features */}
                    {viewMode === 'list' && template.features && (
                      <div className="px-3 py-2 flex flex-wrap gap-1">
                        {template.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className={`text-[11px] leading-4 px-1.5 py-0.5 rounded-sm font-medium ${
                              isDark ? 'bg-accent-subtle text-accent-hover' : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className={`mt-auto p-3 flex gap-2 ${isDark ? 'bg-surface-raised' : 'bg-gray-50'}`}>
                      <button
                        onClick={() => handleLoadTemplate(template.id)}
                        disabled={isLoadingThis}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                          isLoadingThis
                            ? 'bg-surface-hover text-content-muted cursor-not-allowed'
                            : 'bg-accent text-accent-fg hover:bg-accent-hover'
                        }`}
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
          isDark ? 'border-stroke-subtle bg-surface-raised' : 'border-gray-200 bg-gray-50'
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
