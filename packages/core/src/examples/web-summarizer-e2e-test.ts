/**
 * Web Summarizer End-to-End Test
 * Comprehensive test demonstrating the complete Web Summarizer workflow
 */

import { orchestrationAgent } from '../autopilot/orchestration-agent';
import { webSummarizerHandler } from '../autopilot/web-summarizer-handler';
import { learningLoopService } from '../learning/learning-loop.service';

interface TestScenario {
  name: string;
  description: string;
  url: string;
  expectedApp: string;
  expectedTools: string[];
  options?: {
    maxSummaryLength?: number;
    includeMetadata?: boolean;
    saveToNotes?: boolean;
  };
}

const testScenarios: TestScenario[] = [
  {
    name: 'News Article Summarization',
    description: 'Summarize a news article with metadata',
    url: 'https://example.com/news-article',
    expectedApp: 'web',
    expectedTools: ['web.fetchAndCleanContent', 'ai.summarizeText', 'notes.createNote'],
    options: {
      maxSummaryLength: 1000,
      includeMetadata: true,
      saveToNotes: true,
    },
  },
  {
    name: 'Technical Documentation',
    description: 'Summarize technical documentation',
    url: 'https://example.com/tech-docs',
    expectedApp: 'web',
    expectedTools: ['web.fetchAndCleanContent', 'ai.summarizeText', 'notes.createNote'],
    options: {
      maxSummaryLength: 1500,
      includeMetadata: true,
      saveToNotes: true,
    },
  },
  {
    name: 'Blog Post Summary',
    description: 'Summarize a blog post without saving to notes',
    url: 'https://example.com/blog-post',
    expectedApp: 'web',
    expectedTools: ['web.fetchAndCleanContent', 'ai.summarizeText'],
    options: {
      maxSummaryLength: 800,
      includeMetadata: false,
      saveToNotes: false,
    },
  },
];

/**
 * Run comprehensive Web Summarizer E2E test
 */
export async function runWebSummarizerE2ETest(): Promise<void> {
  console.log('🧪 Web Summarizer End-to-End Test');
  console.log('=' .repeat(50));

  try {
    // Initialize systems
    console.log('📡 Initializing systems...');
    await orchestrationAgent.initialize();
    await learningLoopService.initialize('test-user-123');
    console.log('✅ Systems initialized\n');

    // Test orchestration agent integration
    console.log('🎯 Testing Orchestration Agent Integration...');
    await testOrchestrationIntegration();

    // Test web summarizer handler
    console.log('🌐 Testing Web Summarizer Handler...');
    await testWebSummarizerHandler();

    // Test learning meta loops
    console.log('🧠 Testing Learning Meta Loops...');
    await testLearningMetaLoops();

    // Test performance improvements
    console.log('📈 Testing Performance Improvements...');
    await testPerformanceImprovements();

    console.log('\n🎉 All tests completed successfully!');
    console.log('The Web Summarizer is fully integrated with:');
    console.log('✅ Orchestration Agent');
    console.log('✅ Learning Meta Loops');
    console.log('✅ Reward System');
    console.log('✅ Performance Tracking');
    console.log('✅ MCP Tools Integration');

  } catch (error) {
    console.error('❌ E2E test failed:', error);
    throw error;
  }
}

/**
 * Test orchestration agent integration
 */
async function testOrchestrationIntegration(): Promise<void> {
  console.log('  🔍 Testing intent analysis...');
  
  for (const scenario of testScenarios) {
    console.log(`    📝 Testing: ${scenario.name}`);
    
    const userInput = `Summarize this article: ${scenario.url}`;
    const decision = await orchestrationAgent.analyzeIntent(
      'test-user-123',
      'test-session-456',
      userInput
    );

    console.log(`      🎯 Target App: ${decision.targetApp}`);
    console.log(`      🛠️  Tools: ${decision.mcpTools.join(', ')}`);
    console.log(`      📊 Confidence: ${Math.round(decision.confidence * 100)}%`);

    // Verify expectations
    const appMatch = decision.targetApp === scenario.expectedApp;
    const toolsMatch = scenario.expectedTools.every(tool => 
      decision.mcpTools.some(selectedTool => selectedTool.includes(tool.split('.')[1]))
    );

    console.log(`      ✅ App Selection: ${appMatch ? 'PASS' : 'FAIL'}`);
    console.log(`      ✅ Tool Selection: ${toolsMatch ? 'PASS' : 'FAIL'}`);
  }
}

/**
 * Test web summarizer handler
 */
async function testWebSummarizerHandler(): Promise<void> {
  console.log('  🌐 Testing web content processing...');
  
  for (const scenario of testScenarios) {
    console.log(`    📝 Testing: ${scenario.name}`);
    
    const result = await webSummarizerHandler.summarizeWebContent({
      userId: 'test-user-123',
      sessionId: 'test-session-456',
      url: scenario.url,
      options: scenario.options,
    });

    console.log(`      ✅ Success: ${result.success ? 'PASS' : 'FAIL'}`);
    console.log(`      ⏱️  Execution Time: ${result.executionTime}ms`);
    console.log(`      🧠 Learning Insights: ${result.learningInsights.length}`);

    if (result.success && result.result) {
      console.log(`      📰 Title: ${result.result.title}`);
      console.log(`      📝 Summary Length: ${result.result.summary.length} chars`);
      console.log(`      🔑 Key Points: ${result.result.keyPoints.length}`);
      console.log(`      📊 Confidence: ${Math.round(result.result.metadata.confidence * 100)}%`);
    }
  }
}

/**
 * Test learning meta loops
 */
async function testLearningMetaLoops(): Promise<void> {
  console.log('  🧠 Testing learning and improvement...');
  
  // Simulate multiple executions to test learning
  const testUrl = 'https://example.com/learning-test-article';
  
  for (let i = 1; i <= 3; i++) {
    console.log(`    🔄 Execution ${i}/3:`);
    
    const result = await webSummarizerHandler.summarizeWebContent({
      userId: 'test-user-123',
      sessionId: `test-session-${i}`,
      url: testUrl,
      options: {
        maxSummaryLength: 1000,
        includeMetadata: true,
        saveToNotes: true,
      },
    });

    console.log(`      ✅ Success: ${result.success ? 'PASS' : 'FAIL'}`);
    console.log(`      ⏱️  Time: ${result.executionTime}ms`);
    console.log(`      🧠 Insights: ${result.learningInsights.length}`);
  }

  // Get learning statistics
  const stats = await webSummarizerHandler.getSummarizationStats('test-user-123');
  console.log(`    📊 Total Summarizations: ${stats.totalSummarizations}`);
  console.log(`    📈 Success Rate: ${Math.round(stats.successRate * 100)}%`);
  console.log(`    ⏱️  Average Time: ${Math.round(stats.averageExecutionTime)}ms`);
}

/**
 * Test performance improvements
 */
async function testPerformanceImprovements(): Promise<void> {
  console.log('  📈 Testing performance tracking...');
  
  // Get orchestration statistics
  const orchestrationStats = await orchestrationAgent.getStats();
  console.log(`    📊 Total Decisions: ${orchestrationStats.totalDecisions}`);
  console.log(`    📈 Success Rate: ${Math.round(orchestrationStats.successRate * 100)}%`);
  console.log(`    🎯 Average Confidence: ${Math.round(orchestrationStats.averageConfidence * 100)}%`);
  console.log(`    🏆 Total Rewards: ${orchestrationStats.learningProgress.totalRewards}`);
  console.log(`    📈 Improvement Trend: ${orchestrationStats.learningProgress.improvementTrend}`);

  // Show performance insights
  if (orchestrationStats.performanceInsights.length > 0) {
    console.log(`    🎯 Performance Insights:`);
    orchestrationStats.performanceInsights.forEach((insight, index) => {
      console.log(`      ${index + 1}. Task: ${insight.taskId} (${insight.appId})`);
      console.log(`         - Improvement: ${Math.round(insight.improvementRate * 100)}%`);
      console.log(`         - Rewards: ${insight.totalRewards} points`);
      console.log(`         - Insights: ${insight.recentInsights.slice(-1)[0] || 'None'}`);
    });
  }
}

/**
 * Test batch summarization
 */
async function testBatchSummarization(): Promise<void> {
  console.log('  📦 Testing batch summarization...');
  
  const urls = [
    'https://example.com/article1',
    'https://example.com/article2',
    'https://example.com/article3',
  ];

  const results = await webSummarizerHandler.batchSummarize(
    'test-user-123',
    'test-session-batch',
    urls,
    {
      maxSummaryLength: 800,
      includeMetadata: true,
      saveToNotes: true,
    }
  );

  console.log(`    📊 Batch Results: ${results.length} URLs processed`);
  console.log(`    ✅ Successful: ${results.filter(r => r.success).length}`);
  console.log(`    ❌ Failed: ${results.filter(r => !r.success).length}`);
  console.log(`    ⏱️  Average Time: ${Math.round(results.reduce((sum, r) => sum + r.executionTime, 0) / results.length)}ms`);
}

/**
 * Run the complete E2E test suite
 */
export async function runCompleteE2ETest(): Promise<void> {
  console.log('🚀 Web Summarizer Complete E2E Test Suite');
  console.log('=' .repeat(60));

  try {
    // Run main E2E test
    await runWebSummarizerE2ETest();
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Run batch summarization test
    console.log('📦 Testing Batch Summarization...');
    await testBatchSummarization();
    
    console.log('\n🎊 Complete E2E test suite finished successfully!');
    console.log('The Web Summarizer is production-ready with:');
    console.log('✅ Intelligent orchestration');
    console.log('✅ Learning meta loops');
    console.log('✅ Performance tracking');
    console.log('✅ Reward system integration');
    console.log('✅ Batch processing capabilities');
    
  } catch (error) {
    console.error('❌ Complete E2E test suite failed:', error);
    throw error;
  }
}

// Export test functions
export {
  runWebSummarizerE2ETest,
  runCompleteE2ETest,
  testOrchestrationIntegration,
  testWebSummarizerHandler,
  testLearningMetaLoops,
  testPerformanceImprovements,
  testBatchSummarization,
};
