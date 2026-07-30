// Security Service - Input Sanitization and Access Controls
import { SecurityConfig } from '../types/console.types';

// Default security configuration
const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  enableInputSanitization: true,
  allowedCommands: [],
  blockedCommands: ['rm -rf /', 'format', 'del /f /s /q', 'sudo rm -rf'],
  maxInputLength: 10000,
  enableAccessControl: false,
  roles: ['user', 'admin', 'developer'],
  permissions: {
    user: ['read', 'execute'],
    admin: ['read', 'execute', 'write', 'delete'],
    developer: ['read', 'execute', 'write', 'debug'],
  },
};

export class SecurityService {
  private config: SecurityConfig;
  private currentRole: string = 'user';
  private blockedPatterns: RegExp[] = [];
  private sanitizationRules: Array<{ pattern: RegExp; replacement: string }> = [];

  constructor() {
    this.config = this.loadConfig();
    this.initializeSecurityRules();
  }

  /**
   * Load security configuration
   */
  private loadConfig(): SecurityConfig {
    try {
      const saved = localStorage.getItem('console-security-config');
      if (saved) {
        return { ...DEFAULT_SECURITY_CONFIG, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load security config:', error);
    }
    return { ...DEFAULT_SECURITY_CONFIG };
  }

  /**
   * Save security configuration
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('console-security-config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save security config:', error);
    }
  }

  /**
   * Initialize security rules
   */
  private initializeSecurityRules(): void {
    // Blocked command patterns
    this.blockedPatterns = [
      /rm\s+-rf\s+\//gi,
      /format\s+[a-z]:/gi,
      /del\s+\/[fs]\s+\/[sq]/gi,
      /sudo\s+rm\s+-rf/gi,
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi, // Event handlers
      /eval\s*\(/gi,
      /exec\s*\(/gi,
      /system\s*\(/gi,
    ];

    // Sanitization rules
    this.sanitizationRules = [
      { pattern: /<script[^>]*>.*?<\/script>/gi, replacement: '' },
      { pattern: /<iframe[^>]*>.*?<\/iframe>/gi, replacement: '' },
      { pattern: /<object[^>]*>.*?<\/object>/gi, replacement: '' },
      { pattern: /<embed[^>]*>/gi, replacement: '' },
      { pattern: /javascript:/gi, replacement: '' },
      { pattern: /on\w+\s*=/gi, replacement: '' },
    ];
  }

  /**
   * Sanitize input
   */
  sanitizeInput(input: string): string {
    if (!this.config.enableInputSanitization) {
      return input;
    }

    let sanitized = input;

    // Check length
    if (sanitized.length > this.config.maxInputLength) {
      sanitized = sanitized.substring(0, this.config.maxInputLength);
    }

    // Apply sanitization rules
    for (const rule of this.sanitizationRules) {
      sanitized = sanitized.replace(rule.pattern, rule.replacement);
    }

    // Escape HTML special characters
    sanitized = this.escapeHTML(sanitized);

    return sanitized;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Validate command
   */
  validateCommand(command: string): {
    valid: boolean;
    reason?: string;
    sanitized?: string;
  } {
    // Check if command is blocked
    if (this.isCommandBlocked(command)) {
      return {
        valid: false,
        reason: 'Command is blocked for security reasons',
      };
    }

    // Check if command matches blocked patterns
    for (const pattern of this.blockedPatterns) {
      if (pattern.test(command)) {
        return {
          valid: false,
          reason: 'Command contains blocked pattern',
        };
      }
    }

    // Check if only allowed commands are enabled
    if (this.config.allowedCommands && this.config.allowedCommands.length > 0) {
      const commandName = command.split(/\s+/)[0];
      if (!this.config.allowedCommands.includes(commandName)) {
        return {
          valid: false,
          reason: 'Command is not in allowed list',
        };
      }
    }

    // Sanitize command
    const sanitized = this.sanitizeInput(command);

    return {
      valid: true,
      sanitized,
    };
  }

  /**
   * Check if command is blocked
   */
  private isCommandBlocked(command: string): boolean {
    if (!this.config.blockedCommands) return false;

    const commandLower = command.toLowerCase().trim();
    
    for (const blocked of this.config.blockedCommands) {
      if (commandLower.includes(blocked.toLowerCase())) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check permission
   */
  hasPermission(permission: string): boolean {
    if (!this.config.enableAccessControl) {
      return true;
    }

    const rolePermissions = this.config.permissions?.[this.currentRole];
    if (!rolePermissions) {
      return false;
    }

    return rolePermissions.includes(permission);
  }

  /**
   * Set current role
   */
  setRole(role: string): boolean {
    if (!this.config.roles?.includes(role)) {
      console.error('Invalid role:', role);
      return false;
    }

    this.currentRole = role;
    return true;
  }

  /**
   * Get current role
   */
  getRole(): string {
    return this.currentRole;
  }

  /**
   * Get available roles
   */
  getRoles(): string[] {
    return this.config.roles || [];
  }

  /**
   * Get role permissions
   */
  getRolePermissions(role: string): string[] {
    return this.config.permissions?.[role] || [];
  }

  /**
   * Add allowed command
   */
  addAllowedCommand(command: string): void {
    if (!this.config.allowedCommands) {
      this.config.allowedCommands = [];
    }

    if (!this.config.allowedCommands.includes(command)) {
      this.config.allowedCommands.push(command);
      this.saveConfig();
    }
  }

  /**
   * Remove allowed command
   */
  removeAllowedCommand(command: string): boolean {
    if (!this.config.allowedCommands) return false;

    const index = this.config.allowedCommands.indexOf(command);
    if (index !== -1) {
      this.config.allowedCommands.splice(index, 1);
      this.saveConfig();
      return true;
    }

    return false;
  }

  /**
   * Add blocked command
   */
  addBlockedCommand(command: string): void {
    if (!this.config.blockedCommands) {
      this.config.blockedCommands = [];
    }

    if (!this.config.blockedCommands.includes(command)) {
      this.config.blockedCommands.push(command);
      this.saveConfig();
    }
  }

  /**
   * Remove blocked command
   */
  removeBlockedCommand(command: string): boolean {
    if (!this.config.blockedCommands) return false;

    const index = this.config.blockedCommands.indexOf(command);
    if (index !== -1) {
      this.config.blockedCommands.splice(index, 1);
      this.saveConfig();
      return true;
    }

    return false;
  }

  /**
   * Update security configuration
   */
  updateConfig(updates: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  /**
   * Get security configuration
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Reset to default configuration
   */
  resetToDefaults(): void {
    this.config = { ...DEFAULT_SECURITY_CONFIG };
    this.saveConfig();
  }

  /**
   * Validate URL
   */
  validateURL(url: string): boolean {
    try {
      const parsed = new URL(url);
      
      // Block dangerous protocols
      const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
      if (dangerousProtocols.includes(parsed.protocol)) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize URL
   */
  sanitizeURL(url: string): string | null {
    if (!this.validateURL(url)) {
      return null;
    }

    try {
      const parsed = new URL(url);
      return parsed.toString();
    } catch {
      return null;
    }
  }

  /**
   * Validate JSON
   */
  validateJSON(json: string): { valid: boolean; error?: string } {
    try {
      JSON.parse(json);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid JSON',
      };
    }
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(filename: string): string {
    // Remove path traversal attempts
    let sanitized = filename.replace(/\.\./g, '');
    
    // Remove special characters
    sanitized = sanitized.replace(/[<>:"|?*]/g, '');
    
    // Remove leading/trailing spaces and dots
    sanitized = sanitized.trim().replace(/^\.+|\.+$/g, '');
    
    // Limit length
    if (sanitized.length > 255) {
      sanitized = sanitized.substring(0, 255);
    }

    return sanitized;
  }

  /**
   * Check for SQL injection patterns
   */
  detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      /(\bUNION\b.*\bSELECT\b)/gi,
      /(;|--|\/\*|\*\/)/g,
      /(\bOR\b.*=.*)/gi,
      /(\bAND\b.*=.*)/gi,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check for XSS patterns
   */
  detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /eval\s*\(/gi,
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate security report
   */
  generateSecurityReport(): {
    config: SecurityConfig;
    currentRole: string;
    blockedCommandsCount: number;
    allowedCommandsCount: number;
    sanitizationEnabled: boolean;
    accessControlEnabled: boolean;
  } {
    return {
      config: this.getConfig(),
      currentRole: this.currentRole,
      blockedCommandsCount: this.config.blockedCommands?.length || 0,
      allowedCommandsCount: this.config.allowedCommands?.length || 0,
      sanitizationEnabled: this.config.enableInputSanitization,
      accessControlEnabled: this.config.enableAccessControl,
    };
  }

  /**
   * Audit log entry
   */
  auditLog(action: string, details: Record<string, any>): void {
    const entry = {
      timestamp: new Date().toISOString(),
      role: this.currentRole,
      action,
      details,
    };

    // Save to audit log
    try {
      const logs = JSON.parse(localStorage.getItem('console-audit-log') || '[]');
      logs.push(entry);
      
      // Keep only last 1000 entries
      if (logs.length > 1000) {
        logs.shift();
      }

      localStorage.setItem('console-audit-log', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to save audit log:', error);
    }
  }

  /**
   * Get audit logs
   */
  getAuditLogs(limit: number = 100): Array<{
    timestamp: string;
    role: string;
    action: string;
    details: Record<string, any>;
  }> {
    try {
      const logs = JSON.parse(localStorage.getItem('console-audit-log') || '[]');
      return logs.slice(-limit).reverse();
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      return [];
    }
  }

  /**
   * Clear audit logs
   */
  clearAuditLogs(): void {
    localStorage.removeItem('console-audit-log');
  }
}

// Export singleton instance
export const securityService = new SecurityService();
