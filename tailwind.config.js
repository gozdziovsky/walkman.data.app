/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // To mówi Tailwindowi: "Zajrzyj tutaj i znajdź klasy!"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
