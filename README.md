# 🌟 AuraOS - AI-Powered Web Operating System | نظام تشغيل ذكي بالذكاء الاصطناعي

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.7-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

</div>

<div dir="rtl">

نظام تشغيل ويب حديث مدعوم بالذكاء الاصطناعي، يجمع بين واجهة سطح مكتب كلاسيكية وقدرات AI متقدمة. مبني بـ React، TypeScript، Tailwind CSS، وshadcn/ui.

</div>

---

**A modern web-based operating system powered by AI, combining a classic desktop interface with advanced AI capabilities. Built with React, TypeScript, Tailwind CSS, and shadcn/ui.**

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
- **إدارة نوافذ**: نظام نوافذ كامل مع drag & drop
- **شريط مهام**: taskbar تفاعلي مع start menu
- **سطح مكتب**: desktop قابل للتخصيص مع icons
- **تطبيقات**: Dashboard, Terminal, File Manager
- **Window Controls**: Minimize, Maximize, Close, Resize
- **Multi-Window Support**: تشغيل عدة تطبيقات في نفس الوقت

### 🔐 Authentication
- **Google Sign-In**: تسجيل دخول سريع
- **Guest Mode**: استخدام بدون حساب
- **Firebase Auth**: نظام آمن ومتكامل

## 🚀 Quick Start | البدء السريع

### Prerequisites | المتطلبات
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

### Installation | التثبيت

```bash
# 1. Clone the repository | استنساخ المشروع
git clone https://github.com/Moeabdelaziz007/AuraOS-Monorepo.git
cd AuraOS-Monorepo

# 2. Install dependencies | تثبيت المكتبات
pnpm install

# 3. Setup environment variables | إعداد المتغيرات البيئية
cp .env.example .env
# Edit .env and add your API keys | عدّل .env وأضف المفاتيح

# 4. Build all packages | بناء جميع الحزم
pnpm -r build

# 5. Start development server | تشغيل خادم التطوير
pnpm dev:desktop
# or
pnpm --filter @auraos/ui dev
```

### Available Scripts | الأوامر المتاحة

```bash
# Development
pnpm dev                    # Run all packages in dev mode
pnpm dev:desktop           # Run desktop UI only
pnpm dev:terminal          # Run terminal app only

# Building
pnpm build                 # Build all packages
pnpm build:desktop         # Build desktop UI only
pnpm build:production      # Production build

# Testing
pnpm test                  # Run all tests
pnpm test:unit            # Run unit tests
pnpm test:e2e             # Run E2E tests
pnpm test:coverage        # Run tests with coverage

# Code Quality
pnpm lint                  # Lint all packages
pnpm lint:fix             # Fix linting issues
pnpm format               # Format code with Prettier
pnpm typecheck            # Type check all packages

# Deployment
pnpm deploy               # Deploy to Firebase
```

## 📖 Documentation | التوثيق

### English Documentation
- 📘 [Setup Guide](./SETUP.md) - Detailed setup instructions
- 📗 [Development Guide](./DEVELOPMENT.md) - Development workflow
- 📕 [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Deployment instructions
- 📙 [UI/UX Improvement Plan](./UI_IMPROVEMENT_PLAN_CONCISE.md) - Design roadmap
- 📓 [API Documentation](./docs/API.md) - API reference

### Arabic Documentation | التوثيق العربي
- 📘 [دليل الإعداد التفصيلي](./SETUP.md)
- 📗 [ملخص سريع](./QUICK_SUMMARY_AR.md)
- 📕 [الملخص النهائي](./FINAL_SUMMARY_AR.md)

### Package Documentation
- [Core Package](./packages/core/README.md) - Business logic & AI services
- [UI Package](./packages/ui/README.md) - Desktop interface
- [Hooks Package](./packages/hooks/README.md) - React hooks
- [Firebase Package](./packages/firebase/README.md) - Data layer
- [AI Package](./packages/ai/README.md) - MCP infrastructure

## 🎯 Project Status | حالة المشروع

### ✅ Phase 1 - Core Infrastructure | المرحلة 1 - البنية الأساسية
- [x] Clean Architecture with Monorepo structure
- [x] Security hardening (removed hardcoded keys)
- [x] Complete authentication system (Firebase Auth)
- [x] AI Integration (Gemini + z.ai)
- [x] MCP Tools Infrastructure
- [x] Learning Loop System
- [x] Desktop OS with Window Manager
- [x] Window centering and positioning
- [x] Drag & drop window management
- [x] Taskbar with start menu
- [x] Desktop icons and shortcuts

### ✅ Phase 2 - Core Applications | المرحلة 2 - التطبيقات الأساسية
- [x] Dashboard App (System monitoring)
- [x] Terminal App (BASIC interpreter)
- [x] File Manager App (File system navigation)
- [x] shadcn/ui component library integration
- [x] Lucide React icons
- [x] Tailwind CSS styling

### 🚧 Phase 3 - Advanced Features | المرحلة 3 - الميزات المتقدمة
- [ ] Dark/Light theme toggle
- [ ] Settings app
- [ ] Notes app with AI assistance
- [ ] Notification system
- [ ] Global search (Cmd+K)
- [ ] Keyboard shortcuts
- [ ] Window snapping
- [ ] Multi-desktop support

### 🎨 Phase 4 - UI/UX Enhancements | المرحلة 4 - تحسينات الواجهة
- [ ] Modern design system
- [ ] Smooth animations (Framer Motion)
- [ ] Accessibility improvements
- [ ] Responsive design
- [ ] Custom wallpapers
- [ ] Icon customization

## 🏗️ Project Structure | هيكل المشروع

```
AuraOS-Monorepo/
├── packages/
│   ├── ai/          # MCP Infrastructure & AI Tools
│   ├── core/        # Business Logic + AI Services
│   ├── firebase/    # Firebase Integration & Data Layer
│   ├── hooks/       # React Hooks (useMCP, useLearningLoop)
│   └── ui/          # Desktop UI & Applications
│       ├── src/
│       │   ├── apps/           # Desktop Applications
│       │   │   ├── DashboardApp.tsx
│       │   │   ├── TerminalApp.tsx
│       │   │   └── FileManagerApp.tsx
│       │   ├── components/     # UI Components
│       │   │   ├── ui/         # shadcn/ui components
│       │   │   ├── Desktop.tsx
│       │   │   ├── Taskbar.tsx
│       │   │   ├── Window.tsx
│       │   │   └── WindowManager.tsx
│       │   ├── contexts/       # React Contexts
│       │   ├── hooks/          # UI-specific hooks
│       │   ├── pages/          # Application pages
│       │   └── DesktopOS.tsx   # Main OS component
├── apps/            # Standalone applications
├── services/        # Backend services
├── tools/           # Development tools
├── .env             # Environment Variables (gitignored)
├── .env.example     # Example Configuration
├── SETUP.md         # Setup Guide
└── README.md        # This file
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

## 🔑 Environment Variables | المتغيرات البيئية

The project requires the following API keys and configuration:

### Firebase Configuration (Required)
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### AI Services (Optional)
```env
VITE_GEMINI_API_KEY=your_gemini_key
VITE_ZAI_API_KEY=your_zai_key
```

See `.env.example` for complete configuration details.

### Getting API Keys

1. **Firebase**: [console.firebase.google.com](https://console.firebase.google.com)
2. **Gemini**: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
3. **z.ai**: [z.ai](https://z.ai)

## 🛠️ Tech Stack | التقنيات المستخدمة

### Frontend
- **React 18.2** - UI library
- **TypeScript 5.3** - Type safety
- **Tailwind CSS 3.4** - Styling
- **shadcn/ui** - Component library
- **Lucide React** - Icons
- **Vite 5.0** - Build tool

### Backend & Services
- **Firebase 10.7** - Authentication & Database
- **Firestore** - NoSQL database
- **Firebase Auth** - User authentication

### AI & Tools
- **Google Gemini** - AI chat & code generation
- **z.ai** - Alternative AI provider
- **MCP (Model Context Protocol)** - Tool integration

### Development
- **pnpm** - Package manager
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🤝 Contributing | المساهمة

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support | الدعم

- **GitHub Issues**: [Open an issue](https://github.com/Moeabdelaziz007/AuraOS-Monorepo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Moeabdelaziz007/AuraOS-Monorepo/discussions)
- **Documentation**: Check the [docs](./docs) folder

## 📄 License | الترخيص

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments | شكر وتقدير

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [Lucide](https://lucide.dev/) - Icon library
- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI capabilities

---

<div align="center">

**Made with ❤️ by Mohamed Abdelaziz | صُنع بـ ❤️ بواسطة محمد عبدالعزيز**

[![GitHub](https://img.shields.io/badge/GitHub-Moeabdelaziz007-181717?logo=github)](https://github.com/Moeabdelaziz007)
[![Documentation](https://img.shields.io/badge/Docs-Read%20Now-blue)](./SETUP.md)

[🌟 Star this repo](https://github.com/Moeabdelaziz007/AuraOS-Monorepo) • [🐛 Report Bug](https://github.com/Moeabdelaziz007/AuraOS-Monorepo/issues) • [✨ Request Feature](https://github.com/Moeabdelaziz007/AuraOS-Monorepo/issues)

</div>
