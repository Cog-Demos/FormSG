# Frontend modernization (Vite + Storybook 8 + Vitest + React 18 + Chakra v2 + TS 5.4)

TICKET-0 deliverable: the no-regressions baseline, the dependency foundation,
the env-var rename plan and the Phase 1 file-ownership map.

## 1. Baseline on `develop` (commit `69673cce0`)

Machine: Ubuntu 22.04 x86_64, 8 vCPU / 31 GB, Node `v18.20.2` (`.nvmrc`), npm 10.5.0.

| Check | Command (repo root unless noted) | Result | Machine setup needed |
| --- | --- | --- | --- |
| Install | `npm ci` (root `postinstall` runs `npm --prefix frontend install` and `npm --prefix shared install`) | pass (~2 m) | none |
| Frontend Jest | `cd frontend && CI=true npm test -- --watchAll=false` | pass: 25 suites, 182 tests (~38 s) | none |
| Frontend lint | `cd frontend && npm run lint` | pass | none |
| Frontend `tsc` | `cd frontend && npx tsc --noEmit` | **fail**: 206 errors, all TS 4.5 parse errors in `shared/node_modules` typings (`@types/lodash`, `type-fest`) | none |
| Frontend build (CRA) | `cd frontend && NODE_OPTIONS='--max-old-space-size=6144 --openssl-legacy-provider' npm run build` | pass with warnings (~2 m); `dist/frontend/index.html` has 4 external `<script>` tags incl. `../static/js/datadog-chunk.*.js`, 0 inline; worker emitted as `decryption.worker.*.js` | `--openssl-legacy-provider` (webpack 4 on Node 18) |
| Storybook build (SB6) | `cd frontend && npm run build-storybook` | pass (~2 m 30 s) | `--openssl-legacy-provider` (set by the script) |
| Backend `tsc` | `npx tsc -p tsconfig.build.json --noEmit` | pass | none |
| Backend lint | `npm run lint-ci` | pass | none |
| Backend Jest (includes `serverless/virus-scanner` specs via root `jest.config.js`) | `npm run test:backend:ci` | pass: 153 suites, 2910 tests + 1 todo (~4 m 45 s) | `mongodb-memory-server`'s `mongod` needs `libcrypto.so.1.1`: on Ubuntu 22.04 install `libssl1.1_1.1.1f-1ubuntu2.24_amd64.deb` from `security.ubuntu.com` (focal). Without it every DB-backed suite fails to start. |
| `serverless/virus-scanner` install + `tsc` | `cd serverless/virus-scanner && npm ci && npx tsc --noEmit` | pass | `cmake autoconf automake libtool libcurl4-openssl-dev` (native `aws-lambda-ric` build) and a Python with `distutils` (`npm_config_python=/usr/bin/python3` when the default `python3` is 3.12+) |

This table is the bar for every ticket: nothing that passes here may fail
afterwards; frontend `tsc` must go from fail to pass.

## 2. Dependency foundation (the only `frontend/package.json` + lockfile change before TICKET-G)

Lockfile resolved with `npm install --before=2026-09-21` (no version newer than 7 days).

Removed: `react-scripts`, `@craco/craco`, `craco-alias`, `worker-loader`,
`env-cmd`, `cross-env`, `@storybook/addon-storyshots(-puppeteer)`, `puppeteer`,
`@storybook/preset-create-react-app`, `storybook-preset-craco`,
`storybook-addon-turbo-build`, `@storybook/jest`, `@storybook/testing-library`,
`@storybook/testing-react`, `@storybook/node-logger`, `@storybook/addon-actions`
(bundled in `addon-essentials` 8), `html-webpack-plugin`,
`http-proxy-middleware`, `react-refresh`, `ts-jest`, `@types/jest`,
`react-beautiful-dnd` + types, `@types/storybook-react-router`, the
`react-error-overlay` override and the CRA `"proxy"` field.

Added / upgraded (resolved versions):

| Area | Packages |
| --- | --- |
| Build | `vite@5.4`, `@vitejs/plugin-react@4.7`, `vite-tsconfig-paths@5`, `vite-plugin-svgr@4`, `vite-plugin-node-polyfills@0.22` (`buffer`/`stream`/`crypto` shims for `@opengovsg/formsg-sdk`; TICKET-A decides the minimal set) |
| Tests | `vitest@2.1`, `@vitest/coverage-v8@2.1`, `jsdom@25`, `@testing-library/react@16`, `@testing-library/dom@10`, `@testing-library/jest-dom@6`, `@testing-library/user-event@14.5` |
| Storybook | `storybook@8.6.18` and every `@storybook/*` at `8.6.18` (`react`, `react-vite`, `test`, `addon-essentials`, `addon-a11y`, `addon-interactions`, `addon-links`, `blocks`, `theming`, `manager-api`), `eslint-plugin-storybook@0.8`, `storybook-react-i18next@3` (needs `i18next@23` / `react-i18next@14`, upgraded), `msw@1.3.5` + `msw-storybook-addon@1.10` (lowest MSW that works with the SB8-compatible addon) |
| React | `react@18.3`, `react-dom@18.3`, `@types/react@18`, `@types/react-dom@18`, `@hello-pangea/dnd@16.6` (maintained, API-compatible fork of `react-beautiful-dnd`) |
| Chakra | `@chakra-ui/react@2.10.10`, `@chakra-ui/cli@2.5.8`, `framer-motion@11` |
| TS | `typescript@5.4.5` (exact), `@types/node@18` |
| React 18 peer bumps | `dayzed@3.2.3`, `react-joyride@2.9`, `react-query@3.39`, `react-table@7.8`, `react-hook-form@7.53+`, `react-textarea-autosize@8.5`, `react-use@17.6`, `react-waypoint@10.3`, `chromatic@11` |
| Tooling | `patch-package@8` (6.x cannot read lockfile v3) |

`npm ci` needs no manual steps: `postinstall` runs `patch-package` (the
`@chakra-ui/form-control` v1 patch that drops the native `required` attribute
is re-created as `patches/@chakra-ui+react+2.10.10.patch` and applies),
`gen:theme-typings` (`chakra-cli tokens`, succeeds on Chakra CLI 2.5.8) and the
`shared/` install. `msw` regenerated `public/mockServiceWorker.js` for 1.3.5.

Scripts already point at the Phase 1 tooling (`vite`, `vite build`,
`vitest run`, `storybook dev/build`); they work once TICKET-A/C/D land their
configs. Phase 1 tickets must not edit `package.json`/lockfiles: dependency
changes are requested in a Jira comment on the ticket and applied in TICKET-G.

## 3. Env-var rename plan (`REACT_APP_*` → `VITE_APP_*`)

Vite exposes only `VITE_`-prefixed variables through `import.meta.env`. Each
variable keeps its name with the prefix swapped (`envPrefix` stays `VITE_`).

| Old | New | Read in | Defined in |
| --- | --- | --- | --- |
| `REACT_APP_VERSION` | `VITE_APP_VERSION` (from `npm_package_version`, via `define` in `vite.config.mts`) | `App.tsx`, `lazyRetry.ts`, `datadog-chunk.ts` | `.buildtime-env`, `deploy-eb.yml` |
| `REACT_APP_URL` | `VITE_APP_URL` | `growthbook.ts`, `axiosDebugFlow.tsx`, `datadog-chunk.ts` | `deploy-eb.yml` |
| `REACT_APP_BASE_URL` | `VITE_APP_BASE_URL` | `ApiService.ts` | — |
| `REACT_APP_GA_TRACKING_ID` | `VITE_APP_GA_TRACKING_ID` | `AppHelmet.tsx`, `index.tsx` | `.buildtime-env`, `deploy-eb.yml` |
| `REACT_APP_FORMSG_SDK_MODE` | `VITE_APP_FORMSG_SDK_MODE` | `formSdk.ts` | `.buildtime-env`, `deploy-eb.yml`, `playwright.yml` |
| `REACT_APP_DD_RUM_APP_ID`, `_CLIENT_TOKEN`, `_ENV`, `REACT_APP_DD_SAMPLE_RATE` | `VITE_APP_DD_RUM_APP_ID`, `_CLIENT_TOKEN`, `_ENV`, `VITE_APP_DD_SAMPLE_RATE` | `App.tsx`, `datadog-chunk.ts` | `deploy-eb.yml`, `Dockerfile.production` |
| `process.env.NODE_ENV` | `import.meta.env.DEV` / `.PROD` / `.MODE` | `index.tsx`, `App.tsx`, `growthbook.ts`, `formSdk.ts`, `serviceWorker.ts`, workflow/settings components, decryption worker | — |
| `process.env.PUBLIC_URL` | `import.meta.env.BASE_URL` | `serviceWorker.ts`, `index.html` | — |

`.buildtime-env` is deleted (TICKET-A); local overrides go in
`frontend/.env.local` (git-ignored). GitHub secret names stay unchanged; only
the build-arg / env names they are mapped to change (TICKET-B).

## 4. Phase 1 file-ownership map

| Ticket | Owns | Must not touch |
| --- | --- | --- |
| A – Vite build | `frontend/vite.config.mts` (everything except the `build` section, which it imports from `vite.build.mts`), `frontend/index.html` (moved from `public/`), `frontend/tsconfig.json` (paths merged in), `frontend/src/vite-env.d.ts`, env reads / worker / SVG import lines in `frontend/src/**` (incl. `StorageResponsesService.ts`, `typings/worker-loader.d.ts`), deletions: `craco.config.js`, `tsconfig.paths.json`, `src/setupProxy.js`, `src/react-app-env.d.ts`, `.buildtime-env` | `*.test.*`, `*.stories.*`, `.storybook/`, `.github/`, `Dockerfile*`, `datadog-chunk.ts`, `shared/`, `package.json` |
| B – Datadog + deploy | `frontend/datadog-chunk.ts`, `frontend/tsconfig.dd.json`, `frontend/vite.build.mts` (the `build` section + build-only plugins, imported by `vite.config.mts`), `.github/**`, `Dockerfile.production`, deletion of `webpack.dd.config.js` | other `frontend/src/**`, `.storybook/`, tests, `package.json` (script changes requested via Jira) |
| C – Storybook 8 | `frontend/.storybook/**` (→ `main.ts`, `preview.tsx`, `manager.ts`), `frontend/**/*.stories.*`, `frontend/**/*.mdx`, deletion of `frontend/__tests__/storyshots/` | non-story app code, tests, A/B/D configs, `package.json` |
| D – Vitest | `frontend/vitest.config.ts`, `frontend/src/setupTests.ts` → `frontend/src/test/setup.ts`, `frontend/src/test-utils.tsx`, `frontend/**/*.test.*`, deletion of `frontend/jest.config.js` | app code, stories, `vite.config.mts`, `package.json` |
| E – React 18 + Chakra v2 | `frontend/src/**` app code (components, features, theme, `index.tsx` `createRoot`) | `*.test.*`, `*.stories.*`, env / worker / SVG import lines (A), `.storybook/`, `package.json` |
| F – Shared types TS5 | `shared/**`, backend `src/**` and `__tests__/**` consumers / fixtures, root `tsconfig*.json` if required | `frontend/**` |

Overlap rules: if A and E touch the same file (e.g. `index.tsx`, `App.tsx`), A
owns only env / `PUBLIC_URL` / worker / SVG import lines and E owns everything
else; both keep edits minimal so the 3-way merge is clean. D may add
test-only shims in its setup file but not in app code.

TICKET-0 scaffolds two stubs so A and B never edit the same file:
`frontend/vite.config.mts` (A) imports `buildOptions` / `buildPlugins` from
`frontend/vite.build.mts` (B). A must keep `build: buildOptions` and spread
`...buildPlugins` into `plugins`; B must keep those two exports.

The Vite config files use the `.mts` extension because `frontend/` is a
CommonJS package (no `"type": "module"`) and `vite-tsconfig-paths@5` is
ESM-only, which Vite cannot `require` from a `.ts` config. `.eslintrc` lints
`*.mts` with the TypeScript parser. The stub already registers
`@vitejs/plugin-react`, `vite-tsconfig-paths` and `vite-plugin-svgr` so C and D
can run Storybook / Vitest on their branches before A lands.
