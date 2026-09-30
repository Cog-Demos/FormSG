/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig, mergeConfig } from 'vitest/config'

// Minimal inline Vite config until `vite.config.ts` (TICKET-A) lands; then replace
// `viteConfig` with `import viteConfig from './vite.config'`.
const viteConfig = defineConfig({
  plugins: [react(), tsconfigPaths(), svgr()],
})

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/vitest.setup.ts'],
      // Same files as the CRA Jest `testMatch`.
      include: [
        'src/**/__tests__/**/*.{js,jsx,ts,tsx}',
        'src/**/*.{spec,test}.{js,jsx,ts,tsx}',
      ],
      // Effective timeout of the former CRA Jest setup (20 s override of the 5 s default).
      testTimeout: 20000,
      css: false,
    },
  }),
)
