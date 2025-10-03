/**
 * Firestore Service Tests
 * Tests for user profile and learning session services
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { UserProfile, LearningSession } from '../types/user';

// Mock Firestore
const mockFirestore = {
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  addDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
};

// Mock Firebase
vi.mock('../config/firebase', () => ({
  db: mockFirestore,
}));

// Import services after mocking
import {
  userProfileService,
  learningSessionService,
  activityService,
  insightService,
} from '../services/firestore.service';

describe('User Profile Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user profile', async () => {
      const uid = 'user_123';
      const userData = {
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        isGuest: false,
      };

      mockFirestore.setDoc.mockResolvedValue(undefined);

      await userProfileService.create(uid, userData);

      expect(mockFirestore.setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          uid,
          email: userData.email,
          displayName: userData.displayName,
          isGuest: false,
        })
      );
    });

    it('should create profile with default preferences', async () => {
      const uid = 'user_123';
      mockFirestore.setDoc.mockResolvedValue(undefined);

      await userProfileService.create(uid, {
        email: 'test@example.com',
      });

      expect(mockFirestore.setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          preferences: expect.objectContaining({
            theme: 'auto',
            language: 'en',
            notifications: true,
            autoSave: true,
          }),
        })
      );
    });

    it('should initialize stats with zero values', async () => {
      const uid = 'user_123';
      mockFirestore.setDoc.mockResolvedValue(undefined);

      await userProfileService.create(uid, {
        email: 'test@example.com',
      });

      expect(mockFirestore.setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          stats: expect.objectContaining({
            totalSessions: 0,
            totalTimeSpent: 0,
            appsUsed: {},
          }),
        })
      );
    });
  });

  describe('get', () => {
    it('should return user profile if exists', async () => {
      const uid = 'user_123';
      const mockProfile = {
        uid,
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        isGuest: false,
        createdAt: { toDate: () => new Date('2025-01-01') },
        updatedAt: { toDate: () => new Date('2025-01-02') },
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: true,
          autoSave: true,
          desktopLayout: {
            wallpaper: 'default',
            iconSize: 'medium',
            taskbarPosition: 'bottom',
            pinnedApps: [],
          },
        },
        stats: {
          totalSessions: 5,
          totalTimeSpent: 3600,
          appsUsed: { terminal: 10 },
          lastActive: { toDate: () => new Date('2025-01-02') },
        },
      };

      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockProfile,
      });

      const profile = await userProfileService.get(uid);

      expect(profile).toBeDefined();
      expect(profile?.uid).toBe(uid);
      expect(profile?.email).toBe('test@example.com');
      expect(profile?.stats.totalSessions).toBe(5);
    });

    it('should return null if user does not exist', async () => {
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => false,
      });

      const profile = await userProfileService.get('nonexistent');

      expect(profile).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user profile', async () => {
      const uid = 'user_123';
      const updateData = {
        displayName: 'Updated Name',
      };

      mockFirestore.updateDoc.mockResolvedValue(undefined);

      await userProfileService.update(uid, updateData);

      expect(mockFirestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          displayName: 'Updated Name',
        })
      );
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      const uid = 'user_123';
      const currentProfile = {
        uid,
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        isGuest: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: {
          theme: 'auto' as const,
          language: 'en',
          notifications: true,
          autoSave: true,
          desktopLayout: {
            wallpaper: 'default',
            iconSize: 'medium' as const,
            taskbarPosition: 'bottom' as const,
            pinnedApps: [],
          },
        },
        stats: {
          totalSessions: 0,
          totalTimeSpent: 0,
          appsUsed: {},
          lastActive: new Date(),
        },
      };

      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          ...currentProfile,
          createdAt: { toDate: () => currentProfile.createdAt },
          updatedAt: { toDate: () => currentProfile.updatedAt },
          stats: {
            ...currentProfile.stats,
            lastActive: { toDate: () => currentProfile.stats.lastActive },
          },
        }),
      });

      mockFirestore.updateDoc.mockResolvedValue(undefined);

      await userProfileService.updatePreferences(uid, {
        theme: 'dark',
      });

      expect(mockFirestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          preferences: expect.objectContaining({
            theme: 'dark',
          }),
        })
      );
    });

    it('should throw error if user not found', async () => {
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => false,
      });

      await expect(
        userProfileService.updatePreferences('nonexistent', { theme: 'dark' })
      ).rejects.toThrow('User not found');
    });
  });

  describe('incrementStat', () => {
    it('should increment user statistic', async () => {
      const uid = 'user_123';
      mockFirestore.updateDoc.mockResolvedValue(undefined);

      await userProfileService.incrementStat(uid, 'totalSessions', 1);

      expect(mockFirestore.updateDoc).toHaveBeenCalled();
    });
  });

  describe('trackAppUsage', () => {
    it('should track app usage', async () => {
      const uid = 'user_123';
      const appId = 'terminal';
      mockFirestore.updateDoc.mockResolvedValue(undefined);

      await userProfileService.trackAppUsage(uid, appId);

      expect(mockFirestore.updateDoc).toHaveBeenCalled();
    });
  });

  describe('subscribe', () => {
    it('should subscribe to profile updates', () => {
      const uid = 'user_123';
      const callback = vi.fn();
      const unsubscribe = vi.fn();

      mockFirestore.onSnapshot.mockReturnValue(unsubscribe);

      const unsub = userProfileService.subscribe(uid, callback);

      expect(mockFirestore.onSnapshot).toHaveBeenCalled();
      expect(typeof unsub).toBe('function');
    });
  });
});

describe('Learning Session Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new learning session', async () => {
      const userId = 'user_123';
      const mockDocRef = { id: 'session_456' };

      mockFirestore.addDoc.mockResolvedValue(mockDocRef);

      const sessionId = await learningSessionService.create(userId);

      expect(sessionId).toBe('session_456');
      expect(mockFirestore.addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId,
          status: 'active',
          activities: [],
          insights: [],
        })
      );
    });
  });

  describe('get', () => {
    it('should return session if exists', async () => {
      const sessionId = 'session_123';
      const mockSession = {
        userId: 'user_123',
        startTime: { toDate: () => new Date('2025-01-01T10:00:00') },
        endTime: null,
        duration: 0,
        activities: [],
        insights: [],
        status: 'active',
      };

      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        id: sessionId,
        data: () => mockSession,
      });

      const session = await learningSessionService.get(sessionId);

      expect(session).toBeDefined();
      expect(session?.id).toBe(sessionId);
      expect(session?.status).toBe('active');
    });

    it('should return null if session does not exist', async () => {
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => false,
      });

      const session = await learningSessionService.get('nonexistent');

      expect(session).toBeNull();
    });
  });

  describe('end', () => {
    it('should end active session', async () => {
      const sessionId = 'session_123';
      const mockSession = {
        id: sessionId,
        userId: 'user_123',
        startTime: new Date('2025-01-01T10:00:00'),
        endTime: null,
        duration: 0,
        activities: [],
        insights: [],
        status: 'active',
      };

      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        id: sessionId,
        data: () => ({
          ...mockSession,
          startTime: { toDate: () => mockSession.startTime },
        }),
      });

      mockFirestore.updateDoc.mockResolvedValue(undefined);

      await learningSessionService.end(sessionId);

      expect(mockFirestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'completed',
        })
      );
    });

    it('should throw error if session not found', async () => {
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => false,
      });

      await expect(learningSessionService.end('nonexistent')).rejects.toThrow(
        'Session not found'
      );
    });
  });

  describe('getUserSessions', () => {
    it('should return user sessions', async () => {
      const userId = 'user_123';
      const mockSessions = [
        {
          id: 'session_1',
          userId,
          startTime: { toDate: () => new Date('2025-01-01') },
          endTime: { toDate: () => new Date('2025-01-01') },
          duration: 3600,
          activities: [],
          insights: [],
          status: 'completed',
        },
      ];

      mockFirestore.getDocs.mockResolvedValue({
        docs: mockSessions.map((session) => ({
          id: session.id,
          data: () => session,
        })),
      });

      const sessions = await learningSessionService.getUserSessions(userId);

      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('session_1');
    });
  });

  describe('getActiveSession', () => {
    it('should return active session if exists', async () => {
      const userId = 'user_123';
      const mockSession = {
        id: 'session_active',
        userId,
        startTime: { toDate: () => new Date() },
        endTime: null,
        duration: 0,
        activities: [],
        insights: [],
        status: 'active',
      };

      mockFirestore.getDocs.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: mockSession.id,
            data: () => mockSession,
          },
        ],
      });

      const session = await learningSessionService.getActiveSession(userId);

      expect(session).toBeDefined();
      expect(session?.status).toBe('active');
    });

    it('should return null if no active session', async () => {
      mockFirestore.getDocs.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const session = await learningSessionService.getActiveSession('user_123');

      expect(session).toBeNull();
    });
  });
});

describe('Activity Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new activity', async () => {
      const activity = {
        sessionId: 'session_123',
        type: 'app_launch' as const,
        appId: 'terminal',
        data: { command: 'ls' },
        metadata: {
          success: true,
          duration: 1500,
        },
      };

      const mockDocRef = { id: 'activity_456' };
      mockFirestore.addDoc.mockResolvedValue(mockDocRef);

      const activityId = await activityService.create(activity);

      expect(activityId).toBe('activity_456');
      expect(mockFirestore.addDoc).toHaveBeenCalled();
    });
  });

  describe('getSessionActivities', () => {
    it('should return activities for session', async () => {
      const sessionId = 'session_123';
      const mockActivities = [
        {
          id: 'activity_1',
          sessionId,
          timestamp: { toDate: () => new Date() },
          type: 'app_launch',
          appId: 'terminal',
          data: {},
          metadata: { success: true },
        },
      ];

      mockFirestore.getDocs.mockResolvedValue({
        docs: mockActivities.map((activity) => ({
          id: activity.id,
          data: () => activity,
        })),
      });

      const activities = await activityService.getSessionActivities(sessionId);

      expect(activities).toHaveLength(1);
      expect(activities[0].sessionId).toBe(sessionId);
    });
  });
});

describe('Insight Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new insight', async () => {
      const insight = {
        sessionId: 'session_123',
        userId: 'user_123',
        type: 'suggestion' as const,
        title: 'Productivity Tip',
        description: 'Use keyboard shortcuts',
        data: {},
        priority: 'medium' as const,
        acknowledged: false,
      };

      const mockDocRef = { id: 'insight_456' };
      mockFirestore.addDoc.mockResolvedValue(mockDocRef);

      const insightId = await insightService.create(insight);

      expect(insightId).toBe('insight_456');
      expect(mockFirestore.addDoc).toHaveBeenCalled();
    });
  });

  describe('acknowledge', () => {
    it('should mark insight as acknowledged', async () => {
      const insightId = 'insight_123';
      mockFirestore.updateDoc.mockResolvedValue(undefined);

      await insightService.acknowledge(insightId);

      expect(mockFirestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          acknowledged: true,
        })
      );
    });
  });

  describe('getUserInsights', () => {
    it('should return user insights', async () => {
      const userId = 'user_123';
      const mockInsights = [
        {
          id: 'insight_1',
          sessionId: 'session_123',
          userId,
          timestamp: { toDate: () => new Date() },
          type: 'suggestion',
          title: 'Tip',
          description: 'Description',
          data: {},
          priority: 'medium',
          acknowledged: false,
        },
      ];

      mockFirestore.getDocs.mockResolvedValue({
        docs: mockInsights.map((insight) => ({
          id: insight.id,
          data: () => insight,
        })),
      });

      const insights = await insightService.getUserInsights(userId);

      expect(insights).toHaveLength(1);
      expect(insights[0].userId).toBe(userId);
    });
  });

  describe('getUnacknowledged', () => {
    it('should return only unacknowledged insights', async () => {
      const userId = 'user_123';
      const mockInsights = [
        {
          id: 'insight_1',
          sessionId: 'session_123',
          userId,
          timestamp: { toDate: () => new Date() },
          type: 'suggestion',
          title: 'Tip',
          description: 'Description',
          data: {},
          priority: 'high',
          acknowledged: false,
        },
      ];

      mockFirestore.getDocs.mockResolvedValue({
        docs: mockInsights.map((insight) => ({
          id: insight.id,
          data: () => insight,
        })),
      });

      const insights = await insightService.getUnacknowledged(userId);

      expect(insights).toHaveLength(1);
      expect(insights[0].acknowledged).toBe(false);
    });
  });
});
