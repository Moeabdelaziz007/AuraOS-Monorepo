import { useState, useCallback } from 'react';
import { WindowState, DesktopApp } from '../types';

export const useDesktop = () => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);

  const handleAppLaunch = useCallback((appId: string, apps: DesktopApp[]) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    // Check if window already exists
    const existingWindow = windows.find(w => w.appId === appId);
    if (existingWindow) {
      // Bring to front
      setWindows(prev =>
        prev.map(w =>
          w.id === existingWindow.id
            ? { ...w, zIndex: Math.max(...prev.map(win => win.zIndex)) + 1, minimized: false }
            : w
        )
      );
      setActiveWindow(existingWindow.id);
      return;
    }

    // Create new window centered on screen
    const windowWidth = app.defaultSize?.width || 800;
    const windowHeight = app.defaultSize?.height || 600;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calculate center with offset for each new window
    const offset = windows.length * 30;
    const centerX = Math.max(50, (screenWidth - windowWidth) / 2 + offset);
    const centerY = Math.max(50, (screenHeight - windowHeight) / 2 + offset);

    const newWindow: WindowState = {
      id: `window-${Date.now()}`,
      appId,
      title: app.name,
      icon: app.icon,
      x: centerX,
      y: centerY,
      width: windowWidth,
      height: windowHeight,
      minimized: false,
      maximized: false,
      zIndex: windows.length + 1,
      isActive: true,
      component: app.component,
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindow(newWindow.id);
  }, [windows]);

  const handleWindowClose = useCallback((windowId: string) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
    if (activeWindow === windowId) {
      setActiveWindow(null);
    }
  }, [activeWindow]);

  const handleWindowMinimize = useCallback((windowId: string) => {
    setWindows(prev =>
      prev.map(w =>
        w.id === windowId ? { ...w, minimized: !w.minimized } : w
      )
    );
  }, []);

  const handleWindowMaximize = useCallback((windowId: string) => {
    setWindows(prev =>
      prev.map(w =>
        w.id === windowId ? { ...w, maximized: !w.maximized } : w
      )
    );
  }, []);

  const handleWindowFocus = useCallback((windowId: string) => {
    setActiveWindow(windowId);
    setWindows(prev => {
      const maxZ = Math.max(...prev.map(w => w.zIndex));
      return prev.map(w =>
        w.id === windowId 
          ? { ...w, zIndex: maxZ + 1, isActive: true }
          : { ...w, isActive: false }
      );
    });
  }, []);

  const handleWindowMove = useCallback((windowId: string, x: number, y: number) => {
    setWindows(prev =>
      prev.map(w => (w.id === windowId ? { ...w, x, y } : w))
    );
  }, []);

  const handleWindowResize = useCallback((windowId: string, width: number, height: number) => {
    setWindows(prev =>
      prev.map(w => (w.id === windowId ? { ...w, width, height } : w))
    );
  }, []);

  const handleDesktopClick = useCallback(() => {
    setActiveWindow(null);
    setWindows(prev =>
      prev.map(w => ({ ...w, isActive: false }))
    );
  }, []);

  return {
    windows,
    activeWindow,
    handleAppLaunch,
    handleWindowClose,
    handleWindowMinimize,
    handleWindowMaximize,
    handleWindowFocus,
    handleWindowMove,
    handleWindowResize,
    handleDesktopClick
  };
};
