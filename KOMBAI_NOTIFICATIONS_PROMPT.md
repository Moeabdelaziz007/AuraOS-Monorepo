# Kombai Prompt: Quantum Notification System

Create React components for a quantum-themed notification system with the following specifications:

**Design Requirements:**
- Quantum Space theme with neon cyan (#00ffff), magenta (#ff00ff), and green (#00ff00)
- Glassmorphism effects with backdrop-filter: blur(20px)
- Dark background gradients (slate-900 to purple-900)
- Smooth animations and hover effects
- Toast-style notifications with stack management

**Technical Requirements:**
- TypeScript with proper type definitions
- Tailwind CSS for styling
- React hooks for state management
- Accessibility features (ARIA labels, keyboard navigation)
- Performance optimized with efficient rendering

**Components to Create:**

## 1. QuantumToast
**File**: `QuantumToast.tsx`
- Individual notification component
- Glassmorphism design with neon borders
- Animated entrance/exit
- Action buttons and dismiss functionality

## 2. QuantumNotificationCenter
**File**: `QuantumNotificationCenter.tsx`
- Container for managing multiple notifications
- Stack management with animations
- Priority-based ordering
- Auto-dismiss timers

## 3. QuantumNotificationProvider
**File**: `QuantumNotificationProvider.tsx`
- Context provider for global notification state
- Hook for triggering notifications
- Configuration options
- Event handling

**Visual Elements:**
- Glassmorphism cards with subtle borders
- Neon glow effects on hover
- Smooth slide-in animations
- Particle effects on interaction
- Progress bars for auto-dismiss
- Icon animations with neon colors

**Notification Types:**
- **Success**: Green neon with checkmark icon
- **Error**: Red neon with X icon
- **Warning**: Yellow neon with warning icon
- **Info**: Cyan neon with info icon
- **Custom**: User-defined styling

**File Structure:**
```typescript
interface QuantumToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'custom';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  onDismiss: (id: string) => void;
  className?: string;
}

interface QuantumNotificationCenterProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  maxNotifications?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'custom';
  title: string;
  message: string;
  timestamp: Date;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}
```

**Interactive Features:**
- Click to dismiss
- Action buttons with hover effects
- Drag to dismiss (mobile)
- Keyboard navigation (ESC to dismiss)
- Click outside to dismiss
- Auto-dismiss with progress indicator

**Animation Features:**
- Slide-in from screen edge
- Fade in/out effects
- Scale animations on hover
- Progress bar animation
- Staggered entrance for multiple notifications
- Smooth exit animations

**Configuration Options:**
- Position (top-right, top-left, etc.)
- Maximum notifications visible
- Default duration
- Animation speed
- Theme customization
- Sound effects

**Accessibility:**
- Screen reader announcements
- Keyboard navigation
- High contrast mode
- Focus management
- ARIA live regions
- Reduced motion support

**Performance:**
- Efficient re-rendering
- Optimized animations
- Memory management
- Debounced updates
- Virtual scrolling for large lists

Generate these components with professional notification functionality, impressive visual effects, and smooth user experience that enhances the quantum theme.