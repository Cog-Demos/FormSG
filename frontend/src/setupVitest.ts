/// <reference types="vitest/globals" />
// jest-dom adds custom matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest'

import { setProjectAnnotations } from '@storybook/react'
import ResizeObserver from 'resize-observer-polyfill'

import * as globalStorybookConfig from '../.storybook/preview'

// Required as vitest will throw errors when attempting to call media query related
// functions since the test environment may not contain the window object.
vi.mock('@chakra-ui/media-query')

// Fixes TypeError: window.matchMedia is not a function
// See https://github.com/ant-design/ant-design/issues/21096#issuecomment-725301551
global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }
  }

setProjectAnnotations(globalStorybookConfig)

// Mock the window.matchMedia function since the test environment may not contain it.
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }
  }

global.ResizeObserver = ResizeObserver
