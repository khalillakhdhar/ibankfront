import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { routes } from '../../app.routes';
import { authGuard } from './auth.guard';
import { roleGuard } from './role.guard';

describe('route guards', () => {
  const authenticated = signal(false);
  const auth: Pick<AuthService, 'isAuthenticated' | 'hasRole'> = {
    isAuthenticated: authenticated,
    hasRole: (role: string) => role === 'Admin',
  };

  beforeEach(() => {
    authenticated.set(false);
    TestBed.configureTestingModule({ providers: [{ provide: AuthService, useValue: auth }] });
  });

  it('returns a login UrlTree with returnUrl for an unauthenticated user', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/clients/4' } as RouterStateSnapshot),
    );
    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe(
      '/login?returnUrl=%2Fclients%2F4',
    );
  });

  it('allows an authenticated user', () => {
    authenticated.set(true);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/dashboard' } as RouterStateSnapshot),
    );
    expect(result).toBe(true);
  });

  it('rejects an expired session restored as unauthenticated', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/dashboard' } as RouterStateSnapshot),
    );
    expect(result).toBeInstanceOf(UrlTree);
  });

  it('redirects an Agent away from an Admin route', () => {
    auth.hasRole = () => false;
    const route = { data: { roles: ['Admin'] } } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as RouterStateSnapshot));
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/dashboard');
  });

  it('allows an Admin on an Admin route', () => {
    auth.hasRole = (role: string) => role === 'Admin';
    const route = { data: { roles: ['Admin'] } } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as RouterStateSnapshot));
    expect(result).toBe(true);
  });

  it('declares login, protected shell, dashboard, and wildcard routes', () => {
    expect(routes.some((route) => route.path === 'login' && !!route.loadComponent)).toBe(true);
    const shell = routes.find((route) => route.path === '');
    expect(shell?.canActivate).toContain(authGuard);
    expect(shell?.children?.some((route) => route.path === 'dashboard')).toBe(true);
    expect(routes.at(-1)).toEqual(expect.objectContaining({ path: '**', redirectTo: 'dashboard' }));
  });
});
