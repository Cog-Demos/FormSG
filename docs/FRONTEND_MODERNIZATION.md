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
# pyenv shims resolve to the global Python (3.12, no distutils); point node-gyp at the real 3.11 binary
PY311="$(pyenv prefix 3.11 2>/dev/null)/bin/python3.11"; [ -x "$PY311" ] || PY311="$(command -v python3.11)"
PYTHON="$PY311" npm_config_python="$PY311" npm ci --prefix serverless/virus-scanner
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

## Local verification setup

These commands describe the isolated local stack used for the Vite verification
on Ubuntu, with Node **18.20.2** and synthetic data only. Run from
`/home/ubuntu/fsg-base`; do not change repository configuration or stop an
unrelated backend Jest run. Service logs and helper files live outside the repo
in `/tmp/fsg-verification`. Commands below assume unused ports and a fresh stack;
reuse existing named containers instead of recreating them on every rerun.

**Verification status:** a full unrecorded dry run on `37c68316e` passed: OTP login, storage-mode form
with short-text and Attachment fields, activation, public submission scanned clean by ClamAV,
worker decryption and CSV export, attachment download with matching SHA-256, the Settings deep
link, and a Storybook story. After upgrading a prebundled dependency (e.g. react-joyride), restart
Vite with `--force` and restart Storybook.

### Dependencies and services

```sh
source ~/.nvm/nvm.sh
nvm use 18.20.2
mkdir -p /tmp/fsg-verification
# Root npm ci was already complete for this session.
# Install frontend dependencies when absent/out of sync:
npm ci --prefix frontend
```

The scanner native build requires `make`, `g++`, `cmake`, `autoconf`, `libtool`,
`unzip`, and Python with `distutils`. This machine has Python 3.11.15 at
`/home/ubuntu/.pyenv/versions/3.11.15/bin/python3.11`; Python 3.12 failed during
node-gyp with `ModuleNotFoundError: No module named 'distutils'`. The machine also
has `/usr/lib/x86_64-linux-gnu/libssl.so.1.1` for older Mongo binaries.

```sh
npm_config_python=/home/ubuntu/.pyenv/versions/3.11.15/bin/python3.11 \
  npm ci --prefix serverless/virus-scanner
npm --prefix serverless/virus-scanner run build
```

The repository scanner Dockerfile's Debian package downloads returned 404 in this
environment. Instead of modifying it, use the unmodified scanner on the host
against a real ClamAV daemon and AWS Lambda Runtime Interface Emulator.

### Mongo replica set and agency seed

```sh
docker run -d --name fsg-verify-mongo \
  -p 127.0.0.1:27017:27017 mongo:4.4 --replSet rs0 --bind_ip_all
# After mongod is ready:
docker exec fsg-verify-mongo mongo --quiet --eval \
  'rs.initiate({_id:"rs0",members:[{_id:0,host:"localhost:27017"}]})'
docker exec fsg-verify-mongo mongo --quiet --eval 'rs.status().ok'
# The checked-in seed upserts govtech and was agencies.
docker exec -i fsg-verify-mongo mongo < init-mongo.js
```

Use `mongodb://127.0.0.1:27017/formsg?replicaSet=rs0&directConnection=true`.
The seeded `was.gov.sg` agency permits `vite.synthetic@was.gov.sg`; OTP login
creates the synthetic user. Do not seed real user records or use real attachments.

### LocalStack S3 and SQS

```sh
docker run -d --name fsg-verify-localstack \
  -p 127.0.0.1:4566:4566 \
  -e SERVICES=s3,sqs,secretsmanager -e DNS_ADDRESS=0 \
  -e EXTRA_CORS_ALLOWED_ORIGINS=http://localhost:3000 \
  localstack/localstack:3.3
# After LocalStack reports healthy:
for bucket in local-image-bucket local-logo-bucket local-attachment-bucket \
  local-static-assets-bucket local-virus-scanner-quarantine-bucket \
  local-virus-scanner-clean-bucket local-payment-proof-bucket; do
  docker exec fsg-verify-localstack awslocal s3 mb "s3://$bucket"
done
for bucket in local-virus-scanner-quarantine-bucket local-virus-scanner-clean-bucket; do
  docker exec fsg-verify-localstack awslocal s3api put-bucket-versioning \
    --bucket "$bucket" --versioning-configuration Status=Enabled
done
docker exec fsg-verify-localstack awslocal sqs create-queue \
  --region ap-southeast-1 --queue-name local-webhooks-sqs-main
```

Use the region-matched queue URL:
`http://sqs.ap-southeast-1.localhost.localstack.cloud:4566/000000000000/local-webhooks-sqs-main`.
The generic init-localstack script also sets up a webhook DLQ, but the verification
stack only uses the main queue and does not test webhook delivery.

### MailDev and Mockpass

Run each long-lived command in its own process/session:

```sh
node ./node_modules/.bin/maildev --ip 127.0.0.1 --web 1080 --smtp 1025
./node_modules/.bin/mockpass > /tmp/fsg-verification/mockpass.log 2>&1
```

MailDev web UI is `http://localhost:1080`; SMTP is `127.0.0.1:1025`.
Mockpass on `:5156` is needed for backend discovery initialization even when the
test uses only email OTP. MailDev was run from the installed root package, not
the compose MailDev container.

### Real scanner process

```sh
mkdir -p /tmp/fsg-verification/clam
chmod 777 /tmp/fsg-verification/clam
docker run -d --name fsg-verify-clamav \
  -v /tmp/fsg-verification/clam:/tmp -e CLAMAV_NO_FRESHCLAMD=true \
  clamav/clamav:1.4
# Wait for "socket found, clamd started." in container logs.
ln -s /tmp/fsg-verification/clam/clamd.sock /tmp/clamd.ctl
# Development scanner code resolves host.docker.internal; on this host:
# /etc/hosts contains: 127.0.0.1 host.docker.internal
curl -fL https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/aws-lambda-rie \
  -o /tmp/fsg-verification/aws-lambda-rie
chmod +x /tmp/fsg-verification/aws-lambda-rie
cd serverless/virus-scanner
NODE_ENV=development \
VIRUS_SCANNER_QUARANTINE_S3_BUCKET=local-virus-scanner-quarantine-bucket \
VIRUS_SCANNER_CLEAN_S3_BUCKET=local-virus-scanner-clean-bucket \
/tmp/fsg-verification/aws-lambda-rie \
  --runtime-interface-emulator-address 127.0.0.1:9999 \
  ./node_modules/.bin/aws-lambda-ric build/index.handler \
  > /tmp/fsg-verification/scanner.log 2>&1
```

The scanner source uses `http://host.docker.internal:4566` in development and
expects `/tmp/clamd.ctl`. Both scanner buckets must have versioning enabled.
The shared writable socket directory is only for this isolated synthetic local
environment. The image includes signatures; freshclam is disabled for this run.

### Backend environment without repository config changes

Create `/tmp/fsg-verification/backend.cjs` with the following content. It imports
the checked-in test defaults and compose development values (including SDK
signing keys and mock identity-provider credentials) rather than requiring real
secrets. Explicit overrides adapt container hostnames to host processes.

```js
const fs = require('fs')
const root = '/home/ubuntu/fsg-base'
const yaml = require(root + '/node_modules/js-yaml')
const dotenv = require(root + '/node_modules/dotenv')
const { spawn } = require('child_process')
const env = {
  ...process.env,
  ...dotenv.parse(fs.readFileSync(root + '/__tests__/setup/.test-env')),
}
const config = yaml.load(fs.readFileSync(root + '/docker-compose.yml', 'utf8'))
for (const value of config.services.backend.environment) {
  const at = value.indexOf('=')
  if (at !== -1) env[value.slice(0, at)] = value.slice(at + 1)
}
Object.assign(env, {
  NODE_ENV: 'development',
  PORT: '5001',
  DB_HOST:
    'mongodb://127.0.0.1:27017/formsg?replicaSet=rs0&directConnection=true',
  APP_URL: 'http://localhost:5001',
  FE_APP_URL: 'http://localhost:3000',
  SES_HOST: '127.0.0.1',
  SES_PORT: '1025',
  AWS_ENDPOINT: 'http://localhost:4566',
  AWS_REGION: 'ap-southeast-1',
  VIRUS_SCANNER_LAMBDA_ENDPOINT: 'http://localhost:9999',
  WEBHOOK_SQS_URL:
    'http://sqs.ap-southeast-1.localhost.localstack.cloud:4566/000000000000/local-webhooks-sqs-main',
  IS_SP_MAINTENANCE: '',
  IS_CP_MAINTENANCE: '',
  GROWTHBOOK_CLIENT_KEY: 'sdk-local-synthetic',
})
spawn(
  process.execPath,
  ['-r', 'ts-node/register/transpile-only', 'src/app/server.ts'],
  {
    cwd: root,
    env,
    stdio: 'inherit',
  },
).on('exit', (code) => process.exit(code ?? 1))
```

From the repository root:

```sh
node /tmp/fsg-verification/backend.cjs > /tmp/fsg-verification/backend.log 2>&1
```

`GROWTHBOOK_CLIENT_KEY` must be nonempty or backend startup throws `Missing clientKey`.
The synthetic key does not enable remote experiments: product feature defaults
remain unchanged. No Mongo feature-flag records were changed and there is no Vite
migration flag. Storage mode is selected in the form-creation UI, not enabled by a
feature flag. Payments, Turnstile and other integrations are not under test.

### Frontend, Storybook and tests

From the repository root, in separate Node 18.20.2 sessions:

```sh
VITE_APP_URL=http://localhost:3000 VITE_APP_FORMSG_SDK_MODE=development \
  npm --prefix frontend start -- --force
npm --prefix frontend run storybook
npm --prefix frontend test
```

`--force` is important after changing Joyride or other prebundled dependencies.
Vite should report `http://localhost:3000/` with no network host exposed;
`/api` proxies to the backend on `:5001`. Admin login is `/login`, not `/admin`.
The deep-link target is `/admin/form/<formId>/settings`.
Storybook runs on `:6006`. In responses, **Download → CSV only** or **CSV with
attachments** exercises the Vite decryption-worker pool; merely displaying one
response is not equivalent evidence.

Create a small synthetic upload outside the repository and compute `sha256sum`
before upload. Preserve the browser-downloaded key, CSV/ZIP and extracted
attachment. Compare the original and downloaded bytes with `sha256sum`; never
claim attachment integrity from a filename or successful toast alone.
