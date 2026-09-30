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
import type { ElementContext, Result, RunOptions, Spec } from 'axe-core'
import { configureAxe, getViolations, injectAxe } from 'axe-playwright'

interface A11yParameters {
  disable?: boolean
  element?: string
  exclude?: string | string[]
  disabledRules?: string[]
  options?: RunOptions
  config?: Spec
}

const STORYBOOK_ROOT = '#storybook-root'
const AXE_BUSY_RETRIES = 5
const AXE_BUSY_DELAY_MS = 200

const toAxeContext = ({
  element = STORYBOOK_ROOT,
  exclude,
}: A11yParameters): ElementContext =>
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
          ({ target, html }) => `  - ${target.join(' ')}\n      ${html}`,
        ),
      ].join('\n'),
    )
    .join('\n\n')

// addon-a11y may still be running its own axe pass on the same window.
const getViolationsWhenIdle = async (
  ...[page, context, options]: Parameters<typeof getViolations>
): Promise<Result[]> => {
  for (let attempt = 1; ; attempt++) {
    try {
      return await getViolations(page, context, options)
    } catch (e) {
      const isBusy =
        e instanceof Error && e.message.includes('Axe is already running')
      if (!isBusy || attempt >= AXE_BUSY_RETRIES) throw e
      await page.waitForTimeout(AXE_BUSY_DELAY_MS)
    }
  }
}

const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page)
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context)
    const a11y: A11yParameters = storyContext.parameters?.a11y ?? {}
    if (a11y.disable) return

    if (a11y.config) {
      await configureAxe(page, a11y.config)
    }

    const violations = await getViolationsWhenIdle(
      page,
      toAxeContext(a11y),
      toAxeOptions(a11y),
    )
    if (violations.length > 0) {
      throw new Error(
        `${violations.length} accessibility violation${violations.length === 1 ? '' : 's'} in ${context.title} › ${context.name}\n\n${formatViolations(violations)}`,
      )
    }
  },
}

export default config
