/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#FAFAF9',
          card: '#FFFFFF',
          muted: '#F4F4F2',
        },
        ink: {
          DEFAULT: '#0F172A',
          muted: '#64748B',
          soft: '#94A3B8',
        },
        border: {
          DEFAULT: '#E7E5E4',
          strong: '#D4D4D2',
        },
        vibe: {
          DEFAULT: '#7C3AED',
          bg: '#F3F0FF',
          deep: '#5B21B6',
        },
        kyoto: {
          DEFAULT: '#DC2626',
        },
        night: {
          bg: '#0A0A12',
          card: '#13131F',
          border: '#252535',
          text: '#F5F5F7',
          muted: '#9CA3AF',
          glow: '#A78BFA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        jp: ['"Noto Sans JP"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        '5xl': '1024px',
      },
    },
  },
  plugins: [],
};
