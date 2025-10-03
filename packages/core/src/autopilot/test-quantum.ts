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
  console.log('🌀 Quantum Autopilot - Comprehensive Test Suite');
  console.log('================================================\n');

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
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Test ${i + 1}/${testCases.length}: ${testCase.name}`);
    console.log(`Category: ${testCase.category}`);
    console.log(`${'='.repeat(60)}`);

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
  console.log('\n\n');
  console.log('━'.repeat(80));
  console.log('📊 COMPREHENSIVE TEST RESULTS');
  console.log('━'.repeat(80));
  console.log('\n');

  // Summary table
  console.log('📋 Test Summary:');
  console.log('─'.repeat(80));
  console.log('Test Name                          | Winner    | Best Quality | Avg Time');
  console.log('─'.repeat(80));
  
  results.forEach(result => {
    const bestQuality = Math.max(
      result.speed.quality,
      result.quality.quality,
      result.balanced.quality
    );
    const avgTime = Math.round(
      (result.speed.duration + result.quality.duration + result.balanced.duration) / 3
    );
    
    console.log(
      `${result.testCase.name.padEnd(35)} | ${result.winner.padEnd(9)} | ${(bestQuality * 100).toFixed(1)}%      | ${avgTime}ms`
    );
  });
  console.log('─'.repeat(80));
  console.log('\n');

  // Approach comparison
  console.log('🔬 Approach Comparison:');
  console.log('─'.repeat(80));
  
  const speedWins = results.filter(r => r.winner === 'speed').length;
  const qualityWins = results.filter(r => r.winner === 'quality').length;
  const balancedWins = results.filter(r => r.winner === 'balanced').length;

  console.log(`⚡ Speed Approach:    ${speedWins} wins (${((speedWins / results.length) * 100).toFixed(0)}%)`);
  console.log(`💎 Quality Approach:  ${qualityWins} wins (${((qualityWins / results.length) * 100).toFixed(0)}%)`);
  console.log(`⚖️  Balanced Approach: ${balancedWins} wins (${((balancedWins / results.length) * 100).toFixed(0)}%)`);
  console.log('\n');

  // Average metrics by approach
  const avgSpeedQuality = results.reduce((sum, r) => sum + r.speed.quality, 0) / results.length;
  const avgSpeedTime = results.reduce((sum, r) => sum + r.speed.duration, 0) / results.length;
  
  const avgQualityQuality = results.reduce((sum, r) => sum + r.quality.quality, 0) / results.length;
  const avgQualityTime = results.reduce((sum, r) => sum + r.quality.duration, 0) / results.length;
  
  const avgBalancedQuality = results.reduce((sum, r) => sum + r.balanced.quality, 0) / results.length;
  const avgBalancedTime = results.reduce((sum, r) => sum + r.balanced.duration, 0) / results.length;

  console.log('📈 Average Metrics:');
  console.log('─'.repeat(80));
  console.log(`Approach  | Avg Quality | Avg Time | Quality/Time Ratio`);
  console.log('─'.repeat(80));
  console.log(`Speed     | ${(avgSpeedQuality * 100).toFixed(1)}%      | ${Math.round(avgSpeedTime)}ms   | ${(avgSpeedQuality / (avgSpeedTime / 1000)).toFixed(2)}`);
  console.log(`Quality   | ${(avgQualityQuality * 100).toFixed(1)}%      | ${Math.round(avgQualityTime)}ms   | ${(avgQualityQuality / (avgQualityTime / 1000)).toFixed(2)}`);
  console.log(`Balanced  | ${(avgBalancedQuality * 100).toFixed(1)}%      | ${Math.round(avgBalancedTime)}ms   | ${(avgBalancedQuality / (avgBalancedTime / 1000)).toFixed(2)}`);
  console.log('─'.repeat(80));
  console.log('\n');

  // Path usage analysis
  console.log('🛤️  Path Usage Analysis:');
  console.log('─'.repeat(80));
  
  const pathUsage = new Map<string, number>();
  results.forEach(r => {
    [r.speed.path, r.quality.path, r.balanced.path].forEach(path => {
      pathUsage.set(path, (pathUsage.get(path) || 0) + 1);
    });
  });

  const sortedPaths = Array.from(pathUsage.entries()).sort((a, b) => b[1] - a[1]);
  sortedPaths.forEach(([path, count]) => {
    const percentage = (count / (results.length * 3)) * 100;
    console.log(`${path.padEnd(35)} | ${count} uses (${percentage.toFixed(1)}%)`);
  });
  console.log('─'.repeat(80));
  console.log('\n');

  // Category performance
  console.log('📂 Performance by Category:');
  console.log('─'.repeat(80));
  
  const categories = new Set(testCases.map(tc => tc.category));
  categories.forEach(category => {
    const categoryResults = results.filter(r => r.testCase.category === category);
    const avgQuality = categoryResults.reduce((sum, r) => {
      return sum + Math.max(r.speed.quality, r.quality.quality, r.balanced.quality);
    }, 0) / categoryResults.length;
    
    console.log(`${category.padEnd(20)} | Avg Quality: ${(avgQuality * 100).toFixed(1)}%`);
  });
  console.log('─'.repeat(80));
  console.log('\n');

  // Recommendations
  console.log('💡 Recommendations:');
  console.log('─'.repeat(80));
  
  if (balancedWins > speedWins && balancedWins > qualityWins) {
    console.log('✅ BALANCED approach is most effective overall');
    console.log('   Use this as default for general tasks');
  } else if (qualityWins > speedWins) {
    console.log('✅ QUALITY approach wins most often');
    console.log('   Prioritize quality over speed for best results');
  } else {
    console.log('✅ SPEED approach is surprisingly effective');
    console.log('   Fast execution without sacrificing too much quality');
  }
  console.log('');

  if (avgBalancedQuality / (avgBalancedTime / 1000) > avgQualityQuality / (avgQualityTime / 1000)) {
    console.log('✅ BALANCED has best quality/time ratio');
    console.log('   Most efficient use of resources');
  }
  console.log('');

  const mostUsedPath = sortedPaths[0][0];
  console.log(`✅ Most successful path: ${mostUsedPath}`);
  console.log('   Consider optimizing this path further');
  console.log('─'.repeat(80));
  console.log('\n');

  // Overall statistics
  const stats = quantum.getStats();
  console.log('📊 Overall Quantum Autopilot Statistics:');
  console.log('─'.repeat(80));
  console.log(`Total Executions:     ${stats.totalExecutions}`);
  console.log(`Average Quality:      ${(stats.averageQuality * 100).toFixed(1)}%`);
  console.log(`Average Duration:     ${Math.round(stats.averageDuration)}ms`);
  console.log(`Average Iterations:   ${stats.averageIterations.toFixed(2)}`);
  console.log(`Most Used Path:       ${stats.mostUsedPath}`);
  console.log('─'.repeat(80));
  console.log('\n');

  // Final verdict
  console.log('━'.repeat(80));
  console.log('🎯 FINAL VERDICT');
  console.log('━'.repeat(80));
  console.log('');
  
  const overallQuality = (avgSpeedQuality + avgQualityQuality + avgBalancedQuality) / 3;
  const overallTime = (avgSpeedTime + avgQualityTime + avgBalancedTime) / 3;
  
  console.log(`Overall System Quality:  ${(overallQuality * 100).toFixed(1)}%`);
  console.log(`Overall Avg Time:        ${Math.round(overallTime)}ms`);
  console.log(`Success Rate:            ${((results.filter(r => Math.max(r.speed.quality, r.quality.quality, r.balanced.quality) >= 0.7).length / results.length) * 100).toFixed(0)}%`);
  console.log('');

  if (overallQuality >= 0.85) {
    console.log('✅ EXCELLENT: Quantum approach significantly improves task execution');
    console.log('   - High quality results across all test cases');
    console.log('   - Intelligent path selection working effectively');
    console.log('   - Ready for production use');
  } else if (overallQuality >= 0.75) {
    console.log('✅ GOOD: Quantum approach shows clear improvements');
    console.log('   - Solid quality results');
    console.log('   - Some room for optimization');
    console.log('   - Recommended for most use cases');
  } else {
    console.log('⚠️  NEEDS IMPROVEMENT: Results below expectations');
    console.log('   - Consider tuning path generation');
    console.log('   - Review collapse algorithm');
    console.log('   - More testing needed');
  }
  console.log('');
  console.log('━'.repeat(80));
  console.log('\n');

  return results;
}

/**
 * Test specific scenario in detail
 */
async function testScenarioDetailed(taskDescription: string) {
  console.log('\n🔬 Detailed Scenario Test');
  console.log('━'.repeat(80));
  console.log(`Task: ${taskDescription}`);
  console.log('━'.repeat(80));
  console.log('');

  const quantum = QuantumAutopilot.getInstance();

  // Test with different constraints
  console.log('Testing with different constraints...\n');

  // Test 1: Speed priority
  console.log('1️⃣  Speed Priority (maxTime: 2000ms)');
  const speedResult = await quantum.executeTask(taskDescription, {
    maxTime: 2000,
    preferredApproach: 'speed',
  });
  console.log(`   Quality: ${(speedResult.quality * 100).toFixed(1)}%`);
  console.log(`   Time: ${speedResult.duration}ms`);
  console.log(`   Path: ${speedResult.pathUsed.name}`);
  console.log('');

  // Test 2: Quality priority
  console.log('2️⃣  Quality Priority (minQuality: 90%)');
  const qualityResult = await quantum.executeTask(taskDescription, {
    minQuality: 0.9,
    preferredApproach: 'quality',
  });
  console.log(`   Quality: ${(qualityResult.quality * 100).toFixed(1)}%`);
  console.log(`   Time: ${qualityResult.duration}ms`);
  console.log(`   Path: ${qualityResult.pathUsed.name}`);
  console.log('');

  // Test 3: Balanced
  console.log('3️⃣  Balanced Approach');
  const balancedResult = await quantum.executeTask(taskDescription, {
    preferredApproach: 'balanced',
  });
  console.log(`   Quality: ${(balancedResult.quality * 100).toFixed(1)}%`);
  console.log(`   Time: ${balancedResult.duration}ms`);
  console.log(`   Path: ${balancedResult.pathUsed.name}`);
  console.log('');

  console.log('━'.repeat(80));
  console.log('📊 Comparison:');
  console.log('━'.repeat(80));
  console.log('');
  console.log('Approach  | Quality | Time   | Iterations | Path');
  console.log('─'.repeat(80));
  console.log(`Speed     | ${(speedResult.quality * 100).toFixed(1)}%   | ${speedResult.duration}ms | ${speedResult.iterationCount}          | ${speedResult.pathUsed.name}`);
  console.log(`Quality   | ${(qualityResult.quality * 100).toFixed(1)}%   | ${qualityResult.duration}ms | ${qualityResult.iterationCount}          | ${qualityResult.pathUsed.name}`);
  console.log(`Balanced  | ${(balancedResult.quality * 100).toFixed(1)}%   | ${balancedResult.duration}ms | ${balancedResult.iterationCount}          | ${balancedResult.pathUsed.name}`);
  console.log('─'.repeat(80));
  console.log('');
}

// Export test functions
export { runQuantumTests, testScenarioDetailed };

// Run tests if executed directly
if (require.main === module) {
  runQuantumTests()
    .then(() => {
      console.log('\n✅ All tests completed successfully!\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}
