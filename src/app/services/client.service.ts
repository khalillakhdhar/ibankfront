import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { Client, ClientDetails, CreateClient, UpdateClient } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5176/api/clients';
  private readonly clientsSignal = signal<Client[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly selectedClientSignal = signal<ClientDetails | null>(null);

  readonly clients = this.clientsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly selectedClient = this.selectedClientSignal.asReadonly();
  readonly totalClients = computed(() => this.clientsSignal().length);
  readonly activeClients = computed(() => this.clientsSignal().filter((client) => client.isActive).length);
  readonly inactiveClients = computed(() => this.clientsSignal().filter((client) => !client.isActive).length);
  readonly activeCount = this.activeClients;
  readonly hasClients = computed(() => this.clientsSignal().length > 0);

  loadAll(): void {
    this.startLoading();
    this.http.get<Client[]>(this.baseUrl).pipe(
      tap((clients) => this.finishLoading(() => this.clientsSignal.set(clients))),
      catchError((error) => this.handleLoadError(error, 'An error occurred while loading clients.')),
    ).subscribe();
  }

  loadById(id: number): void {
    this.startLoading();
    this.http.get<ClientDetails>(`${this.baseUrl}/${id}`).pipe(
      tap((client) => this.finishLoading(() => this.selectedClientSignal.set(client))),
      catchError((error) => this.handleLoadError(error, 'An error occurred while loading the client.')),
    ).subscribe();
  }

  search(term: string): void {
    this.startLoading();
    this.http.get<Client[]>(`${this.baseUrl}/search`, { params: { term } }).pipe(
      tap((clients) => this.finishLoading(() => this.clientsSignal.set(clients))),
      catchError((error) => this.handleLoadError(error, 'An error occurred while searching clients.')),
    ).subscribe();
  }

  create(client: CreateClient) {
    return this.http.post<Client>(this.baseUrl, client).pipe(
      tap((created) => this.clientsSignal.update((clients) => [...clients, created])),
      catchError((error) => this.handleError(error, 'An error occurred while creating the client.')),
    );
  }

  update(id: number, client: UpdateClient) {
    return this.http.put<void>(`${this.baseUrl}/${id}`, client).pipe(
      tap(() => this.clientsSignal.update((clients) => clients.map((item) =>
        item.id === id ? { ...item, ...client } : item,
      ))),
      catchError((error) => this.handleError(error, 'An error occurred while updating the client.')),
    );
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.clientsSignal.update((clients) => clients.filter((client) => client.id !== id))),
      catchError((error) => this.handleError(error, 'An error occurred while deleting the client.')),
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
