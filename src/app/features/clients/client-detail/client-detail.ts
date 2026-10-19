import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { LoadingState } from '../../../shared/components/loading-state/loading-state';
import { ErrorState } from '../../../shared/components/error-state/error-state';
@Component({
  selector: 'app-client-detail',
  imports: [CommonModule, RouterLink, LoadingState, ErrorState],
  templateUrl: './client-detail.html',
  styleUrl: './client-detail.css',
})
export class ClientDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ClientService);
  readonly client = this.service.selectedClient;
  readonly loading = this.service.loading;
  readonly error = this.service.error;
  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  ngOnInit() {
    this.load();
  }
  load() {
    if (Number.isInteger(this.id) && this.id > 0) this.service.loadById(this.id);
  }
}
