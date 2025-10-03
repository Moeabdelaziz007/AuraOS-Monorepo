# 💳 AuraOS Subscription System - Complete Guide

## Overview

This document describes the complete subscription and billing system for AuraOS, implementing the "Aura Pro" premium tier using Stripe and Firebase.

## Architecture

```
┌─────────────────┐
│   Frontend UI   │
│  (packages/ui)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Firebase Functions     │
│  - createCheckoutSession│
│  - stripeWebhook        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│   Firestore     │◄────►│    Stripe    │
│  (User Data)    │      │   (Billing)  │
└─────────────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│  WorkflowMCP    │
│ (Feature Gates) │
└─────────────────┘
```

## Components

### 1. Billing Package (`packages/billing`)

Core billing logic and Stripe integration.

**Key Files:**
- `src/stripe-client.ts` - Stripe SDK initialization
- `src/checkout.ts` - Checkout session creation
- `src/webhook.ts` - Webhook event handling
- `src/entitlement.ts` - Feature gating logic
- `src/types.ts` - TypeScript types

**Installation:**
```bash
cd packages/billing
pnpm install
pnpm build
```

### 2. Firebase Functions (`services/firebase/functions`)

Cloud Functions for Stripe integration.

**Functions:**

#### `createStripeCheckoutSession`
- **Type:** HTTPS Callable
- **Purpose:** Create Stripe Checkout session
- **Input:**
  ```typescript
  {
    priceId: string;
    successPath?: string;
    cancelPath?: string;
  }
  ```
- **Output:**
  ```typescript
  {
    sessionId: string;
    url: string;
  }
  ```

#### `createStripePortalSession`
- **Type:** HTTPS Callable
- **Purpose:** Create Customer Portal session
- **Input:**
  ```typescript
  {
    returnPath?: string;
  }
  ```
- **Output:**
  ```typescript
  {
    url: string;
  }
  ```

#### `stripeWebhook`
- **Type:** HTTP Request
- **Purpose:** Handle Stripe webhook events
- **Events Handled:**
  - `checkout.session.completed` - New subscription
  - `customer.subscription.updated` - Subscription changes
  - `customer.subscription.deleted` - Subscription canceled
  - `invoice.payment_succeeded` - Successful payment
  - `invoice.payment_failed` - Failed payment

**Deployment:**
```bash
cd services/firebase/functions
pnpm install
pnpm build
firebase deploy --only functions
```

### 3. Frontend UI (`packages/ui`)

React components for pricing and billing.

**Components:**
- `PricingPage.tsx` - Main pricing page
- `PricingCard.tsx` - Individual pricing tier card
- `SubscriptionBadge.tsx` - Pro/Free badge
- `UsageBar.tsx` - Usage visualization

**Usage:**
```typescript
import { PricingPage } from './pages/PricingPage';

<PricingPage currentTier="free" />
```

### 4. WorkflowMCP (`packages/automation/src/mcp/workflow.ts`)

MCP server with feature gating.

**Feature Gates:**
- `create_workflow` - Check workflow limit
- `execute_workflow` - Check execution limit
- `get_subscription_status` - Get tier info

## Subscription Tiers

### Free Tier
- ✅ 3 active workflows
- ✅ 100 executions/month
- ✅ 1 GB storage
- ✅ Basic features
- ✅ Community support

### Aura Pro Tier
- ✅ Unlimited workflows
- ✅ Unlimited executions
- ✅ 100 GB storage
- ✅ Advanced features
- ✅ Priority support
- ✅ Custom integrations
- ✅ API access

**Pricing:**
- Monthly: $19/month
- Yearly: $180/year ($15/month, save $48)

## Setup Instructions

### 1. Stripe Setup

1. **Create Stripe Account:**
   - Go to https://stripe.com
   - Create account or login

2. **Create Products:**
   ```
   Product: Aura Pro
   - Monthly Price: $19/month
   - Yearly Price: $180/year
   ```

3. **Get API Keys:**
   - Dashboard → Developers → API keys
   - Copy Secret Key and Publishable Key

4. **Create Webhook:**
   - Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-project.cloudfunctions.net/stripeWebhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy Webhook Secret

### 2. Firebase Configuration

1. **Set Environment Variables:**
   ```bash
   firebase functions:config:set \
     stripe.secret_key="sk_test_xxx" \
     stripe.webhook_secret="whsec_xxx" \
     stripe.price_id_pro_monthly="price_xxx" \
     stripe.price_id_pro_yearly="price_xxx" \
     app.url="https://selfos-62f70.web.app"
   ```

2. **Or use `.env` file (local development):**
   ```bash
   cd services/firebase/functions
   cp .env.example .env
   # Edit .env with your keys
   ```

3. **Deploy Functions:**
   ```bash
   firebase deploy --only functions
   ```

### 3. Frontend Configuration

1. **Update `.env.production`:**
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   VITE_STRIPE_PRICE_ID_PRO_MONTHLY=price_xxx
   VITE_STRIPE_PRICE_ID_PRO_YEARLY=price_xxx
   ```

2. **Build and Deploy:**
   ```bash
   cd packages/ui
   npm run build
   firebase deploy --only hosting
   ```

### 4. Firestore Setup

1. **Update Security Rules:**
   - Rules already updated in `firestore.rules`
   - Deploy: `firebase deploy --only firestore:rules`

2. **Create Indexes:**
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. **Migrate Existing Users:**
   ```typescript
   // Run migration script
   import * as admin from 'firebase-admin';
   
   async function migrateUsers() {
     const users = await admin.firestore().collection('users').get();
     const batch = admin.firestore().batch();
     
     users.docs.forEach(doc => {
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
   }
   ```

## User Flow

### Upgrade to Pro

1. User clicks "Upgrade to Pro" on Pricing Page
2. Frontend calls `createStripeCheckoutSession()`
3. User redirected to Stripe Checkout
4. User enters payment details
5. Stripe processes payment
6. Stripe sends `checkout.session.completed` webhook
7. Cloud Function updates Firestore:
   ```typescript
   users/{userId}/subscription = {
     tier: 'pro',
     status: 'active',
     stripeCustomerId: 'cus_xxx',
     stripeSubscriptionId: 'sub_xxx',
     currentPeriodEnd: 1704067200,
     cancelAtPeriodEnd: false,
     createdAt: Date.now(),
     updatedAt: Date.now(),
   }
   ```
8. User redirected to success page
9. Pro features immediately available

### Manage Subscription

1. User clicks "Manage Subscription"
2. Frontend calls `createStripePortalSession()`
3. User redirected to Stripe Customer Portal
4. User can:
   - Update payment method
   - Change plan (monthly ↔ yearly)
   - Cancel subscription
   - View invoices
5. Changes synced via webhooks

### Cancel Subscription

1. User cancels in Stripe Portal
2. Stripe sends `customer.subscription.updated` webhook
3. Cloud Function updates:
   ```typescript
   subscription.cancelAtPeriodEnd = true
   ```
4. User keeps Pro until period end
5. At period end, Stripe sends `customer.subscription.deleted`
6. Cloud Function downgrades to free:
   ```typescript
   subscription.tier = 'free'
   subscription.status = 'canceled'
   ```

## Feature Gating

### In WorkflowMCP

```typescript
import { canCreateWorkflow } from '@auraos/billing';

// Before creating workflow
const subscription = await getUserSubscription(userId);
const currentCount = await getWorkflowCount(userId);

const { allowed, reason } = canCreateWorkflow(subscription, currentCount);

if (!allowed) {
  throw new Error(reason);
  // "You've reached the maximum of 3 workflows on the free tier.
  //  Upgrade to Aura Pro for unlimited workflows."
}

// Create workflow...
```

### In Frontend

```typescript
import { useSubscription } from './hooks/useSubscription';

function WorkflowList() {
  const { subscription, usage } = useSubscription();
  const canCreate = usage.workflows.current < usage.workflows.limit;
  
  return (
    <button
      disabled={!canCreate}
      onClick={createWorkflow}
    >
      {canCreate ? 'Create Workflow' : 'Upgrade to Create More'}
    </button>
  );
}
```

## Testing

### Test Mode

Use Stripe test mode for development:

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

**Test Webhook:**
```bash
stripe listen --forward-to localhost:5001/your-project/us-central1/stripeWebhook
```

### Test Scenarios

1. **Successful Upgrade:**
   - Use test card 4242...
   - Verify user upgraded to Pro
   - Check Firestore updated
   - Test unlimited features

2. **Failed Payment:**
   - Use decline card 4000 0000 0000 0002
   - Verify error handling
   - User remains on free tier

3. **Subscription Cancellation:**
   - Cancel in portal
   - Verify `cancelAtPeriodEnd = true`
   - Wait for period end
   - Verify downgrade to free

4. **Feature Gating:**
   - Create 3 workflows on free
   - Try to create 4th
   - Verify error message
   - Upgrade to Pro
   - Create unlimited workflows

## Monitoring

### Stripe Dashboard

Monitor:
- Successful payments
- Failed payments
- Subscription changes
- Customer lifetime value

### Firebase Console

Monitor:
- Function executions
- Function errors
- Firestore writes
- User subscriptions

### Logs

```bash
# View function logs
firebase functions:log

# View specific function
firebase functions:log --only stripeWebhook

# Real-time logs
firebase functions:log --follow
```

## Security

### API Keys

- ✅ Never commit API keys to git
- ✅ Use environment variables
- ✅ Rotate keys regularly
- ✅ Use test keys in development

### Webhook Security

- ✅ Verify webhook signatures
- ✅ Use HTTPS only
- ✅ Validate event types
- ✅ Idempotent event handling

### Firestore Rules

- ✅ Users can't modify own subscription
- ✅ Only Cloud Functions can update subscriptions
- ✅ Users can only access own data

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook URL is correct
2. Verify webhook secret matches
3. Check function is deployed
4. View Stripe webhook logs

### Payment Fails

1. Check test card is valid
2. Verify Stripe keys are correct
3. Check function logs for errors
4. Test with different card

### User Not Upgraded

1. Check webhook was received
2. Verify Firestore was updated
3. Check function logs
4. Verify user ID matches

### Feature Gate Not Working

1. Check subscription data in Firestore
2. Verify entitlement logic
3. Check MCP server logs
4. Test with Pro account

## Next Steps

### Phase 2 Features

- [ ] Team subscriptions
- [ ] Usage-based billing
- [ ] Custom enterprise plans
- [ ] Referral program
- [ ] Annual discounts
- [ ] Add-ons (extra storage, etc.)

### Improvements

- [ ] Email notifications
- [ ] In-app notifications
- [ ] Usage analytics dashboard
- [ ] Billing history page
- [ ] Invoice downloads
- [ ] Tax handling

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Firebase Functions](https://firebase.google.com/docs/functions)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [MCP Protocol](https://modelcontextprotocol.io)

## Support

For issues or questions:
1. Check this documentation
2. Review Stripe/Firebase docs
3. Check function logs
4. Contact support

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-03  
**Status:** Production Ready ✅
