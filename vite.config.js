// vite.config.js

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd(), '')
  
  console.log('🔑 SME_API_KEY loaded:', env.VITE_SME_API_KEY ? '✅ Yes' : '❌ No')

  return {
    plugins: [react()],
    server: {
      host: 'localhost',
      port: 5174,
      strictPort: false,
      proxy: {
        '/peyflex-api': {
          target: 'https://client.peyflex.com.ng',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/peyflex-api/, '/api'),
          secure: false
        },
        // SME API Proxy with proper Authorization
        '/sme-api': {
          target: 'https://smeapi.com.ng/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/sme-api/, ''),
          secure: false,
          configure: (proxy) => {
            // Get API key from loaded environment
            const apiKey = env.VITE_SME_API_KEY || '';
            
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Add authorization header with the token
              if (apiKey) {
                proxyReq.setHeader('Authorization', `Token ${apiKey}`);
                console.log('✅ Authorization header added');
              } else {
                console.warn('⚠️ VITE_SME_API_KEY is not set');
              }
              proxyReq.setHeader('Content-Type', 'application/json');
              console.log('🔄 Proxying:', req.method, req.url);
            });
            
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('📥 Response status:', proxyRes.statusCode);
            });
            
            proxy.on('error', (err, req, res) => {
              console.error('❌ Proxy error:', err);
              res.status(500).json({ error: err.message });
            });
          }
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
  }
})