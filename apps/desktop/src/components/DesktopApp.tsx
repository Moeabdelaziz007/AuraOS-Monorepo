import React, { useState, useEffect } from 'react';
import { WindowManager } from './WindowManager';
import { Taskbar } from './Taskbar';
import { DesktopBackground } from './DesktopBackground';
import { DesktopIcons } from './DesktopIcons';
import { useDesktop } from '../hooks/useDesktop';
import { DesktopApp as DesktopAppType, WindowState } from '../types';

interface DesktopAppProps {
  apps: DesktopAppType[];
  onAppLaunch?: (appId: string) => void;
  onWindowClose?: (windowId: string) => void;
  onWindowMinimize?: (windowId: string) => void;
  onWindowMaximize?: (windowId: string) => void;
  onWindowFocus?: (windowId: string) => void;
  onWindowMove?: (windowId: string, x: number, y: number) => void;
  onWindowResize?: (windowId: string, width: number, height: number) => void;
}

export const DesktopApp: React.FC<DesktopAppProps> = ({
  apps,
  onAppLaunch,
  onWindowClose,
  onWindowMinimize,
  onWindowMaximize,
  onWindowFocus,
  onWindowMove,
  onWindowResize
}) => {
  const {
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
  } = useDesktop();

  // Handle app launch
  const handleLaunch = (appId: string) => {
    handleAppLaunch(appId, apps);
    onAppLaunch?.(appId);
  };

  // Handle window operations
  const handleClose = (windowId: string) => {
    handleWindowClose(windowId);
    onWindowClose?.(windowId);
  };

  const handleMinimize = (windowId: string) => {
    handleWindowMinimize(windowId);
    onWindowMinimize?.(windowId);
  };

  const handleMaximize = (windowId: string) => {
    handleWindowMaximize(windowId);
    onWindowMaximize?.(windowId);
  };

  const handleFocus = (windowId: string) => {
    handleWindowFocus(windowId);
    onWindowFocus?.(windowId);
  };

  const handleMove = (windowId: string, x: number, y: number) => {
    handleWindowMove(windowId, x, y);
    onWindowMove?.(windowId, x, y);
  };

  const handleResize = (windowId: string, width: number, height: number) => {
    handleWindowResize(windowId, width, height);
    onWindowResize?.(windowId, width, height);
  };

  return (
    <div className="desktop-app">
      {/* Desktop Background */}
      <DesktopBackground />
      
      {/* Desktop Icons */}
      <DesktopIcons 
        apps={apps}
        onAppLaunch={handleLaunch}
      />
      
      {/* Window Manager */}
      <WindowManager
        windows={windows}
        apps={apps}
        onClose={handleClose}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        onFocus={handleFocus}
        onMove={handleMove}
        onResize={handleResize}
      />
      
      {/* Taskbar */}
      <Taskbar
        windows={windows}
        apps={apps}
        onAppLaunch={handleLaunch}
        onWindowClick={handleMinimize}
        onWindowFocus={handleFocus}
      />
    </div>
  );
};
