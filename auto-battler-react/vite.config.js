import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl' // <-- IMPORT THE PLUGIN
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl() // <-- ADD THE PLUGIN HERE
  ],
  resolve: {
    alias: {
      '@discord/embedded-app-sdk': path.resolve(__dirname, 'src/shims/discord-sdk.js')
    }
  },
  build: {
    rollupOptions: {
      external: ['@discord/embedded-app-sdk']
    }
  },
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
    proxy: {
      '/api': {
        target: 'http://game.strahde.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
