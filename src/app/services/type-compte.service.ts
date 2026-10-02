import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { CreateTypeCompte, TypeCompte, UpdateTypeCompte } from '../models/type-compte.model';

@Injectable({ providedIn: 'root' })
export class TypeCompteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5176/api/typescomptes';
  private readonly typesCompteSignal = signal<TypeCompte[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly selectedTypeCompteSignal = signal<TypeCompte | null>(null);

  readonly typesCompte = this.typesCompteSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly selectedTypeCompte = this.selectedTypeCompteSignal.asReadonly();
  readonly totalTypesCompte = computed(() => this.typesCompteSignal().length);
  readonly activeTypesCompte = computed(() => this.typesCompteSignal().filter((type) => type.isActive).length);

  loadAll(): void {
    this.startLoading();
    this.http.get<TypeCompte[]>(this.baseUrl).pipe(
      tap((types) => this.finishLoading(() => this.typesCompteSignal.set(types))),
      catchError((error) => this.handleLoadError(error, 'An error occurred while loading account types.')),
    ).subscribe();
  }

  loadById(id: number): void {
    this.startLoading();
    this.http.get<TypeCompte>(`${this.baseUrl}/${id}`).pipe(
      tap((type) => this.finishLoading(() => this.selectedTypeCompteSignal.set(type))),
      catchError((error) => this.handleLoadError(error, 'An error occurred while loading the account type.')),
    ).subscribe();
  }

  create(type: CreateTypeCompte) {
    return this.http.post<TypeCompte>(this.baseUrl, type).pipe(
      tap((created) => this.typesCompteSignal.update((types) => [...types, created])),
      catchError((error) => this.handleError(error, 'An error occurred while creating the account type.')),
    );
  }

  update(id: number, type: UpdateTypeCompte) {
    return this.http.put<void>(`${this.baseUrl}/${id}`, type).pipe(
      tap(() => this.typesCompteSignal.update((types) => types.map((item) =>
        item.id === id ? { ...item, ...type } : item,
      ))),
      catchError((error) => this.handleError(error, 'An error occurred while updating the account type.')),
    );
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.typesCompteSignal.update((types) => types.filter((type) => type.id !== id))),
      catchError((error) => this.handleError(error, 'An error occurred while deleting the account type.')),
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
