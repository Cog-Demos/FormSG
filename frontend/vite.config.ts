import { defineConfig } from 'vite'

import { buildOptions, buildPlugins } from './vite.build'

// Owned by TICKET-A, except `build` (see vite.build.ts, TICKET-B).
export default defineConfig({
  base: './',
  plugins: [...buildPlugins],
  build: buildOptions,
})
