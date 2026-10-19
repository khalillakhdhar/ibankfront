import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GuichetService } from '../../../services/guichet.service';
@Component({
  selector: 'app-guichet-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './guichet-form.html',
  styleUrl: './guichet-form.css',
})
export class GuichetForm implements OnInit {
  private s = inject(GuichetService);
  private r = inject(ActivatedRoute);
  private router = inject(Router);
  id = Number(this.r.snapshot.paramMap.get('id'));
  edit = this.id > 0;
  busy = signal(false);
  error: string | null = null;
  model = { code: '', nom: '', adresse: '', ville: '', telephone: '', isActive: true };
  constructor() {
    effect(() => {
      const g = this.s.selectedGuichet();
      if (this.edit && g)
        this.model = {
          code: g.code,
          nom: g.nom,
          adresse: g.adresse,
          ville: g.ville,
          telephone: g.telephone ?? '',
          isActive: g.isActive,
        };
    });
  }
  ngOnInit() {
    if (this.edit) this.s.loadById(this.id);
  }
  submit(f: NgForm) {
    if (f.invalid || this.busy()) return;
    this.busy.set(true);
    const p = {
      nom: this.model.nom.trim(),
      adresse: this.model.adresse.trim(),
      ville: this.model.ville.trim(),
      telephone: this.model.telephone.trim() || null,
    };
    const fail = () => {
      this.error = this.s.error();
      this.busy.set(false);
    };
    if (this.edit)
      this.s.update(this.id, { ...p, isActive: this.model.isActive }).subscribe({
        next: () => void this.router.navigate(['../../', this.id], { relativeTo: this.r }),
        error: fail,
      });
    else
      this.s.create({ ...p, code: this.model.code.trim() }).subscribe({
        next: (g) => void this.router.navigate(['../', g.id], { relativeTo: this.r }),
        error: fail,
      });
  }
}
