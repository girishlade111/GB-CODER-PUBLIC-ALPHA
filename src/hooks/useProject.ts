import { useState, useEffect, useCallback } from 'react';
import { Project, ProjectMetadata } from '../types/project';
import { projectStore } from '../services/projectStore';
import { ExternalLibrary } from '../services/externalLibraryService';

interface UseProjectReturn {
    currentProject: Project | null;
    projectList: ProjectMetadata[];
    isLoading: boolean;
    isSaving: boolean;
    isSyncing: boolean;
    createNewProject: (name: string) => Promise<boolean>;
    saveCurrentProject: () => Promise<boolean>;
    duplicateCurrentProject: () => Promise<boolean>;
    switchProject: (id: string) => Promise<boolean>;
    updateProjectName: (name: string) => Promise<boolean>;
    updateProjectCode: (html: string, css: string, javascript: string) => void;
    updateExternalLibraries: (libraries: ExternalLibrary[]) => void;
    deleteProject: (id: string) => Promise<boolean>;
    refreshProjectList: () => void;
    syncToCloud: () => Promise<boolean>;
}

export function useProject(
    initialHtml: string = '',
    initialCss: string = '',
    initialJavascript: string = '',
    initialLibraries: ExternalLibrary[] = []
): UseProjectReturn {
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [projectList, setProjectList] = useState<ProjectMetadata[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const refreshProjectList = useCallback(() => {
        const list = projectStore.listProjects();
        setProjectList(list);
    }, []);

    const loadActiveProject = useCallback(() => {
        setIsLoading(true);
        try {
            const project = projectStore.initializeDefaultProject(
                initialHtml,
                initialCss,
                initialJavascript,
                initialLibraries
            );
            setCurrentProject(project);
        } catch (error) {
            console.error('Failed to load active project:', error);
        } finally {
            setIsLoading(false);
        }
    }, [initialHtml, initialCss, initialJavascript, initialLibraries]);

    useEffect(() => {
        loadActiveProject();
        refreshProjectList();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const createNewProject = useCallback(async (name: string): Promise<boolean> => {
        setIsSaving(true);
        try {
            const result = projectStore.createProject(name, '', '', '', []);
            if (result.success && result.projectId) {
                const newProject = projectStore.loadProject(result.projectId);
                if (newProject) {
                    setCurrentProject(newProject);
                    refreshProjectList();
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Failed to create project:', error);
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [refreshProjectList]);

    const saveCurrentProject = useCallback(async (): Promise<boolean> => {
        if (!currentProject) return false;
        setIsSaving(true);
        try {
            projectStore.saveProject(currentProject);
            refreshProjectList();
            return true;
        } catch (error) {
            console.error('Failed to save project:', error);
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [currentProject, refreshProjectList]);

    const duplicateCurrentProject = useCallback(async (): Promise<boolean> => {
        if (!currentProject) return false;
        setIsSaving(true);
        try {
            const result = projectStore.duplicateProject(currentProject.id);
            if (result.success && result.projectId) {
                const duplicated = projectStore.loadProject(result.projectId);
                if (duplicated) {
                    setCurrentProject(duplicated);
                    refreshProjectList();
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Failed to duplicate project:', error);
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [currentProject, refreshProjectList]);

    const switchProject = useCallback(async (id: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const project = projectStore.loadProject(id);
            if (project) {
                projectStore.setCurrentProjectId(id);
                setCurrentProject(project);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to switch project:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateProjectName = useCallback(async (name: string): Promise<boolean> => {
        if (!currentProject) return false;
        try {
            projectStore.updateProjectName(currentProject.id, name);
            setCurrentProject(prev => prev ? { ...prev, name } : null);
            refreshProjectList();
            return true;
        } catch (error) {
            console.error('Failed to update project name:', error);
            return false;
        }
    }, [currentProject, refreshProjectList]);

    const updateProjectCode = useCallback(
        (html: string, css: string, javascript: string) => {
            if (!currentProject) return;
            setCurrentProject(prev => {
                if (!prev) return null;
                return { ...prev, html, css, javascript, updatedAt: new Date().toISOString() };
            });
        },
        [currentProject]
    );

    const updateExternalLibraries = useCallback(
        (libraries: ExternalLibrary[]) => {
            if (!currentProject) return;
            setCurrentProject(prev => {
                if (!prev) return null;
                return { ...prev, externalLibraries: libraries, updatedAt: new Date().toISOString() };
            });
        },
        [currentProject]
    );

    const deleteProject = useCallback(async (id: string): Promise<boolean> => {
        try {
            projectStore.deleteProject(id);
            refreshProjectList();
            if (currentProject?.id === id) {
                loadActiveProject();
            }
            return true;
        } catch (error) {
            console.error('Failed to delete project:', error);
            return false;
        }
    }, [currentProject, refreshProjectList, loadActiveProject]);

    // No-op: cloud sync removed
    const syncToCloud = useCallback(async (): Promise<boolean> => false, []);

    return {
        currentProject,
        projectList,
        isLoading,
        isSaving,
        isSyncing: false,
        createNewProject,
        saveCurrentProject,
        duplicateCurrentProject,
        switchProject,
        updateProjectName,
        updateProjectCode,
        updateExternalLibraries,
        deleteProject,
        refreshProjectList,
        syncToCloud,
    };
}
