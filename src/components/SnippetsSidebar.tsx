import React, { useState } from 'react';
import { X, Plus, FolderOpen, Download, Upload, Search, Filter, ChevronRight, Settings, Sparkles } from 'lucide-react';
import { CodeSnippet, SnippetType, SnippetScope } from '../types';
import SnippetManager from './SnippetManager';

interface SnippetsSidebarProps {
    isOpen: boolean;
    onClose: () => void;
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
}

const SnippetsSidebar: React.FC<SnippetsSidebarProps> = ({
    isOpen,
    onClose,
    snippets,
    onSave,
    onLoad,
    onInsert,
    onDelete,
    onUpdate,
    currentCode,
}) => {
    const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-matte-black border-l border-gray-800 shadow-vscode-modal z-50 flex flex-col animate-slideIn">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-matte-black">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-800 rounded-lg">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Snippets</h2>
                            <p className="text-xs text-gray-400">Manage your code library</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center p-2 gap-2 bg-matte-black border-b border-gray-800">
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'list'
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                            }`}
                    >
                        <FolderOpen className="w-4 h-4" />
                        My Snippets
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'create'
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                            }`}
                    >
                        <Plus className="w-4 h-4" />
                        Create New
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-matte-black">
                    <SnippetManager
                        snippets={snippets}
                        onSave={onSave}
                        onLoad={onLoad}
                        onInsert={onInsert}
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                        currentCode={currentCode}
                        viewMode="sidebar"
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                </div>
            </div>

            <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
        </>
    );
};

export default SnippetsSidebar;
