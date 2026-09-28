import '@testing-library/jest-dom/vitest'

import { setProjectAnnotations } from '@storybook/react'
import ResizeObserver from 'resize-observer-polyfill'
import { vi } from 'vitest'

import * as projectAnnotations from '../../.storybook/preview'

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
