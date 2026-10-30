import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';
import { AuthResponse, LoginResult } from '../../../models/auth.model';
import { AuthService } from '../../../services/auth.service';
import { Login } from './login';

const session = { token: 't' } as AuthResponse;

describe('Login two-step flow', () => {
  let fixture: ComponentFixture<Login>;
  let challenge: ReturnType<typeof signal<string | null>>;
  let error: ReturnType<typeof signal<string | null>>;
  let auth: {
    twoFactorChallenge: ReturnType<typeof challenge.asReadonly>;
    error: typeof error;
    loading: ReturnType<typeof signal<boolean>>;
    login: ReturnType<typeof vi.fn>;
    completeTwoFactorLogin: ReturnType<typeof vi.fn>;
    cancelTwoFactorLogin: ReturnType<typeof vi.fn>;
    dashboardUrl: ReturnType<typeof vi.fn>;
  };
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };

  const el = (): HTMLElement => fixture.nativeElement;
  const q = <T extends HTMLElement>(s: string): T | null => el().querySelector<T>(s);
  const type = (selector: string, value: string): void => {
    const input = q<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  const submit = async (): Promise<void> => {
    q<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const click = async (selector: string): Promise<void> => {
    q<HTMLElement>(selector)!.click();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const fillCredentialsAndSubmit = async (): Promise<void> => {
    type('#email', 'jane@bank.test');
    type('#password', 'Secret123!');
    await fixture.whenStable();
    await submit();
  };

  async function create(): Promise<void> {
    fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    challenge = signal<string | null>(null);
    error = signal<string | null>(null);
    auth = {
      twoFactorChallenge: challenge.asReadonly(),
      error,
      loading: signal(false),
      login: vi.fn((): Observable<LoginResult> => {
        challenge.set('challenge-token');
        return of({ status: 'twoFactorRequired' });
      }),
      completeTwoFactorLogin: vi.fn(() => of(session)),
      cancelTwoFactorLogin: vi.fn(() => {
        challenge.set(null);
        error.set(null);
      }),
      dashboardUrl: vi.fn(() => '/dashboard/admin'),
    };
    router = { navigateByUrl: vi.fn(() => Promise.resolve(true)) };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
      ],
    }).compileComponents();
  });

  it('shows the code step after the password without navigating', async () => {
    await create();
    await fillCredentialsAndSubmit();

    expect(auth.login).toHaveBeenCalledWith({ email: 'jane@bank.test', password: 'Secret123!' });
    expect(q('#code')).not.toBeNull();
    expect(q('#password')).toBeNull();
    expect(q<HTMLInputElement>('#code')!.getAttribute('inputmode')).toBe('numeric');
    expect(q<HTMLInputElement>('#code')!.getAttribute('autocomplete')).toBe('one-time-code');
    expect(el().querySelector('label[for="code"]')).not.toBeNull();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('navigates once to the dashboard after a valid code', async () => {
    await create();
    await fillCredentialsAndSubmit();
    type('#code', '123456');
    await fixture.whenStable();
    await submit();

    expect(auth.completeTwoFactorLogin).toHaveBeenCalledWith('123456', false);
    expect(router.navigateByUrl).toHaveBeenCalledTimes(1);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard/admin');
  });

  it('navigates directly when login returns a full session', async () => {
    auth.login.mockReturnValue(of({ status: 'authenticated', session }));
    await create();
    await fillCredentialsAndSubmit();

    expect(router.navigateByUrl).toHaveBeenCalledTimes(1);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard/admin');
  });

  it('submits a recovery code after switching mode', async () => {
    await create();
    await fillCredentialsAndSubmit();
    await click('[data-test="toggle-recovery"]');
    type('#code', 'ABCD-1234');
    await fixture.whenStable();
    await submit();

    expect(auth.completeTwoFactorLogin).toHaveBeenCalledWith('ABCD-1234', true);
    expect(router.navigateByUrl).toHaveBeenCalledTimes(1);
  });

  it('can switch back from recovery mode to the authenticator code', async () => {
    await create();
    await fillCredentialsAndSubmit();
    await click('[data-test="toggle-recovery"]');
    expect(q('[data-test="toggle-recovery"]')!.textContent).toContain('application');
    await click('[data-test="toggle-recovery"]');
    type('#code', '654321');
    await fixture.whenStable();
    await submit();
    expect(auth.completeTwoFactorLogin).toHaveBeenCalledWith('654321', false);
  });

  it('stays on step two and shows the error on an invalid code', async () => {
    auth.completeTwoFactorLogin.mockImplementation(() => {
      error.set('Code de vérification invalide.');
      return throwError(() => new Error('401'));
    });
    await create();
    await fillCredentialsAndSubmit();
    type('#code', '000000');
    await fixture.whenStable();
    await submit();

    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(q('#code')).not.toBeNull();
    expect(q('[role="alert"]')!.textContent).toContain('Code de vérification invalide.');
  });

  it('does not call the service for an empty code', async () => {
    await create();
    await fillCredentialsAndSubmit();
    await submit();

    expect(auth.completeTwoFactorLogin).not.toHaveBeenCalled();
    expect(q('.field-error')).not.toBeNull();
  });

  it('cancel returns to the credentials form', async () => {
    await create();
    await fillCredentialsAndSubmit();
    await click('[data-test="cancel-2fa"]');

    expect(auth.cancelTwoFactorLogin).toHaveBeenCalledTimes(1);
    expect(q('#password')).not.toBeNull();
    expect(q('#code')).toBeNull();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('falls back to credentials when there is no pending challenge', async () => {
    await create();

    expect(q('#password')).not.toBeNull();
    expect(q('#code')).toBeNull();
    expect(auth.completeTwoFactorLogin).not.toHaveBeenCalled();
  });

  it('falls back to credentials if the challenge disappears while on step two', async () => {
    await create();
    await fillCredentialsAndSubmit();
    challenge.set(null);
    fixture.detectChanges();

    expect(q('#password')).not.toBeNull();
    expect(q('#code')).toBeNull();
  });

  it('disables submit and ignores double submits while loading', async () => {
    const pending = new Subject<AuthResponse>();
    auth.completeTwoFactorLogin.mockImplementation(() => {
      auth.loading.set(true);
      return pending;
    });
    await create();
    await fillCredentialsAndSubmit();
    type('#code', '123456');
    await fixture.whenStable();
    await submit();

    expect(q<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true);
    await submit();
    expect(auth.completeTwoFactorLogin).toHaveBeenCalledTimes(1);
  });

  it('exposes the error in an aria-live region', async () => {
    await create();
    await fillCredentialsAndSubmit();
    expect(q('[aria-live="assertive"]')).not.toBeNull();
    expect(q<HTMLInputElement>('#code')!.getAttribute('maxlength')).toBe('7');
  });
});
