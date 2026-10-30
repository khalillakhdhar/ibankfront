import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, map, Observable, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../core/config/api.config';
import { ApiErrorService } from '../core/services/api-error.service';
import { SessionStorageService } from '../core/services/session-storage.service';
import {
  AuthResponse,
  Login,
  LoginApiResponse,
  LoginResult,
  TwoFactorRecoveryCodes,
  TwoFactorSetup,
  TwoFactorStatus,
  User,
} from '../models/auth.model';

export type AppRole = 'admin' | 'agent';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);
  private readonly storage = inject(SessionStorageService);
  private readonly apiError = inject(ApiErrorService);
  private readonly sessionSignal = signal<AuthResponse | null>(this.storage.read());
  // In-memory only: the pending 2FA challenge must never reach web storage.
  private readonly challengeSignal = signal<string | null>(null);

  readonly session = this.sessionSignal.asReadonly();
  readonly twoFactorChallenge = this.challengeSignal.asReadonly();
  readonly currentUser = computed<User | null>(() => this.sessionSignal()?.user ?? null);
  readonly token = computed<string | null>(() => this.sessionSignal()?.token ?? null);
  readonly role = computed<AppRole | null>(() => this.normalizedRole(this.currentUser()?.roles));
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  login(credentials: Login): Observable<LoginResult> {
    this.loading.set(true);
    this.error.set(null);
    this.challengeSignal.set(null);
    return this.http.post<LoginApiResponse>(`${this.apiUrl}/Auth/login`, credentials).pipe(
      map((response): LoginResult => {
        if (response.requiresTwoFactor) {
          if (!response.twoFactorChallenge) throw new Error('Missing two-factor challenge.');
          this.challengeSignal.set(response.twoFactorChallenge);
          return { status: 'twoFactorRequired' };
        }
        if (!response.session) throw new Error('Missing session.');
        this.startSession(response.session);
        return { status: 'authenticated', session: response.session };
      }),
      catchError((error) => {
        this.error.set(this.apiError.message(error, 'Email ou mot de passe incorrect.'));
        return throwError(() => error);
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  completeTwoFactorLogin(code: string, useRecoveryCode: boolean): Observable<AuthResponse> {
    const twoFactorChallenge = this.challengeSignal();
    if (!twoFactorChallenge) {
      return throwError(() => new Error('No pending two-factor challenge.'));
    }
    this.loading.set(true);
    this.error.set(null);
    // The server takes a TOTP or a recovery code in the same field; the flag only drives
    // client-side normalisation (authenticator codes may be typed with spaces).
    const normalized = useRecoveryCode ? code.trim() : code.replace(/\s+/g, '');
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/Auth/login/2fa`, {
        twoFactorChallenge,
        code: normalized,
      })
      .pipe(
        tap((session) => {
          // Cancelled (or superseded) while in flight: never create a session afterwards.
          if (this.challengeSignal() !== twoFactorChallenge) {
            throw new Error('Two-factor login was cancelled.');
          }
          this.startSession(session);
          this.challengeSignal.set(null);
        }),
        catchError((error) => {
          if (this.challengeSignal() === twoFactorChallenge) {
            this.error.set(this.apiError.message(error, 'Code de vérification invalide.'));
          }
          return throwError(() => error);
        }),
        finalize(() => this.loading.set(false)),
      );
  }

  cancelTwoFactorLogin(): void {
    this.challengeSignal.set(null);
    this.error.set(null);
  }

  twoFactorStatus(): Observable<TwoFactorStatus> {
    return this.http.get<TwoFactorStatus>(`${this.apiUrl}/Auth/2fa/status`);
  }

  beginTwoFactorSetup(): Observable<TwoFactorSetup> {
    return this.http.post<TwoFactorSetup>(`${this.apiUrl}/Auth/2fa/setup`, {});
  }

  enableTwoFactor(code: string): Observable<TwoFactorRecoveryCodes> {
    return this.http.post<TwoFactorRecoveryCodes>(`${this.apiUrl}/Auth/2fa/enable`, { code });
  }

  generateRecoveryCodes(code: string): Observable<TwoFactorRecoveryCodes> {
    return this.http.post<TwoFactorRecoveryCodes>(`${this.apiUrl}/Auth/2fa/recovery-codes`, {
      code,
    });
  }

  disableTwoFactor(code: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/Auth/2fa/disable`, { code });
  }

  logout(): void {
    this.storage.clear();
    this.sessionSignal.set(null);
    this.challengeSignal.set(null);
    this.error.set(null);
  }

  dashboardUrl(): '/dashboard/admin' | '/dashboard/agent' | '/login' {
    const role = this.role();
    return role ? `/dashboard/${role}` : '/login';
  }

  hasRole(role: AppRole): boolean {
    return this.role() === role;
  }

  private startSession(session: AuthResponse): void {
    this.storage.write(session);
    this.sessionSignal.set(session);
  }

  private normalizedRole(roles: string[] | undefined): AppRole | null {
    const values = roles?.map((role) => role.toLowerCase()) ?? [];
    if (values.includes('admin')) return 'admin';
    if (values.includes('agent')) return 'agent';
    return null;
  }
}
