/**
 * Web Summarizer Command for Telegram Bot
 * Handles /summarize command with orchestration agent integration
 */

import { Bot } from 'node-telegram-bot-api';
import { logger } from '../utils/logger.js';

// Mock implementations for missing dependencies
const webSummarizerHandler = {
  async processUrl(request: any) {
    return {
      success: true,
      result: {
        title: 'Mock Title',
        summary: 'Mock summary content',
        keyPoints: ['Point 1', 'Point 2'],
        metadata: {
          author: 'Mock Author',
          publishedDate: new Date(),
          wordCount: 100
        }
      }
    };
  }
};

const learningLoopService = {
  async trackActivity(userId: string, activity: any) {
    logger.info(`[Learning] Tracked activity for user ${userId}`);
  }
};

export class WebSummarizerCommand {
  private bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
    this.setupCommandHandlers();
  }

  /**
   * Setup command handlers
   */
  private setupCommandHandlers(): void {
    // Handle /summarize command
    this.bot.onText(/\/summarize (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id.toString() || 'unknown';
      const url = match?.[1];

      if (!url) {
        await this.bot.sendMessage(chatId, '❌ Please provide a URL to summarize.\nUsage: /summarize <url>');
        return;
      }

      await this.handleSummarizeCommand(chatId, userId, url);
    });

    // Handle /summarize without URL
    this.bot.onText(/\/summarize$/, async (msg) => {
      const chatId = msg.chat.id;
      await this.bot.sendMessage(chatId, '❌ Please provide a URL to summarize.\nUsage: /summarize <url>');
    });

    // Handle /summarize_help command
    this.bot.onText(/\/summarize_help/, async (msg) => {
      const chatId = msg.chat.id;
      await this.sendHelpMessage(chatId);
    });
  }

  /**
   * Handle summarize command
   */
  private async handleSummarizeCommand(chatId: number, userId: string, url: string): Promise<void> {
    try {
      // Send initial message
      const processingMsg = await this.bot.sendMessage(
        chatId,
        '🔄 Analyzing web content...\nThis may take a few moments.',
        { parse_mode: 'HTML' }
      );

      // Initialize learning loop for user
      await learningLoopService.initialize(userId);

      // Perform summarization
      const result = await webSummarizerHandler.summarizeWebContent({
        userId,
        sessionId: `telegram-${Date.now()}`,
        url,
        options: {
          maxSummaryLength: 800, // Shorter for Telegram
          includeMetadata: true,
          saveToNotes: true,
          folder: 'Telegram Summaries',
          tags: ['telegram', 'web-summary', 'ai-generated'],
        },
      });

      // Delete processing message
      await this.bot.deleteMessage(chatId, processingMsg.message_id);

      if (result.success && result.result) {
        await this.sendSuccessMessage(chatId, result.result, result.learningInsights);
      } else {
        await this.sendErrorMessage(chatId, result.error || 'Summarization failed');
      }

    } catch (error) {
      logger.error('[Telegram Web Summarizer] Error:', error);
      await this.bot.sendMessage(
        chatId,
        '❌ An error occurred while summarizing the content. Please try again later.',
        { parse_mode: 'HTML' }
      );
    }
  }

  /**
   * Send success message with summary
   */
  private async sendSuccessMessage(
    chatId: number,
    result: {
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
    },
    learningInsights: string[]
  ): Promise<void> {
    let message = `✅ <b>Summary Complete!</b>\n\n`;
    message += `📰 <b>Title:</b> ${result.title}\n\n`;
    
    if (result.metadata.author) {
      message += `👤 <b>Author:</b> ${result.metadata.author}\n`;
    }
    if (result.metadata.publishedDate) {
      message += `📅 <b>Published:</b> ${result.metadata.publishedDate}\n`;
    }
    message += `📊 <b>Word Count:</b> ${result.metadata.wordCount}\n`;
    message += `⏱️ <b>Reading Time:</b> ${result.metadata.readingTime} minutes\n`;
    message += `🎯 <b>Confidence:</b> ${Math.round(result.metadata.confidence * 100)}%\n\n`;

    message += `📝 <b>Summary:</b>\n${result.summary}\n\n`;

    if (result.keyPoints.length > 0) {
      message += `🔑 <b>Key Points:</b>\n`;
      result.keyPoints.forEach((point, index) => {
        message += `${index + 1}. ${point}\n`;
      });
      message += `\n`;
    }

    if (result.noteId) {
      message += `💾 <b>Saved to notes</b>`;
      if (result.noteUrl) {
        message += ` - <a href="${result.noteUrl}">View Note</a>`;
      }
    }

    // Send main message
    await this.bot.sendMessage(chatId, message, { 
      parse_mode: 'HTML',
      disable_web_page_preview: true 
    });

    // Send learning insights if available
    if (learningInsights.length > 0) {
      const insightsMessage = `🧠 <b>Learning Insights:</b>\n${learningInsights.join('\n')}`;
      await this.bot.sendMessage(chatId, insightsMessage, { parse_mode: 'HTML' });
    }
  }

  /**
   * Send error message
   */
  private async sendErrorMessage(chatId: number, error: string): Promise<void> {
    const message = `❌ <b>Summarization Failed</b>\n\n${error}\n\nPlease try again with a different URL.`;
    await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
  }

  /**
   * Send help message
   */
  private async sendHelpMessage(chatId: number): Promise<void> {
    const message = `🤖 <b>Web Summarizer Help</b>\n\n` +
      `📖 <b>Commands:</b>\n` +
      `• <code>/summarize &lt;url&gt;</code> - Summarize a web article\n` +
      `• <code>/summarize_help</code> - Show this help message\n\n` +
      `🌐 <b>Supported URLs:</b>\n` +
      `• News articles\n` +
      `• Blog posts\n` +
      `• Documentation\n` +
      `• Any readable web content\n\n` +
      `✨ <b>Features:</b>\n` +
      `• AI-powered summarization\n` +
      `• Key points extraction\n` +
      `• Metadata analysis\n` +
      `• Automatic note saving\n` +
      `• Learning insights\n\n` +
      `📝 <b>Example:</b>\n` +
      `<code>/summarize https://example.com/article</code>`;

    await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
  }

  /**
   * Get user summarization statistics
   */
  async getUserStats(userId: string): Promise<{
    totalSummarizations: number;
    successRate: number;
    averageExecutionTime: number;
    mostSummarizedDomains: Array<{ domain: string; count: number }>;
    recentInsights: string[];
  }> {
    return await webSummarizerHandler.getSummarizationStats(userId);
  }

  /**
   * Send user statistics
   */
  async sendUserStats(chatId: number, userId: string): Promise<void> {
    try {
      const stats = await this.getUserStats(userId);
      
      let message = `📊 <b>Your Summarization Statistics</b>\n\n`;
      message += `📈 <b>Total Summarizations:</b> ${stats.totalSummarizations}\n`;
      message += `✅ <b>Success Rate:</b> ${Math.round(stats.successRate * 100)}%\n`;
      message += `⏱️ <b>Average Time:</b> ${Math.round(stats.averageExecutionTime)}ms\n\n`;

      if (stats.mostSummarizedDomains.length > 0) {
        message += `🌐 <b>Most Summarized Domains:</b>\n`;
        stats.mostSummarizedDomains.forEach((domain, index) => {
          message += `${index + 1}. ${domain.domain} (${domain.count})\n`;
        });
        message += `\n`;
      }

      if (stats.recentInsights.length > 0) {
        message += `🧠 <b>Recent Insights:</b>\n`;
        stats.recentInsights.forEach((insight, index) => {
          message += `${index + 1}. ${insight}\n`;
        });
      }

      await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });

    } catch (error) {
      logger.error('[Telegram Web Summarizer] Error getting stats:', error);
      await this.bot.sendMessage(chatId, '❌ Could not retrieve statistics at this time.');
    }
  }
}
