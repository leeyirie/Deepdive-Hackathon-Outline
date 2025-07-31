/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '360px',
        'sm': '440px',
      },
      maxWidth: {
        'app': '440px',
      },
      minWidth: {
        'app': '360px',
      },
      fontFamily: {
        sans: [
          'Pretendard',
          'ui-sans-serif',
          'system-ui',
          'Apple SD Gothic Neo',
          'AppleGothic',
          'Malgun Gothic',
          'sans-serif',
        ],
      },
      colors: {
        'charcoal': '#2C2C2C',
      },
    },
  },
  plugins: [],
}