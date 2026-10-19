import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CompteService } from '../../../services/compte.service';
import { TransactionService } from '../../../services/transaction.service';
@Component({
  selector: 'app-compte-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './compte-detail.html',
  styleUrl: './compte-detail.css',
})
export class CompteDetail implements OnInit {
  private s = inject(CompteService);
  private tx = inject(TransactionService);
  private r = inject(ActivatedRoute);
  id = Number(this.r.snapshot.paramMap.get('id'));
  readonly item = this.s.selectedCompte;
  readonly transactions = this.tx.transactions;
  readonly loading = this.s.loading;
  readonly error = this.s.error;
  ngOnInit() {
    this.s.loadById(this.id);
    this.tx.loadByCompte(this.id);
  }
}
