import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        primary: {
          purple: '#6C4BFF',
          pink: '#FF4F88',
          flame: '#FF6B3D',
        },
        // Flat color aliases for easier use
        'primary-purple': '#6C4BFF',
        'primary-pink': '#FF4F88',
        'primary-flame': '#FF6B3D',
        // Neutrals (Dark Mode)
        neutral: {
          white: '#1A1625',
          'off-white': '#0F0B1A',
          'light-grey': '#2D2838',
          'medium-grey': '#6B7280',
          'dark-grey': '#9CA3AF',
          'near-black': '#F9FAFB',
        },
        // Status Colors
        success: '#22C55E',
        'super-like': '#3B82F6',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      backgroundImage: {
        'flame-gradient': 'linear-gradient(to right, #FF4F88, #FF6B3D)',
        'premium-gradient': 'linear-gradient(to right, #6C4BFF, #B794FF)',
        'soft-love-gradient': 'linear-gradient(to right, #1A1625, #2D2838)',
      },
    },
  },
  plugins: [],
}
export default config

