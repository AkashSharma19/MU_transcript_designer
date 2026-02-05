/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Source Serif 4"', 'serif'],
        sans: ['"Job"', 'sans-serif'], // Resetting sans just in case, though we'll use serif class
      },
    },
  },
  plugins: [],
}
