import React from 'react';
import { Window } from './Window';
import { WindowState, DesktopApp } from '../types';

interface WindowManagerProps {
  windows: WindowState[];
  apps: DesktopApp[];
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
}

export const WindowManager: React.FC<WindowManagerProps> = ({
  windows,
  apps,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onMove,
  onResize
}) => {
  // Sort windows by z-index for proper rendering order
  const sortedWindows = [...windows].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="window-manager">
      {sortedWindows.map((window) => {
        const app = apps.find(a => a.id === window.appId);
        if (!app) return null;

        return (
          <Window
            key={window.id}
            window={window}
            app={app}
            onClose={onClose}
            onMinimize={onMinimize}
            onMaximize={onMaximize}
            onFocus={onFocus}
            onMove={onMove}
            onResize={onResize}
          />
        );
      })}
    </div>
  );
};
