# Frontend modernization (Vite + Storybook 8 + Vitest + React 18 + Chakra v2 + TS 5.4)

Run suffix `vite-20260929-2123`. Epic
[MBA-2920](https://cog-gtm.atlassian.net/browse/MBA-2920).

## 1. Baseline on `develop` (commit `a272fd336`)

Machine: Ubuntu 22.04 x86_64, 8 vCPU / 31 GB, Node `v18.20.2` (`.nvmrc`), npm 10.5.0.
This table is the no-regressions bar for every ticket: nothing that passes here
may fail afterwards.

| Check                      | Command (repo root unless noted)                                                                                                                                                                                            | Baseline result                                                                                                                                                                         | Machine setup needed                                                                                                                          | Final (TICKET-G)                                                                                                                                                                                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Install                    | `npm ci` (root `postinstall` installs `frontend/` and `shared/`)                                                                                                                                                            | pass (1 m 55 s)                                                                                                                                                                         | none                                                                                                                                          | pass: `npm ci` (1 m 54 s); root `ts-loader`/`webpack`/`webpack-cli`/`worker-loader` removed                                                                                                                                                                               |
| Frontend Jest              | `cd frontend && CI=true npm test -- --watchAll=false`                                                                                                                                                                       | pass: 25 suites, 182 tests (41 s)                                                                                                                                                       | none                                                                                                                                          | Vitest `cd frontend && npm run test`: pass ×3: 25 files, 182 tests (~15 s each)                                                                                                                                                                                           |
| Frontend lint              | `cd frontend && npm run lint`                                                                                                                                                                                               | **fail**: ESLint 0 errors / 34 warnings, Prettier flags `public/index.html`                                                                                                             | none                                                                                                                                          | pass: ESLint 0 errors / 34 warnings, Prettier clean (`public/mockServiceWorker.js` ignored)                                                                                                                                                                               |
| Frontend `tsc`             | `cd frontend && npx tsc --noEmit`                                                                                                                                                                                           | **fail**: 206 errors, all TS 4.5 parse errors in `shared/node_modules/type-fest` + `@types/lodash` typings                                                                              | none                                                                                                                                          | pass: 0 errors                                                                                                                                                                                                                                                            |
| Frontend build (CRA)       | `cd frontend && NODE_OPTIONS='--max-old-space-size=4096 --openssl-legacy-provider' npm run build`                                                                                                                           | pass with warnings (1 m 44 s); `dist/frontend/index.html` has 4 external `<script src>` tags (incl. `../static/js/datadog-chunk.*.js`), 0 inline; worker emitted as `*.chunk.worker.js` | `--openssl-legacy-provider` (webpack 4 on Node 18)                                                                                            | Vite, root `npm run build`: pass (32 s, peak RSS 4.4 GB, V8 heap ~3.4 GB; `vendor` chunk split, heap limit 6144); `dist/frontend/index.html` has 2 external scripts (`./static/js/datadog-chunk.*.js` first), 0 inline; worker emitted as `static/decryption.worker-*.js` |
| Storybook build (SB6)      | `cd frontend && npm run build-storybook`                                                                                                                                                                                    | pass (1 m 30 s)                                                                                                                                                                         | `--openssl-legacy-provider` (set by the script)                                                                                               | Storybook 8: pass (55 s)                                                                                                                                                                                                                                                  |
| Backend `tsc`              | `npx tsc -p tsconfig.build.json --noEmit`                                                                                                                                                                                   | pass (16 s)                                                                                                                                                                             | none. (`npx tsc -p tsconfig.json` additionally type-checks `__tests__` and `frontend/node_modules` and fails with 74 errors; not a CI check.) | pass (20 s)                                                                                                                                                                                                                                                               |
| Backend lint               | `npm run lint-ci`                                                                                                                                                                                                           | pass                                                                                                                                                                                    | none                                                                                                                                          | pass (44 s)                                                                                                                                                                                                                                                               |
| Backend Jest               | `npm run test:backend:ci`                                                                                                                                                                                                   | pass: 153 suites, 2910 tests + 1 todo (3 m 50 s) once `serverless/virus-scanner` deps are installed (without them its 3 suites fail on `Cannot find module 'clamscan'`)                 | `libssl1.1` for `mongodb-memory-server`'s `mongod` (see below)                                                                                | pass: 153 suites, 2910 tests + 1 todo (4 m 3 s)                                                                                                                                                                                                                           |
| `serverless/virus-scanner` | `npm_config_python=/usr/bin/python3 npm ci --prefix serverless/virus-scanner`; `cd serverless/virus-scanner && npx tsc --noEmit`; `npx env-cmd -f __tests__/setup/.test-env jest serverless/virus-scanner --coverage=false` | pass: install, `tsc`, 3 suites / 14 tests                                                                                                                                               | `cmake autoconf automake libtool libcurl4-openssl-dev g++ make` (native `aws-lambda-ric`), a Python with `distutils`                          | pass: install, `tsc`, 3 suites / 14 tests (only `serverless/*` package)                                                                                                                                                                                                   |

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

The husky hooks call `git-secrets` and use the bash-only `&>` redirect, but
husky runs them with `sh` (dash on Ubuntu), so every commit fails with
"git-secrets is not installed". Install `git-secrets` and make husky's `sh`
resolve to bash for this user only:

```bash
git clone -q https://github.com/awslabs/git-secrets.git /tmp/git-secrets
mkdir -p ~/.local/bin ~/.local/shimbin ~/.config/husky
cp /tmp/git-secrets/git-secrets ~/.local/bin/
ln -sf /bin/bash ~/.local/shimbin/sh
echo 'export PATH="$HOME/.local/shimbin:$HOME/.local/bin:$PATH"' > ~/.config/husky/init.sh
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

### Intentional leftover-search hits (TICKET-G)

`rg -n -i 'react-scripts|craco|worker-loader|storyshots|REACT_APP_|openssl-legacy-provider|setupProxy|%PUBLIC_URL%' --glob '!**/node_modules/**' --glob '!**/package-lock.json' .`
has no hits in code, config or scripts. The remaining hits are intentional:

- `.github/workflows/deploy-eb.yml` (`VITE_APP_FORMSG_SDK_MODE: ${{ secrets.REACT_APP_FORMSG_SDK_MODE }}`;
  only found with `--hidden`) and the `REACT_APP_FORMSG_SDK_MODE` row in
  `docs/DEPLOYMENT_SETUP.md`: the GitHub secret keeps its name (secrets cannot
  be renamed from the repo); it is mapped to the Vite variable at build time.
- This document: the baseline table (CRA / Storybook 6 commands), the removed
  dependency list, the env-var rename table and the file-ownership map describe
  the pre-migration state.
- `CHANGELOG.md`: historical release notes.

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

Ubuntu x86_64; isolated worktree `/home/ubuntu/wt/e2e`. All values below are
synthetic local development values, not production credentials. These commands
describe the actual native Mongo/MailDev/ClamAV + Docker LocalStack setup used.
Use separate terminals for long-running services. No product source edits.

### Worktree, Node, dependencies

```bash
git -C /home/ubuntu/repos/FormSG fetch origin
mkdir -p "$HOME/wt" "$HOME/e2e-runtime"
git -C /home/ubuntu/repos/FormSG worktree add --detach "$HOME/wt/e2e" \
  origin/feature/vite-20260929-2123-G-consolidation
cd "$HOME/wt/e2e"
source "$HOME/.nvm/nvm.sh"
nvm install 18.20.2
nvm use 18.20.2
npm ci
```

Root postinstall installs frontend/shared. `.envrc` may report blocked; do not
allow it merely to suppress the message (it sources a nonexistent root `.env`).
Export the generated environment explicitly below.

Native prerequisites (libssl/native-build prerequisites were already installed
on this machine; ClamAV was added during setup):

```bash
sudo apt-get update
sudo apt-get install -y cmake autoconf automake libtool libcurl4-openssl-dev \
  g++ make python3 python3-distutils clamav clamav-daemon
curl -fsSL -o /tmp/libssl1.1.deb \
  https://security.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2.24_amd64.deb
echo '7cf39d70a639017d1dd7c8d36daa2258063608688e449fddf40ffdd46f992a78  /tmp/libssl1.1.deb' | sha256sum -c -
sudo dpkg -i /tmp/libssl1.1.deb
cd "$HOME/wt/e2e"
npm_config_python=/usr/bin/python3 npm ci --prefix serverless/virus-scanner
npm run build --prefix serverless/virus-scanner
npm run build --prefix frontend
```

The frontend production build is needed even when using Vite: backend startup
reads `dist/frontend/index.html`. No frontend `.env.local` was required.

### MongoDB: primary AND secondary

Used the already cached mongodb-memory-server binary (4.0.22), not a Mongo
container. The backend Submission model explicitly reads from `secondary`;
a single-member replica set allows writes but response-count reads time out.

```bash
mkdir -p "$HOME/e2e-runtime/mongo" "$HOME/e2e-runtime/mongo-secondary"
MONGOD="$HOME/.cache/mongodb-binaries/mongod-x64-ubuntu-4.0.22"
test -x "$MONGOD"
"$MONGOD" --dbpath "$HOME/e2e-runtime/mongo" --replSet rs0 \
  --bind_ip 127.0.0.1 --port 27017 \
  --logpath "$HOME/e2e-runtime/mongo.log" --fork
"$MONGOD" --dbpath "$HOME/e2e-runtime/mongo-secondary" --replSet rs0 \
  --bind_ip 127.0.0.1 --port 27018 \
  --logpath "$HOME/e2e-runtime/mongo-secondary.log" --fork
```

On a fresh box without the cached binary, obtain the same Ubuntu 18.04 x86_64
MongoDB 4.0.22 distribution first. Do not silently replace it with a newer
version when trying to reproduce this exact environment.

### MailDev and LocalStack

```bash
cd "$HOME/wt/e2e"
node node_modules/.bin/maildev
# Default UI http://localhost:1080, SMTP localhost:1025.
```

```bash
docker run -d --name formsg-e2e-localstack -p 4566:4566 \
  -e SERVICES=s3,sqs,secretsmanager \
  -e EXTRA_CORS_ALLOWED_ORIGINS=http://localhost:3000 \
  localstack/localstack:3.3
curl -fsS http://127.0.0.1:4566/_localstack/health
```

Actual image: `localstack/localstack:3.3`. If Docker Hub rate limits pulls,
`mirror.gcr.io/localstack/localstack:3.3` can be pulled and retagged locally.
Mongo/MailDev image pulls were rate limited; native alternatives above were used.

### Generate backend env, initialize replica set, seed agency, create S3/SQS

The script below derives every synthetic default from the checked-out
`docker-compose.yml` backend environment and writes the complete shell-loadable
`~/e2e-runtime/backend.env`. This includes the repository's synthetic signing,
verification, Twilio, OIDC, SGID, session and Postman values without redaction.
The explicit overrides are all listed below. No real GrowthBook key was needed:
`sdk-local-e2e` allows defaults/fallbacks. External SSO/payments are not tested.

```bash
cat > "$HOME/e2e-runtime/initialize.cjs" <<'JS'
const fs = require('fs')
const path = '/home/ubuntu/wt/e2e'
const yaml = require(path + '/node_modules/js-yaml')
const { MongoClient } = require(path + '/node_modules/mongodb')
const AWS = require(path + '/node_modules/aws-sdk')
async function main() {
  const defaults = yaml.load(fs.readFileSync(path + '/docker-compose.yml', 'utf8')).services.backend.environment
  const env = Object.fromEntries(defaults.filter(x => x.includes('=')).map(x => [x.slice(0, x.indexOf('=')), x.slice(x.indexOf('=') + 1)]))
  Object.assign(env, {
    PORT: '5001',
    DB_HOST: 'mongodb://127.0.0.1:27017/formsg?replicaSet=rs0',
    SES_HOST: '127.0.0.1',
    AWS_REGION: 'ap-southeast-1',
    VIRUS_SCANNER_LAMBDA_ENDPOINT: 'http://127.0.0.1:9999',
    WEBHOOK_SQS_URL: 'http://sqs.ap-southeast-1.localhost.localstack.cloud:4566/000000000000/local-webhooks-sqs-main',
    GOOGLE_CAPTCHA: '',
    GOOGLE_CAPTCHA_PUBLIC: '',
    GROWTHBOOK_CLIENT_KEY: 'sdk-local-e2e'
  })
  fs.writeFileSync('/home/ubuntu/e2e-runtime/backend.env',
    Object.entries(env).map(([k,v]) => `${k}=${JSON.stringify(v)}`).join('\n') + '\n')
  const client = new MongoClient('mongodb://127.0.0.1:27017/?directConnection=true')
  await client.connect()
  try {
    await client.db('admin').command({ replSetInitiate: {
      _id: 'rs0', members: [{ _id: 0, host: '127.0.0.1:27017' }]
    } })
  } catch (e) { if (e.codeName !== 'AlreadyInitialized') throw e }
  for (let n=0; n<60; n++) {
    if ((await client.db('admin').command({ isMaster: 1 })).ismaster) break
    await new Promise(r => setTimeout(r, 1000))
  }
  const { config } = await client.db('admin').command({ replSetGetConfig: 1 })
  if (!config.members.some(m => m.host === '127.0.0.1:27018')) {
    config.version++
    config.members.push({ _id: 1, host: '127.0.0.1:27018', priority: 0, votes: 0 })
    await client.db('admin').command({ replSetReconfig: config })
  }
  for (let n=0; n<120; n++) {
    const status = await client.db('admin').command({ replSetGetStatus: 1 })
    if (status.members.some(m => m.stateStr === 'SECONDARY')) break
    if (n === 119) throw Error('Secondary did not become ready')
    await new Promise(r => setTimeout(r, 1000))
  }
  await client.db('formsg').collection('agencies').updateOne(
    { shortName: 'govtech' },
    { $setOnInsert: {
      shortName: 'govtech', fullName: 'Government Technology Agency',
      logo: 'https://s3-ap-southeast-1.amazonaws.com/agency-logo.form.sg/govtech.jpg',
      emailDomain: ['tech.gov.sg', 'data.gov.sg', 'form.sg', 'open.gov.sg']
    } }, { upsert: true })
  await client.close()
  const options = {
    endpoint: 'http://127.0.0.1:4566', region: env.AWS_REGION,
    accessKeyId: 'fakeKey', secretAccessKey: 'fakeSecret'
  }
  const s3 = new AWS.S3({ ...options, s3ForcePathStyle: true })
  for (const bucket of Object.entries(env).filter(([k]) => k.endsWith('_S3_BUCKET')).map(([,v]) => v)) {
    try { await s3.createBucket({ Bucket: bucket }).promise() }
    catch (e) { if (!['BucketAlreadyOwnedByYou','BucketAlreadyExists'].includes(e.code)) throw e }
    await s3.putBucketCors({ Bucket: bucket, CORSConfiguration: { CORSRules: [{
      AllowedHeaders: ['*'], AllowedMethods: ['GET','PUT','POST','HEAD'],
      AllowedOrigins: ['http://localhost:3000'], ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3600
    }] } }).promise()
    if (bucket.includes('virus-scanner'))
      await s3.putBucketVersioning({ Bucket: bucket, VersioningConfiguration: { Status: 'Enabled' } }).promise()
    console.log('Bucket ready:', bucket)
  }
  const sqs = new AWS.SQS(options)
  const dlq = await sqs.createQueue({ QueueName: 'local-webhooks-sqs-deadLetter' }).promise()
  const arn = (await sqs.getQueueAttributes({ QueueUrl: dlq.QueueUrl, AttributeNames: ['QueueArn'] }).promise()).Attributes.QueueArn
  await sqs.createQueue({ QueueName: 'local-webhooks-sqs-main', Attributes: {
    ReceiveMessageWaitTimeSeconds: '20',
    RedrivePolicy: JSON.stringify({ deadLetterTargetArn: arn, maxReceiveCount: 1 })
  } }).promise()
  console.log('Replica set, agency seed, buckets and queues initialized.')
}
main().catch(e => { console.error(e); process.exit(1) })
JS
node "$HOME/e2e-runtime/initialize.cjs"
cat "$HOME/e2e-runtime/backend.env"
```

Buckets: `local-attachment-bucket`, `local-payment-proof-bucket`,
`local-image-bucket`, `local-logo-bucket`, `local-static-assets-bucket`,
`local-virus-scanner-quarantine-bucket`, `local-virus-scanner-clean-bucket`.
Versioning on quarantine/clean is mandatory for scanner version IDs.

### ClamAV and Lambda emulator

The system freshclam daemon downloaded signatures to `/var/lib/clamav`.
Observed versions: main 63, daily 28138, bytecode 339. Do not run another
freshclam concurrently (log-file lock); either await the system daemon or stop
it before a manual refresh. These alternative manual commands refresh the DB:

```bash
sudo systemctl stop clamav-freshclam
sudo freshclam
cat > "$HOME/e2e-runtime/clamd.conf" <<'CONF'
LocalSocket /tmp/clamd.ctl
LocalSocketMode 666
DatabaseDirectory /var/lib/clamav
LogFile /tmp/e2e-clamd.log
PidFile /tmp/e2e-clamd.pid
User clamav
Foreground yes
CONF
sudo /usr/sbin/clamd --config-file="$HOME/e2e-runtime/clamd.conf"
```

Start the unmodified compiled scanner:

```bash
curl -fsSL -o "$HOME/e2e-runtime/aws-lambda-rie" \
  https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/aws-lambda-rie
chmod +x "$HOME/e2e-runtime/aws-lambda-rie"
cd "$HOME/wt/e2e/serverless/virus-scanner"
source "$HOME/.nvm/nvm.sh" && nvm use 18.20.2
export NODE_ENV=development
export VIRUS_SCANNER_QUARANTINE_S3_BUCKET=local-virus-scanner-quarantine-bucket
export VIRUS_SCANNER_CLEAN_S3_BUCKET=local-virus-scanner-clean-bucket
"$HOME/e2e-runtime/aws-lambda-rie" \
  --runtime-interface-emulator-address 127.0.0.1:9999 \
  ./node_modules/.bin/aws-lambda-ric build/index.handler
```

### Backend, Vite, Storybook

```bash
cd "$HOME/wt/e2e"
source "$HOME/.nvm/nvm.sh" && nvm use 18.20.2
set -a
source "$HOME/e2e-runtime/backend.env"
set +a
./node_modules/.bin/tsnd --poll --respawn --transpile-only \
  --inspect=0.0.0.0 --exit-child -r dotenv/config -- src/app/server.ts \
  > "$HOME/e2e-runtime/backend.log" 2>&1
```

```bash
cd "$HOME/wt/e2e/frontend"
source "$HOME/.nvm/nvm.sh" && nvm use 18.20.2
npm start
# Vite http://localhost:3000; /api proxied to localhost:5001.
```

```bash
cd "$HOME/wt/e2e/frontend"
source "$HOME/.nvm/nvm.sh" && nvm use 18.20.2
npm run storybook -- --ci
# http://localhost:6006/?path=/story/components-button--solid-primary
```

### Browser prerequisite and test data

- Log in at `http://localhost:3000/login` as `e2e.admin@open.gov.sg`.
  Read its OTP at `http://localhost:1080`; no seeded user/password is required.
- New forms default to captcha enabled. In each form's Settings turn OFF
  **Enable reCAPTCHA** because this local environment has no captcha keys.
  Empty backend keys alone do not turn off the per-form setting.
- Download and retain the storage form secret key; upload it for activation and
  response decryption. Do not substitute a stored/plaintext response fixture.
- Open public form in a **separate browser tab**, submit there, switch to admin,
  then click Results inside the app. Do not replace that with same-tab Back.

```bash
cat > "$HOME/e2e-runtime/synthetic-evidence.txt" <<'TXT'
FormSG frontend modernization verification
Synthetic data only. No real personal or government information.
Vite 5 / React 18 / Chakra UI 2 / TypeScript 5.4
Attachment encryption round-trip: 2026-09-29
TXT
sha256sum "$HOME/e2e-runtime/synthetic-evidence.txt"
# df319c49791cae1d1d5b76a82e48a11a0c62ff35a2eb8e4f12a3354c3f150479
```

#### Automated browser / MSW debugger caveat

Storybook manager loaded while its iframe spun indefinitely. The browser's CDP
automation had suspended `localhost:6006/mockServiceWorker.js` before execution.
An inert registration was visible with no active worker; a clean incognito
context behaved the same. Sending `Runtime.runIfWaitingForDebugger` to those
worker targets immediately allowed rendering. No source change is necessary.
Only use this diagnostic when worker suspension is actually present. Example
for this machine's CDP endpoint (the port may differ in another session):

```bash
cd "$HOME/wt/e2e"
node <<'JS'
const WebSocket = require('ws')
fetch('http://localhost:29229/json/list').then(r => r.json()).then(targets => {
  for (const target of targets.filter(t => t.type === 'service_worker' &&
      t.url === 'http://localhost:6006/mockServiceWorker.js')) {
    const ws = new WebSocket(target.webSocketDebuggerUrl)
    ws.on('open', () => ws.send(JSON.stringify({
      id: 1, method: 'Runtime.runIfWaitingForDebugger'
    })))
    ws.on('message', data => { console.log(data.toString()); ws.close() })
  }
})
JS
```

### Before recording / terminal evidence

```bash
git -C "$HOME/wt/e2e" fetch origin feature/vite-20260929-2123-G-consolidation
git -C "$HOME/wt/e2e" rev-parse HEAD FETCH_HEAD
# Both must match; update checkout and recheck affected flows if not.
# Maximize browser and terminal on this Linux/KDE machine:
wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz
# Restart npm start visibly for step 1; no setup/debugging in the take.
sha256sum "$HOME/e2e-runtime/synthetic-evidence.txt" "$HOME/Downloads/synthetic-evidence.txt"
cmp "$HOME/e2e-runtime/synthetic-evidence.txt" "$HOME/Downloads/synthetic-evidence.txt"
cd "$HOME/wt/e2e/frontend"
npx vitest run
```
