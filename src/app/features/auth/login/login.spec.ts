import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthResponse } from '../../../models/auth.model';
import { AuthService } from '../../../services/auth.service';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let pending: Subject<AuthResponse>;
  let calls: number;
  const auth = {
    error: signal<string | null>(null),
    isAuthenticated: signal(false),
    login: () => {
      calls += 1;
      return pending.asObservable();
    },
  };

  beforeEach(async () => {
    pending = new Subject<AuthResponse>();
    calls = 0;
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: AuthService, useValue: auth },
        provideRouter([
          { path: '', component: Login },
          { path: 'dashboard', component: Login },
        ]),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
  });

  it('requires a valid email and a password', () => {
    fixture.componentInstance.form.setValue({ email: 'not-an-email', password: '' });
    expect(fixture.componentInstance.form.invalid).toBe(true);
    fixture.componentInstance.form.setValue({ email: 'admin@bank.local', password: 'Admin123!' });
    expect(fixture.componentInstance.form.valid).toBe(true);
  });

  it('submits only once while login is pending', () => {
    fixture.componentInstance.form.setValue({ email: 'admin@bank.local', password: 'Admin123!' });
    fixture.componentInstance.submit();
    fixture.componentInstance.submit();
    expect(calls).toBe(1);
    expect(fixture.componentInstance.submitting()).toBe(true);
  });

  it('shows the backend login error', () => {
    auth.error.set('Email ou mot de passe invalide.');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Email ou mot de passe invalide.');
  });

  it('redirects to the requested URL after login', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/?returnUrl=%2Fdashboard');
    fixture.componentInstance.form.setValue({ email: 'admin@bank.local', password: 'Admin123!' });
    fixture.componentInstance.submit();
    pending.next({
      token: 'jwt',
      expiration: new Date(Date.now() + 1000).toISOString(),
      user: {
        id: '1',
        nom: 'Admin',
        prenom: 'Test',
        email: 'admin@bank.local',
        guichetId: null,
        isActive: true,
        roles: ['Admin'],
      },
    });
    pending.complete();
    await fixture.whenStable();
    expect(router.url).toBe('/dashboard');
  });
});
