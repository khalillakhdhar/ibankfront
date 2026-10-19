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
  private readonly service = inject(ClientService);
  readonly clients = this.service.clients;
  readonly loading = this.service.loading;
  readonly error = this.service.error;
  readonly pendingDelete = signal<number | null>(null);
  readonly deleting = signal(false);
  searchTerm = '';
  ngOnInit(): void {
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
      },
      error: () => this.deleting.set(false),
    });
  }
}
