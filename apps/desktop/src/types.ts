/**
 * Desktop Types
 */

import { ComponentType } from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  position: Position;
  size: Size;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  zIndex: number;
}

export interface App {
  id: string;
  name: string;
  icon: string;
  component: ComponentType<AppProps>;
  defaultSize: Size;
  minSize: Size;
  resizable: boolean;
  category: 'system' | 'development' | 'utility';
}

export interface AppProps {
  windowId: string;
}

export type Theme = 'dark' | 'light';

export interface DesktopSettings {
  theme: Theme;
  background: string;
  wallpaper?: string;
}
