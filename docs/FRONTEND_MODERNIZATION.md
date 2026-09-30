# Frontend modernization: Vite + Storybook 8 + Vitest + React 18 + Chakra v2 + TS5

Epic: [MBA-2966](https://cog-gtm.atlassian.net/browse/MBA-2966) · suffix `vite-20260930-0127-d4130` · base branch `feature/vite-20260930-0127-d4130-base`

## Baseline (TICKET-0, `develop` @ `61afcde4d`, before any change)

Measured on Ubuntu 22.04, 8 vCPU / 31 GB, Node `v18.20.2` (from `.nvmrc`), npm `10.5.0`, clean `npm ci` at the root and in `serverless/virus-scanner`.

| Check                                                 | Command                                                                            | Result                                                                                             | Time     |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------- |
| Frontend Jest                                         | `cd frontend && CI=true npm test -- --watchAll=false`                              | pass — 25 suites, 182 tests                                                                        | 53 s     |
| Backend Jest (incl. `serverless/virus-scanner` specs) | `npm run test:backend:ci`                                                          | pass — 153 suites, 2910 tests (+1 todo)                                                            | 4 m 07 s |
| `serverless/virus-scanner`                            | `cd serverless/virus-scanner && npm ci && npx tsc --noEmit`                        | pass (no own test script; its specs run in backend Jest)                                           | 2 s      |
| Full build                                            | `NODE_OPTIONS='--max-old-space-size=4096 --openssl-legacy-provider' npm run build` | pass — `dist/frontend` with separate Datadog chunk and `decryption.worker.*.js`, no inline scripts | 2 m 10 s |
| Storybook build                                       | `cd frontend && npm run build-storybook`                                           | pass                                                                                               | 1 m 41 s |
| Frontend lint                                         | `npm run lint:frontend`                                                            | pass on a clean tree — 0 errors, 34 warnings                                                       | 30 s     |
| Backend lint                                          | `npm run lint-ci`                                                                  | pass                                                                                               | 42 s     |
| Backend `tsc` (build)                                 | `npx tsc --noEmit -p tsconfig.build.json`                                          | pass                                                                                               | 15 s     |
| Backend `tsc` (incl. tests)                           | `npx tsc --noEmit -p tsconfig.json`                                                | fail — 74 errors (67 in `src/app`, test files, `frontend/node_modules`)                            | 19 s     |
| Frontend `tsc`                                        | `cd frontend && npx tsc --noEmit`                                                  | fail — 206 errors, all in `../shared/node_modules` (`type-fest` / `@types/*` need TS ≥ 5)          | 30 s     |

Every row must match or beat this after each ticket. The two failing `tsc` rows are expected to become passes (frontend) or be no worse (backend including tests).

Note: the baseline `build:dd-chunk` step rewrites `frontend/public/index.html` in place (html-webpack-plugin injects the Datadog `<script>`), which then fails `prettier -c` if lint runs after a build. Run lint on a clean tree.

## Machine setup

On a fresh Ubuntu 22.04 machine:

```bash
# Node from .nvmrc (must be first on PATH; some images ship a newer global node)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.nvm/nvm.sh && nvm install "$(cat .nvmrc)" && nvm alias default "$(cat .nvmrc)" && nvm use "$(cat .nvmrc)"

# Native build tools (serverless/virus-scanner -> aws-lambda-ric needs cmake + autotools)
sudo apt-get update && sudo apt-get install -y build-essential g++ make cmake autoconf automake libtool python3-setuptools
# node-gyp needs a Python with distutils; if python3 on PATH is >= 3.12 (e.g. pyenv), point npm at the system one
export npm_config_python=/usr/bin/python3

# libssl1.1 — required by the mongodb-memory-server binary used in backend Jest
curl -fsSL -o /tmp/libssl1.1.deb https://security.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2.24_amd64.deb
echo "7cf39d70a639017d1dd7c8d36daa2258063608688e449fddf40ffdd46f992a78  /tmp/libssl1.1.deb" | sha256sum -c -
sudo dpkg -i /tmp/libssl1.1.deb

# Dependencies
npm ci                                   # root (runs frontend + shared installs via postinstall)
(cd serverless/virus-scanner && npm ci)  # its specs are part of backend Jest
```

## Dependency foundation (TICKET-0, [MBA-2967](https://cog-gtm.atlassian.net/browse/MBA-2967))

This is the only `frontend/package.json` / `frontend/package-lock.json` change in the epic. Phase 1 tickets must not touch either; request changes as a Jira comment on the ticket and TICKET-G applies them.

- Removed: `react-scripts`, `@craco/craco`, `craco-alias`, `worker-loader`, `env-cmd`, `@storybook/addon-storyshots(-puppeteer)`, `puppeteer`, `@storybook/preset-create-react-app`, `storybook-preset-craco`, `storybook-addon-turbo-build`, `@storybook/jest`, `@storybook/testing-library`, `@storybook/testing-react`, `@storybook/node-logger`, `ts-jest`, `@types/jest`, `react-beautiful-dnd` (+ types), `html-webpack-plugin`, `http-proxy-middleware`, `react-refresh`, `@types/storybook-react-router`, the CRA `proxy` field and the `react-error-overlay` override.
- Added / upgraded (resolved versions): `vite` 5.4.21, `@vitejs/plugin-react` 4.7, `vite-tsconfig-paths` 4.3, `vite-plugin-svgr` 4.5, `vite-plugin-node-polyfills` 0.22 (`@opengovsg/formsg-sdk` and friends need `crypto`/`stream`/`util`/`events`/`buffer`, which Webpack 4 polyfilled implicitly), `vitest` 2.1.9 + `jsdom` 24, Storybook 8.6 (`storybook`, `@storybook/react-vite`, `@storybook/react`, `@storybook/test`, `@storybook/blocks`, `@storybook/manager-api`, `@storybook/theming`, addons a11y/actions/essentials/interactions/links), `msw-storybook-addon` 1.10 (keeps `msw` 0.36, the lowest that works), `storybook-react-i18next` 3, `eslint-plugin-storybook` 0.8, React / React DOM 18.3.1, `@types/react(-dom)` 18.3, `@chakra-ui/react` 2.8.2 + `@chakra-ui/cli` 2, `framer-motion` 10.18, `typescript` 5.4.5, `@testing-library/react` 16 / `dom` 10 / `jest-dom` 6 / `user-event` 14.6, `@types/node` 18, `@hello-pangea/dnd` 16.6 (maintained, API-compatible `react-beautiful-dnd` fork).
- Bumped within their majors so their peer ranges include React 18: `dayzed`, `react-hook-form` (7.29), `react-joyride` (2.9), `react-query` (3.39), `react-table` (7.8), `react-textarea-autosize`, `react-use`, `react-waypoint`. `react-wordcloud` has no React 18 release; `legacy-peer-deps` in `frontend/.npmrc` already covers it.
- `patches/@chakra-ui+form-control+1.6.0.patch` → `patches/@chakra-ui+form-control+2.2.0.patch` (same change: don't forward native `required`). Verified: `patch-package` reports `@chakra-ui/form-control@2.2.0 ✔` during `npm ci`.
- `gen:theme-typings` now passes `--out node_modules/@chakra-ui/styled-system/dist/theming.types.d.ts` (CLI 2.x cannot locate styled-system on its own here) and no longer swallows failures with `|| true`. Verified: typings are generated during `npm ci`.
- Scripts: `start` → `vite`, `build` → `vite build`, `preview` → `vite preview`, `test` → `vitest run`, `test:watch` → `vitest`, `storybook` → `storybook dev -p 6006`, `build-storybook` → `storybook build`; `eject`, `build:dd-chunk`, `test:a11y*` removed.
- `rm -rf frontend/node_modules && (cd frontend && npm ci)` completes with no manual steps.

After this ticket alone the frontend does not build or type-check (1431 `tsc` errors across app, tests and stories); Phase 1 fixes that.

## Env-var rename plan

Vite only exposes `VITE_*` variables on `import.meta.env`. Every `REACT_APP_*` becomes `VITE_APP_*` with the same suffix:

| Old (CRA)                       | New (Vite)                     | Read in                                                                | Set by                                        |
| ------------------------------- | ------------------------------ | ---------------------------------------------------------------------- | --------------------------------------------- |
| `REACT_APP_VERSION`             | `VITE_APP_VERSION`             | `App.tsx`, `utils/lazyRetry.ts`, Datadog chunk                         | `frontend/.env` (deploy-eb), Docker build arg |
| `REACT_APP_URL`                 | `VITE_APP_URL`                 | `growthbook.ts`, `public-form/utils/axiosDebugFlow.tsx`, Datadog chunk | deploy-eb, Docker                             |
| `REACT_APP_BASE_URL`            | `VITE_APP_BASE_URL`            | `ApiService.ts`                                                        | local `.env`                                  |
| `REACT_APP_GA_TRACKING_ID`      | `VITE_APP_GA_TRACKING_ID`      | `index.tsx`, `AppHelmet.tsx`                                           | deploy-eb, Docker                             |
| `REACT_APP_FORMSG_SDK_MODE`     | `VITE_APP_FORMSG_SDK_MODE`     | `formSdk.ts`                                                           | deploy-eb, Docker                             |
| `REACT_APP_DD_RUM_APP_ID`       | `VITE_APP_DD_RUM_APP_ID`       | Datadog chunk                                                          | deploy-eb, CI build                           |
| `REACT_APP_DD_RUM_CLIENT_TOKEN` | `VITE_APP_DD_RUM_CLIENT_TOKEN` | `App.tsx` (browser-logs), Datadog chunk                                | deploy-eb, CI build                           |
| `REACT_APP_DD_RUM_ENV`          | `VITE_APP_DD_RUM_ENV`          | `App.tsx` (browser-logs), Datadog chunk                                | deploy-eb, CI build                           |
| `REACT_APP_DD_SAMPLE_RATE`      | `VITE_APP_DD_SAMPLE_RATE`      | Datadog chunk                                                          | deploy-eb, CI build                           |

`%PUBLIC_URL%` in `index.html` becomes a relative path (Vite `base: './'`); `%REACT_APP_*%` placeholders become `%VITE_APP_*%` (Vite's HTML env replacement). `frontend/.buildtime-env` (read by `env-cmd`) is deleted; Vite loads `frontend/.env*` natively. `NODE_ENV` checks stay as they are (`process.env.NODE_ENV` is still defined by Vite; TICKET-A may keep or map it, but must not change the checks' behavior).

## Phase 1 file ownership

Each Phase 1 ticket runs on its own branch off the base branch and only edits the files it owns. Nobody in Phase 1 touches `frontend/package.json` or any lockfile.

| Ticket                                                                               | Branch                                               | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A — Vite build ([MBA-2970](https://cog-gtm.atlassian.net/browse/MBA-2970))           | `feature/vite-20260930-0127-d4130-a-vite-build`      | `frontend/vite.config.ts` (everything except the `build` block), `frontend/index.html` (moved from `public/`), `frontend/src/vite-env.d.ts`, `frontend/tsconfig.json`, `frontend/tsconfig.paths.json` (delete), `craco.config.js`, `src/setupProxy.js`, `src/react-app-env.d.ts`, `.buildtime-env` (delete), the worker call site in `StorageResponsesService.ts` + `worker/decryption.worker.ts`, SVG component imports, every `process.env.REACT_APP_*` read in `frontend/src` |
| B — Datadog + deploy ([MBA-2968](https://cog-gtm.atlassian.net/browse/MBA-2968))     | `feature/vite-20260930-0127-d4130-b-datadog-deploy`  | `.github/`, `Dockerfile.production`, `Dockerfile.development`, `README.md` (`--openssl-legacy-provider` note), `frontend/datadog-chunk.ts`, `frontend/webpack.dd.config.js` + `tsconfig.dd.json` (replace), the `build` block of `vite.config.ts` and any Datadog helper it imports, the Datadog `<script>` in `index.html` `<head>`                                                                                                                                             |
| C — Storybook 8 ([MBA-2971](https://cog-gtm.atlassian.net/browse/MBA-2971))          | `feature/vite-20260930-0127-d4130-c-storybook8`      | `frontend/.storybook/**`, `frontend/__tests__/storyshots/**` (delete), `**/*.stories.*`, `**/*.mdx`, `src/utils/storybook.tsx`                                                                                                                                                                                                                                                                                                                                                   |
| D — Vitest ([MBA-2974](https://cog-gtm.atlassian.net/browse/MBA-2974))               | `feature/vite-20260930-0127-d4130-d-vitest`          | `frontend/vitest.config.ts`, the Vitest setup file (replaces `src/setupTests.ts`), `frontend/jest.config.js` (delete), `**/*.test.*`, test-only helpers/mocks under `src/**/__mocks__` / `src/mocks`, `frontend/.eslintrc` test overrides                                                                                                                                                                                                                                        |
| E — React 18 + Chakra v2 ([MBA-2973](https://cog-gtm.atlassian.net/browse/MBA-2973)) | `feature/vite-20260930-0127-d4130-e-react18-chakra2` | all other `frontend/src/**` app code (`index.tsx` → `createRoot`, components, features, theme, DnD import swap), excluding `*.test.*`, `*.stories.*` and A's env/SVG/worker lines                                                                                                                                                                                                                                                                                                |
| F — Shared types TS5 ([MBA-2972](https://cog-gtm.atlassian.net/browse/MBA-2972))     | `feature/vite-20260930-0127-d4130-f-shared-ts5`      | `shared/**`, backend `src/**` and `__tests__/**` consumers/fixtures, root `tsconfig*.json`                                                                                                                                                                                                                                                                                                                                                                                       |

Overlaps (A's env/SVG edits vs. E in the same app files; A vs. B in `vite.config.ts` / `index.html`) are expected to be small, line-disjoint and resolved in TICKET-G.

## Local verification setup

Full stack used for the end-to-end run (synthetic data only). Run from the repo root with Node from `.nvmrc` selected and the machine setup above done. Each long-running process gets its own shell.

```bash
source ~/.nvm/nvm.sh && nvm use && export npm_config_python=/usr/bin/python3
(cd serverless/virus-scanner && npm ci)
sudo apt-get install -y clamav clamav-daemon   # native ClamAV + definitions in /var/lib/clamav
```

### MongoDB replica set (primary + secondary)

Submission reads use `readPreference: secondary`, so a single-node replica set leaves the Results page loading forever. Docker Hub rate limits blocked `bitnami/mongodb:4.4`, so the `mongod` binary cached by `mongodb-memory-server` (installed by backend Jest) was used:

```bash
MONGOD=$(ls ~/.cache/mongodb-binaries/mongod-* | head -1)
mkdir -p /tmp/formsg-mongo/{p,s}
$MONGOD --replSet rs0 --bind_ip 127.0.0.1 --port 27017 --dbpath /tmp/formsg-mongo/p --logpath /tmp/formsg-mongo/p.log --fork
$MONGOD --replSet rs0 --bind_ip 127.0.0.1 --port 27018 --dbpath /tmp/formsg-mongo/s --logpath /tmp/formsg-mongo/s.log --fork
node -e "
const { MongoClient } = require('mongodb')
;(async () => {
  const c = await MongoClient.connect('mongodb://127.0.0.1:27017/?directConnection=true')
  const admin = c.db('admin')
  await admin.command({ replSetInitiate: { _id: 'rs0', members: [
    { _id: 0, host: '127.0.0.1:27017' },
    { _id: 1, host: '127.0.0.1:27018', priority: 0, votes: 0 } ] } })
  await c.close()
})()"
```

Wait until `rs.status()` shows one PRIMARY and one SECONDARY.

### MailDev, LocalStack, seed data

```bash
node ./node_modules/.bin/maildev --web 1080 --smtp 1025          # OTP mails at http://localhost:1080
docker run -d --name formsg-localstack -p 4566:4566 \
  -e SERVICES=s3,sqs,secretsmanager -e DNS_ADDRESS=0 \
  -e EXTRA_CORS_ALLOWED_ORIGINS=http://localhost:3000 localstack/localstack:3.3
```

Then create the buckets (versioned, CORS for `http://localhost:3000` and `:5001`), the webhooks queue and the synthetic `govtech` agency whose email domains admins log in with:

```bash
node -e "
const AWS = require('aws-sdk'), { MongoClient } = require('mongodb')
;(async () => {
  const opts = { endpoint: 'http://localhost:4566', region: 'ap-southeast-1', accessKeyId: 'fakeKey', secretAccessKey: 'fakeSecret' }
  const s3 = new AWS.S3({ ...opts, s3ForcePathStyle: true })
  for (const n of ['attachment','payment-proof','image','logo','static-assets','virus-scanner-quarantine','virus-scanner-clean']) {
    const Bucket = 'local-' + n + '-bucket'
    await s3.createBucket({ Bucket }).promise().catch((e) => { if (e.code !== 'BucketAlreadyOwnedByYou') throw e })
    await s3.putBucketVersioning({ Bucket, VersioningConfiguration: { Status: 'Enabled' } }).promise()
    await s3.putBucketCors({ Bucket, CORSConfiguration: { CORSRules: [{ AllowedHeaders: ['*'], AllowedMethods: ['GET','PUT','POST','HEAD'],
      AllowedOrigins: ['http://localhost:3000','http://localhost:5001'], ExposeHeaders: ['ETag','x-amz-version-id'] }] } }).promise()
  }
  await new AWS.SQS({ ...opts, region: 'us-east-1' }).createQueue({ QueueName: 'local-webhooks-sqs-main' }).promise()
  const c = await MongoClient.connect('mongodb://127.0.0.1:27017/formsg?replicaSet=rs0')
  await c.db().collection('agencies').updateOne({ shortName: 'govtech' }, { \$setOnInsert: { shortName: 'govtech',
    fullName: 'Government Technology Agency', emailDomain: ['tech.gov.sg','data.gov.sg','form.sg','open.gov.sg'] } }, { upsert: true })
  await c.close()
})()"
```

### Virus scanner (real ClamAV)

```bash
cat > /tmp/clamd.conf <<'CONF'
LocalSocket /tmp/clamd.ctl
LocalSocketMode 666
DatabaseDirectory /var/lib/clamav
User clamav
Foreground yes
CONF
sudo clamd -c /tmp/clamd.conf
curl -fL -o /tmp/aws-lambda-rie https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/aws-lambda-rie && chmod +x /tmp/aws-lambda-rie
cd serverless/virus-scanner && npm run build
NODE_ENV=development VIRUS_SCANNER_QUARANTINE_S3_BUCKET=local-virus-scanner-quarantine-bucket \
  VIRUS_SCANNER_CLEAN_S3_BUCKET=local-virus-scanner-clean-bucket \
  /tmp/aws-lambda-rie --runtime-interface-emulator-address 0.0.0.0:9999 ./node_modules/.bin/aws-lambda-ric build/index.handler
```

### Backend (:5001), Mockpass, Vite (:3000), Storybook (:6006)

The backend takes every `NAME=value` from `services.backend.environment` in `docker-compose.yml` (local test keys only), with these overrides:

```bash
MOCKPASS_PORT=5156 ./node_modules/.bin/mockpass
node -e "
const env = { ...process.env }
for (const e of require('js-yaml').load(require('fs').readFileSync('docker-compose.yml', 'utf8')).services.backend.environment) {
  const i = e.indexOf('='); if (i > 0) env[e.slice(0, i)] = e.slice(i + 1)
}
Object.assign(env, { PORT: '5001', DB_HOST: 'mongodb://127.0.0.1:27017/formsg?replicaSet=rs0', SES_HOST: '127.0.0.1',
  AWS_REGION: 'ap-southeast-1', VIRUS_SCANNER_LAMBDA_ENDPOINT: 'http://localhost:9999', GROWTHBOOK_CLIENT_KEY: 'sdk-local-verification' })
require('child_process').spawn('./node_modules/.bin/ts-node', ['--transpile-only', 'src/app/server.ts'], { env, stdio: 'inherit' })"
cd frontend && npm start                       # Vite on :3000, /api -> :5001
cd frontend && npm run storybook -- --ci       # Storybook on :6006
```

`GROWTHBOOK_CLIENT_KEY` only needs to be non-empty; no feature flag gates this migration.

### Flow

1. Log in at `http://localhost:3000/login` with a synthetic `@tech.gov.sg` address; read the OTP in MailDev.
2. Create a Storage-mode form, save the secret key outside the repo, add a Short answer and an Attachment field.
3. In Settings, disable reCAPTCHA (local run only) and open the form with the secret key.
4. Submit the public form with a synthetic file, e.g. `head -c 4096 /dev/urandom | base64 > /tmp/upload.txt`.
5. In Results, unlock with the secret key, open the response and download the attachment; `sha256sum` upload and download must match.
6. Open a story (e.g. `?path=/story/components-button--solid-primary`) and run `cd frontend && npx vitest run`.

When Storybook is driven through Chrome DevTools automation, the MSW service worker can stay paused on the debugger (`sb-show-preparing-story` forever); resume it with `Runtime.runIfWaitingForDebugger` on the worker target. This does not happen in a normal browser.
