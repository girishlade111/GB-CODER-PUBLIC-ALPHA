import React, { useState, useRef, useEffect } from 'react';
import {
    Download,
    FileText,
    ChevronDown,
    Plus,
    Loader2,
} from 'lucide-react';
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

/**
 * Project strip that sits directly under the top nav. A canvas-coloured band
 * separated by a single hairline — no blur, no shadow.
 */
const ProjectBar: React.FC<ProjectBarProps> = ({
    currentProject,
    projectList,
    onNewProject,
    onSwitchProject,
    onUpdateName,
}) => {
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
        <div className="sticky top-14 z-30 border-b border-stroke-subtle bg-surface-canvas sm:top-16">
            <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6 lg:px-8">
                <div className="flex h-11 items-center justify-between gap-2 sm:h-12 sm:gap-4">
                    {/* Left: Project Name & Selector */}
                    <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                        {/* Project Selector Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="rounded-md p-1.5 text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary sm:p-2"
                                title="Switch Project"
                            >
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {showDropdown && (
                                <div
                                    className="absolute left-0 top-full z-40 mt-2 max-h-96 w-64 animate-slide-down overflow-y-auto rounded-lg border border-stroke bg-surface-base sm:w-80"
                                >
                                    <div className="p-2">
                                        <button
                                            onClick={() => {
                                                onNewProject();
                                                setShowDropdown(false);
                                            }}
                                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-content-primary transition-colors hover:bg-surface-hover"
                                        >
                                            <Plus className="h-4 w-4 text-accent" />
                                            New Project
                                        </button>
                                    </div>

                                    <div className="border-t border-stroke-soft" />

                                    <div className="space-y-1 p-2">
                                        {projectList.length === 0 ? (
                                            <div className="px-3 py-4 text-center text-sm text-content-muted">
                                                No projects yet
                                            </div>
                                        ) : (
                                            projectList.map(project => {
                                                const isCurrent = project.id === currentProject.id;
                                                return (
                                                    <button
                                                        key={project.id}
                                                        onClick={() => {
                                                            onSwitchProject(project.id);
                                                            setShowDropdown(false);
                                                        }}
                                                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                                                            isCurrent
                                                                ? 'border-l-2 border-accent bg-surface-hover text-content-primary'
                                                                : 'border-l-2 border-transparent text-content-secondary hover:bg-surface-hover hover:text-content-primary'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4 flex-shrink-0 text-content-muted" />
                                                            <div className="min-w-0 flex-1">
                                                                <div className="truncate font-medium">{project.name}</div>
                                                                <div className={`text-xs ${isCurrent ? 'text-content-faint' : 'text-content-muted'}`}>
                                                                    {formatDate(project.updatedAt)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })
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
                                aria-label="Project name"
                                className="min-w-0 flex-1 max-w-xs rounded border-2 border-accent bg-surface-base px-2 py-1 text-sm font-medium text-content-primary outline-none sm:text-base"
                            />
                        ) : (
                            <button
                                onClick={handleStartEdit}
                                className="truncate rounded px-2 py-1 text-left text-sm font-medium text-content-primary transition-colors hover:bg-surface-hover hover:underline hover:underline-offset-4 sm:text-base"
                                title="Click to rename"
                            >
                                {currentProject.name}
                            </button>
                        )}

                        {/* Last Saved */}
                        <span className="hidden whitespace-nowrap text-xs text-content-muted sm:block">
                            {formatDate(currentProject.updatedAt)}
                        </span>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* Export ZIP Button — button-secondary */}
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="flex items-center gap-1.5 rounded-md border border-stroke-strong bg-surface-base px-2 py-1.5 text-xs font-medium text-content-primary transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:py-2 sm:text-sm"
                            title="Export as ZIP"
                        >
                            {isExporting ? (
                                <Loader2 className="h-3 w-3 animate-spin sm:h-4 sm:w-4" />
                            ) : (
                                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
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