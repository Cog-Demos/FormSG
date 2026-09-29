# Architecture

This article aims to give the reader an overview of FormSG's architecture,
relative to external systems and in terms of how the codebase is organised

## Overview

FormSG runs on Amazon Web Services and is built on top of express.js and ReactJS.
It relies on MongoDB Atlas and AWS EFS for storage, AWS SES to dispatch e-mails and
is deployed on Docker containers running on top of Elastic Beanstalk. Optionally, FormSG
can also talk to Government-hosted systems - SingPass/CorpPass/MyInfo to retrieve form-filler
identities, and E-mail servers hosted in Government Data Centres.

## Backend

The backend for FormSG is bootstrapped using `src/app/server.ts` and `src/app/loaders`.
It sets up express.js routes defined in `src/app/**/*.routes.ts`, with business logic
defined in `src/app/**/*.controller.ts` and mongoose models defined in `src/app/**/*.model.ts`.

### Security

The following is a non-exhaustive list of measures and notable points relating
to security on FormSG.

#### Measures

- One-time passwords (OTPs) are sent to user, then hashed and stored on
  the corresponding user record for verification when user submits OTP

- Login sessions for public servants using OTPs are maintained
  using session cookies

- There are two types of forms: email mode and storage mode. In email mode,
  all form submissions are routed directly to specified e-mail recipients. In
  storage mode, submissions are encrypted end-to-end.

- SingPass/CorpPass-related security certificates and corresponding private
  keys are held in EFS, encrypted at rest with AWS' master key

- Communications with SingPass/CorpPass/MyInfo are signed with digital
  signatures both ways, with SingPass/CorpPass payloads encrypted using
  FormSG's public key

- Login sessions for form-fillers using SingPass/CorpPass
  are maintained using session cookies

#### Authorization

- Management of forms is restricted to form creators. In storage mode, form creators
  can add other public servants as form editors. In email mode, form creators can
  specify a whitelist of email addresses which will receive all form responses.

#### Notable Points

- One-way hashes of form submissions stored on MongoDB.

- E-mail recipients are determined by `emails` values in `FormSchema` mongoose
  model, and the values of all e-mail fields if the form is set to send autoreplies.

- Secrets are injected using environment variables.

## Frontend

The frontend is written in React and can be found in `frontend/src`.

The index file is located at `frontend/index.html` and the entry point is
`frontend/src/index.tsx`. Static assets that are copied verbatim into the build
live in `frontend/public`.

The frontend is built with [Vite](https://vitejs.dev/) (`frontend/vite.config.ts`,
with production build options in `frontend/vite.build.ts`). `npm run build:frontend`
writes the bundle to `dist/frontend`, which the backend serves. The Datadog RUM
initialisation (`frontend/datadog-chunk.ts`) is emitted as a separate script that
is loaded in `<head>` before the app, and no inline scripts are emitted, as the
CSP forbids them. Build-time variables are read from `import.meta.env` and must be
prefixed with `VITE_APP_`.

In development, `npm run dev:frontend` starts the Vite dev server on port 3000 and
proxies `/api` to the backend on port 5001.

Unit tests run with [Vitest](https://vitest.dev/) (`frontend/vitest.config.ts`) and
components are documented in [Storybook 8](https://storybook.js.org/)
(`frontend/.storybook`).
