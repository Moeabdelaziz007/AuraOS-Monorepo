import {
  hasFeatureAccess,
  canCreateWorkflow,
  canExecuteWorkflow,
  getTierLimits,
  isSubscriptionActive,
  isProUser,
  getUsagePercentage,
  isApproachingLimit,
} from '../entitlement';
import type { UserSubscription } from '../types';
import { TIER_LIMITS } from '../types';

describe('Entitlement Logic', () => {
  describe('hasFeatureAccess', () => {
    it('should return false for free user without advanced features', () => {
      const subscription: UserSubscription = {
        tier: 'free',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(hasFeatureAccess(subscription, 'advancedFeatures')).toBe(false);
      expect(hasFeatureAccess(subscription, 'prioritySupport')).toBe(false);
    });

    it('should return true for pro user with advanced features', () => {
      const subscription: UserSubscription = {
        tier: 'pro',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(hasFeatureAccess(subscription, 'advancedFeatures')).toBe(true);
      expect(hasFeatureAccess(subscription, 'prioritySupport')).toBe(true);
    });

    it('should return true for unlimited features (maxWorkflows)', () => {
      const subscription: UserSubscription = {
        tier: 'pro',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(hasFeatureAccess(subscription, 'maxWorkflows')).toBe(true);
    });

    it('should default to free tier for null subscription', () => {
      expect(hasFeatureAccess(null, 'advancedFeatures')).toBe(false);
      expect(hasFeatureAccess(undefined, 'advancedFeatures')).toBe(false);
    });
  });

  describe('canCreateWorkflow', () => {
    it('should allow free user to create workflows under limit', () => {
      const subscription: UserSubscription = {
        tier: 'free',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = canCreateWorkflow(subscription, 2);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should block free user at workflow limit', () => {
      const subscription: UserSubscription = {
        tier: 'free',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = canCreateWorkflow(subscription, 3);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('maximum of 3 workflows');
      expect(result.reason).toContain('Upgrade to Aura Pro');
    });

    it('should allow pro user unlimited workflows', () => {
      const subscription: UserSubscription = {
        tier: 'pro',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = canCreateWorkflow(subscription, 1000);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should default to free tier for null subscription', () => {
      const result = canCreateWorkflow(null, 3);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('maximum of 3 workflows');
    });
  });

  describe('canExecuteWorkflow', () => {
    it('should allow free user to execute workflows under limit', () => {
      const subscription: UserSubscription = {
        tier: 'free',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = canExecuteWorkflow(subscription, 50);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should block free user at execution limit', () => {
      const subscription: UserSubscription = {
        tier: 'free',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = canExecuteWorkflow(subscription, 100);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('maximum of 100 executions');
      expect(result.reason).toContain('Upgrade to Aura Pro');
    });

    it('should allow pro user unlimited executions', () => {
      const subscription: UserSubscription = {
        tier: 'pro',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = canExecuteWorkflow(subscription, 10000);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should default to free tier for undefined subscription', () => {
      const result = canExecuteWorkflow(undefined, 100);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('maximum of 100 executions');
    });
  });

  describe('getTierLimits', () => {
    it('should return free tier limits for free subscription', () => {
      const subscription: UserSubscription = {
        tier: 'free',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const limits = getTierLimits(subscription);
      expect(limits).toEqual(TIER_LIMITS.free);
      expect(limits.maxWorkflows).toBe(3);
      expect(limits.maxExecutionsPerMonth).toBe(100);
    });

    it('should return pro tier limits for pro subscription', () => {
      const subscription: UserSubscription = {
        tier: 'pro',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const limits = getTierLimits(subscription);
      expect(limits).toEqual(TIER_LIMITS.pro);
      expect(limits.maxWorkflows).toBe(-1);
      expect(limits.maxExecutionsPerMonth).toBe(-1);
    });

    it('should default to free tier for null subscription', () => {
      const limits = getTierLimits(null);
      expect(limits).toEqual(TIER_LIMITS.free);
    });
  });

  describe('isSubscriptionActive', () => {
    it('should return true for active subscription', () => {
      const subscription: UserSubscription = {
        tier: 'pro',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(isSubscriptionActive(subscription)).toBe(true);
    });

    it('should return true for trialing subscription', () => {
      const subscription: UserSubscription = {
        tier: 'pro',
        status: 'trialing',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(isSubscriptionActive(subscription)).toBe(true);
    });

    it('should return false for canceled subscription', () => {
      const subscription: UserSubscription = {
        tier: 'pro',
        status: 'canceled',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(isSubscriptionActive(subscription)).toBe(false);
    });

    it('should return false for past_due subscription', () => {
      const subscription: UserSubscription = {
        tier: 'pro',
        status: 'past_due',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(isSubscriptionActive(subscription)).toBe(false);
    });

    it('should return false for incomplete subscription', () => {
      const subscription: UserSubscription = {
        tier: 'pro',
        status: 'incomplete',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(isSubscriptionActive(subscription)).toBe(false);
    });

    it('should return false for null subscription', () => {
      expect(isSubscriptionActive(null)).toBe(false);
      expect(isSubscriptionActive(undefined)).toBe(false);
    });
  });

  describe('isProUser', () => {
    it('should return true for active pro subscription', () => {
      const subscription: UserSubscription = {
        tier: 'pro',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(isProUser(subscription)).toBe(true);
    });

    it('should return true for trialing pro subscription', () => {
      const subscription: UserSubscription = {
        tier: 'pro',
        status: 'trialing',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(isProUser(subscription)).toBe(true);
    });

    it('should return false for canceled pro subscription', () => {
      const subscription: UserSubscription = {
        tier: 'pro',
        status: 'canceled',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(isProUser(subscription)).toBe(false);
    });

    it('should return false for active free subscription', () => {
      const subscription: UserSubscription = {
        tier: 'free',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(isProUser(subscription)).toBe(false);
    });

    it('should return false for null subscription', () => {
      expect(isProUser(null)).toBe(false);
      expect(isProUser(undefined)).toBe(false);
    });
  });

  describe('getUsagePercentage', () => {
    it('should calculate correct percentage', () => {
      expect(getUsagePercentage(50, 100)).toBe(50);
      expect(getUsagePercentage(75, 100)).toBe(75);
      expect(getUsagePercentage(100, 100)).toBe(100);
    });

    it('should cap at 100%', () => {
      expect(getUsagePercentage(150, 100)).toBe(100);
    });

    it('should return 0 for unlimited (-1)', () => {
      expect(getUsagePercentage(1000, -1)).toBe(0);
    });

    it('should handle zero current usage', () => {
      expect(getUsagePercentage(0, 100)).toBe(0);
    });
  });

  describe('isApproachingLimit', () => {
    it('should return false when under 80%', () => {
      expect(isApproachingLimit(70, 100)).toBe(false);
      expect(isApproachingLimit(50, 100)).toBe(false);
    });

    it('should return true when at or above 80%', () => {
      expect(isApproachingLimit(80, 100)).toBe(true);
      expect(isApproachingLimit(90, 100)).toBe(true);
      expect(isApproachingLimit(100, 100)).toBe(true);
    });

    it('should return false for unlimited (-1)', () => {
      expect(isApproachingLimit(10000, -1)).toBe(false);
    });

    it('should handle edge case at exactly 80%', () => {
      expect(isApproachingLimit(80, 100)).toBe(true);
    });
  });
});
