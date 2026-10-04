import React, { useState, useMemo } from 'react';
import { Calendar, Code, Search, Filter, Eye, Edit3, Trash2, Download, X, History, Sparkles } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { HistoryItem } from '../../types';

interface CodeFile {
  id: string;
  title: string;
  language: 'html' | 'css' | 'javascript';
  code_content: string;
  created_at: string;
}

interface CodeHistoryPageProps {
  onLoadCode?: (codeFile: CodeFile) => void;
  selectionHistory?: HistoryItem[];
}

const CodeHistoryPage: React.FC<CodeHistoryPageProps> = ({ onLoadCode, selectionHistory = [] }) => {
  const [codeFiles, setCodeFiles] = useLocalStorage<CodeFile[]>('gb-coder-history', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'html' | 'css' | 'javascript'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'language'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<'saved' | 'ai'>('saved');
  const itemsPerPage = 10;

  // Filter and sort code files
  const filteredAndSortedFiles = useMemo(() => {
    const filtered = codeFiles.filter(file => {
      const matchesSearch = file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.code_content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLanguage = languageFilter === 'all' || file.language === languageFilter;
      return matchesSearch && matchesLanguage;
    });

    // Sort files
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'language':
          return a.language.localeCompare(b.language);
        default:
          return 0;
      }
    });

    return filtered;
  }, [codeFiles, searchQuery, languageFilter, sortBy]);

  // Filter and sort AI history
  const filteredAndSortedHistory = useMemo(() => {
    const filtered = selectionHistory.filter(item => {
      const matchesSearch = item.operation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.codePreview.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.result.explanation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLanguage = languageFilter === 'all' || item.language === languageFilter;
      return matchesSearch && matchesLanguage;
    });

    // Sort history (always by date for now as they don't have titles)
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    return filtered;
  }, [selectionHistory, searchQuery, languageFilter]);

  // Pagination
  const currentItems = activeTab === 'saved' ? filteredAndSortedFiles : filteredAndSortedHistory;
  const totalPages = Math.ceil(currentItems.length / itemsPerPage);
  const paginatedItems = currentItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string | number) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLanguageColor = (language: string) => {
    switch (language) {
      case 'html': return 'bg-accent/15 text-accent border-accent/30';
      case 'css': return 'bg-teal/15 text-teal border-teal/30';
      case 'javascript': return 'bg-amber/15 text-amber border-amber/30';
      default: return 'bg-product-active text-content-on-dark-soft border-stroke-dark';
    }
  };

  const handleDelete = (file: CodeFile) => {
    if (window.confirm(`Are you sure you want to delete "${file.title}"?`)) {
      setCodeFiles(prev => prev.filter(f => f.id !== file.id));
    }
  };

  const downloadFile = (file: CodeFile) => {
    const blob = new Blob([file.code_content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.title}.${file.language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-product p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-sans text-3xl font-medium text-content-on-dark mb-2">Code History</h1>
          <p className="text-content-on-dark-soft">View and manage your saved code files and AI operations</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-stroke-dark">
          <button
            onClick={() => { setActiveTab('saved'); setCurrentPage(1); }}
            className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'saved' ? 'text-accent' : 'text-content-on-dark-soft hover:text-content-on-dark'
              }`}
          >
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Saved Files
            </div>
            {activeTab === 'saved' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => { setActiveTab('ai'); setCurrentPage(1); }}
            className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'ai' ? 'text-teal' : 'text-content-on-dark-soft hover:text-content-on-dark'
              }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Operations
            </div>
            {activeTab === 'ai' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal rounded-t-full" />
            )}
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-product-soft rounded-lg shadow-sm border border-stroke-dark p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-content-on-dark-soft" />
                <input
                  type="text"
                  placeholder={activeTab === 'saved' ? "Search by title or content..." : "Search operations..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-product border border-stroke-dark-strong text-content-on-dark rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>

            {/* Language Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-content-on-dark-soft" />
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value as any)}
                className="px-3 py-2 bg-product border border-stroke-dark-strong text-content-on-dark rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="all">All Languages</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>

            {/* Sort (Only for Saved Files) */}
            {activeTab === 'saved' && (
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-product border border-stroke-dark-strong text-content-on-dark rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="date">Sort by Date</option>
                  <option value="title">Sort by Title</option>
                  <option value="language">Sort by Language</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-content-on-dark-soft">
            Showing {paginatedItems.length} of {currentItems.length} {activeTab === 'saved' ? 'files' : 'operations'}
          </p>
        </div>

        {/* Content List */}
        {paginatedItems.length === 0 ? (
          <div className="bg-product-soft rounded-lg shadow-sm border border-stroke-dark p-12 text-center">
            {activeTab === 'saved' ? (
              <Code className="w-12 h-12 text-content-on-dark-soft mx-auto mb-4" />
            ) : (
              <Sparkles className="w-12 h-12 text-content-on-dark-soft mx-auto mb-4" />
            )}
            <h3 className="text-lg font-medium text-content-on-dark mb-2">
              {activeTab === 'saved' ? 'No code files found' : 'No AI operations found'}
            </h3>
            <p className="text-content-on-dark-soft">
              {searchQuery || languageFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : activeTab === 'saved'
                  ? 'Start coding to see your saved files here'
                  : 'Use AI tools like Explain or Debug to see history here'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'saved' ? (
              // Saved Files List
              (paginatedItems as CodeFile[]).map((file) => (
                <div
                  key={file.id}
                  className="bg-product-soft rounded-lg shadow-sm border border-stroke-dark p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-content-on-dark truncate">
                          {file.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getLanguageColor(file.language)}`}>
                          {file.language.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-content-on-dark-soft mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(file.created_at)}
                        </span>
                        <span>{file.code_content.length} characters</span>
                      </div>

                      <div className="bg-product rounded p-3 max-h-32 overflow-hidden">
                        <pre className="text-sm text-content-on-dark whitespace-pre-wrap line-clamp-4">
                          {file.code_content.substring(0, 200)}
                          {file.code_content.length > 200 && '...'}
                        </pre>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setSelectedFile(file)}
                        className="p-2 hover:bg-product-active rounded-lg text-content-on-dark-soft hover:text-content-on-dark transition-colors"
                        title="View full content"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {onLoadCode && (
                        <button
                          onClick={() => onLoadCode(file)}
                          className="p-2 hover:bg-accent-subtle rounded-lg text-content-on-dark-soft hover:text-accent transition-colors"
                          title="Load into editor"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => downloadFile(file)}
                        className="p-2 hover:bg-success-subtle rounded-lg text-content-on-dark-soft hover:text-success transition-colors"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(file)}
                        className="p-2 hover:bg-danger-subtle rounded-lg text-content-on-dark-soft hover:text-red-300 transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // AI History List
              (paginatedItems as HistoryItem[]).map((item) => (
                <div
                  key={item.id}
                  className="bg-product-soft rounded-lg shadow-sm border border-stroke-dark p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-medium text-content-on-dark capitalize">
                          {item.operation}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getLanguageColor(item.language)}`}>
                          {item.language.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-content-on-dark-soft mb-3">
                        <span className="flex items-center gap-1">
                          <History className="w-4 h-4" />
                          {formatDate(item.timestamp)}
                        </span>
                      </div>

                      <div className="bg-product rounded p-3 max-h-32 overflow-hidden mb-3">
                        <p className="text-xs text-content-on-dark-soft mb-1">Code Preview:</p>
                        <pre className="text-sm text-content-on-dark whitespace-pre-wrap line-clamp-2 font-mono">
                          {item.codePreview}
                        </pre>
                      </div>

                      <div className="text-sm text-content-on-dark-soft line-clamp-2">
                        <span className="font-medium text-content-on-dark">Result: </span>
                        {item.result.explanation}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setSelectedHistoryItem(item)}
                        className="p-2 hover:bg-product-active rounded-lg text-content-on-dark-soft hover:text-content-on-dark transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-stroke-dark-strong text-content-on-dark rounded-lg hover:bg-product-active disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-2 border rounded-lg ${currentPage === i + 1
                  ? 'bg-accent text-accent-fg border-accent'
                  : 'border-stroke-dark-strong text-content-on-dark hover:bg-product-active'
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-stroke-dark-strong text-content-on-dark rounded-lg hover:bg-product-active disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* File Preview Modal */}
        {selectedFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-product-soft rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-stroke-dark">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-content-on-dark">{selectedFile.title}</h3>
                    <p className="text-sm text-content-on-dark-soft">
                      {selectedFile.language.toUpperCase()} • {formatDate(selectedFile.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-2 hover:bg-product-active rounded-lg text-content-on-dark-soft"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-auto flex-1">
                <pre className="bg-product p-4 rounded-lg text-sm text-content-on-dark whitespace-pre-wrap overflow-x-auto font-mono">
                  {selectedFile.code_content}
                </pre>
              </div>

              <div className="p-6 border-t border-stroke-dark flex justify-end gap-3">
                {onLoadCode && (
                  <button
                    onClick={() => {
                      onLoadCode(selectedFile);
                      setSelectedFile(null);
                    }}
                    className="px-4 py-2 bg-accent hover:bg-accent-hover text-content-on-dark rounded-lg transition-colors"
                  >
                    Load into Editor
                  </button>
                )}
                <button
                  onClick={() => downloadFile(selectedFile)}
                  className="px-4 py-2 bg-success hover:brightness-110 text-content-on-dark rounded-lg transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History Item Detail Modal */}
        {selectedHistoryItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-product-soft rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-stroke-dark">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-content-on-dark capitalize">
                      {selectedHistoryItem.operation} Operation
                    </h3>
                    <p className="text-sm text-content-on-dark-soft">
                      {selectedHistoryItem.language.toUpperCase()} • {formatDate(selectedHistoryItem.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedHistoryItem(null)}
                    className="p-2 hover:bg-product-active rounded-lg text-content-on-dark-soft"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-auto flex-1 space-y-6">
                {/* Explanation */}
                <div>
                  <h4 className="text-sm font-medium text-content-on-dark-soft mb-2">Explanation</h4>
                  <div className="bg-product p-4 rounded-lg text-sm text-content-on-dark whitespace-pre-wrap">
                    {selectedHistoryItem.result.explanation}
                  </div>
                </div>

                {/* Code Preview */}
                <div>
                  <h4 className="text-sm font-medium text-content-on-dark-soft mb-2">Original Code</h4>
                  <pre className="bg-product p-4 rounded-lg text-sm text-content-on-dark whitespace-pre-wrap overflow-x-auto font-mono">
                    {selectedHistoryItem.codePreview}
                  </pre>
                </div>

                {/* Suggested Code (if any) */}
                {selectedHistoryItem.result.suggestedCode && (
                  <div>
                    <h4 className="text-sm font-medium text-content-on-dark-soft mb-2">Suggested Code</h4>
                    <pre className="bg-product p-4 rounded-lg text-sm text-success whitespace-pre-wrap overflow-x-auto font-mono border border-success/30">
                      {selectedHistoryItem.result.suggestedCode}
                    </pre>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-stroke-dark flex justify-end">
                <button
                  onClick={() => setSelectedHistoryItem(null)}
                  className="px-4 py-2 bg-product-active hover:bg-product-hover text-content-on-dark rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeHistoryPage;