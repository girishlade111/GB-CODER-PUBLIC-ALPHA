import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { X, Search, Code2, Layers, Grid, List, Plus, Download, Upload, Eye, FileCode, Check } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { enhancedTemplateService, TemplateCategoryInfo, CodeTemplate } from '../services/enhancedTemplateService';
import toast from 'react-hot-toast';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (payload: any, meta: any) => void;
  currentProject?: any; // To allow saving current project
}

const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  onLoadTemplate,
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
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<'name' | 'difficulty'>('name');
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  const [previewTemplate, setPreviewTemplate] = useState<CodeTemplate | null>(null);
  const [previewPayload, setPreviewPayload] = useState<any | null>(null);
  const [confirmTemplate, setConfirmTemplate] = useState<CodeTemplate | null>(null);

  const [templateMetadata, setTemplateMetadata] = useState<CodeTemplate[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CodeTemplate[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(() => {
    const meta = enhancedTemplateService.getAllTemplatesMetadata();
    const custom = enhancedTemplateService.getCustomTemplates();
    setTemplateMetadata([...meta, ...custom]);
    setCategories(enhancedTemplateService.getCategoriesWithCounts());
    setCustomTemplates(custom);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  // Derived filter options
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    templateMetadata.forEach(t => t.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [templateMetadata]);

  const filteredTemplates = useMemo(() => {
    let filtered = templateMetadata;

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) || 
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'all') {
      if (selectedCategory === 'my-templates') {
        filtered = filtered.filter(t => customTemplates.some(ct => ct.id === t.id));
      } else {
        filtered = filtered.filter(t => t.category === selectedCategory || t.projectType === selectedCategory);
      }
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(t => selectedTags.some(tag => t.tags?.includes(tag)));
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
  }, [debouncedSearch, selectedCategory, selectedTags, sortOption, templateMetadata, customTemplates]);

  const handlePreview = async (template: CodeTemplate) => {
    setPreviewTemplate(template);
    if (previewPayload && previewTemplate?.id === template.id) return; // already fetched
    setPreviewPayload(null);
    try {
      const payload = await enhancedTemplateService.getTemplateById(template.id);
      setPreviewPayload(payload);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoadClick = async (e: React.MouseEvent, template: CodeTemplate) => {
    e.stopPropagation();
    // Set as preview so the confirm dialog knows what to load
    setPreviewTemplate(template);
    setPreviewPayload(null);
    
    // Show a loading toast or just let the confirm dialog show loading
    const toastId = toast.loading('Fetching template data...');
    try {
      const payload = await enhancedTemplateService.getTemplateById(template.id);
      setPreviewPayload(payload);
      setConfirmTemplate(template);
      toast.dismiss(toastId);
    } catch (err) {
      toast.error('Failed to load template');
      toast.dismiss(toastId);
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
      } catch (err) {
        toast.error('Failed to parse file');
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

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm`}>
      <div className={`w-full max-w-7xl h-[90vh] rounded-lg shadow-elevated flex flex-col overflow-hidden ${isDark ? 'bg-surface-raised border border-stroke-subtle' : 'bg-white border border-gray-200'}`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-stroke-subtle bg-surface-raised' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-subtle text-accent-hover rounded-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-bright-white' : 'text-gray-900'}`}>Code Templates Library</h2>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{filteredTemplates.length} templates available</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 text-sm rounded border flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
              <Upload className="w-4 h-4" /> Import Template
            </button>
            <button onClick={onClose} className="p-2 rounded hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Split */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Pane: Filters & List */}
          <div className={`flex flex-col flex-1 border-r ${isDark ? 'border-stroke-subtle' : 'border-gray-200'}`}>
            
            {/* Toolbar */}
            <div className={`p-4 border-b ${isDark ? 'border-stroke-subtle' : 'border-gray-200'} space-y-3`}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 rounded-md text-sm outline-none ${isDark ? 'bg-surface-overlay text-white border border-gray-700' : 'bg-white border border-gray-300'}`}
                  />
                </div>
                <select 
                  value={sortOption} 
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className={`px-3 py-2 rounded-md text-sm outline-none ${isDark ? 'bg-surface-overlay text-white border border-gray-700' : 'bg-white border border-gray-300'}`}
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="difficulty">Difficulty</option>
                </select>
              </div>

              {/* Categories */}
              <div className="flex gap-2 flex-wrap pb-1">
                <button onClick={() => setSelectedCategory('all')} className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap ${selectedCategory === 'all' ? 'bg-accent text-white font-medium' : 'bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10'}`}>All</button>
                <button onClick={() => setSelectedCategory('my-templates')} className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap ${selectedCategory === 'my-templates' ? 'bg-accent text-white font-medium' : 'bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10'}`}>My Templates</button>
                {categories.map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap flex items-center gap-1 ${selectedCategory === c.id ? 'bg-accent text-white font-medium' : 'bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10'}`}
                  >
                    <span>{c.icon}</span> {c.name}
                  </button>
                ))}
              </div>


            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredTemplates.length === 0 ? (
                 <div className="flex items-center justify-center h-full text-gray-400">No templates found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredTemplates.map(template => (
                    <div 
                      key={template.id}
                      onClick={() => handlePreview(template)}
                      className={`group flex flex-col p-4 rounded-lg border cursor-pointer transition-all ${previewTemplate?.id === template.id ? 'border-accent ring-1 ring-accent' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'} ${isDark ? 'bg-surface-overlay' : 'bg-white'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 shrink-0 bg-black/5 dark:bg-white/5 rounded-md flex items-center justify-center text-xl">
                          {template.projectType === 'react' ? '⚛️' : template.projectType === 'vue' ? '💚' : template.projectType === 'nextjs' ? '▲' : '🌐'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{template.name}</h3>
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                               template.difficulty === 'beginner' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                               template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
                               'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                            }`}>{template.difficulty}</span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">{template.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex gap-2 flex-wrap">
                        </div>
                        <button
                          onClick={(e) => handleLoadClick(e, template)}
                          className="px-3 py-1 text-xs font-medium bg-accent text-white rounded hover:bg-accent-hover transition-colors shadow-sm whitespace-nowrap"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Preview */}
          <div className={`hidden lg:flex flex-col w-[400px] xl:w-[450px] shrink-0 border-l ${isDark ? 'bg-surface-raised border-stroke-subtle' : 'bg-gray-50 border-gray-200'}`}>
            {previewTemplate ? (
              <div className="flex flex-col h-full">
                <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'border-stroke-subtle' : 'border-gray-200'}`}>
                  <div className="min-w-0 pr-4">
                     <h3 className={`font-bold text-lg truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{previewTemplate.name}</h3>
                     <p className="text-sm text-gray-500 truncate">{previewTemplate.subcategory || previewTemplate.category}</p>
                  </div>
                  <button onClick={() => exportTemplate(previewTemplate)} title="Download Template" className="p-2 shrink-0 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-gray-600 dark:text-gray-400">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 p-5 overflow-y-auto">
                   <div className="aspect-video bg-white rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm flex flex-col overflow-hidden mb-6 relative group">
                      {previewPayload?.files ? (
                        <div className="flex-1 p-4 overflow-y-auto text-xs font-mono text-gray-300 bg-[#1e1e1e]">
                           <div className="text-gray-500 mb-4">// Project structure</div>
                           {previewPayload.files.map((f: any) => (
                             <div key={f.path} className="flex items-center gap-2 py-1.5">
                                <FileCode className="w-4 h-4 text-blue-400" />
                                {f.path}
                             </div>
                           ))}
                        </div>
                      ) : previewPayload?.html ? (
                        <iframe 
                           srcDoc={`<!DOCTYPE html><html><head><style>${previewPayload.css}</style></head><body>${previewPayload.html}<script>${previewPayload.javascript}</script></body></html>`}
                           className="w-full h-full border-0 bg-white"
                           title="Preview"
                        />
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">Loading Preview...</div>
                      )}
                      
                      {/* Interactive overlay just to block clicks on iframe */}
                      <div className="absolute inset-0 z-10" />
                   </div>

                   <div className="space-y-6">
                      <div>
                         <h4 className={`font-semibold text-sm mb-3 uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Features</h4>
                         <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                           {previewTemplate.features?.map((f, i) => (
                              <li key={i} className="flex items-center gap-2">
                                 <Check className="w-4 h-4 text-green-500 shrink-0" />
                                 {f}
                              </li>
                           ))}
                         </ul>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-black/5 dark:bg-white/5">
                         <div>
                            <span className="block text-xs text-gray-500 mb-1">Author</span>
                            <span className="text-sm font-medium dark:text-gray-200">{previewTemplate.author || 'GB Coder'}</span>
                         </div>
                         <div>
                            <span className="block text-xs text-gray-500 mb-1">Files</span>
                            <span className="text-sm font-medium dark:text-gray-200">
                               {previewPayload?.files ? previewPayload.files.length : 3}
                            </span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className={`p-5 border-t ${isDark ? 'border-stroke-subtle' : 'border-gray-200'}`}>
                  <button 
                    onClick={() => setConfirmTemplate(previewTemplate)}
                    className="w-full py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                  >
                    <Code2 className="w-5 h-5" /> Load into Editor
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Eye className="w-8 h-8 opacity-50" />
                </div>
                <p>Select a template to view details and preview.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmTemplate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
           <div className={`w-full max-w-md p-6 rounded-xl shadow-2xl ${isDark ? 'bg-surface-raised border border-stroke-subtle' : 'bg-white'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Load Template</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                Loading <strong className="text-accent">{confirmTemplate.name}</strong> will overwrite your current code and files. 
                Are you sure you want to proceed?
              </p>
              
              {!previewPayload ? (
                <div className="flex justify-center mb-4">
                  <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full"></div>
                </div>
              ) : null}

              <div className="flex justify-end gap-3">
                 <button 
                   onClick={() => setConfirmTemplate(null)} 
                   className="px-5 py-2.5 text-sm font-medium rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={() => {
                     if (previewPayload) {
                       onLoadTemplate(previewPayload, confirmTemplate);
                       setConfirmTemplate(null);
                       onClose();
                     }
                   }}
                   disabled={!previewPayload}
                   className="px-5 py-2.5 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Yes, Load It
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelectorModal;
