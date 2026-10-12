import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CompteService } from '../../../services/compte.service';
import { TransactionService } from '../../../services/transaction.service';
@Component({
  selector: 'app-compte-detail',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './compte-detail.html',
  styleUrl: './compte-detail.css',
})
export class CompteDetail implements OnInit {
  readonly comptes = inject(CompteService);
  readonly transactions = inject(TransactionService);
  private route = inject(ActivatedRoute);
  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  ngOnInit() {
    this.comptes.loadById(this.id);
    this.transactions.loadByCompte(this.id);
  }
  toggle() {
    const c = this.comptes.selectedCompte();
    if (c)
      this.comptes
        .update(c.id, { isActive: !c.isActive })
        .subscribe(() => this.comptes.loadById(c.id));
  }
}
