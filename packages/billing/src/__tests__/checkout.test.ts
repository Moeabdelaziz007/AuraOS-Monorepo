/**
 * Checkout Service Tests
 * Tests for Stripe checkout session creation and management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type Stripe from 'stripe';

// Mock Stripe client
const mockStripe = {
  checkout: {
    sessions: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
  },
  billingPortal: {
    sessions: {
      create: vi.fn(),
    },
  },
  subscriptions: {
    retrieve: vi.fn(),
    update: vi.fn(),
    cancel: vi.fn(),
  },
};

vi.mock('../stripe-client', () => ({
  getStripeClient: () => mockStripe,
}));

import {
  createCheckoutSession,
  createPortalSession,
  getCheckoutSession,
  cancelSubscription,
  reactivateSubscription,
} from '../checkout';

describe('Checkout Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session successfully', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
        mode: 'subscription',
        customer_email: 'test@example.com',
      };

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession as any);

      const params = {
        userId: 'user_123',
        priceId: 'price_test_123',
        successUrl: 'https://app.example.com/success',
        cancelUrl: 'https://app.example.com/cancel',
        customerEmail: 'test@example.com',
      };

      const result = await createCheckoutSession(params);

      expect(result).toEqual({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      });

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
          payment_method_types: ['card'],
          customer_email: 'test@example.com',
          client_reference_id: 'user_123',
          success_url: params.successUrl,
          cancel_url: params.cancelUrl,
        })
      );
    });

    it('should include user metadata in session', async () => {
      const mockSession = {
        id: 'cs_test_456',
        url: 'https://checkout.stripe.com/pay/cs_test_456',
      };

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession as any);

      const params = {
        userId: 'user_456',
        priceId: 'price_test_456',
        successUrl: 'https://app.example.com/success',
        cancelUrl: 'https://app.example.com/cancel',
        customerEmail: 'user@example.com',
      };

      await createCheckoutSession(params);

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            userId: 'user_456',
          },
          subscription_data: {
            metadata: {
              userId: 'user_456',
            },
          },
        })
      );
    });

    it('should enable promotion codes', async () => {
      const mockSession = {
        id: 'cs_test_789',
        url: 'https://checkout.stripe.com/pay/cs_test_789',
      };

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession as any);

      const params = {
        userId: 'user_789',
        priceId: 'price_test_789',
        successUrl: 'https://app.example.com/success',
        cancelUrl: 'https://app.example.com/cancel',
        customerEmail: 'promo@example.com',
      };

      await createCheckoutSession(params);

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          allow_promotion_codes: true,
        })
      );
    });

    it('should throw error if session URL is missing', async () => {
      const mockSession = {
        id: 'cs_test_no_url',
        url: null,
      };

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession as any);

      const params = {
        userId: 'user_no_url',
        priceId: 'price_test',
        successUrl: 'https://app.example.com/success',
        cancelUrl: 'https://app.example.com/cancel',
        customerEmail: 'test@example.com',
      };

      await expect(createCheckoutSession(params)).rejects.toThrow(
        'Failed to create checkout session URL'
      );
    });

    it('should handle Stripe API errors', async () => {
      mockStripe.checkout.sessions.create.mockRejectedValue(
        new Error('Stripe API error: Invalid price ID')
      );

      const params = {
        userId: 'user_error',
        priceId: 'invalid_price',
        successUrl: 'https://app.example.com/success',
        cancelUrl: 'https://app.example.com/cancel',
        customerEmail: 'error@example.com',
      };

      await expect(createCheckoutSession(params)).rejects.toThrow(
        'Stripe API error'
      );
    });
  });

  describe('createPortalSession', () => {
    it('should create a portal session successfully', async () => {
      const mockPortalSession = {
        id: 'bps_test_123',
        url: 'https://billing.stripe.com/session/bps_test_123',
      };

      mockStripe.billingPortal.sessions.create.mockResolvedValue(
        mockPortalSession as any
      );

      const result = await createPortalSession(
        'cus_test_123',
        'https://app.example.com/account'
      );

      expect(result).toEqual({
        url: 'https://billing.stripe.com/session/bps_test_123',
      });

      expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_test_123',
        return_url: 'https://app.example.com/account',
      });
    });

    it('should handle missing customer ID', async () => {
      mockStripe.billingPortal.sessions.create.mockRejectedValue(
        new Error('No such customer')
      );

      await expect(
        createPortalSession('invalid_customer', 'https://app.example.com')
      ).rejects.toThrow('No such customer');
    });
  });

  describe('getCheckoutSession', () => {
    it('should retrieve a checkout session', async () => {
      const mockSession = {
        id: 'cs_test_retrieve',
        customer: 'cus_test_123',
        subscription: 'sub_test_123',
        payment_status: 'paid',
      };

      mockStripe.checkout.sessions.retrieve.mockResolvedValue(
        mockSession as any
      );

      const result = await getCheckoutSession('cs_test_retrieve');

      expect(result).toEqual(mockSession);
      expect(mockStripe.checkout.sessions.retrieve).toHaveBeenCalledWith(
        'cs_test_retrieve'
      );
    });

    it('should handle invalid session ID', async () => {
      mockStripe.checkout.sessions.retrieve.mockRejectedValue(
        new Error('No such checkout session')
      );

      await expect(getCheckoutSession('invalid_session')).rejects.toThrow(
        'No such checkout session'
      );
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription at period end', async () => {
      const mockSubscription = {
        id: 'sub_test_cancel',
        cancel_at_period_end: true,
        current_period_end: 1735689600,
      };

      mockStripe.subscriptions.update.mockResolvedValue(
        mockSubscription as any
      );

      const result = await cancelSubscription('sub_test_cancel');

      expect(result.cancel_at_period_end).toBe(true);
      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
        'sub_test_cancel',
        {
          cancel_at_period_end: true,
        }
      );
    });

    it('should handle invalid subscription ID', async () => {
      mockStripe.subscriptions.update.mockRejectedValue(
        new Error('No such subscription')
      );

      await expect(cancelSubscription('invalid_sub')).rejects.toThrow(
        'No such subscription'
      );
    });
  });

  describe('reactivateSubscription', () => {
    it('should reactivate a canceled subscription', async () => {
      const mockSubscription = {
        id: 'sub_test_reactivate',
        cancel_at_period_end: false,
        status: 'active',
      };

      mockStripe.subscriptions.update.mockResolvedValue(
        mockSubscription as any
      );

      const result = await reactivateSubscription('sub_test_reactivate');

      expect(result.cancel_at_period_end).toBe(false);
      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
        'sub_test_reactivate',
        {
          cancel_at_period_end: false,
        }
      );
    });

    it('should handle already active subscription', async () => {
      const mockSubscription = {
        id: 'sub_test_active',
        cancel_at_period_end: false,
        status: 'active',
      };

      mockStripe.subscriptions.update.mockResolvedValue(
        mockSubscription as any
      );

      const result = await reactivateSubscription('sub_test_active');

      expect(result.cancel_at_period_end).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle network errors', async () => {
      mockStripe.checkout.sessions.create.mockRejectedValue(
        new Error('Network error')
      );

      const params = {
        userId: 'user_network_error',
        priceId: 'price_test',
        successUrl: 'https://app.example.com/success',
        cancelUrl: 'https://app.example.com/cancel',
        customerEmail: 'network@example.com',
      };

      await expect(createCheckoutSession(params)).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle rate limiting', async () => {
      mockStripe.checkout.sessions.create.mockRejectedValue(
        new Error('Rate limit exceeded')
      );

      const params = {
        userId: 'user_rate_limit',
        priceId: 'price_test',
        successUrl: 'https://app.example.com/success',
        cancelUrl: 'https://app.example.com/cancel',
        customerEmail: 'rate@example.com',
      };

      await expect(createCheckoutSession(params)).rejects.toThrow(
        'Rate limit exceeded'
      );
    });

    it('should handle missing required parameters', async () => {
      const invalidParams = {
        userId: '',
        priceId: '',
        successUrl: '',
        cancelUrl: '',
        customerEmail: '',
      };

      mockStripe.checkout.sessions.create.mockRejectedValue(
        new Error('Missing required parameter')
      );

      await expect(createCheckoutSession(invalidParams)).rejects.toThrow();
    });
  });
});
