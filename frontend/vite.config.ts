import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

import { buildOptions, buildPlugins } from './vite.build'

// Owned by TICKET-A, except `build` and build-only plugins (vite.build.ts, TICKET-B).
export default defineConfig({
  base: './',
  plugins: [react(), tsconfigPaths(), svgr(), ...buildPlugins],
  build: buildOptions,
})
