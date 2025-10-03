# AuraOS Autopilot System Guide

## Overview

The AuraOS Autopilot is an intelligent learning system that starts with simple pre-defined tasks and learns from user behavior to automate repetitive actions. It features smart analysis, performance tracking, and a gamified reward system to encourage continuous improvement.

## Features

### 1. **Simple Task Recognition** 🎯
- Starts with 6 pre-defined learnable tasks
- Recognizes patterns in user actions
- Creates new tasks from observed sequences
- Suggests automation opportunities

### 2. **Smart Analysis** 🧠
- Tracks performance metrics (speed, accuracy, efficiency)
- Detects pattern changes in user behavior
- Generates actionable insights
- Calculates smart rate (0-100) based on performance

### 3. **Reward System** 🏆
- 25+ achievements across 10 categories
- Level progression system (1-30+)
- Experience points and rewards
- Streak tracking for consecutive successes

### 4. **Learning Data Storage** 💾
- Automatic persistence of learned tasks
- Execution history tracking
- Import/export functionality
- Multiple storage backends (localStorage, IndexedDB, Memory)

## Architecture

```
autopilot/
├── types.ts              # Type definitions
├── simple-tasks.ts       # Pre-defined task templates
├── autopilot.service.ts  # Main learning service
├── smart-analyzer.ts     # Performance analysis
├── reward-system.ts      # Gamification system
├── storage.ts            # Data persistence
└── index.ts              # Module exports
```

## Getting Started

### Basic Usage

```typescript
import { AutopilotService } from '@auraos/core/autopilot';

// Initialize autopilot
const autopilot = new AutopilotService();

// Get available tasks
const tasks = autopilot.getTasks();
console.log(`Loaded ${tasks.length} tasks`);

// Execute a task
const result = await autopilot.executeTask(tasks[0].id);
console.log(`Task ${result.success ? 'succeeded' : 'failed'} in ${result.duration}ms`);
```

### Learning from User Actions

```typescript
import { TaskAction, LearningContext } from '@auraos/core/autopilot';

// Define user actions
const userActions: TaskAction[] = [
  { type: 'open', target: 'settings' },
  { type: 'click', target: 'theme-button' },
  { type: 'wait', delay: 100 },
];

// Provide context
const context: LearningContext = {
  timeOfDay: 'morning',
  dayOfWeek: 'monday',
  recentApps: ['settings'],
  systemLoad: 0.5,
};

// Learn from actions
autopilot.learnFromUserActions(userActions, context);

// Check for suggestions
const suggestions = autopilot.getSuggestions();
suggestions.forEach(s => {
  console.log(`Suggestion: ${s.taskName} - ${s.reason}`);
});
```

### Smart Analysis

```typescript
import { SmartAnalyzer } from '@auraos/core/autopilot';

const analyzer = new SmartAnalyzer();

// Record executions
analyzer.recordExecution(result, context);

// Calculate smart rate
const smartRate = analyzer.calculateSmartRate(context);
console.log(`Smart Rate: ${smartRate}/100`);

// Generate insights
const insights = analyzer.generateInsights(context);
insights.forEach(insight => {
  console.log(`[${insight.type}] ${insight.title}: ${insight.description}`);
});
```

### Reward System

```typescript
import { RewardSystem } from '@auraos/core/autopilot';

const rewardSystem = new RewardSystem();

// Evaluate rewards for execution
const rewards = rewardSystem.evaluateRewards(result, context);

console.log(`Points: ${rewards.points}`);
console.log(`Experience: ${rewards.experience}`);
console.log(`Streak: ${rewards.streaks}`);

if (rewards.levelUp) {
  console.log('🎉 Level Up!');
}

if (rewards.achievements.length > 0) {
  console.log('🏆 Achievements unlocked:');
  rewards.achievements.forEach(a => {
    console.log(`  ${a.icon} ${a.name}: ${a.description}`);
  });
}

// Get statistics
const stats = rewardSystem.getStats();
console.log(`Level ${stats.level} (${stats.levelTitle})`);
console.log(`${stats.achievementsUnlocked}/${stats.totalAchievements} achievements`);
```

## Pre-defined Tasks

The autopilot starts with 6 learnable tasks:

### File Operations
1. **Open Recent File** - Opens the most recently used file
2. **Save Current Work** - Saves the current document

### App Launch
3. **Open Terminal** - Launches the terminal application
4. **Open Dashboard** - Launches the dashboard

### Text Input
5. **Type Hello Command** - Types a hello command in terminal

### System Actions
6. **Open Settings** - Opens system settings

## Task Categories

Tasks are organized into categories:

- `file_operation` - File management tasks
- `app_launch` - Application launching
- `window_management` - Window control
- `text_input` - Text entry automation
- `navigation` - UI navigation
- `system_action` - System-level operations

## Action Types

Tasks consist of sequences of actions:

```typescript
type ActionType = 
  | 'click'      // Click on a target element
  | 'type'       // Type text
  | 'wait'       // Wait for specified duration
  | 'open'       // Open an application
  | 'close'      // Close a window
  | 'navigate';  // Navigate to a location
```

## Learning Context

The system uses context to make intelligent decisions:

```typescript
interface LearningContext {
  timeOfDay: string;      // 'morning', 'afternoon', 'evening', 'night'
  dayOfWeek: string;      // 'monday', 'tuesday', etc.
  recentApps: string[];   // Recently used applications
  systemLoad: number;     // System load (0-1)
}
```

## Smart Rate Calculation

The smart rate (0-100) is calculated based on:

- **Success Rate** (40% weight) - Percentage of successful executions
- **Speed Score** (30% weight) - Average execution time
- **Volume Score** (30% weight) - Number of executions

## Achievement Categories

### Speed Achievements
- **Speed Demon I-III** - Fast task execution
- **Lightning Fast** - Ultra-fast execution

### Perfectionist Achievements
- **Perfectionist I-III** - High success rates
- **Flawless** - 100% success rate

### Innovation Achievements
- **Innovator I-III** - Learning new tasks
- **Genius** - Many tasks learned

### Efficiency Achievements
- **Efficiency Master I-III** - Optimized workflows
- **Optimization Guru** - Peak efficiency

### Consistency Achievements
- **Consistency King I-III** - Stable performance
- **Rock Solid** - Maximum consistency

### Learning Achievements
- **Quick Learner I-III** - Fast learning
- **Scholar** - Extensive learning

### Problem Solving Achievements
- **Problem Solver I-III** - Fixing failing tasks
- **Miracle Worker** - Major improvements

### Milestone Achievements
- **Getting Started** - Level 5
- **Experienced** - Level 10
- **Master** - Level 25

### Streak Achievements
- **On Fire** - 5 consecutive successes
- **Blazing** - 10 consecutive successes
- **Inferno** - 25 consecutive successes

### Explorer Achievements
- **Curious** - Try 3 categories
- **Adventurer** - Try all categories

## Level System

Levels progress with experience points:

| Level Range | Title | Required XP (per level) |
|-------------|-------|-------------------------|
| 1-4 | Novice | 100 × 1.5^level |
| 5-9 | Apprentice | 100 × 1.5^level |
| 10-14 | Skilled | 100 × 1.5^level |
| 15-19 | Expert | 100 × 1.5^level |
| 20-24 | Master | 100 × 1.5^level |
| 25-29 | Grandmaster | 100 × 1.5^level |
| 30+ | Legend | 100 × 1.5^level |

## Data Storage

### Storage Backends

1. **LocalStorage** - Browser localStorage (default for web)
2. **IndexedDB** - Browser IndexedDB (for larger datasets)
3. **Memory** - In-memory storage (for Node.js/testing)

### Data Structure

```typescript
interface AutopilotData {
  tasks: LearnedTask[];
  executionHistory: TaskExecutionResult[];
  suggestions: AutopilotSuggestion[];
  stats: AutopilotStats;
  lastUpdated: Date;
}
```

### Persistence Operations

```typescript
// Save state
await autopilot.saveState();

// Export data
const jsonData = await autopilot.exportData();

// Import data
await autopilot.importData(jsonData);

// Clear all data
await autopilot.clearAllData();

// Enable/disable auto-save
autopilot.setAutoSave(true);
```

## Advanced Features

### Pattern Detection

The smart analyzer detects:
- New patterns in user behavior
- Pattern shifts over time
- Frequency changes
- Time-based usage patterns

### Performance Metrics

Track detailed metrics:
- Average execution duration
- Success rate trends
- Week-over-week comparisons
- Task-specific statistics

### Behavior Insights

Generate actionable insights:
- **Productivity** - Overall performance feedback
- **Efficiency** - Optimization opportunities
- **Pattern** - Behavior change notifications
- **Suggestion** - Underutilized features

## Configuration

### Learning Mode

```typescript
// Enable/disable learning
autopilot.setLearningMode(true);

// Check learning status
const isLearning = autopilot.isLearning;
```

### Task Management

```typescript
// Get all tasks
const allTasks = autopilot.getTasks();

// Get enabled tasks only
const enabledTasks = autopilot.getEnabledTasks();

// Get tasks by category
const fileTasks = autopilot.getTasksByCategory('file_operation');

// Get task statistics
const stats = autopilot.getTaskStats(taskId);
```

### Suggestion Management

```typescript
// Get pending suggestions
const suggestions = autopilot.getSuggestions();

// Accept a suggestion
autopilot.acceptSuggestion(suggestionId);

// Reject a suggestion
autopilot.rejectSuggestion(suggestionId);
```

## Best Practices

### 1. Provide Rich Context
Always provide detailed context when learning from user actions:

```typescript
const context: LearningContext = {
  timeOfDay: new Date().getHours() < 12 ? 'morning' : 'afternoon',
  dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
  recentApps: getRecentlyUsedApps(),
  systemLoad: getSystemLoad(),
};
```

### 2. Handle Errors Gracefully
Always handle task execution errors:

```typescript
try {
  const result = await autopilot.executeTask(taskId);
  if (!result.success) {
    console.error(`Task failed: ${result.error}`);
  }
} catch (error) {
  console.error('Task execution error:', error);
}
```

### 3. Regular Analysis
Perform regular analysis to optimize performance:

```typescript
// Start continuous analysis (every minute)
analyzer.startAnalysis(60000);

// Stop when not needed
analyzer.stopAnalysis();
```

### 4. Save State Periodically
Enable auto-save or save manually:

```typescript
// Enable auto-save (saves 2 seconds after changes)
autopilot.setAutoSave(true);

// Or save manually
await autopilot.saveState();
```

### 5. Monitor Rewards
Track progress and celebrate achievements:

```typescript
const stats = rewardSystem.getStats();

if (stats.streak > 5) {
  console.log(`🔥 ${stats.streak} task streak!`);
}

if (stats.level > previousLevel) {
  showLevelUpNotification(stats.level, stats.levelTitle);
}
```

## Integration Example

Complete integration with UI:

```typescript
import { 
  AutopilotService, 
  SmartAnalyzer, 
  RewardSystem 
} from '@auraos/core/autopilot';

class AutopilotManager {
  private autopilot: AutopilotService;
  private analyzer: SmartAnalyzer;
  private rewards: RewardSystem;

  constructor() {
    this.autopilot = new AutopilotService();
    this.analyzer = new SmartAnalyzer();
    this.rewards = new RewardSystem();
    
    // Enable auto-save
    this.autopilot.setAutoSave(true);
    
    // Start continuous analysis
    this.analyzer.startAnalysis(60000);
  }

  async executeTask(taskId: string) {
    const context = this.getCurrentContext();
    
    // Execute task
    const result = await this.autopilot.executeTask(taskId);
    
    // Record for analysis
    this.analyzer.recordExecution(result, context);
    
    // Evaluate rewards
    const rewards = this.rewards.evaluateRewards(result, context);
    
    // Show notifications
    if (rewards.levelUp) {
      this.showLevelUpNotification();
    }
    
    if (rewards.achievements.length > 0) {
      this.showAchievements(rewards.achievements);
    }
    
    return result;
  }

  getCurrentContext(): LearningContext {
    const hour = new Date().getHours();
    const timeOfDay = hour < 6 ? 'night' 
      : hour < 12 ? 'morning'
      : hour < 18 ? 'afternoon'
      : hour < 22 ? 'evening'
      : 'night';

    return {
      timeOfDay,
      dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
      recentApps: this.getRecentApps(),
      systemLoad: this.getSystemLoad(),
    };
  }

  getStats() {
    return {
      autopilot: this.autopilot.getStats(),
      rewards: this.rewards.getStats(),
      smartRate: this.analyzer.calculateSmartRate(this.getCurrentContext()),
      insights: this.analyzer.generateInsights(this.getCurrentContext()),
    };
  }
}
```

## Troubleshooting

### Tasks Not Learning
- Ensure learning mode is enabled: `autopilot.setLearningMode(true)`
- Check that action sequences are 2-5 steps long
- Verify context is being provided

### Low Smart Rate
- Increase successful task executions
- Reduce execution time
- Execute more tasks regularly

### No Achievements Unlocking
- Check achievement requirements
- Ensure tasks are executing successfully
- Maintain consistent performance

### Storage Issues
- Check browser storage limits
- Use IndexedDB for larger datasets
- Enable auto-save for automatic persistence

## API Reference

### AutopilotService

```typescript
class AutopilotService {
  constructor(storage?: IAutopilotStorage)
  
  getTasks(): LearnedTask[]
  getTasksByCategory(category: TaskCategory): LearnedTask[]
  getEnabledTasks(): LearnedTask[]
  
  async executeTask(taskId: string): Promise<TaskExecutionResult>
  learnFromUserActions(actions: TaskAction[], context: LearningContext): void
  
  getSuggestions(): AutopilotSuggestion[]
  acceptSuggestion(suggestionId: string): void
  rejectSuggestion(suggestionId: string): void
  
  getExecutionHistory(limit?: number): TaskExecutionResult[]
  getTaskStats(taskId: string): TaskStats | null
  getStats(): AutopilotStats
  
  setLearningMode(enabled: boolean): void
  setAutoSave(enabled: boolean): void
  
  async saveState(): Promise<void>
  async exportData(): Promise<string>
  async importData(jsonData: string): Promise<void>
  async clearAllData(): Promise<void>
}
```

### SmartAnalyzer

```typescript
class SmartAnalyzer {
  recordExecution(result: TaskExecutionResult, context: LearningContext): void
  
  calculateSmartRate(context: LearningContext): number
  generateInsights(context: LearningContext): BehaviorInsight[]
  
  startAnalysis(intervalMs?: number): void
  stopAnalysis(): void
}
```

### RewardSystem

```typescript
class RewardSystem {
  evaluateRewards(result: TaskExecutionResult, context: any): {
    achievements: Achievement[];
    points: number;
    experience: number;
    levelUp: boolean;
    streaks: number;
  }
  
  getStats(): {
    totalPoints: number;
    level: number;
    levelTitle: string;
    experience: number;
    experienceToNext: number;
    streak: number;
    achievementsUnlocked: number;
    totalAchievements: number;
  }
  
  getLevelInfo(): AutopilotLevel
}
```

## Future Enhancements

- [ ] Machine learning integration for better pattern recognition
- [ ] Cloud sync for cross-device learning
- [ ] Task scheduling and automation
- [ ] Advanced analytics dashboard
- [ ] Custom task creation UI
- [ ] Task marketplace for sharing
- [ ] Voice command integration
- [ ] Predictive task suggestions

## Contributing

To contribute to the autopilot system:

1. Add new task templates in `simple-tasks.ts`
2. Extend achievement definitions in `reward-system.ts`
3. Improve pattern detection in `smart-analyzer.ts`
4. Add new storage backends in `storage.ts`

## License

MIT License - See LICENSE file for details

---

**Built with ❤️ for AuraOS**
