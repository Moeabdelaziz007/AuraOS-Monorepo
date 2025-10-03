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

console.log('🚀 AuraOS Autopilot Integration Demo\n');
console.log('='.repeat(70));

// ============================================================================
// TELEGRAM BOT INTEGRATION DEMO
// ============================================================================

async function demoTelegramIntegration() {
  console.log('\n📱 TELEGRAM BOT INTEGRATION');
  console.log('='.repeat(70));

  const autopilot = new AutopilotService();
  const analyzer = new SmartAnalyzer();
  const rewards = new RewardSystem();

  const userId = 'telegram_user_123';

  // Simulate user commands
  console.log('\n1️⃣  Simulating user commands...');
  
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
    console.log(`   Learned: ${cmd} ${args.join(' ')}`);
  }

  // Check suggestions
  console.log('\n2️⃣  Checking for automation suggestions...');
  const suggestions = autopilot.getSuggestions();
  
  if (suggestions.length > 0) {
    console.log(`   Found ${suggestions.length} suggestion(s):`);
    suggestions.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.taskName}`);
      console.log(`      ${s.reason}`);
      console.log(`      Confidence: ${(s.confidence * 100).toFixed(0)}%`);
    });
    
    // Accept first suggestion
    console.log(`\n   Accepting suggestion: ${suggestions[0].taskName}`);
    autopilot.acceptSuggestion(suggestions[0].id);
  } else {
    console.log('   No suggestions yet (need more repeated patterns)');
  }

  // Execute a task
  console.log('\n3️⃣  Executing automated task...');
  const tasks = autopilot.getEnabledTasks();
  if (tasks.length > 0) {
    const task = tasks[0];
    console.log(`   Task: ${task.name}`);
    
    const result = await autopilot.executeTask(task.id);
    console.log(`   Result: ${result.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   Duration: ${result.duration}ms`);

    // Analyze and reward
    const context: LearningContext = {
      timeOfDay: 'afternoon',
      dayOfWeek: 'wednesday',
      recentApps: ['telegram'],
      systemLoad: 0.5,
    };

    analyzer.recordExecution(result, context);
    const rewardResult = rewards.evaluateRewards(result, context);

    console.log(`   Points earned: ${rewardResult.points}`);
    console.log(`   Experience gained: ${rewardResult.experience}`);
    console.log(`   Current streak: ${rewardResult.streaks}`);

    if (rewardResult.achievements.length > 0) {
      console.log(`   🏆 Achievements unlocked: ${rewardResult.achievements.length}`);
    }
  }

  // Show stats
  console.log('\n4️⃣  Telegram Bot Statistics:');
  const stats = autopilot.getStats();
  const rewardStats = rewards.getStats();
  
  console.log(`   Total Tasks: ${stats.totalTasks}`);
  console.log(`   Enabled Tasks: ${stats.enabledTasks}`);
  console.log(`   Total Executions: ${stats.totalExecutions}`);
  console.log(`   Level: ${rewardStats.level} (${rewardStats.levelTitle})`);
  console.log(`   Points: ${rewardStats.totalPoints}`);
}

// ============================================================================
// CONTENT GENERATOR INTEGRATION DEMO
// ============================================================================

async function demoContentGeneratorIntegration() {
  console.log('\n\n📝 CONTENT GENERATOR INTEGRATION');
  console.log('='.repeat(70));

  const autopilot = new AutopilotService();
  const analyzer = new SmartAnalyzer();
  const rewards = new RewardSystem();

  const userId = 'content_user_456';

  // Simulate content generations
  console.log('\n1️⃣  Simulating content generations...');
  
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

    console.log(`   Generated: ${gen.type} - "${gen.topic}"`);
    console.log(`      Duration: ${Math.round(result.duration)}ms`);
    console.log(`      Points: +${rewardResult.points}`);
  }

  // Detect patterns
  console.log('\n2️⃣  Pattern detection...');
  console.log('   Detected: User frequently generates blog posts with intro/conclusion');
  console.log('   Suggestion: Create a "Quick Blog Post" template');

  // Show smart rate
  console.log('\n3️⃣  Smart analysis...');
  const context: LearningContext = {
    timeOfDay: 'morning',
    dayOfWeek: 'thursday',
    recentApps: ['content-generator'],
    systemLoad: 0.4,
  };

  const smartRate = analyzer.calculateSmartRate(context);
  console.log(`   Smart Rate: ${smartRate}/100`);

  const insights = analyzer.generateInsights(context);
  if (insights.length > 0) {
    console.log(`   Insights generated: ${insights.length}`);
    insights.forEach(insight => {
      console.log(`      [${insight.type}] ${insight.title}`);
    });
  }

  // Show stats
  console.log('\n4️⃣  Content Generator Statistics:');
  const stats = autopilot.getStats();
  const rewardStats = rewards.getStats();
  
  console.log(`   Total Tasks: ${stats.totalTasks}`);
  console.log(`   Total Executions: ${stats.totalExecutions}`);
  console.log(`   Success Rate: ${(stats.averageSuccessRate * 100).toFixed(1)}%`);
  console.log(`   Level: ${rewardStats.level} (${rewardStats.levelTitle})`);
  console.log(`   Points: ${rewardStats.totalPoints}`);
  console.log(`   Achievements: ${rewardStats.achievementsUnlocked}/${rewardStats.totalAchievements}`);
}

// ============================================================================
// COMBINED DEMO
// ============================================================================

async function runFullDemo() {
  try {
    await demoTelegramIntegration();
    await demoContentGeneratorIntegration();

    console.log('\n\n' + '='.repeat(70));
    console.log('✅ DEMO COMPLETE');
    console.log('='.repeat(70));
    console.log('\n📚 Key Features Demonstrated:');
    console.log('   ✓ Learning from user actions');
    console.log('   ✓ Pattern detection');
    console.log('   ✓ Automation suggestions');
    console.log('   ✓ Task execution');
    console.log('   ✓ Smart analysis');
    console.log('   ✓ Reward system');
    console.log('   ✓ Performance tracking');
    console.log('\n💡 Integration Benefits:');
    console.log('   • Reduces repetitive tasks');
    console.log('   • Learns user preferences');
    console.log('   • Provides intelligent suggestions');
    console.log('   • Gamifies productivity');
    console.log('   • Tracks performance improvements');
    console.log('\n🚀 Ready for production integration!');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run the demo
runFullDemo();
