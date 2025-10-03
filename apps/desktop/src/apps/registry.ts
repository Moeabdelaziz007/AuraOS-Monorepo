import type { App } from '../types';
import { TerminalApp } from './TerminalApp';
import { DebuggerApp } from './DebuggerApp';
import { FileExplorerApp } from './FileExplorerApp';

export const apps: App[] = [
  {
    id: 'terminal',
    name: 'Terminal',
    icon: '🖥️',
    component: TerminalApp,
    defaultSize: { width: 800, height: 600 },
    minSize: { width: 400, height: 300 },
    resizable: true,
    category: 'development',
  },
  {
    id: 'debugger',
    name: 'Debugger',
    icon: '🐛',
    component: DebuggerApp,
    defaultSize: { width: 1000, height: 700 },
    minSize: { width: 600, height: 400 },
    resizable: true,
    category: 'development',
  },
  {
    id: 'files',
    name: 'Files',
    icon: '📁',
    component: FileExplorerApp,
    defaultSize: { width: 700, height: 500 },
    minSize: { width: 400, height: 300 },
    resizable: true,
    category: 'system',
  },
];
