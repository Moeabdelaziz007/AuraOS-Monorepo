import React, { useState, useCallback } from 'react';
import { Window } from './Window';
import { WindowState } from '../types/window';

interface WindowManagerProps {
  windows: WindowState[];
  onWindowClose: (id: string) => void;
  onWindowMinimize: (id: string) => void;
  onWindowMaximize: (id: string) => void;
  onWindowFocus: (id: string) => void;
  onWindowMove: (id: string, x: number, y: number) => void;
  onWindowResize: (id: string, width: number, height: number) => void;
}

export const WindowManager: React.FC<WindowManagerProps> = ({
  windows,
  onWindowClose,
  onWindowMinimize,
  onWindowMaximize,
  onWindowFocus,
  onWindowMove,
  onWindowResize,
}) => {
  // Sort windows by z-index for proper rendering order
  const sortedWindows = [...windows].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="window-manager">
      {sortedWindows.map((window) => (
        <Window
          key={window.id}
          window={window}
          onClose={onWindowClose}
          onMinimize={onWindowMinimize}
          onMaximize={onWindowMaximize}
          onFocus={onWindowFocus}
          onMove={onWindowMove}
          onResize={onWindowResize}
        />
      ))}
    </div>
  );
};
