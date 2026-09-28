// minimal config for TICKET-D; TICKET-A owns the real one
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

// Chakra v1 sub-package imports still present in app code until TICKET-E
// lands; all of them are re-exported from `@chakra-ui/react` in v2.
const chakraV1Subpackages = [
  'checkbox',
  'form-control',
  'icon',
  'layout',
  'media-query',
  'system',
]

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    // CRA-compatible SVG imports (`import { ReactComponent } from './x.svg'`,
    // default export stays the URL) until TICKET-A moves import sites to `?react`.
    svgr({
      include: '**/*.svg',
      svgrOptions: { exportType: 'named', namedExport: 'ReactComponent' },
    }),
  ],
  resolve: {
    alias: [
      ...chakraV1Subpackages.map((pkg) => ({
        find: new RegExp(`^@chakra-ui/${pkg}$`),
        replacement: '@chakra-ui/react',
      })),
      {
        find: /^@chakra-ui\/visually-hidden$/,
        replacement: fileURLToPath(
          new URL(
            './src/test/shims/chakra-visually-hidden.ts',
            import.meta.url,
          ),
        ),
      },
    ],
  },
})
