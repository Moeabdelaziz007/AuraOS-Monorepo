# AI Commands Guide

## Overview

AuraOS integrates AI capabilities throughout the system using the Model Context Protocol (MCP). This guide covers AI-powered features and commands available across different applications.

## Terminal Assistant

The AuraOS Terminal is an AI-powered command-line interface that understands natural language and executes commands intelligently.

### Natural Language Commands

#### File Operations

```bash
# List files
"show me all files"
"what files are in this directory?"
"list all text files"
"find files modified today"

# Read files
"show me the contents of README.md"
"what's in the config file?"
"read notes.txt"

# Create files
"create a file called test.txt"
"make a new file named notes.md"
"create hello.txt with content 'Hello World'"

# Delete files
"delete the old-file.txt"
"remove all temporary files"
```

#### Navigation

```bash
# Change directory
"go to the documents folder"
"navigate to /home/user"
"take me to the parent directory"

# Show location
"where am I?"
"what folder am I in?"
"show current directory"
```

#### Code Execution

```bash
# Run BASIC code
"run a program that prints hello world"
"execute this code: PRINT 'Test'"
"run FOR I=1 TO 10: PRINT I: NEXT I"

# Generate code
"create a program that counts to 10"
"generate code to calculate fibonacci"
"write a program that asks for user input"

# Explain code
"explain this code: FOR I=1 TO 10: PRINT I: NEXT I"
"what does this program do?"
"help me understand this BASIC code"
```

### Traditional Commands

The terminal also supports traditional Unix-style commands:

```bash
# File operations
ls                 # List directory contents
cd [path]          # Change directory
pwd                # Print working directory
cat [file]         # Display file contents
mkdir [dir]        # Create directory
rm [file]          # Remove file
cp [src] [dest]    # Copy file
mv [src] [dest]    # Move/rename file

# BASIC programming
run [code]         # Execute BASIC code
load [file]        # Load BASIC program
save [file]        # Save BASIC program
list               # Show current program

# Terminal control
clear              # Clear screen
help               # Show help
history            # Show command history
theme [name]       # Change theme
```

### Examples

#### Example 1: File Management with Natural Language

```bash
$ "show me all files"
Found 5 files:
- README.md
- package.json
- index.ts
- config.json
- notes.txt

$ "what's in the README file?"
# AuraOS Project
Welcome to AuraOS...

$ "create a backup of config.json"
Created backup: config.json.backup
```

#### Example 2: BASIC Programming

```bash
$ "create a program that prints numbers 1 to 10"
Generated BASIC code:
FOR I=1 TO 10
  PRINT I
NEXT I

$ run FOR I=1 TO 10: PRINT I: NEXT I
1
2
3
4
5
6
7
8
9
10
Exit code: 0
```

#### Example 3: Mixed Commands

```bash
$ pwd
/home/user

$ "go to documents"
Changed directory to: /home/user/documents

$ ls
file1.txt  file2.txt  notes.md

$ "show me the contents of notes.md"
# My Notes
- Task 1
- Task 2
```

## MCP Integration

### Using the useMCP Hook

React components can use the `useMCP` hook to access AI capabilities:

```typescript
import { useMCP } from '@auraos/hooks';

function MyComponent() {
  const mcp = useMCP();

  // File operations
  const listFiles = async () => {
    const result = await mcp.file.list('/home/user');
    logger.info(result);
  };

  // AI chat
  const askAI = async () => {
    const response = await mcp.ai.chat('What files are here?');
    logger.info(response);
  };

  // Code execution
  const runCode = async () => {
    const result = await mcp.emulator.run('PRINT "Hello"');
    logger.info(result.output);
  };

  return (
    <div>
      {mcp.loading && <p>Loading...</p>}
      {mcp.error && <p>Error: {mcp.error}</p>}
      {/* Your UI */}
    </div>
  );
}
```

### MCP API Reference

#### File Operations

```typescript
// Read file
const content = await mcp.file.read('/path/to/file.txt');

// Write file
await mcp.file.write('/path/to/file.txt', 'content');

// List directory
const files = await mcp.file.list('/path/to/dir');

// Search files
const results = await mcp.file.search('query', '/path');

// Delete file
await mcp.file.delete('/path/to/file.txt');
```

#### Emulator Operations

```typescript
// Run BASIC code
const result = await mcp.emulator.run('PRINT "Hello"');
logger.info(result.output);

// Generate code from natural language
const code = await mcp.emulator.generate('count to 10');
logger.info(code);

// Execute natural language command
const result = await mcp.emulator.execute('print hello world');
logger.info(result.output);

// Get emulator state
const state = await mcp.emulator.getState();
```

#### AI Operations

```typescript
// Chat with AI
const response = await mcp.ai.chat('What files are here?', {
  currentDirectory: '/home/user'
});

// Analyze code
const analysis = await mcp.ai.analyzeCode(code, 'BASIC');

// Fix code
const fixed = await mcp.ai.fixCode(code, errorMessage);

// Explain code
const explanation = await mcp.ai.explainCode(code);

// Suggest improvements
const suggestions = await mcp.ai.suggestImprovements(code);
```

## AI-Powered Features

### 1. Natural Language Understanding

The AI can understand various phrasings of the same command:

```bash
# All of these do the same thing:
"show me all files"
"list files"
"what files are here?"
"display directory contents"
```

### 2. Context Awareness

The AI maintains context across commands:

```bash
$ "go to documents"
Changed directory to: /home/user/documents

$ "show me files here"
# AI knows "here" refers to /home/user/documents
```

### 3. Intent Recognition

The AI recognizes intent even with incomplete information:

```bash
$ "create a file"
# AI will ask: "What should I name the file?"

$ "delete old files"
# AI will ask: "Which files should I delete?"
```

### 4. Code Generation

Generate BASIC code from descriptions:

```bash
$ "create a program that calculates factorial"
Generated code:
INPUT "Enter a number: ", N
LET F = 1
FOR I = 1 TO N
  LET F = F * I
NEXT I
PRINT "Factorial is: ", F
```

### 5. Code Explanation

Get explanations for code:

```bash
$ "explain: FOR I=1 TO 10: PRINT I: NEXT I"
This BASIC code creates a loop that:
1. Starts with I=1
2. Continues while I is less than or equal to 10
3. Prints the current value of I
4. Increments I by 1
5. Repeats until I exceeds 10
```

## Best Practices

### 1. Be Specific

```bash
# Less specific
"show files"

# More specific
"show all text files in the documents folder"
```

### 2. Use Natural Language for Complex Tasks

```bash
# Instead of multiple commands:
mkdir backup
cp *.txt backup/
ls backup/

# Use natural language:
"create a backup folder and copy all text files there"
```

### 3. Ask for Help

```bash
"how do I list files?"
"what's the command to change directory?"
"help me create a BASIC program"
```

### 4. Combine Traditional and Natural Language

```bash
$ cd /home/user
$ "show me all files modified today"
$ cat important.txt
$ "create a backup of this file"
```

## Troubleshooting

### AI Not Responding

```bash
# Check MCP status
$ "is the AI working?"

# Try a simple command
$ help

# Restart if needed
$ exit
# Then reopen terminal
```

### Command Not Understood

```bash
# Be more specific
$ "show files"  # Vague
$ "list all files in current directory"  # Better

# Use traditional command as fallback
$ ls
```

### Code Execution Errors

```bash
# Get AI help
$ "this code has an error: [your code]"

# Ask for explanation
$ "explain why this doesn't work: [your code]"

# Request fix
$ "fix this code: [your code]"
```

## Advanced Usage

### Scripting with Natural Language

```bash
# Complex multi-step operations
"create a project structure with folders for src, tests, and docs, then create a README file in each"

# Conditional operations
"if there are any log files, move them to the logs folder"

# Batch operations
"for each text file, create a backup with .bak extension"
```

### Custom Workflows

```bash
# Define reusable workflows
"remember this as 'daily backup': copy all modified files to backup folder"

# Execute workflows
"run daily backup"
```

### Integration with Other Apps

The MCP integration allows seamless interaction between apps:

```typescript
// In your app
const mcp = useMCP();

// Execute terminal command from your app
const result = await mcp.execute('list files in /home/user');

// Use AI for analysis
const analysis = await mcp.ai.chat('Analyze these files', {
  files: fileList
});
```

## Examples by Use Case

### Development Workflow

```bash
# Navigate to project
$ cd /projects/my-app

# Check files
$ "show me all TypeScript files"

# Run tests
$ "execute the test suite"

# Check for errors
$ "are there any syntax errors in the code?"

# Generate documentation
$ "create a README for this project"
```

### File Management

```bash
# Organize files
$ "move all images to the pictures folder"

# Clean up
$ "delete all files older than 30 days"

# Search
$ "find all files containing 'TODO'"

# Backup
$ "create a backup of all important files"
```

### Learning BASIC

```bash
# Get started
$ "teach me BASIC programming"

# Practice
$ "give me a simple BASIC exercise"

# Get help
$ "explain BASIC loops"

# Debug
$ "why doesn't this code work: [your code]"
```

## API Documentation

For detailed API documentation, see:
- [Terminal Guide](../apps/terminal/TERMINAL_GUIDE.md)
- [MCP Integration](../packages/core/src/ai/README.md)
- [useMCP Hook](../packages/hooks/src/useMCP.ts)

## Support

For issues or questions:
1. Type `help` in the terminal
2. Check the Terminal Guide
3. Ask the AI: "how do I [task]?"
4. Consult the documentation

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-03  
**Powered by**: Model Context Protocol (MCP)
