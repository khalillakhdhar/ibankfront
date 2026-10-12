import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Header, Sidebar],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
})
export class AppShell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly user = this.auth.user;
  readonly menuOpen = signal(false);

  isAdmin(): boolean {
    return this.auth.hasRole('Admin');
  }
  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }
  closeMenu(): void {
    this.menuOpen.set(false);
  }
  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
