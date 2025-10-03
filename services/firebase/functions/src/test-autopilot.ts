/**
 * Test script for Content Generator Autopilot Integration
 */

import { contentGeneratorAutopilot } from './autopilot-integration';

async function testContentGeneratorAutopilot() {
  logger.info('🚀 Testing Content Generator Autopilot Integration\n');
  logger.info('='.repeat(60));

  const testUserId = 'test_user_456';

  // Test 1: Learn from content generations
  logger.info('\n📝 Test 1: Learning from content generations');
  logger.info('-'.repeat(60));
  
  await contentGeneratorAutopilot.learnFromGeneration(
    testUserId,
    'blog_post',
    'AI and Machine Learning',
    { includeIntro: true, includeConclusion: true, length: 'long' },
    3500,
    true
  );

  await contentGeneratorAutopilot.learnFromGeneration(
    testUserId,
    'social_media',
    'Productivity Tips',
    { includeHashtags: true, includeEmojis: true, platform: 'twitter' },
    1200,
    true
  );

  await contentGeneratorAutopilot.learnFromGeneration(
    testUserId,
    'email_template',
    'Newsletter',
    { includeSubject: true, includeCallToAction: true },
    2000,
    true
  );

  logger.info('✅ Learned from 3 content generations');

  // Test 2: Simulate repeated pattern
  logger.info('\n🔄 Test 2: Simulating repeated generation pattern');
  logger.info('-'.repeat(60));
  
  for (let i = 0; i < 5; i++) {
    await contentGeneratorAutopilot.learnFromGeneration(
      testUserId,
      'blog_post',
      `Topic ${i + 1}`,
      { includeIntro: true, includeConclusion: true, length: 'medium' },
      2500 + Math.random() * 1000,
      true
    );
  }
  
  logger.info('✅ Generated 5 blog posts with similar options');
  logger.info('   Autopilot should detect this pattern');

  // Test 3: Get optimization suggestions
  logger.info('\n💡 Test 3: Getting optimization suggestions');
  logger.info('-'.repeat(60));
  
  const suggestions = contentGeneratorAutopilot.getOptimizationSuggestions(testUserId);
  if (suggestions.length > 0) {
    logger.info('Suggestions:');
    suggestions.forEach((s, i) => logger.info(`  ${i + 1}. ${s}`));
  } else {
    logger.info('No suggestions yet (need more data)');
  }

  // Test 4: Get user statistics
  logger.info('\n📊 Test 4: User statistics');
  logger.info('-'.repeat(60));
  
  const stats = contentGeneratorAutopilot.getUserStats(testUserId);
  
  logger.info('Autopilot Stats:');
  logger.info(`  Total Tasks: ${stats.autopilot.totalTasks}`);
  logger.info(`  Enabled Tasks: ${stats.autopilot.enabledTasks}`);
  logger.info(`  Total Executions: ${stats.autopilot.totalExecutions}`);
  logger.info(`  Success Rate: ${(stats.autopilot.averageSuccessRate * 100).toFixed(1)}%`);
  
  logger.info('\nReward Stats:');
  logger.info(`  Level: ${stats.rewards.level} (${stats.rewards.levelTitle})`);
  logger.info(`  Total Points: ${stats.rewards.totalPoints}`);
  logger.info(`  Experience: ${stats.rewards.experience}/${stats.rewards.experienceToNext}`);
  logger.info(`  Current Streak: ${stats.rewards.streak}`);
  logger.info(`  Achievements: ${stats.rewards.achievementsUnlocked}/${stats.rewards.totalAchievements}`);
  
  logger.info('\nSmart Analysis:');
  logger.info(`  Smart Rate: ${stats.smartRate}/100`);
  logger.info(`  Insights: ${stats.insights.length}`);
  
  if (stats.insights.length > 0) {
    logger.info('\n  Generated Insights:');
    stats.insights.forEach(insight => {
      logger.info(`    [${insight.type}] ${insight.title}`);
      logger.info(`      ${insight.description}`);
    });
  }
  
  logger.info('\nContent Stats:');
  logger.info(`  Total Generations: ${stats.contentStats.totalGenerations}`);
  logger.info(`  Favorite Type: ${stats.contentStats.favoriteType || 'N/A'}`);
  logger.info(`  Avg Generation Time: ${Math.round(stats.contentStats.avgGenerationTime)}ms`);
  logger.info(`  Success Rate: ${(stats.contentStats.successRate * 100).toFixed(1)}%`);
  logger.info(`  Common Options: ${stats.contentStats.commonOptions.join(', ') || 'None yet'}`);

  // Test 5: Create workflow
  logger.info('\n⚙️  Test 5: Creating automated workflow');
  logger.info('-'.repeat(60));
  
  const workflowId = await contentGeneratorAutopilot.createWorkflow(
    testUserId,
    'Quick Blog Post',
    'blog_post',
    { includeIntro: true, includeConclusion: true, length: 'medium' }
  );
  
  logger.info(`✅ Created workflow: ${workflowId}`);

  // Test 6: Get performance insights
  logger.info('\n📈 Test 6: Performance insights');
  logger.info('-'.repeat(60));
  
  const insights = contentGeneratorAutopilot.getPerformanceInsights(testUserId);
  
  logger.info(`Speed Improvement: ${insights.speedImprovement.toFixed(1)}%`);
  logger.info(`Quality Score: ${insights.qualityScore.toFixed(1)}/100`);
  logger.info(`Efficiency Rating: ${insights.efficiencyRating}`);
  
  if (insights.recommendations.length > 0) {
    logger.info('\nRecommendations:');
    insights.recommendations.forEach((r, i) => {
      logger.info(`  ${i + 1}. ${r}`);
    });
  }

  // Test 7: Simulate some failures
  logger.info('\n❌ Test 7: Learning from failures');
  logger.info('-'.repeat(60));
  
  await contentGeneratorAutopilot.learnFromGeneration(
    testUserId,
    'blog_post',
    'Invalid Topic',
    {},
    5000,
    false
  );

  await contentGeneratorAutopilot.learnFromGeneration(
    testUserId,
    'blog_post',
    'Another Topic',
    { includeIntro: true },
    2800,
    true
  );

  logger.info('✅ Learned from 1 failure and 1 success');
  logger.info('   Autopilot adjusts success rate accordingly');

  // Test 8: Export data
  logger.info('\n💾 Test 8: Export learning data');
  logger.info('-'.repeat(60));
  
  const exportedData = await contentGeneratorAutopilot.exportData();
  const dataSize = new Blob([exportedData]).size;
  logger.info(`✅ Exported ${dataSize} bytes of learning data`);
  logger.info(`   Data includes tasks, history, and patterns`);

  // Final summary
  logger.info('\n' + '='.repeat(60));
  logger.info('🎉 Content Generator Autopilot Test Complete!');
  logger.info('='.repeat(60));
  
  const finalStats = contentGeneratorAutopilot.getUserStats(testUserId);
  const finalInsights = contentGeneratorAutopilot.getPerformanceInsights(testUserId);
  
  logger.info(`\n📈 Final Stats:`);
  logger.info(`   Generations: ${finalStats.contentStats.totalGenerations}`);
  logger.info(`   Favorite Type: ${finalStats.contentStats.favoriteType || 'N/A'}`);
  logger.info(`   Success Rate: ${(finalStats.contentStats.successRate * 100).toFixed(1)}%`);
  logger.info(`   Smart Rate: ${finalStats.smartRate}/100`);
  logger.info(`   Level: ${finalStats.rewards.level} (${finalStats.rewards.levelTitle})`);
  logger.info(`   Efficiency: ${finalInsights.efficiencyRating}`);
  logger.info(`   Quality Score: ${finalInsights.qualityScore.toFixed(1)}/100`);
}

// Run tests
testContentGeneratorAutopilot().catch(error => {
  logger.error('❌ Test failed:', error);
  process.exit(1);
});
