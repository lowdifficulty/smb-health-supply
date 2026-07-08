import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: process.env.VITE_BASE || '/portal/',
  build: {
    outDir: process.env.VITE_OUT_DIR || 'dist',
    emptyOutDir: true,
  },
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: ['**/public/wp-content/**', '**/tmp-site.html'],
    },
  },
})
