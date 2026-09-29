# Frontend modernization (Vite + Storybook 8 + Vitest + React 18 + Chakra v2 + TS 5.4)

Run suffix `vite-20260929-2123`. Epic
[MBA-2920](https://cog-gtm.atlassian.net/browse/MBA-2920).

## 1. Baseline on `develop` (commit `a272fd336`)

Machine: Ubuntu 22.04 x86_64, 8 vCPU / 31 GB, Node `v18.20.2` (`.nvmrc`), npm 10.5.0.
This table is the no-regressions bar for every ticket: nothing that passes here
may fail afterwards.

| Check                      | Command (repo root unless noted)                                                                                                                                                                                            | Baseline result                                                                                                                                                                         | Machine setup needed                                                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Install                    | `npm ci` (root `postinstall` installs `frontend/` and `shared/`)                                                                                                                                                            | pass (1 m 55 s)                                                                                                                                                                         | none                                                                                                                                          |
| Frontend Jest              | `cd frontend && CI=true npm test -- --watchAll=false`                                                                                                                                                                       | pass: 25 suites, 182 tests (41 s)                                                                                                                                                       | none                                                                                                                                          |
| Frontend lint              | `cd frontend && npm run lint`                                                                                                                                                                                               | **fail**: ESLint 0 errors / 34 warnings, Prettier flags `public/index.html`                                                                                                             | none                                                                                                                                          |
| Frontend `tsc`             | `cd frontend && npx tsc --noEmit`                                                                                                                                                                                           | **fail**: 206 errors, all TS 4.5 parse errors in `shared/node_modules/type-fest` + `@types/lodash` typings                                                                              | none                                                                                                                                          |
| Frontend build (CRA)       | `cd frontend && NODE_OPTIONS='--max-old-space-size=4096 --openssl-legacy-provider' npm run build`                                                                                                                           | pass with warnings (1 m 44 s); `dist/frontend/index.html` has 4 external `<script src>` tags (incl. `../static/js/datadog-chunk.*.js`), 0 inline; worker emitted as `*.chunk.worker.js` | `--openssl-legacy-provider` (webpack 4 on Node 18)                                                                                            |
| Storybook build (SB6)      | `cd frontend && npm run build-storybook`                                                                                                                                                                                    | pass (1 m 30 s)                                                                                                                                                                         | `--openssl-legacy-provider` (set by the script)                                                                                               |
| Backend `tsc`              | `npx tsc -p tsconfig.build.json --noEmit`                                                                                                                                                                                   | pass (16 s)                                                                                                                                                                             | none. (`npx tsc -p tsconfig.json` additionally type-checks `__tests__` and `frontend/node_modules` and fails with 74 errors; not a CI check.) |
| Backend lint               | `npm run lint-ci`                                                                                                                                                                                                           | pass                                                                                                                                                                                    | none                                                                                                                                          |
| Backend Jest               | `npm run test:backend:ci`                                                                                                                                                                                                   | pass: 153 suites, 2910 tests + 1 todo (3 m 50 s) once `serverless/virus-scanner` deps are installed (without them its 3 suites fail on `Cannot find module 'clamscan'`)                 | `libssl1.1` for `mongodb-memory-server`'s `mongod` (see below)                                                                                |
| `serverless/virus-scanner` | `npm_config_python=/usr/bin/python3 npm ci --prefix serverless/virus-scanner`; `cd serverless/virus-scanner && npx tsc --noEmit`; `npx env-cmd -f __tests__/setup/.test-env jest serverless/virus-scanner --coverage=false` | pass: install, `tsc`, 3 suites / 14 tests                                                                                                                                               | `cmake autoconf automake libtool libcurl4-openssl-dev g++ make` (native `aws-lambda-ric`), a Python with `distutils`                          |

### Machine setup (install commands)

```bash
# Node from .nvmrc
nvm install "$(cat .nvmrc)" && nvm use "$(cat .nvmrc)"

# mongodb-memory-server's mongod 4.0 links against OpenSSL 1.1 (not shipped on 22.04+)
curl -fsSL -o /tmp/libssl1.1.deb https://security.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2.24_amd64.deb
echo "7cf39d70a639017d1dd7c8d36daa2258063608688e449fddf40ffdd46f992a78  /tmp/libssl1.1.deb" | sha256sum -c -
sudo dpkg -i /tmp/libssl1.1.deb

# serverless/virus-scanner native deps (aws-lambda-ric builds with cmake + autotools + node-gyp)
sudo apt-get install -y cmake autoconf automake libtool libcurl4-openssl-dev g++ make
# node-gyp needs distutils; Python >= 3.12 dropped it, so point npm at the system 3.10
npm_config_python=/usr/bin/python3 npm ci --prefix serverless/virus-scanner
```

## 2. Dependency foundation (TICKET-0)

The only `frontend/package.json` + lockfile change before TICKET-G. Phase 1
tickets must not edit `package.json` or lockfiles: dependency changes are
requested in a Jira comment on the ticket and applied in TICKET-G.

Removed: `react-scripts`, `@craco/craco`, `craco-alias`, `worker-loader`,
`env-cmd`, `cross-env`, `@storybook/addon-storyshots(-puppeteer)`, `puppeteer`,
`@storybook/preset-create-react-app`, `storybook-preset-craco`,
`storybook-addon-turbo-build`, `@storybook/jest`, `@storybook/testing-library`,
`@storybook/testing-react`, `@storybook/node-logger`, `@storybook/addon-actions`
(bundled in `addon-essentials` 8), `html-webpack-plugin`,
`http-proxy-middleware`, `react-refresh`, `ts-jest`, `@types/jest`,
`react-beautiful-dnd` + types, `@types/storybook-react-router`, the
`react-error-overlay` override and the CRA `"proxy"` field.

| Area                | Packages                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Build               | `vite@5.4`, `@vitejs/plugin-react@4`, `vite-tsconfig-paths@4.3` (4.x ships a CJS entry, so `vite.config.ts` loads in this CommonJS package; 5.x is ESM-only and would force `.mts`), `vite-plugin-svgr@4`, `vite-plugin-node-polyfills@0.22` (`buffer`/`stream`/`crypto` shims for `@opengovsg/formsg-sdk`; TICKET-A picks the minimal set)                                                      |
| Tests               | `vitest@2.1`, `@vitest/coverage-v8@2.1`, `jsdom@25`, `@testing-library/react@16`, `@testing-library/dom@10`, `@testing-library/jest-dom@6`, `@testing-library/user-event@14.5`                                                                                                                                                                                                                   |
| Storybook           | `storybook@8.6` and every `@storybook/*` at 8.6 (`react`, `react-vite`, `test`, `addon-essentials`, `addon-a11y`, `addon-interactions`, `addon-links`, `blocks`, `theming`, `manager-api`), `eslint-plugin-storybook@0.8`, `storybook-react-i18next@3` (needs `i18next@23` / `react-i18next@14`), `msw@1.3.5` + `msw-storybook-addon@1.10` (lowest MSW that works with the SB8-compatible addon) |
| Router              | `react-router-dom@~6.3.0` (pinned: `NavigationContext.navigator.block`, used by `useNavigationPrompt.ts`, is gone from 6.4)                                                                                                                                                                                                                                                                      |
| React               | `react@18.3`, `react-dom@18.3`, `@types/react@18`, `@types/react-dom@18`, `@hello-pangea/dnd@16.6` (maintained, API-compatible fork of `react-beautiful-dnd`)                                                                                                                                                                                                                                    |
| Chakra              | `@chakra-ui/react@2.10.10`, `@chakra-ui/cli@2.5.8`, `framer-motion@11`                                                                                                                                                                                                                                                                                                                           |
| TS                  | `typescript@5.4.5` (exact), `@types/node@18`                                                                                                                                                                                                                                                                                                                                                     |
| React 18 peer bumps | `dayzed@3.2.3`, `react-joyride@2.9`, `react-query@3.39`, `react-table@7.8`, `react-hook-form@7.53`, `react-textarea-autosize@8.5`, `react-use@17.6`, `react-waypoint@10.3`, `chromatic@11`                                                                                                                                                                                                       |
| Tooling             | `patch-package@8` (6.x cannot read lockfile v3)                                                                                                                                                                                                                                                                                                                                                  |

`npm ci` needs no manual steps: `postinstall` runs `patch-package` (the
`@chakra-ui/form-control` v1 patch that drops the native `required` attribute
is re-created as `patches/@chakra-ui+react+2.10.10.patch` and applies),
`gen:theme-typings` (`chakra-cli tokens`, succeeds on CLI 2.5.8) and the
`shared/` install. `msw` regenerated `public/mockServiceWorker.js` for 1.3.5.

Scripts point at the Phase 1 tooling (`vite`, `vite build`, `vitest run`,
`storybook dev` / `build`); they work once TICKET-A/C/D land their configs.

## 3. Env-var rename plan (`REACT_APP_*` → `VITE_APP_*`)

Vite exposes only `VITE_`-prefixed variables through `import.meta.env`. Each
variable keeps its name with the prefix swapped.

| Old                                                                            | New                                                                              | Read in                                                   | Defined in                                                    |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------- |
| `REACT_APP_VERSION`                                                            | `VITE_APP_VERSION` (from `npm_package_version` via `define` in `vite.config.ts`) | `App.tsx`, `lazyRetry.ts`, `datadog-chunk.ts`             | `.buildtime-env`, `deploy-eb.yml`                             |
| `REACT_APP_URL`                                                                | `VITE_APP_URL`                                                                   | `growthbook.ts`, `axiosDebugFlow.tsx`, `datadog-chunk.ts` | `deploy-eb.yml`                                               |
| `REACT_APP_BASE_URL`                                                           | `VITE_APP_BASE_URL`                                                              | `ApiService.ts`                                           | —                                                             |
| `REACT_APP_GA_TRACKING_ID`                                                     | `VITE_APP_GA_TRACKING_ID`                                                        | `AppHelmet.tsx`, `index.tsx`                              | `.buildtime-env`, `deploy-eb.yml`, `docs/DEPLOYMENT_SETUP.md` |
| `REACT_APP_FORMSG_SDK_MODE`                                                    | `VITE_APP_FORMSG_SDK_MODE`                                                       | `formSdk.ts`                                              | `.buildtime-env`, `deploy-eb.yml`, `docs/DEPLOYMENT_SETUP.md` |
| `REACT_APP_DD_RUM_APP_ID`, `_CLIENT_TOKEN`, `_ENV`, `REACT_APP_DD_SAMPLE_RATE` | `VITE_APP_DD_RUM_APP_ID`, `_CLIENT_TOKEN`, `_ENV`, `VITE_APP_DD_SAMPLE_RATE`     | `App.tsx`, `datadog-chunk.ts`                             | `deploy-eb.yml`, `Dockerfile.production`                      |
| `process.env.NODE_ENV`                                                         | `import.meta.env.DEV` / `.PROD` / `.MODE`                                        | app code                                                  | —                                                             |
| `process.env.PUBLIC_URL`                                                       | `import.meta.env.BASE_URL`                                                       | `serviceWorker.ts`, `index.html`                          | —                                                             |

`.buildtime-env` is deleted (TICKET-A); local overrides go in
`frontend/.env.local` (git-ignored). GitHub secret names stay unchanged; only
the env names they map to change (TICKET-B).

## 4. Phase 1 file-ownership map

| Ticket                   | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Must not touch                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| A – Vite build           | `frontend/vite.config.ts` (everything except build options, imported from `vite.build.ts`), `frontend/index.html` (moved from `public/`), `frontend/tsconfig.json` (paths merged in), `frontend/src/vite-env.d.ts`, env-read / worker / SVG import lines in `frontend/src/**` (incl. `StorageResponsesService.ts`, `typings/worker-loader.d.ts`); deletes `craco.config.js`, `tsconfig.paths.json`, `src/setupProxy.js`, `src/react-app-env.d.ts`, `.buildtime-env` | `*.test.*`, `*.stories.*`, `.storybook/`, `.github/`, `Dockerfile*`, `datadog-chunk.ts`, `shared/`, `package.json` |
| B – Datadog + deploy     | `frontend/datadog-chunk.ts`, `frontend/tsconfig.dd.json`, `frontend/vite.build.ts` (build options + build-only plugins), `.github/**`, `Dockerfile.production`, `Dockerfile.development`, `README.md`, `docs/DEPLOYMENT_SETUP.md`; deletes `webpack.dd.config.js`                                                                                                                                                                                                   | other `frontend/src/**`, `.storybook/`, tests, `package.json` (script changes requested via Jira)                  |
| C – Storybook 8          | `frontend/.storybook/**` (→ `main.ts`, `preview.tsx`, `manager.ts`), `frontend/**/*.stories.*`, `frontend/**/*.mdx`, `frontend/src/mocks/**`; deletes `frontend/__tests__/storyshots/`                                                                                                                                                                                                                                                                              | non-story app code, tests, A/B/D configs, `package.json`                                                           |
| D – Vitest               | `frontend/vitest.config.ts`, `frontend/src/setupTests.ts` → `frontend/src/test/setup.ts`, `frontend/**/*.test.*`, `frontend/.eslintrc` (test env / globals); deletes `frontend/jest.config.js`                                                                                                                                                                                                                                                                      | app code, stories, `vite.config.ts`, `package.json`                                                                |
| E – React 18 + Chakra v2 | `frontend/src/**` app code (components, features, theme, `index.tsx` `createRoot`)                                                                                                                                                                                                                                                                                                                                                                                  | `*.test.*`, `*.stories.*`, env / worker / SVG import lines (A), `.storybook/`, `package.json`                      |
| F – Shared types TS5     | `shared/**` (except `package.json`/lockfile), backend `src/**` and `__tests__/**` consumers / fixtures, root `tsconfig*.json` if required                                                                                                                                                                                                                                                                                                                           | `frontend/**`, root `package.json`                                                                                 |

Overlap rules: where A and E touch the same file (e.g. `index.tsx`,
`App.tsx`), A owns only env / `PUBLIC_URL` / worker / SVG import lines and E
owns everything else; both keep edits minimal so the 3-way merge is clean. D
may add test-only shims in its setup file but not in app code.

TICKET-0 scaffolds two stubs so A and B never edit the same file:
`frontend/vite.config.ts` (A) imports `buildOptions` / `buildPlugins` from
`frontend/vite.build.ts` (B). A keeps `build: buildOptions` and spreads
`...buildPlugins` into `plugins`; B keeps those two exports. The stub already
registers `@vitejs/plugin-react`, `vite-tsconfig-paths` and `vite-plugin-svgr`
so C and D can run Storybook / Vitest on their branches before A lands.

## 5. Branches and Jira

All branches are cut from `feature/vite-20260929-2123-base` (= `develop` +
TICKET-0). Branches from earlier runs (`feature/vite-migration-base*`,
`feature/vite-*`, `feature/vite-v2-*`, `feature/vite-v3-*`) are not reused.

| Ticket                   | Jira                                                      | Branch                                                         |
| ------------------------ | --------------------------------------------------------- | -------------------------------------------------------------- |
| Epic                     | [MBA-2920](https://cog-gtm.atlassian.net/browse/MBA-2920) | —                                                              |
| 0 – Baseline + deps      | [MBA-2925](https://cog-gtm.atlassian.net/browse/MBA-2925) | `feature/vite-20260929-2123-base`                              |
| A – Vite build           | [MBA-2924](https://cog-gtm.atlassian.net/browse/MBA-2924) | `feature/vite-20260929-2123-A-build`                           |
| B – Datadog + deploy     | [MBA-2921](https://cog-gtm.atlassian.net/browse/MBA-2921) | `feature/vite-20260929-2123-B-datadog-deploy`                  |
| C – Storybook 8          | [MBA-2923](https://cog-gtm.atlassian.net/browse/MBA-2923) | `feature/vite-20260929-2123-C-storybook8`                      |
| D – Vitest               | [MBA-2928](https://cog-gtm.atlassian.net/browse/MBA-2928) | `feature/vite-20260929-2123-D-vitest`                          |
| E – React 18 + Chakra v2 | [MBA-2922](https://cog-gtm.atlassian.net/browse/MBA-2922) | `feature/vite-20260929-2123-E-react18-chakra2`                 |
| F – Shared types TS5     | [MBA-2926](https://cog-gtm.atlassian.net/browse/MBA-2926) | `feature/vite-20260929-2123-F-shared-ts5`                      |
| G – Consolidation        | [MBA-2927](https://cog-gtm.atlassian.net/browse/MBA-2927) | `feature/vite-20260929-2123-G-consolidation` → PR to `develop` |

## 6. Local verification setup

Filled in by TICKET-G (full stack for the end-to-end recording).
