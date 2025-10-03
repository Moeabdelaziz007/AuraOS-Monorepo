# Content Generator UI - Implementation Guide

## Overview
The Content Generator UI is a React-based interface that allows users to generate AI-powered content for blogs, social media, and emails. It integrates with Firebase Cloud Functions and implements feature gating based on subscription tiers.

## Components

### ContentGeneratorPage (`packages/ui/src/pages/ContentGeneratorPage.tsx`)

A comprehensive page component that provides:

1. **Content Type Selection**
   - Blog Post
   - Social Media Post
   - Email Template

2. **Input Form**
   - Topic/Description textarea
   - Writing Style selector (Professional, Casual, Friendly, Formal, Creative, Persuasive, Informative)
   - Content Length selector (Short, Medium, Long)
   - Language selector (English, Arabic, French, Spanish)
   - Platform selector (for social media: Twitter, Facebook, Instagram, LinkedIn)
   - Email Purpose selector (for emails: Marketing, Newsletter, Announcement, Follow Up, Welcome)

3. **Usage Tracking**
   - Displays current month's usage (e.g., "7/10" for free users, "∞" for Pro)
   - Visual progress bar for free tier users
   - Upgrade button for free users

4. **Output Display**
   - Generated content with title (if applicable)
   - Metadata display (word count, character count, reading time)
   - Keywords/hashtags display
   - SEO tips (Pro users only)
   - Copy and Export buttons

5. **Feature Gating**
   - Free users: 10 generations/month, short content only
   - Pro users: Unlimited generations, all content lengths
   - Upgrade modal when limits are reached

## Firebase Cloud Function

### `generateContent` (`services/firebase/functions/src/content-generator.ts`)

A callable Cloud Function that:

1. **Authentication Check**
   - Verifies user is authenticated
   - Uses Firebase Auth context

2. **Usage Limit Validation**
   - Checks user's subscription tier from Firestore
   - Validates monthly usage against limits
   - Returns error if limit exceeded

3. **Content Generation**
   - Uses Google Gemini 1.5 Flash API
   - Generates content based on type (blog_post, social_media, email_template)
   - Returns structured JSON with content and metadata

4. **Usage Tracking**
   - Increments usage counter in Firestore
   - Logs generation in `content_generations` collection
   - Updates `users/{userId}/usage/content-generator` document

## Routes

Added to `packages/ui/src/App.tsx`:

```typescript
<Route
  path="/content-generator"
  element={
    <ProtectedRoute>
      <ContentGeneratorPage />
    </ProtectedRoute>
  }
/>
<Route path="/pricing" element={<PricingPage />} />
```

## Firestore Schema

### Subscriptions Collection
```
subscriptions/{userId}
  - tier: 'free' | 'pro'
  - status: 'active' | 'canceled' | 'past_due'
  - stripeCustomerId: string
  - stripeSubscriptionId: string
  - currentPeriodEnd: timestamp
```

### Usage Tracking
```
users/{userId}/usage/content-generator
  - generationsThisMonth: number
  - totalGenerations: number
  - lastGeneration: timestamp
```

### Content Generations Log
```
content_generations/{generationId}
  - userId: string
  - type: 'blog_post' | 'social_media' | 'email_template'
  - topic: string
  - timestamp: timestamp
  - metadata: {
      wordCount: number
      characterCount: number
      estimatedReadingTime: number
      keywords: string[]
    }
```

## Environment Variables

Required in Firebase Functions (`.env`):

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Required in UI (`.env`):

```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Installation

1. **Install Dependencies**
   ```bash
   # In Firebase Functions
   cd services/firebase/functions
   pnpm install
   
   # In UI package
   cd packages/ui
   pnpm install
   ```

2. **Set Environment Variables**
   - Copy `.env.example` to `.env` in both locations
   - Fill in the required values

3. **Deploy Firebase Functions**
   ```bash
   cd services/firebase/functions
   pnpm run deploy
   ```

4. **Run UI Development Server**
   ```bash
   cd packages/ui
   pnpm run dev
   ```

## Usage Flow

1. User navigates to `/content-generator`
2. User selects content type and fills in the form
3. User clicks "Generate Content"
4. Frontend calls `generateContent` Cloud Function
5. Function checks authentication and usage limits
6. Function generates content using Gemini AI
7. Function updates usage stats in Firestore
8. Generated content is displayed in the UI
9. User can copy or export the content

## Feature Gating Logic

### Free Tier
- Maximum 10 generations per month
- Only "short" content length allowed
- No SEO optimization tips
- Single language (English)

### Pro Tier
- Unlimited generations
- All content lengths (short, medium, long)
- SEO optimization tips included
- Multi-language support (English, Arabic, French, Spanish)
- Advanced features enabled

## Testing

1. **Test as Free User**
   - Create a test account without subscription
   - Generate content up to 10 times
   - Verify upgrade modal appears on 11th attempt
   - Verify only "short" length is available

2. **Test as Pro User**
   - Create a test account with Pro subscription
   - Generate unlimited content
   - Verify all lengths are available
   - Verify SEO tips are displayed

3. **Test Content Types**
   - Generate blog post with different styles and lengths
   - Generate social media posts for different platforms
   - Generate email templates for different purposes

## Next Steps

1. Add content history/library feature
2. Implement content editing and refinement
3. Add content templates and presets
4. Implement content scheduling integration
5. Add analytics dashboard for content performance
