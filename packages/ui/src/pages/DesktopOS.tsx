/**
 * Desktop OS Page
 * Main desktop environment with window management
 */

import React, { useState } from 'react';
import { Desktop } from '../components/Desktop';
import { WindowManager } from '../components/WindowManager';
import { Taskbar } from '../components/Taskbar';
import { DesktopApp, WindowState } from '../types/window';

// Sample apps
const desktopApps: DesktopApp[] = [
  {
    id: 'terminal',
    name: 'Terminal',
    icon: '💻',
    component: () => <div className="p-4">Terminal App</div>,
  },
  {
    id: 'files',
    name: 'Files',
    icon: '📁',
    component: () => <div className="p-4">File Manager</div>,
  },
  {
    id: 'notes',
    name: 'Notes',
    icon: '📝',
    component: () => <div className="p-4">Notes App</div>,
  },
  {
    id: 'ai-chat',
    name: 'AI Chat',
    icon: '🤖',
    component: () => <div className="p-4">AI Chat</div>,
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: '⚙️',
    component: () => <div className="p-4">Settings</div>,
  },
];

export function DesktopOS() {
  const [windows, setWindows] = useState<WindowState[]>([]);

  const handleAppLaunch = (appId: string) => {
    const app = desktopApps.find(a => a.id === appId);
    if (!app) return;

    // Check if window already exists
    const existingWindow = windows.find(w => w.title === app.name);
    if (existingWindow) {
      // Bring to front
      setWindows(prev =>
        prev.map(w =>
          w.id === existingWindow.id
            ? { ...w, zIndex: Math.max(...prev.map(win => win.zIndex)) + 1, isMinimized: false }
            : w
        )
      );
      return;
    }

    // Create new window centered on screen
    const windowWidth = 800;
    const windowHeight = 600;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // حساب المنتصف مع إزاحة بسيطة لكل نافذة جديدة
    const offset = windows.length * 30;
    const centerX = Math.max(50, (screenWidth - windowWidth) / 2 + offset);
    const centerY = Math.max(50, (screenHeight - windowHeight) / 2 + offset);

    const newWindow: WindowState = {
      id: `window-${Date.now()}`,
      title: app.name,
      component: app.component,
      position: { x: centerX, y: centerY },
      size: { width: windowWidth, height: windowHeight },
      isMinimized: false,
      isMaximized: false,
      isActive: true,
      zIndex: windows.length + 1,
      icon: app.icon,
    };

    setWindows(prev => [...prev.map(w => ({ ...w, isActive: false })), newWindow]);
  };

  const handleWindowClose = (windowId: string) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
  };

  const handleWindowMinimize = (windowId: string) => {
    setWindows(prev =>
      prev.map(w =>
        w.id === windowId ? { ...w, isMinimized: !w.isMinimized } : w
      )
    );
  };

  const handleWindowMaximize = (windowId: string) => {
    setWindows(prev =>
      prev.map(w =>
        w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
      )
    );
  };

  const handleWindowFocus = (windowId: string) => {
    setWindows(prev => {
      const maxZ = Math.max(...prev.map(w => w.zIndex));
      return prev.map(w =>
        w.id === windowId ? { ...w, zIndex: maxZ + 1 } : w
      );
    });
  };

  const handleWindowMove = (windowId: string, x: number, y: number) => {
    setWindows(prev =>
      prev.map(w => (w.id === windowId ? { ...w, position: { x, y } } : w))
    );
  };

  const handleWindowResize = (windowId: string, width: number, height: number) => {
    setWindows(prev =>
      prev.map(w => (w.id === windowId ? { ...w, size: { width, height } } : w))
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-400 to-purple-500">
      <div className="flex-1 relative overflow-hidden">
        <Desktop apps={desktopApps} onAppLaunch={handleAppLaunch} />
        <WindowManager
          windows={windows}
          onWindowClose={handleWindowClose}
          onWindowMinimize={handleWindowMinimize}
          onWindowMaximize={handleWindowMaximize}
          onWindowFocus={handleWindowFocus}
          onWindowMove={handleWindowMove}
          onWindowResize={handleWindowResize}
        />
      </div>
      <Taskbar
        windows={windows}
        apps={desktopApps}
        onAppLaunch={handleAppLaunch}
        onWindowFocus={handleWindowFocus}
        onWindowMinimize={handleWindowMinimize}
      />
    </div>
  );
}
