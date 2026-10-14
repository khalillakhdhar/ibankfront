import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';

@Component({ selector: 'app-shell', imports: [RouterOutlet, Header, Sidebar], templateUrl: './app-shell.html', styleUrl: './app-shell.css' })
export class AppShell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly role = this.auth.role;
  readonly user = this.auth.currentUser;
  readonly base = computed(() => '/dashboard/' + this.role());
  readonly menuOpen = signal(false);
  toggleMenu(): void { this.menuOpen.update(value => !value); }
  closeMenu(): void { this.menuOpen.set(false); }
  logout(): void { this.auth.logout(); void this.router.navigateByUrl('/login'); }
}
