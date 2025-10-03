/**
 * Test script for Content Generator Autopilot Integration
 */

import { contentGeneratorAutopilot } from './autopilot-integration';

async function testContentGeneratorAutopilot() {
  console.log('🚀 Testing Content Generator Autopilot Integration\n');
  console.log('='.repeat(60));

  const testUserId = 'test_user_456';

  // Test 1: Learn from content generations
  console.log('\n📝 Test 1: Learning from content generations');
  console.log('-'.repeat(60));
  
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

  console.log('✅ Learned from 3 content generations');

  // Test 2: Simulate repeated pattern
  console.log('\n🔄 Test 2: Simulating repeated generation pattern');
  console.log('-'.repeat(60));
  
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
  
  console.log('✅ Generated 5 blog posts with similar options');
  console.log('   Autopilot should detect this pattern');

  // Test 3: Get optimization suggestions
  console.log('\n💡 Test 3: Getting optimization suggestions');
  console.log('-'.repeat(60));
  
  const suggestions = contentGeneratorAutopilot.getOptimizationSuggestions(testUserId);
  if (suggestions.length > 0) {
    console.log('Suggestions:');
    suggestions.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
  } else {
    console.log('No suggestions yet (need more data)');
  }

  // Test 4: Get user statistics
  console.log('\n📊 Test 4: User statistics');
  console.log('-'.repeat(60));
  
  const stats = contentGeneratorAutopilot.getUserStats(testUserId);
  
  console.log('Autopilot Stats:');
  console.log(`  Total Tasks: ${stats.autopilot.totalTasks}`);
  console.log(`  Enabled Tasks: ${stats.autopilot.enabledTasks}`);
  console.log(`  Total Executions: ${stats.autopilot.totalExecutions}`);
  console.log(`  Success Rate: ${(stats.autopilot.averageSuccessRate * 100).toFixed(1)}%`);
  
  console.log('\nReward Stats:');
  console.log(`  Level: ${stats.rewards.level} (${stats.rewards.levelTitle})`);
  console.log(`  Total Points: ${stats.rewards.totalPoints}`);
  console.log(`  Experience: ${stats.rewards.experience}/${stats.rewards.experienceToNext}`);
  console.log(`  Current Streak: ${stats.rewards.streak}`);
  console.log(`  Achievements: ${stats.rewards.achievementsUnlocked}/${stats.rewards.totalAchievements}`);
  
  console.log('\nSmart Analysis:');
  console.log(`  Smart Rate: ${stats.smartRate}/100`);
  console.log(`  Insights: ${stats.insights.length}`);
  
  if (stats.insights.length > 0) {
    console.log('\n  Generated Insights:');
    stats.insights.forEach(insight => {
      console.log(`    [${insight.type}] ${insight.title}`);
      console.log(`      ${insight.description}`);
    });
  }
  
  console.log('\nContent Stats:');
  console.log(`  Total Generations: ${stats.contentStats.totalGenerations}`);
  console.log(`  Favorite Type: ${stats.contentStats.favoriteType || 'N/A'}`);
  console.log(`  Avg Generation Time: ${Math.round(stats.contentStats.avgGenerationTime)}ms`);
  console.log(`  Success Rate: ${(stats.contentStats.successRate * 100).toFixed(1)}%`);
  console.log(`  Common Options: ${stats.contentStats.commonOptions.join(', ') || 'None yet'}`);

  // Test 5: Create workflow
  console.log('\n⚙️  Test 5: Creating automated workflow');
  console.log('-'.repeat(60));
  
  const workflowId = await contentGeneratorAutopilot.createWorkflow(
    testUserId,
    'Quick Blog Post',
    'blog_post',
    { includeIntro: true, includeConclusion: true, length: 'medium' }
  );
  
  console.log(`✅ Created workflow: ${workflowId}`);

  // Test 6: Get performance insights
  console.log('\n📈 Test 6: Performance insights');
  console.log('-'.repeat(60));
  
  const insights = contentGeneratorAutopilot.getPerformanceInsights(testUserId);
  
  console.log(`Speed Improvement: ${insights.speedImprovement.toFixed(1)}%`);
  console.log(`Quality Score: ${insights.qualityScore.toFixed(1)}/100`);
  console.log(`Efficiency Rating: ${insights.efficiencyRating}`);
  
  if (insights.recommendations.length > 0) {
    console.log('\nRecommendations:');
    insights.recommendations.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r}`);
    });
  }

  // Test 7: Simulate some failures
  console.log('\n❌ Test 7: Learning from failures');
  console.log('-'.repeat(60));
  
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

  console.log('✅ Learned from 1 failure and 1 success');
  console.log('   Autopilot adjusts success rate accordingly');

  // Test 8: Export data
  console.log('\n💾 Test 8: Export learning data');
  console.log('-'.repeat(60));
  
  const exportedData = await contentGeneratorAutopilot.exportData();
  const dataSize = new Blob([exportedData]).size;
  console.log(`✅ Exported ${dataSize} bytes of learning data`);
  console.log(`   Data includes tasks, history, and patterns`);

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('🎉 Content Generator Autopilot Test Complete!');
  console.log('='.repeat(60));
  
  const finalStats = contentGeneratorAutopilot.getUserStats(testUserId);
  const finalInsights = contentGeneratorAutopilot.getPerformanceInsights(testUserId);
  
  console.log(`\n📈 Final Stats:`);
  console.log(`   Generations: ${finalStats.contentStats.totalGenerations}`);
  console.log(`   Favorite Type: ${finalStats.contentStats.favoriteType || 'N/A'}`);
  console.log(`   Success Rate: ${(finalStats.contentStats.successRate * 100).toFixed(1)}%`);
  console.log(`   Smart Rate: ${finalStats.smartRate}/100`);
  console.log(`   Level: ${finalStats.rewards.level} (${finalStats.rewards.levelTitle})`);
  console.log(`   Efficiency: ${finalInsights.efficiencyRating}`);
  console.log(`   Quality Score: ${finalInsights.qualityScore.toFixed(1)}/100`);
}

// Run tests
testContentGeneratorAutopilot().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
