import {
  createCheckoutSession,
  createPortalSession,
  getCheckoutSession,
  cancelSubscription,
  reactivateSubscription,
} from '../checkout';
import { getStripeClient, resetStripeClient } from '../stripe-client';
import {
  createMockStripe,
  mockStripeCheckoutSession,
  mockStripeBillingPortalSession,
  mockStripeSubscription,
} from './__mocks__/stripe.mock';

jest.mock('../stripe-client');

const mockGetStripeClient = getStripeClient as jest.MockedFunction<typeof getStripeClient>;

describe('Checkout Integration Tests', () => {
  let mockStripe: ReturnType<typeof createMockStripe>;

  beforeEach(() => {
    mockStripe = createMockStripe();
    mockGetStripeClient.mockReturnValue(mockStripe);
  });

  afterEach(() => {
    jest.clearAllMocks();
    resetStripeClient();
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session with correct parameters', async () => {
      const params = {
        userId: 'user_123',
        priceId: 'price_pro_monthly',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
        customerEmail: 'test@example.com',
      };

      const result = await createCheckoutSession(params);

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: params.priceId,
            quantity: 1,
          },
        ],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        customer_email: params.customerEmail,
        client_reference_id: params.userId,
        metadata: {
          userId: params.userId,
        },
        subscription_data: {
          metadata: {
            userId: params.userId,
          },
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
      });

      expect(result).toEqual({
        sessionId: mockStripeCheckoutSession.id,
        url: mockStripeCheckoutSession.url,
      });
    });

    it('should create checkout session without customer email', async () => {
      const params = {
        userId: 'user_456',
        priceId: 'price_pro_yearly',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };

      const result = await createCheckoutSession(params);

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_email: undefined,
          client_reference_id: params.userId,
        })
      );

      expect(result.sessionId).toBe(mockStripeCheckoutSession.id);
    });

    it('should throw error if session URL is missing', async () => {
      const sessionWithoutUrl = { ...mockStripeCheckoutSession, url: null };
      mockStripe.checkout.sessions.create = jest.fn().mockResolvedValue(sessionWithoutUrl);

      const params = {
        userId: 'user_123',
        priceId: 'price_pro_monthly',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };

      await expect(createCheckoutSession(params)).rejects.toThrow(
        'Failed to create checkout session URL'
      );
    });

    it('should propagate Stripe API errors', async () => {
      const stripeError = new Error('Stripe API error');
      mockStripe.checkout.sessions.create = jest.fn().mockRejectedValue(stripeError);

      const params = {
        userId: 'user_123',
        priceId: 'price_pro_monthly',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };

      await expect(createCheckoutSession(params)).rejects.toThrow('Stripe API error');
    });
  });

  describe('createPortalSession', () => {
    it('should create a billing portal session', async () => {
      const customerId = 'cus_test_123';
      const returnUrl = 'https://example.com/account';

      const result = await createPortalSession(customerId, returnUrl);

      expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: customerId,
        return_url: returnUrl,
      });

      expect(result).toEqual({
        url: mockStripeBillingPortalSession.url,
      });
    });

    it('should propagate Stripe API errors', async () => {
      const stripeError = new Error('Customer not found');
      mockStripe.billingPortal.sessions.create = jest.fn().mockRejectedValue(stripeError);

      await expect(
        createPortalSession('invalid_customer', 'https://example.com/account')
      ).rejects.toThrow('Customer not found');
    });
  });

  describe('getCheckoutSession', () => {
    it('should retrieve a checkout session by ID', async () => {
      const sessionId = 'cs_test_123';

      const result = await getCheckoutSession(sessionId);

      expect(mockStripe.checkout.sessions.retrieve).toHaveBeenCalledWith(sessionId);
      expect(result).toEqual(mockStripeCheckoutSession);
    });

    it('should propagate Stripe API errors', async () => {
      const stripeError = new Error('Session not found');
      mockStripe.checkout.sessions.retrieve = jest.fn().mockRejectedValue(stripeError);

      await expect(getCheckoutSession('invalid_session')).rejects.toThrow('Session not found');
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription at period end by default', async () => {
      const subscriptionId = 'sub_test_123';

      await cancelSubscription(subscriptionId);

      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(subscriptionId, {
        cancel_at_period_end: true,
      });
    });

    it('should cancel subscription immediately when specified', async () => {
      const subscriptionId = 'sub_test_123';

      await cancelSubscription(subscriptionId, false);

      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(subscriptionId, {
        cancel_at_period_end: false,
      });
    });

    it('should propagate Stripe API errors', async () => {
      const stripeError = new Error('Subscription not found');
      mockStripe.subscriptions.update = jest.fn().mockRejectedValue(stripeError);

      await expect(cancelSubscription('invalid_sub')).rejects.toThrow('Subscription not found');
    });
  });

  describe('reactivateSubscription', () => {
    it('should reactivate a canceled subscription', async () => {
      const subscriptionId = 'sub_test_123';

      await reactivateSubscription(subscriptionId);

      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(subscriptionId, {
        cancel_at_period_end: false,
      });
    });

    it('should propagate Stripe API errors', async () => {
      const stripeError = new Error('Cannot reactivate subscription');
      mockStripe.subscriptions.update = jest.fn().mockRejectedValue(stripeError);

      await expect(reactivateSubscription('invalid_sub')).rejects.toThrow(
        'Cannot reactivate subscription'
      );
    });
  });
});
