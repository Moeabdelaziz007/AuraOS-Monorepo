/**
 * BASIC Interpreter MCP Server
 * Provides BASIC code execution through MCP protocol
 */

import { BaseMCPServer } from '../../../ai/src/mcp/server';
import { Tool } from '../../../ai/src/mcp/types';

interface BasicVariable {
  name: string;
  value: number | string;
}

interface BasicProgram {
  lines: Map<number, string>;
  variables: Map<string, number | string>;
}

export class BasicMCPServer extends BaseMCPServer {
  name = 'basic';
  version = '1.0.0';
  description = 'BASIC interpreter for AuraOS';

  tools: Tool[] = [
    {
      name: 'execute',
      description: 'Execute BASIC code',
      inputSchema: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'BASIC code to execute',
          },
        },
        required: ['code'],
      },
    },
    {
      name: 'parse',
      description: 'Parse and validate BASIC code without executing',
      inputSchema: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'BASIC code to parse',
          },
        },
        required: ['code'],
      },
    },
    {
      name: 'list_program',
      description: 'List the currently loaded program',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'clear_program',
      description: 'Clear the current program and variables',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'get_variables',
      description: 'Get all current variable values',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'set_variable',
      description: 'Set a variable value',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Variable name',
          },
          value: {
            description: 'Variable value (number or string)',
          },
        },
        required: ['name', 'value'],
      },
    },
  ];

  private program: BasicProgram = {
    lines: new Map(),
    variables: new Map(),
  };
  private output: string[] = [];

  protected async onInitialize(): Promise<void> {
    this.clearProgram();
  }

  protected async handleToolExecution(
    toolName: string,
    input: Record<string, any>
  ): Promise<any> {
    switch (toolName) {
      case 'execute':
        return this.execute(input.code);
      case 'parse':
        return this.parse(input.code);
      case 'list_program':
        return this.listProgram();
      case 'clear_program':
        return this.clearProgram();
      case 'get_variables':
        return this.getVariables();
      case 'set_variable':
        return this.setVariable(input.name, input.value);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private execute(code: string): { output: string[]; variables: BasicVariable[] } {
    this.output = [];
    
    try {
      const lines = this.parseCode(code);
      
      // Load program
      for (const [lineNum, lineCode] of lines) {
        this.program.lines.set(lineNum, lineCode);
      }

      // Execute program
      this.runProgram();

      return {
        output: this.output,
        variables: this.getVariablesList(),
      };
    } catch (error) {
      throw new Error(`Execution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parse(code: string): { valid: boolean; lines: number; errors: string[] } {
    const errors: string[] = [];
    
    try {
      const lines = this.parseCode(code);
      
      // Validate each line
      for (const [lineNum, lineCode] of lines) {
        try {
          this.validateLine(lineCode);
        } catch (error) {
          errors.push(`Line ${lineNum}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        valid: errors.length === 0,
        lines: lines.size,
        errors,
      };
    } catch (error) {
      return {
        valid: false,
        lines: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  private listProgram(): { lines: Array<{ number: number; code: string }> } {
    const lines = Array.from(this.program.lines.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([number, code]) => ({ number, code }));

    return { lines };
  }

  private clearProgram(): { success: boolean } {
    this.program.lines.clear();
    this.program.variables.clear();
    this.output = [];
    return { success: true };
  }

  private getVariables(): { variables: BasicVariable[] } {
    return { variables: this.getVariablesList() };
  }

  private setVariable(name: string, value: number | string): { success: boolean } {
    this.program.variables.set(name.toUpperCase(), value);
    return { success: true };
  }

  private parseCode(code: string): Map<number, string> {
    const lines = new Map<number, string>();
    const codeLines = code.split('\n').filter((line) => line.trim());

    for (const line of codeLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Check if line starts with a number
      const match = trimmed.match(/^(\d+)\s+(.+)$/);
      if (match) {
        const lineNum = parseInt(match[1], 10);
        const lineCode = match[2];
        lines.set(lineNum, lineCode);
      } else {
        // Immediate mode (no line number)
        lines.set(0, trimmed);
      }
    }

    return lines;
  }

  private validateLine(line: string): void {
    const tokens = line.split(/\s+/);
    const command = tokens[0].toUpperCase();

    const validCommands = ['PRINT', 'LET', 'INPUT', 'IF', 'GOTO', 'FOR', 'NEXT', 'REM', 'END'];
    
    if (!validCommands.includes(command)) {
      throw new Error(`Unknown command: ${command}`);
    }
  }

  private runProgram(): void {
    const sortedLines = Array.from(this.program.lines.entries()).sort((a, b) => a[0] - b[0]);
    
    let pc = 0; // Program counter
    const maxIterations = 10000; // Prevent infinite loops
    let iterations = 0;

    while (pc < sortedLines.length && iterations < maxIterations) {
      const [lineNum, lineCode] = sortedLines[pc];
      
      try {
        const nextLine = this.executeLine(lineCode);
        
        if (nextLine !== null) {
          // GOTO command
          const targetIndex = sortedLines.findIndex(([num]) => num === nextLine);
          if (targetIndex === -1) {
            throw new Error(`Line ${nextLine} not found`);
          }
          pc = targetIndex;
        } else {
          pc++;
        }
      } catch (error) {
        throw new Error(`Line ${lineNum}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      iterations++;
    }

    if (iterations >= maxIterations) {
      throw new Error('Program exceeded maximum iterations (possible infinite loop)');
    }
  }

  private executeLine(line: string): number | null {
    const tokens = line.split(/\s+/);
    const command = tokens[0].toUpperCase();

    switch (command) {
      case 'PRINT':
        return this.executePrint(line.substring(6));
      case 'LET':
        return this.executeLet(line.substring(4));
      case 'REM':
        return null; // Comment, do nothing
      case 'END':
        return -1; // End program
      case 'GOTO':
        return this.executeGoto(tokens[1]);
      default:
        throw new Error(`Command not implemented: ${command}`);
    }
  }

  private executePrint(expression: string): null {
    const value = this.evaluateExpression(expression.trim());
    this.output.push(String(value));
    return null;
  }

  private executeLet(assignment: string): null {
    const match = assignment.match(/^(\w+)\s*=\s*(.+)$/);
    if (!match) {
      throw new Error('Invalid LET syntax');
    }

    const varName = match[1].toUpperCase();
    const value = this.evaluateExpression(match[2]);
    this.program.variables.set(varName, value);
    
    return null;
  }

  private executeGoto(lineNumStr: string): number {
    const lineNum = parseInt(lineNumStr, 10);
    if (isNaN(lineNum)) {
      throw new Error('Invalid GOTO line number');
    }
    return lineNum;
  }

  private evaluateExpression(expr: string): number | string {
    expr = expr.trim();

    // String literal
    if (expr.startsWith('"') && expr.endsWith('"')) {
      return expr.slice(1, -1);
    }

    // Variable
    if (/^[A-Za-z]\w*$/.test(expr)) {
      const varName = expr.toUpperCase();
      if (this.program.variables.has(varName)) {
        return this.program.variables.get(varName)!;
      }
      return 0; // Uninitialized variables default to 0
    }

    // Number
    if (/^-?\d+(\.\d+)?$/.test(expr)) {
      return parseFloat(expr);
    }

    // Simple arithmetic (very basic)
    const match = expr.match(/^(\w+|\d+)\s*([+\-*/])\s*(\w+|\d+)$/);
    if (match) {
      const left = this.evaluateExpression(match[1]);
      const op = match[2];
      const right = this.evaluateExpression(match[3]);

      if (typeof left === 'number' && typeof right === 'number') {
        switch (op) {
          case '+':
            return left + right;
          case '-':
            return left - right;
          case '*':
            return left * right;
          case '/':
            return right !== 0 ? left / right : 0;
        }
      }
    }

    throw new Error(`Cannot evaluate expression: ${expr}`);
  }

  private getVariablesList(): BasicVariable[] {
    return Array.from(this.program.variables.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }
}
