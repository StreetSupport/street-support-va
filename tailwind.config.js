/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ss-primary': '#339378',
        'ss-secondary': '#721b78',
        'ss-accent': '#086049',
        'ss-bg': '#f5f5f5',
        'ss-text': '#1a1a1a',
      },
      width: {
        'widget': '480px',
      },
      height: {
        'widget': '640px',
      },
    },
  },
  plugins: [],
}
