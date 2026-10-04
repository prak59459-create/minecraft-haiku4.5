import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true,
    hmr: true
  },
  build: {
    target: 'ES2020',
    minify: 'terser'
  }
})
