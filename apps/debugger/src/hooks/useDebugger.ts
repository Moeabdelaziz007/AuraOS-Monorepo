/**
 * useDebugger Hook
 * Main debugger state management hook
 * 
 * TODO: Implement full debugger logic in Sprint 2
 */

import { useState, useCallback } from 'react';

export interface DebuggerState {
  isRunning: boolean;
  isPaused: boolean;
  currentLine: number;
  breakpoints: number[];
}

export const useDebugger = () => {
  const [state, setState] = useState<DebuggerState>({
    isRunning: false,
    isPaused: false,
    currentLine: 0,
    breakpoints: [],
  });

  const start = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: true, isPaused: false }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const stop = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false, isPaused: false, currentLine: 0 }));
  }, []);

  const step = useCallback(() => {
    setState((prev) => ({ ...prev, currentLine: prev.currentLine + 1 }));
  }, []);

  return {
    state,
    start,
    pause,
    stop,
    step,
  };
};

export default useDebugger;
