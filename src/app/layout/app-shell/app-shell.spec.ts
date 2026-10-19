import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppShell } from './app-shell';

describe('AppShell', () => {
  it('builds role-relative navigation for the current session', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { role: signal('agent'), logout: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();
    expect(fixture.componentInstance.base()).toBe('/dashboard/agent');
  });
});
