/**
 * Test script for Telegram Autopilot Integration
 */

import { telegramAutopilot } from './autopilot-integration';

async function testTelegramAutopilot() {
  console.log('🚀 Testing Telegram Autopilot Integration\n');
  console.log('='.repeat(60));

  const testUserId = 'test_user_123';

  // Test 1: Learn from commands
  console.log('\n📝 Test 1: Learning from user commands');
  console.log('-'.repeat(60));
  
  await telegramAutopilot.learnFromCommand(testUserId, 'start', []);
  await telegramAutopilot.learnFromCommand(testUserId, 'help', []);
  await telegramAutopilot.learnFromCommand(testUserId, 'generate', ['blog', 'AI technology']);
  await telegramAutopilot.learnFromCommand(testUserId, 'generate', ['social', 'productivity tips']);
  await telegramAutopilot.learnFromCommand(testUserId, 'generate', ['email', 'newsletter']);
  
  console.log('✅ Learned from 5 commands');

  // Test 2: Get suggestions
  console.log('\n💡 Test 2: Getting automation suggestions');
  console.log('-'.repeat(60));
  
  const suggestions = telegramAutopilot.getSuggestionsForUser(testUserId);
  if (suggestions.length > 0) {
    console.log('Suggestions:');
    suggestions.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
  } else {
    console.log('No suggestions yet (need more data)');
  }

  // Test 3: Simulate repeated commands
  console.log('\n🔄 Test 3: Simulating repeated command pattern');
  console.log('-'.repeat(60));
  
  for (let i = 0; i < 5; i++) {
    await telegramAutopilot.learnFromCommand(testUserId, 'status', []);
  }
  
  console.log('✅ Executed /status command 5 times');
  console.log('   Autopilot should detect this pattern');

  // Test 4: Get user statistics
  console.log('\n📊 Test 4: User statistics');
  console.log('-'.repeat(60));
  
  const stats = telegramAutopilot.getUserStats(testUserId);
  
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
  
  console.log('\nCommand Stats:');
  console.log(`  Total Commands: ${stats.commandStats.totalCommands}`);
  console.log(`  Unique Commands: ${stats.commandStats.uniqueCommands}`);
  console.log(`  Most Used: /${stats.commandStats.mostUsedCommand || 'N/A'}`);

  // Test 5: Execute automated task
  console.log('\n⚡ Test 5: Executing automated task');
  console.log('-'.repeat(60));
  
  const tasks = telegramAutopilot['autopilot'].getTasks();
  if (tasks.length > 0) {
    const firstTask = tasks[0];
    console.log(`Executing task: ${firstTask.name}`);
    
    const result = await telegramAutopilot.executeAutomatedTask(firstTask.id, testUserId);
    
    console.log(`Result: ${result.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`Duration: ${result.duration}ms`);
  } else {
    console.log('No tasks available yet');
  }

  // Test 6: Export data
  console.log('\n💾 Test 6: Export learning data');
  console.log('-'.repeat(60));
  
  const exportedData = await telegramAutopilot.exportData();
  const dataSize = new Blob([exportedData]).size;
  console.log(`✅ Exported ${dataSize} bytes of learning data`);
  console.log(`   Data includes tasks, history, and suggestions`);

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('🎉 Telegram Autopilot Test Complete!');
  console.log('='.repeat(60));
  
  const finalStats = telegramAutopilot.getUserStats(testUserId);
  console.log(`\n📈 Final Stats:`);
  console.log(`   Commands Processed: ${finalStats.commandStats.totalCommands}`);
  console.log(`   Tasks Learned: ${finalStats.autopilot.totalTasks}`);
  console.log(`   Smart Rate: ${finalStats.smartRate}/100`);
  console.log(`   Level: ${finalStats.rewards.level} (${finalStats.rewards.levelTitle})`);
  console.log(`   Achievements: ${finalStats.rewards.achievementsUnlocked}`);
}

// Run tests
testTelegramAutopilot().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
