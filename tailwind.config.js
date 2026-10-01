/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        deepseek: {
          dark: '#1a1a1a',
          sidebar: '#141414',
          bubble: '#242424',
          border: '#2f2f2f',
          hover: '#2a2a2a',
          accent: '#2563eb', // Clean blue accent like DeepSeek
        }
      }
    },
  },
  plugins: [],
}
