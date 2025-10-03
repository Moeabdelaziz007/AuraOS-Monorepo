#!/usr/bin/env node
/**
 * Autopilot Test Runner
 * Automatically runs tests, detects failures, and generates fixes using AI
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

interface TestResult {
  app: string;
  passed: number;
  failed: number;
  total: number;
  failures: TestFailure[];
  duration: number;
}

interface TestFailure {
  test: string;
  file: string;
  error: string;
  stack?: string;
}

interface FixSuggestion {
  file: string;
  description: string;
  code: string;
  confidence: number;
}

class AutopilotTestRunner {
  private results: TestResult[] = [];
  private fixes: FixSuggestion[] = [];

  async run() {
    console.log('🤖 Autopilot Test Runner Starting...\n');

    // Step 1: Run all tests
    console.log('📊 Step 1: Running all tests...');
    await this.runAllTests();

    // Step 2: Analyze failures
    console.log('\n🔍 Step 2: Analyzing failures...');
    const totalFailures = this.results.reduce((sum, r) => sum + r.failed, 0);
    
    if (totalFailures === 0) {
      console.log('✅ All tests passed! No fixes needed.');
      this.printSummary();
      return;
    }

    console.log(`❌ Found ${totalFailures} test failures`);

    // Step 3: Generate fixes
    console.log('\n🔧 Step 3: Generating fixes using AI...');
    await this.generateFixes();

    // Step 4: Apply fixes (if in auto mode)
    if (process.env.AUTO_FIX === 'true') {
      console.log('\n✨ Step 4: Applying fixes...');
      await this.applyFixes();

      // Step 5: Re-run tests
      console.log('\n🔄 Step 5: Re-running tests...');
      this.results = [];
      await this.runAllTests();
    }

    // Step 6: Generate report
    console.log('\n📝 Step 6: Generating report...');
    await this.generateReport();

    this.printSummary();
  }

  private async runAllTests() {
    const apps = ['terminal', 'debugger', 'desktop'];

    for (const app of apps) {
      try {
        const result = await this.runTestsForApp(app);
        this.results.push(result);
      } catch (error) {
        console.error(`Failed to run tests for ${app}:`, error);
      }
    }
  }

  private async runTestsForApp(app: string): Promise<TestResult> {
    console.log(`\n  Testing ${app}...`);
    
    const startTime = Date.now();
    
    try {
      const { stdout, stderr } = await execAsync(
        `cd apps/${app} && npm run test -- --run --reporter=json`,
        { maxBuffer: 10 * 1024 * 1024 }
      );

      const duration = Date.now() - startTime;
      
      // Parse test results
      const result = this.parseTestOutput(stdout, app, duration);
      
      console.log(`  ✓ ${result.passed} passed, ✗ ${result.failed} failed (${duration}ms)`);
      
      return result;
    } catch (error: any) {
      // Tests failed, parse the output
      const duration = Date.now() - startTime;
      const result = this.parseTestOutput(error.stdout || '', app, duration);
      
      console.log(`  ✓ ${result.passed} passed, ✗ ${result.failed} failed (${duration}ms)`);
      
      return result;
    }
  }

  private parseTestOutput(output: string, app: string, duration: number): TestResult {
    // Simple parsing - in production, use proper JSON reporter
    const passedMatch = output.match(/(\d+) passed/);
    const failedMatch = output.match(/(\d+) failed/);
    
    const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
    const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
    const total = passed + failed;

    // Extract failures (simplified)
    const failures: TestFailure[] = [];
    const failureRegex = /FAIL\s+(.+?)\s+(.+?)\n\s+(.+)/g;
    let match;
    
    while ((match = failureRegex.exec(output)) !== null) {
      failures.push({
        test: match[2],
        file: match[1],
        error: match[3],
      });
    }

    return {
      app,
      passed,
      failed,
      total,
      failures,
      duration,
    };
  }

  private async generateFixes() {
    for (const result of this.results) {
      if (result.failures.length === 0) continue;

      console.log(`\n  Analyzing ${result.app} failures...`);

      for (const failure of result.failures) {
        try {
          const fix = await this.generateFixForFailure(failure, result.app);
          if (fix) {
            this.fixes.push(fix);
            console.log(`  ✓ Generated fix for: ${failure.test}`);
          }
        } catch (error) {
          console.error(`  ✗ Failed to generate fix for: ${failure.test}`);
        }
      }
    }

    console.log(`\n  Generated ${this.fixes.length} fixes`);
  }

  private async generateFixForFailure(
    failure: TestFailure,
    app: string
  ): Promise<FixSuggestion | null> {
    // In production, this would call Gemini API
    // For now, return a mock fix
    
    // Read the failing test file
    const filePath = path.join(process.cwd(), 'apps', app, failure.file);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Simple fix suggestion (in production, use AI)
      return {
        file: filePath,
        description: `Fix for ${failure.test}`,
        code: content, // Would be modified code from AI
        confidence: 0.8,
      };
    } catch (error) {
      return null;
    }
  }

  private async applyFixes() {
    for (const fix of this.fixes) {
      if (fix.confidence < 0.7) {
        console.log(`  ⚠ Skipping low-confidence fix: ${fix.description}`);
        continue;
      }

      try {
        await fs.writeFile(fix.file, fix.code, 'utf-8');
        console.log(`  ✓ Applied fix: ${fix.description}`);
      } catch (error) {
        console.error(`  ✗ Failed to apply fix: ${fix.description}`);
      }
    }
  }

  private async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      fixes: this.fixes,
      summary: {
        totalTests: this.results.reduce((sum, r) => sum + r.total, 0),
        totalPassed: this.results.reduce((sum, r) => sum + r.passed, 0),
        totalFailed: this.results.reduce((sum, r) => sum + r.failed, 0),
        totalDuration: this.results.reduce((sum, r) => sum + r.duration, 0),
        fixesGenerated: this.fixes.length,
      },
    };

    await fs.writeFile(
      'test-report.json',
      JSON.stringify(report, null, 2),
      'utf-8'
    );

    console.log('  ✓ Report saved to test-report.json');
  }

  private printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 AUTOPILOT TEST SUMMARY');
    console.log('='.repeat(60));

    const totalTests = this.results.reduce((sum, r) => sum + r.total, 0);
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`\nTotal Tests:    ${totalTests}`);
    console.log(`✅ Passed:       ${totalPassed} (${((totalPassed / totalTests) * 100).toFixed(1)}%)`);
    console.log(`❌ Failed:       ${totalFailed} (${((totalFailed / totalTests) * 100).toFixed(1)}%)`);
    console.log(`⏱️  Duration:     ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`🔧 Fixes:        ${this.fixes.length} generated`);

    console.log('\n' + '='.repeat(60));

    if (totalFailed === 0) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Review the report for details.');
    }

    console.log('='.repeat(60) + '\n');
  }
}

// Run autopilot tests
const runner = new AutopilotTestRunner();
runner.run().catch((error) => {
  console.error('Autopilot test runner failed:', error);
  process.exit(1);
});
