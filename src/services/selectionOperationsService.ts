/**
 * Selection Operations Service — stub (AI backend removed)
 */

import { EditorLanguage, SelectionOperationType, SelectionOperationResult } from '../types';
export type { SelectionOperationType, SelectionOperationResult };

export class SelectionOperationsService {

  async explainSelection(
    code: string,
    language: EditorLanguage,
    _fullFileContext?: string,
  ): Promise<SelectionOperationResult> {
    return { operation: 'explain', hasCodeChanges: false, explanation: 'AI features have been removed.' };
  }

  async debugSelection(
    code: string,
    language: EditorLanguage,
    _fullFileContext?: string,
  ): Promise<SelectionOperationResult> {
    return { operation: 'debug', hasCodeChanges: false, explanation: 'AI features have been removed.', issues: [] };
  }

  async optimizeSelection(
    code: string,
    language: EditorLanguage,
    _fullFileContext?: string,
  ): Promise<SelectionOperationResult> {
    return { operation: 'optimize', hasCodeChanges: false, explanation: 'AI features have been removed.', improvements: [] };
  }

  async improveUISelection(
    code: string,
    language: EditorLanguage,
    _fullFileContext?: string,
  ): Promise<SelectionOperationResult> {
    return { operation: 'improveUI', hasCodeChanges: false, explanation: 'AI features have been removed.', improvements: [] };
  }

  isConfigured(): boolean { return false; }
}

export const selectionOperationsService = new SelectionOperationsService();
