# @auraos/content-generator

مولد محتوى ذكي بالذكاء الاصطناعي لـ AuraOS.

## ✨ الميزات

### 📝 أنواع المحتوى المدعومة
- **مقالات المدونة** - مقالات احترافية بأطوال مختلفة
- **منشورات السوشيال ميديا** - محتوى جذاب لجميع المنصات
- **قوالب الإيميل** - رسائل بريد إلكتروني احترافية
- **وصف المنتجات** - أوصاف تسويقية مقنعة

### 🎨 أساليب الكتابة
- احترافي (Professional)
- غير رسمي (Casual)
- ودود (Friendly)
- رسمي (Formal)
- إبداعي (Creative)
- مقنع (Persuasive)
- معلوماتي (Informative)

### 🌍 اللغات المدعومة
- العربية
- الإنجليزية
- الفرنسية
- الإسبانية

## 📦 التثبيت

```bash
pnpm add @auraos/content-generator
```

## 🚀 الاستخدام

### توليد مقال مدونة

```typescript
import { AIContentService } from '@auraos/content-generator';

const aiService = new AIContentService('gemini');

const blogPost = await aiService.generateBlogPost({
  topic: 'الذكاء الاصطناعي في التعليم',
  style: 'professional',
  length: 'medium',
  language: 'ar',
  includeIntro: true,
  includeConclusion: true,
  includeSections: true,
  sectionCount: 3,
});

console.log(blogPost.content);
console.log(`عدد الكلمات: ${blogPost.metadata.wordCount}`);
console.log(`وقت القراءة: ${blogPost.metadata.estimatedReadingTime} دقيقة`);
```

### توليد منشور سوشيال ميديا

```typescript
const socialPost = await aiService.generateSocialMediaPost({
  topic: 'إطلاق منتج جديد',
  platform: 'twitter',
  style: 'casual',
  language: 'ar',
  includeHashtags: true,
  includeEmojis: true,
  includeCallToAction: true,
});

console.log(socialPost.content);
```

### توليد قالب إيميل

```typescript
const emailTemplate = await aiService.generateEmailTemplate({
  topic: 'عرض خاص للعملاء',
  purpose: 'marketing',
  style: 'professional',
  language: 'ar',
  includeSubject: true,
  includePreheader: true,
  includeCallToAction: true,
});

console.log(emailTemplate.content);
```

## 🔌 استخدام MCP Server

```typescript
import { ContentGeneratorMCP } from '@auraos/content-generator';

const server = new ContentGeneratorMCP();
await server.start();
```

### الأدوات المتاحة

#### `generate_blog_post`
توليد مقال مدونة احترافي.

**المعاملات:**
- `userId` (مطلوب) - معرف المستخدم
- `topic` (مطلوب) - موضوع المقال
- `style` (اختياري) - أسلوب الكتابة
- `length` (اختياري) - طول المقال (short/medium/long)
- `language` (اختياري) - لغة المحتوى (ar/en)

#### `generate_social_media_post`
توليد منشور سوشيال ميديا.

**المعاملات:**
- `userId` (مطلوب) - معرف المستخدم
- `topic` (مطلوب) - موضوع المنشور
- `platform` (مطلوب) - المنصة (twitter/facebook/instagram/linkedin)
- `style` (اختياري) - أسلوب الكتابة
- `language` (اختياري) - لغة المحتوى

#### `generate_email_template`
توليد قالب إيميل.

**المعاملات:**
- `userId` (مطلوب) - معرف المستخدم
- `topic` (مطلوب) - موضوع الإيميل
- `purpose` (مطلوب) - الغرض (marketing/newsletter/announcement/follow_up/welcome)
- `style` (اختياري) - أسلوب الكتابة
- `language` (اختياري) - لغة المحتوى

#### `get_usage_stats`
الحصول على إحصائيات الاستخدام.

**المعاملات:**
- `userId` (مطلوب) - معرف المستخدم

## 💰 حدود الباقات

### Free Tier
- ✅ 10 توليدات شهرياً
- ✅ محتوى قصير فقط
- ❌ ميزات متقدمة
- ❌ تحسين SEO
- ❌ لغات متعددة

### Aura Pro
- ✅ توليدات غير محدودة
- ✅ محتوى بجميع الأطوال
- ✅ ميزات متقدمة
- ✅ تحسين SEO
- ✅ لغات متعددة

## 🔧 المتغيرات البيئية

```env
# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# أو Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## 📊 البيانات المُرجعة

```typescript
interface GeneratedContent {
  content: string;              // المحتوى المولد
  title?: string;               // العنوان (إن وجد)
  metadata: {
    wordCount: number;          // عدد الكلمات
    characterCount: number;     // عدد الأحرف
    estimatedReadingTime: number; // وقت القراءة بالدقائق
    keywords: string[];         // الكلمات المفتاحية
    generatedAt: number;        // وقت التوليد
  };
  suggestions?: {
    seoTips?: string[];         // نصائح SEO
    improvements?: string[];    // اقتراحات للتحسين
    alternativeTitles?: string[]; // عناوين بديلة
  };
}
```

## 🧪 الاختبار

```bash
pnpm test
```

## 📝 الترخيص

MIT

---

**صُنع بـ ❤️ لـ AuraOS**
