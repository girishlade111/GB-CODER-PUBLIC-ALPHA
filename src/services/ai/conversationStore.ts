/**
 * Project-Scoped Conversation Store for GB Assist.
 *
 * Responsibilities:
 * - Persists conversation sessions partitioned by projectId.
 * - Handles session switching, renaming, deletion, and auto-titling.
 * - Migrates legacy global sessions gracefully without data loss.
 */

import { CodeAssistSession, CodeAssistMessage } from './types.ts';

const LEGACY_STORAGE_KEY = 'gbcoder_code_assist_sessions_v1';
const PROJECT_PREFIX = 'gbcoder_ai_sessions_';

export class ConversationStore {
  /**
   * Generates a default session for a project.
   */
  public static createDefaultSession(projectId: string): CodeAssistSession {
    const id = `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    return {
      id,
      projectId,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
  }

  /**
   * Loads all sessions for a specific project.
   */
  public static loadSessions(projectId: string): CodeAssistSession[] {
    if (typeof window === 'undefined') {
      return [this.createDefaultSession(projectId)];
    }

    try {
      const key = `${PROJECT_PREFIX}${projectId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      // Check for legacy sessions to migrate
      const legacySaved = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacySaved) {
        try {
          const legacyParsed = JSON.parse(legacySaved);
          if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
            const migrated: CodeAssistSession[] = legacyParsed.map((item: unknown) => {
              const s = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
              return {
                id: typeof s.id === 'string' ? s.id : `session-${Date.now()}`,
                projectId,
                title: typeof s.title === 'string' ? s.title : 'Migrated Session',
                createdAt: typeof s.createdAt === 'number' ? s.createdAt : Date.now(),
                updatedAt: Date.now(),
                messages: Array.isArray(s.messages) ? (s.messages as CodeAssistMessage[]) : [],
              };
            });
            this.saveSessions(projectId, migrated);
            return migrated;
          }
        } catch {
          // ignore legacy parse errors
        }
      }
    } catch (err) {
      console.warn(`[ConversationStore] Failed to load sessions for project ${projectId}:`, err);
    }

    const initial = [this.createDefaultSession(projectId)];
    this.saveSessions(projectId, initial);
    return initial;
  }

  /**
   * Saves sessions for a specific project.
   */
  public static saveSessions(projectId: string, sessions: CodeAssistSession[]): void {
    if (typeof window === 'undefined') return;
    try {
      const key = `${PROJECT_PREFIX}${projectId}`;
      localStorage.setItem(key, JSON.stringify(sessions));
    } catch (err) {
      console.warn(`[ConversationStore] Failed to save sessions for project ${projectId}:`, err);
    }
  }

  /**
   * Adds a new session to a project.
   */
  public static createNewSession(projectId: string): CodeAssistSession {
    const existing = this.loadSessions(projectId);
    const newSession = this.createDefaultSession(projectId);
    const updated = [newSession, ...existing];
    this.saveSessions(projectId, updated);
    return newSession;
  }

  /**
   * Deletes a session from a project.
   */
  public static deleteSession(projectId: string, sessionId: string): CodeAssistSession[] {
    const existing = this.loadSessions(projectId);
    let updated = existing.filter((s) => s.id !== sessionId);
    if (updated.length === 0) {
      updated = [this.createDefaultSession(projectId)];
    }
    this.saveSessions(projectId, updated);
    return updated;
  }
}
