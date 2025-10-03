# 🖥️ AuraOS Desktop Environment

## 🎉 What We Built

A complete desktop operating system interface that unifies all AuraOS components into a beautiful, functional desktop environment!

### ✅ Features Implemented

1. **Window Manager**
   - ✅ Draggable windows
   - ✅ Resizable windows
   - ✅ Minimize/Maximize/Close controls
   - ✅ Z-index management (click to bring to front)
   - ✅ Multiple windows support
   - ✅ Window state management

2. **Desktop Environment**
   - ✅ Desktop icons with double-click to launch
   - ✅ Beautiful gradient background
   - ✅ Icon grid layout

3. **Taskbar**
   - ✅ Start menu with app launcher
   - ✅ Running apps display
   - ✅ Window switching
   - ✅ System tray with icons
   - ✅ Live clock with date/time
   - ✅ Power and settings buttons

4. **Built-in Applications**
   - ✅ **Dashboard** - System status and statistics
   - ✅ **Terminal** - BASIC interpreter with command execution
   - ✅ **File Manager** - File browser with sidebar and table view

---

## 🚀 How to Run

### Development Mode

```bash
cd packages/ui
npm install
npm run dev
```

Then open your browser to the URL shown (usually http://localhost:5173)

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🎮 How to Use

### Desktop Icons
- **Double-click** any icon to launch the app
- Icons available: Dashboard, Terminal, Files

### Windows
- **Drag** the title bar to move windows
- **Drag** the bottom-right corner to resize
- **Click** anywhere on a window to bring it to front
- **Minimize** - Hides window (click taskbar to restore)
- **Maximize** - Full screen (click again to restore)
- **Close** - Closes the window

### Taskbar
- **Start Button** - Click to open app launcher menu
- **Running Apps** - Click to focus/restore minimized windows
- **System Tray** - Network, volume, notifications icons
- **Clock** - Shows current time and date

### Applications

#### 📊 Dashboard
- System status (CPU, Memory, Disk, Network)
- Quick stats (Files, Apps, Uptime)
- Recent activity log
- System information

#### 💻 Terminal
- BASIC interpreter commands
- Available commands:
  - `PRINT "text"` - Print text
  - `HELLO` - Greeting
  - `VERSION` - Show version
  - `HELP` - Show help
  - `CLEAR` - Clear screen
  - `LS` - List files
  - `PWD` - Current directory
  - `DATE` - Show date/time

#### 📁 File Manager
- Browse files and folders
- Sidebar with quick access
- File table with details
- Storage usage indicator
- Double-click folders to navigate
- Single-click to select files

---

## 🏗️ Architecture

### Component Structure

```
packages/ui/src/
├── DesktopOS.tsx           # Main component - orchestrates everything
├── DesktopOS.css           # All styles
├── main.tsx                # Entry point
├── types/
│   └── window.ts           # TypeScript types
├── components/
│   ├── Window.tsx          # Individual window component
│   ├── WindowManager.tsx   # Manages all windows
│   ├── Taskbar.tsx         # Bottom taskbar
│   └── Desktop.tsx         # Desktop with icons
└── apps/
    ├── DashboardApp.tsx    # Dashboard application
    ├── TerminalApp.tsx     # Terminal application
    └── FileManagerApp.tsx  # File manager application
```

### State Management

The `DesktopOS` component manages all state:
- `windows` - Array of all open windows
- `nextZIndex` - Counter for window layering

### Window State

Each window has:
```typescript
{
  id: string;              // Unique identifier
  title: string;           // Window title
  component: React.Component; // App component to render
  position: { x, y };      // Window position
  size: { width, height }; // Window dimensions
  zIndex: number;          // Layering order
  isMinimized: boolean;    // Minimized state
  isMaximized: boolean;    // Maximized state
  isActive: boolean;       // Currently focused
  icon: string;            // Icon emoji
}
```

---

## 🎨 Customization

### Adding New Apps

1. **Create the app component:**

```typescript
// packages/ui/src/apps/MyApp.tsx
import React from 'react';

export const MyApp: React.FC = () => {
  return (
    <div className="app-container my-app">
      <div className="app-header">
        <h2>🎯 My App</h2>
      </div>
      <div className="app-content">
        {/* Your app content here */}
      </div>
    </div>
  );
};
```

2. **Register in DesktopOS.tsx:**

```typescript
import { MyApp } from './apps/MyApp';

const apps: DesktopApp[] = [
  // ... existing apps
  {
    id: 'myapp',
    name: 'My App',
    icon: '🎯',
    component: MyApp,
    defaultSize: { width: 800, height: 600 },
    defaultPosition: { x: 100, y: 100 },
  },
];
```

### Styling

All styles are in `DesktopOS.css`. Key classes:

- `.desktop-os` - Main container
- `.desktop` - Desktop background
- `.desktop-icon` - Desktop icons
- `.window` - Window container
- `.window-titlebar` - Window title bar
- `.taskbar` - Bottom taskbar
- `.app-container` - App wrapper

### Changing Colors

Edit the gradient in `DesktopOS.css`:

```css
.desktop-os {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

---

## 🔌 Integration with Existing Components

### AIOS Components (packages/common)

The existing AIOS pages can be wrapped as apps:

```typescript
import Dashboard from '../../common/src/src/pages/Dashboard';

const apps: DesktopApp[] = [
  {
    id: 'aios-dashboard',
    name: 'AIOS Dashboard',
    icon: '📊',
    component: Dashboard,
    defaultSize: { width: 1000, height: 700 },
  },
];
```

### MCP Tools Integration

Connect file manager to MCP filesystem tools:

```typescript
import { MCPClient } from '@auraos/ai/mcp/client';

const client = new MCPClient(gateway);

// In FileManagerApp
const loadFiles = async () => {
  const result = await client.executeTool('fs_list', {
    path: currentPath,
    recursive: false,
  });
  setFiles(result.data.files);
};
```

---

## 🐛 Troubleshooting

### Windows not dragging?
- Make sure you're clicking the title bar, not the controls
- Check that `isDragging` state is working

### Windows behind taskbar?
- Taskbar has `z-index: 10000`
- Windows start at `z-index: 1000` and increment

### Apps not launching?
- Check console for errors
- Verify app is registered in `apps` array
- Ensure component is imported correctly

### Styles not applying?
- Make sure `DesktopOS.css` is imported in `main.tsx`
- Check for CSS class name typos
- Inspect element to see which styles are applied

---

## 📚 Next Steps

### Immediate Enhancements

1. **Add More Apps**
   - Settings app
   - Text editor
   - Calculator
   - Calendar

2. **Improve Window Manager**
   - Window snapping (drag to edges)
   - Keyboard shortcuts (Alt+Tab, etc.)
   - Window animations
   - Multi-desktop support

3. **Enhance Taskbar**
   - Right-click context menus
   - Pinned apps
   - Notification center
   - Quick settings panel

4. **File Manager Improvements**
   - Connect to real MCP filesystem
   - File operations (copy, move, delete)
   - Drag and drop
   - File preview

5. **Terminal Enhancements**
   - Connect to real BASIC interpreter
   - Command history (up/down arrows)
   - Tab completion
   - Multiple terminal tabs

### Advanced Features

1. **Themes**
   - Dark mode
   - Custom color schemes
   - Wallpaper support

2. **Widgets**
   - Desktop widgets
   - System monitors
   - Weather widget

3. **Notifications**
   - Toast notifications
   - Notification center
   - App badges

4. **Accessibility**
   - Keyboard navigation
   - Screen reader support
   - High contrast mode

---

## 🎯 Performance Tips

1. **Lazy Loading**
   - Load app components only when launched
   - Use React.lazy() for code splitting

2. **Memoization**
   - Use React.memo() for window components
   - useMemo() for expensive calculations

3. **Virtual Scrolling**
   - For file lists with many items
   - For terminal output

4. **Debouncing**
   - Window resize events
   - Search inputs

---

## 🤝 Contributing

To add features to the desktop environment:

1. Create feature branch
2. Add your component/feature
3. Update this documentation
4. Test thoroughly
5. Submit pull request

---

## 📄 License

MIT License - See LICENSE file

---

**Built with ❤️ for AuraOS**

The desktop environment that brings vintage computing and modern AI together!
