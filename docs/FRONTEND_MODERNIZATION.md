# Frontend modernization: Vite + Storybook 8 + Vitest + React 18 + Chakra v2 + TS5

Epic: [MBA-2948](https://cog-gtm.atlassian.net/browse/MBA-2948) · suffix `vite-20260930-0032` · base branch `feature/vite-20260930-0032-base`

## Baseline (TICKET-0, `develop` @ `61afcde4d`, before any change)

Measured on Ubuntu 22.04, 8 vCPU / 31 GB, Node `v18.20.2` (from `.nvmrc`), npm `10.5.0`.

| Check | Command | Result | Time |
| --- | --- | --- | --- |
| Frontend Jest | `cd frontend && CI=true npm test -- --watchAll=false` | pass — 25 suites, 182 tests | 1 m 13 s |
| Backend Jest (incl. `serverless/virus-scanner` specs) | `npm run test:backend:ci` | pass — 153 suites, 2910 tests (+1 todo) | 5 m 11 s |
| `serverless/virus-scanner` | `cd serverless/virus-scanner && npm ci && npx tsc --noEmit` | pass (no own test script; its specs run in backend Jest) | — |
| Full build | `NODE_OPTIONS='--max-old-space-size=4096 --openssl-legacy-provider' npm run build` | pass — `dist/frontend` with separate `static/js/datadog-chunk.*.js` and `decryption.worker.*.js`, no inline scripts | 1 m 56 s |
| Storybook build | `cd frontend && npm run build-storybook` | pass | 2 m 56 s |
| Frontend lint | `npm run lint:frontend` | pass — 0 errors, 34 warnings | — |
| Backend lint | `npm run lint-ci` | pass | — |
| Backend `tsc` (build) | `npx tsc --noEmit -p tsconfig.build.json` | pass | — |
| Backend `tsc` (incl. tests) | `npx tsc --noEmit -p tsconfig.json` | fail — 74 errors (test files, `frontend/node_modules`, `~shared` alias) | — |
| Frontend `tsc` | `cd frontend && npx tsc --noEmit` | fail — 206 errors, all in `../shared/node_modules` (`type-fest` 4 / `@types/lodash` need TS ≥ 5) | — |

Every row must match or beat this after each ticket. The two `tsc` rows that fail at baseline are expected to become passes (frontend) or stay no worse (backend including tests).

Note: the baseline `build:dd-chunk` step rewrites `frontend/public/index.html` in place (html-webpack-plugin injects the Datadog `<script>`), which then fails `prettier -c`. Run lint on a clean tree.

## Machine setup

The baseline and the migrated stack need the following on a fresh Ubuntu 22.04 machine:

```bash
# Node from .nvmrc (make sure it is first on PATH; some images ship a newer global node)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.nvm/nvm.sh && nvm install "$(cat .nvmrc)" && nvm alias default "$(cat .nvmrc)" && nvm use "$(cat .nvmrc)"

# Native build tools (serverless/virus-scanner -> aws-lambda-ric needs cmake + autotools)
sudo apt-get update && sudo apt-get install -y build-essential g++ make cmake autoconf automake libtool python3-setuptools
# node-gyp needs a Python with distutils; if python3 on PATH is >= 3.12 (e.g. pyenv), point npm at the system one
export npm_config_python=/usr/bin/python3

# libssl1.1 — required by the mongodb-memory-server binary used in backend Jest
wget -O /tmp/libssl1.1.deb http://security.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2.24_amd64.deb
echo "7cf39d70a639017d1dd7c8d36daa2258063608688e449fddf40ffdd46f992a78  /tmp/libssl1.1.deb" | sha256sum -c -
sudo dpkg -i /tmp/libssl1.1.deb

# Dependencies
npm ci                                   # root (runs frontend + shared installs via postinstall)
(cd serverless/virus-scanner && npm ci)  # its specs are part of backend Jest
```

## Dependency foundation (TICKET-0, [MBA-2953](https://cog-gtm.atlassian.net/browse/MBA-2953))

This is the only `frontend/package.json` / `frontend/package-lock.json` change in the epic; Phase 1 tickets must not touch either (request changes as a Jira comment on the ticket; TICKET-G applies them).

- Removed: `react-scripts`, `@craco/craco`, `craco-alias`, `worker-loader`, `env-cmd`, `@storybook/addon-storyshots(-puppeteer)`, `puppeteer`, `@storybook/preset-create-react-app`, `storybook-preset-craco`, `storybook-addon-turbo-build`, `@storybook/jest`, `@storybook/testing-library`, `@storybook/testing-react`, `@storybook/node-logger`, `ts-jest`, `@types/jest`, `react-beautiful-dnd` (+ types), `html-webpack-plugin`, `http-proxy-middleware`, `react-refresh`, `@types/storybook-react-router`, the CRA `proxy` field and the `react-error-overlay` override.
- Added / upgraded: `vite` 5.4, `@vitejs/plugin-react` 4, `vite-tsconfig-paths` 4, `vite-plugin-svgr` 4, `vite-plugin-node-polyfills` 0.22 (`@opengovsg/formsg-sdk` requires `crypto`/`stream`/`util`/`events`/`buffer`, which Webpack 4 polyfilled implicitly), `vitest` 2.1 + `jsdom` 24, Storybook 8.6 (`storybook`, `@storybook/react-vite`, `@storybook/test`, `@storybook/blocks`, `@storybook/manager-api`, addons), `msw-storybook-addon` 1.10 (keeps `msw` 0.36, the lowest that works), `storybook-react-i18next` 3, `eslint-plugin-storybook` 0.8, React / React DOM 18.3, `@types/react(-dom)` 18.3, `@chakra-ui/react` ~2.8.2 + `@chakra-ui/cli` 2, `framer-motion` 10, `typescript` ~5.4.5, `@testing-library/react` 16 / `dom` 10 / `jest-dom` 6 / `user-event` 14.6, `@hello-pangea/dnd` 16 (maintained, API-compatible `react-beautiful-dnd` fork).
- Bumped within their majors so their peer ranges include React 18: `dayzed`, `react-hook-form` (7.29), `react-joyride`, `react-query` (3.39), `react-table` (7.8), `react-textarea-autosize`, `react-use`, `react-waypoint`. `react-wordcloud` has no React 18 release; `legacy-peer-deps` in `frontend/.npmrc` already covers it.
- `patches/@chakra-ui+form-control+1.6.0.patch` → `patches/@chakra-ui+form-control+2.2.0.patch` (same change: don't forward native `required`). Verified: `patch-package` reports `@chakra-ui/form-control@2.2.0 ✔`.
- `gen:theme-typings` now passes `--out node_modules/@chakra-ui/styled-system/dist/theming.types.d.ts` (the CLI's default lookup path does not exist in styled-system 2.9) and no longer swallows failures with `|| true`. Verified: typings file is generated during `npm ci`.
- Scripts: `start` → `vite`, `build` → `vite build`, `preview`, `test` → `vitest run`, `test:watch`, `storybook` → `storybook dev -p 6006`, `build-storybook` → `storybook build`; `eject`, `build:dd-chunk`, `test:a11y*` removed.
- `rm -rf frontend/node_modules && (cd frontend && npm ci)` completes in ~27 s with no manual steps.

Until Phase 1 lands, the base branch intentionally does not build or test: the scripts point at Vite/Vitest/Storybook 8 config that tickets A–D create.

## Env-var rename plan

Vite exposes only prefixed vars on `import.meta.env`; the prefix becomes `VITE_APP_` (`envPrefix: 'VITE_APP_'` in `vite.config.ts`). Every read moves from `process.env.REACT_APP_X` to `import.meta.env.VITE_APP_X`, typed in `frontend/src/vite-env.d.ts`.

| Old (CRA) | New (Vite) | Read in | Set in |
| --- | --- | --- | --- |
| `REACT_APP_VERSION` | `VITE_APP_VERSION` | `App.tsx`, `lazyRetry.ts`, `datadog-chunk.ts` | `.buildtime-env` (`$npm_package_version`) → `vite.config.ts` from `process.env.npm_package_version`; `deploy-eb.yml` |
| `REACT_APP_URL` | `VITE_APP_URL` | `growthbook.ts`, `axiosDebugFlow.tsx`, `datadog-chunk.ts` | `deploy-eb.yml` |
| `REACT_APP_BASE_URL` | `VITE_APP_BASE_URL` | `ApiService.ts` | deploy (optional) |
| `REACT_APP_GA_TRACKING_ID` | `VITE_APP_GA_TRACKING_ID` | `AppHelmet.tsx`, `index.tsx` | `.buildtime-env`, `deploy-eb.yml`, `docs/DEPLOYMENT_SETUP.md` |
| `REACT_APP_FORMSG_SDK_MODE` | `VITE_APP_FORMSG_SDK_MODE` | `formSdk.ts` | `.buildtime-env`, `deploy-eb.yml`, `docs/DEPLOYMENT_SETUP.md` |
| `REACT_APP_DD_RUM_APP_ID` | `VITE_APP_DD_RUM_APP_ID` | `datadog-chunk.ts` | `deploy-eb.yml` |
| `REACT_APP_DD_RUM_CLIENT_TOKEN` | `VITE_APP_DD_RUM_CLIENT_TOKEN` | `App.tsx`, `datadog-chunk.ts` | `deploy-eb.yml` |
| `REACT_APP_DD_RUM_ENV` | `VITE_APP_DD_RUM_ENV` | `App.tsx`, `datadog-chunk.ts` | `deploy-eb.yml` |
| `REACT_APP_DD_SAMPLE_RATE` | `VITE_APP_DD_SAMPLE_RATE` | `datadog-chunk.ts` | `deploy-eb.yml` |

`deploy-eb.yml` also `sed`-replaces `@REACT_APP_*` placeholders inside `datadog-chunk.ts` and writes `frontend/.env`; both move to `VITE_APP_*` (TICKET-B). `process.env.NODE_ENV` checks (analytics / GrowthBook init) stay as they are; Vite defines `process.env.NODE_ENV`.

## Phase 1 file ownership

| Ticket | Branch | Owns |
| --- | --- | --- |
| A — Vite build ([MBA-2949](https://cog-gtm.atlassian.net/browse/MBA-2949)) | `feature/vite-20260930-0032-a-vite-build` | `frontend/vite.config.ts` (everything except the `build` section), `frontend/index.html` (moved from `public/`), `frontend/src/vite-env.d.ts`, `frontend/tsconfig.json` (incl. `types` for `vite/client`, `vitest/globals`, `@testing-library/jest-dom`), `REACT_APP_*` reads in `frontend/src`, worker import in `StorageResponsesService.ts` + `decryption.worker.ts`, SVG `ReactComponent` imports; deletes `craco.config.js`, `src/setupProxy.js`, `src/react-app-env.d.ts`, `src/typings/worker-loader.d.ts`, `.buildtime-env`, `tsconfig.paths.json` |
| B — Datadog + deploy ([MBA-2955](https://cog-gtm.atlassian.net/browse/MBA-2955)) | `feature/vite-20260930-0032-b-datadog-deploy` | `build` section of `vite.config.ts` (B creates a `frontend/vite.build.ts` helper that A's config imports, to avoid overlapping edits), `datadog-chunk.ts`, `webpack.dd.config.js` + `tsconfig.dd.json` (delete), `.github/`, `Dockerfile.production`, `Dockerfile.development`, README `NODE_OPTIONS` note, `docs/DEPLOYMENT_SETUP.md` |
| C — Storybook 8 ([MBA-2951](https://cog-gtm.atlassian.net/browse/MBA-2951)) | `feature/vite-20260930-0032-c-storybook8` | `frontend/.storybook/`, `*.stories.*`, `*.mdx`, `frontend/__tests__/storyshots/` (delete) |
| D — Vitest ([MBA-2950](https://cog-gtm.atlassian.net/browse/MBA-2950)) | `feature/vite-20260930-0032-d-vitest` | `frontend/vitest.config.ts`, `frontend/src/vitest.setup.ts`, `src/setupTests.ts` + `jest.config.js` (delete), `*.test.*`, `src/test-utils.tsx`, `src/mocks/**`, `frontend/.eslintrc` test overrides |
| E — React 18 + Chakra v2 ([MBA-2952](https://cog-gtm.atlassian.net/browse/MBA-2952)) | `feature/vite-20260930-0032-e-react18-chakra2` | `frontend/src/**` app code excluding `*.test.*`, `*.stories.*`, D's files and A's lines (A edits only env reads / imports; E fixes types), incl. `index.tsx` `createRoot` and the `@hello-pangea/dnd` import swap |
| F — Shared TS5 ([MBA-2956](https://cog-gtm.atlassian.net/browse/MBA-2956)) | `feature/vite-20260930-0032-f-shared-ts5` | `shared/**` (not `shared/package*.json`), backend `src/**` consumers and `__tests__` fixtures |
| G — Consolidation ([MBA-2954](https://cog-gtm.atlassian.net/browse/MBA-2954)) | `feature/vite-20260930-0032-base` → PR to `develop` | everything, driven by CI and Review |

Only TICKET-0 and TICKET-G change `package.json` / lockfiles.

## Local verification setup

To be filled in by TICKET-G.
