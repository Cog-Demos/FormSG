# Frontend modernization

Epic: [MBA-2957](https://cog-gtm.atlassian.net/browse/MBA-2957). Suffix: `vite-20260930-0122`.

Moves `frontend/` from CRA 4 → Vite 5, Storybook 6.5 → 8.6, Jest → Vitest 2, React 17 → 18,
Chakra UI v1 → v2.8, TypeScript 4.5 → 5.4. The backend stays on Jest.

## Tickets and branches

| Ticket                             | Jira                                                      | Branch                                         |
| ---------------------------------- | --------------------------------------------------------- | ---------------------------------------------- |
| 0 Baseline + dependency foundation | [MBA-2965](https://cog-gtm.atlassian.net/browse/MBA-2965) | `feature/vite-20260930-0122-base`              |
| A Vite build                       | [MBA-2962](https://cog-gtm.atlassian.net/browse/MBA-2962) | `feature/vite-20260930-0122-a-vite-build`      |
| B Datadog chunk + deploy surface   | [MBA-2963](https://cog-gtm.atlassian.net/browse/MBA-2963) | `feature/vite-20260930-0122-b-datadog-deploy`  |
| C Storybook 6 → 8                  | [MBA-2961](https://cog-gtm.atlassian.net/browse/MBA-2961) | `feature/vite-20260930-0122-c-storybook8`      |
| D Jest → Vitest                    | [MBA-2960](https://cog-gtm.atlassian.net/browse/MBA-2960) | `feature/vite-20260930-0122-d-vitest`          |
| E React 18 + Chakra v2 app code    | [MBA-2958](https://cog-gtm.atlassian.net/browse/MBA-2958) | `feature/vite-20260930-0122-e-react18-chakra2` |
| F Shared types TS5                 | [MBA-2959](https://cog-gtm.atlassian.net/browse/MBA-2959) | `feature/vite-20260930-0122-f-shared-ts5`      |
| G Consolidation + iteration        | [MBA-2964](https://cog-gtm.atlassian.net/browse/MBA-2964) | base branch → PR against `develop`             |

## Baseline (TICKET-0, `develop` @ `61afcde4d`, Node 18.20.2)

This table is the no-regressions bar. Every row must match or beat it after the migration.

| Check                              | Command                                                                                 | Baseline result                                                                                                | Machine setup needed                                                          |
| ---------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Install                            | `npm ci` (root; postinstall installs `frontend/` and `shared/`)                         | pass                                                                                                           | Node from `.nvmrc`                                                            |
| Build                              | `NODE_OPTIONS='--max-old-space-size=4096 --openssl-legacy-provider' npm run build`      | pass (1m47s, peak RSS 3.2 GB)                                                                                  | —                                                                             |
| Frontend Jest                      | `CI=true npm run test:frontend`                                                         | pass: 25 suites, 182 tests                                                                                     | —                                                                             |
| Backend Jest                       | `npm run test:backend:ci`                                                               | pass: 153 suites, 2910 passed + 1 todo                                                                         | `libssl1.1` (mongodb-memory-server), virus-scanner deps (below)               |
| `serverless/virus-scanner` install | `npm ci --prefix serverless/virus-scanner`                                              | pass with machine setup below; fails without it (`cmake is not installed`, then `No module named 'distutils'`) | `cmake autoconf automake libtool build-essential`, Python ≤ 3.11 for node-gyp |
| `serverless/virus-scanner` tsc     | `cd serverless/virus-scanner && npx tsc --noEmit`                                       | pass                                                                                                           | as above                                                                      |
| `serverless/virus-scanner` Jest    | part of backend Jest (`serverless/virus-scanner/src/__tests/*`)                         | pass: 3 suites, 14 tests                                                                                       | as above                                                                      |
| Storybook build                    | `npm --prefix frontend run build-storybook`                                             | pass                                                                                                           | —                                                                             |
| Frontend lint                      | `npm run lint:frontend`                                                                 | pass: 0 errors, 34 warnings                                                                                    | —                                                                             |
| Backend lint                       | `npm run lint-ci`                                                                       | pass                                                                                                           | —                                                                             |
| Lockfile lint                      | `npx lockfile-lint --type npm --path package.json --validate-https --allowed-hosts npm` | pass                                                                                                           | —                                                                             |
| Backend tsc (build)                | `npx tsc --noEmit -p tsconfig.build.json`                                               | pass                                                                                                           | —                                                                             |
| Backend tsc (incl. specs)          | `npx tsc --noEmit -p tsconfig.json`                                                     | fail: 74 errors (spec files; not run in CI)                                                                    | —                                                                             |
| Frontend tsc                       | `cd frontend && npx tsc --noEmit -p tsconfig.json`                                      | fail: 206 errors (TS 4.5 cannot parse `shared/node_modules/type-fest` 4.x)                                     | —                                                                             |

### Machine setup (install commands)

```bash
# Node from .nvmrc
source ~/.nvm/nvm.sh && nvm install "$(cat .nvmrc)" && nvm use "$(cat .nvmrc)"

# mongodb-memory-server's mongod 4.0 links against OpenSSL 1.1 (same as ci.yml)
curl -fsSL -o /tmp/libssl1.1.deb https://security.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2.24_amd64.deb
echo "7cf39d70a639017d1dd7c8d36daa2258063608688e449fddf40ffdd46f992a78  /tmp/libssl1.1.deb" | sha256sum -c -
sudo dpkg -i /tmp/libssl1.1.deb

# serverless/virus-scanner: aws-lambda-ric builds native code with cmake + node-gyp 9,
# and node-gyp 9 needs a Python that still ships distutils (≤ 3.11)
sudo apt-get install -y cmake autoconf automake libtool build-essential
npm_config_python="$(pyenv which python3.11 || command -v python3.11)" npm ci --prefix serverless/virus-scanner
```

## Dependency foundation (TICKET-0)

TICKET-0 is the only ticket (with TICKET-G) that touches `frontend/package.json` or `frontend/package-lock.json`.
Phase 1 tickets that need another dependency change record it in their Jira ticket; TICKET-G applies it.

- Removed: `react-scripts`, `@craco/craco`, `craco-alias`, `worker-loader`, `env-cmd`, `ts-jest`,
  `@storybook/addon-storyshots(-puppeteer)`, `puppeteer`, `@storybook/preset-create-react-app`, `storybook-preset-craco`,
  `storybook-addon-turbo-build`, `@storybook/jest`, `@storybook/testing-library`, `@storybook/testing-react`,
  `@storybook/node-logger`, `html-webpack-plugin`, `http-proxy-middleware`, `react-refresh`, `react-beautiful-dnd`,
  `@types/react-beautiful-dnd`, `@types/jest`, `@types/storybook-react-router`, the `proxy` field and the `overrides` block.
- Added / upgraded: `vite@^5.4`, `@vitejs/plugin-react@^4.7`, `vite-tsconfig-paths@^5.1`, `vite-plugin-svgr@^4.5`,
  `vite-plugin-node-polyfills@^0.22` (Node builtins used by browser deps, e.g. `buffer`/`stream`/`crypto` shims),
  `vitest@^2.1`, `jsdom@^25`, Storybook `^8.6.18` (`storybook`, `@storybook/react-vite`, `@storybook/test`, `@storybook/blocks`,
  addons), `react`/`react-dom@^18.3`, `@chakra-ui/react@~2.8.2`, `@chakra-ui/cli@^2.5`, `framer-motion@^10.18`,
  `typescript@~5.4.5`, `@testing-library/react@^16.3`, `@testing-library/dom@^10.4`, `@testing-library/jest-dom@^6.6`,
  `@testing-library/user-event@^14.6`, `@hello-pangea/dnd@^16.6` (maintained, API-compatible `react-beautiful-dnd` fork),
  `msw-storybook-addon@^1.10` (keeps `msw@0.36`; the 2.x addon requires `msw@2`), `storybook-react-i18next@^3.3` (SB8 line).
- Scripts: `start` → `vite`, `build` → `vite build`, `test` → `vitest run`, `storybook` → `storybook dev -p 6006`,
  `build-storybook` → `storybook build`. `build:dd-chunk`, `eject` and `test:a11y*` are removed. The configs these scripts
  need are created in Phase 1 (A: `vite.config.ts`, B: Datadog entry, C: `.storybook/*.ts`, D: `vitest.config.ts`).
- `patches/@chakra-ui+form-control+1.6.0.patch` is replaced by `@chakra-ui+form-control+2.2.0.patch` (same change:
  `useFormControl` does not set the native `required` attribute).
- `gen:theme-typings` now passes `--out node_modules/@chakra-ui/styled-system/dist/theming.types.d.ts`; `@chakra-ui/cli` v2
  cannot locate `@chakra-ui/styled-system` on its own. The script no longer swallows failures with `|| true`.
- `npm ci` in `frontend/` completes with no manual steps (patch applies, theme typings generate).

After TICKET-0, `frontend` tsc reports 1431 errors in 287 files; lint reports 2 errors in `.storybook/main.js`
(uninstalled SB6 presets). Both are the Phase 1 work queue.

## Env-var rename plan

Vite only exposes variables with the `VITE_` prefix via `import.meta.env`. Every `REACT_APP_*` becomes `VITE_APP_*`:

| Old                             | New                            | Read in                                                                  | Set in                                                                       |
| ------------------------------- | ------------------------------ | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `REACT_APP_BASE_URL`            | `VITE_APP_BASE_URL`            | `src/services/ApiService.ts`                                             | — (defaults to `/api/v3`)                                                    |
| `REACT_APP_URL`                 | `VITE_APP_URL`                 | `src/growthbook.ts`, `src/features/public-form/utils/axiosDebugFlow.tsx` | `deploy-eb.yml`                                                              |
| `REACT_APP_VERSION`             | `VITE_APP_VERSION`             | `src/app/App.tsx`, `src/utils/lazyRetry.ts`, `datadog-chunk.ts`          | `.buildtime-env` → `vite.config.ts` (`npm_package_version`), `deploy-eb.yml` |
| `REACT_APP_GA_TRACKING_ID`      | `VITE_APP_GA_TRACKING_ID`      | `src/index.tsx`, `src/app/AppHelmet.tsx`                                 | `deploy-eb.yml`, `docs/DEPLOYMENT_SETUP.md`                                  |
| `REACT_APP_FORMSG_SDK_MODE`     | `VITE_APP_FORMSG_SDK_MODE`     | `src/utils/formSdk.ts`                                                   | `deploy-eb.yml`, `docs/DEPLOYMENT_SETUP.md`                                  |
| `REACT_APP_DD_RUM_APP_ID`       | `VITE_APP_DD_RUM_APP_ID`       | `datadog-chunk.ts`                                                       | `deploy-eb.yml`                                                              |
| `REACT_APP_DD_RUM_CLIENT_TOKEN` | `VITE_APP_DD_RUM_CLIENT_TOKEN` | `src/app/App.tsx`, `datadog-chunk.ts`                                    | `deploy-eb.yml`                                                              |
| `REACT_APP_DD_RUM_ENV`          | `VITE_APP_DD_RUM_ENV`          | `src/app/App.tsx`, `datadog-chunk.ts`                                    | `deploy-eb.yml`                                                              |
| `REACT_APP_DD_SAMPLE_RATE`      | `VITE_APP_DD_SAMPLE_RATE`      | `datadog-chunk.ts`                                                       | `deploy-eb.yml`                                                              |

`process.env.NODE_ENV` checks stay as they are (Vite defines `process.env.NODE_ENV`). The GitHub secret names
(`secrets.*`) are unchanged; only the build-time variable names change.

## Phase 1 file ownership

Each Phase 1 branch starts from the base branch and only touches the files it owns. Nobody in Phase 1 touches
`package.json` or a lockfile.

| Ticket | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A      | `frontend/vite.config.ts` (except `build`), `frontend/index.html` (moved from `public/`), `frontend/src/vite-env.d.ts`, `frontend/tsconfig.json` + `tsconfig.paths.json`, `craco.config.js`, `src/setupProxy.js`, `src/react-app-env.d.ts`, `.buildtime-env`, `src/typings/worker-loader.d.ts`, `StorageResponsesService.ts` worker import, the SVG component import lines, and the `process.env.REACT_APP_*` → `import.meta.env.VITE_APP_*` lines in `frontend/src` |
| B      | `.github/`, `Dockerfile.production`, `Dockerfile.development`, `README.md` (`NODE_OPTIONS`), `docs/DEPLOYMENT_SETUP.md` (env names), `frontend/datadog-chunk.ts`, `frontend/webpack.dd.config.js`, `frontend/tsconfig.dd.json`, the `build` section of `vite.config.ts`                                                                                                                                                                                              |
| C      | `frontend/.storybook/**`, `frontend/**/*.stories.*`, `frontend/__tests__/storyshots/`                                                                                                                                                                                                                                                                                                                                                                                |
| D      | `frontend/vitest.config.ts`, the Vitest setup file, `frontend/src/setupTests.ts`, `frontend/jest.config.js`, `frontend/**/*.test.*`                                                                                                                                                                                                                                                                                                                                  |
| E      | all other `frontend/src/**` app code (`index.tsx` `createRoot`, React 18/Chakra v2/framer-motion/dnd fixes)                                                                                                                                                                                                                                                                                                                                                          |
| F      | `shared/**`, backend `src/**` and `__tests__/**` that consume shared types                                                                                                                                                                                                                                                                                                                                                                                           |

Overlap: `src/index.tsx` gets A's env line and E's `createRoot` change; `vite.config.ts` gets A's config and B's `build`
section. TICKET-G resolves those merges.
