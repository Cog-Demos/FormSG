/// <reference types="vitest/globals" />
// jest-dom adds custom matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest'

import { setProjectAnnotations } from '@storybook/react'
import ResizeObserver from 'resize-observer-polyfill'

import * as globalStorybookConfig from '../.storybook/preview'

// Required as media query related functions throw in jsdom since the
// environment may not contain the window object.
vi.mock('@chakra-ui/media-query')

// Mock the window.matchMedia function since jsdom does not implement it.
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

vi.setConfig({ testTimeout: 20000 })
