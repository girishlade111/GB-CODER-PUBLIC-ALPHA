import React, { useState, useMemo } from 'react';
import { X, Clock, Tag, Search, Trash2, Plus, FileText, Code, Palette, Circle } from 'lucide-react';
import { HistoryEntry, DiffPreview } from '../hooks/useCodeHistory';

interface HistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryEntry[];
    currentIndex: number;
    onJumpToSnapshot: (id: string) => void;
    onCreateSnapshot: () => void;
    onClearHistory?: () => void;
    getDiffPreview: (from: HistoryEntry, to: HistoryEntry) => DiffPreview;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
    isOpen,
    onClose,
    history,
    currentIndex,
    onJumpToSnapshot,
    onCreateSnapshot,
    onClearHistory,
    getDiffPreview
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newSnapshotLabel, setNewSnapshotLabel] = useState('');

    // Filter history based on search
    const filteredHistory = useMemo(() => {
        if (!searchQuery.trim()) return history;

        const query = searchQuery.toLowerCase();
        return history.filter(entry =>
            entry.description.toLowerCase().includes(query) ||
            (entry.label && entry.label.toLowerCase().includes(query))
        );
    }, [history, searchQuery]);

    // Format timestamp
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle create snapshot
    const handleCreateSnapshot = () => {
        if (newSnapshotLabel.trim()) {
            // Note: This will be handled by parent, we just show the modal
            setShowCreateModal(false);
            setNewSnapshotLabel('');
            onCreateSnapshot();
        }
    };

    // Handle clear history
    const handleClearHistory = () => {
        if (window.confirm('Are you sure you want to clear all history? This cannot be undone.')) {
            onClearHistory?.();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-[#161616] border-l border-[#2a2a2a] z-50 flex flex-col animate-slideIn">
                {/* Header */}
                <div className="bg-[#161616] px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-[#8a8a8a]" />
                        <div>
                            <h2 className="text-[16px] font-semibold text-[#e8e8e8]">History Timeline</h2>
                            <p className="text-[12px] text-[#8a8a8a]">{history.length} snapshots</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-green-400 hover:text-green-300"
                            title="Create Snapshot"
                        >
                            <Plus className="w-5 h-5" />
                        </button>

                        {onClearHistory && history.length > 1 && (
                            <button
                                onClick={handleClearHistory}
                                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-red-400 hover:text-red-300"
                                title="Clear History"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-400 hover:text-white"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="px-6 py-4 border-b border-gray-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search snapshots..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-dark-gray border border-gray-600 text-bright-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-sm"
                        />
                    </div>
                </div>

                {/* Timeline */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {filteredHistory.length === 0 ? (
                        <div className="text-center py-12">
                            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500">No snapshots found</p>
                            {searchQuery && (
                                <p className="text-gray-600 text-sm mt-2">Try a different search term</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredHistory.map((entry, index) => {
                                const isCurrent = history[currentIndex]?.id === entry.id;
                                const previousEntry = index > 0 ? filteredHistory[index - 1] : null;
                                const diff = previousEntry ? getDiffPreview(previousEntry, entry) : null;

                                return (
                                    <div
                                        key={entry.id}
                                        className={`relative group cursor-pointer transition-all duration-200 ${isCurrent
                                                ? 'bg-blue-900/30 border-blue-500/50'
                                                : 'bg-dark-gray border-gray-700 hover:bg-gray-800 hover:border-gray-600'
                                            } border rounded-lg p-4`}
                                        onClick={() => !isCurrent && onJumpToSnapshot(entry.id)}
                                    >
                                        {/* Current indicator */}
                                        {isCurrent && (
                                            <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
                                                <Circle className="w-4 h-4 text-blue-400 fill-blue-400" />
                                            </div>
                                        )}

                                        {/* Timeline connector */}
                                        {index < filteredHistory.length - 1 && (
                                            <div className="absolute left-1/2 -bottom-3 w-0.5 h-3 bg-gray-700" />
                                        )}

                                        <div className="space-y-2">
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    {entry.label ? (
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Tag className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                                            <h3 className="font-semibold text-bright-white truncate">{entry.label}</h3>
                                                        </div>
                                                    ) : null}
                                                    <p className={`text-sm ${entry.label ? 'text-gray-400' : 'text-gray-300'} truncate`}>
                                                        {entry.description}
                                                    </p>
                                                </div>

                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-xs text-gray-500">{formatTime(entry.timestamp)}</div>
                                                    {isCurrent && (
                                                        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Diff Preview */}
                                            {diff && (diff.hasHtmlChanges || diff.hasCssChanges || diff.hasJavascriptChanges) && (
                                                <div className="flex items-center gap-2 pt-2 border-t border-gray-700/50">
                                                    <span className="text-xs text-gray-500">Changed:</span>
                                                    <div className="flex items-center gap-2">
                                                        {diff.hasHtmlChanges && (
                                                            <span className="flex items-center gap-1 text-xs px-2 py-1 bg-orange-900/30 text-orange-400 rounded border border-orange-700/30">
                                                                <FileText className="w-3 h-3" />
                                                                HTML
                                                            </span>
                                                        )}
                                                        {diff.hasCssChanges && (
                                                            <span className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded border border-blue-700/30">
                                                                <Palette className="w-3 h-3" />
                                                                CSS
                                                            </span>
                                                        )}
                                                        {diff.hasJavascriptChanges && (
                                                            <span className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded border border-yellow-700/30">
                                                                <Code className="w-3 h-3" />
                                                                JS
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Help */}
                <div className="px-6 py-3 border-t border-gray-700 bg-dark-gray">
                    <p className="text-xs text-gray-500 text-center">
                        Click a snapshot to jump to it • Jumps are non-destructive and can be undone
                    </p>
                </div>
            </div>

            {/* Create Snapshot Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
                    <div className="bg-dark-gray border border-gray-700 rounded-lg shadow-2xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-700">
                            <h3 className="text-lg font-bold text-bright-white">Create Snapshot</h3>
                        </div>

                        <div className="px-6 py-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Snapshot Name (Optional)
                            </label>
                            <input
                                type="text"
                                value={newSnapshotLabel}
                                onChange={(e) => setNewSnapshotLabel(e.target.value)}
                                placeholder="e.g., Before refactoring"
                                className="w-full px-4 py-2 bg-matte-black border border-gray-600 text-bright-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateSnapshot()}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Leave empty for an auto-generated name
                            </p>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewSnapshotLabel('');
                                }}
                                className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateSnapshot}
                                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Create Snapshot
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animation styles */}
            <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
        </>
    );
};

export default HistoryPanel;
