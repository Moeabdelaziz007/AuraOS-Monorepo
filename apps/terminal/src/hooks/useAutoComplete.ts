import { useState, useCallback } from 'react';

// Built-in commands for auto-complete
const builtInCommands = [
  'help', 'clear', 'exit', 'pwd', 'ls', 'cd', 'mkdir', 'rmdir', 'rm', 'cp', 'mv',
  'cat', 'echo', 'grep', 'find', 'ps', 'kill', 'top', 'df', 'du', 'free',
  'history', 'alias', 'export', 'unset', 'env', 'which', 'whereis', 'man'
];

// BASIC commands
const basicCommands = [
  'PRINT', 'INPUT', 'LET', 'IF', 'THEN', 'ELSE', 'END', 'FOR', 'NEXT', 'WHILE', 'WEND',
  'GOTO', 'GOSUB', 'RETURN', 'ON', 'GOTO', 'ON', 'GOSUB', 'DIM', 'DATA', 'READ', 'RESTORE',
  'REM', 'STOP', 'END', 'RUN', 'LIST', 'NEW', 'SAVE', 'LOAD', 'DELETE', 'RENUMBER'
];

// File extensions
const fileExtensions = ['.txt', '.bas', '.js', '.ts', '.py', '.md', '.json', '.xml'];

export const useAutoComplete = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const getSuggestions = useCallback((input: string) => {
    if (!input.trim()) {
      setSuggestions([]);
      return [];
    }

    const query = input.toLowerCase();
    const allCommands = [...builtInCommands, ...basicCommands];
    
    const matches = allCommands.filter(cmd => 
      cmd.toLowerCase().startsWith(query)
    );

    // Add file suggestions if input contains a path
    if (input.includes('/') || input.includes('.')) {
      const pathSuggestions = fileExtensions.filter(ext => 
        ext.startsWith(query)
      );
      matches.push(...pathSuggestions);
    }

    // Limit suggestions
    const limitedMatches = matches.slice(0, 10);
    setSuggestions(limitedMatches);
    return limitedMatches;
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  const getCommandHelp = useCallback((command: string) => {
    const helpTexts: Record<string, string> = {
      'help': 'Show available commands',
      'clear': 'Clear terminal screen',
      'exit': 'Exit terminal',
      'pwd': 'Print working directory',
      'ls': 'List directory contents',
      'cd': 'Change directory',
      'mkdir': 'Create directory',
      'rmdir': 'Remove directory',
      'rm': 'Remove file or directory',
      'cp': 'Copy file or directory',
      'mv': 'Move or rename file or directory',
      'cat': 'Display file contents',
      'echo': 'Display text',
      'grep': 'Search text in files',
      'find': 'Find files and directories',
      'ps': 'Show running processes',
      'kill': 'Terminate process',
      'top': 'Show system processes',
      'df': 'Show disk space usage',
      'du': 'Show directory space usage',
      'free': 'Show memory usage',
      'history': 'Show command history',
      'alias': 'Create command alias',
      'export': 'Set environment variable',
      'unset': 'Unset environment variable',
      'env': 'Show environment variables',
      'which': 'Show command location',
      'whereis': 'Show command location',
      'man': 'Show manual page'
    };

    return helpTexts[command.toLowerCase()] || 'No help available';
  }, []);

  return {
    suggestions,
    getSuggestions,
    clearSuggestions,
    getCommandHelp
  };
};
