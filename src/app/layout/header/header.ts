import { Component, input, output } from '@angular/core';
import { User } from '../../models/auth.model';

@Component({ selector: 'app-header', templateUrl: './header.html', styleUrl: './header.css' })
export class Header {
  readonly user = input<User | null>(null);
  readonly menuToggle = output<void>();
  readonly logoutRequest = output<void>();
}
