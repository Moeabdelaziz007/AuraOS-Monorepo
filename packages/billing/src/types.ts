/**
 * Subscription tier types
 */
export type SubscriptionTier = 'free' | 'pro';

/**
 * Subscription status types
 */
export type SubscriptionStatus = 
  | 'active' 
  | 'canceled' 
  | 'past_due' 
  | 'incomplete' 
  | 'trialing';

/**
 * User subscription data stored in Firestore
 */
export interface UserSubscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: number; // Unix timestamp
  cancelAtPeriodEnd?: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Stripe checkout session creation parameters
 */
export interface CreateCheckoutSessionParams {
  userId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

/**
 * Stripe webhook event types we handle
 */
export type StripeWebhookEvent = 
  | 'checkout.session.completed'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed';

/**
 * Feature limits by tier
 */
export interface TierLimits {
  maxWorkflows: number;
  maxExecutionsPerMonth: number;
  maxStorageGB: number;
  advancedFeatures: boolean;
  prioritySupport: boolean;
}

/**
 * Tier configuration
 */
export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    maxWorkflows: 3,
    maxExecutionsPerMonth: 100,
    maxStorageGB: 1,
    advancedFeatures: false,
    prioritySupport: false,
  },
  pro: {
    maxWorkflows: -1, // unlimited
    maxExecutionsPerMonth: -1, // unlimited
    maxStorageGB: 100,
    advancedFeatures: true,
    prioritySupport: true,
  },
};

/**
 * Stripe price IDs (set these in environment variables)
 */
export interface StripePriceIds {
  pro_monthly: string;
  pro_yearly: string;
}
