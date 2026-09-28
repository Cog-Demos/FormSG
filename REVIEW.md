# Devin Review Guidelines — Secure Code Review (GovTech SCR)

This repository is reviewed against the **GovTech Secure Code Review Guideline**:
https://docs.developer.tech.gov.sg/docs/secure-code-review-guidelines

FormSG is a Singapore public-sector form platform handling NRIC/UIN/FIN, Singpass/Corppass/MyInfo/sgID identity data, and end-to-end encrypted submissions. Apply the guideline with that data-sensitivity context in mind.

## Scope of findings (strict)

- **Only raise findings that map to a checklist item or vulnerability type in the guideline sections below.** Do not raise findings for style, performance, naming, test coverage, general refactors, or security topics not covered by the guideline.
- If an issue does not clearly violate a listed item, do not report it.
- Review only code introduced or modified by the PR, plus existing code the change directly relies on for the security property in question.

## Finding format (required)

Every finding must cite the guideline section and the specific item it violates, using the IDs below:

```
[SCR <ID>] <Section> — <checklist item or vulnerability type>
Severity: Critical | High | Medium | Low
Location: <file>:<line(s)>
Issue: <what the code does and why it violates the item>
Exploit scenario: <concrete attacker path in FormSG terms>
Fix: <minimal remediation, preferring existing FormSG utilities>
Reference: https://docs.developer.tech.gov.sg/docs/secure-code-review-guidelines
```

Example title: `[SCR AUTHZ-1] Authorization — Insecure direct object reference: formId used without permission check`

Severity guidance: **Critical** = unauthenticated access to submissions/NRIC/secrets or auth bypass; **High** = authenticated privilege escalation, cross-form/cross-user data access, injection; **Medium** = information leakage, missing rate limit on sensitive endpoint, sensitive data in logs; **Low** = defence-in-depth gaps against a listed checklist item.

---

## 1. Authentication (AUTHN)

Guideline: mistakes in authentication code allow unintended access to protected data and functions.

| ID | Item |
|----|------|
| AUTHN-1 | Ensure secure password policy is enforced. |
| AUTHN-2 | Ensure temporary account lockouts and rate-limiting are adopted to prevent brute-force attacks. |
| AUTHN-V1 | Vulnerability: brute-force password / credential guessing. |
| AUTHN-V2 | Vulnerability: flawed two-factor / multi-step verification logic (a later step trusts client-controlled identity from an earlier step). |

FormSG focus:
- Admin login is email OTP (`src/app/modules/auth/`, `src/app/routes/api/v3/auth/`). OTP send/verify endpoints must remain behind `limitRate` (`src/app/utils/limit-rate.ts`) and enforce max attempts / expiry (AUTHN-2, AUTHN-V1).
- Form field verification (`src/app/modules/verification/`) — OTP attempts, resend throttling and transaction expiry must be enforced server-side (AUTHN-2).
- Singpass/Corppass/sgID/MyInfo callbacks (`src/app/modules/spcp/`, `src/app/modules/sgid/`, `src/app/modules/myinfo/`): the identity used after the callback must come from verified tokens/JWTs, never from a client-supplied cookie, query or body value (AUTHN-V2).
- API key auth (`authenticateApiKey` in `src/app/modules/auth/auth.middlewares.ts`) and cron/secret-based auth must not be bypassable, and keys must be compared via hash (AUTHN-V2).

## 2. Authorization (AUTHZ)

Guideline: improper authorization allows users to perform unwanted actions on otherwise protected resources.

| ID | Item |
|----|------|
| AUTHZ-1 | Ensure all locations where user input is used to reference objects directly are equipped with authorisation checks (IDOR). |
| AUTHZ-2 | Ensure least privilege principle is adopted. |
| AUTHZ-3 | For functions with higher risk, multiple levels of authorization checks can be considered. |
| AUTHZ-V1 | Vulnerability: insecure direct object reference. |
| AUTHZ-V2 | Vulnerability: missing function-level access control (check only in UI/frontend). |

FormSG focus:
- Any route taking `formId`, `submissionId`, `workspaceId`, `userId`, etc. must verify ownership/collaborator permission server-side (e.g. `getFormAfterPermissionChecks` with the correct `PermissionLevel`), not just authentication (AUTHZ-1, AUTHZ-V1).
- New admin routes must be mounted behind `withUserAuthentication` / `authenticateApiKeyAndPlatform`; frontend-only gating is a violation (AUTHZ-V2).
- Read vs write vs delete must use the least permission level needed; destructive/ownership-transfer/collaborator/billing/payment/webhook actions warrant `Delete`/owner checks (AUTHZ-2, AUTHZ-3).
- Public form endpoints must not expose private/admin fields or other respondents' data; MRF/pending-submission flows must bind the submission to the intended respondent (AUTHZ-1).

## 3. Business Logic & Design (BIZ)

Guideline: flaws in the design and implementation of business logic can lead to unintended behaviour.

| ID | Item |
|----|------|
| BIZ-1 | Ensure all business logic and data flows are clear and aligned with business requirements. |
| BIZ-2 | Make use of validation functions to limit value ranges and input options to values that make sense for the business context. |
| BIZ-V1 | Vulnerability: lack of bounds checking. |
| BIZ-V2 | Vulnerability: business logic errors (e.g. stacking/bypassing rules not intended by requirements). |

FormSG focus:
- Payments (`src/app/modules/payments/`, Stripe): amounts, quantities and product selections must be validated server-side against the form definition; never trust client-sent price (BIZ-2, BIZ-V1).
- Submission validation (`src/app/utils/field-validation/`): field constraints (min/max, length, options, attachments size/type, table rows) and logic (hidden/required fields, form logic) must be enforced server-side (BIZ-2, BIZ-V1).
- Form state (closed/private forms, submission limits, auth type, MRF step order, workflow approvals) must not be bypassable by crafted requests (BIZ-V2).

## 4. Data Management (DATA)

Guideline: sensitive data such as IC numbers deserve extra protection, including encryption at rest and in transit.

| ID | Item |
|----|------|
| DATA-1 | Ensure updated encryption algorithms are used. |
| DATA-2 | Ensure SSL/TLS is used for protecting data in transit. |
| DATA-3 | Ensure the use of secret management tools, with controlled access, to store sensitive data such as credentials and keys. |
| DATA-V1 | Vulnerability: weak cryptography (outdated algorithms, e.g. DES, MD5/SHA-1 for security, insecure randomness for secrets). |
| DATA-V2 | Vulnerability: hardcoded secrets (DB creds, API keys, encryption keys, tokens). |

FormSG focus:
- Storage-mode encryption uses `@opengovsg/formsg-sdk` / tweetnacl; do not introduce alternative or weaker primitives, or decrypt submissions server-side (DATA-1, DATA-V1).
- Hashing of OTPs/API keys must use `bcrypt` via `src/app/utils/hash.ts`; tokens/OTPs must use crypto-secure randomness (DATA-V1).
- Secrets must come from `src/app/config/` (convict/env/AWS Secrets Manager), never literals in code, tests fixtures that look real, Dockerfiles, or `.template-env` (DATA-3, DATA-V2).
- Outbound calls (webhooks, MyInfo, SPCP, Twilio, Postman, S3) must use HTTPS; session cookies must keep `secure: true` outside dev/test (DATA-2).
- NRIC/UIN/FIN and MyInfo attributes must not be persisted or returned in plaintext beyond what the existing design requires (DATA).

## 5. Exception Handling (EXC)

Guideline: improper exception handling can lead to leaking of valuable system information.

| ID | Item |
|----|------|
| EXC-1 | Ensure code artefacts from the debugging process have been removed and logging levels are set appropriately. |
| EXC-2 | Ensure all exits from a function, including exceptions, are covered. |
| EXC-3 | Ensure the program fails gracefully, preferably displaying a generic error page for all exceptions. |
| EXC-V1 | Vulnerability: revealing internal error messages (stack traces, DB dumps, error codes, software/versions). |
| EXC-V2 | Vulnerability: insecure state due to exception (resources not released, sessions not terminated, processing continues after failure). |

FormSG focus:
- Controllers must map errors to generic client messages (existing `mapRouteError` patterns / `src/app/loaders/express/error-handler.ts`); do not return `err.message`, Mongo errors, or stack traces to clients (EXC-V1, EXC-3).
- `neverthrow` `Result`/`ResultAsync` chains must handle every error branch; unhandled promise rejections or ignored `.isErr()` paths are violations (EXC-2).
- A failed step (e.g. payment, verification, encryption, S3 upload, webhook) must not lead to a submission being accepted or state being left partially written (EXC-V2).
- Remove `console.log`, debug endpoints, and verbose debug logging (EXC-1).

## 6. Injection Attack (INJ)

Guideline: injection allows a malicious user to add content into an application to modify its behaviour.

| ID | Item |
|----|------|
| INJ-1 | Ensure all input is validated for expected length and data type and encoded/sanitized of special characters. |
| INJ-2 | Ensure input validation is done on the server side. |
| INJ-V1 | Vulnerability: injection into queries (SQL / NoSQL) and other interpreters. |

FormSG focus:
- MongoDB/Mongoose: user input must not reach query objects un-typed (operator injection like `{ "$ne": null }`), `$where`, or unescaped `$regex`; validate with `celebrate`/Joi on every new route (INJ-1, INJ-2, INJ-V1).
- HTML/email/PDF generation (autoreply, email-mode submissions, `convert-html-to-pdf.ts`): user-supplied values must be escaped/sanitized before rendering (INJ-1).
- Frontend: `dangerouslySetInnerHTML` or markdown rendering of form content must be sanitized (INJ-1).
- Frontend validation alone is never sufficient (INJ-2).

## 7. Logging (LOG)

Guideline: developers should mitigate common unintended behaviours arising from application logs.

| ID | Item |
|----|------|
| LOG-1 | Ensure logs are stored in restricted locations. |
| LOG-2 | Ensure log masking is used for sensitive data. |
| LOG-3 | Ensure no user-invoked functions generate excessive logs. |
| LOG-V1 | Vulnerability: sensitive data exposure in logs (NRIC, credentials, tokens). |
| LOG-V2 | Vulnerability: denial of service via excessive logging. |
| LOG-V3 | Vulnerability: log injection / forging from unsanitized user input. |

FormSG focus:
- Use `createLoggerWithLabel` (`src/app/config/logger.ts`) with structured `meta` objects, not string concatenation of user input (LOG-V3).
- Never log NRIC/UIN/FIN, MyInfo attributes, OTPs, session IDs, API keys, JWTs, passwords, decrypted submission content, or full request bodies/headers; mask where identifiers are needed (LOG-2, LOG-V1).
- Public, unauthenticated endpoints must not log per-request at high volume or log unbounded payloads (LOG-3, LOG-V2).

## 8. Session Management (SESS)

Guideline: improper session management can lead to impersonation and access to privileged data or functions.

| ID | Item |
|----|------|
| SESS-1 | Ensure session IDs are placed in cookies, and these cookies are HTTP-Only. |
| SESS-2 | Ensure session IDs are generated by a cryptographically secure function and cannot be guessed. |
| SESS-3 | Ensure a new session ID is generated whenever a session is elevated and session data is flushed when de-elevated. |
| SESS-V1 | Vulnerability: session hijacking (session ID in URL, no auth checks on session lookup). |
| SESS-V2 | Vulnerability: session elevation / fixation (session ID reused across login). |

FormSG focus:
- Admin sessions (`src/app/loaders/express/session.ts`, `cookieSettings` in `src/app/config/config.ts`): changes must keep `httpOnly`, `secure` (non-dev), `sameSite: 'strict'`, and bounded `maxAge` (SESS-1).
- Login must call `req.session.regenerate` before setting the user; logout must `destroy` the session and clear the cookie (SESS-3, SESS-V2).
- Singpass/Corppass/sgID JWT cookies must be HTTP-only, signed, scoped, and short-lived; never pass session tokens or JWTs in URLs/query strings (SESS-1, SESS-V1).
- Custom tokens (e.g. verification transaction IDs, MRF/pending submission links) used as bearer credentials must be unguessable (SESS-2).

---

## Out of scope — do not report

- Issues not mapped to an ID above (style, performance, typing, naming, test coverage, dependency version bumps, general best practices).
- Generated/vendored files: `package-lock.json`, `frontend/package-lock.json`, `shared/package-lock.json`, `CHANGELOG.md`, `credits-patch`, build output.
- Test files (`__tests__/`, `*.spec.ts`, `*.test.ts`), unless they contain real hardcoded secrets (DATA-V2).
