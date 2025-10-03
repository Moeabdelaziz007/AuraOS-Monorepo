import { create } from 'zustand';
import type { Theme } from '../types';

interface DesktopStore {
  // Active app
  activeAppId: string | null;
  setActiveApp: (appId: string) => void;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Running apps
  runningApps: string[];
  launchApp: (appId: string) => void;
  closeApp: (appId: string) => void;

  // Settings
  showSettings: boolean;
  toggleSettings: () => void;
}

export const useDesktopStore = create<DesktopStore>((set) => ({
  // Active app
  activeAppId: null,
  setActiveApp: (appId) => set({ activeAppId: appId }),

  // Theme
  theme: 'dark',
  setTheme: (theme) => set({ theme }),

  // Running apps
  runningApps: [],
  launchApp: (appId) =>
    set((state) => ({
      runningApps: state.runningApps.includes(appId)
        ? state.runningApps
        : [...state.runningApps, appId],
      activeAppId: appId,
    })),
  closeApp: (appId) =>
    set((state) => ({
      runningApps: state.runningApps.filter((id) => id !== appId),
      activeAppId:
        state.activeAppId === appId
          ? state.runningApps[0] || null
          : state.activeAppId,
    })),

  // Settings
  showSettings: false,
  toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),
}));
