import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Taskbar } from '../Taskbar';
import { WindowState, DesktopApp } from '../../types/window';

describe('Taskbar Component', () => {
  const mockApps: DesktopApp[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: '📊',
      component: () => <div>Dashboard</div>,
    },
    {
      id: 'terminal',
      name: 'Terminal',
      icon: '💻',
      component: () => <div>Terminal</div>,
    },
  ];

  const mockWindows: WindowState[] = [
    {
      id: 'dashboard-1',
      title: 'Dashboard',
      component: () => <div>Dashboard</div>,
      position: { x: 100, y: 100 },
      size: { width: 800, height: 600 },
      zIndex: 1000,
      isMinimized: false,
      isMaximized: false,
      isActive: true,
      icon: '📊',
    },
  ];

  const mockHandlers = {
    onAppLaunch: vi.fn(),
    onWindowFocus: vi.fn(),
    onWindowMinimize: vi.fn(),
  };

  it('renders taskbar', () => {
    render(
      <Taskbar
        windows={[]}
        apps={mockApps}
        {...mockHandlers}
      />
    );
    expect(screen.getByText('AuraOS')).toBeInTheDocument();
  });

  it('displays current time', () => {
    render(
      <Taskbar
        windows={[]}
        apps={mockApps}
        {...mockHandlers}
      />
    );
    // Check if time is displayed (format: HH:MM AM/PM)
    const timeElement = screen.getByText(/\d{1,2}:\d{2}\s(AM|PM)/i);
    expect(timeElement).toBeInTheDocument();
  });

  it('displays current date', () => {
    render(
      <Taskbar
        windows={[]}
        apps={mockApps}
        {...mockHandlers}
      />
    );
    // Check if date is displayed
    const dateElement = screen.getByText(/\w{3}\s\d{1,2},\s\d{4}/i);
    expect(dateElement).toBeInTheDocument();
  });

  it('opens start menu when start button is clicked', () => {
    render(
      <Taskbar
        windows={[]}
        apps={mockApps}
        {...mockHandlers}
      />
    );
    const startButton = screen.getByText('AuraOS');
    fireEvent.click(startButton);
    expect(screen.getByText('Applications')).toBeInTheDocument();
  });

  it('displays apps in start menu', () => {
    render(
      <Taskbar
        windows={[]}
        apps={mockApps}
        {...mockHandlers}
      />
    );
    const startButton = screen.getByText('AuraOS');
    fireEvent.click(startButton);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Terminal')).toBeInTheDocument();
  });

  it('calls onAppLaunch when app is clicked in start menu', () => {
    render(
      <Taskbar
        windows={[]}
        apps={mockApps}
        {...mockHandlers}
      />
    );
    const startButton = screen.getByText('AuraOS');
    fireEvent.click(startButton);
    
    const dashboardApp = screen.getByText('Dashboard');
    fireEvent.click(dashboardApp);
    
    expect(mockHandlers.onAppLaunch).toHaveBeenCalledWith('dashboard');
  });

  it('displays running windows in taskbar', () => {
    render(
      <Taskbar
        windows={mockWindows}
        apps={mockApps}
        {...mockHandlers}
      />
    );
    expect(screen.getByTitle('Dashboard')).toBeInTheDocument();
  });

  it('calls onWindowFocus when window button is clicked', () => {
    render(
      <Taskbar
        windows={mockWindows}
        apps={mockApps}
        {...mockHandlers}
      />
    );
    const windowButton = screen.getByTitle('Dashboard');
    fireEvent.click(windowButton);
    
    expect(mockHandlers.onWindowFocus).toHaveBeenCalledWith('dashboard-1');
  });

  it('applies active class to active window', () => {
    render(
      <Taskbar
        windows={mockWindows}
        apps={mockApps}
        {...mockHandlers}
      />
    );
    const windowButton = screen.getByTitle('Dashboard');
    expect(windowButton).toHaveClass('active');
  });

  it('applies minimized class to minimized window', () => {
    const minimizedWindows = [
      { ...mockWindows[0], isMinimized: true, isActive: false },
    ];
    render(
      <Taskbar
        windows={minimizedWindows}
        apps={mockApps}
        {...mockHandlers}
      />
    );
    const windowButton = screen.getByTitle('Dashboard');
    expect(windowButton).toHaveClass('minimized');
  });

  it('displays system tray icons', () => {
    render(
      <Taskbar
        windows={[]}
        apps={mockApps}
        {...mockHandlers}
      />
    );
    expect(screen.getByTitle('Network')).toBeInTheDocument();
    expect(screen.getByTitle('Volume')).toBeInTheDocument();
    expect(screen.getByTitle('Notifications')).toBeInTheDocument();
  });
});
