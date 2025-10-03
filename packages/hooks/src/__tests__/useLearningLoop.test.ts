import { renderHook, act, waitFor } from '@testing-library/react';
import { useLearningLoop } from '../useLearningLoop';

// Mock learning loop service
const mockLearningLoopService = {
  initialize: jest.fn(),
  shutdown: jest.fn(),
  getUnacknowledgedInsights: jest.fn(),
  getPatterns: jest.fn(),
  getSessionHistory: jest.fn(),
  trackAppLaunch: jest.fn(),
  trackCommand: jest.fn(),
  trackFileOperation: jest.fn(),
  trackAIInteraction: jest.fn(),
  acknowledgeInsight: jest.fn(),
};

// Mock the service globally
(global as any).learningLoopService = mockLearningLoopService;

describe('useLearningLoop', () => {
  const mockUser = { uid: 'user123', email: 'test@example.com' };
  const mockInsights = [
    { id: '1', type: 'pattern', message: 'You often use feature X', acknowledged: false },
    { id: '2', type: 'suggestion', message: 'Try feature Y', acknowledged: false },
  ];
  const mockPatterns = [
    { id: 'p1', type: 'app_usage', frequency: 10, lastSeen: Date.now() },
  ];
  const mockSessions = [
    { id: 's1', startTime: Date.now() - 3600000, duration: 1800000 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockLearningLoopService.initialize.mockResolvedValue(undefined);
    mockLearningLoopService.getUnacknowledgedInsights.mockResolvedValue(mockInsights);
    mockLearningLoopService.getPatterns.mockResolvedValue(mockPatterns);
    mockLearningLoopService.getSessionHistory.mockResolvedValue(mockSessions);
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useLearningLoop());

      expect(result.current.insights).toEqual([]);
      expect(result.current.patterns).toEqual([]);
      expect(result.current.sessions).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.initialized).toBe(false);
    });

    it('should initialize learning loop when user is provided', async () => {
      const { result } = renderHook(() => useLearningLoop(mockUser));

      await waitFor(() => {
        expect(mockLearningLoopService.initialize).toHaveBeenCalledWith('user123');
        expect(result.current.initialized).toBe(true);
      });
    });

    it('should not initialize without user', () => {
      renderHook(() => useLearningLoop(null));

      expect(mockLearningLoopService.initialize).not.toHaveBeenCalled();
    });

    it('should handle initialization errors', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockLearningLoopService.initialize.mockRejectedValue(new Error('Init failed'));

      renderHook(() => useLearningLoop(mockUser));

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'Failed to initialize learning loop:',
          expect.any(Error)
        );
      });

      consoleError.mockRestore();
    });

    it('should shutdown on unmount', async () => {
      const { unmount } = renderHook(() => useLearningLoop(mockUser));

      await waitFor(() => {
        expect(mockLearningLoopService.initialize).toHaveBeenCalled();
      });

      unmount();

      expect(mockLearningLoopService.shutdown).toHaveBeenCalled();
    });

    it('should not shutdown if not initialized', () => {
      const { unmount } = renderHook(() => useLearningLoop(null));

      unmount();

      expect(mockLearningLoopService.shutdown).not.toHaveBeenCalled();
    });
  });

  describe('Data Loading', () => {
    it('should load insights, patterns, and sessions', async () => {
      const { result } = renderHook(() => useLearningLoop(mockUser));

      await waitFor(() => {
        expect(result.current.insights).toEqual(mockInsights);
        expect(result.current.patterns).toEqual(mockPatterns);
        expect(result.current.sessions).toEqual(mockSessions);
        expect(result.current.loading).toBe(false);
      });
    });

    it('should not load data without user', () => {
      renderHook(() => useLearningLoop(null));

      expect(mockLearningLoopService.getUnacknowledgedInsights).not.toHaveBeenCalled();
      expect(mockLearningLoopService.getPatterns).not.toHaveBeenCalled();
      expect(mockLearningLoopService.getSessionHistory).not.toHaveBeenCalled();
    });

    it('should not load data before initialization', async () => {
      mockLearningLoopService.initialize.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderHook(() => useLearningLoop(mockUser));

      expect(mockLearningLoopService.getUnacknowledgedInsights).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(mockLearningLoopService.getUnacknowledgedInsights).toHaveBeenCalled();
      });
    });

    it('should handle data loading errors', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockLearningLoopService.getUnacknowledgedInsights.mockRejectedValue(
        new Error('Load failed')
      );

      const { result } = renderHook(() => useLearningLoop(mockUser));

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'Failed to load learning data:',
          expect.any(Error)
        );
        expect(result.current.loading).toBe(false);
      });

      consoleError.mockRestore();
    });

    it('should request last 5 sessions', async () => {
      renderHook(() => useLearningLoop(mockUser));

      await waitFor(() => {
        expect(mockLearningLoopService.getSessionHistory).toHaveBeenCalledWith('user123', 5);
      });
    });
  });

  describe('trackAppLaunch', () => {
    it('should track app launch successfully', async () => {
      mockLearningLoopService.trackAppLaunch.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLearningLoop(mockUser));

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      await act(async () => {
        await result.current.trackAppLaunch('app1', 'Test App');
      });

      expect(mockLearningLoopService.trackAppLaunch).toHaveBeenCalledWith('app1', 'Test App');
    });

    it('should not track if not initialized', async () => {
      const { result } = renderHook(() => useLearningLoop(null));

      await act(async () => {
        await result.current.trackAppLaunch('app1', 'Test App');
      });

      expect(mockLearningLoopService.trackAppLaunch).not.toHaveBeenCalled();
    });

    it('should handle tracking errors', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockLearningLoopService.trackAppLaunch.mockRejectedValue(new Error('Track failed'));

      const { result } = renderHook(() => useLearningLoop(mockUser));

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      await act(async () => {
        await result.current.trackAppLaunch('app1', 'Test App');
      });

      expect(consoleError).toHaveBeenCalledWith(
        'Failed to track app launch:',
        expect.any(Error)
      );

      consoleError.mockRestore();
    });
  });

  describe('trackCommand', () => {
    it('should track successful command', async () => {
      mockLearningLoopService.trackCommand.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLearningLoop(mockUser));

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      await act(async () => {
        await result.current.trackCommand('test-command', true);
      });

      expect(mockLearningLoopService.trackCommand).toHaveBeenCalledWith(
        'test-command',
        true,
        undefined
      );
    });

    it('should track failed command with error message', async () => {
      mockLearningLoopService.trackCommand.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLearningLoop(mockUser));

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      await act(async () => {
        await result.current.trackCommand('failing-command', false, 'Command error');
      });

      expect(mockLearningLoopService.trackCommand).toHaveBeenCalledWith(
        'failing-command',
        false,
        'Command error'
      );
    });

    it('should not track if not initialized', async () => {
      const { result } = renderHook(() => useLearningLoop(null));

      await act(async () => {
        await result.current.trackCommand('command', true);
      });

      expect(mockLearningLoopService.trackCommand).not.toHaveBeenCalled();
    });
  });

  describe('trackFileOperation', () => {
    it('should track file operation successfully', async () => {
      mockLearningLoopService.trackFileOperation.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLearningLoop(mockUser));

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      await act(async () => {
        await result.current.trackFileOperation('read', '/path/to/file.txt', true);
      });

      expect(mockLearningLoopService.trackFileOperation).toHaveBeenCalledWith(
        'read',
        '/path/to/file.txt',
        true
      );
    });

    it('should not track if not initialized', async () => {
      const { result } = renderHook(() => useLearningLoop(null));

      await act(async () => {
        await result.current.trackFileOperation('write', '/file.txt', true);
      });

      expect(mockLearningLoopService.trackFileOperation).not.toHaveBeenCalled();
    });
  });

  describe('trackAIInteraction', () => {
    it('should track AI interaction successfully', async () => {
      mockLearningLoopService.trackAIInteraction.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLearningLoop(mockUser));

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      await act(async () => {
        await result.current.trackAIInteraction(
          'Test prompt',
          'AI response',
          'gpt-4',
          1500
        );
      });

      expect(mockLearningLoopService.trackAIInteraction).toHaveBeenCalledWith(
        'Test prompt',
        'AI response',
        'gpt-4',
        1500
      );
    });

    it('should not track if not initialized', async () => {
      const { result } = renderHook(() => useLearningLoop(null));

      await act(async () => {
        await result.current.trackAIInteraction('prompt', 'response', 'model', 1000);
      });

      expect(mockLearningLoopService.trackAIInteraction).not.toHaveBeenCalled();
    });
  });

  describe('acknowledgeInsight', () => {
    it('should acknowledge insight and remove from list', async () => {
      mockLearningLoopService.acknowledgeInsight.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLearningLoop(mockUser));

      await waitFor(() => {
        expect(result.current.insights).toEqual(mockInsights);
      });

      await act(async () => {
        await result.current.acknowledgeInsight('1');
      });

      expect(mockLearningLoopService.acknowledgeInsight).toHaveBeenCalledWith('1');
      expect(result.current.insights).toEqual([mockInsights[1]]);
    });

    it('should handle acknowledge errors', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockLearningLoopService.acknowledgeInsight.mockRejectedValue(
        new Error('Acknowledge failed')
      );

      const { result } = renderHook(() => useLearningLoop(mockUser));

      await waitFor(() => {
        expect(result.current.insights).toEqual(mockInsights);
      });

      await act(async () => {
        await result.current.acknowledgeInsight('1');
      });

      expect(consoleError).toHaveBeenCalledWith(
        'Failed to acknowledge insight:',
        expect.any(Error)
      );

      consoleError.mockRestore();
    });
  });

  describe('refresh', () => {
    it('should refresh all data', async () => {
      const { result } = renderHook(() => useLearningLoop(mockUser));

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      jest.clearAllMocks();

      const newInsights = [{ id: '3', type: 'new', message: 'New insight', acknowledged: false }];
      mockLearningLoopService.getUnacknowledgedInsights.mockResolvedValue(newInsights);

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockLearningLoopService.getUnacknowledgedInsights).toHaveBeenCalledWith('user123');
      expect(mockLearningLoopService.getPatterns).toHaveBeenCalledWith('user123');
      expect(mockLearningLoopService.getSessionHistory).toHaveBeenCalledWith('user123', 5);
      expect(result.current.insights).toEqual(newInsights);
    });

    it('should not refresh without user', async () => {
      const { result } = renderHook(() => useLearningLoop(null));

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockLearningLoopService.getUnacknowledgedInsights).not.toHaveBeenCalled();
    });

    it('should not refresh before initialization', async () => {
      const { result } = renderHook(() => useLearningLoop(mockUser));

      // Don't wait for initialization
      jest.clearAllMocks();

      await act(async () => {
        await result.current.refresh();
      });

      // Should not call service methods if not initialized
      expect(mockLearningLoopService.getUnacknowledgedInsights).not.toHaveBeenCalled();
    });

    it('should handle refresh errors', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockLearningLoopService.getUnacknowledgedInsights.mockRejectedValue(
        new Error('Refresh failed')
      );

      const { result } = renderHook(() => useLearningLoop(mockUser));

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      jest.clearAllMocks();

      await act(async () => {
        await result.current.refresh();
      });

      expect(consoleError).toHaveBeenCalledWith(
        'Failed to refresh learning data:',
        expect.any(Error)
      );

      consoleError.mockRestore();
    });
  });

  describe('Multiple Users', () => {
    it('should reinitialize when user changes', async () => {
      const { rerender } = renderHook(
        ({ user }) => useLearningLoop(user),
        { initialProps: { user: mockUser } }
      );

      await waitFor(() => {
        expect(mockLearningLoopService.initialize).toHaveBeenCalledWith('user123');
      });

      jest.clearAllMocks();

      const newUser = { uid: 'user456', email: 'new@example.com' };
      rerender({ user: newUser });

      await waitFor(() => {
        expect(mockLearningLoopService.initialize).toHaveBeenCalledWith('user456');
      });
    });

    it('should not reinitialize with same user', async () => {
      const { rerender } = renderHook(
        ({ user }) => useLearningLoop(user),
        { initialProps: { user: mockUser } }
      );

      await waitFor(() => {
        expect(mockLearningLoopService.initialize).toHaveBeenCalledTimes(1);
      });

      jest.clearAllMocks();

      rerender({ user: mockUser });

      expect(mockLearningLoopService.initialize).not.toHaveBeenCalled();
    });
  });
});
