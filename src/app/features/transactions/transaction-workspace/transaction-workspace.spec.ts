import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { CompteService } from '../../../services/compte.service';
import { TransactionService } from '../../../services/transaction.service';
import { TransactionWorkspace } from './transaction-workspace';
describe('TransactionWorkspace', () => {
  it('normalizes description and prevents duplicate pending operations', () => {
    let body: any,
      calls = 0;
    const pending = new Subject<any>();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: CompteService,
          useValue: {
            comptes: signal([
              { id: 1, numeroCompte: 'TN1', isActive: true },
              { id: 2, numeroCompte: 'TN2', isActive: true },
            ]),
            loading: signal(false),
            error: signal('Chargement des comptes impossible.'),
            loadAll: () => {},
          },
        },
        {
          provide: TransactionService,
          useValue: {
            transactions: signal([]),
            loading: signal(false),
            error: signal('Opération refusée.'),
            depot: (v: any) => {
              body = v;
              calls++;
              return pending;
            },
            retrait: () => pending,
            virement: () => pending,
            loadByCompte: () => {},
          },
        },
      ],
    });
    const f = TestBed.createComponent(TransactionWorkspace);
    f.componentInstance.depotForm.setValue({ compteId: 1, montant: 10, description: '' });
    f.componentInstance.submitDepot();
    f.componentInstance.submitDepot();
    expect(calls).toBe(1);
    expect(body.description).toBeNull();
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Chargement des comptes impossible.');
    expect(f.nativeElement.textContent).toContain('Opération refusée.');
  });
});
