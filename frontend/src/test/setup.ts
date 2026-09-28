import '@testing-library/jest-dom/vitest'

import { setProjectAnnotations } from '@storybook/react'
import ResizeObserver from 'resize-observer-polyfill'
import { vi } from 'vitest'

import * as projectAnnotations from '../../.storybook/preview'

// `keyframes` is no longer re-exported by `@chakra-ui/react` v2.10; app code
// still imports it from there until TICKET-E moves it to `@emotion/react`.
vi.mock('@chakra-ui/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@chakra-ui/react')>()
  const { keyframes } = await import('@emotion/react')
  return { ...actual, keyframes }
})

const matchMediaMock = () => ({
  matches: false,
  media: '',
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})

window.matchMedia = window.matchMedia || matchMediaMock
globalThis.matchMedia = globalThis.matchMedia || matchMediaMock

globalThis.ResizeObserver = ResizeObserver

setProjectAnnotations(projectAnnotations)
