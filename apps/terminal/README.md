# AuraOS Terminal Assistant

An AI-powered terminal that understands natural language and executes commands intelligently using the Model Context Protocol (MCP).

## Features

- 🤖 **AI-Powered**: Understands natural language commands
- 💻 **BASIC Interpreter**: Run BASIC programs directly
- 📁 **File Operations**: Full file system management
- 🎨 **Customizable**: Multiple themes and settings
- 📜 **Command History**: Navigate through previous commands
- ⚡ **Auto-completion**: Smart command suggestions
- 🔗 **MCP Integration**: Seamless AI integration

## Installation

```bash
pnpm install
```

## Usage

### As a Component

```typescript
import { TerminalApp } from '@auraos/terminal';

function App() {
  return <TerminalApp />;
}
```

### Standalone

```bash
pnpm dev
```

## Command Types

### 1. Client Commands
Execute instantly without AI processing:
- `clear` - Clear screen
- `help` - Show help
- `history` - Command history
- `theme` - Change theme

### 2. System Commands
Traditional terminal commands:
- `ls` - List files
- `cd` - Change directory
- `cat` - Read file
- `run` - Execute BASIC code

### 3. Natural Language
Ask in plain English:
- "show me all files"
- "create a file called test.txt"
- "run a program that prints hello world"

## Examples

```bash
# List files
$ ls
file1.txt  file2.txt  README.md

# Natural language
$ "show me all text files"
Found 2 text files:
- file1.txt
- file2.txt

# Run BASIC code
$ run PRINT "Hello, World!"
Hello, World!
Exit code: 0

# AI assistance
$ "create a program that counts to 10"
Generated BASIC code:
FOR I=1 TO 10
  PRINT I
NEXT I
```

## Architecture

```
apps/terminal/
├── src/
│   ├── components/
│   │   ├── TerminalApp.tsx       # Main app component
│   │   └── TerminalEmulator.tsx  # Terminal UI
│   ├── commands/
│   │   ├── CommandParser.ts      # Parse commands
│   │   ├── ClientCommands.ts     # Client-side commands
│   │   └── AICommandExecutor.ts  # AI-powered execution
│   ├── hooks/
│   │   ├── useTerminal.ts        # Terminal state
│   │   ├── useCommandHistory.ts  # History management
│   │   └── useAutoComplete.ts    # Auto-completion
│   └── types/
│       └── index.ts              # TypeScript types
├── TERMINAL_GUIDE.md             # User guide
└── README.md                     # This file
```

## API

### TerminalApp

Main terminal component with AI integration.

```typescript
<TerminalApp />
```

### TerminalEmulator

Lower-level terminal emulator.

```typescript
<TerminalEmulator
  config={config}
  onCommand={handleCommand}
  onEmulatorStateChange={handleStateChange}
/>
```

### CommandParser

Parse and analyze commands.

```typescript
import { CommandParser } from '@auraos/terminal';

const parsed = CommandParser.parse('ls -la /home');
const type = CommandParser.getCommandType('show me files');
```

### useMCP Hook

Access AI capabilities.

```typescript
import { useMCP } from '@auraos/hooks';

const mcp = useMCP();

// File operations
await mcp.file.list('/home');

// AI chat
await mcp.ai.chat('What files are here?');

// Run code
await mcp.emulator.run('PRINT "Hello"');
```

## Configuration

### Terminal Config

```typescript
const config: TerminalConfig = {
  rows: 24,
  cols: 80,
  fontSize: 14,
  fontFamily: 'Monaco, monospace',
  theme: {
    name: 'default',
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    // ... more theme options
  },
  cursorBlink: true,
  scrollback: 1000,
};
```

### Themes

Available themes:
- `default` - Classic terminal
- `dark` - Dark mode
- `light` - Light mode
- `matrix` - Matrix style
- `ocean` - Ocean blue
- `sunset` - Warm colors

Change theme:
```bash
$ theme matrix
```

## Development

### Run Tests

```bash
pnpm test
```

### Build

```bash
pnpm build
```

### Type Check

```bash
pnpm typecheck
```

## Documentation

- [Terminal Guide](./TERMINAL_GUIDE.md) - Complete user guide
- [AI Commands](../../docs/AI_COMMANDS.md) - AI features and examples
- [MCP Integration](../../packages/core/src/ai/README.md) - MCP documentation

## Dependencies

- `@auraos/hooks` - React hooks including useMCP
- `@auraos/core` - Core AI and MCP functionality
- `react` - UI framework

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Test with various commands

## License

MIT

## Support

For issues or questions:
1. Type `help` in the terminal
2. Check the [Terminal Guide](./TERMINAL_GUIDE.md)
3. Consult the [AI Commands Guide](../../docs/AI_COMMANDS.md)

---

Built with ❤️ for AuraOS
