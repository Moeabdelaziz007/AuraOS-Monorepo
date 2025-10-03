import { describe, it, expect, beforeEach } from 'vitest';
import { useWindowStore } from './windowStore';

describe('Window Store', () => {
  beforeEach(() => {
    const { reset } = useWindowStore.getState();
    reset();
  });

  describe('Window Management', () => {
    it('should create window', () => {
      const { createWindow, getWindows } = useWindowStore.getState();
      
      const window = createWindow({
        appId: 'terminal',
        title: 'Terminal',
        width: 800,
        height: 600,
      });
      
      expect(window).toHaveProperty('id');
      expect(getWindows()).toHaveLength(1);
    });

    it('should close window', () => {
      const { createWindow, closeWindow, getWindows } = useWindowStore.getState();
      
      const window = createWindow({ appId: 'terminal', title: 'Terminal' });
      closeWindow(window.id);
      
      expect(getWindows()).toHaveLength(0);
    });

    it('should get window by id', () => {
      const { createWindow, getWindow } = useWindowStore.getState();
      
      const window = createWindow({ appId: 'terminal', title: 'Terminal' });
      const retrieved = getWindow(window.id);
      
      expect(retrieved).toEqual(window);
    });

    it('should get windows by app id', () => {
      const { createWindow, getWindowsByApp } = useWindowStore.getState();
      
      createWindow({ appId: 'terminal', title: 'Terminal 1' });
      createWindow({ appId: 'terminal', title: 'Terminal 2' });
      createWindow({ appId: 'debugger', title: 'Debugger' });
      
      const terminalWindows = getWindowsByApp('terminal');
      expect(terminalWindows).toHaveLength(2);
    });
  });

  describe('Window State', () => {
    it('should minimize window', () => {
      const { createWindow, minimizeWindow, getWindow } = useWindowStore.getState();
      
      const window = createWindow({ appId: 'terminal', title: 'Terminal' });
      minimizeWindow(window.id);
      
      const updated = getWindow(window.id);
      expect(updated?.minimized).toBe(true);
    });

    it('should maximize window', () => {
      const { createWindow, maximizeWindow, getWindow } = useWindowStore.getState();
      
      const window = createWindow({ appId: 'terminal', title: 'Terminal' });
      maximizeWindow(window.id);
      
      const updated = getWindow(window.id);
      expect(updated?.maximized).toBe(true);
    });

    it('should restore window', () => {
      const { createWindow, maximizeWindow, restoreWindow, getWindow } = useWindowStore.getState();
      
      const window = createWindow({ appId: 'terminal', title: 'Terminal' });
      maximizeWindow(window.id);
      restoreWindow(window.id);
      
      const updated = getWindow(window.id);
      expect(updated?.maximized).toBe(false);
    });

    it('should toggle fullscreen', () => {
      const { createWindow, toggleFullscreen, getWindow } = useWindowStore.getState();
      
      const window = createWindow({ appId: 'terminal', title: 'Terminal' });
      toggleFullscreen(window.id);
      
      let updated = getWindow(window.id);
      expect(updated?.fullscreen).toBe(true);
      
      toggleFullscreen(window.id);
      updated = getWindow(window.id);
      expect(updated?.fullscreen).toBe(false);
    });
  });

  describe('Window Position', () => {
    it('should set window position', () => {
      const { createWindow, setWindowPosition, getWindow } = useWindowStore.getState();
      
      const window = createWindow({ appId: 'terminal', title: 'Terminal' });
      setWindowPosition(window.id, { x: 100, y: 200 });
      
      const updated = getWindow(window.id);
      expect(updated?.x).toBe(100);
      expect(updated?.y).toBe(200);
    });

    it('should set window size', () => {
      const { createWindow, setWindowSize, getWindow } = useWindowStore.getState();
      
      const window = createWindow({ appId: 'terminal', title: 'Terminal' });
      setWindowSize(window.id, { width: 1024, height: 768 });
      
      const updated = getWindow(window.id);
      expect(updated?.width).toBe(1024);
      expect(updated?.height).toBe(768);
    });

    it('should constrain window to screen bounds', () => {
      const { createWindow, setWindowPosition, getWindow } = useWindowStore.getState();
      
      const window = createWindow({ appId: 'terminal', title: 'Terminal' });
      setWindowPosition(window.id, { x: -100, y: -100 });
      
      const updated = getWindow(window.id);
      expect(updated?.x).toBeGreaterThanOrEqual(0);
      expect(updated?.y).toBeGreaterThanOrEqual(0);
    });

    it('should enforce minimum window size', () => {
      const { createWindow, setWindowSize, getWindow } = useWindowStore.getState();
      
      const window = createWindow({ appId: 'terminal', title: 'Terminal' });
      setWindowSize(window.id, { width: 50, height: 50 });
      
      const updated = getWindow(window.id);
      expect(updated?.width).toBeGreaterThanOrEqual(200);
      expect(updated?.height).toBeGreaterThanOrEqual(150);
    });
  });

  describe('Window Focus', () => {
    it('should focus window', () => {
      const { createWindow, focusWindow, getFocusedWindow } = useWindowStore.getState();
      
      const window = createWindow({ appId: 'terminal', title: 'Terminal' });
      focusWindow(window.id);
      
      expect(getFocusedWindow()?.id).toBe(window.id);
    });

    it('should update z-index on focus', () => {
      const { createWindow, focusWindow, getWindow } = useWindowStore.getState();
      
      const window1 = createWindow({ appId: 'terminal', title: 'Terminal 1' });
      const window2 = createWindow({ appId: 'terminal', title: 'Terminal 2' });
      
      focusWindow(window1.id);
      const z1 = getWindow(window1.id)?.zIndex || 0;
      
      focusWindow(window2.id);
      const z2 = getWindow(window2.id)?.zIndex || 0;
      
      expect(z2).toBeGreaterThan(z1);
    });

    it('should cycle through windows with Alt+Tab', () => {
      const { createWindow, cycleWindows, getFocusedWindow } = useWindowStore.getState();
      
      const window1 = createWindow({ appId: 'terminal', title: 'Terminal 1' });
      const window2 = createWindow({ appId: 'terminal', title: 'Terminal 2' });
      const window3 = createWindow({ appId: 'debugger', title: 'Debugger' });
      
      cycleWindows();
      expect(getFocusedWindow()?.id).toBe(window2.id);
      
      cycleWindows();
      expect(getFocusedWindow()?.id).toBe(window3.id);
      
      cycleWindows();
      expect(getFocusedWindow()?.id).toBe(window1.id);
    });
  });

  describe('Window Persistence', () => {
    it('should save window state', () => {
      const { createWindow, saveWindowState } = useWindowStore.getState();
      
      const window = createWindow({ appId: 'terminal', title: 'Terminal' });
      const saved = saveWindowState(window.id);
      
      expect(saved).toMatchObject({
        appId: 'terminal',
        title: 'Terminal',
        x: window.x,
        y: window.y,
        width: window.width,
        height: window.height,
      });
    });

    it('should restore window state', () => {
      const { restoreWindowState, getWindow } = useWindowStore.getState();
      
      const state = {
        appId: 'terminal',
        title: 'Terminal',
        x: 100,
        y: 200,
        width: 800,
        height: 600,
      };
      
      const window = restoreWindowState(state);
      const retrieved = getWindow(window.id);
      
      expect(retrieved).toMatchObject(state);
    });
  });

  describe('Window Snapping', () => {
    it('should snap window to left half', () => {
      const { createWindow, snapWindow, getWindow } = useWindowStore.getState();
      
      const window = createWindow({ appId: 'terminal', title: 'Terminal' });
      snapWindow(window.id, 'left');
      
      const updated = getWindow(window.id);
      expect(updated?.x).toBe(0);
      expect(updated?.width).toBe(window.innerWidth / 2);
    });

    it('should snap window to right half', () => {
      const { createWindow, snapWindow, getWindow } = useWindowStore.getState();
      
      const window = createWindow({ appId: 'terminal', title: 'Terminal' });
      snapWindow(window.id, 'right');
      
      const updated = getWindow(window.id);
      expect(updated?.x).toBe(window.innerWidth / 2);
      expect(updated?.width).toBe(window.innerWidth / 2);
    });

    it('should snap window to top half', () => {
      const { createWindow, snapWindow, getWindow } = useWindowStore.getState();
      
      const window = createWindow({ appId: 'terminal', title: 'Terminal' });
      snapWindow(window.id, 'top');
      
      const updated = getWindow(window.id);
      expect(updated?.y).toBe(0);
      expect(updated?.height).toBe(window.innerHeight / 2);
    });

    it('should snap window to corner', () => {
      const { createWindow, snapWindow, getWindow } = useWindowStore.getState();
      
      const window = createWindow({ appId: 'terminal', title: 'Terminal' });
      snapWindow(window.id, 'top-left');
      
      const updated = getWindow(window.id);
      expect(updated?.x).toBe(0);
      expect(updated?.y).toBe(0);
      expect(updated?.width).toBe(window.innerWidth / 2);
      expect(updated?.height).toBe(window.innerHeight / 2);
    });
  });

  describe('Performance', () => {
    it('should handle many windows', () => {
      const { createWindow, getWindows } = useWindowStore.getState();
      
      for (let i = 0; i < 100; i++) {
        createWindow({ appId: 'terminal', title: `Terminal ${i}` });
      }
      
      expect(getWindows()).toHaveLength(100);
    });

    it('should efficiently update window properties', () => {
      const { createWindow, setWindowPosition } = useWindowStore.getState();
      
      const window = createWindow({ appId: 'terminal', title: 'Terminal' });
      
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        setWindowPosition(window.id, { x: i, y: i });
      }
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(100); // Should complete in < 100ms
    });
  });
});
