# Angular Complete Frontend Design

## Objective

Turn the existing static Angular training UI into a complete client for the
BankManagementStarter REST API. The work lives only on
`feature/angular-complete`, is pushed to GitHub without merging into `master`,
and must not trigger a Vercel or VPS deployment.

## Constraints

- Keep Angular standalone components and separate `.ts`, `.html`, and `.css`
  files for every component.
- Use template-driven forms exclusively (`FormsModule`, `ngModel`, template
  references, and native/Angular validation attributes).
- Do not use reactive forms, `FormBuilder`, `FormGroup`, or `FormControl`.
- Do not add or maintain unit tests for this course branch.
- Do not add demo business data or silent fallback data.
- Store the JWT session in `localStorage`, as explicitly accepted for this
  training application.
- Keep the backend and VPS unchanged.
- Add `vercel.json` with `git.deploymentEnabled` set to `false` for exactly
  `feature/angular-complete` before pushing the branch.

## Architecture

The application keeps its current feature-based structure. Components own
view state and call focused injectable services. Services own REST calls and
map server errors into the shared error model. A functional HTTP interceptor
attaches the bearer token and clears an expired or rejected session after a
401 response.

The session service persists the complete authenticated user response, restores
it on application startup, exposes the current user and normalized role as
signals, and provides role-aware navigation. Guards use that session rather
than local demonstration credentials.

Components use explicit `loading`, `submitting`, `error`, and success state.
Lists reload after successful mutations. Forms never invent records when the
API is unavailable.

## Authentication and Authorization

- Login posts the email and password to `POST /api/Auth/login`.
- The response token and user information are persisted in `localStorage`.
- Admin users are routed to `/dashboard/admin`; agents are routed to
  `/dashboard/agent`.
- The auth guard rejects missing sessions.
- The guest guard redirects authenticated users to their dashboard.
- The role guard compares roles case-insensitively and redirects unauthorized
  users to their own dashboard.
- Logout clears all local session state and returns to `/login`.
- HTTP 401 clears the session. HTTP 403 keeps the session and shows an
  authorization message.
- The agent creation form uses the canonical `POST /api/Auth/agents` route.

## Features

### Dashboards

Admin and agent dashboards load real collections and calculate counts and
summaries from the API. If a collection cannot be loaded, the dashboard shows
the error instead of a fabricated metric.

### Clients

- List and search clients.
- View client details and associated account summaries.
- Create and edit clients with template-driven validation.
- Delete a client after explicit confirmation.
- Refresh or navigate to the appropriate view after each mutation.

### Accounts

- List accounts and view an account with its transaction history.
- Create an account by selecting a real client and account type.
- Edit the fields supported by the backend update contract.
- No delete action is shown because the backend has no account delete route.

### Branch Offices

- List and view branch offices for authenticated users.
- Admin-only create, edit, and delete actions.
- Agent navigation does not expose mutations rejected by the backend.

### Account Types

- List and view account types for authenticated users.
- Admin-only create, edit, and delete actions.

### Agents

- Admin-only agent creation.
- The form collects every field required by `CreateAgentDto`, including branch
  assignment where applicable.
- No agent list, edit, or delete feature is invented because the backend does
  not expose those endpoints.

### Transactions

- Deposit, withdrawal, and transfer forms use the exact backend DTO fields.
- Account selectors are populated from the account API.
- Amounts must be positive before submission.
- Transfer prevents choosing the same source and destination account.
- Transaction history loads through
  `GET /api/Transactions/compte/{compteId}`.
- Successful operations clear the form and refresh affected history/balances.

### Profile

The profile displays authenticated user information from the persisted login
response. It is read-only because the backend has no profile update endpoint.

## Routing and Navigation

The existing Admin and Agent shells remain lazy-loaded. Admin-only routes stay
under the Admin shell. Shared routes remain available to both roles. Missing
entity identifiers show a not-found state, and invalid URLs redirect to the
appropriate authenticated dashboard or login page.

The account edit route will be added because the backend supports
`PUT /api/Comptes/{id}`. Links and breadcrumbs will use role-relative base
paths so that agent navigation never jumps into the Admin shell.

## Form Behavior

Every form uses `NgForm` and template validation. Submit buttons remain
disabled while invalid or submitting. Required, length, email, numeric range,
and cross-field errors are shown only after the relevant field is touched or a
submission is attempted. Server validation messages appear in a form-level
error area and do not erase user input.

Date values are converted explicitly between HTML date strings and the API's
ISO representation. Optional text values are trimmed and sent as `null` or
omitted according to the backend contract.

## Error and Loading States

- Shared loading, empty, and error components are reused.
- Network failures produce a connectivity message.
- Backend validation payloads are flattened into readable messages.
- 404 responses produce entity-specific not-found states.
- Destructive actions require the existing confirmation dialog.
- Duplicate submissions are prevented with a `submitting` flag.

## API Contract Boundary

TypeScript models mirror the backend DTOs and distinguish read models from
create/update payloads. The frontend implements only routes present in the
backend Swagger contract:

- `/api/Auth/login`, `/api/Auth/agents`
- `/api/Clients` and `/api/Clients/search`
- `/api/Comptes`
- `/api/Guichets`
- `/api/TypesComptes`
- `/api/Transactions/compte/{id}` and transaction operation routes
- `/api/Health`

## Verification

Unit tests are intentionally excluded at the user's request for this course.
Verification consists of:

1. strict Angular compilation and a production build;
2. a clean TypeScript/template diagnostic result;
3. local navigation checks for every Admin and Agent route;
4. authenticated smoke tests against the HTTPS VPS API;
5. non-destructive CRUD validation, plus controlled create/update/delete flows
   whose temporary records are removed afterward where the API supports it;
6. browser console and network checks with no uncaught errors or unexpected
   5xx responses;
7. confirmation that GitHub contains only the feature branch commit and that
   Vercel created no deployment for it.

## Delivery

The completed work is committed and pushed to
`origin/feature/angular-complete`. `master` remains unchanged. No backend
repository, Docker container, database schema, or VPS process is modified.
