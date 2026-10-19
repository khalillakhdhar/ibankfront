# Complete Angular Banking Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a complete template-driven Angular client for every supported BankManagementStarter workflow on an isolated, non-deploying Git branch.

**Architecture:** Keep the existing standalone feature components and signal-based REST services. Replace local demonstration authentication and static screens with a persisted JWT session, a functional interceptor, role-aware routing, and component-owned template-driven form state.

**Tech Stack:** Angular 21 standalone components, TypeScript 5.9 strict mode, Angular template-driven forms, RxJS 7.8, Bootstrap 5.3, ASP.NET Core REST API.

**Spec:** `docs/superpowers/specs/2026-10-14-angular-complete-design.md`

## Global Constraints

- Work only on `feature/angular-complete`; never merge into `master`.
- Do not change `BankManagementStarter`, its database, Docker services, or VPS deployment.
- Keep separate `.ts`, `.html`, and `.css` files for every component.
- Use `FormsModule`, `NgForm`, and `ngModel` exclusively; no reactive forms APIs.
- Remove unit-test files and test-only dependencies because tests are excluded from this course branch.
- Use no demo business data or fallback records.
- Store the complete JWT session under `ibank.session` in `localStorage`.
- Exclude exactly `feature/angular-complete` from Vercel automatic deployments before the first push.
- Verify each task with compilation/build or a documented HTTP/browser smoke check instead of unit tests.

## Review Focus

- Corrupt, incomplete, or expired local sessions must clear safely and redirect to login.
- API validation errors with `message`, `errors`, or no JSON body must remain readable and never crash a form.
- Optional empty strings must become `null`; numeric `ngModel` values must reach the API as numbers.
- Agent navigation must never expose Admin mutations; direct Admin URLs must redirect to the Agent dashboard.
- Repeated submits and stale async responses must not duplicate mutations or overwrite the current view.

---

### Task 1: Non-deploying branch and course cleanup

**Files:**

- Create: `vercel.json`
- Modify: `package.json`
- Modify: `angular.json`
- Delete: every `src/**/*.spec.ts`

**Interfaces:**

- Produces: repository policy preventing Vercel deployments from `feature/angular-complete`; production-only Angular dependency graph.

- [ ] Add `vercel.json` using `$schema: https://openapi.vercel.sh/vercel.json` and `git.deploymentEnabled.feature/angular-complete: false`.
- [ ] Remove the `test` script, Vitest/jsdom dependencies, Angular test target, and all `.spec.ts` files without altering runtime dependencies.
- [ ] Run `npm install` to update `package-lock.json`.
- [ ] Run `npm run build`; require exit code 0.
- [ ] Commit as `chore: prepare non-deploying Angular course branch`.

### Task 2: Session, authentication, interceptor, and guards

**Files:**

- Modify: `src/app/services/auth.service.ts`
- Modify: `src/app/core/services/session-storage.service.ts`
- Create: `src/app/core/interceptors/auth.interceptor.ts`
- Modify: `src/app/core/guards/auth.guard.ts`
- Modify: `src/app/core/guards/role.guard.ts`
- Modify: `src/app/core/services/api-error.service.ts`
- Modify: `src/app/app.config.ts`
- Modify: `src/app/features/auth/login/login.ts`
- Modify: `src/app/features/auth/login/login.html`
- Modify: `src/app/features/auth/login/login.css`

**Interfaces:**

- Produces: `AuthService.login(credentials: Login): Observable<AuthResponse>`, `logout(): void`, `token(): string | null`, `role(): 'admin' | 'agent' | null`, `currentUser()`, `dashboardUrl()`; `authInterceptor: HttpInterceptorFn`; readable `ApiErrorService.message(error, fallback)`.

- [ ] Replace demonstration credentials with `POST ${API_BASE_URL}/Auth/login`, persist successful `AuthResponse`, normalize the first supported role case-insensitively, and expose loading/error signals.
- [ ] Make session restoration reject corrupt, partial, inactive, or expired users and make logout clear `ibank.session`.
- [ ] Add the bearer token interceptor; on a backend 401 clear the session and navigate to `/login`, but do not clear on 403.
- [ ] Register the interceptor through `provideHttpClient(withInterceptors([authInterceptor]))`.
- [ ] Update auth, guest, and role guards to consume the real session and preserve `returnUrl` only when safe.
- [ ] Convert the login screen to a template-driven email/password form with required/email validation, submitting state, server error, and role-aware navigation.
- [ ] Extend API error parsing to flatten ASP.NET `ValidationProblemDetails.errors` and handle status 0, 401, 403, and 404.
- [ ] Run `npm run build`; require exit code 0 and no Angular template diagnostics.
- [ ] Smoke-check invalid login returns a visible error and Admin/Agent logins route to their own dashboard.
- [ ] Commit as `feat: connect JWT authentication and authorization`.

### Task 3: Shared shell, navigation, and view states

**Files:**

- Modify: `src/app/app.routes.ts`
- Modify: `src/app/layout/app-shell/*`
- Modify: `src/app/layout/header/*`
- Modify: `src/app/layout/sidebar/*`
- Modify: `src/app/shared/components/confirm-dialog/*`
- Modify: `src/app/shared/components/loading-state/*`
- Modify: `src/app/shared/components/error-state/*`
- Modify: `src/app/shared/components/empty-state/*`
- Modify: `src/app/features/profile/profile.*`

**Interfaces:**

- Consumes: Task 2 `AuthService` and guards.
- Produces: role-relative navigation helpers, reusable confirmation event contract, consistent state components.

- [ ] Add the missing account edit route and ensure static/dynamic route ordering cannot shadow `new` or `edit`.
- [ ] Render menu items from the authenticated role, preserving all shared routes and hiding Admin-only actions from agents.
- [ ] Bind the header/profile/logout UI to `currentUser()` and make profile explicitly read-only.
- [ ] Make confirmation, loading, error, and empty components accept plain typed inputs/outputs usable by every feature.
- [ ] Run `npm run build`, then manually traverse every menu entry once as Admin and Agent.
- [ ] Commit as `feat: connect role-aware application shell`.

### Task 4: Client workflows

**Files:**

- Modify: `src/app/services/client.service.ts`
- Modify: `src/app/features/clients/client-list/*`
- Modify: `src/app/features/clients/client-detail/*`
- Modify: `src/app/features/clients/client-form/*`

**Interfaces:**

- Consumes: `ClientService.loadAll/loadById/search/create/update/delete` and shared state components.
- Produces: complete list, search, detail, create, edit, and delete UI for backend client DTOs.

- [ ] Normalize service state transitions so every load clears stale selection/errors and always ends loading on success or error.
- [ ] Implement list loading, trimmed search, reset, empty state, detail/edit links, and confirmed deletion.
- [ ] Implement detail loading from numeric route ID, associated account table, not-found state, and role-relative links.
- [ ] Implement one template-driven form for create/edit with exact backend limits: CIN 4–20 and immutable on edit; names max 80; optional valid email max 150; required phone max 30; address max 250; optional birth date; active flag only on edit.
- [ ] Trim strings and convert blank optionals to `null`; prevent duplicate submit; navigate to details after success.
- [ ] Run `npm run build`; smoke-check list/search/detail and controlled create/edit/delete against the HTTPS API.
- [ ] Commit as `feat: implement client management workflows`.

### Task 5: Branch-office and account-type administration

**Files:**

- Modify: `src/app/services/guichet.service.ts`
- Modify: `src/app/services/type-compte.service.ts`
- Modify: `src/app/features/guichets/**`
- Modify: `src/app/features/types-comptes/**`

**Interfaces:**

- Consumes: Task 2 role/session and Task 3 shared states.
- Produces: authenticated read views and Admin-only CRUD forms for guichets and types.

- [ ] Implement guichet list/detail with loading/error/empty states and Admin-only mutation controls.
- [ ] Implement guichet create/edit template form with code 2–20 only on create, required name/address/city limits, optional phone max 30, and active only on edit.
- [ ] Implement type list/detail with formatted monetary values and Admin-only mutation controls.
- [ ] Implement type create/edit template form with code 2–30 only on create, label max 100, description max 300, non-negative minimum balance/fees, and active only on edit.
- [ ] Confirm deletions and refresh signals after successful mutation; surface backend conflicts without dropping form values.
- [ ] Run `npm run build`; smoke-check Agent read access and 403-safe behavior plus controlled Admin CRUD cleanup.
- [ ] Commit as `feat: implement banking reference administration`.

### Task 6: Account workflows

**Files:**

- Modify: `src/app/services/compte.service.ts`
- Modify: `src/app/features/comptes/compte-list/*`
- Modify: `src/app/features/comptes/compte-detail/*`
- Modify: `src/app/features/comptes/compte-form/*`

**Interfaces:**

- Consumes: client, guichet, type services for create selectors; transaction service for detail history.
- Produces: account list/detail/create/status-edit workflows.

- [ ] Implement account list with balances, status, detail links, and role-relative create/edit actions.
- [ ] Implement create form selectors populated from real clients, active account types, and branches; validate account number 4–34 and non-negative initial balance.
- [ ] Implement edit mode exposing only `isActive`, matching `UpdateCompteDto` rather than pretending other fields are editable.
- [ ] Implement account detail with metadata, formatted balance/date, transaction history, loading/error/not-found states.
- [ ] Run `npm run build`; smoke-check list/detail and controlled account creation/status update (no delete because the API exposes none).
- [ ] Commit as `feat: implement account management workflows`.

### Task 7: Transactions

**Files:**

- Modify: `src/app/services/transaction.service.ts`
- Modify: `src/app/features/transactions/transaction-workspace/*`

**Interfaces:**

- Consumes: `CompteService` collection and `TransactionService.loadByCompte/depot/retrait/virement`.
- Produces: tabbed operation workspace and account-specific history refresh.

- [ ] Load real accounts and provide deposit, withdrawal, and transfer modes using separate template models.
- [ ] Validate positive amount, required accounts, description max 250, and distinct transfer source/destination before calling the service.
- [ ] Disable inactive accounts and duplicate submissions; preserve server business errors such as insufficient funds.
- [ ] After success, show the returned reference, reset only the completed form, reload account balances, and refresh selected history.
- [ ] Render transaction history with type labels, source/destination, dates, amounts, loading/error/empty states.
- [ ] Run `npm run build`; execute one controlled deposit, withdrawal, and transfer against dedicated test accounts and confirm no unexpected 5xx.
- [ ] Commit as `feat: implement complete transaction workspace`.

### Task 8: Agent creation and live dashboards

**Files:**

- Create: `src/app/services/agent.service.ts`
- Modify: `src/app/features/agents/agent-form/*`
- Modify: `src/app/features/dashboard/admin-dashboard/*`
- Modify: `src/app/features/dashboard/agent-dashboard/*`

**Interfaces:**

- Consumes: `POST /Auth/agents`, guichet/client/account/type services.
- Produces: `AgentService.create(payload: CreateAgent): Observable<User>` and live dashboard metrics.

- [ ] Implement Admin-only agent service and form with names max 80, valid email, password minimum 6, optional real guichet selector, submitting/error/success states.
- [ ] Calculate Admin dashboard metrics from loaded clients, accounts, branches, and account types; represent partial failures explicitly.
- [ ] Calculate Agent dashboard operational summaries from allowed client/account data and link to shared workflows.
- [ ] Run `npm run build`; smoke-check an Agent receives no Admin menu/route access and Admin can create one uniquely named test agent.
- [ ] Commit as `feat: connect agents and live dashboards`.

### Task 9: End-to-end verification and delivery

**Files:**

- Modify as needed: runtime files found defective during verification
- Update: `README.md`

**Interfaces:**

- Consumes: all prior task deliverables.
- Produces: verified course branch and usage documentation.

- [ ] Document prerequisites, `npm install`, `npm start`, backend URL, Admin/Agent training credentials, localStorage limitation, and the feature-branch no-deploy rule.
- [ ] Run `npm ci` followed by `npm run build`; require both exit code 0.
- [ ] Start the production build locally and exercise every route and form as Admin and Agent while checking browser console/network output.
- [ ] Confirm expected 200/201/204/400/401/403/404 handling and zero unexpected 5xx responses.
- [ ] Run `git diff master...HEAD --check` and confirm `git status --short` is clean after the final commit.
- [ ] Commit final fixes/documentation as `docs: complete Angular course branch`.
- [ ] Push only `feature/angular-complete` to GitHub.
- [ ] Query GitHub/Vercel deployment status and verify no deployment exists for the branch; do not push again until the exclusion is confirmed effective.
- [ ] Confirm `master` and the backend repository retain their previous commit hashes and confirm the VPS still runs the pre-existing backend commit.
