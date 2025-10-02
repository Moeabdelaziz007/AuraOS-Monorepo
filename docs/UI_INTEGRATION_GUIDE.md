# UI Integration Guide

## Overview

This guide covers the AuraOS user interface, including the Dashboard and AI Chat components. The UI provides a futuristic, cyberpunk-themed interface for interacting with the AI-powered operating system.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Dashboard                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Sidebar    │  │     Main     │  │   AI Chat    │  │
│  │              │  │   Content    │  │              │  │
│  │ • Stats      │  │              │  │ • Messages   │  │
│  │ • Actions    │  │ • Welcome    │  │ • Input      │  │
│  │ • Activity   │  │ • App Grid   │  │ • Actions    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  AIAssistant  │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  MCPGateway   │
                  └───────┬───────┘
                          │
                ┌─────────┴─────────┐
                ▼                   ▼
        ┌──────────────┐    ┌──────────────┐
        │  FileSystem  │    │  Emulator    │
        │  MCP Server  │    │  MCP Server  │
        └──────────────┘    └──────────────┘
```

## Components

### Dashboard

The main OS desktop environment with integrated AI Assistant.

**Location:** `packages/ui/src/components/dashboard/Dashboard.tsx`

**Features:**
- System status monitoring (CPU, Memory, Storage)
- Quick action buttons for common tasks
- Recent activity feed
- App grid with OS applications
- Collapsible AI Assistant panel
- Responsive design

**Usage:**
```typescript
import { Dashboard } from '@auraos/ui/components';

function App() {
  return <Dashboard />;
}
```

### AIChat

Interactive chat interface for the AI Assistant.

**Location:** `packages/ui/src/components/ai/AIChat.tsx`

**Features:**
- Real-time AI conversation
- Message history with timestamps
- Loading states and animations
- Error handling and display
- Quick action buttons
- Auto-scroll to latest message
- Automatic MCP server initialization

**Usage:**
```typescript
import { AIChat } from '@auraos/ui/components';

function MyComponent() {
  const handleError = (error: Error) => {
    console.error('AI Error:', error);
    // Show notification, etc.
  };

  return (
    <div style={{ height: '600px' }}>
      <AIChat 
        className="my-chat"
        onError={handleError}
      />
    </div>
  );
}
```

**Props:**
- `className?: string` - Additional CSS class
- `onError?: (error: Error) => void` - Error callback

## Getting Started

### 1. Setup Environment

```bash
# Set Anthropic API key
export ANTHROPIC_API_KEY="your-api-key-here"

# Or create .env file
echo "ANTHROPIC_API_KEY=your-api-key" > .env
```

### 2. Install Dependencies

```bash
# From repository root
pnpm install

# Build required packages
cd packages/ai && pnpm build
cd packages/core && pnpm build
cd packages/ui
```

### 3. Start Development Server

```bash
cd packages/ui
pnpm dev
```

The UI will be available at http://localhost:5173 (or the port shown in terminal).

### 4. Test the Interface

Open your browser and:

1. **Check AI Status** - Look for "Online" badge in AI Assistant header
2. **Send a Message** - Try: "List all files in the current directory"
3. **Watch Tool Execution** - See the AI use MCP tools automatically
4. **View Results** - Read the AI's natural language response

## AI Chat Flow

### Message Lifecycle

1. **User Input**
   ```
   User types: "Create a file called hello.txt"
   ```

2. **Message Sent**
   ```typescript
   // User message added to chat
   {
     role: 'user',
     content: 'Create a file called hello.txt',
     timestamp: new Date()
   }
   ```

3. **Loading State**
   ```typescript
   // Loading message shown
   {
     role: 'assistant',
     content: 'Thinking...',
     isLoading: true
   }
   ```

4. **AI Processing**
   ```typescript
   // AIAssistant.chat() called
   const response = await assistant.chat(message);
   ```

5. **Tool Execution**
   ```typescript
   // AI requests fs_write tool
   // MCPGateway routes to FileSystem server
   // Tool executes and returns result
   ```

6. **Response Displayed**
   ```typescript
   // Final response shown
   {
     role: 'assistant',
     content: 'I created the file hello.txt successfully.',
     timestamp: new Date()
   }
   ```

### State Management

The AIChat component manages:

```typescript
interface State {
  messages: Message[];           // Chat history
  input: string;                 // Current input
  isLoading: boolean;            // Processing state
  assistant: AIAssistant | null; // AI instance
  isInitialized: boolean;        // Ready state
  error: string | null;          // Error state
}
```

## Customization

### Theming

The UI uses CSS variables for easy theming:

```css
/* packages/ui/src/components/ai/AIChat.css */

:root {
  --primary-color: #00ffff;      /* Cyan */
  --secondary-color: #ff00ff;    /* Magenta */
  --accent-color: #00ff00;       /* Green */
  --bg-primary: #0a0e27;         /* Dark blue */
  --bg-secondary: #1a1f3a;       /* Lighter blue */
  --text-primary: #ffffff;       /* White */
  --text-secondary: #e0e0e0;     /* Light gray */
}
```

### Custom Styling

Override styles with your own CSS:

```typescript
import { AIChat } from '@auraos/ui/components';
import './my-custom-styles.css';

function MyApp() {
  return (
    <AIChat className="my-custom-chat" />
  );
}
```

```css
/* my-custom-styles.css */
.my-custom-chat {
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 255, 255, 0.3);
}

.my-custom-chat .ai-chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Custom System Prompt

Modify the AI's behavior:

```typescript
// In AIChat.tsx, modify the systemPrompt
const systemPrompt = `You are a specialized assistant for [your use case].

You can:
- [Custom capability 1]
- [Custom capability 2]

When helping users:
1. [Custom instruction 1]
2. [Custom instruction 2]
`;
```

## Advanced Usage

### Programmatic Control

Control the AI Chat from parent components:

```typescript
import { AIChat } from '@auraos/ui/components';
import { useRef } from 'react';

function MyApp() {
  const chatRef = useRef<any>(null);

  const sendMessage = (message: string) => {
    // Access chat methods
    chatRef.current?.sendMessage(message);
  };

  return (
    <div>
      <button onClick={() => sendMessage('List files')}>
        Quick Action
      </button>
      <AIChat ref={chatRef} />
    </div>
  );
}
```

### Custom Quick Actions

Add your own quick action buttons:

```typescript
// Modify AIChat.tsx
<div className="quick-actions">
  <button onClick={() => setInput('Your custom command')}>
    🎯 Custom Action
  </button>
  <button onClick={() => setInput('Another command')}>
    ⚡ Another Action
  </button>
</div>
```

### Message Formatting

Customize message display:

```typescript
// In AIChat.tsx, modify message rendering
<div className="message-text">
  {message.isLoading ? (
    <LoadingIndicator />
  ) : (
    <MarkdownRenderer content={message.content} />
  )}
</div>
```

## Integration Examples

### Example 1: Standalone AI Chat

```typescript
import React from 'react';
import { AIChat } from '@auraos/ui/components';

function ChatPage() {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <header style={{ padding: '20px', background: '#1a1f3a' }}>
        <h1>AI Assistant</h1>
      </header>
      <div style={{ flex: 1 }}>
        <AIChat />
      </div>
    </div>
  );
}
```

### Example 2: Split View

```typescript
import React from 'react';
import { AIChat } from '@auraos/ui/components';

function SplitView() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, padding: '20px' }}>
        <h2>Your Content</h2>
        {/* Your app content */}
      </div>
      <div style={{ width: '400px', borderLeft: '1px solid #333' }}>
        <AIChat />
      </div>
    </div>
  );
}
```

### Example 3: Modal Chat

```typescript
import React, { useState } from 'react';
import { AIChat } from '@auraos/ui/components';

function ModalChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open AI Assistant
      </button>
      
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ 
            width: '600px', 
            height: '700px' 
          }}>
            <button onClick={() => setIsOpen(false)}>Close</button>
            <AIChat />
          </div>
        </div>
      )}
    </>
  );
}
```

## Performance Optimization

### Lazy Loading

Load components only when needed:

```typescript
import React, { lazy, Suspense } from 'react';

const AIChat = lazy(() => import('@auraos/ui/components/ai/AIChat'));

function App() {
  return (
    <Suspense fallback={<div>Loading AI Assistant...</div>}>
      <AIChat />
    </Suspense>
  );
}
```

### Memoization

Prevent unnecessary re-renders:

```typescript
import React, { memo } from 'react';

const Message = memo(({ message }) => (
  <div className="message">
    {message.content}
  </div>
));
```

### Virtual Scrolling

For long message lists:

```typescript
import { FixedSizeList } from 'react-window';

function MessageList({ messages }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={messages.length}
      itemSize={100}
    >
      {({ index, style }) => (
        <div style={style}>
          <Message message={messages[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

## Troubleshooting

### Common Issues

#### 1. AI Assistant Not Initializing

**Symptoms:** Status shows "Initializing..." indefinitely

**Solutions:**
```bash
# Check API key
echo $ANTHROPIC_API_KEY

# Rebuild packages
cd packages/ai && pnpm build
cd packages/core && pnpm build

# Check console for errors
# Open browser DevTools > Console
```

#### 2. Messages Not Sending

**Symptoms:** Input disabled, send button grayed out

**Solutions:**
- Wait for "Online" status badge
- Check network connection
- Verify API key is valid
- Check console for initialization errors

#### 3. Slow Response Times

**Symptoms:** Long wait for AI responses

**Solutions:**
- This is normal for AI operations
- Check network latency
- Consider increasing timeout in MCPGateway config
- Monitor API rate limits

#### 4. Styling Issues

**Symptoms:** Components look broken or unstyled

**Solutions:**
```bash
# Ensure CSS is imported
# In AIChat.tsx:
import './AIChat.css';

# Check for CSS conflicts
# Use browser DevTools > Elements > Styles
```

### Debug Mode

Enable detailed logging:

```typescript
// In AIChat.tsx
const gateway = new MCPGateway({
  maxServers: 10,
  requestTimeout: 30000,
  enableLogging: true, // Enable logging
});
```

Check console for:
- `[AI] Using tool: tool_name`
- `[AI] Tool result: {...}`
- `[MCP] Server initialized: server_name`

## Testing

### Manual Testing Checklist

- [ ] AI Assistant initializes successfully
- [ ] Status badge shows "Online"
- [ ] Can send messages
- [ ] Loading indicator appears
- [ ] AI responses display correctly
- [ ] Tool execution works
- [ ] Error handling works
- [ ] Quick actions work
- [ ] Clear chat works
- [ ] Responsive on mobile
- [ ] Keyboard navigation works
- [ ] Accessibility features work

### Automated Testing

```bash
# Run UI tests
cd packages/ui
pnpm test

# Run with coverage
pnpm test --coverage
```

## Deployment

### Production Build

```bash
# Build all packages
pnpm build

# Build UI specifically
cd packages/ui
pnpm build

# Preview production build
pnpm preview
```

### Environment Variables

Set in production:

```bash
# Required
ANTHROPIC_API_KEY=your-production-key

# Optional
VITE_API_TIMEOUT=30000
VITE_MAX_SERVERS=10
```

### Hosting

The UI can be deployed to:

- **Vercel** - Automatic deployment from Git
- **Netlify** - Static site hosting
- **Firebase Hosting** - Google Cloud hosting
- **GitHub Pages** - Free static hosting

Example Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd packages/ui
vercel --prod
```

## Best Practices

### 1. Error Handling

Always handle errors gracefully:

```typescript
<AIChat 
  onError={(error) => {
    console.error('AI Error:', error);
    showNotification('AI Assistant error. Please try again.');
  }}
/>
```

### 2. Loading States

Show clear loading indicators:

```typescript
{isLoading && (
  <div className="loading-indicator">
    <span>AI is thinking...</span>
  </div>
)}
```

### 3. User Feedback

Provide immediate feedback:

```typescript
const handleSend = async () => {
  setStatus('Sending...');
  await sendMessage();
  setStatus('Sent!');
};
```

### 4. Accessibility

Ensure keyboard navigation:

```typescript
<input
  onKeyPress={(e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  }}
  aria-label="Chat message input"
/>
```

### 5. Performance

Optimize re-renders:

```typescript
const MemoizedMessage = React.memo(Message);
const MemoizedChat = React.memo(AIChat);
```

## Next Steps

- Explore [AI Integration Guide](./AI_INTEGRATION_GUIDE.md) for backend details
- Check [MCP Usage Guide](./MCP_USAGE_GUIDE.md) for tool development
- See [Examples](../packages/ui/src/examples/) for more patterns

## Support

For issues or questions:
- GitHub Issues: https://github.com/Moeabdelaziz007/AuraOS-Monorepo/issues
- Documentation: https://github.com/Moeabdelaziz007/AuraOS-Monorepo/tree/main/docs
