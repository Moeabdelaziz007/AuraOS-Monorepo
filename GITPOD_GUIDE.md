# 🚀 Gitpod Development Guide for AuraOS

## Quick Start

### 1. Join Gitpod Organization
Click here: [https://app.gitpod.io/join-organization/01996ea0-1f8c-7d52-9912-785f471adf2d](https://app.gitpod.io/join-organization/01996ea0-1f8c-7d52-9912-785f471adf2d)

### 2. Create New Workspace
After joining, create a new workspace from this repository:
```
https://github.com/Moeabdelaziz007/AuraOS-Monorepo
```

### 3. Automatic Setup
Gitpod will automatically:
- ✅ Install all dependencies
- ✅ Build the landing page
- ✅ Start development server
- ✅ Open preview in browser

## 🎯 What You'll Get

### Landing Page (Port 4321)
- **URL**: `http://localhost:4321`
- **Framework**: Astro + Tailwind CSS
- **Purpose**: Marketing site for AuraAI

### SelfOS App (Port 3000)
- **URL**: `http://localhost:3000`
- **Framework**: React + Firebase
- **Purpose**: Actual OS interface

## 🛠️ Development Commands

### In Gitpod Terminal:

```bash
# Navigate to landing page
cd apps/landing-page

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Features Available

### Landing Page Sections:
1. **Hero Section** - Main introduction
2. **AI Features** - 6 key capabilities
3. **System Requirements** - Hardware specs
4. **Beta Signup** - User registration
5. **Documentation** - Developer resources
6. **Comparison** - OS comparison table
7. **Footer** - Links and social media

### Design System:
- **Colors**: Blue (#0066ff), Purple (#6366f1), Cyan (#06b6d4)
- **Typography**: Modern, clean fonts
- **Layout**: Fully responsive
- **Animations**: Smooth transitions

## 🚀 Deployment Strategy

### Current Setup:
- **SelfOS App**: [https://selfos-62f70.web.app/](https://selfos-62f70.web.app/) ✅ Live
- **AuraAI Landing**: In development 🚧

### Target Architecture:
```
auraos.com (Landing Page)
    ↓ (Join Beta)
app.auraos.com (SelfOS App)
    ↓ (Login)
Dashboard (OS Interface)
```

## 🔧 Troubleshooting

### If Build Fails:
```bash
# Clear cache
rm -rf node_modules
rm -rf .astro
rm -rf dist

# Reinstall
npm install

# Try build again
npm run build
```

### If Ports Don't Open:
1. Check Gitpod ports panel
2. Make sure ports 4321 and 3000 are exposed
3. Try refreshing the browser

## 📞 Support

- **GitHub Issues**: Report problems
- **Discord**: Developer community
- **Email**: AuraOS team

---

**Happy Coding! 🎉**
