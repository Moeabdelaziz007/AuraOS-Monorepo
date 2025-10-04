# 📚 AuraOS API Documentation

Complete API reference for AuraOS packages and services.

## Table of Contents

- [Core Package API](#core-package-api)
- [Hooks Package API](#hooks-package-api)
- [Firebase Package API](#firebase-package-api)
- [UI Components API](#ui-components-api)
- [Types Reference](#types-reference)

## Core Package API

### AI Service

#### `aiService.chat(messages, options?)`

Send messages to AI and get responses.

**Parameters:**
- `messages: Message[]` - Array of chat messages
- `options?: ChatOptions` - Optional configuration

**Returns:** `Promise<string>` - AI response

**Example:**
```typescript
import { aiService } from '@auraos/core';

const response = await aiService.chat([
  { role: 'user', content: 'Hello!' }
]);
```

#### `aiService.generateCode(prompt, language?)`

Generate code from natural language.

**Parameters:**
- `prompt: string` - Natural language description
- `language?: string` - Target language (default: 'BASIC')

**Returns:** `Promise<string>` - Generated code

**Example:**
```typescript
const code = await aiService.generateCode('Print hello world');
```

### MCP Commands

#### `mcpCommands.file.read(path)`

Read file contents.

**Parameters:**
- `path: string` - File path

**Returns:** `Promise<string>` - File contents

**Example:**
```typescript
import { mcpCommands } from '@auraos/core';

const content = await mcpCommands.file.read('/path/to/file.txt');
```

#### `mcpCommands.file.write(path, content)`

Write content to file.

**Parameters:**
- `path: string` - File path
- `content: string` - Content to write

**Returns:** `Promise<void>`

**Example:**
```typescript
await mcpCommands.file.write('/path/to/file.txt', 'Hello World');
```

#### `mcpCommands.file.list(directory)`

List directory contents.

**Parameters:**
- `directory: string` - Directory path

**Returns:** `Promise<FileItem[]>` - Array of files

**Example:**
```typescript
const files = await mcpCommands.file.list('/home/user');
```

#### `mcpCommands.emulator.execute(code)`

Execute BASIC code.

**Parameters:**
- `code: string` - BASIC code to execute

**Returns:** `Promise<string>` - Execution result

**Example:**
```typescript
const result = await mcpCommands.emulator.execute('PRINT "Hello"');
```

## Hooks Package API

### useMCP Hook

React hook for MCP tools.

**Returns:** `MCPHookResult`

**Example:**
```typescript
import { useMCP } from '@auraos/hooks';

function MyComponent() {
  const { file, emulator, loading, error } = useMCP();
  
  const handleRead = async () => {
    const content = await file.read('/path/to/file.txt');
  };
  
  return <div>...</div>;
}
```

**Return Type:**
```typescript
interface MCPHookResult {
  file: {
    read: (path: string) => Promise<string>;
    write: (path: string, content: string) => Promise<void>;
    list: (directory: string) => Promise<FileItem[]>;
  };
  emulator: {
    execute: (code: string) => Promise<string>;
  };
  loading: boolean;
  error: Error | null;
}
```

### useLearningLoop Hook

React hook for learning system.

**Returns:** `LearningLoopHookResult`

**Example:**
```typescript
import { useLearningLoop } from '@auraos/hooks';

function MyComponent() {
  const { trackAppLaunch, trackCommand, insights } = useLearningLoop();
  
  const handleLaunch = () => {
    trackAppLaunch('terminal', 'Terminal');
  };
  
  return <div>...</div>;
}
```

**Return Type:**
```typescript
interface LearningLoopHookResult {
  trackAppLaunch: (appId: string, appName: string) => void;
  trackCommand: (command: string, result: string) => void;
  trackInteraction: (type: string, data: any) => void;
  insights: Insight[];
  loading: boolean;
}
```

## Firebase Package API

### Authentication

#### `auth.signInWithGoogle()`

Sign in with Google.

**Returns:** `Promise<User>`

**Example:**
```typescript
import { auth } from '@auraos/firebase';

const user = await auth.signInWithGoogle();
```

#### `auth.signOut()`

Sign out current user.

**Returns:** `Promise<void>`

**Example:**
```typescript
await auth.signOut();
```

#### `auth.getCurrentUser()`

Get current authenticated user.

**Returns:** `User | null`

**Example:**
```typescript
const user = auth.getCurrentUser();
```

### Firestore

#### `db.collection(name)`

Get collection reference.

**Parameters:**
- `name: string` - Collection name

**Returns:** `CollectionReference`

**Example:**
```typescript
import { db } from '@auraos/firebase';

const usersRef = db.collection('users');
```

#### `db.doc(path)`

Get document reference.

**Parameters:**
- `path: string` - Document path

**Returns:** `DocumentReference`

**Example:**
```typescript
const userDoc = db.doc('users/user123');
```

## UI Components API

### Desktop OS

#### `<DesktopOS />`

Main desktop operating system component.

**Props:** None

**Example:**
```typescript
import { DesktopOS } from '@auraos/ui';

function App() {
  return <DesktopOS />;
}
```

### Window Manager

#### `<WindowManager />`

Manages multiple windows.

**Props:**
```typescript
interface WindowManagerProps {
  windows: WindowState[];
  onWindowClose: (id: string) => void;
  onWindowMinimize: (id: string) => void;
  onWindowMaximize: (id: string) => void;
  onWindowFocus: (id: string) => void;
  onWindowMove: (id: string, x: number, y: number) => void;
  onWindowResize: (id: string, width: number, height: number) => void;
}
```

### Window

#### `<Window />`

Individual window component.

**Props:**
```typescript
interface WindowProps {
  window: WindowState;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
}
```

### Taskbar

#### `<Taskbar />`

Desktop taskbar component.

**Props:**
```typescript
interface TaskbarProps {
  windows: WindowState[];
  apps: DesktopApp[];
  onAppLaunch: (appId: string) => void;
  onWindowFocus: (windowId: string) => void;
  onWindowMinimize: (windowId: string) => void;
}
```

### Desktop

#### `<Desktop />`

Desktop background with icons.

**Props:**
```typescript
interface DesktopProps {
  apps: DesktopApp[];
  onAppLaunch: (appId: string) => void;
}
```

## Types Reference

### WindowState

```typescript
interface WindowState {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isActive: boolean;
  icon?: string;
  props?: any;
}
```

### DesktopApp

```typescript
interface DesktopApp {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType<any>;
  defaultSize?: { width: number; height: number };
  defaultPosition?: { x: number; y: number };
}
```

### Message

```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}
```

### FileItem

```typescript
interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified: Date;
  permissions: string;
  icon: string;
  mimeType?: string;
}
```

### UserProfile

```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences: {
    theme?: 'light' | 'dark';
    language?: string;
  };
  createdAt: Date;
  lastLogin: Date;
}
```

### Insight

```typescript
interface Insight {
  id: string;
  type: 'pattern' | 'suggestion' | 'warning';
  title: string;
  description: string;
  confidence: number;
  timestamp: Date;
  data?: any;
}
```

## Error Handling

All async functions may throw errors. Always use try-catch:

```typescript
try {
  const result = await mcpCommands.file.read('/path/to/file.txt');
} catch (error) {
  console.error('Failed to read file:', error);
}
```

## Rate Limiting

AI services have rate limits:
- Gemini: 60 requests/minute
- z.ai: 100 requests/minute

## Best Practices

1. **Always handle errors**
   ```typescript
   try {
     await operation();
   } catch (error) {
     handleError(error);
   }
   ```

2. **Use TypeScript types**
   ```typescript
   const window: WindowState = { ... };
   ```

3. **Clean up resources**
   ```typescript
   useEffect(() => {
     const subscription = subscribe();
     return () => subscription.unsubscribe();
   }, []);
   ```

4. **Memoize expensive operations**
   ```typescript
   const result = useMemo(() => expensiveOperation(), [deps]);
   ```

## Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Documentation](https://firebase.google.com/docs)

---

**Last Updated:** 2025-10-04
**Version:** 1.0.0
