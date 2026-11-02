/**
 * Bridge service for CodeAssistPanel and VSCodeMode.
 *
 * Delegates state and actions to the new modular AssistAgentService (Phase 3A),
 * ensuring complete backwards compatibility with existing workbench listeners and tests.
 */

import { MultiFileProject } from '../../types/files.ts';
import { assistAgentService } from './assistAgentService.ts';
import {
  CodeAssistMessage,
  CodeAssistSession,
  CodeAssistMode,
  CodeAssistState,
  AiProviderId,
} from './types.ts';

export type {
  CodeAssistMessage,
  CodeAssistSession,
  CodeAssistMode,
  CodeAssistState,
  AiProviderId,
};

class CodeAssistServiceBridge {
  public subscribe(listener: () => void): () => void {
    return assistAgentService.subscribe(listener);
  }

  public getState(): CodeAssistState {
    return assistAgentService.getState();
  }

  public getActiveSession(): CodeAssistSession {
    return assistAgentService.getActiveSession();
  }

  public createNewSession(): string {
    return assistAgentService.createNewSession();
  }

  public switchSession(sessionId: string): void {
    assistAgentService.switchSession(sessionId);
  }

  public deleteSession(sessionId: string): void {
    assistAgentService.deleteSession(sessionId);
  }

  public setMode(mode: CodeAssistMode): void {
    assistAgentService.setMode(mode);
  }

  public setModel(model: string, provider?: AiProviderId): void {
    assistAgentService.setModel(model, provider);
  }

  public cancelGeneration(): void {
    assistAgentService.cancelGeneration();
  }

  public async submitPrompt(
    prompt: string,
    project: MultiFileProject,
    onApplyFileUpdates?: (files: Array<{ path: string; content: string }>) => void,
    activePath?: string | null
  ): Promise<void> {
    const effectiveId = (project as { id?: string }).id || 'default';
    assistAgentService.setProject(effectiveId);
    await assistAgentService.submitPrompt(prompt, project, activePath);

    // If caller requested automatic apply for legacy behavior
    if (onApplyFileUpdates) {
      const activeSession = assistAgentService.getActiveSession();
      const lastMsg = activeSession.messages[activeSession.messages.length - 1];
      if (lastMsg?.proposedEdits && lastMsg.proposedEdits.length > 0) {
        onApplyFileUpdates(
          lastMsg.proposedEdits.map((e) => ({ path: e.path, content: e.newContent }))
        );
      }
    }
  }
}

export const codeAssistService = new CodeAssistServiceBridge();
export default codeAssistService;
