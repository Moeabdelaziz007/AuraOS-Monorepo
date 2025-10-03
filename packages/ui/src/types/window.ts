/**
 * Window and Desktop Types
 */

export interface WindowState {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isActive: boolean;
  icon?: string;
}

export interface DesktopApp {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType<any>;
  defaultSize?: { width: number; height: number };
  defaultPosition?: { x: number; y: number };
}

export interface TaskbarApp {
  id: string;
  name: string;
  icon: string;
  isRunning: boolean;
  windowId?: string;
}
