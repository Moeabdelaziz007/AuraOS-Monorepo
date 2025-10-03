#!/usr/bin/env node

/**
 * Performance Analysis Script
 * Analyzes bundle size, performance metrics, and optimization opportunities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceAnalyzer {
  constructor() {
    this.results = {
      bundleSize: {},
      performance: {},
      recommendations: []
    };
  }

  async analyze() {
    console.log('🔍 Starting performance analysis...\n');
    
    await this.analyzeBundleSize();
    await this.analyzePerformance();
    await this.generateRecommendations();
    await this.generateReport();
    
    console.log('✅ Performance analysis complete!');
  }

  async analyzeBundleSize() {
    console.log('📦 Analyzing bundle size...');
    
    try {
      // Check if dist directory exists
      const distPath = path.join(__dirname, '../dist');
      if (!fs.existsSync(distPath)) {
        console.log('⚠️  Dist directory not found. Run build first.');
        return;
      }

      // Analyze bundle files
      const files = fs.readdirSync(distPath, { recursive: true });
      const jsFiles = files.filter(file => file.endsWith('.js'));
      const cssFiles = files.filter(file => file.endsWith('.css'));
      
      let totalJsSize = 0;
      let totalCssSize = 0;
      
      jsFiles.forEach(file => {
        const filePath = path.join(distPath, file);
        const stats = fs.statSync(filePath);
        totalJsSize += stats.size;
      });
      
      cssFiles.forEach(file => {
        const filePath = path.join(distPath, file);
        const stats = fs.statSync(filePath);
        totalCssSize += stats.size;
      });

      this.results.bundleSize = {
        totalJsSize: this.formatBytes(totalJsSize),
        totalCssSize: this.formatBytes(totalCssSize),
        totalSize: this.formatBytes(totalJsSize + totalCssSize),
        jsFiles: jsFiles.length,
        cssFiles: cssFiles.length
      };

      console.log(`   📊 Total JS size: ${this.results.bundleSize.totalJsSize}`);
      console.log(`   📊 Total CSS size: ${this.results.bundleSize.totalCssSize}`);
      console.log(`   📊 Total size: ${this.results.bundleSize.totalSize}`);
      
    } catch (error) {
      console.error('❌ Error analyzing bundle size:', error.message);
    }
  }

  async analyzePerformance() {
    console.log('⚡ Analyzing performance metrics...');
    
    try {
      // Check for performance metrics
      const metricsPath = path.join(__dirname, '../dist/bundle-stats.json');
      if (fs.existsSync(metricsPath)) {
        const stats = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
        
        this.results.performance = {
          totalModules: stats.modules?.length || 0,
          totalChunks: stats.chunks?.length || 0,
          totalAssets: stats.assets?.length || 0,
          buildTime: stats.time || 0
        };
        
        console.log(`   📊 Total modules: ${this.results.performance.totalModules}`);
        console.log(`   📊 Total chunks: ${this.results.performance.totalChunks}`);
        console.log(`   📊 Build time: ${this.results.performance.buildTime}ms`);
      }
      
    } catch (error) {
      console.error('❌ Error analyzing performance:', error.message);
    }
  }

  async generateRecommendations() {
    console.log('💡 Generating optimization recommendations...');
    
    const recommendations = [];
    
    // Bundle size recommendations
    if (this.results.bundleSize.totalSize) {
      const totalSizeMB = this.parseBytes(this.results.bundleSize.totalSize);
      if (totalSizeMB > 1) {
        recommendations.push({
          type: 'bundle-size',
          priority: 'high',
          message: 'Bundle size is large (>1MB). Consider code splitting and lazy loading.',
          action: 'Implement dynamic imports and route-based code splitting'
        });
      }
    }
    
    // Module count recommendations
    if (this.results.performance.totalModules > 1000) {
      recommendations.push({
        type: 'module-count',
        priority: 'medium',
        message: 'High module count detected. Consider tree shaking optimization.',
        action: 'Enable tree shaking and remove unused code'
      });
    }
    
    // Chunk count recommendations
    if (this.results.performance.totalChunks > 50) {
      recommendations.push({
        type: 'chunk-count',
        priority: 'medium',
        message: 'High chunk count detected. Consider chunk optimization.',
        action: 'Optimize chunk splitting strategy'
      });
    }
    
    this.results.recommendations = recommendations;
    
    recommendations.forEach(rec => {
      const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
      console.log(`   ${priority} ${rec.message}`);
    });
  }

  async generateReport() {
    console.log('📋 Generating performance report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      bundleSize: this.results.bundleSize,
      performance: this.results.performance,
      recommendations: this.results.recommendations,
      summary: {
        totalRecommendations: this.results.recommendations.length,
        highPriority: this.results.recommendations.filter(r => r.priority === 'high').length,
        mediumPriority: this.results.recommendations.filter(r => r.priority === 'medium').length,
        lowPriority: this.results.recommendations.filter(r => r.priority === 'low').length
      }
    };
    
    const reportPath = path.join(__dirname, '../performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`   📄 Report saved to: ${reportPath}`);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  parseBytes(sizeStr) {
    const match = sizeStr.match(/(\d+\.?\d*)\s*(KB|MB|GB)/);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'KB': return value / 1024;
      case 'MB': return value;
      case 'GB': return value * 1024;
      default: return 0;
    }
  }
}

// Run analysis
const analyzer = new PerformanceAnalyzer();
analyzer.analyze().catch(console.error);
