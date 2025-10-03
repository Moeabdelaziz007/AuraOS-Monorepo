#!/usr/bin/env node

/**
 * Memory Profiler Script
 * Monitors memory usage and identifies potential memory leaks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MemoryProfiler {
  constructor() {
    this.memorySnapshots = [];
    this.leakDetector = new LeakDetector();
  }

  async startProfiling() {
    console.log('🧠 Starting memory profiling...\n');
    
    // Start memory monitoring
    this.startMemoryMonitoring();
    
    // Run application in development mode
    await this.runApplication();
    
    // Analyze memory patterns
    await this.analyzeMemoryPatterns();
    
    // Generate memory report
    await this.generateMemoryReport();
    
    console.log('✅ Memory profiling complete!');
  }

  startMemoryMonitoring() {
    console.log('📊 Starting memory monitoring...');
    
    const interval = setInterval(() => {
      const memoryUsage = process.memoryUsage();
      const timestamp = Date.now();
      
      this.memorySnapshots.push({
        timestamp,
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
        arrayBuffers: memoryUsage.arrayBuffers
      });
      
      // Log memory usage every 5 seconds
      if (this.memorySnapshots.length % 5 === 0) {
        console.log(`   📈 Memory: ${this.formatBytes(memoryUsage.heapUsed)} / ${this.formatBytes(memoryUsage.heapTotal)}`);
      }
    }, 1000);
    
    // Stop monitoring after 60 seconds
    setTimeout(() => {
      clearInterval(interval);
      console.log('   ⏹️  Memory monitoring stopped');
    }, 60000);
  }

  async runApplication() {
    console.log('🚀 Starting application...');
    
    try {
      // Start development server
      const child = execSync('pnpm dev', { 
        stdio: 'pipe',
        timeout: 30000 
      });
      
      console.log('   ✅ Application started successfully');
      
    } catch (error) {
      console.error('❌ Error starting application:', error.message);
    }
  }

  async analyzeMemoryPatterns() {
    console.log('🔍 Analyzing memory patterns...');
    
    if (this.memorySnapshots.length < 2) {
      console.log('   ⚠️  Not enough memory snapshots for analysis');
      return;
    }
    
    // Detect memory leaks
    const leaks = this.leakDetector.detectLeaks(this.memorySnapshots);
    
    if (leaks.length > 0) {
      console.log('   🚨 Potential memory leaks detected:');
      leaks.forEach(leak => {
        console.log(`      - ${leak.type}: ${leak.description}`);
      });
    } else {
      console.log('   ✅ No memory leaks detected');
    }
    
    // Analyze memory growth
    const growth = this.analyzeMemoryGrowth();
    if (growth > 0.1) { // 10% growth threshold
      console.log(`   ⚠️  Memory growth detected: ${(growth * 100).toFixed(2)}%`);
    }
  }

  async generateMemoryReport() {
    console.log('📋 Generating memory report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      snapshots: this.memorySnapshots,
      analysis: {
        totalSnapshots: this.memorySnapshots.length,
        averageHeapUsed: this.calculateAverage('heapUsed'),
        peakHeapUsed: Math.max(...this.memorySnapshots.map(s => s.heapUsed)),
        memoryGrowth: this.analyzeMemoryGrowth(),
        leaks: this.leakDetector.detectLeaks(this.memorySnapshots)
      },
      recommendations: this.generateMemoryRecommendations()
    };
    
    const reportPath = path.join(__dirname, '../memory-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`   📄 Memory report saved to: ${reportPath}`);
  }

  analyzeMemoryGrowth() {
    if (this.memorySnapshots.length < 2) return 0;
    
    const first = this.memorySnapshots[0];
    const last = this.memorySnapshots[this.memorySnapshots.length - 1];
    
    return (last.heapUsed - first.heapUsed) / first.heapUsed;
  }

  calculateAverage(property) {
    const sum = this.memorySnapshots.reduce((acc, snapshot) => acc + snapshot[property], 0);
    return sum / this.memorySnapshots.length;
  }

  generateMemoryRecommendations() {
    const recommendations = [];
    
    // Check for high memory usage
    const avgHeapUsed = this.calculateAverage('heapUsed');
    if (avgHeapUsed > 100 * 1024 * 1024) { // 100MB
      recommendations.push({
        type: 'high-memory-usage',
        priority: 'high',
        message: 'High memory usage detected. Consider optimizing components.',
        action: 'Implement React.memo, useMemo, and useCallback for expensive components'
      });
    }
    
    // Check for memory growth
    const growth = this.analyzeMemoryGrowth();
    if (growth > 0.2) { // 20% growth
      recommendations.push({
        type: 'memory-growth',
        priority: 'high',
        message: 'Significant memory growth detected. Potential memory leak.',
        action: 'Review event listeners, timers, and component cleanup'
      });
    }
    
    return recommendations;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

class LeakDetector {
  detectLeaks(snapshots) {
    const leaks = [];
    
    // Detect continuous memory growth
    if (this.detectContinuousGrowth(snapshots)) {
      leaks.push({
        type: 'continuous-growth',
        description: 'Continuous memory growth detected'
      });
    }
    
    // Detect memory spikes
    if (this.detectMemorySpikes(snapshots)) {
      leaks.push({
        type: 'memory-spikes',
        description: 'Memory spikes detected'
      });
    }
    
    return leaks;
  }
  
  detectContinuousGrowth(snapshots) {
    if (snapshots.length < 10) return false;
    
    let growthCount = 0;
    for (let i = 1; i < snapshots.length; i++) {
      if (snapshots[i].heapUsed > snapshots[i - 1].heapUsed) {
        growthCount++;
      }
    }
    
    return growthCount / (snapshots.length - 1) > 0.8; // 80% growth
  }
  
  detectMemorySpikes(snapshots) {
    if (snapshots.length < 3) return false;
    
    for (let i = 1; i < snapshots.length - 1; i++) {
      const prev = snapshots[i - 1].heapUsed;
      const current = snapshots[i].heapUsed;
      const next = snapshots[i + 1].heapUsed;
      
      // Check for spike (current > 1.5 * average of prev and next)
      const avg = (prev + next) / 2;
      if (current > avg * 1.5) {
        return true;
      }
    }
    
    return false;
  }
}

// Run memory profiling
const profiler = new MemoryProfiler();
profiler.startProfiling().catch(console.error);
