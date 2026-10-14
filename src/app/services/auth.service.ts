import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../core/config/api.config';
import { ApiErrorService } from '../core/services/api-error.service';
import { SessionStorageService } from '../core/services/session-storage.service';
import { AuthResponse, Login, User } from '../models/auth.model';

export type AppRole = 'admin' | 'agent';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);
  private readonly storage = inject(SessionStorageService);
  private readonly apiError = inject(ApiErrorService);
  private readonly sessionSignal = signal<AuthResponse | null>(this.storage.read());

  readonly session = this.sessionSignal.asReadonly();
  readonly currentUser = computed<User | null>(() => this.sessionSignal()?.user ?? null);
  readonly token = computed<string | null>(() => this.sessionSignal()?.token ?? null);
  readonly role = computed<AppRole | null>(() => this.normalizedRole(this.currentUser()?.roles));
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  login(credentials: Login): Observable<AuthResponse> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/login`, credentials).pipe(
      tap((session) => {
        this.storage.write(session);
        this.sessionSignal.set(session);
      }),
      catchError((error) => {
        this.error.set(this.apiError.message(error, 'Email ou mot de passe incorrect.'));
        return throwError(() => error);
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  logout(): void {
    this.storage.clear();
    this.sessionSignal.set(null);
    this.error.set(null);
  }

  dashboardUrl(): '/dashboard/admin' | '/dashboard/agent' | '/login' {
    const role = this.role();
    return role ? `/dashboard/${role}` : '/login';
  }

  hasRole(role: AppRole): boolean {
    return this.role() === role;
  }

  private normalizedRole(roles: string[] | undefined): AppRole | null {
    const values = roles?.map((role) => role.toLowerCase()) ?? [];
    if (values.includes('admin')) return 'admin';
    if (values.includes('agent')) return 'agent';
    return null;
  }
}
