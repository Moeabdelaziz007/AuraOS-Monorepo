/**
 * Smart Task Scheduler Test
 * Simulates progressive learning over multiple weeks
 */

import { SmartTaskScheduler } from './smart-task-scheduler';

/**
 * Run 4-week learning simulation
 */
async function runLearningSimulation() {
  console.log('🎓 Smart Task Scheduler - 4-Week Learning Simulation');
  console.log('====================================================\n');

  const scheduler = SmartTaskScheduler.getInstance();

  // Week 1: Foundation focus
  console.log('\n📅 WEEK 1: Building Foundation');
  console.log('━'.repeat(80));
  await scheduler.runLearningSession(8);
  
  let stats = scheduler.getDetailedStats();
  printWeeklyReport(1, stats);

  await new Promise(resolve => setTimeout(resolve, 500));

  // Week 2: Introducing intermediate
  scheduler.advanceWeek();
  console.log('\n📅 WEEK 2: Expanding Skills');
  console.log('━'.repeat(80));
  await scheduler.runLearningSession(10);
  
  stats = scheduler.getDetailedStats();
  printWeeklyReport(2, stats);

  await new Promise(resolve => setTimeout(resolve, 500));

  // Week 3: Balanced approach
  scheduler.advanceWeek();
  console.log('\n📅 WEEK 3: Balanced Growth');
  console.log('━'.repeat(80));
  await scheduler.runLearningSession(12);
  
  stats = scheduler.getDetailedStats();
  printWeeklyReport(3, stats);

  await new Promise(resolve => setTimeout(resolve, 500));

  // Week 4: Advanced challenges
  scheduler.advanceWeek();
  console.log('\n📅 WEEK 4: Advanced Mastery');
  console.log('━'.repeat(80));
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

  console.log(`\n📊 Week ${week} Report:`);
  console.log('─'.repeat(80));
  console.log(`Total Tasks Completed:    ${progress.totalTasks}`);
  console.log(`Success Rate:             ${(progress.successRate * 100).toFixed(1)}%`);
  console.log(`Average Quality:          ${(progress.averageQuality * 100).toFixed(1)}%`);
  console.log(`Current Tier:             ${progress.currentTier}`);
  console.log(`Learning Rate:            ${(progress.learningRate * 100).toFixed(1)}% improvement`);
  console.log(`Current Streak:           ${progress.streak} 🔥`);
  console.log('');

  console.log(`Tasks by Tier:`);
  console.log(`  Foundation:   ${progress.tasksPerTier.foundation}`);
  console.log(`  Intermediate: ${progress.tasksPerTier.intermediate}`);
  console.log(`  Advanced:     ${progress.tasksPerTier.advanced}`);
  console.log('');

  if (progress.readyForNextTier) {
    console.log(`🎉 Ready to advance to next tier!`);
  }
  console.log('─'.repeat(80));
}

/**
 * Print final comprehensive report
 */
function printFinalReport(stats: any): void {
  const progress = stats.progress;

  console.log('\n\n');
  console.log('━'.repeat(80));
  console.log('🏆 FINAL LEARNING REPORT - 4 WEEKS COMPLETE');
  console.log('━'.repeat(80));
  console.log('');

  // Overall metrics
  console.log('📈 Overall Performance:');
  console.log('─'.repeat(80));
  console.log(`Total Tasks Attempted:    ${progress.totalTasks}`);
  console.log(`Successful Tasks:         ${progress.successfulTasks}`);
  console.log(`Success Rate:             ${(progress.successRate * 100).toFixed(1)}%`);
  console.log(`Average Quality:          ${(progress.averageQuality * 100).toFixed(1)}%`);
  console.log(`Average Duration:         ${Math.round(progress.averageDuration)}ms`);
  console.log(`Final Tier:               ${progress.currentTier}`);
  console.log(`Learning Rate:            ${(progress.learningRate * 100).toFixed(1)}% improvement`);
  console.log(`Best Streak:              ${progress.streak} 🔥`);
  console.log(`Completion Rate:          ${(stats.completionRate * 100).toFixed(1)}%`);
  console.log('');

  // Tasks by tier
  console.log('📊 Tasks by Tier:');
  console.log('─'.repeat(80));
  stats.tasksByTier.forEach((count: number, tier: string) => {
    const percentage = (count / progress.totalTasks) * 100;
    console.log(`${tier.padEnd(15)} │ ${count} tasks (${percentage.toFixed(1)}%)`);
  });
  console.log('');

  // Quality by tier
  console.log('💎 Average Quality by Tier:');
  console.log('─'.repeat(80));
  stats.averageQualityByTier.forEach((quality: number, tier: string) => {
    console.log(`${tier.padEnd(15)} │ ${(quality * 100).toFixed(1)}%`);
  });
  console.log('');

  // Tasks by category
  console.log('📂 Tasks by Category:');
  console.log('─'.repeat(80));
  const sortedCategories = Array.from(stats.tasksByCategory.entries())
    .sort((a, b) => b[1] - a[1]);
  sortedCategories.forEach(([category, count]) => {
    const percentage = (count / progress.totalTasks) * 100;
    console.log(`${category.padEnd(15)} │ ${count} tasks (${percentage.toFixed(1)}%)`);
  });
  console.log('');

  // Learning progression analysis
  console.log('📈 Learning Progression Analysis:');
  console.log('─'.repeat(80));
  
  if (progress.learningRate > 0.1) {
    console.log('✅ EXCELLENT: Strong positive learning trajectory');
    console.log('   Quality improved significantly over time');
  } else if (progress.learningRate > 0.05) {
    console.log('✅ GOOD: Steady improvement observed');
    console.log('   Consistent learning progress');
  } else if (progress.learningRate > 0) {
    console.log('⚠️  MODERATE: Some improvement but room to grow');
    console.log('   Consider more challenging tasks');
  } else {
    console.log('⚠️  NEEDS ATTENTION: No significant improvement');
    console.log('   May need to revisit foundation tasks');
  }
  console.log('');

  // Tier progression
  if (progress.currentTier === 'advanced') {
    console.log('🎓 MASTERY LEVEL: Advanced tier reached!');
    console.log('   Ready for complex real-world tasks');
  } else if (progress.currentTier === 'intermediate') {
    console.log('📚 INTERMEDIATE LEVEL: Good progress');
    console.log('   Continue building skills for advanced tier');
  } else {
    console.log('🌱 FOUNDATION LEVEL: Building basics');
    console.log('   Focus on completing more foundation tasks');
  }
  console.log('');

  // Recommendations
  console.log('💡 Recommendations:');
  console.log('─'.repeat(80));
  
  if (progress.successRate >= 0.85) {
    console.log('✅ High success rate - ready for more challenging tasks');
  } else if (progress.successRate >= 0.70) {
    console.log('✅ Good success rate - maintain current difficulty level');
  } else {
    console.log('⚠️  Lower success rate - consider easier tasks to build confidence');
  }
  console.log('');

  if (progress.averageQuality >= 0.85) {
    console.log('✅ Excellent quality - autopilot is performing very well');
  } else if (progress.averageQuality >= 0.75) {
    console.log('✅ Good quality - solid performance overall');
  } else {
    console.log('⚠️  Quality could improve - focus on iterative refinement');
  }
  console.log('');

  if (stats.completionRate >= 0.80) {
    console.log('✅ High completion rate - explored most available tasks');
  } else if (stats.completionRate >= 0.50) {
    console.log('✅ Good progress - many tasks still available to explore');
  } else {
    console.log('💡 Many tasks still unexplored - continue learning journey');
  }
  console.log('');

  // Next steps
  console.log('🚀 Next Steps:');
  console.log('─'.repeat(80));
  console.log('1. Continue with current learning pace');
  console.log('2. Focus on weak categories to improve balance');
  console.log('3. Attempt more advanced tasks to push boundaries');
  console.log('4. Review failed tasks and retry with improvements');
  console.log('5. Experiment with different quantum approaches');
  console.log('');

  console.log('━'.repeat(80));
  console.log('');
}

/**
 * Test specific learning scenario
 */
async function testLearningScenario(scenario: string) {
  console.log(`\n🔬 Testing Learning Scenario: ${scenario}`);
  console.log('━'.repeat(80));
  console.log('');

  const scheduler = SmartTaskScheduler.getInstance();

  if (scenario === 'rapid_foundation') {
    console.log('Scenario: Rapid Foundation Building');
    console.log('Goal: Complete all foundation tasks quickly\n');
    
    await scheduler.runLearningSession(6);
    
  } else if (scenario === 'balanced_growth') {
    console.log('Scenario: Balanced Growth');
    console.log('Goal: Mix of all tiers for well-rounded learning\n');
    
    scheduler.advanceWeek();
    scheduler.advanceWeek();
    await scheduler.runLearningSession(10);
    
  } else if (scenario === 'advanced_push') {
    console.log('Scenario: Advanced Push');
    console.log('Goal: Focus on advanced tasks\n');
    
    scheduler.advanceWeek();
    scheduler.advanceWeek();
    scheduler.advanceWeek();
    await scheduler.runLearningSession(8);
  }

  const stats = scheduler.getDetailedStats();
  console.log('\n📊 Scenario Results:');
  console.log('─'.repeat(80));
  console.log(`Tasks Completed:  ${stats.progress.totalTasks}`);
  console.log(`Success Rate:     ${(stats.progress.successRate * 100).toFixed(1)}%`);
  console.log(`Avg Quality:      ${(stats.progress.averageQuality * 100).toFixed(1)}%`);
  console.log(`Current Tier:     ${stats.progress.currentTier}`);
  console.log('━'.repeat(80));
}

// Export functions
export { runLearningSimulation, testLearningScenario };

// Run simulation if executed directly
if (require.main === module) {
  runLearningSimulation()
    .then(() => {
      console.log('\n✅ Learning simulation completed successfully!\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Simulation failed:', error);
      process.exit(1);
    });
}
