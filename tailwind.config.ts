import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B6B',
        sky: '#60A5FA',
        mint: '#34D399',
        lemon: '#FACC15',
        graylight: '#F9FAFB',
        charcoal: '#1F2937',
      },
      fontFamily: {
        sans: ['var(--font-lato)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-inter)', 'var(--font-lato)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;