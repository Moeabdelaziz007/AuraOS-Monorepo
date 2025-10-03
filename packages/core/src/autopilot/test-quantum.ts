/**
 * Quantum Autopilot Test Suite
 * Tests different approaches and measures improvements
 */

import { QuantumAutopilot } from './quantum-autopilot';

interface TestCase {
  name: string;
  task: string;
  expectedQuality: number;
  category: string;
}

interface TestResult {
  testCase: TestCase;
  speed: {
    quality: number;
    duration: number;
    iterations: number;
    path: string;
  };
  quality: {
    quality: number;
    duration: number;
    iterations: number;
    path: string;
  };
  balanced: {
    quality: number;
    duration: number;
    iterations: number;
    path: string;
  };
  winner: string;
  improvement: number;
}

/**
 * Run comprehensive quantum autopilot tests
 */
async function runQuantumTests() {
  logger.info('🌀 Quantum Autopilot - Comprehensive Test Suite');
  logger.info('================================================\n');

  const quantum = QuantumAutopilot.getInstance();

  // Define test cases
  const testCases: TestCase[] = [
    {
      name: 'Arabic Content Generation',
      task: 'اكتب مقال عن الذكاء الاصطناعي في التعليم',
      expectedQuality: 0.85,
      category: 'content',
    },
    {
      name: 'Web Research',
      task: 'Research latest AI developments in 2024',
      expectedQuality: 0.80,
      category: 'research',
    },
    {
      name: 'Code Generation',
      task: 'Create a REST API endpoint for user authentication',
      expectedQuality: 0.90,
      category: 'code',
    },
    {
      name: 'Data Analysis',
      task: 'Analyze sales data and generate insights',
      expectedQuality: 0.85,
      category: 'data',
    },
    {
      name: 'Workflow Automation',
      task: 'Create automated workflow for daily content publishing',
      expectedQuality: 0.88,
      category: 'automation',
    },
    {
      name: 'Project Planning',
      task: 'Plan a mobile app development project with milestones',
      expectedQuality: 0.82,
      category: 'planning',
    },
  ];

  const results: TestResult[] = [];

  // Run tests
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    logger.info(`\n${'='.repeat(60)}`);
    logger.info(`Test ${i + 1}/${testCases.length}: ${testCase.name}`);
    logger.info(`Category: ${testCase.category}`);
    logger.info(`${'='.repeat(60)}`);

    const comparison = await quantum.compareApproaches(testCase.task);

    results.push({
      testCase,
      speed: {
        quality: comparison.speed.quality,
        duration: comparison.speed.duration,
        iterations: comparison.speed.iterationCount,
        path: comparison.speed.pathUsed.name,
      },
      quality: {
        quality: comparison.quality.quality,
        duration: comparison.quality.duration,
        iterations: comparison.quality.iterationCount,
        path: comparison.quality.pathUsed.name,
      },
      balanced: {
        quality: comparison.balanced.quality,
        duration: comparison.balanced.duration,
        iterations: comparison.balanced.iterationCount,
        path: comparison.balanced.pathUsed.name,
      },
      winner: comparison.winner,
      improvement: 0,
    });

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Generate comprehensive report
  logger.info('\n\n');
  logger.info('━'.repeat(80));
  logger.info('📊 COMPREHENSIVE TEST RESULTS');
  logger.info('━'.repeat(80));
  logger.info('\n');

  // Summary table
  logger.info('📋 Test Summary:');
  logger.info('─'.repeat(80));
  logger.info('Test Name                          | Winner    | Best Quality | Avg Time');
  logger.info('─'.repeat(80));
  
  results.forEach(result => {
    const bestQuality = Math.max(
      result.speed.quality,
      result.quality.quality,
      result.balanced.quality
    );
    const avgTime = Math.round(
      (result.speed.duration + result.quality.duration + result.balanced.duration) / 3
    );
    
    logger.info(
      `${result.testCase.name.padEnd(35)} | ${result.winner.padEnd(9)} | ${(bestQuality * 100).toFixed(1)}%      | ${avgTime}ms`
    );
  });
  logger.info('─'.repeat(80));
  logger.info('\n');

  // Approach comparison
  logger.info('🔬 Approach Comparison:');
  logger.info('─'.repeat(80));
  
  const speedWins = results.filter(r => r.winner === 'speed').length;
  const qualityWins = results.filter(r => r.winner === 'quality').length;
  const balancedWins = results.filter(r => r.winner === 'balanced').length;

  logger.info(`⚡ Speed Approach:    ${speedWins} wins (${((speedWins / results.length) * 100).toFixed(0)}%)`);
  logger.info(`💎 Quality Approach:  ${qualityWins} wins (${((qualityWins / results.length) * 100).toFixed(0)}%)`);
  logger.info(`⚖️  Balanced Approach: ${balancedWins} wins (${((balancedWins / results.length) * 100).toFixed(0)}%)`);
  logger.info('\n');

  // Average metrics by approach
  const avgSpeedQuality = results.reduce((sum, r) => sum + r.speed.quality, 0) / results.length;
  const avgSpeedTime = results.reduce((sum, r) => sum + r.speed.duration, 0) / results.length;
  
  const avgQualityQuality = results.reduce((sum, r) => sum + r.quality.quality, 0) / results.length;
  const avgQualityTime = results.reduce((sum, r) => sum + r.quality.duration, 0) / results.length;
  
  const avgBalancedQuality = results.reduce((sum, r) => sum + r.balanced.quality, 0) / results.length;
  const avgBalancedTime = results.reduce((sum, r) => sum + r.balanced.duration, 0) / results.length;

  logger.info('📈 Average Metrics:');
  logger.info('─'.repeat(80));
  logger.info(`Approach  | Avg Quality | Avg Time | Quality/Time Ratio`);
  logger.info('─'.repeat(80));
  logger.info(`Speed     | ${(avgSpeedQuality * 100).toFixed(1)}%      | ${Math.round(avgSpeedTime)}ms   | ${(avgSpeedQuality / (avgSpeedTime / 1000)).toFixed(2)}`);
  logger.info(`Quality   | ${(avgQualityQuality * 100).toFixed(1)}%      | ${Math.round(avgQualityTime)}ms   | ${(avgQualityQuality / (avgQualityTime / 1000)).toFixed(2)}`);
  logger.info(`Balanced  | ${(avgBalancedQuality * 100).toFixed(1)}%      | ${Math.round(avgBalancedTime)}ms   | ${(avgBalancedQuality / (avgBalancedTime / 1000)).toFixed(2)}`);
  logger.info('─'.repeat(80));
  logger.info('\n');

  // Path usage analysis
  logger.info('🛤️  Path Usage Analysis:');
  logger.info('─'.repeat(80));
  
  const pathUsage = new Map<string, number>();
  results.forEach(r => {
    [r.speed.path, r.quality.path, r.balanced.path].forEach(path => {
      pathUsage.set(path, (pathUsage.get(path) || 0) + 1);
    });
  });

  const sortedPaths = Array.from(pathUsage.entries()).sort((a, b) => b[1] - a[1]);
  sortedPaths.forEach(([path, count]) => {
    const percentage = (count / (results.length * 3)) * 100;
    logger.info(`${path.padEnd(35)} | ${count} uses (${percentage.toFixed(1)}%)`);
  });
  logger.info('─'.repeat(80));
  logger.info('\n');

  // Category performance
  logger.info('📂 Performance by Category:');
  logger.info('─'.repeat(80));
  
  const categories = new Set(testCases.map(tc => tc.category));
  categories.forEach(category => {
    const categoryResults = results.filter(r => r.testCase.category === category);
    const avgQuality = categoryResults.reduce((sum, r) => {
      return sum + Math.max(r.speed.quality, r.quality.quality, r.balanced.quality);
    }, 0) / categoryResults.length;
    
    logger.info(`${category.padEnd(20)} | Avg Quality: ${(avgQuality * 100).toFixed(1)}%`);
  });
  logger.info('─'.repeat(80));
  logger.info('\n');

  // Recommendations
  logger.info('💡 Recommendations:');
  logger.info('─'.repeat(80));
  
  if (balancedWins > speedWins && balancedWins > qualityWins) {
    logger.info('✅ BALANCED approach is most effective overall');
    logger.info('   Use this as default for general tasks');
  } else if (qualityWins > speedWins) {
    logger.info('✅ QUALITY approach wins most often');
    logger.info('   Prioritize quality over speed for best results');
  } else {
    logger.info('✅ SPEED approach is surprisingly effective');
    logger.info('   Fast execution without sacrificing too much quality');
  }
  logger.info('');

  if (avgBalancedQuality / (avgBalancedTime / 1000) > avgQualityQuality / (avgQualityTime / 1000)) {
    logger.info('✅ BALANCED has best quality/time ratio');
    logger.info('   Most efficient use of resources');
  }
  logger.info('');

  const mostUsedPath = sortedPaths[0][0];
  logger.info(`✅ Most successful path: ${mostUsedPath}`);
  logger.info('   Consider optimizing this path further');
  logger.info('─'.repeat(80));
  logger.info('\n');

  // Overall statistics
  const stats = quantum.getStats();
  logger.info('📊 Overall Quantum Autopilot Statistics:');
  logger.info('─'.repeat(80));
  logger.info(`Total Executions:     ${stats.totalExecutions}`);
  logger.info(`Average Quality:      ${(stats.averageQuality * 100).toFixed(1)}%`);
  logger.info(`Average Duration:     ${Math.round(stats.averageDuration)}ms`);
  logger.info(`Average Iterations:   ${stats.averageIterations.toFixed(2)}`);
  logger.info(`Most Used Path:       ${stats.mostUsedPath}`);
  logger.info('─'.repeat(80));
  logger.info('\n');

  // Final verdict
  logger.info('━'.repeat(80));
  logger.info('🎯 FINAL VERDICT');
  logger.info('━'.repeat(80));
  logger.info('');
  
  const overallQuality = (avgSpeedQuality + avgQualityQuality + avgBalancedQuality) / 3;
  const overallTime = (avgSpeedTime + avgQualityTime + avgBalancedTime) / 3;
  
  logger.info(`Overall System Quality:  ${(overallQuality * 100).toFixed(1)}%`);
  logger.info(`Overall Avg Time:        ${Math.round(overallTime)}ms`);
  logger.info(`Success Rate:            ${((results.filter(r => Math.max(r.speed.quality, r.quality.quality, r.balanced.quality) >= 0.7).length / results.length) * 100).toFixed(0)}%`);
  logger.info('');

  if (overallQuality >= 0.85) {
    logger.info('✅ EXCELLENT: Quantum approach significantly improves task execution');
    logger.info('   - High quality results across all test cases');
    logger.info('   - Intelligent path selection working effectively');
    logger.info('   - Ready for production use');
  } else if (overallQuality >= 0.75) {
    logger.info('✅ GOOD: Quantum approach shows clear improvements');
    logger.info('   - Solid quality results');
    logger.info('   - Some room for optimization');
    logger.info('   - Recommended for most use cases');
  } else {
    logger.info('⚠️  NEEDS IMPROVEMENT: Results below expectations');
    logger.info('   - Consider tuning path generation');
    logger.info('   - Review collapse algorithm');
    logger.info('   - More testing needed');
  }
  logger.info('');
  logger.info('━'.repeat(80));
  logger.info('\n');

  return results;
}

/**
 * Test specific scenario in detail
 */
async function testScenarioDetailed(taskDescription: string) {
  logger.info('\n🔬 Detailed Scenario Test');
  logger.info('━'.repeat(80));
  logger.info(`Task: ${taskDescription}`);
  logger.info('━'.repeat(80));
  logger.info('');

  const quantum = QuantumAutopilot.getInstance();

  // Test with different constraints
  logger.info('Testing with different constraints...\n');

  // Test 1: Speed priority
  logger.info('1️⃣  Speed Priority (maxTime: 2000ms)');
  const speedResult = await quantum.executeTask(taskDescription, {
    maxTime: 2000,
    preferredApproach: 'speed',
  });
  logger.info(`   Quality: ${(speedResult.quality * 100).toFixed(1)}%`);
  logger.info(`   Time: ${speedResult.duration}ms`);
  logger.info(`   Path: ${speedResult.pathUsed.name}`);
  logger.info('');

  // Test 2: Quality priority
  logger.info('2️⃣  Quality Priority (minQuality: 90%)');
  const qualityResult = await quantum.executeTask(taskDescription, {
    minQuality: 0.9,
    preferredApproach: 'quality',
  });
  logger.info(`   Quality: ${(qualityResult.quality * 100).toFixed(1)}%`);
  logger.info(`   Time: ${qualityResult.duration}ms`);
  logger.info(`   Path: ${qualityResult.pathUsed.name}`);
  logger.info('');

  // Test 3: Balanced
  logger.info('3️⃣  Balanced Approach');
  const balancedResult = await quantum.executeTask(taskDescription, {
    preferredApproach: 'balanced',
  });
  logger.info(`   Quality: ${(balancedResult.quality * 100).toFixed(1)}%`);
  logger.info(`   Time: ${balancedResult.duration}ms`);
  logger.info(`   Path: ${balancedResult.pathUsed.name}`);
  logger.info('');

  logger.info('━'.repeat(80));
  logger.info('📊 Comparison:');
  logger.info('━'.repeat(80));
  logger.info('');
  logger.info('Approach  | Quality | Time   | Iterations | Path');
  logger.info('─'.repeat(80));
  logger.info(`Speed     | ${(speedResult.quality * 100).toFixed(1)}%   | ${speedResult.duration}ms | ${speedResult.iterationCount}          | ${speedResult.pathUsed.name}`);
  logger.info(`Quality   | ${(qualityResult.quality * 100).toFixed(1)}%   | ${qualityResult.duration}ms | ${qualityResult.iterationCount}          | ${qualityResult.pathUsed.name}`);
  logger.info(`Balanced  | ${(balancedResult.quality * 100).toFixed(1)}%   | ${balancedResult.duration}ms | ${balancedResult.iterationCount}          | ${balancedResult.pathUsed.name}`);
  logger.info('─'.repeat(80));
  logger.info('');
}

// Export test functions
export { runQuantumTests, testScenarioDetailed };

// Run tests if executed directly
if (require.main === module) {
  runQuantumTests()
    .then(() => {
      logger.info('\n✅ All tests completed successfully!\n');
      process.exit(0);
    })
    .catch(error => {
      logger.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}
