# @auraos/ui

User interface components for AuraOS with integrated AI Assistant.

## Features

- 🎨 **Futuristic Dashboard** - Cyberpunk-themed OS interface
- 🤖 **AI Chat Interface** - Natural language control of OS
- 📊 **System Monitoring** - Real-time stats display
- 🚀 **Quick Actions** - Fast access to common tasks
- 📱 **Responsive Design** - Works on all screen sizes
- ✨ **Smooth Animations** - Polished user experience

## Components

### Dashboard

Main OS desktop environment with integrated AI Assistant.

**Features:**
- System status monitoring (CPU, Memory, Storage)
- Quick action buttons
- Recent activity feed
- App grid with OS applications
- Collapsible AI Assistant panel

### AIChat

Interactive chat interface for the AI Assistant.

**Features:**
- Real-time AI conversation
- Message history
- Loading states
- Error handling
- Quick action buttons
- Auto-scroll to latest message

## Development

### Prerequisites

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY="your-api-key-here"
```

### Running the UI

```bash
# Install dependencies
pnpm install

# Start development server
cd packages/ui
pnpm dev
```

The UI will be available at the URL shown in the terminal (typically http://localhost:5173).

### Building

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Usage

### Basic Setup

```typescript
import { Dashboard } from '@auraos/ui/components';

function App() {
  return <Dashboard />;
}
```

### Using AIChat Standalone

```typescript
import { AIChat } from '@auraos/ui/components';

function MyApp() {
  const handleError = (error: Error) => {
    console.error('AI Error:', error);
  };

  return (
    <div style={{ height: '600px' }}>
      <AIChat onError={handleError} />
    </div>
  );
}
```

## Testing the AI Integration

### 1. Start the Development Server

```bash
cd packages/ui
pnpm dev
```

### 2. Open in Browser

Navigate to the URL shown (e.g., http://localhost:5173)

### 3. Test AI Commands

Try these commands in the AI chat:

**File Operations:**
```
Create a file called hello.txt with "Hello, AuraOS!"
List all files in the current directory
Read the contents of hello.txt
```

**Emulator Control:**
```
Create a new CPU emulator
Start the emulator
Show me the emulator state
```

**Tool Discovery:**
```
What tools do you have available?
Show me all filesystem tools
```

### 4. Expected Behavior

- ✅ AI Assistant initializes with "Online" status
- ✅ Messages appear in chat with proper formatting
- ✅ Loading indicator shows while AI is thinking
- ✅ Tool execution happens automatically
- ✅ Results are displayed in natural language
- ✅ Errors are handled gracefully

## Troubleshooting

### AI Assistant Shows "Error" Status

**Problem:** Missing or invalid API key

**Solution:**
```bash
export ANTHROPIC_API_KEY="your-valid-key"
```

### "Initializing..." Never Completes

**Problem:** MCP servers failed to initialize

**Solution:** Check console for errors. Ensure `@auraos/ai` and `@auraos/core` packages are built:
```bash
cd packages/ai && pnpm build
cd packages/core && pnpm build
```

### Messages Not Sending

**Problem:** AI Assistant not initialized

**Solution:** Wait for "Online" status badge before sending messages

### Slow Response Times

**Problem:** Network latency or complex operations

**Solution:** This is normal for AI operations. The loading indicator will show progress.

## Component Structure

```
packages/ui/src/
├── components/
│   ├── ai/
│   │   ├── AIChat.tsx          # AI chat component
│   │   └── AIChat.css          # Chat styles
│   ├── dashboard/
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   └── Dashboard.css       # Dashboard styles
│   └── index.ts                # Component exports
├── App.tsx                     # Main app
├── App.css                     # App styles
└── main.tsx                    # Entry point
```

## Styling

The UI uses a futuristic cyberpunk theme with:

- **Primary Color:** Cyan (#00ffff)
- **Secondary Color:** Magenta (#ff00ff)
- **Accent Color:** Green (#00ff00)
- **Background:** Dark blue gradients
- **Effects:** Glassmorphism, glows, shadows

### Customizing Colors

Edit the CSS files to change colors:

```css
/* packages/ui/src/components/ai/AIChat.css */
.ai-chat {
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
  border: 1px solid rgba(0, 255, 255, 0.2); /* Change cyan */
}
```

## Performance

### Optimization Tips

1. **Lazy Loading:** Components are loaded on demand
2. **Memoization:** Use React.memo for expensive components
3. **Virtual Scrolling:** For long message lists
4. **Debouncing:** Input is debounced to reduce API calls

### Monitoring

Check the browser console for:
- AI Assistant initialization logs
- Tool execution logs
- Performance metrics

## Accessibility

The UI includes:

- ✅ Keyboard navigation
- ✅ ARIA labels
- ✅ Focus indicators
- ✅ Screen reader support
- ✅ High contrast mode compatible

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ⚠️ IE11 (not supported)

## Dependencies

- `react` - UI framework
- `@auraos/ai` - AI Assistant integration
- `@auraos/core` - MCP servers

## Scripts

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm preview      # Preview production build

# Quality
pnpm lint         # Lint code
pnpm lint:fix     # Fix lint issues
pnpm typecheck    # Check TypeScript types

# Testing
pnpm test         # Run tests
```

## Examples

See the [examples](../../docs/examples/) directory for:
- Custom dashboard layouts
- AI chat integrations
- Theme customization
- Component composition

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MIT

## Support

- GitHub Issues: https://github.com/Moeabdelaziz007/AuraOS-Monorepo/issues
- Documentation: https://github.com/Moeabdelaziz007/AuraOS-Monorepo/tree/main/docs
