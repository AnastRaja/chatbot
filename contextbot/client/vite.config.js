import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    drop: ['console', 'debugger'],
  },
  server: {
    cors: {
      origin: (origin, cb) => cb(null, true),
      credentials: true,
    },
    proxy: {
      '/api': 'http://127.0.0.1:3000', // Proxy API requests to backend
      '/socket': {
        target: 'ws://127.0.0.1:3000',
        ws: true
      }
    }
  }
})
