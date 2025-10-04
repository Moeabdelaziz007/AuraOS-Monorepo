# Kombai Frontend Completion Brief for AuraOS

## Project Overview
AuraOS is an AI-powered operating system with a Quantum Space theme. We need to complete the frontend with modern, impressive UI components that match the futuristic aesthetic.

## Current State Analysis
- ✅ Quantum Logo component with animated particles
- ✅ Quantum App Icon component with glassmorphism
- ✅ Basic Desktop OS with window management
- ✅ Authentication page
- ✅ Basic app structure (Terminal, Files, Notes, AI Chat, Settings)
- ❌ Need enhanced app interfaces
- ❌ Need improved authentication UI
- ❌ Need better dashboard and pricing pages
- ❌ Need modern loading states and animations

## Design System Requirements

### Color Palette (Quantum Space Theme)
- **Primary**: Neon Cyan (#00ffff)
- **Secondary**: Neon Magenta (#ff00ff) 
- **Accent**: Neon Green (#00ff00)
- **Background**: Dark gradients (slate-900 to purple-900)
- **Surface**: Glassmorphism with backdrop blur
- **Text**: White/light gray with neon highlights

### Typography
- **Primary Font**: Inter (modern, clean)
- **Monospace**: JetBrains Mono (for terminal/code)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Component Style Guidelines
- **Glassmorphism**: backdrop-filter: blur(20px), rgba backgrounds
- **Neon Effects**: box-shadow with neon colors, text-shadow
- **Animations**: Smooth transitions (0.3s ease-out), hover effects
- **Borders**: Subtle rgba borders, neon borders on hover
- **Spacing**: Consistent 8px grid system

## Components to Generate with Kombai

### 1. Enhanced Authentication Page
**File**: `packages/ui/src/components/auth/QuantumAuthForm.tsx`

**Requirements**:
- Glassmorphism design with neon accents
- Animated background with quantum particles
- Modern form inputs with floating labels
- Neon button effects on hover
- Loading states with quantum animations
- Social login buttons with hover effects
- Responsive design for mobile/desktop

**Features**:
- Email/password validation with real-time feedback
- Password strength indicator
- Remember me checkbox
- Forgot password link
- Guest mode option
- Google OAuth integration
- Smooth transitions between login/signup

### 2. Quantum Dashboard Widget
**File**: `packages/ui/src/components/dashboard/QuantumDashboard.tsx`

**Requirements**:
- Grid-based layout with glassmorphism cards
- Animated statistics counters
- Real-time data visualization
- System status indicators with neon colors
- Quick action buttons
- Recent activity feed
- Performance metrics display

**Features**:
- CPU/Memory usage with animated progress bars
- Network status with connection indicators
- Storage usage with visual charts
- Recent files/apps with thumbnails
- Quick launch shortcuts
- Notification center integration

### 3. Enhanced Terminal App
**File**: `packages/ui/src/components/apps/QuantumTerminal.tsx`

**Requirements**:
- Dark terminal theme with neon accents
- Syntax highlighting for commands
- Command history with search
- Tab completion suggestions
- File system navigation
- Command output formatting
- Customizable themes

**Features**:
- Multiple terminal sessions
- Split pane support
- Command autocomplete
- History search (Ctrl+R)
- Copy/paste functionality
- Font size adjustment
- Color scheme customization

### 4. Modern File Manager
**File**: `packages/ui/src/components/apps/QuantumFileManager.tsx`

**Requirements**:
- Dual-pane file browser
- Drag and drop functionality
- File preview with thumbnails
- Search with filters
- Context menus with actions
- Breadcrumb navigation
- Grid/list view toggle

**Features**:
- File operations (copy, move, delete, rename)
- Folder creation and management
- File type icons with neon effects
- Quick access sidebar
- Recent files list
- Storage usage visualization
- File sharing options

### 5. AI Chat Interface
**File**: `packages/ui/src/components/apps/QuantumAIChat.tsx`

**Requirements**:
- Chat bubble design with glassmorphism
- Message typing indicators
- File attachment support
- Voice input/output
- Conversation history
- AI response streaming
- Custom prompt templates

**Features**:
- Multiple chat sessions
- Message search and filtering
- Export conversation history
- Voice commands
- Image generation integration
- Code execution results
- Real-time collaboration

### 6. Settings Panel
**File**: `packages/ui/src/components/settings/QuantumSettings.tsx`

**Requirements**:
- Tabbed interface with categories
- Real-time preview of changes
- Search functionality
- Import/export settings
- Reset to defaults option
- Accessibility options

**Features**:
- Appearance customization
- Sound and notification settings
- Privacy and security options
- Account management
- System preferences
- Keyboard shortcuts
- Language selection

### 7. Loading Components
**File**: `packages/ui/src/components/ui/QuantumLoader.tsx`

**Requirements**:
- Quantum particle animation
- Multiple loading states
- Progress indicators
- Skeleton screens
- Smooth transitions

**Features**:
- Spinner with quantum effects
- Progress bars with neon glow
- Skeleton placeholders
- Loading overlays
- Page transition animations

### 8. Notification System
**File**: `packages/ui/src/components/ui/QuantumNotifications.tsx`

**Requirements**:
- Toast notifications with glassmorphism
- Different notification types
- Auto-dismiss timers
- Action buttons
- Stack management

**Features**:
- Success, error, warning, info types
- Customizable duration
- Click to dismiss
- Notification history
- Sound effects
- Priority levels

## Implementation Instructions

### Step 1: Generate Components
Use Kombai to generate each component with the following prompt structure:

```
Create a React component for [COMPONENT_NAME] with the following specifications:

**Design Requirements:**
- Quantum Space theme with neon cyan (#00ffff), magenta (#ff00ff), and green (#00ff00)
- Glassmorphism effects with backdrop-filter: blur(20px)
- Dark background gradients (slate-900 to purple-900)
- Smooth animations and hover effects
- Responsive design for all screen sizes

**Technical Requirements:**
- TypeScript with proper type definitions
- Tailwind CSS for styling
- React hooks for state management
- Accessibility features (ARIA labels, keyboard navigation)
- Performance optimized (useMemo, useCallback where needed)

**Features:**
[SPECIFIC_FEATURES_FOR_COMPONENT]

**File Structure:**
- Export as default component
- Include proper prop interfaces
- Add JSDoc comments for functions
- Use semantic HTML elements
```

### Step 2: Integration Steps
1. Place generated components in appropriate directories
2. Update imports in existing files
3. Add components to the main app routing
4. Test functionality and styling
5. Add responsive breakpoints
6. Implement error boundaries

### Step 3: Styling Integration
1. Ensure Tailwind classes are properly configured
2. Add custom CSS variables for quantum theme
3. Implement dark mode support
4. Add animation keyframes
5. Test across different browsers

## Quality Assurance Checklist
- [ ] All components follow quantum theme consistently
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Accessibility standards met (WCAG 2.1)
- [ ] Performance optimized (lazy loading, memoization)
- [ ] Error handling implemented
- [ ] Loading states provided
- [ ] Cross-browser compatibility tested
- [ ] TypeScript types properly defined
- [ ] Code is clean and well-documented

## Deployment Requirements
- Build process must complete without errors
- All components must render correctly
- Firebase deployment configuration ready
- Environment variables configured
- Performance metrics acceptable
- SEO optimization implemented

This brief provides comprehensive guidance for completing the AuraOS frontend with modern, impressive UI components that maintain the quantum space aesthetic while providing excellent user experience.