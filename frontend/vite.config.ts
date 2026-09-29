import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  base: './',
  plugins: [react(), tsconfigPaths(), svgr()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': 'http://localhost:5001',
    },
    fs: {
      allow: ['..'],
    },
  },
  build: {
    outDir: '../dist/frontend',
    sourcemap: true,
  },
})
