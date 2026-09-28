import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.mts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      testTimeout: 20000,
      hookTimeout: 20000,
      css: false,
      include: ['src/**/*.test.{ts,tsx}', 'src/**/__tests__/**/*.{ts,tsx}'],
      exclude: ['**/node_modules/**', '__tests__/storyshots/**', 'e2e/**'],
    },
  }),
)
