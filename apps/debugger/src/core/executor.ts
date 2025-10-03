/**
 * Code Executor
 * Executes JavaScript code and captures output
 */

import { useDebuggerStore } from '../store/debuggerStore';

export async function executeCode(code: string): Promise<void> {
  const { addOutput, setError, setVariables } = useDebuggerStore.getState();

  // Capture console.log
  const originalLog = console.log;
  const logs: string[] = [];

  console.log = (...args: any[]) => {
    const message = args.map((arg) => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    
    logs.push(message);
    addOutput(message);
    originalLog(...args);
  };

  try {
    // Create a function from the code
    const fn = new Function(code);
    
    // Execute the code
    const result = fn();
    
    // If the result is a promise, wait for it
    if (result instanceof Promise) {
      await result;
    }

    // Extract variables from the execution context (simplified)
    // In a real debugger, this would use the V8 debugger protocol
    const variables = extractVariables(code);
    setVariables(variables);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    setError(errorMessage);
    throw error;
  } finally {
    // Restore console.log
    console.log = originalLog;
  }
}

function extractVariables(code: string): any[] {
  // Simplified variable extraction
  // In a real debugger, this would use AST parsing and runtime inspection
  const variables: any[] = [];
  
  // Extract variable declarations (very basic)
  const varRegex = /(?:var|let|const)\s+(\w+)\s*=\s*(.+?);/g;
  let match;
  
  while ((match = varRegex.exec(code)) !== null) {
    variables.push({
      name: match[1],
      value: match[2],
      type: 'unknown',
      scope: 'local',
    });
  }
  
  return variables;
}
