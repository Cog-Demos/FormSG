// jest-dom adds custom matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest'

import { setGlobalConfig } from '@storybook/testing-react'
import ResizeObserver from 'resize-observer-polyfill'

import * as globalStorybookConfig from '../.storybook/preview'

// Required as the test environment will throw errors when attempting to call
// media query related functions since jsdom may not contain the window object.
vi.mock('@chakra-ui/media-query')

// Fixes TypeError: window.matchMedia is not a function in jsdom
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

setGlobalConfig(globalStorybookConfig)

global.ResizeObserver = ResizeObserver
