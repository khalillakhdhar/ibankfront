import { Component, input } from '@angular/core';
@Component({ selector: 'app-empty-state', templateUrl: './empty-state.html', styleUrl: './empty-state.css' })
export class EmptyState { readonly title = input('Aucune donnée'); readonly message = input('Les éléments apparaîtront ici.'); }
