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
          DEFAULT: '#4F46E5', // Indigo
          dark: '#3730A3',
          light: '#6366F1',
        },
        secondary: {
          DEFAULT: '#E2E8F0', // Soft Platinum
          dark: '#CBD5E1',
          light: '#F1F5F9',
        },
        accent: {
          DEFAULT: '#059669', // Emerald Green
          dark: '#047857',
          light: '#10B981',
        },
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
