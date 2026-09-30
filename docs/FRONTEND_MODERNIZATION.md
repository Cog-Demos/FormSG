# Frontend modernization (Vite + Storybook 8 + Vitest + React 18 + Chakra v2 + TS 5.4)

Run suffix `vite-20260929-2325`. Epic
[MBA-2930](https://cog-gtm.atlassian.net/browse/MBA-2930).

## 1. Baseline on `develop` (commit `a272fd336`)

Machine: Ubuntu 22.04 x86_64, 8 vCPU / 31 GB, Node `v18.20.2` (`.nvmrc`),
npm 10.5.0. This table is the no-regressions bar for every ticket: nothing
that passes here may fail afterwards.

| Check                                           | Command (repo root unless noted)                                                                                | Baseline result                                                                                       | Machine setup needed                                       |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Install                                         | `npm ci` (root `postinstall` installs `frontend/` and `shared/`)                                                | pass (1 m 55 s)                                                                                       | Node 18.20.2                                               |
| Frontend Jest                                   | `cd frontend && CI=true npm test -- --watchAll=false`                                                           | pass: 25 suites, 182 tests (20 s)                                                                     | none                                                       |
| Frontend lint                                   | `npm run lint:frontend`                                                                                         | pass: ESLint 0 errors / 34 warnings, Prettier clean (see note 1)                                      | none                                                       |
| Frontend `tsc`                                  | `cd frontend && npx tsc --noEmit`                                                                               | **fail**: 206 errors, all TS 4.5 parse errors in `shared/node_modules/type-fest` typings              | none                                                       |
| Frontend + backend build                        | `NODE_OPTIONS='--max-old-space-size=4096 --openssl-legacy-provider' npm run build`                              | pass (49 s); `dist/frontend` has `static/js/datadog-chunk.*.js` and `decryption.worker.*.js` as files | none                                                       |
| Storybook build                                 | `cd frontend && NODE_OPTIONS='--max-old-space-size=4096 --openssl-legacy-provider' npm run build-storybook`     | pass (1 m 46 s)                                                                                       | none                                                       |
| Backend lint                                    | `npm run lint-ci`                                                                                               | pass: 0 errors                                                                                        | none                                                       |
| Backend `tsc` (build)                           | `npx tsc --noEmit -p tsconfig.build.json`                                                                       | pass: 0 errors                                                                                        | none                                                       |
| Backend `tsc` (all, incl. specs)                | `npx tsc --noEmit -p tsconfig.json`                                                                             | **fail**: 74 errors, all in `src/**/__tests__/*.spec.ts`                                              | none                                                       |
| Backend Jest (incl. `serverless/virus-scanner`) | `AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE=1 NODE_OPTIONS=--max-old-space-size=4096 npm run test:backend:ci` | pass: 153 suites, 2910 passed + 1 todo (3 m 19 s)                                                     | `libssl1.1`, virus-scanner deps (below)                    |
| `serverless/virus-scanner` install              | `npm_config_python=/usr/bin/python3 npm ci --prefix serverless/virus-scanner`                                   | pass                                                                                                  | `cmake`, autotools, `g++`, Python with `distutils` (below) |
| `serverless/virus-scanner` `tsc`                | `cd serverless/virus-scanner && npx tsc --noEmit`                                                               | pass: 0 errors                                                                                        | virus-scanner deps installed                               |

Notes:

1. The CRA build's `webpack.dd.config.js` (`HtmlWebpackPlugin`) rewrites
   `frontend/public/index.html` in place; running `lint:frontend` after a build
   then fails Prettier on that file. Lint is measured on a clean tree.
2. Without the virus-scanner `node_modules`, backend Jest reports 3 failed
   suites (`serverless/virus-scanner/src/__tests/*`: `Cannot find module
'clamscan'` / `'@aws-sdk/client-s3'`); `jest.config.js` resolves them from
   `./serverless/virus-scanner/node_modules`.
3. Run everything under Node 18 (`nvm use`); Node 24 fails
   `error-handler.spec.ts` (JSON parse error message changed) and the
   `aws-lambda-ric` native build.

### Machine dependency install commands

```bash
# Node from .nvmrc
nvm install "$(cat .nvmrc)" && nvm use "$(cat .nvmrc)"

# Backend Jest: mongodb-memory-server's MongoDB binary links against OpenSSL 1.1
curl -fsSL -o /tmp/libssl1.1.deb https://security.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2.24_amd64.deb
echo "7cf39d70a639017d1dd7c8d36daa2258063608688e449fddf40ffdd46f992a78  /tmp/libssl1.1.deb" | sha256sum -c -
sudo dpkg -i /tmp/libssl1.1.deb

# serverless/virus-scanner: aws-lambda-ric builds native code with cmake + node-gyp
sudo apt-get install -y cmake autoconf automake libtool g++ make unzip libcurl4-openssl-dev python3
# node-gyp 9 imports distutils, which Python >= 3.12 no longer ships; point it at the system 3.10
npm_config_python=/usr/bin/python3 npm ci --prefix serverless/virus-scanner
```

## 2. Dependency foundation (TICKET-0)

TICKET-0 is the only `frontend/package.json` / lockfile change in Phase 1;
TICKET-G applies any further dependency changes Phase 1 tickets request in Jira.

Removed from `frontend/`: `react-scripts`, `@craco/craco`, `craco-alias`,
`worker-loader`, `env-cmd`, `cross-env`, `@storybook/addon-storyshots`,
`@storybook/addon-storyshots-puppeteer`, `puppeteer`,
`@storybook/preset-create-react-app`, `storybook-preset-craco`,
`storybook-addon-turbo-build`, `@storybook/jest`, `@storybook/testing-library`,
`@storybook/testing-react`, `@storybook/node-logger`, `@storybook/addon-actions`
(bundled in `addon-essentials`), `react-beautiful-dnd` and its types,
`@types/jest`, `ts-jest`, `html-webpack-plugin`, `http-proxy-middleware`,
`react-refresh`, `@types/storybook-react-router`, the
`react-error-overlay` override and the CRA `"proxy"` field. Root
`package.json` drops `webpack`, `webpack-cli`, `worker-loader` and `ts-loader`
(only used by the frontend Datadog chunk).

| Area                | Versions                                                                                                                                                                                                                                                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build               | `vite@5.4`, `@vitejs/plugin-react@4`, `vite-tsconfig-paths@4.3` (CJS entry, so `vite.config.ts` loads in this CommonJS package), `vite-plugin-svgr@4`, `vite-plugin-node-polyfills@0.22` (`buffer`/`stream`/`crypto` shims for `@opengovsg/formsg-sdk` / `tweetnacl` consumers)                                                   |
| Tests               | `vitest@2.1`, `@vitest/coverage-v8@2.1`, `jsdom@25`, `@testing-library/react@16`, `@testing-library/dom@10`, `@testing-library/jest-dom@6`, `@testing-library/user-event@14.5`                                                                                                                                                    |
| Storybook           | `storybook@8.6` and `@storybook/*@8.6` (`react`, `react-vite`, `test`, `addon-essentials`, `addon-a11y`, `addon-interactions`, `addon-links`, `blocks`, `theming`, `manager-api`), `eslint-plugin-storybook@0.8`, `storybook-react-i18next@3` (needs `i18next@23` / `react-i18next@14`), `msw@1.3.5` + `msw-storybook-addon@1.10` |
| Router              | `react-router-dom@~6.3.0` (pinned: `NavigationContext.navigator.block`, used by `useNavigationPrompt.ts`, is gone from 6.4)                                                                                                                                                                                                       |
| React               | `react@18.3`, `react-dom@18.3`, `@types/react@18`, `@types/react-dom@18`, `@hello-pangea/dnd@16.6` (maintained, API-compatible fork of `react-beautiful-dnd`)                                                                                                                                                                     |
| Chakra              | `@chakra-ui/react@2.10.10`, `@chakra-ui/cli@2.5.8`, `framer-motion@11`                                                                                                                                                                                                                                                            |
| TS                  | `typescript@5.4.5` (exact, devDependency), `@types/node@18`                                                                                                                                                                                                                                                                       |
| React 18 peer bumps | `dayzed@3.2.3`, `react-joyride@2.9`, `react-query@3.39`, `react-table@7.8`, `react-hook-form@7.53`, `react-textarea-autosize@8.5`, `react-use@17.6`, `react-waypoint@10.3`, `chromatic@11`, `intl-messageformat@10`, `i18next-browser-languagedetector@8`                                                                         |
| Tooling             | `patch-package@8` (6.x cannot read lockfile v3)                                                                                                                                                                                                                                                                                   |

`npm ci` needs no manual steps: `postinstall` runs `patch-package` (the
`@chakra-ui/form-control` v1 patch that drops the native `required` attribute
is re-created as `patches/@chakra-ui+react+2.10.10.patch` and applies),
`gen:theme-typings` (`chakra-cli tokens`, succeeds on CLI 2.5.8) and the
`shared/` install.

Scripts already point at the Phase 1 tooling (`vite`, `vite build`,
`vitest run`, `storybook dev` / `storybook build`, `tsc --noEmit`); they work
once TICKET-A/C/D land their configs. The `test:a11y*` scripts are gone
(Storyshots has no SB8 release; accessibility checks stay in
`@storybook/addon-a11y`).

TICKET-0 also scaffolds two stubs so A and B never edit the same file:
`frontend/vite.config.ts` (A) imports `buildOptions` / `buildPlugins` from
`frontend/vite.build.ts` (B). A keeps `build: buildOptions` and spreads
`...buildPlugins` into `plugins`; B keeps those two exports. The stub already
registers `@vitejs/plugin-react`, `vite-tsconfig-paths` and `vite-plugin-svgr`
so C and D can run Storybook / Vitest on their branches before A lands.

## 3. Env-var rename plan (`REACT_APP_*` → `VITE_APP_*`)

Vite exposes only `VITE_`-prefixed variables through `import.meta.env`
(`envPrefix` default). Each variable keeps its name with the prefix swapped.

| Old                                                                            | New                                                                              | Read in                                                   | Defined in                                                    |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------- |
| `REACT_APP_VERSION`                                                            | `VITE_APP_VERSION` (from `npm_package_version` via `define` in `vite.config.ts`) | `App.tsx`, `lazyRetry.ts`, `datadog-chunk.ts`             | `.buildtime-env`, `deploy-eb.yml`                             |
| `REACT_APP_URL`                                                                | `VITE_APP_URL`                                                                   | `growthbook.ts`, `axiosDebugFlow.tsx`, `datadog-chunk.ts` | `deploy-eb.yml`                                               |
| `REACT_APP_BASE_URL`                                                           | `VITE_APP_BASE_URL`                                                              | `ApiService.ts`                                           | —                                                             |
| `REACT_APP_GA_TRACKING_ID`                                                     | `VITE_APP_GA_TRACKING_ID`                                                        | `AppHelmet.tsx`, `index.tsx`                              | `.buildtime-env`, `deploy-eb.yml`, `docs/DEPLOYMENT_SETUP.md` |
| `REACT_APP_FORMSG_SDK_MODE`                                                    | `VITE_APP_FORMSG_SDK_MODE`                                                       | `formSdk.ts`                                              | `.buildtime-env`, `deploy-eb.yml`, `docs/DEPLOYMENT_SETUP.md` |
| `REACT_APP_DD_RUM_APP_ID`, `_CLIENT_TOKEN`, `_ENV`, `REACT_APP_DD_SAMPLE_RATE` | `VITE_APP_DD_RUM_APP_ID`, `_CLIENT_TOKEN`, `_ENV`, `VITE_APP_DD_SAMPLE_RATE`     | `App.tsx`, `datadog-chunk.ts`                             | `deploy-eb.yml`, `Dockerfile.production`                      |
| `process.env.PUBLIC_URL` / `%PUBLIC_URL%`                                      | `import.meta.env.BASE_URL` / relative paths (`base: './'`)                       | `serviceWorker.ts`, `index.html`                          | —                                                             |

`process.env.NODE_ENV` checks in the analytics / GrowthBook init stay as they
are (Vite replaces `process.env.NODE_ENV` statically). `.buildtime-env` is
deleted (TICKET-A); local overrides go in `frontend/.env.local`
(git-ignored). GitHub secret names stay unchanged; only the env names they map
to change (TICKET-B).

## 4. Phase 1 file-ownership map

| Ticket                                                                    | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Must not touch                                                                                                     |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| [A](https://cog-gtm.atlassian.net/browse/MBA-2932) – Vite build           | `frontend/vite.config.ts` (except build options, imported from `vite.build.ts`), `frontend/index.html` (moved from `public/`), `frontend/tsconfig.json` (paths merged in), `frontend/src/vite-env.d.ts`, env-read / `PUBLIC_URL` / worker / SVG import lines in `frontend/src/**` (incl. `StorageResponsesService.ts`, `typings/worker-loader.d.ts`); deletes `craco.config.js`, `tsconfig.paths.json`, `src/setupProxy.js`, `src/react-app-env.d.ts`, `.buildtime-env` | `*.test.*`, `*.stories.*`, `.storybook/`, `.github/`, `Dockerfile*`, `datadog-chunk.ts`, `shared/`, `package.json` |
| [B](https://cog-gtm.atlassian.net/browse/MBA-2933) – Datadog + deploy     | `frontend/datadog-chunk.ts`, `frontend/tsconfig.dd.json`, `frontend/vite.build.ts` (build options + build-only plugins), `.github/**`, `Dockerfile.production`, `Dockerfile.development`, `README.md`, `docs/DEPLOYMENT_SETUP.md`; deletes `webpack.dd.config.js`                                                                                                                                                                                                       | other `frontend/src/**`, `.storybook/`, tests, `package.json`                                                      |
| [C](https://cog-gtm.atlassian.net/browse/MBA-2934) – Storybook 8          | `frontend/.storybook/**` (→ `main.ts`, `preview.tsx`, `manager.ts`), `frontend/**/*.stories.*`, `frontend/**/*.mdx`, `frontend/src/mocks/**`, `frontend/public/mockServiceWorker.js`; deletes `frontend/__tests__/storyshots/`                                                                                                                                                                                                                                          | non-story app code, tests, A/B/D configs, `package.json`                                                           |
| [D](https://cog-gtm.atlassian.net/browse/MBA-2935) – Vitest               | `frontend/vitest.config.ts`, `frontend/src/setupTests.ts` → `frontend/src/test/setup.ts`, `frontend/**/*.test.*`, `frontend/src/test-utils.tsx`, `frontend/.eslintrc` (test env / globals); deletes `frontend/jest.config.js`                                                                                                                                                                                                                                           | app code, stories, `vite.config.ts`, `package.json`                                                                |
| [E](https://cog-gtm.atlassian.net/browse/MBA-2936) – React 18 + Chakra v2 | `frontend/src/**` app code (components, features, theme, `index.tsx` `createRoot`)                                                                                                                                                                                                                                                                                                                                                                                      | `*.test.*`, `*.stories.*`, env / worker / SVG import lines (A), `.storybook/`, `package.json`                      |
| [F](https://cog-gtm.atlassian.net/browse/MBA-2937) – Shared types TS5     | `shared/**` (except `package.json` / lockfile), backend `src/**` and `__tests__/**` consumers / fixtures, root `tsconfig*.json` if required                                                                                                                                                                                                                                                                                                                             | `frontend/**`, root `package.json`                                                                                 |

Overlap rules: where A and E touch the same file (e.g. `index.tsx`,
`App.tsx`), A owns only env / `PUBLIC_URL` / worker / SVG import lines and E
owns everything else; both keep edits minimal so the 3-way merge is clean. D
may add test-only shims in its setup file but not in app code.

## 5. Branches and Jira

| Ticket                                                         | Branch                                             |
| -------------------------------------------------------------- | -------------------------------------------------- |
| [Epic MBA-2930](https://cog-gtm.atlassian.net/browse/MBA-2930) | —                                                  |
| [0 MBA-2931](https://cog-gtm.atlassian.net/browse/MBA-2931)    | `feature/vite-20260929-2325-base`                  |
| [A MBA-2932](https://cog-gtm.atlassian.net/browse/MBA-2932)    | `feature/vite-20260929-2325-A-vite-build`          |
| [B MBA-2933](https://cog-gtm.atlassian.net/browse/MBA-2933)    | `feature/vite-20260929-2325-B-datadog-deploy`      |
| [C MBA-2934](https://cog-gtm.atlassian.net/browse/MBA-2934)    | `feature/vite-20260929-2325-C-storybook8`          |
| [D MBA-2935](https://cog-gtm.atlassian.net/browse/MBA-2935)    | `feature/vite-20260929-2325-D-vitest`              |
| [E MBA-2936](https://cog-gtm.atlassian.net/browse/MBA-2936)    | `feature/vite-20260929-2325-E-react18-chakra2`     |
| [F MBA-2937](https://cog-gtm.atlassian.net/browse/MBA-2937)    | `feature/vite-20260929-2325-F-shared-ts5`          |
| [G MBA-2938](https://cog-gtm.atlassian.net/browse/MBA-2938)    | `feature/vite-20260929-2325-base` (PR → `develop`) |

## 6. Local verification setup

Off-camera setup for the full-stack end-to-end run (MongoDB replica set, MailDev, LocalStack S3/SQS, ClamAV virus scanner, backend on `:5001`, Vite on `:3000`, Storybook on `:6006`). Synthetic data only. Paths assume the checkout at `/home/ubuntu/repos/FormSG` and scratch state in `/home/ubuntu/formsg-local`.

Use separate persistent shells for foreground processes. Keep these running
for the recorded take. Node 24 is otherwise first on PATH: select Node in
**every** new shell.

```bash
source ~/.nvm/nvm.sh
nvm use 18.20.2
```

### Dependencies and external working directory

Root dependencies were already installed at handoff. Frontend dependencies
must also be present (`npm ci --prefix frontend` on a fresh checkout).
The scanner requires its own dependencies:

```bash
cd /home/ubuntu/repos/FormSG
# Native Lambda runtime build prerequisites:
sudo apt-get update
sudo apt-get install -y cmake autoconf automake libtool build-essential \
  libcurl4-openssl-dev clamav clamav-daemon
npm_config_python=/usr/bin/python3 npm ci --prefix serverless/virus-scanner
mkdir -p /home/ubuntu/formsg-local/{mongo,mongo-secondary,scanner,evidence}
```

This machine has `libssl1.1 1.1.1f-1ubuntu2.24` installed for MongoDB 4.0,
and cached binary
`/home/ubuntu/.cache/mongodb-binaries/mongod-x64-ubuntu-4.0.22`.
Use the libssl1.1 installation instructions in FRONTEND_MODERNIZATION.md
on a fresh Ubuntu 22.04 machine. Docker Hub pulls for Mongo and MailDev
returned HTTP 429 during setup, so neither is containerized here.
ClamAV installed version: `1.5.4+dfsg-0ubuntu0.22.04.1`.

### Mongo: a primary AND secondary are required

Submission reads use `read: 'secondary'`. A single-member replica set permits
submission but times out on admin response-count queries.

```bash
MONGOD=/home/ubuntu/.cache/mongodb-binaries/mongod-x64-ubuntu-4.0.22
$MONGOD --dbpath /home/ubuntu/formsg-local/mongo --replSet rs0 \
  --bind_ip 127.0.0.1 --port 27017 \
  --logpath /home/ubuntu/formsg-local/mongo.log --fork
$MONGOD --dbpath /home/ubuntu/formsg-local/mongo-secondary --replSet rs0 \
  --bind_ip 127.0.0.1 --port 27018 \
  --logpath /home/ubuntu/formsg-local/mongo-secondary.log --fork
```

The external helper `/home/ubuntu/formsg-local/setup.cjs` initializes rs0,
seeds the agency, writes backend.env, and creates S3/SQS resources.
Its complete reproduction is below. Save as that filename:

```js
const root = '/home/ubuntu/repos/FormSG'
const fs = require('fs')
const yaml = require(root + '/node_modules/js-yaml')
const env = Object.fromEntries(
  yaml.load(fs.readFileSync(root + '/docker-compose.yml', 'utf8'))
    .services.backend.environment.filter(x => x.includes('='))
    .map(x => [x.slice(0, x.indexOf('=')), x.slice(x.indexOf('=') + 1)])
)
Object.assign(env, {
  PORT: '5001',
  DB_HOST: 'mongodb://127.0.0.1:27017/formsg?replicaSet=rs0',
  SES_HOST: '127.0.0.1',
  AWS_REGION: 'ap-southeast-1',
  VIRUS_SCANNER_LAMBDA_ENDPOINT: 'http://localhost:9999',
  GROWTHBOOK_CLIENT_KEY: 'sdk-local',
  GOOGLE_CAPTCHA: '',
  GOOGLE_CAPTCHA_PUBLIC: '',
  WEBHOOK_SQS_URL: 'http://localhost:4566/000000000000/local-webhooks-sqs-main',
})
fs.writeFileSync('/home/ubuntu/formsg-local/backend.env',
  Object.entries(env).map(([k,v]) => `${k}=${JSON.stringify(v)}`).join('\n') + '\n')
async function main() {
  const {MongoClient} = require(root + '/node_modules/mongodb')
  const client = await MongoClient.connect(
    'mongodb://127.0.0.1:27017/?directConnection=true',
    {useUnifiedTopology: true})
  try {
    await client.db('admin').command({replSetInitiate: {
      _id: 'rs0', members: [{_id: 0, host: '127.0.0.1:27017'}]
    }})
  } catch (e) { if (e.codeName !== 'AlreadyInitialized') throw e }
  for (let i = 0; i < 30; i++) {
    if ((await client.db('admin').command({isMaster: 1})).ismaster) break
    await new Promise(r => setTimeout(r, 1000))
  }
  await client.db('formsg').collection('agencies').updateOne(
    {shortName: 'govtech'},
    {$setOnInsert: {
      shortName: 'govtech', fullName: 'Government Technology Agency',
      logo: 'https://s3-ap-southeast-1.amazonaws.com/agency-logo.form.sg/govtech.jpg',
      emailDomain: ['tech.gov.sg', 'data.gov.sg', 'form.sg', 'open.gov.sg']
    }}, {upsert: true})
  await client.close()
  const AWS = require(root + '/node_modules/aws-sdk')
  const config = {endpoint: 'http://localhost:4566', region: 'ap-southeast-1',
    accessKeyId: 'fakeKey', secretAccessKey: 'fakeSecret'}
  await new AWS.SQS(config).createQueue({QueueName: 'local-webhooks-sqs-main'}).promise()
  const s3 = new AWS.S3({...config, s3ForcePathStyle: true})
  for (const Bucket of Object.entries(env).filter(([k]) =>
    k.endsWith('_S3_BUCKET')).map(([,v]) => v)) {
    try { await s3.createBucket({Bucket}).promise() }
    catch (e) {
      if (!['BucketAlreadyOwnedByYou','BucketAlreadyExists'].includes(e.code)) throw e
    }
    await s3.putBucketCors({Bucket, CORSConfiguration: {CORSRules: [{
      AllowedHeaders: ['*'], AllowedMethods: ['GET','PUT','POST','HEAD'],
      AllowedOrigins: ['http://localhost:3000'],
      ExposeHeaders: ['ETag','x-amz-version-id']
    }]}}).promise()
    if (Bucket.includes('virus-scanner')) await s3.putBucketVersioning({
      Bucket, VersioningConfiguration: {Status: 'Enabled'}
    }).promise()
  }
}
main().catch(e => {console.error(e); process.exitCode = 1})
```

After running the helper (see LocalStack below), add the secondary once:

```bash
cd /home/ubuntu/repos/FormSG
node <<'JS'
const {MongoClient} = require('mongodb')
;(async () => {
  const c = await MongoClient.connect(
    'mongodb://127.0.0.1:27017/?directConnection=true', {useUnifiedTopology: true})
  const a = c.db('admin')
  const {config} = await a.command({replSetGetConfig: 1})
  if (!config.members.some(m => m.host === '127.0.0.1:27018')) {
    config.version++
    config.members.push({_id: 1, host: '127.0.0.1:27018', priority: 0})
    await a.command({replSetReconfig: config})
  }
  console.log((await a.command({replSetGetStatus: 1})).members.map(
    m => ({name: m.name, state: m.stateStr})))
  await c.close()
})().catch(e => {console.error(e); process.exitCode = 1})
JS
```

Wait for PRIMARY and SECONDARY before the take. Database files persist across
process restarts; do not recreate the replica set on each restart.

### LocalStack S3/SQS

```bash
docker run -d --name formsg-s3 -p 4566:4566 -e SERVICES=s3,sqs \
  localstack/localstack:3.3
# On subsequent restarts:
docker start formsg-s3
cd /home/ubuntu/repos/FormSG
node /home/ubuntu/formsg-local/setup.cjs
```

Buckets generated from compose:
`local-attachment-bucket`, `local-payment-proof-bucket`, `local-image-bucket`,
`local-logo-bucket`, `local-static-assets-bucket`,
`local-virus-scanner-quarantine-bucket`, `local-virus-scanner-clean-bucket`.
Quarantine and clean **both require versioning**: scanner rejects missing
VersionId. CORS allows localhost:3000 and exposes ETag/x-amz-version-id.
No persistent LocalStack volume was mounted; rerun helper if S3 state is lost.

### MailDev and Mockpass (separate shells)

```bash
cd /home/ubuntu/repos/FormSG
./node_modules/.bin/maildev --ip 127.0.0.1 \
  > /home/ubuntu/formsg-local/mail.log 2>&1
```

UI is http://localhost:1080; SMTP is 127.0.0.1:1025.

```bash
cd /home/ubuntu/repos/FormSG
MOCKPASS_PORT=5156 ./node_modules/.bin/mockpass \
  > /home/ubuntu/formsg-local/mockpass.log 2>&1
```

Mockpass prevents background discovery retries to port 5156. OTP does not
require using Singpass or SGID.

### Real ClamAV and unmodified scanner through Lambda RIE

Ensure daily/main/bytecode databases are downloaded. The installed freshclam
service was already downloading them; running another freshclam concurrently
returned a lock error. Check `/var/log/clamav/freshclam.log`; wait for completion
instead of starting competing updaters. On a host without an updater, run
`sudo freshclam` once.

Save `/home/ubuntu/formsg-local/clamd.conf`:

```conf
LocalSocket /tmp/clamd.ctl
LocalSocketMode 666
DatabaseDirectory /var/lib/clamav
LogFile /tmp/formsg-clamd.log
PidFile /tmp/formsg-clamd.pid
User clamav
Foreground yes
```

Start in a persistent shell:

```bash
sudo /usr/sbin/clamd --config-file=/home/ubuntu/formsg-local/clamd.conf
```

Compile scanner out of tree and install the Lambda runtime emulator:

```bash
cd /home/ubuntu/repos/FormSG/serverless/virus-scanner
./node_modules/.bin/tsc --outDir /home/ubuntu/formsg-local/scanner
curl -L https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/aws-lambda-rie \
  -o /home/ubuntu/formsg-local/aws-lambda-rie
chmod +x /home/ubuntu/formsg-local/aws-lambda-rie
# Native scanner dev S3 endpoint is hardcoded to host.docker.internal:
grep -q host.docker.internal /etc/hosts || \
  echo '127.0.0.1 host.docker.internal' | sudo tee -a /etc/hosts
```

Start in its own persistent Node 18 shell:

```bash
cd /home/ubuntu/formsg-local/scanner
NODE_PATH=/home/ubuntu/repos/FormSG/serverless/virus-scanner/node_modules \
NODE_ENV=development \
VIRUS_SCANNER_QUARANTINE_S3_BUCKET=local-virus-scanner-quarantine-bucket \
VIRUS_SCANNER_CLEAN_S3_BUCKET=local-virus-scanner-clean-bucket \
/home/ubuntu/formsg-local/aws-lambda-rie \
  --runtime-interface-emulator-address 127.0.0.1:9999 \
  /home/ubuntu/repos/FormSG/serverless/virus-scanner/node_modules/.bin/aws-lambda-ric \
  index.handler > /home/ubuntu/formsg-local/scanner.log 2>&1
```

This is not a fake scanner handler. The real submission invokes the unchanged
handler, streams quarantine data to clamd, and moves clean data to the
versioned clean bucket. scanner.log shows each step.

### Backend and Vite (separate shells)

```bash
cd /home/ubuntu/repos/FormSG
DOTENV_CONFIG_PATH=/home/ubuntu/formsg-local/backend.env npm run dev:backend \
  > /home/ubuntu/formsg-local/backend.log 2>&1
```

The env file inherits all compose backend entries (including checked-in
development-only keys/cert paths) and overrides those listed in setup.cjs.
Important values: PORT=5001, DB_HOST with replicaSet=rs0, SES_HOST=127.0.0.1,
SES_PORT=1025, AWS_ENDPOINT=http://127.0.0.1:4566,
VIRUS_SCANNER_LAMBDA_ENDPOINT=http://localhost:9999,
GROWTHBOOK_CLIENT_KEY=sdk-local. Empty GrowthBook key throws `Missing clientKey`.
`sdk-local` is a synthetic nonempty local key, not a production credential or
proof of remote GrowthBook feature delivery. No flag data was seeded; the
default local path allowed storage attachments. CAPTCHA values are empty.

```bash
cd /home/ubuntu/repos/FormSG/frontend
VITE_APP_FORMSG_SDK_MODE=development VITE_APP_URL=http://localhost:3000 \
  npx vite > /home/ubuntu/formsg-local/vite.log 2>&1
```

Vite proxies /api to :5001. Do not use `.buildtime-env` or `REACT_APP_*`.

### Storybook and requested supplementary command

```bash
cd /home/ubuntu/repos/FormSG/frontend
npx storybook dev -p 6006 --no-open \
  > /home/ubuntu/formsg-local/storybook.log 2>&1
# Separate shell, Node 18:
npx vitest run > /home/ubuntu/formsg-local/vitest.log 2>&1
```

If a previously used browser profile shows a Storybook story stuck on the
loading spinner, unregister the `localhost:6006` service worker and clear site
data (DevTools → Application); a fresh profile renders stories directly.

### Synthetic data and UI workflow

Login at http://localhost:3000/admin with `vite-tester@open.gov.sg`.
Read the current OTP in MailDev at http://localhost:1080; never hardcode an OTP.
The govtech agency is seeded above; the user itself was created by real OTP
login. No response or form was inserted directly into Mongo.

Create a storage form, download its secret key, acknowledge safe storage,
add Short Text (`Synthetic reference`) and Attachment (`Synthetic evidence`).
In Settings, turn off "Enable reCAPTCHA" (new forms default it on, and the
local `GOOGLE_CAPTCHA*` keys are empty, so the public form would never finish
loading). Then activate the form, uploading its secret-key file as prompted. Submit on
the actual public link (not preview). Admin Responses requires the downloaded
secret-key file to decrypt. Open the response and click Download file.

Upload a locally generated synthetic file (see below) and keep its path;
the browser download lands in `~/Downloads`.

Compare with:
```bash
sha256sum /home/ubuntu/formsg-local/synthetic-evidence.png \
  ~/Downloads/synthetic-evidence.png
```

For a fresh synthetic image without PIL:
```bash
python3 - <<'PY'
import struct,zlib,os
def chunk(t,d):
    return struct.pack('!I',len(d))+t+d+struct.pack('!I',zlib.crc32(t+d)&0xffffffff)
data=b''.join(b'\0'+os.urandom(64*3) for _ in range(64))
png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',64,64,8,2,0,0,0))
png+=chunk(b'IDAT',zlib.compress(data))+chunk(b'IEND',b'')
open('/home/ubuntu/formsg-local/synthetic-evidence-new.png','wb').write(png)
PY
```
Its hash will differ: record the fresh file hash and compare the corresponding
download, avoiding browser duplicate-filename suffixes.

### Restart checklist

Keep two Mongo members, formsg-s3, MailDev, Mockpass, clamd, scanner RIE, backend,
Vite and Storybook running. Use the same commands in their respective sections
to restart terminated processes; stop the existing service before binding its
port again. Do not clear Mongo/LocalStack while reusing a previously created
form. Services are local development only, not production-safe defaults.
