module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
   darkMode: false, // or 'media' or 'class'
   theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        alternative: 'var(--color-alternative)',
        alternativeLight: 'var(--color-alternative-light)',
        secondary: 'var(--color-secondary)',
        secondaryDark: 'var(--color-secondary-dark)',
        primaryLight: 'var(--color-primary-light)',

      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
    },
   },
   variants: {
     extend: {},
   },
   plugins: [],
 }