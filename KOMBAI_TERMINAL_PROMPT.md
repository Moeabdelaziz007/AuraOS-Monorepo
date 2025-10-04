# Kombai Prompt: Quantum Terminal App

Create a React component for `QuantumTerminal` with the following specifications:

**Design Requirements:**
- Quantum Space theme with neon cyan (#00ffff), magenta (#ff00ff), and green (#00ff00)
- Dark terminal background (#0a0a0a) with subtle gradients
- Monospace font (JetBrains Mono) for code display
- Smooth animations and hover effects
- Responsive design for all screen sizes

**Technical Requirements:**
- TypeScript with proper type definitions
- Tailwind CSS for styling
- React hooks for state management
- Accessibility features (ARIA labels, keyboard navigation)
- Performance optimized for large command history

**Component Features:**
1. **Command Line Interface**: Full terminal emulation with cursor
2. **Syntax Highlighting**: Color-coded commands and outputs
3. **Command History**: Navigate with arrow keys, search with Ctrl+R
4. **Tab Completion**: Auto-complete commands and file paths
5. **Multiple Sessions**: Tabbed terminal windows
6. **File System Navigation**: cd, ls, pwd commands
7. **Command Execution**: Run system commands with output display
8. **Customizable Themes**: Multiple color schemes
9. **Font Size Control**: Adjustable text size
10. **Copy/Paste Support**: Full clipboard integration

**Visual Elements:**
- Terminal window with glassmorphism title bar
- Animated cursor with neon glow
- Command prompt with quantum styling
- Output text with syntax highlighting
- Scrollable history with smooth scrolling
- Tab indicators with neon effects
- Resize handles with hover animations

**Command Features:**
- **Basic Commands**: ls, cd, pwd, mkdir, rm, cp, mv
- **File Operations**: cat, echo, grep, find
- **System Info**: whoami, date, uptime, ps
- **Custom Commands**: help, clear, history, theme
- **Error Handling**: Colored error messages
- **Success Indicators**: Green checkmarks for successful commands

**File Structure:**
```typescript
interface QuantumTerminalProps {
  initialDirectory?: string;
  theme?: 'quantum' | 'matrix' | 'cyberpunk' | 'minimal';
  fontSize?: 'small' | 'medium' | 'large';
  maxHistory?: number;
  onCommand?: (command: string, output: string) => void;
  className?: string;
}

interface TerminalCommand {
  id: string;
  command: string;
  output: string;
  timestamp: Date;
  type: 'command' | 'output' | 'error';
}
```

**Interactive Features:**
- Click to focus terminal
- Drag to move terminal window
- Resize terminal with mouse
- Keyboard shortcuts (Ctrl+C, Ctrl+V, etc.)
- Command autocomplete with Tab key
- History navigation with arrow keys
- Search history with Ctrl+R

**Theme Variations:**
- **Quantum**: Neon cyan/magenta/green
- **Matrix**: Green on black
- **Cyberpunk**: Purple/pink accents
- **Minimal**: Clean monochrome

**Performance Features:**
- Virtual scrolling for large outputs
- Debounced command execution
- Efficient history management
- Optimized re-rendering
- Memory management for long sessions

**Accessibility:**
- Screen reader support
- Keyboard navigation
- High contrast mode
- Focus indicators
- ARIA labels for commands

Generate this component with professional terminal functionality, impressive visual effects, and smooth user experience that matches the quantum theme.
