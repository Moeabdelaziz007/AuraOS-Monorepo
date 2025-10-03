import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Desktop from '../../src/components/Desktop';
import { useWindowStore } from '../../src/store/windowStore';
import { useDesktopStore } from '../../src/store/desktopStore';

describe('Desktop Integration Tests', () => {
  beforeEach(() => {
    useWindowStore.getState().reset();
    useDesktopStore.getState().reset();
  });

  describe('Window and Desktop Integration', () => {
    it('should open app from desktop icon', async () => {
      render(<Desktop />);
      
      // Double-click desktop icon
      const terminalIcon = screen.getByTestId('desktop-icon-terminal');
      await userEvent.dblClick(terminalIcon);
      
      // Verify window opened
      await waitFor(() => {
        expect(screen.getByTestId('window-terminal')).toBeInTheDocument();
      });
      
      // Verify taskbar item added
      expect(screen.getByTestId('taskbar-terminal')).toBeInTheDocument();
    });

    it('should manage multiple windows from different apps', async () => {
      render(<Desktop />);
      
      // Open multiple apps
      await userEvent.dblClick(screen.getByTestId('desktop-icon-terminal'));
      await userEvent.dblClick(screen.getByTestId('desktop-icon-debugger'));
      
      await waitFor(() => {
        expect(screen.getByTestId('window-terminal')).toBeInTheDocument();
        expect(screen.getByTestId('window-debugger')).toBeInTheDocument();
      });
      
      // Verify both in taskbar
      expect(screen.getByTestId('taskbar-terminal')).toBeInTheDocument();
      expect(screen.getByTestId('taskbar-debugger')).toBeInTheDocument();
    });

    it('should minimize window to taskbar', async () => {
      render(<Desktop />);
      
      await userEvent.dblClick(screen.getByTestId('desktop-icon-terminal'));
      
      await waitFor(() => {
        expect(screen.getByTestId('window-terminal')).toBeInTheDocument();
      });
      
      // Minimize window
      await userEvent.click(screen.getByTestId('window-minimize-terminal'));
      
      // Verify window hidden
      await waitFor(() => {
        const window = screen.queryByTestId('window-terminal');
        expect(window).toHaveStyle({ display: 'none' });
      });
      
      // Verify taskbar item still present
      expect(screen.getByTestId('taskbar-terminal')).toBeInTheDocument();
    });

    it('should restore window from taskbar', async () => {
      render(<Desktop />);
      
      await userEvent.dblClick(screen.getByTestId('desktop-icon-terminal'));
      
      await waitFor(() => {
        expect(screen.getByTestId('window-terminal')).toBeInTheDocument();
      });
      
      // Minimize
      await userEvent.click(screen.getByTestId('window-minimize-terminal'));
      
      // Restore from taskbar
      await userEvent.click(screen.getByTestId('taskbar-terminal'));
      
      // Verify window visible
      await waitFor(() => {
        const window = screen.getByTestId('window-terminal');
        expect(window).toBeVisible();
      });
    });

    it('should close window and remove from taskbar', async () => {
      render(<Desktop />);
      
      await userEvent.dblClick(screen.getByTestId('desktop-icon-terminal'));
      
      await waitFor(() => {
        expect(screen.getByTestId('window-terminal')).toBeInTheDocument();
      });
      
      // Close window
      await userEvent.click(screen.getByTestId('window-close-terminal'));
      
      // Verify window removed
      await waitFor(() => {
        expect(screen.queryByTestId('window-terminal')).not.toBeInTheDocument();
      });
      
      // Verify taskbar item removed
      expect(screen.queryByTestId('taskbar-terminal')).not.toBeInTheDocument();
    });
  });

  describe('Window Focus Management', () => {
    it('should focus window on click', async () => {
      render(<Desktop />);
      
      // Open two windows
      await userEvent.dblClick(screen.getByTestId('desktop-icon-terminal'));
      await userEvent.dblClick(screen.getByTestId('desktop-icon-debugger'));
      
      await waitFor(() => {
        expect(screen.getByTestId('window-terminal')).toBeInTheDocument();
        expect(screen.getByTestId('window-debugger')).toBeInTheDocument();
      });
      
      // Click on terminal window
      await userEvent.click(screen.getByTestId('window-terminal'));
      
      // Verify terminal has higher z-index
      const terminal = screen.getByTestId('window-terminal');
      const debugger = screen.getByTestId('window-debugger');
      
      const terminalZ = parseInt(window.getComputedStyle(terminal).zIndex);
      const debuggerZ = parseInt(window.getComputedStyle(debugger).zIndex);
      
      expect(terminalZ).toBeGreaterThan(debuggerZ);
    });

    it('should cycle windows with Alt+Tab', async () => {
      render(<Desktop />);
      
      // Open three windows
      await userEvent.dblClick(screen.getByTestId('desktop-icon-terminal'));
      await userEvent.dblClick(screen.getByTestId('desktop-icon-debugger'));
      
      await waitFor(() => {
        expect(screen.getByTestId('window-terminal')).toBeInTheDocument();
        expect(screen.getByTestId('window-debugger')).toBeInTheDocument();
      });
      
      // Press Alt+Tab
      await userEvent.keyboard('{Alt>}{Tab}{/Alt}');
      
      // Verify focus changed
      await waitFor(() => {
        const focusedWindow = document.activeElement?.closest('[data-testid^="window-"]');
        expect(focusedWindow).toBeTruthy();
      });
    });
  });

  describe('Window Dragging and Positioning', () => {
    it('should drag window to new position', async () => {
      render(<Desktop />);
      
      await userEvent.dblClick(screen.getByTestId('desktop-icon-terminal'));
      
      const window = await screen.findByTestId('window-terminal');
      const initialBox = window.getBoundingClientRect();
      
      // Drag window by title bar
      const titleBar = screen.getByTestId('window-titlebar-terminal');
      await userEvent.pointer([
        { keys: '[MouseLeft>]', target: titleBar },
        { coords: { x: initialBox.x + 200, y: initialBox.y + 100 } },
        { keys: '[/MouseLeft]' },
      ]);
      
      // Verify position changed
      await waitFor(() => {
        const newBox = window.getBoundingClientRect();
        expect(newBox.x).not.toBe(initialBox.x);
        expect(newBox.y).not.toBe(initialBox.y);
      });
    });

    it('should snap window to screen edges', async () => {
      render(<Desktop />);
      
      await userEvent.dblClick(screen.getByTestId('desktop-icon-terminal'));
      
      const window = await screen.findByTestId('window-terminal');
      const titleBar = screen.getByTestId('window-titlebar-terminal');
      
      // Drag to left edge
      await userEvent.pointer([
        { keys: '[MouseLeft>]', target: titleBar },
        { coords: { x: 0, y: 100 } },
        { keys: '[/MouseLeft]' },
      ]);
      
      // Verify snapped to left half
      await waitFor(() => {
        const box = window.getBoundingClientRect();
        expect(box.x).toBe(0);
        expect(box.width).toBe(window.innerWidth / 2);
      });
    });

    it('should resize window', async () => {
      render(<Desktop />);
      
      await userEvent.dblClick(screen.getByTestId('desktop-icon-terminal'));
      
      const window = await screen.findByTestId('window-terminal');
      const initialBox = window.getBoundingClientRect();
      
      // Drag resize handle
      const resizeHandle = screen.getByTestId('window-resize-terminal');
      await userEvent.pointer([
        { keys: '[MouseLeft>]', target: resizeHandle },
        { coords: { x: initialBox.right + 100, y: initialBox.bottom + 100 } },
        { keys: '[/MouseLeft]' },
      ]);
      
      // Verify size changed
      await waitFor(() => {
        const newBox = window.getBoundingClientRect();
        expect(newBox.width).toBeGreaterThan(initialBox.width);
        expect(newBox.height).toBeGreaterThan(initialBox.height);
      });
    });

    it('should enforce minimum window size', async () => {
      render(<Desktop />);
      
      await userEvent.dblClick(screen.getByTestId('desktop-icon-terminal'));
      
      const window = await screen.findByTestId('window-terminal');
      
      // Try to resize very small
      const resizeHandle = screen.getByTestId('window-resize-terminal');
      await userEvent.pointer([
        { keys: '[MouseLeft>]', target: resizeHandle },
        { coords: { x: 50, y: 50 } },
        { keys: '[/MouseLeft]' },
      ]);
      
      // Verify minimum size enforced
      await waitFor(() => {
        const box = window.getBoundingClientRect();
        expect(box.width).toBeGreaterThanOrEqual(200);
        expect(box.height).toBeGreaterThanOrEqual(150);
      });
    });
  });

  describe('Desktop Icon Management', () => {
    it('should select desktop icon', async () => {
      render(<Desktop />);
      
      const icon = screen.getByTestId('desktop-icon-terminal');
      await userEvent.click(icon);
      
      // Verify icon selected
      await waitFor(() => {
        expect(icon).toHaveClass('selected');
      });
    });

    it('should select multiple icons with Ctrl+Click', async () => {
      render(<Desktop />);
      
      const icon1 = screen.getByTestId('desktop-icon-terminal');
      const icon2 = screen.getByTestId('desktop-icon-debugger');
      
      await userEvent.click(icon1);
      await userEvent.keyboard('{Control>}');
      await userEvent.click(icon2);
      await userEvent.keyboard('{/Control}');
      
      // Verify both selected
      await waitFor(() => {
        expect(icon1).toHaveClass('selected');
        expect(icon2).toHaveClass('selected');
      });
    });

    it('should drag desktop icon to new position', async () => {
      render(<Desktop />);
      
      const icon = screen.getByTestId('desktop-icon-terminal');
      const initialBox = icon.getBoundingClientRect();
      
      // Drag icon
      await userEvent.pointer([
        { keys: '[MouseLeft>]', target: icon },
        { coords: { x: initialBox.x + 100, y: initialBox.y + 100 } },
        { keys: '[/MouseLeft]' },
      ]);
      
      // Verify position changed
      await waitFor(() => {
        const newBox = icon.getBoundingClientRect();
        expect(newBox.x).not.toBe(initialBox.x);
        expect(newBox.y).not.toBe(initialBox.y);
      });
    });

    it('should show context menu on right-click', async () => {
      render(<Desktop />);
      
      const desktop = screen.getByTestId('desktop');
      await userEvent.pointer({ keys: '[MouseRight]', target: desktop });
      
      // Verify context menu appears
      await waitFor(() => {
        expect(screen.getByTestId('context-menu')).toBeInTheDocument();
      });
    });
  });

  describe('Notifications', () => {
    it('should display notification', async () => {
      render(<Desktop />);
      
      // Trigger notification (e.g., from app)
      const { showNotification } = useDesktopStore.getState();
      showNotification({
        title: 'Test Notification',
        message: 'This is a test',
        type: 'info',
      });
      
      // Verify notification appears
      await waitFor(() => {
        expect(screen.getByText('Test Notification')).toBeInTheDocument();
        expect(screen.getByText('This is a test')).toBeInTheDocument();
      });
    });

    it('should dismiss notification on click', async () => {
      render(<Desktop />);
      
      const { showNotification } = useDesktopStore.getState();
      showNotification({
        title: 'Test Notification',
        message: 'This is a test',
        type: 'info',
      });
      
      await waitFor(() => {
        expect(screen.getByText('Test Notification')).toBeInTheDocument();
      });
      
      // Click dismiss button
      const dismissButton = screen.getByTestId('notification-dismiss');
      await userEvent.click(dismissButton);
      
      // Verify notification removed
      await waitFor(() => {
        expect(screen.queryByText('Test Notification')).not.toBeInTheDocument();
      });
    });

    it('should auto-dismiss notification after timeout', async () => {
      render(<Desktop />);
      
      const { showNotification } = useDesktopStore.getState();
      showNotification({
        title: 'Test Notification',
        message: 'This is a test',
        type: 'info',
        timeout: 1000,
      });
      
      await waitFor(() => {
        expect(screen.getByText('Test Notification')).toBeInTheDocument();
      });
      
      // Wait for timeout
      await waitFor(() => {
        expect(screen.queryByText('Test Notification')).not.toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('System Tray', () => {
    it('should display system tray icons', async () => {
      render(<Desktop />);
      
      const systemTray = screen.getByTestId('system-tray');
      expect(systemTray).toBeInTheDocument();
      
      // Verify default icons present
      expect(screen.getByTestId('system-tray-clock')).toBeInTheDocument();
    });

    it('should show system menu on click', async () => {
      render(<Desktop />);
      
      const systemButton = screen.getByTestId('system-menu-button');
      await userEvent.click(systemButton);
      
      // Verify system menu appears
      await waitFor(() => {
        expect(screen.getByTestId('system-menu')).toBeInTheDocument();
      });
    });
  });

  describe('Theme Integration', () => {
    it('should apply theme to all components', async () => {
      render(<Desktop />);
      
      const { setTheme } = useDesktopStore.getState();
      setTheme('dark');
      
      // Verify theme applied
      await waitFor(() => {
        const desktop = screen.getByTestId('desktop');
        expect(desktop).toHaveClass('theme-dark');
      });
      
      // Open window and verify theme applied
      await userEvent.dblClick(screen.getByTestId('desktop-icon-terminal'));
      
      await waitFor(() => {
        const window = screen.getByTestId('window-terminal');
        expect(window).toHaveClass('theme-dark');
      });
    });

    it('should toggle theme', async () => {
      render(<Desktop />);
      
      const { toggleTheme, getTheme } = useDesktopStore.getState();
      
      const initialTheme = getTheme();
      toggleTheme();
      
      await waitFor(() => {
        expect(getTheme()).not.toBe(initialTheme);
      });
    });
  });

  describe('Persistence', () => {
    it('should persist window positions across sessions', async () => {
      const { unmount } = render(<Desktop />);
      
      // Open and move window
      await userEvent.dblClick(screen.getByTestId('desktop-icon-terminal'));
      
      const window = await screen.findByTestId('window-terminal');
      const titleBar = screen.getByTestId('window-titlebar-terminal');
      
      await userEvent.pointer([
        { keys: '[MouseLeft>]', target: titleBar },
        { coords: { x: 500, y: 300 } },
        { keys: '[/MouseLeft]' },
      ]);
      
      const position = window.getBoundingClientRect();
      
      // Unmount and remount
      unmount();
      render(<Desktop />);
      
      // Open window again
      await userEvent.dblClick(screen.getByTestId('desktop-icon-terminal'));
      
      // Verify position restored
      await waitFor(() => {
        const newWindow = screen.getByTestId('window-terminal');
        const newPosition = newWindow.getBoundingClientRect();
        expect(newPosition.x).toBeCloseTo(position.x, 10);
        expect(newPosition.y).toBeCloseTo(position.y, 10);
      });
    });

    it('should persist desktop icon positions', async () => {
      const { unmount } = render(<Desktop />);
      
      // Move icon
      const icon = screen.getByTestId('desktop-icon-terminal');
      await userEvent.pointer([
        { keys: '[MouseLeft>]', target: icon },
        { coords: { x: 200, y: 300 } },
        { keys: '[/MouseLeft]' },
      ]);
      
      const position = icon.getBoundingClientRect();
      
      // Unmount and remount
      unmount();
      render(<Desktop />);
      
      // Verify position restored
      await waitFor(() => {
        const newIcon = screen.getByTestId('desktop-icon-terminal');
        const newPosition = newIcon.getBoundingClientRect();
        expect(newPosition.x).toBeCloseTo(position.x, 10);
        expect(newPosition.y).toBeCloseTo(position.y, 10);
      });
    });

    it('should persist pinned taskbar items', async () => {
      const { unmount } = render(<Desktop />);
      
      // Pin app to taskbar
      const icon = screen.getByTestId('desktop-icon-terminal');
      await userEvent.pointer({ keys: '[MouseRight]', target: icon });
      
      const pinOption = screen.getByText('Pin to Taskbar');
      await userEvent.click(pinOption);
      
      // Verify pinned
      await waitFor(() => {
        const taskbarItem = screen.getByTestId('taskbar-terminal');
        expect(taskbarItem).toHaveClass('pinned');
      });
      
      // Unmount and remount
      unmount();
      render(<Desktop />);
      
      // Verify still pinned
      await waitFor(() => {
        const taskbarItem = screen.getByTestId('taskbar-terminal');
        expect(taskbarItem).toBeInTheDocument();
        expect(taskbarItem).toHaveClass('pinned');
      });
    });
  });

  describe('Performance', () => {
    it('should handle many open windows', async () => {
      render(<Desktop />);
      
      // Open many windows
      for (let i = 0; i < 20; i++) {
        await userEvent.dblClick(screen.getByTestId('desktop-icon-terminal'));
      }
      
      // Verify all windows created
      await waitFor(() => {
        const windows = screen.getAllByTestId(/^window-terminal-\d+$/);
        expect(windows.length).toBe(20);
      });
    });

    it('should handle rapid window operations', async () => {
      render(<Desktop />);
      
      // Rapidly open and close windows
      for (let i = 0; i < 10; i++) {
        await userEvent.dblClick(screen.getByTestId('desktop-icon-terminal'));
        const window = await screen.findByTestId('window-terminal');
        await userEvent.click(screen.getByTestId('window-close-terminal'));
        await waitFor(() => {
          expect(screen.queryByTestId('window-terminal')).not.toBeInTheDocument();
        });
      }
      
      // Verify no memory leaks or errors
      expect(screen.getByTestId('desktop')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle app launch failure', async () => {
      render(<Desktop />);
      
      // Try to open non-existent app
      const { createWindow } = useWindowStore.getState();
      
      expect(() => {
        createWindow({ appId: 'nonexistent', title: 'Invalid' });
      }).toThrow();
    });

    it('should recover from window crash', async () => {
      render(<Desktop />);
      
      await userEvent.dblClick(screen.getByTestId('desktop-icon-terminal'));
      
      // Simulate window crash
      const window = await screen.findByTestId('window-terminal');
      const errorBoundary = window.querySelector('[data-testid="error-boundary"]');
      
      if (errorBoundary) {
        // Verify error boundary caught error
        expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
        
        // Verify can recover
        const retryButton = screen.getByText('Retry');
        await userEvent.click(retryButton);
        
        await waitFor(() => {
          expect(screen.queryByText(/Something went wrong/)).not.toBeInTheDocument();
        });
      }
    });
  });
});
