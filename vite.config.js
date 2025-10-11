import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-proxy-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Intercept /api requests before Vite's static file middleware
          if (req.url?.startsWith('/api/')) {
            // Let the proxy handle it
            return next()
          }
          next()
        })
      },
    },
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://cltevents-nl32gwrun-john-reillys-projects.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
})
