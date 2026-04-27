import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- TO MUSI TU BYĆ

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- I TO TEŻ
  ],
})
