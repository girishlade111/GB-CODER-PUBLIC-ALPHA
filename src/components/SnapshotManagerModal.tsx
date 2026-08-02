import React, { useState, useMemo } from 'react';
import { X, Search, Clock, Save, Download, Trash2, Edit2, RotateCcw, Eye, Database } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useSnapshots } from '../hooks/useSnapshots';
import { Snapshot } from '../services/snapshotService';

interface SnapshotManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (snapshot: Snapshot) => void;
  onPreview: (snapshot: Snapshot) => void;
}

const SnapshotManagerModal: React.FC<SnapshotManagerModalProps> = ({
  isOpen,
  onClose,
  onRestore,
  onPreview
}) => {
  const { settings } = useSettings();
  const { snapshots, deleteSnapshot, renameSnapshot, exportProject } = useSnapshots();
  const isDark = settings.theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const filteredAndSortedSnapshots = useMemo(() => {
    let result = snapshots.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [snapshots, searchQuery, sortBy]);

  const handleRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveRename = (id: string) => {
    if (editName.trim()) {
      renameSnapshot(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleExport = (snapshot: Snapshot) => {
    const data = exportProject(snapshot.projectState);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${snapshot.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.gbcoder`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-4xl h-[80vh] flex flex-col rounded-xl shadow-2xl border ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <Database className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Snapshot Manager
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {snapshots.length} / 50 snapshots used
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className={`p-4 flex gap-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border ${
            isDark ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-200'
          }`}>
            <Search className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search snapshots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 bg-transparent border-none outline-none text-sm ${
                isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={`px-3 py-2 rounded-lg border text-sm outline-none ${
              isDark 
                ? 'bg-gray-950 border-gray-800 text-white' 
                : 'bg-gray-50 border-gray-200 text-gray-900'
            }`}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredAndSortedSnapshots.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <Database className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No snapshots found</p>
            </div>
          ) : (
            filteredAndSortedSnapshots.map(snapshot => (
              <div 
                key={snapshot.id}
                className={`group flex items-center justify-between p-4 rounded-lg border transition-all ${
                  isDark 
                    ? 'border-gray-800 hover:border-gray-700 bg-gray-800/30' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    snapshot.isAuto 
                      ? (isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-100 text-orange-600')
                      : (isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600')
                  }`}>
                    {snapshot.isAuto ? <Clock className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                  </div>
                  
                  <div>
                    {editingId === snapshot.id ? (
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => saveRename(snapshot.id)}
                        onKeyDown={(e) => e.key === 'Enter' && saveRename(snapshot.id)}
                        className={`text-base font-semibold px-2 py-0.5 rounded border outline-none ${
                          isDark ? 'bg-gray-950 border-blue-500 text-white' : 'bg-white border-blue-500 text-gray-900'
                        }`}
                      />
                    ) : (
                      <h3 className={`text-base font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {snapshot.name}
                        <button 
                          onClick={() => handleRename(snapshot.id, snapshot.name)}
                          className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-500/20 text-gray-500 transition-all`}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </h3>
                    )}
                    
                    <div className={`flex items-center gap-4 mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span>{new Date(snapshot.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span>{snapshot.projectState.project.projectType}</span>
                      <span>•</span>
                      <span>{snapshot.projectState.project.files.length} files</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onPreview(snapshot)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  
                  <button
                    onClick={() => onRestore(snapshot)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isDark ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore
                  </button>

                  <div className={`w-px h-6 mx-1 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />

                  <button
                    onClick={() => handleExport(snapshot)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                    }`}
                    title="Export"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => deleteSnapshot(snapshot.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-500 hover:text-red-600'
                    }`}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SnapshotManagerModal;
