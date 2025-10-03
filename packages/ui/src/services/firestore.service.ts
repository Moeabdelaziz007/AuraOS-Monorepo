/**
 * Firestore Service
 * Real-time database operations for user data and learning loop
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  UserProfile,
  UserPreferences,
  LearningSession,
  Activity,
  Insight,
  LearningPattern,
  UserGoal,
  UserAnalytics,
} from '../types/user';

const COLLECTIONS = {
  USERS: 'users',
  SESSIONS: 'learning_sessions',
  ACTIVITIES: 'activities',
  INSIGHTS: 'insights',
  PATTERNS: 'learning_patterns',
  GOALS: 'user_goals',
  ANALYTICS: 'analytics',
} as const;

/**
 * User Profile Service
 */
export const userProfileService = {
  async create(uid: string, data: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const now = new Date();
    
    const profile: UserProfile = {
      uid,
      email: data.email || null,
      displayName: data.displayName || null,
      photoURL: data.photoURL || null,
      isGuest: data.isGuest || false,
      createdAt: now,
      updatedAt: now,
      preferences: data.preferences || {
        theme: 'auto',
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
      stats: data.stats || {
        totalSessions: 0,
        totalTimeSpent: 0,
        appsUsed: {},
        lastActive: now,
      },
    };

    await setDoc(userRef, profile);
  },

  async get(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const snapshot = await getDoc(userRef);
    
    if (!snapshot.exists()) return null;
    
    const data = snapshot.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      stats: {
        ...data.stats,
        lastActive: data.stats?.lastActive?.toDate() || new Date(),
      },
    } as UserProfile;
  },

  async update(uid: string, data: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async updatePreferences(uid: string, preferences: Partial<UserPreferences>): Promise<void> {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const current = await this.get(uid);
    
    if (!current) throw new Error('User not found');

    await updateDoc(userRef, {
      preferences: { ...current.preferences, ...preferences },
      updatedAt: serverTimestamp(),
    });
  },

  async incrementStat(uid: string, stat: string, value: number = 1): Promise<void> {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(userRef, {
      [`stats.${stat}`]: increment(value),
      'stats.lastActive': serverTimestamp(),
    });
  },

  async trackAppUsage(uid: string, appId: string): Promise<void> {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(userRef, {
      [`stats.appsUsed.${appId}`]: increment(1),
      'stats.lastActive': serverTimestamp(),
    });
  },

  subscribe(uid: string, callback: (profile: UserProfile | null) => void): Unsubscribe {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    return onSnapshot(userRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      const data = snapshot.data();
      callback({
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        stats: {
          ...data.stats,
          lastActive: data.stats?.lastActive?.toDate() || new Date(),
        },
      } as UserProfile);
    });
  },
};

/**
 * Learning Session Service
 */
export const learningSessionService = {
  async create(userId: string): Promise<string> {
    const sessionsRef = collection(db, COLLECTIONS.SESSIONS);
    const now = new Date();
    
    const session: Omit<LearningSession, 'id'> = {
      userId,
      startTime: now,
      endTime: null,
      duration: 0,
      activities: [],
      insights: [],
      status: 'active',
    };

    const docRef = await addDoc(sessionsRef, session);
    return docRef.id;
  },

  async get(sessionId: string): Promise<LearningSession | null> {
    const sessionRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
    const snapshot = await getDoc(sessionRef);
    
    if (!snapshot.exists()) return null;
    
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
      startTime: data.startTime?.toDate() || new Date(),
      endTime: data.endTime?.toDate() || null,
    } as LearningSession;
  },

  async end(sessionId: string): Promise<void> {
    const session = await this.get(sessionId);
    if (!session) throw new Error('Session not found');

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);

    const sessionRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
    await updateDoc(sessionRef, {
      endTime: serverTimestamp(),
      duration,
      status: 'completed',
    });
  },

  async getUserSessions(userId: string, limitCount: number = 10): Promise<LearningSession[]> {
    const sessionsRef = collection(db, COLLECTIONS.SESSIONS);
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      orderBy('startTime', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startTime: data.startTime?.toDate() || new Date(),
        endTime: data.endTime?.toDate() || null,
      } as LearningSession;
    });
  },

  async getActiveSession(userId: string): Promise<LearningSession | null> {
    const sessionsRef = collection(db, COLLECTIONS.SESSIONS);
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      where('status', '==', 'active'),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      startTime: data.startTime?.toDate() || new Date(),
      endTime: data.endTime?.toDate() || null,
    } as LearningSession;
  },
};

/**
 * Activity Service
 */
export const activityService = {
  async create(activity: Omit<Activity, 'id'>): Promise<string> {
    const activitiesRef = collection(db, COLLECTIONS.ACTIVITIES);
    const docRef = await addDoc(activitiesRef, {
      ...activity,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  },

  async getSessionActivities(sessionId: string): Promise<Activity[]> {
    const activitiesRef = collection(db, COLLECTIONS.ACTIVITIES);
    const q = query(
      activitiesRef,
      where('sessionId', '==', sessionId),
      orderBy('timestamp', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      } as Activity;
    });
  },

  async getUserActivities(userId: string, limitCount: number = 50): Promise<Activity[]> {
    const activitiesRef = collection(db, COLLECTIONS.ACTIVITIES);
    
    // Get user's sessions first
    const sessions = await learningSessionService.getUserSessions(userId, 10);
    const sessionIds = sessions.map(s => s.id);

    if (sessionIds.length === 0) return [];

    const q = query(
      activitiesRef,
      where('sessionId', 'in', sessionIds),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      } as Activity;
    });
  },
};

/**
 * Insight Service
 */
export const insightService = {
  async create(insight: Omit<Insight, 'id'>): Promise<string> {
    const insightsRef = collection(db, COLLECTIONS.INSIGHTS);
    const docRef = await addDoc(insightsRef, {
      ...insight,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  },

  async getUserInsights(userId: string, limitCount: number = 20): Promise<Insight[]> {
    const insightsRef = collection(db, COLLECTIONS.INSIGHTS);
    const q = query(
      insightsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      } as Insight;
    });
  },

  async acknowledge(insightId: string): Promise<void> {
    const insightRef = doc(db, COLLECTIONS.INSIGHTS, insightId);
    await updateDoc(insightRef, {
      acknowledged: true,
    });
  },

  async getUnacknowledged(userId: string): Promise<Insight[]> {
    const insightsRef = collection(db, COLLECTIONS.INSIGHTS);
    const q = query(
      insightsRef,
      where('userId', '==', userId),
      where('acknowledged', '==', false),
      orderBy('priority', 'desc'),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      } as Insight;
    });
  },
};

/**
 * Learning Pattern Service
 */
export const learningPatternService = {
  async create(pattern: Omit<LearningPattern, 'id'>): Promise<string> {
    const patternsRef = collection(db, COLLECTIONS.PATTERNS);
    const docRef = await addDoc(patternsRef, {
      ...pattern,
      firstDetected: serverTimestamp(),
      lastDetected: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(patternId: string, data: Partial<LearningPattern>): Promise<void> {
    const patternRef = doc(db, COLLECTIONS.PATTERNS, patternId);
    await updateDoc(patternRef, {
      ...data,
      lastDetected: serverTimestamp(),
    });
  },

  async getUserPatterns(userId: string): Promise<LearningPattern[]> {
    const patternsRef = collection(db, COLLECTIONS.PATTERNS);
    const q = query(
      patternsRef,
      where('userId', '==', userId),
      orderBy('confidence', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        firstDetected: data.firstDetected?.toDate() || new Date(),
        lastDetected: data.lastDetected?.toDate() || new Date(),
      } as LearningPattern;
    });
  },

  async incrementFrequency(patternId: string): Promise<void> {
    const patternRef = doc(db, COLLECTIONS.PATTERNS, patternId);
    await updateDoc(patternRef, {
      frequency: increment(1),
      lastDetected: serverTimestamp(),
    });
  },
};

/**
 * User Goal Service
 */
export const userGoalService = {
  async create(goal: Omit<UserGoal, 'id'>): Promise<string> {
    const goalsRef = collection(db, COLLECTIONS.GOALS);
    const docRef = await addDoc(goalsRef, {
      ...goal,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(goalId: string, data: Partial<UserGoal>): Promise<void> {
    const goalRef = doc(db, COLLECTIONS.GOALS, goalId);
    await updateDoc(goalRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async getUserGoals(userId: string): Promise<UserGoal[]> {
    const goalsRef = collection(db, COLLECTIONS.GOALS);
    const q = query(
      goalsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        targetDate: data.targetDate?.toDate() || null,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as UserGoal;
    });
  },

  async delete(goalId: string): Promise<void> {
    const goalRef = doc(db, COLLECTIONS.GOALS, goalId);
    await deleteDoc(goalRef);
  },
};

export const firestoreService = {
  user: userProfileService,
  session: learningSessionService,
  activity: activityService,
  insight: insightService,
  pattern: learningPatternService,
  goal: userGoalService,
};
