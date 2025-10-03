import React, { useEffect, useState } from 'react';
import { autopilotRewardService, type AutopilotMetrics, type AutopilotReward } from '@auraos/core/ai/autopilot-reward.service';

export const AutopilotPerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AutopilotMetrics | null>(null);
  const [recentRewards, setRecentRewards] = useState<AutopilotReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<{
    improving: boolean;
    trend: number;
    recommendations: string[];
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metricsData, rewardsData, trendsData] = await Promise.all([
        autopilotRewardService.getMetrics(),
        autopilotRewardService.getPerformanceHistory(20),
        autopilotRewardService.analyzePerformanceTrends(),
      ]);
      
      setMetrics(metricsData);
      setRecentRewards(rewardsData);
      setTrends(trendsData);
    } catch (error) {
      console.error('Error loading autopilot data:', error);
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

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🤖</div>
          <p className="text-gray-500">No autopilot performance data yet</p>
          <p className="text-sm text-gray-400 mt-2">Start using the autopilot to see metrics</p>
        </div>
      </div>
    );
  }

  const successRate = (metrics.successfulTasks / metrics.totalTasks) * 100;
  const performanceLevelEmoji = {
    novice: '🌱',
    intermediate: '🌿',
    advanced: '🌳',
    expert: '⭐',
    master: '👑',
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🤖 Autopilot Performance Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time AI performance metrics and learning progress
        </p>
      </div>

      {/* Performance Level Card */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90 mb-1">Performance Level</div>
            <div className="text-4xl font-bold flex items-center gap-3">
              <span>{performanceLevelEmoji[metrics.performanceLevel]}</span>
              <span className="capitalize">{metrics.performanceLevel}</span>
            </div>
            <div className="text-sm opacity-75 mt-2">
              Average Reward: {metrics.averageReward.toFixed(1)} / 100
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90 mb-1">Trend</div>
            <div className={`text-3xl font-bold ${trends?.improving ? 'text-green-300' : 'text-red-300'}`}>
              {trends?.improving ? '📈' : '📉'} {Math.abs(trends?.trend || 0).toFixed(1)}%
            </div>
            <div className="text-xs opacity-75 mt-1">
              {trends?.improving ? 'Improving' : 'Needs attention'}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Tasks</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalTasks}</div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            ✓ {metrics.successfulTasks} successful
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Success Rate</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{successRate.toFixed(1)}%</div>
          <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 rounded-full h-2 transition-all duration-300"
              style={{ width: `${successRate}%` }}
            />
          </div>
        </div>

        {/* Best Reward */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Best Reward</div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {metrics.bestReward.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500 mt-1">🏆 Peak performance</div>
        </div>

        {/* Learning Iterations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Learning Cycles</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {metrics.totalLearningIterations}
          </div>
          <div className="text-xs text-gray-500 mt-1">🧠 Continuous improvement</div>
        </div>
      </div>

      {/* Performance Scores */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 Performance Scores
        </h3>
        <div className="space-y-4">
          {/* Speed */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">⚡ Speed</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {metrics.averageSpeed.toFixed(1)}%
              </span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-500 rounded-full h-3 transition-all duration-300"
                style={{ width: `${metrics.averageSpeed}%` }}
              />
            </div>
          </div>

          {/* Quality */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">✨ Quality</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {metrics.averageQuality.toFixed(1)}%
              </span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-green-500 rounded-full h-3 transition-all duration-300"
                style={{ width: `${metrics.averageQuality}%` }}
              />
            </div>
          </div>

          {/* Accuracy */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">🎯 Accuracy</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {metrics.averageAccuracy.toFixed(1)}%
              </span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-purple-500 rounded-full h-3 transition-all duration-300"
                style={{ width: `${metrics.averageAccuracy}%` }}
              />
            </div>
          </div>

          {/* Efficiency */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">💎 Efficiency</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {metrics.averageEfficiency.toFixed(1)}%
              </span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-yellow-500 rounded-full h-3 transition-all duration-300"
                style={{ width: `${metrics.averageEfficiency}%` }}
              />
            </div>
          </div>

          {/* Satisfaction */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">😊 Satisfaction</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {metrics.averageSatisfaction.toFixed(1)}%
              </span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-pink-500 rounded-full h-3 transition-all duration-300"
                style={{ width: `${metrics.averageSatisfaction}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {trends && trends.recommendations.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-3">
            💡 Improvement Recommendations
          </h3>
          <ul className="space-y-2">
            {trends.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-yellow-800 dark:text-yellow-300">
                <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📈 Recent Performance
        </h3>
        <div className="space-y-3">
          {recentRewards.slice(0, 10).map((reward, index) => (
            <div
              key={reward.taskId}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Task #{recentRewards.length - index}
                  </span>
                  {reward.totalReward >= 90 && <span>🌟</span>}
                  {reward.bonuses.perfectExecution > 0 && <span>🎯</span>}
                  {reward.bonuses.fastCompletion > 0 && <span>⚡</span>}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {reward.feedback}
                </div>
              </div>
              <div className="text-right ml-4">
                <div className={`text-lg font-bold ${
                  reward.totalReward >= 90 ? 'text-green-600' :
                  reward.totalReward >= 75 ? 'text-blue-600' :
                  reward.totalReward >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {reward.totalReward.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
