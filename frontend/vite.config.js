import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3001,
    strictPort: true,
  },
  resolve: {
    alias: [
      {
        find: /^three$/,
        replacement: './node_modules/three/build/three.module.js',
      },
    ],
  },
  optimizeDeps: {
    include: ['three'],
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
})
