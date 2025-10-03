import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
  constructWebhookEvent,
  extractSubscriptionFromCheckout,
  extractSubscriptionData,
  getSubscription,
} from '@auraos/billing';
import type { UserSubscription, SubscriptionStatus } from '@auraos/billing';
import { config } from './config';

/**
 * Handle Stripe webhook events
 * 
 * HTTP function that processes Stripe webhook events
 */
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const signature = req.headers['stripe-signature'];

  if (!signature || typeof signature !== 'string') {
    functions.logger.error('Missing Stripe signature');
    res.status(400).send('Missing signature');
    return;
  }

  try {
    // Construct and verify webhook event
    const event = constructWebhookEvent(
      req.rawBody,
      signature,
      config.stripe.webhookSecret
    );

    functions.logger.info('Webhook event received', {
      type: event.type,
      id: event.id,
    });

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        functions.logger.info('Unhandled event type', { type: event.type });
    }

    res.json({ received: true });
  } catch (error) {
    functions.logger.error('Webhook error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(400).send(`Webhook Error: ${error}`);
  }
});

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutCompleted(session: any): Promise<void> {
  try {
    const { userId, customerId, subscriptionId } = extractSubscriptionFromCheckout(session);

    // Get full subscription details
    const subscription = await getSubscription(subscriptionId);

    // Create subscription data
    const subscriptionData: UserSubscription = {
      tier: 'pro',
      status: subscription.status as SubscriptionStatus,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Update user document in Firestore
    await admin.firestore().collection('users').doc(userId).set(
      {
        subscription: subscriptionData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    functions.logger.info('Subscription created', {
      userId,
      subscriptionId,
      tier: 'pro',
    });

    // Send welcome email (optional)
    // await sendWelcomeEmail(userId);
  } catch (error) {
    functions.logger.error('Error handling checkout completed', { error });
    throw error;
  }
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription: any): Promise<void> {
  try {
    const {
      subscriptionId,
      customerId,
      status,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    } = extractSubscriptionData(subscription);

    // Find user by customer ID
    const usersSnapshot = await admin
      .firestore()
      .collection('users')
      .where('subscription.stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      functions.logger.warn('User not found for customer', { customerId });
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;

    // Update subscription data
    const subscriptionData: Partial<UserSubscription> = {
      status: status as SubscriptionStatus,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      updatedAt: Date.now(),
    };

    // If subscription is canceled or past_due, downgrade to free
    if (status === 'canceled' || status === 'past_due') {
      subscriptionData.tier = 'free';
    }

    await admin.firestore().collection('users').doc(userId).update({
      subscription: subscriptionData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info('Subscription updated', {
      userId,
      subscriptionId,
      status,
    });
  } catch (error) {
    functions.logger.error('Error handling subscription updated', { error });
    throw error;
  }
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription: any): Promise<void> {
  try {
    const { subscriptionId, customerId } = extractSubscriptionData(subscription);

    // Find user by customer ID
    const usersSnapshot = await admin
      .firestore()
      .collection('users')
      .where('subscription.stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      functions.logger.warn('User not found for customer', { customerId });
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;

    // Downgrade to free tier
    const subscriptionData: UserSubscription = {
      tier: 'free',
      status: 'canceled',
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      createdAt: userDoc.data().subscription?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    await admin.firestore().collection('users').doc(userId).update({
      subscription: subscriptionData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info('Subscription deleted', {
      userId,
      subscriptionId,
    });
  } catch (error) {
    functions.logger.error('Error handling subscription deleted', { error });
    throw error;
  }
}

/**
 * Handle invoice.payment_succeeded event
 */
async function handlePaymentSucceeded(invoice: any): Promise<void> {
  try {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;

    functions.logger.info('Payment succeeded', {
      customerId,
      subscriptionId,
      amount: invoice.amount_paid,
    });

    // Optionally send receipt email
    // await sendReceiptEmail(customerId, invoice);
  } catch (error) {
    functions.logger.error('Error handling payment succeeded', { error });
    throw error;
  }
}

/**
 * Handle invoice.payment_failed event
 */
async function handlePaymentFailed(invoice: any): Promise<void> {
  try {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;

    // Find user by customer ID
    const usersSnapshot = await admin
      .firestore()
      .collection('users')
      .where('subscription.stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      functions.logger.warn('User not found for customer', { customerId });
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;

    // Update subscription status to past_due
    await admin.firestore().collection('users').doc(userId).update({
      'subscription.status': 'past_due',
      'subscription.updatedAt': Date.now(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.warn('Payment failed', {
      userId,
      customerId,
      subscriptionId,
    });

    // Send payment failed email
    // await sendPaymentFailedEmail(userId);
  } catch (error) {
    functions.logger.error('Error handling payment failed', { error });
    throw error;
  }
}
