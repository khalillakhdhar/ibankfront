import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { Compte, CreateCompte, UpdateCompte } from '../models/compte.model';

@Injectable({ providedIn: 'root' })
export class CompteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5176/api/comptes';
  private readonly comptesSignal = signal<Compte[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly selectedCompteSignal = signal<Compte | null>(null);

  readonly comptes = this.comptesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly selectedCompte = this.selectedCompteSignal.asReadonly();
  readonly totalComptes = computed(() => this.comptesSignal().length);
  readonly activeComptes = computed(() => this.comptesSignal().filter((compte) => compte.isActive).length);
  readonly totalSolde = computed(() => this.comptesSignal().reduce((total, compte) => total + compte.solde, 0));

  loadAll(): void {
    this.startLoading();
    this.http.get<Compte[]>(this.baseUrl).pipe(
      tap((comptes) => this.finishLoading(() => this.comptesSignal.set(comptes))),
      catchError((error) => this.handleLoadError(error, 'An error occurred while loading accounts.')),
    ).subscribe();
  }

  loadById(id: number): void {
    this.startLoading();
    this.http.get<Compte>(`${this.baseUrl}/${id}`).pipe(
      tap((compte) => this.finishLoading(() => this.selectedCompteSignal.set(compte))),
      catchError((error) => this.handleLoadError(error, 'An error occurred while loading the account.')),
    ).subscribe();
  }

  create(compte: CreateCompte) {
    return this.http.post<Compte>(this.baseUrl, compte).pipe(
      tap((created) => this.comptesSignal.update((comptes) => [...comptes, created])),
      catchError((error) => this.handleError(error, 'An error occurred while creating the account.')),
    );
  }

  update(id: number, compte: UpdateCompte) {
    return this.http.put<void>(`${this.baseUrl}/${id}`, compte).pipe(
      tap(() => this.comptesSignal.update((comptes) => comptes.map((item) =>
        item.id === id ? { ...item, ...compte } : item,
      ))),
      catchError((error) => this.handleError(error, 'An error occurred while updating the account.')),
    );
  }

  private startLoading(): void {
    this.errorSignal.set(null);
    this.loadingSignal.set(true);
  }

  private finishLoading(updateState: () => void): void {
    updateState();
    this.loadingSignal.set(false);
  }

  private handleLoadError(error: { message?: string }, fallback: string) {
    this.loadingSignal.set(false);
    return this.handleError(error, fallback);
  }

  private handleError(error: { message?: string }, fallback: string) {
    this.errorSignal.set(error.message || fallback);
    return throwError(() => error);
  }
}
