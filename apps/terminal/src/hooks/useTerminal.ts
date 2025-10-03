import { useState, useCallback } from 'react';
import { CommandResult } from '../types';

export const useTerminal = () => {
  const [output, setOutput] = useState<string[]>([]);
  const [currentDirectory, setCurrentDirectoryState] = useState('/home/user');

  const addOutput = useCallback((text: string) => {
    setOutput(prev => [...prev, text]);
  }, []);

  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  const getCurrentDirectory = useCallback(() => {
    return currentDirectory;
  }, [currentDirectory]);

  const setCurrentDirectory = useCallback((path: string) => {
    setCurrentDirectoryState(path);
  }, []);

  return {
    output,
    addOutput,
    clearOutput,
    getCurrentDirectory,
    setCurrentDirectory
  };
};
