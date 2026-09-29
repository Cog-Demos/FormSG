import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

import { buildOptions, buildPlugins } from './vite.build'

// Scaffold from TICKET-0. TICKET-A owns this file; TICKET-B owns vite.build.ts.
export default defineConfig({
  plugins: [react(), tsconfigPaths(), svgr(), ...buildPlugins],
  build: buildOptions,
})
