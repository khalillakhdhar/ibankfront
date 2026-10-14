import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

const commonChildren: Routes = [
  { path: 'clients', loadComponent: () => import('./features/clients/client-list/client-list').then(m => m.ClientList) },
  { path: 'clients/new', loadComponent: () => import('./features/clients/client-form/client-form').then(m => m.ClientForm) },
  { path: 'clients/:id/edit', loadComponent: () => import('./features/clients/client-form/client-form').then(m => m.ClientForm) },
  { path: 'clients/:id', loadComponent: () => import('./features/clients/client-detail/client-detail').then(m => m.ClientDetail) },
  { path: 'comptes', loadComponent: () => import('./features/comptes/compte-list/compte-list').then(m => m.CompteList) },
  { path: 'comptes/new', loadComponent: () => import('./features/comptes/compte-form/compte-form').then(m => m.CompteForm) },
  { path: 'comptes/:id/edit', loadComponent: () => import('./features/comptes/compte-form/compte-form').then(m => m.CompteForm) },
  { path: 'comptes/:id', loadComponent: () => import('./features/comptes/compte-detail/compte-detail').then(m => m.CompteDetail) },
  { path: 'transactions', loadComponent: () => import('./features/transactions/transaction-workspace/transaction-workspace').then(m => m.TransactionWorkspace) },
  { path: 'profil', loadComponent: () => import('./features/profile/profile').then(m => m.Profile) },
];

export const routes: Routes = [
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  { path: 'dashboard/admin', canActivate: [authGuard, roleGuard], data: { role: 'admin' }, loadComponent: () => import('./layout/app-shell/app-shell').then(m => m.AppShell), children: [
    { path: '', loadComponent: () => import('./features/dashboard/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard) },
    ...commonChildren,
    { path: 'guichets', loadComponent: () => import('./features/guichets/guichet-list/guichet-list').then(m => m.GuichetList) },
    { path: 'guichets/new', loadComponent: () => import('./features/guichets/guichet-form/guichet-form').then(m => m.GuichetForm) },
    { path: 'guichets/:id/edit', loadComponent: () => import('./features/guichets/guichet-form/guichet-form').then(m => m.GuichetForm) },
    { path: 'guichets/:id', loadComponent: () => import('./features/guichets/guichet-detail/guichet-detail').then(m => m.GuichetDetail) },
    { path: 'types-comptes', loadComponent: () => import('./features/types-comptes/type-compte-list/type-compte-list').then(m => m.TypeCompteList) },
    { path: 'types-comptes/new', loadComponent: () => import('./features/types-comptes/type-compte-form/type-compte-form').then(m => m.TypeCompteForm) },
    { path: 'types-comptes/:id/edit', loadComponent: () => import('./features/types-comptes/type-compte-form/type-compte-form').then(m => m.TypeCompteForm) },
    { path: 'types-comptes/:id', loadComponent: () => import('./features/types-comptes/type-compte-detail/type-compte-detail').then(m => m.TypeCompteDetail) },
    { path: 'agents/new', loadComponent: () => import('./features/agents/agent-form/agent-form').then(m => m.AgentForm) },
  ] },
  { path: 'dashboard/agent', canActivate: [authGuard, roleGuard], data: { role: 'agent' }, loadComponent: () => import('./layout/app-shell/app-shell').then(m => m.AppShell), children: [
    { path: '', loadComponent: () => import('./features/dashboard/agent-dashboard/agent-dashboard').then(m => m.AgentDashboard) },
    ...commonChildren,
    { path: 'guichets', loadComponent: () => import('./features/guichets/guichet-list/guichet-list').then(m => m.GuichetList) },
    { path: 'guichets/:id', loadComponent: () => import('./features/guichets/guichet-detail/guichet-detail').then(m => m.GuichetDetail) },
    { path: 'types-comptes', loadComponent: () => import('./features/types-comptes/type-compte-list/type-compte-list').then(m => m.TypeCompteList) },
    { path: 'types-comptes/:id', loadComponent: () => import('./features/types-comptes/type-compte-detail/type-compte-detail').then(m => m.TypeCompteDetail) },
  ] },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
