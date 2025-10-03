/**
 * AI Summarization Service
 * Generates summaries, key points, and extracts entities
 */

interface SummarizationResult {
  summary: string;
  keyPoints: string[];
  entities: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  importance: number;
}

interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

/**
 * AI Summarization Service
 */
export class AISummarizationService {
  private static instance: AISummarizationService;

  static getInstance(): AISummarizationService {
    if (!AISummarizationService.instance) {
      AISummarizationService.instance = new AISummarizationService();
    }
    return AISummarizationService.instance;
  }

  /**
   * Generate comprehensive summary with metadata
   */
  async analyzeFull(content: string): Promise<SummarizationResult> {
    const [summary, keyPoints, entities, sentiment, importance] = await Promise.all([
      this.summarize(content),
      this.extractKeyPoints(content),
      this.extractEntities(content),
      this.analyzeSentiment(content),
      this.calculateImportance(content),
    ]);

    return {
      summary,
      keyPoints,
      entities,
      sentiment,
      importance,
    };
  }

  /**
   * Generate summary
   */
  async summarize(content: string, maxLength: number = 150): Promise<string> {
    try {
      // Try vLLM first
      const vllmSummary = await this.vllmRequest(content, {
        prompt: 'Summarize the following text concisely:',
        maxTokens: maxLength,
        temperature: 0.5,
      });

      if (vllmSummary) return vllmSummary;

      // Fallback to OpenAI
      return await this.openaiRequest(content, {
        prompt: 'Summarize the following text concisely:',
        maxTokens: maxLength,
        temperature: 0.5,
      });
    } catch (error) {
      logger.error('Summarization error:', error);
      // Fallback: simple extraction
      return this.extractiveSummary(content, maxLength);
    }
  }

  /**
   * Extract key points
   */
  async extractKeyPoints(content: string): Promise<string[]> {
    try {
      const response = await this.vllmRequest(content, {
        prompt: 'Extract 3-5 key points from this text as a bullet list:',
        maxTokens: 200,
        temperature: 0.5,
      });

      if (response) {
        return response
          .split('\n')
          .filter((line) => line.trim().startsWith('-') || line.trim().startsWith('•'))
          .map((line) => line.replace(/^[-•]\s*/, '').trim())
          .filter(Boolean);
      }

      // Fallback: extract sentences
      return this.extractTopSentences(content, 5);
    } catch (error) {
      logger.error('Key points extraction error:', error);
      return this.extractTopSentences(content, 5);
    }
  }

  /**
   * Extract entities (people, places, organizations)
   */
  async extractEntities(content: string): Promise<string[]> {
    try {
      const response = await this.vllmRequest(content, {
        prompt: 'Extract all named entities (people, places, organizations) from this text:',
        maxTokens: 100,
        temperature: 0.3,
      });

      if (response) {
        return response
          .split(',')
          .map((entity) => entity.trim())
          .filter(Boolean);
      }

      // Fallback: simple regex extraction
      return this.simpleEntityExtraction(content);
    } catch (error) {
      logger.error('Entity extraction error:', error);
      return this.simpleEntityExtraction(content);
    }
  }

  /**
   * Analyze sentiment
   */
  async analyzeSentiment(content: string): Promise<'positive' | 'neutral' | 'negative'> {
    try {
      const response = await this.vllmRequest(content, {
        prompt: 'Analyze the sentiment of this text. Respond with only: positive, neutral, or negative.',
        maxTokens: 10,
        temperature: 0.3,
      });

      if (response) {
        const sentiment = response.toLowerCase().trim();
        if (sentiment.includes('positive')) return 'positive';
        if (sentiment.includes('negative')) return 'negative';
        return 'neutral';
      }

      // Fallback: simple keyword analysis
      return this.simpleSentimentAnalysis(content);
    } catch (error) {
      logger.error('Sentiment analysis error:', error);
      return this.simpleSentimentAnalysis(content);
    }
  }

  /**
   * Calculate importance score (0-100)
   */
  async calculateImportance(content: string): Promise<number> {
    // Factors: length, keywords, structure, entities
    let score = 0;

    // Length factor (longer = potentially more important)
    const wordCount = content.split(/\s+/).length;
    score += Math.min(wordCount / 10, 30);

    // Keyword factor
    const importantKeywords = [
      'important',
      'critical',
      'urgent',
      'deadline',
      'priority',
      'action',
      'decision',
      'meeting',
      'project',
    ];
    const keywordCount = importantKeywords.filter((kw) =>
      content.toLowerCase().includes(kw)
    ).length;
    score += keywordCount * 10;

    // Structure factor (headings, lists)
    if (content.includes('#')) score += 10;
    if (content.includes('-') || content.includes('•')) score += 10;

    // Entities factor
    const entities = await this.extractEntities(content);
    score += Math.min(entities.length * 5, 20);

    return Math.min(Math.round(score), 100);
  }

  /**
   * Translate text
   */
  async translate(
    text: string,
    targetLanguage: string,
    sourceLanguage: string = 'auto'
  ): Promise<TranslationResult> {
    try {
      const response = await this.vllmRequest(text, {
        prompt: `Translate this text to ${targetLanguage}:`,
        maxTokens: text.split(' ').length * 2,
        temperature: 0.3,
      });

      return {
        translatedText: response || text,
        sourceLanguage: sourceLanguage === 'auto' ? 'en' : sourceLanguage,
        targetLanguage,
      };
    } catch (error) {
      logger.error('Translation error:', error);
      throw new Error('Translation failed');
    }
  }

  /**
   * Generate tags
   */
  async generateTags(content: string): Promise<string[]> {
    try {
      const response = await this.vllmRequest(content, {
        prompt: 'Generate 3-5 relevant tags for this content (comma-separated):',
        maxTokens: 50,
        temperature: 0.5,
      });

      if (response) {
        return response
          .split(',')
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean);
      }

      // Fallback: extract common words
      return this.extractCommonWords(content, 5);
    } catch (error) {
      logger.error('Tag generation error:', error);
      return this.extractCommonWords(content, 5);
    }
  }

  // ===== Private Helper Methods =====

  /**
   * Make request to vLLM
   */
  private async vllmRequest(
    content: string,
    options: {
      prompt: string;
      maxTokens: number;
      temperature: number;
    }
  ): Promise<string | null> {
    try {
      const response = await fetch('http://localhost:8000/v1/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'meta-llama/Llama-2-7b-chat-hf',
          prompt: `${options.prompt}\n\n${content}`,
          max_tokens: options.maxTokens,
          temperature: options.temperature,
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.choices[0].text.trim();
    } catch (error) {
      return null;
    }
  }

  /**
   * Make request to OpenAI
   */
  private async openaiRequest(
    content: string,
    options: {
      prompt: string;
      maxTokens: number;
      temperature: number;
    }
  ): Promise<string> {
    const apiKey = process.env.VITE_OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not configured');

    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-instruct',
        prompt: `${options.prompt}\n\n${content}`,
        max_tokens: options.maxTokens,
        temperature: options.temperature,
      }),
    });

    if (!response.ok) throw new Error('OpenAI request failed');

    const data = await response.json();
    return data.choices[0].text.trim();
  }

  /**
   * Extractive summary (fallback)
   */
  private extractiveSummary(content: string, maxLength: number): string {
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    const topSentences = this.extractTopSentences(content, 3);
    return topSentences.join(' ').substring(0, maxLength) + '...';
  }

  /**
   * Extract top sentences
   */
  private extractTopSentences(content: string, count: number): string[] {
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    return sentences
      .map((s) => s.trim())
      .filter((s) => s.split(' ').length > 5)
      .slice(0, count);
  }

  /**
   * Simple entity extraction
   */
  private simpleEntityExtraction(content: string): string[] {
    // Extract capitalized words (potential entities)
    const matches = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    return [...new Set(matches)].slice(0, 10);
  }

  /**
   * Simple sentiment analysis
   */
  private simpleSentimentAnalysis(content: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'success', 'amazing'];
    const negativeWords = ['bad', 'terrible', 'awful', 'sad', 'failure', 'problem'];

    const text = content.toLowerCase();
    const positiveCount = positiveWords.filter((w) => text.includes(w)).length;
    const negativeCount = negativeWords.filter((w) => text.includes(w)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Extract common words
   */
  private extractCommonWords(content: string, count: number): string[] {
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'is',
      'was',
      'are',
      'were',
    ]);

    const words = content
      .toLowerCase()
      .match(/\b\w+\b/g) || [];

    const wordFreq = new Map<string, number>();
    words.forEach((word) => {
      if (word.length > 3 && !stopWords.has(word)) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([word]) => word);
  }
}
