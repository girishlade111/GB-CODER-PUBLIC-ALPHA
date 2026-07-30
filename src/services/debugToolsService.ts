// Error Highlighting and Debugging Tools Service
import { DebugInfo } from '../types/console.types';

export interface Breakpoint {
  id: string;
  line: number;
  file?: string;
  condition?: string;
  enabled: boolean;
  hitCount: number;
}

export interface StackFrame {
  id: string;
  name: string;
  file?: string;
  line?: number;
  column?: number;
  source?: string;
}

export interface Variable {
  name: string;
  value: any;
  type: string;
  scope: 'local' | 'global' | 'closure';
  expandable: boolean;
  children?: Variable[];
}

export interface ErrorInfo {
  id: string;
  message: string;
  type: string;
  stack?: string;
  file?: string;
  line?: number;
  column?: number;
  timestamp: number;
  context?: Record<string, any>;
  suggestions?: string[];
}

export interface DebugSession {
  id: string;
  status: 'idle' | 'running' | 'paused' | 'stopped';
  breakpoints: Breakpoint[];
  callStack: StackFrame[];
  variables: Variable[];
  currentFrame?: StackFrame;
  errors: ErrorInfo[];
}

export class DebugToolsService {
  private session: DebugSession;
  private errorPatterns: Map<RegExp, { type: string; suggestions: string[] }> = new Map();
  private listeners: Set<(session: DebugSession) => void> = new Set();

  constructor() {
    this.session = this.createSession();
    this.initializeErrorPatterns();
  }

  /**
   * Create new debug session
   */
  private createSession(): DebugSession {
    return {
      id: `debug-${Date.now()}`,
      status: 'idle',
      breakpoints: [],
      callStack: [],
      variables: [],
      errors: [],
    };
  }

  /**
   * Initialize common error patterns
   */
  private initializeErrorPatterns(): void {
    // JavaScript errors
    this.errorPatterns.set(
      /TypeError: Cannot read propert(y|ies) .* of (undefined|null)/i,
      {
        type: 'TypeError',
        suggestions: [
          'Check if the object exists before accessing its properties',
          'Use optional chaining (?.) to safely access nested properties',
          'Add null/undefined checks before the operation',
        ],
      }
    );

    this.errorPatterns.set(
      /ReferenceError: .* is not defined/i,
      {
        type: 'ReferenceError',
        suggestions: [
          'Check if the variable is declared before use',
          'Verify the variable name spelling',
          'Ensure the variable is in scope',
          'Import the module if it\'s from an external source',
        ],
      }
    );

    this.errorPatterns.set(
      /SyntaxError: Unexpected token/i,
      {
        type: 'SyntaxError',
        suggestions: [
          'Check for missing brackets, parentheses, or quotes',
          'Verify JSON syntax if parsing JSON',
          'Look for typos in keywords',
        ],
      }
    );

    this.errorPatterns.set(
      /RangeError: Maximum call stack size exceeded/i,
      {
        type: 'RangeError',
        suggestions: [
          'Check for infinite recursion',
          'Add base case to recursive functions',
          'Consider using iteration instead of recursion',
        ],
      }
    );

    this.errorPatterns.set(
      /NetworkError|Failed to fetch|CORS/i,
      {
        type: 'NetworkError',
        suggestions: [
          'Check network connectivity',
          'Verify the API endpoint URL',
          'Check CORS configuration on the server',
          'Ensure the server is running',
        ],
      }
    );

    this.errorPatterns.set(
      /ENOENT|no such file or directory/i,
      {
        type: 'FileError',
        suggestions: [
          'Verify the file path is correct',
          'Check if the file exists',
          'Ensure proper permissions',
        ],
      }
    );
  }

  /**
   * Parse error and extract information
   */
  parseError(error: Error | string): ErrorInfo {
    const errorString = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'object' ? error.stack : undefined;

    // Extract file and line info from stack
    let file: string | undefined;
    let line: number | undefined;
    let column: number | undefined;

    if (stack) {
      const match = stack.match(/at\s+.*\s+\((.+):(\d+):(\d+)\)/);
      if (match) {
        file = match[1];
        line = parseInt(match[2]);
        column = parseInt(match[3]);
      }
    }

    // Find matching error pattern
    let type = 'Error';
    let suggestions: string[] = [];

    for (const [pattern, info] of this.errorPatterns) {
      if (pattern.test(errorString)) {
        type = info.type;
        suggestions = info.suggestions;
        break;
      }
    }

    const errorInfo: ErrorInfo = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: errorString,
      type,
      stack,
      file,
      line,
      column,
      timestamp: Date.now(),
      suggestions,
    };

    // Add to session
    this.session.errors.push(errorInfo);
    this.notifyListeners();

    return errorInfo;
  }

  /**
   * Highlight error in code
   */
  highlightError(code: string, errorInfo: ErrorInfo): string {
    if (!errorInfo.line) return code;

    const lines = code.split('\n');
    const errorLine = errorInfo.line - 1;

    if (errorLine >= 0 && errorLine < lines.length) {
      // Add error marker
      lines[errorLine] = `>>> ${lines[errorLine]} <<< ERROR: ${errorInfo.message}`;
    }

    return lines.join('\n');
  }

  /**
   * Add breakpoint
   */
  addBreakpoint(line: number, options?: {
    file?: string;
    condition?: string;
  }): Breakpoint {
    const breakpoint: Breakpoint = {
      id: `bp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      line,
      file: options?.file,
      condition: options?.condition,
      enabled: true,
      hitCount: 0,
    };

    this.session.breakpoints.push(breakpoint);
    this.notifyListeners();

    return breakpoint;
  }

  /**
   * Remove breakpoint
   */
  removeBreakpoint(id: string): boolean {
    const index = this.session.breakpoints.findIndex(bp => bp.id === id);
    if (index !== -1) {
      this.session.breakpoints.splice(index, 1);
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Toggle breakpoint
   */
  toggleBreakpoint(id: string): boolean {
    const breakpoint = this.session.breakpoints.find(bp => bp.id === id);
    if (breakpoint) {
      breakpoint.enabled = !breakpoint.enabled;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Get all breakpoints
   */
  getBreakpoints(): Breakpoint[] {
    return [...this.session.breakpoints];
  }

  /**
   * Clear all breakpoints
   */
  clearBreakpoints(): void {
    this.session.breakpoints = [];
    this.notifyListeners();
  }

  /**
   * Start debugging
   */
  startDebugging(): void {
    this.session.status = 'running';
    this.notifyListeners();
  }

  /**
   * Pause debugging
   */
  pauseDebugging(): void {
    this.session.status = 'paused';
    this.notifyListeners();
  }

  /**
   * Resume debugging
   */
  resumeDebugging(): void {
    this.session.status = 'running';
    this.notifyListeners();
  }

  /**
   * Stop debugging
   */
  stopDebugging(): void {
    this.session.status = 'stopped';
    this.session.callStack = [];
    this.session.variables = [];
    this.session.currentFrame = undefined;
    this.notifyListeners();
  }

  /**
   * Step over
   */
  stepOver(): void {
    // Simulate step over
    this.notifyListeners();
  }

  /**
   * Step into
   */
  stepInto(): void {
    // Simulate step into
    this.notifyListeners();
  }

  /**
   * Step out
   */
  stepOut(): void {
    // Simulate step out
    this.notifyListeners();
  }

  /**
   * Add stack frame
   */
  addStackFrame(frame: Omit<StackFrame, 'id'>): StackFrame {
    const stackFrame: StackFrame = {
      id: `frame-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...frame,
    };

    this.session.callStack.push(stackFrame);
    this.notifyListeners();

    return stackFrame;
  }

  /**
   * Clear call stack
   */
  clearCallStack(): void {
    this.session.callStack = [];
    this.notifyListeners();
  }

  /**
   * Get call stack
   */
  getCallStack(): StackFrame[] {
    return [...this.session.callStack];
  }

  /**
   * Add variable
   */
  addVariable(variable: Variable): void {
    this.session.variables.push(variable);
    this.notifyListeners();
  }

  /**
   * Update variable
   */
  updateVariable(name: string, value: any): boolean {
    const variable = this.session.variables.find(v => v.name === name);
    if (variable) {
      variable.value = value;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Get variables
   */
  getVariables(): Variable[] {
    return [...this.session.variables];
  }

  /**
   * Clear variables
   */
  clearVariables(): void {
    this.session.variables = [];
    this.notifyListeners();
  }

  /**
   * Evaluate expression
   */
  evaluateExpression(expression: string): { value: any; type: string; error?: string } {
    try {
      // WARNING: eval is dangerous - this is for demonstration only
      // In production, use a safe expression evaluator
      const value = eval(expression);
      return {
        value,
        type: typeof value,
      };
    } catch (error) {
      return {
        value: undefined,
        type: 'error',
        error: error instanceof Error ? error.message : 'Evaluation failed',
      };
    }
  }

  /**
   * Get debug session
   */
  getSession(): DebugSession {
    return { ...this.session };
  }

  /**
   * Get errors
   */
  getErrors(): ErrorInfo[] {
    return [...this.session.errors];
  }

  /**
   * Clear errors
   */
  clearErrors(): void {
    this.session.errors = [];
    this.notifyListeners();
  }

  /**
   * Get error suggestions
   */
  getErrorSuggestions(errorMessage: string): string[] {
    for (const [pattern, info] of this.errorPatterns) {
      if (pattern.test(errorMessage)) {
        return info.suggestions;
      }
    }
    return [];
  }

  /**
   * Format stack trace
   */
  formatStackTrace(stack: string): string[] {
    return stack
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('at '));
  }

  /**
   * Subscribe to session changes
   */
  subscribe(callback: (session: DebugSession) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify listeners
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.session);
    }
  }

  /**
   * Reset session
   */
  resetSession(): void {
    this.session = this.createSession();
    this.notifyListeners();
  }

  /**
   * Export debug data
   */
  exportDebugData(): string {
    return JSON.stringify({
      session: this.session,
      timestamp: Date.now(),
    }, null, 2);
  }

  /**
   * Import debug data
   */
  importDebugData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (parsed.session) {
        this.session = parsed.session;
        this.notifyListeners();
        return true;
      }
    } catch (error) {
      console.error('Failed to import debug data:', error);
    }
    return false;
  }

  /**
   * Get debug info for console types
   */
  getDebugInfo(): DebugInfo {
    return {
      breakpoints: this.session.breakpoints.map(bp => bp.line),
      variables: this.session.variables.reduce((acc, v) => {
        acc[v.name] = v.value;
        return acc;
      }, {} as Record<string, any>),
      callStack: this.session.callStack.map(f => f.name),
      currentLine: this.session.currentFrame?.line,
      isDebugging: this.session.status !== 'idle' && this.session.status !== 'stopped',
    };
  }
}

// Export singleton instance
export const debugToolsService = new DebugToolsService();
