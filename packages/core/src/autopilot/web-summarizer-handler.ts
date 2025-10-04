/**
 * Web Summarizer Handler
 * Specialized handler for web content summarization using the orchestration agent
 */

import { orchestrationAgent } from './orchestration-agent';
import { learningLoopService } from '../learning/learning-loop.service';
import { aiService } from '../ai/services';

export interface WebSummarizerRequest {
  userId: string;
  sessionId: string;
  url: string;
  options?: {
    maxSummaryLength?: number;
    includeMetadata?: boolean;
    saveToNotes?: boolean;
    folder?: string;
    tags?: string[];
  };
}

export interface WebSummarizerResponse {
  success: boolean;
  result?: {
    title: string;
    summary: string;
    keyPoints: string[];
    metadata: {
      author?: string;
      publishedDate?: string;
      wordCount: number;
      readingTime: number;
      confidence: number;
    };
    noteId?: string;
    noteUrl?: string;
  };
  error?: string;
  executionTime: number;
  learningInsights: string[];
}

export class WebSummarizerHandler {
  private isInitialized: boolean = false;

  /**
   * Initialize the web summarizer handler
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await orchestrationAgent.initialize();
    this.isInitialized = true;
    
    logger.info('[Web Summarizer Handler] Initialized');
  }

  /**
   * Summarize web content using orchestration agent
   */
  async summarizeWebContent(request: WebSummarizerRequest): Promise<WebSummarizerResponse> {
    const startTime = Date.now();

    try {
      await this.initialize();

      logger.info(`[Web Summarizer] Processing URL: ${request.url}`);

      // Create user input for orchestration agent
      const userInput = `Summarize this web article: ${request.url}`;
      
      // Analyze intent with orchestration agent
      const decision = await orchestrationAgent.analyzeIntent(
        request.userId,
        request.sessionId,
        userInput,
        {
          url: request.url,
          options: request.options,
        }
      );

      // Execute the summarization workflow
      const executionResult = await orchestrationAgent.executeTask(
        request.userId,
        request.sessionId,
        decision,
        {
          url: request.url,
          maxSummaryLength: request.options?.maxSummaryLength || 1000,
          includeMetadata: request.options?.includeMetadata ?? true,
          saveToNotes: request.options?.saveToNotes ?? true,
          folder: request.options?.folder || 'Web Summaries',
          tags: request.options?.tags || ['web-summary', 'ai-generated'],
          userId: request.userId,
        }
      );

      const executionTime = Date.now() - startTime;

      if (!executionResult.success) {
        return {
          success: false,
          error: 'Failed to execute summarization workflow',
          executionTime,
          learningInsights: [],
        };
      }

      // Extract results from execution
      const result = this.extractSummarizationResult(executionResult.result);

      // Generate learning insights
      const learningInsights = await this.generateLearningInsights(
        request.userId,
        decision,
        executionResult,
        executionTime
      );

      // Track successful summarization
      await learningLoopService.trackActivity(
        'web_summarization',
        {
          url: request.url,
          success: true,
          executionTime,
          confidence: decision.confidence,
          summaryLength: result.summary.length,
        },
        { success: true }
      );

      return {
        success: true,
        result,
        executionTime,
        learningInsights,
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      logger.error('[Web Summarizer] Error:', error);

      // Track failed summarization
      await learningLoopService.trackActivity(
        'web_summarization',
        {
          url: request.url,
          success: false,
          executionTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { success: false }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
        learningInsights: [],
      };
    }
  }

  /**
   * Extract summarization result from execution output
   */
  private extractSummarizationResult(executionResult: any): WebSummarizerResponse['result'] {
    // This would extract the actual results from the execution
    // For now, return a mock result structure
    return {
      title: executionResult.title || 'Web Article Summary',
      summary: executionResult.summary || 'AI-generated summary of the web content',
      keyPoints: executionResult.keyPoints || [
        'Key point 1',
        'Key point 2',
        'Key point 3',
      ],
      metadata: {
        author: executionResult.author,
        publishedDate: executionResult.publishedDate,
        wordCount: executionResult.wordCount || 0,
        readingTime: executionResult.readingTime || 0,
        confidence: executionResult.confidence || 0.8,
      },
      noteId: executionResult.noteId,
      noteUrl: executionResult.noteUrl,
    };
  }

  /**
   * Generate learning insights from execution
   */
  private async generateLearningInsights(
    userId: string,
    decision: any,
    executionResult: any,
    executionTime: number
  ): Promise<string[]> {
    const insights: string[] = [];

    // Analyze execution performance
    if (executionTime < 5000) {
      insights.push('Fast summarization execution - system is performing well');
    } else if (executionTime > 15000) {
      insights.push('Slow summarization execution - consider optimizing workflow');
    }

    // Analyze confidence
    if (decision.confidence > 0.9) {
      insights.push('High confidence in web summarization approach');
    } else if (decision.confidence < 0.6) {
      insights.push('Low confidence - consider alternative summarization methods');
    }

    // Analyze tool usage
    const toolCount = decision.mcpTools?.length || 0;
    if (toolCount > 3) {
      insights.push('Using multiple tools - workflow could be simplified');
    } else if (toolCount === 1) {
      insights.push('Efficient single-tool approach');
    }

    // Analyze success rate
    if (executionResult.success) {
      insights.push('Successful web content summarization');
    }

    return insights;
  }

  /**
   * Get summarization statistics for a user
   */
  async getSummarizationStats(userId: string): Promise<{
    totalSummarizations: number;
    successRate: number;
    averageExecutionTime: number;
    mostSummarizedDomains: Array<{ domain: string; count: number }>;
    recentInsights: string[];
  }> {
    // This would query the learning loop for user-specific statistics
    const insights = await learningLoopService.getInsights(userId, 10);
    
    return {
      totalSummarizations: insights.length,
      successRate: insights.filter(i => i.type === 'web_summarization').length / insights.length || 0,
      averageExecutionTime: 0, // This would be calculated from actual data
      mostSummarizedDomains: [], // This would be calculated from actual data
      recentInsights: insights.slice(0, 5).map(i => i.description),
    };
  }

  /**
   * Batch summarize multiple URLs
   */
  async batchSummarize(
    userId: string,
    sessionId: string,
    urls: string[],
    options?: WebSummarizerRequest['options']
  ): Promise<Array<WebSummarizerResponse & { url: string }>> {
    const results: Array<WebSummarizerResponse & { url: string }> = [];

    logger.info(`[Web Summarizer] Batch processing ${urls.length} URLs`);

    // Process URLs in parallel with concurrency limit
    const concurrencyLimit = 3;
    const chunks = this.chunkArray(urls, concurrencyLimit);

    for (const chunk of chunks) {
      const promises = chunk.map(async (url) => {
        const result = await this.summarizeWebContent({
          userId,
          sessionId,
          url,
          options,
        });
        
        return {
          ...result,
          url,
        };
      });

      const chunkResults = await Promise.all(promises);
      results.push(...chunkResults);
    }

    return results;
  }

  /**
   * Get suggested URLs for summarization based on user patterns
   */
  async getSuggestedUrls(userId: string): Promise<string[]> {
    // This would analyze user's browsing patterns and suggest URLs
    // For now, return some example URLs
    return [
      'https://example.com/article1',
      'https://example.com/article2',
      'https://example.com/article3',
    ];
  }

  /**
   * Split array into chunks
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Export singleton instance
export const webSummarizerHandler = new WebSummarizerHandler();
