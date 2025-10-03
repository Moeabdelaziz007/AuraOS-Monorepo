# AuraOS Terminal Assistant Guide

## Overview

The AuraOS Terminal Assistant is an AI-powered terminal that understands natural language and executes commands intelligently using the Model Context Protocol (MCP). It combines traditional terminal functionality with AI capabilities to provide an intuitive command-line experience.

## Features

- **Natural Language Processing**: Type commands in plain English (or Arabic)
- **AI-Powered Execution**: Intelligent command interpretation and execution
- **BASIC Programming**: Built-in BASIC interpreter for running programs
- **File System Operations**: Full file management capabilities
- **Command History**: Navigate through previous commands
- **Auto-completion**: Smart command suggestions
- **Multiple Themes**: Customizable terminal appearance

## Getting Started

### Basic Usage

Simply type your command and press Enter. The terminal will:
1. Parse your input
2. Determine if it's a client command, system command, or natural language
3. Execute the appropriate action
4. Display the result

### Command Types

#### 1. Client-Side Commands
These execute instantly without AI processing:

```bash
clear              # Clear the terminal screen
help               # Show help information
help [topic]       # Get help on a specific topic
history            # Show command history
history -n 10      # Show last 10 commands
about              # About AuraOS Terminal
version            # Show version information
theme [name]       # Change terminal theme
settings           # Show current settings
```

#### 2. System Commands
Traditional terminal commands:

```bash
ls                 # List directory contents
ls /path/to/dir    # List specific directory
cd [path]          # Change directory
pwd                # Print working directory
cat [file]         # Display file contents
echo [text]        # Print text to terminal
mkdir [dir]        # Create directory
rm [file]          # Remove file
cp [src] [dest]    # Copy file
mv [src] [dest]    # Move/rename file
```

#### 3. Natural Language Commands
Ask questions or give commands in plain language:

```bash
# File operations
"show me all files"
"what's in the current directory?"
"list all text files"
"create a file called notes.txt"
"delete the old-file.txt"

# Navigation
"go to the documents folder"
"what folder am I in?"
"show me what's in /home"

# Code execution
"run a program that prints hello world"
"execute this BASIC code: PRINT 'Test'"
"generate a program that counts to 10"

# Information
"what files are here?"
"explain what this code does"
"how do I create a file?"
```

## BASIC Programming

### Running BASIC Code

Execute BASIC code directly:

```bash
run PRINT "Hello, World!"
run FOR I=1 TO 10: PRINT I: NEXT I
run LET X=5: PRINT X*X
```

### BASIC Commands

```bash
run [code]         # Execute BASIC code directly
load [file]        # Load a BASIC program from file
save [file]        # Save current program to file
list               # Show current program
```

### Example BASIC Programs

**Hello World:**
```basic
run PRINT "Hello, World!"
```

**Count to 10:**
```basic
run FOR I=1 TO 10: PRINT I: NEXT I
```

**Calculate Factorial:**
```basic
run LET N=5: LET F=1: FOR I=1 TO N: LET F=F*I: NEXT I: PRINT F
```

## File Operations

### Listing Files

```bash
# Traditional
ls
ls /home/user
ls -la

# Natural language
"show me all files"
"list files in the documents folder"
"what files are in /home?"
```

### Reading Files

```bash
# Traditional
cat README.md
cat /path/to/file.txt

# Natural language
"show me the contents of README.md"
"what's in the config file?"
"read the notes.txt file"
```

### Creating Files

```bash
# Natural language
"create a file called test.txt"
"make a new file named notes.md"
"create hello.txt with content 'Hello World'"
```

### Deleting Files

```bash
# Traditional
rm old-file.txt

# Natural language
"delete the old-file.txt"
"remove test.txt"
```

## AI-Powered Features

### Command Analysis

The AI analyzes your natural language input to understand intent:

```bash
"show me all JavaScript files"
→ AI interprets: List files with .js extension

"what's the biggest file here?"
→ AI interprets: List files sorted by size

"find files modified today"
→ AI interprets: Search files by modification date
```

### Code Generation

Ask the AI to generate BASIC code:

```bash
"create a program that prints numbers 1 to 100"
"generate code to calculate fibonacci sequence"
"write a program that asks for user input"
```

### Code Explanation

Get explanations for code:

```bash
"explain this code: FOR I=1 TO 10: PRINT I: NEXT I"
"what does this program do?"
"help me understand this BASIC code"
```

## Keyboard Shortcuts

- **Enter**: Execute command
- **↑ / ↓**: Navigate command history
- **Tab**: Auto-complete command
- **Ctrl+L**: Clear screen
- **Ctrl+C**: Cancel current command
- **Ctrl+W**: Close terminal

## Themes

Change the terminal appearance:

```bash
theme              # List available themes
theme dark         # Switch to dark theme
theme matrix       # Switch to matrix theme
theme ocean        # Switch to ocean theme
```

### Available Themes

- **default**: Classic terminal theme
- **dark**: Dark mode theme
- **light**: Light mode theme
- **matrix**: Matrix-style green on black
- **ocean**: Ocean blue theme
- **sunset**: Warm sunset colors

## Tips & Tricks

### 1. Use Natural Language

Don't remember the exact command? Just ask:
```bash
"how do I list files?"
"what's the command to change directory?"
```

### 2. Combine Commands

The AI can handle complex requests:
```bash
"list all text files and show me the first one"
"create a backup folder and copy all files there"
```

### 3. Get Help Anytime

```bash
help               # General help
help ai            # AI features help
help basic         # BASIC programming help
help files         # File operations help
```

### 4. Use Command History

Press ↑ to recall previous commands and modify them.

### 5. Tab Completion

Start typing a command and press Tab for suggestions.

## Troubleshooting

### AI Not Responding

If the AI assistant isn't responding:
1. Check the footer status: "MCP: Connected"
2. Try a simple command first: `help`
3. Refresh the terminal if needed

### Command Not Found

If a command isn't recognized:
1. Try using natural language instead
2. Check spelling with `help`
3. Use `history` to see if you've used it before

### File Not Found

If a file operation fails:
1. Check the current directory with `pwd`
2. List files with `ls` to verify the file exists
3. Use absolute paths: `/home/user/file.txt`

## Examples

### Example Session 1: File Management

```bash
$ pwd
/home/user

$ ls
documents/  downloads/  pictures/

$ cd documents
Changed directory to: /home/user/documents

$ "show me all text files"
Found 3 text files:
- notes.txt
- todo.txt
- readme.txt

$ cat notes.txt
[File contents displayed]
```

### Example 2: BASIC Programming

```bash
$ "create a program that prints hello 5 times"
Generated BASIC code:
FOR I=1 TO 5
  PRINT "Hello"
NEXT I

$ run FOR I=1 TO 5: PRINT "Hello": NEXT I
Hello
Hello
Hello
Hello
Hello

Exit code: 0
```

### Example 3: AI Assistance

```bash
$ "what files were modified today?"
Searching for recently modified files...
Found 2 files modified today:
- notes.txt (modified 2 hours ago)
- config.json (modified 30 minutes ago)

$ "explain what this code does: LET X=10: PRINT X*2"
This BASIC code:
1. Creates a variable X and sets it to 10
2. Multiplies X by 2 (resulting in 20)
3. Prints the result to the screen
```

## Advanced Usage

### Scripting

You can chain commands using natural language:

```bash
"create a folder called backup, then copy all text files there"
"list all files, find the largest one, and show its contents"
```

### Custom Workflows

The AI learns from your patterns:

```bash
# After using similar commands, the AI will suggest:
"do the usual backup"  # AI remembers your backup routine
"run my test script"   # AI knows your common scripts
```

## API Integration

The terminal uses the MCP (Model Context Protocol) for AI integration:

- **File Operations**: `mcp.file.*`
- **Code Execution**: `mcp.emulator.*`
- **AI Chat**: `mcp.ai.*`

## Support

For more information:
- Type `help` in the terminal
- Visit the AuraOS documentation
- Check the AI_COMMANDS.md guide

## Version

AuraOS Terminal Assistant v1.0.0
- MCP Integration: v1.0.0
- BASIC Interpreter: v1.0.0
- AI Engine: Powered by Model Context Protocol

---

Built with ❤️ for AuraOS
