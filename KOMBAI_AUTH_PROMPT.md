# Kombai Prompt: Enhanced Quantum Authentication Page

Create a React component for `QuantumAuthForm` with the following specifications:

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

**Component Features:**
1. **Animated Background**: Floating quantum particles with neon glow effects
2. **Glassmorphism Card**: Main auth container with backdrop blur and subtle borders
3. **Tabbed Interface**: Smooth transition between Sign In and Sign Up modes
4. **Form Validation**: Real-time validation with neon error indicators
5. **Password Strength**: Visual indicator with quantum-themed progress bar
6. **Social Login**: Google OAuth button with hover animations
7. **Guest Mode**: Quick access option with special styling
8. **Loading States**: Quantum spinner animations during authentication
9. **Responsive Design**: Mobile-first approach with breakpoint adjustments

**Visual Elements:**
- Central logo with quantum particle animation
- Floating form fields with neon focus states
- Gradient buttons with hover glow effects
- Subtle neon borders that intensify on interaction
- Smooth page transitions and micro-interactions
- Particle effects that respond to user interaction

**File Structure:**
```typescript
interface QuantumAuthFormProps {
  onSignIn?: (email: string, password: string) => Promise<void>;
  onSignUp?: (email: string, password: string, displayName: string) => Promise<void>;
  onGoogleSignIn?: () => Promise<void>;
  onGuestSignIn?: () => Promise<void>;
  isLoading?: boolean;
  error?: string;
  className?: string;
}
```

**Styling Guidelines:**
- Use Tailwind classes with custom quantum color variables
- Implement glassmorphism with backdrop-filter
- Add neon glow effects with box-shadow
- Smooth transitions (0.3s ease-out)
- Hover states with scale and glow effects
- Focus states with neon border highlights

**Accessibility:**
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Focus indicators

Generate this component with modern React patterns, clean code structure, and impressive visual effects that match the quantum space theme.