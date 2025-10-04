/**
 * Web MCP Server
 * Provides web content fetching and cleaning capabilities for AuraOS
 */

import { BaseMCPServer, Tool } from '@auraos/ai/src/mcp/server';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

interface WebContent {
  title: string;
  content: string;
  url: string;
  wordCount: number;
  readingTime: number;
  metadata?: {
    author?: string;
    publishedDate?: string;
    description?: string;
    imageUrl?: string;
  };
}

interface CleanedContent {
  title: string;
  text: string;
  url: string;
  wordCount: number;
  readingTime: number;
  metadata: {
    author?: string;
    publishedDate?: string;
    description?: string;
    imageUrl?: string;
  };
}

export class WebMCPServer extends BaseMCPServer {
  name = 'web';
  version = '1.0.0';
  description = 'Web content fetching and cleaning for AuraOS';

  private userAgent = 'AuraOS-WebBot/1.0 (+https://auraos.io/bot)';
  private timeout = 10000; // 10 seconds

  tools: Tool[] = [
    {
      name: 'fetchAndCleanContent',
      description: 'Fetch and clean web content from a URL',
      inputSchema: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'URL to fetch and clean content from',
          },
          includeMetadata: {
            type: 'boolean',
            description: 'Include metadata like author, published date, etc.',
            default: true,
          },
          maxContentLength: {
            type: 'number',
            description: 'Maximum content length in characters',
            default: 50000,
          },
        },
        required: ['url'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          url: { type: 'string' },
          wordCount: { type: 'number' },
          readingTime: { type: 'number' },
          metadata: {
            type: 'object',
            properties: {
              author: { type: 'string' },
              publishedDate: { type: 'string' },
              description: { type: 'string' },
              imageUrl: { type: 'string' },
            },
          },
        },
      },
    },
    {
      name: 'fetchMultipleUrls',
      description: 'Fetch and clean content from multiple URLs',
      inputSchema: {
        type: 'object',
        properties: {
          urls: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of URLs to fetch',
          },
          includeMetadata: {
            type: 'boolean',
            description: 'Include metadata for each URL',
            default: true,
          },
        },
        required: ['urls'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: { type: 'object' },
          },
          totalCount: { type: 'number' },
          successCount: { type: 'number' },
          errorCount: { type: 'number' },
        },
      },
    },
    {
      name: 'extractTextFromHtml',
      description: 'Extract clean text from raw HTML content',
      inputSchema: {
        type: 'object',
        properties: {
          html: {
            type: 'string',
            description: 'Raw HTML content to extract text from',
          },
          url: {
            type: 'string',
            description: 'Source URL for context',
          },
        },
        required: ['html'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          wordCount: { type: 'number' },
          readingTime: { type: 'number' },
        },
      },
    },
  ];

  protected async onInitialize(): Promise<void> {
    logger.info('[WebMCP] Web content server initialized');
  }

  protected async handleToolExecution(toolName: string, input: Record<string, any>): Promise<any> {
    switch (toolName) {
      case 'fetchAndCleanContent':
        return this.fetchAndCleanContent(
          input.url,
          input.includeMetadata ?? true,
          input.maxContentLength ?? 50000
        );
      case 'fetchMultipleUrls':
        return this.fetchMultipleUrls(input.urls, input.includeMetadata ?? true);
      case 'extractTextFromHtml':
        return this.extractTextFromHtml(input.html, input.url);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  /**
   * Fetch and clean content from a single URL
   */
  private async fetchAndCleanContent(
    url: string,
    includeMetadata: boolean = true,
    maxContentLength: number = 50000
  ): Promise<CleanedContent> {
    try {
      // Validate URL
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Only HTTP and HTTPS URLs are supported');
      }

      logger.info(`[WebMCP] Fetching content from: ${url}`);

      // Fetch the webpage
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        timeout: this.timeout,
        follow: 5, // Follow up to 5 redirects
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const finalUrl = response.url; // Get final URL after redirects

      // Extract and clean content
      const cleanedContent = await this.extractTextFromHtml(html, finalUrl);

      // Truncate content if too long
      if (cleanedContent.content.length > maxContentLength) {
        cleanedContent.content = cleanedContent.content.substring(0, maxContentLength) + '...';
        cleanedContent.wordCount = this.countWords(cleanedContent.content);
        cleanedContent.readingTime = this.calculateReadingTime(cleanedContent.wordCount);
      }

      // Add metadata if requested
      if (includeMetadata) {
        cleanedContent.metadata = await this.extractMetadata(html, finalUrl);
      }

      logger.info(`[WebMCP] Successfully processed: ${cleanedContent.title} (${cleanedContent.wordCount} words)`);

      return cleanedContent;

    } catch (error) {
      logger.error(`[WebMCP] Error fetching content from ${url}:`, error);
      throw new Error(`Failed to fetch content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch content from multiple URLs
   */
  private async fetchMultipleUrls(urls: string[], includeMetadata: boolean = true): Promise<any> {
    const results: any[] = [];
    let successCount = 0;
    let errorCount = 0;

    logger.info(`[WebMCP] Processing ${urls.length} URLs`);

    // Process URLs in parallel with concurrency limit
    const concurrencyLimit = 5;
    const chunks = this.chunkArray(urls, concurrencyLimit);

    for (const chunk of chunks) {
      const promises = chunk.map(async (url) => {
        try {
          const result = await this.fetchAndCleanContent(url, includeMetadata);
          successCount++;
          return { url, success: true, data: result };
        } catch (error) {
          errorCount++;
          return {
            url,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      const chunkResults = await Promise.all(promises);
      results.push(...chunkResults);
    }

    return {
      results,
      totalCount: urls.length,
      successCount,
      errorCount,
    };
  }

  /**
   * Extract clean text from HTML content
   */
  private async extractTextFromHtml(html: string, url: string): Promise<CleanedContent> {
    try {
      // Create DOM from HTML
      const dom = new JSDOM(html, { url });
      const document = dom.window.document;

      // Use Mozilla Readability to extract main content
      const reader = new Readability(document);
      const article = reader.parse();

      if (!article) {
        // Fallback: extract text from body
        const body = document.body;
        if (!body) {
          throw new Error('No content found in HTML');
        }

        // Remove script and style elements
        const scripts = body.querySelectorAll('script, style, noscript');
        scripts.forEach(el => el.remove());

        // Extract text content
        const title = document.title || 'Untitled';
        const content = body.textContent || body.innerText || '';

        return {
          title: title.trim(),
          content: this.cleanText(content),
          url,
          wordCount: this.countWords(content),
          readingTime: this.calculateReadingTime(this.countWords(content)),
          metadata: {},
        };
      }

      // Clean and format the extracted content
      const cleanContent = this.cleanText(article.textContent || article.content || '');

      return {
        title: article.title || document.title || 'Untitled',
        content: cleanContent,
        url,
        wordCount: this.countWords(cleanContent),
        readingTime: this.calculateReadingTime(this.countWords(cleanContent)),
        metadata: {},
      };

    } catch (error) {
      logger.error('[WebMCP] Error extracting text from HTML:', error);
      throw new Error(`Failed to extract content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract metadata from HTML
   */
  private async extractMetadata(html: string, url: string): Promise<any> {
    try {
      const dom = new JSDOM(html, { url });
      const document = dom.window.document;

      const metadata: any = {};

      // Extract author
      const authorSelectors = [
        'meta[name="author"]',
        'meta[property="article:author"]',
        'meta[property="og:article:author"]',
        '[rel="author"]',
        '.author',
        '[class*="author"]',
      ];

      for (const selector of authorSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          metadata.author = element.getAttribute('content') || element.textContent?.trim();
          if (metadata.author) break;
        }
      }

      // Extract published date
      const dateSelectors = [
        'meta[name="article:published_time"]',
        'meta[property="article:published_time"]',
        'meta[name="date"]',
        'meta[property="og:article:published_time"]',
        'time[datetime]',
        '.date',
        '[class*="date"]',
      ];

      for (const selector of dateSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          metadata.publishedDate = element.getAttribute('content') || 
                                 element.getAttribute('datetime') || 
                                 element.textContent?.trim();
          if (metadata.publishedDate) break;
        }
      }

      // Extract description
      const descriptionSelectors = [
        'meta[name="description"]',
        'meta[property="og:description"]',
        'meta[name="twitter:description"]',
      ];

      for (const selector of descriptionSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          metadata.description = element.getAttribute('content')?.trim();
          if (metadata.description) break;
        }
      }

      // Extract image
      const imageSelectors = [
        'meta[property="og:image"]',
        'meta[name="twitter:image"]',
        'meta[property="og:image:url"]',
      ];

      for (const selector of imageSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          metadata.imageUrl = element.getAttribute('content')?.trim();
          if (metadata.imageUrl) break;
        }
      }

      return metadata;

    } catch (error) {
      logger.error('[WebMCP] Error extracting metadata:', error);
      return {};
    }
  }

  /**
   * Clean and normalize text content
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
      .trim();
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Calculate reading time in minutes
   */
  private calculateReadingTime(wordCount: number): number {
    const wordsPerMinute = 200; // Average reading speed
    return Math.ceil(wordCount / wordsPerMinute);
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
