/**
 * Firebase Functions configuration
 */

export const config = {
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    priceIds: {
      proMonthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || '',
      proYearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY || '',
    },
  },
  app: {
    url: process.env.APP_URL || 'https://selfos-62f70.web.app',
  },
};

/**
 * Validate required environment variables
 */
export function validateConfig(): void {
  const required = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_PRICE_ID_PRO_MONTHLY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}
