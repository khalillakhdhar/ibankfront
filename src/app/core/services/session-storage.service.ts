import { Injectable } from '@angular/core';
import { AuthResponse } from '../../models/auth.model';

const SESSION_KEY = 'ibank.session';

@Injectable({ providedIn: 'root' })
export class SessionStorageService {
  read(): AuthResponse | null {
    const value = localStorage.getItem(SESSION_KEY);
    if (!value) return null;

    try {
      const session = JSON.parse(value) as Partial<AuthResponse>;
      if (!this.isValid(session)) {
        this.clear();
        return null;
      }
      return session;
    } catch {
      this.clear();
      return null;
    }
  }

  write(session: AuthResponse): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  clear(): void {
    localStorage.removeItem(SESSION_KEY);
  }

  private isValid(session: Partial<AuthResponse>): session is AuthResponse {
    const expiration =
      typeof session.expiration === 'string' ? Date.parse(session.expiration) : NaN;
    const user = session.user;
    return (
      typeof session.token === 'string' &&
      session.token.length > 0 &&
      Number.isFinite(expiration) &&
      expiration > Date.now() &&
      !!user &&
      typeof user.id === 'string' &&
      typeof user.nom === 'string' &&
      typeof user.prenom === 'string' &&
      typeof user.email === 'string' &&
      (typeof user.guichetId === 'number' || user.guichetId === null) &&
      typeof user.isActive === 'boolean' &&
      user.isActive &&
      Array.isArray(user.roles) &&
      user.roles.length > 0 &&
      user.roles.every((role) => typeof role === 'string')
    );
  }
}
