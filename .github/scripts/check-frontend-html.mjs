// Asserts invariants of the built frontend HTML that the CSP and Datadog RUM
// depend on:
// - no inline <script> bodies (CSP forbids inline scripts);
// - every <script> has a src that exists in the build output;
// - exactly one classic (non-module, non-async/defer) datadog-chunk script in
//   <head>, placed before any app script, and self-contained (no imports).
//
// Usage: node .github/scripts/check-frontend-html.mjs [dist/frontend/index.html]
import fs from 'node:fs'
import path from 'node:path'

const htmlPath = path.resolve(process.argv[2] ?? 'dist/frontend/index.html')
const outDir = path.dirname(htmlPath)
const html = fs.readFileSync(htmlPath, 'utf8')
const errors = []

const headEnd = html.indexOf('</head>')
if (headEnd === -1) errors.push('no </head> found')

const attr = (attrs, name) =>
  attrs.match(
    new RegExp(
      `\\b${name}(?:\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+)))?`,
      'i',
    ),
  )

const scripts = [
  ...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi),
].map((m) => {
  const src = attr(m[1], 'src')
  return {
    index: m.index,
    attrs: m[1],
    body: m[2],
    src: src ? src[1] ?? src[2] ?? src[3] : undefined,
    isModule: /\btype\s*=\s*["']?module/i.test(m[1]),
    isAsyncOrDefer: /\b(async|defer)\b/i.test(m[1]),
  }
})

const resolveSrc = (src) =>
  path.join(outDir, src.replace(/^\.?\//, '').replace(/[?#].*$/, ''))

for (const s of scripts) {
  if (s.body.trim() !== '') {
    errors.push(
      `inline <script> body at offset ${s.index}: ${s.body.trim().slice(0, 80)}`,
    )
  }
  if (!s.src) {
    errors.push(`<script${s.attrs}> has no src`)
  } else if (
    !/^(https?:)?\/\//.test(s.src) &&
    !fs.existsSync(resolveSrc(s.src))
  ) {
    errors.push(`<script src="${s.src}"> does not exist in ${outDir}`)
  }
}

const ddScripts = scripts.filter((s) =>
  /(^|\/)static\/js\/datadog-chunk\.[\w-]+\.js$/.test(s.src ?? ''),
)
if (ddScripts.length !== 1) {
  errors.push(
    `expected exactly 1 datadog-chunk script, found ${ddScripts.length}`,
  )
} else {
  const [dd] = ddScripts
  if (dd.index > headEnd) errors.push('datadog-chunk script is not in <head>')
  if (dd.isModule || dd.isAsyncOrDefer) {
    errors.push('datadog-chunk script must be a classic blocking script')
  }
  const firstAppScript = scripts.find((s) => s !== dd)
  if (firstAppScript && firstAppScript.index < dd.index) {
    errors.push(
      `datadog-chunk script comes after app script ${firstAppScript.src}`,
    )
  }
  const ddFile = resolveSrc(dd.src)
  if (fs.existsSync(ddFile)) {
    const code = fs.readFileSync(ddFile, 'utf8')
    if (/^\s*(import|export)\b|\bimport\s*\(/m.test(code)) {
      errors.push('datadog-chunk is not self-contained (has import/export)')
    }
    if (!code.includes('DD_RUM')) {
      errors.push('datadog-chunk does not define window.DD_RUM')
    }
  }
}

if (errors.length > 0) {
  console.error(`${htmlPath}:\n  - ${errors.join('\n  - ')}`)
  process.exit(1)
}
console.log(
  `${htmlPath}: OK (${scripts.length} external scripts, 0 inline, datadog chunk ${ddScripts[0].src})`,
)
