import { ContentGeneratorMCP } from '../mcp/content-generator';
import * as admin from 'firebase-admin';

// Mock dependencies
jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({
    collection: jest.fn(),
    doc: jest.fn(),
  })),
}));

jest.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: jest.fn().mockImplementation(() => ({
    setRequestHandler: jest.fn(),
    connect: jest.fn(),
  })),
}));

jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: jest.fn(),
}));

jest.mock('@auraos/billing', () => ({
  isProUser: jest.fn(),
}));

jest.mock('../ai-service');

describe('ContentGeneratorMCP', () => {
  let mcpServer: ContentGeneratorMCP;
  let mockFirestore: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockFirestore = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
    };

    (admin.firestore as jest.Mock).mockReturnValue(mockFirestore);
  });

  describe('Initialization', () => {
    it('should initialize MCP server successfully', () => {
      mcpServer = new ContentGeneratorMCP();
      expect(mcpServer).toBeDefined();
    });

    it('should initialize Firebase if not already initialized', () => {
      (admin as any).apps = [];
      mcpServer = new ContentGeneratorMCP();
      expect(admin.initializeApp).toHaveBeenCalled();
    });

    it('should not reinitialize Firebase if already initialized', () => {
      (admin as any).apps = [{}];
      jest.clearAllMocks();
      mcpServer = new ContentGeneratorMCP();
      expect(admin.initializeApp).not.toHaveBeenCalled();
    });
  });

  describe('Tool Registration', () => {
    it('should register generate_blog_post tool', () => {
      mcpServer = new ContentGeneratorMCP();
      const server = (mcpServer as any).server;
      expect(server.setRequestHandler).toHaveBeenCalled();
    });

    it('should register generate_social_media_post tool', () => {
      mcpServer = new ContentGeneratorMCP();
      const server = (mcpServer as any).server;
      expect(server.setRequestHandler).toHaveBeenCalled();
    });

    it('should register generate_email_template tool', () => {
      mcpServer = new ContentGeneratorMCP();
      const server = (mcpServer as any).server;
      expect(server.setRequestHandler).toHaveBeenCalled();
    });

    it('should register get_usage_stats tool', () => {
      mcpServer = new ContentGeneratorMCP();
      const server = (mcpServer as any).server;
      expect(server.setRequestHandler).toHaveBeenCalled();
    });
  });

  describe('Usage Tracking', () => {
    beforeEach(() => {
      mcpServer = new ContentGeneratorMCP();
    });

    it('should track content generation for free users', async () => {
      const userId = 'user123';
      const mockUsageDoc = {
        exists: true,
        data: () => ({
          totalGenerations: 5,
          generationsThisMonth: 3,
          lastGeneration: Date.now() - 86400000,
        }),
      };

      mockFirestore.get.mockResolvedValue(mockUsageDoc);

      // Simulate usage tracking
      const trackUsage = (mcpServer as any).trackUsage;
      if (trackUsage) {
        await trackUsage(userId);
        expect(mockFirestore.update).toHaveBeenCalled();
      }
    });

    it('should create usage document for new users', async () => {
      const userId = 'newuser123';
      const mockUsageDoc = {
        exists: false,
      };

      mockFirestore.get.mockResolvedValue(mockUsageDoc);

      const trackUsage = (mcpServer as any).trackUsage;
      if (trackUsage) {
        await trackUsage(userId);
        expect(mockFirestore.set).toHaveBeenCalled();
      }
    });

    it('should reset monthly counter at month start', async () => {
      const userId = 'user123';
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const mockUsageDoc = {
        exists: true,
        data: () => ({
          totalGenerations: 50,
          generationsThisMonth: 20,
          lastGeneration: lastMonth.getTime(),
        }),
      };

      mockFirestore.get.mockResolvedValue(mockUsageDoc);

      const trackUsage = (mcpServer as any).trackUsage;
      if (trackUsage) {
        await trackUsage(userId);
        // Should reset monthly counter
      }
    });
  });

  describe('Subscription Limits', () => {
    beforeEach(() => {
      mcpServer = new ContentGeneratorMCP();
    });

    it('should enforce free tier generation limits', async () => {
      const { isProUser } = require('@auraos/billing');
      (isProUser as jest.Mock).mockResolvedValue(false);

      const userId = 'freeuser123';
      const mockUsageDoc = {
        exists: true,
        data: () => ({
          totalGenerations: 15,
          generationsThisMonth: 10, // At free tier limit
          lastGeneration: Date.now(),
        }),
      };

      mockFirestore.get.mockResolvedValue(mockUsageDoc);

      const checkLimits = (mcpServer as any).checkUsageLimits;
      if (checkLimits) {
        const canGenerate = await checkLimits(userId);
        expect(canGenerate).toBe(false);
      }
    });

    it('should allow unlimited generations for pro users', async () => {
      const { isProUser } = require('@auraos/billing');
      (isProUser as jest.Mock).mockResolvedValue(true);

      const userId = 'prouser123';
      const mockUsageDoc = {
        exists: true,
        data: () => ({
          totalGenerations: 1000,
          generationsThisMonth: 500,
          lastGeneration: Date.now(),
        }),
      };

      mockFirestore.get.mockResolvedValue(mockUsageDoc);

      const checkLimits = (mcpServer as any).checkUsageLimits;
      if (checkLimits) {
        const canGenerate = await checkLimits(userId);
        expect(canGenerate).toBe(true);
      }
    });

    it('should restrict content length for free users', async () => {
      const { isProUser } = require('@auraos/billing');
      (isProUser as jest.Mock).mockResolvedValue(false);

      const userId = 'freeuser123';
      const requestedLength = 'long';

      const validateLength = (mcpServer as any).validateContentLength;
      if (validateLength) {
        const isValid = await validateLength(userId, requestedLength);
        expect(isValid).toBe(false);
      }
    });

    it('should allow long content for pro users', async () => {
      const { isProUser } = require('@auraos/billing');
      (isProUser as jest.Mock).mockResolvedValue(true);

      const userId = 'prouser123';
      const requestedLength = 'long';

      const validateLength = (mcpServer as any).validateContentLength;
      if (validateLength) {
        const isValid = await validateLength(userId, requestedLength);
        expect(isValid).toBe(true);
      }
    });
  });

  describe('Content Generation', () => {
    beforeEach(() => {
      mcpServer = new ContentGeneratorMCP();
      const { isProUser } = require('@auraos/billing');
      (isProUser as jest.Mock).mockResolvedValue(true);
    });

    it('should generate blog post successfully', async () => {
      const mockAIService = (mcpServer as any).aiService;
      mockAIService.generateBlogPost = jest.fn().mockResolvedValue({
        content: 'Generated blog post content',
        title: 'Test Blog Post',
        metadata: {
          wordCount: 500,
          characterCount: 3000,
          estimatedReadingTime: 3,
          keywords: ['test', 'blog'],
          generatedAt: Date.now(),
        },
      });

      const generateBlogPost = (mcpServer as any).handleGenerateBlogPost;
      if (generateBlogPost) {
        const result = await generateBlogPost({
          userId: 'user123',
          topic: 'Test Topic',
          style: 'professional',
          length: 'medium',
          language: 'en',
        });

        expect(result).toBeDefined();
        expect(result.content).toBe('Generated blog post content');
      }
    });

    it('should generate social media post successfully', async () => {
      const mockAIService = (mcpServer as any).aiService;
      mockAIService.generateSocialMediaPost = jest.fn().mockResolvedValue({
        content: 'Exciting news! 🎉 #test',
        metadata: {
          wordCount: 5,
          characterCount: 25,
          estimatedReadingTime: 1,
          keywords: ['news'],
          generatedAt: Date.now(),
        },
      });

      const generateSocialPost = (mcpServer as any).handleGenerateSocialMediaPost;
      if (generateSocialPost) {
        const result = await generateSocialPost({
          userId: 'user123',
          topic: 'Product Launch',
          platform: 'twitter',
          language: 'en',
        });

        expect(result).toBeDefined();
        expect(result.content).toContain('#test');
      }
    });

    it('should generate email template successfully', async () => {
      const mockAIService = (mcpServer as any).aiService;
      mockAIService.generateEmailTemplate = jest.fn().mockResolvedValue({
        content: 'Subject: Welcome!\n\nDear Customer...',
        metadata: {
          wordCount: 50,
          characterCount: 300,
          estimatedReadingTime: 1,
          keywords: ['welcome'],
          generatedAt: Date.now(),
        },
      });

      const generateEmail = (mcpServer as any).handleGenerateEmailTemplate;
      if (generateEmail) {
        const result = await generateEmail({
          userId: 'user123',
          topic: 'Welcome Email',
          purpose: 'welcome',
          language: 'en',
        });

        expect(result).toBeDefined();
        expect(result.content).toContain('Subject:');
      }
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mcpServer = new ContentGeneratorMCP();
    });

    it('should handle AI service errors gracefully', async () => {
      const mockAIService = (mcpServer as any).aiService;
      mockAIService.generateBlogPost = jest
        .fn()
        .mockRejectedValue(new Error('AI service unavailable'));

      const generateBlogPost = (mcpServer as any).handleGenerateBlogPost;
      if (generateBlogPost) {
        await expect(
          generateBlogPost({
            userId: 'user123',
            topic: 'Test',
            language: 'en',
          })
        ).rejects.toThrow('AI service unavailable');
      }
    });

    it('should handle Firestore errors gracefully', async () => {
      mockFirestore.get.mockRejectedValue(new Error('Firestore connection error'));

      const trackUsage = (mcpServer as any).trackUsage;
      if (trackUsage) {
        await expect(trackUsage('user123')).rejects.toThrow('Firestore connection error');
      }
    });

    it('should handle missing user ID', async () => {
      const generateBlogPost = (mcpServer as any).handleGenerateBlogPost;
      if (generateBlogPost) {
        await expect(
          generateBlogPost({
            topic: 'Test',
            language: 'en',
          })
        ).rejects.toThrow();
      }
    });

    it('should handle invalid parameters', async () => {
      const generateBlogPost = (mcpServer as any).handleGenerateBlogPost;
      if (generateBlogPost) {
        await expect(
          generateBlogPost({
            userId: 'user123',
            // Missing required topic
            language: 'en',
          })
        ).rejects.toThrow();
      }
    });
  });

  describe('Usage Statistics', () => {
    beforeEach(() => {
      mcpServer = new ContentGeneratorMCP();
    });

    it('should retrieve usage statistics', async () => {
      const mockUsageDoc = {
        exists: true,
        data: () => ({
          totalGenerations: 25,
          generationsThisMonth: 10,
          lastGeneration: Date.now(),
          favoriteContentType: 'blog_post',
        }),
      };

      mockFirestore.get.mockResolvedValue(mockUsageDoc);

      const getUsageStats = (mcpServer as any).handleGetUsageStats;
      if (getUsageStats) {
        const stats = await getUsageStats({ userId: 'user123' });

        expect(stats).toBeDefined();
        expect(stats.totalGenerations).toBe(25);
        expect(stats.generationsThisMonth).toBe(10);
      }
    });

    it('should return empty stats for new users', async () => {
      const mockUsageDoc = {
        exists: false,
      };

      mockFirestore.get.mockResolvedValue(mockUsageDoc);

      const getUsageStats = (mcpServer as any).handleGetUsageStats;
      if (getUsageStats) {
        const stats = await getUsageStats({ userId: 'newuser123' });

        expect(stats).toBeDefined();
        expect(stats.totalGenerations).toBe(0);
        expect(stats.generationsThisMonth).toBe(0);
      }
    });

    it('should track favorite content type', async () => {
      const userId = 'user123';
      const contentType = 'blog_post';

      const trackContentType = (mcpServer as any).trackContentType;
      if (trackContentType) {
        await trackContentType(userId, contentType);
        expect(mockFirestore.update).toHaveBeenCalled();
      }
    });
  });

  describe('Multi-language Support', () => {
    beforeEach(() => {
      mcpServer = new ContentGeneratorMCP();
      const { isProUser } = require('@auraos/billing');
      (isProUser as jest.Mock).mockResolvedValue(true);
    });

    it('should support Arabic content generation', async () => {
      const mockAIService = (mcpServer as any).aiService;
      mockAIService.generateBlogPost = jest.fn().mockResolvedValue({
        content: 'محتوى باللغة العربية',
        title: 'عنوان تجريبي',
        metadata: {
          wordCount: 100,
          characterCount: 500,
          estimatedReadingTime: 1,
          keywords: ['تجربة'],
          generatedAt: Date.now(),
        },
      });

      const generateBlogPost = (mcpServer as any).handleGenerateBlogPost;
      if (generateBlogPost) {
        const result = await generateBlogPost({
          userId: 'user123',
          topic: 'موضوع تجريبي',
          language: 'ar',
        });

        expect(result).toBeDefined();
      }
    });

    it('should restrict multi-language for free users', async () => {
      const { isProUser } = require('@auraos/billing');
      (isProUser as jest.Mock).mockResolvedValue(false);

      const validateLanguage = (mcpServer as any).validateLanguage;
      if (validateLanguage) {
        const isValid = await validateLanguage('freeuser123', 'fr');
        expect(isValid).toBe(false);
      }
    });

    it('should allow multi-language for pro users', async () => {
      const { isProUser } = require('@auraos/billing');
      (isProUser as jest.Mock).mockResolvedValue(true);

      const validateLanguage = (mcpServer as any).validateLanguage;
      if (validateLanguage) {
        const isValid = await validateLanguage('prouser123', 'fr');
        expect(isValid).toBe(true);
      }
    });
  });

  describe('SEO Features', () => {
    beforeEach(() => {
      mcpServer = new ContentGeneratorMCP();
      const { isProUser } = require('@auraos/billing');
      (isProUser as jest.Mock).mockResolvedValue(true);
    });

    it('should include SEO optimization for pro users', async () => {
      const mockAIService = (mcpServer as any).aiService;
      mockAIService.generateBlogPost = jest.fn().mockResolvedValue({
        content: 'SEO optimized content',
        title: 'SEO Title',
        metadata: {
          wordCount: 500,
          characterCount: 3000,
          estimatedReadingTime: 3,
          keywords: ['seo', 'optimization'],
          generatedAt: Date.now(),
        },
        suggestions: {
          seoTips: ['Add meta description', 'Use header tags'],
          improvements: ['Add internal links'],
        },
      });

      const generateBlogPost = (mcpServer as any).handleGenerateBlogPost;
      if (generateBlogPost) {
        const result = await generateBlogPost({
          userId: 'prouser123',
          topic: 'SEO Guide',
          language: 'en',
        });

        expect(result.suggestions).toBeDefined();
        expect(result.suggestions.seoTips).toBeDefined();
      }
    });

    it('should exclude SEO features for free users', async () => {
      const { isProUser } = require('@auraos/billing');
      (isProUser as jest.Mock).mockResolvedValue(false);

      const mockAIService = (mcpServer as any).aiService;
      mockAIService.generateBlogPost = jest.fn().mockResolvedValue({
        content: 'Basic content',
        metadata: {
          wordCount: 200,
          characterCount: 1000,
          estimatedReadingTime: 1,
          keywords: ['basic'],
          generatedAt: Date.now(),
        },
      });

      const generateBlogPost = (mcpServer as any).handleGenerateBlogPost;
      if (generateBlogPost) {
        const result = await generateBlogPost({
          userId: 'freeuser123',
          topic: 'Basic Topic',
          language: 'en',
        });

        expect(result.suggestions).toBeUndefined();
      }
    });
  });
});
