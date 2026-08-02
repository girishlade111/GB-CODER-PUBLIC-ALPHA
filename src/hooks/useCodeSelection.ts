import { useState, useCallback } from 'react';
import { EditorLanguage } from '../types';
import * as monacoHelper from '../utils/monacoSelectionHelper';

interface SelectionState {
    code: string;
    language: EditorLanguage | null;
    position: { top: number; left: number } | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    range: any;
    fullFileCode: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editorInstance: any;
}

export const useCodeSelection = () => {
    const [selection, setSelection] = useState<SelectionState>({
        code: '',
        language: null,
        position: null,
        range: null,
        fullFileCode: '',
        editorInstance: null,
    });

    const clearSelection = useCallback(() => {
        setSelection({
            code: '',
            language: null,
            position: null,
            range: null,
            fullFileCode: '',
            editorInstance: null,
        });
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateSelection = useCallback((editorInstance: any, language: EditorLanguage) => {
        if (!editorInstance) {
            clearSelection();
            return;
        }

        const selectionInfo = monacoHelper.getSelectedCode(editorInstance);

        if (!selectionInfo) {
            clearSelection();
            return;
        }

        const position = monacoHelper.getSelectionPosition(editorInstance, selectionInfo.range);
        const fullFileCode = monacoHelper.getFullFileContent(editorInstance);

        setSelection({
            code: selectionInfo.code,
            language,
            position,
            range: selectionInfo.range,
            fullFileCode,
            editorInstance,
        });
    }, [clearSelection]);

    const hasSelection = !!selection.code && !!selection.language;

    return {
        selection,
        updateSelection,
        clearSelection,
        hasSelection,
    };
};
