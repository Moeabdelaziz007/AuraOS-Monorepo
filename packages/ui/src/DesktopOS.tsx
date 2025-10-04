import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Newspaper, LayoutDashboard, Terminal, FolderOpen } from 'lucide-react';
import { WindowManager } from './components/WindowManager';
import { Taskbar } from './components/Taskbar';
import { Desktop } from './components/Desktop';
import { WindowState, DesktopApp } from './types/window';
import { DashboardApp } from './apps/DashboardApp';
import { TerminalApp } from './apps/TerminalApp';
import { FileManagerApp } from './apps/FileManagerApp';
import { NewsDashboardApp } from './apps/NewsDashboardApp';
import { QuantumLogo } from './components/quantum-elements/QuantumLogo';

export const DesktopOS: React.FC = () => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1000);
  
  // Voice state
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const voiceControllerRef = useRef<any>(null);

  // Define available applications
  const apps: DesktopApp[] = [
    {
      id: 'news',
      name: 'News',
      icon: Newspaper,
      component: NewsDashboardApp,
      defaultSize: { width: 1000, height: 700 },
      defaultPosition: { x: 50, y: 50 },
    },
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      component: DashboardApp,
      defaultSize: { width: 800, height: 600 },
      defaultPosition: { x: 100, y: 100 },
    },
    {
      id: 'terminal',
      name: 'Terminal',
      icon: Terminal,
      component: TerminalApp,
      defaultSize: { width: 700, height: 500 },
      defaultPosition: { x: 150, y: 150 },
    },
    {
      id: 'filemanager',
      name: 'Files',
      icon: FolderOpen,
      component: FileManagerApp,
      defaultSize: { width: 900, height: 600 },
      defaultPosition: { x: 200, y: 100 },
    },
  ];

  // Focus a window (bring to front)
  const handleWindowFocus = useCallback(
    (windowId: string) => {
      setWindows((prev) => {
        const window = prev.find((w) => w.id === windowId);
        if (!window || window.isActive) return prev;

        return prev.map((w) => ({
          ...w,
          isActive: w.id === windowId,
          zIndex: w.id === windowId ? nextZIndex : w.zIndex,
        }));
      });
      setNextZIndex((z) => z + 1);
    },
    [nextZIndex]
  );

  // Minimize/restore a window
  const handleWindowMinimize = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, isMinimized: !w.isMinimized } : w
      )
    );
  }, []);

  // Launch an application
  const handleAppLaunch = useCallback(
    (appId: string) => {
      // Check if app is already running
      const existingWindow = windows.find((w) => w.id.startsWith(appId));
      if (existingWindow) {
        // Focus existing window
        handleWindowFocus(existingWindow.id);
        if (existingWindow.isMinimized) {
          handleWindowMinimize(existingWindow.id);
        }
        return;
      }

      const app = apps.find((a) => a.id === appId);
      if (!app) return;

      const newWindow: WindowState = {
        id: `${appId}-${Date.now()}`,
        title: app.name,
        component: app.component,
        position: app.defaultPosition || { x: 100, y: 100 },
        size: app.defaultSize || { width: 800, height: 600 },
        zIndex: nextZIndex,
        isMinimized: false,
        isMaximized: false,
        isActive: true,
        icon: app.icon,
      };

      setWindows((prev) =>
        prev.map((w) => ({ ...w, isActive: false })).concat(newWindow)
      );
      setNextZIndex((z) => z + 1);
    },
    [windows, nextZIndex, apps, handleWindowFocus, handleWindowMinimize]
  );

  // Close a window
  const handleWindowClose = useCallback((windowId: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== windowId));
  }, []);

  // Maximize/restore a window
  const handleWindowMaximize = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
      )
    );
  }, []);

  // Move a window
  const handleWindowMove = useCallback((windowId: string, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, position: { x, y } } : w
      )
    );
  }, []);

  // Resize a window
  const handleWindowResize = useCallback(
    (windowId: string, width: number, height: number) => {
      setWindows((prev) =>
        prev.map((w) =>
          w.id === windowId ? { ...w, size: { width, height } } : w
        )
      );
    },
    []
  );

  // Voice toggle handler
  const handleVoiceToggle = useCallback(async () => {
    if (!isVoiceEnabled) {
      // Enable voice
      setIsVoiceEnabled(true);
      // Initialize voice controller here if needed
      console.log('Voice enabled - ready to listen');
    } else {
      // Disable voice
      setIsVoiceEnabled(false);
      setIsRecording(false);
      setIsProcessing(false);
      console.log('Voice disabled');
    }
  }, [isVoiceEnabled]);

  // Initialize voice features
  useEffect(() => {
    // Initialize voice controller when component mounts
    const initVoice = async () => {
      try {
        // Check for microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        console.log('Microphone access granted');
      } catch (error) {
        console.warn('Microphone access denied:', error);
      }
    };

    initVoice();
  }, []);

  return (
    <div className="desktop-os relative">
      {/* Desktop Background with Icons */}
      <Desktop apps={apps} onAppLaunch={handleAppLaunch} />

      {/* Quantum Voice Logo - Centered */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto">
        <QuantumLogo 
          size={200} 
          className="quantum-desktop-logo"
          isVoiceEnabled={isVoiceEnabled}
          onVoiceToggle={handleVoiceToggle}
          isRecording={isRecording}
          isProcessing={isProcessing}
        />
      </div>

      {/* Window Manager */}
      <WindowManager
        windows={windows}
        onWindowClose={handleWindowClose}
        onWindowMinimize={handleWindowMinimize}
        onWindowMaximize={handleWindowMaximize}
        onWindowFocus={handleWindowFocus}
        onWindowMove={handleWindowMove}
        onWindowResize={handleWindowResize}
      />

      {/* Taskbar */}
      <Taskbar
        windows={windows}
        apps={apps}
        onAppLaunch={handleAppLaunch}
        onWindowFocus={handleWindowFocus}
        onWindowMinimize={handleWindowMinimize}
      />
    </div>
  );
};
