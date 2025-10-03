# AuraOS Desktop App - Architecture

## Overview

The Desktop App is the main interface for AuraOS, providing a window management system that hosts Terminal, Debugger, File Explorer, and other applications.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Desktop App                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                      Taskbar                          │  │
│  │  [Start] [Terminal] [Debugger] [Files]    [Clock]    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Terminal Window │  │ Debugger Window  │                │
│  │  ┌────────────┐  │  │  ┌────────────┐  │                │
│  │  │            │  │  │  │            │  │                │
│  │  │  xterm.js  │  │  │  │   Monaco   │  │                │
│  │  │            │  │  │  │            │  │                │
│  │  └────────────┘  │  │  └────────────┘  │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                              │
│  ┌──────────────────┐                                       │
│  │ File Explorer    │                                       │
│  │  📁 documents    │                                       │
│  │  📁 downloads    │                                       │
│  │  📁 projects     │                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

## Component Structure

```
apps/desktop/
├── src/
│   ├── components/
│   │   ├── Desktop.tsx           # Main desktop container
│   │   ├── Taskbar.tsx           # Bottom taskbar
│   │   ├── Window.tsx            # Draggable window component
│   │   ├── WindowManager.tsx     # Window state management
│   │   ├── AppLauncher.tsx       # Start menu / app launcher
│   │   ├── FileExplorer.tsx      # File browser
│   │   ├── Settings.tsx          # Settings panel
│   │   └── SystemTray.tsx        # System tray icons
│   ├── apps/
│   │   ├── TerminalApp.tsx       # Terminal wrapper
│   │   ├── DebuggerApp.tsx       # Debugger wrapper
│   │   └── FileExplorerApp.tsx   # File explorer wrapper
│   ├── store/
│   │   ├── desktopStore.ts       # Desktop state
│   │   └── windowStore.ts        # Window management state
│   ├── hooks/
│   │   ├── useWindowDrag.ts      # Window dragging logic
│   │   └── useWindowResize.ts    # Window resizing logic
│   └── types.ts                  # TypeScript types
```

## Core Features

### 1. Window Management
- Create, minimize, maximize, close windows
- Drag windows around the desktop
- Resize windows
- Focus management (bring to front)
- Window stacking (z-index)

### 2. Taskbar
- App launcher (Start menu)
- Running apps list
- System tray (clock, notifications)
- Quick launch icons

### 3. Applications
- Terminal (embedded)
- Debugger (embedded)
- File Explorer
- Settings

### 4. File Explorer
- Browse VFS directories
- Create/delete files and folders
- File operations (copy, move, rename)
- File preview
- Integration with Terminal

### 5. Settings
- Theme selection (dark/light)
- Desktop background
- Window behavior
- Keyboard shortcuts

## State Management

### Window Store (Zustand)
```typescript
interface WindowState {
  id: string;
  appId: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  zIndex: number;
}

interface WindowStore {
  windows: WindowState[];
  createWindow: (appId: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updatePosition: (id: string, position: Position) => void;
  updateSize: (id: string, size: Size) => void;
}
```

### Desktop Store
```typescript
interface DesktopStore {
  theme: 'dark' | 'light';
  background: string;
  installedApps: App[];
  runningApps: string[];
  launchApp: (appId: string) => void;
  closeApp: (appId: string) => void;
}
```

## App Registry

```typescript
interface App {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType;
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  resizable: boolean;
}

const apps: App[] = [
  {
    id: 'terminal',
    name: 'Terminal',
    icon: '🖥️',
    component: TerminalApp,
    defaultSize: { width: 800, height: 600 },
    minSize: { width: 400, height: 300 },
    resizable: true,
  },
  {
    id: 'debugger',
    name: 'Debugger',
    icon: '🐛',
    component: DebuggerApp,
    defaultSize: { width: 1000, height: 700 },
    minSize: { width: 600, height: 400 },
    resizable: true,
  },
  {
    id: 'files',
    name: 'Files',
    icon: '📁',
    component: FileExplorerApp,
    defaultSize: { width: 700, height: 500 },
    minSize: { width: 400, height: 300 },
    resizable: true,
  },
];
```

## Window Lifecycle

1. **Launch**: User clicks app icon → Create window → Add to windows array
2. **Focus**: User clicks window → Update zIndex → Bring to front
3. **Drag**: User drags title bar → Update position
4. **Resize**: User drags edges → Update size
5. **Minimize**: User clicks minimize → Set isMinimized = true
6. **Maximize**: User clicks maximize → Toggle fullscreen
7. **Close**: User clicks close → Remove from windows array

## Keyboard Shortcuts

- `Alt + Tab`: Switch between windows
- `Alt + F4`: Close focused window
- `Win + D`: Show desktop (minimize all)
- `Win + E`: Open File Explorer
- `Win + T`: Open Terminal
- `Ctrl + Alt + Del`: Open Task Manager

## Responsive Design

- Desktop: Full window management
- Tablet: Simplified window management (no drag)
- Mobile: Single app view (no windows)

## Performance Considerations

- Virtual scrolling for file lists
- Lazy loading of app components
- Window content virtualization when minimized
- Debounced drag/resize updates
- CSS transforms for smooth animations

## Integration Points

### With Terminal App
- Launch Terminal in a window
- Pass commands from File Explorer
- Share VFS instance

### With Debugger App
- Launch Debugger in a window
- Open files from File Explorer
- Share editor state

### With VFS
- File Explorer reads from VFS
- All apps share same file system
- Real-time updates across apps

## Deployment

Desktop App will be deployed as:
- **URL**: https://auraos-desktop.web.app
- **Entry Point**: Main desktop interface
- **Embeds**: Terminal, Debugger, File Explorer

## Future Enhancements

- Multi-desktop support (virtual desktops)
- Window snapping (Windows 11 style)
- Widgets on desktop
- Notification center
- App store
- Collaborative features (shared desktops)
