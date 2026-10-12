import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((module) => module.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/app-shell/app-shell').then((module) => module.AppShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((module) => module.Dashboard),
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./features/clients/client-list/client-list').then((m) => m.ClientList),
      },
      {
        path: 'clients/new',
        loadComponent: () =>
          import('./features/clients/client-form/client-form').then((m) => m.ClientForm),
      },
      {
        path: 'clients/:id/edit',
        loadComponent: () =>
          import('./features/clients/client-form/client-form').then((m) => m.ClientForm),
      },
      {
        path: 'clients/:id',
        loadComponent: () =>
          import('./features/clients/client-detail/client-detail').then((m) => m.ClientDetail),
      },
      {
        path: 'comptes',
        loadComponent: () =>
          import('./features/comptes/compte-list/compte-list').then((m) => m.CompteList),
      },
      {
        path: 'comptes/new',
        loadComponent: () =>
          import('./features/comptes/compte-form/compte-form').then((m) => m.CompteForm),
      },
      {
        path: 'comptes/:id',
        loadComponent: () =>
          import('./features/comptes/compte-detail/compte-detail').then((m) => m.CompteDetail),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/transactions/transaction-workspace/transaction-workspace').then(
            (m) => m.TransactionWorkspace,
          ),
      },
      {
        path: 'admin/guichets',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        loadComponent: () =>
          import('./features/guichets/guichet-list/guichet-list').then((m) => m.GuichetList),
      },
      {
        path: 'admin/guichets/new',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        loadComponent: () =>
          import('./features/guichets/guichet-form/guichet-form').then((m) => m.GuichetForm),
      },
      {
        path: 'admin/guichets/:id/edit',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        loadComponent: () =>
          import('./features/guichets/guichet-form/guichet-form').then((m) => m.GuichetForm),
      },
      {
        path: 'admin/types-comptes',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        loadComponent: () =>
          import('./features/types-comptes/type-compte-list/type-compte-list').then(
            (m) => m.TypeCompteList,
          ),
      },
      {
        path: 'admin/types-comptes/new',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        loadComponent: () =>
          import('./features/types-comptes/type-compte-form/type-compte-form').then(
            (m) => m.TypeCompteForm,
          ),
      },
      {
        path: 'admin/types-comptes/:id/edit',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        loadComponent: () =>
          import('./features/types-comptes/type-compte-form/type-compte-form').then(
            (m) => m.TypeCompteForm,
          ),
      },
      {
        path: 'admin/agents/new',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        loadComponent: () =>
          import('./features/agents/agent-form/agent-form').then((m) => m.AgentForm),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
