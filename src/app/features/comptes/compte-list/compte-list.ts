import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompteService } from '../../../services/compte.service';
import { LoadingState } from '../../../shared/components/loading-state/loading-state';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
@Component({
  selector: 'app-compte-list',
  imports: [CurrencyPipe, RouterLink, LoadingState, ErrorState, EmptyState],
  templateUrl: './compte-list.html',
  styleUrl: './compte-list.css',
})
export class CompteList implements OnInit {
  readonly service = inject(CompteService);
  ngOnInit() {
    this.service.loadAll();
  }
}
