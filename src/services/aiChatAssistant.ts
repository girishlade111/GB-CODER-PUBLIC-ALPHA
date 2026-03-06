// AI Code Chat Assistant Service
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  codeContext?: {
    html?: string;
    css?: string;
    javascript?: string;
  };
}

export interface ChatContext {
  html: string;
  css: string;
  javascript: string;
  externalLibraries: string[];
}

class AIChatAssistantService {
  private apiKey: string;
  private model: any = null;
  private chatSession: any = null;
  private messageHistory: ChatMessage[] = [];

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.initializeModel();
  }

  private initializeModel() {
    if (this.apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      } catch (error) {
        console.error('Failed to initialize AI model:', error);
      }
    }
  }

  public async sendMessage(
    message: string,
    context: ChatContext,
    includeCodeContext: boolean = true
  ): Promise<string> {
    if (!this.model) {
      return 'AI assistant is not available. Please check your API key configuration.';
    }

    try {
      // Build context-aware prompt
      let systemContext = '';
      
      if (includeCodeContext) {
        systemContext = `
Current Code Context:
--- HTML ---
${context.html.substring(0, 2000)}

--- CSS ---
${context.css.substring(0, 2000)}

--- JavaScript ---
${context.javascript.substring(0, 2000)}

--- External Libraries ---
${context.externalLibraries.join(', ') || 'None'}

`;
      }

      const fullPrompt = `${systemContext}
You are an expert coding assistant helping a developer with their web development project.
The user is working on an HTML/CSS/JavaScript project in an online code playground.

Provide clear, concise, and helpful responses. When suggesting code:
1. Explain what the code does
2. Provide complete, working examples
3. Follow best practices
4. Consider the existing code context

User's question: ${message}

Your response:`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      return text;
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      return `Sorry, I encountered an error: ${error.message}. Please try again.`;
    }
  }

  public async explainCode(
    code: string,
    language: 'html' | 'css' | 'javascript'
  ): Promise<string> {
    if (!this.model) {
      return 'AI assistant is not available.';
    }

    try {
      const prompt = `Explain the following ${language.toUpperCase()} code in simple terms. Break down what each part does and why it's written that way.

Code to explain:
\`\`\`${language}
${code}
\`\`\`

Provide a clear, educational explanation:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      return `Error explaining code: ${error.message}`;
    }
  }

  public async debugCode(
    code: string,
    language: 'html' | 'css' | 'javascript',
    errorMessage?: string
  ): Promise<string> {
    if (!this.model) {
      return 'AI assistant is not available.';
    }

    try {
      const prompt = `Help me debug the following ${language.toUpperCase()} code.
${errorMessage ? `\nError message: ${errorMessage}` : ''}

Code:
\`\`\`${language}
${code}
\`\`\`

Please:
1. Identify any bugs or issues
2. Explain what's wrong
3. Provide the corrected code
4. Explain how to prevent similar issues in the future`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      return `Error debugging code: ${error.message}`;
    }
  }

  public async refactorCode(
    code: string,
    language: 'html' | 'css' | 'javascript',
    goal: string = 'improve performance and readability'
  ): Promise<string> {
    if (!this.model) {
      return 'AI assistant is not available.';
    }

    try {
      const prompt = `Refactor the following ${language.toUpperCase()} code to ${goal}.

Code:
\`\`\`${language}
${code}
\`\`\`

Please:
1. Explain what improvements you're making
2. Provide the refactored code
3. Highlight the key changes and their benefits`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      return `Error refactoring code: ${error.message}`;
    }
  }

  public async generateCode(
    description: string,
    language: 'html' | 'css' | 'javascript',
    requirements?: string[]
  ): Promise<string> {
    if (!this.model) {
      return 'AI assistant is not available.';
    }

    try {
      const reqText = requirements?.length 
        ? `\nRequirements:\n${requirements.map(r => `- ${r}`).join('\n')}` 
        : '';

      const prompt = `Generate ${language.toUpperCase()} code based on this description:

Description: ${description}${reqText}

Please provide:
1. Complete, working code
2. Comments explaining key parts
3. Best practices and modern syntax
4. Example usage if applicable`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      return `Error generating code: ${error.message}`;
    }
  }

  public getMessageHistory(): ChatMessage[] {
    return this.messageHistory;
  }

  public addMessage(message: ChatMessage) {
    this.messageHistory.push(message);
  }

  public clearHistory() {
    this.messageHistory = [];
  }

  public isAvailable(): boolean {
    return !!this.model;
  }
}

export const aiChatAssistant = new AIChatAssistantService();
