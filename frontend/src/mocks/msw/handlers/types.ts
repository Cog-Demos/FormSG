import { DelayMode, HttpHandler } from 'msw'

export type WithDelayProps = {
  delay?: number | DelayMode
}

export type DefaultRequestReturn = HttpHandler
