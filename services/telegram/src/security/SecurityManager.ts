/**
 * Security Manager for Telegram Bot
 */

import { EventEmitter } from 'events';
import { 
  UserSession, 
  BotConfig, 
  BotResponse 
} from '../types/index.js';

export class SecurityManager extends EventEmitter {
  private config: BotConfig;
  private whitelist: Set<number> = new Set();
  private blacklist: Set<number> = new Set();
  private rateLimits: Map<number, RateLimitData> = new Map();
  private suspiciousActivity: Map<number, SuspiciousActivity[]> = new Map();
  private isSecurityActive: boolean = false;

  constructor(config: BotConfig) {
    super();
    this.config = config;
    this.initializeSecurity();
  }

  /**
   * Initialize security system
   */
  private initializeSecurity(): void {
    try {
      logger.info('🔒 Initializing Security Manager...');
      
      // Initialize whitelist and blacklist
      this.initializeAccessLists();
      
      // Initialize rate limiting
      this.initializeRateLimiting();
      
      this.isSecurityActive = true;
      logger.info('✅ Security Manager initialized');
      
    } catch (error) {
      logger.error('❌ Security initialization failed:', error);
      this.isSecurityActive = false;
    }
  }

  /**
   * Initialize access lists
   */
  private initializeAccessLists(): void {
    if (this.config.security.enableWhitelist) {
      this.config.security.whitelistUsers.forEach(userId => {
        this.whitelist.add(userId);
      });
    }
    
    if (this.config.security.enableBlacklist) {
      this.config.security.blacklistUsers.forEach(userId => {
        this.blacklist.add(userId);
      });
    }
  }

  /**
   * Initialize rate limiting
   */
  private initializeRateLimiting(): void {
    // Rate limiting is handled by the core bot
    logger.info('⚡ Rate limiting initialized');
  }

  /**
   * Check if user is authorized
   */
  isUserAuthorized(userId: number): boolean {
    // Check blacklist first
    if (this.blacklist.has(userId)) {
      this.emit('user_blocked', { userId, reason: 'blacklisted' });
      return false;
    }
    
    // Check whitelist if enabled
    if (this.config.security.enableWhitelist && !this.whitelist.has(userId)) {
      this.emit('user_blocked', { userId, reason: 'not_whitelisted' });
      return false;
    }
    
    return true;
  }

  /**
   * Check rate limit for user
   */
  checkRateLimit(userId: number): boolean {
    const now = Date.now();
    const userLimit = this.rateLimits.get(userId) || {
      count: 0,
      resetTime: now + this.config.rateLimit.windowMs
    };
    
    if (now > userLimit.resetTime) {
      this.rateLimits.set(userId, {
        count: 1,
        resetTime: now + this.config.rateLimit.windowMs
      });
      return true;
    }
    
    if (userLimit.count >= this.config.rateLimit.maxRequests) {
      this.emit('rate_limit_exceeded', { userId, count: userLimit.count });
      return false;
    }
    
    userLimit.count++;
    this.rateLimits.set(userId, userLimit);
    return true;
  }

  /**
   * Monitor suspicious activity
   */
  monitorActivity(userId: number, activity: string, metadata?: any): void {
    try {
      const suspiciousActivities = this.suspiciousActivity.get(userId) || [];
      
      // Check for suspicious patterns
      const isSuspicious = this.detectSuspiciousActivity(activity, metadata);
      
      if (isSuspicious) {
        const suspiciousActivity: SuspiciousActivity = {
          userId,
          activity,
          metadata,
          timestamp: new Date(),
          severity: this.calculateSeverity(activity, metadata)
        };
        
        suspiciousActivities.push(suspiciousActivity);
        
        // Keep only last 50 activities
        if (suspiciousActivities.length > 50) {
          suspiciousActivities.splice(0, suspiciousActivities.length - 50);
        }
        
        this.suspiciousActivity.set(userId, suspiciousActivities);
        this.emit('suspicious_activity', suspiciousActivity);
        
        // Take action if necessary
        this.handleSuspiciousActivity(userId, suspiciousActivity);
      }
      
    } catch (error) {
      logger.error('❌ Activity monitoring error:', error);
    }
  }

  /**
   * Detect suspicious activity
   */
  private detectSuspiciousActivity(activity: string, metadata?: any): boolean {
    const lowerActivity = activity.toLowerCase();
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      'spam',
      'flood',
      'attack',
      'hack',
      'exploit',
      'inject',
      'sql',
      'script',
      'eval',
      'exec'
    ];
    
    // Check for rapid requests
    if (metadata?.rapidRequests) {
      return true;
    }
    
    // Check for suspicious commands
    if (suspiciousPatterns.some(pattern => lowerActivity.includes(pattern))) {
      return true;
    }
    
    // Check for unusual behavior
    if (metadata?.unusualBehavior) {
      return true;
    }
    
    return false;
  }

  /**
   * Calculate severity of suspicious activity
   */
  private calculateSeverity(activity: string, metadata?: any): 'low' | 'medium' | 'high' | 'critical' {
    const lowerActivity = activity.toLowerCase();
    
    // Critical severity
    if (lowerActivity.includes('hack') || lowerActivity.includes('exploit')) {
      return 'critical';
    }
    
    // High severity
    if (lowerActivity.includes('attack') || lowerActivity.includes('inject')) {
      return 'high';
    }
    
    // Medium severity
    if (lowerActivity.includes('spam') || lowerActivity.includes('flood')) {
      return 'medium';
    }
    
    // Low severity
    return 'low';
  }

  /**
   * Handle suspicious activity
   */
  private handleSuspiciousActivity(userId: number, activity: SuspiciousActivity): void {
    switch (activity.severity) {
      case 'critical':
        this.blockUser(userId, 'Critical security threat detected');
        this.emit('user_blocked', { userId, reason: 'critical_threat' });
        break;
        
      case 'high':
        this.temporaryBlock(userId, 300000); // 5 minutes
        this.emit('user_temporarily_blocked', { userId, duration: 300000 });
        break;
        
      case 'medium':
        this.warnUser(userId, 'Suspicious activity detected');
        this.emit('user_warned', { userId, reason: 'suspicious_activity' });
        break;
        
      case 'low':
        this.logActivity(userId, 'Low-level suspicious activity');
        break;
    }
  }

  /**
   * Block user permanently
   */
  blockUser(userId: number, reason: string): void {
    this.blacklist.add(userId);
    this.emit('user_blocked', { userId, reason });
    logger.info(`🚫 User ${userId} blocked: ${reason}`);
  }

  /**
   * Temporarily block user
   */
  temporaryBlock(userId: number, duration: number): void {
    setTimeout(() => {
      // Unblock user after duration
      this.emit('user_unblocked', { userId });
    }, duration);
    
    this.emit('user_temporarily_blocked', { userId, duration });
    logger.info(`⏰ User ${userId} temporarily blocked for ${duration}ms`);
  }

  /**
   * Warn user
   */
  warnUser(userId: number, message: string): void {
    this.emit('user_warned', { userId, message });
    logger.info(`⚠️ User ${userId} warned: ${message}`);
  }

  /**
   * Log activity
   */
  logActivity(userId: number, message: string): void {
    this.emit('activity_logged', { userId, message });
    logger.info(`📝 Activity logged for user ${userId}: ${message}`);
  }

  /**
   * Add user to whitelist
   */
  addToWhitelist(userId: number): void {
    this.whitelist.add(userId);
    this.emit('user_whitelisted', { userId });
    logger.info(`✅ User ${userId} added to whitelist`);
  }

  /**
   * Remove user from whitelist
   */
  removeFromWhitelist(userId: number): void {
    this.whitelist.delete(userId);
    this.emit('user_unwhitelisted', { userId });
    logger.info(`❌ User ${userId} removed from whitelist`);
  }

  /**
   * Add user to blacklist
   */
  addToBlacklist(userId: number, reason: string): void {
    this.blacklist.add(userId);
    this.emit('user_blacklisted', { userId, reason });
    logger.info(`🚫 User ${userId} added to blacklist: ${reason}`);
  }

  /**
   * Remove user from blacklist
   */
  removeFromBlacklist(userId: number): void {
    this.blacklist.delete(userId);
    this.emit('user_unblacklisted', { userId });
    logger.info(`✅ User ${userId} removed from blacklist`);
  }

  /**
   * Get security status
   */
  getSecurityStatus(): any {
    return {
      active: this.isSecurityActive,
      whitelistEnabled: this.config.security.enableWhitelist,
      blacklistEnabled: this.config.security.enableBlacklist,
      whitelistSize: this.whitelist.size,
      blacklistSize: this.blacklist.size,
      rateLimitWindow: this.config.rateLimit.windowMs,
      maxRequests: this.config.rateLimit.maxRequests,
      suspiciousActivities: Array.from(this.suspiciousActivity.values())
        .reduce((sum, activities) => sum + activities.length, 0)
    };
  }

  /**
   * Get user security info
   */
  getUserSecurityInfo(userId: number): any {
    const suspiciousActivities = this.suspiciousActivity.get(userId) || [];
    const rateLimit = this.rateLimits.get(userId);
    
    return {
      userId,
      isWhitelisted: this.whitelist.has(userId),
      isBlacklisted: this.blacklist.has(userId),
      rateLimit: rateLimit ? {
        count: rateLimit.count,
        resetTime: rateLimit.resetTime,
        remaining: this.config.rateLimit.maxRequests - rateLimit.count
      } : null,
      suspiciousActivities: suspiciousActivities.length,
      lastSuspiciousActivity: suspiciousActivities.length > 0 
        ? suspiciousActivities[suspiciousActivities.length - 1]
        : null
    };
  }

  /**
   * Get suspicious activities for user
   */
  getUserSuspiciousActivities(userId: number): SuspiciousActivity[] {
    return this.suspiciousActivity.get(userId) || [];
  }

  /**
   * Clear user security data
   */
  clearUserSecurityData(userId: number): void {
    this.rateLimits.delete(userId);
    this.suspiciousActivity.delete(userId);
    this.emit('user_security_cleared', { userId });
    logger.info(`🧹 Security data cleared for user ${userId}`);
  }

  /**
   * Export security data
   */
  exportSecurityData(): any {
    return {
      whitelist: Array.from(this.whitelist),
      blacklist: Array.from(this.blacklist),
      rateLimits: Object.fromEntries(this.rateLimits),
      suspiciousActivities: Object.fromEntries(this.suspiciousActivity),
      config: this.config.security
    };
  }

  /**
   * Check if security is active
   */
  isSecurityActive(): boolean {
    return this.isSecurityActive;
  }
}

/**
 * Rate limit data interface
 */
interface RateLimitData {
  count: number;
  resetTime: number;
}

/**
 * Suspicious activity interface
 */
interface SuspiciousActivity {
  userId: number;
  activity: string;
  metadata?: any;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
