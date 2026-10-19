import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CompteService } from '../../../services/compte.service';
@Component({
  selector: 'app-compte-list',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './compte-list.html',
  styleUrl: './compte-list.css',
})
export class CompteList implements OnInit {
  private s = inject(CompteService);
  readonly items = this.s.comptes;
  readonly loading = this.s.loading;
  readonly error = this.s.error;
  term = '';
  readonly filtered = computed(() => {
    const q = this.term.toLowerCase().trim();
    return q
      ? this.items().filter(
          (c) =>
            c.numeroCompte.toLowerCase().includes(q) ||
            c.clientNomComplet.toLowerCase().includes(q),
        )
      : this.items();
  });
  ngOnInit() {
    this.s.loadAll();
  }
}
