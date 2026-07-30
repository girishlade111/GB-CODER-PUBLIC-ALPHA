// Intelligent Auto-Completion System
import { AutoCompleteItem, AutoCompleteContext } from '../types/console.types';

// Command database with descriptions
const COMMAND_DATABASE: Record<string, { description: string; args?: string[] }> = {
  // File operations
  'ls': { description: 'List directory contents', args: ['-l', '-a', '-h'] },
  'cd': { description: 'Change directory', args: ['..', '~', '/'] },
  'pwd': { description: 'Print working directory' },
  'mkdir': { description: 'Create directory', args: ['-p'] },
  'rm': { description: 'Remove files/directories', args: ['-r', '-f', '-rf'] },
  'cp': { description: 'Copy files/directories', args: ['-r', '-v'] },
  'mv': { description: 'Move/rename files', args: ['-v'] },
  'cat': { description: 'Display file contents' },
  'touch': { description: 'Create empty file' },
  
  // Code operations
  'run': { description: 'Execute current code' },
  'clear': { description: 'Clear console output' },
  'download': { description: 'Download current project' },
  'export-session': { description: 'Export session data', args: ['json', 'csv', 'txt'] },
  'import-session': { description: 'Import session data' },
  
  // Git commands
  'git': { description: 'Git version control', args: ['init', 'add', 'commit', 'push', 'pull', 'status', 'log', 'branch', 'checkout', 'merge'] },
  'git init': { description: 'Initialize git repository' },
  'git add': { description: 'Add files to staging', args: ['.', '-A'] },
  'git commit': { description: 'Commit changes', args: ['-m', '-am'] },
  'git push': { description: 'Push to remote' },
  'git pull': { description: 'Pull from remote' },
  'git status': { description: 'Show working tree status' },
  
  // NPM commands
  'npm': { description: 'Node package manager', args: ['install', 'uninstall', 'update', 'list', 'run', 'init', 'test'] },
  'npm install': { description: 'Install packages', args: ['--save', '--save-dev', '-g'] },
  'npm uninstall': { description: 'Uninstall packages' },
  'npm list': { description: 'List installed packages' },
  'npm run': { description: 'Run script' },
  
  // System commands
  'echo': { description: 'Display message' },
  'env': { description: 'Show environment variables' },
  'export': { description: 'Set environment variable' },
  'history': { description: 'Show command history' },
  'help': { description: 'Show available commands' },
  'status': { description: 'Show system status' },
  'theme': { description: 'Change theme', args: ['dark', 'light', 'monokai', 'solarized', 'dracula', 'nord'] },
  
  // Debug commands
  'debug': { description: 'Toggle debug mode', args: ['on', 'off'] },
  'breakpoint': { description: 'Set breakpoint', args: ['add', 'remove', 'list'] },
  'step': { description: 'Step through code' },
  'continue': { description: 'Continue execution' },
  'inspect': { description: 'Inspect variable' },
  
  // Performance commands
  'benchmark': { description: 'Run performance benchmark' },
  'profile': { description: 'Profile code execution' },
  'memory': { description: 'Show memory usage' },
  'cpu': { description: 'Show CPU usage' },
};

// JavaScript/TypeScript keywords and functions
const JS_KEYWORDS = [
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally',
  'throw', 'async', 'await', 'class', 'extends', 'import', 'export', 'default',
  'from', 'new', 'this', 'super', 'static', 'get', 'set', 'typeof', 'instanceof',
];

const JS_FUNCTIONS = [
  'console.log', 'console.error', 'console.warn', 'console.info',
  'Array.from', 'Array.isArray', 'Object.keys', 'Object.values', 'Object.entries',
  'JSON.parse', 'JSON.stringify', 'Math.random', 'Math.floor', 'Math.ceil',
  'parseInt', 'parseFloat', 'setTimeout', 'setInterval', 'Promise.resolve',
  'Promise.reject', 'fetch', 'document.querySelector', 'document.getElementById',
];

export class AutoCompleteService {
  private customCommands: Map<string, AutoCompleteItem> = new Map();
  private recentCommands: string[] = [];
  private maxRecentCommands = 50;

  /**
   * Get auto-complete suggestions
   */
  getSuggestions(context: AutoCompleteContext): AutoCompleteItem[] {
    const { currentInput, cursorPosition } = context;
    const beforeCursor = currentInput.substring(0, cursorPosition);
    const words = beforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1] || '';

    if (!currentWord) {
      return this.getTopSuggestions();
    }

    const suggestions: AutoCompleteItem[] = [];

    // Command suggestions
    suggestions.push(...this.getCommandSuggestions(currentWord));

    // Keyword suggestions
    suggestions.push(...this.getKeywordSuggestions(currentWord));

    // Function suggestions
    suggestions.push(...this.getFunctionSuggestions(currentWord));

    // Variable suggestions
    suggestions.push(...this.getVariableSuggestions(currentWord, context));

    // Recent command suggestions
    suggestions.push(...this.getRecentCommandSuggestions(currentWord));

    // Custom command suggestions
    suggestions.push(...this.getCustomCommandSuggestions(currentWord));

    // Sort by score and relevance
    return this.rankSuggestions(suggestions).slice(0, 10);
  }

  /**
   * Get command suggestions
   */
  private getCommandSuggestions(input: string): AutoCompleteItem[] {
    const suggestions: AutoCompleteItem[] = [];
    const lowerInput = input.toLowerCase();

    for (const [command, info] of Object.entries(COMMAND_DATABASE)) {
      if (command.toLowerCase().startsWith(lowerInput)) {
        suggestions.push({
          value: command,
          label: command,
          description: info.description,
          type: 'command',
          score: this.calculateScore(command, input),
          metadata: { args: info.args },
        });
      }
    }

    return suggestions;
  }

  /**
   * Get keyword suggestions
   */
  private getKeywordSuggestions(input: string): AutoCompleteItem[] {
    const suggestions: AutoCompleteItem[] = [];
    const lowerInput = input.toLowerCase();

    for (const keyword of JS_KEYWORDS) {
      if (keyword.toLowerCase().startsWith(lowerInput)) {
        suggestions.push({
          value: keyword,
          label: keyword,
          description: `JavaScript keyword: ${keyword}`,
          type: 'keyword',
          score: this.calculateScore(keyword, input),
        });
      }
    }

    return suggestions;
  }

  /**
   * Get function suggestions
   */
  private getFunctionSuggestions(input: string): AutoCompleteItem[] {
    const suggestions: AutoCompleteItem[] = [];
    const lowerInput = input.toLowerCase();

    for (const func of JS_FUNCTIONS) {
      if (func.toLowerCase().startsWith(lowerInput)) {
        suggestions.push({
          value: func,
          label: func,
          description: `JavaScript function: ${func}`,
          type: 'function',
          score: this.calculateScore(func, input),
        });
      }
    }

    return suggestions;
  }

  /**
   * Get variable suggestions from environment
   */
  private getVariableSuggestions(input: string, context: AutoCompleteContext): AutoCompleteItem[] {
    const suggestions: AutoCompleteItem[] = [];
    const lowerInput = input.toLowerCase();

    for (const [key, value] of Object.entries(context.environment)) {
      if (key.toLowerCase().startsWith(lowerInput)) {
        suggestions.push({
          value: key,
          label: key,
          description: `Variable: ${typeof value}`,
          type: 'variable',
          score: this.calculateScore(key, input),
          metadata: { value },
        });
      }
    }

    return suggestions;
  }

  /**
   * Get recent command suggestions
   */
  private getRecentCommandSuggestions(input: string): AutoCompleteItem[] {
    const suggestions: AutoCompleteItem[] = [];
    const lowerInput = input.toLowerCase();
    const seen = new Set<string>();

    for (const command of this.recentCommands) {
      if (command.toLowerCase().startsWith(lowerInput) && !seen.has(command)) {
        seen.add(command);
        suggestions.push({
          value: command,
          label: command,
          description: 'Recent command',
          type: 'command',
          score: this.calculateScore(command, input) + 10, // Boost recent commands
        });
      }
    }

    return suggestions;
  }

  /**
   * Get custom command suggestions
   */
  private getCustomCommandSuggestions(input: string): AutoCompleteItem[] {
    const suggestions: AutoCompleteItem[] = [];
    const lowerInput = input.toLowerCase();

    for (const [key, item] of this.customCommands) {
      if (key.toLowerCase().startsWith(lowerInput)) {
        suggestions.push({
          ...item,
          score: this.calculateScore(key, input) + 5, // Boost custom commands
        });
      }
    }

    return suggestions;
  }

  /**
   * Get top suggestions when no input
   */
  private getTopSuggestions(): AutoCompleteItem[] {
    const suggestions: AutoCompleteItem[] = [];

    // Add most common commands
    const topCommands = ['help', 'run', 'clear', 'ls', 'cd', 'npm install', 'git status'];
    for (const command of topCommands) {
      const info = COMMAND_DATABASE[command];
      if (info) {
        suggestions.push({
          value: command,
          label: command,
          description: info.description,
          type: 'command',
          score: 100,
        });
      }
    }

    // Add recent commands
    const recentUnique = [...new Set(this.recentCommands)].slice(0, 5);
    for (const command of recentUnique) {
      suggestions.push({
        value: command,
        label: command,
        description: 'Recent command',
        type: 'command',
        score: 90,
      });
    }

    return suggestions;
  }

  /**
   * Calculate relevance score
   */
  private calculateScore(suggestion: string, input: string): number {
    if (!input) return 50;

    const lowerSuggestion = suggestion.toLowerCase();
    const lowerInput = input.toLowerCase();

    // Exact match
    if (lowerSuggestion === lowerInput) return 100;

    // Starts with input
    if (lowerSuggestion.startsWith(lowerInput)) {
      return 80 + (input.length / Math.max(suggestion.length, 1)) * 20;
    }

    // Contains input
    if (lowerSuggestion.includes(lowerInput)) {
      return 60;
    }

    // Fuzzy match
    const fuzzyScore = this.fuzzyMatch(lowerSuggestion, lowerInput);
    return Math.round(fuzzyScore * 50);
  }

  /**
   * Fuzzy matching algorithm
   */
  private fuzzyMatch(text: string, pattern: string): number {
    let score = 0;
    let patternIdx = 0;
    let textIdx = 0;

    while (textIdx < text.length && patternIdx < pattern.length) {
      if (text[textIdx] === pattern[patternIdx]) {
        score++;
        patternIdx++;
      }
      textIdx++;
    }

    return patternIdx === pattern.length ? score / pattern.length : 0;
  }

  /**
   * Rank and sort suggestions
   */
  private rankSuggestions(suggestions: AutoCompleteItem[]): AutoCompleteItem[] {
    // Remove duplicates
    const seen = new Set<string>();
    const unique = suggestions.filter(item => {
      if (seen.has(item.value)) return false;
      seen.add(item.value);
      return true;
    });

    // Sort by score (descending)
    return unique.sort((a, b) => b.score - a.score);
  }

  /**
   * Add command to history
   */
  addToHistory(command: string): void {
    this.recentCommands.unshift(command);
    if (this.recentCommands.length > this.maxRecentCommands) {
      this.recentCommands.pop();
    }
  }

  /**
   * Register custom command
   */
  registerCommand(item: AutoCompleteItem): void {
    this.customCommands.set(item.value, item);
  }

  /**
   * Unregister custom command
   */
  unregisterCommand(value: string): void {
    this.customCommands.delete(value);
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.recentCommands = [];
  }

  /**
   * Get command info
   */
  getCommandInfo(command: string): { description: string; args?: string[] } | undefined {
    return COMMAND_DATABASE[command];
  }

  /**
   * Get all available commands
   */
  getAllCommands(): string[] {
    return Object.keys(COMMAND_DATABASE);
  }

  /**
   * Export history
   */
  exportHistory(): string[] {
    return [...this.recentCommands];
  }

  /**
   * Import history
   */
  importHistory(history: string[]): void {
    this.recentCommands = history.slice(0, this.maxRecentCommands);
  }
}

// Export singleton instance
export const autoCompleteService = new AutoCompleteService();
