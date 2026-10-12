import { Injectable, signal } from '@angular/core';

export type DemoRole = 'admin' | 'agent';
const ROLE_KEY = 'ibank.demo.role';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly roleSignal = signal<DemoRole | null>(this.restore());
  readonly role = this.roleSignal.asReadonly();
  readonly error = signal<string | null>(null);

  login(username: string, password: string): boolean {
    const role = username === 'admin' && password === 'admin'
      ? 'admin'
      : username === 'agent' && password === 'agent'
        ? 'agent'
        : null;
    if (!role) {
      this.error.set('Identifiant ou mot de passe incorrect.');
      return false;
    }
    localStorage.setItem(ROLE_KEY, role);
    this.roleSignal.set(role);
    this.error.set(null);
    return true;
  }

  logout(): void {
    localStorage.removeItem(ROLE_KEY);
    this.roleSignal.set(null);
    this.error.set(null);
  }

  dashboardUrl(): '/dashboard/admin' | '/dashboard/agent' | '/login' {
    const role = this.role();
    return role ? `/dashboard/${role}` : '/login';
  }

  hasRole(role: DemoRole): boolean {
    return this.role() === role;
  }

  private restore(): DemoRole | null {
    const role = localStorage.getItem(ROLE_KEY);
    if (role === 'admin' || role === 'agent') return role;
    localStorage.removeItem(ROLE_KEY);
    return null;
  }
}
