import { PluginOption } from 'vite'
import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

// Tests run in Node, which already provides the built-ins that
// vite-plugin-node-polyfills shims for the browser bundle.
const isNodePolyfillsPlugin = (plugin: PluginOption) =>
  !!plugin && 'name' in plugin && plugin.name === 'vite-plugin-node-polyfills'

export default defineConfig((env) => {
  const baseConfig = viteConfig(env)
  return mergeConfig(
    {
      ...baseConfig,
      plugins: baseConfig.plugins?.filter((p) => !isNodePolyfillsPlugin(p)),
    },
    defineConfig({
      test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/vitest.setup.ts'],
        include: ['src/**/*.test.{ts,tsx}', 'src/**/__tests__/**/*.{ts,tsx}'],
        testTimeout: 20000,
        css: false,
      },
    }),
  )
})
