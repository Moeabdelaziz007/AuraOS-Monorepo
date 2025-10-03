/**
 * Smart Task Scheduler Test
 * Simulates progressive learning over multiple weeks
 */

import { SmartTaskScheduler } from './smart-task-scheduler';

/**
 * Run 4-week learning simulation
 */
async function runLearningSimulation() {
  logger.info('🎓 Smart Task Scheduler - 4-Week Learning Simulation');
  logger.info('====================================================\n');

  const scheduler = SmartTaskScheduler.getInstance();

  // Week 1: Foundation focus
  logger.info('\n📅 WEEK 1: Building Foundation');
  logger.info('━'.repeat(80));
  await scheduler.runLearningSession(8);
  
  let stats = scheduler.getDetailedStats();
  printWeeklyReport(1, stats);

  await new Promise(resolve => setTimeout(resolve, 500));

  // Week 2: Introducing intermediate
  scheduler.advanceWeek();
  logger.info('\n📅 WEEK 2: Expanding Skills');
  logger.info('━'.repeat(80));
  await scheduler.runLearningSession(10);
  
  stats = scheduler.getDetailedStats();
  printWeeklyReport(2, stats);

  await new Promise(resolve => setTimeout(resolve, 500));

  // Week 3: Balanced approach
  scheduler.advanceWeek();
  logger.info('\n📅 WEEK 3: Balanced Growth');
  logger.info('━'.repeat(80));
  await scheduler.runLearningSession(12);
  
  stats = scheduler.getDetailedStats();
  printWeeklyReport(3, stats);

  await new Promise(resolve => setTimeout(resolve, 500));

  // Week 4: Advanced challenges
  scheduler.advanceWeek();
  logger.info('\n📅 WEEK 4: Advanced Mastery');
  logger.info('━'.repeat(80));
  await scheduler.runLearningSession(15);
  
  stats = scheduler.getDetailedStats();
  printWeeklyReport(4, stats);

  // Final comprehensive report
  printFinalReport(stats);
}

/**
 * Print weekly report
 */
function printWeeklyReport(week: number, stats: any): void {
  const progress = stats.progress;

  logger.info(`\n📊 Week ${week} Report:`);
  logger.info('─'.repeat(80));
  logger.info(`Total Tasks Completed:    ${progress.totalTasks}`);
  logger.info(`Success Rate:             ${(progress.successRate * 100).toFixed(1)}%`);
  logger.info(`Average Quality:          ${(progress.averageQuality * 100).toFixed(1)}%`);
  logger.info(`Current Tier:             ${progress.currentTier}`);
  logger.info(`Learning Rate:            ${(progress.learningRate * 100).toFixed(1)}% improvement`);
  logger.info(`Current Streak:           ${progress.streak} 🔥`);
  logger.info('');

  logger.info(`Tasks by Tier:`);
  logger.info(`  Foundation:   ${progress.tasksPerTier.foundation}`);
  logger.info(`  Intermediate: ${progress.tasksPerTier.intermediate}`);
  logger.info(`  Advanced:     ${progress.tasksPerTier.advanced}`);
  logger.info('');

  if (progress.readyForNextTier) {
    logger.info(`🎉 Ready to advance to next tier!`);
  }
  logger.info('─'.repeat(80));
}

/**
 * Print final comprehensive report
 */
function printFinalReport(stats: any): void {
  const progress = stats.progress;

  logger.info('\n\n');
  logger.info('━'.repeat(80));
  logger.info('🏆 FINAL LEARNING REPORT - 4 WEEKS COMPLETE');
  logger.info('━'.repeat(80));
  logger.info('');

  // Overall metrics
  logger.info('📈 Overall Performance:');
  logger.info('─'.repeat(80));
  logger.info(`Total Tasks Attempted:    ${progress.totalTasks}`);
  logger.info(`Successful Tasks:         ${progress.successfulTasks}`);
  logger.info(`Success Rate:             ${(progress.successRate * 100).toFixed(1)}%`);
  logger.info(`Average Quality:          ${(progress.averageQuality * 100).toFixed(1)}%`);
  logger.info(`Average Duration:         ${Math.round(progress.averageDuration)}ms`);
  logger.info(`Final Tier:               ${progress.currentTier}`);
  logger.info(`Learning Rate:            ${(progress.learningRate * 100).toFixed(1)}% improvement`);
  logger.info(`Best Streak:              ${progress.streak} 🔥`);
  logger.info(`Completion Rate:          ${(stats.completionRate * 100).toFixed(1)}%`);
  logger.info('');

  // Tasks by tier
  logger.info('📊 Tasks by Tier:');
  logger.info('─'.repeat(80));
  stats.tasksByTier.forEach((count: number, tier: string) => {
    const percentage = (count / progress.totalTasks) * 100;
    logger.info(`${tier.padEnd(15)} │ ${count} tasks (${percentage.toFixed(1)}%)`);
  });
  logger.info('');

  // Quality by tier
  logger.info('💎 Average Quality by Tier:');
  logger.info('─'.repeat(80));
  stats.averageQualityByTier.forEach((quality: number, tier: string) => {
    logger.info(`${tier.padEnd(15)} │ ${(quality * 100).toFixed(1)}%`);
  });
  logger.info('');

  // Tasks by category
  logger.info('📂 Tasks by Category:');
  logger.info('─'.repeat(80));
  const sortedCategories = Array.from(stats.tasksByCategory.entries())
    .sort((a, b) => b[1] - a[1]);
  sortedCategories.forEach(([category, count]) => {
    const percentage = (count / progress.totalTasks) * 100;
    logger.info(`${category.padEnd(15)} │ ${count} tasks (${percentage.toFixed(1)}%)`);
  });
  logger.info('');

  // Learning progression analysis
  logger.info('📈 Learning Progression Analysis:');
  logger.info('─'.repeat(80));
  
  if (progress.learningRate > 0.1) {
    logger.info('✅ EXCELLENT: Strong positive learning trajectory');
    logger.info('   Quality improved significantly over time');
  } else if (progress.learningRate > 0.05) {
    logger.info('✅ GOOD: Steady improvement observed');
    logger.info('   Consistent learning progress');
  } else if (progress.learningRate > 0) {
    logger.info('⚠️  MODERATE: Some improvement but room to grow');
    logger.info('   Consider more challenging tasks');
  } else {
    logger.info('⚠️  NEEDS ATTENTION: No significant improvement');
    logger.info('   May need to revisit foundation tasks');
  }
  logger.info('');

  // Tier progression
  if (progress.currentTier === 'advanced') {
    logger.info('🎓 MASTERY LEVEL: Advanced tier reached!');
    logger.info('   Ready for complex real-world tasks');
  } else if (progress.currentTier === 'intermediate') {
    logger.info('📚 INTERMEDIATE LEVEL: Good progress');
    logger.info('   Continue building skills for advanced tier');
  } else {
    logger.info('🌱 FOUNDATION LEVEL: Building basics');
    logger.info('   Focus on completing more foundation tasks');
  }
  logger.info('');

  // Recommendations
  logger.info('💡 Recommendations:');
  logger.info('─'.repeat(80));
  
  if (progress.successRate >= 0.85) {
    logger.info('✅ High success rate - ready for more challenging tasks');
  } else if (progress.successRate >= 0.70) {
    logger.info('✅ Good success rate - maintain current difficulty level');
  } else {
    logger.info('⚠️  Lower success rate - consider easier tasks to build confidence');
  }
  logger.info('');

  if (progress.averageQuality >= 0.85) {
    logger.info('✅ Excellent quality - autopilot is performing very well');
  } else if (progress.averageQuality >= 0.75) {
    logger.info('✅ Good quality - solid performance overall');
  } else {
    logger.info('⚠️  Quality could improve - focus on iterative refinement');
  }
  logger.info('');

  if (stats.completionRate >= 0.80) {
    logger.info('✅ High completion rate - explored most available tasks');
  } else if (stats.completionRate >= 0.50) {
    logger.info('✅ Good progress - many tasks still available to explore');
  } else {
    logger.info('💡 Many tasks still unexplored - continue learning journey');
  }
  logger.info('');

  // Next steps
  logger.info('🚀 Next Steps:');
  logger.info('─'.repeat(80));
  logger.info('1. Continue with current learning pace');
  logger.info('2. Focus on weak categories to improve balance');
  logger.info('3. Attempt more advanced tasks to push boundaries');
  logger.info('4. Review failed tasks and retry with improvements');
  logger.info('5. Experiment with different quantum approaches');
  logger.info('');

  logger.info('━'.repeat(80));
  logger.info('');
}

/**
 * Test specific learning scenario
 */
async function testLearningScenario(scenario: string) {
  logger.info(`\n🔬 Testing Learning Scenario: ${scenario}`);
  logger.info('━'.repeat(80));
  logger.info('');

  const scheduler = SmartTaskScheduler.getInstance();

  if (scenario === 'rapid_foundation') {
    logger.info('Scenario: Rapid Foundation Building');
    logger.info('Goal: Complete all foundation tasks quickly\n');
    
    await scheduler.runLearningSession(6);
    
  } else if (scenario === 'balanced_growth') {
    logger.info('Scenario: Balanced Growth');
    logger.info('Goal: Mix of all tiers for well-rounded learning\n');
    
    scheduler.advanceWeek();
    scheduler.advanceWeek();
    await scheduler.runLearningSession(10);
    
  } else if (scenario === 'advanced_push') {
    logger.info('Scenario: Advanced Push');
    logger.info('Goal: Focus on advanced tasks\n');
    
    scheduler.advanceWeek();
    scheduler.advanceWeek();
    scheduler.advanceWeek();
    await scheduler.runLearningSession(8);
  }

  const stats = scheduler.getDetailedStats();
  logger.info('\n📊 Scenario Results:');
  logger.info('─'.repeat(80));
  logger.info(`Tasks Completed:  ${stats.progress.totalTasks}`);
  logger.info(`Success Rate:     ${(stats.progress.successRate * 100).toFixed(1)}%`);
  logger.info(`Avg Quality:      ${(stats.progress.averageQuality * 100).toFixed(1)}%`);
  logger.info(`Current Tier:     ${stats.progress.currentTier}`);
  logger.info('━'.repeat(80));
}

// Export functions
export { runLearningSimulation, testLearningScenario };

// Run simulation if executed directly
if (require.main === module) {
  runLearningSimulation()
    .then(() => {
      logger.info('\n✅ Learning simulation completed successfully!\n');
      process.exit(0);
    })
    .catch(error => {
      logger.error('\n❌ Simulation failed:', error);
      process.exit(1);
    });
}
