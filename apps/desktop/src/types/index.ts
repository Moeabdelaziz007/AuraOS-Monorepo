/**
 * Desktop App Types
 */

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  icon?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  isActive: boolean;
  component?: React.ComponentType<any>;
  props?: Record<string, any>;
}

export interface DesktopApp {
  id: string;
  name: string;
  icon: string;
  description?: string;
  category: 'system' | 'development' | 'productivity' | 'entertainment' | 'utilities';
  component: React.ComponentType<any>;
  defaultSize?: {
    width: number;
    height: number;
  };
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
}

export interface AppConfig {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  icon: string;
  category: string;
  dependencies?: string[];
  permissions?: string[];
}

export interface DesktopSettings {
  wallpaper: string;
  theme: 'light' | 'dark' | 'auto';
  taskbarPosition: 'bottom' | 'top' | 'left' | 'right';
  showDesktopIcons: boolean;
  autoHideTaskbar: boolean;
  windowAnimations: boolean;
  soundEffects: boolean;
  screenSaver: {
    enabled: boolean;
    timeout: number;
    type: 'blank' | 'slideshow' | 'clock';
  };
}

export interface SystemInfo {
  os: string;
  version: string;
  architecture: string;
  memory: {
    total: number;
    used: number;
    free: number;
  };
  cpu: {
    usage: number;
    cores: number;
    model: string;
  };
  storage: {
    total: number;
    used: number;
    free: number;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

export interface TaskbarItem {
  id: string;
  appId: string;
  title: string;
  icon: string;
  isActive: boolean;
  isMinimized: boolean;
  hasNotifications: boolean;
  progress?: number;
}
