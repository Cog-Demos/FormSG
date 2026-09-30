/**
 * Storybook test-runner config for the a11y suite.
 * `npm run test:a11y` builds and serves the static Storybook, then runs axe
 * against every story. `npm run test:a11y-dev` targets a running dev server
 * on localhost:6006.
 *
 * Per-story `parameters.a11y` is honored with the same keys as
 * `@storybook/addon-a11y` and the former storyshots `axeTest`:
 * `disable`, `element`, `exclude`, `disabledRules`, `options` (axe.run
 * options) and `config` (axe.configure spec).
 */
import type { TestRunnerConfig } from '@storybook/test-runner'
import { getStoryContext } from '@storybook/test-runner'
import type AxeCore from 'axe-core'
import type { Result, RunOptions, Spec } from 'axe-core'
import { readFileSync } from 'fs'

type Page = Parameters<NonNullable<TestRunnerConfig['preVisit']>>[0]

interface A11yParameters {
  disable?: boolean
  element?: string
  exclude?: string | string[]
  disabledRules?: string[]
  options?: RunOptions
  config?: Spec
}

const STORYBOOK_ROOT = '#storybook-root'
const SETTLE_TIMEOUT_MS = 5000

const toAxeContext = ({
  element = STORYBOOK_ROOT,
  exclude,
}: A11yParameters): string | { include: string[]; exclude: string[] } =>
  exclude
    ? { include: [element], exclude: ([] as string[]).concat(exclude) }
    : element

const toAxeOptions = ({
  options,
  disabledRules = [],
}: A11yParameters): RunOptions => ({
  ...options,
  rules: {
    ...options?.rules,
    ...Object.fromEntries(disabledRules.map((id) => [id, { enabled: false }])),
  },
})

const formatViolations = (violations: Result[]): string =>
  violations
    .map(({ id, impact, help, helpUrl, nodes }) =>
      [
        `[${impact ?? 'unknown'}] ${id}: ${help} (${nodes.length} node${nodes.length === 1 ? '' : 's'})`,
        `  ${helpUrl}`,
        ...nodes.map(
          ({ target, html, failureSummary }) =>
            `  - ${target.join(' ')}\n      ${html}` +
            (failureSummary
              ? `\n      ${failureSummary.replace(/\n/g, '\n      ')}`
              : ''),
        ),
      ].join('\n'),
    )
    .join('\n\n')

// addon-a11y lazily imports its own axe-core module, which overwrites
// window.axe and runs its own pass after every story. Scans therefore use a
// private instance injected per story rather than whatever window.axe is.
type AxeWindow = { axe?: typeof AxeCore; __testRunnerAxe: typeof AxeCore }

const AXE_SOURCE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')

const injectPrivateAxe = (page: Page): Promise<void> =>
  page.evaluate((source) => {
    const w = window as unknown as AxeWindow
    const previous = w.axe
    window.eval(source)
    w.__testRunnerAxe = w.axe
    w.axe = previous
  }, AXE_SOURCE)

// Axe samples computed colours, so finite CSS transitions/animations (e.g.
// Chakra background-color transitions) must finish before it runs.
const waitForStoryToSettle = (page: Page): Promise<void> =>
  page.evaluate(async (timeoutMs) => {
    const settled = (async () => {
      await document.fonts.ready
      await Promise.all(
        document
          .getAnimations()
          .filter((a) => a.effect?.getTiming().iterations !== Infinity)
          .map((a) => a.finished.catch(() => undefined)),
      )
    })()
    await Promise.race([
      settled,
      new Promise((resolve) => setTimeout(resolve, timeoutMs)),
    ])
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    )
  }, SETTLE_TIMEOUT_MS)

const scanWithInjectedAxe = (
  page: Page,
  a11y: A11yParameters,
): Promise<Result[]> =>
  page.evaluate(
    async ({ context, options, spec }) => {
      const axe = (window as unknown as AxeWindow).__testRunnerAxe
      if (spec) axe.configure(spec)
      const { violations } = await axe.run(context, options)
      return violations
    },
    {
      context: toAxeContext(a11y),
      options: toAxeOptions(a11y),
      spec: a11y.config,
    },
  )

const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectPrivateAxe(page)
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context)
    const a11y: A11yParameters = storyContext.parameters?.a11y ?? {}
    if (a11y.disable) return

    await waitForStoryToSettle(page)
    const violations = await scanWithInjectedAxe(page, a11y)
    if (violations.length > 0) {
      throw new Error(
        `${violations.length} accessibility violation${violations.length === 1 ? '' : 's'} in ${context.title} › ${context.name}\n\n${formatViolations(violations)}`,
      )
    }
  },
}

export default config
