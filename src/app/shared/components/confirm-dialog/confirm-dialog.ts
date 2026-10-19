import { Component, input, output } from '@angular/core';
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  readonly title = input('Confirmer cette action');
  readonly message = input('Cette action modifiera la ressource.');
  readonly busy = input(false);
  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
