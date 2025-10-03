/**
 * أنواع المحتوى المدعومة
 */
export type ContentType = 'blog_post' | 'social_media' | 'email_template' | 'product_description';

/**
 * أنماط الكتابة
 */
export type WritingStyle = 
  | 'professional'
  | 'casual'
  | 'friendly'
  | 'formal'
  | 'creative'
  | 'persuasive'
  | 'informative';

/**
 * أطوال المحتوى
 */
export type ContentLength = 'short' | 'medium' | 'long';

/**
 * اللغات المدعومة
 */
export type Language = 'ar' | 'en' | 'fr' | 'es';

/**
 * معلمات توليد المحتوى
 */
export interface ContentGenerationParams {
  type: ContentType;
  topic: string;
  style?: WritingStyle;
  length?: ContentLength;
  language?: Language;
  keywords?: string[];
  targetAudience?: string;
  tone?: string;
}

/**
 * نتيجة توليد المحتوى
 */
export interface GeneratedContent {
  content: string;
  title?: string;
  metadata: {
    wordCount: number;
    characterCount: number;
    estimatedReadingTime: number; // بالدقائق
    keywords: string[];
    generatedAt: number;
  };
  suggestions?: {
    seoTips?: string[];
    improvements?: string[];
    alternativeTitles?: string[];
  };
}

/**
 * معلمات توليد مقال
 */
export interface BlogPostParams {
  topic: string;
  style?: WritingStyle;
  length?: ContentLength;
  language?: Language;
  includeIntro?: boolean;
  includeConclusion?: boolean;
  includeSections?: boolean;
  sectionCount?: number;
}

/**
 * معلمات توليد منشور سوشيال ميديا
 */
export interface SocialMediaParams {
  topic: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin';
  style?: WritingStyle;
  language?: Language;
  includeHashtags?: boolean;
  includeEmojis?: boolean;
  includeCallToAction?: boolean;
}

/**
 * معلمات توليد قالب إيميل
 */
export interface EmailTemplateParams {
  topic: string;
  purpose: 'marketing' | 'newsletter' | 'announcement' | 'follow_up' | 'welcome';
  style?: WritingStyle;
  language?: Language;
  includeSubject?: boolean;
  includePreheader?: boolean;
  includeCallToAction?: boolean;
}

/**
 * إحصائيات الاستخدام
 */
export interface UsageStats {
  totalGenerations: number;
  generationsThisMonth: number;
  lastGeneration?: number;
  favoriteContentType?: ContentType;
}

/**
 * حدود الاستخدام حسب الباقة
 */
export interface UsageLimits {
  maxGenerationsPerMonth: number;
  maxContentLength: ContentLength;
  advancedFeatures: boolean;
  seoOptimization: boolean;
  multiLanguage: boolean;
}

/**
 * حدود الباقات
 */
export const TIER_USAGE_LIMITS: Record<'free' | 'pro', UsageLimits> = {
  free: {
    maxGenerationsPerMonth: 10,
    maxContentLength: 'short',
    advancedFeatures: false,
    seoOptimization: false,
    multiLanguage: false,
  },
  pro: {
    maxGenerationsPerMonth: -1, // غير محدود
    maxContentLength: 'long',
    advancedFeatures: true,
    seoOptimization: true,
    multiLanguage: true,
  },
};
