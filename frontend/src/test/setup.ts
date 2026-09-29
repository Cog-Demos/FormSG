// jest-dom adds custom matchers for asserting on DOM nodes, e.g.
// expect(element).toHaveTextContent(/react/i)
// See https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest'

import { setProjectAnnotations } from '@storybook/react'
import ResizeObserver from 'resize-observer-polyfill'
import { vi } from 'vitest'

import * as projectAnnotations from '../../.storybook/preview'

// jsdom does not implement window.matchMedia.
// See https://github.com/ant-design/ant-design/issues/21096#issuecomment-725301551
window.matchMedia =
  window.matchMedia ||
  ((query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))

globalThis.ResizeObserver = ResizeObserver

setProjectAnnotations(projectAnnotations)

vi.setConfig({ testTimeout: 20000 })
