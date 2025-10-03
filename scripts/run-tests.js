#!/usr/bin/env node

/**
 * Test Runner Script for AuraOS
 * Runs comprehensive tests for apps, MCP tools, autopilot, and learning loops
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.results = {
      unit: { passed: 0, failed: 0, total: 0 },
      integration: { passed: 0, failed: 0, total: 0 },
      e2e: { passed: 0, failed: 0, total: 0 },
      performance: { passed: 0, failed: 0, total: 0 }
    };
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🧪 Starting comprehensive test suite...\n');
    
    try {
      await this.runUnitTests();
      await this.runIntegrationTests();
      await this.runE2ETests();
      await this.runPerformanceTests();
      await this.generateTestReport();
      
      console.log('✅ All tests completed successfully!');
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  async runUnitTests() {
    console.log('🔬 Running unit tests...');
    
    try {
      const startTime = Date.now();
      execSync('pnpm test:unit', { stdio: 'inherit' });
      const endTime = Date.now();
      
      this.results.unit.passed++;
      this.results.unit.total++;
      
      console.log(`   ✅ Unit tests completed in ${endTime - startTime}ms\n`);
    } catch (error) {
      this.results.unit.failed++;
      this.results.unit.total++;
      console.error('   ❌ Unit tests failed:', error.message);
    }
  }

  async runIntegrationTests() {
    console.log('🔗 Running integration tests...');
    
    try {
      const startTime = Date.now();
      execSync('pnpm test:integration', { stdio: 'inherit' });
      const endTime = Date.now();
      
      this.results.integration.passed++;
      this.results.integration.total++;
      
      console.log(`   ✅ Integration tests completed in ${endTime - startTime}ms\n`);
    } catch (error) {
      this.results.integration.failed++;
      this.results.integration.total++;
      console.error('   ❌ Integration tests failed:', error.message);
    }
  }

  async runE2ETests() {
    console.log('🌐 Running E2E tests...');
    
    try {
      const startTime = Date.now();
      execSync('pnpm test:e2e', { stdio: 'inherit' });
      const endTime = Date.now();
      
      this.results.e2e.passed++;
      this.results.e2e.total++;
      
      console.log(`   ✅ E2E tests completed in ${endTime - startTime}ms\n`);
    } catch (error) {
      this.results.e2e.failed++;
      this.results.e2e.total++;
      console.error('   ❌ E2E tests failed:', error.message);
    }
  }

  async runPerformanceTests() {
    console.log('⚡ Running performance tests...');
    
    try {
      const startTime = Date.now();
      execSync('pnpm test:performance', { stdio: 'inherit' });
      const endTime = Date.now();
      
      this.results.performance.passed++;
      this.results.performance.total++;
      
      console.log(`   ✅ Performance tests completed in ${endTime - startTime}ms\n`);
    } catch (error) {
      this.results.performance.failed++;
      this.results.performance.total++;
      console.error('   ❌ Performance tests failed:', error.message);
    }
  }

  async generateTestReport() {
    console.log('📊 Generating test report...');
    
    const totalTime = Date.now() - this.startTime;
    const totalPassed = Object.values(this.results).reduce((sum, result) => sum + result.passed, 0);
    const totalFailed = Object.values(this.results).reduce((sum, result) => sum + result.failed, 0);
    const totalTests = totalPassed + totalFailed;
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        successRate: ((totalPassed / totalTests) * 100).toFixed(2) + '%',
        totalTime: totalTime + 'ms'
      },
      results: this.results,
      recommendations: this.generateRecommendations()
    };
    
    const reportPath = path.join(__dirname, '../test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`   📄 Test report saved to: ${reportPath}`);
    console.log(`   📊 Success rate: ${report.summary.successRate}`);
    console.log(`   ⏱️  Total time: ${report.summary.totalTime}`);
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Check unit test results
    if (this.results.unit.failed > 0) {
      recommendations.push({
        type: 'unit-tests',
        priority: 'high',
        message: `${this.results.unit.failed} unit tests failed`,
        action: 'Review and fix failing unit tests'
      });
    }
    
    // Check integration test results
    if (this.results.integration.failed > 0) {
      recommendations.push({
        type: 'integration-tests',
        priority: 'high',
        message: `${this.results.integration.failed} integration tests failed`,
        action: 'Review and fix failing integration tests'
      });
    }
    
    // Check E2E test results
    if (this.results.e2e.failed > 0) {
      recommendations.push({
        type: 'e2e-tests',
        priority: 'medium',
        message: `${this.results.e2e.failed} E2E tests failed`,
        action: 'Review and fix failing E2E tests'
      });
    }
    
    // Check performance test results
    if (this.results.performance.failed > 0) {
      recommendations.push({
        type: 'performance-tests',
        priority: 'medium',
        message: `${this.results.performance.failed} performance tests failed`,
        action: 'Review and fix failing performance tests'
      });
    }
    
    return recommendations;
  }
}

// Run tests
const testRunner = new TestRunner();
testRunner.runAllTests().catch(console.error);
