/**
 * AI Summarizer for Telegram Bot
 * Processes web content and generates intelligent summaries
 */

import { logger } from './logger.js';
import type { WebContent } from './webScraper.js';

export interface SummaryResult {
  title: string;
  summary: string;
  keyPoints: string[];
  metadata: {
    author?: string;
    publishedDate?: string;
    wordCount: number;
    readingTime: number;
    confidence: number;
    originalUrl: string;
  };
}

export class AISummarizer {
  private maxSummaryLength: number;
  private maxKeyPoints: number;

  constructor() {
    this.maxSummaryLength = 800; // Characters
    this.maxKeyPoints = 5;
  }

  /**
   * Generate AI-powered summary from web content
   */
  async summarizeContent(content: WebContent): Promise<SummaryResult> {
    try {
      logger.info(`[AISummarizer] Summarizing content: ${content.title}`);
      
      // Generate summary
      const summary = this.generateSummary(content.content);
      
      // Extract key points
      const keyPoints = this.extractKeyPoints(content.content);
      
      // Calculate confidence based on content quality
      const confidence = this.calculateConfidence(content);
      
      const result: SummaryResult = {
        title: content.title,
        summary,
        keyPoints,
        metadata: {
          author: content.author,
          publishedDate: content.publishedDate,
          wordCount: content.wordCount,
          readingTime: content.readingTime,
          confidence,
          originalUrl: content.url
        }
      };

      logger.info(`[AISummarizer] Successfully summarized content`);
      return result;

    } catch (error) {
      logger.error(`[AISummarizer] Error summarizing content:`, error);
      throw error;
    }
  }

  /**
   * Generate intelligent summary from content
   */
  private generateSummary(content: string): string {
    // Simple extractive summarization (in a real implementation, you'd use AI/ML)
    const sentences = this.splitIntoSentences(content);
    
    if (sentences.length <= 3) {
      return content.substring(0, this.maxSummaryLength);
    }

    // Score sentences based on importance
    const scoredSentences = sentences.map(sentence => ({
      text: sentence,
      score: this.scoreSentence(sentence, content)
    }));

    // Sort by score and take top sentences
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(5, Math.ceil(sentences.length * 0.3)))
      .map(s => s.text);

    // Join and truncate if necessary
    let summary = topSentences.join(' ');
    if (summary.length > this.maxSummaryLength) {
      summary = summary.substring(0, this.maxSummaryLength) + '...';
    }

    return summary;
  }

  /**
   * Extract key points from content
   */
  private extractKeyPoints(content: string): string[] {
    const sentences = this.splitIntoSentences(content);
    
    // Look for sentences that might be key points
    const keyPointCandidates = sentences.filter(sentence => {
      const lower = sentence.toLowerCase();
      return (
        lower.includes('important') ||
        lower.includes('key') ||
        lower.includes('main') ||
        lower.includes('primary') ||
        lower.includes('significant') ||
        lower.includes('notable') ||
        lower.includes('crucial') ||
        lower.includes('essential') ||
        sentence.length > 50 && sentence.length < 200
      );
    });

    // Score and select best key points
    const scoredPoints = keyPointCandidates.map(point => ({
      text: point,
      score: this.scoreKeyPoint(point, content)
    }));

    return scoredPoints
      .sort((a, b) => b.score - a.score)
      .slice(0, this.maxKeyPoints)
      .map(p => p.text)
      .map(point => this.cleanKeyPoint(point));
  }

  /**
   * Score sentence importance
   */
  private scoreSentence(sentence: string, fullContent: string): number {
    let score = 0;
    const lower = sentence.toLowerCase();
    const contentLower = fullContent.toLowerCase();

    // Length bonus (not too short, not too long)
    if (sentence.length > 20 && sentence.length < 200) {
      score += 1;
    }

    // Position bonus (first and last sentences are often important)
    const sentences = this.splitIntoSentences(fullContent);
    const index = sentences.indexOf(sentence);
    if (index === 0 || index === sentences.length - 1) {
      score += 2;
    }

    // Keyword bonus
    const importantKeywords = [
      'important', 'key', 'main', 'primary', 'significant',
      'notable', 'crucial', 'essential', 'major', 'critical',
      'conclusion', 'summary', 'overview', 'introduction'
    ];

    for (const keyword of importantKeywords) {
      if (lower.includes(keyword)) {
        score += 1;
      }
    }

    // Question bonus (questions often indicate important points)
    if (lower.includes('?')) {
      score += 1;
    }

    // Number bonus (numbered points are often key)
    if (/^\d+\./.test(sentence.trim())) {
      score += 2;
    }

    // Bullet point bonus
    if (sentence.trim().startsWith('•') || sentence.trim().startsWith('-')) {
      score += 1;
    }

    return score;
  }

  /**
   * Score key point importance
   */
  private scoreKeyPoint(point: string, fullContent: string): number {
    let score = this.scoreSentence(point, fullContent);
    
    // Additional scoring for key points
    const lower = point.toLowerCase();
    
    // Avoid very short or very long points
    if (point.length < 30 || point.length > 300) {
      score -= 2;
    }

    // Bonus for specific patterns
    if (lower.includes('benefit') || lower.includes('advantage')) {
      score += 1;
    }
    
    if (lower.includes('challenge') || lower.includes('problem')) {
      score += 1;
    }

    if (lower.includes('future') || lower.includes('trend')) {
      score += 1;
    }

    return score;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(content: WebContent): number {
    let confidence = 0.5; // Base confidence

    // Content length bonus
    if (content.wordCount > 100) confidence += 0.1;
    if (content.wordCount > 500) confidence += 0.1;
    if (content.wordCount > 1000) confidence += 0.1;

    // Metadata presence bonus
    if (content.author) confidence += 0.1;
    if (content.publishedDate) confidence += 0.1;
    if (content.metadata.description) confidence += 0.1;

    // Content quality indicators
    const hasParagraphs = content.content.includes('\n\n');
    if (hasParagraphs) confidence += 0.1;

    const hasStructure = content.content.includes('.') && content.content.includes(',');
    if (hasStructure) confidence += 0.1;

    // Cap at 0.95
    return Math.min(confidence, 0.95);
  }

  /**
   * Split text into sentences
   */
  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);
  }

  /**
   * Clean key point text
   */
  private cleanKeyPoint(point: string): string {
    return point
      .replace(/^\d+\.\s*/, '') // Remove numbering
      .replace(/^[•\-]\s*/, '') // Remove bullet points
      .trim()
      .substring(0, 200); // Limit length
  }
}

export default AISummarizer;
