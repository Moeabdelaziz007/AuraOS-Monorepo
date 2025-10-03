import React, { useState, useRef, useEffect } from 'react';
import { WindowState } from '../types/window';

interface WindowProps {
  window: WindowState;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
}

export const Window: React.FC<WindowProps> = ({
  window,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onMove,
  onResize,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const Component = window.component;

  // Handle window drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    
    e.preventDefault();
    onFocus(window.id);
    setIsDragging(true);
    setDragStart({
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y,
    });
  };

  // Handle resize drag
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus(window.id);
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.size.width,
      height: window.size.height,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !window.isMaximized) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        onMove(window.id, newX, newY);
      }

      if (isResizing && !window.isMaximized) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newWidth = Math.max(300, resizeStart.width + deltaX);
        const newHeight = Math.max(200, resizeStart.height + deltaY);
        onResize(window.id, newWidth, newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, window, onMove, onResize]);

  if (window.isMinimized) {
    return null;
  }

  const windowStyle: React.CSSProperties = window.isMaximized
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: 'calc(100vh - 48px)',
        zIndex: window.zIndex,
      }
    : {
        position: 'fixed',
        top: window.position.y,
        left: window.position.x,
        width: window.size.width,
        height: window.size.height,
        zIndex: window.zIndex,
      };

  return (
    <div
      ref={windowRef}
      className={`window ${window.isActive ? 'active' : ''}`}
      style={windowStyle}
      onMouseDown={() => onFocus(window.id)}
    >
      {/* Window Title Bar */}
      <div
        className="window-titlebar"
        onMouseDown={handleMouseDown}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <div className="window-title">
          {window.icon && <span className="window-icon">{window.icon}</span>}
          <span>{window.title}</span>
        </div>
        <div className="window-controls">
          <button
            className="window-control minimize"
            onClick={() => onMinimize(window.id)}
            title="Minimize"
          >
            −
          </button>
          <button
            className="window-control maximize"
            onClick={() => onMaximize(window.id)}
            title={window.isMaximized ? 'Restore' : 'Maximize'}
          >
            {window.isMaximized ? '❐' : '□'}
          </button>
          <button
            className="window-control close"
            onClick={() => onClose(window.id)}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="window-content">
        <Component {...(window.props || {})} />
      </div>

      {/* Resize Handle */}
      {!window.isMaximized && (
        <div
          className="window-resize-handle"
          onMouseDown={handleResizeMouseDown}
          style={{
            cursor: 'nwse-resize',
          }}
        />
      )}
    </div>
  );
};
