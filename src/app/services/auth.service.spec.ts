import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/config/api.config';
import { SessionStorageService } from '../core/services/session-storage.service';
import { AuthResponse, LoginResult } from '../models/auth.model';
import { AuthService } from './auth.service';

const API = 'http://api.test/api';

const session: AuthResponse = {
  token: 'jwt-token',
  expiration: new Date(Date.now() + 3_600_000).toISOString(),
  user: {
    id: 'u1',
    nom: 'Doe',
    prenom: 'Jane',
    email: 'jane@bank.test',
    guichetId: null,
    isActive: true,
    roles: ['Admin'],
  },
};

describe('AuthService two-factor client', () => {
  let service: AuthService;
  let http: HttpTestingController;
  let storage: {
    read: ReturnType<typeof vi.fn>;
    write: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    storage = { read: vi.fn(() => null), write: vi.fn(), clear: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: API },
        { provide: SessionStorageService, useValue: storage },
      ],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  const startChallenge = () => {
    service.login({ email: 'a@b.c', password: 'pw' }).subscribe();
    http
      .expectOne(`${API}/Auth/login`)
      .flush({ requiresTwoFactor: true, twoFactorChallenge: 'challenge-1' });
  };

  it('persists and exposes the session for a normal login', () => {
    let result: LoginResult | undefined;
    service.login({ email: 'a@b.c', password: 'pw' }).subscribe((r) => (result = r));
    http.expectOne(`${API}/Auth/login`).flush({ session, requiresTwoFactor: false });

    expect(result).toEqual({ status: 'authenticated', session });
    expect(storage.write).toHaveBeenCalledWith(session);
    expect(service.token()).toBe('jwt-token');
    expect(service.twoFactorChallenge()).toBeNull();
  });

  it('keeps the challenge in memory only and does not persist when 2FA is required', () => {
    let result: LoginResult | undefined;
    service.login({ email: 'a@b.c', password: 'pw' }).subscribe((r) => (result = r));
    http
      .expectOne(`${API}/Auth/login`)
      .flush({ requiresTwoFactor: true, twoFactorChallenge: 'challenge-1' });

    expect(result).toEqual({ status: 'twoFactorRequired' });
    expect(service.twoFactorChallenge()).toBe('challenge-1');
    expect(storage.write).not.toHaveBeenCalled();
    expect(service.session()).toBeNull();
    expect(JSON.stringify(result)).not.toContain('challenge-1');
  });

  it('persists the session and clears the challenge once 2FA completes', () => {
    startChallenge();
    let got: AuthResponse | undefined;
    service.completeTwoFactorLogin(' 123 456 ', false).subscribe((s) => (got = s));
    const req = http.expectOne(`${API}/Auth/login/2fa`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ twoFactorChallenge: 'challenge-1', code: '123456' });
    req.flush(session);

    expect(got).toEqual(session);
    expect(storage.write).toHaveBeenCalledWith(session);
    expect(service.twoFactorChallenge()).toBeNull();
    expect(service.token()).toBe('jwt-token');
  });

  it('sends recovery codes trimmed in the same code field with no extra flag', () => {
    startChallenge();
    service.completeTwoFactorLogin('  abcd-efgh  ', true).subscribe();
    const req = http.expectOne(`${API}/Auth/login/2fa`);
    expect(req.request.body).toEqual({ twoFactorChallenge: 'challenge-1', code: 'abcd-efgh' });
    req.flush(session);
  });

  it('fails without a request when no challenge is pending', () => {
    let failed = false;
    service.completeTwoFactorLogin('123456', false).subscribe({ error: () => (failed = true) });
    expect(failed).toBe(true);
    http.expectNone(`${API}/Auth/login/2fa`);
  });

  it('keeps the challenge and does not persist when the code is rejected', () => {
    startChallenge();
    service.completeTwoFactorLogin('000000', false).subscribe({ error: () => undefined });
    http
      .expectOne(`${API}/Auth/login/2fa`)
      .flush({ message: 'Code ou jeton invalide.' }, { status: 400, statusText: 'Bad Request' });

    expect(storage.write).not.toHaveBeenCalled();
    expect(service.twoFactorChallenge()).toBe('challenge-1');
    expect(service.error()).toBeTruthy();
  });

  it('clears the challenge on cancel and on logout', () => {
    startChallenge();
    service.cancelTwoFactorLogin();
    expect(service.twoFactorChallenge()).toBeNull();

    startChallenge();
    service.logout();
    expect(service.twoFactorChallenge()).toBeNull();
  });

  it('maps the 2FA management endpoints', () => {
    const results: unknown[] = [];
    service.twoFactorStatus().subscribe((r) => results.push(r));
    const status = http.expectOne(`${API}/Auth/2fa/status`);
    expect(status.request.method).toBe('GET');
    status.flush({ enabled: true, recoveryCodesLeft: 4 });

    service.beginTwoFactorSetup().subscribe((r) => results.push(r));
    const setup = http.expectOne(`${API}/Auth/2fa/setup`);
    expect(setup.request.method).toBe('POST');
    setup.flush({ sharedKey: 'KEY', authenticatorUri: 'otpauth://totp/x' });

    service.enableTwoFactor('123456').subscribe((r) => results.push(r));
    const enable = http.expectOne(`${API}/Auth/2fa/enable`);
    expect(enable.request.body).toEqual({ code: '123456' });
    enable.flush({ recoveryCodes: ['a', 'b'] });

    service.generateRecoveryCodes('654321').subscribe((r) => results.push(r));
    const codes = http.expectOne(`${API}/Auth/2fa/recovery-codes`);
    expect(codes.request.body).toEqual({ code: '654321' });
    codes.flush({ recoveryCodes: ['c'] });

    let disabled = false;
    service.disableTwoFactor('111111').subscribe(() => (disabled = true));
    const disable = http.expectOne(`${API}/Auth/2fa/disable`);
    expect(disable.request.body).toEqual({ code: '111111' });
    disable.flush(null, { status: 204, statusText: 'No Content' });

    expect(results).toEqual([
      { enabled: true, recoveryCodesLeft: 4 },
      { sharedKey: 'KEY', authenticatorUri: 'otpauth://totp/x' },
      { recoveryCodes: ['a', 'b'] },
      { recoveryCodes: ['c'] },
    ]);
    expect(disabled).toBe(true);
  });
});
