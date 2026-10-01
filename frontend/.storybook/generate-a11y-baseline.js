/* eslint-env node */
/**
 * Writes .storybook/a11y-baseline.json (storyId -> violated axe rule IDs) from
 * the jest JSON report of a strict test-storybook run.
 * Usage: node .storybook/generate-a11y-baseline.js <results.json>
 */
const { readFileSync, writeFileSync } = require('fs')
const { join } = require('path')

const HEADLINE = /accessibility violations? in .+ \(([^()\s]+)\)$/m
const RULE = /^\s*\[(?:critical|serious|moderate|minor|unknown)\] ([\w-]+):/gm
// eslint-disable-next-line no-control-regex
const ANSI = /\u001b\[[0-9;]*m/g

const [resultsPath] = process.argv.slice(2)
if (!resultsPath) {
  console.error(
    'Usage: generate-a11y-baseline.js <test-storybook --json output>',
  )
  process.exit(1)
}

const { testResults } = JSON.parse(readFileSync(resultsPath, 'utf8'))
const baseline = {}
for (const { assertionResults } of testResults) {
  for (const { failureMessages } of assertionResults) {
    for (const message of failureMessages.map((m) => m.replace(ANSI, ''))) {
      const headline = HEADLINE.exec(message)
      if (!headline) continue
      const storyId = headline[1]
      const rules = [...message.matchAll(RULE)].map(([, id]) => id)
      baseline[storyId] = [...new Set([...(baseline[storyId] || []), ...rules])]
    }
  }
}

const sorted = Object.fromEntries(
  Object.keys(baseline)
    .sort()
    .map((id) => [id, baseline[id].sort()]),
)
writeFileSync(
  join(__dirname, 'a11y-baseline.json'),
  `${JSON.stringify(sorted, null, 2)}\n`,
)
console.log(
  `Wrote ${Object.keys(sorted).length} stories to .storybook/a11y-baseline.json`,
)
