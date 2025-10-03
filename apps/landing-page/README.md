# AuraAI Landing Page

A modern, responsive landing page for AuraAI - The Future of Operating Systems.

## Features

- 🚀 **Fast & Modern** - Built with Astro for optimal performance
- 📱 **Fully Responsive** - Looks great on all devices
- 🎨 **Beautiful Design** - Modern UI with Tailwind CSS
- ⚡ **SEO Optimized** - Static site generation for better search rankings
- 🔧 **Developer Friendly** - Easy to customize and extend

## Sections

- **Hero Section** - Eye-catching introduction with call-to-action
- **AI Features** - Showcase of intelligent capabilities
- **System Requirements** - Hardware specifications
- **Beta Signup** - User registration form
- **Developer Documentation** - API and SDK information
- **OS Comparison** - Feature comparison table
- **Footer** - Links and social media

## Tech Stack

- **Astro** - Static site generator
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type safety and better DX
- **Responsive Design** - Mobile-first approach

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

```bash
# Start dev server with hot reload
npm run dev

# Build static site
npm run build

# Preview built site
npm run preview
```

## Project Structure

```
apps/landing-page/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Hero.astro
│   │   ├── Features.astro
│   │   ├── Requirements.astro
│   │   ├── BetaSignup.astro
│   │   ├── Documentation.astro
│   │   ├── Comparison.astro
│   │   └── Footer.astro
│   ├── layouts/            # Page layouts
│   │   └── Layout.astro
│   └── pages/              # Route pages
│       └── index.astro
├── public/                 # Static assets
│   └── favicon.svg
├── astro.config.mjs        # Astro configuration
├── package.json
└── README.md
```

## Customization

### Colors

The design uses a custom color palette defined in Tailwind:

- **Primary Blue**: `#0066ff` (aura-blue)
- **Primary Purple**: `#6366f1` (aura-purple)  
- **Accent Cyan**: `#06b6d4` (aura-cyan)

### Content

Edit the components in `src/components/` to customize:

- Hero section text and buttons
- Feature descriptions
- System requirements
- Beta signup form
- Documentation links
- Comparison table data

### Styling

All styling is done with Tailwind CSS classes. The design is fully responsive and uses:

- Gradient backgrounds
- Glass morphism effects
- Smooth animations
- Hover states
- Mobile-first responsive design

## Deployment

### Static Hosting

The site builds to static files that can be deployed to:

- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**
- **AWS S3**
- **Any static hosting provider**

### Build Command

```bash
npm run build
```

This creates a `dist/` folder with all static files ready for deployment.

## Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **Core Web Vitals**: Excellent
- **Bundle Size**: Minimal (Astro's zero-JS by default)
- **Loading Speed**: < 1s on fast connections

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

**Built with ❤️ by the AuraOS Team**
