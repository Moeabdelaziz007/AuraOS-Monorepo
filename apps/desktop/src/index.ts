/**
 * AuraOS Desktop App
 * Main desktop environment with window management
 */

export { DesktopApp } from './components/DesktopApp';
export { WindowManager } from './components/WindowManager';
export { Taskbar } from './components/Taskbar';
export { StartMenu } from './components/StartMenu';
export { SystemTray } from './components/SystemTray';

export type {
  DesktopApp as DesktopAppType,
  WindowState,
  AppConfig,
  DesktopSettings
} from './types';

export { useDesktop } from './hooks/useDesktop';
export { useWindowManager } from './hooks/useWindowManager';
export { useTaskbar } from './hooks/useTaskbar';