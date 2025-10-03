# 🖥️ AuraOS Terminal

AI-Powered Terminal Emulator for AuraOS

## Features

✅ **Implemented:**
- xterm.js terminal emulator with custom theme
- Command history (Up/Down arrows)
- Built-in commands (help, clear, echo, date, whoami, version)
- Keyboard shortcuts (Ctrl+C, Ctrl+L)
- Persistent command history (localStorage)
- Beautiful UI with macOS-style window controls

🚧 **Coming Soon:**
- Virtual File System integration (ls, cd, pwd, mkdir, rm, cat)
- AI commands (generate, ask, summarize)
- Automation workflows (workflows, run, schedule)
- Tab completion
- Multi-tab support
- Command suggestions

## Available Commands

### System Commands
- `help` - Show available commands
- `clear` - Clear terminal screen
- `echo <text>` - Print text
- `date` - Show current date/time
- `whoami` - Show current user
- `version` - Show AuraOS version

### Keyboard Shortcuts
- `Up/Down Arrow` - Navigate command history
- `Ctrl+C` - Cancel current command
- `Ctrl+L` - Clear screen

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

## Architecture

```
apps/terminal/
├── src/
│   ├── components/
│   │   ├── Terminal.tsx      # Main terminal component
│   │   └── Terminal.css      # Terminal styles
│   ├── core/
│   │   └── commandExecutor.ts # Command parser and executor
│   ├── store/
│   │   └── terminalStore.ts  # Zustand state management
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **xterm.js** - Terminal emulator
- **Zustand** - State management
- **Vite** - Build tool

## Integration Points

### @auraos/core (Coming Soon)
- Virtual File System (VFS)
- Process Management
- Command Parser

### @auraos/content-generator (Coming Soon)
- AI content generation
- Natural language processing

### @auraos/automation (Coming Soon)
- Workflow execution
- Task scheduling

## Usage

1. **Start the terminal:**
   ```bash
   pnpm dev
   ```

2. **Open in browser:**
   Visit [https://5174--0199a7f8-043c-7f0e-ac0b-f75d7a7548eb.eu-central-1-01.gitpod.dev](https://5174--0199a7f8-043c-7f0e-ac0b-f75d7a7548eb.eu-central-1-01.gitpod.dev)

3. **Try commands:**
   ```bash
   help
   echo Hello AuraOS!
   date
   version
   ```

## Next Steps

1. **Integrate VFS** - Connect to @auraos/core for file system operations
2. **Add AI Commands** - Integrate with @auraos/content-generator
3. **Implement Automation** - Connect to @auraos/automation
4. **Add Tab Completion** - Implement command and path completion
5. **Multi-tab Support** - Allow multiple terminal sessions

## Contributing

See main repository [CONTRIBUTING.md](../../CONTRIBUTING.md)

## License

MIT - See [LICENSE](../../LICENSE)

---

**Status:** ✅ Phase 1 Complete (xterm.js setup)  
**Next:** Phase 2 - Command Parser Integration  
**Preview:** [Terminal App](https://5174--0199a7f8-043c-7f0e-ac0b-f75d7a7548eb.eu-central-1-01.gitpod.dev)
