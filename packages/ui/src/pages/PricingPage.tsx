import React, { useState } from 'react';
import { logger } from '../utils/logger';
import { PricingCard } from '../components/billing/PricingCard';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface PricingPageProps {
  currentTier?: 'free' | 'pro';
}

export const PricingPage: React.FC<PricingPageProps> = ({ currentTier = 'free' }) => {
  const [loading, setLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleUpgradeToPro = async () => {
    setLoading(true);

    try {
      const functions = getFunctions();
      const createCheckoutSession = httpsCallable(functions, 'createStripeCheckoutSession');

      // Get the appropriate price ID based on billing period
      const priceId = billingPeriod === 'monthly'
        ? import.meta.env.VITE_STRIPE_PRICE_ID_PRO_MONTHLY
        : import.meta.env.VITE_STRIPE_PRICE_ID_PRO_YEARLY;

      const result = await createCheckoutSession({
        priceId,
        successPath: '/success',
        cancelPath: '/pricing',
      });

      const data = result.data as { url: string };

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      logger.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);

    try {
      const functions = getFunctions();
      const createPortalSession = httpsCallable(functions, 'createStripePortalSession');

      const result = await createPortalSession({
        returnPath: '/settings/billing',
      });

      const data = result.data as { url: string };

      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (error) {
      logger.error('Error creating portal session:', error);
      alert('Failed to open billing portal. Please try again.');
      setLoading(false);
    }
  };

  const monthlyPrice = billingPeriod === 'monthly' ? '$19' : '$15';
  const yearlyTotal = '$180';
  const yearlySavings = '$48';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            Unlock the full power of AuraOS automation
          </p>

          {/* Billing Period Toggle */}
          <div className="mt-8 flex items-center justify-center">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`rounded-l-lg px-6 py-2 font-semibold transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`rounded-r-lg px-6 py-2 font-semibold transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              Yearly
              <span className="ml-2 rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
                Save {yearlySavings}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Free Tier */}
          <PricingCard
            title="Free"
            price="$0"
            period="/month"
            description="Perfect for getting started with automation"
            features={[
              { text: '3 active workflows', included: true },
              { text: '100 executions per month', included: true },
              { text: '1 GB storage', included: true },
              { text: 'Basic automation features', included: true },
              { text: 'Community support', included: true },
              { text: 'Advanced features', included: false },
              { text: 'Priority support', included: false },
              { text: 'Custom integrations', included: false },
            ]}
            buttonText={currentTier === 'free' ? 'Current Plan' : 'Downgrade'}
            buttonVariant="secondary"
            onSelect={() => {
              if (currentTier === 'pro') {
                handleManageSubscription();
              }
            }}
            loading={loading && currentTier === 'pro'}
          />

          {/* Pro Tier */}
          <PricingCard
            title="Aura Pro"
            price={monthlyPrice}
            period={billingPeriod === 'monthly' ? '/month' : '/month (billed yearly)'}
            description="Unlimited automation power for professionals"
            features={[
              { text: 'Unlimited workflows', included: true },
              { text: 'Unlimited executions', included: true },
              { text: '100 GB storage', included: true },
              { text: 'All automation features', included: true },
              { text: 'Priority support', included: true },
              { text: 'Advanced features', included: true },
              { text: 'Custom integrations', included: true },
              { text: 'API access', included: true },
            ]}
            buttonText={
              currentTier === 'pro'
                ? 'Manage Subscription'
                : `Upgrade to Pro ${billingPeriod === 'yearly' ? `(${yearlyTotal}/year)` : ''}`
            }
            buttonVariant="primary"
            popular={true}
            onSelect={currentTier === 'pro' ? handleManageSubscription : handleUpgradeToPro}
            loading={loading}
          />
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Can I upgrade or downgrade anytime?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Yes! You can upgrade to Pro at any time. If you downgrade, you&apos;ll keep Pro features
                until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                What happens if I exceed the free tier limits?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                You&apos;ll receive a notification when approaching limits. Once reached, you&apos;ll need to
                upgrade to Pro to create more workflows or execute more automations.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Is there a free trial for Pro?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                We offer a 14-day money-back guarantee. Try Pro risk-free and get a full refund if
                you&apos;re not satisfied.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                How do I cancel my subscription?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                You can cancel anytime from the billing portal. Your Pro features will remain active
                until the end of your billing period.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-12 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to supercharge your automation?
          </h2>
          <p className="mt-4 text-xl text-blue-100">
            Join thousands of users automating their workflows with AuraOS
          </p>
          <button
            onClick={handleUpgradeToPro}
            disabled={loading || currentTier === 'pro'}
            className="mt-8 rounded-lg bg-white px-8 py-4 font-semibold text-blue-600 transition-all hover:bg-gray-100 disabled:opacity-50"
          >
            {currentTier === 'pro' ? 'You\'re on Pro!' : 'Start Your Pro Journey'}
          </button>
        </div>
      </div>
    </div>
  );
};
