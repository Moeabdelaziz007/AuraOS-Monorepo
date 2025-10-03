import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LearningLoopService } from '../learning-loop.service';
import { BehaviorTracker } from '../behavior-tracker';
import { PatternAnalyzer } from '../pattern-analyzer';
import { AdaptationEngine } from '../adaptation-engine';

// Mock dependencies
vi.mock('@auraos/ai', () => ({
  aiService: {
    chat: vi.fn(),
    generate: vi.fn(),
    analyze: vi.fn()
  }
}));

vi.mock('@auraos/core', () => ({
  mcpCommands: {
    file: {
      read: vi.fn(),
      write: vi.fn(),
      list: vi.fn()
    }
  }
}));

describe('Learning Loop Integration Tests', () => {
  let learningLoop: LearningLoopService;
  let behaviorTracker: BehaviorTracker;
  let patternAnalyzer: PatternAnalyzer;
  let adaptationEngine: AdaptationEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    learningLoop = new LearningLoopService();
    behaviorTracker = new BehaviorTracker();
    patternAnalyzer = new PatternAnalyzer();
    adaptationEngine = new AdaptationEngine();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Behavior Tracking', () => {
    it('should track user interactions', async () => {
      const interaction = {
        type: 'app_launch',
        app: 'terminal',
        timestamp: Date.now(),
        context: { previousApp: 'desktop' }
      };

      await behaviorTracker.track(interaction);
      
      const trackedBehaviors = await behaviorTracker.getBehaviors();
      expect(trackedBehaviors).toContain(interaction);
    });

    it('should track command execution patterns', async () => {
      const commands = [
        { command: 'ls', timestamp: Date.now() },
        { command: 'cd /home', timestamp: Date.now() },
        { command: 'pwd', timestamp: Date.now() }
      ];

      for (const cmd of commands) {
        await behaviorTracker.track({
          type: 'command_execute',
          command: cmd.command,
          timestamp: cmd.timestamp
        });
      }

      const patterns = await behaviorTracker.getPatterns();
      expect(patterns.commands).toHaveLength(3);
    });

    it('should track time-based patterns', async () => {
      const timePatterns = [
        { action: 'app_launch', app: 'terminal', hour: 9 },
        { action: 'app_launch', app: 'files', hour: 10 },
        { action: 'app_launch', app: 'terminal', hour: 11 }
      ];

      for (const pattern of timePatterns) {
        await behaviorTracker.track({
          type: pattern.action,
          app: pattern.app,
          timestamp: new Date().setHours(pattern.hour, 0, 0, 0)
        });
      }

      const analysis = await patternAnalyzer.analyzeTimePatterns();
      expect(analysis.peakHours).toBeDefined();
      expect(analysis.appUsageByHour).toBeDefined();
    });
  });

  describe('Pattern Analysis', () => {
    it('should identify usage patterns', async () => {
      const behaviors = [
        { type: 'app_launch', app: 'terminal', timestamp: Date.now() },
        { type: 'command_execute', command: 'ls', timestamp: Date.now() },
        { type: 'app_launch', app: 'files', timestamp: Date.now() },
        { type: 'app_launch', app: 'terminal', timestamp: Date.now() }
      ];

      for (const behavior of behaviors) {
        await behaviorTracker.track(behavior);
      }

      const patterns = await patternAnalyzer.identifyPatterns();
      expect(patterns.frequentApps).toContain('terminal');
      expect(patterns.commandSequences).toBeDefined();
    });

    it('should analyze workflow patterns', async () => {
      const workflow = [
        { action: 'app_launch', app: 'terminal' },
        { action: 'command_execute', command: 'cd /project' },
        { action: 'command_execute', command: 'ls' },
        { action: 'app_launch', app: 'files' },
        { action: 'file_open', file: 'main.py' }
      ];

      for (const step of workflow) {
        await behaviorTracker.track({
          type: step.action,
          ...step,
          timestamp: Date.now()
        });
      }

      const workflowAnalysis = await patternAnalyzer.analyzeWorkflows();
      expect(workflowAnalysis.sequences).toBeDefined();
      expect(workflowAnalysis.efficiency).toBeDefined();
    });

    it('should detect anomalies', async () => {
      const normalBehaviors = Array.from({ length: 10 }, (_, i) => ({
        type: 'app_launch',
        app: 'terminal',
        timestamp: Date.now() - (i * 1000)
      }));

      const anomalousBehavior = {
        type: 'app_launch',
        app: 'unknown_app',
        timestamp: Date.now()
      };

      for (const behavior of normalBehaviors) {
        await behaviorTracker.track(behavior);
      }

      await behaviorTracker.track(anomalousBehavior);

      const anomalies = await patternAnalyzer.detectAnomalies();
      expect(anomalies).toContain(anomalousBehavior);
    });
  });

  describe('Adaptation Engine', () => {
    it('should adapt to user preferences', async () => {
      const preferences = {
        preferredApps: ['terminal', 'files'],
        workingHours: '9-17',
        automationLevel: 'high'
      };

      await adaptationEngine.updatePreferences(preferences);
      
      const adaptedBehavior = await adaptationEngine.getAdaptedBehavior();
      expect(adaptedBehavior.suggestedActions).toBeDefined();
      expect(adaptedBehavior.automationLevel).toBe('high');
    });

    it('should learn from user feedback', async () => {
      const feedback = {
        action: 'suggestion_accept',
        suggestion: 'automate_file_management',
        rating: 5,
        timestamp: Date.now()
      };

      await adaptationEngine.learnFromFeedback(feedback);
      
      const learningData = await adaptationEngine.getLearningData();
      expect(learningData.feedback).toContain(feedback);
    });

    it('should generate personalized suggestions', async () => {
      const userContext = {
        currentApp: 'terminal',
        recentCommands: ['ls', 'cd', 'pwd'],
        timeOfDay: 'morning'
      };

      const suggestions = await adaptationEngine.generateSuggestions(userContext);
      
      expect(suggestions).toBeDefined();
      expect(suggestions.automation).toBeDefined();
      expect(suggestions.shortcuts).toBeDefined();
    });
  });

  describe('Learning Loop Integration', () => {
    it('should complete full learning cycle', async () => {
      // 1. Track behavior
      await behaviorTracker.track({
        type: 'app_launch',
        app: 'terminal',
        timestamp: Date.now()
      });

      // 2. Analyze patterns
      const patterns = await patternAnalyzer.identifyPatterns();
      expect(patterns).toBeDefined();

      // 3. Generate adaptations
      const adaptations = await adaptationEngine.generateAdaptations(patterns);
      expect(adaptations).toBeDefined();

      // 4. Apply adaptations
      await adaptationEngine.applyAdaptations(adaptations);
      
      // 5. Track effectiveness
      const effectiveness = await learningLoop.measureEffectiveness();
      expect(effectiveness).toBeDefined();
    });

    it('should handle learning feedback loop', async () => {
      const initialBehavior = {
        type: 'app_launch',
        app: 'terminal',
        timestamp: Date.now()
      };

      await behaviorTracker.track(initialBehavior);
      
      // Generate suggestion
      const suggestion = await adaptationEngine.generateSuggestion(initialBehavior);
      expect(suggestion).toBeDefined();

      // Simulate user acceptance
      const feedback = {
        suggestionId: suggestion.id,
        accepted: true,
        rating: 5,
        timestamp: Date.now()
      };

      await adaptationEngine.learnFromFeedback(feedback);
      
      // Verify learning
      const learningData = await adaptationEngine.getLearningData();
      expect(learningData.feedback).toContain(feedback);
    });

    it('should handle continuous learning', async () => {
      const behaviors = Array.from({ length: 100 }, (_, i) => ({
        type: 'app_launch',
        app: i % 2 === 0 ? 'terminal' : 'files',
        timestamp: Date.now() - (i * 1000)
      }));

      for (const behavior of behaviors) {
        await behaviorTracker.track(behavior);
      }

      // Analyze patterns
      const patterns = await patternAnalyzer.identifyPatterns();
      expect(patterns.frequentApps).toContain('terminal');
      expect(patterns.frequentApps).toContain('files');

      // Generate adaptations
      const adaptations = await adaptationEngine.generateAdaptations(patterns);
      expect(adaptations).toBeDefined();

      // Apply and measure
      await adaptationEngine.applyAdaptations(adaptations);
      const effectiveness = await learningLoop.measureEffectiveness();
      expect(effectiveness).toBeGreaterThan(0);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large behavior datasets', async () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        type: 'app_launch',
        app: `app_${i % 10}`,
        timestamp: Date.now() - (i * 1000)
      }));

      const startTime = Date.now();
      for (const behavior of largeDataset) {
        await behaviorTracker.track(behavior);
      }
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
      
      const patterns = await patternAnalyzer.identifyPatterns();
      expect(patterns).toBeDefined();
    });

    it('should handle concurrent learning operations', async () => {
      const concurrentOperations = Array.from({ length: 100 }, (_, i) => 
        behaviorTracker.track({
          type: 'app_launch',
          app: `app_${i}`,
          timestamp: Date.now()
        })
      );

      const startTime = Date.now();
      await Promise.all(concurrentOperations);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle real-time pattern analysis', async () => {
      const realTimeBehaviors = Array.from({ length: 1000 }, (_, i) => ({
        type: 'app_launch',
        app: `app_${i % 5}`,
        timestamp: Date.now() - (i * 100)
      }));

      for (const behavior of realTimeBehaviors) {
        await behaviorTracker.track(behavior);
      }

      const startTime = Date.now();
      const patterns = await patternAnalyzer.identifyPatterns();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(patterns).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle behavior tracking failures', async () => {
      const invalidBehavior = {
        type: null,
        app: undefined,
        timestamp: 'invalid'
      };

      await expect(
        behaviorTracker.track(invalidBehavior)
      ).rejects.toThrow('Invalid behavior data');
    });

    it('should handle pattern analysis failures', async () => {
      // Mock pattern analysis failure
      vi.mocked(patternAnalyzer.identifyPatterns).mockRejectedValue(
        new Error('Analysis failed')
      );

      await expect(
        patternAnalyzer.identifyPatterns()
      ).rejects.toThrow('Analysis failed');
    });

    it('should handle adaptation failures', async () => {
      const invalidPatterns = null;

      await expect(
        adaptationEngine.generateAdaptations(invalidPatterns)
      ).rejects.toThrow('Invalid patterns');
    });
  });

  describe('Data Persistence', () => {
    it('should persist learning data', async () => {
      const learningData = {
        patterns: [{ type: 'app_usage', frequency: 0.8 }],
        adaptations: [{ behavior: 'automation', level: 'high' }],
        feedback: [{ rating: 5, timestamp: Date.now() }]
      };

      await learningLoop.saveLearningData(learningData);
      const savedData = await learningLoop.getLearningData();
      
      expect(savedData).toEqual(learningData);
    });

    it('should persist behavior history', async () => {
      const behaviors = Array.from({ length: 100 }, (_, i) => ({
        type: 'app_launch',
        app: `app_${i}`,
        timestamp: Date.now() - (i * 1000)
      }));

      for (const behavior of behaviors) {
        await behaviorTracker.track(behavior);
      }

      const savedBehaviors = await behaviorTracker.getBehaviors();
      expect(savedBehaviors).toHaveLength(100);
    });

    it('should persist adaptation history', async () => {
      const adaptations = [
        { behavior: 'automation', level: 'high', timestamp: Date.now() },
        { behavior: 'shortcuts', level: 'medium', timestamp: Date.now() }
      ];

      for (const adaptation of adaptations) {
        await adaptationEngine.applyAdaptation(adaptation);
      }

      const savedAdaptations = await adaptationEngine.getAdaptationHistory();
      expect(savedAdaptations).toHaveLength(2);
    });
  });
});
