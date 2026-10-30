import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Profile } from './profile';
import { QR_RENDERER } from './qr-renderer';

const URI = 'otpauth://totp/IBank:jane@bank.test?secret=ABCDEFGH&issuer=IBank';
const user = {
  id: 'u1',
  prenom: 'Jane',
  nom: 'Doe',
  email: 'jane@bank.test',
  guichetId: null,
  isActive: true,
  roles: ['agent'],
};

describe('Profile two-factor management', () => {
  let fixture: ComponentFixture<Profile>;
  let auth: Record<string, unknown> & {
    twoFactorStatus: ReturnType<typeof vi.fn>;
    beginTwoFactorSetup: ReturnType<typeof vi.fn>;
    enableTwoFactor: ReturnType<typeof vi.fn>;
    generateRecoveryCodes: ReturnType<typeof vi.fn>;
    disableTwoFactor: ReturnType<typeof vi.fn>;
  };
  let qr: ReturnType<typeof vi.fn>;
  let setItem: ReturnType<typeof vi.spyOn>;
  let consoleSpies: ReturnType<typeof vi.spyOn>[];

  const el = (): HTMLElement => fixture.nativeElement;
  const q = <T extends HTMLElement>(s: string): T | null => el().querySelector<T>(s);
  const flush = async (): Promise<void> => {
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const click = async (s: string): Promise<void> => {
    q<HTMLElement>(s)!.click();
    await flush();
  };
  const type = async (s: string, value: string): Promise<void> => {
    const input = q<HTMLInputElement>(s)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await flush();
  };
  const submit = async (s: string): Promise<void> => {
    q<HTMLFormElement>(s)!.dispatchEvent(new Event('submit'));
    await flush();
  };
  const create = async (): Promise<void> => {
    fixture = TestBed.createComponent(Profile);
    fixture.detectChanges();
    await flush();
  };
  const openSetup = async (): Promise<void> => {
    await click('[data-test="start-setup"]');
  };
  const http400 = (message?: string) =>
    throwError(
      () => new HttpErrorResponse({ status: 400, error: message ? { message } : undefined }),
    );

  beforeEach(() => {
    auth = {
      currentUser: signal(user).asReadonly(),
      role: signal('agent').asReadonly(),
      twoFactorStatus: vi.fn(() => of({ enabled: false, recoveryCodesLeft: 0 })),
      beginTwoFactorSetup: vi.fn(() => of({ sharedKey: 'ABCD EFGH', authenticatorUri: URI })),
      enableTwoFactor: vi.fn(() => of({ recoveryCodes: ['aaaaa-11111', 'bbbbb-22222'] })),
      generateRecoveryCodes: vi.fn(() => of({ recoveryCodes: ['ccccc-33333'] })),
      disableTwoFactor: vi.fn(() => of(undefined)),
    };
    qr = vi.fn(() => Promise.resolve('data:image/png;base64,QR'));
    setItem = vi.spyOn(Storage.prototype, 'setItem');
    consoleSpies = [
      vi.spyOn(console, 'log').mockImplementation(() => undefined),
      vi.spyOn(console, 'error').mockImplementation(() => undefined),
    ];
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: QR_RENDERER, useValue: qr },
      ],
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it('loads and shows the disabled status', async () => {
    await create();
    expect(auth.twoFactorStatus).toHaveBeenCalledTimes(1);
    expect(el().textContent).toContain('Désactivée');
    expect(q('[data-test="start-setup"]')).not.toBeNull();
  });

  it('shows enabled status with remaining recovery codes', async () => {
    auth.twoFactorStatus.mockReturnValue(of({ enabled: true, recoveryCodesLeft: 7 }));
    await create();
    expect(el().textContent).toContain('Activée');
    expect(q('[data-test="recovery-left"]')!.textContent).toContain('7');
    expect(q('[data-test="start-setup"]')).toBeNull();
  });

  it('shows an alert when the status cannot be loaded', async () => {
    auth.twoFactorStatus.mockReturnValue(throwError(() => new Error('x')));
    await create();
    expect(q('[role="alert"]')!.textContent).toContain('statut');
  });

  it('renders a QR code from the exact otpauth URI and the manual key', async () => {
    await create();
    await openSetup();
    expect(qr).toHaveBeenCalledWith(URI);
    expect(q<HTMLImageElement>('img.qr')!.src).toBe('data:image/png;base64,QR');
    expect(q('[data-test="manual-key"]')!.textContent).toContain('ABCD EFGH');
  });

  it('keeps the manual key when QR generation fails', async () => {
    qr.mockRejectedValue(new Error('boom'));
    await create();
    await openSetup();
    expect(q('img.qr')).toBeNull();
    expect(q('[data-test="manual-key"]')!.textContent).toContain('ABCD EFGH');
  });

  it('shows setup API errors', async () => {
    auth.beginTwoFactorSetup.mockReturnValue(http400('Déjà activée.'));
    await create();
    await openSetup();
    expect(q('[role="alert"]')!.textContent).toContain('Déjà activée.');
  });

  it('enables with the confirmation code and shows recovery codes once', async () => {
    await create();
    await openSetup();
    await type('#setup-code', '123 456');
    await submit('[data-test="enable-form"]');
    expect(auth.enableTwoFactor).toHaveBeenCalledWith('123456');
    expect(q('img.qr')).toBeNull();
    expect(q('[data-test="manual-key"]')).toBeNull();
    expect(el().textContent).toContain('aaaaa-11111');
    expect(el().textContent).toContain('Enregistrez ces codes maintenant');
    expect(el().textContent).toContain('Activée');

    await click('[data-test="codes-done"]');
    expect(el().textContent).not.toContain('aaaaa-11111');
  });

  it('keeps the setup open and alerts on an invalid enable code', async () => {
    auth.enableTwoFactor.mockReturnValue(http400('Code invalide.'));
    await create();
    await openSetup();
    await type('#setup-code', '000000');
    await submit('[data-test="enable-form"]');
    expect(q('[role="alert"]')!.textContent).toContain('Code invalide.');
    expect(q('[data-test="manual-key"]')).not.toBeNull();
  });

  it('falls back to a generic message for a plain 400', async () => {
    auth.enableTwoFactor.mockReturnValue(http400());
    await create();
    await openSetup();
    await type('#setup-code', '000000');
    await submit('[data-test="enable-form"]');
    expect(q('[role="alert"]')!.textContent).toContain('Code invalide');
  });

  it('clears secrets when setup is cancelled', async () => {
    await create();
    await openSetup();
    await click('[data-test="cancel-setup"]');
    expect(q('img.qr')).toBeNull();
    expect(q('[data-test="manual-key"]')).toBeNull();
    expect(el().textContent).not.toContain('ABCD EFGH');
  });

  describe('when enabled', () => {
    beforeEach(() => {
      auth.twoFactorStatus.mockReturnValue(of({ enabled: true, recoveryCodesLeft: 3 }));
    });

    it('regenerates recovery codes with a valid code', async () => {
      await create();
      await click('[data-test="open-regenerate"]');
      await type('#action-code', '654321');
      await submit('[data-test="action-form"]');
      expect(auth.generateRecoveryCodes).toHaveBeenCalledWith('654321');
      expect(el().textContent).toContain('ccccc-33333');
    });

    it('shows regenerate errors', async () => {
      auth.generateRecoveryCodes.mockReturnValue(http400('Mauvais code.'));
      await create();
      await click('[data-test="open-regenerate"]');
      await type('#action-code', '654321');
      await submit('[data-test="action-form"]');
      expect(q('[role="alert"]')!.textContent).toContain('Mauvais code.');
      expect(el().textContent).not.toContain('ccccc-33333');
    });

    it('disables two-factor with a valid code', async () => {
      await create();
      await click('[data-test="open-disable"]');
      await type('#action-code', '111222');
      await submit('[data-test="action-form"]');
      expect(auth.disableTwoFactor).toHaveBeenCalledWith('111222');
      expect(el().textContent).toContain('Désactivée');
      expect(q('[data-test="open-disable"]')).toBeNull();
    });

    it('shows disable errors and stays enabled', async () => {
      auth.disableTwoFactor.mockReturnValue(http400('Refusé.'));
      await create();
      await click('[data-test="open-disable"]');
      await type('#action-code', '111222');
      await submit('[data-test="action-form"]');
      expect(q('[role="alert"]')!.textContent).toContain('Refusé.');
      expect(el().textContent).toContain('Activée');
    });
  });

  it('clears secrets on destroy and never persists or logs them', async () => {
    await create();
    await openSetup();
    await type('#setup-code', '123456');
    await submit('[data-test="enable-form"]');
    const component = fixture.componentInstance;
    expect(component.recoveryCodes().length).toBe(2);
    fixture.destroy();
    expect(component.recoveryCodes()).toEqual([]);
    expect(component.setup()).toBeNull();
    expect(component.qrDataUrl()).toBeNull();
    expect(setItem).not.toHaveBeenCalled();
    consoleSpies.forEach((s) => expect(s).not.toHaveBeenCalled());
  });
});
