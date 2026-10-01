// jest-dom adds custom matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest'

import { setProjectAnnotations } from '@storybook/react'
import ResizeObserver from 'resize-observer-polyfill'

import * as projectAnnotations from '../.storybook/preview'

// Required as the test environment will throw errors when attempting to call
// media query related functions since jsdom may not contain the window object.
vi.mock('@chakra-ui/media-query')

// The addon's node build cannot be loaded on Node 18; see the module for details.
vi.mock('msw-storybook-addon', () => import('./vitest/msw-storybook-addon'))

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

setProjectAnnotations(projectAnnotations)

global.ResizeObserver = ResizeObserver
