import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppRole } from '../../services/auth.service';

@Component({ selector: 'app-sidebar', imports: [RouterLink, RouterLinkActive], templateUrl: './sidebar.html', styleUrl: './sidebar.css' })
export class Sidebar {
  readonly open = input(false);
  readonly role = input<AppRole | null>(null);
  readonly base = input('/dashboard/agent');
  readonly closeMenu = output<void>();
}
