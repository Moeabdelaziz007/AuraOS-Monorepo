/**
 * Monitoring Manager for Telegram Bot
 */

import { EventEmitter } from 'events';
import { 
  UserSession, 
  SystemMetrics, 
  AnalyticsData,
  BotResponse 
} from '../types/index.js';

export class MonitoringManager extends EventEmitter {
  private analytics: AnalyticsData;
  private systemMetrics: SystemMetrics;
  private userActivity: Map<number, UserActivity> = new Map();
  private performanceMetrics: PerformanceMetrics[] = [];
  private isMonitoring: boolean = false;

  constructor() {
    super();
    this.initializeMonitoring();
  }

  /**
   * Initialize monitoring system
   */
  private initializeMonitoring(): void {
    try {
      console.log('📊 Initializing Monitoring Manager...');
      
      this.analytics = this.initializeAnalytics();
      this.systemMetrics = this.getSystemMetrics();
      
      // Start monitoring intervals
      this.startSystemMonitoring();
      this.startPerformanceMonitoring();
      
      this.isMonitoring = true;
      console.log('✅ Monitoring Manager initialized');
      
    } catch (error) {
      console.error('❌ Monitoring initialization failed:', error);
      this.isMonitoring = false;
    }
  }

  /**
   * Initialize analytics
   */
  private initializeAnalytics(): AnalyticsData {
    return {
      totalMessages: 0,
      totalCommands: 0,
      activeUsers: 0,
      commandUsage: new Map(),
      userActivity: new Map(),
      systemMetrics: this.getSystemMetrics(),
      startTime: new Date()
    };
  }

  /**
   * Get system metrics
   */
  private getSystemMetrics(): SystemMetrics {
    const memoryUsage = process.memoryUsage();
    
    return {
      uptime: process.uptime(),
      memoryUsage,
      cpuUsage: 0, // Would need additional monitoring
      diskUsage: {
        total: 0,
        used: 0,
        free: 0,
        percentage: 0
      },
      networkStats: {
        bytesReceived: 0,
        bytesSent: 0,
        packetsReceived: 0,
        packetsSent: 0
      }
    };
  }

  /**
   * Start system monitoring
   */
  private startSystemMonitoring(): void {
    setInterval(() => {
      this.updateSystemMetrics();
      this.emit('system_metrics_updated', this.systemMetrics);
    }, 30000); // Every 30 seconds
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    setInterval(() => {
      this.recordPerformanceMetrics();
    }, 60000); // Every minute
  }

  /**
   * Update system metrics
   */
  private updateSystemMetrics(): void {
    this.systemMetrics = this.getSystemMetrics();
    this.analytics.systemMetrics = this.systemMetrics;
  }

  /**
   * Record performance metrics
   */
  private recordPerformanceMetrics(): void {
    const metrics: PerformanceMetrics = {
      timestamp: new Date(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      activeUsers: this.userActivity.size,
      totalMessages: this.analytics.totalMessages,
      totalCommands: this.analytics.totalCommands
    };
    
    this.performanceMetrics.push(metrics);
    
    // Keep only last 1000 metrics
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics.splice(0, this.performanceMetrics.length - 1000);
    }
    
    this.emit('performance_metrics_recorded', metrics);
  }

  /**
   * Track user activity
   */
  trackUserActivity(userSession: UserSession, activity: string, metadata?: any): void {
    try {
      const userId = userSession.userId;
      const userActivity = this.userActivity.get(userId) || {
        userId,
        messageCount: 0,
        commandCount: 0,
        lastActivity: new Date(),
        sessionDuration: 0
      };
      
      // Update activity
      if (activity === 'message') {
        userActivity.messageCount++;
        this.analytics.totalMessages++;
      } else if (activity === 'command') {
        userActivity.commandCount++;
        this.analytics.totalCommands++;
      }
      
      userActivity.lastActivity = new Date();
      userActivity.sessionDuration = Date.now() - userSession.lastActivity.getTime();
      
      this.userActivity.set(userId, userActivity);
      this.analytics.userActivity.set(userId, userActivity);
      this.analytics.activeUsers = this.userActivity.size;
      
      this.emit('user_activity_tracked', { userId, activity, metadata });
      
    } catch (error) {
      console.error('❌ User activity tracking error:', error);
    }
  }

  /**
   * Track command usage
   */
  trackCommandUsage(command: string): void {
    const count = this.analytics.commandUsage.get(command) || 0;
    this.analytics.commandUsage.set(command, count + 1);
    this.emit('command_usage_tracked', { command, count: count + 1 });
  }

  /**
   * Get analytics data
   */
  getAnalytics(): AnalyticsData {
    return { ...this.analytics };
  }

  /**
   * Get system metrics
   */
  getSystemMetrics(): SystemMetrics {
    return { ...this.systemMetrics };
  }

  /**
   * Get user activity
   */
  getUserActivity(userId: number): UserActivity | undefined {
    return this.userActivity.get(userId);
  }

  /**
   * Get all user activities
   */
  getAllUserActivities(): Map<number, UserActivity> {
    return new Map(this.userActivity);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics[] {
    return [...this.performanceMetrics];
  }

  /**
   * Get recent performance metrics
   */
  getRecentPerformanceMetrics(hours: number = 24): PerformanceMetrics[] {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.performanceMetrics.filter(metric => metric.timestamp > cutoffTime);
  }

  /**
   * Get monitoring dashboard data
   */
  getDashboardData(): any {
    const recentMetrics = this.getRecentPerformanceMetrics(1); // Last hour
    const avgMemoryUsage = recentMetrics.length > 0 
      ? recentMetrics.reduce((sum, metric) => sum + metric.memoryUsage.heapUsed, 0) / recentMetrics.length
      : 0;
    
    const topCommands = Array.from(this.analytics.commandUsage.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    return {
      system: {
        uptime: this.systemMetrics.uptime,
        memory: this.systemMetrics.memoryUsage,
        cpu: this.systemMetrics.cpuUsage,
        disk: this.systemMetrics.diskUsage,
        network: this.systemMetrics.networkStats
      },
      analytics: {
        totalMessages: this.analytics.totalMessages,
        totalCommands: this.analytics.totalCommands,
        activeUsers: this.analytics.activeUsers,
        topCommands,
        startTime: this.analytics.startTime
      },
      performance: {
        avgMemoryUsage,
        recentMetrics: recentMetrics.length,
        totalMetrics: this.performanceMetrics.length
      },
      users: {
        total: this.userActivity.size,
        activities: Array.from(this.userActivity.values())
      }
    };
  }

  /**
   * Generate monitoring report
   */
  generateReport(): string {
    const dashboard = this.getDashboardData();
    const uptimeHours = Math.floor(dashboard.system.uptime / 3600);
    const memoryMB = Math.round(dashboard.system.memory.heapUsed / 1024 / 1024);
    
    return `📊 **AuraOS Bot Monitoring Report**

**System Status:**
• Uptime: ${uptimeHours} hours
• Memory: ${memoryMB}MB
• Active Users: ${dashboard.analytics.activeUsers}
• Total Messages: ${dashboard.analytics.totalMessages}
• Total Commands: ${dashboard.analytics.totalCommands}

**Top Commands:**
${dashboard.analytics.topCommands.map(([cmd, count]) => `• ${cmd}: ${count}`).join('\n')}

**Performance:**
• Average Memory: ${Math.round(dashboard.performance.avgMemoryUsage / 1024 / 1024)}MB
• Recent Metrics: ${dashboard.performance.recentMetrics}
• Total Metrics: ${dashboard.performance.totalMetrics}

**User Activity:**
• Total Users: ${dashboard.users.total}
• Active Sessions: ${dashboard.users.activities.filter(a => a.sessionDuration > 0).length}

Generated: ${new Date().toLocaleString()}`;
  }

  /**
   * Export monitoring data
   */
  exportData(): any {
    return {
      analytics: this.analytics,
      systemMetrics: this.systemMetrics,
      userActivity: Object.fromEntries(this.userActivity),
      performanceMetrics: this.performanceMetrics,
      timestamp: new Date()
    };
  }

  /**
   * Clear monitoring data
   */
  clearData(): void {
    this.analytics = this.initializeAnalytics();
    this.userActivity.clear();
    this.performanceMetrics = [];
    this.emit('monitoring_data_cleared');
    console.log('🧹 Monitoring data cleared');
  }

  /**
   * Get monitoring status
   */
  getMonitoringStatus(): any {
    return {
      active: this.isMonitoring,
      analytics: {
        totalMessages: this.analytics.totalMessages,
        totalCommands: this.analytics.totalCommands,
        activeUsers: this.analytics.activeUsers
      },
      system: {
        uptime: this.systemMetrics.uptime,
        memory: this.systemMetrics.memoryUsage.heapUsed,
        cpu: this.systemMetrics.cpuUsage
      },
      performance: {
        metricsCount: this.performanceMetrics.length,
        userActivityCount: this.userActivity.size
      }
    };
  }

  /**
   * Check if monitoring is active
   */
  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }
}

/**
 * User activity interface
 */
interface UserActivity {
  userId: number;
  messageCount: number;
  commandCount: number;
  lastActivity: Date;
  sessionDuration: number;
}

/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
  timestamp: Date;
  memoryUsage: NodeJS.MemoryUsage;
  uptime: number;
  activeUsers: number;
  totalMessages: number;
  totalCommands: number;
}
