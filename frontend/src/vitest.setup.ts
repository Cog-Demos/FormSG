import '@testing-library/jest-dom/vitest'

import { setProjectAnnotations } from '@storybook/react'
import ResizeObserver from 'resize-observer-polyfill'

import * as globalStorybookConfig from '../.storybook/preview'

// Fixes TypeError: window.matchMedia is not a function in jsdom.
// See https://github.com/ant-design/ant-design/issues/21096#issuecomment-725301551
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }
  }

setProjectAnnotations(globalStorybookConfig)

global.ResizeObserver = ResizeObserver
