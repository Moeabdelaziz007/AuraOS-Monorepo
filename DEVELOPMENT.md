# 🚀 AuraOS Development Guide

## Quick Start with Gitpod

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/Moeabdelaziz007/AuraOS-Monorepo)

### What is Gitpod?
Gitpod provides ready-to-code development environments in the cloud. No local setup required!

### Features:
- ✅ **Pre-configured environment** with all dependencies
- ✅ **VS Code in browser** with extensions
- ✅ **Automatic port forwarding** for preview
- ✅ **Persistent workspaces** for your projects

## 🎯 Landing Page Development

### Current Status:
- **SelfOS App**: [https://selfos-62f70.web.app/](https://selfos-62f70.web.app/) ✅ Live
- **AuraAI Landing Page**: In development 🚧

### Architecture:
```
AuraOS-Monorepo/
├── apps/
│   ├── landing-page/     # Marketing site (Astro)
│   └── web/           # Main OS app (React)
├── packages/          # Shared components
└── services/          # Backend services
```

## 🛠️ Development Workflow

### 1. Open in Gitpod
Click the "Open in Gitpod" button above or visit:
[https://app.gitpod.io/join-organization/01996ea0-1f8c-7d52-9912-785f471adf2d](https://app.gitpod.io/join-organization/01996ea0-1f8c-7d52-9912-785f471adf2d)

### 2. Build Landing Page
```bash
cd apps/landing-page
npm install
npm run build
npm run dev
```

### 3. Preview
- Landing page will be available at `http://localhost:4321`
- Gitpod will automatically open the preview

## 📦 Deployment Strategy

### Landing Page (Marketing)
- **Framework**: Astro (Static Site)
- **Hosting**: Vercel/Netlify
- **Domain**: `auraos.com` (main marketing site)
- **Purpose**: Attract new users, showcase features

### Main App (OS)
- **Framework**: React (SPA)
- **Hosting**: Firebase Hosting
- **Domain**: `app.auraos.com` or `selfos-62f70.web.app`
- **Purpose**: Actual OS interface for logged-in users

## 🔄 User Journey

1. **Discovery**: User visits `auraos.com` (landing page)
2. **Interest**: User sees features and signs up for beta
3. **Access**: User gets redirected to `app.auraos.com` (main app)
4. **Usage**: User logs in and uses the actual OS

## 🎨 Design System

### Colors:
- **Primary Blue**: `#0066ff`
- **Primary Purple**: `#6366f1`
- **Accent Cyan**: `#06b6d4`

### Typography:
- **Headings**: Bold, gradient text
- **Body**: Clean, readable fonts
- **Code**: Monospace for examples

## 🚀 Next Steps

1. **Fix build issues** in Gitpod environment
2. **Deploy landing page** to production
3. **Connect with existing SelfOS app**
4. **Add analytics and tracking**
5. **Optimize for SEO**

## 📞 Support

- **GitHub Issues**: Report bugs and feature requests
- **Discord**: Join our developer community
- **Email**: Contact the AuraOS team

---

**Built with ❤️ by the AuraOS Team**
