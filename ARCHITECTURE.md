# 🏗️ AuraOS Architecture

## Overview

AuraOS follows a **Clean Architecture** pattern with a monorepo structure, ensuring separation of concerns, testability, and maintainability.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│                    (packages/ui)                         │
│  - React Components                                      │
│  - Desktop OS Interface                                  │
│  - Applications (Dashboard, Terminal, File Manager)     │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│              (packages/hooks, contexts)                  │
│  - React Hooks (useMCP, useLearningLoop)               │
│  - State Management (Contexts)                          │
│  - UI Logic                                             │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    Business Layer                        │
│                   (packages/core)                        │
│  - AI Services (Gemini, z.ai)                          │
│  - MCP Commands                                         │
│  - Business Logic                                       │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                   │
│            (packages/firebase, packages/ai)              │
│  - Firebase Integration                                 │
│  - MCP Servers                                          │
│  - External APIs                                        │
└─────────────────────────────────────────────────────────┘
```

## Package Structure

### 📦 packages/ui
**Presentation Layer** - User interface and desktop environment

```
ui/
├── src/
│   ├── apps/              # Desktop applications
│   │   ├── DashboardApp.tsx
│   │   ├── TerminalApp.tsx
│   │   └── FileManagerApp.tsx
│   ├── components/        # UI components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── Desktop.tsx   # Desktop environment
│   │   ├── Taskbar.tsx   # Taskbar component
│   │   ├── Window.tsx    # Window component
│   │   └── WindowManager.tsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/            # UI-specific hooks
│   ├── pages/            # Application pages
│   ├── types/            # TypeScript types
│   └── DesktopOS.tsx     # Main OS component
└── package.json
```

**Responsibilities:**
- Render desktop environment
- Manage windows and applications
- Handle user interactions
- Display data from business layer

### 📦 packages/core
**Business Layer** - Core business logic and AI services

```
core/
├── src/
│   ├── ai/               # AI services
│   │   ├── gemini.ts
│   │   ├── zai.ts
│   │   └── aiService.ts
│   ├── mcp/              # MCP commands
│   │   ├── fileCommands.ts
│   │   ├── emulatorCommands.ts
│   │   └── mcpCommands.ts
│   ├── services/         # Business services
│   └── types/            # Core types
└── package.json
```

**Responsibilities:**
- AI chat and code generation
- MCP tool orchestration
- Business logic implementation
- Data transformation

### 📦 packages/hooks
**Application Layer** - React hooks for state and logic

```
hooks/
├── src/
│   ├── useMCP.ts         # MCP tools hook
│   ├── useLearningLoop.ts # Learning system hook
│   └── index.ts
└── package.json
```

**Responsibilities:**
- Provide reusable hooks
- Manage application state
- Handle side effects
- Connect UI to business layer

### 📦 packages/firebase
**Infrastructure Layer** - Firebase integration

```
firebase/
├── src/
│   ├── config/           # Firebase configuration
│   ├── auth/             # Authentication
│   ├── firestore/        # Database operations
│   └── index.ts
└── package.json
```

**Responsibilities:**
- User authentication
- Data persistence
- Real-time updates
- Cloud storage

### 📦 packages/ai
**Infrastructure Layer** - MCP infrastructure

```
ai/
├── src/
│   ├── servers/          # MCP servers
│   │   ├── filesystem/
│   │   └── emulator/
│   ├── bridge/           # AI-MCP bridge
│   └── index.ts
└── package.json
```

**Responsibilities:**
- MCP server implementation
- Tool execution
- AI-tool integration

## Data Flow

### 1. User Interaction Flow
```
User Action (UI)
    ↓
Component Event Handler
    ↓
React Hook (useMCP, useLearningLoop)
    ↓
Business Service (aiService, mcpCommands)
    ↓
Infrastructure (Firebase, MCP Servers)
    ↓
External APIs (Gemini, z.ai)
```

### 2. Window Management Flow
```
User Opens App
    ↓
DesktopOS.handleAppLaunch()
    ↓
Create WindowState
    ↓
WindowManager renders Window
    ↓
Window renders App Component
```

### 3. AI Chat Flow
```
User sends message
    ↓
useMCP hook
    ↓
aiService.chat()
    ↓
Gemini/z.ai API
    ↓
Response processing
    ↓
UI update
```

## Design Patterns

### 1. **Dependency Injection**
- Services are injected through hooks
- No direct imports of infrastructure in UI

### 2. **Repository Pattern**
- Firebase operations abstracted behind interfaces
- Easy to swap implementations

### 3. **Observer Pattern**
- React Context for state management
- Event-driven architecture

### 4. **Factory Pattern**
- Window creation
- Component lazy loading

### 5. **Singleton Pattern**
- Firebase instance
- AI service instances

## State Management

### Global State (React Context)
- **AuthContext**: User authentication state
- **ThemeContext**: Theme preferences (planned)
- **SettingsContext**: User settings (planned)

### Local State (React Hooks)
- Component-specific state
- Form state
- UI state (modals, dropdowns)

### Server State (Firebase)
- User profiles
- Learning loop data
- File system data

## Security Architecture

### Authentication Flow
```
User Login
    ↓
Firebase Auth
    ↓
JWT Token
    ↓
Stored in Context
    ↓
Used for API calls
```

### Security Measures
- ✅ No hardcoded API keys
- ✅ Environment variables for secrets
- ✅ Firebase security rules
- ✅ Input validation
- ✅ XSS protection
- ✅ CSRF protection

## Performance Optimization

### Code Splitting
- Lazy loading of applications
- Route-based splitting
- Component-level splitting

### Caching
- React Query for server state
- Local storage for preferences
- Service worker for offline support (planned)

### Bundle Optimization
- Tree shaking
- Minification
- Compression
- Asset optimization

## Testing Strategy

### Unit Tests
- Business logic (packages/core)
- Utility functions
- Hooks (packages/hooks)

### Integration Tests
- Component integration
- API integration
- Firebase integration

### E2E Tests
- User workflows
- Desktop interactions
- Application functionality

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Firebase Hosting                      │
│                  (Static Assets + SPA)                   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Firebase Services                      │
│  - Authentication                                        │
│  - Firestore Database                                   │
│  - Cloud Storage                                        │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    External APIs                         │
│  - Google Gemini                                        │
│  - z.ai                                                 │
└─────────────────────────────────────────────────────────┘
```

## Future Architecture Improvements

### Planned Enhancements
1. **Microservices**: Separate backend services
2. **GraphQL**: Unified API layer
3. **WebSockets**: Real-time communication
4. **Service Workers**: Offline support
5. **Web Workers**: Background processing
6. **IndexedDB**: Local database
7. **PWA**: Progressive Web App features

### Scalability Considerations
- Horizontal scaling with Firebase
- CDN for static assets
- Edge computing for low latency
- Database sharding for large datasets

## Best Practices

### Code Organization
- ✅ One component per file
- ✅ Consistent naming conventions
- ✅ Proper folder structure
- ✅ Separation of concerns

### TypeScript
- ✅ Strict mode enabled
- ✅ Proper type definitions
- ✅ No `any` types (minimize usage)
- ✅ Interface over type when possible

### React
- ✅ Functional components
- ✅ Custom hooks for logic
- ✅ Proper dependency arrays
- ✅ Memoization when needed

### Performance
- ✅ Lazy loading
- ✅ Code splitting
- ✅ Debouncing/throttling
- ✅ Virtual scrolling for large lists

## Conclusion

AuraOS architecture is designed for:
- **Maintainability**: Clear separation of concerns
- **Scalability**: Modular structure
- **Testability**: Isolated components
- **Performance**: Optimized loading and rendering
- **Security**: Best practices implemented

For more details, see:
- [Development Guide](./DEVELOPMENT.md)
- [API Documentation](./docs/API.md)
- [Contributing Guide](./CONTRIBUTING.md)
