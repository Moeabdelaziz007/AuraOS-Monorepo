/**
 * MCP Server Integrations
 * Connects to external MCP servers for enhanced capabilities
 */

import { MCPTool } from './mcp-integration';

/**
 * MCP Server Configuration
 */
export interface MCPServerConfig {
  name: string;
  description: string;
  endpoint?: string;
  apiKey?: string;
  enabled: boolean;
  tools: MCPTool[];
  category: 'free' | 'paid' | 'self-hosted';
  provider: string;
}

/**
 * Available MCP Servers
 */
export const MCP_SERVERS: MCPServerConfig[] = [
  // viaSocket MCP - Free tier with templates
  {
    name: 'viaSocket',
    description: 'Free MCP server with web search and content generation templates',
    endpoint: 'https://api.viasocket.com/mcp',
    enabled: true,
    category: 'free',
    provider: 'viaSocket',
    tools: [
      {
        name: 'viasocket_web_search',
        description: 'Search the web using viaSocket templates',
        parameters: [
          { name: 'query', type: 'string', description: 'Search query', required: true },
          { name: 'max_results', type: 'number', description: 'Maximum results (default: 10)', required: false },
          { name: 'language', type: 'string', description: 'Language code (ar, en, etc)', required: false },
        ],
        category: 'web',
      },
      {
        name: 'viasocket_content_generation',
        description: 'Generate articles, posts, and ideas using AI',
        parameters: [
          { name: 'topic', type: 'string', description: 'Content topic', required: true },
          { name: 'type', type: 'string', description: 'article, post, idea, summary', required: true },
          { name: 'language', type: 'string', description: 'Output language (ar, en)', required: false },
          { name: 'tone', type: 'string', description: 'professional, casual, creative', required: false },
          { name: 'length', type: 'string', description: 'short, medium, long', required: false },
        ],
        category: 'ai',
      },
      {
        name: 'viasocket_scrape_website',
        description: 'Scrape website content and extract data',
        parameters: [
          { name: 'url', type: 'string', description: 'Website URL', required: true },
          { name: 'selector', type: 'string', description: 'CSS selector (optional)', required: false },
          { name: 'extract', type: 'string', description: 'What to extract (text, links, images)', required: false },
        ],
        category: 'web',
      },
    ],
  },

  // MCPKit - Open source MCP tools
  {
    name: 'MCPKit',
    description: 'Open source MCP tools directory',
    enabled: true,
    category: 'free',
    provider: 'MCPKit',
    tools: [
      {
        name: 'mcpkit_bing_search',
        description: 'Search using Bing API',
        parameters: [
          { name: 'query', type: 'string', description: 'Search query', required: true },
          { name: 'market', type: 'string', description: 'Market code (ar-SA, en-US)', required: false },
          { name: 'count', type: 'number', description: 'Number of results', required: false },
        ],
        category: 'web',
      },
      {
        name: 'mcpkit_google_search',
        description: 'Search using Google Custom Search API',
        parameters: [
          { name: 'query', type: 'string', description: 'Search query', required: true },
          { name: 'language', type: 'string', description: 'Language (ar, en)', required: false },
          { name: 'num', type: 'number', description: 'Number of results', required: false },
        ],
        category: 'web',
      },
      {
        name: 'mcpkit_content_writer',
        description: 'Generate articles and blog posts',
        parameters: [
          { name: 'title', type: 'string', description: 'Article title', required: true },
          { name: 'keywords', type: 'array', description: 'Keywords to include', required: false },
          { name: 'language', type: 'string', description: 'Output language', required: false },
          { name: 'style', type: 'string', description: 'Writing style', required: false },
        ],
        category: 'ai',
      },
      {
        name: 'mcpkit_serper_search',
        description: 'Search using Serper.dev API (Google results)',
        parameters: [
          { name: 'q', type: 'string', description: 'Search query', required: true },
          { name: 'gl', type: 'string', description: 'Country code', required: false },
          { name: 'hl', type: 'string', description: 'Language', required: false },
        ],
        category: 'web',
      },
    ],
  },

  // n8n Workflow Integration (Your Fork)
  {
    name: 'n8n',
    description: 'Workflow automation with AI integration (https://github.com/Moeabdelaziz007/n8n)',
    endpoint: 'http://localhost:5678/webhook',
    enabled: true,
    category: 'self-hosted',
    provider: 'n8n',
    tools: [
      {
        name: 'n8n_workflow',
        description: 'Execute n8n workflow (search → AI → generate)',
        parameters: [
          { name: 'workflow_id', type: 'string', description: 'Workflow ID', required: true },
          { name: 'input', type: 'object', description: 'Workflow input data', required: true },
        ],
        category: 'ai',
      },
      {
        name: 'n8n_search_and_summarize',
        description: 'Search web and generate summary',
        parameters: [
          { name: 'query', type: 'string', description: 'Search query', required: true },
          { name: 'summary_length', type: 'string', description: 'short, medium, long', required: false },
        ],
        category: 'ai',
      },
      {
        name: 'n8n_content_generation',
        description: 'Generate content using n8n workflow',
        parameters: [
          { name: 'topic', type: 'string', description: 'Content topic', required: true },
          { name: 'type', type: 'string', description: 'blog, social, email', required: true },
          { name: 'language', type: 'string', description: 'ar, en', required: false },
        ],
        category: 'ai',
      },
      {
        name: 'n8n_telegram_bot',
        description: 'Process Telegram messages with n8n',
        parameters: [
          { name: 'message', type: 'string', description: 'User message', required: true },
          { name: 'chat_id', type: 'string', description: 'Telegram chat ID', required: true },
        ],
        category: 'ai',
      },
    ],
  },

  // MCP Toolbox
  {
    name: 'MCP Toolbox',
    description: 'Unified interface for multiple MCP tools',
    enabled: true,
    category: 'free',
    provider: 'MCP Toolbox',
    tools: [
      {
        name: 'toolbox_multi_search',
        description: 'Search across multiple sources (Google, Bing, DuckDuckGo)',
        parameters: [
          { name: 'query', type: 'string', description: 'Search query', required: true },
          { name: 'sources', type: 'array', description: 'Search sources to use', required: false },
          { name: 'language', type: 'string', description: 'Language preference', required: false },
        ],
        category: 'web',
      },
      {
        name: 'toolbox_content_generator',
        description: 'Generate various types of content',
        parameters: [
          { name: 'type', type: 'string', description: 'blog, social, email, idea', required: true },
          { name: 'topic', type: 'string', description: 'Content topic', required: true },
          { name: 'language', type: 'string', description: 'ar, en, fr, es', required: false },
          { name: 'options', type: 'object', description: 'Additional options', required: false },
        ],
        category: 'ai',
      },
    ],
  },

  // Custom AuraOS Content Generator
  {
    name: 'AuraOS Content Generator',
    description: 'Built-in content generation using Gemini AI',
    endpoint: 'http://localhost:5001/api/generate',
    enabled: true,
    category: 'self-hosted',
    provider: 'AuraOS',
    tools: [
      {
        name: 'auraos_generate_blog',
        description: 'Generate blog post with AuraOS',
        parameters: [
          { name: 'topic', type: 'string', description: 'Blog topic', required: true },
          { name: 'language', type: 'string', description: 'ar, en, fr, es', required: false },
          { name: 'length', type: 'string', description: 'short, medium, long', required: false },
          { name: 'style', type: 'string', description: 'Writing style', required: false },
          { name: 'includeIntro', type: 'boolean', description: 'Include introduction', required: false },
          { name: 'includeConclusion', type: 'boolean', description: 'Include conclusion', required: false },
        ],
        category: 'ai',
      },
      {
        name: 'auraos_generate_social',
        description: 'Generate social media post',
        parameters: [
          { name: 'topic', type: 'string', description: 'Post topic', required: true },
          { name: 'platform', type: 'string', description: 'twitter, facebook, linkedin', required: false },
          { name: 'language', type: 'string', description: 'ar, en', required: false },
          { name: 'includeHashtags', type: 'boolean', description: 'Include hashtags', required: false },
          { name: 'includeEmojis', type: 'boolean', description: 'Include emojis', required: false },
        ],
        category: 'ai',
      },
      {
        name: 'auraos_generate_email',
        description: 'Generate email template',
        parameters: [
          { name: 'topic', type: 'string', description: 'Email topic', required: true },
          { name: 'purpose', type: 'string', description: 'Email purpose', required: false },
          { name: 'language', type: 'string', description: 'ar, en', required: false },
          { name: 'includeSubject', type: 'boolean', description: 'Include subject line', required: false },
          { name: 'includeCallToAction', type: 'boolean', description: 'Include CTA', required: false },
        ],
        category: 'ai',
      },
    ],
  },
];

/**
 * MCP Server Manager
 */
export class MCPServerManager {
  private servers: Map<string, MCPServerConfig> = new Map();
  private toolCache: Map<string, MCPTool> = new Map();

  constructor() {
    this.initializeServers();
  }

  /**
   * Initialize MCP servers
   */
  private initializeServers(): void {
    MCP_SERVERS.forEach(server => {
      this.servers.set(server.name, server);
      
      // Cache tools for quick lookup
      server.tools.forEach(tool => {
        this.toolCache.set(tool.name, tool);
      });
    });

    logger.info(`[MCP Servers] Initialized ${this.servers.size} servers with ${this.toolCache.size} tools`);
  }

  /**
   * Get all enabled servers
   */
  getEnabledServers(): MCPServerConfig[] {
    return Array.from(this.servers.values()).filter(s => s.enabled);
  }

  /**
   * Get all available tools from enabled servers
   */
  getAllTools(): MCPTool[] {
    const tools: MCPTool[] = [];
    
    this.getEnabledServers().forEach(server => {
      tools.push(...server.tools);
    });

    return tools;
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string): MCPTool[] {
    return this.getAllTools().filter(tool => tool.category === category);
  }

  /**
   * Search for tools
   */
  searchTools(query: string): MCPTool[] {
    const searchText = query.toLowerCase();
    
    return this.getAllTools().filter(tool => {
      return tool.name.toLowerCase().includes(searchText) ||
             tool.description.toLowerCase().includes(searchText);
    });
  }

  /**
   * Get tool by name
   */
  getTool(toolName: string): MCPTool | undefined {
    return this.toolCache.get(toolName);
  }

  /**
   * Get server for tool
   */
  getServerForTool(toolName: string): MCPServerConfig | undefined {
    for (const server of this.servers.values()) {
      if (server.tools.some(t => t.name === toolName)) {
        return server;
      }
    }
    return undefined;
  }

  /**
   * Enable/disable server
   */
  setServerEnabled(serverName: string, enabled: boolean): void {
    const server = this.servers.get(serverName);
    if (server) {
      server.enabled = enabled;
      logger.info(`[MCP Servers] ${serverName} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Get content generation tools
   */
  getContentGenerationTools(): MCPTool[] {
    return this.getAllTools().filter(tool => 
      tool.name.includes('content') || 
      tool.name.includes('generate') ||
      tool.name.includes('writer')
    );
  }

  /**
   * Get web search tools
   */
  getWebSearchTools(): MCPTool[] {
    return this.getAllTools().filter(tool => 
      tool.name.includes('search') || 
      tool.name.includes('scrape') ||
      tool.name.includes('web')
    );
  }

  /**
   * Get free tools only
   */
  getFreeTools(): MCPTool[] {
    const tools: MCPTool[] = [];
    
    Array.from(this.servers.values())
      .filter(s => s.category === 'free' && s.enabled)
      .forEach(server => {
        tools.push(...server.tools);
      });

    return tools;
  }

  /**
   * Get server statistics
   */
  getStats(): {
    totalServers: number;
    enabledServers: number;
    totalTools: number;
    toolsByCategory: Record<string, number>;
    freeTools: number;
  } {
    const stats = {
      totalServers: this.servers.size,
      enabledServers: this.getEnabledServers().length,
      totalTools: this.getAllTools().length,
      toolsByCategory: {} as Record<string, number>,
      freeTools: this.getFreeTools().length,
    };

    // Count tools by category
    this.getAllTools().forEach(tool => {
      stats.toolsByCategory[tool.category] = (stats.toolsByCategory[tool.category] || 0) + 1;
    });

    return stats;
  }

  /**
   * Recommend tools for task
   */
  recommendTools(taskDescription: string): {
    contentGeneration: MCPTool[];
    webSearch: MCPTool[];
    other: MCPTool[];
  } {
    const text = taskDescription.toLowerCase();
    const recommendation = {
      contentGeneration: [] as MCPTool[],
      webSearch: [] as MCPTool[],
      other: [] as MCPTool[],
    };

    // Check if task needs content generation
    if (text.match(/generate|create|write|article|post|content|مقال|محتوى|كتابة/)) {
      recommendation.contentGeneration = this.getContentGenerationTools();
    }

    // Check if task needs web search
    if (text.match(/search|find|lookup|بحث|ابحث|scrape|جمع/)) {
      recommendation.webSearch = this.getWebSearchTools();
    }

    // Get other relevant tools
    const keywords = taskDescription.split(' ');
    keywords.forEach(keyword => {
      const found = this.searchTools(keyword);
      found.forEach(tool => {
        if (!recommendation.contentGeneration.includes(tool) && 
            !recommendation.webSearch.includes(tool)) {
          recommendation.other.push(tool);
        }
      });
    });

    return recommendation;
  }
}

// Export singleton instance
export const mcpServerManager = new MCPServerManager();
