/**
 * Real Autopilot Task Simulator
 * Executes actual tasks and measures performance with reward calculation
 */

import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';

interface TaskMetrics {
  taskId: string;
  taskName: string;
  executionTime: number;
  successRate: number;
  resourceUsage: number;
  complexity: number;
  timestamp: Date;
  details: {
    startTime: number;
    endTime: number;
    memoryStart: number;
    memoryEnd: number;
    success: boolean;
    error?: string;
  };
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

class RealTaskSimulator {
  private calculator = new AutopilotRewardCalculator();
  
  async executeTask(taskName: string, taskFn: () => Promise<any>, complexity: number): Promise<{ metrics: TaskMetrics; reward: RewardCalculation }> {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Measure initial state
    const startTime = performance.now();
    const memoryStart = process.memoryUsage().heapUsed;
    
    let success = false;
    let error: string | undefined;
    
    try {
      await taskFn();
      success = true;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
    
    // Measure final state
    const endTime = performance.now();
    const memoryEnd = process.memoryUsage().heapUsed;
    
    const executionTime = endTime - startTime;
    const memoryUsed = Math.abs(memoryEnd - memoryStart);
    const resourceUsage = Math.min(1, memoryUsed / (50 * 1024 * 1024)); // Normalize to 50MB
    
    const metrics: TaskMetrics = {
      taskId,
      taskName,
      executionTime,
      successRate: success ? 1.0 : 0.0,
      resourceUsage,
      complexity,
      timestamp: new Date(),
      details: {
        startTime,
        endTime,
        memoryStart,
        memoryEnd,
        success,
        error
      }
    };
    
    const reward = this.calculator.calculateReward(metrics);
    
    return { metrics, reward };
  }
  
  printResults(taskName: string, metrics: TaskMetrics, reward: RewardCalculation) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎯 Task: ${taskName}`);
    console.log(`${'='.repeat(80)}`);
    console.log(`\n📊 Execution Metrics:`);
    console.log(`  Task ID:          ${metrics.taskId}`);
    console.log(`  Execution Time:   ${metrics.executionTime.toFixed(2)}ms`);
    console.log(`  Success:          ${metrics.details.success ? '✅ Yes' : '❌ No'}`);
    console.log(`  Memory Used:      ${((metrics.details.memoryEnd - metrics.details.memoryStart) / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Resource Usage:   ${(metrics.resourceUsage * 100).toFixed(1)}%`);
    console.log(`  Complexity:       ${metrics.complexity}/10`);
    
    if (metrics.details.error) {
      console.log(`  Error:            ${metrics.details.error}`);
    }
    
    console.log(`\n💰 Reward Breakdown:`);
    console.log(`  Base Reward:        ${reward.baseReward.toFixed(2)} points`);
    console.log(`  Performance Bonus:  ${reward.performanceBonus.toFixed(2)} points (${(reward.metrics.speedScore * 100).toFixed(1)}%)`);
    console.log(`  Efficiency Bonus:   ${reward.efficiencyBonus.toFixed(2)} points (${(reward.metrics.efficiencyScore * 100).toFixed(1)}%)`);
    console.log(`  Quality Bonus:      ${reward.qualityBonus.toFixed(2)} points (${(reward.metrics.qualityScore * 100).toFixed(1)}%)`);
    console.log(`  ${'─'.repeat(40)}`);
    console.log(`  🏆 Total Reward:    ${reward.totalReward.toFixed(2)} points`);
    
    const grade = this.getPerformanceGrade(reward.totalReward);
    console.log(`\n📈 Performance Grade: ${grade}`);
  }
  
  private getPerformanceGrade(reward: number): string {
    if (reward >= 280) return '🏆 S (Excellent)';
    if (reward >= 250) return '🥇 A (Great)';
    if (reward >= 220) return '🥈 B (Good)';
    if (reward >= 190) return '🥉 C (Average)';
    if (reward >= 160) return '📊 D (Below Average)';
    return '⚠️ F (Poor)';
  }
}

// Real task implementations
const realTasks = {
  // Task 1: File System Operations
  fileSystemTask: async () => {
    const testDir = path.join(__dirname, 'temp-test-data');
    
    // Create directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    // Write multiple files
    for (let i = 0; i < 10; i++) {
      const filePath = path.join(testDir, `test-file-${i}.txt`);
      fs.writeFileSync(filePath, `Test data ${i}\n`.repeat(100));
    }
    
    // Read and process files
    const files = fs.readdirSync(testDir);
    let totalSize = 0;
    for (const file of files) {
      const filePath = path.join(testDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    }
    
    // Cleanup
    for (const file of files) {
      fs.unlinkSync(path.join(testDir, file));
    }
    fs.rmdirSync(testDir);
    
    return { filesProcessed: files.length, totalSize };
  },
  
  // Task 2: Data Processing
  dataProcessingTask: async () => {
    const data = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      value: Math.random() * 1000,
      category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
    }));
    
    // Filter and transform
    const filtered = data.filter(item => item.value > 500);
    const grouped = filtered.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, typeof data>);
    
    // Calculate statistics
    const stats = Object.entries(grouped).map(([category, items]) => ({
      category,
      count: items.length,
      avg: items.reduce((sum, item) => sum + item.value, 0) / items.length,
      max: Math.max(...items.map(item => item.value)),
      min: Math.min(...items.map(item => item.value))
    }));
    
    return stats;
  },
  
  // Task 3: String Processing
  stringProcessingTask: async () => {
    const text = 'Lorem ipsum dolor sit amet '.repeat(1000);
    
    // Various string operations
    const words = text.split(' ');
    const wordCount = words.length;
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const wordFrequency = words.reduce((acc, word) => {
      const lower = word.toLowerCase();
      acc[lower] = (acc[lower] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const sortedWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    return {
      totalWords: wordCount,
      uniqueWords: uniqueWords.size,
      topWords: sortedWords
    };
  },
  
  // Task 4: JSON Processing
  jsonProcessingTask: async () => {
    const data = {
      users: Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: Math.floor(Math.random() * 50) + 18,
        active: Math.random() > 0.3
      }))
    };
    
    // Serialize and deserialize
    const json = JSON.stringify(data);
    const parsed = JSON.parse(json);
    
    // Process data
    const activeUsers = parsed.users.filter((u: any) => u.active);
    const avgAge = activeUsers.reduce((sum: number, u: any) => sum + u.age, 0) / activeUsers.length;
    
    return {
      totalUsers: parsed.users.length,
      activeUsers: activeUsers.length,
      averageAge: avgAge.toFixed(2)
    };
  },
  
  // Task 5: Async Operations
  asyncOperationsTask: async () => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Simulate multiple async operations
    const operations = Array.from({ length: 5 }, async (_, i) => {
      await delay(Math.random() * 50);
      return { id: i, result: Math.random() * 100 };
    });
    
    const results = await Promise.all(operations);
    const total = results.reduce((sum, r) => sum + r.result, 0);
    
    return { operations: results.length, total: total.toFixed(2) };
  }
};

// Main execution
async function runRealTaskTests() {
  console.log('\n🚀 Real Autopilot Task Simulator\n');
  console.log('Testing actual task execution with performance tracking and rewards\n');
  
  const simulator = new RealTaskSimulator();
  const results: Array<{ name: string; metrics: TaskMetrics; reward: RewardCalculation }> = [];
  
  // Task 1: File System Operations (Complexity: 6)
  console.log('\n⏳ Executing Task 1: File System Operations...');
  const task1 = await simulator.executeTask(
    'File System Operations',
    realTasks.fileSystemTask,
    6
  );
  simulator.printResults('File System Operations', task1.metrics, task1.reward);
  results.push({ name: 'File System Operations', ...task1 });
  
  // Task 2: Data Processing (Complexity: 7)
  console.log('\n⏳ Executing Task 2: Data Processing...');
  const task2 = await simulator.executeTask(
    'Data Processing',
    realTasks.dataProcessingTask,
    7
  );
  simulator.printResults('Data Processing', task2.metrics, task2.reward);
  results.push({ name: 'Data Processing', ...task2 });
  
  // Task 3: String Processing (Complexity: 5)
  console.log('\n⏳ Executing Task 3: String Processing...');
  const task3 = await simulator.executeTask(
    'String Processing',
    realTasks.stringProcessingTask,
    5
  );
  simulator.printResults('String Processing', task3.metrics, task3.reward);
  results.push({ name: 'String Processing', ...task3 });
  
  // Task 4: JSON Processing (Complexity: 4)
  console.log('\n⏳ Executing Task 4: JSON Processing...');
  const task4 = await simulator.executeTask(
    'JSON Processing',
    realTasks.jsonProcessingTask,
    4
  );
  simulator.printResults('JSON Processing', task4.metrics, task4.reward);
  results.push({ name: 'JSON Processing', ...task4 });
  
  // Task 5: Async Operations (Complexity: 6)
  console.log('\n⏳ Executing Task 5: Async Operations...');
  const task5 = await simulator.executeTask(
    'Async Operations',
    realTasks.asyncOperationsTask,
    6
  );
  simulator.printResults('Async Operations', task5.metrics, task5.reward);
  results.push({ name: 'Async Operations', ...task5 });
  
  // Overall summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 Overall Performance Summary');
  console.log(`${'='.repeat(80)}\n`);
  
  const totalReward = results.reduce((sum, r) => sum + r.reward.totalReward, 0);
  const avgReward = totalReward / results.length;
  const avgExecutionTime = results.reduce((sum, r) => sum + r.metrics.executionTime, 0) / results.length;
  const successRate = results.filter(r => r.metrics.details.success).length / results.length;
  
  console.log(`Total Tasks Executed:     ${results.length}`);
  console.log(`Success Rate:             ${(successRate * 100).toFixed(1)}%`);
  console.log(`Average Execution Time:   ${avgExecutionTime.toFixed(2)}ms`);
  console.log(`Total Rewards Earned:     ${totalReward.toFixed(2)} points`);
  console.log(`Average Reward per Task:  ${avgReward.toFixed(2)} points`);
  
  console.log('\n🏆 Task Rankings:');
  const sorted = [...results].sort((a, b) => b.reward.totalReward - a.reward.totalReward);
  sorted.forEach((result, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
    console.log(`  ${medal} ${index + 1}. ${result.name.padEnd(30)} ${result.reward.totalReward.toFixed(2)} points`);
  });
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('✅ All real tasks completed!\n');
}

// Execute
runRealTaskTests().catch(console.error);
