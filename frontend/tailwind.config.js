/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',  // Small mobile
        'sm': '640px',  // Mobile
        'md': '768px',  // Tablet
        'lg': '1024px', // Desktop
        'xl': '1280px', // Large desktop
      }
    },
  },
  plugins: [],
}

