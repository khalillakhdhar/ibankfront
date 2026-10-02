import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { Depot, Retrait, Transaction, Virement } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5176/api/transactions';
  private readonly transactionsSignal = signal<Transaction[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly transactions = this.transactionsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  loadByCompte(compteId: number): void {
    this.errorSignal.set(null);
    this.loadingSignal.set(true);
    this.http.get<Transaction[]>(`${this.baseUrl}/compte/${compteId}`).pipe(
      tap((transactions) => {
        this.transactionsSignal.set(transactions);
        this.loadingSignal.set(false);
      }),
      catchError((error) => {
        this.loadingSignal.set(false);
        return this.handleError(error, 'An error occurred while loading transactions.');
      }),
    ).subscribe();
  }

  depot(depot: Depot) {
    return this.execute('depot', depot, 'An error occurred while making the deposit.');
  }

  retrait(retrait: Retrait) {
    return this.execute('retrait', retrait, 'An error occurred while making the withdrawal.');
  }

  virement(virement: Virement) {
    return this.execute('virement', virement, 'An error occurred while making the transfer.');
  }

  private execute(operation: string, payload: Depot | Retrait | Virement, fallback: string) {
    return this.http.post<Transaction>(`${this.baseUrl}/${operation}`, payload).pipe(
      tap((transaction) => this.transactionsSignal.update((transactions) => [transaction, ...transactions])),
      catchError((error) => this.handleError(error, fallback)),
    );
  }

  private handleError(error: { message?: string }, fallback: string) {
    this.errorSignal.set(error.message || fallback);
    return throwError(() => error);
  }
}
