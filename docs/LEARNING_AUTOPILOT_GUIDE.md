# 🧠 Learning Loop & Autopilot System Guide

Complete guide to AuraOS's self-learning and autonomous agent system.

## 🎯 Overview

AuraOS features a revolutionary two-part AI system:

- **🧠 Learning Loop (Brain)** - Learns from every interaction to become smarter
- **🤖 Autopilot (Body)** - Executes tasks autonomously using learned knowledge

Together, they create an OS that gets smarter with every use!

---

## 🧠 Learning Loop (The Brain)

### What It Does

The Learning Loop continuously:
- 📊 **Tracks** all user interactions
- 🔍 **Analyzes** behavior patterns
- 💡 **Generates** smart insights
- 🎯 **Predicts** next actions
- ⚡ **Optimizes** system performance

### Key Features

#### 1. **Behavior Tracking**
```typescript
import { initTracker } from '@auraos/core';

// Initialize tracker
const tracker = initTracker('user-123');

// Track app usage
await tracker.trackAppOpen('ai-notes', { x: 100, y: 100 });
await tracker.trackAppClose('ai-notes', 5000); // 5 seconds

// Track AI queries
await tracker.trackAIQuery('Create a todo list', 'Here is your list...', 2000);

// Track errors
await tracker.trackError('File not found', 'reading config.json');

// Track successes
await tracker.trackSuccess('file_created', 'notes.txt');
```

#### 2. **Pattern Recognition**
The system automatically identifies:
- **Most used apps** - Which apps you use most
- **Preferred times** - When you're most active
- **Common sequences** - Typical action patterns
- **Error patterns** - Recurring issues
- **Success patterns** - What works well

#### 3. **Smart Insights**
```typescript
import { LearningEngine } from '@auraos/core';

const engine = new LearningEngine('user-123');
await engine.init();

// Analyze and learn
await engine.analyzeAndLearn();

// Get smart suggestions
const suggestions = await engine.getSmartSuggestions();
// [
//   {
//     type: 'app',
//     title: 'Open AI Notes?',
//     description: 'You usually use this app during morning',
//     confidence: 0.8,
//     relevance: 0.9
//   }
// ]
```

#### 4. **Adaptive Preferences**
The system learns and remembers:
- **Window positions** - Where you like windows
- **Window sizes** - Your preferred sizes
- **Theme preferences** - Dark/light mode
- **AI provider** - Your favorite AI

---

## 🤖 Autopilot System (The Body)

### What It Does

Autopilot executes tasks autonomously:
- 🎯 **Understands** natural language commands
- 📋 **Plans** multi-step tasks
- 🤔 **Decides** whether to execute or ask
- ⚡ **Executes** tasks automatically
- 📚 **Learns** from every execution

### Modes

#### 1. **Manual Mode**
- User approves every action
- Maximum control
- Best for learning the system

#### 2. **Assisted Mode** (Default)
- Auto-executes high-confidence tasks
- Asks for approval on risky tasks
- Balanced approach

#### 3. **Autonomous Mode**
- Executes most tasks automatically
- Only asks for critical decisions
- Maximum automation

### Usage Examples

#### Basic Task Creation

```typescript
import { AutopilotSystem } from '@auraos/core';
import { initTracker } from '@auraos/core';

// Initialize
const tracker = initTracker('user-123');
const autopilot = new AutopilotSystem('user-123', tracker);
await autopilot.init();

// Create a task
const task = await autopilot.createTask(
  'Open AI Notes and create a file called todo.txt',
  'medium'
);

console.log(task);
// {
//   id: 'task-123',
//   description: '...',
//   status: 'pending',
//   steps: [
//     { action: 'open_app', params: { appId: 'ai-notes' } },
//     { action: 'create_file', params: { filename: 'todo.txt' } }
//   ],
//   confidence: 0.85
// }
```

#### Decision Making

```typescript
// Get autopilot's decision
const decision = await autopilot.makeDecision(task.id);

console.log(decision);
// {
//   decision: 'execute', // or 'ask_user', 'defer', 'reject'
//   reason: 'High confidence (85%) and 2 benefits identified',
//   confidence: 0.85,
//   estimatedDuration: 1300,
//   risks: [],
//   benefits: ['Similar tasks completed successfully before']
// }
```

#### Task Execution

```typescript
// Execute the task
try {
  await autopilot.executeTask(task.id);
  console.log('✅ Task completed successfully!');
} catch (error) {
  console.error('❌ Task failed:', error);
}

// Check task status
const updatedTask = autopilot.getTask(task.id);
console.log(updatedTask.status); // 'completed' or 'failed'
```

### Natural Language Commands

Autopilot understands various command patterns:

#### App Control
```typescript
await autopilot.createTask('Open AI Code Editor');
await autopilot.createTask('Close AI Terminal');
```

#### File Operations
```typescript
await autopilot.createTask('Create file notes.txt');
await autopilot.createTask('Write "Hello World" to notes.txt');
await autopilot.createTask('Read file config.json');
```

#### AI Queries
```typescript
await autopilot.createTask('Ask AI how to create a React component');
await autopilot.createTask('Query AI about TypeScript best practices');
```

#### Complex Tasks
```typescript
await autopilot.createTask(
  'Open AI Notes, create a file called ideas.txt, and write my brainstorming notes'
);
```

---

## 🔄 The Learning Cycle

### How It Works

```
1. User Action
   ↓
2. Behavior Tracker Records
   ↓
3. Learning Engine Analyzes
   ↓
4. Patterns Identified
   ↓
5. Insights Generated
   ↓
6. Autopilot Uses Knowledge
   ↓
7. Task Executed
   ↓
8. Results Learned
   ↓
(Back to 1)
```

### Example: Learning Window Positions

```typescript
// Day 1: User opens AI Notes
tracker.trackAppOpen('ai-notes', { x: 100, y: 100 });
tracker.trackWindowMove('ai-notes', { x: 200, y: 150 });

// Day 2: User opens AI Notes again
tracker.trackAppOpen('ai-notes', { x: 100, y: 100 });
tracker.trackWindowMove('ai-notes', { x: 200, y: 150 });

// Day 3: Learning engine analyzes
await engine.analyzeAndLearn();

// Result: System learns preferred position
const pattern = engine.getPattern();
console.log(pattern.preferences.windowPositions['ai-notes']);
// { x: 200, y: 150 }

// Day 4: Autopilot uses learned position
const task = await autopilot.createTask('Open AI Notes');
// Window automatically opens at { x: 200, y: 150 }!
```

---

## 📊 Capabilities

Autopilot comes with built-in capabilities:

| Capability | Category | Complexity | Success Rate |
|------------|----------|------------|--------------|
| Open App | App | Simple | 95% |
| Close App | App | Simple | 98% |
| Create File | File | Simple | 92% |
| Read File | File | Simple | 96% |
| Write File | File | Medium | 90% |
| AI Query | AI | Medium | 88% |
| Execute Workflow | Automation | Complex | 85% |
| Analyze Data | Data | Complex | 82% |

### Capability Stats

```typescript
// Get all capabilities
const capabilities = autopilot.getCapabilities();

capabilities.forEach(cap => {
  console.log(`${cap.name}:`);
  console.log(`  Success Rate: ${(cap.successRate * 100).toFixed(0)}%`);
  console.log(`  Usage Count: ${cap.usageCount}`);
  console.log(`  Avg Duration: ${cap.avgDuration}ms`);
});
```

---

## ⚙️ Configuration

### Autopilot Config

```typescript
// Get current config
const config = autopilot.getConfig();

// Update config
autopilot.updateConfig({
  mode: 'autonomous',        // 'manual' | 'assisted' | 'autonomous'
  autoApprove: true,         // Auto-approve high-confidence tasks
  maxConcurrentTasks: 5,     // Max parallel tasks
  learningEnabled: true,     // Enable learning from tasks
  riskTolerance: 'high',     // 'low' | 'medium' | 'high'
  notifyOnCompletion: true,  // Notify when tasks complete
});
```

### Learning Config

```typescript
// Enable/disable tracking
tracker.setEnabled(true);

// Get session duration
const duration = tracker.getSessionDuration();
console.log(`Session: ${duration}ms`);

// Reset session
tracker.resetSession();
```

---

## 📈 Metrics & Analytics

### Learning Metrics

```typescript
import { learningStorage } from '@auraos/core';

// Get metrics
const metrics = await learningStorage.getMetrics();

console.log(metrics);
// {
//   totalInteractions: 1523,
//   uniqueUsers: 1,
//   avgSessionDuration: 1800000, // 30 minutes
//   mostUsedApps: ['ai-notes', 'ai-code-editor', 'ai-terminal'],
//   errorRate: 0.05,
//   successRate: 0.95,
//   improvementRate: 0.15, // 15% improvement!
//   lastUpdated: 1234567890
// }
```

### Task History

```typescript
// Get task history
const history = autopilot.getTaskHistory();

history.forEach(learning => {
  console.log(`Task: ${learning.taskId}`);
  console.log(`  Success: ${learning.success}`);
  console.log(`  Duration: ${learning.duration}ms`);
  console.log(`  Steps: ${learning.stepsExecuted}`);
  console.log(`  Patterns: ${learning.patterns.join(', ')}`);
});
```

### Model State

```typescript
// Get AI model state
const modelState = engine.getModelState();

console.log(modelState);
// {
//   version: '1.0.0',
//   trainedAt: 1234567890,
//   accuracy: 0.92,
//   totalInteractions: 1523,
//   features: {
//     appPrediction: true,
//     windowOptimization: true,
//     errorPrevention: true,
//     smartSuggestions: true
//   }
// }
```

---

## 🎯 Advanced Usage

### Custom Capabilities

```typescript
// Add custom capability (future feature)
autopilot.registerCapability({
  id: 'send_email',
  name: 'Send Email',
  description: 'Send an email',
  category: 'communication',
  complexity: 'medium',
  handler: async (params) => {
    // Implementation
  }
});
```

### Task Feedback

```typescript
// Provide feedback on task execution
const task = autopilot.getTask('task-123');

// Positive feedback
await autopilot.provideFeedback(task.id, 'positive');

// Negative feedback
await autopilot.provideFeedback(task.id, 'negative');

// System learns from feedback!
```

### Pattern Analysis

```typescript
// Get user pattern
const pattern = engine.getPattern();

// Most used apps
console.log('Top Apps:', pattern.patterns.mostUsedApps);

// Preferred times
console.log('Active Times:', pattern.patterns.preferredTimes);

// Common sequences
console.log('Sequences:', pattern.patterns.commonSequences);

// Error patterns
console.log('Errors:', pattern.patterns.errorPatterns);
```

---

## 🔒 Privacy & Data

### Data Storage

All learning data is stored **locally** in IndexedDB:
- ✅ No data sent to external servers
- ✅ User has full control
- ✅ Can be cleared anytime
- ✅ Encrypted at rest (future)

### Data Cleanup

```typescript
// Clean up old data (keep last 30 days)
await learningStorage.cleanup(30);

// Clear all data
await learningStorage.cleanup(0);
```

---

## 🚀 Integration Example

### Complete Setup

```typescript
import {
  initTracker,
  LearningEngine,
  AutopilotSystem,
  learningStorage,
} from '@auraos/core';

// 1. Initialize storage
await learningStorage.init();

// 2. Initialize tracker
const tracker = initTracker('user-123');

// 3. Initialize learning engine
const engine = new LearningEngine('user-123');
await engine.init();

// 4. Initialize autopilot
const autopilot = new AutopilotSystem('user-123', tracker);
await autopilot.init();

// 5. Start learning loop (runs every 5 minutes)
setInterval(async () => {
  await engine.analyzeAndLearn();
  console.log('📚 Learning cycle completed');
}, 5 * 60 * 1000);

// 6. Use the system
const task = await autopilot.createTask('Open AI Notes');
const decision = await autopilot.makeDecision(task.id);

if (decision.decision === 'execute') {
  await autopilot.executeTask(task.id);
}

// 7. Get smart suggestions
const suggestions = await engine.getSmartSuggestions();
console.log('💡 Suggestions:', suggestions);
```

---

## 📚 Best Practices

### 1. **Track Everything**
```typescript
// Track all user actions
tracker.trackAppOpen('app-id');
tracker.trackWindowMove('app-id', position);
tracker.trackAIQuery(query, response, duration);
```

### 2. **Run Learning Regularly**
```typescript
// Analyze every 5-10 minutes
setInterval(() => engine.analyzeAndLearn(), 5 * 60 * 1000);
```

### 3. **Start with Assisted Mode**
```typescript
// Let users get comfortable first
autopilot.updateConfig({ mode: 'assisted' });
```

### 4. **Provide Feedback**
```typescript
// Help the system learn faster
await autopilot.provideFeedback(taskId, 'positive');
```

### 5. **Monitor Metrics**
```typescript
// Check improvement regularly
const metrics = await learningStorage.getMetrics();
console.log('Improvement:', metrics.improvementRate);
```

---

## 🎓 Learning Outcomes

After using AuraOS for a while, the system will:

✅ **Know your habits** - Opens apps you need before you ask  
✅ **Remember preferences** - Windows open where you like them  
✅ **Predict actions** - Suggests next steps in your workflow  
✅ **Prevent errors** - Warns about common mistakes  
✅ **Optimize performance** - Allocates resources intelligently  
✅ **Automate tasks** - Executes routine tasks automatically  

---

## 🔮 Future Enhancements

- [ ] **Deep Learning Models** - Neural networks for better predictions
- [ ] **Cross-User Learning** - Learn from anonymized community data
- [ ] **Voice Commands** - Natural language voice control
- [ ] **Proactive Suggestions** - System suggests tasks before you think of them
- [ ] **Emotional Intelligence** - Detect user mood and adapt
- [ ] **Multi-Device Sync** - Learn across all your devices

---

## 🆘 Troubleshooting

### Learning Not Working?

```typescript
// Check if tracking is enabled
const tracker = getTracker();
tracker.setEnabled(true);

// Check if learning engine is initialized
await engine.init();

// Force analysis
await engine.analyzeAndLearn();
```

### Autopilot Not Executing?

```typescript
// Check mode
const config = autopilot.getConfig();
console.log('Mode:', config.mode);

// Check task confidence
const task = autopilot.getTask(taskId);
console.log('Confidence:', task.confidence);

// Check decision
const decision = await autopilot.makeDecision(taskId);
console.log('Decision:', decision);
```

---

## 📞 Support

- **Documentation:** `/docs`
- **Examples:** `/packages/core/src/examples`
- **Issues:** GitHub Issues

---

**Built with ❤️ by the AuraOS Team**

**The OS that learns with you, grows with you, and works for you!** 🚀

