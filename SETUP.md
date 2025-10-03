# دليل الإعداد - AuraOS Setup Guide

## 📋 المتطلبات

- Node.js 18+ 
- pnpm 8+
- Git

## 🚀 خطوات التثبيت

### 1. تثبيت المكتبات

```bash
# تثبيت pnpm إذا لم يكن مثبتاً
npm install -g pnpm

# تثبيت جميع المكتبات
pnpm install

# بناء جميع الـ packages
pnpm -r build
```

### 2. إعداد المتغيرات البيئية

انسخ ملف `.env.example` إلى `.env`:

```bash
cp .env.example .env
```

ثم عدّل الملف وأضف المفاتيح:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyCiZQHxCQZ0Jy_PjUTBX1cdJ7YfHnsJ8zQ
VITE_FIREBASE_AUTH_DOMAIN=selfos-62f70.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=selfos-62f70
VITE_FIREBASE_STORAGE_BUCKET=selfos-62f70.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=693748251235
VITE_FIREBASE_APP_ID=1:693748251235:web:4fe7e5cefae61f127e1656
VITE_FIREBASE_MEASUREMENT_ID=G-GNFLCQJX48

# AI API Keys
VITE_GEMINI_API_KEY=AIzaSyBYjIqWUoNj8ZmQ1CGc_AofAqN-8oBQ-iI
VITE_ZAI_API_KEY=4e4ab4737d0b4f0ca810ae233d4cbad3.BY1p4wRAwHCezeMh

# Application Settings
VITE_APP_NAME=AuraOS
VITE_APP_VERSION=1.0.0
```

### 3. تشغيل التطبيق

```bash
# تشغيل UI في وضع التطوير
cd packages/ui
pnpm dev

# أو من الجذر
pnpm --filter @auraos/ui dev
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

## 🔧 الأوامر المتاحة

### بناء المشروع
```bash
# بناء جميع الـ packages
pnpm -r build

# بناء package معين
pnpm --filter @auraos/core build
```

### التطوير
```bash
# تشغيل UI
pnpm --filter @auraos/ui dev

# مراقبة التغييرات في core
pnpm --filter @auraos/core dev
```

### الاختبار
```bash
# تشغيل جميع الاختبارات
pnpm -r test

# اختبار package معين
pnpm --filter @auraos/core test
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
