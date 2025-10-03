import Stripe from 'stripe';

/**
 * Stripe client singleton
 */
let stripeInstance: Stripe | null = null;

/**
 * Initialize and get Stripe client
 */
export function getStripeClient(apiKey?: string): Stripe {
  if (!stripeInstance) {
    const key = apiKey || process.env.STRIPE_SECRET_KEY;
    
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    stripeInstance = new Stripe(key, {
      apiVersion: '2023-10-16',
      typescript: true,
    });
  }

  return stripeInstance;
}

/**
 * Reset Stripe client (useful for testing)
 */
export function resetStripeClient(): void {
  stripeInstance = null;
}
