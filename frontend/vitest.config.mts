import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.mjs'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      testTimeout: 20000,
      include: ['src/**/*.test.{ts,tsx}', 'src/**/__tests__/**/*.{ts,tsx}'],
      css: false,
      server: {
        deps: {
          inline: ['react-markdown'],
        },
      },
      coverage: {
        provider: 'v8',
      },
    },
  }),
)
