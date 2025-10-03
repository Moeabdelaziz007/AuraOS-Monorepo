# @auraos/billing

Billing and subscription management package for AuraOS using Stripe.

## Features

- 🔐 **Stripe Integration** - Complete Stripe SDK integration
- 💳 **Checkout Sessions** - Create and manage Stripe Checkout sessions
- 🔔 **Webhook Handling** - Process Stripe webhook events
- 🎫 **Entitlement System** - Feature gating based on subscription tier
- 📊 **Usage Tracking** - Monitor usage against tier limits

## Installation

```bash
pnpm add @auraos/billing
```

## Usage

### Initialize Stripe Client

```typescript
import { getStripeClient } from '@auraos/billing';

// Stripe client is automatically initialized with STRIPE_SECRET_KEY env var
const stripe = getStripeClient();
```

### Create Checkout Session

```typescript
import { createCheckoutSession } from '@auraos/billing';

const session = await createCheckoutSession({
  userId: 'user_123',
  priceId: 'price_xxx',
  successUrl: 'https://app.auraos.com/success',
  cancelUrl: 'https://app.auraos.com/pricing',
  customerEmail: 'user@example.com',
});

// Redirect user to session.url
```

### Handle Webhook Events

```typescript
import { constructWebhookEvent, extractSubscriptionFromCheckout } from '@auraos/billing';

const event = constructWebhookEvent(
  requestBody,
  stripeSignature,
  webhookSecret
);

if (event.type === 'checkout.session.completed') {
  const session = event.data.object;
  const subscriptionData = extractSubscriptionFromCheckout(session);
  
  // Update user in Firestore
  await updateUserSubscription(subscriptionData);
}
```

### Check Feature Access

```typescript
import { canCreateWorkflow, isProUser } from '@auraos/billing';

const user = await getUser(userId);

// Check if user can create more workflows
const { allowed, reason } = canCreateWorkflow(
  user.subscription,
  currentWorkflowCount
);

if (!allowed) {
  throw new Error(reason);
}

// Check if user is pro
if (isProUser(user.subscription)) {
  // Allow advanced features
}
```

## Subscription Tiers

### Free Tier
- ✅ 3 workflows
- ✅ 100 executions/month
- ✅ 1 GB storage
- ❌ Advanced features
- ❌ Priority support

### Pro Tier
- ✅ Unlimited workflows
- ✅ Unlimited executions
- ✅ 100 GB storage
- ✅ Advanced features
- ✅ Priority support

## Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_PRO_MONTHLY=price_xxx
STRIPE_PRICE_ID_PRO_YEARLY=price_xxx
```

## API Reference

### Checkout Functions

- `createCheckoutSession(params)` - Create a new checkout session
- `createPortalSession(customerId, returnUrl)` - Create customer portal session
- `getCheckoutSession(sessionId)` - Retrieve checkout session
- `cancelSubscription(subscriptionId)` - Cancel a subscription
- `reactivateSubscription(subscriptionId)` - Reactivate canceled subscription

### Webhook Functions

- `constructWebhookEvent(payload, signature, secret)` - Verify and construct webhook event
- `extractSubscriptionFromCheckout(session)` - Extract subscription data from checkout
- `extractSubscriptionData(subscription)` - Extract data from subscription object
- `getSubscription(subscriptionId)` - Get subscription by ID
- `getCustomer(customerId)` - Get customer by ID
- `listCustomerSubscriptions(customerId)` - List all customer subscriptions

### Entitlement Functions

- `hasFeatureAccess(subscription, feature)` - Check feature access
- `canCreateWorkflow(subscription, count)` - Check workflow creation limit
- `canExecuteWorkflow(subscription, count)` - Check execution limit
- `getTierLimits(subscription)` - Get tier limits
- `isSubscriptionActive(subscription)` - Check if subscription is active
- `isProUser(subscription)` - Check if user is on pro tier
- `getUsagePercentage(current, limit)` - Calculate usage percentage
- `isApproachingLimit(current, limit)` - Check if approaching limit (>80%)

## Types

```typescript
type SubscriptionTier = 'free' | 'pro';

type SubscriptionStatus = 
  | 'active' 
  | 'canceled' 
  | 'past_due' 
  | 'incomplete' 
  | 'trialing';

interface UserSubscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
  createdAt: number;
  updatedAt: number;
}
```

## Testing

```bash
# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## License

MIT
