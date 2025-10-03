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

## 🔒 Security Considerations

### Webhook Security

**Always verify webhook signatures:**

```typescript
import { constructWebhookEvent } from '@auraos/billing';

try {
  const event = constructWebhookEvent(
    requestBody,
    req.headers['stripe-signature'],
    process.env.STRIPE_WEBHOOK_SECRET
  );
  
  // Process verified event
} catch (err) {
  console.error('Webhook signature verification failed:', err);
  return res.status(400).send('Webhook Error');
}
```

### API Key Protection

**Never expose secret keys in client-side code:**

```typescript
// ❌ WRONG - Never do this
const stripe = new Stripe('sk_live_xxx'); // In client code

// ✅ CORRECT - Use environment variables on server
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
```

### Customer Data

**Handle customer data securely:**

- Never log full credit card numbers
- Use Stripe's secure checkout (no PCI compliance needed)
- Store only Stripe customer IDs, not payment details
- Implement proper access controls

### Testing in Production

**Use test mode for development:**

```env
# Development
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxx

# Production
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_live_xxx
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run with coverage
pnpm test --coverage

# Type check
pnpm typecheck

# Lint
pnpm lint
```

### Test Stripe Integration

Use Stripe's test mode and test cards:

```typescript
// Test card numbers
const TEST_CARDS = {
  success: '4242424242424242',
  declined: '4000000000000002',
  requiresAuth: '4000002500003155',
};
```

### Webhook Testing

**Using Stripe CLI:**

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

### Testing Entitlements

```typescript
import { canCreateWorkflow, isProUser } from '@auraos/billing';

describe('Entitlements', () => {
  test('free tier has workflow limit', () => {
    const subscription = { tier: 'free', status: 'active' };
    
    const { allowed } = canCreateWorkflow(subscription, 3);
    expect(allowed).toBe(false);
  });
  
  test('pro tier has unlimited workflows', () => {
    const subscription = { tier: 'pro', status: 'active' };
    
    const { allowed } = canCreateWorkflow(subscription, 100);
    expect(allowed).toBe(true);
  });
});
```

---

## 🐛 Troubleshooting

### Webhook Not Receiving Events

**Issue:** Webhooks not being received

**Solutions:**
1. Check webhook endpoint is publicly accessible
2. Verify webhook secret matches Stripe dashboard
3. Check Stripe dashboard webhook logs
4. Ensure endpoint returns 200 status quickly

```typescript
// Return 200 immediately, process async
app.post('/webhooks/stripe', async (req, res) => {
  const event = constructWebhookEvent(/* ... */);
  
  // Return 200 immediately
  res.status(200).send('Received');
  
  // Process async
  processWebhookEvent(event).catch(console.error);
});
```

---

### Checkout Session Expired

**Issue:** `checkout.session.expired` event received

**Solution:**
- Sessions expire after 24 hours
- Create new session for user
- Notify user to complete checkout

---

### Subscription Status Mismatch

**Issue:** User subscription status doesn't match Stripe

**Solution:**
```typescript
// Sync subscription from Stripe
import { getSubscription, extractSubscriptionData } from '@auraos/billing';

async function syncSubscription(subscriptionId: string) {
  const subscription = await getSubscription(subscriptionId);
  const data = extractSubscriptionData(subscription);
  
  // Update in Firestore
  await updateUserSubscription(data);
}
```

---

### Test Mode vs Live Mode

**Issue:** Using test keys in production or vice versa

**Solution:**
```typescript
// Check environment
const isProduction = process.env.NODE_ENV === 'production';
const stripeKey = isProduction 
  ? process.env.STRIPE_SECRET_KEY_LIVE
  : process.env.STRIPE_SECRET_KEY_TEST;

if (!stripeKey) {
  throw new Error('Stripe key not configured');
}
```

---

## 📊 Stripe Dashboard

### Important Links

- **Dashboard:** https://dashboard.stripe.com
- **Test Mode:** Toggle in top-left corner
- **Webhooks:** Developers → Webhooks
- **API Keys:** Developers → API keys
- **Logs:** Developers → Logs
- **Events:** Developers → Events

### Monitoring

**Key metrics to monitor:**
- Successful payments
- Failed payments
- Subscription churn rate
- Revenue trends
- Webhook delivery success rate

---

## 🔗 Related Documentation

- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Subscription System](../../SUBSCRIPTION_SYSTEM.md)
- [Payment Strategy](../../PAYMENT_AND_FEATURES_STRATEGY.md)

---

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**Made with ❤️ for AuraOS**
