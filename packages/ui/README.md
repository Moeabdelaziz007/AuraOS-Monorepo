# @auraos/ui

Desktop Operating System interface for AuraOS - A complete window manager with built-in applications.

## 🚀 Features

- **Window Manager** - Full-featured window system with drag, resize, minimize, maximize
- **Desktop Environment** - Icon-based desktop with double-click to launch
- **Taskbar** - Start menu, running apps, system tray, live clock
- **Built-in Apps** - Dashboard, Terminal, File Manager, AI Chat, Autopilot
- **Authentication** - Firebase auth with Google Sign-In and Guest mode
- **Real-time Updates** - Live system status and notifications
- **Responsive Design** - Works on desktop and tablet devices

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Components](#components)
- [Applications](#applications)
- [Development](#development)
- [Building](#building)
- [Configuration](#configuration)

## 🔧 Installation

```bash
# From monorepo root
pnpm install

# Or install package directly
cd packages/ui
pnpm install
```

## 🏃 Quick Start

### Development Mode

```bash
cd packages/ui
pnpm dev
```

Open browser to [http://localhost:5173](http://localhost:5173)

### Production Build

```bash
pnpm build
pnpm preview
```

### Standalone Build

```bash
./standalone-build.sh
```

## 🏗️ Architecture

### Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **Firebase** - Authentication and database
- **Zustand** - State management (via @auraos/hooks)

### Project Structure

```
packages/ui/
├── src/
│   ├── apps/              # Built-in applications
│   │   ├── DashboardApp.tsx
│   │   ├── TerminalApp.tsx
│   │   ├── FileManagerApp.tsx
│   │   └── AutopilotApp.tsx
│   ├── components/        # Core components
│   │   ├── Desktop.tsx
│   │   ├── Taskbar.tsx
│   │   ├── Window.tsx
│   │   ├── WindowManager.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/          # React contexts
│   ├── pages/             # Route pages
│   │   ├── AuthPage.tsx
│   │   └── DesktopPage.tsx
│   ├── services/          # Business logic
│   ├── types/             # TypeScript types
│   ├── App.tsx            # Main app component
│   ├── DesktopOS.tsx      # Desktop OS component
│   └── main.tsx           # Entry point
├── public/                # Static assets
├── index.html             # HTML template
├── vite.config.ts         # Vite configuration
└── package.json           # Dependencies
```

## 🧩 Components

### Desktop

Main desktop environment with icon grid.

```tsx
import { Desktop } from './components/Desktop';

<Desktop
  apps={availableApps}
  onLaunchApp={(appId) => console.log('Launch:', appId)}
/>
```

**Features:**
- Icon grid layout
- Double-click to launch
- Gradient background
- Responsive sizing

---

### Window

Individual window component with controls.

```tsx
import { Window } from './components/Window';

<Window
  id="window-1"
  title="My App"
  initialPosition={{ x: 100, y: 100 }}
  initialSize={{ width: 800, height: 600 }}
  onClose={() => handleClose()}
  onMinimize={() => handleMinimize()}
  onMaximize={() => handleMaximize()}
>
  <div>Window content</div>
</Window>
```

**Features:**
- Draggable title bar
- Resizable from bottom-right corner
- Minimize/Maximize/Close buttons
- Z-index management
- State persistence

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `id` | string | Unique window ID |
| `title` | string | Window title |
| `initialPosition` | `{x, y}` | Starting position |
| `initialSize` | `{width, height}` | Starting size |
| `onClose` | function | Close handler |
| `onMinimize` | function | Minimize handler |
| `onMaximize` | function | Maximize handler |
| `children` | ReactNode | Window content |

---

### WindowManager

Manages multiple windows and their states.

```tsx
import { WindowManager } from './components/WindowManager';

<WindowManager
  windows={openWindows}
  onWindowClose={(id) => handleClose(id)}
  onWindowMinimize={(id) => handleMinimize(id)}
  onWindowMaximize={(id) => handleMaximize(id)}
/>
```

**Features:**
- Multiple window support
- Window state management
- Z-index ordering
- Focus management

---

### Taskbar

Bottom taskbar with start menu and system tray.

```tsx
import { Taskbar } from './components/Taskbar';

<Taskbar
  apps={availableApps}
  runningApps={openWindows}
  onLaunchApp={(appId) => handleLaunch(appId)}
  onFocusApp={(appId) => handleFocus(appId)}
/>
```

**Features:**
- Start menu with app launcher
- Running apps display
- System tray icons
- Live clock
- Power and settings buttons

---

### ProtectedRoute

Route wrapper for authenticated pages.

```tsx
import { ProtectedRoute } from './components/ProtectedRoute';

<Route
  path="/desktop"
  element={
    <ProtectedRoute>
      <DesktopPage />
    </ProtectedRoute>
  }
/>
```

**Features:**
- Authentication check
- Redirect to login
- Loading state
- Guest mode support

---

## 📱 Applications

### Dashboard App

System status and statistics dashboard.

**Features:**
- CPU, Memory, Disk, Network stats
- Quick stats (Files, Apps, Uptime)
- Recent activity log
- System information

**Usage:**
```tsx
import { DashboardApp } from './apps/DashboardApp';

<Window title="Dashboard">
  <DashboardApp />
</Window>
```

---

### Terminal App

BASIC interpreter with command execution.

**Features:**
- Command history
- BASIC language support
- File system commands
- Syntax highlighting

**Available Commands:**
- `PRINT "text"` - Print text
- `HELLO` - Greeting
- `VERSION` - Show version
- `HELP` - Show help
- `CLEAR` - Clear screen
- `LS` - List files
- `PWD` - Current directory
- `DATE` - Show date/time

**Usage:**
```tsx
import { TerminalApp } from './apps/TerminalApp';

<Window title="Terminal">
  <TerminalApp />
</Window>
```

---

### File Manager App

File browser with sidebar and table view.

**Features:**
- Folder navigation
- File listing
- Sidebar with quick access
- File operations (future)

**Usage:**
```tsx
import { FileManagerApp } from './apps/FileManagerApp';

<Window title="Files">
  <FileManagerApp />
</Window>
```

---

### Autopilot App

AI autopilot with meta-learning and rewards.

**Features:**
- Task execution
- Reward system
- Performance metrics
- Learning loop integration

**Usage:**
```tsx
import { AutopilotApp } from './apps/AutopilotApp';

<Window title="Autopilot">
  <AutopilotApp />
</Window>
```

---

## 💻 Development

### Adding a New App

1. **Create app component:**

```tsx
// src/apps/MyApp.tsx
export function MyApp() {
  return (
    <div className="app-container">
      <h1>My App</h1>
      <p>App content here</p>
    </div>
  );
}
```

2. **Register in app list:**

```tsx
// src/DesktopOS.tsx
const apps = [
  {
    id: 'my-app',
    name: 'My App',
    icon: '🚀',
    component: MyApp,
  },
  // ... other apps
];
```

3. **Add to exports:**

```tsx
// src/apps/index.ts
export { MyApp } from './MyApp';
```

---

### Styling

The UI uses CSS modules and global styles:

```css
/* App-specific styles */
.app-container {
  padding: 20px;
  height: 100%;
  overflow: auto;
}

/* Use CSS variables for theming */
.my-component {
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

**Available CSS Variables:**
- `--bg-primary` - Primary background
- `--bg-secondary` - Secondary background
- `--text-primary` - Primary text color
- `--text-secondary` - Secondary text color
- `--border-color` - Border color
- `--accent-color` - Accent color

---

### State Management

Use Zustand stores from `@auraos/hooks`:

```tsx
import { useWindowStore } from '@auraos/hooks';

function MyComponent() {
  const { windows, openWindow, closeWindow } = useWindowStore();
  
  const handleOpen = () => {
    openWindow({
      id: 'my-window',
      title: 'My Window',
      component: MyApp,
    });
  };
  
  return <button onClick={handleOpen}>Open</button>;
}
```

---

### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

**Example Test:**

```tsx
import { render, screen } from '@testing-library/react';
import { Desktop } from './Desktop';

test('renders desktop icons', () => {
  const apps = [
    { id: 'app1', name: 'App 1', icon: '📱' },
  ];
  
  render(<Desktop apps={apps} onLaunchApp={() => {}} />);
  
  expect(screen.getByText('App 1')).toBeInTheDocument();
});
```

---

## 🏗️ Building

### Development Build

```bash
pnpm build
```

Output: `dist/` directory

### Production Build

```bash
NODE_ENV=production pnpm build
```

### Build Optimization

The build is optimized with:
- Code splitting
- Tree shaking
- Minification
- Asset optimization
- Source maps (dev only)

### Build Size

Typical build sizes:
- JS: ~200KB (gzipped)
- CSS: ~20KB (gzipped)
- Assets: ~50KB

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# API Configuration
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

### Vite Configuration

Customize `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

---

## 🎨 Customization

### Desktop Background

Change in `DesktopOS.css`:

```css
.desktop {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Taskbar Position

Modify `Taskbar.tsx`:

```tsx
<div className="taskbar taskbar-top"> {/* or taskbar-bottom */}
  {/* ... */}
</div>
```

### Window Theme

Customize `Window.tsx`:

```css
.window {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

---

## 🐛 Troubleshooting

### Windows Not Draggable

**Issue:** Windows don't move when dragging

**Solution:**
- Check z-index is set correctly
- Ensure `onMouseDown` is on title bar
- Verify `position: absolute` on window

---

### Apps Not Launching

**Issue:** Double-clicking icons doesn't open apps

**Solution:**
- Check `onLaunchApp` handler is connected
- Verify app ID matches registered apps
- Check console for errors

---

### Taskbar Not Showing

**Issue:** Taskbar is hidden or not visible

**Solution:**
- Check CSS `position: fixed` and `bottom: 0`
- Verify z-index is high enough
- Check for CSS conflicts

---

### Authentication Redirect Loop

**Issue:** Keeps redirecting to login

**Solution:**
```tsx
// Check auth state properly
const { user, loading } = useAuth();

if (loading) return <Loading />;
if (!user) return <Navigate to="/auth" />;
```

---

## 📊 Performance

### Optimization Tips

1. **Lazy Load Apps:**
```tsx
const DashboardApp = lazy(() => import('./apps/DashboardApp'));
```

2. **Memoize Components:**
```tsx
const Window = memo(({ title, children }) => {
  // ...
});
```

3. **Virtualize Long Lists:**
```tsx
import { FixedSizeList } from 'react-window';
```

4. **Debounce Window Resize:**
```tsx
const handleResize = debounce((size) => {
  setWindowSize(size);
}, 100);
```

---

## 🔗 Related Documentation

- [Desktop OS Guide](./DESKTOP_OS_GUIDE.md) - Complete desktop guide
- [Component Checklist](./COMPONENT_CHECKLIST.md) - Component status
- [V0 Generation Guide](./V0_GENERATION_GUIDE.md) - AI generation guide
- [Hooks Package](../hooks/README.md) - State management hooks
- [Common Package](../common/README.md) - Shared components

---

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**Made with ❤️ for AuraOS**
