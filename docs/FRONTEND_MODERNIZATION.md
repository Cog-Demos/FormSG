# Frontend modernization: Vite + Storybook 8 + Vitest + React 18 + Chakra v2 + TS5

Epic: [MBA-2939](https://cog-gtm.atlassian.net/browse/MBA-2939) · suffix `vite-20260929-2350` · base branch `feature/vite-20260929-2350-base`

## Baseline (TICKET-0, `develop` @ `61afcde4d`, before any change)

Measured on Ubuntu 22.04, 8 vCPU / 31 GB, Node `v18.20.2` (from `.nvmrc`), npm `10.5.0`.

| Check | Command | Result | Time |
| --- | --- | --- | --- |
| Frontend Jest | `cd frontend && CI=true npm test -- --watchAll=false` | pass — 25 suites, 182 tests | 55 s |
| Backend Jest | `npm run test:backend:ci` | pass — 153 suites, 2910 tests (+1 todo) | 4 m 56 s |
| `serverless/virus-scanner` | `cd serverless/virus-scanner && npx tsc --noEmit` | pass (package has no test script) | 2 s |
| Full build | `NODE_OPTIONS='--max-old-space-size=4096 --openssl-legacy-provider' npm run build` | pass — `dist/frontend` with separate `datadog-chunk.*.js` and `decryption.worker.*.js`, no inline scripts | 2 m 19 s |
| Storybook build | `cd frontend && npm run build-storybook` | pass | 1 m 59 s |
| Frontend lint | `npm run lint:frontend` | pass — 0 errors, 34 warnings | 27 s |
| Backend lint | `npm run lint-ci` | pass | 46 s |
| Backend `tsc` (build) | `npx tsc --noEmit -p tsconfig.build.json` | pass | — |
| Backend `tsc` (incl. tests) | `npx tsc --noEmit -p tsconfig.json` | fail — 74 errors (test files, `frontend/node_modules`, `~shared` alias) | — |
| Frontend `tsc` | `cd frontend && npx tsc --noEmit` | fail — 206 errors, all in `../shared/node_modules` (`type-fest` 4 / `@types/lodash` need TS ≥ 5) | — |

Every row must match or beat this after each ticket. The two `tsc` rows that fail at baseline are expected to become passes (frontend) or stay no worse (backend including tests).

## Machine setup

The baseline and the migrated stack need the following on a fresh Ubuntu 22.04 machine:

```bash
# Node from .nvmrc
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.nvm/nvm.sh && nvm install "$(cat .nvmrc)" && nvm use "$(cat .nvmrc)"

# Native build tools for node-gyp / sharp / mongodb-memory-server deps
sudo apt-get update && sudo apt-get install -y build-essential g++ make cmake autoconf automake libtool python3-setuptools

# libssl1.1 — required by the mongodb-memory-server binary used in backend Jest
wget -O /tmp/libssl1.1.deb http://security.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2.24_amd64.deb
echo "7cf39d70a639017d1dd7c8d36daa2258063608688e449fddf40ffdd46f992a78  /tmp/libssl1.1.deb" | sha256sum -c -
sudo dpkg -i /tmp/libssl1.1.deb

# Dependencies
npm ci                                   # root (runs frontend + shared installs via postinstall)
# aws-lambda-ric's node-gyp needs distutils; point it at a Python that has it (e.g. system 3.10 +
# python3-setuptools) when the default python3 is ≥ 3.12
(cd serverless/virus-scanner && npm_config_python=/usr/bin/python3 npm ci)
```

## Dependency foundation (TICKET-0)

This is the only `frontend/package.json` / `frontend/package-lock.json` change in the epic; Phase 1 tickets must not touch either (request changes in Jira; TICKET-G applies them).

- Removed: `react-scripts`, `@craco/craco`, `craco-alias`, `worker-loader`, `env-cmd`, `@storybook/addon-storyshots(-puppeteer)`, `puppeteer`, `@storybook/preset-create-react-app`, `storybook-preset-craco`, `storybook-addon-turbo-build`, `@storybook/jest`, `@storybook/testing-library`, `@storybook/testing-react`, `@storybook/node-logger`, `ts-jest`, `@types/jest`, `react-beautiful-dnd` (+ types), `html-webpack-plugin`, `http-proxy-middleware`, `react-refresh`, `@types/storybook-react-router`, the CRA `proxy` field and the `react-error-overlay` override.
- Added / upgraded: `vite` 5.4, `@vitejs/plugin-react` 4, `vite-tsconfig-paths` 4, `vite-plugin-svgr` 4, `vite-plugin-node-polyfills` 0.22 (`@opengovsg/formsg-sdk` requires `crypto`/`stream`/`util`/`events`, which Webpack 4 polyfilled implicitly), `vitest` 2.1 + `jsdom` 24, Storybook 8.6 (`storybook`, `@storybook/react-vite`, `@storybook/test`, `@storybook/blocks`, `@storybook/manager-api`, addons), `msw-storybook-addon` 1.10 (keeps `msw` 0.36), `storybook-react-i18next` 3, `eslint-plugin-storybook` 0.8, React / React DOM 18.3, `@types/react(-dom)` 18.3, `@chakra-ui/react` ~2.8.2 + `@chakra-ui/cli` 2, `framer-motion` 10, `typescript` ~5.4.5, `@testing-library/react` 16 / `dom` 10 / `jest-dom` 6 / `user-event` 14.6, `@hello-pangea/dnd` 16 (API-compatible `react-beautiful-dnd` fork).
- Bumped within their majors so their peer ranges include React 18: `dayzed`, `react-hook-form` (7.29), `react-joyride`, `react-query` (3.39), `react-table` (7.8), `react-textarea-autosize`, `react-use`, `react-waypoint`. `react-wordcloud` has no React 18 release; `legacy-peer-deps` in `frontend/.npmrc` already covers it.
- `patches/@chakra-ui+form-control+1.6.0.patch` → `patches/@chakra-ui+form-control+2.2.0.patch` (same change: don't forward native `required`).
- `gen:theme-typings` now passes `--out node_modules/@chakra-ui/styled-system/dist/theming.types.d.ts` (the CLI's default lookup path does not exist in styled-system 2.9) and no longer swallows failures with `|| true`.
- Scripts: `start` → `vite`, `build` → `vite build`, `preview`, `test` → `vitest run`, `test:watch`, `storybook` → `storybook dev -p 6006`, `build-storybook` → `storybook build`; `eject`, `build:dd-chunk`, `test:a11y*` removed.
- `npm ci` in `frontend/` completes with no manual steps (patch applies, theme typings generate).

## Env-var rename plan

Vite exposes only prefixed vars on `import.meta.env`; the prefix becomes `VITE_APP_` (configure `envPrefix` if needed).

| Old (CRA) | New (Vite) | Read in | Set in |
| --- | --- | --- | --- |
| `REACT_APP_VERSION` | `VITE_APP_VERSION` | `App.tsx`, `index.tsx`, `lazyRetry.ts`, `datadog-chunk.ts` | `.buildtime-env` → `vite.config.ts` `define`/env from `npm_package_version` |
| `REACT_APP_URL` | `VITE_APP_URL` | `AppHelmet.tsx`, `index.html` | `ci.yml`, `deploy-eb.yml`, `Dockerfile.production` |
| `REACT_APP_BASE_URL` | `VITE_APP_BASE_URL` | `ApiService.ts` | deploy |
| `REACT_APP_GA_TRACKING_ID` | `VITE_APP_GA_TRACKING_ID` | `AppHelmet.tsx`, `index.html` | `.buildtime-env`, deploy |
| `REACT_APP_FORMSG_SDK_MODE` | `VITE_APP_FORMSG_SDK_MODE` | `formSdk.ts` | `.buildtime-env`, deploy |
| `REACT_APP_DD_RUM_APP_ID` | `VITE_APP_DD_RUM_APP_ID` | `datadog-chunk.ts` | deploy |
| `REACT_APP_DD_RUM_CLIENT_TOKEN` | `VITE_APP_DD_RUM_CLIENT_TOKEN` | `datadog-chunk.ts` | deploy |
| `REACT_APP_DD_RUM_ENV` | `VITE_APP_DD_RUM_ENV` | `datadog-chunk.ts`, `growthbook.ts` | deploy |
| `REACT_APP_DD_SAMPLE_RATE` | `VITE_APP_DD_SAMPLE_RATE` | `datadog-chunk.ts` | deploy |

`process.env.NODE_ENV` checks (analytics / GrowthBook init) stay as they are; Vite defines `process.env.NODE_ENV`.

## Phase 1 file ownership

| Ticket | Branch | Owns |
| --- | --- | --- |
| A — Vite build ([MBA-2941](https://cog-gtm.atlassian.net/browse/MBA-2941)) | `feature/vite-20260929-2350-a-vite-build` | `frontend/vite.config.ts` (except `build`), `frontend/index.html` (moved from `public/`), `vite-env.d.ts`, `tsconfig*.json`, `REACT_APP_*` reads in `frontend/src`, worker import in `StorageResponsesService.ts`, SVG imports; deletes `craco.config.js`, `setupProxy.js`, `react-app-env.d.ts`, `.buildtime-env`, `tsconfig.paths.json` |
| B — Datadog + deploy ([MBA-2942](https://cog-gtm.atlassian.net/browse/MBA-2942)) | `feature/vite-20260929-2350-b-datadog-deploy` | `build` section of `vite.config.ts`, `datadog-chunk.ts`, `webpack.dd.config.js`, `tsconfig.dd.json`, `.github/`, `Dockerfile.production`, `Dockerfile.development`, README `NODE_OPTIONS` note, `docs/DEPLOYMENT_SETUP.md` |
| C — Storybook 8 ([MBA-2943](https://cog-gtm.atlassian.net/browse/MBA-2943)) | `feature/vite-20260929-2350-c-storybook8` | `frontend/.storybook/`, `*.stories.*`, `*.mdx`, `frontend/__tests__/storyshots/` (delete) |
| D — Vitest ([MBA-2944](https://cog-gtm.atlassian.net/browse/MBA-2944)) | `feature/vite-20260929-2350-d-vitest` | `frontend/vitest.config.ts`, `frontend/src/vitest.setup.ts`, `setupTests.ts` + `jest.config.js` (delete), `*.test.*` |
| E — React 18 + Chakra v2 ([MBA-2945](https://cog-gtm.atlassian.net/browse/MBA-2945)) | `feature/vite-20260929-2350-e-react18-chakra2` | `frontend/src/**` app code excluding `*.test.*`, `*.stories.*` and the files A owns lines in (A edits only env reads / imports; E fixes types) |
| F — Shared TS5 ([MBA-2946](https://cog-gtm.atlassian.net/browse/MBA-2946)) | `feature/vite-20260929-2350-f-shared-ts5` | `shared/**` (not `shared/package*.json`), `src/**` backend consumers and `__tests__` fixtures |
| G — Consolidation ([MBA-2947](https://cog-gtm.atlassian.net/browse/MBA-2947)) | `feature/vite-20260929-2350-base` → PR to `develop` | everything, driven by CI and Review |

Only TICKET-0 and TICKET-G change `package.json` / lockfiles.

## Local verification setup

All data below is synthetic. Services run as containers on the host network ports FormSG expects; backend and Vite run natively on Node from `.nvmrc`.

```bash
# 1. Containers
# Submission reads use read: 'secondary' (src/app/models/submission.server.model.ts), so the replica set
# needs a secondary: with a primary only, Results times out (MongooseServerSelectionError, HTTP 500).
# Both members advertise the docker0 gateway so the host and the containers can reach them.
docker run -d --name fsg-mongo -p 27017:27017 mongo:4.4 --replSet rs0 --bind_ip_all
docker run -d --name fsg-mongo-secondary --network host mongo:4.4 --replSet rs0 --port 27018 --bind_ip_all
docker exec fsg-mongo mongo --quiet --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"172.17.0.1:27017"},{_id:1,host:"172.17.0.1:27018",priority:0}]})'
docker exec -i fsg-mongo mongo --quiet < init-mongo.js          # seeds agencies (open.gov.sg etc.)
docker run -d --name fsg-maildev -p 1080:1080 -p 1025:1025 maildev/maildev
docker run -d --name fsg-localstack -p 4566:4566 -e SERVICES=s3,sqs,secretsmanager \
  -e EXTRA_CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5001 localstack/localstack:3.3
for b in local-image-bucket local-logo-bucket local-attachment-bucket local-static-assets-bucket \
         local-payment-proof-bucket local-virus-scanner-quarantine-bucket local-virus-scanner-clean-bucket; do
  docker exec fsg-localstack awslocal s3 mb s3://$b; done
for b in local-virus-scanner-quarantine-bucket local-virus-scanner-clean-bucket; do
  docker exec fsg-localstack awslocal s3api put-bucket-versioning --bucket $b --versioning-configuration Status=Enabled; done
docker exec fsg-localstack awslocal sqs create-queue --queue-name local-webhooks-sqs-main

# 2. Virus scanner (lambda RIE on :9999)
#    bitnami/mongodb:4.4 is no longer on Docker Hub (hence mongo:4.4 above).
#    Debian bullseye-security now 404s and ClamAV's CDN blocks the EOL freshclam in node:16-bullseye,
#    so build from an out-of-repo copy of the Dockerfile that drops bullseye-security and copies
#    signatures from clamav/clamav:stable instead of running freshclam:
sed -e '0,/^RUN apt-get update/s##RUN sed -i "/debian-security/d" /etc/apt/sources.list \&\& apt-get update#' \
    -e 's#^RUN freshclam#COPY --from=clamav/clamav:stable /var/lib/clamav/ /var/lib/clamav/#' \
    serverless/virus-scanner/Dockerfile > /tmp/vs.Dockerfile
docker build --build-arg IS_LAMBDA=false -f /tmp/vs.Dockerfile -t formsg-virus-scanner:dev serverless/virus-scanner
sed "s/'//g" serverless/virus-scanner/.env.development > /tmp/virus-scanner.env   # docker --env-file keeps quotes
docker run -d --name fsg-virus-scanner -p 9999:8080 --add-host host.docker.internal:host-gateway \
  --env-file /tmp/virus-scanner.env formsg-virus-scanner:dev

# 3. Backend on :5001 — env = docker-compose.yml `backend.environment` with these overrides
#    DB_HOST=mongodb://localhost:27017/formsg?replicaSet=rs0  SES_HOST=localhost  PORT=5001
#    AWS_ENDPOINT=http://localhost:4566  AWS_REGION=us-east-1  VIRUS_SCANNER_LAMBDA_ENDPOINT=http://localhost:9999
#    WEBHOOK_SQS_URL=http://localhost:4566/000000000000/local-webhooks-sqs-main
#    GROWTHBOOK_CLIENT_KEY=sdk-localdev-synthetic   (any non-empty value; backend throws "Missing clientKey" otherwise)
DOTENV_CONFIG_PATH=/path/to/backend.env npx tsnd --respawn --transpile-only --exit-child -r dotenv/config -- src/app/server.ts

# 4. Frontend on :3000
npm run dev:frontend        # vite

# Admin login: any address on a seeded agency domain, e.g. e2e.admin@open.gov.sg; OTP at http://localhost:1080 (JSON: GET http://localhost:1080/api/email)
```
