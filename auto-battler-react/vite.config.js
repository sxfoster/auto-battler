import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl' // <-- IMPORT THE PLUGIN

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl() // <-- ADD THE PLUGIN HERE
  ],
})
