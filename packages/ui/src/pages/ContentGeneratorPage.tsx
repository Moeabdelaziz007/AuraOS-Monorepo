import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '@auraos/firebase';
import { logger } from '../utils/logger';

type ContentType = 'blog_post' | 'social_media' | 'email_template';
type WritingStyle = 'professional' | 'casual' | 'friendly' | 'formal' | 'creative' | 'persuasive' | 'informative';
type ContentLength = 'short' | 'medium' | 'long';
type Language = 'ar' | 'en' | 'fr' | 'es';
type SocialPlatform = 'twitter' | 'facebook' | 'instagram' | 'linkedin';
type EmailPurpose = 'marketing' | 'newsletter' | 'announcement' | 'follow_up' | 'welcome';

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

interface UsageStats {
  generationsThisMonth: number;
  totalGenerations: number;
}

interface SubscriptionData {
  tier: 'free' | 'pro';
  status: string;
}

export const ContentGeneratorPage: React.FC = () => {
  const { user } = useAuth();
  const [contentType, setContentType] = useState<ContentType>('blog_post');
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState<WritingStyle>('professional');
  const [length, setLength] = useState<ContentLength>('medium');
  const [language, setLanguage] = useState<Language>('en');
  const [platform, setPlatform] = useState<SocialPlatform>('twitter');
  const [emailPurpose, setEmailPurpose] = useState<EmailPurpose>('marketing');
  
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Load user subscription and usage stats
  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      try {
        // Load subscription
        const subDoc = await getDoc(doc(db, 'subscriptions', user.uid));
        if (subDoc.exists()) {
          setSubscription(subDoc.data() as SubscriptionData);
        } else {
          setSubscription({ tier: 'free', status: 'active' });
        }

        // Load usage stats
        const usageDoc = await getDoc(doc(db, 'users', user.uid, 'usage', 'content-generator'));
        if (usageDoc.exists()) {
          setUsageStats(usageDoc.data() as UsageStats);
        } else {
          setUsageStats({ generationsThisMonth: 0, totalGenerations: 0 });
        }
      } catch (err) {
        logger.error('Error loading user data:', err);
      }
    };

    loadUserData();
  }, [user]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    if (!user) {
      setError('You must be logged in to generate content');
      return;
    }

    // Check usage limits for free users
    if (subscription?.tier === 'free' && usageStats) {
      if (usageStats.generationsThisMonth >= 10) {
        setShowUpgradeModal(true);
        return;
      }
      if (length !== 'short') {
        setError('Free users can only generate short content. Upgrade to Pro for medium and long content.');
        return;
      }
    }

    setLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const functions = getFunctions();
      const generateContent = httpsCallable(functions, 'generateContent');

      const params = {
        userId: user.uid,
        type: contentType,
        topic,
        style,
        length,
        language,
      };

      // Add type-specific parameters
      if (contentType === 'social_media') {
        params.platform = platform;
        params.includeHashtags = true;
        params.includeEmojis = true;
      } else if (contentType === 'email_template') {
        params.purpose = emailPurpose;
        params.includeSubject = true;
        params.includeCallToAction = true;
      } else if (contentType === 'blog_post') {
        params.includeIntro = true;
        params.includeConclusion = true;
        params.includeSections = true;
      }

      const result = await generateContent(params);
      const data = result.data as GeneratedContent;
      
      setGeneratedContent(data);

      // Refresh usage stats
      const usageDoc = await getDoc(doc(db, 'users', user.uid, 'usage', 'content-generator'));
      if (usageDoc.exists()) {
        setUsageStats(usageDoc.data() as UsageStats);
      }
    } catch (err: any) {
      logger.error('Error generating content:', err);
      setError(err.message || 'Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedContent) {
      const textToCopy = generatedContent.title 
        ? `${generatedContent.title}\n\n${generatedContent.content}`
        : generatedContent.content;
      
      navigator.clipboard.writeText(textToCopy);
      alert('Content copied to clipboard!');
    }
  };

  const handleExport = () => {
    if (generatedContent) {
      const textToExport = generatedContent.title 
        ? `${generatedContent.title}\n\n${generatedContent.content}`
        : generatedContent.content;
      
      const blob = new Blob([textToExport], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contentType}_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const maxGenerations = subscription?.tier === 'pro' ? '∞' : '10';
  const currentGenerations = usageStats?.generationsThisMonth || 0;
  const usagePercentage = subscription?.tier === 'pro' ? 0 : (currentGenerations / 10) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            AI Content Generator
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Generate high-quality content for blogs, social media, and emails
          </p>
        </div>

        {/* Usage Stats */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Usage this month
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentGenerations} / {maxGenerations}
              </p>
            </div>
            {subscription?.tier === 'free' && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2 font-semibold text-white transition-all hover:from-blue-600 hover:to-purple-600"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
          {subscription?.tier === 'free' && (
            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Form */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Generate Content
            </h2>

            {/* Content Type */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="blog_post">Blog Post</option>
                <option value="social_media">Social Media Post</option>
                <option value="email_template">Email Template</option>
              </select>
            </div>

            {/* Topic */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Topic / Description
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter your topic or a brief description..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Writing Style */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Writing Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as WritingStyle)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
                <option value="formal">Formal</option>
                <option value="creative">Creative</option>
                <option value="persuasive">Persuasive</option>
                <option value="informative">Informative</option>
              </select>
            </div>

            {/* Content Length */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Content Length
                {subscription?.tier === 'free' && (
                  <span className="ml-2 text-xs text-orange-500">(Free: Short only)</span>
                )}
              </label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value as ContentLength)}
                disabled={subscription?.tier === 'free'}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>

            {/* Language */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </select>
            </div>

            {/* Platform (for social media) */}
            {contentType === 'social_media' && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="twitter">Twitter</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>
            )}

            {/* Email Purpose */}
            {contentType === 'email_template' && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email Purpose
                </label>
                <select
                  value={emailPurpose}
                  onChange={(e) => setEmailPurpose(e.target.value as EmailPurpose)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="marketing">Marketing</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="announcement">Announcement</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="welcome">Welcome</option>
                </select>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-semibold text-white transition-all hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Content'}
            </button>
          </div>

          {/* Output Area */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Generated Content
              </h2>
              {generatedContent && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Copy
                  </button>
                  <button
                    onClick={handleExport}
                    className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Export
                  </button>
                </div>
              )}
            </div>

            {!generatedContent && !loading && (
              <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-gray-500 dark:text-gray-400">
                  Your generated content will appear here
                </p>
              </div>
            )}

            {loading && (
              <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Generating your content...
                  </p>
                </div>
              </div>
            )}

            {generatedContent && (
              <div className="space-y-4">
                {/* Title */}
                {generatedContent.title && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {generatedContent.title}
                    </h3>
                  </div>
                )}

                {/* Content */}
                <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-900">
                  <pre className="whitespace-pre-wrap font-sans text-gray-900 dark:text-white">
                    {generatedContent.content}
                  </pre>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-3 gap-4 rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Word Count</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {generatedContent.metadata.wordCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Characters</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {generatedContent.metadata.characterCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Reading Time</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {generatedContent.metadata.estimatedReadingTime} min
                    </p>
                  </div>
                </div>

                {/* Keywords */}
                {generatedContent.metadata.keywords.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Keywords
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.metadata.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* SEO Tips (Pro only) */}
                {subscription?.tier === 'pro' && generatedContent.suggestions?.seoTips && (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      SEO Tips
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {generatedContent.suggestions.seoTips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Upgrade to Pro
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              You&apos;ve reached your monthly limit of 10 generations. Upgrade to Aura Pro for unlimited content generation and advanced features!
            </p>
            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Unlimited generations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Medium & long content</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 dark:text-gray-300">SEO optimization</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Multi-language support</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 transition-all hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Maybe Later
              </button>
              <button
                onClick={() => window.location.href = '/pricing'}
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 font-semibold text-white transition-all hover:from-blue-600 hover:to-purple-600"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
