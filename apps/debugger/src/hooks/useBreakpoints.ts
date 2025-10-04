/**
 * useBreakpoints Hook
 * Manages debugging breakpoints
 * 
 * TODO: Implement full breakpoint logic in Sprint 2
 */

import { useState, useCallback } from 'react';

export const useBreakpoints = () => {
  const [breakpoints, setBreakpoints] = useState<number[]>([]);

  const addBreakpoint = useCallback((line: number) => {
    setBreakpoints((prev) => {
      if (prev.includes(line)) return prev;
      return [...prev, line].sort((a, b) => a - b);
    });
  }, []);

  const removeBreakpoint = useCallback((line: number) => {
    setBreakpoints((prev) => prev.filter((bp) => bp !== line));
  }, []);

  const toggleBreakpoint = useCallback((line: number) => {
    setBreakpoints((prev) => {
      if (prev.includes(line)) {
        return prev.filter((bp) => bp !== line);
      }
      return [...prev, line].sort((a, b) => a - b);
    });
  }, []);

  const clearBreakpoints = useCallback(() => {
    setBreakpoints([]);
  }, []);

  const hasBreakpoint = useCallback(
    (line: number) => {
      return breakpoints.includes(line);
    },
    [breakpoints]
  );

  return {
    breakpoints,
    addBreakpoint,
    removeBreakpoint,
    toggleBreakpoint,
    clearBreakpoints,
    hasBreakpoint,
  };
};

export default useBreakpoints;
