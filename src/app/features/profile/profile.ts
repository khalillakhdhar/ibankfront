import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiErrorService } from '../../core/services/api-error.service';
import { TwoFactorSetup, TwoFactorStatus } from '../../models/auth.model';
import { QR_RENDERER } from './qr-renderer';

type ManageAction = 'regenerate' | 'disable' | null;

@Component({
  selector: 'app-profile',
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private readonly auth = inject(AuthService);
  private readonly apiError = inject(ApiErrorService);
  private readonly renderQr = inject(QR_RENDERER);
  readonly user = this.auth.currentUser;
  readonly role = this.auth.role;

  // Secrets below live in memory only: never stored, never logged, cleared on cancel/destroy.
  readonly status = signal<TwoFactorStatus | null>(null);
  readonly statusError = signal<string | null>(null);
  readonly setup = signal<TwoFactorSetup | null>(null);
  readonly qrDataUrl = signal<string | null>(null);
  readonly recoveryCodes = signal<string[]>([]);

  readonly action = signal<ManageAction>(null);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  code = '';

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearSecrets());
    this.loadStatus();
  }

  loadStatus(): void {
    this.statusError.set(null);
    this.auth.twoFactorStatus().subscribe({
      next: (status) => this.status.set(status),
      error: () =>
        this.statusError.set('Impossible de charger le statut de la double authentification.'),
    });
  }

  startSetup(): void {
    this.clearSecrets();
    this.action.set(null);
    this.code = '';
    this.error.set(null);
    this.busy.set(true);
    this.auth.beginTwoFactorSetup().subscribe({
      next: (setup) => {
        this.busy.set(false);
        this.setup.set(setup);
        this.renderQr(setup.authenticatorUri).then(
          (url) => {
            if (this.setup() === setup) this.qrDataUrl.set(url);
          },
          () => this.qrDataUrl.set(null), // manual key remains available
        );
      },
      error: (e) => this.fail(e, 'Impossible de démarrer la configuration.'),
    });
  }

  cancelSetup(): void {
    this.clearSecrets();
    this.code = '';
    this.error.set(null);
  }

  enable(): void {
    const code = this.normalized();
    if (!code || this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    this.auth.enableTwoFactor(code).subscribe({
      next: (result) => {
        this.busy.set(false);
        this.setup.set(null);
        this.qrDataUrl.set(null);
        this.code = '';
        this.recoveryCodes.set(result.recoveryCodes);
        this.status.set({ enabled: true, recoveryCodesLeft: result.recoveryCodes.length });
      },
      error: (e) => this.fail(e, 'Code invalide. Vérifiez le code affiché dans votre application.'),
    });
  }

  openAction(action: Exclude<ManageAction, null>): void {
    this.clearSecrets();
    this.action.set(action);
    this.code = '';
    this.error.set(null);
  }

  cancelAction(): void {
    this.action.set(null);
    this.code = '';
    this.error.set(null);
  }

  confirmAction(): void {
    const code = this.normalized();
    const action = this.action();
    if (!code || !action || this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    if (action === 'regenerate') {
      this.auth.generateRecoveryCodes(code).subscribe({
        next: (result) => {
          this.busy.set(false);
          this.action.set(null);
          this.code = '';
          this.recoveryCodes.set(result.recoveryCodes);
          this.status.update((s) => s && { ...s, recoveryCodesLeft: result.recoveryCodes.length });
        },
        error: (e) => this.fail(e, 'Code invalide. Les codes de récupération sont inchangés.'),
      });
    } else {
      this.auth.disableTwoFactor(code).subscribe({
        next: () => {
          this.busy.set(false);
          this.action.set(null);
          this.code = '';
          this.clearSecrets();
          this.status.set({ enabled: false, recoveryCodesLeft: 0 });
        },
        error: (e) => this.fail(e, 'Code invalide. La double authentification reste activée.'),
      });
    }
  }

  dismissRecoveryCodes(): void {
    this.recoveryCodes.set([]);
  }

  private normalized(): string {
    return this.code.replace(/\s+/g, '');
  }

  private fail(error: unknown, fallback: string): void {
    this.busy.set(false);
    this.error.set(this.apiError.message(error, fallback));
  }

  private clearSecrets(): void {
    this.setup.set(null);
    this.qrDataUrl.set(null);
    this.recoveryCodes.set([]);
  }
}
