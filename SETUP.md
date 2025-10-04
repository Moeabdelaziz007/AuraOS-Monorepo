# 🛠️ AuraOS Setup Guide | دليل الإعداد

Complete setup guide for AuraOS development environment.

## 📋 Prerequisites | المتطلبات

### Required Software
- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Git** >= 2.0.0

### Optional Tools
- **VS Code** (recommended IDE)
- **Firebase CLI** (for deployment)
- **Docker** (for containerized development)

## 🚀 Installation Steps | خطوات التثبيت

### 1. Install Package Manager | تثبيت مدير الحزم

```bash
# Install pnpm globally if not already installed
npm install -g pnpm@latest

# Verify installation
pnpm --version
```

### 2. Clone Repository | استنساخ المشروع

```bash
# Clone the repository
git clone https://github.com/Moeabdelaziz007/AuraOS-Monorepo.git

# Navigate to project directory
cd AuraOS-Monorepo
```

### 3. Install Dependencies | تثبيت المكتبات

```bash
# Install all dependencies for all packages
pnpm install

# This will install dependencies for:
# - Root workspace
# - All packages in packages/
# - All apps in apps/
# - All services in services/
```

### 4. Build Packages | بناء الحزم

```bash
# Build all packages in correct order
pnpm -r build

# Or build specific package
pnpm --filter @auraos/core build
pnpm --filter @auraos/ui build
```

### 5. Environment Configuration | إعداد المتغيرات البيئية

#### Create Environment File

```bash
# Copy example environment file
cp .env.example .env
```

#### Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing one
3. Go to Project Settings > General
4. Scroll to "Your apps" section
5. Click "Add app" > Web
6. Copy the configuration values

#### Configure AI Services (Optional)

1. **Google Gemini**: Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **z.ai**: Get API key from [z.ai](https://z.ai)

#### Update .env File

```env
# Firebase Configuration (Get from Firebase Console)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# AI API Keys (Optional - Get from respective providers)
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_ZAI_API_KEY=your_zai_api_key

# Application Settings
VITE_APP_NAME=AuraOS
VITE_APP_VERSION=1.0.0
```

### 6. Start Development Server | تشغيل خادم التطوير

```bash
# Option 1: Run desktop UI only
pnpm dev:desktop

# Option 2: Run all packages in parallel
pnpm dev

# Option 3: Run specific package
pnpm --filter @auraos/ui dev

# Option 4: Navigate to package directory
cd packages/ui
pnpm dev
```

The application will be available at:
- **Desktop UI**: [http://localhost:5173](http://localhost:5173)

### 7. Verify Installation | التحقق من التثبيت

```bash
# Check TypeScript compilation
pnpm typecheck

# Run linting
pnpm lint

# Run tests
pnpm test

# Check build
pnpm build
```

## 📦 هيكل المشروع

```
AuraOS-Monorepo/
├── packages/
│   ├── ai/              # MCP Infrastructure
│   │   ├── src/mcp/
│   │   │   ├── types.ts
│   │   │   ├── server.ts
│   │   │   ├── gateway.ts
│   │   │   └── client.ts
│   │   └── package.json
│   │
│   ├── core/            # Business Logic
│   │   ├── src/
│   │   │   ├── ai/      # AI Services
│   │   │   │   ├── config.ts
│   │   │   │   ├── services/
│   │   │   │   ├── mcp-integration.ts
│   │   │   │   └── mcp-commands.ts
│   │   │   ├── learning/  # Learning Loop
│   │   │   │   └── learning-loop.service.ts
│   │   │   └── mcp/     # MCP Servers
│   │   │       ├── filesystem.ts
│   │   │       └── emulator.ts
│   │   └── package.json
│   │
│   ├── firebase/        # Data Layer
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── firebase.ts
│   │   │   ├── services/
│   │   │   │   └── firestore.service.ts
│   │   │   └── types/
│   │   │       └── user.ts
│   │   └── package.json
│   │
│   ├── hooks/           # React Hooks
│   │   ├── src/
│   │   │   ├── useAI.ts
│   │   │   ├── useMCP.ts
│   │   │   ├── useLearningLoop.ts
│   │   │   └── useUserProfile.ts
│   │   └── package.json
│   │
│   └── ui/              # User Interface
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── contexts/
│       │   └── App.tsx
│       └── package.json
│
├── .env                 # Environment Variables (gitignored)
├── .env.example         # Example Environment Variables
├── .gitignore
├── pnpm-workspace.yaml
└── package.json
```

## 🔧 Available Commands | الأوامر المتاحة

### Development Commands | أوامر التطوير

```bash
# Run all packages in development mode
pnpm dev

# Run desktop UI only
pnpm dev:desktop

# Run terminal app
pnpm dev:terminal

# Run debugger app
pnpm dev:debugger
```

### Build Commands | أوامر البناء

```bash
# Build all packages
pnpm build

# Build desktop UI
pnpm build:desktop

# Build terminal app
pnpm build:terminal

# Production build with optimizations
pnpm build:production

# Build with bundle analysis
pnpm build:analyze
```

### Testing Commands | أوامر الاختبار

```bash
# Run all tests
pnpm test

# Run unit tests
pnpm test:unit

# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch

# Run specific test suite
pnpm test:mcp
pnpm test:apps
```

### Code Quality Commands | أوامر جودة الكود

```bash
# Lint all packages
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code with Prettier
pnpm format

# Type check all packages
pnpm typecheck
```

### Deployment Commands | أوامر النشر

```bash
# Deploy to Firebase
pnpm deploy

# Deploy desktop only
firebase deploy --only hosting
```

### Maintenance Commands | أوامر الصيانة

```bash
# Clean all build artifacts
pnpm clean

# Remove node_modules and reinstall
pnpm clean
rm -rf node_modules
pnpm install

# Update dependencies
pnpm update

# Check for outdated packages
pnpm outdated
```

### التنظيف
```bash
# حذف جميع ملفات البناء
pnpm -r clean

# حذف node_modules
rm -rf node_modules packages/*/node_modules
pnpm install
```

## 🎯 الميزات الجاهزة

### ✅ Authentication
- تسجيل دخول بـ Google
- وضع الضيف
- إدارة الجلسات

### ✅ AI Integration
- Gemini API (Google)
- z.ai API
- محادثة ذكية
- توليد أكواد BASIC
- تحليل وإصلاح الأكواد

### ✅ MCP Tools
- FileSystem Server (قراءة/كتابة/بحث)
- Emulator Server (تشغيل BASIC)
- AI-MCP Bridge (ربط AI مع الأدوات)

### ✅ Learning Loop
- تتبع سلوك المستخدم
- توليد رؤى ذكية
- اكتشاف الأنماط
- تحليل الجلسات

### ✅ Desktop OS
- إدارة النوافذ
- شريط المهام
- سطح المكتب
- فتح النوافذ في المنتصف ✨

## 🐛 حل المشاكل

### المشكلة: النوافذ تفتح تحت
**الحل:** تم إصلاحها! النوافذ الآن تفتح في منتصف الشاشة.

### المشكلة: خطأ في الـ imports
**الحل:** تأكد من بناء جميع الـ packages:
```bash
pnpm -r build
```

### المشكلة: API Keys لا تعمل
**الحل:** تأكد من ملف `.env` موجود وفيه المفاتيح الصحيحة.

### المشكلة: Firebase Connection Error
**الحل:** تأكد من صحة بيانات Firebase في `.env`.

## 📚 الموارد

- [Core Package README](./packages/core/README.md)
- [Hooks Package README](./packages/hooks/README.md)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)

## 🚀 الخطوات التالية

1. ✅ تثبيت المكتبات
2. ✅ إعداد المتغيرات البيئية
3. ✅ بناء المشروع
4. ✅ تشغيل التطبيق
5. 🎯 بناء AI Terminal Assistant
6. 🎯 بناء AI Notes App
7. 🎯 إضافة المزيد من MCP Servers

## 📞 الدعم

إذا واجهت أي مشاكل، تواصل معنا أو افتح issue على GitHub.

---

**تم بناؤه بـ ❤️ بواسطة فريق AuraOS**
