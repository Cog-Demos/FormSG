import type { PluginOption } from 'vite'
import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

// Tests run in Node, which already provides the built-ins that
// vite-plugin-node-polyfills shims for the browser bundle.
const isNodePolyfillsPlugin = (plugin: PluginOption) =>
  !!plugin && 'name' in plugin && plugin.name === 'vite-plugin-node-polyfills'

export default mergeConfig(
  {
    ...viteConfig,
    plugins: viteConfig.plugins?.filter((p) => !isNodePolyfillsPlugin(p)),
  },
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/setupVitest.ts'],
      // Same test file patterns as the previous CRA Jest setup.
      include: [
        'src/**/__tests__/**/*.{js,jsx,ts,tsx}',
        'src/**/*.{spec,test}.{js,jsx,ts,tsx}',
      ],
      testTimeout: 20000,
      hookTimeout: 20000,
      css: false,
    },
  }),
)
