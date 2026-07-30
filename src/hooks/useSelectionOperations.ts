import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  selectionOperationsService,
  SelectionOperationType,
  SelectionOperationResult,
  SelectionOperationInput,
} from '../services/selectionOperationsService';
import { AiParseError, AiRequestError, ProjectContext } from '../types/ai';
import { EditorLanguage } from '../types';

const OPERATION_LABEL: Record<SelectionOperationType, string> = {
  explain: 'Explain',
  debug: 'Fix',
  optimize: 'Optimize',
  improveUI: 'Enhance',
};

/**
 * Turns a thrown error into a message safe to show the user. Parse failures are
 * called out explicitly so it is clear nothing was applied to the editor.
 */
const toUserMessage = (operation: SelectionOperationType, error: unknown): string => {
  const label = OPERATION_LABEL[operation];

  if (error instanceof AiParseError) {
    return `${label} failed: the AI returned malformed output, so nothing was changed. Please try again.`;
  }
  if (error instanceof AiRequestError) {
    return `${label} failed: ${error.message}`;
  }
  if (error instanceof Error && error.message) {
    return `${label} failed: ${error.message}`;
  }
  return `${label} failed. Please try again.`;
};

export const useSelectionOperations = () => {
  const [result, setResult] = useState<SelectionOperationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Runs an AI operation. The FULL project context (all three files) is always
   * forwarded; `selectedCode` only marks the region to change.
   */
  const executeOperation = useCallback(
    async (
      operation: SelectionOperationType,
      selectedCode: string,
      targetLanguage: EditorLanguage,
      projectContext: ProjectContext,
    ): Promise<SelectionOperationResult | null> => {
      const trimmedSelection = selectedCode?.trim() ?? '';
      const hasAnyCode =
        trimmedSelection.length > 0 ||
        [projectContext?.html, projectContext?.css, projectContext?.javascript].some(
          (file) => typeof file === 'string' && file.trim().length > 0,
        );

      if (!hasAnyCode) {
        const message = 'Nothing to analyze — write or select some code first.';
        setError(message);
        toast.error(message);
        return null;
      }

      setIsLoading(true);
      setError(null);
      setResult(null);

      const input: SelectionOperationInput = {
        selectedCode: selectedCode ?? '',
        targetLanguage,
        projectContext: {
          html: projectContext?.html ?? '',
          css: projectContext?.css ?? '',
          javascript: projectContext?.javascript ?? '',
        },
      };

      try {
        const operationResult = await selectionOperationsService.runOperation(operation, input);
        setResult(operationResult);
        return operationResult;
      } catch (err) {
        const message = toUserMessage(operation, err);
        console.error(`[useSelectionOperations] ${operation} failed:`, err);
        setError(message);
        // Never silently swallow: the user always sees why nothing was applied.
        toast.error(message, { duration: 5000 });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    setResult,
    isLoading,
    error,
    executeOperation,
    clearResult,
  };
};
