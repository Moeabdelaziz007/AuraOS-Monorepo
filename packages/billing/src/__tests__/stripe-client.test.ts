import { getStripeClient, resetStripeClient } from '../stripe-client';

describe('Stripe Client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    resetStripeClient();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetStripeClient();
  });

  describe('getStripeClient', () => {
    it('should initialize Stripe client with API key from environment', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';

      const client = getStripeClient();

      expect(client).toBeDefined();
      expect(typeof client).toBe('object');
    });

    it('should initialize Stripe client with provided API key', () => {
      const client = getStripeClient('sk_test_provided');

      expect(client).toBeDefined();
      expect(typeof client).toBe('object');
    });

    it('should return same instance on subsequent calls (singleton)', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';

      const client1 = getStripeClient();
      const client2 = getStripeClient();

      expect(client1).toBe(client2);
    });

    it('should throw error if API key is not configured', () => {
      delete process.env.STRIPE_SECRET_KEY;

      expect(() => getStripeClient()).toThrow('STRIPE_SECRET_KEY is not configured');
    });

    it('should prefer provided API key over environment variable', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_env';

      const client = getStripeClient('sk_test_provided');

      expect(client).toBeDefined();
    });
  });

  describe('resetStripeClient', () => {
    it('should reset the Stripe client instance', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';

      const client1 = getStripeClient();
      resetStripeClient();
      const client2 = getStripeClient();

      // After reset, a new instance should be created
      expect(client1).not.toBe(client2);
    });

    it('should allow re-initialization with different API key', () => {
      const client1 = getStripeClient('sk_test_first');
      resetStripeClient();
      const client2 = getStripeClient('sk_test_second');

      expect(client1).not.toBe(client2);
    });
  });
});
