/**
 * Node implementation of `msw-storybook-addon` for Vitest.
 *
 * The addon's own node build is CommonJS and `require`s `msw/node`, which in
 * turn `require`s the ESM-only `rettime` package. That fails on Node 18
 * (`ERR_REQUIRE_ESM`). Importing `msw/node` from ESM resolves to its `.mjs`
 * build instead, which works on all supported Node versions.
 */
import type { RequestHandler } from 'msw'
import { setupServer } from 'msw/node'
import type { Context } from 'msw-storybook-addon'

type SetupServer = ReturnType<typeof setupServer>
type InitializeOptions = Parameters<SetupServer['listen']>[0]

let api: SetupServer | undefined

export const initialize = (
  options?: InitializeOptions,
  initialHandlers: RequestHandler[] = [],
): SetupServer => {
  const server = setupServer(...initialHandlers)
  server.listen(options)
  api = server
  return server
}

export const getWorker = (): SetupServer => {
  if (api === undefined) {
    throw new Error(
      '[MSW] Failed to retrieve the worker: no active worker found. Did you forget to call "initialize"?',
    )
  }
  return api
}

export const applyRequestHandlers = (
  handlersListOrObject: Context['parameters']['msw'],
): void => {
  api?.resetHandlers()
  if (handlersListOrObject == null) return
  if (Array.isArray(handlersListOrObject)) {
    if (handlersListOrObject.length > 0) api?.use(...handlersListOrObject)
    return
  }
  if (handlersListOrObject.handlers) {
    const handlers = Object.values(handlersListOrObject.handlers)
      .filter(Boolean)
      .reduce<RequestHandler[]>(
        (acc, handlersList) => acc.concat(handlersList),
        [],
      )
    if (handlers.length > 0) api?.use(...handlers)
  }
}

export const mswLoader = async (context: Context): Promise<object> => {
  getWorker()
  applyRequestHandlers(context.parameters.msw)
  return {}
}

export const mswDecorator = <Story extends () => unknown>(
  storyFn: Story,
  context: Context,
): unknown => {
  applyRequestHandlers(context.parameters.msw)
  return storyFn()
}
