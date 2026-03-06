// Real-time Code Validation & Linting Service
export interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  rule?: string;
  source: 'html' | 'css' | 'javascript';
}

export interface ValidationStats {
  errors: number;
  warnings: number;
  info: number;
  score: number;
}

class CodeValidationService {
  private static instance: CodeValidationService;

  private constructor() {}

  public static getInstance(): CodeValidationService {
    if (!CodeValidationService.instance) {
      CodeValidationService.instance = new CodeValidationService();
    }
    return CodeValidationService.instance;
  }

  /**
   * Validate HTML code
   */
  public validateHTML(code: string): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check for unclosed tags
    const tagPattern = /<([a-z][a-z0-9]*)\b[^>]*>(.*?)<\/\1>|<([a-z][a-z0-9]*)\b[^>]*\/?>|<!--[\s\S]*?-->|[^<]+/gi;
    const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
    const stack: { tag: string; line: number }[] = [];

    const lines = code.split('\n');
    lines.forEach((line, lineIdx) => {
      const lineNum = lineIdx + 1;
      
      // Find opening tags
      const openTagMatches = line.matchAll(/<([a-z][a-z0-9]*)\b[^>]*>/gi);
      for (const match of openTagMatches) {
        const tagName = match[1].toLowerCase();
        if (!selfClosingTags.includes(tagName)) {
          stack.push({ tag: tagName, line: lineNum });
        }
      }

      // Find closing tags
      const closeTagMatches = line.matchAll(/<\/([a-z][a-z0-9]*)\s*>/gi);
      for (const match of closeTagMatches) {
        const tagName = match[1].toLowerCase();
        const lastOpen = stack[stack.length - 1];
        
        if (lastOpen && lastOpen.tag === tagName) {
          stack.pop();
        } else if (lastOpen) {
          errors.push({
            line: lineNum,
            column: match.index || 0,
            message: `Closing tag </${tagName}> doesn't match opening tag <${lastOpen.tag}>`,
            severity: 'error',
            rule: 'tag-mismatch',
            source: 'html',
          });
        }
      }
    });

    // Report unclosed tags
    stack.forEach(({ tag, line }) => {
      errors.push({
        line,
        column: 0,
        message: `Unclosed tag: <${tag}>`,
        severity: 'warning',
        rule: 'unclosed-tag',
        source: 'html',
      });
    });

    // Check for missing alt attributes on images
    const imgMatches = code.matchAll(/<img\b[^>]*>/gi);
    for (const match of imgMatches) {
      const imgTag = match[0];
      if (!imgTag.includes('alt=')) {
        const lineNum = code.substring(0, match.index).split('\n').length;
        errors.push({
          line: lineNum,
          column: match.index || 0,
          message: 'Image missing alt attribute for accessibility',
          severity: 'warning',
          rule: 'accessibility',
          source: 'html',
        });
      }
    }

    // Check for inline styles
    if (code.includes('style="')) {
      const lineNum = code.split('style="')[0].split('\n').length;
      errors.push({
        line: lineNum,
        column: 0,
        message: 'Avoid inline styles for better maintainability',
        severity: 'info',
        rule: 'best-practice',
        source: 'html',
      });
    }

    // Check for deprecated tags
    const deprecatedTags = ['font', 'center', 'marquee', 'blink', 'strike'];
    deprecatedTags.forEach(tag => {
      if (code.toLowerCase().includes(`<${tag}`)) {
        const lineNum = code.toLowerCase().split(`<${tag}`).length > 1 
          ? code.toLowerCase().split(`<${tag}`)[0].split('\n').length 
          : 1;
        errors.push({
          line: lineNum,
          column: 0,
          message: `Deprecated tag: <${tag}>. Use CSS instead.`,
          severity: 'warning',
          rule: 'deprecated',
          source: 'html',
        });
      }
    });

    return errors;
  }

  /**
   * Validate CSS code
   */
  public validateCSS(code: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const lines = code.split('\n');

    // Check for unclosed braces
    let braceCount = 0;
    lines.forEach((line, idx) => {
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      braceCount += openBraces - closeBraces;

      if (braceCount < 0) {
        errors.push({
          line: idx + 1,
          column: 0,
          message: 'Unexpected closing brace',
          severity: 'error',
          rule: 'syntax',
          source: 'css',
        });
      }
    });

    if (braceCount > 0) {
      errors.push({
        line: lines.length,
        column: 0,
        message: `Unclosed brace(s): ${braceCount} opening brace(s) without closing`,
        severity: 'error',
        rule: 'syntax',
        source: 'css',
      });
    }

    // Check for vendor prefixes
    const propertiesNeedingPrefixes = ['transform', 'transition', 'animation', 'flex', 'grid'];
    propertiesNeedingPrefixes.forEach(prop => {
      const regex = new RegExp(`\\b${prop}\\s*:`, 'gi');
      if (regex.test(code) && !code.includes(`-${prop}`)) {
        const lineNum = code.split(prop)[0].split('\n').length;
        errors.push({
          line: lineNum,
          column: 0,
          message: `Consider adding vendor prefixes for ${prop}`,
          severity: 'info',
          rule: 'compatibility',
          source: 'css',
        });
      }
    });

    // Check for !important overuse
    const importantCount = (code.match(/!important/gi) || []).length;
    if (importantCount > 5) {
      errors.push({
        line: 1,
        column: 0,
        message: `Excessive use of !important (${importantCount} times). Refactor CSS specificity instead.`,
        severity: 'warning',
        rule: 'best-practice',
        source: 'css',
      });
    }

    // Check for color contrast issues (simple check)
    const colorMatches = code.matchAll(/(color|background-color|background)\s*:\s*([^;]+)/gi);
    for (const match of colorMatches) {
      const value = match[2].trim().toLowerCase();
      if (value === '#fff' || value === 'white') {
        const lineNum = code.substring(0, match.index).split('\n').length;
        errors.push({
          line: lineNum,
          column: 0,
          message: 'Ensure sufficient color contrast for accessibility',
          severity: 'info',
          rule: 'accessibility',
          source: 'css',
        });
      }
    }

    return errors;
  }

  /**
   * Validate JavaScript code
   */
  public validateJavaScript(code: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const lines = code.split('\n');

    // Check for console.log statements
    const consoleMatches = code.matchAll(/console\.(log|warn|error|info)/g);
    for (const match of consoleMatches) {
      const lineNum = code.substring(0, match.index).split('\n').length;
      errors.push({
        line: lineNum,
        column: 0,
        message: 'Remove console statements before production',
        severity: 'warning',
        rule: 'debugging',
        source: 'javascript',
      });
    }

    // Check for var usage
    const varMatches = code.matchAll(/\bvar\s+/g);
    for (const match of varMatches) {
      const lineNum = code.substring(0, match.index).split('\n').length;
      errors.push({
        line: lineNum,
        column: 0,
        message: 'Use let or const instead of var',
        severity: 'info',
        rule: 'modern-js',
        source: 'javascript',
      });
    }

    // Check for == instead of ===
    const looseEqualityMatches = code.matchAll(/[^!=]==[^=]/g);
    for (const match of looseEqualityMatches) {
      const lineNum = code.substring(0, match.index).split('\n').length;
      errors.push({
        line: lineNum,
        column: 0,
        message: 'Use === instead of == for strict equality',
        severity: 'warning',
        rule: 'equality',
        source: 'javascript',
      });
    }

    // Check for unclosed braces/parentheses
    let braceCount = 0;
    let parenCount = 0;
    lines.forEach((line, idx) => {
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;
      
      braceCount += openBraces - closeBraces;
      parenCount += openParens - closeParens;

      if (braceCount < 0) {
        errors.push({
          line: idx + 1,
          column: 0,
          message: 'Unexpected closing brace',
          severity: 'error',
          rule: 'syntax',
          source: 'javascript',
        });
      }
      if (parenCount < 0) {
        errors.push({
          line: idx + 1,
          column: 0,
          message: 'Unexpected closing parenthesis',
          severity: 'error',
          rule: 'syntax',
          source: 'javascript',
        });
      }
    });

    if (braceCount > 0) {
      errors.push({
        line: lines.length,
        column: 0,
        message: `Unclosed brace(s): ${braceCount}`,
        severity: 'error',
        rule: 'syntax',
        source: 'javascript',
      });
    }

    if (parenCount > 0) {
      errors.push({
        line: lines.length,
        column: 0,
        message: `Unclosed parenthesis(es): ${parenCount}`,
        severity: 'error',
        rule: 'syntax',
        source: 'javascript',
      });
    }

    // Check for debugger statements
    if (code.includes('debugger')) {
      const lineNum = code.split('debugger')[0].split('\n').length;
      errors.push({
        line: lineNum,
        column: 0,
        message: 'Remove debugger statement before production',
        severity: 'error',
        rule: 'debugging',
        source: 'javascript',
      });
    }

    // Check for eval usage
    if (code.includes('eval(')) {
      const lineNum = code.split('eval(')[0].split('\n').length;
      errors.push({
        line: lineNum,
        column: 0,
        message: 'Avoid eval() - security risk',
        severity: 'error',
        rule: 'security',
        source: 'javascript',
      });
    }

    return errors;
  }

  /**
   * Validate all code and return combined results
   */
  public validateAll(html: string, css: string, javascript: string): {
    html: ValidationError[];
    css: ValidationError[];
    javascript: ValidationError[];
    stats: ValidationStats;
  } {
    const htmlErrors = this.validateHTML(html);
    const cssErrors = this.validateCSS(css);
    const jsErrors = this.validateJavaScript(javascript);

    const allErrors = [...htmlErrors, ...cssErrors, ...jsErrors];
    const errors = allErrors.filter(e => e.severity === 'error').length;
    const warnings = allErrors.filter(e => e.severity === 'warning').length;
    const info = allErrors.filter(e => e.severity === 'info').length;

    // Calculate quality score (100 - penalties)
    const score = Math.max(0, 100 - (errors * 10) - (warnings * 3) - info);

    return {
      html: htmlErrors,
      css: cssErrors,
      javascript: jsErrors,
      stats: { errors, warnings, info, score },
    };
  }

  /**
   * Get validation icon/color based on score
   */
  public getValidationStatus(score: number): {
    icon: string;
    color: string;
    label: string;
  } {
    if (score >= 90) {
      return { icon: '✓', color: 'text-green-500', label: 'Excellent' };
    } else if (score >= 70) {
      return { icon: '✓', color: 'text-yellow-500', label: 'Good' };
    } else if (score >= 50) {
      return { icon: '⚠', color: 'text-orange-500', label: 'Needs Work' };
    } else {
      return { icon: '✗', color: 'text-red-500', label: 'Issues Found' };
    }
  }
}

export const codeValidationService = CodeValidationService.getInstance();
