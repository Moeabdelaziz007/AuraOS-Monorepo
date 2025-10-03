import Stripe from 'stripe';
import {
  constructWebhookEvent,
  extractSubscriptionFromCheckout,
  extractSubscriptionData,
  getSubscription,
  getCustomer,
  listCustomerSubscriptions,
} from '../webhook';
import { getStripeClient, resetStripeClient } from '../stripe-client';
import {
  createMockStripe,
  mockStripeCheckoutSession,
  mockStripeSubscription,
  mockStripeCustomer,
  mockStripeWebhookEvent,
} from './__mocks__/stripe.mock';

jest.mock('../stripe-client');

const mockGetStripeClient = getStripeClient as jest.MockedFunction<typeof getStripeClient>;

describe('Webhook Integration Tests', () => {
  let mockStripe: ReturnType<typeof createMockStripe>;

  beforeEach(() => {
    mockStripe = createMockStripe();
    mockGetStripeClient.mockReturnValue(mockStripe);
  });

  afterEach(() => {
    jest.clearAllMocks();
    resetStripeClient();
  });

  describe('constructWebhookEvent', () => {
    it('should construct webhook event with valid signature', () => {
      const payload = JSON.stringify({ type: 'checkout.session.completed' });
      const signature = 'valid_signature';
      const webhookSecret = 'whsec_test_secret';

      const result = constructWebhookEvent(payload, signature, webhookSecret);

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        webhookSecret
      );
      expect(result).toEqual(mockStripeWebhookEvent);
    });

    it('should accept Buffer payload', () => {
      const payload = Buffer.from(JSON.stringify({ type: 'checkout.session.completed' }));
      const signature = 'valid_signature';
      const webhookSecret = 'whsec_test_secret';

      const result = constructWebhookEvent(payload, signature, webhookSecret);

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        webhookSecret
      );
      expect(result).toEqual(mockStripeWebhookEvent);
    });

    it('should throw error for invalid signature', () => {
      const payload = JSON.stringify({ type: 'checkout.session.completed' });
      const signature = 'invalid_signature';
      const webhookSecret = 'whsec_test_secret';

      const stripeError = new Error('Invalid signature');
      mockStripe.webhooks.constructEvent = jest.fn().mockImplementation(() => {
        throw stripeError;
      });

      expect(() => constructWebhookEvent(payload, signature, webhookSecret)).toThrow(
        'Webhook signature verification failed'
      );
    });

    it('should handle malformed payload', () => {
      const payload = 'invalid json';
      const signature = 'valid_signature';
      const webhookSecret = 'whsec_test_secret';

      const stripeError = new Error('Invalid payload');
      mockStripe.webhooks.constructEvent = jest.fn().mockImplementation(() => {
        throw stripeError;
      });

      expect(() => constructWebhookEvent(payload, signature, webhookSecret)).toThrow(
        'Webhook signature verification failed'
      );
    });
  });

  describe('extractSubscriptionFromCheckout', () => {
    it('should extract subscription data from checkout session', () => {
      const result = extractSubscriptionFromCheckout(mockStripeCheckoutSession);

      expect(result).toEqual({
        userId: 'user_123',
        customerId: 'cus_test_123',
        subscriptionId: 'sub_test_123',
        currentPeriodEnd: 0,
      });
    });

    it('should extract userId from client_reference_id', () => {
      const session = {
        ...mockStripeCheckoutSession,
        client_reference_id: 'user_from_ref',
        metadata: {},
      };

      const result = extractSubscriptionFromCheckout(session);

      expect(result.userId).toBe('user_from_ref');
    });

    it('should extract userId from metadata if client_reference_id is missing', () => {
      const session = {
        ...mockStripeCheckoutSession,
        client_reference_id: null,
        metadata: { userId: 'user_from_metadata' },
      };

      const result = extractSubscriptionFromCheckout(session);

      expect(result.userId).toBe('user_from_metadata');
    });

    it('should throw error if userId is missing', () => {
      const session = {
        ...mockStripeCheckoutSession,
        client_reference_id: null,
        metadata: {},
      };

      expect(() => extractSubscriptionFromCheckout(session)).toThrow(
        'User ID not found in checkout session'
      );
    });

    it('should throw error if customer is missing', () => {
      const session = {
        ...mockStripeCheckoutSession,
        customer: null,
      };

      expect(() => extractSubscriptionFromCheckout(session)).toThrow(
        'Customer ID not found in checkout session'
      );
    });

    it('should throw error if customer is an object', () => {
      const session = {
        ...mockStripeCheckoutSession,
        customer: { id: 'cus_test_123' } as any,
      };

      expect(() => extractSubscriptionFromCheckout(session)).toThrow(
        'Customer ID not found in checkout session'
      );
    });

    it('should throw error if subscription is missing', () => {
      const session = {
        ...mockStripeCheckoutSession,
        subscription: null,
      };

      expect(() => extractSubscriptionFromCheckout(session)).toThrow(
        'Subscription ID not found in checkout session'
      );
    });

    it('should throw error if subscription is an object', () => {
      const session = {
        ...mockStripeCheckoutSession,
        subscription: { id: 'sub_test_123' } as any,
      };

      expect(() => extractSubscriptionFromCheckout(session)).toThrow(
        'Subscription ID not found in checkout session'
      );
    });
  });

  describe('extractSubscriptionData', () => {
    it('should extract subscription data with string customer', () => {
      const result = extractSubscriptionData(mockStripeSubscription);

      expect(result).toEqual({
        subscriptionId: 'sub_test_123',
        customerId: 'cus_test_123',
        status: 'active',
        currentPeriodEnd: 1237159890,
        cancelAtPeriodEnd: false,
      });
    });

    it('should extract subscription data with customer object', () => {
      const subscription = {
        ...mockStripeSubscription,
        customer: mockStripeCustomer,
      };

      const result = extractSubscriptionData(subscription);

      expect(result).toEqual({
        subscriptionId: 'sub_test_123',
        customerId: 'cus_test_123',
        status: 'active',
        currentPeriodEnd: 1237159890,
        cancelAtPeriodEnd: false,
      });
    });

    it('should handle canceled subscription', () => {
      const subscription = {
        ...mockStripeSubscription,
        status: 'canceled' as Stripe.Subscription.Status,
        cancel_at_period_end: true,
      };

      const result = extractSubscriptionData(subscription);

      expect(result.status).toBe('canceled');
      expect(result.cancelAtPeriodEnd).toBe(true);
    });

    it('should handle past_due subscription', () => {
      const subscription = {
        ...mockStripeSubscription,
        status: 'past_due' as Stripe.Subscription.Status,
      };

      const result = extractSubscriptionData(subscription);

      expect(result.status).toBe('past_due');
    });

    it('should handle trialing subscription', () => {
      const subscription = {
        ...mockStripeSubscription,
        status: 'trialing' as Stripe.Subscription.Status,
      };

      const result = extractSubscriptionData(subscription);

      expect(result.status).toBe('trialing');
    });
  });

  describe('getSubscription', () => {
    it('should retrieve subscription by ID', async () => {
      const subscriptionId = 'sub_test_123';

      const result = await getSubscription(subscriptionId);

      expect(mockStripe.subscriptions.retrieve).toHaveBeenCalledWith(subscriptionId);
      expect(result).toEqual(mockStripeSubscription);
    });

    it('should propagate Stripe API errors', async () => {
      const stripeError = new Error('Subscription not found');
      mockStripe.subscriptions.retrieve = jest.fn().mockRejectedValue(stripeError);

      await expect(getSubscription('invalid_sub')).rejects.toThrow('Subscription not found');
    });
  });

  describe('getCustomer', () => {
    it('should retrieve customer by ID', async () => {
      const customerId = 'cus_test_123';

      const result = await getCustomer(customerId);

      expect(mockStripe.customers.retrieve).toHaveBeenCalledWith(customerId);
      expect(result).toEqual(mockStripeCustomer);
    });

    it('should propagate Stripe API errors', async () => {
      const stripeError = new Error('Customer not found');
      mockStripe.customers.retrieve = jest.fn().mockRejectedValue(stripeError);

      await expect(getCustomer('invalid_customer')).rejects.toThrow('Customer not found');
    });
  });

  describe('listCustomerSubscriptions', () => {
    it('should list all subscriptions for a customer', async () => {
      const customerId = 'cus_test_123';

      const result = await listCustomerSubscriptions(customerId);

      expect(mockStripe.subscriptions.list).toHaveBeenCalledWith({
        customer: customerId,
        status: 'all',
      });
      expect(result).toEqual([mockStripeSubscription]);
    });

    it('should return empty array for customer with no subscriptions', async () => {
      mockStripe.subscriptions.list = jest.fn().mockResolvedValue({
        object: 'list',
        data: [],
        has_more: false,
        url: '/v1/subscriptions',
      });

      const result = await listCustomerSubscriptions('cus_no_subs');

      expect(result).toEqual([]);
    });

    it('should propagate Stripe API errors', async () => {
      const stripeError = new Error('Customer not found');
      mockStripe.subscriptions.list = jest.fn().mockRejectedValue(stripeError);

      await expect(listCustomerSubscriptions('invalid_customer')).rejects.toThrow(
        'Customer not found'
      );
    });
  });

  describe('Webhook Event Flow Integration', () => {
    it('should handle complete checkout.session.completed flow', () => {
      const payload = JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: mockStripeCheckoutSession },
      });
      const signature = 'valid_signature';
      const webhookSecret = 'whsec_test_secret';

      const event = constructWebhookEvent(payload, signature, webhookSecret);
      expect(event.type).toBe('checkout.session.completed');

      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionData = extractSubscriptionFromCheckout(session);

      expect(subscriptionData.userId).toBe('user_123');
      expect(subscriptionData.customerId).toBe('cus_test_123');
      expect(subscriptionData.subscriptionId).toBe('sub_test_123');
    });

    it('should handle subscription.updated event flow', async () => {
      const updatedSubscription = {
        ...mockStripeSubscription,
        status: 'past_due' as Stripe.Subscription.Status,
      };

      mockStripe.subscriptions.retrieve = jest.fn().mockResolvedValue(updatedSubscription);

      const subscription = await getSubscription('sub_test_123');
      const data = extractSubscriptionData(subscription);

      expect(data.status).toBe('past_due');
      expect(data.subscriptionId).toBe('sub_test_123');
    });
  });
});
