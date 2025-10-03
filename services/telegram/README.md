# 🤖 Enhanced AuraOS Telegram Bot

A powerful, intelligent Telegram bot for AuraOS with advanced AI, MCP integration, Autopilot, and Learning capabilities.

## ✨ Features

### 🧠 **AI Integration**
- Natural language processing
- Intelligent conversation handling
- Context-aware responses
- Learning from interactions

### 🔧 **MCP Tools**
- File system operations
- System commands
- AI analysis and generation
- Extensible tool system

### 🤖 **Autopilot**
- Automated task execution
- Smart scheduling
- Event-driven automation
- User-defined tasks

### 📚 **Learning System**
- Pattern recognition
- User preference learning
- Predictive assistance
- Continuous improvement

### 🔒 **Security**
- Rate limiting
- User authorization
- Suspicious activity monitoring
- Access control

### 📊 **Monitoring**
- Real-time analytics
- Performance metrics
- User activity tracking
- System health monitoring

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd services/telegram
npm install
```

### 2. Configuration

Create `.env` file:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
ADMIN_USER_IDS=user1_id,user2_id
```

### 3. Run the Bot

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📱 Usage

### Basic Commands

- `/start` - Initialize bot
- `/help` - Show help
- `/menu` - Interactive menu
- `/status` - System status
- `/ping` - Test responsiveness

### AI Commands

- `/ai <prompt>` - AI assistance
- `/analyze <text>` - Text analysis
- `/generate <prompt>` - Content generation

### MCP Commands

- `/mcp list` - List available tools
- `/mcp <tool> <params>` - Execute tool
- `/fs <operation>` - File operations

### Autopilot Commands

- `/autopilot status` - Check status
- `/autopilot tasks` - List tasks
- `/autopilot create` - Create task

### Learning Commands

- `/learning insights` - Get insights
- `/learning patterns` - View patterns
- `/learning recommendations` - Get recommendations

## 🏗️ Architecture

```
src/
├── types/           # TypeScript type definitions
├── core/            # Core bot functionality
├── ai/              # AI integration
├── mcp/             # MCP tools integration
├── autopilot/       # Autopilot system
├── learning/        # Learning system
├── security/        # Security management
├── monitoring/      # Monitoring and analytics
├── commands/        # Command handlers
└── EnhancedBot.ts   # Main bot class
```

## 🔧 Development

### Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Test
npm run test

# Lint
npm run lint

# Type check
npm run typecheck
```

### Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## 📊 Monitoring

### Dashboard

Access monitoring dashboard:

```bash
# Get bot status
curl http://localhost:3000/status

# Get analytics
curl http://localhost:3000/analytics

# Get system metrics
curl http://localhost:3000/metrics
```

### Metrics

- **System Metrics**: CPU, memory, disk usage
- **User Activity**: Messages, commands, sessions
- **Performance**: Response times, success rates
- **Security**: Rate limits, suspicious activity

## 🔒 Security

### Features

- **Rate Limiting**: Prevent spam and abuse
- **User Authorization**: Whitelist/blacklist support
- **Activity Monitoring**: Detect suspicious behavior
- **Access Control**: Admin-only commands

### Configuration

```typescript
security: {
  enableWhitelist: false,
  whitelistUsers: [],
  enableBlacklist: false,
  blacklistUsers: []
}
```

## 🧠 AI Features

### Natural Language Processing

- Intent recognition
- Context understanding
- Conversation flow
- Response generation

### Learning Capabilities

- Pattern recognition
- User preference learning
- Predictive assistance
- Continuous improvement

## 🤖 Autopilot

### Task Types

- **Scheduled Tasks**: Run at specific times
- **Event Tasks**: Triggered by events
- **Conditional Tasks**: Based on conditions
- **User Tasks**: Created by users

### Examples

```typescript
// System monitoring task
{
  id: 'system_monitor',
  trigger: { type: 'schedule', schedule: '*/5 * * * *' },
  actions: [{ type: 'command', target: 'system_info' }]
}
```

## 📚 Learning System

### Insights

- **Pattern Recognition**: Identify usage patterns
- **Preference Learning**: Learn user preferences
- **Optimization**: Suggest improvements
- **Predictions**: Predict user needs

### Recommendations

- Efficiency tips
- Feature suggestions
- Optimization advice
- Personalization options

## 🔧 MCP Tools

### Available Tools

- **File System**: Read, write, list files
- **System**: Execute commands, get info
- **AI**: Analyze text, generate content
- **Custom**: Extensible tool system

### Usage

```bash
# List directory
/mcp fs_list /home

# System info
/mcp system_info

# AI analysis
/mcp ai_analyze "Hello world"
```

## 📊 Analytics

### Metrics

- Total messages
- Command usage
- User activity
- System performance
- Success rates

### Reports

- Daily summaries
- Usage patterns
- Performance reports
- Security alerts

## 🚀 Deployment

### Production

```bash
# Build
npm run build

# Start
npm start
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 👨‍💻 Author

**Mohamed Abdelaziz**
- GitHub: [@Moeabdelaziz007](https://github.com/Moeabdelaziz007)
- Email: [your-email@example.com]

## 🙏 Acknowledgments

- AuraOS Team
- Telegram Bot API
- Node.js Community
- TypeScript Team

---

**Built with ❤️ for AuraOS**