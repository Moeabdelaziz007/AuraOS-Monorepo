import React from 'react';

interface UsageBarProps {
  label: string;
  current: number;
  limit: number | 'unlimited';
  unit?: string;
  showUpgrade?: boolean;
  onUpgrade?: () => void;
}

export const UsageBar: React.FC<UsageBarProps> = ({
  label,
  current,
  limit,
  unit = '',
  showUpgrade = false,
  onUpgrade,
}) => {
  const isUnlimited = limit === 'unlimited';
  const percentage = isUnlimited ? 0 : Math.min(100, (current / (limit as number)) * 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {current} {unit} / {isUnlimited ? '∞' : `${limit} ${unit}`}
        </span>
      </div>

      {!isUnlimited && (
        <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full transition-all ${
              isAtLimit
                ? 'bg-red-500'
                : isNearLimit
                ? 'bg-yellow-500'
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {isUnlimited && (
        <div className="mb-2 flex items-center text-sm text-green-600 dark:text-green-400">
          <svg
            className="mr-1 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Unlimited
        </div>
      )}

      {!isUnlimited && isAtLimit && showUpgrade && (
        <div className="mt-2 flex items-center justify-between rounded-md bg-red-50 p-2 dark:bg-red-900/20">
          <span className="text-xs text-red-700 dark:text-red-400">
            Limit reached
          </span>
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="text-xs font-semibold text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Upgrade →
            </button>
          )}
        </div>
      )}

      {!isUnlimited && isNearLimit && !isAtLimit && showUpgrade && (
        <div className="mt-2 flex items-center justify-between rounded-md bg-yellow-50 p-2 dark:bg-yellow-900/20">
          <span className="text-xs text-yellow-700 dark:text-yellow-400">
            Approaching limit
          </span>
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="text-xs font-semibold text-yellow-700 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
            >
              Upgrade →
            </button>
          )}
        </div>
      )}
    </div>
  );
};
