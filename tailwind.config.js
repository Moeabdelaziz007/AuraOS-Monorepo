/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./packages/ui/src/**/*.{js,ts,jsx,tsx}",
    "./apps/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Quantum Space Color Palette
      colors: {
        quantum: {
          // Primary Colors
          primary: '#00d4ff',
          'primary-dark': '#0099cc',
          'primary-light': '#33ddff',
          
          // Secondary Colors
          secondary: '#8b5cf6',
          'secondary-dark': '#7c3aed',
          'secondary-light': '#a78bfa',
          
          // Accent Colors
          accent: '#ec4899',
          'accent-dark': '#db2777',
          'accent-light': '#f472b6',
          
          // Gold
          gold: '#f59e0b',
          'gold-dark': '#d97706',
          'gold-light': '#fbbf24',
          
          // Background Colors
          'bg-primary': '#0a0a0f',
          'bg-secondary': '#1a1a2e',
          'bg-tertiary': '#16213e',
          'bg-surface': '#0f172a',
          
          // Glass Effects
          glass: 'rgba(0, 212, 255, 0.1)',
          'glass-secondary': 'rgba(139, 92, 246, 0.1)',
          'glass-accent': 'rgba(236, 72, 153, 0.1)',
          'glass-gold': 'rgba(245, 158, 11, 0.1)',
          
          // Text Colors
          'text-primary': '#ffffff',
          'text-secondary': '#e2e8f0',
          'text-muted': '#94a3b8',
          'text-accent': '#00d4ff',
          
          // Arabic Text
          'arabic-primary': '#ffffff',
          'arabic-secondary': '#e2e8f0',
        }
      },
      
      // Font Families
      fontFamily: {
        'quantum-primary': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'quantum-mono': ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        'quantum-arabic': ['Tajawal', 'Cairo', 'IBM Plex Sans Arabic', 'sans-serif'],
        'quantum-display': ['Orbitron', 'Exo 2', 'Rajdhani', 'sans-serif'],
      },
      
      // Font Sizes
      fontSize: {
        'quantum-6xl': '3.75rem',    // 60px
        'quantum-5xl': '3rem',        // 48px
        'quantum-4xl': '2.25rem',     // 36px
        'quantum-3xl': '1.875rem',    // 30px
        'quantum-2xl': '1.5rem',      // 24px
        'quantum-xl': '1.25rem',      // 20px
        'quantum-lg': '1.125rem',     // 18px
        'quantum-base': '1rem',       // 16px
        'quantum-sm': '0.875rem',     // 14px
        'quantum-xs': '0.75rem',      // 12px
      },
      
      // Font Weights
      fontWeight: {
        'quantum-thin': '100',
        'quantum-light': '300',
        'quantum-normal': '400',
        'quantum-medium': '500',
        'quantum-semibold': '600',
        'quantum-bold': '700',
        'quantum-extrabold': '800',
        'quantum-black': '900',
      },
      
      // Line Heights
      lineHeight: {
        'quantum-tight': '1.25',
        'quantum-snug': '1.375',
        'quantum-normal': '1.5',
        'quantum-relaxed': '1.625',
        'quantum-loose': '2',
      },
      
      // Spacing Scale
      spacing: {
        'quantum-1': '0.25rem',   // 4px
        'quantum-2': '0.5rem',    // 8px
        'quantum-3': '0.75rem',   // 12px
        'quantum-4': '1rem',      // 16px
        'quantum-5': '1.25rem',   // 20px
        'quantum-6': '1.5rem',    // 24px
        'quantum-8': '2rem',      // 32px
        'quantum-10': '2.5rem',   // 40px
        'quantum-12': '3rem',     // 48px
        'quantum-16': '4rem',     // 64px
        'quantum-20': '5rem',     // 80px
        'quantum-24': '6rem',     // 96px
        'quantum-32': '8rem',     // 128px
        'quantum-40': '10rem',    // 160px
        'quantum-48': '12rem',    // 192px
        'quantum-64': '16rem',    // 256px
      },
      
      // Border Radius
      borderRadius: {
        'quantum-sm': '0.375rem',   // 6px
        'quantum-md': '0.5rem',     // 8px
        'quantum-lg': '0.75rem',     // 12px
        'quantum-xl': '1rem',        // 16px
        'quantum-2xl': '1.5rem',     // 24px
        'quantum-3xl': '2rem',       // 32px
        'quantum-full': '9999px',   // Fully rounded
      },
      
      // Backdrop Blur
      backdropBlur: {
        'quantum-sm': '20px',
        'quantum-md': '25px',
        'quantum-lg': '30px',
      },
      
      // Box Shadow
      boxShadow: {
        'quantum-depth-1': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        'quantum-depth-2': '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
        'quantum-depth-3': '0 8px 24px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.4)',
        'quantum-depth-4': '0 16px 48px rgba(0, 0, 0, 0.6), 0 8px 16px rgba(0, 0, 0, 0.5)',
        'quantum-depth-5': '0 32px 64px rgba(0, 0, 0, 0.7), 0 16px 32px rgba(0, 0, 0, 0.6)',
        'quantum-neon': '0 0 5px var(--quantum-primary), 0 0 10px var(--quantum-primary), 0 0 15px var(--quantum-primary), 0 0 20px var(--quantum-primary)',
        'quantum-neon-secondary': '0 0 5px var(--quantum-secondary), 0 0 10px var(--quantum-secondary), 0 0 15px var(--quantum-secondary), 0 0 20px var(--quantum-secondary)',
      },
      
      // Icon Sizes
      width: {
        'quantum-icon-xs': '0.75rem',    // 12px
        'quantum-icon-sm': '1rem',       // 16px
        'quantum-icon-md': '1.25rem',    // 20px
        'quantum-icon-lg': '1.5rem',     // 24px
        'quantum-icon-xl': '2rem',       // 32px
        'quantum-icon-2xl': '2.5rem',    // 40px
        'quantum-icon-3xl': '3rem',      // 48px
      },
      
      height: {
        'quantum-icon-xs': '0.75rem',    // 12px
        'quantum-icon-sm': '1rem',       // 16px
        'quantum-icon-md': '1.25rem',    // 20px
        'quantum-icon-lg': '1.5rem',     // 24px
        'quantum-icon-xl': '2rem',       // 32px
        'quantum-icon-2xl': '2.5rem',    // 40px
        'quantum-icon-3xl': '3rem',      // 48px
      },
      
      // Animation
      animation: {
        'quantum-float': 'quantum-float 20s infinite linear',
        'quantum-pulse': 'quantum-pulse 2s infinite',
        'quantum-bounce': 'quantum-bounce 1s infinite',
        'quantum-spin': 'quantum-spin 1s linear infinite',
        'quantum-fade-in': 'quantum-fade-in 0.6s ease-in-out',
        'quantum-slide-up': 'quantum-slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'quantum-scale': 'quantum-scale 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      // Keyframes
      keyframes: {
        'quantum-float': {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-100px)' },
        },
        'quantum-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
        },
        'quantum-bounce': {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
        'quantum-fade-in': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'quantum-slide-up': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'quantum-scale': {
          'from': { opacity: '0', transform: 'scale(0.9)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
      },
      
      // Responsive Breakpoints
      screens: {
        'quantum-mobile': '320px',
        'quantum-mobile-lg': '480px',
        'quantum-tablet': '768px',
        'quantum-tablet-lg': '1024px',
        'quantum-desktop': '1280px',
        'quantum-desktop-lg': '1536px',
        'quantum-desktop-xl': '1920px',
      },
    },
  },
  plugins: [
    // Custom utilities for Quantum Theme
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Glass Effects
        '.quantum-glass-primary': {
          background: 'rgba(0, 212, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 212, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        },
        '.quantum-glass-secondary': {
          background: 'rgba(139, 92, 246, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        },
        '.quantum-glass-accent': {
          background: 'rgba(236, 72, 153, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(236, 72, 153, 0.2)',
          boxShadow: '0 8px 32px rgba(236, 72, 153, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        },
        
        // Gradients
        '.quantum-gradient-primary': {
          background: 'linear-gradient(135deg, var(--quantum-primary), var(--quantum-secondary))',
        },
        '.quantum-gradient-accent': {
          background: 'linear-gradient(135deg, var(--quantum-accent), var(--quantum-gold))',
        },
        '.quantum-gradient-space': {
          background: 'linear-gradient(135deg, var(--quantum-bg-primary), var(--quantum-bg-secondary), var(--quantum-bg-tertiary))',
        },
        '.quantum-gradient-glass': {
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(139, 92, 246, 0.1))',
        },
        
        // Transitions
        '.quantum-transition-smooth': {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.quantum-transition-bounce': {
          transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        },
        '.quantum-transition-elastic': {
          transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        },
        
        // Hover Effects
        '.quantum-hover-lift:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 'var(--quantum-depth-4)',
        },
        '.quantum-hover-scale:hover': {
          transform: 'scale(1.05)',
        },
        '.quantum-hover-glow:hover': {
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.3), var(--quantum-depth-3)',
        },
        
        // RTL Support
        '[dir="rtl"] .quantum-rtl': {
          textAlign: 'right',
          direction: 'rtl',
        },
        
        // Accessibility
        '.quantum-high-contrast': {
          '--quantum-primary': '#00ffff',
          '--quantum-secondary': '#ff00ff',
          '--quantum-accent': '#ffff00',
          '--quantum-text-primary': '#ffffff',
          '--quantum-bg-primary': '#000000',
        },
        
        // Reduced Motion
        '@media (prefers-reduced-motion: reduce)': {
          '.quantum-transition-smooth, .quantum-transition-bounce, .quantum-transition-elastic': {
            transition: 'none',
          },
          '.quantum-particles::before': {
            animation: 'none',
          },
        },
      }
      
      addUtilities(newUtilities)
    }
  ],
}
