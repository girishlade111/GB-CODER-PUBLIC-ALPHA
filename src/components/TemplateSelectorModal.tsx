import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Search,
  Code2,
  Layers,
  Download,
  Upload,
  Eye,
  FileCode,
  Check,
  Star,
  Plus,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import {
  enhancedTemplateService,
  CodeTemplate,
  TemplatePayload,
  TemplateCategoryInfo,
} from '../services/enhancedTemplateService';
import { buildProject } from '../services/bundlerService';
import { languageForPath, ProjectType, MultiFileProject } from '../types/files';
import toast from 'react-hot-toast';

export interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate?: (payload: TemplatePayload, meta: CodeTemplate) => void;
  onCreateProject?: (
    template: CodeTemplate,
    payload: TemplatePayload,
    projectName: string,
  ) => void | Promise<void>;
  currentProject?: MultiFileProject | null;
  mode?: 'create' | 'load' | 'both';
}

const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  onLoadTemplate,
  onCreateProject,
  mode = 'both',
}) => {
  const { isDark } = useTheme();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<'name' | 'difficulty'>('name');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const [previewTemplate, setPreviewTemplate] = useState<CodeTemplate | null>(null);
  const [previewPayload, setPreviewPayload] = useState<TemplatePayload | null>(null);
  const [confirmTemplate, setConfirmTemplate] = useState<CodeTemplate | null>(null);

  // Create Project state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createProjectName, setCreateProjectName] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Favorites & Recents state
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const [previewTab, setPreviewTab] = useState<'live' | 'files'>('live');
  const [bundledHtml, setBundledHtml] = useState<string | null>(null);
  const [bundlingError, setBundlingError] = useState<string | null>(null);
  const [isBundling, setIsBundling] = useState(false);

  const [templateMetadata, setTemplateMetadata] = useState<CodeTemplate[]>([]);
  const [categories, setCategories] = useState<Array<TemplateCategoryInfo & { count: number }>>([]);
  const [customTemplates, setCustomTemplates] = useState<CodeTemplate[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(() => {
    const meta = enhancedTemplateService.getAllTemplatesMetadata();
    const custom = enhancedTemplateService.getCustomTemplates();
    setTemplateMetadata([...meta, ...custom]);
    setCategories(enhancedTemplateService.getCategoriesWithCounts());
    setCustomTemplates(custom);
    setFavorites(enhancedTemplateService.getFavorites());
    setRecentIds(enhancedTemplateService.getRecentTemplateIds());
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  // Compile multi-file templates or render plain templates for interactive live preview
  useEffect(() => {
    if (!previewPayload || !previewTemplate) {
      setBundledHtml(null);
      setBundlingError(null);
      setIsBundling(false);
      return;
    }

    // Single-file plain template
    if ('html' in previewPayload) {
      setBundlingError(null);
      setIsBundling(false);
      const doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; }
    ${previewPayload.css || ''}
  </style>
</head>
<body>
  ${previewPayload.html || ''}
  <script>
    ${previewPayload.javascript || ''}
  </script>
</body>
</html>`;
      setBundledHtml(doc);
      return;
    }

    // Multi-file template (React, Vue, Next.js simulation)
    if ('files' in previewPayload) {
      let isCurrent = true;
      setIsBundling(true);
      setBundlingError(null);

      const rawType = previewTemplate.projectType;
      const projType = (rawType === 'vue' ? 'vue' : 'react') as ProjectType;
      const files = previewPayload.files.map((f: { path: string; content: string }) => ({
        path: f.path,
        content: f.content,
        language: languageForPath(f.path),
      }));
      const entry = files.find(
        (f: { path: string }) => f.path === (projType === 'vue' ? 'main.js' : 'main.jsx'),
      )?.path;

      buildProject({ projectType: projType, files, entry })
        .then((res) => {
          if (!isCurrent) return;
          if (res.code) {
            const importMapHtml =
              res.importMap && Object.keys(res.importMap).length > 0
                ? `<script type="importmap">${JSON.stringify({ imports: res.importMap })}</script>`
                : '';
            const mountNode =
              projType === 'vue' ? '<div id="app"></div>' : '<div id="root"></div>';
            const doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${importMapHtml}
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; }
    ${res.css || ''}
  </style>
</head>
<body>
  ${mountNode}
  <script type="module">
    ${res.code}
  </script>
</body>
</html>`;
            setBundledHtml(doc);
            setBundlingError(null);
          } else {
            setBundledHtml(null);
            setBundlingError('Preview bundler produced no output.');
          }
        })
        .catch((err) => {
          if (!isCurrent) return;
          setBundledHtml(null);
          setBundlingError((err as Error).message || 'Live preview failed to compile.');
        })
        .finally(() => {
          if (isCurrent) setIsBundling(false);
        });

      return () => {
        isCurrent = false;
      };
    }
  }, [previewPayload, previewTemplate]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    enhancedTemplateService.toggleFavorite(id);
    setFavorites(enhancedTemplateService.getFavorites());
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedCategory !== 'all' ||
    selectedTags.length > 0 ||
    difficultyFilter !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTags([]);
    setDifficultyFilter('all');
  };

  const filteredTemplates = useMemo(() => {
    let filtered = templateMetadata;

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q)),
      );
    }

    if (selectedCategory !== 'all') {
      if (selectedCategory === 'favorites') {
        filtered = filtered.filter((t) => favorites.includes(t.id));
      } else if (selectedCategory === 'recent') {
        filtered = filtered.filter((t) => recentIds.includes(t.id));
      } else if (selectedCategory === 'my-templates') {
        filtered = filtered.filter((t) => customTemplates.some((ct) => ct.id === t.id));
      } else {
        filtered = filtered.filter(
          (t) => t.category === selectedCategory || t.projectType === selectedCategory,
        );
      }
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter((t) => t.difficulty === difficultyFilter);
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((t) => selectedTags.some((tag) => t.tags?.includes(tag)));
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortOption === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        const diffMap: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 };
        return (diffMap[a.difficulty] || 0) - (diffMap[b.difficulty] || 0);
      }
    });

    return filtered;
  }, [
    debouncedSearch,
    selectedCategory,
    difficultyFilter,
    selectedTags,
    sortOption,
    templateMetadata,
    customTemplates,
    favorites,
    recentIds,
  ]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const handlePreview = async (template: CodeTemplate) => {
    setPreviewTemplate(template);
    if (previewPayload && previewTemplate?.id === template.id) return;
    setPreviewPayload(null);
    try {
      const payload = await enhancedTemplateService.getTemplateById(template.id);
      setPreviewPayload(payload);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectTemplate = async (template: CodeTemplate) => {
    setPreviewTemplate(template);
    let payload = previewPayload;
    if (!payload || previewTemplate?.id !== template.id) {
      const toastId = toast.loading('Loading template data...');
      try {
        payload = await enhancedTemplateService.getTemplateById(template.id);
        setPreviewPayload(payload);
        toast.dismiss(toastId);
      } catch {
        toast.error('Failed to load template data.');
        toast.dismiss(toastId);
        return;
      }
    }

    if (!payload) return;

    // Record in recents
    enhancedTemplateService.recordRecentTemplate(template.id);
    setRecentIds(enhancedTemplateService.getRecentTemplateIds());

    if (mode === 'create' || onCreateProject) {
      setCreateProjectName(template.name);
      setShowCreateDialog(true);
    } else {
      setConfirmTemplate(template);
    }
  };

  const handleConfirmCreateProject = async () => {
    if (!previewTemplate || !previewPayload || !createProjectName.trim()) return;
    setIsCreatingProject(true);
    try {
      if (onCreateProject) {
        await onCreateProject(previewTemplate, previewPayload, createProjectName.trim());
      } else if (onLoadTemplate) {
        onLoadTemplate(previewPayload, previewTemplate);
      }
      setShowCreateDialog(false);
      onClose();
    } catch (err) {
      toast.error((err as Error).message || 'Failed to create project.');
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.id && json.name && json.payload) {
          const { payload, ...meta } = json;
          enhancedTemplateService.saveCustomTemplate(meta, payload);
          toast.success('Template imported!');
          loadData();
        } else {
          toast.error('Invalid template format');
        }
      } catch {
        toast.error('Failed to parse template file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportTemplate = async (template: CodeTemplate) => {
    const payload = await enhancedTemplateService.getTemplateById(template.id);
    const data = { ...template, payload };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const compatibility = useMemo(() => {
    if (!previewTemplate) return null;
    return enhancedTemplateService.validateTemplateCompatibility(previewTemplate);
  }, [previewTemplate]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Code Templates Library"
      data-testid="template-selector-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        className={`w-full max-w-7xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
          isDark ? 'bg-surface-raised border-stroke-subtle' : 'bg-white border-gray-200'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b shrink-0 ${
            isDark ? 'border-stroke-subtle bg-surface-raised' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-subtle text-accent rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`font-sans text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Template Library
              </h2>
              <p className="text-xs text-content-muted">
                {filteredTemplates.length} of {templateMetadata.length} templates matching
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs rounded-lg border border-stroke-subtle flex items-center gap-1.5 text-content-secondary hover:text-content-primary hover:bg-surface-hover transition-colors"
              title="Import a custom JSON template"
            >
              <Upload className="w-3.5 h-3.5" /> Import
            </button>
            <button
              onClick={onClose}
              aria-label="Close modal"
              data-testid="template-selector-close"
              className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Split */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Pane: Filters & Template Grid */}
          <div
            className={`flex flex-col flex-1 border-r min-w-0 ${
              isDark ? 'border-stroke-subtle' : 'border-gray-200'
            }`}
          >
            {/* Toolbar */}
            <div className={`p-4 border-b space-y-3 shrink-0 ${isDark ? 'border-stroke-subtle' : 'border-gray-200'}`}>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-content-muted" />
                  <input
                    type="text"
                    placeholder="Search templates by name, description, category, tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="template-search-input"
                    className={`w-full pl-9 pr-8 py-2 rounded-lg text-xs outline-none transition-colors ${
                      isDark
                        ? 'bg-surface-base text-white border border-stroke-subtle focus:border-accent'
                        : 'bg-white border border-gray-300 text-gray-900 focus:border-accent'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-content-muted hover:text-content-primary"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Difficulty Selector */}
                <select
                  value={difficultyFilter}
                  onChange={(e) =>
                    setDifficultyFilter(e.target.value as 'all' | 'beginner' | 'intermediate' | 'advanced')
                  }
                  data-testid="template-difficulty-filter"
                  className={`px-3 py-2 rounded-lg text-xs outline-none border transition-colors ${
                    isDark
                      ? 'bg-surface-base border-stroke-subtle text-content-primary'
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>

                {/* Sort Option */}
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as 'name' | 'difficulty')}
                  data-testid="template-sort-select"
                  className={`px-3 py-2 rounded-lg text-xs outline-none border transition-colors ${
                    isDark
                      ? 'bg-surface-base border-stroke-subtle text-content-primary'
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                >
                  <option value="name">Sort: Name (A–Z)</option>
                  <option value="difficulty">Sort: Difficulty</option>
                </select>

                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    data-testid="template-clear-filters"
                    className="flex items-center gap-1 px-2.5 py-2 text-xs rounded-lg text-accent hover:bg-accent-subtle transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear filters
                  </button>
                )}
              </div>

              {/* Tag filters active */}
              {selectedTags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[11px] text-content-muted">Filtered tags:</span>
                  {selectedTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-accent text-accent-fg hover:bg-accent-hover transition-colors"
                    >
                      {tag} <X className="w-3 h-3" />
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedTags([])}
                    className="text-[11px] text-content-muted hover:text-accent underline"
                  >
                    Reset tags
                  </button>
                </div>
              )}

              {/* Categories Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                <button
                  onClick={() => setSelectedCategory('all')}
                  data-testid="template-category-all"
                  className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-accent text-accent-fg font-medium'
                      : 'bg-surface-hover text-content-secondary hover:text-content-primary'
                  }`}
                >
                  All ({templateMetadata.length})
                </button>

                {favorites.length > 0 && (
                  <button
                    onClick={() => setSelectedCategory('favorites')}
                    data-testid="template-category-favorites"
                    className={`px-3 py-1 text-xs rounded-full whitespace-nowrap flex items-center gap-1 transition-colors ${
                      selectedCategory === 'favorites'
                        ? 'bg-accent text-accent-fg font-medium'
                        : 'bg-surface-hover text-amber-400 hover:text-amber-300'
                    }`}
                  >
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Favorites ({favorites.length})
                  </button>
                )}

                {recentIds.length > 0 && (
                  <button
                    onClick={() => setSelectedCategory('recent')}
                    data-testid="template-category-recent"
                    className={`px-3 py-1 text-xs rounded-full whitespace-nowrap flex items-center gap-1 transition-colors ${
                      selectedCategory === 'recent'
                        ? 'bg-accent text-accent-fg font-medium'
                        : 'bg-surface-hover text-content-secondary hover:text-content-primary'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" /> Recent
                  </button>
                )}

                <button
                  onClick={() => setSelectedCategory('my-templates')}
                  data-testid="template-category-custom"
                  className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === 'my-templates'
                      ? 'bg-accent text-accent-fg font-medium'
                      : 'bg-surface-hover text-content-secondary hover:text-content-primary'
                  }`}
                >
                  Custom ({customTemplates.length})
                </button>

                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    data-testid={`template-category-${c.id}`}
                    className={`px-3 py-1 text-xs rounded-full whitespace-nowrap flex items-center gap-1 transition-colors ${
                      selectedCategory === c.id
                        ? 'bg-accent text-accent-fg font-medium'
                        : 'bg-surface-hover text-content-secondary hover:text-content-primary'
                    }`}
                  >
                    <span>{c.icon}</span> {c.name} ({c.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Template Cards List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-12 h-12 rounded-full bg-surface-hover grid place-items-center mb-3 text-content-muted">
                    <Search className="w-6 h-6 opacity-60" />
                  </div>
                  <p className="text-sm font-semibold text-content-primary">No templates found</p>
                  <p className="text-xs text-content-secondary mt-1 max-w-sm">
                    No templates matched your current search and filter settings.
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="mt-3 px-3 py-1.5 text-xs rounded-lg bg-accent text-accent-fg hover:bg-accent-hover transition-colors"
                    >
                      Reset all filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-testid="templates-grid">
                  {filteredTemplates.map((template) => {
                    const isFav = favorites.includes(template.id);
                    const isSelected = previewTemplate?.id === template.id;

                    return (
                      <div
                        key={template.id}
                        onClick={() => handlePreview(template)}
                        data-testid={`template-card-${template.id}`}
                        className={`group relative flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-accent ring-1 ring-accent bg-accent-subtle/20'
                            : 'border-stroke-subtle hover:border-stroke-strong bg-surface-base hover:bg-surface-hover'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 shrink-0 rounded-lg bg-surface-hover grid place-items-center text-xl">
                            {template.projectType === 'react'
                              ? '⚛️'
                              : template.projectType === 'vue'
                                ? '💚'
                                : template.projectType === 'nextjs'
                                  ? '▲'
                                  : '🌐'}
                          </div>
                          <div className="flex-1 min-w-0 pr-6">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm truncate text-content-primary">
                                {template.name}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded border ${
                                  template.difficulty === 'beginner'
                                    ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                                    : template.difficulty === 'intermediate'
                                      ? 'border-accent/30 text-accent bg-accent/10'
                                      : 'border-red-500/30 text-red-400 bg-red-500/10'
                                }`}
                              >
                                {template.difficulty}
                              </span>
                              <span className="text-[10px] uppercase font-mono tracking-wider text-content-muted">
                                {template.projectType}
                              </span>
                            </div>
                            <p className="text-xs text-content-secondary line-clamp-2 mt-1.5 leading-relaxed">
                              {template.description}
                            </p>
                          </div>

                          {/* Favorite Button */}
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(e, template.id)}
                            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                            data-testid={`template-fav-btn-${template.id}`}
                            className="absolute top-3.5 right-3.5 p-1 rounded-md text-content-muted hover:text-amber-400 hover:bg-surface-hover transition-colors"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                isFav ? 'fill-amber-400 text-amber-400' : 'text-content-muted'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Footer tags and select button */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-stroke-subtle">
                          <div className="flex gap-1.5 flex-wrap max-w-[70%]">
                            {template.tags?.slice(0, 3).map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTag(tag);
                                }}
                                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                                  selectedTags.includes(tag)
                                    ? 'border-accent bg-accent text-accent-fg'
                                    : 'border-stroke-subtle text-content-muted hover:border-accent hover:text-accent'
                                }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleSelectTemplate(template);
                            }}
                            data-testid={`template-select-btn-${template.id}`}
                            className="px-3 py-1 text-xs font-semibold rounded-lg bg-accent text-accent-fg hover:bg-accent-hover transition-colors whitespace-nowrap shadow-sm"
                          >
                            {mode === 'create' ? 'Use Template' : 'Select'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Live Preview & Inspection */}
          <div
            className={`hidden lg:flex flex-col w-[420px] xl:w-[480px] shrink-0 border-l ${
              isDark ? 'bg-surface-raised border-stroke-subtle' : 'bg-gray-50 border-gray-200'
            }`}
          >
            {previewTemplate ? (
              <div className="flex flex-col h-full min-w-0">
                {/* Preview Header */}
                <div
                  className={`p-4 border-b flex justify-between items-center shrink-0 ${
                    isDark ? 'border-stroke-subtle' : 'border-gray-200'
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base truncate text-content-primary">
                        {previewTemplate.name}
                      </h3>
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(e, previewTemplate.id)}
                        className="text-content-muted hover:text-amber-400"
                        title={favorites.includes(previewTemplate.id) ? 'Favorited' : 'Favorite'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            favorites.includes(previewTemplate.id)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-content-muted'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-content-secondary truncate mt-0.5">
                      {previewTemplate.subcategory || previewTemplate.category} ·{' '}
                      {previewTemplate.projectType.toUpperCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => void exportTemplate(previewTemplate)}
                    title="Export Template JSON"
                    className="p-1.5 shrink-0 rounded-lg border border-stroke-subtle text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                {/* Preview Content */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {/* Runtime Limitations Notice */}
                  {compatibility?.requiresSandbox && (
                    <div
                      className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200"
                      data-testid="template-runtime-notice"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-100">Next.js App Router Simulation</p>
                          <p className="mt-0.5 opacity-90 leading-relaxed text-[11px]">
                            {compatibility.runtimeNote}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview Tabs */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 p-0.5 rounded-lg bg-surface-base border border-stroke-subtle">
                      <button
                        type="button"
                        onClick={() => setPreviewTab('live')}
                        data-testid="preview-tab-live"
                        className={`px-3 py-1 text-xs rounded-md font-medium flex items-center gap-1.5 transition-all ${
                          previewTab === 'live'
                            ? 'bg-accent text-accent-fg shadow-sm'
                            : 'text-content-secondary hover:text-content-primary'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" /> Live Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab('files')}
                        data-testid="preview-tab-files"
                        className={`px-3 py-1 text-xs rounded-md font-medium flex items-center gap-1.5 transition-all ${
                          previewTab === 'files'
                            ? 'bg-accent text-accent-fg shadow-sm'
                            : 'text-content-secondary hover:text-content-primary'
                        }`}
                      >
                        <FileCode className="w-3.5 h-3.5" /> Files
                      </button>
                    </div>

                    <span className="text-[10px] font-mono text-content-muted">
                      {previewPayload && 'files' in previewPayload
                        ? `${previewPayload.files.length} files`
                        : '3 files'}
                    </span>
                  </div>

                  {/* Preview Viewport */}
                  <div className="aspect-[4/3] bg-white rounded-xl border border-stroke-subtle shadow-sm flex flex-col overflow-hidden relative">
                    {previewTab === 'files' ? (
                      <div className="flex-1 p-3 overflow-y-auto text-xs font-mono text-content-on-dark bg-product">
                        <div className="text-content-on-dark-soft mb-2 pb-1 border-b border-white/10 text-[11px]">
                          // Template Files
                        </div>
                        {previewPayload && 'files' in previewPayload ? (
                          previewPayload.files.map((f: { path: string }) => (
                            <div key={f.path} className="flex items-center gap-2 py-1 text-xs">
                              <FileCode className="w-3.5 h-3.5 text-accent shrink-0" />
                              <span className="truncate">{f.path}</span>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="flex items-center gap-2 py-1 text-xs">
                              <FileCode className="w-3.5 h-3.5 text-accent shrink-0" />
                              <span>index.html</span>
                            </div>
                            <div className="flex items-center gap-2 py-1 text-xs">
                              <FileCode className="w-3.5 h-3.5 text-accent shrink-0" />
                              <span>styles.css</span>
                            </div>
                            <div className="flex items-center gap-2 py-1 text-xs">
                              <FileCode className="w-3.5 h-3.5 text-accent shrink-0" />
                              <span>script.js</span>
                            </div>
                          </>
                        )}
                      </div>
                    ) : isBundling ? (
                      <div className="flex-1 flex flex-col items-center justify-center bg-gray-950 text-white gap-2.5 p-4 text-center">
                        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-gray-400">Compiling interactive preview...</span>
                      </div>
                    ) : bundlingError ? (
                      <div className="flex-1 flex flex-col items-center justify-center bg-surface-base text-content-secondary gap-2 p-6 text-center">
                        <AlertTriangle className="w-6 h-6 text-amber-400" />
                        <span className="text-xs font-medium text-content-primary">
                          Live preview unavailable
                        </span>
                        <span className="text-[11px] text-content-muted leading-relaxed">
                          {bundlingError}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPreviewTab('files')}
                          className="mt-1 text-xs text-accent underline"
                        >
                          View files structure instead
                        </button>
                      </div>
                    ) : bundledHtml ? (
                      <iframe
                        srcDoc={bundledHtml}
                        sandbox="allow-scripts allow-same-origin"
                        className="w-full h-full border-0 bg-white"
                        title="Live Template Preview"
                      />
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-xs text-content-muted">
                        Loading preview...
                      </div>
                    )}
                  </div>

                  {/* Template Details & Features */}
                  <div className="space-y-4">
                    {previewTemplate.features && previewTemplate.features.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-xs mb-2 uppercase tracking-wider text-content-secondary">
                          Key Features
                        </h4>
                        <ul className="text-xs text-content-secondary space-y-1.5">
                          {previewTemplate.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-surface-base border border-stroke-subtle text-xs">
                      <div>
                        <span className="block text-[11px] text-content-muted">Author</span>
                        <span className="font-medium text-content-primary">
                          {previewTemplate.author || 'GB Coder'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-content-muted">Recommended Editor</span>
                        <span className="font-medium text-content-primary">
                          {compatibility?.recommendedEditor === 'vscode'
                            ? 'Advanced IDE'
                            : 'Static Editor'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div
                  className={`p-4 border-t flex flex-col gap-2 shrink-0 ${
                    isDark ? 'border-stroke-subtle bg-surface-raised' : 'border-gray-200 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setCreateProjectName(previewTemplate.name);
                      setShowCreateDialog(true);
                    }}
                    data-testid="template-create-project-btn"
                    className="w-full py-2.5 bg-accent hover:bg-accent-hover text-accent-fg rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <Plus className="w-4 h-4" /> Create New Project from Template
                  </button>

                  {mode !== 'create' && onLoadTemplate && (
                    <button
                      type="button"
                      onClick={() => setConfirmTemplate(previewTemplate)}
                      data-testid="template-load-editor-btn"
                      className="w-full py-2 text-xs font-medium rounded-xl border border-stroke-subtle text-content-secondary hover:text-content-primary hover:bg-surface-hover transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Code2 className="w-3.5 h-3.5" /> Load into Current Editor
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-content-muted p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-surface-hover grid place-items-center mb-3 text-content-muted">
                  <Eye className="w-7 h-7 opacity-50" />
                </div>
                <p className="text-sm font-medium text-content-primary">Select a template</p>
                <p className="text-xs text-content-secondary mt-1 max-w-xs">
                  Choose a template from the list to inspect files, see live preview and start a project.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Overwriting Current Editor */}
      {confirmTemplate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${
              isDark ? 'bg-surface-raised border-stroke-subtle text-white' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-content-primary">Overwrite Current Editor?</h3>
                <p className="text-xs text-content-secondary mt-1 leading-relaxed">
                  Loading <strong className="text-accent">{confirmTemplate.name}</strong> will overwrite your
                  current editor buffers. Any unsaved edits will be replaced.
                </p>
              </div>
            </div>

            <p className="text-xs text-content-muted mb-5">
              Tip: Choose <strong>&quot;Create New Project&quot;</strong> instead if you want to keep your current work and
              start a fresh separate project.
            </p>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmTemplate(null)}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-stroke-subtle text-content-secondary hover:text-content-primary hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (previewPayload && onLoadTemplate) {
                    onLoadTemplate(previewPayload, confirmTemplate);
                    setConfirmTemplate(null);
                    onClose();
                  }
                }}
                disabled={!previewPayload}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-danger text-content-on-dark hover:bg-danger transition-colors disabled:opacity-50"
              >
                Yes, Overwrite & Load
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateDialog && previewTemplate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${
              isDark ? 'bg-surface-raised border-stroke-subtle text-white' : 'bg-white border-gray-200'
            }`}
          >
            <h3 className="text-base font-bold text-content-primary mb-1">Create Project from Template</h3>
            <p className="text-xs text-content-secondary mb-4 leading-relaxed">
              Create a fresh project from <strong className="text-accent">{previewTemplate.name}</strong>.
              Your existing projects are preserved.
            </p>

            <label htmlFor="template-project-name" className="block text-xs font-medium text-content-secondary mb-1.5">
              Project Name
            </label>
            <input
              id="template-project-name"
              type="text"
              value={createProjectName}
              onChange={(e) => setCreateProjectName(e.target.value)}
              data-testid="template-project-name-input"
              className="w-full px-3 py-2 text-sm rounded-lg border border-stroke-subtle bg-surface-base text-content-primary outline-none focus:border-accent mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleConfirmCreateProject();
                if (e.key === 'Escape') setShowCreateDialog(false);
              }}
            />

            {compatibility?.requiresSandbox && (
              <div className="mb-4 text-xs text-amber-300 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 leading-relaxed">
                <span className="font-semibold block mb-0.5">Runtime note:</span>
                This template uses Next.js App Router layout simulation. It renders client components in the
                browser; backend Node endpoints require a server sandbox.
              </div>
            )}

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowCreateDialog(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-stroke-subtle text-content-secondary hover:text-content-primary hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmCreateProject()}
                disabled={!createProjectName.trim() || isCreatingProject}
                data-testid="template-confirm-create-btn"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-accent text-accent-fg hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {isCreatingProject ? 'Creating...' : 'Create & Open Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelectorModal;
