import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl' // <-- IMPORT THE PLUGIN

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl() // <-- ADD THE PLUGIN HERE
  ],
  server: {
    port: 5173,
    // Allow the server to be accessed from your local network
    host: true,
    // Explicitly set headers to allow embedding
    headers: {
      // Allow discord.com to embed this page
      'Content-Security-Policy': "frame-ancestors 'self' *.discord.com",
      // For older browsers, though CSP is preferred
      'X-Frame-Options': 'ALLOW-FROM *.discord.com',
    },
  },
})
