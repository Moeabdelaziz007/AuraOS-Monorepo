/**
 * Task Scheduler Types
 * Type definitions for progressive task scheduling and learning
 */

export enum TaskTier {
  FOUNDATION = 1,    // Basic operations (complexity 1-3)
  INTERMEDIATE = 2,  // Combined operations (complexity 4-6)
  ADVANCED = 3,      // Complex workflows (complexity 7-9)
  EXPERT = 4         // Multi-step, error-prone (complexity 10)
}

export enum TaskCategory {
  FILE_OPERATIONS = 'file_operations',
  DATA_PROCESSING = 'data_processing',
  STRING_MANIPULATION = 'string_manipulation',
  API_CALLS = 'api_calls',
  DATABASE_OPERATIONS = 'database_operations',
  WORKFLOW_ORCHESTRATION = 'workflow_orchestration',
  ERROR_HANDLING = 'error_handling',
  PERFORMANCE_OPTIMIZATION = 'performance_optimization',
  CODE_ANALYSIS = 'code_analysis',
  SYSTEM_OPERATIONS = 'system_operations'
}

export interface Skill {
  name: string;
  level: number; // 0-10
  experience: number; // Number of times used
  lastUsed: Date;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  tier: TaskTier;
  category: TaskCategory;
  complexity: number; // 1-10
  requiredSkills: string[];
  estimatedTime: number; // ms
  successRate: number; // Historical success rate (0-1)
  learningValue: number; // How much agent learns (0-1)
  prerequisites?: string[]; // Task IDs that should be completed first
  tags: string[];
  createdAt: Date;
}

export interface TaskResult {
  taskId: string;
  agentId: string;
  success: boolean;
  executionTime: number;
  resourceUsage: number;
  errorMessage?: string;
  output?: any;
  timestamp: Date;
  metrics: TaskMetrics;
}

export interface TaskMetrics {
  speedScore: number; // 0-1
  efficiencyScore: number; // 0-1
  qualityScore: number; // 0-1
  improvementScore?: number; // Compared to previous attempts
}

export interface AgentProfile {
  id: string;
  name: string;
  currentTier: TaskTier;
  skills: Map<string, Skill>;
  completedTasks: string[];
  totalTasksCompleted: number;
  successRate: number;
  averageExecutionTime: number;
  learningRate: number; // How fast the agent improves
  specializations: TaskCategory[];
  createdAt: Date;
  lastActive: Date;
}

export interface SchedulerConfig {
  // Task selection
  currentLevelProbability: number; // 0-1, default 0.8
  nextLevelProbability: number; // 0-1, default 0.2
  
  // Learning parameters
  optimalDifficulty: number; // 0-1, default 0.6
  noveltyWeight: number; // 0-1, default 0.3
  difficultyWeight: number; // 0-1, default 0.5
  relevanceWeight: number; // 0-1, default 0.2
  
  // Performance thresholds
  tierPromotionThreshold: number; // Success rate to advance, default 0.8
  tierDemotionThreshold: number; // Success rate to go back, default 0.4
  plateauDetectionWindow: number; // Number of tasks to check, default 20
  
  // Task pool
  minTasksPerTier: number; // Minimum tasks available per tier, default 10
  maxTaskRetries: number; // Max retries for failed tasks, default 3
}

export interface LearningScore {
  novelty: number; // 0-1
  difficulty: number; // 0-1
  relevance: number; // 0-1
  total: number; // Weighted sum
}

export interface PerformanceAnalysis {
  improvementRate: number; // Rate of improvement over time
  plateauDetected: boolean; // Is learning stalled?
  optimalComplexity: number; // Best complexity level for this agent
  recommendedTier: TaskTier; // Suggested tier
  strugglingAreas: TaskCategory[]; // Categories needing improvement
  strengths: TaskCategory[]; // Categories where agent excels
}

export interface TaskSchedulerStats {
  totalTasksScheduled: number;
  tasksByTier: Record<TaskTier, number>;
  tasksByCategory: Record<TaskCategory, number>;
  averageSelectionTime: number; // ms
  cacheHitRate: number; // 0-1
}
