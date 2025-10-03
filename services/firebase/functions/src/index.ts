import * as admin from 'firebase-admin';
import { validateConfig } from './config';

// Initialize Firebase Admin
admin.initializeApp();

// Validate configuration
try {
  validateConfig();
} catch (error) {
  logger.error('Configuration validation failed:', error);
}

// Export Cloud Functions
export { createStripeCheckoutSession, createStripePortalSession } from './checkout';
export { stripeWebhook } from './webhook';
export { generateContent } from './content-generator';
