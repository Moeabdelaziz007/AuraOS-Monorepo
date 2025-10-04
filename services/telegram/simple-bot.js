/**
 * Simple Telegram Bot with Research Functionality
 * This is a simplified version for testing the research features
 */

const TelegramBot = require('node-telegram-bot-api');

// Mock logger
const logger = {
  info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
  error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args)
};

// Mock WebSearchService
class WebSearchService {
  async searchQuery(query, maxResults = 5) {
    logger.info(`Searching for: ${query}`);
    
    // Mock search results
    const mockResults = [
      {
        title: "AI Trends 2024: The Future of Artificial Intelligence",
        url: "https://example.com/ai-trends-2024",
        snippet: "Discover the latest trends in artificial intelligence for 2024...",
        domain: "example.com",
        relevanceScore: 0.9
      },
      {
        title: "Machine Learning Advances in 2024",
        url: "https://techcrunch.com/ml-advances-2024",
        snippet: "New breakthroughs in machine learning are reshaping industries...",
        domain: "techcrunch.com",
        relevanceScore: 0.8
      },
      {
        title: "The Impact of AI on Business in 2024",
        url: "https://forbes.com/ai-business-impact-2024",
        snippet: "How artificial intelligence is transforming business operations...",
        domain: "forbes.com",
        relevanceScore: 0.7
      }
    ];
    
    return {
      success: true,
      results: mockResults.slice(0, maxResults),
      totalResults: mockResults.length,
      query,
      executionTime: 150
    };
  }
}

// Mock WebScraper
class WebScraper {
  async scrapeUrl(url) {
    logger.info(`Scraping URL: ${url}`);
    
    return {
      title: "Sample Article Title",
      content: "This is a sample article content that would be scraped from the web. It contains information about the topic and provides valuable insights for research purposes.",
      author: "Sample Author",
      publishedDate: "2024-01-15",
      url,
      wordCount: 150,
      readingTime: 1,
      metadata: {
        description: "Sample article description",
        keywords: ["AI", "technology", "2024"],
        language: "en",
        siteName: "Sample Site"
      }
    };
  }
}

// Mock AISummarizer
class AISummarizer {
  async summarizeContent(content) {
    logger.info(`Summarizing content: ${content.title}`);
    
    return {
      title: content.title,
      summary: "This is a concise summary of the article content, highlighting the key points and main insights.",
      keyPoints: [
        "Key point 1: Important insight about the topic",
        "Key point 2: Another significant finding",
        "Key point 3: Additional relevant information"
      ],
      metadata: {
        author: content.author,
        publishedDate: content.publishedDate,
        wordCount: content.wordCount,
        readingTime: content.readingTime,
        confidence: 0.85,
        originalUrl: content.url
      }
    };
  }
}

// Mock NotesIntegrationService
class NotesIntegrationService {
  async saveResearchResults(userId, researchOverview) {
    logger.info(`Saving research results for user: ${userId}`);
    
    // Mock saving to notes
    const individualNoteIds = researchOverview.sources.map((_, index) => `note-${index + 1}`);
    const overviewNoteId = 'overview-note-1';
    
    return {
      success: true,
      individualNoteIds,
      overviewNoteId,
      noteUrls: {
        individual: individualNoteIds.map(id => `/notes/${id}`),
        overview: `/notes/${overviewNoteId}`
      }
    };
  }
}

// Research Command Handler
class ResearchCommand {
  constructor(bot) {
    this.bot = bot;
    this.webSearchService = new WebSearchService();
    this.webScraper = new WebScraper();
    this.aiSummarizer = new AISummarizer();
    this.notesIntegration = new NotesIntegrationService();
    this.setupCommandHandlers();
  }

  setupCommandHandlers() {
    // Handle /research command
    this.bot.onText(/\/research (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id.toString() || 'unknown';
      const query = match[1];

      if (!query) {
        await this.bot.sendMessage(chatId, '❌ Please provide a research query.\nUsage: /research <query>');
        return;
      }

      await this.handleResearchCommand(chatId, userId, query);
    });

    // Handle /research without query
    this.bot.onText(/\/research$/, async (msg) => {
      const chatId = msg.chat.id;
      await this.bot.sendMessage(chatId, '❌ Please provide a research query.\nUsage: /research <query>');
    });

    // Handle /research_help command
    this.bot.onText(/\/research_help/, async (msg) => {
      const chatId = msg.chat.id;
      await this.sendHelpMessage(chatId);
    });
  }

  async handleResearchCommand(chatId, userId, query) {
    try {
      // Send initial message
      const processingMsg = await this.bot.sendMessage(
        chatId,
        `🔍 **Researching:** ${query}\n\n⏳ Searching for sources...`,
        { parse_mode: 'HTML' }
      );

      // Step 1: Search for sources
      const searchResponse = await this.webSearchService.searchQuery(query, 3);
      
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
      const researchSources = [];
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

          const researchSource = {
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
          logger.error(`Failed to process source ${searchResult.url}:`, error);
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
      logger.error('Error:', error);
      await this.bot.sendMessage(
        chatId,
        '❌ An error occurred during research. Please try again later.',
        { parse_mode: 'HTML' }
      );
    }
  }

  createResearchOverview(query, sources) {
    // Combine all summaries
    const allSummaries = sources.map(s => s.summary).join('\n\n');
    
    // Extract key findings from all key points
    const allKeyPoints = sources.flatMap(s => s.keyPoints);
    const uniqueKeyFindings = [...new Set(allKeyPoints)].slice(0, 10);

    // Create overview summary
    const overviewSummary = `Research on "${query}" based on ${sources.length} sources from ${[...new Set(sources.map(s => s.metadata.domain))].length} different domains.\n\nKey Insights:\n• Average confidence: ${Math.round(sources.reduce((sum, s) => sum + s.metadata.confidence, 0) / sources.length * 100)}%\n• Sources from: ${[...new Set(sources.map(s => s.metadata.domain))].join(', ')}\n• Total word count: ${sources.reduce((sum, s) => sum + s.metadata.wordCount, 0)} words\n\nSummary:\n${allSummaries.substring(0, 800)}${allSummaries.length > 800 ? '...' : ''}`;
    
    return {
      query,
      totalSources: sources.length,
      overviewSummary,
      keyFindings: uniqueKeyFindings,
      sources,
      createdAt: new Date()
    };
  }

  async sendResearchResults(chatId, overview, saveResult) {
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

  async sendHelpMessage(chatId) {
    const message = `🤖 **Research Command Help**\n\n` +
      `📖 **Commands:**\n` +
      `• \`/research <query>\` - Research a topic and create notes\n` +
      `• \`/research_help\` - Show this help message\n\n` +
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
}

// Initialize bot
function initializeBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    logger.error('❌ TELEGRAM_BOT_TOKEN is not set in environment variables');
    process.exit(1);
  }

  const bot = new TelegramBot(token, { polling: true });
  
  // Initialize research command
  new ResearchCommand(bot);
  
  // Basic commands
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 
      '🤖 **AuraOS Telegram Bot**\n\n' +
      'Welcome! I can help you research topics and create notes.\n\n' +
      '**Available Commands:**\n' +
      '• `/research <query>` - Research a topic\n' +
      '• `/research_help` - Show research help\n' +
      '• `/start` - Show this message\n\n' +
      'Try: `/research artificial intelligence trends 2024`',
      { parse_mode: 'HTML' }
    );
  });

  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 
      '🤖 **AuraOS Telegram Bot Help**\n\n' +
      '**Research Commands:**\n' +
      '• `/research <query>` - Research a topic and create notes\n' +
      '• `/research_help` - Detailed research help\n\n' +
      '**Basic Commands:**\n' +
      '• `/start` - Welcome message\n' +
      '• `/help` - This help message\n\n' +
      '**Example:**\n' +
      '`/research machine learning trends 2024`',
      { parse_mode: 'HTML' }
    );
  });

  bot.on('polling_error', (error) => {
    logger.error('Polling error:', error);
  });

  logger.info('✅ AuraOS Telegram Bot is running!');
  logger.info('🎯 Listening for messages...');
  logger.info('🔍 Research functionality enabled');
  
  return bot;
}

// Start the bot
if (require.main === module) {
  initializeBot();
}

module.exports = { initializeBot, ResearchCommand };
