/**
 * Tool Registry for GB Assist (Phase 3B).
 *
 * Manages registered tools, schema validation, API-format serialization
 * (OpenAI & Gemini), runtime arguments validation, and tool execution dispatch.
 */

import { AgentToolDefinition, ToolExecutionContext, ToolExecutionResult } from './types';
import { BUILTIN_TOOLS } from './builtinTools';

export class ToolRegistry {
  private static tools = new Map<string, AgentToolDefinition>();

  static {
    // Register all initial built-in tools on startup
    for (const tool of BUILTIN_TOOLS) {
      this.tools.set(tool.name, tool);
    }
  }

  /**
   * Registers a new or custom agent tool.
   */
  public static registerTool(tool: AgentToolDefinition): void {
    if (!tool.name || typeof tool.name !== 'string') {
      throw new Error('Tool must have a valid name.');
    }
    this.tools.set(tool.name, tool);
  }

  /**
   * Retrieves a tool definition by name.
   */
  public static getTool(name: string): AgentToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Returns all registered tools.
   */
  public static getAllTools(): AgentToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Converts registered tools to OpenAI / OpenRouter function calling format.
   */
  public static getOpenAiToolDefinitions(): Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: object;
    };
  }> {
    return Array.from(this.tools.values()).map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  /**
   * Alias for getOpenAiToolDefinitions.
   */
  public static getOpenAiTools() {
    return this.getOpenAiToolDefinitions();
  }

  /**
   * Converts registered tools to Google Gemini function declaration format.
   */
  public static getGeminiFunctionDeclarations(): Array<{
    name: string;
    description: string;
    parameters: object;
  }> {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    }));
  }

  /**
   * Alias for validateArgs.
   */
  public static validateToolCall(
    toolName: string,
    rawArgs: unknown
  ): { valid: boolean; error?: string; cleanArgs?: Record<string, unknown> } {
    return this.validateArgs(toolName, rawArgs);
  }

  /**
   * Validates tool input arguments against its JSON Schema definition at runtime.
   */
  public static validateArgs(
    toolName: string,
    rawArgs: unknown
  ): { valid: boolean; error?: string; cleanArgs?: Record<string, unknown> } {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return {
        valid: false,
        error: `Unknown tool: "${toolName}".`,
      };
    }

    let parsedArgs: Record<string, unknown>;
    if (typeof rawArgs === 'string') {
      try {
        parsedArgs = JSON.parse(rawArgs);
      } catch (err) {
        return {
          valid: false,
          error: `Malformed JSON arguments for tool "${toolName}": ${err instanceof Error ? err.message : String(err)}`,
        };
      }
    } else if (typeof rawArgs === 'object' && rawArgs !== null && !Array.isArray(rawArgs)) {
      parsedArgs = rawArgs as Record<string, unknown>;
    } else {
      return {
        valid: false,
        error: `Arguments for tool "${toolName}" must be an object. Received ${typeof rawArgs}.`,
      };
    }

    const { properties = {}, required = [] } = tool.parameters;

    // Check required fields
    for (const reqField of required) {
      if (parsedArgs[reqField] === undefined || parsedArgs[reqField] === null) {
        return {
          valid: false,
          error: `Missing required parameter "${reqField}" for tool "${toolName}".`,
        };
      }
    }

    // Type check provided properties
    for (const [key, value] of Object.entries(parsedArgs)) {
      const propDef = properties[key];
      if (!propDef) continue; // allow extra parameters or ignore

      if (value !== undefined && value !== null) {
        if (propDef.type === 'string' && typeof value !== 'string') {
          return { valid: false, error: `Parameter "${key}" must be a string, got ${typeof value}.` };
        }
        if (propDef.type === 'number' && typeof value !== 'number') {
          return { valid: false, error: `Parameter "${key}" must be a number, got ${typeof value}.` };
        }
        if (propDef.type === 'boolean' && typeof value !== 'boolean') {
          return { valid: false, error: `Parameter "${key}" must be a boolean, got ${typeof value}.` };
        }
        if (propDef.type === 'array' && !Array.isArray(value)) {
          return { valid: false, error: `Parameter "${key}" must be an array.` };
        }
        if (propDef.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
          return { valid: false, error: `Parameter "${key}" must be an object.` };
        }
      }
    }

    return {
      valid: true,
      cleanArgs: parsedArgs,
    };
  }

  /**
   * Executes a tool by name with arguments and context.
   */
  public static async executeTool(
    toolName: string,
    rawArgs: unknown,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return {
        success: false,
        error: `Tool "${toolName}" not found in registry.`,
        errorCode: 'TOOL_NOT_FOUND',
      };
    }

    const validation = this.validateArgs(toolName, rawArgs);
    if (!validation.valid || !validation.cleanArgs) {
      return {
        success: false,
        error: validation.error || `Invalid arguments for "${toolName}".`,
        errorCode: 'INVALID_ARGUMENTS',
      };
    }

    const start = performance.now();
    try {
      const res = await tool.execute(validation.cleanArgs, context);
      const durationMs = Math.round(performance.now() - start);
      return {
        ...res,
        durationMs: res.durationMs ?? durationMs,
      };
    } catch (err: unknown) {
      const durationMs = Math.round(performance.now() - start);
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `Tool execution failed: ${msg}`,
        errorCode: 'EXECUTION_FAILED',
        durationMs,
      };
    }
  }
}
