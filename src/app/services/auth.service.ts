import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../core/config/api.config';
import { ApiErrorService } from '../core/services/api-error.service';
import { SessionStorageService } from '../core/services/session-storage.service';
import { AuthResponse, CreateAgent, Login, User } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly storage = inject(SessionStorageService);
  private readonly apiError = inject(ApiErrorService);
  private readonly sessionSignal = signal<AuthResponse | null>(this.storage.read());
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly user = computed(() => this.sessionSignal()?.user ?? null);
  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  login(credentials: Login): Observable<AuthResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/Auth/login`, credentials).pipe(
      tap((session) => {
        this.storage.write(session);
        this.sessionSignal.set(session);
      }),
      catchError((error) => {
        this.errorSignal.set(this.apiError.message(error, 'Connexion impossible.'));
        return throwError(() => error);
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  createAgent(agent: CreateAgent): Observable<User> {
    this.errorSignal.set(null);
    return this.http.post<User>(`${this.apiBaseUrl}/Auth/agents`, agent).pipe(
      catchError((error) => {
        this.errorSignal.set(this.apiError.message(error, "Impossible de créer l'agent."));
        return throwError(() => error);
      }),
    );
  }

  logout(): void {
    this.storage.clear();
    this.sessionSignal.set(null);
    this.errorSignal.set(null);
  }

  token(): string | null {
    return this.sessionSignal()?.token ?? null;
  }

  hasRole(role: string): boolean {
    return this.user()?.roles.includes(role) ?? false;
  }
}
