import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({ selector: 'app-login', imports: [FormsModule], templateUrl: './login.html', styleUrl: './login.css' })
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly error = this.auth.error;
  readonly loading = this.auth.loading;
  credentials = { email: '', password: '' };
  submitted = false;

  submit(form: NgForm): void {
    this.submitted = true;
    if (form.invalid || this.loading()) return;
    this.auth.login({ ...this.credentials, email: this.credentials.email.trim() }).subscribe({
      next: () => void this.router.navigateByUrl(this.safeReturnUrl()),
      error: () => undefined,
    });
  }

  private safeReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    return returnUrl?.startsWith('/dashboard/') ? returnUrl : this.auth.dashboardUrl();
  }
}
