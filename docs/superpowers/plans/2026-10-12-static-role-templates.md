# Static Role Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the service-driven banking UI with a complete static HTML/CSS demonstrator entered through local Admin and Agent authentication.

**Architecture:** Keep Angular standalone components and the existing feature folders. A minimal local session service owns the two accepted credentials and role-based routing; all business pages become static templates whose TypeScript contains only component declarations and router imports.

**Tech Stack:** Angular 21 standalone components, Angular Router, TypeScript 5.9, native HTML/CSS, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-12-static-role-templates-design.md`

## Global Constraints

- Accept exactly `admin/admin` and `agent/agent` as local demo credentials.
- Redirect Admin to `/dashboard/admin` and Agent to `/dashboard/agent`.
- Make no backend request from authentication or business pages.
- Use no `ngModel`, reactive form directive, RxJS subscription, or business-service injection in static page components.
- Keep each component in its own folder with separate `.ts`, `.html`, and `.css` files.
- Reuse the existing visual language and installed dependencies; add no package or generic CRUD/form abstraction.
- Put realistic demonstration content directly in HTML and keep business buttons visual only.

## Review Focus

- A refreshed browser with a valid stored role must restore the correct dashboard without contacting the backend; pin this in Task 1.
- A manually entered Admin URL under an Agent session must redirect to `/dashboard/agent`; pin this in Task 1.
- Corrupt or unknown stored roles must be cleared and redirected to `/login`; pin this in Task 1.
- Static forms must not accidentally submit or reload the page; require `type="button"` on business action buttons in Tasks 3–5.
- No page component may retain a service injection, reactive form directive, or HTTP call; pin this with a source scan in Task 6.

---

### Task 1: Local authentication and role routing

**Files:**
- Modify: `src/app/services/auth.service.ts`
- Modify: `src/app/services/auth.service.spec.ts`
- Modify: `src/app/core/guards/auth.guard.ts`
- Modify: `src/app/core/guards/role.guard.ts`
- Modify: `src/app/core/guards/guards.spec.ts`
- Modify: `src/app/features/auth/login/login.ts`
- Modify: `src/app/features/auth/login/login.html`
- Modify: `src/app/features/auth/login/login.spec.ts`
- Modify: `src/app/app.routes.ts`
- Modify: `src/app/app.config.ts`

**Interfaces:**
- Produces: `DemoRole = 'admin' | 'agent'`, `AuthService.login(username: string, password: string): boolean`, `role(): DemoRole | null`, `dashboardUrl(): '/dashboard/admin' | '/dashboard/agent' | '/login'`, `logout(): void`.
- Produces: `authGuard`, `guestGuard`, and `roleGuard` using the locally restored role.

- [ ] **Step 1: Write failing local-authentication tests**

Assert exact acceptance and redirection for both credential pairs, rejection of any other pair, valid-role restoration, corrupt-role cleanup, logout, authenticated `/login` redirection, unauthenticated route rejection, and Agent rejection from an Admin route.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npm test -- --no-watch --include src/app/services/auth.service.spec.ts --include src/app/core/guards/guards.spec.ts --include src/app/features/auth/login/login.spec.ts`

Expected: FAIL because authentication still depends on the backend and the old session contract.

- [ ] **Step 3: Implement the minimal local session**

Use one local-storage key containing only the lowercase role. Keep validation in `AuthService`; remove HTTP, JWT, expiration, interceptor, reactive-form and RxJS dependencies from the login path. The login template uses plain `#username` and `#password` input references and calls the local method.

- [ ] **Step 4: Declare role-rooted routes**

Make `/dashboard/admin` require `admin`, `/dashboard/agent` require `agent`, and nest common feature routes under both role roots. Keep administration routes reachable only from the Admin tree.

- [ ] **Step 5: Verify GREEN and commit**

Run the focused command from Step 2. Expected: all focused tests PASS.

```bash
git add src/app/services/auth.service* src/app/core/guards src/app/features/auth/login src/app/app.routes.ts src/app/app.config.ts
git commit -m "feat: add local role authentication"
```

### Task 2: Role-aware shell and dashboards

**Files:**
- Modify: `src/app/layout/app-shell/app-shell.ts`
- Modify: `src/app/layout/app-shell/app-shell.html`
- Modify: `src/app/layout/sidebar/sidebar.ts`
- Modify: `src/app/layout/sidebar/sidebar.html`
- Modify: `src/app/layout/header/header.ts`
- Modify: `src/app/layout/header/header.html`
- Modify: `src/app/layout/app-shell/app-shell.spec.ts`
- Create: `src/app/features/dashboard/admin-dashboard/admin-dashboard.ts`
- Create: `src/app/features/dashboard/admin-dashboard/admin-dashboard.html`
- Create: `src/app/features/dashboard/admin-dashboard/admin-dashboard.css`
- Create: `src/app/features/dashboard/agent-dashboard/agent-dashboard.ts`
- Create: `src/app/features/dashboard/agent-dashboard/agent-dashboard.html`
- Create: `src/app/features/dashboard/agent-dashboard/agent-dashboard.css`
- Create: `src/app/features/profile/profile.ts`
- Create: `src/app/features/profile/profile.html`
- Create: `src/app/features/profile/profile.css`

**Interfaces:**
- Consumes: `AuthService.role()`, `dashboardUrl()`, and `logout()` from Task 1.
- Produces: role-filtered navigation and static Admin, Agent, and profile pages.

- [ ] **Step 1: Write failing shell tests**

Assert Admin navigation includes guichets, account types and agent creation; Agent navigation excludes them; each role sees its own dashboard copy and profile link; logout returns to `/login`.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- --no-watch --include src/app/layout/app-shell/app-shell.spec.ts`

Expected: FAIL on the old user/JWT shell and missing dashboards.

- [ ] **Step 3: Implement the shell and static dashboards**

Keep only menu toggle, role lookup, router links and logout logic in layout TypeScript. Put all dashboard cards, shortcuts, activity rows and profile fields directly in HTML.

- [ ] **Step 4: Verify GREEN and commit**

Run the command from Step 2. Expected: PASS.

```bash
git add src/app/layout src/app/features/dashboard src/app/features/profile src/app/app.routes.ts
git commit -m "feat: add static role dashboards"
```

### Task 3: Static client and account page set

**Files:**
- Modify: `src/app/features/clients/client-list/*`
- Modify: `src/app/features/clients/client-form/*`
- Modify: `src/app/features/clients/client-detail/*`
- Modify: `src/app/features/comptes/compte-list/*`
- Modify: `src/app/features/comptes/compte-form/*`
- Modify: `src/app/features/comptes/compte-detail/*`
- Modify: `src/app/features/clients/client-list/client-list.spec.ts`
- Modify: `src/app/features/clients/client-form/client-form.spec.ts`
- Modify: `src/app/features/clients/client-detail/client-detail.spec.ts`
- Modify: `src/app/features/comptes/comptes.spec.ts`

**Interfaces:**
- Produces: static list, search, creation, edit and detail templates for clients; static list, opening and detail templates for accounts.
- Constraint: page TypeScript imports only `Component`, `RouterLink`, and display pipes actually used by its HTML.

- [ ] **Step 1: Replace component tests with static-template expectations and verify RED**

Assert representative table rows, every required form field, detail cards, action links and account history are rendered without providers for business services.

- [ ] **Step 2: Remove business logic from the six page components**

Delete service injections, lifecycle loads, signals, reactive forms, subscriptions and mutation handlers. Keep route links and display pipes only.

- [ ] **Step 3: Build complete static HTML forms and data views**

Use native controls without Angular form directives. Add `type="button"` to every visual business action. Include realistic rows and options directly in HTML.

- [ ] **Step 4: Verify and commit**

Run: `npm test -- --no-watch --include src/app/features/clients/**/*.spec.ts --include src/app/features/comptes/comptes.spec.ts`

Expected: all client/account tests PASS.

```bash
git add src/app/features/clients src/app/features/comptes
git commit -m "feat: add static client and account templates"
```

### Task 4: Static transaction workspace

**Files:**
- Modify: `src/app/features/transactions/transaction-workspace/transaction-workspace.ts`
- Modify: `src/app/features/transactions/transaction-workspace/transaction-workspace.html`
- Modify: `src/app/features/transactions/transaction-workspace/transaction-workspace.css`
- Modify: `src/app/features/transactions/transaction-workspace/transaction-workspace.spec.ts`

**Interfaces:**
- Produces: one static page containing deposit, withdrawal and transfer forms plus a complete transaction history table.

- [ ] **Step 1: Write failing static transaction tests**

Assert all three forms, source/destination account controls, amount and description fields, representative history rows and the absence of service providers.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- --no-watch --include src/app/features/transactions/transaction-workspace/transaction-workspace.spec.ts`

Expected: FAIL because the current page depends on reactive forms and service state.

- [ ] **Step 3: Replace the workspace with static markup**

Render the three forms together as clear sections or tabs implemented with native markup/CSS. Remove all form and transaction logic from TypeScript.

- [ ] **Step 4: Verify and commit**

Run the command from Step 2. Expected: PASS.

```bash
git add src/app/features/transactions
git commit -m "feat: add static transaction templates"
```

### Task 5: Static administration page set

**Files:**
- Modify: `src/app/features/guichets/guichet-list/*`
- Modify: `src/app/features/guichets/guichet-form/*`
- Create: `src/app/features/guichets/guichet-detail/guichet-detail.ts`
- Create: `src/app/features/guichets/guichet-detail/guichet-detail.html`
- Create: `src/app/features/guichets/guichet-detail/guichet-detail.css`
- Modify: `src/app/features/types-comptes/type-compte-list/*`
- Modify: `src/app/features/types-comptes/type-compte-form/*`
- Create: `src/app/features/types-comptes/type-compte-detail/type-compte-detail.ts`
- Create: `src/app/features/types-comptes/type-compte-detail/type-compte-detail.html`
- Create: `src/app/features/types-comptes/type-compte-detail/type-compte-detail.css`
- Modify: `src/app/features/agents/agent-form/*`
- Modify: `src/app/features/guichets/guichets.spec.ts`
- Modify: `src/app/features/types-comptes/types-comptes.spec.ts`
- Modify: `src/app/features/agents/agent-form/agent-form.spec.ts`
- Modify: `src/app/app.routes.ts`

**Interfaces:**
- Consumes: Admin-only route tree from Task 1.
- Produces: static branch list/form/detail, account-type list/form/detail and agent-creation templates.

- [ ] **Step 1: Write failing administration template tests**

Assert realistic list rows, all DTO-relevant form fields, detail summaries, agent assignment options and Admin-only route declarations.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- --no-watch --include src/app/features/guichets/guichets.spec.ts --include src/app/features/types-comptes/types-comptes.spec.ts --include src/app/features/agents/agent-form/agent-form.spec.ts`

Expected: FAIL because the current pages inject services and detail pages are missing.

- [ ] **Step 3: Implement the static administration pages and routes**

Remove service/form logic from existing components, create the two detail components, and add their Admin routes. Use native controls and static HTML content only.

- [ ] **Step 4: Verify and commit**

Run the command from Step 2. Expected: PASS.

```bash
git add src/app/features/guichets src/app/features/types-comptes src/app/features/agents src/app/app.routes.ts
git commit -m "feat: add static administration templates"
```

### Task 6: Remove runtime API wiring and verify the demonstrator

**Files:**
- Modify: `src/app/app.config.ts`
- Modify: `src/app/app.spec.ts`
- Modify: `src/styles.css` only where shared responsive/focus styling is missing
- Delete or stop registering: `src/app/core/interceptors/auth.interceptor.ts`
- Delete obsolete tests that assert HTTP-backed page behavior; retain services and models as dormant future integration code.

**Interfaces:**
- Consumes: all static pages and local-role routing from Tasks 1–5.
- Produces: a production build with no runtime HTTP provider or page-level business integration.

- [ ] **Step 1: Write the final integration checks**

Assert root/login behavior, both dashboard route trees, wildcard routing and accessible navigation. Add a source scan that fails if business-feature files under `features/` (excluding `features/auth/`) contain `HttpClient`, `FormGroup`, `formControlName`, `ngModel`, `.subscribe(`, or imports from `services/`.

- [ ] **Step 2: Run integration checks and verify RED**

Run: `npm test -- --no-watch`

Expected: FAIL until remaining dynamic wiring and obsolete tests are removed.

- [ ] **Step 3: Remove obsolete runtime wiring and finish shared styling**

Remove the HTTP/interceptor provider from `app.config.ts`. Keep dormant service source files unreferenced. Ensure responsive tables/forms, visible focus and role navigation remain coherent.

- [ ] **Step 4: Run full verification**

Run: `npm test -- --no-watch`

Expected: all tests PASS.

Run: `npm run build`

Expected: exit code `0` and bundle budgets respected.

Run: `git diff --check && git status --short`

Expected: no whitespace errors and only intended application, test and documentation changes.

- [ ] **Step 5: Commit**

```bash
git add src docs/superpowers/plans/2026-10-12-static-role-templates.md
git commit -m "test: verify static role demonstrator"
```
