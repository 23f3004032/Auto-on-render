/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e3a8a', // Navy Blue
          dark: '#172554',
          light: '#3b82f6',
        },
        secondary: {
          DEFAULT: '#ffffff',
          dark: '#f9fafb',
        },
        accent: {
          DEFAULT: '#f59e0b', // Gold/Orange
          dark: '#d97706',
          light: '#fbbf24',
        },
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
