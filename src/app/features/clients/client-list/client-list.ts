import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { LoadingState } from '../../../shared/components/loading-state/loading-state';

@Component({
  selector: 'app-client-list',
  imports: [FormsModule, RouterLink, ConfirmDialog, EmptyState, ErrorState, LoadingState],
  templateUrl: './client-list.html',
  styleUrl: './client-list.css',
})
export class ClientList implements OnInit {
  private readonly service = inject(ClientService); // injection de service DI
  readonly clients = this.service.clients; // variable signal pour stocker la liste des clients
  readonly loading = this.service.loading; // controle de lecture asynchrone
  readonly error = this.service.error; // variable signal pour stocker les erreurs
  readonly pendingDelete = signal<number | null>(null); // variable signal pour stocker l'ID du client à supprimer
  readonly deleting = signal(false);
  busy = signal(false);
  searchTerm = ''; // aucune recherche par défaut
  ngOnInit(): void { // onInit début de cycle de vie du composant
    this.service.loadAll();
  }
  search(): void {
    const term = this.searchTerm.trim();
    term ? this.service.search(term) : this.service.loadAll();
  }
  reset(): void {
    this.searchTerm = '';
    this.service.loadAll();
  }
  remove(): void {
    const id = this.pendingDelete();
    if (!id || this.deleting()) return;
    this.deleting.set(true);
    this.service.delete(id).subscribe({
      next: () => {
        this.pendingDelete.set(null);
        this.deleting.set(false);
        this.busy.set(false);
      },
      error: () => this.deleting.set(false),
    });
  }
}
