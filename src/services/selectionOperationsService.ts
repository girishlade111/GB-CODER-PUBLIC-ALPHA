import {
  EditorLanguage,
  SelectionOperationType,
  SelectionOperationResult,
} from '../types';
import {
  AiFeature,
  AiParseError,
  AiRequest,
  AiRequestError,
  AiResponseEnvelope,
  CodeChangePayload,
  ProjectContext,
  fileKeyToLanguage,
  isJsonModeFeature,
  languageToFileKey,
  parseAiJson,
  validateCodeChangePayload,
} from '../types/ai';

export type { SelectionOperationType, SelectionOperationResult };
export { AiParseError, AiRequestError };

/** Client-side ceiling so a stalled request cannot hang the toolbar forever. */
const REQUEST_TIMEOUT_MS = 75_000;

/** Maps the editor operation onto its dedicated AI feature. */
const OPERATION_TO_FEATURE: Record<SelectionOperationType, AiFeature> = {
  explain: 'explain',
  debug: 'fix',
  optimize: 'optimize',
  improveUI: 'enhance',
};

export interface SelectionOperationInput {
  /** The user's highlighted snippet. Empty string means "operate on whole file". */
  selectedCode: string;
  /** The file the selection lives in. */
  targetLanguage: EditorLanguage;
  /** FULL contents of all three files — always sent, never trimmed to the selection. */
  projectContext: ProjectContext;
}

export class SelectionOperationsService {
  /**
   * Posts to /api/ai with an abort-backed timeout. Throws AiRequestError on
   * any transport or HTTP failure so callers never have to string-match
   * error messages.
   */
  private async post(request: AiRequest): Promise<string> {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      let data: AiResponseEnvelope | null = null;
      try {
        data = (await response.json()) as AiResponseEnvelope;
      } catch {
        data = null;
      }

      if (!response.ok) {
        if (response.status === 429) {
          throw new AiRequestError(
            "You're sending requests too fast. Wait a moment and try again.",
            429,
            true,
          );
        }
        if (response.status === 413) {
          throw new AiRequestError(
            'Your project is too large for one AI request. Try selecting a smaller section.',
            413,
            false,
          );
        }
        throw new AiRequestError(
          data?.error || 'AI service is temporarily unavailable. Please try again.',
          response.status,
          response.status >= 500,
        );
      }

      const result = data?.result;
      if (typeof result !== 'string' || !result.trim()) {
        throw new AiRequestError('AI returned an empty response.', response.status, true);
      }

      return result;
    } catch (error) {
      if (error instanceof AiRequestError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new AiRequestError('AI request timed out. Please try again.', 0, true);
      }
      throw new AiRequestError('Connection failed. Check your internet and try again.', 0, true);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  /**
   * Runs one AI feature with a single retry. The retry is attempted when the
   * call fails OR when the returned payload is not valid, contract-conforming
   * JSON — and it asks for stricter JSON-only output.
   */
  private async requestWithRetry<T>(
    feature: AiFeature,
    baseRequest: AiRequest,
    validate: (raw: string) => T,
  ): Promise<T> {
    const attempt = async (strictJson: boolean): Promise<T> => {
      const raw = await this.post({ ...baseRequest, strictJson });
      return validate(raw);
    };

    try {
      return await attempt(false);
    } catch (firstError) {
      const isRetryable =
        firstError instanceof AiParseError ||
        (firstError instanceof AiRequestError && firstError.retryable);

      if (!isRetryable) throw firstError;

      try {
        // Only JSON features benefit from the stricter instruction, but a
        // plain retry still helps explain() recover from a transient failure.
        return await attempt(isJsonModeFeature(feature));
      } catch (retryError) {
        // Surface the most actionable message.
        throw retryError instanceof AiParseError || retryError instanceof AiRequestError
          ? retryError
          : firstError;
      }
    }
  }

  /**
   * Feature 1 — Explain selected code. Plain text, no code changes.
   */
  async explainSelection(input: SelectionOperationInput): Promise<SelectionOperationResult> {
    const explanation = await this.requestWithRetry(
      'explain',
      {
        feature: 'explain',
        selectedCode: input.selectedCode,
        targetLanguage: input.targetLanguage,
        projectContext: input.projectContext,
      },
      (raw) => {
        const text = raw.trim();
        if (!text) throw new AiParseError('AI returned an empty explanation.', raw);
        return text;
      },
    );

    return {
      operation: 'explain',
      hasCodeChanges: false,
      explanation,
    };
  }

  /**
   * Features 2-4 — fix / optimize / enhance. All share the
   * `{ file, fixedCode, explanation }` JSON contract.
   */
  private async runCodeChange(
    operation: Exclude<SelectionOperationType, 'explain'>,
    input: SelectionOperationInput,
  ): Promise<SelectionOperationResult> {
    const feature = OPERATION_TO_FEATURE[operation];

    const payload = await this.requestWithRetry<CodeChangePayload>(
      feature,
      {
        feature,
        selectedCode: input.selectedCode,
        targetLanguage: input.targetLanguage,
        projectContext: input.projectContext,
      },
      // Validation happens here, BEFORE anything reaches the editor.
      (raw) => validateCodeChangePayload(parseAiJson(raw), raw),
    );

    const targetFile = fileKeyToLanguage(payload.file);
    const hadSelection = input.selectedCode.trim().length > 0;

    // The snippet replaces the selection only when the AI targeted the same
    // file the user selected in. Otherwise it is a whole-file replacement.
    const appliesToSelection =
      hadSelection && payload.file === languageToFileKey(input.targetLanguage);

    const noIssues =
      operation === 'debug' && /^no issues detected/i.test(payload.explanation.trim());

    return {
      operation,
      hasCodeChanges: !noIssues,
      explanation: payload.explanation,
      suggestedCode: payload.fixedCode,
      targetFile,
      appliesToSelection,
    };
  }

  /** Feature 2 — Find and fix issue. */
  async debugSelection(input: SelectionOperationInput): Promise<SelectionOperationResult> {
    return this.runCodeChange('debug', input);
  }

  /** Feature 3 — Optimize performance. */
  async optimizeSelection(input: SelectionOperationInput): Promise<SelectionOperationResult> {
    return this.runCodeChange('optimize', input);
  }

  /** Feature 4 — Enhance visual design. */
  async improveUISelection(input: SelectionOperationInput): Promise<SelectionOperationResult> {
    return this.runCodeChange('improveUI', input);
  }

  /** Dispatches by operation type. */
  async runOperation(
    operation: SelectionOperationType,
    input: SelectionOperationInput,
  ): Promise<SelectionOperationResult> {
    switch (operation) {
      case 'explain':
        return this.explainSelection(input);
      case 'debug':
        return this.debugSelection(input);
      case 'optimize':
        return this.optimizeSelection(input);
      case 'improveUI':
        return this.improveUISelection(input);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  isConfigured(): boolean {
    return true;
  }
}

export const selectionOperationsService = new SelectionOperationsService();
