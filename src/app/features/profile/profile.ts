import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({ selector: 'app-profile', templateUrl: './profile.html', styleUrl: './profile.css' })
export class Profile {
  private readonly auth = inject(AuthService);
  readonly user = this.auth.currentUser;
  readonly role = this.auth.role;
}
