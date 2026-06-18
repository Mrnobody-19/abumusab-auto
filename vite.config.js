import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5174,  // Changed from 5173
    strictPort: false,
    proxy: {
      '/peyflex-api': {
        target: 'https://client.peyflex.com.ng',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/peyflex-api/, '/api'),
        secure: false
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 10000,
    allowedHosts: [
      'abumusab-automobile.onrender.com',
      'localhost',
      '127.0.0.1'
    ]
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          framer: ['framer-motion']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})