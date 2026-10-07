import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ClientService } from '../../services/client.service';
import { CompteService } from '../../services/compte.service';
import { GuichetService } from '../../services/guichet.service';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { LoadingState } from '../../shared/components/loading-state/loading-state';

@Component({ selector: 'app-dashboard', imports: [CurrencyPipe, RouterLink, ErrorState, LoadingState], templateUrl: './dashboard.html', styleUrl: './dashboard.css' })
export class Dashboard implements OnInit {
  readonly clientsService = inject(ClientService);
  readonly comptesService = inject(CompteService);
  readonly guichetsService = inject(GuichetService);
  private readonly auth = inject(AuthService);
  readonly isAdmin = this.auth.hasRole('Admin');
  readonly activeClients = computed(() => this.clientsService.clients().filter((item) => item.isActive).length);
  readonly activeAccounts = computed(() => this.comptesService.comptes().filter((item) => item.isActive).length);
  readonly totalBalance = computed(() => this.comptesService.comptes().reduce((sum, item) => sum + item.solde, 0));
  readonly activeBranches = computed(() => this.guichetsService.guichets().filter((item) => item.isActive).length);
  ngOnInit(): void { this.clientsService.loadAll(); this.comptesService.loadAll(); if (this.isAdmin) this.guichetsService.loadAll(); }
  reload(): void { this.ngOnInit(); }
}
