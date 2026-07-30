// Session Management Interface Component
import React, { useState, useEffect } from 'react';
import {
  Save, FolderOpen, Download, Upload, Trash2, Share2,
  Clock, Database, Search, X, Copy, AlertTriangle
} from 'lucide-react';
import { sessionDataService } from '../services/sessionDataService';
import { ConsoleSession } from '../types/console.types';

interface SessionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSession: (session: ConsoleSession) => void;
  currentTabs: any[];
  currentHistory: any[];
}

const SessionManager: React.FC<SessionManagerProps> = ({
  isOpen,
  onClose,
  onLoadSession,
  currentTabs,
  currentHistory,
}) => {
  const [sessions, setSessions] = useState<ConsoleSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'manual' | 'auto'>('all');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'txt'>('json');
  const [importData, setImportData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  const loadSessions = () => {
    try {
      const savedSessions = sessionDataService.getAllSessions();
      setSessions(savedSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setError('Failed to load sessions');
    }
  };

  const createNewSession = () => {
    setSessionName('');
    setShowSaveDialog(true);
  };

  const saveSession = async () => {
    if (!sessionName.trim()) {
      setError('Session name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      sessionDataService.createNewSession(sessionName.trim());
      sessionDataService.saveToLibrary();
      
      setShowSaveDialog(false);
      loadSessions();
      
      setError(null);
    } catch (error) {
      console.error('Failed to save session:', error);
      setError('Failed to save session');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = (session: ConsoleSession) => {
    try {
      onLoadSession(session);
      onClose();
    } catch (error) {
      console.error('Failed to load session:', error);
      setError('Failed to load session');
    }
  };

  const deleteSession = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      try {
        sessionDataService.deleteFromLibrary(sessionId);
        loadSessions();
      } catch (error) {
        console.error('Failed to delete session:', error);
        setError('Failed to delete session');
      }
    }
  };

  const duplicateSession = (session: ConsoleSession) => {
    try {
      const duplicated = sessionDataService.cloneSession(session);
      sessionDataService.saveToLibrary(duplicated);
      loadSessions();
    } catch (error) {
      console.error('Failed to duplicate session:', error);
      setError('Failed to duplicate session');
    }
  };

  const exportSession = (session: ConsoleSession) => {
    try {
      const data = sessionDataService.exportSession(exportFormat, session);
      downloadFile(data, `${session.name}.${exportFormat}`, exportFormat === 'json' ? 'application/json' : 'text/plain');
    } catch (error) {
      console.error('Failed to export session:', error);
      setError('Failed to export session');
    }
  };

  const exportCurrentSession = () => {
    try {
      const currentSession = {
        id: `current-${Date.now()}`,
        name: sessionName || 'Current Session',
        tabs: currentTabs,
        history: currentHistory,
        environment: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      if (exportFormat === 'json') {
        const data = JSON.stringify(currentSession, null, 2);
        downloadFile(data, `${currentSession.name}.json`, 'application/json');
      } else {
        // Convert to CSV or TXT format
        let data = '';
        if (exportFormat === 'csv') {
          data = convertToCSV(currentSession);
        } else {
          data = convertToText(currentSession);
        }
        downloadFile(data, `${currentSession.name}.${exportFormat}`, 'text/plain');
      }
      
      setShowExportDialog(false);
    } catch (error) {
      console.error('Failed to export current session:', error);
      setError('Failed to export current session');
    }
  };

  const importSession = () => {
    if (!importData.trim()) {
      setError('Import data is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = sessionDataService.importSession(importData);
      if (success) {
        setShowImportDialog(false);
        setImportData('');
        loadSessions();
      } else {
        setError('Failed to import session. Please check the format.');
      }
    } catch (error) {
      console.error('Failed to import session:', error);
      setError('Failed to import session');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (session: ConsoleSession): string => {
    const headers = ['Type', 'Name', 'Created', 'Updated'];
    const rows: string[] = [headers.join(',')];
    
    rows.push(`Session,"${session.name}",${new Date(session.createdAt).toISOString()},${new Date(session.updatedAt).toISOString()}`);
    rows.push(`Tabs,${session.tabs.length},,`);
    
    session.tabs.forEach((tab, index) => {
      rows.push(`Tab ${index + 1},"${tab.name}",${new Date(tab.createdAt).toISOString()},${new Date(tab.updatedAt).toISOString()}`);
    });
    
    return rows.join('\n');
  };

  const convertToText = (session: ConsoleSession): string => {
    let text = `Session: ${session.name}\n`;
    text += `Created: ${new Date(session.createdAt).toISOString()}\n`;
    text += `Updated: ${new Date(session.updatedAt).toISOString()}\n`;
    text += `Tabs: ${session.tabs.length}\n\n`;
    
    session.tabs.forEach((tab, index) => {
      text += `Tab ${index + 1}: ${tab.name}\n`;
      text += `  Logs: ${tab.logs.length}\n`;
      text += `  Created: ${new Date(tab.createdAt).toISOString()}\n\n`;
    });
    
    return text;
  };

  const shareSession = async (session: ConsoleSession) => {
    try {
      const shareData = {
        title: `Console Session: ${session.name}`,
        text: `Check out this console session with ${session.tabs.length} tabs and ${session.history.length} commands.`,
        url: `${window.location.origin}?session=${encodeURIComponent(JSON.stringify(session))}`,
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(shareData.url);
        alert('Session link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share session:', error);
      setError('Failed to share session');
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase());
    // Add filter logic for manual/auto if we track this metadata
    return matchesSearch;
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Session Manager</h2>
            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
              {sessions.length} sessions
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sessions..."
                className="w-full bg-gray-700 text-gray-200 rounded pl-10 pr-4 py-2 text-sm"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-gray-700 text-gray-200 rounded px-3 py-2 text-sm"
            >
              <option value="all">All Sessions</option>
              <option value="manual">Manual</option>
              <option value="auto">Auto-saved</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={createNewSession}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Current
              </button>
              
              <button
                onClick={() => setShowExportDialog(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              
              <button
                onClick={() => setShowImportDialog(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 rounded p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-red-200 text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Sessions Grid */}
        <div className="overflow-y-auto max-h-[60vh] p-6">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No sessions found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? 'Try adjusting your search query' : 'Save your current session to get started'}
              </p>
              {!searchQuery && (
                <button
                  onClick={createNewSession}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2 mx-auto"
                >
                  <Save className="w-4 h-4" />
                  Save Current Session
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-200 mb-1 truncate">{session.name}</h3>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <FolderOpen className="w-3 h-3" />
                          {session.tabs.length} tabs
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(session.updatedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => shareSession(session)}
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Share session"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => duplicateSession(session)}
                        className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                        title="Duplicate session"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-2">Last updated: {formatDate(session.updatedAt)}</div>
                    <div className="text-xs text-gray-400">
                      {session.tabs.length} tab{session.tabs.length !== 1 ? 's' : ''} • {session.history.length} command{session.history.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => loadSession(session)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-2"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Load
                    </button>
                    <button
                      onClick={() => exportSession(session)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Session Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Save Session</h3>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Session Name</label>
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className="w-full bg-gray-700 text-gray-200 rounded px-3 py-2 text-sm"
                    placeholder="Enter session name..."
                    autoFocus
                  />
                </div>

                <div className="text-sm text-gray-400">
                  <div>Will save:</div>
                  <div className="ml-4">
                    • {currentTabs.length} tabs
                    <br />
                    • {currentHistory.length} command history entries
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveSession}
                  disabled={isLoading || !sessionName.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded text-sm"
                >
                  {isLoading ? 'Saving...' : 'Save Session'}
                </button>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export Dialog */}
        {showExportDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Export Current Session</h3>
                <button
                  onClick={() => setShowExportDialog(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Format</label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="w-full bg-gray-700 text-gray-200 rounded px-3 py-2 text-sm"
                  >
                    <option value="json">JSON (Complete data)</option>
                    <option value="csv">CSV (Tabular data)</option>
                    <option value="txt">Plain Text (Readable)</option>
                  </select>
                </div>

                <div className="text-sm text-gray-400">
                  Export will include:
                  <div className="ml-4">
                    • {currentTabs.length} tabs with their logs
                    <br />
                    • Command history
                    <br />
                    • Session metadata
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={exportCurrentSession}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm"
                >
                  Export
                </button>
                <button
                  onClick={() => setShowExportDialog(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Dialog */}
        {showImportDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Import Session</h3>
                <button
                  onClick={() => setShowImportDialog(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Session Data</label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    className="w-full bg-gray-700 text-gray-200 rounded px-3 py-2 text-sm h-40"
                    placeholder="Paste session JSON data here..."
                    autoFocus
                  />
                </div>

                <div className="text-sm text-gray-400">
                  Upload a JSON file to import a session, or paste the session data directly.
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={importSession}
                  disabled={isLoading || !importData.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 rounded text-sm"
                >
                  {isLoading ? 'Importing...' : 'Import Session'}
                </button>
                <button
                  onClick={() => setShowImportDialog(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionManager;