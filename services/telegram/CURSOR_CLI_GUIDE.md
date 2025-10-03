# 🤖 Cursor CLI Integration Guide

## Overview

The AuraOS Telegram Bot now includes powerful Cursor CLI integration, enabling AI-powered code analysis, file operations, and development tasks directly from Telegram.

## 🚀 Features

### 1. **Code Analysis** 📝
Analyze any code file in your project with detailed statistics.

**Command:** `/code <file-path>`

**Example:**
```
/code src/index.js
```

**Output:**
- Lines of code
- Number of functions
- Number of classes
- Imports/Exports count
- Comments count
- TODOs/FIXMEs
- Code preview

### 2. **File Operations** 📁

#### List Files
**Command:** `/files [directory]`

**Examples:**
```
/files
/files src
/files packages/ui
```

#### Read File Content
**Command:** `/read <file-path>`

**Example:**
```
/read package.json
/read src/components/Hero.tsx
```

#### Find Files
**Command:** `/find <pattern>`

**Examples:**
```
/find "*.tsx"
/find "package.json"
/find "*test*"
```

### 3. **Search in Files** 🔍
Search for text across your entire project.

**Command:** `/search <search-term>`

**Examples:**
```
/search "TODO"
/search "import React"
/search "function handleClick"
```

### 4. **Git Operations** 📊

#### Git Status
**Command:** `/git`

Shows current git status with modified, added, and deleted files.

#### Git Log
**Command:** `/gitlog`

Shows recent commits (last 5 by default).

### 5. **Project Structure** 🌳
View your project's directory structure.

**Command:** `/tree`

Shows a tree view of your project (excluding node_modules, dist, .git).

### 6. **Package Information** 📦
Get information about your package.json.

**Command:** `/pkg`

**Output:**
- Package name and version
- Description
- Available scripts
- Dependencies count
- Dev dependencies count

### 7. **System Information** 💻
View system resources and usage.

**Command:** `/sysinfo`

**Output:**
- Disk usage
- Memory usage
- CPU information
- System uptime

### 8. **Lines of Code** 📊
Count total lines of code in your project.

**Command:** `/loc`

Counts all JavaScript/TypeScript files.

### 9. **AI-Powered Commands** 🤖
Execute natural language commands using AI.

**Command:** `/ai <natural-language-command>`

**Examples:**
```
/ai show files
/ai git status
/ai project structure
/ai package info
/ai system info
/ai count lines
/ai recent changes
```

## 🎯 Use Cases

### 1. **Quick Code Review**
```
Admin: /code src/telegram/index.js
Bot: Shows code statistics and preview
Admin: /search "TODO"
Bot: Lists all TODOs in the project
```

### 2. **Project Exploration**
```
Admin: /tree
Bot: Shows project structure
Admin: /files src
Bot: Lists files in src directory
Admin: /read src/index.ts
Bot: Shows file content
```

### 3. **Git Workflow**
```
Admin: /git
Bot: Shows modified files
Admin: /gitlog
Bot: Shows recent commits
```

### 4. **System Monitoring**
```
Admin: /sysinfo
Bot: Shows disk, memory, CPU usage
Admin: /loc
Bot: Shows total lines of code
```

### 5. **Natural Language Queries**
```
Admin: /ai show files
Bot: Lists files in current directory
Admin: /ai git status
Bot: Shows git status
Admin: /ai package info
Bot: Shows package.json information
```

## 🔐 Security

### Admin-Only Access
All Cursor CLI commands are **admin-only** for security:
- Only users in `ADMIN_USER_IDS` can execute these commands
- Prevents unauthorized access to project files
- Protects sensitive information

### Safe Command Execution
- Dangerous commands are blocked (rm, del, format, etc.)
- Commands have timeout limits (30 seconds default)
- Output is truncated to prevent message overflow
- All commands run in project root directory

### Rate Limiting
- 20 requests per minute per user
- Prevents spam and abuse
- Automatic reset after time window

## 📋 Command Reference

| Command | Description | Admin Only | Example |
|---------|-------------|------------|---------|
| `/code <file>` | Analyze code file | ✅ | `/code src/index.js` |
| `/files [dir]` | List files | ✅ | `/files src` |
| `/search <term>` | Search in files | ✅ | `/search "TODO"` |
| `/git` | Git status | ✅ | `/git` |
| `/gitlog` | Git log | ✅ | `/gitlog` |
| `/tree` | Project structure | ✅ | `/tree` |
| `/read <file>` | Read file | ✅ | `/read package.json` |
| `/pkg` | Package info | ✅ | `/pkg` |
| `/find <pattern>` | Find files | ✅ | `/find "*.tsx"` |
| `/sysinfo` | System info | ✅ | `/sysinfo` |
| `/loc` | Lines of code | ✅ | `/loc` |
| `/ai <cmd>` | AI command | ✅ | `/ai show files` |

## 🛠️ Technical Details

### Implementation
- **Language:** JavaScript (ES Modules)
- **Integration:** `cursor-integration.js` module
- **Execution:** Child process with promisify
- **Safety:** Command validation and sanitization
- **Performance:** Async/await for non-blocking operations

### File Structure
```
services/telegram/
├── src/
│   ├── index.js              # Main bot file
│   └── cursor-integration.js # Cursor CLI integration
├── CURSOR_CLI_GUIDE.md       # This file
└── IMPROVEMENTS.md           # General improvements
```

### Configuration
Environment variables in `.env`:
```bash
PROJECT_ROOT=/workspaces/AuraOS-Monorepo
ADMIN_USER_IDS=1259666822,123456789
```

## 📊 Analytics

All Cursor CLI commands are tracked in bot analytics:
- Command usage count
- Most popular commands
- User activity patterns
- Performance metrics

View analytics with `/analytics` (admin only).

## 🔧 Troubleshooting

### Command Not Working?
1. **Check admin status**: Only admins can use Cursor commands
2. **Verify file path**: Use relative paths from project root
3. **Check rate limit**: Wait if you've exceeded 20 requests/minute
4. **View logs**: Check bot console for error messages

### Common Issues

**"Access denied"**
- You're not in the admin list
- Add your user ID to `ADMIN_USER_IDS` in `.env`

**"File not found"**
- Check file path is correct
- Use relative path from project root
- Use `/files` to list available files

**"Rate limit exceeded"**
- Wait 1 minute before trying again
- Reduce request frequency

**"Command timeout"**
- Command took too long (>30 seconds)
- Try a more specific command
- Check system resources

## 💡 Tips & Best Practices

1. **Use Tab Completion**: Type `/` to see all commands
2. **Start with `/tree`**: Get project overview first
3. **Use `/find` before `/read`**: Locate files before reading
4. **Check `/git` regularly**: Monitor project changes
5. **Use `/ai` for quick tasks**: Natural language is easier
6. **Monitor with `/sysinfo`**: Keep track of resources
7. **Review with `/analytics`**: See command usage patterns

## 🎓 Examples

### Example 1: Code Review Workflow
```
1. /tree                          # See project structure
2. /files src                     # List source files
3. /code src/index.js            # Analyze main file
4. /search "TODO"                # Find pending tasks
5. /git                          # Check git status
```

### Example 2: Quick File Check
```
1. /find "*.tsx"                 # Find React components
2. /read src/App.tsx             # Read component
3. /code src/App.tsx             # Analyze component
```

### Example 3: System Health Check
```
1. /sysinfo                      # Check system resources
2. /loc                          # Count lines of code
3. /gitlog                       # Recent activity
4. /pkg                          # Package status
```

### Example 4: Natural Language
```
1. /ai show files                # List files
2. /ai git status                # Git status
3. /ai project structure         # Tree view
4. /ai package info              # Package.json
```

## 🚀 Advanced Usage

### Combining Commands
Use multiple commands for comprehensive analysis:
```
/tree && /loc && /git
```

### Custom Searches
Search with patterns:
```
/search "import.*from"           # Find all imports
/search "function.*async"        # Find async functions
/search "TODO:|FIXME:"          # Find all markers
```

### File Patterns
Find specific file types:
```
/find "*.test.js"               # Test files
/find "*.config.*"              # Config files
/find "*Component.tsx"          # React components
```

## 📈 Future Enhancements

Planned features:
- [ ] Code editing capabilities
- [ ] Git commit/push from Telegram
- [ ] Run tests remotely
- [ ] Deploy from Telegram
- [ ] AI code suggestions
- [ ] Automated code reviews
- [ ] Real-time file watching
- [ ] Collaborative coding

## 🤝 Contributing

To add new Cursor commands:

1. Add function to `cursor-integration.js`
2. Add command handler in `index.js`
3. Update help text
4. Update this guide
5. Test thoroughly

## 📞 Support

Need help?
- Check `/help` for command list
- View this guide for detailed info
- Contact admin for access issues
- Check bot logs for errors

---

**Version:** 1.0.0 Enhanced
**Last Updated:** 2025
**Made with ❤️ for AuraOS**
