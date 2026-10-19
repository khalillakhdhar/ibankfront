import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { authGuard } from './auth.guard';
import { roleGuard } from './role.guard';

describe('role guards', () => {
  it('redirects unauthenticated users to login', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { role: signal(null) } }],
    });
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/dashboard/agent' } as RouterStateSnapshot),
    );
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toContain('/login');
  });
  it('keeps an agent out of admin routes', () => {
    const auth = {
      role: signal('agent'),
      hasRole: () => false,
      dashboardUrl: () => '/dashboard/agent',
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
    const route = { data: { role: 'admin' } } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as RouterStateSnapshot));
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/dashboard/agent');
  });
});
