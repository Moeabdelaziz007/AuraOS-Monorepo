#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  app: string;
  type: 'unit' | 'integration' | 'e2e';
  passed: number;
  failed: number;
  total: number;
  duration: number;
  coverage?: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
}

interface TestReport {
  timestamp: string;
  summary: {
    totalTests: number;
    totalPassed: number;
    totalFailed: number;
    successRate: number;
    totalDuration: number;
  };
  results: TestResult[];
  coverageSummary: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
}

async function readTestResults(app: string, type: string): Promise<TestResult | null> {
  const resultPath = path.join(process.cwd(), `apps/${app}/test-results-${type}.json`);
  
  if (!fs.existsSync(resultPath)) {
    console.log(`⚠️  No test results found for ${app} ${type}`);
    return null;
  }

  try {
    const data = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
    
    return {
      app,
      type: type as 'unit' | 'integration' | 'e2e',
      passed: data.numPassedTests || 0,
      failed: data.numFailedTests || 0,
      total: data.numTotalTests || 0,
      duration: data.testResults?.reduce((sum: number, r: any) => sum + (r.perfStats?.runtime || 0), 0) || 0,
    };
  } catch (error) {
    console.error(`❌ Error reading test results for ${app} ${type}:`, error);
    return null;
  }
}

async function readCoverageResults(app: string): Promise<TestResult['coverage'] | null> {
  const coveragePath = path.join(process.cwd(), `apps/${app}/coverage/coverage-summary.json`);
  
  if (!fs.existsSync(coveragePath)) {
    return null;
  }

  try {
    const data = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    const total = data.total;
    
    return {
      lines: total.lines.pct,
      functions: total.functions.pct,
      branches: total.branches.pct,
      statements: total.statements.pct,
    };
  } catch (error) {
    console.error(`❌ Error reading coverage for ${app}:`, error);
    return null;
  }
}

async function generateReport(): Promise<void> {
  console.log('📊 Generating test report...\n');

  const apps = ['terminal', 'debugger', 'desktop'];
  const testTypes = ['unit', 'integration'];
  const results: TestResult[] = [];

  // Collect test results
  for (const app of apps) {
    for (const type of testTypes) {
      const result = await readTestResults(app, type);
      if (result) {
        // Add coverage for unit tests
        if (type === 'unit') {
          result.coverage = await readCoverageResults(app);
        }
        results.push(result);
      }
    }
  }

  // Read E2E results
  const e2eResultPath = path.join(process.cwd(), 'test-results.json');
  if (fs.existsSync(e2eResultPath)) {
    try {
      const e2eData = JSON.parse(fs.readFileSync(e2eResultPath, 'utf8'));
      results.push({
        app: 'all',
        type: 'e2e',
        passed: e2eData.numPassedTests || 0,
        failed: e2eData.numFailedTests || 0,
        total: e2eData.numTotalTests || 0,
        duration: e2eData.testResults?.reduce((sum: number, r: any) => sum + (r.perfStats?.runtime || 0), 0) || 0,
      });
    } catch (error) {
      console.error('❌ Error reading E2E results:', error);
    }
  }

  // Calculate summary
  const totalTests = results.reduce((sum, r) => sum + r.total, 0);
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const successRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

  // Calculate coverage summary
  const coverageResults = results.filter(r => r.coverage);
  const coverageSummary = {
    lines: coverageResults.length > 0 
      ? Math.round(coverageResults.reduce((sum, r) => sum + (r.coverage?.lines || 0), 0) / coverageResults.length)
      : 0,
    functions: coverageResults.length > 0
      ? Math.round(coverageResults.reduce((sum, r) => sum + (r.coverage?.functions || 0), 0) / coverageResults.length)
      : 0,
    branches: coverageResults.length > 0
      ? Math.round(coverageResults.reduce((sum, r) => sum + (r.coverage?.branches || 0), 0) / coverageResults.length)
      : 0,
    statements: coverageResults.length > 0
      ? Math.round(coverageResults.reduce((sum, r) => sum + (r.coverage?.statements || 0), 0) / coverageResults.length)
      : 0,
  };

  const report: TestReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests,
      totalPassed,
      totalFailed,
      successRate,
      totalDuration,
    },
    results,
    coverageSummary,
  };

  // Save report
  const reportPath = path.join(process.cwd(), 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Generate HTML report
  generateHTMLReport(report);

  // Print summary
  console.log('📊 Test Report Summary\n');
  console.log('═'.repeat(60));
  console.log(`Total Tests:     ${totalTests}`);
  console.log(`Passed:          ✅ ${totalPassed}`);
  console.log(`Failed:          ❌ ${totalFailed}`);
  console.log(`Success Rate:    ${successRate}%`);
  console.log(`Total Duration:  ${(totalDuration / 1000).toFixed(2)}s`);
  console.log('═'.repeat(60));
  console.log('\n📈 Coverage Summary\n');
  console.log('═'.repeat(60));
  console.log(`Lines:           ${coverageSummary.lines}%`);
  console.log(`Functions:       ${coverageSummary.functions}%`);
  console.log(`Branches:        ${coverageSummary.branches}%`);
  console.log(`Statements:      ${coverageSummary.statements}%`);
  console.log('═'.repeat(60));
  console.log('\n📝 Detailed Results\n');

  for (const result of results) {
    const status = result.failed === 0 ? '✅' : '❌';
    console.log(`${status} ${result.app} (${result.type}): ${result.passed}/${result.total} passed`);
    if (result.coverage) {
      console.log(`   Coverage: ${result.coverage.lines}% lines, ${result.coverage.functions}% functions`);
    }
  }

  console.log(`\n✅ Report saved to: ${reportPath}`);
  console.log(`✅ HTML report saved to: test-report.html\n`);
}

function generateHTMLReport(report: TestReport): void {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AuraOS Test Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .header h1 { font-size: 32px; margin-bottom: 10px; }
    .header p { opacity: 0.9; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .card h3 { font-size: 14px; color: #666; margin-bottom: 10px; }
    .card .value { font-size: 32px; font-weight: bold; color: #333; }
    .card.success .value { color: #10b981; }
    .card.danger .value { color: #ef4444; }
    .card.info .value { color: #3b82f6; }
    .results {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    .results h2 { margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; font-weight: 600; }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge.success { background: #d1fae5; color: #065f46; }
    .badge.danger { background: #fee2e2; color: #991b1b; }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981 0%, #059669 100%);
      transition: width 0.3s ease;
    }
    .coverage {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }
    .coverage-item h4 { font-size: 12px; color: #666; margin-bottom: 8px; }
    .coverage-value { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 AuraOS Test Report</h1>
      <p>Generated on ${new Date(report.timestamp).toLocaleString()}</p>
    </div>

    <div class="summary">
      <div class="card info">
        <h3>Total Tests</h3>
        <div class="value">${report.summary.totalTests}</div>
      </div>
      <div class="card success">
        <h3>Passed</h3>
        <div class="value">${report.summary.totalPassed}</div>
      </div>
      <div class="card danger">
        <h3>Failed</h3>
        <div class="value">${report.summary.totalFailed}</div>
      </div>
      <div class="card ${report.summary.successRate >= 80 ? 'success' : 'danger'}">
        <h3>Success Rate</h3>
        <div class="value">${report.summary.successRate}%</div>
      </div>
    </div>

    <div class="results">
      <h2>📊 Test Results</h2>
      <table>
        <thead>
          <tr>
            <th>App</th>
            <th>Type</th>
            <th>Status</th>
            <th>Passed</th>
            <th>Failed</th>
            <th>Total</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          ${report.results.map(r => `
            <tr>
              <td><strong>${r.app}</strong></td>
              <td>${r.type}</td>
              <td>
                <span class="badge ${r.failed === 0 ? 'success' : 'danger'}">
                  ${r.failed === 0 ? '✅ Passed' : '❌ Failed'}
                </span>
              </td>
              <td>${r.passed}</td>
              <td>${r.failed}</td>
              <td>${r.total}</td>
              <td>${(r.duration / 1000).toFixed(2)}s</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="results">
      <h2>📈 Coverage Summary</h2>
      <div class="coverage">
        <div class="coverage-item">
          <h4>Lines</h4>
          <div class="coverage-value">${report.coverageSummary.lines}%</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${report.coverageSummary.lines}%"></div>
          </div>
        </div>
        <div class="coverage-item">
          <h4>Functions</h4>
          <div class="coverage-value">${report.coverageSummary.functions}%</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${report.coverageSummary.functions}%"></div>
          </div>
        </div>
        <div class="coverage-item">
          <h4>Branches</h4>
          <div class="coverage-value">${report.coverageSummary.branches}%</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${report.coverageSummary.branches}%"></div>
          </div>
        </div>
        <div class="coverage-item">
          <h4>Statements</h4>
          <div class="coverage-value">${report.coverageSummary.statements}%</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${report.coverageSummary.statements}%"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const htmlPath = path.join(process.cwd(), 'test-report.html');
  fs.writeFileSync(htmlPath, html);
}

// Run report generation
generateReport().catch(error => {
  console.error('❌ Error generating report:', error);
  process.exit(1);
});
