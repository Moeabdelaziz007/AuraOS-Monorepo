# Kombai Prompt: Quantum Loading Components

Create React components for quantum-themed loading states with the following specifications:

**Design Requirements:**
- Quantum Space theme with neon cyan (#00ffff), magenta (#ff00ff), and green (#00ff00)
- Glassmorphism effects with backdrop-filter: blur(20px)
- Dark background gradients (slate-900 to purple-900)
- Smooth animations and particle effects
- Multiple loading state variations

**Technical Requirements:**
- TypeScript with proper type definitions
- Tailwind CSS for styling
- React hooks for state management
- Accessibility features (ARIA labels, reduced motion support)
- Performance optimized animations

**Components to Create:**

## 1. QuantumSpinner
**File**: `QuantumSpinner.tsx`
- Animated quantum particle ring
- Configurable size and speed
- Neon glow effects
- Smooth rotation animation

## 2. QuantumProgressBar
**File**: `QuantumProgressBar.tsx`
- Animated progress with neon glow
- Percentage display
- Smooth transitions
- Customizable colors

## 3. QuantumSkeleton
**File**: `QuantumSkeleton.tsx`
- Shimmer effect with quantum particles
- Multiple skeleton shapes (text, cards, avatars)
- Responsive sizing
- Smooth loading animations

## 4. QuantumLoader
**File**: `QuantumLoader.tsx`
- Full-page loading overlay
- Central quantum animation
- Loading text with typewriter effect
- Backdrop blur effect

**Visual Elements:**
- Particle systems with neon colors
- Rotating quantum rings
- Pulsing glow effects
- Shimmer animations
- Smooth transitions
- Hover interactions

**File Structure:**
```typescript
interface QuantumSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  speed?: 'slow' | 'normal' | 'fast';
  color?: 'cyan' | 'magenta' | 'green' | 'rainbow';
  className?: string;
}

interface QuantumProgressBarProps {
  progress: number;
  max?: number;
  showPercentage?: boolean;
  animated?: boolean;
  color?: 'cyan' | 'magenta' | 'green' | 'gradient';
  className?: string;
}

interface QuantumSkeletonProps {
  type?: 'text' | 'card' | 'avatar' | 'button';
  lines?: number;
  width?: string;
  height?: string;
  animated?: boolean;
  className?: string;
}

interface QuantumLoaderProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
  overlay?: boolean;
  className?: string;
}
```

**Animation Features:**
- Smooth particle movement
- Rotating quantum rings
- Pulsing glow effects
- Shimmer transitions
- Typewriter text effect
- Fade in/out animations

**Accessibility:**
- Reduced motion support
- Screen reader announcements
- High contrast mode
- Focus management
- ARIA live regions

**Performance:**
- CSS animations over JavaScript
- Optimized particle counts
- Efficient re-rendering
- Memory management
- Smooth 60fps animations

Generate these components with impressive visual effects, smooth animations, and professional loading experiences that enhance the quantum theme.