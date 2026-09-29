import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

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
      // Parity with CRA's Jest defaults (`resetMocks: true`).
      mockReset: true,
      testTimeout: 5000,
      css: false,
      server: {
        deps: {
          inline: ['react-markdown'],
        },
      },
    },
  }),
)
