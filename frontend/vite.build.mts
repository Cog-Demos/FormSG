import type { BuildOptions, PluginOption } from 'vite'

// Owned by TICKET-B: production build options and build-only plugins
// (separate Datadog chunk). Consumed by vite.config.mts.
export const buildOptions: BuildOptions = {
  outDir: '../dist/frontend',
  emptyOutDir: true,
  sourcemap: true,
}

export const buildPlugins: PluginOption[] = []
