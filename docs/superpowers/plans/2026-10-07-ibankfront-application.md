# iBank Front Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Angular training frontend for the deployed Bank API, including JWT session handling, role-aware navigation, corrected services, forms, lists, tables, and responsive institutional styling.

**Architecture:** Use Angular 21 standalone components organized by feature, with lazy routes and three separate files per component. Keep API access in typed services, cross-cutting authentication in `core`, reusable presentation states in `shared`, and component logic limited to form orchestration and service method calls.

**Tech Stack:** Angular 21, TypeScript 5.9, RxJS 7.8, Angular reactive forms, signals, native CSS, Vitest through Angular's unit-test builder.

**Spec:** `docs/superpowers/specs/2026-10-07-ibankfront-application-design.md`

## Global Constraints

- Use `https://bank.135-125-182-42.nip.io/api` as the single centralized API root.
- Store the complete authentication response in `localStorage` under one application-specific key.
- Do not add demo records, fixtures, placeholder business data, or mocked dashboard values.
- Give every component its own directory with separate `.ts`, `.html`, and `.css` files.
- Preserve the explicit feature-oriented structure; do not introduce a generic CRUD engine.
- Use the approved ivory, copper, and dark-brown “Institution élégante” visual direction.
- Keep Admin routes hidden and guarded for Agents; treat frontend authorization as educational, not backend security.
- Preserve unrelated local changes in `BankManagementStarter`; implementation is confined to `ibankfront` unless a verified server defect blocks the API contract.
- Write each behavior test first, run it to observe the expected failure, then implement only enough production code to pass.

## Review Focus

- Corrupt or partial `localStorage` content must be cleared without crashing application startup; pin this in Task 1 session tests.
- An expired session must never flash protected content and must redirect to login; pin this in Task 2 guard tests.
- Empty optional form fields must be normalized to `null`, not empty strings; pin this in Tasks 4, 5, and 6 form tests.
- Rapid repeated submission must emit only one mutation while the first request is pending; pin this in each mutation-form task.
- `401`, `403`, and network failures must lead to distinct outcomes rather than one generic message; pin this in Tasks 1 and 2 interceptor/UI tests.

---

### Task 1: API configuration, error handling, and authentication core

**Files:**

- Create: `src/app/core/config/api.config.ts`
- Create: `src/app/core/services/session-storage.service.ts`
- Create: `src/app/core/services/api-error.service.ts`
- Create: `src/app/core/interceptors/auth.interceptor.ts`
- Create: `src/app/core/services/session-storage.service.spec.ts`
- Create: `src/app/core/services/api-error.service.spec.ts`
- Create: `src/app/core/interceptors/auth.interceptor.spec.ts`
- Modify: `src/app/services/auth.service.ts`
- Create: `src/app/services/auth.service.spec.ts`
- Modify: `src/app/app.config.ts`

**Interfaces:**

- Produces: `API_BASE_URL: InjectionToken<string>` with value `https://bank.135-125-182-42.nip.io/api`.
- Produces: `SessionStorageService.read(): AuthResponse | null`, `write(session: AuthResponse): void`, and `clear(): void`.
- Produces: `ApiErrorService.message(error: unknown, fallback: string): string`.
- Produces: `AuthService.login(credentials: Login): Observable<AuthResponse>`, `createAgent(agent: CreateAgent): Observable<User>`, `logout(): void`, `token(): string | null`, `user: Signal<User | null>`, `isAuthenticated: Signal<boolean>`, and `hasRole(role: string): boolean`.
- Produces: functional `authInterceptor` that adds Bearer authentication only for the configured API host and clears the session on `401`.

- [ ] **Step 1: Write failing core tests**

Add tests asserting the exact API root, valid session round-trip, corrupt JSON cleanup, partial session cleanup, expired session cleanup, backend `{ message }` extraction, fallback network message, Bearer header behavior, exclusion of non-API URLs, and `401` cleanup.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npm test -- --no-watch --include src/app/core/**/*.spec.ts`

Expected: FAIL because the core files and providers do not exist.

- [ ] **Step 3: Implement the core services and interceptor**

Use the storage key `ibank.session`. Parse expiration with `Date.parse`; any invalid, missing, or expired session is cleared. Configure `provideHttpClient(withInterceptors([authInterceptor]))` in `app.config.ts`.

- [ ] **Step 4: Write failing AuthService tests**

Assert `POST ${API_BASE_URL}/Auth/login`, `POST ${API_BASE_URL}/Auth/agent`, state restoration from storage, storage after login, signal reset after logout, and case-sensitive membership of `Admin` and `Agent` roles.

- [ ] **Step 5: Run AuthService tests and verify RED**

Run: `npm test -- --no-watch --include src/app/services/auth.service.spec.ts`

Expected: FAIL because `auth.service.ts` is empty.

- [ ] **Step 6: Implement AuthService and verify GREEN**

Run both focused commands from Steps 2 and 5. Expected: all focused tests PASS with no unverified HTTP requests.

- [ ] **Step 7: Commit**

```bash
git add src/app/core src/app/services/auth.service.ts src/app/services/auth.service.spec.ts src/app/app.config.ts
git commit -m "feat: add API and authentication core"
```

### Task 2: Guards, routes, login, and authenticated shell

**Files:**

- Create: `src/app/core/guards/auth.guard.ts`
- Create: `src/app/core/guards/role.guard.ts`
- Create: `src/app/core/guards/guards.spec.ts`
- Create: `src/app/features/auth/login/login.ts`
- Create: `src/app/features/auth/login/login.html`
- Create: `src/app/features/auth/login/login.css`
- Create: `src/app/features/auth/login/login.spec.ts`
- Create: `src/app/layout/app-shell/app-shell.ts`
- Create: `src/app/layout/app-shell/app-shell.html`
- Create: `src/app/layout/app-shell/app-shell.css`
- Create: `src/app/layout/app-shell/app-shell.spec.ts`
- Create: `src/app/layout/sidebar/sidebar.ts`
- Create: `src/app/layout/sidebar/sidebar.html`
- Create: `src/app/layout/sidebar/sidebar.css`
- Create: `src/app/layout/header/header.ts`
- Create: `src/app/layout/header/header.html`
- Create: `src/app/layout/header/header.css`
- Modify: `src/app/app.routes.ts`
- Modify: `src/app/app.ts`
- Modify: `src/app/app.html`
- Modify: `src/app/app.css`
- Modify: `src/styles.css`

**Interfaces:**

- Consumes: `AuthService.isAuthenticated`, `AuthService.hasRole()`, `AuthService.user`, and `AuthService.logout()` from Task 1.
- Produces: functional `authGuard` and `roleGuard`.
- Produces: `/login`, a protected root shell, `/dashboard`, and an unknown-route redirect to `/dashboard`; Tasks 4–6 add their lazy feature routes to this shell.
- Produces: `Login` reactive form with `email` and `password`, plus role-aware shell navigation.

- [ ] **Step 1: Write failing guard and routing tests**

Assert unauthenticated redirect to `/login` with `returnUrl`, authenticated access, expired-session rejection before activation, Agent rejection from `data.roles: ['Admin']`, Admin access, unknown route redirect, and lazy protected route declarations.

- [ ] **Step 2: Run guard tests and verify RED**

Run: `npm test -- --no-watch --include src/app/core/guards/guards.spec.ts`

Expected: FAIL because guards and routes do not exist.

- [ ] **Step 3: Implement guards and route skeleton**

Use functional guards and `UrlTree` returns. Do not imperatively navigate from a guard.

- [ ] **Step 4: Write failing login and shell tests**

Assert required/email validation, a single login request while pending, backend error display, redirect to `returnUrl`, no protected-content flash for an expired session, Admin-only navigation visibility, Agent navigation visibility, mobile navigation toggle, and logout redirect.

- [ ] **Step 5: Run component tests and verify RED**

Run: `npm test -- --no-watch --include src/app/features/auth/login/login.spec.ts --include src/app/layout/app-shell/app-shell.spec.ts`

Expected: FAIL because the components do not exist.

- [ ] **Step 6: Implement login and layout components**

Use `ReactiveFormsModule`, submit-state guards, `RouterLink`, `RouterLinkActive`, and the approved design tokens in `styles.css`. Keep layout children presentational and read identity from `AuthService`.

- [ ] **Step 7: Verify Task 2 GREEN**

Run the focused commands from Steps 2 and 5. Expected: all tests PASS.

- [ ] **Step 8: Commit**

```bash
git add src/app/core/guards src/app/features/auth src/app/layout src/app/app.routes.ts src/app/app.ts src/app/app.html src/app/app.css src/styles.css
git commit -m "feat: add guarded application shell"
```

### Task 3: Shared view states and dashboard

**Files:**

- Create: `src/app/shared/components/loading-state/loading-state.ts`
- Create: `src/app/shared/components/loading-state/loading-state.html`
- Create: `src/app/shared/components/loading-state/loading-state.css`
- Create: `src/app/shared/components/empty-state/empty-state.ts`
- Create: `src/app/shared/components/empty-state/empty-state.html`
- Create: `src/app/shared/components/empty-state/empty-state.css`
- Create: `src/app/shared/components/error-state/error-state.ts`
- Create: `src/app/shared/components/error-state/error-state.html`
- Create: `src/app/shared/components/error-state/error-state.css`
- Create: `src/app/shared/components/confirm-dialog/confirm-dialog.ts`
- Create: `src/app/shared/components/confirm-dialog/confirm-dialog.html`
- Create: `src/app/shared/components/confirm-dialog/confirm-dialog.css`
- Create: `src/app/features/dashboard/dashboard.ts`
- Create: `src/app/features/dashboard/dashboard.html`
- Create: `src/app/features/dashboard/dashboard.css`
- Create: `src/app/features/dashboard/dashboard.spec.ts`
- Modify: `src/app/app.routes.ts`

**Interfaces:**

- Consumes: readonly service signals from Tasks 1 and existing domain services.
- Produces: presentational state components with typed `input()` values and retry/confirm/cancel `output()` events.
- Produces: `Dashboard` that calls real service load methods and derives only available counts and balances.

- [ ] **Step 1: Write failing dashboard and shared-state tests**

Assert no hard-coded metrics, initial calls to client/account services, derived client/account/balance values, Admin-only guichet metric and link, Agent omission of Admin data, loading/error/empty branches, retry output, and confirmation outputs.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- --no-watch --include src/app/features/dashboard/dashboard.spec.ts`

Expected: FAIL because dashboard and shared components do not exist.

- [ ] **Step 3: Implement shared states and dashboard**

Keep state components free of domain services. Format currency as Tunisian dinar with Angular pipes and never substitute invented values when a request fails.

- [ ] **Step 4: Verify GREEN and commit**

Run: `npm test -- --no-watch --include src/app/features/dashboard/dashboard.spec.ts`

Expected: PASS.

```bash
git add src/app/shared src/app/features/dashboard src/app/app.routes.ts
git commit -m "feat: add dashboard and shared view states"
```

### Task 4: Complete client service and client screens

**Files:**

- Modify: `src/app/services/client.service.ts`
- Modify: `src/app/services/services.spec.ts`
- Create: `src/app/features/clients/client-list/client-list.ts`
- Create: `src/app/features/clients/client-list/client-list.html`
- Create: `src/app/features/clients/client-list/client-list.css`
- Create: `src/app/features/clients/client-list/client-list.spec.ts`
- Create: `src/app/features/clients/client-form/client-form.ts`
- Create: `src/app/features/clients/client-form/client-form.html`
- Create: `src/app/features/clients/client-form/client-form.css`
- Create: `src/app/features/clients/client-form/client-form.spec.ts`
- Create: `src/app/features/clients/client-detail/client-detail.ts`
- Create: `src/app/features/clients/client-detail/client-detail.html`
- Create: `src/app/features/clients/client-detail/client-detail.css`
- Create: `src/app/features/clients/client-detail/client-detail.spec.ts`
- Modify: `src/app/app.routes.ts`

**Interfaces:**

- Consumes: API config/error services and shared state components.
- Produces: `ClientService.loadAll(): void`, `loadById(id: number): void`, `search(term: string): void`, `create(dto: CreateClient): Observable<Client>`, `update(id: number, dto: UpdateClient): Observable<void>`, and `delete(id: number): Observable<void>` using `/Clients`.
- Produces: client list/search, create/edit form, detail/accounts view, and confirmed deactivation routes.

- [ ] **Step 1: Extend service tests and verify RED**

Assert all six client endpoint variants use the centralized URL, correct query encoding, correct DTO bodies, response state updates, preserved backend messages, and loading reset on error.

Run: `npm test -- --no-watch --include src/app/services/services.spec.ts`

Expected: FAIL because existing services use localhost and incomplete error behavior.

- [ ] **Step 2: Correct ClientService and verify its cases GREEN**

Run the same command. Expected: all client cases PASS; remaining newly added domain cases may still fail until later tasks.

- [ ] **Step 3: Write failing client component tests**

Assert real list rendering, empty/loading/error states, trimmed search, form DTO mapping, optional empty values mapped to `null`, date/length/email validation, one submit while pending, create/edit selection by route id, detail account rows, and confirmation before delete.

- [ ] **Step 4: Run client component tests and verify RED**

Run: `npm test -- --no-watch --include src/app/features/clients/**/*.spec.ts`

Expected: FAIL because the screens do not exist.

- [ ] **Step 5: Implement client screens and routes**

Use `/clients`, `/clients/new`, `/clients/:id`, and `/clients/:id/edit`. Components may orchestrate subscriptions but must call only public `ClientService` methods.

- [ ] **Step 6: Verify GREEN and commit**

Run both focused commands from Steps 1 and 4. Expected: all Task 4 cases PASS.

```bash
git add src/app/services/client.service.ts src/app/services/services.spec.ts src/app/features/clients src/app/app.routes.ts
git commit -m "feat: add client management screens"
```

### Task 5: Complete account and transaction services and screens

**Files:**

- Modify: `src/app/services/compte.service.ts`
- Modify: `src/app/services/transaction.service.ts`
- Modify: `src/app/services/services.spec.ts`
- Create: `src/app/features/comptes/compte-list/compte-list.ts`
- Create: `src/app/features/comptes/compte-list/compte-list.html`
- Create: `src/app/features/comptes/compte-list/compte-list.css`
- Create: `src/app/features/comptes/compte-form/compte-form.ts`
- Create: `src/app/features/comptes/compte-form/compte-form.html`
- Create: `src/app/features/comptes/compte-form/compte-form.css`
- Create: `src/app/features/comptes/compte-detail/compte-detail.ts`
- Create: `src/app/features/comptes/compte-detail/compte-detail.html`
- Create: `src/app/features/comptes/compte-detail/compte-detail.css`
- Create: `src/app/features/comptes/comptes.spec.ts`
- Create: `src/app/features/transactions/transaction-workspace/transaction-workspace.ts`
- Create: `src/app/features/transactions/transaction-workspace/transaction-workspace.html`
- Create: `src/app/features/transactions/transaction-workspace/transaction-workspace.css`
- Create: `src/app/features/transactions/transaction-workspace/transaction-workspace.spec.ts`
- Modify: `src/app/app.routes.ts`

**Interfaces:**

- Produces: corrected account methods for `GET/POST/PUT /Comptes` and transaction methods for `GET /Transactions/compte/{id}` plus three operation posts.
- Produces: account list, open/edit/detail routes and transaction workspace with `depot`, `retrait`, and `virement` form groups.

- [ ] **Step 1: Add failing account and transaction service cases**

Assert every URL, verb, DTO, signal update, error reset, and operation response. Confirm account update sends only `{ isActive }` and transactions prepend a successful response without inventing history.

- [ ] **Step 2: Run service tests and verify RED**

Run: `npm test -- --no-watch --include src/app/services/services.spec.ts`

Expected: FAIL on localhost URLs or missing behaviors.

- [ ] **Step 3: Correct both services and verify GREEN**

Run the same command. Expected: all account and transaction cases PASS.

- [ ] **Step 4: Write failing screen tests**

Assert account data states, selectors populated from real client/type/guichet services, positive balance and identifier validation, single pending submission, detail history load, operation tab forms, source/destination inequality, positive amount, empty description mapped to `null`, and one request per pending operation.

- [ ] **Step 5: Run screen tests and verify RED**

Run: `npm test -- --no-watch --include src/app/features/comptes/comptes.spec.ts --include src/app/features/transactions/transaction-workspace/transaction-workspace.spec.ts`

Expected: FAIL because screens do not exist.

- [ ] **Step 6: Implement screens, styles, and routes**

Use `/comptes`, `/comptes/new`, `/comptes/:id`, and `/transactions`; accept an optional `compteId` query parameter to preselect a transaction account.

- [ ] **Step 7: Verify GREEN and commit**

Run the service and screen commands. Expected: all Task 5 cases PASS.

```bash
git add src/app/services/compte.service.ts src/app/services/transaction.service.ts src/app/services/services.spec.ts src/app/features/comptes src/app/features/transactions src/app/app.routes.ts
git commit -m "feat: add accounts and transactions"
```

### Task 6: Complete Admin services and screens

**Files:**

- Modify: `src/app/services/guichet.service.ts`
- Modify: `src/app/services/type-compte.service.ts`
- Modify: `src/app/services/services.spec.ts`
- Create: `src/app/features/guichets/guichet-list/guichet-list.ts`
- Create: `src/app/features/guichets/guichet-list/guichet-list.html`
- Create: `src/app/features/guichets/guichet-list/guichet-list.css`
- Create: `src/app/features/guichets/guichet-form/guichet-form.ts`
- Create: `src/app/features/guichets/guichet-form/guichet-form.html`
- Create: `src/app/features/guichets/guichet-form/guichet-form.css`
- Create: `src/app/features/guichets/guichets.spec.ts`
- Create: `src/app/features/types-comptes/type-compte-list/type-compte-list.ts`
- Create: `src/app/features/types-comptes/type-compte-list/type-compte-list.html`
- Create: `src/app/features/types-comptes/type-compte-list/type-compte-list.css`
- Create: `src/app/features/types-comptes/type-compte-form/type-compte-form.ts`
- Create: `src/app/features/types-comptes/type-compte-form/type-compte-form.html`
- Create: `src/app/features/types-comptes/type-compte-form/type-compte-form.css`
- Create: `src/app/features/types-comptes/types-comptes.spec.ts`
- Create: `src/app/features/agents/agent-form/agent-form.ts`
- Create: `src/app/features/agents/agent-form/agent-form.html`
- Create: `src/app/features/agents/agent-form/agent-form.css`
- Create: `src/app/features/agents/agent-form/agent-form.spec.ts`
- Modify: `src/app/app.routes.ts`

**Interfaces:**

- Consumes: `AuthService.createAgent()` and Admin role guard.
- Produces: complete guichet and type-compte CRUD services using `/Guichets` and `/TypesComptes`.
- Produces: Admin-only list/forms for guichets and types, plus create-only agent form.

- [ ] **Step 1: Add failing Admin service contract tests**

Assert all list/detail/create/update/delete URLs, verbs, DTOs, conflict messages, list updates, and loading reset for guichets and types.

- [ ] **Step 2: Run service tests and verify RED, then correct services**

Run: `npm test -- --no-watch --include src/app/services/services.spec.ts`

Expected before implementation: FAIL. Expected after correcting both services: PASS.

- [ ] **Step 3: Write failing Admin screen tests**

Assert all real data states, validation matching DTO limits, optional telephone/description/guichet mapped to `null`, nonnegative money constraints, one pending submission, confirmation before delete, create/edit routing, agent password minimum of eight characters, and no invented agent table.

- [ ] **Step 4: Run Admin screen tests and verify RED**

Run: `npm test -- --no-watch --include src/app/features/guichets/guichets.spec.ts --include src/app/features/types-comptes/types-comptes.spec.ts --include src/app/features/agents/agent-form/agent-form.spec.ts`

Expected: FAIL because screens do not exist.

- [ ] **Step 5: Implement Admin screens and guarded lazy routes**

Use `/admin/guichets`, `/admin/guichets/new`, `/admin/guichets/:id/edit`, `/admin/types-comptes`, `/admin/types-comptes/new`, `/admin/types-comptes/:id/edit`, and `/admin/agents/new`, all with `data.roles: ['Admin']`.

- [ ] **Step 6: Verify GREEN and commit**

Run both Task 6 test commands. Expected: all cases PASS.

```bash
git add src/app/services src/app/features/guichets src/app/features/types-comptes src/app/features/agents src/app/app.routes.ts
git commit -m "feat: add administration screens"
```

### Task 7: Full integration, accessibility, responsive behavior, and production verification

**Files:**

- Modify: `src/app/app.spec.ts`
- Modify: `src/styles.css`
- Modify: feature HTML/CSS files only where integration verification exposes defects
- Create: `scripts/smoke-api.ps1`
- Create: `docs/api-smoke-results.md`

**Interfaces:**

- Consumes: all routes, components, services, guards, and shared states from Tasks 1–6.
- Produces: a repeatable non-destructive API smoke script and recorded endpoint/status evidence.

- [ ] **Step 1: Write failing application integration tests**

Assert initial redirect, restored-session shell render, keyboard-accessible navigation, labeled controls, visible focus, responsive menu semantics, role-specific route access, and absence of known demo names/numbers in rendered application code.

- [ ] **Step 2: Run integration tests and verify RED**

Run: `npm test -- --no-watch --include src/app/app.spec.ts`

Expected: FAIL on any missing integration or accessibility behavior.

- [ ] **Step 3: Fix only the integration defects demonstrated by tests**

Keep CSS component-local except design tokens, reset, typography, and reusable primitives in `styles.css`.

- [ ] **Step 4: Create the non-destructive API smoke script**

Implement `scripts/smoke-api.ps1` to call Health, real login, every GET collection/detail route for IDs discovered from collections, search, transaction history for a discovered account, and each write route with invalid payloads or impossible ID `0`. Record method, path, expected status family, actual status, and CORS headers without logging the JWT or password.

- [ ] **Step 5: Run the deployed API smoke test**

Run: `powershell -ExecutionPolicy Bypass -File scripts/smoke-api.ps1`

Expected: every route responds with its documented success or validation/not-found status, no `5xx`, no persistent record created, and results written to `docs/api-smoke-results.md`.

- [ ] **Step 6: Run the full Angular test suite**

Run: `npm test -- --no-watch`

Expected: all tests PASS with zero failures and no outstanding HTTP requests.

- [ ] **Step 7: Run production build**

Run: `npm run build`

Expected: exit code `0`, production artifacts emitted, and bundle budgets respected.

- [ ] **Step 8: Inspect the final diff and repository state**

Run: `git diff --check && git status --short`

Expected: no whitespace errors; only intended implementation files, smoke evidence, and the existing visual-companion working directory are present.

- [ ] **Step 9: Commit**

```bash
git add src scripts/smoke-api.ps1 docs/api-smoke-results.md
git commit -m "test: verify complete banking frontend"
```
