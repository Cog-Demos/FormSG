/**
 * @chakra-ui/visually-hidden v2 ships only named exports, but app code
 * (e.g. src/components/Spinner/Spinner.tsx) still uses the CRA-era default
 * import, which breaks under Vite's real-ESM resolution. main.ts aliases the
 * package specifier to this file so stories render until TICKET-E migrates
 * that import. The relative path to the built entry avoids re-triggering the
 * alias.
 */
import { VisuallyHidden } from '../../node_modules/@chakra-ui/visually-hidden/dist/index.mjs'

export * from '../../node_modules/@chakra-ui/visually-hidden/dist/index.mjs'
export default VisuallyHidden
