import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then((module) => module.Dashboard) },
      { path: 'clients', loadComponent: () => import('./features/clients/client-list/client-list').then((m) => m.ClientList) },
      { path: 'clients/new', loadComponent: () => import('./features/clients/client-form/client-form').then((m) => m.ClientForm) },
      { path: 'clients/:id/edit', loadComponent: () => import('./features/clients/client-form/client-form').then((m) => m.ClientForm) },
      { path: 'clients/:id', loadComponent: () => import('./features/clients/client-detail/client-detail').then((m) => m.ClientDetail) },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
