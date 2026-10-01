import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

// Build-only plugins that have no meaning in a test environment.
const EXCLUDED_PLUGINS = ['formsg:datadog-chunk']

const plugins = viteConfig.plugins?.filter(
  (plugin) =>
    !(plugin && 'name' in plugin && EXCLUDED_PLUGINS.includes(plugin.name)),
)

export default mergeConfig(
  { ...viteConfig, plugins },
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/setupTests.ts'],
      testTimeout: 20000,
      css: false,
      include: ['src/**/*.test.{ts,tsx}', 'src/**/__tests__/**/*.{ts,tsx}'],
    },
  }),
)
