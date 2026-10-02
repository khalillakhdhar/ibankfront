import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { CreateGuichet, Guichet, UpdateGuichet } from '../models/guichet.model';

@Injectable({ providedIn: 'root' })
export class GuichetService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5176/api/guichets';
  private readonly guichetsSignal = signal<Guichet[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly selectedGuichetSignal = signal<Guichet | null>(null);

  readonly guichets = this.guichetsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly selectedGuichet = this.selectedGuichetSignal.asReadonly();
  readonly totalGuichets = computed(() => this.guichetsSignal().length);
  readonly activeGuichets = computed(() => this.guichetsSignal().filter((guichet) => guichet.isActive).length);

  loadAll(): void {
    this.startLoading();
    this.http.get<Guichet[]>(this.baseUrl).pipe(
      tap((guichets) => this.finishLoading(() => this.guichetsSignal.set(guichets))),
      catchError((error) => this.handleLoadError(error, 'An error occurred while loading branches.')),
    ).subscribe();
  }

  loadById(id: number): void {
    this.startLoading();
    this.http.get<Guichet>(`${this.baseUrl}/${id}`).pipe(
      tap((guichet) => this.finishLoading(() => this.selectedGuichetSignal.set(guichet))),
      catchError((error) => this.handleLoadError(error, 'An error occurred while loading the branch.')),
    ).subscribe();
  }

  create(guichet: CreateGuichet) {
    return this.http.post<Guichet>(this.baseUrl, guichet).pipe(
      tap((created) => this.guichetsSignal.update((guichets) => [...guichets, created])),
      catchError((error) => this.handleError(error, 'An error occurred while creating the branch.')),
    );
  }

  update(id: number, guichet: UpdateGuichet) {
    return this.http.put<void>(`${this.baseUrl}/${id}`, guichet).pipe(
      tap(() => this.guichetsSignal.update((guichets) => guichets.map((item) =>
        item.id === id ? { ...item, ...guichet } : item,
      ))),
      catchError((error) => this.handleError(error, 'An error occurred while updating the branch.')),
    );
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.guichetsSignal.update((guichets) => guichets.filter((guichet) => guichet.id !== id))),
      catchError((error) => this.handleError(error, 'An error occurred while deleting the branch.')),
    );
  }

  private startLoading(): void { this.errorSignal.set(null); this.loadingSignal.set(true); }
  private finishLoading(updateState: () => void): void { updateState(); this.loadingSignal.set(false); }
  private handleLoadError(error: { message?: string }, fallback: string) {
    this.loadingSignal.set(false);
    return this.handleError(error, fallback);
  }
  private handleError(error: { message?: string }, fallback: string) {
    this.errorSignal.set(error.message || fallback);
    return throwError(() => error);
  }
}
