import { describe, it, expect, beforeEach } from 'vitest';
import { useDesktopStore } from './desktopStore';

describe('Desktop Store', () => {
  beforeEach(() => {
    const { reset } = useDesktopStore.getState();
    reset();
  });

  describe('Desktop Icons', () => {
    it('should add desktop icon', () => {
      const { addIcon, getIcons } = useDesktopStore.getState();
      
      addIcon({
        id: 'terminal',
        name: 'Terminal',
        icon: 'terminal.svg',
        x: 10,
        y: 10,
      });
      
      expect(getIcons()).toHaveLength(1);
    });

    it('should remove desktop icon', () => {
      const { addIcon, removeIcon, getIcons } = useDesktopStore.getState();
      
      addIcon({ id: 'terminal', name: 'Terminal', icon: 'terminal.svg' });
      removeIcon('terminal');
      
      expect(getIcons()).toHaveLength(0);
    });

    it('should move desktop icon', () => {
      const { addIcon, moveIcon, getIcon } = useDesktopStore.getState();
      
      addIcon({ id: 'terminal', name: 'Terminal', icon: 'terminal.svg', x: 10, y: 10 });
      moveIcon('terminal', { x: 100, y: 200 });
      
      const icon = getIcon('terminal');
      expect(icon?.x).toBe(100);
      expect(icon?.y).toBe(200);
    });

    it('should snap icon to grid', () => {
      const { addIcon, moveIcon, getIcon } = useDesktopStore.getState();
      
      addIcon({ id: 'terminal', name: 'Terminal', icon: 'terminal.svg' });
      moveIcon('terminal', { x: 87, y: 143 }, { snapToGrid: true, gridSize: 50 });
      
      const icon = getIcon('terminal');
      expect(icon?.x).toBe(100); // Snapped to nearest 50
      expect(icon?.y).toBe(150);
    });

    it('should prevent icon overlap', () => {
      const { addIcon, moveIcon, getIcon } = useDesktopStore.getState();
      
      addIcon({ id: 'terminal', name: 'Terminal', icon: 'terminal.svg', x: 10, y: 10 });
      addIcon({ id: 'debugger', name: 'Debugger', icon: 'debugger.svg', x: 100, y: 100 });
      
      moveIcon('debugger', { x: 10, y: 10 }, { preventOverlap: true });
      
      const icon = getIcon('debugger');
      expect(icon?.x).not.toBe(10);
      expect(icon?.y).not.toBe(10);
    });
  });

  describe('Icon Selection', () => {
    it('should select icon', () => {
      const { addIcon, selectIcon, getSelectedIcons } = useDesktopStore.getState();
      
      addIcon({ id: 'terminal', name: 'Terminal', icon: 'terminal.svg' });
      selectIcon('terminal');
      
      expect(getSelectedIcons()).toContain('terminal');
    });

    it('should deselect icon', () => {
      const { addIcon, selectIcon, deselectIcon, getSelectedIcons } = useDesktopStore.getState();
      
      addIcon({ id: 'terminal', name: 'Terminal', icon: 'terminal.svg' });
      selectIcon('terminal');
      deselectIcon('terminal');
      
      expect(getSelectedIcons()).not.toContain('terminal');
    });

    it('should select multiple icons', () => {
      const { addIcon, selectIcon, getSelectedIcons } = useDesktopStore.getState();
      
      addIcon({ id: 'terminal', name: 'Terminal', icon: 'terminal.svg' });
      addIcon({ id: 'debugger', name: 'Debugger', icon: 'debugger.svg' });
      
      selectIcon('terminal', { multi: true });
      selectIcon('debugger', { multi: true });
      
      expect(getSelectedIcons()).toHaveLength(2);
    });

    it('should clear selection', () => {
      const { addIcon, selectIcon, clearSelection, getSelectedIcons } = useDesktopStore.getState();
      
      addIcon({ id: 'terminal', name: 'Terminal', icon: 'terminal.svg' });
      addIcon({ id: 'debugger', name: 'Debugger', icon: 'debugger.svg' });
      
      selectIcon('terminal');
      selectIcon('debugger', { multi: true });
      clearSelection();
      
      expect(getSelectedIcons()).toHaveLength(0);
    });

    it('should select icons in rectangle', () => {
      const { addIcon, selectInRectangle, getSelectedIcons } = useDesktopStore.getState();
      
      addIcon({ id: 'icon1', name: 'Icon 1', icon: 'icon.svg', x: 10, y: 10 });
      addIcon({ id: 'icon2', name: 'Icon 2', icon: 'icon.svg', x: 50, y: 50 });
      addIcon({ id: 'icon3', name: 'Icon 3', icon: 'icon.svg', x: 200, y: 200 });
      
      selectInRectangle({ x: 0, y: 0, width: 100, height: 100 });
      
      const selected = getSelectedIcons();
      expect(selected).toContain('icon1');
      expect(selected).toContain('icon2');
      expect(selected).not.toContain('icon3');
    });
  });

  describe('Wallpaper', () => {
    it('should set wallpaper', () => {
      const { setWallpaper, getWallpaper } = useDesktopStore.getState();
      
      setWallpaper('wallpaper.jpg');
      
      expect(getWallpaper()).toBe('wallpaper.jpg');
    });

    it('should set wallpaper fit mode', () => {
      const { setWallpaperFit, getWallpaperFit } = useDesktopStore.getState();
      
      setWallpaperFit('cover');
      
      expect(getWallpaperFit()).toBe('cover');
    });
  });

  describe('Context Menu', () => {
    it('should show context menu', () => {
      const { showContextMenu, getContextMenu } = useDesktopStore.getState();
      
      showContextMenu({ x: 100, y: 200 }, [
        { label: 'New Folder', action: 'newFolder' },
        { label: 'Refresh', action: 'refresh' },
      ]);
      
      const menu = getContextMenu();
      expect(menu?.x).toBe(100);
      expect(menu?.y).toBe(200);
      expect(menu?.items).toHaveLength(2);
    });

    it('should hide context menu', () => {
      const { showContextMenu, hideContextMenu, getContextMenu } = useDesktopStore.getState();
      
      showContextMenu({ x: 100, y: 200 }, []);
      hideContextMenu();
      
      expect(getContextMenu()).toBeNull();
    });
  });

  describe('Taskbar', () => {
    it('should add taskbar item', () => {
      const { addTaskbarItem, getTaskbarItems } = useDesktopStore.getState();
      
      addTaskbarItem({
        id: 'terminal',
        appId: 'terminal',
        title: 'Terminal',
        icon: 'terminal.svg',
      });
      
      expect(getTaskbarItems()).toHaveLength(1);
    });

    it('should remove taskbar item', () => {
      const { addTaskbarItem, removeTaskbarItem, getTaskbarItems } = useDesktopStore.getState();
      
      addTaskbarItem({ id: 'terminal', appId: 'terminal', title: 'Terminal', icon: 'terminal.svg' });
      removeTaskbarItem('terminal');
      
      expect(getTaskbarItems()).toHaveLength(0);
    });

    it('should update taskbar item', () => {
      const { addTaskbarItem, updateTaskbarItem, getTaskbarItem } = useDesktopStore.getState();
      
      addTaskbarItem({ id: 'terminal', appId: 'terminal', title: 'Terminal', icon: 'terminal.svg' });
      updateTaskbarItem('terminal', { title: 'Terminal - Updated' });
      
      const item = getTaskbarItem('terminal');
      expect(item?.title).toBe('Terminal - Updated');
    });

    it('should pin app to taskbar', () => {
      const { pinToTaskbar, getTaskbarItems } = useDesktopStore.getState();
      
      pinToTaskbar({ appId: 'terminal', title: 'Terminal', icon: 'terminal.svg' });
      
      const items = getTaskbarItems();
      expect(items[0].pinned).toBe(true);
    });

    it('should unpin app from taskbar', () => {
      const { pinToTaskbar, unpinFromTaskbar, getTaskbarItems } = useDesktopStore.getState();
      
      pinToTaskbar({ appId: 'terminal', title: 'Terminal', icon: 'terminal.svg' });
      unpinFromTaskbar('terminal');
      
      expect(getTaskbarItems()).toHaveLength(0);
    });
  });

  describe('Notifications', () => {
    it('should show notification', () => {
      const { showNotification, getNotifications } = useDesktopStore.getState();
      
      showNotification({
        title: 'Test Notification',
        message: 'This is a test',
        type: 'info',
      });
      
      expect(getNotifications()).toHaveLength(1);
    });

    it('should dismiss notification', () => {
      const { showNotification, dismissNotification, getNotifications } = useDesktopStore.getState();
      
      const notification = showNotification({
        title: 'Test',
        message: 'Test',
        type: 'info',
      });
      
      dismissNotification(notification.id);
      
      expect(getNotifications()).toHaveLength(0);
    });

    it('should auto-dismiss notification after timeout', async () => {
      const { showNotification, getNotifications } = useDesktopStore.getState();
      
      showNotification({
        title: 'Test',
        message: 'Test',
        type: 'info',
        timeout: 100,
      });
      
      expect(getNotifications()).toHaveLength(1);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(getNotifications()).toHaveLength(0);
    });

    it('should limit notification count', () => {
      const { showNotification, getNotifications } = useDesktopStore.getState();
      
      for (let i = 0; i < 20; i++) {
        showNotification({
          title: `Notification ${i}`,
          message: 'Test',
          type: 'info',
        });
      }
      
      expect(getNotifications().length).toBeLessThanOrEqual(10);
    });
  });

  describe('System Tray', () => {
    it('should add system tray icon', () => {
      const { addSystemTrayIcon, getSystemTrayIcons } = useDesktopStore.getState();
      
      addSystemTrayIcon({
        id: 'network',
        icon: 'network.svg',
        tooltip: 'Network Status',
      });
      
      expect(getSystemTrayIcons()).toHaveLength(1);
    });

    it('should remove system tray icon', () => {
      const { addSystemTrayIcon, removeSystemTrayIcon, getSystemTrayIcons } = useDesktopStore.getState();
      
      addSystemTrayIcon({ id: 'network', icon: 'network.svg', tooltip: 'Network' });
      removeSystemTrayIcon('network');
      
      expect(getSystemTrayIcons()).toHaveLength(0);
    });

    it('should update system tray icon', () => {
      const { addSystemTrayIcon, updateSystemTrayIcon, getSystemTrayIcon } = useDesktopStore.getState();
      
      addSystemTrayIcon({ id: 'network', icon: 'network.svg', tooltip: 'Network' });
      updateSystemTrayIcon('network', { tooltip: 'Network: Connected' });
      
      const icon = getSystemTrayIcon('network');
      expect(icon?.tooltip).toBe('Network: Connected');
    });
  });

  describe('Theme', () => {
    it('should set theme', () => {
      const { setTheme, getTheme } = useDesktopStore.getState();
      
      setTheme('dark');
      
      expect(getTheme()).toBe('dark');
    });

    it('should toggle theme', () => {
      const { setTheme, toggleTheme, getTheme } = useDesktopStore.getState();
      
      setTheme('light');
      toggleTheme();
      
      expect(getTheme()).toBe('dark');
      
      toggleTheme();
      expect(getTheme()).toBe('light');
    });

    it('should set accent color', () => {
      const { setAccentColor, getAccentColor } = useDesktopStore.getState();
      
      setAccentColor('#007acc');
      
      expect(getAccentColor()).toBe('#007acc');
    });
  });

  describe('Performance', () => {
    it('should handle many desktop icons', () => {
      const { addIcon, getIcons } = useDesktopStore.getState();
      
      for (let i = 0; i < 100; i++) {
        addIcon({
          id: `icon${i}`,
          name: `Icon ${i}`,
          icon: 'icon.svg',
          x: (i % 10) * 100,
          y: Math.floor(i / 10) * 100,
        });
      }
      
      expect(getIcons()).toHaveLength(100);
    });

    it('should efficiently update icon positions', () => {
      const { addIcon, moveIcon } = useDesktopStore.getState();
      
      const icon = addIcon({ id: 'test', name: 'Test', icon: 'icon.svg' });
      
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        moveIcon(icon.id, { x: i, y: i });
      }
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(100);
    });
  });
});
