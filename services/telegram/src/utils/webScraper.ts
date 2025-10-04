/**
 * Web Scraper for Telegram Bot
 * Fetches and processes web content for summarization
 */

import { logger } from './logger.js';

export interface WebContent {
  title: string;
  content: string;
  author?: string;
  publishedDate?: string;
  url: string;
  wordCount: number;
  readingTime: number;
  metadata: {
    description?: string;
    keywords?: string[];
    language?: string;
    siteName?: string;
  };
}

export class WebScraper {
  private userAgent: string;
  private timeout: number;

  constructor() {
    this.userAgent = 'Mozilla/5.0 (compatible; AuraOS-Bot/1.0; +https://github.com/Moeabdelaziz007/AuraOS-Monorepo)';
    this.timeout = 10000; // 10 seconds
  }

  /**
   * Scrape web content from URL
   */
  async scrapeUrl(url: string): Promise<WebContent> {
    try {
      logger.info(`[WebScraper] Scraping URL: ${url}`);
      
      // Validate URL
      if (!this.isValidUrl(url)) {
        throw new Error('Invalid URL format');
      }

      // Fetch the content
      const response = await this.fetchContent(url);
      
      // Parse the content
      const content = this.parseContent(response, url);
      
      logger.info(`[WebScraper] Successfully scraped ${url}`);
      return content;

    } catch (error) {
      logger.error(`[WebScraper] Error scraping ${url}:`, error);
      throw error;
    }
  }

  /**
   * Fetch content from URL
   */
  private async fetchContent(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      return html;

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * Parse HTML content and extract relevant information
   */
  private parseContent(html: string, url: string): WebContent {
    // Simple HTML parsing (in a real implementation, you'd use a proper HTML parser)
    const title = this.extractTitle(html);
    const content = this.extractMainContent(html);
    const author = this.extractAuthor(html);
    const publishedDate = this.extractPublishedDate(html);
    const description = this.extractDescription(html);
    const keywords = this.extractKeywords(html);
    const language = this.extractLanguage(html);
    const siteName = this.extractSiteName(html);

    const wordCount = this.countWords(content);
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute

    return {
      title: title || 'Untitled',
      content: content || 'No content found',
      author,
      publishedDate,
      url,
      wordCount,
      readingTime,
      metadata: {
        description,
        keywords,
        language,
        siteName
      }
    };
  }

  /**
   * Extract title from HTML
   */
  private extractTitle(html: string): string | null {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      return this.cleanText(titleMatch[1]);
    }

    // Try Open Graph title
    const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"[^>]*>/i);
    if (ogTitleMatch) {
      return this.cleanText(ogTitleMatch[1]);
    }

    return null;
  }

  /**
   * Extract main content from HTML
   */
  private extractMainContent(html: string): string {
    // Remove script and style elements
    let content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');

    // Try to find main content areas
    const mainContentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '#content',
      '#main'
    ];

    for (const selector of mainContentSelectors) {
      const regex = new RegExp(`<${selector}[^>]*>([\\s\\S]*?)<\\/${selector}>`, 'i');
      const match = content.match(regex);
      if (match) {
        content = match[1];
        break;
      }
    }

    // Remove HTML tags and clean up
    content = content.replace(/<[^>]+>/g, ' ');
    content = content.replace(/\s+/g, ' ');
    content = this.cleanText(content);

    // Limit content length for summarization
    if (content.length > 5000) {
      content = content.substring(0, 5000) + '...';
    }

    return content;
  }

  /**
   * Extract author from HTML
   */
  private extractAuthor(html: string): string | null {
    const authorSelectors = [
      /<meta[^>]*name="author"[^>]*content="([^"]+)"[^>]*>/i,
      /<meta[^>]*property="article:author"[^>]*content="([^"]+)"[^>]*>/i,
      /<span[^>]*class="[^"]*author[^"]*"[^>]*>([^<]+)<\/span>/i,
      /<div[^>]*class="[^"]*author[^"]*"[^>]*>([^<]+)<\/div>/i
    ];

    for (const selector of authorSelectors) {
      const match = html.match(selector);
      if (match) {
        return this.cleanText(match[1]);
      }
    }

    return null;
  }

  /**
   * Extract published date from HTML
   */
  private extractPublishedDate(html: string): string | null {
    const dateSelectors = [
      /<meta[^>]*property="article:published_time"[^>]*content="([^"]+)"[^>]*>/i,
      /<meta[^>]*name="date"[^>]*content="([^"]+)"[^>]*>/i,
      /<time[^>]*datetime="([^"]+)"[^>]*>/i,
      /<time[^>]*>([^<]+)<\/time>/i
    ];

    for (const selector of dateSelectors) {
      const match = html.match(selector);
      if (match) {
        return this.cleanText(match[1]);
      }
    }

    return null;
  }

  /**
   * Extract description from HTML
   */
  private extractDescription(html: string): string | null {
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"[^>]*>/i);
    if (descMatch) {
      return this.cleanText(descMatch[1]);
    }

    const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"[^>]*>/i);
    if (ogDescMatch) {
      return this.cleanText(ogDescMatch[1]);
    }

    return null;
  }

  /**
   * Extract keywords from HTML
   */
  private extractKeywords(html: string): string[] {
    const keywordsMatch = html.match(/<meta[^>]*name="keywords"[^>]*content="([^"]+)"[^>]*>/i);
    if (keywordsMatch) {
      return keywordsMatch[1].split(',').map(k => k.trim()).filter(k => k.length > 0);
    }
    return [];
  }

  /**
   * Extract language from HTML
   */
  private extractLanguage(html: string): string | null {
    const langMatch = html.match(/<html[^>]*lang="([^"]+)"[^>]*>/i);
    if (langMatch) {
      return langMatch[1];
    }
    return null;
  }

  /**
   * Extract site name from HTML
   */
  private extractSiteName(html: string): string | null {
    const siteNameMatch = html.match(/<meta[^>]*property="og:site_name"[^>]*content="([^"]+)"[^>]*>/i);
    if (siteNameMatch) {
      return this.cleanText(siteNameMatch[1]);
    }
    return null;
  }

  /**
   * Clean and normalize text
   */
  private cleanText(text: string): string {
    return text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  }
}

export default WebScraper;
