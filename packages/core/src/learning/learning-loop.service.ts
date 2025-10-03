/**
 * Learning Loop Service
 * Tracks user behavior, analyzes patterns, and provides AI-powered insights
 */

import { firestoreService } from '@auraos/firebase/services/firestore.service';
import { aiService } from '../ai/services';
import { rewardSystemService, type RewardEvent } from './reward-system.service';
import type {
  Activity,
  Insight,
  LearningPattern,
  LearningSession,
  UserProfile,
} from '@auraos/firebase/types/user';

interface LearningContext {
  userId: string;
  sessionId: string;
  recentActivities: Activity[];
  patterns: LearningPattern[];
  profile: UserProfile;
}

/**
 * Learning Loop Manager
 */
class LearningLoopService {
  private activeSessionId: string | null = null;
  private userId: string | null = null;
  private analysisInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize learning loop for a user
   */
  async initialize(userId: string): Promise<RewardEvent[]> {
    this.userId = userId;

    // Initialize rewards if not exists
    await rewardSystemService.initializeRewards(userId);

    // Update daily streak
    const streakEvents = await rewardSystemService.updateStreak(userId);

    // Check for existing active session
    const activeSession = await firestoreService.session.getActiveSession(userId);

    if (activeSession) {
      this.activeSessionId = activeSession.id;
    } else {
      // Create new session
      this.activeSessionId = await firestoreService.session.create(userId);
    }

    // Start periodic analysis
    this.startPeriodicAnalysis();

    // Update user stats
    await firestoreService.user.incrementStat(userId, 'totalSessions');

    return streakEvents;
  }

  /**
   * Shutdown learning loop
   */
  async shutdown(): Promise<void> {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }

    if (this.activeSessionId) {
      await firestoreService.session.end(this.activeSessionId);
      this.activeSessionId = null;
    }

    this.userId = null;
  }

  /**
   * Track an activity
   */
  async trackActivity(
    type: Activity['type'],
    data: Record<string, any>,
    metadata: Activity['metadata']
  ): Promise<void> {
    if (!this.userId || !this.activeSessionId) {
      throw new Error('Learning loop not initialized');
    }

    const activity: Omit<Activity, 'id'> = {
      sessionId: this.activeSessionId,
      timestamp: new Date(),
      type,
      appId: data.appId,
      data,
      metadata,
    };

    await firestoreService.activity.create(activity);

    // Track app usage if applicable
    if (data.appId) {
      await firestoreService.user.trackAppUsage(this.userId, data.appId);
    }

    // Trigger immediate analysis for important events
    if (type === 'ai_interaction' || metadata.success === false) {
      await this.analyzeRecentActivity();
    }
  }

  /**
   * Track app launch
   */
  async trackAppLaunch(appId: string, appName: string): Promise<RewardEvent[]> {
    await this.trackActivity(
      'app_launch',
      { appId, appName },
      { success: true }
    );

    if (!this.userId) return [];
    return await rewardSystemService.awardPoints(this.userId, 'APP_LAUNCH', { appId, appName });
  }

  /**
   * Track command execution
   */
  async trackCommand(command: string, success: boolean, errorMessage?: string): Promise<RewardEvent[]> {
    await this.trackActivity(
      'command_execution',
      { command },
      { success, errorMessage }
    );

    if (!this.userId || !success) return [];
    return await rewardSystemService.awardPoints(this.userId, 'COMMAND_EXECUTION', { command });
  }

  /**
   * Track file operation
   */
  async trackFileOperation(
    operation: string,
    filePath: string,
    success: boolean
  ): Promise<RewardEvent[]> {
    await this.trackActivity(
      'file_operation',
      { operation, filePath },
      { success }
    );

    if (!this.userId || !success) return [];
    return await rewardSystemService.awardPoints(this.userId, 'FILE_OPERATION', { operation, filePath });
  }

  /**
   * Track AI interaction
   */
  async trackAIInteraction(
    prompt: string,
    response: string,
    model: string,
    duration: number
  ): Promise<RewardEvent[]> {
    await this.trackActivity(
      'ai_interaction',
      { prompt, response, model },
      { success: true, duration }
    );

    if (!this.userId) return [];
    return await rewardSystemService.awardPoints(this.userId, 'AI_INTERACTION', { model, duration });
  }

  /**
   * Analyze recent activity and generate insights
   */
  private async analyzeRecentActivity(): Promise<void> {
    if (!this.userId || !this.activeSessionId) return;

    try {
      const context = await this.buildContext();
      
      // Detect patterns
      await this.detectPatterns(context);

      // Generate insights
      await this.generateInsights(context);

    } catch (error) {
      console.error('Error analyzing activity:', error);
    }
  }

  /**
   * Build learning context
   */
  private async buildContext(): Promise<LearningContext> {
    if (!this.userId || !this.activeSessionId) {
      throw new Error('Learning loop not initialized');
    }

    const [recentActivities, patterns, profile] = await Promise.all([
      firestoreService.activity.getSessionActivities(this.activeSessionId),
      firestoreService.pattern.getUserPatterns(this.userId),
      firestoreService.user.get(this.userId),
    ]);

    if (!profile) {
      throw new Error('User profile not found');
    }

    return {
      userId: this.userId,
      sessionId: this.activeSessionId,
      recentActivities,
      patterns,
      profile,
    };
  }

  /**
   * Detect patterns in user behavior
   */
  private async detectPatterns(context: LearningContext): Promise<void> {
    const { recentActivities, patterns } = context;

    if (recentActivities.length < 3) return;

    // Analyze activity sequences
    const activityTypes = recentActivities.map(a => a.type);
    const appSequence = recentActivities
      .filter(a => a.appId)
      .map(a => a.appId)
      .slice(-5);

    // Check for workflow patterns
    if (appSequence.length >= 3) {
      const sequenceKey = appSequence.join('->');
      const existingPattern = patterns.find(
        p => p.patternType === 'workflow' && p.data.sequence === sequenceKey
      );

      if (existingPattern) {
        await firestoreService.pattern.incrementFrequency(existingPattern.id);
      } else {
        // Create new pattern
        await firestoreService.pattern.create({
          userId: context.userId,
          patternType: 'workflow',
          name: 'App Workflow',
          description: `Frequently uses apps in sequence: ${appSequence.join(' → ')}`,
          frequency: 1,
          confidence: 0.5,
          data: { sequence: sequenceKey, apps: appSequence },
        });
      }
    }

    // Check for time-based patterns
    const now = new Date();
    const hour = now.getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

    const timePattern = patterns.find(
      p => p.patternType === 'habit' && p.data.timeOfDay === timeOfDay
    );

    if (timePattern) {
      await firestoreService.pattern.incrementFrequency(timePattern.id);
    } else if (recentActivities.length > 10) {
      await firestoreService.pattern.create({
        userId: context.userId,
        patternType: 'habit',
        name: `${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} Activity`,
        description: `Active during ${timeOfDay}`,
        frequency: 1,
        confidence: 0.3,
        data: { timeOfDay, hour },
      });
    }
  }

  /**
   * Generate AI-powered insights
   */
  private async generateInsights(context: LearningContext): Promise<void> {
    const { recentActivities, patterns, profile } = context;

    // Only generate insights if there's enough data
    if (recentActivities.length < 5) return;

    try {
      // Prepare data for AI analysis
      const analysisData = {
        recentActivities: recentActivities.slice(-10).map(a => ({
          type: a.type,
          appId: a.appId,
          success: a.metadata.success,
          timestamp: a.timestamp,
        })),
        patterns: patterns.map(p => ({
          type: p.patternType,
          name: p.name,
          frequency: p.frequency,
          confidence: p.confidence,
        })),
        stats: profile.stats,
      };

      // Get AI analysis
      const aiAnalysis = await aiService.analyzeLearningPattern(analysisData);

      // Parse AI response and create insights
      const insights = this.parseAIInsights(aiAnalysis);

      for (const insight of insights) {
        await firestoreService.insight.create({
          sessionId: context.sessionId,
          userId: context.userId,
          timestamp: new Date(),
          type: insight.type,
          title: insight.title,
          description: insight.description,
          data: insight.data,
          priority: insight.priority,
          acknowledged: false,
        });
      }
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  }

  /**
   * Parse AI insights from response
   */
  private parseAIInsights(aiResponse: string): Array<Omit<Insight, 'id' | 'sessionId' | 'userId' | 'timestamp' | 'acknowledged'>> {
    const insights: Array<Omit<Insight, 'id' | 'sessionId' | 'userId' | 'timestamp' | 'acknowledged'>> = [];

    // Try to parse structured response
    try {
      const parsed = JSON.parse(aiResponse);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // If not JSON, create a single insight from the text
      insights.push({
        type: 'suggestion',
        title: 'AI Insight',
        description: aiResponse,
        data: {},
        priority: 'medium',
      });
    }

    return insights;
  }

  /**
   * Start periodic analysis
   */
  private startPeriodicAnalysis(): void {
    // Analyze every 5 minutes
    this.analysisInterval = setInterval(() => {
      this.analyzeRecentActivity();
    }, 5 * 60 * 1000);
  }

  /**
   * Get user insights
   */
  async getInsights(userId: string, limit: number = 10): Promise<Insight[]> {
    return firestoreService.insight.getUserInsights(userId, limit);
  }

  /**
   * Get unacknowledged insights
   */
  async getUnacknowledgedInsights(userId: string): Promise<Insight[]> {
    return firestoreService.insight.getUnacknowledged(userId);
  }

  /**
   * Acknowledge insight
   */
  async acknowledgeInsight(insightId: string): Promise<RewardEvent[]> {
    await firestoreService.insight.acknowledge(insightId);
    
    if (!this.userId) return [];
    return await rewardSystemService.awardPoints(this.userId, 'INSIGHT_ACKNOWLEDGED');
  }

  /**
   * Get user patterns
   */
  async getPatterns(userId: string): Promise<LearningPattern[]> {
    return firestoreService.pattern.getUserPatterns(userId);
  }

  /**
   * Get session history
   */
  async getSessionHistory(userId: string, limit: number = 10): Promise<LearningSession[]> {
    return firestoreService.session.getUserSessions(userId, limit);
  }

  /**
   * Get current session
   */
  getCurrentSessionId(): string | null {
    return this.activeSessionId;
  }
}

// Export singleton instance
export const learningLoopService = new LearningLoopService();
