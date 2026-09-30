import '@testing-library/jest-dom/vitest'

import { setProjectAnnotations } from '@storybook/react'
import ResizeObserver from 'resize-observer-polyfill'

import * as globalStorybookConfig from '../../.storybook/preview'

// jsdom does not implement window.matchMedia.
// See https://github.com/ant-design/ant-design/issues/21096#issuecomment-725301551
window.matchMedia =
  window.matchMedia ||
  function (query: string): MediaQueryList {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }
  }

global.ResizeObserver = ResizeObserver

setProjectAnnotations(globalStorybookConfig)

vi.setConfig({ testTimeout: 20000 })
