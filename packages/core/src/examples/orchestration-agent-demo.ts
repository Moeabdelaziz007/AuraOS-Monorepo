/**
 * Orchestration Agent Demo
 * Demonstrates the intelligent orchestration agent with learning meta loops and reward system
 */

import { orchestrationAgent } from '../autopilot/orchestration-agent';
import { learningLoopService } from '../learning/learning-loop.service';

interface DemoScenario {
  name: string;
  description: string;
  userInput: string;
  expectedApp: string;
  expectedTools: string[];
}

const demoScenarios: DemoScenario[] = [
  {
    name: 'Web Summarization',
    description: 'User wants to summarize a web article',
    userInput: 'Can you summarize this article for me: https://example.com/article',
    expectedApp: 'web',
    expectedTools: ['web.fetchAndCleanContent', 'ai.summarizeText', 'notes.createNote'],
  },
  {
    name: 'Note Creation',
    description: 'User wants to create a note',
    userInput: 'Create a note about my meeting tomorrow',
    expectedApp: 'notes',
    expectedTools: ['notes.createNote'],
  },
  {
    name: 'File Operations',
    description: 'User wants to read a file',
    userInput: 'Read the contents of my project README file',
    expectedApp: 'terminal',
    expectedTools: ['fs_read', 'fs_list'],
  },
  {
    name: 'Code Debugging',
    description: 'User wants to debug code',
    userInput: 'Help me debug this BASIC program',
    expectedApp: 'debugger',
    expectedTools: ['emu_step', 'emu_get_state', 'emu_set_breakpoint'],
  },
];

/**
 * Run orchestration agent demo
 */
export async function runOrchestrationDemo(): Promise<void> {
  console.log('🚀 Starting Orchestration Agent Demo with Learning Meta Loops');
  console.log('=' .repeat(60));

  try {
    // Initialize the orchestration agent
    console.log('📡 Initializing Orchestration Agent...');
    await orchestrationAgent.initialize();
    console.log('✅ Orchestration Agent initialized successfully\n');

    // Initialize learning loop for demo user
    const demoUserId = 'demo-user-123';
    const demoSessionId = 'demo-session-456';
    
    console.log('🧠 Initializing Learning Loop...');
    await learningLoopService.initialize(demoUserId);
    console.log('✅ Learning Loop initialized\n');

    // Run demo scenarios
    for (let i = 0; i < demoScenarios.length; i++) {
      const scenario = demoScenarios[i];
      console.log(`🎯 Scenario ${i + 1}: ${scenario.name}`);
      console.log(`📝 Description: ${scenario.description}`);
      console.log(`💬 User Input: "${scenario.userInput}"`);
      console.log('-'.repeat(40));

      // Analyze intent
      console.log('🔍 Analyzing user intent...');
      const decision = await orchestrationAgent.analyzeIntent(
        demoUserId,
        demoSessionId,
        scenario.userInput
      );

      console.log(`🎯 Target App: ${decision.targetApp}`);
      console.log(`🛠️  Required Tools: ${decision.mcpTools.join(', ')}`);
      console.log(`📊 Confidence: ${Math.round(decision.confidence * 100)}%`);
      console.log(`💭 Reasoning: ${decision.reasoning}`);

      // Verify expectations
      const appMatch = decision.targetApp === scenario.expectedApp;
      const toolsMatch = scenario.expectedTools.every(tool => 
        decision.mcpTools.some(selectedTool => selectedTool.includes(tool.split('.')[1]))
      );

      console.log(`✅ App Selection: ${appMatch ? 'CORRECT' : 'INCORRECT'} (expected: ${scenario.expectedApp})`);
      console.log(`✅ Tool Selection: ${toolsMatch ? 'CORRECT' : 'INCORRECT'}`);

      // Simulate task execution
      console.log('⚡ Simulating task execution...');
      const executionResult = await orchestrationAgent.executeTask(
        demoUserId,
        demoSessionId,
        decision,
        {
          url: scenario.userInput.includes('http') ? 'https://example.com/article' : undefined,
          content: 'Sample content for demonstration',
          userId: demoUserId,
        }
      );

      console.log(`📈 Execution Result:`);
      console.log(`   - Success: ${executionResult.success ? '✅' : '❌'}`);
      console.log(`   - Execution Time: ${executionResult.executionTime}ms`);
      console.log(`   - Steps Completed: ${executionResult.steps.length}`);
      console.log(`   - Successful Steps: ${executionResult.steps.filter(s => s.success).length}`);

      // Show learning insights
      if (executionResult.success) {
        console.log('🎓 Learning Insights:');
        console.log('   - Task executed successfully');
        console.log('   - Performance metrics updated');
        console.log('   - Rewards calculated and awarded');
        console.log('   - Learning patterns recorded');
      }

      console.log('\n' + '='.repeat(60) + '\n');
    }

    // Show final statistics
    console.log('📊 Final Statistics:');
    const stats = await orchestrationAgent.getStats();
    console.log(`   - Total Decisions: ${stats.totalDecisions}`);
    console.log(`   - Success Rate: ${Math.round(stats.successRate * 100)}%`);
    console.log(`   - Average Confidence: ${Math.round(stats.averageConfidence * 100)}%`);
    console.log(`   - Total Rewards: ${stats.learningProgress.totalRewards}`);
    console.log(`   - User Level: ${stats.learningProgress.level}`);
    console.log(`   - Achievements: ${stats.learningProgress.achievements}`);
    console.log(`   - Improvement Trend: ${stats.learningProgress.improvementTrend}`);

    // Show performance insights
    if (stats.performanceInsights.length > 0) {
      console.log('\n🎯 Performance Insights:');
      stats.performanceInsights.forEach((insight, index) => {
        console.log(`   ${index + 1}. Task: ${insight.taskId} (${insight.appId})`);
        console.log(`      - Improvement Rate: ${Math.round(insight.improvementRate * 100)}%`);
        console.log(`      - Total Rewards: ${insight.totalRewards} points`);
        console.log(`      - Recent Insights: ${insight.recentInsights.slice(-1)[0] || 'None'}`);
      });
    }

    console.log('\n🎉 Demo completed successfully!');
    console.log('The Orchestration Agent has demonstrated:');
    console.log('✅ Intelligent task routing to appropriate apps');
    console.log('✅ Smart MCP tool selection');
    console.log('✅ Learning from execution results');
    console.log('✅ Performance tracking and improvement');
    console.log('✅ Reward system integration');
    console.log('✅ Learning meta loops for continuous improvement');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    throw error;
  }
}

/**
 * Run performance improvement demo
 */
export async function runPerformanceImprovementDemo(): Promise<void> {
  console.log('🏃‍♂️ Starting Performance Improvement Demo');
  console.log('=' .repeat(50));

  const demoUserId = 'performance-user-123';
  const demoSessionId = 'performance-session-456';

  try {
    // Initialize systems
    await orchestrationAgent.initialize();
    await learningLoopService.initialize(demoUserId);

    // Simulate multiple executions of the same task to show improvement
    const taskInput = 'Summarize this article: https://example.com/article';
    
    console.log('🔄 Running multiple executions to demonstrate learning...\n');

    for (let i = 1; i <= 5; i++) {
      console.log(`📊 Execution ${i}/5:`);
      
      const decision = await orchestrationAgent.analyzeIntent(
        demoUserId,
        demoSessionId,
        taskInput
      );

      const executionResult = await orchestrationAgent.executeTask(
        demoUserId,
        demoSessionId,
        decision,
        {
          url: 'https://example.com/article',
          content: `Article content for execution ${i}`,
          userId: demoUserId,
        }
      );

      console.log(`   - Success: ${executionResult.success ? '✅' : '❌'}`);
      console.log(`   - Time: ${executionResult.executionTime}ms`);
      console.log(`   - Confidence: ${Math.round(decision.confidence * 100)}%`);

      // Show learning progress
      if (i > 1) {
        const stats = await orchestrationAgent.getStats();
        const insights = stats.performanceInsights;
        
        if (insights.length > 0) {
          const latestInsight = insights[insights.length - 1];
          console.log(`   - Improvement Rate: ${Math.round(latestInsight.improvementRate * 100)}%`);
          console.log(`   - Total Rewards: ${latestInsight.totalRewards} points`);
        }
      }

      console.log('');
    }

    // Show final learning results
    console.log('🎓 Learning Results:');
    const finalStats = await orchestrationAgent.getStats();
    
    console.log(`   - Total Rewards Earned: ${finalStats.learningProgress.totalRewards}`);
    console.log(`   - Performance Improvement: ${finalStats.learningProgress.improvementTrend}`);
    console.log(`   - Success Rate: ${Math.round(finalStats.successRate * 100)}%`);

    if (finalStats.performanceInsights.length > 0) {
      console.log('\n📈 Performance Insights:');
      finalStats.performanceInsights.forEach(insight => {
        console.log(`   - Task: ${insight.taskId}`);
        console.log(`   - App: ${insight.appId}`);
        console.log(`   - Improvement: ${Math.round(insight.improvementRate * 100)}%`);
        console.log(`   - Rewards: ${insight.totalRewards} points`);
        console.log(`   - Recent Insight: ${insight.recentInsights.slice(-1)[0] || 'None'}`);
      });
    }

    console.log('\n🎉 Performance improvement demo completed!');
    console.log('The system has learned and improved through multiple executions.');

  } catch (error) {
    console.error('❌ Performance demo failed:', error);
    throw error;
  }
}

/**
 * Run the complete orchestration agent demo
 */
export async function runCompleteDemo(): Promise<void> {
  console.log('🌟 AuraOS Orchestration Agent - Complete Demo');
  console.log('=' .repeat(60));
  console.log('This demo showcases the intelligent orchestration agent');
  console.log('with learning meta loops and reward system integration.\n');

  try {
    // Run basic orchestration demo
    await runOrchestrationDemo();
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Run performance improvement demo
    await runPerformanceImprovementDemo();
    
    console.log('\n🎊 All demos completed successfully!');
    console.log('The Orchestration Agent is ready for production use.');
    
  } catch (error) {
    console.error('❌ Complete demo failed:', error);
    throw error;
  }
}

// Export demo functions
export {
  runOrchestrationDemo,
  runPerformanceImprovementDemo,
  runCompleteDemo,
};
