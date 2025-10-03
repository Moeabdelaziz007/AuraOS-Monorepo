/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'aura-blue': '#0066ff',
        'aura-purple': '#6366f1',
        'aura-cyan': '#06b6d4'
      }
    }
  },
  plugins: []
}
