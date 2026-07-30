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
      case 'html': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'css': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'javascript': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <div className="min-h-screen bg-matte-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bright-white mb-2">Code History</h1>
          <p className="text-gray-400">View and manage your saved code files and AI operations</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => { setActiveTab('saved'); setCurrentPage(1); }}
            className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'saved' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'
              }`}
          >
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Saved Files
            </div>
            {activeTab === 'saved' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => { setActiveTab('ai'); setCurrentPage(1); }}
            className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'ai' ? 'text-purple-400' : 'text-gray-400 hover:text-gray-200'
              }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Operations
            </div>
            {activeTab === 'ai' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-400 rounded-t-full" />
            )}
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-dark-gray rounded-lg shadow-sm border border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={activeTab === 'saved' ? "Search by title or content..." : "Search operations..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-matte-black border border-gray-600 text-bright-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Language Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value as any)}
                className="px-3 py-2 bg-matte-black border border-gray-600 text-bright-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="px-3 py-2 bg-matte-black border border-gray-600 text-bright-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <p className="text-sm text-gray-400">
            Showing {paginatedItems.length} of {currentItems.length} {activeTab === 'saved' ? 'files' : 'operations'}
          </p>
        </div>

        {/* Content List */}
        {paginatedItems.length === 0 ? (
          <div className="bg-dark-gray rounded-lg shadow-sm border border-gray-700 p-12 text-center">
            {activeTab === 'saved' ? (
              <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            ) : (
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            )}
            <h3 className="text-lg font-medium text-bright-white mb-2">
              {activeTab === 'saved' ? 'No code files found' : 'No AI operations found'}
            </h3>
            <p className="text-gray-500">
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
                  className="bg-dark-gray rounded-lg shadow-sm border border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-bright-white truncate">
                          {file.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getLanguageColor(file.language)}`}>
                          {file.language.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(file.created_at)}
                        </span>
                        <span>{file.code_content.length} characters</span>
                      </div>

                      <div className="bg-matte-black rounded p-3 max-h-32 overflow-hidden">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap line-clamp-4">
                          {file.code_content.substring(0, 200)}
                          {file.code_content.length > 200 && '...'}
                        </pre>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setSelectedFile(file)}
                        className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-200 transition-colors"
                        title="View full content"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {onLoadCode && (
                        <button
                          onClick={() => onLoadCode(file)}
                          className="p-2 hover:bg-blue-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                          title="Load into editor"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => downloadFile(file)}
                        className="p-2 hover:bg-green-100 rounded-lg text-gray-500 hover:text-green-600 transition-colors"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(file)}
                        className="p-2 hover:bg-red-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
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
                  className="bg-dark-gray rounded-lg shadow-sm border border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-medium text-bright-white capitalize">
                          {item.operation}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getLanguageColor(item.language)}`}>
                          {item.language.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <History className="w-4 h-4" />
                          {formatDate(item.timestamp)}
                        </span>
                      </div>

                      <div className="bg-matte-black rounded p-3 max-h-32 overflow-hidden mb-3">
                        <p className="text-xs text-gray-500 mb-1">Code Preview:</p>
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap line-clamp-2 font-mono">
                          {item.codePreview}
                        </pre>
                      </div>

                      <div className="text-sm text-gray-400 line-clamp-2">
                        <span className="font-medium text-gray-300">Result: </span>
                        {item.result.explanation}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setSelectedHistoryItem(item)}
                        className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-200 transition-colors"
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
              className="px-3 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-2 border rounded-lg ${currentPage === i + 1
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* File Preview Modal */}
        {selectedFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-gray rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-bright-white">{selectedFile.title}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedFile.language.toUpperCase()} • {formatDate(selectedFile.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-auto flex-1">
                <pre className="bg-matte-black p-4 rounded-lg text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto font-mono">
                  {selectedFile.code_content}
                </pre>
              </div>

              <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
                {onLoadCode && (
                  <button
                    onClick={() => {
                      onLoadCode(selectedFile);
                      setSelectedFile(null);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Load into Editor
                  </button>
                )}
                <button
                  onClick={() => downloadFile(selectedFile)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
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
            <div className="bg-dark-gray rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-bright-white capitalize">
                      {selectedHistoryItem.operation} Operation
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedHistoryItem.language.toUpperCase()} • {formatDate(selectedHistoryItem.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedHistoryItem(null)}
                    className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-auto flex-1 space-y-6">
                {/* Explanation */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Explanation</h4>
                  <div className="bg-matte-black p-4 rounded-lg text-sm text-gray-300 whitespace-pre-wrap">
                    {selectedHistoryItem.result.explanation}
                  </div>
                </div>

                {/* Code Preview */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Original Code</h4>
                  <pre className="bg-matte-black p-4 rounded-lg text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto font-mono">
                    {selectedHistoryItem.codePreview}
                  </pre>
                </div>

                {/* Suggested Code (if any) */}
                {selectedHistoryItem.result.suggestedCode && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Suggested Code</h4>
                    <pre className="bg-matte-black p-4 rounded-lg text-sm text-green-400 whitespace-pre-wrap overflow-x-auto font-mono border border-green-900/30">
                      {selectedHistoryItem.result.suggestedCode}
                    </pre>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-700 flex justify-end">
                <button
                  onClick={() => setSelectedHistoryItem(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
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