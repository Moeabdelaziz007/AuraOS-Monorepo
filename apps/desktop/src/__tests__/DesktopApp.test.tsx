import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DesktopApp } from '../components/DesktopApp';
import { DesktopApp as DesktopAppType } from '../types';

// Mock components
vi.mock('../components/WindowManager', () => ({
  WindowManager: ({ windows }: any) => (
    <div data-testid="window-manager">
      {windows.map((w: any) => (
        <div key={w.id} data-testid={`window-${w.id}`}>
          {w.title}
        </div>
      ))}
    </div>
  )
}));

vi.mock('../components/Taskbar', () => ({
  Taskbar: ({ windows, apps }: any) => (
    <div data-testid="taskbar">
      {windows.map((w: any) => (
        <div key={w.id} data-testid={`taskbar-window-${w.id}`}>
          {w.title}
        </div>
      ))}
      {apps.map((a: any) => (
        <button key={a.id} data-testid={`app-${a.id}`}>
          {a.name}
        </button>
      ))}
    </div>
  )
}));

vi.mock('../components/DesktopBackground', () => ({
  DesktopBackground: () => <div data-testid="desktop-background" />
}));

vi.mock('../components/DesktopIcons', () => ({
  DesktopIcons: ({ apps, onAppLaunch }: any) => (
    <div data-testid="desktop-icons">
      {apps.map((app: any) => (
        <div 
          key={app.id} 
          data-testid={`desktop-icon-${app.id}`}
          onClick={() => onAppLaunch(app.id)}
        >
          {app.name}
        </div>
      ))}
    </div>
  )
}));

describe('DesktopApp', () => {
  const mockApps: DesktopAppType[] = [
    {
      id: 'terminal',
      name: 'Terminal',
      icon: '💻',
      category: 'system',
      component: () => <div>Terminal App</div>
    },
    {
      id: 'files',
      name: 'Files',
      icon: '📁',
      category: 'system',
      component: () => <div>File Manager</div>
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders desktop components', () => {
    render(<DesktopApp apps={mockApps} />);
    
    expect(screen.getByTestId('desktop-background')).toBeInTheDocument();
    expect(screen.getByTestId('desktop-icons')).toBeInTheDocument();
    expect(screen.getByTestId('window-manager')).toBeInTheDocument();
    expect(screen.getByTestId('taskbar')).toBeInTheDocument();
  });

  it('displays desktop icons for apps', () => {
    render(<DesktopApp apps={mockApps} />);
    
    expect(screen.getByTestId('desktop-icon-terminal')).toBeInTheDocument();
    expect(screen.getByTestId('desktop-icon-files')).toBeInTheDocument();
  });

  it('handles app launch', async () => {
    const onAppLaunch = vi.fn();
    render(<DesktopApp apps={mockApps} onAppLaunch={onAppLaunch} />);
    
    const terminalIcon = screen.getByTestId('desktop-icon-terminal');
    fireEvent.click(terminalIcon);
    
    await waitFor(() => {
      expect(onAppLaunch).toHaveBeenCalledWith('terminal');
    });
  });

  it('creates new window when app is launched', async () => {
    render(<DesktopApp apps={mockApps} />);
    
    const terminalIcon = screen.getByTestId('desktop-icon-terminal');
    fireEvent.click(terminalIcon);
    
    await waitFor(() => {
      expect(screen.getByTestId('window-window-')).toBeInTheDocument();
    });
  });

  it('handles window operations', async () => {
    const onWindowClose = vi.fn();
    const onWindowMinimize = vi.fn();
    const onWindowMaximize = vi.fn();
    const onWindowFocus = vi.fn();
    
    render(
      <DesktopApp 
        apps={mockApps}
        onWindowClose={onWindowClose}
        onWindowMinimize={onWindowMinimize}
        onWindowMaximize={onWindowMaximize}
        onWindowFocus={onWindowFocus}
      />
    );
    
    // Launch an app first
    const terminalIcon = screen.getByTestId('desktop-icon-terminal');
    fireEvent.click(terminalIcon);
    
    await waitFor(() => {
      expect(screen.getByTestId('window-window-')).toBeInTheDocument();
    });
  });
});
