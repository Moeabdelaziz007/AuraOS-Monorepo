import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as admin from 'firebase-admin';
import { isProUser } from '@auraos/billing';
import type { UserSubscription } from '@auraos/billing';
import { AIContentService } from '../ai-service';
import type {
  BlogPostParams,
  SocialMediaParams,
  EmailTemplateParams,
  UsageStats,
} from '../types';
import { TIER_USAGE_LIMITS } from '../types';

/**
 * ContentGeneratorMCP Server
 * خادم MCP لتوليد المحتوى بالذكاء الاصطناعي
 */
export class ContentGeneratorMCP {
  private server: Server;
  private firestore: admin.firestore.Firestore;
  private aiService: AIContentService;

  constructor() {
    this.server = new Server(
      {
        name: 'content-generator-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // تهيئة Firebase
    if (!admin.apps.length) {
      admin.initializeApp();
    }
    this.firestore = admin.firestore();

    // تهيئة خدمة الذكاء الاصطناعي
    this.aiService = new AIContentService('gemini');

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // قائمة الأدوات المتاحة
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'generate_blog_post',
          description: 'توليد مقال مدونة احترافي (Pro: محتوى طويل + SEO، Free: محتوى قصير)',
          inputSchema: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                description: 'معرف المستخدم',
              },
              topic: {
                type: 'string',
                description: 'موضوع المقال',
              },
              style: {
                type: 'string',
                enum: ['professional', 'casual', 'friendly', 'formal', 'creative', 'persuasive', 'informative'],
                description: 'أسلوب الكتابة',
              },
              length: {
                type: 'string',
                enum: ['short', 'medium', 'long'],
                description: 'طول المقال',
              },
              language: {
                type: 'string',
                enum: ['ar', 'en'],
                description: 'لغة المحتوى',
              },
            },
            required: ['userId', 'topic'],
          },
        },
        {
          name: 'generate_social_media_post',
          description: 'توليد منشور سوشيال ميديا جذاب',
          inputSchema: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                description: 'معرف المستخدم',
              },
              topic: {
                type: 'string',
                description: 'موضوع المنشور',
              },
              platform: {
                type: 'string',
                enum: ['twitter', 'facebook', 'instagram', 'linkedin'],
                description: 'المنصة المستهدفة',
              },
              style: {
                type: 'string',
                enum: ['professional', 'casual', 'friendly'],
                description: 'أسلوب الكتابة',
              },
              language: {
                type: 'string',
                enum: ['ar', 'en'],
                description: 'لغة المحتوى',
              },
            },
            required: ['userId', 'topic', 'platform'],
          },
        },
        {
          name: 'generate_email_template',
          description: 'توليد قالب إيميل احترافي',
          inputSchema: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                description: 'معرف المستخدم',
              },
              topic: {
                type: 'string',
                description: 'موضوع الإيميل',
              },
              purpose: {
                type: 'string',
                enum: ['marketing', 'newsletter', 'announcement', 'follow_up', 'welcome'],
                description: 'الغرض من الإيميل',
              },
              style: {
                type: 'string',
                enum: ['professional', 'casual', 'friendly', 'formal'],
                description: 'أسلوب الكتابة',
              },
              language: {
                type: 'string',
                enum: ['ar', 'en'],
                description: 'لغة المحتوى',
              },
            },
            required: ['userId', 'topic', 'purpose'],
          },
        },
        {
          name: 'get_usage_stats',
          description: 'الحصول على إحصائيات الاستخدام والحدود',
          inputSchema: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                description: 'معرف المستخدم',
              },
            },
            required: ['userId'],
          },
        },
      ],
    }));

    // معالجة استدعاءات الأدوات
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'generate_blog_post':
          return await this.generateBlogPost(args);
        case 'generate_social_media_post':
          return await this.generateSocialMediaPost(args);
        case 'generate_email_template':
          return await this.generateEmailTemplate(args);
        case 'get_usage_stats':
          return await this.getUsageStats(args);
        default:
          throw new Error(`أداة غير معروفة: ${name}`);
      }
    });
  }

  /**
   * الحصول على اشتراك المستخدم
   */
  private async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const userDoc = await this.firestore.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return null;
    }

    return userDoc.data()?.subscription || null;
  }

  /**
   * الحصول على إحصائيات الاستخدام
   */
  private async getUsageStats(args: any) {
    const { userId } = args;

    const userDoc = await this.firestore.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const subscription = userData?.subscription;
    const usage: UsageStats = userData?.contentGeneratorUsage || {
      totalGenerations: 0,
      generationsThisMonth: 0,
    };

    const tier = subscription?.tier || 'free';
    const limits = TIER_USAGE_LIMITS[tier];
    const isPro = isProUser(subscription);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            subscription: {
              tier,
              isPro,
            },
            usage: {
              totalGenerations: usage.totalGenerations,
              generationsThisMonth: usage.generationsThisMonth,
              limit: limits.maxGenerationsPerMonth === -1 ? 'unlimited' : limits.maxGenerationsPerMonth,
              remaining: limits.maxGenerationsPerMonth === -1 
                ? 'unlimited' 
                : Math.max(0, limits.maxGenerationsPerMonth - usage.generationsThisMonth),
            },
            limits: {
              maxGenerationsPerMonth: limits.maxGenerationsPerMonth === -1 ? 'unlimited' : limits.maxGenerationsPerMonth,
              maxContentLength: limits.maxContentLength,
              advancedFeatures: limits.advancedFeatures,
              seoOptimization: limits.seoOptimization,
              multiLanguage: limits.multiLanguage,
            },
          }),
        },
      ],
    };
  }

  /**
   * التحقق من حدود الاستخدام
   */
  private async checkUsageLimits(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await this.getUserSubscription(userId);
    const tier = subscription?.tier || 'free';
    const limits = TIER_USAGE_LIMITS[tier];

    // Pro لديه استخدام غير محدود
    if (limits.maxGenerationsPerMonth === -1) {
      return { allowed: true };
    }

    // التحقق من عدد التوليدات هذا الشهر
    const userDoc = await this.firestore.collection('users').doc(userId).get();
    const usage: UsageStats = userDoc.data()?.contentGeneratorUsage || {
      totalGenerations: 0,
      generationsThisMonth: 0,
    };

    if (usage.generationsThisMonth >= limits.maxGenerationsPerMonth) {
      return {
        allowed: false,
        reason: `لقد وصلت إلى الحد الأقصى من ${limits.maxGenerationsPerMonth} توليدات شهرياً. قم بالترقية إلى Aura Pro للحصول على توليدات غير محدودة.`,
      };
    }

    return { allowed: true };
  }

  /**
   * تحديث إحصائيات الاستخدام
   */
  private async updateUsageStats(userId: string): Promise<void> {
    const userRef = this.firestore.collection('users').doc(userId);
    
    await userRef.set(
      {
        contentGeneratorUsage: {
          totalGenerations: admin.firestore.FieldValue.increment(1),
          generationsThisMonth: admin.firestore.FieldValue.increment(1),
          lastGeneration: Date.now(),
        },
      },
      { merge: true }
    );
  }

  /**
   * توليد مقال مدونة
   */
  private async generateBlogPost(args: any) {
    const { userId, topic, style, length, language } = args;

    // التحقق من حدود الاستخدام
    const { allowed, reason } = await this.checkUsageLimits(userId);
    if (!allowed) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: reason,
              upgradeRequired: true,
            }),
          },
        ],
      };
    }

    // التحقق من حدود الطول للمستخدمين المجانيين
    const subscription = await this.getUserSubscription(userId);
    const tier = subscription?.tier || 'free';
    const limits = TIER_USAGE_LIMITS[tier];

    if (length === 'long' && limits.maxContentLength !== 'long') {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'المحتوى الطويل متاح فقط لمستخدمي Aura Pro. قم بالترقية للوصول إلى هذه الميزة.',
              upgradeRequired: true,
            }),
          },
        ],
      };
    }

    try {
      // توليد المحتوى
      const params: BlogPostParams = {
        topic,
        style: style || 'professional',
        length: length || 'medium',
        language: language || 'ar',
        includeIntro: true,
        includeConclusion: true,
        includeSections: true,
      };

      const result = await this.aiService.generateBlogPost(params);

      // تحديث إحصائيات الاستخدام
      await this.updateUsageStats(userId);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              content: result.content,
              title: result.title,
              metadata: result.metadata,
              suggestions: limits.seoOptimization ? result.suggestions : undefined,
            }),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'حدث خطأ أثناء توليد المحتوى',
            }),
          },
        ],
      };
    }
  }

  /**
   * توليد منشور سوشيال ميديا
   */
  private async generateSocialMediaPost(args: any) {
    const { userId, topic, platform, style, language } = args;

    // التحقق من حدود الاستخدام
    const { allowed, reason } = await this.checkUsageLimits(userId);
    if (!allowed) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: reason,
              upgradeRequired: true,
            }),
          },
        ],
      };
    }

    try {
      // توليد المحتوى
      const params: SocialMediaParams = {
        topic,
        platform,
        style: style || 'casual',
        language: language || 'ar',
        includeHashtags: true,
        includeEmojis: true,
        includeCallToAction: true,
      };

      const result = await this.aiService.generateSocialMediaPost(params);

      // تحديث إحصائيات الاستخدام
      await this.updateUsageStats(userId);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              content: result.content,
              metadata: result.metadata,
            }),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'حدث خطأ أثناء توليد المحتوى',
            }),
          },
        ],
      };
    }
  }

  /**
   * توليد قالب إيميل
   */
  private async generateEmailTemplate(args: any) {
    const { userId, topic, purpose, style, language } = args;

    // التحقق من حدود الاستخدام
    const { allowed, reason } = await this.checkUsageLimits(userId);
    if (!allowed) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: reason,
              upgradeRequired: true,
            }),
          },
        ],
      };
    }

    try {
      // توليد المحتوى
      const params: EmailTemplateParams = {
        topic,
        purpose,
        style: style || 'professional',
        language: language || 'ar',
        includeSubject: true,
        includePreheader: true,
        includeCallToAction: true,
      };

      const result = await this.aiService.generateEmailTemplate(params);

      // تحديث إحصائيات الاستخدام
      await this.updateUsageStats(userId);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              content: result.content,
              metadata: result.metadata,
            }),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'حدث خطأ أثناء توليد المحتوى',
            }),
          },
        ],
      };
    }
  }

  /**
   * بدء خادم MCP
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('ContentGeneratorMCP server started');
  }
}

// بدء الخادم إذا تم تشغيله مباشرة
if (require.main === module) {
  const server = new ContentGeneratorMCP();
  server.start().catch(console.error);
}
