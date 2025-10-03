# @auraos/firebase

Firebase integration package for AuraOS - provides Firestore services, authentication, and real-time data management.

## 📦 Features

- **Firestore Services** - Complete CRUD operations for all collections
- **User Profile Management** - User data, preferences, and statistics
- **Learning Loop Integration** - Sessions, activities, insights, and patterns
- **Real-time Subscriptions** - Live data updates with onSnapshot
- **Type Safety** - Full TypeScript support with comprehensive types
- **Autopilot Integration** - Rewards and metrics tracking
- **Analytics** - User analytics and goal tracking

## 📋 Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Services](#services)
- [Usage Examples](#usage-examples)
- [Type Definitions](#type-definitions)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🔧 Installation

```bash
# From monorepo root
pnpm install

# Or install package directly
pnpm add @auraos/firebase
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Firebase Setup

The package automatically initializes Firebase with your configuration:

```typescript
import { app, db, auth, storage, analytics } from '@auraos/firebase';

// All services are ready to use
console.log('Firebase initialized:', app.name);
```

## 🛠️ Services

### User Profile Service

Manage user profiles, preferences, and statistics.

```typescript
import { firestoreService } from '@auraos/firebase';

const { user } = firestoreService;
```

**Methods:**

| Method | Description |
|--------|-------------|
| `create(uid, data)` | Create new user profile |
| `get(uid)` | Get user profile |
| `update(uid, data)` | Update user profile |
| `updatePreferences(uid, prefs)` | Update user preferences |
| `incrementStat(uid, stat, value)` | Increment a statistic |
| `trackAppUsage(uid, appId)` | Track app usage |
| `subscribe(uid, callback)` | Real-time profile updates |

---

### Learning Session Service

Manage learning sessions and track user activity.

```typescript
const { session } = firestoreService;
```

**Methods:**

| Method | Description |
|--------|-------------|
| `create(userId)` | Create new session |
| `get(sessionId)` | Get session details |
| `end(sessionId)` | End active session |
| `getUserSessions(userId, limit)` | Get user's sessions |
| `getActiveSession(userId)` | Get active session |

---

### Activity Service

Track user activities within sessions.

```typescript
const { activity } = firestoreService;
```

**Methods:**

| Method | Description |
|--------|-------------|
| `create(activity)` | Create new activity |
| `getSessionActivities(sessionId)` | Get session activities |
| `getUserActivities(userId, limit)` | Get user activities |

---

### Insight Service

Manage AI-generated insights and suggestions.

```typescript
const { insight } = firestoreService;
```

**Methods:**

| Method | Description |
|--------|-------------|
| `create(insight)` | Create new insight |
| `getUserInsights(userId, limit)` | Get user insights |
| `acknowledge(insightId)` | Mark insight as acknowledged |
| `getUnacknowledged(userId)` | Get unacknowledged insights |

---

### Learning Pattern Service

Track and analyze user behavior patterns.

```typescript
const { pattern } = firestoreService;
```

**Methods:**

| Method | Description |
|--------|-------------|
| `create(pattern)` | Create new pattern |
| `update(patternId, data)` | Update pattern |
| `getUserPatterns(userId)` | Get user patterns |
| `incrementFrequency(patternId)` | Increment pattern frequency |

---

### User Goal Service

Manage user goals and milestones.

```typescript
const { goal } = firestoreService;
```

**Methods:**

| Method | Description |
|--------|-------------|
| `create(goal)` | Create new goal |
| `update(goalId, data)` | Update goal |
| `getUserGoals(userId)` | Get user goals |
| `delete(goalId)` | Delete goal |

---

### Rewards Service

Manage user rewards, achievements, and badges.

```typescript
const { rewards } = firestoreService;
```

**Methods:**

| Method | Description |
|--------|-------------|
| `create(userId, rewards)` | Create rewards profile |
| `get(userId)` | Get user rewards |
| `update(userId, rewards)` | Update rewards |
| `incrementStats(userId, stats)` | Increment reward stats |
| `getLeaderboard(limit)` | Get top users |

---

### Autopilot Services

Track autopilot rewards and metrics.

```typescript
const { autopilotRewards, autopilotMetrics } = firestoreService;
```

**Autopilot Rewards Methods:**

| Method | Description |
|--------|-------------|
| `create(reward)` | Create reward entry |
| `getRecent(limit)` | Get recent rewards |

**Autopilot Metrics Methods:**

| Method | Description |
|--------|-------------|
| `get(autopilotId)` | Get metrics |
| `update(autopilotId, metrics)` | Update metrics |

---

## 💡 Usage Examples

### Creating a User Profile

```typescript
import { firestoreService } from '@auraos/firebase';

async function createUser(uid: string, email: string, displayName: string) {
  await firestoreService.user.create(uid, {
    email,
    displayName,
    photoURL: null,
    isGuest: false,
    preferences: {
      theme: 'dark',
      language: 'en',
      notifications: true,
      autoSave: true,
      desktopLayout: {
        wallpaper: 'default',
        iconSize: 'medium',
        taskbarPosition: 'bottom',
        pinnedApps: ['terminal', 'files'],
      },
    },
  });
  
  console.log('User profile created');
}
```

---

### Getting User Profile

```typescript
async function getUserProfile(uid: string) {
  const profile = await firestoreService.user.get(uid);
  
  if (!profile) {
    console.log('User not found');
    return;
  }
  
  console.log('User:', profile.displayName);
  console.log('Theme:', profile.preferences.theme);
  console.log('Total sessions:', profile.stats.totalSessions);
}
```

---

### Real-time Profile Updates

```typescript
import { useEffect, useState } from 'react';
import { firestoreService } from '@auraos/firebase';

function UserProfileComponent({ uid }: { uid: string }) {
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = firestoreService.user.subscribe(uid, (updatedProfile) => {
      setProfile(updatedProfile);
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, [uid]);
  
  if (!profile) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{profile.displayName}</h1>
      <p>Sessions: {profile.stats.totalSessions}</p>
    </div>
  );
}
```

---

### Managing Learning Sessions

```typescript
async function startLearningSession(userId: string) {
  // Create new session
  const sessionId = await firestoreService.session.create(userId);
  console.log('Session started:', sessionId);
  
  // Track activities
  await firestoreService.activity.create({
    sessionId,
    type: 'app_launch',
    appId: 'terminal',
    data: { command: 'ls' },
    metadata: {
      success: true,
      duration: 1500,
    },
  });
  
  // End session after work
  await firestoreService.session.end(sessionId);
  console.log('Session ended');
}
```

---

### Creating Insights

```typescript
async function generateInsight(userId: string, sessionId: string) {
  await firestoreService.insight.create({
    sessionId,
    userId,
    type: 'suggestion',
    title: 'Productivity Tip',
    description: 'You use the terminal frequently. Consider creating aliases for common commands.',
    data: {
      commandFrequency: {
        'git status': 15,
        'npm run dev': 10,
      },
    },
    priority: 'medium',
    acknowledged: false,
  });
  
  console.log('Insight created');
}
```

---

### Tracking User Goals

```typescript
async function createGoal(userId: string) {
  const goalId = await firestoreService.goal.create({
    userId,
    title: 'Learn TypeScript',
    description: 'Complete TypeScript fundamentals course',
    category: 'learning',
    targetDate: new Date('2025-12-31'),
    progress: 0,
    status: 'active',
    milestones: [
      {
        id: '1',
        title: 'Complete basic types',
        completed: false,
        completedAt: null,
      },
      {
        id: '2',
        title: 'Learn interfaces',
        completed: false,
        completedAt: null,
      },
    ],
  });
  
  console.log('Goal created:', goalId);
  
  // Update progress
  await firestoreService.goal.update(goalId, {
    progress: 25,
  });
}
```

---

### Updating User Preferences

```typescript
async function updateTheme(uid: string, theme: 'light' | 'dark' | 'auto') {
  await firestoreService.user.updatePreferences(uid, {
    theme,
  });
  
  console.log('Theme updated to:', theme);
}
```

---

### Tracking App Usage

```typescript
async function trackAppLaunch(uid: string, appId: string) {
  // Increment app usage counter
  await firestoreService.user.trackAppUsage(uid, appId);
  
  // Increment total sessions
  await firestoreService.user.incrementStat(uid, 'totalSessions', 1);
  
  console.log('App usage tracked');
}
```

---

### Getting User Analytics

```typescript
async function getUserAnalytics(userId: string) {
  // Get recent sessions
  const sessions = await firestoreService.session.getUserSessions(userId, 10);
  
  // Get insights
  const insights = await firestoreService.insight.getUserInsights(userId, 20);
  
  // Get patterns
  const patterns = await firestoreService.pattern.getUserPatterns(userId);
  
  // Get goals
  const goals = await firestoreService.goal.getUserGoals(userId);
  
  console.log('Analytics:', {
    totalSessions: sessions.length,
    totalInsights: insights.length,
    detectedPatterns: patterns.length,
    activeGoals: goals.filter(g => g.status === 'active').length,
  });
}
```

---

### Managing Rewards

```typescript
async function updateUserRewards(userId: string) {
  // Get current rewards
  const rewards = await firestoreService.rewards.get(userId);
  
  if (!rewards) {
    // Create initial rewards
    await firestoreService.rewards.create(userId, {
      totalPoints: 0,
      level: 1,
      streak: 0,
      lastActiveDate: new Date(),
      achievements: [],
      badges: [],
      stats: {
        sessionsCompleted: 0,
        insightsGenerated: 0,
        goalsAchieved: 0,
      },
    });
  } else {
    // Increment stats
    await firestoreService.rewards.incrementStats(userId, {
      sessionsCompleted: 1,
      insightsGenerated: 3,
    });
  }
  
  console.log('Rewards updated');
}
```

---

## 📝 Type Definitions

### UserProfile

```typescript
interface UserProfile {
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
```

### UserPreferences

```typescript
interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  autoSave: boolean;
  desktopLayout: DesktopLayout;
}
```

### LearningSession

```typescript
interface LearningSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // seconds
  activities: Activity[];
  insights: Insight[];
  status: 'active' | 'completed' | 'abandoned';
}
```

### Activity

```typescript
interface Activity {
  id: string;
  sessionId: string;
  timestamp: Date;
  type: 'app_launch' | 'file_operation' | 'command_execution' | 'ai_interaction' | 'custom';
  appId?: string;
  data: Record<string, any>;
  metadata: ActivityMetadata;
}
```

### Insight

```typescript
interface Insight {
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
```

See [types/user.ts](./src/types/user.ts) for complete type definitions.

---

## 🎯 Best Practices

### Error Handling

```typescript
async function safeGetUser(uid: string) {
  try {
    const profile = await firestoreService.user.get(uid);
    return profile;
  } catch (error) {
    console.error('Error fetching user:', error);
    // Handle error appropriately
    return null;
  }
}
```

### Batch Operations

```typescript
async function batchUpdateUsers(userIds: string[]) {
  const promises = userIds.map(uid =>
    firestoreService.user.incrementStat(uid, 'totalSessions', 1)
  );
  
  await Promise.all(promises);
  console.log('Batch update complete');
}
```

### Subscription Cleanup

```typescript
useEffect(() => {
  const unsubscribe = firestoreService.user.subscribe(uid, handleUpdate);
  
  // Always cleanup subscriptions
  return () => {
    unsubscribe();
  };
}, [uid]);
```

### Optimistic Updates

```typescript
async function updateUserOptimistically(uid: string, data: Partial<UserProfile>) {
  // Update UI immediately
  setLocalProfile({ ...localProfile, ...data });
  
  try {
    // Update Firestore
    await firestoreService.user.update(uid, data);
  } catch (error) {
    // Revert on error
    setLocalProfile(originalProfile);
    console.error('Update failed:', error);
  }
}
```

### Pagination

```typescript
async function loadMoreSessions(userId: string, lastSession: LearningSession) {
  // Use Firestore pagination
  const sessionsRef = collection(db, 'learning_sessions');
  const q = query(
    sessionsRef,
    where('userId', '==', userId),
    orderBy('startTime', 'desc'),
    startAfter(lastSession.startTime),
    limit(10)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}
```

---

## 🐛 Troubleshooting

### Firebase Not Initialized

**Error:** `Firebase: No Firebase App '[DEFAULT]' has been created`

**Solution:**
```typescript
// Ensure you import from the package
import { db, auth } from '@auraos/firebase';

// Not from firebase directly
// import { getFirestore } from 'firebase/firestore'; // ❌
```

---

### Environment Variables Not Found

**Error:** `Firebase configuration is missing`

**Solution:**
```bash
# Check .env file exists
ls -la .env

# Verify variables are prefixed with VITE_
cat .env | grep VITE_FIREBASE

# Restart dev server after adding variables
pnpm dev
```

---

### Permission Denied

**Error:** `FirebaseError: Missing or insufficient permissions`

**Solution:**
- Check Firestore security rules
- Verify user is authenticated
- Ensure user has required permissions

```javascript
// Check authentication
import { auth } from '@auraos/firebase';

if (!auth.currentUser) {
  console.error('User not authenticated');
}
```

---

### Timestamp Conversion Errors

**Error:** `Cannot read property 'toDate' of undefined`

**Solution:**
```typescript
// Always check for null/undefined
const date = data.createdAt?.toDate() || new Date();

// Or use optional chaining
const timestamp = data.timestamp?.toDate();
```

---

### Real-time Listener Memory Leaks

**Problem:** Subscriptions not cleaned up

**Solution:**
```typescript
useEffect(() => {
  const unsubscribe = firestoreService.user.subscribe(uid, callback);
  
  // ALWAYS return cleanup function
  return () => unsubscribe();
}, [uid]);
```

---

## 📚 Firestore Collections

| Collection | Description |
|------------|-------------|
| `users` | User profiles and preferences |
| `learning_sessions` | Learning session data |
| `activities` | User activities within sessions |
| `insights` | AI-generated insights |
| `learning_patterns` | Detected behavior patterns |
| `user_goals` | User goals and milestones |
| `analytics` | User analytics data |
| `user_rewards` | Rewards and achievements |
| `autopilot_rewards` | Autopilot reward history |
| `autopilot_metrics` | Autopilot performance metrics |

---

## 🔗 Related Documentation

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Auth Guide](../../docs/FIREBASE_AUTH_GUIDE.md)
- [Firestore Schema](../../docs/FIRESTORE_SCHEMA.md)

---

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**Made with ❤️ for AuraOS**
