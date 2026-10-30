import { Component, computed, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly error = this.auth.error;
  readonly loading = this.auth.loading;
  // The challenge lives in memory only, so a reload (no challenge) shows the credentials form.
  readonly twoFactorStep = computed(() => this.auth.twoFactorChallenge() !== null);
  credentials = { email: '', password: '' };
  twoFactor = { code: '' };
  useRecoveryCode = false;
  submitted = false;
  codeSubmitted = false;

  submit(form: NgForm): void {
    this.submitted = true;
    if (form.invalid || this.loading()) return;
    this.auth.login({ ...this.credentials, email: this.credentials.email.trim() }).subscribe({
      next: (result) => {
        if (result.status === 'authenticated') this.finish();
        else this.resetCodeStep();
      },
      error: () => undefined,
    });
  }

  submitCode(form: NgForm): void {
    this.codeSubmitted = true;
    if (form.invalid || this.loading()) return;
    this.auth.completeTwoFactorLogin(this.twoFactor.code, this.useRecoveryCode).subscribe({
      next: () => {
        // Ignore a completion that arrives after the challenge was cancelled.
        if (this.twoFactorStep()) this.finish();
      },
      error: () => undefined,
    });
  }

  toggleRecoveryCode(): void {
    this.useRecoveryCode = !this.useRecoveryCode;
    this.resetCodeStep();
  }

  cancel(): void {
    this.auth.cancelTwoFactorLogin();
    this.credentials.password = '';
    this.submitted = false;
    this.useRecoveryCode = false;
    this.resetCodeStep();
  }

  private resetCodeStep(): void {
    this.twoFactor.code = '';
    this.codeSubmitted = false;
  }

  private finish(): void {
    void this.router.navigateByUrl(this.safeReturnUrl());
  }

  private safeReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    return returnUrl?.startsWith('/dashboard/') ? returnUrl : this.auth.dashboardUrl();
  }
}
