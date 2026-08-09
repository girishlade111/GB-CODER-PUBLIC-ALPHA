import { Project, ProjectMetadata, ProjectOperationResult } from '../types/project';
import { ExternalLibrary } from './externalLibraryService';

const PROJECTS_STORAGE_KEY = 'gb-coder-projects';
const ACTIVE_PROJECT_KEY = 'gb-coder-active-project';
const DEFAULT_PROJECT_NAME = 'Untitled Project';

/**
 * Service for managing projects in localStorage
 * Designed to be compatible with future backend migration
 */
class ProjectStore {
    /**
     * Generate a unique project ID (UUID format for Supabase compatibility)
     */
    private generateId(): string {
        // Use crypto.randomUUID() for Supabase-compatible UUID format
        return crypto.randomUUID();
    }

    /**
     * Get all projects from storage
     */
    private getAllProjects(): Record<string, Project> {
        try {
            const data = localStorage.getItem(PROJECTS_STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Failed to load projects from storage:', error);
            return {};
        }
    }

    /**
     * Save all projects to storage
     */
    private saveAllProjects(projects: Record<string, Project>): void {
        try {
            localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
        } catch (error) {
            console.error('Failed to save projects to storage:', error);
            throw new Error('Failed to save projects');
        }
    }

    /**
     * Create a new project
     */
    createProject(
        name: string,
        html: string = '',
        css: string = '',
        javascript: string = '',
        externalLibraries: ExternalLibrary[] = []
    ): ProjectOperationResult {
        try {
            const projects = this.getAllProjects();
            const id = this.generateId();
            const now = new Date().toISOString();

            const newProject: Project = {
                id,
                name: name || DEFAULT_PROJECT_NAME,
                createdAt: now,
                updatedAt: now,
                html,
                css,
                javascript,
                externalLibraries,
                settings: {
                    autoSaveEnabled: true,
                },
            };

            projects[id] = newProject;
            this.saveAllProjects(projects);
            this.setCurrentProjectId(id);

            return { success: true, projectId: id };
        } catch (error) {
            console.error('Failed to create project:', error);
            return { success: false, error: 'Failed to create project' };
        }
    }

    /**
     * Save or update an existing project
     */
    saveProject(project: Project): ProjectOperationResult {
        try {
            const projects = this.getAllProjects();

            if (!project.id) {
                return { success: false, error: 'Project ID is required' };
            }

            project.updatedAt = new Date().toISOString();
            projects[project.id] = project;
            this.saveAllProjects(projects);

            return { success: true, projectId: project.id };
        } catch (error) {
            console.error('Failed to save project:', error);
            return { success: false, error: 'Failed to save project' };
        }
    }

    /**
     * Load a project by ID
     */
    loadProject(id: string): Project | null {
        try {
            const projects = this.getAllProjects();
            return projects[id] || null;
        } catch (error) {
            console.error('Failed to load project:', error);
            return null;
        }
    }

    /**
     * Get all project metadata (for listing)
     */
    listProjects(): ProjectMetadata[] {
        try {
            const projects = this.getAllProjects();
            return Object.values(projects)
                .map(project => ({
                    id: project.id,
                    name: project.name,
                    createdAt: project.createdAt,
                    updatedAt: project.updatedAt,
                    previewHtml: project.html.substring(0, 100),
                }))
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        } catch (error) {
            console.error('Failed to list projects:', error);
            return [];
        }
    }

    /**
     * Duplicate a project with a new ID
     */
    duplicateProject(id: string, newName?: string): ProjectOperationResult {
        try {
            const original = this.loadProject(id);
            if (!original) {
                return { success: false, error: 'Project not found' };
            }

            const projects = this.getAllProjects();
            const newId = this.generateId();
            const now = new Date().toISOString();

            const duplicated: Project = {
                ...original,
                id: newId,
                name: newName || `${original.name} (Copy)`,
                createdAt: now,
                updatedAt: now,
            };

            projects[newId] = duplicated;
            this.saveAllProjects(projects);
            this.setCurrentProjectId(newId);

            return { success: true, projectId: newId };
        } catch (error) {
            console.error('Failed to duplicate project:', error);
            return { success: false, error: 'Failed to duplicate project' };
        }
    }

    /**
     * Delete a project
     */
    deleteProject(id: string): ProjectOperationResult {
        try {
            const projects = this.getAllProjects();

            if (!projects[id]) {
                return { success: false, error: 'Project not found' };
            }

            const projectName = projects[id].name;
            delete projects[id];
            this.saveAllProjects(projects);

            // If this was the active project, clear it
            if (this.getCurrentProjectId() === id) {
                localStorage.removeItem(ACTIVE_PROJECT_KEY);
            }

            return { success: true };
        } catch (error) {
            console.error('Failed to delete project:', error);
            return { success: false, error: 'Failed to delete project' };
        }
    }

    /**
     * Get the current active project ID
     */
    getCurrentProjectId(): string | null {
        return localStorage.getItem(ACTIVE_PROJECT_KEY);
    }

    /**
     * Set the current active project ID
     */
    setCurrentProjectId(id: string): void {
        localStorage.setItem(ACTIVE_PROJECT_KEY, id);
    }

    /**
     * Get the active project data
     */
    getActiveProject(): Project | null {
        const id = this.getCurrentProjectId();
        return id ? this.loadProject(id) : null;
    }

    /**
     * Initialize default project if none exists
     * This ensures backward compatibility for existing users
     */
    initializeDefaultProject(
        html: string = '',
        css: string = '',
        javascript: string = '',
        externalLibraries: ExternalLibrary[] = []
    ): Project {
        // Check if there's already an active project
        const activeProject = this.getActiveProject();
        if (activeProject) {
            return activeProject;
        }

        // Check if any projects exist
        const projects = this.getAllProjects();
        const projectList = Object.values(projects);

        if (projectList.length > 0) {
            // Use the most recently updated project
            const mostRecent = projectList.sort(
                (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            )[0];
            this.setCurrentProjectId(mostRecent.id);
            return mostRecent;
        }

        // Create a new default project
        const result = this.createProject(
            DEFAULT_PROJECT_NAME,
            html,
            css,
            javascript,
            externalLibraries
        );

        if (result.success && result.projectId) {
            return this.loadProject(result.projectId)!;
        }

        // Fallback: create an in-memory project
        const now = new Date().toISOString();
        return {
            id: this.generateId(),
            name: DEFAULT_PROJECT_NAME,
            createdAt: now,
            updatedAt: now,
            html,
            css,
            javascript,
            externalLibraries,
            settings: { autoSaveEnabled: true },
        };
    }

    /**
     * Update project code (convenience method)
     */
    updateProjectCode(
        id: string,
        html?: string,
        css?: string,
        javascript?: string
    ): ProjectOperationResult {
        try {
            const project = this.loadProject(id);
            if (!project) {
                return { success: false, error: 'Project not found' };
            }

            if (html !== undefined) project.html = html;
            if (css !== undefined) project.css = css;
            if (javascript !== undefined) project.javascript = javascript;

            return this.saveProject(project);
        } catch (error) {
            console.error('Failed to update project code:', error);
            return { success: false, error: 'Failed to update project code' };
        }
    }

    /**
     * Update project name
     */
    updateProjectName(id: string, name: string): ProjectOperationResult {
        try {
            const project = this.loadProject(id);
            if (!project) {
                return { success: false, error: 'Project not found' };
            }

            project.name = name;
            return this.saveProject(project);
        } catch (error) {
            console.error('Failed to update project name:', error);
            return { success: false, error: 'Failed to update project name' };
        }
    }
}

// Export singleton instance
export const projectStore = new ProjectStore();
