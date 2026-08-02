import { ExternalLibrary } from '../services/externalLibraryService';
import { ThemeVariant } from '../hooks/useSettings';

/**
 * Represents a complete project with all code and metadata
 */
export interface Project {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    html: string;
    css: string;
    javascript: string;
    externalLibraries: ExternalLibrary[];
    settings?: ProjectSettings;
    historyMeta?: HistoryMetadata;
}

/**
 * Project settings for customization
 */
export interface ProjectSettings {
    autoSaveEnabled?: boolean;
    theme?: ThemeVariant;
    editorFontSize?: number;
}

/**
 * Metadata about project history for undo/redo
 */
export interface HistoryMetadata {
    currentIndex: number;
    totalEntries: number;
    lastOperation?: string;
}

/**
 * Lightweight project metadata for listing
 */
export interface ProjectMetadata {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    previewHtml?: string; // First 100 chars for preview
}

/**
 * Project list item for UI display
 */
export interface ProjectListItem {
    id: string;
    name: string;
    updatedAt: string;
    isActive: boolean;
}

/**
 * Result of project operations
 */
export interface ProjectOperationResult {
    success: boolean;
    error?: string;
    projectId?: string;
}
