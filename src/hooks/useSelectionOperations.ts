import { useState, useCallback } from 'react';
import { selectionOperationsService, SelectionOperationType, SelectionOperationResult } from '../services/selectionOperationsService';
import { EditorLanguage } from '../types';

const isServiceErrorMessage = (message: string): boolean => {
    return [
        " You're sending requests too fast. Wait a moment and try again.",
        '🔴 AI service is temporarily unavailable. Please try again in a minute.',
        '🌐 Connection failed. Check your internet and try again.',
        ' Something went wrong. Please try again.',
        'AI returned an empty response. Please try again.',
    ].includes(message);
};

export const useSelectionOperations = () => {
    const [result, setResult] = useState<SelectionOperationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const executeOperation = useCallback(async (
        operation: SelectionOperationType,
        code: string,
        language: EditorLanguage,
        fullFileContext?: string
    ) => {
        console.log('[useSelectionOperations] executeOperation called');
        console.log('[useSelectionOperations] operation:', operation);
        console.log('[useSelectionOperations] language:', language);
        console.log('[useSelectionOperations] code length:', code.length);

        if (!code.trim()) {
            console.error('[useSelectionOperations] No code selected');
            setError('No code selected');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        console.log('[useSelectionOperations] API configured:', selectionOperationsService.isConfigured());

        try {
            let operationResult: SelectionOperationResult;

            console.log('[useSelectionOperations] Calling AI service...');

            switch (operation) {
                case 'explain':
                    operationResult = await selectionOperationsService.explainSelection(code, language, fullFileContext);
                    break;
                case 'debug':
                    operationResult = await selectionOperationsService.debugSelection(code, language, fullFileContext);
                    break;
                case 'optimize':
                    operationResult = await selectionOperationsService.optimizeSelection(code, language, fullFileContext);
                    break;
                case 'improveUI':
                    operationResult = await selectionOperationsService.improveUISelection(code, language, fullFileContext);
                    break;
                default:
                    throw new Error(`Unknown operation: ${operation}`);
            }

            console.log('[useSelectionOperations] Operation result:', operationResult);
            if (isServiceErrorMessage(operationResult.explanation)) {
                setError(operationResult.explanation);
                return null;
            }

            setResult(operationResult);
            return operationResult;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to execute operation';
            console.error('[useSelectionOperations] Error:', errorMessage, err);
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
            console.log('[useSelectionOperations] executeOperation completed');
        }
    }, []);

    const clearResult = useCallback(() => {
        console.log('[useSelectionOperations] Clearing result');
        setResult(null);
        setError(null);
    }, []);

    console.log('[useSelectionOperations] Current state - result:', !!result, 'isLoading:', isLoading, 'error:', error);

    return {
        result,
        setResult,
        isLoading,
        error,
        executeOperation,
        clearResult,
    };
};
