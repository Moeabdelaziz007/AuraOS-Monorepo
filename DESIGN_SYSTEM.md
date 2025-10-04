# 🎨 AuraOS Design System

Complete design system guidelines for colors, typography, spacing, and components.

## Table of Contents
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing System](#spacing-system)
- [Shadows & Elevation](#shadows--elevation)
- [Border Radius](#border-radius)
- [Animations](#animations)
- [Icons](#icons)
- [Component Guidelines](#component-guidelines)
- [Dark Mode](#dark-mode)
- [Accessibility](#accessibility)

---

## Color Palette

### Primary Colors

#### Light Mode
```css
/* Primary - Main brand color */
--primary: 220.9 39.3% 11%;           /* #1a1f2e - Dark blue-gray */
--primary-foreground: 210 20% 98%;    /* #f8f9fa - Almost white */

/* Secondary - Supporting color */
--secondary: 220 14.3% 95.9%;         /* #f1f3f5 - Light gray */
--secondary-foreground: 220.9 39.3% 11%; /* #1a1f2e - Dark blue-gray */

/* Accent - Highlight color */
--accent: 220 14.3% 95.9%;            /* #f1f3f5 - Light gray */
--accent-foreground: 220.9 39.3% 11%; /* #1a1f2e - Dark blue-gray */
```

#### Dark Mode
```css
/* Primary - Main brand color */
--primary: 210 20% 98%;               /* #f8f9fa - Almost white */
--primary-foreground: 220.9 39.3% 11%; /* #1a1f2e - Dark blue-gray */

/* Secondary - Supporting color */
--secondary: 215 27.9% 16.9%;         /* #1f2937 - Dark gray */
--secondary-foreground: 210 20% 98%;  /* #f8f9fa - Almost white */

/* Accent - Highlight color */
--accent: 215 27.9% 16.9%;            /* #1f2937 - Dark gray */
--accent-foreground: 210 20% 98%;     /* #f8f9fa - Almost white */
```

### Semantic Colors

```css
/* Success - Green */
--success: 142 76% 36%;               /* #16a34a */
--success-foreground: 0 0% 100%;      /* #ffffff */

/* Warning - Yellow/Orange */
--warning: 38 92% 50%;                /* #f59e0b */
--warning-foreground: 0 0% 0%;        /* #000000 */

/* Error/Destructive - Red */
--destructive: 0 84.2% 60.2%;         /* #ef4444 */
--destructive-foreground: 210 20% 98%; /* #f8f9fa */

/* Info - Blue */
--info: 217 91% 60%;                  /* #3b82f6 */
--info-foreground: 0 0% 100%;         /* #ffffff */
```

### Neutral Colors

```css
/* Background colors */
--background: 0 0% 100%;              /* #ffffff - White */
--foreground: 224 71.4% 4.1%;         /* #0a0f1e - Very dark blue */

/* Card colors */
--card: 0 0% 100%;                    /* #ffffff - White */
--card-foreground: 224 71.4% 4.1%;    /* #0a0f1e - Very dark blue */

/* Popover colors */
--popover: 0 0% 100%;                 /* #ffffff - White */
--popover-foreground: 224 71.4% 4.1%; /* #0a0f1e - Very dark blue */

/* Muted colors */
--muted: 220 14.3% 95.9%;             /* #f1f3f5 - Light gray */
--muted-foreground: 220 8.9% 46.1%;   /* #6b7280 - Medium gray */

/* Border & Input */
--border: 220 13% 91%;                /* #e5e7eb - Light border */
--input: 220 13% 91%;                 /* #e5e7eb - Light border */
--ring: 224 71.4% 4.1%;               /* #0a0f1e - Focus ring */
```

### Desktop-Specific Colors

```css
/* Desktop gradient background */
--desktop-gradient-start: 262 83% 58%;  /* #667eea - Purple */
--desktop-gradient-end: 271 76% 53%;    /* #764ba2 - Deep purple */

/* Taskbar */
--taskbar-bg: 0 0% 0% / 0.8;           /* rgba(0, 0, 0, 0.8) */
--taskbar-hover: 0 0% 100% / 0.2;      /* rgba(255, 255, 255, 0.2) */
--taskbar-active: 0 0% 100% / 0.3;     /* rgba(255, 255, 255, 0.3) */

/* Window */
--window-titlebar: 0 0% 96%;           /* #f5f5f5 - Light gray */
--window-titlebar-active: 0 0% 90%;    /* #e5e5e5 - Slightly darker */
--window-border: 0 0% 82%;             /* #d0d0d0 - Border gray */

/* Window controls (macOS style) */
--window-close: 0 100% 67%;            /* #ff5f57 - Red */
--window-minimize: 45 100% 59%;        /* #ffbd2e - Yellow */
--window-maximize: 134 61% 48%;        /* #28c840 - Green */
```

### Chart Colors

```css
--chart-1: 12 76% 61%;                /* #e76f51 - Coral */
--chart-2: 173 58% 39%;               /* #2a9d8f - Teal */
--chart-3: 197 37% 24%;               /* #264653 - Dark blue */
--chart-4: 43 74% 66%;                /* #e9c46a - Yellow */
--chart-5: 27 87% 67%;                /* #f4a261 - Orange */
```

---

## Typography

### Font Families

#### System Fonts (Default)
```css
/* Sans-serif - Primary UI font */
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
             'Helvetica Neue', sans-serif;

/* Monospace - Code/Terminal font */
--font-mono: 'Consolas', 'Monaco', 'Courier New', 'Menlo', 
             'Liberation Mono', monospace;

/* Serif - Optional for content */
--font-serif: 'Georgia', 'Cambria', 'Times New Roman', 'Times', serif;
```

#### Recommended Custom Fonts

**Option 1: Inter (Modern, Clean)**
```html
<!-- Add to index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

```css
/* Update CSS variable */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Option 2: Poppins (Friendly, Rounded)**
```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

```css
--font-sans: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Option 3: IBM Plex Sans (Technical, Professional)**
```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

```css
--font-sans: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Option 4: Geist (Modern, Optimized)**
```bash
# Install via npm
npm install geist
```

```tsx
// Import in app
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

export default function RootLayout({ children }) {
  return (
    <html className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

```css
--font-sans: var(--font-geist-sans);
--font-mono: var(--font-geist-mono);
```

#### Monospace Fonts for Terminal

**Option 1: JetBrains Mono (Recommended)**
```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```css
--font-mono: 'JetBrains Mono', 'Consolas', 'Monaco', monospace;
```

**Option 2: Fira Code (With Ligatures)**
```html
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```css
--font-mono: 'Fira Code', 'Consolas', 'Monaco', monospace;
```

**Option 3: Source Code Pro**
```html
<link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```css
--font-mono: 'Source Code Pro', 'Consolas', 'Monaco', monospace;
```

#### Arabic Font Support

For bilingual support (Arabic + English):

```html
<!-- Tajawal - Modern Arabic font -->
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap" rel="stylesheet">

<!-- Cairo - Popular Arabic font -->
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap" rel="stylesheet">

<!-- IBM Plex Sans Arabic -->
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

```css
/* For Arabic content */
[dir="rtl"] {
  --font-sans: 'Tajawal', 'Cairo', 'IBM Plex Sans Arabic', sans-serif;
}

/* Or use font-family directly */
.arabic-text {
  font-family: 'Tajawal', sans-serif;
}
```

#### Font Loading Strategy

**1. Preload Critical Fonts**
```html
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
```

**2. Font Display Strategy**
```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap; /* or 'optional' for better performance */
  font-style: normal;
}
```

**3. Subset Fonts (Reduce Size)**
```html
<!-- Only load Latin characters -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&subset=latin&display=swap" rel="stylesheet">
```

#### Variable Fonts (Recommended)

Variable fonts reduce file size and provide smooth weight transitions:

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
}

/* Use any weight between 100-900 */
.custom-weight {
  font-weight: 450; /* Any value! */
}
```

### Font Sizes

```css
/* Scale: 1.250 (Major Third) */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
```

### Font Weights

```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### Line Heights

```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### Typography Scale & Usage

#### Headings

```tsx
// Display - Hero sections
<h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl">
  Hero Title
</h1>

// H1 - Page titles
<h1 className="text-4xl font-bold tracking-tight">
  Page Title
</h1>

// H2 - Section titles
<h2 className="text-3xl font-semibold tracking-tight">
  Section Title
</h2>

// H3 - Subsection titles
<h3 className="text-2xl font-semibold">
  Subsection Title
</h3>

// H4 - Card/Component titles
<h4 className="text-xl font-semibold">
  Card Title
</h4>

// H5 - Small headings
<h5 className="text-lg font-medium">
  Small Heading
</h5>

// H6 - Tiny headings
<h6 className="text-base font-medium">
  Tiny Heading
</h6>
```

#### Body Text

```tsx
// Large body text
<p className="text-lg leading-relaxed">
  Large paragraph text for emphasis
</p>

// Regular body text (default)
<p className="text-base leading-normal">
  Regular paragraph text
</p>

// Small body text
<p className="text-sm leading-normal">
  Small paragraph text
</p>

// Extra small text
<p className="text-xs leading-tight">
  Extra small text for captions
</p>

// Muted text
<p className="text-sm text-muted-foreground">
  Helper or secondary text
</p>
```

#### Labels & UI Text

```tsx
// Form labels
<label className="text-sm font-medium leading-none">
  Form Label
</label>

// Button text
<button className="text-sm font-medium">
  Button Text
</button>

// Badge text
<span className="text-xs font-semibold uppercase tracking-wide">
  Badge
</span>

// Tooltip text
<span className="text-xs">
  Tooltip text
</span>
```

#### Code & Monospace

```tsx
// Inline code
<code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">
  const code = true;
</code>

// Code block
<pre className="font-mono text-sm bg-muted p-4 rounded-lg overflow-x-auto">
  <code>
    function example() {'{'}
      return "Hello World";
    {'}'}
  </code>
</pre>

// Terminal text
<div className="font-mono text-sm text-green-400 bg-black p-4">
  $ npm install
</div>
```

#### Special Text Styles

```tsx
// Emphasized text
<em className="italic">Emphasized text</em>
<strong className="font-semibold">Strong text</strong>

// Underlined text
<span className="underline">Underlined text</span>

// Strikethrough
<span className="line-through">Strikethrough text</span>

// Uppercase
<span className="uppercase tracking-wide">Uppercase</span>

// Lowercase
<span className="lowercase">lowercase</span>

// Capitalize
<span className="capitalize">capitalize each word</span>

// Truncate
<p className="truncate">
  Very long text that will be truncated with ellipsis...
</p>

// Line clamp (2 lines)
<p className="line-clamp-2">
  Long text that will be clamped to 2 lines with ellipsis...
</p>
```

#### Letter Spacing (Tracking)

```tsx
// Tighter
<span className="tracking-tighter">Tighter spacing</span>

// Tight
<span className="tracking-tight">Tight spacing</span>

// Normal (default)
<span className="tracking-normal">Normal spacing</span>

// Wide
<span className="tracking-wide">Wide spacing</span>

// Wider
<span className="tracking-wider">Wider spacing</span>

// Widest
<span className="tracking-widest">Widest spacing</span>
```

#### Text Alignment

```tsx
// Left (default)
<p className="text-left">Left aligned</p>

// Center
<p className="text-center">Center aligned</p>

// Right
<p className="text-right">Right aligned</p>

// Justify
<p className="text-justify">Justified text</p>
```

#### Text Colors

```tsx
// Primary
<p className="text-primary">Primary color text</p>

// Secondary
<p className="text-secondary-foreground">Secondary text</p>

// Muted
<p className="text-muted-foreground">Muted text</p>

// Destructive
<p className="text-destructive">Error text</p>

// Success
<p className="text-green-600">Success text</p>

// Warning
<p className="text-yellow-600">Warning text</p>

// Info
<p className="text-blue-600">Info text</p>
```

#### Responsive Typography

```tsx
// Responsive font sizes
<h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
  Responsive Heading
</h1>

// Responsive line height
<p className="leading-normal md:leading-relaxed lg:leading-loose">
  Responsive paragraph
</p>

// Responsive tracking
<h2 className="tracking-tight md:tracking-normal">
  Responsive Tracking
</h2>
```

#### Font Performance Tips

```tsx
// 1. Use font-display: swap
<link href="..." rel="stylesheet" />

// 2. Preload critical fonts
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />

// 3. Subset fonts (only load needed characters)
// Use Google Fonts with &text= parameter

// 4. Use variable fonts when possible
// Single file for all weights

// 5. Limit font weights
// Only load: 400 (regular), 600 (semibold), 700 (bold)
```

### Font Implementation Guide

#### Step 1: Choose Your Fonts

**Recommended Combination:**
- **UI Font**: Inter (clean, modern, excellent readability)
- **Mono Font**: JetBrains Mono (great for code/terminal)
- **Arabic Font**: Tajawal (if bilingual support needed)

#### Step 2: Install Fonts

**Method A: Google Fonts (CDN)**

Add to `packages/ui/index.html`:
```html
<head>
  <!-- Inter for UI -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  
  <!-- JetBrains Mono for code -->
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Tajawal for Arabic (optional) -->
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap" rel="stylesheet">
</head>
```

**Method B: Self-Hosted (Better Performance)**

1. Download fonts from [Google Fonts](https://fonts.google.com/)
2. Place in `packages/ui/public/fonts/`
3. Add to `packages/ui/src/index.css`:

```css
/* Inter Variable Font */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
  font-style: normal;
}

/* JetBrains Mono */
@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
  font-style: normal;
}

@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
  font-style: normal;
}
```

**Method C: npm Package**

```bash
# Install fonts
npm install @fontsource/inter @fontsource/jetbrains-mono
```

```tsx
// Import in App.tsx or main entry
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';

import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
```

#### Step 3: Update Tailwind Config

Update `packages/ui/tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        arabic: ['Tajawal', 'sans-serif'],
      },
    },
  },
};
```

#### Step 4: Update CSS Variables

Update `packages/ui/src/index.css`:

```css
:root {
  /* Font families */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Consolas', 'Monaco', monospace;
  --font-arabic: 'Tajawal', sans-serif;
}

body {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* Terminal/Code elements */
code, pre, .terminal {
  font-family: var(--font-mono);
}

/* Arabic content */
[dir="rtl"], .arabic {
  font-family: var(--font-arabic);
}
```

#### Step 5: Apply to Components

```tsx
// Regular text (uses default font-sans)
<p className="text-base">Regular text</p>

// Monospace text
<code className="font-mono">Code text</code>

// Arabic text
<p className="font-arabic" dir="rtl">نص عربي</p>

// Terminal component
<div className="font-mono bg-black text-green-400">
  $ npm install
</div>
```

#### Step 6: Optimize Font Loading

**1. Preload Critical Fonts**

Add to `index.html`:
```html
<link rel="preload" href="/fonts/Inter-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/JetBrainsMono-Regular.woff2" as="font" type="font/woff2" crossorigin>
```

**2. Use font-display: swap**

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Variable.woff2') format('woff2-variations');
  font-display: swap; /* Show fallback font immediately */
}
```

**3. Subset Fonts (Reduce Size)**

Use [glyphhanger](https://github.com/zachleat/glyphhanger) to create subsets:

```bash
# Install glyphhanger
npm install -g glyphhanger

# Create subset with only used characters
glyphhanger --subset=Inter-Variable.woff2 --formats=woff2
```

**4. Use Variable Fonts**

Variable fonts contain all weights in one file:
- Regular font: ~50KB per weight × 5 weights = 250KB
- Variable font: ~100KB for all weights

#### Font Loading Performance Checklist

- [ ] Use `font-display: swap` or `optional`
- [ ] Preload critical fonts
- [ ] Use variable fonts when possible
- [ ] Subset fonts to only needed characters
- [ ] Self-host fonts (avoid external requests)
- [ ] Use WOFF2 format (best compression)
- [ ] Limit number of font weights (3-4 max)
- [ ] Use system fonts as fallback
- [ ] Test font loading on slow connections

#### Testing Fonts

```bash
# Check font loading performance
npm run build
npm run preview

# Open DevTools > Network > Filter by "font"
# Check:
# - Font file sizes
# - Loading time
# - Number of requests
```

---

## Spacing System

### Base Unit: 4px (0.25rem)

```css
--spacing-0: 0;           /* 0px */
--spacing-1: 0.25rem;     /* 4px */
--spacing-2: 0.5rem;      /* 8px */
--spacing-3: 0.75rem;     /* 12px */
--spacing-4: 1rem;        /* 16px */
--spacing-5: 1.25rem;     /* 20px */
--spacing-6: 1.5rem;      /* 24px */
--spacing-8: 2rem;        /* 32px */
--spacing-10: 2.5rem;     /* 40px */
--spacing-12: 3rem;       /* 48px */
--spacing-16: 4rem;       /* 64px */
--spacing-20: 5rem;       /* 80px */
--spacing-24: 6rem;       /* 96px */
```

### Usage Guidelines

```tsx
// Padding
<div className="p-4">      {/* 16px all sides */}
<div className="px-6 py-4"> {/* 24px horizontal, 16px vertical */}

// Margin
<div className="m-4">      {/* 16px all sides */}
<div className="mt-8 mb-4"> {/* 32px top, 16px bottom */}

// Gap (for flex/grid)
<div className="flex gap-4"> {/* 16px gap between items */}
<div className="grid gap-6"> {/* 24px gap between grid items */}
```

---

## Shadows & Elevation

### Shadow Levels

```css
/* Level 0 - No shadow */
--shadow-none: none;

/* Level 1 - Subtle (cards, inputs) */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Level 2 - Default (buttons, dropdowns) */
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 
          0 1px 2px -1px rgb(0 0 0 / 0.1);

/* Level 3 - Medium (modals, popovers) */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 
             0 2px 4px -2px rgb(0 0 0 / 0.1);

/* Level 4 - Large (windows) */
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 
             0 4px 6px -4px rgb(0 0 0 / 0.1);

/* Level 5 - Extra large (active windows) */
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 
             0 8px 10px -6px rgb(0 0 0 / 0.1);

/* Level 6 - Maximum (dialogs) */
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

### Window Shadows

```css
/* Inactive window */
.window {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

/* Active window */
.window.active {
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.4);
}

/* Maximized window */
.window.maximized {
  box-shadow: none;
}
```

---

## Border Radius

```css
--radius-none: 0;
--radius-sm: 0.125rem;    /* 2px */
--radius: 0.5rem;         /* 8px - Default */
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.75rem;     /* 12px */
--radius-xl: 1rem;        /* 16px */
--radius-2xl: 1.5rem;     /* 24px */
--radius-full: 9999px;    /* Fully rounded */
```

### Usage

```tsx
// Buttons
<button className="rounded-md">Button</button>

// Cards
<div className="rounded-lg">Card</div>

// Windows
<div className="rounded-lg">Window</div>

// Avatars
<img className="rounded-full" />

// Desktop icons
<div className="rounded-lg">Icon</div>
```

---

## Animations

### Transition Durations

```css
--duration-75: 75ms;
--duration-100: 100ms;
--duration-150: 150ms;
--duration-200: 200ms;
--duration-300: 300ms;
--duration-500: 500ms;
--duration-700: 700ms;
--duration-1000: 1000ms;
```

### Easing Functions

```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Common Animations

```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale in */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Window open */
@keyframes windowOpen {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

### Usage with Tailwind

```tsx
// Hover transitions
<button className="transition-colors duration-200 hover:bg-primary/90">
  Button
</button>

// Transform transitions
<div className="transition-transform duration-300 hover:scale-105">
  Card
</div>

// Multiple properties
<div className="transition-all duration-200 ease-in-out">
  Element
</div>
```

---

## Icons

### Icon Library: Lucide React

```bash
npm install lucide-react
```

### Icon Sizes

```tsx
import { Home, Settings, Terminal } from 'lucide-react';

// Extra small - 12px
<Home className="h-3 w-3" />

// Small - 16px (default for inline text)
<Home className="h-4 w-4" />

// Medium - 20px (default for buttons)
<Home className="h-5 w-5" />

// Large - 24px (default for headers)
<Home className="h-6 w-6" />

// Extra large - 32px (desktop icons)
<Home className="h-8 w-8" />

// Huge - 48px (app icons)
<Home className="h-12 w-12" />
```

### Icon Colors

```tsx
// Primary color
<Home className="text-primary" />

// Muted/secondary
<Home className="text-muted-foreground" />

// Success
<Home className="text-green-500" />

// Error
<Home className="text-destructive" />

// Custom
<Home className="text-blue-500" />
```

### Common Icons

```tsx
// Navigation
import { Home, Settings, Search, Menu, X } from 'lucide-react';

// Actions
import { Plus, Edit, Trash2, Save, Download, Upload } from 'lucide-react';

// Files
import { File, Folder, FileText, Image, Video } from 'lucide-react';

// UI
import { ChevronDown, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';

// Desktop
import { Maximize2, Minimize2, X, Minus } from 'lucide-react';

// Apps
import { Terminal, Folder, BarChart3, Settings } from 'lucide-react';
```

---

## Component Guidelines

### Buttons

```tsx
// Primary button
<Button variant="default">
  Primary Action
</Button>

// Secondary button
<Button variant="secondary">
  Secondary Action
</Button>

// Outline button
<Button variant="outline">
  Outline Action
</Button>

// Ghost button
<Button variant="ghost">
  Ghost Action
</Button>

// Destructive button
<Button variant="destructive">
  Delete
</Button>

// With icon
<Button>
  <Plus className="h-4 w-4 mr-2" />
  Add Item
</Button>

// Icon only
<Button size="icon">
  <Settings className="h-4 w-4" />
</Button>
```

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card content */}
  </CardContent>
  <CardFooter>
    {/* Card footer actions */}
  </CardFooter>
</Card>
```

### Inputs

```tsx
// Text input
<Input 
  type="text" 
  placeholder="Enter text..."
  className="w-full"
/>

// With label
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>

// Textarea
<Textarea 
  placeholder="Enter description..."
  rows={4}
/>
```

### Dialogs/Modals

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description text
      </DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Windows

```tsx
// Window structure
<div className="window">
  {/* Title bar */}
  <div className="window-titlebar">
    <div className="window-title">
      <Terminal className="h-4 w-4" />
      <span>Terminal</span>
    </div>
    <div className="window-controls">
      <button className="window-control minimize">−</button>
      <button className="window-control maximize">□</button>
      <button className="window-control close">×</button>
    </div>
  </div>
  
  {/* Content */}
  <div className="window-content">
    {/* App content */}
  </div>
</div>
```

---

## Dark Mode

### Implementation

```tsx
// Add to root layout
<html className={theme === 'dark' ? 'dark' : ''}>
  <body>
    {children}
  </body>
</html>
```

### Dark Mode Colors

```css
.dark {
  --background: 224 71.4% 4.1%;
  --foreground: 210 20% 98%;
  --card: 224 71.4% 4.1%;
  --card-foreground: 210 20% 98%;
  --popover: 224 71.4% 4.1%;
  --popover-foreground: 210 20% 98%;
  --primary: 210 20% 98%;
  --primary-foreground: 220.9 39.3% 11%;
  --secondary: 215 27.9% 16.9%;
  --secondary-foreground: 210 20% 98%;
  --muted: 215 27.9% 16.9%;
  --muted-foreground: 217.9 10.6% 64.9%;
  --accent: 215 27.9% 16.9%;
  --accent-foreground: 210 20% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 20% 98%;
  --border: 215 27.9% 16.9%;
  --input: 215 27.9% 16.9%;
  --ring: 216 12.2% 83.9%;
}
```

### Usage

```tsx
// Automatically adapts to dark mode
<div className="bg-background text-foreground">
  Content
</div>

// Force dark mode styles
<div className="dark:bg-gray-800 dark:text-white">
  Content
</div>
```

---

## Accessibility

### Color Contrast

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio

### Focus States

```css
/* Focus ring */
.focus-visible:outline-none 
.focus-visible:ring-2 
.focus-visible:ring-ring 
.focus-visible:ring-offset-2
```

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Use proper semantic HTML
- Implement proper tab order
- Provide skip links

### Screen Readers

```tsx
// Use aria labels
<button aria-label="Close window">
  <X className="h-4 w-4" />
</button>

// Use semantic HTML
<nav aria-label="Main navigation">
  {/* Navigation items */}
</nav>

// Hide decorative elements
<div aria-hidden="true">
  {/* Decorative content */}
</div>
```

---

## Best Practices

### Do's ✅

- Use CSS variables for colors
- Maintain consistent spacing
- Follow the 8px grid system
- Use semantic color names
- Implement proper focus states
- Test in both light and dark modes
- Ensure sufficient color contrast
- Use icons consistently

### Don'ts ❌

- Don't use hardcoded colors
- Don't mix spacing systems
- Don't use too many font sizes
- Don't ignore accessibility
- Don't use colors alone to convey information
- Don't forget hover/active states
- Don't use low contrast colors

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Last Updated:** 2025-10-04  
**Version:** 1.0.0
