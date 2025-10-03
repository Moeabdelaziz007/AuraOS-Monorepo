import React from 'react';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: PricingFeature[];
  buttonText: string;
  buttonVariant?: 'primary' | 'secondary';
  popular?: boolean;
  onSelect: () => void;
  loading?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  buttonVariant = 'secondary',
  popular = false,
  onSelect,
  loading = false,
}) => {
  return (
    <div
      className={`relative rounded-2xl border-2 p-8 ${
        popular
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1 text-sm font-semibold text-white">
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-5xl font-bold text-gray-900 dark:text-white">
            {price}
          </span>
          {period && (
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {period}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onSelect}
        disabled={loading}
        className={`mb-6 w-full rounded-lg px-6 py-3 font-semibold transition-all ${
          buttonVariant === 'primary'
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 disabled:opacity-50'
            : 'border-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 disabled:opacity-50'
        }`}
      >
        {loading ? 'Loading...' : buttonText}
      </button>

      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg
              className={`mr-3 h-5 w-5 flex-shrink-0 ${
                feature.included
                  ? 'text-green-500'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {feature.included ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              )}
            </svg>
            <span
              className={
                feature.included
                  ? 'text-gray-700 dark:text-gray-300'
                  : 'text-gray-400 dark:text-gray-600'
              }
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
