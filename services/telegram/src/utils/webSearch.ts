/**
 * Web Search Service for Telegram Bot
 * Uses DuckDuckGo Instant Answer API for free web search
 */

import { logger } from './logger.js';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  domain: string;
  relevanceScore: number;
}

export interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  totalResults: number;
  query: string;
  executionTime: number;
  error?: string;
}

export class WebSearchService {
  private baseUrl: string;
  private timeout: number;
  private maxResults: number;

  constructor() {
    this.baseUrl = 'https://api.duckduckgo.com/';
    this.timeout = 10000; // 10 seconds
    this.maxResults = 10;
  }

  /**
   * Search for web content using DuckDuckGo
   */
  async searchQuery(query: string, maxResults: number = 5): Promise<SearchResponse> {
    const startTime = Date.now();
    
    try {
      logger.info(`[WebSearch] Searching for: ${query}`);
      
      // Validate query
      if (!query || query.trim().length < 3) {
        throw new Error('Query must be at least 3 characters long');
      }

      // Clean and encode query
      const cleanQuery = query.trim().replace(/[^\w\s-]/g, '');
      const encodedQuery = encodeURIComponent(cleanQuery);

      // Search using DuckDuckGo Instant Answer API
      const searchResults = await this.performSearch(encodedQuery, maxResults);
      
      const executionTime = Date.now() - startTime;
      
      logger.info(`[WebSearch] Found ${searchResults.length} results in ${executionTime}ms`);
      
      return {
        success: true,
        results: searchResults,
        totalResults: searchResults.length,
        query: cleanQuery,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error(`[WebSearch] Error searching for "${query}":`, error);
      
      return {
        success: false,
        results: [],
        totalResults: 0,
        query,
        executionTime,
        error: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }

  /**
   * Perform the actual search request
   */
  private async performSearch(query: string, maxResults: number): Promise<SearchResult[]> {
    try {
      // Use DuckDuckGo HTML search as fallback since Instant Answer API is limited
      const searchUrl = `https://html.duckduckgo.com/html/?q=${query}&kl=us-en`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AuraOS-Bot/1.0; +https://github.com/Moeabdelaziz007/AuraOS-Monorepo)',
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
      return this.parseSearchResults(html, maxResults);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Search request timeout');
      }
      throw error;
    }
  }

  /**
   * Parse search results from DuckDuckGo HTML
   */
  private parseSearchResults(html: string, maxResults: number): SearchResult[] {
    const results: SearchResult[] = [];
    
    try {
      // Extract results from DuckDuckGo HTML structure
      const resultRegex = /<div class="result[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>[\s\S]*?<h2[^>]*>([^<]*)<\/h2>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([^<]*)<\/a>/gi;
      
      let match;
      let count = 0;
      
      while ((match = resultRegex.exec(html)) !== null && count < maxResults) {
        const url = match[1];
        const title = this.cleanText(match[2]);
        const snippet = this.cleanText(match[3]);
        
        // Skip if URL is not valid or is a DuckDuckGo internal link
        if (!url || !this.isValidUrl(url) || url.includes('duckduckgo.com')) {
          continue;
        }
        
        const domain = this.extractDomain(url);
        const relevanceScore = this.calculateRelevanceScore(title, snippet, query);
        
        results.push({
          title,
          url,
          snippet,
          domain,
          relevanceScore
        });
        
        count++;
      }
      
      // Sort by relevance score
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      return results.slice(0, maxResults);
      
    } catch (error) {
      logger.error('[WebSearch] Error parsing search results:', error);
      return [];
    }
  }

  /**
   * Calculate relevance score for search results
   */
  private calculateRelevanceScore(title: string, snippet: string, query: string): number {
    let score = 0;
    const queryLower = query.toLowerCase();
    const titleLower = title.toLowerCase();
    const snippetLower = snippet.toLowerCase();
    
    // Title matches are more important
    if (titleLower.includes(queryLower)) score += 3;
    if (snippetLower.includes(queryLower)) score += 2;
    
    // Exact phrase matches
    if (titleLower.includes(`"${queryLower}"`)) score += 2;
    if (snippetLower.includes(`"${queryLower}"`)) score += 1;
    
    // Word matches
    const queryWords = queryLower.split(/\s+/);
    queryWords.forEach(word => {
      if (titleLower.includes(word)) score += 1;
      if (snippetLower.includes(word)) score += 0.5;
    });
    
    // Length bonus (not too short, not too long)
    if (title.length > 20 && title.length < 100) score += 0.5;
    if (snippet.length > 50 && snippet.length < 200) score += 0.5;
    
    return score;
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  }

  /**
   * Validate URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  }

  /**
   * Clean text content
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
   * Get search suggestions for a query
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const suggestionsUrl = `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&kl=us-en`;
      
      const response = await fetch(suggestionsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AuraOS-Bot/1.0)',
        },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json() as Array<{ phrase: string }>;
      return data.map((item) => item.phrase).slice(0, 5);
      
    } catch (error) {
      logger.error('[WebSearch] Error getting suggestions:', error);
      return [];
    }
  }
}

export default WebSearchService;
