/**
 * Learning Loop Hook
 * React hook for interacting with the learning loop system
 */

import { useState, useEffect, useCallback } from 'react';
// import { learningLoopService } from '@auraos/core/learning/learning-loop.service';
import type { Insight, LearningPattern, LearningSession } from '@auraos/firebase/types/user';

export function useLearningLoop(user: any = null) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [patterns, setPatterns] = useState<LearningPattern[]>([]);
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize learning loop
  useEffect(() => {
    if (!user || initialized) return;

    const init = async () => {
      try {
        await learningLoopService.initialize(user.uid);
        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize learning loop:', error);
      }
    };

    init();

    // Cleanup on unmount
    return () => {
      if (initialized) {
        learningLoopService.shutdown();
      }
    };
  }, [user, initialized]);

  // Load data
  useEffect(() => {
    if (!user || !initialized) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [insightsData, patternsData, sessionsData] = await Promise.all([
          learningLoopService.getUnacknowledgedInsights(user.uid),
          learningLoopService.getPatterns(user.uid),
          learningLoopService.getSessionHistory(user.uid, 5),
        ]);

        setInsights(insightsData);
        setPatterns(patternsData);
        setSessions(sessionsData);
      } catch (error) {
        console.error('Failed to load learning data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, initialized]);

  // Track app launch
  const trackAppLaunch = useCallback(async (appId: string, appName: string) => {
    if (!initialized) return;
    try {
      await learningLoopService.trackAppLaunch(appId, appName);
    } catch (error) {
      console.error('Failed to track app launch:', error);
    }
  }, [initialized]);

  // Track command
  const trackCommand = useCallback(async (command: string, success: boolean, errorMessage?: string) => {
    if (!initialized) return;
    try {
      await learningLoopService.trackCommand(command, success, errorMessage);
    } catch (error) {
      console.error('Failed to track command:', error);
    }
  }, [initialized]);

  // Track file operation
  const trackFileOperation = useCallback(async (operation: string, filePath: string, success: boolean) => {
    if (!initialized) return;
    try {
      await learningLoopService.trackFileOperation(operation, filePath, success);
    } catch (error) {
      console.error('Failed to track file operation:', error);
    }
  }, [initialized]);

  // Track AI interaction
  const trackAIInteraction = useCallback(async (
    prompt: string,
    response: string,
    model: string,
    duration: number
  ) => {
    if (!initialized) return;
    try {
      await learningLoopService.trackAIInteraction(prompt, response, model, duration);
    } catch (error) {
      console.error('Failed to track AI interaction:', error);
    }
  }, [initialized]);

  // Acknowledge insight
  const acknowledgeInsight = useCallback(async (insightId: string) => {
    try {
      await learningLoopService.acknowledgeInsight(insightId);
      setInsights(prev => prev.filter(i => i.id !== insightId));
    } catch (error) {
      console.error('Failed to acknowledge insight:', error);
    }
  }, []);

  // Refresh data
  const refresh = useCallback(async () => {
    if (!user || !initialized) return;

    try {
      const [insightsData, patternsData, sessionsData] = await Promise.all([
        learningLoopService.getUnacknowledgedInsights(user.uid),
        learningLoopService.getPatterns(user.uid),
        learningLoopService.getSessionHistory(user.uid, 5),
      ]);

      setInsights(insightsData);
      setPatterns(patternsData);
      setSessions(sessionsData);
    } catch (error) {
      console.error('Failed to refresh learning data:', error);
    }
  }, [user, initialized]);

  return {
    insights,
    patterns,
    sessions,
    loading,
    initialized,
    trackAppLaunch,
    trackCommand,
    trackFileOperation,
    trackAIInteraction,
    acknowledgeInsight,
    refresh,
  };
}
