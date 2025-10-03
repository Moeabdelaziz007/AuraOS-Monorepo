import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { DesktopApp } from '../components/DesktopApp';
import { DesktopApp as DesktopAppType } from '../types';

// Mock MCP Tools
vi.mock('@auraos/core', () => ({
  mcpCommands: {
    file: {
      read: vi.fn(),
      write: vi.fn(),
      list: vi.fn(),
      delete: vi.fn()
    },
    emulator: {
      create: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      execute: vi.fn()
    }
  }
}));

// Mock AI Services
vi.mock('@auraos/ai', () => ({
  aiService: {
    chat: vi.fn(),
    generate: vi.fn(),
    analyze: vi.fn()
  }
}));

describe('Desktop App Integration Tests', () => {
  const mockApps: DesktopAppType[] = [
    {
      id: 'terminal',
      name: 'Terminal',
      icon: '💻',
      category: 'system',
      component: () => <div data-testid="terminal-app">Terminal App</div>
    },
    {
      id: 'files',
      name: 'Files',
      icon: '📁',
      category: 'system',
      component: () => <div data-testid="files-app">Files App</div>
    },
    {
      id: 'debugger',
      name: 'Debugger',
      icon: '🐛',
      category: 'development',
      component: () => <div data-testid="debugger-app">Debugger App</div>
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Window Management', () => {
    it('should create and manage multiple windows', async () => {
      render(<DesktopApp apps={mockApps} />);
      
      // Launch multiple apps
      const terminalIcon = screen.getByTestId('desktop-icon-terminal');
      const filesIcon = screen.getByTestId('desktop-icon-files');
      
      fireEvent.click(terminalIcon);
      fireEvent.click(filesIcon);
      
      await waitFor(() => {
        expect(screen.getByTestId('terminal-app')).toBeInTheDocument();
        expect(screen.getByTestId('files-app')).toBeInTheDocument();
      });
    });

    it('should handle window focus and z-index management', async () => {
      render(<DesktopApp apps={mockApps} />);
      
      // Launch two apps
      fireEvent.click(screen.getByTestId('desktop-icon-terminal'));
      fireEvent.click(screen.getByTestId('desktop-icon-files'));
      
      await waitFor(() => {
        const windows = screen.getAllByTestId(/window-/);
        expect(windows).toHaveLength(2);
      });
      
      // Test window focusing
      const firstWindow = screen.getAllByTestId(/window-/)[0];
      fireEvent.click(firstWindow);
      
      await waitFor(() => {
        expect(firstWindow).toHaveClass('active');
      });
    });

    it('should handle window operations (minimize, maximize, close)', async () => {
      render(<DesktopApp apps={mockApps} />);
      
      fireEvent.click(screen.getByTestId('desktop-icon-terminal'));
      
      await waitFor(() => {
        expect(screen.getByTestId('terminal-app')).toBeInTheDocument();
      });
      
      // Test minimize
      fireEvent.click(screen.getByRole('button', { name: /minimize/i }));
      await waitFor(() => {
        expect(screen.queryByTestId('terminal-app')).not.toBeVisible();
      });
      
      // Test restore from taskbar
      fireEvent.click(screen.getByTestId('taskbar-window-'));
      await waitFor(() => {
        expect(screen.getByTestId('terminal-app')).toBeVisible();
      });
      
      // Test maximize
      fireEvent.click(screen.getByRole('button', { name: /maximize/i }));
      await waitFor(() => {
        const window = screen.getByTestId(/window-/);
        expect(window).toHaveStyle({ width: '100vw' });
      });
      
      // Test close
      fireEvent.click(screen.getByRole('button', { name: /close/i }));
      await waitFor(() => {
        expect(screen.queryByTestId('terminal-app')).not.toBeInTheDocument();
      });
    });
  });

  describe('Taskbar Integration', () => {
    it('should display running applications in taskbar', async () => {
      render(<DesktopApp apps={mockApps} />);
      
      fireEvent.click(screen.getByTestId('desktop-icon-terminal'));
      
      await waitFor(() => {
        expect(screen.getByTestId('taskbar-window-')).toBeInTheDocument();
        expect(screen.getByText('Terminal')).toBeInTheDocument();
      });
    });

    it('should handle start menu interactions', async () => {
      render(<DesktopApp apps={mockApps} />);
      
      // Open start menu
      fireEvent.click(screen.getByTestId('start-button'));
      await waitFor(() => {
        expect(screen.getByTestId('start-menu')).toBeVisible();
      });
      
      // Launch app from start menu
      fireEvent.click(screen.getByTestId('start-menu-app-terminal'));
      await waitFor(() => {
        expect(screen.getByTestId('terminal-app')).toBeInTheDocument();
        expect(screen.getByTestId('start-menu')).not.toBeVisible();
      });
    });
  });

  describe('Desktop Interactions', () => {
    it('should handle desktop icon interactions', async () => {
      render(<DesktopApp apps={mockApps} />);
      
      // Test double-click to launch
      const terminalIcon = screen.getByTestId('desktop-icon-terminal');
      fireEvent.doubleClick(terminalIcon);
      
      await waitFor(() => {
        expect(screen.getByTestId('terminal-app')).toBeInTheDocument();
      });
    });

    it('should handle desktop background clicks', async () => {
      render(<DesktopApp apps={mockApps} />);
      
      // Launch an app first
      fireEvent.click(screen.getByTestId('desktop-icon-terminal'));
      await waitFor(() => {
        expect(screen.getByTestId('terminal-app')).toBeInTheDocument();
      });
      
      // Click on desktop background
      fireEvent.click(screen.getByTestId('desktop-background'));
      
      // Window should lose focus
      await waitFor(() => {
        const window = screen.getByTestId(/window-/);
        expect(window).not.toHaveClass('active');
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle multiple window creation without performance degradation', async () => {
      render(<DesktopApp apps={mockApps} />);
      
      // Create multiple windows
      for (let i = 0; i < 5; i++) {
        fireEvent.click(screen.getByTestId('desktop-icon-terminal'));
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
        });
      }
      
      await waitFor(() => {
        const windows = screen.getAllByTestId(/window-/);
        expect(windows).toHaveLength(5);
      });
    });

    it('should handle rapid window operations', async () => {
      render(<DesktopApp apps={mockApps} />);
      
      fireEvent.click(screen.getByTestId('desktop-icon-terminal'));
      
      await waitFor(() => {
        expect(screen.getByTestId('terminal-app')).toBeInTheDocument();
      });
      
      // Rapid minimize/maximize operations
      for (let i = 0; i < 10; i++) {
        fireEvent.click(screen.getByRole('button', { name: /minimize/i }));
        fireEvent.click(screen.getByTestId('taskbar-window-'));
        fireEvent.click(screen.getByRole('button', { name: /maximize/i }));
        fireEvent.click(screen.getByRole('button', { name: /maximize/i }));
      }
      
      // Should still be functional
      await waitFor(() => {
        expect(screen.getByTestId('terminal-app')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle app launch errors gracefully', async () => {
      const errorApp: DesktopAppType = {
        id: 'error-app',
        name: 'Error App',
        icon: '❌',
        category: 'system',
        component: () => {
          throw new Error('App failed to load');
        }
      };
      
      render(<DesktopApp apps={[errorApp]} />);
      
      fireEvent.click(screen.getByTestId('desktop-icon-error-app'));
      
      // Should show error boundary
      await waitFor(() => {
        expect(screen.getByText('Something went wrong:')).toBeInTheDocument();
      });
    });

    it('should handle window creation failures', async () => {
      // Mock window creation failure
      vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<DesktopApp apps={mockApps} />);
      
      fireEvent.click(screen.getByTestId('desktop-icon-terminal'));
      
      // Should handle gracefully
      await waitFor(() => {
        expect(screen.getByTestId('desktop-app')).toBeInTheDocument();
      });
    });
  });
});
