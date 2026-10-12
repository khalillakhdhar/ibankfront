import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TypeCompteService } from '../../../services/type-compte.service';
@Component({
  selector: 'app-type-compte-list',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './type-compte-list.html',
  styleUrl: './type-compte-list.css',
})
export class TypeCompteList implements OnInit {
  readonly service = inject(TypeCompteService);
  ngOnInit() {
    this.service.loadAll();
  }
  remove(id: number) {
    if (confirm('Désactiver ce type ?')) this.service.delete(id).subscribe();
  }
}
