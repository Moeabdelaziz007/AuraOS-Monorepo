import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

const db = admin.firestore();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ContentGenerationRequest {
  userId: string;
  type: 'blog_post' | 'social_media' | 'email_template';
  topic: string;
  style?: string;
  length?: 'short' | 'medium' | 'long';
  language?: 'ar' | 'en' | 'fr' | 'es';
  platform?: string;
  purpose?: string;
  includeHashtags?: boolean;
  includeEmojis?: boolean;
  includeSubject?: boolean;
  includeCallToAction?: boolean;
  includeIntro?: boolean;
  includeConclusion?: boolean;
  includeSections?: boolean;
}

interface GeneratedContent {
  content: string;
  title?: string;
  metadata: {
    wordCount: number;
    characterCount: number;
    estimatedReadingTime: number;
    keywords: string[];
    generatedAt: number;
  };
  suggestions?: {
    seoTips?: string[];
    improvements?: string[];
    alternativeTitles?: string[];
  };
}

// Check usage limits
async function checkUsageLimits(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  // Get subscription
  const subDoc = await db.collection('subscriptions').doc(userId).get();
  const subscription = subDoc.exists ? subDoc.data() : { tier: 'free', status: 'active' };

  // Get usage stats
  const usageDoc = await db.collection('users').doc(userId).collection('usage').doc('content-generator').get();
  const usage = usageDoc.exists ? usageDoc.data() : { generationsThisMonth: 0, totalGenerations: 0 };

  // Check limits for free tier
  if (subscription.tier === 'free') {
    if (usage.generationsThisMonth >= 10) {
      return {
        allowed: false,
        reason: 'Monthly generation limit reached. Upgrade to Pro for unlimited generations.',
      };
    }
  }

  return { allowed: true };
}

// Update usage stats
async function updateUsageStats(userId: string): Promise<void> {
  const usageRef = db.collection('users').doc(userId).collection('usage').doc('content-generator');
  const usageDoc = await usageRef.get();

  if (usageDoc.exists) {
    const data = usageDoc.data()!;
    await usageRef.update({
      generationsThisMonth: admin.firestore.FieldValue.increment(1),
      totalGenerations: admin.firestore.FieldValue.increment(1),
      lastGeneration: admin.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    await usageRef.set({
      generationsThisMonth: 1,
      totalGenerations: 1,
      lastGeneration: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

// Generate blog post
async function generateBlogPost(params: ContentGenerationRequest): Promise<GeneratedContent> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const lengthGuide = {
    short: '300-500 words',
    medium: '800-1200 words',
    long: '1500-2500 words',
  };

  const prompt = `Generate a ${params.style || 'professional'} blog post in ${params.language || 'en'} about: ${params.topic}

Target length: ${lengthGuide[params.length || 'medium']}

Requirements:
${params.includeIntro ? '- Include an engaging introduction' : ''}
${params.includeConclusion ? '- Include a strong conclusion' : ''}
${params.includeSections ? '- Organize content into clear sections with subheadings' : ''}

Format the response as JSON with this structure:
{
  "title": "Blog post title",
  "content": "Full blog post content with proper formatting",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  // Parse JSON response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response');
  }
  
  const parsed = JSON.parse(jsonMatch[0]);
  const content = parsed.content;
  const wordCount = content.split(/\s+/).length;
  const characterCount = content.length;
  const estimatedReadingTime = Math.ceil(wordCount / 200);

  return {
    content,
    title: parsed.title,
    metadata: {
      wordCount,
      characterCount,
      estimatedReadingTime,
      keywords: parsed.keywords || [],
      generatedAt: Date.now(),
    },
  };
}

// Generate social media post
async function generateSocialMediaPost(params: ContentGenerationRequest): Promise<GeneratedContent> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const platformGuides: Record<string, string> = {
    twitter: 'Keep it under 280 characters, punchy and engaging',
    facebook: 'Conversational tone, 1-2 paragraphs',
    instagram: 'Visual-focused, engaging caption with line breaks',
    linkedin: 'Professional tone, thought leadership style',
  };

  const prompt = `Generate a ${params.style || 'professional'} social media post for ${params.platform || 'twitter'} in ${params.language || 'en'} about: ${params.topic}

Platform guidelines: ${platformGuides[params.platform || 'twitter']}

Requirements:
${params.includeHashtags ? '- Include relevant hashtags' : ''}
${params.includeEmojis ? '- Use appropriate emojis' : ''}
${params.includeCallToAction ? '- Include a call-to-action' : ''}

Format the response as JSON with this structure:
{
  "content": "Social media post content",
  "hashtags": ["hashtag1", "hashtag2"]
}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response');
  }
  
  const parsed = JSON.parse(jsonMatch[0]);
  const content = parsed.content;
  const wordCount = content.split(/\s+/).length;
  const characterCount = content.length;

  return {
    content,
    metadata: {
      wordCount,
      characterCount,
      estimatedReadingTime: 1,
      keywords: parsed.hashtags || [],
      generatedAt: Date.now(),
    },
  };
}

// Generate email template
async function generateEmailTemplate(params: ContentGenerationRequest): Promise<GeneratedContent> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const purposeGuides: Record<string, string> = {
    marketing: 'Persuasive, benefit-focused, with clear CTA',
    newsletter: 'Informative, engaging, value-driven',
    announcement: 'Clear, concise, professional',
    follow_up: 'Friendly, reminder-focused, action-oriented',
    welcome: 'Warm, welcoming, onboarding-focused',
  };

  const prompt = `Generate a ${params.style || 'professional'} email template for ${params.purpose || 'marketing'} in ${params.language || 'en'} about: ${params.topic}

Purpose guidelines: ${purposeGuides[params.purpose || 'marketing']}

Requirements:
${params.includeSubject ? '- Include a compelling subject line' : ''}
${params.includeCallToAction ? '- Include a clear call-to-action' : ''}

Format the response as JSON with this structure:
{
  "subject": "Email subject line",
  "content": "Email body content with proper formatting",
  "keywords": ["keyword1", "keyword2"]
}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response');
  }
  
  const parsed = JSON.parse(jsonMatch[0]);
  const content = parsed.content;
  const wordCount = content.split(/\s+/).length;
  const characterCount = content.length;
  const estimatedReadingTime = Math.ceil(wordCount / 200);

  return {
    content,
    title: parsed.subject,
    metadata: {
      wordCount,
      characterCount,
      estimatedReadingTime,
      keywords: parsed.keywords || [],
      generatedAt: Date.now(),
    },
  };
}

// Main Cloud Function
export const generateContent = functions.https.onCall(async (data: ContentGenerationRequest, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = data.userId || context.auth.uid;

  // Validate input
  if (!data.type || !data.topic) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: type and topic');
  }

  // Check usage limits
  const usageCheck = await checkUsageLimits(userId);
  if (!usageCheck.allowed) {
    throw new functions.https.HttpsError('resource-exhausted', usageCheck.reason || 'Usage limit exceeded');
  }

  try {
    let result: GeneratedContent;

    // Generate content based on type
    switch (data.type) {
      case 'blog_post':
        result = await generateBlogPost(data);
        break;
      case 'social_media':
        result = await generateSocialMediaPost(data);
        break;
      case 'email_template':
        result = await generateEmailTemplate(data);
        break;
      default:
        throw new functions.https.HttpsError('invalid-argument', 'Invalid content type');
    }

    // Update usage stats
    await updateUsageStats(userId);

    // Log generation
    await db.collection('content_generations').add({
      userId,
      type: data.type,
      topic: data.topic,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: result.metadata,
    });

    return result;
  } catch (error: any) {
    console.error('Error generating content:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to generate content');
  }
});
