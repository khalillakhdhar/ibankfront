import { Component, input, output } from '@angular/core';
import { DemoRole } from '../../services/auth.service';

@Component({ selector: 'app-header', templateUrl: './header.html', styleUrl: './header.css' })
export class Header {
  readonly menuOpen = input(false);
  readonly role = input<DemoRole | null>(null);
  readonly menuToggle = output<void>();
  readonly logoutRequest = output<void>();
}
