/**
 * Research Command for Telegram Bot
 * Handles /research command with web search and multi-source summarization
 */

import { Bot } from 'node-telegram-bot-api';
import { WebSearchService } from '../utils/webSearch.js';
import type { SearchResult } from '../utils/webSearch.js';
import { WebScraper } from '../utils/webScraper.js';
import type { WebContent } from '../utils/webScraper.js';
import { AISummarizer } from '../utils/aiSummarizer.js';
import type { SummaryResult } from '../utils/aiSummarizer.js';
import { NotesIntegrationService } from '../utils/notesIntegration.js';
import type { ResearchSource, ResearchOverview } from '../utils/notesIntegration.js';
import { logger } from '../utils/logger.js';

export class ResearchCommand {
  private bot: Bot;
  private webSearchService: WebSearchService;
  private webScraper: WebScraper;
  private aiSummarizer: AISummarizer;
  private notesIntegration: NotesIntegrationService;

  constructor(bot: Bot) {
    this.bot = bot;
    this.webSearchService = new WebSearchService();
    this.webScraper = new WebScraper();
    this.aiSummarizer = new AISummarizer();
    this.notesIntegration = new NotesIntegrationService();
    this.setupCommandHandlers();
  }

  /**
   * Setup command handlers
   */
  private setupCommandHandlers(): void {
    // Handle /research command
    this.bot.onText(/\/research (.+)/, async (msg: any, match: any) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id.toString() || 'unknown';
      const query = match?.[1];

      if (!query) {
        await this.bot.sendMessage(chatId, '❌ Please provide a research query.\nUsage: /research <query>');
        return;
      }

      await this.handleResearchCommand(chatId, userId, query);
    });

    // Handle /research without query
    this.bot.onText(/\/research$/, async (msg: any) => {
      const chatId = msg.chat.id;
      await this.bot.sendMessage(chatId, '❌ Please provide a research query.\nUsage: /research <query>');
    });

    // Handle /research_help command
    this.bot.onText(/\/research_help/, async (msg: any) => {
      const chatId = msg.chat.id;
      await this.sendHelpMessage(chatId);
    });

    // Handle /research_stats command
    this.bot.onText(/\/research_stats/, async (msg: any) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id.toString() || 'unknown';
      await this.sendResearchStats(chatId, userId);
    });
  }

  /**
   * Handle research command
   */
  private async handleResearchCommand(chatId: number, userId: string, query: string): Promise<void> {
    try {
      // Send initial message
      const processingMsg = await this.bot.sendMessage(
        chatId,
        `🔍 **Researching:** ${query}\n\n⏳ Searching for sources...`,
        { parse_mode: 'HTML' }
      );

      // Step 1: Search for sources
      const searchResponse = await this.webSearchService.searchQuery(query, 5);
      
      if (!searchResponse.success || searchResponse.results.length === 0) {
        await this.bot.editMessageText(
          `❌ **Research Failed**\n\nNo sources found for: ${query}\n\nTry a different search term.`,
          { 
            chat_id: chatId, 
            message_id: processingMsg.message_id,
            parse_mode: 'HTML'
          }
        );
        return;
      }

      // Update progress
      await this.bot.editMessageText(
        `🔍 **Researching:** ${query}\n\n✅ Found ${searchResponse.results.length} sources\n⏳ Processing sources...`,
        { 
          chat_id: chatId, 
          message_id: processingMsg.message_id,
          parse_mode: 'HTML'
        }
      );

      // Step 2: Process each source
      const researchSources: ResearchSource[] = [];
      const totalSources = searchResponse.results.length;

      for (let i = 0; i < totalSources; i++) {
        const searchResult = searchResponse.results[i];
        
        if (!searchResult) {
          continue;
        }
        
        try {
          // Update progress
          await this.bot.editMessageText(
            `🔍 **Researching:** ${query}\n\n✅ Found ${totalSources} sources\n⏳ Processing source ${i + 1}/${totalSources}: ${searchResult.title.substring(0, 50)}...`,
            { 
              chat_id: chatId, 
              message_id: processingMsg.message_id,
              parse_mode: 'HTML'
            }
          );

          // Scrape and summarize the source
          const webContent = await this.webScraper.scrapeUrl(searchResult.url);
          const summaryResult = await this.aiSummarizer.summarizeContent(webContent);

          const researchSource: ResearchSource = {
            title: summaryResult.title,
            url: searchResult.url,
            summary: summaryResult.summary,
            keyPoints: summaryResult.keyPoints,
            metadata: {
              ...summaryResult.metadata,
              domain: searchResult.domain
            }
          };

          researchSources.push(researchSource);

        } catch (error) {
          logger.error(`[ResearchCommand] Failed to process source ${searchResult.url}:`, error);
          // Continue with other sources
        }
      }

      if (researchSources.length === 0) {
        await this.bot.editMessageText(
          `❌ **Research Failed**\n\nCould not process any sources for: ${query}\n\nTry a different search term.`,
          { 
            chat_id: chatId, 
            message_id: processingMsg.message_id,
            parse_mode: 'HTML'
          }
        );
        return;
      }

      // Step 3: Create research overview
      const researchOverview = this.createResearchOverview(query, researchSources);

      // Step 4: Save to notes
      await this.bot.editMessageText(
        `🔍 **Researching:** ${query}\n\n✅ Processed ${researchSources.length} sources\n💾 Saving to notes...`,
        { 
          chat_id: chatId, 
          message_id: processingMsg.message_id,
          parse_mode: 'HTML'
        }
      );

      const saveResult = await this.notesIntegration.saveResearchResults(userId, researchOverview);

      // Step 5: Send results
      await this.bot.deleteMessage(chatId, processingMsg.message_id);
      await this.sendResearchResults(chatId, researchOverview, saveResult);

    } catch (error) {
      logger.error('[ResearchCommand] Error:', error);
      await this.bot.sendMessage(
        chatId,
        '❌ An error occurred during research. Please try again later.',
        { parse_mode: 'HTML' }
      );
    }
  }

  /**
   * Create research overview from sources
   */
  private createResearchOverview(query: string, sources: ResearchSource[]): ResearchOverview {
    // Combine all summaries
    const allSummaries = sources.map(s => s.summary).join('\n\n');
    
    // Extract key findings from all key points
    const allKeyPoints = sources.flatMap(s => s.keyPoints);
    const uniqueKeyFindings = [...new Set(allKeyPoints)].slice(0, 10);

    // Create overview summary
    const overviewSummary = this.generateOverviewSummary(query, sources, allSummaries);

    return {
      query,
      totalSources: sources.length,
      overviewSummary,
      keyFindings: uniqueKeyFindings,
      sources,
      createdAt: new Date()
    };
  }

  /**
   * Generate overview summary
   */
  private generateOverviewSummary(query: string, sources: ResearchSource[], allSummaries: string): string {
    const domains = [...new Set(sources.map(s => s.metadata.domain))];
    const avgConfidence = sources.reduce((sum, s) => sum + s.metadata.confidence, 0) / sources.length;
    
    let summary = `Research on "${query}" based on ${sources.length} sources from ${domains.length} different domains.\n\n`;
    
    summary += `**Key Insights:**\n`;
    summary += `• Average confidence: ${Math.round(avgConfidence * 100)}%\n`;
    summary += `• Sources from: ${domains.join(', ')}\n`;
    summary += `• Total word count: ${sources.reduce((sum, s) => sum + s.metadata.wordCount, 0)} words\n\n`;
    
    summary += `**Summary:**\n${allSummaries.substring(0, 800)}${allSummaries.length > 800 ? '...' : ''}`;
    
    return summary;
  }

  /**
   * Send research results
   */
  private async sendResearchResults(
    chatId: number,
    overview: ResearchOverview,
    saveResult: { success: boolean; individualNoteIds: string[]; overviewNoteId: string; noteUrls: { individual: string[]; overview: string } }
  ): Promise<void> {
    let message = `✅ **Research Complete!**\n\n`;
    message += `🔍 **Query:** ${overview.query}\n`;
    message += `📊 **Sources:** ${overview.totalSources}\n`;
    message += `📝 **Created:** ${saveResult.individualNoteIds.length + 1} notes\n\n`;

    message += `📋 **Overview Summary:**\n${overview.overviewSummary.substring(0, 500)}${overview.overviewSummary.length > 500 ? '...' : ''}\n\n`;

    if (overview.keyFindings.length > 0) {
      message += `🎯 **Key Findings:**\n`;
      overview.keyFindings.slice(0, 5).forEach((finding, index) => {
        message += `${index + 1}. ${finding}\n`;
      });
      message += `\n`;
    }

    message += `📚 **Sources:**\n`;
    overview.sources.forEach((source, index) => {
      message += `${index + 1}. [${source.title}](${source.url})\n`;
      message += `   📊 Confidence: ${Math.round(source.metadata.confidence * 100)}%\n`;
    });

    if (saveResult.success) {
      message += `\n💾 **Saved to Notes:**\n`;
      message += `• ${saveResult.individualNoteIds.length} individual source notes\n`;
      message += `• 1 research overview note\n`;
      if (saveResult.noteUrls.overview) {
        message += `• [View Overview Note](${saveResult.noteUrls.overview})\n`;
      }
    }

    await this.bot.sendMessage(chatId, message, { 
      parse_mode: 'HTML',
      disable_web_page_preview: true 
    });
  }

  /**
   * Send help message
   */
  private async sendHelpMessage(chatId: number): Promise<void> {
    const message = `🤖 **Research Command Help**\n\n` +
      `📖 **Commands:**\n` +
      `• \`/research <query>\` - Research a topic and create notes\n` +
      `• \`/research_help\` - Show this help message\n` +
      `• \`/research_stats\` - Show your research statistics\n\n` +
      `🌐 **Features:**\n` +
      `• Web search using DuckDuckGo\n` +
      `• AI-powered summarization\n` +
      `• Automatic note creation\n` +
      `• Individual + overview notes\n` +
      `• Research statistics tracking\n\n` +
      `📝 **Example:**\n` +
      `\`/research artificial intelligence trends 2024\`\n\n` +
      `✨ **What happens:**\n` +
      `1. Searches for relevant sources\n` +
      `2. Summarizes each source\n` +
      `3. Creates individual notes\n` +
      `4. Creates research overview\n` +
      `5. Shows results with links`;

    await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
  }

  /**
   * Send research statistics
   */
  private async sendResearchStats(chatId: number, userId: string): Promise<void> {
    try {
      const stats = await this.notesIntegration.getResearchStats(userId);
      
      let message = `📊 **Your Research Statistics**\n\n`;
      message += `🔍 **Total Research Sessions:** ${stats.totalResearchSessions}\n`;
      message += `📄 **Total Sources:** ${stats.totalSources}\n`;
      message += `📈 **Avg Sources/Session:** ${stats.averageSourcesPerSession}\n\n`;

      if (stats.mostResearchedTopics.length > 0) {
        message += `🎯 **Most Researched Topics:**\n`;
        stats.mostResearchedTopics.forEach((topic, index) => {
          message += `${index + 1}. ${topic}\n`;
        });
        message += `\n`;
      }

      if (stats.recentResearch.length > 0) {
        message += `📚 **Recent Research:**\n`;
        stats.recentResearch.forEach((research, index) => {
          message += `${index + 1}. ${research}\n`;
        });
      }

      await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });

    } catch (error) {
      logger.error('[ResearchCommand] Error getting stats:', error);
      await this.bot.sendMessage(chatId, '❌ Could not retrieve research statistics at this time.');
    }
  }
}
