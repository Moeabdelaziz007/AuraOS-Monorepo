import { useState, useCallback } from 'react';

export const useCommandHistory = () => {
  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const addToHistory = useCallback((command: string) => {
    if (command.trim()) {
      setHistory(prev => {
        const newHistory = [...prev];
        // Remove duplicate if exists
        const existingIndex = newHistory.indexOf(command);
        if (existingIndex !== -1) {
          newHistory.splice(existingIndex, 1);
        }
        // Add to beginning
        newHistory.unshift(command);
        // Limit history size
        return newHistory.slice(0, 100);
      });
      setCurrentIndex(-1);
    }
  }, []);

  const getPreviousCommand = useCallback(() => {
    if (history.length === 0) return null;
    
    const newIndex = Math.min(currentIndex + 1, history.length - 1);
    setCurrentIndex(newIndex);
    return history[newIndex];
  }, [history, currentIndex]);

  const getNextCommand = useCallback(() => {
    if (currentIndex <= 0) {
      setCurrentIndex(-1);
      return null;
    }
    
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    return history[newIndex];
  }, [history, currentIndex]);

  const searchHistory = useCallback((query: string) => {
    return history.filter(cmd => 
      cmd.toLowerCase().includes(query.toLowerCase())
    );
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  return {
    history,
    addToHistory,
    getPreviousCommand,
    getNextCommand,
    searchHistory,
    clearHistory
  };
};
