import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';

@Component({ selector: 'app-login', templateUrl: './login.html', styleUrl: './login.css', imports: [FormsModule] })
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route=inject(ActivatedRoute);
  readonly error = this.auth.error;
  readonly loading = this.auth.loading
  credentials = { email: '', password: '' };
  submitted = false;

  submit(form:NgForm): void {
    this.submitted = true;
    if (form.invalid || this.loading())  return;
    this.credentials.email = this.credentials.email.trim();
    this.credentials.password = this.credentials.password.trim();
   this.auth.login(this.credentials).subscribe({
      next: (response:any) => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || this.auth.dashboardUrl();
        this.router.navigateByUrl(returnUrl);
      },
      error: (error:any) => {
        this.auth.error.set(error);
      },
    });
  }
}
