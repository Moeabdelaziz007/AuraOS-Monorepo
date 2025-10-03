import Stripe from 'stripe';
import { getStripeClient } from './stripe-client';

/**
 * Verify and construct Stripe webhook event
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  const stripe = getStripeClient();

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error}`);
  }
}

/**
 * Extract subscription data from checkout session completed event
 */
export function extractSubscriptionFromCheckout(
  session: Stripe.Checkout.Session
): {
  userId: string;
  customerId: string;
  subscriptionId: string;
  currentPeriodEnd: number;
} {
  const userId = session.client_reference_id || session.metadata?.userId;
  
  if (!userId) {
    throw new Error('User ID not found in checkout session');
  }

  if (!session.customer || typeof session.customer !== 'string') {
    throw new Error('Customer ID not found in checkout session');
  }

  if (!session.subscription || typeof session.subscription !== 'string') {
    throw new Error('Subscription ID not found in checkout session');
  }

  return {
    userId,
    customerId: session.customer,
    subscriptionId: session.subscription,
    currentPeriodEnd: 0, // Will be updated from subscription object
  };
}

/**
 * Extract subscription data from subscription updated event
 */
export function extractSubscriptionData(
  subscription: Stripe.Subscription
): {
  subscriptionId: string;
  customerId: string;
  status: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
} {
  return {
    subscriptionId: subscription.id,
    customerId: typeof subscription.customer === 'string' 
      ? subscription.customer 
      : subscription.customer.id,
    status: subscription.status,
    currentPeriodEnd: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
}

/**
 * Get subscription by ID
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient();
  return stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Get customer by ID
 */
export async function getCustomer(
  customerId: string
): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
  const stripe = getStripeClient();
  return stripe.customers.retrieve(customerId);
}

/**
 * List all subscriptions for a customer
 */
export async function listCustomerSubscriptions(
  customerId: string
): Promise<Stripe.Subscription[]> {
  const stripe = getStripeClient();
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
  });
  return subscriptions.data;
}
