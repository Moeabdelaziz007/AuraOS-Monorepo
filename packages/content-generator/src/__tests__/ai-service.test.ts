import { AIContentService } from '../ai-service';
import type {
  ContentGenerationParams,
  BlogPostParams,
  SocialMediaParams,
  EmailTemplateParams,
  GeneratedContent,
} from '../types';

// Mock the AI SDKs
jest.mock('@google/generative-ai');
jest.mock('@anthropic-ai/sdk');

describe('AIContentService', () => {
  let service: AIContentService;
  const mockGeminiResponse = 'Generated content from Gemini';
  const mockClaudeResponse = 'Generated content from Claude';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
  });

  describe('Constructor', () => {
    it('should initialize with Gemini provider by default', () => {
      service = new AIContentService();
      expect(service).toBeDefined();
    });

    it('should initialize with Claude provider when specified', () => {
      service = new AIContentService('claude');
      expect(service).toBeDefined();
    });

    it('should handle missing API keys gracefully', () => {
      delete process.env.GEMINI_API_KEY;
      service = new AIContentService('gemini');
      expect(service).toBeDefined();
    });
  });

  describe('generateContent', () => {
    beforeEach(() => {
      service = new AIContentService('gemini');
      // Mock Gemini response
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => mockGeminiResponse,
          },
        }),
      };
      (service as any).gemini = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };
    });

    it('should generate general content successfully', async () => {
      const params: ContentGenerationParams = {
        type: 'blog_post',
        topic: 'AI in Healthcare',
        style: 'professional',
        language: 'en',
      };

      const result = await service.generateContent(params);

      expect(result).toBeDefined();
      expect(result.content).toBe(mockGeminiResponse);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.wordCount).toBeGreaterThan(0);
      expect(result.metadata.characterCount).toBeGreaterThan(0);
    });

    it('should include keywords in metadata', async () => {
      const params: ContentGenerationParams = {
        type: 'blog_post',
        topic: 'Machine Learning',
        keywords: ['AI', 'ML', 'Deep Learning'],
        language: 'en',
      };

      const result = await service.generateContent(params);

      expect(result.metadata.keywords).toEqual(params.keywords);
    });

    it('should calculate reading time correctly', async () => {
      const result = await service.generateContent({
        type: 'blog_post',
        topic: 'Test',
        language: 'en',
      });

      expect(result.metadata.estimatedReadingTime).toBeGreaterThan(0);
    });

    it('should throw error when AI provider not configured', async () => {
      const unconfiguredService = new AIContentService('gemini');
      (unconfiguredService as any).gemini = null;

      await expect(
        unconfiguredService.generateContent({
          type: 'blog_post',
          topic: 'Test',
          language: 'en',
        })
      ).rejects.toThrow('AI provider not configured');
    });
  });

  describe('generateBlogPost', () => {
    beforeEach(() => {
      service = new AIContentService('gemini');
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => '# Test Title\n\nThis is a test blog post content.',
          },
        }),
      };
      (service as any).gemini = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };
    });

    it('should generate blog post with default parameters', async () => {
      const params: BlogPostParams = {
        topic: 'Web Development',
        language: 'en',
      };

      const result = await service.generateBlogPost(params);

      expect(result).toBeDefined();
      expect(result.content).toContain('Test Title');
      expect(result.title).toBe('Test Title');
    });

    it('should generate short blog post', async () => {
      const params: BlogPostParams = {
        topic: 'Quick Tips',
        length: 'short',
        language: 'en',
      };

      const result = await service.generateBlogPost(params);

      expect(result).toBeDefined();
    });

    it('should generate long blog post with sections', async () => {
      const params: BlogPostParams = {
        topic: 'Comprehensive Guide',
        length: 'long',
        includeSections: true,
        sectionCount: 5,
        language: 'en',
      };

      const result = await service.generateBlogPost(params);

      expect(result).toBeDefined();
    });

    it('should generate blog post without intro', async () => {
      const params: BlogPostParams = {
        topic: 'Direct Content',
        includeIntro: false,
        language: 'en',
      };

      const result = await service.generateBlogPost(params);

      expect(result).toBeDefined();
    });

    it('should generate blog post without conclusion', async () => {
      const params: BlogPostParams = {
        topic: 'Open Ended',
        includeConclusion: false,
        language: 'en',
      };

      const result = await service.generateBlogPost(params);

      expect(result).toBeDefined();
    });

    it('should support different writing styles', async () => {
      const styles = ['professional', 'casual', 'creative', 'persuasive'] as const;

      for (const style of styles) {
        const result = await service.generateBlogPost({
          topic: 'Test Topic',
          style,
          language: 'en',
        });

        expect(result).toBeDefined();
      }
    });

    it('should support Arabic language', async () => {
      const result = await service.generateBlogPost({
        topic: 'موضوع تجريبي',
        language: 'ar',
      });

      expect(result).toBeDefined();
    });
  });

  describe('generateSocialMediaPost', () => {
    beforeEach(() => {
      service = new AIContentService('gemini');
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => 'Exciting news! 🎉 #AI #Tech',
          },
        }),
      };
      (service as any).gemini = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };
    });

    it('should generate Twitter post', async () => {
      const params: SocialMediaParams = {
        topic: 'Product Launch',
        platform: 'twitter',
        language: 'en',
      };

      const result = await service.generateSocialMediaPost(params);

      expect(result).toBeDefined();
      expect(result.content.length).toBeLessThanOrEqual(280);
    });

    it('should generate Facebook post', async () => {
      const params: SocialMediaParams = {
        topic: 'Company Update',
        platform: 'facebook',
        language: 'en',
      };

      const result = await service.generateSocialMediaPost(params);

      expect(result).toBeDefined();
    });

    it('should generate Instagram post with hashtags', async () => {
      const params: SocialMediaParams = {
        topic: 'Behind the Scenes',
        platform: 'instagram',
        includeHashtags: true,
        language: 'en',
      };

      const result = await service.generateSocialMediaPost(params);

      expect(result).toBeDefined();
      expect(result.content).toContain('#');
    });

    it('should generate LinkedIn post', async () => {
      const params: SocialMediaParams = {
        topic: 'Industry Insights',
        platform: 'linkedin',
        style: 'professional',
        language: 'en',
      };

      const result = await service.generateSocialMediaPost(params);

      expect(result).toBeDefined();
    });

    it('should include emojis when requested', async () => {
      const params: SocialMediaParams = {
        topic: 'Celebration',
        platform: 'twitter',
        includeEmojis: true,
        language: 'en',
      };

      const result = await service.generateSocialMediaPost(params);

      expect(result).toBeDefined();
    });

    it('should include call to action', async () => {
      const params: SocialMediaParams = {
        topic: 'Engagement Post',
        platform: 'facebook',
        includeCallToAction: true,
        language: 'en',
      };

      const result = await service.generateSocialMediaPost(params);

      expect(result).toBeDefined();
    });

    it('should generate post without hashtags', async () => {
      const params: SocialMediaParams = {
        topic: 'Clean Post',
        platform: 'linkedin',
        includeHashtags: false,
        language: 'en',
      };

      const result = await service.generateSocialMediaPost(params);

      expect(result).toBeDefined();
    });
  });

  describe('generateEmailTemplate', () => {
    beforeEach(() => {
      service = new AIContentService('gemini');
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () =>
              'Subject: Welcome!\n\nDear Customer,\n\nThank you for joining us.\n\nBest regards,\nTeam',
          },
        }),
      };
      (service as any).gemini = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };
    });

    it('should generate marketing email', async () => {
      const params: EmailTemplateParams = {
        topic: 'New Product Launch',
        purpose: 'marketing',
        language: 'en',
      };

      const result = await service.generateEmailTemplate(params);

      expect(result).toBeDefined();
      expect(result.content).toContain('Subject:');
    });

    it('should generate newsletter email', async () => {
      const params: EmailTemplateParams = {
        topic: 'Monthly Updates',
        purpose: 'newsletter',
        language: 'en',
      };

      const result = await service.generateEmailTemplate(params);

      expect(result).toBeDefined();
    });

    it('should generate welcome email', async () => {
      const params: EmailTemplateParams = {
        topic: 'Welcome to Our Platform',
        purpose: 'welcome',
        language: 'en',
      };

      const result = await service.generateEmailTemplate(params);

      expect(result).toBeDefined();
    });

    it('should generate follow-up email', async () => {
      const params: EmailTemplateParams = {
        topic: 'Following Up',
        purpose: 'follow_up',
        language: 'en',
      };

      const result = await service.generateEmailTemplate(params);

      expect(result).toBeDefined();
    });

    it('should generate announcement email', async () => {
      const params: EmailTemplateParams = {
        topic: 'Important Update',
        purpose: 'announcement',
        language: 'en',
      };

      const result = await service.generateEmailTemplate(params);

      expect(result).toBeDefined();
    });

    it('should include subject line', async () => {
      const params: EmailTemplateParams = {
        topic: 'Test Email',
        purpose: 'marketing',
        includeSubject: true,
        language: 'en',
      };

      const result = await service.generateEmailTemplate(params);

      expect(result.content).toContain('Subject:');
    });

    it('should include preheader', async () => {
      const params: EmailTemplateParams = {
        topic: 'Test Email',
        purpose: 'newsletter',
        includePreheader: true,
        language: 'en',
      };

      const result = await service.generateEmailTemplate(params);

      expect(result).toBeDefined();
    });

    it('should include call to action', async () => {
      const params: EmailTemplateParams = {
        topic: 'Action Required',
        purpose: 'marketing',
        includeCallToAction: true,
        language: 'en',
      };

      const result = await service.generateEmailTemplate(params);

      expect(result).toBeDefined();
    });
  });

  describe('SEO and Suggestions', () => {
    beforeEach(() => {
      service = new AIContentService('gemini');
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => 'Short content about AI and machine learning.',
          },
        }),
      };
      (service as any).gemini = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };
    });

    it('should provide SEO tips for short content', async () => {
      const result = await service.generateContent({
        type: 'blog_post',
        topic: 'AI',
        language: 'en',
      });

      expect(result.suggestions?.seoTips).toBeDefined();
      expect(result.suggestions?.seoTips?.length).toBeGreaterThan(0);
    });

    it('should suggest missing keywords', async () => {
      const result = await service.generateContent({
        type: 'blog_post',
        topic: 'AI',
        keywords: ['blockchain', 'cryptocurrency'],
        language: 'en',
      });

      expect(result.suggestions?.seoTips).toBeDefined();
    });

    it('should provide improvement suggestions', async () => {
      const result = await service.generateContent({
        type: 'blog_post',
        topic: 'Test',
        language: 'en',
      });

      expect(result.suggestions?.improvements).toBeDefined();
    });

    it('should generate alternative titles', async () => {
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => '# Original Title\n\nContent here.',
          },
        }),
      };
      (service as any).gemini = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };

      const result = await service.generateBlogPost({
        topic: 'Test Topic',
        language: 'en',
      });

      expect(result.suggestions?.alternativeTitles).toBeDefined();
      expect(result.suggestions?.alternativeTitles?.length).toBeGreaterThan(0);
    });
  });

  describe('Claude Provider', () => {
    beforeEach(() => {
      service = new AIContentService('claude');
      (service as any).claude = {
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [
              {
                type: 'text',
                text: mockClaudeResponse,
              },
            ],
          }),
        },
      };
    });

    it('should generate content using Claude', async () => {
      const result = await service.generateContent({
        type: 'blog_post',
        topic: 'AI Ethics',
        language: 'en',
      });

      expect(result).toBeDefined();
      expect(result.content).toBe(mockClaudeResponse);
    });

    it('should handle Claude API errors', async () => {
      (service as any).claude = {
        messages: {
          create: jest.fn().mockRejectedValue(new Error('Claude API error')),
        },
      };

      await expect(
        service.generateContent({
          type: 'blog_post',
          topic: 'Test',
          language: 'en',
        })
      ).rejects.toThrow('Claude API error');
    });

    it('should throw error for unexpected Claude response format', async () => {
      (service as any).claude = {
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [
              {
                type: 'image',
                data: 'base64data',
              },
            ],
          }),
        },
      };

      await expect(
        service.generateContent({
          type: 'blog_post',
          topic: 'Test',
          language: 'en',
        })
      ).rejects.toThrow('Unexpected response format from Claude');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when Gemini not initialized', async () => {
      service = new AIContentService('gemini');
      (service as any).gemini = null;

      await expect(
        service.generateContent({
          type: 'blog_post',
          topic: 'Test',
          language: 'en',
        })
      ).rejects.toThrow();
    });

    it('should throw error when Claude not initialized', async () => {
      service = new AIContentService('claude');
      (service as any).claude = null;

      await expect(
        service.generateContent({
          type: 'blog_post',
          topic: 'Test',
          language: 'en',
        })
      ).rejects.toThrow();
    });
  });

  describe('Content Formatting', () => {
    beforeEach(() => {
      service = new AIContentService('gemini');
    });

    it('should extract title from markdown heading', async () => {
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => '# My Amazing Title\n\nContent follows here.',
          },
        }),
      };
      (service as any).gemini = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };

      const result = await service.generateContent({
        type: 'blog_post',
        topic: 'Test',
        language: 'en',
      });

      expect(result.title).toBe('My Amazing Title');
    });

    it('should handle content without title', async () => {
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => 'Just plain content without a title.',
          },
        }),
      };
      (service as any).gemini = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };

      const result = await service.generateContent({
        type: 'blog_post',
        topic: 'Test',
        language: 'en',
      });

      expect(result.title).toBeUndefined();
    });

    it('should calculate word count accurately', async () => {
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => 'One two three four five words here.',
          },
        }),
      };
      (service as any).gemini = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };

      const result = await service.generateContent({
        type: 'blog_post',
        topic: 'Test',
        language: 'en',
      });

      expect(result.metadata.wordCount).toBe(7);
    });

    it('should extract keywords from content', async () => {
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () =>
              'Artificial intelligence machine learning deep learning neural networks algorithms',
          },
        }),
      };
      (service as any).gemini = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };

      const result = await service.generateContent({
        type: 'blog_post',
        topic: 'AI',
        language: 'en',
      });

      expect(result.metadata.keywords).toBeDefined();
      expect(result.metadata.keywords.length).toBeGreaterThan(0);
    });
  });
});
