// User data types

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGuest: boolean;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  autoSave: boolean;
  desktopLayout: DesktopLayout;
}

export interface DesktopLayout {
  wallpaper: string;
  iconSize: 'small' | 'medium' | 'large';
  taskbarPosition: 'top' | 'bottom';
  pinnedApps: string[];
}

export interface UserStats {
  totalSessions: number;
  totalTimeSpent: number; // in seconds
  appsUsed: Record<string, number>; // app id -> usage count
  lastActive: Date;
}

// Learning loop types

export interface LearningSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // in seconds
  activities: Activity[];
  insights: Insight[];
  status: 'active' | 'completed' | 'abandoned';
}

export interface Activity {
  id: string;
  sessionId: string;
  timestamp: Date;
  type: 'app_launch' | 'file_operation' | 'command_execution' | 'ai_interaction' | 'custom';
  appId?: string;
  data: Record<string, any>;
  metadata: ActivityMetadata;
}

export interface ActivityMetadata {
  duration?: number;
  success: boolean;
  errorMessage?: string;
  context?: string;
}

export interface Insight {
  id: string;
  sessionId: string;
  userId: string;
  timestamp: Date;
  type: 'pattern' | 'suggestion' | 'achievement' | 'warning';
  title: string;
  description: string;
  data: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
  acknowledged: boolean;
}

export interface LearningPattern {
  id: string;
  userId: string;
  patternType: 'workflow' | 'preference' | 'skill' | 'habit';
  name: string;
  description: string;
  frequency: number;
  confidence: number; // 0-1
  firstDetected: Date;
  lastDetected: Date;
  data: Record<string, any>;
}

export interface UserGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  targetDate: Date | null;
  progress: number; // 0-100
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt: Date | null;
}

// Analytics types

export interface UserAnalytics {
  userId: string;
  period: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
  metrics: AnalyticsMetrics;
}

export interface AnalyticsMetrics {
  totalSessions: number;
  totalDuration: number;
  averageSessionDuration: number;
  mostUsedApps: Array<{ appId: string; count: number }>;
  productivityScore: number; // 0-100
  learningVelocity: number; // insights per session
  goalCompletionRate: number; // percentage
}
