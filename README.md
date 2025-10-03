# 🌟 AuraOS - نظام تشغيل ذكي بالذكاء الاصطناعي

<div dir="rtl">

نظام تشغيل ويب حديث مدعوم بالذكاء الاصطناعي، يجمع بين واجهة سطح مكتب كلاسيكية وقدرات AI متقدمة.

</div>

## ✨ الميزات الرئيسية

### 🤖 ذكاء اصطناعي متقدم
- **دعم متعدد المزودين**: Gemini (Google) + z.ai
- **محادثة ذكية**: تفاعل طبيعي مع النظام
- **توليد أكواد**: تحويل الأوامر الطبيعية إلى BASIC
- **تحليل وإصلاح**: تحليل الأكواد واقتراح تحسينات

### 🔧 MCP Tools (Model Context Protocol)
- **FileSystem Server**: قراءة/كتابة/بحث في الملفات
- **Emulator Server**: تشغيل أكواد BASIC
- **AI-MCP Bridge**: ربط ذكي بين AI والأدوات

### 🧠 Learning Loop
- **تتبع ذكي**: مراقبة سلوك المستخدم
- **رؤى تلقائية**: توليد insights من الأنماط
- **تحليل الجلسات**: فهم عميق لاستخدام النظام

### 🖥️ Desktop OS
- **إدارة نوافذ**: نظام نوافذ كامل
- **شريط مهام**: taskbar تفاعلي
- **سطح مكتب**: desktop قابل للتخصيص
- **تطبيقات**: Terminal, Files, Notes, AI Chat, Settings

### 🔐 Authentication
- **Google Sign-In**: تسجيل دخول سريع
- **Guest Mode**: استخدام بدون حساب
- **Firebase Auth**: نظام آمن ومتكامل

## 🚀 البدء السريع

```bash
# 1. استنساخ المشروع
git clone https://github.com/Moeabdelaziz007/AuraOS-Monorepo.git
cd AuraOS-Monorepo

# 2. تثبيت المكتبات
pnpm install

# 3. إعداد المتغيرات البيئية
cp .env.example .env
# عدّل .env وأضف المفاتيح

# 4. بناء المشروع
pnpm -r build

# 5. تشغيل التطبيق
pnpm --filter @auraos/ui dev

# 6. نشر تلقائي (Automated Deployment)
npm run auto-deploy
```

### 🚀 Automated Deployment

The project includes automated deployment that:
- ✅ Commits and pushes changes to GitHub
- ✅ Builds the project
- ✅ Deploys to Firebase Hosting
- ✅ Updates Firestore Rules

**Quick Deploy:**
```bash
npm run auto-deploy
```

**Custom Commit Message:**
```bash
./scripts/auto-deploy.sh "feat: your message"
```

See [Automation Guide](./docs/AUTOMATION.md) for details.

## 📖 التوثيق الكامل

- 📘 [دليل الإعداد التفصيلي](./SETUP.md)
- 📗 [Core Package Documentation](./packages/core/README.md)
- 📕 [Hooks Package Documentation](./packages/hooks/README.md)
- 🚀 [Automated Deployment Guide](./docs/AUTOMATION.md)

## 🎯 ما تم إنجازه

### ✅ المرحلة 1 - البنية الأساسية
- [x] معمارية نظيفة (Clean Architecture)
- [x] إزالة المفاتيح المشفرة (Security Fix)
- [x] نظام المصادقة الكامل
- [x] تكامل AI (Gemini + z.ai)
- [x] MCP Tools Infrastructure
- [x] Learning Loop System
- [x] Desktop OS مع Window Manager
- [x] إصلاح فتح النوافذ في المنتصف ✨

### 🎯 المرحلة 2 - التطبيقات
- [ ] AI Terminal Assistant
- [ ] AI Notes App
- [ ] Voice Transcription
- [ ] Semantic Search

## 🏗️ هيكل المشروع

```
AuraOS-Monorepo/
├── packages/
│   ├── ai/          # MCP Infrastructure
│   ├── core/        # Business Logic + AI Services
│   ├── firebase/    # Data Layer
│   ├── hooks/       # React Hooks
│   └── ui/          # User Interface
├── .env             # Environment Variables (gitignored)
├── .env.example     # Example Configuration
├── SETUP.md         # دليل الإعداد التفصيلي
└── README.md        # هذا الملف
```

## 💡 أمثلة الاستخدام

### استخدام AI

```typescript
import { aiService } from '@auraos/core';

const response = await aiService.chat([
  { role: 'user', content: 'مرحباً' }
]);
```

### استخدام MCP Tools

```typescript
import { mcpCommands } from '@auraos/core';

const content = await mcpCommands.file.read('/path/to/file.txt');
const result = await mcpCommands.emulator.execute('اطبع مرحبا');
```

### استخدام React Hooks

```typescript
import { useMCP } from '@auraos/hooks';

function MyComponent() {
  const { file, emulator, loading } = useMCP();
  // استخدم الأدوات...
}
```

## 🔑 المفاتيح المطلوبة

يحتاج المشروع إلى:
- Firebase Configuration (7 متغيرات)
- Gemini API Key
- z.ai API Key

انظر `.env.example` للتفاصيل الكاملة.

## 📞 الدعم

- **GitHub Issues**: [فتح issue](https://github.com/Moeabdelaziz007/AuraOS-Monorepo/issues)
- **Documentation**: [docs.auraos.dev](https://docs.auraos.dev)

## 📄 الترخيص

MIT License

---

<div align="center">

**صُنع بـ ❤️ بواسطة Mohamed Abdelaziz**

[GitHub](https://github.com/Moeabdelaziz007) • [التوثيق](./SETUP.md) • [المساهمة](./CONTRIBUTING.md)

</div>
