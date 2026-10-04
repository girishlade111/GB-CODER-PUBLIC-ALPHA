import React, { useState, useRef, useMemo } from 'react';
import {
  Save,
  FolderOpen,
  Download,
  Trash2,
  Upload,
  Edit3,
  X,
  Check,
  AlertCircle,
  Archive,
  Code2,
  FileCode,
  Palette,
  Globe,
  ChevronDown,
  Sparkles,
  Plus,
  Search,
  Grid,
  List,
  Zap
} from 'lucide-react';
import { CodeSnippet, SnippetType, SnippetScope } from '../types';
import {
  exportSnippetAsJSON,
  importSnippetFromJSON,
  exportAllSnippets,
  searchSnippets,
  sortSnippets,
  filterByType,
  detectSnippetType,
  getRecommendedSnippets
} from '../utils/snippetUtils';

interface SnippetManagerProps {
  snippets: CodeSnippet[];
  onSave: (name: string, html: string, css: string, javascript: string, description?: string, tags?: string[], category?: string, type?: SnippetType, scope?: SnippetScope) => void;
  onLoad: (snippet: CodeSnippet) => void;
  onInsert: (snippet: CodeSnippet) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CodeSnippet>) => void;
  currentCode: {
    html: string;
    css: string;
    javascript: string;
  };
  viewMode?: 'inline' | 'sidebar';
  activeTab?: 'list' | 'create';
  onTabChange?: (tab: 'list' | 'create') => void;
}

type SortOption = 'name' | 'date' | 'updated';

const SnippetManager: React.FC<SnippetManagerProps> = ({
  snippets,
  onSave,
  onLoad,
  onInsert,
  onDelete,
  onUpdate,
  currentCode,
  viewMode = 'inline',
  activeTab = 'list',
  onTabChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<CodeSnippet | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<SnippetType | 'all'>('all');
  const [showRecommended, setShowRecommended] = useState(false);
  const [viewLayout, setViewLayout] = useState<'list' | 'grid'>('list');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Form states
  const [snippetName, setSnippetName] = useState('');
  const [snippetDescription, setSnippetDescription] = useState('');
  const [snippetTags, setSnippetTags] = useState('');
  const [snippetCategory, setSnippetCategory] = useState('');
  const [snippetType, setSnippetType] = useState<SnippetType>('full');
  const [snippetScope, setSnippetScope] = useState<SnippetScope>('private');

  // Import/Export states
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  // Dropdown states for snippet actions
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get recommended snippets
  const recommendedSnippets = useMemo(() => getRecommendedSnippets(), []);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    snippets.forEach(s => s.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [snippets]);

  // Filter and sort snippets
  const filteredSnippets = useMemo(() => {
    let filtered = searchSnippets(snippets, searchQuery);

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(snippet => snippet.category === selectedCategory);
    }

    if (selectedTag !== 'all') {
      filtered = filtered.filter(snippet => snippet.tags?.includes(selectedTag));
    }

    filtered = filterByType(filtered, typeFilter);

    return sortSnippets(filtered, sortBy);
  }, [snippets, searchQuery, selectedCategory, selectedTag, sortBy, typeFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(snippets.map(s => s.category).filter(Boolean))];
    return ['all', ...cats];
  }, [snippets]);

  const resetForm = () => {
    setSnippetName('');
    setSnippetDescription('');
    setSnippetTags('');
    setSnippetCategory('');
    setSnippetType('full');
    setSnippetScope('private');
    setEditingSnippet(null);
  };

  const handleSave = () => {
    if (snippetName.trim()) {
      const tags = snippetTags.split(',').map(tag => tag.trim()).filter(Boolean);

      if (editingSnippet) {
        // Update existing snippet
        onUpdate(editingSnippet.id, {
          name: snippetName.trim(),
          description: snippetDescription.trim() || undefined,
          tags: tags.length > 0 ? tags : undefined,
          category: snippetCategory.trim() || undefined,
          html: currentCode.html,
          css: currentCode.css,
          javascript: currentCode.javascript,
          type: snippetType,
          scope: snippetScope,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Create new snippet
        onSave(
          snippetName.trim(),
          currentCode.html,
          currentCode.css,
          currentCode.javascript,
          snippetDescription.trim() || undefined,
          tags.length > 0 ? tags : undefined,
          snippetCategory.trim() || undefined,
          snippetType,
          snippetScope
        );
      }

      resetForm();
      setIsModalOpen(false);
      if (viewMode === 'sidebar' && onTabChange) {
        onTabChange('list');
      }
    }
  };

  const handleEdit = (snippet: CodeSnippet) => {
    setEditingSnippet(snippet);
    setSnippetName(snippet.name);
    setSnippetDescription(snippet.description || '');
    setSnippetTags(snippet.tags?.join(', ') || '');
    setSnippetCategory(snippet.category || '');
    setSnippetType(snippet.type || detectSnippetType(snippet));
    setSnippetScope(snippet.scope || 'private');

    if (viewMode === 'sidebar' && onTabChange) {
      onTabChange('create');
    } else {
      setIsModalOpen(true);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);

    try {
      const snippet = await importSnippetFromJSON(file);
      onSave(
        snippet.name,
        snippet.html,
        snippet.css,
        snippet.javascript,
        snippet.description,
        snippet.tags,
        snippet.category,
        snippet.type || detectSnippetType(snippet),
        snippet.scope || 'private'
      );
      setImportSuccess(`Successfully imported "${snippet.name}"`);
      setTimeout(() => setImportSuccess(null), 3000);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed');
      setTimeout(() => setImportError(null), 5000);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportAll = () => {
    exportAllSnippets(snippets);
  };

  // Render Create/Edit Form
  const renderForm = () => (
    <div className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium text-content-on-dark-soft mb-1">
          Name *
        </label>
        <input
          type="text"
          value={snippetName}
          onChange={(e) => setSnippetName(e.target.value)}
          className="w-full bg-product-elevated border border-stroke-dark rounded-md px-3 py-2 text-content-on-dark focus:outline-none focus:border-accent"
          placeholder="My Awesome Snippet"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-content-on-dark-soft mb-1">
          Description
        </label>
        <textarea
          value={snippetDescription}
          onChange={(e) => setSnippetDescription(e.target.value)}
          className="w-full bg-product-elevated border border-stroke-dark rounded-md px-3 py-2 text-content-on-dark focus:outline-none focus:border-accent h-20 resize-none"
          placeholder="What does this snippet do?"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-content-on-dark-soft mb-1">
            Type *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['full', 'html', 'css', 'javascript'] as SnippetType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSnippetType(type)}
                className={`px-2 py-1.5 text-xs rounded-md border transition-colors ${snippetType === type
                  ? 'bg-accent/15 border-accent text-accent'
                  : 'bg-product-elevated border-stroke-dark text-content-on-dark-soft hover:border-stroke-dark-strong'
                  }`}
              >
                {type === 'full' ? 'Full Page' : type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-content-on-dark-soft mb-1">
            Scope *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['private', 'public'] as SnippetScope[]).map((scope) => (
              <button
                key={scope}
                onClick={() => setSnippetScope(scope)}
                className={`px-2 py-1.5 text-xs rounded-md border transition-colors ${snippetScope === scope
                  ? 'bg-accent/15 border-accent text-accent'
                  : 'bg-product-elevated border-stroke-dark text-content-on-dark-soft hover:border-stroke-dark-strong'
                  }`}
              >
                {scope.charAt(0).toUpperCase() + scope.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-content-on-dark-soft mb-1">
            Category
          </label>
          <input
            type="text"
            value={snippetCategory}
            onChange={(e) => setSnippetCategory(e.target.value)}
            className="w-full bg-product-elevated border border-stroke-dark rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="e.g., UI, Logic"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-content-on-dark-soft mb-1">
            Tags
          </label>
          <input
            type="text"
            value={snippetTags}
            onChange={(e) => setSnippetTags(e.target.value)}
            className="w-full bg-product-elevated border border-stroke-dark rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="comma, separated"
          />
        </div>
      </div>

      <div className="pt-4 flex gap-3">
        {editingSnippet && (
          <button
            onClick={() => {
              resetForm();
              if (viewMode === 'sidebar' && onTabChange) onTabChange('list');
              else setIsModalOpen(false);
            }}
            className="flex-1 px-4 py-2 bg-product-elevated text-white rounded hover:bg-product-active transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!snippetName.trim()}
          className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 ${!snippetName.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          <Save className="w-4 h-4" />
          {editingSnippet ? 'Update Snippet' : 'Save Snippet'}
        </button>
      </div>
    </div>
  );

  // Render Snippet List
  const renderList = () => (
    <div className="space-y-4 p-4">
      {/* Search and Filter */}
      <div className="space-y-3 sticky top-0 bg-product z-10 pb-2">
        {/* Enhanced Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-on-dark-soft" />
          <input
            type="text"
            placeholder="Search snippets by name, tags, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-product-elevated border border-stroke-dark rounded-lg pl-9 pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-product-active rounded text-content-on-dark-soft hover:text-white transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Tag Filters */}
        {allTags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-content-on-dark-soft uppercase tracking-wider">Filter by Tag</span>
              {selectedTag !== 'all' && (
                <button
                  onClick={() => setSelectedTag('all')}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${selectedTag === 'all'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-product-elevated text-content-on-dark-soft border border-stroke-dark hover:border-gray-600 hover:text-content-on-dark'
                  }`}
              >
                All Tags
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${selectedTag === tag
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-product-elevated text-content-on-dark-soft border border-stroke-dark hover:border-gray-600 hover:text-content-on-dark'
                    }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters and View Toggle */}
        <div className="flex gap-2 items-center">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as SnippetType | 'all')}
              className="bg-product-elevated border border-stroke-dark rounded px-2 py-1.5 text-xs text-content-on-dark focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="full">Full Page</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="javascript">JavaScript</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-product-elevated border border-stroke-dark rounded px-2 py-1.5 text-xs text-content-on-dark focus:outline-none focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-product-elevated border border-stroke-dark rounded px-2 py-1.5 text-xs text-content-on-dark focus:outline-none focus:border-blue-500"
            >
              <option value="updated">Recent</option>
              <option value="date">Newest</option>
              <option value="name">Name</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 bg-product-elevated border border-stroke-dark rounded p-1">
            <button
              onClick={() => setViewLayout('list')}
              className={`p-1.5 rounded transition-colors ${viewLayout === 'list'
                  ? 'bg-product-active text-white'
                  : 'text-content-on-dark-soft hover:text-white'
                }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded transition-colors ${viewLayout === 'grid'
                  ? 'bg-product-active text-white'
                  : 'text-content-on-dark-soft hover:text-white'
                }`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Recommended Toggle */}
        <button
          onClick={() => setShowRecommended(!showRecommended)}
          className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors w-full justify-center py-1 border border-blue-900/30 rounded bg-blue-900/10"
        >
          <Sparkles className="w-3 h-3" />
          {showRecommended ? 'Hide Recommended' : 'Show Recommended Snippets'}
        </button>
      </div>

      {/* Recommended Snippets Section */}
      {showRecommended && (
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-semibold text-content-on-dark-soft uppercase tracking-wider pl-1">Recommended</h3>
          <div className={viewLayout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-3'}>
            {recommendedSnippets.map((snippet) => (
              <div key={snippet.id} className="bg-product-soft border border-stroke-dark/50 rounded-lg p-3 hover:border-blue-500/50 transition-colors group">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-blue-900/20 rounded text-blue-400">
                      <Sparkles className="w-3 h-3" />
                    </span>
                    <div>
                      <h4 className="font-medium text-white text-sm">{snippet.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-product-active text-content-on-dark">
                          {snippet.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onSave(
                        snippet.name,
                        snippet.html,
                        snippet.css,
                        snippet.javascript,
                        snippet.description,
                        snippet.tags,
                        snippet.category,
                        snippet.type,
                        snippet.scope
                      );
                      setShowRecommended(false);
                    }}
                    className="p-1.5 hover:bg-blue-600 rounded text-content-on-dark-soft hover:text-white transition-colors"
                    title="Add to My Snippets"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {snippet.description && (
                  <p className="text-xs text-content-on-dark-soft line-clamp-2 mb-2">{snippet.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Snippet List */}
      <div className={viewLayout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-3'}>
        {filteredSnippets.length === 0 ? (
          <div className="text-center py-8 text-content-on-dark-soft col-span-full">
            <p>No snippets found</p>
            {(searchQuery || selectedTag !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag('all');
                }}
                className="mt-2 text-sm text-blue-400 hover:text-blue-300"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filteredSnippets.map((snippet) => (
            <div
              key={snippet.id}
              className="bg-product-elevated border border-stroke-dark rounded-lg p-3 hover:border-gray-600 transition-all group relative"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded ${snippet.type === 'html' ? 'bg-orange-900/20 text-orange-400' :
                    snippet.type === 'css' ? 'bg-blue-900/20 text-blue-400' :
                      snippet.type === 'javascript' ? 'bg-yellow-900/20 text-yellow-400' :
                        'bg-purple-900/20 text-purple-400'
                    }`}>
                    {snippet.type === 'html' ? <FileCode className="w-3 h-3" /> :
                      snippet.type === 'css' ? <Palette className="w-3 h-3" /> :
                        snippet.type === 'javascript' ? <Code2 className="w-3 h-3" /> :
                          <Globe className="w-3 h-3" />}
                  </span>
                  <div>
                    <h4 className="font-medium text-white text-sm">{snippet.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${snippet.scope === 'public'
                        ? 'border-green-900/30 bg-green-900/10 text-green-400'
                        : 'border-stroke-dark bg-product-elevated text-content-on-dark-soft'
                        }`}>
                        {snippet.scope || 'private'}
                      </span>
                      <span className="text-[10px] text-content-on-dark-soft">
                        {new Date(snippet.updatedAt || snippet.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Menu Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setOpenActionMenu(openActionMenu === snippet.id ? null : snippet.id)}
                    className="p-1 hover:bg-product-active rounded text-content-on-dark-soft hover:text-white transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {openActionMenu === snippet.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-product border border-stroke-dark rounded-lg shadow-xl z-20 py-1">
                      <button
                        onClick={() => {
                          onLoad(snippet);
                          setOpenActionMenu(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-content-on-dark hover:bg-product-elevated hover:text-white flex items-center gap-2"
                      >
                        <Archive className="w-4 h-4" />
                        Replace All
                      </button>
                      <button
                        onClick={() => {
                          onInsert(snippet);
                          setOpenActionMenu(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-content-on-dark hover:bg-product-elevated hover:text-white flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Insert Code
                      </button>
                      <div className="h-px bg-product-elevated my-1" />
                      <button
                        onClick={() => {
                          handleEdit(snippet);
                          setOpenActionMenu(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-content-on-dark hover:bg-product-elevated hover:text-white flex items-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          exportSnippetAsJSON(snippet);
                          setOpenActionMenu(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-content-on-dark hover:bg-product-elevated hover:text-white flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                      <div className="h-px bg-product-elevated my-1" />
                      <button
                        onClick={() => {
                          onDelete(snippet.id);
                          setOpenActionMenu(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {snippet.description && (
                <p className="text-xs text-content-on-dark-soft line-clamp-2 mb-2">{snippet.description}</p>
              )}

              {snippet.tags && snippet.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {snippet.tags.map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTag(tag)}
                      className="text-[10px] px-1.5 py-0.5 bg-product-active text-content-on-dark-soft rounded hover:bg-product-active hover:text-white transition-colors"
                      title={`Filter by #${tag}`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Actions with Quick Insert Button */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => onLoad(snippet)}
                  className="flex-1 py-1.5 text-xs bg-product-active hover:bg-gray-600 text-white rounded transition-colors"
                >
                  Replace
                </button>
                <button
                  onClick={() => onInsert(snippet)}
                  className="flex-1 py-1.5 px-2 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors font-medium flex items-center justify-center gap-1 shadow-lg shadow-green-600/20"
                  title="Quick insert snippet code"
                >
                  <Zap className="w-3 h-3" />
                  Quick Insert
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // If in sidebar mode, render based on active tab
  if (viewMode === 'sidebar') {
    return activeTab === 'create' ? renderForm() : renderList();
  }

  // Inline mode (Original UI)
  return (
    <div className="bg-product-elevated rounded-lg border border-stroke-dark overflow-hidden">
      {/* Header Actions */}
      <div className="p-4 border-b border-stroke-dark flex flex-wrap gap-2">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Snippet
        </button>
        <button
          onClick={() => setShowSnippets(!showSnippets)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${showSnippets ? 'bg-product-active text-white' : 'bg-product-elevated text-content-on-dark hover:bg-product-active'
            }`}
        >
          <FolderOpen className="w-4 h-4" />
          {showSnippets ? 'Hide Snippets' : 'My Snippets'}
        </button>
        <button
          onClick={handleExportAll}
          className="flex items-center gap-2 px-3 py-1.5 bg-product-elevated text-content-on-dark hover:bg-product-active rounded text-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          Export All
        </button>
        <label className="flex items-center gap-2 px-3 py-1.5 bg-product-elevated text-content-on-dark hover:bg-product-active rounded text-sm transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          Import
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>

      {/* Import Status Messages */}
      {importError && (
        <div className="px-4 py-2 bg-red-900/20 border-b border-red-900/30 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {importError}
        </div>
      )}
      {importSuccess && (
        <div className="px-4 py-2 bg-green-900/20 border-b border-green-900/30 text-green-400 text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          {importSuccess}
        </div>
      )}

      {/* Save Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-product border border-stroke-dark rounded-lg w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-stroke-dark">
              <h3 className="text-lg font-semibold text-white">
                {editingSnippet ? 'Edit Snippet' : 'Save New Snippet'}
              </h3>
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(false);
                }}
                className="text-content-on-dark-soft hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderForm()}
          </div>
        </div>
      )}

      {/* Snippet List (Inline) */}
      {showSnippets && (
        <div className="border-t border-stroke-dark">
          {renderList()}
        </div>
      )}
    </div>
  );
};

export default SnippetManager;
