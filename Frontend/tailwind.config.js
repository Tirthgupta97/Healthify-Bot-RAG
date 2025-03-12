module.exports = {
  // ...existing config
  theme: {
    extend: {
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-out forwards',
        'bounce': 'bounce 1s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-25%)' },
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    // ...other plugins
  ],
}