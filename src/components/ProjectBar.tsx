import React, { useState, useRef, useEffect } from 'react';
import {
    Download,
    FileText,
    ChevronDown,
    Plus,
    Loader2,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Project, ProjectMetadata } from '../types/project';
import { exportProjectAsZip } from '../utils/projectExport';

interface ProjectBarProps {
    currentProject: Project | null;
    projectList: ProjectMetadata[];
    isSaving: boolean;
    onNewProject: () => void;
    onSwitchProject: (id: string) => void;
    onUpdateName: (name: string) => Promise<boolean>;
}

const ProjectBar: React.FC<ProjectBarProps> = ({
    currentProject,
    projectList,
    isSaving,
    onNewProject,
    onSwitchProject,
    onUpdateName,
}) => {
    const { isDark } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Update edited name when project changes
    useEffect(() => {
        if (currentProject) {
            setEditedName(currentProject.name);
        }
    }, [currentProject]);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleStartEdit = () => {
        setIsEditing(true);
    };

    const handleSaveName = async () => {
        if (editedName.trim() && editedName !== currentProject?.name) {
            const success = await onUpdateName(editedName.trim());
            if (success) {
                setIsEditing(false);
            }
        } else {
            setIsEditing(false);
            setEditedName(currentProject?.name || '');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveName();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setEditedName(currentProject?.name || '');
        }
    };

    const handleExport = async () => {
        if (!currentProject) return;

        setIsExporting(true);
        try {
            await exportProjectAsZip(currentProject);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
    };

    if (!currentProject) {
        return null;
    }

    return (
        <div
            className={`sticky top-14 sm:top-16 z-30 backdrop-blur-sm border-b shadow-inner-subtle transition-colors ${isDark ? 'bg-matte-black/95 border-gray-700' : 'bg-white/95 border-gray-200'
                }`}
        >
            <div className="w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
                <div className="flex items-center justify-between h-11 sm:h-12 gap-2 sm:gap-4">
                    {/* Left: Project Name & Selector */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        {/* Project Selector Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isDark
                                        ? 'hover:bg-gray-700 text-gray-300'
                                        : 'hover:bg-gray-100 text-gray-600'
                                    }`}
                                title="Switch Project"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {showDropdown && (
                                <div
                                    className={`absolute left-0 top-full mt-2 w-64 sm:w-80 rounded-lg shadow-vscode-widget border max-h-96 overflow-y-auto animate-slide-down ${isDark ? 'bg-dark-gray border-gray-700' : 'bg-white border-gray-200'
                                        }`}
                                >
                                    <div className="p-2">
                                        <button
                                            onClick={() => {
                                                onNewProject();
                                                setShowDropdown(false);
                                            }}
                                            className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 rounded-lg transition-colors ${isDark
                                                    ? 'text-gray-300 hover:bg-gray-700'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <Plus className="w-4 h-4" />
                                            New Project
                                        </button>
                                    </div>

                                    <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />

                                    <div className="p-2 space-y-1">
                                        {projectList.length === 0 ? (
                                            <div className="px-3 py-4 text-center text-sm text-gray-500">
                                                No projects yet
                                            </div>
                                        ) : (
                                            projectList.map(project => (
                                                <button
                                                    key={project.id}
                                                    onClick={() => {
                                                        onSwitchProject(project.id);
                                                        setShowDropdown(false);
                                                    }}
                                                    className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${project.id === currentProject.id
                                                            ? isDark
                                                                ? 'bg-white text-black border-l-2 border-vscode-statusbar'
                                                                : 'bg-black text-white border-l-2 border-vscode-statusbar'
                                                            : isDark
                                                                ? 'text-gray-300 hover:bg-gray-700'
                                                                : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium truncate">{project.name}</div>
                                                            <div
                                                                className={`text-xs ${project.id === currentProject.id
                                                                        ? isDark
                                                                            ? 'text-gray-600'
                                                                            : 'text-gray-400'
                                                                        : isDark
                                                                            ? 'text-gray-500'
                                                                            : 'text-gray-500'
                                                                    }`}
                                                            >
                                                                {formatDate(project.updatedAt)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Project Name */}
                        {isEditing ? (
                            <input
                                ref={inputRef}
                                type="text"
                                value={editedName}
                                onChange={e => setEditedName(e.target.value)}
                                onBlur={handleSaveName}
                                onKeyDown={handleKeyDown}
                                className={`px-2 py-1 text-sm sm:text-base font-semibold rounded border-2 outline-none min-w-0 flex-1 max-w-xs ${isDark
                                        ? 'bg-gray-700 border-blue-500 text-white'
                                        : 'bg-white border-blue-500 text-gray-900'
                                    }`}
                            />
                        ) : (
                            <button
                                onClick={handleStartEdit}
                                className={`px-2 py-1 text-sm sm:text-base font-semibold rounded transition-colors truncate hover:underline underline-offset-4 ${isDark
                                        ? 'text-bright-white hover:bg-gray-700'
                                        : 'text-gray-900 hover:bg-gray-100'
                                    }`}
                                title="Click to rename"
                            >
                                {currentProject.name}
                            </button>
                        )}

                        {/* Last Saved */}
                        <span
                            className={`hidden sm:block text-xs whitespace-nowrap ${isDark ? 'text-gray-500' : 'text-gray-400'
                                }`}
                        >
                            {formatDate(currentProject.updatedAt)}
                        </span>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* Export ZIP Button */}
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${isDark
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-600'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900 disabled:bg-gray-100 disabled:text-gray-400'
                                }`}
                            title="Export as ZIP"
                        >
                            {isExporting ? (
                                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                            ) : (
                                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                            <span className="hidden md:inline">Export ZIP</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectBar;
