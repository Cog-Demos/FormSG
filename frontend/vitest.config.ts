import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default defineConfig(async (env) =>
  mergeConfig(
    typeof viteConfig === 'function' ? await viteConfig(env) : viteConfig,
    {
      test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/vitest.setup.ts'],
        testTimeout: 5000,
        include: ['src/**/*.test.{ts,tsx}', 'src/**/__tests__/**/*.{ts,tsx}'],
        css: false,
      },
    },
  ),
)
