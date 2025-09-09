/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          '500': '#3b82f6',
          '600': '#2563eb',
          DEFAULT: '#2563eb'
        },
        'primary-500': '#3b82f6',
        'primary-600': '#2563eb',
      }
    }
  },
  plugins: [require("@tailwindcss/forms")],
}