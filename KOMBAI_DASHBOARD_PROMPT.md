# Kombai Prompt: Quantum Dashboard Widget

Create a React component for `QuantumDashboard` with the following specifications:

**Design Requirements:**
- Quantum Space theme with neon cyan (#00ffff), magenta (#ff00ff), and green (#00ff00)
- Glassmorphism effects with backdrop-filter: blur(20px)
- Dark background gradients (slate-900 to purple-900)
- Smooth animations and hover effects
- Responsive grid layout

**Technical Requirements:**
- TypeScript with proper type definitions
- Tailwind CSS for styling
- React hooks for state management
- Accessibility features (ARIA labels, keyboard navigation)
- Performance optimized with virtualization for large datasets

**Component Features:**
1. **System Metrics Cards**: CPU, Memory, Storage with animated progress bars
2. **Quick Actions Grid**: Launch apps with hover effects
3. **Recent Activity Feed**: Scrollable list with quantum animations
4. **Performance Charts**: Real-time data visualization with neon colors
5. **Notification Center**: Toast notifications with glassmorphism
6. **Weather Widget**: Location-based weather with quantum styling
7. **Time Widget**: Digital clock with neon glow effects
8. **File Shortcuts**: Recent files with thumbnail previews

**Visual Elements:**
- Grid layout with responsive breakpoints
- Glassmorphism cards with subtle borders
- Animated counters for statistics
- Progress bars with neon glow effects
- Hover animations with scale and glow
- Particle effects on card interactions
- Smooth transitions between states

**Data Visualization:**
- CPU usage with animated circular progress
- Memory usage with gradient progress bars
- Storage breakdown with pie charts
- Network activity with real-time graphs
- Temperature indicators with color coding
- Battery status with quantum animations

**File Structure:**
```typescript
interface QuantumDashboardProps {
  systemMetrics?: {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
  };
  recentFiles?: Array<{
    name: string;
    type: string;
    size: string;
    lastModified: Date;
  }>;
  quickActions?: Array<{
    id: string;
    name: string;
    icon: string;
    action: () => void;
  }>;
  notifications?: Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: Date;
  }>;
  className?: string;
}
```

**Interactive Features:**
- Click to launch applications
- Drag and drop to reorganize widgets
- Resize widgets with smooth animations
- Toggle widget visibility
- Customize dashboard layout
- Export dashboard configuration

**Responsive Behavior:**
- Mobile: Single column layout
- Tablet: Two column grid
- Desktop: Three column grid
- Large screens: Four column grid
- Adaptive widget sizing

**Performance Optimizations:**
- Virtual scrolling for large lists
- Debounced data updates
- Memoized expensive calculations
- Lazy loading for heavy components
- Efficient re-rendering strategies

Generate this component with modern React patterns, impressive animations, and a professional dashboard experience that showcases the quantum theme effectively.