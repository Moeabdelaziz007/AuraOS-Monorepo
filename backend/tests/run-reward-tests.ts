/**
 * Autopilot Reward System Test Runner
 * Demonstrates the reward calculation system with various scenarios
 */

interface TaskMetrics {
  taskId: string;
  executionTime: number;
  successRate: number;
  resourceUsage: number;
  complexity: number;
  timestamp: Date;
}

interface RewardCalculation {
  baseReward: number;
  performanceBonus: number;
  efficiencyBonus: number;
  qualityBonus: number;
  totalReward: number;
  metrics: {
    speedScore: number;
    efficiencyScore: number;
    qualityScore: number;
  };
}

class AutopilotRewardCalculator {
  private readonly BASE_REWARD = 100;
  private readonly MAX_BONUS = 200;
  
  calculateReward(metrics: TaskMetrics): RewardCalculation {
    const speedScore = this.calculateSpeedScore(metrics.executionTime, metrics.complexity);
    const efficiencyScore = this.calculateEfficiencyScore(metrics.resourceUsage);
    const qualityScore = metrics.successRate;
    
    const baseReward = this.BASE_REWARD;
    const performanceBonus = speedScore * 50;
    const efficiencyBonus = efficiencyScore * 50;
    const qualityBonus = qualityScore * 100;
    
    const totalReward = Math.min(
      baseReward + performanceBonus + efficiencyBonus + qualityBonus,
      this.BASE_REWARD + this.MAX_BONUS
    );
    
    return {
      baseReward,
      performanceBonus,
      efficiencyBonus,
      qualityBonus,
      totalReward,
      metrics: {
        speedScore,
        efficiencyScore,
        qualityScore
      }
    };
  }
  
  private calculateSpeedScore(executionTime: number, complexity: number): number {
    const expectedTime = complexity * 1000;
    const ratio = expectedTime / executionTime;
    return Math.max(0, Math.min(1, ratio));
  }
  
  private calculateEfficiencyScore(resourceUsage: number): number {
    return Math.max(0, Math.min(1, 1 - resourceUsage));
  }
}

// Test scenarios
const testScenarios = [
  {
    name: '🏆 Perfect Performance',
    metrics: {
      taskId: 'task-001',
      executionTime: 1000,
      successRate: 1.0,
      resourceUsage: 0.1,
      complexity: 5,
      timestamp: new Date()
    }
  },
  {
    name: '📊 Average Performance',
    metrics: {
      taskId: 'task-002',
      executionTime: 5000,
      successRate: 0.8,
      resourceUsage: 0.5,
      complexity: 5,
      timestamp: new Date()
    }
  },
  {
    name: '⚠️ Poor Performance',
    metrics: {
      taskId: 'task-003',
      executionTime: 10000,
      successRate: 0.5,
      resourceUsage: 0.9,
      complexity: 5,
      timestamp: new Date()
    }
  },
  {
    name: '🎯 High Complexity Task',
    metrics: {
      taskId: 'task-004',
      executionTime: 10000,
      successRate: 0.9,
      resourceUsage: 0.3,
      complexity: 10,
      timestamp: new Date()
    }
  },
  {
    name: '❌ Failed Task',
    metrics: {
      taskId: 'task-005',
      executionTime: 5000,
      successRate: 0.0,
      resourceUsage: 0.5,
      complexity: 5,
      timestamp: new Date()
    }
  },
  {
    name: '⚡ Lightning Fast',
    metrics: {
      taskId: 'task-006',
      executionTime: 500,
      successRate: 0.95,
      resourceUsage: 0.2,
      complexity: 5,
      timestamp: new Date()
    }
  }
];

function runTests() {
  console.log('\n🧪 Autopilot Reward System Test Results\n');
  console.log('='.repeat(80));
  
  const calculator = new AutopilotRewardCalculator();
  const results: Array<{ name: string; reward: RewardCalculation }> = [];
  
  testScenarios.forEach(scenario => {
    const reward = calculator.calculateReward(scenario.metrics);
    results.push({ name: scenario.name, reward });
    
    console.log(`\n${scenario.name}`);
    console.log('-'.repeat(80));
    console.log(`Task ID: ${scenario.metrics.taskId}`);
    console.log(`Execution Time: ${scenario.metrics.executionTime}ms`);
    console.log(`Success Rate: ${(scenario.metrics.successRate * 100).toFixed(1)}%`);
    console.log(`Resource Usage: ${(scenario.metrics.resourceUsage * 100).toFixed(1)}%`);
    console.log(`Complexity: ${scenario.metrics.complexity}`);
    console.log('\nReward Breakdown:');
    console.log(`  Base Reward:        ${reward.baseReward.toFixed(2)} points`);
    console.log(`  Performance Bonus:  ${reward.performanceBonus.toFixed(2)} points`);
    console.log(`  Efficiency Bonus:   ${reward.efficiencyBonus.toFixed(2)} points`);
    console.log(`  Quality Bonus:      ${reward.qualityBonus.toFixed(2)} points`);
    console.log(`  ─────────────────────────────────`);
    console.log(`  Total Reward:       ${reward.totalReward.toFixed(2)} points`);
    console.log('\nPerformance Metrics:');
    console.log(`  Speed Score:        ${(reward.metrics.speedScore * 100).toFixed(1)}%`);
    console.log(`  Efficiency Score:   ${(reward.metrics.efficiencyScore * 100).toFixed(1)}%`);
    console.log(`  Quality Score:      ${(reward.metrics.qualityScore * 100).toFixed(1)}%`);
  });
  
  // Summary statistics
  console.log('\n' + '='.repeat(80));
  console.log('\n📈 Summary Statistics\n');
  
  const totalRewards = results.reduce((sum, r) => sum + r.reward.totalReward, 0);
  const avgReward = totalRewards / results.length;
  const maxReward = Math.max(...results.map(r => r.reward.totalReward));
  const minReward = Math.min(...results.map(r => r.reward.totalReward));
  
  console.log(`Total Scenarios Tested: ${results.length}`);
  console.log(`Average Reward: ${avgReward.toFixed(2)} points`);
  console.log(`Maximum Reward: ${maxReward.toFixed(2)} points`);
  console.log(`Minimum Reward: ${minReward.toFixed(2)} points`);
  console.log(`Reward Range: ${(maxReward - minReward).toFixed(2)} points`);
  
  // Best and worst performers
  const bestPerformer = results.reduce((best, current) => 
    current.reward.totalReward > best.reward.totalReward ? current : best
  );
  const worstPerformer = results.reduce((worst, current) => 
    current.reward.totalReward < worst.reward.totalReward ? current : worst
  );
  
  console.log(`\n🥇 Best Performer: ${bestPerformer.name} (${bestPerformer.reward.totalReward.toFixed(2)} points)`);
  console.log(`🥉 Worst Performer: ${worstPerformer.name} (${worstPerformer.reward.totalReward.toFixed(2)} points)`);
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✅ All tests completed successfully!\n');
}

// Run the tests
runTests();
