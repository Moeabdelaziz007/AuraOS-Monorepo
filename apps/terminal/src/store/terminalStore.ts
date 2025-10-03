import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TerminalState {
  history: string[];
  currentDirectory: string;
  addToHistory: (command: string) => void;
  clearHistory: () => void;
  setCurrentDirectory: (dir: string) => void;
}

export const useTerminalStore = create<TerminalState>()(
  persist(
    (set) => ({
      history: [],
      currentDirectory: '/home/aura',
      
      addToHistory: (command: string) =>
        set((state) => ({
          history: [...state.history, command].slice(-100), // Keep last 100 commands
        })),
      
      clearHistory: () =>
        set({ history: [] }),
      
      setCurrentDirectory: (dir: string) =>
        set({ currentDirectory: dir }),
    }),
    {
      name: 'auraos-terminal-storage',
    }
  )
);
