import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { ClientService } from '../../../services/client.service';

@Component({
  selector: 'app-client-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './client-form.html',
  styleUrl: './client-form.css',
})
export class ClientForm implements OnInit {
  readonly service = inject(ClientService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly submitting = signal(false);
  readonly id = Number(this.route.snapshot.paramMap.get('id')) || null;
  readonly form = new FormGroup({
    cin: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(20)],
    }),
    nom: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(80)],
    }),
    prenom: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(80)],
    }),
    dateNaissance: new FormControl(''),
    email: new FormControl('', [Validators.email, Validators.maxLength(150)]),
    telephone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(30)],
    }),
    adresse: new FormControl('', Validators.maxLength(250)),
    isActive: new FormControl(true, { nonNullable: true }),
  });
  constructor() {
    effect(() => {
      const client = this.service.selectedClient();
      if (this.id && client?.id === this.id) {
        this.form.patchValue(client, { emitEvent: false });
      }
    });
  }
  ngOnInit(): void {
    if (this.id) this.service.loadById(this.id);
  }
  submit(): void {
    if (this.form.invalid || this.submitting()) return;
    const value = this.form.getRawValue();
    const common = {
      nom: value.nom,
      prenom: value.prenom,
      dateNaissance: value.dateNaissance || null,
      email: value.email?.trim() || null,
      telephone: value.telephone,
      adresse: value.adresse?.trim() || null,
    };
    this.submitting.set(true);
    const request: Observable<unknown> = this.id
      ? this.service.update(this.id, { ...common, isActive: value.isActive })
      : this.service.create({ cin: value.cin, ...common });
    request
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl('/clients'),
        error: () => undefined,
      });
  }
}
