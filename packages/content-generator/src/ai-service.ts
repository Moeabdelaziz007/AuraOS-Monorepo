import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import type {
  ContentGenerationParams,
  GeneratedContent,
  BlogPostParams,
  SocialMediaParams,
  EmailTemplateParams,
} from './types';

/**
 * خدمة الذكاء الاصطناعي لتوليد المحتوى
 */
export class AIContentService {
  private gemini: GoogleGenerativeAI | null = null;
  private claude: Anthropic | null = null;
  private provider: 'gemini' | 'claude';

  constructor(provider: 'gemini' | 'claude' = 'gemini') {
    this.provider = provider;
    
    if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    } else if (provider === 'claude' && process.env.ANTHROPIC_API_KEY) {
      this.claude = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  /**
   * توليد محتوى عام
   */
  async generateContent(params: ContentGenerationParams): Promise<GeneratedContent> {
    const prompt = this.buildPrompt(params);
    const content = await this.callAI(prompt);
    
    return this.formatContent(content, params);
  }

  /**
   * توليد مقال مدونة
   */
  async generateBlogPost(params: BlogPostParams): Promise<GeneratedContent> {
    const prompt = this.buildBlogPostPrompt(params);
    const content = await this.callAI(prompt);
    
    return this.formatContent(content, {
      type: 'blog_post',
      topic: params.topic,
      style: params.style,
      length: params.length,
      language: params.language,
    });
  }

  /**
   * توليد منشور سوشيال ميديا
   */
  async generateSocialMediaPost(params: SocialMediaParams): Promise<GeneratedContent> {
    const prompt = this.buildSocialMediaPrompt(params);
    const content = await this.callAI(prompt);
    
    return this.formatContent(content, {
      type: 'social_media',
      topic: params.topic,
      style: params.style,
      language: params.language,
    });
  }

  /**
   * توليد قالب إيميل
   */
  async generateEmailTemplate(params: EmailTemplateParams): Promise<GeneratedContent> {
    const prompt = this.buildEmailPrompt(params);
    const content = await this.callAI(prompt);
    
    return this.formatContent(content, {
      type: 'email_template',
      topic: params.topic,
      style: params.style,
      language: params.language,
    });
  }

  /**
   * بناء prompt لمقال المدونة
   */
  private buildBlogPostPrompt(params: BlogPostParams): string {
    const lengthGuide = {
      short: '300-500 كلمة',
      medium: '800-1200 كلمة',
      long: '1500-2500 كلمة',
    };

    const styleGuide = {
      professional: 'احترافي ورسمي',
      casual: 'غير رسمي وودود',
      friendly: 'ودود ومحادث',
      formal: 'رسمي جداً',
      creative: 'إبداعي ومبتكر',
      persuasive: 'مقنع ومؤثر',
      informative: 'معلوماتي وتعليمي',
    };

    const language = params.language === 'ar' ? 'العربية' : 'الإنجليزية';
    const style = styleGuide[params.style || 'professional'];
    const length = lengthGuide[params.length || 'medium'];

    let prompt = `اكتب مقال مدونة ${style} باللغة ${language} عن: ${params.topic}\n\n`;
    prompt += `الطول المطلوب: ${length}\n\n`;

    if (params.includeIntro !== false) {
      prompt += `- ابدأ بمقدمة جذابة تشد انتباه القارئ\n`;
    }

    if (params.includeSections !== false) {
      const sections = params.sectionCount || 3;
      prompt += `- قسم المقال إلى ${sections} أقسام رئيسية مع عناوين فرعية\n`;
    }

    if (params.includeConclusion !== false) {
      prompt += `- اختم بخلاصة قوية ودعوة للعمل (Call to Action)\n`;
    }

    prompt += `\nتأكد من:\n`;
    prompt += `- استخدام لغة واضحة وسهلة الفهم\n`;
    prompt += `- إضافة أمثلة عملية عند الحاجة\n`;
    prompt += `- جعل المحتوى قيم ومفيد للقارئ\n`;
    prompt += `- استخدام فقرات قصيرة لسهولة القراءة\n`;

    return prompt;
  }

  /**
   * بناء prompt لمنشور سوشيال ميديا
   */
  private buildSocialMediaPrompt(params: SocialMediaParams): string {
    const platformGuide = {
      twitter: 'تويتر (280 حرف كحد أقصى)',
      facebook: 'فيسبوك (منشور متوسط الطول)',
      instagram: 'إنستغرام (مع وصف جذاب)',
      linkedin: 'لينكد إن (احترافي ومفصل)',
    };

    const language = params.language === 'ar' ? 'العربية' : 'الإنجليزية';
    const platform = platformGuide[params.platform];

    let prompt = `اكتب منشور ${platform} باللغة ${language} عن: ${params.topic}\n\n`;

    if (params.platform === 'twitter') {
      prompt += `- اجعله قصير ومباشر (أقل من 280 حرف)\n`;
    } else if (params.platform === 'instagram') {
      prompt += `- اكتب وصف جذاب يناسب صورة أو فيديو\n`;
    } else if (params.platform === 'linkedin') {
      prompt += `- اكتب محتوى احترافي يناسب بيئة العمل\n`;
    }

    if (params.includeHashtags !== false) {
      prompt += `- أضف 3-5 هاشتاغات مناسبة في النهاية\n`;
    }

    if (params.includeEmojis !== false) {
      prompt += `- استخدم إيموجي مناسب لجعل المنشور أكثر جاذبية\n`;
    }

    if (params.includeCallToAction !== false) {
      prompt += `- أضف دعوة للعمل (مثل: شارك رأيك، اترك تعليق، تابعنا)\n`;
    }

    return prompt;
  }

  /**
   * بناء prompt لقالب الإيميل
   */
  private buildEmailPrompt(params: EmailTemplateParams): string {
    const purposeGuide = {
      marketing: 'تسويقي',
      newsletter: 'نشرة إخبارية',
      announcement: 'إعلان',
      follow_up: 'متابعة',
      welcome: 'ترحيب',
    };

    const language = params.language === 'ar' ? 'العربية' : 'الإنجليزية';
    const purpose = purposeGuide[params.purpose];

    let prompt = `اكتب قالب إيميل ${purpose} باللغة ${language} عن: ${params.topic}\n\n`;

    if (params.includeSubject !== false) {
      prompt += `- ابدأ بعنوان (Subject) جذاب ومختصر\n`;
    }

    if (params.includePreheader !== false) {
      prompt += `- أضف نص معاينة (Preheader) يكمل العنوان\n`;
    }

    prompt += `\nمحتوى الإيميل:\n`;
    prompt += `- ابدأ بتحية شخصية\n`;
    prompt += `- اكتب محتوى واضح ومباشر\n`;
    prompt += `- استخدم فقرات قصيرة\n`;

    if (params.includeCallToAction !== false) {
      prompt += `- أضف زر أو رابط دعوة للعمل واضح\n`;
    }

    prompt += `- اختم بتوقيع احترافي\n`;

    return prompt;
  }

  /**
   * بناء prompt عام
   */
  private buildPrompt(params: ContentGenerationParams): string {
    const language = params.language === 'ar' ? 'العربية' : 'الإنجليزية';
    
    let prompt = `اكتب محتوى باللغة ${language} عن: ${params.topic}\n\n`;
    
    if (params.style) {
      prompt += `الأسلوب: ${params.style}\n`;
    }
    
    if (params.length) {
      prompt += `الطول: ${params.length}\n`;
    }
    
    if (params.keywords && params.keywords.length > 0) {
      prompt += `الكلمات المفتاحية: ${params.keywords.join(', ')}\n`;
    }
    
    if (params.targetAudience) {
      prompt += `الجمهور المستهدف: ${params.targetAudience}\n`;
    }

    return prompt;
  }

  /**
   * استدعاء الذكاء الاصطناعي
   */
  private async callAI(prompt: string): Promise<string> {
    if (this.provider === 'gemini' && this.gemini) {
      return await this.callGemini(prompt);
    } else if (this.provider === 'claude' && this.claude) {
      return await this.callClaude(prompt);
    }
    
    throw new Error('AI provider not configured');
  }

  /**
   * استدعاء Gemini
   */
  private async callGemini(prompt: string): Promise<string> {
    if (!this.gemini) {
      throw new Error('Gemini not initialized');
    }

    const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  /**
   * استدعاء Claude
   */
  private async callClaude(prompt: string): Promise<string> {
    if (!this.claude) {
      throw new Error('Claude not initialized');
    }

    const message = await this.claude.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Unexpected response format from Claude');
  }

  /**
   * تنسيق المحتوى المولد
   */
  private formatContent(
    content: string,
    params: ContentGenerationParams
  ): GeneratedContent {
    // استخراج العنوان إذا وجد
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : undefined;

    // حساب الإحصائيات
    const wordCount = content.split(/\s+/).length;
    const characterCount = content.length;
    const estimatedReadingTime = Math.ceil(wordCount / 200); // 200 كلمة في الدقيقة

    // استخراج الكلمات المفتاحية
    const keywords = params.keywords || this.extractKeywords(content);

    return {
      content,
      title,
      metadata: {
        wordCount,
        characterCount,
        estimatedReadingTime,
        keywords,
        generatedAt: Date.now(),
      },
      suggestions: {
        seoTips: this.generateSEOTips(content, params),
        improvements: this.generateImprovements(content),
        alternativeTitles: title ? this.generateAlternativeTitles(title, params.topic) : undefined,
      },
    };
  }

  /**
   * استخراج الكلمات المفتاحية
   */
  private extractKeywords(content: string): string[] {
    // منطق بسيط لاستخراج الكلمات المفتاحية
    // في الإنتاج، يمكن استخدام NLP أكثر تقدماً
    const words = content.toLowerCase().split(/\s+/);
    const wordFreq = new Map<string, number>();

    words.forEach((word) => {
      if (word.length > 4) {
        // تجاهل الكلمات القصيرة
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * توليد نصائح SEO
   */
  private generateSEOTips(content: string, params: ContentGenerationParams): string[] {
    const tips: string[] = [];

    if (content.length < 300) {
      tips.push('المحتوى قصير جداً. حاول الوصول إلى 300 كلمة على الأقل لتحسين SEO');
    }

    if (!content.includes(params.topic)) {
      tips.push(`تأكد من تضمين الموضوع الرئيسي "${params.topic}" في المحتوى`);
    }

    if (params.keywords && params.keywords.length > 0) {
      const missingKeywords = params.keywords.filter((kw) => !content.toLowerCase().includes(kw.toLowerCase()));
      if (missingKeywords.length > 0) {
        tips.push(`أضف هذه الكلمات المفتاحية: ${missingKeywords.join(', ')}`);
      }
    }

    return tips;
  }

  /**
   * توليد اقتراحات للتحسين
   */
  private generateImprovements(content: string): string[] {
    const improvements: string[] = [];

    const paragraphs = content.split('\n\n');
    if (paragraphs.some((p) => p.split(/\s+/).length > 100)) {
      improvements.push('بعض الفقرات طويلة جداً. حاول تقسيمها لفقرات أقصر');
    }

    if (!content.includes('?')) {
      improvements.push('أضف أسئلة لجعل المحتوى أكثر تفاعلية');
    }

    return improvements;
  }

  /**
   * توليد عناوين بديلة
   */
  private generateAlternativeTitles(currentTitle: string, topic: string): string[] {
    // في الإنتاج، يمكن استخدام AI لتوليد عناوين بديلة
    return [
      `دليل شامل: ${topic}`,
      `كل ما تحتاج معرفته عن ${topic}`,
      `${topic}: نصائح وأفكار عملية`,
    ];
  }
}
