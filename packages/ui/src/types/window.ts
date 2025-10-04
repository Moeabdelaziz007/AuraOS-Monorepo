/**
 * Window and Desktop Types
 */

import { LucideIcon } from 'lucide-react';

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
  icon?: LucideIcon | string;
}

export interface DesktopApp {
  id: string;
  name: string;
  icon: LucideIcon | string;
  component: React.ComponentType<any>;
  defaultSize?: { width: number; height: number };
  defaultPosition?: { x: number; y: number };
}

export interface TaskbarApp {
  id: string;
  name: string;
  icon: LucideIcon | string;
  isRunning: boolean;
  windowId?: string;
}
