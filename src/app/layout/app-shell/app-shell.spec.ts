import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppShell } from './app-shell';

describe('AppShell', () => {
  const user = signal({
    id: '1',
    nom: 'Administrateur',
    prenom: 'Principal',
    email: 'admin@bank.local',
    guichetId: null,
    isActive: true,
    roles: ['Admin'],
  });
  const auth: {
    user: typeof user;
    hasRole: (role: string) => boolean;
    logout: () => void;
  } = {
    user,
    hasRole: (role: string) => role === 'Admin',
    logout: () => undefined,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [
        { provide: AuthService, useValue: auth },
        provideRouter([{ path: 'login', component: AppShell }]),
      ],
    }).compileComponents();
  });

  it('shows Agent links and Admin-only navigation for an Admin', () => {
    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Clients');
    expect(text).toContain('Comptes');
    expect(text).toContain('Transactions');
    expect(text).toContain('Guichets');
    expect(text).toContain('Types de comptes');
    expect(text).toContain('Agents');
  });

  it('hides Admin-only navigation for an Agent', () => {
    auth.hasRole = () => false;
    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Guichets');
  });

  it('toggles the mobile navigation', () => {
    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();
    expect(fixture.componentInstance.menuOpen()).toBe(false);
    fixture.componentInstance.toggleMenu();
    expect(fixture.componentInstance.menuOpen()).toBe(true);
  });

  it('logs out and redirects to login', async () => {
    let loggedOut = false;
    auth.logout = () => {
      loggedOut = true;
    };
    const fixture = TestBed.createComponent(AppShell);
    fixture.componentInstance.logout();
    await fixture.whenStable();
    expect(loggedOut).toBe(true);
    expect(TestBed.inject(Router).url).toBe('/login');
  });
});
