import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { CreateClient, UpdateClient } from '../../../models/client.model';
@Component({
  selector: 'app-client-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './client-form.html',
  styleUrl: './client-form.css',
})
export class ClientForm implements OnInit {
  private readonly service = inject(ClientService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly edit = Number.isInteger(this.id) && this.id > 0;
  readonly submitting = signal(false);
  error: string | null = null;
  submitted = false;
  model: {
    cin: string;
    nom: string;
    prenom: string;
    dateNaissance: string;
    email: string;
    telephone: string;
    adresse: string;
    isActive: boolean;
  } = {
    cin: '',
    nom: '',
    prenom: '',
    dateNaissance: '',
    email: '',
    telephone: '',
    adresse: '',
    isActive: true,
  };
  constructor() {
    effect(() => {
      const c = this.service.selectedClient();
      if (this.edit && c?.id === this.id)
        this.model = {
          cin: c.cin,
          nom: c.nom,
          prenom: c.prenom,
          dateNaissance: c.dateNaissance ?? '',
          email: c.email ?? '',
          telephone: c.telephone,
          adresse: c.adresse ?? '',
          isActive: c.isActive,
        };
    });
  }
  ngOnInit() {
    if (this.edit) this.service.loadById(this.id);
  }
  submit(form: NgForm) {
    this.submitted = true;
    if (form.invalid || this.submitting()) return;
    this.submitting.set(true);
    this.error = null;
    const common = {
      nom: this.model.nom.trim(),
      prenom: this.model.prenom.trim(),
      dateNaissance: this.model.dateNaissance || null,
      email: this.model.email.trim() || null,
      telephone: this.model.telephone.trim(),
      adresse: this.model.adresse.trim() || null,
    };
    const failed = () => {
      this.error = this.service.error();
      this.submitting.set(false);
    };
    if (this.edit) {
      this.service
        .update(this.id, { ...common, isActive: this.model.isActive } as UpdateClient)
        .subscribe({
          next: () => void this.router.navigate(['../../', this.id], { relativeTo: this.route }),
          error: failed,
        });
    } else {
      this.service.create({ ...common, cin: this.model.cin.trim() } as CreateClient).subscribe({
        next: (created) =>
          void this.router.navigate(['../', created.id], { relativeTo: this.route }),
        error: failed,
      });
    }
  }
}
