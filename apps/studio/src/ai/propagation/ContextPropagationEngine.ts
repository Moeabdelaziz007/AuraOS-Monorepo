/**
 * Context Propagation Engine (CPE)
 * 
 * The "brain" of AuraOS Studio that tracks user interactions
 * and provides precise, contextual information to AI assistants.
 * 
 * Features:
 * - Real-time context tracking
 * - User intent detection
 * - Contextual data aggregation
 * - AI context feeding
 */

export interface UserContext {
  activeElement: string;
  context: string;
  content: string;
  cursorPosition?: { line: number; column: number };
  selectedText?: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

export interface ContextAnalysis {
  intent: 'coding' | 'note-taking' | 'debugging' | 'learning' | 'unknown';
  confidence: number;
  suggestions: string[];
  relatedElements: string[];
  contextScore: number;
}

export interface ContextEvent {
  type: 'focus' | 'input' | 'selection' | 'navigation' | 'error';
  element: string;
  data: any;
  timestamp: number;
}

class ContextPropagationEngine {
  private currentContext: UserContext | null = null;
  private contextHistory: UserContext[] = [];
  private eventListeners: Map<string, Function[]> = new Map();
  private analysisCache: Map<string, ContextAnalysis> = new Map();
  private sessionId: string;
  private userId?: string;

  constructor(sessionId: string, userId?: string) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.initializeEventTracking();
  }

  /**
   * Initialize event tracking for user interactions
   */
  private initializeEventTracking(): void {
    // Track focus events
    document.addEventListener('focusin', (event) => {
      this.handleContextEvent({
        type: 'focus',
        element: (event.target as HTMLElement)?.id || 'unknown',
        data: { focused: true },
        timestamp: Date.now()
      });
    });

    // Track input events
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.contentEditable === 'true') {
        this.handleContextEvent({
          type: 'input',
          element: target.id || 'unknown',
          data: { 
            value: (target as HTMLInputElement).value || target.textContent,
            length: (target as HTMLInputElement).value?.length || target.textContent?.length || 0
          },
          timestamp: Date.now()
        });
      }
    });

    // Track selection events
    document.addEventListener('selectionchange', () => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        this.handleContextEvent({
          type: 'selection',
          element: 'text-selection',
          data: { 
            selectedText: selection.toString(),
            range: selection.getRangeAt(0)
          },
          timestamp: Date.now()
        });
      }
    });
  }

  /**
   * Handle context events and update current context
   */
  private handleContextEvent(event: ContextEvent): void {
    const newContext: UserContext = {
      activeElement: event.element,
      context: this.determineContext(event),
      content: this.extractContent(event),
      cursorPosition: this.getCursorPosition(event),
      selectedText: event.data?.selectedText,
      timestamp: event.timestamp,
      sessionId: this.sessionId,
      userId: this.userId
    };

    this.updateContext(newContext);
    this.notifyListeners('context-updated', newContext);
  }

  /**
   * Determine the context type based on the event
   */
  private determineContext(event: ContextEvent): string {
    const element = event.element.toLowerCase();
    
    if (element.includes('code') || element.includes('editor')) {
      return 'code_editor';
    }
    if (element.includes('note') || element.includes('text')) {
      return 'note_editor';
    }
    if (element.includes('terminal') || element.includes('console')) {
      return 'terminal';
    }
    if (element.includes('debug') || element.includes('error')) {
      return 'debugger';
    }
    
    return 'unknown';
  }

  /**
   * Extract content from the event
   */
  private extractContent(event: ContextEvent): string {
    if (event.type === 'input' && event.data?.value) {
      return event.data.value;
    }
    if (event.type === 'selection' && event.data?.selectedText) {
      return event.data.selectedText;
    }
    return '';
  }

  /**
   * Get cursor position if available
   */
  private getCursorPosition(event: ContextEvent): { line: number; column: number } | undefined {
    // This would be implemented based on the specific editor being used
    // For now, return a mock position
    return { line: 1, column: 1 };
  }

  /**
   * Update the current context
   */
  private updateContext(newContext: UserContext): void {
    this.currentContext = newContext;
    this.contextHistory.push(newContext);
    
    // Keep only last 100 contexts to prevent memory issues
    if (this.contextHistory.length > 100) {
      this.contextHistory = this.contextHistory.slice(-100);
    }
  }

  /**
   * Analyze the current context and provide insights
   */
  public async analyzeContext(): Promise<ContextAnalysis> {
    if (!this.currentContext) {
      return {
        intent: 'unknown',
        confidence: 0,
        suggestions: [],
        relatedElements: [],
        contextScore: 0
      };
    }

    // Check cache first
    const cacheKey = `${this.currentContext.activeElement}-${this.currentContext.context}`;
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }

    const analysis = await this.performContextAnalysis(this.currentContext);
    this.analysisCache.set(cacheKey, analysis);
    
    return analysis;
  }

  /**
   * Perform detailed context analysis
   */
  private async performContextAnalysis(context: UserContext): Promise<ContextAnalysis> {
    const analysis: ContextAnalysis = {
      intent: 'unknown',
      confidence: 0,
      suggestions: [],
      relatedElements: [],
      contextScore: 0
    };

    // Analyze content for intent
    if (context.content) {
      if (this.isCodeContent(context.content)) {
        analysis.intent = 'coding';
        analysis.confidence = 0.9;
        analysis.suggestions.push('شرح الكود', 'تحسين الأداء', 'إصلاح الأخطاء');
      } else if (this.isNoteContent(context.content)) {
        analysis.intent = 'note-taking';
        analysis.confidence = 0.8;
        analysis.suggestions.push('تلخيص الملاحظات', 'تنظيم المحتوى', 'إضافة العناوين');
      } else if (this.isErrorContent(context.content)) {
        analysis.intent = 'debugging';
        analysis.confidence = 0.95;
        analysis.suggestions.push('تحليل الخطأ', 'إصلاح المشكلة', 'شرح الحل');
      }
    }

    // Calculate context score
    analysis.contextScore = this.calculateContextScore(context);
    
    // Find related elements
    analysis.relatedElements = this.findRelatedElements(context);

    return analysis;
  }

  /**
   * Check if content is code
   */
  private isCodeContent(content: string): boolean {
    const codePatterns = [
      /function\s+\w+/,
      /class\s+\w+/,
      /import\s+.*from/,
      /console\.log/,
      /def\s+\w+/,
      /if\s*\(/,
      /for\s*\(/,
      /while\s*\(/
    ];
    
    return codePatterns.some(pattern => pattern.test(content));
  }

  /**
   * Check if content is notes
   */
  private isNoteContent(content: string): boolean {
    const notePatterns = [
      /^#\s+/,  // Headers
      /^\*\s+/, // Bullet points
      /^\d+\.\s+/, // Numbered lists
      /TODO:/,
      /NOTE:/
    ];
    
    return notePatterns.some(pattern => pattern.test(content));
  }

  /**
   * Check if content contains errors
   */
  private isErrorContent(content: string): boolean {
    const errorPatterns = [
      /error/i,
      /exception/i,
      /failed/i,
      /undefined/i,
      /null/i,
      /TypeError/,
      /ReferenceError/
    ];
    
    return errorPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Calculate context score based on various factors
   */
  private calculateContextScore(context: UserContext): number {
    let score = 0;
    
    // Content length factor
    if (context.content.length > 50) score += 0.3;
    if (context.content.length > 200) score += 0.2;
    
    // Context type factor
    if (context.context !== 'unknown') score += 0.3;
    
    // Selection factor
    if (context.selectedText) score += 0.2;
    
    return Math.min(score, 1);
  }

  /**
   * Find related elements based on context
   */
  private findRelatedElements(context: UserContext): string[] {
    const related: string[] = [];
    
    if (context.context === 'code_editor') {
      related.push('terminal', 'debugger', 'ai-assistant');
    } else if (context.context === 'note_editor') {
      related.push('ai-assistant', 'search');
    } else if (context.context === 'terminal') {
      related.push('code_editor', 'debugger');
    }
    
    return related;
  }

  /**
   * Get current context
   */
  public getCurrentContext(): UserContext | null {
    return this.currentContext;
  }

  /**
   * Get context history
   */
  public getContextHistory(): UserContext[] {
    return [...this.contextHistory];
  }

  /**
   * Add event listener
   */
  public addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Notify listeners of an event
   */
  private notifyListeners(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * Clear context cache
   */
  public clearCache(): void {
    this.analysisCache.clear();
  }

  /**
   * Get context statistics
   */
  public getContextStats(): {
    totalContexts: number;
    averageContextScore: number;
    mostActiveElement: string;
    contextTypes: Record<string, number>;
  } {
    const totalContexts = this.contextHistory.length;
    const averageScore = this.contextHistory.reduce((sum, ctx) => sum + (ctx.content.length / 100), 0) / totalContexts;
    
    const elementCounts: Record<string, number> = {};
    this.contextHistory.forEach(ctx => {
      elementCounts[ctx.activeElement] = (elementCounts[ctx.activeElement] || 0) + 1;
    });
    
    const mostActiveElement = Object.entries(elementCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown';
    
    const contextTypes: Record<string, number> = {};
    this.contextHistory.forEach(ctx => {
      contextTypes[ctx.context] = (contextTypes[ctx.context] || 0) + 1;
    });
    
    return {
      totalContexts,
      averageContextScore: averageScore,
      mostActiveElement,
      contextTypes
    };
  }
}

export default ContextPropagationEngine;
