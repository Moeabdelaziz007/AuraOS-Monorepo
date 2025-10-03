/**
 * Autopilot Types
 * Simple learning system that starts with basic tasks
 */

/**
 * Task categories that autopilot can learn
 */
export type TaskCategory = 
  | 'file_operation'    // Open, save, delete files
  | 'app_launch'        // Launch applications
  | 'window_management' // Arrange, resize windows
  | 'text_input'        // Type text, commands
  | 'navigation'        // Navigate between apps
  | 'system_action';    // System settings, logout

/**
 * Task complexity levels
 */
export type TaskComplexity = 'simple' | 'medium' | 'complex';

/**
 * A learned task pattern
 */
export interface LearnedTask {
  id: string;
  name: string;
  category: TaskCategory;
  complexity: TaskComplexity;
  
  // Pattern recognition
  trigger: {
    type: 'time' | 'event' | 'sequence' | 'manual';
    pattern: string;
    confidence: number; // 0-1
  };
  
  // Actions to perform
  actions: TaskAction[];
  
  // Learning metadata
  timesExecuted: number;
  successRate: number;
  lastExecuted?: Date;
  createdAt: Date;
  
  // User feedback
  userRating?: number; // 1-5
  enabled: boolean;
}

/**
 * Individual action in a task
 */
export interface TaskAction {
  type: 'click' | 'type' | 'wait' | 'open' | 'close' | 'navigate';
  target?: string;
  value?: string;
  delay?: number; // milliseconds
}

/**
 * Task execution result
 */
export interface TaskExecutionResult {
  taskId: string;
  success: boolean;
  duration: number;
  error?: string;
  timestamp: Date;
}

/**
 * Autopilot suggestion
 */
export interface AutopilotSuggestion {
  id: string;
  taskId: string;
  taskName: string;
  reason: string;
  confidence: number;
  timestamp: Date;
  accepted?: boolean;
}

/**
 * Learning context for pattern recognition
 */
export interface LearningContext {
  currentApp?: string;
  recentActions: string[];
  timeOfDay: number; // 0-23
  dayOfWeek: number; // 0-6
  userActivity: 'active' | 'idle';
}

/**
 * Simple task templates for initial learning
 */
export interface SimpleTaskTemplate {
  name: string;
  category: TaskCategory;
  description: string;
  actions: TaskAction[];
  learnFromUser: boolean; // Should learn variations from user
}
