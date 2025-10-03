import type { TierLimits, UserSubscription } from './types';
import { TIER_LIMITS } from './types';

/**
 * Check if user has access to a feature based on their subscription
 */
export function hasFeatureAccess(
  subscription: UserSubscription | null | undefined,
  feature: keyof TierLimits
): boolean {
  const tier = subscription?.tier || 'free';
  const limits = TIER_LIMITS[tier];
  
  return limits[feature] === true || limits[feature] === -1;
}

/**
 * Check if user can create more workflows
 */
export function canCreateWorkflow(
  subscription: UserSubscription | null | undefined,
  currentWorkflowCount: number
): { allowed: boolean; reason?: string } {
  const tier = subscription?.tier || 'free';
  const limits = TIER_LIMITS[tier];
  
  // Unlimited workflows for pro
  if (limits.maxWorkflows === -1) {
    return { allowed: true };
  }
  
  // Check if user has reached the limit
  if (currentWorkflowCount >= limits.maxWorkflows) {
    return {
      allowed: false,
      reason: `You've reached the maximum of ${limits.maxWorkflows} workflows on the free tier. Upgrade to Aura Pro for unlimited workflows.`,
    };
  }
  
  return { allowed: true };
}

/**
 * Check if user can execute more workflows this month
 */
export function canExecuteWorkflow(
  subscription: UserSubscription | null | undefined,
  executionsThisMonth: number
): { allowed: boolean; reason?: string } {
  const tier = subscription?.tier || 'free';
  const limits = TIER_LIMITS[tier];
  
  // Unlimited executions for pro
  if (limits.maxExecutionsPerMonth === -1) {
    return { allowed: true };
  }
  
  // Check if user has reached the limit
  if (executionsThisMonth >= limits.maxExecutionsPerMonth) {
    return {
      allowed: false,
      reason: `You've reached the maximum of ${limits.maxExecutionsPerMonth} executions this month. Upgrade to Aura Pro for unlimited executions.`,
    };
  }
  
  return { allowed: true };
}

/**
 * Get tier limits for a subscription
 */
export function getTierLimits(
  subscription: UserSubscription | null | undefined
): TierLimits {
  const tier = subscription?.tier || 'free';
  return TIER_LIMITS[tier];
}

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(
  subscription: UserSubscription | null | undefined
): boolean {
  if (!subscription) {
    return false;
  }
  
  return subscription.status === 'active' || subscription.status === 'trialing';
}

/**
 * Check if user is on pro tier
 */
export function isProUser(
  subscription: UserSubscription | null | undefined
): boolean {
  return subscription?.tier === 'pro' && isSubscriptionActive(subscription);
}

/**
 * Get usage percentage for a limit
 */
export function getUsagePercentage(
  current: number,
  limit: number
): number {
  if (limit === -1) {
    return 0; // Unlimited
  }
  
  return Math.min(100, (current / limit) * 100);
}

/**
 * Check if user is approaching a limit (>80%)
 */
export function isApproachingLimit(
  current: number,
  limit: number
): boolean {
  if (limit === -1) {
    return false; // Unlimited
  }
  
  return getUsagePercentage(current, limit) >= 80;
}
