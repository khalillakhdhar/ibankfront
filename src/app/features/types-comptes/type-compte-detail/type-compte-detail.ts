import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TypeCompteService } from '../../../services/type-compte.service';
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-type-compte-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './type-compte-detail.html',
  styleUrl: './type-compte-detail.css',
})
export class TypeCompteDetail implements OnInit {
  private s = inject(TypeCompteService);
  private r = inject(ActivatedRoute);
  readonly auth = inject(AuthService);
  readonly item = this.s.selectedTypeCompte;
  readonly loading = this.s.loading;
  readonly error = this.s.error;
  id = Number(this.r.snapshot.paramMap.get('id'));
  ngOnInit() {
    this.s.loadById(this.id);
  }
}
