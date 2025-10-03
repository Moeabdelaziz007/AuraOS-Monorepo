/**
 * Test script for Telegram Autopilot Integration
 */

import { telegramAutopilot } from './autopilot-integration';

async function testTelegramAutopilot() {
  logger.info('🚀 Testing Telegram Autopilot Integration\n');
  logger.info('='.repeat(60));

  const testUserId = 'test_user_123';

  // Test 1: Learn from commands
  logger.info('\n📝 Test 1: Learning from user commands');
  logger.info('-'.repeat(60));
  
  await telegramAutopilot.learnFromCommand(testUserId, 'start', []);
  await telegramAutopilot.learnFromCommand(testUserId, 'help', []);
  await telegramAutopilot.learnFromCommand(testUserId, 'generate', ['blog', 'AI technology']);
  await telegramAutopilot.learnFromCommand(testUserId, 'generate', ['social', 'productivity tips']);
  await telegramAutopilot.learnFromCommand(testUserId, 'generate', ['email', 'newsletter']);
  
  logger.info('✅ Learned from 5 commands');

  // Test 2: Get suggestions
  logger.info('\n💡 Test 2: Getting automation suggestions');
  logger.info('-'.repeat(60));
  
  const suggestions = telegramAutopilot.getSuggestionsForUser(testUserId);
  if (suggestions.length > 0) {
    logger.info('Suggestions:');
    suggestions.forEach((s, i) => logger.info(`  ${i + 1}. ${s}`));
  } else {
    logger.info('No suggestions yet (need more data)');
  }

  // Test 3: Simulate repeated commands
  logger.info('\n🔄 Test 3: Simulating repeated command pattern');
  logger.info('-'.repeat(60));
  
  for (let i = 0; i < 5; i++) {
    await telegramAutopilot.learnFromCommand(testUserId, 'status', []);
  }
  
  logger.info('✅ Executed /status command 5 times');
  logger.info('   Autopilot should detect this pattern');

  // Test 4: Get user statistics
  logger.info('\n📊 Test 4: User statistics');
  logger.info('-'.repeat(60));
  
  const stats = telegramAutopilot.getUserStats(testUserId);
  
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
  
  logger.info('\nCommand Stats:');
  logger.info(`  Total Commands: ${stats.commandStats.totalCommands}`);
  logger.info(`  Unique Commands: ${stats.commandStats.uniqueCommands}`);
  logger.info(`  Most Used: /${stats.commandStats.mostUsedCommand || 'N/A'}`);

  // Test 5: Execute automated task
  logger.info('\n⚡ Test 5: Executing automated task');
  logger.info('-'.repeat(60));
  
  const tasks = telegramAutopilot['autopilot'].getTasks();
  if (tasks.length > 0) {
    const firstTask = tasks[0];
    logger.info(`Executing task: ${firstTask.name}`);
    
    const result = await telegramAutopilot.executeAutomatedTask(firstTask.id, testUserId);
    
    logger.info(`Result: ${result.success ? '✅ Success' : '❌ Failed'}`);
    logger.info(`Duration: ${result.duration}ms`);
  } else {
    logger.info('No tasks available yet');
  }

  // Test 6: Export data
  logger.info('\n💾 Test 6: Export learning data');
  logger.info('-'.repeat(60));
  
  const exportedData = await telegramAutopilot.exportData();
  const dataSize = new Blob([exportedData]).size;
  logger.info(`✅ Exported ${dataSize} bytes of learning data`);
  logger.info(`   Data includes tasks, history, and suggestions`);

  // Final summary
  logger.info('\n' + '='.repeat(60));
  logger.info('🎉 Telegram Autopilot Test Complete!');
  logger.info('='.repeat(60));
  
  const finalStats = telegramAutopilot.getUserStats(testUserId);
  logger.info(`\n📈 Final Stats:`);
  logger.info(`   Commands Processed: ${finalStats.commandStats.totalCommands}`);
  logger.info(`   Tasks Learned: ${finalStats.autopilot.totalTasks}`);
  logger.info(`   Smart Rate: ${finalStats.smartRate}/100`);
  logger.info(`   Level: ${finalStats.rewards.level} (${finalStats.rewards.levelTitle})`);
  logger.info(`   Achievements: ${finalStats.rewards.achievementsUnlocked}`);
}

// Run tests
testTelegramAutopilot().catch(error => {
  logger.error('❌ Test failed:', error);
  process.exit(1);
});
