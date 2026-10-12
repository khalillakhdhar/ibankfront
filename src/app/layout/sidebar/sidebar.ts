import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DemoRole } from '../../services/auth.service';

@Component({ selector: 'app-sidebar', imports: [RouterLink, RouterLinkActive], templateUrl: './sidebar.html', styleUrl: './sidebar.css' })
export class Sidebar {
  readonly open = input(false);
  readonly role = input<DemoRole | null>(null);
  readonly base = input('/dashboard/agent');
  readonly closeMenu = output<void>();
}
