export type CommandResult = {
  type: 'success' | 'error' | 'info';
  message: string;
};

// Built-in commands
const builtInCommands: Record<string, (args: string[]) => Promise<CommandResult> | CommandResult> = {
  help: () => ({
    type: 'info',
    message: `
Available Commands:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

System Commands:
  help              Show this help message
  clear             Clear the terminal screen
  echo <text>       Print text to the terminal
  date              Show current date and time
  whoami            Show current user
  version           Show AuraOS version

File System Commands (Coming Soon):
  ls [path]         List directory contents
  cd <path>         Change directory
  pwd               Print working directory
  mkdir <name>      Create directory
  touch <name>      Create file
  rm <name>         Remove file/directory
  cat <file>        Display file contents

AI Commands (Coming Soon):
  generate <prompt> Generate content using AI
  ask <question>    Ask AI a question
  summarize <text>  Summarize text

Automation Commands (Coming Soon):
  workflows         List available workflows
  run <workflow>    Run a workflow
  schedule <cmd>    Schedule a command

Tips:
  • Use Up/Down arrows to navigate command history
  • Use Ctrl+C to cancel current command
  • Use Ctrl+L to clear screen
  • Use Tab for auto-completion (coming soon)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`,
  }),

  clear: () => ({
    type: 'info',
    message: '\x1b[2J\x1b[H',
  }),

  echo: (args) => ({
    type: 'success',
    message: args.join(' '),
  }),

  date: () => ({
    type: 'info',
    message: new Date().toString(),
  }),

  whoami: () => ({
    type: 'info',
    message: 'aura@os',
  }),

  version: () => ({
    type: 'info',
    message: `
AuraOS Terminal v1.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI-Powered Operating System
Built with ❤️ by Mohamed Abdelaziz

Features:
  ✓ xterm.js Terminal Emulator
  ✓ Command History
  ✓ AI Integration (Coming Soon)
  ✓ Virtual File System (Coming Soon)
  ✓ Automation Support (Coming Soon)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`,
  }),

  // Placeholder commands
  ls: () => ({
    type: 'info',
    message: 'Coming soon: Virtual File System integration',
  }),

  cd: () => ({
    type: 'info',
    message: 'Coming soon: Virtual File System integration',
  }),

  pwd: () => ({
    type: 'info',
    message: '/home/aura',
  }),

  generate: () => ({
    type: 'info',
    message: 'Coming soon: AI Content Generation',
  }),

  ask: () => ({
    type: 'info',
    message: 'Coming soon: AI Question Answering',
  }),

  workflows: () => ({
    type: 'info',
    message: 'Coming soon: Automation Workflows',
  }),
};

export async function executeCommand(input: string): Promise<CommandResult> {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { type: 'info', message: '' };
  }

  // Parse command and arguments
  const parts = trimmed.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  // Check if command exists
  if (command in builtInCommands) {
    try {
      const result = await builtInCommands[command](args);
      return result;
    } catch (error) {
      return {
        type: 'error',
        message: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Command not found
  return {
    type: 'error',
    message: `Command not found: ${command}. Type 'help' for available commands.`,
  };
}
