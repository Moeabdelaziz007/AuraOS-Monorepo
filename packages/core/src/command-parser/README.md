# 🎯 AuraOS Command Parser

Extensible command parsing and execution engine for AuraOS Terminal.

## Features

✅ **Implemented:**
- Command parsing with quoted string support
- Command registry system
- Built-in command categories (system, file, ai, automation)
- Command aliases
- Context management (current directory, user, environment)
- Command history tracking
- Auto-completion suggestions
- Error handling

## Architecture

```
command-parser/
├── types.ts              # Type definitions
├── CommandParser.ts      # Main parser class
├── commands/
│   ├── system.ts         # System commands (help, clear, echo, etc.)
│   ├── file.ts           # File system commands (ls, cd, pwd, etc.)
│   ├── ai.ts             # AI commands (generate, ask, summarize)
│   └── automation.ts     # Automation commands (workflows, run, schedule)
└── index.ts              # Module exports
```

## Usage

### Basic Usage

```typescript
import { CommandParser } from '@auraos/core/command-parser';

// Create parser instance
const parser = new CommandParser({
  currentDirectory: '/home/aura',
  user: 'aura',
  environment: { LANG: 'en_US.UTF-8' },
});

// Execute command
const result = await parser.execute('ls /home');
console.log(result.message);

// Get command suggestions
const suggestions = parser.getSuggestions('hel');
// Returns: ['help']
```

### Command Categories

#### System Commands
- `help` - Show available commands
- `clear` - Clear terminal screen
- `echo` - Print text
- `date` - Show date/time
- `whoami` - Show current user
- `version` - Show AuraOS version
- `history` - Show command history
- `env` - Show environment variables

#### File Commands
- `ls` - List directory contents
- `cd` - Change directory
- `pwd` - Print working directory
- `mkdir` - Create directory
- `touch` - Create file
- `rm` - Remove file/directory
- `cat` - Display file contents
- `cp` - Copy file/directory
- `mv` - Move file/directory

#### AI Commands
- `generate` - Generate content using AI
- `ask` - Ask AI a question
- `summarize` - Summarize text
- `translate` - Translate text

#### Automation Commands
- `workflows` - List available workflows
- `run` - Run a workflow
- `schedule` - Schedule a command

### Adding Custom Commands

```typescript
import { CommandDefinition } from '@auraos/core/command-parser';

const customCommand: CommandDefinition = {
  name: 'greet',
  description: 'Greet the user',
  usage: 'greet [name]',
  aliases: ['hello', 'hi'],
  category: 'system',
  handler: (args, context) => {
    const name = args[0] || context.user;
    return {
      type: 'success',
      message: `Hello, ${name}!`,
    };
  },
};

// Register command
parser.registerCommands([customCommand]);
```

### Context Management

```typescript
// Get current context
const context = parser.getContext();
console.log(context.currentDirectory); // '/home/aura'

// Update context
parser.updateContext({
  currentDirectory: '/home/aura/projects',
  environment: { ...context.environment, DEBUG: 'true' },
});
```

### Command Suggestions

```typescript
// Get suggestions for partial input
const suggestions = parser.getSuggestions('gen');
// Returns: ['generate']

// Get all commands
const allCommands = parser.getCommands();

// Get commands by category
const systemCommands = parser.getCommandsByCategory('system');
```

## Command Result Types

```typescript
type CommandResultType = 'success' | 'error' | 'info' | 'warning';

interface CommandResult {
  type: CommandResultType;
  message: string | object;
  data?: any;
  timestamp?: number;
}
```

## Integration Points

### Terminal App
The Terminal App uses the Command Parser to execute user commands:

```typescript
import { commandParser } from '@auraos/core/command-parser';

const result = await commandParser.execute(userInput);
terminal.write(result.message);
```

### Virtual File System (Coming Soon)
File commands will integrate with the VFS:

```typescript
// In file.ts
import { VFS } from '@auraos/core/vfs';

handler: async (args, context) => {
  const files = await VFS.listDirectory(context.currentDirectory);
  return { type: 'success', message: files.join('\n') };
}
```

### AI Services (Coming Soon)
AI commands will integrate with content generator:

```typescript
// In ai.ts
import { generateContent } from '@auraos/content-generator';

handler: async (args) => {
  const result = await generateContent({ prompt: args.join(' ') });
  return { type: 'success', message: result.content };
}
```

### Automation (Coming Soon)
Automation commands will integrate with workflow engine:

```typescript
// In automation.ts
import { runWorkflow } from '@auraos/automation';

handler: async (args) => {
  const result = await runWorkflow(args[0]);
  return { type: 'success', message: `Workflow completed: ${result.status}` };
}
```

## Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test -- --coverage
```

## Next Steps

1. **VFS Integration** - Connect file commands to Virtual File System
2. **AI Integration** - Connect AI commands to content generator
3. **Automation Integration** - Connect automation commands to workflow engine
4. **Process Management** - Add process commands (ps, kill, top)
5. **Tab Completion** - Implement intelligent tab completion
6. **Command Piping** - Support command piping (cmd1 | cmd2)
7. **Command Chaining** - Support command chaining (cmd1 && cmd2)

## Contributing

See main repository [CONTRIBUTING.md](../../../../CONTRIBUTING.md)

## License

MIT - See [LICENSE](../../../../LICENSE)

---

**Status:** ✅ Phase 2 Complete (Command Parser)  
**Next:** Phase 3 - VFS Integration
