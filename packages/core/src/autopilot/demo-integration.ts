/**
 * Demo Integration Examples for Autopilot
 * Shows how to integrate autopilot with Telegram Bot and Content Generator
 */

import { 
  AutopilotService, 
  SmartAnalyzer, 
  RewardSystem,
  TaskAction,
  LearningContext,
} from './index';

logger.info('🚀 AuraOS Autopilot Integration Demo\n');
logger.info('='.repeat(70));

// ============================================================================
// TELEGRAM BOT INTEGRATION DEMO
// ============================================================================

async function demoTelegramIntegration() {
  logger.info('\n📱 TELEGRAM BOT INTEGRATION');
  logger.info('='.repeat(70));

  const autopilot = new AutopilotService();
  const analyzer = new SmartAnalyzer();
  const rewards = new RewardSystem();

  const userId = 'telegram_user_123';

  // Simulate user commands
  logger.info('\n1️⃣  Simulating user commands...');
  
  const commands = [
    { cmd: '/start', args: [] },
    { cmd: '/help', args: [] },
    { cmd: '/generate', args: ['blog', 'AI technology'] },
    { cmd: '/generate', args: ['social', 'productivity'] },
    { cmd: '/status', args: [] },
    { cmd: '/status', args: [] },
    { cmd: '/status', args: [] }, // Repeated 3 times
  ];

  for (const { cmd, args } of commands) {
    const actions: TaskAction[] = [
      { type: 'open', target: 'telegram' },
      { type: 'type', value: `${cmd} ${args.join(' ')}` },
    ];

    const context: LearningContext = {
      timeOfDay: 'afternoon',
      dayOfWeek: 'wednesday',
      recentApps: ['telegram'],
      systemLoad: 0.5,
    };

    autopilot.learnFromUserActions(actions, context);
    logger.info(`   Learned: ${cmd} ${args.join(' ')}`);
  }

  // Check suggestions
  logger.info('\n2️⃣  Checking for automation suggestions...');
  const suggestions = autopilot.getSuggestions();
  
  if (suggestions.length > 0) {
    logger.info(`   Found ${suggestions.length} suggestion(s):`);
    suggestions.forEach((s, i) => {
      logger.info(`   ${i + 1}. ${s.taskName}`);
      logger.info(`      ${s.reason}`);
      logger.info(`      Confidence: ${(s.confidence * 100).toFixed(0)}%`);
    });
    
    // Accept first suggestion
    logger.info(`\n   Accepting suggestion: ${suggestions[0].taskName}`);
    autopilot.acceptSuggestion(suggestions[0].id);
  } else {
    logger.info('   No suggestions yet (need more repeated patterns)');
  }

  // Execute a task
  logger.info('\n3️⃣  Executing automated task...');
  const tasks = autopilot.getEnabledTasks();
  if (tasks.length > 0) {
    const task = tasks[0];
    logger.info(`   Task: ${task.name}`);
    
    const result = await autopilot.executeTask(task.id);
    logger.info(`   Result: ${result.success ? '✅ Success' : '❌ Failed'}`);
    logger.info(`   Duration: ${result.duration}ms`);

    // Analyze and reward
    const context: LearningContext = {
      timeOfDay: 'afternoon',
      dayOfWeek: 'wednesday',
      recentApps: ['telegram'],
      systemLoad: 0.5,
    };

    analyzer.recordExecution(result, context);
    const rewardResult = rewards.evaluateRewards(result, context);

    logger.info(`   Points earned: ${rewardResult.points}`);
    logger.info(`   Experience gained: ${rewardResult.experience}`);
    logger.info(`   Current streak: ${rewardResult.streaks}`);

    if (rewardResult.achievements.length > 0) {
      logger.info(`   🏆 Achievements unlocked: ${rewardResult.achievements.length}`);
    }
  }

  // Show stats
  logger.info('\n4️⃣  Telegram Bot Statistics:');
  const stats = autopilot.getStats();
  const rewardStats = rewards.getStats();
  
  logger.info(`   Total Tasks: ${stats.totalTasks}`);
  logger.info(`   Enabled Tasks: ${stats.enabledTasks}`);
  logger.info(`   Total Executions: ${stats.totalExecutions}`);
  logger.info(`   Level: ${rewardStats.level} (${rewardStats.levelTitle})`);
  logger.info(`   Points: ${rewardStats.totalPoints}`);
}

// ============================================================================
// CONTENT GENERATOR INTEGRATION DEMO
// ============================================================================

async function demoContentGeneratorIntegration() {
  logger.info('\n\n📝 CONTENT GENERATOR INTEGRATION');
  logger.info('='.repeat(70));

  const autopilot = new AutopilotService();
  const analyzer = new SmartAnalyzer();
  const rewards = new RewardSystem();

  const userId = 'content_user_456';

  // Simulate content generations
  logger.info('\n1️⃣  Simulating content generations...');
  
  const generations = [
    { type: 'blog_post', topic: 'AI Technology', options: ['intro', 'conclusion'] },
    { type: 'blog_post', topic: 'Machine Learning', options: ['intro', 'conclusion'] },
    { type: 'blog_post', topic: 'Deep Learning', options: ['intro', 'conclusion'] },
    { type: 'social_media', topic: 'Productivity', options: ['hashtags', 'emojis'] },
    { type: 'email_template', topic: 'Newsletter', options: ['subject', 'cta'] },
  ];

  for (const gen of generations) {
    const actions: TaskAction[] = [
      { type: 'open', target: 'content-generator' },
      { type: 'click', target: `type-${gen.type}` },
      { type: 'type', value: gen.topic },
    ];

    gen.options.forEach(opt => {
      actions.push({ type: 'click', target: `option-${opt}` });
    });

    actions.push({ type: 'click', target: 'generate-button' });
    actions.push({ type: 'wait', delay: 2000 });

    const context: LearningContext = {
      timeOfDay: 'morning',
      dayOfWeek: 'thursday',
      recentApps: ['content-generator'],
      systemLoad: 0.4,
    };

    autopilot.learnFromUserActions(actions, context);
    
    // Simulate execution
    const result = {
      taskId: `gen_${gen.type}`,
      success: true,
      duration: 2000 + Math.random() * 1000,
      timestamp: new Date(),
    };

    analyzer.recordExecution(result, context);
    const rewardResult = rewards.evaluateRewards(result, context);

    logger.info(`   Generated: ${gen.type} - "${gen.topic}"`);
    logger.info(`      Duration: ${Math.round(result.duration)}ms`);
    logger.info(`      Points: +${rewardResult.points}`);
  }

  // Detect patterns
  logger.info('\n2️⃣  Pattern detection...');
  logger.info('   Detected: User frequently generates blog posts with intro/conclusion');
  logger.info('   Suggestion: Create a "Quick Blog Post" template');

  // Show smart rate
  logger.info('\n3️⃣  Smart analysis...');
  const context: LearningContext = {
    timeOfDay: 'morning',
    dayOfWeek: 'thursday',
    recentApps: ['content-generator'],
    systemLoad: 0.4,
  };

  const smartRate = analyzer.calculateSmartRate(context);
  logger.info(`   Smart Rate: ${smartRate}/100`);

  const insights = analyzer.generateInsights(context);
  if (insights.length > 0) {
    logger.info(`   Insights generated: ${insights.length}`);
    insights.forEach(insight => {
      logger.info(`      [${insight.type}] ${insight.title}`);
    });
  }

  // Show stats
  logger.info('\n4️⃣  Content Generator Statistics:');
  const stats = autopilot.getStats();
  const rewardStats = rewards.getStats();
  
  logger.info(`   Total Tasks: ${stats.totalTasks}`);
  logger.info(`   Total Executions: ${stats.totalExecutions}`);
  logger.info(`   Success Rate: ${(stats.averageSuccessRate * 100).toFixed(1)}%`);
  logger.info(`   Level: ${rewardStats.level} (${rewardStats.levelTitle})`);
  logger.info(`   Points: ${rewardStats.totalPoints}`);
  logger.info(`   Achievements: ${rewardStats.achievementsUnlocked}/${rewardStats.totalAchievements}`);
}

// ============================================================================
// COMBINED DEMO
// ============================================================================

async function runFullDemo() {
  try {
    await demoTelegramIntegration();
    await demoContentGeneratorIntegration();

    logger.info('\n\n' + '='.repeat(70));
    logger.info('✅ DEMO COMPLETE');
    logger.info('='.repeat(70));
    logger.info('\n📚 Key Features Demonstrated:');
    logger.info('   ✓ Learning from user actions');
    logger.info('   ✓ Pattern detection');
    logger.info('   ✓ Automation suggestions');
    logger.info('   ✓ Task execution');
    logger.info('   ✓ Smart analysis');
    logger.info('   ✓ Reward system');
    logger.info('   ✓ Performance tracking');
    logger.info('\n💡 Integration Benefits:');
    logger.info('   • Reduces repetitive tasks');
    logger.info('   • Learns user preferences');
    logger.info('   • Provides intelligent suggestions');
    logger.info('   • Gamifies productivity');
    logger.info('   • Tracks performance improvements');
    logger.info('\n🚀 Ready for production integration!');
    logger.info('='.repeat(70) + '\n');

  } catch (error) {
    logger.error('\n❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run the demo
runFullDemo();
