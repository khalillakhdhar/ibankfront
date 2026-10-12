import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService local demo', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('accepts only the two demo accounts', () => {
    const auth = TestBed.inject(AuthService);
    expect(auth.login('admin', 'admin')).toBe(true);
    expect(auth.role()).toBe('admin');
    auth.logout();
    expect(auth.login('agent', 'agent')).toBe(true);
    expect(auth.role()).toBe('agent');
    auth.logout();
    expect(auth.login('admin', 'wrong')).toBe(false);
    expect(auth.role()).toBeNull();
  });

  it('restores valid roles and clears unknown values', () => {
    localStorage.setItem('ibank.demo.role', 'agent');
    expect(TestBed.inject(AuthService).dashboardUrl()).toBe('/dashboard/agent');
    TestBed.resetTestingModule();
    localStorage.setItem('ibank.demo.role', 'owner');
    expect(TestBed.inject(AuthService).role()).toBeNull();
    expect(localStorage.getItem('ibank.demo.role')).toBeNull();
  });
});
