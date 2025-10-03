/**
 * Entitlement Service Tests
 * Tests for subscription tier limits and feature access
 */

import { describe, it, expect } from 'vitest';
import type { UserSubscription } from '../types';
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

describe('Entitlement Service', () => {
  describe('hasFeatureAccess', () => {
    it('should allow free tier basic features', () => {
      const subscription: UserSubscription = {
        tier: 'free',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(hasFeatureAccess(subscription, 'maxWorkflows')).toBe(false);
      expect(hasFeatureAccess(subscription, 'maxExecutionsPerMonth')).toBe(false);
    });

    it('should allow pro tier all features', () => {
      const subscription: UserSubscription = {
        tier: 'pro',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(hasFeatureAccess(subscription, 'maxWorkflows')).toBe(true);
      expect(hasFeatureAccess(subscription, 'maxExecutionsPerMonth')).toBe(true);
      expect(hasFeatureAccess(subscription, 'maxStorageGB')).toBe(true);
    });

    it('should default to free tier for null subscription', () => {
      expect(hasFeatureAccess(null, 'maxWorkflows')).toBe(false);
      expect(hasFeatureAccess(undefined, 'maxWorkflows')).toBe(false);
    });
  });

  describe('canCreateWorkflow', () => {
    it('should allow workflow creation under free tier limit', () => {
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

    it('should block workflow creation at free tier limit', () => {
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

    it('should allow unlimited workflows for pro tier', () => {
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
      expect(result.reason).toContain('free tier');
    });

    it('should handle zero workflows', () => {
      const subscription: UserSubscription = {
        tier: 'free',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = canCreateWorkflow(subscription, 0);

      expect(result.allowed).toBe(true);
    });
  });

  describe('canExecuteWorkflow', () => {
    it('should allow execution under free tier limit', () => {
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

    it('should block execution at free tier limit', () => {
      const subscription: UserSubscription = {
        tier: 'free',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = canExecuteWorkflow(subscription, 100);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('maximum of 100 executions');
      expect(result.reason).toContain('this month');
    });

    it('should allow unlimited executions for pro tier', () => {
      const subscription: UserSubscription = {
        tier: 'pro',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = canExecuteWorkflow(subscription, 10000);

      expect(result.allowed).toBe(true);
    });

    it('should handle zero executions', () => {
      const subscription: UserSubscription = {
        tier: 'free',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = canExecuteWorkflow(subscription, 0);

      expect(result.allowed).toBe(true);
    });
  });

  describe('getTierLimits', () => {
    it('should return free tier limits', () => {
      const subscription: UserSubscription = {
        tier: 'free',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const limits = getTierLimits(subscription);

      expect(limits.maxWorkflows).toBe(3);
      expect(limits.maxExecutionsPerMonth).toBe(100);
      expect(limits.maxStorageGB).toBe(1);
    });

    it('should return pro tier limits', () => {
      const subscription: UserSubscription = {
        tier: 'pro',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const limits = getTierLimits(subscription);

      expect(limits.maxWorkflows).toBe(-1); // Unlimited
      expect(limits.maxExecutionsPerMonth).toBe(-1); // Unlimited
      expect(limits.maxStorageGB).toBe(100);
    });

    it('should default to free tier for null subscription', () => {
      const limits = getTierLimits(null);

      expect(limits.maxWorkflows).toBe(3);
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

    it('should return false for null subscription', () => {
      expect(isSubscriptionActive(null)).toBe(false);
      expect(isSubscriptionActive(undefined)).toBe(false);
    });
  });

  describe('isProUser', () => {
    it('should return true for active pro user', () => {
      const subscription: UserSubscription = {
        tier: 'pro',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(isProUser(subscription)).toBe(true);
    });

    it('should return true for trialing pro user', () => {
      const subscription: UserSubscription = {
        tier: 'pro',
        status: 'trialing',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(isProUser(subscription)).toBe(true);
    });

    it('should return false for canceled pro user', () => {
      const subscription: UserSubscription = {
        tier: 'pro',
        status: 'canceled',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(isProUser(subscription)).toBe(false);
    });

    it('should return false for active free user', () => {
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
    });
  });

  describe('getUsagePercentage', () => {
    it('should calculate percentage correctly', () => {
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

    it('should handle decimal percentages', () => {
      expect(getUsagePercentage(33, 100)).toBe(33);
      expect(getUsagePercentage(1, 3)).toBeCloseTo(33.33, 1);
    });
  });

  describe('isApproachingLimit', () => {
    it('should return true when at 80%', () => {
      expect(isApproachingLimit(80, 100)).toBe(true);
    });

    it('should return true when above 80%', () => {
      expect(isApproachingLimit(85, 100)).toBe(true);
      expect(isApproachingLimit(90, 100)).toBe(true);
      expect(isApproachingLimit(100, 100)).toBe(true);
    });

    it('should return false when below 80%', () => {
      expect(isApproachingLimit(79, 100)).toBe(false);
      expect(isApproachingLimit(50, 100)).toBe(false);
      expect(isApproachingLimit(0, 100)).toBe(false);
    });

    it('should return false for unlimited (-1)', () => {
      expect(isApproachingLimit(10000, -1)).toBe(false);
    });

    it('should handle edge case at exactly 80%', () => {
      expect(isApproachingLimit(8, 10)).toBe(true);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete free tier workflow', () => {
      const subscription: UserSubscription = {
        tier: 'free',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // User has 2 workflows, 80 executions
      const canCreate = canCreateWorkflow(subscription, 2);
      const canExecute = canExecuteWorkflow(subscription, 80);
      const limits = getTierLimits(subscription);
      const isPro = isProUser(subscription);
      const workflowUsage = getUsagePercentage(2, limits.maxWorkflows);
      const executionUsage = getUsagePercentage(80, limits.maxExecutionsPerMonth);

      expect(canCreate.allowed).toBe(true);
      expect(canExecute.allowed).toBe(true);
      expect(isPro).toBe(false);
      expect(workflowUsage).toBeCloseTo(66.67, 1);
      expect(executionUsage).toBe(80);
      expect(isApproachingLimit(80, limits.maxExecutionsPerMonth)).toBe(true);
    });

    it('should handle complete pro tier workflow', () => {
      const subscription: UserSubscription = {
        tier: 'pro',
        status: 'active',
        stripeCustomerId: 'cus_test_123',
        stripeSubscriptionId: 'sub_test_123',
        currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // User has 100 workflows, 10000 executions
      const canCreate = canCreateWorkflow(subscription, 100);
      const canExecute = canExecuteWorkflow(subscription, 10000);
      const limits = getTierLimits(subscription);
      const isPro = isProUser(subscription);
      const isActive = isSubscriptionActive(subscription);

      expect(canCreate.allowed).toBe(true);
      expect(canExecute.allowed).toBe(true);
      expect(isPro).toBe(true);
      expect(isActive).toBe(true);
      expect(limits.maxWorkflows).toBe(-1);
      expect(limits.maxExecutionsPerMonth).toBe(-1);
    });

    it('should handle subscription upgrade scenario', () => {
      // Start as free user
      const freeSubscription: UserSubscription = {
        tier: 'free',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(canCreateWorkflow(freeSubscription, 3).allowed).toBe(false);
      expect(isProUser(freeSubscription)).toBe(false);

      // Upgrade to pro
      const proSubscription: UserSubscription = {
        ...freeSubscription,
        tier: 'pro',
        stripeCustomerId: 'cus_new_123',
        stripeSubscriptionId: 'sub_new_123',
      };

      expect(canCreateWorkflow(proSubscription, 3).allowed).toBe(true);
      expect(isProUser(proSubscription)).toBe(true);
    });

    it('should handle subscription cancellation scenario', () => {
      const subscription: UserSubscription = {
        tier: 'pro',
        status: 'active',
        cancelAtPeriodEnd: true,
        currentPeriodEnd: Date.now() + 7 * 24 * 60 * 60 * 1000,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Still active until period end
      expect(isSubscriptionActive(subscription)).toBe(true);
      expect(isProUser(subscription)).toBe(true);
      expect(canCreateWorkflow(subscription, 100).allowed).toBe(true);

      // After cancellation takes effect
      const canceledSubscription: UserSubscription = {
        ...subscription,
        status: 'canceled',
      };

      expect(isSubscriptionActive(canceledSubscription)).toBe(false);
      expect(isProUser(canceledSubscription)).toBe(false);
    });
  });
});
