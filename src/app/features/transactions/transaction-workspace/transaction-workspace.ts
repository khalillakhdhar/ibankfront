import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { CompteService } from '../../../services/compte.service';
import { TransactionService } from '../../../services/transaction.service';
@Component({
  selector: 'app-transaction-workspace',
  imports: [ReactiveFormsModule],
  templateUrl: './transaction-workspace.html',
  styleUrl: './transaction-workspace.css',
})
export class TransactionWorkspace implements OnInit {
  readonly comptes = inject(CompteService);
  readonly service = inject(TransactionService);
  private route = inject(ActivatedRoute);
  readonly tab = signal<'depot' | 'retrait' | 'virement'>('depot');
  readonly pending = signal(false);
  readonly depotForm = this.operationForm();
  readonly retraitForm = this.operationForm();
  readonly virementForm = new FormGroup({
    compteSourceId: new FormControl(0, { nonNullable: true, validators: [Validators.min(1)] }),
    compteDestinationId: new FormControl(0, { nonNullable: true, validators: [Validators.min(1)] }),
    montant: new FormControl(0, { nonNullable: true, validators: [Validators.min(0.01)] }),
    description: new FormControl(''),
  });
  ngOnInit() {
    this.comptes.loadAll();
    const id = Number(this.route.snapshot.queryParamMap.get('compteId'));
    if (id) {
      this.depotForm.controls.compteId.setValue(id);
      this.retraitForm.controls.compteId.setValue(id);
      this.virementForm.controls.compteSourceId.setValue(id);
    }
  }
  private operationForm() {
    return new FormGroup({
      compteId: new FormControl(0, { nonNullable: true, validators: [Validators.min(1)] }),
      montant: new FormControl(0, { nonNullable: true, validators: [Validators.min(0.01)] }),
      description: new FormControl(''),
    });
  }
  submitDepot() {
    this.execute(this.depotForm, () => this.service.depot(this.payload(this.depotForm)));
  }
  submitRetrait() {
    this.execute(this.retraitForm, () => this.service.retrait(this.payload(this.retraitForm)));
  }
  submitVirement() {
    if (
      this.virementForm.controls.compteSourceId.value ===
      this.virementForm.controls.compteDestinationId.value
    ) {
      this.virementForm.setErrors({ sameAccount: true });
      return;
    }
    const v = this.virementForm.getRawValue();
    this.execute(this.virementForm, () =>
      this.service.virement({ ...v, description: v.description?.trim() || null }),
    );
  }
  private payload(form: typeof this.depotForm) {
    const v = form.getRawValue();
    return { ...v, description: v.description?.trim() || null };
  }
  private execute(form: FormGroup, request: () => Observable<unknown>) {
    if (form.invalid || this.pending()) return;
    this.pending.set(true);
    request()
      .pipe(finalize(() => this.pending.set(false)))
      .subscribe({ error: () => {} });
  }
}
