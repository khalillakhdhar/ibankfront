import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuichetService } from '../../../services/guichet.service';
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-guichet-list',
  imports: [RouterLink],
  templateUrl: './guichet-list.html',
  styleUrl: './guichet-list.css',
})
export class GuichetList implements OnInit {
  private readonly service = inject(GuichetService);
  readonly auth = inject(AuthService);
  readonly items = this.service.guichets;
  readonly loading = this.service.loading;
  readonly error = this.service.error;
  ngOnInit() {
    this.service.loadAll();
  }
  remove(id: number) {
    if (confirm('Supprimer ce guichet ?')) this.service.delete(id).subscribe();
  }
}
