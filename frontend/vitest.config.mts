import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.mts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      include: [
        'src/**/__tests__/**/*.{js,jsx,ts,tsx}',
        'src/**/*.{spec,test}.{js,jsx,ts,tsx}',
      ],
      mockReset: true,
      testTimeout: 20000,
      hookTimeout: 20000,
      css: false,
    },
  }),
)
