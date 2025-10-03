import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { createCheckoutSession, createPortalSession } from '@auraos/billing';
import { config } from './config';

/**
 * Create a Stripe Checkout session
 * 
 * Callable function that creates a Stripe Checkout session for upgrading to Pro
 */
export const createStripeCheckoutSession = functions.https.onCall(
  async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to create a checkout session'
      );
    }

    const userId = context.auth.uid;
    const { priceId, successPath = '/success', cancelPath = '/pricing' } = data;

    // Validate price ID
    if (!priceId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Price ID is required'
      );
    }

    // Validate price ID is one of our configured prices
    const validPriceIds = [
      config.stripe.priceIds.proMonthly,
      config.stripe.priceIds.proYearly,
    ];

    if (!validPriceIds.includes(priceId)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid price ID'
      );
    }

    try {
      // Get user data for email
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();
      const userEmail = context.auth.token.email || userData?.email;

      // Create checkout session
      const session = await createCheckoutSession({
        userId,
        priceId,
        successUrl: `${config.app.url}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${config.app.url}${cancelPath}`,
        customerEmail: userEmail,
      });

      functions.logger.info('Checkout session created', {
        userId,
        sessionId: session.sessionId,
      });

      return {
        sessionId: session.sessionId,
        url: session.url,
      };
    } catch (error) {
      functions.logger.error('Error creating checkout session', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new functions.https.HttpsError(
        'internal',
        'Failed to create checkout session'
      );
    }
  }
);

/**
 * Create a Stripe Customer Portal session
 * 
 * Callable function that creates a portal session for managing subscription
 */
export const createStripePortalSession = functions.https.onCall(
  async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const userId = context.auth.uid;
    const { returnPath = '/settings/billing' } = data;

    try {
      // Get user's Stripe customer ID
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();
      const customerId = userData?.subscription?.stripeCustomerId;

      if (!customerId) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'No active subscription found'
        );
      }

      // Create portal session
      const session = await createPortalSession(
        customerId,
        `${config.app.url}${returnPath}`
      );

      functions.logger.info('Portal session created', {
        userId,
        customerId,
      });

      return {
        url: session.url,
      };
    } catch (error) {
      functions.logger.error('Error creating portal session', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new functions.https.HttpsError(
        'internal',
        'Failed to create portal session'
      );
    }
  }
);
