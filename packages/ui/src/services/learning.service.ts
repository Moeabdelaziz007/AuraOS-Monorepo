/**
 * Learning Service
 * Connects UI to Firebase Firestore for learning loop data
 */

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  onSnapshot,
  doc,
  getDoc,
  Timestamp
} from 'firebase/firestore';

// Firebase will be initialized in the component
let db: any = null;

export function initializeLearningService(firestore: any) {
  db = firestore;
}

export interface LearningMetrics {
  patternAccuracy: number;
  insightRelevance: number;
  userEngagement: number;
  adaptationSpeed: number;
  predictionSuccess: number;
  timestamp?: Date;
}

export interface MetaInsight {
  id: string;
  userId: string;
  type: 'optimization' | 'prediction' | 'recommendation' | 'warning';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data: Record<string, any>;
  createdAt: Date;
  appliedAt?: Date;
  effectiveness?: number;
}

export interface Prediction {
  pattern: string;
  confidence: number;
  timeframe: string;
}

export interface MetaPattern {
  id: string;
  userId: string;
  type: 'learning_efficiency' | 'insight_accuracy' | 'pattern_evolution' | 'user_adaptation';
  name: string;
  description: string;
  confidence: number;
  impact: number;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  validationCount: number;
}

/**
 * Get learning metrics for a user
 */
export async function getLearningMetrics(userId: string): Promise<LearningMetrics> {
  if (!db) throw new Error('Learning service not initialized');
  
  try {
    const docRef = doc(db, 'learning_metrics', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        patternAccuracy: data.patternAccuracy || 0,
        insightRelevance: data.insightRelevance || 0,
        userEngagement: data.userEngagement || 0,
        adaptationSpeed: data.adaptationSpeed || 0,
        predictionSuccess: data.predictionSuccess || 0,
        timestamp: data.timestamp?.toDate(),
      };
    }
    
    // Return default metrics if none exist
    return {
      patternAccuracy: 0.65,
      insightRelevance: 0.72,
      userEngagement: 0.58,
      adaptationSpeed: 0.81,
      predictionSuccess: 0.69,
    };
  } catch (error) {
    console.error('Error fetching learning metrics:', error);
    // Return demo data on error
    return {
      patternAccuracy: 0.65,
      insightRelevance: 0.72,
      userEngagement: 0.58,
      adaptationSpeed: 0.81,
      predictionSuccess: 0.69,
    };
  }
}

/**
 * Get meta-insights for a user
 */
export async function getMetaInsights(userId: string, limitCount: number = 10): Promise<MetaInsight[]> {
  if (!db) throw new Error('Learning service not initialized');
  
  try {
    const q = query(
      collection(db, 'meta_insights'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      appliedAt: doc.data().appliedAt?.toDate(),
    } as MetaInsight));
  } catch (error) {
    console.error('Error fetching meta-insights:', error);
    // Return demo data
    return [
      {
        id: '1',
        userId,
        type: 'optimization',
        title: 'Pattern Detection Optimization Available',
        description: 'System has identified opportunities to improve pattern detection accuracy by 15%.',
        actionable: true,
        priority: 'high',
        data: { improvement: 0.15 },
        createdAt: new Date(),
      },
      {
        id: '2',
        userId,
        type: 'prediction',
        title: 'High Engagement Pattern Detected',
        description: 'User shows consistent high engagement during afternoon hours. Consider scheduling important tasks then.',
        actionable: false,
        priority: 'medium',
        data: { timeOfDay: 'afternoon' },
        createdAt: new Date(Date.now() - 3600000),
      },
    ];
  }
}

/**
 * Get predictions for a user
 */
export async function getPredictions(userId: string): Promise<Prediction[]> {
  if (!db) throw new Error('Learning service not initialized');
  
  try {
    const q = query(
      collection(db, 'predictions'),
      where('userId', '==', userId),
      orderBy('confidence', 'desc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Prediction);
  } catch (error) {
    console.error('Error fetching predictions:', error);
    // Return demo data
    return [
      {
        pattern: 'Morning Productivity Workflow',
        confidence: 0.87,
        timeframe: 'next_week',
      },
      {
        pattern: 'Code Review Pattern',
        confidence: 0.79,
        timeframe: 'next_week',
      },
      {
        pattern: 'Documentation Writing Session',
        confidence: 0.72,
        timeframe: 'next_month',
      },
    ];
  }
}

/**
 * Subscribe to real-time learning metrics updates
 */
export function subscribeToMetrics(
  userId: string, 
  callback: (metrics: LearningMetrics) => void
): () => void {
  if (!db) throw new Error('Learning service not initialized');
  
  const docRef = doc(db, 'learning_metrics', userId);
  
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback({
        patternAccuracy: data.patternAccuracy || 0,
        insightRelevance: data.insightRelevance || 0,
        userEngagement: data.userEngagement || 0,
        adaptationSpeed: data.adaptationSpeed || 0,
        predictionSuccess: data.predictionSuccess || 0,
        timestamp: data.timestamp?.toDate(),
      });
    }
  });
}

/**
 * Subscribe to real-time meta-insights updates
 */
export function subscribeToInsights(
  userId: string,
  callback: (insights: MetaInsight[]) => void
): () => void {
  if (!db) throw new Error('Learning service not initialized');
  
  const q = query(
    collection(db, 'meta_insights'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(10)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const insights = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      appliedAt: doc.data().appliedAt?.toDate(),
    } as MetaInsight));
    callback(insights);
  });
}

/**
 * Get meta-patterns for a user
 */
export async function getMetaPatterns(userId: string): Promise<MetaPattern[]> {
  if (!db) throw new Error('Learning service not initialized');
  
  try {
    const q = query(
      collection(db, 'meta_patterns'),
      where('userId', '==', userId),
      orderBy('confidence', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    } as MetaPattern));
  } catch (error) {
    console.error('Error fetching meta-patterns:', error);
    return [];
  }
}
