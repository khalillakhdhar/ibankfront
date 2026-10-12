import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({ selector: 'app-login', templateUrl: './login.html', styleUrl: './login.css' })
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly error = this.auth.error;

  submit(event: Event, username: string, password: string): void {
    event.preventDefault();
    if (this.auth.login(username.trim(), password)) {
      void this.router.navigateByUrl(this.auth.dashboardUrl());
    }
  }
}
