/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#121214",
          card: "#1e1e24",
          border: "#2d2d34",
          primary: "#03dac5"
        }
      }
    },
  },
  plugins: [],
}
