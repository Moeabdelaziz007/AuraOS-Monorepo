/**
 * User Behavior Tracker
 * Tracks and records user interactions for learning
 */

import type { UserInteraction, InteractionContext } from './types';
import { learningStorage } from './storage';

export class BehaviorTracker {
  private userId: string;
  private sessionStart: number;
  private lastAction: string | undefined;
  private enabled: boolean = true;

  constructor(userId: string) {
    this.userId = userId;
    this.sessionStart = Date.now();
  }

  /**
   * Enable or disable tracking
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Get current interaction context
   */
  private getContext(): InteractionContext {
    const now = new Date();
    const hour = now.getHours();
    
    let timeOfDay: InteractionContext['timeOfDay'];
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[now.getDay()];

    const sessionDuration = Date.now() - this.sessionStart;

    let deviceType: InteractionContext['deviceType'] = 'desktop';
    if (window.innerWidth < 768) deviceType = 'mobile';
    else if (window.innerWidth < 1024) deviceType = 'tablet';

    return {
      timeOfDay,
      dayOfWeek,
      sessionDuration,
      previousAction: this.lastAction,
      deviceType,
      screenSize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  }

  /**
   * Track an interaction
   */
  private async track(
    type: UserInteraction['type'],
    data: Record<string, any> = {},
    appId?: string
  ): Promise<void> {
    if (!this.enabled) return;

    const interaction: UserInteraction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: this.userId,
      timestamp: Date.now(),
      type,
      appId,
      data,
      context: this.getContext(),
    };

    try {
      await learningStorage.saveInteraction(interaction);
      this.lastAction = type;
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  }

  /**
   * Track app opening
   */
  async trackAppOpen(appId: string, position?: { x: number; y: number }): Promise<void> {
    await this.track('app_open', { position }, appId);
  }

  /**
   * Track app closing
   */
  async trackAppClose(appId: string, duration: number): Promise<void> {
    await this.track('app_close', { duration }, appId);
  }

  /**
   * Track window movement
   */
  async trackWindowMove(appId: string, position: { x: number; y: number }): Promise<void> {
    await this.track('window_move', { position }, appId);
  }

  /**
   * Track window resize
   */
  async trackWindowResize(appId: string, size: { width: number; height: number }): Promise<void> {
    await this.track('window_resize', { size }, appId);
  }

  /**
   * Track AI query
   */
  async trackAIQuery(query: string, response: string, duration: number): Promise<void> {
    await this.track('ai_query', {
      query: query.substring(0, 100), // Limit length
      responseLength: response.length,
      duration,
    });
  }

  /**
   * Track command execution
   */
  async trackCommandExecute(command: string, success: boolean, duration: number): Promise<void> {
    await this.track('command_execute', {
      command: command.substring(0, 50),
      success,
      duration,
    });
  }

  /**
   * Track error
   */
  async trackError(error: string, context: string): Promise<void> {
    await this.track('error', {
      error: error.substring(0, 200),
      context: context.substring(0, 100),
    });
  }

  /**
   * Track success
   */
  async trackSuccess(action: string, context: string): Promise<void> {
    await this.track('success', {
      action: action.substring(0, 100),
      context: context.substring(0, 100),
    });
  }

  /**
   * Get session duration
   */
  getSessionDuration(): number {
    return Date.now() - this.sessionStart;
  }

  /**
   * Reset session
   */
  resetSession(): void {
    this.sessionStart = Date.now();
    this.lastAction = undefined;
  }
}

// Global tracker instance
let globalTracker: BehaviorTracker | null = null;

export function initTracker(userId: string): BehaviorTracker {
  globalTracker = new BehaviorTracker(userId);
  return globalTracker;
}

export function getTracker(): BehaviorTracker | null {
  return globalTracker;
}
