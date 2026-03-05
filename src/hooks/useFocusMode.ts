import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const useFocusMode = () => {
    const [focusMode, setFocusMode] = useLocalStorage<boolean>('gb-coder-focus-mode', false);

    const toggleFocusMode = useCallback(() => {
        setFocusMode((prev) => !prev);
    }, [setFocusMode]);

    return { focusMode, toggleFocusMode };
};
