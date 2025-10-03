import React, { useEffect, useState } from 'react';
import { type RewardEvent } from '@auraos/core/learning/reward-system.service';

interface RewardNotificationProps {
  events: RewardEvent[];
  onClose: () => void;
}

export const RewardNotification: React.FC<RewardNotificationProps> = ({ events, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {events.map((event, index) => (
        <div
          key={index}
          className={`transform transition-all duration-300 ${
            visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}
          style={{ transitionDelay: `${index * 100}ms` }}
        >
          <div className={`rounded-lg shadow-lg p-4 ${getEventColor(event.type)}`}>
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="text-3xl">{getEventIcon(event.type)}</div>

              {/* Content */}
              <div className="flex-1">
                <div className="font-semibold text-white mb-1">
                  {event.description}
                </div>
                
                {event.points > 0 && (
                  <div className="text-sm text-white/90">
                    +{event.points} points
                  </div>
                )}

                {event.achievement && (
                  <div className="mt-2 bg-white/20 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{event.achievement.icon}</span>
                      <div>
                        <div className="font-semibold text-white text-sm">
                          {event.achievement.name}
                        </div>
                        <div className="text-xs text-white/80">
                          {event.achievement.description}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {event.badge && (
                  <div className="mt-2 bg-white/20 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{event.badge.icon}</span>
                      <div>
                        <div className="font-semibold text-white text-sm">
                          {event.badge.name}
                        </div>
                        <div className="text-xs text-white/80">
                          {event.badge.description}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

function getEventColor(type: RewardEvent['type']): string {
  switch (type) {
    case 'achievement':
      return 'bg-gradient-to-r from-yellow-500 to-orange-600';
    case 'milestone':
      return 'bg-gradient-to-r from-purple-500 to-pink-600';
    case 'streak':
      return 'bg-gradient-to-r from-red-500 to-orange-600';
    case 'bonus':
      return 'bg-gradient-to-r from-green-500 to-teal-600';
    default:
      return 'bg-gradient-to-r from-blue-500 to-indigo-600';
  }
}

function getEventIcon(type: RewardEvent['type']): string {
  switch (type) {
    case 'achievement':
      return '🏆';
    case 'milestone':
      return '🎉';
    case 'streak':
      return '🔥';
    case 'bonus':
      return '💎';
    default:
      return '⭐';
  }
}
