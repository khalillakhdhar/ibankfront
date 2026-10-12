import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ClientService } from '../../services/client.service';
import { CompteService } from '../../services/compte.service';
import { GuichetService } from '../../services/guichet.service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let clientLoads = 0;
  let compteLoads = 0;
  let guichetLoads = 0;
  const clients = signal([
    { id: 1, isActive: true },
    { id: 2, isActive: false },
  ]);
  const comptes = signal([
    { id: 1, isActive: true, solde: 1250 },
    { id: 2, isActive: true, solde: 750 },
  ]);
  const guichets = signal([{ id: 1, isActive: true }]);
  const auth: { hasRole: (role: string) => boolean } = {
    hasRole: (role: string) => role === 'Admin',
  };

  beforeEach(() => {
    clientLoads = compteLoads = guichetLoads = 0;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
        {
          provide: ClientService,
          useValue: {
            clients,
            loading: signal(false),
            error: signal(null),
            loadAll: () => clientLoads++,
          },
        },
        {
          provide: CompteService,
          useValue: {
            comptes,
            loading: signal(false),
            error: signal(null),
            loadAll: () => compteLoads++,
          },
        },
        {
          provide: GuichetService,
          useValue: {
            guichets,
            loading: signal(false),
            error: signal(null),
            loadAll: () => guichetLoads++,
          },
        },
      ],
    });
  });

  it('loads real resources and derives the visible metrics', () => {
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    expect([clientLoads, compteLoads, guichetLoads]).toEqual([1, 1, 1]);
    expect(fixture.componentInstance.totalBalance()).toBe(2000);
    expect(fixture.componentInstance.activeAccounts()).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Guichets actifs');
  });

  it('does not load or show Admin resources to an Agent', () => {
    auth.hasRole = () => false;
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    expect(guichetLoads).toBe(0);
    expect(fixture.nativeElement.textContent).not.toContain('Guichets actifs');
  });

  it('emits confirm and cancel decisions from the shared confirmation', () => {
    const fixture = TestBed.createComponent(ConfirmDialog);
    let confirmed = 0;
    let cancelled = 0;
    fixture.componentInstance.confirm.subscribe(() => confirmed++);
    fixture.componentInstance.cancel.subscribe(() => cancelled++);
    fixture.componentInstance.confirm.emit();
    fixture.componentInstance.cancel.emit();
    expect([confirmed, cancelled]).toEqual([1, 1]);
  });
});
