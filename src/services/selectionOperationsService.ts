import { EditorLanguage, SelectionOperationType, SelectionOperationResult } from '../types';

export type { SelectionOperationType, SelectionOperationResult };

type AiFeature = 'improve' | 'explain' | 'fix' | 'optimize' | 'enhance' | 'suggest';

interface AiResponse {
  result?: string;
  error?: string;
}

export class SelectionOperationsService {
  private async callAi(
    feature: AiFeature,
    selectedCode: string,
    language: EditorLanguage,
    optionalContext?: string,
  ): Promise<string> {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feature,
          code: selectedCode,
          language,
          context: optionalContext || language,
        }),
      });

      let data: AiResponse | null = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        if (response.status === 429) {
          return " You're sending requests too fast. Wait a moment and try again.";
        }

        if (response.status === 500 || response.status === 503) {
          return '🔴 AI service is temporarily unavailable. Please try again in a minute.';
        }

        return ' Something went wrong. Please try again.';
      }

      return data?.result || 'AI returned an empty response. Please try again.';
    } catch (error) {
      return '🌐 Connection failed. Check your internet and try again.';
    }
  }

  private extractCodeFromResponse(responseText: string): string {
    const fencedCodeMatch = responseText.match(/```(?:html|css|javascript|js)?\s*([\s\S]*?)```/i);
    return (fencedCodeMatch?.[1] || responseText).trim();
  }

  private buildCodeChangeResult(
    operation: SelectionOperationType,
    aiResult: string,
  ): SelectionOperationResult {
    return {
      operation,
      hasCodeChanges: true,
      explanation: aiResult,
      suggestedCode: this.extractCodeFromResponse(aiResult),
    };
  }

  async improveSelection(
    code: string,
    language: EditorLanguage,
    fullFileContext?: string,
  ): Promise<string> {
    return this.callAi('improve', code, language, fullFileContext);
  }

  async explainSelection(
    code: string,
    language: EditorLanguage,
    fullFileContext?: string,
  ): Promise<SelectionOperationResult> {
    const aiResult = await this.callAi('explain', code, language, fullFileContext);

    return {
      operation: 'explain',
      hasCodeChanges: false,
      explanation: aiResult,
    };
  }

  async fixSelection(
    code: string,
    language: EditorLanguage,
    fullFileContext?: string,
  ): Promise<string> {
    return this.callAi('fix', code, language, fullFileContext);
  }

  async debugSelection(
    code: string,
    language: EditorLanguage,
    fullFileContext?: string,
  ): Promise<SelectionOperationResult> {
    const aiResult = await this.fixSelection(code, language, fullFileContext);

    return {
      ...this.buildCodeChangeResult('debug', aiResult),
      issues: [],
    };
  }

  async optimizeSelection(
    code: string,
    language: EditorLanguage,
    fullFileContext?: string,
  ): Promise<SelectionOperationResult> {
    const aiResult = await this.callAi('optimize', code, language, fullFileContext);

    return {
      ...this.buildCodeChangeResult('optimize', aiResult),
      improvements: [],
    };
  }

  async enhanceSelection(
    code: string,
    language: EditorLanguage,
    fullFileContext?: string,
  ): Promise<string> {
    return this.callAi('enhance', code, language, fullFileContext);
  }

  async improveUISelection(
    code: string,
    language: EditorLanguage,
    fullFileContext?: string,
  ): Promise<SelectionOperationResult> {
    const aiResult = await this.enhanceSelection(code, language, fullFileContext);

    return {
      ...this.buildCodeChangeResult('improveUI', aiResult),
      improvements: [],
    };
  }

  async suggestSelection(
    code: string,
    language: EditorLanguage,
    fullFileContext?: string,
  ): Promise<string> {
    return this.callAi('suggest', code, language, fullFileContext);
  }

  isConfigured(): boolean {
    return true;
  }
}

export const selectionOperationsService = new SelectionOperationsService();
