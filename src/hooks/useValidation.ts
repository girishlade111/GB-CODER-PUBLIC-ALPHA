/**
 * Debounced validation driver.
 *
 * Content is pushed to the validators 500 ms after the last edit rather than on
 * every keystroke. Results flow back through a subscription, because the
 * language services publish markers asynchronously from their workers with no
 * completion signal to await.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { MultiFileProject } from '../types/files';
import {
  EMPTY_SUMMARY,
  ValidationSummary,
  validationService,
} from '../services/validationService';

/** Idle time after the last change before validating. */
const DEBOUNCE_MS = 500;

export interface ValidationState {
  summary: ValidationSummary;
  /** True between a content change and the next published result. */
  isValidating: boolean;
  /** Forces an immediate run, used by the Validate button. */
  revalidate: () => void;
}

export const useValidation = (project: MultiFileProject, enabled = true): ValidationState => {
  const [summary, setSummary] = useState<ValidationSummary>(EMPTY_SUMMARY);
  const [isValidating, setIsValidating] = useState(false);
  const [manualTrigger, setManualTrigger] = useState(0);
  const pendingRef = useRef(false);

  // Results arrive whenever a worker finishes, so subscribe once.
  useEffect(() => {
    if (!enabled) return;
    return validationService.subscribe((next) => {
      setSummary(next);
      if (pendingRef.current) {
        pendingRef.current = false;
        setIsValidating(false);
      }
    });
  }, [enabled]);

  /*
   * `project` is in the dependency list because a new object identity is exactly
   * what "the code changed" means here; the debounce is what keeps that from
   * becoming per-keystroke work.
   */
  useEffect(() => {
    if (!enabled) return;
    setIsValidating(true);
    pendingRef.current = true;

    const timer = setTimeout(() => {
      validationService.syncProject(project);
      /*
       * Marker-driven results may land later. Clear the spinner on a ceiling so
       * it cannot stick on if a worker publishes nothing new (for example when
       * an edit produced no change in diagnostics).
       */
      setTimeout(() => {
        pendingRef.current = false;
        setIsValidating(false);
      }, 1500);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [project, enabled, manualTrigger]);

  const revalidate = useCallback(() => setManualTrigger((value) => value + 1), []);

  return { summary, isValidating, revalidate };
};
