import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { CompteService } from '../../../services/compte.service';
import { GuichetService } from '../../../services/guichet.service';
import { TypeCompteService } from '../../../services/type-compte.service';

@Component({
  selector: 'app-compte-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './compte-form.html',
  styleUrl: './compte-form.css',
})
export class CompteForm implements OnInit {
  private readonly service = inject(CompteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clientService = inject(ClientService);
  private readonly guichetService = inject(GuichetService);
  private readonly typeService = inject(TypeCompteService);
  readonly clients = this.clientService.clients;
  readonly guichets = this.guichetService.guichets;
  readonly types = this.typeService.typesCompte;
  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly edit = this.id > 0;
  readonly busy = signal(false);
  error: string | null = null;
  model = {
    numeroCompte: '',
    soldeInitial: 0,
    clientId: 0,
    typeCompteId: 0,
    guichetId: 0,
    isActive: true,
  };
  constructor() {
    effect(() => {
      const account = this.service.selectedCompte();
      if (this.edit && account)
        this.model = {
          numeroCompte: account.numeroCompte,
          soldeInitial: account.solde,
          clientId: account.clientId,
          typeCompteId: account.typeCompteId,
          guichetId: account.guichetId,
          isActive: account.isActive,
        };
    });
  }
  ngOnInit() {
    if (this.edit) this.service.loadById(this.id);
    else {
      this.clientService.loadAll();
      this.guichetService.loadAll();
      this.typeService.loadAll();
    }
  }
  submit(form: NgForm) {
    if (
      form.invalid ||
      this.busy() ||
      (!this.edit &&
        (this.model.clientId < 1 || this.model.typeCompteId < 1 || this.model.guichetId < 1))
    )
      return;
    this.busy.set(true);
    const fail = () => {
      this.error = this.service.error();
      this.busy.set(false);
    };
    if (this.edit)
      this.service.update(this.id, { isActive: this.model.isActive }).subscribe({
        next: () => void this.router.navigate(['../../', this.id], { relativeTo: this.route }),
        error: fail,
      });
    else
      this.service
        .create({ ...this.model, numeroCompte: this.model.numeroCompte.trim() })
        .subscribe({
          next: (account) =>
            void this.router.navigate(['../', account.id], { relativeTo: this.route }),
          error: fail,
        });
  }
}
