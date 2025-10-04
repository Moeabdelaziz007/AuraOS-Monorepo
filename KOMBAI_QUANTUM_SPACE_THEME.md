# 🌌 AuraOS Quantum Space Theme - Kombai Design Specification
## خصائص تصميم الفضاء الكمي - AuraOS

---

## 🎨 **Quantum Space Color Palette**

### **Primary Colors - الألوان الأساسية**
```css
/* Quantum Blue - الأزرق الكمي */
--quantum-primary: #00d4ff;        /* Bright cyan blue */
--quantum-primary-dark: #0099cc;   /* Darker cyan */
--quantum-primary-light: #33ddff;  /* Lighter cyan */

/* Space Purple - البنفسجي الفضائي */
--quantum-secondary: #8b5cf6;      /* Purple magic */
--quantum-secondary-dark: #7c3aed; /* Darker purple */
--quantum-secondary-light: #a78bfa; /* Lighter purple */

/* Nebula Pink - الوردي السديمي */
--quantum-accent: #ec4899;          /* Hot pink */
--quantum-accent-dark: #db2777;    /* Darker pink */
--quantum-accent-light: #f472b6;   /* Lighter pink */

/* Stellar Gold - الذهبي النجمي */
--quantum-gold: #f59e0b;           /* Golden yellow */
--quantum-gold-dark: #d97706;      /* Darker gold */
--quantum-gold-light: #fbbf24;    /* Lighter gold */
```

### **Background Colors - ألوان الخلفية**
```css
/* Deep Space - الفضاء العميق */
--quantum-bg-primary: #0a0a0f;     /* Deepest space */
--quantum-bg-secondary: #1a1a2e;   /* Dark space */
--quantum-bg-tertiary: #16213e;    /* Medium space */
--quantum-bg-surface: #0f172a;     /* Surface space */

/* Glass Effects - تأثيرات الزجاج */
--quantum-glass: rgba(0, 212, 255, 0.1);      /* Cyan glass */
--quantum-glass-secondary: rgba(139, 92, 246, 0.1); /* Purple glass */
--quantum-glass-accent: rgba(236, 72, 153, 0.1);   /* Pink glass */
--quantum-glass-gold: rgba(245, 158, 11, 0.1);     /* Gold glass */
```

### **Text Colors - ألوان النص**
```css
/* Primary Text - النص الأساسي */
--quantum-text-primary: #ffffff;      /* Pure white */
--quantum-text-secondary: #e2e8f0;    /* Light gray */
--quantum-text-muted: #94a3b8;        /* Muted gray */
--quantum-text-accent: #00d4ff;       /* Cyan accent */

/* Arabic Text - النص العربي */
--quantum-arabic-primary: #ffffff;     /* White for Arabic */
--quantum-arabic-secondary: #e2e8f0;  /* Light gray for Arabic */
```

---

## 🔮 **Glassmorphism Effects**

### **Glass Surfaces - الأسطح الزجاجية**
```css
/* Primary Glass - الزجاج الأساسي */
.quantum-glass-primary {
  background: rgba(0, 212, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 212, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Secondary Glass - الزجاج الثانوي */
.quantum-glass-secondary {
  background: rgba(139, 92, 246, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  box-shadow: 
    0 8px 32px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Accent Glass - الزجاج المميز */
.quantum-glass-accent {
  background: rgba(236, 72, 153, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(236, 72, 153, 0.2);
  box-shadow: 
    0 8px 32px rgba(236, 72, 153, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

### **Depth Levels - مستويات العمق**
```css
/* Depth Level 1 - المستوى الأول */
.quantum-depth-1 {
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.3),
    0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Depth Level 2 - المستوى الثاني */
.quantum-depth-2 {
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Depth Level 3 - المستوى الثالث */
.quantum-depth-3 {
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.5),
    0 4px 8px rgba(0, 0, 0, 0.4);
}

/* Depth Level 4 - المستوى الرابع */
.quantum-depth-4 {
  box-shadow: 
    0 16px 48px rgba(0, 0, 0, 0.6),
    0 8px 16px rgba(0, 0, 0, 0.5);
}

/* Depth Level 5 - المستوى الخامس */
.quantum-depth-5 {
  box-shadow: 
    0 32px 64px rgba(0, 0, 0, 0.7),
    0 16px 32px rgba(0, 0, 0, 0.6);
}
```

---

## 🎭 **Typography System**

### **Font Families - عائلات الخطوط**
```css
/* Primary Font - الخط الأساسي */
--quantum-font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace Font - الخط الأحادي */
--quantum-font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

/* Arabic Font - الخط العربي */
--quantum-font-arabic: 'Tajawal', 'Cairo', 'IBM Plex Sans Arabic', sans-serif;

/* Display Font - خط العرض */
--quantum-font-display: 'Orbitron', 'Exo 2', 'Rajdhani', sans-serif;
```

### **Font Sizes - أحجام الخطوط**
```css
/* Display Sizes - أحجام العرض */
--quantum-text-6xl: 3.75rem;    /* 60px - Hero titles */
--quantum-text-5xl: 3rem;      /* 48px - Large titles */
--quantum-text-4xl: 2.25rem;   /* 36px - Section titles */
--quantum-text-3xl: 1.875rem;  /* 30px - Page titles */
--quantum-text-2xl: 1.5rem;    /* 24px - Card titles */
--quantum-text-xl: 1.25rem;    /* 20px - Subsection titles */

/* Body Sizes - أحجام النص */
--quantum-text-lg: 1.125rem;   /* 18px - Large body */
--quantum-text-base: 1rem;      /* 16px - Regular body */
--quantum-text-sm: 0.875rem;    /* 14px - Small text */
--quantum-text-xs: 0.75rem;     /* 12px - Captions */

/* Line Heights - ارتفاعات الأسطر */
--quantum-leading-tight: 1.25;
--quantum-leading-snug: 1.375;
--quantum-leading-normal: 1.5;
--quantum-leading-relaxed: 1.625;
--quantum-leading-loose: 2;
```

### **Font Weights - أوزان الخطوط**
```css
--quantum-font-thin: 100;
--quantum-font-light: 300;
--quantum-font-normal: 400;
--quantum-font-medium: 500;
--quantum-font-semibold: 600;
--quantum-font-bold: 700;
--quantum-font-extrabold: 800;
--quantum-font-black: 900;
```

---

## 🎨 **Component Specifications**

### **Buttons - الأزرار**
```css
/* Primary Button - الزر الأساسي */
.quantum-btn-primary {
  background: linear-gradient(135deg, var(--quantum-primary), var(--quantum-secondary));
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: var(--quantum-depth-2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.quantum-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--quantum-depth-3);
  background: linear-gradient(135deg, var(--quantum-primary-light), var(--quantum-secondary-light));
}

/* Glass Button - الزر الزجاجي */
.quantum-btn-glass {
  background: var(--quantum-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: var(--quantum-text-primary);
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.quantum-btn-glass:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.5);
  transform: translateY(-1px);
}
```

### **Cards - البطاقات**
```css
/* Glass Card - البطاقة الزجاجية */
.quantum-card-glass {
  background: var(--quantum-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--quantum-depth-2);
  transition: all 0.3s ease;
}

.quantum-card-glass:hover {
  transform: translateY(-4px);
  box-shadow: var(--quantum-depth-4);
  border-color: rgba(0, 212, 255, 0.4);
}

/* Floating Card - البطاقة العائمة */
.quantum-card-floating {
  background: var(--quantum-glass-secondary);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 20px;
  padding: 32px;
  box-shadow: var(--quantum-depth-3);
  position: relative;
  overflow: hidden;
}

.quantum-card-floating::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 212, 255, 0.1), 
    rgba(139, 92, 246, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.quantum-card-floating:hover::before {
  opacity: 1;
}
```

### **Input Fields - حقول الإدخال**
```css
/* Glass Input - حقل الإدخال الزجاجي */
.quantum-input-glass {
  background: var(--quantum-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--quantum-text-primary);
  font-size: 14px;
  transition: all 0.3s ease;
}

.quantum-input-glass:focus {
  outline: none;
  border-color: var(--quantum-primary);
  box-shadow: 
    0 0 0 3px rgba(0, 212, 255, 0.1),
    var(--quantum-depth-2);
}

.quantum-input-glass::placeholder {
  color: var(--quantum-text-muted);
}
```

---

## 🌟 **Animation System**

### **Transitions - الانتقالات**
```css
/* Smooth Transition - الانتقال السلس */
.quantum-transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Bounce Transition - الانتقال المرتد */
.quantum-transition-bounce {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Elastic Transition - الانتقال المرن */
.quantum-transition-elastic {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

### **Hover Effects - تأثيرات التمرير**
```css
/* Lift Effect - تأثير الرفع */
.quantum-hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--quantum-depth-4);
}

/* Scale Effect - تأثير التكبير */
.quantum-hover-scale:hover {
  transform: scale(1.05);
}

/* Glow Effect - تأثير التوهج */
.quantum-hover-glow:hover {
  box-shadow: 
    0 0 20px rgba(0, 212, 255, 0.3),
    var(--quantum-depth-3);
}
```

---

## 🎯 **Spacing System**

### **Spacing Scale - مقياس المسافات**
```css
/* Micro Spacing - المسافات الدقيقة */
--quantum-space-1: 0.25rem;   /* 4px */
--quantum-space-2: 0.5rem;    /* 8px */
--quantum-space-3: 0.75rem;   /* 12px */
--quantum-space-4: 1rem;      /* 16px */

/* Small Spacing - المسافات الصغيرة */
--quantum-space-5: 1.25rem;    /* 20px */
--quantum-space-6: 1.5rem;    /* 24px */
--quantum-space-8: 2rem;      /* 32px */
--quantum-space-10: 2.5rem;   /* 40px */

/* Medium Spacing - المسافات المتوسطة */
--quantum-space-12: 3rem;     /* 48px */
--quantum-space-16: 4rem;     /* 64px */
--quantum-space-20: 5rem;     /* 80px */
--quantum-space-24: 6rem;     /* 96px */

/* Large Spacing - المسافات الكبيرة */
--quantum-space-32: 8rem;     /* 128px */
--quantum-space-40: 10rem;    /* 160px */
--quantum-space-48: 12rem;    /* 192px */
--quantum-space-64: 16rem;    /* 256px */
```

---

## 🎨 **Border Radius System**

### **Radius Scale - مقياس الانحناء**
```css
/* Small Radius - الانحناء الصغير */
--quantum-radius-sm: 0.375rem;   /* 6px */
--quantum-radius-md: 0.5rem;     /* 8px */
--quantum-radius-lg: 0.75rem;    /* 12px */

/* Medium Radius - الانحناء المتوسط */
--quantum-radius-xl: 1rem;       /* 16px */
--quantum-radius-2xl: 1.5rem;    /* 24px */
--quantum-radius-3xl: 2rem;      /* 32px */

/* Large Radius - الانحناء الكبير */
--quantum-radius-full: 9999px;   /* Fully rounded */
```

---

## 🌈 **Gradient System**

### **Quantum Gradients - التدرجات الكمية**
```css
/* Primary Gradient - التدرج الأساسي */
.quantum-gradient-primary {
  background: linear-gradient(135deg, 
    var(--quantum-primary), 
    var(--quantum-secondary));
}

/* Accent Gradient - التدرج المميز */
.quantum-gradient-accent {
  background: linear-gradient(135deg, 
    var(--quantum-accent), 
    var(--quantum-gold));
}

/* Space Gradient - التدرج الفضائي */
.quantum-gradient-space {
  background: linear-gradient(135deg, 
    var(--quantum-bg-primary), 
    var(--quantum-bg-secondary), 
    var(--quantum-bg-tertiary));
}

/* Glass Gradient - تدرج الزجاج */
.quantum-gradient-glass {
  background: linear-gradient(135deg, 
    rgba(0, 212, 255, 0.1), 
    rgba(139, 92, 246, 0.1));
}
```

---

## 🎭 **Icon System**

### **Icon Sizes - أحجام الأيقونات**
```css
/* Micro Icons - الأيقونات الدقيقة */
--quantum-icon-xs: 0.75rem;    /* 12px */
--quantum-icon-sm: 1rem;       /* 16px */
--quantum-icon-md: 1.25rem;    /* 20px */
--quantum-icon-lg: 1.5rem;     /* 24px */
--quantum-icon-xl: 2rem;       /* 32px */
--quantum-icon-2xl: 2.5rem;    /* 40px */
--quantum-icon-3xl: 3rem;      /* 48px */
```

### **Icon Colors - ألوان الأيقونات**
```css
/* Primary Icons - الأيقونات الأساسية */
.quantum-icon-primary {
  color: var(--quantum-primary);
}

/* Secondary Icons - الأيقونات الثانوية */
.quantum-icon-secondary {
  color: var(--quantum-secondary);
}

/* Accent Icons - الأيقونات المميزة */
.quantum-icon-accent {
  color: var(--quantum-accent);
}

/* Muted Icons - الأيقونات الخافتة */
.quantum-icon-muted {
  color: var(--quantum-text-muted);
}
```

---

## 🎯 **Responsive Breakpoints**

### **Screen Sizes - أحجام الشاشات**
```css
/* Mobile - الجوال */
--quantum-mobile: 320px;
--quantum-mobile-lg: 480px;

/* Tablet - التابلت */
--quantum-tablet: 768px;
--quantum-tablet-lg: 1024px;

/* Desktop - سطح المكتب */
--quantum-desktop: 1280px;
--quantum-desktop-lg: 1536px;
--quantum-desktop-xl: 1920px;
```

---

## 🎨 **Component States**

### **Interactive States - الحالات التفاعلية**
```css
/* Default State - الحالة الافتراضية */
.quantum-state-default {
  opacity: 1;
  transform: scale(1);
  transition: all 0.3s ease;
}

/* Hover State - حالة التمرير */
.quantum-state-hover {
  opacity: 0.9;
  transform: scale(1.02);
  box-shadow: var(--quantum-depth-3);
}

/* Active State - الحالة النشطة */
.quantum-state-active {
  opacity: 1;
  transform: scale(0.98);
  box-shadow: var(--quantum-depth-1);
}

/* Disabled State - الحالة المعطلة */
.quantum-state-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

---

## 🌟 **Special Effects**

### **Neon Glow - التوهج النيوني */
```css
.quantum-neon-glow {
  box-shadow: 
    0 0 5px var(--quantum-primary),
    0 0 10px var(--quantum-primary),
    0 0 15px var(--quantum-primary),
    0 0 20px var(--quantum-primary);
}

.quantum-neon-glow-secondary {
  box-shadow: 
    0 0 5px var(--quantum-secondary),
    0 0 10px var(--quantum-secondary),
    0 0 15px var(--quantum-secondary),
    0 0 20px var(--quantum-secondary);
}
```

### **Particle Effect - تأثير الجسيمات */
```css
.quantum-particles::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, var(--quantum-primary) 1px, transparent 1px),
    radial-gradient(circle at 80% 80%, var(--quantum-secondary) 1px, transparent 1px),
    radial-gradient(circle at 40% 60%, var(--quantum-accent) 1px, transparent 1px);
  background-size: 50px 50px, 30px 30px, 40px 40px;
  opacity: 0.1;
  animation: quantum-float 20s infinite linear;
}

@keyframes quantum-float {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-100px); }
}
```

---

## 🎯 **Accessibility Features**

### **High Contrast - التباين العالي */
```css
.quantum-high-contrast {
  --quantum-primary: #00ffff;
  --quantum-secondary: #ff00ff;
  --quantum-accent: #ffff00;
  --quantum-text-primary: #ffffff;
  --quantum-bg-primary: #000000;
}
```

### **Reduced Motion - الحركة المقللة */
```css
@media (prefers-reduced-motion: reduce) {
  .quantum-transition-smooth,
  .quantum-transition-bounce,
  .quantum-transition-elastic {
    transition: none;
  }
  
  .quantum-particles::before {
    animation: none;
  }
}
```

---

## 🎨 **RTL Support**

### **Arabic Layout - التخطيط العربي */
```css
[dir="rtl"] .quantum-card-glass {
  text-align: right;
  direction: rtl;
}

[dir="rtl"] .quantum-input-glass {
  text-align: right;
  direction: rtl;
}

[dir="rtl"] .quantum-btn-glass {
  direction: rtl;
}
```

---

*This is the complete Quantum Space Theme specification for Kombai AI Design System*
*Target: Revolutionary Space-themed Web Operating System*
*Goal: Create the most advanced glassmorphism design system*
