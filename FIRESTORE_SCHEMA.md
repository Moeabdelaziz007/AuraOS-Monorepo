# Firestore Data Schema

## Collections

### users/{userId}

User profile and subscription data.

```typescript
interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  
  // Subscription data
  subscription?: {
    tier: 'free' | 'pro';
    status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: number; // Unix timestamp
    cancelAtPeriodEnd?: boolean;
    createdAt: number;
    updatedAt: number;
  };
  
  // Usage tracking
  usage?: {
    workflowCount: number;
    executionsThisMonth: number;
    storageUsedGB: number;
    lastResetDate: number; // Unix timestamp
  };
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Example:**
```json
{
  "uid": "user_123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "subscription": {
    "tier": "pro",
    "status": "active",
    "stripeCustomerId": "cus_xxx",
    "stripeSubscriptionId": "sub_xxx",
    "currentPeriodEnd": 1704067200,
    "cancelAtPeriodEnd": false,
    "createdAt": 1701475200000,
    "updatedAt": 1701475200000
  },
  "usage": {
    "workflowCount": 5,
    "executionsThisMonth": 150,
    "storageUsedGB": 2.5,
    "lastResetDate": 1701388800000
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### workflows/{workflowId}

Automation workflows created by users.

```typescript
interface Workflow {
  id: string;
  name: string;
  description?: string;
  owner: string; // userId
  
  // Workflow definition
  trigger: {
    type: 'schedule' | 'webhook' | 'manual';
    config: Record<string, any>;
  };
  actions: Array<{
    type: string;
    config: Record<string, any>;
  }>;
  
  // Status
  enabled: boolean;
  lastRun?: number; // Unix timestamp
  nextRun?: number; // Unix timestamp
  
  // Statistics
  stats: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    lastRunStatus?: 'success' | 'failed';
  };
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### workflow_executions/{executionId}

Execution history for workflows.

```typescript
interface WorkflowExecution {
  id: string;
  workflowId: string;
  userId: string;
  
  // Execution details
  status: 'running' | 'success' | 'failed';
  startedAt: number; // Unix timestamp
  completedAt?: number; // Unix timestamp
  duration?: number; // milliseconds
  
  // Results
  result?: any;
  error?: {
    message: string;
    stack?: string;
  };
  
  // Logs
  logs: Array<{
    timestamp: number;
    level: 'info' | 'warn' | 'error';
    message: string;
  }>;
  
  // Metadata
  createdAt: Timestamp;
}
```

## Security Rules

### User Data
- Users can read their own data
- Users can update their own data (except subscription)
- Subscription data can only be modified by Cloud Functions
- Users cannot delete themselves

### Workflows
- Users can read all workflows (for discovery)
- Users can create workflows (subject to tier limits)
- Users can only update/delete their own workflows

### Workflow Executions
- Users can only read their own executions
- Only Cloud Functions can create executions

## Indexes

Required composite indexes:

```json
{
  "indexes": [
    {
      "collectionGroup": "workflows",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "owner", "order": "ASCENDING" },
        { "fieldPath": "enabled", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "workflow_executions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "workflowId", "order": "ASCENDING" },
        { "fieldPath": "startedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "subscription.stripeCustomerId", "order": "ASCENDING" }
      ]
    }
  ]
}
```

## Usage Tracking

Usage is tracked in the `users/{userId}/usage` subcollection and reset monthly:

```typescript
// Reset usage at the start of each month
async function resetMonthlyUsage(userId: string) {
  await admin.firestore().collection('users').doc(userId).update({
    'usage.executionsThisMonth': 0,
    'usage.lastResetDate': Date.now(),
  });
}
```

## Subscription Lifecycle

### 1. User Upgrades to Pro
```
1. User clicks "Upgrade to Pro"
2. Frontend calls createStripeCheckoutSession()
3. User completes payment on Stripe
4. Stripe sends checkout.session.completed webhook
5. Cloud Function updates user.subscription to pro tier
```

### 2. Subscription Renewal
```
1. Stripe automatically charges customer
2. Stripe sends invoice.payment_succeeded webhook
3. Cloud Function logs successful payment
4. Subscription remains active
```

### 3. Payment Failure
```
1. Stripe fails to charge customer
2. Stripe sends invoice.payment_failed webhook
3. Cloud Function updates subscription.status to 'past_due'
4. User receives email notification
5. After grace period, subscription is canceled
```

### 4. User Cancels Subscription
```
1. User clicks "Cancel Subscription"
2. Frontend calls createStripePortalSession()
3. User cancels in Stripe portal
4. Stripe sends customer.subscription.updated webhook
5. Cloud Function sets cancelAtPeriodEnd = true
6. At period end, subscription is deleted
7. Cloud Function downgrades user to free tier
```

## Migration Script

To add subscription field to existing users:

```typescript
import * as admin from 'firebase-admin';

async function migrateUsers() {
  const usersSnapshot = await admin.firestore().collection('users').get();
  
  const batch = admin.firestore().batch();
  
  usersSnapshot.docs.forEach((doc) => {
    if (!doc.data().subscription) {
      batch.update(doc.ref, {
        subscription: {
          tier: 'free',
          status: 'active',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        usage: {
          workflowCount: 0,
          executionsThisMonth: 0,
          storageUsedGB: 0,
          lastResetDate: Date.now(),
        },
      });
    }
  });
  
  await batch.commit();
  console.log(`Migrated ${usersSnapshot.size} users`);
}
```

## Queries

### Get user's subscription
```typescript
const userDoc = await admin.firestore()
  .collection('users')
  .doc(userId)
  .get();

const subscription = userDoc.data()?.subscription;
```

### Get user's workflows
```typescript
const workflowsSnapshot = await admin.firestore()
  .collection('workflows')
  .where('owner', '==', userId)
  .where('enabled', '==', true)
  .orderBy('createdAt', 'desc')
  .get();
```

### Get workflow execution history
```typescript
const executionsSnapshot = await admin.firestore()
  .collection('workflow_executions')
  .where('userId', '==', userId)
  .where('workflowId', '==', workflowId)
  .orderBy('startedAt', 'desc')
  .limit(50)
  .get();
```

### Find user by Stripe customer ID
```typescript
const usersSnapshot = await admin.firestore()
  .collection('users')
  .where('subscription.stripeCustomerId', '==', customerId)
  .limit(1)
  .get();
```
