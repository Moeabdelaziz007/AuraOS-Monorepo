import React, { useEffect, useState } from 'react';
import { rewardSystemService, type UserRewards, type Achievement } from '@auraos/core/learning/reward-system.service';
import { useAuth } from '../../hooks/useAuth';

export const RewardsPanel: React.FC = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<UserRewards | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | Achievement['category']>('all');

  useEffect(() => {
    if (user) {
      loadRewards();
    }
  }, [user]);

  const loadRewards = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await rewardSystemService.getRewards(user.uid);
      setRewards(data);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!rewards) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No rewards data available</p>
      </div>
    );
  }

  const progressPercentage = (rewards.experience / rewards.experienceToNextLevel) * 100;
  const allAchievements = rewardSystemService.getAllAchievements();
  const unlockedIds = new Set(rewards.achievements.map(a => a.id));

  const filteredAchievements = selectedCategory === 'all'
    ? allAchievements
    : allAchievements.filter(a => a.category === selectedCategory);

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Level Card */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="text-sm opacity-90">Level</div>
          <div className="text-3xl font-bold">{rewards.level}</div>
          <div className="text-xs opacity-75 mt-1">
            {rewards.experience} / {rewards.experienceToNextLevel} XP
          </div>
          <div className="mt-2 bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Points Card */}
        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="text-sm opacity-90">Total Points</div>
          <div className="text-3xl font-bold">{rewards.totalPoints.toLocaleString()}</div>
          <div className="text-xs opacity-75 mt-1">All-time earned</div>
        </div>

        {/* Streak Card */}
        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-lg p-4 text-white">
          <div className="text-sm opacity-90">Current Streak</div>
          <div className="text-3xl font-bold flex items-center gap-2">
            🔥 {rewards.streak}
          </div>
          <div className="text-xs opacity-75 mt-1">
            Best: {rewards.longestStreak} days
          </div>
        </div>

        {/* Achievements Card */}
        <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-lg p-4 text-white">
          <div className="text-sm opacity-90">Achievements</div>
          <div className="text-3xl font-bold">
            {rewards.achievements.length} / {allAchievements.length}
          </div>
          <div className="text-xs opacity-75 mt-1">
            {Math.round((rewards.achievements.length / allAchievements.length) * 100)}% Complete
          </div>
        </div>
      </div>

      {/* Badges */}
      {rewards.badges.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            🏅 Badges
          </h3>
          <div className="flex flex-wrap gap-3">
            {rewards.badges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-full"
                title={badge.description}
              >
                <span className="text-2xl">{badge.icon}</span>
                <span className="font-semibold">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🏆 Achievements
          </h3>
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All</option>
            <option value="productivity">Productivity</option>
            <option value="learning">Learning</option>
            <option value="mastery">Mastery</option>
            <option value="special">Special</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => {
            const achievementId = achievement.name.toLowerCase().replace(/\s+/g, '_');
            const isUnlocked = unlockedIds.has(achievementId);
            const rarityColors = {
              common: 'from-gray-400 to-gray-600',
              rare: 'from-blue-400 to-blue-600',
              epic: 'from-purple-400 to-purple-600',
              legendary: 'from-yellow-400 to-yellow-600',
            };

            return (
              <div
                key={achievementId}
                className={`relative rounded-lg p-4 border-2 transition-all ${
                  isUnlocked
                    ? `bg-gradient-to-br ${rarityColors[achievement.rarity]} text-white border-transparent`
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-600 opacity-60'
                }`}
              >
                {/* Rarity Badge */}
                <div className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full ${
                  isUnlocked ? 'bg-white/20' : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  {achievement.rarity}
                </div>

                {/* Icon */}
                <div className="text-4xl mb-2">{achievement.icon}</div>

                {/* Name */}
                <h4 className="font-bold text-lg mb-1">{achievement.name}</h4>

                {/* Description */}
                <p className={`text-sm mb-2 ${isUnlocked ? 'opacity-90' : ''}`}>
                  {achievement.description}
                </p>

                {/* Points */}
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">+{achievement.points} pts</span>
                  {isUnlocked && (
                    <span className="text-xs opacity-75">✓ Unlocked</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mt-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          📊 Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{rewards.stats.totalSessions}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{rewards.stats.totalAppsLaunched}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Apps Launched</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">{rewards.stats.totalAIInteractions}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">AI Interactions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{rewards.stats.totalCommandsExecuted}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Commands</div>
          </div>
        </div>
      </div>
    </div>
  );
};
